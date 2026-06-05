---
slug: /use-cases/observability/clickstack/monitoring-aws-cloudwatch-logs
title: '监控 AWS CloudWatch 日志'
description: '通过 OpenTelemetry CloudWatch 接收器将 AWS CloudWatch 日志转发到托管 ClickStack'
doc_type: 'guide'
keywords: ['clickstack', 'aws', 'cloudwatch', '日志', '托管', '可观测性', 'otel']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud-v2.png';
import log_search_view from '@site/static/images/clickstack/cloudwatch/log-search-view-clickstack.png';
import log_search_attributes_view from '@site/static/images/clickstack/cloudwatch/log-search-attributes-clickstack.png';
import error_log_column_values from '@site/static/images/clickstack/cloudwatch/error-log-column-values-clickstack.png';
import import_dashboard from '@site/static/images/clickstack/clickstack-import-dashboard.png';
import finish_import from '@site/static/images/clickstack/cloudwatch/finish-clickstack-import.png';
import example_dashboard from '@site/static/images/clickstack/cloudwatch/logs-dashboard.png';

本指南将引导你使用 OpenTelemetry [`awscloudwatch` 接收器](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)，将 AWS CloudWatch 日志转发到托管 ClickStack，然后在 ClickStack UI 中查看这些日志。

我们将运行一个独立的收集器，通过 AWS API 轮询 CloudWatch，并通过 OTLP 将事件转发到你的 ClickStack 收集器。为尽量降低 API 延迟和成本，请将此收集器部署在与这些日志组相同的 AWS 账户和区域中。

本指南假设你已完成[设置你的 OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)，并且已有一个正在运行的 ClickStack 收集器。

ClickStack 收集器既可以部署为 **Docker 容器** (参见[设置你的 OpenTelemetry Collector](/use-cases/observability/clickstack/setting-up-your-opentelemetry-collector)) ，也可以在 Kubernetes 中使用上游 OpenTelemetry Helm 图表和 ClickStack 收集器镜像部署为 **Helm 发布** (参见[部署收集器](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector)) 。**请确保你已记录其 OTLP 端点** 以及部署时设置的 `OTLP_AUTH_TOKEN`。

