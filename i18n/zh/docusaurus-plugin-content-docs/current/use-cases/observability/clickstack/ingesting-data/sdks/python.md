---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: '适用于 ClickStack 的 Python - ClickHouse 可观测性栈'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志', '集成', '应用程序监控']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和链路追踪）。链路追踪通过自动插桩自动生成，因此无需手动插桩就可以从追踪中获得价值。

本指南集成了：

* **日志**
* **指标**
* **链路追踪**

## 入门 \\{#getting-started\\}

### 安装 ClickStack OpenTelemetry 插桩包 \\{#install-clickstack-otel-instrumentation-package\\}

使用以下命令来安装 [ClickStack OpenTelemetry 包](https://pypi.org/project/hyperdx-opentelemetry/)。

```shell
pip install hyperdx-opentelemetry
```

为 Python 应用程序所使用的各个包安装 OpenTelemetry 自动埋点库。建议使用 OpenTelemetry Python SDK 提供的 `opentelemetry-bootstrap` 工具扫描应用程序的包，并生成可用库列表。

```shell
opentelemetry-bootstrap -a install
```

### 配置环境变量 \\{#configure-environment-variables\\}

接下来，需要在 shell 中配置以下环境变量，用于将遥测数据上报到 ClickStack：

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，它可以是任意你希望的名称。*

### 使用 OpenTelemetry Python 代理运行应用程序 \\{#run-the-application-with-otel-python-agent\\}

现在可以使用 OpenTelemetry Python 代理（`opentelemetry-instrument`）来运行该应用程序。

```shell
opentelemetry-instrument python app.py
```

#### 如果使用 `Gunicorn`、`uWSGI` 或 `uvicorn` \\{#using-uvicorn-gunicorn-uwsgi\\}

在这种情况下，OpenTelemetry Python 代理需要进行额外配置才能正常工作。

要为使用预派生（pre-fork）模式的应用服务器配置 OpenTelemetry，请确保在 fork 之后的钩子（post-fork hook）中调用 `configure_opentelemetry` 方法。

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

当使用 `--reload` 标志或多 worker（`--workers`）运行 `uvicorn` 时，OpenTelemetry [目前无法正常工作](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)。我们建议在测试时禁用这些标志，或改用 Gunicorn。

</TabItem>

</Tabs>

## 高级配置 \\{#advanced-configuration\\}

#### 网络捕获 \\{#network-capture\\}

通过启用网络捕获功能，开发者可以高效调试 HTTP 请求头和请求体内容。只需将 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 标志设置为 1 即可。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## 故障排查 \\{#troubleshooting\\}

### 由于日志级别设置导致日志未显示 \\{#logs-not-appearing-due-to-log-level\\}

默认情况下，OpenTelemetry 日志处理程序使用 `logging.NOTSET` 级别，
其实际默认等同于 WARNING 级别。您可以在创建 logger 时显式指定日志级别：

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### 导出到控制台 \\{#exporting-to-the-console\\}

OpenTelemetry Python SDK 通常会在错误发生时在控制台中显示错误信息。不过，如果你没有遇到任何错误，但发现数据并未如预期出现在 HyperDX 中，可以选择启用调试模式。启用调试模式后，所有遥测数据都会打印到控制台，便于你验证应用程序是否已按预期正确完成埋点和接入。

```shell
export DEBUG=true
```

在此了解有关 Python OpenTelemetry 仪表化的更多信息：
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
