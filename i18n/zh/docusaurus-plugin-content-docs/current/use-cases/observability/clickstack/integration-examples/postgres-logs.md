---
slug: /use-cases/observability/clickstack/integrations/postgresql-logs
title: '使用 ClickStack 监控 PostgreSQL 日志'
sidebar_label: 'PostgreSQL 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 PostgreSQL 日志'
doc_type: 'guide'
keywords: ['PostgreSQL', 'Postgres', '日志', 'OTel', 'ClickStack', '数据库监控']
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

:::note[要点速览]
本指南介绍如何通过配置 OpenTelemetry collector 来摄取 PostgreSQL 服务器日志，从而使用 ClickStack 监控 PostgreSQL。你将学习如何：

- 将 PostgreSQL 配置为以 CSV 格式输出日志，以便进行结构化解析
- 为日志摄取创建自定义 OTel collector 配置
- 使用你的自定义配置部署 ClickStack
- 使用预构建的仪表盘可视化 PostgreSQL 日志信息（错误、慢查询、连接情况）

如果你希望在为生产环境 PostgreSQL 配置前先测试集成，可使用包含示例日志的演示数据集。

所需时间：10–15 分钟
:::

## 与现有 PostgreSQL 的集成 {#existing-postgres}

本节介绍如何通过修改 ClickStack OTel collector 配置，将你现有的 PostgreSQL 实例日志发送到 ClickStack。

如果你希望在为自己的现有环境进行配置之前先测试 PostgreSQL 日志集成，可以在["演示数据集"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)一节中，使用我们预配置的环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- 正在运行的 ClickStack 实例
- 现有的 PostgreSQL 部署（版本 9.6 或更高）
- 可修改 PostgreSQL 配置文件的权限
- 足够的磁盘空间用于存储日志文件

