import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Icon, Style } from 'ol/style';
import { fromLonLat, toLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import { toStringHDMS } from 'ol/coordinate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  map!: Map;
  // overlay: any;
  vectorLayer:any;
  httpClient!: HttpClient;
  closer: any;
  content: any;
  container: any;

  constructor(http: HttpClient) {
    this.httpClient = http;
  } 

  ngOnInit(){
    this.initMap();
  }

  initMap() {

    this. container = document.getElementById('popup');
    this.content = document.getElementById('popup-content');
    this.closer = document.getElementById('popup-closer');

    const overlay = new Overlay({
      element: this.container,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    this.closer.onclick = () => {
      overlay.setPosition(undefined);
      this.closer.blur();
      return false;
    };
    const vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    this.map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer,
      ],
      view: new View({
        center: fromLonLat([-90, 33]),
        zoom: 5,
      }),
    });

    this.httpClient.get('assets/sample.json').subscribe((data:any)=>{
      data.forEach((marker: { Lon: number; Lat: number; Name: string; })=> {
        const feature = new Feature({
          geometry:new Point(fromLonLat([marker.Lon,marker.Lat])),
          Name:marker.Name
        });

        const iconStyle = new Style({
          image:new Icon({
            anchor:[0.5,1],
            src:`assets/map.png`,
          }),
        });
        feature.setStyle(iconStyle);

        vectorSource.addFeature(feature)

        this.map.addOverlay(overlay);
        this.map.on('singleclick', (event) => {

          const coordinate = event.coordinate;
          const hdms = toStringHDMS(toLonLat(coordinate));
          

          this.map.forEachFeatureAtPixel(event.pixel, (feature) => {
            const locationName = feature.get('Name');
            // console.log(locationName); 
            this.content.innerHTML = locationName + '<br/><br/><code>' + hdms + '</code>';
            overlay.setPosition(coordinate);
          });
        });
      });
      // console.log(data)
    });
  }
}
