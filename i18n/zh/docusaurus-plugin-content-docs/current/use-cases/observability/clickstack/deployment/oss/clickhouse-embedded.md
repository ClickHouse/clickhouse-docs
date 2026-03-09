---
slug: /use-cases/observability/clickstack/deployment/clickhouse-embedded
title: '嵌入到 ClickHouse 中'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: '在 ClickHouse 服务器中使用嵌入式 ClickStack - ClickHouse 可观测性栈'
doc_type: 'guide'
keywords: ['ClickStack 嵌入', 'ClickHouse 嵌入', 'ClickStack ClickHouse 服务器', '内置可观测性']
---

import Image from '@theme/IdealImage';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import authenticate from '@site/static/images/clickstack/deployment/embedded/authenticate.png';
import inferred_source from '@site/static/images/clickstack/deployment/embedded/inferred-source.png';

ClickStack 直接集成在 ClickHouse 服务器二进制可执行文件中。这意味着您可以在自己的 ClickHouse 实例上直接访问 ClickStack UI (HyperDX) ，而无需部署任何其他组件。此部署方式类似于公共演示站点 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，但会在您自己的 ClickHouse 实例和数据之上运行。


### 适用场景 \{#suitable-for\}

* 以最小配置体验 ClickStack
* 使用可观测性 UI 探索自己的 ClickHouse 数据
* 演示与评估

### 限制 \{#limitations\}

此内嵌版本**并非面向生产环境使用而设计**。与[适用于生产环境的 OSS 部署](/use-cases/observability/clickstack/deployment/oss)相比，缺少以下功能：

- [告警](/use-cases/observability/clickstack/alerts)
- [Dashboard](/use-cases/observability/clickstack/dashboards) 和 [search](/use-cases/observability/clickstack/search) 的持久化能力 —— 仪表板和已保存的搜索不会在不同会话之间保留
- 可自定义的查询设置
- [事件模式](/use-cases/observability/clickstack/event_patterns)

## 部署步骤 \{#deployment-steps\}

<Tabs groupId="install-method">
  <TabItem value="docker" label="Docker" default>
    <VerticalStepper headerLevel="h3">
      ### 启动 ClickHouse

      拉取并运行 ClickHouse 服务器镜像，并设置密码：

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
      ```

      :::tip 无密码运行
      如果您希望在不设置密码的情况下运行，则必须显式启用默认访问管理：

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
      ```

      :::

      ### 打开 ClickStack UI

      在浏览器中打开 [http://localhost:8123](http://localhost:8123)，然后单击 **ClickStack**。

      输入用户名 `default` 和密码 `password`，以连接到本地实例。

      <Image img={authenticate} alt="身份验证" size="lg" />

      ### 创建 Source

      如果您已有 OpenTelemetry 表，ClickStack 会自动检测并创建相应的 Source。

      在全新安装的环境中，系统会提示您创建一个 Source。将 **Table** 字段填写为相应的表名 (例如 `otel_logs`) ，然后单击 **Save New Source**。

      <Image img={inferred_source} alt="创建 Source" size="lg" />

      如果您尚无数据，请参阅 [数据摄取](/use-cases/observability/clickstack/ingesting-data) 以了解可用选项。
    </VerticalStepper>
  </TabItem>

  <TabItem value="binary" label="二进制">
    <VerticalStepper headerLevel="h3">
      ### 启动 ClickHouse

      下载并启动 ClickHouse：

      ```shell
      curl https://clickhouse.com/ | sh
      ```

      <details>
        <summary>可选：启用系统日志表</summary>

        若要探索 ClickHouse 自身的内部日志和指标，请在启动服务器之前，在当前工作目录中创建一个配置片段：

        ```shell
        mkdir -p config.d && cat > config.d/query_logs.xml << 'EOF'
        <clickhouse>
            <query_log>
                <database>system</database>
                <table>query_log</table>
            </query_log>
            <query_thread_log>
                <database>system</database>
                <table>query_thread_log</table>
            </query_thread_log>
            <query_views_log>
                <database>system</database>
                <table>query_views_log</table>
            </query_views_log>
            <metric_log>
                <database>system</database>
                <table>metric_log</table>
            </metric_log>
            <asynchronous_metric_log>
                <database>system</database>
                <table>asynchronous_metric_log</table>
            </asynchronous_metric_log>
        </clickhouse>
        EOF
        ```

        启用该配置后，您可以在打开 ClickStack 后创建一个指向 `system.query_log` 的 **Log Source**：

        | 设置            | 值                                                                                                                                       |
        | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
        | **名称**        | `Query Logs`                                                                                                                            |
        | **数据库**       | `system`                                                                                                                                |
        | **表**         | `query_log`                                                                                                                             |
        | **时间戳列**      | `event_time`                                                                                                                            |
        | **默认 Select** | `event_time, query_kind, query, databases, tables, initial_user, projections, memory_usage, written_rows, read_rows, query_duration_ms` |
      </details>

      启动服务器：

      ```shell
      ./clickhouse server
      ```

      ### 打开 ClickStack UI

      在浏览器中打开 [http://localhost:8123](http://localhost:8123)，然后单击 **ClickStack**。系统会自动创建与本地实例的连接。

      ### 创建 Source

      如果您已有 OpenTelemetry 表，ClickStack 会自动检测并创建相应的 Source。

      如果您尚无数据，请参阅 [数据摄取](/use-cases/observability/clickstack/ingesting-data) 以了解可用选项。

      <Image img={inferred_source} alt="创建 Source" size="lg" />
    </VerticalStepper>
  </TabItem>
</Tabs>

## 后续步骤 {#next-steps}

如果您已经准备好从评估阶段迈向正式使用，可以考虑以下面向生产环境的部署方案：

- [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — 单个容器包含所有组件，包括数据持久化和认证
- [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — 各组件以独立服务形式运行，便于获得更精细的控制
- [Helm](/use-cases/observability/clickstack/deployment/helm) — 推荐用于生产环境中的 Kubernetes 部署
- [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — 由 ClickHouse Cloud 提供全托管服务