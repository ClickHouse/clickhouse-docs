---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Azure Private Link の設定方法'
keywords: ['azure', 'private link', 'privatelink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import azure_pe from '@site/static/images/cloud/security/azure-pe.png';
import azure_privatelink_pe_create from '@site/static/images/cloud/security/azure-privatelink-pe-create.png';
import azure_private_link_center from '@site/static/images/cloud/security/azure-private-link-center.png';
import azure_pe_create_basic from '@site/static/images/cloud/security/azure-pe-create-basic.png';
import azure_pe_resource from '@site/static/images/cloud/security/azure-pe-resource.png';
import azure_pe_create_vnet from '@site/static/images/cloud/security/azure-pe-create-vnet.png';
import azure_pe_create_dns from '@site/static/images/cloud/security/azure-pe-create-dns.png';
import azure_pe_create_tags from '@site/static/images/cloud/security/azure-pe-create-tags.png';
import azure_pe_create_review from '@site/static/images/cloud/security/azure-pe-create-review.png';
import azure_pe_ip from '@site/static/images/cloud/security/azure-pe-ip.png';
import azure_pe_view from '@site/static/images/cloud/security/azure-pe-view.png';
import azure_pe_resource_id from '@site/static/images/cloud/security/azure-pe-resource-id.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

このガイドでは、Azure Private Link を使用して、Azure（お客様所有のサービスおよび Microsoft パートナーのサービスを含む）と ClickHouse Cloud 間を、仮想ネットワーク経由でプライベートに接続する方法を説明します。Azure Private Link は、パブリック インターネットへのデータ露出を排除することで、Azure 内のエンドポイント間のネットワーク アーキテクチャを簡素化し、接続を保護します。

<Image img={azure_pe} size="lg" alt="Overview of PrivateLink" background='white' />

Azure は Private Link によるリージョン間接続をサポートしています。これにより、ClickHouse サービスをデプロイしている、異なるリージョンにある VNet 間で接続を確立できます。

:::note
リージョン間トラフィックには追加料金が発生する場合があります。最新の Azure ドキュメントを確認してください。
:::

**Azure Private Link を有効化するには、次の手順を実行してください。**

1. Private Link 用の Azure 接続エイリアスを取得する
1. Azure で Private Endpoint を作成する
1. Private Endpoint の Resource ID を ClickHouse Cloud の組織に追加する
1. Private Endpoint の Resource ID をサービスの allow list に追加する
1. Private Link を使用して ClickHouse Cloud サービスにアクセスする

:::note
ClickHouse Cloud の Azure PrivateLink は、`resourceGUID` から Resource ID を用いたフィルタへと切り替わりました。後方互換性のため `resourceGUID` も引き続き利用できますが、Resource ID フィルタへの移行を推奨します。移行するには、Resource ID を使用して新しいエンドポイントを作成し、それをサービスに関連付けたうえで、従来の `resourceGUID` ベースのエンドポイントを削除するだけです。
:::



## 注意事項 {#attention}

ClickHouseは、Azureリージョン内で同じ公開済み[Private Linkサービス](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)を再利用するために、サービスをグループ化しようと試みます。ただし、このグループ化は保証されません。特に、複数のClickHouse組織にサービスを分散している場合は保証されません。
ClickHouse組織内の他のサービスに対してPrivate Linkが既に設定されている場合、このグループ化により、ほとんどの手順をスキップして最終手順に直接進むことができます。[プライベートエンドポイントリソースIDをサービスの許可リストに追加する](#add-private-endpoint-id-to-services-allow-list)。

Terraformの例については、ClickHouseの[Terraform Providerリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)を参照してください。


## Private Link用のAzure接続エイリアスの取得 {#obtain-azure-connection-alias-for-private-link}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkで接続したいサービスを開き、**Settings**メニューを開きます。**Set up private endpoint**ボタンをクリックします。Private Linkの設定に使用する`Service name`と`DNS name`をメモしてください。

<Image
  img={azure_privatelink_pe_create}
  size='lg'
  alt='プライベートエンドポイント'
  border
/>

`Service name`と`DNS name`をメモしてください。次のステップで必要になります。

### オプション2: API {#option-2-api}

開始する前に、ClickHouse Cloud APIキーが必要です。[新しいキーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。

APIキーを取得したら、コマンドを実行する前に以下の環境変数を設定してください:

```bash
REGION=<リージョンコード、Azure形式を使用、例: westus3>
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
SERVICE_NAME=<ClickHouseサービス名>
```

リージョン、プロバイダー、サービス名でフィルタリングして、ClickHouseの`INSTANCE_ID`を取得します:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Private Link用のAzure接続エイリアスとプライベートDNSホスト名を取得します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId`をメモしてください。次のステップで使用します。


## Azureでプライベートエンドポイントを作成する {#create-private-endpoint-in-azure}

:::important
このセクションでは、Azure Private Link経由でClickHouseを構成するためのClickHouse固有の詳細について説明します。Azure固有の手順は参照用として提供されていますが、Azureクラウドプロバイダーからの通知なしに変更される可能性があります。お客様の特定のユースケースに基づいてAzure構成を検討してください。

ClickHouseは、必要なAzureプライベートエンドポイントおよびDNSレコードの構成について責任を負わないことにご注意ください。

Azure構成タスクに関する問題については、Azure Supportに直接お問い合わせください。
:::

このセクションでは、AzureでPrivate Endpointを作成します。Azure PortalまたはTerraformのいずれかを使用できます。

### オプション1: Azure Portalを使用してAzureでプライベートエンドポイントを作成する {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azure Portalで、**Private Link Center → Private Endpoints**を開きます。

<Image
  img={azure_private_link_center}
  size='lg'
  alt='Azure Private Centerを開く'
  border
/>

**Create**ボタンをクリックして、Private Endpoint作成ダイアログを開きます。

<Image
  img={azure_private_link_center}
  size='lg'
  alt='Azure Private Centerを開く'
  border
/>

---

次の画面で、以下のオプションを指定します:

- **Subscription** / **Resource Group**: Private Endpoint用のAzureサブスクリプションとリソースグループを選択してください。
- **Name**: **Private Endpoint**の名前を設定します。
- **Region**: Private Link経由でClickHouse Cloudに接続するデプロイ済みVNetが存在するリージョンを選択します。

上記の手順を完了したら、**Next: Resource**ボタンをクリックします。

<Image
  img={azure_pe_create_basic}
  size='md'
  alt='Private Endpoint基本設定の作成'
  border
/>

---

**Connect to an Azure resource by resource ID or alias**オプションを選択します。

**Resource ID or alias**には、[Private Link用のAzure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)ステップで取得した`endpointServiceId`を使用します。

**Next: Virtual Network**ボタンをクリックします。

<Image
  img={azure_pe_resource}
  size='md'
  alt='Private Endpointリソースの選択'
  border
/>

---

- **Virtual network**: Private Linkを使用してClickHouse Cloudに接続するVNetを選択します
- **Subnet**: Private Endpointを作成するサブネットを選択します

オプション:

- **Application security group**: ASGをPrivate Endpointにアタッチし、Network Security Groupsで使用してPrivate Endpointとの間のネットワークトラフィックをフィルタリングできます。

**Next: DNS**ボタンをクリックします。

<Image
  img={azure_pe_create_vnet}
  size='md'
  alt='Private Endpoint仮想ネットワークの選択'
  border
/>

**Next: Tags**ボタンをクリックします。

---

<Image
  img={azure_pe_create_dns}
  size='md'
  alt='Private Endpoint DNS構成'
  border
/>

オプションで、Private Endpointにタグをアタッチできます。

**Next: Review + create**ボタンをクリックします。

---

<Image
  img={azure_pe_create_tags}
  size='md'
  alt='Private Endpointタグ'
  border
/>

最後に、**Create**ボタンをクリックします。

<Image
  img={azure_pe_create_review}
  size='md'
  alt='Private Endpointレビュー'
  border
/>

作成されたPrivate Endpointの**Connection status**は**Pending**状態になります。このPrivate Endpointをサービス許可リストに追加すると、**Approved**状態に変わります。

Private Endpointに関連付けられたネットワークインターフェースを開き、**Private IPv4 address**(この例では10.0.0.4)をコピーします。この情報は次のステップで必要になります。

<Image img={azure_pe_ip} size='lg' alt='Private Endpoint IPアドレス' border />

### オプション2: Terraformを使用してAzureでプライベートエンドポイントを作成する {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

以下のテンプレートを使用して、TerraformでPrivate Endpointを作成します:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<data from 'Obtain Azure connection alias for Private Link' step>"
    is_manual_connection              = true
  }
}
```

### Private Endpoint Resource IDを取得する {#obtaining-private-endpoint-resourceid}

Private Linkを使用するには、Private Endpoint接続のResource IDをサービス許可リストに追加する必要があります。

Private Endpoint Resource IDはAzure Portalで公開されています。前のステップで作成したPrivate Endpointを開き、**JSON View**をクリックします:


<Image img={azure_pe_view} size="lg" alt="プライベート エンドポイントの表示" border />

[プロパティ] セクションで `id` フィールドを見つけ、この値をコピーします:

**推奨方法: Resource ID の使用**
<Image img={azure_pe_resource_id} size="lg" alt="プライベート エンドポイントの Resource ID" border />

**レガシー方法: resourceGUID の使用**
後方互換性のために、resourceGUID を引き続き使用することもできます。`resourceGuid` フィールドを見つけて、この値をコピーします:

<Image img={azure_pe_resource_guid} size="lg" alt="プライベート エンドポイントの Resource GUID" border />



## Private Link 用 DNS の設定 {#setting-up-dns-for-private-link}

Private Link 経由でリソースにアクセスするには、プライベート DNS ゾーン (`${location_code}.privatelink.azure.clickhouse.cloud`) を作成し、それを VNet に関連付ける必要があります。

### プライベート DNS ゾーンを作成する {#create-private-dns-zone}

**オプション 1: Azure ポータルを使用**

[Azure ポータルを使用して Azure プライベート DNS ゾーンを作成する](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)手順に従ってください。

**オプション 2: Terraform を使用**

次の Terraform テンプレートを使用して、プライベート DNS ゾーンを作成します。

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカード DNS レコードを作成する {#create-a-wildcard-dns-record}

ワイルドカード レコードを作成し、プライベート エンドポイントを指すように設定します。

**Option 1: Using Azure Portal**

1. `MyAzureResourceGroup` リソース グループを開き、`${region_code}.privatelink.azure.clickhouse.cloud` プライベート ゾーンを選択します。
2. [+ レコード セット] を選択します。
3. [名前] に `*` と入力します。
4. [IP アドレス] に、プライベート エンドポイントに対して表示されている IP アドレスを入力します。
5. **OK** を選択します。

<Image
  img={azure_pl_dns_wildcard}
  size='lg'
  alt='Private Link DNS ワイルドカード設定'
  border
/>

**オプション 2: Terraform を使用**

次の Terraform テンプレートを使用して、ワイルドカード DNS レコードを作成します。

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 仮想ネットワーク リンクを作成する {#create-a-virtual-network-link}

プライベート DNS ゾーンを仮想ネットワークにリンクするには、仮想ネットワーク リンクを作成する必要があります。

**Option 1: Using Azure Portal**

[仮想ネットワークをプライベート DNS ゾーンにリンクする](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)手順に従ってください。

**オプション 2: Terraform を使用**

:::note
DNS の構成方法にはさまざまなパターンがあります。ユースケースに応じて DNS を設定してください。
:::

[Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) の手順で取得した「DNS name」を、プライベート エンドポイントの IP アドレスを指すように設定する必要があります。これにより、VPC/ネットワーク内のサービスやコンポーネントが、その名前を正しく解決できるようになります。

### DNS 設定を確認する {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` ドメインは、プライベート エンドポイントの IP を指すように設定されている必要があります（この例では 10.0.0.4）。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```


## プライベートエンドポイントリソースIDをClickHouse Cloud組織に追加する {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[プライベートエンドポイントリソースIDをサービスの許可リストに追加する](#add-private-endpoint-id-to-services-allow-list)の手順に進んでください。ClickHouse Cloudコンソールを使用してプライベートエンドポイントリソースIDをサービスの許可リストに追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**Organization details -> Private Endpoints**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image
  img={azure_pe_remove_private_endpoint}
  size='lg'
  alt='プライベートエンドポイントの削除'
  border
/>

### オプション2: API {#option-2-api-1}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<ClickHouse組織IDを設定>
ENDPOINT_ID=<プライベートエンドポイントリソースID>
REGION=<リージョンコード、Azure形式を使用>
```

[プライベートエンドポイントリソースIDの取得](#obtaining-private-endpoint-resourceid)の手順で取得したデータを使用して、`ENDPOINT_ID`環境変数を設定してください。

プライベートエンドポイントを追加するには、以下のコマンドを実行してください:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azureプライベートエンドポイント",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

プライベートエンドポイントを削除するには、以下のコマンドを実行することもできます:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

プライベートエンドポイントを追加または削除した後、以下のコマンドを実行して組織に適用してください:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## サービスの許可リストにプライベートエンドポイントリソースIDを追加する {#add-private-endpoint-id-to-services-allow-list}

デフォルトでは、Private Link接続が承認され確立されている場合でも、ClickHouse CloudサービスはPrivate Link接続経由では利用できません。Private Linkを使用して利用可能にする各サービスに対して、プライベートエンドポイントリソースIDを明示的に追加する必要があります。

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLink経由で接続したいサービスを開き、**Settings**に移動します。[前の手順](#obtaining-private-endpoint-resourceid)で取得した`Resource ID`を入力します。

:::note
既存のPrivateLink接続からのアクセスを許可する場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image
  img={azure_privatelink_pe_filter}
  size='lg'
  alt='プライベートエンドポイントフィルター'
  border
/>

### オプション2: API {#option-2-api-2}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Private Linkを使用して利用可能にする各サービスに対して実行してください。

以下のコマンドを実行して、サービスの許可リストにプライベートエンドポイントを追加します:

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
```

以下のコマンドを実行して、サービスの許可リストからプライベートエンドポイントを削除することもできます:

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
```

サービスの許可リストにプライベートエンドポイントを追加または削除した後、以下のコマンドを実行して組織に適用します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```


## Private Linkを使用したClickHouse Cloudサービスへのアクセス {#access-your-clickhouse-cloud-service-using-private-link}

Private Linkが有効化された各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Linkを使用して接続するには、[Private Link用のAzure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)から取得した`privateDnsHostname`<sup>API</sup>または`DNS name`<sup>コンソール</sup>のプライベートエンドポイントを使用する必要があります。

### プライベートDNSホスト名の取得 {#obtaining-the-private-dns-hostname}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**Settings**に移動します。**Set up private endpoint**ボタンをクリックします。開いたフライアウトで、**DNS Name**をコピーします。

<Image
  img={azure_privatelink_pe_dns}
  size='lg'
  alt='プライベートエンドポイントDNS名'
  border
/>

#### オプション2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定します:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

以下のコマンドを実行します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

以下のようなレスポンスが返されます:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud`ホスト名への接続はPrivate Link経由でルーティングされます。一方、`xxxxxxx.region_code.azure.clickhouse.cloud`はインターネット経由でルーティングされます。

Private Linkを使用してClickHouse Cloudサービスに接続するには、`privateDnsHostname`を使用してください。


## トラブルシューティング {#troubleshooting}

### DNS設定のテスト {#test-dns-setup}

以下のコマンドを実行します：

```bash
nslookup <dns name>
```

ここで「dns name」は、[Private LinkのAzure接続エイリアスの取得](#obtain-azure-connection-alias-for-private-link)で取得した`privateDnsHostname`<sup>API</sup>または`DNS name`<sup>console</sup>です

以下のようなレスポンスが返されます：

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### 接続がピアによってリセットされる {#connection-reset-by-peer}

プライベートエンドポイントリソースIDがサービスの許可リストに追加されていない可能性があります。[_プライベートエンドポイントリソースIDをサービスの許可リストに追加する_手順](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留状態になっている {#private-endpoint-is-in-pending-state}

プライベートエンドポイントリソースIDがサービスの許可リストに追加されていない可能性があります。[_プライベートエンドポイントリソースIDをサービスの許可リストに追加する_手順](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### 接続性のテスト {#test-connectivity}

Private Linkを使用した接続に問題がある場合は、`openssl`を使用して接続性を確認してください。Private Linkエンドポイントのステータスが`Accepted`になっていることを確認してください。

OpenSSLは接続できるはずです（出力に「CONNECTED」と表示されます）。`errno=104`は正常な動作です。

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud:9440
```


```response
# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
no peer certificate available
---
No client certificate CA names sent
---
SSL handshake has read 0 bytes and written 335 bytes
Verification: OK
---
New, (NONE), Cipher is (NONE)
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 0 (ok)
```

### プライベートエンドポイントフィルターの確認 {#checking-private-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定してください:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<ClickHouse組織IDを設定してください>
INSTANCE_ID=<Instance ID>
```

プライベートエンドポイントフィルターを確認するには、以下のコマンドを実行してください:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```


## 詳細情報 {#more-information}

Azure Private Linkの詳細については、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)を参照してください。
