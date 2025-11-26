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

:::note[TL;DR]
本指南将演示如何通过配置 OpenTelemetry collector 来摄取 PostgreSQL 服务器日志，从而使用 ClickStack 监控 PostgreSQL。你将学到如何：

- 配置 PostgreSQL 以 CSV 格式输出日志，以便进行结构化解析
- 为日志摄取创建自定义 OTel collector 配置
- 使用你的自定义配置部署 ClickStack
- 使用预构建的仪表板来可视化 PostgreSQL 日志洞察（错误、慢查询、连接）

如果你希望在为生产环境 PostgreSQL 做配置之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：10–15 分钟
:::



## 与现有 PostgreSQL 集成 {#existing-postgres}

本节介绍如何通过修改 ClickStack OTel collector 配置，将现有 PostgreSQL 安装的日志发送到 ClickStack。

如果您希望在配置自己的现有环境之前测试 PostgreSQL 日志集成，可以使用["演示数据集"](/use-cases/observability/clickstack/integrations/postgresql-logs#demo-dataset)部分中的预配置环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 现有 PostgreSQL 安装（版本 9.6 或更高）
- 具有修改 PostgreSQL 配置文件的权限
- 足够的磁盘空间用于存储日志文件

<VerticalStepper headerLevel="h4">

#### 配置 PostgreSQL 日志记录 {#configure-postgres}

PostgreSQL 支持多种日志格式。为了使用 OpenTelemetry 进行结构化解析，我们推荐使用 CSV 格式，该格式可提供一致且易于解析的输出。

`postgresql.conf` 文件通常位于：

- **Linux (apt/yum)**：`/etc/postgresql/{version}/main/postgresql.conf`
- **macOS (Homebrew)**：`/usr/local/var/postgres/postgresql.conf` 或 `/opt/homebrew/var/postgres/postgresql.conf`
- **Docker**：配置通常通过环境变量或挂载的配置文件设置

在 `postgresql.conf` 中添加或修改以下设置：


```conf
# CSV 日志记录所需配置
logging_collector = on
log_destination = 'csvlog'
```


# 建议：启用连接日志
log_connections = on
log_disconnections = on



# 可选：根据监控需求进行调优

#log&#95;min&#95;duration&#95;statement = 1000  # 记录耗时超过 1 秒的查询
#log&#95;statement = &#39;ddl&#39;               # 记录 DDL 语句（CREATE、ALTER、DROP）
#log&#95;checkpoints = on                # 记录 checkpoint 活动
#log&#95;lock&#95;waits = on                 # 记录锁等待与竞争情况

```

:::note
本指南使用 PostgreSQL 的 `csvlog` 格式进行可靠的结构化解析。如果您使用 `stderr` 或 `jsonlog` 格式,需要相应调整 OpenTelemetry 采集器配置。
:::

完成上述更改后,重启 PostgreSQL:
```


```bash
# 对于 systemd
sudo systemctl restart postgresql
```


# 在 Docker 中

docker restart

```

确认日志正在写入：
```


```bash
# Linux 默认日志路径
tail -f /var/lib/postgresql/{version}/main/log/postgresql-*.log
```


# macOS Homebrew

tail -f /usr/local/var/postgres/log/postgresql-*.log

````

#### 创建自定义 OTel collector 配置               

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置合并。

创建名为 `postgres-logs-monitoring.yaml` 的文件,包含以下配置:

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

此配置：

* 从 PostgreSQL CSV 日志的默认位置读取日志
* 处理多行日志记录（错误信息通常会跨多行）
* 解析包含所有标准 PostgreSQL 日志字段的 CSV 格式
* 提取时间戳以保留原始日志时间
* 添加 `source: postgresql` 属性，便于在 HyperDX 中进行过滤
* 通过专用的 pipeline 将日志路由到 ClickHouse exporter

:::note

* 在自定义配置中你只需定义新的 receivers 和 pipelines
* processors（`memory_limiter`、`transform`、`batch`）和 exporters（`clickhouse`）已经在基础 ClickStack 配置中定义好——你只需要按名称引用它们
* `csv_parser` operator 会将所有标准 PostgreSQL CSV 日志字段提取为结构化属性
* 此配置使用 `start_at: end` 来避免在 collector 重启时重新摄取日志。用于测试时，将其更改为 `start_at: beginning` 以便立即查看历史日志。
* 调整 `include` 路径以匹配你的 PostgreSQL 日志目录位置
  :::

#### 配置 ClickStack 加载自定义配置

要在现有 ClickStack 部署中启用自定义 collector 配置，你必须：

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 挂载你的 PostgreSQL 日志目录，以便 collector 可以读取这些日志

##### 选项 1：Docker Compose

更新你的 ClickStack 部署配置：

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

##### 选项 2：Docker Run（一体化镜像）

如果你使用 `docker run` 运行一体化镜像：

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/postgres-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/lib/postgresql:/var/lib/postgresql:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack collector 拥有读取 PostgreSQL 日志文件的适当权限。在生产环境中，请使用只读挂载（`:ro`），并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志


配置完成后,登录 HyperDX 并验证日志是否正常流入:

1. 进入搜索视图
2. 将数据源设置为 Logs
3. 使用 `source:postgresql` 过滤以查看 PostgreSQL 相关日志
4. 您应该能看到包含 `user_name`、`database_name`、`error_severity`、`message`、`query` 等字段的结构化日志条目

<Image img={logs_search_view} alt='日志搜索视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 PostgreSQL 日志集成的用户，我们提供了一个预生成的 PostgreSQL 日志示例数据集，其模式接近真实生产环境。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/postgres/postgresql.log
```

#### 创建测试 Collector 配置 {#test-config}

创建一个名为 `postgres-logs-demo.yaml` 的文件，并写入以下配置：

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

在 ClickStack 启动并运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录你的账户（如有需要，先创建一个账户）
2. 进入搜索视图，将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-11-09 00:00:00 - 2025-11-12 00:00:00**

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**。设置较宽的时间范围可以确保你在任何地区都能看到演示日志。确认看到日志后，你可以将范围收窄到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={logs_search_view} alt="日志搜索视图"/>

<Image img={log_view} alt="日志视图"/>

</VerticalStepper>



## 仪表盘和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 PostgreSQL，我们提供了用于 PostgreSQL 日志的基础可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/postgres-logs-dashboard.json')} download="postgresql-logs-dashboard.json" eventName="docs.postgres_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预构建的仪表盘 {#import-dashboard}

1. 打开 HyperDX 并进入 Dashboards 页面
2. 点击右上角省略号菜单中的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard 按钮"/>

3. 上传 `postgresql-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表盘 {#created-dashboard}

该仪表盘会自动创建，其中的所有可视化图表都会预先配置好：

<Image img={logs_dashboard} alt="日志仪表盘"/>

:::note
对于示例数据集，将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-11 00:00:00 (UTC)**（可根据你的本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

</VerticalStepper>



## 故障排查

### 自定义配置未加载

确认已设置环境变量：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载并可读取：

```bash
docker exec <容器名称> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### 在 HyperDX 中未显示日志

检查生效的配置中是否包含你的 filelog 接收器：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

检查采集器日志是否存在错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i postgres
```

如果使用演示数据集，请确认日志文件可访问：

```bash
docker exec <container> cat /tmp/postgres-demo/postgresql.log | wc -l
```


## 后续步骤 {#next-steps}

完成 PostgreSQL 日志监控配置后：

- 为关键事件（连接失败、慢查询、错误激增）设置[告警](/use-cases/observability/clickstack/alerts)
- 将日志与 [PostgreSQL 指标](/use-cases/observability/clickstack/integrations/postgresql-metrics)进行关联，实现全面的数据库监控
- 为应用特定的查询模式创建自定义看板
- 配置 `log_min_duration_statement`，以识别满足您性能要求的慢查询



## 迁移到生产环境 {#going-to-production}

本指南在 ClickStack 内置的 OpenTelemetry Collector 基础上进行扩展，以便快速完成搭建。对于生产环境部署，我们建议运行您自己的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参见[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
