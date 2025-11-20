---
slug: /use-cases/observability/clickstack/integrations/nginx
title: '使用 ClickStack 监控 Nginx 日志'
sidebar_label: 'Nginx 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Nginx'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-logs-import.png';
import example_dashboard from '@site/static/images/clickstack/nginx-logs-dashboard.png';
import log_view from '@site/static/images/clickstack/log-view.png';
import search_view from '@site/static/images/clickstack/nginx-logs-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Nginx 日志 {#nginx-clickstack}

:::note[TL;DR]
本指南介绍如何通过配置 OpenTelemetry 采集器来采集 Nginx 访问日志,从而使用 ClickStack 监控 Nginx。您将学习如何:

- 配置 Nginx 输出 JSON 格式的日志
- 创建用于日志采集的自定义 OTel 采集器配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 Nginx 指标

如果您想在配置生产环境 Nginx 之前测试集成,可以使用包含示例日志的演示数据集。

所需时间:5-10 分钟
:::


## 与现有 Nginx 集成 {#existing-nginx}

本节介绍如何通过修改 ClickStack OTel 收集器配置,将现有 Nginx 安装的日志发送到 ClickStack。
如果您希望在配置自己的现有环境之前测试集成,可以使用我们预配置的环境和示例数据进行测试,详见[下一节](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)。

##### 前提条件 {#prerequisites}

- ClickStack 实例正在运行
- 已安装 Nginx
- 具有修改 Nginx 配置文件的权限

<VerticalStepper headerLevel="h4">

#### 配置 Nginx 日志格式 {#configure-nginx}

首先,配置 Nginx 以 JSON 格式输出日志,便于解析。将以下日志格式定义添加到您的 nginx.conf 中:

`nginx.conf` 文件通常位于:

- **Linux (apt/yum)**: `/etc/nginx/nginx.conf`
- **macOS (Homebrew)**: `/usr/local/etc/nginx/nginx.conf` 或 `/opt/homebrew/etc/nginx/nginx.conf`
- **Docker**: 配置通常作为卷挂载

将以下日志格式定义添加到 `http` 块中:

```nginx
http {
    log_format json_combined escape=json
    '{'
      '"time_local":"$time_local",'
      '"remote_addr":"$remote_addr",'
      '"request_method":"$request_method",'
      '"request_uri":"$request_uri",'
      '"status":$status,'
      '"body_bytes_sent":$body_bytes_sent,'
      '"request_time":$request_time,'
      '"upstream_response_time":"$upstream_response_time",'
      '"http_referer":"$http_referer",'
      '"http_user_agent":"$http_user_agent"'
    '}';

    access_log /var/log/nginx/access.log json_combined;
    error_log /var/log/nginx/error.log warn;
}
```

完成此更改后,重新加载 Nginx。

#### 创建自定义 OTel 收集器配置 {#custom-otel}

ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置将与 HyperDX 通过 OpAMP 管理的基础配置合并。

创建一个名为 nginx-monitoring.yaml 的文件,包含以下配置:

```yaml
receivers:
  filelog:
    include:
      - /var/log/nginx/access.log
      - /var/log/nginx/error.log
    start_at: end
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: "%d/%b/%Y:%H:%M:%S %z"
      - type: add
        field: attributes.source
        value: "nginx"

service:
  pipelines:
    logs/nginx:
      receivers: [filelog]
      processors:
        - memory_limiter
        - transform
        - batch
      exporters:
        - clickhouse
```

此配置:

- 从标准位置读取 Nginx 日志
- 解析 JSON 日志条目
- 提取并保留原始日志时间戳
- 添加 source: Nginx 属性以便在 HyperDX 中过滤
- 通过专用管道将日志路由到 ClickHouse 导出器

:::note

- 您只需在自定义配置中定义新的接收器和管道
- 处理器(memory_limiter、transform、batch)和导出器(clickhouse)已在基础 ClickStack 配置中定义 - 您只需按名称引用它们
- time_parser 操作符从 Nginx 的 time_local 字段提取时间戳,以保留原始日志时间
- 管道通过现有处理器将数据从您的接收器路由到 ClickHouse 导出器
  :::

