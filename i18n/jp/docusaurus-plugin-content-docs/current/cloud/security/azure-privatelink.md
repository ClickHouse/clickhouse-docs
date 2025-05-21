---
title: 'Azure プライベートリンク'
sidebar_label: 'Azure プライベートリンク'
slug: /cloud/security/azure-privatelink
description: 'Azure プライベートリンクの設定方法'
keywords: ['azure', 'private link', 'privatelink']
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


# Azure プライベートリンク

<ScalePlanFeatureBadge feature="Azure プライベートリンク"/>

このガイドでは、Azure プライベートリンクを使用して、Azure（顧客所有および Microsoft パートナーサービスを含む）と ClickHouse Cloud の間で仮想ネットワーク経由のプライベート接続を提供する方法を示します。Azure プライベートリンクは、ネットワークアーキテクチャを簡素化し、パブリックインターネットへのデータ露出を排除することで、Azure 内のエンドポイント間の接続を安全にします。

<Image img={azure_pe} size="lg" alt="プライベートリンクの概要" background='white' />

AWS および GCP とは異なり、Azure はプライベートリンクを介したクロスリージョン接続をサポートしています。これにより、ClickHouse サービスがデプロイされている異なるリージョンにある VNet 間で接続を確立できます。

:::note
リージョン間のトラフィックには追加料金が発生する場合があります。最新の Azure ドキュメントを確認してください。
:::

**Azure プライベートリンクを有効にするための手順を完了してください：**

1. プライベートリンク用の Azure 接続エイリアスを取得します
1. Azure にプライベートエンドポイントを作成します
1. プライベートエンドポイント GUID を ClickHouse Cloud 組織に追加します
1. プライベートエンドポイント GUID をサービスの許可リストに追加します
1. プライベートリンクを使用して ClickHouse Cloud サービスにアクセスします


