import { z } from "zod";

export const employeeSchema = z.object({

/* =========================
EMPLOYEE DETAILS
========================= */

userType: z.string().min(1,"User type required"),

firstName: z.string()
.min(1,"First name required")
.regex(/^[a-zA-Z ]+$/,"Only letters allowed"),

middleName: z.string().optional(),

lastName: z.string()
.min(1,"Last name required")
.regex(/^[a-zA-Z ]+$/,"Only letters allowed"),

email: z.string()
.min(1,"Email required")
.email("Invalid email"),

dob: z.string().min(1,"DOB required"),

gender: z.string().optional(),

maritalStatus: z.string().optional(),

bloodGroup: z.string().optional(),

mobile: z.string()
.regex(/^[0-9]{10}$/,"Mobile must be 10 digits"),

telephone: z.string().optional(),

/* =========================
COMPANY DETAILS
========================= */

department: z.string().min(1,"Department required"),

designation: z.string().min(1,"Designation required"),

functionalArea: z.string().optional(),

hod: z.string().min(1,"HOD required"),

team: z.string().min(1,"Team required"),

/* =========================
GOVT IDS
========================= */

panNo: z.string()
.regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,"Invalid PAN"),

aadhaarNo: z.string()
.regex(/^[0-9]{12}$/,"Invalid Aadhaar"),

/* =========================
JOB DETAILS
========================= */

joiningDate: z.string().min(1,"Joining date required"),

ctcMonthly: z.string()
.regex(/^[0-9]+$/,"CTC must be number"),

/* =========================
EXPERIENCE
========================= */

experience: z.array(

z.object({

organization: z.string().min(1,"Organization required"),

designation: z.string().min(1,"Designation required"),

yearsExperience: z.string().min(1,"Experience required"),

annualSalary: z.string().optional(),

dateOfExit: z.string().optional(),

verificationComplete: z.boolean().optional()

})

).optional(),

/* =========================
BANK DETAILS
========================= */

accountHolderName: z.string().min(1,"Account holder name required"),

bankName: z.string().min(1,"Bank name required"),

branchName: z.string().min(1,"Branch name required"),

ifscCode: z.string()
.regex(/^[A-Z]{4}0[A-Z0-9]{6}$/,"Invalid IFSC"),

accountType: z.string().min(1,"Account type required"),

accountNumber: z.string()
.regex(/^[0-9]{9,18}$/,"Invalid account number"),

/* =========================
CORRESPONDING ADDRESS
========================= */

c_houseNo: z.string().min(1,"House no required"),

c_building: z.string().optional(),

c_floor: z.string().optional(),

c_block: z.string().optional(),

c_street: z.string().min(1,"Street required"),

c_landmark: z.string().optional(),

c_area: z.string().optional(),

c_city: z.string().min(1,"City required"),

c_district: z.string().min(1,"District required"),

c_state: z.string().min(1,"State required"),

c_pincode: z.string()
.regex(/^[0-9]{6}$/,"Invalid pincode"),

c_country: z.string().min(1,"Country required"),

/* =========================
PERMANENT ADDRESS
========================= */

p_houseNo: z.string().min(1,"House no required"),

p_building: z.string().optional(),

p_floor: z.string().optional(),

p_block: z.string().optional(),

p_street: z.string().min(1,"Street required"),

p_landmark: z.string().optional(),

p_area: z.string().optional(),

p_city: z.string().min(1,"City required"),

p_district: z.string().min(1,"District required"),

p_state: z.string().min(1,"State required"),

p_pincode: z.string()
.regex(/^[0-9]{6}$/,"Invalid pincode"),

p_country: z.string().min(1,"Country required"),

/* =========================
EDUCATION
========================= */

education: z.object({

tenthYear: z.string()
.regex(/^(19|20)[0-9]{2}$/,"Invalid year"),

tenthPercentage: z.string().optional(),

twelfthYear: z.string()
.regex(/^(19|20)[0-9]{2}$/,"Invalid year"),

twelfthPercentage: z.string().optional(),

graduationYear: z.string().optional(),

graduationPercentage: z.string().optional(),

pgYear: z.string().optional(),

pgPercentage: z.string().optional()

}),

/* =========================
EMERGENCY CONTACT
========================= */

emergencyName: z.string().min(1,"Emergency contact required"),

relation: z.string().min(1,"Relation required"),

emergencyMobile: z.string()
.regex(/^[0-9]{10}$/,"Invalid mobile")

});
documents: z.object({

offerLetter: z
.any()
.refine(file => !file || file.size <= 1024 * 1024,"File must be less than 1MB")
.optional(),

appointmentLetter: z
.any()
.refine(file => !file || file.size <= 1024 * 1024,"File must be less than 1MB")
.optional(),

invitationLetter: z
.any()
.refine(file => !file || file.size <= 1024 * 1024,"File must be less than 1MB")
.optional(),

relievingLetter: z
.any()
.refine(file => !file || file.size <= 1024 * 1024,"File must be less than 1MB")
.optional(),

fullAndFinalLetter: z
.any()
.refine(file => !file || file.size <= 1024 * 1024,"File must be less than 1MB")
.optional()

})