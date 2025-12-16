---
slug: /use-cases/observability/clickstack/integrations/host-logs/ec2
title: '使用 ClickStack 监控 EC2 主机日志'
sidebar_label: 'EC2 主机日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 EC2 主机日志'
doc_type: 'guide'
keywords: ['EC2', 'AWS', '主机日志', 'systemd', 'syslog', 'OTel', 'ClickStack', '系统监控', '云元数据']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import search_view from '@site/static/images/clickstack/host-logs/ec2/search-view.png';
import log_view from '@site/static/images/clickstack/host-logs/ec2/log-view.png';
import search_view_demo from '@site/static/images/clickstack/host-logs/ec2/search-view-demo.png';
import log_view_demo from '@site/static/images/clickstack/host-logs/ec2/log-view-demo.png';
import logs_dashboard from '@site/static/images/clickstack/host-logs/host-logs-dashboard.png';
import finish_import from '@site/static/images/clickstack/host-logs/import-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 使用 ClickStack 监控 EC2 主机日志 {#ec2-host-logs-clickstack}

:::note[TL;DR]
通过在实例上安装 OpenTelemetry Collector，使用 ClickStack 监控 EC2 系统日志。Collector 会自动为日志添加 EC2 元数据（实例 ID、区域、可用区、实例类型）。本文将介绍如何：

- 在 EC2 实例上安装和配置 OpenTelemetry Collector
- 自动使用 EC2 元数据丰富日志
- 通过 OTLP 将日志发送到 ClickStack
- 使用预构建的仪表盘，在云环境上下文中可视化 EC2 主机日志

我们提供了一个包含示例日志和模拟 EC2 元数据的演示数据集，可用于测试。

所需时间：10–15 分钟
:::

## 与现有 EC2 实例集成 {#existing-ec2}

本节介绍如何在 EC2 实例上安装 OpenTelemetry Collector，用于收集系统日志并将其发送到 ClickStack，并自动补充 EC2 元数据。此分布式架构已准备好用于生产环境，并可扩展到多个实例。

:::note[在同一 EC2 实例上运行 ClickStack？]
如果 ClickStack 运行在与需要监控日志的同一台 EC2 实例上，可以使用与 [通用主机日志指南](/use-cases/observability/clickstack/integrations/host-logs) 类似的一体化方案。将 `/var/log` 挂载到 ClickStack 容器中，并在自定义配置中添加 `resourcedetection` 处理器，即可自动捕获 EC2 元数据。本文主要关注在生产环境中更常见的分布式架构部署方式。
:::

