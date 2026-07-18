export interface SearchResultItem {
  place_id: number;
  lat: string; // e.g.: "57.1482429"
  lon: string; // e.g.: "-2.0928095"
  importance: number; // relevance value e.g.: 0.650941979591697
  addresstype: string; // e.g.: "city"
  name: string; // e.g.: "Aberdeen"
  display_name: string; // fuller name, e.g.: "Aberdeen City, Scotland, United Kingdom"
}
