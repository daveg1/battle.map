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
  coords: Point;
  battles: BattleItem[];
}
