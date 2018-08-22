import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable()
export class DataService {

  private toolSource = new BehaviorSubject<string>("menu");
  currentTool = this.toolSource.asObservable();
  api_url = environment.api_url;
  api_url_path = environment.api_url_path;
  projectName = environment.project_name;

  constructor(private http: HttpClient) { }

  changeTool(tool: string) {
    this.toolSource.next(tool);
  }

  getDocumentTree(path: string) : Observable<any>  {
    // Add slashes to start and end of path string if necessary
    path = this.addSlashesToPath(path);
    // Send the request to the server
    return this.http.post<any>(environment.api_url + "/" + this.api_url_path + "/" + this.projectName + path + "get_tree", null);
  }

  getDocument(path: string, name: string) : Observable<any> {
    // Add slashes to start and end of path string if necessary
    path = this.addSlashesToPath(path);
    // Send the request to the server
    return this.http.post<any>(environment.api_url + "/" + this.api_url_path + "/" + this.projectName + "/get_latest_file/by_path" + path + name, null);
  }

  //putDocument(path: string, name: string, document: string, message?: string, force?: boolean) : Observable<any> {
  putDocument(path: string, name: string, document: string) : Observable<any> {
    // Add slashes to start and end of path string if necessary
    path = this.addSlashesToPath(path);
    // Encode the document as base64
    let documentBase64 = btoa(document);
    // Send the request to the server
    return this.http.put<any>(environment.api_url + "/" + this.api_url_path + "/" + this.projectName + "/update_file/by_path" + path + name, { "file" : documentBase64 });
  }

  addSlashesToPath (path: string) : string {
    if(path.length > 0 && !path.startsWith("/"))
      path = "/"+path;
    if(!path.endsWith("/"))
      path += "/";
    return path;
  }

}
