import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../service/data/data.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { OctokitService } from '../../service/octokit/octokit.service';

@Component({
  selector: 'nx-octokit-branching',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branching.component.html',
  styleUrls: ['./branching.component.scss'],
})
export class BranchingComponent {
	dataService = inject(DataService);
	octoService = inject(OctokitService);
	branch = new FormControl('');

	createBranch() {
		
		if (!this.branch.value) return;
		
		this.octoService.createBranch('DonaldMurillo', 'octokit-example', this.branch.value);

	}
}
