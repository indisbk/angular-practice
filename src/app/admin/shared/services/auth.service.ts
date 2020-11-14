import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FirebaseAuthResponse, User} from '../../../shared/interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';

// Authorization service
@Injectable({providedIn: 'root'})
export class AuthService {

  public error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {
  }
  get token(): string {
    const expiresDate = new Date(localStorage.getItem('fb-token-exp'));
    if (new Date() > expiresDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('fb-token');
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this.http
      .post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this))
      );
  }

  logout(): void {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Process error from firebase rest api
  private handleError(error: HttpErrorResponse): Observable<never> {
    const {message}  = error.error.error;
    switch (message) {
      case 'EMAIL_NOT_FOUND':
        this.error$.next('This email doesn\'t exist!');
        break;
      case 'INVALID_PASSWORD':
        this.error$.next('Wrong password!');
        break;
      case 'INVALID_EMAIL':
        this.error$.next('Wrong email!');
        break;
    }
    return throwError(error);
  }

  // Store token in localStorage
  private setToken(response: FirebaseAuthResponse | null): void {
    if (response) {
      const expiresDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
      localStorage.setItem('fb-token', response.idToken);
      localStorage.setItem('fb-token-exp', expiresDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
