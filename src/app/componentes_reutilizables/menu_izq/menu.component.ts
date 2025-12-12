import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InfoPacienteComponent } from "../info_paciente/info-paciente.component";
import { LoginService } from '../../services/login.service';
declare var $: any;
@Component({
  selector: 'app-menu-hospitalizacion',
  imports: [CommonModule, RouterModule, InfoPacienteComponent],
  templateUrl: './menu.component.html',
  styleUrl: `menu.component.css`,
})
export class MenuHospitalizacionComponent {
  private _router = inject(Router);
  public _loginService = inject(LoginService);

  seleccionarMenu() {
    $('#seleccionMenuModal').modal('show');
  }

  cerrarMenuModal() {
    $('#seleccionMenuModal').modal('hide');
  }

  irAnexos(){
    const hcu = this._loginService.getHcuLocalStorage()?.fk_hcu;
    if (hcu) {
      this._router.navigate(['/anexos', hcu]);
      this.cerrarMenuModal();
    }
  }
}
