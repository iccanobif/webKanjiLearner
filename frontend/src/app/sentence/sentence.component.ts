import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/model/sentence';
import { SentencesService } from 'src/app/sentences.service';

@Component({
  selector: 'app-sentence',
  templateUrl: './sentence.component.html',
  styleUrls: ['./sentence.component.css']
})
export class SentenceComponent implements OnInit {
  thisSentence: Sentence;
  constructor(private sentencesService: SentencesService) { }

  ngOnInit() {
    this.sentencesService.getRandomSentence()
    .subscribe(sentence => this.thisSentence = sentence);
  }

}
