import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// 1. GET ALL USER ADDRESSES
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const addresses = await dbOperation(
      async (p) => await p.address.findMany({ where: { userId: req.user!.id } }),
      () => dbInstance.addresses.filter(a => a.userId === req.user!.id)
    );
    return res.json({ success: true, addresses });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ADD AN ADDRESS
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { label, street, city, state, zipCode, isDefault } = req.body;

  if (!label || !street || !city || !state || !zipCode) {
    return res.status(400).json({ success: false, error: "Please enter all address fields." });
  }

  const addrId = `addr-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const address = await dbOperation(
      async (p) => {
        if (isDefault) {
          // Reset other defaults
          await p.address.updateMany({
            where: { userId: req.user!.id },
            data: { isDefault: false }
          });
        }
        return await p.address.create({
          data: {
            id: addrId,
            userId: req.user!.id,
            label,
            street,
            city,
            state,
            zipCode,
            isDefault: !!isDefault
          }
        });
      },
      () => {
        if (isDefault) {
          dbInstance.addresses.forEach(a => {
            if (a.userId === req.user!.id) a.isDefault = false;
          });
        }
        const mockA = {
          id: addrId,
          userId: req.user!.id,
          label,
          street,
          city,
          state,
          zipCode,
          isDefault: !!isDefault
        };
        dbInstance.addresses.push(mockA);
        return mockA;
      }
    );

    return res.status(201).json({ success: true, address });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. DELETE AN ADDRESS
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const success = await dbOperation(
      async (p) => {
        const addr = await p.address.findFirst({ where: { id: id as string, userId: req.user!.id } });
        if (!addr) return false;
        await p.address.delete({ where: { id: id as string } });
        return true;
      },
      () => {
        const idx = dbInstance.addresses.findIndex(a => a.id === id as string && a.userId === req.user!.id);
        if (idx === -1) return false;
        dbInstance.addresses.splice(idx, 1);
        return true;
      }
    );

    if (!success) return res.status(404).json({ success: false, error: "Address not found or unauthorized." });

    return res.json({ success: true, message: "Address deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
