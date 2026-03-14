import { describe, it, expect } from 'vitest';
import { mapAsaasStatus, mapBillingType } from '@/lib/asaas/client';

describe('Asaas Client Utils', () => {
  describe('mapBillingType', () => {
    it('maps pix to PIX', () => {
      expect(mapBillingType('pix')).toBe('PIX');
    });

    it('maps credit_card to CREDIT_CARD', () => {
      expect(mapBillingType('credit_card')).toBe('CREDIT_CARD');
    });

    it('maps boleto to BOLETO', () => {
      expect(mapBillingType('boleto')).toBe('BOLETO');
    });

    it('defaults to PIX for unknown method', () => {
      expect(mapBillingType('unknown')).toBe('PIX');
    });
  });

  describe('mapAsaasStatus', () => {
    it('maps PENDING to pending', () => {
      expect(mapAsaasStatus('PENDING')).toBe('pending');
    });

    it('maps RECEIVED to confirmed', () => {
      expect(mapAsaasStatus('RECEIVED')).toBe('confirmed');
    });

    it('maps CONFIRMED to confirmed', () => {
      expect(mapAsaasStatus('CONFIRMED')).toBe('confirmed');
    });

    it('maps OVERDUE to overdue', () => {
      expect(mapAsaasStatus('OVERDUE')).toBe('overdue');
    });

    it('maps REFUNDED to refunded', () => {
      expect(mapAsaasStatus('REFUNDED')).toBe('refunded');
    });

    it('maps REFUND_REQUESTED to refunded', () => {
      expect(mapAsaasStatus('REFUND_REQUESTED')).toBe('refunded');
    });

    it('maps CHARGEBACK_REQUESTED to chargeback', () => {
      expect(mapAsaasStatus('CHARGEBACK_REQUESTED')).toBe('chargeback');
    });

    it('maps AWAITING_RISK_ANALYSIS to pending', () => {
      expect(mapAsaasStatus('AWAITING_RISK_ANALYSIS')).toBe('pending');
    });

    it('defaults to pending for unknown status', () => {
      expect(mapAsaasStatus('UNKNOWN_STATUS')).toBe('pending');
    });
  });
});
