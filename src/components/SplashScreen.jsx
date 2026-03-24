function SplashScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#23a802' }}>
        FiTrack
      </h1>

      <div className="mt-5 h-8 w-8 rounded-full border-4 border-slate-300 border-t-slate-500 animate-spin" />
    </div>
  )
}

export default SplashScreen