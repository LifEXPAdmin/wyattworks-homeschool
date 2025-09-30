/**
 * API Client for Export Requests
 *
 * Type-safe client for calling the export API
 */

import type { WorksheetConfig } from "./config";

/**
 * Export request payload
 */
export interface ExportRequest {
  config: WorksheetConfig;
  worksheetId?: string;
  title?: string;
  subtitle?: string;
  instructions?: string;
}

/**
 * Export response (success)
 */
export interface ExportResponse {
  success: true;
  cached: boolean;
  urls: {
    worksheet: string;
    answerKey: string;
  };
  exportId: string;
  quota?: {
    used: number;
    limit: number | "unlimited";
    remaining: number | "unlimited";
    plan: string;
    currentMonth: string;
  };
  createdAt?: Date;
}

/**
 * Export response (error)
 */
export interface ExportError {
  error: string;
  paywall?: boolean;
  quota?: {
    used: number;
    limit: number;
    remaining: number;
    plan: string;
    currentMonth: string;
  };
  details?: any;
}

/**
 * Quota information response
 */
export interface QuotaInfo {
  quota: {
    used: number | "unlimited";
    limit: number | "unlimited";
    remaining: number | "unlimited";
    plan: string;
    currentMonth: string;
  };
}

/**
 * Exports a worksheet as PDF
 *
 * @param request - Export request payload
 * @returns Export response with URLs or error
 *
 * @example
 * ```typescript
 * const result = await exportWorksheet({
 *   config: {
 *     subject: "math",
 *     type: "practice",
 *     options: { problemCount: 20 },
 *     seed: 12345,
 *   },
 *   title: "Math Practice",
 * });
 *
 * if (result.success) {
 *   window.open(result.urls.worksheet);
 * }
 * ```
 */
export async function exportWorksheet(
  request: ExportRequest
): Promise<ExportResponse | ExportError> {
  const response = await fetch("/api/export", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    return data as ExportError;
  }

  return data as ExportResponse;
}

/**
 * Gets current quota information
 *
 * @returns Quota information
 */
export async function getQuotaInfo(): Promise<QuotaInfo> {
  const response = await fetch("/api/export", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch quota information");
  }

  return response.json();
}

/**
 * Downloads a file from a URL
 *
 * @param url - File URL
 * @param filename - Desired filename
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
