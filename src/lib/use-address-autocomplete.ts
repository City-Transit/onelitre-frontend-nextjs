'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';

const API_KEY = process.env.GOOGLE_MAPS_API_KEY ?? '';
const DEFAULT_REGION_CODES = ['ng'];
const DEBOUNCE_MS = 250;

let optionsSet = false;
let placesLibraryPromise: Promise<google.maps.PlacesLibrary> | null = null;

function getPlacesLibrary(): Promise<google.maps.PlacesLibrary> {
  if (!optionsSet) {
    setOptions({ key: API_KEY });
    optionsSet = true;
  }
  if (!placesLibraryPromise) {
    placesLibraryPromise = importLibrary('places');
  }
  return placesLibraryPromise;
}

export interface AddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
}

/** Headless Places Autocomplete (New) — fetches raw suggestions so callers can render their own
 * dropdown styled to match the rest of the app, instead of Google's prebuilt
 * `<gmp-place-autocomplete>` element (a shadow-DOM web component whose inner input isn't
 * meaningfully restylable). Session tokens are handled per Google's billing guidance: one token
 * per search session, created on first keystroke and cleared once a suggestion is resolved to a
 * place — reusing a token across sessions, or omitting one, causes every keystroke to bill
 * individually instead of as one grouped session. No-ops entirely if
 * GOOGLE_MAPS_API_KEY isn't set, so the input this backs still works as a plain
 * text field without it. */
export function useAddressAutocomplete(regionCodes: string[] = DEFAULT_REGION_CODES) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const search = useCallback(
    (input: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!API_KEY || !input.trim()) {
        setSuggestions([]);
        return;
      }
      const requestId = ++requestIdRef.current;
      debounceRef.current = setTimeout(async () => {
        try {
          const { AutocompleteSuggestion, AutocompleteSessionToken } =
            await getPlacesLibrary();
          if (!sessionTokenRef.current) {
            sessionTokenRef.current = new AutocompleteSessionToken();
          }
          const { suggestions: results } =
            await AutocompleteSuggestion.fetchAutocompleteSuggestions({
              input,
              sessionToken: sessionTokenRef.current,
              includedRegionCodes: regionCodes,
            });
          if (requestId !== requestIdRef.current) return; // superseded by a newer keystroke
          setSuggestions(
            results
              .filter((s) => s.placePrediction)
              .map((s) => {
                const prediction = s.placePrediction!;
                return {
                  placeId: prediction.placeId,
                  mainText: (prediction.mainText ?? prediction.text).toString(),
                  secondaryText: prediction.secondaryText?.toString() ?? '',
                  prediction,
                };
              }),
          );
        } catch {
          if (requestId === requestIdRef.current) setSuggestions([]);
        }
      }, DEBOUNCE_MS);
    },
    [regionCodes],
  );

  const resolve = useCallback(
    async (prediction: google.maps.places.PlacePrediction): Promise<string> => {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['formattedAddress'] });
      sessionTokenRef.current = null;
      setSuggestions([]);
      return place.formattedAddress ?? prediction.text.toString();
    },
    [],
  );

  const clear = useCallback(() => setSuggestions([]), []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { suggestions, search, resolve, clear };
}
