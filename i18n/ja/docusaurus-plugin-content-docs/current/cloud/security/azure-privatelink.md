---
title: Azure プライベートリンク
sidebar_label: Azure プライベートリンク
slug: /cloud/security/azure-privatelink
description: Azure プライベートリンクの設定方法
keywords: [azure, private link, privatelink]
---

# Azure プライベートリンク

:::note
Azure プライベートリンクは、ClickHouse Cloud **Production** サービスでのみ有効にできます。**Development** サービスはサポートされていません。
:::

このガイドでは、Azure プライベートリンクを使用して、Azure（顧客所有および Microsoft パートナーサービスを含む）と ClickHouse Cloud の間で仮想ネットワークを介してプライベート接続を提供する方法を示します。Azure プライベートリンクはネットワークアーキテクチャを簡素化し、公共インターネットへのデータ露出を排除することにより、Azure 内のエンドポイント間の接続を安全に保ちます。

![PrivateLink の概要](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe.png)

AWS と GCP とは異なり、Azure はプライベートリンクを介したクロスリージョン接続をサポートしています。これにより、ClickHouse サービスがデプロイされている異なるリージョンにある VNet 間で接続を確立できます。

:::note
リージョン間トラフィックには追加料金がかかる場合があります。最新の Azure ドキュメントを確認してください。
:::

Azure プライベートリンクを有効にするには、以下の手順を実行してください。

1. プライベートリンク用の Azure 接続エイリアスを取得
1. Azure にプライベートエンドポイントを作成
1. プライベートエンドポイント GUID を ClickHouse Cloud 組織に追加
1. プライベートエンドポイント GUID をサービスの許可リストに追加
1. プライベートリンクを使用して ClickHouse Cloud サービスにアクセス

Azure プライベートリンクの完全な Terraform 例は、[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/PrivateLinkAzure)です。

## プライベートリンク用の Azure 接続エイリアスを取得 {#obtain-azure-connection-alias-for-private-link}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、プライベートリンクを介して接続したいサービスを開き、次に **設定** メニューを開きます。**プライベートエンドポイントの設定** ボタンをクリックします。プライベートリンクの設定に使用される **サービス名** をコピーします。

![プライベートエンドポイント](./images/azure-privatelink-pe-create.png)

### オプション 2: API {#option-2-api}

開始する前に、ClickHouse Cloud API キーが必要です。新しいキーを[作成する](/cloud/manage/openapi)か、既存のキーを使用してください。プライベートリンクの設定を管理するには **Admin** キーが必要です。

API キーを取得したら、次の環境変数を設定してください。

```bash
REGION=<リージョンコード、Azure形式を使用>
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
```

リージョンからインスタンス ID を取得：

指定されたリージョンに少なくとも 1 つの ClickHouse Cloud サービスがデプロイされている必要があります。

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1 | tee instance_id
```

前のステップで受け取った ID を使用して `INSTANCE_ID` 環境変数を作成します：

```bash
INSTANCE_ID=$(cat instance_id)
```

プライベートリンク用の Azure 接続エイリアスとプライベート DNS ホスト名を取得します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result 
{
  "endpointServiceId": "production-westus3-0-0.63c890a9-4d32-48cc-a08c-8cd92dfb1ad3.westus3.azure.privatelinkservice",
  ...
}
```

`endpointServiceId` に注意してください。次のステップで使用します。

## Azure にプライベートエンドポイントを作成 {#create-private-endpoint-in-azure}

このセクションでは、Azure にプライベートエンドポイントを作成します。Azure Portal または Terraform を使用できます。

### オプション 1: Azure Portal を使用して Azure にプライベートエンドポイントを作成 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azure Portal で、**プライベートリンクセンター → プライベートエンドポイント**を開きます。

![Azure プライベートセンターを開く](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-private-link-center.png)

**作成** ボタンをクリックしてプライベートエンドポイント作成ダイアログを開きます。

![PE 作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-private-link-center.png)

---

次の画面で、以下のオプションを指定します：

- **サブスクリプション** / **リソースグループ**: プライベートエンドポイント用の Azure サブスクリプションとリソースグループを選択してください。
- **名前**: **プライベートエンドポイント**の名前を設定します。
- **リージョン**: プライベートリンクを介して ClickHouse Cloud に接続されるデプロイされた VNet のリージョンを選択します。

上記の手順が完了したら、**次へ: リソース** ボタンをクリックします。

![PE 作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-create-basic.png)

---

**Azure リソースの ID または別名で接続**オプションを選択します。

