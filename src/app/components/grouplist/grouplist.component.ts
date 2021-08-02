import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ICesta } from 'src/app/models/ICesta';
import { IGrupo } from 'src/app/models/IGrupo';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { GroupComponent } from '../group/group.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-grouplist',
  templateUrl: './grouplist.component.html',
  styleUrls: ['./grouplist.component.css']
})
export class GrouplistComponent implements OnInit {

  private subscripciones$: Subscription[] = [];
  private cesta$: Subscription;
  public cesta: ICesta={
    id:"",
    nombre:"...",
    propietario:"",
    usuarios:null,
    grupos:null
  };
  private grupos$: Subscription;
  public grupos: IGrupo[]=[];
  public spinnerOn:boolean=true;
  
  constructor(private api: ApiService, private route: ActivatedRoute, public dialog: MatDialog) { }

  ngOnInit() {
    const id:string = this.route.snapshot.paramMap.get('id');    
 
    this.cesta$ = this.api.GetCesta(id).subscribe(data => {
      this.cesta = data;
      this.spinnerOn = false;
      this.subscripciones$.push(this.cesta$);
    });
    this.grupos$ = this.api.GetGruposCesta(id).subscribe(data =>{
      this.grupos=data;
      this.grupos=this.grupos.sort(function(a,b){
        return a.orden - b.orden;
      });
      this.subscripciones$.push(this.grupos$);
    });
  }

  public OpenDialog(g:IGrupo):void{
    this.dialog.open(GroupComponent, {
      width: '90%',  
      data: {grupo: g, idCesta:this.cesta.id}    
    });
  }

  ngOnDestroy() {    
    for (let s of this.subscripciones$) {
      s.unsubscribe();
    }
  }

}
