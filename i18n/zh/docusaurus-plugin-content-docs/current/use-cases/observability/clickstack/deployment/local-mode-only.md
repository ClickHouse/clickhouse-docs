---
'slug': '/use-cases/observability/clickstack/deployment/local-mode-only'
'title': '仅本地模式'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': '仅使用本地模式部署 ClickStack - ClickHouse 观察性栈'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

类似于 [全能图像](/use-cases/observability/clickstack/deployment/docker-compose)，这个综合性的 Docker 镜像捆绑了所有 ClickStack 组件：

* **ClickHouse**
* **HyperDX**
* **OpenTelemetry (OTel) 收集器**（在端口 `4317` 和 `4318` 暴露 OTLP）
* **MongoDB**（用于持久的应用状态）

**然而，此版本的 HyperDX 禁用了用户身份验证**

### 适用于 {#suitable-for}

* 演示
* 调试
* 使用 HyperDX 的开发

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

本地模式在端口 8080 上部署 HyperDX 用户界面。

```shell
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### 访问 HyperDX 用户界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX 用户界面。

**您将不会被提示创建用户，因为在此部署模式下未启用身份验证。**

连接到您自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="创建登录" size="md"/>

创建一个源，保留所有默认值，并在 `Table` 字段中填写值 `otel_logs`。所有其他设置应自动检测，让您可以点击 `保存新源`。

<Image img={hyperdx_logs} alt="创建日志源" size="md"/>

</VerticalStepper>

<JSONSupport/>

对于仅本地模式的镜像，用户只需设置 `BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true` 参数，例如：

```shell
docker run -e BETA_CH_OTEL_JSON_SCHEMA_ENABLED=true -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```
