// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const AuthChildRoutes: Routes = [
    { path: 'login', component: LoginComponent },
  
];
