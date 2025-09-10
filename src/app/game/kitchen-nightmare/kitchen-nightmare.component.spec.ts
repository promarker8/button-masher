import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenNightmareComponent } from './kitchen-nightmare.component';

describe('KitchenNightmareComponent', () => {
  let component: KitchenNightmareComponent;
  let fixture: ComponentFixture<KitchenNightmareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KitchenNightmareComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(KitchenNightmareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
