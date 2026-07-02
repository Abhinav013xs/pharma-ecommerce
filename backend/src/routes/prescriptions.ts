import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Role, PrescriptionStatus, OrderStatus } from '@prisma/client';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// Ensure local uploads directory exists
const UPLOADS_DIR = './uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'prescription-' + uniqueSuffix + ext);
  }
});

// File filter check (PDF, PNG, JPEG)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, PNG, JPG, and JPEG are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// 1. UPLOAD PRESCRIPTION
router.post('/upload', authenticateToken, upload.single('prescription'), async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: "Please upload a prescription file." });
  }

  // Construct readable upload URL path (Express static serving)
  const fileUrl = `/uploads/${req.file.filename}`;
  const prescId = `presc-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const prescription = await dbOperation(
      async (p) => {
        return await p.prescription.create({
          data: {
            id: prescId,
            userId: req.user!.id,
            fileUrl,
            status: PrescriptionStatus.PENDING
          }
        });
      },
      () => {
        const mockP = {
          id: prescId,
          userId: req.user!.id,
          fileUrl,
          status: PrescriptionStatus.PENDING,
          notes: null,
          verifiedBy: null,
          verifiedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dbInstance.prescriptions.push(mockP);
        return mockP;
      }
    );

    return res.status(201).json({
      success: true,
      message: "Prescription uploaded successfully. Awaiting pharmacist validation.",
      prescription
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET USER'S PRESCRIPTION HISTORY
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbOperation(
      async (p) => {
        return await p.prescription.findMany({
          where: { userId: req.user!.id },
          orderBy: { createdAt: 'desc' }
        });
      },
      () => {
        return dbInstance.prescriptions
          .filter(pr => pr.userId === req.user!.id)
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    );

    return res.json({ success: true, prescriptions: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. PHARMACIST/ADMIN: GET ALL PENDING PRESCRIPTIONS FOR REVIEW
router.get('/pending', authenticateToken, authorizeRoles(Role.PHARMACIST, Role.ADMIN), async (req, res) => {
  try {
    const list = await dbOperation(
      async (p) => {
        return await p.prescription.findMany({
          where: { status: PrescriptionStatus.PENDING },
          include: { user: { select: { name: true, email: true, phone: true } } },
          orderBy: { createdAt: 'asc' }
        });
      },
      () => {
        // Mock join
        return dbInstance.prescriptions
          .filter(pr => pr.status === PrescriptionStatus.PENDING)
          .map(pr => {
            const user = dbInstance.users.find(u => u.id === pr.userId);
            return {
              ...pr,
              user: user ? { name: user.name, email: user.email, phone: user.phone } : null
            };
          })
          .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      }
    );

    return res.json({ success: true, prescriptions: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. PHARMACIST/ADMIN: VERIFY (APPROVE/REJECT) PRESCRIPTION
router.post('/:id/verify', authenticateToken, authorizeRoles(Role.PHARMACIST, Role.ADMIN), async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body; // status: APPROVED or REJECTED

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ success: false, error: "Provide a valid verification status (APPROVED or REJECTED)." });
  }

  try {
    const prescription = await dbOperation(
      async (p) => {
        const presc = await p.prescription.update({
          where: { id: id as string },
          data: {
            status: status as PrescriptionStatus,
            notes: notes || null,
            verifiedBy: req.user!.name,
            verifiedAt: new Date()
          }
        });

        // If approved, verify if there are orders waiting for this prescription and update them
        if (status === 'APPROVED') {
          await p.order.updateMany({
            where: { prescriptionId: id as string, status: OrderStatus.PENDING_PRESCRIPTION },
            data: { status: OrderStatus.PENDING_PAYMENT }
          });
        } else if (status === 'REJECTED') {
          await p.order.updateMany({
            where: { prescriptionId: id as string, status: OrderStatus.PENDING_PRESCRIPTION },
            data: { status: OrderStatus.CANCELLED }
          });
        }

        return presc;
      },
      () => {
        const idx = dbInstance.prescriptions.findIndex(pr => pr.id === id as string);
        if (idx === -1) return null;

        dbInstance.prescriptions[idx].status = status as PrescriptionStatus;
        dbInstance.prescriptions[idx].notes = notes || null;
        dbInstance.prescriptions[idx].verifiedBy = req.user!.name;
        dbInstance.prescriptions[idx].verifiedAt = new Date();

        // Update corresponding mock orders
        dbInstance.orders.forEach(o => {
          if (o.prescriptionId === id && o.status === OrderStatus.PENDING_PRESCRIPTION) {
            o.status = status === 'APPROVED' ? OrderStatus.PENDING_PAYMENT : OrderStatus.CANCELLED;
          }
        });

        return dbInstance.prescriptions[idx];
      }
    );

    if (!prescription) {
      return res.status(404).json({ success: false, error: "Prescription record not found." });
    }

    return res.json({
      success: true,
      message: `Prescription verification completed: Marked as ${status}.`,
      prescription
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
