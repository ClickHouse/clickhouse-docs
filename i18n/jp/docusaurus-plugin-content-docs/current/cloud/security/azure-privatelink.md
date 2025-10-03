---
title: 'Azure プライベートリンク'
sidebar_label: 'Azure プライベートリンク'
slug: '/cloud/security/azure-privatelink'
description: 'Azure プライベートリンクの設定方法'
keywords:
- 'azure'
- 'private link'
- 'privatelink'
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
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

このガイドでは、Azure Private Linkを使用して、Azure（顧客所有およびMicrosoftパートナーサービスを含む）とClickHouse Cloudの間で仮想ネットワークを介したプライベート接続を提供する方法を示します。Azure Private Linkは、ネットワークアーキテクチャを簡素化し、公開インターネットへのデータ露出を排除することで、Azure内のエンドポイント間の接続を安全にします。

<Image img={azure_pe} size="lg" alt="Overview of PrivateLink" background='white' />

AWSやGCPとは異なり、AzureはPrivate Linkを介してのリージョン間接続をサポートしています。これにより、異なるリージョンに配置されているVNet間でClickHouseサービスとの接続を確立できます。

:::note
リージョン間のトラフィックには追加料金がかかる場合があります。最新のAzureドキュメントをご確認ください。
:::

**Azure Private Linkを有効にするために、次の手順を完了してください：**

1. Private LinkのAzure接続エイリアスを取得します
1. Azureでプライベートエンドポイントを作成します
1. プライベートエンドポイントGUIDをClickHouse Cloud組織に追加します
1. プライベートエンドポイントGUIDをサービスの許可リストに追加します
1. プライベートリンクを使用してClickHouse Cloudサービスにアクセスします


