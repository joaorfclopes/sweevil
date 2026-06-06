import { describe, expect, it } from '@jest/globals';
import { buildTrackingUrl } from '../mailing/trackingUrl.js';

describe('buildTrackingUrl', () => {
  it('returns null when trackingNumber is empty string', () => {
    expect(buildTrackingUrl('CTT', '', '1000-001')).toBeNull();
  });

  it('returns null when trackingNumber is null', () => {
    expect(buildTrackingUrl('CTT', null, '1000-001')).toBeNull();
  });

  it('returns null when trackingNumber is undefined', () => {
    expect(buildTrackingUrl('CTT', undefined, '1000-001')).toBeNull();
  });

  it('builds CTT URL', () => {
    expect(buildTrackingUrl('CTT', 'ABC123', '1000-001')).toBe(
      'https://appserver.ctt.pt/CustomerArea/PublicArea_Detail?ObjectCodeInput=ABC123&SearchInput=ABC123&IsFromPublicArea=true'
    );
  });

  it('builds DPD URL', () => {
    expect(buildTrackingUrl('DPD', 'ABC123', '1000-001')).toBe(
      'https://tracking.dpd.pt/track-and-trace?reference=ABC123'
    );
  });

  it('builds DHL URL', () => {
    expect(buildTrackingUrl('DHL', 'ABC123', '1000-001')).toBe(
      'https://www.dhl.com/pt-en/home/tracking.html?tracking-id=ABC123&submit=1'
    );
  });

  it('builds GLS URL using postalCode from shippingDetails', () => {
    expect(buildTrackingUrl('GLS', 'ABC123', '3880')).toBe(
      'https://mygls.gls-portugal.pt/e/ABC123/3880/en'
    );
  });

  it('returns null for unknown carrier', () => {
    expect(buildTrackingUrl('UNKNOWN', 'ABC123', '1000-001')).toBeNull();
  });
});
