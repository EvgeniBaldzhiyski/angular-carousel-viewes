import { Directive, TemplateRef, Input } from '@angular/core';

@Directive({
  selector: '[appAdvancedCarouselItem]'
})
export class AdvancedCarouselItemDirective {
  @Input() set advancedCarouselItem(value: any) {
    if (!value) {
      return;
    }

    this.data = value;
  }

  public data: any = { };

  constructor(
    public tpl: TemplateRef<any>
  ) {}
}
