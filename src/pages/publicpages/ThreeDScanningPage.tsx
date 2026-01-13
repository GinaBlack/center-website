import { motion } from "framer-motion";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Scan, Layers, FileCheck, ArrowRight, User, Mail, Phone, Package, AlertCircle, Calendar, DollarSign, Ruler } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase_config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ThreeDScanningPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    objectDescription: '',
    objectDimensions: '',
    scanPurpose: '',
    requiredAccuracy: 'Medium',
    urgency: 'Standard',
    quantity: 1,
    budgetRange: '',
    deadline: '',
    additionalNotes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);

  // Auto-fill user information when component loads
  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      }));
    }
    setUserInfoLoaded(true);
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to submit a 3D scanning request');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "3d_scanning_requests"), {
        ...formData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setSuccess(true);
      // Reset form
      setFormData({
        name: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: '',
        company: '',
        objectDescription: '',
        objectDimensions: '',
        scanPurpose: '',
        requiredAccuracy: 'Medium',
        urgency: 'Standard',
        quantity: 1,
        budgetRange: '',
        deadline: '',
        additionalNotes: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scanningServices = [
    {
      icon: <Scan className="h-10 w-10" />,
      title: "High-Precision 3D Scanning",
      description: "Capture detailed geometry with micron-level accuracy using advanced structured light and laser scanners."
    },
    {
      icon: <Layers className="h-10 w-10" />,
      title: "Reverse Engineering",
      description: "Convert physical parts into CAD models for manufacturing, analysis, or documentation."
    },
    {
      icon: <FileCheck className="h-10 w-10" />,
      title: "Quality Inspection",
      description: "Compare scanned data with original CAD designs to identify deviations and ensure quality standards."
    }
  ];

  const scanningProcess = [
    {
      step: 1,
      title: "Consultation & Planning",
      description: "Discuss project requirements, object characteristics, and desired outcomes."
    },
    {
      step: 2,
      title: "Preparation & Setup",
      description: "Prepare the object, apply scanning targets if needed, and calibrate equipment."
    },
    {
      step: 3,
      title: "Scanning Session",
      description: "Capture comprehensive 3D data from multiple angles for complete coverage."
    },
    {
      step: 4,
      title: "Data Processing",
      description: "Clean, align, and merge scan data into a cohesive 3D model."
    },
    {
      step: 5,
      title: "Model Refinement",
      description: "Fill holes, smooth surfaces, and prepare the model for its intended use."
    },
    {
      step: 6,
      title: "Delivery & Support",
      description: "Provide final files in requested formats along with technical support."
    }
  ];

  if (!userInfoLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto text-center mb-16"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
          <Scan className="h-10 w-10 text-blue-600" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          Professional 3D Scanning Services
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Transform physical objects into precise digital 3D models using state-of-the-art scanning technology for design, analysis, reverse engineering, and manufacturing.
        </p>
        
        {!currentUser && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 max-w-2xl mx-auto mb-8">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-yellow-400 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium">Login Required</p>
                <p>You need to be logged in to submit a 3D scanning request. Please login or create an account.</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Services Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Scanning Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {scanningServices.map((service, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow rounded-2xl">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Process Flow */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mb-16"
      >
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our 6-Step Process</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scanningProcess.map((step) => (
            <div key={step.step} className="relative">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow rounded-xl h-full">
                <CardContent className="p-6">
                  <div className="absolute -top-4 -left-4 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-lg font-semibold mb-2 mt-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Booking / Request Form Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <Card className="rounded-2xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">Request 3D Scanning Service</h2>
            <p className="text-blue-100">Fill out the form below and our team will contact you within 24 hours</p>
          </div>
          
          <CardContent className="p-8 md:p-10">
            {success ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <FileCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-4">Request Submitted Successfully!</h3>
                <p className="text-gray-600 mb-6">
                  Thank you for your 3D scanning request. Our team will review your submission and contact you within 24 hours to discuss project details and pricing.
                </p>
                <Button 
                  onClick={() => setSuccess(false)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <>
                {currentUser ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-blue-700 font-medium">
                        Logged in as: {currentUser.email}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700 font-medium">
                        You must be logged in to submit a request. 
                        <Button 
                          variant="link" 
                          className="ml-2 p-0 h-auto"
                          onClick={() => navigate('/login')}
                        >
                          Login here
                        </Button>
                      </span>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <User className="h-5 w-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input 
                            type="text" 
                            name="name" 
                            placeholder="John Doe" 
                            required 
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input 
                            type="email" 
                            name="email" 
                            placeholder="john@example.com" 
                            required 
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input 
                            type="tel" 
                            name="phone" 
                            placeholder="+237 6XX XX XX XX" 
                            required 
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company / Organization
                        </label>
                        <input 
                          type="text" 
                          name="company" 
                          placeholder="Your company name" 
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={!currentUser}
                        />
                      </div>
                    </div>
                    
                    {/* Project Details */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Package className="h-5 w-5 mr-2 text-blue-600" />
                        Project Details
                      </h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Object Description *
                        </label>
                        <input 
                          type="text" 
                          name="objectDescription" 
                          placeholder="What object needs to be scanned?" 
                          required 
                          value={formData.objectDescription}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={!currentUser}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Object Dimensions
                        </label>
                        <div className="relative">
                          <Ruler className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input 
                            type="text" 
                            name="objectDimensions" 
                            placeholder="e.g., 30cm x 20cm x 15cm" 
                            value={formData.objectDimensions}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Scan Purpose *
                        </label>
                        <select 
                          name="scanPurpose" 
                          required 
                          value={formData.scanPurpose}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={!currentUser}
                        >
                          <option value="">Select purpose</option>
                          <option value="reverse_engineering">Reverse Engineering</option>
                          <option value="quality_inspection">Quality Inspection</option>
                          <option value="documentation">Documentation / Archiving</option>
                          <option value="3d_printing">3D Printing / Replication</option>
                          <option value="digital_twin">Digital Twin Creation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Required Accuracy
                          </label>
                          <select 
                            name="requiredAccuracy" 
                            value={formData.requiredAccuracy}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          >
                            <option value="Low">Low (±1mm)</option>
                            <option value="Medium">Medium (±0.1mm)</option>
                            <option value="High">High (±0.01mm)</option>
                            <option value="Ultra">Ultra High (±0.001mm)</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input 
                            type="number" 
                            name="quantity" 
                            min="1" 
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Project Urgency
                        </label>
                        <select 
                          name="urgency" 
                          value={formData.urgency}
                          onChange={handleChange}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={!currentUser}
                        >
                          <option value="Standard">Standard (1-2 weeks)</option>
                          <option value="Express">Express (3-5 days)</option>
                          <option value="Urgent">Urgent (1-2 days)</option>
                          <option value="Rush">Rush (24 hours)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Budget Range
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <input 
                            type="text" 
                            name="budgetRange" 
                            placeholder="e.g., $500 - $1000" 
                            value={formData.budgetRange}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            disabled={!currentUser}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Desired Deadline
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input 
                          type="date" 
                          name="deadline" 
                          value={formData.deadline}
                          onChange={handleChange}
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          disabled={!currentUser}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes / Special Requirements
                      </label>
                      <textarea 
                        name="additionalNotes" 
                        placeholder="Any special requirements, material information, or additional details..."
                        rows={4} 
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                        disabled={!currentUser}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button 
                      type="submit" 
                      size="lg" 
                      className="w-full py-6 text-lg rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || !currentUser}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting Request...
                        </span>
                      ) : !currentUser ? (
                        'Login to Submit Request'
                      ) : (
                        <span className="flex items-center justify-center">
                          Submit 3D Scanning Request
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </span>
                      )}
                    </Button>
                    
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      By submitting this form, you agree to our terms of service. Our team will contact you within 24 hours.
                    </p>
                  </div>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
