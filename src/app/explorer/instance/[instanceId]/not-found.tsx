import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function InstanceNotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md px-6">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <span className="text-3xl">🎵</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Instance Not Found
          </h1>
          <p className="text-gray-600">
            The requested feature instance could not be found. It may have been
            removed or the URL might be incorrect.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/explorer">
            <Button>Browse Features</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
