import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EpicrisisService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;

  constructor() {}

  getAllEpicrisis(desde: number, hcu:number) {
    let url = `${this._baseUrl}/epicrisis/hosp/all/${hcu}?desde=${desde}`;

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service. - Listado Epicrisis',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getEpicrisisId(id: number, opcion: any) {
    const url = `${this._baseUrl}/epicrisis/hosp/id/${opcion}/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(ID) -Epicrisis',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  getFechasEpicrisis(hcu:number,fecha1:any,fecha2:any) {
    const url = `${this._baseUrl}/epicrisis/hosp/fechas/${hcu}/${fecha1}/${fecha2}`;
    console.log(url);

    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta en el Service.(Bsq) - Epicrisis Fechas',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  guardarEpicrisis(epicrisis: any, opcion: string) {
    const url = `${this._baseUrl}/epicrisis/hosp/${opcion}`;

    return this._http.post(url, epicrisis).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'No se pudo registrar Epicrisis.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

  impresionEpicrisisId(id: number) {
    const url = `${this._baseUrl}/epicrisis/hosp/rep_frame/${id}`;
    return this._http.get(url).pipe(
      map((resp: any) => {
        return resp;
      }),
      catchError((err) => {
        Swal.fire({
          title: '¡Error!',
          text: 'Operación incompleta al generar impresión -Epicrisis',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
        console.error('Error no controlado:', err);
        return of(err);
      })
    );
  }

   //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@ Diagnosticos @@@@@@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    getDiagnosticos(id_epicrisis: number) {
      let url = `${this._baseUrl}/epicrisis/diag/${id_epicrisis}`;
  
      return this._http.get(url).pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'Operación incompleta en el Service. - Listado Diagnosticos Epicrisis',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
    }
  
    guardarDiagnostico(diagnostico: any, opcion: string) {
      const url = `${this._baseUrl}/epicrisis/diag/${opcion}`;
  
      return this._http.post(url, diagnostico).pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo crear Diagnostico de Epicrisis.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
    }
  
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@     Medicos      @@@@@@@@@@@@@@@@@@@@@
    //@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
  
    getMedicos(id_epicrisis: number) {
      let url = `${this._baseUrl}/epicrisis/med/${id_epicrisis}`;
  
      return this._http.get(url).pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'Operación incompleta en el Service. - Listado Médicos Epicrisis',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
    }
  
    guardarMedicos(medico: any, opcion: string) {
      const url = `${this._baseUrl}/epicrisis/med/${opcion}`;
  
      return this._http.post(url, medico).pipe(
        map((resp: any) => {
          return resp;
        }),
        catchError((err) => {
          Swal.fire({
            title: '¡Error!',
            text: 'No se pudo registrar Médicos a la Epicrisis.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
          console.error('Error no controlado:', err);
          return of(err);
        })
      );
    }

    
}
