import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// ==========================================
// 1. MEDICINE REMINDERS
// ==========================================

// Get Reminders
router.get('/alarms', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbOperation(
      async (p) => await p.medicineReminder.findMany({ where: { userId: req.user!.id } }),
      () => dbInstance.reminders.filter(r => r.userId === req.user!.id)
    );
    return res.json({ success: true, reminders: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create Reminder
router.post('/alarms', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { medicineName, dosage, frequency, timeOfDay } = req.body;

  if (!medicineName || !dosage || !frequency || !timeOfDay) {
    return res.status(400).json({ success: false, error: "Please enter all reminder fields." });
  }

  const reminderId = `rem-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const reminder = await dbOperation(
      async (p) => {
        return await p.medicineReminder.create({
          data: {
            id: reminderId,
            userId: req.user!.id,
            medicineName,
            dosage,
            frequency,
            timeOfDay,
            isActive: true
          }
        });
      },
      () => {
        const mockR = {
          id: reminderId,
          userId: req.user!.id,
          medicineName,
          dosage,
          frequency,
          timeOfDay,
          isActive: true
        };
        dbInstance.reminders.push(mockR);
        return mockR;
      }
    );

    return res.status(201).json({ success: true, reminder });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Toggle Reminder Status
router.put('/alarms/:id/toggle', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const reminder = await dbOperation(
      async (p) => {
        const r = await p.medicineReminder.findFirst({ where: { id: id as string, userId: req.user!.id } });
        if (!r) return null;
        return await p.medicineReminder.update({
          where: { id: id as string },
          data: { isActive: !r.isActive }
        });
      },
      () => {
        const idx = dbInstance.reminders.findIndex(r => r.id === id as string && r.userId === req.user!.id);
        if (idx === -1) return null;
        dbInstance.reminders[idx].isActive = !dbInstance.reminders[idx].isActive;
        return dbInstance.reminders[idx];
      }
    );

    if (!reminder) return res.status(404).json({ success: false, error: "Reminder not found." });

    return res.json({ success: true, reminder });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete Reminder
router.delete('/alarms/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const success = await dbOperation(
      async (p) => {
        const r = await p.medicineReminder.findFirst({ where: { id: id as string, userId: req.user!.id } });
        if (!r) return false;
        await p.medicineReminder.delete({ where: { id: id as string } });
        return true;
      },
      () => {
        const idx = dbInstance.reminders.findIndex(r => r.id === id as string && r.userId === req.user!.id);
        if (idx === -1) return false;
        dbInstance.reminders.splice(idx, 1);
        return true;
      }
    );

    if (!success) return res.status(404).json({ success: false, error: "Reminder not found or unauthorized." });

    return res.json({ success: true, message: "Reminder deleted successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. MEDICINE SUBSCRIPTIONS (AUTO-REORDER)
// ==========================================

// Get Subscriptions
router.get('/subscriptions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbOperation(
      async (p) => await p.subscription.findMany({ where: { userId: req.user!.id } }),
      () => dbInstance.subscriptions.filter(s => s.userId === req.user!.id)
    );
    return res.json({ success: true, subscriptions: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Create Subscription
router.post('/subscriptions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { productIds, frequencyInDays } = req.body; // productIds: stringified array e.g. '["prod-1", "prod-2"]'

  if (!productIds || !frequencyInDays) {
    return res.status(400).json({ success: false, error: "Provide productIds list and frequency." });
  }

  const subId = `sub-${Math.random().toString(36).substr(2, 9)}`;
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + parseInt(frequencyInDays));

  try {
    const subscription = await dbOperation(
      async (p) => {
        return await p.subscription.create({
          data: {
            id: subId,
            userId: req.user!.id,
            productIds,
            frequencyInDays: parseInt(frequencyInDays),
            nextBillingDate,
            status: "ACTIVE",
            discountPercentage: 10
          }
        });
      },
      () => {
        const mockS = {
          id: subId,
          userId: req.user!.id,
          productIds,
          frequencyInDays: parseInt(frequencyInDays),
          nextBillingDate,
          status: "ACTIVE",
          discountPercentage: 10,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dbInstance.subscriptions.push(mockS);
        return mockS;
      }
    );

    return res.status(201).json({ success: true, message: "Subscription configured successfully.", subscription });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel Subscription
router.delete('/subscriptions/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const subscription = await dbOperation(
      async (p) => {
        const s = await p.subscription.findFirst({ where: { id: id as string, userId: req.user!.id } });
        if (!s) return null;
        return await p.subscription.update({
          where: { id: id as string },
          data: { status: "CANCELLED" }
        });
      },
      () => {
        const idx = dbInstance.subscriptions.findIndex(s => s.id === id as string && s.userId === req.user!.id);
        if (idx === -1) return null;
        dbInstance.subscriptions[idx].status = "CANCELLED";
        return dbInstance.subscriptions[idx];
      }
    );

    if (!subscription) return res.status(404).json({ success: false, error: "Subscription not found." });

    return res.json({ success: true, message: "Subscription cancelled.", subscription });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
