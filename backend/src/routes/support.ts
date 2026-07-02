import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';
import { TicketStatus, Role } from '@prisma/client';

const router = Router();

// 1. GET ALL USER TICKETS
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await dbOperation(
      async (p) => await p.supportTicket.findMany({ where: { userId: req.user!.id } }),
      () => dbInstance.supportTickets.filter(t => t.userId === req.user!.id)
    );
    return res.json({ success: true, tickets });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. CREATE A TICKET
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { subject, description, category } = req.body;

  if (!subject || !description || !category) {
    return res.status(400).json({ success: false, error: "Subject, description, and category are required." });
  }

  const ticketId = `ticket-${Math.random().toString(36).substr(2, 9)}`;

  try {
    const ticket = await dbOperation<any>(
      async (p) => {
        return await p.supportTicket.create({
          data: {
            id: ticketId,
            userId: req.user!.id,
            subject,
            description,
            category,
            status: TicketStatus.OPEN
          }
        });
      },
      () => {
        const mockT = {
          id: ticketId,
          userId: req.user!.id,
          subject,
          description,
          category,
          status: TicketStatus.OPEN,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dbInstance.supportTickets.push(mockT);
        return mockT;
      }
    );

    return res.status(201).json({ success: true, message: "Support ticket registered successfully.", ticket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. ADMIN: RESOLVE TICKET
router.post('/:id/resolve', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await dbOperation<any>(
      async (p) => {
        return await p.supportTicket.update({
          where: { id: id as string },
          data: { status: TicketStatus.RESOLVED }
        });
      },
      () => {
        const idx = dbInstance.supportTickets.findIndex(t => t.id === id as string);
        if (idx === -1) return null;
        dbInstance.supportTickets[idx].status = TicketStatus.RESOLVED;
        return dbInstance.supportTickets[idx];
      }
    );

    if (!ticket) return res.status(404).json({ success: false, error: "Support ticket not found." });

    return res.json({ success: true, message: "Ticket marked as resolved.", ticket });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
