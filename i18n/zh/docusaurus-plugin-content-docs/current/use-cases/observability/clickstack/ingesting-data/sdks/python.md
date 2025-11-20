---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: '适用于 ClickStack 的 Python —— ClickHouse 可观测性技术栈'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', 'logging', 'integration', 'application monitoring']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准来收集遥测数据（日志和链路追踪）。链路追踪通过自动埋点自动生成，因此无需手动埋点就可以从链路追踪中获益。

本指南集成了：

* **Logs**
* **Metrics**
* **Traces**


## 入门指南 {#getting-started}

### 安装 ClickStack OpenTelemetry 插桩包 {#install-clickstack-otel-instrumentation-package}

使用以下命令安装 [ClickStack OpenTelemetry 包](https://pypi.org/project/hyperdx-opentelemetry/)。

```shell
pip install hyperdx-opentelemetry
```

为您的 Python 应用程序所使用的包安装 OpenTelemetry 自动插桩库。我们建议使用 OpenTelemetry Python SDK 附带的 `opentelemetry-bootstrap` 工具来扫描应用程序包并生成可用库列表。

```shell
opentelemetry-bootstrap -a install
```

### 配置环境变量 {#configure-environment-variables}

之后,您需要在 shell 中配置以下环境变量,以便将遥测数据发送到 ClickStack:

```shell
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识您的服务,可以是任意名称。_

### 使用 OpenTelemetry Python 代理运行应用程序 {#run-the-application-with-otel-python-agent}

现在您可以使用 OpenTelemetry Python 代理 (`opentelemetry-instrument`) 运行应用程序。

```shell
opentelemetry-instrument python app.py
```

#### 如果您使用 `Gunicorn`、`uWSGI` 或 `uvicorn` {#using-uvicorn-gunicorn-uwsgi}

在这种情况下,OpenTelemetry Python 代理需要进行额外配置才能正常工作。

要为使用预分叉 Web 服务器模式的应用程序服务器配置 OpenTelemetry,请确保在 post-fork 钩子中调用 `configure_opentelemetry` 方法。

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

OpenTelemetry [目前无法](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)与使用 `--reload` 标志或多工作进程 (`--workers`) 运行的 `uvicorn` 配合使用。我们建议在测试时禁用这些标志,或改用 Gunicorn。

</TabItem>

</Tabs>


## 高级配置 {#advanced-configuration}

#### 网络捕获 {#network-capture}

通过启用网络捕获功能,开发人员能够有效调试 HTTP 请求头和请求体负载。只需将 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 标志设置为 1 即可实现。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## 故障排查 {#troubleshooting}

### 由于日志级别导致日志未显示 {#logs-not-appearing-due-to-log-level}

默认情况下,OpenTelemetry 日志处理器使用 `logging.NOTSET` 级别,该级别默认为 WARNING 级别。您可以在创建日志记录器时指定日志级别:

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### 导出到控制台 {#exporting-to-the-console}

OpenTelemetry Python SDK 通常会在错误发生时在控制台中显示错误信息。但是,如果您没有遇到任何错误,却发现数据未按预期显示在 HyperDX 中,您可以选择启用调试模式。启用调试模式后,所有遥测数据都将打印到控制台,以便您验证应用程序是否已正确地使用预期数据进行了插桩。

```shell
export DEBUG=true
```

在此处了解有关 Python OpenTelemetry 插桩的更多信息:
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
