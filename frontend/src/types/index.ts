export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Vacation {
  id: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  likesCount: number;
  likedByMe: boolean;
  averageRating: number;
  reviewsCount: number;
}

export interface Review {
  id: number;
  userId: number;
  vacationId: number;
  rating: number;
  comment?: string;
  createdAt: string;
  userFirstName?: string;
  userLastName?: string;
}

export interface Booking {
  id: number;
  userId: number;
  vacationId: number;
  numTravelers: number;
  totalPrice: number;
  status: 'confirmed' | 'cancelled';
  bookingReference: string;
  createdAt: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  price?: number;
  imageFileName?: string;
  vacation?: Vacation;
}

export interface PaginatedVacations {
  vacations: Vacation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface VacationFilters {
  likedOnly: boolean;
  activeOnly: boolean;
  notStartedOnly: boolean;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardholderName: string;
}

// Stage 2 — AI & Analytics types

export interface TripPlanDay {
  day: number;
  theme: string;
  activities: string[];
  restaurant: string;
  tip: string;
}

export interface TripPlan {
  vacationId?: number;
  destination: string;
  startDate?: string;
  endDate?: string;
  days: TripPlanDay[];
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalLikes: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
}

export interface PopularVacation {
  id: number;
  destination: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  bookingsCount: number;
  likesCount: number;
  averageRating: number;
  reviewsCount: number;
}

export interface PendingBooking {
  vacationId: number;
  numTravelers: number;
  totalPrice: number;
  destination: string;
  startDate: string;
  endDate: string;
  deepLink: string;
}
