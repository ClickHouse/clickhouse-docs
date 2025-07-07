---
'slug': '/use-cases/observability/clickstack/sdks/python'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 7
'description': 'Python用于ClickStack - ClickHouse可观察性堆栈'
'title': 'Python'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准收集遥测数据（日志和跟踪）。跟踪是通过自动仪器生成的，因此不需要手动仪器就能从跟踪中获取价值。

本指南集成了：

- **日志**
- **指标**
- **跟踪**

## 入门 {#getting-started}

### 安装 ClickStack OpenTelemetry 仪器包 {#install-clickstack-otel-instrumentation-package}

使用以下命令安装 [ClickStack OpenTelemetry package](https://pypi.org/project/hyperdx-opentelemetry/)。

```bash
pip install hyperdx-opentelemetry
```

安装 Python 应用程序使用的包的 OpenTelemetry 自动仪器库。我们建议您使用与 OpenTelemetry Python SDK 一起提供的 `opentelemetry-bootstrap` 工具来扫描您的应用程序包并生成可用库的列表。

```bash
opentelemetry-bootstrap -a install
```

### 配置环境变量 {#configure-environment-variables}

之后，您需要在 Shell 中配置以下环境变量，以将遥测数据发送到 ClickStack：

```bash
export HYPERDX_API_KEY='<YOUR_INGESTION_API_KEY>' \
OTEL_SERVICE_NAME='<NAME_OF_YOUR_APP_OR_SERVICE>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

_`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用程序中识别您的服务，可以是您想要的任何名称。_

### 使用 OpenTelemetry Python 代理运行应用程序 {#run-the-application-with-otel-python-agent}

现在您可以用 OpenTelemetry Python 代理（`opentelemetry-instrument`）运行应用程序。

```bash
opentelemetry-instrument python app.py
```

#### 如果您使用 `Gunicorn`、`uWSGI` 或 `uvicorn` {#using-uvicorn-gunicorn-uwsgi}

在这种情况下，OpenTelemetry Python 代理需要额外的更改才能正常工作。

要为使用预分叉 Web 服务器模式的应用程序服务器配置 OpenTelemetry，请确保在后分叉钩子中调用 `configure_opentelemetry` 方法。

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

OpenTelemetry [目前不适用于](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385) 使用 `--reload` 标志或多工作进程（`--workers`）运行的 `uvicorn`。我们建议在测试时禁用这些标志，或使用 Gunicorn。

</TabItem>

</Tabs>

## 高级配置 {#advanced-configuration}

#### 网络捕获 {#network-capture}

通过启用网络捕获功能，开发人员能够有效调试 HTTP 请求头和主体负载。这可以通过将 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 标志设置为 1 来轻松实现。

```bash
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```

## 故障排除 {#troubleshooting}

### 日志未按日志级别显示 {#logs-not-appearing-due-to-log-level}

默认情况下，OpenTelemetry 日志处理程序使用 `logging.NOTSET` 级别，默认为 WARNING 级别。您可以在创建记录器时指定日志级别：

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### 导出到控制台 {#exporting-to-the-console}

OpenTelemetry Python SDK 通常会在发生错误时在控制台中显示错误。但是，如果您没有遇到任何错误，但注意到您的数据未按预期出现在 HyperDX 中，则可以选择启用调试模式。当调试模式激活时，所有遥测将打印到控制台，允许您验证应用程序是否已正确仪器化并包含预期的数据。

```bash
export DEBUG=true
```

阅读有关 Python OpenTelemetry 仪器的更多信息，请访问：
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
