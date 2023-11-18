import { isPlatformServer } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';


type BranchData = {
	ref: string;
	node_id: string;
	url: string;
	object: {
		type: string;
		sha: string;
		url: string;
	};
}

@Injectable({ providedIn: 'root' })
export class DataService {

	#currentBranch = signal<BranchData | undefined>(undefined);
	isServer = isPlatformServer(inject(PLATFORM_ID));

	currentBranch = computed(() => this.#currentBranch())

	constructor() {

		if (this.isServer) return;
		const curBranch = localStorage.getItem('cur_branch')
		if (!curBranch) return;

		this.#currentBranch.set(JSON.parse(curBranch));

	}

	setCurrentBranch(branch: BranchData) {

		this.#currentBranch.set(branch);
		if (this.isServer) return;
		localStorage.setItem('cur_branch', JSON.stringify(branch));
	}
}