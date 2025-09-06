import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Order {
  id: string;
  serviceTitle: string;
  clientName: string;
  clientAvatar?: string;
  orderDate: Date;
  deliveryDate: Date;
  price: number;
  status: 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'revision';
  description: string;
  attachments?: string[];
  messages?: Message[];
  revisionCount?: number;
  rating?: number;
}

interface Message {
  id: string;
  sender: 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  filterStatus: string = 'all';
  sortBy: string = 'date';
  newMessage: string = '';

  statistics = {
    totalOrders: 0,
    completedOrders: 0,
    activeOrders: 0,
    totalEarnings: 0,
    averageRating: 0,
    completionRate: 0
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadOrders();
    this.calculateStatistics();
  }

  loadOrders(): void {
    // Mock data - replace with actual API call
    this.orders = [
      {
        id: 'ORD001',
        serviceTitle: 'Website Development',
        clientName: 'John Doe',
        clientAvatar: 'https://ui-avatars.com/api/?name=John+Doe',
        orderDate: new Date('2024-01-15'),
        deliveryDate: new Date('2024-01-25'),
        price: 1500,
        status: 'in_progress',
        description: 'Create a responsive e-commerce website with payment integration',
        attachments: ['requirements.pdf'],
        messages: [
          {
            id: 'MSG001',
            sender: 'client',
            content: 'Please include mobile responsiveness',
            timestamp: new Date('2024-01-15T10:00:00'),
            attachments: []
          }
        ],
        revisionCount: 0
      },
      {
        id: 'ORD002',
        serviceTitle: 'Logo Design',
        clientName: 'Jane Smith',
        clientAvatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
        orderDate: new Date('2024-01-10'),
        deliveryDate: new Date('2024-01-17'),
        price: 300,
        status: 'delivered',
        description: 'Design a modern logo for tech startup',
        attachments: ['brand_guidelines.pdf'],
        messages: [],
        revisionCount: 2,
        rating: 5
      },
      {
        id: 'ORD003',
        serviceTitle: 'Mobile App Development',
        clientName: 'Mike Johnson',
        clientAvatar: 'https://ui-avatars.com/api/?name=Mike+Johnson',
        orderDate: new Date('2024-01-20'),
        deliveryDate: new Date('2024-02-20'),
        price: 5000,
        status: 'pending',
        description: 'Develop a cross-platform mobile app for fitness tracking',
        attachments: ['app_wireframes.pdf'],
        messages: [],
        revisionCount: 0
      }
    ];

    this.filterOrders();
  }

  calculateStatistics(): void {
    this.statistics.totalOrders = this.orders.length;
    this.statistics.completedOrders = this.orders.filter(o => o.status === 'completed').length;
    this.statistics.activeOrders = this.orders.filter(o =>
      o.status === 'in_progress' || o.status === 'pending' || o.status === 'revision'
    ).length;

    this.statistics.totalEarnings = this.orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + o.price, 0);

    const ratedOrders = this.orders.filter(o => o.rating);
    if (ratedOrders.length > 0) {
      this.statistics.averageRating =
        ratedOrders.reduce((sum, o) => sum + (o.rating || 0), 0) / ratedOrders.length;
    }

    if (this.orders.length > 0) {
      this.statistics.completionRate =
        (this.statistics.completedOrders / this.orders.length) * 100;
    }
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
        const statusOrder = ['pending', 'in_progress', 'revision', 'delivered', 'completed', 'cancelled'];
        this.filteredOrders.sort((a, b) =>
          statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
        );
        break;
    }
  }

  selectOrder(order: Order): void {
    this.selectedOrder = order;
  }

  updateOrderStatus(orderId: string, newStatus: Order['status']): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.filterOrders();
      this.calculateStatistics();
      // Add API call to update order status
      console.log(`Order ${orderId} status updated to ${newStatus}`);
    }
  }

  sendMessage(): void {
    if (this.selectedOrder && this.newMessage.trim()) {
      const message: Message = {
        id: `MSG${Date.now()}`,
        sender: 'freelancer',
        content: this.newMessage,
        timestamp: new Date(),
        attachments: []
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

  deliverOrder(orderId: string): void {
    this.updateOrderStatus(orderId, 'delivered');
    // Add logic to upload deliverables
    console.log(`Order ${orderId} marked as delivered`);
  }

  requestRevision(orderId: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'revision';
      if (order.revisionCount) {
        order.revisionCount++;
      } else {
        order.revisionCount = 1;
      }
      this.filterOrders();
      console.log(`Revision requested for order ${orderId}`);
    }
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      this.updateOrderStatus(orderId, 'cancelled');
      console.log(`Order ${orderId} cancelled`);
    }
  }

  downloadAttachment(filename: string): void {
    // Implement file download logic
    console.log(`Downloading ${filename}`);
  }

  getDaysRemaining(deliveryDate: Date): number {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getStatusClass(status: Order['status']): string {
    const statusClasses = {
      'pending': 'status-pending',
      'in_progress': 'status-progress',
      'delivered': 'status-delivered',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'revision': 'status-revision'
    };
    return statusClasses[status] || '';
  }

  navigateToOrderDetails(orderId: string): void {
    this.router.navigate(['/marketplace/order-detail', orderId]);
  }
}
