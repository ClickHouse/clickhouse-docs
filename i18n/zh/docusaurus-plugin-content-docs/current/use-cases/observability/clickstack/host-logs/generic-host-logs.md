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
本指南介绍如何通过配置 OpenTelemetry collector，从 systemd、内核、SSH、cron 以及其他系统服务收集日志，从而使用 ClickStack 监控主机系统日志。主要内容包括：

- 配置 OTel collector 读取系统日志文件
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表盘可视化主机日志中的关键信息（错误、警告、服务活动）

如果希望在为生产主机配置之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::

## 与现有主机集成 {#existing-hosts}

本节介绍如何通过修改 ClickStack OTel collector 的配置，使其读取所有系统日志文件（包括 syslog、auth、kernel、daemon 以及应用程序日志），从而将您现有主机的系统日志发送到 ClickStack。

如果您希望在配置自己的现有环境之前先测试主机日志集成，可以在「[演示数据集](/use-cases/observability/clickstack/integrations/host-logs#demo-dataset)」一节中使用我们预配置的环境和示例数据进行测试。

##### 前置条件 {#prerequisites}

- 正在运行的 ClickStack 实例
- 带有 syslog 文件的系统
- 具有访问并修改 ClickStack 配置文件的权限

<VerticalStepper headerLevel="h4">
  #### 验证 syslog 文件是否存在

  首先,验证系统是否正在写入 syslog 文件:

  ```bash
  # 检查 syslog 文件是否存在（Linux）
  ls -la /var/log/syslog /var/log/messages

  # 或者在 macOS 上
  ls -la /var/log/system.log

  # 查看最近的日志条目
  tail -20 /var/log/syslog
  ```

  常见 syslog 位置：

  * **Ubuntu/Debian**：`/var/log/syslog`
  * **RHEL/CentOS/Fedora**：`/var/log/messages`
  * **macOS**：`/var/log/system.log`

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件和设置环境变量来扩展基础 OpenTelemetry Collector 配置。

  创建名为 `host-logs-monitoring.yaml` 的文件,包含系统配置:

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
      ```
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
              layout: '%b %d %H:%M:%S'
            
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
              layout: '%b %d %H:%M:%S'
            
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

  <br />

  所有配置：

  * 从默认位置读取 syslog 文件
  * 解析 syslog 格式，以提取结构化字段（时间戳、主机名、单元/服务、PID、消息）
  * 保留日志的原始时间戳
  * 在 HyperDX 中添加 `source: host-logs` 属性以便进行过滤
  * 通过专用 pipeline 将日志路由到 ClickHouse 导出器

  :::note

  * 你只需要在自定义配置中定义新的 receiver 和 pipeline
  * 处理器（`memory_limiter`、`transform`、`batch`）和导出器（`clickhouse`）已在 ClickStack 的基础配置中预先定义好——你只需按名称引用它们即可
  * 该正则表达式解析器会从 syslog 格式中提取 systemd 单元名、PID 以及其他元数据。
  * 此配置使用 `start_at: end`，以避免在 collector 重启后重新摄取日志。测试时，可将其改为 `start_at: beginning`，以便立即查看历史日志。
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有的 ClickStack 部署中启用自定义采集器配置，您必须：

  1. 将自定义配置文件挂载为 `/etc/otelcol-contrib/custom.config.yaml`
  2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. 将你的 syslog 目录挂载到容器中，以便采集器能够读取这些日志

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
        # ... other environment variables ...
      volumes:
        - ./host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - /var/log:/var/log:ro
        # ... other volumes ...
  ```

  ##### 选项 2:Docker Run(一体化镜像)

  如果您使用 docker run 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/host-logs-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log:/var/log:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  确保 ClickStack 采集器具有读取 syslog 文件的相应权限。在生产环境中,请使用只读挂载(`:ro`)并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 进入搜索视图
  2. 将 Source 设置为“Logs”
  3. 按 `source:host-logs` 过滤以查看主机级日志
  4. 可以看到结构化的日志条目，其中包含 `unit`、`hostname`、`pid`、`message` 等字段。

  <Image img={search_view} alt="搜索界面" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试主机日志集成的用户，我们提供了一个预生成的系统日志示例数据集，具有接近真实环境的日志模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

该数据集包括：
- 系统启动序列
- SSH 登录活动（成功与失败尝试）
- 安全事件（暴力破解攻击以及 fail2ban 响应）
- 计划性维护任务（cron 作业、anacron）
- 服务重启（rsyslog）
- 内核消息和防火墙活动
- 既包含正常运行日志，也包含重要事件

#### 创建测试 collector 配置 {#test-config}

创建一个名为 `host-logs-demo.yaml` 的文件，并写入以下配置：

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

在 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录到您的账户（如果还没有账户，可能需要先创建一个）
2. 导航到 Search 视图，并将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-13 00:00:00**

<Image img={search_view} alt="搜索视图"/>
<Image img={log_view} alt="日志视图"/>

:::note[时区显示]
HyperDX 会按照浏览器本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**。使用较宽的时间范围可以确保无论您所在的时区如何，都能看到演示日志。在确认能看到日志后，可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控主机日志，我们提供了系统日志的关键可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.host_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到 **Dashboards** 部分
2. 点击右上角省略号菜单中的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard button"/>

3. 上传 `host-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### 查看仪表板 {#created-dashboard}

系统会创建仪表板，并预先配置好所有可视化图表：

<Image img={logs_dashboard} alt="Logs dashboard"/>

关键可视化包括：
- 按严重级别划分的日志量随时间变化情况
- 生成日志最多的 systemd 单元
- SSH 登录活动（成功 vs 失败）
- 防火墙活动（阻止 vs 允许）
- 安全事件（登录失败、封禁、拦截）
- 服务重启活动

:::note
对于演示数据集，请将时间范围设置为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**（并根据你的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未生效

确认环境变量已设置：

```bash
docker exec <容器名称> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否已挂载并可读：

```bash
docker exec <容器名称> cat /etc/otelcol-contrib/custom.config.yaml | head -10
```


### HyperDX 中没有日志显示

**验证 syslog 文件是否存在且正在被写入：**

```bash
# 检查 syslog 是否存在
ls -la /var/log/syslog /var/log/messages

# 验证日志是否正在写入
tail -f /var/log/syslog
```

**验证 Collector 是否能读取日志：**

```bash
docker exec <container> cat /var/log/syslog | head -20
```

**检查生效的配置中是否包含 filelog 接收器：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 filelog
```

**检查 collector 日志中是否存在错误：**

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i "filelog\|syslog"
```

**如果使用演示数据集，请检查日志文件是否可访问：**

```bash
docker exec <container> cat /tmp/host-demo/journal.log | wc -l
```


### 日志解析不正确

**请确认您的 syslog 格式与所选配置一致：**

适用于现代 Linux（Ubuntu 24.04 及更高版本）：

```bash
# 应显示 ISO8601 格式:2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

适用于旧版 Linux 或 macOS 系统：

```bash
# 应显示传统格式：Nov 17 14:16:16
tail -5 /var/log/syslog
# 或者
tail -5 /var/log/system.log
```

如果你的格式不同，请在[创建自定义 OTel collector 配置](#custom-otel)章节中选择相应的配置选项卡。


## 后续步骤 {#next-steps}

在完成主机日志监控设置之后：

- 为关键系统事件（服务故障、身份验证失败、磁盘告警）配置[告警](/use-cases/observability/clickstack/alerts)
- 按特定单元进行过滤，以监控特定服务
- 将主机日志与应用日志进行关联，以实现全面的故障排查
- 创建用于安全监控的自定义仪表板（SSH 登录尝试、sudo 使用情况、防火墙拦截）

## 部署到生产环境 {#going-to-production}

本指南基于 ClickStack 内置的 OpenTelemetry Collector 实现快速搭建。对于生产环境部署，建议运行自有的 OTel Collector，并将数据发送到 ClickStack 的 OTLP 端点。有关生产环境配置，请参见[发送 OpenTelemetry 数据](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。