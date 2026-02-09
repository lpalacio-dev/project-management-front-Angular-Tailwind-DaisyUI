// src/app/features/auth/validators/password.validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validator que verifica que dos campos de password coincidan
 * Se aplica a nivel de FormGroup
 * 
 * Uso:
 * this.form = this.fb.group({
 *   password: ['', Validators.required],
 *   confirmPassword: ['', Validators.required]
 * }, { validators: passwordMatchValidator('password', 'confirmPassword') });
 */
export function passwordMatchValidator(
  passwordField: string = 'password',
  confirmPasswordField: string = 'confirmPassword'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirmPassword = control.get(confirmPasswordField);

    // Si alguno de los campos no existe, no validar
    if (!password || !confirmPassword) {
      return null;
    }

    // Si confirmPassword está vacío, no validar (lo maneja required)
    if (!confirmPassword.value) {
      return null;
    }

    // Verificar si coinciden
    const match = password.value === confirmPassword.value;

    // Si no coinciden, agregar error al campo confirmPassword
    if (!match) {
      confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      // Si coinciden, remover el error passwordMismatch
      if (confirmPassword.hasError('passwordMismatch')) {
        const errors = { ...confirmPassword.errors };
        delete errors['passwordMismatch'];
        confirmPassword.setErrors(Object.keys(errors).length ? errors : null);
      }
    }

    return null;
  };
}

/**
 * Validator de fortaleza de contraseña
 * Requiere al menos:
 * - 1 letra minúscula
 * - 1 letra mayúscula
 * - 1 número
 * - Mínimo 8 caracteres
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasLowerCase = /[a-z]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasMinLength = value.length >= 8;

    const valid = hasLowerCase && hasUpperCase && hasNumeric && hasMinLength;

    if (!valid) {
      return {
        passwordStrength: {
          hasLowerCase,
          hasUpperCase,
          hasNumeric,
          hasMinLength
        }
      };
    }

    return null;
  };
}

/**
 * Validator que no permite espacios en el valor
 */
export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasWhitespace = /\s/.test(value);

    return hasWhitespace ? { whitespace: true } : null;
  };
}

/**
 * Calcula el nivel de fortaleza de una contraseña
 * Retorna: 'weak', 'medium', 'strong'
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';

  let strength = 0;

  // Criterios de fortaleza
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++; // Caracteres especiales

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

/**
 * Obtiene el color para el indicador de fortaleza (DaisyUI)
 */
export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'error';
    case 'medium':
      return 'warning';
    case 'strong':
      return 'success';
  }
}

/**
 * Obtiene el texto descriptivo de la fortaleza
 */
export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Débil';
    case 'medium':
      return 'Media';
    case 'strong':
      return 'Fuerte';
  }
}