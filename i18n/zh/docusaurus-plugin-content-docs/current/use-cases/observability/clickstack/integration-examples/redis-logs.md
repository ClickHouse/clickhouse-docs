---
slug: /use-cases/observability/clickstack/integrations/redis
title: '使用 ClickStack 监控 Redis 日志'
sidebar_label: 'Redis 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Redis 日志'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/redis/redis-import-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/redis/redis-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/redis/redis-log-view.png';
import log from '@site/static/images/clickstack/redis/redis-log.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Redis 日志 {#redis-clickstack}

:::note[TL;DR]
本指南演示如何通过配置 OpenTelemetry collector 摄取 Redis 服务器日志，从而使用 ClickStack 监控 Redis。你将学习如何：

- 配置 OTel collector 以解析 Redis 日志格式
- 使用自定义配置部署 ClickStack
- 使用预构建仪表板可视化 Redis 指标（连接数、命令、内存、错误）

如果你想在为生产环境中的 Redis 配置之前先测试集成，可先使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::



## 集成现有的 Redis 实例 {#existing-redis}

本节介绍如何通过修改 ClickStack 的 OTel collector 配置，使现有的 Redis 实例将日志发送到 ClickStack。
如果希望在配置自己的现有环境之前先测试 Redis 集成功能，可以在“[Demo dataset](/use-cases/observability/clickstack/integrations/redis#demo-dataset)”部分使用我们预先配置的环境和示例数据进行测试。

### 前提条件 {#prerequisites}

- 已有正在运行的 ClickStack 实例
- 已部署的 Redis（版本 3.0 或更高）
- 对 Redis 日志文件的访问权限

<VerticalStepper headerLevel="h4">

#### 验证 Redis 日志配置 {#verify-redis}

首先检查 Redis 的日志配置。连接到 Redis 并查看日志文件的位置：

```bash
redis-cli CONFIG GET logfile
```

常见的 Redis 日志文件位置：

- **Linux（apt/yum 安装）**：`/var/log/redis/redis-server.log`
- **macOS（Homebrew 安装）**：`/usr/local/var/log/redis.log`
- **Docker**：通常会输出到 stdout，但也可以配置为写入 `/data/redis.log`

如果 Redis 当前将日志输出到 stdout，可通过修改 `redis.conf` 将其配置为写入文件：


```bash
# 将日志输出到文件，而不是 stdout
logfile /var/log/redis/redis-server.log
```


# 设置日志级别（可选值：debug、verbose、notice、warning）

loglevel notice

```

修改配置后，重新启动 Redis：
```


```bash
# 适用于 systemd 的系统
sudo systemctl restart redis
```


# 适用于 Docker

docker restart <redis-container>

````

#### 创建自定义 OTel collector 配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置会通过 OpAMP 与由 HyperDX 管理的基础配置进行合并。

创建一个名为 `redis-monitoring.yaml` 的文件，并填入以下配置：
```yaml
receivers:
  filelog/redis:
    include:
      - /var/log/redis/redis-server.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P\d+):(?P\w+) (?P\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P[.\-*#]) (?P.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'

      - type: add
        field: attributes.source
        value: "redis"

      - type: add
        field: resource["service.name"]
        value: "redis-production"

service:
  pipelines:
    logs/redis:
      receivers: [filelog/redis]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
````

该配置将：

- 从默认路径读取 Redis 日志
- 使用正则表达式解析 Redis 日志格式，从中提取结构化字段（`pid`、`role`、`timestamp`、`log_level`、`message`）
- 添加 `source: redis` 属性，以便在 HyperDX 中进行筛选
- 通过独立的 pipeline 将日志路由到 ClickHouse exporter

:::note

- 您只需在自定义配置中定义新的 receiver 和 pipeline
- 处理器（`memory_limiter`、`transform`、`batch`）和 exporter（`clickhouse`）已在 ClickStack 的基础配置中定义——您只需要按名称引用它们
- `time_parser` 操作符会从 Redis 日志中提取时间戳，以保留原始日志时间
- 此配置使用 `start_at: beginning`，在 collector 启动时读取所有已有日志，使您能够立即看到日志。对于生产环境部署，如果希望在 collector 重启时避免重新摄取历史日志，请将其改为 `start_at: end`。
  :::

#### 配置 ClickStack 加载自定义配置 {#load-custom}

要在现有的 ClickStack 部署中启用自定义 collector 配置，您需要：

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 挂载 Redis 日志目录，使 collector 能够读取这些日志

##### 选项 1：Docker Compose {#docker-compose}

更新您的 ClickStack 部署配置：

```yaml
services:
  clickstack:
    # ... 现有配置 ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... 其他环境变量 ...
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/redis:/var/log/redis:ro
      # ... 其他挂载卷 ...
```

##### 选项 2：Docker Run（All-in-One 镜像）{#all-in-one}

如果您使用的是 Docker 的 all-in-one 镜像，请运行：

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack collector 具有读取 Redis 日志文件的适当权限。在生产环境中，请使用只读挂载（`:ro`），并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}

完成配置后，登录 HyperDX 并验证日志是否已经开始流入：

<Image img={log_view} alt='日志视图' />

<Image img={log} alt='日志' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 Redis 集成的用户，我们提供了一份预生成的 Redis 日志示例数据集，其日志模式贴近真实场景。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### 创建测试收集器配置 {#test-config}

创建一个名为 `redis-demo.yaml` 的文件，并写入以下配置：

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # Read from beginning for demo data
    operators:
      - type: regex_parser
        regex: '^(?P<pid>\d+):(?P<role>\w+) (?P<timestamp>\d{2} \w+ \d{4} \d{2}:\d{2}:\d{2})\.\d+ (?P<log_level>[.\-*#]) (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%d %b %Y %H:%M:%S'

      - type: add
        field: attributes.source
        value: "redis-demo"

      - type: add
        field: resource["service.name"]
        value: "redis-demo"

service:
  pipelines:
    logs/redis-demo:
      receivers: [filelog/redis]
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
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**这会将日志文件直接挂载到容器中。此操作仅用于使用静态演示数据进行测试。**
:::


## 在 HyperDX 中验证日志 {#verify-demo-logs}

当 ClickStack 启动并运行后：

1. 打开 [HyperDX](http://localhost:8080/)，登录到你的账户（可能需要先创建账户）
2. 转到 “Search” 视图，并将来源（source）设置为 `Logs`
3. 将时间范围设置为 **2025-10-26 10:00:00 - 2025-10-29 10:00:00**

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-10-27 10:00:00 - 2025-10-28 10:00:00（UTC）**。设置较宽的时间范围可以确保无论你位于哪个时区，都能看到演示日志。看到日志后，你可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={log_view} alt='日志视图' />

<Image img={log} alt='日志' />

</VerticalStepper>


## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 Redis，我们为 Redis 日志提供了关键的可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX，并导航到 Dashboards 部分。
2. 在右上角的省略号菜单中点击 "Import Dashboard"。

<Image img={import_dashboard} alt="导入仪表板"/>

3. 上传 redis-logs-dashboard.json 文件，然后点击 Finish Import 完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 仪表板将自动创建，并包含预先配置好的全部可视化图表 {#created-dashboard}

:::note
对于演示数据集，将时间范围设置为 **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**（可根据本地时区调整）。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表板"/>

</VerticalStepper>



## 故障排除 {#troubleshooting}

### 自定义配置未生效 {#troubleshooting-not-loading}



**验证环境变量是否已正确设置：**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# 预期输出为：/etc/otelcol-contrib/custom.config.yaml
```


**验证是否已挂载自定义配置文件：**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# 预期输出：应显示文件大小和权限信息
```


**查看自定义配置内容：**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# 应该显示 redis-monitoring.yaml 文件的内容
```


**检查生效的配置中是否包含你的 filelog 接收器：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# 这里应当显示你所配置的 filelog/redis 接收器
```

### 在 HyperDX 中未显示日志


**确保 Redis 将日志写入文件：**

```bash
redis-cli CONFIG GET logfile
# 预期输出：应当显示一个文件路径，而不是空字符串
# 示例：1) "logfile" 2) "/var/log/redis/redis-server.log"
```


**检查 Redis 是否正在输出日志：**

```bash
tail -f /var/log/redis/redis-server.log
# 应以 Redis 格式显示最近的日志记录
```


**验证收集器能否读取日志：**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# 应显示 Redis 日志记录
```


**检查采集器日志中是否存在错误：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# 查找与 filelog 或 Redis 相关的错误信息
```


**如果使用 docker-compose，请检查共享卷：**

```bash
# 检查两个容器是否使用同一个卷
docker volume inspect <volume-name>
# 验证两个容器都已挂载该卷
```

### 日志未正确解析


**验证 Redis 日志格式是否符合预期格式：**

```bash
# Redis 日志应类似如下所示：
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

如果 Redis 日志的格式不同，你可能需要调整 `regex_parser` 运算符中的正则表达式模式。标准格式为：

* `pid:role timestamp level message`
* 示例：`12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 后续步骤 {#next-steps}

如果你想进一步探索，可以尝试以下几项仪表板相关操作：

- 为关键指标（错误率、延迟阈值）设置[告警](/use-cases/observability/clickstack/alerts)
- 为特定使用场景（API 监控、安全事件）创建额外的[仪表板](/use-cases/observability/clickstack/dashboards)
