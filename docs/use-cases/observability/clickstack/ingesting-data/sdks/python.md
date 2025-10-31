---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'Python for ClickStack - The ClickHouse Observability Stack'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack uses the OpenTelemetry standard for collecting telemetry data (logs and
traces). Traces are auto-generated with automatic instrumentation, so manual
instrumentation isn't required to get value out of tracing.

This guide integrates:

- **Logs**
- **Metrics**
- **Traces**

## Getting started {#getting-started}

### Install ClickStack OpenTelemetry instrumentation package {#install-clickstack-otel-instrumentation-package}

Use the following command to install the [ClickStack OpenTelemetry package](https://pypi.org/project/hyperdx-opentelemetry/).

```shell
pip install hyperdx-opentelemetry
```

Install the OpenTelemetry automatic instrumentation libraries for the packages used by your Python application. We recommend that you use the
`opentelemetry-bootstrap` tool that comes with the OpenTelemetry Python SDK to scan your application packages and generate the list of available libraries.

```shell
opentelemetry-bootstrap -a install
```

### Configure environment variables {#configure-environment-variables}

Afterwards you'll need to configure the following environment variables in your shell to ship telemetry to ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

_The `OTEL_SERVICE_NAME` environment variable is used to identify your service in the HyperDX app, it can be any name you want._

### Run the application with OpenTelemetry Python agent {#run-the-application-with-otel-python-agent}

Now you can run the application with the OpenTelemetry Python agent (`opentelemetry-instrument`).

```shell
opentelemetry-instrument python app.py
```

#### If you are using `Gunicorn`, `uWSGI` or `uvicorn` {#using-uvicorn-gunicorn-uwsgi}

In this case, the OpenTelemetry Python agent will require additional changes to work. 

To configure OpenTelemetry for application servers using the pre-fork web server mode, make sure to call the `configure_opentelemetry` method within the post-fork hook.

<Tabs groupId="python-alternative">
<TabItem value="gunicorn" label="Gunicorn" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry

def post_fork(server, worker):
    configure_opentelemetry()
```
</TabItem>
<TabItem value="uwsgi" label="uWSGI" default>

```python
from hyperdx.opentelemetry import configure_opentelemetry
from uwsgidecorators import postfork

@postfork
def init_tracing():
    configure_opentelemetry()
```

</TabItem>

<TabItem value="uvicorn" label="uvicorn" default>

OpenTelemetry [currently does not work](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385) with `uvicorn` run using the `--reload` 
flag or with multi-workers (`--workers`). We recommend disabling those flags while testing, or using Gunicorn.

</TabItem>

</Tabs>

## Advanced configuration {#advanced-configuration}

#### Network capture {#network-capture}

By enabling network capture features, developers gain the capability to debug
HTTP request headers and body payloads effectively. This can be accomplished
simply by setting `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` flag to 1.

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## Troubleshooting {#troubleshooting}

### Logs not appearing due to log level {#logs-not-appearing-due-to-log-level}

By default, OpenTelemetry logging handler uses `logging.NOTSET` level which
defaults to WARNING level. You can specify the logging level when you create a
logger:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### Exporting to the console {#exporting-to-the-console}

The OpenTelemetry Python SDK usually displays errors in the console when they
occur. However, if you don't encounter any errors but notice that your data is
not appearing in HyperDX as expected, you have the option to enable debug mode.
When debug mode is activated, all telemetries will be printed to the console,
allowing you to verify if your application is properly instrumented with the
expected data.

```shell
export DEBUG=true
```

Read more about Python OpenTelemetry instrumentation here:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
