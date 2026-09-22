import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat currencyFormatter = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static String currency(num amount) {
    return currencyFormatter.format(amount);
  }

  static String time(DateTime dateTime) {
    return DateFormat('hh:mm a').format(dateTime);
  }

  static String date(DateTime dateTime) {
    return DateFormat('dd MMM yyyy').format(dateTime);
  }

  static String dateTime(DateTime dateTime) {
    return DateFormat('dd MMM yyyy, hh:mm a').format(dateTime);
  }

  static String fromIsoString(String? isoString) {
    if (isoString == null || isoString.isEmpty) return '--';
    try {
      final dt = DateTime.parse(isoString);
      return DateFormat('hh:mm a').format(dt);
    } catch (_) {
      return isoString;
    }
  }
}
