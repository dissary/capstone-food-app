import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

function wrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}

beforeEach(() => {
  localStorage.clear();
});

describe('CartContext', () => {
  it('starts with an empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cart).toEqual([]);
  });

  it('adds an item to the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart({ id: 1, name: 'Nasi Lemak', price: '15.00' }, 5);
    });
    expect(result.current.cart).toHaveLength(1);
    expect(result.current.cart[0].name).toBe('Nasi Lemak');
  });

  it('increments quantity when the same item is added twice', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart({ id: 1, name: 'Nasi Lemak', price: '15.00' }, 5);
      result.current.addToCart({ id: 1, name: 'Nasi Lemak', price: '15.00' }, 5);
    });
    expect(result.current.cart[0].quantity).toBe(2);
  });

  it('resets restaurantId when the cart becomes empty (regression test)', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => {
      result.current.addToCart({ id: 1, name: 'Nasi Lemak', price: '15.00' }, 5);
    });
    expect(result.current.restaurantId).toBe(5);

    act(() => {
      result.current.removeFromCart(1);
    });
    expect(result.current.cart).toEqual([]);
    expect(result.current.restaurantId).toBe(null);
  });
});