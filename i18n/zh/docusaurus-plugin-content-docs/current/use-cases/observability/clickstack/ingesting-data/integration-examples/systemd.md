---
slug: /use-cases/observability/clickstack/integrations/systemd-logs
title: '使用 ClickStack 监控 systemd 日志'
sidebar_label: 'systemd/journald 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 systemd 和 journald 日志'
doc_type: 'guide'
keywords: ['systemd', 'journald', 'journal', 'OTEL', 'ClickStack', 'system logs', 'systemctl']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/systemd/finish-import-systemd.png';
import example_dashboard from '@site/static/images/clickstack/systemd/systemd-logs-dashboard.png';
import search_view from '@site/static/images/clickstack/systemd/systemd-search-view.png';
import log_view from '@site/static/images/clickstack/systemd/systemd-log-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 systemd 日志 \{#systemd-logs-clickstack\}

:::note[TL;DR]
借助 OpenTelemetry Collector 的 journald 接收器，在 ClickStack 中收集并可视化 systemd journal 日志。包含演示数据集和预构建仪表板。
:::

:::

## 集成现有系统 \{#existing-systems\}

通过运行带有 journald 接收器的 OpenTelemetry Collector 来监控现有 Linux 系统的 journald 日志，以收集系统日志并通过 OTLP 发送到 ClickStack。

##### 先决条件 \{#prerequisites\}

* 正在运行的 ClickStack 实例
* 带有 systemd 的 Linux 系统 (Ubuntu 16.04+、CentOS 7+、Debian 8+) 
* 在被监控系统上已安装 Docker 或 Docker Compose

<VerticalStepper headerLevel="h4">
  #### 获取 ClickStack API key

  OpenTelemetry Collector 会向 ClickStack 的 OTLP 端点发送数据，该端点需要进行身份验证。

  1. 在你的 ClickStack 地址上打开 HyperDX (例如：http://localhost:8080)
  2. 如有需要，创建账号或登录
  3. 导航到 **Team Settings → API Keys**
  4. 复制你的 **摄取 API key**

  <Image img={api_key} alt="ClickStack API Key" />

  5. 将其设置为环境变量：

  ```bash
  export CLICKSTACK_API_KEY=your-api-key-here
  ```

  #### 验证 systemd journal 是否在运行

  确保系统正在使用 systemd 并且具有 journal 日志：

  ```bash
  # 检查 systemd 版本
  systemctl --version

  # 查看最近的 journal 条目
  journalctl -n 20

  # 检查 journal 磁盘使用情况
  journalctl --disk-usage
  ```

  如果 journal 存储仅在内存中，请启用持久化存储：

  ```bash
  sudo mkdir -p /var/log/journal
  sudo systemd-tmpfiles --create --prefix /var/log/journal
  sudo systemctl restart systemd-journald
  ```

  #### 创建 OpenTelemetry Collector 配置

  为 OpenTelemetry Collector 创建一个配置文件：

  ```yaml
  cat > otel-config.yaml << 'EOF'
  receivers:
    journald:
      directory: /var/log/journal
      priority: info
      units:
        - sshd
        - nginx
        - docker
        - containerd
        - systemd

  processors:
    batch:
      timeout: 10s
      send_batch_size: 10000
    
    resource:
      attributes:
        - key: service.name
          value: systemd-logs
          action: insert
        - key: host.name
          from_attribute: _HOSTNAME
          action: upsert
    
    attributes:
      actions:
        - key: unit
          from_attribute: _SYSTEMD_UNIT
          action: upsert
        - key: priority
          from_attribute: PRIORITY
          action: upsert

  exporters:
    otlphttp:
      endpoint: ${CLICKSTACK_ENDPOINT}
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [journald]
        processors: [resource, attributes, batch]
        exporters: [otlphttp]
  EOF
  ```

  #### 使用 Docker Compose 部署

  :::note
  `journald` receiver 需要 `journalctl` 可执行文件来读取 journal 文件。官方的 `otel/opentelemetry-collector-contrib` 镜像默认不包含 `journalctl`。

  对于容器化部署，可以直接在主机上安装 collector，或者构建一个包含 systemd 工具的自定义镜像。详情参见[故障排除部分](#journalctl-not-found)。
  :::

  下面的示例展示了如何将 OTel collector 与 ClickStack 一同部署：

  ```yaml
  services:
    clickstack:
      image: clickhouse/clickstack-all-in-one:latest
      ports:
        - "8080:8080"
        - "4317:4317"
        - "4318:4318"
      networks:
        - monitoring
    
    otel-collector:
      image: otel/opentelemetry-collector-contrib:0.115.1
      depends_on:
        - clickstack
      environment:
        - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
        - CLICKSTACK_ENDPOINT=http://clickstack:4318
      volumes:
        - ./otel-config.yaml:/etc/otelcol/config.yaml:ro
        - /var/log/journal:/var/log/journal:ro
        - /run/log/journal:/run/log/journal:ro
        - /etc/machine-id:/etc/machine-id:ro
      command: ["--config=/etc/otelcol/config.yaml"]
      networks:
        - monitoring

  networks:
    monitoring:
      driver: bridge
  ```

  启动这些服务：

  ```bash
  docker compose up -d
  ```

  #### 在 HyperDX 中验证日志

  配置完成后，登录 HyperDX 并验证日志是否已开始流入：

  1. 导航到 Search 视图
  2. 将 source 设置为 Logs
  3. 按 `service.name:systemd-logs` 进行过滤
  4. 应该能看到带有 `unit`、`priority`、`MESSAGE`、`_HOSTNAME` 等字段的结构化日志条目

  <Image img={search_view} alt="日志搜索视图" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 systemd 日志集成的用户，我们提供了一份预生成的、带有接近真实日志模式的 systemd 日志演示数据集。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

下载示例日志文件：

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/systemd/systemd-demo.log
```

#### 创建演示采集器配置 \{#demo-config\}

为演示环境创建一个配置文件：

```bash
cat > systemd-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/systemd-demo/systemd-demo.log
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
        value: "systemd-demo"

service:
  pipelines:
    logs/systemd-demo:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
EOF
```

#### 使用演示数据运行 ClickStack \{#run-demo\}

使用演示日志启动 ClickStack：

```bash
docker run -d --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/systemd-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/systemd-demo.log:/tmp/systemd-demo/systemd-demo.log:ro" \
  clickhouse/clickstack-all-in-one:latest
```

:::note
该演示使用 `filelog` 接收器读取文本日志，而不是使用 `journald`，以避免在容器中依赖 `journalctl`。
:::

#### 在 HyperDX 中验证日志 \{#verify-demo-logs\}

当 ClickStack 启动并运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录到您的账户
2. 进入 Search 视图，将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-11-14 00:00:00 - 2025-11-17 00:00:00**

<Image img={search_view} alt="日志搜索视图"/>

<Image img={log_view} alt="日志视图"/>

:::note[时区显示]

HyperDX 会以浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)**。设置较宽的时间范围可以确保无论您身处何地，都能看到演示日志。
:::

</VerticalStepper>

## 仪表盘和可视化 \{#dashboards\}

为了帮助您开始使用 ClickStack 监控 systemd 日志，我们提供了针对 systemd journal 数据的基础可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/systemd-logs-dashboard.json')} download="systemd-logs-dashboard.json" eventName="docs.systemd_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 \{#download\}

#### 导入预配置的仪表盘 \{#import-dashboard\}

1. 打开 HyperDX 并导航到「仪表盘（Dashboards）」部分
2. 点击右上角省略号下的 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard button"/>

3. 上传 `systemd-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="Finish import"/>

#### 查看仪表盘 \{#created-dashboard\}

该仪表盘包含以下可视化内容：
- 随时间变化的日志量
- 按日志数量排序的 systemd 单元
- SSH 认证事件
- 服务故障
- 错误率

<Image img={example_dashboard} alt="Example dashboard"/>

:::note

对于演示数据集，将时间范围设置为 **2025-11-15 00:00:00 - 2025-11-16 00:00:00 (UTC)**（可根据您的本地时区进行调整）。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

### HyperDX 中没有日志显示

检查日志是否已经到达 ClickHouse：

```bash
docker exec clickstack clickhouse-client --query "
SELECT COUNT(*) as log_count
FROM otel_logs
WHERE ServiceName = 'systemd-logs'
"
```

### journalctl 未找到错误

如果你看到 `exec: "journalctl": executable file not found in $PATH`：

`otel/opentelemetry-collector-contrib` 镜像不包含 `journalctl`。你可以：

1. **在主机上安装收集器**：

```bash
wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. **使用文本导出方案**（类似 demo），让 `filelog` receiver 读取 journald 导出文件

## 后续步骤

* 为关键系统事件设置[告警](/use-cases/observability/clickstack/alerts) (如服务故障、身份验证失败、OOM 终止) 
* 为特定用例创建更多[仪表板](/use-cases/observability/clickstack/dashboards) (如 SSH 安全监控、服务健康状态) 
* 按特定的 systemd 单元进行筛选，以减少噪声并聚焦于关键服务

wget https://github.com/open-telemetry/opentelemetry-collector-releases/releases/download/v0.115.0/otelcol-contrib_0.115.0_linux_amd64.tar.gz
tar -xzf otelcol-contrib_0.115.0_linux_amd64.tar.gz
sudo mv otelcol-contrib /usr/local/bin/
otelcol-contrib --config=otel-config.yaml
```

2. **使用文本导出方法**（与演示类似），由 `filelog` 接收器读取 journald 导出的日志


## 投入生产环境 {#going-to-production}
