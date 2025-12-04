import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
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
  FileText,
  Users,
  BarChart3,
  Printer,
  Warehouse,
  DollarSign,
  Cog,
  Activity,
  Layers,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  UserPlus,
  DownloadCloud,
  UploadCloud,
  Shield,
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building,
  Crown,
  Star,
  Zap,
  PieChart,
  Target,
  FileCheck,
  RotateCcw
} from "lucide-react";
import { useState } from "react";

// Enhanced mock data
const projectQueue = [
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
    user: { id: "USR-001", name: "John Doe", email: "john.doe@university.edu" },
    priority: "high",
    machine: "Prusa MK3S-01",
    printTime: "18h 30m",
    materialUsed: 0.45,
    supportContact: "tech@3dcenter.edu",
    files: ["robot_arm.stl", "assembly_guide.pdf"],
    notes: "High precision required for joints",
    quality: "high",
    approvalStatus: "approved"
  },
  {
    id: "PRJ-002",
    name: "Architectural Model",
    status: "queued",
    technology: "Resin",
    material: "Standard Resin",
    quantity: 1,
    submittedDate: "2025-11-11",
    estimatedCompletion: "2025-11-13",
    price: 85.00,
    user: { id: "USR-002", name: "Sarah Wilson", email: "sarah.w@university.edu" },
    priority: "medium",
    machine: "Anycubic Mono-02",
    printTime: "6h 15m",
    materialUsed: 0.12,
    supportContact: "tech@3dcenter.edu",
    files: ["building_model.stl"],
    notes: "Fine details important",
    quality: "standard",
    approvalStatus: "pending"
  },
  {
    id: "PRJ-003",
    name: "Research Equipment Housing",
    status: "completed",
    technology: "FDM",
    material: "PETG",
    quantity: 3,
    submittedDate: "2025-11-05",
    completedDate: "2025-11-08",
    price: 210.00,
    user: { id: "USR-003", name: "Dr. Michael Chen", email: "m.chen@university.edu" },
    priority: "high",
    machine: "Bambu Lab P1S-01",
    printTime: "32h 45m",
    materialUsed: 0.89,
    supportContact: "tech@3dcenter.edu",
    files: ["housing_v2.stl", "specs.pdf"],
    notes: "Waterproof finish required",
    quality: "high",
    approvalStatus: "approved"
  }
];

const users = [
  { 
    id: "USR-001", 
    name: "John Doe", 
    email: "john.doe@university.edu", 
    status: "active", 
    role: "student", 
    department: "Mechanical Engineering",
    projects: 12, 
    totalSpent: 1245.00,
    joinDate: "2024-08-15",
    lastLogin: "2025-11-12 14:30",
    permissions: ["file_upload", "project_submit", "material_library"],
    subscription: "premium",
    contact: "+1 (555) 123-4567",
    address: "123 College Ave, San Francisco, CA 94102",
    avatar: "JD",
    rating: 4.8
  },
  { 
    id: "USR-002", 
    name: "Sarah Wilson", 
    email: "sarah.w@university.edu", 
    status: "active", 
    role: "faculty", 
    department: "Architecture",
    projects: 8, 
    totalSpent: 845.00,
    joinDate: "2024-09-22",
    lastLogin: "2025-11-12 09:15",
    permissions: ["file_upload", "project_submit", "material_library", "priority_queue"],
    subscription: "faculty",
    contact: "+1 (555) 987-6543",
    address: "456 Faculty Lane, San Francisco, CA 94102",
    avatar: "SW",
    rating: 4.9
  },
  { 
    id: "USR-003", 
    name: "Dr. Michael Chen", 
    email: "m.chen@university.edu", 
    status: "active", 
    role: "faculty", 
    department: "Research Lab",
    projects: 23, 
    totalSpent: 3560.00,
    joinDate: "2024-01-10",
    lastLogin: "2025-11-11 16:45",
    permissions: ["file_upload", "project_submit", "material_library", "priority_queue", "bulk_orders"],
    subscription: "research",
    contact: "+1 (555) 456-7890",
    address: "789 Research Park, San Francisco, CA 94102",
    avatar: "MC",
    rating: 5.0
  }
];

