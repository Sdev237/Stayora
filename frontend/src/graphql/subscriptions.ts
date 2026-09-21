import { gql } from '@apollo/client';

export const ON_BOOKING_STATUS_CHANGED = gql`
  subscription OnBookingStatusChanged($bookingId: UUID!) {
    onBookingStatusChanged(bookingId: $bookingId) {
      id
      listingId
      userId
      checkIn
      checkOut
      guestCount
      totalPrice
      status
      createdAt
    }
  }
`;

export const ON_HOST_BOOKING_NOTIFICATION = gql`
  subscription OnHostBookingNotification($hostId: UUID!) {
    onHostBookingNotification(hostId: $hostId) {
      id
      listingId
      userId
      checkIn
      checkOut
      guestCount
      totalPrice
      status
      createdAt
    }
  }
`;
