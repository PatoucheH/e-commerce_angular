import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-rating-modal',
  imports: [FormsModule],
  templateUrl: './rate-product.html',
})
export class RatingModalComponent {
  @Input() product: Product | null = null;
  @Input() isVisible: boolean = false;

  @Output() closeModal = new EventEmitter<void>();
  @Output() ratingSubmitted = new EventEmitter<{
    rating: number;
    comment: string;
  }>();

  ratingValue: number = 0;
  ratingComment: string = '';

  open(product: Product) {
    this.product = product;
    this.isVisible = true;
    this.ratingValue = 0;
    this.ratingComment = '';
  }

  close() {
    this.isVisible = false;
    this.ratingValue = 0;
    this.ratingComment = '';
    this.closeModal.emit();
  }

  submitRating() {
    if (this.ratingValue < 1 || this.ratingValue > 5) return;

    this.ratingSubmitted.emit({
      rating: this.ratingValue,
      comment: this.ratingComment,
    });

    this.close();
  }
}
