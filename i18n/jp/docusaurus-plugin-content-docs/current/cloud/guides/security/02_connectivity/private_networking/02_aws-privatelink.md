---
title: 'AWS PrivateLink'
description: 'このガイドでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する方法について説明します。'
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

# AWS PrivateLink \\{#aws-privatelink\\}

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

[AWS PrivateLink](https://aws.amazon.com/privatelink/) を使用すると、VPC、AWS サービス、オンプレミスシステム、および ClickHouse Cloud 間で、安全な接続を確立しつつ、トラフィックをパブリックインターネット上に公開せずに済みます。本ドキュメントでは、AWS PrivateLink を使用して ClickHouse Cloud に接続する手順を説明します。

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
料金に関する注意: クロスリージョン間のデータ転送については AWS から課金されます。料金の詳細は[こちら](https://aws.amazon.com/privatelink/pricing/)を参照してください。
:::

**AWS PrivateLink を有効にするには、次を実施してください**:
1. エンドポイントの「Service name」を取得する。
1. AWS Endpoint を作成する。
1. ClickHouse Cloud の組織に「Endpoint ID」を追加する。
1. ClickHouse サービスの許可リストに「Endpoint ID」を追加する。

Terraform のサンプルは[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)を参照してください。

## 重要な考慮事項 \\{#considerations\\}
ClickHouse は、AWS リージョン内で同じ公開済みの [サービスエンドポイント](https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-share-your-services.html#endpoint-service-overview) を再利用できるよう、サービスをグループ化しようとします。ただし、このグループ化が常に保証されるわけではなく、特にサービスを複数の ClickHouse 組織に分散している場合には当てはまらないことがあります。
すでに同じ ClickHouse 組織内の他のサービス向けに PrivateLink を構成済みの場合は、そのグループ化により多くの手順を省略できることが多く、最終ステップである「ClickHouse のエンドポイント ID を ClickHouse サービスの許可リストに追加する」に直接進むことができます。

## この手順の前提条件 \\{#prerequisites\\}

作業を開始する前に、次のものを用意してください。

1. 利用可能な AWS アカウント
1. ClickHouse 側でプライベートエンドポイントを作成および管理するために必要な権限を持つ [ClickHouse API キー](/cloud/manage/openapi)

## 手順 \\{#steps\\}

次の手順に従って、AWS PrivateLink 経由で ClickHouse Cloud サービスに接続します。

### エンドポイントの「Service name」を取得する \\{#obtain-endpoint-service-info\\}

#### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console\\}

ClickHouse Cloud コンソールで、PrivateLink 経由で接続したいサービスを開き、**Settings** メニューに移動します。

<Image img={aws_private_link_pecreate} size="md" alt="Private Endpoints" border />

`Service name` と `DNS name` をメモしたら、[次のステップに進みます](#create-aws-endpoint)。

#### オプション 2: API \\{#option-2-api\\}

まず、コマンドを実行する前に次の環境変数を設定します。

```shell
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

リージョン、プロバイダー、サービス名で絞り込んで ClickHouse の `INSTANCE_ID` を取得します。

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

PrivateLink 構成用の `endpointServiceId` と `privateDnsHostname` を取得します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

このコマンドを実行すると、次のような出力が得られます。

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` を控えてから、[次のステップに進みます](#create-aws-endpoint)。

### AWS エンドポイントを作成する \\{#create-aws-endpoint\\}

:::important
このセクションでは、AWS PrivateLink を介して ClickHouse を構成するための、ClickHouse 固有の詳細について説明します。AWS 固有の手順は、どこを参照すべきかを示すための参考情報として提供しているものであり、AWS クラウドプロバイダからの事前通知なしに変更される可能性があります。ご利用のユースケースに基づいて、適切に AWS の設定を行ってください。

必要な AWS VPC エンドポイント、セキュリティグループルール、DNS レコードの構成については、ClickHouse は責任を負いません。

以前に PrivateLink のセットアップ時に「private DNS names」を有効にしており、PrivateLink 経由で新しいサービスを構成する際に問題が発生している場合は、ClickHouse サポートにお問い合わせください。その他の AWS 設定作業に関連する問題については、AWS サポートへ直接お問い合わせください。
:::

#### オプション 1: AWS コンソール \\{#option-1-aws-console\\}

AWS コンソールを開き、**VPC** → **Endpoints** → **Create endpoints** に移動します。

**Endpoint services that use NLBs and GWLBs** を選択し、**Service Name** フィールドに、[Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info) の手順で取得した `Service name`<sup>console</sup> または `endpointServiceId`<sup>API</sup> を指定します。**Verify service** をクリックします。

<Image img={aws_private_link_endpoint_settings} size="md" alt="AWS PrivateLink エンドポイント設定" border />

PrivateLink を介してリージョンをまたいだ接続を確立したい場合は、「Cross region endpoint」チェックボックスを有効にし、サービスリージョンを指定します。サービスリージョンは、ClickHouse インスタンスが動作しているリージョンです。

「Service name could not be verified.」というエラーが表示された場合は、サポート対象リージョンへの新規リージョン追加を依頼するために、カスタマーサポートにお問い合わせください。

次に、VPC とサブネットを選択します。

<Image img={aws_private_link_select_vpc} size="md" alt="VPC とサブネットの選択" border />

任意の手順として、Security groups/Tags を割り当てます。

:::note
セキュリティグループで、ポート `443`, `8443`, `9440`, `3306` が許可されていることを確認してください。
:::

VPC エンドポイントを作成したら、`Endpoint ID` の値を控えておきます。次のステップで必要になります。

<Image img={aws_private_link_vpc_endpoint_id} size="md" alt="VPC エンドポイント ID" border />

#### オプション 2: AWS CloudFormation \\{#option-2-aws-cloudformation\\}

次に、[エンドポイントの「Service name」を取得](#obtain-endpoint-service-info) の手順で取得した `Service name`<sup>console</sup> または `endpointServiceId`<sup>API</sup> を使用して、VPC エンドポイントを作成する必要があります。
正しいサブネット ID、セキュリティグループ、および VPC ID を使用していることを確認してください。

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

VPC エンドポイントを作成したら、`Endpoint ID` の値を控えておいてください。後続のステップで必要になります。

#### オプション 3: Terraform \\{#option-3-terraform\\}

以下の `service_name` には、[Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info) のステップで取得した `Service name`<sup>console</sup> または `endpointServiceId`<sup>API</sup> を指定します。

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

VPC Endpoint を作成したら、`Endpoint ID` の値を控えておいてください。後続の手順で必要になります。

#### エンドポイントのプライベート DNS 名を設定する \\{#set-private-dns-name-for-endpoint\\}

:::note
DNS の構成方法はいくつかあります。ご利用のユースケースに応じて、適切に DNS を構成してください。
:::

[Obtain Endpoint &quot;Service name&quot; ](#obtain-endpoint-service-info) の手順で取得した「DNS name」が、AWS Endpoint のネットワークインターフェイスを指すように設定する必要があります。これにより、VPC/ネットワーク内のサービスやコンポーネントから、正しく名前解決できるようになります。

### ClickHouse サービスの許可リストに「Endpoint ID」を追加する \\{#add-endpoint-id-to-services-allow-list\\}

#### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console-2\\}

追加するには、ClickHouse Cloud コンソールに移動し、PrivateLink 経由で接続したいサービスを開いてから、**Settings** に移動します。**Set up private endpoint** をクリックしてプライベートエンドポイントの設定を開きます。[Create AWS Endpoint](#create-aws-endpoint) の手順で取得した `Endpoint ID` を入力します。最後に &quot;Create endpoint&quot; をクリックします。

:::note
既存の PrivateLink 接続からのアクセスを許可したい場合は、既存のエンドポイントをドロップダウンメニューから選択してください。
:::

<Image img={aws_private_link_pe_filters} size="md" alt="Private Endpoints フィルター" border />

削除するには、ClickHouse Cloud コンソールに移動し、対象のサービスを見つけてその **Settings** に移動し、削除したいエンドポイントを探します。エンドポイントの一覧からそのエンドポイントを削除します。

#### オプション 2: API \\{#option-2-api-2\\}

PrivateLink 経由で利用可能にする必要がある各インスタンスについて、その許可リストに Endpoint ID を追加する必要があります。

[Create AWS Endpoint](#create-aws-endpoint) の手順で取得した情報を使用して、`ENDPOINT_ID` 環境変数を設定します。

コマンドを実行する前に、次の環境変数を設定します。

```bash
REGION=<Your region code using the AWS format, for example: us-west-2>
PROVIDER=aws
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

許可リストにエンドポイント ID を追加するには、次の手順を実行します。

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

許可リストからエンドポイント ID を削除するには、次の手順を実行します。

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

### PrivateLink を使用してインスタンスにアクセスする \\{#accessing-an-instance-using-privatelink\\}

PrivateLink を有効にした各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。PrivateLink を使用して接続するには、プライベートエンドポイントを使用する必要があります。これは `privateDnsHostname`<sup>API</sup> または `DNS Name`<sup>console</sup> のいずれかであり、[エンドポイント &quot;Service name&quot; の取得](#obtain-endpoint-service-info) で確認できます。

#### プライベート DNS ホスト名の取得 \\{#getting-private-dns-hostname\\}

##### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console-3\\}

ClickHouse Cloud コンソールで **Settings** に移動します。**Set up private endpoint** ボタンをクリックします。開いたフライアウトで **DNS Name** をコピーします。

<Image img={aws_private_link_ped_nsname} size="md" alt="プライベートエンドポイントの DNS 名" border />

##### オプション 2: API \\{#option-2-api-3\\}

コマンドを実行する前に、次の環境変数を設定します:

```bash
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
INSTANCE_ID=<Your ClickHouse service name>
```

`INSTANCE_ID` は [こちらの手順](#option-2-api)から取得できます。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | \
jq .result
```

次のような出力が得られるはずです:

```result
{
  "endpointServiceId": "com.amazonaws.vpce.us-west-2.vpce-svc-xxxxxxxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxxxxx.us-west-2.vpce.aws.clickhouse.cloud"
}
```

この例では、`privateDnsHostname` の値に対応するホスト名での接続は PrivateLink 経由でルーティングされますが、`endpointServiceId` に対応するホスト名での接続はインターネット経由でルーティングされます。

## トラブルシューティング \\{#troubleshooting\\}

### 1 つのリージョン内で複数の PrivateLink を利用する場合 \\{#multiple-privatelinks-in-one-region\\}

ほとんどのケースでは、各 VPC ごとに 1 つのエンドポイントサービスを作成するだけで十分です。このエンドポイントを介して、その VPC から複数の ClickHouse Cloud サービスへリクエストをルーティングできます。
[こちら](#considerations)を参照してください。

### プライベートエンドポイントへの接続がタイムアウトする \\{#connection-to-private-endpoint-timed-out\\}

* VPC エンドポイントにセキュリティグループがアタッチされていることを確認してください。
* VPC エンドポイントにアタッチされているセキュリティグループの `inbound` ルールを確認し、ClickHouse のポートを許可してください。
* 接続テストに使用している VM にアタッチされているセキュリティグループの `outbound` ルールを確認し、ClickHouse のポートへの接続を許可してください。

### Private Hostname: Not found address of host \\{#private-hostname-not-found-address-of-host\\}

* DNS 設定を確認してください。

### Connection reset by peer \\{#connection-reset-by-peer\\}

* 多くの場合、エンドポイント ID がサービスの許可リストに追加されていません。[この手順](#add-endpoint-id-to-services-allow-list)を参照してください。

### エンドポイントフィルタの確認 \\{#checking-endpoint-filters\\}

コマンドを実行する前に、次の環境変数を設定してください。

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

`INSTANCE_ID` は [こちらの手順](#option-2-api)から取得できます。

```shell
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
-X GET -H "Content-Type: application/json" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | \
jq .result.privateEndpointIds
```

### リモートデータベースへの接続 \\{#connecting-to-a-remote-database\\}

[MySQL](/sql-reference/table-functions/mysql) または [PostgreSQL](/sql-reference/table-functions/postgresql) のテーブル関数を ClickHouse Cloud で使用し、Amazon Web Services (AWS) の VPC 内でホストしているデータベースに接続しようとしているとします。AWS PrivateLink を使用して、この接続を安全に確立することはできません。PrivateLink は一方向の単方向接続であり、内部ネットワークまたは Amazon VPC から ClickHouse Cloud へのセキュアな接続は可能ですが、ClickHouse Cloud から内部ネットワークへの接続はできません。

[AWS PrivateLink のドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html) には次のように記載されています：

> クライアント/サーバー構成において、1 つ以上のコンシューマー VPC から、サービスプロバイダー VPC 内の特定のサービスまたはインスタンス群への一方向アクセスを許可したい場合に AWS PrivateLink を使用します。接続を開始できるのは、コンシューマー VPC 内のクライアントからサービスプロバイダー VPC 内のサービスに対してのみです。

これを実現するには、AWS のセキュリティグループを構成し、ClickHouse Cloud から内部/プライベートなデータベースサービスへの接続を許可します。[ClickHouse Cloud リージョンのデフォルト送信 (egress) IP アドレス](/manage/data-sources/cloud-endpoints-api) と、[利用可能な固定 IP アドレス](https://api.clickhouse.cloud/static-ips.json) を確認してください。
