import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface Client {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  joinDate: Date;
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'inactive';
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  totalSpent: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  disputedOrders: number;
  averageOrderValue: number;
  lastActive: Date;
  country: string;
  company?: string;
  industry?: string;
  accountType: 'individual' | 'business' | 'enterprise';
  paymentMethods?: PaymentMethod[];
  orders?: Order[];
  disputes?: Dispute[];
  reviews?: Review[];
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  last4?: string;
  isDefault: boolean;
  addedAt: Date;
}

interface Order {
  id: string;
  serviceTitle: string;
  freelancerName: string;
  amount: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  orderDate: Date;
  completedDate?: Date;
}

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  createdAt: Date;
  resolution?: string;
}

interface Review {
  id: string;
  orderId: string;
  freelancerName: string;
  rating: number;
  comment: string;
  date: Date;
}

interface ClientStats {
  totalClients: number;
  activeClients: number;
  verifiedClients: number;
  suspendedAccounts: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalOrders: number;
  disputeRate: number;
}

interface RefundRequest {
  orderId: string;
  amount: number;
  reason: string;
  fullRefund: boolean;
}

@Component({
  selector: 'app-admin-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-client-management.component.html',
  styleUrls: ['./admin-client-management.component.css']
})
export class AdminClientManagementComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  selectedClient: Client | null = null;

  // Filters
  searchTerm: string = '';
  filterStatus: string = 'all';
  filterVerification: string = 'all';
  filterAccountType: string = 'all';
  sortBy: string = 'joinDate';

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  // Statistics
  stats: ClientStats = {
    totalClients: 0,
    activeClients: 0,
    verifiedClients: 0,
    suspendedAccounts: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalOrders: 0,
    disputeRate: 0
  };

  // Modals
  showDetailsModal: boolean = false;
  showActionModal: boolean = false;
  showRefundModal: boolean = false;
  showCreditModal: boolean = false;
  showOrdersModal: boolean = false;
  showDisputesModal: boolean = false;

  // Forms
  actionForm!: FormGroup;
  refundForm!: FormGroup;
  creditForm!: FormGroup;
  messageForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadClients();
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

    this.refundForm = this.fb.group({
      orderId: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      fullRefund: [false],
      notifyClient: [true]
    });

    this.creditForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required],
      expiryDays: [30, Validators.min(1)],
      notifyClient: [true]
    });

    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', Validators.required],
      priority: ['normal', Validators.required]
    });
  }

  loadClients(): void {
    // Mock data - replace with API call
    this.clients = [
      {
        id: 'CL001',
        username: 'tech_startup',
        email: 'contact@techstartup.com',
        fullName: 'Tech Startup Inc.',
        avatar: 'https://ui-avatars.com/api/?name=Tech+Startup',
        joinDate: new Date('2023-01-10'),
        status: 'active',
        verificationStatus: 'verified',
        totalSpent: 15000,
        totalOrders: 25,
        activeOrders: 2,
        completedOrders: 22,
        disputedOrders: 1,
        averageOrderValue: 600,
        lastActive: new Date(),
        country: 'United States',
        company: 'Tech Startup Inc.',
        industry: 'Technology',
        accountType: 'business',
        paymentMethods: [
          {
            id: 'PM001',
            type: 'credit_card',
            last4: '4242',
            isDefault: true,
            addedAt: new Date('2023-01-11')
          }
        ],
        orders: [
          {
            id: 'ORD001',
            serviceTitle: 'Web Development',
            freelancerName: 'John Developer',
            amount: 1500,
            status: 'completed',
            orderDate: new Date('2023-12-01'),
            completedDate: new Date('2023-12-15')
          }
        ]
      },
      {
        id: 'CL002',
        username: 'marketing_agency',
        email: 'hello@marketingagency.com',
        fullName: 'Marketing Agency LLC',
        avatar: 'https://ui-avatars.com/api/?name=Marketing+Agency',
        joinDate: new Date('2023-02-15'),
        status: 'active',
        verificationStatus: 'verified',
        totalSpent: 8500,
        totalOrders: 15,
        activeOrders: 3,
        completedOrders: 12,
        disputedOrders: 0,
        averageOrderValue: 567,
        lastActive: new Date(),
        country: 'Canada',
        company: 'Marketing Agency LLC',
        industry: 'Marketing',
        accountType: 'business',
        paymentMethods: [
          {
            id: 'PM002',
            type: 'paypal',
            isDefault: true,
            addedAt: new Date('2023-02-16')
          }
        ]
      },
      {
        id: 'CL003',
        username: 'john_buyer',
        email: 'john.buyer@email.com',
        fullName: 'John Buyer',
        avatar: 'https://ui-avatars.com/api/?name=John+Buyer',
        joinDate: new Date('2023-03-20'),
        status: 'suspended',
        verificationStatus: 'unverified',
        totalSpent: 500,
        totalOrders: 3,
        activeOrders: 0,
        completedOrders: 2,
        disputedOrders: 1,
        averageOrderValue: 167,
        lastActive: new Date('2024-01-10'),
        country: 'United Kingdom',
        accountType: 'individual',
        paymentMethods: [],
        disputes: [
          {
            id: 'DIS001',
            orderId: 'ORD003',
            reason: 'Service not as described',
            status: 'open',
            createdAt: new Date('2024-01-10')
          }
        ]
      }
    ];

    this.applyFilters();
  }

  calculateStatistics(): void {
    this.stats.totalClients = this.clients.length;
    this.stats.activeClients = this.clients.filter(c => c.status === 'active').length;
    this.stats.verifiedClients = this.clients.filter(c => c.verificationStatus === 'verified').length;
    this.stats.suspendedAccounts = this.clients.filter(c =>
      c.status === 'suspended' || c.status === 'banned'
    ).length;

    this.stats.totalRevenue = this.clients.reduce((sum, c) => sum + c.totalSpent, 0);
    this.stats.totalOrders = this.clients.reduce((sum, c) => sum + c.totalOrders, 0);

    if (this.stats.totalOrders > 0) {
      this.stats.avgOrderValue = this.stats.totalRevenue / this.stats.totalOrders;
    }

    const totalDisputes = this.clients.reduce((sum, c) => sum + c.disputedOrders, 0);
    if (this.stats.totalOrders > 0) {
      this.stats.disputeRate = (totalDisputes / this.stats.totalOrders) * 100;
    }
  }

  applyFilters(): void {
    let filtered = [...this.clients];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.fullName.toLowerCase().includes(term) ||
        c.username.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(c => c.status === this.filterStatus);
    }

    // Verification filter
    if (this.filterVerification !== 'all') {
      filtered = filtered.filter(c => c.verificationStatus === this.filterVerification);
    }

    // Account type filter
    if (this.filterAccountType !== 'all') {
      filtered = filtered.filter(c => c.accountType === this.filterAccountType);
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'joinDate':
          return b.joinDate.getTime() - a.joinDate.getTime();
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        case 'totalOrders':
          return b.totalOrders - a.totalOrders;
        case 'lastActive':
          return b.lastActive.getTime() - a.lastActive.getTime();
        case 'avgOrderValue':
          return b.averageOrderValue - a.averageOrderValue;
        default:
          return 0;
      }
    });

    // Pagination
    this.totalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredClients = filtered.slice(start, start + this.itemsPerPage);
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

  viewClientDetails(client: Client): void {
    this.selectedClient = client;
    this.showDetailsModal = true;
  }

  verifyClient(clientId: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.verificationStatus = 'verified';
      this.applyFilters();
      this.calculateStatistics();
      console.log(`Client ${clientId} verified`);
    }
  }

  suspendClient(clientId: string): void {
    this.selectedClient = this.clients.find(c => c.id === clientId) || null;
    if (this.selectedClient) {
      this.actionForm.patchValue({ action: 'suspend' });
      this.showActionModal = true;
    }
  }

  banClient(clientId: string): void {
    this.selectedClient = this.clients.find(c => c.id === clientId) || null;
    if (this.selectedClient) {
      this.actionForm.patchValue({ action: 'ban' });
      this.showActionModal = true;
    }
  }

  reactivateClient(clientId: string): void {
    const client = this.clients.find(c => c.id === clientId);
    if (client) {
      client.status = 'active';
      this.applyFilters();
      this.calculateStatistics();
      console.log(`Client ${clientId} reactivated`);
    }
  }

  submitAction(): void {
    if (this.actionForm.valid && this.selectedClient) {
      const action = this.actionForm.value;

      if (action.action === 'suspend') {
        this.selectedClient.status = 'suspended';
      } else if (action.action === 'ban') {
        this.selectedClient.status = 'banned';
      }

      this.applyFilters();
      this.calculateStatistics();
      this.showActionModal = false;
      this.actionForm.reset();

      console.log(`Action submitted:`, action);
    }
  }

  viewClientOrders(client: Client): void {
    this.selectedClient = client;
    this.showOrdersModal = true;
  }

  viewClientDisputes(client: Client): void {
    this.selectedClient = client;
    this.showDisputesModal = true;
  }

  processRefund(client: Client): void {
    this.selectedClient = client;
    this.showRefundModal = true;
  }

  submitRefund(): void {
    if (this.refundForm.valid && this.selectedClient) {
      const refund = this.refundForm.value;
      console.log(`Processing refund for ${this.selectedClient.username}:`, refund);
      this.showRefundModal = false;
      this.refundForm.reset();
      // Add API call to process refund
    }
  }

  addCredit(client: Client): void {
    this.selectedClient = client;
    this.showCreditModal = true;
  }

  submitCredit(): void {
    if (this.creditForm.valid && this.selectedClient) {
      const credit = this.creditForm.value;
      console.log(`Adding credit for ${this.selectedClient.username}:`, credit);
      this.showCreditModal = false;
      this.creditForm.reset();
      // Add API call to add credit
    }
  }

  resolveDispute(disputeId: string): void {
    const resolution = prompt('Enter resolution details:');
    if (resolution) {
      console.log(`Resolving dispute ${disputeId}: ${resolution}`);
      // Add API call to resolve dispute
    }
  }

  exportClientData(): void {
    console.log('Exporting client data...');
    // Implement CSV/Excel export
  }

  sendBulkMessage(): void {
    const selectedClients = this.filteredClients.filter(c => c.status === 'active');
    console.log(`Sending bulk message to ${selectedClients.length} clients`);
    // Implement bulk messaging
  }

  viewPaymentHistory(client: Client): void {
    console.log(`Viewing payment history for ${client.username}`);
    this.router.navigate(['/admin/client', client.id, 'payments']);
  }

  viewActivityLog(client: Client): void {
    console.log(`Viewing activity log for ${client.username}`);
    this.router.navigate(['/admin/client', client.id, 'activity']);
  }

  upgradeAccount(client: Client): void {
    console.log(`Upgrading account for ${client.username}`);
    // Implement account upgrade logic
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'active': 'badge-success',
      'suspended': 'badge-warning',
      'banned': 'badge-danger',
      'pending': 'badge-info',
      'inactive': 'badge-secondary'
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

  getAccountTypeBadgeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'individual': 'badge-info',
      'business': 'badge-primary',
      'enterprise': 'badge-premium'
    };
    return classes[type] || 'badge-secondary';
  }

  getOrderStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'text-warning',
      'in_progress': 'text-info',
      'completed': 'text-success',
      'cancelled': 'text-secondary',
      'disputed': 'text-danger'
    };
    return classes[status] || 'text-secondary';
  }

  getDisputeStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'open': 'badge-danger',
      'in_review': 'badge-warning',
      'resolved': 'badge-success',
      'closed': 'badge-secondary'
    };
    return classes[status] || 'badge-secondary';
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

  calculateLifetimeValue(client: Client): number {
    // Simple LTV calculation - can be made more sophisticated
    return client.averageOrderValue * client.totalOrders * 1.2; // 20% projected growth
  }

  getRiskScore(client: Client): string {
    // Calculate risk score based on disputes and other factors
    if (client.disputedOrders === 0) return 'Low';
    const disputeRatio = client.disputedOrders / client.totalOrders;
    if (disputeRatio < 0.05) return 'Low';
    if (disputeRatio < 0.15) return 'Medium';
    return 'High';
  }

  getRiskScoreClass(score: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'text-success',
      'Medium': 'text-warning',
      'High': 'text-danger'
    };
    return classes[score] || 'text-secondary';
  }
}
