---
slug: /use-cases/observability/clickstack/integrations/nginx-traces
title: '使用 ClickStack 监控 Nginx 追踪'
sidebar_label: 'Nginx 追踪'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Nginx 追踪'
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

# 使用 ClickStack 监控 Nginx 链路追踪 {#nginx-traces-clickstack}

:::note[TL;DR]
本指南演示如何从现有的 Nginx 部署中捕获分布式链路追踪（traces），并在 ClickStack 中对其进行可视化。您将学习如何：

- 为 Nginx 添加 OpenTelemetry 模块
- 配置 Nginx 将 traces 发送到 ClickStack 的 OTLP 端点
- 验证 traces 已出现在 HyperDX 中
- 使用预构建的仪表板可视化请求性能（延迟、错误、吞吐量）

如果您希望在为生产环境中的 Nginx 配置前先测试集成，可以使用提供的包含示例 traces 的演示数据集。

所需时间：5–10 分钟
::::

## 与现有 Nginx 集成 {#existing-nginx}

本节介绍如何通过安装 OpenTelemetry 模块，并将其配置为向 ClickStack 发送追踪数据，为你现有的 Nginx 部署添加分布式追踪功能。
如果你希望在配置自己的现有环境之前先测试集成效果，可以使用我们预先配置的环境和示例数据进行测试，详见[以下章节](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)。

##### 前置条件 {#prerequisites}

- 已运行的 ClickStack 实例，并且 OTLP 端点可访问（端口 4317/4318）
- 已安装 Nginx（版本 1.18 或更高）
- 拥有 root 或 sudo 权限以修改 Nginx 配置
- ClickStack 主机名或 IP 地址

<VerticalStepper headerLevel="h4">

#### 安装 OpenTelemetry Nginx 模块 {#install-module}

为 Nginx 添加追踪的最简单方式是使用已内置 OpenTelemetry 支持的官方 Nginx 镜像。

##### 使用 nginx:otel 镜像 {#using-otel-image}

将你当前的 Nginx 镜像替换为启用 OpenTelemetry 的版本：

```yaml
# 在你的 docker-compose.yml 或 Dockerfile 中 {#in-your-docker-composeyml-or-dockerfile}
image: nginx:1.27-otel
```

该镜像已预装 `ngx_otel_module.so` 模块，可直接使用。

:::note
如果你在 Docker 之外运行 Nginx，请参考 [OpenTelemetry Nginx 文档](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) 以获取手动安装说明。
:::

#### 配置 Nginx 将追踪发送至 ClickStack {#configure-nginx}

在你的 `nginx.conf` 文件中添加 OpenTelemetry 配置。该配置会加载模块，并将追踪数据发送到 ClickStack 的 OTLP 端点。

首先，获取你的 API key：
1. 通过 ClickStack 的 URL 打开 HyperDX
2. 导航到 Settings → API Keys  
3. 复制你的 **摄取 API key（Ingestion API Key）**
4. 将其设置为环境变量：`export CLICKSTACK_API_KEY=your-api-key-here`

将以下内容添加到你的 `nginx.conf` 中：

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

将 `<clickstack-host>` 替换为你的 ClickStack 实例主机名或 IP 地址。

:::note
- **端口 4317** 是 Nginx 模块使用的 gRPC 端点
- **otel_service_name** 应具有描述性，用于标识你的 Nginx 实例（例如："api-gateway"、"frontend-proxy"）
- 修改 **otel_service_name** 以匹配你的环境，方便在 HyperDX 中进行识别
:::

##### 配置说明 {#understanding-configuration}

**会被追踪的内容：**
每个到 Nginx 的请求都会创建一个 trace span，显示：
- 请求方法和路径
- HTTP 状态码
- 请求耗时
- 时间戳

**Span 属性：**
`otel_span_attr` 指令为每个 trace 添加元数据，使你可以按状态码、方法、路由等在 HyperDX 中过滤和分析请求。

完成这些更改后，测试你的 Nginx 配置：
```bash
nginx -t
```

如果测试通过，重新加载 Nginx：
```bash
# 对于 Docker {#for-docker}
docker-compose restart nginx

# 对于 systemd {#for-systemd}
sudo systemctl reload nginx
```

#### 在 HyperDX 中验证追踪 {#verifying-traces}

配置完成后，登录 HyperDX 并验证追踪数据是否正常流入，你应当能看到类似如下的画面；如果没有看到追踪数据，尝试调整时间范围：

<Image img={view_traces} alt="查看追踪"/>

