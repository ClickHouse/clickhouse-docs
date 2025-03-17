---
title: Azure Private Link
sidebar_label: Azure Private Link
slug: /cloud/security/azure-privatelink
description: Azure Private Linkのセットアップ方法
keywords: [azure, private link, privatelink]
---

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

:::note
Azure Private LinkはClickHouse Cloudの**Production**サービスにのみ有効化できます。**Development**サービスはサポートされていません。
:::

このガイドでは、Azure Private Linkを使用して、Azure（顧客所有およびMicrosoftパートナーサービスを含む）とClickHouse Cloudとの間に仮想ネットワーク経由でプライベート接続を提供する方法を示します。Azure Private Linkはネットワークアーキテクチャを簡素化し、パブリックインターネットへのデータ露出を排除することで、Azure内のエンドポイント間の接続を安全にします。

<img src={azure_pe} alt="PrivateLinkの概要" />

AWSやGCPとは異なり、AzureはPrivate Linkを介したクロスリージョン接続をサポートしています。これにより、異なるリージョンにデプロイされたClickHouseサービス間で、VNet間の接続を確立できます。

:::note
リージョン間のトラフィックには追加料金が発生する場合があります。最新のAzureドキュメントを確認してください。
:::

Azure Private Linkを有効にするために、以下の手順を完了してください。

1. Private Link用のAzure接続エイリアスを取得する
2. Azureにプライベートエンドポイントを作成する
3. プライベートエンドポイントのGUIDをClickHouse Cloud組織に追加する
4. プライベートエンドポイントのGUIDをサービスの許可リストに追加する
5. プライベートリンクを使用してClickHouse Cloudサービスにアクセスする

Azure Private Linkの完全なTerraform例については、[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/PrivateLinkAzure)を参照してください。

## Private Link用のAzure接続エイリアスを取得する {#obtain-azure-connection-alias-for-private-link}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**メニューを開きます。**プライベートエンドポイントを設定**ボタンをクリックします。プライベートリンクのセットアップに使用される**サービス名**をコピーします。

<img src={azure_privatelink_pe_create} alt="プライベートエンドポイント" />

### オプション2: API {#option-2-api}

始める前に、ClickHouse Cloud APIキーが必要です。新しいキーを[作成する](/cloud/manage/openapi)か、既存のキーを使用できます。プライベートリンク構成を管理するには、**Admin**キーが必要であることに注意してください。

APIキーを取得したら、コマンドを実行する前に以下の環境変数を設定します:

```bash
REGION=<リージョンコード、Azure形式を使用>
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織ID>
```

リージョンからインスタンスIDを取得します:

指定されたリージョンに少なくとも1つのClickHouse Cloudサービスが展開されている必要があります。

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1 | tee instance_id
```

前の手順で受け取ったIDを使用して、`INSTANCE_ID`環境変数を作成します:

```bash
INSTANCE_ID=$(cat instance_id)
```

Private Link用のAzure接続エイリアスとプライベートDNSホスト名を取得します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.63c890a9-4d32-48cc-a08c-8cd92dfb1ad3.westus3.azure.privatelinkservice",
  ...
}
```

`endpointServiceId`をメモしておきます。この値は次のステップで使用します。

## Azureにプライベートエンドポイントを作成する {#create-private-endpoint-in-azure}

このセクションでは、Azureにプライベートエンドポイントを作成します。AzureポータルまたはTerraformを使用できます。

### オプション1: Azureポータルを使用してプライベートエンドポイントを作成する {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azureポータルで、**プライベートリンクセンター → プライベートエンドポイント**を開きます。

<img src={azure_private_link_center} alt="Azureプライベートセンターを開く" />

**作成**ボタンをクリックして、プライベートエンドポイント作成ダイアログを開きます。

<img src={azure_private_link_center} alt="Azureプライベートセンターを開く" />

---

次の画面では、以下のオプションを指定します:

- **サブスクリプション** / **リソースグループ**: プライベートエンドポイント用のAzureサブスクリプションとリソースグループを選択してください。
- **名前**: **プライベートエンドポイント**の名前を設定します。
- **リージョン**: Private Linkを介してClickHouse Cloudに接続されるVNetが展開されているリージョンを選択します。

上記の手順を完了したら、**次へ: リソース**ボタンをクリックします。

<img src={azure_pe_create_basic} alt="プライベートエンドポイント基本情報の作成" />

---

**Azureリソースに、リソースIDまたはエイリアスで接続**のオプションを選択します。

**リソースIDまたはエイリアス**には、[Private Link用のAzure接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link)ステップで取得した`endpointServiceId`を使用してください。

**次へ: 仮想ネットワーク**ボタンをクリックします。

<img src={azure_pe_resource} alt="プライベートエンドポイントリソース選択" />

---

- **仮想ネットワーク**: Private Linkを使用してClickHouse Cloudに接続したいVNetを選択してください
- **サブネット**: プライベートエンドポイントが作成されるサブネットを選択してください

オプション:

