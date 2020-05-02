import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SentencesForWordComponent } from './sentences-for-word.component';

describe('SentencesForWordComponent', () => {
  let component: SentencesForWordComponent;
  let fixture: ComponentFixture<SentencesForWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SentencesForWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SentencesForWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
