export default function WalkthroughLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Animated Piano Keys */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Animated rings */}
          <div className="absolute inset-0 border-4 border-purple-200 rounded-2xl animate-pulse" />
          <div className="absolute inset-2 border-4 border-purple-400 rounded-2xl animate-ping opacity-75"
               style={{ animationDuration: '2s' }} />

          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 shadow-lg">
              <svg
                className="w-12 h-12 text-white animate-bounce"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                style={{ animationDuration: '1s' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Loading Walkthrough
        </h2>
        <p className="text-gray-600 mb-6">
          Preparing your interactive piano learning experience...
        </p>

        {/* Progress Steps */}
        <div className="space-y-3 mb-8">
          <LoadingStep text="Setting up virtual piano" delay="0ms" />
          <LoadingStep text="Loading music theory" delay="200ms" />
          <LoadingStep text="Preparing exercises" delay="400ms" />
        </div>

        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"
               style={{ width: '60%' }} />
        </div>

        {/* Screen Reader Only */}
        <span className="sr-only">Loading interactive walkthrough</span>
      </div>
    </div>
  );
}

function LoadingStep({ text, delay }: { text: string; delay: string }) {
  return (
    <div className="flex items-center justify-center space-x-3 opacity-0 animate-fade-in"
         style={{ animationDelay: delay, animationFillMode: 'forwards' }}>
      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}
