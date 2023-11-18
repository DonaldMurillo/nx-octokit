import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey, signal } from "@angular/core";
import { Octokit } from "octokit";
import { FolderEntry, RepositoryEntry, FileEntry, FileTree, FolderRef, FileRef } from "./models";
import { DataService } from "../data/data.service";
import { isPlatformServer } from "@angular/common";

@Injectable({
	providedIn: 'root'
})
export class OctokitService {
	private octo: Octokit;
	private root: FolderEntry = { path: '', children: [], type: 'dir' };
	private dataService = inject(DataService);
	private transferState = inject(TransferState);
	isServer = isPlatformServer(inject(PLATFORM_ID));

	fileTree = signal<undefined | FileTree>(undefined);
	authToken?: string;

	constructor() {
		// this.buildFileStructure('DonaldMurillo', 'octokit-example');
		if (this.isServer) {
			this.authToken = process.env["OCTOKIT_ACCESS_TOKEN"];
			if (this.authToken) {

				this.octo = new Octokit({ auth: this.authToken });
				this.transferState.set(makeStateKey<string>('ACCESS_TOKEN'), this.authToken);
			};

		}

		const auth = this.transferState.get(makeStateKey<string>('ACCESS_TOKEN'), '')
		this.octo = new Octokit({ auth: auth ? auth : undefined });

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

	async createBranch(owner: string, repo: string, branchName: string, sourceBranch: string = 'main'): Promise<void> {
		try {
			// Step 1: Get the SHA of the latest commit of the source branch
			const { data: refData } = await this.octo.rest.git.getRef({
				owner,
				repo,
				ref: `heads/${sourceBranch}`,
			});
			const sha = refData.object.sha;

			// Step 2: Create the new branch using the SHA
			const branch = await this.octo.rest.git.createRef({
				owner,
				repo,
				ref: `refs/heads/${branchName}`,
				sha,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28'
				}
			});

			this.dataService.setCurrentBranch(branch.data);

			console.log(`Branch '${branchName}' created successfully.`);
		} catch (error) {
			console.error('Error creating branch:', error);
			throw error;
		}
	}

	async createOrUpdateFile(owner: string, repo: string, filePath: string, fileContent = 'Default content') {

		const branch = this.dataService.currentBranch();

		const blob = new Blob([fileContent], { type: 'text/plain' });
		if (!branch) return console.error('Need to select a branch')
		const res = await this.octo.rest.repos.createOrUpdateFileContents({
			owner,
			repo,
			path: filePath,
			message: `Create ${filePath}`,
			content: (await this.blobToBase64(blob)).replace('data:text/plain;base64,',''),
			branch: branch.ref,
		});

		console.log(res);
	}

	async blobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onloadend = () => {
				// The result attribute contains the data as a base64 encoded string
				resolve(reader.result as string);
			};

			reader.onerror = reject;

			reader.readAsDataURL(blob);
		});
	}

	// Additional methods to access specific files or folders can be added here
}

