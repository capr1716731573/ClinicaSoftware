// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { Grafica1Component } from './grafica1/grafica1.component';
import { ContenedorComponent } from './contenedor.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';

export const pagesChildRoutes: Routes = [
    { path:'',
        component:ContenedorComponent,
        children:[
            { path: 'dashboard', component: DashboardComponent },
            { path: 'progress', component: ProgressComponent },
            { path: 'grafica1', component: Grafica1Component },
            { path: 'settings', component: AccountSettingsComponent },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        ]
      },
  
];
