import { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createProfile } from '../lib/profileService';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, verifyEmailOtp, resendVerificationEmail } = useAuth();

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isVerifyingOtp) {
        const emailToVerify = pendingEmail || email;
        const user = await verifyEmailOtp(emailToVerify, otp);
        if (user) {
          try {
            await createProfile(user.id, {
              full_name: fullName || null,
              phone: phone || null,
            });
          } catch (profileError) {
            console.error('Failed to create profile after verification', profileError);
          }
        }
        setSuccess('Email verified successfully! You are now signed in.');
        setTimeout(() => onClose(), 1500);
      } else {
        if (isSignUp) {
          await signUp(email, password, fullName, phone);
          setPendingEmail(email);
          setIsVerifyingOtp(true);
          setResendCooldown(30);
          setSuccess(
            'Account created! We sent a 6-digit verification code to your email. Enter it below to verify your account.'
          );
          setPassword('');
        } else {
          await signIn(email, password);
          setSuccess('Signed in successfully!');
          setTimeout(() => onClose(), 1500);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {isVerifyingOtp
              ? 'Verify Your Email'
              : isSignUp
                ? 'Create Account'
                : 'Welcome Back'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isVerifyingOtp && (
            <>
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Enter your phone number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </>
          )}

          {isVerifyingOtp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Paste the full code from the email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center"
              />
              <p className="mt-2 text-xs text-gray-500">
                We sent a verification code to{' '}
                <span className="font-medium">
                  {pendingEmail || email}
                </span>
                . Paste code here to verify your account.
              </p>
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={async () => {
                  const targetEmail = pendingEmail || email;
                  if (!targetEmail) return;
                  setError('');
                  setSuccess('');
                  try {
                    setLoading(true);
                    await resendVerificationEmail(targetEmail);
                    setSuccess('We sent you a new verification email.');
                    setResendCooldown(30);
                  } catch (err: any) {
                    setError(err.message || 'Failed to resend verification email');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="mt-3 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : 'Resend verification email'}
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Processing...'
              : isVerifyingOtp
                ? 'Verify Email'
                : isSignUp
                  ? 'Sign Up'
                  : 'Sign In'}
          </button>

          {!isVerifyingOtp && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess('');
                  setFullName('');
                  setPhone('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
