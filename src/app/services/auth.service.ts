import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { delay, filter, map, Observable, of, switchMap } from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>;
  private redirect: boolean = false;

  constructor(
    private auth: AngularFireAuth, 
    private db: AngularFirestore, 
    private router: Router, 
    private route: ActivatedRoute) { 

    this.usersCollection = db.collection('users');
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user), 
      delay(1000)
    );

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this.route.firstChild),
      switchMap(route => route?.data ?? of({}))
    ).subscribe(({authOnly}) => {
      this.redirect = authOnly ?? false;
    });
  }

  public async createUser(userData: IUser) {
    if (!userData.password) {
      throw new Error('Password not provided!');
    }

    const userCredentials = await this.auth.createUserWithEmailAndPassword(userData.email, userData.password);

    await this.usersCollection.doc(userCredentials.user?.uid).set({
      name: userData.name,
      email: userData.email,
      age: userData.age,
      phonenNumber: userData.phonenNumber
    })

    await userCredentials.user?.updateProfile({
      displayName: userData.name
    })
  }

  public async logUserIn(credentials: Partial<IUser>) {
    if (!credentials.password) {
      throw new Error('Password not provided!');
    }

    if (!credentials.email) {
      throw new Error('Email not provided!');
    }

    await this.auth.signInWithEmailAndPassword(credentials.email, credentials.password);
  }

  public async logout($event: Event) {
    if ($event) {
      $event.preventDefault();
    }

    await this.auth.signOut();

    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }
  }
}
