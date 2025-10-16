---
'title': 'AWS PrivateLink'
'description': 'このドキュメントでは、AWS PrivateLinkを使用してClickHouse Cloudに接続する方法を説明します。'
'slug': '/manage/security/aws-privatelink'
'doc_type': 'guide'
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

[AWS PrivateLink](https://aws.amazon.com/privatelink/)を使用して、VPC、AWSサービス、オンプレミスシステム、及びClickHouse Cloud間で安全な接続を確立し、トラフィックを公衆インターネットにさらすことなく行うことができます。このドキュメントでは、AWS PrivateLinkを使用してClickHouse Cloudに接続する手順を概説します。

ClickHouse CloudのサービスへのアクセスをAWS PrivateLinkアドレスを介してのみ制限するには、ClickHouse Cloudの[IPアクセスリスト](/cloud/security/setting-ip-filters)の指示に従ってください。

:::note
ClickHouse Cloudは、以下のリージョンからの[クロスリージョンPrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)をサポートしています：
- sa-east-1
- il-central-1
- me-central-1
- me-south-1
- eu-central-2
- eu-north-1
- eu-south-2
- eu-west-3
- eu-south-1
- eu-west-2
- eu-west-1
- eu-central-1
- ca-west-1
- ca-central-1
- ap-northeast-1
- ap-southeast-2
- ap-southeast-1
- ap-northeast-2
- ap-northeast-3
- ap-south-1
- ap-southeast-4
- ap-southeast-3
- ap-south-2
- ap-east-1
- af-south-1
- us-west-2
- us-west-1
- us-east-2
- us-east-1
料金に関する考慮事項：AWSは、地域間データ転送にユーザーに料金を請求します。料金については[こちら](https://aws.amazon.com/privatelink/pricing/)をご覧ください。
:::

**AWS PrivateLinkを有効にするには、以下を完了してください**：
1. エンドポイント "サービス名" を取得します。
1. AWSエンドポイントを作成します。
1. "エンドポイントID" をClickHouse Cloud組織に追加します。
1. "エンドポイントID" をClickHouseサービスの許可リストに追加します。

Terraformの例は[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)にあります。

## 重要な考慮事項 {#considerations}
ClickHouseは、AWSリージョン内で同じ公開済み[サービスエンドポイント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)を再利用するために、サービスをグループ化しようとします。しかし、このグループ化は保証されておらず、特に複数のClickHouse組織にサービスを分散させている場合は注意が必要です。
すでにClickHouse組織内の他のサービスのためにPrivateLinkが設定されている場合、このグループ化により、ほとんどのステップをスキップして直接最終ステップに進むことができます：ClickHouseの "エンドポイントID" をClickHouseサービスの許可リストに追加します。

## このプロセスの前提条件 {#prerequisites}

開始する前に、以下が必要です：

1. あなたのAWSアカウント。
1. [ClickHouse APIキー](/cloud/manage/openapi)で、ClickHouse側でプライベートエンドポイントを作成および管理するための権限を持っていること。

## 手順 {#steps}

AWS PrivateLinkを介してClickHouse Cloudサービスに接続するための手順を示します。

### エンドポイント "サービス名" を取得する {#obtain-endpoint-service-info}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLink経由で接続したいサービスを開き、**設定**メニューに移動します。

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

`サービス名` と `DNS名` をメモして、[次のステップ](#create-aws-endpoint)に進んでください。

#### オプション 2: API {#option-2-api}

コマンドを実行する前に、以下の環境変数を設定します：

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

地域、プロバイダー、およびサービス名でフィルタリングしてClickHouseの`INSTANCE_ID`を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

PrivateLinkの設定のための`endpointServiceId`と`privateDnsHostname`を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドを実行すると、以下のような結果が返されるはずです：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモして、[次のステップ](#create-aws-endpoint)に進んでください。

### AWSエンドポイントを作成する {#create-aws-endpoint}

:::important
このセクションでは、AWS PrivateLink経由でClickHouseを設定するためのClickHouse固有の詳細を扱います。AWS固有の手順は、どこを見ればよいかを示すための参考として提供されますが、AWSクラウドプロバイダーからの通知なしに変更される可能性があります。特定の使用例に基づいてAWS設定を考慮してください。

ClickHouseは、必要なAWS VPCエンドポイント、セキュリティグループルール、またはDNSレコードの設定について責任を負いません。

以前にPrivateLinkを設定する際に「プライベートDNS名」を有効にし、新しいサービスをPrivateLink経由で設定する際に問題が発生した場合は、ClickHouseサポートにお問い合わせください。他のAWS設定タスクに関連する問題については、直接AWSサポートにお問い合わせください。
:::

#### オプション 1: AWSコンソール {#option-1-aws-console}

AWSコンソールを開き、**VPC** → **エンドポイント** → **エンドポイントを作成** に進みます。

**NLBとGWLBを使用するエンドポイントサービス**を選択し、[エンドポイント "サービス名" ](#obtain-endpoint-service-info)ステップから取得した`サービス名`<sup>console</sup>または`endpointServiceId`<sup>API</sup>を**サービス名**フィールドに入力します。**サービスを確認**をクリックします：

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink Endpoint Settings" border/>

PrivateLinkを使用してクロスリージョナル接続を確立する場合は、「クロスリージョンエンドポイント」チェックボックスを有効にし、サービスリージョンを指定します。サービスリージョンは、ClickHouseインスタンスが稼働している場所です。

「サービス名を確認できませんでした。」というエラーが表示された場合は、新しいリージョンをサポートされているリージョンリストに追加するように顧客サポートにお問い合わせください。

次に、自分のVPCとサブネットを選択します：

<Image img={aws_private_link_select_vpc} size="md" alt="Select VPC and subnets" border />

オプションのステップとして、セキュリティグループ/タグを割り当てます：

:::note
セキュリティグループでポート`443`、`8443`、`9440`、`3306`が許可されていることを確認してください。
:::

VPCエンドポイントを作成したら、`エンドポイントID`の値をメモします。これは今後のステップで必要になります。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC Endpoint ID" border/>

#### オプション 2: AWS CloudFormation {#option-2-aws-cloudformation}

次に、[エンドポイント "サービス名" ](#obtain-endpoint-service-info) ステップで取得した`サービス名`<sup>console</sup>または`endpointServiceId`<sup>API</sup>を使用してVPCエンドポイントを作成する必要があります。
正しいサブネットID、セキュリティグループ、およびVPC IDを使用してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId), pls see above>
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

VPCエンドポイントを作成したら、`エンドポイントID`の値をメモします。これは今後のステップで必要になります。

#### オプション 3: Terraform {#option-3-terraform}

以下の`service_name`は、[エンドポイント "サービス名" ](#obtain-endpoint-service-info) ステップで取得した`サービス名`<sup>console</sup>または`endpointServiceId`<sup>API</sup>です。

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<pls see comment above>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
  service_region      = "(Optional) If specified, the VPC endpoint will connect to the service in the provided region. Define it for multi-regional PrivateLink connections."
}
```

VPCエンドポイントを作成したら、`エンドポイントID`の値をメモします。これは今後のステップで必要になります。

#### エンドポイントのプライベートDNS名を設定する {#set-private-dns-name-for-endpoint}

:::note
DNSを構成する方法はさまざまです。特定の使用例に応じてDNSを設定してください。
:::

[エンドポイント "サービス名" ](#obtain-endpoint-service-info) ステップから取得した "DNS名" をAWSエンドポイントネットワークインターフェースにポイントする必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを正しく解決できるようになります。

### "エンドポイントID" をClickHouseサービスの許可リストに追加する {#add-endpoint-id-to-services-allow-list}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

追加するには、ClickHouse Cloudコンソールに移動し、PrivateLinkを介して接続したいサービスを開いてから、**設定**に移動します。**プライベートエンドポイントを設定**をクリックしてプライベートエンドポイントの設定を開きます。 [Create AWS Endpoint](#create-aws-endpoint) ステップから取得した`エンドポイントID`を入力します。**エンドポイントを作成**をクリックします。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints Filter" border/>

削除するには、ClickHouse Cloudコンソールに移動し、サービスを見つけ、サービスの**設定**に進み、削除したいエンドポイントを見つけます。リストから削除します。

#### オプション 2: API {#option-2-api-2}

PrivateLinkを使用して利用可能である必要がある各インスタンスの許可リストにエンドポイントIDを追加する必要があります。

[Create AWS Endpoint](#create-aws-endpoint) ステップからのデータを使用して`ENDPOINT_ID`環境変数を設定します。

コマンドを実行する前に、以下の環境変数を設定します：

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

許可リストにエンドポイントIDを追加するには：

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

許可リストからエンドポイントIDを削除するには：

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

Private Linkが有効な各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Linkを使用して接続するには、[Obtain Endpoint "Service name"](#obtain-endpoint-service-info) から取得した`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>console</sup>を使用する必要があります。

#### プライベートDNSホスト名を取得する {#getting-private-dns-hostname}

##### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

<Image img={aws_private_link_ped_nsname} size="md" alt="Private Endpoint DNS Name" border />

##### オプション 2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定します：

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

[ステップ](#option-2-api)から`INSTANCE_ID`を取得できます。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドを実行すると、以下のような出力が得られます：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

この例では、`privateDnsHostname`ホスト名の値を介しての接続はPrivateLinkにルーティングされますが、`endpointServiceId`ホスト名を介した接続はインターネットを経由します。

## トラブルシューティング {#troubleshooting}

### 1つのリージョンでの複数のPrivateLink {#multiple-privatelinks-in-one-region}

ほとんどの場合、各VPCに対して単一のエンドポイントサービスを作成するだけで済みます。このエンドポイントは、VPCから複数のClickHouse Cloudサービスへのリクエストをルーティングできます。
詳細については[こちら](#considerations)を参照してください。

### プライベートエンドポイントへの接続がタイムアウトした {#connection-to-private-endpoint-timed-out}

- VPCエンドポイントにセキュリティグループを割り当ててください。
- エンドポイントに添付されているセキュリティグループの`inbound`ルールを確認し、ClickHouseのポートを許可してください。
- 接続テストに使用されるVMに添付されているセキュリティグループの`outbound`ルールを確認し、ClickHouseのポートへの接続を許可してください。

### プライベートホスト名：ホストのアドレスが見つかりませんでした {#private-hostname-not-found-address-of-host}

- DNS構成を確認してください。

### ピアによって接続がリセットされた {#connection-reset-by-peer}

- おそらく、エンドポイントIDがサービスの許可リストに追加されていないためです。 [ステップ](#add-endpoint-id-to-services-allow-list)を確認してください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定します：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

[ステップ](#option-2-api)から`INSTANCE_ID`を取得できます。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### リモートデータベースに接続する {#connecting-to-a-remote-database}

たとえば、[MySQL](/sql-reference/table-functions/mysql)や[PostgreSQL](/sql-reference/table-functions/postgresql)のテーブル機能をClickHouse Cloudで使用し、Amazon Web Services (AWS) VPCにホストされたデータベースに接続しようとしている場合、AWS PrivateLinkはこの接続を安全に有効にするために使用できません。PrivateLinkは一方向の接続です。あなたの内部ネットワークまたはAmazon VPCがClickHouse Cloudに安全に接続することはできますが、ClickHouse Cloudがあなたの内部ネットワークに接続することはできません。

[AWS PrivateLinkのドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)によれば：

> AWS PrivateLinkを使用するのは、クライアント/サーバーセットアップがあり、消費者VPCがサービスプロバイダーVPC内の特定のサービスまたはインスタンスのセットに一方向のアクセスを許可したい場合です。消費者VPC内のクライアントのみがサービスプロバイダVPC内のサービスへの接続を開始できます。

これを行うには、AWSセキュリティグループを設定して、ClickHouse Cloudがあなたの内部/プライベートデータベースサービスに接続できるようにします。ClickHouse Cloudリージョンの[デフォルトの送信IPアドレス](/manage/security/cloud-endpoints-api)や、[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。
