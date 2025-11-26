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


# 使用 ClickStack 监控 Nginx 链路追踪 {#nginx-traces-clickstack}

:::note[摘要]
本指南演示如何从现有的 Nginx 部署中捕获分布式链路追踪数据，并在 ClickStack 中进行可视化。您将学习如何：

- 为 Nginx 添加 OpenTelemetry 模块
- 配置 Nginx 将追踪数据发送到 ClickStack 的 OTLP 端点
- 验证追踪是否出现在 HyperDX 中
- 使用预构建的仪表板可视化请求性能（延迟、错误、吞吐量）

如果您希望在为生产环境中的 Nginx 进行配置之前先测试集成，可以使用提供的演示数据集和示例追踪。

所需时间：5–10 分钟
::::



## 与现有 Nginx 集成 {#existing-nginx}

本节介绍如何通过安装 OpenTelemetry 模块，并将其配置为向 ClickStack 发送追踪数据，为现有的 Nginx 部署添加分布式追踪功能。
如需在修改自己的现有环境之前先验证集成效果，可以在[以下章节](/use-cases/observability/clickstack/integrations/nginx-traces#demo-dataset)中使用我们预先配置的环境和示例数据进行测试。

##### 前提条件 {#prerequisites}

- 已运行的 ClickStack 实例，并且 OTLP 端点可访问（端口 4317/4318）
- 已部署的 Nginx（版本 1.18 或更高）
- 拥有修改 Nginx 配置的 root 或 sudo 权限
- ClickStack 的主机名或 IP 地址

<VerticalStepper headerLevel="h4">

#### 安装 OpenTelemetry Nginx 模块 {#install-module}

向 Nginx 添加追踪功能的最简单方式是使用官方提供的、内置 OpenTelemetry 支持的 Nginx 镜像。

##### 使用 nginx:otel 镜像 {#using-otel-image}

将当前使用的 Nginx 镜像替换为启用 OpenTelemetry 的版本：


```yaml
# 在你的 docker-compose.yml 或 Dockerfile 中
image: nginx:1.27-otel
```

此镜像已预装 `ngx_otel_module.so`，可直接使用。

:::note
如果您在 Docker 之外运行 Nginx，请参考 [OpenTelemetry Nginx 文档](https://github.com/open-telemetry/opentelemetry-cpp-contrib/tree/main/instrumentation/nginx) 获取手动安装说明。
:::

#### 配置 Nginx 将 traces 发送到 ClickStack

在您的 `nginx.conf` 文件中添加 OpenTelemetry 配置。该配置会加载该模块，并将 traces 定向到 ClickStack 的 OTLP 端点。

首先获取您的 API key：

1. 在您的 ClickStack URL 上打开 HyperDX
2. 导航到 Settings → API Keys
3. 复制您的 **摄取 API key**
4. 将其设置为环境变量：`export CLICKSTACK_API_KEY=your-api-key-here`

将以下内容添加到您的 `nginx.conf` 中：

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
    
    # 用于标识该 Nginx 实例的服务名
    otel_service_name "nginx-proxy";
    
    # 启用链路追踪
    otel_trace on;
    
    server {
        listen 80;
        
        location / {
            # 为此 location 启用链路追踪
            otel_trace_context propagate;
            otel_span_name "$request_method $uri";
            
            # 将请求详情添加到追踪数据中
            otel_span_attr http.status_code $status;
            otel_span_attr http.request.method $request_method;
            otel_span_attr http.route $uri;
            
            # 现有代理或应用程序的配置
            proxy_pass http://your-backend;
        }
    }
}
```

如果在 Docker 中运行 Nginx 时，请将该环境变量传递给容器：

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

* **端口 4317** 是供 Nginx 模块使用的 gRPC 端点
* **otel&#95;service&#95;name** 应该能够清晰描述你的 Nginx 实例（例如，“api-gateway”、“frontend-proxy”）
* 修改 **otel&#95;service&#95;name** 以匹配你的环境，便于在 HyperDX 中识别
  :::

##### 理解该配置

**会被跟踪的内容：**
每个发往 Nginx 的请求都会创建一个 trace span，其中包括：

* 请求方法和路径
* HTTP 状态码
* 请求耗时
* 时间戳

**Span 属性：**
`otel_span_attr` 指令为每个 trace 添加元数据，使你可以在 HyperDX 中按状态码、方法、路由等对请求进行过滤和分析。

完成这些更改后，测试你的 Nginx 配置：

```bash
nginx -t
```


如果测试通过，请重新加载 Nginx：

```bash
# 适用于 Docker
docker-compose restart nginx
```


# 使用 systemd 时

sudo systemctl reload nginx

```

#### 在 HyperDX 中验证跟踪数据 {#verifying-traces}

完成配置后，登录 HyperDX 并确认跟踪数据已开始正常接入；此时应能看到类似下图的界面。如果未看到任何跟踪数据，请尝试调整时间范围：

<Image img={view_traces} alt="查看跟踪数据"/>

</VerticalStepper>
```


## 演示数据集 {#demo-dataset}

对于希望在配置生产系统之前测试 nginx 跟踪集成的用户，我们提供一个预先生成的 Nginx 跟踪示例数据集，其流量模式接近真实场景。

<VerticalStepper headerLevel="h4">

#### 启动 ClickStack {#start-clickstack}

如果尚未运行 ClickStack，可通过以下命令启动：

```bash
docker run --name clickstack-demo \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  docker.hyperdx.io/hyperdx/hyperdx-all-in-one:latest
```

请等待大约 30 秒，让 ClickStack 完成初始化后再继续。

- 端口 8080：HyperDX Web 界面
- 端口 4317：OTLP gRPC 端点（供 nginx 模块使用）
- 端口 4318：OTLP HTTP 端点（用于演示跟踪数据）

#### 下载示例数据集 {#download-sample}

下载示例跟踪文件，并将时间戳更新为当前时间：


```bash
# 下载 traces 数据
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/nginx-traces-sample.json
```

该数据集包括：

- 1,000 个具有真实时序特征的 trace span
- 9 个具有不同流量模式的端点
- 约 93% 成功率（200），约 3% 客户端错误（404），约 4% 服务器错误（500）
- 延迟范围从 10ms 到 800ms
- 保留原始流量模式，仅将时间整体平移到当前时间

#### 将 traces 发送到 ClickStack {#send-traces}

将你的 API key 设置为环境变量（如果尚未设置）：

```bash
export CLICKSTACK_API_KEY=your-api-key-here
```

**获取你的 API key：**

1. 在你的 ClickStack 地址中打开 HyperDX
2. 依次进入 Settings → API Keys
3. 复制你的 **摄取 API key**

然后将这些 traces 发送到 ClickStack：

```bash
curl -X POST http://localhost:4318/v1/traces \
  -H "Content-Type: application/json" \
  -H "Authorization: $CLICKSTACK_API_KEY" \
  -d @nginx-traces-sample.json
```

:::note[在 localhost 上运行]
本演示假设 ClickStack 本地运行在 `localhost:4318` 上。对于远程实例，请将 `localhost` 替换为你的 ClickStack 主机名。
:::

你应该会看到类似 `{"partialSuccess":{}}` 的响应，表示 traces 已成功发送。全部 1,000 条 traces 都将被摄取到 ClickStack 中。

#### 在 HyperDX 中验证 traces {#verify-demo-traces}

1. 打开 [HyperDX](http://localhost:8080/) 并登录你的账户（如果尚未注册账户，可能需要先创建一个）
2. 进入 Search 视图，并将来源设置为 `Traces`
3. 将时间范围设置为 **2025-10-25 13:00:00 - 2025-10-28 13:00:00**

在搜索视图中，你应当看到如下内容：

:::note[时区显示]
HyperDX 会按照你浏览器的本地时区显示时间戳。演示数据的时间范围为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00（UTC）**。较宽的时间范围可确保无论你位于何处，都能看到演示 traces。看到 traces 之后，你可以将时间范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

<Image img={view_traces} alt='查看 traces' />

</VerticalStepper>


## 仪表盘与可视化 {#dashboards}

为了帮助你开始使用 ClickStack 监控链路追踪（traces），我们为追踪数据提供了一些基础的可视化视图。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/nginx-traces-dashboard.json')} download="nginx-traces-dashboard.json" eventName="docs.nginx_traces_monitoring.dashboard_download">下载</TrackedLink> 仪表盘配置 {#download}

#### 导入预构建的仪表盘 {#import-dashboard}
1. 打开 HyperDX 并进入 Dashboards 页面。
2. 点击右上角省略号下的 "Import Dashboard"。

<Image img={import_dashboard} alt="导入仪表盘"/>

3. 上传 nginx-trace-dashboard.json 文件并点击完成导入。

<Image img={finish_import} alt="完成导入"/>

#### 仪表盘将会被创建，并预先配置好所有可视化视图。 {#created-dashboard}

:::note
对于演示数据集，将时间范围设置为 **2025-10-26 13:00:00 - 2025-10-27 13:00:00 (UTC)**（可根据本地时区进行调整）。导入的仪表盘默认不会指定时间范围。
:::

<Image img={example_dashboard} alt="示例仪表盘"/>

</VerticalStepper>



## 故障排查

### 在 HyperDX 中没有任何追踪数据

**确认已加载 nginx 模块：**

```bash
nginx -V 2>&1 | grep otel
```

你应该会看到对 OpenTelemetry 模块的引用。

**检查网络连通性：**

```bash
telnet <clickstack-host> 4317
```

应该能够成功连接到 OTLP gRPC 端点。

**验证是否已设置 API 密钥：**

```bash
echo $CLICKSTACK_API_KEY
```

应输出你的 API 密钥（非空）。


**检查 Nginx 错误日志：**

```bash
# 适用于 Docker
docker logs <nginx-container> 2>&1 | grep -i otel
```


# 适用于 systemd

sudo tail -f /var/log/nginx/error.log | grep -i otel

```
查找 OpenTelemetry 相关错误。
```


**验证 Nginx 是否正在接收请求：**

```bash
# 检查访问日志以确认流量情况
tail -f /var/log/nginx/access.log
```


## 后续步骤 {#next-steps}
如果你想进一步探索，可以尝试以下操作，在仪表板上进行更多实验：

- 为关键指标设置告警（错误率、延迟阈值）
- 为特定用例创建其他仪表板（API 监控、安全事件）
