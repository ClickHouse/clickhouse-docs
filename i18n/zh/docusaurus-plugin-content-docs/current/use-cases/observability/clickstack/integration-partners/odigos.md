---
slug: /use-cases/observability/clickstack/integration-partners/odigos
title: '使用 Odigos 将 OpenTelemetry 发送到 ClickStack'
sidebar_label: 'Odigos'
pagination_prev: null
pagination_next: null
description: '使用 Odigos 自动为 Kubernetes 工作负载插桩，并通过 OTLP 将遥测数据导出到 ClickStack'
doc_type: 'guide'
keywords: ['Odigos', 'ClickStack', 'ClickHouse', 'OpenTelemetry', 'eBPF', '自动插桩']
---

import PartnerBadge from '@theme/badges/PartnerBadge';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<PartnerBadge />

:::note[TL;DR]
本指南将向你展示如何将 Odigos 遥测数据导出到 ClickStack。你将了解如何：

* 使用 Helm 在 Kubernetes 上部署 Odigos
* 在 Odigos UI 中添加数据源
* 添加一个指向 ClickStack 的 OTLP HTTP 目标端
* 在 ClickStack 中验证日志、指标和链路追踪

Odigos 无需修改代码或重启，即可自动为应用添加插桩；ClickStack 则在 ClickHouse 中存储并查询这些数据。

所需时间：10–20 分钟
:::

{/* vale off */ }

## 什么是 Odigos？ \{#what-is-odigos\}

{/* vale on */ }

