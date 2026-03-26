---
slug: /use-cases/observability/clickstack/deployment/helm-configuration-v1
title: 'Helm の設定 (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 11
description: 'v1.x の ClickStack Helm デプロイにおける API キー、シークレット、イングレスの設定'
doc_type: 'guide'
keywords: ['ClickStack 設定', 'Helm シークレット', 'API キーの設定', 'イングレス設定', 'TLS の設定']
---

:::warning 非推奨 — v1.x チャート
このページでは、メンテナンスモードの **v1.x** インラインテンプレート Helm チャートの設定について説明します。v2.x チャートについては、[Helm の設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration)を参照してください。移行については、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)を参照してください。
:::

このガイドでは、ClickStack Helm デプロイの設定オプションを説明します。基本的なインストール手順については、[Helm デプロイのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm-v1)を参照してください。

## API キーの設定 \{#api-key-setup\}

ClickStack を正常にデプロイしたら、テレメトリーデータの収集を有効にするため、API キーを設定します。

1. **設定済みのイングレスまたはサービスエンドポイントから HyperDX インスタンスにアクセスします**
2. **HyperDX ダッシュボードにログインし**、Team settings に移動して API キーを生成または取得します
3. **以下のいずれかの方法で、API キーを使用するようデプロイを更新します。**

### 方法1: valuesファイルを使用したHelm upgradeによる更新 \{#api-key-values-file\}

APIキーを `values.yaml` に追加します:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

次に、デプロイをアップグレードします：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2: Helm upgrade と `--set` フラグを使用して更新する \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### 変更を適用するため、ポッドを再起動する \{#restart-pods\}

API キーを更新したら、新しい設定を読み込ませるためにポッドを再起動します。

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
このチャートは、API キーを含む Kubernetes シークレット (`<release-name>-app-secrets`) を自動的に作成します。外部シークレットを使用する場合を除き、シークレットに関する追加設定は不要です。
:::

## シークレットの管理 \{#secret-management\}

API キーやデータベース認証情報などの機密データを扱うには、Kubernetes シークレットを使用します。

### 事前設定済みシークレットの使用 \{#using-pre-configured-secrets\}

Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) にあるデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレットを管理するための基本的な構成を提供します。

シークレットを手動で適用する必要がある場合は、提供されている `secrets.yaml` テンプレートを編集して適用します。

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hyperdx-secret
  annotations:
    "helm.sh/resource-policy": keep
type: Opaque
data:
  API_KEY: <base64-encoded-api-key>
```

クラスターにシークレットを適用します:

```shell
kubectl apply -f secrets.yaml
```

### カスタムシークレットの作成 \{#creating-a-custom-secret\}

カスタム Kubernetes シークレットを手動で作成します。

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### values.yamlでシークレットを参照する \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```

## イングレスの設定 \{#ingress-setup\}

ドメイン名経由でインターフェイス HyperDX と API を公開するには、`values.yaml` でイングレスを有効にします。

### イングレスの一般設定 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定上の注意
`hyperdx.frontendUrl` はイングレスのホスト名と一致させ、プロトコル (例: `https://hyperdx.yourdomain.com`) も含める必要があります。これにより、生成されるリンク、Cookie、リダイレクトがすべて正しく機能します。
:::

### TLS (HTTPS) を有効にする \{#enabling-tls\}

デプロイを HTTPS で保護するには、次の手順を実行します。

**1. 証明書とキーを使って TLS シークレットを作成します。**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. イングレスの設定でTLSを有効にします:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### イングレス設定の例 \{#example-ingress-configuration\}

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

### イングレスでよくある落とし穴 \{#common-ingress-pitfalls\}

**パスとリライトの設定:**

* Next.js やその他の SPA では、必ず上記のように Regex パスとリライト用アノテーションを使用してください
* リライトなしで `path: /` だけを使用しないでください。静的アセットを配信できなくなります

**`frontendUrl` と `ingress.host` の不一致:**

* これらが一致していないと、Cookie、リダイレクト、アセットの読み込みに問題が発生することがあります

**TLS の設定ミス:**

* TLS シークレットが有効で、イングレスで正しく参照されていることを確認してください
* TLS が有効な状態で HTTP 経由でアプリにアクセスすると、ブラウザーが安全でないコンテンツをブロックすることがあります

**イングレスコントローラーのバージョン:**

* 一部の機能 (Regex パスやリライトなど) を使用するには、新しいバージョンの nginx ingress controller が必要です
* 次のコマンドでバージョンを確認してください:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```

## OTel collector のイングレス \{#otel-collector-ingress\}

OTel collector のエンドポイント (トレース、メトリクス、ログ) をイングレス経由で公開する必要がある場合は、`additionalIngresses` 設定を使用してください。これは、クラスター外からテレメトリーデータを送信する場合や、OTel collector にカスタムドメインを使用する場合に便利です。

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
* 別のドメインを使用し、TLS の詳細設定を行い、カスタムアノテーションを適用できます
* Regex パスルールを使用すると、すべての OTLP シグナル (トレース、メトリクス、ログ) を単一のルールでルーティングできます

:::note
OTel collector を外部に公開する必要がない場合は、この設定を省略できます。ほとんどのユーザーにとっては、通常のイングレス設定で十分です。
:::

## イングレスのトラブルシューティング \{#troubleshooting-ingress\}

**イングレスリソースを確認する:**

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
* コンソールで `Unexpected token <` のようなエラーを確認します (これは JS に対して HTML が返されていることを示します)

**パスの書き換えを確認する:**

* イングレスでアセットのパスが削除されたり、誤って書き換えられたりしていないことを確認します

**ブラウザーと CDN のキャッシュをクリアする:**

* 変更後は、古いアセットが使われるのを防ぐため、ブラウザーのキャッシュと CDN/プロキシのキャッシュをクリアします

## 値のカスタマイズ \{#customizing-values\}

設定は `--set` フラグでカスタマイズできます。

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

または、独自の `values.yaml` を作成します。デフォルト値を取得するには:

```shell
helm show values clickstack/clickstack > values.yaml
```

設定例:

```yaml
replicaCount: 2

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

hyperdx:
  ingress:
    enabled: true
    host: hyperdx.example.com
```

カスタム値を適用します:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```

## 次のステップ \{#next-steps\}

* [デプロイ オプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部システムと最小構成のデプロイ
* [Cloud デプロイ (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - GKE、EKS、AKS 向けの構成
* [Helm ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本インストール
* [Helm の設定 (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - v2.x の構成ガイド
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行