import { AfterViewInit, Component, inject, Inject } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-paciente',
  imports: [CommonModule],
  templateUrl: './info-paciente.component.html',
  styles: ``
})
export class InfoPacienteComponent{
  private _loginService = inject(LoginService);

  hcu:any;

  constructor(){
    this.hcu=this._loginService.getHcuLocalStorage();
  }

}
