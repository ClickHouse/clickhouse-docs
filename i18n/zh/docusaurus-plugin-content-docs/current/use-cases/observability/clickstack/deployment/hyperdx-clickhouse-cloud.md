---
slug: /use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud
title: 'ClickHouse Cloud'
pagination_prev: null
pagination_next: null
sidebar_position: 1
description: '使用 ClickHouse Cloud 部署 ClickStack'
doc_type: 'guide'
keywords: ['clickstack', '部署', '设置', '配置', '可观测性']
---

import Image from '@theme/IdealImage';
import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import cloud_connect from '@site/static/images/use-cases/observability/clickstack-cloud-connect.png';
import clickstack_cloud from '@site/static/images/use-cases/observability/clickstack-cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import JSONSupport from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge />

::::note[私有预览]
此功能目前在 ClickHouse Cloud 中处于私有预览阶段。如果你的组织希望优先获得访问权限，
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">加入候补名单</TrackedLink>。

如果你是 ClickHouse Cloud 新用户，请点击
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">此处</TrackedLink> 了解更多信息，或 <TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">注册免费试用</TrackedLink> 以开始使用。
::::

此选项适用于你正在使用 ClickHouse Cloud 的场景。在此部署模式中，ClickHouse 和 HyperDX 均托管在 ClickHouse Cloud 中，从而最大限度地减少用户需要自托管的组件数量。

除了降低基础设施运维负担之外，此部署模式还确保身份验证与 ClickHouse Cloud 的 SSO/SAML 集成。与自托管部署不同，你也无需再配置 MongoDB 实例来存储应用程序状态——例如仪表盘、已保存搜索、用户设置和告警。

在此模式下，数据摄取完全由用户自行控制。你可以通过自托管的 OpenTelemetry 收集器、从客户端库直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 流水线，或 ClickPipes——ClickHouse Cloud 的托管摄取服务——将数据摄取到 ClickHouse Cloud 中。此方法为运行 ClickStack 提供了最简单且性能最优的路径。


### 适用场景 \{#suitable-for\}

此部署模式在以下场景下尤其适用：

1. 您已经在 ClickHouse Cloud 中存有可观测性数据，并希望使用 HyperDX 对其进行可视化。
2. 您运行着大规模的可观测性部署，并且需要 ClickStack 搭配 ClickHouse Cloud 所提供的专用性能和可扩展性。
3. 您已经在使用 ClickHouse Cloud 进行分析，并希望通过 ClickStack 的插桩库对应用进行埋点，将数据发送到同一个集群。在这种情况下，我们建议使用 [warehouses](/cloud/reference/warehouses) 来为可观测性工作负载隔离计算资源。

## 部署步骤 \{#deployment-steps\}

本指南假设你已经创建了一个 ClickHouse Cloud 服务。如果尚未创建服务，请先按照我们的快速入门指南中的[“创建 ClickHouse 服务”](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)步骤进行操作。

