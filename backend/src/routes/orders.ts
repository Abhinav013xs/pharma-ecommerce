import { Router, Response } from 'express';
import { dbOperation } from '../db.js';
import { dbInstance, mockProducts } from '../mockData.js';
import { authenticateToken, authorizeRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { Role, OrderStatus, PaymentStatus } from '@prisma/client';

const router = Router();

// 1. PLACE AN ORDER
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { items, addressId, prescriptionId, paymentMethod, deliverySlot } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0 || !addressId || !paymentMethod) {
    return res.status(400).json({ success: false, error: "Missing required fields (items, addressId, or paymentMethod)." });
  }

  try {
    // 1. Fetch address to verify
    const address = await dbOperation(
      async (p) => await p.address.findFirst({ where: { id: addressId, userId: req.user!.id } }),
      () => dbInstance.addresses.find(a => a.id === addressId && a.userId === req.user!.id)
    );

    if (!address) {
      return res.status(400).json({ success: false, error: "Invalid delivery address selected." });
    }

    let containsPrescriptionMedicines = false;
    let subtotal = 0;
    const orderItemsData: any[] = [];

    // Calculate billing details and check prescription requirements
    for (const item of items) {
      const product = await dbOperation(
        async (p) => await p.product.findUnique({ where: { id: item.productId } }),
        () => mockProducts.find(p => p.id === item.productId)
      );

      if (!product) {
        return res.status(404).json({ success: false, error: `Product ${item.productId} not found.` });
      }

      if (product.prescriptionRequired) {
        containsPrescriptionMedicines = true;
      }

      const itemPrice = product.price;
      const discountAmount = (itemPrice * (product.discount || 0)) / 100;
      const finalPrice = itemPrice - discountAmount;

      subtotal += finalPrice * item.quantity;

      orderItemsData.push({
        id: `item-${Math.random().toString(36).substr(2, 9)}`,
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice,
        discount: product.discount
      });
    }

    // Prescription validation check
    if (containsPrescriptionMedicines && !prescriptionId) {
      return res.status(400).json({
        success: false,
        error: "A valid prescription must be uploaded and linked to order prescription-only medicines."
      });
    }

    const shippingCharge = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const taxAmount = parseFloat((subtotal * 0.18).toFixed(2)); // 18% GST standard healthcare tax
    const totalAmount = subtotal + shippingCharge + taxAmount;

    // Determine initial order status
    let initialStatus: OrderStatus = OrderStatus.PROCESSING;
    if (containsPrescriptionMedicines) {
      // If prescription required, it starts as PENDING_PRESCRIPTION pharmacist review
      initialStatus = OrderStatus.PENDING_PRESCRIPTION;
    } else if (paymentMethod !== 'COD') {
      // Online payment (Stripe/Razorpay) triggers PENDING_PAYMENT
      initialStatus = OrderStatus.PENDING_PAYMENT;
    }

    const orderId = `order-${Math.random().toString(36).substr(2, 9)}`;

    const order = await dbOperation<any>(
      async (p) => {
        return await p.order.create({
          data: {
            id: orderId,
            userId: req.user!.id,
            addressId,
            prescriptionId: prescriptionId || null,
            status: initialStatus,
            totalAmount,
            discountAmount: 0,
            taxAmount,
            shippingAmount: shippingCharge,
            paymentMethod,
            paymentStatus: PaymentStatus.PENDING,
            deliverySlot,
            items: {
              create: orderItemsData.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
                discount: item.discount
              }))
            }
          },
          include: { items: true }
        });
      },
      () => {
        const mockO = {
          id: orderId,
          userId: req.user!.id,
          addressId,
          prescriptionId: prescriptionId || null,
          status: initialStatus,
          totalAmount,
          discountAmount: 0,
          taxAmount,
          shippingAmount: shippingCharge,
          paymentMethod,
          paymentStatus: PaymentStatus.PENDING,
          paymentId: null,
          deliverySlot,
          invoiceUrl: `/invoices/invoice-${orderId}.pdf`,
          createdAt: new Date(),
          updatedAt: new Date(),
          items: orderItemsData
        };
        dbInstance.orders.push(mockO);
        return mockO;
      }
    );

    // Save Audit Log
    await dbOperation(
      async (p) => {
        await p.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'ORDER_PLACED',
            details: `Placed order ${order.id} totaling ₹${totalAmount}`,
            ipAddress: req.ip || '127.0.0.1'
          }
        });
      },
      () => {
        dbInstance.auditLogs.push({
          id: `audit-${Math.random().toString(36).substr(2, 9)}`,
          userId: req.user!.id,
          action: 'ORDER_PLACED',
          details: `Placed order ${order.id} totaling ₹${totalAmount}`,
          ipAddress: req.ip || '127.0.0.1',
          createdAt: new Date()
        });
      }
    );

    return res.status(201).json({
      success: true,
      message: containsPrescriptionMedicines 
        ? "Order placed successfully! Awaiting prescription verification." 
        : "Order placed. Awaiting payment.",
      order
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. GET USER'S ORDER HISTORY
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const list = await dbOperation(
      async (p) => {
        return await p.order.findMany({
          where: { userId: req.user!.id },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: 'desc' }
        });
      },
      () => {
        return dbInstance.orders
          .filter(o => o.userId === req.user!.id)
          .map(o => {
            const itemsWithProducts = (o.items || []).map(item => {
              const product = mockProducts.find(pr => pr.id === item.productId);
              return { ...item, product };
            });
            return { ...o, items: itemsWithProducts };
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    );

    return res.json({ success: true, orders: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. ADMIN: GET ALL ORDERS
router.get('/all', authenticateToken, authorizeRoles(Role.ADMIN), async (req, res) => {
  try {
    const list = await dbOperation(
      async (p) => {
        return await p.order.findMany({
          include: { 
            user: { select: { name: true, email: true } },
            items: { include: { product: true } } 
          },
          orderBy: { createdAt: 'desc' }
        });
      },
      () => {
        return dbInstance.orders
          .map(o => {
            const user = dbInstance.users.find(u => u.id === o.userId);
            const itemsWithProducts = (o.items || []).map(item => {
              const product = mockProducts.find(pr => pr.id === item.productId);
              return { ...item, product };
            });
            return { 
              ...o, 
              user: user ? { name: user.name, email: user.email } : null,
              items: itemsWithProducts 
            };
          })
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
    );

    return res.json({ success: true, orders: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. GET SINGLE ORDER DETAIL
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const order = await dbOperation<any>(
      async (p) => {
        return await p.order.findFirst({
          where: req.user!.role === Role.ADMIN ? { id: id as string } : { id: id as string, userId: req.user!.id },
          include: { 
            items: { include: { product: true } },
            address: true,
            prescription: true
          }
        });
      },
      () => {
        const o = dbInstance.orders.find(o => 
          req.user!.role === Role.ADMIN ? o.id === id as string : o.id === id as string && o.userId === req.user!.id
        );
        if (!o) return null;

        const itemsWithProducts = (o.items || []).map(item => {
          const product = mockProducts.find(pr => pr.id === item.productId);
          return { ...item, product };
        });

        const address = dbInstance.addresses.find(a => a.id === o.addressId);
        const prescription = dbInstance.prescriptions.find(p => p.id === o.prescriptionId);

        return { 
          ...o, 
          items: itemsWithProducts,
          address,
          prescription
        };
      }
    );

    if (!order) return res.status(404).json({ success: false, error: "Order not found." });

    return res.json({ success: true, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. UPDATE ORDER PAYMENT STATUS (PAYMENT COMPLETED GATEWAY MOCK)
router.post('/:id/pay', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { paymentId } = req.body;

  try {
    const order = await dbOperation(
      async (p) => {
        const o = await p.order.findFirst({ where: { id: id as string, userId: req.user!.id } });
        if (!o) return null;
        
        let newStatus = o.status;
        if (o.status === OrderStatus.PENDING_PAYMENT) {
          newStatus = OrderStatus.PROCESSING;
        }

        return await p.order.update({
          where: { id: id as string },
          data: {
            paymentStatus: PaymentStatus.SUCCESS,
            status: newStatus,
            paymentId: paymentId || `pay_stripe_${Math.random().toString(36).substr(2, 9)}`
          }
        });
      },
      () => {
        const idx = dbInstance.orders.findIndex(o => o.id === id as string && o.userId === req.user!.id);
        if (idx === -1) return null;

        const o = dbInstance.orders[idx];
        o.paymentStatus = PaymentStatus.SUCCESS;
        if (o.status === OrderStatus.PENDING_PAYMENT) {
          o.status = OrderStatus.PROCESSING;
        }
        o.paymentId = paymentId || `pay_stripe_${Math.random().toString(36).substr(2, 9)}`;
        return o;
      }
    );

    if (!order) return res.status(404).json({ success: false, error: "Order not found." });

    return res.json({ success: true, message: "Payment validated and processed.", order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. ADMIN: CHANGE ORDER DELIVERY STATUS
router.put('/:id/status', authenticateToken, authorizeRoles(Role.ADMIN), async (req, res) => {
  const { id } = req.params;
  const { status, deliveryPartner, trackingId } = req.body; // status: PROCESSING, SHIPPED, DELIVERED, CANCELLED

  if (!status || !['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ success: false, error: "Provide a valid order delivery status." });
  }

  try {
    const order = await dbOperation(
      async (p) => {
        return await p.order.update({
          where: { id: id as string },
          data: { 
            status: status as OrderStatus,
            deliveryPartner: deliveryPartner || null,
            trackingId: trackingId || null
          }
        });
      },
      () => {
        const idx = dbInstance.orders.findIndex(o => o.id === id as string);
        if (idx === -1) return null;
        dbInstance.orders[idx].status = status as OrderStatus;
        dbInstance.orders[idx].deliveryPartner = deliveryPartner || null;
        dbInstance.orders[idx].trackingId = trackingId || null;
        return dbInstance.orders[idx];
      }
    );

    if (!order) return res.status(404).json({ success: false, error: "Order not found." });

    return res.json({ success: true, message: `Order status updated to ${status}.`, order });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
