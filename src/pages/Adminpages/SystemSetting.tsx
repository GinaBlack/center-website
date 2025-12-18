import React, { useState } from 'react';
import {Card, CardTitle, CardDescription, CardHeader, CardContent} from '../../components/ui/card'
import { Switch } from "../../components/ui/switch";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Input } from "../../components/ui/input";




export function  SystemSetting()  {
    const [systemSettings, setSystemSettings] = useState({
      autoApprove: false,
      maintenanceMode: false,
      emailNotifications: true,
      smsAlerts: true,
      maxFileSize: 100,
      backupFrequency: "daily"
    });
    
    const handleSettingsUpdate = () => {
      console.log("Updating system settings:", systemSettings);
      // Implement settings update logic
    };
    return (
        <div className='min-h-screen py-20 p-4'>
            <h1 className='text-lg mb-8'>System Setting</h1>
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
        </div>
    );
};

export default SystemSetting;