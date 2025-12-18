import React from 'react'; 
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
  ChevronDown 
} from "lucide-react";

import { useState } from "react";
import { toast } from "sonner";
import { 
  db, 
  auth, 
  collection, 
  addDoc, 
  serverTimestamp
} from "../firebase/firebase_config";
import { v4 as uuidv4 } from 'uuid';

// Message type definitions with priorities
type MessageType = 'workshop_booking' | 'space_rental' | '3d_printing' | 'technical_support' | 
                   'training' | 'maintenance' | 'partnership' | 'general_inquiry' | 
                   'feedback' | 'billing' | 'urgent_support';

type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

interface MessageTypeConfig {
  id: MessageType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  defaultPriority: MessagePriority;
  responseTime: string;
  color: string;
}

// Message type configurations with priorities
const MESSAGE_TYPES: MessageTypeConfig[] = [
  {
    id: 'workshop_booking',
    label: 'Workshop/Seminar Booking',
    icon: Calendar,
    description: 'Book a 3D printing workshop or training session',
    defaultPriority: 'high',
    responseTime: '2-4 hours',
    color: 'bg-blue-500'
  },
  {
    id: 'space_rental',
    label: 'Space/Studio Rental',
    icon: Home,
    description: 'Rent our co-working space or creative studio',
    defaultPriority: 'high',
    responseTime: '4-6 hours',
    color: 'bg-green-500'
  },
  {
    id: '3d_printing',
    label: '3D Printing Service',
    icon: Printer,
    description: 'Custom 3D printing project or consultation',
    defaultPriority: 'normal',
    responseTime: '12-24 hours',
    color: 'bg-purple-500'
  },
  {
    id: 'technical_support',
    label: 'Technical Support',
    icon: Wrench,
    description: 'Equipment or software technical issues',
    defaultPriority: 'high',
    responseTime: '4-8 hours',
    color: 'bg-orange-500'
  },
  {
    id: 'training',
    label: 'Training Request',
    icon: GraduationCap,
    description: 'Individual or group training sessions',
    defaultPriority: 'normal',
    responseTime: '24-48 hours',
    color: 'bg-indigo-500'
  },
  {
    id: 'maintenance',
    label: 'Equipment Maintenance',
    icon: Settings,
    description: 'Repair or maintenance service requests',
    defaultPriority: 'high',
    responseTime: '6-12 hours',
    color: 'bg-red-500'
  },
  {
    id: 'partnership',
    label: 'Partnership/Corporate',
    icon: Handshake,
    description: 'Business partnership or corporate inquiries',
    defaultPriority: 'normal',
    responseTime: '24-48 hours',
    color: 'bg-teal-500'
  },
  {
    id: 'general_inquiry',
    label: 'General Inquiry',
    icon: HelpCircle,
    description: 'General questions or information requests',
    defaultPriority: 'low',
    responseTime: '24-48 hours',
    color: 'bg-gray-500'
  },
  {
    id: 'feedback',
    label: 'Feedback/Suggestions',
    icon: Heart,
    description: 'Share your feedback or suggestions',
    defaultPriority: 'low',
    responseTime: '48-72 hours',
    color: 'bg-pink-500'
  },
  {
    id: 'billing',
    label: 'Billing/Payment',
    icon: DollarSign,
    description: 'Invoice, payment, or billing questions',
    defaultPriority: 'high',
    responseTime: '6-12 hours',
    color: 'bg-yellow-500'
  },
  {
    id: 'urgent_support',
    label: 'Urgent Support',
    icon: AlertTriangle,
    description: 'Critical issues requiring immediate attention',
    defaultPriority: 'urgent',
    responseTime: '1-2 hours',
    color: 'bg-red-600'
  }
];

// Priority configurations
const PRIORITY_CONFIG: Record<MessagePriority, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  description: string;
}> = {
  low: {
    label: 'Low Priority',
    icon: Clock,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Standard inquiry, no immediate action required'
  },
  normal: {
    label: 'Normal Priority',
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Regular inquiry, respond within 24 hours'
  },
  high: {
    label: 'High Priority',
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Important inquiry, respond within 12 hours'
  },
  urgent: {
    label: 'Urgent Priority',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Critical issue, immediate attention required'
  }
};

