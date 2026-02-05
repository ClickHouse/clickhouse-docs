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


# 使用 ClickStack 监控 PostgreSQL 日志 \{#postgres-logs-clickstack\}

:::note[要点速览]
本指南说明如何通过配置 OpenTelemetry collector 来摄取 PostgreSQL 服务器日志，从而使用 ClickStack 监控 PostgreSQL。您将了解如何：

- 将 PostgreSQL 配置为以 CSV 格式输出日志，便于结构化解析
- 为日志摄取创建自定义 OTel collector 配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 PostgreSQL 日志洞察（错误、慢查询、连接）

如果您希望在为生产环境 PostgreSQL 配置之前先测试集成，可使用包含示例日志的演示数据集。

所需时间：10–15 分钟
:::

## 集成现有 PostgreSQL \{#existing-postgres\}

本节介绍如何通过修改 ClickStack OTel collector 配置，将你现有的 PostgreSQL 实例产生的日志发送到 ClickStack。

如果你希望在配置自己的现有环境之前先测试 PostgreSQL 日志集成，可以在["演示数据集"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)一节中使用我们预配置的环境和示例数据进行验证。

##### 前提条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 现有的 PostgreSQL 部署（9.6 或更高版本）
- 对 PostgreSQL 配置文件的修改权限
- 用于日志文件的充足磁盘空间

<VerticalStepper headerLevel="h4">
  #### 配置 PostgreSQL 日志

  PostgreSQL 支持多种日志格式。为了通过 OpenTelemetry 进行结构化解析,我们推荐使用 CSV 格式,该格式可提供一致且易于解析的输出。

  `postgresql.conf` 文件通常位于：

  * **Linux（apt/yum）**：`/etc/postgresql/{version}/main/postgresql.conf`
  * **macOS（Homebrew）**：`/usr/local/var/postgres/postgresql.conf` 或 `/opt/homebrew/var/postgres/postgresql.conf`
  * **Docker**：通常通过环境变量或挂载的配置文件来完成配置

  在 `postgresql.conf` 中添加或修改这些设置:

  ```conf
  # Required for CSV logging
  logging_collector = on
  log_destination = 'csvlog'

  # Recommended: Connection logging
  log_connections = on
  log_disconnections = on

  # Optional: Tune based on your monitoring needs
  #log_min_duration_statement = 1000  # Log queries taking more than 1 second
  #log_statement = 'ddl'               # Log DDL statements (CREATE, ALTER, DROP)
  #log_checkpoints = on                # Log checkpoint activity
  #log_lock_waits = on                 # Log lock contention
  ```

  :::note
  本指南使用 PostgreSQL 的 `csvlog` 格式进行可靠的结构化解析。如果您使用 `stderr` 或 `jsonlog` 格式,需要相应调整 OpenTelemetry 采集器配置。
  :::

  完成上述更改后,重启 PostgreSQL:

  ```bash
  # For systemd
  sudo systemctl restart postgresql

  # For Docker
  docker restart 
  ```

  验证日志正在被写入:

  ```bash
  # Default log location on Linux
  tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log

  # macOS Homebrew
  tail -f /usr/local/var/postgres/log/postgresql-*.log
  ```

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry Collector 的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 `postgres-logs-monitoring.yaml` 的文件,配置如下:

  ```yaml
  receivers:
    filelog/postgres:
      include:
        - /var/lib/postgresql/*/main/log/postgresql-*.csv # Adjust to match your PostgreSQL installation
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

  该配置:

  * 从 PostgreSQL 默认路径读取 CSV 格式日志
  * 支持多行日志记录（错误通常会跨越多行）
  * 解析包含所有 PostgreSQL 标准日志字段的 CSV 格式
  * 提取时间戳以保留日志的原始时间
  * 添加 `source: postgresql` 属性，以便在 HyperDX 中进行筛选
  * 通过专用的 pipeline 将日志转发到 ClickHouse exporter

  :::note

  * 你只需要在自定义配置中定义新的接收器（receivers）和管道（pipelines）
  * 处理器（`memory_limiter`、`transform`、`batch`）和导出器（`clickhouse`）已经在基础 ClickStack 配置中预先定义完毕——只需按名称引用即可
  * `csv_parser` 运算符会将所有标准的 PostgreSQL CSV 日志字段解析为结构化属性
  * 此配置使用 `start_at: end` 来避免在 collector 重启后重新摄取日志。在测试时，可将其改为 `start_at: beginning`，以便立即查看历史日志。
  * 将 `include` 路径修改为与你的 PostgreSQL 日志目录一致
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有 ClickStack 部署中启用自定义采集器配置,您必须:

  1. 将自定义配置文件挂载为 `/etc/otelcol-contrib/custom.config.yaml`
  2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. 将 PostgreSQL 日志目录挂载到采集器中，使其能够读取这些日志

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/lib/postgresql:/var/lib/postgresql:ro
        # ... other volumes ...
  ```

  ##### 选项 2:Docker Run(一体化镜像)

  如果您使用 docker run 运行 all-in-one 镜像:

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/lib/postgresql:/var/lib/postgresql:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  确保 ClickStack 采集器具有读取 PostgreSQL 日志文件的相应权限。在生产环境中,请使用只读挂载(`:ro`)并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 进入搜索视图
  2. 将 source 设置为 Logs
  3. 按 `source:postgresql` 进行筛选以查看 PostgreSQL 特定日志
  4. 你应该会看到结构化的日志记录，其中包含诸如 `user_name`、`database_name`、`error_severity`、`message`、`query` 等字段。

  <Image img={logs_search_view} alt="日志搜索页面" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 PostgreSQL 日志集成的用户，我们提供了一份预生成的、具有真实访问模式的 PostgreSQL 日志示例数据集。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 创建测试采集器配置 \{#test-config\}

创建名为 `postgres-logs-demo.yaml` 的文件，并写入以下配置：

```yaml
cat > postgres-logs-demo.yaml << 'EOF'
receivers:
  filelog/postgres:
    include:
      - /tmp/postgres-demo/postgresql.log
    start_at: beginning  # 为演示数据从文件开头开始读取
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
  clickhouse/clickstack-all-in-one:latest
```

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

在 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录到你的账户（可能需要先创建账户）
2. 进入 Search 视图并将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[时区显示]
HyperDX 会以浏览器本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。使用较宽的时间范围可以确保无论你身在何处都能看到演示日志。在看到日志之后，你可以将范围收窄到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={logs_search_view} alt="日志搜索视图"/>

<Image img={log_view} alt="日志视图"/>

</VerticalStepper>

## 仪表盘和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 PostgreSQL，我们提供了用于 PostgreSQL 日志的基础可视化仪表盘。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预构建的仪表盘 \{#import-dashboard\}

1. 打开 HyperDX 并进入 Dashboards 页面
2. 点击右上角省略号菜单下的 **Import Dashboard**

<Image img={import_dashboard} alt="“Import dashboard” 按钮"/>

3. 上传 `postgresql-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表盘 \{#created-dashboard\}

系统会创建一个已预先配置好所有可视化视图的仪表盘：

<Image img={logs_dashboard} alt="日志仪表盘"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**（可根据您的本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排除 {#troubleshooting}

### 自定义配置未生效

确认环境变量已正确设置：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已经挂载并且可读：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX 中未显示任何日志

检查生效的配置中是否包含你的 `filelog` 接收器：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

检查 collector 日志是否有错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

如果使用演示数据集，请确认可以访问日志文件：

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 后续步骤 {#next-steps}

在完成 PostgreSQL 日志监控配置后：

- 为关键事件（连接失败、慢查询、错误激增）设置[告警](/use-cases/observability/clickstack/alerts)
- 将日志与 [PostgreSQL 指标](/use-cases/observability/clickstack/integrations/postgresql-metrics)进行关联，以实现全面的数据库监控
- 创建自定义仪表盘，用于监控应用特定的查询模式
- 配置 `log_min_duration_statement`，根据你的性能需求识别慢查询

## 投入生产环境 {#going-to-production}

本指南在 ClickStack 内置的 OpenTelemetry Collector 基础上进行扩展，用于快速完成初始配置。对于生产环境部署，我们建议运行您自己的 OTel Collector 实例，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参阅 [Sending OpenTelemetry data](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。