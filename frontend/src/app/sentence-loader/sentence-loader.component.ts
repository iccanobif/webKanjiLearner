import { Component, OnInit, Input } from '@angular/core';
import { Sentence } from 'src/model/sentence';

@Component({
  selector: 'app-sentence-loader',
  templateUrl: './sentence-loader.component.html',
  styleUrls: ['./sentence-loader.component.css']
})
export class SentenceLoaderComponent implements OnInit {
  @Input() sentence: Sentence;

  constructor() { }

  ngOnInit() {
  }

  loadNewSentence()
  {
    alert("oh yeah")
  }

  hideCharacter()
  {
    alert("hiding character")
  }

}
