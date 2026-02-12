"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, ScanLine } from "lucide-react"
import { toast } from "sonner"

interface QRScannerProps {
    onScan: (data: string) => void
    isProcessing?: boolean
}

export function QRScanner({ onScan, isProcessing = false }: QRScannerProps) {
    const [isActive, setIsActive] = useState(false)
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null)
    const scannerContainerRef = useRef<HTMLDivElement>(null)
    const html5QrCodeRef = useRef<any>(null)
    const lastScannedRef = useRef<string>("")
    const cooldownRef = useRef<boolean>(false)

    // Manual input for testing/fallback
    const [manualInput, setManualInput] = useState("")

    const startScanner = async () => {
        if (!scannerContainerRef.current) return

        try {
            // Dynamically import html5-qrcode to avoid SSR issues
            const { Html5Qrcode } = await import("html5-qrcode")

            const scannerId = "qr-reader-viewport"

            // Make sure the container has the right ID
            if (scannerContainerRef.current) {
                scannerContainerRef.current.id = scannerId
            }

            const html5QrCode = new Html5Qrcode(scannerId)
            html5QrCodeRef.current = html5QrCode

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText: string) => {
                    // Deduplicate rapid scans (cooldown for 3s)
                    if (cooldownRef.current || decodedText === lastScannedRef.current) return
                    lastScannedRef.current = decodedText
                    cooldownRef.current = true
                    setTimeout(() => {
                        cooldownRef.current = false
                        lastScannedRef.current = ""
                    }, 3000)

                    onScan(decodedText)
                },
                () => {
                    // QR not found in frame — ignore
                }
            )

            setIsActive(true)
            setHasCameraPermission(true)
        } catch (error: any) {
            console.error("QR Scanner error:", error)
            setHasCameraPermission(false)
            toast.error(
                error?.message?.includes("Permission")
                    ? "Camera permission denied. Allow camera access in browser settings."
                    : "Could not start QR scanner. Make sure your camera is available."
            )
        }
    }

    const stopScanner = async () => {
        try {
            if (html5QrCodeRef.current) {
                await html5QrCodeRef.current.stop()
                html5QrCodeRef.current.clear()
                html5QrCodeRef.current = null
            }
        } catch (error) {
            // Ignore cleanup errors
        }
        setIsActive(false)
    }

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            onScan(manualInput.trim())
            setManualInput("")
        }
    }

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(() => { })
            }
        }
    }, [])

    return (
        <div className="space-y-4">
            {/* Scanner viewport */}
            <div className="relative rounded-xl overflow-hidden bg-black/95 border border-white/10">
                {isActive ? (
                    <div className="relative">
                        <div
                            ref={scannerContainerRef}
                            id="qr-reader-viewport"
                            className="w-full [&_video]:!rounded-xl"
                        />
                        {isProcessing && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-10 gap-3">
                                <div className="animate-spin rounded-full h-10 w-10 border-3 border-white/30 border-t-white" />
                                <span className="text-white text-sm font-medium">Processing scan...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="aspect-square max-h-[400px] w-full flex flex-col items-center justify-center text-gray-400 gap-4 p-8">
                        <div className="relative">
                            <div className="w-24 h-24 border-2 border-dashed border-gray-600 rounded-2xl flex items-center justify-center">
                                <ScanLine className="w-10 h-10 text-gray-500" />
                            </div>
                            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="font-medium text-gray-300">Camera is off</p>
                            <p className="text-sm text-gray-500">Click &ldquo;Start Camera&rdquo; to begin scanning</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Camera toggle buttons */}
            <div className="flex gap-2">
                {isActive ? (
                    <Button
                        onClick={stopScanner}
                        variant="destructive"
                        className="flex-1 h-12 text-base font-medium"
                    >
                        <CameraOff className="w-5 h-5 mr-2" />
                        Stop Camera
                    </Button>
                ) : (
                    <Button
                        onClick={startScanner}
                        className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                    >
                        <Camera className="w-5 h-5 mr-2" />
                        Start Camera
                    </Button>
                )}
            </div>

            {/* Manual Input (fallback for testing) */}
            <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-2 font-medium">
                    Manual Entry (paste QR data):
                </p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                        placeholder="Paste QR token..."
                        value={manualInput}
                        onChange={(e) => setManualInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                    />
                    <Button
                        onClick={handleManualSubmit}
                        disabled={isProcessing || !manualInput.trim()}
                        variant="secondary"
                    >
                        Submit
                    </Button>
                </div>
            </div>
        </div>
    )
}
