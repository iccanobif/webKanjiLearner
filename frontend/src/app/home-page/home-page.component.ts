import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { Sentence } from 'src/model/sentence';
import { HiddenCharactersService } from '../hidden-characters.service';
import { kanjiList } from '../available-kanji-list'

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent {
  kanjiList: string[] = kanjiList
}
