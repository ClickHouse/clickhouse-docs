---
sidebar_label: 'ClickPipes 用 AWS PrivateLink'
description: 'AWS PrivateLink を使用して、ClickPipes とデータソースとの間にセキュアな接続を確立します。'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipes 用 AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes セキュリティ', 'VPC エンドポイント', 'プライベート接続', 'VPC リソース']
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


# ClickPipes 向け AWS PrivateLink

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用すると、VPC、AWS サービス、オンプレミス環境、および ClickHouse Cloud 間で、安全な接続を確立できます。このとき、トラフィックをパブリックインターネットに公開する必要はありません。

本ドキュメントでは、AWS PrivateLink の VPC エンドポイントを構成するための、ClickPipes のリバースプライベートエンドポイント機能について説明します。



## サポートされている ClickPipes データソース {#supported-sources}

ClickPipes のリバースプライベートエンドポイント機能は、以下の
データソースタイプでのみ利用できます:
- Kafka
- Postgres
- MySQL
- MongoDB



## サポートされているAWS PrivateLinkエンドポイントタイプ {#aws-privatelink-endpoint-types}

ClickPipesリバースプライベートエンドポイントは、以下のいずれかのAWS PrivateLinkアプローチで構成できます：

- [VPCリソース](#vpc-resource)
- [MSK ClickPipe用のMSKマルチVPC接続](#msk-multi-vpc)
- [VPCエンドポイントサービス](#vpc-endpoint-service)

### VPCリソース {#vpc-resource}

:::info
クロスリージョンはサポートされていません。
:::

VPCリソースは、[PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を使用してClickPipesからアクセスできます。このアプローチでは、データソースの前にロードバランサーを設定する必要はありません。

リソース構成は、特定のホストまたはRDSクラスターARNを対象として設定できます。

RDSクラスターからデータを取り込むPostgreSQL CDC（変更データキャプチャ）には、この方法が推奨されます。

VPCリソースでPrivateLinkを設定するには：

1. リソースゲートウェイを作成する
2. リソース構成を作成する
3. リソース共有を作成する

<VerticalStepper headerLevel="h4">

#### リソースゲートウェイを作成する {#create-resource-gateway}

リソースゲートウェイは、VPC内の指定されたリソースへのトラフィックを受信するポイントです。

:::note
リソースゲートウェイに接続されたサブネットには、十分なIPアドレスが利用可能であることが推奨されます。
各サブネットには少なくとも`/26`サブネットマスクを使用することが推奨されます。

各VPCエンドポイント（各リバースプライベートエンドポイント）について、AWSはサブネットごとに連続した16個のIPアドレスブロック（`/28`サブネットマスク）を必要とします。
この要件が満たされない場合、リバースプライベートエンドポイントは失敗状態に遷移します。
:::

リソースゲートウェイは、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)から、または以下のコマンドで作成できます：

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

出力にはリソースゲートウェイIDが含まれます。これは次のステップで必要になります。

続行する前に、リソースゲートウェイが`Active`状態になるまで待つ必要があります。以下のコマンドを実行して状態を確認できます：

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### VPCリソース構成を作成する {#create-resource-configuration}

リソース構成はリソースゲートウェイに関連付けられ、リソースをアクセス可能にします。

リソース構成は、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)から、または以下のコマンドで作成できます：

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最もシンプルな[リソース構成タイプ](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)は、単一のリソース構成です。ARNを直接指定して構成するか、公開解決可能なIPアドレスまたはドメイン名を共有できます。

例えば、RDSクラスターのARNで構成するには：

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
公開アクセス可能なクラスターに対してリソース構成を作成することはできません。
クラスターが公開アクセス可能な場合は、リソース構成を作成する前にクラスターを変更してプライベートにするか、
代わりに[IP許可リスト](/integrations/clickpipes#list-of-static-ips)を使用する必要があります。
詳細については、[AWSドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)を参照してください。
:::

出力にはリソース構成ARNが含まれます。これは次のステップで必要になります。また、リソース構成IDも含まれます。これはVPCリソースでClickPipe接続を設定する際に必要になります。

#### リソース共有を作成する {#create-resource-share}

リソースを共有するには、リソース共有が必要です。これはResource Access Manager（RAM）を通じて実現されます。


Resource-ConfigurationをResource-Shareに配置するには、[AWSコンソール](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)を使用するか、ClickPipesアカウントID `072088201116`（arn:aws:iam::072088201116:root）を指定して以下のコマンドを実行します。

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

出力にはResource-Share ARNが含まれます。これはVPCリソースを使用したClickPipe接続のセットアップに必要となります。

VPCリソースを使用して[リバースプライベートエンドポイントを持つClickPipeを作成](#creating-clickpipe)する準備が整いました。以下の設定が必要です。

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
MSKクラスタポリシーを更新し、`072088201116`を許可されたプリンシパルとしてMSKクラスタに追加します。
詳細については、[クラスタポリシーのアタッチ](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)に関するAWSガイドを参照してください。
:::

接続のセットアップ方法については、[ClickPipes向けMSKセットアップガイド](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)を参照してください。

### VPCエンドポイントサービス {#vpc-endpoint-service}

[VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)は、データソースをClickPipesと共有するもう一つの方法です。
データソースの前にNLB（Network Load Balancer）をセットアップし、
VPCエンドポイントサービスがNLBを使用するように設定する必要があります。

VPCエンドポイントサービスは[プライベートDNSで設定](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)でき、ClickPipes VPC内でアクセス可能になります。

以下の場合に推奨される選択肢です。

- プライベートDNSサポートが必要なオンプレミスKafkaセットアップ
- [PostgreSQL CDC（変更データキャプチャ）のクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSKクラスタのクロスリージョン接続。サポートが必要な場合は、ClickHouseサポートチームにお問い合わせください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipesアカウントID `072088201116`を、VPCエンドポイントサービスの許可されたプリンシパルに追加します。
詳細については、[権限の管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)に関するAWSガイドを参照してください。
:::

:::info
ClickPipes向けに[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)を設定できます。VPCエンドポイントサービスの許可されたリージョンに[ClickPipeのリージョン](#aws-privatelink-regions)を追加してください。
:::


## リバースプライベートエンドポイントを使用して ClickPipe を作成する {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes サービス" size="md" border/>

2. 左側メニューの `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. データソースとして Kafka か Postgres のいずれかを選択します。

<Image img={cp_rpe_select} alt="データソースの選択" size="lg" border/>

4. `Reverse private endpoint` オプションを選択します。

<Image img={cp_rpe_step0} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

5. 既存のリバースプライベートエンドポイントを選択するか、新しく作成します。

:::info
RDS でリージョンをまたいだアクセスが必要な場合は、VPC エンドポイントサービスを作成する必要があります。
そのセットアップの出発点として、[このガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) が有用です。

同一リージョン内でのアクセスの場合は、VPC Resource を作成する方法が推奨されます。
:::

<Image img={cp_rpe_step1} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

6. 選択したエンドポイントタイプに必要なパラメータを指定します。

<Image img={cp_rpe_step2} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

    - VPC resource の場合は、configuration share ARN と configuration ID を指定します。
    - MSK multi-VPC の場合は、作成済みエンドポイントで使用する cluster ARN と認証方法を指定します。
    - VPC endpoint service の場合は、service name を指定します。

7. `Create` をクリックし、リバースプライベートエンドポイントの準備が完了するまで待ちます。

   新しいエンドポイントを作成している場合は、エンドポイントのセットアップに少し時間がかかります。
   エンドポイントの準備が整うと、ページは自動的に更新されます。
   VPC endpoint service の場合は、AWS コンソールで接続リクエストを承認する必要がある場合があります。

<Image img={cp_rpe_step3} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

8. エンドポイントの準備が整ったら、DNS 名を使用してデータソースに接続できます。

   エンドポイント一覧では、利用可能なエンドポイントの DNS 名を確認できます。
   これは、ClickPipes によって内部的にプロビジョニングされた DNS 名か、PrivateLink サービスから提供されたプライベート DNS 名のいずれかです。
   DNS 名は完全なネットワークアドレスではありません。
   データソースに応じてポートを付加してください。

   MSK の接続文字列は AWS コンソールから参照できます。

   すべての DNS 名の一覧は、クラウドサービスの設定から参照できます。

</VerticalStepper>



## 既存のリバースプライベートエンドポイントの管理 {#managing-existing-endpoints}

ClickHouse Cloud のサービス設定で、既存のリバースプライベートエンドポイントを管理できます。

<VerticalStepper headerLevel="list">

1. サイドバーの `Settings` ボタンをクリックします。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 設定" size="lg" border/>

2. `ClickPipe reverse private endpoints` セクション内の `Reverse private endpoints` をクリックします。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 設定" size="md" border/>

   リバースプライベートエンドポイントの詳細情報がフライアウトパネルに表示されます。

   ここからエンドポイントを削除できます。この操作は、このエンドポイントを使用しているすべての ClickPipes に影響します。

</VerticalStepper>



## サポートされている AWS リージョン {#aws-privatelink-regions}

AWS PrivateLink のサポートは、ClickPipes 用では特定の AWS リージョンに限定されています。
利用可能なリージョンについては、[ClickPipes のリージョン一覧](/integrations/clickpipes#list-of-static-ips)を参照してください。

この制限は、リージョン間接続が有効になっている PrivateLink VPC エンドポイントサービスには適用されません。



## 制限事項 {#limitations}

ClickHouse Cloud で作成された ClickPipes 用の AWS PrivateLink エンドポイントは、
ClickHouse Cloud サービスと同じ AWS リージョン内に作成されるとは限りません。

現在のところ、クロスリージョン接続をサポートしているのは VPC エンドポイントサービスのみです。

プライベートエンドポイントは特定の ClickHouse サービスに紐づけられており、サービス間で共有・移行することはできません。
1 つの ClickHouse サービスに対して複数の ClickPipes が同じエンドポイントを再利用できます。