// Helper function to get priority based on message type and subject keywords
const getPriority = (
  messageType: MessageType, 
  subject: string, 
  message: string
): MessagePriority => {
  const selectedType = MESSAGE_TYPES.find(t => t.id === messageType);
  let priority = selectedType?.defaultPriority || 'normal';
  
  // Check for urgent keywords in subject or message
  const urgentKeywords = ['emergency', 'urgent', 'asap', 'critical', 'broken', 'not working', 'down'];
  const highKeywords = ['help', 'issue', 'problem', 'error', 'failed', 'cannot', 'unable'];
  
  const text = (subject + ' ' + message).toLowerCase();
  
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'urgent';
  }
  
  if (highKeywords.some(keyword => text.includes(keyword)) && priority !== 'urgent') {
    return 'high';
  }
  
  return priority;
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
  const [selectedPriority, setSelectedPriority] = useState<MessagePriority>('normal');

  // Calculate priority whenever form data changes
  React.useEffect(() => {
    const priority = getPriority(formData.messageType, formData.subject, formData.message);
    setSelectedPriority(priority);
  }, [formData.messageType, formData.subject, formData.message]);

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
      // Get current user if logged in
      const currentUser = auth.currentUser;
      const userId = currentUser?.uid || null;

      // Generate unique ID for the message
      const messageId = uuidv4();

      // Get selected message type config
      const selectedType = MESSAGE_TYPES.find(t => t.id === formData.messageType);
      
      // Create message object for Firestore
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
        priority: selectedPriority,
        assigned_to: null,
        reply_message: null,
        replied_at: null,
        created_at: serverTimestamp(),
      };

      // Add to Firestore
      const messagesRef = collection(db, 'contact_messages');
      await addDoc(messagesRef, messageData);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        messageType: "general_inquiry",
      });

      setErrors({});

      // Show success message with priority information
      const PriorityIcon = PRIORITY_CONFIG[selectedPriority].icon;
      
      toast.success("Message sent successfully!", {
        description: (
          <div className="flex items-center gap-2 mt-1">
            <PriorityIcon className="w-4 h-4" />
            <span>{PRIORITY_CONFIG[selectedPriority].label} • Reference: {messageId.substring(0, 8).toUpperCase()}</span>
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
  const PriorityConfig = PRIORITY_CONFIG[selectedPriority];
  const PriorityIcon = PriorityConfig.icon;

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
                <CardTitle>Send Us a Message</CardTitle>
                <CardDescription>
                  Select your inquiry type and we'll prioritize your message accordingly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={errors.name ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={errors.email ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+237 6XX XX XX XX"
                        className={errors.phone ? "border-red-500" : ""}
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
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
                          title='messageType'
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

                  {/* Priority Indicator */}
                  <div className={`p-3 rounded-lg ${PriorityConfig.bgColor} border border-current/20`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <PriorityIcon className={`w-5 h-5 ${PriorityConfig.color}`} />
                        <div>
                          <span className={`font-medium ${PriorityConfig.color}`}>
                            {PriorityConfig.label}
                          </span>
                          <p className="text-sm text-muted-foreground">
                            {PriorityConfig.description}
                          </p>
                        </div>
                      </div>
                      {selectedType && (
                        <div className="text-sm text-right">
                          <div className="font-medium">Expected Response</div>
                          <div className="text-muted-foreground">{selectedType.responseTime}</div>
                        </div>
                      )}
                    </div>
                  </div>

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
                    
                    {/* Character counter and priority hints */}
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
                          formData.message.length > 500 ? 'text-orange-500' : 'text-green-500'
                        }`}>
                          {formData.message.length}/1000
                        </span>
                        {formData.message.length > 500 && selectedPriority !== 'urgent' && (
                          <span className="text-xs text-orange-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Detailed message detected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

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
                        <span className="ml-2 text-xs opacity-80">
                          ({selectedPriority.toUpperCase()} PRIORITY)
                        </span>
                      </>
                    )}
                  </Button>
                  
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

            {/* Message Types Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Message Types & Priorities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="text-sm">Urgent</span>
                    </div>
                    <span className="text-xs font-medium">1-2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">High</span>
                    </div>
                    <span className="text-xs font-medium">4-12 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">Normal</span>
                    </div>
                    <span className="text-xs font-medium">24 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm">Low</span>
                    </div>
                    <span className="text-xs font-medium">48+ hours</span>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      Priority is automatically assigned based on message type and content keywords.
                    </p>
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
