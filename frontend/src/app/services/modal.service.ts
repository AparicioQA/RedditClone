import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export interface ModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalState$ = new BehaviorSubject<{ data: ModalData; type: 'alert' | 'confirm' } | null>(null);
  private action$ = new Subject<boolean>();

  getModalState(): Observable<{ data: ModalData; type: 'alert' | 'confirm' } | null> {
    return this.modalState$.asObservable();
  }

  alert(data: ModalData): Observable<boolean> {
    this.modalState$.next({ data, type: 'alert' });
    return this.action$.pipe(
      take(1),
      filter((result) => result !== undefined)
    );
  }

  confirm(data: ModalData): Observable<boolean> {
    this.modalState$.next({ data, type: 'confirm' });
    return this.action$.pipe(
      take(1),
      filter((result) => result !== undefined)
    );
  }

  close(result: boolean): void {
    this.modalState$.next(null);
    this.action$.next(result);
  }
}
