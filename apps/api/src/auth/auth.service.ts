import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PrismaService } from '../prisma/prisma.service';

export interface User {
  id: string;
  walletAddress: string;
  plan: 'free' | 'pro' | 'elite';
}

export interface Session {
  user: User;
  token: string;
}

@Injectable()
export class AuthService {
  private nonces = new Map<string, { nonce: string; expires: number }>();
  private sessions = new Map<string, Session>();

  constructor(private readonly prisma: PrismaService) {}

  createNonce(walletAddress: string) {
    const nonce = `lupus-auth-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.nonces.set(walletAddress, { nonce, expires: Date.now() + 5 * 60 * 1000 });
    return { nonce, message: `Sign this message to authenticate: ${nonce}`, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() };
  }

  async verify(walletAddress: string, signatureB64: string, nonce: string): Promise<Session> {
    const record = this.nonces.get(walletAddress);
    if (!record || record.nonce !== nonce || Date.now() > record.expires) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }
    if (!signatureB64 || signatureB64.length < 10) {
      throw new UnauthorizedException('Invalid signature');
    }

    const message = new TextEncoder().encode(record.nonce);
    const signature = new Uint8Array(atob(signatureB64).split('').map((c) => c.charCodeAt(0)));
    const publicKey = bs58.decode(walletAddress);

    const valid = nacl.sign.detached.verify(message, signature, publicKey);
    if (!valid) {
      throw new UnauthorizedException('Signature verification failed');
    }

    this.nonces.delete(walletAddress);

    let user = await this.prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await this.prisma.user.create({ data: { walletAddress, plan: 'free' } });
    }

    const token = `lr-token-${randomUUID()}`;
    const session = { user: { id: user.id, walletAddress: user.walletAddress, plan: user.plan as User['plan'] }, token };
    this.sessions.set(token, session);
    return session;
  }

  me(token: string): User {
    const session = this.sessions.get(token);
    if (!session) throw new UnauthorizedException();
    return session.user;
  }
}
