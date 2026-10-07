import { Routes } from '@angular/router';
import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard';
import { TenantList } from './features/super-admin/tenants/tenant-list/tenant-list';
import { CategoryList } from './features/categories/category-list/category-list';
import { CategoryCreate } from './features/categories/category-create/category-create';
import { SuperAdminDashboard } from './features/super-admin/dashboard/super-admin-dashboard';
import { superAdminGuard } from './core/guards/super-admin.guard';
import { Layout } from './shared/layout/layout';
import { authGuard } from './core/guards/auth-guard';
import { TenantCreate } from './features/super-admin/tenants/tenant-create/tenant-create';
import { TenantDetail } from './features/super-admin/tenants/tenant-detail/tenant-detail';
import { BusinessCreate } from './features/super-admin/tenants/business-create/business-create';
import { BusinessDetail } from './features/super-admin/tenants/business-detail/business-detail';
import { BranchCreate } from './features/super-admin/tenants/business-detail/branch-create/branch-create';

export const routes: Routes = [
  {
  path: 'login',
  component: Login
},
  {
    path: ':tenantId/login',
    component: Login
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],

    children: [
{
  path: ':tenantId/dashboard',
  component: Dashboard
},
      {
        path: 'superadmin',
        component: Layout,
        canActivate: [superAdminGuard],
        children: [
          {
            path: '',
            component: SuperAdminDashboard
          },
          {
            path: 'tenants',
            component: TenantList
          },
          {
            path: 'tenants/create',
            component: TenantCreate
          },
          {
  path: 'tenants/:tenantId/businesses/:businessId/branches/create',
  component: BranchCreate
},
          {
            path: 'tenants/:tenantId/businesses/:businessId',
            component: BusinessDetail
          },
          {
            path: 'tenants/:id/businesses/create',
            component: BusinessCreate
          },
          {
            path: 'tenants/:id',
            component: TenantDetail
          }
        ]
      },
{
  path: ':tenantId/categories',
  component: CategoryList
},
{
  path: ':tenantId/categories/create',
  component: CategoryCreate
},
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
