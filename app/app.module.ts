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

    AdvancedCarouselComponent
  ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
