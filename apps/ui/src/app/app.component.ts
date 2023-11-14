import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OctokitService } from './service/octokit/octokit.service';
import { FileEntry } from './service/octokit/models';
import { JsonPipe } from '@angular/common';
import { FolderTypeComponent } from './components/folder-type/folder-type.component';

@Component({
	standalone: true,
	imports: [RouterModule, JsonPipe, FolderTypeComponent],
	selector: 'nx-octokit-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {


	title = 'ui';
	octokitService = inject(OctokitService);
	selected = signal('');

	async selectFile(fileEntry: FileEntry) {
		const text = await this.octokitService.fetchFileContent(fileEntry);
		this.selected.set(text);
	}
}
