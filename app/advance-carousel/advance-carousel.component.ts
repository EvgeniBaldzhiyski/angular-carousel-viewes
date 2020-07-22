import {
  Component, OnChanges, OnDestroy, QueryList, ChangeDetectionStrategy,
  ContentChildren, ChangeDetectorRef, NgZone, SimpleChanges, ViewChild,
  ElementRef, Output, EventEmitter, Input
} from '@angular/core';
import { interval, Subscription, timer, animationFrameScheduler } from 'rxjs';
import { AdvancedCarouselItemDirective } from './advance-carousel-item.directive';

export enum AdvancedCarouselView {
  GRID = 1,
  FILM_HORIZONTAL,
  FILM_VERTICAL,
}

@Component({
  selector: 'app-advance-carousel',
  templateUrl: './advance-carousel.component.html',
  styleUrls: ['./advance-carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedCarouselComponent implements OnChanges, OnDestroy {
  items:  QueryList<AdvancedCarouselItemDirective>;

  noAnimation = false;

  _itemStyles: Map<string, any> = new Map();

  private _maxItemsPerPage = 5;
  private _maxSlides = 1;
  private _currentSlide = 1;

  _currentItem = '';
  _maximizeItem = '';

  private _view: AdvancedCarouselView = AdvancedCarouselView.FILM_HORIZONTAL;

  private _resizeChecker = new Subscription();

  @ViewChild('carousel', { static: true }) private carousel: ElementRef;

  @ContentChildren(AdvancedCarouselItemDirective) set _items(list: QueryList<AdvancedCarouselItemDirective>) {
    this.items = list;

    console.log('CAROUSEL ITEMS', this.items.length);

    this.genDemotions();
    this.cd.detectChanges();

    this.itemListChange.emit({
      length: this.items.length,
      maxSlides: this._maxSlides,
      currentSlide: this._currentSlide,
    });

    if (this.items.length) {
      this.ngZone.runOutsideAngular(
        this._startResizeCheckRate
      );
    } else {
      this._resizeChecker.unsubscribe();
    }
  }

  @Input() resizeCheckRate: number = 200;

  @Output() orientationChange: EventEmitter<AdvancedCarouselView> = new EventEmitter();
  @Input() set orientation(value: AdvancedCarouselView) {
    if (this._view === value) {
      return;
    }

    this._view = value;
    this.orientationChange.emit(this._view);
    this.genDemotions();
    this.cd.detectChanges();
  }

  @Output() maxItemsPerPageChange: EventEmitter<number> = new EventEmitter();
  @Input() set maxItemsPerPage(value: number) {
    if (this._maxItemsPerPage === value) {
      return;
    }

    this._maxItemsPerPage = value;
    this.genDemotions();
    this.cd.detectChanges();
  }

  @Output() currentItemChange: EventEmitter<string> = new EventEmitter();
  @Input() set currentItem(value: string) {
    if (this._currentItem === value) {
      return;
    }

    this._currentItem = value;
    this.currentItemChange.emit(this._currentItem);

    if (this.items.length) {
      this.genDemotions();
      this.cd.detectChanges();
    }
  }
  get currentItem() {
    return this._currentItem;
  }

  @Output() maximizeItemChange: EventEmitter<string> = new EventEmitter();
  @Input() set maximizeItem(value: string) {
    if (this._maximizeItem === value) {
      return;
    }

    this._maximizeItem = value;
    this.maximizeItemChange.emit(this._currentItem);

    if (this.items && this.items.length) {
      this.genDemotions();
      this.cd.detectChanges();
    }
  }
  get maximizeItem() {
    return this._maximizeItem;
  }

  @Output() slideChange: EventEmitter<number> = new EventEmitter();
  @Input() set slide(value: number) {
    if ( this._currentSlide === value) {
      return;
    }

    this.goTo(value);

    if (this.items && this.items.length) {
      this.cd.detectChanges();
    }
  }

  @Output() resize: EventEmitter<{
    from: {width: number, height: number},
    to: {width: number, height: number}
  }> = new EventEmitter();

  @Output() itemListChange: EventEmitter<{
    length: number,
    maxSlides: number,
    currentSlide: number
  }> = new EventEmitter();

  constructor(
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.freeFill !== undefined && this._view !== AdvancedCarouselView.GRID) {
      this.genDemotions();
    }
  }

  ngOnDestroy() {
    this._resizeChecker.unsubscribe();
  }

  setUpMain(id = '') {
    if (this._view === AdvancedCarouselView.GRID) {
      return;
    }

    let currentItem = id || this._currentItem;

    if (this.items.length) {
      if (!this.items.find(item => item.data === currentItem)) {
        currentItem = this.items.first.data;
      }
    } else {
      currentItem = '';
    }

    if (currentItem !== this._currentItem) {
      this._currentItem = currentItem;
      this.currentItemChange.emit(this._currentItem);

      this.genDemotions();
      this.cd.detectChanges();
    }
  }

  get isVertical() {
    return this._view !== AdvancedCarouselView.FILM_HORIZONTAL;
  }

  get isGrid() {
    return this._view === AdvancedCarouselView.GRID;
  }

  prevPage() {
    if (this._currentSlide - 1 > 0) {
      this._currentSlide--;
      console.log('call next', this._currentSlide);
      this.slideChange.emit(this._currentSlide);

      if (this.items && this.items.length) {
        this.orderItems();
      }
    }
  }

  nextPage() {
    if (this._currentSlide + 1 <= this._maxSlides) {
      this._currentSlide++;
      console.log('call prev', this._currentSlide);
      this.slideChange.emit(this._currentSlide);

      if (this.items && this.items.length) {
        this.orderItems();
      }
    }
  }

  goTo(page) {
    if (page !== this._currentSlide && page > 0 && page <= this._maxSlides) {
      this._currentSlide = page;
      console.log(`call goto ${page}`, this._currentSlide);
      this.slideChange.emit(this._currentSlide);

      if (this.items && this.items.length) {
        this.orderItems();
      }
    }
  }

  private _startResizeCheckRate = () => {
    this._resizeChecker.unsubscribe();

    let lastDemotion = {width: 0, height: 0};
    if (this.carousel) {
      const carousel = (this.carousel.nativeElement as HTMLElement);

      lastDemotion = {width: carousel.clientWidth, height: carousel.clientHeight};
    }

    this._resizeChecker = interval(this.resizeCheckRate).subscribe(_ => {
      if (this.carousel) {
        const _carousel = (this.carousel.nativeElement as HTMLElement);

        if (_carousel.clientWidth !== lastDemotion.width || _carousel.clientHeight !== lastDemotion.height) {
          const to = {width: _carousel.clientWidth, height: _carousel.clientHeight};

          this.ngZone.run(() => this.resize.emit({
            from: lastDemotion, to
          }));

          lastDemotion = to;
          this.noAnimation = true;

          this.genDemotions();
          this.cd.detectChanges();

          timer(0, animationFrameScheduler).subscribe(__ => {
            this.noAnimation = false;
            this.cd.detectChanges();
          });
        }
      }
    });
  }

  private genDemotions() {
    if (!this.items) {
      return;
    }

    if (this.items.length === 0) {
      this._maxSlides = 0;
      this._currentSlide = 1;
      return;
    }

    const carousel = (this.carousel.nativeElement as HTMLElement);

    if (carousel) {
      this.setUpMain();
      this.orderItems();

      console.log('CAROUSEL', { width: carousel.clientWidth, height: carousel.clientHeight }, this.isVertical, this._maximizeItem);
    }
  }

  private fullSizeOrder(id: string = '') {
    const carousel = (this.carousel.nativeElement as HTMLElement);

    if (!carousel || this.items.length === 0) {
      return;
    }

    if (!id) {
      id = this.items.first.data;
    }

    this._itemStyles.set(id, {
      width: `${carousel.clientWidth}px`,
      height: `${carousel.clientHeight}px`,
      'z-index': 3,
      left: '0',
      top: '0'
    });
  }

  private calcMaxSlides(divide) {
    this._maxSlides = Math.ceil(this.items.length / divide);

    // console.log('CALC MAX SLIDES', this._maxSlides, this.items.length, divide);

    if (this._maxSlides && this._currentSlide > this._maxSlides) {
      this._currentSlide = this._maxSlides;
      this.slideChange.emit(this._currentSlide);
    }
  }

  private slideOrderItemSize(): {width: number, height: number} {
    const carousel = (this.carousel.nativeElement as HTMLElement);

    let width = 0;
    let height = 0;

    const divide = Math.min(this._maxItemsPerPage, this.items.length);

    if (carousel) {
      width = carousel.clientWidth / (divide - 1);
      height = carousel.clientHeight / (divide - 1);
    }

    return { width, height };
  }

  private slideCalcExtraOffset(sizeConst: number): number {
    const pageSize = (this._maxItemsPerPage - 1) * sizeConst;
    const realSize = (this.items.length - 1) * sizeConst;
    const estimateSize = pageSize * this._maxSlides;

    return estimateSize - realSize;
  }

  private slideOrder() {
    const carousel = (this.carousel.nativeElement as HTMLElement);

    if (!carousel) {
      return;
    }

    this.calcMaxSlides(this._maxItemsPerPage - 1);

    const itemSize = this.slideOrderItemSize();

    let index = 0;

    let offset = carousel.clientWidth * (this._currentSlide - 1);
    let extraOffset = this.slideCalcExtraOffset(itemSize.width);
    if (this.isVertical) {
      offset = carousel.clientHeight * (this._currentSlide - 1);
      extraOffset = this.slideCalcExtraOffset(itemSize.height);
    }

    if (this._maxSlides > 1 && this._currentSlide === this._maxSlides) {
      offset -= extraOffset;
    }

    this.items.forEach(item => {
      if (this._maximizeItem === item.data) {
        this.fullSizeOrder(item.data);
        return;
      }

      let style: any = {
        width: `${itemSize.width}px`,
        height: `${itemSize.height}px`,
        'z-index': 0,
      };

      if (this.isVertical) {
        if (item.data === this._currentItem) {
          style = {
            width: `${carousel.clientWidth - itemSize.width}px`,
            height: `${carousel.clientHeight}px`,
            top: '0',
            left: '0',
            'z-index': 1,
          };
        } else {
          style = { ...style,
            top: `${itemSize.height * index - offset}px`,
            left: `${carousel.clientWidth - itemSize.width}px`
          };
          index++;
        }
      } else {
        if (item.data === this._currentItem) {
          style = {
            width: `${carousel.clientWidth}px`,
            height: `${carousel.clientHeight - itemSize.height}px`,
            top: '0',
            left: '0',
            'z-index': 1,
          };
        } else {
          style = { ...style,
            left: `${itemSize.width * index - offset}px`,
            top: `${carousel.clientHeight - itemSize.height}px`
          };
          index++;
        }
     }

     this._itemStyles.set(item.data, style);
    });
  }

  private gridOrder() {
    const carousel = (this.carousel.nativeElement as HTMLElement);

    if (!carousel) {
      return;
    }

    if (this.items.length === 1) {
      this.fullSizeOrder();
    } else {
      const { cols, rows } = this.calcGridMatrix(4 / 3);

      this.calcMaxSlides(rows * cols);

      const itemSize = {
        width: carousel.clientWidth / cols,
        height: carousel.clientHeight / rows
      };

      const maxRows = Math.ceil(this.items.length / cols);
      const extraRows = (this._maxSlides * rows) - maxRows;

      const lastRowItems = this.items.length - ((maxRows - 1) * cols);

      let offset = carousel.clientHeight * (this._currentSlide - 1);
      if (this._maxSlides > 1 && this._currentSlide === this._maxSlides) {
         offset -= extraRows * itemSize.height;
      }

      let style: any = {
        width: `${itemSize.width}px`,
        height: `${itemSize.height}px`,
      };

      let tr = 1;
      let td = 0;

      this.items.forEach((item, i) => {
        i = i + 1;

        if (td >= cols) {
          td = 0;
          tr++;
        }
        td++;

        if (this._maximizeItem === item.data) {
          this.fullSizeOrder(item.data);
          return;
        }

        style = { ...style,
          left: `${itemSize.width * td - itemSize.width}px`,
          top: `${itemSize.height * tr - itemSize.height - offset}px`
        };

        if (tr === maxRows && lastRowItems < cols) {
          const _w_ = carousel.clientWidth / lastRowItems;
          style = { ...style,
            width: `${_w_}px`,
            left: `${_w_ * td - _w_}px`
          };
        }

        // console.log({
        //   id: item.data,
        //   max: itemSize.height * rows,
        //   maxS: this._maxSlides,
        //   height: itemSize.height,
        // }, { tr, td, cols, rows});
        this._itemStyles.set(item.data, style);
      });
    }
  }

  private calcGridMatrix(ratio) {
    const carousel = (this.carousel.nativeElement as HTMLElement);

    if (!carousel) {
      return;
    }
    let cols, rows = 0;

    const numItems = this.items.length;
    const parentWidth = carousel.clientWidth;
    const parentHeight = carousel.clientHeight;

    const visibleItems = Math.min(6, numItems);
    let _cols = 1;
    let _rows = 1;
    let bestRatio = Number.MAX_VALUE;
    const parentRatio = (parentWidth / parentHeight) * ratio;

    let emptyItems = 0;
    if (numItems >= 3) {
      emptyItems = 1; // shows if we allow _rows with lower number of elements
    }

    while (_cols * _rows <= visibleItems + emptyItems) {
      while (_cols * _rows <= visibleItems + emptyItems) {
        if (_cols * _rows >= visibleItems && (_cols * _rows - visibleItems) <= 2) {
          if (Math.abs(parentRatio - ratio * (_cols / _rows)) < bestRatio) {
            bestRatio = Math.abs(parentRatio - ratio * (_cols / _rows));
            cols = _cols;
            rows = _rows;
          }

          if (Math.abs(parentRatio - ratio * (_rows / _cols)) < bestRatio) {
            bestRatio = Math.abs(parentRatio - ratio * (_rows / _cols));
            cols = _rows;
            rows = _cols;
          }
        }
        _rows++;
      }
      _cols++;
      _rows = 1;
    }

    return {cols, rows};
  }

  private orderItems() {
    if (this._view === AdvancedCarouselView.GRID || this.items.length < 4) {
      this.gridOrder();
    } else {
      this.slideOrder();
    }
  }
}
