import { Component, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router, Scroll, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { filter, tap } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

    private scrollPositionSubscription: Subscription = new Subscription();
    loading: boolean = false;

    constructor(
        private router: Router
    ) { }

    ngOnInit(): void {
        this.scrollPositionSubscription = this.router.events.pipe(
            filter((e: any) => e instanceof Scroll),
            tap((e: any) => {
                window["scrollPositionToRestore"] = (e as Scroll).position ? (e as Scroll).position : [0, 0];
            })
        ).subscribe();

        this.scrollPositionSubscription = this.router.events.subscribe((event: Event) => {
            switch (true) {
                case event instanceof NavigationStart: {
                    document.getElementById("loader").style.display = "block";
                    break;
                }

                case event instanceof NavigationEnd:
                case event instanceof NavigationCancel:
                case event instanceof NavigationError: {
                    document.getElementById("loader").style.display = "none";
                    break;
                }
                default: {
                    break;
                }
            }

        })
    }

    ngOnDestroy(): void {
        this.scrollPositionSubscription.unsubscribe();
    }
}



