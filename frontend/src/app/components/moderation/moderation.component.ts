import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-moderation',
  standalone: true,
  imports: [CommonModule, NavbarComponent, TranslatePipe],
  templateUrl: './moderation.component.html',
  styleUrls: ['./moderation.component.css']
})
export class ModerationComponent {}
