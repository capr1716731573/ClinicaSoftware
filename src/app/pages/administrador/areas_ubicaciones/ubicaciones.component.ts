import { Component , ViewChild} from '@angular/core';
import { AreasComponent } from './areas.component';
import { UbicacionComponent } from './ubicacion.component';
import { TipoUbicacionComponent } from './tipo-ubicacion.component';

@Component({
  selector: 'app-ubicaciones',
  imports: [AreasComponent,UbicacionComponent,TipoUbicacionComponent],
  templateUrl: './ubicaciones.component.html',
  styles: ``
})
export class UbicacionesComponent {
  @ViewChild(AreasComponent) areasComponent!: AreasComponent;
  @ViewChild(TipoUbicacionComponent) tipoUbicacionComponent!: TipoUbicacionComponent;
  @ViewChild(UbicacionComponent) ubicacionComponent!: UbicacionComponent;

  constructor(){

  }

  tabSeleccionado(tab: string) {
    if (tab === 'areas' && this.areasComponent) {
      this.areasComponent.inicializacion();
    } else if (tab === 'tipo_ubicacion' && this.tipoUbicacionComponent) {
      //this.casaSaludComponent.inicializacion();
    }else if (tab === 'ubicacion' && this.ubicacionComponent) {
      //this.casaSaludComponent.inicializacion();
    }
  }
}
