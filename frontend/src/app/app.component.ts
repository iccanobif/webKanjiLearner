import { Component } from '@angular/core';
import { SentencesService } from './sentences.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'webKanjiLearnerFrontend';
  sentenceList = [];

  constructor(private sentencesService: SentencesService) {}

  ngOnInit() {
    
    this.sentencesService.getRandomSentences()
      .pipe(
        catchError(err => {
          return of(null);
        })
      )
      .subscribe(sentenceList => {
        this.sentenceList = sentenceList;
      });
  }
}
