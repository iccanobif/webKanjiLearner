import { Injectable } from '@angular/core';
import { ViewportScroller } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionRestorerService {

  constructor(private viewportScroller: ViewportScroller) { }

  restoreScrollPosition()
  {
    this.viewportScroller.scrollToPosition(window["scrollPositionToRestore"]);
  }
}
