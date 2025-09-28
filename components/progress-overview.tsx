"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { TrendingUp, Target, Clock, CheckCircle2 } from "lucide-react"

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

export function ProgressOverview() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])

  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const lastWeek = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
    const todoTasks = tasks.filter((t) => t.status === "todo").length

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Calculate weekly progress
    const thisWeekCompleted = tasks.filter((t) => t.status === "completed" && new Date(t.createdAt) >= thisWeek).length

    const lastWeekCompleted = tasks.filter(
      (t) => t.status === "completed" && new Date(t.createdAt) >= lastWeek && new Date(t.createdAt) < thisWeek,
    ).length

    const thisWeekTotal = tasks.filter((t) => new Date(t.createdAt) >= thisWeek).length
    const weeklyProgress = thisWeekTotal > 0 ? Math.round((thisWeekCompleted / thisWeekTotal) * 100) : 0

    // Calculate week-over-week change
    const weeklyChange =
      lastWeekCompleted > 0
        ? Math.round(((thisWeekCompleted - lastWeekCompleted) / lastWeekCompleted) * 100)
        : thisWeekCompleted > 0
          ? 100
          : 0

    const dailyProgress = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      const dayTasks = tasks.filter((t) => {
        const taskDate = new Date(t.createdAt)
        return taskDate.toDateString() === date.toDateString()
      })
      const dayCompleted = dayTasks.filter((t) => t.status === "completed").length
      const dayTotal = dayTasks.length
      const dayProgress = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0

      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        progress: dayProgress,
        completed: dayCompleted,
        total: dayTotal,
      }
    })

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      completionRate,
      weeklyProgress,
      weeklyChange,
      dailyProgress,
    }
  }, [tasks])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/20 rounded-full">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-green-500/20 rounded-full">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold">{stats.completedTasks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-500/20 rounded-full">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{stats.inProgressTasks}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-accent/20 rounded-full">
            <TrendingUp className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>
        </div>
      </Card>

      {/* Weekly Progress Chart */}
      <Card className="p-6 md:col-span-2 lg:col-span-4 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Weekly Progress</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>
                {stats.weeklyChange >= 0 ? "+" : ""}
                {stats.weeklyChange}% from last week
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>This Week</span>
              <span className="font-medium">{stats.weeklyProgress}%</span>
            </div>
            <Progress value={stats.weeklyProgress} className="h-3" />
          </div>
          <div className="grid grid-cols-7 gap-2 mt-4">
            {stats.dailyProgress.map((day, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                <div className="h-8 bg-primary/20 rounded-sm relative overflow-hidden group cursor-pointer">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-primary rounded-sm transition-all duration-500"
                    style={{ height: `${Math.max(day.progress, 5)}%` }}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.completed}/{day.total} tasks
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
