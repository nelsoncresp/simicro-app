import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiEmprendimientoComponent } from './mi-emprendimiento.component';

describe('MiEmprendimientoComponent', () => {
  let component: MiEmprendimientoComponent;
  let fixture: ComponentFixture<MiEmprendimientoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiEmprendimientoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MiEmprendimientoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