**リソース ID または別名**には、[Azure 接続エイリアスの取得](#obtain-azure-connection-alias-for-private-link)ステップで取得した `endpointServiceId` を使用します。

**次へ: 仮想ネットワーク** ボタンをクリックします。

![PE リソース](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-resource.png)

---

- **仮想ネットワーク**: プライベートリンクを使用して ClickHouse Cloud に接続したい VNet を選択します。
- **サブネット**: プライベートエンドポイントが作成されるサブネットを選択します。

オプション：

- **アプリケーションセキュリティグループ**: ASG をプライベートエンドポイントに添付し、ネットワークセキュリティグループでネットワークトラフィックをフィルタリングするために使用できます。

**次へ: DNS** ボタンをクリックします。

![PE ネットワーク](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-create-vnet.png)

**次へ: タグ** ボタンをクリックします。

---

![PE DNS](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-create-dns.png)

オプションで、プライベートエンドポイントにタグを添付できます。

**次へ: 確認 + 作成** ボタンをクリックします。

---

![PE タグ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-create-tags.png)

最後に、**作成** ボタンをクリックします。

![PE 確認](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-create-review.png)

作成されたプライベートエンドポイントの **接続状態** は **保留中** 状態になります。このプライベートエンドポイントをサービス許可リストに追加すると、**承認済み** 状態に変更されます。

プライベートエンドポイントに関連付けられたネットワークインターフェースを開き、**プライベート IPv4 アドレス**（この例では 10.0.0.4）をコピーします。この情報は次のステップで必要になります。

![PE IP アドレス](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-ip.png)

### オプション 2: Terraform を使用して Azure にプライベートエンドポイントを作成 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

以下のテンプレートを使用して Terraform でプライベートエンドポイントを作成します：

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<データは「プライベートリンクの Azure 接続エイリアスの取得」ステップから>"
    is_manual_connection              = true
  }
}
```

### プライベートエンドポイント `resourceGuid` の取得 {#obtaining-private-endpoint-resourceguid}

プライベートリンクを使用するには、プライベートエンドポイント接続 GUID をサービスの許可リストに追加する必要があります。

プライベートエンドポイントリソース GUID は Azure Portal でのみ公開されます。前のステップで作成したプライベートエンドポイントを開き、**JSON ビュー** をクリックします：

![PE GUID](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-view.png)

プロパティの下で、`resourceGuid` フィールドを見つけ、この値をコピーします：

![PE GUID](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pe-resource-guid.png)

## プライベートリンク用の DNS を設定 {#setting-up-dns-for-private-link}

プライベートリンクを介してリソースにアクセスするには、プライベート DNS ゾーン (`${location_code}.privatelink.azure.clickhouse.cloud`) を作成し、それを VNet に接続する必要があります。

### プライベート DNS ゾーンの作成 {#create-private-dns-zone}

**オプション 1: Azure ポータルを使用**

以下のガイドに従って、[Azure ポータルを使用して Azure プライベート DNS ゾーンを作成](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)してください。

**オプション 2: Terraform を使用**

以下の Terraform テンプレートを使用してプライベート DNS ゾーンを作成します：

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### ワイルドカード DNS レコードを作成 {#create-a-wildcard-dns-record}

ワイルドカードレコードを作成し、プライベートエンドポイントを指し示します：

**オプション 1: Azure ポータルを使用**

1. `MyAzureResourceGroup` リソースグループを開き、`${region_code}.privatelink.azure.clickhouse.cloud` プライベートゾーンを選択します。
2. + レコードセットを選択。
3. 名前には `*` と入力します。
4. IP アドレスにはプライベートエンドポイントの IP アドレスを入力します。
5. **OK** を選択。

![PE レビュー](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/azure-pl-dns-wildcard.png)

**オプション 2: Terraform を使用**

次の Terraform テンプレートを使用してワイルドカード DNS レコードを作成します：

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 仮想ネットワークリンクを作成 {#create-a-virtual-network-link}

プライベート DNS ゾーンを仮想ネットワークにリンクするには、仮想ネットワークリンクを作成する必要があります。

**オプション 1: Azure ポータルを使用**

以下のガイドに従って、[仮想ネットワークをプライベート DNS ゾーンにリンクする](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)を行ってください。

**オプション 2: Terraform を使用**

以下の Terraform テンプレートを使用して仮想ネットワークをプライベート DNS ゾーンにリンクします：

```json
resource "azurerm_private_dns_zone_virtual_network_link" "example" {
  name                  = "test"
  resource_group_name   = var.resource_group_name
  private_dns_zone_name = var.zone_name
  virtual_network_id    = var.virtual_network_id
}
```

### DNS 設定を確認 {#verify-dns-setup}

`westus3.privatelink.azure.clickhouse.cloud` ドメイン内の任意のレコードはプライベートエンドポイント IP に指し示される必要があります。（この例では 10.0.0.4 です。）

```bash
nslookup instance-id.westus3.privatelink.azure.clickhouse.cloud.
Server:		127.0.0.53
Address:	127.0.0.53#53

Non-authoritative answer:
Name:	instance-id.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## プライベートエンドポイント GUID を ClickHouse Cloud 組織に追加 {#add-the-private-endpoint-guid-to-your-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[サービスの許可リストにプライベートエンドポイント GUID を追加](#add-private-endpoint-guid-to-services-allow-list)のステップに進みます。ClickHouse Cloud コンソールを使用して`プライベートエンドポイント GUID`をサービスの許可リストに追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

