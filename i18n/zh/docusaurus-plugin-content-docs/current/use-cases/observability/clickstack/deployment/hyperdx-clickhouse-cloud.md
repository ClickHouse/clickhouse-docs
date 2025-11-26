---
slug: /use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud
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
import cloud_connect from '@site/static/images/use-cases/observability/clickhouse_cloud_connection.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';
import hyperdx_cloud_landing from '@site/static/images/use-cases/observability/hyperdx_cloud_landing.png';
import hyperdx_cloud_datasource from '@site/static/images/use-cases/observability/hyperdx_cloud_datasource.png';
import hyperdx_create_new_source from '@site/static/images/use-cases/observability/hyperdx_create_new_source.png';
import hyperdx_create_trace_datasource from '@site/static/images/use-cases/observability/hyperdx_create_trace_datasource.png';
import read_only from '@site/static/images/clickstack/read-only-access.png';
import { TrackedLink } from '@site/src/components/GalaxyTrackedLink/GalaxyTrackedLink';
import JSONSupport from '@site/docs/use-cases/observability/clickstack/deployment/_snippets/_json_support.md';

<PrivatePreviewBadge />

::::note[私有预览]
此功能目前在 ClickHouse Cloud 中处于私有预览阶段。如果贵组织希望获得优先访问权限，
<TrackedLink href="https://clickhouse.com/cloud/clickstack-private-preview" eventName="docs.clickstack_deployment.waitlist_cta">加入候补名单</TrackedLink>。

如果你是首次接触 ClickHouse Cloud，点击
<TrackedLink href="/docs/cloud/overview" eventName="docs.clickstack_deployment.cloud_learn_more_cta">这里</TrackedLink> 了解更多，或 <TrackedLink href="https://clickhouse.cloud/signUp" eventName="docs.clickstack_deployment.cloud_signup_cta" target="_blank" rel="noopener noreferrer">注册免费试用</TrackedLink> 以开始使用。
::::

此选项适用于使用 ClickHouse Cloud 的用户。在这种部署模式中，ClickHouse 和 HyperDX 均托管在 ClickHouse Cloud 上，从而最大程度减少用户需要自主管理的组件数量。

除了降低基础设施运维成本外，此部署模式还确保身份验证与 ClickHouse Cloud 的 SSO/SAML 集成。与自托管部署不同，你无需再预配 MongoDB 实例来存储应用状态——例如仪表盘、已保存搜索、用户设置和告警。

在此模式下，数据摄取完全由用户自行负责。你可以使用自托管的 OpenTelemetry collector、通过客户端库直接摄取、ClickHouse 原生表引擎（例如 Kafka 或 S3）、ETL 管道，或 ClickPipes（ClickHouse Cloud 的托管摄取服务）将数据摄取到 ClickHouse Cloud 中。此方式为运行 ClickStack 提供了最简单且性能最佳的路径。

### 适用场景

此部署模式在以下场景中尤为理想：

1. 你已经在 ClickHouse Cloud 中存有可观测性数据，并希望使用 HyperDX 对其进行可视化。
2. 你运行着大规模可观测性部署，并需要 ClickStack 与 ClickHouse Cloud 组合所提供的专用性能与可扩展性。
3. 你已经在使用 ClickHouse Cloud 进行分析，并希望使用 ClickStack 的埋点/监测库对应用进行观测，将数据发送到同一个集群。在这种情况下，我们建议使用 [warehouses](/cloud/reference/warehouses) 来为可观测性工作负载隔离计算资源。


## 部署步骤 {#deployment-steps}

