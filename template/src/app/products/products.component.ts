import { Component, OnInit } from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { ActivatedRoute } from "@angular/router";
import { UserService } from '../user.service';
import { Routes, RouterModule, Router } from '@angular/router';
import { toCart } from "../tocart.model";


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  title:string;
  successFlag:boolean;
  responseJSON:any;
  alertTrigger:boolean;
  searchS:string;
  product:string;
  method: string;
  numberOfPage: string;
  quantityOfNomenclature:number;
  liveSearch:boolean;
  server:string;
  formMethod:string;
  id:string;
  warning: boolean;
  responseCartJSON: string;
  vremArray: number[] = [];
  curPage:number;
  image_url:string;
  table_view: boolean;
  simpleArray = [];
  newData : any;
  func:string;
  searchString:string;
  tableView:string;
  searchType: boolean;
  array_nom_store: any;
  model:any;
  toCartButton: boolean;
  errorOstatok: boolean;
  validation:boolean;
  currentItem:any;
  obj:any;

  fn0 = 'fn0'
  fn1 ='fn1'
  fn2 = 'fn2'
  fn3 ='fn3'
  fn4 = 'fn4'



  
  constructor(private http:Http, private route: ActivatedRoute, private user: UserService, private _router: Router){
	
	this.title = 'app';
	this.responseJSON = '';
	this.successFlag = false;
	this.alertTrigger = false;
	this.searchS = '';
  //For notification
	this.product ='';
	this.method = route.snapshot.params['method'];
	this.numberOfPage = route.snapshot.params['numberOfPage'];
	this.quantityOfNomenclature = 0;
	this.formMethod = route.snapshot.params['formMethod'];
  this.warning = false;
  this.table_view = false;
  this.newData = []
  this.func = route.snapshot.params['search'];
  this.tableView = route.snapshot.params['view'];
  this.model = new toCart();
  this.toCartButton = false;
  this.validation = false;
  this.obj = {}



  route.params.subscribe(params => this.initAfterRouteChange(params));


  
  }
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
   
  // Здесь можно выполнять загрузку данных с сервера или из других источников данных.
  ngOnInit() {
  	this.liveSearch = false;
  	this.server = "188.237.141.56:2020";
    this.searchType = false;

    if(this.searchString && this.numberOfPage){
      this.Search(this.searchString)
      //this.postPage(Number(this.numberOfPage))
    }

    if(this.tableView === '0'){
      this.table_view = false;
    }else if (this.tableView === '1') {
      this.table_view = true;   
      $("#someSwitchOptionPrimary").prop("checked", true);   
    }

    $(function(){
    //begin jquery
      $('.popup .close_window, .overlay').click(function (){
        $('.popup, .overlay').css({'opacity': 0, 'visibility': 'hidden'});
      });
      // $('a.open_window').click(function (e){
      // $('.popup, .overlay').css({'opacity': 1, 'visibility': 'visible'});
      // e.preventDefault();
      // });


      $('#myBtn').click(function(){
        //alert('button clicked!')
      })
      //Hide modal on click the Х
      $('.close').click(function(){
        //$('#myModal').css({'display': 'none'})
        
        //this.model = undefined;
      })
      //Hide modal on click anywhere
      $('body').click(function( event ){
        if( $(event.target).hasClass("modal") ){
           //$('#myModal').css({'display': 'none'})

        }
      })





    //end  
    })
  }

  // Инициализация переменных при изменении routes
  initAfterRouteChange(params:any){
    this.curPage = Number(params.numberOfPage);
    this.searchString =  params.search;
    console.log('searchString: ', this.searchString)
  }  


  // Создаем массив для pagination'а
  createRange(number){
    var items: number[] = [];
    for(var i = 1; i <= number; i++){
       items.push(i);
    }
    return items;
  }

  HTTPVar;
  HTTPVar1;
  l:number;
  i;

  // Успешный ответ с JSON товарами из mySQL-1C
  httpSuccess(res){
    //this.HTTPVar = JSON.parse(res._body);
    this.HTTPVar = res.json();
    this.responseJSON = this.HTTPVar.result;
    this.successFlag = true;
    console.log('res: ',this.responseJSON);

    for (this.i =0; this.i < this.responseJSON.length; this.i++){
      this.vremArray.push(1);
    }
    if(this.HTTPVar.totalRows>20){
      this.l = this.HTTPVar.totalRows/20;
      if(String(this.l).indexOf('.')){
        this.l = Math.ceil(this.l);//Number(String(this.l).substring(0,String(this.l).indexOf('.'))) +1;
      }
    }else{
      this.l = 1;
    }


    // /*
    //   Форматируем исходный массив для табличного вида (1 товар - несколько складов, а не 1товар -1 склад)
    //   (2-й вариант - посылать 20 запросов для одной странички, с инфо о складах в связке каждого товара)
    //  ============================================================================================================
    // */

    // class Config {
    //   _val:any
    //   obj:any
    //   constructor() {
    //     this.obj = {
    //       '19':'0',
    //       '4':'1',
    //       '25':'2',
    //       '26':'3',
    //       '27':'4',
    //       '6':'5',
    //       '2':'6',
    //       '20':'7',
    //       '21':'8',
    //       '1':'9',
    //       '16':'10',
    //       '24':'11',
    //       '5':'12',
    //       '15':'13',
    //       '12':'14',
    //       '9':'15',
    //     }
    //   }

    //   getPosition(elem) {
    //     return this.obj[elem]
    //   }
    // }

    // var nSklads = new Config()
    // //console.log("nSklads: ", nSklads.getPosition(4))

    // var k =0
    // Новый объект данных (устаревшее форматирование. Переделано в mySQL)
    // this.newData =[]
    // this.simpleArray =[]
    // for (var i = 0; i<this.responseJSON.length; i++) {

    //   var elem = this.responseJSON[i].elem; 
    //   var scladCode = this.responseJSON[i].code;
    //   var price = this.responseJSON[i].price;
    //   var edizm = this.responseJSON[i].edizm;
    //   var currency = this.responseJSON[i].currency
    //   var sklad_id = this.responseJSON[i].sklad_id
    //   var id = this.responseJSON[i].id
    //   var code = this.responseJSON[i].code
    //   //console.log('previous: ',this.simpleArray[k-1] , 'this: ', elem)




    //   if(this.simpleArray[k-1]!=elem && i>0) {
    //     var etalon = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
    //     etalon.splice(nSklads.getPosition(scladCode), 1, scladCode)
    //     this.simpleArray.push(elem)
    //     this.newData.push({item:elem, price: price, edizm: edizm, currency: currency, sklad_id: sklad_id, id: id, code: code, store: etalon})
    //     //console.log('pushed element and code ',k, 'elem: ',elem)
    //     k++
    //   }else if (i == 0) {
    //     //console.log('k in first push: ',k)
    //     var etalon = ['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0']
    //     etalon.splice(nSklads.getPosition(scladCode), 1, scladCode)
    //     this.simpleArray.push(elem)
    //     this.newData.push({item:elem, price: price, edizm: edizm, currency: currency, sklad_id: sklad_id, id: id, code: code, store: etalon})
    //     //console.log('pushed first element', elem)
    //     k++
    //   }else if (this.simpleArray[k-1]==elem && i>0){
    //     this.newData[k-1].store.splice(nSklads.getPosition(scladCode), 1, scladCode)
    //     //console.log("Клон! - pushed code", elem)
    //   }


    //   //console.log('this.simpleArray[k]: '+this.simpleArray[k-1])

    // }

    // console.log('array store: ', this.newData)

    /*
     ============================================================================================================
    */


    // for (let i=0;i<this.newData.length;i++){
    //   console.log('mI: '+this.newData[i].item )
    //   for(let j=0;j<this.newData[i].store.length;j++){
    //     console.log('stores: ', this.newData[i].store[j])
    //   }
    // }


    //   console.log('alfa: ', this.newData[0].store[0])

    //console.log('Q of rows: ', this.l)
  }

  // Успешная запись в БД - order (Добавление в корзину)
  httpSuccessAddToCart(res){
    this.HTTPVar1 = res.json();
    this.responseCartJSON = this.HTTPVar1;
    if((this.responseCartJSON[1] != undefined) && (this.responseCartJSON[1][0] != undefined) ){
      this.warning = true;
      //console.log('ЗАШЛИ')
    }
      this.alertTrigger = true;
      setTimeout(() => {
        this.alertTrigger = false;
        this.model = new toCart();
        $('#myModal').css({'display': 'none'})    
        this.toCartButton = false;
        this.validation = false;
      }, 2000);      
    
  }

  httpError(err){
  	console.log("Error");
  	console.log(err);
  }

  // HTTPRequest(){
  // 	this.http
  // 	  .get("http://"+ this.server+"/getTestAngular")
  // 	  .toPromise()
  // 	  .then(res => this.httpSuccess(res))
  // 	  .catch(res => this.httpError(res))
  // }

	//heroes = ['Windstorm', 'Bombasto', 'Magneta', 'Tornado'];

	Search(searchString: string) {
    console.log('searVal: ',searchString )
		if (searchString) {
			this.searchS = searchString;
		  //this.heroes.push(searchString);
		  //console.log (searchString);
      var searchT  = (this.searchType === true) ? '1' : '0'
      console.log('searchType: ', this.searchType, ' searchT: ', searchT)
	  	this.http
	  	  .get("http://" + this.server + "/getTestAngular?Param=" + this.searchS + "&NumOfPage=1&searchType=" + searchT)
	  	  .toPromise()
	  	  .then(res => this.httpSuccess(res))
	  	  .catch(res => this.httpError(res))
    // If we search from the ref of login, need to set up the view of result page
    var q = (this.tableView === undefined) ? '0' : this.tableView
    
    this._router.navigate(['products/page/'+'1' + '/'+searchString + '/' + q])        
		}
	}

  body = {}; //{response:"Post: Hello from Angular!"}
	addToCart(element: any, kol:number){
    console.log('element: ', element)
      //For notification we are adding info about element to the variable
      this.product = element;
      this.warning = false;
      this.body = {result : {
        data : {
          user_id    : this.user.getUserId(),
          nom_id     : element.id, 
          sklad_id   : element.sklad_id,
          code       : element.code, 
          count      : kol, 
          price_type : 1, 
          currency   : element.currency
      },action : 'addToCart'}};

      this.http
        .post("http://"+ this.server+"/addToCart",this.body)
        .toPromise()
        .then(res => this.httpSuccessAddToCart(res))
        .catch(res => this.httpError(res)) 
     // console.log(element.id,'sklad_id: ',element.sklad_id, '1','1', element.currency)
	}


  testArray = [{}]

  testToCart(){
    this.product = this.currentItem;
      this.warning = false;
    // console.log(this.model.length)
   // console.log('testArray ', this.testArray)
    class Convert {
      _val:any
      obj:any
      constructor() {
        this.obj = {
          '1':'19',
          '2':'4',
          '3':'25',
          '4':'26',
          '5':'27',
          '6':'6',
          '7':'2',
          '8':'20',
          '9':'21',
          '10':'1',
          '11':'16',
          '12':'24',
          '13':'5',
          '14':'15',
          '15':'12',
          '16':'9',
        }
      }

      getCodeFromCicle(elem) {
        return this.obj[elem]
      }
    }   
   var Re = new Convert
   

   for(var i=1; i<17; i++){
     var count = this.model[i];
     if(count !== 0 && count !== null && count !== undefined ){
       console.log('store: ', i, '| value: ', count)


      this.body = {result : {
        data : {
          user_id    : this.user.getUserId(),
          nom_id     : this.currentItem.id_nom, 
          sklad_id   : i,
          code       : Re.getCodeFromCicle(i), 
          count      : count, 
          price_type : 1, 
          currency   : this.currentItem.currency
      },action : 'addToCart'}};

      this.http
        .post("http://"+ this.server+"/addToCart",this.body)
        .toPromise()
        .then(res => this.httpSuccessAddToCart(res))
        .catch(res => this.httpError(res)) 
     }
   }






   console.log('cur item: ', this.currentItem)
    console.log('model: ',this.model)



  }


	toggleLiveSearch(){
		if(this.liveSearch == false){
			this.liveSearch = true;
		}else{
			this.liveSearch = false;
		}
	}



  minusOne(i:number, ost:number){
    //console.log('ost m: ', ost)
    if(this.vremArray[i] > 1){
      this.vremArray[i] = this.vremArray[i] - 1;
    }
  }

  plusOne(i:number, ost:number){
    //console.log('ost p: ', ost)
    if(this.vremArray[i] < ost){
      this.vremArray[i] = this.vremArray[i] + 1;
    }
  }

  postPage(i:number){
    //console.log('searchS ' ,this.searchS)
      this.http
        .get("http://"+ this.server+"/getTestAngular?Param="+this.searchString+"&NumOfPage="+i)
        .toPromise()
        .then(res => this.httpSuccess(res))
        .catch(res => this.httpError(res))  
  }

  toggle_table_view(){

   if (!this.table_view){
      this.table_view = true
      if (this.searchString){
        this._router.navigate(['products/page/'+this.curPage + '/'+this.searchString + '/1'])
      }else{
        this._router.navigate(['products/page/1/ /1'])
      }
    }else{
      this.table_view = false
      if (this.searchString){
        this._router.navigate(['products/page/'+ this.curPage + '/'+this.searchString + '/0'])
      }
    }
  }
  
  //
  searchTypeSelect(){
    if(!this.searchType){
      this.searchType = true
    }else{
      this.searchType = false
    }
  }

  popupImage(url:string){
          $('.overlay').css({'opacity': 1, 'visibility': 'visible'}); 
          $('.popup').css({'opacity': 1, 'visibility': 'visible', 'background': '#dddddd url("/assets/ImgToExchange/'+url+'") no-repeat', 'background-size': 'contain', 'background-position': 'center center', 'background-color': '#1E1E1E' }); 
  }





  getModal(loopItem:any){
    this.currentItem = loopItem
    // for(var i=1; i<17;i++ ){
    //   this.model[i.toString()] = 0;
    // }


    //Query get stores witch have this item
      this.http
        .get("http://"+ this.server+"/storeInfoByNomenclature?nom="+loopItem.id_nom + '&user='+this.user.getUserId())
        .toPromise()
        .then(res => this.nomExist(res))
        .catch(res => this.httpError(res))  

    // Opening modal
    $('.myBtn').click(function(){
      $('#myModal').css({'display': 'block'})
    })
  }

  nomExist(res){
    var a = res.json();
    this.array_nom_store = a;
    var response = a.length;
    console.log('nomExist: ', response)
    for(var i = 0; i<a.length; i++){
      console.log(a[i].name, ' ', a[i].number)
    }
  }


  //Display model for debug
  get modelTest(){
    return JSON.stringify(this.model);
  }



  resetNgValues(){
    this.model = new toCart();
    this.toCartButton = false;
    this.obj = {}
    $('#myModal').css({'display': 'none'})
  }

  //Input number validation
  onInputChange(number:number, id_sklad:number, value:number){
    // console.log('obj: ',this.obj)
    // console.log('number: ', number)
    // console.log('value: ', value)

    //Validate system
    this.toCartButton = false
    if(Number(value) > Number(number)){
      this.setPosition(id_sklad)
      // console.log('set error value ',value,'>number ', number)
      $('#error'+id_sklad).css({'visibility': 'visible'})
    }else if(Number(value) <= Number(number)){
      this.unsetPosition(id_sklad)
      // console.log('unset error value ',value,'<=number ', number)
      $('#error'+id_sklad).css({'visibility': 'hidden'})
    }

    // Flag of setting value > number of items on store
    this.validation = true
    // If exist at least one wrong position -> validation = false
    for(var i=1; i<17; i++){
      if(this.verifyPosition(i)){
        this.validation = false;//?
      }
    }

    for(var i=1; i<17; i++){
      //value for iterate stores
      var count = this.model[i];
      // If input exist an dno zero
      if(count !== 0 && count !== undefined){
        if(this.validation !== false){
          //there is to Cart Button = Active
          this.toCartButton = true
        }
      }
    }
  }
  verifyPosition(elem){
    if (this.obj[elem]){
      return this.obj[elem]
    }else{
      return false
    }
  }
  setPosition(elem){
    this.obj[elem] = true
  }
  unsetPosition(elem){
    this.obj[elem] = false
  }

}
 