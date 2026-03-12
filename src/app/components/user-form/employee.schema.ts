import { z } from "zod";

export const employeeSchema = z.object({
  userType: z.string().min(1, "User type required"),
  firstName: z.string().min(1, "First name required").regex(/^[a-zA-Z ]+$/, "Only letters allowed"),
  lastName: z.string().min(1, "Last name required").regex(/^[a-zA-Z ]+$/, "Only letters allowed"),
  email: z.string().min(1, "Email required").email("Invalid email"),
  dob: z.string().min(1, "DOB required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be 10 digits"),
  
  // Mapped to your TS names
  department: z.string().min(1, "Department required"),
paN_No: z.string()
  .min(1, "PAN No required hai")
  // Input ko validate karne se pehle uppercase mein convert karega
  .transform((val) => val.toUpperCase()) 
  // Regex jo space aur case dono ko handle karega
  .refine((val) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
    message: "Invalid PAN format (e.g., ABCDE1234F)",
  }),
  aadhaarNo: z.string().regex(/^[0-9]{12}$/, "Invalid Aadhaar"),
  dateOfJoining: z.string().min(1, "Joining date required"),
  ctc_Monthly: z.preprocess((val) => String(val), z.string().regex(/^[0-9.]+$/, "CTC must be number")),

  // Address - Mapping to your 'pres' and 'perm' names
  presHouseNo: z.string().min(1, "House no required"),
  presStreet: z.string().min(1, "Street required"),
  presCity: z.string().min(1, "City required"),
  presPincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),

  permHouseNo: z.string().min(1, "House no required"),
  permStreet: z.string().min(1, "Street required"),
  permCity: z.string().min(1, "City required"),
  permPincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode"),

  // Bank Details
  accountHolderName: z.string().min(1, "Required"),
  bankName: z.string().min(1, "Required"),
  ifscCode: z.string()
  .min(1, "IFSC code khali nahi hona chahiye")
  .toUpperCase() // User small likhe ya capital, ye capital bana dega
  .regex(/^[A-Z0-9]+$/, "Sirf alphabets aur numbers allowed hain (No special characters)"),
  accountNumber: z.string().regex(/^[0-9]{9,18}$/, "Invalid account number"),

  // Education - Flattened as per your initForm
  tenthYear: z.string().regex(/^(19|20)[0-9]{2}$/, "Invalid year"),
  twelfthYear: z.string().regex(/^(19|20)[0-9]{2}$/, "Invalid year"),

  // Emergency
  emergencyName: z.string().min(1, "Required"),
  // emergencyRelationship: z.string().min(1, "Required"),
  emergencyContactNo: z.string().regex(/^[0-9]{10}$/, "Invalid mobile")
}).passthrough(); // passthrough() lagane se extra fields error nahi dengi