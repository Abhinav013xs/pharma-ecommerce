import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.loginHistory.deleteMany();
  await prisma.medicineReminder.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  console.log("🧹 Cleared old records.");

  // 2. Hash default passwords
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("admin123", salt);

  // 3. Create default users
  const admin = await prisma.user.create({
    data: {
      id: "admin-user-id",
      email: "admin@medicloud.com",
      phone: "9876543210",
      name: "Dr. Adrian Vance",
      passwordHash,
      role: Role.ADMIN,
      isVerified: true
    }
  });

  const pharmacist = await prisma.user.create({
    data: {
      id: "pharmacist-user-id",
      email: "pharmacist@medicloud.com",
      phone: "9988776655",
      name: "Dr. Sarah Lin (RPh)",
      passwordHash,
      role: Role.PHARMACIST,
      isVerified: true
    }
  });

  const patient = await prisma.user.create({
    data: {
      id: "demo-user-id",
      email: "patient@example.com",
      phone: "1234567890",
      name: "Alex Mercer",
      passwordHash,
      role: Role.USER,
      isVerified: true
    }
  });

  console.log("👥 Created default users (Admin, Pharmacist, Patient).");

  // 4. Create default address for patient
  const address = await prisma.address.create({
    data: {
      id: "addr-demo",
      userId: patient.id,
      label: "Home",
      street: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      isDefault: true
    }
  });

  console.log("📍 Created default patient address.");

  // 5. Create products
  const products = [
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
      warnings: "Lactic acidosis is a rare but serious side effect. Avoid excessive alcohol consumption while taking this medication.",
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

  for (const item of products) {
    await prisma.product.create({ data: item });
  }

  console.log(`📦 Seeded ${products.length} medicines in categories successfully.`);

  // 6. Add default medicine reminder for patient
  await prisma.medicineReminder.create({
    data: {
      id: "rem-1",
      userId: patient.id,
      medicineName: "Metformin Glycomet 500mg",
      dosage: "1 Tablet",
      frequency: "Daily",
      timeOfDay: "08:00, 20:00",
      isActive: true
    }
  });

  console.log("⏰ Seeded default patient medicine alarm.");
  console.log("🌱 Database Seeding Completed Successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
