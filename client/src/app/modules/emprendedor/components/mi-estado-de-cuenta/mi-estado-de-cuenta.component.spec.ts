import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiEstadoDeCuentaComponent } from './mi-estado-de-cuenta.component';

describe('MiEstadoDeCuentaComponent', () => {
  let component: MiEstadoDeCuentaComponent;
  let fixture: ComponentFixture<MiEstadoDeCuentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiEstadoDeCuentaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiEstadoDeCuentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
