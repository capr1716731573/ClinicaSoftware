import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [RouterModule,FormsModule],
  templateUrl: './login.component.html',
  styleUrls:['./login-component.css']
})
export class LoginComponent {
  private router = inject(Router);
  constructor(){

  }

  login(){
    this.router.navigateByUrl('/');
  }
}
