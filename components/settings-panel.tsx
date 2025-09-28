"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useTheme } from "next-themes"
import {
  Settings,
  Download,
  Upload,
  Moon,
  Sun,
  Monitor,
  FileText,
  Database,
  Trash2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react"

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

interface AppSettings {
  autoSave: boolean
  showCompletedTasks: boolean
  defaultCategory: string
  defaultPriority: "low" | "medium" | "high"
  compactView: boolean
  showProgressBars: boolean
}

export function SettingsPanel() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [appSettings, setAppSettings] = useLocalStorage<AppSettings>("app-settings", {
    autoSave: true,
    showCompletedTasks: true,
    defaultCategory: "work",
    defaultPriority: "medium",
    compactView: false,
    showProgressBars: true,
  })
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle")
  const { theme, setTheme } = useTheme()

  const exportToCSV = () => {
    setExportStatus("exporting")

    const headers = [
      "Title",
      "Description",
      "Category",
      "Priority",
      "Status",
      "Progress",
      "Due Date",
      "Created Date",
      "Tags",
      "Estimated Hours",
    ]

    const csvContent = [
      headers.join(","),
      ...tasks.map((task) =>
        [
          `"${task.title.replace(/"/g, '""')}"`,
          `"${task.description.replace(/"/g, '""')}"`,
          task.category,
          task.priority,
          task.status,
          task.progress,
          task.dueDate || "",
          task.createdAt,
          `"${task.tags.join("; ")}"`,
          task.estimatedHours || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setExportStatus("success")
      setTimeout(() => setExportStatus("idle"), 2000)
    }, 1000)
  }

  const exportToJSON = () => {
    setExportStatus("exporting")

    const exportData = {
      tasks,
      exportDate: new Date().toISOString(),
      version: "1.0",
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-backup-${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      setExportStatus("success")
      setTimeout(() => setExportStatus("idle"), 2000)
    }, 1000)
  }

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const importData = JSON.parse(content)

        if (importData.tasks && Array.isArray(importData.tasks)) {
          setTasks(importData.tasks)
          alert(`Successfully imported ${importData.tasks.length} tasks!`)
        } else {
          alert("Invalid file format. Please select a valid backup file.")
        }
      } catch (error) {
        alert("Error reading file. Please check the file format.")
      }
    }
    reader.readAsText(file)

    // Reset the input
    event.target.value = ""
  }

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setTasks([])
      localStorage.removeItem("notifications")
      localStorage.removeItem("user-profile")
      alert("All data has been cleared.")
    }
  }

  const resetSettings = () => {
    if (confirm("Reset all settings to default values?")) {
      setAppSettings({
        autoSave: true,
        showCompletedTasks: true,
        defaultCategory: "work",
        defaultPriority: "medium",
        compactView: false,
        showProgressBars: true,
      })
    }
  }

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>

      {/* Theme Settings */}
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getThemeIcon()}
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of your task manager</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4" />
                    Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="compact-view">Compact view</Label>
            <Switch
              id="compact-view"
              checked={appSettings.compactView}
              onCheckedChange={(checked) => setAppSettings({ ...appSettings, compactView: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-progress">Show progress bars</Label>
            <Switch
              id="show-progress"
              checked={appSettings.showProgressBars}
              onCheckedChange={(checked) => setAppSettings({ ...appSettings, showProgressBars: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Task Settings */}
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Task Preferences</CardTitle>
          <CardDescription>Configure default task settings and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-save">Auto-save changes</Label>
            <Switch
              id="auto-save"
              checked={appSettings.autoSave}
              onCheckedChange={(checked) => setAppSettings({ ...appSettings, autoSave: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-completed">Show completed tasks</Label>
            <Switch
              id="show-completed"
              checked={appSettings.showCompletedTasks}
              onCheckedChange={(checked) => setAppSettings({ ...appSettings, showCompletedTasks: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="default-category">Default category</Label>
            <Select
              value={appSettings.defaultCategory}
              onValueChange={(value) => setAppSettings({ ...appSettings, defaultCategory: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="study">Study</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="hobby">Hobby</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="default-priority">Default priority</Label>
            <Select
              value={appSettings.defaultPriority}
              onValueChange={(value: any) => setAppSettings({ ...appSettings, defaultPriority: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export, import, and manage your task data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Export Data</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={exportToCSV}
                disabled={exportStatus === "exporting"}
                className="flex-1 bg-transparent"
              >
                {exportStatus === "exporting" ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : exportStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                Export CSV
              </Button>
              <Button
                variant="outline"
                onClick={exportToJSON}
                disabled={exportStatus === "exporting"}
                className="flex-1 bg-transparent"
              >
                {exportStatus === "exporting" ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : exportStatus === "success" ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Backup JSON
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Import Data</h4>
            <div className="flex items-center gap-2">
              <input type="file" accept=".json" onChange={importFromJSON} className="hidden" id="import-file" />
              <Button variant="outline" asChild className="flex-1 bg-transparent">
                <label htmlFor="import-file" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Backup
                </label>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Import tasks from a previously exported JSON backup file.</p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-destructive">Danger Zone</h4>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetSettings} className="flex-1 bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Settings
              </Button>
              <Button variant="destructive" onClick={clearAllData} className="flex-1">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              These actions cannot be undone. Make sure to export your data first.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Storage Information</CardTitle>
          <CardDescription>Current data usage and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total tasks:</span>
              <span className="font-medium ml-2">{tasks.length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium ml-2">{tasks.filter((t) => t.status === "completed").length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">In progress:</span>
              <span className="font-medium ml-2">{tasks.filter((t) => t.status === "in-progress").length}</span>
            </div>
            <div>
              <span className="text-muted-foreground">To do:</span>
              <span className="font-medium ml-2">{tasks.filter((t) => t.status === "todo").length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
