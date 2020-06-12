import {Injectable} from '@angular/core';
import {Subscription} from 'apollo-angular';
import gql from 'graphql-tag';
import { Log } from './graphql.service';

interface Result {
    logs: Log[];
}

@Injectable({
  providedIn: 'root',
})
export class LogsService extends Subscription<Result> {
  document = gql`
    subscription {
      logs {
        type, time, desc
      }
    }
  `;
}
