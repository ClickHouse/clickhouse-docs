---
slug: /use-cases/observability/clickstack/deployment/helm-cloud-v1
title: 'Helm Cloud デプロイメント (v1.x)'
pagination_prev: null
pagination_next: null
sidebar_position: 13
description: 'v1.x Helm チャートを使用して GKE、EKS、AKS に ClickStack をデプロイするための Cloud 固有の構成'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes Cloud デプロイメント', '本番デプロイメント']
---

:::warning 非推奨 — v1.x チャート
このページでは、現在メンテナンスモードとなっている **v1.x** インラインテンプレート Helm チャートの Cloud デプロイメントについて説明します。v2.x チャートについては、[Helm Cloud デプロイメント](/docs/use-cases/observability/clickstack/deployment/helm-cloud)を参照してください。移行する場合は、[アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade)を参照してください。
:::

このガイドでは、マネージド Kubernetes サービス上に ClickStack をデプロイするための Cloud 固有の構成について説明します。基本的なインストールについては、[Helm デプロイのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm-v1)を参照してください。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE にデプロイする場合は、Cloud 固有のネットワークの挙動により、特定の値を上書きする必要があることがあります。

### LoadBalancer の DNS 名前解決の問題 \{#loadbalancer-dns-resolution-issue\}

GKE の LoadBalancer サービスでは、ポッド間通信の内部 DNS 名前解決に問題が発生し、クラスター ネットワーク内で解決されるべき通信先が外部 IP に解決されてしまうことがあります。これは特に、OTEL collector から OpAMP サーバーへの接続に影響します。

**症状:**

* クラスター IP アドレスに対する &quot;connection refused&quot; エラーが OTEL collector のログに表示される
* 次のような OpAMP 接続エラー: `dial tcp 34.118.227.30:4320: connect: connection refused`

**解決策:**

OpAMP サーバーの URL には、完全修飾ドメイン名 (FQDN) を使用します。

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### GKE に関するその他の考慮事項 \{#other-gke-considerations\}

```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # Use your LoadBalancer external IP

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"

# Adjust for GKE pod networking if needed
clickhouse:
  config:
    clusterCidrs:
      - "10.8.0.0/16"  # GKE commonly uses this range
      - "10.0.0.0/8"   # Fallback for other configurations
```

## Amazon EKS \{#amazon-eks\}

EKS へのデプロイでは、以下の一般的な構成を検討してください：

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"

# EKS typically uses these pod CIDRs
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"

# Enable ingress for production
hyperdx:
  ingress:
    enabled: true
    host: "hyperdx.yourdomain.com"
    tls:
      enabled: true
```

## Azure AKS \{#azure-aks\}

AKS へのデプロイでは:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"

# AKS pod networking
clickhouse:
  config:
    clusterCidrs:
      - "10.244.0.0/16"  # Common AKS pod CIDR
      - "10.0.0.0/8"
```

## 本番環境向け Cloud デプロイチェックリスト \{#production-cloud-deployment-checklist\}

いずれのクラウドプロバイダーでも、ClickStack を本番環境にデプロイする前に、次を確認してください。

* [ ] 外部ドメイン/IP に合わせて適切な `frontendUrl` を設定する
* [ ] HTTPS アクセス用に TLS 対応のイングレスをセットアップする
* [ ] 接続の問題が発生する場合は、`otel.opampServerUrl` を FQDN で上書きする (特に GKE)
* [ ] ポッドネットワークの CIDR に合わせて `clickhouse.config.clusterCidrs` を調整する
* [ ] 本番ワークロード向けに永続ストレージを設定する
* [ ] 適切なリソースのリクエスト値と上限値を設定する
* [ ] 監視とアラートを有効にする
* [ ] バックアップと障害復旧を設定する
* [ ] 適切なシークレット管理を導入する

## 本番環境におけるベストプラクティス \{#production-best-practices\}

### リソース管理 \{#resource-management\}

```yaml
hyperdx:
  resources:
    requests:
      cpu: 500m
      memory: 1Gi
    limits:
      cpu: 2000m
      memory: 4Gi
```

### 高可用性 \{#high-availability\}

```yaml
hyperdx:
  replicaCount: 3

  affinity:
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchExpressions:
                - key: app.kubernetes.io/name
                  operator: In
                  values:
                    - clickstack
            topologyKey: kubernetes.io/hostname
```

### 永続ストレージ \{#persistent-storage\}

データを保持するため、永続ボリュームが設定されていることを確認してください。

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**Cloud 固有のストレージクラス:**

* **GKE**: `pd-ssd` または `pd-balanced`
* **EKS**: `gp3` または `io2`
* **AKS**: `managed-premium` または `managed-csi`

### ブラウザー互換性に関する注意事項 \{#browser-compatibility-notes\}

HTTP のみのデプロイメント (開発／テスト) では、セキュアコンテキスト要件のため、一部のブラウザーで crypto API エラーが発生する場合があります。本番環境へのデプロイでは、必ずイングレス設定を通じて適切な TLS 証明書を使用した HTTPS を利用してください。

TLS の設定手順については、[イングレス設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1#ingress-setup) を参照してください。

## 次のステップ \{#next-steps\}

* [設定ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-configuration-v1) - API キー、シークレット、イングレス
* [デプロイメントオプション (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options-v1) - 外部システムの設定
* [メインの helm ガイド (v1.x)](/docs/use-cases/observability/clickstack/deployment/helm-v1) - 基本的なインストール
* [Cloud デプロイメント (v2.x)](/docs/use-cases/observability/clickstack/deployment/helm-cloud) - v2.x 向け Cloud ガイド
* [アップグレードガイド](/docs/use-cases/observability/clickstack/deployment/helm-upgrade) - v1.x から v2.x への移行