## 注意 {#attention}
ClickHouseは、Azureリージョン内で同じ公開された[Private Linkサービス](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)を再利用するために、サービスをグループ化しようとします。ただし、このグループ化は保証されておらず、特にサービスを複数のClickHouse組織に分散させている場合は特にそうです。
すでにClickHouse組織内で他のサービスのためにPrivate Linkが設定されている場合、そのグループ化のために大部分の手順をスキップし、最終手順である[プライベートエンドポイントGUIDをサービスの許可リストに追加](#add-private-endpoint-guid-to-services-allow-list)に直接進むことができます。

ClickHouseの[Terraformプロバイダリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)でTerraformの例を見つけてください。

## Azure接続エイリアスを取得する {#obtain-azure-connection-alias-for-private-link}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**メニューを開きます。**プライベートエンドポイントを設定**ボタンをクリックします。Private Linkの設定に使用する`サービス名`および`DNS名`をメモしておきます。

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

`サービス名`および`DNS名`をメモしておいてください。次のステップで必要になります。

### オプション2: API {#option-2-api}

始める前に、ClickHouse Cloud APIキーが必要です。[新しいキーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。

APIキーが手に入ったら、コマンドを実行する前に次の環境変数を設定します：

```bash
REGION=<地域コード、Azure形式を使用、例: westus3>
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
SERVICE_NAME=<あなたのClickHouseサービス名>
```

地域、プロバイダ、サービス名でフィルタリングしてClickHouseの`INSTANCE_ID`を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Private Link用のAzure接続エイリアスとプライベートDNSホスト名を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId`をメモしておきます。次のステップで使用します。

## Azureでプライベートエンドポイントを作成する {#create-private-endpoint-in-azure}

:::important
このセクションでは、Azure Private Linkを介してClickHouseを構成するためのClickHouse特有の詳細をカバーしています。Azure特有の手順は参照用に提供されており、どこを見れば良いかのガイドとなりますが、Azureクラウドプロバイダからの通知なしに時間と共に変更される可能性があります。特定のユースケースに基づいてAzure構成を検討してください。  

ClickHouseは、必要なAzureプライベートエンドポイントやDNSレコードの構成について責任を負いません。  

Azure構成タスクに関する問題は、Azureサポートに直接連絡してください。
:::

このセクションでは、Azureでプライベートエンドポイントを作成します。AzureポータルまたはTerraformを使用できます。

### オプション1: Azureポータルを使用してAzureでプライベートエンドポイントを作成する {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azureポータルで、**プライベートリンクセンター → プライベートエンドポイント**を開きます。

<Image img={azure_private_link_center} size="lg" alt="Open Azure Private Center" border />

**作成**ボタンをクリックして、プライベートエンドポイント作成ダイアログを開きます。

<Image img={azure_private_link_center} size="lg" alt="Open Azure Private Center" border />

---

次の画面で、以下のオプションを指定します：

- **サブスクリプション** / **リソースグループ**: プライベートエンドポイント用のAzureサブスクリプションおよびリソースグループを選択してください。
- **名前**: **プライベートエンドポイント**用の名前を設定します。
- **リージョン**: Private Linkを介してClickHouse Cloudに接続されるデプロイ済みVNetのあるリージョンを選択します。

上記の手順が完了したら、**次へ: リソース**ボタンをクリックします。

<Image img={azure_pe_create_basic} size="md" alt="Create Private Endpoint Basic" border />

---

**AzureリソースのIDまたはエイリアスで接続**オプションを選択します。

**リソースIDまたはエイリアス**には、[Azure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)ステップで取得した`endpointServiceId`を使用します。

**次へ: 仮想ネットワーク**ボタンをクリックします。

<Image img={azure_pe_resource} size="md" alt="Private Endpoint Resource Selection" border />

---

- **仮想ネットワーク**: Private Linkを使用してClickHouse Cloudに接続したいVNetを選択します。
- **サブネット**: プライベートエンドポイントが作成されるサブネットを選択します。

オプション：

- **アプリケーションセキュリティグループ**: プライベートエンドポイントにASGをアタッチし、ネットワークセキュリティグループでそれを使用してプライベートエンドポイントへの入出力ネットワークトラフィックをフィルタリングできます。

**次へ: DNS**ボタンをクリックします。

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint Virtual Network Selection" border />

**次へ: タグ**ボタンをクリックします。

---

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint DNS Configuration" border />

オプションで、プライベートエンドポイントにタグをアタッチできます。

**次へ: レビュー + 作成**ボタンをクリックします。

---

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint Tags" border />

最後に、**作成**ボタンをクリックします。

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint Review" border />

作成したプライベートエンドポイントの**接続ステータス**は**保留中**の状態になります。このプライベートエンドポイントをサービスの許可リストに追加すると、**承認済み**の状態に変更されます。

プライベートエンドポイントに関連するネットワークインターフェースを開き、**プライベートIPv4アドレス**（この例では10.0.0.4）をコピーします。次のステップでこの情報が必要になります。

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint IP Address" border />

### オプション2: Terraformを使用してAzureでプライベートエンドポイントを作成する {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Terraformを使用してプライベートエンドポイントを作成するために、以下のテンプレートを使用します：

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

### プライベートエンドポイントの`resourceGuid`を取得する {#obtaining-private-endpoint-resourceguid}

Private Linkを使用するには、プライベートエンドポイント接続GUIDをサービスの許可リストに追加する必要があります。

プライベートエンドポイントリソースGUIDはAzureポータルにのみ表示されます。前のステップで作成したプライベートエンドポイントを開き、**JSONビュー**をクリックします：

<Image img={azure_pe_view} size="lg" alt="Private Endpoint View" border />

プロパティの下にある`resourceGuid`フィールドを見つけ、この値をコピーします：

<Image img={azure_pe_resource_guid} size="lg" alt="Private Endpoint Resource GUID" border />

## プライベートリンク用のDNSを設定する {#setting-up-dns-for-private-link}

プライベートリンクを介してリソースにアクセスするために、プライベートDNSゾーン（`${location_code}.privatelink.azure.clickhouse.cloud`）を作成し、それをVNetにアタッチする必要があります。

### プライベートDNSゾーンを作成する {#create-private-dns-zone}

**オプション1: Azureポータルを使用**

[Azureポータルを使用してAzureプライベートDNSゾーンを作成するためのガイド](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)に従ってください。

**オプション2: Terraformを使用**

プライベートDNSゾーンを作成するために、次のTerraformテンプレートを使用します：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカードDNSレコードを作成する {#create-a-wildcard-dns-record}

ワイルドカードレコードを作成し、プライベートエンドポイントを指すようにします：

**オプション1: Azureポータルを使用**

1. `MyAzureResourceGroup`リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud`プライベートゾーンを選択します。
2. + レコードセットを選択します。
3. 名前には`*`と入力します。
4. IPアドレスにはプライベートエンドポイントのIPアドレスを入力します。
5. **OK**を選択します。

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS Wildcard Setup" border />

**オプション2: Terraformを使用**

ワイルドカードDNSレコードを作成するために、次のTerraformテンプレートを使用します：

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 仮想ネットワークリンクを作成する {#create-a-virtual-network-link}

プライベートDNSゾーンと仮想ネットワークをリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション1: Azureポータルを使用**

[プライベートDNSゾーンに仮想ネットワークをリンクする](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)ためのガイドに従ってください。

**オプション2: Terraformを使用**

:::note
DNSを設定する方法はいくつかあります。特定のユースケースに基づいてDNSを設定してください。
:::

[Azure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)ステップから取得した"DNS名"をプライベートエンドポイントのIPアドレスにポイントする必要があります。これにより、VPC/ネットワーク内のサービスやコンポーネントが適切に解決できるようになります。

### DNS設定を確認する {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud`ドメインはプライベートエンドポイントのIPにポイントされる必要があります。（この例では10.0.0.4）

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
サーバー: 127.0.0.53
アドレス: 127.0.0.53#53

非権威的応答:
名前: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
アドレス: 10.0.0.4
```

## プライベートエンドポイントGUIDをClickHouse Cloud組織に追加する {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[プライベートエンドポイントGUIDをサービスの許可リストに追加する](#add-private-endpoint-guid-to-services-allow-list)ステップに進みます。ClickHouse Cloudコンソールを使用して`プライベートエンドポイントGUID`をサービスの許可リストに追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint" border />

### オプション2: API {#option-2-api-1}

コマンドを実行する前に次の環境変数を設定します：

```bash
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
ENDPOINT_ID=<プライベートエンドポイントresourceGuid>
REGION=<地域コード、Azure形式を使用>
```

[プライベートエンドポイント`resourceGuid`を取得する](#obtaining-private-endpoint-resourceguid)ステップからのデータを使用して`ENDPOINT_ID`環境変数を設定します。

プライベートエンドポイントを追加するために次のコマンドを実行します：

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

プライベートエンドポイントを削除するために次のコマンドを実行することもできます：

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

プライベートエンドポイントを追加または削除した後、次のコマンドを実行して組織に適用します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## プライベートエンドポイントGUIDをサービスの許可リストに追加する {#add-private-endpoint-guid-to-services-allow-list}

デフォルトでは、ClickHouse Cloudサービスはプライベートリンク接続を介して利用できません。プライベートリンク接続が承認され、確立されている場合でも、プライベートエンドポイントGUIDを各サービスに対して明示的に追加する必要があります。

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**に移動します。[前の](#obtaining-private-endpoint-resourceguid)ステップで取得した`エンドポイントID`を入力します。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoints Filter" border />

### オプション2: API {#option-2-api-2}

コマンドを実行する前に次の環境変数を設定します：

```bash
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
ENDPOINT_ID=<プライベートエンドポイントresourceGuid>
INSTANCE_ID=<インスタンスID>
```

プライベートリンクを使用して利用可能な各サービスについて実行します。

プライベートエンドポイントをサービスの許可リストに追加するために次のコマンドを実行します：

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

サービスの許可リストからプライベートエンドポイントを削除するために次のコマンドを実行することもできます：

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

サービスの許可リストにプライベートエンドポイントを追加または削除した後、次のコマンドを実行して組織に適用します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## プライベートリンクを使用してClickHouse Cloudサービスにアクセスする {#access-your-clickhouse-cloud-service-using-private-link}

プライベートリンクが有効な各サービスには、公開エンドポイントとプライベートエンドポイントがあります。プライベートリンクを介して接続するには、[Azure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)から取得した`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>コンソール</sup>を使用する必要があります。

### プライベートDNSホスト名を取得する {#obtaining-the-private-dns-hostname}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

<Image img={azure_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

#### オプション2: API {#option-2-api-3}

コマンドを実行する前に次の環境変数を設定します：

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
INSTANCE_ID=<インスタンスID>
```

次のコマンドを実行します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

以下のような応答を受け取るはずです：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<地域コード>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud`ホスト名への接続はプライベートリンクにルーティングされます。一方、`xxxxxxx.region_code.azure.clickhouse.cloud`はインターネットを介ってルーティングされます。

プライベートリンクを使用してClickHouse Cloudサービスに接続するには、`privateDnsHostname`を使用してください。

## トラブルシューティング {#troubleshooting}

### DNS設定をテストする {#test-dns-setup}

次のコマンドを実行します：

```bash
nslookup <dns名>
```
ここで「dns名」は[Azure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)からの`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>コンソール</sup>です。

次のような応答を受け取るはずです：

```response
非権威的応答:
名前: <dns名>
アドレス: 10.0.0.4
```

### 接続がリセットされた {#connection-reset-by-peer}

おそらく、プライベートエンドポイントGUIDがサービスの許可リストに追加されていません。[_プライベートエンドポイントGUIDをサービスの許可リストに追加する_ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留中の状態 {#private-endpoint-is-in-pending-state}

おそらく、プライベートエンドポイントGUIDがサービスの許可リストに追加されていません。[_プライベートエンドポイントGUIDをサービスの許可リストに追加する_ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### 接続をテストする {#test-connectivity}

プライベートリンクを介して接続する際に問題がある場合は、`openssl`を使用して接続を確認してください。プライベートリンクエンドポイントのステータスが`受理済み`であることを確認します。

OpenSSLは接続できるはずです（出力にCONNECTEDと表示されます）。`errno=104`は予想されることです。

```bash
openssl s_client -connect abcd.westus3.privatelink.azure.clickhouse.cloud.cloud:9440
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

### プライベートエンドポイントフィルタを確認する {#checking-private-endpoint-filters}

コマンドを実行する前に次の環境変数を設定します：

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
INSTANCE_ID=<インスタンスID>
```

プライベートエンドポイントフィルタを確認するために次のコマンドを実行します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## 更なる情報 {#more-information}

Azure Private Linkに関する詳細情報については、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)をご覧ください。
