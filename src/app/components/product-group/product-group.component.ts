import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IProducto } from 'src/app/models/IProducto';
import { IGrupo } from 'src/app/models/IGrupo';
import { ApiService } from 'src/app/services/api.service';
import { ConfirmacionComponent } from '../confirmacion/confirmacion.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product-group',
  templateUrl: './product-group.component.html',
  styleUrls: ['./product-group.component.css']
})
export class ProductGroupComponent implements OnInit {

  public mForm: FormGroup;
  public producto: IProducto = null;
  private grupo: IGrupo = null;
  private idCesta: string;

  constructor(public dialog: MatDialog, private api: ApiService, public dialogRef: MatDialogRef<ProductGroupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.mForm = new FormGroup({
      id: new FormControl(null),
      nombre: new FormControl(null, [Validators.required]),            
    });

    //idCesta
    if (this.data.idCesta==null) {
      console.error("No se ha conseguido el idCesta");
    } else {
      this.idCesta = this.data.idCesta;
    }

    //grupo
    if (this.data.grupo==null) {
      console.error("No se ha conseguido el grupo");
    } else {
      this.grupo = this.data.grupo;
    }  

    //producto
    if (this.data.producto==null) {
      this.producto = { id: null, nombre: null, pendiente:false };
      this.mForm.setValue({
        id: null,
        nombre: null        
      });
    } else {
      this.producto = this.data.producto;
      this.mForm.setValue({
        id: this.producto.id,
        nombre: this.producto.nombre,        
      });      
    }
  }

  public Save(): void {    
    this.producto = this.mForm.value;
    
    if (this.producto.id==null) {
      //producto nuevo
      this.producto.id = new Date().getTime(); 
      this.producto.pendiente=true; //lo pongo a true, porque entiendo que si lo estoy añadiendo es que lo quiero pedir     
      if(this.grupo.productos==null) this.grupo.productos=[]
      this.grupo.productos.push(this.producto);
    } else {      
      let i:number=0;
      for (let p of this.grupo.productos) {
        if (p.id == this.producto.id) {
          p = this.producto;
          break;
        }
        i++;
      }
      this.grupo.productos[i]=this.producto;            
    }
    
    this.api.SaveGroup(this.grupo, this.idCesta);     
    this.openSnackBar('Producto guardado');
    this.dialogRef.close();
  }

  public Eliminar(): void {
    const dialogRef = this.dialog.open(ConfirmacionComponent, {
      width: '90%',
      data: { llave: 'eliminar' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result==null || result == []) return;
      if (result == true){
        this.EliminaProducto();
      } 
      this.dialog.closeAll();
    });
  }

  private EliminaProducto(): void {    
    const index = this.grupo.productos.indexOf(this.producto, 0);
    if (index > -1) {
      this.grupo.productos.splice(index, 1);      
      this.api.SaveGroup(this.grupo, this.idCesta);
      this.openSnackBar('Producto eliminado');
    }
  }
  
  public getError(controlName: string): string {
    let error = '';
    const control = this.mForm.get(controlName);
    if (control==null) return;
    if (control.touched && control.errors != null) {
      //error = JSON.stringify(control.errors);
      switch (controlName) {
        case 'nombre':
          error = 'Debe de escribir un título';
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
