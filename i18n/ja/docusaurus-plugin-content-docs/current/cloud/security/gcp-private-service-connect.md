---
title: "GCPプライベートサービス接続"
description: "このドキュメントでは、Google Cloud Platform（GCP）プライベートサービス接続（PSC）を使用してClickHouse Cloudに接続する方法と、ClickHouse Cloud IPアクセリストを使用してGCP PSCアドレス以外のアドレスからClickHouse Cloudサービスへのアクセスを無効にする方法について説明します。"
sidebar_label: "GCPプライベートサービス接続"
slug: /manage/security/gcp-private-service-connect
---

## プライベートサービス接続 {#private-service-connect}

プライベートサービス接続（PSC）は、Google Cloudのネットワーキング機能で、消費者が自分の仮想プライベートクラウド（VPC）ネットワーク内でマネージドサービスにプライベートにアクセスできるようにします。同様に、マネージドサービスプロデューサーは、これらのサービスを別個のVPCネットワーク内でホストし、消費者へのプライベート接続を提供します。

サービスプロデューサーは、プライベートサービス接続サービスを作成することによって、消費者にアプリケーションを公開します。サービス消費者は、これらのプライベートサービス接続サービスに直接アクセスします。

![PSCの概要](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-overview.png)

:::important
デフォルトでは、ClickHouseサービスはプライベートサービス接続を通じて利用できません。PSC接続が承認され、確立されていても、下記の[手順](#add-endpoint-id-to-services-allow-list)を完了してインスタンスレベルでPSC IDを許可リストに明示的に追加する必要があります。
:::

:::note
GCPプライベートサービス接続はClickHouse Cloud本番サービスにのみ有効化できます。
:::

クロスリージョン接続はサポートされていません。プロデューサーと消費者のリージョンは同じである必要があります。ただし、プライベートサービス接続（PSC）レベルで[グローバルアクセス](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)を有効にすることで、VPC内の他のリージョンから接続できます。

:::note
プライベートサービス接続のグローバルアクセスを使用する際の重要な考慮事項：
1. グローバルアクセスを利用するリージョンは、同じVPCに属している必要があります。
2. グローバルアクセスはPSCレベルで明示的に有効化する必要があります（下記のスクリーンショットを参照）。
3. ファイアウォール設定で、他のリージョンからのPSCへのアクセスがブロックされていないことを確認してください。
4. GCP間のデータ転送料金が発生する可能性があることに注意してください。

プロセスは4つのステップに分かれています：

1. プライベートサービス接続のGCPサービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. Endpoint IDをClickHouse Cloud組織に追加します。
1. Endpoint IDをサービスの許可リストに追加します。

:::note
以下の例では、次の内容を使用します：
 - GCPリージョン: `us-central1`
 - GCPプロジェクト（顧客GCPプロジェクト）: `my-gcp-project`
 - 顧客GCPプロジェクト内のGCPプライベートIPアドレス: `10.128.0.2`
 - 顧客GCPプロジェクト内のGCP VPC: `default`

プライベートサービス接続をClickHouse Cloudサービス内で設定する方法を示すコード例を以下に示します。
:::

## 始める前に {#before-you-get-started}

ClickHouse Cloudサービスに関する情報を取得する必要があります。ClickHouse CloudコンソールまたはClickHouse APIを介して行うことができます。ClickHouse APIを使用する場合は、次の環境変数を設定してください：

```bash
export REGION=us-central1
export PROVIDER=gcp
export KEY_ID=<Key ID>
export KEY_SECRET=<Key secret>
export ORG_ID=<ClickHouse organization ID>
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1)
```
:::note
 - ClickHouseコンソールから組織IDを取得できます（組織 -> 組織の詳細）。
 - [新しいキーを作成](/cloud/manage/openapi)するか、既存のものを使用できます。
:::

## GCPサービスアタッチメントとプライベートサービス接続のDNS名を取得する {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、プライベートサービス接続を使用して接続したいサービスを開き、**設定**メニューを開きます。**プライベートエンドポイントを設定**ボタンをクリックします。**サービス名**（`endpointServiceId`）と**DNS名**（`privateDnsHostname`）をメモしておきます。次のステップで使用します。

![プライベートエンドポイント](./images/gcp-privatelink-pe-create.png)

### オプション 2: API {#option-2-api}

:::note
このステップを実行するには、リージョンに少なくとも1つのインスタンスがデプロイされている必要があります。
:::

プライベートサービス接続のGCPサービスアタッチメントとDNS名を取得します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result 
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xb164akwxw.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId`と`privateDnsHostname`をメモしておきます。次のステップで使用します。

## サービスエンドポイントを作成する {#create-service-endpoint}

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続の追加 {#adding-a-private-service-connection}

まず、プライベートサービス接続を作成します。

#### オプション 1: Google Cloudコンソールを使用する {#option-1-using-google-cloud-console}

Google Cloudコンソールで、**ネットワークサービス -> プライベートサービス接続**に移動します。

![PSCを開く](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-open.png)

**エンドポイントを接続**ボタンをクリックしてプライベートサービス接続作成ダイアログを開きます。

- **ターゲット**: **公開サービス**を使用
- **ターゲットサービス**: [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`endpointServiceId`を使用します。
- **エンドポイント名**: PSCの**エンドポイント名**を設定します。
- **ネットワーク/サブネットワーク/IPアドレス**: 接続に使用したいネットワークを選択します。プライベートサービス接続エンドポイントに使用するIPアドレスを作成するか、既存のものを使用する必要があります。例では、**your-ip-address**という名前で事前にアドレスを作成し、IPアドレス`10.128.0.2`を割り当てています。
- エンドポイントをすべてのリージョンから利用できるようにするには、**グローバルアクセスを有効にする**チェックボックスを有効にします。

![グローバルアクセスを有効にする](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-enable-global-access.png)

PSCエンドポイントを作成するには、**エンドポイントを追加**ボタンを使用します。

接続が承認されると、**ステータス**列は**保留中**から**承認**に変わります。

![承認済み](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-copy-connection-id.png)

***PSC接続ID***をコピーします。次のステップで***エンドポイントID***として使用します。

#### オプション 2: Terraformを使用する {#option-2-using-terraform}

```json
provider "google" {
  project = "my-gcp-project"
  region  = "us-central1"
}

variable "region" {
  type    = string
  default = "us-central1"
}

variable "subnetwork" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/regions/us-central1/subnetworks/default"
}

