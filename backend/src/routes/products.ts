import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance, mockProducts } from '../mockData.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role } from '@prisma/client';

const router = Router();

// 1. GET ALL PRODUCTS (with filtering & sorting)
router.get('/', async (req, res) => {
  const { search, category, brand, prescription, sort, minPrice, maxPrice } = req.query;

  try {
    const products = await dbOperation<any>(
      async (p) => {
        // Build filters for Prisma
        const where: any = {};
        if (search) {
          where.OR = [
            { name: { contains: String(search), mode: 'insensitive' } },
            { brand: { contains: String(search), mode: 'insensitive' } },
            { genericName: { contains: String(search), mode: 'insensitive' } },
            { composition: { contains: String(search), mode: 'insensitive' } }
          ];
        }
        if (category) {
          where.category = String(category);
        }
        if (brand) {
          where.brand = String(brand);
        }
        if (prescription) {
          where.prescriptionRequired = String(prescription) === 'true';
        }
        if (minPrice || maxPrice) {
          where.price = {};
          if (minPrice) where.price.gte = parseFloat(String(minPrice));
          if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        if (sort === 'price_desc') orderBy = { price: 'desc' };
        if (sort === 'rating') orderBy = { rating: 'desc' };
        if (sort === 'popularity') orderBy = { ratingCount: 'desc' };

        return await p.product.findMany({ where, orderBy });
      },
      () => {
        let list = [...mockProducts];

        // Search filter
        if (search) {
          const s = String(search).toLowerCase();
          list = list.filter(p => 
            p.name.toLowerCase().includes(s) ||
            p.brand.toLowerCase().includes(s) ||
            (p.genericName && p.genericName.toLowerCase().includes(s)) ||
            (p.composition && p.composition.toLowerCase().includes(s))
          );
        }

        // Category filter
        if (category) {
          list = list.filter(p => p.category === String(category));
        }

        // Brand filter
        if (brand) {
          list = list.filter(p => p.brand.toLowerCase() === String(brand).toLowerCase());
        }

        // Prescription filter
        if (prescription) {
          const needPresc = String(prescription) === 'true';
          list = list.filter(p => p.prescriptionRequired === needPresc);
        }

        // Price range
        if (minPrice) {
          list = list.filter(p => p.price >= parseFloat(String(minPrice)));
        }
        if (maxPrice) {
          list = list.filter(p => p.price <= parseFloat(String(maxPrice)));
        }

        // Sort
        if (sort === 'price_asc') {
          list.sort((a, b) => a.price - b.price);
        } else if (sort === 'price_desc') {
          list.sort((a, b) => b.price - a.price);
        } else if (sort === 'rating') {
          list.sort((a, b) => b.rating - a.rating);
        } else if (sort === 'popularity') {
          list.sort((a, b) => b.ratingCount - a.ratingCount);
        } else {
          // default newest
          list.sort((a, b) => b.id.localeCompare(a.id));
        }

        return list;
      }
    );

    return res.json({ success: true, count: products.length, products });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. AI MEDICINE SEARCH & DIAGNOSIS SIMULATION
router.get('/search/ai', (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, error: "Please enter symptoms or a medicine name." });
  }

  const lowercaseQuery = String(query).toLowerCase();

  // Custom simulation of AI medical search and guidelines recommendation
  let responseText = "";
  let matchedProducts: typeof mockProducts = [];
  let disclaimer = "Medical Disclaimer: This is an AI-generated guidance simulation. Please consult a licensed medical professional before consuming any medications.";

  if (lowercaseQuery.includes("diabetes") || lowercaseQuery.includes("sugar") || lowercaseQuery.includes("glycomet")) {
    responseText = "Based on symptoms related to elevated blood sugar levels, management typically involves glycemic controls, diet optimization, and oral hypoglycemic medications. We detected interest in Metformin Glycomet.";
    matchedProducts = mockProducts.filter(p => p.id === "prod-metformin-500");
  } else if (lowercaseQuery.includes("fever") || lowercaseQuery.includes("headache") || lowercaseQuery.includes("pain") || lowercaseQuery.includes("dolo")) {
    responseText = "For mild-to-moderate fever and headaches, paracetamol is commonly recommended as an antipyretic and analgesic. Ensure safe dosages to prevent liver injury.";
    matchedProducts = mockProducts.filter(p => p.id === "prod-paracetamol-650");
  } else if (lowercaseQuery.includes("infection") || lowercaseQuery.includes("throat") || lowercaseQuery.includes("antibiotic")) {
    responseText = "Bacterial throat, ear, or sinus infections are commonly treated with broad-spectrum penicillin-class antibiotics such as Amoxicillin. NOTE: Antibiotics require a valid prescription upload.";
    matchedProducts = mockProducts.filter(p => p.id === "prod-amoxicillin-500");
  } else if (lowercaseQuery.includes("stress") || lowercaseQuery.includes("energy") || lowercaseQuery.includes("anxiety")) {
    responseText = "In Ayurvedic medicine, Ashwagandha acts as an adaptogen to reduce cortisol levels, ease anxiety, and restore organic vitality.";
    matchedProducts = mockProducts.filter(p => p.id === "prod-ashwagandha");
  } else if (lowercaseQuery.includes("bp") || lowercaseQuery.includes("pressure") || lowercaseQuery.includes("heart")) {
    responseText = "For monitoring hypertension and heart care, statins (like Atorvastatin) help control cholesterol levels, and home-monitoring devices ensure steady tracking.";
    matchedProducts = mockProducts.filter(p => p.id === "prod-atorvastatin-10" || p.id === "prod-bp-monitor");
  } else {
    responseText = `We analyzed your query '${query}'. For generic wellness, here are some recommended nutritional supplements and medical devices.`;
    matchedProducts = mockProducts.filter(p => p.category === "Nutrition" || p.category === "Medical Devices").slice(0, 2);
  }

  return res.json({
    success: true,
    query,
    aiAnalysis: responseText,
    disclaimer,
    suggestedProducts: matchedProducts
  });
});

// 3. GET SINGLE PRODUCT DETAILS
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const product = await dbOperation<any>(
      async (p) => {
        return await p.product.findUnique({ where: { id: id as string } });
      },
      () => {
        return mockProducts.find(p => p.id === id as string) || null;
      }
    );

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found." });
    }

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. ADMIN: ADD PRODUCT
router.post('/', authenticateToken, authorizeRoles(Role.ADMIN), async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body;

  try {
    const product = await dbOperation(
      async (p) => {
        return await p.product.create({ data });
      },
      () => {
        const newP = {
          id: `prod-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name,
          brand: data.brand,
          genericName: data.genericName || "",
          manufacturer: data.manufacturer || "",
          composition: data.composition || "",
          uses: data.uses || "",
          benefits: data.benefits || "",
          dosage: data.dosage || "",
          sideEffects: data.sideEffects || "",
          warnings: data.warnings || "",
          drugInteractions: data.drugInteractions || "",
          storageInfo: data.storageInfo || "",
          prescriptionRequired: !!data.prescriptionRequired,
          price: parseFloat(data.price),
          discount: parseFloat(data.discount || 0),
          rating: 5.0,
          ratingCount: 0,
          stockCount: parseInt(data.stockCount || 100),
          stockStatus: data.stockCount > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
          image: data.image || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60",
          category: data.category
        };
        mockProducts.push(newP);
        return newP;
      }
    );

    return res.status(201).json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. ADMIN: UPDATE PRODUCT
router.put('/:id', authenticateToken, authorizeRoles(Role.ADMIN), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;

  try {
    const product = await dbOperation<any>(
      async (p) => {
        return await p.product.update({ where: { id: id as string }, data });
      },
      () => {
        const idx = mockProducts.findIndex(p => p.id === id as string);
        if (idx === -1) return null;
        mockProducts[idx] = {
          ...mockProducts[idx],
          ...data,
          price: data.price ? parseFloat(data.price) : mockProducts[idx].price,
          discount: data.discount ? parseFloat(data.discount) : mockProducts[idx].discount,
          stockCount: data.stockCount ? parseInt(data.stockCount) : mockProducts[idx].stockCount
        };
        return mockProducts[idx];
      }
    );

    if (!product) return res.status(404).json({ success: false, error: "Product not found." });

    return res.json({ success: true, product });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. ADMIN: DELETE PRODUCT
router.delete('/:id', authenticateToken, authorizeRoles(Role.ADMIN), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const success = await dbOperation<any>(
      async (p) => {
        await p.product.delete({ where: { id: id as string } });
        return true;
      },
      () => {
        const idx = mockProducts.findIndex(p => p.id === id as string);
        if (idx === -1) return false;
        mockProducts.splice(idx, 1);
        return true;
      }
    );

    if (!success) return res.status(404).json({ success: false, error: "Product not found." });

    return res.json({ success: true, message: "Product deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
