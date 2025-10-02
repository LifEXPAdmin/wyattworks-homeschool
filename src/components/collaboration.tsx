"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Share2,
  UserPlus,
  Send,
  Eye,
  Edit,
  Copy,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
} from "lucide-react";
import {
  CollaborationManager,
  type CollaborationSession,
  type CollaborationComment,
} from "@/lib/collaboration";

interface CollaborationPanelProps {
  sessionId: string;
  userId: string;
  userName: string;
  userEmail: string;
  className?: string;
}

export function CollaborationPanel({
  sessionId,
  userId,
  userName,
  className,
}: CollaborationPanelProps) {
  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [comments, setComments] = useState<CollaborationComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("participants");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
    loadComments();
  }, [sessionId]);

  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const loadSession = () => {
    const sessionData = CollaborationManager.getSession(sessionId);
    setSession(sessionData);
  };

  const loadComments = () => {
    const sessionComments = CollaborationManager.getSessionComments(sessionId);
    setComments(sessionComments);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = CollaborationManager.addComment(
      sessionId,
      userId,
      userName,
      newComment,
      "comment"
    );

    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    CollaborationManager.inviteUser(
      sessionId,
      inviteEmail,
      inviteRole,
      userId,
      `You're invited to collaborate on "${session?.title}"`
    );

    setInviteEmail("");
    setShowInviteDialog(false);

    // In a real app, you'd send an email here
    alert(`Invitation sent to ${inviteEmail}`);
  };

  const handleGenerateShareLink = (role: "editor" | "viewer") => {
    const link = CollaborationManager.generateShareLink(sessionId, role);
    setShareLink(link);
    setShowShareDialog(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Link copied to clipboard!");
  };

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getParticipantRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "viewer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!session) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading collaboration session...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Collaboration
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => handleGenerateShareLink("viewer")}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mx-4 mb-4 grid w-full grid-cols-3">
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="participants" className="px-4 pb-4">
              <div className="space-y-3">
                {session.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-medium text-white">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div
                          className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white ${getParticipantStatusColor(
                            participant.status
                          )}`}
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{participant.name}</div>
                        <div className="text-xs text-gray-500">{participant.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-xs ${getParticipantRoleColor(participant.role)}`}>
                        {participant.role}
                      </Badge>
                      {participant.userId === userId && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Voice/Video Controls */}
              <div className="mt-4 rounded-lg bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Media Controls</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isVoiceEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                  >
                    {isVoiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isVideoEnabled ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                  >
                    {isVideoEnabled ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <VideoOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant={isScreenSharing ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                  >
                    {isScreenSharing ? (
                      <Monitor className="h-4 w-4" />
                    ) : (
                      <MonitorOff className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="px-4 pb-4">
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border bg-white p-3">
                    <div className="mb-2 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
                          {comment.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">{comment.userName}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-700">{comment.content}</p>
                    {comment.replies.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="rounded bg-gray-50 p-2">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="text-xs font-medium">{reply.userName}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(reply.createdAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={commentsEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                />
                <Button onClick={handleAddComment} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="px-4 pb-4">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">Session Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Allow anonymous users:</span>
                      <span
                        className={
                          session.settings.allowAnonymous ? "text-green-600" : "text-gray-500"
                        }
                      >
                        {session.settings.allowAnonymous ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Require approval:</span>
                      <span
                        className={
                          session.settings.requireApproval ? "text-green-600" : "text-gray-500"
                        }
                      >
                        {session.settings.requireApproval ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Max participants:</span>
                      <span className="text-gray-700">{session.settings.maxParticipants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto-save:</span>
                      <span
                        className={session.settings.autoSave ? "text-green-600" : "text-gray-500"}
                      >
                        {session.settings.autoSave ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 text-sm font-medium">Share Options</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleGenerateShareLink("viewer")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Generate View-Only Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleGenerateShareLink("editor")}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Generate Edit Link
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this worksheet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="mt-2 flex gap-2">
                <Button
                  variant={inviteRole === "editor" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInviteRole("editor")}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Editor
                </Button>
                <Button
                  variant={inviteRole === "viewer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setInviteRole("viewer")}
                >
                  <Eye className="mr-1 h-4 w-4" />
                  Viewer
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleInviteUser}>Send Invitation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Worksheet</DialogTitle>
            <DialogDescription>
              Copy this link to share the worksheet with others.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Share Link</label>
              <div className="mt-2 flex gap-2">
                <Input value={shareLink} readOnly className="flex-1" />
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(shareLink)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Anyone with this link can access the worksheet.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Collaboration Session List
interface CollaborationSessionListProps {
  userId: string;
  className?: string;
}

export function CollaborationSessionList({ userId, className }: CollaborationSessionListProps) {
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = () => {
    const userSessions = CollaborationManager.getUserSessions(userId);
    setSessions(userSessions);
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Collaboration Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No collaboration sessions found.</div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium">{session.title}</h3>
                    <Badge className={getSessionStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                  </div>
                  <div className="mb-2 text-sm text-gray-600">
                    {session.participants.length} participant(s) • Created{" "}
                    {new Date(session.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Users className="mr-1 h-4 w-4" />
                      Join
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
