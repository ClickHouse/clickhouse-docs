---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm クラウドデプロイ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE、EKS、AKS で ClickStack をデプロイするための Cloud 固有の構成'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes cloud deployment', 'production deployment']
---

:::warning チャート バージョン 2.x
このページでは、**v2.x** のサブチャートベースの Helm チャートについて説明します。まだ v1.x のインラインテンプレート チャートを使用している場合は、[Helm クラウドデプロイ (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) を参照してください。移行手順については、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) を参照してください。
:::

このガイドでは、マネージド Kubernetes サービス上に ClickStack をデプロイする際の Cloud 固有の構成について説明します。基本的なインストールについては、[メインの Helm デプロイガイド](/docs/use-cases/observability/clickstack/deployment/helm) を参照してください。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE にデプロイする場合、クラウド固有のネットワーク挙動により、一部の値を上書きする必要があることがあります。

### LoadBalancer の DNS 名前解決の問題 \{#loadbalancer-dns-resolution-issue\}

GKE の LoadBalancer サービスでは、ポッド間通信の名前解決がクラスター ネットワーク内にとどまらず、外部 IP に解決されてしまう内部 DNS 名前解決の問題が発生することがあります。これは特に、OTel collector から OpAMP サーバーへの接続に影響します。

**症状:**

* クラスター IP アドレスに対する &quot;connection refused&quot; エラーが表示される OTel collector のログ
* 次のような OpAMP 接続エラー: `dial tcp 34.118.227.30:4320: connect: connection refused`

**対処方法:**

OpAMP サーバーの URL には完全修飾ドメイン名 (FQDN) を使用します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set hyperdx.config.OPAMP_SERVER_URL="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### GKE の values 設定例 \{#gke-example-values\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

  config:
    OPAMP_SERVER_URL: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "pd-ssd"
        resources:
          requests:
            storage: 10Gi
```

## Amazon EKS \{#amazon-eks\}

EKS へのデプロイでは、一般的に次のような構成を検討してください。

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "gp3"
        resources:
          requests:
            storage: 10Gi
```

AWS ALB イングレスの構成については、[追加マニフェストガイド](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests#aws-alb-ingress)および[ALB の設定例](https://github.com/ClickHouse/ClickStack-helm-charts/tree/main/examples/alb-ingress)を参照してください。

## Azure AKS \{#azure-aks\}

AKS にデプロイする場合:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "https://hyperdx.yourdomain.com"

clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "managed-csi"
        resources:
          requests:
            storage: 10Gi
```

## 本番環境のクラウドデプロイチェックリスト \{#production-cloud-deployment-checklist\}

任意のクラウドサービスプロバイダー上で ClickStack を本番環境にデプロイする前に、以下を確認してください。

* [ ] 外部ドメイン/IP に対応した適切な `hyperdx.frontendUrl` を設定する
* [ ] HTTPS アクセス用に、TLS 付きのイングレスをセットアップする
* [ ] 接続の問題が発生している場合 (特に GKE) 、OpAMP サーバー URL を FQDN で重写する
* [ ] ClickHouse と Keeper のボリュームクレーム用のストレージクラスを設定する
* [ ] 適切なリソースリクエストと上限を設定する
* [ ] 監視とアラートを有効にする
* [ ] バックアップと障害復旧を設定する
* [ ] `hyperdx.secrets` または external secrets を使用して、適切なシークレット管理を実装する

## 本番環境のベストプラクティス \{#production-best-practices\}

### リソース管理 \{#resource-management\}

```yaml
hyperdx:
  deployment:
    resources:
      requests:
        cpu: 500m
        memory: 1Gi
      limits:
        cpu: "2"
        memory: 4Gi

otel-collector:
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi
```

### 高可用性 \{#high-availability\}

```yaml
hyperdx:
  deployment:
    replicas: 3
    topologySpreadConstraints:
      - maxSkew: 1
        topologyKey: kubernetes.io/hostname
        whenUnsatisfiable: ScheduleAnyway
        labelSelector:
          matchLabels:
            app.kubernetes.io/name: clickstack

  podDisruptionBudget:
    enabled: true
    minAvailable: 1
```

### 永続ストレージ \{#persistent-storage\}

オペレーターの CR 仕様で、データ保持のための永続ボリュームが構成されていることを確認してください。

```yaml
clickhouse:
  keeper:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  cluster:
    spec:
      dataVolumeClaimSpec:
        storageClassName: "fast-ssd"
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 100Gi

mongodb:
  spec:
    statefulSet:
      spec:
        volumeClaimTemplates:
          - metadata:
              name: data-volume
            spec:
              storageClassName: "fast-ssd"
              accessModes: ["ReadWriteOnce"]
              resources:
                requests:
                  storage: 10Gi
```

**Cloud向けのストレージクラス:**

* **GKE**: `pd-ssd` または `pd-balanced`
* **EKS**: `gp3` または `io2`
* **AKS**: `managed-premium` または `managed-csi`

### ブラウザー互換性に関する注意事項 \{#browser-compatibility-notes\}

HTTP のみのデプロイ (開発/テスト) では、セキュアコンテキストの要件により、一部のブラウザーで crypto API エラーが発生する場合があります。本番環境へのデプロイでは、必ずイングレスの設定を通じて適切な TLS 証明書を使用した HTTPS を利用してください。

TLS の設定手順については、[イングレスの設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) を参照してください。

## 次のステップ \{#next-steps\}

* [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレス
* [デプロイオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムの構成
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行
* [追加マニフェスト](/docs/use-cases/observability/clickstack/deployment/helm-additional-manifests) - カスタム Kubernetes オブジェクト
* [Helm メインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール
* [クラウドデプロイ (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud-v1) - v1.x の Cloud 構成