import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema, resetPasswordSchema } from '../../src/validators/auth.validator';
import { createIdeaSchema } from '../../src/validators/idea.validator';
import { saveAnswerSchema } from '../../src/validators/trial.validator';

describe('register validator', () => {
  const valid = {
    name: 'Ada Lovelace',
    username: 'ada_l',
    email: 'ada@example.com',
    password: 'Secret123',
    confirmPassword: 'Secret123',
    acceptTerms: true as const,
  };

  it('accepts a valid registration', () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects short passwords', () => {
    const result = registerSchema.safeParse({ ...valid, password: 'short1', confirmPassword: 'short1' });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: 'Different1' });
    expect(result.success).toBe(false);
  });

  it('requires terms acceptance', () => {
    const result = registerSchema.safeParse({ ...valid, acceptTerms: false });
    expect(result.success).toBe(false);
  });

  it('rejects invalid usernames', () => {
    const result = registerSchema.safeParse({ ...valid, username: 'bad name!' });
    expect(result.success).toBe(false);
  });
});

describe('login validator', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(8) });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'nope', password: 'x' });
    expect(result.success).toBe(false);
  });
});

describe('reset password validator', () => {
  it('rejects mismatched confirmation', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'a'.repeat(20),
      password: 'Secret123',
      confirmPassword: 'Other1234',
    });
    expect(result.success).toBe(false);
  });
});

describe('idea + trial validators', () => {
  it('caps idea description at 500 characters', () => {
    const result = createIdeaSchema.safeParse({
      title: 'Test idea',
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('requires an answer', () => {
    const result = saveAnswerSchema.safeParse({ questionId: 'q1', answer: '' });
    expect(result.success).toBe(false);
  });
});
