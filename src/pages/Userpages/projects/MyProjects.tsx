import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Eye,
  MessageSquare,
  CreditCard,
  Settings,
  FileText
} from "lucide-react";

const projects = [
  {
    id: "PRJ-001",
    name: "Robot Arm Prototype",
    status: "in-progress",
    technology: "FDM",
    material: "PLA",
    quantity: 5,
    submittedDate: "2025-11-10",
    estimatedCompletion: "2025-11-15",
    price: 125.00,
    paid: true
  },
  {
    id: "PRJ-002",
    name: "Miniature Collection",
    status: "completed",
    technology: "Resin",
    material: "Standard Resin",
    quantity: 12,
    submittedDate: "2025-11-05",
    completedDate: "2025-11-08",
    price: 180.00,
    paid: true
  },
  {
    id: "PRJ-003",
    name: "Phone Case Design",
    status: "quote-pending",
    technology: "FDM",
    material: "TPU",
    quantity: 1,
    submittedDate: "2025-11-12",
    price: null,
    paid: false
  }
];

const invoices = [
  { id: "INV-001", project: "Miniature Collection", date: "2025-11-08", amount: 180.00, status: "paid" },
  { id: "INV-002", project: "Robot Arm Prototype", date: "2025-11-10", amount: 125.00, status: "paid" },
];

export function MyProjects() {
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "quote-pending":
        return "bg-orange-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Clock className="w-4 h-4" />;
      case "quote-pending":
        return <FileText className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="tracking-tight mb-2">Your Projects</h1>
          <p className="text-muted-foreground">
            Manage your projects, view invoices, and track orders
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Projects</CardDescription>
              <CardTitle className="text-3xl">18</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                +3 this month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">1</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Est. completion: Nov 15
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Spent</CardDescription>
              <CardTitle className="text-3xl">$2,450</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                $305 this month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Success Rate</CardDescription>
              <CardTitle className="text-3xl">98%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                17 of 18 successful
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="tracking-tight">My Projects</h2>
              <Button onClick={() => navigateTo("submit-project")}>
                New Project
              </Button>
            </div>

            <div className="space-y-4">
              {projects.map((project) => (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle>{project.name}</CardTitle>
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status.replace("-", " ")}</span>
                          </Badge>
                        </div>
                        <CardDescription>Project ID: {project.id}</CardDescription>
                      </div>
                      {project.price && (
                        <div className="text-right">
                          <div className="text-2xl">${project.price.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.paid ? (
                              <span className="text-green-500">✓ Paid</span>
                            ) : (
                              <span className="text-orange-500">Payment pending</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Technology</div>
                        <div>{project.technology}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Material</div>
                        <div>{project.material}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Quantity</div>
                        <div>{project.quantity} units</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          {project.status === "completed" ? "Completed" : "Submitted"}
                        </div>
                        <div>
                          {project.status === "completed" ? project.completedDate : project.submittedDate}
                        </div>
                      </div>
                    </div>

                    {project.status === "in-progress" && (
                      <div className="mb-4 p-3 bg-blue-500/10 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span>
                            Estimated completion: <strong>{project.estimatedCompletion}</strong>
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                      {project.status === "completed" && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download Files
                        </Button>
                      )}
                      {project.status === "completed" && (
                        <Button size="sm" onClick={() => navigateTo("submit-project")}>
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card>
              <CardHeader>
                <CardTitle>Invoices & Payments</CardTitle>
                <CardDescription>
                  View and download your payment history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <div>{invoice.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {invoice.project} • {invoice.date}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg">${invoice.amount.toFixed(2)}</div>
                          <Badge
                            variant={invoice.status === "paid" ? "default" : "secondary"}
                            className={invoice.status === "paid" ? "bg-green-500" : ""}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Paid</div>
                      <div className="text-2xl">$2,450.00</div>
                    </div>
                    <Button variant="outline">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Methods
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}
export default MyProjects;