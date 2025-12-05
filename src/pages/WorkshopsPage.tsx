import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar, Clock, Users, GraduationCap, Award } from "lucide-react";
import { ImageWithFallback } from "../components/ImgSrc/ImageWithFallback";

const workshops = [
  {
    id: 1,
    title: "3D Printing Fundamentals",
    level: "Beginner",
    duration: "4 hours",
    price: "$99",
    studentPrice: "$79",
    dates: ["Nov 20, 2025", "Dec 5, 2025", "Dec 18, 2025"],
    maxParticipants: 12,
    description: "Learn the basics of 3D printing technology, materials, and how to prepare your first print.",
    topics: [
      "Introduction to FDM and SLA printing",
      "Understanding materials and their properties",
      "File preparation basics",
      "Print quality optimization",
      "Hands-on printing experience"
    ],
    instructor: "Dr. Sarah Chen"
  },
  {
    id: 2,
    title: "CAD for 3D Printing",
    level: "Intermediate",
    duration: "6 hours",
    price: "$149",
    studentPrice: "$119",
    dates: ["Nov 25, 2025", "Dec 10, 2025"],
    maxParticipants: 10,
    description: "Master Fusion 360 and design printable models from scratch. Learn parametric modeling and design for manufacturing.",
    topics: [
      "Fusion 360 interface and tools",
      "Parametric modeling techniques",
      "Design for 3D printing constraints",
      "Assembly design",
      "Exporting print-ready files"
    ],
    instructor: "Michael Rodriguez"
  },
  {
    id: 3,
    title: "Advanced Resin Printing",
    level: "Advanced",
    duration: "5 hours",
    price: "$179",
    studentPrice: "$149",
    dates: ["Dec 8, 2025", "Dec 22, 2025"],
    maxParticipants: 8,
    description: "Deep dive into SLA/DLP printing, post-processing techniques, and achieving professional results.",
    topics: [
      "Resin chemistry and properties",
      "Support strategy for complex models",
      "Post-curing and finishing",
      "Troubleshooting common issues",
      "Multi-material printing"
    ],
    instructor: "Emma Thompson"
  },
  {
    id: 4,
    title: "Product Prototyping Workshop",
    level: "Intermediate",
    duration: "8 hours",
    price: "$249",
    studentPrice: "$199",
    dates: ["Nov 30, 2025", "Dec 15, 2025"],
    maxParticipants: 10,
    description: "Complete product development workflow from concept to physical prototype. Ideal for entrepreneurs and product designers.",
    topics: [
      "Design thinking and ideation",
      "Rapid prototyping workflow",
      "Material selection for prototypes",
      "Iterative design process",
      "Professional presentation techniques"
    ],
    instructor: "James Liu"
  }
];

const instructors = [
  {
    name: "Dr. Sarah Chen",
    role: "Lead Instructor",
    bio: "PhD in Materials Science, 10+ years in additive manufacturing",
    image: "https://images.unsplash.com/photo-1586296835409-fe3fe6b35b56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm90b3R5cGUlMjBkZXNpZ258ZW58MXx8fHwxNzYyOTkzNDAxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    name: "Michael Rodriguez",
    role: "CAD Specialist",
    bio: "Professional product designer, Fusion 360 certified instructor",
    image: "https://images.unsplash.com/photo-1600869009498-8d429f88d4f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWdufGVufDF8fHx8MTc2Mjk3NDc0OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function WorkshopsPage() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-black to-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center   max-w-3xl mx-auto">
            <h1 className=" text-lgx mb-6 text-white ">Workshops & Training</h1>
            <p className="text-white mb-8">
              Learn from industry experts in our state-of-the-art facility. Small class sizes ensure personalized attention and hands-on experience.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-blue-500" />
                <span className="text-white">Certification Available</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-blue-500" />
                <span className="text-white">Student Discounts</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-blue-500" />
                <span className="text-white">Small Groups</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {workshops.map((workshop) => (
              <Card key={workshop.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge
                      variant={
                        workshop.level === "Beginner"
                          ? "secondary"
                          : workshop.level === "Intermediate"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {workshop.level}
                    </Badge>
                    <div className="text-right">
                      <div className="line-through text-sm text-muted-foreground">
                        {workshop.price}
                      </div>
                      <div className="text-lg">{workshop.studentPrice}</div>
                      <div className="text-xs text-muted-foreground">with student ID</div>
                    </div>
                  </div>
                  <CardTitle>{workshop.title}</CardTitle>
                  <CardDescription>{workshop.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {workshop.duration}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      Max {workshop.maxParticipants} participants
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      Instructor: {workshop.instructor}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm mb-2">What you'll learn:</div>
                    <ul className="space-y-1">
                      {workshop.topics.map((topic, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <div className="text-sm mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Upcoming dates:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {workshop.dates.map((date) => (
                        <Badge key={date} variant="outline">
                          {date}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-auto" variant="black" onClick={() => navigateTo("contact")}>
                    Register Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Instructors Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="tracking-tight mb-4">Meet Our Instructors</h2>
            <p className="text-muted-foreground">
              Learn from experienced professionals passionate about 3D printing education
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {instructors.map((instructor) => (
              <Card key={instructor.name}>
                <CardHeader>
                  <ImageWithFallback
                    src={instructor.image}
                    alt={instructor.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <CardTitle className="text-lg">{instructor.name}</CardTitle>
                  <CardDescription>{instructor.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{instructor.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="tracking-tight mb-4">Why Train With Us?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Industry Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Receive a certificate of completion recognized by industry partners and employers.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Small Class Sizes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maximum 12 students per class ensures personalized attention and hands-on time.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Practical Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Access to professional equipment and materials. Take home your printed projects.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="tracking-tight text-white mb-4">Questions About Our Workshops?</h2>
          <p className="text-white/90 mb-8">
            Contact us for custom training sessions, group bookings, or corporate workshops.
          </p>
          <Button size="lg" variant="default" onClick={() => navigateTo("contact")}>
            Contact Us
          </Button>
        </div>
      </section>
    </div>
  );
}