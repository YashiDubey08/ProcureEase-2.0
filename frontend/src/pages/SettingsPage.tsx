import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Trash2, 
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, verifyEmail, resendVerification, changePassword, deleteAccount } = useAuth();

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Email verification states
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [emailNotice, setEmailNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Delete account modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (!currentPassword || !newPassword) {
      setPasswordNotice({ type: 'error', text: 'Please fill in both current and new password.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordNotice({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordNotice({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      await changePassword(currentPassword, newPassword);
      setPasswordNotice({ type: 'success', text: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordNotice({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setVerifyingEmail(true);
      setEmailNotice(null);
      await verifyEmail();
      setEmailNotice({ type: 'success', text: 'Email verified successfully.' });
    } catch (err: any) {
      setEmailNotice({ type: 'error', text: err.message || 'Email verification failed.' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setVerifyingEmail(true);
      setEmailNotice(null);
      await resendVerification();
      setEmailNotice({
        type: 'success',
        text: 'A verification link has been sent to your email.'
      });
    } catch (err: any) {
      setEmailNotice({ type: 'error', text: err.message || 'Failed to resend verification email.' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteConfirmPassword && !user?.is_demo) {
      setDeleteError('Please enter your password to confirm account deletion.');
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);
      await deleteAccount(deleteConfirmPassword);
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const isEmailVerified = user?.email_verified === true;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 sm:p-6 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Manage your credentials, email verification status, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Account Details & Email Verification */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-2xs text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900">Account Details</span>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Unverified
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            <div>
              <span className="text-slate-400 block text-[11px]">Name</span>
              <span className="text-slate-800 font-medium">{user?.name || 'Founder'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Company</span>
              <span className="text-slate-800 font-medium">{user?.company_name || 'My Startup'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Email</span>
              <span className="text-slate-800 font-medium">{user?.email || 'user@example.com'}</span>
            </div>
          </div>

          {emailNotice && (
            <div className={`p-2.5 rounded-lg text-xs font-medium ${
              emailNotice.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {emailNotice.text}
            </div>
          )}

          {!isEmailVerified && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={verifyingEmail}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                {verifyingEmail ? 'Verifying...' : 'Verify Email'}
              </button>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={verifyingEmail}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Resend link
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-4 shadow-2xs text-xs">
          <div className="pb-2 border-b border-slate-100">
            <span className="font-semibold text-slate-900">Change Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-slate-600 font-medium block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {passwordNotice && (
              <div className={`p-2.5 rounded-lg text-xs font-medium ${
                passwordNotice.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {passwordNotice.text}
              </div>
            )}

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone: Account Deletion */}
      <div className="bg-white border border-rose-200/80 rounded-xl p-5 shadow-2xs text-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-rose-900 block">Delete Account</span>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Permanently delete your profile, roadmap progress, and stored documents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setShowDeleteModal(true); setDeleteError(null); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium text-xs transition-colors self-start sm:self-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full p-5 space-y-4 shadow-lg">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-semibold text-slate-900">Confirm Account Deletion</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              This action cannot be undone. All your startup profile data, roadmap progress, and uploaded documents will be permanently removed.
            </p>

            <form onSubmit={handleDeleteAccount} className="space-y-3 text-xs">
              {!user?.is_demo && (
                <div>
                  <label className="text-slate-600 font-medium block mb-1">
                    Enter your password to confirm
                  </label>
                  <input
                    type="password"
                    placeholder="Current password"
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              {deleteError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
