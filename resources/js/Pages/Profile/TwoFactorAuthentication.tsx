import { Head, useForm, router, usePage } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import InputError from "@/components/input-error"; // Assuming this exists or create it
// Note: InputError might need to be created if not in host. I'll rely on simple div for package.

// Helper Component for Password Confirmation Dialog
interface ConfirmsPasswordProps {
  title?: string;
  content?: string;
  button?: string;
  onConfirm: () => void;
  children: React.ReactNode;
}

function ConfirmsPassword({
  title = "Confirm Password",
  content = "For your security, please confirm your password to continue.",
  button = "Confirm",
  onConfirm,
  children,
}: ConfirmsPasswordProps) {
  const [confirmingPassword, setConfirmingPassword] = useState(false);
  const [form, setForm] = useState({
    password: "",
    error: "",
    processing: false,
  });
  const passwordRef = useRef<HTMLInputElement>(null);

  function startConfirmingPassword() {
    axios
      .get(route("password.confirmation"))
      .then((response) => {
        if (response.data.confirmed) {
          onConfirm();
        } else {
          setConfirmingPassword(true);
          setTimeout(() => passwordRef.current?.focus(), 250);
        }
      })
      .catch(() => {
        // Fallback
        setConfirmingPassword(true);
        setTimeout(() => passwordRef.current?.focus(), 250);
      });
  }

  function confirmPassword() {
    setForm({ ...form, processing: true });

    axios
      .post(route("password.confirm"), { password: form.password })
      .then(() => {
        closeModal();
        setTimeout(() => onConfirm(), 250);
      })
      .catch((error) => {
        setForm({
          ...form,
          processing: false,
          error:
            error.response?.data?.errors?.password?.[0] || "Password incorrect",
        });
        passwordRef.current?.focus();
      });
  }

  function closeModal() {
    setConfirmingPassword(false);
    setForm({ processing: false, password: "", error: "" });
  }

  return (
    <>
      <span onClick={startConfirmingPassword} className="cursor-pointer">
        {children}
      </span>

      <Dialog open={confirmingPassword} onOpenChange={setConfirmingPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{content}</p>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordRef}
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") confirmPassword();
                }}
              />
              {form.error && (
                <p className="text-sm text-red-600">{form.error}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={confirmPassword} disabled={form.processing}>
              {button}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function TwoFactorAuthentication({
  requiresConfirmation,
}: {
  requiresConfirmation: boolean;
}) {
  const { auth } = usePage<any>().props;
  const [enabling, setEnabling] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [setupKey, setSetupKey] = useState<string | null>(null);

  const confirmationForm = useForm({
    code: "",
  });

  const twoFactorEnabled = !enabling && auth.user?.two_factor_enabled;

  function enableTwoFactorAuthentication() {
    setEnabling(true);

    router.post(
      "/user/two-factor-authentication",
      {},
      {
        preserveScroll: true,
        onSuccess() {
          Promise.all([showQrCode(), showSetupKey(), showRecoveryCodes()]).then(
            () => {
              setEnabling(false);
              setConfirming(requiresConfirmation);
            }
          );
        },
        onError() {
          setEnabling(false);
        },
      }
    );
  }

  function showSetupKey() {
    return axios.get("/user/two-factor-secret-key").then((response) => {
      setSetupKey(response.data.secretKey);
    });
  }

  function confirmTwoFactorAuthentication() {
    confirmationForm.post("/user/confirmed-two-factor-authentication", {
      preserveScroll: true,
      preserveState: true,
      errorBag: "confirmTwoFactorAuthentication",
      onSuccess: () => {
        setConfirming(false);
        setQrCode(null);
        setSetupKey(null);
      },
    });
  }

  function showQrCode() {
    return axios.get("/user/two-factor-qr-code").then((response) => {
      setQrCode(response.data.svg);
    });
  }

  function showRecoveryCodes() {
    return axios.get("/user/two-factor-recovery-codes").then((response) => {
      setRecoveryCodes(response.data);
    });
  }

  function regenerateRecoveryCodes() {
    axios.post("/user/two-factor-recovery-codes").then(() => {
      showRecoveryCodes();
    });
  }

  function disableTwoFactorAuthentication() {
    setDisabling(true);
    router.delete("/user/two-factor-authentication", {
      preserveScroll: true,
      onSuccess() {
        setDisabling(false);
        setConfirming(false);
      },
    });
  }

  return (
    <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 space-y-6">
      <Head title="Two-Factor Authentication" />

      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Two-Factor Authentication
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Add additional security to your account using two factor
              authentication.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow overflow-hidden sm:rounded-md bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-base font-medium text-gray-900 dark:text-white">
                Status:
              </h3>
              <Badge
                variant={twoFactorEnabled ? "default" : "secondary"}
                className={twoFactorEnabled ? "bg-green-600" : ""}
              >
                {twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {twoFactorEnabled && !confirming
                ? "Two-factor authentication is currently enabled for your account."
                : confirming
                ? "Complete the setup process below to enable two-factor authentication."
                : "Two-factor authentication is not enabled. Enable it to add an extra layer of security to your account."}
            </div>

            {(twoFactorEnabled || confirming) && qrCode && (
              <div className="space-y-4 mb-6">
                <div className="font-semibold text-gray-900 dark:text-white">
                  {confirming ? "Setup Authentication App" : "QR Code"}
                </div>
                <p className="text-sm text-gray-600">
                  {confirming
                    ? "Scan the QR code below with your authenticator app, or manually enter the setup key."
                    : "Use this QR code to set up your authenticator app."}
                </p>

                <div
                  className="p-4 bg-white inline-block rounded-lg"
                  dangerouslySetInnerHTML={{ __html: qrCode }}
                />

                {setupKey && (
                  <div className="mt-2">
                    <Label>Setup Key</Label>
                    <code className="block mt-1 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-xs font-mono select-all">
                      {setupKey}
                    </code>
                  </div>
                )}

                {confirming && (
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="code">Authentication Code</Label>
                    <div className="flex gap-2">
                      <Input
                        id="code"
                        value={confirmationForm.data.code}
                        onChange={(e) =>
                          confirmationForm.setData("code", e.target.value)
                        }
                        className="max-w-xs"
                        placeholder="123456"
                      />
                      <Button
                        onClick={confirmTwoFactorAuthentication}
                        disabled={confirmationForm.processing}
                      >
                        Confirm
                      </Button>
                    </div>
                    {confirmationForm.errors.code && (
                      <p className="text-sm text-red-600">
                        {confirmationForm.errors.code}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recovery Codes */}
            {recoveryCodes.length > 0 && !confirming && (
              <div className="mb-6">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">
                  Recovery Codes
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Store these codes securely.
                </p>
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-4 rounded-lg font-mono text-sm">
                  {recoveryCodes.map((code) => (
                    <div key={code}>{code}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 mt-6">
              {twoFactorEnabled || confirming ? (
                <>
                  {!confirming && recoveryCodes.length > 0 && (
                    <ConfirmsPassword onConfirm={regenerateRecoveryCodes}>
                      <Button variant="outline">Regenerate Codes</Button>
                    </ConfirmsPassword>
                  )}
                  {!confirming && recoveryCodes.length === 0 && (
                    <ConfirmsPassword onConfirm={showRecoveryCodes}>
                      <Button variant="outline">Show Codes</Button>
                    </ConfirmsPassword>
                  )}
                  <ConfirmsPassword onConfirm={disableTwoFactorAuthentication}>
                    <Button variant="destructive" disabled={disabling}>
                      Disable
                    </Button>
                  </ConfirmsPassword>
                </>
              ) : (
                <ConfirmsPassword onConfirm={enableTwoFactorAuthentication}>
                  <Button disabled={enabling}>Enable</Button>
                </ConfirmsPassword>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
