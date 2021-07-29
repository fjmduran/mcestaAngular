import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IGrupo } from 'src/app/models/IGrupo';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  public mForm: FormGroup;
  public grupo: IGrupo = { id: null, nombre: null, orden: 0, productos:null };
  private idCesta: string;

  constructor(private api: ApiService, public dialogRef: MatDialogRef<GroupComponent>, @Inject(MAT_DIALOG_DATA) public data: any, 
  private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.mForm = new FormGroup({
      id: new FormControl(null),
      nombre: new FormControl(null, [Validators.required]),      
      orden: new FormControl(null, [Validators.required]),
    });

    if (this.data.idCesta==null) {
      console.log("No se ha conseguido el idCesta");
    } else {
      this.idCesta = this.data.idCesta;
    }

    if (this.data.grupo==null) {
      this.grupo = { id: null, nombre: null, orden: null, productos:null }
      this.mForm.setValue({
        id: null,
        nombre: null,
        orden: null        
      });
    } else {
      this.grupo = this.data.grupo;
      this.mForm.setValue({
        id: this.grupo.id,
        nombre: this.grupo.nombre,
        orden: this.grupo.orden
      });
    }
  }

  public Save(): void {
    this.grupo = this.mForm.value;
            
    this.api.SaveGroup(this.grupo, this.idCesta);    

    this.openSnackBar('Grupo guardado');
    this.dialogRef.close();
  }

  public getError(controlName: string): string {
    let error = '';
    const control = this.mForm.get(controlName);
    if (control==null) return;
    if (control.touched && control.errors != null) {
      //error = JSON.stringify(control.errors);
      switch (controlName) {
        case 'nombre':
          error = 'Debe de escribir un nombre para el grupo';
          break;
        case 'orden':
          error = 'Debe dar un orden de posición';
          break;
      }
    }
    return error;
  }

  openSnackBar(msg: string) {
    this.snackBar.open(msg, '', {
      duration: 5000,
    });
  }
}
