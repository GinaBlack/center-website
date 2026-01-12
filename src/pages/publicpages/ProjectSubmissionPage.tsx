import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Badge } from "../../components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, MapPin, LogIn, User, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../../components/ui/progress";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebase_config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';

const countryCodes = [
  { code: "+237", name: "Cameroon" },
  { code: "+1", name: "USA" },
  { code: "+44", name: "UK" },
  { code: "+234", name: "Nigeria" },
  { code: "+33", name: "France" },
  { code: "+49", name: "Germany" },
  { code: "+91", name: "India" },
];

const availableColors = [
  "Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Grey", "Natural"
];

// Valid file extensions
const VALID_FILE_EXTENSIONS = ['.stl', '.obj', '.3mf', '.step', '.stp'];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadedFile {
  id: string; // Add unique ID for each file
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  file: File; // Always keep file reference
  googleDriveFileId?: string;
  googleDriveViewLink?: string;
  uploadProgress?: number; // Track upload progress
  isUploading?: boolean; // Track if file is currently uploading
}

// Google Drive API URL
const GOOGLE_DRIVE_API_URL = 'http://localhost:7000/upload';

// Function to upload file to Google Drive via your API with progress tracking
const uploadFileToGoogleDrive = async (
  file: File, 
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ fileId: string; fileName: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('userId', userId); // Send userId for folder organization

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText);
          if (result.success) {
            resolve({
              fileId: result.fileId,
              fileName: result.fileName,
            });
          } else {
            reject(new Error(result.error || 'Upload failed'));
          }
        } catch (error) {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during upload'));
    };

    xhr.onabort = () => {
      reject(new Error('Upload was cancelled'));
    };

    xhr.open('POST', GOOGLE_DRIVE_API_URL);
    xhr.send(formData);
  });
};

