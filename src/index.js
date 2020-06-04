import React from "react";
import { render } from "react-dom";
import { renderToString } from "react-dom/server";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "@apollo/react-common";
import { getDataFromTree } from "@apollo/react-ssr";

import { link } from "./graphql/link";
import App from "./App";

import "./index.css";

async function fakeSSR(rootEl) {
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link,
    ssrMode: true,
  });

  const componentTree = (
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
  await getDataFromTree(componentTree);

  // Fake the SSR
  rootEl.innerHTML = renderToString(componentTree);

  return {
    ssrData: client.extract(),
  };
}

async function main() {
  const rootEl = document.getElementById("root");

  const { ssrData } = await fakeSSR(rootEl);
  console.log("SSR data:");
  console.dir(ssrData);

  const client = new ApolloClient({
    cache: new InMemoryCache().restore(ssrData),
    link,
    ssrForceFetchDelay: 100,
  });

  render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
    rootEl
  );
}

main().catch((e) => console.error(e));