#### 配置 ClickStack 加载自定义配置 {#load-custom}

要在现有 ClickStack 部署中启用自定义收集器配置,您必须:

1. 将自定义配置文件挂载到 /etc/otelcol-contrib/custom.config.yaml
2. 设置环境变量 CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
3. 挂载您的 Nginx 日志目录,以便收集器可以读取它们

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
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... 其他卷 ...
```


##### 选项 2:Docker Run(一体化镜像){#all-in-one}

如果使用 docker run 运行一体化镜像:

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack 收集器具有读取 nginx 日志文件的相应权限。在生产环境中,请使用只读挂载(:ro)并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}

配置完成后,登录 HyperDX 并验证日志是否正常流入:

1. 导航到搜索视图
2. 将来源设置为 Logs,并验证是否能看到包含 request、request_time、upstream_response_time 等字段的日志条目

以下是您应该看到的示例:

<Image img={search_view} alt='日志视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 nginx 集成的用户,我们提供了一个预生成的 nginx 访问日志示例数据集,包含真实的流量模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}


```bash
# Download the logs
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

该数据集包括：

- 具有真实流量模式的日志条目
- 各种端点和 HTTP 方法
- 成功请求和错误的混合
- 真实的响应时间和字节数

#### 创建测试收集器配置 {#test-config}

创建一个名为 `nginx-demo.yaml` 的文件，包含以下配置：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # 从头开始读取演示数据
    operators:
      - type: json_parser
        parse_from: body
        parse_to: attributes
      - type: time_parser
        parse_from: attributes.time_local
        layout: '%d/%b/%Y:%H:%M:%S %z'
      - type: add
        field: attributes.source
        value: "nginx-demo"

service:
  pipelines:
    logs/nginx-demo:
      receivers: [filelog]
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
  -v "$(pwd)/nginx-demo.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v "$(pwd)/access.log:/tmp/nginx-demo/access.log:ro" \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户（您可能需要先创建账户）
2. 导航到搜索视图并将来源设置为 `Logs`
3. 将时间范围设置为 **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

您应该在搜索视图中看到以下内容：

:::note[时区显示]
HyperDX 以您浏览器的本地时区显示时间戳。演示数据时间跨度为 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC。较宽的时间范围可确保无论您身在何处都能看到演示日志。看到日志后，您可以将范围缩小到 24 小时以获得更清晰的可视化效果。
:::

<Image img={search_view} alt='日志视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 nginx,我们提供了 Nginx 日志的基本可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分。
2. 点击右上角省略号下的"Import Dashboard"。

<Image img={import_dashboard} alt='导入仪表板' />

3. 上传 nginx-logs-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt='完成导入' />

#### 仪表板将创建完成,所有可视化均已预配置 {#created-dashboard}

:::note
对于演示数据集,请将时间范围设置为 **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)**(根据您的本地时区进行调整)。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt='示例仪表板' />

</VerticalStepper>


## 故障排查 {#troubleshooting}

### 自定义配置未加载 {#troubleshooting-not-loading}

- 验证环境变量 CUSTOM_OTELCOL_CONFIG_FILE 设置是否正确

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

- 检查自定义配置文件是否已挂载至 /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

- 查看自定义配置内容以验证其可读

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX 中未显示日志 {#no-logs}

- 确保 nginx 正在写入 JSON 格式日志

```bash
tail -f /var/log/nginx/access.log
```

- 检查收集器能否读取日志

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

- 验证生效配置中是否包含您的 filelog 接收器

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

- 检查收集器日志中是否存在错误

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 后续步骤 {#next-steps}

如果您想进一步探索,以下是一些可以在仪表板上进行实验的后续步骤:

- 为关键指标设置告警(错误率、延迟阈值)
- 针对特定用例创建额外的仪表板(API 监控、安全事件)
