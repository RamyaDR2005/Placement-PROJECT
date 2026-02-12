"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { QRScanner } from "@/components/admin/qr-scanner"
import {
    CheckCircle,
    XCircle,
    User,
    Building2,
    Clock,
    AlertCircle,
    GraduationCap,
    FileText,
    ShieldCheck,
    ArrowLeft,
    History,
    ScanLine,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import Link from "next/link"

interface ScanResult {
    success: boolean
    message: string
    requireConfirmation?: boolean
    alreadyAttended?: boolean
    student?: {
        name: string
        email: string
        usn?: string
        branch?: string
        photo?: string
        cgpa?: number
        resume?: string
    }
    round?: {
        id: string
        name: string
        order: number
    }
    job?: {
        title: string
        company: string
    }
    tokenData?: {
        userId: string
        jobId: string
        roundId: string
        sessionId: string
    }
    scannedAt?: string
    markedAt?: string
}

interface Job {
    id: string
    title: string
    companyName: string
}

export default function AttendanceScanPage() {
    const [selectedJob, setSelectedJob] = useState<string>("ALL")
    const [jobs, setJobs] = useState<Job[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isConfirming, setIsConfirming] = useState(false)
    const [lastScan, setLastScan] = useState<ScanResult | null>(null)
    const [scanHistory, setScanHistory] = useState<ScanResult[]>([])

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/admin/jobs?status=ACTIVE&limit=100')
                if (response.ok) {
                    const data = await response.json()
                    setJobs(data.jobs)
                }
            } catch (error) {
                console.error("Error fetching jobs:", error)
            }
        }
        fetchJobs()
    }, [])

    const handleScan = async (qrData: string) => {
        setIsProcessing(true)
        try {
            const response = await fetch('/api/attendance/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    qrData,
                    jobId: selectedJob !== "ALL" ? selectedJob : undefined
                }),
            })

            const data = await response.json()

            if (response.ok) {
                setLastScan(data)
                if (!data.requireConfirmation) {
                    setScanHistory(prev => [data, ...prev.slice(0, 19)])
                }
                toast.success(data.message)
            } else if (response.status === 409) {
                setLastScan(data)
                toast.warning(data.message)
            } else {
                toast.error(data.error || "Failed to record attendance")
                setLastScan({ success: false, message: data.error || "Error" })
            }
        } catch (error) {
            console.error("Error scanning:", error)
            toast.error("An unexpected error occurred")
            setLastScan({ success: false, message: "Error occurred" })
        } finally {
            setIsProcessing(false)
        }
    }

    const handleConfirmAttendance = async () => {
        if (!lastScan?.tokenData) return

        setIsConfirming(true)
        try {
            const response = await fetch('/api/attendance/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lastScan.tokenData),
            })

            const data = await response.json()

            if (response.ok) {
                toast.success(data.message || "Attendance confirmed!")
                const confirmedResult: ScanResult = {
                    ...lastScan,
                    success: true,
                    message: "Attendance confirmed",
                    requireConfirmation: false,
                    markedAt: new Date().toISOString(),
                }
                setScanHistory(prev => [confirmedResult, ...prev.slice(0, 19)])
                setLastScan(confirmedResult)
            } else {
                toast.error(data.error || "Failed to confirm attendance")
            }
        } catch (error) {
            toast.error("Failed to confirm attendance")
        } finally {
            setIsConfirming(false)
        }
    }

    const getScanStatusColor = (scan: ScanResult) => {
        if (scan.requireConfirmation) return "border-blue-500/60 bg-blue-50 dark:bg-blue-950/30"
        if (scan.success) return "border-emerald-500/60 bg-emerald-50 dark:bg-emerald-950/30"
        if (scan.alreadyAttended) return "border-amber-500/60 bg-amber-50 dark:bg-amber-950/30"
        return "border-red-500/60 bg-red-50 dark:bg-red-950/30"
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex h-16 shrink-0 items-center gap-2 px-4 border-b">
                <Link href="/admin/attendance">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                        <ScanLine className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Attendance Scanner</h1>
                        <p className="text-sm text-muted-foreground">Scan student QR codes to mark attendance</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-7xl px-4 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Panel: Scanner */}
                    <div className="space-y-6">
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <ScanLine className="w-5 h-5" />
                                    QR Code Scanner
                                </CardTitle>
                                <CardDescription>
                                    Point the camera at a student&apos;s QR code
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Filter by Job</label>
                                    <Select value={selectedJob} onValueChange={setSelectedJob}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All Jobs" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All Jobs</SelectItem>
                                            {jobs.map(job => (
                                                <SelectItem key={job.id} value={job.id}>
                                                    {job.title} — {job.companyName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <QRScanner onScan={handleScan} isProcessing={isProcessing} />
                            </CardContent>
                        </Card>

                        {/* Scan Verification Card */}
                        {lastScan && (
                            <Card className={`border-2 transition-all duration-300 ${getScanStatusColor(lastScan)}`}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {lastScan.requireConfirmation ? (
                                            <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
                                        ) : lastScan.success ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                                        ) : lastScan.alreadyAttended ? (
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        )}
                                        {lastScan.message}
                                    </CardTitle>
                                </CardHeader>
                                {lastScan.student && (
                                    <CardContent className="space-y-4 pt-2">
                                        {/* Student Photo & Info */}
                                        <div className="flex gap-4 p-3 bg-background/80 rounded-xl border">
                                            {lastScan.student.photo ? (
                                                <img
                                                    src={lastScan.student.photo}
                                                    alt="Student Photo"
                                                    className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center border-2 border-dashed border-gray-300">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-lg leading-tight">{lastScan.student.name}</span>
                                                </div>
                                                {lastScan.student.usn && (
                                                    <p className="text-sm text-muted-foreground">
                                                        USN: <span className="font-mono font-semibold text-foreground">{lastScan.student.usn}</span>
                                                    </p>
                                                )}
                                                {lastScan.student.branch && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Branch: <span className="font-semibold text-foreground">{lastScan.student.branch}</span>
                                                    </p>
                                                )}
                                                {lastScan.student.cgpa !== undefined && (
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <GraduationCap className="w-3.5 h-3.5" />
                                                        CGPA: <span className="font-semibold text-foreground">{lastScan.student.cgpa?.toFixed(2)}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Round & Job Info */}
                                        <div className="flex flex-wrap gap-2">
                                            {lastScan.round && (
                                                <Badge variant="secondary" className="text-sm py-1 px-3">
                                                    Round {lastScan.round.order}: {lastScan.round.name}
                                                </Badge>
                                            )}
                                            {lastScan.job && (
                                                <Badge variant="outline" className="text-sm py-1 px-3">
                                                    <Building2 className="w-3 h-3 mr-1" />
                                                    {lastScan.job.company}
                                                </Badge>
                                            )}
                                        </div>

                                        {lastScan.student.resume && (
                                            <a href={lastScan.student.resume} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <FileText className="w-4 h-4 mr-2" />
                                                    View Resume
                                                </Button>
                                            </a>
                                        )}

                                        {(lastScan.scannedAt || lastScan.markedAt) && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="w-4 h-4" />
                                                {format(new Date(lastScan.scannedAt || lastScan.markedAt!), 'MMM dd, yyyy HH:mm:ss')}
                                            </div>
                                        )}

                                        {/* Confirmation Button */}
                                        {lastScan.requireConfirmation && (
                                            <Button
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg py-6 shadow-lg shadow-emerald-500/25 transition-all"
                                                onClick={handleConfirmAttendance}
                                                disabled={isConfirming}
                                            >
                                                {isConfirming ? (
                                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-2" />
                                                ) : (
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                )}
                                                MARK ATTENDED
                                            </Button>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        )}
                    </div>

                    {/* Right Panel: Scan History */}
                    <Card className="h-fit">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <History className="w-5 h-5" />
                                Recent Scans
                            </CardTitle>
                            <CardDescription>
                                Last {scanHistory.length} attendance records this session
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {scanHistory.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground space-y-3">
                                    <ScanLine className="w-12 h-12 mx-auto text-muted-foreground/50" />
                                    <div>
                                        <p className="font-medium">No scans yet</p>
                                        <p className="text-sm mt-1">Start scanning to see history</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                                    {scanHistory.map((scan, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border transition-all ${scan.success
                                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/60'
                                                    : scan.alreadyAttended
                                                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200/60'
                                                        : 'bg-red-50 dark:bg-red-950/20 border-red-200/60'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {scan.success ? (
                                                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    ) : scan.alreadyAttended ? (
                                                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                                                    )}
                                                    <div>
                                                        <span className="font-medium text-sm">{scan.student?.name || "Unknown"}</span>
                                                        {scan.student?.usn && (
                                                            <p className="text-xs text-muted-foreground font-mono">{scan.student.usn}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    {scan.round && (
                                                        <Badge variant="outline" className="text-xs">
                                                            R{scan.round.order}: {scan.round.name}
                                                        </Badge>
                                                    )}
                                                    {scan.markedAt && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {format(new Date(scan.markedAt), "HH:mm:ss")}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