如果希望在为生产实例进行配置之前先测试 EC2 主机日志集成，可以在 ["Demo dataset"](/use-cases/observability/clickstack/integrations/host-logs/ec2#demo-dataset) 部分使用我们预配置的环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- 已有正在运行的 ClickStack 实例（可为本地数据中心部署、Cloud 或本地开发环境）
- 已有正在运行的 EC2 实例（Ubuntu、Amazon Linux 或其他 Linux 发行版）
- 从 EC2 实例到 ClickStack 的 OTLP 端点具备网络连通性（HTTP 使用端口 4318，gRPC 使用端口 4317）
- 可访问 EC2 实例元数据服务（默认启用）

<VerticalStepper headerLevel="h4">
  #### 验证 EC2 元数据是否可访问

  从您的 EC2 实例验证元数据服务是否可访问:

  ```bash
# Get metadata token (IMDSv2)
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Verify instance metadata
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-type
```

  您应该能看到实例 ID、区域和实例类型。如果这些命令失败,请检查:

  * 实例元数据服务已启用
  * IMDSv2 不会被安全组或网络 ACL 阻断
  * 这些命令需要在 EC2 实例上直接运行

  :::note
  EC2 元数据可在实例内通过 `http://169.254.169.254` 访问。OpenTelemetry `resourcedetection` 处理器使用此端点自动为日志enrichment云上下文信息。
  :::

  #### 验证 syslog 文件是否存在

  验证您的 EC2 实例正在写入 syslog 文件：

  ```bash
# Ubuntu instances
ls -la /var/log/syslog

# Amazon Linux / RHEL instances
ls -la /var/log/messages

# View recent entries
tail -20 /var/log/syslog
# or
tail -20 /var/log/messages
```

  #### 安装 OpenTelemetry Collector

  在您的 EC2 实例上安装 OpenTelemetry Collector Contrib 发行版：

  ```bash
# Download the latest release
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.114.0/otelcol-contrib_0.114.0_linux_amd64.tar.gz

# Extract and install
tar -xvf otelcol-contrib_0.114.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/

# Verify installation
otelcol-contrib --version
```

  #### 创建采集器配置

  在 `/etc/otelcol-contrib/config.yaml` 创建 OpenTelemetry Collector 的配置文件:

  ```bash
sudo mkdir -p /etc/otelcol-contrib
```

  根据您的 Linux 发行版选择配置：

  <Tabs groupId="os-type">
    <TabItem value="modern-linux" label="现代 Linux（Ubuntu 24.04+）" default>
      ```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
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
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```
    </TabItem>

    <TabItem value="legacy-linux" label="旧版 Linux（Amazon Linux 2、RHEL、旧版 Ubuntu）">
      ```yaml
sudo tee /etc/otelcol-contrib/config.yaml > /dev/null << 'EOF'
receivers:
  filelog/syslog:
    include:
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
        value: "ec2-host-logs"

processors:
  resourcedetection:
    detectors: [ec2, system]
    timeout: 5s
    override: false
    ec2:
      tags:
        - ^Name
        - ^Environment
        - ^Team
  
  batch:
    timeout: 10s
    send_batch_size: 1024

exporters:
  otlphttp:
    endpoint: "http://YOUR_CLICKSTACK_HOST:4318"
    headers:
      authorization: "${env:CLICKSTACK_API_KEY}"

service:
  pipelines:
    logs:
      receivers: [filelog/syslog]
      processors: [resourcedetection, batch]
      exporters: [otlphttp]
EOF
```
    </TabItem>
  </Tabs>

  <br />

  **在配置中替换以下内容：**

  * `YOUR_CLICKSTACK_HOST`: ClickStack 所在的主机名或 IP 地址
  * 在本地测试时，可以使用 SSH 隧道（参见[故障排除部分](#troubleshooting)）。

  此配置：

  * 从标准路径读取系统日志文件（Ubuntu 为 `/var/log/syslog`，Amazon Linux/RHEL 为 `/var/log/messages`）
  * 解析 syslog 格式以提取结构化字段（时间戳、主机名、单元/服务、PID、消息）
  * **通过 `resourcedetection` 处理器自动检测并添加 EC2 元数据**
  * 如有，则可选包含 EC2 标签（Name、Environment、Team）
  * 使用 OTLP over HTTP 将日志发送到 ClickStack

  :::note[EC2 元数据增强]
  `resourcedetection` 处理器会自动将这些属性添加到每条日志中：

  * `cloud.provider`: &quot;aws&quot;
  * `cloud.platform`: &quot;aws&#95;ec2&quot;
  * `cloud.region`：AWS 区域（例如 &quot;us-east-1&quot;）
  * `cloud.availability_zone`: 可用区（AZ，例如：&quot;us-east-1a&quot;）
  * `cloud.account.id`: AWS 账户 ID
  * `host.id`: EC2 实例 ID（例如：&quot;i-1234567890abcdef0&quot;）
  * `host.type`: 实例类型（例如：&quot;t3.medium&quot;）
  * `host.name`: 实例的主机名

  #### 设置 ClickStack API 密钥

  将您的 ClickStack API 密钥导出为环境变量：

  ```bash
export CLICKSTACK_API_KEY="your-api-key-here"
```

  要使其在重启后持久生效,请将其添加到您的 shell 配置文件中:

  ```bash
echo 'export CLICKSTACK_API_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

  #### 运行采集器

  启动 OpenTelemetry Collector：

  ```bash
CLICKSTACK_API_KEY="your-api-key-here" /usr/local/bin/otelcol-contrib --config /etc/otelcol-contrib/config.yaml
```

  :::note[生产环境使用]
  将收集器配置为 systemd 服务运行,使其能够在系统启动时自动启动,并在发生故障时自动重启。详情请参阅 [OpenTelemetry Collector 文档](https://opentelemetry.io/docs/collector/deployment/)。
  :::

  #### 在 HyperDX 中验证日志

  收集器运行后,登录 HyperDX 并验证日志是否正常流入且包含 EC2 元数据:

  1. 进入搜索视图
  2. 将 Source 设置为 `Logs`
  3. 按 `source:ec2-host-logs` 过滤
  4. 单击某条日志记录以展开详情
  5. 验证是否能在资源属性中看到 EC2 元数据：
     * `cloud.provider`
     * `cloud.region`
     * `host.id`（实例 ID）
     * `host.type`（实例类型）
     * `cloud.availability_zone`

  <Image img={search_view} alt="EC2 日志搜索视图" />

  <Image img={log_view} alt="包含元数据的 EC2 日志详细信息" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产实例之前先测试 EC2 主机日志集成的用户，我们提供一个包含模拟 EC2 元数据的样本数据集。

<VerticalStepper headerLevel="h4">
  #### 下载示例数据集

  下载示例日志文件：

  ```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/host-logs/journal.log
```

  数据集包括：

  * 系统启动顺序
  * SSH 登录活动（成功和失败的登录尝试）
  * 安全事件（暴力破解攻击以及 fail2ban 的响应）
  * 计划维护（cron 定时任务、anacron）
  * 重启服务（rsyslog）
  * 内核日志和防火墙活动
  * 正常操作与重要事件的混合

  #### 创建测试采集器配置

  创建名为 `ec2-host-logs-demo.yaml` 的文件,包含以下配置:

  ```yaml
cat > ec2-host-logs-demo.yaml << 'EOF'
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
        value: "ec2-demo"

processors:
  # Simulate EC2 metadata for demo (no real EC2 instance required)
  resource:
    attributes:
      - key: service.name
        value: "ec2-demo"
        action: insert
      - key: cloud.provider
        value: "aws"
        action: insert
      - key: cloud.platform
        value: "aws_ec2"
        action: insert
      - key: cloud.region
        value: "us-east-1"
        action: insert
      - key: cloud.availability_zone
        value: "us-east-1a"
        action: insert
      - key: host.id
        value: "i-0abc123def456789"
        action: insert
      - key: host.type
        value: "t3.medium"
        action: insert
      - key: host.name
        value: "prod-web-01"
        action: insert

service:
  pipelines:
    logs/ec2-demo:
      receivers: [filelog/journal]
      processors:
        - resource
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

  :::note
  出于演示目的,我们使用 `resource` 处理器手动添加 EC2 元数据。在生产环境中使用真实 EC2 实例时,应使用 `resourcedetection` 处理器,该处理器会自动查询 EC2 元数据 API。
  :::

  #### 使用演示配置运行 ClickStack

  使用演示日志和配置运行 ClickStack：

  ```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/ec2-host-logs-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/journal.log:/tmp/host-demo/journal.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

  #### 在 HyperDX 中验证日志

  收集器运行后：

  1. 打开 [HyperDX](http://localhost:8080/)，并登录到您的账户（如有需要，请先创建一个账户）。
  2. 进入搜索视图，将来源设置为 `Logs`
  3. 将时间范围设置为 **2025-11-10 00:00:00 - 2025-11-13 00:00:00**
  4. 按 `source:ec2-demo` 筛选
  5. 展开某条日志记录，在资源属性中查看 EC2 元数据

  <Image img={search_view_demo} alt="EC2 日志搜索视图" />

  <Image img={log_view_demo} alt="附带元数据的 EC2 日志详情" />

  :::note[时区显示]
  HyperDX 以您浏览器的本地时区显示时间戳。演示数据的时间跨度为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**。较宽的时间范围可确保您无论身处何地都能查看到演示日志。查看日志后,您可以将时间范围缩小至 24 小时,以获得更清晰的可视化效果。
  :::

  您应该能看到包含模拟 EC2 上下文的日志，包括：

  * 实例 ID：`i-0abc123def456789`
  * 区域：`us-east-1`
  * 可用区：`us-east-1a`
  * 实例类型：`t3.medium`
</VerticalStepper>

## 仪表盘与可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 EC2 主机日志，我们提供了带有云环境上下文的基础可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/host-logs-dashboard.json')} download="host-logs-dashboard.json" eventName="docs.ec2_host_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预构建的仪表盘 {#import-dashboard}

1. 打开 HyperDX 并进入 Dashboards 页面
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表盘按钮"/>

3. 上传 `host-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入"/>

#### 查看仪表盘 {#created-dashboard}

系统会创建一个仪表盘，其中所有可视化视图都已预先配置：

<Image img={logs_dashboard} alt="EC2 日志仪表盘"/>

你可以按 EC2 上下文筛选仪表盘中的可视化视图：
- `cloud.region:us-east-1` - 显示来自特定区域的日志
- `host.type:t3.medium` - 按实例类型筛选
- `host.id:i-0abc123def456` - 来自特定实例的日志

:::note
对于演示数据集，将时间范围设置为 **2025-11-11 00:00:00 - 2025-11-12 00:00:00 (UTC)**（根据你的本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排除 {#troubleshooting}

### 日志中未出现 EC2 元数据

**确认 EC2 元数据服务可访问：**

```bash
# Get metadata token
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")

# Test metadata endpoint
curl -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/instance-id
```

如果这一步失败，请确认：

* 实例元数据服务已启用
* IMDSv2 未被安全组阻止
* 您是在 EC2 实例本机上运行 collector

**在 collector 日志中检查元数据相关错误：**

```bash
# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "ec2\|metadata\|resourcedetection"

# If running in foreground, check stdout
```


### HyperDX 中未显示日志

**检查 syslog 文件是否存在并正在写入：**

```bash
ls -la /var/log/syslog /var/log/messages
tail -f /var/log/syslog
```

**检查 Collector 是否能够读取日志文件：**

```bash
cat /var/log/syslog | head -20
```

**验证到 ClickStack 的网络连接：**

```bash
# Test OTLP endpoint
curl -v http://YOUR_CLICKSTACK_HOST:4318/v1/logs

# Should get a response (even if error, means endpoint is reachable)
```

**检查 Collector 日志中是否存在错误：**

```bash
# If running in foreground
# Look for error messages in stdout

# If running as systemd service
sudo journalctl -u otelcol-contrib -f | grep -i "error\|failed"
```


### 日志解析错误

**检查你的 syslog 格式：**

适用于 Ubuntu 24.04 及更高版本：

```bash
# Should show ISO8601 format: 2025-11-17T20:55:44.826796+00:00
tail -5 /var/log/syslog
```

适用于 Amazon Linux 2 和 Ubuntu 20.04：

```bash
# Should show traditional format: Nov 17 14:16:16
tail -5 /var/log/messages
```

如果你的格式不匹配，请根据你使用的发行版，在[创建 collector 配置](#create-config)部分中选择相应的配置标签页。


### Collector 作为 systemd 服务未启动

**检查服务状态：**

```bash
sudo systemctl status otelcol-contrib
```

**查看详细日志：**

```bash
sudo journalctl -u otelcol-contrib -n 50
```

**常见问题：**

* 环境中未正确设置 API 密钥
* 配置文件语法错误
* 读取日志文件时的权限问题


## 后续步骤 {#next-steps}

在完成 EC2 主机日志监控的设置后：

- 为关键系统事件（服务故障、身份验证失败、磁盘告警）配置[告警](/use-cases/observability/clickstack/alerts)
- 按 EC2 元数据属性（区域、实例类型、实例 ID）进行过滤，以监控特定资源
- 将 EC2 主机日志与应用日志进行关联，实现全面故障排查
- 创建用于安全监控的自定义仪表盘（SSH 尝试、sudo 使用情况、防火墙拦截）