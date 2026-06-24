import { getSettings } from "@/db/database";
import type { ClinicSettings, InvoiceDraft } from "@/types/billing";

export interface WhatsAppCloudConfig {
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
  utilityTemplateName?: string;
  utilityTemplateLanguage: string;
}

export interface WhatsAppSendResult {
  ok: boolean;
  error?: string;
  messageId?: string;
}

const DEFAULT_API_VERSION = "v21.0";

export function isWhatsAppConfigured(settings: ClinicSettings | null | undefined): boolean {
  return Boolean(
    settings?.whatsappEnabled &&
      settings.whatsappPhoneNumberId?.trim() &&
      settings.whatsappAccessToken?.trim(),
  );
}

export function getWhatsAppConfig(
  settings: ClinicSettings | null | undefined,
): WhatsAppCloudConfig | null {
  if (!isWhatsAppConfigured(settings)) return null;
  return {
    phoneNumberId: settings!.whatsappPhoneNumberId!.trim(),
    accessToken: settings!.whatsappAccessToken!.trim(),
    apiVersion: settings!.whatsappApiVersion?.trim() || DEFAULT_API_VERSION,
    utilityTemplateName: settings!.whatsappUtilityTemplateName?.trim() || undefined,
    utilityTemplateLanguage: settings!.whatsappUtilityTemplateLanguage?.trim() || "en",
  };
}

/** Normalize Indian phone → WhatsApp API `to` field (digits only, with country code). */
export function normalizeWhatsAppPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

function graphUrl(config: WhatsAppCloudConfig, path: string): string {
  return `https://graph.facebook.com/${config.apiVersion}/${path}`;
}

async function graphPost<T>(
  config: WhatsAppCloudConfig,
  path: string,
  body: FormData | Record<string, unknown>,
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const isForm = body instanceof FormData;
  const res = await fetch(graphUrl(config, path), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      ...(isForm ? {} : { "Content-Type": "application/json" }),
    },
    body: isForm ? body : JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as T & {
    error?: { message?: string; error_user_msg?: string };
  };

  if (!res.ok) {
    const msg =
      data?.error?.error_user_msg ||
      data?.error?.message ||
      `WhatsApp API error (${res.status})`;
    return { ok: false, error: msg };
  }

  return { ok: true, data };
}

async function uploadPdfMedia(
  config: WhatsAppCloudConfig,
  pdfBlob: Blob,
  filename: string,
): Promise<{ ok: boolean; mediaId?: string; error?: string }> {
  const form = new FormData();
  form.append("messaging_product", "whatsapp");
  form.append("type", "application/pdf");
  form.append("file", pdfBlob, filename);

  const result = await graphPost<{ id: string }>(
    config,
    `${config.phoneNumberId}/media`,
    form,
  );

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, mediaId: result.data?.id };
}

async function sendUtilityTemplate(
  config: WhatsAppCloudConfig,
  to: string,
  patientName: string,
  draft: InvoiceDraft,
  clinicName: string,
): Promise<WhatsAppSendResult> {
  if (!config.utilityTemplateName) {
    return { ok: false, error: "Utility template not configured in Admin → WhatsApp" };
  }

  const result = await graphPost<{ messages: { id: string }[] }>(
    config,
    `${config.phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: config.utilityTemplateName,
        language: { code: config.utilityTemplateLanguage },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: patientName },
              { type: "text", text: draft.invoiceId },
              { type: "text", text: `₹${draft.totals.grandTotal.toFixed(2)}` },
              { type: "text", text: clinicName },
            ],
          },
        ],
      },
    },
  );

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, messageId: result.data?.messages?.[0]?.id };
}

async function sendDocumentMessage(
  config: WhatsAppCloudConfig,
  to: string,
  mediaId: string,
  filename: string,
  caption: string,
): Promise<WhatsAppSendResult> {
  const result = await graphPost<{ messages: { id: string }[] }>(
    config,
    `${config.phoneNumberId}/messages`,
    {
      messaging_product: "whatsapp",
      to,
      type: "document",
      document: {
        id: mediaId,
        filename,
        caption,
      },
    },
  );

  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, messageId: result.data?.messages?.[0]?.id };
}

/**
 * Send invoice PDF to patient via WhatsApp Cloud API.
 * Does not open WhatsApp app — sends in the background.
 */
export async function sendInvoiceViaWhatsAppCloud(
  phone: string,
  patientName: string,
  draft: InvoiceDraft,
  pdfBlob: Blob,
  clinicName: string,
  settings?: ClinicSettings | null,
): Promise<WhatsAppSendResult> {
  const resolvedSettings = settings ?? (await getSettings());
  const config = getWhatsAppConfig(resolvedSettings);

  if (!config) {
    return {
      ok: false,
      error: "WhatsApp not configured. Ask admin to set up WhatsApp API in Admin settings.",
    };
  }

  const to = normalizeWhatsAppPhone(phone);
  if (!to) {
    return { ok: false, error: "Invalid phone number" };
  }

  const filename = `invoice-${draft.invoiceId}.pdf`;
  const caption = [
    `Dear ${patientName},`,
    `Invoice ${draft.invoiceId} from ${clinicName}.`,
    `Total: ₹${draft.totals.grandTotal.toFixed(2)}`,
    draft.totals.balance > 0
      ? `Balance due: ₹${draft.totals.balance.toFixed(2)}`
      : "Paid in full. Thank you!",
  ].join("\n");

  const upload = await uploadPdfMedia(config, pdfBlob, filename);
  if (!upload.ok || !upload.mediaId) {
    return { ok: false, error: upload.error ?? "Failed to upload PDF" };
  }

  let docResult = await sendDocumentMessage(config, to, upload.mediaId, filename, caption);

  // Business-initiated: Meta may require an approved utility template first
  if (!docResult.ok && config.utilityTemplateName) {
    const templateResult = await sendUtilityTemplate(
      config,
      to,
      patientName,
      draft,
      clinicName,
    );
    if (!templateResult.ok) return templateResult;

    docResult = await sendDocumentMessage(config, to, upload.mediaId, filename, caption);
  }

  return docResult;
}

/** Test connectivity with a minimal API call. */
export async function testWhatsAppCloudConnection(
  config: WhatsAppCloudConfig,
): Promise<{ ok: boolean; error?: string; displayPhone?: string }> {
  try {
    const res = await fetch(graphUrl(config, config.phoneNumberId), {
      headers: { Authorization: `Bearer ${config.accessToken}` },
    });
    const data = (await res.json()) as {
      display_phone_number?: string;
      error?: { message?: string };
    };
    if (!res.ok) {
      return { ok: false, error: data.error?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, displayPhone: data.display_phone_number };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Connection failed" };
  }
}
