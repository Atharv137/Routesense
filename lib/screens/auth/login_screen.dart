import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/initial_data.dart';
import '../../core/validators/form_validators.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  final VoidCallback onSwitchToSignUp;

  const LoginScreen({required this.onSwitchToSignUp});

  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController(text: 'anita.conductor@routesense.city');
  final _passwordController = TextEditingController(text: 'password123');
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    final auth = Provider.of<AuthProvider>(context, listen: false);
    await auth.login(_emailController.text, _passwordController.text);
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
                  // Logo & Heading
                  Center(
                    child: Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: const Icon(Icons.alt_route_rounded, size: 32, color: Colors.white),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Welcome to RouteSense',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Sign in to access your operational role console',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
                  ),

                  const SizedBox(height: 24),

                  // Quick Demo Credentials Selector
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'DEMO ACCOUNTS (INSTANT SIGN-IN)',
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.textSecondary, letterSpacing: 0.6),
                        ),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: InitialData.users.map((u) {
                            return ActionChip(
                              avatar: CircleAvatar(
                                radius: 10,
                                backgroundColor: AppColors.primaryLight,
                                child: Text(u.name[0], style: const TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.bold)),
                              ),
                              label: Text('${u.role.toUpperCase()} (${u.name.split(" ").first})', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                              onPressed: () {
                                _emailController.text = u.email;
                                _passwordController.text = 'demo1234';
                                auth.login(u.email, 'demo1234');
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Form Container
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
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          if (auth.errorMessage != null)
                            Container(
                              padding: const EdgeInsets.all(10),
                              margin: const EdgeInsets.only(bottom: 16),
                              decoration: BoxDecoration(
                                color: AppColors.errorLight,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                auth.errorMessage!,
                                style: const TextStyle(color: AppColors.error, fontSize: 13),
                              ),
                            ),
                          const Text('Email Address', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _emailController,
                            validator: FormValidators.email,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              hintText: 'name@routesense.city',
                              prefixIcon: Icon(Icons.email_outlined, size: 18),
                            ),
                          ),
                          const SizedBox(height: 16),
                          const Text('Password', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                          const SizedBox(height: 6),
                          TextFormField(
                            controller: _passwordController,
                            validator: FormValidators.password,
                            obscureText: _obscurePassword,
                            decoration: InputDecoration(
                              hintText: '••••••••',
                              prefixIcon: const Icon(Icons.lock_outline_rounded, size: 18),
                              suffixIcon: IconButton(
                                icon: Icon(_obscurePassword ? Icons.visibility_off_rounded : Icons.visibility_rounded, size: 18),
                                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),
                          ElevatedButton(
                            onPressed: auth.isLoading ? null : _handleLogin,
                            child: auth.isLoading
                                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                                : const Text('Sign In'),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Don't have an account? ", style: TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                      TextButton(
                        onPressed: widget.onSwitchToSignUp,
                        child: const Text('Register', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
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
