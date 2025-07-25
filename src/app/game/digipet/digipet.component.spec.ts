import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DigipetComponent } from './digipet.component';

describe('DigipetComponent', () => {
  let component: DigipetComponent;
  let fixture: ComponentFixture<DigipetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DigipetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DigipetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
