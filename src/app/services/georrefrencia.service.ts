import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';
import * as geolib from "geolib";

@Injectable({
  providedIn: 'root'
})
export class GeorrefrenciaService {


  constructor(private http: HttpClient) { }

  async obtenerGeorreferencia(): Promise<{ lat: number, lng: number }> {
    // Obtener Georeferencia actual
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true
  });
    const { latitude, longitude } = position.coords;
    return { lat: latitude, lng: longitude };
  }

  async obtenerCoordenadasJSON(): Promise<any> {
    // Leer el archivo JSON con las coordenadas
    const datosJSON = await this.http.get('assets/data/coordenadas.json').toPromise();
    //console.log("Coordenadas: ", datosJSON)
    return datosJSON;
  }

  calcularDistancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Utiliza una fórmula para calcular la distancia entre dos puntos geográficos
    // Puedes utilizar la fórmula de la distancia en el espacio euclidiano o utilizar bibliotecas como 'geolib'
    // para cálculos más avanzados

    const radianes = (grados: number) => (grados * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en kilómetros

    const dLat = radianes(lat2 - lat1);
    const dLng = radianes(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radianes(lat1)) * Math.cos(radianes(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;

    //console.log(distancia)
    return distancia;
  }

  async encontrarCoincidenciaMasCercana(): Promise<any> {
    const georreferenciaActual = await this.obtenerGeorreferencia();
    const coordenadasJSON = await this.obtenerCoordenadasJSON();

    let distanciaMinima = Infinity;
    let coincidenciaMasCercana;

    for (const coordenada of coordenadasJSON) {
      const distancia = this.calcularDistancia(
        georreferenciaActual.lat,
        georreferenciaActual.lng,
        coordenada.Latitud,
        coordenada.Longitud
      );

      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        coincidenciaMasCercana = coordenada;
      }
    }
    return coincidenciaMasCercana;
  }

  async puntoCercano(): Promise<any>{
    const georreferenciaActual = await this.obtenerGeorreferencia();
    const coordenadasJSON = await this.obtenerCoordenadasJSON();

    let pr;
    let distanciaMinima = Infinity;

    for (const coordenada of coordenadasJSON) {
      const distancia = geolib.getPreciseDistance(
        {
          latitude: georreferenciaActual.lat,
          longitude: georreferenciaActual.lng
        },
        {
          latitude: coordenada.Latitud,
          longitude: coordenada.Longitud
        }
      )

      if (distancia < distanciaMinima) {
        distanciaMinima = distancia;
        pr = coordenada;
      }
      
    }
    return pr;
  }
}