export function ProjectSubmissionPage() {
  const navigate = useNavigate(); 
  const { 
    currentUser: user, 
    userData,
    loading, 
    isAuthenticated,
  } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: "",
    name: "",
    email: "",
    phone: "",
    countryCode: "+237",
    shippingAddress: "",
    city: "",
    state: "",
    zipCode: "",
    technology: "",
    material: "",
    color: "",
    quantity: "1",
    infill: "20",
    layerHeight: "0.2",
    supportType: "auto",
    postProcessing: [] as string[],
    rushOrder: false,
    notes: "",
  });

  // Prefill user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user && userData) {
      const displayName = userData.displayName || userData.firstName || user.displayName || "";
      const email = user.email || userData.email || "";
      
      setFormData(prev => ({
        ...prev,
        name: displayName,
        email: email,
      }));
    }
  }, [isAuthenticated, user, userData]);

  // Validation functions
  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && /^[a-zA-Z\s\-']+$/.test(name);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateProjectName = (name: string): boolean => {
    return name.trim().length >= 3 && name.trim().length <= 100;
  };

  const validateAddress = (address: string): boolean => {
    return address.trim().length >= 10;
  };

  const validateFileExtension = (fileName: string): boolean => {
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return VALID_FILE_EXTENSIONS.includes(extension);
  };

  const validateFileSize = (fileSize: number): boolean => {
    return fileSize <= MAX_FILE_SIZE_BYTES;
  };

  const clearError = (field: string) => {
    setFormErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const setError = (field: string, message: string) => {
    setFormErrors(prev => ({ ...prev, [field]: message }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    clearError(field);
    
    // Real-time validation
    if (field === 'name' && value) {
      if (!validateName(value)) {
        setError('name', 'Name must be at least 2 characters and contain only letters');
      }
    }
    
    if (field === 'email' && value) {
      if (!validateEmail(value)) {
        setError('email', 'Please enter a valid email address');
      }
    }
    
    if (field === 'phone' && value) {
      if (!validatePhone(value)) {
        setError('phone', 'Please enter a valid phone number (8-20 digits)');
      }
    }
    
    if (field === 'projectName' && value) {
      if (!validateProjectName(value)) {
        setError('projectName', 'Project name must be between 3 and 100 characters');
      }
    }
    
    if (field === 'shippingAddress' && value) {
      if (!validateAddress(value)) {
        setError('shippingAddress', 'Address must be at least 10 characters');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;
    
    clearError('files');
    
    const invalidFiles: string[] = [];
    const tooLargeFiles: string[] = [];
    
    files.forEach(file => {
      if (!validateFileExtension(file.name)) {
        invalidFiles.push(file.name);
      }
      if (!validateFileSize(file.size)) {
        tooLargeFiles.push(file.name);
      }
    });
    
    if (invalidFiles.length > 0) {
      setError('files', `Invalid file type: ${invalidFiles.join(', ')}. Accepted: ${VALID_FILE_EXTENSIONS.join(', ')}`);
      return;
    }
    
    if (tooLargeFiles.length > 0) {
      setError('files', `File(s) too large: ${tooLargeFiles.join(', ')}. Max size: ${MAX_FILE_SIZE_MB}MB`);
      return;
    }
    
    try {
      // Store file references with unique IDs
      const newFiles: UploadedFile[] = files.map(file => ({
        id: uuidv4(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        file: file, // Keep file reference for later upload
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      toast.success(`${files.length} file(s) added successfully. They will be uploaded when you submit.`);
    } catch (error: any) {
      console.error('File processing error:', error);
      toast.error("Failed to process files");
      setError('files', 'Failed to process files');
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
    toast.info("File removed");
  };

  const validateStep = (stepNumber: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (stepNumber === 1) {
      if (!formData.projectName.trim()) {
        errors.projectName = 'Project name is required';
      } else if (!validateProjectName(formData.projectName)) {
        errors.projectName = 'Project name must be between 3 and 100 characters';
      }
      
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      } else if (!validateName(formData.name)) {
        errors.name = 'Name must be at least 2 characters and contain only letters';
      }
      
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        errors.phone = 'Please enter a valid phone number';
      }
      
      if (!formData.shippingAddress.trim()) {
        errors.shippingAddress = 'Shipping address is required';
      } else if (!validateAddress(formData.shippingAddress)) {
        errors.shippingAddress = 'Address must be at least 10 characters';
      }
      
      if (!formData.city.trim()) {
        errors.city = 'City is required';
      }
      
      if (!formData.state.trim()) {
        errors.state = 'State/Province is required';
      }
    }
    
    if (stepNumber === 2) {
      if (!formData.technology) {
        errors.technology = 'Please select a printing technology';
      }
      if (!formData.material) {
        errors.material = 'Please select a material';
      }
      if (!formData.color) {
        errors.color = 'Please select a color';
      }
      if (!formData.quantity || parseInt(formData.quantity) < 1) {
        errors.quantity = 'Quantity must be at least 1';
      }
    }
    
    if (stepNumber === 3) {
      if (!formData.layerHeight) {
        errors.layerHeight = 'Please select layer height';
      }
      if (!formData.supportType) {
        errors.supportType = 'Please select support type';
      }
    }
    
    if (stepNumber === 5) {
      if (uploadedFiles.length === 0) {
        errors.files = 'Please upload at least one 3D file';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError);
      return;
    }
    
    setStep(step + 1);
  };

  // Upload all files to Google Drive with progress tracking
  const uploadAllFilesToGoogleDrive = async (files: UploadedFile[], userId: string): Promise<UploadedFile[]> => {
    const results: UploadedFile[] = [];
    
    for (const fileData of files) {
      try {
        // Mark file as uploading
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileData.id ? { ...file, isUploading: true, uploadProgress: 0 } : file
        ));
        
        const uploadResult = await uploadFileToGoogleDrive(
          fileData.file, 
          userId,
          (progress) => {
            // Update progress for this specific file
            setUploadedFiles(prev => prev.map(file => 
              file.id === fileData.id ? { ...file, uploadProgress: progress } : file
            ));
          }
        );
        
        const processedFile = {
          ...fileData,
          googleDriveFileId: uploadResult.fileId,
          googleDriveViewLink: `https://drive.google.com/file/d/${uploadResult.fileId}/view`,
          isUploading: false,
          uploadProgress: 100,
        };
        
        results.push(processedFile);
        
        // Update the uploadedFiles state with the processed file
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileData.id ? processedFile : file
        ));
        
        toast.success(`Uploaded: ${fileData.name}`);
      } catch (error: any) {
        // Mark file as failed
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileData.id ? { ...file, isUploading: false } : file
        ));
        
        throw new Error(`Failed to upload ${fileData.name}: ${error.message}`);
      }
    }
    
    return results;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Use isAuthenticated from your AuthContext
    if (!isAuthenticated) {
      toast.error("Please login to submit a project");
      navigate("/auth/login");
      return;
    }
    
    if (!validateStep(5)) {
      const firstError = Object.values(formErrors)[0];
      toast.error(firstError);
      return;
    }
    
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one 3D file before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload all files to Google Drive
      toast.info("Uploading files to Google Drive...");
      const processedFiles = await uploadAllFilesToGoogleDrive(uploadedFiles, user!.uid);
      
      // Step 2: Save project to Firestore
      toast.info("Saving project details...");
      const projectRef = await addDoc(collection(db, "projects"), {
        // Basic Information
        projectName: formData.projectName,
        contact: {
          name: formData.name,
          email: formData.email,
          phone: `${formData.countryCode} ${formData.phone}`,
        },
        shipping: {
          address: formData.shippingAddress,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        
        // Printing Specifications
        technology: formData.technology,
        material: formData.material,
        color: formData.color,
        quantity: parseInt(formData.quantity),
        infill: parseInt(formData.infill),
        layerHeight: formData.layerHeight,
        supportType: formData.supportType,
        
        // Additional Services
        postProcessing: formData.postProcessing,
        rushOrder: formData.rushOrder,
        notes: formData.notes,
        
        // Files - with Google Drive info
        files: processedFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: file.uploadedAt,
          googleDriveFileId: file.googleDriveFileId,
          googleDriveViewLink: file.googleDriveViewLink,
        })),
        
        // Metadata
        userId: user?.uid,
        userEmail: user?.email,
        userName: userData?.displayName || userData?.firstName || user?.displayName,
        status: "pending", // pending, reviewing, quoted, approved, in_production, completed, cancelled
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        filesProcessed: true,
      });

      setSubmissionSuccess(true);
      toast.success(`Project submitted successfully! Reference: ${projectRef.id}`);
      
      // Reset form after delay
      setTimeout(() => {
        setFormData({
          projectName: "",
          name: "",
          email: "",
          phone: "",
          countryCode: "+237",
          shippingAddress: "",
          city: "",
          state: "",
          zipCode: "",
          technology: "",
          material: "",
          color: "",
          quantity: "1",
          infill: "20",
          layerHeight: "0.2",
          supportType: "auto",
          postProcessing: [],
          rushOrder: false,
          notes: "",
        });
        setUploadedFiles([]);
        setFormErrors({});
        setStep(1);
        setSubmissionSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(`Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (step / 5) * 100;

  // Show loading state
  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (submissionSuccess) {
    return (
      <div className="pt-16 min-h-screen bg-muted/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Project Submitted Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for submitting your 3D printing project. Our team will review your 
                  submission and contact you within 24 hours to discuss pricing and delivery timeline.
                </p>
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <h3 className="font-medium mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li>• Our team will analyze your 3D files for printability</li>
                    <li>• We'll prepare a detailed quote with pricing and timeline</li>
                    <li>• You'll receive an email with the quotation and next steps</li>
                    <li>• Once approved, we'll begin production immediately</li>
                  </ul>
                </div>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => navigate("/")} variant="outline">
                    Return to Home
                  </Button>
                  <Button onClick={() => {
                    setFormData({
                      projectName: "",
                      name: "",
                      email: "",
                      phone: "",
                      countryCode: "+237",
                      shippingAddress: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      technology: "",
                      material: "",
                      color: "",
                      quantity: "1",
                      infill: "20",
                      layerHeight: "0.2",
                      supportType: "auto",
                      postProcessing: [],
                      rushOrder: false,
                      notes: "",
                    });
                    setUploadedFiles([]);
                    setFormErrors({});
                    setStep(1);
                    setSubmissionSuccess(false);
                  }} variant="default">
                    Submit Another Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="pt-16 min-h-screen bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Login Prompt Card */}
          <Card className="mb-8 border-yellow-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <LogIn className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">Login Required</h3>
                  <p className="text-muted-foreground">
                    Please login or create an account to submit a 3D printing project. 
                    This allows you to track your submissions and manage your projects.
                  </p>
                </div>
                <Button onClick={() => navigate("/auth/login")} className="gap-2">
                  <User className="w-4 h-4" />
                  Login / Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Demo Form */}
          <div className="text-center mb-8">
            <h1 className="tracking-tight mb-4 h-fit">Submit Your Project</h1>
            <p className="text-muted-foreground">
              Complete the form below to submit your 3D printing project
            </p>
          </div>

          <Card className="opacity-50">
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Login to Access Project Submission</h3>
                <p className="text-muted-foreground mb-6">
                  Please login or create an account to use the project submission form
                </p>
                <Button onClick={() => navigate("/auth/login")} size="lg" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Login to Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Get user display name for welcome message
  const userDisplayName = userData?.displayName || userData?.firstName || user?.displayName || "User";

  // Calculate overall upload progress
  const totalUploadProgress = uploadedFiles.length > 0 
    ? Math.round(uploadedFiles.reduce((sum, file) => sum + (file.uploadProgress || 0), 0) / uploadedFiles.length)
    : 0;

  return (
    <div className="pt-16 min-h-screen bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div></div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span>Welcome, {userDisplayName}</span>
            </div>
          </div>
          <h1 className="tracking-tight mb-4 h-fit">Submit Your Project</h1>
          <p className="text-muted-foreground">
            Complete the form below to submit your 3D printing project
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Step {step} of 5</span>
            <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && "Basic Information"}
                  {step === 2 && "Technology & Material"}
                  {step === 3 && "Print Specifications"}
                  {step === 4 && "Additional Services"}
                  {step === 5 && "Files & Notes"}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Tell us about your project and contact details"}
                  {step === 2 && "Choose your printing technology and material"}
                  {step === 3 && "Specify print quality and settings"}
                  {step === 4 && "Select any additional services you need"}
                  {step === 5 && "Upload files and add any special instructions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Basic Info */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="projectName">Project Name *</Label>
                        <Input
                          id="projectName"
                          value={formData.projectName}
                          onChange={(e) => handleInputChange("projectName", e.target.value)}
                          placeholder="My awesome project"
                          className={formErrors.projectName ? "border-red-500" : ""}
                        />
                        {formErrors.projectName && (
                          <p className="text-sm text-red-500">{formErrors.projectName}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="John Doe"
                          className={formErrors.name ? "border-red-500" : ""}
                        />
                        {formErrors.name && (
                          <p className="text-sm text-red-500">{formErrors.name}</p>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            placeholder="john@example.com"
                            className={formErrors.email ? "border-red-500" : ""}
                          />
                          {formErrors.email && (
                            <p className="text-sm text-red-500">{formErrors.email}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone *</Label>
                          <div className="flex gap-2">
                            <Select
                              value={formData.countryCode}
                              onValueChange={(value) => handleInputChange("countryCode", value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countryCodes.map((c) => (
                                  <SelectItem key={c.code} value={c.code}>
                                    {c.name} ({c.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              placeholder="Enter phone number"
                              className={formErrors.phone ? "border-red-500" : ""}
                            />
                          </div>
                          {formErrors.phone && (
                            <p className="text-sm text-red-500">{formErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      {/* Shipping Address Section */}
                      <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                          <h3 className="font-medium">Shipping Address *</h3>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="shippingAddress">Street Address *</Label>
                          <Textarea
                            id="shippingAddress"
                            value={formData.shippingAddress}
                            onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
                            placeholder="123 Main Street, Apartment 4B"
                            rows={2}
                            className={formErrors.shippingAddress ? "border-red-500" : ""}
                          />
                          {formErrors.shippingAddress && (
                            <p className="text-sm text-red-500">{formErrors.shippingAddress}</p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={formData.city}
                              onChange={(e) => handleInputChange("city", e.target.value)}
                              placeholder="City"
                              className={formErrors.city ? "border-red-500" : ""}
                            />
                            {formErrors.city && (
                              <p className="text-sm text-red-500">{formErrors.city}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state">State/Province *</Label>
                            <Input
                              id="state"
                              value={formData.state}
                              onChange={(e) => handleInputChange("state", e.target.value)}
                              placeholder="State or Province"
                              className={formErrors.state ? "border-red-500" : ""}
                            />
                            {formErrors.state && (
                              <p className="text-sm text-red-500">{formErrors.state}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                            <Input
                              id="zipCode"
                              value={formData.zipCode}
                              onChange={(e) => handleInputChange("zipCode", e.target.value)}
                              placeholder="Postal code"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Technology & Material */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Technology *</Label>
                        {formErrors.technology && (
                          <p className="text-sm text-red-500">{formErrors.technology}</p>
                        )}
                        <RadioGroup
                          value={formData.technology}
                          onValueChange={(value) => handleInputChange("technology", value)}
                        >
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="fdm" id="fdm" />
                            <Label htmlFor="fdm" className="cursor-pointer flex-1">
                              <div>FDM Printing</div>
                              <div className="text-xs text-muted-foreground">
                                Best for functional prototypes and larger parts
                              </div>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-muted">
                            <RadioGroupItem value="resin" id="resin" />
                            <Label htmlFor="resin" className="cursor-pointer flex-1">
                              <div>Resin Printing (SLA/DLP)</div>
                              <div className="text-xs text-muted-foreground">
                                High detail, smooth surface finish
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="material">Material *</Label>
                        {formErrors.material && (
                          <p className="text-sm text-red-500">{formErrors.material}</p>
                        )}
                        <Select
                          value={formData.material}
                          onValueChange={(value) => handleInputChange("material", value)}
                        >
                          <SelectTrigger className={formErrors.material ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.technology === "fdm" ? (
                              <>
                                <SelectItem value="pla">PLA - Standard</SelectItem>
                                <SelectItem value="abs">ABS - Durable</SelectItem>
                                <SelectItem value="petg">PETG - Strong & Flexible</SelectItem>
                                <SelectItem value="tpu">TPU - Flexible</SelectItem>
                                <SelectItem value="nylon">Nylon - Industrial Grade</SelectItem>
                                <SelectItem value="carbon">Carbon Fiber - Premium</SelectItem>
                              </>
                            ) : (
                              <>
                                <SelectItem value="standard-resin">Standard Resin</SelectItem>
                                <SelectItem value="tough-resin">Tough Resin</SelectItem>
                                <SelectItem value="flexible-resin">Flexible Resin</SelectItem>
                                <SelectItem value="castable-resin">Castable Resin</SelectItem>
                              </>
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="color">Color *</Label>
                        {formErrors.color && (
                          <p className="text-sm text-red-500">{formErrors.color}</p>
                        )}
                        <Select
                          value={formData.color}
                          onValueChange={(value) => handleInputChange("color", value)}
                        >
                          <SelectTrigger className={formErrors.color ? "border-red-500" : ""}>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableColors.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity *</Label>
                        {formErrors.quantity && (
                          <p className="text-sm text-red-500">{formErrors.quantity}</p>
                        )}
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          max="1000"
                          value={formData.quantity}
                          onChange={(e) => handleInputChange("quantity", e.target.value)}
                          className={formErrors.quantity ? "border-red-500" : ""}
                        />
                      </div>
                    </div>
                  )}

                  {/* Step 3: Specifications */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="infill">Infill Density: {formData.infill}%</Label>
                        <input
                          id="infill"
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={formData.infill}
                          onChange={(e) => handleInputChange("infill", e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher infill = stronger but more expensive and slower
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="layerHeight">Layer Height *</Label>
                        {formErrors.layerHeight && (
                          <p className="text-sm text-red-500">{formErrors.layerHeight}</p>
                        )}
                        <Select
                          value={formData.layerHeight}
                          onValueChange={(value) => handleInputChange("layerHeight", value)}
                        >
                          <SelectTrigger className={formErrors.layerHeight ? "border-red-500" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.1">0.1mm - High Quality (Slower)</SelectItem>
                            <SelectItem value="0.2">0.2mm - Standard (Recommended)</SelectItem>
                            <SelectItem value="0.3">0.3mm - Draft (Faster)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="supportType">Support Type *</Label>
                        {formErrors.supportType && (
                          <p className="text-sm text-red-500">{formErrors.supportType}</p>
                        )}
                        <Select
                          value={formData.supportType}
                          onValueChange={(value) => handleInputChange("supportType", value)}
                        >
                          <SelectTrigger className={formErrors.supportType ? "border-red-500" : ""}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Supports</SelectItem>
                            <SelectItem value="auto">Automatic Supports</SelectItem>
                            <SelectItem value="tree">Tree Supports (Easy Removal)</SelectItem>
                            <SelectItem value="custom">Custom (Discuss with Team)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Additional Services */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Post-Processing Services</Label>
                        <div className="space-y-2">
                          {[
                            { id: "sanding", label: "Sanding & Smoothing" },
                            { id: "priming", label: "Priming" },
                            { id: "painting", label: "Custom Painting" },
                            { id: "assembly", label: "Assembly" }
                          ].map((service) => (
                            <div key={service.id} className="flex items-center justify-between border rounded-lg p-3">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={service.id}
                                  checked={formData.postProcessing.includes(service.id)}
                                  onChange={(e) => {
                                    const updated = e.target.checked
                                      ? [...formData.postProcessing, service.id]
                                      : formData.postProcessing.filter((s) => s !== service.id);
                                    handleInputChange("postProcessing", updated);
                                  }}
                                  className="w-4 h-4"
                                />
                                <Label htmlFor={service.id} className="cursor-pointer">
                                  {service.label}
                                </Label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between border rounded-lg p-4 bg-blue-500/5">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="rushOrder"
                            checked={formData.rushOrder}
                            onChange={(e) => handleInputChange("rushOrder", e.target.checked)}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="rushOrder" className="cursor-pointer">
                            <div>Rush Order</div>
                            <div className="text-xs text-muted-foreground">
                              Get your prints delivered faster
                            </div>
                          </Label>
                        </div>
                        <Badge variant="outline">Fast Delivery</Badge>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Files & Notes */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="files">Upload 3D Files *</Label>
                        {formErrors.files && (
                          <p className="text-sm text-red-500">{formErrors.files}</p>
                        )}
                        <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                          <input
                            id="files"
                            type="file"
                            multiple
                            accept=".stl,.obj,.3mf,.step,.stp"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          <label htmlFor="files" className="cursor-pointer">
                            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <div className="mb-2">
                              {isSubmitting ? "Uploading..." : "Click to upload or drag and drop"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              STL, OBJ, 3MF, STEP files (Max 50MB each)
                            </div>
                          </label>
                        </div>
                        {uploadedFiles.length > 0 && (
                          <div className="space-y-2 mt-4">
                            {uploadedFiles.map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded">
                                <div className="flex items-center gap-2 flex-1">
                                  {file.isUploading ? (
                                    <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
                                  ) : file.googleDriveFileId ? (
                                    <Check className="w-4 h-4 flex-shrink-0 text-green-500" />
                                  ) : (
                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <div className="text-sm truncate">{file.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {(file.size / 1024 / 1024).toFixed(2)} MB • 
                                      {file.isUploading ? (
                                        <span className="ml-1">
                                          Uploading... {file.uploadProgress || 0}%
                                        </span>
                                      ) : file.googleDriveFileId ? (
                                        <span className="ml-1 text-green-500">Uploaded</span>
                                      ) : (
                                        <span className="ml-1">Ready to upload</span>
                                      )}
                                    </div>
                                    {file.isUploading && file.uploadProgress !== undefined && (
                                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                                        <div 
                                          className="bg-blue-600 h-1.5 rounded-full" 
                                          style={{ width: `${file.uploadProgress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => removeFile(file.id)}
                                  disabled={file.isUploading}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange("notes", e.target.value)}
                          placeholder="Any special instructions, requirements, or questions..."
                          rows={5}
                        />
                      </div>

                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <div className="mb-1">Before submitting:</div>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>• Ensure files are print-ready and manifold</li>
                              <li>• Check model orientation and scale</li>
                              <li>• Review all information for accuracy</li>
                              <li>• Review our file guidelines for best results</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-4 mt-8">
                    {step > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(step - 1)}
                        disabled={isSubmitting}
                      >
                        Previous
                      </Button>
                    )}
                    {step < 5 ? (
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="ml-auto"
                        disabled={isSubmitting}
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button 
                        type="submit" 
                        className="ml-auto" 
                        disabled={isSubmitting || Object.keys(formErrors).length > 0}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading & Submitting...
                          </>
                        ) : (
                          <>
                            Submit Project
                            <CheckCircle className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Submission Details Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Submission Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info */}
                <div className="pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{userDisplayName}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{user?.email}</div>
                </div>

                {/* Step 1: Basic Info */}
                {step >= 1 && (
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Project Name</div>
                    <div className="text-foreground truncate">{formData.projectName || "-"}</div>
                    <div className="text-sm text-muted-foreground">Client Name</div>
                    <div className="text-foreground">{formData.name || "-"}</div>
                  </div>
                )}

                {/* Step 2: Technology & Material */}
                {step >= 2 && (
                  <div className="pt-4 border-t space-y-1">
                    <div className="text-sm text-muted-foreground">Technology</div>
                    <div className="text-foreground capitalize">{formData.technology || "-"}</div>
                    <div className="text-sm text-muted-foreground">Material</div>
                    <div className="text-foreground capitalize">{formData.material.replace("-", " ") || "-"}</div>
                    <div className="text-sm text-muted-foreground">Color</div>
                    <div className="text-foreground">{formData.color || "-"}</div>
                    <div className="text-sm text-muted-foreground">Quantity</div>
                    <div className="text-foreground">{formData.quantity || 1}</div>
                  </div>
                )}

                {/* Step 3: Specifications */}
                {step >= 3 && (
                  <div className="pt-4 border-t space-y-1">
                    <div className="text-sm text-muted-foreground">Infill Density</div>
                    <div className="text-foreground">{formData.infill}%</div>
                    <div className="text-sm text-muted-foreground">Layer Height</div>
                    <div className="text-foreground">{formData.layerHeight} mm</div>
                    <div className="text-sm text-muted-foreground">Support Type</div>
                    <div className="text-foreground capitalize">{formData.supportType}</div>
                  </div>
                )}

                {/* Step 4: Additional Services */}
                {step >= 4 && (
                  <div className="pt-4 border-t space-y-1">
                    <div className="text-sm text-muted-foreground">Post-Processing</div>
                    {formData.postProcessing.length > 0 ? (
                      <div className="text-foreground text-sm">
                        {formData.postProcessing.map(p => 
                          p.charAt(0).toUpperCase() + p.slice(1)
                        ).join(', ')}
                      </div>
                    ) : (
                      <div className="text-foreground text-sm">None</div>
                    )}
                    <div className="text-sm text-muted-foreground">Rush Order</div>
                    <div className="text-foreground text-sm">{formData.rushOrder ? "Yes" : "No"}</div>
                  </div>
                )}

                {/* Step 5: Files */}
                {step >= 5 && (
                  <div className="pt-4 border-t space-y-1">
                    <div className="text-sm text-muted-foreground">Files Uploaded</div>
                    <div className="text-foreground text-sm">
                      {uploadedFiles.length} file(s)
                      {uploadedFiles.length > 0 && (
                        <div className="mt-1">
                          <div className="text-xs text-muted-foreground">
                            Uploaded: {uploadedFiles.filter(f => f.googleDriveFileId).length} / {uploadedFiles.length}
                          </div>
                          {totalUploadProgress > 0 && totalUploadProgress < 100 && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{ width: `${totalUploadProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Section */}
                <div className="pt-4 border-t space-y-2">
                  <div className="text-sm text-muted-foreground">
                    After submission, our team will:
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Review your project details</li>
                    <li>• Analyze 3D files for printability</li>
                    <li>• Prepare a detailed quotation</li>
                    <li>• Contact you within 24 hours</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProjectSubmissionPage;