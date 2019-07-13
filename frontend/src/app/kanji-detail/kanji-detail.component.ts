import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { KanjiDetail } from 'src/model/kanji-detail';

@Component({
  selector: 'app-kanji-detail',
  templateUrl: './kanji-detail.component.html',
  styleUrls: ['./kanji-detail.component.css']
})
export class KanjiDetailComponent implements OnInit {

  character: string
  kanjiDetail: KanjiDetail

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.character = params.get("character")
    })

    this.route.data.subscribe((data: { kanjiDetail: KanjiDetail }) => {
      this.kanjiDetail = data.kanjiDetail
    })
  }

}
