// Common types for the application

export type RoleEnum =
  | "Super Admin"
  | "Admin"
  | "Dispatcher"
  | "Driver"
  | "Volunteer"
  | "Client";

export type RideType = "Medical" | "Tax" | "Shopping" | "Social" | "Other";
export type RideStatus = "Pending" | "Assigned" | "In Progress" | "Completed" | "Cancelled";
export type TimeOffReason = "Medical" | "Vacation" | "Emergency" | "Personal" | "Other";
export type TimeOffStatus = "Pending" | "Approved" | "Denied";
export type DonationType = "Cash" | "Check" | "Online" | "Other";
export type ReportType = "Appointments" | "Assigned Rides" | "Donations" | "Driver Performance" | "Client Usage" | "Financial";

export interface Client {
  clientid: number;
  first_name: string;
  last_name: string;
  dob: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  org_id: number | null;
  insurance_provider: string | null;
}

export interface ClientPayload {
  first_name: string;
  last_name: string;
  dob?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  insurance_provider?: string | null;
}

export interface PaymentStatusOption {
  value: string;
  label: string;
  description?: string;
  color?: string;
}

export interface User {
	id: string;
	email: string;
	name: string;
  role: RoleEnum;
  created_at: Date;
  updated_at: Date;
}
 
export interface Provider {
  id: number;
  prefix: string;
  firstname: string;
  lastname: string;
  name?: string;
}

export interface Profile {
  auth_user_id: string;
  first_name: string;
  last_name: string;
  org_id: number;
  email?: string;
  role?: string;
}

export interface Billable {
  id?: number;
  billable_code: string;
  description: string;
  cost: number;
  is_active?: boolean;
}

export interface TreatmentItem {
  name: string;
  cost: number;
  code: string;
  teeth: string;
  na: boolean;
  index?: number;
}

export interface TreatmentPlanItem {
  id: number;
  treatment_plan_option_id: number;
  name: string;
  quantity: number;
  cost: number;
  teeth: string;
  sequence_order: number;
  created_at: string;
}

export interface TreatmentPlanOption {
  id: number;
  option_name?: string;
  treatment_plan_id?: number;
  name?: string;
  description?: string;
  sequence_order: number;
  total_cost?: number;
  created_at?: string;
  items?: TreatmentPlanItem[];
}

export interface TreatmentPlanDetails {
  id: number;
  patient_name: string;
  doctor_name: string;
  discount: number;
  insurance_coverage: number;
  courtesy_amount: number;
  clientid: number;
  providerid: number;
  payment_status: string;
  notes: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  amount_paid: number;
  presenter_id?: string; // UUID of the person who presented the treatment plan
  options: TreatmentPlanOption[];
  // Legacy fields for backward compatibility
  created_by_profile?: {
    auth_user_id: string;
    first_name: string;
    last_name: string;
  } | null;
  org_id?: number;
  images?: any[];
  amount?: number;
}

export interface TreatmentPlan {
  visitid: number;
  clientid: number;
  providerid: number;
  visitdate: string;
  paid: boolean;
  notes: string;
  discount: number;
  treatment_plan_id: number;
  org_id: number;
  treatment_plan: TreatmentPlanDetails;
  // Computed fields
  activePlanPrice: number;
}

export interface QuickTreatmentPlan {
  id?: number;
  name: string;
  codes: string[];
  billables?: Billable[];
  items?: TreatmentItem[];
}

export interface FormPageData {
  providers: Provider[];
  billables: Billable[];
  activeBillables: Billable[];
  quickTreatmentPlans: QuickTreatmentPlan[];
  treatments: TreatmentItem[];
  clients: Client[];
  treatmentPlans?: TreatmentPlan[];
}

export interface Plan {
  name: string;
  codes?: string[];
  items: Array<TreatmentItem>;
}