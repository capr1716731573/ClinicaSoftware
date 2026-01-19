import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getMenuByPerfil(perfil: number) {
    const url = `${this._baseUrl}/menu/m_perfil/${perfil}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Menu no cargado correctamente. - Service(Menu)',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  getMenuByPerfilTodos(perfil: number) {
    const url = `${this._baseUrl}/menu/m_perfil2/todos/${perfil}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Menu no cargado correctamente. - Service(getMenuByPerfilTodos)',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  getMenuByPadre(padre: number) {
    const url = `${this._baseUrl}/menu/menu_perfil/padres/${padre}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Menu no cargado correctamente. - Service(Menu By Padres)',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  guardarMenu(menu: any, opcion: string) {
    const url = `${this._baseUrl}/menu/${opcion}`;

    return this._http.post(url, menu).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear registro en menu (guardarMenu).',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarMenuPerfil(menuPerfil: any, opcion: string) {
    const url = `${this._baseUrl}/menu/m_perfil2/${opcion}`;

    return this._http.post(url, menuPerfil).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear registro en menu (guardarMenuPerfil).',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
