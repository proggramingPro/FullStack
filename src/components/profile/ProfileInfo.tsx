import { User, Mail, Phone } from 'lucide-react';
import type { Profile } from '../../types/database';

interface ProfileInfoProps {
  profile: Profile | null;
  email: string;
  userId: string;
  onUpdate: (profile: Profile) => void;
}

export default function ProfileInfo({ profile, email, userId, onUpdate }: ProfileInfoProps) {
  const fullName = profile?.full_name || '';
  const phone = profile?.phone || '';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
      </div>

      <div className="flex items-center space-x-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
          {(fullName || email).charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">
            {fullName || 'Guest User'}
          </h3>
          <p className="text-gray-600">{email}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Full Name
          </label>
          <p className="text-gray-900 text-lg">
            {fullName || <span className="text-gray-400">Not provided</span>}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="w-4 h-4 inline mr-1" />
            Email
          </label>
          <p className="text-gray-900 text-lg">{email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4 inline mr-1" />
            Phone Number
          </label>
          <p className="text-gray-900 text-lg">
            {phone || <span className="text-gray-400">Not provided</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
