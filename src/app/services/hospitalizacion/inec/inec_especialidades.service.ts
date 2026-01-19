import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InecEspecialidadesService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllInecEspecialidades(desde: number, estado:any) {
    
    let url=`${this._baseUrl}/inec_espemed/all/${estado}`;
    if (desde === null){
      url = `${this._baseUrl}/inec_espemed/all/${estado}`;
    }else{
      url = `${this._baseUrl}/inec_espemed/all/${estado}?desde=${desde}`;
    }

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - INEC Especialidades Médicas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getAllInecEspecialidadesId(id: number) {
    const url = `${this._baseUrl}/inec_espemed/id/${id}`;
    console.log(url)
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - INEC Especialidades Médicas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqInecEspecialidades(estado:any,valor: string) {
    const url = `${this._baseUrl}/inec_espemed/bsq/${estado}/${valor}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - INEC Especialidades Médicas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarInecEspecialidades(institucion: any, opcion: string) {
    const url = `${this._baseUrl}/institucion/${opcion}`;

    return this._http.post(url, institucion).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear la Institución.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

 
}
