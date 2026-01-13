import React, { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Calendar,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  Reply,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Send,
  MailOpen,
  Star,
  StarOff,
  Download,
  Printer,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Wrench,
  DollarSign,
  Heart,
  Handshake,
  HelpCircle,
  AlertTriangle,
  Info,
  Home,
  Printer as PrinterIcon,
  GraduationCap,
  Settings,
  Tag,
  AlertCircle,
  Users,
  Shield,
  FileWarningIcon,
  Bell,
  Notification,
  Inbox
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  Timestamp,
  orderBy,
  deleteDoc,
  getDoc
} from "../../firebase/firebase_config";
import { ContactMessage, MessageType} from '../../types/message';


// Message type configurations (matching Contact.tsx)
const MESSAGE_TYPES = [
  {
    id: 'workshop_booking' as MessageType,
    label: 'Workshop/Seminar Booking',
    icon: Calendar,
    color: 'bg-blue-500',
  },
  {
    id: 'space_rental' as MessageType,
    label: 'Space/Studio Rental',
    icon: Home,
    color: 'bg-green-500',
  },
  {
    id: '3d_printing' as MessageType,
    label: '3D Printing Service',
    icon: PrinterIcon,
    color: 'bg-purple-500',
  },
  {
    id: 'technical_support' as MessageType,
    label: 'Technical Support',
    icon: Wrench,
    color: 'bg-orange-500',
  },
  {
    id: 'training' as MessageType,
    label: 'Training Request',
    icon: GraduationCap,
    color: 'bg-indigo-500',
  },
  {
    id: 'maintenance' as MessageType,
    label: 'Equipment Maintenance',
    icon: Settings,
    color: 'bg-red-500',
  },
  {
    id: 'partnership' as MessageType,
    label: 'Partnership/Corporate',
    icon: Handshake,
    color: 'bg-teal-500',
  },
  {
    id: 'general_inquiry' as MessageType,
    label: 'General Inquiry',
    icon: HelpCircle,
    color: 'bg-gray-500',
  },
  {
    id: 'feedback' as MessageType,
    label: 'Feedback/Suggestions',
    icon: Heart,
    color: 'bg-pink-500',
  },
  {
    id: 'billing' as MessageType,
    label: 'Billing/Payment',
    icon: DollarSign,
    color: 'bg-yellow-500',
  },
  {
    id: 'urgent_support' as MessageType,
    label: 'Urgent Support',
    icon: AlertTriangle,
    color: 'bg-red-600',
  }
];

// Reply form component
interface ReplyFormProps {
  message: ContactMessage;
  onSendReply: (messageId: string, replyText: string) => Promise<void>;
  onCancel: () => void;
}

