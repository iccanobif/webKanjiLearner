import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { KanjiDetail, Word } from 'src/model/kanji-detail';
import { HiddenCharactersService } from '../hidden-characters.service';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-kanji-detail',
  templateUrl: './kanji-detail.component.html',
  styleUrls: ['./kanji-detail.component.css']
})
export class KanjiDetailComponent implements OnInit {

  username: string
  character: string
  kanjiDetail: KanjiDetail
  isCharacterHidden: Observable<boolean>

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hiddenCharacters: HiddenCharactersService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.character = params.get("character")
      this.username = params.get("username")
      this.isCharacterHidden = this.hiddenCharacters.isHidden(this.username, this.character)
    })

    this.route.data.subscribe((data: { kanjiDetail: KanjiDetail }) => {
      this.kanjiDetail = data.kanjiDetail
    })
  }

  hideCharacter() {
    this.hiddenCharacters.hide(this.username, this.character).subscribe(() => {
      this.isCharacterHidden = of(true)
    })
  }

  unhideCharacter() {
    this.hiddenCharacters.unhide(this.username, this.character).subscribe(() => {
      this.isCharacterHidden = of(false)
    })
  }

  goToSentencesForWord(word: Word) {
    // alert(word.kanjiText)
    this.router
    this.router.navigate(
      [word.kanjiText],
      {
        relativeTo: this.route,
        state: { sentences: this.kanjiDetail.sentences.filter(s => s.kanjiText.indexOf(word.kanjiText) >= 0) }
      }
    )
  }
}
