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
本指南介绍如何通过配置 OpenTelemetry collector 摄取 Nginx 访问日志，从而使用 ClickStack 监控 Nginx。您将学习如何：

- 配置 Nginx 输出 JSON 格式的日志
- 为日志摄取创建自定义 OTel collector 配置
- 使用自定义配置部署 ClickStack
- 使用预先构建的仪表板可视化 Nginx 指标

如果您希望在为生产环境中的 Nginx 配置之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::



## 集成现有的 Nginx {#existing-nginx}

本节介绍如何通过修改 ClickStack 的 OTel collector 配置，将你现有 Nginx 实例产生的日志发送到 ClickStack。
如果你希望在修改自己现有环境之前先测试集成效果，可以使用[下一节](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)中预配置的环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- 已有正在运行的 ClickStack 实例
- 已有 Nginx 安装
- 拥有修改 Nginx 配置文件的权限

<VerticalStepper headerLevel="h4">

#### 配置 Nginx 日志格式 {#configure-nginx}

首先，将 Nginx 配置为以 JSON 格式输出日志，以便更容易进行解析。将如下日志格式定义添加到 nginx.conf 中：

`nginx.conf` 文件通常位于：

- **Linux (apt/yum)**：`/etc/nginx/nginx.conf`  
- **macOS (Homebrew)**：`/usr/local/etc/nginx/nginx.conf` 或 `/opt/homebrew/etc/nginx/nginx.conf`  
- **Docker**：配置通常以卷（volume）的形式挂载

将如下日志格式定义添加到 `http` 块中：

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

完成上述更改后，重新加载 Nginx。

#### 创建自定义 OTel collector 配置 {#custom-otel}

ClickStack 允许你通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry Collector 配置。自定义配置会通过 OpAMP 与由 HyperDX 管理的基础配置进行合并。

创建一个名为 nginx-monitoring.yaml 的文件，并填写如下配置：

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

该配置将会：

- 从 Nginx 的标准日志路径读取日志
- 解析 JSON 格式的日志条目
- 提取并保留日志的原始时间戳
- 添加 `source: Nginx` 属性，便于在 HyperDX 中进行过滤
- 通过专用的 pipeline 将日志路由到 ClickHouse exporter

:::note

- 在自定义配置中，你只需要定义新的 receiver 和 pipeline
- 处理器（memory_limiter、transform、batch）和导出器（clickhouse）已在基础 ClickStack 配置中定义，你只需按名称引用它们
- time_parser 操作符会从 Nginx 的 time_local 字段中提取时间戳，以保留日志的原始时间
- pipeline 会通过已有的处理器，将数据从 receiver 路由到 ClickHouse exporter
  :::

#### 配置 ClickStack 加载自定义配置 {#load-custom}

要在现有的 ClickStack 部署中启用自定义 collector 配置，你需要：

1. 将自定义配置文件挂载到 /etc/otelcol-contrib/custom.config.yaml  
2. 设置环境变量 CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml  
3. 挂载你的 Nginx 日志目录，以便 collector 可以读取这些日志

##### 选项 1：Docker Compose {#docker-compose}

更新你的 ClickStack 部署配置：

```yaml
services:
  clickstack:
    # ... existing configuration ...
    environment:
      - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      # ... other environment variables ...
    volumes:
      - ./nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
      - /var/log/nginx:/var/log/nginx:ro
      # ... other volumes ...
```


##### 选项 2：使用 Docker 运行（All-in-One 镜像）{#all-in-one}

如果使用 docker run 搭配 All-in-One 镜像：

```bash
docker run --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
  -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
  -v /var/log/nginx:/var/log/nginx:ro \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

:::note
确保 ClickStack 收集器具有读取 nginx 日志文件的相应权限。在生产环境中，请使用只读挂载（:ro），并遵循最小权限原则。
:::

#### 在 HyperDX 中验证日志 {#verifying-logs}

完成配置后，登录 HyperDX 并确认日志已开始流入：

1. 进入搜索视图
2. 将来源设置为 Logs，并确认可以看到包含 request、request_time、upstream_response_time 等字段的日志条目。

下面是你应当看到的示例：

<Image img={search_view} alt='日志视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 演示数据集 {#demo-dataset}

对于希望在配置生产环境之前测试 nginx 集成的用户，我们提供了一份基于预生成 nginx 访问日志的示例数据集，包含贴近真实的流量模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}


```bash
# 下载日志
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

该数据集包括：

- 具有真实流量模式的日志记录
- 多个端点（endpoint）和 HTTP 方法
- 同时包含成功请求和错误请求
- 真实的响应时间和字节数

#### 创建测试采集器的配置 {#test-config}

创建一个名为 `nginx-demo.yaml` 的文件，并写入以下配置：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # Read from beginning for demo data
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

当 ClickStack 启动并运行后：

1. 打开 [HyperDX](http://localhost:8080/)，登录您的账户（如果还没有账户，可能需要先创建一个）
2. 切换到 Search 视图，并将来源设置为 `Logs`
3. 将时间范围设置为 **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

在搜索视图中，您应该看到如下内容：

:::note[时区显示]
HyperDX 会按照浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC。较大的时间范围可以确保无论您位于哪个时区，都能看到演示日志。确认能看到日志后，您可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={search_view} alt='日志视图' />

<Image img={log_view} alt='日志视图' />

</VerticalStepper>


## 仪表盘和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控 Nginx，我们为 Nginx 日志提供了关键的可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预构建的仪表盘 {#import-dashboard}
1. 打开 HyperDX，并进入 Dashboards 区域。
2. 点击右上角省略号下的“Import Dashboard”。

<Image img={import_dashboard} alt="导入仪表盘"/>

3. 上传 nginx-logs-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 仪表盘将会创建完毕，并预先配置好所有可视化视图 {#created-dashboard}

:::note
对于演示数据集，请将时间范围设置为 **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)**（可根据您的本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表盘"/>

</VerticalStepper>



## 故障排查

### 自定义配置未生效

* 检查环境变量 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE 是否已正确设置

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* 检查自定义配置文件是否已挂载到路径 /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* 查看自定义配置内容，确认其内容可读

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```

### HyperDX 中未显示日志

* 确保 nginx 正在以 JSON 格式输出日志

```bash
tail -f /var/log/nginx/access.log
```

* 检查采集器是否可以读取日志

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 验证有效配置中包含你的 filelog 接收器

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* 检查采集器日志中是否有错误

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 后续步骤 {#next-steps}
如果你想进一步探索，可以在仪表板上尝试以下操作：

- 为关键指标（错误率、延迟阈值）设置告警
- 为特定使用场景（API 监控、安全事件）创建更多仪表板
