import React, { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Download,
  Upload,
  Filter,
  Search,
  Calendar,
  Users,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreVertical,
  BarChart3,
  MessageSquare,
  Share2,
  Archive,
  RefreshCw,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { ROLES } from '../../../constants/roles';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  where,
  orderBy,
  Timestamp,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase_config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/firebase_config';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: 'draft' | 'in-progress' | 'review' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  assignedTo: string[];
  createdBy: string;
  attachments: {
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  progress: number;
  budget: number;
  estimatedHours: number;
  actualHours: number;
  notes: string[];
  visibility: 'public' | 'private' | 'team';
}

const ProjectManagement: React.FC = () => {
  const { userData } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: '',
    tags: [] as string[],
    status: 'draft' as const,
    priority: 'medium' as const,
    dueDate: '',
    assignedTo: [] as string[],
    budget: 0,
    estimatedHours: 0,
    visibility: 'team' as const
  });
  const [newTag, setNewTag] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const isAdmin = userData?.role === ROLES.CENTER_ADMIN || ROLES.SUPER_ADMIN;

  // Fetch projects from Firestore
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsRef = collection(db, 'projects');
      let q = query(projectsRef, orderBy('createdAt', 'desc'));
      
      // Apply filters
      if (statusFilter !== 'all') {
        q = query(q, where('status', '==', statusFilter));
      }
      if (priorityFilter !== 'all') {
        q = query(q, where('priority', '==', priorityFilter));
      }
      if (categoryFilter !== 'all') {
        q = query(q, where('category', '==', categoryFilter));
      }

      const snapshot = await getDocs(q);
      const projectsList: Project[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        projectsList.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString() 
            : data.createdAt,
          updatedAt: data.updatedAt instanceof Timestamp 
            ? data.updatedAt.toDate().toISOString() 
            : data.updatedAt,
          dueDate: data.dueDate instanceof Timestamp 
            ? data.dueDate.toDate().toISOString() 
            : data.dueDate,
        } as Project);
      });

      setProjects(projectsList);
      setFilteredProjects(projectsList);
    } catch (error) {
      console.error('Error fetching projects:', error);
      alert('Failed to fetch projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, priorityFilter, categoryFilter]);

  // Apply search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(searchLower) ||
      project.description.toLowerCase().includes(searchLower) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      project.category.toLowerCase().includes(searchLower)
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  // Get unique categories
  const categories = Array.from(new Set(projects.map(p => p.category))).filter(Boolean);

  // Handle project creation
  const handleCreateProject = async () => {
    try {
      const projectData = {
        ...newProject,
        createdBy: userData?.uid || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        progress: 0,
        actualHours: 0,
        attachments: [],
        notes: []
      };

      await addDoc(collection(db, 'projects'), projectData);
      
      setShowNewModal(false);
      resetNewProjectForm();
      fetchProjects();
      alert('Project created successfully!');
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  // Handle project update
  const handleUpdateProject = async () => {
    if (!currentProject) return;

    try {
      const projectRef = doc(db, 'projects', currentProject.id);
      await updateDoc(projectRef, {
        ...currentProject,
        updatedAt: serverTimestamp()
      });

      setShowEditModal(false);
      fetchProjects();
      alert('Project updated successfully!');
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };

  // Handle project deletion
  const handleDeleteProject = async () => {
    if (!currentProject) return;

    try {
      await deleteDoc(doc(db, 'projects', currentProject.id));
      setShowDeleteModal(false);
      fetchProjects();
      alert('Project deleted successfully!');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (file: File, projectId: string) => {
    try {
      setUploading(true);
      const storageRef = ref(storage, `projects/${projectId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Update project with new attachment
      const projectRef = doc(db, 'projects', projectId);
      const project = projects.find(p => p.id === projectId);
      
      if (project) {
        await updateDoc(projectRef, {
          attachments: [...project.attachments, {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size
          }],
          updatedAt: serverTimestamp()
        });
      }

      fetchProjects();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Reset new project form
  const resetNewProjectForm = () => {
    setNewProject({
      title: '',
      description: '',
      category: '',
      tags: [],
      status: 'draft',
      priority: 'medium',
      dueDate: '',
      assignedTo: [],
      budget: 0,
      estimatedHours: 0,
      visibility: 'team'
    });
    setNewTag('');
  };

  // Add tag to new project
  const handleAddTag = () => {
    if (newTag.trim() && !newProject.tags.includes(newTag.trim())) {
      setNewProject({
        ...newProject,
        tags: [...newProject.tags, newTag.trim()]
      });
      setNewTag('');
    }
  };

  // Remove tag from new project
  const handleRemoveTag = (tagToRemove: string) => {
    setNewProject({
      ...newProject,
      tags: newProject.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'review': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'archived': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    published: projects.filter(p => p.status === 'published').length,
    inProgress: projects.filter(p => p.status === 'in-progress').length,
    overdue: projects.filter(p => 
      p.dueDate && new Date(p.dueDate) < new Date() && p.status !== 'published' && p.status !== 'archived'
    ).length
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              Admin privileges are required to access project management.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-2">Manage and track all projects</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                {viewMode === 'list' ? 'Grid View' : 'List View'}
              </button>
              <button
                onClick={fetchProjects}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Projects</p>
                  <p className="text-2xl font-bold mt-1">{projectStats.total}</p>
                </div>
                <FolderKanban className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Published</p>
                  <p className="text-2xl font-bold mt-1">{projectStats.published}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold mt-1">{projectStats.inProgress}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Overdue</p>
                  <p className="text-2xl font-bold mt-1">{projectStats.overdue}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium mb-2">Search Projects</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, description, or tags..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in-progress">In Progress</option>
                <option value="review">Review</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Projects Actions */}
          {selectedProjects.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <span className="font-medium text-blue-700">
                  {selectedProjects.length} project(s) selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Handle bulk actions
                  }}
                  className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-1"
                >
                  <Archive className="w-3 h-3" />
                  Archive Selected
                </button>
                <button
                  onClick={() => {
                    // Handle bulk delete
                  }}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-3 text-gray-600">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center">
              <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Try adjusting your search or filters' : 'No projects created yet'}
              </p>
              <button
                onClick={() => setShowNewModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Your First Project
              </button>
            </div>
          ) : viewMode === 'list' ? (
            // List View
            filteredProjects.map((project) => (
              <div key={project.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-xl font-semibold">{project.title}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                          {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Created: {formatDate(project.createdAt)}</span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Due: {formatDate(project.dueDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          <span>{project.category}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{project.assignedTo.length} assigned</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart3 className="w-4 h-4" />
                          <span>{project.progress}% complete</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {project.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      >
                        {expandedProject === project.id ? 'Show Less' : 'View Details'}
                        {expandedProject === project.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentProject(project);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentProject(project);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProject === project.id && (
                    <div className="border-t pt-4 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Project Details */}
                        <div>
                          <h4 className="font-medium mb-3">Project Details</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Budget:</span>
                              <span className="font-medium">${project.budget.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated Hours:</span>
                              <span className="font-medium">{project.estimatedHours}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Actual Hours:</span>
                              <span className="font-medium">{project.actualHours}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Visibility:</span>
                              <span className="font-medium capitalize">{project.visibility}</span>
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <h4 className="font-medium mb-3">Progress</h4>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{project.progress}% complete</p>
                        </div>

                        {/* Attachments */}
                        <div className="md:col-span-2">
                          <h4 className="font-medium mb-3">Attachments ({project.attachments.length})</h4>
                          {project.attachments.length > 0 ? (
                            <div className="space-y-2">
                              {project.attachments.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <p className="font-medium">{file.name}</p>
                                      <p className="text-sm text-gray-500">
                                        {(file.size / 1024).toFixed(2)} KB • {file.type}
                                      </p>
                                    </div>
                                  </div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">No attachments yet</p>
                          )}

                          {/* Upload New File */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">Upload New File</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file, project.id);
                                  }
                                }}
                                className="flex-1 p-2 border rounded-lg"
                              />
                              {uploading && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${uploadProgress}%` }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-1">{project.title}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Category:</span>
                        <span className="font-medium">{project.category}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium">{formatDate(project.dueDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Progress:</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setCurrentProject(project);
                            setShowEditModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setCurrentProject(project);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {expandedProject === project.id ? 'Less' : 'More'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Create New Project</h3>
                <button
                  onClick={() => {
                    setShowNewModal(false);
                    resetNewProjectForm();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="Enter project title"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <input
                      type="text"
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="e.g., Design, Development, Marketing"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as any })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as any })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Due Date</label>
                    <input
                      type="date"
                      value={newProject.dueDate}
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Budget ($)</label>
                    <input
                      type="number"
                      value={newProject.budget}
                      onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                    <input
                      type="number"
                      value={newProject.estimatedHours}
                      onChange={(e) => setNewProject({ ...newProject, estimatedHours: Number(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Visibility</label>
                    <select
                      value={newProject.visibility}
                      onChange={(e) => setNewProject({ ...newProject, visibility: e.target.value as any })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="private">Private</option>
                      <option value="team">Team</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-3 border rounded-lg h-32"
                    placeholder="Describe the project..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 p-3 border rounded-lg"
                      placeholder="Add a tag and press Enter"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newProject.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Assign To (User IDs)</label>
                  <input
                    type="text"
                    value={newProject.assignedTo.join(', ')}
                    onChange={(e) => setNewProject({ 
                      ...newProject, 
                      assignedTo: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                    })}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter user IDs separated by commas"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => {
                    setShowNewModal(false);
                    resetNewProjectForm();
                  }}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateProject}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  disabled={!newProject.title || !newProject.description || !newProject.category}
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Edit Project</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Project Title *</label>
                    <input
                      type="text"
                      value={currentProject.title}
                      onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <input
                      type="text"
                      value={currentProject.category}
                      onChange={(e) => setCurrentProject({ ...currentProject, category: e.target.value })}
                      className="w-full p-3 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={currentProject.status}
                      onChange={(e) => setCurrentProject({ ...currentProject, status: e.target.value as any })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="draft">Draft</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Priority</label>
                    <select
                      value={currentProject.priority}
                      onChange={(e) => setCurrentProject({ ...currentProject, priority: e.target.value as any })}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={currentProject.progress}
                      onChange={(e) => setCurrentProject({ ...currentProject, progress: Number(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Budget ($)</label>
                    <input
                      type="number"
                      value={currentProject.budget}
                      onChange={(e) => setCurrentProject({ ...currentProject, budget: Number(e.target.value) })}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={currentProject.description}
                    onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                    className="w-full p-3 border rounded-lg h-32"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProject}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold">Delete Project</h3>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{currentProject?.title}"?
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCurrentProject(null);
                }}
                className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;