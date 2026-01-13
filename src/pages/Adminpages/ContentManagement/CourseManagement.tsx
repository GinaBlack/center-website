import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../firebase/firebase_config';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
  query, where, orderBy, writeBatch 
} from 'firebase/firestore';

interface TrainingProgram {
  id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: string;
  prerequisites: string[];
  learningOutcomes: string[];
  syllabus: string[];
  instructor: string;
  schedule: string;
  location: string;
  maxParticipants: number;
  contactEmail: string;
  contactPhone: string;
  imageUrl: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

const CourseManagement = () => {
  const { currentUser } = useAuth();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [lecturers, setLecturers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [programToDelete, setProgramToDelete] = useState<string | null>(null);
  const [expandedProgram, setExpandedProgram] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState<TrainingProgram>({
    title: '',
    description: '',
    category: 'Business & Administration',
    duration: '',
    price: '',
    prerequisites: [],
    learningOutcomes: [],
    syllabus: [],
    instructor: '--',
    schedule: '',
    location: '',
    maxParticipants: 30,
    contactEmail: 'enspy.cep@polytechnique.cm',
    contactPhone: '+237 222 22 45 47',
    imageUrl: '',
    isVisible: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [prereqInput, setPrereqInput] = useState('');
  const [outcomeInput, setOutcomeInput] = useState('');
  const [syllabusInput, setSyllabusInput] = useState('');

  // Categories
  const categories = [
    'Business & Administration',
    'Engineering & Technology',
    'Engineering',
    'Technology & Innovation',
    'IT & Networking',
    'Engineering Software'
  ];

  // Fetch programs and lecturers from Firebase
  useEffect(() => {
    if (currentUser) {
      fetchPrograms();
      fetchLecturers();
    }
  }, [currentUser]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const programsRef = collection(db, 'trainingPrograms');
      const q = query(programsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const programsData: TrainingProgram[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        programsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as TrainingProgram);
      });

      setPrograms(programsData);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchLecturers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', 'in', ['lecturer', 'admin', 'instructor']));
      const querySnapshot = await getDocs(q);
      
      const lecturersData: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        lecturersData.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName || data.email?.split('@')[0],
          role: data.role,
        } as User);
      });

