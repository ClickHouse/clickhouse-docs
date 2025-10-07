---
'sidebar_label': 'AWS PrivateLink for ClickPipes'
'description': 'AWS PrivateLinkを使用して、ClickPipesとデータソース間に安全な接続を確立します。'
'slug': '/integrations/clickpipes/aws-privatelink'
'title': 'AWS PrivateLink for ClickPipes'
'doc_type': 'guide'
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

[こちら](https://aws.amazon.com/privatelink/)を使用して、VPC、AWSサービス、オンプレミスシステム、ClickHouse Cloud間の安全な接続性を確立できます。これにより、トラフィックを公衆インターネットにさらすことなく接続できます。

この文書は、AWS PrivateLink VPCエンドポイントを設定するためのClickPipesリバースプライベートエンドポイント機能について説明します。

## Supported ClickPipes data sources {#supported-sources}

ClickPipesリバースプライベートエンドポイント機能は、以下のデータソースタイプに制限されています：
- Kafka
- Postgres
- MySQL

## Supported AWS PrivateLink endpoint types {#aws-privatelink-endpoint-types}

ClickPipesリバースプライベートエンドポイントは、以下のいずれかのAWS PrivateLinkアプローチで構成できます：

- [VPCリソース](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)
- [MSK ClickPipe用のMSKマルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)
- [VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)

### VPC resource {#vpc-resource}

あなたのVPCリソースは、[PrivateLink](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を使用してClickPipesでアクセスできます。このアプローチは、データソースの前にロードバランサーを設定する必要がありません。

リソース構成は、特定のホストまたはRDSクラスタARNにターゲットを絞ることができます。
クロスリージョンはサポートされていません。

これは、RDSクラスターからデータを取り込むPostgres CDCのための推奨選択肢です。

PrivateLinkをVPCリソースでセットアップするには：
1. リソースゲートウェイを作成します
2. リソース構成を作成します
3. リソース共有を作成します

<VerticalStepper headerLevel="h4">

#### Create a resource gateway {#create-resource-gateway}

リソースゲートウェイは、VPC内の指定されたリソースへのトラフィックを受信するポイントです。

:::note
リソースゲートウェイに接続されたサブネットには、十分なIPアドレスが利用可能であることを推奨します。
各サブネットには少なくとも `/26` サブネットマスクを持つことが推奨されます。

各VPCエンドポイント（各リバースプライベートエンドポイント）には、AWSが各サブネットごとに連続した16のIPアドレスのブロックを要求します。（`/28` サブネットマスク）
この要件が満たされない場合、リバースプライベートエンドポイントは失敗状態に遷移します。
:::

リソースゲートウェイは、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-gateway.html)から作成することができます。または、以下のコマンドを使用して作成できます：

```bash
aws vpc-lattice create-resource-gateway \
    --vpc-identifier <VPC_ID> \
    --subnet-ids <SUBNET_IDS> \
    --security-group-ids <SG_IDs> \
    --name <RESOURCE_GATEWAY_NAME>
```

出力には、次のステップで必要となるリソースゲートウェイIDが含まれます。

次に進む前に、リソースゲートウェイが`Active`状態になるまで待つ必要があります。状態を確認するには、次のコマンドを実行します：

```bash
aws vpc-lattice get-resource-gateway \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID>
```

#### Create a VPC Resource-Configuration {#create-resource-configuration}

リソース構成は、リソースゲートウェイに関連付けられ、リソースを利用可能にします。

リソース構成は、[AWSコンソール](https://docs.aws.amazon.com/vpc/latest/privatelink/create-resource-configuration.html)から作成することができます。または、以下のコマンドを使って作成することができます：

```bash
aws vpc-lattice create-resource-configuration \
    --resource-gateway-identifier <RESOURCE_GATEWAY_ID> \
    --type <RESOURCE_CONFIGURATION_TYPE> \
    --resource-configuration-definition <RESOURCE_CONFIGURATION_DEFINITION> \
    --name <RESOURCE_CONFIGURATION_NAME>
```

最もシンプルな[リソース構成タイプ](https://docs.aws.amazon.com/vpc-lattice/latest/ug/resource-configuration.html#resource-configuration-types)は、シングルリソース構成です。ARNを直接構成するか、公開されて解決可能なIPアドレスまたはドメイン名を共有することができます。

たとえば、RDSクラスタのARNを使って構成するには：

```bash
aws vpc-lattice create-resource-configuration \
    --name my-rds-cluster-config \
    --type ARN \
    --resource-gateway-identifier rgw-0bba03f3d56060135 \
    --resource-configuration-definition 'arnResource={arn=arn:aws:rds:us-east-1:123456789012:cluster:my-rds-cluster}'
```

:::note
パブリックアクセス可能なクラスターのためのリソース構成を作成することはできません。
クラスターが公開可能である場合は、リソース構成を作成する前に、クラスターをプライベートに変更する必要があります 
または、[IP allow list](/integrations/clickpipes#list-of-static-ips)を代わりに使用してください。 
詳細については、[AWSドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/resource-configuration.html#resource-definition)を参照してください。
:::

出力には、次のステップで必要なリソース構成ARNが含まれます。また、VPCリソースとのClickPipe接続を設定するために必要なリソース構成IDも含まれます。

#### Create a Resource-Share {#create-resource-share}

リソースを共有するには、リソース共有が必要です。これはリソースアクセスマネージャー（RAM）を通じて容易になります。

リソース構成をリソース共有に追加するには、[AWSコンソール](https://docs.aws.amazon.com/ram/latest/userguide/working-with-sharing-create.html)を使用するか、以下のコマンドをClickPipesアカウントID `072088201116` (arn:aws:iam::072088201116:root)を使用して実行します：

```bash
aws ram create-resource-share \
    --principals 072088201116 \
    --resource-arns <RESOURCE_CONFIGURATION_ARN> \
    --name <RESOURCE_SHARE_NAME>
```

出力には、VPCリソースとのClickPipe接続を設定するために必要なリソース共有ARNが含まれます。

あなたは、VPCリソースを使用して[リバースプライベートエンドポイントでClickPipeを作成する](#creating-clickpipe)準備が整いました。次のことを行う必要があります：
- `VPCエンドポイントタイプ`を`VPC Resource`に設定します。
- `リソース構成ID`をステップ2で作成されたリソース構成のIDに設定します。
- `リソース共有ARN`をステップ3で作成されたリソース共有のARNに設定します。

VPCリソースのPrivateLinkの詳細については、[AWSドキュメント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-resources.html)を参照してください。

</VerticalStepper>

### MSK multi-VPC connectivity {#msk-multi-vpc}

[AWS MSKの[マルチVPC接続](https://docs.aws.amazon.com/msk/latest/developerguide/aws-access-mult-vpc.html)]は、複数のVPCを単一のMSKクラスターに接続できるAWS MSKのビルトイン機能です。プライベートDNSサポートは標準で提供され、追加の設定は必要ありません。
クロスリージョンはサポートされていません。

これは、ClickPipes for MSKに推奨されるオプションです。
詳細については、[はじめに](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-getting-started.html)ガイドを参照してください。

:::info
MSKクラスターのポリシーを更新し、`072088201116`を許可されたプリンシパルに追加してください。
詳細については、AWSガイドの[クラスターポリシーの関連付け](https://docs.aws.amazon.com/msk/latest/developerguide/mvpc-cluster-owner-action-policy.html)を参照してください。
:::

ClickPipesの接続を設定する方法については、[MSKセットアップガイド](https://knowledgebase.aws-privatelink-setup-for-msk-clickpipes)を参照してください。

### VPC endpoint service {#vpc-endpoint-service}

[VPCエンドポイントサービス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)は、ClickPipesとデータソースを共有するための別のアプローチです。
データソースの前にNLB（ネットワークロードバランサー）を設定する必要があります
そして、NLBを使用するようにVPCエンドポイントサービスを構成します。

VPCエンドポイントサービスは、[プライベートDNSで構成](https://docs.aws.amazon.com/vpc/latest/privatelink/manage-dns-names.html)でき、
ClickPipes VPC内でアクセス可能になります。

これは以下のための推奨される選択です：

- プライベートDNSサポートを必要とする任意のオンプレミスKafkaセットアップ
- [Postgres CDC用のクロスリージョン接続](/knowledgebase/aws-privatelink-setup-for-clickpipes)
- MSKクラスター用のクロスリージョン接続。サポートチームに連絡して支援を受けてください。

詳細については、[はじめに](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html)ガイドを参照してください。

:::info
ClickPipesアカウントID `072088201116`をVPCエンドポイントサービスの許可されたプリンシパルに追加してください。
詳細については、AWSガイドの[アクセス権の管理](https://docs.aws.amazon.com/vpc/latest/privatelink/configure-endpoint-service.html#add-remove-permissions)を参照してください。
:::

:::info
[クロスリージョンアクセス](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-cross-region)
は、ClickPipesに対して構成できます。VPCエンドポイントサービスで許可されたリージョンに[あなたのClickPipeリージョン](#aws-privatelink-regions)を追加してください。
:::

## Creating a ClickPipe with reverse private endpoint {#creating-clickpipe}

<VerticalStepper headerLevel="list">

1. ClickHouse CloudサービスのSQLコンソールにアクセスします。

<Image img={cp_service} alt="ClickPipes service" size="md" border/>

2. 左側のメニューから`データソース`ボタンを選択し、「ClickPipeをセットアップ」をクリックします。

<Image img={cp_step0} alt="Select imports" size="lg" border/>

3. データソースとしてKafkaまたはPostgresを選択します。

<Image img={cp_rpe_select} alt="Select data source" size="lg" border/>

4. `リバースプライベートエンドポイント`オプションを選択します。

<Image img={cp_rpe_step0} alt="Select reverse private endpoint" size="lg" border/>

5. 既存のリバースプライベートエンドポイントのいずれかを選択するか、新しいものを作成します。

:::info
RDSのためにクロスリージョンアクセスが必要な場合、VPCエンドポイントサービスを作成する必要があります。
この[ガイド](https://knowledgebase.aws-privatelink-setup-for-clickpipes)は、設定を開始するための良い出発点となるはずです。

同一リージョンのアクセスには、VPCリソースを作成することが推奨されます。
:::

<Image img={cp_rpe_step1} alt="Select reverse private endpoint" size="lg" border/>

6. 選択したエンドポイントタイプのための必要なパラメータを提供します。

<Image img={cp_rpe_step2} alt="Select reverse private endpoint" size="lg" border/>

    - VPCリソースの場合、構成共有ARNおよび構成IDを提供します。
    - MSKマルチVPCの場合、クラスターARNおよび作成したエンドポイントで使用される認証方法を提供します。
    - VPCエンドポイントサービスの場合、サービス名を提供します。

7. `作成`をクリックし、リバースプライベートエンドポイントが準備完了になるのを待ちます。

   新しいエンドポイントを作成する場合、エンドポイントの設定には時間がかかります。
   エンドポイントが準備完了になると、ページが自動的に更新されます。
   VPCエンドポイントサービスでは、AWSコンソールで接続リクエストを受け入れる必要があるかもしれません。

<Image img={cp_rpe_step3} alt="Select reverse private endpoint" size="lg" border/>

8. エンドポイントが準備完了になれば、DNS名を使用してデータソースに接続できます。

   エンドポイントのリストに、利用可能なエンドポイントのDNS名が表示されます。
   それは、ClickPipesによりプロビジョニングされた内部DNS名またはPrivateLinkサービスによって提供されたプライベートDNS名のいずれかです。
   DNS名は完全なネットワークアドレスではありません。
   データソースに応じてポートを追加してください。

   MSK接続文字列は、AWSコンソールでアクセスできます。

   DNS名の全リストを見るには、クラウドサービス設定でアクセスしてください。

</VerticalStepper>

## Managing existing reverse private endpoints {#managing-existing-endpoints}

You can manage existing reverse private endpoints in the ClickHouse Cloud service settings:

<VerticalStepper headerLevel="list">

1. On a sidebar find the `Settings` button and click on it.

    <Image img={cp_rpe_settings0} alt="ClickHouse Cloud settings" size="lg" border/>

2. Click on `Reverse private endpoints` in a `ClickPipe reverse private endpoints` section.

    <Image img={cp_rpe_settings1} alt="ClickHouse Cloud settings" size="md" border/>

    リバースプライベートエンドポイントの詳細情報がフライアウトに表示されます。

    ここからエンドポイントを削除できます。これにより、このエンドポイントを使用しているすべてのClickPipesに影響します。

</VerticalStepper>

## Supported AWS regions {#aws-privatelink-regions}

AWS PrivateLinkサポートは、ClickPipesの特定のAWSリージョンに制限されています。
利用可能なリージョンについては、[ClickPipesリージョンリスト](/integrations/clickpipes#list-of-static-ips)を参照してください。

この制限は、クロスリージョン接続が有効なPrivateLink VPCエンドポイントサービスには適用されません。

## Limitations {#limitations}

ClickHouse Cloudで作成されたClickPipes用のAWS PrivateLinkエンドポイントは、ClickHouse Cloudサービスと同じAWSリージョンで作成されることは保証されていません。

現在、VPCエンドポイントサービスのみがクロスリージョン接続をサポートしています。

プライベートエンドポイントは特定のClickHouseサービスにリンクされており、サービス間での移動はできません。
単一のClickHouseサービスに対して複数のClickPipesが同じエンドポイントを再利用することができます。
