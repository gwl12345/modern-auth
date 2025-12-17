import { Head, useForm } from "@inertiajs/react"; // Standard import
import { Monitor, Smartphone, AlertTriangle } from "lucide-react"; // Using icons
import { FormEventHandler, useRef, useState } from "react";
import { Button } from "@/components/ui/button"; // Assumes shadcn installed in host
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Define Session type if not available globally
interface Session {
  agent: {
    is_desktop: boolean;
    platform: string;
    browser: string;
  };
  ip_address: string;
  is_current_device: boolean;
  last_active: string;
}

interface Props {
  sessions: Session[];
}

export default function BrowserSessions({ sessions }: Props) {
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    errors,
    delete: deleteRequest,
    reset,
    processing,
    recentlySuccessful,
  } = useForm({
    password: "",
  });

  const confirmLogout = () => {
    setConfirmingLogout(true);
    setTimeout(() => passwordRef.current?.focus(), 250);
  };

  const logoutOtherBrowserSessions: FormEventHandler = (e) => {
    e.preventDefault();

    deleteRequest(route("other-browser-sessions.destroy"), {
      // Make sure this route exists in standard Jetstream/Fortify or defined in package
      // Actually package doesn't define this route by default unless I add it to routes/web.php or use existing one.
      // Jetstream defines it. I should ensure I have it.
      preserveScroll: true,
      onSuccess: () => closeModal(),
      onError: () => passwordRef.current?.focus(),
      onFinish: () => reset(),
    });
  };

  const closeModal = () => {
    setConfirmingLogout(false);
    reset();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 space-y-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <div className="px-4 sm:px-0">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
              Browser Sessions
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage and log out your active sessions on other browsers and
              devices.
            </p>
          </div>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="shadow overflow-hidden sm:rounded-md bg-white dark:bg-gray-800 p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              If necessary, you may log out of all of your other browser
              sessions across all of your devices. Some of your recent sessions
              are listed below; however, this list may not be exhaustive. If you
              feel your account has been compromised, you should also update
              your password.
            </div>

            {/* Sessions List */}
            {sessions.length > 0 && (
              <div className="mt-5 space-y-6">
                {sessions.map((session, i) => (
                  <div key={i} className="flex items-center">
                    <div>
                      {session.agent.is_desktop ? (
                        <Monitor className="w-8 h-8 text-gray-500" />
                      ) : (
                        <Smartphone className="w-8 h-8 text-gray-500" />
                      )}
                    </div>

                    <div className="ml-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {session.agent.platform
                          ? session.agent.platform
                          : "Unknown"}{" "}
                        -{" "}
                        {session.agent.browser
                          ? session.agent.browser
                          : "Unknown"}
                      </div>

                      <div className="text-xs text-gray-500">
                        {session.ip_address},
                        {session.is_current_device ? (
                          <span className="text-green-500 font-semibold ml-1">
                            This device
                          </span>
                        ) : (
                          <span className="ml-1">
                            Last active {session.last_active}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center mt-5">
              <Button onClick={confirmLogout} disabled={processing}>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Log Out Other Browser Sessions
              </Button>

              {recentlySuccessful && (
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
                  Done.
                </span>
              )}
            </div>

            {/* Log Out Confirmation Modal */}
            <Dialog open={confirmingLogout} onOpenChange={setConfirmingLogout}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Out Other Browser Sessions</DialogTitle>
                  <DialogDescription>
                    Please enter your password to confirm you would like to log
                    out of your other browser sessions across all of your
                    devices.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={logoutOtherBrowserSessions}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        ref={passwordRef}
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        placeholder="Password"
                        autoFocus
                      />
                      {errors.password && (
                        <div className="text-sm text-red-600">
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      type="button"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={processing}
                      variant="destructive"
                    >
                      Log Out Other Browser Sessions
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
