"use client"

import { useState } from "react"
import { PersonalInfoStep } from "@/components/steps/personal-info-step"
import { ContactDetailsStep } from "@/components/steps/contact-details-step"
import { AcademicDetailsStep } from "@/components/steps/academic-details-step"
import { EngineeringDetailsStep } from "@/components/steps/engineering-details-step"
import { CollegeIdStep } from "@/components/steps/college-id-step"
import { ReviewStep } from "@/components/steps/review-step"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, Circle } from "lucide-react"

enum Step {
    PERSONAL_INFO = 1,
    CONTACT_DETAILS = 2,
    ACADEMIC_DETAILS = 3,
    ENGINEERING_DETAILS = 4,
    COLLEGE_ID = 5,
    REVIEW = 6,
}

export function ProfileCompletion({ profile }: { profile: any }) {
    const [currentStep, setCurrentStep] = useState<Step>(Step.PERSONAL_INFO)
    const [formData, setFormData] = useState<any>({
        personalInfo: {
            firstName: profile?.firstName ?? "",
            middleName: profile?.middleName ?? "",
            lastName: profile?.lastName ?? "",
            gender: profile?.gender ?? "",
            dateOfBirth: profile?.dateOfBirth ?? "",
            bloodGroup: profile?.bloodGroup ?? "",
        },

        contactDetails: {
            studentEmail: profile?.email ?? "",
            callingNumber: profile?.callingMobile ?? "",
            whatsappNumber: profile?.whatsappMobile ?? "",
            altNumber: profile?.alternativeMobile ?? "",
        },

        addressDetails: {
            currentHouse: profile?.currentHouse ?? "",
            city: profile?.city ?? "",
            district: profile?.district ?? "",
            state: profile?.stateOfDomicile ?? "",
            pincode: profile?.pincode ?? "",
        },

        tenthDetails: {
            tenthSchool: profile?.tenthSchoolName ?? "",
            tenthBoard: profile?.tenthBoard ?? "",
            tenthPercentage: profile?.tenthPercentage ?? "",
            tenthPassingYear: profile?.tenthPassingYear ?? "",
        },

        twelfthDiplomaDetails: {
            twelfthSchool: profile?.twelfthSchoolName ?? "",
            twelfthPercentage: profile?.twelfthStatePercentage ?? "",
            diplomaCollege: profile?.diplomaCollege ?? "",
            diplomaPercentage: profile?.diplomaPercentage ?? "",
        },

        engineeringDetails: {
            collegeName: profile?.collegeName ?? "",
            usn: profile?.usn ?? "",
            branch: profile?.branch ?? "",
            entryType: profile?.entryType ?? "",
        },

        engineeringAcademicDetails: {
            finalCgpa: profile?.finalCgpa ?? "",
            activeBacklogs: profile?.activeBacklogs ?? false,
        },

        collegeIdDetails: {
            collegeIdCard: profile?.collegeIdCard ?? null,
        },
    })


    const steps = [
        { id: Step.PERSONAL_INFO, label: "Personal Info" },
        { id: Step.CONTACT_DETAILS, label: "Contact" },
        { id: Step.ACADEMIC_DETAILS, label: "Academic" },
        { id: Step.ENGINEERING_DETAILS, label: "Engineering" },
        { id: Step.COLLEGE_ID, label: "College ID" },
        { id: Step.REVIEW, label: "Review" },
    ]

    const handleNext = (data: any) => {
        setFormData((prev: any) => {
            const updated = { ...prev }

            switch (currentStep) {
                case Step.PERSONAL_INFO:
                    updated.personalInfo = data
                    break

                case Step.CONTACT_DETAILS:
                    // Map ContactDetailsStep output to ReviewStep expectations
                    updated.contactDetails = {
                        email: data.studentEmail,
                        callingMobile: data.callingNumber,
                        whatsappMobile: data.whatsappNumber,
                        alternativeMobile: data.altNumber,

                        fatherName: `${data.fatherFirstName} ${data.fatherMiddleName} ${data.fatherLastName}`.replace("  ", " ").trim(),
                        fatherMobile: data.fatherMobile,
                        fatherEmail: data.fatherEmail,
                        fatherOccupation: data.fatherOccupation,

                        motherName: `${data.motherFirstName} ${data.motherMiddleName} ${data.motherLastName}`.replace("  ", " ").trim(),
                        motherMobile: data.motherMobile,
                        motherEmail: data.motherEmail,
                        motherOccupation: data.motherOccupation,
                    }
                    updated.addressDetails = data // Address fields match (currentHouse, etc)
                    break

                case Step.ACADEMIC_DETAILS:
                    // Map AcademicDetailsStep output to ReviewStep expectations
                    updated.tenthDetails = {
                        tenthSchoolName: data.tenthSchool,
                        tenthAreaDistrictCity: `${data.tenthArea}, ${data.tenthDistrict}, ${data.tenthCity}`,
                        tenthBoard: data.tenthBoard,
                        tenthPassingYear: data.tenthPassingYear,
                        tenthPassingMonth: data.tenthPassingMonth,
                        tenthPercentage: data.tenthPercentage,
                        // Add other fields if necessary
                    }

                    updated.twelfthDiplomaDetails = {
                        twelfthOrDiploma: data.academicLevel,

                        // 12th fields
                        twelfthSchoolName: data.twelfthSchool,
                        twelfthArea: data.twelfthArea,
                        twelfthDistrict: data.twelfthDistrict,
                        twelfthCity: data.twelfthCity,
                        twelfthBoard: data.twelfthBoard,
                        twelfthPassingYear: data.twelfthPassingYear,
                        twelfthStatePercentage: data.twelfthPercentage,

                        // Diploma fields
                        diplomaCollege: data.diplomaCollege,
                        diplomaArea: data.diplomaArea,
                        diplomaDistrict: data.diplomaDistrict,
                        diplomaCity: data.diplomaCity,
                        diplomaPercentage: data.diplomaPercentage,
                    }
                    break

                case Step.ENGINEERING_DETAILS:
                    updated.engineeringDetails = data // collegeName, usn, etc match

                    updated.engineeringAcademicDetails = {
                        ...data,
                        activeBacklogs: data.hasBacklogs === "yes",
                        finalCgpa: data.finalCgpa,
                    }
                    break

                case Step.COLLEGE_ID:
                    updated.collegeIdDetails = data
                    break
            }

            return updated
        })

        setCurrentStep((prev) => prev + 1)
    }

    const handlePrevious = () => {
        setCurrentStep((prev) => Math.max(1, prev - 1))
    }

    const renderStep = () => {
        switch (currentStep) {
            case Step.PERSONAL_INFO:
                return (
                    <PersonalInfoStep
                        onNext={handleNext}
                        initialData={formData.personalInfo}
                    />
                )
            case Step.CONTACT_DETAILS:
                return (
                    <ContactDetailsStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        initialData={{ ...formData.contactDetails, ...formData.addressDetails }}
                    />
                )
            case Step.ACADEMIC_DETAILS:
                // We need to pass back the data in the format AcademicDetailsStep expects
                // But since we transformed it for storage, we might need to rely on the fact 
                // that we might haven't fully transformed everything reversibly. 
                // Ideally we should store raw data too, but for now let's pass partial data if needed,
                // or just empty object if we don't want to implement reverse mapping right now.
                // A better approach: Store RAW data in a separate key if we want perfect persistence on back navigation.
                // For simplicity, let's just pass what we have, knowing some fields might be missing if we only stored transformed data.
                // WAIT: In handleNext, I stored specific transformed keys. I should ALSO store the raw data for that step
                // to simplify back navigation state restoration.
                // Let's modify handleNext to store raw step data as well.
                return (
                    <AcademicDetailsStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        initialData={formData.rawAcademicDetails || {}}
                    />
                )
            case Step.ENGINEERING_DETAILS:
                return (
                    <EngineeringDetailsStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        initialData={formData.engineeringDetails /* engineeringDetails was just data */}
                    />
                )
            case Step.COLLEGE_ID:
                return (
                    <CollegeIdStep
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                        initialData={formData.collegeIdDetails}
                    />
                )
            case Step.REVIEW:
                return (
                    <ReviewStep
                        onPrevious={handlePrevious}
                        formData={formData}
                    />
                )
            default:
                return null
        }
    }

    // Improved handleNext to store raw data for Academic step
    const handleNextWithRawStorage = (data: any) => {
        if (currentStep === Step.ACADEMIC_DETAILS) {
            setFormData((prev: any) => ({ ...prev, rawAcademicDetails: data }))
        }
        handleNext(data)
    }

    return (
        <div className="space-y-8">
            {/* Stepper */}
            <div className="relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
                <div className="flex justify-between max-w-4xl mx-auto px-4">
                    {steps.map((step) => {
                        const isCompleted = currentStep > step.id
                        const isCurrent = currentStep === step.id

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 bg-background px-2">
                                <div
                                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-200
                    ${isCompleted ? "bg-green-600 border-green-600 text-white" :
                                            isCurrent ? "bg-blue-600 border-blue-600 text-white" :
                                                "bg-background border-gray-300 text-gray-400"}
                  `}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <span className="text-xs font-semibold">{step.id}</span>
                                    )}
                                </div>
                                <span className={`text-xs font-medium ${isCurrent ? "text-blue-600" : "text-muted-foreground"} hidden sm:block`}>
                                    {step.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Step Content */}
            <div className="mt-8">
                {currentStep === Step.ACADEMIC_DETAILS ? (
                    <AcademicDetailsStep
                        onNext={handleNextWithRawStorage}
                        onPrevious={handlePrevious}
                        initialData={formData.rawAcademicDetails || {}}
                    />
                ) : renderStep()}
            </div>
        </div>
    )
}
