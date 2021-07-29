import { IUser } from "./../../models/IUser";
import { Component, NgZone } from "@angular/core";
import { AuthService } from "src/app/services/auth.service";
import { Router } from "@angular/router";
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidatorFn,
} from "@angular/forms";
import { Subscription } from "rxjs";
import { DomSanitizer } from "@angular/platform-browser";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconRegistry } from "@angular/material/icon";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent {
  public LoginForm: FormGroup;
  public SiginForm: FormGroup;
  public user: IUser;

  public spinnerOn: boolean = false;
  public sigin: boolean = false;
  public texto: string = "Acceso";
  private subs: Subscription[] = []; //declaro este objeto para poder anular la subscripción de añadir un nuevo usuario al salir de este componente

  public boolSpinner: boolean = false;
  public pwdIcon: string = "visibility_off";
  public pwdType: string = "password";

  constructor(
    private auth: AuthService,
    private ngZone: NgZone,
    private router: Router,
    private _snackBar: MatSnackBar,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer
  ) {
    this.iconRegistry.addSvgIcon(
      "google",
      this.sanitizer.bypassSecurityTrustResourceUrl("assets/icons/google.svg")
    );
  }

  ngOnInit() {
    this.LoginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      pwd: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
    this.SiginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      pwd: new FormControl(null, [
        Validators.required,
        Validators.minLength(8),
      ]),
      repite_pwd: new FormControl(null),
    });
    this.SiginForm.get("repite_pwd").setValidators([
      Validators.required,
      CustomValidators.equals(this.SiginForm.get("pwd")),
    ]);
    //Cargo el usuario almacenado en el localstorage, si no hay, cargo la página de inicio de sesión
    this.user = this.auth.getCurrentUser();
    if (!this.user) {
      this.ShowRegister(false);
    } else {
      this.router.navigate(["/home"]);
    }
  }

  public onLoginEmail(): void {
    this.boolSpinner = true;
    let email = this.LoginForm.get("email").value;
    let pwd = this.LoginForm.get("pwd").value;
    this.auth
      .loginFirebaseEmail(email, pwd)
      .then((res) => {
        console.log(res);

        //con este primer paso me he logueado en Firebase, ahora voy a obtener todos los datos de mi bbdd
        this.auth.logInEmail(email, pwd).subscribe(
          (data) => {
            if (data == null) {
              this.openSnackBar("Credenciales no válidas");
            } else {
              this.checkUser(res);
            }
          },
          (err) => {
            console.log(err);
          }
        );
        this.boolSpinner = false;
      })
      .catch((err) => {
        console.log(err);
        this.openSnackBar(
          "Las credenciales no son válidas o el usuario ya está registrado con la cuenta de Google"
        );
        this.boolSpinner = false;
      });
    this.spinnerOn = false;
  }

  onLoginGoogle(): void {
    this.boolSpinner = true;
    this.auth
      .loginGoogle()
      .then((res) => {
        this.checkUser(res);
        this.boolSpinner = false;
      })
      .catch((err) => {
        this.boolSpinner = true;
        console.log(err);
      });
  }

  checkUser(user: firebase.auth.UserCredential) {
    let usuario: IUser = {
      id: null,
      email: user.user.email,
      cesta: null,
      cestas: [],
    };
    const sub: Subscription = this.auth.checkUser(usuario).subscribe(
      (data) => {
        if (data.length == 0) {
          this.auth.saveUser(usuario);
        } else {
          this.auth.setUser(data[0]);
        }
        this.ngZone.run(() => this.router.navigate(["/home"])).then();
      },
      (err) => {
        console.log(err);
      }
    );
    this.subs.push(sub);
  }

  OnSigIn(): void {
    this.boolSpinner = true;
    this.user = this.SiginForm.value;
    this.auth
      .siginFirebaseEmail(this.user.email, this.user.pwd)
      .then((res) => {
        const sub: Subscription = this.auth.checkUser(this.user).subscribe(
          (data) => {
            if (data.length == 0) {
              this.auth.saveUser(this.user);
              this.router.navigate(["/home"]);
            } else {
              //si llego aquí es que se está intentando registrar un usuario que ya existe
              this.openSnackBar(
                "Este email ya está registrado en la plataforma."
              );
              this.sigin = false;
            }
            this.boolSpinner = false;
          },
          (err) => {
            this.boolSpinner = false;
            console.log(err);
          }
        );
        this.subs.push(sub);
      })
      .catch((err) => {
        this.boolSpinner = false;
        switch (err.code) {
          case "auth/email-already-in-use": {
            this.openSnackBar(
              "El email ya está registrado, pulse en el botón de IDENTIFÍCATE"
            );
            break;
          }

          default: {
            this.openSnackBar("No se ha podido registrar, inténtelo de nuevo");
          }
        }
        console.log(err);
      });
  }

  ngOnDestroy() {
    this.subs.forEach((sub) => {
      sub.unsubscribe();
    });
  }

  ShowRegister(b: boolean): void {
    this.sigin = b;
    if (this.sigin) this.texto = "Registro";
    else this.texto = "Accede";
  }

  public getErrorLogin(controlName: string): string {
    let error = "";
    const control = this.LoginForm.get(controlName);
    if (control == null) return;
    if (control.touched && control.errors != null) {
      //error = JSON.stringify(control.errors);
      switch (controlName) {
        case "email":
          error = "Introduce un email válido";
          break;
        case "pwd":
          error = "Mínimo 8 caracteres";
          break;
      }
    }
    return error;
  }

  public getErrorSigin(controlName: string): string {
    let error = "";
    const control = this.SiginForm.get(controlName);
    if (control == null) return;
    if (control.touched && control.errors != null) {
      //error = JSON.stringify(control.errors);
      switch (controlName) {
        case "email":
          error = "Introduce un email válido";
          break;
        case "pwd":
          error = "Mínimo 8 caracteres";
          break;
        case "repite_pwd":
          error = "Las claves no coinciden";
          break;
        case "nombre":
          error = "Debe de escribir su nombre";
          break;
      }
    }
    return error;
  }

  public changeVisibilidad(): void {
    if (this.pwdIcon == "visibility_off") {
      this.pwdIcon = "visibility";
      this.pwdType = "text";
    } else {
      this.pwdIcon = "visibility_off";
      this.pwdType = "password";
    }
  }

  openSnackBar(msg: string) {
    this._snackBar.open(msg, "", {
      duration: 10000,
    });
  }
}

function equalsValidator(otherControl: AbstractControl): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } => {
    const value: any = control.value;
    const otherValue: any = otherControl.value;
    return otherValue === value ? null : { notEquals: { value, otherValue } };
  };
}

export const CustomValidators = {
  equals: equalsValidator,
};
