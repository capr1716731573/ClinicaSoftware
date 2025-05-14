// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { Grafica1Component } from './grafica1/grafica1.component';
import { ContenedorComponent } from './contenedor.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';

export const pagesChildRoutes: Routes = [
    { path:'',
        component:ContenedorComponent,
        children:[
            { path: 'dashboard', component: DashboardComponent, data:{titulo: 'Dashboard'} },
            { path: 'progress', component: ProgressComponent ,data:{titulo: 'ProgressBar'}},
            { path: 'grafica1', component: Grafica1Component ,data:{titulo: 'Graficas JS ChartsJS'}},
            { path: 'settings', component: AccountSettingsComponent ,data:{titulo: 'Configuraciones Temas'}},
            { path: 'promesas', component: PromesasComponent ,data:{titulo: 'Promesas'}},
            { path: 'rxjs', component: RxjsComponent ,data:{titulo: 'Observable'}},
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        ]
      },
  
];
