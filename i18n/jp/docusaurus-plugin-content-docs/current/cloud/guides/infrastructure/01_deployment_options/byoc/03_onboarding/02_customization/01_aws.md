---
title: 'AWS カスタマイズ設定'
slug: /cloud/reference/byoc/onboarding/customization-aws
sidebar_label: 'AWS カスタマイズ設定'
keywords: ['BYOC', 'クラウド', 'Bring Your Own Cloud', 'オンボーディング', 'AWS', 'VPC']
description: '既存の AWS VPC に ClickHouse BYOC をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## AWS 向けの顧客管理 VPC (BYO-VPC) \{#customer-managed-vpc-aws\}

ClickHouse Cloud に新しい VPC をプロビジョニングさせる代わりに、既存の VPC を使用して ClickHouse BYOC をデプロイしたい場合は、以下の手順に従ってください。このアプローチにより、ネットワーク構成をより細かく制御でき、ClickHouse BYOC を既存のネットワークインフラストラクチャに統合できます。

### 既存の VPC を設定する \{#configure-existing-vpc\}

1. VPC に `clickhouse-byoc="true"` タグを付与します。
2. ClickHouse Cloud で使用できるよう、3 つの異なるアベイラビリティゾーンにまたがるプライベートサブネットを少なくとも 3 つ用意します。
3. ClickHouse デプロイメントに十分な IP アドレスを確保するため、各サブネットの CIDR 範囲が少なくとも `/23` (例: 10.0.0.0/23) であることを確認します。
4. ロードバランサーが正しく設定されるよう、各サブネットに `kubernetes.io/role/internal-elb=1` および `clickhouse-byoc="true"` のタグを追加します。

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC サブネット" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC サブネットタグ" />

### S3 Gateway Endpoint を設定 \{#configure-s3-endpoint\}

VPC に S3 Gateway Endpoint がまだ設定されていない場合は、VPC と Amazon S3 間の安全なプライベート通信を有効にするため、作成する必要があります。この endpoint により、ClickHouse サービスはパブリックインターネットを経由せずに S3 へアクセスできます。設定例については、以下のスクリーンショットを参照してください。

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### ネットワーク接続を確保する \{#ensure-network-connectivity\}

**アウトバウンドのインターネットアクセス**
ClickHouse BYOC コンポーネントが Tailscale のコントロールプレーンと通信できるようにするため、VPC では少なくともアウトバウンドのインターネットアクセスを許可する必要があります。Tailscale は、プライベートな管理操作に対して安全なゼロトラストネットワークを提供するために使用されます。Tailscale の初回登録と初期セットアップにはパブリックインターネット接続が必要であり、これは直接接続するか、NAT ゲートウェイ経由で実現できます。この接続は、BYOC デプロイメントのプライバシーとセキュリティの両方を維持するうえで必要です。

**DNS 名前解決**
VPC で DNS 名前解決が正常に機能しており、標準の DNS 名をブロック、干渉、または上書きしていないことを確認してください。ClickHouse BYOC は、Tailscale のコントロールサーバーおよび ClickHouse のサービスエンドポイントを名前解決するために DNS に依存しています。DNS が利用できない場合や設定に誤りがある場合、BYOC サービスは接続に失敗したり、正常に動作しなくなったりする可能性があります。

### AWS アカウントを設定する \{#configure-aws-account\}

ClickHouse Cloud が既存の VPC にデプロイできるようにするには、AWS アカウント内で必要な IAM 権限を付与する必要があります。これは、標準的なオンボーディングで使用されるプロセスと同様に、ブートストラップ CloudFormation スタックまたは Terraform モジュールを起動することで行います。

1. 必要な IAM ロールを作成するために、[CloudFormation template](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) または [Terraform module](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) をデプロイします。
2. ClickHouse Cloud に顧客管理 VPC を変更する権限が付与されないよう、`IncludeVPCWritePermissions` パラメータを `false` に設定します。
3. これにより、AWS アカウント内に `ClickHouseManagementRole` が作成され、BYOC デプロイメントのプロビジョニングと管理に必要な最小限の権限のみが ClickHouse Cloud に付与されます。

:::note
VPC はお客様が管理しますが、ClickHouse Cloud が Kubernetes クラスタ、サービスアカウント用の IAM ロール、S3 バケット、および AWS アカウント内のその他の重要なリソースを作成および管理するには、引き続き IAM 権限が必要です。
:::

### ClickHouse サポートへのお問い合わせ \{#contact-clickhouse-support\}

上記の設定手順が完了したら、以下の情報を含めてサポートチケットを作成してください。

* AWS アカウント ID
* サービスをデプロイする AWS リージョン
* VPC ID
* ClickHouse 用に割り当てたプライベートサブネット ID
* それらのサブネットが配置されているアベイラビリティゾーン

弊社チームで設定内容を確認し、弊社側でプロビジョニングを完了します。

## 顧客管理 IAM ロール \{#customer-managed-iam-roles\}

高度なセキュリティ要件や厳格なコンプライアンス ポリシーを持つ組織では、ClickHouse Cloud に IAM ロールを作成させる代わりに、独自の IAM ロールを指定できます。この方法により、IAM 権限を完全に制御でき、組織のセキュリティ ポリシーを適用できます。

:::info
顧客管理 IAM ロールは現在、プライベート プレビュー段階です。この機能が必要な場合は、具体的な要件と導入時期について ClickHouse サポート までお問い合わせください。

この機能が利用可能になると、次のことができるようになります。

* ClickHouse Cloud が使用する事前設定済みの IAM ロールを指定する
* クロスアカウント アクセスに使用される `ClickHouseManagementRole` について、IAM 関連権限への書き込み権限を削除する
* ロール権限と信頼関係を完全に制御する
  :::

ClickHouse Cloud がデフォルトで作成する IAM ロールについては、[BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge) を参照してください。