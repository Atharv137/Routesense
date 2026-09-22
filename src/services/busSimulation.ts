import { RouteSenseStorage } from './storage';
import { Bus, BusRoute } from '../types';

class BusSimulationEngine {
  private intervalId: number | null = null;
  private isRunning: boolean = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run simulation loop every 3 seconds
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private tick() {
    if (RouteSenseStorage.isOffline()) return;

    const buses = RouteSenseStorage.getBuses();
    const routes = RouteSenseStorage.getRoutes();

    const updatedBuses = buses.map(bus => {
      const route = routes.find(r => r.routeId === bus.routeId);
      if (!route || bus.status === 'breakdown' || bus.status === 'maintenance') {
        return bus;
      }

      const stops = route.scheduledStops;
      if (stops.length < 2) return bus;

      // Find closest stop
      let closestStopIndex = 0;
      let minDistance = 99999;
      stops.forEach((stop, idx) => {
        const d = Math.hypot(stop.lat - bus.latitude, stop.lng - bus.longitude);
        if (d < minDistance) {
          minDistance = d;
          closestStopIndex = idx;
        }
      });

      // Target next stop
      const nextIndex = (closestStopIndex + 1) % stops.length;
      const targetStop = stops[nextIndex];

      // Step towards target stop
      const step = 0.0008; // ~80m per 3s = ~96 km/h max or slower
      const dLat = targetStop.lat - bus.latitude;
      const dLng = targetStop.lng - bus.longitude;
      const distToTarget = Math.hypot(dLat, dLng);

      let newLat = bus.latitude;
      let newLng = bus.longitude;
      let newSpeed = bus.currentSpeed;
      let newEta = bus.etaNextStopMin;

      if (distToTarget < 0.001) {
        // Reached stop! Shift passengers slightly
        newLat = targetStop.lat;
        newLng = targetStop.lng;
        newEta = Math.max(1, (stops[(nextIndex + 1) % stops.length].etaMinutes || 5));
        newSpeed = Math.floor(Math.random() * 10) + 15; // 15-25 km/h
      } else {
        newLat += (dLat / distToTarget) * step;
        newLng += (dLng / distToTarget) * step;
        newSpeed = Math.max(12, Math.min(48, Math.floor(bus.currentSpeed + (Math.random() * 6 - 3))));
        newEta = Math.max(1, Math.round(distToTarget * 120));
      }

      return {
        ...bus,
        latitude: Number(newLat.toFixed(6)),
        longitude: Number(newLng.toFixed(6)),
        currentSpeed: newSpeed,
        nextStop: targetStop.name,
        etaNextStopMin: newEta,
        lastUpdated: new Date().toISOString(),
      };
    });

    updatedBuses.forEach(bus => RouteSenseStorage.updateBus(bus));
  }
}

export const busSimulation = new BusSimulationEngine();