</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 nginx trace 集成的用户，我们提供了一个预生成的 Nginx trace 示例数据集，包含接近真实的流量模式。

<VerticalStepper headerLevel="h4">

#### 启动 ClickStack {#start-clickstack}

如果你还没有运行 ClickStack，请通过以下命令启动：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

在继续之前，请等待大约 30 秒，以便 ClickStack 完全初始化。

- 端口 8080：HyperDX Web 界面
- 端口 4317：OTLP gRPC 端点（由 nginx 模块使用）
- 端口 4318：OTLP HTTP 端点（用于演示 trace）

#### 下载示例数据集 {#download-sample}

下载示例 trace 文件，并将时间戳更新为当前时间：

```bash
# Download the traces {#download-the-traces}
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

该数据集包含：
- 1,000 个具有真实时序的 trace span
- 9 个不同的端点，具有不同的流量模式
- ~93% 成功率（200），~3% 客户端错误（404），~4% 服务端错误（500）
- 延迟范围从 10ms 到 800ms
- 保留原始流量模式，并平移到当前时间

#### 将 trace 发送到 ClickStack {#send-traces}

将你的 API key 设置为环境变量（如果尚未设置）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**获取你的 API key：**
1. 在你的 ClickStack URL 上打开 HyperDX
2. 进入 Settings → API Keys
3. 复制你的 **摄取 API key（Ingestion API Key）**

然后将 trace 发送到 ClickStack：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[在 localhost 上运行]
此演示假设 ClickStack 在本地 `localhost:4318` 上运行。对于远程实例，请将 `localhost` 替换为你的 ClickStack 主机名。
:::

你应当看到类似 `{"partialSuccess":{}}` 的响应，表明 trace 已成功发送。全部 1,000 条 trace 都会被摄取到 ClickStack 中。

#### 在 HyperDX 中验证 trace {#verify-demo-traces}

1. 打开 [HyperDX](http://localhost:8080/) 并登录你的账户（可能需要先创建账户）
2. 进入 Search 视图，并将 source 设置为 `Traces`
3. 将时间范围设置为 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

在搜索视图中，你应当能看到如下内容：

:::note[时区显示]
HyperDX 会以浏览器本地时区显示时间戳。演示数据覆盖的时间为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**。使用较宽的时间范围可确保无论你身处何地，都能看到演示 trace。一旦看到 trace，你可以将范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={view_traces} alt="查看 trace"/>

</VerticalStepper>

## 仪表板与可视化 {#dashboards}

为帮助您开始使用 ClickStack 监控追踪数据，我们提供了一些用于 trace 数据的基础可视化配置。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 {#download}

#### 导入预构建仪表板 {#import-dashboard}
1. 打开 HyperDX 并进入 Dashboards 页面。
2. 点击右上角省略号菜单中的 "Import Dashboard"。

<Image img={import_dashboard} alt="导入仪表板"/>

3. 上传 nginx-trace-dashboard.json 文件，并点击“完成导入”。

<Image img={finish_import} alt="完成导入"/>

#### 仪表板将被创建，并包含所有预先配置好的可视化视图。 {#created-dashboard}

:::note
对于演示数据集，请将时间范围设置为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表板"/>

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 在 HyperDX 中看不到任何追踪数据 {#no-traces}

**确认已加载 nginx 模块：**

```bash
nginx -V 2>&1 | grep otel
```

你应该会看到对 OpenTelemetry 模块的引用。

**检查网络连通性：**

```bash
telnet <clickstack-主机> 4317
```

这应该可以成功连接到 OTLP gRPC 端点。

**验证已设置 API 密钥：**

```bash
echo $CLICKSTACK_API_KEY
```

应当输出你的 API 密钥（不应为空）。

**检查 nginx 错误日志：**

```bash
# Docker 环境 {#for-docker}
docker logs <nginx-container> 2>&1 | grep -i otel

# systemd 环境 {#for-systemd}
sudo tail -f /var/log/nginx/error.log | grep -i otel
```

查找 OpenTelemetry 相关错误。

**验证 nginx 是否正在接收请求：**

```bash
# 检查访问日志以确认流量 {#check-access-logs-to-confirm-traffic}
tail -f /var/log/nginx/access.log
```

## 后续步骤 {#next-steps}

如果你想进一步探索，可以尝试以下步骤来体验和优化你的仪表板：

- 为关键指标（错误率、延迟阈值）设置告警
- 为特定用例（API 监控、安全事件）创建额外的仪表板