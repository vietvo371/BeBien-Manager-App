// types/EkycTypes.ts
export interface LogResult {
  logOcr?: string;
  logLivNessCardFront?: string;
  logLiveNessCardRear?: string;
  logCompare?: string;
  logLiveNessFace?: string;
  logMaskFace?: string;
}

export interface EkycBridge {
  startEkycFull(): Promise<string>;
  startEkycOcr(): Promise<string>;
  startEkycFace(): Promise<string>;
}

export interface EkycVerifyRequest {
  idCardFront: string;
  idCardBack: string;
  selfie: string;
  livenessVideo?: string;
  livenessImages?: string[];
}

export interface EkycVerifyResponse {
  status: boolean;
  message?: string;
  data?: {
    verified: boolean;
    confidence: number;
    idInfo?: {
      name?: string;
      idNumber?: string;
      dateOfBirth?: string;
      address?: string;
    };
  };
}