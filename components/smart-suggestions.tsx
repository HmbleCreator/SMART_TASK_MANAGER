"use client"

import type React from "react"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  Lightbulb,
  Clock,
  AlertTriangle,
  TrendingUp,
  Target,
  Calendar,
  Zap,
  Brain,
  CheckCircle2,
  ArrowRight,
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

interface Suggestion {
  id: string
  type: "priority" | "schedule" | "breakdown" | "reminder" | "optimization"
  title: string
  description: string
  action?: string
  taskId?: string
  icon: React.ComponentType<{ className?: string }>
  severity: "low" | "medium" | "high"
}

export function SmartSuggestions() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])

  const suggestions = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const suggestions: Suggestion[] = []

    // Priority suggestions based on due dates and importance
    const highPriorityOverdue = tasks.filter(
      (t) => t.priority === "high" && t.dueDate && new Date(t.dueDate) < today && t.status !== "completed",
    )

    if (highPriorityOverdue.length > 0) {
      suggestions.push({
        id: "high-priority-overdue",
        type: "priority",
        title: "High Priority Tasks Overdue",
        description: `You have ${highPriorityOverdue.length} high-priority tasks that are overdue. Consider addressing these immediately.`,
        action: "Review overdue tasks",
        icon: AlertTriangle,
        severity: "high",
      })
    }

    // Due today suggestions
    const dueToday = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== "completed",
    )

    if (dueToday.length > 0) {
      suggestions.push({
        id: "due-today",
        type: "reminder",
        title: "Tasks Due Today",
        description: `You have ${dueToday.length} tasks due today. Plan your day accordingly.`,
        action: "View today's tasks",
        icon: Calendar,
        severity: "medium",
      })
    }

    // Large task breakdown suggestions
    const largeTasks = tasks.filter(
      (t) => t.estimatedHours && t.estimatedHours > 8 && t.status !== "completed" && t.progress < 50,
    )

    if (largeTasks.length > 0) {
      suggestions.push({
        id: "break-down-large-tasks",
        type: "breakdown",
        title: "Break Down Large Tasks",
        description: `Consider breaking down tasks with 8+ hour estimates into smaller, manageable subtasks.`,
        action: "Review large tasks",
        icon: Target,
        severity: "medium",
      })
    }

    // Productivity optimization
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress")
    if (inProgressTasks.length > 5) {
      suggestions.push({
        id: "too-many-in-progress",
        type: "optimization",
        title: "Too Many Tasks In Progress",
        description: `You have ${inProgressTasks.length} tasks in progress. Consider focusing on fewer tasks for better productivity.`,
        action: "Focus on key tasks",
        icon: TrendingUp,
        severity: "medium",
      })
    }

    // Schedule optimization
    const unscheduledHighPriority = tasks.filter((t) => t.priority === "high" && !t.dueDate && t.status !== "completed")

    if (unscheduledHighPriority.length > 0) {
      suggestions.push({
        id: "schedule-high-priority",
        type: "schedule",
        title: "Schedule High Priority Tasks",
        description: `${unscheduledHighPriority.length} high-priority tasks don't have due dates. Setting deadlines can improve completion rates.`,
        action: "Add due dates",
        icon: Clock,
        severity: "medium",
      })
    }

    // Completion streak
    const recentlyCompleted = tasks.filter((t) => {
      const completedDate = new Date(t.createdAt)
      const daysDiff = Math.floor((now.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
      return t.status === "completed" && daysDiff <= 7
    }).length

    if (recentlyCompleted >= 5) {
      suggestions.push({
        id: "completion-streak",
        type: "optimization",
        title: "Great Productivity Streak!",
        description: `You've completed ${recentlyCompleted} tasks this week. Keep up the excellent work!`,
        icon: CheckCircle2,
        severity: "low",
      })
    }

    // Time slot recommendations
    const morningTasks = tasks.filter((t) => t.category === "work" && t.status !== "completed").length
    const personalTasks = tasks.filter((t) => t.category === "personal" && t.status !== "completed").length

    if (morningTasks > 0 && personalTasks > 0) {
      suggestions.push({
        id: "time-slot-recommendation",
        type: "schedule",
        title: "Optimize Your Schedule",
        description:
          "Consider tackling work tasks in the morning when focus is highest, and personal tasks in the evening.",
        action: "Plan your day",
        icon: Zap,
        severity: "low",
      })
    }

    return suggestions.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }, [tasks])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20"
      case "medium":
        return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20"
      case "low":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20"
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge className="bg-red-500 text-white">Urgent</Badge>
      case "medium":
        return <Badge className="bg-yellow-500 text-white">Important</Badge>
      case "low":
        return <Badge className="bg-green-500 text-white">Tip</Badge>
      default:
        return <Badge variant="secondary">Info</Badge>
    }
  }

  if (suggestions.length === 0) {
    return (
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Smart Suggestions
          </CardTitle>
          <CardDescription>AI-powered recommendations to boost your productivity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">
              No suggestions at the moment. Keep up the great work managing your tasks!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Smart Suggestions
        </CardTitle>
        <CardDescription>AI-powered recommendations to boost your productivity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => {
            const IconComponent = suggestion.icon
            return (
              <div
                key={suggestion.id}
                className={`p-4 rounded-lg border-l-4 ${getSeverityColor(suggestion.severity)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <IconComponent className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        {getSeverityBadge(suggestion.severity)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                      {suggestion.action && (
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          {suggestion.action}
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
