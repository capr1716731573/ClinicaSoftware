import { Component } from '@angular/core';
import { GraficasComponent } from "../../componentes_reutilizables/graficas/graficas.component";

@Component({
  selector: 'app-grafica1',
  imports: [GraficasComponent],
  templateUrl: './grafica1.component.html',
  styles: ``
})
export class Grafica1Component {
    labels=['Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre'];
    valores=[110,150,95,254,122];
}
