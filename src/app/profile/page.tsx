'use client';

import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0a4d0a] text-[#f0f0f0] p-4 ">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-card rounded-lg p-5 border-6 border-amber-300 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
            <div className="grid gap-4">
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <p className="text-muted-foreground">John Doe</p>
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <p className="text-muted-foreground">john@example.com</p>
              </div>
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline">Edit Profile</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
