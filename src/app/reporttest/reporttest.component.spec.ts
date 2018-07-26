import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporttestComponent } from './reporttest.component';

describe('ReporttestComponent', () => {
  let component: ReporttestComponent;
  let fixture: ComponentFixture<ReporttestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReporttestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporttestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
