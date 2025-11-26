---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 設定'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack の Helm デプロイメントにおける API キー、シークレット、イングレスの設定'
doc_type: 'guide'
keywords: ['ClickStack の設定', 'Helm シークレット', 'API キー設定', 'イングレス設定', 'TLS 設定']
---

このガイドでは、ClickStack の Helm デプロイメントにおける設定オプションについて説明します。基本的なインストール手順については、[Helm デプロイメントのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。

## API key setup {#api-key-setup}

ClickStack のデプロイが正常に完了したら、テレメトリデータの収集を有効にするために API キーを設定します。

1. 構成済みのイングレスまたは Service エンドポイントを通じて **HyperDX インスタンスにアクセス** します
2. **HyperDX ダッシュボードにログイン** し、「Team settings」に移動して API キーを生成または取得します
3. 次のいずれかの方法で API キーを使用して **デプロイメントを更新** します:

### 方法 1: Helm upgrade と values ファイルを使って更新する

`values.yaml` に API キーを追加します:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

次に、デプロイメントをアップグレードします：

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### 方法 2：`--set` フラグを指定した Helm upgrade による更新

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### 変更を反映するためにポッドを再起動する

API キーを更新したら、新しい設定を反映するためにポッドを再起動します。

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
このチャートは、API キーを含む Kubernetes Secret（`<release-name>-app-secrets`）を自動的に作成します。外部 Secret を使用する場合を除き、追加の Secret 設定は不要です。
:::


## シークレット管理 {#secret-management}

API キーやデータベース認証情報などの機密データを扱う場合は、Kubernetes の Secret リソースを使用してください。

### 事前構成済みの Secret を使用する

Helm チャートには、デフォルトの Secret テンプレートが [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に含まれています。このファイルは、Secret を管理するための基本的なひな型を提供します。

Secret を手動で適用する必要がある場合は、提供されている `secrets.yaml` テンプレートを編集してから適用してください。

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

シークレットをクラスターに適用します:

```shell
kubectl apply -f secrets.yaml
```


### カスタムシークレットの作成

Kubernetes のカスタムシークレットを手動で作成します。

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


### values.yaml で Secret を参照する

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## イングレスのセットアップ {#ingress-setup}

ドメイン名経由で HyperDX の UI と API を公開するには、`values.yaml` でイングレスを有効にします。

### 共通のイングレス設定

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # イングレスのホストと一致させる必要があります
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定上の注意
`hyperdx.frontendUrl` はイングレスのホスト名と一致させ、プロトコルを含めて設定してください（例: `https://hyperdx.yourdomain.com`）。これにより、生成されるすべてのリンク、クッキー、およびリダイレクトが正しく動作します。
:::


### TLS (HTTPS) の有効化

デプロイメントを HTTPS で保護するには、次の手順を実行します。

**1. 証明書と秘密鍵を使用して TLS シークレットを作成します:**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. イングレスの設定で TLS を有効にする:**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```


### イングレス設定の例

参考として、生成されるイングレスリソースは次のようになります。

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


### よくあるイングレスの落とし穴

**パスとリライトの設定:**

* Next.js やその他の SPA では、必ず上記のように正規表現パスとリライト用アノテーションを使用すること
* リライトなしで単に `path: /` のみを使用しないこと。静的アセットの配信が失敗する原因になる

**`frontendUrl` と `ingress.host` の不一致:**

* これらが一致していない場合、Cookie、リダイレクト、アセットの読み込みに問題が発生する可能性がある

**TLS の誤った設定:**

* TLS シークレットが有効であり、イングレスで正しく参照されていることを確認すること
* TLS を有効にしている場合に HTTP 経由でアプリにアクセスすると、ブラウザが安全でないコンテンツをブロックすることがある

**イングレスコントローラーのバージョン:**

* 正規表現パスやリライトなどの一部機能は、比較的新しいバージョンの nginx ingress controller を必要とする
* 次のコマンドでバージョンを確認すること:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTel collector のイングレス

OTel collector のエンドポイント（traces、metrics、logs）をイングレス経由で公開する必要がある場合は、`additionalIngresses` 設定を使用します。これは、クラスター外からテレメトリデータを送信する場合や、OTel collector 用にカスタムドメインを使用する場合に便利です。

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

* これにより、OTEL collector のエンドポイント用に専用のイングレスリソースが作成されます
* 異なるドメインを使用したり、特定の TLS 設定を構成したり、カスタムアノテーションを適用したりできます
* 正規表現ベースのパスルールによって、すべての OTLP シグナル（トレース、メトリクス、ログ）を単一のルールでルーティングできます

:::note
OTEL collector を外部公開する必要がない場合は、この設定を省略できます。ほとんどのユーザーにとっては、通常のイングレス設定だけで十分です。
:::


## イングレスのトラブルシューティング

**イングレスリソースを確認する：**

```shell
kubectl get ingress -A
kubectl describe ingress <イングレス名>
```

**イングレスコントローラーのログを確認する：**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**テスト用アセットの URL:**

`curl` を使用して、静的アセットが HTML ではなく JavaScript として配信されていることを確認します:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Content-Type: application/javascript が返される必要があります
```

**ブラウザ開発者ツール:**

* Network タブで 404 や、JS の代わりに HTML を返しているアセットがないか確認する
* コンソールで `Unexpected token <` のようなエラーを探す（JS に対して HTML が返されていることを示す）

**パス書き換えの確認:**

* イングレスがアセットパスを削ってしまったり、意図せず書き換えたりしていないか確認する

**ブラウザと CDN キャッシュのクリア:**

* 設定変更後は、ブラウザキャッシュと CDN/プロキシキャッシュをクリアして、古いアセットが配信されるのを避ける


## 値のカスタマイズ

`--set` フラグを使用して設定値をカスタマイズできます。

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

または、独自の `values.yaml` を作成します。デフォルト値を取得するには、次を実行します。

```shell
helm show values clickstack/clickstack > values.yaml
```

設定例：

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

カスタム値を適用する:

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 次のステップ {#next-steps}

- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムおよび最小構成でのデプロイメント
- [クラウドデプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成
- [Helm のメインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール