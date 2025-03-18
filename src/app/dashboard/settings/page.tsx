"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEntities } from "~/hooks/useEntities";
import { useMoniteEntityUser } from "~/hooks/useMoniteEntityUser";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import {
  Building,
  CreditCard,
  FileText,
  Bell,
  User,
  Check,
  AlertCircle,
  Shield,
  Landmark
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { entities, isLoading: isLoadingEntities } = useEntities();
  const { 
    isLoading: isLoadingEntityUser, 
    entityId, 
    hasEntityId,
    hasValidCredentials,
    createEntityUser,
    isReady: isMoniteReady
  } = useMoniteEntityUser();

  // UI States
  const [activeTab, setActiveTab] = useState("account");
  const [testingConnection, setTestingConnection] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notifications, setNotifications] = useState({
    invoices: true,
    payments: true,
    documents: true,
    expirations: true,
    security: true,
    marketing: false
  });
  
  // Banking integration states
  const [connectedBanks, setConnectedBanks] = useState<Array<{id: string, name: string, status: string}>>([
    { id: '1', name: 'Chase Business', status: 'connected' }
  ]);
  
  // Accounting software states
  const [connectedAccounting, setConnectedAccounting] = useState<Array<{id: string, name: string, status: string}>>([]);
  const [availableAccounting, setAvailableAccounting] = useState([
    { id: 'qb', name: 'QuickBooks Online', logo: '/accounting-logos/quickbooks.svg' },
    { id: 'xero', name: 'Xero', logo: '/accounting-logos/xero.svg' },
    { id: 'sage', name: 'Sage', logo: '/accounting-logos/sage.svg' },
    { id: 'wave', name: 'Wave', logo: '/accounting-logos/wave.svg' },
    { id: 'freshbooks', name: 'FreshBooks', logo: '/accounting-logos/freshbooks.svg' },
  ]);
  
  // Mock function for testing API connection
  const testApiConnection = async () => {
    setTestingConnection(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setTestingConnection(false);
  };
  
  // Mock function for connecting to accounting software
  const connectToAccounting = async (id: string) => {
    // In a real implementation, this would open OAuth flow for the selected accounting software
    alert(`This would initiate OAuth flow for ${id}`);
  };
  
  // Mock function for connecting to a bank
  const connectNewBank = () => {
    // In a real implementation, this would open Plaid or similar banking connection flow
    alert("This would open Plaid Link or similar banking connection flow");
  };
  
  // Mock function for saving API settings
  const saveApiSettings = async () => {
    setSavingSettings(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSavingSettings(false);
    alert("Settings saved successfully");
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage your account settings, integrations, and preferences</p>
      </div>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="monite" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Monite API</span>
          </TabsTrigger>
          <TabsTrigger value="banking" className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span className="hidden sm:inline">Banking</span>
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Accounting</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Manage your personal account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={session?.user?.name ?? ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue={session?.user?.email ?? ""} disabled />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your account security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm text-gray-500">Update your password regularly for better security</p>
                    </div>
                    <Button variant="outline">Update</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Monite API Settings */}
        <TabsContent value="monite">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monite API Configuration</CardTitle>
                <CardDescription>
                  Manage your Monite API connection and entity settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-full p-2 ${isMoniteReady ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {isMoniteReady ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium">API Connection Status</h3>
                      <p className="text-sm text-gray-600">
                        {isLoadingEntityUser 
                          ? "Checking connection status..." 
                          : isMoniteReady 
                            ? "Successfully connected to Monite API" 
                            : "Monite API connection not configured"}
                      </p>
                    </div>
                  </div>
                  
                  {!isMoniteReady && (
                    <Button 
                      onClick={() => createEntityUser()}
                      disabled={isLoadingEntityUser}
                    >
                      Connect
                    </Button>
                  )}
                  
                  {isMoniteReady && (
                    <Button 
                      variant="outline" 
                      onClick={testApiConnection}
                      disabled={testingConnection}
                    >
                      {testingConnection ? "Testing..." : "Test Connection"}
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="entity-id">Entity ID</Label>
                    <div className="flex items-center gap-2">
                      <Input id="entity-id" value={entityId ?? ""} readOnly />
                      <Button variant="ghost" size="sm" onClick={() => {
                        if (entityId) {
                          navigator.clipboard.writeText(entityId);
                          alert("Entity ID copied to clipboard");
                        }
                      }} disabled={!entityId}>
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Your Monite entity identifier</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="api-environment">API Environment</Label>
                    <select 
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2" 
                      id="api-environment" 
                      defaultValue="sandbox"
                      disabled={isMoniteReady}
                    >
                      <option value="sandbox">Sandbox (Testing)</option>
                      <option value="production">Production</option>
                    </select>
                    <p className="text-xs text-gray-500">Which Monite environment to use</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (confirm("Are you sure you want to disconnect? This will remove your Monite entity connection.")) {
                      // In real implementation, this would call an API to disconnect
                      alert("In a real implementation, this would disconnect your Monite entity");
                    }
                  }}
                  disabled={!isMoniteReady}
                >
                  Disconnect
                </Button>
                <Button 
                  onClick={saveApiSettings}
                  disabled={savingSettings || !isMoniteReady}
                >
                  {savingSettings ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>API Access Settings</CardTitle>
                <CardDescription>
                  Manage API keys and access controls for Monite integration
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Webhook Notifications</h3>
                      <p className="text-sm text-gray-500">Receive real-time notifications when events occur</p>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">API Rate Limiting</h3>
                      <p className="text-sm text-gray-500">Control how many API requests can be made per minute</p>
                    </div>
                    <select className="w-32 rounded-md border border-input bg-background px-3 py-1 text-sm">
                      <option value="100">100/min</option>
                      <option value="500">500/min</option>
                      <option value="1000">1000/min</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">IP Restrictions</h3>
                      <p className="text-sm text-gray-500">Restrict API access to specific IP addresses</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Monite Features</CardTitle>
                <CardDescription>
                  Enable or disable specific Monite API features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Payment Processing</h3>
                        <p className="text-sm text-gray-500">Receive and process payments</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Invoice Management</h3>
                        <p className="text-sm text-gray-500">Create and manage invoices</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Compliance & KYC</h3>
                        <p className="text-sm text-gray-500">Identity verification and compliance features</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Landmark className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-medium">Banking Integration</h3>
                        <p className="text-sm text-gray-500">Connect with bank accounts</p>
                      </div>
                    </div>
                    <Switch checked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Banking Integration Settings */}
        <TabsContent value="banking">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Bank Accounts</CardTitle>
                <CardDescription>
                  Manage your linked bank accounts for payments and reconciliation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedBanks.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg border-dashed">
                    <Landmark className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-1">No Bank Accounts Connected</h3>
                    <p className="text-sm text-gray-500 mb-4">Connect your bank account to enable automated payments and reconciliation</p>
                    <Button onClick={connectNewBank}>Connect Bank</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connectedBanks.map(bank => (
                      <div key={bank.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Landmark className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{bank.name}</h3>
                            <div className="flex items-center gap-1 text-xs">
                              <Badge variant="success" size="sm">
                                {bank.status === 'connected' ? 'Connected' : 'Pending'}
                              </Badge>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500">Last synced: Today at 2:45 PM</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Manage
                          </Button>
                          <Button size="sm" variant="danger">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4">
                      <Button onClick={connectNewBank} variant="outline" className="w-full">
                        <Landmark className="h-4 w-4 mr-2" />
                        Connect Another Bank Account
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Banking Sync Settings</CardTitle>
                <CardDescription>
                  Configure how and when your bank data is synchronized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Auto-sync Frequency</h3>
                    <p className="text-sm text-gray-500">How often to synchronize bank transactions</p>
                  </div>
                  <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option value="real-time">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Auto-categorize Transactions</h3>
                    <p className="text-sm text-gray-500">Automatically categorize transactions based on rules</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Transaction Alerts</h3>
                    <p className="text-sm text-gray-500">Get notified of unusual or large transactions</p>
                  </div>
                  <Switch checked={true} />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Banking Settings</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Accounting Integration Settings */}
        <TabsContent value="accounting">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Accounting Software Integration</CardTitle>
                <CardDescription>
                  Connect to your accounting software for seamless data synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {connectedAccounting.length === 0 ? (
                  <div className="p-8 text-center border rounded-lg border-dashed">
                    <FileText className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-1">No Accounting Software Connected</h3>
                    <p className="text-sm text-gray-500 mb-6">Connect your accounting software to automate reconciliation and bookkeeping</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableAccounting.map(software => (
                        <div key={software.id} className="border rounded-lg p-4 flex flex-col items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-full mb-3 flex items-center justify-center">
                            {/* Placeholder for logo */}
                            <FileText className="h-6 w-6 text-gray-500" />
                          </div>
                          <h4 className="font-medium text-sm mb-3">{software.name}</h4>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => connectToAccounting(software.id)}
                          >
                            Connect
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connectedAccounting.map(software => (
                      <div key={software.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-full">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{software.name}</h3>
                            <div className="flex items-center gap-1 text-xs">
                              <Badge variant="success" size="sm">
                                {software.status === 'connected' ? 'Connected' : 'Pending'}
                              </Badge>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-500">Last synced: Today at 2:45 PM</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Sync Now
                          </Button>
                          <Button size="sm" variant="danger">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Synchronization</CardTitle>
                <CardDescription>
                  Configure what data is synchronized with your accounting software
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Invoices</h3>
                    <p className="text-sm text-gray-500">Sync invoices with your accounting software</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Bills & Expenses</h3>
                    <p className="text-sm text-gray-500">Sync bills and expenses</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Bank Transactions</h3>
                    <p className="text-sm text-gray-500">Sync bank transactions</p>
                  </div>
                  <Switch checked={true} />
                </div>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Sync Frequency</h3>
                    <p className="text-sm text-gray-500">How often to synchronize accounting data</p>
                  </div>
                  <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
                    <option value="real-time">Real-time</option>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled={connectedAccounting.length === 0}>
                  Save Sync Settings
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Email Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="invoices" className="font-normal">Invoice Notifications</Label>
                      <p className="text-xs text-gray-500">New invoices, payments, and overdue reminders</p>
                    </div>
                    <Switch 
                      id="invoices" 
                      checked={notifications.invoices}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, invoices: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="payments" className="font-normal">Payment Notifications</Label>
                      <p className="text-xs text-gray-500">Successful and failed payment attempts</p>
                    </div>
                    <Switch 
                      id="payments" 
                      checked={notifications.payments}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, payments: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="documents" className="font-normal">Document Processing</Label>
                      <p className="text-xs text-gray-500">Document uploads, processing status, and results</p>
                    </div>
                    <Switch 
                      id="documents" 
                      checked={notifications.documents}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, documents: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="expirations" className="font-normal">Expirations & Renewals</Label>
                      <p className="text-xs text-gray-500">Subscription renewals and credential expirations</p>
                    </div>
                    <Switch 
                      id="expirations" 
                      checked={notifications.expirations}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, expirations: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="security" className="font-normal">Security Alerts</Label>
                      <p className="text-xs text-gray-500">Login attempts, password changes, and security events</p>
                    </div>
                    <Switch 
                      id="security" 
                      checked={notifications.security}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, security: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="marketing" className="font-normal">Marketing & Updates</Label>
                      <p className="text-xs text-gray-500">New features, product updates, and promotional messages</p>
                    </div>
                    <Switch 
                      id="marketing" 
                      checked={notifications.marketing}
                      onCheckedChange={(checked: boolean) => setNotifications({...notifications, marketing: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Notification Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
