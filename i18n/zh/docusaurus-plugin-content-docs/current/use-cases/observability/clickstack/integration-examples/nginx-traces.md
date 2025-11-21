---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: '使用 ClickStack 监控 Nginx 追踪'
sidebar_label: 'Nginx 追踪'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Nginx 追踪'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', '追踪', 'otel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Nginx 追踪 {#nginx-traces-clickstack}

:::note[TL;DR]
本指南介绍如何从现有 Nginx 安装中捕获分布式追踪数据并在 ClickStack 中进行可视化。您将学习如何:

- 为 Nginx 添加 OpenTelemetry 模块
- 配置 Nginx 向 ClickStack 的 OTLP 端点发送追踪数据
- 验证追踪数据是否已显示在 HyperDX 中
- 使用预构建仪表板可视化请求性能(延迟、错误、吞吐量)

如果您希望在配置生产环境 Nginx 之前测试集成,可以使用包含示例追踪数据的演示数据集。

所需时间:5-10 分钟
::::


## 与现有 Nginx 集成 {#existing-nginx}

本节介绍如何通过安装 OpenTelemetry 模块并配置其向 ClickStack 发送追踪数据,为现有 Nginx 安装添加分布式追踪功能。
如果您希望在配置现有环境之前先测试集成,可以使用我们在[下一节](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)中提供的预配置环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- 运行中的 ClickStack 实例,且 OTLP 端点可访问(端口 4317/4318)
- 现有 Nginx 安装(版本 1.18 或更高)
- 具有 root 或 sudo 权限以修改 Nginx 配置
- ClickStack 主机名或 IP 地址

<VerticalStepper headerLevel="h4">

#### 安装 OpenTelemetry Nginx 模块 {#install-module}

为 Nginx 添加追踪功能最简单的方法是使用内置 OpenTelemetry 支持的官方 Nginx 镜像。

##### 使用 nginx:otel 镜像 {#using-otel-image}

将当前 Nginx 镜像替换为启用 OpenTelemetry 的版本:


```yaml
# In your docker-compose.yml or Dockerfile
image: nginx:1.27-otel
```

该镜像已预装 `ngx_otel_module.so` 模块,可直接使用。

:::note
如果您在 Docker 外运行 Nginx,请参阅 [OpenTelemetry Nginx 文档](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx)获取手动安装说明。
:::

#### 配置 Nginx 向 ClickStack 发送追踪数据 {#configure-nginx}

在 `nginx.conf` 文件中添加 OpenTelemetry 配置。该配置将加载模块并将追踪数据发送到 ClickStack 的 OTLP 端点。

首先,获取您的 API 密钥:

1. 在 ClickStack URL 打开 HyperDX
2. 导航至 Settings → API Keys
3. 复制 **Ingestion API Key**
4. 将其设置为环境变量:`export CLICKSTACK_API_KEY=your-api-key-here`

将以下内容添加到 `nginx.conf`:

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry 导出器配置
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }

    # 用于标识此 Nginx 实例的服务名称
    otel_service_name "nginx-proxy";

    # 启用追踪
    otel_trace on;

    server {
        listen 80;

        location / {
            # 为此 location 启用追踪
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";

            # 向追踪数据添加请求详情
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;

            # 您现有的代理或应用配置
            proxy_pass http://your-backend;
        }
    }
}
```

如果在 Docker 中运行 Nginx,请将环境变量传递给容器:

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

将 `<clickstack-host>` 替换为您的 ClickStack 实例主机名或 IP 地址。

:::note

- **端口 4317** 是 Nginx 模块使用的 gRPC 端点
- **otel_service_name** 应描述您的 Nginx 实例(例如 "api-gateway"、"frontend-proxy")
- 修改 **otel_service_name** 以匹配您的环境,便于在 HyperDX 中识别
  :::

##### 理解配置 {#understanding-configuration}

**追踪内容:**
每个发送到 Nginx 的请求都会创建一个追踪跨度,显示:

- 请求方法和路径
- HTTP 状态码
- 请求持续时间
- 时间戳

**跨度属性:**
`otel_span_attr` 指令为每个追踪添加元数据,允许您在 HyperDX 中按状态码、方法、路由等条件过滤和分析请求。

完成这些更改后,测试 Nginx 配置:

```bash
nginx -t
```


如果测试通过，则重新加载 Nginx：

```bash
# 针对 Docker
docker-compose restart nginx
```


# 适用于 systemd

sudo systemctl reload nginx

```

#### 在 HyperDX 中验证追踪 {#verifying-traces}

