import { Component, OnInit } from '@angular/core';
import { Sentence } from 'src/model/sentence';
import { ActivatedRoute, Router } from '@angular/router';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-sentences-for-word',
  templateUrl: './sentences-for-word.component.html',
  styleUrls: ['./sentences-for-word.component.css']
})
export class SentencesForWordComponent implements OnInit {

  sentences: Sentence[] = []

  constructor(private router: Router) { }

  ngOnInit() {
    this.sentences = window.history.state.sentences

    if (this.sentences === undefined)
      this.router.navigate(["/"])
  }

}
