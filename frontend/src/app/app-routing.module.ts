import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { KanjiDetailComponent } from './kanji-detail/kanji-detail.component';
import { KanjiDetailResolverService } from './kanji-detail-resolver.service';
import { LoginPageComponent } from './login-page/login-page.component';
import { HiddenCharactersResolverService } from './hidden-characters-resolver.service';
import { SentencesForWordComponent } from './sentences-for-word/sentences-for-word.component';
import { DictionaryComponent } from './dictionary/dictionary.component';
import { DictionaryEntryResolverService } from './dictionary-entry-resolver.service';
import { SentencesForWordResolverService } from './sentences-for-word-resolver.service';

const routes: Routes = [
  { path: "", component: LoginPageComponent },
  { path: "error", component: ErrorPageComponent },
  {
    path: "dictionary/:word",
    component: DictionaryComponent,
    resolve: {
      dictionaryEntry: DictionaryEntryResolverService
    }
  },
  {
    path: ":username/kanji/:character",
    component: KanjiDetailComponent,
    resolve: {
      kanjiDetail: KanjiDetailResolverService,
      // the hiddenCharacters list isn't actually used by KanjiDetailComponent, but this forces a cache refresh 
      hiddenCharacters: HiddenCharactersResolverService,
    },
  },
  {
    path: ":username/kanji/:character/:word",
    component: SentencesForWordComponent,
    resolve: { sentences: SentencesForWordResolverService }
  },
  {
    path: ":username",
    component: HomePageComponent,
    resolve: { hiddenCharacters: HiddenCharactersResolverService }
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: "enabled",
    anchorScrolling: "enabled",
    paramsInheritanceStrategy: "always",
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
