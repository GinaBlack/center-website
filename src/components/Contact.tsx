import React, { useState, useEffect } from 'react'; 
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Loader2, 
  AlertCircle,
  MessageSquare,
  Wrench,
  DollarSign,
  Heart,
  Handshake,
  HelpCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  Calendar, 
  Home, 
  Printer, 
  GraduationCap, 
  Settings, 
  ChevronDown,
  User,
  Edit2,
  Save,
  X
} from "lucide-react";

import { toast } from "sonner";
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc
} from "../firebase/firebase_config";
import { v4 as uuidv4 } from 'uuid';
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

// Message type definitions WITHOUT priorities
type MessageType = 'workshop_booking' | 'space_rental' | '3d_printing' | 'technical_support' | 
                   'training' | 'maintenance' | 'partnership' | 'general_inquiry' | 
                   'feedback' | 'billing' | 'urgent_support';

interface MessageTypeConfig {
  id: MessageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  responseTime: string;
  color: string;
}

// User profile interface
interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  updatedAt?: Date;
}

// Message type configurations WITHOUT priorities
const MESSAGE_TYPES: MessageTypeConfig[] = [
  {
    id: 'workshop_booking',
    label: 'Workshop/Seminar Booking',
    icon: Calendar,
    description: 'Book a 3D printing workshop or training session',
    responseTime: '2-4 hours',
    color: 'bg-blue-500'
  },
  {
    id: 'space_rental',
    label: 'Space/Studio Rental',
    icon: Home,
    description: 'Rent our co-working space or creative studio',
    responseTime: '4-6 hours',
    color: 'bg-green-500'
  },
  {
    id: '3d_printing',
    label: '3D Printing Service',
    icon: Printer,
    description: 'Custom 3D printing project or consultation',
    responseTime: '12-24 hours',
    color: 'bg-purple-500'
  },
  {
    id: 'technical_support',
    label: 'Technical Support',
    icon: Wrench,
    description: 'Equipment or software technical issues',
    responseTime: '4-8 hours',
    color: 'bg-orange-500'
  },
  {
    id: 'training',
    label: 'Training Request',
    icon: GraduationCap,
    description: 'Individual or group training sessions',
    responseTime: '24-48 hours',
    color: 'bg-indigo-500'
  },
  {
    id: 'maintenance',
    label: 'Equipment Maintenance',
    icon: Settings,
    description: 'Repair or maintenance service requests',
    responseTime: '6-12 hours',
    color: 'bg-red-500'
  },
  {
    id: 'partnership',
    label: 'Partnership/Corporate',
    icon: Handshake,
    description: 'Business partnership or corporate inquiries',
    responseTime: '24-48 hours',
    color: 'bg-teal-500'
  },
  {
    id: 'general_inquiry',
    label: 'General Inquiry',
    icon: HelpCircle,
    description: 'General questions or information requests',
    responseTime: '24-48 hours',
    color: 'bg-gray-500'
  },
  {
    id: 'feedback',
    label: 'Feedback/Suggestions',
    icon: Heart,
    description: 'Share your feedback or suggestions',
    responseTime: '48-72 hours',
    color: 'bg-pink-500'
  },
  {
    id: 'billing',
    label: 'Billing/Payment',
    icon: DollarSign,
    description: 'Invoice, payment, or billing questions',
    responseTime: '6-12 hours',
    color: 'bg-yellow-500'
  },
  {
    id: 'urgent_support',
    label: 'Urgent Support',
    icon: AlertTriangle,
    description: 'Critical issues requiring immediate attention',
    responseTime: '1-2 hours',
    color: 'bg-red-600'
  }
];

// Load user profile from Firestore
const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDocRef = doc(db, 'user_profiles', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
};

