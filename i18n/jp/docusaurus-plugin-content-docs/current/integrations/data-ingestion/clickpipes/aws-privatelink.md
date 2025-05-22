---
'sidebar_label': 'AWS PrivateLink for ClickPipes'
'description': 'ClickPipes とデータソース間の安全な接続を AWS PrivateLink を使用して確立します。'
'slug': '/integrations/clickpipes/aws-privatelink'
'title': 'AWS PrivateLink for ClickPipes'
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


# AWS PrivateLink for ClickPipes

AWS PrivateLinkを使用して、VPC、AWSサービス、オンプレミスシステム、およびClickHouse Cloud間の安全な接続を確立し、トラフィックをパブリックインターネットにさらさないことができます。

このドキュメントでは、AWS PrivateLink VPCエンドポイントを設定するためのClickPipesのリバースプライベートエンドポイント機能について説明します。

## サポートされているAWS PrivateLinkエンドポイントタイプ {#aws-privatelink-endpoint-types}

ClickPipesのリバースプライベートエンドポイントは、以下のAWS PrivateLinkアプローチのいずれかで構成できます。

- [VPCリソース](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe用のMSKマルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

それぞれのAWS PrivateLink共有の設定方法については、上記のリンクを参照してください。

### VPCリソース {#vpc-resource}

あなたのVPCリソースは、PrivateLinkを使用してClickPipesにアクセスできます。
リソース構成は、特定のホストまたはRDSクラスターARNにターゲットを設定できます。
クロスリージョンはサポートされていません。

これは、RDSクラスターからデータを取り込むPostgres CDCに推奨される選択肢です。

詳しい情報については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html)ガイドを参照してください。

:::info
VPCリソースはClickPipesアカウントと共有する必要があります。リソース共有設定に `072088201116` を許可された主体として追加してください。
詳細については、リソースを共有するためのAWSガイドを参照してください。 [リソースの共有](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)
:::

### MSKマルチVPC接続 {#msk-multi-vpc}

MSKマルチVPCは、AWS MSKのビルトイン機能で、複数のVPCを単一のMSKクラスターに接続できます。
プライベートDNSサポートは標準で提供されており、追加の構成は必要ありません。
クロスリージョンはサポートされていません。

ClickPipesにとっては、MSK向けの推奨オプションです。
詳しい情報については、[はじめに](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)ガイドを参照してください。

:::info
MSKクラスターのポリシーを更新し、MSKクラスターに許可された主体として `072088201116` を追加してください。
詳細については、クラスター ポリシーをアタッチするためのAWSガイドを参照してください。[クラスター ポリシーのアタッチ](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)
:::

ClickPipes用の[MSKセットアップガイド](/knowledgebase/aws-privatelink-setup-for-msk-clickpipes)を参照して、接続の設定方法を学んでください。

### VPCエンドポイントサービス {#vpc-endpoint-service}

VPCサービスは、ClickPipesとデータソースを共有するための別のアプローチです。
データソースの前にNLB（Network Load Balancer）を設定し、NLBを使用するようにVPCエンドポイントサービスを構成する必要があります。

VPCエンドポイントサービスは、[プライベートDNS](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)で構成でき、ClickPipes VPCでアクセス可能です。

これは以下の用途に推奨されます：

- プライベートDNSサポートが必要なオンプレミスのKafkaセットアップ
- [Postgres CDCのクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSKクラスターのクロスリージョン接続。サポートが必要な場合は、ClickHouseサポートチームにお問い合わせください。

詳しい情報については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipesアカウントID `072088201116` をVPCエンドポイントサービスの許可された主体として追加してください。
詳細については、パーミッションを管理するためのAWSガイドを参照してください。[パーミッションの管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)
:::

:::info
ClickPipes用の[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
が構成可能です。VPCエンドポイントサービスの許可されたリージョンに[あなたのClickPipeリージョン](#aws-privatelink-regions)を追加してください。
:::

## リバースプライベートエンドポイントを持つClickPipeの作成 {#creating-clickpipe}

1. ClickHouse Cloud Service用のSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 左側のメニューで `Data Sources` ボタンを選択し、「ClickPipeの設定」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. データソースとしてKafkaまたはPostgresを選択します。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. `Reverse private endpoint` オプションを選択します。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 既存のリバースプライベートエンドポイントを選択するか、新しいものを作成します。

:::info
RDSに対してクロスリージョンアクセスが必要な場合は、VPCエンドポイントサービスを作成する必要があります。
このガイドは、設定の開始点として役立ちます。(/knowledgebase/aws-privatelink-setup-for-clickpipes)

同じリージョンへのアクセスの場合、VPCリソースの作成が推奨されます。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 選択したエンドポイントタイプの必須パラメータを提供します。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - VPCリソースの場合、構成共有ARNと構成IDを提供します。
    - MSKマルチVPCの場合、クラスターARNと作成されたエンドポイントで使用される認証方法を提供します。
    - VPCエンドポイントサービスの場合、サービス名を提供します。

7. `Create`をクリックし、リバースプライベートエンドポイントが準備できるのを待ちます。

   新しいエンドポイントを作成している場合、エンドポイントの設定には時間がかかります。
   エンドポイントが準備でき次第、ページは自動的にリフレッシュされます。
   VPCエンドポイントサービスでは、AWSコンソールで接続要求を受け入れる必要がある場合があります。

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. エンドポイントが準備できたら、DNS名を使用してデータソースに接続できます。

   エンドポイントのリストで、利用可能なエンドポイントのDNS名を見ることができます。
   それは、ClickPipesのプロビジョニングされた内部DNS名またはPrivateLinkサービスによって提供されたプライベートDNS名のいずれかです。
   DNS名は完全なネットワークアドレスではありません。
   データソースに応じたポートを追加してください。

   MSK接続文字列は、AWSコンソールでアクセスできます。

   DNS名の完全なリストを見るには、クラウドサービス設定でアクセスしてください。

## 既存のリバースプライベートエンドポイントの管理 {#managing-existing-endpoints}

ClickHouse Cloudサービス設定で、既存のリバースプライベートエンドポイントを管理できます。

1. サイドバーで `Settings` ボタンを見つけ、クリックします。

<Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. `ClickPipe reverse private endpoints` セクションで `Reverse private endpoints` をクリックします。

<Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

    リバースプライベートエンドポイントの詳細情報がフライアウトに表示されます。

    ここからエンドポイントを削除できます。これにより、このエンドポイントを使用する全てのClickPipesに影響を与えます。

## サポートされているAWSリージョン {#aws-privatelink-regions}

次のAWSリージョンがAWS PrivateLinkでサポートされています。

- `us-east-1` - `us-east-1`リージョンで実行されているClickHouseサービス用
- `eu-central-1` - EUリージョンで実行されているClickHouseサービス用
- `us-east-2` - その他のすべての場所で実行されているClickHouseサービス用

この制限は、クロスリージョン接続をサポートするため、PrivateLink VPCエンドポイントサービスタイプには適用されません。

## 制限事項 {#limitations}

ClickHouse Cloudで作成されたClickPipes用のAWS PrivateLinkエンドポイントは、ClickHouse Cloudサービスと同じAWSリージョンで作成されることが保証されていません。

現在、VPCエンドポイントサービスのみがクロスリージョン接続をサポートしています。

プライベートエンドポイントは特定のClickHouseサービスにリンクされており、サービス間で転送することはできません。
単一のClickHouseサービスに対して複数のClickPipesが同じエンドポイントを再利用することができます。
