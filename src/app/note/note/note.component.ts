import { ChangeDetectionStrategy, Component, Input, OnInit, ViewChild } from '@angular/core';
import { Note } from '../note.model';
import { NoteService } from '../note.service';
import { MatDialog } from '@angular/material';
import { DialogAddNoteReminderComponent } from '../dialog-add-note-reminder/dialog-add-note-reminder.component';
import { ReminderService } from '../../reminder/reminder.service';
import { SnackService } from '../../core/snack/snack.service';

@Component({
  selector: 'note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NoteComponent implements OnInit {
  @Input() note: Note;
  @Input() isFocus: boolean;

  @ViewChild('markdownEl') markdownEl: HTMLElement;

  constructor(
    private readonly _matDialog: MatDialog,
    private readonly _noteService: NoteService,
    private readonly _snackService: SnackService,
    private readonly _reminderService: ReminderService,
  ) {
  }

  ngOnInit() {
  }

  toggleLock() {
    this._noteService.update(this.note.id, {isLock: !this.note.isLock});
  }

  updateContent(newVal) {
    this._noteService.update(this.note.id, {content: newVal.newVal});
  }

  removeNote() {
    this._noteService.remove(this.note.id);
  }

  editReminder() {
    this._matDialog.open(DialogAddNoteReminderComponent, {
      data: {
        note: this.note,
      }
    });
  }

  removeReminder() {
    this._reminderService.removeReminder(this.note.reminderId);
    this._noteService.update(this.note.id, {reminderId: null});
    this._snackService.open({
      type: 'SUCCESS',
      message: `Deleted reminder ${this.note.reminderId} for note`,
      icon: 'schedule',
    });

  }
}
