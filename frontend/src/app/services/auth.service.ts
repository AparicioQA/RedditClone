import { Injectable, inject } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  user,
  User as FirebaseUser,
  updateProfile
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, from, switchMap, of } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Subscribe to Firebase auth state changes
    user(this.auth).subscribe((firebaseUser) => {
      if (firebaseUser) {
        const user: User = {
          id: 0, // Firebase UID is string, we'll use 0 as placeholder
          username: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'user',
          email: firebaseUser.email || '',
          createdAt: new Date()
        };
        this.currentUserSubject.next(user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  register(email: string, password: string, username: string): Observable<void> {
    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap((credential) => {
        // Update the user's display name with username
        return from(updateProfile(credential.user, { displayName: username }));
      })
    );
  }

  login(email: string, password: string): Observable<void> {
    return from(
      signInWithEmailAndPassword(this.auth, email, password)
    ).pipe(
      switchMap(() => of(void 0))
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  async getToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.auth.currentUser;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getCurrentFirebaseUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
