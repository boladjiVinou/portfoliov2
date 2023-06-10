import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {EventEmitter, NgZone} from '@angular/core';
import {} from 'jasmine';
import { SudokuComponent } from './sudoku.component';
import { SudokuService } from './sudoku.service';
import {LanguageService} from '../../../services/languageService';
import { Observable, BehaviorSubject } from 'rxjs';


function createNgZoneSpy(): NgZone {
  const spy = jasmine.createSpyObj('ngZoneSpy', {
    onStable: new EventEmitter(false),
    run: (fn: () => void) => fn(),
    runOutsideAngular: (fn: () => void) => fn(),
    simulateZoneExit: () => { this.onStable.emit(null); },
  });

  return spy;
}

describe('SudokuComponent', () => {
  let component: SudokuComponent;
  let fixture: ComponentFixture<SudokuComponent>;

  const mockLanguageService = {
    getEnglishLangageState(): Observable<boolean>{
      return null;
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SudokuComponent ],
      providers: [
        SudokuService, { provide: LanguageService, useValue: mockLanguageService },
        { provide: NgZone, useValue: createNgZoneSpy() }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SudokuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    const bs = new BehaviorSubject<boolean>(true);
    spyOn(mockLanguageService, 'getEnglishLangageState').and.returnValue( bs.asObservable());
    expect(component).toBeTruthy();
  });
});
