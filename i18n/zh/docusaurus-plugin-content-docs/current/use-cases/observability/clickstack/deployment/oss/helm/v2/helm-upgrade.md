---
slug: /use-cases/observability/clickstack/deployment/helm-upgrade
title: 'Helm 升级指南'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: '从 v1.x inline-template ClickStack Helm 图表迁移到 v2.x 子图表架构'
doc_type: 'guide'
keywords: ['ClickStack 升级', 'Helm 迁移', 'v1.x 到 v2.x', '子图表架构', 'ClickStack 迁移']
---

这个指南介绍如何从 inline-template ClickStack Helm 图表 (v1.x) 迁移到基于子图表的架构 (v2.x) 。这是一项**破坏性变更**：它会将手动编写的 Kubernetes 资源替换为由 operator 管理的 MongoDB 和 ClickHouse 自定义资源，并使用官方的 OpenTelemetry Collector Helm 图表。

:::warning 破坏性变更
v2.x 图表与 v1.x **不**向后兼容，不支持就地执行 `helm upgrade`。我们建议在现有部署旁进行一次全新安装并迁移数据，而不是尝试就地升级。
:::

## 前提条件 \{#prerequisites\}

* 升级前请备份数据 (MongoDB、ClickHouse PVC)
* 检查当前 `values.yaml` 中的重写配置——大多数键已迁移或重命名

## 分两阶段安装 \{#two-phase-installation\}

v2.x 图表 采用分两阶段安装的方式。必须先安装 Operators (用于注册 CRD) ，再安装主图表 (用于创建 CR) ：

```bash
# Phase 1: Install operators and CRDs
helm install clickstack-operators clickstack/clickstack-operators

# Phase 2: Install ClickStack
helm install my-clickstack clickstack/clickstack
```

按相反的顺序卸载：

```bash
helm uninstall my-clickstack
helm uninstall clickstack-operators
```

### 数据持久化 \{#data-persistence\}

由 MongoDB 和 ClickHouse Operator 创建的 PersistentVolumeClaims **不会** 在执行 `helm uninstall` 时被删除。这是有意这样设计的，以防止意外数据丢失。要在卸载后清理 PVC，请参阅：

