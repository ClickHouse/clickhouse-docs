---
slug: /use-cases/observability/clickstack/integrations/mysql-logs
title: '使用 ClickStack 监控 MySQL 日志'
sidebar_label: 'MySQL 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 MySQL 日志'
doc_type: 'guide'
keywords: ['MySQL', '日志', 'OTEL', 'ClickStack', '数据库监控', '慢查询']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/mysql/search-view.png';
import log_view from '@site/static/images/clickstack/mysql/log-view.png';
import finish_import from '@site/static/images/clickstack/mysql/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/mysql/example-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 MySQL 日志 \{#mysql-logs-clickstack\}

:::note[摘要]
本指南演示如何通过配置 OpenTelemetry collector 来摄取 MySQL 服务器日志，从而使用 ClickStack 监控 MySQL。你将了解如何：

- 配置 MySQL 输出错误日志和慢查询日志
- 为日志摄取创建自定义 OTel collector 配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 MySQL 日志洞察（错误、慢查询、连接）

如果你希望在配置生产环境 MySQL 之前先测试集成，可以使用提供的包含示例日志的演示数据集。

预计耗时：10–15 分钟
:::

## 与现有 MySQL 集成 \{#existing-mysql\}

本节介绍如何通过修改 ClickStack OTel collector 配置，将现有 MySQL 实例的日志发送到 ClickStack。

如果希望在配置自己的现有环境之前先测试 MySQL 日志集成功能，可以在["演示数据集"](/use-cases/observability/clickstack/integrations/mysql-logs#demo-dataset)章节中使用我们预配置的环境和示例数据进行测试。

##### 前提条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 已有的 MySQL 安装（版本 5.7 或更高）
- 具备访问并修改 MySQL 配置文件的权限
- 为日志文件预留的充足磁盘空间

<VerticalStepper headerLevel="h4">
  #### 配置 MySQL 日志

  MySQL 支持多种日志类型。为实现使用 OpenTelemetry 的全面监控,建议启用错误日志和慢查询日志。

  `my.cnf` 或 `my.ini` 配置文件通常位于:

  * **Linux（apt/yum）**：`/etc/mysql/my.cnf` 或 `/etc/my.cnf`
  * **macOS（Homebrew）**：`/usr/local/etc/my.cnf` 或 `/opt/homebrew/etc/my.cnf`
  * **Docker**：通常通过环境变量或挂载的配置文件来完成配置

  在 `[mysqld]` 部分中添加或修改这些设置:

  ```ini
  [mysqld]
  # Error log configuration
  log_error = /var/log/mysql/error.log

  # Slow query log configuration
  slow_query_log = ON
  slow_query_log_file = /var/log/mysql/mysql-slow.log
  long_query_time = 1
  log_queries_not_using_indexes = ON

  # Optional: General query log (verbose, use with caution in production)
  # general_log = ON
  # general_log_file = /var/log/mysql/mysql-general.log
  ```

  :::note
  慢查询日志会捕获执行时间超过 `long_query_time` 秒的查询。请根据应用程序的性能要求调整此阈值。如果设置得过低,会产生过多的日志。
  :::

  完成上述更改后,重启 MySQL:

  ```bash
  # For systemd
  sudo systemctl restart mysql

  # For Docker
  docker restart <mysql-container>
  ```

  验证日志正在被写入:

  ```bash
  # Check error log
  tail -f /var/log/mysql/error.log

  # Check slow query log
  tail -f /var/log/mysql/mysql-slow.log
  ```

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry Collector 的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 `mysql-logs-monitoring.yaml` 的文件,配置如下:

  ```yaml
  receivers:
    filelog/mysql_error:
      include:
        - /var/log/mysql/error.log
      start_at: end
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
          
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-error"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

    filelog/mysql_slow:
      include:
        - /var/log/mysql/mysql-slow.log
      start_at: end
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        
        - type: add
          field: attributes.source
          value: "mysql-slow"
        
        - type: add
          field: resource["service.name"]
          value: "mysql-production"

  service:
    pipelines:
      logs/mysql:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  ```

  该配置:

  * 从 MySQL 的默认位置读取错误日志和慢查询日志
  * 支持多行日志条目（慢查询通常会跨多行）
  * 可解析这两种日志格式，从中提取结构化字段（level、error&#95;code、query&#95;time、rows&#95;examined）
  * 保留日志原始时间戳
  * 添加 `source: mysql-error` 和 `source: mysql-slow` 属性，以便在 HyperDX 中进行过滤
  * 通过专用管道将日志路由到 ClickHouse 导出器

  :::note
  需要两个接收器,因为 MySQL 错误日志和慢查询日志的格式完全不同。`time_parser` 使用 `gotime` 布局来处理 MySQL 的 ISO8601 时间戳格式(包含时区偏移)。
  :::

  #### 配置 ClickStack 加载自定义配置

  要在现有 ClickStack 部署中启用自定义采集器配置,请将自定义配置文件挂载至 `/etc/otelcol-contrib/custom.config.yaml`,并设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`。

  更新您的 ClickStack 部署配置:

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./mysql-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log/mysql:/var/log/mysql:ro
        # ... other volumes ...
  ```

  :::note
  确保 ClickStack 采集器具有读取 MySQL 日志文件的相应权限。使用只读挂载(`:ro`)并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 进入搜索视图
  2. 将 Source 设置为 Logs
  3. 按 `source:mysql-error` 或 `source:mysql-slow` 过滤，以查看特定于 MySQL 的日志
  4. 你应当会看到结构化的日志记录，其中包含 `level`、`error_code`、`message`（针对错误日志）以及 `query_time`、`rows_examined`、`query`（针对慢查询日志）等字段。

  <Image img={search_view} alt="搜索界面" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 MySQL 日志集成的用户，我们提供了一个包含预生成 MySQL 日志的示例数据集，这些日志具有逼真的模式。

<VerticalStepper headerLevel="h4">
  #### 下载示例数据集

  下载示例日志文件:

  ```bash
  # Download error log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/error.log

  # Download slow query log
  curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/mysql/mysql-slow.log
  ```

  该数据集包括:

  * 错误日志记录（启动消息、警告、连接错误、InnoDB 相关消息）
  * 具有真实性能表现特征的慢查询
  * 连接生命周期事件
  * 数据库服务器启动和关闭过程

  #### 创建测试采集器配置

  创建名为 `mysql-logs-demo.yaml` 的文件,配置如下:

  ```yaml
  cat > mysql-logs-demo.yaml << 'EOF'
  receivers:
    filelog/mysql_error:
      include:
        - /tmp/mysql-demo/error.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^(?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}[+-]\d{2}:\d{2})\s+(?P<thread_id>\d+)\s+\[(?P<level>[^\]]+)\]\s+(\[(?P<error_code>[^\]]+)\]\s+)?(?P<message>.*)$'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999-07:00'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-error"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

    filelog/mysql_slow:
      include:
        - /tmp/mysql-demo/mysql-slow.log
      start_at: beginning  # Read from beginning for demo data
      multiline:
        line_start_pattern: '^# Time:'
      operators:
        - type: regex_parser
          parse_from: body
          parse_to: attributes
          regex: '^# Time: (?P<timestamp>\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\n# User@Host: (?P<user>[^\[]+)\[(?P<user_host>[^\]]*)\]\s+@\s+(?P<host>[^\[]*)\[(?P<ip>[^\]]*)\].*\n# Query_time: (?P<query_time>[\d.]+)\s+Lock_time: (?P<lock_time>[\d.]+)\s+Rows_sent: (?P<rows_sent>\d+)\s+Rows_examined: (?P<rows_examined>\d+)'
        - type: time_parser
          parse_from: attributes.timestamp
          layout_type: gotime
          layout: '2006-01-02T15:04:05.999999Z'
          parse_to: body
        - type: add
          field: attributes.source
          value: "mysql-demo-slow"
        - type: add
          field: resource["service.name"]
          value: "mysql-demo"

  service:
    pipelines:
      logs/mysql-demo:
        receivers: [filelog/mysql_error, filelog/mysql_slow]
        processors:
          - memory_limiter
          - transform
          - batch
        exporters:
          - clickhouse
  EOF
  ```

  #### 使用演示配置运行 ClickStack

  使用演示日志和配置运行 ClickStack:

  ```bash
  docker run --name clickstack-demo \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/mysql-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/error.log:/tmp/mysql-demo/error.log:ro" \
    -v "$(pwd)/mysql-slow.log:/tmp/mysql-demo/mysql-slow.log:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### 在 HyperDX 中验证日志

  ClickStack 运行后:

  1. 稍等片刻，让 ClickStack 完成初始化（通常需要 30–60 秒）
  2. 打开 [HyperDX](http://localhost:8080/)，并登录您的账户（如有需要，先创建一个账户）。
  3. 在 Search 视图中，将 Source 设置为 `Logs`
  4. 将时间范围设为 **2025-11-13 00:00:00 - 2025-11-16 00:00:00**
  5. 你应该能看到总共 40 条日志（30 条带有 `source:mysql-demo-error` 的错误日志 + 10 条带有 `source:mysql-demo-slow` 的慢查询）

  :::note
  如果您没有立即看到全部 40 条日志,请等待约一分钟让采集器完成处理。如果等待后日志仍未显示,请运行 `docker restart clickstack-demo` 命令,然后再等待一分钟后检查。这是 OpenTelemetry filelog 接收器在使用 `start_at: beginning` 批量加载已存在文件时的已知问题。生产环境部署使用 `start_at: end` 配置时会实时处理写入的日志,不会出现此问题。
  :::

  <Image img={search_view} alt="搜索视图" />

  <Image img={log_view} alt="日志视图" />

  :::note[时区显示]
  HyperDX 会以您浏览器的本地时区显示时间戳。演示数据的时间跨度为 **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)**。较宽的时间范围可确保您无论身处何地都能看到演示日志。查看日志后,您可以将时间范围缩小至 24 小时,以获得更清晰的可视化效果。
  :::
</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 MySQL，我们提供了用于 MySQL 日志的关键可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/mysql-logs-dashboard.json')} download="mysql-logs-dashboard.json" eventName="docs.mysql_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并导航到 Dashboards 部分
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `mysql-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表板 {#created-dashboard}

系统会创建一个仪表板，并预先配置好所有可视化图表。

<Image img={example_dashboard} alt="示例仪表板"/>

:::note
对于演示数据集，将时间范围设置为 **2025-11-14 00:00:00 - 2025-11-15 00:00:00 (UTC)**（根据你的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未生效

确认已设置环境变量：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载并可读：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX 中未显示任何日志

检查实际生效的配置中是否包含 filelog receiver：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

检查采集器日志中是否存在错误：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i mysql
```

如果使用演示数据集，请确保日志文件是可访问的：

```bash
docker exec <container> cat /tmp/mysql-demo/error.log | wc -l
docker exec <container> cat /tmp/mysql-demo/mysql-slow.log | wc -l
```


### 慢查询日志未出现

确认在 MySQL 中已启用慢查询日志：

```sql
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';
```

检查 MySQL 是否正在写入慢查询日志：

```bash
tail -f /var/log/mysql/mysql-slow.log
```

生成一条用于测试的慢查询：

```sql
SELECT SLEEP(2);
```


### 日志未正确解析

请确认您的 MySQL 日志格式与预期格式一致。本指南中的正则表达式模式是针对 MySQL 5.7+ 和 8.0+ 默认格式设计的。

检查错误日志中的几行示例：

```bash
head -5 /var/log/mysql/error.log
```

期望的格式：

```text
2025-11-14T10:23:45.123456+00:00 0 [System] [MY-010116] [Server] /usr/sbin/mysqld (mysqld 8.0.35) starting as process 1
```

如果格式存在较大差异，请在配置中相应调整正则表达式模式。


## 后续步骤 {#next-steps}

在完成 MySQL 日志监控配置后：

- 为关键事件（连接失败、超过阈值的慢查询、错误激增）设置[告警](/use-cases/observability/clickstack/alerts)
- 按查询模式创建自定义仪表板，用于慢查询分析
- 根据实际观测到的查询性能特征调优 `long_query_time`

## 进入生产环境 {#going-to-production}

本指南在 ClickStack 内置的 OpenTelemetry Collector 基础上，实现快速上手配置。对于生产环境部署，建议自行运行 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。生产环境配置请参阅[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。