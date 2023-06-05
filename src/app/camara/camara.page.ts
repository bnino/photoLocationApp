import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, FilesystemDirectory } from '@capacitor/filesystem';
import { Geolocation, GeolocationPosition } from '@capacitor/geolocation';

import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import { GeorrefrenciaService } from '../services/georrefrencia.service';
import { coordenadas } from 'src/interfaces/abcisas.interface';

@Component({
  selector: 'app-camara',
  templateUrl: './camara.page.html',
  styleUrls: ['./camara.page.scss'],
})
export class CamaraPage implements OnInit{
  photo: string | undefined;
  foto: string | undefined;
  geolocationInfo: Promise<{ lat: number; lng: number; }> | undefined;
  dateTimeInfo: string | undefined;
  nombreFoto: String | undefined;

  constructor(private http: HttpClient, private coords: GeorrefrenciaService) { }

  ngOnInit() {

    this.coords.puntoCercano();
  }

  async takePhoto() {
    try {
      //Tomar la foto

      const foto = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
  
      this.foto = foto.dataUrl;
      
      //Coincidencia más cercana según posición actual
      const masCercana : coordenadas = await this.coords.puntoCercano();

      // Obtener información de georreferenciación
      //const position = await Geolocation.getCurrentPosition();
      //console.log(position.coords);
      
      //const { latitude, longitude } = position.coords;
      this.geolocationInfo = this.coords.obtenerGeorreferencia();

      //const coordsJSON = this.coords.obtenerCoordenadasJSON();

      // Crear el elemento canvas
      const canvas: HTMLCanvasElement = document.createElement('canvas');
      const context = canvas.getContext('2d');

      if(context){
        // Cargar la imagen en el canvas
        const image = new Image();
        image.src = 'data:image/jpeg;base64,' + foto.base64String;
        await image.decode();
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        // Agregar texto superpuesto
        context.font = '120pt serif';
        context.fillStyle = 'black';
        context.fillText(`Fecha: ${new Date().toLocaleDateString()}`, 10, canvas.height - 430);
        context.fillText(`Hora: ${new Date().toLocaleTimeString()}`, 10, canvas.height - 290);
        context.fillText(`Coords: ${masCercana.Latitud}, ${masCercana.Longitud}`, 10, canvas.height - 150);
        context.fillText(`PR: ${masCercana.Abcisa}     MAGDALENA 2`, 10, canvas.height - 10);
      }

      // Convertir el canvas a una imagen base64
      const fotoConTexto = canvas.toDataURL('image/jpeg');

      const nombreFoto = new Date().getTime() + '.jpeg';
      this.nombreFoto = nombreFoto;

      if (await Filesystem.checkPermissions()){
        await Filesystem.writeFile({
          path: nombreFoto,
          data: fotoConTexto,
          directory: Directory.External
        });

      }else{
        console.log("LA FOTO NO SE CREO NI GUARDO BIEN")
      }
      
      this.foto = await fotoConTexto;
      //console.log(foto)
      //console.log('Foto guardada en:', nombreFoto);
      // Obtener fecha y hora actual
      const currentDateTime = new Date();
      this.dateTimeInfo = currentDateTime.toLocaleString();

    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }

    //this.coords.obtenerCoordenadasJSON

    //console.log(masCercana)

  }

  async savePhoto() {
    if (!this.foto) {
      console.log('No hay foto para guardar.');
      return;
    }
  
    if (Capacitor.getPlatform() === 'web') {
      console.log('La plataforma web no admite el guardado de fotos en el dispositivo.');
      return;
    }
  
    try {
      const base64Data = this.foto.split(',')[1];
      const fileName = new Date().getTime() + '.jpeg';
  
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.External,
        recursive: true
      });
  
      if (savedFile.uri) {
        console.log('Foto guardada en el dispositivo:', savedFile.uri);
      }
    } catch (error) {
      console.error('Error al guardar la foto en el dispositivo:', error);
    }
  }

  async obtenerRutaFoto(nombreFoto: String | undefined): Promise<string> {
    try {
      const directorio = await Filesystem.getUri({
        directory: Directory.External,
        path: 'Pictures',
      });
      const rutaFoto = `${directorio.uri}/${nombreFoto}`;
      return rutaFoto;
    } catch (error) {
      console.error('Error al obtener la ruta de la foto:', error);
      return '';
    }
  }

}
