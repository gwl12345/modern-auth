import { Link, useForm, usePage } from "@inertiajs/react";
import { FormEventHandler, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function UpdateProfileInformationForm({
  mustVerifyEmail,
  status,
  className = "",
}: {
  mustVerifyEmail: boolean;
  status?: string;
  className?: string;
}) {
  const user = usePage().props.auth.user;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  const {
    data,
    setData,
    post,
    errors,
    processing,
    recentlySuccessful,
    clearErrors,
  } = useForm({
    _method: "PUT",
    name: user.name,
    email: user.email,
    photo: null as File | null,
  });

  const updateProfileInformation: FormEventHandler = (e) => {
    e.preventDefault();

    // Use standard Fortify route
    post(route("user-profile-information.update"), {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => clearPhotoFileInput(),
    });
  };

  const selectNewPhoto = () => {
    photoRef.current?.click();
  };

  const updatePhotoPreview = () => {
    const photo = photoRef.current?.files?.[0];

    if (!photo) return;

    setData("photo", photo);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(photo);
  };

  const deletePhoto = () => {
    // Implement delete photo logic (usually separate route or handled in update)
    // Jetstream uses DELETE /user/profile-photo
    router.delete(route("current-user-photo.destroy"), {
      preserveScroll: true,
      onSuccess: () => {
        setPhotoPreview(null);
        clearPhotoFileInput();
      },
    });
  };

  const clearPhotoFileInput = () => {
    if (photoRef.current) {
      photoRef.current.value = "";
    }
  };

  return (
    <section className={className}>
      <header>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Profile Information
        </h2>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update your account's profile information and email address.
        </p>
      </header>

      <form onSubmit={updateProfileInformation} className="mt-6 space-y-6">
        {/* Profile Photo */}
        <div className="col-span-6 sm:col-span-4">
          {/* File Input */}
          <input
            type="file"
            className="hidden"
            ref={photoRef}
            onChange={updatePhotoPreview}
          />

          <div className="mt-2 text-sm text-gray-500">
            {/* Current Profile Photo */}
            {!photoPreview && (
              <img
                src={user.profile_photo_url}
                alt={user.name}
                className="rounded-full h-20 w-20 object-cover"
              />
            )}

            {/* New Profile Photo Preview */}
            {photoPreview && (
              <span
                className="block rounded-full w-20 h-20 bg-cover bg-no-repeat bg-center"
                style={{
                  backgroundImage: `url('${photoPreview}')`,
                }}
              />
            )}
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={selectNewPhoto}
            >
              Select A New Photo
            </Button>

            {user.profile_photo_path && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={deletePhoto}
                className="text-red-500 hover:text-red-700"
              >
                Remove Photo
              </Button>
            )}
          </div>
          {errors.photo && (
            <div className="text-sm text-red-600 mt-1">{errors.photo}</div>
          )}
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className="mt-1 block w-full"
            value={data.name}
            onChange={(e) => setData("name", e.target.value)}
            required
            autoFocus
            autoComplete="name"
          />
          {errors.name && (
            <div className="text-sm text-red-600 mt-1">{errors.name}</div>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1 block w-full"
            value={data.email}
            onChange={(e) => setData("email", e.target.value)}
            required
            autoComplete="username"
          />
          {errors.email && (
            <div className="text-sm text-red-600 mt-1">{errors.email}</div>
          )}
        </div>

        {mustVerifyEmail && user.email_verified_at === null && (
          <div>
            <p className="text-sm mt-2 text-gray-800 dark:text-gray-200">
              Your email address is unverified.
              <Link
                href={route("verification.send")}
                method="post"
                as="button"
                className="underline text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Click here to re-send the verification email.
              </Link>
            </p>

            {status === "verification-link-sent" && (
              <div className="mt-2 font-medium text-sm text-green-600 dark:text-green-400">
                A new verification link has been sent to your email address.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4">
          <Button disabled={processing} type="submit">
            {processing && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
            Save
          </Button>

          {recentlySuccessful && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Saved.</p>
          )}
        </div>
      </form>
    </section>
  );
}
