export interface NavSubItem {
  title: string;
  href: string;
  description?: string;
  actionKey?: "openBooking";
  isFooterLink?: boolean;
  className?: string;
}

export interface NavGroupItem {
  title: string;
  href?: string;
  widthClass?: string;
  gridCols?: string;
  items?: NavSubItem[];
}

export const NAV_ITEMS: NavGroupItem[] = [
  {
    title: "Treatments",
    href: "/treatments",
    widthClass: "w-[450px] md:w-[760px] lg:w-[880px]",
    gridCols: "md:grid-cols-2 lg:grid-cols-3",
    items: [
      {
        title: "Treatment of Depression",
        href: "/treatments/treatment-of-depression",
        description: "Comprehensive clinical psychiatric care.",
      },
      {
        title: "Mania (Bipolar Disorder)",
        href: "/treatments/mania",
        description: "Management of mood elevation & energy.",
      },
      {
        title: "Treatment of Anxiety",
        href: "/treatments/treatment-of-anxiety",
        description: "Therapy & evidence-based medical care.",
      },
      {
        title: "Treatment of OCD (Obsessive-Compulsive Disorder)",
        href: "/treatments/treatment-of-ocd",
        description: "Specialized ERP & psychiatric care.",
      },
      {
        title: "Treatment of Phobia",
        href: "/treatments/treatment-of-phobia",
        description: "Overcome irrational fears and anxiety.",
      },
      {
        title: "Treatment of Panic Attacks",
        href: "/treatments/treatment-of-panic-attacks",
        description: "Manage and reduce sudden panic episodes.",
      },
      {
        title: "Treatment of Hysteria",
        href: "/treatments/treatment-of-hysteria",
        description: "Therapeutic care for conversion disorders.",
      },
      {
        title: "Child & Adolescent Psychiatry",
        href: "/treatments/child-and-adolescent-psychiatry",
        description: "Care for ADHD, autism & behavioral needs.",
      },
      {
        title: "Geriatric Psychiatry",
        href: "/treatments/geriatric-psychiatry",
        description: "Memory care & late-life psychiatric support.",
      },
      {
        title: "Schizophrenia Treatment",
        href: "/treatments/schizophrenia",
        description: "Management of thoughts, perceptions & behavior.",
      },
      {
        title: "Irritable Bowel Syndrome (IBS)",
        href: "/treatments/ibs",
        description: "Gut-brain interaction & symptom relief.",
      },
      {
        title: "Cognitive Behavioural Therapy",
        href: "/treatments/cognitive-behavioural-therapy",
        description: "Structured psychotherapy to reframe thoughts.",
      },
      {
        title: "Treatment of Alcohol Addiction",
        href: "/treatments/treatment-of-alcohol-addiction",
        description: "Inpatient rehabilitation & detox programs.",
      },
      {
        title: "Nicotine De-Addiction",
        href: "/treatments/nicotine-de-addiction",
        description: "Tobacco & smoking cessation support.",
      },
      {
        title: "Brown Sugar De-Addiction",
        href: "/treatments/brown-sugar-de-addiction",
        description: "Residential opioid dependence rehab.",
      },
      {
        title: "Treatment Available for Sexual Health Problems",
        href: "/sexual-problems",
        description: "Confidential sexual health consultations.",
      },
    ],
  },
  {
    title: "Sexual Problems",
    href: "/sexual-problems",
    widthClass: "w-[450px] md:w-[650px]",
    gridCols: "md:grid-cols-2",
    items: [
      {
        title: "Premature Ejaculation",
        href: "/sexual-problems/premature-ejaculation",
        description: "Stamina, control & medical therapy.",
      },
      {
        title: "Erectile Dysfunction",
        href: "/sexual-problems/erectile-dysfunction",
        description: "Clinical treatment & recovery plans.",
      },
      {
        title: "Performance Anxiety",
        href: "/sexual-problems/sexual-performance-anxiety",
        description: "Counseling to build sexual confidence.",
      },
      {
        title: "STIs (Sexually Transmitted Infections)",
        href: "/sexual-problems/sexually-transmitted-infections",
        description: "Diagnosis and confidential medical treatment.",
      },
      {
        title: "Precum Concerns",
        href: "/sexual-problems/precum",
        description: "Medical advice, counseling & reassurance.",
      },
      {
        title: "Nocturnal Emissions",
        href: "/sexual-problems/nocturnal-emissions",
        description: "Management of nightfall and anxiety.",
      },
      {
        title: "Masturbation Habit",
        href: "/sexual-problems/masturbation-habit",
        description: "Myths, guidance & behavioral counseling.",
      },
      {
        title: "Infertility",
        href: "/sexual-problems/infertility",
        description: "Diagnostic evaluation and support.",
      },
      {
        title: "Homosexuality Counseling",
        href: "/sexual-problems/homosexuality-counseling",
        description: "Confidential, non-judgmental guidance.",
      },
      {
        title: "Couple Therapy & Relationship Counselling",
        href: "/sexual-problems/couple-therapy",
        description: "Strengthen emotional and intimate connection.",
      },
    ],
  },
  {
    title: "About Us",
    href: "/about",
  },
  {
    title: "Contact Us",
    href: "/contact",
  },
  {
    title: "FAQ",
    href: "/faq",
  },
];
