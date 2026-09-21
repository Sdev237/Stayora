import { gql } from '@apollo/client';

export const GET_LISTINGS = gql`
  query GetListings {
    listings {
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
      isFeatured
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
        role
        avatarUrl
        bio
      }
    }
  }
`;

export const SEARCH_LISTINGS = gql`
  query SearchListings(
    $location: String
    $checkIn: DateTime
    $checkOut: DateTime
    $minPrice: Decimal
    $maxPrice: Decimal
    $guests: Int
    $category: String
    $bedrooms: Int
    $beds: Int
    $bathrooms: Int
    $propertyTypes: [String!]
  ) {
    searchListings(
      location: $location
      checkIn: $checkIn
      checkOut: $checkOut
      minPrice: $minPrice
      maxPrice: $maxPrice
      guests: $guests
      category: $category
      bedrooms: $bedrooms
      beds: $beds
      bathrooms: $bathrooms
      propertyTypes: $propertyTypes
    ) {
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
      isFeatured
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
        role
        avatarUrl
        bio
      }
    }
  }
`;

export const GET_LISTING_BY_ID = gql`
  query GetListingById($id: UUID!) {
    listingById(id: $id) {
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
        role
        avatarUrl
        bio
        createdAt
      }
      reviews {
        id
        rating
        comment
        createdAt
        user {
          id
          name
          avatarUrl
        }
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatarUrl
      bio
      createdAt
    }
  }
`;

export const GET_LISTING_BOOKED_DATES = gql`
  query GetListingBookedDates($listingId: UUID!) {
    listingBookedDates(listingId: $listingId) {
      checkIn
      checkOut
    }
  }
`;

export const GET_MY_BOOKINGS = gql`
  query GetMyBookings {
    myBookings {
      id
      listingId
      userId
      checkIn
      checkOut
      guestCount
      totalPrice
      status
      stripePaymentIntentId
      createdAt
      listing {
        id
        title
        city
        country
        pricePerNight
        images {
          id
          url
          isCover
        }
      }
    }
  }
`;

export const GET_HOST_RESERVATIONS = gql`
  query GetHostReservations {
    hostReservations {
      id
      listingId
      userId
      checkIn
      checkOut
      guestCount
      totalPrice
      status
      stripePaymentIntentId
      createdAt
      user {
        id
        name
        email
        avatarUrl
      }
      listing {
        id
        title
        city
        country
        pricePerNight
        images {
          id
          url
          isCover
        }
      }
    }
  }
`;


