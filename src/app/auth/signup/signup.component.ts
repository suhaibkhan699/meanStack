import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onSignUp(form: NgForm) {
    if (form.status === 'VALID') {
      this.authService.createUser(form.value.email, form.value.password)
    } else {
      return
    }
  }

}
