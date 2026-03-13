// Analytics stub — replace with PostHog when integrated
// Events: dna_share_clicked, dna_shared { channel }, dna_public_page_visited

export function trackShare(event: string, props?: Record<string, string>): void {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event, props);
  }
  // PostHog integration placeholder:
  // posthog.capture(event, props);
}
