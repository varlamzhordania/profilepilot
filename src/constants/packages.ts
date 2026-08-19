export interface PackagePrice {
  price: number;
  formatted: string;
}

export interface ServerPackage {
  id?: string;
  name: string;
  credits: number;
  amountINR: number; // Retained for backward compatibility
  prices: Record<string, PackagePrice>;
  badge?: string;
  popular?: boolean;
  secondaryBadge?: string;
  bestValue?: boolean;
  description?: string;
  usageExample?: string;
}

export const SERVER_PACKAGE_MAP: Record<string, ServerPackage> = {
  starter_refill: {
    id: "starter_refill",
    name: "Starter Refill Pack",
    badge: '45 Credits',
    description: 'Ideal for trying out the complete Profile Pilot experience.',
    usageExample: '1 Profile Analysis (30) + 1 AI Photo (10) + 5 Coach Replies (5)',
    credits: 45,
    amountINR: 399,
    prices: {
      USD: { price: 4.99, formatted: "$4.99" },
      GBP: { price: 3.99, formatted: "£3.99" },
      EUR: { price: 4.49, formatted: "€4.49" },
      CAD: { price: 6.99, formatted: "CA$6.99" },
      AUD: { price: 7.49, formatted: "AU$7.49" },
      INR: { price: 399, formatted: "₹399" },
      AED: { price: 18.99, formatted: "AED 18.99" },
    },
  },
  pro_wingman: {
    id: "pro_wingman",
    name: "Pro Wingman Pack",
    secondaryBadge: '110 Credits',
    description: 'Best for actively optimizing and transforming your profile.',
    usageExample: '2 Profile Analyses (60) + 4 AI Photos (40) + 10 Coach Replies (10)',
    credits: 110,
    amountINR: 799,
    popular: true,
    badge: "MOST POPULAR",
    prices: {
      USD: { price: 9.99, formatted: "$9.99" },
      GBP: { price: 7.99, formatted: "£7.99" },
      EUR: { price: 8.99, formatted: "€8.99" },
      CAD: { price: 13.99, formatted: "CA$13.99" },
      AUD: { price: 14.99, formatted: "AU$14.99" },
      INR: { price: 799, formatted: "₹799" },
      AED: { price: 36.99, formatted: "AED 36.99" },
    },
  },
  ultimate_rizz: {
    id: "ultimate_rizz",
    name: "Ultimate Rizz Pass",
    bestValue: true,
    secondaryBadge: '250 Credits',
    description: 'Maximum value for complete ongoing profile optimization.',
    usageExample: '5 Profile Analyses (150) + 8 AI Photos (80) + 20 Coach Replies (20)',
    credits: 250,
    amountINR: 1599,
    badge: "BEST VALUE",
    prices: {
      USD: { price: 19.99, formatted: "$19.99" },
      GBP: { price: 15.99, formatted: "£15.99" },
      EUR: { price: 17.99, formatted: "€17.99" },
      CAD: { price: 26.99, formatted: "CA$26.99" },
      AUD: { price: 29.99, formatted: "AU$29.99" },
      INR: { price: 1599, formatted: "₹1599" },
      AED: { price: 74.99, formatted: "AED 74.99" },
    },
  },
};

export const CREDIT_PACKAGES_LIST: ServerPackage[] = [
  SERVER_PACKAGE_MAP.starter_refill,
  SERVER_PACKAGE_MAP.pro_wingman,
  SERVER_PACKAGE_MAP.ultimate_rizz,
];

export type PaymentGateway = 'razorpay' | 'paypal';

export interface PaymentGatewayConfig {
  id: PaymentGateway;
  name: string;
  description: string;
  icon: string;
  supportedCurrencies: string[];
  enabled: boolean;
}

export const PAYMENT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    description: 'UPI, Debit/Credit Cards, NetBanking, Wallets',
    icon: '💳',
    supportedCurrencies: ['INR', 'USD'],
    enabled: true,
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'PayPal Balance, Credit/Debit Cards, Pay in 4',
    icon: '🅿️',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    enabled: true,
  },
];