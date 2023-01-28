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
  private userId: string

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
    this.httpClient.post<{ token: string, expiresIn: number, userId: string }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        const token = response.token
        this.token = token
        if (token) {
          const expiresInDuration = response.expiresIn
          this.setAuthTimer(expiresInDuration)
          this.isAuthenticated = true
          this.userId = response.userId
          this.authListenerStatus.next(true)
          const now = new Date()
          const expirationDate = new Date(now.getTime() + (expiresInDuration * 1000))
          this.saveAuthData(token, expirationDate, this.userId)
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
      this.userId = authInformation.userId
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
    const userId = localStorage.getItem('userId')
    if (!token || !expirationDate || !userId) {
      return false
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId
    }
  }


  logout() {
    this.token = null
    this.isAuthenticated = false
    this.authListenerStatus.next(false)
    this.userId = null
    clearTimeout(this.tokenTimer)
    this.clearAuthData()
    this.router.navigate(['/'])
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token)
    localStorage.setItem('expiration', expirationDate.toISOString())
    localStorage.setItem('userId', userId)
  }

  private clearAuthData() {
    localStorage.removeItem('token')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userId')
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

  getUserId() {
    return this.userId
  }

}
