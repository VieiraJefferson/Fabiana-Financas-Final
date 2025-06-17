import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface Plan {
  _id: string;
  name: string;
  displayName: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: {
    maxTransactions: number;
    maxCategories: number;
    maxGoals: number;
    hasAdvancedReports: boolean;
    hasVideoAccess: boolean;
    hasExport: boolean;
    hasPrioritySupport: boolean;
    hasMultipleAccounts: boolean;
  };
  highlights: string[];
  isActive: boolean;
  isPopular: boolean;
}

export interface SubscriptionInfo {
  currentPlan: string;
  planExpiry: string | null;
  planFeatures: {
    maxTransactions: number;
    maxCategories: number;
    maxGoals: number;
    hasAdvancedReports: boolean;
    hasVideoAccess: boolean;
  };
  planDetails: Plan | null;
}

export const usePayments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Criar sessão de checkout
  const createCheckoutSession = async (planId: string, billingPeriod: 'monthly' | 'yearly' = 'monthly') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao processar pagamento');
      }

      // Redirecionar para checkout do Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe não foi carregado');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

    } catch (err: any) {
      setError(err.message);
      console.error('Erro no checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obter informações da assinatura atual
  const getSubscriptionInfo = async (): Promise<SubscriptionInfo | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/subscription', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar assinatura');
      }

      return data.data;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar assinatura:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar assinatura
  const cancelSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao cancelar assinatura');
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao cancelar assinatura:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar planos disponíveis
  const getAvailablePlans = async (): Promise<Plan[]> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/plans');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao buscar planos');
      }

      return data.data || [];
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar planos:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createCheckoutSession,
    getSubscriptionInfo,
    cancelSubscription,
    getAvailablePlans,
  };
}; 