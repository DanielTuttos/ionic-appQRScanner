import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  nombreArchivo: string = 'registros.csv';

  guardados: Registro[] = [];

  constructor(private storage: Storage, private navCtrl: NavController, private inAppBrowser: InAppBrowser, private file: File, private emailComposer: EmailComposer) {
    //cargar registros
    this.cargarRegistros();

  }

  async guardarRegistro(format: string, text: string) {

    await this.cargarRegistros();
    const nuevoRegistro = new Registro(format, text);

    this.guardados.unshift(nuevoRegistro);
    //console.log(this.guardados);
    //registros en el storage

    this.storage.set('registros', this.guardados);

    this.abrirRegistro(nuevoRegistro);

  }

  async cargarRegistros() {
    const registros = await this.storage.get('registros');
    this.guardados = registros || [];
    //console.log('registros del storage: ',registros)
    return this.guardados;
  }

  abrirRegistro(registro: Registro) {
    this.navCtrl.navigateForward('/tabs/tab2');

    switch (registro.type) {
      case 'http':
        //abrir navegador web por defecto
        this.inAppBrowser.create(registro.text, '_system');

        break;

      case 'geo':
        this.navCtrl.navigateForward(`/tabs/tab2/mapa/${registro.text}`);
        break;
    }

  }

  enviarCorreo() {
    const arrTemp = [];
    const titulos = 'Tipo, Formato, Creado en, Texto\n';

    arrTemp.push(titulos);

    this.guardados.forEach(registro => {
      const linea = `${registro.type}, ${registro.format}, ${registro.created}, ${registro.text.replace(',', ' ')}\n`;
      arrTemp.push(linea);
    });

    this.crearArchivoFisico(arrTemp.join(''));

  }

  crearArchivoFisico(text: string) {
    this.file.checkFile(this.file.dataDirectory, this.nombreArchivo)
      .then(existe => {
        console.log('Existe Archivo ', existe);
        return this.escribirEnArchivo(text);
      })
      .catch(err => {
        return this.file.createFile(this.file.dataDirectory, this.nombreArchivo, false)
          .then(creado => this.escribirEnArchivo(text))
          .catch(err2 => console.log('no se pudo crear el archivo: ', err2));
      })
  }
  async escribirEnArchivo(text: string) {
    await this.file.writeExistingFile(this.file.dataDirectory, this.nombreArchivo, text);

    const archivo = `${this.file.dataDirectory}${this.nombreArchivo}`;

    console.log(`archivo creado, ${this.file.dataDirectory}${this.nombreArchivo}`);

    const email = {
      to: 'tutorialesdanielromero@gmail.com',
      //cc: 'erika@mustermann.de',
      //bcc: ['john@doe.com', 'jane@doe.com'],
      attachments: [
        archivo
        //'file://img/logo.png',
        //'res://icon.png',
        //'base64:icon.png//iVBORw0KGgoAAAANSUhEUg...',
        //'file://README.pdf'
      ],
      subject: 'Backup de scans',
      body: 'Aqui tiene su backup de sus scans. \n Este mensaje se genero de forma automatica no responda a el. \n ScansApp CreatedBy Daniel Romero',
      isHtml: true
    };

    // Send a text message using default options
    this.emailComposer.open(email);

  }


}
