import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { InfoPacienteComponent } from "../info_paciente/info-paciente.component";
declare var $: any;
@Component({
  selector: 'app-menu-hospitalizacion',
  imports: [CommonModule, RouterModule, InfoPacienteComponent],
  templateUrl: './menu.component.html',
  styleUrl: `menu.component.css`,
})
export class MenuHospitalizacionComponent {
  private _router = Inject(Router);

  seleccionarMenu() {
    $('#seleccionMenuModal').modal('show');
  }

  cerrarMenuModal() {
    $('#seleccionMenuModal').modal('hide');
  }
}
