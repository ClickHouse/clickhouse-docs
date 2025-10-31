---
slug: /use-cases/observability/clickstack/sdks/react-native
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'React Native SDK for ClickStack - The ClickHouse Observability Stack'
title: 'React Native'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

The ClickStack React Native SDK allows you to instrument your React Native
application to send events to ClickStack. This allows you to see mobile network
requests and exceptions alongside backend events in a single timeline.

This Guide Integrates:

- **XHR/Fetch Requests**

## Getting started {#getting-started}

### Install via NPM {#install-via-npm}

Use the following command to install the [ClickStack React Native package](https://www.npmjs.com/package/@hyperdx/otel-react-native).

```shell
npm install @hyperdx/otel-react-native
```

### Initialize ClickStack {#initialize-clickstack}

Initialize the library as early in your app lifecycle as possible:

```javascript
import { HyperDXRum } from '@hyperdx/otel-react-native';

HyperDXRum.init({
  service: 'my-rn-app',
  apiKey: '<YOUR_INGESTION_API_KEY>',
  tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
});
```

### Attach user information or metadata (Optional) {#attach-user-information-metadata}

Attaching user information will allow you to search/filter sessions and events
in HyperDX. This can be called at any point during the client session. The
current client session and all events sent after the call will be associated
with the user information.

`userEmail`, `userName`, and `teamName` will populate the sessions UI with the
corresponding values, but can be omitted. Any other additional values can be
specified and used to search for events.

```javascript
HyperDXRum.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### Instrument lower versions {#instrument-lower-versions}

To instrument applications running on React Native versions lower than 0.68,
edit your `metro.config.js` file to force metro to use browser specific
packages. For example:

```javascript
const defaultResolver = require('metro-resolver');

module.exports = {
  resolver: {
    resolveRequest: (context, realModuleName, platform, moduleName) => {
      const resolved = defaultResolver.resolve(
        {
          ...context,
          resolveRequest: null,
        },
        moduleName,
        platform,
      );

      if (
        resolved.type === 'sourceFile' &&
        resolved.filePath.includes('@opentelemetry')
      ) {
        resolved.filePath = resolved.filePath.replace(
          'platform\\node',
          'platform\\browser',
        );
        return resolved;
      }

      return resolved;
    },
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
```

## View navigation {#view-navigation}

[react-navigation](https://github.com/react-navigation/react-navigation) version 5 and 6 are supported.

The following example shows how to instrument navigation:

```javascript
import { startNavigationTracking } from '@hyperdx/otel-react-native';

export default function App() {
  const navigationRef = useNavigationContainerRef();
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        startNavigationTracking(navigationRef);
      }}
    >
      <Stack.Navigator>...</Stack.Navigator>
    </NavigationContainer>
  );
}
```
