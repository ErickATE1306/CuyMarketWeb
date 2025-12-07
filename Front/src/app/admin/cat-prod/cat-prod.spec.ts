import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatProd } from './cat-prod';

describe('CatProd', () => {
  let component: CatProd;
  let fixture: ComponentFixture<CatProd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatProd]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatProd);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
