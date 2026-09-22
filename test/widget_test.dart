import 'package:flutter_test/flutter_test.dart';
import 'package:routesense/main.dart';
import 'package:routesense/services/bus_simulation_engine.dart';

void main() {
  tearDown(() {
    BusSimulationEngine().stop();
  });

  testWidgets('RouteSenseApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const RouteSenseApp());
    expect(find.byType(RouteSenseApp), findsOneWidget);
    BusSimulationEngine().stop();
  });
}
