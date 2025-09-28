"use client"

import { useState, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  Plus,
  Calendar,
  Clock,
  Flag,
  Trash2,
  Edit3,
  CheckCircle2,
  Search,
  Bell,
  AlertTriangle,
  Briefcase,
  User,
  GraduationCap,
  Home,
  Heart,
  ShoppingCart,
  Gamepad2,
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
  { id: "work", label: "Work", icon: Briefcase, color: "bg-blue-500/20 text-blue-700 dark:text-blue-300" },
  { id: "personal", label: "Personal", icon: User, color: "bg-green-500/20 text-green-700 dark:text-green-300" },
  { id: "study", label: "Study", icon: GraduationCap, color: "bg-purple-500/20 text-purple-700 dark:text-purple-300" },
  { id: "home", label: "Home", icon: Home, color: "bg-orange-500/20 text-orange-700 dark:text-orange-300" },
  { id: "health", label: "Health", icon: Heart, color: "bg-red-500/20 text-red-700 dark:text-red-300" },
  {
    id: "shopping",
    label: "Shopping",
    icon: ShoppingCart,
    color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  },
  { id: "hobby", label: "Hobby", icon: Gamepad2, color: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" },
]

export function TaskManager() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("tasks", [])
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "todo" | "in-progress" | "completed">("all")
  const [selectedPriority, setSelectedPriority] = useState<"all" | "low" | "medium" | "high">("all")
  const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "created" | "progress">("dueDate")

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as const,
    category: "work",
    dueDate: "",
    tags: "",
    estimatedHours: "",
  })

  const filteredAndSortedTasks = useMemo(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "all" || task.category === selectedCategory
      const matchesStatus = selectedStatus === "all" || task.status === selectedStatus
      const matchesPriority = selectedPriority === "all" || task.priority === selectedPriority

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority
    })

    // Sort tasks
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "progress":
          return b.progress - a.progress
        default:
          return 0
      }
    })

    return filtered
  }, [tasks, searchQuery, selectedCategory, selectedStatus, selectedPriority, sortBy])

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      status: "todo",
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      progress: 0,
      tags: newTask.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      estimatedHours: newTask.estimatedHours ? Number(newTask.estimatedHours) : undefined,
    }

    setTasks([...tasks, task])
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "work",
      dueDate: "",
      tags: "",
      estimatedHours: "",
    })
    setIsAddingTask(false)
  }

  const updateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
  }

  const updateTaskStatus = (id: string, status: Task["status"]) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status, progress: status === "completed" ? 100 : task.progress } : task,
      ),
    )
  }

  const updateTaskProgress = (id: string, progress: number) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              progress,
              status: progress === 100 ? "completed" : progress > 0 ? "in-progress" : "todo",
            }
          : task,
      ),
    )
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const getCategoryInfo = (categoryId: string) => {
    return TASK_CATEGORIES.find((cat) => cat.id === categoryId) || TASK_CATEGORIES[0]
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "low":
        return "bg-secondary text-secondary-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-700 dark:text-green-300"
      case "in-progress":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300"
      case "todo":
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
    }
  }

  const isOverdue = (dueDate: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const isDueSoon = (dueDate: string) => {
    if (!dueDate) return false
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="p-6 backdrop-blur-sm">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search tasks, descriptions, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {TASK_CATEGORIES.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <category.icon className="w-4 h-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value: any) => setSelectedStatus(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="progress">Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tasks ({filteredAndSortedTasks.length})</h2>
          <p className="text-muted-foreground">{searchQuery && `Showing results for "${searchQuery}"`}</p>
        </div>

        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button className="pulse-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your task"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TASK_CATEGORIES.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <category.icon className="w-4 h-4" />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="Hours"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="urgent, meeting, review"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={addTask} className="flex-1">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setIsAddingTask(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tasks Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAndSortedTasks.map((task, index) => {
          const categoryInfo = getCategoryInfo(task.category)
          const CategoryIcon = categoryInfo.icon

          return (
            <Card
              key={task.id}
              className="p-6 hover:shadow-lg transition-all duration-300 float-animation backdrop-blur-sm relative"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Overdue/Due Soon Indicators */}
              {isOverdue(task.dueDate) && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-destructive text-destructive-foreground">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Overdue
                  </Badge>
                </div>
              )}
              {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-yellow-500 text-yellow-900">
                    <Bell className="w-3 h-3 mr-1" />
                    Due Soon
                  </Badge>
                </div>
              )}

              <div className="space-y-4">
                {/* Task Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-balance leading-tight">{task.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 text-pretty">{task.description}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="sm" onClick={() => setEditingTask(task)} className="h-8 w-8 p-0">
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <Progress value={task.progress} className="h-2" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={task.progress}
                    onChange={(e) => updateTaskProgress(task.id, Number.parseInt(e.target.value))}
                    className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>

                {/* Task Meta */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={categoryInfo.color}>
                    <CategoryIcon className="w-3 h-3 mr-1" />
                    {categoryInfo.label}
                  </Badge>
                  <Badge className={getPriorityColor(task.priority)}>
                    <Flag className="w-3 h-3 mr-1" />
                    {task.priority}
                  </Badge>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {task.status === "in-progress" && <Clock className="w-3 h-3 mr-1" />}
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>

                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {task.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Due Date and Estimated Hours */}
                <div className="space-y-1">
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span className={isOverdue(task.dueDate) ? "text-destructive font-medium" : ""}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {task.estimatedHours && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>Estimated: {task.estimatedHours}h</span>
                    </div>
                  )}
                </div>

                {/* Status Actions */}
                <div className="flex gap-2 pt-2">
                  {task.status !== "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, "completed")}
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Complete
                    </Button>
                  )}
                  {task.status === "todo" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, "in-progress")}
                      className="flex-1"
                    >
                      <Clock className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {filteredAndSortedTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedCategory !== "all" || selectedStatus !== "all" || selectedPriority !== "all"
              ? "Try adjusting your filters or search query."
              : "Create your first task to get started!"}
          </p>
        </div>
      )}
    </div>
  )
}
