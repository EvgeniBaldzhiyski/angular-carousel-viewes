import { Component, ViewChild, ElementRef } from '@angular/core';
import {trigger, animate, style, group, animateChild, query, stagger, transition, state} from '@angular/animations';
import { interval } from 'rxjs/observable/interval';
import { AdvancedCarouselView } from './advance-carousel/advance-carousel.component';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent  {
  items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
  vertical = false;
  perPage = 4;
  testBoxStyle = {};
  maximize = 3;

  fullSize = '';

  orientation = AdvancedCarouselView.FILM_HORIZONTAL;

  constructor() {
   // const subscribtion = interval(5000).subscribe(data => {
      // if (data === 4) {
      //   // this.items = []; 
      //   this.fullSize = '';
      //   return subscribtion.unsubscribe(); 
      // }

      // this.fullSize = this.fullSize ? '' : data + '';

    //   if (data === 1) {
    //     this.items = [1, 2, 3];
    //   }
    //   if (data === 2) {
    //     this.vertical = false;
    //   }
    //   if (data === 3) {
    //     this.perPage = 3;
    //   }
    //   if (data === 4) {
    //     this.items = [1, 2, 3, 4, 5, 6];
    //   }
    //   if (data === 5) {
    //     this.items = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    //   } 
    //   if (data === 6) {
    //     this.testBoxStyle = {width: '700px'};
    //   } 
   // });
  }

  get advancedCarouselView() {
    return AdvancedCarouselView;
  }

  changeOrientaion(value) {
    this.orientation = value;
  }

  onSlideChange(data) {
    console.log('slideChange', data);
  }

  onResize(data) {
    console.log('resize', data);
  }

  oniIemListChange(data) {
    console.log('itemListChange', data);
  }

  onCurrentItemChange(data) {
    console.log('currentItemChange', data);
  }

  onMaximizeItemChange(data) {
    console.log('maximizeItemChange', data);
  }
  
  onOrientationChange(data) {
    console.log('orientationChange', data);
  }

  onMaxItemsPerPageChange(data) {
    console.log('maxItemsPerPageChange', data);
  }
}
