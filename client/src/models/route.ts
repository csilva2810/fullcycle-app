export type RoutePosition = {
    lat: number;
    lng: number;
}

export type Route = {
    _id: string;
    title: string;
    startPosition: RoutePosition;
    endPosition: RoutePosition;
};