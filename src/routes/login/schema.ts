import { z } from "zod";
 
export const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
});
 
export type FormSchema = typeof formSchema;