<VerticalStepper headerLevel="h3">
  ### 复制服务凭证(可选)

  **如果您的服务中已有希望进行可视化的可观测性事件,则可以跳过此步骤。**

  导航到主服务列表,选择您要在 HyperDX 中可视化其可观测性事件的服务。

  在导航菜单中点击 `Connect` 按钮。将弹出一个对话框,其中包含您服务的凭据以及通过不同接口和语言进行连接的操作说明。从下拉列表中选择 `HTTPS`,并记录连接端点和凭据。

  <Image img={cloud_connect} alt="连接到 ClickHouse Cloud" size="lg" />

  ### 部署 OpenTelemetry Collector(可选)

  **如果您的服务中已有希望进行可视化的可观测性事件,则可以跳过此步骤。**

  此步骤确保使用 Open Telemetry (OTel) 架构创建表,从而可以无缝地在 HyperDX 中创建数据源。此外还提供了一个 OLTP 端点,可用于加载[示例数据集](/use-cases/observability/clickstack/sample-datasets)并将 OTel 事件发送到 ClickStack。

  :::note 使用标准 OpenTelemetry collector
  以下说明使用标准发行版的 OTel collector,而非 ClickStack 发行版。后者需要 OpAMP 服务器进行配置,目前在私有预览版中尚不支持。以下配置复制了 ClickStack 发行版 collector 所使用的版本,提供一个 OTLP 端点以接收事件。
  :::

  下载 OTel collector 的配置文件:

  ```bash
  curl -O https://raw.githubusercontent.com/ClickHouse/clickhouse-docs/refs/heads/main/docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
  ```

  <details>
    <summary>otel-cloud-config.yaml</summary>

    ```yaml file=docs/use-cases/observability/clickstack/deployment/_snippets/otel-cloud-config.yaml
    receivers:
      otlp/hyperdx:
        protocols:
          grpc:
            include_metadata: true
            endpoint: '0.0.0.0:4317'
          http:
            cors:
              allowed_origins: ['*']
              allowed_headers: ['*']
            include_metadata: true
            endpoint: '0.0.0.0:4318'
    processors:
      transform:
        log_statements:
          - context: log
            error_mode: ignore
            statements:
              # JSON parsing: Extends log attributes with the fields from structured log body content, either as an OTEL map or
              # as a string containing JSON content.
              - set(log.cache, ExtractPatterns(log.body, "(?P<0>(\\{.*\\}))")) where
                IsString(log.body)
              - merge_maps(log.attributes, ParseJSON(log.cache["0"]), "upsert")
                where IsMap(log.cache)
              - flatten(log.attributes) where IsMap(log.cache)
              - merge_maps(log.attributes, log.body, "upsert") where IsMap(log.body)
          - context: log
            error_mode: ignore
            conditions:
              - severity_number == 0 and severity_text == ""
            statements:
              # Infer: extract the first log level keyword from the first 256 characters of the body
              - set(log.cache["substr"], log.body.string) where Len(log.body.string)
                < 256
              - set(log.cache["substr"], Substring(log.body.string, 0, 256)) where
                Len(log.body.string) >= 256
              - set(log.cache, ExtractPatterns(log.cache["substr"],
                "(?i)(?P<0>(alert|crit|emerg|fatal|error|err|warn|notice|debug|dbug|trace))"))
              # Infer: detect FATAL
              - set(log.severity_number, SEVERITY_NUMBER_FATAL) where
                IsMatch(log.cache["0"], "(?i)(alert|crit|emerg|fatal)")
              - set(log.severity_text, "fatal") where log.severity_number ==
                SEVERITY_NUMBER_FATAL
              # Infer: detect ERROR
              - set(log.severity_number, SEVERITY_NUMBER_ERROR) where
                IsMatch(log.cache["0"], "(?i)(error|err)")
              - set(log.severity_text, "error") where log.severity_number ==
                SEVERITY_NUMBER_ERROR
              # Infer: detect WARN
              - set(log.severity_number, SEVERITY_NUMBER_WARN) where
                IsMatch(log.cache["0"], "(?i)(warn|notice)")
              - set(log.severity_text, "warn") where log.severity_number ==
                SEVERITY_NUMBER_WARN
              # Infer: detect DEBUG
              - set(log.severity_number, SEVERITY_NUMBER_DEBUG) where
                IsMatch(log.cache["0"], "(?i)(debug|dbug)")
              - set(log.severity_text, "debug") where log.severity_number ==
                SEVERITY_NUMBER_DEBUG
              # Infer: detect TRACE
              - set(log.severity_number, SEVERITY_NUMBER_TRACE) where
                IsMatch(log.cache["0"], "(?i)(trace)")
              - set(log.severity_text, "trace") where log.severity_number ==
                SEVERITY_NUMBER_TRACE
              # Infer: else
              - set(log.severity_text, "info") where log.severity_number == 0
              - set(log.severity_number, SEVERITY_NUMBER_INFO) where log.severity_number == 0
          - context: log
            error_mode: ignore
            statements:
              # Normalize the severity_text case
              - set(log.severity_text, ConvertCase(log.severity_text, "lower"))
      resourcedetection:
        detectors:
          - env
          - system
          - docker
        timeout: 5s
        override: false
      batch:
      memory_limiter:
        # 80% of maximum memory up to 2G, adjust for low memory environments
        limit_mib: 1500
        # 25% of limit up to 2G, adjust for low memory environments
        spike_limit_mib: 512
        check_interval: 5s
    connectors:
      routing/logs:
        default_pipelines: [logs/out-default]
        error_mode: ignore
        table:
          - context: log
            statement: route() where IsMatch(attributes["rr-web.event"], ".*")
            pipelines: [logs/out-rrweb]
    exporters:
      debug:
        verbosity: detailed
        sampling_initial: 5
        sampling_thereafter: 200
      clickhouse/rrweb:
        database: ${env:CLICKHOUSE_DATABASE}
        endpoint: ${env:CLICKHOUSE_ENDPOINT}
        password: ${env:CLICKHOUSE_PASSWORD}
        username: ${env:CLICKHOUSE_USER}
        ttl: 720h
        logs_table_name: hyperdx_sessions
        timeout: 5s
        retry_on_failure:
          enabled: true
          initial_interval: 5s
          max_interval: 30s
          max_elapsed_time: 300s
      clickhouse:
        database: ${env:CLICKHOUSE_DATABASE}
        endpoint: ${env:CLICKHOUSE_ENDPOINT}
        password: ${env:CLICKHOUSE_PASSWORD}
        username: ${env:CLICKHOUSE_USER}
        ttl: 720h
        timeout: 5s
        retry_on_failure:
          enabled: true
          initial_interval: 5s
          max_interval: 30s
          max_elapsed_time: 300s
    extensions:
      health_check:
        endpoint: :13133
    service:
      pipelines:
        traces:
          receivers: [otlp/hyperdx]
          processors: [memory_limiter, batch]
          exporters: [clickhouse]
        metrics:
          receivers: [otlp/hyperdx]
          processors: [memory_limiter, batch]
          exporters: [clickhouse]
        logs/in:
          receivers: [otlp/hyperdx]
          exporters: [routing/logs]
        logs/out-default:
          receivers: [routing/logs]
          processors: [memory_limiter, transform, batch]
          exporters: [clickhouse]
        logs/out-rrweb:
          receivers: [routing/logs]
          processors: [memory_limiter, batch]
          exporters: [clickhouse/rrweb]

    ```
  </details>

  使用以下 Docker 命令部署采集器,将相应的环境变量设置为之前记录的连接设置,并根据操作系统使用相应的命令。

  ```bash
  # modify to your cloud endpoint
  export CLICKHOUSE_ENDPOINT=
  export CLICKHOUSE_PASSWORD=
  # optionally modify 
  export CLICKHOUSE_DATABASE=default

  # osx
  docker run --rm -it \
    -p 4317:4317 -p 4318:4318 \
    -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
    -e CLICKHOUSE_USER=default \
    -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
    -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
    --user 0:0 \
    -v "$(pwd)/otel-cloud-collector.yaml":/etc/otel/config.yaml \
    -v /var/log:/var/log:ro \
    -v /private/var/log:/private/var/log:ro \
    otel/opentelemetry-collector-contrib:latest \
    --config /etc/otel/config.yaml

  # linux command

  # docker run --network=host --rm -it \
  #   -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
  #   -e CLICKHOUSE_USER=default \
  #   -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
  #   -e CLICKHOUSE_DATABASE=${CLICKHOUSE_DATABASE} \
  #   --user 0:0 \
  #   -v "$(pwd)/otel-cloud-config.yaml":/etc/otel/config.yaml \
  #   -v /var/log:/var/log:ro \
  #   -v /private/var/log:/private/var/log:ro \
  #   otel/opentelemetry-collector-contrib:latest \
  #   --config /etc/otel/config.yaml
  ```

  :::note
  在生产环境中,我们建议为数据摄取创建专用用户,并限制其对所需数据库和表的访问权限。详情请参阅[&quot;数据库和摄取用户&quot;](/use-cases/observability/clickstack/production#database-ingestion-user)。
  :::

  ### 连接到 ClickStack

  选择您的服务,然后从左侧菜单中选择 `ClickStack`。

  <Image img={clickstack_cloud} alt="在 ClickHouse Cloud 上部署 ClickStack" size="lg" />

  您无需创建用户,系统将自动进行身份验证,之后会提示您创建数据源。

  对于仅需探索 HyperDX 界面的用户,我们推荐使用我们的[示例数据集](/use-cases/observability/clickstack/sample-datasets),其中使用了 OTel 数据。

  <Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX 登录页" size="lg" />

  ### 用户权限

  访问 HyperDX 的用户会使用其 ClickHouse Cloud 控制台凭据自动完成身份验证。访问控制通过服务设置中配置的 SQL 控制台权限实现。

  #### 配置用户访问权限

  1. 在 ClickHouse Cloud 控制台中进入你的服务
  2. 转到 **Settings** → **SQL Console Access**
  3. 为每个用户设置适当的权限级别：
     * **Service Admin → Full Access** - 启用告警所必需
     * **Service Read Only → Read Only** - 可以查看可观测性数据并创建仪表盘
     * **No access** - 无法访问 HyperDX

  <Image img={read_only} alt="ClickHouse Cloud 只读访问" />

  :::important 告警功能需要管理员访问权限
  要启用告警功能,至少需要一位拥有 **Service Admin** 权限(在 SQL Console Access 下拉菜单中对应 **Full Access**)的用户登录 HyperDX 一次。此操作将在数据库中创建一个专用用户账户用于执行告警查询。
  :::

  ### 创建数据源

  HyperDX 原生支持 OpenTelemetry,但不仅限于 OpenTelemetry——您可以根据需要使用自定义表结构。

  #### 使用 OpenTelemetry 架构

  如果您使用上述 OTel collector 在 ClickHouse 中创建数据库和表,请在创建数据源模型时保留所有默认值,并在 `Table` 字段中填入 `otel_logs` 以创建日志数据源。其他设置将自动检测,之后您可以点击 `Save New Source`。

  <Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX 数据源" size="lg" />

  要为追踪和 OTel 指标创建数据源,可以从顶部菜单中选择 `创建新数据源`。

  <Image img={hyperdx_create_new_source} alt="在 HyperDX 中创建新数据源" size="lg" />

  从这里选择所需的源类型,然后选择相应的表,例如对于 traces,选择表 `otel_traces`。所有设置将自动检测。

  <Image img={hyperdx_create_trace_datasource} alt="在 HyperDX 中创建追踪源" size="lg" />

  :::note 关联来源
  请注意,ClickStack 中的不同数据源(如日志和追踪)可以相互关联。要启用此功能,需要对每个数据源进行额外配置。例如,在日志数据源中,可以指定对应的追踪数据源,在追踪数据源中也可以反向指定日志数据源。有关更多详细信息,请参阅[&quot;关联来源&quot;](/use-cases/observability/clickstack/config#correlated-sources)。
  :::

  #### 使用自定义架构

  希望将 HyperDX 连接到现有数据服务的用户可以根据需要完成数据库和表设置。如果表符合 ClickHouse 的 OpenTelemetry 架构,设置将被自动检测。

  如果使用自定义架构,建议创建日志源并确保指定必需字段 - 详情请参阅 [&quot;日志源设置&quot;](/use-cases/observability/clickstack/config#logs)。
</VerticalStepper>

<JSONSupport/>

此外，你还应联系 support@clickhouse.com，确保已在你的 ClickHouse Cloud 服务上启用 JSON 支持。