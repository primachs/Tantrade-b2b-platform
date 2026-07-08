import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiRequest, ApiError } from './client';

describe('API Client', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(global, 'fetch');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('performs a successful GET request', async () => {
    const mockResponse = { data: 'test' };
    fetchSpy.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }));

    const result = await apiRequest('/test-endpoint');
    
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/test-endpoint'), expect.objectContaining({
      method: 'GET',
      headers: { Accept: 'application/json' },
      body: undefined,
    }));
    expect(result).toEqual(mockResponse);
  });

  it('adds Authorization header if token is provided', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }));

    await apiRequest('/test', { token: 'my-token' });
    
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/test'), expect.objectContaining({
      headers: { 
        Accept: 'application/json',
        Authorization: 'Bearer my-token' 
      },
    }));
  });

  it('sends JSON body for POST requests', async () => {
    fetchSpy.mockResolvedValueOnce(new Response('{}', {
      status: 200,
      headers: { 'content-type': 'application/json' }
    }));

    await apiRequest('/test', { method: 'POST', body: { foo: 'bar' } });
    
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/api/test'), expect.objectContaining({
      method: 'POST',
      headers: { 
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ foo: 'bar' }),
    }));
  });

  it('throws ApiError on failed response', async () => {
    const errorResponse = { message: 'Invalid data', errors: { field1: ['Required'] } };
    fetchSpy.mockImplementation(async () => new Response(JSON.stringify(errorResponse), {
      status: 422,
      headers: { 'content-type': 'application/json' }
    }));

    await expect(apiRequest('/test')).rejects.toThrow(ApiError);
    await expect(apiRequest('/test')).rejects.toMatchObject({
      status: 422,
      message: 'Invalid data',
      fieldErrors: { field1: ['Required'] }
    });
  });

  it('ApiError.firstFieldError returns the first field error', () => {
    const error = new ApiError('Error', 400, {
      name: ['Name is required'],
      email: ['Email is invalid']
    });
    expect(error.firstFieldError()).toBe('Name is required');
  });

  it('ApiError.firstFieldError returns null if no field errors', () => {
    const error = new ApiError('Error', 400);
    expect(error.firstFieldError()).toBeNull();
  });
});
