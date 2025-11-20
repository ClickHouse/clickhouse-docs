---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: '使用 ClickStack 监控 PostgreSQL 日志'
sidebar_label: 'PostgreSQL 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 PostgreSQL 日志'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', 'logs', 'OTEL', 'ClickStack', 'database monitoring']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_search_view from '@site/static/images/clickstack/postgres/postgres-logs-search-view.png';
import log_view from '@site/static/images/clickstack/postgres/postgres-log-view.png';
import logs_dashboard from '@site/static/images/clickstack/postgres/postgres-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/postgres/import-logs-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 PostgreSQL 日志 {#postgres-logs-clickstack}

:::note[TL;DR]
本指南介绍如何通过配置 OpenTelemetry 采集器来采集 PostgreSQL 服务器日志,从而使用 ClickStack 监控 PostgreSQL。您将学习如何:

- 配置 PostgreSQL 以 CSV 格式输出日志,以便进行结构化解析
- 创建用于日志采集的自定义 OTel 采集器配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 PostgreSQL 日志洞察(错误、慢查询、连接)

如果您想在配置生产环境 PostgreSQL 之前测试集成,可以使用包含示例日志的演示数据集。

所需时间:10-15 分钟
:::


## 与现有 PostgreSQL 集成 {#existing-postgres}

本节介绍如何通过修改 ClickStack OTel 采集器配置,将现有 PostgreSQL 安装的日志发送到 ClickStack。

如果您想在配置现有环境之前测试 PostgreSQL 日志集成,可以使用["演示数据集"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)部分中我们预配置的环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 现有 PostgreSQL 安装(版本 9.6 或更高)
- 具有修改 PostgreSQL 配置文件的权限
- 足够的磁盘空间用于存储日志文件

<VerticalStepper headerLevel="h4">

#### 配置 PostgreSQL 日志记录 {#configure-postgres}

PostgreSQL 支持多种日志格式。对于使用 OpenTelemetry 进行结构化解析,我们推荐使用 CSV 格式,它提供一致且易于解析的输出。

`postgresql.conf` 文件通常位于:

- **Linux (apt/yum)**: `/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**: `/usr/local/var/postgres/postgresql.conf` 或 `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**: 配置通常通过环境变量或挂载的配置文件设置

在 `postgresql.conf` 中添加或修改以下设置:


```conf
# CSV 日志记录所需配置
logging_collector = on
log_destination = 'csvlog'
```


# 推荐：启用连接日志
log_connections = on
log_disconnections = on



# 可选：根据监控需求进行调优

#log&#95;min&#95;duration&#95;statement = 1000  # 记录耗时超过 1 秒的查询
#log&#95;statement = &#39;ddl&#39;               # 记录 DDL 语句（CREATE、ALTER、DROP）
#log&#95;checkpoints = on                # 记录 checkpoint 活动
#log&#95;lock&#95;waits = on                 # 记录锁等待冲突

```

:::note
本指南使用 PostgreSQL 的 `csvlog` 格式来实现可靠的结构化解析。如果您使用 `stderr` 或 `jsonlog` 格式,需要相应调整 OpenTelemetry 采集器的配置。
:::

完成这些更改后,重启 PostgreSQL:
```


```bash
# 对于 systemd
sudo systemctl restart postgresql
```


# Docker 环境

docker restart

```

验证日志正在写入：
```


```bash
# Linux 上的默认日志位置
tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log
```


# macOS Homebrew

tail -f /usr/local/var/postgres/log/postgresql-\*.log

````

#### 创建自定义 OTel 采集器配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置合并。

创建一个名为 `postgres-logs-monitoring.yaml` 的文件,包含以下配置:

```yaml
receivers:
  filelog/postgres:
    include:
      - /var/lib/postgresql/*/main/log/postgresql-*.csv # 根据您的 PostgreSQL 安装路径进行调整
    start_at: end
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true

      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'

      - type: add
        field: attributes.source
        value: "postgresql"

      - type: add
        field: resource["service.name"]
        value: "postgresql-production"

service:
  pipelines:
    logs/postgres:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
````

此配置:

- 从标准位置读取 PostgreSQL CSV 日志
- 处理多行日志条目(错误通常跨越多行)
- 解析包含所有标准 PostgreSQL 日志字段的 CSV 格式
- 提取时间戳以保留原始日志时间
- 添加 `source: postgresql` 属性以便在 HyperDX 中进行过滤
- 通过专用管道将日志路由到 ClickHouse 导出器

:::note

- 您只需在自定义配置中定义新的接收器和管道
- 处理器(`memory_limiter`、`transform`、`batch`)和导出器(`clickhouse`)已在基础 ClickStack 配置中定义 - 您只需按名称引用它们
- `csv_parser` 操作符将所有标准 PostgreSQL CSV 日志字段提取为结构化属性
- 此配置使用 `start_at: end` 以避免在采集器重启时重新摄取日志。对于测试,可更改为 `start_at: beginning` 以立即查看历史日志。
- 根据您的 PostgreSQL 日志目录位置调整 `include` 路径
  :::

#### 配置 ClickStack 加载自定义配置 {#load-custom}

要在现有 ClickStack 部署中启用自定义采集器配置,您必须:

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 挂载您的 PostgreSQL 日志目录以便采集器可以读取

##### 选项 1: Docker Compose {#docker-compose}

更新您的 ClickStack 部署配置:

```yaml
services:
  clickstack:
    # ... 现有配置 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... 其他环境变量 ...
    volumes:
      - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/lib/postgresql:/var/lib/postgresql:ro
      # ... 其他卷 ...
