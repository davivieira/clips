import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {

  @Input()
  activeClip: IClip | null = null;

  @Output()
  update = new EventEmitter();

  clipID = new FormControl('');
  title: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  editForm: FormGroup = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  inSubmission = false;
  showAlert = false;
  alertColor = "blue";
  alertMsg = 'Please wait! Updating Clip';

  constructor(private modal: ModalService, private clipService: ClipService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.activeClip) {
      return
    }

    this.inSubmission = false;
    this.showAlert = false;

    this.clipID.setValue(this.activeClip.docID);
    this.title.setValue(this.activeClip.title);
  }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unregister('editClip');
  }

  async submit() {
    if (!this.activeClip) {
      return;
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = "blue";
    this.alertMsg = 'Please wait! Updating Clip';

    try {
      await this.clipService.updateClip(this.clipID.value, this.title.value)
    } catch(e) {
      this.inSubmission = false;
      this.alertColor = "red";
      this.alertMsg = 'Something went wrong! Please try again.';
    }

    this.activeClip.title = this.title.value;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = "green";
    this.alertMsg = 'Success';

  }

}
