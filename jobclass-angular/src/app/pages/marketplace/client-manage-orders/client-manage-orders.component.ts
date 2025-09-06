import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

interface ClientOrder {
  id: string;
  serviceTitle: string;
  freelancerName: string;
  freelancerAvatar?: string;
  freelancerRating?: number;
  orderDate: Date;
  deliveryDate: Date;
  price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'revision' | 'disputed';
  description: string;
  deliverables?: Deliverable[];
  requirements?: Requirement[];
  messages?: Message[];
  revisionCount?: number;
  maxRevisions?: number;
  rating?: Rating;
  packageType?: 'basic' | 'standard' | 'premium';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  timeline?: TimelineEvent[];
}

interface Deliverable {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

interface Requirement {
  id: string;
  question: string;
  answer: string;
  attachments?: string[];
}

interface Message {
  id: string;
  sender: 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  attachments?: string[];
  isRead?: boolean;
}

interface Rating {
  overall: number;
  communication: number;
  serviceQuality: number;
  delivery: number;
  wouldRecommend: boolean;
  review?: string;
}

interface TimelineEvent {
  id: string;
  event: string;
  timestamp: Date;
  description?: string;
}

@Component({
  selector: 'app-client-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './client-manage-orders.component.html',
  styleUrls: ['./client-manage-orders.component.css']
})
export class ClientManageOrdersComponent implements OnInit {
  orders: ClientOrder[] = [];
  filteredOrders: ClientOrder[] = [];
  selectedOrder: ClientOrder | null = null;
  filterStatus: string = 'all';
  sortBy: string = 'date';
  newMessage: string = '';
  showRatingModal = false;
  showRequirementsModal = false;
  ratingForm!: FormGroup;
  requirementsForm!: FormGroup;

  statistics = {
    totalOrders: 0,
    activeOrders: 0,
    completedOrders: 0,
    totalSpent: 0,
    pendingDeliveries: 0,
    inRevision: 0
  };

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadOrders();
    this.calculateStatistics();
  }

  initializeForms(): void {
    this.ratingForm = this.fb.group({
      overall: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      communication: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      serviceQuality: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      delivery: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      wouldRecommend: [true],
      review: ['', [Validators.minLength(20)]]
    });

    this.requirementsForm = this.fb.group({
      requirements: this.fb.array([])
    });
  }

  loadOrders(): void {
    // Mock data - replace with actual API call
    this.orders = [
      {
        id: 'ORD001',
        serviceTitle: 'Professional Website Development',
        freelancerName: 'Alex Developer',
        freelancerAvatar: 'https://ui-avatars.com/api/?name=Alex+Developer',
        freelancerRating: 4.8,
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-25'),
        price: 1500,
        status: 'in_progress',
        description: 'Creating a responsive e-commerce website with payment integration',
        packageType: 'premium',
        paymentStatus: 'paid',
        deliverables: [],
        messages: [
          {
            id: 'MSG001',
            sender: 'freelancer',
            content: 'I\'ve started working on your project. Will share the first draft soon.',
            timestamp: new Date('2024-01-16T10:00:00'),
            isRead: true
          }
        ],
        revisionCount: 0,
        maxRevisions: 3,
        timeline: [
          {
            id: 'TL001',
            event: 'Order Placed',
            timestamp: new Date('2024-01-15T09:00:00'),
            description: 'Order placed successfully'
          },
          {
            id: 'TL002',
            event: 'Payment Confirmed',
            timestamp: new Date('2024-01-15T09:05:00'),
            description: 'Payment received and confirmed'
          },
          {
            id: 'TL003',
            event: 'Work Started',
            timestamp: new Date('2024-01-16T08:00:00'),
            description: 'Freelancer started working on the project'
          }
        ]
      },
      {
        id: 'ORD002',
        serviceTitle: 'Logo Design Package',
        freelancerName: 'Sarah Designer',
        freelancerAvatar: 'https://ui-avatars.com/api/?name=Sarah+Designer',
        freelancerRating: 4.9,
        orderDate: new Date('2024-01-10'),
        deliveryDate: new Date('2024-01-17'),
        price: 300,
        status: 'delivered',
        description: 'Modern logo design for tech startup',
        packageType: 'standard',
        paymentStatus: 'paid',
        deliverables: [
          {
            id: 'DEL001',
            name: 'Logo_Final.ai',
            fileUrl: '/files/logo.ai',
            fileType: 'application/illustrator',
            fileSize: 2048000,
            uploadedAt: new Date('2024-01-17T14:00:00')
          },
          {
            id: 'DEL002',
            name: 'Logo_Variations.zip',
            fileUrl: '/files/variations.zip',
            fileType: 'application/zip',
            fileSize: 5120000,
            uploadedAt: new Date('2024-01-17T14:00:00')
          }
        ],
        messages: [],
        revisionCount: 1,
        maxRevisions: 2
      },
      {
        id: 'ORD003',
        serviceTitle: 'Content Writing - 10 Articles',
        freelancerName: 'Mike Writer',
        freelancerAvatar: 'https://ui-avatars.com/api/?name=Mike+Writer',
        freelancerRating: 4.7,
        orderDate: new Date('2024-01-20'),
        deliveryDate: new Date('2024-02-01'),
        price: 500,
        status: 'pending',
        description: 'SEO-optimized articles for tech blog',
        packageType: 'basic',
        paymentStatus: 'pending',
        deliverables: [],
        messages: [],
        revisionCount: 0,
        maxRevisions: 1
      }
    ];

    this.filterOrders();
  }

