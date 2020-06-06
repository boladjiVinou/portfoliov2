import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private langageIsEnglish: BehaviorSubject<boolean>;
  private langageIsEnglishObservable: Observable<boolean>;
  public initLangage(isEnglish: boolean) {
    this.langageIsEnglish = new BehaviorSubject<boolean>(isEnglish);
    this.langageIsEnglishObservable = this.langageIsEnglish.asObservable();
  }
  public setEnglishLangageState(isEnglish: boolean) {
    this.langageIsEnglish.next(isEnglish);
  }
  public getEnglishLangageState(): Observable<boolean> {
    return this.langageIsEnglishObservable;
  }
}
