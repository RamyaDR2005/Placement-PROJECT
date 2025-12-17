"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  IconUser,
  IconUsers,
  IconMapPin,
  IconSchool,
  IconFileCheck,
  IconBriefcase,
  IconCircleCheck,
  IconCircle,
  IconArrowRight,
  IconArrowLeft
} from "@tabler/icons-react"
import { useProfileForm } from "@/hooks/use-profile-form"
import { SaveStatusIndicator } from "@/components/save-status-indicator"
import { PageLoading } from "@/components/ui/loading"

// Import step components from v0
import { PersonalInfoStep } from "./steps/personal-info-step"
import { ContactDetailsStep } from "./steps/contact-details-step"
import { AcademicDetailsStep } from "./steps/academic-details-step"
import { EngineeringDetailsStep } from "./steps/engineering-details-step"
import { ReviewStep } from "./steps/review-step"

// Import types
import {
  PersonalInfo,
  ContactAndParentDetails,
  AddressDetails,
  TenthStandardDetails,
  TwelfthDiplomaDetails,
  EngineeringDetails,
  EngineeringAcademicDetails
} from "@/types/profile"

interface ProfileStep {
  id: number
  title: string
  description: string
  isComplete: boolean
}

const PROFILE_STEPS: ProfileStep[] = [
  {
    id: 1,
    title: "Personal Information",
    description: "Your name, date of birth, gender, blood group, state, nationality, and caste category as per official records.",
    isComplete: false
  },
  {
    id: 2,
    title: "Contact & Address Details",
    description: "Student email, mobile numbers, parent/guardian details, and address information.",
    isComplete: false
  },
  {
    id: 3,
    title: "Academic Details",
    description: "10th standard, 12th/Diploma details, marks, and document uploads.",
    isComplete: false
  },
  {
    id: 4,
    title: "Engineering Details",
    description: "Branch, entry type, USN, residency, mentor, profiles, and semester-wise academic performance.",
    isComplete: false
  },
  {
    id: 5,
    title: "Review & Submit",
    description: "Review all your information and submit for KYC verification.",
    isComplete: false
  }
]

type ProfileData = {
  personalInfo?: Partial<PersonalInfo>
  contactDetails?: Partial<ContactAndParentDetails>
  addressDetails?: Partial<AddressDetails>
  tenthDetails?: Partial<TenthStandardDetails>
  twelfthDiplomaDetails?: Partial<TwelfthDiplomaDetails>
  engineeringDetails?: Partial<EngineeringDetails>
  engineeringAcademicDetails?: Partial<EngineeringAcademicDetails>
  completionStep?: number
  isComplete?: boolean
}

