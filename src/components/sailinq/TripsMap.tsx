import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { akwenByKey } from '@/constants/akweny';
import { SailinqColors } from '@/constants/sailinq';
import type { TripView } from '@/lib/trips';

/**
 * Mapa rejsów oparta o Leaflet + OpenStreetMap renderowana w WebView.
 * Działa w Expo Go bez żadnych kluczy API. Pinezki ustawiane wg akwenu;
 * rejsy w tym samym akwenie lekko rozsuwamy, żeby się nie nakładały.
 */
export function TripsMap({ trips, onSelect }: { trips: TripView[]; onSelect: (id: string) => void }) {
  const html = useMemo(() => buildHtml(trips), [trips]);

  return (
    <View style={styles.wrap}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={styles.web}
        onMessage={(e) => {
          const id = e.nativeEvent.data;
          if (id) onSelect(id);
        }}
      />
    </View>
  );
}

function buildHtml(trips: TripView[]): string {
  // Pozycje pinezek: środek akwenu + małe rozsunięcie wg kolejności w akwenie.
  const perAkwen: Record<string, number> = {};
  const markers = trips.map((t) => {
    const a = akwenByKey(t.akwen) ?? akwenByKey('inny')!;
    const n = perAkwen[a.key] ?? 0;
    perAkwen[a.key] = n + 1;
    const angle = n * 1.3;
    const r = n === 0 ? 0 : 0.08 + n * 0.02;
    return {
      id: t.id,
      lat: a.lat + Math.sin(angle) * r,
      lng: a.lng + Math.cos(angle) * r,
      title: (t.route || 'Rejs').replace(/'/g, '’'),
      sub: [t.dates, t.price].filter(Boolean).join(' · ').replace(/'/g, '’'),
    };
  });

  const data = JSON.stringify(markers);

  return `<!DOCTYPE html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{height:100%;margin:0;background:${SailinqColors.bg}}
  .leaflet-popup-content{font-family:-apple-system,system-ui,sans-serif}
  .t{font-weight:700;font-size:14px;color:#0A1A2C}
  .s{font-size:12px;color:#5C7184;margin-top:2px}
  .b{display:inline-block;margin-top:8px;background:#57E0C6;color:#0A1A2C;
     font-weight:700;font-size:12px;padding:6px 12px;border-radius:999px;text-decoration:none}
</style></head><body><div id="map"></div>
<script>
  var markers = ${data};
  var map = L.map('map', { zoomControl: true }).setView([46,14], 4);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18, attribution: '© OpenStreetMap'
  }).addTo(map);

  var icon = L.divIcon({
    className:'', html:'<div style="background:#57E0C6;width:18px;height:18px;border-radius:50%;border:3px solid #0A1A2C;box-shadow:0 0 0 2px #57E0C6"></div>',
    iconSize:[18,18], iconAnchor:[9,9]
  });

  var group = [];
  markers.forEach(function(m){
    var mk = L.marker([m.lat, m.lng], {icon:icon}).addTo(map);
    mk.bindPopup('<div class="t">'+m.title+'</div><div class="s">'+m.sub+'</div>'+
      '<a class="b" href="#" onclick="send(\\''+m.id+'\\');return false;">Zobacz rejs</a>');
    group.push(mk);
  });
  if (group.length) {
    map.fitBounds(L.featureGroup(group).getBounds().pad(0.3));
  }

  function send(id){
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(id);
  }
</script></body></html>`;
}

const styles = StyleSheet.create({
  wrap: { flex: 1, margin: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: SailinqColors.surface },
  web: { flex: 1, backgroundColor: SailinqColors.bg },
});
