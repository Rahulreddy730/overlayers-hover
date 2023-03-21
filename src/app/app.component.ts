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
import { fromLonLat } from 'ol/proj';
import Overlay from 'ol/Overlay';
import File from '../assets/sample.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {


  map!: Map;
  vectorLayer:any;
  httpClient!: HttpClient;

  constructor(http: HttpClient) {
    this.httpClient = http;
  } 

  ngOnInit(){
    this.initMap();
  }

  initMap() {
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
        center: fromLonLat([-30, 80]),
        zoom: 2,
      }),
    });

    this.httpClient.get('assets/sample.json').subscribe((data:any)=>{
      data.forEach((marker: { Lon: number; Lat: number; Name: string; })=> {
        const feature = new Feature({
          geometry:new Point(fromLonLat([marker.Lon,marker.Lat])),
        });
       
        const iconStyle = new Style({
          image:new Icon({
            anchor:[0.5,1],
            src:`assets/map.png`,
          }),
        });
        feature.setStyle(iconStyle);
        feature.set('name', marker.Name);
        vectorSource.addFeature(feature)
        const tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.innerHTML = marker.Name;

        const overlay = new Overlay({
          element:tooltip,
          offset:[0,-21],
          positioning:'bottom-center'
        });

        this.map.addOverlay(overlay);
        this.map.on('pointermove', (event) => {
          this.map.getTargetElement().style.cursor = 'default';
          const feature = this.map.forEachFeatureAtPixel(event.pixel, (ft) => ft);
          if (feature) {
            const tooltip = feature.get('name');
            if (tooltip) {
              this.map.getTargetElement().title = tooltip;
              this.map.getTargetElement().style.cursor = 'pointer';
            }
          } else {
            this.map.getTargetElement().title = 'Name';
          }
        });
        // feature.on('click', (event) =>{
        //   overlay.setPosition(event.target.map)
        // })
      });
      console.log(data)
    });
  }
}
