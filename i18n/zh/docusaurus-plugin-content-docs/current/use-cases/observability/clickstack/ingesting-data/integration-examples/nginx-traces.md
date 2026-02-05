---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: '使用 ClickStack 监控 Nginx 链路追踪'
sidebar_label: 'Nginx 链路追踪'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Nginx 链路追踪'
doc_type: 'guide'
keywords: ['ClickStack', 'Nginx', 'traces', 'otel']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/finish-nginx-traces-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/nginx-traces-dashboard.png';
import view_traces from '@site/static/images/clickstack/nginx-traces-search-view.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 Nginx 链路追踪 \{#nginx-traces-clickstack\}

:::note[要点概述]
本指南将向您展示如何从现有的 Nginx 部署中采集分布式链路追踪数据（traces），并在 ClickStack 中进行可视化。您将学习如何：

- 为 Nginx 添加 OpenTelemetry 模块
- 配置 Nginx 将 traces 发送到 ClickStack 的 OTLP 端点
- 验证 traces 是否出现在 HyperDX 中
- 使用预构建的仪表盘可视化请求性能（延迟、错误、吞吐量）

如果您希望在为生产环境 Nginx 配置集成之前先进行测试，可以使用包含示例 traces 的演示数据集。

所需时间：5–10 分钟
::::

## 与现有 Nginx 集成 \{#existing-nginx\}

本节介绍如何通过安装 OpenTelemetry 模块并将其配置为向 ClickStack 发送追踪数据，为你现有的 Nginx 实例添加分布式追踪功能。
如果你希望在对自身环境进行配置之前先测试该集成，可以使用我们预配置的环境和示例数据进行验证，详见[以下章节](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)。

##### 先决条件 \{#prerequisites\}

- 正在运行的 ClickStack 实例，并且 OTLP 端点可访问（端口 4317/4318）
- 已有的 Nginx 安装（版本 1.18 或更高）
- 拥有修改 Nginx 配置的 root 或 sudo 权限
- ClickStack 主机名或 IP 地址

<VerticalStepper headerLevel="h4">

#### 安装 OpenTelemetry Nginx 模块 \{#install-module\}

为 Nginx 添加链路追踪的最简单方式，是使用内置 OpenTelemetry 支持的官方 Nginx 镜像。

##### 使用 nginx:otel 镜像 \{#using-otel-image\}

将当前的 Nginx 镜像替换为启用 OpenTelemetry 的版本：

```yaml
# 在你的 docker-compose.yml 或 Dockerfile 中
image: nginx:1.27-otel
```

此镜像预装了 `ngx_otel_module.so`，可直接使用。

:::note
如果你在 Docker 之外运行 Nginx，请参考 [OpenTelemetry Nginx 文档](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) 获取手动安装说明。
:::

#### 配置 Nginx 将追踪发送到 ClickStack \{#configure-nginx\}

在 `nginx.conf` 中添加 OpenTelemetry 配置。该配置会加载模块，并将追踪数据发送到 ClickStack 的 OTLP 端点。

首先，获取你的 API key：
1. 在 ClickStack URL 上打开 HyperDX
2. 进入 Settings → API Keys  
3. 复制你的 **摄取 API key**
4. 将其设置为环境变量：`export CLICKSTACK_API_KEY=your-api-key-here`

在你的 `nginx.conf` 中添加以下内容：

```yaml
load_module modules/ngx_otel_module.so;

events {
    worker_connections 1024;
}

http {
    # OpenTelemetry exporter 配置
    otel_exporter {
        endpoint <clickstack-host>:4317;
        header authorization ${CLICKSTACK_API_KEY};
    }
    
    # 用于标识该 nginx 实例的服务名
    otel_service_name "nginx-proxy";
    
    # 启用链路追踪
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # 为该 location 启用链路追踪
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # 将请求详情添加到追踪中
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # 你现有的代理或应用配置
            proxy_pass http://your-backend;
        }
    }
}
```

如果在 Docker 中运行 Nginx，将环境变量传递给容器：

```yaml
services:
  nginx:
    image: nginx:1.27-otel
    environment:
      - CLICKSTACK_API_KEY=${CLICKSTACK_API_KEY}
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
```

将 `<clickstack-host>` 替换为你的 ClickStack 实例的主机名或 IP 地址。

:::note
- **端口 4317** 是 Nginx 模块使用的 gRPC 端点
- **otel_service_name** 应当对你的 Nginx 实例具有描述性（例如："api-gateway"、"frontend-proxy"）
- 根据你的环境修改 **otel_service_name**，以便在 HyperDX 中更容易识别
:::

##### 配置说明 \{#understanding-configuration\}

**会被追踪的内容：**
每个对 Nginx 的请求都会创建一个 trace span，用于展示：
- 请求方法和路径
- HTTP 状态码
- 请求时长
- 时间戳

**Span 属性：**
`otel_span_attr` 指令会为每个 trace 添加元数据，使你可以在 HyperDX 中按状态码、方法、路由等过滤和分析请求。

