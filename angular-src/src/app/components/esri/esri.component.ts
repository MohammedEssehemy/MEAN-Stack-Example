import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { BookmarksService } from "../../services/bookmarks.service";
import { UsersService } from "../../services/users.service";
import { EsriService } from "../../services/esri.service";
import { FlashMessagesService } from "angular2-flash-messages";

import { Bookmark } from "../../models/bookmark";
import * as L from 'leaflet';
import *  as esri from "esri-leaflet";
// import * as WMS from "leaflet.wms";
import "leaflet.locatecontrol";
import "leaflet-fullscreen";
import "leaflet-easybutton";

@Component({
  selector: 'app-esri',
  templateUrl: './esri.component.html',
  styleUrls: ['./esri.component.css', '../../../../node_modules/leaflet/dist/leaflet.css',
    '../../../../node_modules/leaflet.locatecontrol/dist/L.Control.Locate.min.css',
    '../../../../node_modules/leaflet-fullscreen/dist/leaflet.fullscreen.css',
    '../../../../node_modules/leaflet-easybutton/src/easy-button.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class EsriComponent implements OnInit {
  loading: boolean;
  map: L.Map;
  editedBookmark: Bookmark;
  centerPoint: L.LatLng;
  bookmarks: Bookmark[];
  markerGroup: L.FeatureGroup;
  queryLayer: L.GeoJSON = L.geoJSON(null, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, {
        radius: 8,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });
    }
  });
  queryIds: Number[];
  queryResult;
  fields: Array<{ display: String, value: String }> = [
    { display: "ID", value: "OBJECTID" },
    { display: "STATE FIPS", value: "STATE_FIPS" },
    { display: "CNTY FIPS", value: "CNTY_FIPS" },
    { display: "STCOFIPS", value: "STCOFIPS" },
    { display: "TRACT", value: "TRACT" },
    { display: "BLOCK", value: "BLOCK" },
    { display: "FIPS", value: "FIPS" },
    { display: "POP 2000", value: "POP2000" },
    { display: "HOUSE HOLDS", value: "HOUSEHOLDS" },
    { display: "HSE UNITS", value: "HSE_UNITS" }];


  statistics: Array<{ display: String, value: String }> = [
    { display: "Sum", value: "sum" },
    { display: "Minimum", value: "min" },
    { display: "Maximum", value: "max" },
    { display: "Average", value: "avg" },
    { display: "Standard Deviation", value: "stddev" },
    { display: "Statistical Variance", value: "var" },
  ];



  constructor(
    private bookmarksService: BookmarksService,
    private usersService: UsersService,
    private esriService: EsriService,
    private flashMessagesService: FlashMessagesService) { }

  ngOnInit() {
    (<any>L).esri = esri;
    this.centerPoint = new L.LatLng(45.5384, -122.6695);
    if (!this.usersService.loggedIn()) {
      this.flashMessagesService.show("you can check the map, but you won't be able to add bookmarks without login", {
        cssClass: 'alert-danger', timeout: 4000
      })
      this.initializeMap(false);

    }
    else {
      this.initializeMap(true);
      this.getMarkers(false);
    }
  }

  mapclick_creatMarker(e: L.MouseEvent) {
    let bookmark = {
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      title: "untitled"
    }
    this.bookmarksService.addBookmark(bookmark).subscribe(res => {
      this.createMarkerFunction(res.bookmark)
    })
  };


  createMarkerFunction(bookmark: Bookmark) {
    let marker = L.marker([bookmark.lat, bookmark.lng], {
      draggable: true,
      title: bookmark.title,
      riseOnHover: true,
      icon: L.icon({
        iconUrl: "assets/marker-icon.png"
      })
    }).on('click',
      (e: L.MouseEvent) => {
        console.log(e);
        console.log(this)
        this.editedBookmark = bookmark;
        (<any>this.editedBookmark).left = e.containerPoint.x + 5 + "px";
        (<any>this.editedBookmark).top = e.containerPoint.y - 20 + "px";
        console.log(this.editedBookmark);
      }
      );
    this.markerGroup.addLayer(marker)
    // this.bookmarksService.addBookmark(marker)
  };



  getMarkers(removeOld) {
    console.log(removeOld);
    if (removeOld) {
      this.map.removeLayer(this.markerGroup);
    }
    this.markerGroup = L.featureGroup();
    this.markerGroup.addTo(this.map);
    this.bookmarksService.getBookmarks().subscribe(res => {
      if (res.bookmarks) {
        this.bookmarks = res.bookmarks;
        this.bookmarks.forEach(this.createMarkerFunction.bind(this));
      }
    });
  }

  runQuery(field, statistic, query) {
    if (!query) {
      return this.flashMessagesService.show("insert your query", {
        cssClass: 'alert-danger', timeout: 4000
      })
    }
    this.queryLayer.clearLayers();
    this.loading = true;
    let whereCondition = field + query;
    let statisticQuery = [
      {
        "statisticType": "count",
        "onStatisticField": "OBJECTID",
        "outStatisticFieldName": "count"
      },
      {
        "statisticType": statistic,
        "onStatisticField": field,
        "outStatisticFieldName": statistic
      }];
    this.esriService.query(whereCondition, null, true, []).subscribe(Idsres => {
      this.queryIds = Idsres.objectIds;
      let count = this.queryIds.length;
      this.getFeatures(0, count);
    })
    this.esriService.query(whereCondition, statisticQuery, true, []).subscribe(statisticsRes => {
      this.queryResult = [];
      let attributes = statisticsRes.features[0].attributes;
      let message = "";
      for (let key in attributes) {
        message += key + " : " + attributes[key] + " ";
        this.queryResult.push({
          key: key,
          value: attributes[key]
        })
      }
      this.loading = false;
      this.flashMessagesService.show(message, {
        cssClass: 'alert-success', timeout: 8000
      })
    });


  };
  getFeatures(from, count) {

    this.esriService.query(null, null, false, this.queryIds.slice(from, from + 500)).subscribe(res => {
      from += 500;
      this.queryLayer.addData(res);
      if (from < count) {
        this.flashMessagesService.show(`${from} features loaded out of ${count}`, {
          cssClass: 'alert-warning', timeout: 7500
        })
        this.getFeatures(from, count);
      }
      else {
        this.flashMessagesService.show(`${count} features loaded out of ${count}`, {
          cssClass: 'alert-warning', timeout: 7500
        })
      }
    })
  }

  initializeMap(loggedIn) {

    // set up the map
    this.map = new L.Map('map');
    this.map.setView(this.centerPoint, 3);
    this.map.addLayer(this.queryLayer);

    // create the tile layer with correct attribution for osm
    let esriBaseMap = (<any>L).esri.basemapLayer("Streets");
    this.map.addLayer(esriBaseMap);

    let OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    // feature layer




    // map controls
    // locate control
    let lc = new (<any>L.Control).Locate({
      flyTo: true,
      position: 'bottomright',
      icon: 'fa fa-compass fa-lg'
    }).addTo(this.map);
    // full screen control
    let fullScreenControl = new (<any>L.Control).Fullscreen({
      pseudoFullscreen: true
    }).addTo(this.map);

    // google search controller

    if (loggedIn) {
      // easy buttons
      let bookmarksButton = (<any>L).easyButton({
        states: [{
          stateName: 'default-state',        // name the state
          icon: 'fa fa-map-marker fa-lg',               // and define its properties
          title: 'click to add bookmark',      // like its title
          onClick: (btn, map) => {
            btn.state('bookmark-state');    // change state on click!
            this.map.on('click', this.mapclick_creatMarker.bind(this))
          }
        }, {
            stateName: 'bookmark-state',
            icon: 'fa fa-university fa-lg',
            title: 'finish adding bookmark',
            onClick: (btn, map) => {
              this.map.off('click', this.mapclick_creatMarker.bind(this));
              // this.map.on('click',e=>console.log(e))
              btn.state('default-state');    // change state on click!
            }
          }]
      });
      bookmarksButton.addTo(this.map);
    }

    //layer control
    var baseLayers = {
      "Esri Base Map": esriBaseMap,
      "openTopoMap": OpenTopoMap,
    };
    var overlays = {
      "Census Layer": this.queryLayer
      // "Markers": this.markerGroup,
      // "Roads": roadsLayer
    };
    L.control.layers(baseLayers, overlays).addTo(this.map);

  }
}