配置完成后,登录 HyperDX 并验证追踪数据是否正常流入。您应该会看到类似下图的内容,如果没有看到追踪数据,请尝试调整时间范围:

<Image img={view_traces} alt="查看追踪"/>

</VerticalStepper>
```


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 nginx 追踪集成的用户,我们提供了一个预生成的 Nginx 追踪样本数据集,包含真实的流量模式。

<VerticalStepper headerLevel="h4">

#### 启动 ClickStack {#start-clickstack}

如果您尚未运行 ClickStack,请使用以下命令启动:

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

继续操作前,请等待约 30 秒以便 ClickStack 完全初始化。

- 端口 8080:HyperDX Web 界面
- 端口 4317:OTLP gRPC 端点(由 nginx 模块使用)
- 端口 4318:OTLP HTTP 端点(用于演示追踪)

#### 下载样本数据集 {#download-sample}

下载样本追踪文件并将时间戳更新为当前时间:


```bash
# Download the traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

该数据集包含：

- 1,000 个具有真实时序的追踪 span
- 9 个不同的端点，具有不同的流量模式
- 约 93% 成功率（200）、约 3% 客户端错误（404）、约 4% 服务器错误（500）
- 延迟范围为 10 毫秒到 800 毫秒
- 保留原始流量模式，时间偏移至当前时间

#### 发送追踪数据到 ClickStack {#send-traces}

将您的 API 密钥设置为环境变量（如果尚未设置）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**获取您的 API 密钥：**

1. 在您的 ClickStack URL 打开 HyperDX
2. 导航至 Settings → API Keys
3. 复制您的 **Ingestion API Key**

然后将追踪数据发送到 ClickStack：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[在 localhost 上运行]
此演示假设 ClickStack 在本地的 `localhost:4318` 上运行。对于远程实例，请将 `localhost` 替换为您的 ClickStack 主机名。
:::

您应该会看到类似 `{"partialSuccess":{}}` 的响应，表示追踪数据已成功发送。所有 1,000 条追踪数据将被导入到 ClickStack 中。

#### 在 HyperDX 中验证追踪数据 {#verify-demo-traces}

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户（您可能需要先创建一个账户）
2. 导航至 Search 视图并将来源设置为 `Traces`
3. 将时间范围设置为 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

以下是您在搜索视图中应该看到的内容：

:::note[时区显示]
HyperDX 以您浏览器的本地时区显示时间戳。演示数据的时间跨度为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**。较宽的时间范围确保无论您身处何地都能看到演示追踪数据。一旦看到追踪数据，您可以将范围缩小到 24 小时以获得更清晰的可视化效果。
:::

<Image img={view_traces} alt='查看追踪数据' />

</VerticalStepper>


## 仪表板和可视化 {#dashboards}

为了帮助您开始使用 ClickStack 监控追踪,我们提供了追踪数据的基本可视化功能。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">下载</TrackedLink>仪表板配置 {#download}

#### 导入预构建的仪表板 {#import-dashboard}

1. 打开 HyperDX 并导航到仪表板部分。
2. 点击右上角省略号下的"Import Dashboard"。

<Image img={import_dashboard} alt='导入仪表板' />

3. 上传 nginx-trace-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt='完成导入' />

#### 仪表板将创建完成,所有可视化均已预配置。 {#created-dashboard}

:::note
对于演示数据集,请将时间范围设置为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**(根据您的本地时区进行调整)。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt='示例仪表板' />

</VerticalStepper>


## 故障排查 {#troubleshooting}

### HyperDX 中未显示追踪数据 {#no-traces}

**验证 nginx 模块是否已加载：**

```bash
nginx -V 2>&1 | grep otel
```

您应该能看到 OpenTelemetry 模块的相关信息。

**检查网络连接：**

```bash
telnet <clickstack-host> 4317
```

此命令应该能成功连接到 OTLP gRPC 端点。

**验证 API 密钥是否已设置：**

```bash
echo $CLICKSTACK_API_KEY
```

应该输出您的 API 密钥（非空）。


**检查 Nginx 错误日志：**

```bash
# 对于 Docker
docker logs <nginx-container> 2>&1 | grep -i otel
```


# 对于 systemd

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
查找 OpenTelemetry 相关错误。
```


**确认 nginx 正在接收请求：**

```bash
# 检查访问日志以确认流量
tail -f /var/log/nginx/access.log
```


## 后续步骤 {#next-steps}

如果您想进一步探索，以下是一些可以在仪表板上进行实验的后续步骤：

- 为关键指标设置告警（错误率、延迟阈值）
- 针对特定用例创建额外的仪表板（API 监控、安全事件）
