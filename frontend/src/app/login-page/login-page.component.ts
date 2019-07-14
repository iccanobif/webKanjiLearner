import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent {

  username: string

  constructor(private router: Router) { }

  onSubmit() {
    // alert(this.username + " vuole loggarsi")
    this.router.navigate([this.username])
  }
}
