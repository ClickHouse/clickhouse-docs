---
'slug': '/use-cases/observability/clickstack/getting-started/local-data'
'title': '本地日志与指标'
'sidebar_position': 1
'pagination_prev': null
'pagination_next': null
'description': '开始使用 ClickStack 本地和系统数据以及指标'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import hyperdx from '@site/static/images/use-cases/observability/hyperdx-1.png';
import hyperdx_20 from '@site/static/images/use-cases/observability/hyperdx-20.png';
import hyperdx_3 from '@site/static/images/use-cases/observability/hyperdx-3.png';
import hyperdx_4 from '@site/static/images/use-cases/observability/hyperdx-4.png';
import hyperdx_21 from '@site/static/images/use-cases/observability/hyperdx-21.png';
import hyperdx_22 from '@site/static/images/use-cases/observability/hyperdx-22.png';
import hyperdx_23 from '@site/static/images/use-cases/observability/hyperdx-23.png';
import copy_api_key from '@site/static/images/use-cases/observability/copy_api_key.png';

这个入门指南允许您收集系统中的本地日志和指标，并将其发送到 ClickStack 进行可视化和分析。

**此示例仅在 OSX 和 Linux 系统上有效**

以下示例假设您已根据[一体化镜像的说明](/use-cases/observability/clickstack/getting-started)启动了 ClickStack，并连接到[本地 ClickHouse 实例](/use-cases/observability/clickstack/getting-started#complete-connection-credentials)或[ClickHouse Cloud 实例](/use-cases/observability/clickstack/getting-started#create-a-cloud-connection)。

:::note HyperDX 在 ClickHouse Cloud 中
此示例数据集也可与 HyperDX 在 ClickHouse Cloud 中一起使用，仅需对流程进行少量调整。如果在 ClickHouse Cloud 中使用 HyperDX，则用户需要本地运行 Open Telemetry 收集器，如[此部署模型的入门指南](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)中所述。
:::

<VerticalStepper>

## 导航到 HyperDX UI {#navigate-to-the-hyperdx-ui}

访问 [http://localhost:8080](http://localhost:8080) 以访问本地部署的 HyperDX UI。如果在 ClickHouse Cloud 中使用 HyperDX，请从左侧菜单中选择您的服务和 `HyperDX`。

## 复制数据摄取 API 密钥 {#copy-ingestion-api-key}

:::note HyperDX 在 ClickHouse Cloud 中
如果使用 HyperDX 在 ClickHouse Cloud 中，则此步骤不是必需的。
:::

导航到 [`团队设置`](http://localhost:8080/team) 并从 `API 密钥` 部分复制 `数据摄取 API 密钥`。此 API 密钥确保通过 OpenTelemetry 收集器进行数据摄取的安全。

<Image img={copy_api_key} alt="复制 API 密钥" size="lg"/>

## 创建本地 OpenTelemetry 配置 {#create-otel-configuration}

创建一个名为 `otel-local-file-collector.yaml` 的文件，内容如下。

**重要**：将值 `<YOUR_INGESTION_API_KEY>` 替换为您上述复制的数据摄取 API 密钥（在 ClickHouse Cloud 中的 HyperDX 不需要）。

```yaml
receivers:
  filelog:
    include:
      - /var/log/**/*.log             # Linux
      - /var/log/syslog
      - /var/log/messages
      - /private/var/log/*.log       # macOS
      - /tmp/all_events.log # macos - see below
    start_at: beginning # modify to collect new files only

  hostmetrics:
    collection_interval: 1s
    scrapers:
      cpu:
        metrics:
          system.cpu.time:
            enabled: true
          system.cpu.utilization:
            enabled: true
      memory:
        metrics:
          system.memory.usage:
            enabled: true
          system.memory.utilization:
            enabled: true
      filesystem:
        metrics:
          system.filesystem.usage:
            enabled: true
          system.filesystem.utilization:
            enabled: true
      paging:
        metrics:
          system.paging.usage:
            enabled: true
          system.paging.utilization:
            enabled: true
          system.paging.faults:
            enabled: true
      disk:
      load:
      network:
      processes:

exporters:
  otlp:
    endpoint: localhost:4317
    headers:
      authorization: <YOUR_INGESTION_API_KEY>
    tls:
      insecure: true
    sending_queue:
      enabled: true
      num_consumers: 10
      queue_size: 262144  # 262,144 items × ~8 KB per item ≈ 2 GB

service:
  pipelines:
    logs:
      receivers: [filelog]
      exporters: [otlp]
    metrics:
      receivers: [hostmetrics]
      exporters: [otlp]
```

该配置会收集 OSX 和 Linux 系统的系统日志和指标，通过 OTLP 端点在 4317 端口将结果发送到 ClickStack。

:::note 摄取时间戳
该配置在摄取时调整时间戳，为每个事件分配更新的时间值。用户理想情况下应该使用 OTel 处理器或操作符在日志文件中[预处理或解析时间戳](/use-cases/observability/clickstack/ingesting-data/otel-collector#processing-filtering-transforming-enriching)，以确保保留准确的事件时间。

在此示例设置中，如果接收器或文件处理器配置为从文件的开头开始，则所有现有日志条目将被分配相同的调整时间戳——处理时间而不是原始事件时间。任何追加到文件的新事件将获得接近其实际生成时间的时间戳。

要避免这种行为，可以在接收器配置中将起始位置设置为 `end`。这确保仅摄取并时间标记新的条目，接近其真实到达时间。
:::

有关 OpenTelemetry (OTel) 配置结构的更多详细信息，我们建议查看[官方指南](https://opentelemetry.io/docs/collector/configuration/)。

:::note OSX 的详细日志
希望在 OSX 上获取更详细日志的用户可以在启动下面的收集器之前运行命令 `log stream --debug --style ndjson >> /tmp/all_events.log`。这将捕获详细的操作系统日志到文件 `/tmp/all_events.log`，该文件已包含在上述配置中。
:::

## 启动收集器 {#start-the-collector}

运行以下 Docker 命令以启动 OTel 收集器的实例。

```shell
docker run --network=host --rm -it \
  --user 0:0 \
  -v "$(pwd)/otel-local-file-collector.yaml":/etc/otel/config.yaml \
  -v /var/log:/var/log:ro \
  -v /private/var/log:/private/var/log:ro \
  otel/opentelemetry-collector-contrib:latest \
  --config /etc/otel/config.yaml
```

:::note 根用户
我们以根用户身份运行收集器，以访问所有系统日志——这在 Linux 系统上捕获受保护路径的日志是必要的。然而，这种方法不推荐用于生产环境。在生产环境中，OpenTelemetry 收集器应该作为本地代理部署，只需具有必要的最小权限以访问预定的日志源。
:::

收集器将立即开始收集本地系统日志和指标。

## 浏览系统日志 {#explore-system-logs}

导航到 HyperDX UI。搜索 UI 应该填充本地系统日志。扩展过滤器以选择 `system.log`：

<Image img={hyperdx_20} alt="HyperDX 本地日志" size="lg"/>

## 浏览系统指标 {#explore-system-metrics}

我们可以通过图表浏览我们的指标。

通过左侧菜单导航到图表浏览器。选择源 `Metrics` 和聚合类型 `Maximum`。

在 `选择指标` 菜单中简单输入 `memory`，然后选择 `system.memory.utilization (Gauge)`。

按运行按钮以可视化您的内存使用情况随时间的变化。

<Image img={hyperdx_21} alt="内存随时间变化" size="lg"/>

请注意，数字以浮点 `%` 形式返回。为了清晰呈现，选择 `设置数字格式`。

<Image img={hyperdx_22} alt="数字格式" size="lg"/>

在后续菜单中，您可以从 `输出格式` 下拉菜单中选择 `百分比`，然后单击 `应用`。

<Image img={hyperdx_23} alt="内存占比" size="lg"/>

</VerticalStepper>
