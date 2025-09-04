import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { Observable } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-form-modal',
  templateUrl: 'add-product.html',
  imports: [ReactiveFormsModule],
})
export class ProductFormModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<Product>();

  productForm!: FormGroup;
  isEditMode = false;
  isLoading = false;

  // Variables upload
  uploadError: string | null = null;
  previewUrl: string | null = null;
  selectedFile: File | null = null;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.initializeForm();
  }

  ngOnChanges() {
    if (this.product) {
      this.isEditMode = true;
      this.populateForm();
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initializeForm() {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      type: [''],
      description: [''],
      imageUrl: [''], // plus de pattern, sera rempli par le backend
    });
  }

  populateForm() {
    if (this.product && this.productForm) {
      this.productForm.patchValue({
        name: this.product.name,
        price: this.product.price,
        stock: this.product.stock,
        type: this.product.type || '',
        description: this.product.description || '',
        imageUrl: this.product.imageUrl || '',
      });
      this.previewUrl = this.product?.imageUrl || null;
    }
  }

  resetForm() {
    if (this.productForm) {
      this.productForm.reset({
        name: '',
        price: 0,
        stock: 0,
        type: '',
        description: '',
        imageUrl: '',
      });
      this.previewUrl = null;
      this.selectedFile = null;
      this.uploadError = null;
      this.isUploading = false;
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Veuillez sélectionner une image valide.';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    this.uploadError = null;
    this.selectedFile = file;

    // Aperçu côté frontend
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);

    // ✅ Upload immédiat sur le backend
    this.uploadImage(file);
  }

  uploadImage(file: File) {
    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', file); // le backend attend "File"

    this.productService.uploadProductImage(formData).subscribe({
      next: (res: any) => {
        // ✅ Patch de imageUrl avec le chemin renvoyé par le backend
        this.productForm.patchValue({ imageUrl: res.url });
        this.isUploading = false;
      },
      error: (err) => {
        console.error(err);
        this.uploadError = "Échec de l'upload de l'image.";
        this.isUploading = false;
      },
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading = true;

      const formValue = this.productForm.value;

      const productData: Product = {
        id: this.isEditMode ? this.product!.id : 0,
        sellerId: this.authService.getCurrentUser()!.id, // récupère l'user connecté
        name: formValue.name,
        price: formValue.price,
        stock: formValue.stock,
        type: formValue.type || undefined,
        description: formValue.description || undefined,
        imageUrl: formValue.imageUrl || undefined, // doit être rempli par l'upload
        averageRating: this.isEditMode ? this.product!.averageRating : 0,
        totalRatings: this.isEditMode ? this.product!.totalRatings : 0,
      };

      const operation: Observable<Product> = this.isEditMode
        ? this.productService.updateProduct(productData.id, productData)
        : this.productService.addProduct(productData);

      operation.subscribe({
        next: (result: Product) => {
          this.isLoading = false;
          this.productSaved.emit(this.isEditMode ? productData : result);
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Erreur lors de la sauvegarde:', error);
        },
      });
    }
  }

  closeModal() {
    this.close.emit();
    this.resetForm();
  }

  onImageError() {
    console.log("Erreur de chargement de l'image");
  }
}
