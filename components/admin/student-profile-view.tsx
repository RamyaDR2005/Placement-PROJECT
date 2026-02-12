"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    ArrowLeft,
    Check,
    X,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Building,
    Calendar,
    FileText,
    ExternalLink,
    Shield,
    BookOpen,
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"

interface Profile {
    id: string
    firstName: string | null
    middleName: string | null
    lastName: string | null
    isComplete: boolean
    completionStep: number
    kycStatus: string
    usn: string | null
    branch: string | null
    batch: string | null
    phone: string | null
    callingMobile: string | null
    whatsappMobile: string | null
    alternativeMobile: string | null
    email: string | null
    studentEmail: string | null
    dateOfBirth: Date | null
    gender: string | null
    bloodGroup: string | null
    nationality: string | null
    category: string | null
    state: string | null
    profilePhoto: string | null
    fatherName: string | null
    fatherMobile: string | null
    fatherEmail: string | null
    fatherOccupation: string | null
    motherName: string | null
    motherMobile: string | null
    motherEmail: string | null
    motherOccupation: string | null
    currentAddress: string | null
    currentCity: string | null
    currentState: string | null
    currentPincode: string | null
    permanentAddress: string | null
    permanentCity: string | null
    permanentState: string | null
    permanentPincode: string | null
    collegeName: string | null
    entryType: string | null
    seatCategory: string | null
    libraryId: string | null
    residencyStatus: string | null
    hostelName: string | null
    hostelRoom: string | null
    tenthSchool: string | null
    tenthBoard: string | null
    tenthPercentage: number | null
    tenthPassingYear: number | null
    twelfthSchoolName: string | null
    twelfthBoard: string | null
    twelfthPercentage: number | null
    twelfthPassingYear: number | null
    diplomaCollegeName: string | null
    diplomaPercentage: number | null
    finalCgpa: number | null
    cgpa: number | null
    hasBacklogs: string | null
    linkedin: string | null
    linkedinLink: string | null
    github: string | null
    githubLink: string | null
    leetcode: string | null
    leetcodeLink: string | null
    portfolio: string | null
    resume: string | null
    resumeUpload: string | null
    collegeIdCard: string | null
    verifiedBy: string | null
    verifiedAt: Date | null
    remarks: string | null
    createdAt: Date
    updatedAt: Date
    [key: string]: unknown
}

interface Student {
    id: string
    name: string | null
    email: string | null
    image: string | null
    role: string
    createdAt: Date
    profile: Profile | null
}

interface StudentProfileViewProps {
    student: Student
    adminId: string
}

