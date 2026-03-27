---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 設定'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack の Helm デプロイメントにおける API キー、シークレット、イングレスの設定'
doc_type: 'guide'
keywords: ['ClickStack 設定', 'Helm シークレット', 'API キー設定', 'イングレス設定', 'TLS 設定']
---

:::warning チャート バージョン 2.x
このページでは、サブチャートベースの **v2.x** Helm チャートについて説明します。現在も v1.x のインラインテンプレート チャートを使用している場合は、[Helm 設定 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) を参照してください。移行手順については、[アップグレード ガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) を参照してください。
:::

このガイドでは、ClickStack の Helm デプロイメントに関する設定オプションを説明します。基本的なインストールについては、[Helm デプロイメントのメイン ガイド](/docs/use-cases/observability/clickstack/deployment/helm) を参照してください。

## Values の整理 \{#values-organization\}

v2.x チャートでは、`hyperdx:` ブロック配下で、Kubernetes リソースの種類ごとに 値 を整理しています。

```yaml
hyperdx:
  ports:          # Shared port numbers (Deployment, Service, ConfigMap, Ingress)
    api: 8000
    app: 3000
    opamp: 4320

  frontendUrl: "http://localhost:3000"

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
  tasks:          # K8s CronJob specs
```

すべての環境変数は、`envFrom` を介して HyperDX デプロイメント **および** OTel collector で共有される、固定名の 2 つのリソースを通して渡されます。

* **`clickstack-config`** ConfigMap — `hyperdx.config` から生成
* **`clickstack-secret`** Secret — `hyperdx.secrets` から生成

OTel 専用の ConfigMap は、もはや別個には存在しません。両方のワークロードが同じソースを参照します.

## API キーの設定 \{#api-key-setup\}

ClickStack のデプロイが正常に完了したら、テレメトリデータの収集を有効にするため、API キーを設定します。

1. **設定済みのイングレスまたはサービスエンドポイントから**、**HyperDX インスタンスにアクセスします**
2. **HyperDX ダッシュボードにログインし**、Team settings に移動して API キーを生成または取得します
3. **次のいずれかの方法で**、API キーを使用して**デプロイメントを更新します**:

### 方法1: valuesファイルを使用した `helm upgrade` による更新 \{#api-key-values-file\}

APIキーを `values.yaml` に追加します。

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key-here"
```

次に、デプロイメントをアップグレードします。

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2: `--set` フラグを指定して helm upgrade で更新 \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack \
  --set hyperdx.secrets.HYPERDX_API_KEY="your-api-key-here"
```

### 変更を適用するためにポッドを再起動する \{#restart-pods\}

API キーを更新したら、新しい設定を反映するためにポッドを再起動します。

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app
```

:::note
このチャートは、設定値を含む Kubernetes シークレット (`clickstack-secret`) を自動的に作成します。外部シークレットを使用するのでなければ、追加のシークレット設定は必要ありません。
:::

## シークレット管理 \{#secret-management\}

API キーやデータベース認証情報などの機密情報を扱うために、v2.x チャートでは、`hyperdx.secrets` の内容を反映した統合 `clickstack-secret` リソースが提供されます。

### シークレットのデフォルト値 \{#default-secret-values\}

このチャートには、すべてのシークレットのデフォルト値が含まれています。`values.yaml` で上書きしてください。

```yaml
hyperdx:
  secrets:
    HYPERDX_API_KEY: "your-api-key"
    CLICKHOUSE_PASSWORD: "your-clickhouse-otel-password"
    CLICKHOUSE_APP_PASSWORD: "your-clickhouse-app-password"
    MONGODB_PASSWORD: "your-mongodb-password"
```

### 外部シークレットの使用 \{#using-external-secret\}

本番環境で認証情報を Helm 値 とは分けて管理したい場合は、外部の Kubernetes シークレットを使用します。

```bash
# Create your secret
kubectl create secret generic my-clickstack-secrets \
  --from-literal=HYPERDX_API_KEY=my-secret-api-key \
  --from-literal=CLICKHOUSE_PASSWORD=my-ch-password \
  --from-literal=CLICKHOUSE_APP_PASSWORD=my-ch-app-password \
  --from-literal=MONGODB_PASSWORD=my-mongo-password
