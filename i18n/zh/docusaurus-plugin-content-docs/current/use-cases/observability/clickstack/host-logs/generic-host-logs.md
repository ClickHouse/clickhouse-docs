---
slug: /use-cases/observability/clickstack/integrations/host-logs
title: '使用 ClickStack 监控主机日志'
sidebar_label: '通用主机日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控通用主机日志'
doc_type: 'guide'
keywords: ['主机日志', 'systemd', 'syslog', 'OTEL', 'ClickStack', '系统监控', '服务器日志']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import log_view from '@site/static/images/clickstack/host-logs/log-view.png';
import search_view from '@site/static/images/clickstack/host-logs/search-view.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 使用 ClickStack 监控主机日志 {#host-logs-clickstack}

:::note[TL;DR]
本指南演示如何通过配置 OpenTelemetry collector，从 systemd、内核、SSH、cron 以及其他系统服务收集日志，从而使用 ClickStack 监控主机系统日志。你将学习如何：

- 配置 OTel collector 读取系统日志文件
- 使用你的自定义配置部署 ClickStack
- 使用预构建的仪表盘可视化主机日志（错误、警告、服务活动）的洞察

如果你希望在为生产主机配置之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::



## 与现有主机集成 {#existing-hosts}

本节介绍如何通过修改 ClickStack OTel collector 配置来读取所有系统日志文件(syslog、auth、kernel、daemon 和应用程序日志),从而配置现有主机向 ClickStack 发送系统日志。

如果您希望在配置现有环境之前测试主机日志集成功能,可以使用["演示数据集"](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset)部分提供的预配置环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 具有 syslog 文件的系统
- 具有修改 ClickStack 配置文件的权限

<VerticalStepper headerLevel="h4">

#### 验证 syslog 文件是否存在 {#verify-syslog}

首先,验证系统是否正在写入 syslog 文件:


```bash
# 检查 syslog 文件是否存在（Linux）
ls -la /var/log/syslog /var/log/messages
```


# 在 macOS 上则为
ls -la /var/log/system.log



# 查看最近的日志条目

tail -20 /var/log/syslog

````

常见 syslog 位置：
- **Ubuntu/Debian**：`/var/log/syslog`
- **RHEL/CentOS/Fedora**：`/var/log/messages`
- **macOS**：`/var/log/system.log`

#### 创建自定义 OTel collector 配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。

创建名为 `host-logs-monitoring.yaml` 的文件，包含您系统的配置：

<Tabs groupId="os-type">
<TabItem value="modern-linux" label="现代 Linux（Ubuntu 24.04+）" default>

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout_type: gotime
        layout: '2006-01-02T15:04:05.999999-07:00'

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
````

</TabItem>
<TabItem value="legacy-linux" label="传统 Linux（Ubuntu 20.04、RHEL、CentOS）">

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/syslog
      - /var/log/messages
      - /var/log/**/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: "%b %d %H:%M:%S"

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

</TabItem>
<TabItem value="macos" label="macOS">

```yaml
receivers:
  filelog/syslog:
    include:
      - /var/log/system.log
      - /host/private/var/log/*.log
    start_at: end
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\w+ \d+ \d{2}:\d{2}:\d{2}) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes

      - type: time_parser
        parse_from: attributes.timestamp
        layout: "%b %d %H:%M:%S"

      - type: add
        field: attributes.source
        value: "host-logs"

      - type: add
        field: resource["service.name"]
        value: "host-production"

service:
  pipelines:
    logs/host:
      receivers: [filelog/syslog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

</TabItem>
</Tabs>
<br/>
所有配置均：
- 从标准位置读取 syslog 文件
- 解析 syslog 格式以提取结构化字段（时间戳、主机名、单元/服务、PID、消息）
- 保留原始日志时间戳
- 添加 `source: host-logs` 属性以便在 HyperDX 中进行过滤
- 通过专用管道将日志路由到 ClickHouse 导出器


:::note

- 您只需在自定义配置中定义新的接收器和管道
- 处理器(`memory_limiter`、`transform`、`batch`)和导出器(`clickhouse`)已在 ClickStack 基础配置中定义 - 您只需按名称引用它们即可
- 正则表达式解析器从 syslog 格式中提取 systemd 单元名称、PID 和其他元数据
- 此配置使用 `start_at: end` 以避免在收集器重启时重新摄取日志。对于测试,请更改为 `start_at: beginning` 以立即查看历史日志。
  :::

#### 配置 ClickStack 以加载自定义配置 {#load-custom}

要在现有 ClickStack 部署中启用自定义收集器配置,您必须:

1. 将自定义配置文件挂载到 `/etc/otelcol-contrib/custom.config.yaml`
2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
3. 挂载您的 syslog 目录以便收集器可以读取

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
      - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log:/var/log:ro
      # ... 其他卷 ...
```

##### 选项 2: Docker Run(一体化镜像){#all-in-one}

如果您使用 docker run 运行一体化镜像:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log:/var/log:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack 收集器具有读取 syslog 文件的适当权限。在生产环境中,使用只读挂载(`:ro`)并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}