function ReplyForm({ message, onSendReply, onCancel }: ReplyFormProps) {
  const [replyText, setReplyText] = useState("");
  const [adminNotes, setAdminNotes] = useState(message.admin_notes || "");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    setIsSending(true);
    
    try {
      await onSendReply(message.id, replyText);
      toast.success("Notification sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send notification");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Send Notification</h2>
              <p className="text-sm text-muted-foreground">
                Sending to: {message.name} ({message.email})
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              disabled={isSending}
              title="onCancel"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Original Message Preview */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{message.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(message.created_at.toDate(), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-3 h-3" />
                <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                  {message.message_type_label}
                </span>
              </div>
              <p className="text-sm font-medium mb-1">{message.subject}</p>
              <p className="text-sm">{message.message}</p>
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Notification Message *
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                  placeholder="Type your notification message here..."
                  required
                  disabled={isSending}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  This message will be sent as a notification to the user
                </p>
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-lg"
                  placeholder="Add internal notes about this conversation..."
                  disabled={isSending}
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-input rounded-lg font-medium hover:bg-muted transition-colors"
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Message detail view component
interface MessageDetailProps {
  message: ContactMessage;
  onClose: () => void;
  onStatusChange: (messageId: string, status: ContactMessage["status"]) => Promise<void>;
  onToggleImportant: (messageId: string) => Promise<void>;
  onReply: () => void;
  onDelete: (messageId: string) => Promise<void>;
}

function MessageDetail({ 
  message, 
  onClose, 
  onStatusChange, 
  onToggleImportant,
  onReply,
  onDelete
}: MessageDetailProps) {
  const [adminNotes, setAdminNotes] = useState(message.admin_notes || "");
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const messageType = MESSAGE_TYPES.find(t => t.id === message.message_type);
  const MessageTypeIcon = messageType?.icon || HelpCircle;

  const saveAdminNotes = async () => {
    if (!adminNotes.trim() && !message.admin_notes) return;
    
    setIsSavingNotes(true);
    try {
      const messageRef = doc(db, 'contact_messages', message.id);
      await updateDoc(messageRef, {
        admin_notes: adminNotes.trim() || null
      });
      toast.success("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
      toast.error("Failed to save notes");
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(message.id);
      onClose();
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  return (
    <>
      <div className="fixed pt-30 inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-12">
        <div className="bg-background rounded-2xl shadow-2xl w-full max-w-4xl h-180  overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    message.status === 'new' ? 'bg-red-500/10 text-red-600' :
                    message.status === 'read' ? 'bg-blue-500/10 text-blue-600' :
                    message.status === 'replied' ? 'bg-green-500/10 text-green-600' :
                    'bg-gray-500/10 text-gray-600'
                  }`}>
                    {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                  </div>
                  <button
                    onClick={() => onToggleImportant(message.id)}
                    className="p-1 hover:bg-muted rounded"
                  >
                    {message.isImportant ? (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <h2 className="text-2xl font-bold">{message.subject}</h2>
                <p className="text-sm text-muted-foreground">
                  From {message.name} • {format(message.created_at.toDate(), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                title="onClose"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Message Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Sender Information */}
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Sender Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Name</div>
                        <div className="font-medium">{message.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Mail className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Email</div>
                        <div className="font-medium">{message.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Phone className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Phone</div>
                        <div className="font-medium">{message.phone_number || "Not provided"}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Type  */}
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Message Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Type</div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${messageType?.color}`}></div>
                        <span className="font-medium">{message.message_type_label}</span>
                      </div>
                    </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Category</div>
                      <div className="font-medium capitalize">{message.category}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Message ID</div>
                      <div className="font-mono text-sm">{message.message_id.substring(0, 8)}</div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-card border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Message Content</h3>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded" title="Print">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.message}</p>
                  </div>
                </div>

                {/* Notification History */}
                {message.reply_history && message.reply_history.length > 0 && (
                  <div className="bg-card border rounded-xl p-6">
                    <h3 className="font-medium mb-4">Notification History</h3>
                    <div className="space-y-4">
                      {message.reply_history.map((reply) => (
                        <div key={reply.id} className="border-l-4 border-primary pl-4 py-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{reply.admin_name || reply.admin_email}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(reply.timestamp.toDate(), "MMM d, yyyy 'at' h:mm a")}
                            </span>
                          </div>
                          <p className="text-sm">{reply.reply_message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              Sent as notification
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={onReply}
                      className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Send Notification
                    </button>
                    
                    <button
                      onClick={() => onStatusChange(message.id, message.status === 'read' ? 'new' : 'read')}
                      className="w-full px-4 py-3 border border-input rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      {message.status === 'read' ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Mark as Unread
                        </>
                      ) : (
                        <>
                          <MailOpen className="w-4 h-4" />
                          Mark as Read
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onStatusChange(message.id, 'closed')}
                      className="w-full px-4 py-3 border border-input rounded-lg font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark as Closed
                    </button>
                  </div>
                </div>

                {/* Status Management */}
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Change Status</h3>
                  <div className="space-y-2">
                    {(['new', 'read', 'replied', 'closed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => onStatusChange(message.id, status)}
                        className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors text-left ${
                          message.status === status
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="bg-card border rounded-xl p-6">
                  <h3 className="font-medium mb-4">Admin Notes</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-input rounded-lg text-sm mb-3"
                    placeholder="Add notes about this message..."
                  />
                  <button
                    onClick={saveAdminNotes}
                    disabled={isSavingNotes}
                    className="w-full px-3 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSavingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-card border border-red-500 rounded-xl p-6">
                  <div className="flex ">
                  <FileWarningIcon className="w-8 h-8 text-red-500"/>
                  <h3 className="font-high text-red-500 mb-4">Danger Zone</h3>
                  </div>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full px-4 py-3 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-6 h-6 text-red-500" />
                    Delete Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl border-2 shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg text-red-500 font-semibold">Delete Message</h3>
                  <p className="text-sm text-orange-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this message from {message.name}? All replies and notes will be permanently removed.
              </p>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border  rounded-lg font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Main Messages Management Component
export default function MessagesManagementPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [sortBy, setSortBy] = useState<"date" | "priority" | "type">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adminName, setAdminName] = useState("Admin User");

  // Load messages from Firebase
  useEffect(() => {
    fetchMessages();
    
    // Get admin name from auth
    const user = auth.currentUser;
    if (user) {
      setAdminName(user.displayName || user.email?.split('@')[0] || 'Admin');
    }
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const messagesRef = collection(db, 'contact_messages');
      let q = query(messagesRef);
      
      // Apply sorting
      if (sortBy === 'date') {
        q = query(messagesRef, orderBy('created_at', sortOrder === 'desc' ? 'desc' : 'asc'));
      } else if (sortBy === 'priority') {
        q = query(messagesRef, orderBy('priority', sortOrder === 'desc' ? 'desc' : 'asc'));
      }
      
      const querySnapshot = await getDocs(q);
      
      const messagesList: ContactMessage[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messagesList.push({ 
          id: doc.id, 
          ...data,
          created_at: data.created_at || Timestamp.now(),
          replied_at: data.replied_at || null,
          isImportant: data.isImportant || false,
          admin_notes: data.admin_notes || '',
          reply_history: data.reply_history || []
        } as ContactMessage);
      });
      
      setMessages(messagesList);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort messages
  const filteredMessages = messages
    .filter(message => {
      // Search filter
      if (searchTerm && !(
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      )) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && message.status !== statusFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== "all" && message.message_type !== typeFilter) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "date":
          comparison = b.created_at.toMillis() - a.created_at.toMillis();
          break;
        case "priority":
          const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
          break;
        case "type":
          comparison = a.message_type.localeCompare(b.message_type);
          break;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

  // Handle status change
  const handleStatusChange = async (messageId: string, status: ContactMessage["status"]) => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, { status });
      
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null);
      }
      
      toast.success(`Message marked as ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  // Handle toggle important
  const handleToggleImportant = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const newImportantStatus = !message.isImportant;
    
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, { isImportant: newImportantStatus });
      
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, isImportant: newImportantStatus } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, isImportant: newImportantStatus } : null);
      }
      
      toast.success(newImportantStatus ? "Marked as important" : "Removed from important");
    } catch (error) {
      console.error("Error updating important status:", error);
      toast.error("Failed to update");
    }
  };

  // Create notification log in notification_logs collection
  const createNotificationLog = async (message: ContactMessage, replyText: string) => {
    try {
      // Generate a notification ID similar to booking_id format
      const generateId = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 20; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      };

      // Create notification log document in notification_logs collection
      const notificationsRef = collection(db, 'notification_logs');
      await addDoc(notificationsRef, {
        booking_id: generateId(), // Generate a unique ID
        created_at: Timestamp.now(),
        is_sent: true,
        message: `Reply to your message "${message.subject}": ${replyText}`,
        sent_via: "system", // Changed from "both" to "system" for system-generated notifications
        status_after: "replied",
        status_before: message.status,
        type: "message_reply",
        user_email: message.email,
        user_id: message.userId || 'anonymous' // You might want to link messages to user accounts
      });
    } catch (error) {
      console.error("Error creating notification log:", error);
      throw error;
    }
  };

  // Handle send reply as notification
  const handleSendReply = async (messageId: string, replyText: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) throw new Error("Message not found");

      const user = auth.currentUser;
      const adminEmail = user?.email || "admin@enspy.com";
      
      // Create notification log
      await createNotificationLog(message, replyText);

      // Create reply history entry
      const replyEntry = {
        id: Date.now().toString(),
        admin_email: adminEmail,
        admin_name: adminName,
        reply_message: replyText,
        timestamp: Timestamp.now()
      };

      // Update message in contact_messages
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, {
        status: 'replied',
        reply_message: replyText,
        replied_at: Timestamp.now(),
        reply_history: [...(message.reply_history || []), replyEntry]
      });

      // Update local state
      setMessages(prev => prev.map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            status: 'replied',
            reply_message: replyText,
            replied_at: Timestamp.now(),
            reply_history: [...(msg.reply_history || []), replyEntry]
          };
        }
        return msg;
      }));

      toast.success(`Notification sent to ${message.name}`);
      setShowReplyForm(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Failed to send notification");
      throw error;
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await deleteDoc(messageRef);
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setSelectedMessages(prev => prev.filter(id => id !== messageId));
      
      toast.success("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
      throw error;
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: "read" | "unread" | "archive" | "delete" | "close") => {
    if (selectedMessages.length === 0) {
      toast.error("No messages selected");
      return;
    }

    try {
      const updates = selectedMessages.map(async (messageId) => {
        const messageRef = doc(db, 'contact_messages', messageId);
        
        switch (action) {
          case "read":
            return updateDoc(messageRef, { status: 'read' });
          case "unread":
            return updateDoc(messageRef, { status: 'new' });
          case "close":
            return updateDoc(messageRef, { status: 'closed' });
          case "delete":
            return deleteDoc(messageRef);
          default:
            return Promise.resolve();
        }
      });

      await Promise.all(updates);
      
      // Update local state
      if (action === 'delete') {
        setMessages(prev => prev.filter(msg => !selectedMessages.includes(msg.id)));
      } else {
        const newStatus = action === 'read' ? 'read' : action === 'unread' ? 'new' : 'closed';
        setMessages(prev => prev.map(msg =>
          selectedMessages.includes(msg.id) ? { ...msg, status: newStatus } : msg
        ));
      }
      
      setSelectedMessages([]);
      toast.success(`${selectedMessages.length} messages updated`);
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast.error("Failed to update messages");
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg.id));
    }
  };

  // Statistics
  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    unread: messages.filter(m => m.status === 'new' || m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    closed: messages.filter(m => m.status === 'closed').length,
    important: messages.filter(m => m.isImportant).length,
  };

  // Refresh messages
  const refreshMessages = () => {
    fetchMessages();
    toast.success("Messages refreshed");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="  py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold mb-4">Messages Management</h1>
              <p className="text-md">
                Manage contact form messages, send notifications, and track conversations
              </p>
            </div>
            <button
              onClick={refreshMessages}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          {[
            { label: "Total", value: stats.total, color: "bg-", icon: Mail },
            { label: "New", value: stats.new, color: "bg-", icon: MailOpen },
            { label: "Unread", value: stats.unread, color: "bg-", icon: Eye },
            { label: "Replied", value: stats.replied, color: "bg-", icon: Bell },
            { label: "Closed", value: stats.closed, color: "bg-", icon: CheckCircle },
            { label: "Important", value: stats.important, color: "bg-0", icon: Star },
          ].map((stat, index) => (
            <div key={index} className="bg-card border rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`w-10 h-10 ${stat.color} rounded-full flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 ">
              <div className="relative ">
                <Search className="absolute   top-1/2 transform -translate-y-1/2 w-8 h-6 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search messages by name, email, subject, or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border  rounded-lg bg-background"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-input rounded-lg bg-background"
                title="statusfilter"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 border border-2 rounded-lg bg-background"
                title="typefilter"
              >
                <option value="all">All Types</option>
                {MESSAGE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>

            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between">
            {/* Sort Controls */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-input rounded-lg bg-background"
                title="sortby"
              >
                <option value="date">Sort by Date</option>
                <option value="type">Sort by Type</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedMessages.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  {selectedMessages.length} message(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkAction("read")}
                    className="px-3 py-1 text-sm border border-input rounded hover:bg-muted"
                  >
                    Mark as Read
                  </button>
                  <button
                    onClick={() => handleBulkAction("unread")}
                    className="px-3 py-1 text-sm border border-input rounded hover:bg-muted"
                  >
                    Mark as Unread
                  </button>
                  <button
                    onClick={() => handleBulkAction("close")}
                    className="px-3 py-1 text-sm border border-input rounded hover:bg-muted"
                  >
                    Mark as Closed
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-3 py-1 text-sm border border-input text-red-600 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelectedMessages([])}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Messages Table */}
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-4 px-6 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-input"
                      title="checkbox"
                    />
                  </th>
                  <th className="py-4 px-6 text-left font-medium">Sender</th>
                  <th className="py-4 px-6 text-left font-medium">Subject & Type</th>
                  <th className="py-4 px-6 text-left font-medium">Status</th>
                  <th className="py-4 px-6 text-left font-medium">Date</th>
                  <th className="py-4 px-6 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
                        <p className="text-muted-foreground">Loading messages...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredMessages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-3">
                        <MailOpen className="w-12 h-12" />
                        <p className="text-lg">No messages found</p>
                        <p>Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMessages.map((message) => {
                    const messageType = MESSAGE_TYPES.find(t => t.id === message.message_type);
                    const MessageTypeIcon = messageType?.icon || HelpCircle;
                    return (
                      <tr 
                        key={message.id} 
                        className={`border-b transition-colors ${
                          message.status === 'new' ? 'bg-blue-50/50' : 
                          message.isImportant ? 'bg-yellow-50/50' : 
                          'hover:bg-muted/30'
                        }`}
                      >
                        <td className="py-4 px-6">
                          <input
                            type="checkbox"
                            placeholder="placeholder"
                            title="checkbox"
                            checked={selectedMessages.includes(message.id)}
                            onChange={() => {
                              setSelectedMessages(prev =>
                                prev.includes(message.id)
                                  ? prev.filter(id => id !== message.id)
                                  : [...prev, message.id]
                              );
                            }}
                            className="rounded border-input"
                          />
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium">{message.name}</div>
                              <div className="text-sm text-muted-foreground">{message.email}</div>
                              {message.phone_number && (
                                <div className="text-xs text-muted-foreground">{message.phone_number}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="max-w-xs">
                            <p className="font-medium line-clamp-1">{message.subject}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <MessageTypeIcon className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {message.message_type_label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            message.status === 'new' ? 'bg-red-500/10 text-red-600' :
                            message.status === 'read' ? 'bg-blue-500/10 text-blue-600' :
                            message.status === 'replied' ? 'bg-green-500/10 text-green-600' :
                            'bg-gray-500/10 text-gray-600'
                          }`}>
                            {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm">
                            {format(message.created_at.toDate(), "MMM d, yyyy")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(message.created_at.toDate(), "h:mm a")}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedMessage(message)}
                              className="p-2 hover:bg-muted rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMessage(message);
                                setShowReplyForm(true);
                              }}
                              className="p-2 hover:bg-muted rounded"
                              title="Send Notification"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleImportant(message.id)}
                              className="p-2 hover:bg-muted rounded"
                              title={message.isImportant ? "Remove Important" : "Mark Important"}
                            >
                              {message.isImportant ? (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              ) : (
                                <StarOff className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination/Stats */}
        <div className="mt-6 flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Showing {filteredMessages.length} of {messages.length} messages
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                setPriorityFilter('all');
                setSelectedMessages([]);
              }}
              className="hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="pb-16 ">
        <div className="mt-8 p-6 bg-muted rounded-xl ">
          <h3 className="font-medium mb-4">Quick Guide</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Status Meaning</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• New: Unread message</li>
                <li>• Read: Viewed but not replied</li>
                <li>• Replied: Notification sent</li>
                <li>• Closed: Issue resolved</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Notification System</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Replies are logged in notification_logs</li>
                <li>• Users receive system notifications</li>
                <li>• All notifications are tracked</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Bulk Actions</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Select multiple with checkboxes</li>
                <li>• Mark all as read/unread</li>
                <li>• Close multiple messages</li>
                <li>• Delete in bulk</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Message Detail View */}
      {selectedMessage && (
        <MessageDetail
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onStatusChange={handleStatusChange}
          onToggleImportant={handleToggleImportant}
          onReply={() => setShowReplyForm(true)}
          onDelete={handleDeleteMessage}
        />
      )}

      {/* Reply Form */}
      {showReplyForm && selectedMessage && (
        <ReplyForm
          message={selectedMessage}
          onSendReply={handleSendReply}
          onCancel={() => setShowReplyForm(false)}
        />
      )}
    </div>
  );
}