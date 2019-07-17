import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, Scroll } from '@angular/router';
import { filter, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private scrollPositionSubscription: Subscription = new Subscription();
  
  constructor(
      private router: Router
  ) {}
  
  ngOnInit(): void {
      this.scrollPositionSubscription = this.router.events.pipe(
          filter((e: any) => e instanceof Scroll),
          tap((e: any) => {
              window["scrollPositionToRestore"] = (e as Scroll).position ? (e as Scroll).position : [0, 0];
          })
      ).subscribe();
  }
  
  ngOnDestroy(): void {
      this.scrollPositionSubscription.unsubscribe();
  }
}



