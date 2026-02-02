---
slug: /use-cases/observability/clickstack/deployment/helm-configuration
title: 'Helm 構成'
pagination_prev: null
pagination_next: null
sidebar_position: 4
description: 'ClickStack を Helm でデプロイする際の API キー、シークレット、イングレスの構成'
doc_type: 'guide'
keywords: ['ClickStack の構成', 'Helm シークレット', 'API キーの設定', 'イングレスの構成', 'TLS のセットアップ']
---

このガイドでは、ClickStack を Helm でデプロイする際の構成オプションについて説明します。基本的なインストール手順については、[メインの Helm デプロイメントガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。

## API キーのセットアップ \{#api-key-setup\}

ClickStack を正常にデプロイできたら、テレメトリデータ収集を有効にするために API キーを設定します。

1. 設定済みのイングレスまたは Service エンドポイント経由で **HyperDX インスタンスにアクセス** します
2. **HyperDX ダッシュボードにログイン** し、Team settings（チーム設定）に移動して API キーを生成または取得します
3. 次のいずれかの方法で API キーを指定して **デプロイメントを更新** します:

### 方法 1: values ファイルを用いた Helm upgrade で更新する \{#api-key-values-file\}

`values.yaml` に API キーを追加します。

```yaml
hyperdx:
  apiKey: "your-api-key-here"
```

次にデプロイメントをアップグレードします。

```shell
helm upgrade my-clickstack clickstack/clickstack -f values.yaml
```


### 方法 2: helm upgrade の --set フラグを使って更新する \{#api-key-set-flag\}

```shell
helm upgrade my-clickstack clickstack/clickstack --set hyperdx.apiKey="your-api-key-here"
```


### 変更を反映させるためにポッドを再起動する \{#restart-pods\}

API キーを更新した後は、新しい設定を反映させるためにポッドを再起動します。

```shell
kubectl rollout restart deployment my-clickstack-clickstack-app my-clickstack-clickstack-otel-collector
```

:::note
このチャートは、API キーを含む Kubernetes Secret（`<release-name>-app-secrets`）を自動的に作成します。外部 Secret を使用しない限り、追加の Secret の設定は不要です。
:::


## シークレット管理 \{#secret-management\}

API キーやデータベースの認証情報などの機密データを扱うには、Kubernetes の Secret オブジェクトを使用してください。

### 事前構成された Secret の使用 \{#using-pre-configured-secrets\}

Helm チャートには、[`charts/clickstack/templates/secrets.yaml`](https://github.com/hyperdxio/helm-charts/blob/main/charts/clickstack/templates/secrets.yaml) に配置されたデフォルトの Secret テンプレートが含まれています。このファイルでは、Secret を管理するための基本的な構造が定義されています。

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

シークレットをクラスターに適用します：

```shell
kubectl apply -f secrets.yaml
```


### カスタムシークレットの作成 \{#creating-a-custom-secret\}

カスタム Kubernetes シークレットを手動で作成します。

```shell
kubectl create secret generic hyperdx-secret \
  --from-literal=API_KEY=my-secret-api-key
```


### values.yaml 内で Secret を参照する \{#referencing-a-secret\}

```yaml
hyperdx:
  apiKey:
    valueFrom:
      secretKeyRef:
        name: hyperdx-secret
        key: API_KEY
```


## イングレスのセットアップ \{#ingress-setup\}

ドメイン名経由で HyperDX UI と API を公開するには、`values.yaml` でイングレスを有効にします。

### イングレスの一般的な設定 \{#general-ingress-configuration\}

```yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"  # Must match ingress host
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
```

:::note 重要な設定に関する注意
`hyperdx.frontendUrl` はイングレスのホスト名と一致し、プロトコルを含める必要があります（例: `https://hyperdx.yourdomain.com`）。これにより、生成されるリンク、Cookie、およびリダイレクトが正しく動作します。
:::


### TLS（HTTPS）の有効化 \{#enabling-tls\}

HTTPS でデプロイメントを保護するには、次の手順を実行します。

**1. 証明書と秘密鍵を含む TLS シークレットを作成します。**

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


### イングレス設定の例 \{#example-ingress-configuration\}

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


### 一般的なイングレスの落とし穴 \{#common-ingress-pitfalls\}

**パスおよびリライトの設定:**

* Next.js などの SPA では、必ず上記のような正規表現パスとリライト用アノテーションを使用すること
* リライトなしで `path: /` のみを使用しないこと。静的アセットの配信が正しく行われなくなります

**`frontendUrl` と `ingress.host` の不一致:**

* これらが一致しない場合、Cookie、リダイレクト、アセット読み込みに問題が発生する可能性があります

**TLS の誤設定:**

* TLS Secret が有効であり、イングレス内で正しく参照されていることを確認してください
* TLS が有効な状態で HTTP 経由でアプリにアクセスすると、ブラウザが安全でないコンテンツをブロックする場合があります

**イングレスコントローラーのバージョン:**

* 正規表現パスやリライトなどの一部機能は、nginx イングレスコントローラーの比較的新しいバージョンが必要です
* 次のコマンドでバージョンを確認してください:

```shell
kubectl -n ingress-nginx get pods -l app.kubernetes.io/name=ingress-nginx -o jsonpath="{.items[0].spec.containers[0].image}"
```


## OTel collector イングレス \{#otel-collector-ingress\}

トレース、メトリクス、ログ用の OTel collector のエンドポイントをイングレス経由で公開する必要がある場合は、`additionalIngresses` 設定を使用してください。これは、クラスター外からテレメトリデータを送信する場合や、OTel collector 用にカスタムドメインを使用する場合に便利です。

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

* これは、OTel collector のエンドポイント用に専用のイングレスリソースを作成します
* 別のドメインを使用したり、特定の TLS 設定を構成したり、カスタムアノテーションを適用したりできます
* この正規表現パスルールにより、すべての OTLP シグナル（トレース、メトリクス、ログ）を 1 つのルールでルーティングできます

:::note
OTel collector を外部公開する必要がなければ、この設定は省略できます。ほとんどのユーザーにとっては、通常のイングレス設定で十分です。
:::


## イングレスのトラブルシューティング \{#troubleshooting-ingress\}

**イングレスリソースを確認する：**

```shell
kubectl get ingress -A
kubectl describe ingress <ingress-name>
```

**イングレスコントローラーのログを確認する:**

```shell
kubectl logs -l app.kubernetes.io/name=ingress-nginx -n ingress-nginx
```

**テスト用アセット URL:**

`curl` を使って、静的アセットが HTML ではなく JS として配信されていることを確認します:

```shell
curl -I https://hyperdx.yourdomain.com/_next/static/chunks/main-xxxx.js
# Should return Content-Type: application/javascript
```

**ブラウザの DevTools:**

* ネットワークタブで、404 や JS の代わりに HTML を返しているアセットがないか確認する
* コンソールで `Unexpected token <` のようなエラーを探す（JS に対して HTML が返されていることを示す）

**パスの書き換えを確認:**

* イングレスがアセットパスを削除したり、不適切に書き換えたりしていないことを確認する

**ブラウザと CDN キャッシュをクリア:**

* 変更後は、ブラウザキャッシュおよび CDN/プロキシキャッシュをクリアして、古いアセットが利用されないようにする


## 値のカスタマイズ \{#customizing-values\}

`--set` フラグを使用して設定値をカスタマイズできます。

```shell
helm install my-clickstack clickstack/clickstack --set key=value
```

あるいは、カスタムの `values.yaml` を作成します。デフォルト値を取得するには、次のコマンドを実行します：

```shell
helm show values clickstack/clickstack > values.yaml
```

構成例:

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

カスタム値を適用する：

```shell
helm install my-clickstack clickstack/clickstack -f values.yaml
```


## 次のステップ \{#next-steps\}

- [デプロイ方法のオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システム連携および最小構成デプロイメント
- [Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - GKE、EKS、AKS の構成
- [Helm のメインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール