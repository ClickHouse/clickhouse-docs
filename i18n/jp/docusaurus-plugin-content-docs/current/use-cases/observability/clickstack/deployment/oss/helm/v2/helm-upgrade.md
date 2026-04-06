---
slug: /use-cases/observability/clickstack/deployment/helm-upgrade
title: 'Helm アップグレードガイド'
pagination_prev: null
pagination_next: null
sidebar_position: 6
description: 'v1.x のインラインテンプレート型 ClickStack Helm チャートから v2.x のサブチャートアーキテクチャへの移行'
doc_type: 'guide'
keywords: ['ClickStack アップグレード', 'Helm 移行', 'v1.x から v2.x', 'サブチャートアーキテクチャ', 'ClickStack 移行']
---

このガイドでは、インラインテンプレート型の ClickStack Helm チャート (v1.x) から、サブチャートベースのアーキテクチャ (v2.x) へ移行する方法を説明します。これは **破壊的変更** であり、手作業で作成した Kubernetes リソースを、MongoDB と ClickHouse の オペレーター 管理カスタムリソースに置き換え、公式の OpenTelemetry Collector Helm チャートを使用する構成に変更されます。

:::warning 破壊的変更
v2.x チャートは v1.x と**後方互換性がありません**。インプレースでの `helm upgrade` はサポートされていません。インプレースアップグレードを試みるのではなく、既存のデプロイメントと並行して新規インストールを実施し、データを移行することを推奨します。
:::

## 前提条件 \{#prerequisites\}

* アップグレード前にデータをバックアップしてください (MongoDB、ClickHouse の PVC)
* 現在の `values.yaml` のオーバーライドを確認してください — 多くのキーが移動または名前変更されています

## 2 段階インストール \{#two-phase-installation\}

v2.x チャートは 2 段階でインストールします。オペレーター (CRD を登録) は、メインのチャート (CR を作成) より先にインストールする必要があります。

```bash
# Phase 1: Install operators and CRDs
helm install clickstack-operators clickstack/clickstack-operators

# Phase 2: Install ClickStack
helm install my-clickstack clickstack/clickstack
```

逆順でアンインストールします:

```bash
helm uninstall my-clickstack
helm uninstall clickstack-operators
```

### データ永続化 \{#data-persistence\}

MongoDB および ClickHouse のオペレーターが作成した PersistentVolumeClaims は、`helm uninstall` を実行しても**削除されません**。これは、意図しないデータ損失を防ぐための仕様です。アンインストール後に PVC をクリーンアップするには、以下を参照してください。

* [MongoDB Kubernetes Operator のドキュメント](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)
* [ClickHouse Operator のクリーンアップ ドキュメント](https://clickhouse.com/docs/clickhouse-operator/managing-clusters/cleanup)

### ストレージクラス \{#storage-class\}

`global.storageClassName` と `global.keepPVC` は削除されました。ストレージクラスは現在、各オペレーターの CR スペックで直接設定します。

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

## 変更点 \{#what-changed\}

| Component      | Before (v1.x)                                         | After (v2.x)                                                                                                                           |
| -------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| MongoDB        | インラインのデプロイメント + Service + PVC                         | `MongoDBCommunity` CR を管理する [MongoDB Kubernetes Operator (MCK)](https://github.com/mongodb/mongodb-kubernetes)                         |
| ClickHouse     | インラインのデプロイメント + Service + ConfigMaps + PVCs           | `ClickHouseCluster` + `KeeperCluster` CR を管理する [ClickHouse Operator](https://clickhouse.com/docs/clickhouse-operator/overview)         |
| OTel collector | インラインのデプロイメント + Service (`otel.*` ブロック)               | [Official OpenTelemetry Collector Helm chart](https://github.com/open-telemetry/opentelemetry-helm-charts) (`otel-collector:` サブチャート)  |
| HyperDX 値 | `hyperdx.*` 配下のフラットなキーに加え、トップレベルの `tasks:` と `appUrl` | `hyperdx.*` 配下で K8s リソース種別ごとに再編成 (以下を参照)                                                                                               |
| hdx-oss-v2     | 非推奨のレガシーチャート                                          | 完全に削除                                                                                                                                  |

## HyperDX 値 の再構成 \{#hyperdx-values-reorganization\}

`hyperdx:` ブロックは、Kubernetes リソースタイプ別に整理されました:

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

### 主な変更点 \{#key-moves\}

| 変更前 (v1.x)                                 | 変更後 (v2.x)                                                      |
| ------------------------------------------ | --------------------------------------------------------------- |
| `appUrl`                                   | 削除。`hyperdx.frontendUrl` を使用します (基本値は `http://localhost:3000`)  |
| `tasks.*` (トップレベル)                         | `hyperdx.tasks.*`                                               |
| `mongodb.password`                         | `hyperdx.secrets.MONGODB_PASSWORD`                              |
| `clickhouse.config.users.appUserPassword`  | `hyperdx.secrets.CLICKHOUSE_APP_PASSWORD`                       |
| `clickhouse.config.users.otelUserPassword` | `hyperdx.secrets.CLICKHOUSE_PASSWORD`                           |
| `otel.*` 環境変数のオーバーライド                      | `hyperdx.config.*`  (機密でない値) および `hyperdx.secrets.*`  (機密値)     |

### 統合された ConfigMap と Secret \{#unified-configmap-and-secret\}

すべての環境変数は現在、`envFrom` を介して、HyperDX デプロイメント**と**OTel collector で共有される 2 つの固定名リソースを通じて渡されます。

* **`clickstack-config`** ConfigMap — `hyperdx.config` から生成
* **`clickstack-secret`** Secret — `hyperdx.secrets` から生成

OTel 専用の ConfigMap は別途存在しなくなりました。両方のワークロードが同じソースを参照します。

## MongoDB の移行 \{#mongodb-migration\}

### 削除された値 \{#mongodb-removed-values\}

以下の `mongodb.*` の値は廃止されました:

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

### 新しい値 \{#mongodb-new-values\}

MongoDB は現在、`MongoDBCommunity` カスタムリソースを通じて MCK オペレーターによって管理されます。CR の spec は `mongodb.spec` からそのまま生成されます。

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

MongoDB のパスワードは `hyperdx.secrets.MONGODB_PASSWORD` (`mongodb.password` ではなく) に設定します。この値は、password Secret と `mongoUri` テンプレートから自動的に参照されます。

永続化を追加するには、`mongodb.spec` 内に `statefulSet` ブロックを追加します。

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

MCK オペレーターのサブチャートは、`mongodb-kubernetes:` ではなく `mongodb-operator:` の下で設定します。使用可能なすべての CRD フィールドについては、[MCK ドキュメント](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity)を参照してください。

## ClickHouse の移行 \{#clickhouse-migration\}

### 廃止された値 \{#clickhouse-removed-values\}

以下の `clickhouse.*` の値は廃止され、現在は存在しません。

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

### 新しい 値 \{#clickhouse-new-values\}

ClickHouse は現在、`ClickHouseCluster` および `KeeperCluster` のカスタムリソースを通じて ClickHouse Operator によって管理されます。両方の CR の仕様は、値 からそのままレンダリングされます。

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

ClickHouse のユーザー認証情報は、現在 `clickhouse.config.users` ではなく `hyperdx.secrets` から取得されます。クラスタ仕様では、テンプレート式を使ってこれらを参照します。

ClickHouse Operator のサブチャートは `clickhouse-operator:` 配下で設定します。Webhook と cert-manager はデフォルトで無効です。使用可能なすべての CRD フィールドについては、[operator configuration guide](https://clickhouse.com/docs/clickhouse-operator/guides/configuration) を参照してください。

## OTel collectorの移行 \{#otel-collector-migration\}

### 削除された値 \{#otel-removed-values\}

`otel:` ブロック全体は廃止されました。

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

### 新しい設定値 \{#otel-new-values\}

OTel collector は現在、公式の OpenTelemetry Collector Helm チャートの `otel-collector:` サブチャートとしてデプロイされます。親チャートの `otel:` ラッパーはありません。サブチャートを直接設定してください。

環境変数 (ClickHouse エンドポイント、OpAMP URL など) は、共通の `clickstack-config` ConfigMap と `clickstack-secret` Secret を通じて共有されます。サブチャートの `extraEnvsFrom` はあらかじめ設定されています。

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

リソースを設定するには (旧 `otel.resources`) :

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

レプリカを設定するには (以前の `otel.replicas`) :

```yaml
otel-collector:
  replicaCount: 3
```

`nodeSelector`/`tolerations` (以前は `otel.nodeSelector`/`otel.tolerations`) を設定するには：

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

利用可能なすべてのサブチャートの値については、[OpenTelemetry collector Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)を参照してください.

## 変更されない値 \{#unchanged-values\}

次のセクションは、この移行の影響を受けません。

* `global.*` (imageRegistry, imagePullSecrets)

## 新規インストールとインプレースアップグレード \{#fresh-install-vs-in-place-upgrade\}

**新規インストール**では、特別な手順は必要ありません。デフォルト値のままでそのまま使用できます。

既存のリリースを**インプレースアップグレード**する場合は、次の点に注意してください。

1. オペレーター (MCK、ClickHouse Operator) は、お使いのネームスペースに新しいデプロイメントとしてインストールされます
2. 既存の MongoDB デプロイメントと ClickHouse デプロイメントは Helm によって削除されます (これらはチャートのテンプレートに含まれなくなっているためです)
3. オペレーターは、MongoDB と ClickHouse を管理するための新しい StatefulSets を作成します
4. **古いチャートの PVC は、オペレーターが管理する StatefulSets では自動的に再利用されません**

インプレースアップグレードではなく、既存のデプロイ環境と並行して新規インストールを実施し、データを移行することを推奨します。

## 次のステップ \{#next-steps\}

* [Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm) - v2.x を使用した基本的なインストール
* [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレス
* [追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - カスタム Kubernetes オブジェクト
* [ClickStack Helm チャート リポジトリ](https://github.com/ClickHouse/ClickStack-helm-charts) - チャートのソースコードと 値 リファレンス