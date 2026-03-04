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
import create_source from '@site/static/images/clickstack/deployment/embedded/create-source.png';

ClickStack 直接集成在 ClickHouse 服务器二进制可执行文件中。这意味着您可以在自己的 ClickHouse 实例上直接访问 ClickStack UI（HyperDX），而无需部署任何其他组件。此部署方式类似于公共演示站点 [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com)，但会在您自己的 ClickHouse 实例和数据之上运行。

### 适用场景 \{#suitable-for\}

* 以最小配置体验 ClickStack
* 使用可观测性 UI 探索自己的 ClickHouse 数据
* 演示与评估

### 限制 \{#limitations\}

此内嵌版本**并非面向生产环境使用而设计**。与[适用于生产环境的 OSS 部署](/use-cases/observability/clickstack/deployment/oss)相比，缺少以下功能：

* [告警](/use-cases/observability/clickstack/alerts)
* [Dashboard](/use-cases/observability/clickstack/dashboards) 和 [search](/use-cases/observability/clickstack/search) 的持久化能力 —— 仪表板和已保存的搜索不会在不同会话之间保留
* 可自定义的查询设置
* [事件模式](/use-cases/observability/clickstack/event_patterns)

## 部署步骤 \{#deployment-steps\}

<VerticalStepper headerLevel="h3">
  ### 启动 ClickHouse \{#start-clickhouse\}

  <Tabs groupId="install-method">
    <TabItem value="docker" label="Docker" default>
      拉取并运行 ClickHouse 服务器镜像，并设置密码：

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_PASSWORD=password clickhouse/clickhouse-server:head-alpine
      ```

      :::tip 无密码运行
      如果您希望在无密码的情况下运行，则必须显式启用默认访问管理：

      ```shell
      docker run --rm -it -p 8123:8123 -e CLICKHOUSE_DEFAULT_ACCESS_MANAGEMENT=1 clickhouse/clickhouse-server:head-alpine
      ```

      :::
    </TabItem>

    <TabItem value="binary" label="Binary">
      下载并启动 ClickHouse：

      ```shell
      curl https://clickhouse.com/ | sh

      ./clickhouse server
      ```

      使用二进制方式运行时，`default` 用户没有密码。
    </TabItem>
  </Tabs>

  ### 访问 ClickStack UI \{#navigate-to-clickstack-ui\}

  在浏览器中打开 [http://localhost:8123](http://localhost:8123)，然后点击 **ClickStack**。

  输入您的凭据。如果使用的是上面的 Docker 示例，用户名为 `default`，密码为 `password`。如果使用的是二进制方式，用户名为 `default`，且无密码。

  <Image img={authenticate} alt="Authenticate" size="lg" />

  ### 创建数据源 \{#create-a-source\}

  登录后，系统会提示您创建数据源。如果您已有现成的 OpenTelemetry 表，保留默认值，并在 `Table` 字段中填写相应的表名（例如 `otel_logs`）。其他所有设置应会被自动检测，您只需点击 `Save New Source` 即可。

  如果您尚无任何数据，请参阅 [&quot;Ingesting data&quot;](/use-cases/observability/clickstack/ingesting-data) 了解可用选项。

  <Image img={create_source} alt="Create Source" size="lg" />
</VerticalStepper>

## 后续步骤 \{#next-steps\}

如果您已经准备好从评估阶段迈向正式使用，可以考虑以下面向生产环境的部署方案：

* [All-in-One](/use-cases/observability/clickstack/deployment/all-in-one) — 单个容器包含所有组件，包括数据持久化和认证
* [Docker Compose](/use-cases/observability/clickstack/deployment/docker-compose) — 各组件以独立服务形式运行，便于获得更精细的控制
* [Helm](/use-cases/observability/clickstack/deployment/helm) — 推荐用于生产环境中的 Kubernetes 部署
* [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed) — 由 ClickHouse Cloud 提供全托管服务