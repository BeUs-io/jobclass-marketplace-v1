import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

interface ServicePackage {
  name: string;
  description: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

interface ServiceGalleryItem {
  url: string;
  type: 'image' | 'video';
  caption?: string;
}

@Component({
  selector: 'app-create-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.css']
})
export class CreateServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  currentStep = 1;
  totalSteps = 5;
  categories: string[] = [];
  subcategories: string[] = [];
  tags: string[] = [];
  selectedTags: string[] = [];
  galleryItems: ServiceGalleryItem[] = [];
  previewMode = false;

  packages: ServicePackage[] = [
    {
      name: 'Basic',
      description: '',
      price: 0,
      deliveryTime: 3,
      revisions: 1,
      features: []
    },
    {
      name: 'Standard',
      description: '',
      price: 0,
      deliveryTime: 5,
      revisions: 2,
      features: []
    },
    {
      name: 'Premium',
      description: '',
      price: 0,
      deliveryTime: 7,
      revisions: 3,
      features: []
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCategories();
    this.loadTags();
  }

  initializeForm(): void {
    this.serviceForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(80)]],
      category: ['', Validators.required],
      subcategory: ['', Validators.required],
      searchTags: [[]],

      // Service Description
      description: ['', [Validators.required, Validators.minLength(120), Validators.maxLength(1200)]],
      serviceIncludes: this.fb.array([]),
      requirements: ['', [Validators.required, Validators.minLength(50)]],

      // Pricing & Packages
      pricingType: ['packages', Validators.required], // 'packages' or 'hourly'
      hourlyRate: [0],
      basicPackage: this.fb.group({
        name: ['Basic'],
        description: ['', Validators.required],
        price: [5, [Validators.required, Validators.min(5)]],
        deliveryTime: [3, [Validators.required, Validators.min(1)]],
        revisions: [1, [Validators.required, Validators.min(0)]],
        features: this.fb.array([])
      }),
      standardPackage: this.fb.group({
        name: ['Standard'],
        description: ['', Validators.required],
        price: [25, [Validators.required, Validators.min(5)]],
        deliveryTime: [5, [Validators.required, Validators.min(1)]],
        revisions: [2, [Validators.required, Validators.min(0)]],
        features: this.fb.array([])
      }),
      premiumPackage: this.fb.group({
        name: ['Premium'],
        description: ['', Validators.required],
        price: [50, [Validators.required, Validators.min(5)]],
        deliveryTime: [7, [Validators.required, Validators.min(1)]],
        revisions: [3, [Validators.required, Validators.min(0)]],
        features: this.fb.array([])
      }),

      // Additional Services
      extras: this.fb.array([]),

      // Gallery & Portfolio
      thumbnailImage: ['', Validators.required],
      galleryImages: [[]],
      videoUrl: [''],
      portfolioLinks: this.fb.array([]),

      // FAQs
      faqs: this.fb.array([]),

      // Service Settings
      expressDelivery: [false],
      expressDeliveryDays: [1],
      expressDeliveryPrice: [0],
      customOrder: [true],
      buyerInstructions: [''],

      // SEO
      seoTitle: [''],
      seoDescription: [''],
      seoKeywords: ['']
    });

    // Add initial service includes
    this.addServiceInclude();
    this.addServiceInclude();
    this.addServiceInclude();

    // Add initial FAQ
    this.addFAQ();
  }

  loadCategories(): void {
    // Mock data - replace with API call
    this.categories = [
      'Web Development',
      'Mobile Development',
      'Graphics & Design',
      'Digital Marketing',
      'Writing & Translation',
      'Video & Animation',
      'Music & Audio',
      'Programming & Tech',
      'Business',
      'Data Science'
    ];
  }

  loadSubcategories(category: string): void {
    // Mock data - replace with API call based on category
    const subcategoryMap: { [key: string]: string[] } = {
      'Web Development': ['WordPress', 'Website Design', 'E-commerce', 'Landing Pages', 'Web Applications'],
      'Mobile Development': ['iOS Apps', 'Android Apps', 'Cross-platform Apps', 'App UI/UX', 'App Testing'],
      'Graphics & Design': ['Logo Design', 'Brand Style Guides', 'Business Cards', 'Illustrations', 'Flyer Design'],
      'Digital Marketing': ['Social Media Marketing', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC'],
      'Writing & Translation': ['Articles & Blog Posts', 'Translation', 'Proofreading', 'Creative Writing', 'Technical Writing']
    };

    this.subcategories = subcategoryMap[category] || [];
    this.serviceForm.patchValue({ subcategory: '' });
  }

  loadTags(): void {
    // Mock data - replace with API call
    this.tags = [
      'responsive', 'mobile-friendly', 'SEO', 'fast-delivery', 'professional',
      'modern', 'clean-design', 'custom', 'wordpress', 'react', 'angular',
      'nodejs', 'python', 'javascript', 'ui-design', 'ux-design', 'branding',
      'logo', 'illustration', 'animation', '3d', 'video-editing'
    ];
  }

  get serviceIncludes(): FormArray {
    return this.serviceForm.get('serviceIncludes') as FormArray;
  }

  get extras(): FormArray {
    return this.serviceForm.get('extras') as FormArray;
  }

  get portfolioLinks(): FormArray {
    return this.serviceForm.get('portfolioLinks') as FormArray;
  }

  get faqs(): FormArray {
    return this.serviceForm.get('faqs') as FormArray;
  }

  addServiceInclude(): void {
    this.serviceIncludes.push(this.fb.control('', Validators.required));
  }

  removeServiceInclude(index: number): void {
    if (this.serviceIncludes.length > 1) {
      this.serviceIncludes.removeAt(index);
    }
  }

  addExtra(): void {
    const extraGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      price: [10, [Validators.required, Validators.min(5)]],
      deliveryTime: [1, [Validators.required, Validators.min(1)]]
    });
    this.extras.push(extraGroup);
  }

  removeExtra(index: number): void {
    this.extras.removeAt(index);
  }

  addPortfolioLink(): void {
    this.portfolioLinks.push(this.fb.control('', [Validators.required, Validators.pattern('https?://.+')]));
  }

  removePortfolioLink(index: number): void {
    this.portfolioLinks.removeAt(index);
  }

  addFAQ(): void {
    const faqGroup = this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    });
    this.faqs.push(faqGroup);
  }

  removeFAQ(index: number): void {
    this.faqs.removeAt(index);
  }

  addPackageFeature(packageType: string): void {
    const packageControl = this.serviceForm.get(`${packageType}Package.features`) as FormArray;
    packageControl.push(this.fb.control('', Validators.required));
  }

  removePackageFeature(packageType: string, index: number): void {
    const packageControl = this.serviceForm.get(`${packageType}Package.features`) as FormArray;
    packageControl.removeAt(index);
  }

  getPackageFeatures(packageType: string): FormArray {
    return this.serviceForm.get(`${packageType}Package.features`) as FormArray;
  }

  onCategoryChange(event: any): void {
    const category = event.target.value;
    this.loadSubcategories(category);
  }

  toggleTag(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) {
      this.selectedTags.splice(index, 1);
    } else if (this.selectedTags.length < 5) {
      this.selectedTags.push(tag);
    }
    this.serviceForm.patchValue({ searchTags: this.selectedTags });
  }

  onFileUpload(event: any, type: string): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Handle file upload logic here
      // For now, we'll just store the file name
      const file = files[0];
      if (type === 'thumbnail') {
        this.serviceForm.patchValue({ thumbnailImage: file.name });
      } else if (type === 'gallery') {
        const currentGallery = this.serviceForm.get('galleryImages')?.value || [];
        currentGallery.push(file.name);
        this.serviceForm.patchValue({ galleryImages: currentGallery });

        // Add to gallery items for preview
        this.galleryItems.push({
          url: URL.createObjectURL(file),
          type: 'image',
          caption: ''
        });
      }
    }
  }

  removeGalleryItem(index: number): void {
    this.galleryItems.splice(index, 1);
    const currentGallery = this.serviceForm.get('galleryImages')?.value || [];
    currentGallery.splice(index, 1);
    this.serviceForm.patchValue({ galleryImages: currentGallery });
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.validateStepsUpTo(step - 1)) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.serviceForm.get('title')?.valid &&
               this.serviceForm.get('category')?.valid &&
               this.serviceForm.get('subcategory')?.valid;
      case 2:
        return this.serviceForm.get('description')?.valid &&
               this.serviceIncludes.valid &&
               this.serviceForm.get('requirements')?.valid;
      case 3:
        if (this.serviceForm.get('pricingType')?.value === 'packages') {
          return this.serviceForm.get('basicPackage')?.valid &&
                 this.serviceForm.get('standardPackage')?.valid &&
                 this.serviceForm.get('premiumPackage')?.valid;
        } else {
          return this.serviceForm.get('hourlyRate')?.valid;
        }
      case 4:
        return this.serviceForm.get('thumbnailImage')?.valid;
      case 5:
        return true; // Review step
      default:
        return true;
    }
  }

  validateStepsUpTo(step: number): boolean {
    for (let i = 1; i <= step; i++) {
      const currentStepTemp = this.currentStep;
      this.currentStep = i;
      if (!this.validateCurrentStep()) {
        this.currentStep = currentStepTemp;
        return false;
      }
      this.currentStep = currentStepTemp;
    }
    return true;
  }

  togglePreview(): void {
    this.previewMode = !this.previewMode;
  }

  saveAsDraft(): void {
    const formData = this.serviceForm.value;
    console.log('Saving as draft:', formData);
    // Add API call to save draft
    alert('Service saved as draft successfully!');
  }

  publishService(): void {
    if (this.serviceForm.valid) {
      const formData = this.serviceForm.value;
      console.log('Publishing service:', formData);
      // Add API call to publish service
      alert('Service published successfully!');
      this.router.navigate(['/marketplace/freelancer-dashboard']);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.serviceForm.controls).forEach(key => {
        const control = this.serviceForm.get(key);
        control?.markAsTouched();
      });
      alert('Please fill all required fields before publishing.');
    }
  }

  calculateEarnings(price: number): number {
    const platformFee = 0.20; // 20% platform fee
    return price * (1 - platformFee);
  }

  getStepTitle(step: number): string {
    const titles = [
      'Basic Information',
      'Service Description',
      'Pricing & Packages',
      'Gallery & Portfolio',
      'Review & Publish'
    ];
    return titles[step - 1] || '';
  }

  getCharacterCount(fieldName: string): number {
    return this.serviceForm.get(fieldName)?.value?.length || 0;
  }

  getMaxCharacters(fieldName: string): number {
    const limits: { [key: string]: number } = {
      'title': 80,
      'description': 1200,
      'requirements': 450
    };
    return limits[fieldName] || 0;
  }
}
