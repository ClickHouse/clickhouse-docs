---
slug: /use-cases/observability/clickstack/sdks/browser
pagination_prev: null
pagination_next: null
sidebar_position: 0
description: 'Browser SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Browser JS'
doc_type: 'guide'
keywords: ['ClickStack', 'browser-sdk', 'javascript', 'session-replay', 'frontend']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The ClickStack browser SDK allows you to instrument your frontend application to
send events to ClickStack. This allows you to view network 
requests and exceptions alongside backend events in a single timeline.

Additionally, it'll automatically capture and correlate session replay data, so
you can visually step through and debug what a user was seeing while using your
application.

This guide integrates the following:

- **Console Logs**
- **Session Replays**
- **XHR/Fetch/Websocket Requests**
- **Exceptions**

## Getting started {#getting-started}

<br/>

<Tabs groupId="install">
<TabItem value="package_import" label="Package Import" default>

**Install via package import (Recommended)**

Use the following command to install the [browser package](https://www.npmjs.com/package/@hyperdx/browser).

```shell
npm install @hyperdx/browser
```

**Initialize ClickStack**

```javascript
import HyperDX from '@hyperdx/browser';

HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
    consoleCapture: true, // Capture console logs (default false)
    advancedNetworkCapture: true, // Capture full HTTP request/response headers and bodies (default false)
});
```

</TabItem>
<TabItem value="script_tag" label="Script Tag">

**Install via Script Tag (Alternative)**

You can also include and install the script via a script tag as opposed to
installing via NPM. This will expose the `HyperDX` global variable and can be
used in the same way as the NPM package.

This is recommended if your site is not currently built using a bundler.

```html
<script src="//www.unpkg.com/@hyperdx/browser@0.21.0/build/index.js"></script>
<script>
  window.HyperDX.init({
    url: 'http://localhost:4318',
    apiKey: 'YOUR_INGESTION_API_KEY',
    service: 'my-frontend-app',
    tracePropagationTargets: [/api.myapp.domain/i], // Set to link traces from frontend to backend requests
  });
</script>
```

</TabItem>
</Tabs>

### Options {#options}

- `apiKey` - Your ClickStack Ingestion API Key.
- `service` - The service name events will show up as in HyperDX UI.
- `tracePropagationTargets` - A list of regex patterns to match against HTTP
  requests to link frontend and backend traces, it will add an additional
  `traceparent` header to all requests matching any of the patterns. This should
  be set to your backend API domain (ex. `api.yoursite.com`).
- `consoleCapture` - (Optional) Capture all console logs (default `false`).
- `advancedNetworkCapture` - (Optional) Capture full request/response headers
  and bodies (default false).
- `url` - (Optional) The OpenTelemetry collector URL, only needed for
  self-hosted instances.
- `maskAllInputs` - (Optional) Whether to mask all input fields in session
  replay (default `false`).
- `maskAllText` - (Optional) Whether to mask all text in session replay (default
  `false`).
- `disableIntercom` - (Optional) Whether to disable Intercom integration (default `false`)
- `disableReplay` - (Optional) Whether to disable session replay (default `false`)

## Additional configuration {#additional-configuration}

### Attach user information or metadata {#attach-user-information-or-metadata}

Attaching user information will allow you to search/filter sessions and events
in the HyperDX UI. This can be called at any point during the client session. The
current client session and all events sent after the call will be associated
with the user information.

`userEmail`, `userName`, and `teamName` will populate the sessions UI with the
corresponding values, but can be omitted. Any other additional values can be
specified and used to search for events.

```javascript
HyperDX.setGlobalAttributes({
  userId: user.id,
  userEmail: user.email,
  userName: user.name,
  teamName: user.team.name,
  // Other custom properties...
});
```

### Auto capture React error boundary errors {#auto-capture-react-error-boundary-errors}

If you're using React, you can automatically capture errors that occur within
React error boundaries by passing your error boundary component 
into the `attachToReactErrorBoundary` function.

```javascript
// Import your ErrorBoundary (we're using react-error-boundary as an example)
import { ErrorBoundary } from 'react-error-boundary';

// This will hook into the ErrorBoundary component and capture any errors that occur
// within any instance of it.
HyperDX.attachToReactErrorBoundary(ErrorBoundary);
```

### Send custom actions {#send-custom-actions}

To explicitly track a specific application event (ex. sign up, submission,
etc.), you can call the `addAction` function with an event name and optional
event metadata.

Example:

```javascript
HyperDX.addAction('Form-Completed', {
  formId: 'signup-form',
  formName: 'Signup Form',
  formType: 'signup',
});
```

### Enable network capture dynamically {#enable-network-capture-dynamically}

To enable or disable network capture dynamically, simply invoke the `enableAdvancedNetworkCapture` or `disableAdvancedNetworkCapture` function as needed.

```javascript
HyperDX.enableAdvancedNetworkCapture();
```

### Enable resource timing for CORS requests {#enable-resource-timing-for-cors-requests}

If your frontend application makes API requests to a different domain, you can
optionally enable the `Timing-Allow-Origin`[header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Timing-Allow-Origin) to be sent with the request. This will allow ClickStack to capture fine-grained
resource timing information for the request such as DNS lookup, response
download, etc. via [`PerformanceResourceTiming`](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

If you're using `express` with `cors` packages, you can use the following
snippet to enable the header:

```javascript
var cors = require('cors');
var onHeaders = require('on-headers');

// ... all your stuff

app.use(function (req, res, next) {
  onHeaders(res, function () {
    var allowOrigin = res.getHeader('Access-Control-Allow-Origin');
    if (allowOrigin) {
      res.setHeader('Timing-Allow-Origin', allowOrigin);
    }
  });
  next();
});
app.use(cors());
```
