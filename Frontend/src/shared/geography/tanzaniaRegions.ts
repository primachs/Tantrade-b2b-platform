/** Tanzania administrative regions and districts (mainland + Zanzibar). */
export const TANZANIA_REGIONS: Record<string, string[]> = {
  Arusha: ["Arusha", "Arumeru", "Karatu", "Longido", "Meru", "Monduli", "Ngorongoro"],
  "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Ubungo", "Kigamboni"],
  Dodoma: ["Dodoma", "Bahi", "Chamwino", "Chemba", "Kondoa", "Kongwa", "Mpwapwa"],
  Geita: ["Geita", "Bukombe", "Chato", "Mbogwe", "Nyang'hwale"],
  Iringa: ["Iringa", "Kilolo", "Mufindi"],
  Kagera: ["Bukoba", "Biharamulo", "Karagwe", "Kyerwa", "Misenyi", "Muleba", "Ngara"],
  Katavi: ["Mpanda", "Mlele", "Tanganyika"],
  Kigoma: ["Kigoma", "Kasulu", "Kibondo", "Kakonko", "Buhigwe", "Uvinza"],
  Kilimanjaro: ["Moshi", "Hai", "Rombo", "Same", "Siha"],
  Lindi: ["Lindi", "Kilwa", "Liwale", "Nachingwea", "Ruangwa"],
  Manyara: ["Babati", "Hanang", "Kiteto", "Mbulu", "Simanjiro"],
  Mara: ["Musoma", "Bunda", "Butiama", "Rorya", "Serengeti", "Tarime"],
  Mbeya: ["Mbeya", "Chunya", "Kyela", "Mbarali", "Rungwe"],
  Morogoro: ["Morogoro", "Gairo", "Kilombero", "Kilosa", "Malinyi", "Mvomero", "Ulanga"],
  Mtwara: ["Mtwara", "Masasi", "Nanyumbu", "Newala", "Tandahimba"],
  Mwanza: ["Ilemela", "Kwimba", "Magu", "Misungwi", "Nyamagana", "Sengerema", "Ukerewe"],
  Njombe: ["Njombe", "Ludewa", "Makete", "Wanging'ombe"],
  "Pemba North": ["Micheweni", "Wete"],
  "Pemba South": ["Chake Chake", "Mkoani"],
  Pwani: ["Kibaha", "Bagamoyo", "Kisarawe", "Mafia", "Mkuranga", "Rufiji"],
  Rukwa: ["Sumbawanga", "Kalambo", "Nkasi"],
  Ruvuma: ["Songea", "Mbinga", "Nyasa", "Tunduru"],
  Shinyanga: ["Shinyanga", "Kahama", "Kishapu", "Ushetu"],
  Simiyu: ["Bariadi", "Busega", "Itilima", "Maswa", "Meatu"],
  Singida: ["Singida", "Ikungi", "Iramba", "Manyoni", "Mkalama"],
  Songwe: ["Songwe", "Ileje", "Mbozi", "Momba", "Tunduma"],
  Tabora: ["Tabora", "Igunga", "Kaliua", "Nzega", "Sikonge", "Urambo", "Uyui"],
  Tanga: ["Tanga", "Handeni", "Kilindi", "Korogwe", "Lushoto", "Mkinga", "Muheza", "Pangani"],
  "Unguja North": ["North A", "North B"],
  "Unguja South": ["South", "Central"],
  "Unguja Urban West": ["Magharibi", "Urban"],
};

export const REGION_NAMES = Object.keys(TANZANIA_REGIONS);

export function districtsForRegion(region: string): string[] {
  return TANZANIA_REGIONS[region] ?? [];
}

export function isValidDistrict(region: string, district: string): boolean {
  return districtsForRegion(region).includes(district);
}
