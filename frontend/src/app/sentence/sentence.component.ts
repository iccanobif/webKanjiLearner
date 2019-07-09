import { Component, Input } from '@angular/core';
import { Sentence } from 'src/model/sentence';

@Component({
  selector: 'app-sentence',
  templateUrl: './sentence.component.html',
  styleUrls: ['./sentence.component.css']
})
export class SentenceComponent {
  @Input() sentence: Sentence;
  translationVisible: boolean = false;

  showTranslation() {
    this.translationVisible = true;
  }
}
