---
title: "AWS PrivateLink"
description: "このドキュメントでは、AWS PrivateLinkを使用してClickHouse Cloudに接続する方法について説明します。"
slug: /manage/security/aws-privatelink
---

import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';

# AWS PrivateLink

<ScalePlanFeatureBadge feature="AWS PrivateLink"/>

AWS PrivateLinkを使用すると、VPC、AWSサービス、オンプレミスシステム、およびClickHouse Cloud間の接続をインターネットを経由せずに提供できます。このドキュメントでは、AWS PrivateLinkを使用してClickHouse Cloudに接続する方法について説明します。AWS PrivateLinkアドレス以外のアドレスからClickHouse Cloudサービスへのアクセスを無効にするには、ClickHouse Cloudの[IPアクセスリスト](/cloud/security/setting-ip-filters)を使用してください。

:::note
ClickHouse Cloudは現在、[クロスリージョンPrivateLink](https://aws.amazon.com/about-aws/whats-new/2024/11/aws-privatelink-across-region-connectivity/)をサポートしていません。ただし、[VPCピアリングを使用してPrivateLinkに接続する](https://aws.amazon.com/about-aws/whats-new/2019/03/aws-privatelink-now-supports-access-over-vpc-peering/)ことができます。詳細な情報や設定ガイダンスについては、AWSドキュメントを参照してください。
:::


AWS Private Linkを有効にするための手順は次のとおりです：
1. エンドポイントサービス名を取得します。
2. サービスエンドポイントを作成します。
3. エンドポイントIDをClickHouse Cloud組織に追加します。
4. エンドポイントIDをサービスの許可リストに追加します。

AWS Private Linkの完全なTerraformの例は[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/blob/main/examples/resources/clickhouse_private_endpoint_registration/resource.tf)にあります。

## 前提条件 {#prerequisites}

始める前に、以下が必要です：

1. AWSアカウント。
2. プライベートリンクを作成および管理するために必要な権限を持つAPIキー。

## 手順 {#steps}

以下の手順に従って、ClickHouse CloudをAWS PrivateLinkに接続します。

### エンドポイントサービス名を取得する {#obtain-endpoint-service-name}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**メニューを開きます。**プライベートエンドポイントを設定**ボタンをクリックします。Private Linkの設定に使用する**サービス名**をコピーします。

![プライベートエンドポイント](./images/aws-privatelink-pe-create.png)


#### オプション 2: API {#option-2-api}

まず、コマンドを実行する前に以下の環境変数を設定します：

```shell
REGION=<AWSフォーマットのリージョンコード>
PROVIDER=aws
KEY_ID=<あなたのキーID>
KEY_SECRET=<あなたのキーシークレット>
ORG_ID=<あなたのClickHouse組織ID>
SERVICE_NAME=<あなたのClickHouseサービス名>
```

リージョン、プロバイダー、サービス名でフィルタリングして、目的のインスタンスIDを取得します：

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

このコマンドは次のような出力を返すはずです：

```result
{
    ...
    "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
    ...
}
```

`endpointServiceId`をメモし、[ステップ2に移動します](#create-a-service-endpoint)。

### サービスエンドポイントを作成する {#create-a-service-endpoint}

次に、前のステップからの`endpointServiceId`を使用してサービスエンドポイントを作成する必要があります。

#### オプション 1: AWSコンソール {#option-1-aws-console}

AWSコンソールを開き、**VPC** → **エンドポイント** → **エンドポイントを作成**に移動します。

**その他のエンドポイントサービス**を選択し、前のステップで取得した`endpointServiceId`を使用します。作成が完了したら、**サービスを確認**をクリックします：

![](./images/aws-privatelink-endpoint-settings.png)

次に、VPCとサブネットを選択します：

![VPCとサブネットの選択](./images/aws-privatelink-select-vpc-and-subnets.png)

オプションのステップとして、セキュリティグループ/タグを割り当てます：

:::note ポート
ポート`8443`と`9440`がセキュリティグループで許可されていることを確認してください。
:::

VPCエンドポイントを作成した後、`Endpoint ID`の値を書き留めてください。次のステップで必要になります。

![VPCエンドポイントID](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/aws-privatelink-vpc-endpoint-id.png)

#### オプション 2: AWS CloudFormation {#option-2-aws-cloudformation}

正しいサブネットID、セキュリティグループ、VPC IDを確認してください。

```response
Resources:
  ClickHouseInterfaceEndpoint:
    Type: 'AWS::EC2::VPCEndpoint'
    Properties:
      VpcEndpointType: Interface
      PrivateDnsEnabled: false
      ServiceName: <'取得したAWSサービス名を使用'>
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
  service_name      = "<'取得したAWSサービス名を使用'>"
  vpc_endpoint_type = "Interface"
  security_group_ids = [
    Var.security_group_id1,var.security_group_id2, var.security_group_id3,
  ]
  subnet_ids          = [var.subnet_id1,var.subnet_id2,var.subnet_id3]
  private_dns_enabled = false
}
```

#### エンドポイントのためのプライベートDNS名を変更する {#modify-private-dns-name-for-endpoint}

このステップでは、プライベートDNSゾーン`<リージョンコード>.vpce.aws.clickhouse.cloud`の設定をAWS VPCに注入します。

:::note DNSリゾルバー
自身のDNSリゾルバーを使用する場合は、`<リージョンコード>.vpce.aws.clickhouse.cloud`のDNSゾーンを作成し、ワイルドカードレコード`*.<リージョンコード>.vpce.aws.clickhouse.cloud`をエンドポイントIDのIPアドレスにポイントします。
:::

#### オプション 1: AWSコンソール {#option-1-aws-console-1}

**VPCエンドポイント**に移動し、VPCエンドポイントを右クリックして、**プライベートDNS名を変更**を選択します：

![エンドポイントメニュー](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/aws-privatelink-endpoints-menu.png)

開いたページで、**プライベートDNS名を有効にする**を選択します：

![DNS名の変更](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/aws-privatelink-modify-dns-name.png)

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

### エンドポイントIDをClickHouse Cloud組織に追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

エンドポイントを組織に追加するには、[サービスの許可リストにエンドポイントIDを追加](#add-endpoint-id-to-services-allow-list)のステップに進んでください。ClickHouse Cloudコンソールを使用して`Endpoint ID`をサービスの許可リストに追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

![エンドポイント](./images/pe-remove-private-endpoint.png)

#### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、以下の環境変数を設定します：

```bash
PROVIDER=aws
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
ENDPOINT_ID=<前のステップからのエンドポイントID>
REGION=<リージョンコード、AWSフォーマットを使用してください>
```

前のステップからのデータを使用して`VPC_ENDPOINT`環境変数を設定します。

エンドポイントを追加するには、次のように実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "aws",
        "id": "${ENDPOINT_ID:?}",
        "description": "AWSプライベートエンドポイント",
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

エンドポイントを削除するには、次のように実行します：

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

### エンドポイントIDをサービスの許可リストに追加する {#add-endpoint-id-to-services-allow-list}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**に移動します。[前の](#create-a-service-endpoint)ステップで取得した`Endpoint ID`を入力します。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

![プライベートエンドポイント](./images/aws-privatelink-pe-filters.png)

### オプション 2: API {#option-2-api-2}

各インスタンスでプライベートリンクを使用可能にするために、エンドポイントIDを許可リストに追加する必要があります。

コマンドを実行する前に、以下の環境変数を設定します：

```bash
PROVIDER=aws
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
ENDPOINT_ID=<前のステップからのエンドポイントID>
INSTANCE_ID=<インスタンスID>
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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
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

curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X PATCH -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} \
-d @pl_config.json | jq
```

### PrivateLinkを使用してインスタンスにアクセスする {#accessing-an-instance-using-privatelink}

プライベートリンクフィルターが設定されている各インスタンスには、パブリックエンドポイントとプライベートエンドポイントがあります。PrivateLinkを使用してサービスに接続するには、プライベートエンドポイントの`privateDnsHostname`を使用する必要があります。

:::note
プライベートDNSホスト名は自分のAWS VPCからのみ利用可能です。ローカルマシンからDNSホストの解決を試みないでください。
:::

#### プライベートDNSホスト名を取得する {#getting-private-dns-hostname}

##### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

![プライベートエンドポイント](./images/aws-privatelink-pe-dns-name.png)

##### オプション 2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定します：

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
INSTANCE_ID=<インスタンスID>
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | \
jq .result
```

これにより、次のような出力が得られるはずです：

```result
{
  "endpointServiceId": "com.amazonaws.vpce.yy-xxxx-N.vpce-svc-xxxxxxxxxxxx",
  "privateDnsHostname": "xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud"
}
```

この例では、`xxxxxxx.yy-xxxx-N.vpce.aws.clickhouse.cloud`ホスト名への接続はPrivateLinkにルーティングされますが、`xxxxxxx.yy-xxxx-N.aws.clickhouse.cloud`はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### 一つのリージョンに複数のPrivateLinkがある場合 {#multiple-privatelinks-in-one-region}

ほとんどの場合、各VPCに対して1つのエンドポイントサービスを作成するだけで済みます。このエンドポイントは、VPCから複数のClickHouse Cloudサービスへのリクエストをルーティングできます。

### プライベートエンドポイントへの接続がタイムアウトした場合 {#connection-to-private-endpoint-timed-out}

- VPCエンドポイントにセキュリティグループをアタッチしてください。
- エンドポイントにアタッチされているセキュリティグループの`inbound`ルールを確認し、ClickHouseポートを許可してください。
- 接続テストに使用されるVMにアタッチされているセキュリティグループの`outbound`ルールを確認し、ClickHouseポートへの接続を許可してください。

### プライベートホスト名が見つかりません {#private-hostname-not-found-address-of-host}

- 「プライベートDNS名」のオプションが有効になっていることを確認してください。[ステップ](#modify-private-dns-name-for-endpoint)を訪れて詳細を確認してください。

### ピアによって接続がリセットされました {#connection-reset-by-peer}

- おそらくエンドポイントIDがサービスの許可リストに追加されていません。[ステップ](#add-endpoint-id-to-services-allow-list)をご覧ください。

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定します：

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定してください>
INSTANCE_ID=<インスタンスID>
```

```shell
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} \
-X GET -H "Content-Type: application/json" \
https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | \
jq .result.privateEndpointIds
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

例えば、ClickHouse Cloudで[MySQL](../../sql-reference/table-functions/mysql.md)や[PostgreSQL](../../sql-reference/table-functions/postgresql.md)のテーブル関数を使用して、Amazon Web Services (AWS) VPCにホストされるデータベースに接続しようとしている場合、AWS PrivateLinkはこの接続を安全に有効にするために使用できません。PrivateLinkは一方向の接続であり、内部ネットワークやAmazon VPCからClickHouse Cloudに安全に接続することはできますが、ClickHouse Cloudが内部ネットワークに接続することはできません。

[AWS PrivateLinkのドキュメント](https://docs.aws.amazon.com/whitepapers/latest/building-scalable-secure-multi-vpc-network-infrastructure/aws-privatelink.html)によると：

> AWS PrivateLinkを使用するのは、特定のサービスまたはサービスプロバイダーVPC内のインスタンスのセットへの一方向のアクセスを複数のコンシューマVPCに許可したいクライアント/サーバーセットアップがある場合です。コンシューマVPCのクライアントのみが、サービスプロバイダーVPC内のサービスへの接続を開始できます。

これを実現するには、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可するようにAWSセキュリティグループを設定します。[ClickHouse CloudリージョンのデフォルトエグレスIPアドレス](/manage/security/cloud-endpoints-api)や、[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)も確認してください。
