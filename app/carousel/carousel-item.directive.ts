import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[appCarouselItem]'
})
export class CarouselItemDirective {
  @Input() set appCarouselItem(value: any) {
    if (!value) {
      return;
    }

    this.data = value;
  }

  public data: any = {}

  constructor(
    public tpl: TemplateRef<any>
  ) {}
}
