import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '../../types';

interface ListingMapProps {
  listings: Listing[];
  selectedListingId?: string | null;
  onSelectListing: (listing: Listing) => void;
  onHoverListing?: (listingId: string | null) => void;
}

// Fallback public style or standard token
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export const ListingMap: React.FC<ListingMapProps> = ({
  listings,
  selectedListingId,
  onSelectListing,
  onHoverListing,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Calculate center based on listings or default to world center
    const validListings = listings.filter((l) => l.latitude && l.longitude);
    const defaultCenter: [number, number] = validListings.length > 0
      ? [validListings[0].longitude, validListings[0].latitude]
      : [2.3522, 48.8566];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'voyager-tiles': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors © CARTO',
          },
        },
        layers: [
          {
            id: 'voyager-tiles-layer',
            type: 'raster',
            source: 'voyager-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: defaultCenter,
      zoom: validListings.length === 1 ? 12 : 2.5,
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update Markers when listings change
  useEffect(() => {
    if (!map.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const validListings = listings.filter((l) => l.latitude && l.longitude);
    if (validListings.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    validListings.forEach((listing) => {
      // Create custom price pill element
      const el = document.createElement('div');
      el.className = 'listing-price-marker';
      const isSelected = selectedListingId === listing.id;

      el.innerHTML = `
        <div style="
          background-color: ${isSelected ? '#0891b2' : '#ffffff'};
          color: ${isSelected ? '#ffffff' : '#0f172a'};
          font-weight: 700;
          font-size: 13px;
          padding: 6px 12px;
          border-radius: 24px;
          box-shadow: ${isSelected ? '0 4px 12px rgba(8,145,178,0.4)' : '0 2px 6px rgba(0,0,0,0.15)'};
          border: 1px solid ${isSelected ? '#0891b2' : 'rgba(0,0,0,0.08)'};
          cursor: pointer;
          transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        ">
          ${listing.pricePerNight} $ CAD
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.1)';
        el.style.zIndex = '999';
        if (onHoverListing) onHoverListing(listing.id);
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1.0)';
        el.style.zIndex = 'auto';
        if (onHoverListing) onHoverListing(null);
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectListing(listing);
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(map.current!);

      markersRef.current[listing.id] = marker;
      bounds.extend([listing.longitude, listing.latitude]);
    });

    // Fit map bounds to encompass all listings
    if (validListings.length > 1) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 13, duration: 1000 });
    }
  }, [listings, selectedListingId]);

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-xs border border-neutral-200">
      <div ref={mapContainer} className="w-full h-full min-h-[500px]" />
    </div>
  );
};
