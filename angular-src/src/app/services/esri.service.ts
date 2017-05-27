import { Injectable } from '@angular/core';
import { Http, Headers } from "@angular/http";
import 'rxjs/add/operator/map'


@Injectable()
export class EsriService {


  query(whereCondition: String, statistics: Array<Object>, idsOnly: Boolean, ids: Array<Number>) {
    let headers = new Headers();
    // headers.append('Access-Control-Allow-Origin', '*');
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.post(`https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/0/query`, `where=${whereCondition}&objectIds=${ids.toString()}&outFields=*&returnIdsOnly=${idsOnly}&outStatistics=${JSON.stringify(statistics)}&f=geojson`, { headers: headers }).map(res => res.json());
  }



  constructor(
    private http: Http,
  ) { }

}
