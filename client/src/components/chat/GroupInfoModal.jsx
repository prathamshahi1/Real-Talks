import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  X,
  Users,
  Shield,
  UserMinus,
  LogOut,
  Crown,
  Loader2
} from 'lucide-react';

const GroupInfoModal = ({ isOpen, onClose, group }) => {
  const { user } = useAuth();
  const { removeMemberFromGroup, leaveGroup, promoteToAdmin } = useChat();

  const [loadingAction, setLoadingAction] = useState(false);

  if (!isOpen || !group) return null;

  const currentUserId = user?._id?.toString();
  const isCurrentUserAdmin = group.groupAdmin?.some(
    (admin) => (admin._id || admin).toString() === currentUserId
  );

  const handleRemove = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member from the group?')) return;
    setLoadingAction(true);
    try {
      await removeMemberFromGroup(group._id, memberId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePromote = async (memberId) => {
    setLoadingAction(true);
    try {
      await promoteToAdmin(group._id, memberId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to promote to admin');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Are you sure you want to leave this group?')) return;
    setLoadingAction(true);
    try {
      await leaveGroup(group._id);
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to leave group');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#05261b] border-2 border-emerald-200 dark:border-emerald-800/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] transition-colors animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">Group Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-emerald-100/50 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card */}
        <div className="p-5 sm:p-6 text-center border-b border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#03150f]/60">
          <img
            src={group.groupAvatar}
            alt={group.groupName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white dark:bg-emerald-950 border-2 border-emerald-400 object-cover mx-auto shadow-md mb-2.5 sm:mb-3"
          />
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate">{group.groupName}</h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
            Group • {group.participants?.length || 0} participants
          </p>
          {group.groupDescription && (
            <p className="text-xs text-slate-600 dark:text-emerald-200 bg-white dark:bg-[#02130e] p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/80 mt-2.5 sm:mt-3 italic">
              &quot;{group.groupDescription}&quot;
            </p>
          )}
        </div>

        {/* Member List */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-2.5 overscroll-contain">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-emerald-400/80">
            <span>Members ({group.participants?.length})</span>
          </div>

          <div className="space-y-1.5">
            {group.participants?.map((member) => {
              const memberIdStr = (member._id || member).toString();
              const isMemberAdmin = group.groupAdmin?.some(
                (admin) => (admin._id || admin).toString() === memberIdStr
              );
              const isMemberCreator = (group.createdBy?._id || group.createdBy)?.toString() === memberIdStr;
              const isMe = memberIdStr === currentUserId;

              return (
                <div
                  key={memberIdStr}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50/50 dark:bg-[#03150f]/80 border border-emerald-200/80 dark:border-emerald-800/60"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 pr-2">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-emerald-950 object-cover border border-emerald-300 dark:border-emerald-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {member.name} {isMe && '(You)'}
                        </h4>
                        {isMemberCreator && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-300 text-[9px] font-extrabold flex-shrink-0">
                            <Crown className="w-2.5 h-2.5" />
                            Creator
                          </span>
                        )}
                        {!isMemberCreator && isMemberAdmin && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[9px] font-extrabold flex-shrink-0">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">@{member.username}</p>
                    </div>
                  </div>

                  {isCurrentUserAdmin && !isMe && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!isMemberAdmin && (
                        <button
                          onClick={() => handlePromote(memberIdStr)}
                          disabled={loadingAction}
                          title="Make Group Admin"
                          className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700/60 text-xs transition-colors cursor-pointer active:scale-95"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isMemberCreator && (
                        <button
                          onClick={() => handleRemove(memberIdStr)}
                          disabled={loadingAction}
                          title="Remove from group"
                          className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs transition-colors cursor-pointer active:scale-95"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-emerald-100 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-[#03150f]/80">
          <button
            onClick={handleLeave}
            disabled={loadingAction}
            className="w-full py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {loadingAction ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Leave Group Channel</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
