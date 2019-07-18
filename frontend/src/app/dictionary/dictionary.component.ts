import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { DictionaryEntry } from '../dictionary-entry';
import { ScrollPositionRestorerService } from '../scroll-position-restorer.service';

@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.css']
})
export class DictionaryComponent implements OnInit {

  word: string
  dictionaryEntry: DictionaryEntry

  constructor(private route: ActivatedRoute,private scrollPositionRestorer: ScrollPositionRestorerService) { }

  ngAfterViewInit(): void {
    this.scrollPositionRestorer.restoreScrollPosition();
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.word = params.get("word")
    })

    this.route.data.subscribe((data: { dictionaryEntry: DictionaryEntry }) => {
      this.dictionaryEntry = data.dictionaryEntry
    })
  }

}
