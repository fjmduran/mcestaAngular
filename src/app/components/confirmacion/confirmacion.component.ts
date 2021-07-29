import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css']
})
export class ConfirmacionComponent implements OnInit {

  public llave: string;
  public confirmacion:string;
  
  constructor(public dialogRef: MatDialogRef<ConfirmacionComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any) {}

 ngOnInit():void{
   if(this.data.llave!=null){
    this.llave=this.data.llave;        
   } 
 }

 goAhead(){
   this.dialogRef.close(true);
 }

}
