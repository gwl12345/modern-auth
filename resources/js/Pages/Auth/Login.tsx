import { Head, useForm, Link } from "@inertiajs/react"; // Standard import
import { Loader2, Mail, Key, FileText } from "lucide-react"; // Using icons
import { FormEventHandler, useState } from "react";
import Webpass from "@laragear/webpass";
import { toast } from "sonner";

// Assuming basic shadcn components are available in the host app OR defining them inline/minimal here
// For a package, it's best to assume they will be published/available or use standard HTML with tailwind classes
// I'll use standard Tailwind classes for simplicity in this initial port to avoid 'missing component' errors
// but structure them to easily replace with Shadcn components.

interface LoginProps {
  status?: string;
  canResetPassword?: boolean;
  canRegister?: boolean;
}

export default function Login({
  status,
  canResetPassword,
  canRegister,
}: LoginProps) {
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [activeTab, setActiveTab] = useState<"form" | "email" | "passkey">(
    "form"
  );

  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false,
  });

  const {
    data: emailData,
    setData: setEmailData,
    post: postEmail,
    processing: emailProcessing,
    errors: emailErrors,
    reset: resetEmail,
  } = useForm({
    email: "",
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password"),
    });
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    postEmail(route("magic-link.send"), {
      onSuccess: () => {
        setSentEmail(emailData.email);
        setMagicLinkSent(true);
      },
      onFinish: () => resetEmail("email"),
    });
  };

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Webpass assert flow
      // Note: Ensure routes are named correctly in web.php
      const { success, data, error, user } = await Webpass.assert(
        { path: route("webauthn.login.options"), findCsrfToken: true },
        { path: route("webauthn.login"), findCsrfToken: true }
      );

      if (success) {
        // Determine redirect path - typically dashboard
        window.location.href = route("dashboard");
      } else {
        console.error(error);
        toast.error("Passkey login failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <Head title="Log in" />

      <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        {status && (
          <div className="mb-4 text-sm font-medium text-green-600">
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("form")}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${
              activeTab === "form"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Form</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("email")}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${
              activeTab === "email"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("passkey")}
            className={`flex-1 py-2 text-sm font-medium text-center border-b-2 ${
              activeTab === "passkey"
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <Key className="w-4 h-4" />
              <span>Passkey</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Standard Form */}
          {activeTab === "form" && (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  value={data.email}
                  onChange={(e) => setData("email", e.target.value)}
                  required
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  value={data.password}
                  onChange={(e) => setData("password", e.target.value)}
                  required
                />
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                    checked={data.remember}
                    onChange={(e) => setData("remember", e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                    Remember me
                  </span>
                </label>
                {canResetPassword && (
                  <Link
                    href={route("password.request")}
                    className="text-sm text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"
                  >
                    Forgot password?
                  </Link>
                )}
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {processing && (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                )}
                Log in
              </button>
            </form>
          )}

          {/* Magic Link Form */}
          {activeTab === "email" && (
            <div>
              {!magicLinkSent ? (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email address
                    </label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                      value={emailData.email}
                      onChange={(e) => setEmailData("email", e.target.value)}
                      required
                      placeholder="email@example.com"
                    />
                    {emailErrors.email && (
                      <p className="text-sm text-red-600 mt-1">
                        {emailErrors.email}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={emailProcessing}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {emailProcessing && (
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    )}
                    Send Magic Link
                  </button>
                  <p className="text-xs text-center text-gray-500">
                    We'll send you a secure login link via email
                  </p>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                    Email sent successfully
                  </h3>
                  <p className="text-sm text-gray-500">
                    Check your email ({sentEmail}) for the login link. It will
                    expire in 15 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setMagicLinkSent(false);
                      setSentEmail("");
                      resetEmail("email");
                    }}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Send another link
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Passkey Form */}
          {activeTab === "passkey" && (
            <form
              onSubmit={handlePasskeyLogin}
              className="space-y-4 text-center"
            >
              <p className="text-sm text-gray-500 mb-4">
                Sign in securely with your fingerprint, face, or screen lock
              </p>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Key className="h-4 w-4 mr-2" />
                Use Passkey
              </button>
              <p className="text-xs text-gray-400">
                Make sure your device supports passkeys
              </p>
            </form>
          )}
        </div>

        {canRegister && activeTab === "form" && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              href={route("register")}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
