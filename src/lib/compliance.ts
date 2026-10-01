export interface ComplianceDetails {
  cacRcNumber: string | null;
  registeredName: string | null;
  nafdacNumber: string | null;
}

export interface ComplianceChip {
  label: string;
  value: string;
  detail: string | null;
}

export function buildComplianceChips(details: ComplianceDetails): ComplianceChip[] {
  return [
    ...(details.cacRcNumber ? [{ label: 'CAC RC No.', value: details.cacRcNumber, detail: details.registeredName }] : []),
    ...(details.nafdacNumber ? [{ label: 'NAFDAC No.', value: details.nafdacNumber, detail: null }] : []),
  ].filter(entry => entry.value.trim().length > 0);
}
