'use client';

import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './Icons';

const SimpleHeader = () => (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-headline text-gray-800">
            <Logo className="h-8 w-8 text-primary" />
            <span>Sutton Shopping</span>
          </Link>
        </div>
      </div>
    </header>
);

export default function FirebaseNotConfigured() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <SimpleHeader />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl p-8 bg-card rounded-lg shadow-md border border-destructive/50 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold font-headline text-card-foreground">
            Configuration Needed
          </h1>
          <p className="mt-2 text-muted-foreground">
            This app requires a connection to Firebase to handle user authentication and data storage.
          </p>
          <div className="mt-6 text-left bg-muted/50 p-4 rounded-md border">
            <h2 className="font-semibold text-lg text-card-foreground">Next Steps:</h2>
            <ol className="list-decimal list-inside mt-2 space-y-2 text-muted-foreground">
              <li>
                Open the <code className="bg-muted p-1 rounded text-sm font-mono">.env.local</code> file in the file viewer on the left.
              </li>
              <li>
                Follow the instructions in your Firebase project console to get your project's configuration keys.
              </li>
              <li>
                Copy and paste your keys into the <code className="bg-muted p-1 rounded text-sm font-mono">.env.local</code> file, replacing the placeholder values.
              </li>
            </ol>
          </div>
          <p className="mt-6 text-sm text-muted-foreground/80">
            Once the keys are saved, this page will automatically reload.
          </p>
        </div>
      </main>
    </div>
  );
}
