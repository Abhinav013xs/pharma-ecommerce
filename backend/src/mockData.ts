import { Role, PrescriptionStatus, OrderStatus, PaymentStatus, TicketStatus } from '@prisma/client';

export interface ProductMock {
  id: string;
  name: string;
  brand: string;
  genericName: string | null;
  manufacturer: string | null;
  composition: string | null;
  uses: string | null;
  benefits: string | null;
  dosage: string | null;
  sideEffects: string | null;
  warnings: string | null;
  drugInteractions: string | null;
  storageInfo: string | null;
  prescriptionRequired: boolean;
  price: number;
  discount: number;
  rating: number;
  ratingCount: number;
  stockCount: number;
  stockStatus: string;
  image: string;
  category: string;
}

export interface UserMock {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  passwordHash: string;
  role: Role;
  isVerified: boolean;
  googleId?: string | null;
  twoFactorSecret?: string | null;
  is2FAEnabled: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressMock {
  id: string;
  userId: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface PrescriptionMock {
  id: string;
  userId: string;
  fileUrl: string;
  status: PrescriptionStatus;
  notes: string | null;
  verifiedBy: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItemMock {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  discount: number;
}

export interface OrderMock {
  id: string;
  userId: string;
  addressId: string;
  prescriptionId: string | null;
  status: OrderStatus;
  totalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  paymentMethod: string;
  paymentId: string | null;
  paymentStatus: PaymentStatus;
  deliverySlot: string | null;
  invoiceUrl: string | null;
  deliveryPartner?: string | null;
  trackingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItemMock[];
}

export interface MedicineReminderMock {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  timeOfDay: string;
  isActive: boolean;
}

export interface SubscriptionMock {
  id: string;
  userId: string;
  productIds: string; // JSON Array of product IDs
  frequencyInDays: number;
  nextBillingDate: Date;
  status: string;
  discountPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportTicketMock {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginHistoryMock {
  id: string;
  userId: string;
  ipAddress: string;
  device: string;
  location: string | null;
  timestamp: Date;
}

export interface AuditLogMock {
  id: string;
  userId: string | null;
  action: string;
  details: string;
  ipAddress: string;
  createdAt: Date;
}

// Initial Mock Products
export const mockProducts: ProductMock[] = [
  {
    id: "prod-metformin-500",
    name: "Metformin Glycomet 500mg",
    brand: "Glycomet",
    genericName: "Metformin Hydrochloride",
    manufacturer: "USV Private Limited",
    composition: "Metformin (500mg)",
    uses: "Type 2 Diabetes Mellitus Management",
    benefits: "Helps control high blood sugar levels. Lowering blood sugar helps prevent kidney damage, blindness, nerve problems, loss of limbs, and sexual function issues.",
    dosage: "Take with meals, usually 1-2 times daily, or as directed by your physician.",
    sideEffects: "Nausea, vomiting, diarrhea, stomach upset, metallic taste, weakness.",
    warnings: "Lactic acidosis is a rare but serious side effect. Avoid excessive alcohol consumption while taking this medicine.",
    drugInteractions: "Contrast dye, cimetidine, diuretics, heart medications.",
    storageInfo: "Store below 30°C in a dry place. Keep out of reach of children.",
    prescriptionRequired: true,
    price: 150.0,
    discount: 12.0,
    rating: 4.8,
    ratingCount: 1420,
    stockCount: 500,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    category: "Diabetes Care"
  },
  {
    id: "prod-amoxicillin-500",
    name: "Amoxicillin Novamox 500mg",
    brand: "Novamox",
    genericName: "Amoxicillin Trihydrate",
    manufacturer: "Cipla Pharmaceuticals Ltd",
    composition: "Amoxicillin (500mg)",
    uses: "Bacterial infections of the ear, nose, throat, skin, and urinary tract.",
    benefits: "Effectively kills infection-causing bacteria by stopping the growth of bacterial cell walls.",
    dosage: "Every 8 to 12 hours as prescribed. Complete the full course even if you feel better.",
    sideEffects: "Nausea, vomiting, rash, diarrhea, yeast infection.",
    warnings: "Do not use if allergic to penicillin. Inform your doctor if you have kidney disease.",
    drugInteractions: "Oral contraceptives, blood thinners, methotrexate, allopurinol.",
    storageInfo: "Store in a cool, dry place. Keep container tightly closed.",
    prescriptionRequired: true,
    price: 95.0,
    discount: 10.0,
    rating: 4.6,
    ratingCount: 840,
    stockCount: 350,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60",
    category: "Prescription Medicines"
  },
  {
    id: "prod-atorvastatin-10",
    name: "Atorvastatin Lipvas 10mg",
    brand: "Lipvas",
    genericName: "Atorvastatin Calcium",
    manufacturer: "Cipla Pharmaceuticals Ltd",
    composition: "Atorvastatin (10mg)",
    uses: "High Cholesterol, Prevention of Heart Disease",
    benefits: "Reduces LDL ('bad') cholesterol and triglycerides while raising HDL ('good') cholesterol. Lowers the risk of stroke and heart attack.",
    dosage: "Typically one tablet daily in the evening, with or without food.",
    sideEffects: "Muscle pain, joint pain, headache, nosebleeds, mild diarrhea.",
    warnings: "Avoid large amounts of grapefruit juice. Monitor liver function test. Not for pregnant women.",
    drugInteractions: "Clarithromycin, cyclosporine, gemfibrozil, itraconazole.",
    storageInfo: "Store at room temperature away from light and moisture.",
    prescriptionRequired: true,
    price: 240.0,
    discount: 15.0,
    rating: 4.7,
    ratingCount: 1100,
    stockCount: 400,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    category: "Heart Care"
  },
  {
    id: "prod-paracetamol-650",
    name: "Dolo 650mg Paracetamol",
    brand: "Dolo",
    genericName: "Paracetamol / Acetaminophen",
    manufacturer: "Micro Labs Ltd",
    composition: "Paracetamol (650mg)",
    uses: "Fever relief, mild to moderate pain relief (headache, toothache, muscle aches)",
    benefits: "Quickly reduces body temperature and block chemical messengers in the brain that send pain signals.",
    dosage: "1 tablet every 4-6 hours as needed. Do not exceed 4 tablets in 24 hours.",
    sideEffects: "Very rare, but allergic reactions, liver damage if taken in overdose.",
    warnings: "Avoid taking with other paracetamol-containing medications to prevent liver failure.",
    drugInteractions: "Alcohol, blood thinners like warfarin.",
    storageInfo: "Store in a cool dry place, protected from direct sunlight.",
    prescriptionRequired: false,
    price: 35.0,
    discount: 5.0,
    rating: 4.9,
    ratingCount: 3450,
    stockCount: 1200,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    category: "OTC Medicines"
  },
  {
    id: "prod-cetirizine-10",
    name: "Cetirizine Okacet 10mg",
    brand: "Okacet",
    genericName: "Cetirizine Hydrochloride",
    manufacturer: "Cipla Pharmaceuticals Ltd",
    composition: "Cetirizine (10mg)",
    uses: "Allergic rhinitis, sneezing, runny nose, hives, watery eyes.",
    benefits: "Non-sedating antihistamine that blocks histamine, a substance in the body that causes allergic symptoms.",
    dosage: "1 tablet daily, preferably at bedtime as it may cause mild drowsiness.",
    sideEffects: "Drowsiness, dry mouth, headache, fatigue.",
    warnings: "Be cautious when driving or operating machinery. Avoid alcohol.",
    drugInteractions: "Sedatives, sleeping pills, alcohol.",
    storageInfo: "Store below 25°C in a dry place.",
    prescriptionRequired: false,
    price: 45.0,
    discount: 8.0,
    rating: 4.5,
    ratingCount: 620,
    stockCount: 800,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
    category: "OTC Medicines"
  },
  {
    id: "prod-ashwagandha",
    name: "Himalaya Pure Herbs Ashwagandha",
    brand: "Himalaya Wellness",
    genericName: "Withania somnifera Extract",
    manufacturer: "The Himalaya Drug Company",
    composition: "Ashwagandha Extract (250mg)",
    uses: "Stress management, energy boosting, immune support.",
    benefits: "Helps calm the mind, reduces cortisol (stress hormone) levels, and improves stamina and sleep quality.",
    dosage: "1 tablet twice daily or as recommended by your physician.",
    sideEffects: "Generally safe. Mild stomach upset in rare cases.",
    warnings: "Consult a doctor if pregnant, nursing, or taking diabetes/thyroid medications.",
    drugInteractions: "Immunosuppressants, sedatives, thyroid hormones.",
    storageInfo: "Store in a cool, dry place. No refrigeration required.",
    prescriptionRequired: false,
    price: 180.0,
    discount: 10.0,
    rating: 4.8,
    ratingCount: 1540,
    stockCount: 200,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1611070973770-b1a6726b0c6e?w=300&auto=format&fit=crop&q=60",
    category: "Ayurveda"
  },
  {
    id: "prod-oximeter",
    name: "Dr Trust Fingertip Pulse Oximeter",
    brand: "Dr Trust",
    genericName: "Fingertip Pulse Oximeter",
    manufacturer: "Dr Trust USA",
    composition: "Infrared Oxygen Sensor Hardware",
    uses: "Monitoring Oxygen Saturation (SpO2) and Pulse Rate.",
    benefits: "Accurately measures blood oxygen levels and heart rate in under 10 seconds. Features a multi-directional OLED display.",
    dosage: "Place clean finger on sensor, press button, and wait for reading.",
    sideEffects: "None.",
    warnings: "Do not use with nail polish. Keep fingers still during measurement.",
    drugInteractions: "None.",
    storageInfo: "Keep in a dust-free box. Avoid water contact.",
    prescriptionRequired: false,
    price: 1499.0,
    discount: 30.0,
    rating: 4.7,
    ratingCount: 2150,
    stockCount: 80,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop&q=60",
    category: "Medical Devices"
  },
  {
    id: "prod-multivitamin",
    name: "HealthKart Multivitamin with Ginseng",
    brand: "HealthKart",
    genericName: "Multivitamin & Mineral Formula",
    manufacturer: "HealthKart India Ltd",
    composition: "Essential Vitamins, Minerals, Taurine, Ginseng Extract",
    uses: "Daily nutritional support, energy, focus, immunity booster.",
    benefits: "Fills dietary gaps, enhances cellular energy, supports cognitive functions and builds immunity.",
    dosage: "1 tablet daily after breakfast or lunch with plenty of water.",
    sideEffects: "Mild nausea, yellow-colored urine (due to Vitamin B2).",
    warnings: "Do not exceed recommended daily allowance.",
    drugInteractions: "Consult if taking blood thinners.",
    storageInfo: "Store in a cool, dark, and dry place. Keep bottle tightly closed.",
    prescriptionRequired: false,
    price: 499.0,
    discount: 20.0,
    rating: 4.6,
    ratingCount: 1890,
    stockCount: 150,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300&auto=format&fit=crop&q=60",
    category: "Nutrition"
  },
  {
    id: "prod-bp-monitor",
    name: "Omron HEM 7120 Blood Pressure Monitor",
    brand: "Omron",
    genericName: "Automatic Blood Pressure Monitor",
    manufacturer: "Omron Healthcare",
    composition: "Digital Oscillometric Cuff & Monitor",
    uses: "Measuring blood pressure and pulse rate at home.",
    benefits: "Provides accurate oscillometric measurements. Detects irregular heartbeats and body movement errors.",
    dosage: "Follow manual guidelines. Take readings while relaxed.",
    sideEffects: "None.",
    warnings: "Consult a cardiologist for medical diagnosis.",
    drugInteractions: "None.",
    storageInfo: "Avoid extreme temperature, moisture, and direct sunlight.",
    prescriptionRequired: false,
    price: 2490.0,
    discount: 15.0,
    rating: 4.8,
    ratingCount: 3120,
    stockCount: 50,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=300&auto=format&fit=crop&q=60",
    category: "Medical Devices"
  },
  {
    id: "prod-moisturizer",
    name: "CeraVe Moisturizing Cream 177ml",
    brand: "CeraVe",
    genericName: "Ceramide Moisturizer",
    manufacturer: "L'Oreal Active Cosmetics",
    composition: "Ceramides 1, 3, 6-II, Hyaluronic Acid",
    uses: "Dry skin treatment, skin barrier restoration.",
    benefits: "Provides 24-hour hydration and helps restore the protective skin barrier with three essential ceramides.",
    dosage: "Apply liberally to face and body as often as needed.",
    sideEffects: "None expected. Rare allergic reaction.",
    warnings: "For external use only. Avoid contact with eyes.",
    drugInteractions: "None.",
    storageInfo: "Store in a cool dry place.",
    prescriptionRequired: false,
    price: 850.0,
    discount: 10.0,
    rating: 4.9,
    ratingCount: 4200,
    stockCount: 110,
    stockStatus: "IN_STOCK",
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=300&auto=format&fit=crop&q=60",
    category: "Personal Care"
  }
];

// In-Memory Database State
export class MockDatabase {
  users: UserMock[] = [];
  addresses: AddressMock[] = [];
  prescriptions: PrescriptionMock[] = [];
  orders: OrderMock[] = [];
  reminders: MedicineReminderMock[] = [];
  subscriptions: SubscriptionMock[] = [];
  supportTickets: SupportTicketMock[] = [];
  loginHistories: LoginHistoryMock[] = [];
  auditLogs: AuditLogMock[] = [];

  constructor() {
    // Create a default administrator user for immediate access
    this.users.push({
      id: "admin-user-id",
      email: "admin@medicloud.com",
      phone: "9876543210",
      name: "Dr. Adrian Vance",
      passwordHash: "$2a$10$tM3NqG5i92Yd/r8qN63GTeY/d53m3r9kS4N6dFmG5i92Yd/r8qN63", // admin123
      role: Role.ADMIN,
      isVerified: true,
      is2FAEnabled: false,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create a default pharmacist user
    this.users.push({
      id: "pharmacist-user-id",
      email: "pharmacist@medicloud.com",
      phone: "9988776655",
      name: "Dr. Sarah Lin (RPh)",
      passwordHash: "$2a$10$tM3NqG5i92Yd/r8qN63GTeY/d53m3r9kS4N6dFmG5i92Yd/r8qN63", // admin123
      role: Role.PHARMACIST,
      isVerified: true,
      is2FAEnabled: false,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Create a default patient user
    this.users.push({
      id: "demo-user-id",
      email: "patient@example.com",
      phone: "1234567890",
      name: "Alex Mercer",
      passwordHash: "$2a$10$tM3NqG5i92Yd/r8qN63GTeY/d53m3r9kS4N6dFmG5i92Yd/r8qN63", // admin123
      role: Role.USER,
      isVerified: true,
      is2FAEnabled: false,
      status: "ACTIVE",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add default address for Alex
    this.addresses.push({
      id: "addr-demo",
      userId: "demo-user-id",
      label: "Home",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      isDefault: true
    });

    // Add default reminders for Alex
    this.reminders.push({
      id: "rem-1",
      userId: "demo-user-id",
      medicineName: "Metformin Glycomet 500mg",
      dosage: "1 Tablet",
      frequency: "Daily",
      timeOfDay: "08:00, 20:00",
      isActive: true
    });

    // Add default order history
    this.orders.push({
      id: "order-101",
      userId: "demo-user-id",
      addressId: "addr-demo",
      prescriptionId: null,
      status: OrderStatus.DELIVERED,
      totalAmount: 535.0,
      discountAmount: 100.0,
      taxAmount: 35.0,
      shippingAmount: 50.0,
      paymentMethod: "STRIPE",
      paymentId: "ch_stripe_12345",
      paymentStatus: PaymentStatus.SUCCESS,
      deliverySlot: "2026-06-25, 9 AM - 1 PM",
      invoiceUrl: "/invoices/inv-101.pdf",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      updatedAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000),
      items: [
        {
          id: "item-101-1",
          orderId: "order-101",
          productId: "prod-moisturizer",
          quantity: 1,
          price: 850.0,
          discount: 10.0
        }
      ]
    });
  }
}

export const dbInstance = new MockDatabase();
