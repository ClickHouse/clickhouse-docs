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
本指南介绍如何通过配置 OpenTelemetry 采集器来采集 Redis 服务器日志,从而使用 ClickStack 监控 Redis。您将学习如何:

- 配置 OTel 采集器以解析 Redis 日志格式
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 Redis 指标(连接、命令、内存、错误)

如果您想在配置生产环境 Redis 之前测试集成功能,可以使用包含示例日志的演示数据集。

所需时间:5-10 分钟
:::


## 与现有 Redis 集成 {#existing-redis}

本节介绍如何通过修改 ClickStack OTel 收集器配置,将现有 Redis 安装的日志发送到 ClickStack。
如果您想在配置现有环境之前测试 Redis 集成,可以使用["演示数据集"](/use-cases/observability/clickstack/integrations/redis#demo-dataset)部分中预配置的环境和示例数据进行测试。

### 前置条件 {#prerequisites}

- ClickStack 实例正在运行
- 现有 Redis 安装(版本 3.0 或更高版本)
- 可访问 Redis 日志文件

<VerticalStepper headerLevel="h4">

#### 验证 Redis 日志配置 {#verify-redis}

首先,检查 Redis 日志配置。连接到 Redis 并查看日志文件位置:

```bash
redis-cli CONFIG GET logfile
```

常见 Redis 日志位置:

- **Linux (apt/yum)**: `/var/log/redis/redis-server.log`
- **macOS (Homebrew)**: `/usr/local/var/log/redis.log`
- **Docker**: 通常输出到 stdout,但可以配置为写入 `/data/redis.log`

如果 Redis 正在输出日志到 stdout,请通过更新 `redis.conf` 将其配置为写入文件:


```bash
# 将日志记录到文件而非标准输出
logfile /var/log/redis/redis-server.log
```


# 设置日志级别（可选值：debug、verbose、notice、warning）

loglevel notice

```

修改配置后,重启 Redis:
```


```bash
# 对于 systemd
sudo systemctl restart redis
```


# 针对 Docker

docker restart <redis-container>

````

#### 创建自定义 OTel 收集器配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置合并。

创建一个名为 `redis-monitoring.yaml` 的文件,包含以下配置:
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

此配置:

- 从标准位置读取 Redis 日志
- 使用正则表达式解析 Redis 日志格式,提取结构化字段(`pid`、`role`、`timestamp`、`log_level`、`message`)
- 添加 `source: redis` 属性以便在 HyperDX 中进行过滤
- 通过专用管道将日志路由到 ClickHouse 导出器

:::note

- 您只需在自定义配置中定义新的接收器和管道
- 处理器(`memory_limiter`、`transform`、`batch`)和导出器(`clickhouse`)已在基础 ClickStack 配置中定义 - 您只需按名称引用它们即可
- `time_parser` 操作符从 Redis 日志中提取时间戳以保留原始日志时间
- 此配置使用 `start_at: beginning` 在收集器启动时读取所有现有日志,使您能够立即看到日志。对于生产部署,如果您希望避免在收集器重启时重新采集日志,请更改为 `start_at: end`。
  :::

#### 配置 ClickStack 加载自定义配置 {#load-custom}

要在现有 ClickStack 部署中启用自定义收集器配置,您必须:

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 挂载您的 Redis 日志目录以便收集器可以读取

##### 选项 1: Docker Compose {#docker-compose}

更新您的 ClickStack 部署配置:

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/redis:/var/log/redis:ro
      # ... other volumes ...
```

##### 选项 2: Docker Run(一体化镜像){#all-in-one}

如果您使用 docker 的一体化镜像,请运行:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/redis:/var/log/redis:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack 收集器具有读取 Redis 日志文件的适当权限。在生产环境中,使用只读挂载(`:ro`)并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}

配置完成后,登录 HyperDX 并验证日志是否正常流入:

<Image img={log_view} alt='日志视图' />

<Image img={log} alt='日志' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 Redis 集成的用户,我们提供了一个预生成的 Redis 日志样本数据集,其中包含真实的日志模式。

<VerticalStepper headerLevel="h4">

#### 下载样本数据集 {#download-sample}

下载样本日志文件:

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/redis/redis-server.log
```

#### 创建测试采集器配置 {#test-config}

创建一个名为 `redis-demo.yaml` 的文件,包含以下配置:

```yaml
cat > redis-demo.yaml << 'EOF'
receivers:
  filelog/redis:
    include:
      - /tmp/redis-demo/redis-server.log
    start_at: beginning  # 从头开始读取演示数据
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

使用演示日志和配置运行 ClickStack:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/redis-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/redis-server.log:/tmp/redis-demo/redis-server.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**此操作会将日志文件直接挂载到容器中。这是为了使用静态演示数据进行测试。**
:::


## 在 HyperDX 中验证日志 {#verify-demo-logs}

ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户（可能需要先创建账户）
2. 导航到搜索视图，将数据源设置为 `Logs`
3. 将时间范围设置为 **2025-10-26 10:00:00 - 2025-10-29 10:00:00**

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间跨度为 **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**。较宽的时间范围可确保无论您身处何地都能看到演示日志。看到日志后，可以将范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={log_view} alt='日志视图' />

<Image img={log} alt='日志' />

</VerticalStepper>


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 Redis,我们提供了 Redis 日志的基础可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/redis-logs-dashboard.json')} download="redis-logs-dashboard.json" eventName="docs.redis_logs_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 {#download}

#### 导入预构建仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分。
2. 点击右上角省略号下的"Import Dashboard"。

<Image img={import_dashboard} alt='导入仪表板' />

3. 上传 redis-logs-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt='完成导入' />

#### 仪表板将被创建并预配置所有可视化内容 {#created-dashboard}

:::note
对于演示数据集,请将时间范围设置为 **2025-10-27 10:00:00 - 2025-10-28 10:00:00 (UTC)**(根据您的本地时区进行调整)。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt='示例仪表板' />

</VerticalStepper>


## 故障排查 {#troubleshooting}

### 自定义配置未加载 {#troubleshooting-not-loading}


**确认环境变量是否已正确设置：**

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
# 预期输出：/etc/otelcol-contrib/custom.config.yaml
```


**检查自定义配置文件是否已成功挂载：**

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# 预期输出：应显示文件大小和权限
```


**查看自定义配置内容：**

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# 应显示您的 redis-monitoring.yaml 文件内容
```


**检查有效配置中是否包含您的 filelog 接收器：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
# 应显示您的 filelog/redis 接收器配置
```

### HyperDX 中未显示日志 {#no-logs}


**确保 Redis 将日志写入文件：**

```bash
redis-cli CONFIG GET logfile
# 预期输出：应显示文件路径,而不是空字符串
# 示例:1) "logfile" 2) "/var/log/redis/redis-server.log"
```


**检查 Redis 是否正在写入日志：**

```bash
tail -f /var/log/redis/redis-server.log
# 应显示 Redis 格式的最新日志条目
```


**验证采集器是否能读取日志：**

```bash
docker exec <container> cat /var/log/redis/redis-server.log
# 应显示 Redis 日志条目
```


**检查采集器日志中的错误：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log
# 查找与 filelog 或 Redis 相关的错误消息
```


**如果使用 docker-compose，请验证共享卷：**

```bash
# 检查两个容器是否使用同一个卷
docker volume inspect <volume-name>
# 验证两个容器是否都已挂载该卷
```

### 日志解析不正确 {#logs-not-parsing}


**验证 Redis 日志格式是否符合预期格式：**

```bash
# Redis 日志应如下所示：
# 12345:M 28 Oct 2024 14:23:45.123 * Server started
tail -5 /var/log/redis/redis-server.log
```

如果你的 Redis 日志采用的是其他格式，则可能需要调整 `regex_parser` 算子中的正则表达式模式。标准格式为：

* `pid:role timestamp level message`
* 示例：`12345:M 28 Oct 2024 14:23:45.123 * Server started`


## 后续步骤 {#next-steps}

如果您想进一步探索,以下是一些可以在仪表板上进行实验的后续步骤:

- 为关键指标(错误率、延迟阈值)设置[告警](/use-cases/observability/clickstack/alerts)
- 针对特定用例(API 监控、安全事件)创建额外的[仪表板](/use-cases/observability/clickstack/dashboards)
