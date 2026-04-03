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
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png';
import byoc_aws_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-aws-existing-vpc-ui.png';


## AWS 向けの顧客管理 VPC (BYO-VPC) \{#customer-managed-vpc-aws\}

ClickHouse Cloud に新しい VPC をプロビジョニングさせる代わりに、既存の VPC を使用して ClickHouse BYOC をデプロイしたい場合は、以下の手順に従ってください。このアプローチにより、ネットワーク構成をより細かく制御でき、ClickHouse BYOC を既存のネットワークインフラストラクチャに統合できます。

<VerticalStepper headerLevel="h3">
  ### 既存の VPC を設定する

  1. VPC に `clickhouse-byoc="true"` タグを付与します。
  2. ClickHouse Cloud が使用できるように、3 つの異なるアベイラビリティーゾーンにまたがる少なくとも 3 つのプライベートサブネットを割り当てます。
  3. ClickHouse のデプロイメントに十分な IP アドレスを確保できるように、各サブネットの CIDR 範囲が少なくとも `/23` (例: 10.0.0.0/23) であることを確認します。
  4. 各サブネットに `kubernetes.io/role/internal-elb=1` と `clickhouse-byoc="true"` のタグを追加し、ロードバランサーが適切に設定されるようにします。

  <Image img={byoc_subnet_1} size="lg" alt="BYOC VPC サブネット" />

  <Image img={byoc_subnet_2} size="lg" alt="BYOC VPC サブネットタグ" />

  ### S3 Gateway Endpoint を設定する

  VPC に S3 Gateway Endpoint がまだ設定されていない場合は、VPC と Amazon S3 間の安全でプライベートな通信を有効にするために作成する必要があります。このエンドポイントにより、ClickHouse サービスはパブリックインターネットを経由せずに S3 にアクセスできます。設定例については、以下のスクリーンショットを参照してください。

  <Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 エンドポイント" />

  ### ネットワーク接続を確保する

  **アウトバウンドのインターネットアクセス**
  ClickHouse BYOC コンポーネントが Tailscale のコントロールプレーンと通信できるようにするため、VPC では少なくともアウトバウンドのインターネットアクセスを許可する必要があります。Tailscale は、プライベートな管理操作に対して安全なゼロトラストネットワークを提供するために使用されます。Tailscale の初回登録と初期セットアップにはパブリックインターネット接続が必要であり、これは直接接続するか、NAT ゲートウェイ経由で実現できます。この接続は、BYOC デプロイメントのプライバシーとセキュリティの両方を維持するうえで必要です。

  **DNS 名前解決**
  VPC で DNS 名前解決が正常に機能しており、標準の DNS 名をブロック、干渉、または上書きしていないことを確認してください。ClickHouse BYOC は、Tailscale のコントロールサーバーおよび ClickHouse のサービスエンドポイントを名前解決するために DNS に依存しています。DNS が利用できない場合や設定に誤りがある場合、BYOC サービスは接続に失敗したり、正常に動作しなくなったりする可能性があります。

  ### AWS アカウントを設定する

  初期 BYOC セットアップでは、ClickHouse Cloud の BYOC コントローラーがインフラストラクチャを管理できるようにするための特権 IAM ロール (`ClickHouseManagementRole`) が作成されます。これは、[CloudFormation テンプレート](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml)または [Terraform モジュール](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)のいずれかを使用して実行できます。

  `BYO-VPC` セットアップ向けにデプロイする場合は、`IncludeVPCWritePermissions` パラメーターを `false` に設定し、ClickHouse Cloud にお客様が管理する VPC を変更する権限が付与されないようにします。

  :::note
  ClickHouse の実行に必要なストレージバケット、Kubernetes クラスター、およびコンピュートリソースは、この初期セットアップには含まれていません。これらは後続の手順でプロビジョニングされます。VPC はお客様が管理しますが、それでも ClickHouse Cloud には、Kubernetes クラスター、サービスアカウント用の IAM ロール、S3 バケット、および AWS アカウント内のその他の重要なリソースを作成および管理するための IAM 権限が必要です。
  :::

  #### 代替の Terraform モジュール

  CloudFormation ではなく Terraform を使用したい場合は、次のモジュールを使用します。

  ```hcl
  module "clickhouse_onboarding" {
    source                     = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
    byoc_env                   = "production"
    include_vpc_write_permissions = false
  }
  ```

  ### BYOC インフラストラクチャをセットアップする

  ClickHouse Cloud コンソールで [BYOC セットアップページ](https://console.clickhouse.cloud/byocOnboarding) に移動し、次の項目を設定します。

  1. **VPC Configuration** で、**Use existing VPC** を選択します。
  2. **VPC ID** を入力します (例: `vpc-0bb751a5b888ad123`) 。
  3. 先ほど設定した 3 つのサブネットの **Private subnet IDs** を入力します。
  4. パブリック向けロードバランサーが必要な場合は、必要に応じて **Public subnet IDs** を入力します。
  5. **Setup Infrastructure** をクリックしてプロビジョニングを開始します。

  <Image img={byoc_aws_existing_vpc_ui} size="lg" alt="Use existing VPC が選択された ClickHouse Cloud BYOC セットアップ UI" />

  :::note
  新しいリージョンのセットアップには最大 40 分かかる場合があります。
  :::
</VerticalStepper>

## 顧客管理 IAM ロール

高度なセキュリティ要件や厳格なコンプライアンス ポリシーを持つ組織では、ClickHouse Cloud に IAM ロールを作成させる代わりに、独自の IAM ロールを指定できます。この方法により、IAM 権限を完全に制御でき、組織のセキュリティ ポリシーを適用できます。

:::info
顧客管理 IAM ロールはプライベート プレビュー段階です。この機能が必要な場合は、具体的な要件と導入時期について ClickHouse Support までお問い合わせください。

この機能が利用可能になると、次のことができるようになります。

* ClickHouse Cloud が使用する事前設定済みの IAM ロールを指定する
* クロスアカウント アクセスに使用される `ClickHouseManagementRole` について、IAM 関連権限への書き込み権限を削除する
* ロール権限と信頼関係を完全に制御する
  :::

ClickHouse Cloud がデフォルトで作成する IAM ロールについては、[BYOC Privilege Reference](/cloud/reference/byoc/reference/privilege) を参照してください。