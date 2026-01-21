---
slug: /use-cases/observability/clickstack/integrations/aws-cloudwatch-logs
title: '使用 ClickStack 监控 AWS CloudWatch 日志'
sidebar_label: 'AWS CloudWatch 日志'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 AWS CloudWatch 日志'
doc_type: 'guide'
keywords: ['AWS', 'CloudWatch', 'OTEL', 'ClickStack', 'logs']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import api_key from '@site/static/images/clickstack/api-key.png';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view.png';
import demo_search_view from '@site/static/images/clickstack/cloudwatch/demo-search-view.png';
import error_log_overview from '@site/static/images/clickstack/cloudwatch/error-log-overview.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';


# 使用 ClickStack 监控 AWS CloudWatch 日志 \{#cloudwatch-clickstack\}

:::note[摘要]
本指南演示如何使用 OpenTelemetry Collector 的 AWS CloudWatch receiver 将 AWS CloudWatch 日志转发到 ClickStack。您将学习如何：

- 配置 OpenTelemetry Collector 以从 CloudWatch 拉取日志
- 设置 AWS 凭证和 IAM 权限
- 通过 OTLP 将 CloudWatch 日志发送到 ClickStack
- 过滤并自动发现日志组
- 使用预构建的仪表板可视化 CloudWatch 日志模式

如果您希望在配置生产 AWS 环境之前先测试集成，可以使用提供的包含示例日志的演示数据集。

所需时间：10–15 分钟
:::

## 概览 \{#overview\}

AWS CloudWatch 是一项用于监控 AWS 资源和应用程序的服务。虽然 CloudWatch 提供日志聚合功能，但将日志转发到 ClickStack 可以让你：

- 在统一的平台中将日志与指标和分布式追踪一起分析
- 使用 ClickHouse 的 SQL 接口查询日志
- 通过归档或缩短 CloudWatch 的保留期限来降低成本

本指南将说明如何使用 OpenTelemetry Collector 将 CloudWatch 日志转发到 ClickStack。

## 与现有 CloudWatch 日志组集成 \{#existing-cloudwatch\}

本节介绍如何配置 OpenTelemetry Collector，从现有的 CloudWatch 日志组中获取日志并将其转发到 ClickStack。

