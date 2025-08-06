import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//Importar  libreria JS del template
declare function customInitFuntionsJs();
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'adminpro_base';

  constructor() {
    customInitFuntionsJs();
  }
}
