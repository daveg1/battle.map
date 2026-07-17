export interface Point {
  lat: number;
  lng: number;
}

export interface BattleItem {
  name: string;
  article: string;
  year: number;
  place: string;
  country: string;
  war: string;
  coords: Point;
}

export interface BattleMarkerItem {
  id: string;
  coords: Point;
  battles: BattleItem[];
}

export interface SavedPinItem {
  id: string;
  coords: Point;
  title: string;
  location: string;
  battleNames: string[];
}
