import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';

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
  private users = new Map<string, User>();
  private nonces = new Map<string, { nonce: string; expires: number }>();
  private sessions = new Map<string, Session>();

  createNonce(walletAddress: string) {
    const nonce = `lupus-auth-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.nonces.set(walletAddress, { nonce, expires: Date.now() + 5 * 60 * 1000 });
    return { nonce, message: `Sign this message to authenticate: ${nonce}`, expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() };
  }

  verify(walletAddress: string, signature: string, nonce: string): Session {
    const record = this.nonces.get(walletAddress);
    if (!record || record.nonce !== nonce || Date.now() > record.expires) {
      throw new UnauthorizedException('Invalid or expired nonce');
    }
    // TODO: real ed25519 signature verification using @solana/web3.js
    if (!signature || signature.length < 10) {
      throw new UnauthorizedException('Invalid signature');
    }
    this.nonces.delete(walletAddress);

    let user = this.users.get(walletAddress);
    if (!user) {
      user = { id: randomUUID(), walletAddress, plan: 'free' };
      this.users.set(walletAddress, user);
    }

    const token = `lr-token-${randomUUID()}`;
    const session = { user, token };
    this.sessions.set(token, session);
    return session;
  }

  me(token: string) {
    const session = this.sessions.get(token);
    if (!session) throw new UnauthorizedException();
    return session.user;
  }
}
