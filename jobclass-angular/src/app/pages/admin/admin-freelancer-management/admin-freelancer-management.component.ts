import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Freelancer {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  joinDate: Date;
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'rejected';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  rating: number;
  totalEarnings: number;
  completedJobs: number;
  activeJobs: number;
  skills: string[];
  category: string;
  profileCompleteness: number;
  lastActive: Date;
  country: string;
  documents?: Document[];
  violations?: Violation[];
  payouts?: Payout[];
  services?: Service[];
}

interface Document {
  id: string;
  type: 'id' | 'tax' | 'certification' | 'portfolio';
  name: string;
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
}

interface Violation {
  id: string;
  type: 'policy' | 'quality' | 'fraud' | 'dispute' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: Date;
  resolvedAt?: Date;
  action?: string;
}

interface Payout {
  id: string;
  amount: number;
  method: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  date: Date;
}

interface Service {
  id: string;
  title: string;
  category: string;
  price: number;
  rating: number;
  orders: number;
  status: 'active' | 'paused' | 'removed';
}

interface FreelancerStats {
  totalFreelancers: number;
  activeFreelancers: number;
  pendingApprovals: number;
  suspendedAccounts: number;
  totalRevenue: number;
  avgRating: number;
  newThisMonth: number;
  topCategories: { name: string; count: number }[];
}

@Component({
  selector: 'app-admin-freelancer-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-freelancer-management.component.html',
  styleUrls: ['./admin-freelancer-management.component.css']
})
export class AdminFreelancerManagementComponent implements OnInit {
  freelancers: Freelancer[] = [];
  filteredFreelancers: Freelancer[] = [];
  selectedFreelancer: Freelancer | null = null;

  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all';
  filterVerification: string = 'all';
  filterCategory: string = 'all';
  sortBy: string = 'joinDate';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Statistics
  stats: FreelancerStats = {
    totalFreelancers: 0,
    activeFreelancers: 0,
    pendingApprovals: 0,
    suspendedAccounts: 0,
    totalRevenue: 0,
    avgRating: 0,
    newThisMonth: 0,
    topCategories: []
  };

  // Modals
  showDetailsModal: boolean = false;
  showActionModal: boolean = false;
  showDocumentModal: boolean = false;
  showPayoutModal: boolean = false;

  // Forms
  actionForm!: FormGroup;
  payoutForm!: FormGroup;

  // Categories
  categories: string[] = [
    'Web Development',
    'Mobile Development',
    'Design',
    'Writing',
    'Marketing',
    'Video & Animation',
    'Music & Audio',
    'Programming',
    'Business',
    'Data Science'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadFreelancers();
    this.calculateStatistics();
  }

