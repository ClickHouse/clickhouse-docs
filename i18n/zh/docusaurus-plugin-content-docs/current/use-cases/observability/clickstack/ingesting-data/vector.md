---
slug: /use-cases/observability/clickstack/ingesting-data/vector
pagination_prev: null
pagination_next: null
description: '使用 Vector 向 ClickStack 摄取数据 - ClickHouse 可观测性栈'
title: '使用 Vector 进行数据摄取'
toc_max_heading_level: 2
doc_type: 'guide'
keywords: ['clickstack', 'vector', 'traces', 'observability', 'telemetry']
---

import Image from '@theme/IdealImage';
import InstallingVector from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_installing_vector.md';
import VectorSampleData from '@site/i18n/zh/docusaurus-plugin-content-docs/current/use-cases/observability/clickstack/ingesting-data/_snippets/_vector_sample_data.md';
import ingestion_key from '@site/static/images/clickstack/clickstack-ingestion-key.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import create_vector_datasource from '@site/static/images/clickstack/create-vector-datasource.png';
import create_vector_datasource_oss from '@site/static/images/clickstack/create-vector-datasource-oss.png';
import nginx_logs_vector_search from '@site/static/images/clickstack/nginx-logs-vector-search.png';
import launch_clickstack_vector from '@site/static/images/clickstack/launch-clickstack-vector.png';
import play_ui from '@site/static/images/clickstack/play-ui-clickstack.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

