import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  X,
  Users,
  Shield,
  ShieldAlert,
  UserMinus,
  UserPlus,
  LogOut,
  Crown,
  Calendar,
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
  const isCreator = (group.createdBy?._id || group.createdBy)?.toString() === currentUserId;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Group Details</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Profile Info */}
        <div className="p-6 text-center border-b border-slate-800/80 bg-slate-950/40">
          <img
            src={group.groupAvatar}
            alt={group.groupName}
            className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-indigo-500/40 object-cover mx-auto shadow-xl shadow-indigo-600/10 mb-3"
          />
          <h2 className="text-xl font-extrabold text-white">{group.groupName}</h2>
          <p className="text-xs text-indigo-400 font-medium mt-0.5">
            Group • {group.participants?.length || 0} participants
          </p>
          {group.groupDescription && (
            <p className="text-xs text-slate-300 bg-slate-900/70 p-3 rounded-xl border border-slate-800/80 mt-3 italic">
              &quot;{group.groupDescription}&quot;
            </p>
          )}
        </div>

        {/* Member List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/50 border border-slate-800/70"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-10 h-10 rounded-xl bg-slate-800 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-white">
                          {member.name} {isMe && '(You)'}
                        </h4>
                        {isMemberCreator && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[9px] font-bold">
                            <Crown className="w-2.5 h-2.5" />
                            Creator
                          </span>
                        )}
                        {!isMemberCreator && isMemberAdmin && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[9px] font-bold">
                            <Shield className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">@{member.username}</p>
                    </div>
                  </div>

                  {/* Admin Actions */}
                  {isCurrentUserAdmin && !isMe && (
                    <div className="flex items-center gap-1">
                      {!isMemberAdmin && (
                        <button
                          onClick={() => handlePromote(memberIdStr)}
                          disabled={loadingAction}
                          title="Make Group Admin"
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs transition-colors cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {!isMemberCreator && (
                        <button
                          onClick={() => handleRemove(memberIdStr)}
                          disabled={loadingAction}
                          title="Remove from group"
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs transition-colors cursor-pointer"
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

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={handleLeave}
            disabled={loadingAction}
            className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loadingAction ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
            <span>Leave Group</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
