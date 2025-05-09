import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { Grafica1Component } from './pages/grafica1/grafica1.component';
import { NopagefoundComponent } from './pages/nopagefound/nopagefound.component';
import { ContenedorComponent } from './pages/contenedor.component';

export const routes: Routes = [
  { path:'',
    component:ContenedorComponent,
    children:[
      { path: 'dashboard', component: DashboardComponent },
      { path: 'progress', component: ProgressComponent },
      { path: 'grafica1', component: Grafica1Component },
      { path: '', redirectTo:'/dashboard', pathMatch:'full' },
    ]
  },
 
  { path: 'login', component: LoginComponent },
  
  
  { path: '**', component: NopagefoundComponent },
];
