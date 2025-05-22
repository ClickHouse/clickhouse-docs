---
'title': 'GCP Private Service Connect'
'description': 'このドキュメントでは、Google Cloud Platform (GCP) プライベートサービス接続（PSC）を使用してClickHouse
  Cloudに接続し、ClickHouse CloudのIPアクセスリストを使用してGCP PSCアドレス以外からのClickHouse Cloudサービスへのアクセスを無効にする方法について説明します。'
'sidebar_label': 'GCP Private Service Connect'
'slug': '/manage/security/gcp-private-service-connect'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import gcp_psc_overview from '@site/static/images/cloud/security/gcp-psc-overview.png';
import gcp_privatelink_pe_create from '@site/static/images/cloud/security/gcp-privatelink-pe-create.png';
import gcp_psc_open from '@site/static/images/cloud/security/gcp-psc-open.png';
import gcp_psc_enable_global_access from '@site/static/images/cloud/security/gcp-psc-enable-global-access.png';
import gcp_psc_copy_connection_id from '@site/static/images/cloud/security/gcp-psc-copy-connection-id.png';
import gcp_psc_create_zone from '@site/static/images/cloud/security/gcp-psc-create-zone.png';
import gcp_psc_zone_type from '@site/static/images/cloud/security/gcp-psc-zone-type.png';
import gcp_psc_dns_record from '@site/static/images/cloud/security/gcp-psc-dns-record.png';
import gcp_pe_remove_private_endpoint from '@site/static/images/cloud/security/gcp-pe-remove-private-endpoint.png';
import gcp_privatelink_pe_filters from '@site/static/images/cloud/security/gcp-privatelink-pe-filters.png';
import gcp_privatelink_pe_dns from '@site/static/images/cloud/security/gcp-privatelink-pe-dns.png';

# Private Service Connect {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect(PSC)は、消費者が仮想プライベートクラウド(VPC)ネットワーク内で管理されたサービスにプライベートにアクセスできるようにするGoogle Cloudのネットワーキング機能です。同様に、管理サービスプロデューサーは、これらのサービスを独自の別のVPCネットワークでホストし、消費者へのプライベート接続を提供することができます。

