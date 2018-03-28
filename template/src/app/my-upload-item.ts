import { UploadItem }    from 'angular2-http-file-upload';
 
export class MyUploadItem extends UploadItem {
    constructor(file: any) {
        super();
        this.url = 'http://188.237.141.56:2020/sendFile';
        //this.headers = { 'Content-Type': 'multipart/form-data', 'Accept': 'application/json' };
        this.file = file;
    }
}
  //         headers.append('Content-Type', 'multipart/form-data');
  //         headers.append('Accept', 'application/json');
