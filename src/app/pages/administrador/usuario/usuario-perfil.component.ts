import {
  AfterViewInit,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../services/usuario/usuario.service';
import { PersonaService } from '../../../services/persona/persona.service';
import { Usuario } from './usuario.interface';
import { CommonModule } from '@angular/common';
import { PersonaComponent } from '../persona/persona.component';
import { FormsModule } from '@angular/forms';
import { Persona } from '../persona/persona.interface';
import Swal from 'sweetalert2';
import { ModuloService } from '../../../services/modulo.service';
import { PerfilService } from '../../../services/perfil.service';
import { NgSelectModule } from '@ng-select/ng-select';
declare var toastr: any;
declare var $: any;

@Component({
  selector: 'app-usuario-perfil',
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './usuario-perfil.component.html',
  styles: ``,
})
export class UsuarioPerfilComponent {
  modulosList: any[] = [];
  perfilesList: any[] = [];
  perfilesUsuarioList: any[] = [];
  id_modulo = null;
  id_perfil = null;
  id_usuario = null;
  private _usuarioService = inject(UsuarioService);
  private _modulosService = inject(ModuloService);
  private _perfilService = inject(PerfilService);

  constructor() {}

  inicializacionPerfilesUsuario(id_usuario: number) {
    this.id_usuario = id_usuario;
    this.getModulos();
    if (id_usuario != 0) {
      this.getPerfilesUsuario(id_usuario);
    }
  }

  getModulos() {
    this._modulosService.getAllModulos().subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.modulosList = resp.rows;
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

  getPerfiles(idMod: number) {
    this._perfilService.getPerfilByModulo(idMod).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.perfilesList = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Perfíl - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  getPerfilesUsuario(id_usuario: number) {
    this._usuarioService.getPerfilesUsuario(id_usuario).subscribe({
      next: (resp) => {
        if (resp.status === 'ok') {
          this.perfilesUsuarioList = resp.rows;
        }
      },
      error: (err) => {
        // manejo de error
        Swal.fire({
          title: '¡Error!',
          icon: 'error',
          text: `Perfíl X Usuario - ${err.message}`,
          confirmButtonText: 'Aceptar',
        });
      },
    });
  }

  agregarPerfil() {
    let perfilUsuario = {
      pk_usuarioperfil: 0,
      fk_usuario: this.id_usuario,
      fk_perfil: this.id_perfil,
    };
    this._usuarioService.guardarPerfilUsuario(perfilUsuario, 'I').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', `Perfíl asignado al usuario`);
          this.getPerfilesUsuario(this.id_usuario);
        } else {
          // manejo de error
          toastr.error(
            'Error',
            `Problema al asignar perfíl verifique que no este duplicado`
          );
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al asignar perfíl`);
      },
    });
  }

  eliminarPerfil(usuarioPerfil: any) {
    this._usuarioService.guardarPerfilUsuario(usuarioPerfil, 'D').subscribe({
      next: (resp) => {
        if (resp.status && resp.status === 'ok') {
          toastr.success('Éxito', `Perfíl del usuario eliminado`);
          this.getPerfilesUsuario(this.id_usuario);
        } else {
          // manejo de error
          toastr.error('Error', `Problema al eliminar perfíl del usuario`);
        }
      },
      error: (err) => {
        // manejo de error
        toastr.error('Error', `${err} - Problema al eliminar perfíl`);
      },
    });
  }
}