![エンドポイント](./images/azure-pe-remove-private-endpoint.png)

### オプション 2: API {#option-2-api-1}

以下の環境変数を設定した後、コマンドを実行します：

```bash
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
ENDPOINT_ID=<プライベートエンドポイント resourceGuid>
REGION=<リージョンコード、Azure形式を使用>
```

以下のデータを使用して `VPC_ENDPOINT` 環境変数を設定します：[プライベートエンドポイント `resourceGuid` の取得](#obtaining-private-endpoint-resourceguid)のステップ。

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

プライベートエンドポイントの追加または削除後、以下のコマンドを実行して組織に適用します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## プライベートエンドポイント GUID をサービスの許可リストに追加 {#add-private-endpoint-guid-to-services-allow-list}

デフォルトでは、ClickHouse Cloud サービスはプライベートリンク接続が承認されていても、プライベートリンク接続を介しては利用できません。プライベートリンクを使用して利用可能にする各サービスについて、プライベートエンドポイント GUID を明示的に追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、プライベートリンクを介して接続したいサービスを開き、**設定** に移動します。[前のステップ](#obtaining-private-endpoint-resourceguid)で取得した `エンドポイント ID` を入力します。

:::note
既存のプライベートリンク接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

![プライベートエンドポイント](./images/azure-privatelink-pe-filter.png)

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に、次の環境変数を設定します：

```bash
PROVIDER=azure
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
ENDPOINT_ID=<プライベートエンドポイント resourceGuid>
INSTANCE_ID=<インスタンス ID>
```

プライベートリンクを使用して利用可能にする各サービスに対して実行します。

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

プライベートエンドポイントをサービスの許可リストに追加または削除後、以下のコマンドを実行して組織に適用します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID?} -d @pl_config.json | jq
```

## プライベートリンクを使用して ClickHouse Cloud サービスにアクセス {#access-your-clickhouse-cloud-service-using-private-link}

プライベートリンクが有効になっている各サービスには、公開エンドポイントとプライベートエンドポイントがあります。プライベートリンクを介して接続するには、`privateDnsHostname` であるプライベートエンドポイントを使用する必要があります。

:::note
プライベート DNS ホスト名は、Azure VNet 内からのみ利用可能です。Azure VNet の外にあるマシンから DNS ホストを解決しようとしないでください。
:::

### プライベート DNS ホスト名の取得 {#obtaining-the-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで、**設定** に移動します。**プライベートエンドポイントの設定** ボタンをクリックします。開いたフライアウト にある **DNS 名** をコピーします。

![プライベートエンドポイント](./images/azure-privatelink-pe-dns.png)

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
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig | jq  .result 
```

以下のような応答を受け取る必要があります：

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

この例では、`xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` ホスト名への接続はプライベートリンクにルーティングされます。一方、`xxxxxxx.region_code.azure.clickhouse.cloud` はインターネット経由でルーティングされます。

`privateDnsHostname` を使用して、プライベートリンクを介して ClickHouse Cloud サービスに接続します。

## トラブルシューティング {#troubleshooting}

### DNS 設定のテスト {#test-dns-setup}

`${region_code}.privatelink.azure.clickhouse.cloud.` ゾーン内のすべての DNS レコードは、[Azure にプライベートエンドポイントを作成する](#create-private-endpoint-in-azure)ステップの内部 IP アドレスを指し示す必要があります。この例ではリージョンは `westus3` です。

次のコマンドを実行します：

```bash
nslookup abcd.westus3.privatelink.azure.clickhouse.cloud.
```

次の応答を受け取る必要があります：

```response
Non-authoritative answer:
Name:	abcd.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

### ピアによる接続のリセット {#connection-reset-by-peer}

プライベートエンドポイント GUID がサービス許可リストに追加されていない可能性が高いです。[_サービスの許可リストにプライベートエンドポイント GUID を追加_ ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### プライベートエンドポイントが保留中の状態 {#private-endpoint-is-in-pending-state}

プライベートエンドポイント GUID がサービス許可リストに追加されていない可能性が高いです。[_サービスの許可リストにプライベートエンドポイント GUID を追加_ ステップ](#add-private-endpoint-guid-to-services-allow-list)を再確認してください。

### 接続性のテスト {#test-connectivity}

プライベートリンクを使用して接続に問題がある場合は、`openssl` を使用して接続性を確認してください。プライベートリンクエンドポイントの状態が `Accepted` であることを確認してください。

OpenSSL が接続できるはずです（出力に CONNECTED が表示されます）。`errno=104` は予想されます。

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

コマンドを実行する前に、次の環境変数を設定します：

```bash
KEY_ID=<キー ID>
KEY_SECRET=<キーシークレット>
ORG_ID=<ClickHouse 組織 ID を設定>
INSTANCE_ID=<インスタンス ID>
```

次のコマンドを実行してプライベートエンドポイントフィルターを確認します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} | jq .result.privateEndpointIds
[]
```

## その他の情報 {#more-information}

Azure プライベートリンクに関する詳細情報は、[azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)をご覧ください。
