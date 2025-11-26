---
slug: /use-cases/observability/clickstack/deployment/helm-cloud
title: 'Helm によるクラウドデプロイメント'
pagination_prev: null
pagination_next: null
sidebar_position: 5
description: 'GKE、EKS、AKS 上で ClickStack をデプロイするためのクラウド固有の構成'
doc_type: 'guide'
keywords: ['ClickStack GKE', 'ClickStack EKS', 'ClickStack AKS', 'Kubernetes クラウドデプロイメント', '本番環境デプロイメント']
---

このガイドでは、マネージド Kubernetes サービス上に ClickStack をデプロイする際のクラウド固有の構成について説明します。基本的なインストール手順については、[Helm によるデプロイメントのメインガイド](/docs/use-cases/observability/clickstack/deployment/helm)を参照してください。



## Google Kubernetes Engine (GKE)

GKE にデプロイする際、クラウド固有のネットワーク動作により、いくつかの値をオーバーライドする必要が生じる場合があります。

### LoadBalancer の DNS 解決の問題

GKE の LoadBalancer Service により、ポッド間通信がクラスター ネットワーク内にとどまらず、外部 IP に解決されてしまう内部 DNS 解決の問題が発生することがあります。これは特に、OTel collector から OpAMP サーバーへの接続に影響します。

**症状:**

* OTel collector のログに、クラスター IP アドレスに対する「connection refused」エラーが出力される
* 次のような OpAMP 接続エラーが発生する: `dial tcp 34.118.227.30:4320: connect: connection refused`

**解決策:**

OpAMP サーバーの URL には、完全修飾ドメイン名 (FQDN) を使用してください:

```shell
helm install my-clickstack clickstack/clickstack \
  --set hyperdx.frontendUrl="http://your-external-ip-or-domain.com" \
  --set otel.opampServerUrl="http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```

### その他のGKEに関する考慮事項


```yaml
# values-gke.yaml
hyperdx:
  frontendUrl: "http://34.123.61.99"  # LoadBalancerの外部IPを使用

otel:
  opampServerUrl: "http://my-clickstack-clickstack-app.default.svc.cluster.local:4320"
```


# 必要に応じて GKE のポッドネットワークに合わせて調整する

clickhouse:
config:
clusterCidrs:

* &quot;10.8.0.0/16&quot;  # GKE で一般的に使用される範囲
* &quot;10.0.0.0/8&quot;   # その他の構成向けのフォールバック

```
```


## Amazon EKS {#amazon-eks}



EKS へのデプロイ時には、次の一般的な構成を検討してください。

```yaml
# values-eks.yaml
hyperdx:
  frontendUrl: "http://your-alb-domain.com"
```


# EKS では一般的に次のポッド CIDR を使用します
clickhouse:
  config:
    clusterCidrs:
      - "192.168.0.0/16"
      - "10.0.0.0/8"



# 本番環境用にイングレスを有効にする

hyperdx:
ingress:
enabled: true
host: &quot;hyperdx.yourdomain.com&quot;
tls:
enabled: true

```
```


## Azure AKS {#azure-aks}



AKS でのデプロイメントの場合:

```yaml
# values-aks.yaml
hyperdx:
  frontendUrl: "http://your-azure-lb.com"
```


# AKS ポッド ネットワーキング

clickhouse:
config:
clusterCidrs:

* &quot;10.244.0.0/16&quot;  # 一般的な AKS ポッド CIDR
* &quot;10.0.0.0/8&quot;

```
```


## 本番環境向けクラウドデプロイチェックリスト {#production-cloud-deployment-checklist}

任意のクラウドプロバイダー上の本番環境に ClickStack をデプロイする前に、以下を確認・実施してください。

- [ ] 外部ドメイン/IP を使用して、適切な `frontendUrl` を設定する
- [ ] HTTPS アクセスのために TLS 対応のイングレスをセットアップする
- [ ] 接続の問題が発生する場合（特に GKE 上）、`otel.opampServerUrl` を FQDN（完全修飾ドメイン名）を指定して上書き設定する
- [ ] ポッドネットワーク CIDR に合わせて `clickhouse.config.clusterCidrs` を調整する
- [ ] 本番ワークロード向けに永続ストレージを構成する
- [ ] 適切なリソース要求値と制限値を設定する
- [ ] 監視とアラートを有効化する
- [ ] バックアップおよび災害復旧を構成する
- [ ] 適切なシークレット管理を実装する



## 本番運用のベストプラクティス

### リソース管理

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

### 高可用性

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

### 永続ストレージ

データを保持できるよう、PersistentVolume を適切に設定していることを確認します。

```yaml
clickhouse:
  persistence:
    enabled: true
    size: 100Gi
    storageClass: "fast-ssd"  # クラウド固有のストレージクラスを使用する
```

**クラウド固有の StorageClass:**

* **GKE**: `pd-ssd` または `pd-balanced`
* **EKS**: `gp3` または `io2`
* **AKS**: `managed-premium` または `managed-csi`

### ブラウザ互換性に関する注意事項

HTTP のみのデプロイメント（開発／テスト用途）の場合、一部のブラウザでは、セキュアコンテキスト要件により Crypto API のエラーが表示されることがあります。本番環境のデプロイメントでは、常にイングレス構成を通じて、適切な TLS 証明書付きの HTTPS を使用してください。

TLS のセットアップ手順については、[Ingress configuration](/docs/use-cases/observability/clickstack/deployment/helm-configuration#ingress-setup) を参照してください。


## 次のステップ {#next-steps}

- [構成ガイド](/docs/use-cases/observability/clickstack/deployment/helm-configuration) - API キー、シークレット、イングレス
- [デプロイメントオプション](/docs/use-cases/observability/clickstack/deployment/helm-deployment-options) - 外部システムの構成
- [メイン Helm ガイド](/docs/use-cases/observability/clickstack/deployment/helm) - 基本的なインストール手順
