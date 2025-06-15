---
slug: /use-cases/observability/clickstack/sdks/elixir
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: 'Elixir SDK for ClickStack - The ClickHouse Observability Stack'
title: 'Elixir'
---

<table>
  <tbody>
    <tr>
      <td className="pe-2">✅ Logs</td>
      <td className="pe-2">✖️ Metrics</td>
      <td className="pe-2">✖️ Traces</td>
    </tr>
  </tbody>
</table>
_🚧 OpenTelemetry metrics & tracing instrumentation coming soon!_

## Getting started {#getting-started}

### Install ClickStack logger backend package {#install-hyperdx-logger-backend-package}

The package can be installed by adding `hyperdx` to your list of dependencies in
`mix.exs`:

```elixir
def deps do
  [
    {:hyperdx, "~> 0.1.6"}
  ]
end
```

### Configure logger {#configure-logger}

Add the following to your `config.exs` file:

```elixir
# config/releases.exs

config :logger,
  level: :info,
  backends: [:console, {Hyperdx.Backend, :hyperdx}]
```

### Configure environment variables {#configure-environment-variables}

Afterwards you'll need to configure the following environment variables in your
shell to ship telemetry to ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>'
```

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service
in the HyperDX app, it can be any name you want._
