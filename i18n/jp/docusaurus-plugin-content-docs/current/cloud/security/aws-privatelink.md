---
title: "AWS PrivateLink"
description: "この文書では、AWS PrivateLinkを使用してClickHouse Cloudに接続する方法を説明します。"
slug: /manage/security/aws-privatelink
---

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

[Please note AWS PrivateLink](https://aws.amazon.com/privatelink/)は、VPC間、AWSサービス、オンプレミスシステム、およびClickHouse Cloud間の接続を提供し、インターネットを介さずにトラフィックを管理します。この文書では、AWS PrivateLinkを使用してClickHouse Cloudに接続する方法を説明します。 AWS PrivateLink以外のアドレスからClickHouse Cloudサービスへのアクセスを無効にするには、ClickHouse Cloudの[IPアクセスリスト](/cloud/security/setting-ip-filters)を使用します。

:::note
ClickHouse Cloudは現在、[クロスリージョンPrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)をサポートしていません。ただし、[VPCピアリングを使用してPrivateLinkに接続することができます](https://aws.amazon.com/about-aws/whats-new/2019/03/aws-privatelink-now-supports-access-over-vpc-peering/)。詳細および設定ガイダンスについては、AWSの文書を参照してください。
:::

AWS PrivateLinkを有効にするには、次の手順を完了してください：
1. エンドポイントサービス名を取得します。
1. サービスエンドポイントを作成します。
1. ClickHouse Cloud組織にエンドポイントIDを追加します。
1. サービスの許可リストにエンドポイントIDを追加します。

AWS PrivateLinkの完全なTerraformの例は、[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/blob/main/examples/resources/clickhouse_private_endpoint_registration/resource.tf)でご覧いただけます。

## 前提条件 {#prerequisites}

始める前に必要なもの：
1. AWSアカウント。
1. プライベートリンクを作成および管理するために必要な権限を持つAPIキー。

## 手順 {#steps}

ClickHouse CloudをAWS PrivateLinkに接続するための手順は次のとおりです。

### エンドポイントサービス名を取得する {#obtain-endpoint-service-name}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLink経由で接続したいサービスを開き、**設定**メニューを開きます。 **プライベートエンドポイントの設定**ボタンをクリックします。PrivateLinkの設定に使用される**サービス名**をコピーします。

<img src={aws_private_link_pecreate} alt="プライベートエンドポイント" />

#### オプション 2: API {#option-2-api}

まず、コマンドを実行する前に、次の環境変数を設定します：

```shell
REGION=<Your region code using the AWS format>
PROVIDER=aws
KEY_ID=<Your key ID>
KEY_SECRET=<Your key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

地域、プロバイダ、およびサービス名でフィルタリングして、目的のインスタンスIDを取得します：

```shell
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

プライベートリンク設定のためのAWSサービス名を取得します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

このコマンドは次のような結果を返します：

```result
{
    ...
    "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
    ...
}
```

`endpointServiceId`をメモし、[ステップ2に移動してください](#create-a-service-endpoint)。

### サービスエンドポイントを作成する {#create-a-service-endpoint}

次に、前のステップで取得した`endpointServiceId`を使用してサービスエンドポイントを作成する必要があります。

#### オプション 1: AWSコンソール {#option-1-aws-console}

AWSコンソールを開き、**VPC** → **エンドポイント** → **エンドポイントの作成**に移動します。

**その他のエンドポイントサービス**を選択し、前のステップで取得した`endpointServiceId`を使用します。完了したら、**サービスを確認**をクリックします：

<img src={aws_private_link_endpoint_settings} alt="AWS PrivateLinkエンドポイント設定" />

次に、VPCおよびサブネットを選択します：

<img src={aws_private_link_select_vpc} alt="VPCおよびサブネットの選択" />

オプションのステップとして、セキュリティグループやタグを割り当てます：

:::note ポート
セキュリティグループ内でポート`8443`および`9440`が許可されていることを確認してください。
:::

VPCエンドポイントを作成した後、`Endpoint ID`の値をメモしておいてください。次のステップで必要になります。

<img src={aws_private_link_vpc_endpoint_id} alt="VPCエンドポイントID" />

#### オプション 2: AWS CloudFormation {#option-2-aws-cloudformation}

正しいサブネットID、セキュリティグループ、VPC IDを使用していることを確認してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <use endpointServiceId from 'Obtain AWS Service Name for Private Link' step>
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

#### オプション 3: Terraform {#option-3-terraform}

```json
resource "aws_vpc_endpoint" "this" {
  vpc_id            = var.vpc_id
  service_name      = "<use endpointServiceId from 'Obtain AWS Service Name for Private Link' step>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

#### エンドポイントのプライベートDNS名を変更する {#modify-private-dns-name-for-endpoint}

このステップでは、プライベートDNSゾーン`<region code>.vpce.aws.clickhouse.cloud`の設定をAWS VPCに注入します。

:::note DNSリゾルバ
独自のDNSリゾルバを使用している場合は、`<region code>.vpce.aws.clickhouse.cloud`のDNSゾーンを作成し、ワイルドカードレコード`*.<region code>.vpce.aws.clickhouse.cloud`をエンドポイントIDのIPアドレスに向けます。
:::

#### オプション 1: AWSコンソール {#option-1-aws-console-1}

**VPCエンドポイント**に移動し、VPCエンドポイントを右クリックして、**プライベートDNS名を変更**を選択します：

<img src={aws_private_link_endpoints_menu} alt="AWS PrivateLinkエンドポイントメニュー" />

開いたページで、**プライベートDNS名を有効にする**を選択します：

<img src={aws_private_link_modify_dnsname} alt="DNS名の変更" />

#### オプション 2: AWS CloudFormation {#option-2-aws-cloudformation-1}

`CloudFormation`テンプレートを更新し、`PrivateDnsEnabled`を`true`に設定します：

```json
PrivateDnsEnabled: true
```

変更を適用します。

#### オプション 3: Terraform {#option-3-terraform-1}

- Terraformコード内の`aws_vpc_endpoint`リソースを変更し、`private_dns_enabled`を`true`に設定します：

```json
private_dns_enabled = true
```

変更を適用します。

### ClickHouse Cloud組織にエンドポイントIDを追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[サービスの許可リストにエンドポイントIDを追加する](#add-endpoint-id-to-services-allow-list)ステップに進みます。ClickHouse Cloudコンソールを使用して`Endpoint ID`をサービスの許可リストに追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<img src={pe_remove_private_endpoint} alt="プライベートエンドポイントの削除" />

#### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、次の環境変数を設定します：

```bash
PROVIDER=aws
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<Endpoint ID from previous step>
REGION=<region code, please use AWS format>
```

前のステップのデータを使用して`VPC_ENDPOINT`環境変数を設定します。

エンドポイントを追加するには、次のコマンドを実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "An aws private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

エンドポイントを削除するには、次のコマンドを実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} \
-d @pl_config_org.json
```

### サービスの許可リストにエンドポイントIDを追加する {#add-endpoint-id-to-services-allow-list}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLink経由で接続したいサービスを開き、**設定**に移動します。[前のステップ](#create-a-service-endpoint)から取得した`Endpoint ID`を入力します。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<img src={aws_private_link_pe_filters} alt="プライベートエンドポイントフィルタ" />

### オプション 2: API {#option-2-api-2}

プライベートリンクを使用可能にするインスタンスごとに、エンドポイントIDを許可リストに追加する必要があります。

コマンドを実行する前に、次の環境変数を設定します：

```bash
PROVIDER=aws
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
ENDPOINT_ID=<Endpoint ID from previous step>
INSTANCE_ID=<Instance ID>
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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

### PrivateLinkを使用してインスタンスにアクセスする {#accessing-an-instance-using-privatelink}

プライベートリンクフィルターが設定された各インスタンスには、パブリックとプライベートのエンドポイントがあります。PrivateLinkを使用してサービスに接続するには、プライベートエンドポイント`privateDnsHostname`を使用する必要があります。

:::note
プライベートDNSホスト名は、AWS VPCからのみ利用可能です。ローカルマシンからDNSホストを解決しようとしないでください。
:::

#### プライベートDNSホスト名を取得する {#getting-private-dns-hostname}

##### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。 **プライベートエンドポイントの設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

<img src={aws_private_link_ped_nsname} alt="プライベートエンドポイントDNS名" />

##### オプション 2: API {#option-2-api-3}

コマンドを実行する前に、次の環境変数を設定します：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

これにより、次のような出力が得られます：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud"
}
```

この例では、`xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud`のホスト名への接続はPrivateLinkにルーティングされますが、`xxxxxxx.yy-xxxx-N.aws.clickhouse.cloud`はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### 1つのリージョンに複数のPrivateLinkがある {#multiple-privatelinks-in-one-region}

ほとんどの場合、各VPCに対して1つのエンドポイントサービスを作成する必要があります。このエンドポイントは、VPCから複数のClickHouse Cloudサービスへのリクエストをルーティングできます。

### プライベートエンドポイントへの接続がタイムアウトした {#connection-to-private-endpoint-timed-out}

- VPCエンドポイントにセキュリティグループをアタッチしてください。
- エンドポイントにアタッチされているセキュリティグループの`inbound`ルールを確認し、ClickHouseポートを許可してください。
- 接続性テストに使用されるVMにアタッチされているセキュリティグループの`outbound`ルールを確認し、ClickHouseポートへの接続を許可してください。

### プライベートホスト名: ホストのアドレスが見つかりません {#private-hostname-not-found-address-of-host}

- "プライベートDNS名"オプションが有効になっていることを確認してください。詳細については、[ステップ](#modify-private-dns-name-for-endpoint)を参照してください。

### ピアによって接続がリセットされました {#connection-reset-by-peer}

- おそらくエンドポイントIDがサービスの許可リストに追加されていないためです。[ステップ](#add-endpoint-id-to-services-allow-list)を参照してください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に、次の環境変数を設定します：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

```shell
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X GET -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | \
jq .result.privateEndpointIds
```

### リモートデータベースに接続する {#connecting-to-a-remote-database}

例えば、ClickHouse Cloudで[MySQL](../../sql-reference/table-functions/mysql.md)または[PostgreSQL](../../sql-reference/table-functions/postgresql.md)テーブル関数を使用して、Amazon Web Services (AWS) VPCにホストされたデータベースに接続しようとしているとします。AWS PrivateLinkは、この接続を安全に有効にするためには使用できません。PrivateLinkは一方向の接続です。内部ネットワークやAmazon VPCがClickHouse Cloudに安全に接続できるようにしますが、ClickHouse Cloudが内部ネットワークに接続することはできません。

[AWS PrivateLinkの文書](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)によると：

> AWS PrivateLinkは、クライアント/サーバーのセットアップがあり、1つ以上の消費者VPCが特定のサービスまたはサービスプロバイダVPC内のインスタンスセットへの一方向のアクセスを許可する場合に使用します。消費者VPC内のクライアントのみが、サービスプロバイダVPC内のサービスへの接続を開始できます。

これを実現するには、AWSセキュリティグループを設定し、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可する必要があります。ClickHouse Cloudリージョンの[デフォルトのエグレスIPアドレス](/manage/security/cloud-endpoints-api)や[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。
