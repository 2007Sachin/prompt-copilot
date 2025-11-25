import { ClerkProvider, SignedIn, SignedOut, SignIn, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import MainApp from "./MainApp";
import ErrorBoundary from "./components/ErrorBoundary";
import { validateEnvironment, logEnvironmentStatus } from "./lib/envValidation";

// Validate environment variables on app load
try {
  validateEnvironment();
  if (import.meta.env.DEV) {
    logEnvironmentStatus();
  }
} catch (error) {
  console.error('Environment validation failed:', error);
}

// Get Clerk publishable key from environment
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function AppContent() {
  const { user } = useUser();

  // Log user session in dev mode
  useEffect(() => {
    if (import.meta.env.DEV && user) {
      console.log('✅ User authenticated:', user.id);
    }
  }, [user]);

  return (
    <>
      {/* When user is signed in */}
      <SignedIn>
        <ErrorBoundary>
          <MainApp user={user} />
        </ErrorBoundary>
      </SignedIn>

      {/* When user is signed out */}
      <SignedOut>
        <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="bg-[#252525] p-4 rounded-2xl inline-block mb-4 shadow-lg">
                <svg className="w-12 h-12 text-[#BB86FC]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#E0E0E0] mb-2">PromptCopilot</h1>
              <p className="text-[#A0A0A0]">AI-Powered Prompt Engineering</p>
            </div>

            {/* Clerk Sign In Component */}
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "bg-[#1E1E1E] border border-[#2A2A2A] shadow-xl",
                  headerTitle: "text-[#E0E0E0]",
                  headerSubtitle: "text-[#A0A0A0]",
                  socialButtonsBlockButton: "bg-[#252525] border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]",
                  formButtonPrimary: "bg-[#BB86FC] hover:bg-[#a66af5] text-black",
                  formFieldInput: "bg-[#252525] border-[#2A2A2A] text-[#E0E0E0]",
                  footerActionLink: "text-[#BB86FC] hover:text-[#a66af5]",
                }
              }}
            />
          </div>
        </div>
      </SignedOut>
    </>
  );
}

export default function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 text-[#E0E0E0]">
        <div className="max-w-md w-full bg-[#1E1E1E] border border-red-500/30 p-8 rounded-xl shadow-2xl">
          <h1 className="text-2xl font-bold text-red-400 mb-4">⚠️ Configuration Missing</h1>
          <p className="mb-4 text-gray-300">
            The <code className="bg-[#252525] px-2 py-1 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> is missing from your environment variables.
          </p>
          <div className="bg-[#252525] p-4 rounded-lg mb-6 overflow-x-auto">
            <code className="text-sm text-blue-300">
              VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
            </code>
          </div>
          <p className="text-sm text-gray-400">
            Please add this key to your <code className="bg-[#252525] px-2 py-1 rounded">.env</code> file and restart the development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    </ErrorBoundary>
  );
}
