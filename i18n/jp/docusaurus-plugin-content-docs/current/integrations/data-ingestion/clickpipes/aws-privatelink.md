---
sidebar_label: 'ClickPipes 向け AWS PrivateLink'
description: 'AWS PrivateLink を使用して、ClickPipes とデータソース間の安全な接続を確立します。'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipes 向け AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes security', 'vpc endpoint', 'private connectivity', 'vpc resource']
---

import cp_service from '@site/static/images/integrations/data-ingestion/clickpipes/cp_service.png';
import cp_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_step0.png';
import cp_rpe_select from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_select.png';
import cp_rpe_step0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step0.png';
import cp_rpe_step1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step1.png';
import cp_rpe_step2 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step2.png';
import cp_rpe_step3 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_step3.png';
import cp_rpe_settings0 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings0.png';
import cp_rpe_settings1 from '@site/static/images/integrations/data-ingestion/clickpipes/cp_rpe_settings1.png';
import Image from '@theme/IdealImage';


# ClickPipes 用 AWS PrivateLink

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用して、VPC、AWS サービス、オンプレミスシステム、そして ClickHouse Cloud 間を、
トラフィックをパブリックインターネットに晒すことなく安全に接続できます。

このドキュメントでは、AWS PrivateLink の VPC エンドポイントを構成するための
ClickPipes のリバースプライベートエンドポイント機能について説明します。



## サポートされているClickPipesデータソース {#supported-sources}

ClickPipesのリバースプライベートエンドポイント機能は、以下のデータソースタイプに限定されています：

- Kafka
- Postgres
- MySQL


## サポートされているAWS PrivateLinkエンドポイントタイプ {#aws-privatelink-endpoint-types}

ClickPipesリバースプライベートエンドポイントは、以下のいずれかのAWS PrivateLinkアプローチで構成できます:

- [VPCリソース](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe用のMSKマルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

### VPCリソース {#vpc-resource}

VPCリソースには、[PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を使用してClickPipesからアクセスできます。このアプローチでは、データソースの前にロードバランサーを設定する必要がありません。

リソース構成は、特定のホストまたはRDSクラスターARNをターゲットにできます。
クロスリージョンはサポートされていません。

RDSクラスターからデータを取り込むPostgres CDCに推奨される選択肢です。

VPCリソースでPrivateLinkを設定するには:

1. リソースゲートウェイを作成する
2. リソース構成を作成する
3. リソース共有を作成する

<VerticalStepper headerLevel="h4">

#### リソースゲートウェイの作成 {#create-resource-gateway}

リソースゲートウェイは、VPC内の指定されたリソースへのトラフィックを受信するポイントです。

:::note
リソースゲートウェイに接続されたサブネットには、十分なIPアドレスが利用可能であることが推奨されます。
各サブネットには少なくとも`/26`サブネットマスクを使用することが推奨されます。

各VPCエンドポイント(各リバースプライベートエンドポイント)について、AWSはサブネットごとに16個の連続したIPアドレスブロックを必要とします(`/28`サブネットマスク)。
この要件が満たされない場合、リバースプライベートエンドポイントは失敗状態に遷移します。
:::

リソースゲートウェイは、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)から、または以下のコマンドで作成できます:

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

出力にはリソースゲートウェイIDが含まれ、次のステップで必要になります。

続行する前に、リソースゲートウェイが`Active`状態になるまで待つ必要があります。以下のコマンドを実行して状態を確認できます:

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### VPCリソース構成の作成 {#create-resource-configuration}

リソース構成はリソースゲートウェイに関連付けられ、リソースをアクセス可能にします。

リソース構成は、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)から、または以下のコマンドで作成できます:

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最もシンプルな[リソース構成タイプ](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)は、単一のリソース構成です。ARNを直接指定して構成するか、公開解決可能なIPアドレスまたはドメイン名を共有できます。

