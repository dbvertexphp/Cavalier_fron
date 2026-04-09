import { z } from "zod";

export const employeeSchema = z.object({
  userType: z.string().min(1, "User type required"),
  firstName: z.string().min(1, "First name required").regex(/^[a-zA-Z ]+$/, "Only letters allowed"),
  
  email: z.string().min(1, "Email required").email("Invalid email"),
 dob: z.string()
  .min(1, "DOB required")
  .regex(/^\d{2}-\d{2}-\d{4}$/, "Format must be DD-MM-YYYY")
  .refine((val) => {
    const [day, month, year] = val.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Invalid DOB"),

dateOfJoining: z.string()
  .min(1, "Joining date required")
  .regex(/^\d{2}-\d{2}-\d{4}$/, "Format must be DD-MM-YYYY")
  .refine((val) => {
    const [day, month, year] = val.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  }, "Invalid joining date"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
  
  // Mapped to your TS names

paN_No: z.string()
  .min(1, "PAN No required ")
  // Bas uppercase mein convert karega, format ki tension nahi
  .transform((val) => val.toUpperCase()),
  aadhaarNo: z.string().regex(/^[0-9]{12}$/, "Invalid Aadhaar"),
  
  ctc_Monthly: z.preprocess((val) => String(val), z.string().regex(/^[0-9.]+$/, "CTC must be number")),

  // Address - Mapping to your 'pres' and 'perm' names
  // Zod Schema (Address Section)

  presHouseNo: z.string().optional().or(z.literal('')),
  presStreet: z.string().optional().or(z.literal('')),
  presCity: z.string().optional().or(z.literal('')),
  presDistrict: z.string().optional().or(z.literal('')),
  presState: z.string().optional().or(z.literal('')),
  presPincode: z.string().optional().or(z.literal('')),
  // ... baaki sari fields ko bhi optional() kar dein
  
  permHouseNo: z.string().optional().or(z.literal('')),
  permStreet: z.string().optional().or(z.literal('')),
  permCity: z.string().optional().or(z.literal('')),
  permDistrict: z.string().optional().or(z.literal('')),
  permState: z.string().optional().or(z.literal('')),
  permPincode: z.string().optional().or(z.literal('')),

  // Bank Details
  accountHolderName: z.string().min(1, "Required"),
  bankName: z.string().min(1, "Required"),
  ifscCode: z.string()
  .min(1, "IFSC code not be empty.")
  .toUpperCase() // User small likhe ya capital, ye capital bana dega
  .regex(/^[A-Z0-9]+$/, "ony alphabets and numbers (No special characters)"),
  accountNumber: z.string().regex(/^[0-9]{9,18}$/, "Invalid account number"),

// In sabko optional kar diya taaki validation error na aaye
  tenthYear: z.string().optional().or(z.literal('')),
  tenthPercentage: z.string().optional().or(z.literal('')),
  
  twelfthYear: z.string().optional().or(z.literal('')),
  twelfthPercentage: z.string().optional().or(z.literal('')),
  
  graduationYear: z.string().optional().or(z.literal('')),
  graduationPercentage: z.string().optional().or(z.literal('')),
  
  postGraduationYear: z.string().optional().or(z.literal('')),
  postGraduationPercentage: z.string().optional().or(z.literal('')),

  // FormArray ke liye bhi optional handle karein
  educations: z.array(z.object({
    educationName: z.string().optional(),
    year: z.string().optional(),
    percentage: z.string().optional()
  })).optional(),

  // Emergency
  emergencyName: z.string().min(1, "Required"),
  // emergencyRelationship: z.string().min(1, "Required"),
  emergencyContactNo: z.string().regex(/^[0-9]{10}$/, "Invalid mobile")
}).passthrough(); // passthrough() lagane se extra fields error nahi dengi