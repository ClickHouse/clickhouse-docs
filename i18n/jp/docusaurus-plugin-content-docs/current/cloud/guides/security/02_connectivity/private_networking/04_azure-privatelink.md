---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Azure Private Link を設定する'
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

# Azure Private Link \\{#azure-private-link\\}

<ScalePlanFeatureBadge feature="Azure Private Link"/>

このガイドでは、Azure Private Link を使用して、Azure（お客様所有のサービスおよび Microsoft パートナーのサービスを含む）と ClickHouse Cloud 間で、仮想ネットワーク経由のプライベート接続を提供する方法を説明します。Azure Private Link はネットワークアーキテクチャを簡素化し、データをパブリックインターネットに公開することなく、Azure 内のエンドポイント間の接続を保護します。

<Image img={azure_pe} size="lg" alt="Private Link の概要" background='white' />

Azure は Private Link 経由でリージョンをまたいだ接続をサポートしています。これにより、ClickHouse サービスをデプロイしている異なるリージョンにある VNet 間で接続を確立できます。

:::note
リージョン間トラフィックには追加料金が発生する場合があります。最新の Azure ドキュメントを確認してください。
:::

**Azure Private Link を有効にするには、次の手順を完了してください。**

1. Private Link 用の Azure 接続エイリアスを取得する
1. Azure でプライベート エンドポイントを作成する
1. プライベート エンドポイントのリソース ID を ClickHouse Cloud の組織に追加する
1. プライベート エンドポイントのリソース ID をサービスの許可リストに追加する
1. Private Link を使用して ClickHouse Cloud サービスにアクセスする

:::note
ClickHouse Cloud の Azure PrivateLink は、`resourceGUID` から Resource ID フィルタの利用へ切り替わりました。後方互換性があるため、引き続き `resourceGUID` を使用できますが、Resource ID フィルタへの移行を推奨します。移行するには、Resource ID を使って新しいエンドポイントを作成し、それをサービスに関連付けてから、従来の `resourceGUID` ベースのエンドポイントを削除してください。
:::