```

次に、値 でそれを参照します：

```yaml
hyperdx:
  useExistingConfigSecret: true
  existingConfigSecret: "my-clickstack-secrets"
```

## イングレスの設定 \{#ingress-setup\}

ドメイン名経由でHyperDXインターフェースとAPIを公開するには、`values.yaml`でイングレスを有効にします。

### イングレスの一般設定 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定上の注意
`hyperdx.frontendUrl` はイングレスのホスト名と一致させ、プロトコル (例: `https://hyperdx.yourdomain.com`) を含めてください。これにより、生成されるリンク、Cookie、リダイレクトがすべて正しく機能します。
:::

### TLS (HTTPS) を有効にする \{#enabling-tls\}

デプロイメントをHTTPSで保護するには:

**1. 証明書とキーを使ってTLSシークレットを作成します:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. イングレスの設定でTLSを有効にします。**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### イングレス設定例 \{#example-ingress-configuration\}

参考までに、生成されるイングレスリソースは次のようになります。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: hyperdx-app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
    nginx.ingress.kubernetes.io/use-regex: "true"
spec:
  ingressClassName: nginx
  rules:
    - host: hyperdx.yourdomain.com
      http:
        paths:
          - path: /(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: my-clickstack-clickstack-app
                port:
                  number: 3000
  tls:
    - hosts:
        - hyperdx.yourdomain.com
      secretName: hyperdx-tls
```

### よくあるイングレスの落とし穴 \{#common-ingress-pitfalls\}

**パスとリライトの設定:**

* Next.js やその他の SPA では、必ず上記のとおり Regex パスとリライトアノテーションを使用してください
* リライトを設定せずに `path: /` だけを使用しないでください。静的アセットを配信できなくなります

**`frontendUrl` と `ingress.host` の不一致:**

* これらが一致していないと、Cookie、リダイレクト、アセットの読み込みで問題が発生することがあります

**TLS の設定ミス:**

* TLS シークレットが有効で、イングレス内で正しく参照されていることを確認してください
* TLS が有効な状態で HTTP 経由でアプリにアクセスすると、ブラウザーが安全でないコンテンツをブロックすることがあります

**イングレスコントローラーのバージョン:**

* 一部の機能 (Regex パスやリライトなど) を使用するには、比較的新しいバージョンの nginx ingress controller が必要です
* 次のコマンドでバージョンを確認してください:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## OTel collector イングレス \{#otel-collector-ingress\}

OTel collector のエンドポイント (トレース、メトリクス、ログ) をイングレス経由で公開する必要がある場合は、`additionalIngresses` 設定を使用します。これは、クラスター外からテレメトリデータを送信する場合や、collector にカスタムドメインを使用する場合に役立ちます。

```yaml
hyperdx:
  ingress:
    enabled: true
    additionalIngresses:
      - name: otel-collector
        annotations:
          nginx.ingress.kubernetes.io/ssl-redirect: "false"
          nginx.ingress.kubernetes.io/force-ssl-redirect: "false"
          nginx.ingress.kubernetes.io/use-regex: "true"
        ingressClassName: nginx
        hosts:
          - host: collector.yourdomain.com
            paths:
              - path: /v1/(traces|metrics|logs)
                pathType: Prefix
                port: 4318
                name: otel-collector
        tls:
          - hosts:
              - collector.yourdomain.com
            secretName: collector-tls
```

* これにより、OTel collector のエンドポイント用に個別のイングレスリソースが作成されます
* 別のドメインを使用したり、TLS の個別設定を構成したり、カスタムアノテーションを適用したりできます
* Regex パスルールを使用すると、すべての OTLP シグナル (トレース、メトリクス、ログ) を 1 つのルールでルーティングできます

:::note
OTel collector を外部に公開する必要がない場合は、この設定を省略できます。ほとんどのユーザーには、一般的なイングレス設定で十分です。
:::

また、[`additionalManifests`](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) を使用して、AWS ALB Ingress などの完全にカスタムのイングレスリソースを定義することもできます.

## OTEL collector の設定 \{#otel-collector-configuration\}

OTEL Collector は、公式の OpenTelemetry Collector Helm チャートの `otel-collector:` サブチャートとしてデプロイされます。values では、`otel-collector:` の配下で直接設定してください。

```yaml
otel-collector:
  enabled: true
  mode: deployment
  replicaCount: 3
  resources:
    requests:
      memory: "128Mi"
      cpu: "100m"
    limits:
      memory: "256Mi"
      cpu: "200m"
  nodeSelector:
    node-role: monitoring
  tolerations:
    - key: monitoring
      operator: Equal
      value: otel
      effect: NoSchedule
```

環境変数 (ClickHouse エンドポイント、OpAMP URL など) は、統一された `clickstack-config` ConfigMap と `clickstack-secret` Secret を介して共有されます。サブチャートの `extraEnvsFrom` は、あらかじめ両方を参照するよう設定されています。

利用可能なすべてのサブチャート値については、[OpenTelemetry Collector Helm チャート](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-collector)を参照してください。

## MongoDB の設定 \{#mongodb-configuration\}

MongoDB は、`MongoDBCommunity` カスタムリソースを通じて MCK オペレーターにより管理されます。CR の spec は `mongodb.spec` からそのまま反映されます。

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

MongoDB のパスワードは `hyperdx.secrets.MONGODB_PASSWORD` で設定します。使用可能なすべての CRD フィールドについては、[MCK documentation](https://github.com/mongodb/mongodb-kubernetes/tree/master/docs/mongodbcommunity) を参照してください。

## ClickHouse の設定 \{#clickhouse-configuration\}

ClickHouse は、`ClickHouseCluster` および `KeeperCluster` のカスタムリソースを通じて ClickHouse Operator によって管理されます。両方の CR の仕様は、値 の内容がそのままレンダリングされます。

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
      dataVolumeClaimSpec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 10Gi
```

ClickHouse のユーザー認証情報は `hyperdx.secrets` から取得されます (v1.x の `clickhouse.config.users` ではありません) 。利用可能なすべての CRD フィールドについては、[ClickHouse Operator の設定ガイド](https://clickhouse.com/docs/clickhouse-operator/guides/configuration)を参照してください。

## イングレスのトラブルシューティング \{#troubleshooting-ingress\}

**イングレスリソースを確認します:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**イングレスコントローラーのログを確認する:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**アセット URL のテスト:**

`curl` を使用して、静的アセットが HTML ではなく JS として配信されていることを確認します。

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**ブラウザーの DevTools:**

* Network タブで、404 エラーや、JS ではなく HTML を返しているアセットがないか確認します
* コンソールで `Unexpected token <` のようなエラーがないか確認します (JS に対して HTML が返されていることを示します)

**パスの書き換えを確認する:**

* イングレスでアセットのパスが削除されたり、誤って書き換えられたりしていないことを確認します

**ブラウザーと CDN のキャッシュをクリアする:**

* 変更後は、古いアセットが残るのを防ぐため、ブラウザーのキャッシュと CDN/プロキシのキャッシュをクリアします

## 値のカスタマイズ \{#customizing-values\}

設定は `--set` フラグでカスタマイズできます:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

あるいは、カスタム `values.yaml` を作成します。デフォルト値を取得するには:

```shell
helm show values clickstack/clickstack > values.yaml
```

カスタム値を適用します:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## 次のステップ \{#next-steps\}

* [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムと最小構成のデプロイメント
* [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行
* [追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - カスタム Kubernetes オブジェクト
* [Helm メインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール
* [設定 (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - v1.x の設定ガイド