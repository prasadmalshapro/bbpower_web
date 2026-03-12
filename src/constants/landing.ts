export type LandingFeature = {
  icon: "battery" | "payment" | "leaf" | string;
  title: string;
  description: string;
};

export const FEATURES: LandingFeature[] = [
  {
    icon: "battery",
    title: "Always charged, always ready",
    description:
      "Grab a power bank in seconds from any BBPower station and keep your phone alive all day.",
  },
  {
    icon: "payment",
    title: "Simple, transparent pricing",
    description:
      "Pay only for the minutes you use with clear rates and no hidden fees or subscriptions.",
  },
  {
    icon: "leaf",
    title: "Greener than single‑use",
    description:
      "Reusable power banks reduce e‑waste and help keep disposable chargers out of landfills.",
  },
];

export type LandingFooterLink = {
  name: string;
  href: string;
};

export type LandingFooterColumn = {
  title: string;
  links: LandingFooterLink[];
};

export const FOOTER_LINKS: LandingFooterColumn[] = [
  {
    title: "Product",
    links: [
      { name: "How it works", href: "/#how-it-works" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Stores", href: "/customer/stores" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/#about" },
      { name: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { name: "Help center", href: "/#faq" },
      { name: "Terms & Privacy", href: "/#legal" },
    ],
  },
];