[Odigos](https://odigos.io/) 是一个面向 Kubernetes 和虚拟机的插桩控制平面，使用 **eBPF** 在内核层为应用实现插桩。由于采集在内核中运行，应用开销保持在较低水平，同时仍能提供很高的可观测性。你无需在应用代码中部署新的 agent，也不必等待所有服务完成库升级，就能获得生产级的 OpenTelemetry 链路追踪、指标、日志和性能剖析数据。

正是这一 eBPF 层，让大规模场景下实现深入且一致的遥测成为可能。Odigos 还能在需要时自动开启或关闭更深层的插桩，帮助调试或排查问题：

* **代码级上下文** — 与函数和运行时行为相关联的属性
* **HTTP 流量** — 服务之间的请求与响应
* **消息系统** — 来自 Kafka 及类似消息中间件的载荷和消息
* **详细错误信息** — 发生故障时的堆栈跟踪
* **自定义插桩** — 在自动插桩覆盖不到的地方扩展覆盖范围，无需修改代码或重启

在底层，Odigos 会为你的集群创建并管理一条完整的 OpenTelemetry 管道：可随负载扩缩容的 collector、将数据路由到你所选后端的能力，以及可在 UI 中控制的管道逻辑。你可以定义 **采样** 来控制数据量，使用 **PII 屏蔽** 防止敏感数据被导出，并通过 **OTTL 规则** 在遥测数据离开集群前对其进行过滤、转换或增强。

{/* vale off */ }

## 为什么选择 Odigos + ClickStack？ \{#why-odigos-clickstack\}

{/* vale on */ }

在众多服务中推广 OpenTelemetry 往往既耗时，对应用内部的可观测性提升也比较有限。Odigos 负责在 Kubernetes 上进行 eBPF 插桩，以获取更深层的遥测数据，并管理 collector 的运行；ClickStack 则提供基于 ClickHouse 的存储，以及用于大规模查询遥测数据的 HyperDX UI。

:::tip[关键要点]

* **Odigos** 可为任意 Kubernetes 工作负载自动插桩，无需重启，并自动管理 OpenTelemetry 管道。
* **ClickStack** 将日志、指标和链路追踪存储在 ClickHouse 中，并在 HyperDX 中提供可视化展示。
  :::

## 前置条件 \{#prerequisites\}

* 已安装 **ClickStack**，并且可从你的 Kubernetes 集群访问。请参阅[开源 ClickStack 入门](/use-cases/observability/clickstack/getting-started/oss)或[托管 ClickStack 入门](/use-cases/observability/clickstack/getting-started/managed)。
* 你的 ClickStack **OTLP HTTP 端点** (端口 `4318`) ，以及 Odigos 会在 `Authorization` 请求头中传递的身份验证值。对于开源 ClickStack，这个值是 HyperDX UI 中 **Team Settings → API Keys** 下的 **API 摄取密钥**。对于托管 ClickStack，这个值是你在启动自有独立 ClickStack collector 时设置的 **`OTLP_AUTH_TOKEN`**。
* 一个 **Kubernetes 集群** (Linux 节点，内核 4.18 或更高版本，以支持 eBPF instrumentation)
* 用于安装到 `odigos-system` 命名空间的 **Helm**、**kubectl** 和集群凭证
* 一个 **Odigos Enterprise 本地部署令牌** —— 联系 [Odigos team](https://odigos.io/) 获取访问权限

{/* vale off */ }

## 集成 ClickStack 与 Odigos \{#integrate-odigos-clickstack\}

{/* vale on */ }

<VerticalStepper headerLevel="h4">
  #### 使用 Helm 部署 Odigos \{#deploy-odigos\}

  Odigos Enterprise 需要本地部署的许可证令牌。请在 shell 中执行以下导出命令：

  ```bash
  export ODIGOS_ONPREM_TOKEN="<your-enterprise-token>"
  ```

  或者，您也可以在安装前将 token 存储在名为 `odigos-pro` 的 Kubernetes Secret 中。请参阅 [Odigos Enterprise 安装](https://docs.odigos.io/enterprise/setup/installation)。

  添加 Odigos Helm 仓库并将 chart 安装到 `odigos-system` 中：

  ```bash
  helm repo add odigos https://odigos-io.github.io/odigos/
  helm repo update

  helm upgrade --install odigos odigos/odigos \
    --namespace odigos-system \
    --create-namespace \
    --set onPremToken=$ODIGOS_ONPREM_TOKEN
  ```

  您可以通过 `--set` 标志或自定义 values 文件 (`-f`) 传入额外的配置覆盖参数。该 chart 的默认值位于 GitHub 上的 [helm/odigos/values.yaml](https://github.com/odigos-io/odigos/blob/main/helm/odigos/values.yaml)。

  验证 Odigos pod (容器组) 是否正在运行：

  ```bash
  kubectl get pods -n odigos-system
  ```

  #### 在 Odigos UI 中添加数据源 \{#add-sources\}

  1. 为 Odigos UI 服务设置端口转发：

  ```bash
  kubectl port-forward svc/ui -n odigos-system 3000:3000
  ```

  2. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)。
  3. 前往 **Sources**，选择要插桩的命名空间或工作负载。
  4. 将所有工作负载都标记为进行插桩后，点击底部的“完成”。
  5. 在 Sources 列中确认各工作负载已成功完成插桩。

  #### 在 Odigos UI 中将 ClickStack 添加为目标端 \{#add-destination-ui\}

  要将遥测数据发送至 ClickStack，请在 Odigos 中添加一个 **OTLP HTTP** 目标端。具体配置取决于 ClickStack 的部署方式。使用开源 ClickStack 时，OpenTelemetry collector 已内置其中，摄取密钥将在 HyperDX UI 中自动生成。使用托管 ClickStack 时，您需要自行运行独立的 ClickStack collector，并在启动容器时自行指定身份验证令牌。

  :::tip[替代方案：直接写入 ClickHouse]
  如果您的 Kubernetes 集群可以访问 ClickHouse，可以完全跳过 OTLP collector，改用 Odigos 的[原生 **ClickHouse** 目标端](#native-clickhouse-destination)。此方式同时适用于开源版和托管 ClickStack。
  :::

  <Tabs groupId="clickstack-deployment">
    <TabItem value="oss-clickstack" label="开源 ClickStack" default>
      对于开源 ClickStack (例如 all-in-one 镜像) ，其中已包含网关 OpenTelemetry collector，且 HyperDX 会自动生成摄取 API key。

      1. 在 Odigos UI 中，点击 **Add Destination**，然后选择 **OTLP HTTP**。
      2. 将 **OTLP HTTP Endpoint** 设置为你的 ClickStack collector (例如 `http://clickstack.example.com:4318`) 。有关端点的详细信息，请参阅[使用 OpenTelemetry 进行摄取](/use-cases/observability/clickstack/ingesting-data/opentelemetry#sending-data-to-collector-oss)。
      3. 在 ClickStack UI 的 **Team Settings → API Keys** 中复制你的 API 摄取 key。
      4. 在 **Headers** 中，添加：
         * **Key**: `Authorization`
         * **Value**: 你的 API 摄取 key
      5. 启用 **Logs**、**Metrics** 和 **Traces**。
      6. 保存目标端。
    </TabItem>

    <TabItem value="managed-clickstack" label="托管 ClickStack">
      托管 ClickStack 不提供托管的 OpenTelemetry collector，也不会在 UI 中显示摄取 API key。相反，你需要自行运行[以独立模式运行的 ClickStack collector 发行版](/use-cases/observability/clickstack/ingesting-data/otel-collector#configuring-the-collector)，并在启动容器时通过 `OTLP_AUTH_TOKEN` 环境变量设置身份验证 token。随后，Odigos 会将 OTLP HTTP 流量发送到该 collector，并在 `Authorization` 请求头中携带相同的 token。

      1. 以独立模式启动 ClickStack collector，使其指向你的 ClickHouse Cloud 服务，并使用你自定义的 `OTLP_AUTH_TOKEN` 对其进行保护：

         ```shell
         export CLICKHOUSE_ENDPOINT=<HTTPS_ENDPOINT>
         export CLICKHOUSE_USER=<CLICKHOUSE_USER>
         export CLICKHOUSE_PASSWORD=<CLICKHOUSE_PASSWORD>
         export OTLP_AUTH_TOKEN="a_very_secure_string"

         docker run \
           -e OTLP_AUTH_TOKEN=${OTLP_AUTH_TOKEN} \
           -e CLICKHOUSE_ENDPOINT=${CLICKHOUSE_ENDPOINT} \
           -e CLICKHOUSE_USER=${CLICKHOUSE_USER} \
           -e CLICKHOUSE_PASSWORD=${CLICKHOUSE_PASSWORD} \
           -p 4317:4317 \
           -p 4318:4318 \
           clickhouse/clickstack-otel-collector:latest
         ```

         有关 TLS、专用摄取用户以及其他生产环境建议，请参阅[保护 collector](/use-cases/observability/clickstack/ingesting-data/otel-collector#securing-the-collector)。
      2. 在 Odigos UI 中，点击 **Add Destination**，然后选择 **OTLP HTTP**。
      3. 将 **OTLP HTTP Endpoint** 设置为你刚刚启动的独立 collector (例如 `http://my-collector.example.com:4318`) 。
      4. 在 **Headers** 中，添加：
         * **Key**: `Authorization`
         * **Value**: 你在 collector 上设置的 `OTLP_AUTH_TOKEN` 值
      5. 启用 **Logs**、**Metrics** 和 **Traces**。
      6. 保存目标端。

      :::note[可选：Kubernetes manifest]
      除了使用 UI，你也可以通过 `Destination` manifest 配置相同的目标端。请参阅高级配置中的[使用 Kubernetes manifest 配置目标端](#destination-manifest)。
      :::
    </TabItem>
  </Tabs>

  #### 在 ClickStack 中验证遥测数据 \{#verify-telemetry\}

  1. 打开 ClickStack 的 UI (HyperDX) ：
     * **开源 ClickStack**：例如，在一体化镜像中可使用 `http://<host>:8080`。
     * **托管 ClickStack**：在 [ClickHouse Cloud 控制台](https://console.clickhouse.cloud) 中打开您的服务，然后点击 **Launch ClickStack**。详情请参见[前往 ClickStack UI](/use-cases/observability/clickstack/getting-started/managed#navigate-to-clickstack-ui-cloud)。
  2. 查看已插桩服务产生的 **日志**、**指标** 和 **链路追踪** 数据。
  3. 按 `odigos.version` 过滤链路追踪，以验证端到端导出是否正常。

  如果数据缺失，请检查 collector 日志：`kubectl logs deploy/odigos-gateway -n odigos-system`
</VerticalStepper>

## 高级配置 \{#advanced-configuration\}

### HyperDX 日志规范化器 \{#hyperdx-log-normalizer\}

如果你使用 Odigos 的原生 **ClickHouse** 目标端将数据直接导出到 ClickHouse (而不是通过 OTLP HTTP 导出到 ClickStack) ，请启用 **HyperDX 日志规范化器** (`HYPERDX_LOG_NORMALIZER: true`) 。它会解析 JSON 格式的日志内容，并对属性进行规范化，便于在 ClickStack UI 中更高效地查询。

### 原生 ClickHouse 目标端 \{#native-clickhouse-destination\}

当你的集群可以直接访问 ClickHouse 时，可以使用 Odigos 的原生 **ClickHouse** 目标端，而不是 OTLP HTTP。你可以在 UI 中或通过清单文件配置 ClickHouse 端点、数据库名和 schema 选项——请参阅 [Odigos ClickHouse destination](https://docs.odigos.io/backends/clickhouse)。

* **生产 schema**：将 `CLICKHOUSE_CREATE_SCHEME` 设置为 `false`，并应用你自己的 DDL。
* **TLS / 身份验证**：使用 `CLICKHOUSE_TLS_ENABLED`、`CLICKHOUSE_USERNAME`，并通过 Kubernetes Secret 提供密码。

### 通过 Kubernetes 清单配置目标端 \{#destination-manifest\}

**OTLP HTTP (ClickStack)&#x20;**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickstack
  namespace: odigos-system
spec:
  type: otlphttp
  destinationName: otlphttp
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    OTLP_HTTP_ENDPOINT: 'http://clickstack.example.com:4318'
    # API ingestion key for open source ClickStack, or OTLP_AUTH_TOKEN for Managed ClickStack
    OTLP_HTTP_HEADERS: 'Authorization:<YOUR_AUTHORIZATION_VALUE>'
```

**ClickHouse (直连)&#x20;**

```yaml
apiVersion: odigos.io/v1alpha1
kind: Destination
metadata:
  name: clickhouse
  namespace: odigos-system
spec:
  type: clickhouse
  destinationName: clickhouse
  signals:
    - TRACES
    - METRICS
    - LOGS
  data:
    CLICKHOUSE_ENDPOINT: 'http://clickstack.example.com:8123'
    CLICKHOUSE_DATABASE_NAME: 'otel'
    CLICKHOUSE_CREATE_SCHEME: 'true'
```

应用此清单：

```bash
kubectl apply -f destination.yaml
```

{/* vale off */ }

### Odigos VM Agent \{#odigos-vm-agent\}

{/* vale on */ }

[Odigos VM Agent](https://docs.odigos.io/vmagent/overview) 使用 eBPF 对 Linux 进程、systemd 服务和/或 Docker 容器进行插桩。遥测数据可导出到与集群版 Odigos 相同的目标端，包括通过 OTLP HTTP 连接到 ClickStack。

VM Agent 是 Odigos Pro 的一部分。有关设置、数据源和目标端配置，请参阅 [VM Agent 概览](https://docs.odigos.io/vmagent/overview)。

{/* vale off */ }

### Odigos Central \{#odigos-central\}

{/* vale on */ }

[Odigos Central](https://docs.odigos.io/central/overview) 是一个集中式控制平面，可通过单一 UI 统一管理多个 Kubernetes 集群中的插桩、目标端和管道配置，无需分别配置每个集群。

Odigos Central 在 Odigos Enterprise 中提供。有关多集群管理、SSO 和统一采样规则，请参阅 [Central 概览](https://docs.odigos.io/central/overview)。

## 后续步骤 \{#next-steps\}

* **在 ClickStack 中探索已插桩服务之间的链路追踪**
* **为 Odigos 导出的指标构建仪表盘**
* **调优 ClickHouse schema 和生存时间 (TTL)**，以适配您的保留需求和查询模式

## 延伸阅读 \{#read-more\}

* [Odigos Enterprise 安装](https://docs.odigos.io/enterprise/setup/installation)
* [Odigos ClickHouse 目标端](https://docs.odigos.io/backends/clickhouse)
* [Odigos VM Agent 概览](https://docs.odigos.io/vmagent/overview)
* [Odigos Central 概览](https://docs.odigos.io/central/overview)
* [告别生产环境中的盲目猜测：借助 ClickHouse 和 Odigos 实现大规模全保真追踪](https://clickhouse.com/blog/odigos-full-fidelity-tracing)
* [开源 ClickStack 入门](/use-cases/observability/clickstack/getting-started/oss)