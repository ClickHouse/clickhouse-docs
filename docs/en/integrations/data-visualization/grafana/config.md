---
sidebar_label: Plugin Configuration
sidebar_position: 3
slug: /en/integrations/grafana/config
description: Configuration options for the ClickHouse data source plugin in Grafana
---
import ConnectionDetails from '@site/docs/en/_snippets/_gather_your_details_native.md';

# Configuring ClickHouse data source in Grafana

The easiest way to modify a configuration is in the Grafana UI on the plugin configuration page, but data sources can also be [provisioned with a YAML file](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources).

This page shows a list of options available for configuration in the ClickHouse plugin, as well as config snippets for those provisioning a data source with YAML.

For a quick overview of all the options, a full example config can be found [here](#full-example-config).

## Common Settings

Example configuration screen:
<img src={require('./images/config_common.png').default} class="image" alt="Example secure native config" />

Example configuration YAML for common settings:
```yaml
jsonData:
  host: 127.0.0.1 # (required) server address.
  port: 9000      # (required) server port. For native, defaults to 9440 secure and 9000 insecure. For HTTP, defaults to 8443 secure and 8123 insecure.

  protocol: native # (required) the protocol used for the connection. Can be set to "native" or "http".
  secure: false    # set to true if the connection is secure.

  username: default # the username used for authentication.

  tlsSkipVerify:     <boolean> # skips TLS verification when set to true.
  tlsAuth:           <boolean> # set to true to enable TLS client authentication.
  tlsAuthWithCACert: <boolean> # set to true if CA certificate is provided. Required for verifying self-signed TLS certificates.

secureJsonData:
  password: secureExamplePassword # the password used for authentication.

  tlsCACert:     <string> # TLS CA certificate
  tlsClientCert: <string> # TLS client certificate
  tlsClientKey:  <string> # TLS client key
```

Note that a `version` property is added when the configuration is saved from the UI. This shows the version of the plugin that the config was saved with.

### HTTP Protocol

More settings will be displayed if you choose to connect via the HTTP protocol.

<img src={require('./images/config_http.png').default} class="image" alt="Extra HTTP config options" />

#### HTTP Path

If your HTTP server is exposed under a different URL path, you can add that here.

```yaml
jsonData:
  # excludes first slash
  path: additional/path/example
```

#### Custom HTTP Headers

You can add custom headers to the requests sent to your server.

Headers can be either plain text or secure.
All header keys are stored in plain text, while secure header values are saved in the secure config (similar to the `password` field).

:::warning Secure Values over HTTP
While secure header values are stored securely in the config, the value will still be sent over HTTP if secure connection is disabled.
:::

Example YAML for plain/secure headers:
```yaml
jsonData:
  httpHeaders:
  - name: X-Example-Plain-Header
    value: plain text value
    secure: false
  - name: X-Example-Secure-Header
    # "value" is excluded
    secure: true
secureJsonData:
  secureHttpHeaders.X-Example-Secure-Header: secure header value
```

## Additional Settings

These additional settings are optional.

<img src={require('./images/config_additional.png').default} class="image" alt="Example additional settings" />

Example YAML:
```yaml
jsonData:
  defaultDatabase: default # default database loaded by the query builder. Defaults to "default".
  defaultTable: <string>   # default table loaded by the query builder.

  dialTimeout: 10    # dial timeout when connecting to the server, in seconds. Defaults to "10".
  queryTimeout: 60   # query timeout when running a query, in seconds. Defaults to 60. This requires permissions on the user, if you get a permission error try setting it to "0" to disable it.
  validateSql: false # when set to true, will validate the SQL in the SQL editor.
```

### OpenTelemetry

OpenTelemetry (OTel) is deeply integrated within the plugin.
For the best usage, it is recommended to configure OTel for both [logs](#logs) and [traces](#traces).

It is also required to configure these defaults for enabling [data links](./query-builder.md#data-links), a feature that enables powerful observability workflows.

### Logs

To speed up [query building for logs](./query-builder.md#logs), you can set a default database/table as well as columns for the logs query. This will pre-load the query builder with a runnable logs query, which makes browsing on the explore page faster for observability.

If you are using OpenTelemetry, you should enable the "**Use OTel**" switch, and set the **default log table** to `otel_logs`.
This will automatically override the default columns to use the selected OTel schema version.

While OpenTelemetry isn't required for logs, using a single logs/trace dataset helps to enable a smoother observability workflow with [data linking](./query-builder.md#data-links).

Example logs configuration screen:
<img src={require('./images/config_logs.png').default} class="image" alt="Logs config" />

Example logs config YAML:
```yaml
jsonData:
  logs:
    defaultDatabase: default # default log database.
    defaultTable: otel_logs  # default log table. If you're using OTel, this should be set to "otel_logs".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new log query. Will be ignored if OTel is enabled.
    timeColumn:       <string> # the primary time column for the log.
    logLevelColumn:   <string> # the log level/severity of the log. Values typically look like "INFO", "error", or "Debug".
    logMessageColumn: <string> # the log's message/content.
```

### Traces

To speed up [query building for traces](./query-builder.md#traces), you can set a default database/table as well as columns for the trace query. This will pre-load the query builder with a runnable trace search query, which makes browsing on the explore page faster for observability.

If you are using OpenTelemetry, you should enable the "**Use OTel**" switch, and set the **default trace table** to `otel_traces`.
This will automatically override the default columns to use the selected OTel schema version.
While OpenTelemetry isn't required, this feature works best when using its schema for traces.

Example trace configuration screen:
<img src={require('./images/config_traces.png').default} class="image" alt="Traces config" />

Example trace config YAML:
```yaml
jsonData:
  traces:
    defaultDatabase: default  # default trace database.
    defaultTable: otel_traces # default trace table. If you're using OTel, this should be set to "otel_traces".

    otelEnabled: false  # set to true if OTel is enabled.
    otelVersion: latest # the otel collector schema version to be used. Versions are displayed in the UI, but "latest" will use latest available version in the plugin.

    # Default columns to be selected when opening a new trace query. Will be ignored if OTel is enabled.
    traceIdColumn:       <string>    # trace ID column.
    spanIdColumn:        <string>    # span ID column.
    operationNameColumn: <string>    # operation name column.
    parentSpanIdColumn:  <string>    # parent span ID column.
    serviceNameColumn:   <string>    # service name column.
    durationTimeColumn:  <string>    # duration time column.
    durationUnitColumn:  <time unit> # duration time unit. Can be set to "seconds", "milliseconds", "microseconds", or "nanoseconds". For OTel the default is "nanoseconds".
    startTimeColumn:     <string>    # start time column. This is the primary time column for the trace span.
    tagsColumn:          <string>    # tags column. This is expected to be a map type.
    serviceTagsColumn:   <string>    # service tags column. This is expected to be a map type.
```


## Full Example YAML

These are all of the YAML configuration options made available by the plugin.
Some fields have example values while others simply show the field's type.

See [Grafana's documentation](https://grafana.com/docs/grafana/latest/administration/provisioning/#data-sources) for more information on provisioning data sources with YAML.

```yaml
datasources:
  - name: Example ClickHouse
    type: grafana-clickhouse-datasource
    jsonData:
      host: 127.0.0.1
      port: 9000
      protocol: native
      secure: false
      username: default
      tlsSkipVerify: <boolean>
      tlsAuth: <boolean>
      tlsAuthWithCACert: <boolean>
      defaultDatabase: default
      defaultTable: <string>
      dialTimeout: 10
      queryTimeout: 60
      validateSql: false
      httpHeaders:
      - name: X-Example-Plain-Header
        value: plain text value
        secure: false
      - name: X-Example-Secure-Header
        secure: true
      logs:
        defaultDatabase: default
        defaultTable: otel_logs
        otelEnabled: false
        otelVersion: latest
        timeColumn: <string>
        logLevelColumn: <string>
        logMessageColumn: <string>
      traces:
        defaultDatabase: default
        defaultTable: otel_traces
        otelEnabled: false
        otelVersion: latest
        traceIdColumn: <string>
        spanIdColumn: <string>
        operationNameColumn: <string>
        parentSpanIdColumn: <string>
        serviceNameColumn: <string>  
        durationTimeColumn: <string>
        durationUnitColumn: <time unit>
        startTimeColumn: <string>
        tagsColumn: <string>
        serviceTagsColumn: <string>
    secureJsonData:
      tlsCACert:     <string>
      tlsClientCert: <string>
      tlsClientKey:  <string>
      secureHttpHeaders.X-Example-Secure-Header: secure header value
```
