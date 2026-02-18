"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import {
  Eye,
  Check,
  X,
  Clock,
  User,
  Mail,
  Calendar,
  FileText,
  Download,
  ExternalLink
} from "lucide-react"
import { format } from "date-fns"

interface Profile {
  id: string
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  kycStatus: string
  isComplete: boolean
  completionStep: number
  usn: string | null
  branch: string | null
  batch: string | null
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    email: string | null
    createdAt: Date
  }
}

interface KYCVerificationQueueProps {
  pendingVerifications: Profile[]
  adminId: string
}

export function KYCVerificationQueue({ pendingVerifications, adminId }: KYCVerificationQueueProps) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800'
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleVerification = async (profileId: string, status: 'VERIFIED' | 'REJECTED') => {
    setIsProcessing(true)
    try {
      const response = await fetch('/api/admin/kyc-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId,
          status,
          notes: verificationNotes,
          verifiedBy: adminId
        }),
      })

      if (response.ok) {
        // Refresh the page or update the state
        window.location.reload()
      }
    } catch (error) {
      console.error('Error updating KYC status:', error)
    } finally {
      setIsProcessing(false)
      setVerificationNotes("")
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingVerifications.filter(p => p.kycStatus === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingVerifications.filter(p => p.kycStatus === 'UNDER_REVIEW').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingVerifications.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Queue */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Queue</CardTitle>
          <CardDescription>
            Students awaiting KYC verification and profile review
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingVerifications.length === 0 ? (
            <div className="text-center py-8">
              <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground">
                No pending KYC verifications at the moment.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingVerifications.map((profile) => (
                <div key={profile.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {profile.user.name?.charAt(0) || profile.firstName?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <h3 className="font-medium">
                          {profile.user.name || `${profile.firstName} ${profile.lastName}` || 'Unknown User'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {profile.user.email}
                          </span>
                          {profile.usn && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {profile.usn}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(profile.user.createdAt), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(profile.kycStatus)}>
                        {profile.kycStatus.replace('_', ' ')}
                      </Badge>

                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedProfile(profile)}>
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Profile Review</DialogTitle>
                              <DialogDescription>
                                Review student profile and documents for KYC verification
                              </DialogDescription>
                            </DialogHeader>

                            {selectedProfile && (
                              <div className="space-y-6">
                                {/* Basic Information */}
                                <div>
                                  <h4 className="font-medium mb-3">Basic Information</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Name:</span>
                                      <p>{selectedProfile.user.name || `${selectedProfile.firstName} ${selectedProfile.lastName}`}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Email:</span>
                                      <p>{selectedProfile.user.email}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">USN:</span>
                                      <p>{selectedProfile.usn || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Branch:</span>
                                      <p>{selectedProfile.branch || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Batch:</span>
                                      <p>{selectedProfile.batch || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Profile Completion:</span>
                                      <p>{selectedProfile.isComplete ? 'Complete' : `Step ${selectedProfile.completionStep}/7`}</p>
                                    </div>
                                  </div>
                                </div>

                                <Separator />

                                {/* Verification Notes */}
                                <div>
                                  <h4 className="font-medium mb-3">Verification Notes</h4>
                                  <Textarea
                                    placeholder="Add notes about the verification process..."
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                            )}

                            <DialogFooter>
                              <div className="flex gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="destructive" disabled={isProcessing}>
                                      <X className="w-4 h-4 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject KYC Verification</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to reject this profile? The student will be notified and can resubmit their information.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => selectedProfile && handleVerification(selectedProfile.id, 'REJECTED')}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Reject Profile
                                      </AlertDialogAction>

                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button disabled={isProcessing}>
                                      <Check className="w-4 h-4 mr-1" />
                                      Verify
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Approve KYC Verification</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to approve this profile? The student will be marked as verified and gain full access to placement features.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => selectedProfile && handleVerification(selectedProfile.id, 'VERIFIED')}
                                      >
                                        Verify Profile
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
