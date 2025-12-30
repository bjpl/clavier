export default function CurriculumLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Progress Overview Skeleton */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 animate-pulse" />
        </div>

        {/* Curriculum Sections Skeleton */}
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
                  <div>
                    <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Lesson Items */}
              <div className="space-y-3 mt-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Loading Indicator */}
        <div className="fixed bottom-8 right-8 bg-white rounded-full shadow-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-700">Loading curriculum...</span>
          </div>
        </div>

        {/* Screen Reader Only */}
        <span className="sr-only">Loading curriculum content</span>
      </div>
    </div>
  );
}
