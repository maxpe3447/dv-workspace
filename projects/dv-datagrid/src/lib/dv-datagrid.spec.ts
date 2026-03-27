import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DvDatagrid } from './dv-datagrid';

describe('DvDatagrid', () => {
  let component: DvDatagrid;
  let fixture: ComponentFixture<DvDatagrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DvDatagrid]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DvDatagrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
