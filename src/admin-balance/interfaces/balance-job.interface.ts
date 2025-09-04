export interface BalanceResetJobData {
  adminId: number;
  timestamp: Date;
  reason?: string;
}

export interface BalanceResetJobResult {
  success: boolean;
  totalUsersProcessed: number;
  duration: number;
  message: string;
}
