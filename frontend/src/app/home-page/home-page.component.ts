import { Component, OnInit, AfterViewInit } from '@angular/core';
import { allKanji } from '../all-kanji-list'
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ScrollPositionRestorerService } from '../scroll-position-restorer.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit, AfterViewInit {

  kanjiToShow: string[]
  username: string

  constructor(
    private route: ActivatedRoute, 
    private scrollPositionRestorer: ScrollPositionRestorerService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.username = paramMap.get("username")
    })

    this.route.data.subscribe((data: { hiddenCharacters: string[] }) => {
      const hiddenCharacters = new Set(data.hiddenCharacters)
      this.kanjiToShow = allKanji.filter(k => !hiddenCharacters.has(k))
    })
  }

  ngAfterViewInit(): void {
    this.scrollPositionRestorer.restoreScrollPosition();
  }
}
