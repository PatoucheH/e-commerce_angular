import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../services/auth.service';
import { AccountInfoComponent } from '../account-info/account-info';
import { PasswordChangeComponent } from '../account-password-change/account-password-change';
import { OrdersListComponent } from '../account-order-list/account-order-list';

@Component({
  selector: 'app-user-profile',
  imports: [
    CommonModule,
    AccountInfoComponent,
    PasswordChangeComponent,
    OrdersListComponent,
  ],
  templateUrl: './account-profile.html',
})
export class UserProfileComponent implements OnInit {
  @Input() user: User | null = null;
  @Output() logoutRequested = new EventEmitter<void>();

  ngOnInit(): void {
    // Composant initialisé
  }

  onLogout(): void {
    this.logoutRequested.emit();
  }
}
