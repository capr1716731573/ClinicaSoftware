import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class EspecialidadMedicoService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllEspecialidadMedico(desde: number) {
    let url;
    if (desde === null){
      url = `${this._baseUrl}/especilidades_medicos`;
    }else{
      url = `${this._baseUrl}/especilidades_medicos/?desde=${desde}`;
    }

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - getAllEspecialidadMedico',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getAllEspecialidadMedicoId(id: number) {
    const url = `${this._baseUrl}/especilidades_medicos/id/${id}`;
    console.log(url)
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - getAllEspecialidadMedicoId',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getBsqEspecialidadMedico(bsq: string) {
    const url = `${this._baseUrl}/especilidades_medicos/bsq/${bsq}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - getBsqEspecialidadMedico',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarEspecialidadMedico(espe_med: any, opcion: string) {
    const url = `${this._baseUrl}/especilidades_medicos/${opcion}`;

    return this._http.post(url, espe_med).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear la Especialidad Médico.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

 
}
