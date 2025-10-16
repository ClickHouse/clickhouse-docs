---
'title': 'Azure Private Link'
'sidebar_label': 'Azure Private Link'
'slug': '/cloud/security/azure-privatelink'
'description': 'Azure Private Linkの設定方法'
'keywords':
- 'azure'
- 'private link'
- 'privatelink'
'doc_type': 'guide'
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

このガイドでは、Azure Private Linkを使用して、Azure（顧客所有またはMicrosoftパートナーサービスを含む）とClickHouse Cloud間で仮想ネットワークを介してプライベート接続を提供する方法を示します。Azure Private Linkは、ネットワークアーキテクチャを簡素化し、公共インターネットへのデータ露出を排除することで、Azure内のエンドポイント間の接続をセキュリティで保護します。

<Image img={azure_pe} size="lg" alt="プライベートリンクの概要" background='white' />

Azureは、Private Linkを通じてのクロスリージョン接続をサポートしています。これにより、異なるリージョンに配置されたVNet間でClickHouseサービスを接続することができます。

:::note
インタリージョントラフィックには追加料金が適用される場合があります。最新のAzureドキュメントを確認してください。
:::

**Azure Private Linkを有効にするために、次の手順を実行してください。**

1. Private Link用のAzure接続エイリアスを取得
1. Azureでプライベートエンドポイントを作成
1. プライベートエンドポイントリソースIDをClickHouse Cloudの組織に追加
1. サービスの許可リストにプライベートエンドポイントリソースIDを追加
1. Private Linkを使用してClickHouse Cloudサービスにアクセス

:::note
ClickHouse Cloud Azure PrivateLinkは、resourceGUIDからResource IDフィルターに切り替わりました。resourceGUIDを使用することもできますが、後方互換性があるため、Resource IDフィルターへの切り替えをお勧めします。移行するには、Resource IDを使用して新しいエンドポイントを作成し、それをサービスに添付し、古いresourceGUIDベースのものを削除してください。
:::

