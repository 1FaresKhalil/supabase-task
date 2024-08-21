'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function LoginButton() {
  return (
    <Button className="bg-white text-black hover:bg-slate-50" asChild>
      <Link href="/login">Login</Link>
    </Button>
  );
}
