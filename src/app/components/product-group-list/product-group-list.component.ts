import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ICesta } from 'src/app/models/ICesta';
import { IGrupo } from 'src/app/models/IGrupo';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { IProducto } from 'src/app/models/IProducto';
import { ProductGroupComponent } from '../product-group/product-group.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-product-group-list',
  templateUrl: './product-group-list.component.html',
  styleUrls: ['./product-group-list.component.css']
})
export class ProductGroupListComponent implements OnInit {

  private subscripciones$: Subscription[] = [];  
  private cesta$: Subscription;
  public cesta: ICesta;
  private grupo$: Subscription;
  public grupo: IGrupo={id:null,nombre:"...",orden:null,productos:[]};  
  public spinnerOn:boolean=true;
  public msgEmpty:string='No hay productos';  

  constructor(private api: ApiService, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit() {
    let idCesta: string = this.route.snapshot.paramMap.get('idCesta');
    let idGrupo: string = this.route.snapshot.paramMap.get('idGrupo');    
    
    this.cesta$ = this.api.GetCesta(idCesta).subscribe(data => {
      this.cesta = data;      
      this.subscripciones$.push(this.cesta$);
      //this.propietario=this.auth.isPropietario(this.local.propietario);
    });
    this.grupo$ = this.api.GetGrupo(idCesta, idGrupo).subscribe(data => {
      this.grupo = data;       
      this.subscripciones$.push(this.grupo$);      
      this.spinnerOn = false;      
    });   
  }

  public toCesta(p:IProducto):void{
    let i:number=-1;
     i=this.grupo.productos.indexOf(p);
     p.pendiente=true;
    if(i>=0) this.grupo.productos[i]=p;
    this.api.SaveGroup(this.grupo, this.cesta.id);
  }

  public OpenDialog(p:IProducto):void{
    this.dialog.open(ProductGroupComponent, {
      width: '90%',  
      data: { idCesta: this.cesta.id, grupo: this.grupo, producto:p }
    });
  }

  ngOnDestroy() {    
    for (let s of this.subscripciones$) {
      s.unsubscribe();
    }
  }

}