サービスプロデューサーは、プライベートサービスコネクトサービスを作成することで、アプリケーションを消費者に公開します。サービス消費者は、これらのプライベートサービスコネクトサービスに直接アクセスします。

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
デフォルトでは、ClickHouseサービスはプライベートサービス接続経由では利用できません。PSC接続が承認され、確立されていても、以下の[ステップ](#add-endpoint-id-to-services-allow-list)を完了して、インスタンスレベルでPSC IDを許可リストに明示的に追加する必要があります。
:::


**プライベートサービスコネクトのグローバルアクセスを使用する際の重要な考慮事項**：
1. グローバルアクセスを利用するリージョンは、同じVPCに属する必要があります。
1. グローバルアクセスは、PSCレベルで明示的に有効化する必要があります（以下のスクリーンショットを参照）。
1. ファイアウォール設定が他のリージョンからのPSCへのアクセスをブロックしないことを確認してください。
1. GCPのリージョン間データ転送料金が発生する可能性があることに注意してください。

リージョン間接続はサポートされていません。プロデューサーと消費者のリージョンは同じである必要があります。ただし、VPC内の他のリージョンから接続するには、プライベートサービスコネクト(PSC)レベルで[グローバルアクセス](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)を有効にすることができます。

**GCP PSCを有効にするために以下の手順を完了してください**：
1. プライベートサービスコネクトのためのGCPサービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. ClickHouse Cloudサービスに「エンドポイントID」を追加します。
1. ClickHouseサービス許可リストに「エンドポイントID」を追加します。


## Attention {#attention}
ClickHouseは、GCPリージョン内で同じ公開された[PSCエンドポイント](https://cloud.google.com/vpc/docs/private-service-connect)を再利用するためにサービスをグループ化しようとします。ただし、このグループ化は保証されておらず、特にサービスが複数のClickHouse組織に分散されている場合、特に保証されません。
ClickHouse組織内で他のサービス用にPSCが既に構成されている場合は、そのグループ化のためほとんどのステップをスキップし、次の最終ステップへ直接進むことができます：[ClickHouseサービス許可リストに「エンドポイントID」を追加](#add-endpoint-id-to-services-allow-list)します。

Terraformの例は[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)で見つけることができます。

## Before you get started {#before-you-get-started}

:::note
以下に、ClickHouse Cloudサービス内でプライベートサービスコネクトを設定する方法を示すコード例を提供します。以下の例では、以下を使用します：
 - GCPリージョン: `us-central1`
 - GCPプロジェクト（顧客GCPプロジェクト）: `my-gcp-project`
 - 顧客GCPプロジェクト内のGCPプライベートIPアドレス: `10.128.0.2`
 - 顧客GCPプロジェクト内のGCP VPC: `default`
:::

ClickHouse Cloudサービスについての情報を取得する必要があります。これは、ClickHouse CloudコンソールまたはClickHouse APIを通じて行うことができます。ClickHouse APIを使用する場合、次の環境変数を設定してください：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

[新しいClickHouse Cloud APIキーを作成する](/cloud/manage/openapi)か、既存のものを使用できます。

地域、プロバイダー、サービス名でフィルタリングしてClickHouseの`INSTANCE_ID`を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - ClickHouseコンソールから組織IDを取得できます（組織 -> 組織の詳細）。
 - [新しいキーを作成する](/cloud/manage/openapi)か、既存のものを使用できます。
:::

## Obtain GCP service attachment and DNS name for Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、プライベートサービスコネクトを介して接続したいサービスを開き、次に**設定**メニューを開きます。「**プライベートエンドポイントを設定**」ボタンをクリックします。**サービス名**（`endpointServiceId`）と**DNS名**（`privateDnsHostname`）をメモしておきます。次のステップで使用します。

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### Option 2: API {#option-2-api}

:::note
このステップを実行するためには、リージョン内に少なくとも1つのインスタンスがデプロイされている必要があります。
:::

プライベートサービスコネクトのGCPサービスアタッチメントとDNS名を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId`及び`privateDnsHostname`をメモしてください。次のステップで使用します。

## Create service endpoint {#create-service-endpoint}

:::important
このセクションでは、GCP PSC(プライベートサービスコネクト)を介してClickHouseを構成するためのClickHouse特有の詳細をカバーしています。GCP特有のステップは参照として提供されていますが、変更される可能性があることに注意してください。特定のユースケースに基づいてGCP設定を検討してください。  

ClickHouseは必要なGCP PSCエンドポイント、DNSレコードの構成に責任を負いません。  

GCP設定タスクに関連する問題がある場合は、GCPサポートに直接連絡してください。
:::

このセクションでは、サービスエンドポイントを作成します。

### Adding a Private Service Connection {#adding-a-private-service-connection}

まず最初に、プライベートサービス接続を作成します。

#### Option 1: Using Google Cloud console {#option-1-using-google-cloud-console}

Google Cloudコンソールで、**ネットワークサービス -> プライベートサービスコネクト**に移動します。

<Image img={gcp_psc_open} size="lg" alt="Open Private Service Connect in Google Cloud Console" border />

「**エンドポイントを接続**」ボタンをクリックして、プライベートサービスコネクトの作成ダイアログを開きます。

- **ターゲット**: **公開サービス**を使用
- **ターゲットサービス**: [プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップで取得した`endpointServiceId`<sup>API</sup>または`サービス名`<sup>コンソール</sup>を使用します。
- **エンドポイント名**: PSCの**エンドポイント名**に名前を設定します。
- **ネットワーク/サブネットワーク/ IPアドレス**: 接続に使用したいネットワークを選択します。プライベートサービスコネクトエンドポイントのために新しいIPアドレスを作成するか、既存のIPアドレスを使用する必要があります。私たちの例では、名前を**your-ip-address**とし、IPアドレス`10.128.0.2`を割り当てたアドレスを事前に作成しました。
- エンドポイントをどのリージョンからも利用できるようにするために、**グローバルアクセスを有効にする**チェックボックスを有効にできます。

<Image img={gcp_psc_enable_global_access} size="md" alt="Enable Global Access for Private Service Connect" border />

PSCエンドポイントを作成するには、**ADD ENDPOINT**ボタンを使用します。

接続が承認されると、**ステータス**列は**保留中**から**承認済**に変わります。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Copy PSC Connection ID" border />

***PSC接続ID***をコピーします。次のステップで***エンドポイントID***として使用します。

#### Option 2: Using Terraform {#option-2-using-terraform}

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
  # service attachment
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Add GCP PSC Connection ID to allow list on instance level."
}
```

:::note
`endpointServiceId`<sup>API</sup>または`サービス名`<sup>コンソール</sup>を使用して、[プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップを参照してください。
:::

## Set Private DNS Name for Endpoint {#setting-up-dns}

:::note
DNSの構成方法はいくつかあります。特定のユースケースに応じてDNSを設定してください。
:::

[プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップから取得した「DNS名」をGCPプライベートサービスコネクトエンドポイントIPアドレスにポイントする必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを正しく解決できるようになります。

## Add Endpoint ID to ClickHouse Cloud organization {#add-endpoint-id-to-clickhouse-cloud-organization}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[ClickHouseサービス許可リストに「エンドポイントID」を追加](#add-endpoint-id-to-services-allow-list)ステップに進んでください。ClickHouse Cloudコンソールを使用して`PSC接続ID`をサービス許可リストに追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint from ClickHouse Cloud" border />

### Option 2: API {#option-2-api-1}

コマンドを実行する前にこれらの環境変数を設定してください：

[Adding a Private Service Connection](#adding-a-private-service-connection)ステップからの「エンドポイントID」の値で`ENDPOINT_ID`を以下のように置き換えます。

エンドポイントを追加するには、次のコマンドを実行します：

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "A GCP private endpoint",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

エンドポイントを削除するには、次のコマンドを実行します：

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

組織にプライベートエンドポイントを追加/削除します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Add "Endpoint ID" to ClickHouse service allow list {#add-endpoint-id-to-services-allow-list}

プライベートサービスコネクトを使用して利用可能なインスタンスごとに、エンドポイントIDを許可リストに追加する必要があります。


### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、プライベートサービスコネクトを介して接続したいサービスを開き、次に**設定**に移動します。[Adding a Private Service Connection](#adding-a-private-service-connection)ステップで取得した`エンドポイントID`を入力してください。**エンドポイントを作成**をクリックします。

:::note
既存のプライベートサービスコネクト接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### Option 2: API {#option-2-api-2}

コマンドを実行する前にこれらの環境変数を設定してください：

[Adding a Private Service Connection](#adding-a-private-service-connection)ステップからの「エンドポイントID」の値で**ENDPOINT_ID**を置き換えます。

プライベートサービスコネクトを使用して利用可能である必要がある各サービスに対して実行します。

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
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Accessing instance using Private Service Connect {#accessing-instance-using-private-service-connect}

プライベートリンクが有効な各サービスには、パブリックおよびプライベートエンドポイントがあります。プライベートリンクを使用して接続するには、[プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)から取得した`privateDnsHostname`を使用する必要があります。

### Getting Private DNS Hostname {#getting-private-dns-hostname}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**設定**に移動します。「**プライベートエンドポイントを設定**」ボタンをクリックします。開いた飛び出しウィンドウで、**DNS名**をコピーします。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

#### Option 2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud`ホスト名への接続はプライベートサービスコネクトにルーティングされます。一方、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`はインターネット経由でルーティングされます。

## Troubleshooting {#troubleshooting}

### Test DNS setup {#test-dns-setup}

DNS_NAME - [プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用します。

```bash
nslookup $DNS_NAME
```

```response
非権威的回答：
...
アドレス：10.128.0.2
```

### Connection reset by peer {#connection-reset-by-peer}

- おそらく、エンドポイントIDがサービス許可リストに追加されていない可能性があります。[_Add endpoint ID to services allow-list_ステップ](#add-endpoint-id-to-services-allow-list)を再度確認してください。

### Test connectivity {#test-connectivity}

PSCリンクを使用して接続する際に問題がある場合は、`openssl`を使用して接続性を確認してください。プライベートサービスコネクトエンドポイントのステータスが`承認済`であることを確認してください：

OpenSSLは接続できる必要があります（出力にCONNECTEDと表示されます）。`errno=104`は予期される結果です。

DNS_NAME - [プライベートサービスコネクトのGCPサービスアタッチメントを取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの`privateDnsHostname`を使用します。

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
ピア証明書は利用できません
---
クライアント証明書CA名は送信されませんでした
---
SSLハンドシェイクは0バイトを読み取り335バイトを書き込みました
検証：OK
---
新しい、(NONE)、暗号は(NONE)
セキュアな再交渉はサポートされていません
圧縮：NONE
展開：NONE
ALPN交渉は行われませんでした
早期データは送信されませんでした
検証戻りコード：0（ok）
```

### Checking Endpoint filters {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Connecting to a remote database {#connecting-to-a-remote-database}

たとえば、ClickHouse Cloudで[MySQL](../../sql-reference/table-functions/mysql.md)または[PostgreSQL](../../sql-reference/table-functions/postgresql.md)テーブル関数を使用して、GCPにホストされたデータベースに接続しようとしているとします。GCP PSCはこの接続を安全に有効にするために使用できません。PSCは一方向の単方向接続です。内部ネットワークやGCP VPCがClickHouse Cloudに安全に接続できるようにしますが、ClickHouse Cloudが内部ネットワークに接続することはできません。

[GCPプライベートサービスコネクトに関するドキュメント](https://cloud.google.com/vpc/docs/private-service-connect)によれば：

> サービス指向の設計：プロデューサーサービスは、消費者VPCネットワークに対し単一のIPアドレスを公開する負荷分散装置を介して公開されます。プロデューサーサービスにアクセスする消費者トラフィックは一方向であり、サービスのIPアドレスにのみアクセスでき、全体のピアVPCネットワークにアクセスすることはできません。

これを実現するには、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可するようにGCP VPCファイアウォールルールを構成してください。[ClickHouse Cloudリージョンのデフォルトの出口IPアドレス](/manage/security/cloud-endpoints-api)と、[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。

## More information {#more-information}

詳細な情報については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)を訪れてください。
