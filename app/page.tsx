"use client"

import { useState, useEffect } from "react"
import { TaskManager } from "@/components/task-manager"
import { ProgressOverview } from "@/components/progress-overview"
import { TaskStats } from "@/components/task-stats"
import { UserProfile } from "@/components/user-profile"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { NotificationCenter } from "@/components/notifications"
import { SettingsPanel } from "@/components/settings-panel"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, CheckSquare, BarChart3, User, Bell, Settings } from "lucide-react"

// ✅ Define the UserProfile type inline or import it from your types file
interface UserProfile {
  name: string
  email: string
  profilePicture?: string
  joinDate: string
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  const [profile, setProfile] = useLocalStorage<UserProfile>("user-profile", {
    name: "Welcome User",
    email: "user@example.com",
    profilePicture: "",
    joinDate: new Date().toISOString(),
  })

  // ✅ Type-safe wrapper to match expected prop signature
  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-balance bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Smart Task Manager
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
            Organize your work with beautiful progress tracking and intelligent insights
          </p>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <UserProfile profile={profile} onUpdateProfile={handleUpdateProfile} />
            <TaskStats />
            <ProgressOverview />
          </TabsContent>

          <TabsContent value="tasks">
            <TaskManager />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="profile">
            <UserProfile profile={profile} onUpdateProfile={handleUpdateProfile} />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
