import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  MapPin,
  Users,
  BookOpen,
  Layers,
  Computer,
  Usb,
  X,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  ExternalLink,
  FileText,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { db, getDoc } from '../../../firebase/firebase_config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  Timestamp,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { sendNotification } from '../../../utils/sendNotifications';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'react-hot-toast';
import { ROLES } from '../../../constants/roles';

// Type Definitions
type CourseStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed' | 'payment_pending';
type TrainingType = '3d-printing' | 'cad' | 'high-tech' | string;

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  price: number;
  schedule: string;
  location: string;
  instructor: string;
  maxParticipants: number;
  currentParticipants: number;
  imageUrl?: string;
  isVisible: boolean;
}

interface UserCourse {
  id: string;
  userId: string;
  programId: string;
  status: CourseStatus;
  registeredAt: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  course?: Course;
}

const MyCoursesPage: React.FC = () => {
  const { currentUser, userData, isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<UserCourse | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const navigate = useNavigate();

  // Fetch user's registered courses - FIXED QUERY (no orderBy to avoid index requirement)
  useEffect(() => {
    if (!currentUser || !isAuthenticated) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchUserCourses = async () => {
      try {
        setLoading(true);

        // Fetch user's course registrations - SIMPLIFIED QUERY
        const registrationsRef = collection(db, 'registrations');
        const q = query(
          registrationsRef,
          where('userId', '==', currentUser.uid)
          // Removed: orderBy('registeredAt', 'desc') - This requires composite index
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          if (!mounted) return;

          const userCoursesData: UserCourse[] = [];
          
          for (const registrationDoc of snapshot.docs) {
            const registrationData = registrationDoc.data();
            
            // Fetch course details
            const courseRef = doc(db, 'trainingPrograms', registrationData.programId);
            const courseSnap = await getDoc(courseRef);
            
            if (courseSnap.exists()) {
              const courseData = courseSnap.data();
              
              // Handle registeredAt date
              let registeredAt: Date;
              if (registrationData.registeredAt) {
                if (typeof registrationData.registeredAt.toDate === 'function') {
                  registeredAt = registrationData.registeredAt.toDate();
                } else if (registrationData.registeredAt instanceof Date) {
                  registeredAt = registrationData.registeredAt;
                } else {
                  registeredAt = new Date(registrationData.registeredAt);
                }
              } else {
                registeredAt = new Date();
              }

              userCoursesData.push({
                id: registrationDoc.id,
                userId: registrationData.userId,
                programId: registrationData.programId,
                status: registrationData.status || 'pending',
                registeredAt: registeredAt,
                paymentStatus: registrationData.paymentStatus || 'pending',
                paymentId: registrationData.paymentId,
                course: {
                  id: courseSnap.id,
                  title: courseData.title,
                  description: courseData.description,
                  category: courseData.category,
                  duration: courseData.duration,
                  price: courseData.price,
                  schedule: courseData.schedule,
                  location: courseData.location,
                  instructor: courseData.instructor || '--',
                  maxParticipants: courseData.maxParticipants,
                  currentParticipants: courseData.currentParticipants || 0,
                  imageUrl: courseData.imageUrl,
                  isVisible: courseData.isVisible !== false,
                }
              });
            }
          }

          // Sort by date CLIENT-SIDE (no index required)
          userCoursesData.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());

          setCourses(userCoursesData);
          setLoading(false);
        }, (error) => {
          console.error('Firestore error:', error);
          // Fallback to regular fetch if real-time fails
          fetchCoursesOnce();
        });

        return () => {
          mounted = false;
          unsubscribe();
        };
      } catch (error) {
        console.error('Error setting up subscription:', error);
        // Fallback to regular fetch
        fetchCoursesOnce();
      }
    };

    // Fallback function - fetch courses once without real-time
    const fetchCoursesOnce = async () => {
      try {
        const registrationsRef = collection(db, 'registrations');
        const q = query(
          registrationsRef,
          where('userId', '==', currentUser.uid)
        );

        const querySnapshot = await getDocs(q);
        const userCoursesData: UserCourse[] = [];

        for (const registrationDoc of querySnapshot.docs) {
          const registrationData = registrationDoc.data();
          
          const courseRef = doc(db, 'trainingPrograms', registrationData.programId);
          const courseSnap = await getDoc(courseRef);
          
          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            
            let registeredAt: Date;
            if (registrationData.registeredAt) {
              if (typeof registrationData.registeredAt.toDate === 'function') {
                registeredAt = registrationData.registeredAt.toDate();
              } else {
                registeredAt = new Date(registrationData.registeredAt);
              }
            } else {
              registeredAt = new Date();
            }

            userCoursesData.push({
              id: registrationDoc.id,
              userId: registrationData.userId,
              programId: registrationData.programId,
              status: registrationData.status || 'pending',
              registeredAt: registeredAt,
              paymentStatus: registrationData.paymentStatus || 'pending',
              paymentId: registrationData.paymentId,
              course: {
                id: courseSnap.id,
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                duration: courseData.duration,
                price: courseData.price,
                schedule: courseData.schedule,
                location: courseData.location,
                instructor: courseData.instructor || '--',
                maxParticipants: courseData.maxParticipants,
                currentParticipants: courseData.currentParticipants || 0,
                imageUrl: courseData.imageUrl,
                isVisible: courseData.isVisible !== false,
              }
            });
          }
        }

        // Sort client-side
        userCoursesData.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());
        setCourses(userCoursesData);
      } catch (error) {
        console.error('Error fetching courses:', error);
        toast.error('Failed to load your courses');
      } finally {
        setLoading(false);
      }
    };

    fetchUserCourses();

    return () => {
      mounted = false;
    };
  }, [currentUser, isAuthenticated]);

  // Format date
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Get type configuration
  const getTypeConfig = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('3d') || categoryLower.includes('printing')) {
      return { 
        label: '3D Printing', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-600', 
        icon: <Layers className="w-3 h-3" /> 
      };
    } else if (categoryLower.includes('cad') || categoryLower.includes('design')) {
      return { 
        label: 'CAD/Design', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-600', 
        icon: <Computer className="w-3 h-3" /> 
      };
    } else if (categoryLower.includes('high-tech') || categoryLower.includes('technology')) {
      return { 
        label: 'High-Tech', 
        bgColor: 'bg-yellow-50', 
        textColor: 'text-yellow-600', 
        icon: <Usb className="w-3 h-3" /> 
      };
    }
    return { 
      label: category, 
      bgColor: 'bg-gray-50', 
      textColor: 'text-gray-600', 
      icon: <FileText className="w-3 h-3" /> 
    };
  };

  // Get status configuration
  const getStatusConfig = (status: CourseStatus) => {
    const configs = {
      pending: { 
        label: 'Pending Review', 
        bgColor: 'bg-yellow-50', 
        textColor: 'text-yellow-700',
        icon: <AlertCircle className="w-3 h-3" />
      },
      accepted: { 
        label: 'Enrolled', 
        bgColor: 'bg-green-50', 
        textColor: 'text-green-700',
        icon: <CheckCircle className="w-3 h-3" />
      },
      payment_pending: { 
        label: 'Payment Required', 
        bgColor: 'bg-orange-50', 
        textColor: 'text-orange-700',
        icon: <CreditCard className="w-3 h-3" />
      },
      rejected: { 
        label: 'Rejected', 
        bgColor: 'bg-red-50', 
        textColor: 'text-red-700',
        icon: <X className="w-3 h-3" />
      },
      cancelled: { 
        label: 'Cancelled', 
        bgColor: 'bg-gray-50', 
        textColor: 'text-gray-700',
        icon: <X className="w-3 h-3" />
      },
      completed: { 
        label: 'Completed', 
        bgColor: 'bg-blue-50', 
        textColor: 'text-blue-700',
        icon: <CheckCircle className="w-3 h-3" />
      }
    };
    return configs[status];
  };

  // Get availability percentage
  const getAvailabilityPercentage = (course: Course): number => {
    if (!course.maxParticipants || course.maxParticipants === 0) return 0;
    return Math.round((course.currentParticipants / course.maxParticipants) * 100);
  };

  // Handle course cancellation
  const handleCancelRegistration = (course: UserCourse) => {
    setSelectedCourse(course);
    setShowCancelModal(true);
  };

  const confirmCancelRegistration = async () => {
    if (!selectedCourse || !currentUser) {
      toast.error('Cannot cancel registration');
      return;
    }

    try {
      const batch = writeBatch(db);

      // Update registration status
      const registrationRef = doc(db, 'registrations', selectedCourse.id);
      batch.update(registrationRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Decrement course participants count
      if (selectedCourse.course) {
        const courseRef = doc(db, 'trainingPrograms', selectedCourse.course.id);
        batch.update(courseRef, {
          currentParticipants: (selectedCourse.course.currentParticipants || 1) - 1,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();

      // Send notification to user
      if (selectedCourse.course) {
        await sendNotification({
          user_email: currentUser.email || '',
          message: `Your registration for "${selectedCourse.course.title}" has been cancelled successfully.`,
          type: 'status_change',
          status_before: selectedCourse.status,
          status_after: 'cancelled',
          title: 'Registration Cancelled',
          action_url: `/dashboard/courses`,
          related_program_id: selectedCourse.course.id,
          related_program_name: selectedCourse.course.title,
        });
      }

      // Send notification to admin
      const adminQuery = query(
        collection(db, 'users'),
        where('role', 'in', [ROLES.CENTER_ADMIN, ROLES.SUPER_ADMIN])
      );
      const adminSnapshot = await getDocs(adminQuery);
      
      for (const adminDoc of adminSnapshot.docs) {
        const adminData = adminDoc.data();
        if (adminData.email && selectedCourse.course) {
          await sendNotification({
            user_email: adminData.email,
            message: `${userData?.displayName || currentUser.email} has cancelled their registration for "${selectedCourse.course.title}"`,
            type: 'booking_updated',
            title: 'Registration Cancellation',
            action_url: `/admin/courses/${selectedCourse.course.id}/students`,
            related_program_id: selectedCourse.course.id,
            related_program_name: selectedCourse.course.title,
          });
        }
      }

      toast.success('Registration cancelled successfully');
      setShowCancelModal(false);
      setSelectedCourse(null);
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error('Failed to cancel registration');
    }
  };

  // Handle make payment
  const handleMakePayment = (course: UserCourse) => {
    if (course.course) {
      navigate('/payments', { 
        state: { 
          courseId: course.course.id,
          courseTitle: course.course.title,
          amount: course.course.price,
          type: 'training-registration'
        }
      });
    }
  };

  // Handle view course details
  const handleViewCourse = (courseId: string) => {
    navigate(`/training/${courseId}`);
  };

  // Handle view invoice/receipt
  const handleViewReceipt = (course: UserCourse) => {
    // Navigate to receipt page or open PDF
    toast.success('Receipt will be available soon');
  };

  // Render action buttons based on status
  const renderActionButtons = (course: UserCourse) => {
    if (!course.course) return null;

    switch (course.status) {
      case 'payment_pending':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleMakePayment(course)}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Make Payment
            </Button>
            <Button
              onClick={() => handleCancelRegistration(course)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        );

      case 'pending':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleCancelRegistration(course)}
              variant="outline"
              size="sm"
            >
              Cancel Registration
            </Button>
            <span className="text-sm text-gray-500 flex items-center">
              Awaiting confirmation
            </span>
          </div>
        );

      case 'accepted':
        const canCancel = true; // You can add logic to check if course hasn't started
        if (canCancel) {
          return (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => handleCancelRegistration(course)}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Cancel Registration
              </Button>
              <Button
                onClick={() => handleViewCourse(course.id)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Course
              </Button>
            </div>
          );
        }
        return (
          <Button
            onClick={() => handleViewCourse(course.id)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Course
          </Button>
        );

      case 'completed':
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => handleViewReceipt(course)}
              variant="outline"
              size="sm"
            >
              View Certificate
            </Button>
            <Button
              onClick={() => handleViewCourse(course.id)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Review Course
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Refresh courses
  const handleRefresh = async () => {
    try {
      setLoading(true);
      // Force a refresh by re-fetching
      if (currentUser) {
        const registrationsRef = collection(db, 'registrations');
        const q = query(registrationsRef, where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        const userCoursesData: UserCourse[] = [];
        for (const registrationDoc of querySnapshot.docs) {
          const registrationData = registrationDoc.data();
          
          const courseRef = doc(db, 'trainingPrograms', registrationData.programId);
          const courseSnap = await getDoc(courseRef);
          
          if (courseSnap.exists()) {
            const courseData = courseSnap.data();
            
            let registeredAt: Date;
            if (registrationData.registeredAt) {
              if (typeof registrationData.registeredAt.toDate === 'function') {
                registeredAt = registrationData.registeredAt.toDate();
              } else {
                registeredAt = new Date(registrationData.registeredAt);
              }
            } else {
              registeredAt = new Date();
            }

            userCoursesData.push({
              id: registrationDoc.id,
              userId: registrationData.userId,
              programId: registrationData.programId,
              status: registrationData.status || 'pending',
              registeredAt: registeredAt,
              paymentStatus: registrationData.paymentStatus || 'pending',
              paymentId: registrationData.paymentId,
              course: {
                id: courseSnap.id,
                title: courseData.title,
                description: courseData.description,
                category: courseData.category,
                duration: courseData.duration,
                price: courseData.price,
                schedule: courseData.schedule,
                location: courseData.location,
                instructor: courseData.instructor || '--',
                maxParticipants: courseData.maxParticipants,
                currentParticipants: courseData.currentParticipants || 0,
                imageUrl: courseData.imageUrl,
                isVisible: courseData.isVisible !== false,
              }
            });
          }
        }

        userCoursesData.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());
        setCourses(userCoursesData);
        toast.success('Courses refreshed');
      }
    } catch (error) {
      console.error('Error refreshing courses:', error);
      toast.error('Failed to refresh courses');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please log in to view your registered courses.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/auth/login')} className="w-full">
              Log In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Registered Courses</h1>
              <p className="text-muted-foreground">
                View and manage all your training program registrations
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="gap-2"
            >
              <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              {courses.filter(c => c.status === 'accepted').length} Enrolled
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
              {courses.filter(c => c.status === 'pending').length} Pending
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700">
              {courses.filter(c => c.status === 'completed').length} Completed
            </Badge>
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              {courses.filter(c => c.status === 'payment_pending').length} Payment Due
            </Badge>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((userCourse) => {
            if (!userCourse.course) return null;

            const course = userCourse.course;
            const typeConfig = getTypeConfig(course.category);
            const statusConfig = getStatusConfig(userCourse.status);
            const availabilityPercentage = getAvailabilityPercentage(course);
            const isFull = availabilityPercentage >= 100;

            return (
              <Card key={userCourse.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge variant="outline" className={`${typeConfig.bgColor} ${typeConfig.textColor} border-0`}>
                          <span className="flex items-center gap-1">
                            {typeConfig.icon}
                            {typeConfig.label}
                          </span>
                        </Badge>
                        <Badge variant="outline" className={statusConfig.bgColor}>
                          <span className={`flex items-center gap-1 ${statusConfig.textColor}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  {/* Course Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs text-muted-foreground">Registered</p>
                          <p className="text-sm font-medium">{formatDate(userCourse.registeredAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs text-muted-foreground">Schedule</p>
                          <p className="text-sm font-medium line-clamp-1">{course.schedule}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs text-muted-foreground">Instructor</p>
                          <p className="text-sm font-medium line-clamp-1">{course.instructor}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm font-medium line-clamp-1">{course.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description Preview */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  </div>

                  {/* Participants and Price */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t gap-4">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">
                          {course.currentParticipants}/{course.maxParticipants}
                        </p>
                        <p className={`text-xs ${isFull ? 'text-red-600' : availabilityPercentage >= 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {availabilityPercentage}% full
                          {isFull && ' (Full)'}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-muted-foreground">Total Cost</p>
                      <p className="text-lg font-bold">{formatCurrency(course.price)}</p>
                      {userCourse.paymentStatus === 'completed' && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Paid
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCourse(course.id)}
                        className="gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Details
                      </Button>
                      {course.imageUrl && (
                        <div className="hidden sm:block w-8 h-8 rounded overflow-hidden">
                          <img 
                            src={course.imageUrl} 
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                    {renderActionButtons(userCourse)}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* No Courses Message */}
        {courses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No courses registered</h3>
              <p className="text-muted-foreground mb-6">
                You haven't registered for any courses yet. Explore our available training programs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild>
                  <Link to="/workshops">
                    Browse Available Courses
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && selectedCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <X className="w-5 h-5" />
                  Cancel Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Are you sure you want to cancel your registration for 
                  <span className="font-semibold"> "{selectedCourse.course?.title}"</span>?
                  This action cannot be undone.
                </p>
                {selectedCourse.paymentStatus === 'completed' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700 font-medium">
                      ⚠️ Payment Refund Note
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Since you've already paid for this course, please contact support at 
                      <span className="font-semibold"> ensyp.cep@polytechnique.cm</span> 
                      to inquire about refund options.
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="destructive"
                  onClick={confirmCancelRegistration}
                  className="flex-1"
                >
                  Yes, Cancel Registration
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1"
                >
                  Keep Registration
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCoursesPage;