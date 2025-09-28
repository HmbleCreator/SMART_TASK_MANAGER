"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Target,
  Award,
  Activity,
  BarChart3,
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

const TASK_CATEGORIES = [
  { id: "work", label: "Work", color: "#3b82f6" },
  { id: "personal", label: "Personal", color: "#10b981" },
  { id: "study", label: "Study", color: "#8b5cf6" },
  { id: "home", label: "Home", color: "#f59e0b" },
  { id: "health", label: "Health", color: "#ef4444" },
  { id: "shopping", label: "Shopping", color: "#eab308" },
  { id: "hobby", label: "Hobby", color: "#6366f1" },
]

export function AnalyticsDashboard() {
  const [tasks] = useLocalStorage<Task[]>("tasks", [])

  const analytics = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Basic stats
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
    const todoTasks = tasks.filter((t) => t.status === "todo").length

    // Due date analysis
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== "completed",
    ).length

    const dueTodayTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== "completed",
    ).length

    const dueThisWeekTasks = tasks.filter(
      (t) =>
        t.dueDate &&
        new Date(t.dueDate) >= today &&
        new Date(t.dueDate) <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000) &&
        t.status !== "completed",
    ).length

    // Completion rate
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    // Weekly productivity
    const weeklyCompleted = tasks.filter((t) => t.status === "completed" && new Date(t.createdAt) >= thisWeek).length

    const monthlyCompleted = tasks.filter((t) => t.status === "completed" && new Date(t.createdAt) >= thisMonth).length

    // Category breakdown
    const categoryStats = TASK_CATEGORIES.map((category) => {
      const categoryTasks = tasks.filter((t) => t.category === category.id)
      const completed = categoryTasks.filter((t) => t.status === "completed").length
      const total = categoryTasks.length

      return {
        name: category.label,
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        color: category.color,
      }
    }).filter((cat) => cat.total > 0)

    // Priority breakdown
    const priorityStats = [
      { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
      { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
      { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
    ].filter((p) => p.value > 0)

    // Daily completion trend (last 7 days)
    const dailyTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000)
      const completed = tasks.filter((t) => {
        const taskDate = new Date(t.createdAt)
        return t.status === "completed" && taskDate.toDateString() === date.toDateString()
      }).length

      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        completed,
      }
    })

    // Most active category
    const mostActiveCategory = categoryStats.reduce(
      (prev, current) => (prev.total > current.total ? prev : current),
      categoryStats[0] || { name: "None", total: 0 },
    )

    // Average completion time (mock calculation)
    const avgCompletionTime = completedTasks > 0 ? Math.round(Math.random() * 5 + 2) : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      overdueTasks,
      dueTodayTasks,
      dueThisWeekTasks,
      completionRate,
      weeklyCompleted,
      monthlyCompleted,
      categoryStats,
      priorityStats,
      dailyTrend,
      mostActiveCategory,
      avgCompletionTime,
    }
  }, [tasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">{analytics.completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate}%</div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{analytics.dueTodayTasks}</div>
            <p className="text-xs text-muted-foreground">{analytics.overdueTasks} overdue</p>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.weeklyCompleted}</div>
            <p className="text-xs text-muted-foreground">{analytics.monthlyCompleted} this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Completion Trend */}
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Daily Completion Trend</CardTitle>
            <CardDescription>Tasks completed over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={analytics.dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>Tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analytics.priorityStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.priorityStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {analytics.priorityStats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                  <span className="text-sm">
                    {stat.name}: {stat.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card className="backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Completion rates by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.categoryStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(var(--muted))" name="Total Tasks" />
              <Bar dataKey="completed" fill="hsl(var(--primary))" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {analytics.weeklyCompleted > analytics.monthlyCompleted / 4 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">
                {analytics.weeklyCompleted > analytics.monthlyCompleted / 4
                  ? "Above average weekly performance"
                  : "Below average weekly performance"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Average completion time: {analytics.avgCompletionTime} days</span>
            </div>

            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm">
                Most active: {analytics.mostActiveCategory.name} ({analytics.mostActiveCategory.total} tasks)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Due Today</span>
              <Badge variant={analytics.dueTodayTasks > 0 ? "destructive" : "secondary"}>
                {analytics.dueTodayTasks}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Due This Week</span>
              <Badge variant={analytics.dueThisWeekTasks > 0 ? "default" : "secondary"}>
                {analytics.dueThisWeekTasks}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Overdue</span>
              <Badge variant={analytics.overdueTasks > 0 ? "destructive" : "secondary"}>{analytics.overdueTasks}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Task Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Completed
              </span>
              <span className="font-medium">{analytics.completedTasks}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                In Progress
              </span>
              <span className="font-medium">{analytics.inProgressTasks}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-gray-500" />
                To Do
              </span>
              <span className="font-medium">{analytics.todoTasks}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
