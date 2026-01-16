---
sidebar_label: 'ClickPipes 向け AWS PrivateLink'
description: 'AWS PrivateLink を使用して、ClickPipes とデータソース間にセキュアな接続を確立します。'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipes 向け AWS PrivateLink'
doc_type: 'guide'
keywords: ['aws privatelink', 'ClickPipes security', 'vpc endpoint', 'private connectivity', 'vpc resource']
integration:
   - support_level: 'core'
   - category: 'clickpipes'
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

# ClickPipes 向け AWS PrivateLink \{#aws-privatelink-for-clickpipes\}

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用すると、トラフィックをパブリックインターネットにさらすことなく、
VPC、AWS サービス、オンプレミスシステム、ClickHouse Cloud 間で安全な接続を確立できます。

このドキュメントでは、AWS PrivateLink VPC エンドポイントのセットアップを可能にする
ClickPipes のリバースプライベートエンドポイント機能について説明します。

## サポートされている ClickPipes データソース \\{#supported-sources\\}

ClickPipes のリバースプライベートエンドポイント機能が利用できるデータソースの種類は、
次のものに限定されます。

- Kafka
- Postgres
- MySQL
- MongoDB

## サポートされている AWS PrivateLink エンドポイントの種類 \\{#aws-privatelink-endpoint-types\\}

ClickPipes のリバースプライベートエンドポイントは、次のいずれかの AWS PrivateLink 方式で構成できます:

- [VPC リソース](#vpc-resource)
- [MSK ClickPipe 向け MSK マルチ VPC 接続](#msk-multi-vpc)
- [VPC エンドポイントサービス](#vpc-endpoint-service)

### VPC リソース \\{#vpc-resource\\}

:::info
クロスリージョンはサポートされていません。
:::

VPC リソースには、[PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html) を使用して ClickPipes からアクセスできます。この方法では、データソースの前段にロードバランサーを設定する必要はありません。

リソース構成では、特定のホストまたは RDS クラスター ARN をターゲットとして指定できます。

これは、RDS クラスターからデータを CDC（変更データキャプチャ）で取り込む Postgres 用として推奨される方法です。

VPC リソースに対して PrivateLink を設定するには:

1. リソースゲートウェイを作成する
2. リソース構成を作成する
3. リソース共有を作成する

<VerticalStepper headerLevel="h4">

#### リソースゲートウェイを作成する \\{#create-resource-gateway\\}

リソースゲートウェイは、VPC 内で指定したリソースに対するトラフィックを受け取るポイントです。

:::note
リソースゲートウェイにアタッチするサブネットには、十分な数の IP アドレスが確保されていることが推奨されます。
各サブネットについて、少なくとも `/26` のサブネットマスクを使用することを推奨します。

各 VPC エンドポイント（各 Reverse Private Endpoint）に対して、AWS はサブネットごとに連続した 16 個の IP アドレスからなるブロック（`/28` サブネットマスク）を要求します。
この要件を満たさない場合、Reverse Private Endpoint は failed 状態に遷移します。
:::

リソースゲートウェイは、[AWS コンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)から、または次のコマンドを使用して作成できます。

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

出力結果にはリソースゲートウェイ ID が含まれます。これは次の手順で必要になります。

先に進む前に、リソースゲートウェイが `Active` 状態になるまで待つ必要があります。状態は次のコマンドを実行して確認できます。

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### VPC Resource-Configuration を作成する \\{#create-resource-configuration\\}

Resource-Configuration は、リソースゲートウェイに関連付けることで、リソースへのアクセスを可能にします。

[AWS コンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html) から、または次のコマンドを使用して Resource-Configuration を作成できます。

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最も単純な[リソース構成タイプ](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)は、単一のリソース構成です。ARN を直接指定するか、パブリックに名前解決可能な IP アドレスまたはドメイン名を指定して構成できます。

たとえば、RDS クラスターの ARN で構成するには次のようにします。

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
パブリックにアクセス可能なクラスターに対しては、リソース構成を作成できません。
クラスターがパブリックにアクセス可能な場合は、リソース構成を作成する前に
クラスターをプライベートに変更するか、代わりに [IP allow list](/integrations/clickpipes#list-of-static-ips) を使用する必要があります。
詳細については、[AWS ドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition) を参照してください。
:::

出力結果には、次のステップで必要となる Resource-Configuration ARN が含まれます。また、VPC リソースを使用した ClickPipe 接続の設定に必要となる Resource-Configuration ID も含まれます。

#### Resource-Share を作成する \\{#create-resource-share\\}

リソースを共有するには Resource-Share が必要です。これは Resource Access Manager (RAM) を通じて行われます。

Resource-Configuration は、[AWS コンソール](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html) を使用するか、ClickPipes アカウント ID `072088201116` (arn:aws:iam::072088201116:root) を指定して次のコマンドを実行することで Resource-Share に追加できます。

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

出力には Resource-Share ARN が含まれます。これは、VPC リソースを使用して ClickPipe 接続を設定する際に必要になります。

これで、VPC リソースを使用して[Reverse private endpoint を用いた ClickPipe を作成](#creating-clickpipe)する準備が整いました。次の設定を行う必要があります。

* `VPC endpoint type` を `VPC Resource` に設定します。
* `Resource configuration ID` を、ステップ 2 で作成した Resource-Configuration の ID に設定します。
* `Resource share ARN` を、ステップ 3 で作成した Resource-Share の ARN に設定します。

VPC リソースを用いた PrivateLink の詳細については、[AWS のドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を参照してください。

</VerticalStepper>


### MSK マルチ VPC 接続 \\{#msk-multi-vpc\\}

[Multi-VPC connectivity](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html) は、複数の VPC を 1 つの MSK クラスターに接続できる AWS MSK の組み込み機能です。
プライベート DNS は標準でサポートされており、追加の設定は不要です。
リージョン間での利用はサポートされていません。

これは ClickPipes for MSK に推奨されるオプションです。
詳細については、[getting started](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html) ガイドを参照してください。

:::info
MSK クラスターのポリシーを更新し、MSK クラスターで許可されるプリンシパルとして `072088201116` を追加してください。
詳細については、AWS ガイドの [attaching a cluster policy](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html) を参照してください。
:::

接続のセットアップ方法については、[MSK setup guide for ClickPipes](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes) を参照してください。

### VPC エンドポイントサービス \\{#vpc-endpoint-service\\}

[VPC エンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html) は、データソースを ClickPipes と共有するための別の方法です。
この方法では、データソースの前段に NLB（Network Load Balancer）を設定し、
その NLB を利用するように VPC エンドポイントサービスを構成する必要があります。

VPC エンドポイントサービスは、ClickPipes の VPC 内からアクセス可能な [プライベート DNS を使用して構成できます](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)。

次のようなケースでの利用が推奨されます。

- プライベート DNS サポートを必要とするオンプレミスの Kafka セットアップ
- [Postgres CDC のリージョン間接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSK クラスターのリージョン間接続。支援が必要な場合は ClickHouse サポートチームまでお問い合わせください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipes アカウント ID `072088201116` を、VPC エンドポイントサービスの許可されたプリンシパルに追加してください。
詳細については、AWS ガイドの [アクセス許可の管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions) を参照してください。
:::

:::info
[リージョン間アクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
は ClickPipes 用に構成できます。VPC エンドポイントサービスの許可リージョンに [使用している ClickPipe のリージョン](#aws-privatelink-regions) を追加してください。
:::

## リバースプライベートエンドポイントを使用して ClickPipe を作成する \\{#creating-clickpipe\\}

<VerticalStepper headerLevel="list">

1. ClickHouse Cloud サービスの SQL Console にアクセスします。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 左側メニューの `Data Sources` ボタンを選択し、「Set up a ClickPipe」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. データソースとして Kafka または Postgres を選択します。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. `Reverse private endpoint` オプションを選択します。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 既存のリバースプライベートエンドポイントのいずれかを選択するか、新規に作成します。

:::info
RDS へのリージョンをまたぐアクセスが必要な場合は、VPC エンドポイントサービスを作成する必要があります。設定時の良い出発点として、[こちらのガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes) を参照してください。

同一リージョンでのアクセスの場合は、VPC リソースを作成する方法が推奨されます。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 選択したエンドポイントタイプに必要なパラメーターを指定します。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

```
- For VPC resource, provide the configuration share ARN and configuration ID.
- For MSK multi-VPC, provide the cluster ARN and authentication method used with a created endpoint.
- For VPC endpoint service, provide the service name.
```

7. `Create` をクリックし、リバースプライベートエンドポイントの準備が完了するまで待ちます。

新しいエンドポイントを作成している場合、エンドポイントのセットアップには時間がかかることがあります。
エンドポイントの準備ができると、ページは自動的に更新されます。
VPC エンドポイントサービスでは、AWS コンソールで接続リクエストを承認する必要がある場合があります。

<Image img={cp_rpe_step3} alt="リバースプライベートエンドポイントを選択" size="lg" border/>

8. エンドポイントの準備ができたら、DNS 名を使用してデータソースに接続できます。

   エンドポイントの一覧で、利用可能なエンドポイントの DNS 名を確認できます。
   これは、ClickPipes によって内部でプロビジョニングされた DNS 名か、PrivateLink サービスによって提供されたプライベート DNS 名のいずれかです。
   DNS 名は完全なネットワークアドレスではありません。
   データソースに応じてポート番号を追加してください。

   MSK の接続文字列は AWS コンソールから参照できます。

   DNS 名の完全な一覧を表示するには、クラウドサービスの設定画面にアクセスします。

</VerticalStepper>


## 既存のリバースプライベートエンドポイントの管理 \\{#managing-existing-endpoints\\}

既存のリバースプライベートエンドポイントは、ClickHouse Cloud のサービス設定から管理できます。

<VerticalStepper headerLevel="list">

1. サイドバーから `Settings` ボタンを見つけてクリックします。

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud 設定" size="lg" border/>

2. `ClickPipe reverse private endpoints` セクション内の `Reverse private endpoints` をクリックします。

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud 設定" size="md" border/>

   フライアウトパネルに、リバースプライベートエンドポイントの詳細情報が表示されます。

   ここからエンドポイントを削除できます。削除すると、このエンドポイントを使用しているすべての ClickPipes に影響します。

</VerticalStepper>

## サポートされている AWS リージョン \\{#aws-privatelink-regions\\}

ClickPipes 向けの AWS PrivateLink のサポートは、特定の AWS リージョンに限定されています。
利用可能なリージョンについては、[ClickPipes リージョン一覧](/integrations/clickpipes#list-of-static-ips) を参照してください。

この制限は、リージョン間接続を有効にした PrivateLink VPC エンドポイントサービスには適用されません。

## 制限事項 \\{#limitations\\}

ClickHouse Cloud で作成された ClickPipes 用の AWS PrivateLink エンドポイントが、
ClickHouse Cloud サービスと同じ AWS リージョン内に作成されるとは限りません。

現在、リージョンをまたいだ接続をサポートしているのは
VPC エンドポイントサービスのみです。

プライベートエンドポイントは特定の ClickHouse サービスに紐づけられており、サービス間で共有したり移行したりすることはできません。
単一の ClickHouse サービスに対して複数の ClickPipes がある場合でも、同じエンドポイントを再利用できます。