"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Bell, BellOff, Clock, AlertTriangle, CheckCircle2, X } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "todo" | "in-progress" | "completed"
  category: string
  dueDate: string
  createdAt: string
  progress: number
  tags: string[]
  estimatedHours?: number
}

interface Notification {
  id: string
  type: "due_today" | "overdue" | "reminder" | "completion"
  title: string
  message: string
  taskId?: string
  timestamp: string
  read: boolean
  severity: "low" | "medium" | "high"
}

interface NotificationSettings {
  enabled: boolean
  dueToday: boolean
  overdue: boolean
  reminders: boolean
  completions: boolean
}

export function NotificationCenter() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])
  const [notifications, setNotifications] = useLocalStorage<Notification[]>("notifications", [])
  const [settings, setSettings] = useLocalStorage<NotificationSettings>("notification-settings", {
    enabled: true,
    dueToday: true,
    overdue: true,
    reminders: true,
    completions: false,
  })

  // Generate notifications based on tasks
  useEffect(() => {
    if (!settings.enabled) return

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const newNotifications: Notification[] = []

    // Due today notifications
    if (settings.dueToday) {
      const dueToday = tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== "completed",
      )

      dueToday.forEach((task) => {
        const existingNotification = notifications.find(
          (n) =>
            n.taskId === task.id && n.type === "due_today" && n.timestamp.startsWith(today.toISOString().split("T")[0]),
        )

        if (!existingNotification) {
          newNotifications.push({
            id: `due-today-${task.id}-${Date.now()}`,
            type: "due_today",
            title: "Task Due Today",
            message: `"${task.title}" is due today`,
            taskId: task.id,
            timestamp: now.toISOString(),
            read: false,
            severity: task.priority === "high" ? "high" : "medium",
          })
        }
      })
    }

    // Overdue notifications
    if (settings.overdue) {
      const overdue = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed")

      overdue.forEach((task) => {
        const existingNotification = notifications.find(
          (n) =>
            n.taskId === task.id && n.type === "overdue" && n.timestamp.startsWith(today.toISOString().split("T")[0]),
        )

        if (!existingNotification) {
          const daysOverdue = Math.floor((today.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24))
          newNotifications.push({
            id: `overdue-${task.id}-${Date.now()}`,
            type: "overdue",
            title: "Task Overdue",
            message: `"${task.title}" is ${daysOverdue} day${daysOverdue > 1 ? "s" : ""} overdue`,
            taskId: task.id,
            timestamp: now.toISOString(),
            read: false,
            severity: "high",
          })
        }
      })
    }

    // Reminder notifications (tasks due in 3 days)
    if (settings.reminders) {
      const dueSoon = tasks.filter((t) => {
        if (!t.dueDate || t.status === "completed") return false
        const dueDate = new Date(t.dueDate)
        const diffTime = dueDate.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays === 3
      })

      dueSoon.forEach((task) => {
        const existingNotification = notifications.find(
          (n) =>
            n.taskId === task.id && n.type === "reminder" && n.timestamp.startsWith(today.toISOString().split("T")[0]),
        )

        if (!existingNotification) {
          newNotifications.push({
            id: `reminder-${task.id}-${Date.now()}`,
            type: "reminder",
            title: "Upcoming Deadline",
            message: `"${task.title}" is due in 3 days`,
            taskId: task.id,
            timestamp: now.toISOString(),
            read: false,
            severity: "medium",
          })
        }
      })
    }

    if (newNotifications.length > 0) {
      setNotifications([...notifications, ...newNotifications])
    }
  }, [tasks, settings, notifications, setNotifications])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (notificationId: string) => {
    setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter((n) => n.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "due_today":
        return <Clock className="w-4 h-4" />
      case "overdue":
        return <AlertTriangle className="w-4 h-4" />
      case "reminder":
        return <Bell className="w-4 h-4" />
      case "completion":
        return <CheckCircle2 className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "low":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  return (
    <Card className="backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {settings.enabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              Notifications
              {unreadCount > 0 && <Badge className="bg-red-500 text-white ml-2">{unreadCount}</Badge>}
            </CardTitle>
            <CardDescription>Stay updated on your task deadlines and progress</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={clearAllNotifications}>
                  Clear all
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Notification Settings */}
        <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold">Notification Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="notifications-enabled"
                checked={settings.enabled}
                onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
              />
              <Label htmlFor="notifications-enabled">Enable notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="due-today"
                checked={settings.dueToday}
                onCheckedChange={(checked) => setSettings({ ...settings, dueToday: checked })}
                disabled={!settings.enabled}
              />
              <Label htmlFor="due-today">Tasks due today</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="overdue"
                checked={settings.overdue}
                onCheckedChange={(checked) => setSettings({ ...settings, overdue: checked })}
                disabled={!settings.enabled}
              />
              <Label htmlFor="overdue">Overdue tasks</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="reminders"
                checked={settings.reminders}
                onCheckedChange={(checked) => setSettings({ ...settings, reminders: checked })}
                disabled={!settings.enabled}
              />
              <Label htmlFor="reminders">Deadline reminders</Label>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">
                {settings.enabled
                  ? "You're all caught up! New notifications will appear here."
                  : "Enable notifications to stay updated on your tasks."}
              </p>
            </div>
          ) : (
            notifications
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border-l-4 ${getSeverityColor(notification.severity)} ${
                    notification.read ? "opacity-60" : ""
                  } transition-all hover:shadow-md`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && <Badge className="bg-blue-500 text-white text-xs">New</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                          Mark read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