完成这些更改后，测试你的 Nginx 配置：
```bash
nginx -t
```

如果测试通过，重新加载 Nginx：
```bash
# 对于 Docker
docker-compose restart nginx

# 对于 systemd
sudo systemctl reload nginx
```

#### 在 HyperDX 中验证追踪数据 \{#verifying-traces\}

配置完成后，登录 HyperDX 并验证追踪数据是否正常流入。如果未看到追踪数据，可尝试调整时间范围，你应能看到类似如下的界面：

<Image img={view_traces} alt="查看追踪数据"/>

</VerticalStepper>

## 演示数据集 \{#demo-dataset\}

对于希望在配置生产系统之前先测试 Nginx Trace 集成的用户，我们提供了一个预生成的 Nginx Traces 示例数据集，其中包含逼真的流量模式。

<VerticalStepper headerLevel="h4">

#### 启动 ClickStack \{#start-clickstack\}

如果您尚未运行 ClickStack，请使用以下命令启动：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待大约 30 秒，让 ClickStack 完全初始化后再继续。

- 端口 8080：HyperDX Web 界面
- 端口 4317：OTLP gRPC 端点（由 Nginx 模块使用）
- 端口 4318：OTLP HTTP 端点（用于演示 traces）

#### 下载示例数据集 \{#download-sample\}

下载示例 traces 文件，并将时间戳更新为当前时间：

```bash
# 下载 traces
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

该数据集包括：
- 1,000 个具有真实时序的 trace span
- 9 个不同的端点，具有不同的流量模式
- 约 93% 成功率（200）、约 3% 客户端错误（404）、约 4% 服务端错误（500）
- 延迟范围从 10ms 到 800ms
- 保留原始流量模式，并平移到当前时间

#### 向 ClickStack 发送 traces \{#send-traces\}

将您的 API key 设置为环境变量（如果尚未设置）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**获取您的 API key：**
1. 在您的 ClickStack URL 上打开 HyperDX
2. 转到 Settings → API Keys
3. 复制您的 **摄取 API key**

然后将 traces 发送到 ClickStack：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[在 localhost 上运行]
此演示假设 ClickStack 在本地 `localhost:4318` 上运行。对于远程实例，请将 `localhost` 替换为您的 ClickStack 主机名。
:::

您应该会看到类似 `{"partialSuccess":{}}` 的响应，表示 traces 已成功发送。所有 1,000 条 traces 都会被摄取到 ClickStack 中。

#### 在 HyperDX 中验证 traces \{#verify-demo-traces\}

1. 打开 [HyperDX](http://localhost:8080/) 并登录您的账户（可能需要先创建一个账户）
2. 导航到 Search 视图，将 source 设置为 `Traces`
3. 将时间范围设置为 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

在搜索视图中，您应当会看到类似如下的内容：

:::note[时区显示]
HyperDX 以浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**。使用较宽的时间范围可以确保无论您身处何地都能看到演示 traces。一旦看到这些 traces，您可以将范围收窄到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={view_traces} alt="查看 Traces"/>

</VerticalStepper>

## 仪表板与可视化 \{#dashboards\}

为了帮助您开始使用 ClickStack 监控 traces，我们提供了针对 trace 数据的关键可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入预构建的仪表板 \{#import-dashboard\}
1. 打开 HyperDX 并进入 Dashboards 部分。
2. 点击右上角省略号下方的“Import Dashboard”。

<Image img={import_dashboard} alt="导入仪表板"/>

3. 上传 nginx-trace-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 仪表板将会创建完成，并预先配置好所有可视化视图。 \{#created-dashboard\}

:::note
对于演示数据集，将时间范围设置为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**（可根据您的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表板"/>

</VerticalStepper>

## 故障排查 \{#troubleshooting\}

### HyperDX 中未显示任何 trace \{#no-traces\}

**验证 Nginx 模块是否已加载：**

```bash
nginx -V 2>&1 | grep otel
```

你应该能看到对 OpenTelemetry 模块的引用。

**检查网络连通性：**

```bash
telnet <clickstack-host> 4317
```

现在应已成功连接到 OTLP gRPC 端点。

**验证 API key 是否已设置：**

```bash
echo $CLICKSTACK_API_KEY
```

应输出你的 API 密钥（非空）。

**检查 nginx 错误日志：**

```bash
# For Docker
docker logs <nginx-container> 2>&1 | grep -i otel

# For systemd
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

查看是否存在与 OpenTelemetry 相关的错误。

**检查 nginx 是否正在接收请求：**

```bash
# Check access logs to confirm traffic
tail -f /var/log/nginx/access.log
```


## 后续步骤 \{#next-steps\}

如果你想进一步探索，可以从以下几个方面对仪表盘进行实验：

- 为关键指标设置告警（错误率、延迟阈值）
- 为特定使用场景创建附加仪表盘（API 监控、安全事件）