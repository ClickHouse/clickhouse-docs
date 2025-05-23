---
'title': 'AWS プライベートリンク'
'description': 'このドキュメントでは、AWS プライベートリンクを使用して ClickHouse Cloud に接続する方法について説明します。'
'slug': '/manage/security/aws-privatelink'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import aws_private_link_pecreate from '@site/static/images/cloud/security/aws-privatelink-pe-create.png';
import aws_private_link_endpoint_settings from '@site/static/images/cloud/security/aws-privatelink-endpoint-settings.png';
import aws_private_link_select_vpc from '@site/static/images/cloud/security/aws-privatelink-select-vpc-and-subnets.png';
import aws_private_link_vpc_endpoint_id from '@site/static/images/cloud/security/aws-privatelink-vpc-endpoint-id.png';
import aws_private_link_endpoints_menu from '@site/static/images/cloud/security/aws-privatelink-endpoints-menu.png';
import aws_private_link_modify_dnsname from '@site/static/images/cloud/security/aws-privatelink-modify-dns-name.png';
import pe_remove_private_endpoint from '@site/static/images/cloud/security/pe-remove-private-endpoint.png';
import aws_private_link_pe_filters from '@site/static/images/cloud/security/aws-privatelink-pe-filters.png';
import aws_private_link_ped_nsname from '@site/static/images/cloud/security/aws-privatelink-pe-dns-name.png';


# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

AWS PrivateLinkを使用すると、VPC、AWSサービス、オンプレミスシステム、ClickHouse Cloud間で、安全な接続を確立できます。これにより、トラフィックが公衆インターネットにさらされることはありません。本ドキュメントでは、AWS PrivateLinkを使用してClickHouse Cloudに接続する手順を概説します。

ClickHouse CloudサービスへのアクセスをAWS PrivateLinkアドレスを介してのみ制限するには、ClickHouse Cloudの[IPアクセスリスト](/cloud/security/setting-ip-filters)に記載された手順に従ってください。

:::note
ClickHouse Cloudは、現在[クロスリージョンPrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)のベータ版をサポートしています。
:::

**AWS PrivateLinkを有効にするには、次の手順を完了してください**：
1. エンドポイント「サービス名」を取得します。
1. AWSエンドポイントを作成します。
1. 「エンドポイントID」をClickHouse Cloud組織に追加します。
1. 「エンドポイントID」をClickHouseサービスの許可リストに追加します。

Terraformの例は[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)でご確認いただけます。

