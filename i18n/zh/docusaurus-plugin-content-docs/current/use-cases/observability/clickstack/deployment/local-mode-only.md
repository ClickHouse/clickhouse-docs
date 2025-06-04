---
'slug': '/use-cases/observability/clickstack/deployment/local-mode-only'
'title': '本地模式仅限'
'pagination_prev': null
'pagination_next': null
'sidebar_position': 5
'description': '仅使用本地模式部署 ClickStack - ClickHouse 可观察性栈'
---

import Image from '@theme/IdealImage';
import hyperdx_logs from '@site/static/images/use-cases/observability/hyperdx-logs.png';
import hyperdx_2 from '@site/static/images/use-cases/observability/hyperdx-2.png';

此模式包括用户界面，所有应用程序状态在浏览器中本地存储。

**此 HyperDX 发行版禁用了用户身份验证**

它不包括 MongoDB 实例，这意味着仪表板、保存的搜索和警报在不同用户之间不会持久化。

### 适合 {#suitable-for}

* 演示
* 调试
* 使用 HyperDX 的开发

## 部署步骤 {#deployment-steps}
<br/>

<VerticalStepper headerLevel="h3">

### 使用 Docker 部署 {#deploy-with-docker}

本地模式仅部署 HyperDX 用户界面，访问端口 8080。

```bash
docker run -p 8080:8080 docker.hyperdx.io/hyperdx/hyperdx-local
```

### 导航到 HyperDX 用户界面 {#navigate-to-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问 HyperDX 用户界面。

**您不会被提示创建用户，因为此部署模式未启用身份验证。**

连接到您自己的外部 ClickHouse 集群，例如 ClickHouse Cloud。

<Image img={hyperdx_2} alt="创建登录" size="md"/>

创建一个源，保留所有默认值，将 `Table` 字段填写为 `otel_logs`。所有其他设置应自动检测，您可以点击 `Save New Source`。

<Image img={hyperdx_logs} alt="创建日志源" size="md"/>

</VerticalStepper>