## 注意 {#attention}
ClickHouse は、Azure リージョン内で同じ公開された [プライベートリンクサービス](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview) を再利用するために、サービスをグループ化しようとします。ただし、サービスを複数の ClickHouse 組織に分散させると、このグループ化は保証されません。
すでに ClickHouse 組織内で他のサービスに対してプライベートリンクが構成されている場合、そのグループ化により多くの手順をスキップでき、そのまま最終ステップ「[プライベートエンドポイント GUID をサービスの許可リストに追加](#add-private-endpoint-guid-to-services-allow-list)」に進むことができます。

ClickHouse の [Terraform プロバイダーリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) で Terraform の例を見つけてください。

## プライベートリンク用の Azure 接続エイリアスを取得する {#obtain-azure-connection-alias-for-private-link}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、プライベートリンクを介して接続したいサービスを開き、次に **設定** メニューを開きます。 **プライベートエンドポイントの設定** ボタンをクリックします。プライベートリンクの設定に使用される `サービス名` と `DNS名` をメモします。

<Image img={azure_privatelink_pe_create} size="lg" alt="プライベートエンドポイント" border />

`サービス名` と `DNS名` をメモしてください。次の手順で必要になります。

### オプション 2: API {#option-2-api}

始める前に、ClickHouse Cloud API キーが必要です。新しいキーを[作成する](/cloud/manage/openapi)か、既存のキーを使用できます。

API キーを取得したら、次の環境変数を設定してからコマンドを実行します。

```bash
REGION=<リージョンコード、Azure 形式を使用、例: westus3>
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
SERVICE_NAME=<お客様の ClickHouse サービス名>
```

リージョン、プロバイダー、サービス名でフィルタリングして ClickHouse の `INSTANCE_ID` を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

プライベートリンク用に Azure 接続エイリアスとプライベート DNS ホスト名を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId` をメモしてください。次の手順で使用します。

## Azure にプライベートエンドポイントを作成する {#create-private-endpoint-in-azure}

:::important
このセクションでは、Azure プライベートリンクを介して ClickHouse を構成するための ClickHouse 固有の詳細を説明します。Azure 固有の手順は、どこを参照するかを案内するために提供されていますが、告知なしに変更される場合がありますので、具体的な使用ケースに基づいて Azure 設定を考慮してください。

ClickHouse は、必要な Azure プライベートエンドポイントや DNS レコードの構成に責任を負いません。

Azure 構成タスクに関しての問題には、直接 Azure サポートにお問い合わせください。
:::

このセクションでは、Azure にプライベートエンドポイントを作成します。Azure ポータルまたは Terraform を使用できます。

### オプション 1: Azure ポータルを使用して Azure にプライベートエンドポイントを作成する {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azure ポータルで、**プライベートリンクセンター → プライベートエンドポイント**を開きます。

<Image img={azure_private_link_center} size="lg" alt="Azure プライベートセンターを開く" border />

**作成** ボタンをクリックしてプライベートエンドポイント作成ダイアログを開きます。

<Image img={azure_private_link_center} size="lg" alt="Azure プライベートセンターを開く" border />

---

次の画面で、以下のオプションを指定します：

- **サブスクリプション** / **リソースグループ**: プライベートエンドポイント用の Azure サブスクリプションとリソースグループを選択してください。
- **名前**: **プライベートエンドポイント**の名前を設定します。
- **リージョン**: プライベートリンクを介して ClickHouse Cloud に接続されるデプロイ済みの VNet のリージョンを選択します。

これらの手順を完了したら、**次へ: リソース**ボタンをクリックします。

<Image img={azure_pe_create_basic} size="md" alt="プライベートエンドポイント基本作成" border />

---

**Azure リソースにリソース ID またはエイリアスで接続** オプションを選択します。

**リソース ID またはエイリアス** には、[プライベートリンク用の Azure 接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link) 手順で取得した `endpointServiceId` を使用します。

**次へ: 仮想ネットワーク**ボタンをクリックします。

<Image img={azure_pe_resource} size="md" alt="プライベートエンドポイントリソース選択" border />

---

- **仮想ネットワーク**: プライベートリンクを使用して ClickHouse Cloud に接続する VNet を選択します。
- **サブネット**: プライベートエンドポイントを作成するサブネットを選択します。

オプション:

- **アプリケーションセキュリティグループ**: プライベートエンドポイントに ASG を添付し、ネットワークセキュリティグループでトラフィックをフィルタリングするのに使用できます。

**次へ: DNS**ボタンをクリックします。

<Image img={azure_pe_create_vnet} size="md" alt="プライベートエンドポイント仮想ネットワーク選択" border />

**次へ: タグ**ボタンをクリックします。

---

<Image img={azure_pe_create_dns} size="md" alt="プライベートエンドポイント DNS 構成" border />

オプションで、プライベートエンドポイントにタグを添付できます。

**次へ: レビュー + 作成**ボタンをクリックします。

---

<Image img={azure_pe_create_tags} size="md" alt="プライベートエンドポイントタグ" border />

最後に、**作成**ボタンをクリックします。

<Image img={azure_pe_create_review} size="md" alt="プライベートエンドポイントレビュー" border />

作成されたプライベートエンドポイントの**接続状況**は**保留中**の状態になります。サービスの許可リストにこのプライベートエンドポイントが追加されると、**承認済み**の状態に変わります。

プライベートエンドポイントに関連付けられたネットワークインターフェースを開き、**プライベート IPv4 アドレス**（この例では 10.0.0.4）をコピーします。これらの情報は次の手順で必要になります。

<Image img={azure_pe_ip} size="lg" alt="プライベートエンドポイント IP アドレス" border />

### オプション 2: Terraform を使用して Azure にプライベートエンドポイントを作成する {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Terraform を使用してプライベートエンドポイントを作成するために、以下のテンプレートを使用してください：

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

プライベートリンクを使用するためには、プライベートエンドポイント接続 GUID をサービスの許可リストに追加する必要があります。

プライベートエンドポイントリソース GUID は Azure ポータルでのみ表示されます。前のステップで作成されたプライベートエンドポイントを開き、**JSON ビュー**をクリックします：

<Image img={azure_pe_view} size="lg" alt="プライベートエンドポイントビュー" border />

プロパティの下にある `resourceGuid` フィールドを見つけてこの値をコピーします：

<Image img={azure_pe_resource_guid} size="lg" alt="プライベートエンドポイントリソース GUID" border />

## プライベートリンクの DNS の設定 {#setting-up-dns-for-private-link}

プライベートリンクを介してリソースにアクセスするには、プライベート DNS ゾーン (`${location_code}.privatelink.azure.clickhouse.cloud`) を作成して、VNet にアタッチする必要があります。

### プライベート DNS ゾーンを作成する {#create-private-dns-zone}

**オプション 1: Azure ポータルを使用**

Azure ポータルを使用して [Azure プライベート DNS ゾーンを作成する手順](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)に従ってください。

**オプション 2: Terraform を使用**

プライベート DNS ゾーンを作成するために、次の Terraform テンプレートを使用します。

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカード DNS レコードを作成する {#create-a-wildcard-dns-record}

ワイルドカードレコードを作成し、プライベートエンドポイントにポイントします：

**オプション 1: Azure ポータルを使用**

1. `MyAzureResourceGroup` リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud` プライベートゾーンを選択します。
2. + レコードセットを選択します。
3. 名前には `*` と入力します。
4. IP アドレスにはプライベートエンドポイントの IP アドレスを入力します。
5. **OK** を選択します。

<Image img={azure_pl_dns_wildcard} size="lg" alt="プライベートリンク DNS ワイルドカードセットアップ" border />

**オプション 2: Terraform を使用**

ワイルドカード DNS レコードを作成するために、次の Terraform テンプレートを使用します：

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

プライベート DNS ゾーンを仮想ネットワークにリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション 1: Azure ポータルを使用**

プライベート DNS ゾーンに仮想ネットワークをリンクする手順に従ってください：[プライベート DNS ゾーンに仮想ネットワークをリンクする](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**オプション 2: Terraform を使用**

:::note
DNS の設定方法はいくつかあります。特定の使用ケースに基づいて DNS を設定してください。
:::

「DNS 名」は、[プライベートリンク用の Azure 接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link) 手順から取得し、プライベートエンドポイントの IP アドレスにポイントする必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを正しく解決できます。

### DNS 設定を確認する {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` ドメインはプライベートエンドポイント IP（この例では 10.0.0.4）にポイントされている必要があります。

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## プライベートエンドポイント GUID を ClickHouse Cloud 組織に追加する {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

エンドポイントを組織に追加するには、[プライベートエンドポイント GUID をサービスの許可リストに追加する](#add-private-endpoint-guid-to-services-allow-list) 手順に進みます。ClickHouse Cloud コンソールを使用して `プライベートエンドポイント GUID` をサービスの許可リストに追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="プライベートエンドポイントを削除する" border />

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、次の環境変数を設定します：

```bash
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
ENDPOINT_ID=<プライベートエンドポイント resourceGuid>
REGION=<リージョンコード、Azure 形式を使用>
```

[プライベートエンドポイントの `resourceGuid` を取得する](#obtaining-private-endpoint-resourceguid) 手順からのデータを使用して `ENDPOINT_ID` 環境変数を設定します。

次のコマンドを実行してプライベートエンドポイントを追加します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "azure",
        "id": "${ENDPOINT_ID:?}",
        "description": "Azure プライベートエンドポイント",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

プライベートエンドポイントを削除するには、次のコマンドを実行します：

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

## プライベートエンドポイント GUID をサービスの許可リストに追加する {#add-private-endpoint-guid-to-services-allow-list}

デフォルトでは、ClickHouse Cloud サービスはプライベートリンク接続が承認され、確立されていてもプライベートリンク経由では利用できません。プライベートリンクを使用して利用可能にすべき各サービスに対して、プライベートエンドポイント GUID を明示的に追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、プライベートリンク経由で接続したいサービスを開き、次に **設定** に移動します。[前の](#obtaining-private-endpoint-resourceguid) 手順から取得した `エンドポイント ID` を入力します。

:::note
既存のプライベートリンク接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="プライベートエンドポイントフィルター" border />

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に次の環境変数を設定します：

```bash
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
ENDPOINT_ID=<プライベートエンドポイント resourceGuid>
INSTANCE_ID=<インスタンス ID>
```

プライベートリンクを使用して利用可能にすべき各サービスに対して実行します。

プライベートエンドポイントをサービスの許可リストに追加するには、次のコマンドを実行します：

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

プライベートエンドポイントをサービスの許可リストから削除するには、次のコマンドを実行します：

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

## プライベートリンクを使用して ClickHouse Cloud サービスにアクセスする {#access-your-clickhouse-cloud-service-using-private-link}

プライベートリンクが有効になっている各サービスには、公開エンドポイントとプライベートエンドポイントがあります。プライベートリンクを使用して接続するには、[プライベートリンク用の Azure 接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link) から取得した `privateDnsHostname`<sup>API</sup> または `DNS名`<sup>コンソール</sup> を使用する必要があります。

### プライベート DNS ホスト名を取得する {#obtaining-the-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで、**設定**に移動します。 **プライベートエンドポイントの設定** ボタンをクリックします。開いたフライアウトで **DNS名** をコピーします。

<Image img={azure_privatelink_pe_dns} size="lg" alt="プライベートエンドポイント DNS 名" border />

#### オプション 2: API {#option-2-api-3}

コマンドを実行する前に、次の環境変数を設定します：

```bash
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
INSTANCE_ID=<インスタンス ID>
```

次のコマンドを実行します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

次のような応答が返されるはずです：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` ホスト名への接続はプライベートリンクにルーティングされます。一方で、`xxxxxxx.region_code.azure.clickhouse.cloud` はインターネットを介してルーティングされます。

プライベートリンクを使用して ClickHouse Cloud サービスに接続するには、`privateDnsHostname` を使用します。

## トラブルシューティング {#troubleshooting}

### DNS 設定をテストする {#test-dns-setup}

次のコマンドを実行します：

```bash
nslookup <dns名>
```
ここで「dns名」は、[プライベートリンク用の Azure 接続エイリアスを取得する](#obtain-azure-connection-alias-for-private-link) 手順からの `privateDnsHostname`<sup>API</sup> または `DNS名`<sup>コンソール</sup> です。

次の応答が返されるはずです：

```response
Non-authoritative answer:
Name: <dns名>
Address: 10.0.0.4
```

### ピアによる接続リセット {#connection-reset-by-peer}

おそらく、プライベートエンドポイント GUID がサービスの許可リストに追加されていない可能性があります。[_プライベートエンドポイント GUID をサービスの許可リストに追加する_ ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留中の状態 {#private-endpoint-is-in-pending-state}

プライベートエンドポイント GUID がサービスの許可リストに追加されていない可能性が高いです。[_プライベートエンドポイント GUID をサービスの許可リストに追加する_ ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### 接続性をテストする {#test-connectivity}

プライベートリンクを使用した接続に問題がある場合は、`openssl` を使用して接続性を確認してください。プライベートリンクエンドポイントのステータスが `Accepted` であることを確認してください。

OpenSSL は接続できるはずです（出力に CONNECTED が表示されます）。`errno=104` は予想される結果です。

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

### プライベートエンドポイントフィルターを確認する {#checking-private-endpoint-filters}

コマンドを実行する前に次の環境変数を設定します：

```bash
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
INSTANCE_ID=<インスタンス ID>
```

次のコマンドを実行してプライベートエンドポイントフィルターを確認します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## さらに情報 {#more-information}

Azure プライベートリンクに関する詳細情報は、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link) をご覧ください。
