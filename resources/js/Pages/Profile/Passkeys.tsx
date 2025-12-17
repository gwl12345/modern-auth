import { Head, useForm, router, usePage } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge"; // Assumes shadcn/ui badge
import Webpass from "@laragear/webpass";
import { Key, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Passkey {
  id: string;
  alias?: string;
  created_at: string;
}

export default function Passkeys({ passkeys }: { passkeys: Passkey[] }) {
  const { flash } = usePage<any>().props;
  const [alias, setAlias] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [deletingPasskeyId, setDeletingPasskeyId] = useState<string | null>(
    null
  );

  // Handle flash messages
  useEffect(() => {
    if (flash?.success) {
      toast.success(flash.success);
    }
    if (flash?.error) {
      toast.error(flash.error);
    }
  }, [flash]);

  const submit: FormEventHandler = async (e) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      // Check if Webpass is available in window or imported
      if (!Webpass.isSupported()) {
        toast.error("WebAuthn is not supported in this browser.");
        setIsRegistering(false);
        return;
      }

      const { success, error } = await Webpass.attest(
        { path: route("webauthn.register.options"), findCsrfToken: true },
        {
          path: route("webauthn.register"),
          findCsrfToken: true,
          body: { alias: alias },
        }
      );

      if (success) {
        setAlias("");
        toast.success("Passkey added successfully!");
        router.reload(); // Reload to fetch updated passkeys list
      } else if (error) {
        toast.error("Failed to create passkey");
        console.error(error);
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      console.error(err);
    }

    setIsRegistering(false);
  };

  const deletePasskey = (id: string) => {
    setDeletingPasskeyId(id);

    router.delete(route("modern-auth.settings.passkeys.destroy", { id }), {
      // Using newly named route
      preserveScroll: true,
      onError: () => {
        toast.error("Failed to delete passkey");
        setDeletingPasskeyId(null);
      },
      onFinish: () => {
        setDeletingPasskeyId(null);
      },
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 space-y-6">
      <Head title="Passkeys" />

      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Passkeys
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your passkeys for passwordless authentication.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow overflow-hidden sm:rounded-md bg-white dark:bg-gray-800 p-6">
            {/* Add new passkey */}
            <form onSubmit={submit} className="space-y-4 max-w-md mb-8">
              <div className="grid gap-2">
                <Label htmlFor="alias">Passkey Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="alias"
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    required
                    placeholder="e.g. MacBook Pro, iPhone"
                  />
                  <Button disabled={isRegistering} type="submit">
                    {isRegistering ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-gray-100">
                Existing Passkeys
              </h4>
              {passkeys.length === 0 ? (
                <div className="text-sm text-gray-500 italic">
                  No passkeys registered.
                </div>
              ) : (
                <div className="space-y-2">
                  {passkeys.map((passkey) => (
                    <div
                      key={passkey.id}
                      className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-2 rounded-full">
                          <Key className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {passkey.alias ||
                              `Passkey (${passkey.id.substring(0, 8)}...)`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created:{" "}
                            {new Date(passkey.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePasskey(passkey.id)}
                        disabled={deletingPasskeyId === passkey.id}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        {deletingPasskeyId === passkey.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
