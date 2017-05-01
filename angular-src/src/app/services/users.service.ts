import { Injectable } from '@angular/core';
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/map'
import { User } from "../models/user";
import { tokenNotExpired} from "angular2-jwt";

@Injectable()
export class UsersService {
  token;
  user: User;

  constructor(
    private http: Http
    // private jwtHelper: JwtHelper
  ) { }


  loggedIn(){
      return tokenNotExpired('token');
  }

  isAdmin(){

  }
  authenticate(user: User) {
    let headers = new Headers();
    headers.append('content-type', 'application/json');
    return this.http.post('api/users/authenticate', user, { headers: headers }).map(res => res.json());
  }

   register(user: User) {
    let headers = new Headers();
    headers.append('content-type', 'application/json');
    return this.http.post('api/users/register', user, { headers: headers }).map(res => res.json());
  }

  storeToken(token) {
    localStorage.setItem('token', token);
    this.token = token;
  }

  storeUser(user: User) {
    localStorage.setItem('userData', JSON.stringify(user));
    this.user = user;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('userData'));
  }
  logout() {
    this.token = this.user = null;
    localStorage.clear();
  }
}
