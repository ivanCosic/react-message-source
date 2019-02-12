import React from 'react';
import PropTypes from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { getMessageWithNamedParams, getMessageWithParams } from './messages';
import { normalizeKeyPrefix } from './utils';

/**
 * A React Context which holds the translations map.
 */
const MessageSourceContext = React.createContext(null);

/**
 * Creates a HOC which passes the MessageSourceApi to the given Component.
 */
function enhanceWithMessages(keyPrefix, WrappedComponent) {
  const normalizedKeyPrefix = normalizeKeyPrefix(keyPrefix || '');
  const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  /**
   * The enhancer HOC.
   */
  class Enhancer extends React.Component {
    /**
     * Retrieves a text message.
     *
     * Example usage:
     * let name, lastName;
     * ...
     * const message = getMessage('message.key', name, lastName);
     *
     * @param key the key of the message.
     * @param params an optional parameters (param0, param1 ...).
     */
    getMessage = (key, ...params) => getMessageWithParams(this.context, normalizedKeyPrefix + key, ...params);

    /**
     * Retrieves a text message with named parameters.
     *
     * Example usage:
     * const parameters = {
     *   name: 'John Doe',
     * }
     *
     * const message = getMessageWithNamedParams('message.key', parameters)
     *
     * @param key the key of the message.
     * @param namedParams a map of named parameters.
     */
    getMessageWithNamedParams = (key, namedParams) =>
      getMessageWithNamedParams(this.context, normalizedKeyPrefix + key, namedParams);

    render() {
      return (
        <WrappedComponent
          {...this.props}
          getMessage={this.getMessage}
          getMessageWithNamedParams={this.getMessageWithNamedParams}
        />
      );
    }
  }

  Enhancer.contextType = MessageSourceContext;
  Enhancer.displayName = `WithMessages(${wrappedComponentName})`;

  return hoistNonReactStatics(Enhancer, WrappedComponent);
}

/**
 * An internal implementation of the argument resolution logic.
 *
 * @param args the passed arguments ([Component] | [[keyPrefix], [Component]])
 */
function internalWithMessages(...args) {
  const [keyPrefixOrComponent] = args;

  if (keyPrefixOrComponent == null || typeof keyPrefixOrComponent === 'string') {
    // consumer used the curried API
    return enhanceWithMessages.bind(undefined, keyPrefixOrComponent);
  }

  return enhanceWithMessages(null, keyPrefixOrComponent);
}

/**
 * Example usage:
 *
 * const translations = await fetch('/api/rest/texts?lang=en');
 * <MessageSource.Provider value={translations}>
 *   <SomeOtherComponent />
 *   ...
 * </MessageSource.Provider>
 */
export const { Provider } = MessageSourceContext;

/**
 * Example usages:
 *
 * 1. MessageSource.withMessages('keyPrefix')(Component)
 * 2. MessageSource.withMessages(Component)
 * 3. compose(MessageSource.withMessages('keyPrefix'))(Component)
 * 4. compose(MessageSource.withMessages)(Component)
 */
export const withMessages = internalWithMessages;

/**
 * Example usage:
 *
 * Exported just for convenience, in case you want to run propType checks on your component.
 * Note: some bundlers might remove these definitions during build time.
 */
export const propTypes = {
  getMessage: PropTypes.func,
  getMessageWithNamedParams: PropTypes.func,
};
