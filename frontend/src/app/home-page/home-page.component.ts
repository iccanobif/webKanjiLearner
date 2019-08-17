import { Component, OnInit, AfterViewInit } from '@angular/core';
import { allKanji } from '../all-kanji-list'
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ScrollPositionRestorerService } from '../scroll-position-restorer.service';
import { HiddenCharactersService } from '../hidden-characters.service';

interface Kanji { character: string, isHidden: boolean }

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, AfterViewInit {

  username: string
  kanjiToDisplay: Kanji[]

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private scrollPositionRestorer: ScrollPositionRestorerService,
    private hiddenCharactersService: HiddenCharactersService) { }
  hiddenCharacters: Set<string>

  refreshKanjiToDisplay() {
    this.kanjiToDisplay = allKanji.map(k => ({
      character: k,
      isHidden: this.hiddenCharacters.has(k)
    }))
    console.log("aggiornati kanji to display")
  }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.username = paramMap.get("username")
    })

    this.route.data.subscribe((data: { hiddenCharacters: Set<string> }) => {
      this.hiddenCharacters = data.hiddenCharacters
      this.refreshKanjiToDisplay()
    })
  }

  ngAfterViewInit(): void {
    this.scrollPositionRestorer.restoreScrollPosition();
  }

  characterClicked(kanji: string) {
    switch (true) {
      case (document.getElementById("OPEN") as HTMLInputElement).checked:
        this.router.navigate(
          ["kanji", kanji],
          { relativeTo: this.route }
        )
        break;
      case (document.getElementById("HIDE") as HTMLInputElement).checked:

        const todoAfterOperation = () => {
          this.hiddenCharactersService
            .getHiddenCharacters(this.username)
            .subscribe(hiddenCharacters => {
              this.hiddenCharacters = hiddenCharacters
              this.refreshKanjiToDisplay()
            })
        }
        if (this.hiddenCharacters.has(kanji)) {
          this.hiddenCharactersService.unhide(this.username, kanji)
            .subscribe(todoAfterOperation)
        }
        else {
          this.hiddenCharactersService.hide(this.username, kanji)
            .subscribe(todoAfterOperation)
        }

        break;
    }
  }

  trackByFn(kanji: Kanji): any {
    return kanji.character + kanji.isHidden
  }
}