<VerticalStepper headerLevel="h2">
  ## 准备前置条件 \{#gather-prerequisites\}

  您需要：

  * 一个**AWS 账户**，其中包含一个或多个 CloudWatch 日志组，以及具备以下 IAM 权限的凭证。
  * 一台已安装 **Docker**、具有 AWS API 访问权限，并且能够通过出站网络访问你的 ClickStack collector 的主机。通常，这是与日志组位于同一 AWS 账户和区域中的一台 EC2 实例。
  * 你的 ClickStack collector 的 **OTLP 端点**，应可从此主机访问。如果它在同一台机器上的 Docker 中运行，请使用 `http://host.docker.internal:4318` (请参见[配置 CloudWatch receiver](#configure-receiver)中的说明) 。对于远程 collector，请使用其完整 URL，例如 `https://otel.example.com:4318`。
  * 你在 ClickStack collector 中设置的 `OTLP_AUTH_TOKEN` 值。如果未启用安全保护，可以从下方配置中删除 `authorization` 请求头。

  ## 配置 AWS 凭证 \{#configure-aws\}

  receiver 从标准环境变量中读取 AWS 凭据。请在运行 collector 的主机上导出这些环境变量。

  **适用于 AWS SSO 用户：**

  ```shell
  aws sso login --profile YOUR_PROFILE_NAME
  eval $(aws configure export-credentials --profile YOUR_PROFILE_NAME --format env)
  aws sts get-caller-identity
  ```

  **对于使用长期凭证的 IAM 用户：**

  ```shell
  export AWS_ACCESS_KEY_ID="your-access-key-id"
  export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
  export AWS_REGION="us-east-1"
  aws sts get-caller-identity
  ```

  凭证需要以下 IAM 策略才能读取 CloudWatch 日志：

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

  :::note 生产环境凭证
  在生产环境中，建议优先使用与实例绑定的凭证，而非长期密钥：例如 EC2 上的 IAM 角色、EKS 上的 IRSA，或 ECS 上的任务角色。当接收器能够从实例元数据服务解析凭证时，下方的采集器配置无需设置任何凭证环境变量即可正常运行。
  :::

  ## 配置 CloudWatch receiver \{#configure-receiver\}

  导出您的 ClickStack collector 端点和认证令牌，然后创建 `otel-collector-config.yaml`。

  :::note 同主机部署
  以下示例假设 ClickStack collector 与此 CloudWatch collector 运行在同一主机上，因此 receiver 通过 `host.docker.internal` (从容器内部访问 Docker 宿主机的地址) 连接到它。如果您的 ClickStack collector 部署在其他位置 (集群内服务、公网 URL 或私有 IP) ，请将其地址替换为下方 `OTEL_COLLECTOR_ENDPOINT` 的值。
  :::

  ```shell
  export OTEL_COLLECTOR_ENDPOINT="http://host.docker.internal:4318"
  export OTLP_AUTH_TOKEN="a-strong-shared-secret"
  ```

  <details>
    <summary>查看你的账户中可用的日志组</summary>

    在编辑配置之前，先列出当前区域中已有的日志组，以便选择实际存在的名称 (并确认区域设置正确) ：

    ```shell
    aws logs describe-log-groups --region eu-central-1 \
      --query 'logGroups[].logGroupName' --output table
    ```

    示例输出：

    ```text
    -------------------------------
    |      DescribeLogGroups      |
    +-----------------------------+
    |  /aws-glue/jobs/error       |
    |  /aws-glue/jobs/logs-v2     |
    |  /aws-glue/jobs/output      |
    |  /aws-glue/sessions/error   |
    |  /aws-glue/sessions/output  |
    +-----------------------------+
    ```

    请直接在下方示例 1 的 `groups.named` 块中使用此列表中的名称。对于上述账户，named-groups 部分将变为：

    ```yaml
    groups:
      named:
        /aws-glue/jobs/error:
        /aws-glue/jobs/logs-v2:
        /aws-glue/jobs/output:
        /aws-glue/sessions/error:
        /aws-glue/sessions/output:
    ```

    或者，如果要包含的这些组具有相同的前缀 (此处为 `/aws-glue/`) ，请使用示例 2，并将 `prefix` 设为 `/aws-glue/`，而不要逐个列出它们。
  </details>

  **示例 1：命名日志组 (推荐)&#x20;**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          named:
            /aws-glue/jobs/error:
            /aws-glue/jobs/output:
            /aws-glue/sessions/error:

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  **示例 2：通过前缀自动发现日志组**

  ```shell
  cat > otel-collector-config.yaml <<'EOF'
  receivers:
    awscloudwatch:
      region: eu-central-1
      logs:
        poll_interval: 1m
        max_events_per_request: 100
        groups:
          autodiscover:
            limit: 100
            prefix: /aws-glue/

  processors:
    batch:
      timeout: 10s

  exporters:
    otlphttp:
      endpoint: ${OTEL_COLLECTOR_ENDPOINT}
      headers:
        authorization: ${OTLP_AUTH_TOKEN}

  service:
    pipelines:
      logs:
        receivers: [awscloudwatch]
        processors: [batch]
        exporters: [otlphttp]
  EOF
  ```

  需要调整的关键配置项：

  * 将 `region` 设置为与您的日志组所在区域一致。
  * `poll_interval` (默认值为 `1m`) 。较小的值可实现接近实时的日志采集，但代价是会发起更多 AWS API 调用。
  * `groups.named` 用于指定显式列表，或使用 `groups.autodiscover.prefix` 来选取所有匹配某个前缀的组。

  有关完整选项，请参阅 [CloudWatch receiver 文档](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/awscloudwatchreceiver)。

  :::note 仅采集近期日志
  首次运行时，接收器会在当前时间创建检查点，仅拉取此后产生的日志，历史日志不会被回填。
  :::

  ## 启动 receiver collector \{#start-collector\}

  在 `otel-collector-config.yaml` 同级目录下创建 `docker-compose.yaml`。`extra_hosts` 条目允许容器通过 `host.docker.internal` 访问运行在同一主机上的 ClickStack collector；若配置文件缺失，长格式绑定挂载会显式报错，而非静默创建一个空目录：

  ```shell
  cat > docker-compose.yaml <<'EOF'
  services:
    otel-collector:
      image: otel/opentelemetry-collector-contrib:latest
      command: ["--config=/etc/otel-config.yaml"]
      volumes:
        - type: bind
          source: ./otel-collector-config.yaml
          target: /etc/otel-config.yaml
          read_only: true
      environment:
        - AWS_ACCESS_KEY_ID
        - AWS_SECRET_ACCESS_KEY
        - AWS_SESSION_TOKEN
        - AWS_REGION
        - OTEL_COLLECTOR_ENDPOINT
        - OTLP_AUTH_TOKEN
      extra_hosts:
        - "host.docker.internal:host-gateway"
      restart: unless-stopped
  EOF
  ```

  启动 collector：

  ```shell
  docker compose up -d
  ```

  追踪其日志，确认它正在轮询 CloudWatch 并将数据导出到您的 ClickStack collector：

  ```shell
  docker compose logs -f otel-collector
  ```

  ## 在 ClickStack 界面中确认 \{#confirm-in-ui\}

  在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开您的服务，然后从左侧菜单选择 **ClickStack**。

  <Image img={clickstack_cloud} size="lg" alt="启动 ClickStack" border />

  在 **Search** 视图中，将数据源切换为 `Logs`，并将时间范围设置为 **Last 15 minutes**。CloudWatch 事件应在数个轮询间隔后出现。

  <Image img={log_search_view} size="lg" alt="显示 CloudWatch 日志的 ClickStack 搜索视图" />

  每个事件都将来源组和 stream 作为资源 attribute 携带：

  * `ResourceAttributes['aws.region']`：AWS 区域 (例如：`eu-central-1`)
  * `ResourceAttributes['cloudwatch.log.group.name']`：来源日志组
  * `ResourceAttributes['cloudwatch.log.stream']`：来源日志流
  * `Body`：原始日志内容

  将搜索修改为 `Timestamp, SeverityText as level, ResourceAttributes['aws.region'], ResourceAttributes['cloudwatch.log.group.name'], ResourceAttributes['cloudwatch.log.stream'], Body`，以包含以下属性：

  <Image img={log_search_attributes_view} size="lg" alt="显示 CloudWatch 日志和属性的 ClickStack 搜索视图" />

  选择一条日志条目以查看其元数据：

  <Image img={error_log_column_values} size="lg" alt="日志详情视图中的 CloudWatch 属性" />

  如果没有任何内容显示：

  * 在 collector 主机上运行 `aws sts get-caller-identity`，以确认凭证有效。
  * 使用 `docker compose logs -f otel-collector` 持续查看 collector 日志，并留意 `AccessDeniedException` (IAM) 、`security token` 错误 (SSO 凭据已过期) 、`ResourceNotFoundException` (日志组名称拼写错误或区域不正确) ，或 `connection refused` (容器内无法访问你的 ClickStack collector 端点，请参阅[配置 CloudWatch receiver](#configure-receiver) 中关于 `host.docker.internal` 的说明) 。
  * 确认可从容器内部访问 `OTEL_COLLECTOR_ENDPOINT`：`docker compose exec otel-collector wget -qO- ${OTEL_COLLECTOR_ENDPOINT}/v1/logs -S 2>&1 | head -5`。
  * 确认 `OTLP_AUTH_TOKEN` 与 ClickStack 采集器上设置的值一致。

  ## 导入 CloudWatch 仪表板 (可选) \{#import-dashboard\}

  我们提供一个预构建的仪表板，涵盖日志量、严重级别分布和错误分布，可供下载使用。

  <TrackedLink href={useBaseUrl('/examples/cloudwatch-logs-dashboard.json')} download="cloudwatch-logs-dashboard.json" eventName="docs.cloudwatch_logs_monitoring.dashboard_download">下载 `cloudwatch-logs-dashboard.json`</TrackedLink>，然后在 ClickStack UI 中前往**仪表盘**，点击**导入**。

  <Image img={import_dashboard} size="lg" alt="“导入仪表板”按钮" />

  上传 JSON 文件，然后点击**完成导入**。

  <Image img={finish_import} size="lg" alt="“完成导入”对话框" />

  ## 延伸阅读 \{#further-reading\}

  * [AWS CloudWatch 日志集成参考](/use-cases/observability/clickstack/integrations/aws-cloudwatch-logs)，其中包含演示数据集、完整的故障排查信息和调优选项。
  * [通过在 OTLP 端点上启用 TLS 并使用遵循最小权限原则的摄取用户来保护采集器](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)
  * 在收集器中对事件进行[处理、过滤和增强](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)。
  * 有关部署到生产环境的建议，请参阅[生产环境部署](/use-cases/observability/clickstack/production)。
</VerticalStepper>