---
slug: /use-cases/observability/clickstack/sdks/python
pagination_prev: null
pagination_next: null
sidebar_position: 7
description: 'ClickStack 的 Python - ClickHouse 可观测性栈'
title: 'Python'
doc_type: 'guide'
keywords: ['clickstack', 'sdk', '日志', '集成', '应用程序监控']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickStack 使用 OpenTelemetry 标准来采集遥测数据（日志和链路追踪）。通过自动埋点会自动生成链路追踪，因此即使不进行手动埋点，也可以从追踪数据中获得价值。

本指南集成了：

* **Logs（日志）**
* **Metrics（指标）**
* **Traces（链路追踪）**


## 入门

### 安装 ClickStack OpenTelemetry 插桩库

使用以下命令安装 [ClickStack OpenTelemetry 插桩库](https://pypi.org/project/hyperdx-opentelemetry/)。

```shell
pip install hyperdx-opentelemetry
```

为 Python 应用所使用的各个包安装 OpenTelemetry 自动埋点库。建议使用 OpenTelemetry Python SDK 自带的 `opentelemetry-bootstrap` 工具扫描应用所用的包，并生成可用库列表。

```shell
opentelemetry-bootstrap -a install
```

### 配置环境变量

接下来，你需要在 shell 环境中配置以下环境变量，以便将遥测数据发送到 ClickStack：

```shell
export HYPERDX_API_KEY='<您的摄取_API_密钥>' \
OTEL_SERVICE_NAME='<您的应用或服务名称>' \
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318 
```

*`OTEL_SERVICE_NAME` 环境变量用于在 HyperDX 应用中标识你的服务，可以是任意你想使用的名称。*

### 使用 OpenTelemetry Python agent 运行应用程序

现在你可以使用 OpenTelemetry Python agent（`opentelemetry-instrument`）来运行该应用程序。

```shell
opentelemetry-instrument python app.py
```

#### 如果你正在使用 `Gunicorn`、`uWSGI` 或 `uvicorn`

在这种情况下，OpenTelemetry Python agent 需要进行额外的配置修改才能正常工作。

要为使用 pre-fork Web 服务器模式的应用服务器配置 OpenTelemetry，请确保在 post-fork hook 中调用 `configure_opentelemetry` 方法。

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
    OpenTelemetry [当前无法正常工作](https://github.com/open-telemetry/opentelemetry-python-contrib/issues/385)，当使用 `--reload`
    参数或以多 worker（`--workers`）方式运行 `uvicorn` 时都会受到影响。我们建议在测试时禁用这些参数，或者改用 Gunicorn。
  </TabItem>
</Tabs>


## 高级配置

#### 网络捕获

通过启用网络捕获功能，开发人员可以高效调试 HTTP 请求头和请求体内容。只需将 `HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE` 标志设置为 1 即可。

```shell
export HYPERDX_ENABLE_ADVANCED_NETWORK_CAPTURE=1
```


## 故障排查

### 日志级别导致日志未显示

默认情况下，OpenTelemetry 日志处理程序使用 `logging.NOTSET` 级别，该级别
实际会退化为 WARNING 级别。你可以在创建 logger 时显式指定日志级别：

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
```

### 输出到控制台

OpenTelemetry Python SDK 通常会在发生错误时将错误信息输出到控制台。不过，如果并未遇到任何错误，却发现数据没有按预期出现在 HyperDX 中，可以启用调试模式。启用调试模式后，所有遥测数据都会被打印到控制台，便于核实应用程序是否已正确完成插桩并生成预期数据。

```shell
export DEBUG=true
```

在此处了解更多关于 Python OpenTelemetry 插桩的信息：
[https://opentelemetry.io/docs/instrumentation/python/manual/](https://opentelemetry.io/docs/instrumentation/python/manual/)
