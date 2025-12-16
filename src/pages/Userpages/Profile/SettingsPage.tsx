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

export function SettingsPage (){
  const navigateTo = (page: string) => {
    window.location.hash = page;
  };


  return (
    <div className="pt-16 min-h-screen bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="tracking-tight text-lgx mb-2">Settings</h1>
        </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <div className="p-2 bg-muted rounded">John Doe</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <div className="p-2 bg-muted rounded">john.doe@university.edu</div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Account Type</label>
                    <div className="p-2 bg-muted rounded">Student</div>
                  </div>
                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Manage your notification and display settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates about your projects
                      </div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" aria-label="Email Notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div>Marketing Emails</div>
                      <div className="text-sm text-muted-foreground">
                        Promotions and special offers
                      </div>
                    </div>
                    <input type="checkbox" className="w-4 h-4" aria-label="Marketing Emails" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div>SMS Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Text updates for urgent matters
                      </div>
                    </div>
                    <input type="checkbox" className="w-4 h-4" aria-label="SMS Notifications" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Shipping and billing addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <div className="mb-1">University Campus</div>
                    <div className="text-sm text-muted-foreground">
                      123 College Ave<br />
                      San Francisco, CA 94102
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Add New Address
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>
                    Password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    Change Password
                  </Button>
                  <Button variant="outline" className="w-full">
                    Two-Factor Authentication
                  </Button>
                  <Button variant="outline" className="w-full text-red-500 hover:text-red-600">
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
            </div>
    </div>
  );
}
export default SettingsPage;