## 注意 {#attention}
ClickHouseは、AWSリージョン内で同じ公開された[サービスエンドポイント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)を再利用するためにサービスをグループ化しようとします。ただし、このグループ化は保証されておらず、特に複数のClickHouse組織にサービスを分散させた場合は特にそうです。
既にClickHouse組織内の他のサービスに対してPrivateLinkが設定されている場合、そのグループ化のためにほとんどの手順をスキップし、最終手順「[ClickHouseの「エンドポイントID」をClickHouseサービスの許可リストに追加](#add-endpoint-id-to-services-allow-list)」に直接進むことが可能です。

## 前提条件 {#prerequisites}

始める前に、必要なものは次のとおりです：

1. あなたのAWSアカウント。
1. [ClickHouse APIキー](/cloud/manage/openapi)で、ClickHouse側でプライベートエンドポイントを作成および管理するために必要な権限を持っていること。

## 手順 {#steps}

AWS PrivateLinkを介してClickHouse Cloudサービスに接続するための手順は以下の通りです。

### エンドポイント「サービス名」を取得 {#obtain-endpoint-service-info}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、次に**設定**メニューに移動します。

<Image img={aws_private_link_pecreate} size="md" alt="プライベートエンドポイント" border />

`サービス名`と`DNS名`をメモし、次のステップに[移動します](#create-aws-endpoint)。

#### オプション2: API {#option-2-api}

まず、以下の環境変数を設定してからコマンドを実行してください：

```shell
REGION=<AWS形式のリージョンコード、例えば: us-west-2>
PROVIDER=aws
KEY_ID=<あなたのClickHouseキーID>
KEY_SECRET=<あなたのClickHouseキーシークレット>
ORG_ID=<あなたのClickHouse組織ID>
SERVICE_NAME=<あなたのClickHouseサービス名>
```

地域、プロバイダー、およびサービス名でフィルタリングしてClickHouseの`INSTANCE_ID`を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

プライベートリンク構成のために`endpointServiceId`と`privateDnsHostname`を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドは以下のような結果を返すはずです：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId`と`privateDnsHostname`をメモし、次のステップに[移動します](#create-aws-endpoint)。

### AWSエンドポイントの作成 {#create-aws-endpoint}

:::important
このセクションでは、AWS PrivateLinkを介してClickHouseを構成するためのClickHouse固有の詳細を説明します。AWS固有の手順は、参照として提供されていますが、時間が経つにつれて予告なしに変更される可能性があります。特定のユースケースに基づいてAWS構成を検討してください。  

ClickHouseは、必要なAWS VPCエンドポイント、セキュリティグループのルール、またはDNSレコードの設定に対して責任を負わないことに注意してください。  

以前にPrivateLinkの設定中に「プライベートDNS名」を有効にしており、新しいサービスをPrivateLink経由で構成する際に問題が発生した場合は、ClickHouseサポートにお問い合わせください。他のAWSの設定作業に関する問題については、直接AWSサポートに連絡してください。
:::

#### オプション1: AWSコンソール {#option-1-aws-console}

AWSコンソールを開き、**VPC** → **エンドポイント** → **エンドポイントを作成**に移動します。

**NLBおよびGWLBを使用するエンドポイントサービス**を選択し、[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した`サービス名`<sup>コンソール</sup>または`endpointServiceId`<sup>API</sup>を**サービス名**フィールドに入力します。**サービスの確認**をクリックします：

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLinkエンドポイント設定" border/>

PrivateLinkを介してクロスリージョン接続を確立したい場合は、「クロスリージョンエンドポイント」のチェックボックスを有効にし、サービスリージョンを指定します。サービスリージョンはClickHouseインスタンスが稼働している場所です。

「サービス名を確認できませんでした。」というエラーメッセージが表示された場合は、新しいリージョンをサポートされているリージョンリストに追加するようカスタマーサポートにお問い合わせください。

次に、VPCとサブネットを選択します：

<Image img={aws_private_link_select_vpc} size="md" alt="VPCとサブネットの選択" border />

オプションのステップとして、セキュリティグループ/タグを割り当てます：

:::note
ポート`443`、`8443`、`9440`、`3306`がセキュリティグループ内で許可されていることを確認してください。
:::

VPCエンドポイントを作成した後、`エンドポイントID`の値をメモします。次のステップで必要になります。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPCエンドポイントID" border/>

#### オプション2: AWS CloudFormation {#option-2-aws-cloudformation}

次に、[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した`サービス名`<sup>コンソール</sup>または`endpointServiceId`<sup>API</sup>を使用してVPCエンドポイントを作成する必要があります。正しいサブネットID、セキュリティグループ、およびVPC IDを使用してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <サービス名(endpointServiceId)、上記を参照>
      VpcId: vpc-vpc_id
      SubnetIds:
        - subnet-subnet_id1
        - subnet-subnet_id2
        - subnet-subnet_id3
      SecurityGroupIds:
        - sg-security_group_id1
        - sg-security_group_id2
        - sg-security_group_id3
```

VPCエンドポイントを作成した後、`エンドポイントID`の値をメモします。次のステップで必要になります。

#### オプション3: Terraform {#option-3-terraform}

以下の`service_name`は、[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した`サービス名`<sup>コンソール</sup>または`endpointServiceId`<sup>API</sup>です。

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<上記のコメントを参照>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(オプション) 指定すると、VPCエンドポイントが指定されたリージョンのサービスに接続します。マルチリージョンPrivateLink接続の場合は定義します。"
}
```

VPCエンドポイントを作成した後、`エンドポイントID`の値をメモします。次のステップで必要になります。

#### エンドポイントのプライベートDNS名を設定 {#set-private-dns-name-for-endpoint}

:::note
DNSを設定する方法は多岐にわたります。特定のユースケースに応じてDNSを設定してください。
:::

[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップから取得した「DNS名」をAWSエンドポイントネットワークインターフェースにポイントする必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントが正しくそれを解決できるようになります。

### 「エンドポイントID」をClickHouseサービスの許可リストに追加 {#add-endpoint-id-to-services-allow-list}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

追加するには、ClickHouse Cloudコンソールに移動し、PrivateLink経由で接続したいサービスを開いて、次に**設定**に移動します。**プライベートエンドポイントを設定**をクリックして、プライベートエンドポイント設定を開きます。[Create AWS Endpoint](#create-aws-endpoint)ステップで取得した`エンドポイントID`を入力します。「エンドポイントを作成」をクリックします。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="プライベートエンドポイントフィルター" border/>

削除するには、ClickHouse Cloudコンソールに移動し、サービスを見つけ、そのサービスの**設定**に移動して、削除したいエンドポイントを見つけます。エンドポイントのリストから削除します。

#### オプション2: API {#option-2-api-2}

プライベートリンクを使用して利用可能にする必要がある各インスタンスにエンドポイントIDを許可リストに追加する必要があります。

[Create AWS Endpoint](#create-aws-endpoint)ステップからのデータを使用して、`ENDPOINT_ID`環境変数を設定します。

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
REGION=<AWS形式のリージョンコード、例えば: us-west-2>
PROVIDER=aws
KEY_ID=<あなたのClickHouseキーID>
KEY_SECRET=<あなたのClickHouseキーシークレット>
ORG_ID=<あなたのClickHouse組織ID>
SERVICE_NAME=<あなたのClickHouseサービス名>
```

エンドポイントIDを許可リストに追加するには：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

エンドポイントIDを許可リストから削除するには：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID:?}"
    ]
  }
}
EOF

curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X PATCH -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" \
-d @pl_config.json | jq
```

### PrivateLinkを使用してインスタンスにアクセスする {#accessing-an-instance-using-privatelink}

Private Linkが有効になっている各サービスには、パブリックおよびプライベートエンドポイントがあります。Private Linkを使用して接続するには、[エンドポイント「サービス名」を取得](#obtain-endpoint-service-info)から取得した`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>コンソール</sup>であるプライベートエンドポイントを使用する必要があります。

#### プライベートDNSホスト名を取得する {#getting-private-dns-hostname}

##### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

<Image img={aws_private_link_ped_nsname} size="md" alt="プライベートエンドポイントDNS名" border />

##### オプション2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
KEY_ID=<あなたのClickHouseキーID>
KEY_SECRET=<あなたのClickHouseキーシークレット>
ORG_ID=<あなたのClickHouse組織ID>
INSTANCE_ID=<あなたのClickHouseサービス名>
```

[ステップ](#option-2-api)から`INSTANCE_ID`を取得できます。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

これは以下のような出力を生成します：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

この例では、`privateDnsHostname`のホスト名を介した接続はPrivateLinkにルーティングされますが、`endpointServiceId`のホスト名を介した接続はインターネットを経由してルーティングされます。

## トラブルシューティング {#troubleshooting}

### 1つのリージョン内の複数のPrivateLinks {#multiple-privatelinks-in-one-region}

ほとんどの場合、各VPCのために単一のエンドポイントサービスを作成する必要があります。このエンドポイントは、VPCから複数のClickHouse Cloudサービスへのリクエストをルーティングできます。
[こちら](#attention)を参照してください。

### プライベートエンドポイントへの接続がタイムアウトしました {#connection-to-private-endpoint-timed-out}

- VPCエンドポイントにセキュリティグループを添付してください。
- エンドポイントに添付されたセキュリティグループの`inbound`ルールを確認し、ClickHouseポートを許可してください。
- 接続テストに使用されるVMに添付されたセキュリティグループの`outbound`ルールを確認し、ClickHouseポートへの接続を許可してください。

### プライベートホスト名: ホストのアドレスが見つかりません {#private-hostname-not-found-address-of-host}

- DNS構成を確認してください。

### ピアによる接続リセット {#connection-reset-by-peer}

- おそらくエンドポイントIDがサービス許可リストに追加されていないため、[ステップ](#add-endpoint-id-to-services-allow-list)をご覧ください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
INSTANCE_ID=<インスタンスID>
```

[ステップ](#option-2-api)から`INSTANCE_ID`を取得できます。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

たとえば、ClickHouse Cloudで[MySQL](../../sql-reference/table-functions/mysql.md)または[PostgreSQL](../../sql-reference/table-functions/postgresql.md)テーブル関数を使用して、Amazon Web Services (AWS) VPCにホストされているデータベースに接続しようとしている場合、AWS PrivateLinkを使用してこの接続を安全に有効にすることはできません。PrivateLinkは一方向の単方向接続です。あなたの内部ネットワークまたはAmazon VPCがClickHouse Cloudに安全に接続できるようにしますが、ClickHouse Cloudが内部ネットワークに接続することはできません。

[AWS PrivateLinkのドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)によると：

> AWS PrivateLinkを使用するのは、クライアント/サーバーのセットアップがあり、特定のサービスまたはサービスプロバイダーVPC内のインスタンスのセットに対して1つ以上の消費者VPCによる単方向のアクセスを許可したい場合です。消費者VPC内のクライアントのみが、サービスプロバイダーVPC内のサービスへの接続を開始できます。

これを実現するために、AWSセキュリティグループを構成して、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可する必要があります。[ClickHouse CloudリージョンのデフォルトのイーグレスIPアドレス](/manage/security/cloud-endpoints-api)や、[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。