const machines = [
  { 
    id: "PRS-001", 
    name: "Prusa MK3S-01", 
    type: "FDM", 
    status: "printing", 
    currentJob: "PRJ-001", 
    utilization: 85, 
    lastMaintenance: "2025-10-28",
    totalPrintTime: "1,245h",
    filamentUsed: "12.3kg",
    nextMaintenance: "2025-12-01",
    temperature: { nozzle: 215, bed: 60 },
    errors: 2,
    location: "Lab A",
    statusMessage: "Printing robot arm components",
    queue: 3
  },
  { 
    id: "ANC-002", 
    name: "Anycubic Mono-02", 
    type: "Resin", 
    status: "idle", 
    currentJob: null, 
    utilization: 45, 
    lastMaintenance: "2025-11-05",
    totalPrintTime: "890h",
    filamentUsed: "8.7L",
    nextMaintenance: "2025-12-10",
    temperature: { resin: 25 },
    errors: 0,
    location: "Lab B",
    statusMessage: "Ready for next job",
    queue: 1
  },
  { 
    id: "BMB-003", 
    name: "Bambu Lab P1S-01", 
    type: "FDM", 
    status: "maintenance", 
    currentJob: null, 
    utilization: 72, 
    lastMaintenance: "2025-11-12",
    totalPrintTime: "2,100h",
    filamentUsed: "18.5kg",
    nextMaintenance: "2025-11-20",
    temperature: { nozzle: 0, bed: 0 },
    errors: 5,
    location: "Lab A",
    statusMessage: "Routine maintenance",
    queue: 0
  }
];

const inventory = [
  { 
    material: "PLA Black", 
    type: "FDM", 
    quantity: 3.2, 
    unit: "kg", 
    lowStock: false, 
    reorderLevel: 1.0,
    costPerUnit: 24.99,
    supplier: "FilamentCo",
    lastOrder: "2025-10-15",
    shelfLife: "2 years",
    location: "Shelf A1",
    color: "#000000"
  },
  { 
    material: "PLA White", 
    type: "FDM", 
    quantity: 0.8, 
    unit: "kg", 
    lowStock: true, 
    reorderLevel: 1.0,
    costPerUnit: 24.99,
    supplier: "FilamentCo",
    lastOrder: "2025-10-15",
    shelfLife: "2 years",
    location: "Shelf A2",
    color: "#FFFFFF"
  },
  { 
    material: "Standard Resin", 
    type: "Resin", 
    quantity: 2.1, 
    unit: "L", 
    lowStock: false, 
    reorderLevel: 0.5,
    costPerUnit: 39.99,
    supplier: "ResinTech",
    lastOrder: "2025-11-01",
    shelfLife: "1 year",
    location: "Cabinet B1",
    color: "#FF6B35"
  },
  { 
    material: "TPU Flexible", 
    type: "FDM", 
    quantity: 0.3, 
    unit: "kg", 
    lowStock: true, 
    reorderLevel: 0.5,
    costPerUnit: 34.99,
    supplier: "FlexFilament",
    lastOrder: "2025-10-20",
    shelfLife: "18 months",
    location: "Shelf A3",
    color: "#4ECDC4"
  }
];

const financialData = {
  monthlyRevenue: 2847,
  outstandingInvoices: 845,
  materialCosts: 327,
  profitMargin: 68,
  topCustomers: [
    { name: "Dr. Michael Chen", spent: 890, projects: 8 },
    { name: "John Doe", spent: 450, projects: 5 },
    { name: "Sarah Wilson", spent: 320, projects: 3 }
  ],
  monthlyGrowth: 12,
  costReduction: 5
};

