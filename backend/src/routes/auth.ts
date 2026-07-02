import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { dbOperation } from '../db.js';
import { dbInstance } from '../mockData.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_pharmaceutical_compliance_jwt_key_2026';

// Helper: Generate JWT token
function generateToken(payload: { id: string; email: string; role: Role; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// 1. REGISTER
router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: "Please provide email, password, and name." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user exists
    const userExists = await dbOperation(
      async (p) => {
        const count = await p.user.count({ where: { email: normalizedEmail } });
        return count > 0;
      },
      () => {
        return dbInstance.users.some(u => u.email === normalizedEmail);
      }
    );

    if (userExists) {
      return res.status(400).json({ success: false, error: "Email is already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `user-${Math.random().toString(36).substr(2, 9)}`;

    const newUser = await dbOperation<any>(
      async (p) => {
        return await p.user.create({
          data: {
            id: userId,
            email: normalizedEmail,
            phone: phone || null,
            name,
            passwordHash,
            role: Role.USER,
            isVerified: true
          }
        });
      },
      () => {
        const mockU = {
          id: userId,
          email: normalizedEmail,
          phone: phone || null,
          name,
          passwordHash,
          role: Role.USER,
          isVerified: true,
          is2FAEnabled: false,
          status: "ACTIVE",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        dbInstance.users.push(mockU);
        return mockU;
      }
    );

    // Create Audit Log
    await dbOperation(
      async (p) => {
        await p.auditLog.create({
          data: {
            userId: newUser.id,
            action: 'REGISTER',
            details: `Registered email ${normalizedEmail}`,
            ipAddress: req.ip || '127.0.0.1'
          }
        });
      },
      () => {
        dbInstance.auditLogs.push({
          id: `audit-${Math.random().toString(36).substr(2, 9)}`,
          userId: newUser.id,
          action: 'REGISTER',
          details: `Registered email ${normalizedEmail}`,
          ipAddress: req.ip || '127.0.0.1',
          createdAt: new Date()
        });
      }
    );

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        phone: newUser.phone,
        role: newUser.role,
        is2FAEnabled: false
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Please enter email and password." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await dbOperation(
      async (p) => {
        return await p.user.findUnique({ where: { email: normalizedEmail } });
      },
      () => {
        return dbInstance.users.find(u => u.email === normalizedEmail) || null;
      }
    );

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, error: "Account has been suspended. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    // Save Login History
    const ipAddress = req.ip || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    await dbOperation(
      async (p) => {
        await p.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress,
            device: userAgent,
            location: "Local Session"
          }
        });
      },
      () => {
        dbInstance.loginHistories.push({
          id: `login-${Math.random().toString(36).substr(2, 9)}`,
          userId: user.id,
          ipAddress,
          device: userAgent,
          location: "Local Session",
          timestamp: new Date()
        });
      }
    );

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. MOCK GOOGLE LOGIN
router.post('/google', async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !name || !googleId) {
    return res.status(400).json({ success: false, error: "Incomplete Google profile fields." });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = await dbOperation(
      async (p) => {
        return await p.user.findUnique({ where: { email: normalizedEmail } });
      },
      () => {
        return dbInstance.users.find(u => u.email === normalizedEmail) || null;
      }
    );

    if (!user) {
      const dummyPassword = await bcrypt.hash(`google_${googleId}`, 10);
      const userId = `user-${Math.random().toString(36).substr(2, 9)}`;

      user = await dbOperation<any>(
        async (p) => {
          return await p.user.create({
            data: {
              id: userId,
              email: normalizedEmail,
              name,
              passwordHash: dummyPassword,
              googleId,
              isVerified: true
            }
          });
        },
        () => {
          const mockU = {
            id: userId,
            email: normalizedEmail,
            phone: null,
            name,
            passwordHash: dummyPassword,
            role: Role.USER,
            isVerified: true,
            is2FAEnabled: false,
            status: "ACTIVE",
            createdAt: new Date(),
            updatedAt: new Date()
          };
          dbInstance.users.push(mockU);
        }
      );
    }

    if (!user) {
      return res.status(401).json({ success: false, error: "Google single sign-on failed." });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. ME (GET ACTIVE PROFILE)
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  try {
    const user = await dbOperation(
      async (p) => {
        return await p.user.findUnique({ where: { id: req.user!.id } });
      },
      () => {
        return dbInstance.users.find(u => u.id === req.user!.id) || null;
      }
    );

    if (!user) {
      return res.status(404).json({ success: false, error: "User session not found." });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        is2FAEnabled: user.is2FAEnabled,
        status: user.status
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 5. LOGIN HISTORY
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  try {
    const list = await dbOperation(
      async (p) => {
        return await p.loginHistory.findMany({
          where: { userId: req.user!.id },
          orderBy: { timestamp: 'desc' },
          take: 10
        });
      },
      () => {
        return dbInstance.loginHistories
          .filter(h => h.userId === req.user!.id)
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);
      }
    );

    return res.json({ success: true, history: list });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 6. TOGGLE 2FA
router.post('/2fa/toggle', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false });

  try {
    const user = await dbOperation(
      async (p) => {
        const u = await p.user.findUnique({ where: { id: req.user!.id } });
        if (!u) return null;
        return await p.user.update({
          where: { id: req.user!.id },
          data: { is2FAEnabled: !u.is2FAEnabled, twoFactorSecret: !u.is2FAEnabled ? "mock_2fa_secret_token" : null }
        });
      },
      () => {
        const idx = dbInstance.users.findIndex(u => u.id === req.user!.id);
        if (idx === -1) return null;
        const u = dbInstance.users[idx];
        u.is2FAEnabled = !u.is2FAEnabled;
        u.twoFactorSecret = u.is2FAEnabled ? "mock_2fa_secret_token" : null;
        return u;
      }
    );

    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    return res.json({
      success: true,
      is2FAEnabled: user.is2FAEnabled,
      secret: user.twoFactorSecret
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 7. CHANGE PASSWORD
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: "Provide current and new passwords." });
  }

  try {
    const user = await dbOperation(
      async (p) => {
        return await p.user.findUnique({ where: { id: req.user!.id } });
      },
      () => {
        return dbInstance.users.find(u => u.id === req.user!.id) || null;
      }
    );

    if (!user) return res.status(404).json({ success: false, error: "User not found." });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Current password is incorrect." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await dbOperation(
      async (p) => {
        await p.user.update({
          where: { id: req.user!.id },
          data: { passwordHash }
        });
      },
      () => {
        const idx = dbInstance.users.findIndex(u => u.id === req.user!.id);
        if (idx !== -1) {
          dbInstance.users[idx].passwordHash = passwordHash;
        }
      }
    );

    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