variable "network" {
  type = string
  default = "https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
}

resource "google_compute_address" "psc_endpoint_ip" {
  address      = "10.128.0.2"
  address_type = "INTERNAL"
  name         = "your-ip-address"
  purpose      = "GCE_ENDPOINT"
  region       = var.region
  subnetwork   = var.subnetwork
}

resource "google_compute_forwarding_rule" "clickhouse_cloud_psc" {
  ip_address            = google_compute_address.psc_endpoint_ip.self_link
  name                  = "ch-cloud-${var.region}"
  network               = var.network
  region                = var.region
  load_balancing_scheme = ""
  # サービスアタッチメント
  target = "https://www.googleapis.com/compute/v1/$TARGET" # 下のノートを参照
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "GCP PSC接続IDをインスタンスレベルの許可リストに追加します。"
}
```

:::note
TARGET - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`endpointServiceId`を使用してください。
:::

## DNSの設定 {#setting-up-dns}

Google Cloudコンソールと`gcloud` CLIを使用する2つのオプションが提示されます。

### オプション 1: Google Cloudコンソールを使用 {#option-1-using-the-google-cloud-console}

- **サポートされているリージョン**からプライベートDNSゾーンを作成します。
- **ネットワークサービス -> Cloud DNS**を開きます。
- **ゾーンの作成**を選択します：

![ゾーンの作成](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-create-zone.png)

ゾーンタイプダイアログで、次のように設定します：

- ゾーンタイプ: **プライベート**
- ゾーン名: 適切なゾーン名を入力します。
- DNS名: **サポートされているリージョン**テーブルの**プライベートDNSドメイン**列を使用します。
- ネットワーク: PSCを使用してClickHouse Cloudに接続するために計画しているネットワークにDNSゾーンを添付します。

![ゾーンタイプ](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-zone-type.png)

#### プライベートDNSゾーンにDNSレコードを作成する {#create-dns-record-in-private-dns-zone}

[プライベートサービス接続の追加](#adding-a-private-service-connection)ステップで作成したIPアドレスにポイントします。

![DNSレコード](@site/i18n/ja/docusaurus-plugin-content-docs/current/cloud/security/images/gcp-psc-dns-record.png)

### オプション 2: `gcloud` CLIを使用 {#option-2-using-the-gcloud-cli}

#### DNSゾーンを作成する {#create-dns-zone}

```bash
gcloud dns \
  --project=my-gcp-project \
  managed-zones create ch-cloud-us-central1 \
  --description="プライベートDNSゾーン for PSC" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
