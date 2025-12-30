export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="text-center">
        {/* Animated Logo/Spinner */}
        <div className="relative w-24 h-24 mx-auto mb-8">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping opacity-75" />

          {/* Middle Ring */}
          <div className="absolute inset-2 border-4 border-purple-400 rounded-full animate-spin"
               style={{ animationDuration: '1.5s' }} />

          {/* Inner Circle */}
          <div className="absolute inset-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
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

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Loading Clavier
        </h2>
        <p className="text-gray-600">
          Preparing your musical journey...
        </p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
               style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
               style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
               style={{ animationDelay: '300ms' }} />
        </div>

        {/* Screen Reader Only */}
        <span className="sr-only">Loading application</span>
      </div>
    </div>
  );
}
