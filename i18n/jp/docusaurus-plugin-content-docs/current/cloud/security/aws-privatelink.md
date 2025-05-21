---
title: 'AWS PrivateLink'
description: 'このドキュメントでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する方法について説明します。'
slug: /manage/security/aws-privatelink
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

AWS PrivateLink を使用すると、VPC、AWS サービス、オンプレミス システム、ClickHouse Cloud 間のセキュアな接続を確立でき、トラフィックを公共のインターネットにさらすことなく接続が可能です。このドキュメントでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する手順について説明します。

ClickHouse Cloud のサービスへのアクセスを AWS PrivateLink アドレスを介してのみ制限するには、ClickHouse Cloud の [IP アクセスリスト](/cloud/security/setting-ip-filters) に従ってください。

:::note
ClickHouse Cloud は現在、ベータ版として [クロスリージョン PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) をサポートしています。
:::


**AWS PrivateLink を有効にするために次の手順を実行してください**:
1. エンドポイント「サービス名」を取得します。
1. AWS エンドポイントを作成します。
1. 「エンドポイント ID」を ClickHouse Cloud 組織に追加します。
1. 「エンドポイント ID」を ClickHouse サービスの許可リストに追加します。


Terraform の例は [こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) で確認できます。


## 注意 {#attention}
ClickHouse は、同じ公開された [サービスエンドポイント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) を使用して、サービスをグループ化し再利用しようとします。ただし、このグループ化は保証されていません。特に、複数の ClickHouse 組織にサービスを分散させている場合は注意が必要です。
既存の ClickHouse 組織内の他のサービス用に PrivateLink が設定されている場合、そのグループ化のためにほとんどの手順をスキップし、最終手順である [ClickHouse の「エンドポイント ID」を ClickHouse サービスの許可リストに追加する](#add-endpoint-id-to-services-allow-list) に直接進むことができます。


## 前提条件 {#prerequisites}

始める前に必要なものは次のとおりです:

1. AWS アカウント。
1. ClickHouse 側でプライベートエンドポイントを作成および管理するために必要な権限を持った [ClickHouse API キー](/cloud/manage/openapi)。

## 手順 {#steps}

AWS PrivateLink を介して ClickHouse Cloud サービスに接続するには、次の手順に従ってください。

### エンドポイント「サービス名」を取得 {#obtain-endpoint-service-info}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、PrivateLink を介して接続したいサービスを開き、**設定** メニューに移動します。

<Image img={aws_private_link_pecreate} size="md" alt="プライベートエンドポイント" border />

`サービス名` と `DNS 名` をメモし、次の手順に進んでください [次のステップに移動](#create-aws-endpoint) 。

#### オプション 2: API {#option-2-api}

コマンドを実行する前に、次の環境変数を設定します:

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

地域、プロバイダー、サービス名でフィルタリングして ClickHouse の `INSTANCE_ID` を取得します:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

プライベートリンク設定の `endpointServiceId` と `privateDnsHostname` を取得します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドは次のような出力を返すはずです:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモし、次のステップに進んでください [次のステップに移動](#create-aws-endpoint) 。

### AWS エンドポイントを作成 {#create-aws-endpoint}

:::important
このセクションでは、AWS PrivateLink を介して ClickHouse を設定するための ClickHouse 特有の詳細をカバーしています。AWS 特有の手順も参考のために提供されており、どこを参照すればよいかについてのガイダンスを提供しますが、これらは予告なく変更される場合があります。特定の使用ケースに基づいて AWS 設定を考慮してください。  

ClickHouse は、必要な AWS VPC エンドポイント、セキュリティグループルール、または DNS レコードの設定に対して責任を負いません。    

これまでに PrivateLink の設定時に「プライベート DNS 名」を有効にしていて、新しいサービスの PrivateLink の設定に問題がある場合は、ClickHouse サポートまでお問い合わせください。AWS 設定タスクに関するその他の問題については、AWS サポートに直接ご連絡ください。
:::

#### オプション 1: AWS コンソール {#option-1-aws-console}

AWS コンソールを開き、**VPC** → **エンドポイント** → **エンドポイントの作成** に進みます。

**NLB および GWLB を使用するエンドポイントサービス** を選択し、[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した `サービス名`<sup>console</sup> または `endpointServiceId`<sup>API</sup> を **サービス名** フィールドに入力します。**サービスを確認** をクリックします:

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink エンドポイント設定" border/>

クロスリージョン接続を PrivateLink を介して確立したい場合は、「クロスリージョンエンドポイント」チェックボックスを有効にし、サービスリージョンを指定します。サービスリージョンは、ClickHouse インスタンスが実行されている場所です。

「サービス名が確認できませんでした。」というエラーが発生した場合は、新しいリージョンをサポートされるリージョンリストに追加するように Customer Support にご連絡ください。

次に、VPC とサブネットを選択します:

<Image img={aws_private_link_select_vpc} size="md" alt="VPC およびサブネットの選択" border />

オプションのステップとして、セキュリティグループ/タグを割り当てます:

:::note
セキュリティグループでポート `443`、`8443`、`9440`、`3306` が許可されていることを確認してください。
:::

VPC エンドポイントを作成した後は、`エンドポイント ID` の値をメモしてください。次のステップで必要になります。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC エンドポイント ID" border/>

#### オプション 2: AWS CloudFormation {#option-2-aws-cloudformation}

次に、[エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した `サービス名`<sup>console</sup> または `endpointServiceId`<sup>API</sup> を使用して VPC エンドポイントを作成します。
正しいサブネット ID、セキュリティグループ、VPC ID を使用してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <サービス名(endpointServiceId)、上記を参照してください>
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

VPC エンドポイントを作成した後は、`エンドポイント ID` の値をメモしてください。次のステップで必要になります。

#### オプション 3: Terraform {#option-3-terraform}

以下の `service_name` は [エンドポイント「サービス名」](#obtain-endpoint-service-info)ステップで取得した `サービス名`<sup>console</sup> または `endpointServiceId`<sup>API</sup> です。

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<上記のコメントを参照してください>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(オプション) 指定すると、VPC エンドポイントは指定されたリージョンのサービスに接続します。マルチリージョンの PrivateLink 接続のために定義します。"
}
```

VPC エンドポイントを作成した後は、`エンドポイント ID` の値をメモしてください。次のステップで必要になります。

#### エンドポイントのためのプライベート DNS 名を設定 {#set-private-dns-name-for-endpoint}

:::note
DNS の設定方法はさまざまです。具体的な使用ケースに応じて DNS を設定してください。
:::

[エンドポイント「サービス名」](#obtain-endpoint-service-info) ステップから取得した「DNS 名」を AWS エンドポイントネットワークインターフェイスにポイントする必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを適切に解決できるようになります。

### 「エンドポイント ID」を ClickHouse サービスの許可リストに追加 {#add-endpoint-id-to-services-allow-list}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

追加するには、ClickHouse Cloud コンソールに移動し、PrivateLink 経由で接続したいサービスを開き、**設定**に移動します。**プライベートエンドポイントの設定**をクリックしてプライベートエンドポイント設定を開きます。[Create AWS エンドポイント](#create-aws-endpoint) ステップで取得した `エンドポイント ID` を入力します。「エンドポイントを作成」をクリックします。

:::note
既存の PrivateLink 接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="プライベートエンドポイントフィルター" border/>

削除するには、ClickHouse Cloud コンソールに移動し、サービスを見つけ、その**設定**に移動し、削除したいエンドポイントを見つけます。エンドポイントのリストから削除します。 

#### オプション 2: API {#option-2-api-2}

各インスタンスで PrivateLink を使用できるようにするには、エンドポイント ID を許可リストに追加する必要があります。

[Create AWS エンドポイント](#create-aws-endpoint) ステップのデータを使用して `ENDPOINT_ID` 環境変数を設定します。

コマンドを実行する前に次の環境変数を設定します:

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

エンドポイント ID を許可リストに追加するには:

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

許可リストからエンドポイント ID を削除するには:

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

### PrivateLink を使用してインスタンスにアクセス {#accessing-an-instance-using-privatelink}

Private Link が有効な各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Link を使用して接続するには、[エンドポイント「サービス名」に基づく](#obtain-endpoint-service-info) `privateDnsHostname`<sup>API</sup> または `DNS 名`<sup>console</sup> を使用する必要があります。


#### プライベート DNS ホスト名の取得 {#getting-private-dns-hostname}

##### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールに移動し、**設定**に進みます。**プライベートエンドポイントの設定**ボタンをクリックします。表示されたフライアウトで **DNS 名** をコピーします。

<Image img={aws_private_link_ped_nsname} size="md" alt="プライベートエンドポイント DNS 名" border />

##### オプション 2: API {#option-2-api-3}

コマンドを実行する前に次の環境変数を設定します:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

`INSTANCE_ID` は [ステップ](#option-2-api) から取得できます。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

これにより、次のような出力が得られます:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

この例では、`privateDnsHostname` のホスト名の値を介して接続が PrivateLink にルーティングされますが、`endpointServiceId` のホスト名を介する接続はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### 1つのリージョン内の複数の PrivateLink {#multiple-privatelinks-in-one-region}

ほとんどの場合、各 VPC に対して単一のエンドポイントサービスを作成するだけで済みます。このエンドポイントは、VPC から複数の ClickHouse Cloud サービスへのリクエストをルーティングできます。
[こちらを参照してください](#attention)

### プライベートエンドポイントへの接続がタイムアウトした {#connection-to-private-endpoint-timed-out}

- VPC エンドポイントにセキュリティグループを添付してください。
- エンドポイントに添付されているセキュリティグループの `inbound` ルールを確認し、ClickHouse ポートを許可してください。
- 接続テストに使用される VM に添付されているセキュリティグループの `outbound` ルールを確認し、ClickHouse ポートへの接続を許可してください。

### プライベートホスト名: ホストのアドレスが見つかりません {#private-hostname-not-found-address-of-host}

- DNS 設定を確認してください。

### 接続がピアによってリセットされた {#connection-reset-by-peer}

- おそらくエンドポイント ID がサービスの許可リストに追加されていません。 [ステップ](#add-endpoint-id-to-services-allow-list) を確認してください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に次の環境変数を設定します:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<Please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

`INSTANCE_ID` は [ステップ](#option-2-api) から取得できます。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

たとえば、ClickHouse Cloud で [MySQL](../../sql-reference/table-functions/mysql.md) または [PostgreSQL](../../sql-reference/table-functions/postgresql.md) テーブル関数を使用し、Amazon Web Services (AWS) VPC でホストされているデータベースに接続しようとしているとします。AWS PrivateLink はこの接続を安全に有効にすることができません。PrivateLink は一方向の接続です。それにより、内部ネットワークまたは Amazon VPC が ClickHouse Cloud に安全につながることができますが、ClickHouse Cloud が内部ネットワークに接続することはできません。

[AWS PrivateLink ドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html) によると：

> クライアント/サーバー設定があり、消費者 VPC がサービスプロバイダ VPC の特定のサービスまたはそのサービス内のインスタンスのユニディレクショナルアクセスを許可したい場合は、AWS PrivateLink を使用します。消費者 VPC のクライアントのみがサービスプロバイダ VPC のサービスへの接続を開始することができます。

これを実現するには、AWS セキュリティグループを設定して、ClickHouse Cloud から内部/プライベートデータベースサービスへの接続を許可してください。[ClickHouse Cloud リージョン用のデフォルトエグレスIPアドレス](/manage/security/cloud-endpoints-api) と [利用可能な静的 IP アドレス](https://api.clickhouse.cloud/static-ips.json) を確認してください。
