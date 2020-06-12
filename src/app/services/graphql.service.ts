import { Injectable } from '@angular/core';
import { map, first } from 'rxjs/operators';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { onError } from 'apollo-link-error';

export interface Log {
  from: string;
  time: number;
  desc: string;
}

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {

  link = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        ),
      );
    }
    if (networkError) { console.log(`[Network error]: ${networkError}`); }
  });

  startBotMutation = gql`
    mutation startBot(
      $name: String!,
      $restart: Boolean
    ) {
      startBot(
        name: $name,
        restart: $restart,
      )
    }
  `;

  constructor(
    private apollo: Apollo,
  ) {}

  syncQR() {
    return this.apollo.subscribe({
      query: gql`
        subscription { qr }
      `,
      fetchPolicy: 'no-cache'
    }).pipe(
      map(a => {
        return (a as any).data.qr as string;
      })
    );
  }
  syncLogs() {
    return this.apollo.subscribe({
      query: gql`subscription {
        logs { from, time, desc }
      }`,
      fetchPolicy: 'no-cache'
    }).pipe( map(a => (a as any).data.logs as Log[]) );
  }
  syncState() {
    return this.apollo.subscribe({
      query: gql`subscription { state }`,
      fetchPolicy: 'no-cache'
    }).pipe( map(a => (a as any).data.state as string) );
  }

  getState() {
    return this.apollo.subscribe({
      query: gql`query { getState }`,
      fetchPolicy: 'no-cache'
    }).pipe(
      map(a => (a as any).data.getState as string)
    ).toPromise();
  }
  getLogs() {
    return this.apollo.subscribe({
      query: gql`query { getLogs }`,
      fetchPolicy: 'no-cache'
    }).pipe(
      map(a => (a as any).data.getLogs as boolean)
    ).toPromise();
  }

  stopServer() {
    return this.apollo.subscribe({
      query: gql`query { stopServer }`,
      fetchPolicy: 'no-cache'
    }).pipe(
      map(a => (a as any).data.stopServer as string)
    ).toPromise();
  }

  startBot(name: string, restart?: boolean) {
    return this.apollo.mutate({
      mutation: this.startBotMutation,
      variables: {
        name, restart: restart ? true : false
      }
    }).pipe(
      map(a => {
        return (a as any).data.startBot as string;
      })
    ).toPromise();
  }
  sendText(to: string, text: string) {
    return this.apollo.mutate({
      mutation: gql`mutation sendText(
        $to: String!,
        $text: String!
      ) {
        sendText(
          to: $to,
          text: $text,
        )
      }`,
      variables: {
        to, text
      }
    }).pipe(
      map(a => {
        return (a as any).data.sendText as string;
      })
    ).toPromise();
  }
  // addAdmin(hp: number) {
  //   return this.apollo.mutate({
  //     mutation: gql`mutation addAdmin(
  //       $hp: String!
  //     ) { addAdmin(hp: $hp) }`,
  //     variables: {
  //       hp: '' + hp
  //     }
  //   }).pipe(
  //     map(a => {
  //       return (a as any).data.addAdmin as string;
  //     })
  //   ).toPromise();
  // }

}