[Vector](https://vector.dev) 是一个高性能、与供应商无关的可观测性数据管道。它通常用于从各种来源收集、转换和路由日志与指标，并且由于其灵活性和低资源占用，在日志摄取场景中尤其受欢迎。

在将 Vector 与 ClickStack 一起使用时，用户需要自行定义模式（schema）。这些模式可以遵循 OpenTelemetry 约定，也可以完全自定义，用于表示用户定义的事件结构。实践中，Vector 摄取最常见的使用场景是 **日志**，在这种场景下，用户希望在数据写入 ClickHouse 之前，对解析和富化具备完全的控制权。

本指南侧重介绍在 ClickStack 开源版和托管版中，如何使用 Vector 将数据导入 ClickStack。为简化说明，它不会深入讲解 Vector 的 sources 或 pipeline 配置，而是重点说明如何配置将数据写入 ClickHouse 的 **sink**，并确保生成的模式与 ClickStack 兼容。

对于 ClickStack 而言，无论使用开源还是托管部署，唯一严格的要求是数据中必须包含一个 **时间戳列（timestamp column）**（或等效的时间字段），并且可以在 ClickStack UI 中配置数据源时进行声明。


## 通过 Vector 发送数据 \{#sending-data-with-vector\}

<br/>

<Tabs groupId="vector-options">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    以下指南假定您已创建托管 ClickStack 服务并记录了服务凭据。如果尚未完成,请遵循托管 ClickStack 的[入门指南](/use-cases/observability/clickstack/getting-started/managed),直至进入配置 Vector 的步骤。

    <VerticalStepper headerLevel="h3">
      ### 创建数据库和表

      Vector 需要在数据摄取之前定义表和架构。

      首先创建一个数据库。可以通过 [ClickHouse Cloud 控制台](/cloud/get-started/sql-console)完成此操作。

      在以下示例中,我们使用 `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      为您的数据创建表。该表应与数据的输出架构相匹配。以下示例假定使用经典的 Nginx 结构。请根据您的数据进行相应调整,并遵循[架构最佳实践](/best-practices/select-data-types)。我们**强烈建议**您熟悉[主键概念](/primary-indexes),并根据[此处](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)概述的指南选择主键。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 主键
      上述主键假设了在 ClickStack UI 中访问 Nginx 日志的典型模式,但可能需要根据生产环境中的工作负载进行调整。
      :::

      ### 将 ClickHouse sink 添加到 Vector 配置

      修改 Vector 配置以包含 ClickHouse sink,更新 `inputs` 字段以接收来自现有管道的事件。

      此配置假定您的上游 Vector 管道已**准备好与目标 ClickHouse 模式匹配的数据**,即字段已完成解析、正确命名并设置了适当的类型以供插入。请参阅[**下方的 Nginx 示例**](#example-dataset-with-vector),了解如何将原始日志行解析和规范化为适用于 ClickStack 的模式的完整示例。

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      默认情况下,我们建议使用 **`json_each_row`** 格式,该格式将每个事件编码为每行一个 JSON 对象。这是 ClickStack 在摄取 JSON 数据时的默认格式和推荐格式,应优先选择此格式,而非其他格式(例如将 JSON 对象编码为字符串)。

      ClickHouse sink 还支持 **Arrow 流编码**(目前处于 beta 阶段)。这可以提供更高的吞吐量,但也有一些重要限制:数据库和表必须是静态的,因为 schema 仅在启动时获取一次,且不支持动态路由。因此,Arrow 编码最适合用于固定且定义明确的摄取管道。

      我们建议查阅 [Vector 文档](https://vector.dev/docs/reference/configuration/sinks/clickhouse)中可用的接收器配置选项:

      :::note
      上述示例使用了托管 ClickStack 的默认用户。对于生产环境部署,我们建议[创建专用的摄取用户](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user),并配置适当的权限和限制。
      :::

      ### 导航到 ClickStack UI

      导航至您的托管 ClickStack 服务,从左侧菜单中选择&quot;ClickStack&quot;。如果您已完成初始配置向导,系统将在新标签页中启动 ClickStack UI,并自动完成身份验证。如果尚未完成,请继续完成初始配置向导,在选择 Vector 作为输入源后,点击&quot;启动 ClickStack&quot;。

      <Image img={launch_clickstack_vector} alt="启动用于 Vector 的 ClickStack" size="lg" />

      ### 创建数据源

      创建日志数据源。如果不存在数据源,首次登录时系统将提示您创建。否则,请导航至团队设置并添加新数据源。

      <Image img={create_vector_datasource} alt="创建数据源 - Vector" size="lg" />

      上述配置假定采用 Nginx 风格的模式,其中 `time_local` 列用作时间戳。该列应尽可能为主键中声明的时间戳列。此列为必需项。

      我们还建议更新 `Default SELECT` 以明确定义日志视图中返回的列。如果有其他可用字段(例如服务名称、日志级别或 body 列),也可以进行配置。如果时间戳显示列与表主键中使用的列不同且已在上文配置,则也可以覆盖该列。

      在上述示例中,数据中不存在 `Body` 列。该列通过 SQL 表达式定义,从可用字段重构 Nginx 日志行。

      有关其他可用选项,请参阅[配置参考](/use-cases/observability/clickstack/config)。

      ### 浏览数据

      导航到日志视图以浏览数据并开始使用 ClickStack。

      <Image img={nginx_logs_vector_search} alt="在 ClickStack 中使用 Nginx 日志" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="开源版 ClickStack">
    <VerticalStepper headerLevel="h3">
      ### 创建数据库和表

      Vector 需要在数据摄取之前定义表和架构。

      首先创建一个数据库。这可以通过 [ClickHouse Web 用户界面](/interfaces/http#web-ui) 在 [http://localhost:8123/play](http://localhost:8123/play) 完成。使用默认用户名和密码 `api:api`。

      <Image img={play_ui} alt="体验 ClickStack UI" size="lg" />

      在以下示例中,我们使用 `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      为您的数据创建表。该表结构应与数据的输出模式相匹配。以下示例假定使用经典的 Nginx 结构。请根据实际数据进行相应调整,并遵循[模式最佳实践](/best-practices/select-data-types)。我们**强烈建议**您熟悉[主键概念](/primary-indexes),并根据[此处](/use-cases/observability/clickstack/performance_tuning#choosing-a-primary-key)概述的指南选择主键。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 主键
      上述主键假设了 ClickStack UI 中 Nginx 日志的典型访问模式,但可能需要根据生产环境中的工作负载进行调整。
      :::

      ### 将 ClickHouse sink 添加到 Vector 配置

      使用 Vector 向 ClickStack 摄取数据时,应直接发送到 ClickHouse,绕过收集器公开的 OTLP 端点。

      修改 Vector 配置以包含 ClickHouse sink,更新 `inputs` 字段以接收来自现有管道的事件。

      此配置假定您的上游 Vector 管道已**准备好与目标 ClickHouse 模式匹配的数据**,即字段已解析、正确命名并设置了适当的类型以供插入。请参阅[**下面的 Nginx 示例**](#example-dataset-with-vector),了解如何将原始日志行解析和规范化为适用于 ClickStack 的模式的完整示例。

      ```yaml
      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - your_input
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      默认情况下,我们建议使用 **`json_each_row`** 格式,该格式将每个事件编码为每行一个 JSON 对象。这是 ClickStack 在摄取 JSON 数据时的默认格式和推荐格式,应优先使用,而非其他格式(如编码为字符串的 JSON 对象)。

      ClickHouse sink 还支持 **Arrow 流编码**(目前处于 beta 阶段)。这可以提供更高的吞吐量,但存在重要限制:数据库和表必须是静态的,因为 schema 仅在启动时获取一次,且不支持动态路由。因此,Arrow 编码最适合固定且定义明确的摄取管道。

      我们建议查阅 [Vector 文档](https://vector.dev/docs/reference/configuration/sinks/clickhouse)中可用的接收器配置选项:

      :::note
      上述示例使用 `api` 用户用于 ClickStack Open Source。对于生产环境部署,我们建议[创建专用的摄取用户](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)并设置适当的权限和限制。上述配置还假设 Vector 与 ClickStack 运行在同一主机上。在生产环境部署中,这种情况可能会有所不同。我们建议通过安全的 HTTPS 端口 8443 发送数据。
      :::

      ### 导航到 ClickStack UI

      导航至 ClickStack UI [http://localhost:8080](http://localhost:8080)。如果您尚未完成初始设置,请创建用户。

      <Image img={hyperdx_login} alt="登录 ClickStack" size="lg" />

      ### 创建数据源

      导航到团队设置并添加新数据源。

      <Image img={create_vector_datasource_oss} alt="创建数据源 - Vector" size="lg" />

      上述配置假定采用 Nginx 风格的模式,其中 `time_local` 列用作时间戳。该列应尽可能为主键中声明的时间戳列。此列为必需项。

      我们还建议更新 `Default SELECT` 以明确定义日志视图中返回的列。如果有其他可用字段(例如服务名称、日志级别或 body 列),也可以进行配置。如果时间戳显示列与表主键中使用的列不同且已在上文配置,则也可以覆盖该列。

      在上述示例中,数据中不存在 `Body` 列。该列通过 SQL 表达式定义,从可用字段重构 Nginx 日志行。

      有关其他可用选项,请参阅[配置参考](/use-cases/observability/clickstack/config)。

      ### 浏览数据

      导航到日志视图以浏览数据并开始使用 ClickStack。

      <Image img={nginx_logs_vector_search} alt="ClickStack 中的 NGINX 日志" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## 使用 Vector 的示例数据集 {#example-dataset-with-vector}

为了提供一个更完整的示例，我们在下面使用一个 **Nginx 日志文件**。

<Tabs groupId="example-dataset-options">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    以下指南假定您已创建托管 ClickStack 服务并记录了服务凭据。如果尚未完成,请遵循托管 ClickStack 的[入门指南](/use-cases/observability/clickstack/getting-started/managed),直至进入配置 Vector 的步骤。

    <VerticalStepper headerLevel="h3">
      ### 安装 Vector

      <InstallingVector />

      ### 下载示例数据

      <VectorSampleData />

      ### 创建数据库和表

      Vector 要求在数据摄取之前先定义表和架构。

      首先创建一个数据库。可以通过 [ClickHouse Cloud 控制台](/cloud/get-started/sql-console)完成此操作。

      创建数据库 `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      创建数据表。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 主键
      上述主键假设了在 ClickStack UI 中访问 Nginx 日志的典型模式,但可能需要根据生产环境中的工作负载进行调整。
      :::

      ### 复制 Vector 配置

      复制 vector 配置并创建文件 `nginx.yaml`,设置 `CLICKHOUSE_ENDPOINT` 和 `CLICKHOUSE_PASSWORD`。

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "<CLICKHOUSE_ENDPOINT>"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "default"
            password: "<CLICKHOUSE_PASSWORD>"
      ```

      :::note
      上述示例使用了托管 ClickStack 的默认用户。对于生产环境部署,我们建议[创建专用的摄取用户](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user),并配置适当的权限和限制。
      :::

      ### 启动 Vector

      首先创建数据目录以记录文件偏移量,然后使用以下命令启动 Vector。

      ```bash
      mkdir ./.vector-data
      vector --config nginx.yaml
      ```

      ### 导航到 ClickStack UI

      导航至您的托管 ClickStack 服务,从左侧菜单中选择&quot;ClickStack&quot;。如果您已完成初始配置,系统将在新标签页中启动 ClickStack UI,并自动完成身份验证。如果尚未完成,请继续完成初始配置流程,在选择 Vector 作为输入源后点击&quot;启动 ClickStack&quot;。

      <Image img={launch_clickstack_vector} alt="启动用于 Vector 的 ClickStack" size="lg" />

      ### 创建数据源

      创建日志数据源。如果不存在数据源,首次登录时系统将提示您创建。否则,请导航至团队设置并添加新数据源。

      <Image img={create_vector_datasource} alt="创建 Vector 数据源" size="lg" />

      该配置假定使用 Nginx 模式,其中 `time_local` 列用作时间戳。这是主键中声明的时间戳列。该列为必需项。

      我们还指定了默认选择为 `time_local, remote_addr, status, request`,用于定义日志视图中返回哪些列。

      在上述示例中,数据中并不存在 `Body` 列,而是将其定义为 SQL 表达式:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      此操作从结构化字段重构日志行。

      有关其他可用选项,请参阅[配置参考](/use-cases/observability/clickstack/config)。

      ### 探索数据

      导航到 `October 20th, 2025` 的搜索视图,以浏览数据并开始使用 ClickStack。

      <Image img={nginx_logs_vector_search} alt="HyperDX 用户界面" size="lg" />
    </VerticalStepper>
  </TabItem>

  <TabItem value="oss-clickstack" label="开源版 ClickStack">
    以下指南假设您已通过[入门指南](use-cases/observability/clickstack/getting-started/managed)完成 ClickStack 开源版的部署配置。

    <VerticalStepper headerLevel="h3">
      ### 安装 Vector

      <InstallingVector />

      ### 下载示例数据

      <VectorSampleData />

      ### 创建数据库和表

      Vector 要求在数据摄取之前先定义表和架构。

      首先创建一个数据库。这可以通过 [ClickHouse Web 用户界面](/interfaces/http#web-ui) 在 [http://localhost:8123/play](http://localhost:8123/play) 完成。使用默认用户名和密码 `api:api`。

      <Image img={play_ui} alt="在 UI 中试用 ClickStack" size="lg" />

      创建数据库 `logs`:

      ```sql
      CREATE DATABASE IF NOT EXISTS logs
      ```

      创建数据表。

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
      ORDER BY (toStartOfMinute(time_local), status, remote_addr)
      ```

      :::note Nginx 主键
      上述主键假设了在 ClickStack UI 中访问 Nginx 日志的典型模式,但可能需要根据生产环境中的工作负载进行调整。
      :::

      ### 复制 Vector 配置

      使用 Vector 向 ClickStack 摄取数据时,应直接发送到 ClickHouse,绕过收集器公开的 OTLP 端点。

      复制 Vector 配置并创建文件 `nginx.yaml`。

      ```yaml
      data_dir: ./.vector-data
      sources:
        nginx_logs:
          type: file
          include:
            - access.log
          read_from: beginning

      transforms:
        decode_json:
          type: remap
          inputs:
            - nginx_logs
          source: |
            . = parse_json!(to_string!(.message))
            ts = parse_timestamp!(.time_local, format: "%d/%b/%Y:%H:%M:%S %z")
            # ClickHouse-friendly DateTime format
            .time_local = format_timestamp!(ts, format: "%F %T")

      sinks:
        clickhouse:
          type: clickhouse
          inputs:
            - decode_json
          endpoint: "http://localhost:8123"
          database: logs
          format: json_each_row
          table: nginx_logs
          skip_unknown_fields: true
          auth:
            strategy: "basic"
            user: "api"
            password: "api"
      ```

      :::note
      上述示例使用 `api` 用户用于 ClickStack 开源版。对于生产环境部署,我们建议[创建专用的摄取用户](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)并设置适当的权限和限制。上述配置还假设 Vector 与 ClickStack 运行在同一主机上。在生产环境部署中,这种情况可能有所不同。我们建议通过安全的 HTTPS 端口 8443 发送数据。
      :::

      ### 启动 Vector

      使用以下命令启动 Vector。

      ```bash
      mkdir ./.vector-data
      vector --config nginx-local.yaml
      ```

      ### 创建数据源

      通过 `Team -> Sources` 创建日志数据源

      <Image img={create_vector_datasource_oss} alt="创建数据源 - Vector" size="lg" />

      该配置假定使用 Nginx 模式,其中 `time_local` 列用作时间戳。这是主键中声明的时间戳列。该列为必需项。

      我们还指定了默认选择为 `time_local, remote_addr, status, request`,用于定义日志视图中返回哪些列。

      在上述示例中,数据中并不存在 `Body` 列,而是将其定义为 SQL 表达式:

      ```sql
      concat(
        remote_addr, ' ',
        remote_user, ' ',
        '[', formatDateTime(time_local, '%d/%b/%Y:%H:%M:%S %z'), '] ',
        '"', request, '" ',
        toString(status), ' ',
        toString(body_bytes_sent), ' ',
        '"', http_referer, '" ',
        '"', http_user_agent, '" ',
        '"', http_x_forwarded_for, '" ',
        toString(request_time), ' ',
        toString(upstream_response_time), ' ',
        '"', http_host, '"'
      )
      ```

      此操作从结构化字段重构日志行。

      有关其他可用选项,请参阅[配置参考](/use-cases/observability/clickstack/config)。

      ### 导航到 ClickStack UI

      在浏览器中访问 ClickStack UI [http://localhost:8080](http://localhost:8080)。如果您尚未完成初始配置,请创建用户。

      <Image img={hyperdx_login} alt="登录 ClickStack" size="lg" />

      ### 探索数据

      导航到 `October 20th, 2025` 的搜索视图,以浏览数据并开始使用 ClickStack。

      <Image img={nginx_logs_vector_search} alt="HyperDX 用户界面" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>