// Save user profile to Firestore
const saveUserProfile = async (userId: string, profile: UserProfile): Promise<void> => {
  try {
    const userDocRef = doc(db, 'user_profiles', userId);
    await setDoc(userDocRef, {
      ...profile,
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
};

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    messageType: "general_inquiry" as MessageType,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        setIsLoadingProfile(true);
        // Load user profile
        const profile = await loadUserProfile(user.uid);
        setUserProfile(profile);
        
        // Auto-fill form with user data
        const displayName = user.displayName || profile?.name || '';
        const userEmail = user.email || profile?.email || '';
        const userPhone = profile?.phone || '';
        
        setFormData(prev => ({
          ...prev,
          name: displayName,
          email: userEmail,
          phone: userPhone
        }));
        
        setIsLoadingProfile(false);
      } else {
        // Reset form for non-logged in users
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
          messageType: "general_inquiry",
        });
        setUserProfile(null);
        setIsLoadingProfile(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle profile editing
  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setOriginalProfile(userProfile);
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      const updatedProfile: UserProfile = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        updatedAt: new Date()
      };

      await saveUserProfile(currentUser.uid, updatedProfile);
      setUserProfile(updatedProfile);
      setIsEditingProfile(false);
      toast.success("Profile saved successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save profile");
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    if (originalProfile) {
      setFormData(prev => ({
        ...prev,
        name: originalProfile.name || '',
        email: originalProfile.email || '',
        phone: originalProfile.phone || ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }
    
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    if (formData.message.length < 20) newErrors.message = "Message must be at least 20 characters";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = currentUser?.uid || null;

      // Generate unique ID for the message
      const messageId = uuidv4();

      // Get selected message type config
      const selectedType = MESSAGE_TYPES.find(t => t.id === formData.messageType);
      
      // Create message object for Firestore (NO PRIORITY FIELD)
      const messageData = {
        message_id: messageId,
        user_id: userId,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone_number: formData.phone.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
        message_type: formData.messageType,
        message_type_label: selectedType?.label || 'General Inquiry',
        category: mapMessageTypeToCategory(formData.messageType),
        status: 'new',
        assigned_to: null,
        reply_message: null,
        replied_at: null,
        created_at: serverTimestamp(),
      };

      // Add to Firestore
      const messagesRef = collection(db, 'contact_messages');
      await addDoc(messagesRef, messageData);

      // Save user profile if logged in
      if (currentUser && !userProfile) {
        const userProfileData: UserProfile = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          updatedAt: new Date()
        };
        await saveUserProfile(currentUser.uid, userProfileData);
        setUserProfile(userProfileData);
      }

      // Reset form (keep user details for logged-in users)
      setFormData(prev => ({
        ...prev,
        subject: "",
        message: "",
        messageType: "general_inquiry",
      }));

      setErrors({});

      // Show success message WITHOUT priority
      toast.success("Message sent successfully!", {
        description: (
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Reference: {messageId.substring(0, 8).toUpperCase()}</span>
          </div>
        ),
        duration: 5000,
      });

    } catch (error) {
      console.error("Error submitting message:", error);
      toast.error("Failed to send message. Please try again.", {
        description: "If the problem persists, please call us directly.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Map message type to category for database schema
  const mapMessageTypeToCategory = (messageType: MessageType): string => {
    const categoryMap: Record<MessageType, string> = {
      workshop_booking: 'technical',
      space_rental: 'general',
      '3d_printing': 'technical',
      technical_support: 'technical',
      training: 'technical',
      maintenance: 'technical',
      partnership: 'partnership',
      general_inquiry: 'general',
      feedback: 'feedback',
      billing: 'billing',
      urgent_support: 'technical'
    };
    
    return categoryMap[messageType] || 'general';
  };

  // Get selected message type details
  const selectedType = MESSAGE_TYPES.find(t => t.id === formData.messageType);

  return (
    <section id="contact" className="py-2 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-8 lg:mb-12">
          <h2 className="tracking-tight text-lgx mb-4">Get In Touch</h2>
          <p className="text-muted-foreground">
            Ready to start your project? Contact us today for a free consultation and quote <br />
            Reserve a time slot for a workshop, seminar, or a 3D printing session <br />
            Inquire about training sessions or any other inquiries
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Send Us a Message</CardTitle>
                    <CardDescription>
                      {currentUser ? (
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Logged in as {currentUser.email}
                        </span>
                      ) : (
                        "Select your inquiry type for better assistance"
                      )}
                    </CardDescription>
                  </div>
                  {currentUser && !isEditingProfile && (
                    <button
                      onClick={handleEditProfile}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Profile Section */}
                  {currentUser && isEditingProfile && (
                    <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-blue-800 flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Edit Your Profile
                        </h3>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSaveProfile}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-1"
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-blue-600 mb-3">
                        Your profile details will be auto-filled for future messages
                      </p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name *
                      </Label>
                      <div className="relative">
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          className={errors.name ? "border-red-500 pr-10" : "pr-10"}
                          disabled={isSubmitting || isLoadingProfile}
                        />
                        {currentUser && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                      {currentUser && formData.name && !isEditingProfile && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Auto-filled from your profile
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email *
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          className={errors.email ? "border-red-500 pr-10" : "pr-10"}
                          disabled={isSubmitting || isLoadingProfile || (currentUser && !isEditingProfile)}
                        />
                        {currentUser && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Mail className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                      {currentUser && formData.email && !isEditingProfile && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Your account email
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number *
                      </Label>
                      <div className="relative">
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+237 6XX XX XX XX"
                          className={errors.phone ? "border-red-500 pr-10" : "pr-10"}
                          disabled={isSubmitting || isLoadingProfile}
                        />
                        {currentUser && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </p>
                      )}
                      {currentUser && formData.phone && !isEditingProfile && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          From your saved profile
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="messageType">
                        Message Type *
                      </Label>
                      <div className="relative">
                        <select
                          id="messageType"
                          name="messageType"
                          value={formData.messageType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-input rounded-lg bg-background appearance-none"
                          disabled={isSubmitting}
                        >
                          {MESSAGE_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      {selectedType && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <selectedType.icon className="w-4 h-4" />
                          <span>{selectedType.description}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Response Time Indicator */}
                  {selectedType && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <div>
                            <span className="font-medium text-blue-600">
                              Expected Response Time
                            </span>
                            <p className="text-sm text-muted-foreground">
                              Based on your selected message type
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">
                            {selectedType.responseTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Brief description of your inquiry..."
                      className={errors.subject ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.subject && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.subject}
                      </p>
                    )}
                    
                    {/* Subject Suggestions based on selected type */}
                    {selectedType && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Suggested subjects for {selectedType.label}:</p>
                        <div className="flex flex-wrap gap-2">
                          {getTypeSpecificSuggestions(formData.messageType).map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, subject: suggestion }));
                                if (errors.subject) {
                                  setErrors(prev => ({ ...prev, subject: "" }));
                                }
                              }}
                              className="text-xs px-2 py-1 bg-muted rounded hover:bg-muted/80 transition-colors"
                              disabled={isSubmitting}
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide detailed information about your inquiry..."
                      rows={6}
                      className={errors.message ? "border-red-500" : ""}
                      disabled={isSubmitting}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.message}
                      </p>
                    )}
                    
                    {/* Character counter */}
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-muted-foreground">
                        {formData.message.length < 20 ? (
                          <span className="text-red-500">
                            Minimum 20 characters required
                          </span>
                        ) : (
                          "Message ready to send"
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs ${
                          formData.message.length < 20 ? 'text-red-500' : 
                          formData.message.length > 500 ? 'text-blue-500' : 'text-green-500'
                        }`}>
                          {formData.message.length}/1000
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button 
                      type="submit" 
                      variant="black" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting || formData.message.length < 20}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                    
                    {currentUser && (
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Your profile information is saved for future messages.
                          {userProfile?.updatedAt && (
                            <span className="block mt-1">
                              Last updated: {new Date(userProfile.updatedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {!currentUser && (
                      <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          <strong>Tip:</strong> Login to save your contact details for faster messaging!
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By submitting this form, you agree to our privacy policy. 
                    {selectedType?.responseTime && ` Expected response time: ${selectedType.responseTime}.`}
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>enspy.cep@polytechnique.cm</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone</div>
                    <div> (+237) 222 22 45 47,<br />
                      (+237) 694 70 56 90,<br />
                      (+237) 677 46 99 21,<br />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Address</div>
                    <div>ENSPY Campus, Yaoundé, Cameroon</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-black text-white border-0">
              <CardHeader>
                <CardTitle className="text-white">Business Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>Closed</span>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-xs text-white/70">
                    Urgent support available 24/7 for critical issues
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper function for type-specific subject suggestions
function getTypeSpecificSuggestions(messageType: MessageType): string[] {
  const suggestions: Record<MessageType, string[]> = {
    workshop_booking: [
      "3D Printing Workshop Registration",
      "Seminar Schedule Inquiry",
      "Group Workshop Booking",
      "Custom Training Session"
    ],
    space_rental: [
      "Co-working Space Availability",
      "Studio Rental Inquiry",
      "Event Space Booking",
      "Long-term Rental Request"
    ],
    '3d_printing': [
      "Custom 3D Print Quote",
      "Prototype Printing Request",
      "Material Consultation",
      "Bulk Printing Inquiry"
    ],
    technical_support: [
      "3D Printer Not Working",
      "Software Installation Help",
      "Equipment Troubleshooting",
      "Network Connection Issues"
    ],
    training: [
      "Beginner 3D Printing Course",
      "Advanced CAD Training",
      "Team Training Request",
      "Certification Program"
    ],
    maintenance: [
      "Printer Repair Service",
      "Preventive Maintenance",
      "Equipment Calibration",
      "Spare Parts Request"
    ],
    partnership: [
      "Corporate Partnership Inquiry",
      "Educational Collaboration",
      "Sponsorship Opportunity",
      "Joint Project Proposal"
    ],
    general_inquiry: [
      "General Information Request",
      "Facility Tour Booking",
      "Membership Inquiry",
      "Equipment List Request"
    ],
    feedback: [
      "Service Feedback",
      "Improvement Suggestions",
      "Customer Experience",
      "Facility Feedback"
    ],
    billing: [
      "Invoice Payment Issue",
      "Billing Information Update",
      "Refund Request",
      "Payment Method Inquiry"
    ],
    urgent_support: [
      "EQUIPMENT EMERGENCY",
      "URGENT: System Failure",
      "CRITICAL: Production Halted",
      "IMMEDIATE ASSISTANCE NEEDED"
    ]
  };
  
  return suggestions[messageType] || [];
}
