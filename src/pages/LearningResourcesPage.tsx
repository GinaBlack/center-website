import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { BookOpen, Video, Download, FileText, Lightbulb, Wrench } from "lucide-react";

const tutorials = [
  {
    category: "Beginner",
    items: [
      { title: "Introduction to 3D Printing", type: "video", duration: "15 min", icon: Video },
      { title: "Understanding 3D File Formats", type: "article", duration: "8 min", icon: FileText },
      { title: "Your First 3D Print", type: "guide", duration: "20 min", icon: BookOpen },
      { title: "Common Printing Issues & Solutions", type: "article", duration: "12 min", icon: Wrench }
    ]
  },
  {
    category: "3D Modeling",
    items: [
      { title: "Fusion 360 Basics", type: "video", duration: "45 min", icon: Video },
      { title: "Blender for 3D Printing", type: "video", duration: "60 min", icon: Video },
      { title: "TinkerCAD Quick Start", type: "guide", duration: "15 min", icon: BookOpen },
      { title: "Parametric Design Principles", type: "article", duration: "18 min", icon: FileText }
    ]
  },
  {
    category: "File Preparation",
    items: [
      { title: "Optimizing Models for Printing", type: "guide", duration: "25 min", icon: BookOpen },
      { title: "Fixing Common Mesh Errors", type: "video", duration: "20 min", icon: Video },
      { title: "Slicing Software Tutorial", type: "video", duration: "35 min", icon: Video },
      { title: "Support Structure Guidelines", type: "article", duration: "10 min", icon: FileText }
    ]
  },
  {
    category: "Design Principles",
    items: [
      { title: "Design for 3D Printing", type: "guide", duration: "30 min", icon: BookOpen },
      { title: "Wall Thickness Guidelines", type: "article", duration: "8 min", icon: FileText },
      { title: "Overhangs and Bridges", type: "video", duration: "15 min", icon: Video },
      { title: "Assembly Design Tips", type: "guide", duration: "22 min", icon: BookOpen }
    ]
  }
];

const downloads = [
  { title: "3D Printing Cheat Sheet", size: "2.5 MB", format: "PDF" },
  { title: "Material Properties Guide", size: "1.8 MB", format: "PDF" },
  { title: "Design Guidelines Checklist", size: "0.5 MB", format: "PDF" },
  { title: "File Preparation Workflow", size: "3.2 MB", format: "PDF" },
  { title: "Troubleshooting Flowchart", size: "1.1 MB", format: "PDF" }
];

const faqs = [
  {
    question: "What file formats do you accept?",
    answer: "We accept STL, OBJ, 3MF, STEP, and STP file formats. STL is the most common and recommended format for 3D printing."
  },
  {
    question: "How do I know if my model is printable?",
    answer: "Your model should be a manifold (watertight) mesh with no holes or gaps. We recommend using mesh repair tools like Meshmixer or Netfabb before submission."
  },
  {
    question: "What's the difference between FDM and Resin printing?",
    answer: "FDM uses melted plastic filament to build layer by layer, ideal for functional parts. Resin uses UV-cured liquid resin for high detail and smooth surfaces, perfect for miniatures and jewelry."
  },
  {
    question: "How thick should my walls be?",
    answer: "For FDM: minimum 1-1.5mm for small parts, 2-3mm for structural parts. For Resin: minimum 0.8-1mm. Thicker walls improve strength and printability."
  },
  {
    question: "Do I need to add supports to my model?",
    answer: "No, we'll add supports automatically during slicing. However, you can design your model to minimize supports by avoiding large overhangs greater than 45 degrees."
  },
  {
    question: "How can I reduce printing costs?",
    answer: "Hollow out solid models, reduce infill density for non-structural parts, optimize orientation to minimize supports, and consider draft quality for prototypes."
  }
];

export function LearningResourcesPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4">Learning Hub</Badge>
          <h1 className="tracking-tight mb-6">Learning Resources</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Master 3D printing with our comprehensive tutorials, guides, and resources. From beginner basics to advanced techniques.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="tutorials" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
              <TabsTrigger value="downloads">Downloads</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>

            {/* Tutorials Tab */}
            <TabsContent value="tutorials" className="space-y-12">
              {tutorials.map((section) => (
                <div key={section.category}>
                  <h2 className="tracking-tight mb-6">{section.category}</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {section.items.map((item) => (
                      <Card key={item.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-600 rounded-lg flex items-center justify-center">
                              <item.icon className="w-5 h-5 text-white" />
                            </div>
                            <Badge variant="secondary">{item.duration}</Badge>
                          </div>
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          <CardDescription className="capitalize">{item.type}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            {item.type === "video" ? "Watch Now" : "Read More"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {/* Downloads Tab */}
            <TabsContent value="downloads">
              <div className="max-w-3xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Downloadable Guides</CardTitle>
                    <CardDescription>
                      Free PDF guides and checklists to help you succeed with 3D printing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {downloads.map((download) => (
                      <div
                        key={download.title}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 text-blue-500" />
                          <div>
                            <div>{download.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {download.format} • {download.size}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="text-center mb-8">
                  <h2 className="tracking-tight mb-4">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground">
                    Common questions about 3D printing, file preparation, and our services
                  </p>
                </div>
                {faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                        {faq.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Software Recommendations */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="tracking-tight mb-4">Recommended Software</h2>
            <p className="text-muted-foreground">
              Tools we recommend for 3D modeling, slicing, and file preparation
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>3D Modeling</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Fusion 360</span>
                  <Badge>Professional</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Blender</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>TinkerCAD</span>
                  <Badge variant="secondary">Beginner</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Slicing Software</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Cura</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>PrusaSlicer</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Simplify3D</span>
                  <Badge>Professional</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mesh Repair</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Meshmixer</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Netfabb</span>
                  <Badge>Professional</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Microsoft 3D Builder</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}