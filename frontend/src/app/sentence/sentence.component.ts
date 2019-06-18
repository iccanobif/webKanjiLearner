import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/model/sentence';
import { SentencesService } from 'src/app/sentences.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

enum State {
  Loading,
  Loaded,
  Failed
};

@Component({
  selector: 'app-sentence',
  templateUrl: './sentence.component.html',
  styleUrls: ['./sentence.component.css']
})
export class SentenceComponent implements OnInit {
  thisSentence: Sentence;
  state: State = State.Loading;
  error: any = null;
  translationVisible: boolean = false;

  constructor(private sentencesService: SentencesService) { }

  ngOnInit() {
    this.sentencesService.getRandomSentence("男")
      .pipe(
        catchError(err => {
          this.error = err;
          this.state = State.Failed;
          return of(null);
        })
      )
      .subscribe(sentence => {
        this.thisSentence = sentence;
        this.state = State.Loaded;
      });
  }

  showTranslation() {
    this.translationVisible = true;
  }

}
