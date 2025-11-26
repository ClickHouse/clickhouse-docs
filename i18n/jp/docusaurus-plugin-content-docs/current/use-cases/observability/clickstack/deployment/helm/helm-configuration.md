---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm の構成'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack の Helm デプロイメントにおける API キー、シークレット、およびイングレスの構成'
doc_type: 'guide'
keywords: ['ClickStack の設定', 'Helm シークレット', 'API キー設定', 'イングレス設定', 'TLS 設定']
---

このガイドでは、ClickStack の Helm デプロイメントにおける構成オプションについて説明します。基本的なインストール手順については、[メインの Helm デプロイメントガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。



## API キーのセットアップ

ClickStack のデプロイが正常に完了したら、テレメトリ データ収集を有効にするために API キーを構成します。

1. 設定済みのイングレスまたは Service のエンドポイント経由で **HyperDX インスタンスにアクセス** します
2. **HyperDX ダッシュボードにログイン** し、「Team settings」に移動して API キーを生成または取得します
3. 次のいずれかの方法で **デプロイメントを API キーで更新** します

### 方法 1: values ファイルを使用した Helm upgrade での更新

`values.yaml` に API キーを追加します。

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

その後、デプロイメントをアップグレードします。

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法 2: Helm upgrade コマンドで --set フラグを指定して更新する

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="ここにあなたのAPIキーを入力"
```

### 変更を反映するためにポッドを再起動する

API キーを更新したら、新しい設定を反映させるためにポッドを再起動します。

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
このチャートは、API キーを格納した Kubernetes シークレット（`<release-name>-app-secrets`）を自動的に作成します。外部シークレットを使用しない限り、追加のシークレット設定を行う必要はありません。
:::


## シークレット管理

API キーやデータベース認証情報などの機密データを扱う場合は、Kubernetes の Secret リソースを使用します。

### あらかじめ用意されたシークレットの使用

Helm チャートには、デフォルトのシークレットテンプレートが [`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に含まれています。このファイルは、シークレットを管理するための基本構造を提供します。

シークレットを手動で適用する必要がある場合は、提供されている `secrets.yaml` テンプレートを編集して適用してください。

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

シークレットをクラスターに適用します：

```shell
kubectl apply -f secrets.yaml
```

### カスタムシークレットの作成

カスタムの Kubernetes Secret を手動で作成します。

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### values.yaml からシークレットを参照する

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## イングレスのセットアップ

HyperDX UI と API をドメイン名で公開するには、`values.yaml` でイングレスを有効にします。

### 一般的なイングレスの設定

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # イングレスのホストと一致させる必要があります
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定上の注意
`hyperdx.frontendUrl` はイングレスのホストと一致し、プロトコルを含めて指定する必要があります（例: `https://hyperdx.yourdomain.com`）。これにより、生成されるリンク、Cookie、およびリダイレクトが正しく動作します。
:::

### TLS（HTTPS）の有効化

HTTPS でデプロイメントを保護するには、次の手順を実行します。

**1. 証明書と秘密鍵を使用して TLS シークレットを作成します。**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. イングレスの設定で TLS を有効にする：**

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

参考として、生成されたイングレスリソースは以下のようになります。

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

### 一般的なイングレスでの落とし穴

**パスとリライト設定:**

* Next.js やその他の SPA では、必ず上記のような正規表現パスとリライト用アノテーションを使用してください
* リライトなしで単に `path: /` のみを使用しないでください。静的アセットの配信が正しく行われなくなる原因になります

**`frontendUrl` と `ingress.host` の不一致:**

* これらが一致していない場合、Cookie、リダイレクト、アセットの読み込みに問題が発生する可能性があります

**TLS の誤った設定:**

* TLS シークレットが有効であり、イングレスから正しく参照されていることを確認してください
* TLS が有効な状態で HTTP 経由でアプリにアクセスすると、ブラウザが安全でないコンテンツをブロックする場合があります

**イングレスコントローラーのバージョン:**

* 一部の機能（正規表現パスやリライトなど）は、nginx イングレスコントローラーの比較的新しいバージョンが必要です
* 次のコマンドでバージョンを確認してください:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTel collector イングレス

トレース、メトリクス、ログ用の OTel collector のエンドポイントをイングレス経由で外部に公開する必要がある場合は、`additionalIngresses` 設定を使用します。これは、クラスター外からテレメトリデータを送信したり、OTel collector 用にカスタムドメインを使用したりする際に有用です。

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
* 別のドメインを使用したり、特定の TLS 設定を構成したり、カスタムアノテーションを適用したりできます
* この正規表現を用いたパスルールにより、すべての OTLP シグナル（トレース、メトリクス、ログ）を単一のルールでルーティングできます

:::note
OTel collector を外部に公開する必要がない場合、この設定は省略できます。ほとんどのユーザーにとっては、共通のイングレス設定だけで十分です。
:::


## イングレスのトラブルシューティング

**イングレスリソースを確認する：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**イングレスコントローラーのログを確認する:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**テスト用アセットの URL:**


`curl` を使用して、静的アセットが HTML ではなく JS として配信されていることを確認します:`

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Content-Type: application/javascript が返されます
```

**ブラウザの DevTools:**

* Network タブで、404 や、JS ではなく HTML を返しているアセットがないか確認する
* コンソールで `Unexpected token <` のようなエラーが出ていないか確認する（JS の代わりに HTML が返されていることを示す）

**パス書き換えの確認:**

* イングレスがアセットパスを削ったり、誤って書き換えたりしていないことを確認する

**ブラウザと CDN キャッシュのクリア:**

* 変更後は、ブラウザキャッシュおよび CDN / プロキシキャッシュをクリアして、古いアセットが使われないようにする


## 値のカスタマイズ

`--set` フラグを使用して設定値をカスタマイズできます。

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

または、カスタムの `values.yaml` ファイルを作成します。デフォルト値を取得するには、次のコマンドを実行します:

```shell
helm show values clickstack/clickstack > values.yaml
```

構成例：

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


## 次のステップ {#next-steps}

- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システム向けおよび最小構成のデプロイメント
- [クラウドデプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS 向け構成
- [Helm メインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール
