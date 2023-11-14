export interface FileEntry {
	path: string;
	content?: string; // Content will be fetched on demand
	type: 'file';
}

export interface FolderEntry {
	path: string;
	children: Array<FileEntry | FolderEntry>;
	type: 'dir';
}

export type RepositoryEntry = FileEntry | FolderEntry;


export interface FileRef {
	type: 'file';
	content: string; // or any other properties relevant to files
	decodedContent?: {
		value: string;
		type?: 'json' | 'txt' | 'ts';
	} 
}

export interface FolderRef {
	name: string;
	type: 'folder';
	children: { [key: string]: FileRef | FolderRef };
}

export type FileTree = FileRef | FolderRef;