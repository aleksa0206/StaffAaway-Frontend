export type LeaveType = 
  | "godisnji_odmor"
  | "bolovanje"
  | "slobodan_dan"
  | "sluzbeni_put";

export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: number;
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note: string | null;
  status: LeaveStatus;
  created_at?: string;
}

export interface CreateLeaveRequest {
  type: LeaveType;
  date_from: string;
  date_to: string;
  working_days: number;
  note?: string | null;
}

export interface LeaveBalance {
  type: LeaveType;
  used: number;
  total: number;
  remaining: number;
}