import { z } from "zod";
 
export const formSchema = z.object({
    firstName: z.string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters"),
    lastName: z.string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .max(100, "Password must be less than 100 characters"),
    orgId: z.string()
        .regex(/^[A-Z]{7}$/, { message: "Organization ID must be exactly 7 uppercase letters" })
        .length(7, "Organization ID must be exactly 7 characters")
});
 
export type FormSchema = typeof formSchema;