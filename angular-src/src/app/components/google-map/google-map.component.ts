import { Component, OnInit } from '@angular/core';
import { Jsonp } from "@angular/http";;

declare let google:any; 

@Component({
  selector: 'app-google-map',
  templateUrl: './google-map.component.html',
  styleUrls: ['./google-map.component.css']
})
export class GoogleMapComponent implements OnInit {

  constructor(private jsonp: Jsonp) { }

  ngOnInit() {
    this.jsonp.get(`https://maps.googleapis.com/maps/api/js?key=AIzaSyBVhR4FxL65cK-CHDC8OklwxxNi-ekz-Ko&libraries=places&callback=JSONP_CALLBACK`).subscribe(()=>{
     var uluru = {lat: -25.363, lng: 131.044};
        var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: uluru
        });
        var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
    });
  }

}
