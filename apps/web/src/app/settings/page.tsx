'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const [rpc, setRpc] = useState('https://api.devnet.solana.com');

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>RPC Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Primary RPC</Label>
            <Input value={rpc} onChange={(e) => setRpc(e.target.value)} />
          </div>
          <Button>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}
