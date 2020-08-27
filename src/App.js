import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import Cookies from 'js-cookie';

import LoginPanel from './LoginPanel';
import PokemonBrowser from './PokemonBrowser';
import { PrivateRoute } from './routesUtil';

class App extends React.Component {
  constructor(props) {
    super(props);
    const authToken = Cookies.get("token");
    let currentUserId;
    if (authToken) {
      try {
        const payload = authToken.split(".")[1];
        const decodedPayload = atob(payload);
        const payloadObj = JSON.parse(decodedPayload);
        const { data } = payloadObj;
        currentUserId = data.id;
      } catch (e) {
        Cookies.remove("token");
      }
    }
    this.state = {
      loaded: false,
      currentUserId,
      needLogin: !currentUserId,
    };
  }

  componentDidMount() {
    this.loadPokemon();
  }

  handleCreated = (pokemon) => {
    this.setState({
      pokemon: [...this.state.pokemon, pokemon]
    });
  }

  async loadPokemon() {
    const response = await fetch(`/api/pokemon`);
    if (response.ok) {
      const pokemon = await response.json();
      this.setState({
        pokemon,
        needLogin: false,
        loaded: true
      });
    } else {
      this.setState({
        needLogin: true,
        loaded: true,
      });
    }
  }

  updateUser = currentUserId => {
    this.setState({
      needLogin: false,
      currentUserId
    });
    this.loadPokemon();
  }

  render() {
    const { loaded, currentUserId, needLogin, pokemon } = this.state;
    if (!loaded) {
      return null;
    }
    const cProps = {
      pokemon: pokemon,
      handleCreated: this.handleCreated,
      currentUserId: currentUserId
    };
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/login"
            render={props => <LoginPanel {...props} updateUser={this.updateUser} />} />
          <PrivateRoute path="/"
                        exact={true}
                        needLogin={needLogin}
                        component={PokemonBrowser}
                        cProps={cProps} />
          <PrivateRoute path="/pokemon/:pokemonId"
                        exact={true}
                        needLogin={needLogin}
                        component={PokemonBrowser}
                        cProps={cProps} />
        </Switch>
      </BrowserRouter>
    )
  }
}

export default App;
