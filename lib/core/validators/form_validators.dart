class FormValidators {
  static String? requiredField(String? value, [String message = 'This field is required']) {
    if (value == null || value.trim().isEmpty) {
      return message;
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }
    final clean = value.replaceAll(RegExp(r'[\s\-\+]'), '');
    if (clean.length < 10) {
      return 'Enter a valid 10-digit phone number';
    }
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password is required';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  static String? positiveNumber(String? value, [String fieldName = 'Value']) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    final num = int.tryParse(value.trim());
    if (num == null || num <= 0) {
      return 'Enter a positive number';
    }
    return null;
  }
}
