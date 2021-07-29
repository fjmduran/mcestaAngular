import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { IUser } from 'src/app/models/IUser';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  public ProfileForm: FormGroup;
  public user: IUser;

  constructor(private auth: AuthService, private _snackBar: MatSnackBar, private router: Router) { }

  ngOnInit() {
    this.ProfileForm = new FormGroup({
      id: new FormControl(null),
      email: new FormControl(null, [Validators.required, Validators.email]),
    });

    //Cargo el usuario almacenado en el localstorage
    this.user = this.auth.getCurrentUser();
    this.ProfileForm.setValue({
      id: this.user.id,
      email: this.user.email,
    });
  }

  public saveUser(): void {
    this.user = this.ProfileForm.value;
    this.auth.saveUser(this.user);
    this.openSnackBar('Usuario guardado');
  }

  public getError(controlName: string): string {
    let error = '';
    const control = this.ProfileForm.get(controlName);
    if (control==null) return;
    if (control.touched && control.errors != null) {
      switch (controlName) {
        case 'email':
          error = 'Introduce un email válido';
          break;
      }
    }
    return error;
  }

  async cierraSesion(): Promise<void> {
    await this.auth.logOut();    
    this.router.navigate(['/login'])
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, '', {
      duration: 5000,
    });
  }

}