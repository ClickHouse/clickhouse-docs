---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm を使用したクラウド環境へのデプロイ'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE、EKS、AKS 上に ClickStack をデプロイするためのクラウド特有の構成'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes クラウドデプロイ', '本番環境へのデプロイ']
---

このガイドでは、マネージド Kubernetes サービス上に ClickStack をデプロイする際のクラウド特有の構成について説明します。基本的なインストール手順については、[Helm による基本的なデプロイガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。



## Google Kubernetes Engine (GKE) {#google-kubernetes-engine-gke}

GKEへのデプロイ時には、クラウド固有のネットワーク動作により、特定の値を上書きする必要がある場合があります。

### LoadBalancer DNS解決の問題 {#loadbalancer-dns-resolution-issue}

GKEのLoadBalancerサービスは、Pod間通信がクラスタネットワーク内に留まらず外部IPに解決されるという内部DNS解決の問題を引き起こす可能性があります。これは特にOTELコレクタからOpAMPサーバーへの接続に影響します。

**症状:**

- OTELコレクタのログにクラスタIPアドレスに対する「connection refused」エラーが表示される
- OpAMP接続の失敗例: `dial tcp 34.118.227.30:4320: connect: connection refused`

**解決方法:**

OpAMPサーバーURLには完全修飾ドメイン名(FQDN)を使用します:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### その他のGKEに関する考慮事項 {#other-gke-considerations}


```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # お使いの LoadBalancer の外部 IP アドレスを指定してください

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


# 必要に応じて GKE の Pod ネットワーク用に調整する

clickhouse:
config:
clusterCidrs:

* &quot;10.8.0.0/16&quot;  # GKE で一般的に使用される範囲
* &quot;10.0.0.0/8&quot;   # その他の構成向けのフォールバック

```
```


## Amazon EKS {#amazon-eks}


EKS へのデプロイの場合は、次のような一般的な構成を検討してください。

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"
```


# EKS で一般的に使用される Pod CIDR
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"



# 本番環境で Ingress を有効にする

hyperdx:
ingress:
enabled: true
host: &quot;hyperdx.yourdomain.com&quot;
tls:
enabled: true

```
```


## Azure AKS {#azure-aks}


AKS へのデプロイの場合:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"
```


# AKS ポッドネットワーキング

clickhouse:
config:
clusterCidrs:

* &quot;10.244.0.0/16&quot;  # 一般的な AKS ポッド CIDR
* &quot;10.0.0.0/8&quot;

```
```


## 本番環境クラウドデプロイメントチェックリスト {#production-cloud-deployment-checklist}

任意のクラウドプロバイダーで ClickStack を本番環境にデプロイする前に:

- [ ] 外部ドメイン/IP で適切な `frontendUrl` を設定する
- [ ] HTTPS アクセスのために TLS 付き Ingress を設定する
- [ ] 接続の問題が発生している場合は、FQDN で `otel.opampServerUrl` を上書きする(特に GKE 上)
- [ ] Pod ネットワーク CIDR に合わせて `clickhouse.config.clusterCidrs` を調整する
- [ ] 本番環境ワークロード用の永続ストレージを設定する
- [ ] 適切なリソースリクエストと制限を設定する
- [ ] 監視とアラートを有効にする
- [ ] バックアップとディザスタリカバリを設定する
- [ ] 適切なシークレット管理を実装する


## 本番環境のベストプラクティス {#production-best-practices}

### リソース管理 {#resource-management}

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

### 高可用性 {#high-availability}

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

### 永続ストレージ {#persistent-storage}

データ保持のために永続ボリュームが設定されていることを確認してください:

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd" # クラウド固有のストレージクラスを使用
```

**クラウド固有のストレージクラス:**

- **GKE**: `pd-ssd` or `pd-balanced`
- **EKS**: `gp3` or `io2`
- **AKS**: `managed-premium` or `managed-csi`

### ブラウザ互換性に関する注意事項 {#browser-compatibility-notes}

HTTPのみのデプロイメント(開発/テスト環境)では、セキュアコンテキスト要件により一部のブラウザで暗号化APIエラーが表示される場合があります。本番環境のデプロイメントでは、Ingress設定を通じて適切なTLS証明書を使用したHTTPSを常に使用してください。

TLSセットアップ手順については、[Ingress設定](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup)を参照してください。


## 次のステップ {#next-steps}

- [設定ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - APIキー、シークレット、イングレス
- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムの設定
- [メインHelmガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本インストール