export function ProfileCompletion() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Initialize currentStep from sessionStorage or default to 1
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('profile-current-step')
      return savedStep ? parseInt(savedStep, 10) : 1
    }
    return 1
  })

  const [steps, setSteps] = useState<ProfileStep[]>(PROFILE_STEPS)
  const [profile, setProfile] = useState<ProfileData>({})
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [initialDataLoaded, setInitialDataLoaded] = useState(false)

  // Save current step to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('profile-current-step', currentStep.toString())
    }
  }, [currentStep])

  // Use the production-ready form hook
  const {
    formData,
    updateFields,
    saveManually,
    saveOnBlur,
    saveState,
    isDirty,
    setFormData
  } = useProfileForm({
    initialData: profile,
    onSaveSuccess: (data) => {
      console.log("Profile saved successfully:", data)
      // Update local profile state
      if (data.profile) {
        setProfile(prev => ({ ...prev, ...data.profile }))
      }
    },
    onSaveError: (error) => {
      console.error("Profile save error:", error)
    },
    autoSaveDelay: 2000, // 2 seconds debounce
    enableLocalStorage: true,
    storageKey: `profile-form-step-${currentStep}`
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (session?.user && !initialDataLoaded) {
      fetchUserProfile()
    }
  }, [session, status, router, initialDataLoaded])

  // Sync formData with profile when profile is loaded
  useEffect(() => {
    if (initialDataLoaded && profile && Object.keys(profile).length > 0) {
      setFormData(profile)
    }
  }, [initialDataLoaded, profile, setFormData])

  const fetchUserProfile = async () => {
    setIsInitialLoading(true)
    try {
      const response = await fetch("/api/profile")
      if (response.ok) {
        const data = await response.json()
        if (data.profile) {

          // Structure the flat profile data into comprehensive sections
          const structuredProfile: ProfileData = {
            personalInfo: {
              firstName: data.profile.firstName,
              middleName: data.profile.middleName,
              lastName: data.profile.lastName,
              dateOfBirth: data.profile.dateOfBirth ? new Date(data.profile.dateOfBirth) : undefined,
              gender: data.profile.gender,
              bloodGroup: data.profile.bloodGroup,
              stateOfDomicile: data.profile.stateOfDomicile,
              nationality: data.profile.nationality,
              casteCategory: data.profile.casteCategory,
              profilePhoto: data.profile.profilePhoto
            },
            contactDetails: {
              email: data.profile.email,
              callingMobile: data.profile.callingMobile,
              whatsappMobile: data.profile.whatsappMobile,
              alternativeMobile: data.profile.alternativeMobile,
              fatherName: data.profile.fatherName,
              fatherMobile: data.profile.fatherMobile,
              fatherEmail: data.profile.fatherEmail,
              fatherOccupation: data.profile.fatherOccupation,
              fatherDeceased: data.profile.fatherDeceased,
              motherName: data.profile.motherName,
              motherMobile: data.profile.motherMobile,
              motherEmail: data.profile.motherEmail,
              motherOccupation: data.profile.motherOccupation,
              motherDeceased: data.profile.motherDeceased
            },
            addressDetails: {
              // Individual address fields
              currentHouse: data.profile.currentHouse,
              currentCross: data.profile.currentCross,
              currentArea: data.profile.currentArea,
              currentDistrict: data.profile.currentDistrict,
              currentCity: data.profile.currentCity,
              currentPincode: data.profile.currentPincode,
              currentState: data.profile.currentState,
              currentAddress: data.profile.currentAddress,
              // Permanent address fields
              permanentHouse: data.profile.permanentHouse,
              permanentCross: data.profile.permanentCross,
              permanentArea: data.profile.permanentArea,
              permanentDistrict: data.profile.permanentDistrict,
              permanentCity: data.profile.permanentCity,
              permanentPincode: data.profile.permanentPincode,
              permanentState: data.profile.permanentState,
              permanentAddress: data.profile.permanentAddress,
              sameAsCurrent: data.profile.sameAsCurrent,
              country: data.profile.country || 'INDIA'
            },
            tenthDetails: {
              tenthSchoolName: data.profile.tenthSchoolName,
              tenthAreaDistrictCity: data.profile.tenthAreaDistrictCity,
              tenthPincode: data.profile.tenthPincode,
              tenthState: data.profile.tenthState,
              tenthBoard: data.profile.tenthBoard,
              tenthPassingYear: data.profile.tenthPassingYear,
              tenthPassingMonth: data.profile.tenthPassingMonth,
              tenthPercentage: data.profile.tenthPercentage,
              tenthMarksCard: data.profile.tenthMarksCard
            },
            twelfthDiplomaDetails: {
              twelfthOrDiploma: data.profile.twelfthOrDiploma,
              // 12th details
              twelfthSchoolName: data.profile.twelfthSchoolName,
              twelfthArea: data.profile.twelfthArea,
              twelfthDistrict: data.profile.twelfthDistrict,
              twelfthCity: data.profile.twelfthCity,
              twelfthPincode: data.profile.twelfthPincode,
              twelfthState: data.profile.twelfthState,
              twelfthBoard: data.profile.twelfthBoard,
              twelfthPassingYear: data.profile.twelfthPassingYear,
              twelfthPassingMonth: data.profile.twelfthPassingMonth,
              twelfthStatePercentage: data.profile.twelfthStatePercentage,
              twelfthCbseSubjects: data.profile.twelfthCbseSubjects,
              twelfthCbseMarks: data.profile.twelfthCbseMarks,
              twelfthIcseMarks: data.profile.twelfthIcseMarks,
              twelfthMarkcard: data.profile.twelfthMarkcard,
              // Diploma details
              diplomaCollege: data.profile.diplomaCollege,
              diplomaArea: data.profile.diplomaArea,
              diplomaDistrict: data.profile.diplomaDistrict,
              diplomaCity: data.profile.diplomaCity,
              diplomaPincode: data.profile.diplomaPincode,
              diplomaState: data.profile.diplomaState,
              diplomaPercentage: data.profile.diplomaPercentage,
              diplomaCertificates: data.profile.diplomaCertificates
            },
            engineeringDetails: {
              // Read from correct Prisma schema field names
              collegeName: data.profile.collegeName,
              city: data.profile.city,
              district: data.profile.district,
              pincode: data.profile.pincode,
              branch: data.profile.branch,
              entryType: data.profile.entryType,
              seatCategory: data.profile.seatCategory,
              usn: data.profile.usn,
              libraryId: data.profile.libraryId,
              residencyStatus: data.profile.residencyStatus,
              hostelName: data.profile.hostelName,
              roomNumber: data.profile.hostelRoom,
              floorNumber: data.profile.hostelFloor,
              localCity: data.profile.localCity,
              transportMode: data.profile.transportMode,
              busRoute: data.profile.busRoute,
              branchMentorName: data.profile.branchMentor,
              linkedin: data.profile.linkedinLink,
              github: data.profile.githubLink,
              leetcode: data.profile.leetcodeLink,
              resume: data.profile.resumeUpload
            },
            engineeringAcademicDetails: {
              finalCgpa: data.profile.finalCgpa,
              activeBacklogs: data.profile.activeBacklogs,
              backlogSubjects: data.profile.backlogs,
            },
            completionStep: data.profile.completionStep,
            isComplete: data.profile.isComplete
          }

          setProfile(structuredProfile)

          // If profile is already complete, redirect to dashboard
          if (data.profile.isComplete) {
            // Clear sessionStorage
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('profile-current-step')
            }
            toast.success("Your profile is already complete!")
            router.push("/dashboard")
            return
          }

          // Restore step from database (prioritize database over sessionStorage)
          const savedStep = data.profile.completionStep || 1
          setCurrentStep(savedStep)

          // Also update sessionStorage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('profile-current-step', savedStep.toString())
          }

          // Update step completion status
          setSteps(prev => prev.map(step => ({
            ...step,
            isComplete: step.id < savedStep ||
              (step.id === 5 && data.profile.isComplete)
          })))
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    } finally {
      setIsInitialLoading(false)
      setInitialDataLoaded(true)
    }
  }

  const saveProfileStep = async (stepData: Partial<ProfileData>) => {
    const isSaving = saveState.status === "saving"
    if (isSaving) {
      toast.info("Please wait, saving in progress...")
      return false
    }

    try {
      // Flatten the step data for API compatibility
      let flattenedData: any = {
        completionStep: currentStep + 1 // Save the NEXT step number
      }

      // Map comprehensive data structure to flat API structure with correct field names
      if (stepData.personalInfo) {
        const personalInfo = stepData.personalInfo
        flattenedData = {
          ...flattenedData,
          firstName: personalInfo.firstName,
          middleName: personalInfo.middleName,
          lastName: personalInfo.lastName,
          dateOfBirth: personalInfo.dateOfBirth,
          gender: personalInfo.gender,
          bloodGroup: personalInfo.bloodGroup,
          stateOfDomicile: personalInfo.stateOfDomicile,
          nationality: personalInfo.nationality,
          casteCategory: personalInfo.casteCategory,
          profilePhoto: personalInfo.profilePhoto
        }
      }
      if (stepData.contactDetails) {
        const contactDetails = stepData.contactDetails
        flattenedData = {
          ...flattenedData,
          email: contactDetails.email,
          callingMobile: contactDetails.callingMobile,
          whatsappMobile: contactDetails.whatsappMobile,
          alternativeMobile: contactDetails.alternativeMobile,
          fatherName: contactDetails.fatherName,
          fatherMobile: contactDetails.fatherMobile,
          fatherEmail: contactDetails.fatherEmail,
          fatherOccupation: contactDetails.fatherOccupation,
          fatherDeceased: contactDetails.fatherDeceased,
          motherName: contactDetails.motherName,
          motherMobile: contactDetails.motherMobile,
          motherEmail: contactDetails.motherEmail,
          motherOccupation: contactDetails.motherOccupation,
          motherDeceased: contactDetails.motherDeceased
        }
      }
      if (stepData.addressDetails) {
        const addressDetails = stepData.addressDetails
        flattenedData = {
          ...flattenedData,
          // Individual address fields for database storage
          currentHouse: addressDetails.currentHouse,
          currentCross: addressDetails.currentCross,
          currentArea: addressDetails.currentArea,
          currentDistrict: addressDetails.currentDistrict,
          currentCity: addressDetails.currentCity,
          currentPincode: addressDetails.currentPincode,
          currentState: addressDetails.currentState,
          // Combined address for quick reference
          currentAddress: addressDetails.currentAddress,
          // Permanent address fields
          permanentHouse: addressDetails.permanentHouse,
          permanentCross: addressDetails.permanentCross,
          permanentArea: addressDetails.permanentArea,
          permanentDistrict: addressDetails.permanentDistrict,
          permanentCity: addressDetails.permanentCity,
          permanentPincode: addressDetails.permanentPincode,
          permanentState: addressDetails.permanentState,
          permanentAddress: addressDetails.permanentAddress,
          sameAsCurrent: addressDetails.sameAsCurrent,
          country: addressDetails.country
        }
      }
      if (stepData.engineeringDetails) {
        const engineeringDetails = stepData.engineeringDetails
        flattenedData = {
          ...flattenedData,
          // Use correct Prisma schema field names
          collegeName: engineeringDetails.collegeName,
          city: engineeringDetails.city,
          district: engineeringDetails.district,
          pincode: engineeringDetails.pincode,
          branch: engineeringDetails.branch,
          entryType: engineeringDetails.entryType,
          seatCategory: engineeringDetails.seatCategory,
          usn: engineeringDetails.usn,
          libraryId: engineeringDetails.libraryId,
          residencyStatus: engineeringDetails.residencyStatus,
          hostelName: engineeringDetails.hostelName,
          hostelRoom: engineeringDetails.roomNumber,
          hostelFloor: engineeringDetails.floorNumber,
          localCity: engineeringDetails.localCity,
          transportMode: engineeringDetails.transportMode,
          busRoute: engineeringDetails.busRoute,
          branchMentor: engineeringDetails.branchMentorName,
          linkedinLink: engineeringDetails.linkedin,
          githubLink: engineeringDetails.github,
          leetcodeLink: engineeringDetails.leetcode,
          resumeUpload: engineeringDetails.resume
        }
      }
      if (stepData.engineeringAcademicDetails) {
        const engineeringAcademicDetails = stepData.engineeringAcademicDetails
        flattenedData = {
          ...flattenedData,
          // Use correct Prisma schema field names
          finalCgpa: engineeringAcademicDetails.finalCgpa,
          activeBacklogs: engineeringAcademicDetails.activeBacklogs,
          backlogs: engineeringAcademicDetails.backlogSubjects,
        }
      }
      if (stepData.isComplete !== undefined) {
        flattenedData.isComplete = stepData.isComplete
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(flattenedData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(prev => ({ ...prev, ...stepData }))

        // Mark current step as complete
        setSteps(prev => prev.map(step => ({
          ...step,
          isComplete: step.id <= currentStep
        })))

        toast.success("Profile updated successfully!")
        return true
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to update profile")
        return false
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.")
      console.error("Error saving profile:", error)
      return false
    }
  }

  const handleNext = async (stepData: any) => {
    // Structure the data correctly based on current step
    let structuredData: Partial<ProfileData> = {}

    switch (currentStep) {
      case 1:
        // Personal info step - dateOfBirth comes as ISO string from the form
        const dob = stepData.dateOfBirth ? new Date(stepData.dateOfBirth) : undefined
        structuredData = {
          personalInfo: {
            firstName: stepData.firstName,
            middleName: stepData.middleName,
            lastName: stepData.lastName,
            dateOfBirth: dob,
            gender: stepData.gender === 'Male' ? 'MALE' : stepData.gender === 'Female' ? 'FEMALE' : stepData.gender,
            bloodGroup: stepData.bloodGroup,
            stateOfDomicile: stepData.state,
            nationality: stepData.nationality || 'INDIAN',
            casteCategory: stepData.category
          }
        }
        break
      case 2:
        // Contact details step - includes contact info, parent info, and address
        // Store individual address fields for proper form persistence
        structuredData = {
          contactDetails: {
            email: stepData.studentEmail,
            callingMobile: stepData.callingNumber,
            whatsappMobile: stepData.whatsappNumber,
            alternativeMobile: stepData.altNumber,
            fatherName: `${stepData.fatherFirstName || ''} ${stepData.fatherMiddleName || '.'} ${stepData.fatherLastName || ''}`.trim(),
            fatherMobile: stepData.fatherMobile,
            fatherEmail: stepData.fatherEmail,
            fatherOccupation: stepData.fatherOccupation,
            fatherDeceased: stepData.fatherDeceased,
            motherName: `${stepData.motherFirstName || ''} ${stepData.motherMiddleName || '.'} ${stepData.motherLastName || ''}`.trim(),
            motherMobile: stepData.motherMobile,
            motherEmail: stepData.motherEmail,
            motherOccupation: stepData.motherOccupation,
            motherDeceased: stepData.motherDeceased
          },
          addressDetails: {
            // Store individual fields for form persistence
            currentHouse: stepData.currentHouse,
            currentCross: stepData.currentCross,
            currentArea: stepData.currentArea,
            currentDistrict: stepData.currentDistrict,
            currentCity: stepData.currentCity,
            currentPincode: stepData.currentPincode,
            currentState: stepData.currentState,
            // Computed combined address for display
            currentAddress: `${stepData.currentHouse || ''}, ${stepData.currentCross ? stepData.currentCross + ', ' : ''}${stepData.currentArea || ''}, ${stepData.currentCity || ''}, ${stepData.currentDistrict || ''} - ${stepData.currentPincode || ''}, ${stepData.currentState || ''}`,
            // Same as current toggle
            sameAsCurrent: stepData.sameAsCurrent,
            // Permanent address fields
            permanentHouse: stepData.sameAsCurrent ? stepData.currentHouse : stepData.permanentHouse,
            permanentCross: stepData.sameAsCurrent ? stepData.currentCross : stepData.permanentCross,
            permanentArea: stepData.sameAsCurrent ? stepData.currentArea : stepData.permanentArea,
            permanentDistrict: stepData.sameAsCurrent ? stepData.currentDistrict : stepData.permanentDistrict,
            permanentCity: stepData.sameAsCurrent ? stepData.currentCity : stepData.permanentCity,
            permanentPincode: stepData.sameAsCurrent ? stepData.currentPincode : stepData.permanentPincode,
            permanentState: stepData.sameAsCurrent ? stepData.currentState : stepData.permanentState,
            // Computed combined permanent address
            permanentAddress: stepData.sameAsCurrent ?
              `${stepData.currentHouse || ''}, ${stepData.currentCross ? stepData.currentCross + ', ' : ''}${stepData.currentArea || ''}, ${stepData.currentCity || ''}, ${stepData.currentDistrict || ''} - ${stepData.currentPincode || ''}, ${stepData.currentState || ''}` :
              `${stepData.permanentHouse || ''}, ${stepData.permanentCross ? stepData.permanentCross + ', ' : ''}${stepData.permanentArea || ''}, ${stepData.permanentCity || ''}, ${stepData.permanentDistrict || ''} - ${stepData.permanentPincode || ''}, ${stepData.permanentState || ''}`,
            country: 'INDIA'
          }
        }
        break
      case 3:
        // Academic details step - includes 10th, 12th/diploma
        structuredData = {
          tenthDetails: {
            tenthSchoolName: stepData.tenthSchool,
            tenthAreaDistrictCity: `${stepData.tenthArea}, ${stepData.tenthDistrict}, ${stepData.tenthCity}`,
            tenthPincode: stepData.tenthPincode,
            tenthState: stepData.tenthState,
            tenthBoard: stepData.tenthBoard,
            tenthPassingYear: parseInt(stepData.tenthPassingYear),
            tenthPassingMonth: stepData.tenthPassingMonth,
            tenthPercentage: parseFloat(stepData.tenthPercentage),
            tenthMarksCard: stepData.tenthMarksCard
          },
          twelfthDiplomaDetails: stepData.academicLevel === '12th' ? {
            twelfthOrDiploma: '12th' as const,
            twelfthSchoolName: stepData.twelfthSchool,
            twelfthArea: stepData.twelfthArea,
            twelfthDistrict: stepData.twelfthDistrict,
            twelfthCity: stepData.twelfthCity,
            twelfthPincode: stepData.twelfthPincode,
            twelfthState: stepData.twelfthState,
            twelfthBoard: stepData.twelfthBoard,
            twelfthPassingYear: parseInt(stepData.twelfthPassingYear),
            twelfthPassingMonth: stepData.twelfthPassingMonth,
            twelfthStatePercentage: parseFloat(stepData.twelfthPercentage),
            twelfthMarkcard: stepData.twelfthMarksCard
          } : {
            twelfthOrDiploma: 'Diploma' as const,
            diplomaCollege: stepData.diplomaCollege,
            diplomaArea: stepData.diplomaArea,
            diplomaDistrict: stepData.diplomaDistrict,
            diplomaCity: stepData.diplomaCity,
            diplomaPincode: stepData.diplomaPincode,
            diplomaState: stepData.diplomaState,
            diplomaPercentage: stepData.diplomaPercentage,
            diplomaCertificates: stepData.diplomaCertificates
          }
        }
        break
      case 4:
        // Engineering details step - includes both engineering details and academic details
        structuredData = {
          engineeringDetails: {
            collegeName: stepData.collegeName,
            city: stepData.city,
            district: stepData.district,
            pincode: stepData.pincode,
            branch: stepData.branch,
            entryType: stepData.entryType === 'regular' ? 'REGULAR' : 'LATERAL',
            seatCategory: stepData.seatCategory,
            usn: stepData.usn,
            libraryId: stepData.libraryId,
            residencyStatus: stepData.residencyStatus === 'hostelite' ? 'HOSTELITE' : 'LOCALITE',
            hostelName: stepData.hostelName,
            roomNumber: stepData.hostelRoom,
            floorNumber: stepData.hostelFloor,
            localCity: stepData.city,
            transportMode: stepData.transportMode === 'college_bus' ? 'COLLEGE_BUS' : 'PRIVATE_TRANSPORT',
            busRoute: stepData.busRoute,
            branchMentorName: stepData.branchMentor,
            linkedin: stepData.linkedinLink,
            github: stepData.githubLink,
            leetcode: stepData.leetcodeLink,
            resume: stepData.resumeUpload
          },
          engineeringAcademicDetails: {
            finalCgpa: parseFloat(stepData.finalCgpa),
            activeBacklogs: stepData.hasBacklogs === 'yes',
            backlogSubjects: stepData.backlogs || []
          }
        }
        break
      case 5:
        // Review step - mark as complete
        structuredData = { isComplete: true }
        break
    }

    const success = await saveProfileStep(structuredData)
    if (success) {
      // Update local profile state with the new data
      setProfile(prev => ({ ...prev, ...structuredData }))

      // Mark current step as complete
      setSteps(prev => prev.map(step => ({
        ...step,
        isComplete: step.id <= currentStep
      })))

      if (currentStep < 5) {
        const nextStep = currentStep + 1
        setCurrentStep(nextStep)

        // Update sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('profile-current-step', nextStep.toString())
        }
      } else {
        // Profile completion - clear sessionStorage
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('profile-current-step')
        }
        toast.success("Profile completed successfully! Redirecting to dashboard...")
        setTimeout(() => router.push("/dashboard"), 2000)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Auto-save when switching steps
  const handleStepChange = async (newStep: number) => {
    // If there are unsaved changes, save them first
    if (isDirty && formData && Object.keys(formData).length > 0) {
      toast.info("Saving your progress...")
      await saveManually()
    }

    // Then switch to the new step
    setCurrentStep(newStep)

    // Update sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('profile-current-step', newStep.toString())
    }
  }

  const getStepIcon = (step: ProfileStep) => {
    const iconProps = { size: 20 }

    switch (step.id) {
      case 1:
        return <IconUser {...iconProps} />
      case 2:
        return <IconUsers {...iconProps} />
      case 3:
        return <IconMapPin {...iconProps} />
      case 4:
        return <IconSchool {...iconProps} />
      case 5:
        return <IconSchool {...iconProps} />
      case 6:
        return <IconBriefcase {...iconProps} />
      case 7:
        return <IconFileCheck {...iconProps} />
      default:
        return <IconCircle {...iconProps} />
    }
  }

  const renderStepContent = () => {
    // Merge database profile with current formData for live updates
    const currentData = { ...profile, ...formData }

    switch (currentStep) {
      case 1:
        // Map personal info data for step component - it expects dateOfBirth as ISO string
        const dob = currentData.personalInfo?.dateOfBirth
        const dobString = dob instanceof Date ? dob.toISOString() : (typeof dob === 'string' ? dob : '')

        const personalInfoV0Data = {
          firstName: currentData.personalInfo?.firstName || '',
          middleName: currentData.personalInfo?.middleName || '.',
          lastName: currentData.personalInfo?.lastName || '',
          dateOfBirth: dobString,
          gender: currentData.personalInfo?.gender === 'MALE' ? 'Male' :
            currentData.personalInfo?.gender === 'FEMALE' ? 'Female' :
              currentData.personalInfo?.gender || '',
          bloodGroup: currentData.personalInfo?.bloodGroup || '',
          state: currentData.personalInfo?.stateOfDomicile || 'KARNATAKA',
          nationality: currentData.personalInfo?.nationality || 'Indian',
          category: currentData.personalInfo?.casteCategory || '',
          profilePhoto: currentData.personalInfo?.profilePhoto || currentData.profilePhoto || null
        }
        return (
          <PersonalInfoStep
            initialData={personalInfoV0Data}
            onNext={handleNext}
          />
        )
      case 2:
        // Map contact details data for v0 component
        const contactV0Data = {
          studentEmail: currentData.contactDetails?.email || '',
          callingNumber: currentData.contactDetails?.callingMobile || '',
          whatsappNumber: currentData.contactDetails?.whatsappMobile || '',
          altNumber: currentData.contactDetails?.alternativeMobile || '',
          // Parse father name
          fatherFirstName: currentData.contactDetails?.fatherName ?
            currentData.contactDetails.fatherName.split(' ')[0] || '' : '',
          fatherMiddleName: currentData.contactDetails?.fatherName ?
            currentData.contactDetails.fatherName.split(' ')[1] || '.' : '.',
          fatherLastName: currentData.contactDetails?.fatherName ?
            currentData.contactDetails.fatherName.split(' ').slice(2).join(' ') || '' : '',
          fatherDeceased: currentData.contactDetails?.fatherDeceased || false,
          fatherMobile: currentData.contactDetails?.fatherMobile || '',
          fatherEmail: currentData.contactDetails?.fatherEmail || '',
          fatherOccupation: currentData.contactDetails?.fatherOccupation || '',
          // Parse mother name
          motherFirstName: currentData.contactDetails?.motherName ?
            currentData.contactDetails.motherName.split(' ')[0] || '' : '',
          motherMiddleName: currentData.contactDetails?.motherName ?
            currentData.contactDetails.motherName.split(' ')[1] || '.' : '.',
          motherLastName: currentData.contactDetails?.motherName ?
            currentData.contactDetails.motherName.split(' ').slice(2).join(' ') || '' : '',
          motherDeceased: currentData.contactDetails?.motherDeceased || false,
          motherMobile: currentData.contactDetails?.motherMobile || '',
          motherEmail: currentData.contactDetails?.motherEmail || '',
          motherOccupation: currentData.contactDetails?.motherOccupation || '',
          // Current address - fixed to read from addressDetails
          currentHouse: currentData.addressDetails?.currentHouse || '',
          currentCross: currentData.addressDetails?.currentCross || '',
          currentArea: currentData.addressDetails?.currentArea || '',
          currentDistrict: currentData.addressDetails?.currentDistrict || '',
          currentCity: currentData.addressDetails?.currentCity || '',
          currentPincode: currentData.addressDetails?.currentPincode || '',
          currentState: currentData.addressDetails?.currentState || 'KARNATAKA',
          sameAsCurrent: currentData.addressDetails?.sameAsCurrent || false,
          // Permanent address - fixed to read from addressDetails
          permanentHouse: currentData.addressDetails?.permanentHouse || '',
          permanentCross: currentData.addressDetails?.permanentCross || '',
          permanentArea: currentData.addressDetails?.permanentArea || '',
          permanentDistrict: currentData.addressDetails?.permanentDistrict || '',
          permanentCity: currentData.addressDetails?.permanentCity || '',
          permanentPincode: currentData.addressDetails?.permanentPincode || '',
          permanentState: currentData.addressDetails?.permanentState || 'KARNATAKA'
        }
        return (
          <ContactDetailsStep
            initialData={contactV0Data}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 3:
        // Map academic details data for v0 component
        const academicV0Data = {
          // 10th standard details
          tenthSchool: currentData.tenthDetails?.tenthSchoolName || '',
          tenthArea: currentData.tenthDetails?.tenthAreaDistrictCity || '',
          tenthDistrict: currentData.tenthDetails?.tenthDistrict || '',
          tenthCity: currentData.tenthDetails?.tenthCity || '',
          tenthPincode: currentData.tenthDetails?.tenthPincode || '',
          tenthState: currentData.tenthDetails?.tenthState || 'KARNATAKA',
          tenthBoard: currentData.tenthDetails?.tenthBoard || '',
          tenthPassingYear: currentData.tenthDetails?.tenthPassingYear?.toString() || '',
          tenthPassingMonth: currentData.tenthDetails?.tenthPassingMonth || '',
          tenthPercentage: currentData.tenthDetails?.tenthPercentage?.toString() || '',
          tenthMarksCard: currentData.tenthDetails?.tenthMarksCard || null,
          // Academic level selection
          academicLevel: currentData.twelfthDiplomaDetails?.twelfthOrDiploma === '12th' ? '12th' :
            currentData.twelfthDiplomaDetails?.twelfthOrDiploma === 'Diploma' ? 'Diploma' : '',
          // 12th standard details
          twelfthSchool: currentData.twelfthDiplomaDetails?.twelfthSchoolName || '',
          twelfthArea: currentData.twelfthDiplomaDetails?.twelfthArea || '',
          twelfthDistrict: currentData.twelfthDiplomaDetails?.twelfthDistrict || '',
          twelfthCity: currentData.twelfthDiplomaDetails?.twelfthCity || '',
          twelfthPincode: currentData.twelfthDiplomaDetails?.twelfthPincode || '',
          twelfthState: currentData.twelfthDiplomaDetails?.twelfthState || 'KARNATAKA',
          twelfthBoard: currentData.twelfthDiplomaDetails?.twelfthBoard || '',
          twelfthPassingYear: currentData.twelfthDiplomaDetails?.twelfthPassingYear?.toString() || '',
          twelfthPassingMonth: currentData.twelfthDiplomaDetails?.twelfthPassingMonth || '',
          twelfthPercentage: currentData.twelfthDiplomaDetails?.twelfthPercentage?.toString() || '',
          twelfthMarksCard: currentData.twelfthDiplomaDetails?.twelfthMarkcard || null,
          // Diploma details
          diplomaCollege: currentData.twelfthDiplomaDetails?.diplomaCollege || '',
          diplomaArea: currentData.twelfthDiplomaDetails?.diplomaArea || '',
          diplomaDistrict: currentData.twelfthDiplomaDetails?.diplomaDistrict || '',
          diplomaCity: currentData.twelfthDiplomaDetails?.diplomaCity || '',
          diplomaPincode: currentData.twelfthDiplomaDetails?.diplomaPincode || '',
          diplomaState: currentData.twelfthDiplomaDetails?.diplomaState || 'KARNATAKA',
          diplomaPercentage: currentData.twelfthDiplomaDetails?.diplomaPercentage?.toString() || '',
          diplomaCertificates: currentData.twelfthDiplomaDetails?.diplomaCertificates || null
        }
        return (
          <AcademicDetailsStep
            initialData={academicV0Data}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      case 4: {
        // Map engineering details for v0 component
        const eng = currentData.engineeringDetails || {}
        const branchMap: Record<string, string> = {
          'CSE': 'CS', 'ISE': 'IS', 'ECE': 'EC', 'EEE': 'EE', 'ME': 'ME', 'CE': 'CV', 'AIML': 'AI', 'DS': 'IS'
        }
        const engineeringV0Data = {
          collegeName: eng.collegeName || 'SHRI DHARMASTHALA MANJUNATHESHWARA COLLEGE OF ENGINEERING AND TECHNOLOGY',
          district: eng.district || 'DHARWAD',
          pincode: eng.pincode || '580002',
          branch: branchMap[eng.branch as string] || eng.branch || '',
          entryType: eng.entryType === 'REGULAR' ? 'regular' :
            eng.entryType === 'LATERAL' ? 'lateral' : '',
          seatCategory: eng.seatCategory || '',
          usn: eng.usn || '',
          libraryId: eng.libraryId || '',
          residencyStatus: eng.residencyStatus === 'HOSTELITE' ? 'hostelite' :
            eng.residencyStatus === 'LOCALITE' ? 'localite' : '',
          hostelName: eng.hostelName || '',
          hostelRoom: eng.roomNumber || '',
          hostelFloor: eng.floorNumber || '',
          city: eng.localCity || '',
          transportMode: eng.transportMode === 'COLLEGE_BUS' ? 'college_bus' :
            eng.transportMode === 'PRIVATE_TRANSPORT' ? 'own_vehicle' : '',
          busRoute: eng.busRoute || '',
          batch: '2022 - 2026',
          branchMentor: eng.branchMentorName || '',
          linkedinLink: eng.linkedin || '',
          githubLink: eng.github || '',
          leetcodeLink: eng.leetcode || '',
          resumeUpload: null, // File will be uploaded separately
          // Academic details - fix to read from database
          semesters: currentData.engineeringAcademicDetails?.semesters
            ? (Array.isArray(currentData.engineeringAcademicDetails.semesters)
              ? currentData.engineeringAcademicDetails.semesters
              : JSON.parse(currentData.engineeringAcademicDetails.semesters as any))
            : Array.from({ length: 6 }, (_, i) => ({
              semester: i + 1,
              sgpa: '',
              cgpa: '',
              monthPassed: '',
              yearPassed: '',
              marksCard: null,
              failed: false,
              failedSubjects: []
            })),
          finalCgpa: currentData.engineeringAcademicDetails?.finalCgpa?.toString() || '',
          hasBacklogs: currentData.engineeringAcademicDetails?.activeBacklogs ? 'yes' : 'no',
          backlogs: currentData.engineeringAcademicDetails?.backlogSubjects
            ? (Array.isArray(currentData.engineeringAcademicDetails.backlogSubjects)
              ? currentData.engineeringAcademicDetails.backlogSubjects
              : JSON.parse(currentData.engineeringAcademicDetails.backlogSubjects as any))
            : []
        }
        return (
          <EngineeringDetailsStep
            initialData={engineeringV0Data}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )
      }
      case 5:
        return (
          <ReviewStep
            formData={currentData}
            onPrevious={handlePrevious}
          />
        )
      default:
        return null
    }
  }

  if (status === "loading" || isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <PageLoading message="Loading your profile..." />
      </div>
    )
  }

  const progress = (currentStep / 5) * 100

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Complete Your Profile</h1>
              <p className="mt-1 text-sm sm:text-base text-muted-foreground hidden sm:block">
                Welcome to SDMCET Placement Portal! Complete these 5 steps to get ready for placements.
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{Math.round(progress)}%</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Complete</div>
              </div>
              {/* Save Status Indicator */}
              <SaveStatusIndicator
                status={saveState.status}
                lastSaved={saveState.lastSaved}
                onRetry={saveManually}
                showText={true}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2 sm:h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep} of 5</span>
              <span>{steps[currentStep - 1]?.title}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 lg:py-8">
        {/* Mobile Step Indicator */}
        <div className="block lg:hidden mb-6">
          <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => handleStepChange(step.id)}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                  currentStep === step.id
                    ? "bg-primary text-primary-foreground ring-2 ring-primary/20"
                    : step.isComplete
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {step.isComplete ? (
                  <IconCircleCheck size={16} />
                ) : (
                  step.id
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Step Navigation */}
        <div className="hidden lg:grid lg:grid-cols-5 gap-3 mb-8">
          {steps.map((step) => (
            <Card
              key={step.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105",
                currentStep === step.id && "ring-2 ring-primary border-primary shadow-lg",
                step.isComplete && "bg-green-50 dark:bg-green-950/20"
              )}
              onClick={() => handleStepChange(step.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full",
                    step.isComplete
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  )}>
                    {step.isComplete ? (
                      <IconCircleCheck size={16} />
                    ) : (
                      <span className="text-sm font-bold">{step.id}</span>
                    )}
                  </div>
                  {step.isComplete && (
                    <Badge variant="secondary" className="text-xs">
                      ✓
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-sm mb-2 leading-tight">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Step Content */}
        <Card className="shadow-sm border-neutral-200">
          <CardHeader className="bg-white border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  {steps[currentStep - 1]?.title}
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  {steps[currentStep - 1]?.description}
                </CardDescription>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="gap-2"
                  >
                    <IconArrowLeft size={16} />
                    Previous
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
