import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentenceLoaderComponent } from './sentence-loader.component';

describe('SentenceLoaderComponent', () => {
  let component: SentenceLoaderComponent;
  let fixture: ComponentFixture<SentenceLoaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentenceLoaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentenceLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
