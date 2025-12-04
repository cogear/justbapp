import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="space-y-8 max-w-md">
        <h1 className="text-6xl font-dynapuff text-primary">b.</h1>
        <p className="text-xl text-muted-foreground font-light tracking-wide">
          just be
        </p>

        <div className="pt-8">
          <Link
            href="/handler/onboarding"
            className="
              inline-block px-8 py-3 bg-b-charcoal text-white rounded-full 
              font-medium tracking-wide shadow-sm hover:shadow-md 
              transition-all duration-300 hover:-translate-y-0.5
            "
          >
            Check In
          </Link>
        </div>
      </div>
    </main>
  );
}
