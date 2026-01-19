import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;
  constructor() {}

  getPerfilByModulo(mod: number) {
    const url = `${this._baseUrl}/perfil/mod/${mod}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Perfil',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err); // ← devuelve observable, no error directo
      })
    );
  }

  getPerfilId(id: number) {
    const url = `${this._baseUrl}/perfil/id/${id}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(getPerfilId) - Perfil',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarperfil(perfil: any, opcion: string) {
    const url = `${this._baseUrl}/perfil/${opcion}`;

    return this._http.post(url, perfil).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear registro en perfil (guardarperfil).',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
