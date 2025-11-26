---
slug: /use-cases/observability/clickstack/deployment/local-mode-only
title: '仅限本地模式'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: '以仅本地模式部署 ClickStack - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['clickstack', 'deployment', 'setup', 'configuration', 'observability']
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

与[一体化镜像](/use-cases/observability/clickstack/deployment/docker-compose)类似，这个完整的 Docker 镜像打包了所有 ClickStack 组件：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) collector**（在端口 `4317` 和 `4318` 上暴露 OTLP）
* **MongoDB**（用于持久化应用状态）

**但是，此版本的 HyperDX 未启用用户认证功能**


### 适用场景 {#suitable-for}

* 演示
* 调试
* 基于 HyperDX 的开发

## 部署步骤

<br />

<VerticalStepper headerLevel="h3">
  ### 使用 Docker 部署

  本地模式会在 8080 端口上运行 HyperDX UI。

  ```shell
  docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
  ```

  ### 访问 HyperDX UI

  访问 [http://localhost:8080](http://localhost:8080) 以打开 HyperDX UI。

  **在此部署模式下未启用身份验证，因此不会提示你创建用户。**

  连接到你自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

  <Image img={hyperdx_2} alt="创建登录" size="md" />

  创建一个数据源，保留所有默认值，并将 `Table` 字段设置为 `otel_logs`。其他设置会自动检测完成，然后你就可以点击 `Save New Source`。

  <Image img={hyperdx_logs} alt="创建日志数据源" size="md" />
</VerticalStepper>

<JSONSupport />

对于仅用于本地模式的镜像，用户只需要设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 参数，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
