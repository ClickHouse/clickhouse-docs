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
本指南介绍如何通过配置 OpenTelemetry collector 的 PostgreSQL receiver，使用 ClickStack 监控 PostgreSQL 性能指标。您将学习如何：

- 配置 OTel collector 以采集 PostgreSQL 指标
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 PostgreSQL 性能（事务、连接、数据库大小、缓存命中率）

如果您希望在为生产环境 PostgreSQL 数据库进行配置之前先测试集成，可以使用提供的带有示例指标的演示数据集。

所需时间：10–15 分钟
:::

## 与现有 PostgreSQL 的集成 \{#existing-postgres\}

本节介绍如何通过使用 PostgreSQL receiver 配置 ClickStack OTel collector，将您现有的 PostgreSQL 安装配置为向 ClickStack 发送指标数据。

如果您希望在配置自己的现有环境之前先测试 PostgreSQL 指标集成，可以在[下文章节](#demo-dataset)中使用我们预配置的演示数据集进行测试。

##### 先决条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 现有的 PostgreSQL 部署（版本 9.6 或更高）
- 从 ClickStack 到 PostgreSQL 的网络连通性（默认端口 5432）
- 具有相应权限的 PostgreSQL 监控用户

<VerticalStepper headerLevel="h4">

#### 确保监控用户具有所需权限 \{#monitoring-permissions\}

PostgreSQL 接收器需要一个对统计视图具有只读访问权限的用户。为监控用户授予 `pg_monitor` 角色：

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### 创建自定义 OTel collector 配置 \{#create-custom-config\}

ClickStack 允许你通过挂载自定义配置文件并设置环境变量，来扩展基础 OpenTelemetry collector 配置。

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
      - your_application_db # 替换为你的实际数据库名称
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
`tls: insecure: true` 设置会在开发/测试环境中禁用 SSL 校验。对于启用了 SSL 的生产 PostgreSQL，请删除这一行或配置正确的证书。
:::

#### 使用自定义配置部署 ClickStack \{#deploy-clickstack\}

挂载自定义配置：

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

1. 进入 Metrics Explorer
2. 搜索以 postgresql. 开头的指标（例如：postgresql.backends、postgresql.commits）
3. 你应该能够看到按配置的采集间隔出现的指标数据点

一旦指标开始流入，继续前往 [Dashboards and visualization](#dashboards) 部分导入预构建的仪表盘。

</VerticalStepper>

## 演示数据集 \{#demo-dataset\}

对于希望在配置生产系统之前先测试 PostgreSQL 指标集成的用户，我们提供了一个预生成的数据集，其中包含具有逼真模式的 PostgreSQL 指标。

:::note[仅限数据库级指标]
此演示数据集仅包含数据库级指标，以保持示例数据的体量较小。在监控真实的 PostgreSQL 数据库时，会自动收集表和索引指标。
:::

<VerticalStepper headerLevel="h4">

#### 下载示例指标数据集 \{#download-sample\}

下载预生成的指标文件（包含 24 小时的、具有逼真模式的 PostgreSQL 指标）：

```bash
# 下载 gauge 指标（connections、database size）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv

# 下载 sum 指标（commits、rollbacks、operations）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv
```

该数据集模拟了如下典型模式：
- **早晨连接峰值（08:00）** - 登录高峰
- **缓存性能问题（11:00）** - Blocks_read 峰值
- **应用程序缺陷（14:00-14:30）** - 回滚率飙升至 15%
- **死锁事件（14:15、16:30）** - 偶发死锁

#### 启动 ClickStack \{#start-clickstack\}

启动一个 ClickStack 实例：

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待大约 30 秒以便 ClickStack 完全启动。

#### 将指标加载到 ClickStack 中 \{#load-metrics\}

将指标直接加载到 ClickHouse：

```bash
# 加载 gauge 指标
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"

# 加载 sum 指标
cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_sum FORMAT CSVWithNames"
```

#### 在 HyperDX 中验证指标 \{#verify-metrics-demo\}

加载完成后，查看指标的最快方式是使用预构建的仪表板。

继续前往 [仪表板与可视化](#dashboards) 部分导入仪表板，并一次性查看多个 PostgreSQL 指标。

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。请将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**，以确保无论您所在位置如何都能看到演示指标。在看到这些指标后，您可以将范围收窄到 24 小时时段，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板与可视化 \{#dashboards\}

为了帮助你开始使用 ClickStack 监控 PostgreSQL，我们提供了用于 PostgreSQL 指标的关键可视化。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并导航到 Dashboards 页面
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard button"/>

3. 上传 `postgres-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### 查看仪表板 \{#created-dashboard\}

系统将创建一个仪表板，并预先配置好所有可视化视图：

<Image img={example_dashboard} alt="PostgreSQL metrics dashboard"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 \{#troubleshooting\}

### 自定义配置未生效 \{#troubleshooting-not-loading\}

检查环境变量是否已设置：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查是否已挂载自定义配置文件：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX 中没有显示任何指标 \{#no-metrics\}

确认 PostgreSQL 是否可访问：

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

查看 OTel collector 日志：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```


### 身份验证错误 \{#auth-errors\}

检查密码是否设置正确：

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

直接测试凭据：

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 后续步骤 \{#next-steps\}

在完成 PostgreSQL 指标监控配置后：

- 为关键阈值（连接数上限、高回滚率、低缓存命中率）[配置告警](/use-cases/observability/clickstack/alerts)
- 启用 `pg_stat_statements` 扩展以实现查询级监控
- 通过复制接收器配置并使用不同的端点和服务名来监控多个 PostgreSQL 实例

## 迁移到生产环境 \{#going-to-production\}

本指南扩展了 ClickStack 内置的 OpenTelemetry Collector，以便快速完成初始设置。对于生产环境部署，建议自行运行 OTel collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参阅 [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。