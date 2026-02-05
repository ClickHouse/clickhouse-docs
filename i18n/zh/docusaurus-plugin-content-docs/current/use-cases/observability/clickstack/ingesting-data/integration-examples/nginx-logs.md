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


# 使用 ClickStack 监控 Nginx 日志 \{#nginx-clickstack\}

:::note[摘要]
本指南演示如何通过配置 OTel collector 来摄取 Nginx 访问日志，从而使用 ClickStack 监控 Nginx。本文将介绍如何：

- 将 Nginx 配置为输出 JSON 格式的日志
- 创建用于日志摄取的自定义 OTel collector 配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 Nginx 指标

如果希望在为生产环境中的 Nginx 配置前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::

## 集成现有的 Nginx \{#existing-nginx\}

本节介绍如何通过修改 ClickStack OTel collector 配置，将你现有 Nginx 实例的日志发送到 ClickStack。
如果你希望在配置自己的环境之前先进行验证，可以使用我们预配置的环境和示例数据进行测试，详见[以下章节](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)。

##### 前提条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例
- 现有的 Nginx 安装
- 修改 Nginx 配置文件的权限

<VerticalStepper headerLevel="h4">
  #### 配置 Nginx 日志格式

  首先,配置 Nginx 以 JSON 格式输出日志,以便于解析。将以下日志格式定义添加到您的 nginx.conf 文件中:

  `nginx.conf` 文件通常位于：

  * **Linux（apt/yum）**: `/etc/nginx/nginx.conf`
  * **macOS（Homebrew）**：`/usr/local/etc/nginx/nginx.conf` 或 `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**：配置通常通过挂载卷的方式提供

  将此日志格式定义添加到 `http` 块中:

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

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry Collector 的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 nginx-monitoring.yaml 的文件,配置如下:

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
          layout: '%d/%b/%Y:%H:%M:%S %z'
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

  该配置:

  * 从 Nginx 的默认日志路径读取日志
  * 解析 JSON 格式的日志条目
  * 提取并保留日志的原始时间戳
  * 添加 source: Nginx 属性，便于在 HyperDX 中进行过滤
  * 通过专用 pipeline 将日志转发到 ClickHouse exporter

  :::note

  * 你只需在自定义配置中定义新的 receiver 和 pipeline 即可
  * 处理器（memory&#95;limiter、transform、batch）和导出器（ClickHouse）已经在基础 ClickStack 配置中预先定义好——只需按名称引用它们即可
  * `time_parser` 运算符从 Nginx 的 `time_local` 字段中提取时间戳，以保留原始日志的时间信息
  * 这些 pipeline 会通过现有的处理器，将来自接收器的数据路由到 ClickHouse exporter
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有 ClickStack 部署中启用自定义采集器配置,您必须:

  1. 将自定义配置文件挂载为 /etc/otelcol-contrib/custom.config.yaml
  2. 将环境变量 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE 设置为 /etc/otelcol-contrib/custom.config.yaml
  3. 挂载 Nginx 日志目录，使采集器可以读取它们

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置:

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

  ##### 选项 2:Docker Run(一体化镜像)

  如果使用 docker run 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    clickhouse/clickstack-all-in-one:latest
  ```

  :::note
  确保 ClickStack 采集器具有读取 nginx 日志文件的相应权限。在生产环境中,请使用只读挂载 (:ro) 并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 进入搜索视图
  2. 将 source 设置为 Logs，并确认可以看到包含 request、request&#95;time、upstream&#95;response&#95;time 等字段的日志条目。

  您应看到如下示例:

  <Image img={search_view} alt="日志视图" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 nginx 集成的用户，我们提供了一个预生成的 nginx 访问日志示例数据集，其流量模式接近真实场景。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

```bash
# 下载日志
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

该数据集包括：
- 具有真实流量模式的日志记录
- 各种端点和 HTTP 方法
- 成功请求与错误的混合
- 接近真实的响应时间和字节数

#### 创建测试 collector 配置 \{#test-config\}

创建一个名为 `nginx-demo.yaml` 的文件，并使用以下配置：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # 为演示数据从文件开头开始读取
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
  clickhouse/clickstack-all-in-one:latest
```

#### 在 HyperDX 中验证日志 {#verify-demo-logs}

当 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录到您的账号（如有需要，先创建账号）
2. 进入 Search 视图，将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

在搜索视图中应当看到类似如下的内容：

:::note[时区显示]
HyperDX 会按浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC。我们使用较宽的时间范围，以确保无论您身在何处，都能看到演示日志。看到这些日志后，可以将范围收窄到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={search_view} alt="日志视图"/>

<Image img={log_view} alt="日志视图"/>

</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 nginx，我们提供了用于 nginx 日志的基础可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建的仪表板 \{#import-dashboard\}
1. 打开 HyperDX 并导航到 Dashboards 页面。
2. 点击右上角省略号下的“Import Dashboard”。

<Image img={import_dashboard} alt="导入仪表板"/>

3. 上传 nginx-logs-dashboard.json 文件，然后点击完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 系统会创建一个仪表板，并预先配置好其中的所有可视化图表 \{#created-dashboard\}

:::note
对于演示数据集，将时间范围设置为 **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表板"/>

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未生效

* 检查环境变量 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE 是否已正确设置

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* 检查自定义配置文件是否已挂载在 /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* 查看自定义配置内容，确认其是否可读

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX 中没有日志显示

* 确保 nginx 正在生成 JSON 格式的日志

```bash
tail -f /var/log/nginx/access.log
```

* 检查 Collector 是否能读取日志

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 验证有效配置中包含你的 filelog 接收器

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* 检查收集器日志中是否存在错误

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 后续步骤 {#next-steps}

如果你想进一步探索，可以在仪表盘上尝试以下步骤：

- 为关键指标设置告警（错误率、延迟阈值）
- 为特定使用场景创建额外仪表盘（API 监控、安全事件）