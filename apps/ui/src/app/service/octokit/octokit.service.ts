import { Injectable, signal } from "@angular/core";
import { Octokit } from "octokit";
import { FolderEntry, RepositoryEntry, FileEntry, FileTree, FolderRef, FileRef } from "./models";

@Injectable({
	providedIn: 'root'
})
export class OctokitService {
	private octo = new Octokit();
	private root: FolderEntry = { path: '', children: [], type: 'dir' };
	
	fileTree = signal<undefined | FileTree>(undefined);

	constructor() {
		// this.buildFileStructure('DonaldMurillo', 'octokit-example');
		this.fetchRepositoryFileTree('DonaldMurillo', 'octokit-example').then((f) => this.fileTree.set(f));
	}

	private async buildFileStructure(owner: string, repo: string, path: string = '', parent: FolderEntry = this.root) {
		try {
			const { data } = await this.octo.rest.repos.getContent({ owner, repo, path });

			if (Array.isArray(data)) {
				for (const file of data) {

					if (file.type === 'submodule' || file.type === 'symlink') return;

					const entry: RepositoryEntry = { path: file.path, type: file.type } as RepositoryEntry;

					if (entry.type === 'dir') {
						entry.children = [];
						await this.buildFileStructure(owner, repo, file.path, entry as FolderEntry);
					}
					parent.children.push(entry);
				}
			}
		} catch (error) {
			console.error('Error fetching repository contents:', error);
		}
	}

	async fetchRepositoryFileTree(owner: string, repo: string, path: string = '', name = 'root'): Promise<FileTree> {
		try {
			const response = await this.octo.rest.repos.getContent({ owner, repo, path });
			const data = response.data;

			if (Array.isArray(data)) { // It's a directory
				const folder: FolderRef = { type: 'folder', children: {}, name };
				for (const item of data) {
					folder.children[item.name] = await this.fetchRepositoryFileTree(owner, repo, item.path, item.name);
				}
				return folder;
			} else { // It's a file
				const dataSplit = data.name.split('.');
				const file: FileRef = { 
					type: 'file', 
					content: (data as any).content,
					decodedContent: dataSplit.length === 1 || ['json', 'txt', 'ts'].includes(dataSplit.at(-1) ?? '') ? {
						type: dataSplit.length === 1 ? undefined : dataSplit.at(-1) as any,
						value: atob((data as any).content)
					} : undefined
				};
				return file;
			}
		} catch (error) {
			console.error('Error fetching repository data:', error);
			throw error;
		}
	}

	async fetchFileContent(file: FileEntry): Promise<string> {
		if (file.content) {
			return file.content; // Cached content
		}

		try {
			const response = await this.octo.rest.repos.getContent({
				owner: 'DonaldMurillo',
				repo: 'octokit-example',
				path: file.path
			});

			if (Array.isArray(response.data)) return '';
			if (response.data.type === 'file' && 'content' in response.data) {
				const content = atob(response.data.content);
				file.content = content;
				return content;
			}

			throw new Error('Invalid file type');
		} catch (error) {
			console.error('Error fetching file content:', error);
			throw error;
		}
	}

	getRoot(): FolderEntry {
		return this.root;
	}

	// Additional methods to access specific files or folders can be added here
}

