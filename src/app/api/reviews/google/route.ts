import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";

export const dynamic = "force-dynamic";

export interface GoogleReviewItem {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorUrl?: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  clinicLocation: "Baner Clinic" | "Bhosari Clinic";
  googleMapsUrl: string;
  verified: boolean;
  publishedAt?: string;
}

// Verified Google Maps Listing URLs
export const BANER_MAPS_URL = "https://maps.app.goo.gl/tiVums5eDVZ9jU6HA";
export const BHOSARI_MAPS_URL = "https://maps.google.com/?q=Kelkar+Manas+Healthcare+Bhosari+Pune";

// In-memory cache for dynamic Google Places API responses
interface CacheEntry {
  reviews: GoogleReviewItem[];
  averageRating: number;
  totalReviewsCount: number;
  fetchedAt: number;
}

let dynamicCache: { [key: string]: CacheEntry } = {};
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

/**
 * Dynamically fetches authentic reviews from the official Google Places API
 */
async function fetchGooglePlacesReviews(
  apiKey: string,
  placeId: string,
  clinicLocation: "Baner Clinic" | "Bhosari Clinic",
  mapsUrl: string
): Promise<{ reviews: GoogleReviewItem[]; rating?: number; userRatingsTotal?: number } | null> {
  try {
    // 1. Try Google Places API (New)
    const newApiUrl = `https://places.googleapis.com/v1/places/${placeId}?fields=id,displayName,rating,userRatingCount,reviews,googleMapsUri&key=${apiKey}`;
    const newRes = await fetch(newApiUrl, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "id,displayName,rating,userRatingCount,reviews,googleMapsUri",
      },
    });

    if (newRes.ok) {
      const data = await newRes.json();
      if (data.reviews && Array.isArray(data.reviews)) {
        const parsed: GoogleReviewItem[] = data.reviews.map((r: {
          name?: string;
          authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
          rating?: number;
          relativePublishTimeDescription?: string;
          text?: { text?: string };
          publishTime?: string;
        }, idx: number) => ({
          id: `g-rev-${placeId}-${idx}`,
          authorName: r.authorAttribution?.displayName || "Google Reviewer",
          authorPhotoUrl: r.authorAttribution?.photoUri,
          authorUrl: r.authorAttribution?.uri || mapsUrl,
          rating: r.rating || 5,
          relativeTimeDescription: r.relativePublishTimeDescription || "Recently",
          text: r.text?.text || "",
          clinicLocation,
          googleMapsUrl: r.authorAttribution?.uri || mapsUrl,
          verified: true,
          publishedAt: r.publishTime,
        }));

        return {
          reviews: parsed,
          rating: data.rating,
          userRatingsTotal: data.userRatingCount,
        };
      }
    }

    // 2. Fallback to Google Place Details API (Classic)
    const classicUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total,url&key=${apiKey}`;
    const classicRes = await fetch(classicUrl);
    if (classicRes.ok) {
      const classicData = await classicRes.json();
      if (classicData.result?.reviews && Array.isArray(classicData.result.reviews)) {
        const parsed: GoogleReviewItem[] = classicData.result.reviews.map((r: {
          author_name?: string;
          profile_photo_url?: string;
          author_url?: string;
          rating?: number;
          relative_time_description?: string;
          text?: string;
          time?: number;
        }, idx: number) => ({
          id: `g-rev-${placeId}-${idx}`,
          authorName: r.author_name || "Google Reviewer",
          authorPhotoUrl: r.profile_photo_url,
          authorUrl: r.author_url || mapsUrl,
          rating: r.rating || 5,
          relativeTimeDescription: r.relative_time_description || "Recently",
          text: r.text || "",
          clinicLocation,
          googleMapsUrl: r.author_url || mapsUrl,
          verified: true,
          publishedAt: r.time ? new Date(r.time * 1000).toISOString() : undefined,
        }));

        return {
          reviews: parsed,
          rating: classicData.result.rating,
          userRatingsTotal: classicData.result.user_ratings_total,
        };
      }
    }
  } catch (error) {
    console.error(`[Google Reviews API] Error querying place ${placeId}:`, error);
  }
  return null;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clinicFilter = searchParams.get("clinic") || "all";

    // 1. Resolve Settings from Database
    const [
      apiKeySetting, 
      banerPlaceIdSetting, 
      bhosariPlaceIdSetting,
      integrationModeSetting,
      banerWidgetSetting,
      bhosariWidgetSetting
    ] = await Promise.all([
      SettingModel.findOne({ key: "google_places_api_key" }).lean(),
      SettingModel.findOne({ key: "google_place_id_baner" }).lean(),
      SettingModel.findOne({ key: "google_place_id_bhosari" }).lean(),
      SettingModel.findOne({ key: "reviews_integration_mode" }).lean(),
      SettingModel.findOne({ key: "reviews_widget_baner" }).lean(),
      SettingModel.findOne({ key: "reviews_widget_bhosari" }).lean(),
    ]);

    const apiKey = apiKeySetting?.value?.trim() || process.env.GOOGLE_PLACES_API_KEY;
    const banerPlaceId = banerPlaceIdSetting?.value?.trim() || process.env.GOOGLE_PLACE_ID_BANER || "ChIJBUovIfG_wjsR2D0_8I_81VM";
    const bhosariPlaceId = bhosariPlaceIdSetting?.value?.trim() || process.env.GOOGLE_PLACE_ID_BHOSARI;
    const integrationMode = integrationModeSetting?.value?.trim() || "WIDGET";
    const banerWidgetKey = banerWidgetSetting?.value?.trim() || "vbRfq6eTaBSP9BYFv0pQxguc";
    const bhosariWidgetKey = bhosariWidgetSetting?.value?.trim() || "";

    let dynamicReviews: GoogleReviewItem[] = [];
    let averageRating = 5.0;
    let totalReviewsCount = 91;
    const now = Date.now();

    // 2. Fetch from GRWidget API if widget key is present
    if (banerWidgetKey && !apiKey) {
      const cacheKey = `grwidget_${banerWidgetKey}`;
      if (dynamicCache[cacheKey] && now - dynamicCache[cacheKey].fetchedAt < CACHE_TTL_MS) {
        dynamicReviews = dynamicCache[cacheKey].reviews;
        averageRating = dynamicCache[cacheKey].averageRating;
        totalReviewsCount = dynamicCache[cacheKey].totalReviewsCount;
      } else {
        try {
          const res = await fetch(`https://grwidget.com/api/v1/widgets/${banerWidgetKey}.json`, {
            cache: "no-store",
          });
          if (res.ok) {
            const grData = await res.json();
            if (grData.business) {
              if (grData.business.rating) averageRating = grData.business.rating;
              if (grData.business.review_count) totalReviewsCount = grData.business.review_count;
            }
            if (Array.isArray(grData.reviews)) {
              dynamicReviews = grData.reviews.map((r: { author_name?: string; rating?: number; relative_time?: string; text?: string }, idx: number) => ({
                id: `gr-${idx}`,
                authorName: r.author_name || "Google Reviewer",
                rating: r.rating || 5,
                relativeTimeDescription: r.relative_time || "Recently",
                text: r.text || "",
                clinicLocation: "Baner Clinic" as const,
                googleMapsUrl: BANER_MAPS_URL,
                verified: true,
              }));

              dynamicCache[cacheKey] = {
                reviews: dynamicReviews,
                averageRating,
                totalReviewsCount,
                fetchedAt: now,
              };
            }
          }
        } catch (e) {
          console.error("Error fetching GRWidget payload:", e);
        }
      }
    }

    // 3. Dynamic Google Places API Fetching (Subject to API access & permissions)
    if (apiKey) {
      const cacheKey = `places_${clinicFilter}`;
      if (dynamicCache[cacheKey] && now - dynamicCache[cacheKey].fetchedAt < CACHE_TTL_MS) {
        dynamicReviews = dynamicCache[cacheKey].reviews;
        averageRating = dynamicCache[cacheKey].averageRating;
        totalReviewsCount = dynamicCache[cacheKey].totalReviewsCount;
      } else {
        const promises: Promise<{ reviews: GoogleReviewItem[]; rating?: number; userRatingsTotal?: number } | null>[] = [];

        if (clinicFilter === "all" || clinicFilter === "baner") {
          promises.push(fetchGooglePlacesReviews(apiKey, banerPlaceId, "Baner Clinic", BANER_MAPS_URL));
        }

        if ((clinicFilter === "all" || clinicFilter === "bhosari") && bhosariPlaceId) {
          promises.push(fetchGooglePlacesReviews(apiKey, bhosariPlaceId, "Bhosari Clinic", BHOSARI_MAPS_URL));
        }

        const results = await Promise.all(promises);
        let collectedReviews: GoogleReviewItem[] = [];
        let ratingsSum = 0;
        let ratingsCount = 0;
        let totalCount = 0;

        for (const res of results) {
          if (res && res.reviews) {
            collectedReviews.push(...res.reviews);
            if (res.rating) {
              ratingsSum += res.rating;
              ratingsCount++;
            }
            if (res.userRatingsTotal) {
              totalCount += res.userRatingsTotal;
            }
          }
        }

        if (collectedReviews.length > 0) {
          dynamicReviews = collectedReviews;
          if (ratingsCount > 0) {
            averageRating = Number((ratingsSum / ratingsCount).toFixed(1));
          }
          if (totalCount > 0) {
            totalReviewsCount = totalCount;
          }

          dynamicCache[cacheKey] = {
            reviews: dynamicReviews,
            averageRating,
            totalReviewsCount,
            fetchedAt: now,
          };
        }
      }
    }

    // 4. Return response with authentic data & widget configs
    return NextResponse.json({
      success: true,
      apiConnected: !!apiKey,
      integrationMode,
      banerWidgetKey,
      bhosariWidgetKey,
      hasWidget: !!(banerWidgetKey || bhosariWidgetKey),
      data: {
        reviews: dynamicReviews,
        hasReviews: dynamicReviews.length > 0,
        summary: {
          averageRating,
          totalReviewsCount,
          banerMapsUrl: BANER_MAPS_URL,
          bhosariMapsUrl: BHOSARI_MAPS_URL,
          primaryMapsUrl: BANER_MAPS_URL,
          clinicName: "Kelkar Manas Health Clinic",
          address: "205, Second Floor, Platinum 9, Sus Baner Road, Baner, Pune",
        },
      },
    });
  } catch (error) {
    console.error("[Google Reviews API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve Google reviews." },
      { status: 500 }
    );
  }
}