const analyticsData = {
  totalProjects: 156,
  successRate: 94.2,
  avgCompletionTime: "2.3 days",
  popularMaterials: ["PLA", "Resin", "PETG"],
  busiestDay: "Wednesday",
  peakHours: "10:00-14:00"
};

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "student",
    department: "",
    subscription: "basic",
    permissions: [] as string[]
  });
  const [systemSettings, setSystemSettings] = useState({
    autoApprove: false,
    maintenanceMode: false,
    emailNotifications: true,
    smsAlerts: true,
    maxFileSize: 100,
    backupFrequency: "daily"
  });

  // Advanced filtering and search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projectQueue.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      completed: "bg-green-500",
      "in-progress": "bg-blue-500",
      queued: "bg-orange-500",
      "pending-review": "bg-yellow-500",
      cancelled: "bg-red-500",
      active: "bg-green-500",
      inactive: "bg-gray-500",
      suspended: "bg-red-500",
      printing: "bg-green-500",
      idle: "bg-blue-500",
      maintenance: "bg-red-500",
      error: "bg-red-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-500",
      medium: "bg-orange-500",
      low: "bg-blue-500"
    };
    return colors[priority as keyof typeof colors] || "bg-gray-500";
  };

  const handleBulkAction = () => {
    if (bulkAction === "export" && selectedUsers.length > 0) {
      console.log("Exporting users:", selectedUsers);
      // Implement export logic
    } else if (bulkAction === "deactivate" && selectedUsers.length > 0) {
      console.log("Deactivating users:", selectedUsers);
      // Implement deactivation logic
    } else if (bulkAction === "export-projects" && selectedProjects.length > 0) {
      console.log("Exporting projects:", selectedProjects);
      // Implement project export logic
    }
    setBulkAction("");
    setSelectedUsers([]);
    setSelectedProjects([]);
  };

  const handleUserCreate = () => {
    console.log("Creating user:", userForm);
    // Implement user creation logic
    setUserForm({ name: "", email: "", role: "student", department: "", subscription: "basic", permissions: [] });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const handleSettingsUpdate = () => {
    console.log("Updating system settings:", systemSettings);
    // Implement settings update logic
  };

  const navigationItems = [
    { id: "overview", name: "Overview", icon: BarChart3, description: "Dashboard analytics" },
    { id: "projects", name: "Project Queue", icon: Package, description: "Manage all projects" },
    { id: "users", name: "User Management", icon: Users, description: "User accounts & permissions" },
    { id: "machines", name: "Machine Status", icon: Printer, description: "Printer monitoring" },
    { id: "inventory", name: "Inventory", icon: Warehouse, description: "Material management" },
    { id: "financial", name: "Financial", icon: DollarSign, description: "Revenue & reporting" },
    { id: "analytics", name: "Analytics", icon: Activity, description: "Performance insights" },
    { id: "bulk", name: "Bulk Operations", icon: Layers, description: "Batch processing" },
    { id: "settings", name: "System Settings", icon: Cog, description: "Configuration" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Projects</CardDescription>
                  <CardTitle className="text-3xl">8</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +2 this week
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Active Users</CardDescription>
                  <CardTitle className="text-3xl">47</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +5 this month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Monthly Revenue</CardDescription>
                  <CardTitle className="text-3xl">${financialData.monthlyRevenue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{financialData.monthlyGrowth}% from last month
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Machine Utilization</CardDescription>
                  <CardTitle className="text-3xl">68%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">2/3 printers active</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Projects */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Latest project submissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectQueue.slice(0, 3).map((project) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Package className="w-8 h-8 text-blue-500" />
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {project.user.name} • {project.technology}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace("-", " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>System Alerts</CardTitle>
                  <CardDescription>Requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-orange-50">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      <div>
                        <div className="font-medium">Low Material Stock</div>
                        <div className="text-sm text-muted-foreground">PLA White, TPU running low</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-blue-50">
                      <Bell className="w-5 h-5 text-blue-500" />
                      <div>
                        <div className="font-medium">Maintenance Due</div>
                        <div className="text-sm text-muted-foreground">Prusa MK3S-01 in 2 weeks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg bg-red-50">
                      <Zap className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-medium">Printer Error</div>
                        <div className="text-sm text-muted-foreground">Bambu Lab P1S-01 needs attention</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Analytics Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.totalProjects}</div>
                    <div className="text-sm text-muted-foreground">Total Projects</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.successRate}%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.avgCompletionTime}</div>
                    <div className="text-sm text-muted-foreground">Avg Completion</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{analyticsData.busiestDay}</div>
                    <div className="text-sm text-muted-foreground">Busiest Day</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "projects":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="tracking-tight">Project Queue Management</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
                <Button>
                  <FileCheck className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedProjects.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{selectedProjects.length} projects selected</span>
                    </div>
                    <div className="flex gap-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Bulk actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="export-projects">Export Data</SelectItem>
                          <SelectItem value="update-status">Update Status</SelectItem>
                          <SelectItem value="assign-machine">Assign Machine</SelectItem>
                          <SelectItem value="generate-quotes">Generate Quotes</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleBulkAction} disabled={!bulkAction}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className={selectedProjects.includes(project.id) ? "border-blue-500 border-2" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedProjects.includes(project.id)}
                            onChange={() => toggleProjectSelection(project.id)}
                            className="w-4 h-4"
                            title={`Select project ${project.name}`}                         
                            />
                          <Badge className={getStatusColor(project.status)}>
                            {getStatusIcon(project.status)}
                            <span className="ml-1 capitalize">{project.status.replace("-", " ")}</span>
                          </Badge>
                          <Badge className={getPriorityColor(project.priority)}>
                            {project.priority} priority
                          </Badge>
                          {project.quality === "high" && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              <Star className="w-3 h-3 mr-1" />
                              High Quality
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Project ID: {project.id} • Submitted by: {project.user.name} ({project.user.email})
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">${project.price?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{project.printTime}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Technology & Material</div>
                        <div>{project.technology} • {project.material}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Machine</div>
                        <div>{project.machine || "Not assigned"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Material Usage</div>
                        <div>{project.materialUsed} {project.technology === 'FDM' ? 'kg' : 'L'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Timeline</div>
                        <div>Submit: {project.submittedDate}</div>
                        <div>Est: {project.estimatedCompletion}</div>
                      </div>
                    </div>

                    {project.notes && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm">
                          <strong>Notes:</strong> {project.notes}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Review Files
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact User
                      </Button>
                      <Button variant="outline" size="sm">
                        Assign Machine
                      </Button>
                      <Button variant="outline" size="sm">
                        Update Status
                      </Button>
                      {project.status === "pending-review" && (
                        <Button variant="outline" size="sm">
                          Generate Quote
                        </Button>
                      )}
                      {project.status === "completed" && (
                        <Button variant="outline" size="sm">
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "users":
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="tracking-tight">User Management</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{selectedUsers.length} users selected</span>
                    </div>
                    <div className="flex gap-2">
                      <Select value={bulkAction} onValueChange={setBulkAction}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Bulk actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="export">Export Data</SelectItem>
                          <SelectItem value="activate">Activate</SelectItem>
                          <SelectItem value="deactivate">Deactivate</SelectItem>
                          <SelectItem value="change-role">Change Role</SelectItem>
                          <SelectItem value="send-email">Send Email</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleBulkAction} disabled={!bulkAction}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create User Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New User</CardTitle>
                <CardDescription>Add a new user to the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <Input
                    placeholder="Full Name"
                    value={userForm.name}
                    onChange={(e) => setUserForm({...userForm, name: e.target.value})}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  />
                  <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Department"
                    value={userForm.department}
                    onChange={(e) => setUserForm({...userForm, department: e.target.value})}
                  />
                  <Select value={userForm.subscription} onValueChange={(value) => setUserForm({...userForm, subscription: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Subscription" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleUserCreate} disabled={!userForm.name || !userForm.email}>
                    Create User
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <Card key={user.id} className={selectedUsers.includes(user.id) ? "border-blue-500 border-2" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4"
                          aria-label={`Select user ${user.name}`}
                        />
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                          <span className="font-semibold text-blue-600">{user.avatar}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{user.name}</div>
                            {user.subscription === "premium" && <Crown className="w-4 h-4 text-yellow-500" />}
                            {user.subscription === "faculty" && <Shield className="w-4 h-4 text-blue-500" />}
                            {user.subscription === "research" && <Zap className="w-4 h-4 text-purple-500" />}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{user.role}</Badge>
                            <Badge variant="outline">{user.department}</Badge>
                            <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                            <div className="flex items-center gap-1 text-sm text-yellow-600">
                              <Star className="w-3 h-3 fill-current" />
                              {user.rating}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold">${user.totalSpent}</div>
                        <div className="text-sm text-muted-foreground">{user.projects} projects</div>
                        <div className="text-xs text-muted-foreground">Last login: {user.lastLogin.split(' ')[0]}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "machines":
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">Machine Monitoring & Analytics</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {machines.map((machine) => (
                <Card key={machine.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{machine.name}</CardTitle>
                        <CardDescription>
                          {machine.type} Printer • {machine.location}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(machine.status)}>
                        {machine.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Utilization</div>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all" 
                              style={{ width: `${machine.utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{machine.utilization}%</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Current Job</div>
                          <div className="font-medium">{machine.currentJob || "Idle"}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Queue</div>
                          <div className="font-medium">{machine.queue} jobs</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Total Print Time</div>
                          <div className="font-medium">{machine.totalPrintTime}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Material Used</div>
                          <div className="font-medium">{machine.filamentUsed}</div>
                        </div>
                      </div>

                      {machine.statusMessage && (
                        <div className="p-2 bg-gray-50 rounded text-sm">
                          {machine.statusMessage}
                        </div>
                      )}

                      <div className="pt-2 border-t">
                        <div className="text-sm text-muted-foreground">Maintenance</div>
                        <div className="flex justify-between text-sm">
                          <span>Last: {machine.lastMaintenance}</span>
                          <span>Next: {machine.nextMaintenance}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case "inventory":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="tracking-tight">Inventory Management</h2>
              <Button>
                <UploadCloud className="w-4 h-4 mr-2" />
                Order Materials
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Material</th>
                      <th className="text-left p-4 font-semibold">Type</th>
                      <th className="text-left p-4 font-semibold">Quantity</th>
                      <th className="text-left p-4 font-semibold">Cost</th>
                      <th className="text-left p-4 font-semibold">Supplier</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                      <th className="text-left p-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-4 font-medium">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            {item.material}
                          </div>
                        </td>
                        <td className="p-4">{item.type}</td>
                        <td className="p-4">
                          <div className="font-medium">{item.quantity} {item.unit}</div>
                          <div className="text-sm text-muted-foreground">Reorder: {item.reorderLevel}{item.unit}</div>
                        </td>
                        <td className="p-4">${item.costPerUnit}/{item.unit}</td>
                        <td className="p-4">{item.supplier}</td>
                        <td className="p-4">
                          {item.lowStock ? (
                            <Badge variant="destructive">Low Stock</Badge>
                          ) : (
                            <Badge className="bg-green-500">In Stock</Badge>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Reorder
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        );

      case "financial":
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">Financial Analytics & Reporting</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Monthly Revenue</CardDescription>
                  <CardTitle className="text-3xl">${financialData.monthlyRevenue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +{financialData.monthlyGrowth}% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Outstanding</CardDescription>
                  <CardTitle className="text-3xl">${financialData.outstandingInvoices}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">3 unpaid invoices</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Material Costs</CardDescription>
                  <CardTitle className="text-3xl">${financialData.materialCosts}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-500">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    -{financialData.costReduction}% from last month
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Profit Margin</CardDescription>
                  <CardTitle className="text-3xl">{financialData.profitMargin}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Operating margin</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Customers</CardTitle>
                  <CardDescription>By total spending</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {financialData.topCustomers.map((customer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-muted-foreground">{customer.projects} projects</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${customer.spent}</div>
                          <div className="text-sm text-muted-foreground">Total spent</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                  <CardDescription>Export financial data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Monthly Revenue Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Customer Spending Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Material Cost Breakdown
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Project Profitability
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "analytics":
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">Performance Analytics</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Projects Completed</CardDescription>
                  <CardTitle className="text-3xl">{analyticsData.totalProjects}</CardTitle>
                </CardHeader>
                <CardContent>
                  <PieChart className="w-8 h-8 text-blue-500" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-3xl">{analyticsData.successRate}%</CardTitle>
                </CardHeader>
                <CardContent>
                  <Target className="w-8 h-8 text-green-500" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Avg Completion Time</CardDescription>
                  <CardTitle className="text-3xl">{analyticsData.avgCompletionTime}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Clock className="w-8 h-8 text-orange-500" />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Popular Materials</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  {analyticsData.popularMaterials.map((material, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {material}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "bulk":
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">Bulk Operations Center</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Bulk user operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export User Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Import Users
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="w-4 h-4 mr-2" />
                    Bulk Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Update Roles
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Operations</CardTitle>
                  <CardDescription>Bulk project actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <DownloadCloud className="w-4 h-4 mr-2" />
                    Export Projects
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Update Deadlines
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Generate Invoices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    Update Status
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Operations</CardTitle>
                  <CardDescription>Administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    System Backup
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Security Audit
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Performance Review
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">System Configuration</h2>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>System behavior and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Auto-approve Projects</div>
                      <div className="text-sm text-muted-foreground">
                        Automatically approve projects under $100
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings.autoApprove}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoApprove: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Maintenance Mode</div>
                      <div className="text-sm text-muted-foreground">
                        Disable project submissions temporarily
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Send email updates to users
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, emailNotifications: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">SMS Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Send urgent alerts via SMS
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings.smsAlerts}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, smsAlerts: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Limits</CardTitle>
                  <CardDescription>Resource and usage limits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Max File Size (MB)</label>
                    <Input
                      type="number"
                      value={systemSettings.maxFileSize}
                      onChange={(e) => setSystemSettings({...systemSettings, maxFileSize: parseInt(e.target.value)})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Backup Frequency</label>
                    <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings({...systemSettings, backupFrequency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleSettingsUpdate} className="w-full">
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h2 className="tracking-tight">{navigationItems.find(item => item.id === activeTab)?.name}</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Staff management interface - Internal use only
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Shield className="w-3 h-3 mr-1" />
              Administrator
            </Badge>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? "bg-blue-500 text-white"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs opacity-70">{item.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function for status icons
function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4" />;
    case "in-progress":
      return <Clock className="w-4 h-4" />;
    case "queued":
      return <Package className="w-4 h-4" />;
    case "pending-review":
      return <Eye className="w-4 h-4" />;
    case "cancelled":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
}