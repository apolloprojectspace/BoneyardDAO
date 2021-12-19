/* eslint-disable global-require */
import { Component } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { Web3ContextProvider } from "./hooks/web3Context";

import App from "./App";
import store from "./store";
import { RariProvider } from "./fuse-sdk/helpers/RariContext";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default class Root extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <QueryClientProvider client={queryClient}>
        <Web3ContextProvider>
          <RariProvider>
            <Provider store={store}>
              <BrowserRouter basename={"/#"}>
                <App />
              </BrowserRouter>
            </Provider>
          </RariProvider>
        </Web3ContextProvider>
      </QueryClientProvider>
    );
  }
}
