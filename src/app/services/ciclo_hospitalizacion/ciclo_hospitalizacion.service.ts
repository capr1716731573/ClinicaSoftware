import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class CicloHospitalizacionService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {
    this._baseUrl=`${this._baseUrl}/censo`;
  }

  getIngresosXHcuVigente(hcu: number) {
    let url = `${this._baseUrl}/hcu/${hcu}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Historico X Paciente',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getIngresosXAreaPiso(area: number) {
    let url = `${this._baseUrl}/area/${area}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Censo por Área',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getIngresosXAreaTorrePisoSala(area: any, torre: any, piso: any, sala: any) {
    let url = `${this._baseUrl}/total/${area}/${torre}/${piso}/${sala}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Censo por Área,Torre,Piso,Sala',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

 getPacienteHospitalizado(identificacion: string) {
    const url = `${this._baseUrl}/paciente_ingresado/${identificacion}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - getPacienteHospitalizado',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getCensoXId(id: number) {
    const url = `${this._baseUrl}/id/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) - Censo ID',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  crudCicloHospitalizacion(ciclo: any, opcion: string) {
    const url = `${this._baseUrl}/${opcion}`;

    return this._http.post(url, ciclo).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo crear Ciclo de Hospitalización.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }
}