```

#### DNSレコードを作成する {#create-dns-record}

```bash
gcloud dns \
  --project=my-gcp-project \
  record-sets create $DNS_RECORD \
  --zone="ch-cloud-us-central1" \
  --type="A" \
  --ttl="300" \
  --rrdatas="10.128.0.2"
```
:::note
DNS_RECORD - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用してください。
:::

### オプション 3: Terraformを使用 {#option-3-using-terraform}

```json
variable "ch_dns_record" {
  type    = string
  default = "$DNS_NAME" # 下のノートを参照
}

resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "プライベートDNSゾーン for ClickHouse Cloudへのプライベートサービス接続"
  dns_name      = "${var.region}.p.gcp.clickhouse.cloud."
  force_destroy = false
  name          = "clickhouse-cloud-private-service-connect-${var.region}"
  visibility    = "private"
}

resource "google_dns_record_set" "psc_dns_record" {
  managed_zone = google_dns_managed_zone.clickhouse_cloud_private_service_connect.name
  name         = "${var.ch_dns_record}"
  type         = "A"
  rrdatas      = [google_compute_address.psc_endpoint_ip.address]
}
```

:::note
DNS_NAME - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用してください。
:::

## DNS設定の確認 {#verify-dns-setup}

DNS_RECORD - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用してください。

```bash
ping $DNS_RECORD
```

## エンドポイントIDをClickHouse Cloud組織に追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[サービスの許可リストにエンドポイントIDを追加](#add-endpoint-id-to-services-allow-list)ステップに進んでください。ClickHouse Cloudコンソールを使用して`PSC接続ID`をサービスの許可リストに追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

![エンドポイント](./images/gcp-pe-remove-private-endpoint.png)

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、これらの環境変数を設定します：

以下の`ENDPOINT_ID`を[プライベートサービス接続の追加](#adding-a-private-service-connection)ステップからの**エンドポイントID**の値で置き換えます。

エンドポイントを追加するには、次を実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "GCPプライベートエンドポイント",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

エンドポイントを削除するには、次を実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "remove": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

エンドポイントを組織に追加/削除します：

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## エンドポイントIDをサービスの許可リストに追加する {#add-endpoint-id-to-services-allow-list}

プライベートサービス接続を使用して利用可能にする必要がある各インスタンスに、エンドポイントIDを許可リストに追加する必要があります。

:::note
このステップは開発サービスに対しては実行できません。
:::

### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、プライベートサービス接続を通じて接続したいサービスを開き、**設定**に移動します。[プライベートサービス接続の追加](#adding-a-private-service-connection)ステップから取得した`エンドポイントID`を入力します。**エンドポイントを作成**をクリックします。

:::note
既存のプライベートサービス接続からのアクセスを許可する場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

![プライベートエンドポイント](./images/gcp-privatelink-pe-filters.png)

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に、これらの環境変数を設定します：

以下の`ENDPOINT_ID`を[プライベートサービス接続の追加](#adding-a-private-service-connection)ステップからの**エンドポイントID**の値で置き換えます。

プライベートサービス接続を使用して利用可能にしたい各サービスについて実行します。

追加するには：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "add": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

削除するには：

```bash
cat <<EOF | tee pl_config.json
{
  "privateEndpointIds": {
    "remove": [
      "${ENDPOINT_ID}"
    ]
  }
}
EOF
```

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?} -d @pl_config.json | jq
```

