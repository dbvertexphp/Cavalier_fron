import { z } from "zod";

export const leadSchema = z.object({

  leadNo: z.string().optional(),

  date: z.string().min(1, "Date required"),

  expectedValidity: z.string().optional(),

  type: z.string().min(1, "Type required"),

  salesProcess: z.string().min(1, "Sales process required"),

  branch: z.string().min(1, "Branch required"),

  hod: z.string().min(1, "HOD required"),

  leadOwner: z.string().min(1, "Lead owner required"),

  salesCoordinator: z.string().min(1, "Sales coordinator required"),

  reportingManager: z.string().min(1, "Reporting manager required"),

  location: z.string().min(1, "Location required"),

  source: z.string().min(1, "Lead source required"),

  salesStage: z.string().min(1, "Sales stage required"),

  team: z.string().min(1, "Team required"),

  area: z.string().min(1, "Area required"),

  organization: z.string().min(1, "Organization required")

});