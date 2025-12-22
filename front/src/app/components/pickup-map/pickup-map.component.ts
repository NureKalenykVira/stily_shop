import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-pickup-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pickup-map.component.html',
  styleUrls: ['./pickup-map.component.scss']
})
export class PickupMapComponent implements OnChanges {
  @Input() city: string = '';
  @Output() pointSelected = new EventEmitter<any>();
  @ViewChild('mapContainer', { static: true }) mapElementRef!: ElementRef;

  map: any;
  service: any;
  markers: any[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['city'] && this.city) {
      setTimeout(() => this.initMapAndSearch(), 100);
    }
  }

  initMapAndSearch() {
  this.map = new google.maps.Map(this.mapElementRef.nativeElement, {
    center: { lat: 49.8419, lng: 24.0315 },
    zoom: 13
  });

  this.service = new google.maps.places.PlacesService(this.map);

  const query = `Нова Пошта ${this.city}`;

  this.service.textSearch(
    { query, fields: ['name', 'geometry'] },
    (results: any[], status: string) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];

        results.forEach(place => {
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: this.map,
            title: place.name
          });

          marker.addListener('click', () => {
            this.pointSelected.emit(place);
          });

          this.markers.push(marker);
        });

        if (results.length > 0) {
          this.map.setCenter(results[0].geometry.location);
        }
      }
    }
  );
}
}
