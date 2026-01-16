---
slug: /use-cases/observability/clickstack/integrations/temporal-metrics
title: '使用 ClickStack 监控 Temporal Cloud'
sidebar_label: 'Temporal Cloud 指标'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 监控 Temporal Cloud 指标'
doc_type: 'guide'
keywords: ['Temporal', '指标', 'OTel', 'ClickStack']
---

import Image from '@theme/IdealImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import import_dashboard from '@site/static/images/clickstack/import-dashboard.png';
import temporal_metrics from '@site/static/images/clickstack/temporal/temporal-metrics.png';
import finish_import from '@site/static/images/clickstack/temporal/import-temporal-metrics-dashboard.png';
import example_dashboard from '@site/static/images/clickstack/temporal/temporal-metrics-dashboard.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';

:::note 警告
Temporal 平台中的 OpenMetrics 支持目前处于[公开预览](https://docs.temporal.io/evaluate/development-production-features/release-stages#public-preview)阶段。更多信息请参考[Temporal 官方文档](https://docs.temporal.io/cloud/metrics/openmetrics)。
:::

Temporal 提供了一种抽象，用于构建简单、精巧且具备高弹性的应用程序。


# 使用 ClickStack 监控 Temporal Cloud 指标 \\{#temporal-metrics-clickstack\\}

:::note[摘要]
本指南演示如何通过配置 OpenTelemetry collector 的 Prometheus receiver，使用 ClickStack 监控 Temporal Cloud。您将学习如何：

- 配置 OTel collector 以收集 Temporal Cloud 指标
- 使用自定义配置部署 ClickStack
- 使用预构建仪表板可视化 Temporal Cloud 性能（未完成工作流数、每秒操作次数、活动命名空间、任务积压情况）

所需时间：5–10 分钟
:::

## 与现有 Temporal Cloud 的集成 \\{#existing-temporal\\}

本节说明如何通过为 ClickStack 的 OTel collector 配置 Prometheus receiver 来配置 ClickStack。

## 前提条件 \\{#prerequisites\\}

- 正在运行的 ClickStack 实例
- 现有的 Temporal Cloud 账户
- 从 ClickStack 到 Temporal Cloud 的 HTTP 网络连通性

<VerticalStepper headerLevel="h4">
  #### 创建 Temporal Cloud 密钥

  确保您已拥有 Temporal Cloud API 密钥。您可以参照 Temporal 文档中的[身份验证指南](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/api-reference#authentication)来创建该密钥。

  :::important 密钥文件
  确保将这些凭据存储在名为 `temporal.key` 的文件中,该文件应与下方创建的配置文件位于同一目录下。此密钥应以纯文本形式存储,前后不能有空格。
  :::

  #### 创建自定义 OTel collector 配置

  ClickStack 允许您通过挂载自定义配置文件并设置环境变量来扩展基础 OpenTelemetry 收集器配置。自定义配置会与 HyperDX 通过 OpAMP 管理的基础配置进行合并。

  创建名为 `temporal-metrics.yaml` 的文件，包含以下配置：

  ```yaml title="temporal-metrics.yaml"
  receivers:
    prometheus/temporal:
      config:
        scrape_configs:
        - job_name: 'temporal-cloud'
          scrape_interval: 60s
          scrape_timeout: 30s
          honor_timestamps: true
          scheme: https
          authorization:
            type: Bearer
            credentials_file: /etc/otelcol-contrib/temporal.key
          static_configs:
            - targets: ['metrics.temporal.io']
          metrics_path: '/v1/metrics'

  processors:
    resource:
      attributes:
        - key: service.name
          value: "temporal"
          action: upsert

  service:
    pipelines:
      metrics/temporal:
        receivers: [prometheus/temporal]
        processors:
          - resource
          - memory_limiter
          - batch
        exporters:
          - clickhouse
  ```

  此配置：

  * 连接到 `metrics.temporal.io` 上的 Temporal Cloud
  * 每 60 秒采集一次指标
  * 收集[关键性能指标](https://docs.temporal.io/production-deployment/cloud/metrics/openmetrics/metrics-reference)
  * **按照 [OpenTelemetry 语义约定](https://opentelemetry.io/docs/specs/semconv/resource/#service) 设置必需的 `service.name` 资源属性**
  * 通过专用的 pipeline 将指标转发到 ClickHouse exporter

  :::note

  * 只需在自定义配置中定义新的 receiver、processor 和 pipeline 即可
  * `memory_limiter` 和 `batch` 处理器以及 `clickhouse` exporter 已在基础 ClickStack 配置中定义完毕——只需按名称引用它们即可
  * `resource` 处理器按照 OpenTelemetry 语义约定设置必需的 `service.name` 属性
  * 对于多个 Temporal Cloud 账户，请自定义 `service.name` 以区分它们（例如 `"temporal-prod"`、`"temporal-dev"`）
    :::

  #### 配置 ClickStack 加载自定义配置

  要在现有的 ClickStack 部署中启用自定义采集器配置,您必须:

  1. 将自定义配置文件挂载至 `/etc/otelcol-contrib/custom.config.yaml`
  2. 设置环境变量 `CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml`
  3. 将 `temporal.key` 文件挂载到 `/etc/otelcol-contrib/temporal.key` 路径
  4. 确保 ClickStack 与 Temporal 之间网络互通

  所有命令均假定在存储 `temporal-metrics.yaml` 和 `temporal.key` 文件的示例目录下执行。

  ##### 选项 1：Docker Compose

  更新您的 ClickStack 部署配置：

  ```yaml
  services:
    clickstack:
      # ... existing configuration ...
      environment:
        - CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml
      volumes:
        - ./temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro
        - ./temporal.key:/etc/otelcol-contrib/temporal.key:ro
        # ... other volumes ...
  ```

  ##### 选项 2：Docker run（一体化镜像）

  如果使用 `docker run` 运行一体化镜像：

  ```bash
  docker run --name clickstack \
    -p 8080:8080 -p 4317:4317 -p 4318:4318 \
    -e CUSTOM_OTELCOL_CONFIG_FILE=/etc/otelcol-contrib/custom.config.yaml \
    -v "$(pwd)/temporal-metrics.yaml:/etc/otelcol-contrib/custom.config.yaml:ro" \
    -v "$(pwd)/temporal.key:/etc/otelcol-contrib/temporal.key:ro" \
    clickhouse/clickstack-all-in-one:latest
  ```

  #### 在 HyperDX 中验证指标

  配置完成后,登录 HyperDX 并验证指标数据是否正常流入:

  1. 导航到 Metrics Explorer
  2. 搜索以 `temporal` 开头的指标（例如 `temporal_cloud_v1_workflow_success_count`、`temporal_cloud_v1_poll_timeout_count`）
  3. 你应该会按你配置的采集间隔看到指标数据点开始出现

  <Image img={temporal_metrics} alt="Temporal 指标" size="md" />
</VerticalStepper>

## 仪表板和可视化 {#dashboards}

为帮助您开始使用 ClickStack 监控 Temporal Cloud，我们提供了一些 Temporal 指标的可视化示例。

<VerticalStepper headerLevel="h4">

#### <TrackedLink href={useBaseUrl('/examples/temporal-metrics-dashboard.json')} download="temporal-metrics-dashboard.json" eventName="docs.temporal_metrics_monitoring.dashboard_download">下载</TrackedLink> 仪表板配置 \\{#download\\}

#### 导入预构建的仪表板 \\{#import-dashboard\\}

1. 打开 HyperDX 并进入 Dashboards 页面
2. 点击右上角省略号下方的 **Import Dashboard**

<Image img={import_dashboard} alt="导入仪表板按钮"/>

3. 上传 `temporal-metrics-dashboard.json` 文件并点击 **Finish Import**

<Image img={finish_import} alt="完成导入对话框"/>

#### 查看仪表板 {#created-dashboard}

仪表板会被创建，并预先配置好所有可视化组件：

<Image img={example_dashboard} alt="Temporal 指标仪表板"/>

</VerticalStepper>

## 故障排查 {#troubleshooting}

### 自定义配置未生效

请确认环境变量 `CUSTOM_OTELCOL_CONFIG_FILE` 设置正确：

```bash
docker exec <container-name> printenv CUSTOM_OTELCOL_CONFIG_FILE
```

检查自定义配置文件是否挂载在 `/etc/otelcol-contrib/custom.config.yaml`：

```bash
docker exec <container-name> ls -lh /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack ls -lh /etc/otelcol-contrib/custom.config.yaml
```

查看自定义配置内容，确认其可读：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/custom.config.yaml
# usually, docker exec clickstack cat /etc/otelcol-contrib/custom.config.yaml
```

确认 `temporal.key` 已挂载到容器中：

```bash
docker exec <container-name> cat /etc/otelcol-contrib/temporal.key
# usually, docker exec clickstack cat /etc/otelcol-contrib/temporal.key
# This should output your temporal.key
```


### 在 HyperDX 中未显示任何指标

确认 collector 可以访问 Temporal Cloud：

```bash
# From the ClickStack container
docker exec <container-name> curl -H "Authorization: Bearer <API_KEY>" https://metrics.temporal.io/v1/metrics
```

你应该会看到输出一系列 Prometheus 指标，例如：

```text
temporal_cloud_v1_workflow_success_count{operation="CompletionStats",region="aws-us-east-2",temporal_account="l2c4n",temporal_namespace="clickpipes-aws-prd-apps-us-east-2.l2c4n",temporal_task_queue="clickpipes-svc-dc118d12-b397-4975-a33e-c2888ac12ac4-peer-flow-task-queue",temporal_workflow_type="QRepPartitionWorkflow"} 0.067 1765894320
```

确认有效配置中包含你的 Prometheus 接收器：

```bash
docker exec <container> cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "Prometheus:"
## usually, docker exec clickstack cat /etc/otel/supervisor-data/effective.yaml | grep -A 10 "prometheus:"
```

检查 collector agent 的日志是否有报错：

```bash
docker exec <container> cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
# Look for connection errors or authentication failures
# docker exec clickstack cat /etc/otel/supervisor-data/agent.log | grep -i Prometheus
```

查看采集器日志：

```bash
docker exec <container> cat /var/log/otel-collector.log | grep -i error
# Look for config parsing errors - early supervisor.opamp-client can be ignored 
# docker exec clickstack cat /var/log/otel-collector.log | grep -i error
```


### 身份验证错误 {#auth-errors}

如果在日志中看到身份验证错误，请检查您的 API 密钥。

### 网络连接问题 {#network-issues}

如果 ClickStack 无法访问 Temporal Cloud，请确保 Docker Compose 文件或 `docker run` 命令已启用[对外网络访问](https://docs.docker.com/engine/network/#drivers)。

## 后续步骤 {#next-steps}

如果希望进一步探索，可以尝试如下方式来扩展和优化监控：

- 为关键指标（内存使用阈值、连接数上限、缓存命中率下降）[配置告警](/use-cases/observability/clickstack/alerts)
- 针对特定用例（复制延迟、持久化性能）创建更多仪表板
- 通过复制接收端配置并使用不同的 endpoint 和服务名，监控多个 Temporal Cloud 账户