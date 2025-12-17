import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroments';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { Router } from '@angular/router';
import { Usuario } from './usuario.interface';
import { SkeletonTableComponent } from '../../../componentes_reutilizables/skeleton/skeleton-table.component';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule, SkeletonTableComponent],
  templateUrl: './usuarios.component.html',
  styles: ``,
})
export class UsuariosComponent {
  usuariosList: any[] = [];
  bsqUsuario: string = '';
  opcion: string = 'I';
  desde: number = 0;
  usuarioBody: Usuario;
  usuario: any = {
    password1: '',
    password2: '',
  };
  intervalo = environment.filas;
  numeracion: number = 1;
  loading: boolean = true;
  private _usuarioService = inject(UsuarioService);
  private _routerService = inject(Router);

  constructor() {
    this.getAllUsuarios();
  }

  getAllUsuarios() {
    this.loading = true;
    this._usuarioService.getAllUsuario(this.desde).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.usuariosList = resp.rows;
          } else {
            this.desde -= this.intervalo;
            this.numeracion -= 1;
          }
        }
      },
      error: (err) => {
        this.loading = false;
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Usuarios - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getAllUsuarioBusqueda(bsq: string) {
    this.loading = true;
    this._usuarioService.getBsqUsuario(bsq).subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status === 'ok') {
          //Validacion para numeracion y parametro desde
          //Si resp.rows sea mayor a 0 se actualiza sino no
          if (resp.rows.length > 0) {
            this.usuariosList = resp.rows;
          } else {
            this.usuariosList = [];
          }
        }
      },
      error: (err) => {
        this.loading = false;
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Usuarios - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  buscarUsuario() {
    if (this.bsqUsuario.length >= 4) {
      this.getAllUsuarioBusqueda(this.bsqUsuario);
      // tu lógica aquí
    } else if (this.bsqUsuario.length === 0) {
      this.desde = 0;
      this.numeracion = 1;
      this.getAllUsuarios();
    }
  }

  avanzar() {
    this.desde += this.intervalo;
    this.numeracion += 1;
    this.getAllUsuarios();
  }

  retoceder() {
    this.desde -= this.intervalo;
    this.numeracion -= 1;
    this.getAllUsuarios();
  }

  nuevoUsuario() {
    this._routerService.navigate(['/usuario', 0]);
  }

  editarUsuario(pk_usuario: number) {
    this._routerService.navigate(['/usuario', pk_usuario]);
  }

  guardarPasswordUsuario() {
    {
      this.usuarioBody.password_usuario=this.usuario.password1;
      this._usuarioService
        .guardarUsuarioPassword(this.usuarioBody, 'U')
        .subscribe({
          next: (resp) => {
            this.opcion = `U`;
            if (resp.status && resp.status === 'ok') {
              toastr.success('Éxito', `Contraseña Actualizada`);
            } else {
              // manejo de error
              toastr.error('Error', `Problema al actualizar contraseña`);
            }
          },
          error: (err) => {
            // manejo de error
            toastr.error('Error', `${err} - Problema al actualizar contraseña 2`);
          },
        });
    }
  }

  cargarUsuario(item: any) {
    this.usuarioBody = item;
  }

  validarActualizarPassword() {
    if (
      !this.usuario ||
      !this.usuario.password1 ||
      this.usuario.password1 === '' ||
      this.usuario.password1 === undefined ||
      !this.usuario.password2 ||
      this.usuario.password2 === '' ||
      this.usuario.password2 === undefined
    ) {
      return false;
    } else {
      return true;
    }
  }
}
