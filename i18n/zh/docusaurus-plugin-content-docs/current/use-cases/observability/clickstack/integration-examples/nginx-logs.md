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

:::note[概要]
本指南演示如何通过配置 OpenTelemetry collector 来摄取 Nginx 访问日志，从而使用 ClickStack 监控 Nginx。你将了解如何：

- 将 Nginx 配置为输出 JSON 格式的日志
- 创建用于日志摄取的自定义 OTel collector 配置
- 使用自定义配置部署 ClickStack
- 使用预构建的仪表板可视化 Nginx 指标

如果你希望在为生产环境的 Nginx 进行配置之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：5–10 分钟
:::

## 集成现有的 Nginx {#existing-nginx}

本节介绍如何通过修改 ClickStack 中的 OTel collector 配置，将你现有 Nginx 部署产生的日志发送到 ClickStack。
如果你希望在配置自己的现有环境之前先测试该集成，可以使用我们预先配置的环境和示例数据进行测试，详见[下一节](/use-cases/observability/clickstack/integrations/nginx#demo-dataset)。

##### 前提条件 {#prerequisites}

- 正在运行的 ClickStack 实例
- 已安装的 Nginx
- 有权限访问并修改 Nginx 配置文件

<VerticalStepper headerLevel="h4">
  #### 配置 Nginx 日志格式

  首先,配置 Nginx 以 JSON 格式输出日志,便于解析。将以下日志格式定义添加到 nginx.conf 文件中:

  `nginx.conf` 文件通常位于:

  * **Linux（apt/yum）**：`/etc/nginx/nginx.conf`
  * **macOS（Homebrew）**：`/usr/local/etc/nginx/nginx.conf` 或 `/opt/homebrew/etc/nginx/nginx.conf`
  * **Docker**：配置通常以卷的形式挂载

  将此日志格式定义添加到 `http` 块中：

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

  完成此更改后,请重新加载 Nginx。

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展 OpenTelemetry Collector 的基础配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 nginx-monitoring.yaml 的文件,并添加以下配置:

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

  此配置：

  * 从 Nginx 的默认日志路径读取日志
  * 解析 JSON 日志条目
  * 提取并保留日志的原始时间戳
  * 添加 source: Nginx 属性，以便在 HyperDX 中进行过滤
  * 通过专用 pipeline 将日志转发到 ClickHouse exporter

  :::note

  * 你只需在自定义配置中定义新的 receiver 和 pipeline 即可
  * 这些处理器（memory&#95;limiter、transform、batch）和导出器（clickhouse）在基础 ClickStack 配置中已经预先定义好——你只需要按名称引用它们即可
  * time&#95;parser 运算符从 Nginx 的 time&#95;local 字段中提取时间戳，以保留日志的原始时间
  * 这些 pipeline 会通过现有的 processor，将数据从 receiver 路由到 ClickHouse exporter

  #### 配置 ClickStack 加载自定义配置

  要在现有的 ClickStack 部署中启用自定义采集器配置，您必须：

  1. 将自定义配置文件挂载到 /etc/otelcol-contrib/custom.config.yaml
  2. 将环境变量 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE 设置为 /etc/otelcol-contrib/custom.config.yaml
  3. 挂载 Nginx 日志目录，使采集器能够读取其中的日志

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置：

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

  ##### 选项 2:Docker Run(一体化镜像)

  如果使用 docker run 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/nginx-monitoring.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v /var/log/nginx:/var/log/nginx:ro \
    docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
  ```

  :::note
  确保 ClickStack 采集器具有读取 nginx 日志文件的相应权限。在生产环境中,使用只读挂载方式(:ro)并遵循最小权限原则。
  :::

  #### 在 HyperDX 中验证日志

  配置完成后,登录 HyperDX 并验证日志是否正常流入:

  1. 进入搜索视图
  2. 将 Source 设置为 Logs，并确认可以看到包含 request、request&#95;time、upstream&#95;response&#95;time 等字段的日志条目。

  以下是您应看到的示例：

  <Image img={search_view} alt="日志视图" />

  <Image img={log_view} alt="日志视图" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前先测试 nginx 集成的用户，我们提供了一个预先生成的 nginx 访问日志示例数据集，其中包含逼真的流量模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 {#download-sample}

```bash
# 下载日志
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/access.log
```

该数据集包括：
- 具有逼真流量模式的日志记录
- 各种端点和 HTTP 方法
- 成功请求与错误请求的混合
- 逼真的响应时间和字节数

#### 创建测试 collector 配置 {#test-config}

创建名为 `nginx-demo.yaml` 的文件，并填入以下配置：

```yaml
cat > nginx-demo.yaml << 'EOF'
receivers:
  filelog:
    include:
      - /tmp/nginx-demo/access.log
    start_at: beginning  # 为演示数据从开头开始读取
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

当 ClickStack 运行后：

1. 打开 [HyperDX](http://localhost:8080/) 并登录你的账户（你可能需要先创建一个账户）
2. 进入 Search 视图，并将 source 设置为 `Logs`
3. 将时间范围设置为 **2025-10-19 11:00:00 - 2025-10-22 11:00:00**

在搜索视图中，你应当能看到如下内容：

:::note[时区显示]
HyperDX 会以浏览器的本地时区显示时间戳。演示数据的时间范围为 2025-10-20 11:00:00 - 2025-10-21 11:00:00 UTC。设置较宽的时间范围可以确保无论你所在的时区如何，都能看到演示日志。看到日志后，你可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={search_view} alt="日志视图"/>

<Image img={log_view} alt="日志视图"/>

</VerticalStepper>

## 仪表盘与可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控 Nginx，我们提供了用于 Nginx 日志的基础可视化仪表盘。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-logs-dashboard.json')} download="nginx-logs-dashboard.json" eventName="docs.nginx_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预置仪表盘 {#import-dashboard}
1. 打开 HyperDX 并导航到 Dashboards 页面。
2. 点击右上角省略号下的 "Import Dashboard"。

<Image img={import_dashboard} alt="导入仪表盘"/>

3. 上传 nginx-logs-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 仪表盘会被创建，并预先配置好所有可视化组件 {#created-dashboard}

:::note
对于演示数据集，将时间范围设置为 **2025-10-20 11:00:00 - 2025-10-21 11:00:00 (UTC)**（可根据你的本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表盘"/>

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未加载

* 检查环境变量 CUSTOM&#95;OTELCOL&#95;CONFIG&#95;FILE 是否设置正确

```bash
docker exec <容器名称> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

* 检查自定义配置文件是否已挂载到 /etc/otelcol-contrib/custom.config.yaml

```bash
docker exec <容器名称> ls -lh /etc/otelcol-contrib/custom.config.yaml
```

* 查看自定义配置内容，确认其内容可读

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
```


### HyperDX 中未显示日志

* 确保 nginx 正在输出 JSON 格式的日志

```bash
tail -f /var/log/nginx/access.log
```

* 检查采集器是否能读取日志

```bash
docker exec `<container>` cat /var/log/nginx/access.log
```

* 确认有效配置中包含你的 filelog 接收器

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/effective.yaml | grep filelog
```

* 检查采集器日志是否存在错误

```bash
docker exec `<container>` cat /etc/otel/supervisor-data/agent.log
```


## 后续步骤 {#next-steps}

如果你希望进一步探索仪表板，可以尝试以下操作：

- 为关键指标设置告警（错误率、延迟阈值）
- 为特定使用场景创建额外的仪表板（API 监控、安全事件）