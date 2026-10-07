import { BusinessType } from './business-type';
export interface Tenant {
  id: number;
  name: string;
  businessType: BusinessType;
  isActive: boolean;
  createdAt: string;
}