---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm による Cloud デプロイメント'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE、EKS、AKS 上に ClickStack をデプロイするための Cloud 向け設定'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes クラウドデプロイメント', '本番環境デプロイメント']
---

このガイドでは、マネージド Kubernetes サービス上に ClickStack をデプロイする際の Cloud 向けの設定について説明します。基本的なインストール手順については、[Helm デプロイメントのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。

## Google Kubernetes Engine (GKE) \{#google-kubernetes-engine-gke\}

GKE にデプロイする場合、クラウド特有のネットワーク動作により、いくつかの値を上書き設定する必要がある場合があります。

### LoadBalancer の DNS 解決の問題 \{#loadbalancer-dns-resolution-issue\}

GKE の LoadBalancer サービスにより、ポッド間通信がクラスター内ネットワークに留まらず、外部 IP に解決されてしまう内部 DNS 解決の問題が発生することがあります。これは特に OTel collector の OpAMP サーバーへの接続に影響します。

**症状:**

* OTel collector のログに、クラスター IP アドレスに対する「connection refused」エラーが表示される
* 次のような OpAMP 接続失敗: `dial tcp 34.118.227.30:4320: connect: connection refused`

**解決策:**

OpAMP サーバーの URL には、完全修飾ドメイン名 (FQDN) を使用してください:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


### その他の GKE に関する考慮事項 \{#other-gke-considerations\}

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

EKS へのデプロイ時には、よく利用される次の構成を検討してください。

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

AKS を利用する場合:

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


## 本番 Cloud デプロイメントチェックリスト \{#production-cloud-deployment-checklist\}

任意のクラウドプロバイダー上の本番環境に ClickStack をデプロイする前に、次を実施してください:

- [ ] 外部ドメイン/IP を用いて適切な `frontendUrl` を設定する
- [ ] HTTPS アクセス用に TLS を利用したイングレスをセットアップする
- [ ] 接続問題が発生している場合（特に GKE）、`otel.opampServerUrl` を FQDN に置き換える
- [ ] ポッドネットワーク CIDR に合わせて `clickhouse.config.clusterCidrs` を調整する
- [ ] 本番ワークロード向けに永続ストレージを構成する
- [ ] 適切なリソース requests および limits を設定する
- [ ] 監視およびアラート通知を有効化する
- [ ] バックアップおよび災害復旧を構成する
- [ ] 適切なシークレット管理を実装する

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

データを保持できるよう、PersistentVolume が適切に構成されていることを確認してください。

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # Use cloud-specific storage class
```

**Cloud 環境固有のストレージクラス:**

* **GKE**: `pd-ssd` または `pd-balanced`
* **EKS**: `gp3` または `io2`
* **AKS**: `managed-premium` または `managed-csi`


### ブラウザー互換性に関する注意事項 \{#browser-compatibility-notes\}

HTTP のみでのデプロイメント（開発／テスト）では、セキュアコンテキスト要件により、一部のブラウザーで Crypto API のエラーが表示される場合があります。本番環境のデプロイメントでは、必ずイングレス設定を通じて適切な TLS 証明書を用いた HTTPS を使用してください。

TLS のセットアップ手順については、[イングレス構成](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) を参照してください。

## 次のステップ \{#next-steps\}

- [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレス
- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムの設定
- [Helm メインガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール