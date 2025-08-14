import { Component, ViewChild } from '@angular/core';
import { CasaSaludComponent } from './casa-salud.component';
import { InstitucionComponent } from './institucion.component';

@Component({
  selector: 'app-instituciones',
  standalone: true,
  imports: [InstitucionComponent,CasaSaludComponent],
  templateUrl: './instituciones.component.html',
  styles: ``,
})
export class InstitucionesComponent {
  @ViewChild(InstitucionComponent) institucionComponent!: InstitucionComponent;
  @ViewChild(CasaSaludComponent) casaSaludComponent!: CasaSaludComponent;

  constructor() {}

  tabSeleccionado(tab: string) {
    if (tab === 'institucion' && this.institucionComponent) {
      this.institucionComponent.getInstitucion();
    } else if (tab === 'casas_salud' && this.casaSaludComponent) {
      this.casaSaludComponent.inicializacion();
    }
  }
}
