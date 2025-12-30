export default function ExplorerLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-56 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-full max-w-2xl bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Tool Selector Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
          <div className="flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Interactive Tool Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100 h-[600px]">
              {/* Tool Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Interactive Area */}
              <div className="relative h-96 bg-gray-50 rounded-xl mb-6 overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-100 to-purple-100 animate-pulse" />

                {/* Center loading icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-24 h-24">
                    <div className="absolute inset-0 border-4 border-purple-200 rounded-full animate-ping" />
                    <div className="absolute inset-2 border-4 border-purple-400 rounded-full animate-spin" />
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
                          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Skeleton */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />

              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Visual Example Skeleton */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Quick Tips Skeleton */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 mt-6">
              <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse mt-1" />
                    <div className="flex-1 h-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-6 py-3 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Loading theory explorer...</span>
          </div>
        </div>

        {/* Screen Reader Only */}
        <span className="sr-only">Loading theory explorer interface</span>
      </div>
    </div>
  );
}
