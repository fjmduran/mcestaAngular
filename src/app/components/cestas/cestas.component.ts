import { ICesta } from 'src/app/models/ICesta';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { IUser } from './../../models/IUser';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CestaComponent } from '../cesta/cesta.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-cestas',
  templateUrl: './cestas.component.html',
  styleUrls: ['./cestas.component.css']
})
export class CestasComponent implements OnInit {

  public user:IUser;
  public msgEmpty:string='No hay cestas';
  public codInv:string="";

  private subs$: Subscription[]=[];
  private cesta$: Subscription;
  private cesta:ICesta;

  constructor(private auth:AuthService, private api:ApiService, private router: Router, private snackBar: MatSnackBar, public dialog: MatDialog) { }

  ngOnInit() {
    this.user=this.auth.getCurrentUser();
    if(this.user==null){
      this.router.navigate(['/login']);
      return;
    }
    if(this.user.cestas==null){
      this.user.cestas=[];    
    }else{

    }
  }

  public openCesta(cesta:ICesta):void{
    const dialogRef = this.dialog.open(CestaComponent, {
      width: '90%',  
      data: { cesta: cesta, user:this.user }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result==null || result == []) return;
      let cesta:ICesta=result;
      let nueva:boolean;
      if(cesta.id==null) nueva=true;
      cesta.id=this.api.SaveCesta(cesta); 
      if(this.user.cesta==null) this.user.cesta=cesta;
      if(nueva){
        this.user.cestas.push(cesta);
      }else{
        if(this.user.cesta.id==cesta.id) this.user.cesta=cesta;
        this.user.cestas.forEach(c=>{
          if(cesta.id==c.id){
            return c=cesta;
          }
        });
      }
      this.auth.saveUser(this.user);
    });
    
  }

  public saveCod():void{
    this.cesta$=this.api.GetCesta(this.codInv).subscribe(data=>{
      this.cesta=data;
      if(this.cesta!=null){
        this.user.cesta=this.cesta;        
        this.user.cestas.push(this.cesta);
        this.auth.setUser(this.user);
        this.auth.saveUser(this.user);
      }else{
        this.openSnackBar("El código de validación no es válido.");
      }
    });
    this.subs$.push(this.cesta$);
  }

  private openSnackBar(msg: string):void {
    this.snackBar.open(msg, '', {
      duration: 5000,
    });
  }

  ngOnDestroy():void{
    for(let s of this.subs$){
      s.unsubscribe();
    }
  }
}