  calculateStatistics(): void {
    this.statistics.totalOrders = this.orders.length;
    this.statistics.activeOrders = this.orders.filter(o =>
      o.status === 'in_progress' || o.status === 'pending'
    ).length;
    this.statistics.completedOrders = this.orders.filter(o =>
      o.status === 'completed'
    ).length;
    this.statistics.totalSpent = this.orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.price, 0);
    this.statistics.pendingDeliveries = this.orders.filter(o =>
      o.status === 'in_progress'
    ).length;
    this.statistics.inRevision = this.orders.filter(o =>
      o.status === 'revision'
    ).length;
  }

  filterOrders(): void {
    if (this.filterStatus === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.filterStatus);
    }

    this.sortOrders();
  }

  sortOrders(): void {
    switch (this.sortBy) {
      case 'date':
        this.filteredOrders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
        break;
      case 'price':
        this.filteredOrders.sort((a, b) => b.price - a.price);
        break;
      case 'delivery':
        this.filteredOrders.sort((a, b) => a.deliveryDate.getTime() - b.deliveryDate.getTime());
        break;
      case 'status':
        const statusOrder = ['pending', 'in_progress', 'revision', 'delivered', 'completed', 'cancelled', 'disputed'];
        this.filteredOrders.sort((a, b) =>
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );
        break;
    }
  }

  selectOrder(order: ClientOrder): void {
    this.selectedOrder = order;
    // Mark messages as read
    if (order.messages) {
      order.messages.forEach(msg => {
        if (msg.sender === 'freelancer') {
          msg.isRead = true;
        }
      });
    }
  }

  approveDelivery(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'completed';
      this.filterOrders();
      this.calculateStatistics();
      this.showRatingModal = true;
      console.log(`Order ${orderId} marked as completed`);
    }
  }

  requestRevision(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order && order.revisionCount !== undefined && order.maxRevisions !== undefined) {
      if (order.revisionCount < order.maxRevisions) {
        order.status = 'revision';
        order.revisionCount++;
        this.filterOrders();
        console.log(`Revision requested for order ${orderId}`);
      } else {
        alert(`Maximum revisions (${order.maxRevisions}) reached for this order.`);
      }
    }
  }

  disputeOrder(orderId: string): void {
    if (confirm('Are you sure you want to dispute this order? This will involve support team.')) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'disputed';
        this.filterOrders();
        console.log(`Order ${orderId} disputed`);
      }
    }
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order? Refund policy will apply.')) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.status = 'cancelled';
        this.filterOrders();
        this.calculateStatistics();
        console.log(`Order ${orderId} cancelled`);
      }
    }
  }

  sendMessage(): void {
    if (this.selectedOrder && this.newMessage.trim()) {
      const message: Message = {
        id: `MSG${Date.now()}`,
        sender: 'client',
        content: this.newMessage,
        timestamp: new Date(),
        attachments: [],
        isRead: true
      };

      if (!this.selectedOrder.messages) {
        this.selectedOrder.messages = [];
      }

      this.selectedOrder.messages.push(message);
      this.newMessage = '';
      // Add API call to send message
      console.log('Message sent:', message);
    }
  }

  downloadDeliverable(deliverable: Deliverable): void {
    // Implement file download logic
    console.log(`Downloading ${deliverable.name}`);
    // In real implementation, this would trigger a file download
    window.open(deliverable.fileUrl, '_blank');
  }

  submitRating(): void {
    if (this.ratingForm.valid && this.selectedOrder) {
      const rating = this.ratingForm.value as Rating;
      this.selectedOrder.rating = rating;
      this.showRatingModal = false;
      console.log('Rating submitted:', rating);
      // Add API call to submit rating
      alert('Thank you for your feedback!');
    }
  }

  submitRequirements(): void {
    if (this.requirementsForm.valid && this.selectedOrder) {
      console.log('Requirements submitted:', this.requirementsForm.value);
      this.showRequirementsModal = false;
      // Add API call to submit requirements
      alert('Requirements submitted successfully!');
    }
  }

  extendDeliveryTime(orderId: string): void {
    const days = prompt('How many additional days do you want to grant?');
    if (days && !isNaN(Number(days))) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
        order.deliveryDate = new Date(order.deliveryDate.getTime() + Number(days) * 24 * 60 * 60 * 1000);
        console.log(`Delivery time extended by ${days} days for order ${orderId}`);
        alert(`Delivery time extended by ${days} days`);
      }
    }
  }

  tipFreelancer(orderId: string): void {
    const amount = prompt('Enter tip amount (USD):');
    if (amount && !isNaN(Number(amount))) {
      console.log(`Tip of $${amount} sent for order ${orderId}`);
      alert(`Thank you! A tip of $${amount} has been sent to the freelancer.`);
      // Add API call to process tip
    }
  }

  reorderService(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      console.log(`Reordering service from order ${orderId}`);
      // Navigate to service page or create new order
      this.router.navigate(['/marketplace/service-detail', order.id]);
    }
  }

  getDaysRemaining(deliveryDate: Date): number {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusClass(status: ClientOrder['status']): string {
    const statusClasses = {
      'pending': 'status-pending',
      'in_progress': 'status-progress',
      'delivered': 'status-delivered',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'revision': 'status-revision',
      'disputed': 'status-disputed'
    };
    return statusClasses[status] || '';
  }

  getPaymentStatusClass(status: string): string {
    const statusClasses = {
      'pending': 'payment-pending',
      'paid': 'payment-paid',
      'refunded': 'payment-refunded'
    };
    return statusClasses[status] || '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(fileType: string): string {
    if (fileType.includes('image')) return 'fa-file-image';
    if (fileType.includes('pdf')) return 'fa-file-pdf';
    if (fileType.includes('zip')) return 'fa-file-archive';
    if (fileType.includes('doc')) return 'fa-file-word';
    if (fileType.includes('sheet')) return 'fa-file-excel';
    if (fileType.includes('illustrator')) return 'fa-file-image';
    return 'fa-file';
  }

  navigateToOrderDetails(orderId: string): void {
    this.router.navigate(['/marketplace/order-detail', orderId]);
  }

  contactSupport(orderId: string): void {
    console.log(`Opening support ticket for order ${orderId}`);
    this.router.navigate(['/support', { orderId }]);
  }
}
