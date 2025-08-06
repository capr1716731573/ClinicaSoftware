import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';
import { ModuloService } from '../../services/modulo.service';
import { PerfilService } from '../../services/perfil.service';

@Component({
  selector: 'app-login',
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login-component.css'],
})
export class LoginComponent {
  private router = inject(Router);
  private _loginService = inject(LoginService);
  private _modulosService = inject(ModuloService);
  private _perfilService = inject(PerfilService);
  username: string = '';
  password: string = '';
  modulo: number = 0;
  perfil: number = 0;
  listModulos: any[] = [];
  listPerfil: any[] = [];

  constructor() {
    this.getModulos();
  }

  login() {
    this._loginService.login(this.username, this.password).subscribe({
      next: (resp) => {
        if (resp) {
          if (resp.status === 'ok') {
            //console.log(resp);

            //Valido que el usuario tenga estado true para ingresar
            if (resp.usuario.estado_usuario === false) {
              Swal.fire({
                title: 'No Activo',
                text: `El usuario no se encuentra activo, refierase al administrador del sistema para la activación`,
                icon: 'warning',
                confirmButtonText: 'Aceptar',
              });
              return;
            }

            let token = resp.token;
            let usuario = resp.usuario;

            //Consulto el perfil y el modulo seleccionado con el usuario
            this._loginService
              .verificarUsuarioPerfilModulo(
                resp.usuario.pk_usuario,
                this.perfil,
                this.modulo
              )
              .subscribe({
                next: (resp) => {
                  //console.log(resp);
                  if (resp) {
                    if (resp.rows.verificar_usuario_perfil.status === 'ok') {
                      //Verifico que exista el usuario con ese perfil y ese modulo
                      if (resp.rows.verificar_usuario_perfil.rows > 0) {
                        Swal.fire({
                          title: 'Bienvenido!',
                          text: `Sesión Iniciada`,
                          icon: 'success',
                          confirmButtonText: 'Aceptar',
                        });

                        this._loginService.setLoginLocalStorage(token);
                        this._loginService.setUserLocalStorage(usuario);
                        this._loginService.setPerfilLocalStorage(this.perfil);
                        //Navego a la ruta del dashboard
                        this.router.navigateByUrl('/');
                      } else {
                        // manejo de error
                        Swal.fire({
                          title: '¡Error!',
                          icon: 'error',
                          text: `El usuario no tiene permisos en el menu asignado`,
                          confirmButtonText: 'Aceptar',
                        });
                      }
                    } else {
                      // manejo de error
                      Swal.fire({
                        title: '¡Error!',
                        icon: 'error',
                        text: `Verificación de Perfil - ${resp.mensaje}`,
                        confirmButtonText: 'Aceptar',
                      });
                    }
                  }
                },
              });
          } else {
            // manejo de error
            Swal.fire({
              title: '¡Error!',
              text: `Credenciales Invalidas - ${resp.mensaje}`,
              icon: 'error',
              confirmButtonText: 'Aceptar',
            });
          }
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          text: `Credenciales Invalidas - ${err.message}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getModulos() {
    this._modulosService.getAllModulos().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.listModulos = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Módulo - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  seleccionarModulo() {
    if (this.modulo == 0) {
      this.listPerfil = [];
      return;
    }
    this._perfilService.getPerfilByModulo(this.modulo).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          console.log(resp.rows);
          this.listPerfil = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          text: `Seleccionar Módulo - ${err.message}`,
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        this.listPerfil = [];
      },
    });
  }
}
