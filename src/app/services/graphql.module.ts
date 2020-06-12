import { NgModule } from '@angular/core';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { split } from 'apollo-link';

const uri = '156.67.221.231:3004'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink) {
    const ws = new WebSocketLink({
      uri: `ws://${uri}`,
      options: {
        reconnect: true
      }
    });
    const http = httpLink.create({
      uri: `http://${uri}`
    });
    const link = split(({ query }) => {
      const { kind, operation }: any = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    }, ws, http);
    return {
        link,
        cache: new InMemoryCache(),
        defaultOptions: {
          query: {
            fetchPolicy: 'network-only'
          }
        }
    };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
