export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold text-accent">
          Clavier
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl">
          Music Theory Learning Tool
        </p>
        <div className="flex gap-4 justify-center pt-8">
          <div className="w-16 h-16 rounded-lg bg-voice-soprano flex items-center justify-center text-white font-semibold">
            S
          </div>
          <div className="w-16 h-16 rounded-lg bg-voice-alto flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div className="w-16 h-16 rounded-lg bg-voice-tenor flex items-center justify-center text-white font-semibold">
            T
          </div>
          <div className="w-16 h-16 rounded-lg bg-voice-bass flex items-center justify-center text-white font-semibold">
            B
          </div>
        </div>
        <p className="text-sm text-gray-500 pt-4">
          Application initializing...
        </p>
      </div>
    </main>
  )
}
