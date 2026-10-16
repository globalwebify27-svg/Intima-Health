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
    widthClass: "w-[450px] md:w-[700px]",
    gridCols: "md:grid-cols-3",
    items: [
      {
        title: "Treatment of Depression",
        href: "/treatments/treatment-of-depression",
        description: "Comprehensive clinical psychiatric care.",
      },
      {
        title: "Treatment of Anxiety",
        href: "/treatments/treatment-of-anxiety",
        description: "Therapy & evidence-based medical care.",
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
        title: "Treatment of OCD",
        href: "/treatments/treatment-of-ocd",
        description: "Specialized Obsessive-Compulsive Disorder management.",
      },
      {
        title: "Treatment of Hysteria",
        href: "/treatments/treatment-of-hysteria",
        description: "Therapeutic interventions for conversion disorders.",
      },
      {
        title: "Child & Adolescent Psychiatry",
        href: "/treatments/child-and-adolescent-psychiatry",
        description: "Care for ADHD, autism, and behavioral challenges.",
      },
      {
        title: "Geriatric Psychiatry",
        href: "/treatments/geriatric-psychiatry",
        description: "Memory care and late-life depression.",
      },
      {
        title: "Alcohol Addiction",
        href: "/treatments/treatment-of-alcohol-addiction",
        description: "Inpatient rehabilitation & detox programs.",
      },
      {
        title: "Brown Sugar De-Addiction",
        href: "/treatments/brown-sugar-de-addiction",
        description: "Residential opioid dependence rehab.",
      },
      {
        title: "Schizophrenia Treatment",
        href: "/treatments/schizophrenia",
        description: "Management of thoughts, perceptions & behavior.",
      },
      {
        title: "Irritable Bowel Syndrome (IBS)",
        href: "/treatments/ibs",
        description: "Gut-brain interactions & bowel habit management.",
      },
      {
        title: "Mania (Bipolar Disorder)",
        href: "/treatments/mania",
        description: "Management of mood elevation & energy.",
      },
      {
        title: "View All Treatments",
        href: "/treatments",
        isFooterLink: true,
      },
    ],
  },
  {
    title: "Sexual Problems",
    href: "/sexual-problems",
    widthClass: "w-[550px]",
    gridCols: "md:grid-cols-2",
    items: [
      {
        title: "Erectile Dysfunction",
        href: "/sexual-problems/erectile-dysfunction",
        description: "Clinical treatment & recovery plans.",
      },
      {
        title: "Premature Ejaculation",
        href: "/sexual-problems/premature-ejaculation",
        description: "Stamina, control & medical therapy.",
      },
      {
        title: "Performance Anxiety",
        href: "/sexual-problems/sexual-performance-anxiety",
        description: "Counseling to build sexual confidence.",
      },
      {
        title: "STIs",
        href: "/sexual-problems/sexually-transmitted-infections",
        description: "Diagnosis and medical treatment.",
      },
      {
        title: "Precum",
        href: "/sexual-problems/precum",
        description: "Medical advice and guidance.",
      },
      {
        title: "Nocturnal Emissions",
        href: "/sexual-problems/nocturnal-emissions",
        description: "Management of nightfall.",
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
        description: "Confidential care & awareness support.",
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
