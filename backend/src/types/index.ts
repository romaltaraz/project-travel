// Shared domain types used across the backend

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export type PublicUser = Omit<User, 'password'>;

export interface Vacation {
  id: number;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  price: number;
  imageFileName: string;
  createdAt: Date;
}

export interface VacationWithStats extends Vacation {
  likesCount: number;
  likedByMe: boolean;
  averageRating: number;
  reviewsCount: number;
}

export interface Like {
  userId: number;
  vacationId: number;
}

export interface Review {
  id: number;
  userId: number;
  vacationId: number;
  rating: number;
  comment?: string;
  createdAt: Date;
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
  createdAt: Date;
}

export interface BookingWithDetails extends Booking {
  vacation?: Vacation;
  userFirstName?: string;
  userLastName?: string;
  userEmail?: string;
}

export interface JwtPayload {
  userId: number;
  role: 'user' | 'admin';
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface VacationFilters {
  likedOnly?: boolean;
  activeOnly?: boolean;
  notStartedOnly?: boolean;
  userId?: number;
}

export interface LikesReport {
  destination: string;
  likesCount: number;
}

export interface Hotel {
  id: number;
  name: string;
  city: string;
  starRating: number;
  guestScore: number;
  reviewsCount: number;
  pricePerNight: number;
  freeCancellation: boolean;
  amenities: string[];
  images: string[];
  createdAt: Date;
}

export interface HotelWithLikes extends Hotel {
  likesCount: number;
  likedByMe: boolean;
}