以下指南假定您已创建 ClickHouse Cloud 服务。如果尚未创建服务,请参照快速入门指南中的["创建 ClickHouse 服务"](/getting-started/quick-start/cloud#1-create-a-clickhouse-service)步骤操作。

<VerticalStepper headerLevel="h3">

### 复制服务凭据(可选) {#copy-service-credentials}

**如果您已有需要在服务中可视化的可观测性事件,可跳过此步骤。**

导航至主服务列表,选择您计划用于在 HyperDX 中可视化可观测性事件的服务。

点击导航菜单中的 `Connect` 按钮。将弹出一个模态窗口,显示您的服务凭据以及通过不同接口和语言进行连接的说明。从下拉菜单中选择 `HTTPS`,并记录连接端点和凭据。

<Image img={cloud_connect} alt='ClickHouse Cloud 连接' size='lg' />

### 部署 Open Telemetry Collector(可选) {#deploy-otel-collector}

**如果您已有需要在服务中可视化的可观测性事件,可跳过此步骤。**

此步骤确保使用 Open Telemetry(OTel)模式创建表,从而可以无缝地在 HyperDX 中创建数据源。这还提供了一个 OTLP 端点,可用于加载[示例数据集](/use-cases/observability/clickstack/sample-datasets)并将 OTel 事件发送到 ClickStack。

:::note 使用标准 Open Telemetry collector
以下说明使用 OTel collector 的标准发行版,而非 ClickStack 发行版。后者需要 OpAMP 服务器进行配置,目前在私有预览版中不支持。下面的配置复制了 ClickStack 发行版 collector 所使用的版本,提供了一个可接收事件的 OTLP 端点。
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

```

</details>

使用以下 Docker 命令部署采集器,将相应的环境变量设置为先前记录的连接配置,并根据操作系统选择对应的命令执行。
```


```bash
# 修改为您的云端点地址
export CLICKHOUSE_ENDPOINT=
export CLICKHOUSE_PASSWORD=
# 可选择性修改 
export CLICKHOUSE_DATABASE=default
```


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



# Linux 命令



# docker run --network=host --rm -it \

# -e CLICKHOUSE&#95;ENDPOINT=${CLICKHOUSE_ENDPOINT} \

# -e CLICKHOUSE&#95;USER=default \

# -e CLICKHOUSE&#95;PASSWORD=${CLICKHOUSE_PASSWORD} \

# -e CLICKHOUSE&#95;DATABASE=${CLICKHOUSE_DATABASE} \

# --user 0:0 \

# -v &quot;$(pwd)/otel-cloud-config.yaml&quot;:/etc/otel/config.yaml \

# -v /var/log:/var/log:ro \

# -v /private/var/log:/private/var/log:ro \

# otel/opentelemetry-collector-contrib:latest \

# --config /etc/otel/config.yaml

```

:::note
在生产环境中,我们建议为摄取创建专用用户,限制对所需数据库和表的访问权限。详情请参阅["数据库和摄取用户"](/use-cases/observability/clickstack/production#database-ingestion-user)。
:::

### 连接到 HyperDX {#connect-to-hyperdx}

选择您的服务,然后从左侧菜单中选择 `HyperDX`。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg"/>

您无需创建用户,系统将自动进行身份验证,然后提示您创建数据源。

对于仅希望探索 HyperDX 界面的用户,我们推荐使用我们的[示例数据集](/use-cases/observability/clickstack/sample-datasets),这些数据集使用 OTel 数据。

<Image img={hyperdx_cloud_landing} alt="ClickHouse Cloud HyperDX Landing" size="lg"/>

### 用户权限 {#user-permissions}

访问 HyperDX 的用户将使用其 ClickHouse Cloud 控制台凭据自动进行身份验证。访问权限通过服务设置中配置的 SQL 控制台权限进行控制。

#### 配置用户访问 {#configure-access}

1. 在 ClickHouse Cloud 控制台中导航到您的服务
2. 转到 **Settings** → **SQL Console Access**
3. 为每个用户设置适当的权限级别:
   - **Service Admin → Full Access** - 启用告警所需
   - **Service Read Only → Read Only** - 可以查看可观测性数据并创建仪表板
   - **No access** - 无法访问 HyperDX

<Image img={read_only} alt="ClickHouse Cloud Read Only"/>

:::important 告警需要管理员访问权限
要启用告警,至少一个具有 **Service Admin** 权限(在 SQL Console Access 下拉菜单中映射为 **Full Access**)的用户必须至少登录一次 HyperDX。这将在数据库中配置一个专用用户来运行告警查询。
:::

### 创建数据源 {#create-a-datasource}

HyperDX 原生支持 Open Telemetry,但不仅限于 Open Telemetry——用户可以根据需要使用自己的表模式。

#### 使用 Open Telemetry 模式  {#using-otel-schemas}

如果您使用上述 OTel collector 在 ClickHouse 中创建数据库和表,请在创建数据源模型中保留所有默认值,在 `Table` 字段中填入值 `otel_logs` 以创建日志数据源。所有其他设置应自动检测,然后您可以点击 `Save New Source`。

<Image img={hyperdx_cloud_datasource} alt="ClickHouse Cloud HyperDX Datasource" size="lg"/>

要为追踪和 OTel 指标创建数据源,用户可以从顶部菜单中选择 `Create New Source`。

<Image img={hyperdx_create_new_source} alt="HyperDX create new source" size="lg"/>

从这里,选择所需的数据源类型,然后选择相应的表,例如对于追踪,选择表 `otel_traces`。所有设置应自动检测。

<Image img={hyperdx_create_trace_datasource} alt="HyperDX create trace source" size="lg"/>

:::note 关联数据源
请注意,ClickStack 中的不同数据源(如日志和追踪)可以相互关联。要启用此功能,需要在每个数据源上进行额外配置。例如,在日志数据源中,您可以指定相应的追踪数据源,反之亦然。详情请参阅["关联来源"](/use-cases/observability/clickstack/config#correlated-sources)。
:::

#### 使用自定义模式 {#using-custom-schemas}

希望将 HyperDX 连接到现有数据服务的用户可以根据需要完成数据库和表设置。如果表符合 ClickHouse 的 Open Telemetry 模式,设置将自动检测。 

如果使用您自己的模式,我们建议创建日志数据源并确保指定所需字段——详情请参阅["日志数据源设置"](/use-cases/observability/clickstack/config#logs)。

</VerticalStepper>

<JSONSupport/>

此外,用户应联系 support@clickhouse.com 以确保在其 ClickHouse Cloud 服务上启用 JSON。
```
