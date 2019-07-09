import { Component, OnInit, Input } from '@angular/core';
import { Sentence } from 'src/model/sentence';
import { SentencesService } from '../sentences.service';

@Component({
  selector: 'app-sentence-loader',
  templateUrl: './sentence-loader.component.html',
  styleUrls: ['./sentence-loader.component.css']
})
export class SentenceLoaderComponent implements OnInit {
  @Input() sentence: Sentence;

  constructor(private sentenceService: SentencesService) { }

  ngOnInit() {
  }

  loadNewSentence()
  {
    this.sentenceService.getRandomSentence(this.sentence.kanji)
    .subscribe(s => 
      {
        this.sentence = s
      })
  }

  hideCharacter()
  {
    alert("hiding character")
  }

}
