import { Routes } from '@angular/router';
import { NopagefoundComponent } from './nopagefound/nopagefound.component';
import { pagesChildRoutes } from './pages/contenedor.routing';
import { AuthChildRoutes } from './auth/auth.rouing';

export const routes: Routes = [
 
  //Aqui se migra las rutas Hijas para no acumular dentro de este archivo
  ...pagesChildRoutes,
  ...AuthChildRoutes,  
  
  { path: '**', component: NopagefoundComponent },
];
