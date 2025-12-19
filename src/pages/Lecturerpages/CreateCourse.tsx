
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/firebase_config';

interface Course {
  course_id: string;
  instructor_id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  thumbnail_url: string;
  price: number;
  currency: string;
  duration_hours: number;
  max_students: number | null;
  start_date: Date;
  end_date: Date;
  is_live: boolean;
  is_published: boolean;
  enrollment_count: number;
  average_rating: number;
  created_at: Date;
  updated_at: Date;
  is_visible: boolean;
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // State for form
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    difficulty_level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    category: '',
    price: 0,
    currency: 'XAF',
    duration_hours: 0,
    max_students: null as number | null,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
    is_live: false,
    is_published: false,
    is_visible: true,
  });

  // Categories for filtering
  const categories = ['all', 'Web Development', 'Data Science', 'Mobile Development', 'Design', 'Business', 'Marketing', 'Finance', 'Health'];

  // Load courses on component mount
  useEffect(() => {
    if (currentUser) {
      fetchCourses();
    } else {
      navigate('/login');
    }
  }, [currentUser]);

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Fetch courses from Firebase
  const fetchCourses = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const q = query(
        coursesRef, 
        where('instructor_id', '==', currentUser.uid),
        orderBy('created_at', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const coursesData: Course[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        coursesData.push({
          course_id: doc.id,
          ...data,
          start_date: data.start_date?.toDate() || new Date(),
          end_date: data.end_date?.toDate() || new Date(),
          created_at: data.created_at?.toDate() || new Date(),
          updated_at: data.updated_at?.toDate() || new Date(),
          is_visible: data.is_visible !== undefined ? data.is_visible : true,
        } as Course);
      });
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'price' || name === 'duration_hours') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'max_students') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : parseInt(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle thumbnail upload
  const handleThumbnailUpload = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    const storageRef = ref(storage, `course-thumbnails/${currentUser.uid}/${Date.now()}_${file.name}`);
    
    // Simulate upload progress
    const uploadTask = uploadBytes(storageRef, file);
    const snapshot = await uploadTask;
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('Please login to create courses');
      return;
    }
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      setUploadProgress(10);
      
      // Upload thumbnail if provided
      let thumbnailUrl = '';
      if (thumbnailFile) {
        setUploadProgress(30);
        thumbnailUrl = await handleThumbnailUpload(thumbnailFile);
        setUploadProgress(60);
      } else if (editingCourse) {
        thumbnailUrl = editingCourse.thumbnail_url;
      }

      const courseData = {
        ...formData,
        instructor_id: currentUser.uid,
        slug: generateSlug(formData.title),
        thumbnail_url: thumbnailUrl,
        enrollment_count: editingCourse?.enrollment_count || 0,
        average_rating: editingCourse?.average_rating || 0,
        created_at: editingCourse ? editingCourse.created_at : Timestamp.now(),
        updated_at: Timestamp.now(),
      };

      setUploadProgress(80);

      if (editingCourse) {
        // Update existing course
        const courseRef = doc(db, 'courses', editingCourse.course_id);
        await updateDoc(courseRef, courseData);
        alert('Course updated successfully!');
      } else {
        // Create new course
        await addDoc(collection(db, 'courses'), courseData);
        alert('Course created successfully!');
      }

      setUploadProgress(100);
      
      // Reset form
      resetForm();
      fetchCourses();
      
      // Wait a bit before resetting progress
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course');
      setUploadProgress(0);
    }
  };

  // Edit course
  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      short_description: course.short_description,
      difficulty_level: course.difficulty_level,
      category: course.category,
      price: course.price,
      currency: course.currency,
      duration_hours: course.duration_hours,
      max_students: course.max_students,
      start_date: course.start_date.toISOString().split('T')[0],
      end_date: course.end_date.toISOString().split('T')[0],
      is_live: course.is_live,
      is_published: course.is_published,
      is_visible: course.is_visible,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle course visibility
  const toggleVisibility = async (courseId: string, currentVisibility: boolean) => {
    try {
      const courseRef = doc(db, 'courses', courseId);
      await updateDoc(courseRef, {
        is_visible: !currentVisibility,
        updated_at: Timestamp.now()
      });
      
      fetchCourses();
      alert(`Course ${!currentVisibility ? 'published' : 'hidden'} successfully`);
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update course visibility');
    }
  };

  // Delete course
  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      fetchCourses();
      alert('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      short_description: '',
      difficulty_level: 'beginner',
      category: '',
      price: 0,
      currency: 'XAF',
      duration_hours: 0,
      max_students: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      is_live: false,
      is_published: false,
      is_visible: true,
    });
    setEditingCourse(null);
    setThumbnailFile(null);
  };

  // Filter courses based on search and category
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // View course details
  const viewCourseDetails = (courseId: string) => {
    navigate(`/training/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </h1>
          <p className="text-gray-600">
            {editingCourse 
              ? 'Update your course details below' 
              : 'Fill out the form below to create a new course'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Course Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Enter course title"
                    required
                  />
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description (max 500 characters)
                  </label>
                  <textarea
                    name="short_description"
                    value={formData.short_description}
                    onChange={handleInputChange}
                    maxLength={500}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Brief description of your course"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.short_description.length}/500 characters
                  </p>
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    placeholder="Detailed description of your course"
                  />
                </div>

                {/* Category & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      placeholder="e.g., Web Development"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty Level
                    </label>
                    <select
                      name="difficulty_level"
                      value={formData.difficulty_level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Price & Duration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (XAF)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      name="duration_hours"
                      value={formData.duration_hours}
                      onChange={handleInputChange}
                      min="0"
                      step="0.5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Dates & Max Students */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students (leave empty for unlimited)
                    </label>
                    <input
                      type="number"
                      name="max_students"
                      value={formData.max_students || ''}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Thumbnail
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="cursor-pointer">
                      <div className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition">
                        <span className="text-blue-600 font-medium">
                          {thumbnailFile ? thumbnailFile.name : 'Choose thumbnail image'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                    </label>
                    {thumbnailFile && (
                      <button
                        type="button"
                        onClick={() => setThumbnailFile(null)}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_live"
                      checked={formData.is_live}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Live Course</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Published</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={formData.is_visible}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-blue-600 rounded"
                    />
                    <span className="text-gray-700">Visible to Students</span>
                  </label>
                </div>

                {/* Progress Bar */}
                {uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                    </p>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-wrap gap-4 pt-6">
                  <button
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-md"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                  {editingCourse && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-8 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Right Column - Course List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Courses</h2>
                
                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  >
                    <option value="all">All Categories</option>
                    {categories.filter(cat => cat !== 'all').map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Course Count */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-gray-600">
                    {courses.filter(c => c.is_visible).length} visible
                  </span>
                </div>
              </div>

              {/* Course List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {filteredCourses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {courses.length === 0 
                      ? 'No courses yet. Create your first course!' 
                      : 'No courses match your search'}
                  </div>
                ) : (
                  filteredCourses.map((course) => (
                    <div
                      key={course.course_id}
                      className={`p-4 rounded-lg border ${!course.is_visible ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {course.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded ${course.is_visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {course.is_visible ? 'Visible' : 'Hidden'}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {course.short_description || course.description.substring(0, 100)}...
                      </p>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span>{course.category}</span>
                        <span className="font-medium">{course.difficulty_level}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleVisibility(course.course_id, course.is_visible)}
                          className={`px-3 py-1 text-sm rounded transition ${
                            course.is_visible 
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {course.is_visible ? 'Hide' : 'Show'}
                        </button>
                        <button
                          onClick={() => viewCourseDetails(course.course_id)}
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(course.course_id)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;
