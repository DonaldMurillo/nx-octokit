import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileTypeComponent } from '../file-type/file-type.component';
import { FolderRef } from '../../service/octokit/models';

@Component({
	selector: 'nx-octokit-folder-type',
	standalone: true,
	imports: [
		CommonModule,
		FileTypeComponent,
		forwardRef(() => FolderTypeComponent)
	],
	templateUrl: './folder-type.component.html',
	styleUrls: ['./folder-type.component.scss'],
})
export class FolderTypeComponent {

	@Input({ required: true }) folderRef!: FolderRef;

}
