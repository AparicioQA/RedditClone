import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnDestroy {
  modalData: { data: ModalData; type: 'alert' | 'confirm' } | null = null;
  private subscription: Subscription;

  constructor(private modalService: ModalService) {
    this.subscription = this.modalService.getModalState().subscribe((state) => {
      this.modalData = state;
    });
  }

  onConfirm(): void {
    this.modalService.close(true);
  }

  onCancel(): void {
    this.modalService.close(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
