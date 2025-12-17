import { z } from "zod"

export const jobFormSchema = z.object({
    title: z
        .string()
        .min(3, "Job title must be at least 3 characters")
        .max(100, "Job title must be less than 100 characters"),
    company: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .max(100, "Company name must be less than 100 characters"),
    companyLogo: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    description: z
        .string()
        .min(50, "Job description must be at least 50 characters")
        .max(10000, "Job description must be less than 10000 characters"),
    location: z
        .string()
        .min(2, "Location must be at least 2 characters")
        .max(100, "Location must be less than 100 characters"),
    jobType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"], {
        message: "Please select a job type",
    }),
    workMode: z.enum(["OFFICE", "REMOTE", "HYBRID"], {
        message: "Please select a work mode",
    }),
    minCGPA: z
        .number()
        .min(0, "CGPA cannot be negative")
        .max(10, "CGPA cannot exceed 10")
        .optional()
        .nullable(),
    allowedBranches: z.array(z.string()).default([]),
    eligibleBatch: z.string().optional().or(z.literal("")),
    maxBacklogs: z
        .number()
        .min(0, "Backlogs cannot be negative")
        .max(20, "Maximum backlogs cannot exceed 20")
        .optional()
        .nullable()
        .default(0),
    salary: z.string().optional().or(z.literal("")),
    minSalary: z.number().min(0, "Salary cannot be negative").optional().nullable(),
    maxSalary: z.number().min(0, "Salary cannot be negative").optional().nullable(),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    deadline: z.string().optional().or(z.literal("")),
    startDate: z.string().optional().or(z.literal("")),
    noOfPositions: z
        .number()
        .min(1, "At least 1 position is required")
        .max(1000, "Maximum positions cannot exceed 1000")
        .default(1),
    status: z.enum(["DRAFT", "ACTIVE", "CLOSED", "PAUSED"]).default("DRAFT"),
    isVisible: z.boolean().default(true),
}).refine(
    (data) => {
        if (data.minSalary && data.maxSalary) {
            return data.maxSalary >= data.minSalary
        }
        return true
    },
    {
        message: "Maximum salary must be greater than or equal to minimum salary",
        path: ["maxSalary"],
    }
)

export type JobFormData = z.infer<typeof jobFormSchema>
