import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { KanjiDetailComponent } from './kanji-detail/kanji-detail.component';
import { KanjiDetailResolverService } from './kanji-detail-resolver.service';

const routes: Routes = [
  { path: "", component: HomePageComponent },
  {
    path: "kanji/:character",
    component: KanjiDetailComponent,
    resolve: { kanjiDetail: KanjiDetailResolverService },
  },
  { path: "error", component: ErrorPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
