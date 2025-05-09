import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../shared/header/header.component";
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { BreadcrumbsComponent } from "../shared/breadcrumbs/breadcrumbs.component";

@Component({
  selector: 'app-contenedor',
  imports: [RouterOutlet,HeaderComponent, SidebarComponent, BreadcrumbsComponent],
  templateUrl: './contenedor.component.html',
  styles: ``
})
export class ContenedorComponent {

}
