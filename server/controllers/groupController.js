import Conversation from '../models/Conversation.js';
import User from '../models/User.js';

/**
 * @desc    Create a new group conversation
 * @route   POST /api/groups
 * @access  Private
 */
export const createGroup = async (req, res) => {
  try {
    const { groupName, groupDescription, groupAvatar, participants } = req.body;
    const currentUserId = req.user._id;

    if (!groupName || !groupName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required.',
      });
    }

    if (!participants || !Array.isArray(participants) || participants.length < 1) {
      return res.status(400).json({
        success: false,
        message: 'A group requires at least 1 other member besides yourself.',
      });
    }

    // Ensure current user is in participants list without duplicates
    const allParticipantIds = Array.from(
      new Set([currentUserId.toString(), ...participants.map((p) => p.toString())])
    );

    // Default avatar generation if none provided
    const avatar =
      groupAvatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(groupName.trim())}`;

    // Initialize unread counts map
    const unreadMap = new Map();
    allParticipantIds.forEach((id) => unreadMap.set(id, 0));

    const newGroup = await Conversation.create({
      type: 'group',
      groupName: groupName.trim(),
      groupDescription: groupDescription?.trim() || '',
      groupAvatar: avatar,
      participants: allParticipantIds,
      groupAdmin: [currentUserId],
      createdBy: currentUserId,
      unreadCounts: unreadMap,
    });

    const populatedGroup = await Conversation.findById(newGroup._id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    res.status(201).json({
      success: true,
      message: 'Group created successfully!',
      group: populatedGroup,
    });
  } catch (error) {
    console.error('Create Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create group: ' + error.message,
    });
  }
};

/**
 * @desc    Get full group details by ID
 * @route   GET /api/groups/:id
 * @access  Private
 */
export const getGroupDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const group = await Conversation.findOne({
      _id: id,
      type: 'group',
      participants: userId,
    })
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found or you are not a member.',
      });
    }

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    console.error('Get Group Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch group details: ' + error.message,
    });
  }
};

/**
 * @desc    Add members to a group
 * @route   POST /api/groups/:id/members
 * @access  Private (Admin only)
 */
export const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;
    const currentUserId = req.user._id;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid user IDs to add.',
      });
    }

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.',
      });
    }

    // Authorization: Must be an admin to add members
    const isAdmin = group.groupAdmin.some(
      (adminId) => adminId.toString() === currentUserId.toString()
    );
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can add new members.',
      });
    }

    // Add new members
    memberIds.forEach((newMemberId) => {
      const idStr = newMemberId.toString();
      if (!group.participants.some((p) => p.toString() === idStr)) {
        group.participants.push(newMemberId);
        group.unreadCounts?.set(idStr, 0);
      }
    });

    await group.save();

    const updatedGroup = await Conversation.findById(id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Members added successfully.',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Add Members Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add members: ' + error.message,
    });
  }
};

/**
 * @desc    Remove a member from a group
 * @route   DELETE /api/groups/:id/members/:memberId
 * @access  Private (Admin only)
 */
export const removeMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const currentUserId = req.user._id;

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.',
      });
    }

    // Authorization: Must be admin
    const isAdmin = group.groupAdmin.some(
      (adminId) => adminId.toString() === currentUserId.toString()
    );
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can remove members.',
      });
    }

    // Cannot remove the group creator
    if (group.createdBy && group.createdBy.toString() === memberId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'The group creator cannot be removed from the group.',
      });
    }

    // Remove from participants and admin list
    group.participants = group.participants.filter(
      (p) => p.toString() !== memberId.toString()
    );
    group.groupAdmin = group.groupAdmin.filter(
      (a) => a.toString() !== memberId.toString()
    );

    await group.save();

    const updatedGroup = await Conversation.findById(id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully.',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Remove Member Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove member: ' + error.message,
    });
  }
};

/**
 * @desc    Leave a group
 * @route   POST /api/groups/:id/leave
 * @access  Private
 */
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.',
      });
    }

    // Filter out current user
    group.participants = group.participants.filter(
      (p) => p.toString() !== currentUserId.toString()
    );
    group.groupAdmin = group.groupAdmin.filter(
      (a) => a.toString() !== currentUserId.toString()
    );

    // If no participants left, delete the group
    if (group.participants.length === 0) {
      await Conversation.findByIdAndDelete(id);
      return res.status(200).json({
        success: true,
        message: 'You left the group. The empty group was deleted.',
      });
    }

    // If no admins left, promote the next remaining participant to admin
    if (group.groupAdmin.length === 0 && group.participants.length > 0) {
      group.groupAdmin.push(group.participants[0]);
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: 'You have left the group.',
    });
  } catch (error) {
    console.error('Leave Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave group: ' + error.message,
    });
  }
};

/**
 * @desc    Promote a member to group admin
 * @route   POST /api/groups/:id/admins/:memberId
 * @access  Private (Admin only)
 */
export const promoteToAdmin = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const currentUserId = req.user._id;

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.',
      });
    }

    // Verify requesting user is an admin
    const isCurrentAdmin = group.groupAdmin.some(
      (a) => a.toString() === currentUserId.toString()
    );
    if (!isCurrentAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only admins can promote other members to admin.',
      });
    }

    // Verify target user is in participants
    const isParticipant = group.participants.some(
      (p) => p.toString() === memberId.toString()
    );
    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Target user is not a member of this group.',
      });
    }

    // Add to admin list if not already
    if (!group.groupAdmin.some((a) => a.toString() === memberId.toString())) {
      group.groupAdmin.push(memberId);
      await group.save();
    }

    const updatedGroup = await Conversation.findById(id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Member promoted to admin.',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Promote Admin Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to promote member: ' + error.message,
    });
  }
};

/**
 * @desc    Update group name, description, or avatar
 * @route   PUT /api/groups/:id
 * @access  Private (Admin only)
 */
export const updateGroupProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, groupDescription, groupAvatar } = req.body;
    const currentUserId = req.user._id;

    const group = await Conversation.findOne({ _id: id, type: 'group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found.',
      });
    }

    const isAdmin = group.groupAdmin.some(
      (a) => a.toString() === currentUserId.toString()
    );
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Only group admins can update group settings.',
      });
    }

    if (groupName && groupName.trim()) group.groupName = groupName.trim();
    if (groupDescription !== undefined) group.groupDescription = groupDescription.trim();
    if (groupAvatar && groupAvatar.trim()) group.groupAvatar = groupAvatar.trim();

    await group.save();

    const updatedGroup = await Conversation.findById(id)
      .populate('participants', 'name username avatar bio isOnline lastSeen privacy')
      .populate('groupAdmin', 'name username avatar')
      .populate('createdBy', 'name username avatar');

    res.status(200).json({
      success: true,
      message: 'Group settings updated successfully.',
      group: updatedGroup,
    });
  } catch (error) {
    console.error('Update Group Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update group: ' + error.message,
    });
  }
};
