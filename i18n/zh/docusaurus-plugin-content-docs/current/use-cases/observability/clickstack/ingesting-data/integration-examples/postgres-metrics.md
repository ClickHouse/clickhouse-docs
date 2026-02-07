---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: '使用 ClickStack 监控 PostgreSQL 指标'
sidebar_label: 'PostgreSQL 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 PostgreSQL 指标'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', '指标', 'OTel', 'ClickStack', '数据库监控']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

# 使用 ClickStack 监控 PostgreSQL 指标 \{#postgres-metrics-clickstack\}

:::note[TL;DR]
本指南介绍如何通过配置 OTel collector 的 PostgreSQL 接收器（receiver），使用 ClickStack 监控 PostgreSQL 性能指标。您将学会如何：

- 配置 OTel collector 以采集 PostgreSQL 指标
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 PostgreSQL 性能（事务、连接、数据库大小、缓存命中率）

如果您希望在为生产环境中的 PostgreSQL 数据库配置集成之前先进行测试，可以使用包含示例指标的演示数据集。

所需时间：10–15 分钟
:::

## 集成现有 PostgreSQL \{#existing-postgres\}

本节介绍如何通过为 ClickStack OTel collector 配置 PostgreSQL receiver，使您现有的 PostgreSQL 安装将度量指标发送到 ClickStack。

如果您希望在为自己的现有环境进行配置之前先测试 PostgreSQL 指标集成，可以在[以下章节](#demo-dataset)中使用我们预先配置的演示数据集进行测试。

##### 先决条件 \{#prerequisites\}

- 已运行的 ClickStack 实例
- 已存在的 PostgreSQL 安装（版本 9.6 或更高）
- 从 ClickStack 到 PostgreSQL 的网络连通性（默认端口 5432）
- 具有相应权限的 PostgreSQL 监控用户

<VerticalStepper headerLevel="h4">

#### 确保监控用户具备所需权限 \{#monitoring-permissions\}

PostgreSQL 接收器需要一个对统计视图具有只读访问权限的用户。为你的监控用户授予 `pg_monitor` 角色：

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### 创建自定义 OTel collector 配置 \{#create-custom-config\}

ClickStack 允许你通过挂载自定义配置文件并设置环境变量来扩展基础的 OpenTelemetry collector 配置。

创建 `postgres-metrics.yaml`：

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # Replace with your actual database names
    collection_interval: 30s
    tls:
      insecure: true

processors:
  resourcedetection:
    detectors: [env, system, docker]
    timeout: 5s
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  clickhouse:
    endpoint: tcp://localhost:9000
    database: default
    ttl: 96h

service:
  pipelines:
    metrics/postgres:
      receivers: [postgresql]
      processors: [resourcedetection, batch]
      exporters: [clickhouse]
```

:::note
`tls: insecure: true` 设置会在开发/测试环境中禁用 SSL 验证。对于启用 SSL 的生产 PostgreSQL，请删除这一行或配置正确的证书。
:::

#### 使用自定义配置部署 ClickStack \{#deploy-clickstack\}

挂载你的自定义配置：

```bash
docker run -d \
  --name clickstack-postgres \
  -p 8123:8123 -p 9000:9000 -p 4317:4317 -p 4318:4318 \
  -e HYPERDX_API_KEY=your-api-key \
  -e CLICKHOUSE_PASSWORD=your-clickhouse-password \
  -e POSTGRES_PASSWORD=secure_password_here \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  clickhouse/clickstack:latest
```

#### 验证指标采集 \{#verify-metrics\}

完成配置后，登录 HyperDX 并验证指标是否开始流入：

1. 进入 Metrics explorer
2. 搜索以 `postgresql.` 开头的指标（例如：`postgresql.backends`、`postgresql.commits`）
3. 你应能看到在配置的采集时间间隔内持续出现的指标数据点

在指标开始稳定流入后，继续前往 [Dashboards and visualization](#dashboards)（仪表板和可视化）部分导入预构建的仪表板。

</VerticalStepper>

## 演示数据集 \{#demo-dataset\}

对于希望在配置生产系统之前先测试 PostgreSQL 指标集成的用户，我们提供了一个预先生成的数据集，其中包含具有逼真模式的 PostgreSQL 指标。

:::note[仅数据库级别指标]
此演示数据集仅包含数据库级别指标，以保持示例数据轻量化。在监控真实 PostgreSQL 数据库时，表和索引指标会自动采集。
:::

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 \{#download-sample\}

下载预先生成的指标文件（包含 24 小时、具有逼真模式的 PostgreSQL 指标）：

```bash
# Download gauge metrics (connections, database size)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# Download sum metrics (commits, rollbacks, operations)
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

该数据集包含一些逼真的模式示例：
- **早晨连接峰值（08:00）** - 登录高峰
- **缓存性能问题（11:00）** - Blocks_read 峰值
- **应用程序 Bug（14:00-14:30）** - 回滚率激增至 15%
- **死锁事件（14:15、16:30）** - 罕见死锁

#### 启动 ClickStack \{#start-clickstack\}

启动一个 ClickStack 实例：

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待大约 30 秒，直至 ClickStack 完全启动。

#### 将指标加载到 ClickStack 中 \{#load-metrics\}

将指标直接加载到 ClickHouse 中：

```bash
# Load gauge metrics
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# Load sum metrics
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### 在 HyperDX 中验证指标 \{#verify-metrics-demo\}

加载完成后，查看指标的最快方式是使用预构建的仪表板。

前往 [仪表板和可视化](#dashboards) 部分，导入仪表板并一次性查看多项 PostgreSQL 指标。

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。请将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**，以确保无论您身在何处都能看到演示指标。确认能看到指标后，可以将范围收窄到 24 小时时段，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 \{#dashboards\}

为了帮助您开始使用 ClickStack 监控 PostgreSQL，我们提供了一套关键的 PostgreSQL 指标可视化。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX，并进入 Dashboards 页面
2. 点击右上角省略号菜单中的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard 按钮"/>

3. 上传 `postgres-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="Finish import 对话框"/>

#### 查看仪表板 \{#created-dashboard\}

系统会创建一个仪表板，并预先配置好所有可视化组件：

<Image img={example_dashboard} alt="PostgreSQL 指标仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**（可根据本地时区调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 \{#troubleshooting\}

### 自定义配置未生效 \{#troubleshooting-not-loading\}

请确认已设置环境变量：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX 中未显示任何指标 \{#no-metrics\}

检查 PostgreSQL 是否可访问：

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

查看 OTel collector 日志：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### 身份验证错误 \{#auth-errors\}

确认密码是否配置正确：

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

直接测试凭据：

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```

## 后续步骤 \{#next-steps\}

在完成 PostgreSQL 指标监控配置后：

- 为关键阈值（连接数限制、高回滚率、低缓存命中率）配置[告警](/use-cases/observability/clickstack/alerts)
- 启用 `pg_stat_statements` 扩展以实现查询级监控
- 通过复制接收器配置，并为其指定不同的端点和服务名称来监控多个 PostgreSQL 实例

## 上线生产环境 \{#going-to-production\}

本指南基于 ClickStack 内置的 OpenTelemetry Collector，帮助你快速完成初始配置。对于生产环境部署，我们建议运行你自己的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参见[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。