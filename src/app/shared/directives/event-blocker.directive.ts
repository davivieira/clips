import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[app-event-blocker]'
})
export class EventBlockerDirective {

  /**
   * Selects the host element and listen for events.
   * Can be used multiple times.
   * 
   * Arguments: 
   * 1. Which event?
   * 2. Array of values to pass on to the function.
   */
  @HostListener('drop', ['$event'])
  @HostListener('dragover', ['$event'])
  public handleEvent(event: Event) {
    event.preventDefault();
  }
}