  initializeForms(): void {
    this.actionForm = this.fb.group({
      action: ['', Validators.required],
      reason: ['', Validators.required],
      duration: [0],
      message: [''],
      sendEmail: [true]
    });

    this.payoutForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      method: ['', Validators.required],
      notes: ['']
    });
  }

  loadFreelancers(): void {
    // Mock data - replace with API call
    this.freelancers = [
      {
        id: 'FL001',
        username: 'john_developer',
        email: 'john@example.com',
        fullName: 'John Smith',
        avatar: 'https://ui-avatars.com/api/?name=John+Smith',
        joinDate: new Date('2023-01-15'),
        status: 'active',
        verificationStatus: 'verified',
        rating: 4.8,
        totalEarnings: 25000,
        completedJobs: 45,
        activeJobs: 3,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
        category: 'Web Development',
        profileCompleteness: 95,
        lastActive: new Date(),
        country: 'United States',
        documents: [
          {
            id: 'DOC001',
            type: 'id',
            name: 'ID Verification',
            url: '/docs/id.pdf',
            uploadedAt: new Date('2023-01-20'),
            status: 'approved'
          }
        ],
        violations: [],
        services: [
          {
            id: 'SRV001',
            title: 'Full Stack Web Development',
            category: 'Web Development',
            price: 500,
            rating: 4.9,
            orders: 23,
            status: 'active'
          }
        ]
      },
      {
        id: 'FL002',
        username: 'sarah_designer',
        email: 'sarah@example.com',
        fullName: 'Sarah Johnson',
        avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson',
        joinDate: new Date('2023-02-10'),
        status: 'pending',
        verificationStatus: 'pending',
        rating: 0,
        totalEarnings: 0,
        completedJobs: 0,
        activeJobs: 0,
        skills: ['UI/UX', 'Figma', 'Adobe XD', 'Photoshop'],
        category: 'Design',
        profileCompleteness: 75,
        lastActive: new Date(),
        country: 'Canada',
        documents: [
          {
            id: 'DOC002',
            type: 'id',
            name: 'ID Verification',
            url: '/docs/id2.pdf',
            uploadedAt: new Date('2023-02-12'),
            status: 'pending'
          }
        ],
        violations: []
      },
      {
        id: 'FL003',
        username: 'mike_writer',
        email: 'mike@example.com',
        fullName: 'Mike Wilson',
        avatar: 'https://ui-avatars.com/api/?name=Mike+Wilson',
        joinDate: new Date('2022-11-20'),
        status: 'suspended',
        verificationStatus: 'verified',
        rating: 3.5,
        totalEarnings: 8000,
        completedJobs: 20,
        activeJobs: 0,
        skills: ['Content Writing', 'SEO', 'Copywriting', 'Blog Writing'],
        category: 'Writing',
        profileCompleteness: 100,
        lastActive: new Date('2024-01-10'),
        country: 'United Kingdom',
        documents: [],
        violations: [
          {
            id: 'VIO001',
            type: 'quality',
            description: 'Multiple client complaints about late delivery',
            severity: 'medium',
            date: new Date('2024-01-10')
          }
        ]
      }
    ];

    this.applyFilters();
  }

  calculateStatistics(): void {
    this.stats.totalFreelancers = this.freelancers.length;
    this.stats.activeFreelancers = this.freelancers.filter(f => f.status === 'active').length;
    this.stats.pendingApprovals = this.freelancers.filter(f => f.status === 'pending').length;
    this.stats.suspendedAccounts = this.freelancers.filter(f => f.status === 'suspended' || f.status === 'banned').length;

    this.stats.totalRevenue = this.freelancers.reduce((sum, f) => sum + f.totalEarnings * 0.2, 0); // 20% platform fee

    const ratings = this.freelancers.filter(f => f.rating > 0).map(f => f.rating);
    this.stats.avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    // New this month
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    this.stats.newThisMonth = this.freelancers.filter(f => f.joinDate > monthAgo).length;

    // Top categories
    const categoryCount: { [key: string]: number } = {};
    this.freelancers.forEach(f => {
      categoryCount[f.category] = (categoryCount[f.category] || 0) + 1;
    });
    this.stats.topCategories = Object.entries(categoryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  applyFilters(): void {
    let filtered = [...this.freelancers];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.fullName.toLowerCase().includes(term) ||
        f.username.toLowerCase().includes(term) ||
        f.email.toLowerCase().includes(term) ||
        f.skills.some(s => s.toLowerCase().includes(term))
      );
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(f => f.status === this.filterStatus);
    }

    // Verification filter
    if (this.filterVerification !== 'all') {
      filtered = filtered.filter(f => f.verificationStatus === this.filterVerification);
    }

    // Category filter
    if (this.filterCategory !== 'all') {
      filtered = filtered.filter(f => f.category === this.filterCategory);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'joinDate':
          return b.joinDate.getTime() - a.joinDate.getTime();
        case 'earnings':
          return b.totalEarnings - a.totalEarnings;
        case 'rating':
          return b.rating - a.rating;
        case 'jobs':
          return b.completedJobs - a.completedJobs;
        case 'lastActive':
          return b.lastActive.getTime() - a.lastActive.getTime();
        default:
          return 0;
      }
    });

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredFreelancers = filtered.slice(start, start + this.itemsPerPage);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  viewFreelancerDetails(freelancer: Freelancer): void {
    this.selectedFreelancer = freelancer;
    this.showDetailsModal = true;
  }

  approveFreelancer(freelancerId: string): void {
    const freelancer = this.freelancers.find(f => f.id === freelancerId);
    if (freelancer) {
      freelancer.status = 'active';
      freelancer.verificationStatus = 'verified';
      this.applyFilters();
      this.calculateStatistics();
      console.log(`Freelancer ${freelancerId} approved`);
    }
  }

  rejectFreelancer(freelancerId: string): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      const freelancer = this.freelancers.find(f => f.id === freelancerId);
      if (freelancer) {
        freelancer.status = 'rejected';
        freelancer.verificationStatus = 'rejected';
        this.applyFilters();
        this.calculateStatistics();
        console.log(`Freelancer ${freelancerId} rejected: ${reason}`);
      }
    }
  }

  suspendFreelancer(freelancerId: string): void {
    this.selectedFreelancer = this.freelancers.find(f => f.id === freelancerId) || null;
    if (this.selectedFreelancer) {
      this.actionForm.patchValue({ action: 'suspend' });
      this.showActionModal = true;
    }
  }

  banFreelancer(freelancerId: string): void {
    this.selectedFreelancer = this.freelancers.find(f => f.id === freelancerId) || null;
    if (this.selectedFreelancer) {
      this.actionForm.patchValue({ action: 'ban' });
      this.showActionModal = true;
    }
  }

  reactivateFreelancer(freelancerId: string): void {
    const freelancer = this.freelancers.find(f => f.id === freelancerId);
    if (freelancer) {
      freelancer.status = 'active';
      this.applyFilters();
      this.calculateStatistics();
      console.log(`Freelancer ${freelancerId} reactivated`);
    }
  }

  submitAction(): void {
    if (this.actionForm.valid && this.selectedFreelancer) {
      const action = this.actionForm.value;

      if (action.action === 'suspend') {
        this.selectedFreelancer.status = 'suspended';
      } else if (action.action === 'ban') {
        this.selectedFreelancer.status = 'banned';
      }

      // Add violation record
      const violation: Violation = {
        id: `VIO${Date.now()}`,
        type: 'policy',
        description: action.reason,
        severity: action.action === 'ban' ? 'critical' : 'high',
        date: new Date(),
        action: action.action
      };

      if (!this.selectedFreelancer.violations) {
        this.selectedFreelancer.violations = [];
      }
      this.selectedFreelancer.violations.push(violation);

      this.applyFilters();
      this.calculateStatistics();
      this.showActionModal = false;
      this.actionForm.reset();

      console.log(`Action submitted:`, action);
    }
  }

  viewDocuments(freelancer: Freelancer): void {
    this.selectedFreelancer = freelancer;
    this.showDocumentModal = true;
  }

  approveDocument(documentId: string): void {
    if (this.selectedFreelancer?.documents) {
      const doc = this.selectedFreelancer.documents.find(d => d.id === documentId);
      if (doc) {
        doc.status = 'approved';
        console.log(`Document ${documentId} approved`);
      }
    }
  }

  rejectDocument(documentId: string): void {
    if (this.selectedFreelancer?.documents) {
      const doc = this.selectedFreelancer.documents.find(d => d.id === documentId);
      if (doc) {
        doc.status = 'rejected';
        console.log(`Document ${documentId} rejected`);
      }
    }
  }

  initiateManualPayout(freelancer: Freelancer): void {
    this.selectedFreelancer = freelancer;
    this.showPayoutModal = true;
  }

  submitPayout(): void {
    if (this.payoutForm.valid && this.selectedFreelancer) {
      const payout = this.payoutForm.value;
      console.log(`Manual payout initiated for ${this.selectedFreelancer.username}:`, payout);
      this.showPayoutModal = false;
      this.payoutForm.reset();
    }
  }

  viewFreelancerServices(freelancer: Freelancer): void {
    console.log(`Viewing services for ${freelancer.username}`);
    this.router.navigate(['/admin/freelancer', freelancer.id, 'services']);
  }

  viewFreelancerEarnings(freelancer: Freelancer): void {
    console.log(`Viewing earnings for ${freelancer.username}`);
    this.router.navigate(['/admin/freelancer', freelancer.id, 'earnings']);
  }

  exportFreelancerData(): void {
    console.log('Exporting freelancer data...');
    // Implement CSV/Excel export
  }

  sendBulkMessage(): void {
    const selectedFreelancers = this.filteredFreelancers.filter(f => f.status === 'active');
    console.log(`Sending bulk message to ${selectedFreelancers.length} freelancers`);
    // Implement bulk messaging
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'badge-success',
      'suspended': 'badge-warning',
      'banned': 'badge-danger',
      'pending': 'badge-info',
      'rejected': 'badge-dark'
    };
    return classes[status] || 'badge-secondary';
  }

  getVerificationBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'verified': 'badge-success',
      'pending': 'badge-warning',
      'unverified': 'badge-secondary',
      'rejected': 'badge-danger'
    };
    return classes[status] || 'badge-secondary';
  }

  getSeverityClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'low': 'text-info',
      'medium': 'text-warning',
      'high': 'text-orange',
      'critical': 'text-danger'
    };
    return classes[severity] || 'text-secondary';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getDaysAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  }
}
