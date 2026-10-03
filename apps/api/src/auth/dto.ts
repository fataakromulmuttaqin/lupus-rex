import { IsString, IsOptional } from 'class-validator';

export class ConnectDto {
  @IsString() walletAddress: string;
}

export class VerifyDto {
  @IsString() walletAddress: string;
  @IsString() signature: string;
  @IsString() nonce: string;
}

export class CreateWalletDto {
  @IsString() address: string;
  @IsOptional() @IsString() label?: string;
  @IsOptional() type?: 'hot' | 'cold' = 'hot';
}