- **アプリケーションセキュリティグループ**: プライベートエンドポイントにASGを添付して、プライベートエンドポイントへのネットワークトラフィックをフィルタリングするためにネットワークセキュリティグループで使用できます。

**次へ: DNS**ボタンをクリックします。

<img src={azure_pe_create_vnet} alt="プライベートエンドポイント仮想ネットワーク選択" />

**次へ: タグ**ボタンをクリックします。

---

<img src={azure_pe_create_dns} alt="プライベートエンドポイントDNS構成" />

オプションで、プライベートエンドポイントにタグを添付できます。

**次へ: レビュー + 作成**ボタンをクリックします。

---

<img src={azure_pe_create_tags} alt="プライベートエンドポイントタグ" />

最後に、**作成**ボタンをクリックします。

<img src={azure_pe_create_review} alt="プライベートエンドポイントレビュー" />

作成されたプライベートエンドポイントの**接続状況**は**保留中**の状態になります。サービスの許可リストにこのプライベートエンドポイントを追加すると、**承認済み**の状態に変更されます。

プライベートエンドポイントに関連付けられたネットワークインターフェイスを開き、**プライベートIPv4アドレス**（この例では10.0.0.4）をコピーします。この情報は次の手順で必要になります。

<img src={azure_pe_ip} alt="プライベートエンドポイントIPアドレス" />

### オプション2: Terraformを使用してAzureにプライベートエンドポイントを作成する {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Terraformを使用してプライベートエンドポイントを作成するには、以下のテンプレートを使用してください:

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

### プライベートエンドポイントの `resourceGuid` を取得する {#obtaining-private-endpoint-resourceguid}

Private Linkを使用するには、プライベートエンドポイント接続GUIDをサービスの許可リストに追加する必要があります。

プライベートエンドポイントリソースGUIDはAzureポータルでのみ表示されます。前のステップで作成されたプライベートエンドポイントを開き、**JSONビュー**をクリックします:

<img src={azure_pe_view} alt="プライベートエンドポイントビュー" />

プロパティの下にある`resourceGuid`フィールドを見つけ、この値をコピーします:

<img src={azure_pe_resource_guid} alt="プライベートエンドポイントリソースGUID" />

## Private Link用DNSの設定 {#setting-up-dns-for-private-link}

Private Linkを介してリソースにアクセスするには、プライベートDNSゾーン（`${location_code}.privatelink.azure.clickhouse.cloud`）を作成し、VNetにアタッチする必要があります。

### プライベートDNSゾーンを作成する {#create-private-dns-zone}

**オプション1: Azureポータルを使用する**

以下のガイドに従って、[Azureポータルを使用してAzureプライベートDNSゾーンを作成してください](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)。

**オプション2: Terraformを使用する**

