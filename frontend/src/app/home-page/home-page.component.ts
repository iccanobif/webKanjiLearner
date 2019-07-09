import { Component, OnInit } from '@angular/core';
import { SentencesService } from '../sentences.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  title = 'webKanjiLearnerFrontend';
  sentenceList = [];

  constructor(private sentencesService: SentencesService) { }

  ngOnInit() {

    this.sentencesService.getRandomSentences()
      .subscribe(sentenceList => {
        this.sentenceList = sentenceList;
      });
  }
}
