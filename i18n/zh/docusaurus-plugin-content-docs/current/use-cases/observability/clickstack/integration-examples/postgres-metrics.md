---
slug: /use-cases/observability/clickstack/integrations/postgresql-metrics
title: '使用 ClickStack 监控 PostgreSQL 指标'
sidebar_label: 'PostgreSQL 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 PostgreSQL 指标'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'metrics', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/postgres/postgres-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 PostgreSQL 指标 {#postgres-metrics-clickstack}

:::note[TL;DR]
本指南介绍如何通过配置 OpenTelemetry 采集器的 PostgreSQL 接收器,使用 ClickStack 监控 PostgreSQL 性能指标。您将学习如何:

- 配置 OTel 采集器以收集 PostgreSQL 指标
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 PostgreSQL 性能(事务、连接、数据库大小、缓存命中率)

如果您想在配置生产环境 PostgreSQL 数据库之前测试集成,可以使用包含示例指标的演示数据集。

所需时间:10-15 分钟
:::


## 与现有 PostgreSQL 集成 {#existing-postgres}

本节介绍如何通过配置 ClickStack OTel 收集器的 PostgreSQL 接收器,将现有 PostgreSQL 安装的指标发送到 ClickStack。

如果您想在配置自己的现有环境之前测试 PostgreSQL 指标集成,可以使用我们在[下一节](#demo-dataset)中预配置的演示数据集进行测试。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 现有 PostgreSQL 安装(版本 9.6 或更高)
- 从 ClickStack 到 PostgreSQL 的网络访问(默认端口 5432)
- 具有适当权限的 PostgreSQL 监控用户

<VerticalStepper headerLevel="h4">

#### 确保监控用户具有所需权限 {#monitoring-permissions}

PostgreSQL 接收器需要一个对统计视图具有读取权限的用户。将 `pg_monitor` 角色授予您的监控用户:

```sql
GRANT pg_monitor TO your_monitoring_user;
```

#### 创建自定义 OTel 收集器配置 {#create-custom-config}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry 收集器配置。

创建 `postgres-metrics.yaml`:

```yaml
receivers:
  postgresql:
    endpoint: postgres-host:5432
    transport: tcp
    username: otel_monitor
    password: ${env:POSTGRES_PASSWORD}
    databases:
      - postgres
      - your_application_db # 替换为您的实际数据库名称
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
`tls: insecure: true` 设置会禁用 SSL 验证,用于开发/测试环境。对于启用了 SSL 的生产环境 PostgreSQL,请删除此行或配置正确的证书。
:::

#### 使用自定义配置部署 ClickStack {#deploy-clickstack}

挂载您的自定义配置:

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

#### 验证指标收集 {#verify-metrics}

配置完成后,登录 HyperDX 并验证指标是否正在流入:

1. 导航到指标浏览器
2. 搜索以 postgresql. 开头的指标(例如 postgresql.backends、postgresql.commits)
3. 您应该会看到指标数据点按照配置的收集间隔出现

指标开始流入后,请继续前往[仪表板和可视化](#dashboards)部分导入预构建的仪表板。

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 PostgreSQL 指标集成的用户,我们提供了一个预生成的数据集,包含真实的 PostgreSQL 指标模式。

:::note[仅包含数据库级指标]
此演示数据集仅包含数据库级指标,以保持样本数据轻量化。在监控真实 PostgreSQL 数据库时,表和索引指标会自动收集。
:::

<VerticalStepper headerLevel="h4">

#### 下载样本指标数据集 {#download-sample}

下载预生成的指标文件(24 小时真实模式的 PostgreSQL 指标):


```bash
# 下载指标数据（连接数、数据库大小）
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-gauge.csv
```


# 下载汇总指标（提交、回滚、操作）

curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgres-metrics-sum.csv

````

该数据集包含以下真实场景模式：
- **早晨连接峰值（08:00）** - 登录高峰期
- **缓存性能问题（11:00）** - Blocks_read 激增
- **应用程序错误（14:00-14:30）** - 回滚率激增至 15%
- **死锁事件（14:15、16:30）** - 罕见死锁

#### 启动 ClickStack {#start-clickstack}

启动 ClickStack 实例：

```bash
docker run -d --name clickstack-postgres-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
````

等待约 30 秒，直到 ClickStack 完全启动。

#### 将指标加载到 ClickStack {#load-metrics}

将指标直接加载到 ClickHouse 中：


```bash
# 加载 gauge 指标
cat postgres-metrics-gauge.csv | docker exec -i clickstack-postgres-demo \
  clickhouse-client --query "INSERT INTO otel_metrics_gauge FORMAT CSVWithNames"
```


# 加载 sum 类型指标

cat postgres-metrics-sum.csv | docker exec -i clickstack-postgres-demo \
clickhouse-client --query &quot;INSERT INTO otel&#95;metrics&#95;sum FORMAT CSVWithNames&quot;

```

#### 在 HyperDX 中验证指标 {#verify-metrics-demo}

加载完成后,查看指标最快的方式是使用预构建的仪表板。

前往[仪表板和可视化](#dashboards)部分导入仪表板,即可一次性查看多个 PostgreSQL 指标。

:::note[时区显示]
HyperDX 会在您浏览器的本地时区中显示时间戳。演示数据的时间跨度为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。请将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**,以确保无论您身处何地都能看到演示指标。看到指标后,您可以将范围缩小至 24 小时,以获得更清晰的可视化效果。
:::

</VerticalStepper>
```


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 PostgreSQL,我们提供了 PostgreSQL 指标的基本可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-metrics-dashboard.json')} download="postgres-metrics-dashboard.json" eventName="docs.postgres_metrics_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt='导入仪表板按钮' />

3. 上传 `postgres-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt='完成导入对话框' />

#### 查看仪表板 {#created-dashboard}

仪表板将创建完成,所有可视化均已预配置:

<Image img={example_dashboard} alt='PostgreSQL 指标仪表板' />

:::note
对于演示数据集,请将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**(根据您的本地时区进行调整)。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>


## 故障排查 {#troubleshooting}

### 自定义配置未加载 {#troubleshooting-not-loading}

验证环境变量是否已设置：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX 中未显示指标 {#no-metrics}

验证 PostgreSQL 是否可访问：

```bash
docker exec <clickstack-container> psql -h postgres-host -U otel_monitor -d postgres -c "SELECT 1"
```

检查 OTel 采集器日志：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

### 身份验证错误 {#auth-errors}

验证密码是否设置正确：

```bash
docker exec <clickstack-container> printenv POSTGRES_PASSWORD
```

直接测试凭据：

```bash
psql -h postgres-host -U otel_monitor -d postgres -c "SELECT version();"
```


## 后续步骤 {#next-steps}

设置 PostgreSQL 指标监控后:

- 为关键阈值设置[告警](/use-cases/observability/clickstack/alerts)(连接数限制、高回滚率、低缓存命中率)
- 使用 `pg_stat_statements` 扩展启用查询级监控
- 通过复制接收器配置并使用不同的端点和服务名称来监控多个 PostgreSQL 实例


## 投入生产环境 {#going-to-production}

本指南基于 ClickStack 内置的 OpenTelemetry Collector 进行扩展,以便快速设置。对于生产环境部署,我们建议运行您自己的 OTel Collector,并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置请参阅[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
