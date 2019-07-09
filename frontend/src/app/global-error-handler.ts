import { ErrorHandler, Injectable } from '@angular/core';
// import { Router } from '@angular/router';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    // constructor(private router: Router) { }

    handleError(error: any) {
        // this.router.navigate(["error"])
        console.error(error);
        alert("there has been an error");
    }
}
