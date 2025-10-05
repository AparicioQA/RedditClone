import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const currentUser = auth.currentUser;
  
  if (currentUser) {
    // Get the Firebase ID token and add it to the request
    return from(currentUser.getIdToken()).pipe(
      switchMap(token => {
        const cloned = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        return next(cloned);
      })
    );
  }
  
  return next(req);
};
