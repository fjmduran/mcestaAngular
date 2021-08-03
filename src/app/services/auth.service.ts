import { Injectable, NgZone } from "@angular/core";
import { IUser } from "../models/IUser";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { auth } from "firebase/app";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class AuthService {

  private userFirebase: firebase.User;

  constructor(
    public afsAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.afsAuth.onAuthStateChanged((user) => {
      this.userFirebase = user;
      if (!this.userFirebase) {
        this.ngZone.run(() => {
          this.router.navigateByUrl("/auth");
        });
        return;
      } else {
        //Usuario logueado        
      }
    });
  }

  public getCurrentUser(): IUser {
    let user_string = localStorage.getItem("currentUser");
    if (user_string != null) {
      let user: IUser = JSON.parse(user_string);
      return user;
    } else {
      return null;
    }
  }

  logInEmail(email: string, password: string): Observable<IUser[]> {
    return this.afs
      .collection<IUser>("usuarios", (ref) => {
        let query: firebase.firestore.Query = ref;
        query = query.where("email", "==", email);
        query = query.where("pwd", "==", password);
        return query;
      })
      .snapshotChanges()
      .pipe(
        map((changes) => {
          return changes.map((action) => {
            const data = action.payload.doc.data() as IUser;
            if (data != null) this.setUser(data);
            return data;
          });
        })
      );
  }

  loginFirebaseEmail(email: string, pwd: string): Promise<auth.UserCredential> {
    return this.afsAuth.signInWithEmailAndPassword(email, pwd);
  }

  loginGoogle(): Promise<auth.UserCredential> {
    return this.afsAuth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  public checkUser(user: IUser): Observable<IUser[]> {
    //método para comprobar si el usuario ya existe en la base de datos
    return this.afs
      .collection<IUser>("usuarios", (ref) => {
        let query: firebase.firestore.Query = ref;
        query = query.where("email", "==", user.email);
        return query;
      })
      .snapshotChanges()
      .pipe(
        map((changes) => {
          return changes.map((action) => {
            const data = action.payload.doc.data() as IUser;
            return data;
          });
        })
      );
  }

  public saveUser(user: IUser): void {
    if (user.id == null) {
      //usuario nuevo
      this.afs.collection("/usuarios").doc(user.email).set(user);
      console.log("Usuario añadido");
    } else {
      this.afs.doc("/usuarios/" + user.id).update(user);
    }
    this.setUser(user);
  }

  siginFirebaseEmail(email: string, pwd: string): Promise<auth.UserCredential> {
    return this.afsAuth.createUserWithEmailAndPassword(email, pwd);
  }

  public setUser(user: IUser): void {
    let usuario: IUser = {
      id: user.email,
      email: user.email,
      pwd: "?",
      cesta: user.cesta,
      cestas: user.cestas,
    };
    let user_string = JSON.stringify(usuario);
    localStorage.setItem("currentUser", user_string);
  }

  public logOut(): Promise<void> {
    localStorage.removeItem("currentUser");
    return this.afsAuth.signOut();
  }
}
