import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../models/product.model';
import { RateService, RatingDto } from '../../services/rate.service';

@Component({
  selector: 'app-reviews-modal',
  imports: [CommonModule],
  templateUrl: './detail-rating.html',
})
export class ReviewsModalComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Input() isVisible: boolean = false;

  @Output() closeModal = new EventEmitter<void>();

  reviews: RatingDto[] = [];
  loading: boolean = false;

  constructor(private rateService: RateService) {
  }

  ngOnInit() {
    console.log(
      '🔄 ReviewsModal ngOnInit - isVisible:',
      this.isVisible,
      'product:',
      this.product
    );
  }

  // OnChanges est crucial pour détecter les changements d'Input
  ngOnChanges(changes: SimpleChanges) {
    if (this.isVisible && this.product) {
      this.loadReviews();
    } 
  }

  open(product: Product) {
    this.product = product;
    this.isVisible = true;
    this.loadReviews();
  }

  close() {
    this.isVisible = false;
    this.reviews = [];
    this.closeModal.emit();
  }

  onBackdropClick(event: Event) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private loadReviews() {

    if (!this.product) {
      console.log('❌ loadReviews: No product available');
      return;
    }

    this.loading = true;

    // Appel réel à l'API

    this.rateService.getProductReviews(this.product.id).subscribe({
      next: (reviews: RatingDto[]) => {

        if (reviews && Array.isArray(reviews) && reviews.length > 0) {
          this.reviews = reviews.sort((a, b) => {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
        } else {
          console.log('⚠️ No reviews found or invalid response format');
          this.reviews = [];
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('❌ API Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          fullError: error,
        });
        this.reviews = [];
        this.loading = false;
      },
    });
  }

  getInitials(username: string): string {
    if (!username) return '??';
    return username
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  formatDate(date: Date | string): string {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Date invalide';
    }
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: Math.floor(rating) }, (_, i) => i);
  }

  getEmptyStarsArray(rating: number): number[] {
    const emptyStars = 5 - Math.floor(rating);
    return Array.from({ length: emptyStars }, (_, i) => i);
  }
}
