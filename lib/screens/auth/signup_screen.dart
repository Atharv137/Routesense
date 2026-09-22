import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/validators/form_validators.dart';
import '../../providers/auth_provider.dart';

class SignUpScreen extends StatefulWidget {
  final VoidCallback onSwitchToLogin;

  const SignUpScreen({required this.onSwitchToLogin});

  @override
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  String _selectedRole = 'passenger';

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleSignUp() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.register(
      name: _nameController.text,
      email: _emailController.text,
      phone: _phoneController.text,
      role: _selectedRole,
      password: _passwordController.text,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Center(
                    child: Container(
                      width: 50,
                      height: 50,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.person_add_rounded, size: 28, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Create RouteSense Account',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Register for fleet operations or passenger access',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                  ),

                  const SizedBox(height: 20),

                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Account Role', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          DropdownButtonFormField<String>(
                            value: _selectedRole,
                            decoration: const InputDecoration(
                              contentPadding: EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            ),
                            items: const [
                              DropdownMenuItem(value: 'passenger', child: Text('Passenger (Commuter)')),
                              DropdownMenuItem(value: 'conductor', child: Text('Conductor (Fare & Ticketing)')),
                              DropdownMenuItem(value: 'driver', child: Text('Driver (Telemetry & Incidents)')),
                              DropdownMenuItem(value: 'operations_manager', child: Text('Operations Manager (Dispatch & Fleet)')),
                            ],
                            onChanged: (val) => setState(() => _selectedRole = val ?? 'passenger'),
                          ),
                          const SizedBox(height: 14),

                          const Text('Full Name', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _nameController,
                            validator: (val) => FormValidators.requiredField(val, 'Name is required'),
                            decoration: const InputDecoration(hintText: 'e.g. Rahul Sharma'),
                          ),
                          const SizedBox(height: 14),

                          const Text('Email', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _emailController,
                            validator: FormValidators.email,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(hintText: 'email@example.com'),
                          ),
                          const SizedBox(height: 14),

                          const Text('Phone Number', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _phoneController,
                            validator: FormValidators.phone,
                            keyboardType: TextInputType.phone,
                            decoration: const InputDecoration(hintText: '+91 98765 43210'),
                          ),
                          const SizedBox(height: 14),

                          const Text('Password', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _passwordController,
                            validator: FormValidators.password,
                            obscureText: true,
                            decoration: const InputDecoration(hintText: 'At least 6 characters'),
                          ),
                          const SizedBox(height: 24),

                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: auth.isLoading ? null : _handleSignUp,
                              child: auth.isLoading
                                  ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                  : const Text('Complete Registration'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text('Already have an account? ', style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      TextButton(
                        onPressed: widget.onSwitchToLogin,
                        child: const Text('Sign In', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
