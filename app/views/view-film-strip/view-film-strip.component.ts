import {
  Component, OnInit, OnDestroy, OnChanges,
  SimpleChanges, ChangeDetectionStrategy, ContentChildren, QueryList, ChangeDetectorRef, Input, EventEmitter, Output
} from "@angular/core";
import { CarouselItemDirective } from "../../carousel/carousel-item.directive";

@Component({
  selector: 'app-view-film-strip',
  templateUrl: './view-film-strip.component.html',
  styleUrls: [ './view-film-strip.component.scss', ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewFilmStripComponent implements OnInit, OnDestroy, OnChanges {
  items: QueryList<CarouselItemDirective>;
  _mainItemId = '';
  _maximizeItemId = '';

  @Input() mainItemsId: string;
  @Input() maximizeItemId: string;
  @Input() itemsPerPage: number = 4;
  @Input() freeFill = false;
  @Input() isVertical = false;
  @Input() timing = '250ms ease-in';


  @ContentChildren(CarouselItemDirective) set _items(list: QueryList<CarouselItemDirective>) {
    this.items = list;

    console.log('GRID ITEMS', this.items.length);

    this.setupElements();
    this.cd.detectChanges();
  }

  constructor(
    private cd: ChangeDetectorRef,
  ) {

  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

  ngAfterViewInit() {

  }

  ngOnChanges(changes: SimpleChanges) {

  }

  private setupElements() {
    let mainItemId = '';
    if (this.items.length) {
      if (!this.items.find(item => item.data === this._mainItemId)) {
        mainItemId = this.items.first.data;
      }
    } else {
      mainItemId = '';
    }

    if (mainItemId !== this._mainItemId) {
      this._mainItemId = mainItemId;
      // emit event
    }
  }

  private onCarouselResize({ from, to }){

  }

  test() {
    console.log('test ok');
  }
}