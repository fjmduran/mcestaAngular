import { ApiService } from 'src/app/services/api.service';
import { IUser } from 'src/app/models/IUser';
import { ICesta } from 'src/app/models/ICesta';
import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-cesta',
  templateUrl: './cesta.component.html',
  styleUrls: ['./cesta.component.css']
})
export class CestaComponent implements OnInit {

  public mForm: FormGroup;
  public movilForm: FormGroup;
  public cesta: ICesta = null;
  private user: IUser;
  public sendWhatsApp:SafeResourceUrl;

  constructor(private api:ApiService, public dialogRef: MatDialogRef<CestaComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
  private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {
    this.iconRegistry.addSvgIcon(
      "whatsapp",
      this.sanitizer.bypassSecurityTrustResourceUrl("assets/icons/whatsapp.svg")
    );
   }

  ngOnInit() {
    this.mForm = new FormGroup({
      id: new FormControl(null),
      nombre: new FormControl(null, [Validators.required]),
    });
    this.movilForm=new FormGroup({
      movil: new FormControl(null, [Validators.required, Validators.minLength(9)])
    });

    if (this.data.cesta==null) {
      this.cesta = { id: null, nombre: null, propietario:null, usuarios:null, grupos:null };
      this.mForm.setValue({
        id: null,
        nombre: null        
      });
    } else {
      this.cesta=this.data.cesta;
      this.mForm.setValue({
        id: this.cesta.id,
        nombre: this.cesta.nombre,
      });
    }
    if (this.data.user==null) {
      console.error("No se ha cargado el usuario");
    } else {
      this.user = this.data.user;
    }
  }

  public changeMovil():void{
    this.sendWhatsApp = this.sanitizer.bypassSecurityTrustUrl("whatsapp://send?text="+ this.cesta.id +"&phone=+34 " + this.movilForm.get("movil").value);
  }

  public Save(): void {    
    this.cesta.nombre = this.mForm.get('nombre').value;
    if (this.cesta.id==null) {
      //cesta nueva      
      this.cesta.propietario = this.user.email;
      this.cesta.usuarios = [];
      this.cesta.usuarios.push(this.user.email);
      this.cesta.grupos = [];
    }
    this.dialogRef.close(this.cesta);
  }
}
