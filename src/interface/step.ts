export type Step =
  | "start"
  | "awaiting_cpf"
  | "awaiting_name"
  | "confirming_voucher_bonus"
  | "awaiting_analysis_confirmation"
  | "awaiting_analysis_type"
  | "awaiting_analysis_data"
  | "processing_analysis"
  | "analysis_done"
  | "list_vouchers_wallet"
  | "awaiting_longitude"
  | "awaiting_latitude";
