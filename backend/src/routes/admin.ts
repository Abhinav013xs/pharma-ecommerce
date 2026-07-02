import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance, mockProducts } from '../mockData.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, OrderStatus, PrescriptionStatus } from '@prisma/client';

const router = Router();

// 1. ADMIN METRICS OVERVIEW
router.get('/metrics', authenticateToken, authorizeRoles(Role.ADMIN), async (req, res) => {
  try {
    const metrics = await dbOperation(
      async (p) => {
        const totalSales = await p.order.aggregate({
          where: { paymentStatus: 'SUCCESS' },
          _sum: { totalAmount: true }
        });
        const totalOrders = await p.order.count();
        const pendingPrescriptions = await p.prescription.count({
          where: { status: PrescriptionStatus.PENDING }
        });
        const totalUsers = await p.user.count({
          where: { role: Role.USER }
        });
        const lowStockCount = await p.product.count({
          where: { stockCount: { lte: 10 } }
        });

        // Get 5 recent orders
        const recentOrders = await p.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } }
        });

        return {
          totalSales: totalSales._sum.totalAmount || 0,
          totalOrders,
          pendingPrescriptions,
          totalUsers,
          lowStockCount,
          recentOrders
        };
      },
      () => {
        const totalSales = dbInstance.orders
          .filter(o => o.paymentStatus === 'SUCCESS')
          .reduce((sum, o) => sum + o.totalAmount, 0);

        const totalOrders = dbInstance.orders.length;
        const pendingPrescriptions = dbInstance.prescriptions.filter(p => p.status === PrescriptionStatus.PENDING).length;
        const totalUsers = dbInstance.users.filter(u => u.role === Role.USER).length;
        const lowStockCount = mockProducts.filter(p => p.stockCount <= 10).length;

        const recentOrders = dbInstance.orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map(o => {
            const user = dbInstance.users.find(u => u.id === o.userId);
            return {
              ...o,
              user: user ? { name: user.name, email: user.email } : null
            };
          });

        return {
          totalSales,
          totalOrders,
          pendingPrescriptions,
          totalUsers,
          lowStockCount,
          recentOrders
        };
      }
    );

    return res.json({ success: true, metrics });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. ADMIN INVENTORY REPORTS
router.get('/inventory-report', authenticateToken, authorizeRoles(Role.ADMIN), async (req, res) => {
  try {
    const list = await dbOperation(
      async (p) => {
        return await p.product.findMany({
          where: { stockCount: { lte: 25 } },
          orderBy: { stockCount: 'asc' }
        });
      },
      () => {
        return mockProducts
          .filter(p => p.stockCount <= 25)
          .sort((a, b) => a.stockCount - b.stockCount);
      }
    );

    return res.json({ success: true, lowStockProducts: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
