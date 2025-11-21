---
title: 'AWS PrivateLink'
description: 'このドキュメントでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する方法を説明します。'
slug: /manage/security/aws-privatelink
keywords: ['PrivateLink']
doc_type: 'guide'
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

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用すると、トラフィックをパブリックインターネットに公開することなく、VPC、AWS サービス、オンプレミスシステムと ClickHouse Cloud 間で安全な接続を確立できます。本ドキュメントでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する手順を説明します。

ClickHouse Cloud サービスへのアクセスを AWS PrivateLink アドレス経由のみに制限するには、ClickHouse Cloud の [IP Access Lists](/cloud/security/setting-ip-filters) に関する手順に従ってください。

:::note
ClickHouse Cloud は、以下のリージョンからの [クロスリージョン PrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/) をサポートしています:
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
料金に関する注意事項: AWS はクロスリージョンデータ転送料金をユーザーに請求します。料金については [こちら](https://aws.amazon.com/privatelink/pricing/) を参照してください。
:::

**AWS PrivateLink を有効にするには、次の作業を完了してください**:
1. エンドポイントの "Service name" を取得します。
1. AWS エンドポイントを作成します。
1. ClickHouse Cloud 組織に "Endpoint ID" を追加します。
1. ClickHouse サービスの許可リストに "Endpoint ID" を追加します。

Terraform のサンプルは [こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) を参照してください。



## 重要な考慮事項 {#considerations}

ClickHouseは、AWSリージョン内で同じ公開済み[サービスエンドポイント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview)を再利用するために、サービスのグループ化を試みます。ただし、このグループ化は保証されておらず、特に複数のClickHouse組織にサービスを分散している場合は保証されません。
ClickHouse組織内の他のサービスに対してPrivateLinkが既に設定されている場合、このグループ化により、ほとんどの手順をスキップして最終手順に直接進むことができます:ClickHouseサービスの許可リストにClickHouseの「エンドポイントID」を追加します。


## この手順の前提条件 {#prerequisites}

開始する前に、以下が必要です：

1. AWSアカウント
1. ClickHouse側でプライベートエンドポイントを作成および管理するために必要な権限を持つ[ClickHouse APIキー](/cloud/manage/openapi)


## 手順 {#steps}

AWS PrivateLink経由でClickHouse Cloudサービスに接続するには、以下の手順に従ってください。

### エンドポイントの「サービス名」を取得する {#obtain-endpoint-service-info}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLink経由で接続するサービスを開き、**Settings**メニューに移動します。

<Image
  img={aws_private_link_pecreate}
  size='md'
  alt='プライベートエンドポイント'
  border
/>

`Service name`と`DNS name`をメモしてから、[次の手順に進みます](#create-aws-endpoint)。

#### オプション2: API {#option-2-api}

まず、コマンドを実行する前に以下の環境変数を設定します:

```shell
REGION=<AWSフォーマットを使用したリージョンコード、例: us-west-2>
PROVIDER=aws
KEY_ID=<ClickHouseキーID>
KEY_SECRET=<ClickHouseキーシークレット>
ORG_ID=<ClickHouse組織ID>
SERVICE_NAME=<ClickHouseサービス名>
```

リージョン、プロバイダー、サービス名でフィルタリングして、ClickHouseの`INSTANCE_ID`を取得します:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

PrivateLink設定用の`endpointServiceId`と`privateDnsHostname`を取得します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドは次のような結果を返します:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId`と`privateDnsHostname`をメモして、[次の手順に進みます](#create-aws-endpoint)。

### AWSエンドポイントを作成する {#create-aws-endpoint}

:::important
このセクションでは、AWS PrivateLink経由でClickHouseを設定するためのClickHouse固有の詳細について説明します。AWS固有の手順は参照用として提供されていますが、AWSクラウドプロバイダーからの通知なしに変更される可能性があります。特定のユースケースに基づいてAWS設定を検討してください。

ClickHouseは、必要なAWS VPCエンドポイント、セキュリティグループルール、またはDNSレコードの設定に責任を負わないことにご注意ください。

PrivateLinkの設定時に以前「プライベートDNS名」を有効にしており、PrivateLink経由で新しいサービスを設定する際に問題が発生している場合は、ClickHouseサポートにお問い合わせください。AWS設定タスクに関連するその他の問題については、AWSサポートに直接お問い合わせください。
:::

#### オプション1: AWSコンソール {#option-1-aws-console}

AWSコンソールを開き、**VPC** → **Endpoints** → **Create endpoints**に移動します。

**Endpoint services that use NLBs and GWLBs**を選択し、[エンドポイントの「サービス名」を取得する](#obtain-endpoint-service-info)手順で取得した`Service name`<sup>コンソール</sup>または`endpointServiceId`<sup>API</sup>を**Service Name**フィールドに入力します。**Verify service**をクリックします:

<Image
  img={aws_private_link_endpoint_settings}
  size='md'
  alt='AWS PrivateLinkエンドポイント設定'
  border
/>

PrivateLink経由でクロスリージョン接続を確立する場合は、「Cross region endpoint」チェックボックスを有効にして、サービスリージョンを指定します。サービスリージョンは、ClickHouseインスタンスが実行されている場所です。

「Service name could not be verified.」エラーが表示された場合は、カスタマーサポートに連絡して、サポート対象リージョンリストへの新しいリージョンの追加を依頼してください。

次に、VPCとサブネットを選択します:

<Image
  img={aws_private_link_select_vpc}
  size='md'
  alt='VPCとサブネットを選択'
  border
/>

オプションの手順として、セキュリティグループ/タグを割り当てます:

:::note
セキュリティグループでポート`443`、`8443`、`9440`、`3306`が許可されていることを確認してください。
:::

VPCエンドポイントを作成した後、`Endpoint ID`の値をメモしてください。今後の手順で必要になります。

<Image
  img={aws_private_link_vpc_endpoint_id}
  size='md'
  alt='VPCエンドポイントID'
  border
/>

#### オプション2: AWS CloudFormation {#option-2-aws-cloudformation}


次に、[エンドポイント「Service name」の取得](#obtain-endpoint-service-info)の手順で取得した`Service name`<sup>console</sup>または`endpointServiceId`<sup>API</sup>を使用してVPCエンドポイントを作成する必要があります。
正しいサブネットID、セキュリティグループ、VPC IDを使用してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <Service name(endpointServiceId)、上記を参照>
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

VPCエンドポイントを作成した後、`Endpoint ID`の値を記録してください。後続の手順で必要になります。

#### オプション3: Terraform {#option-3-terraform}

以下の`service_name`は、[エンドポイント「Service name」の取得](#obtain-endpoint-service-info)の手順で取得した`Service name`<sup>console</sup>または`endpointServiceId`<sup>API</sup>です

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
  service_region      = "(オプション) 指定した場合、VPCエンドポイントは指定されたリージョンのサービスに接続します。複数リージョンにまたがるPrivateLink接続の場合に定義してください。"
}
```

VPCエンドポイントを作成した後、`Endpoint ID`の値を記録してください。後続の手順で必要になります。

#### エンドポイントのプライベートDNS名を設定する {#set-private-dns-name-for-endpoint}

:::note
DNSを設定する方法は複数あります。具体的なユースケースに応じてDNSを設定してください。
:::

[エンドポイント「Service name」の取得](#obtain-endpoint-service-info)の手順で取得した「DNS name」をAWSエンドポイントのネットワークインターフェースに向ける必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントが適切に名前解決できるようになります。

### ClickHouseサービスの許可リストに「Endpoint ID」を追加する {#add-endpoint-id-to-services-allow-list}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

追加するには、ClickHouse Cloudコンソールに移動し、PrivateLink経由で接続したいサービスを開いて**Settings**に移動します。**Set up private endpoint**をクリックしてプライベートエンドポイント設定を開きます。[AWSエンドポイントの作成](#create-aws-endpoint)の手順で取得した`Endpoint ID`を入力します。「Create endpoint」をクリックします。

:::note
既存のPrivateLink接続からのアクセスを許可する場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image
  img={aws_private_link_pe_filters}
  size='md'
  alt='プライベートエンドポイントフィルター'
  border
/>

削除するには、ClickHouse Cloudコンソールに移動し、サービスを見つけて、サービスの**Settings**に移動し、削除したいエンドポイントを見つけます。エンドポイントのリストから削除してください。

#### オプション2: API {#option-2-api-2}

PrivateLinkを使用して利用可能にする各インスタンスの許可リストにEndpoint IDを追加する必要があります。

[AWSエンドポイントの作成](#create-aws-endpoint)の手順のデータを使用して`ENDPOINT_ID`環境変数を設定します。

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
REGION=<AWS形式のリージョンコード、例: us-west-2>
PROVIDER=aws
KEY_ID=<ClickHouseキーID>
KEY_SECRET=<ClickHouseキーシークレット>
ORG_ID=<ClickHouse組織ID>
SERVICE_NAME=<ClickHouseサービス名>
```

許可リストにエンドポイントIDを追加するには:

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


許可リストからエンドポイントIDを削除するには:

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

### PrivateLinkを使用したインスタンスへのアクセス {#accessing-an-instance-using-privatelink}

Private Linkが有効化された各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Linkを使用して接続するには、[エンドポイント「サービス名」の取得](#obtain-endpoint-service-info)から取得した`privateDnsHostname`<sup>API</sup>または`DNS Name`<sup>コンソール</sup>のプライベートエンドポイントを使用する必要があります。

#### プライベートDNSホスト名の取得 {#getting-private-dns-hostname}

##### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**Settings**に移動します。**Set up private endpoint**ボタンをクリックします。表示されたフライアウトで、**DNS Name**をコピーします。

<Image
  img={aws_private_link_ped_nsname}
  size='md'
  alt='プライベートエンドポイントDNS名'
  border
/>

##### オプション2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

`INSTANCE_ID`は[ステップ](#option-2-api)から取得できます。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

次のような出力が得られます:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

この例では、`privateDnsHostname`ホスト名を介した接続はPrivateLinkにルーティングされますが、`endpointServiceId`ホスト名を介した接続はインターネット経由でルーティングされます。


## トラブルシューティング {#troubleshooting}

### 1つのリージョンに複数のPrivateLink {#multiple-privatelinks-in-one-region}

ほとんどの場合、各VPCに対して1つのエンドポイントサービスを作成するだけで十分です。このエンドポイントは、VPCから複数のClickHouse Cloudサービスへのリクエストをルーティングできます。
[こちら](#considerations)を参照してください。

### プライベートエンドポイントへの接続がタイムアウトした {#connection-to-private-endpoint-timed-out}

- VPCエンドポイントにセキュリティグループをアタッチしてください。
- エンドポイントにアタッチされたセキュリティグループの`inbound`ルールを確認し、ClickHouseポートを許可してください。
- 接続テストに使用するVMにアタッチされたセキュリティグループの`outbound`ルールを確認し、ClickHouseポートへの接続を許可してください。

### プライベートホスト名: ホストのアドレスが見つかりません {#private-hostname-not-found-address-of-host}

- DNS設定を確認してください。

### 接続がピアによってリセットされました {#connection-reset-by-peer}

- エンドポイントIDがサービスの許可リストに追加されていない可能性が高いです。[手順](#add-endpoint-id-to-services-allow-list)を参照してください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
INSTANCE_ID=<インスタンスID>
```

`INSTANCE_ID`は[手順](#option-2-api)から取得できます。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

ClickHouse Cloudで[MySQL](/sql-reference/table-functions/mysql)または[PostgreSQL](/sql-reference/table-functions/postgresql)テーブル関数を使用し、Amazon Web Services (AWS) VPCでホストされているデータベースに接続しようとしているとします。AWS PrivateLinkは、この接続を安全に有効にするために使用することはできません。PrivateLinkは一方向の単方向接続です。内部ネットワークまたはAmazon VPCからClickHouse Cloudへの安全な接続を可能にしますが、ClickHouse Cloudから内部ネットワークへの接続は許可しません。

[AWS PrivateLinkドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)によると:

> AWS PrivateLinkは、1つ以上のコンシューマーVPCにサービスプロバイダーVPC内の特定のサービスまたはインスタンスセットへの単方向アクセスを許可するクライアント/サーバー構成がある場合に使用します。コンシューマーVPC内のクライアントのみが、サービスプロバイダーVPC内のサービスへの接続を開始できます。

これを実現するには、AWSセキュリティグループを設定して、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可します。[ClickHouse CloudリージョンのデフォルトエグレスIPアドレス](/manage/data-sources/cloud-endpoints-api)と[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。
