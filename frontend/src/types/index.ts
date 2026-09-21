export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Guest' | 'Host' | 'Admin';
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

export interface ListingImage {
  id: string;
  url: string;
  isCover: boolean;
  displayOrder: number;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user?: User;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  propertyType: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerNight: number;
  cleaningFee: number;
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: string;
  host?: User;
  images: ListingImage[];
  reviews?: Review[];
}

export interface AuthPayload {
  token: string;
  user: User;
  expiresAt: string;
}

export interface BookedDateRange {
  checkIn: string;
  checkOut: string;
}

export interface Booking {
  id: string;
  listingId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  guestCount: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  stripePaymentIntentId?: string;
  createdAt: string;
  listing?: Listing;
  user?: User;
}