```

##### 选项 2: Docker Run(一体化镜像) {#all-in-one}

如果您使用 docker run 运行一体化镜像:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack 采集器具有读取 PostgreSQL 日志文件的适当权限。在生产环境中,使用只读挂载(`:ro`)并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}


配置完成后,登录 HyperDX 并验证日志是否正常流入:

1. 进入搜索视图
2. 将来源设置为 Logs
3. 使用 `source:postgresql` 进行过滤以查看 PostgreSQL 相关日志
4. 您应该能看到包含 `user_name`、`database_name`、`error_severity`、`message`、`query` 等字段的结构化日志条目

<Image img={logs_search_view} alt='日志搜索视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 PostgreSQL 日志集成的用户,我们提供了一个预生成的 PostgreSQL 日志样本数据集,其中包含真实的日志模式。

<VerticalStepper headerLevel="h4">

#### 下载样本数据集 {#download-sample}

下载样本日志文件:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 创建测试采集器配置 {#test-config}

创建一个名为 `postgres-logs-demo.yaml` 的文件,包含以下配置:

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # 从头开始读取演示数据
    multiline:
      line_start_pattern: '^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}'
    operators:
      - type: csv_parser
        parse_from: body
        parse_to: attributes
        header: 'log_time,user_name,database_name,process_id,connection_from,session_id,session_line_num,command_tag,session_start_time,virtual_transaction_id,transaction_id,error_severity,sql_state_code,message,detail,hint,internal_query,internal_query_pos,context,query,query_pos,location,application_name,backend_type,leader_pid,query_id'
        lazy_quotes: true

      - type: time_parser
        parse_from: attributes.log_time
        layout: '%Y-%m-%d %H:%M:%S.%L %Z'

      - type: add
        field: attributes.source
        value: "postgresql-demo"

      - type: add
        field: resource["service.name"]
        value: "postgresql-demo"

service:
  pipelines:
    logs/postgres-demo:
      receivers: [filelog/postgres]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 使用演示配置运行 ClickStack {#run-demo}

使用演示日志和配置运行 ClickStack:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

ClickStack 运行后:

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户(您可能需要先创建账户)
2. 导航到搜索视图并将来源设置为 `Logs`
3. 将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[时区显示]
HyperDX 以您浏览器的本地时区显示时间戳。演示数据的时间跨度为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。较宽的时间范围可确保无论您身处何地都能看到演示日志。看到日志后,您可以将范围缩小到 24 小时,以获得更清晰的可视化效果。
:::

<Image img={logs_search_view} alt='日志搜索视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 PostgreSQL,我们提供了 PostgreSQL 日志的基础可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 {#download}

#### 导入预构建仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分
2. 点击右上角省略号菜单中的 **Import Dashboard**

<Image img={import_dashboard} alt='导入仪表板按钮' />

3. 上传 `postgresql-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt='完成导入' />

#### 查看仪表板 {#created-dashboard}

仪表板将创建完成,所有可视化组件均已预配置:

<Image img={logs_dashboard} alt='日志仪表板' />

:::note
对于演示数据集,请将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**(根据您的本地时区调整)。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>


## 故障排查 {#troubleshooting}

### 自定义配置未加载 {#troubleshooting-not-loading}

验证环境变量是否已设置:

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载且可读:

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDX 中未显示日志 {#no-logs}

检查有效配置是否包含您的 filelog 接收器:

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

检查收集器日志中的错误:

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

如果使用演示数据集,请验证日志文件是否可访问:

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 后续步骤 {#next-steps}

设置 PostgreSQL 日志监控后：

- 为关键事件（连接失败、慢查询、错误激增）设置[告警](/use-cases/observability/clickstack/alerts)
- 将日志与 [PostgreSQL 指标](/use-cases/observability/clickstack/integrations/postgresql-metrics)关联，以实现全面的数据库监控
- 为特定应用的查询模式创建自定义仪表板
- 配置 `log_min_duration_statement` 以识别符合性能要求的慢查询


## 投入生产环境 {#going-to-production}

本指南基于 ClickStack 内置的 OpenTelemetry Collector 进行扩展,以便快速设置。对于生产环境部署,我们建议运行您自己的 OTel Collector,并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置详情请参阅[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
