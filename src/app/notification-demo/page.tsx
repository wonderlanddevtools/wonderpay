"use client";

import { NotificationBanner } from "@/components/ui/notification-banner";
import { Button } from "@/components/ui/button";

export default function NotificationDemo() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Notification Banner Demo</h1>
      
      <div className="space-y-4">
        <NotificationBanner 
          variant="success" 
          title="Success!" 
          description="Your changes have been saved successfully."
          action={<Button size="sm" variant="outline">View changes</Button>}
        />
        
        <NotificationBanner 
          variant="error" 
          title="Error!" 
          description="There was a problem processing your request. Please try again."
          action={<Button size="sm" variant="outline">Try again</Button>}
        />
        
        <NotificationBanner 
          variant="info" 
          title="Information" 
          description="Your account will be upgraded in 3 days. Please complete your profile."
          action={<Button size="sm" variant="outline">Complete profile</Button>}
        />
      </div>
    </div>
  );
}
