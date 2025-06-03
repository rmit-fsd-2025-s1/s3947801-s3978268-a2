import { User } from "../types/types";

interface ProfileInfoCardProps {
  user: User;
}

export default function ProfileInfoCard({
  user,
}: ProfileInfoCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mb-8">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Profile Information
      </h2>
      <div className="space-y-2">
        <p className="text-black">
          <span className="font-medium">Email:</span> {user.email}
        </p>
        <p className="text-black">
          <span className="font-medium">Account Type:</span> {user.accountType}
        </p>
        <p className="text-black">
          <span className="font-medium">Date Joined:</span> {user.date_joined}
        </p>
      </div>
    </div>
  );
}