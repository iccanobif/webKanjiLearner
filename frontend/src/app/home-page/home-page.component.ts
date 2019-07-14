import { Component, OnInit } from '@angular/core';
import { allKanji } from '../all-kanji-list'
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  kanjiToShow: string[]
  username: string

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      this.username = paramMap.get("username")
    })
    
    this.route.data.subscribe((data: { hiddenCharacters: string[] }) => {
      const hiddenCharacters = new Set(data.hiddenCharacters)
      this.kanjiToShow = allKanji.filter(k => !hiddenCharacters.has(k))
    })
  }
}
