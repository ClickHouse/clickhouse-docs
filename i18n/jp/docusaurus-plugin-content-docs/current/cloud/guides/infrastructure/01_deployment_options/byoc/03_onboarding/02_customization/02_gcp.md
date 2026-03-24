---
title: 'GCP カスタム設定'
slug: /cloud/reference/byoc/onboarding/customization-gcp
sidebar_label: 'GCP カスタム設定'
keywords: ['BYOC', 'クラウド', '自社クラウド持ち込み', 'オンボーディング', 'GCP', 'VPC']
description: '既存の GCP VPC に ClickHouse BYOC をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_gcp_subnet from '@site/static/images/cloud/reference/byoc-gcp-subnet.png';


## GCP 向けの顧客管理 VPC (BYO-VPC)  \{#customer-managed-vpc-gcp\}

ClickHouse Cloud に新しい VPC をプロビジョニングさせる代わりに、既存の VPC を使用して ClickHouse BYOC をデプロイする場合は、以下の手順に従ってください。この方法により、ネットワーク構成をより柔軟に制御でき、ClickHouse BYOC を既存のネットワークインフラストラクチャに統合できます。

### 既存の VPC を設定する \{#configure-existing-vpc\}

1. ClickHouse Kubernetes (GKE) クラスタ用に、[ClickHouse BYOC のサポート対象リージョン](/cloud/reference/supported-regions)で、少なくとも 1 つのプライベートサブネットを割り当てます。GKE クラスタノードに十分な IP アドレスを確保できるように、サブネットの CIDR 範囲は最低でも `/24` (例: 10.0.0.0/24) であることを確認してください。
2. プライベートサブネット内で、GKE クラスタのポッドに使用するセカンダリ IPv4 範囲を少なくとも 1 つ割り当てます。GKE クラスタのポッドに十分な IP アドレスを確保できるように、セカンダリ範囲は最低でも `/23` にしてください。
3. サブネットで **Private Google Access** を有効にします。これにより、外部 IP アドレスを必要とせずに、GKE ノードから Google API や各種サービスにアクセスできるようになります。

<Image img={byoc_gcp_subnet} size="lg" alt="Private Google Access が有効になっている、プライマリおよびセカンダリの IPv4 範囲を示した BYOC GCP サブネットの詳細" />

### ネットワーク接続を確保する \{#ensure-network-connectivity\}

**Cloud NAT Gateway**
VPC に [Cloud NAT gateway](https://cloud.google.com/nat/docs/overview) がデプロイされていることを確認してください。ClickHouse BYOC コンポーネントが Tailscale のコントロールプレーンと通信するには、アウトバウンドのインターネットアクセスが必要です。Tailscale は、プライベートな管理操作向けに、安全なゼロトラスト ネットワークを提供するために使用されます。Cloud NAT gateway は、外部 IP アドレスを持たないインスタンスに、このアウトバウンド接続を提供します。

**DNS Resolution**
VPC で DNS 名前解決が正常に機能しており、標準的な DNS 名をブロック、妨害、または上書きしていないことを確認してください。ClickHouse BYOC は、Tailscale のコントロールサーバーおよび ClickHouse のサービス endpoint を解決するために DNS に依存しています。DNS が利用できない、または誤って設定されている場合、BYOC サービスは接続に失敗したり、正常に動作しなくなったりする可能性があります。

### ClickHouse サポートへの連絡 \{#contact-clickhouse-support\}

上記の設定手順を完了したら、以下の情報を添えてサポートチケットを作成してください。

* ご利用の GCP プロジェクト ID
* サービスのデプロイ先とする GCP リージョン
* ご利用の VPC ネットワーク名
* ClickHouse 用に割り当てたサブネット名
* （任意）ClickHouse 専用のセカンダリ IPv4 範囲名。これは、プライベートサブネットに複数のセカンダリ IPv4 範囲があり、そのすべてが ClickHouse 用ではない場合にのみ必要です

弊社チームが設定を確認し、弊社側でプロビジョニングを完了します。