      setLecturers(lecturersData);
    } catch (err) {
      console.error('Error fetching lecturers:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setImageUploading(true);
      
      // For ImgBB upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Using ImgBB API (replace with your own API key)
      const response = await fetch('https://api.imgbb.com/1/upload?key=6136f4b5f3aa641cf6def0325ed0adce', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ ...prev, imageUrl: data.data.url }));
        setSuccess('Image uploaded successfully!');
        return data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
      throw err;
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'maxParticipants' ? parseInt(value) : value
    });
  };

  const handleAddPrereq = () => {
    if (prereqInput.trim()) {
      setFormData({
        ...formData,
        prerequisites: [...formData.prerequisites, prereqInput.trim()]
      });
      setPrereqInput('');
    }
  };

  const handleRemovePrereq = (index: number) => {
    const newPrereqs = formData.prerequisites.filter((_, i) => i !== index);
    setFormData({ ...formData, prerequisites: newPrereqs });
  };

  const handleAddOutcome = () => {
    if (outcomeInput.trim()) {
      setFormData({
        ...formData,
        learningOutcomes: [...formData.learningOutcomes, outcomeInput.trim()]
      });
      setOutcomeInput('');
    }
  };

  const handleRemoveOutcome = (index: number) => {
    const newOutcomes = formData.learningOutcomes.filter((_, i) => i !== index);
    setFormData({ ...formData, learningOutcomes: newOutcomes });
  };

  const handleAddSyllabus = () => {
    if (syllabusInput.trim()) {
      setFormData({
        ...formData,
        syllabus: [...formData.syllabus, syllabusInput.trim()]
      });
      setSyllabusInput('');
    }
  };

  const handleRemoveSyllabus = (index: number) => {
    const newSyllabus = formData.syllabus.filter((_, i) => i !== index);
    setFormData({ ...formData, syllabus: newSyllabus });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to manage courses');
      return;
    }

    try {
      let imageUrl = formData.imageUrl;
      
      // Upload image if a new file was selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const programsRef = collection(db, 'trainingPrograms');
      const now = new Date();
      
      if (editingProgram && editingProgram.id) {
        // Update existing program
        const programRef = doc(db, 'trainingPrograms', editingProgram.id);
        await updateDoc(programRef, {
          ...formData,
          imageUrl,
          updatedAt: now,
        });
        setSuccess('Program updated successfully!');
      } else {
        // Add new program
        await addDoc(programsRef, {
          ...formData,
          imageUrl,
          createdAt: now,
          updatedAt: now,
        });
        setSuccess('Program added successfully!');
      }

      resetForm();
      fetchPrograms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving program:', err);
      setError('Failed to save program');
    }
  };

  const handleEdit = (program: TrainingProgram) => {
    setEditingProgram(program);
    setFormData({
      ...program,
      prerequisites: [...program.prerequisites],
      learningOutcomes: [...program.learningOutcomes],
      syllabus: [...program.syllabus],
    });
    if (program.imageUrl) {
      setImagePreview(program.imageUrl);
    }
    setImageFile(null);
    setShowAddForm(true);
  };

  const handleDelete = async () => {
    if (!programToDelete) return;

    try {
      const programRef = doc(db, 'trainingPrograms', programToDelete);
      await deleteDoc(programRef);
      
      setSuccess('Program deleted successfully!');
      setShowConfirmDelete(false);
      setProgramToDelete(null);
      fetchPrograms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Failed to delete program');
    }
  };

  const handleToggleVisibility = async (programId: string, currentVisibility: boolean) => {
    try {
      const programRef = doc(db, 'trainingPrograms', programId);
      await updateDoc(programRef, {
        isVisible: !currentVisibility,
        updatedAt: new Date(),
      });
      
      setSuccess(`Program ${!currentVisibility ? 'published' : 'hidden'} successfully!`);
      fetchPrograms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error toggling visibility:', err);
      setError('Failed to update program visibility');
    }
  };

  const handleAssignLecturer = async (programId: string, lecturerId: string, lecturerName: string) => {
    try {
      const programRef = doc(db, 'trainingPrograms', programId);
      await updateDoc(programRef, {
        instructor: lecturerName,
        instructorId: lecturerId,
        updatedAt: new Date(),
      });
      
      setSuccess(`Lecturer assigned successfully!`);
      fetchPrograms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error assigning lecturer:', err);
      setError('Failed to assign lecturer');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Business & Administration',
      duration: '',
      price: '',
      prerequisites: [],
      learningOutcomes: [],
      syllabus: [],
      instructor: '--',
      schedule: '',
      location: '',
      maxParticipants: 30,
      contactEmail: 'enspy.cep@polytechnique.cm',
      contactPhone: '+237 222 22 45 47',
      imageUrl: '',
      isVisible: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setPrereqInput('');
    setOutcomeInput('');
    setSyllabusInput('');
    setImageFile(null);
    setImagePreview('');
    setEditingProgram(null);
    setShowAddForm(false);
  };

  const getCurrentParticipants = async (programId: string) => {
    try {
      const registrationsRef = collection(db, 'registrations');
      const q = query(registrationsRef, where('programId', '==', programId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (err) {
      console.error('Error getting participants:', err);
      return 0;
    }
  };

  const toggleExpandProgram = async (programId: string) => {
    if (expandedProgram === programId) {
      setExpandedProgram(null);
    } else {
      setExpandedProgram(programId);
    }
  };

  const handleViewStudents = (programId: string) => {
    window.location.href = `/admin/courses/${programId}/students`;
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You must be logged in as an administrator to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Management</h1>
          <p className="text-gray-600">Manage training programs and workshops</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {success}
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* Add/Edit Form Toggle */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add New Program'}
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProgram ? 'Edit Program' : 'Add New Program'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter program title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                  title='n'
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructor
                  </label>
                  <select
                  title='n'
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="--">-- Not Assigned --</option>
                    {lecturers.map((lecturer) => (
                      <option key={lecturer.id} value={lecturer.displayName}>
                        {lecturer.displayName} ({lecturer.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 6 months"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 350,000 XAF"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Participants *
                  </label>
                  <input
                  title='n'
                    type="number"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Schedule *
                  </label>
                  <input
                    type="text"
                    name="schedule"
                    value={formData.schedule}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Monday, Wednesday, Friday - 6:00 PM to 9:00 PM"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., CEP-ENSPY Campus, Yaoundé"
                  />
                </div>

                {/* Image Picker - Replaced Image URL field */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Program Image
                  </label>
                  
                  {imagePreview ? (
                    <div className="mb-4">
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                        title='n'
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.imageUrl && !imageFile ? 'Using existing image' : 'New image selected'}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition cursor-pointer">
                        <label htmlFor="imageUpload" className="text-center cursor-pointer">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="block text-sm text-gray-600">Click to upload</span>
                          <span className="block text-xs text-gray-500">JPEG, PNG, GIF, WebP</span>
                          <span className="block text-xs text-gray-500">Max 5MB</span>
                        </label>
                        <input
                          id="imageUpload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <label htmlFor="imageUpload" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer text-sm font-medium">
                      {imagePreview ? 'Change Image' : 'Upload Image'}
                    </label>
                    <input
                      id="imageUpload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imageUploading && (
                      <span className="text-sm text-gray-500 flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Uploading...
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to use category-based color background
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter program description"
                />
              </div>

              {/* Array Inputs (Prerequisites, Outcomes, Syllabus) */}
              {/* ... (keep the existing array input components) ... */}

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  disabled={imageUploading}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {imageUploading ? 'Uploading Image...' : editingProgram ? 'Update Program' : 'Add Program'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Programs List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">All Programs ({programs.length})</h2>
              {loading && (
                <div className="text-sm text-gray-500">Loading...</div>
              )}
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="text-lg text-gray-600">Loading programs...</div>
            </div>
          ) : programs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 mb-4">No programs found</div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Add Your First Program
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {programs.map((program) => (
                <div key={program.id} className="p-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Program Image/Color */}
                    <div className={`w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 ${program.imageUrl ? '' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
                      {program.imageUrl ? (
                        <img 
                          src={program.imageUrl} 
                          alt={program.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            {program.title.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Program Info */}
                    <div className="flex-1">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{program.title}</h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              {program.category}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                              {program.duration}
                            </span>
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              {program.price}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleToggleVisibility(program.id!, program.isVisible)}
                            className={`px-3 py-1 rounded text-sm ${program.isVisible ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                          >
                            {program.isVisible ? 'Hide' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleEdit(program)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              setProgramToDelete(program.id!);
                              setShowConfirmDelete(true);
                            }}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Quick Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-500">Instructor</div>
                          <div className={`font-medium ${program.instructor === '--' ? 'text-gray-400 italic' : ''}`}>
                            {program.instructor}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Schedule</div>
                          <div className="font-medium">{program.schedule}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Location</div>
                          <div className="font-medium">{program.location}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Students</div>
                          <button
                            onClick={() => handleViewStudents(program.id!)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            View Students →
                          </button>
                        </div>
                      </div>

                      {/* Lecturer Assignment */}
                      {lecturers.length > 0 && (
                        <div className="mb-4">
                          <div className="text-sm text-gray-500 mb-2">Assign Lecturer</div>
                          <div className="flex flex-wrap gap-2">
                            <select
                            title='n'
                              onChange={(e) => {
                                const lecturer = lecturers.find(l => l.displayName === e.target.value);
                                if (lecturer) {
                                  handleAssignLecturer(program.id!, lecturer.id, lecturer.displayName);
                                }
                              }}
                              className="px-3 py-1 border rounded text-sm"
                            >
                              <option value="">Assign lecturer...</option>
                              {lecturers.map((lecturer) => (
                                <option key={lecturer.id} value={lecturer.displayName}>
                                  {lecturer.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => toggleExpandProgram(program.id!)}
                        className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedProgram === program.id ? 'Hide Details' : 'Show Full Details'}
                        <svg className={`w-4 h-4 ml-1 transition-transform ${expandedProgram === program.id ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      {/* Expanded Details */}
                      {expandedProgram === program.id && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Description */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                              <p className="text-gray-600">{program.description}</p>
                            </div>

                            {/* Syllabus */}
                            {program.syllabus.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Syllabus</h4>
                                <ul className="space-y-1">
                                  {program.syllabus.slice(0, 3).map((item, index) => (
                                    <li key={index} className="flex items-start text-sm text-gray-600">
                                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                  {program.syllabus.length > 3 && (
                                    <li className="text-sm text-gray-500">
                                      + {program.syllabus.length - 3} more items
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            {/* Contact Info */}
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div>Email: {program.contactEmail}</div>
                                <div>Phone: {program.contactPhone}</div>
                              </div>
                            </div>

                            {/* Image URL */}
                            {program.imageUrl && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Image</h4>
                                <div className="flex items-center gap-2">
                                  <div className="w-12 h-12 rounded overflow-hidden">
                                    <img src={program.imageUrl} alt={program.title} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    <a href={program.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      View image
                                    </a>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{programs.length}</div>
            <div className="text-gray-600">Total Programs</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {programs.filter(p => p.isVisible).length}
            </div>
            <div className="text-gray-600">Published Programs</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {programs.filter(p => p.instructor !== '--').length}
            </div>
            <div className="text-gray-600">Assigned Instructors</div>
          </div>
          <div className="bg-white rounded-xl shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {categories.length}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this program? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  setProgramToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;