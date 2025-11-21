---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm の設定'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack の Helm デプロイメントにおける API キー、シークレット、および Ingress の設定'
doc_type: 'guide'
keywords: ['ClickStack configuration', 'Helm secrets', 'API key setup', 'ingress configuration', 'TLS setup']
---

このガイドでは、ClickStack の Helm デプロイメント向けの設定オプションについて説明します。基本的なインストール方法については、[Helm デプロイメントの基本ガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。



## APIキーのセットアップ {#api-key-setup}

ClickStackのデプロイが正常に完了したら、テレメトリデータ収集を有効にするためにAPIキーを設定します:

1. **HyperDXインスタンスにアクセス**します。設定済みのIngressまたはサービスエンドポイント経由でアクセスしてください
2. **HyperDXダッシュボードにログイン**し、チーム設定に移動してAPIキーを生成または取得します
3. **デプロイメントを更新**します。以下のいずれかの方法でAPIキーを設定してください:

### 方法1: valuesファイルを使用したHelmアップグレードによる更新 {#api-key-values-file}

`values.yaml`にAPIキーを追加します:

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

次に、デプロイメントをアップグレードします:

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```

### 方法2: --setフラグを使用したHelmアップグレードによる更新 {#api-key-set-flag}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```

### 変更を適用するためのPodの再起動 {#restart-pods}

APIキーを更新した後、新しい設定を反映するためにPodを再起動します:

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
チャートは自動的にAPIキーを含むKubernetesシークレット(`<release-name>-app-secrets`)を作成します。外部シークレットを使用する場合を除き、追加のシークレット設定は不要です。
:::


## シークレット管理 {#secret-management}

APIキーやデータベース認証情報などの機密データを扱う場合は、Kubernetesシークレットを使用します。

### 事前設定されたシークレットの使用 {#using-pre-configured-secrets}

Helmチャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml)に配置されたデフォルトのシークレットテンプレートが含まれています。このファイルは、シークレット管理のための基本構造を提供します。

シークレットを手動で適用する必要がある場合は、提供されている`secrets.yaml`テンプレートを変更して適用します:

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

シークレットをクラスタに適用します:

```shell
kubectl apply -f secrets.yaml
```

### カスタムシークレットの作成 {#creating-a-custom-secret}

カスタムKubernetesシークレットを手動で作成します:

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```

### values.yamlでのシークレットの参照 {#referencing-a-secret}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## Ingressのセットアップ {#ingress-setup}

ドメイン名を介してHyperDX UIとAPIを公開するには、`values.yaml`でIngressを有効にします。

### 一般的なIngress設定 {#general-ingress-configuration}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com" # Ingressホストと一致する必要があります
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定に関する注意
`hyperdx.frontendUrl`はIngressホストと一致し、プロトコルを含める必要があります（例：`https://hyperdx.yourdomain.com`）。これにより、生成されるすべてのリンク、Cookie、リダイレクトが正しく動作することが保証されます。
:::

### TLS（HTTPS）の有効化 {#enabling-tls}

HTTPSでデプロイメントを保護するには：

**1. 証明書と秘密鍵を使用してTLSシークレットを作成します：**

```shell
kubectl create secret tls hyperdx-tls \
  --cert=path/to/tls.crt \
  --key=path/to/tls.key
```

**2. Ingress設定でTLSを有効にします：**

```yaml
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
      tlsSecretName: "hyperdx-tls"
```

### Ingress設定の例 {#example-ingress-configuration}

参考までに、生成されるIngressリソースは次のようになります：

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

### Ingressに関する一般的な落とし穴 {#common-ingress-pitfalls}

**パスとリライト設定：**

- Next.jsやその他のSPAの場合、上記のように常に正規表現パスとリライトアノテーションを使用してください
- リライトなしで`path: /`のみを使用しないでください。静的アセットの配信が機能しなくなります

**`frontendUrl`と`ingress.host`の不一致：**

- これらが一致しない場合、Cookie、リダイレクト、アセット読み込みに関する問題が発生する可能性があります

**TLSの設定ミス：**

- TLSシークレットが有効であり、Ingressで正しく参照されていることを確認してください
- TLSが有効な場合にHTTP経由でアプリにアクセスすると、ブラウザが安全でないコンテンツをブロックする可能性があります

**Ingressコントローラーのバージョン：**

- 一部の機能（正規表現パスやリライトなど）には、nginx Ingressコントローラーの最新バージョンが必要です
- バージョンを確認するには：

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTELコレクターのIngress {#otel-collector-ingress}

OTELコレクターのエンドポイント（トレース、メトリクス、ログ用）をIngressを通じて公開する必要がある場合は、`additionalIngresses`設定を使用します。これは、クラスター外部からテレメトリーデータを送信する場合や、コレクター用にカスタムドメインを使用する場合に有用です。

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

- OTELコレクターのエンドポイント用に個別のIngressリソースが作成されます
- 異なるドメインの使用、特定のTLS設定の構成、カスタムアノテーションの適用が可能です
- 正規表現パスルールにより、すべてのOTLPシグナル（トレース、メトリクス、ログ）を単一のルールでルーティングできます

:::note
OTELコレクターを外部に公開する必要がない場合は、この設定は不要です。ほとんどのユーザーにとっては、一般的なIngressの設定で十分です。
:::


## Ingressのトラブルシューティング {#troubleshooting-ingress}

**Ingressリソースを確認:**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**Ingressコントローラーのログを確認:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**アセットURLをテスト:**


`curl` を使って、静的アセットが HTML ではなく JS として配信されていることを確認します：

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Content-Type: application/javascript を返す必要があります
```

**ブラウザ DevTools:**

* Network タブで、404 が発生していないか、または JS の代わりに HTML を返しているアセットがないか確認します
* コンソールに `Unexpected token <` のようなエラーが出ていないか確認します（JS 向けのリクエストに対して HTML が返されていることを示します）

**パスの書き換えを確認:**

* Ingress がアセットパスを削除したり、不適切に書き換えたりしていないことを確認します

**ブラウザおよび CDN キャッシュをクリア:**

* 変更後は、古いアセットを参照しないよう、ブラウザキャッシュおよび CDN/プロキシのキャッシュをクリアします


## 値のカスタマイズ {#customizing-values}

`--set`フラグを使用して設定をカスタマイズできます:

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

または、カスタムの`values.yaml`を作成します。デフォルト値を取得するには:

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


## 次のステップ {#next-steps}

- [デプロイオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムと最小構成のデプロイ
- [クラウドデプロイ](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKSの構成
- [Helmメインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール
