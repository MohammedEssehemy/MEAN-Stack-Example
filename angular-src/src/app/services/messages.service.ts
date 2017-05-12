import { Injectable } from '@angular/core';
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/map'
import { Message } from "../models/message";
import { UsersService } from "./users.service";

@Injectable()
export class MessagesService {

  token = this.usersService.getToken(); ;


  sendMessage(msg: Message){
    let headers = new Headers();
    headers.append('content-type','application/json');
   return  this.http.post('/api/msgs',msg,{headers:headers}).map( res => res.json());
  }

  getMessages(){
     let headers = new Headers();
    headers.append('x-access-token',this.token);
   return  this.http.get('/api/msgs',{headers:headers}).map( res => res.json());
  }

  deleteMessage(id){
     let headers = new Headers();
    headers.append('x-access-token',this.token);
   return  this.http.delete(`/api/msgs/${id}`,{headers:headers}).map( res => res.json());
  }
  constructor(
    private http: Http,
    private usersService : UsersService
    ) { 
    }

}