export function StudentProfileView({ student, adminId }: StudentProfileViewProps) {
    const router = useRouter()
    const [isVerifying, setIsVerifying] = useState(false)
    const [remarks, setRemarks] = useState("")
    const profile = student.profile

    const handleVerification = async (status: 'VERIFIED' | 'REJECTED') => {
        setIsVerifying(true)
        try {
            const response = await fetch(`/api/admin/kyc-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    profileId: profile?.id,
                    status,
                    notes: remarks,
                    verifiedBy: adminId,
                })
            })

            if (response.ok) {
                toast.success(`Student ${status === 'VERIFIED' ? 'verified' : 'rejected'} successfully`)
                router.refresh()
            } else {
                const data = await response.json()
                toast.error(data.error || 'Failed to update verification status')
            }
        } catch {
            toast.error('Something went wrong')
        } finally {
            setIsVerifying(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className="bg-green-100 text-green-800"><Check className="w-3 h-3 mr-1" /> Verified</Badge>
            case 'PENDING':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
            case 'REJECTED':
                return <Badge className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" /> Rejected</Badge>
            case 'UNDER_REVIEW':
                return <Badge className="bg-blue-100 text-blue-800"><Shield className="w-3 h-3 mr-1" /> Under Review</Badge>
            default:
                return <Badge variant="secondary">{status}</Badge>
        }
    }

    const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon?: React.ElementType }) => (
        <div className="flex items-start gap-3 py-2">
            {Icon && <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium break-words">{value || 'Not provided'}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            {/* Student Overview Card */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={profile?.profilePhoto || student.image || ""} />
                            <AvatarFallback className="text-2xl">
                                {student.name?.charAt(0) || profile?.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="text-2xl font-bold">
                                    {student.name || `${profile?.firstName || ''} ${profile?.middleName || ''} ${profile?.lastName || ''}`.trim() || 'Unknown User'}
                                </h2>
                                {getStatusBadge(profile?.kycStatus || 'PENDING')}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {student.email}</span>
                                {profile?.callingMobile && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {profile.callingMobile}</span>}
                                {profile?.usn && <span className="flex items-center gap-1 font-mono">{profile.usn}</span>}
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {profile?.branch && <Badge variant="outline">{profile.branch}</Badge>}
                                {profile?.batch && <Badge variant="outline">{profile.batch}</Badge>}
                                {profile?.isComplete ? (
                                    <Badge className="bg-green-100 text-green-800">Profile Complete</Badge>
                                ) : (
                                    <Badge variant="secondary">Step {profile?.completionStep || 1}/7</Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Registered: {format(new Date(student.createdAt), 'MMMM dd, yyyy')}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    if (student.email) {
                                        window.location.href = `mailto:${student.email}`
                                    }
                                }}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                            </Button>

                            {profile && profile.kycStatus !== 'VERIFIED' && (
                                <>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                                <Check className="w-4 h-4 mr-2" />
                                                Verify KYC
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Verify Student KYC</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to verify this student&apos;s KYC? This will mark their profile as verified.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <Textarea
                                                placeholder="Add remarks (optional)..."
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleVerification('VERIFIED')}
                                                    disabled={isVerifying}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    {isVerifying ? 'Verifying...' : 'Confirm Verification'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive">
                                                <X className="w-4 h-4 mr-2" />
                                                Reject KYC
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject Student KYC</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to reject this student&apos;s KYC? Please provide a reason.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <Textarea
                                                placeholder="Reason for rejection (required)..."
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                            />
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleVerification('REJECTED')}
                                                    disabled={isVerifying || !remarks.trim()}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    {isVerifying ? 'Rejecting...' : 'Confirm Rejection'}
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {!profile ? (
                <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-1">No Profile Data</h3>
                        <p>This student hasn&apos;t started filling their profile yet.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="w-5 h-5" />
                                Personal Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow label="First Name" value={profile.firstName} />
                            <InfoRow label="Middle Name" value={profile.middleName} />
                            <InfoRow label="Last Name" value={profile.lastName} />
                            <InfoRow label="Date of Birth" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'MMMM dd, yyyy') : null} icon={Calendar} />
                            <InfoRow label="Gender" value={profile.gender} />
                            <InfoRow label="Blood Group" value={profile.bloodGroup?.replace('_', ' ')} />
                            <InfoRow label="Nationality" value={profile.nationality} />
                            <InfoRow label="Category" value={profile.category || profile.casteCategory as string} />
                            <InfoRow label="State" value={profile.state || profile.stateOfDomicile as string} />
                        </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Phone className="w-5 h-5" />
                                Contact Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow label="Email" value={student.email} icon={Mail} />
                            <InfoRow label="Student Email" value={profile.studentEmail} icon={Mail} />
                            <InfoRow label="Calling Mobile" value={profile.callingMobile} icon={Phone} />
                            <InfoRow label="WhatsApp Mobile" value={profile.whatsappMobile} icon={Phone} />
                            <InfoRow label="Alternative Mobile" value={profile.alternativeMobile} icon={Phone} />
                            <Separator className="my-3" />
                            <p className="text-sm font-semibold text-muted-foreground">Father&apos;s Details</p>
                            <InfoRow label="Name" value={profile.fatherName} />
                            <InfoRow label="Mobile" value={profile.fatherMobile} />
                            <InfoRow label="Email" value={profile.fatherEmail} />
                            <InfoRow label="Occupation" value={profile.fatherOccupation} />
                            <Separator className="my-3" />
                            <p className="text-sm font-semibold text-muted-foreground">Mother&apos;s Details</p>
                            <InfoRow label="Name" value={profile.motherName} />
                            <InfoRow label="Mobile" value={profile.motherMobile} />
                            <InfoRow label="Email" value={profile.motherEmail} />
                            <InfoRow label="Occupation" value={profile.motherOccupation} />
                        </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <MapPin className="w-5 h-5" />
                                Address Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">Current Address</p>
                            <InfoRow label="Address" value={profile.currentAddress} />
                            <InfoRow label="City" value={profile.currentCity} />
                            <InfoRow label="State" value={profile.currentState} />
                            <InfoRow label="Pincode" value={profile.currentPincode} />
                            <Separator className="my-3" />
                            <p className="text-sm font-semibold text-muted-foreground">Permanent Address</p>
                            <InfoRow label="Address" value={profile.permanentAddress} />
                            <InfoRow label="City" value={profile.permanentCity} />
                            <InfoRow label="State" value={profile.permanentState} />
                            <InfoRow label="Pincode" value={profile.permanentPincode} />
                        </CardContent>
                    </Card>

                    {/* Academic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="w-5 h-5" />
                                Academic Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <p className="text-sm font-semibold text-muted-foreground">10th Standard</p>
                            <InfoRow label="School" value={profile.tenthSchool || profile.tenthSchoolName as string} />
                            <InfoRow label="Board" value={profile.tenthBoard} />
                            <InfoRow label="Percentage" value={profile.tenthPercentage ? `${profile.tenthPercentage}%` : null} />
                            <InfoRow label="Passing Year" value={profile.tenthPassingYear} />
                            <Separator className="my-3" />
                            <p className="text-sm font-semibold text-muted-foreground">12th Standard</p>
                            <InfoRow label="School" value={profile.twelfthSchoolName} />
                            <InfoRow label="Board" value={profile.twelfthBoard} />
                            <InfoRow label="Percentage" value={profile.twelfthPercentage ? `${profile.twelfthPercentage}%` : null} />
                            <InfoRow label="Passing Year" value={profile.twelfthPassingYear} />
                            {profile.diplomaCollegeName && (
                                <>
                                    <Separator className="my-3" />
                                    <p className="text-sm font-semibold text-muted-foreground">Diploma</p>
                                    <InfoRow label="College" value={profile.diplomaCollegeName} />
                                    <InfoRow label="Percentage" value={profile.diplomaPercentage ? `${profile.diplomaPercentage}%` : null} />
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Engineering Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Building className="w-5 h-5" />
                                Engineering Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            <InfoRow label="College" value={profile.collegeName} icon={GraduationCap} />
                            <InfoRow label="Branch" value={profile.branch} />
                            <InfoRow label="USN" value={profile.usn} />
                            <InfoRow label="Library ID" value={profile.libraryId} />
                            <InfoRow label="Entry Type" value={profile.entryType} />
                            <InfoRow label="Seat Category" value={profile.seatCategory} />
                            <InfoRow label="Batch" value={profile.batch} />
                            <InfoRow label="Residency" value={profile.residencyStatus} />
                            {profile.residencyStatus === 'HOSTELITE' && (
                                <>
                                    <InfoRow label="Hostel Name" value={profile.hostelName} />
                                    <InfoRow label="Room" value={profile.hostelRoom || profile.roomNumber as string} />
                                </>
                            )}
                            <Separator className="my-3" />
                            <InfoRow label="CGPA" value={profile.finalCgpa || profile.cgpa} />
                            <InfoRow label="Backlogs" value={profile.hasBacklogs} />
                        </CardContent>
                    </Card>

                    {/* Links & Documents */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <FileText className="w-5 h-5" />
                                Links & Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(profile.linkedinLink || profile.linkedin) && (
                                <a href={profile.linkedinLink || profile.linkedin || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                            {(profile.githubLink || profile.github) && (
                                <a href={profile.githubLink || profile.github || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" /> GitHub
                                </a>
                            )}
                            {(profile.leetcodeLink || profile.leetcode) && (
                                <a href={profile.leetcodeLink || profile.leetcode || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" /> LeetCode
                                </a>
                            )}
                            {profile.portfolio && (
                                <a href={profile.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <ExternalLink className="w-4 h-4" /> Portfolio
                                </a>
                            )}
                            <Separator className="my-3" />
                            {(profile.resumeUpload || profile.resume) && (
                                <a href={profile.resumeUpload || profile.resume || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <FileText className="w-4 h-4" /> Resume
                                </a>
                            )}
                            {profile.collegeIdCard && (
                                <a href={profile.collegeIdCard} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                                    <FileText className="w-4 h-4" /> College ID Card
                                </a>
                            )}
                            {profile.remarks && (
                                <>
                                    <Separator className="my-3" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Admin Remarks</p>
                                        <p className="text-sm font-medium mt-1">{profile.remarks}</p>
                                    </div>
                                </>
                            )}
                            {profile.verifiedAt && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Verified On</p>
                                    <p className="text-sm font-medium mt-1">{format(new Date(profile.verifiedAt), 'MMMM dd, yyyy hh:mm a')}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
