import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OctokitService } from './service/octokit/octokit.service';
import { FileEntry } from './service/octokit/models';
import { JsonPipe } from '@angular/common';
import { FolderTypeComponent } from './components/folder-type/folder-type.component';
import { BranchingComponent } from './components/branching/branching.component';

@Component({
	standalone: true,
	imports: [RouterModule, JsonPipe, FolderTypeComponent, BranchingComponent],
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

	getContent() {
		this.octokitService.fetchRepositoryFileTree('DonaldMurillo', 'octokit-example').then((f) => this.octokitService.fileTree.set(f));

	}

	async createContent() {
		await this.octokitService.createOrUpdateFile('DonaldMurillo', 'octokit-example', 'dynamic/content.txt')
	}
}
