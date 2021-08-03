import { AuthService } from './../../services/auth.service';
import { IUser } from 'src/app/models/IUser';
import { IProducto } from './../../models/IProducto';
import { SelectProductsListComponent } from './../select-products-list/select-products-list.component';
import { IGrupo } from './../../models/IGrupo';
import { ICesta } from './../../models/ICesta';
import { ApiService } from './../../services/api.service';
import { Component, NgZone, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private subscriptions: Subscription[]=[];
  private $cesta:Subscription;
  public cesta:ICesta;
  private $grupos:Subscription;  
  private grupos:IGrupo[]=[];
  private productos:IProducto[]=[];
  public pendientes:IProducto[]=[];
  public prodChecked:IProducto[]=[];
  public spinnerOn:boolean=true;
  private idCesta:string;
  private user:IUser;
  public msgEmpty:string='La cesta está vacía';
  
  constructor(private auth:AuthService, private api:ApiService, public dialog: MatDialog, private router: Router,private ngZone: NgZone) { }

  ngOnInit() {
    this.user=this.auth.getCurrentUser();
    if(this.user==null){
      this.router.navigate(['/login']);
      return;
    } 

    this.auth.afsAuth.onAuthStateChanged((user) => {
      if (!user) {
        this.ngZone.run(() => {
          this.router.navigateByUrl("/auth");
        });
        return;
      } else {
        this.loadCesta();
      }
    });
    
  }

  private loadCesta():void{
    if(this.user.cesta==null){
      //no hay cesta predeterminada, abro la pantalla de listado de cestas
      this.router.navigate(['/cestas']);
    }else{
      this.idCesta=this.user.cesta.id;
      this.$cesta=this.api.GetCesta(this.user.cesta.id).subscribe(data=>{
        this.cesta=data;
      });
      this.subscriptions.push(this.$cesta);
  
      this.$grupos=this.api.GetGruposCesta(this.idCesta).subscribe(data=>{
        this.grupos=data;
        this.grupos=this.grupos.sort((a,b)=>{
          return a.orden - b.orden;
        });
        this.productos=[];
        this.pendientes=[];
        for(let g of this.grupos){        
          if(g.productos!=null){
            let prod:IProducto[]=g.productos;
            let pend:IProducto[]=g.productos;
  
            //Filtro los productos que no están pendientes para el FAB
            prod=prod.filter(p=>{
              p.idGrupo=g.id; //añado a cada producto su idgrupo            
              return p.pendiente==false;
            });    
            this.productos=this.productos.concat(prod);
            
            //Filtro los productos pendientes          
            pend=pend.filter(p=>{                     
              return p.pendiente==true;
            });            
            this.pendientes=this.pendientes.concat(pend);          
            this.spinnerOn=false;          
          }
        };
      });
      this.subscriptions.push(this.$grupos);
    }
  }

  public CheckProduct(producto:IProducto):void{
    producto.check=!producto.check;
    if(producto.check){
      this.prodChecked.push(producto);
    }else{
      this.prodChecked.splice(this.prodChecked.indexOf(producto),1);
    }
  }

  public addProduct():void{    
    const dialogRef = this.dialog.open(SelectProductsListComponent, {
      width: '90%',
      maxWidth: '400px',
      data: { productos: this.productos }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result!=null && result!=""){
        let p:IProducto[]=result;
        this.api.SaveProductS(p,this.grupos,this.idCesta);
      }
      ;
    })
  }

  public cleanCesta():void{
    
    this.prodChecked.forEach(prod=>{
      prod.check=false;
      prod.pendiente=false;
      return;
    });

    this.api.SaveProductS(this.prodChecked, this.grupos, this.idCesta);
    this.prodChecked=[];
  }

  public Tacha(producto:IProducto):any{
    let styles = {
      'text-decoration': producto.check ? 'line-through' : 'none',
    };    
    return styles;
  }

  public ColorChange(producto:IProducto):any{
    let styles = {
      'background-color': producto.check ? 'orange' : 'green',      
    };
    return styles;
  }

  ngOnDestroy(){
    for(let s of this.subscriptions){
      s.unsubscribe();
    }
  }
}
