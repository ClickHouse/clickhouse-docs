---
slug: /use-cases/observability/clickstack/production
title: '上线生产环境'
sidebar_label: '生产环境'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 上线生产环境'
doc_type: 'guide'
toc_max_heading_level: 2
keywords: ['clickstack', '生产环境', '部署', '最佳实践', '运维']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

在生产环境部署 ClickStack 时，为确保安全性、稳定性以及正确配置，还需要额外考虑若干事项。这些事项会因所使用的分发方式——开源或托管——而有所不同。

<Tabs groupId="architectures">
  <TabItem value="managed-clickstack" label="托管版 ClickStack" default>
    对于生产环境部署，推荐使用 [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed)。它默认采用业界标准的[安全实践](/cloud/security)，包括增强的加密、身份验证与连接能力以及托管访问控制，并同时提供以下优势：

    * 计算资源可独立于存储自动伸缩
    * 基于对象存储的低成本且几乎无限的数据保留能力
    * 能够使用 Warehouses 将读写工作负载进行独立隔离
    * 集成身份验证
    * 自动化[备份](/cloud/features/backups)
    * 无缝升级

    **在使用 Managed ClickStack 时，请遵循适用于 ClickHouse Cloud 的这些[最佳实践](/cloud/guides/production-readiness)。**

    ### 保护摄取安全 \{#secure-ingestion-managed\}

    默认情况下，当在开源发行版之外部署时，ClickStack OpenTelemetry Collector 未进行安全加固，并且在其 OTLP 端口上不要求身份验证。

    要实现安全摄取，请在使用 `OTLP_AUTH_TOKEN` 环境变量部署 collector 时指定身份验证令牌。有关更多详细信息，请参见[“Securing the collector”](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)。

    #### 创建摄取用户 \{#create-a-database-ingestion-user-managed\}

    建议为 OTel collector 创建一个专用用户，用于向 Managed ClickHouse 进行摄取，并确保摄取数据被发送到特定的数据库，例如 `otel`。有关更多详细信息，请参见[“Creating an ingestion user”](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

    ### 配置生存时间 (TTL) \{#configure-ttl-managed\}

    请确保为你的 Managed ClickStack 部署[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)进行了[适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)。这将控制数据的保留时长——默认值为 3 天，通常需要进行调整。

    ### 资源估算 \{#estimating-resources\}

    在部署 **Managed ClickStack** 时，必须预留足够的计算资源来同时处理摄取和查询工作负载。下述估算基于你计划摄取的可观测性数据量，提供一个**基准起点**。

    这些建议基于以下假设：

    * 数据量是指每月的**未压缩摄取量**，适用于日志和追踪。
    * 查询模式是典型的可观测性用例，大多数查询针对**最近的数据**，通常是过去 24 小时。
    * 摄取在**整个月内相对均匀**。如果预计会有突发流量或峰值，应预留额外余量。
    * 存储通过 ClickHouse Cloud 对象存储单独处理，不会对保留时长构成限制。我们假设长时间保留的数据被访问的频率较低。

    对于经常查询长时间范围、执行重型聚合或需要支持大量并发用户的访问模式，可能需要更多计算资源。

    #### 推荐基线规格 \{#recommended-sizing\}

    | 每月摄取量              | 推荐计算资源          |
    | ------------------ | --------------- |
    | &lt; 10 TB / month | 2 vCPU × 3 个副本  |
    | 10–50 TB / month   | 4 vCPU × 3 个副本  |
    | 50–100 TB / month  | 8 vCPU × 3 个副本  |
    | 100–500 TB / month | 30 vCPU × 3 个副本 |
    | 1 PB+ / month      | 59 vCPU × 3 个副本 |

    :::note
    这些数值仅为**估算值**，应作为初始基线使用。实际需求取决于查询复杂度、并发度、保留策略以及摄取吞吐量的波动情况。请始终监控资源使用情况，并按需扩缩容。
    :::

    #### 隔离可观测性工作负载 \{#isolating-workloads\}

    如果你在一个已经支持其他工作负载（例如实时应用分析）的**现有 ClickHouse Cloud 服务**中新增 ClickStack，强烈建议将可观测性流量进行隔离。

    使用 [**Managed Warehouses**](/cloud/reference/warehouses) 创建一个专用于 ClickStack 的**子服务**。这样可以：

    * 将摄取和查询负载与现有应用相互隔离
    * 独立扩缩可观测性工作负载
    * 防止可观测性查询影响生产分析
    * 在需要时在服务之间共享相同的底层数据集

    这种方式可以确保你现有的工作负载不受影响，同时允许 ClickStack 随着可观测性数据的增长而独立伸缩。

    对于更大规模的部署或定制规格建议，请联系支持以获取更精确的评估。
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    ### 网络和端口安全 \{#network-security\}

    默认情况下,Docker Compose 会在主机上暴露端口,使其可从容器外部访问——即使启用了 `ufw`(Uncomplicated Firewall)等工具。这是因为 Docker 网络栈可以绕过主机级防火墙规则,除非进行显式配置。

    **建议：**

    仅暴露生产使用所必需的端口。通常包括 OTLP 端点、API 服务器和前端。

    例如,在 `docker-compose.yml` 文件中删除或注释掉不必要的端口映射:

    ```yaml
    ports:
      - "4317:4317"  # OTLP gRPC
      - "4318:4318"  # OTLP HTTP
      - "8080:8080"  # Only if needed for the API
    # Avoid exposing internal ports like ClickHouse 8123 or MongoDB 27017.
    ```

    有关隔离容器和加强访问控制的详细信息,请参阅 [Docker 网络文档](https://docs.docker.com/network/)。

    ### Session Secret 配置 \{#session-secret\}

    在生产环境中,必须为 ClickStack UI (HyperDX) 的 `EXPRESS_SESSION_SECRET` 环境变量设置强随机值,以保护会话数据并防止篡改。

    以下是将其添加到应用服务的 `docker-compose.yml` 文件的方法：

    ```yaml
      app:
        image: ${IMAGE_NAME_HDX}:${IMAGE_VERSION}
        ports:
          - ${HYPERDX_API_PORT}:${HYPERDX_API_PORT}
          - ${HYPERDX_APP_PORT}:${HYPERDX_APP_PORT}
        environment:
          FRONTEND_URL: ${HYPERDX_APP_URL}:${HYPERDX_APP_PORT}
          HYPERDX_API_KEY: ${HYPERDX_API_KEY}
          HYPERDX_API_PORT: ${HYPERDX_API_PORT}
          HYPERDX_APP_PORT: ${HYPERDX_APP_PORT}
          HYPERDX_APP_URL: ${HYPERDX_APP_URL}
          HYPERDX_LOG_LEVEL: ${HYPERDX_LOG_LEVEL}
          MINER_API_URL: 'http://miner:5123'
          MONGO_URI: 'mongodb://db:27017/hyperdx'
          NEXT_PUBLIC_SERVER_URL: http://127.0.0.1:${HYPERDX_API_PORT}
          OTEL_SERVICE_NAME: 'hdx-oss-api'
          USAGE_STATS_ENABLED: ${USAGE_STATS_ENABLED:-true}
          EXPRESS_SESSION_SECRET: "super-secure-random-string"
        networks:
          - internal
        depends_on:
          - ch-server
          - db1
    ```

    您可以使用 `openssl` 生成强密钥:

    ```shell
    openssl rand -hex 32
    ```

    避免将密钥提交到源代码控制系统。在生产环境中,请考虑使用环境变量管理工具(例如 Docker Secrets、HashiCorp Vault 或特定环境的 CI/CD 配置)。

    ### 安全摄取 \{#secure-ingestion\}

    所有摄取操作都应通过 ClickStack 发行版的 OpenTelemetry (OTel) collector 所暴露的 OTLP 端口进行。默认情况下,这需要在启动时生成的安全摄取 API key。向 OTel 端口发送数据时必须使用此密钥,该密钥可在 HyperDX UI 的 `Team Settings → API Keys` 下找到。

    <Image img={ingestion_key} alt="摄取密钥" size="lg" />

    此外,建议为 OTLP 端点启用 TLS。

    #### 创建摄取用户 \{#create-a-database-ingestion-user-oss\}

    建议为 OTel collector 创建专用用户以便将数据摄取到 ClickHouse,并确保摄取的数据发送到特定数据库,例如 `otel`。有关更多详细信息,请参阅[&quot;创建摄取用户&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

    ### ClickHouse \{#clickhouse\}

    自行管理 ClickHouse 实例的用户应遵循以下最佳实践。

    #### 安全最佳实践 \{#self-managed-security\}

    如果您正在管理自己的 ClickHouse 实例,务必启用 **TLS**、强制执行身份验证,并遵循访问加固的最佳实践。请参阅[此博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)了解实际错误配置案例及其规避方法。

    ClickHouse OSS 开箱即用提供了强大的安全功能。但是,这些功能需要配置:

    * **使用 TLS**，通过在 `config.xml` 中配置 `tcp_port_secure` 和 `<openSSL>` 实现。参见 [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls)。
    * 为 `default` USER **设置强密码**，或者将其禁用。
    * **避免将 ClickHouse 对外暴露**，除非是出于明确目的。默认情况下，除非修改 `listen_host`，ClickHouse 只绑定到 `localhost`。
    * **使用身份验证方式**，例如密码、证书、SSH 密钥或[外部身份验证器](/operations/external-authenticators)。
    * 使用 IP 过滤和 `HOST` 子句来**限制访问**。参见 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
    * **启用基于角色的访问控制（RBAC）** 以授予更细粒度的访问权限。请参阅 [operations/access-rights](/operations/access-rights)。
    * **通过使用 [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles) 和只读模式来实施配额和限制。**
    * **对静态数据进行加密**，并使用安全的外部存储。请参阅 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
    * **避免硬编码凭证。** 请在 ClickHouse Cloud 中使用 [命名集合](/operations/named-collections) 或 IAM 角色。
    * 使用[系统日志](/operations/system-tables/query_log)和[会话日志](/operations/system-tables/session_log)审计访问和查询。

    另请参阅[外部身份验证器](/operations/external-authenticators)和[查询复杂度设置](/operations/settings/query-complexity),用于管理用户并确保查询/资源限制。

    #### ClickStack UI 的用户权限 \{#user-permissions\}

    ClickStack UI 使用的 ClickHouse 用户只需设置为 `readonly` 用户,并授予修改以下设置的权限:

    * `max_rows_to_read`（至少设置为 100 万）
    * `read_overflow_mode`
    * `cancel_http_readonly_queries_on_client_close`
    * `wait_end_of_query`

    默认情况下,OSS 和 ClickHouse Cloud 中的 `default` 用户都拥有这些权限,但建议创建一个具有这些权限的新用户。

    ### 配置生存时间 (TTL) \{#configure-ttl\}

    确保已为您的 ClickStack 部署[适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)。这控制着数据的保留时长——默认的 3 天通常需要修改。

    ### MongoDB 使用指南 \{#mongodb-guidelines\}

    请遵循官方 [MongoDB 安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。
  </TabItem>
</Tabs>