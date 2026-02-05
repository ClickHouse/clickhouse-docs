import Image from '@theme/IdealImage';
import select_source from '@site/static/images/clickstack/getting-started/select_source.png';
import start_ingestion from '@site/static/images/clickstack/getting-started/start_ingestion.png';
import otel_collector_start from '@site/static/images/clickstack/getting-started/otel_collector_start.png';
import advanced_otel_collector from '@site/static/images/clickstack/getting-started/advanced_otel_collector.png';
import vector_config from '@site/static/images/clickstack/getting-started/vector_config.png';
import ExampleOTelConfig from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/deployment/_snippets/_config_example_otel.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Image img={start_ingestion} size="lg" alt="开始摄取" border />

选择「Start Ingestion」后，系统会提示你选择一个摄取源。托管版 ClickStack 支持将 OpenTelemetry 和 [Vector](https://vector.dev/) 作为其主要摄取源。不过，用户也可以使用任意 [ClickHouse Cloud 支持的集成](/integrations)，以自定义的 schema 直接向 ClickHouse 发送数据。

<Image img={select_source} size="lg" alt="选择来源" border />

:::note[推荐使用 OpenTelemetry]
强烈建议采用 OpenTelemetry 作为摄取格式。
它提供最简单且最高效的使用体验，并且内置的 schema 专门为与 ClickStack 高效配合而设计。
:::

<Tabs groupId="ingestion-sources">
  <TabItem value="open-telemetry" label="OpenTelemetry" default>
    要将 OpenTelemetry 数据发送到托管版 ClickStack,建议使用 OpenTelemetry Collector。该收集器作为网关,接收来自应用程序(及其他收集器)的 OpenTelemetry 数据,并将其转发至 ClickHouse Cloud。

    如果您尚未运行收集器,请按照以下步骤启动。如果您已有现有收集器,同样提供了配置示例供参考。

    ### 启动 collector \{#start-a-collector\}

    以下内容假定您使用推荐的 **ClickStack 发行版 OpenTelemetry Collector**,该版本包含额外的处理功能,并专门针对 ClickHouse Cloud 进行了优化。如果您希望使用自己的 OpenTelemetry Collector,请参阅[“配置现有收集器”](#configure-existing-collectors)。

    要快速开始,请复制并运行下方显示的 Docker 命令。

    <Image img={otel_collector_start} size="md" alt="OTel collector 来源" />

    该命令应包含预先填充好的连接凭据。

    :::note[部署到生产环境]
    虽然此命令使用 `default` 用户连接托管 ClickStack,但在[投入生产](/use-cases/observability/clickstack/production#create-a-user)并修改配置时,您应该创建一个专用用户。
    :::

    运行此命令即可启动 ClickStack 收集器,OTLP 端点将在端口 4317(gRPC)和 4318(HTTP)上暴露。如果您已配置 OpenTelemetry 插桩和代理,可立即开始向这些端点发送遥测数据。

    ### 配置现有的采集器 \{#configure-existing-collectors\}

    您也可以配置现有的 OpenTelemetry Collector,或使用自定义的 Collector 发行版。

    :::note[需要 ClickHouse exporter]
    如果您使用的是自己的发行版,例如 [contrib 镜像](https://github.com/open-telemetry/opentelemetry-collector-contrib),请确保其中包含 [ClickHouse exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)。
    :::

    为此,我们提供了一个示例 OpenTelemetry Collector 配置,该配置使用 ClickHouse 导出器并设置了适当的参数,同时公开 OTLP 接收器。此配置与 ClickStack 发行版所需的接口和行为相匹配。

    <ExampleOTelConfig />

    <Image img={advanced_otel_collector} size="lg" alt="高级 OTel collector 源配置" border />

    有关配置 OpenTelemetry 采集器的更多详细信息,请参阅[&quot;使用 OpenTelemetry 进行摄取&quot;](/use-cases/observability/clickstack/ingesting-data/opentelemetry)

    ### 启动摄取(可选) \{#start-ingestion-create-new\}

    如果您有需要使用 OpenTelemetry 进行插桩的现有应用或基础设施,请在 UI 中转到链接的相关指南。

    要对应用进行插桩以收集 traces 和日志,请使用[受支持的语言 SDKs](/use-cases/observability/clickstack/sdks),这些 SDKs 会将数据发送到您的 OpenTelemetry Collector,后者作为网关将数据摄取到托管版 ClickStack。

    日志可以通过[使用 OpenTelemetry Collectors 收集](/use-cases/observability/clickstack/integrations/host-logs)(以 agent 模式运行)并转发到同一个 collector。对于 Kubernetes 监控,请参阅[专用指南](/use-cases/observability/clickstack/integrations/kubernetes)。有关其他集成,请参阅我们的[快速入门指南](/use-cases/observability/clickstack/integration-guides)。

    ### 演示数据 \{#demo-data\}

    或者,如果您当前没有现有数据,可以尝试我们提供的示例数据集之一。

    * [示例数据集](/use-cases/observability/clickstack/getting-started/sample-data) - 从我们的公共演示中加载示例数据集。诊断一个简单问题。
    * [本地文件和指标](/use-cases/observability/clickstack/getting-started/local-data) - 加载本地文件,并使用本地 OTel collector 在 OSX 或 Linux 上监控系统。

    <br />
  </TabItem>

  <TabItem value="Vector" label="Vector" default>
    [Vector](https://vector.dev) 是一款高性能、厂商无关的可观测性数据管道,因其灵活性与低资源占用,在日志摄取场景中尤为流行。

    在将 Vector 与 ClickStack 一起使用时,用户需要自行定义 schema。这些 schema 可以遵循 OpenTelemetry 约定,也可以完全自定义,用于表示用户自定义的事件结构。

    :::note Timestamp required
    托管版 ClickStack 唯一严格的要求是数据必须包含一个**时间戳列**(或等效的时间字段),该字段可以在 ClickStack UI 中配置数据源时声明。
    :::

    以下内容假定您已有一个正在运行的 Vector 实例,并已预先配置好摄取管道,用于发送数据。

    ### 创建数据库和表 \{#create-database-and-tables\}

    在进行数据摄取之前,Vector 需要预先定义好表及其 schema。

    首先创建一个数据库。这可以通过 [ClickHouse Cloud 控制台](/cloud/get-started/sql-console) 完成。

    例如,为日志创建一个数据库:

    ```sql
    CREATE DATABASE IF NOT EXISTS logs
    ```

    然后创建一个表,其表结构需与日志数据的结构相匹配。以下示例假设采用经典的 Nginx 访问日志格式:

    ```sql
    CREATE TABLE logs.nginx_logs
    (
        `time_local` DateTime,
        `remote_addr` IPv4,
        `remote_user` LowCardinality(String),
        `request` String,
        `status` UInt16,
        `body_bytes_sent` UInt64,
        `http_referer` String,
        `http_user_agent` String,
        `http_x_forwarded_for` LowCardinality(String),
        `request_time` Float32,
        `upstream_response_time` Float32,
        `http_host` String
    )
    ENGINE = MergeTree
    ORDER BY (toStartOfMinute(time_local), status, remote_addr);
    ```

    您的表必须与 Vector 生成的输出模式对齐。根据您的数据需要调整该模式,并遵循推荐的[模式最佳实践](/docs/best-practices/select-data-types)。

    我们强烈建议先了解 ClickHouse 中[主键](/docs/primary-indexes)的工作机制,并根据访问模式选择合适的排序键。有关如何选择主键的 ClickStack 专用指导,请参见[ClickStack 专用说明](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)。

    创建表之后,复制所展示的配置片段。根据需要调整输入,以对接并消费您现有的 pipeline,同时在必要时修改目标表和数据库。凭据应已预先填充。

    <Image img={vector_config} size="lg" alt="Vector 配置" />

    有关使用 Vector 摄取数据的更多示例,请参阅[&quot;使用 Vector 进行摄取&quot;](/use-cases/observability/clickstack/ingesting-data/vector)或查看 [Vector ClickHouse sink 文档](https://vector.dev/docs/reference/configuration/sinks/clickhouse/)以获取高级配置选项。

    <br />
  </TabItem>
</Tabs>