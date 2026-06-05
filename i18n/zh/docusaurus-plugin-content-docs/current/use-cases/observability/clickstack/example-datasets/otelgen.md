---
slug: /use-cases/observability/clickstack/getting-started/otelgen
title: '使用 otelgen 生成模拟 OpenTelemetry 数据'
sidebar_label: '使用 otelgen 生成模拟数据'
sidebar_position: 5
pagination_prev: null
pagination_next: null
description: '使用 otelgen 将模拟日志、链路追踪和指标发送到 ClickStack OpenTelemetry collector'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['ClickStack', 'otelgen', '模拟数据', 'OpenTelemetry', '测试', '日志', '链路追踪', '指标', '可观测性']
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[`otelgen`](https://github.com/krzko/otelgen) 是一个小巧的 Go CLI，可生成模拟的 OTLP 日志、链路追踪和指标。可用它确认现有的 ClickStack OpenTelemetry collector 是否正在接收数据，以及事件是否会显示在 ClickStack UI 中。

本指南假定 collector 已在运行，并通过 `4317` (gRPC) 和 `4318` (HTTP) 提供 OTLP 端点。

<Tabs groupId="sample-logs">
  <TabItem value="managed-clickstack" label="托管 ClickStack" default>
    <VerticalStepper headerLevel="h3">
      ### 前置条件 \{#prerequisites-managed\}

      本指南假设你已完成[托管 ClickStack 入门指南](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)，并且已有一个正在运行的 OpenTelemetry collector，且从运行 `otelgen` 的机器可以访问其 OTLP gRPC (`4317`) 和 HTTP (`4318`) 端点。如果你已按照[保护 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)的说明为 collector 设置了 `OTLP_AUTH_TOKEN`，请先准备好这个值。

      ### 安装 otelgen \{#install-otelgen-managed\}

      使用 Homebrew 安装：

      ```shell
      brew install krzko/tap/otelgen
      ```

      或使用 Go 安装：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 设置环境变量 \{#set-env-vars-managed\}

      导出 collector 端点；如果 collector 已受保护，还需要导出认证令牌：

      ```shell
      export OTEL_ENDPOINT=<host>:4317
      export OTLP_AUTH_TOKEN=<your_otlp_auth_token>
      ```

      请使用你的 collector 的主机名和端口。如果 collector 运行在同一台机器上，则应为 `localhost:4317`。

      :::note[未受保护的 collector]
      ClickStack OpenTelemetry collector 默认不要求身份验证。如果你尚未按照[保护 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)的说明设置 `OTLP_AUTH_TOKEN`，这里可以跳过 `OTLP_AUTH_TOKEN`，并从下面的命令中去掉 `--header` 标志。
      :::

      ### 生成链路追踪 \{#generate-traces-managed\}

      发送一小段包含多个 span 的链路追踪数据：

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` 表示每秒生成的 trace 数，`--duration` 表示运行时长 (秒) 。`--insecure` 会禁用 gRPC 连接上的 TLS；当 `otelgen` 指向 collector 的明文 OTLP 端口时，需要使用该选项。

      ### 生成日志 \{#generate-logs-managed\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### 生成指标 \{#generate-metrics-managed\}

      `metrics` 子命令不支持 `--duration`。运行命令后，等待几秒钟，再按 `Ctrl+C` 停止。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${OTLP_AUTH_TOKEN}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` 还支持 `metrics` 下的 `gauge`、`histogram`、`up-down-counter` 和 `exponential-histogram` 子命令。

      ### 在 ClickStack 中验证 \{#verify-managed\}

      从 ClickHouse Cloud 控制台打开 ClickStack UI。在 `Search` 视图中，在 `Logs` 和 `Traces` 之间切换数据源，确认是否出现了新事件。将时间范围设置为 `Last 15 minutes`。打开 `Chart Explorer`，选择 `Metrics`，然后将 `otelgen` 生成的某个指标名称绘制为图表 (例如 `otelgen.metrics.sum`) ，以验证指标摄取是否正常。
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    <VerticalStepper headerLevel="h3">
      ### 前置条件 \{#prerequisites-oss\}

      本指南假设你已按照[一体化镜像说明](/use-cases/observability/clickstack/getting-started/oss)启动开源 ClickStack，并且 OTLP 端点 (`4317` gRPC 和 `4318` HTTP) 可访问。你还需要从 HyperDX UI 的 `Team Settings > API Keys` 中获取摄取 API key。

      ### 安装 otelgen \{#install-otelgen-oss\}

      使用 Homebrew 安装：

      ```shell
      brew install krzko/tap/otelgen
      ```

      或使用 Go 安装：

      ```shell
      go install github.com/krzko/otelgen@latest
      ```

      ### 设置环境变量 \{#set-env-vars-oss\}

      导出 collector 端点和摄取 API key：

      ```shell
      export OTEL_ENDPOINT=localhost:4317
      export CLICKSTACK_API_KEY=<your_ingestion_api_key>
      ```

      ### 生成链路追踪 \{#generate-traces-oss\}

      发送一小批包含多个 span 的链路追踪：

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        traces multi
      ```

      `--rate` 表示每秒生成的 trace 数，`--duration` 表示运行时长 (秒) 。`--insecure` 会对本地 collector 启用明文 gRPC。

      ### 生成日志 \{#generate-logs-oss\}

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 --duration 10 \
        logs multi
      ```

      ### 生成指标 \{#generate-metrics-oss\}

      `metrics` 子命令不支持 `--duration`。运行该命令后，几秒钟后按 `Ctrl+C` 停止。

      ```shell
      otelgen --otel-exporter-otlp-endpoint ${OTEL_ENDPOINT} \
        --header "authorization=${CLICKSTACK_API_KEY}" \
        --protocol grpc --insecure \
        --rate 2 \
        metrics sum
      ```

      `otelgen` 还支持 `metrics` 下的 `gauge`、`histogram`、`up-down-counter` 和 `exponential-histogram` 子命令。

      ### 在 ClickStack 中验证 \{#verify-oss\}

      访问 [http://localhost:8080](http://localhost:8080) 打开 ClickStack UI。在 `Search` 视图中，在 `Logs` 和 `Traces` 之间切换数据源，确认有新事件写入。将时间范围设置为 `Last 15 minutes`。打开 `Chart Explorer`，选择 `Metrics`，然后将 `otelgen` 生成的某个指标名称绘制为图表 (例如 `otelgen.metrics.sum`) ，以验证指标摄取。
    </VerticalStepper>
  </TabItem>
</Tabs>