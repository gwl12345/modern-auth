import { Head } from "@inertiajs/react";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm"; // Need to create this
import DeleteUserForm from "./Partials/DeleteUserForm"; // Optional

// Simple wrapper assuming you have an AppLayout in your host application
// You might need to adjust the import path based on publication or rely on aliases
// import AppLayout from '@/Layouts/AppLayout';

export default function Edit({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  return (
    <div className="py-12">
      <Head title="Profile" />
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <UpdateProfileInformationForm
            mustVerifyEmail={mustVerifyEmail}
            status={status}
            className="max-w-xl"
          />
        </div>

        <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 shadow sm:rounded-lg">
          <UpdatePasswordForm className="max-w-xl" />
        </div>
      </div>
    </div>
  );
}
