export interface CollaborationSession {
  id: string;
  worksheetId: string;
  title: string;
  participants: CollaborationParticipant[];
  permissions: CollaborationPermissions;
  status: "active" | "paused" | "completed";
  createdAt: Date;
  updatedAt: Date;
  settings: CollaborationSettings;
}

export interface CollaborationParticipant {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: "owner" | "editor" | "viewer";
  status: "online" | "offline" | "away";
  lastSeen: Date;
  cursor?: {
    x: number;
    y: number;
    elementId?: string;
  };
  avatar?: string;
}

export interface CollaborationPermissions {
  canEdit: boolean;
  canComment: boolean;
  canInvite: boolean;
  canExport: boolean;
  canDelete: boolean;
}

export interface CollaborationSettings {
  allowAnonymous: boolean;
  requireApproval: boolean;
  maxParticipants: number;
  enableChat: boolean;
  enableVoice: boolean;
  enableScreenShare: boolean;
  autoSave: boolean;
  saveInterval: number; // seconds
}

export interface CollaborationComment {
  id: string;
  sessionId: string;
  elementId?: string;
  userId: string;
  userName: string;
  content: string;
  type: "comment" | "suggestion" | "question";
  status: "active" | "resolved" | "archived";
  position?: {
    x: number;
    y: number;
  };
  replies: CollaborationReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CollaborationReply {
  id: string;
  commentId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface CollaborationChange {
  id: string;
  sessionId: string;
  userId: string;
  type: "add" | "edit" | "delete" | "move" | "style";
  elementId: string;
  data: unknown;
  timestamp: Date;
  version: number;
}

export interface CollaborationInvitation {
  id: string;
  sessionId: string;
  email: string;
  role: "editor" | "viewer";
  status: "pending" | "accepted" | "declined" | "expired";
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface CollaborationActivity {
  id: string;
  sessionId: string;
  userId: string;
  userName: string;
  type: "join" | "leave" | "edit" | "comment" | "invite" | "permission_change";
  description: string;
  metadata?: unknown;
  timestamp: Date;
}

// Collaboration Manager
export class CollaborationManager {
  private static readonly STORAGE_KEY = "astra-academy-collaboration";
  private static readonly SESSIONS_KEY = "astra-academy-collaboration-sessions";
  private static readonly COMMENTS_KEY = "astra-academy-collaboration-comments";
  private static readonly INVITATIONS_KEY = "astra-academy-collaboration-invitations";

  // Create collaboration session
  static createSession(
    worksheetId: string,
    title: string,
    ownerId: string,
    ownerName: string,
    ownerEmail: string,
    settings?: Partial<CollaborationSettings>
  ): CollaborationSession {
    const session: CollaborationSession = {
      id: `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      worksheetId,
      title,
      participants: [
        {
          id: `participant-${Date.now()}`,
          userId: ownerId,
          name: ownerName,
          email: ownerEmail,
          role: "owner",
          status: "online",
          lastSeen: new Date(),
        },
      ],
      permissions: {
        canEdit: true,
        canComment: true,
        canInvite: true,
        canExport: true,
        canDelete: true,
      },
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        allowAnonymous: false,
        requireApproval: true,
        maxParticipants: 10,
        enableChat: true,
        enableVoice: false,
        enableScreenShare: false,
        autoSave: true,
        saveInterval: 30,
        ...settings,
      },
    };

    this.saveSession(session);
    return session;
  }

  // Save collaboration session
  static saveSession(session: CollaborationSession): void {
    if (typeof window === "undefined") return;

    const sessions = this.loadSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  // Load collaboration sessions
  static loadSessions(): CollaborationSession[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.SESSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Get session by ID
  static getSession(sessionId: string): CollaborationSession | null {
    const sessions = this.loadSessions();
    return sessions.find((s) => s.id === sessionId) || null;
  }

  // Join session
  static joinSession(
    sessionId: string,
    userId: string,
    userName: string,
    userEmail: string,
    role: "editor" | "viewer" = "viewer"
  ): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    // Check if user is already in session
    const existingParticipant = session.participants.find((p) => p.userId === userId);
    if (existingParticipant) {
      existingParticipant.status = "online";
      existingParticipant.lastSeen = new Date();
      this.saveSession(session);
      return true;
    }

    // Check participant limit
    if (session.participants.length >= session.settings.maxParticipants) {
      return false;
    }

    // Add new participant
    const participant: CollaborationParticipant = {
      id: `participant-${Date.now()}`,
      userId,
      name: userName,
      email: userEmail,
      role,
      status: "online",
      lastSeen: new Date(),
    };

    session.participants.push(participant);
    session.updatedAt = new Date();
    this.saveSession(session);

    // Log activity
    this.logActivity(sessionId, userId, userName, "join", `${userName} joined the session`);

    return true;
  }

  // Leave session
  static leaveSession(sessionId: string, userId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const participantIndex = session.participants.findIndex((p) => p.userId === userId);
    if (participantIndex === -1) return false;

    const participant = session.participants[participantIndex];
    participant.status = "offline";
    participant.lastSeen = new Date();

    // If owner leaves, transfer ownership or close session
    if (participant.role === "owner") {
      const otherParticipants = session.participants.filter((p) => p.userId !== userId);
      if (otherParticipants.length > 0) {
        // Transfer ownership to first editor, or first participant
        const newOwner = otherParticipants.find((p) => p.role === "editor") || otherParticipants[0];
        newOwner.role = "owner";
      } else {
        // Close session if no other participants
        session.status = "completed";
      }
    }

    session.updatedAt = new Date();
    this.saveSession(session);

    // Log activity
    this.logActivity(
      sessionId,
      userId,
      participant.name,
      "leave",
      `${participant.name} left the session`
    );

    return true;
  }

  // Add comment
  static addComment(
    sessionId: string,
    userId: string,
    userName: string,
    content: string,
    type: "comment" | "suggestion" | "question" = "comment",
    elementId?: string,
    position?: { x: number; y: number }
  ): CollaborationComment {
    const comment: CollaborationComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      elementId,
      userId,
      userName,
      content,
      type,
      status: "active",
      position,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.saveComment(comment);
    this.logActivity(sessionId, userId, userName, "comment", `${userName} added a ${type}`);

    return comment;
  }

  // Save comment
  static saveComment(comment: CollaborationComment): void {
    if (typeof window === "undefined") return;

    const comments = this.loadComments();
    const existingIndex = comments.findIndex((c) => c.id === comment.id);

    if (existingIndex >= 0) {
      comments[existingIndex] = comment;
    } else {
      comments.push(comment);
    }

    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(comments));
  }

  // Load comments
  static loadComments(): CollaborationComment[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.COMMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Get comments for session
  static getSessionComments(sessionId: string): CollaborationComment[] {
    const comments = this.loadComments();
    return comments.filter((c) => c.sessionId === sessionId);
  }

  // Add reply to comment
  static addReply(
    commentId: string,
    userId: string,
    userName: string,
    content: string
  ): CollaborationReply {
    const reply: CollaborationReply = {
      id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      commentId,
      userId,
      userName,
      content,
      createdAt: new Date(),
    };

    const comments = this.loadComments();
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      comment.replies.push(reply);
      comment.updatedAt = new Date();
      this.saveComment(comment);
    }

    return reply;
  }

  // Invite user to session
  static inviteUser(
    sessionId: string,
    email: string,
    role: "editor" | "viewer",
    invitedBy: string,
    message?: string
  ): CollaborationInvitation {
    const invitation: CollaborationInvitation = {
      id: `invitation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      email,
      role,
      status: "pending",
      invitedBy,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      message,
    };

    this.saveInvitation(invitation);
    this.logActivity(sessionId, invitedBy, "System", "invite", `Invitation sent to ${email}`);

    return invitation;
  }

  // Save invitation
  static saveInvitation(invitation: CollaborationInvitation): void {
    if (typeof window === "undefined") return;

    const invitations = this.loadInvitations();
    const existingIndex = invitations.findIndex((i) => i.id === invitation.id);

    if (existingIndex >= 0) {
      invitations[existingIndex] = invitation;
    } else {
      invitations.push(invitation);
    }

    localStorage.setItem(this.INVITATIONS_KEY, JSON.stringify(invitations));
  }

  // Load invitations
  static loadInvitations(): CollaborationInvitation[] {
    if (typeof window === "undefined") return [];

    const stored = localStorage.getItem(this.INVITATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  // Accept invitation
  static acceptInvitation(
    invitationId: string,
    userId: string,
    userName: string,
    userEmail: string
  ): boolean {
    const invitations = this.loadInvitations();
    const invitation = invitations.find((i) => i.id === invitationId);

    if (!invitation || invitation.status !== "pending" || invitation.expiresAt < new Date()) {
      return false;
    }

    // Join the session
    const success = this.joinSession(
      invitation.sessionId,
      userId,
      userName,
      userEmail,
      invitation.role
    );

    if (success) {
      invitation.status = "accepted";
      this.saveInvitation(invitation);
    }

    return success;
  }

  // Log activity
  static logActivity(
    _sessionId: string,
    userId: string,
    userName: string,
    type: CollaborationActivity["type"],
    description: string,
    metadata?: unknown
  ): void {
    const activity: CollaborationActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sessionId: _sessionId,
      userId,
      userName,
      type,
      description,
      metadata,
      timestamp: new Date(),
    };

    // In a real app, this would be sent to a server
    console.log("Collaboration activity:", activity);
  }

  // Get session activities (mock implementation)
  static getSessionActivities(sessionId: string): CollaborationActivity[] {
    // In a real app, this would fetch from a server
    return [];
  }

  // Update participant cursor
  static updateCursor(
    sessionId: string,
    userId: string,
    cursor: { x: number; y: number; elementId?: string }
  ): void {
    const session = this.getSession(sessionId);
    if (!session) return;

    const participant = session.participants.find((p) => p.userId === userId);
    if (participant) {
      participant.cursor = cursor;
      participant.lastSeen = new Date();
      this.saveSession(session);
    }
  }

  // Delete session
  static deleteSession(sessionId: string, userId: string): boolean {
    const session = this.getSession(sessionId);
    if (!session) return false;

    const participant = session.participants.find((p) => p.userId === userId);
    if (!participant || participant.role !== "owner") return false;

    const sessions = this.loadSessions();
    const filtered = sessions.filter((s) => s.id !== sessionId);
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(filtered));

    // Clean up related data
    const comments = this.loadComments();
    const filteredComments = comments.filter((c) => c.sessionId !== sessionId);
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(filteredComments));

    return true;
  }

  // Generate share link
  static generateShareLink(sessionId: string, role: "editor" | "viewer" = "viewer"): string {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/collaborate/${sessionId}?role=${role}`;
  }

  // Get user sessions
  static getUserSessions(userId: string): CollaborationSession[] {
    const sessions = this.loadSessions();
    return sessions.filter((s) => s.participants.some((p) => p.userId === userId));
  }

  // Get user invitations
  static getUserInvitations(email: string): CollaborationInvitation[] {
    const invitations = this.loadInvitations();
    return invitations.filter((i) => i.email === email && i.status === "pending");
  }
}
