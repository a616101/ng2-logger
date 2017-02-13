import {Injectable, Optional} from '@angular/core';
import * as moment from 'moment'
import {Http, Headers, RequestOptions} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';


export class LoggerConfig {
  level: string;
  serverLoggingUrl: string;
  serverLogLevel: string;
}

enum Levels {
  'TRACE',
  'DEBUG',
  'INFO',
  'LOG',
  'WARN',
  'ERROR'
}

@Injectable()
export class NG2Logger{

  constructor(private http: Http, @Optional() private options: LoggerConfig) {
  }

  private _logOnServer(level: string, message: string) {
    if(!this.options.serverLoggingUrl) return;

    //if the user provides a serverLogLevel and the current level is than that do not log
    if (this.options.serverLogLevel && Levels[level] < Levels[this.options.serverLogLevel]) return;

    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    this.http.post(this.options.serverLoggingUrl, {level: level, message: message}, options)
      .map(res => res.json())
      .catch(error => error)
      .subscribe(
        res => null,
        error => this._log('ERROR', 'FAILED TO LOG ON SERVER', false)
      );

  }

  private _log(level: string, message: string, logOnServer: boolean) {
    if (!message) return;

    let color1;


    switch (level) {
      case 'TRACE':
        color1 = 'blue';
        break;
      case 'DEBUG':
        color1 = 'teal';
        break;
      case 'INFO':
      case 'LOG':
        color1 = 'gray';
        break;
      case 'WARN':
      case 'ERROR':
        color1 = 'red';
        break;
    }

    //if the log level is greater than the environ
    if (Levels[level] >= Levels[this.options.level]){
      console.log(`%c${moment.utc().format()} [${level}] %c${message}`, `color:${color1}`, 'color:black');


      if(logOnServer){
        this._logOnServer(level, message);
      }
    }


  }

  trace(message: string) {
    this._log('TRACE', message, true);
  }

  debug(message: string) {
    this._log('DEBUG', message, true);
  }

  info(message: string) {
    this._log('INFO', message, true);
  }

  log(message: string) {
    this._log('LOG', message, true);
  }

  warn(message: string) {
    this._log('WARN', message, true);
  }

  error(message: string) {
    this._log('ERROR', message, true);
  }
}
