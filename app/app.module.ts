import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router'

import { AppComponent } from './app.component';
import { CarouselComponent } from './carousel/carousel.component';
import { CarouselItemDirective } from './carousel/carousel-item.directive';
import { ViewFilmStripComponent } from './views/view-film-strip/view-film-strip.component';
import { AdvancedCarouselComponent } from './advance-carousel/advance-carousel.component';
import { AdvancedCarouselItemDirective } from './advance-carousel/advance-carousel-item.directive';

@NgModule({
  imports:      [ 
    BrowserModule, 
    FormsModule, 
    BrowserAnimationsModule
  ],
  declarations: [ 
    AppComponent,
    
    CarouselItemDirective,
    CarouselComponent,

    ViewFilmStripComponent,

    AdvancedCarouselComponent,
    AdvancedCarouselItemDirective
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
