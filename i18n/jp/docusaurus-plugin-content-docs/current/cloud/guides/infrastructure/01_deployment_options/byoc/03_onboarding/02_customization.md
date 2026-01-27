---
title: 'カスタマイズ設定'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: 'カスタマイズ設定'
keywords: ['BYOC', 'クラウド', '独自クラウド利用', 'オンボーディング']
description: '独自のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## お客様管理の VPC (BYO-VPC) \{#customer-managed-vpc\}

:::note
これは現在 **AWS** のみサポートされています。GCP のサポートはロードマップに含まれています。
:::

ClickHouse Cloud に新しい VPC をプロビジョニングさせるのではなく、既存の VPC 上に ClickHouse BYOC をデプロイしたい場合は、以下の手順に従ってください。このアプローチにより、ネットワーク構成をより細かく制御でき、ClickHouse BYOC を既存のネットワークインフラストラクチャに統合できます。

### 既存の VPC を設定する \{#configure-existing-vpc\}

1. VPC に `clickhouse-byoc="true"` というタグを付与します。
2. ClickHouse Cloud が利用できるように、3 つの異なるアベイラビリティゾーンにそれぞれ 1 つずつ、合計 3 つ以上のプライベートサブネットを用意します。
3. 各サブネットについて、ClickHouse デプロイメント向けに十分な IP アドレスを提供できるよう、最小でも `/23`（例: 10.0.0.0/23）の CIDR ブロックを割り当てます。
4. 適切なロードバランサー構成を有効にするため、各サブネットに `kubernetes.io/role/internal-elb=1` および `clickhouse-byoc="true"` のタグを追加します。

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC サブネット" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC サブネットタグ" />

### S3 Gateway エンドポイントを構成する \{#configure-s3-endpoint\}

VPC にまだ S3 Gateway エンドポイントが構成されていない場合は、VPC と Amazon S3 間の安全でプライベートな通信を有効にするために作成する必要があります。このエンドポイントによって、ClickHouse サービスはパブリックインターネットを経由せずに S3 にアクセスできます。設定例については、以下のスクリーンショットを参照してください。

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### ネットワーク接続性を確保する \{#ensure-network-connectivity\}

**アウトバウンドインターネットアクセス**  
VPC は少なくともアウトバウンドのインターネットアクセスを許可し、ClickHouse BYOC コンポーネントが Tailscale コントロールプレーンと通信できるようにする必要があります。Tailscale は、プライベートな管理オペレーション向けに安全なゼロトラストネットワークを提供するために使用されます。Tailscale との初期登録およびセットアップにはパブリックインターネットへの接続が必要であり、これは直接、または NAT ゲートウェイ経由で確保できます。この接続は、BYOC デプロイメントのプライバシーとセキュリティの両方を維持するために必須です。

**DNS 解決**  
VPC で DNS 解決が正しく機能しており、標準的な DNS 名をブロック・干渉・上書きしていないことを確認してください。ClickHouse BYOC は、Tailscale コントロールサーバーおよび ClickHouse サービスエンドポイントの解決に DNS を利用します。DNS が利用できない、または誤って構成されている場合、BYOC サービスは接続に失敗したり、正常に動作しなくなる可能性があります。

### AWS アカウントを設定する \{#configure-aws-account\}

ClickHouse Cloud を既存の VPC にデプロイできるようにするには、AWS アカウント内で必要な IAM 権限を付与する必要があります。これは、通常のオンボーディングプロセスと同様に、ブートストラップ用の CloudFormation スタックまたは Terraform モジュールを起動することで行います。

1. 必要な IAM ロールを作成するために、[CloudFormation テンプレート](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) または [Terraform モジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz) をデプロイします。
2. ClickHouse Cloud が、お客様管理の VPC を変更する権限を持たないようにするため、`IncludeVPCWritePermissions` パラメータを `false` に設定します。
3. これにより AWS アカウント内に `ClickHouseManagementRole` が作成され、ClickHouse Cloud には BYOC デプロイメントをプロビジョニングおよび管理するために必要な最小限の権限のみが付与されます。

:::note
VPC はお客様が管理しますが、ClickHouse Cloud は引き続き、お客様の AWS アカウント内で Kubernetes クラスター、サービスアカウント用 IAM ロール、S3 バケット、その他の必須リソースを作成および管理するための IAM 権限を必要とします。
:::

### ClickHouse サポートへのお問い合わせ \{#contact-clickhouse-support\}

上記の設定手順を完了したら、以下の情報を添えてサポートチケットを作成してください。

* AWS アカウント ID
* サービスをデプロイする予定の AWS リージョン
* VPC ID
* ClickHouse 用に確保したプライベートサブネット ID
* 上記サブネットが属するアベイラビリティゾーン

弊社チームが設定内容を確認し、弊社側でプロビジョニングを完了します。 

## お客様管理の IAM ロール \{#customer-managed-iam-roles\}

高度なセキュリティ要件や厳格なコンプライアンス・ポリシーを持つ組織の場合、ClickHouse Cloud に IAM ロールを作成させる代わりに、お客様側で用意した IAM ロールを使用できます。このアプローチにより、IAM 権限を完全に制御でき、組織のセキュリティ・ポリシーを徹底できます。

:::info
お客様管理の IAM ロールは現在プライベートプレビュー段階です。この機能が必要な場合は、具体的な要件やスケジュールについてご相談いただくため、ClickHouse Support までお問い合わせください。

利用可能になった場合、この機能により次のことが可能になります。

* ClickHouse Cloud が使用する、事前に構成された IAM ロールを提供する
* クロスアカウントアクセスに使用される `ClickHouseManagementRole` の IAM 関連権限に対する書き込み権限を削除する
* ロールの権限および信頼関係を完全に制御する
:::

ClickHouse Cloud がデフォルトで作成する IAM ロールに関する情報については、[BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge) を参照してください。