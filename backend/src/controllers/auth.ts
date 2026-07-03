import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = registerSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'User already exists' });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, passwordHash },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

      res.status(201).json({
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email },
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = registerSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

      res.json({
        success: true,
        data: {
          token,
          user: { id: user.id, email: user.email },
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