## 注意 {#attention}
ClickHouseは、Azureリージョン内で同じ公開された[Private Linkサービス](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)を再利用するために、あなたのサービスをグループ化しようとします。しかし、このグループ化は保証されない場合があり、特に複数のClickHouse組織にサービスを分散させる場合には特にそうです。
すでにClickHouse組織内の他のサービスのためにPrivate Linkが構成されている場合、そのグループ化のおかげで、大部分の手順をスキップし、最終ステップである[サービスの許可リストにプライベートエンドポイントリソースIDを追加](#add-private-endpoint-id-to-services-allow-list)に直接進むことができます。

Terraformの例はClickHouseの[Terraformプロバイダーリポジトリ](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)で見つけることができます。

## Private Link用のAzure接続エイリアスを取得 {#obtain-azure-connection-alias-for-private-link}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**メニューを開いてください。**プライベートエンドポイントを設定**ボタンをクリックします。`サービス名`と`DNS名`をメモしておきます。これらはPrivate Linkの設定に使用されます。

<Image img={azure_privatelink_pe_create} size="lg" alt="プライベートエンドポイント" border />

`サービス名`と`DNS名`をメモしてください。次の手順で必要になります。

### オプション2: API {#option-2-api}

始める前に、ClickHouse Cloud APIキーが必要です。新しいキーを[作成する](/cloud/manage/openapi)か、既存のキーを使用してください。

APIキーを取得したら、以下の環境変数を設定してからコマンドを実行してください：

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

リージョン、プロバイダー、サービス名でフィルタリングしてClickHouseの`INSTANCE_ID`を取得します：

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

## Azureでプライベートエンドポイントを作成 {#create-private-endpoint-in-azure}

:::important
このセクションでは、Azure Private Link経由でClickHouseを構成するためのClickHouse固有の詳細をカバーします。Azure固有の手順は、参考のために提供されていますが、Azureクラウドプロバイダーからの通知なしに変更される可能性があります。特定の使用ケースに基づいてAzureの構成を考慮してください。

ClickHouseは必要なAzureプライベートエンドポイントおよびDNSレコードの構成について責任を負わないことに注意してください。

Azure構成タスクに関する問題については、Azureサポートに直接お問い合わせください。
:::

このセクションでは、Azureでプライベートエンドポイントを作成します。AzureポータルまたはTerraformを使用できます。

### オプション1: Azureポータルを使用してAzureでプライベートエンドポイントを作成 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azureポータルで、**Private Link Center → Private Endpoints**を開きます。

<Image img={azure_private_link_center} size="lg" alt="Azureプライベートセンターを開く" border />

**作成**ボタンをクリックしてプライベートエンドポイント作成ダイアログを開きます。

<Image img={azure_private_link_center} size="lg" alt="Azureプライベートセンターを開く" border />

---

次の画面で、次のオプションを指定します：

- **サブスクリプション** / **リソースグループ**: プライベートエンドポイント用のAzureサブスクリプションとリソースグループを選択してください。
- **名前**: **プライベートエンドポイント**の名前を設定します。
- **リージョン**: Private Linkを介してClickHouse Cloudに接続される展開されたVNetが存在するリージョンを選択します。

上記の手順を完了したら、**次へ: リソース**ボタンをクリックします。

<Image img={azure_pe_create_basic} size="md" alt="プライベートエンドポイントの基本作成" border />

---

**リソースIDまたはエイリアスでAzureリソースに接続**オプションを選択します。

**リソースIDまたはエイリアス**には、[Private Link用のAzure接続エイリアスを取得](#obtain-azure-connection-alias-for-private-link)ステップから取得した`endpointServiceId`を使用します。

**次へ: 仮想ネットワーク**ボタンをクリックします。

<Image img={azure_pe_resource} size="md" alt="プライベートエンドポイントリソース選択" border />

---

- **仮想ネットワーク**: Private Linkを使用してClickHouse Cloudに接続したいVNetを選択します
- **サブネット**: プライベートエンドポイントが作成されるサブネットを選択します

オプション：

- **アプリケーションセキュリティグループ**: プライベートエンドポイントにASGを添付し、ネットワークセキュリティグループ内でプライベートエンドポイントへのトラフィックをフィルタリングするために使用できます。

**次へ: DNS**ボタンをクリックします。

<Image img={azure_pe_create_vnet} size="md" alt="プライベートエンドポイント仮想ネットワーク選択" border />

**次へ: タグ**ボタンをクリックします。

---

<Image img={azure_pe_create_dns} size="md" alt="プライベートエンドポイントDNS設定" border />

オプションで、プライベートエンドポイントにタグを添付できます。

**次へ: レビュー + 作成**ボタンをクリックします。

---

<Image img={azure_pe_create_tags} size="md" alt="プライベートエンドポイントタグ" border />

最後に、**作成**ボタンをクリックします。

<Image img={azure_pe_create_review} size="md" alt="プライベートエンドポイントレビュー" border />

作成されたプライベートエンドポイントの**接続状態**は**保留中**の状態になります。サービスの許可リストにこのプライベートエンドポイントを追加すると、**承認済み**の状態に変わります。

プライベートエンドポイントに関連付けられたネットワークインターフェースを開き、**プライベートIPv4アドレス**（この例では10.0.0.4）をコピーします。次のステップでこの情報が必要になります。

<Image img={azure_pe_ip} size="lg" alt="プライベートエンドポイントIPアドレス" border />

### オプション2: Terraformを使用してAzureでプライベートエンドポイントを作成 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

以下のテンプレートを使用して、Terraformでプライベートエンドポイントを作成します：

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

### プライベートエンドポイントリソースIDの取得 {#obtaining-private-endpoint-resourceid}

Private Linkを使用するには、プライベートエンドポイント接続リソースIDをサービスの許可リストに追加する必要があります。

プライベートエンドポイントリソースIDはAzureポータルで公開されています。前のステップで作成したプライベートエンドポイントを開き、**JSONビュー**をクリックします：

<Image img={azure_pe_view} size="lg" alt="プライベートエンドポイントビュー" border />

プロパティの中にある`id`フィールドを探して、この値をコピーします：

**推奨方法: リソースIDを使用**
<Image img={azure_pe_resource_id} size="lg" alt="プライベートエンドポイントリソースID" border />

**レガシー方法: resourceGUIDを使用**
後方互換性のためにresourceGUIDを引き続き使用できます。`resourceGuid`フィールドを探し、この値をコピーします：

<Image img={azure_pe_resource_guid} size="lg" alt="プライベートエンドポイントリソースGUID" border />

## プライベートリンク用のDNS設定 {#setting-up-dns-for-private-link}

プライベートリンク経由でリソースにアクセスするために、プライベートDNSゾーン（`${location_code}.privatelink.azure.clickhouse.cloud`）を作成し、それをVNetに接続する必要があります。

### プライベートDNSゾーンの作成 {#create-private-dns-zone}

**オプション1: Azureポータルを使用**

Azureポータルを使用して[AzureプライベートDNSゾーンを作成するためのガイド](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)に従ってください。

**オプション2: Terraformを使用**

次のTerraformテンプレートを使用してプライベートDNSゾーンを作成します：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカードDNSレコードの作成 {#create-a-wildcard-dns-record}

ワイルドカードレコードを作成し、プライベートエンドポイントを指すようにします：

**オプション1: Azureポータルを使用**

1. `MyAzureResourceGroup`リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud`プライベートゾーンを選択します。
2. +レコードセットを選択します。
3. 名前に`*`と入力します。
4. IPアドレスには、プライベートエンドポイントのIPアドレスを入力します。
5. **OK**を選択します。

<Image img={azure_pl_dns_wildcard} size="lg" alt="プライベートリンクDNSワイルドカード設定" border />

**オプション2: Terraformを使用**

次のTerraformテンプレートを使用してワイルドカードDNSレコードを作成します：

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 仮想ネットワークリンクの作成 {#create-a-virtual-network-link}

プライベートDNSゾーンを仮想ネットワークにリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション1: Azureポータルを使用**

仮想ネットワークをプライベートDNSゾーンにリンクするための[ガイドに従ってください](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)。

**オプション2: Terraformを使用**

:::note
DNSの設定にはさまざまな方法があります。特定の使用ケースに基づいてDNSを設定してください。
:::

[Private Link用のAzure接続エイリアスを取得](#obtain-azure-connection-alias-for-private-link)ステップから取得した「DNS名」をプライベートエンドポイントのIPアドレスにポイントします。これにより、あなたのVPC/ネットワーク内のサービス/コンポーネントが適切に解決できるようになります。

### DNS設定の確認 {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud`ドメインはプライベートエンドポイントのIPに向けられるべきです。（この例では10.0.0.4です）。

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

組織にエンドポイントを追加するには、[サービスの許可リストにプライベートエンドポイントリソースIDを追加](#add-private-endpoint-id-to-services-allow-list)ステップに進んでください。ClickHouse Cloudコンソールを使用してサービスの許可リストにプライベートエンドポイントリソースIDを追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="プライベートエンドポイントを削除" border />

### オプション2: API {#option-2-api-1}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

[プライベートエンドポイントリソースIDを取得する](#obtaining-private-endpoint-resourceid)ステップからのデータを使用して`ENDPOINT_ID`環境変数を設定します。

以下のコマンドを実行してプライベートエンドポイントを追加します：

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

プライベートエンドポイントをサービスの許可リストから削除するためには、以下のコマンドを実行できます：

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

プライベートエンドポイントを追加または削除した後、以下のコマンドを実行して組織に適用します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## サービスの許可リストにプライベートエンドポイントリソースIDを追加する {#add-private-endpoint-id-to-services-allow-list}

デフォルトでは、ClickHouse Cloudサービスは、プライベートリンク接続が承認され、確立されていても、プライベートリンク接続からは利用できません。プライベートリンクを使用できる各サービスのために、プライベートエンドポイントリソースIDを明示的に追加する必要があります。

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、PrivateLinkを介して接続したいサービスを開き、**設定**に移動します。前の[プライベートエンドポイントの取得](#obtaining-private-endpoint-resourceid)ステップから取得した`リソースID`を入力します。

:::note
既存のPrivateLink接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用します。
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="プライベートエンドポイントフィルター" border />

### オプション2: API {#option-2-api-2}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

プライベートリンクを使用できる各サービスに対してそれを実行してください。

以下のコマンドを実行してサービスの許可リストにプライベートエンドポイントを追加します：

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

サービスの許可リストからプライベートエンドポイントを削除するためには、以下のコマンドを実行できます：

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

サービスの許可リストにプライベートエンドポイントを追加または削除した後、以下のコマンドを実行して組織に適用します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Private Linkを使用してClickHouse Cloudサービスにアクセス {#access-your-clickhouse-cloud-service-using-private-link}

Private Linkが有効な各サービスには、公開エンドポイントとプライベートエンドポイントがあります。Private Linkを使用して接続するには、[Private Link用のAzure接続エイリアスを取得](#obtain-azure-connection-alias-for-private-link)から取得した`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>コンソール</sup>というプライベートエンドポイントを使用する必要があります。

### プライベートDNSホスト名の取得 {#obtaining-the-private-dns-hostname}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで**DNS名**をコピーします。

<Image img={azure_privatelink_pe_dns} size="lg" alt="プライベートエンドポイントDNS名" border />

#### オプション2: API {#option-2-api-3}

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

以下のコマンドを実行します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

以下のようなレスポンスが返されるはずです：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud`ホスト名への接続はプライベートリンクにルーティングされます。一方で、`xxxxxxx.region_code.azure.clickhouse.cloud`はインターネットを経由します。

`privateDnsHostname`を使用してClickHouse CloudサービスにPrivate Linkを使用して接続します。

## トラブルシューティング {#troubleshooting}

### DNS設定の確認 {#test-dns-setup}

以下のコマンドを実行します：

```bash
nslookup <dns name>
```
ここで「dns name」は、[Private Link用のAzure接続エイリアスを取得](#obtain-azure-connection-alias-for-private-link)からの`privateDnsHostname`<sup>API</sup>または`DNS名`<sup>コンソール</sup>です。

以下のようなレスポンスが返されるはずです：

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### ピアによる接続のリセット {#connection-reset-by-peer}

おそらく、プライベートエンドポイントリソースIDがサービスの許可リストに追加されていません。[_サービスの許可リストにプライベートエンドポイントリソースIDを追加する_ステップ](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留中の状態にある {#private-endpoint-is-in-pending-state}

おそらく、プライベートエンドポイントリソースIDがサービスの許可リストに追加されていません。[_サービスの許可リストにプライベートエンドポイントリソースIDを追加する_ステップ](#add-private-endpoint-id-to-services-allow-list)を再確認してください。

### 接続の確認 {#test-connectivity}

Private Linkを使用して接続する際に問題がある場合、`openssl`を使用して接続を確認してください。プライベートリンクエンドポイントの状態が`Accepted`であることを確認します。

OpenSSLは接続できるはずです（出力にCONNECTEDが表示されます）。`errno=104`は予期される動作です。

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

コマンドを実行する前に、以下の環境変数を設定してください：

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

プライベートエンドポイントフィルターを確認するために以下のコマンドを実行します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```

## さらなる情報 {#more-information}

Azure Private Linkに関する詳細は、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)をご覧ください。
