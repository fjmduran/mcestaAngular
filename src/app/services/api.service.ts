import { ICesta } from 'src/app/models/ICesta';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IGrupo } from '../models/IGrupo';
import { IProducto } from '../models/IProducto';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private afs: AngularFirestore) { }

  public GetCesta(id: string): Observable<ICesta> {
    return this.afs.doc<ICesta>("/cestas/" + id).snapshotChanges().pipe(map(action => {
      if (action.payload.exists == false) {
        return null;
      } else {
        const data = action.payload.data() as ICesta;
        return data;
      }
    }
    ));
  }

  public SaveCesta(cesta:ICesta): string {
    if (cesta.id==null) {
      cesta.id = new Date().getTime().toString();
      this.afs.collection("/cestas").doc(cesta.id).set(cesta)
    } else {
      this.afs.doc("/cestas/" + cesta.id).update(cesta);
    }
    return cesta.id;
  }
  
  public GetGruposCesta(idCesta: string): Observable<IGrupo[]> {
    return this.afs.collection("/cestas/" + idCesta + "/grupos").snapshotChanges()
      .pipe(map(changes => {
        return changes.map(action => {
          const data = action.payload.doc.data() as IGrupo;
          return data;
        });
      }));
  }

  public GetGrupo(idCesta: string, idGrupo: string): Observable<IGrupo> {
    return this.afs.doc<IGrupo>("/cestas/" + idCesta + "/grupos/" + idGrupo).snapshotChanges().pipe(map(action => {
      if (action.payload.exists == false) {
        return null;
      } else {
        const data = action.payload.data() as IGrupo;
        return data;
      }
    }
    ));
  }

  public SaveGroup(grupo: IGrupo, idCesta: string): void {
    let id: string = grupo.id;
    if (id==null) {
      this.afs.collection("/cestas/" + idCesta + "/grupos").doc(grupo.nombre).set(grupo);
    } else {
      this.afs.doc("/cestas/" + idCesta + "/grupos/" + grupo.id).update(grupo);
    }
  }

  public SaveProductS(productos:IProducto[], grupos: IGrupo[], idCesta:string){
    let idGrupos: string[]=[];
    
    productos.forEach(prod=>{
      //analizo para cada producto qué grupo tiene y obtengo un array de los grupos a guardar
      let existe:boolean=false;
      for(let id of idGrupos){
        if (id==prod.idGrupo) existe=true;
      }
      if(!existe)idGrupos.push(prod.idGrupo);

      //analiza que grupo es el que tiene el producto
      for(let grupo of grupos){
        if(grupo.id==prod.idGrupo){
          //busco el producto para modificarlo          
          for(let p of grupo.productos){
            if (p.id==prod.id){
              p=prod;
              break;
            }
          }
        }
      }
    });

    //para cada idGrupo busco su grupo y lo guardo
    idGrupos.forEach(id=>{
      for(let g of grupos){
        if(g.id==id){
          this.SaveGroup(g,idCesta);
        }
      }
    });
  }
}