配置完成后,登录 HyperDX 并验证日志是否正在流入:

1. 导航到搜索视图
2. 将来源设置为日志
3. 按 `source:host-logs` 过滤以查看特定主机的日志
4. 您应该看到包含 `unit`、`hostname`、`pid`、`message` 等字段的结构化日志条目

<Image img={search_view} alt='搜索视图' />
<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试主机日志集成的用户，我们提供了一个预先生成的、具有接近真实模式的系统日志示例数据集。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

该数据集包括：
- 系统启动序列
- SSH 登录活动（成功和失败的尝试）
- 安全事件（暴力破解攻击以及 fail2ban 的响应）
- 计划维护任务（cron 任务、anacron）
- 服务重启（rsyslog）
- 内核消息和防火墙活动
- 正常运行与重要事件的混合

#### 创建测试 collector 配置 {#test-config}

创建一个名为 `host-logs-demo.yaml` 的文件，并使用以下配置：

```yaml
cat > host-logs-demo.yaml << 'EOF'
receivers:
  filelog/journal:
    include:
      - /tmp/host-demo/journal.log
    start_at: beginning
    operators:
      - type: regex_parser
        regex: '^(?P<timestamp>\S+) (?P<hostname>\S+) (?P<unit>\S+?)(?:\[(?P<pid>\d+)\])?: (?P<message>.*)$'
        parse_from: body
        parse_to: attributes
      
      - type: time_parser
        parse_from: attributes.timestamp
        layout: '%Y-%m-%dT%H:%M:%S%z'
      
      - type: add
        field: attributes.source
        value: "host-demo"
      
      - type: add
        field: resource["service.name"]
        value: "host-demo"

service:
  pipelines:
    logs/host-demo:
      receivers: [filelog/journal]
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
  -v "$(pwd)/host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
**这会将日志文件直接挂载到容器中。此操作仅用于使用静态演示数据进行测试。**
:::

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

当 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录你的账户（如果还没有账户，可能需要先创建一个）
2. 进入搜索视图，将来源（source）设置为 `Logs`
3. 将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt="搜索视图"/>
<Image img={log_view} alt="日志视图"/>

:::note[时区显示]
HyperDX 会使用浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**。较宽的时间范围可以确保无论你身处何地都能看到演示日志。看到日志后，你可以将时间范围收窄为 24 小时时段，以获得更清晰的可视化效果。
:::

</VerticalStepper>



## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控主机日志，我们提供了针对系统日志的关键可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建仪表板 {#import-dashboard}

1. 打开 HyperDX 并进入 **Dashboards** 页面
2. 点击右上角省略号图标下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `host-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表板 {#created-dashboard}

仪表板将被创建，并预先配置好所有可视化图表：

<Image img={logs_dashboard} alt="日志仪表板"/>

主要可视化包括：
- 按严重级别统计的日志量随时间变化
- 日志量最高的 systemd 单元
- SSH 登录活动（成功 vs 失败）
- 防火墙活动（已阻止 vs 已允许）
- 安全事件（登录失败、封禁、拦截）
- 服务重启活动

:::note
对于演示数据集，将时间范围设置为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**（根据你的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>



## 疑难解答

### 自定义配置未加载

检查环境变量是否已设置：

```bash
docker exec <容器名称> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载且可读：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```

### HyperDX 中未显示任何日志


**验证 syslog 文件是否存在且正在被写入：**

```bash
# 检查 syslog 是否存在
ls -la /var/log/syslog /var/log/messages
```


# 验证日志是否正在写入

tail -f /var/log/syslog

````

**检查采集器能否读取日志：**
```bash
docker exec <container> cat /var/log/syslog | head -20
````

**检查生效的配置中是否包含你的 filelog 接收器：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**检查 Collector 日志是否有错误：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**如果使用演示数据集，请确认日志文件可访问：**

```bash
docker exec <容器> cat /tmp/host-demo/journal.log | wc -l
```

### 日志解析不正确

**确认你的 syslog 格式与所选配置是否匹配：**


适用于现代 Linux（Ubuntu 24.04 及更高版本）：

```bash
# 应显示 ISO8601 格式:2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```


适用于旧版 Linux 或 macOS：

```bash
# 应显示传统格式：Nov 17 14:16:16
tail -5 /var/log/syslog
# 或
tail -5 /var/log/system.log
```

如果与你使用的格式不符，请在[创建自定义 OTel collector 配置](#custom-otel)部分中选择相应的配置选项卡。


## 后续步骤 {#next-steps}

在完成主机日志监控设置之后：

- 为关键系统事件（服务故障、认证失败、磁盘警告）设置[告警](/use-cases/observability/clickstack/alerts)
- 按特定单元进行过滤以监控特定服务
- 将主机日志与应用日志进行关联，以实现全面的故障排查
- 创建用于安全监控的自定义仪表板（SSH 登录尝试、sudo 使用情况、防火墙拦截）



## 进入生产环境 {#going-to-production}

本指南是在 ClickStack 内置的 OpenTelemetry Collector 之上进行扩展，以便快速完成设置。对于生产环境部署，我们建议运行您自己的 OTel collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参阅 [发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。
