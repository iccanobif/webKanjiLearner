import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule }    from '@angular/common/http';
import { FormsModule } from "@angular/forms"

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SentenceComponent } from './sentence/sentence.component';
import { GlobalErrorHandler } from './global-error-handler';
import { ErrorPageComponent } from './error-page/error-page.component';
import { HomePageComponent } from './home-page/home-page.component';
import { KanjiDetailComponent } from './kanji-detail/kanji-detail.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { SentencesForWordComponent } from './sentences-for-word/sentences-for-word.component';
import { DictionaryComponent } from './dictionary/dictionary.component';

@NgModule({
  declarations: [
    AppComponent,
    SentenceComponent,
    ErrorPageComponent,
    HomePageComponent,
    KanjiDetailComponent,
    LoginPageComponent,
    SentencesForWordComponent,
    DictionaryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
