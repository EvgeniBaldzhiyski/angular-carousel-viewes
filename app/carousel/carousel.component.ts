import { Component, ContentChildren, QueryList, ElementRef, ViewChild, Input,
        Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, SimpleChanges, OnDestroy, NgZone } from '@angular/core';
import { AnimationPlayer, AnimationBuilder, animate, style, AnimationFactory } from '@angular/animations';
import { CarouselItemDirective } from './carousel-item.directive';
import { Subject, interval, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarouselComponent implements OnChanges, OnDestroy{
  items:  QueryList<CarouselItemDirective>;
  itemStyle = {};
  cntStyle = {};

  private _itemsPerPage = 2;
  private _maxSlides = 1;
  private _currentSlide = 1;
  private _resizeChecker = new Subscription();

  @ViewChild('carousel', { static: true }) private carousel: ElementRef;
  @ViewChild('scroller', { static: true }) private scroller: ElementRef;

  @ContentChildren(CarouselItemDirective) set _items(list: QueryList<CarouselItemDirective>) {
    this.items = list;

    console.log('CAROUSEL ITEMS', this.items.length);

    this.genDemotions();
    this.cd.detectChanges();

    this.itemListChange.emit({length: this.items.length, maxSlides: this._maxSlides});

    if (this.items.length) {
      this.ngZone.runOutsideAngular(
        this._startResizeCheckRate
      );
    } else {
      this._resizeChecker.unsubscribe();
    } 
  }

  @Input() set itemsPerPage(value: number) {
    this._itemsPerPage = value;

    this.genDemotions();
    this.cd.detectChanges();
  }

  @Input() freeFill = false;
  @Input() isVertical = false;
  @Input() timing = '250ms ease-in';

  @Input() activeItem: number = 0;

  @Output() slideChange: EventEmitter<{from: number, to: number}> = new EventEmitter();
  @Output() slideChangeDone: EventEmitter<{offset: number}> = new EventEmitter();

  @Output() itemListChange: EventEmitter<{length: number, maxSlides: number}> = new EventEmitter();

  @Output() resize: EventEmitter<{
    from: {width: number, height: number},
    to: {width: number, height: number}
  }> = new EventEmitter();
  
  constructor(
    private builder: AnimationBuilder,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.freeFill !== undefined || changes.isVertical !== undefined) {
      this.genDemotions();
    }
  }

  ngOnDestroy() {
    this._resizeChecker.unsubscribe();
  }

  prevPage() {
    if (this._currentSlide - 1 > 0) {
      this._currentSlide--;
      console.log('call next', this._currentSlide);
      this.slideChange.emit({ from: this._currentSlide, to: this._currentSlide - 1 });
      this.playAnimation();
    }
  }

  nextPage() {
    if (this._currentSlide + 1 <= this._maxSlides) {
      this._currentSlide++;
      console.log('call prev', this._currentSlide);
      this.slideChange.emit({ from: this._currentSlide, to: this._currentSlide + 1 });
      this.playAnimation();
    }
  }

  goTo(page) {
    if (page !== this._currentSlide && page > 0 && page <= this._maxSlides) {
      const lastSlide = this._currentSlide;
      this._currentSlide = page;
      console.log(`call goto ${page}`, this._currentSlide);
      this.slideChange.emit({ from: lastSlide, to: this._currentSlide });
      this.playAnimation();
    }
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

    let divide = this._itemsPerPage;
    if (this.items.length < this._itemsPerPage && this.freeFill) {
      divide = this.items.length;
    }

    let size = '';
    if (carousel) {
      size = `${(this.isVertical ? carousel.clientHeight : carousel.clientWidth) / divide}px`;
    } else {
      size = `${100 / divide}%`;
    }
    
    this.itemStyle = { [this.isVertical ? 'height' : 'width'] : size };
    this._maxSlides = Math.ceil(this.items.length / this._itemsPerPage);

    if (this._maxSlides && this._currentSlide > this._maxSlides) {
      const lastSlide = this._currentSlide;
      this._currentSlide = this._maxSlides;
      this.slideChange.emit({ from: lastSlide, to: this._currentSlide });
      this.playAnimation(true);
    }

    if (this.isVertical) {
      this.cntStyle = { height: `${this._maxSlides * carousel.clientHeight}px` };
    } else {
      this.cntStyle = { width: `${this._maxSlides * carousel.clientWidth}px` };
    }

    console.log('CAROUSEL', { width: carousel.clientWidth, height: carousel.clientHeight }, this.isVertical, this.itemStyle);
  }

  private playAnimation(forse = false) {
    if (!this.carousel || !this.scroller) {
      return;
    }
    const carousel = (this.carousel.nativeElement as HTMLElement);

    let offset = carousel.clientWidth * (this._currentSlide - 1);
    let transform = `translateX(-${offset}px)`;
    if (this.isVertical) {
      offset = carousel.clientHeight * (this._currentSlide - 1)
      transform = `translateY(-${offset}px)`;
    }

    console.log('PLAY', transform, this._currentSlide);

    const player = this.builder.build([
      animate((forse ? '0ms ease-in' : this.timing), style({ transform: transform }))
    ])
    .create(this.scroller.nativeElement);

    player.onDone(() => {
      console.log('END ANIMATION', offset);
      this.slideChangeDone.emit({ offset }); 
    });
    player.play();
  }

  private _startResizeCheckRate = () => {
    this._resizeChecker.unsubscribe();

    let lastDemotion = {width: 0, height: 0};
    if (this.carousel) {
      const carousel = (this.carousel.nativeElement as HTMLElement);

      lastDemotion = {width: carousel.clientWidth, height: carousel.clientHeight};
    }

    this._resizeChecker = interval(500).subscribe(_ => {
      if (this.carousel) {
        const _carousel = (this.carousel.nativeElement as HTMLElement);

        if (_carousel.clientWidth !== lastDemotion.width || _carousel.clientHeight !== lastDemotion.height) {
          const to = {width: _carousel.clientWidth, height: _carousel.clientHeight};

          this.ngZone.run(() => this.resize.emit({
            from: lastDemotion, to
          }));

          lastDemotion = to;
          this.genDemotions();
          this.playAnimation(true);

          this.cd.detectChanges();
        }
      }
    });
  }
}
