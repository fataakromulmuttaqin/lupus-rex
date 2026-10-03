import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConnectDto, VerifyDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('connect')
  connect(@Body() dto: ConnectDto) {
    return this.auth.createNonce(dto.walletAddress);
  }

  @Post('verify')
  verify(@Body() dto: VerifyDto) {
    return this.auth.verify(dto.walletAddress, dto.signature, dto.nonce);
  }

  @Get('me')
  me(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    return this.auth.me(token);
  }
}
