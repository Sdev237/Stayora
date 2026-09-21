import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      expiresAt
      user {
        id
        name
        email
        role
        avatarUrl
        bio
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      expiresAt
      user {
        id
        name
        email
        role
        avatarUrl
        bio
      }
    }
  }
`;

export const SWITCH_TO_HOST_MUTATION = gql`
  mutation SwitchToHostRole {
    switchToHostRole {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`;

export const CREATE_LISTING_MUTATION = gql`
  mutation CreateListing($input: CreateListingInput!) {
    createListing(input: $input) {
      id
      title
      description
      category
      propertyType
      city
      country
      address
      latitude
      longitude
      pricePerNight
      cleaningFee
      maxGuests
      bedrooms
      beds
      bathrooms
      rating
      reviewCount
      images {
        id
        url
        isCover
        displayOrder
      }
      host {
        id
        name
        email
      }
    }
  }
`;

export const CREATE_BOOKING_MUTATION = gql`
  mutation CreateBooking($input: CreateBookingInput!) {
    createBooking(input: $input) {
      clientSecret
      paymentIntentId
      booking {
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
  }
`;

export const CONFIRM_BOOKING_MUTATION = gql`
  mutation ConfirmBooking($bookingId: UUID!) {
    confirmBooking(bookingId: $bookingId) {
      id
      status
      totalPrice
      checkIn
      checkOut
      guestCount
    }
  }
`;

export const REJECT_BOOKING_MUTATION = gql`
  mutation RejectBooking($bookingId: UUID!) {
    rejectBooking(bookingId: $bookingId) {
      id
      status
    }
  }
`;


