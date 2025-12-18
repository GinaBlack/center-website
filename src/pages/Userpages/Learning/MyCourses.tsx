import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  MapPin,
  Users,
  BookOpen,
  Building,
  Layers,
  Computer,
  Usb,
  ChevronRight,
} from 'lucide-react';

// Type Definitions
type CourseStatus = 'accepted' | 'rejected' | 'pending' | 'cancelled';
type TrainingType = '3d-printing' | 'cad' | 'high-tech';
type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

interface Instructor {
  id: number;
  name: string;
  title: string;
}

interface Course {
  id: number;
  title: string;
  registeredDate: string;
  startDate: string;
  endDate: string;
  trainingType: TrainingType;
  instructor: Instructor;
  status: CourseStatus;
  level: CourseLevel;
  price: number;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
}

const MyCoursesPage: React.FC = () => {
  const [courses] = useState<Course[]>([
    {
      id: 1,
      title: 'Advanced 3D Printing Workshop',
      registeredDate: '2024-01-10',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      trainingType: '3d-printing',
      instructor: {
        id: 101,
        name: 'Dr. Sarah Chen',
        title: 'Senior 3D Printing Specialist',
      },
      status: 'accepted',
      level: 'advanced',
      price: 799,
      location: 'Innovation Center - Lab 302',
      maxParticipants: 15,
      currentParticipants: 12,
    },
    {
      id: 2,
      title: 'CAD Modeling Intensive Course',
      registeredDate: '2024-01-15',
      startDate: '2024-02-10',
      endDate: '2024-03-30',
      trainingType: 'cad',
      instructor: {
        id: 102,
        name: 'Michael Rodriguez',
        title: 'CAD Expert & Engineer',
      },
      status: 'pending',
      level: 'intermediate',
      price: 649,
      location: 'Design Center - Studio A',
      maxParticipants: 20,
      currentParticipants: 18,
    },
    {
      id: 3,
      title: 'High-Tech Materials Laboratory',
      registeredDate: '2024-01-05',
      startDate: '2024-01-20',
      endDate: '2024-02-28',
      trainingType: 'high-tech',
      instructor: {
        id: 103,
        name: 'Prof. James Wilson',
        title: 'Materials Scientist',
      },
      status: 'cancelled',
      level: 'advanced',
      price: 999,
      location: 'Materials Research Building - Lab 101',
      maxParticipants: 10,
      currentParticipants: 8,
    },
    {
      id: 4,
      title: '3D Printing Fundamentals',
      registeredDate: '2024-01-18',
      startDate: '2024-02-05',
      endDate: '2024-03-10',
      trainingType: '3d-printing',
      instructor: {
        id: 104,
        name: 'Lisa Thompson',
        title: 'Product Design Lead',
      },
      status: 'rejected',
      level: 'beginner',
      price: 499,
      location: 'Maker Space - Workshop 1',
      maxParticipants: 12,
      currentParticipants: 12,
    },
    {
      id: 5,
      title: 'CAD for Prototyping',
      registeredDate: '2024-01-12',
      startDate: '2024-01-25',
      endDate: '2024-02-20',
      trainingType: 'cad',
      instructor: {
        id: 105,
        name: 'David Kim',
        title: 'Prototyping Specialist',
      },
      status: 'accepted',
      level: 'intermediate',
      price: 599,
      location: 'Prototyping Studio - Studio B',
      maxParticipants: 16,
      currentParticipants: 14,
    },
    {
      id: 6,
      title: 'Industrial 3D Printing Training',
      registeredDate: '2024-01-20',
      startDate: '2024-02-15',
      endDate: '2024-04-05',
      trainingType: 'high-tech',
      instructor: {
        id: 106,
        name: 'Emma Williams',
        title: 'Industrial Manufacturing Lead',
      },
      status: 'pending',
      level: 'advanced',
      price: 1299,
      location: 'Industrial Manufacturing Center',
      maxParticipants: 8,
      currentParticipants: 6,
    },
  ]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTypeConfig = (type: TrainingType) => {
    const configs = {
      '3d-printing': { label: '3D Printing', bgColor: 'bg-', textColor: 'text-blue-600', icon: <Layers className="w-3 h-3" /> },
      'cad': { label: 'CAD', bgColor: 'bg', textColor: 'text-green-500', icon: <Computer className="w-3 h-3" /> },
      'high-tech': { label: 'High-Tech', bgColor: 'bg-', textColor: 'text-yellow-500', icon: <Usb className="w-3 h-3" /> }
    };
    return configs[type];
  };

  const getLevelConfig = (level: CourseLevel) => {
    const configs = {
      beginner: { label: 'Beginner', bgColor: 'bg-', textColor: 'text-green-500' },
      intermediate: { label: 'Intermediate', bgColor: 'bg-', textColor: 'text-yellow-500' },
      advanced: { label: 'Advanced', bgColor: 'bg-', textColor: 'text-red-500' }
    };
    return configs[level];
  };

  const getStatusConfig = (status: CourseStatus) => {
    const configs = {
      accepted: { label: 'Enrolled', bgColor: 'bg-gray-200', textColor: 'text-green-500' },
      pending: { label: 'Pending', bgColor: 'bg-gray-200', textColor: 'text-yellow-500' },
      cancelled: { label: 'Cancelled', bgColor: 'bg-gray-200', textColor: 'text-orange-600' },
      rejected: { label: 'Rejected', bgColor: 'bg-gray-200', textColor: 'text-red-500' }
    };
    return configs[status];
  };

  const getAvailabilityPercentage = (course: Course): number => {
    return Math.round((course.currentParticipants / course.maxParticipants) * 100);
  };

  return (
    <div className="min-h-screen bg-background p-4 py-20">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Registered Courses</h1>
        <p className="text-muted-foreground">
          View all your registered training courses
        </p>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const typeConfig = getTypeConfig(course.trainingType);
          const levelConfig = getLevelConfig(course.level);
          const statusConfig = getStatusConfig(course.status);
          const availabilityPercentage = getAvailabilityPercentage(course);

          return (
            <div key={course.id} className="bg-card rounded-xl border p-6 hover:shadow-md transition-shadow">
              {/* Course Header with Type & Level Badges */}
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-smx font-semibold pr-4">{course.title}</h2>
                <div className="flex gap-2">
                  <span className={`inline-flex border items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.textColor}`}>
                    {typeConfig.icon}
                    {typeConfig.label}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${levelConfig.bgColor} ${levelConfig.textColor}`}>
                    {levelConfig.label}
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-4">
                <span className={`inline-block px-3 py-1  border rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                  {statusConfig.label}
                </span>
              </div>

              {/* Course Details Grid */}
              <div className="grid grid-cols-3  mb-6">
                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Registered</div>
                      <div>{formatDate(course.registeredDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Starts</div>
                      <div>{formatDate(course.startDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Ends</div>
                      <div>{formatDate(course.endDate)}</div>
                    </div>
                  </div>
                </div>

                {/* Instructor & Location  */}
                <div className="space-y-2 ">
                  <div className="flex mb-6 items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Instructor</div>
                      <div className="truncate">{course.instructor.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{course.instructor.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Location</div>
                      <div className="truncate">{course.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with Participants & Price */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">
                      {course.currentParticipants}/{course.maxParticipants}
                    </div>
                    <div className={`text-xs ${availabilityPercentage >= 90 ? 'text-red-600' : availabilityPercentage >= 75 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {availabilityPercentage}% full
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Total</div>
                  <div className="text-lg font-bold">${course.price}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* No Courses Message */}
      {courses.length === 0 && (
        <div className="text-center py-12">
          <div className="size-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No courses registered</h3>
          <p className="text-muted-foreground">
            You haven't registered for any courses yet
          </p>
        </div>
      )}
    </div>
  );
};

export default MyCoursesPage;