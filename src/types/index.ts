// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Auth Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: UserStatus;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  roles?: Role[] | string[]; // Can be array of role objects or role slugs
  permissions?: string[]; // Array of permission strings like "USER.READ"
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  organizationType: OrganizationType;
  organizationName: string;
  registrationNumber: string;
  taxNumber?: string;
}

// Organization Types
export interface Organization {
  id: string;
  type: OrganizationType;
  status: OrganizationStatus;
  name: string;
  nameAr?: string;
  registrationNumber: string;
  taxNumber?: string;
  logo?: string;
  description?: string;
  descriptionAr?: string;
  email: string;
  phone: string;
  website?: string;
  address: any;
  industry: string[];
  licenseNumber?: string;
  licenseExpiry?: string;
  settings: any;
  metadata: any;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  users?: User[];
  roles?: Role[];
  _count?: {
    users: number;
    roles: number;
    jobRequests?: number;
    offers?: number;
    contractsAsEmployer?: number;
    contractsAsAgency?: number;
    workers?: number;
  };
}

// Job Types
export interface JobRequest {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: JobType;
  requirements: any;
  workersNeeded: number;
  duration: number;
  budgetAmount: number;
  budgetCurrency: string;
  location: any;
  startDate: string;
  endDate: string;
  status: JobRequestStatus;
  settings: any;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  employer: {
    id: string;
    name: string;
    logo?: string;
    address: any;
  };
  offers?: JobOffer[];
  _count?: {
    offers: number;
    acceptedOffers: number;
    contracts: number;
  };
}

export interface JobOffer {
  id: string;
  agencyId: string;
  agencyName: string;
  proposedRate: number;
  estimatedDelivery: number;
  status: string;
  createdAt: string;
}

// Role & Permission Types
export interface Role {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isSystem: boolean;
  organizationId?: string;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

// Enums
export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  PENDING = "PENDING",
  SUSPENDED = "SUSPENDED",
}

export enum OrganizationType {
  INTERNAL = "INTERNAL",
  CLIENT = "CLIENT",
}

export enum OrganizationStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  REJECTED = "REJECTED",
}

export enum JobType {
  CONSTRUCTION = "CONSTRUCTION",
  HOSPITALITY = "HOSPITALITY",
  FACILITY_MANAGEMENT = "FACILITY_MANAGEMENT",
  EVENTS = "EVENTS",
  RETAIL = "RETAIL",
  OTHER = "OTHER",
}

export enum JobRequestStatus {
  DRAFT = "DRAFT",
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  CLOSED = "CLOSED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

// Form Types
export interface CreateJobRequest {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: JobType;
  requirements: any;
  workersNeeded: number;
  duration: number;
  budget: number;
  currency: string;
  location: any;
  startDate: string;
  endDate: string;
  benefits?: string;
  settings?: any;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {
  status?: JobRequestStatus;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  roleIds: string[];
}

export interface UpdateUserRequest
  extends Partial<Omit<CreateUserRequest, "password">> {
  status?: UserStatus;
  isActive?: boolean;
}

export interface CreateOrganizationRequest {
  type: OrganizationType;
  name: string;
  nameAr?: string;
  registrationNumber: string;
  taxNumber?: string;
  email: string;
  phone: string;
  website?: string;
  address?: any;
  industry?: string[];
  licenseNumber?: string;
  licenseExpiry?: string;
  description?: string;
  descriptionAr?: string;
}

export interface UpdateOrganizationRequest
  extends Partial<CreateOrganizationRequest> {
  status?: OrganizationStatus;
  settings?: any;
}

// Test Configuration Types
export interface Language {
  code: string; // ISO 639-1 (ar, en, es)
  dialect: string; // dialect code (egyptian, gulf, etc.)
  name: string; // Human-readable name
}

export interface TestConfig {
  _id: string;
  name: string;
  agentEndpoint: string;
  agentType: string;
  language: Language;
  persona: string;
  scenarioTemplate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestConfigRequest {
  name: string;
  agentEndpoint: string;
  agentType?: string;
  language: Language;
  persona: string;
  scenarioTemplate: string;
  isActive?: boolean;
}

export interface UpdateTestConfigRequest
  extends Partial<CreateTestConfigRequest> {
  isActive?: boolean;
}

// Test Run Types
export interface TranscriptEntry {
  speaker: "user" | "agent";
  message: string;
  timestamp: string;
  audioUrl?: string;
  latency?: number;
}

export interface CallInfo {
  callSid?: string;
  duration?: number;
  status?: string;
  startedAt?: string;
  endedAt?: string;
}

export interface Evaluation {
  overallScore?: number; // 0-100
  grade?: "A" | "B" | "C" | "D" | "F";
  averageLatency?: number;
  taskCompleted?: number; // 0-100
  issues?: string[];
  metrics?: Record<string, any>;
}

export interface TestRun {
  _id: string;
  testConfigId: string;
  status: "pending" | "running" | "completed" | "failed";
  call?: CallInfo;
  transcripts: TranscriptEntry[];
  evaluation?: Evaluation;
  metadata?: Record<string, any>;
  error?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTestRunRequest {
  testConfigId: string;
}
