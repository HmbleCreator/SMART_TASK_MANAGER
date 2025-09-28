"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit3, Camera } from "lucide-react"

interface UserProfile {
  name: string
  email: string
  profilePicture?: string
  joinDate: string
}

interface UserProfileProps {
  profile: UserProfile
  onUpdateProfile: (profile: UserProfile) => void
}

export function UserProfile({ profile, onUpdateProfile }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: profile.name,
    email: profile.email,
    profilePicture: profile.profilePicture || "",
  })

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      name: editForm.name,
      email: editForm.email,
      profilePicture: editForm.profilePicture,
    })
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="p-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={profile.profilePicture || "/placeholder.svg"} alt={profile.name} />
          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h2 className="text-xl font-semibold">{profile.name}</h2>
          <p className="text-muted-foreground">{profile.email}</p>
          <p className="text-sm text-muted-foreground">
            Member since {new Date(profile.joinDate).toLocaleDateString()}
          </p>
        </div>

        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={editForm.profilePicture || "/placeholder.svg"} alt={editForm.name} />
                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {getInitials(editForm.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePicture">Profile Picture URL (Optional)</Label>
                <Input
                  id="profilePicture"
                  value={editForm.profilePicture}
                  onChange={(e) => setEditForm({ ...editForm, profilePicture: e.target.value })}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} className="flex-1">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  )
}