<VerticalStepper headerLevel="h4">
  #### 配置 PostgreSQL 日志记录

  PostgreSQL 支持多种日志格式。为了使用 OpenTelemetry 进行结构化解析,我们推荐使用 CSV 格式,它能提供一致且可解析的输出。

  `postgresql.conf` 文件通常位于:

  * **Linux（apt/yum）**: `/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS（Homebrew）**：`/usr/local/var/postgres/postgresql.conf` 或 `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**：通常通过环境变量或挂载的配置文件进行配置

  在 `postgresql.conf` 中添加或修改这些设置：

  ```conf
  # CSV 日志记录必需配置
  logging_collector = on
  log_destination = 'csvlog'

  # 推荐配置:连接日志记录
  log_connections = on
  log_disconnections = on

  # 可选配置:根据监控需求调整
  #log_min_duration_statement = 1000  # 记录执行时间超过 1 秒的查询
  #log_statement = 'ddl'               # 记录 DDL 语句(CREATE、ALTER、DROP)
  #log_checkpoints = on                # 记录检查点活动
  #log_lock_waits = on                 # 记录锁等待
  ```

  :::note
  本指南使用 PostgreSQL 的 `csvlog` 格式以实现可靠的结构化解析。如果您使用 `stderr` 或 `jsonlog` 格式,需要相应调整 OpenTelemetry 采集器配置。
  :::

  完成这些更改后,请重启 PostgreSQL:

  ```bash
  # 对于 systemd
  sudo systemctl restart postgresql

  # 对于 Docker
  docker restart
  ```

  验证日志是否正在写入：

  ```bash
  # Linux 上的默认日志位置
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry Collector 的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 `postgres-logs-monitoring.yaml` 的文件,使用以下配置:

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
  ```

  此配置：

  * 从默认位置读取 PostgreSQL CSV 日志
  * 支持多行日志记录（错误通常会跨越多行）
  * 解析包含所有标准 PostgreSQL 日志字段的 CSV 日志格式
  * 提取时间戳以保留日志的原始时间
  * 添加 `source: postgresql` 属性，用于在 HyperDX 中进行过滤
  * 通过专用管道将日志路由至 ClickHouse exporter

  :::note

  * 只需在自定义配置中定义新的接收器和管道即可
  * 在基础 ClickStack 配置中，处理器（`memory_limiter`、`transform`、`batch`）和导出器（`clickhouse`）已经定义好了——你只需通过名称引用它们即可
  * `csv_parser` 算子会将所有标准 PostgreSQL CSV 日志字段提取为结构化属性。
  * 此配置使用 `start_at: end`，以避免在 collector 重启后重新摄取日志。用于测试时，可将其改为 `start_at: beginning`，以便立即查看历史日志。
  * 将 `include` 路径调整为与 PostgreSQL 日志目录的位置相匹配
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有的 ClickStack 部署中启用自定义采集器配置，您必须：

  1. 将自定义配置文件挂载到路径 `/etc/otelcol-contrib/custom.config.yaml`
  2. 将环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 设置为 `/etc/otelcol-contrib/custom.config.yaml`
  3. 挂载 PostgreSQL 日志目录，使收集器能够读取这些日志

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置：

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
        # ... 其他数据卷 ...
  ```

  ##### 选项 2:Docker Run(一体化镜像)

  如果您使用 docker run 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  确保 ClickStack 采集器具有读取 PostgreSQL 日志文件的相应权限。在生产环境中,使用只读挂载(`:ro`)并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 转到搜索视图
  2. 将 Source 设为 Logs
  3. 按 `source:postgresql` 过滤，查看 PostgreSQL 相关日志
  4. 你应该会看到结构化的日志条目，其中包含 `user_name`、`database_name`、`error_severity`、`message`、`query` 等字段。

  <Image img={logs_search_view} alt="日志搜索视图" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 PostgreSQL 日志集成的用户，我们提供了一份预先生成的、模式接近真实场景的 PostgreSQL 日志示例数据集。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 创建测试采集器配置 {#test-config}

创建名为 `postgres-logs-demo.yaml` 的文件，并使用以下配置：

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # 为演示数据从开头开始读取
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

使用演示日志和配置运行 ClickStack：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/postgresql.log:/tmp/postgres-demo/postgresql.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

当 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户（如有需要，先创建一个账户）
2. 进入 Search 视图，将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。较宽的时间范围可以确保无论您身处何地都能看到演示日志。看到日志后，您可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={logs_search_view} alt="日志搜索视图"/>

<Image img={log_view} alt="日志详情视图"/>

</VerticalStepper>

## 仪表板与可视化 {#dashboards}

为帮助您开始使用 ClickStack 监控 PostgreSQL，我们提供了针对 PostgreSQL 日志的关键可视化内容。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并进入 **Dashboards** 区域
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard 按钮"/>

3. 上传 `postgresql-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表板 {#created-dashboard}

系统会创建一个已预先配置好所有可视化内容的仪表板：

<Image img={logs_dashboard} alt="日志仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表板默认未指定时间范围。
:::

</VerticalStepper>

## 疑难排解 {#troubleshooting}

### 自定义配置未生效

确认已设置环境变量：

```bash
docker exec <容器名称> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载并可读：

```bash
docker exec <容器名称> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX 中没有日志显示

检查生效的配置中是否包含你的 `filelog` 接收器：

```bash
docker exec <容器> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

检查收集器日志中是否有错误：

```bash
docker exec <容器> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

如果使用演示数据集，请确认日志文件可访问：

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 后续步骤 {#next-steps}

在完成 PostgreSQL 日志监控配置之后：

- 为关键事件（连接失败、慢查询、错误激增）配置[告警](/use-cases/observability/clickstack/alerts)
- 将日志与[PostgreSQL 指标](/use-cases/observability/clickstack/integrations/postgresql-metrics)关联，实现全面的数据库监控
- 创建自定义仪表板，以可视化特定于应用的查询模式
- 配置 `log_min_duration_statement`，以根据你的性能要求识别相应的慢查询

## 迁移到生产环境 {#going-to-production}

本指南在 ClickStack 内置的 OpenTelemetry Collector 基础上进行扩展，以便快速完成设置。对于生产环境中的部署，我们建议运行您自己的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置参见 [发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。