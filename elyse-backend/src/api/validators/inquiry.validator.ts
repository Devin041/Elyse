import { z } from 'zod';

export const createInquirySchema = z.object({
    name: z.string().min(1, "Full name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
