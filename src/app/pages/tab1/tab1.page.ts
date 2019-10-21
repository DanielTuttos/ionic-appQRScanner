import { Component } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { DataLocalService } from 'src/app/services/data-local.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  constructor(private barcodeScanner: BarcodeScanner, private dataLocal: DataLocalService) { }

  ionViewDidEnter() {//se ejecuta cuando carga la pagina
    //console.log('ionViewDidEnter');
  }

  ionViewDidLeave() {//se ejecuta cuando saledel lapagina
    //console.log('ionViewDidLeave');
  }


  ionViewWillEnter() {//se ejecuta antes  de cargar  la pagina
    //console.log('ionViewWillEnter');
    this.scan();
  }

  ionViewWillLeave() {//se ejecuta antes de salir de la pagina
    //console.log('ionViewWillLeave');
  }

  scan() {
    this.barcodeScanner.scan().then(barcodeData => {
      //console.log('Barcode data', barcodeData);

      if (!barcodeData.cancelled) {
        this.dataLocal.guardarRegistro(barcodeData.format, barcodeData.text);
      }

    }).catch(err => {
      console.log('Error ', err);
    });
  }

}