## プライベートサービス接続を使用してインスタンスにアクセスする {#accessing-instance-using-private-service-connect}

プライベートサービス接続フィルターが設定された各インスタンスには、パブリックエンドポイントとプライベートエンドポイントの2つがあります。プライベートサービス接続を使用して接続するには、[プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`endpointServiceId`を使用する必要があります。

:::note
プライベートDNSホスト名は、あなたのGCP VPCからのみ利用可能です。他のGCP VPCの外にあるマシンからDNSホストを解決しないでください。
:::

### プライベートDNSホスト名を取得する {#getting-private-dns-hostname}

#### オプション 1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。**プライベートエンドポイントを設定**ボタンをクリックします。開いたフライアウトで、**DNS名**をコピーします。

![プライベートエンドポイント](./images/gcp-privatelink-pe-dns.png)

#### オプション 2: API {#option-2-api-3}

```bash
curl --silent --user $KEY_ID:$KEY_SECRET https://api.clickhouse.cloud/v1/organizations/$ORG_ID/services/$INSTANCE_ID/privateEndpointConfig | jq  .result 
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud`ホスト名への接続はプライベートサービス接続にルーティングされます。一方、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### DNS設定のテスト {#test-dns-setup}

DNS_NAME - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用してください。

```bash
nslookup $DNS_NAME
```

```response
非権威的回答:
...
アドレス: 10.128.0.2
```

### ピアによる接続リセット {#connection-reset-by-peer}

- おそらく、エンドポイントIDがサービスの許可リストに追加されていません。[_サービスの許可リストにエンドポイントIDを追加する_ステップ](#add-endpoint-id-to-services-allow-list)を再確認してください。

### 接続性のテスト {#test-connectivity}

PSCリンクを使用した接続に問題がある場合は、`openssl`を使用して接続の可用性を確認してください。プライベートサービス接続エンドポイントのステータスが`承認済み`であることを確認してください：

OpenSSLは接続できるはずです（出力にCONNECTEDが表示されます）。`errno=104`は期待される結果です。

DNS_NAME - [プライベートサービス接続のためのGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用してください。

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response
# 次の行を強調表示
CONNECTED(00000003)
write:errno=104
---
クライアント証明書はありません。
---
証明書の検証コード: 0 (ok)
```

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

ClickHouse Cloudで[MySQL](../../sql-reference/table-functions/mysql.md)や[PostgreSQL](../../sql-reference/table-functions/postgresql.md)のテーブル関数を使用して、GCPにホストされているデータベースに接続しようとしているとします。GCP PSCは、この接続を安全に有効にするためには使用できません。PSCは一方向の一方向接続です。これにより、内部ネットワークまたはGCP VPCはClickHouse Cloudに安全に接続できますが、ClickHouse Cloudが内部ネットワークに接続することはできません。

[GCPプライベートサービス接続のドキュメント](https://cloud.google.com/vpc/docs/private-service-connect)によれば：

> サービス指向の設計：プロデューサーサービスは、単一のIPアドレスを消費者のVPCネットワークに公開するロードバランサーを介して公開されます。プロデューサーサービスにアクセスする消費者トラフィックは一方向であり、サービスのIPアドレスにしかアクセスできず、ピア接続されたVPC全体にアクセスすることはできません。

これを実現するには、GCP VPCファイアウォールルールを設定して、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可します。[ClickHouse Cloudリージョンのデフォルト出口IPアドレス](/manage/security/cloud-endpoints-api)や、[入手可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。

## 詳細情報 {#more-information}

詳細情報については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)を訪問してください。
