export type IntegrationStatus = "PENDIENTE" | "ENVIADO" | "ERROR";

export type MovementIntegrationPayload = {
  movimientoId: string;
  folio: string;
  tipoMovimiento: "INGRESO" | "EGRESO";
  fechaMovimiento: string;
  monto: number;
  categoria: string;
  concepto: string;
  referente?: string | null;
  recibidoPor?: string | null;
  entregadoPor?: string | null;
  beneficiario?: string | null;
  medioPago?: string | null;
  numeroRespaldo?: string | null;
  observaciones?: string | null;
  registradoPor: string;
  registradoEmail: string;
  registradoEn: string;
  nombreOrganizacion?: string | null;
  /** @deprecated use tipoMovimiento */ tipo?: "INGRESO" | "EGRESO";
  /** @deprecated use fechaMovimiento */ fecha?: string;
  /** @deprecated use concepto */ descripcion?: string;
  /** @deprecated use registradoPor */ usuario?: string;
};

export type AppsScriptResponse = {
  ok: boolean;
  message?: string;
  pdfUrl?: string;
  driveFileId?: string;
  sheetSynced?: boolean;
  mailSent?: boolean;
  error?: string;
};
