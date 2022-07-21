import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  showAlert = false;
  alertMsg = 'Please wait! We are logging you in.';
  alertColor ='blue';
  inSubmission = false;

  credentials = {
    email: '',
    password: ''
  };

  constructor(private auth: AuthService) { }

  ngOnInit(): void {
  }

  async login() {
    this.showAlert = true;
    this.alertMsg = 'Please wait! We are logging you in.';
    this.alertColor ='blue';
    this.inSubmission = true;
    
    try {
      await this.auth.logUserIn(this.credentials);
        this.alertMsg = 'Sucess! You are now logged in.';
      this.alertColor ='green';
    } catch(e) {
      console.error(e);
      
      this.alertMsg = 'An unexpected error ocurred. Please try again later.';
      this.alertColor ='red';
      this.inSubmission = false;
      return;
    }
  }

}
