export type NewPositionMessage = {
  routeId: string;
  clientId: string;
  position: [number, number];
  finished: boolean;
};

export type SimulatorNewPosition = NewPositionMessage & {
  RouteId: string;
};