* [MongoDB Kubernetes Operator 文档](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [ClickHouse Operator 清理文档](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

### 存储类 \{#storage-class\}

`global.storageClassName` 和 `global.keepPVC` 已移除。现在，存储类直接在各 operator 的 CR spec 中配置：

```yaml
mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - spec:
              storageClassName: "fast-ssd"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
```

## 变更内容 \{#what-changed\}

| Component      | Before (v1.x)                               | After (v2.x)                                                                                                                   |
| -------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| MongoDB        | 内联部署 + Service + PVC                        | 由 [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes) 管理的 `MongoDBCommunity` CR                 |
| ClickHouse     | 内联部署 + Service + ConfigMaps + PVCs          | 由 [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview) 管理的 `ClickHouseCluster` + `KeeperCluster` CR |
| OTel collector | 内联部署 + Service (`otel.*` 块)                 | [官方 OpenTelemetry Collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts) (`otel-collector:` 子图表)      |
| HyperDX values | `hyperdx.*` 下的扁平键，以及顶层的 `tasks:` 和 `appUrl` | 在 `hyperdx.*` 下按 K8s 资源类型重新组织 (见下文)                                                                                            |
| hdx-oss-v2     | 已弃用的旧版图表                                    | 已完全移除                                                                                                                          |

## HyperDX values 重新组织 \{#hyperdx-values-reorganization\}

`hyperdx:` 块现已按 Kubernetes 资源类型重新组织：

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"   # Replaces the removed appUrl

  config:         # → clickstack-config ConfigMap (non-sensitive env vars)
    APP_PORT: "3000"
    HYPERDX_LOG_LEVEL: "info"

  secrets:        # → clickstack-secret Secret (sensitive env vars)
    HYPERDX_API_KEY: "..."
    CLICKHOUSE_PASSWORD: "otelcollectorpass"
    CLICKHOUSE_APP_PASSWORD: "hyperdx"
    MONGODB_PASSWORD: "hyperdx"

  deployment:     # K8s Deployment spec (image, replicas, probes, etc.)
  service:        # K8s Service spec (type, annotations)
  ingress:        # K8s Ingress spec (host, tls, annotations)
  podDisruptionBudget:  # K8s PDB spec
  tasks:          # K8s CronJob specs (previously top-level tasks:)
```

### 关键调整 \{#key-moves\}

| 变更前 (v1.x)                                 | 变更后 (v2.x)                                                    |
| ------------------------------------------ | ------------------------------------------------------------- |
| `appUrl`                                   | 已移除。请改用 `hyperdx.frontendUrl` (默认值为 `http://localhost:3000`)  |
| `tasks.*` (top-level)                      | `hyperdx.tasks.*`                                             |
| `mongodb.password`                         | `hyperdx.secrets.MONGODB_PASSWORD`                            |
| `clickhouse.config.users.appUserPassword`  | `hyperdx.secrets.CLICKHOUSE_APP_PASSWORD`                     |
| `clickhouse.config.users.otelUserPassword` | `hyperdx.secrets.CLICKHOUSE_PASSWORD`                         |
| `otel.*` env 重写                     | `hyperdx.config.*` (非敏感) 和 `hyperdx.secrets.*` (敏感信息)         |

### 统一的 ConfigMap 和 Secret \{#unified-configmap-and-secret\}

现在，所有环境变量都统一通过两个名称固定的资源进行传递，HyperDX 部署 **以及** OTel collector 都通过 `envFrom` 共享这两个资源：

* **`clickstack-config`** ConfigMap —— 由 `hyperdx.config` 生成
* **`clickstack-secret`** Secret —— 由 `hyperdx.secrets` 生成

不再单独提供 OTel 专用的 ConfigMap。两个工作负载都从相同的来源读取配置。

## MongoDB 迁移 \{#mongodb-migration\}

### 已移除的值 \{#mongodb-removed-values\}

以下 `mongodb.*` 配置项已被移除：

```yaml
# REMOVED — do not use
mongodb:
  image: "..."
  port: 27017
  strategy: ...
  nodeSelector: {}
  tolerations: []
  livenessProbe: ...
  readinessProbe: ...
  persistence:
    enabled: true
    dataSize: 10Gi
```

### 新的 values \{#mongodb-new-values\}

MongoDB 现在由 MCK Operator 通过 `MongoDBCommunity` 自定义资源进行管理。CR 规格会根据 `mongodb.spec` 原样生成：

```yaml
mongodb:
  enabled: true
  spec:
    members: 1
    type: ReplicaSet
    version: "5.0.32"
    security:
      authentication:
        modes: ["SCRAM"]
    users:
      - name: hyperdx
        db: hyperdx
        passwordSecretRef:
          name: '{{ include "clickstack.mongodb.fullname" . }}-password'
        roles:
          - name: dbOwner
            db: hyperdx
          - name: clusterMonitor
            db: admin
        scramCredentialsSecretName: '{{ include "clickstack.mongodb.fullname" . }}-scram'
    additionalMongodConfig:
      storage.wiredTiger.engineConfig.journalCompressor: zlib
```

MongoDB 密码在 `hyperdx.secrets.MONGODB_PASSWORD` 中设置 (而不是 `mongodb.password`) 。密码 Secret 和 `mongoUri` 模板会自动引用该值。

如需启用持久化，请在 `mongodb.spec` 中添加一个 `statefulSet` 块：

```yaml
mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              accessModes: ["ReadWriteOnce"]
              storageClassName: "your-storage-class"
              resources:
                requests:
                  storage: 10Gi
```

MCK operator 子图表在 `mongodb-operator:` 下进行配置 (不是 `mongodb-kubernetes:`) 。有关所有可用的 CRD 字段，请参阅 [MCK 文档](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)。

## ClickHouse 迁移 \{#clickhouse-migration\}

### 已移除的配置项 \{#clickhouse-removed-values\}

以下 `clickhouse.*` 配置项已不再使用：

```yaml
# REMOVED — do not use
clickhouse:
  image: "..."
  terminationGracePeriodSeconds: 90
  resources: {}
  livenessProbe: ...
  readinessProbe: ...
  startupProbe: ...
  nodeSelector: {}
  tolerations: []
  service:
    type: ClusterIP
    annotations: {}
  persistence:
    enabled: true
    dataSize: 10Gi
    logSize: 5Gi
  config:
    clusterCidrs: [...]
    users:
      appUserPassword: "..."
      otelUserPassword: "..."
      otelUserName: "..."
```

### 新增 values \{#clickhouse-new-values\}

ClickHouse 现在由 ClickHouse Operator 通过 `ClickHouseCluster` 和 `KeeperCluster` 自定义资源进行管理。这两个 CR 的规范都会直接根据 values 原样渲染：

```yaml
clickhouse:
  enabled: true
  port: 8123
  nativePort: 9000
  prometheus:
    enabled: true
    port: 9363
  keeper:
    spec:
      replicas: 1
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      replicas: 1
      shards: 1
      keeperClusterRef:
        name: '{{ include "clickstack.clickhouse.keeper" . }}'
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
      settings:
        extraUsersConfig:
          users:
            app:
              password: '{{ .Values.hyperdx.secrets.CLICKHOUSE_APP_PASSWORD }}'
            otelcollector:
              password: '{{ .Values.hyperdx.secrets.CLICKHOUSE_PASSWORD }}'
        extraConfig:
          max_connections: 4096
          keep_alive_timeout: 64
          max_concurrent_queries: 100
```

ClickHouse 用户凭据现在从 `hyperdx.secrets` 中获取 (而非 `clickhouse.config.users`) 。集群规范使用模板表达式来引用这些凭据。

ClickHouse Operator 子图表在 `clickhouse-operator:` 下配置。Webhook 和 cert-manager 默认处于禁用状态。有关所有可用 CRD 字段的信息，请参阅[operator configuration guide](https://clickhouse.com/docs/clickhouse-operator/guides/configuration)。

## OTel collector 迁移 \{#otel-collector-migration\}

### 已移除的配置项 \{#otel-removed-values\}

整个 `otel:` 块已被移除：

```yaml
# REMOVED — do not use
otel:
  enabled: true
  image: ...
  replicas: 1
  resources: {}
  clickhouseEndpoint: ...
  clickhouseUser: ...
  clickhousePassword: ...
  clickhouseDatabase: "default"
  opampServerUrl: ...
  port: 13133
  nativePort: 24225
  grpcPort: 4317
  httpPort: 4318
  healthPort: 8888
  env: []
  customConfig: ...
```

### 新增值 \{#otel-new-values\}

OTel collector 现通过官方 OpenTelemetry Collector Helm 图表中的 `otel-collector:` 子图表进行部署。不再有父图表 `otel:` 这一层封装——请直接配置该子图表。

环境变量 (ClickHouse 端点、OpAMP URL 等) 通过统一的 `clickstack-config` ConfigMap 和 `clickstack-secret` Secret 共享。该子图表的 `extraEnvsFrom` 已预先接好线：

```yaml
otel-collector:
  enabled: true
  mode: deployment
  image:
    repository: docker.clickhouse.com/clickhouse/clickstack-otel-collector
    tag: ""
  extraEnvsFrom:
    - configMapRef:
        name: clickstack-config
    - secretRef:
        name: clickstack-secret
  ports:
    otlp:
      enabled: true
      containerPort: 4317
      servicePort: 4317
    otlp-http:
      enabled: true
      containerPort: 4318
      servicePort: 4318
```

如需设置资源 (此前为 `otel.resources`) ：

```yaml
otel-collector:
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
```

要设置副本数 (之前为 `otel.replicas`) ：

```yaml
otel-collector:
  replicaCount: 3
```

如需设置 nodeSelector/tolerations (此前为 `otel.nodeSelector`/`otel.tolerations`) ：

```yaml
otel-collector:
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

有关所有可用的子图表配置值，请参阅 [OpenTelemetry collector Helm 图表](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)。

## 保持不变的值 \{#unchanged-values\}

以下部分**不会受到**此次迁移的影响：

* `global.*` (imageRegistry, imagePullSecrets)

## 全新安装 vs. 就地升级 \{#fresh-install-vs-in-place-upgrade\}

对于**全新安装**，无需执行任何特殊步骤。默认值开箱即用。

对于现有 release 的**就地升级**，请注意：

1. 这些 operator (MCK、ClickHouse Operator) 会作为新的部署安装到你的命名空间中
2. 现有的 MongoDB 部署和 ClickHouse 部署会被 Helm 删除 (它们已不再包含在图表的模板中)
3. 这些 operator 会创建新的 StatefulSets 来管理 MongoDB 和 ClickHouse
4. **旧图表中的 PVC 不会被 operator 管理的 StatefulSets 自动复用**

我们建议在现有部署旁边执行一次全新安装并迁移数据，而不是进行就地升级。

## 后续步骤 \{#next-steps\}

* [Helm 主指南](/docs/use-cases/observability/clickstack/deployment/helm) - 使用 v2.x 进行基本安装
* [配置指南](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API 密钥、Secret 和入口
* [附加清单](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - 自定义 Kubernetes 对象
* [ClickStack Helm 图表代码仓库](https://github.com/ClickHouse/ClickStack-helm-charts) - 图表源码和 values 参考