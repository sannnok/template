import { Component, OnInit } from '@angular/core';
import {Http, Response, Headers,RequestOptions } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { UserService } from '../user.service';

import { Uploader }      from 'angular2-http-file-upload';
import { MyUploadItem }  from '../my-upload-item';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  server:string;
  items:any;
  successFlag:boolean;
  alertTrigger:boolean;
  loading:boolean;
  created:boolean;
  deleted:boolean;
  ArrGroupElements: any;
  



  constructor(private http:Http, private user: UserService, public uploaderService: Uploader) { 
    this.successFlag = false,
    this.loading = false,
    this.created = false,
    this.deleted = false,
    this.ArrGroupElements = []
    this.items = ''

  }
 
  ngOnInit() {
    this.server = "188.237.141.56:2020";
  	// Здесь можно выполнять загрузку данных с сервера или из других источников данных.
    this.getToCartFromServer();

      if (this.loading){
       $(function(){
        
       })
     }

    $(function(){
      $('.popup .close_window, .overlay').click(function (){
      $('.popup, .overlay').css({'opacity': 0, 'visibility': 'hidden'});
      });
      $('a.open_window').click(function (e){
      $('.popup, .overlay').css({'opacity': 1, 'visibility': 'visible'});
      e.preventDefault();
      });
    })

  }

  HTTPVar;
  HTTPVar1;
  
  httpSuccess(res){
    this.HTTPVar = res.json();
    this.items = this.HTTPVar;
    var it = this.items;
    this.successFlag = true;
    console.log("items: ", this.items)
    console.log('1st item ', this.items[0])
    var PrevStore = ''
    var Object = {}
    var ArrOfitems = []
    for (var i = 0; i<this.items.length; i++){
      if(this.items[i].sklad !== PrevStore){
        if(i!==0){
          this.ArrGroupElements.push({store: this.items[i-1].sklad, items: ArrOfitems})
          ArrOfitems = []
          console.log('Добавляем группу - ',this.items[i].sklad)
        }
        console.log('записываем итем- ',i)
        PrevStore = this.items[i].sklad
        ArrOfitems.push(this.items[i])
      } else if (this.items[i].sklad == PrevStore) {
        ArrOfitems.push(this.items[i])
        console.log("продолжаем добавление итемов -", i)
      }
        if(i == this.items.length-1){
          this.ArrGroupElements.push({store: this.items[i].sklad, items: ArrOfitems})
          console.log('Добавляем группу - ',this.items[i].sklad)
          ArrOfitems = []
        }      
    }
    console.log('finish: ', this.ArrGroupElements)


  }
  httpSuccessDeleteToCart(res){
    this.deleted = true
    this.HTTPVar1 = res.json();
    // this.string = this.HTTPVar1;
    // console.log('string   :   ', this.HTTPVar1['0'].affectedRows)
      this.alertTrigger = true;
      setTimeout(() => {
        this.alertTrigger = false;
        this.getToCartFromServer();
      }, 2000);   
  }

  httpError(err){
    console.log("Error");
    console.log(err);
  }

  getToCartFromServer(){
    this.http
      .get("http://"+ this.server+"/getToCart?user_id="+this.user.getUserId()+"&price_type=1")
      .toPromise()
      .then(res => this.httpSuccess(res))
      .catch(res => this.httpError(res))
  }

  body = {}; //{response:"Post: Hello from Angular!"}
  deleteFromCart(item:any){
      this.body = {result:{
        data:{
          user_id : this.user.getUserId(),
          nom_id : item.nom_id, 
          sklad_id : item.sklad_id, 
        },
        action:'addToCart'
      }};
       //console.log('1 ',item.nom_id, ' ', item.sklad_id)
      this.http
        .post("http://"+ this.server+"/deleteFromCart",this.body)
        .toPromise()
        .then(res => this.httpSuccessDeleteToCart(res))
        .catch(res => this.httpError(res)) 
  }
    responseAddingTo1C;
  httpSuccesssendTo1C(res){
    this.loading = false;
    this.created = true
    this.responseAddingTo1C = res.json()
    console.log('responseAddingTo1C from 1C: ', this.responseAddingTo1C)
    this.alertTrigger = true
    setTimeout(() => {
      this.alertTrigger = false
    }, 3000)  







//    $('.popup, .overlay').css({'opacity': 0, 'visibility': 'hidden'});
  }

  SendTo1C(item:any){
    this.loading = true;

     console.log('code ', item.code)

      this.body = {result:{
        data:{
          user_id : this.user.getUserId(),
          nom_id : item.nom_id,
          q : item.count, 
          sklad_id : item.code 
        },
        action:'sendTo1C'
      }}
      
      this.http
        .post("http://"+ this.server+"/sendTo1C",this.body)
        .toPromise()
        .then(res => this.httpSuccesssendTo1C(res))
        .catch(res => this.httpError(res)) 
//    $('.popup, .overlay').css({'opacity': 1, 'visibility': 'visible'});
     //console.log(this.body)
  }


  sendAllTo1C(){

    this.loading = true;

     //console.log('code ', item.code)

      this.body = {result:{
        data:{
          user_id : this.user.getUserId(),
          nom_id : null,
          q : null, 
          sklad_id : null
        },
        arrayOfItems: this.items,
        action:'sendAllTo1C'
      }}
      
      this.http
        .post("http://"+ this.server+"/sendTo1C",this.body)
        .toPromise()
        .then(res => this.httpSuccesssendTo1C(res))
        .catch(res => this.httpError(res)) 
//    $('.popup, .overlay').css({'opacity': 1, 'visibility': 'visible'});
     //console.log(this.body)

     console.log('items: ', this.items)
  }

  deleteFromCartAll(){

      this.body = {result:{
        data:{
          user_id : this.user.getUserId(),
          nom_id : null, 
          sklad_id : null, 
        },
        action:'deleteFromCartAll'
      }};
       //console.log('1 ',item.nom_id, ' ', item.sklad_id)
      this.http
        .post("http://"+ this.server+"/deleteFromCart",this.body)
        .toPromise()
        .then(res => this.httpSuccessDeleteToCart(res))
        .catch(res => this.httpError(res)) 

  }


  

  // fileChange(event){
  //     let fileList: FileList = event.target.files;
  //     if(fileList.length > 0) {
  //         let file: File = fileList[0];
  //         let formData:FormData = new FormData();
  //         formData.append('uploadFile', file, file.name);
  //         let headers = new Headers();
  //         /** No need to include Content-Type in Angular 4 */
  //         headers.append('Content-Type', 'multipart/form-data');
  //         headers.append('Accept', 'application/json');
  //         let options = new RequestOptions({ headers: headers });
  //         this.http.post('http://188.237.141.56:2020/sendFile', formData, options)
  //             .toPromise()
  //             .then(res => console.log('success sending file!'))
  //             .catch(error => console.log('error:::',error))

  //         // this.http.post(`${this.apiEndPoint}`, formData, options)
  //         //     .map(res => res.json())
  //         //     .catch(error => Observable.throw(error))
  //         //     .subscribe(
  //         //         data => console.log('success'),
  //         //         error => console.log(error)
  //         //     )
  //     }
  // }



    // submit() {
    //     let uploadFile = (<HTMLInputElement>window.document.getElementById('myFileInputField')).files[0];
    //   console.log(uploadFile)
    //     let myUploadItem = new MyUploadItem(uploadFile);
    //     //myUploadItem.formData = { FormDataKey: 'Form Data Value' };  // (optional) form data can be sent with file
 
    //     this.uploaderService.onSuccessUpload = (item, response, status, headers) => {
    //        console.log('onSuccessUpload')
    //     };
    //     this.uploaderService.onErrorUpload = (item, response, status, headers) => {
    //        console.log('onErrorUpload')
    //     };
    //     this.uploaderService.onCompleteUpload = (item, response, status, headers) => {
    //        console.log('onCompleteUpload')
    //     };
    //     this.uploaderService.upload(myUploadItem);
    // }



}
