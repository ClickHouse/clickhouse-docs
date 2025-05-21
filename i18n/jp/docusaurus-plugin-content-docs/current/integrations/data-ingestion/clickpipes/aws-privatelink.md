---
sidebar_label: 'AWS PrivateLink for ClickPipes'
description: 'ClickPipesとデータソース間の安全な接続を確立するためにAWS PrivateLinkを使用します。'
slug: /integrations/clickpipes/aws-privatelink
title: 'ClickPipesのためのAWS PrivateLink'
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


# ClickPipesのためのAWS PrivateLink

[AWS PrivateLink](https://aws.amazon.com/privatelink/)を使用して、VPC間、AWSサービス、オンプレミスシステム、およびClickHouse Cloud間で安全な接続を確立できます。これにより、トラフィックを公共のインターネットにさらすことなく、データソースへのアクセスが可能になります。

このドキュメントでは、AWS PrivateLink VPCエンドポイントの設定を可能にするClickPipesリバースプライベートエンドポイント機能について説明します。

## サポートされているAWS PrivateLinkエンドポイントタイプ {#aws-privatelink-endpoint-types}

ClickPipesリバースプライベートエンドポイントは、以下のAWS PrivateLinkアプローチのいずれかで構成できます：

- [VPCリソース](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe用のMSKマルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

上記のリンクをたどって、それぞれのAWS PrivateLinkシェアを設定するための詳細な手順を確認してください。

### VPCリソース {#vpc-resource}

あなたのVPCリソースは、PrivateLinkを使用してClickPipesでアクセスできます。リソースの構成は、特定のホストまたはRDSクラスターARNをターゲットにできます。クロスリージョンはサポートされていません。

これは、RDSクラスターからデータを取り込むPostgres CDCの推奨選択肢です。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html)ガイドをご覧ください。

:::info
VPCリソースはClickPipesアカウントと共有する必要があります。あなたのリソースシェア構成に`072088201116`を許可されたプリンシパルに追加してください。リソースを共有するためのAWSガイドを参照してください。[sharing resources](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)
:::

### MSKマルチVPC接続 {#msk-multi-vpc}

MSKマルチVPCは、単一のMSKクラスターに複数のVPCを接続できるAWS MSKの組み込み機能です。プライベートDNSサポートは標準で提供されており、追加の構成は不要です。クロスリージョンはサポートされていません。

これは、MSK用のClickPipesの推奨オプションです。詳細については、[はじめに](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)ガイドを参照してください。

:::info
あなたのMSKクラスターのポリシーを更新し、MSKクラスターに`072088201116`を許可されたプリンシパルに追加してください。クラスターポリシーをアタッチするためのAWSガイドを参照してください。[attaching a cluster policy](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)
:::

私たちの[ClickPipes用のMSKセットアップガイド](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)を参照して、接続の設定方法を学んでください。

### VPCエンドポイントサービス {#vpc-endpoint-service}

VPCサービスは、あなたのデータソースをClickPipesと共有するための別のアプローチです。これは、データソースの前にNLB（ネットワークロードバランサー）を設定し、NLBを使用するようにVPCエンドポイントサービスを構成する必要があります。

VPCエンドポイントサービスは、[プライベートDNSで構成できます](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)、ClickPipes VPCでアクセス可能です。

これは以下のような場合に推奨されます：

- プライベートDNSサポートが必要なオンプレミスのKafka設定
- [Postgres CDCのクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSKクラスターのクロスリージョン接続。サポートチームに問い合わせて支援を受けてください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipesアカウントID`072088201116`をあなたのVPCエンドポイントサービスの許可されたプリンシパルに追加してください。パーミッションの管理に関するAWSガイドを参照してください。[managing permissions](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)
:::

:::info
[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)はClickPipesのために構成できます。あなたのVPCエンドポイントサービスの許可されたリージョンに[あなたのClickPipeリージョン](#aws-privatelink-regions)を追加してください。
:::

## リバースプライベートエンドポイントでのClickPipeの作成 {#creating-clickpipe}

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipesサービス" size="md" border/>

2. 左側のメニューで`データソース`ボタンを選択し、「ClickPipeをセットアップ」をクリックします。

<Image img={cp_step0} alt="インポートの選択" size="lg" border/>

3. データソースとしてKafkaまたはPostgresを選択します。

<Image img={cp_rpe_select} alt="データソースの選択" size="lg" border/>

4. `リバースプライベートエンドポイント`オプションを選択します。

<Image img={cp_rpe_step0} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

5. 既存のリバースプライベートエンドポイントのいずれかを選択するか、新しいものを作成します。

:::info
RDSにクロスリージョンアクセスが必要な場合は、VPCエンドポイントサービスを作成する必要があります。
[このガイド](/knowledgebase/aws-privatelink-setup-for-clickpipes)は、設定開始の良い出発点を提供するはずです。

同じリージョンへのアクセスの場合は、VPCリソースの作成が推奨されます。
:::

<Image img={cp_rpe_step1} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

6. 選択したエンドポイントタイプの必要なパラメータを提供します。

<Image img={cp_rpe_step2} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

    - VPCリソースの場合、構成共有ARNおよび構成IDを提供します。
    - MSKマルチVPCの場合、クラスターARNおよび作成されたエンドポイントで使用される認証方法を提供します。
    - VPCエンドポイントサービスの場合、サービス名を提供します。

7. `作成`をクリックし、リバースプライベートエンドポイントが準備されるのを待ちます。

   新しいエンドポイントを作成する場合、エンドポイントのセットアップにはいくらかの時間がかかります。
   エンドポイントが準備できると、ページが自動的に更新されます。
   VPCエンドポイントサービスでは、AWSコンソールで接続要求を承認する必要がある場合があります。

<Image img={cp_rpe_step3} alt="リバースプライベートエンドポイントの選択" size="lg" border/>

8. エンドポイントが準備できたら、DNS名を使用してデータソースに接続できます。

   エンドポイントのリストで、利用可能なエンドポイントのDNS名を確認できます。
   これは、内部でClickPipesによってプロビジョニングされたDNS名またはPrivateLinkサービスによって提供されたプライベートDNS名のいずれかです。
   DNS名は完全なネットワークアドレスではありません。
   データソースに応じてポートを追加してください。

   MSK接続文字列はAWSコンソールでアクセスできます。

   DNS名の完全なリストを確認するには、クラウドサービス設定でアクセスしてください。

## 既存のリバースプライベートエンドポイントの管理 {#managing-existing-endpoints}

ClickHouse Cloudサービス設定で既存のリバースプライベートエンドポイントを管理できます：

1. サイドバーで`設定`ボタンを見つけてクリックします。

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud設定" size="lg" border/>

2. `ClickPipeリバースプライベートエンドポイント`セクションで`リバースプライベートエンドポイント`をクリックします。

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud設定" size="md" border/>

    リバースプライベートエンドポイントの詳細情報がフライアウトで表示されます。

    ここからエンドポイントを削除できます。これは、このエンドポイントを使用しているすべてのClickPipesに影響します。

## サポートされているAWSリージョン {#aws-privatelink-regions}

AWS PrivateLinkにサポートされているAWSリージョンは次のとおりです：

- `us-east-1` - `us-east-1`リージョンで稼働しているClickHouseサービス用
- `eu-central-1` - EUリージョンで稼働しているClickHouseサービス用
- `us-east-2` - その他のすべての場所で稼働しているClickHouseサービス用

この制限は、クロスリージョン接続をサポートするため、PrivateLink VPCエンドポイントサービスタイプには適用されません。

## 制限事項 {#limitations}

ClickHouse Cloudで作成されたClickPipes用のAWS PrivateLinkエンドポイントは、ClickHouse Cloudサービスと同じAWSリージョンで作成されることが保証されていません。

現時点では、VPCエンドポイントサービスのみがクロスリージョン接続をサポートしています。

プライベートエンドポイントは特定のClickHouseサービスにリンクされており、サービス間で移転することはできません。
単一のClickHouseサービスに対して複数のClickPipesが同じエンドポイントを再利用できます。
