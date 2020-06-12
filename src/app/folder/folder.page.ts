import { PopupService } from './../services/popup.service';
import { GraphqlService, Log } from './../services/graphql.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
// tslint:disable-next-line: component-class-suffix
export class FolderPage implements OnInit {

  public appName = 'client-4';

  onload = true;

  sendMode = false;
  to: number;
  text: string;

  qr: string;
  logs: Log[];

  state: BehaviorSubject<string> = new BehaviorSubject('inactive');
  error: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    public gql: GraphqlService,
    private popup: PopupService,
    ) { }

  ngOnInit() {
    this.gql.syncQR().subscribe(qr => {
      this.qr = qr;
    });
    this.gql.syncLogs().subscribe(logs => {
      this.logs = logs;
      this.onload = false;
    });
    this.gql.getState().then(
    (started) => {
      this.state.next(started);
      this.gql.getLogs();
      this.gql.syncState().subscribe(
        (state) => {
          this.state.next(state);
          console.log('state:', this.state.value);
          if (state !== 'auth') {
            this.qr = null;
          }
        }
      );
    },
    (err) => {
      console.log(err);
      this.popup.showAlert('SERVER ERROR', err.message);
    });
  }

  startServer() {
    this.gql.startBot(this.appName).then((res) => {
      if (res !== 'ok') {
        this.error = res;
        this.qr = null;
        this.state.next('inactive');
        this.popup.showToast(res, 3000);
      } else {
        this.qr = null;
        this.state.next('active');
        this.popup.showToast(`${this.appName} Has Been Activated!`, 1000);
      }
    },
    (err) => {
      console.log(err);
      this.popup.showAlert(`${this.appName} error`, err.message);
    });
  }
  async stopServer() {
    const stop = await this.popup.showAlertConfirm(`Stop Bot ${this.appName}`, `Yakin mau matikan bot ${this.appName}?`);
    if (stop) {
      const result = await this.gql.stopServer();
      this.popup.showToast(result, 1000);
    }
  }
  async redeployServer() {
    const redeploy = await this.popup.showAlertConfirm(`Redeploy Bot ${this.appName}`, `Yakin mau deploy ulang bot ${this.appName}?`);
    if (redeploy) {
      const result = await this.gql.startBot(this.appName, true);
      this.popup.showToast(result, 1000);
    }
  }

  sendText() {
    const too = this.to + '@c.us';
    this.gql.sendText(too, this.text);
  }
  // startBot() {
  //   this.gql.startBot('server').subscribe(res => {
  //     console.log('server started?', res);
  //     if (res !== 'ok') {
  //       this.error = res;
  //       this.qr = null;
  //       this.state.next('inactive');
  //       this.popup.showToast(res, 3000);
  //     } else {
  //       this.qr = null;
  //       this.state.next('active');
  //       this.popup.showToast('Bot Has Been Activated!', 1000);
  //     }
  //   });
  // }

}
