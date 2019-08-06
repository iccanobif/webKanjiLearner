import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { KanjiDetail, Word } from 'src/model/kanji-detail';
import { HiddenCharactersService } from '../hidden-characters.service';
import { Observable, of } from 'rxjs';
import { ScrollPositionRestorerService } from '../scroll-position-restorer.service';
import { allKanji } from '../all-kanji-list';

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
  nextKanji: string
  prevKanji: string

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hiddenCharactersService: HiddenCharactersService,
    private scrollPositionRestorer: ScrollPositionRestorerService
  ) { }

  ngAfterViewInit(): void {
    this.scrollPositionRestorer.restoreScrollPosition();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.character = params.get("character")
      this.username = params.get("username")
      this.isCharacterHidden = this.hiddenCharactersService.isHidden(this.username, this.character)
    })

    this.route.data.subscribe((data: {
      kanjiDetail: KanjiDetail,
      hiddenCharacters: string[]
    }) => {
      const hiddenCharacters = new Set(data.hiddenCharacters)
      const availableKanji = allKanji.filter(k => !hiddenCharacters.has(k))
      const i = availableKanji.findIndex(k => k == this.character);
      this.prevKanji = i == -1 ? null : availableKanji[i - 1];
      this.nextKanji = i == -1 ? null : availableKanji[i + 1];

      this.kanjiDetail = data.kanjiDetail
    })
  }

  hideCharacter() {
    this.hiddenCharactersService.hide(this.username, this.character).subscribe(() => {
      this.isCharacterHidden = of(true)
    })
  }

  unhideCharacter() {
    this.hiddenCharactersService.unhide(this.username, this.character).subscribe(() => {
      this.isCharacterHidden = of(false)
    })
  }

  goToSentencesForWord(word: Word) {
    // alert(word.kanjiText)
    this.router
    this.router.navigate(
      [word.kanjiText],
      { relativeTo: this.route }
    )
  }
}
