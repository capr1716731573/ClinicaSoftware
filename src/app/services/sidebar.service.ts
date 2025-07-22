import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../enviroments/enviroments';
import { catchError, map } from 'rxjs';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly _http = inject(HttpClient);
  private _baseUrl = environment.apiUrl;
  constructor() {}

  getMenuByPerfil(perfil:number){
    const url = `${this._baseUrl}/menu/m_perfil/${perfil}`;
    return this._http.get(url).pipe(
              map((resp: any) => {
                
                return resp;
              }),
              catchError(err => {
                Swal.fire({
                  title: '¡Error!',
                  text: 'Menu no cargado correctamente. - Service(Sidebar)',
                  icon: 'error',
                  confirmButtonText: 'Aceptar'
                });
                console.error('Error no controlado:', err);
                return of(err); // ← devuelve observable, no error directo
              })
            );
  }

  menu: any[] = [
    {
      titulo: 'Principal',
      icono: 'mdi mdi-gauge',
      submenu: [
        { titulo: 'Main', url: '/' },
        { titulo: 'ProgressBar', url: '/progress' },
        { titulo: 'Gráficas', url: '/grafica1' },
        { titulo: 'Promesas', url: '/promesas' },
        { titulo: 'Rxjs', url: '/rxjs' },
      ],
    },
  ];
}
