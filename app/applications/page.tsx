"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
    MapPin,
    Building2,
    Clock,
    Briefcase,
    CheckCircle,
    FileText,
    QrCode,
    ExternalLink,
    IndianRupee,
    XCircle,
    AlertCircle,
    Loader2,
    RefreshCw,
    ShieldCheck,
    Timer,
    ChevronDown,
    ChevronUp,
} from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"
import QRCode from "qrcode"

interface Application {
    id: string
    appliedAt: string
    resumeUsed?: string
    job: {
        id: string
        title: string
        companyName: string
        location: string
        jobType: string
        workMode: string
        salary: number
        tier: string
        category: string
        isDreamOffer: boolean
        deadline?: string
    }
    attendance?: {
        scannedAt?: string
    }
}

interface RoundStatus {
    roundId: string
    roundName: string
    roundOrder: number
    status: string
    qrToken: string | null
    attendance: {
        markedAt: string
        result: string
    } | null
}

// QR token expiry time — match server-side
const QR_REFRESH_INTERVAL_MS = 4 * 60 * 1000 // Refresh every 4 minutes (tokens expire at 5 min)

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<Application[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [roundStatuses, setRoundStatuses] = useState<Record<string, RoundStatus[]>>({})
    const [qrCodes, setQrCodes] = useState<Record<string, string>>({})
    const [loadingRounds, setLoadingRounds] = useState<Record<string, boolean>>({})
    const [expandedApp, setExpandedApp] = useState<string | null>(null)
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)
    const [refreshCountdown, setRefreshCountdown] = useState<number>(0)

    const fetchApplications = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: "10",
            })

            const response = await fetch(`/api/applications?${params}`)
            if (response.ok) {
                const data = await response.json()
                setApplications(data.applications)
                setTotalPages(data.pagination?.pages || 1)
            }
        } catch (error) {
            console.error("Error fetching applications:", error)
            toast.error("Failed to load applications")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [page])

    const generateQrCodesForRounds = useCallback(async (jobId: string, rounds: RoundStatus[]) => {
        const newQrCodes: Record<string, string> = {}
        for (const round of rounds) {
            if (round.qrToken) {
                try {
                    newQrCodes[`${jobId}_${round.roundId}`] = await QRCode.toDataURL(round.qrToken, {
                        width: 280,
                        margin: 2,
                        color: {
                            dark: "#000000",
                            light: "#ffffff",
                        },
                    })
                } catch (e) {
                    console.error("QR generation error:", e)
                }
            }
        }
        setQrCodes(prev => ({ ...prev, ...newQrCodes }))
    }, [])

    const fetchRoundStatuses = useCallback(async (jobId: string, showLoading = true) => {
        if (showLoading) setLoadingRounds(prev => ({ ...prev, [jobId]: true }))
        try {
            const response = await fetch(`/api/attendance/qr?jobId=${jobId}`)
            if (response.ok) {
                const data = await response.json()
                const rounds = data.rounds || []
                setRoundStatuses(prev => ({ ...prev, [jobId]: rounds }))
                await generateQrCodesForRounds(jobId, rounds)
            }
        } catch (error) {
            console.error("Error fetching round statuses:", error)
        } finally {
            if (showLoading) setLoadingRounds(prev => ({ ...prev, [jobId]: false }))
        }
    }, [generateQrCodesForRounds])

    // Auto-refresh QR tokens for the expanded app
    useEffect(() => {
        if (!expandedApp) {
            if (refreshTimerRef.current) clearInterval(refreshTimerRef.current)
            return
        }

        const app = applications.find(a => a.id === expandedApp)
        if (!app) return

        const jobId = app.job.id
        const hasActiveRound = roundStatuses[jobId]?.some(r => r.status === "ACTIVE" && r.qrToken)

        if (!hasActiveRound) return

        // Set up countdown + refresh
        let secondsLeft = Math.floor(QR_REFRESH_INTERVAL_MS / 1000)
        setRefreshCountdown(secondsLeft)

        const countdownInterval = setInterval(() => {
            secondsLeft--
            setRefreshCountdown(secondsLeft)
            if (secondsLeft <= 0) {
                fetchRoundStatuses(jobId, false)
                secondsLeft = Math.floor(QR_REFRESH_INTERVAL_MS / 1000)
                setRefreshCountdown(secondsLeft)
            }
        }, 1000)

        refreshTimerRef.current = countdownInterval

        return () => {
            clearInterval(countdownInterval)
        }
    }, [expandedApp, roundStatuses, applications, fetchRoundStatuses])

    const toggleExpand = (appId: string, jobId: string) => {
        if (expandedApp === appId) {
            setExpandedApp(null)
        } else {
            setExpandedApp(appId)
            if (!roundStatuses[jobId]) {
                fetchRoundStatuses(jobId)
            }
        }
    }

    const getTierBadge = (tier: string, isDreamOffer: boolean) => {
        if (isDreamOffer) {
            return (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 shadow-sm shadow-pink-500/25">
                    ★ Dream Offer
                </Badge>
            )
        }
        const config: Record<string, { className: string; label: string }> = {
            "TIER_1": { className: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0 shadow-sm", label: "Tier 1" },
            "TIER_2": { className: "bg-gradient-to-r from-slate-400 to-gray-500 text-white border-0", label: "Tier 2" },
            "TIER_3": { className: "bg-muted text-muted-foreground", label: "Tier 3" },
        }
        const c = config[tier] || { className: "", label: tier.replace("_", " ") }
        return <Badge className={c.className}>{c.label}</Badge>
    }

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            "TRAINING_INTERNSHIP": "Training + Internship",
            "INTERNSHIP": "Internship",
            "FTE": "Full Time",
        }
        return labels[category] || category
    }

    const getRoundStatusIcon = (status: string) => {
        if (status.startsWith("ATTENDED_PASSED")) {
            return <CheckCircle className="w-5 h-5 text-emerald-500" />
        }
        if (status.startsWith("ATTENDED_FAILED")) {
            return <XCircle className="w-5 h-5 text-red-500" />
        }
        if (status.startsWith("ATTENDED")) {
            return <CheckCircle className="w-5 h-5 text-blue-500" />
        }
        if (status === "ACTIVE") {
            return (
                <div className="relative">
                    <QrCode className="w-5 h-5 text-emerald-500" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full" />
                </div>
            )
        }
        if (status === "TEMP_CLOSED") {
            return <AlertCircle className="w-5 h-5 text-amber-500" />
        }
        if (status === "PERM_CLOSED") {
            return <XCircle className="w-5 h-5 text-red-400" />
        }
        if (status === "NOT_ELIGIBLE") {
            return <XCircle className="w-5 h-5 text-gray-400" />
        }
        return <Clock className="w-5 h-5 text-gray-400" />
    }

    const getRoundStatusLabel = (status: string, attendance?: RoundStatus["attendance"]) => {
        if (status === "ATTENDED_PASSED") {
            return (
                <span className="text-emerald-600 font-medium">
                    ✓ Passed {attendance?.markedAt && `— ${format(new Date(attendance.markedAt), "HH:mm")}`}
                </span>
            )
        }
        if (status === "ATTENDED_FAILED") {
            return <span className="text-red-600 font-medium">✕ Failed</span>
        }
        if (status === "ATTENDED_ATTENDED") {
            return (
                <span className="text-blue-600 font-medium">
                    ✓ Attended {attendance?.markedAt && `— ${format(new Date(attendance.markedAt), "HH:mm")}`}
                </span>
            )
        }
        if (status === "ACTIVE") return <span className="text-emerald-600 font-medium animate-pulse">QR Available — Show to Volunteer!</span>
        if (status === "TEMP_CLOSED") return <span className="text-amber-600">Session temporarily closed</span>
        if (status === "PERM_CLOSED") return <span className="text-red-500">Round finished</span>
        if (status === "NOT_ELIGIBLE") return <span className="text-gray-500">Not eligible for this round</span>
        return <span className="text-gray-500">Not started yet</span>
    }

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-5xl">
            <div>
                <h1 className="text-3xl font-bold">My Applications</h1>
                <p className="text-muted-foreground mt-2">
                    Jobs you have applied to &amp; attendance tracking
                </p>
            </div>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Briefcase className="w-7 h-7 text-primary" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold">{applications.length}</p>
                                <p className="text-sm text-muted-foreground">Total Applications</p>
                            </div>
                        </div>
                        <Link href="/jobs">
                            <Button className="shadow-sm">Browse More Jobs</Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Applications List */}
            {isLoading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                                <div className="h-4 bg-muted rounded w-1/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : applications.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center space-y-4">
                        <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/50" />
                        <h3 className="text-xl font-semibold">No applications yet</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Start exploring job opportunities and apply to positions that match your profile.
                        </p>
                        <Link href="/jobs">
                            <Button size="lg" className="mt-2">Browse Jobs</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const isExpanded = expandedApp === app.id
                        const jobRounds = roundStatuses[app.job.id]
                        const isLoadingRounds = loadingRounds[app.job.id]
                        // Find active round with QR token
                        const activeRound = jobRounds?.find(r => r.status === "ACTIVE" && r.qrToken)
                        const qrKey = activeRound ? `${app.job.id}_${activeRound.roundId}` : null

                        return (
                            <Card key={app.id} className={`transition-all duration-300 ${isExpanded ? "border-primary/40 shadow-lg shadow-primary/5" : "hover:shadow-md"}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-4">
                                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 border border-primary/10">
                                                    <Building2 className="w-7 h-7 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h3 className="text-lg font-bold">{app.job.title}</h3>
                                                        {getTierBadge(app.job.tier, app.job.isDreamOffer)}
                                                        <Badge variant="outline" className="text-xs">{getCategoryLabel(app.job.category)}</Badge>
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">{app.job.companyName}</p>

                                                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {app.job.location}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-3.5 h-3.5" />
                                                            {app.job.salary} LPA
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            Applied {format(new Date(app.appliedAt), 'MMM dd, yyyy')}
                                                        </span>
                                                    </div>

                                                    {app.attendance?.scannedAt && (
                                                        <div className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full">
                                                            <CheckCircle className="w-4 h-4" />
                                                            Attendance: {format(new Date(app.attendance.scannedAt), 'MMM dd, yyyy HH:mm')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 items-center md:items-end">
                                            {/* Show QR preview if active round exists */}
                                            {qrKey && qrCodes[qrKey] && (
                                                <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border-2 border-emerald-300 shadow-sm shadow-emerald-500/10">
                                                    <img
                                                        src={qrCodes[qrKey]}
                                                        alt="Attendance QR Code"
                                                        className="w-28 h-28"
                                                    />
                                                    <p className="text-xs text-emerald-600 text-center max-w-[130px] font-semibold">
                                                        {activeRound?.roundName}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-2 w-full max-w-[200px]">
                                                <Button
                                                    variant={isExpanded ? "default" : "outline"}
                                                    size="sm"
                                                    className="w-full"
                                                    onClick={() => toggleExpand(app.id, app.job.id)}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                    )}
                                                    {isExpanded ? "Hide Rounds" : "View Rounds & QR"}
                                                </Button>

                                                <Link href={`/jobs/${app.job.id}`}>
                                                    <Button variant="outline" size="sm" className="w-full">
                                                        <ExternalLink className="w-4 h-4 mr-1" />
                                                        View Job
                                                    </Button>
                                                </Link>

                                                {app.resumeUsed && (
                                                    <a href={app.resumeUsed} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="w-full">
                                                            <FileText className="w-4 h-4 mr-1" />
                                                            Resume
                                                        </Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded: Round Statuses */}
                                    {isExpanded && (
                                        <div className="mt-6 pt-5 border-t">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Round Status — {app.job.companyName}
                                                </h4>
                                                {activeRound && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Timer className="w-3.5 h-3.5" />
                                                        Auto-refresh in {Math.floor(refreshCountdown / 60)}:{(refreshCountdown % 60).toString().padStart(2, "0")}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 w-7 p-0"
                                                            onClick={() => fetchRoundStatuses(app.job.id, false)}
                                                        >
                                                            <RefreshCw className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {isLoadingRounds ? (
                                                <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Loading rounds...
                                                </div>
                                            ) : !jobRounds || jobRounds.length === 0 ? (
                                                <div className="text-center py-6 text-muted-foreground space-y-2">
                                                    <Clock className="w-10 h-10 mx-auto text-muted-foreground/50" />
                                                    <p className="text-sm">No rounds configured for this drive yet.</p>
                                                    <p className="text-xs">Check back later when the admin sets up the rounds.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {jobRounds.map((round) => {
                                                        const roundQrKey = `${app.job.id}_${round.roundId}`
                                                        const isActiveRound = round.status === "ACTIVE"

                                                        return (
                                                            <div
                                                                key={round.roundId}
                                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${isActiveRound
                                                                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-300 shadow-sm shadow-emerald-500/10"
                                                                        : round.status.startsWith("ATTENDED_PASSED")
                                                                            ? "bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50"
                                                                            : round.status.startsWith("ATTENDED_FAILED")
                                                                                ? "bg-red-50/50 dark:bg-red-950/10 border-red-200/50"
                                                                                : "bg-muted/30 border-border/60"
                                                                    }`}
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-bold shrink-0 border border-primary/10">
                                                                    {round.roundOrder}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        {getRoundStatusIcon(round.status)}
                                                                        <span className="font-semibold">{round.roundName}</span>
                                                                    </div>
                                                                    <p className="text-sm mt-1 ml-7">
                                                                        {getRoundStatusLabel(round.status, round.attendance)}
                                                                    </p>
                                                                </div>
                                                                {isActiveRound && qrCodes[roundQrKey] && (
                                                                    <div className="flex flex-col items-center gap-1 shrink-0 p-2 bg-white rounded-xl border shadow-sm">
                                                                        <img
                                                                            src={qrCodes[roundQrKey]}
                                                                            alt={`${round.roundName} QR`}
                                                                            className="w-28 h-28"
                                                                        />
                                                                        <p className="text-[10px] text-emerald-600 font-semibold">SHOW TO VOLUNTEER</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    )
}
