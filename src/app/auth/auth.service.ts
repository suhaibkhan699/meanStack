import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthData } from './auth-data.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string
  private authListenerStatus = new Subject<boolean>()
  private isAuthenticated = false
  private tokenTimer: NodeJS.Timer

  constructor(private httpClient: HttpClient, private router: Router) { }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password }
    this.httpClient.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response)
      })
  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password }
    this.httpClient.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        const token = response.token
        this.token = token
        if (token) {
          const expiresInDuration = response.expiresIn
          this.setAuthTimer(expiresInDuration)
          this.isAuthenticated = true
          this.authListenerStatus.next(true)
          const now = new Date()
          const expirationDate = new Date(now.getTime() + (expiresInDuration * 1000))
          this.saveAuthData(token, expirationDate)
          this.router.navigate(['/'])
        }
      })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData()
    if (!authInformation) {
      return
    }
    const now = new Date()
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime()
    if (expiresIn > 0) {
      this.token = authInformation.token
      this.isAuthenticated = true
      this.setAuthTimer(expiresIn / 1000)
      this.authListenerStatus.next(true)
    }
  }

  private setAuthTimer(expiresInDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout()
    }, expiresInDuration * 1000);
  }

  private getAuthData() {
    const token = localStorage.getItem('token')
    const expirationDate = localStorage.getItem('expiration')
    if (!token || !expirationDate) {
      return false
    }
    return {
      token,
      expirationDate: new Date(expirationDate)
    }
  }


  logout() {
    this.token = null
    this.isAuthenticated = false
    this.authListenerStatus.next(false)
    clearTimeout(this.tokenTimer)
    this.clearAuthData()
    this.router.navigate(['/'])
  }

  private saveAuthData(token: string, expirationDate: Date) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString())
  }

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
  }

  getToken() {
    return this.token
  }

  getAuthStatusListener() {
    return this.authListenerStatus.asObservable()
  }

  getIsAuth() {
    return this.isAuthenticated
  }

}