如果希望在配置生产环境之前先测试集成效果，可以使用我们的演示数据集进行测试，详见[演示数据集部分](#demo-dataset)。

### 先决条件 \{#prerequisites\}

- 已在运行的 ClickStack 实例
- 拥有 CloudWatch 日志组的 AWS 账户
- 具备相应 IAM 权限的 AWS 凭证

:::note
与基于文件的日志集成（如 nginx、Redis）不同，CloudWatch 需要运行一个独立的 OpenTelemetry Collector 来轮询 CloudWatch API。由于该 Collector 需要使用 AWS 凭证并访问 AWS API，因此无法在 ClickStack 的一体化镜像中运行。
:::

<VerticalStepper headerLevel="h4">
  #### 获取 ClickStack API 密钥

  OpenTelemetry Collector 将数据发送到 ClickStack 的 OTLP 端点，该端点需要进行身份验证。

  1. 在你的 ClickStack 地址（例如 [http://localhost:8080](http://localhost:8080)）打开 HyperDX
  2. 如有需要，请先创建账户或登录
  3. 前往 **Team Settings → API Keys**
  4. 复制您的**摄取 API key**

  <Image img={api_key} alt="ClickStack API 密钥" />

  将此值保存为环境变量:

  ```bash
  export CLICKSTACK_API_KEY="your-api-key-here"
  ```

  #### 配置 AWS 凭证

  将 AWS 凭证导出为环境变量。具体方法取决于您的身份验证类型：

  **对于 AWS SSO 用户(推荐大多数组织使用):**

  ```bash
  # Login to SSO
  aws sso login --profile YOUR_PROFILE_NAME

  # Export credentials to environment variables
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

  # Verify credentials work
  aws sts get-caller-identity
  ```

  将 `YOUR_PROFILE_NAME` 替换为您的 AWS SSO 配置文件名称(例如 `AccountAdministrators-123456789`)。

  **对于具有长期凭证的 IAM 用户：**

  ```bash
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"

  # Verify credentials work
  aws sts get-caller-identity
  ```

  **所需 IAM 权限：**

  与这些凭证关联的 AWS 账户需要以下 IAM 策略以读取 CloudWatch 日志:

  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "CloudWatchLogsRead",
        "Effect": "Allow",
        "Action": [
          "logs:DescribeLogGroups",
          "logs:FilterLogEvents"
        ],
        "Resource": "arn:aws:logs:*:YOUR_ACCOUNT_ID:log-group:*"
      }
    ]
  }
  ```

  将 `YOUR_ACCOUNT_ID` 替换为您的 AWS 账户 ID。

  #### 配置 CloudWatch 接收器

  创建一个 `otel-collector-config.yaml` 文件,配置 CloudWatch 接收器。

  **示例 1：命名日志组（推荐）**

  此配置从特定的命名日志组中收集日志：

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws/lambda/my-function:
            /aws/ecs/my-service:
            /aws/eks/my-cluster/cluster:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **示例 2：使用前缀自动发现日志组**

  此配置自动发现并收集最多 100 个以 `/aws/lambda` 为前缀的日志组的日志：

  ```yaml
  receivers:
    awscloudwatch:
      region: us-east-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws/lambda

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: http://localhost:4318
      headers:
        authorization: ${CLICKSTACK_API_KEY}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  ```

  **配置参数：**

  * `region`: 日志组所在的 AWS 区域
  * `poll_interval`: 检查新日志的时间间隔（例如，`1m`、`5m`）
  * `max_events_per_request`: 每个请求可拉取的日志事件数量上限
  * `groups.autodiscover.limit`: 自动发现的日志组的最大数量
  * `groups.autodiscover.prefix`: 根据前缀筛选日志组
  * `groups.named`: 显式列出要收集的日志组名称

  如需了解更多配置选项，请参阅 [CloudWatch 接收器文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)。

  **替换以下内容：**

  * `${CLICKSTACK_API_KEY}` → 使用您先前设置的环境变量
  * `http://localhost:4318` → ClickStack 端点地址（如为远程部署，请使用 ClickStack 主机地址）
  * `us-east-1` → 您的 AWS 区域
  * 日志组名称/前缀 → 您实际的 CloudWatch 日志组

  :::note
  CloudWatch 接收器仅获取最近时间窗口的日志(基于 `poll_interval`)。首次启动时从当前时间开始采集。默认不会检索历史日志。
  :::

  #### 启动收集器

  创建 `docker-compose.yaml` 文件：

  ```yaml
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - ./otel-collector-config.yaml:/etc/otel-config.yaml
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - CLICKSTACK_API_KEY
      restart: unless-stopped
      extra_hosts:
        - "host.docker.internal:host-gateway"
  ```

  然后启动收集器：

  ```bash
  docker compose up -d
  ```

  查看收集器日志：

  ```bash
  docker compose logs -f otel-collector
  ```

  #### 在 HyperDX 中验证日志

  收集器运行后：

  1. 在浏览器中打开 [http://localhost:8080](http://localhost:8080)（或您的 ClickStack URL）以访问 HyperDX
  2. 转到 **Logs** 视图
  3. 等待 1–2 分钟，日志会开始出现（具体时间取决于你的轮询间隔设置）
  4. 在 CloudWatch 日志组中搜索日志

  <Image img={log_search_view} alt="日志搜索视图" />

  在日志中查找这些关键属性：

  * `ResourceAttributes['aws.region']`：您的 AWS 区域（例如：“us-east-1”）
  * `ResourceAttributes['cloudwatch.log.group.name']`：CloudWatch 日志组名称
  * `ResourceAttributes['cloudwatch.log.stream']`: 日志流名称
  * `Body`: 实际的日志消息内容

  <Image img={error_log_column_values} alt="错误日志列值" />
</VerticalStepper>

## 演示数据集 {#demo-dataset}

对于希望在配置生产环境中的 AWS 之前先测试 CloudWatch 日志集成的用户，我们提供了一个示例数据集，其中包含预先生成的日志，展示了来自多个 AWS 服务的真实使用模式。

<VerticalStepper headerLevel="h4">

#### 下载示例数据集 \{#download-sample\}

```bash
curl -O https://datasets-documentation.s3.eu-west-3.amazonaws.com/clickstack-integrations/aws/cloudwatch/cloudwatch-logs.jsonl
```

该数据集包含来自多个服务、时长为 24 小时的 CloudWatch 日志：
- **Lambda functions**：支付处理、订单管理、身份验证
- **ECS services**：带有速率限制和超时配置的 API 网关
- **Background jobs**：带重试模式的批处理任务

#### 启动 ClickStack \{#start-clickstack\}

如果您尚未运行 ClickStack：

```bash
docker run -d --name clickstack \
  -p 8080:8080 -p 4317:4317 -p 4318:4318 \
  clickhouse/clickstack-all-in-one:latest
```

等待片刻，直到 ClickStack 完全启动。

#### 导入演示数据集 \{#import-demo-data\}

```bash
docker exec -i clickstack clickhouse-client --query="
  INSERT INTO default.otel_logs FORMAT JSONEachRow
" < cloudwatch-logs.jsonl
```

这会将日志直接导入到 ClickStack 的日志表中。

#### 验证演示数据 \{#verify-demo-logs\}

导入完成后：

1. 在浏览器中打开 http://localhost:8080 并登录（如有需要先创建账户）
2. 进入 **Logs** 视图
3. 将时间范围设置为 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**
4. 搜索 `cloudwatch-demo` 或按 `LogAttributes['source'] = 'cloudwatch-demo'` 进行过滤

您应该可以看到来自多个 CloudWatch 日志组的日志。

<Image img={demo_search_view} alt="演示搜索视图"/>

:::note[时区显示]
HyperDX 会使用您浏览器的本地时区显示时间戳。演示数据覆盖的时间范围为 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**。请将时间范围设置为 **2025-12-06 00:00:00 - 2025-12-09 00:00:00**，以确保无论您身在何处都能看到演示日志。确认可以看到日志后，可以再将范围缩小到 24 小时，以获得更清晰的可视化效果。
:::

</VerticalStepper>

## 仪表板和可视化 \{#dashboards\}

为了帮助您使用 ClickStack 监控 CloudWatch 日志，我们提供了一个预先构建好的仪表板，其中包含关键可视化图表。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \{#download\}

#### 导入仪表板 \{#import-dashboard\}

1. 打开 HyperDX 并导航到 Dashboards 部分
2. 在右上角的省略号菜单中点击 **Import Dashboard**

<Image img={import_dashboard} alt="Import dashboard button"/>

3. 上传 `cloudwatch-logs-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="Finish import dialog"/>

#### 查看仪表板 \{#created-dashboard\}

系统会创建仪表板，并预先配置好所有可视化图表：

<Image img={example_dashboard} alt="CloudWatch Logs dashboard"/>

:::note
对于示例数据集，将时间范围设置为 **2025-12-07 00:00:00 - 2025-12-08 00:00:00 (UTC)**（可根据您的本地时区进行调整）。导入的仪表板默认不会指定时间范围。
:::

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 在 HyperDX 中没有显示任何日志

**验证 AWS 凭证已正确配置：**

```bash
aws sts get-caller-identity
```

如果此步骤失败，则表示你的凭证无效或已过期。

**检查 IAM 权限：**
确保你的 AWS 凭证具有所需的 `logs:DescribeLogGroups` 和 `logs:FilterLogEvents` 权限。

**检查收集器日志中的错误：**

```bash
# If using Docker directly, logs appear in stdout
# If using Docker Compose:
docker compose logs otel-collector
```

常见错误：

* `The security token included in the request is invalid`：凭证无效或已过期。对于临时凭证（SSO），请确保已设置 `AWS_SESSION_TOKEN`。
* `operation error CloudWatch Logs: FilterLogEvents, AccessDeniedException`：IAM 权限不足
* `failed to refresh cached credentials, no EC2 IMDS role found`：未设置 AWS 凭证相关的环境变量
* `connection refused`：ClickStack 端点无法访问

**验证 CloudWatch 日志组是否存在且包含最近的日志：**

```bash
# List your log groups
aws logs describe-log-groups --region us-east-1

# Check if a specific log group has recent logs (last hour)
aws logs filter-log-events \
  --log-group-name /aws/lambda/my-function \
  --region us-east-1 \
  --start-time $(date -u -v-1H +%s)000 \
  --max-items 5
```


### 只看到旧日志或缺少最新日志

**CloudWatch receiver 默认从“当前时间”开始：**

当 collector 第一次启动时，它会在当前时间创建一个检查点，并且只获取该时间点之后的日志。之前的历史日志不会被拉取。

**如需采集最近一段时间的历史日志：**

先停止并删除该 collector 的检查点，然后重新启动：

```bash
# Stop the collector
docker stop <container-id>

# Restart fresh (checkpoints are stored in container, so removing it resets)
docker run --rm ...
```

接收器将创建一个新的检查点，并从当前时间开始拉取日志。


### 安全令牌无效 / 凭证已过期

如果使用临时凭证（AWS SSO、assumed role），这些凭证会在一段时间后失效。

**重新导出最新凭证：**

```bash
# For SSO users:
aws sso login --profile YOUR_PROFILE_NAME
eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)

# For IAM users:
export AWS_ACCESS_KEY_ID="your-key"
export AWS_SECRET_ACCESS_KEY="your-secret"

# Restart the collector
docker restart <container-id>
```


### 高延迟或缺失最近日志

**缩短轮询间隔：**
默认的 `poll_interval` 为 1 分钟。若需要接近实时的日志，请将该值适当调小：

```yaml
logs:
  poll_interval: 30s  # Poll every 30 seconds
```

**注意：** 轮询间隔越短，对 AWS API 的调用次数越多，可能会导致更高的 CloudWatch API 费用。


### Collector 内存占用过高

**减小批处理大小或增加超时时间：**

```yaml
processors:
  batch:
    timeout: 5s
    send_batch_size: 100
```

**限制自动发现范围：**

```yaml
groups:
  autodiscover:
    limit: 50  # Reduce from 100 to 50
```


## 后续步骤 {#next-steps}

现在 CloudWatch 日志已经持续流入 ClickStack：

- 为关键事件（连接失败、错误激增）[配置告警](/use-cases/observability/clickstack/alerts)
- 既然日志已经在 ClickStack 中，可以通过调整保留期或归档到 S3 来降低 CloudWatch 成本
- 通过在收集器配置中排除噪声较大的日志组来过滤噪声，从而减少摄取量

## 进入生产环境 {#going-to-production}

本指南演示如何使用 Docker Compose 在本地运行 OpenTelemetry Collector 进行测试。对于生产环境部署，应在具备 AWS 访问权限的基础设施上运行 Collector（带有 IAM 角色的 EC2、使用 IRSA 的 EKS，或带有任务角色的 ECS），以免手动管理访问密钥。将 Collector 部署在与 CloudWatch 日志组相同的 AWS 区域，以降低延迟和成本。

有关生产部署模式和 Collector 配置示例，请参阅[使用 OpenTelemetry 进行数据摄取](/use-cases/observability/clickstack/ingesting-data/opentelemetry)。