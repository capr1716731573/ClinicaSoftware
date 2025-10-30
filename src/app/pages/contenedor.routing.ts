// src/app/pages/pages.routes.ts
import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProgressComponent } from './progress/progress.component';
import { Grafica1Component } from './grafica1/grafica1.component';
import { ContenedorComponent } from './contenedor.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { JwtGuard } from '../guards/jwt.guard';
import { CabeceraComponent } from './administrador/cabecera/cabecera.component';
import { CabeceraDetalleComponent } from './administrador/cabecera-detalle/cabecera-detalle.component';
import { GeografiaComponent } from './administrador/geografia/geografia.component';
import { MenuComponent } from './administrador/menu/menu.component';
import { UsuariosComponent } from './administrador/usuario/usuarios.component';
import { UsuarioComponent } from './administrador/usuario/usuario.component';
import { InstitucionesComponent } from './administrador/institucion-salud/instituciones.component';
import { CieComponent } from './administrador/cie/cie.component';
import { EspecialidadMedicoComponent } from './administrador/especialidad_medico/especialidad-medico.component';
import { UbicacionesComponent } from './administrador/areas_ubicaciones/ubicaciones.component';
import { HistoriasComponent } from './componentes_medicos/historia_clinica/historias.component';
import { HistoriaClinicaComponent } from './componentes_medicos/historia_clinica/historia-clinica.component';
import { CensoareasComponent } from './componentes_medicos/ciclo_hospitalizacion/censoareas.component';
import { Lista008Component } from './componentes_medicos/emergencia/lista008.component';
import { Formulario008Component } from './componentes_medicos/emergencia/formulario008.component';
import { InicioComponent } from './componentes_medicos/hospitalizacion/inicio/inicio.component';
import { EvolucionComponent } from './componentes_medicos/hospitalizacion/evoluciones/evolucion.component';
import { EpicrisisComponent } from './componentes_medicos/hospitalizacion/epicrisis/epicrisis.component';
import { FormEpicrisisComponent } from './componentes_medicos/hospitalizacion/epicrisis/form-epicrisis.component';

export const pagesChildRoutes: Routes = [
    { path:'',
        component:ContenedorComponent,
        children:[
            { path: 'dashboard', canActivate: [JwtGuard],component: DashboardComponent, data:{titulo: 'Dashboard'} },
            { path: 'progress', canActivate: [JwtGuard],component: ProgressComponent ,data:{titulo: 'ProgressBar'}},
            { path: 'grafica1', canActivate: [JwtGuard],component: Grafica1Component ,data:{titulo: 'Graficas JS ChartsJS'}},
            { path: 'settings', canActivate: [JwtGuard],component: AccountSettingsComponent ,data:{titulo: 'Configuraciones Temas'}},
            { path: 'promesas', canActivate: [JwtGuard],component: PromesasComponent ,data:{titulo: 'Promesas'}},
            { path: 'rxjs', canActivate: [JwtGuard],component: RxjsComponent ,data:{titulo: 'Observable'}},

            //Aplicacion Base
            { path: 'cabecera', canActivate: [JwtGuard],component: CabeceraComponent ,data:{titulo: 'Maestro'}},
            { path: 'detalle', canActivate: [JwtGuard],component: CabeceraDetalleComponent ,data:{titulo: 'Detalle'}},
            { path: 'geografia', canActivate: [JwtGuard],component: GeografiaComponent ,data:{titulo: 'Geografía'}},
            { path: 'menu-perfil', canActivate: [JwtGuard],component: MenuComponent ,data:{titulo: 'Opciones'}},
            { path: 'usuarios', canActivate: [JwtGuard],component: UsuariosComponent ,data:{titulo: 'Usuarios'}},
            { path: 'usuario/:id', canActivate: [JwtGuard],component: UsuarioComponent ,data:{titulo: 'Usuario'}},
            { path: 'instituciones', canActivate: [JwtGuard],component: InstitucionesComponent ,data:{titulo: 'Instituciones-Casas Salud'}},
            { path: 'cie', canActivate: [JwtGuard],component: CieComponent ,data:{titulo: 'Cie Diagnósticos'}},
            { path: 'especialidades_medicos', canActivate: [JwtGuard],component: EspecialidadMedicoComponent ,data:{titulo: 'Especialidades - Médicos'}},
            { path: 'ubicaciones', canActivate: [JwtGuard],component: UbicacionesComponent ,data:{titulo: 'Ubicaciones'}},

            // Componentes Medicos
            { path: 'hcu', canActivate: [JwtGuard],component: HistoriasComponent ,data:{titulo: 'Historias Clínicas'}},
            { path: 'hcu/:id', canActivate: [JwtGuard],component: HistoriaClinicaComponent ,data:{titulo: 'Historia Clínica'}},
            { path: 'censo', canActivate: [JwtGuard],component: CensoareasComponent ,data:{titulo: 'Hospitalizaciones (Censo)'}},
            { path: 'emergencia', canActivate: [JwtGuard],component: Lista008Component ,data:{titulo: 'Emergencia'}},
            { path: 'emergencia/:id', canActivate: [JwtGuard],component: Formulario008Component ,data:{titulo: 'Formulario 008'}},

            //Hospitalizacion
            { path: 'hospitalizacion_inicio', canActivate: [JwtGuard],component: InicioComponent ,data:{titulo: 'Hospitalización'}},
            { path: 'evolucion', canActivate: [JwtGuard],component: EvolucionComponent ,data:{titulo: 'Evoluciones'}},
            { path: 'epicrisis', canActivate: [JwtGuard],component: EpicrisisComponent ,data:{titulo: 'Epicrisis'}},
            { path: 'form_epicrisis/:id/:accion', canActivate: [JwtGuard],component: FormEpicrisisComponent ,data:{titulo: 'Epicrisis'}},

            { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
        ]
      },
  
];
