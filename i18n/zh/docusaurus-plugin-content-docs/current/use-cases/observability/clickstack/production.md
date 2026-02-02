---
slug: /use-cases/observability/clickstack/production
title: '上线生产环境'
sidebar_label: '生产环境'
pagination_prev: null
pagination_next: null
description: '使用 ClickStack 上线生产环境'
doc_type: 'guide'
keywords: ['clickstack', '生产环境', '部署', '最佳实践', '运维']
---

import Image from '@theme/IdealImage';
import connect_cloud from '@site/static/images/use-cases/observability/connect-cloud.png';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx-cloud.png';
import ingestion_key from '@site/static/images/use-cases/observability/ingestion-keys.png';
import hyperdx_login from '@site/static/images/use-cases/observability/hyperdx-login.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

在生产环境部署 ClickStack 时，还需要额外考虑一些事项，以确保安全性、稳定性和正确配置。这些注意事项会根据所使用的发行模式（开源版或托管版）而有所不同。

<Tabs groupId="architectures">
  <TabItem value="托管 ClickStack" label="托管版 ClickStack" default>
    对于生产环境部署，推荐使用 [Managed ClickStack](/use-cases/observability/clickstack/getting-started/managed)。它默认采用行业标准的[安全实践](/cloud/security)，包括增强的加密、身份验证与连接能力以及托管访问控制，并提供如下优势：

    * 计算资源可在与存储解耦的前提下自动伸缩
    * 基于对象存储的低成本且几乎无限的数据保留能力
    * 能够通过 Warehouses 独立隔离读写工作负载
    * 集成身份验证
    * 自动[备份](/cloud/features/backups)
    * 无缝升级

    **在使用 Managed ClickStack 时，请遵循适用于 ClickHouse Cloud 的这些[最佳实践](/cloud/guides/production-readiness)。**

    ### 数据库和摄取用户 \{#database-ingestion-user-managed-managed\}

    建议为 OTel collector 创建一个专用用户，用于向 Managed ClickHouse 摄取数据，并确保摄取数据被发送到特定数据库，例如 `otel`。更多详情请参见[“Creating an ingestion user”](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

    ## 配置 Time To Live (生存时间, TTL) \{#configure-ttl-managed\}

    请确保已为 Managed ClickStack 部署[正确配置](/use-cases/observability/clickstack/ttl#modifying-ttl)[Time To Live (生存时间, TTL)](/use-cases/observability/clickstack/ttl)。生存时间 (TTL) 控制数据的保留时长——默认值为 3 天，通常需要根据需求进行调整。

    ## 资源预估 \{#estimating-resources\}

    在部署 **Managed ClickStack** 时，必须预留足够的计算资源，以同时处理摄取和查询工作负载。下面的估算值根据你计划摄取的可观测性数据量提供了一个**基线起点**。

    这些推荐基于以下假设：

    * 数据量指每月的**未压缩摄取数据量**，适用于日志和追踪数据。
    * 查询模式为典型的可观测性场景，大多数查询针对**近期数据**，通常是最近 24 小时。
    * 摄取在**整个月内相对均匀**。如果预计存在突发流量或峰值，你需要预留额外冗余。
    * 存储通过 ClickHouse Cloud 对象存储单独处理，对保留时长不构成限制。我们假设长周期保留的数据访问频率较低。

    如果访问模式经常查询更长时间范围、执行重度聚合，或需要支持大量并发用户，则可能需要更多计算资源。

    ### 推荐基线规格 \{#recommended-sizing\}

    | 每月摄取量              | 推荐计算资源         |
    | ------------------ | -------------- |
    | &lt; 10 TB / month | 2 vCPU × 3 副本  |
    | 10–50 TB / month   | 4 vCPU × 3 副本  |
    | 50–100 TB / month  | 8 vCPU × 3 副本  |
    | 100–500 TB / month | 30 vCPU × 3 副本 |
    | 1 PB+ / month      | 59 vCPU × 3 副本 |

    :::note
    这些数值仅为**预估值**，应作为初始基线使用。实际需求取决于查询复杂度、并发度、保留策略以及摄取突发性。请始终监控资源使用情况，并按需扩缩容。
    :::

    ### 隔离可观测性工作负载 \{#isolating-workloads\}

    如果你在一个已经支持其他工作负载（例如实时应用分析）的**现有 ClickHouse Cloud 服务**中新增 ClickStack，强烈建议对可观测性流量进行隔离。

    使用 [**Managed Warehouses**](/cloud/reference/warehouses) 创建一个专门用于 ClickStack 的**子服务**。这样可以：

    * 将摄取与查询负载与现有应用隔离
    * 独立扩缩容可观测性工作负载
    * 防止可观测性查询影响生产分析
    * 在需要时在服务之间共享相同的底层数据集

    这种方式可以确保你的现有工作负载不受影响，同时允许 ClickStack 随着可观测性数据的增长而独立扩展。

    对于更大规模的部署或自定义规格指导，请联系技术支持以获取更精确的估算。
  </TabItem>

  <TabItem value="oss-clickstack" label="ClickStack 开源版">
    ## 网络和端口安全 \{#network-security\}

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

    ## Session Secret 配置 \{#session-secret\}

    在生产环境中,必须为 ClickStack UI (HyperDX) 的 `EXPRESS_SESSION_SECRET` 环境变量设置强随机值,以保护会话数据并防止篡改。

    以下是将其添加到应用服务的 `docker-compose.yml` 文件中的方法:

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

    ## 安全摄取 \{#secure-ingestion\}

    所有摄取操作都应通过 ClickStack 发行版的 OpenTelemetry (OTel) collector 所暴露的 OTLP 端口进行。默认情况下,这需要在启动时生成的安全摄取 API key。向 OTel 端口发送数据时必须使用此密钥,该密钥可在 HyperDX UI 的 `Team Settings → API Keys` 下找到。

    <Image img={ingestion_key} alt="数据摄取密钥" size="lg" />

    此外,建议为 OTLP 端点启用 TLS,并创建一个[用于 ClickHouse 摄取的专用用户](#database-ingestion-user)。

    ## ClickHouse \{#clickhouse\}

    自行管理 ClickHouse 实例的用户应遵循以下最佳实践。

    ### 安全最佳实践 \{#self-managed-security\}

    如果您正在管理自己的 ClickHouse 实例,务必启用 **TLS**、强制身份验证,并遵循访问加固的最佳实践。请参阅[此博客文章](https://www.wiz.io/blog/clickhouse-and-wiz)了解实际环境中的错误配置案例及其规避方法。

    ClickHouse OSS 开箱即用提供了强大的安全功能。但是,这些功能需要配置:

    * 通过在 `config.xml` 中使用 `tcp_port_secure` 和 `<openSSL>` **使用 TLS**。参见 [guides/sre/configuring-tls](/guides/sre/tls/configuring-tls)。
    * **为 `default` 用户设置一个强密码，或者将其禁用。**
    * **除非这是你的明确意图，否则请避免对外暴露 ClickHouse。** 默认情况下，除非修改 `listen_host`，ClickHouse 只绑定到 `localhost`。
    * **使用身份验证方式**，例如密码、证书、SSH 密钥或[外部认证器](/operations/external-authenticators)。
    * **限制访问**可通过 IP 过滤和 `HOST` 子句实现。参见 [sql-reference/statements/create/user#user-host](/sql-reference/statements/create/user#user-host)。
    * **启用基于角色的访问控制（RBAC）**，以授予更精细的权限控制。请参阅 [operations/access-rights](/operations/access-rights)。
    * **通过 [quotas](/operations/quotas)、[settings profiles](/operations/settings/settings-profiles) 和只读模式来强制实施配额和限制。**
    * **对静态数据进行加密**，并使用安全的外部存储。参阅 [operations/storing-data](/operations/storing-data) 和 [cloud/security/CMEK](/cloud/security/cmek)。
    * **避免硬编码凭证。** 请在 ClickHouse Cloud 中使用 [命名集合](/operations/named-collections) 或 IAM 角色。
    * 使用[系统日志](/operations/system-tables/query_log)和[会话日志](/operations/system-tables/session_log)审计访问和查询。

    另请参阅[外部身份验证器](/operations/external-authenticators)和[查询复杂度设置](/operations/settings/query-complexity),用于管理用户并确保查询/资源限制。

    ### 用户权限 \{#user-permissions\}

    #### HyperDX 用户 \{#hyperdx-user\}

    HyperDX 使用的 ClickHouse 用户只需设置为 `readonly` 用户,并授予修改以下设置的权限:

    * `max_rows_to_read`（至少设置为 100 万）
    * `read_overflow_mode`
    * `cancel_http_readonly_queries_on_client_close`
    * `wait_end_of_query`

    默认情况下,OSS 和 ClickHouse Cloud 中的 `default` 用户都拥有这些权限,但建议创建一个具有这些权限的新用户。

    #### 数据库和摄取用户 \{#database-ingestion-user-managed\}

    建议为 OTel collector 创建专用用户以便将数据摄取到 ClickHouse,并确保摄取的数据发送到特定数据库,例如 `otel`。有关更多详细信息,请参阅[&quot;创建摄取用户&quot;](/use-cases/observability/clickstack/ingesting-data/otel-collector#creating-an-ingestion-user)。

    ### 配置生存时间 (TTL) \{#configure-ttl\}

    确保已为您的 ClickStack 部署[适当配置](/use-cases/observability/clickstack/ttl#modifying-ttl)[生存时间 (TTL)](/use-cases/observability/clickstack/ttl)。这控制着数据的保留时长——默认的 3 天通常需要修改。

    ## MongoDB 使用指南 \{#mongodb-guidelines\}

    请遵循官方 [MongoDB 安全检查清单](https://www.mongodb.com/docs/manual/administration/security-checklist/)。
  </TabItem>
</Tabs>