例えば、RDSクラスターのARNで構成するには:

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
パブリックアクセス可能なクラスターに対してリソース構成を作成することはできません。
クラスターがパブリックアクセス可能な場合は、リソース構成を作成する前にクラスターを変更してプライベートにするか、
代わりに[IP許可リスト](/integrations/clickpipes#list-of-static-ips)を使用する必要があります。
詳細については、[AWSドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)を参照してください。
:::

出力にはリソース構成ARNが含まれ、次のステップで必要になります。また、VPCリソースでClickPipe接続を設定する際に必要となるリソース構成IDも含まれます。

#### リソース共有の作成 {#create-resource-share}


リソースを共有するには、Resource-Shareが必要です。これはResource Access Manager（RAM）を通じて実現されます。

Resource-ConfigurationをResource-Shareに追加するには、[AWSコンソール](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)を使用するか、ClickPipesアカウントID `072088201116`（arn:aws:iam::072088201116:root）を指定して以下のコマンドを実行します。

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

出力にはResource-Share ARNが含まれます。これはVPCリソースを使用したClickPipe接続のセットアップに必要となります。

VPCリソースを使用して[Reverseプライベートエンドポイントを持つClickPipeを作成](#creating-clickpipe)する準備が整いました。以下の設定が必要です。

- `VPC endpoint type`を`VPC Resource`に設定します。
- `Resource configuration ID`をステップ2で作成したResource-ConfigurationのIDに設定します。
- `Resource share ARN`をステップ3で作成したResource-ShareのARNに設定します。

VPCリソースを使用したPrivateLinkの詳細については、[AWSドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を参照してください。

</VerticalStepper>

### MSKマルチVPC接続 {#msk-multi-vpc}

[マルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)は、AWS MSKの組み込み機能であり、単一のMSKクラスタに複数のVPCを接続できます。
プライベートDNSサポートは標準で提供されており、追加の設定は不要です。
クロスリージョンはサポートされていません。

これはMSK向けClickPipesの推奨オプションです。
詳細については、[はじめに](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)ガイドを参照してください。

:::info
MSKクラスタポリシーを更新し、`072088201116`を許可されたプリンシパルとしてMSKクラスタに追加してください。
詳細については、[クラスタポリシーのアタッチ](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)に関するAWSガイドを参照してください。
:::

接続のセットアップ方法については、[ClickPipes向けMSKセットアップガイド](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)を参照してください。

### VPCエンドポイントサービス {#vpc-endpoint-service}

[VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)は、データソースをClickPipesと共有するもう一つの方法です。
データソースの前段にNLB（Network Load Balancer）をセットアップし、
VPCエンドポイントサービスがNLBを使用するように設定する必要があります。

VPCエンドポイントサービスは[プライベートDNSで設定](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)でき、
ClickPipes VPC内でアクセス可能になります。

以下の場合に推奨される選択肢です。

- プライベートDNSサポートが必要なオンプレミスKafkaセットアップ
- [Postgres CDCのクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSKクラスタのクロスリージョン接続。サポートが必要な場合は、ClickHouseサポートチームにお問い合わせください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipesアカウントID `072088201116`を、VPCエンドポイントサービスの許可されたプリンシパルに追加してください。
詳細については、[権限の管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)に関するAWSガイドを参照してください。
:::

:::info
ClickPipes向けに[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)を設定できます。VPCエンドポイントサービスの許可されたリージョンに[ClickPipeのリージョン](#aws-privatelink-regions)を追加してください。
:::


## リバースプライベートエンドポイントを使用したClickPipeの作成 {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt='ClickPipes service' size='md' border />

2. 左側メニューの`Data Sources`ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt='Select imports' size='lg' border />

3. データソースとしてKafkaまたはPostgresのいずれかを選択します。

<Image img={cp_rpe_select} alt='Select data source' size='lg' border />

4. `Reverse private endpoint`オプションを選択します。

<Image
  img={cp_rpe_step0}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

5. 既存のリバースプライベートエンドポイントのいずれかを選択するか、新しいエンドポイントを作成します。

:::info
RDSでクロスリージョンアクセスが必要な場合は、VPCエンドポイントサービスを作成する必要があります。
[このガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)がセットアップの参考になります。

同一リージョン内でのアクセスの場合は、VPCリソースの作成を推奨します。
:::

<Image
  img={cp_rpe_step1}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

6. 選択したエンドポイントタイプに必要なパラメータを指定します。

<Image
  img={cp_rpe_step2}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

    - VPCリソースの場合:設定共有ARNと設定IDを指定します。
    - MSKマルチVPCの場合:クラスタARNと作成したエンドポイントで使用する認証方法を指定します。
    - VPCエンドポイントサービスの場合:サービス名を指定します。

7. `Create`をクリックし、リバースプライベートエンドポイントの準備が完了するまで待ちます。

   新しいエンドポイントを作成する場合、セットアップに時間がかかります。
   エンドポイントの準備が完了すると、ページは自動的に更新されます。
   VPCエンドポイントサービスの場合、AWSコンソールで接続リクエストの承認が必要になることがあります。

<Image
  img={cp_rpe_step3}
  alt='Select reverse private endpoint'
  size='lg'
  border
/>

8. エンドポイントの準備が完了したら、DNS名を使用してデータソースに接続できます。

   エンドポイントのリストで、利用可能なエンドポイントのDNS名を確認できます。
   これは、ClickPipesが内部的にプロビジョニングしたDNS名、またはPrivateLinkサービスから提供されるプライベートDNS名のいずれかです。
   DNS名は完全なネットワークアドレスではないため、
   データソースに応じてポート番号を追加してください。

   MSK接続文字列はAWSコンソールで確認できます。

   DNS名の完全なリストを表示するには、クラウドサービス設定からアクセスしてください。

</VerticalStepper>


## 既存のリバースプライベートエンドポイントの管理 {#managing-existing-endpoints}

ClickHouse Cloudサービスの設定で既存のリバースプライベートエンドポイントを管理できます:

<VerticalStepper headerLevel="list">

1. サイドバーで`Settings`ボタンを見つけてクリックします。

   <Image
     img={cp_rpe_settings0}
     alt='ClickHouse Cloudの設定'
     size='lg'
     border
   />

2. `ClickPipe reverse private endpoints`セクション内の`Reverse private endpoints`をクリックします。

   <Image
     img={cp_rpe_settings1}
     alt='ClickHouse Cloudの設定'
     size='md'
     border
   />

   リバースプライベートエンドポイントの詳細情報がフライアウトに表示されます。

   エンドポイントはここから削除できます。削除すると、このエンドポイントを使用しているすべてのClickPipeに影響します。

</VerticalStepper>


## サポートされているAWSリージョン {#aws-privatelink-regions}

ClickPipesにおけるAWS PrivateLinkのサポートは、特定のAWSリージョンに限定されています。
利用可能なリージョンについては、[ClickPipesリージョンリスト](/integrations/clickpipes#list-of-static-ips)を参照してください。

この制限は、クロスリージョン接続が有効になっているPrivateLink VPCエンドポイントサービスには適用されません。


## 制限事項 {#limitations}

ClickHouse Cloudで作成されたClickPipes用のAWS PrivateLinkエンドポイントは、ClickHouse Cloudサービスと同じAWSリージョンに作成されることは保証されていません。

現在、クロスリージョン接続をサポートしているのはVPCエンドポイントサービスのみです。

プライベートエンドポイントは特定のClickHouseサービスに紐付けられており、サービス間での転用はできません。
単一のClickHouseサービスに対する複数のClickPipesは、同じエンドポイントを再利用できます。