## 注意事項 \\{#attention\\}
ClickHouse は、同じ Azure リージョン内で公開済みの [Private Link service](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) を再利用できるように、サービスをグループ化しようと試みます。ただし、このグループ化は保証されておらず、特にサービスを複数の ClickHouse 組織に分散している場合には、当てはまらないことがあります。
すでに同じ ClickHouse 組織内の他のサービス向けに Private Link を構成済みの場合は、そのグループ化により多くの手順を省略できることがあり、最終手順である [Private Endpoint Resource ID をサービスの許可リストに追加する](#add-private-endpoint-id-to-services-allow-list) に直接進める場合があります。

Terraform のサンプルは ClickHouse の [Terraform Provider リポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) を参照してください。

## Private Link 用の Azure 接続エイリアスを取得する \\{#obtain-azure-connection-alias-for-private-link\\}

### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console\\}

ClickHouse Cloud コンソールで、Private Link 経由で接続したいサービスを開き、**Settings** メニューを開きます。**Set up private endpoint** ボタンをクリックします。Private Link のセットアップに使用する `Service name` と `DNS name` を控えておきます。

<Image img={azure_privatelink_pe_create} size="lg" alt="プライベート エンドポイント" border />

`Service name` と `DNS name` を控えておきます。これらは次の手順で使用します。

### オプション 2: API \\{#option-2-api\\}

作業を開始する前に、ClickHouse Cloud の API キーが必要です。[新しいキーを作成](/cloud/manage/openapi)するか、既存のキーを使用します。

API キーを取得したら、コマンドを実行する前に次の環境変数を設定します。

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

リージョン、プロバイダー、サービス名でフィルタリングして、ClickHouse の `INSTANCE_ID` を取得します:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Private Link 用の Azure 接続エイリアスとプライベート DNS ホスト名を取得します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId` をメモしておいてください。次の手順で使用します。

## Azure でプライベート エンドポイントを作成する \\{#create-private-endpoint-in-azure\\}

:::important
このセクションでは、Azure Private Link を介して ClickHouse を構成する際の、ClickHouse 固有の詳細について説明します。ここに記載している Azure 固有の手順は、どこを参照すべきかを示すための参考情報であり、Azure クラウド プロバイダーからの通知なしに将来的に変更される可能性があります。Azure の構成は、お客様固有のユースケースに基づいて検討してください。

なお、ClickHouse は、必要な Azure プライベート エンドポイントおよび DNS レコードの構成については責任を負いません。

Azure の構成作業に関連する問題については、Azure Support に直接お問い合わせください。
:::

このセクションでは、Azure で Private Endpoint を作成します。Azure Portal または Terraform のいずれかを使用できます。

### オプション 1: Azure Portal を使用して Azure にプライベート エンドポイントを作成する \\{#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure\\}

Azure Portal で **Private Link Center → Private Endpoints** を開きます。

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center を開く" border />

**Create** ボタンをクリックして、Private Endpoint 作成ダイアログを開きます。

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center を開く" border />

***

次の画面で、以下のオプションを指定します。

* **Subscription** / **Resource Group**: Private Endpoint 用の Azure サブスクリプションとリソース グループを選択します。
* **Name**: **Private Endpoint** の名前を設定します。
* **Region**: Private Link を介して ClickHouse Cloud に接続される VNet がデプロイされているリージョンを選択します。

上記の手順を完了したら、**Next: Resource** ボタンをクリックします。

<Image img={azure_pe_create_basic} size="md" alt="Private Endpoint の基本設定を作成" border />

***

**Connect to an Azure resource by resource ID or alias** オプションを選択します。

**Resource ID or alias** には、[Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) の手順で取得した `endpointServiceId` を使用します。

**Next: Virtual Network** ボタンをクリックします。

<Image img={azure_pe_resource} size="md" alt="Private Endpoint のリソース選択" border />

***

* **Virtual network**: Private Link を使用して ClickHouse Cloud に接続する VNet を選択します。
* **Subnet**: Private Endpoint を作成するサブネットを選択します。

任意:

* **Application security group**: Private Endpoint に ASG を関連付け、Network Security Group で Private Endpoint との送受信トラフィックをフィルタリングするために使用できます。

**Next: DNS** ボタンをクリックします。

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint の仮想ネットワーク選択" border />

**Next: Tags** ボタンをクリックします。

***

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint の DNS 構成" border />

必要に応じて、Private Endpoint にタグを付与できます。

**Next: Review + create** ボタンをクリックします。

***

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint のタグ" border />

最後に、**Create** ボタンをクリックします。

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint の確認" border />

作成された Private Endpoint の **Connection status** は **Pending** 状態になります。この Private Endpoint をサービスの許可リストに追加すると、**Approved** 状態に変わります。

Private Endpoint に関連付けられているネットワーク インターフェイスを開き、**Private IPv4 address**（この例では 10.0.0.4）をコピーします。この情報は次の手順で必要になります。

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint の IP アドレス" border />

### オプション 2: Terraform を使用して Azure にプライベート エンドポイントを作成する \\{#option-2-using-terraform-to-create-a-private-endpoint-in-azure\\}

以下のテンプレートを使用して、Terraform で Private Endpoint を作成します。

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

### プライベート エンドポイントのリソース ID の取得 \\{#obtaining-private-endpoint-resourceid\\}

Private Link を使用するには、プライベート エンドポイント接続のリソース ID をサービスの許可リストに追加する必要があります。

プライベート エンドポイントのリソース ID は Azure ポータルで確認できます。前の手順で作成したプライベート エンドポイントを開き、**JSON View** をクリックします。

<Image img={azure_pe_view} size="lg" alt="プライベート エンドポイントのビュー" border />

プロパティ内で `id` フィールドを探し、この値をコピーします。

**推奨方法: Resource ID の使用**
<Image img={azure_pe_resource_id} size="lg" alt="プライベート エンドポイントの Resource ID" border />

**レガシー方法: resourceGUID の使用**
後方互換性のために、引き続き resourceGUID を使用できます。`resourceGuid` フィールドを探し、この値をコピーします。

<Image img={azure_pe_resource_guid} size="lg" alt="プライベート エンドポイントの Resource GUID" border />

## Private Link 用の DNS の設定 \\{#setting-up-dns-for-private-link\\}

Private Link 経由でリソースにアクセスするには、Private DNS ゾーン (`${location_code}.privatelink.azure.clickhouse.cloud`) を作成し、それを VNet に関連付ける必要があります。

### Private DNS ゾーンの作成 \\{#create-private-dns-zone\\}

**オプション 1: Azure ポータルを使用**

[Azure ポータルを使用して Azure Private DNS ゾーンを作成する](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)手順に従ってください。

**オプション 2: Terraform を使用**

次の Terraform テンプレートを使用して Private DNS ゾーンを作成します。

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカード DNS レコードを作成する \\{#create-a-wildcard-dns-record\\}

ワイルドカードレコードを作成し、Private Endpoint を参照するように設定します。

**オプション 1: Azure Portal を使用**

1. `MyAzureResourceGroup` リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud` プライベートゾーンを選択します。
2. **+ Record set** を選択します。
3. Name に `*` を入力します。
4. IP Address に、Private Endpoint に表示されている IP アドレスを入力します。
5. **OK** を選択します。

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS ワイルドカードの設定" border />

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

### 仮想ネットワークリンクを作成する \\{#create-a-virtual-network-link\\}

プライベート DNS ゾーンを仮想ネットワークにリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション 1: Azure ポータルを使用する場合**

[仮想ネットワークをプライベート DNS ゾーンにリンクする](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)手順に従ってください。

**オプション 2: Terraform を使用する場合**

:::note
DNS の構成方法にはさまざまなパターンがあります。ご利用のユースケースに応じて DNS を設定してください。
:::

[Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) の手順で取得した &quot;DNS name&quot; を Private Endpoint の IP アドレスを指すように設定する必要があります。これにより、VPC/ネットワーク内のサービスやコンポーネントが正しく名前解決できるようになります。

### DNS 設定を検証する \\{#verify-dns-setup\\}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` ドメインが Private Endpoint の IP（この例では 10.0.0.4）を指すように設定されている必要があります。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## プライベートエンドポイントのリソース ID を ClickHouse Cloud 組織に追加する \\{#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization\\}

### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console-1\\}

エンドポイントを組織に追加するには、「[サービスの許可リストにプライベートエンドポイントのリソース ID を追加する](#add-private-endpoint-id-to-services-allow-list)」手順に進んでください。ClickHouse Cloud コンソールを使用してサービスの許可リストにプライベートエンドポイントのリソース ID を追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**Organization details -&gt; Private Endpoints** を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="プライベートエンドポイントを削除" border />

### オプション 2: API \\{#option-2-api-1\\}

コマンドを実行する前に、次の環境変数を設定します。

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

[Obtaining the Private Endpoint Resource ID](#obtaining-private-endpoint-resourceid) の手順で取得したデータを使用して、`ENDPOINT_ID` 環境変数を設定します。

Private Endpoint を追加するために、次のコマンドを実行します。

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

次のコマンドを実行して、Private Endpoint を削除することもできます。

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

プライベートエンドポイントを追加または削除した後、次のコマンドを実行して組織に反映します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## プライベートエンドポイントの Resource ID をサービスの許可リストに追加する \\{#add-private-endpoint-id-to-services-allow-list\\}

デフォルトでは、Private Link 接続が承認・確立されていても、ClickHouse Cloud サービスは Private Link 接続経由では利用できません。Private Link を使用して利用可能にする各サービスごとに、プライベートエンドポイントの Resource ID を明示的に追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console-2\\}

ClickHouse Cloud コンソールで、PrivateLink 経由で接続したいサービスを開き、**Settings** に移動します。[前の](#obtaining-private-endpoint-resourceid)手順で取得した `Resource ID` を入力します。

:::note
既存の PrivateLink 接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoints Filter" border />

### オプション 2: API \\{#option-2-api-2\\}

後続のコマンドを実行する前に、次の環境変数を設定します。

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Private Link 経由で利用可能にしたい各サービスごとに実行します。

次のコマンドを実行して、サービスの許可リストにプライベートエンドポイントを追加します。

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

次のコマンドを実行すると、サービスの許可リストから Private Endpoint を削除できます。

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

サービスの許可リストに Private Endpoint を追加または削除した後は、組織に反映するために次のコマンドを実行します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Private Link を使用して ClickHouse Cloud サービスにアクセスする \\{#access-your-clickhouse-cloud-service-using-private-link\\}

Private Link を有効にした各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Link を使用して接続するには、[Private Link 用の Azure 接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link) で取得した `privateDnsHostname`<sup>API</sup> または `DNS name`<sup>console</sup> のプライベートエンドポイントを使用する必要があります。

### プライベート DNS ホスト名の取得 \\{#obtaining-the-private-dns-hostname\\}

#### オプション 1: ClickHouse Cloud コンソール \\{#option-1-clickhouse-cloud-console-3\\}

ClickHouse Cloud コンソールで **Settings** に移動します。**Set up private endpoint** ボタンをクリックします。表示されたフライアウト ペインで **DNS Name** をコピーします。

<Image img={azure_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

#### オプション 2: API \\{#option-2-api-3\\}

任意のコマンドを実行する前に、次の環境変数を設定します:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

次のコマンドを実行してください。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

次のようなレスポンスが返ってくるはずです。

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` ホスト名への接続は Private Link 経由で行われます。一方、`xxxxxxx.region_code.azure.clickhouse.cloud` への接続はインターネット経由で行われます。

Private Link 経由で ClickHouse Cloud サービスに接続するには、`privateDnsHostname` を使用します。

## トラブルシューティング \\{#troubleshooting\\}

### DNS 設定のテスト \\{#test-dns-setup\\}

次のコマンドを実行します：

```bash
nslookup <dns name>
```

ここで「dns name」は、[プライベート リンク用の Azure 接続エイリアスの取得](#obtain-azure-connection-alias-for-private-link) で取得した `privateDnsHostname`<sup>API</sup> または `DNS name`<sup>console</sup> を指します。

次のようなレスポンスが返ってきます:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### peer による接続リセット \\{#connection-reset-by-peer\\}

原因として最も考えられるのは、Private Endpoint Resource ID がサービスの許可リストに追加されていないことです。[*Add Private Endpoint Resource ID to your services allow-list* ステップ](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### Private Endpoint が pending 状態のまま \\{#private-endpoint-is-in-pending-state\\}

原因として最も考えられるのは、Private Endpoint Resource ID がサービスの許可リストに追加されていないことです。[*Add Private Endpoint Resource ID to your services allow-list* ステップ](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### 接続テスト \\{#test-connectivity\\}

Private Link を使用した接続に問題がある場合は、`openssl` を使用して疎通を確認してください。Private Link エンドポイントのステータスが `Accepted` であることを確認します。

OpenSSL で接続できる必要があります（出力に CONNECTED と表示されます）。`errno=104` が出力されるのは想定どおりです。

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

### プライベートエンドポイントフィルターの確認 \\{#checking-private-endpoint-filters\\}

以下のコマンドを実行する前に、次の環境変数を設定してください。

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

プライベート エンドポイントのフィルターを確認するには、以下のコマンドを実行します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## 詳細情報 \\{#more-information\\}

Azure Private Link の詳細は、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link) を参照してください。
