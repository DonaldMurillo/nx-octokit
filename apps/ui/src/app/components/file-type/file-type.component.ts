import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileRef } from '../../service/octokit/models';

@Component({
  selector: 'nx-octokit-file-type',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-type.component.html',
  styleUrls: ['./file-type.component.scss'],
})
export class FileTypeComponent {

	@Input({ required: true }) fileRef!: FileRef;

}
