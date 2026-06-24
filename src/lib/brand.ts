/** Bundled ayurA Chennai clinic logo (public/clinic-logo.png) */
export const DEFAULT_CLINIC_LOGO = "/clinic-logo.png";

export function resolveClinicLogo(logoUri?: string | null): string {
  return logoUri?.trim() || DEFAULT_CLINIC_LOGO;
}
