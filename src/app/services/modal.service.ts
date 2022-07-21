import { Injectable } from '@angular/core';

interface IModal {
  id: string;
  visible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modals: IModal[] = [];

  constructor() { }

  unregister(id: string) {
    this.modals = this.modals.filter(m => m.id !== id);
  }

  register(id: string) {
    this.modals = [...this.modals, {id, visible: false}]
  }

  isModalOpen(id: string): boolean {
    return Boolean(this.modals.find(modal => modal.id === id)?.visible);
  }

  toggleModal(id: string): void {
    const modal = this.modals.find(modal => modal.id === id);

    if (modal) {
      modal.visible = !modal.visible;
    }
  }
}
