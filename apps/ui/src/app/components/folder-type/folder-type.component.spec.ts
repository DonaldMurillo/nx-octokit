import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FolderTypeComponent } from './folder-type.component';

describe('FolderTypeComponent', () => {
  let component: FolderTypeComponent;
  let fixture: ComponentFixture<FolderTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FolderTypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FolderTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