プライベートDNSゾーンを作成するための以下のTerraformテンプレートを使用してください:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカードDNSレコードを作成する {#create-a-wildcard-dns-record}

ワイルドカードレコードを作成し、プライベートエンドポイントを指すようにします。

**オプション1: Azureポータルを使用する**

1. `MyAzureResourceGroup`リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud`プライベートゾーンを選択します。
2. + レコードセットを選択します。
3. 名前に `*` を入力します。
4. IPアドレスに、プライベートエンドポイントのIPアドレスを入力します。
5. **OK**を選択します。

<img src={azure_pl_dns_wildcard} alt="プライベートリンクDNSワイルドカード設定" />

**オプション2: Terraformを使用する**

ワイルドカードDNSレコードを作成するための以下のTerraformテンプレートを使用してください:

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

プライベートDNSゾーンを仮想ネットワークにリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション1: Azureポータルを使用する**

以下のガイドに従って、[プライベートDNSゾーンに仮想ネットワークをリンクしてください](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**オプション2: Terraformを使用する**

仮想ネットワークをプライベートDNSゾーンにリンクするための以下のTerraformテンプレートを使用してください:

```json
resource "azurerm_private_dns_zone_virtual_network_link" "example" {
  name                  = "test"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = var.zone_name
  virtual_network_id    = var.virtual_network_id
}
```

### DNS設定を確認する {#verify-dns-setup}

`westus3.privatelink.azure.clickhouse.cloud`ドメイン内の任意のレコードは、プライベートエンドポイントIPにポイントされるべきです。（この例では10.0.0.4）。

```bash
nslookup instance-id.westus3.privatelink.azure.clickhouse.cloud.
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	instance-id.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## プライベートエンドポイント_GUID_をClickHouse Cloud組織に追加する {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

エンドポイントを組織に追加するには、[サービスの許可リストにプライベートエンドポイントGUIDを追加します](#add-private-endpoint-guid-to-services-allow-list)手順に進みます。ClickHouse Cloudコンソールを使用して`プライベートエンドポイントGUID`をサービスの許可リストに追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<img src={azure_pe_remove_private_endpoint} alt="プライベートエンドポイントを削除" />

### オプション2: API {#option-2-api-1}

コマンドを実行する前に、以下の環境変数を設定します:

```bash
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
ENDPOINT_ID=<プライベートエンドポイントresourceGuid>
REGION=<リージョンコード、Azure形式を使用>
```

[プライベートエンドポイントの `resourceGuid` を取得する](#obtaining-private-endpoint-resourceguid) ステップからのデータを使用して、`VPC_ENDPOINT`環境変数を設定します。

プライベートエンドポイントを追加するために次のコマンドを実行します:

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

プライベートエンドポイントを削除するためのコマンドも実行できます:

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

プライベートエンドポイントを追加または削除した後、次のコマンドを実行して組織に適用します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## サービスの許可リストにプライベートエンドポイント_GUID_を追加する {#add-private-endpoint-guid-to-services-allow-list}

デフォルトでは、プライベートリンク接続が承認され、確立されていても、ClickHouse Cloudサービスはプライベートリンク接続を介して利用できません。プライベートリンクを使用して利用可能にする各サービスにプライベートエンドポイントGUIDを明示的に追加する必要があります。

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLink経由で接続したいサービスを開き、**設定**に移動します。 [前のステップ](#obtaining-private-endpoint-resourceguid)で取得した`エンドポイントID`を入力します。

:::note
既存のプライベートリンク接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<img src={azure_privatelink_pe_filter} alt="プライベートエンドポイントフィルター" />

### オプション2: API {#option-2-api-2}

コマンドを実行する前に、以下の環境変数を設定します:

```bash
PROVIDER=azure
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
ENDPOINT_ID=<プライベートエンドポイントresourceGuid>
INSTANCE_ID=<インスタンスID>
```

プライベートリンクを使用して利用可能な各サービスに対して実行します。

プライベートエンドポイントをサービスの許可リストに追加するためのコマンドを実行します:

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

サービスの許可リストからプライベートエンドポイントを削除するためのコマンドを実行できます:

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

サービスの許可リストにプライベートエンドポイントを追加または削除した後、次のコマンドを実行して組織に適用します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID?} -d @pl_config.json | jq
```

## プライベートリンクを使用してClickHouse Cloudサービスにアクセスする {#access-your-clickhouse-cloud-service-using-private-link}

プライベートリンクが有効化されている各サービスには、公開エンドポイントとプライベートエンドポイントがあります。プライベートリンクを介して接続するには、`privateDnsHostname`であるプライベートエンドポイントを使用する必要があります。

:::note
プライベートDNSホスト名は、Azure VNetからのみ利用可能です。Azure VNetの外部にあるマシンからDNSホストを解決しようとしないでください。
:::

### プライベートDNSホスト名を取得する {#obtaining-the-private-dns-hostname}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

<img src={azure_privatelink_pe_dns} alt="プライベートエンドポイントDNS名" />

#### オプション2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定します:

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
INSTANCE_ID=<インスタンスID>
```

次のコマンドを実行します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result
```

次のようなレスポンスが返されます:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud`ホスト名への接続はプライベートリンクにルーティングされます。一方、`xxxxxxx.region_code.azure.clickhouse.cloud`はインターネット経由でルーティングされます。

プライベートリンクを使用してClickHouse Cloudサービスに接続するには、`privateDnsHostname`を使用します。

## トラブルシューティング {#troubleshooting}

### DNS設定をテストする {#test-dns-setup}

`${region_code}.privatelink.azure.clickhouse.cloud.`ゾーン内のすべてのDNSレコードは、[Azureにプライベートエンドポイントを作成する](#create-private-endpoint-in-azure)ステップの内部IPアドレスを指すべきです。この例では、リージョンは`westus3`です。

次のコマンドを実行します:

```bash
nslookup abcd.westus3.privatelink.azure.clickhouse.cloud.
```

次のようなレスポンスを受け取るべきです:

```response
Non-authoritative answer:
Name:	abcd.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

### ピアによる接続リセット {#connection-reset-by-peer}

おそらく、プライベートエンドポイントGUIDがサービスの許可リストに追加されていません。[_サービスの許可リストにプライベートエンドポイントGUIDを追加する_ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留中の状態にある {#private-endpoint-is-in-pending-state}

おそらく、プライベートエンドポイントGUIDがサービスの許可リストに追加されていません。[_サービスの許可リストにプライベートエンドポイントGUIDを追加する_ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### 接続をテストする {#test-connectivity}

プライベートリンク接続で問題が発生している場合は、`openssl`を使用して接続を確認してください。プライベートリンクエンドポイントの状態が`Accepted`であることを確認してください。

OpenSSLが接続できるはずです（出力に「CONNECTED」が表示されます）。`errno=104`は期待されるものです。

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

### プライベートエンドポイントフィルターの確認 {#checking-private-endpoint-filters}

コマンドを実行する前に、以下の環境変数を設定します:

```bash
KEY_ID=<キーID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse組織IDを設定>
INSTANCE_ID=<インスタンスID>
```

次のコマンドを実行してプライベートエンドポイントフィルターを確認します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | jq .result.privateEndpointIds
[]
```

## さらなる情報 {#more-information}

Azure Private Linkに関する詳細情報は、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)をご覧ください。
