"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Calendar, Zap, Trophy, Clock } from "lucide-react"

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

export function TaskStats() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const todayTasks = tasks.filter((t) => {
      const taskDate = new Date(t.createdAt)
      return taskDate.toDateString() === today.toDateString()
    })

    const dueTodayTasks = tasks.filter((t) => {
      return t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== "completed"
    })

    const completedToday = tasks.filter((t) => {
      const taskDate = new Date(t.createdAt)
      return t.status === "completed" && taskDate.toDateString() === today.toDateString()
    }).length

    const inProgressToday = tasks.filter((t) => {
      return t.status === "in-progress" && (dueTodayTasks.includes(t) || todayTasks.includes(t))
    }).length

    // Calculate productivity score based on completion rate and timeliness
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed",
    ).length

    let productivityScore = 0
    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100
      const overdueRate = (overdueTasks / totalTasks) * 100
      productivityScore = Math.max(0, Math.min(100, completionRate - overdueRate))
    }

    // Calculate time saved (mock calculation based on completed tasks)
    const weeklyCompleted = tasks.filter((t) => t.status === "completed" && new Date(t.createdAt) >= thisWeek).length
    const timeSaved = weeklyCompleted * 0.5 // Assume 0.5h saved per completed task

    const getProductivityLevel = (score: number) => {
      if (score >= 80) return { label: "Excellent", color: "bg-green-500/20 text-green-700" }
      if (score >= 60) return { label: "Good", color: "bg-blue-500/20 text-blue-700" }
      if (score >= 40) return { label: "Fair", color: "bg-yellow-500/20 text-yellow-700" }
      return { label: "Needs Work", color: "bg-red-500/20 text-red-700" }
    }

    return {
      todayFocus: {
        total: Math.max(dueTodayTasks.length, todayTasks.length),
        completed: completedToday,
        inProgress: inProgressToday,
      },
      productivityScore: Math.round(productivityScore),
      productivityLevel: getProductivityLevel(productivityScore),
      timeSaved: timeSaved.toFixed(1),
    }
  }, [tasks])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-6 backdrop-blur-sm float-animation">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Today's Focus</p>
            <p className="text-2xl font-bold mt-1">
              {stats.todayFocus.total} Task{stats.todayFocus.total !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.todayFocus.completed} completed, {stats.todayFocus.inProgress} in progress
            </p>
          </div>
          <div className="p-3 bg-primary/20 rounded-full">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm float-animation" style={{ animationDelay: "0.2s" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Productivity Score</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-2xl font-bold">{stats.productivityScore}</p>
              <Badge variant="secondary" className={stats.productivityLevel.color}>
                <Zap className="w-3 h-3 mr-1" />
                {stats.productivityLevel.label}
              </Badge>
            </div>
          </div>
          <div className="p-3 bg-accent/20 rounded-full">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm float-animation" style={{ animationDelay: "0.4s" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Time Saved</p>
            <p className="text-2xl font-bold mt-1">{stats.timeSaved}h</p>
            <p className="text-sm text-muted-foreground mt-1">this week</p>
          </div>
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </Card>
    </div>
  )
}
