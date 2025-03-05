---
title: "GCP プライベートサービスコネクト"
description: "このドキュメントは、Google Cloud Platform (GCP) プライベートサービスコネクト (PSC) を使用して ClickHouse Cloud に接続する方法と、ClickHouse Cloud IP アクセスリストを使用して GCP PSC アドレス以外のアドレスからの ClickHouse Cloud サービスへのアクセスを無効にする方法を説明します。"
sidebar_label: "GCP プライベートサービスコネクト"
slug: /manage/security/gcp-private-service-connect
---

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

## プライベートサービスコネクト {#private-service-connect}

プライベートサービスコネクト (PSC) は、消費者が自分の仮想プライベートクラウド (VPC) ネットワーク内で管理されたサービスにプライベートにアクセスできるようにする Google Cloud のネットワーキング機能です。同様に、管理サービスのプロデューサーは、これらのサービスを自身の別々の VPC ネットワークでホストし、消費者にプライベート接続を提供します。

サービスプロデューサーは、プライベートサービスコネクトサービスを作成することにより、消費者にアプリケーションを公開します。サービス消費者は、これらのプライベートサービスコネクトサービスに、これらのプライベートサービスコネクトの種類のいずれかを通じて直接アクセスします。

<img src={gcp_psc_overview} alt="プライベートサービスコネクトの概要" />

:::important
デフォルトでは、ClickHouse サービスはプライベートサービス接続を介して利用できません。PSC 接続が承認され、確立されている場合でも、下記の [手順](#add-endpoint-id-to-services-allow-list) に従って、インスタンスレベルで PSC ID を許可リストに明示的に追加する必要があります。
:::

:::note
GCP プライベートサービスコネクトは、ClickHouse Cloud Production サービスでのみ有効にできます。
:::

クロスリージョン接続はサポートされていません。プロデューサーと消費者のリージョンは同じである必要があります。ただし、プライベートサービスコネクト (PSC) レベルで [グローバルアクセス](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) を有効にすることで、VPC 内の他のリージョンから接続できます。

:::note
プライベートサービスコネクトのグローバルアクセスを使用する際の重要な考慮事項:
1. グローバルアクセスを利用するリージョンは、同じ VPC に属する必要があります。
2. グローバルアクセスは、PSC レベルで明示的に有効にする必要があります（下のスクリーンショットを参照）。
3. ファイアウォール設定が他のリージョンからの PSC へのアクセスをブロックしないようにしてください。
4. GCP のリージョン間データ転送料金が発生する場合があります。

プロセスは四つのステップに分かれています:

1. プライベートサービスコネクト用の GCP サービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. エンドポイント ID を ClickHouse Cloud 組織に追加します。
1. エンドポイント ID をサービスの許可リストに追加します。

:::note
以下の例では、以下の値を使用します:
 - GCP リージョン: `us-central1`
 - GCP プロジェクト (顧客 GCP プロジェクト): `my-gcp-project`
 - 顧客 GCP プロジェクトの GCP プライベート IP アドレス: `10.128.0.2`
 - 顧客 GCP プロジェクトの GCP VPC: `default`

以下にコード例を示し、ClickHouse Cloud サービス内でプライベートサービスコネクトを設定する方法を示します。
:::

## 始める前に {#before-you-get-started}

ClickHouse Cloud サービスに関する情報を取得する必要があります。これは、ClickHouse Cloud コンソールまたは ClickHouse API を使用して行うことができます。ClickHouse API を使用する場合は、次の環境変数を設定してから続行してください:

```bash
export REGION=us-central1
export PROVIDER=gcp
export KEY_ID=<Key ID>
export KEY_SECRET=<Key secret>
export ORG_ID=<ClickHouse organization ID>
export INSTANCE_ID=$(curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\") | .id " -r | head -1)
```
:::note
 - ClickHouse コンソールから組織 ID を取得できます（組織 -> 組織の詳細）。
 - [新しいキーを作成](/cloud/manage/openapi)するか、既存のものを使用できます。
:::

## GCP サービスアタッチメントとプライベートサービスコネクト用の DNS 名を取得する {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、プライベートサービスコネクト経由で接続したいサービスを開き、**設定**メニューを開きます。**プライベートエンドポイントのセットアップ**ボタンをクリックします。**サービス名** (`endpointServiceId`) と **DNS 名** (`privateDnsHostname`) をメモしてください。次のステップでこれらを使用します。

<img src={gcp_privatelink_pe_create} alt="プライベートエンドポイント" />

### オプション 2: API {#option-2-api}

:::note
このステップを実行するには、そのリージョンに少なくとも一つのインスタンスが展開されている必要があります。
:::

プライベートサービスコネクト用の GCP サービスアタッチメントと DNS 名を取得します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xb164akwxw.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモしてください。次のステップでこれらを使用します。

## サービスエンドポイントを作成する {#create-service-endpoint}

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続を追加する {#adding-a-private-service-connection}

最初に、プライベートサービス接続を作成します。

#### オプション 1: Google Cloud コンソールを使用する {#option-1-using-google-cloud-console}

Google Cloud コンソールで、**ネットワークサービス -> プライベートサービスコネクト**に移動します。

<img src={gcp_psc_open} alt="Google Cloud コンソールでプライベートサービスコネクトを開く" />

**コネクトエンドポイント**ボタンをクリックして、プライベートサービスコネクト作成ダイアログを開きます。

- **ターゲット**: **公開されたサービス**を使用する
- **ターゲットサービス**: [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `endpointServiceId` を使用する。
- **エンドポイント名**: PSC **エンドポイント名**に名前を設定します。
- **ネットワーク/サブネットワーク/IP アドレス**: 接続に使用するネットワークを選択します。プライベートサービスコネクトエンドポイント用の IP アドレスを作成するか、既存のものを使用する必要があります。私たちの例では、**your-ip-address**という名前のアドレスを前もって作成し、IP アドレス `10.128.0.2` を割り当てました。
- エンドポイントを任意のリージョンから利用できるようにするには、**グローバルアクセスを有効にする**チェックボックスをオンにします。

<img src={gcp_psc_enable_global_access} alt="プライベートサービスコネクトのグローバルアクセスを有効にする" />

PSC エンドポイントを作成するには、**ADD ENDPOINT** ボタンを使用します。

接続が承認されると、**状態**列が **保留中** から **受理済み** に変わります。

<img src={gcp_psc_copy_connection_id} alt="PSC 接続 ID をコピー" />

***PSC 接続 ID*** をコピーします。この ID を次のステップで ***エンドポイント ID*** として使用します。

#### オプション 2: Terraform を使用する {#option-2-using-terraform}

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
  target = "https://www.googleapis.com/compute/v1/$TARGET" # 下のメモを参照
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "インスタンスレベルの許可リストに GCP PSC 接続 ID を追加します。"
}
```

:::note
TARGET - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `endpointServiceId` を使用します。
:::

## DNS の設定 {#setting-up-dns}

Google Cloud コンソールを使用する場合と、`gcloud` CLI を使用する場合の二つのオプションが提供されます。

### オプション 1: Google Cloud コンソールを使用する {#option-1-using-the-google-cloud-console}

- **サポートされているリージョン**からプライベート DNS ゾーンを作成します。
- **ネットワークサービス -> Cloud DNS** を開きます。
- **ゾーンの作成**を選択します:

<img src={gcp_psc_create_zone} alt="PSC 用の DNS ゾーンを作成" />

ゾーンタイプダイアログで、以下を設定します:

- ゾーンタイプ: **プライベート**
- ゾーン名: 適切なゾーン名を入力します。
- DNS 名: お使いのリージョンの **サポートされているリージョン** テーブルの **プライベート DNS ドメイン** 列を使用します。
- ネットワーク: PSC を使用して ClickHouse Cloud への接続に使用するネットワークに DNS ゾーンをアタッチします。

<img src={gcp_psc_zone_type} alt="プライベート DNS ゾーンタイプ選択" />

#### プライベート DNS ゾーンに DNS レコードを作成する {#create-dns-record-in-private-dns-zone}

[プライベートサービス接続を追加する](#adding-a-private-service-connection) ステップで作成された IP アドレスを指すようにします。

<img src={gcp_psc_dns_record} alt="PSC 用の DNS レコードを作成" />

### オプション 2: `gcloud` CLI を使用する {#option-2-using-the-gcloud-cli}

#### DNS ゾーンの作成 {#create-dns-zone}

```bash
gcloud dns \
  --project=my-gcp-project \
  managed-zones create ch-cloud-us-central1 \
  --description="PSC 用プライベート DNS ゾーン" \
  --dns-name="us-central1.p.gcp.clickhouse.cloud." \
  --visibility="private" \
  --networks="https://www.googleapis.com/compute/v1/projects/my-gcp-project/global/networks/default"
```

#### DNS レコードの作成 {#create-dns-record}

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
DNS_RECORD - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用します。
:::

### オプション 3: Terraform を使用する {#option-3-using-terraform}

```json
variable "ch_dns_record" {
  type    = string
  default = "$DNS_NAME" # 下のメモを参照
}

resource "google_dns_managed_zone" "clickhouse_cloud_private_service_connect" {
  description   = "プライベートサービスコネクトを使用して ClickHouse Cloud にアクセスするためのプライベート DNS ゾーン"
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
DNS_NAME - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用します。
:::

## DNS 設定の確認 {#verify-dns-setup}

DNS_RECORD - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用します。

```bash
ping $DNS_RECORD
```

## エンドポイント ID を ClickHouse Cloud 組織に追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[サービスの許可リストにエンドポイント ID を追加する](#add-endpoint-id-to-services-allow-list) ステップに進みます。ClickHouse Cloud コンソールを使用して `PSC 接続 ID` をサービス許可リストに追加することで、自動的に組織にも追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<img src={gcp_pe_remove_private_endpoint} alt="ClickHouse Cloud からプライベートエンドポイントを削除" />

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、これらの環境変数を設定してください:

以下の **エンドポイント ID** を [プライベートサービス接続を追加する](#adding-a-private-service-connection) ステップから取得した値で置き換えます。

エンドポイントを追加するには、次を実行します:

```bash
cat <<EOF | tee pl_config_org.json
{
  "privateEndpoints": {
    "add": [
      {
        "cloudProvider": "gcp",
        "id": "${ENDPOINT_ID:?}",
        "description": "GCP プライベートエンドポイント",
        "region": "${REGION:?}"
      }
    ]
  }
}
EOF
```

エンドポイントを削除するには、次を実行します:

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

組織にプライベートエンドポイントを追加/削除します:

```bash
curl --silent --user ${KEY_ID:?}:${KEY_SECRET:?} -X PATCH -H "Content-Type: application/json" https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?} -d @pl_config_org.json
```

## サービスの許可リストにエンドポイント ID を追加する {#add-endpoint-id-to-services-allow-list}

プライベートサービスコネクトを使用可能にする各インスタンスのために、エンドポイント ID を許可リストに追加する必要があります。

:::note
このステップは開発サービスには行えません。
:::

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、プライベートサービスコネクト経由で接続したいサービスを開き、**設定**に移動します。 [プライベートサービス接続を追加する](#adding-a-private-service-connection) ステップから取得した `エンドポイント ID` を入力します。**エンドポイントの作成**をクリックします。

:::note
既存のプライベートサービスコネクト接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<img src={gcp_privatelink_pe_filters} alt="プライベートエンドポイントフィルタ" />

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に、これらの環境変数を設定してください:

以下の **エンドポイント ID** を [プライベートサービス接続を追加する](#adding-a-private-service-connection) ステップから取得した値で置き換えます。

プライベートサービスコネクトを使用可能にするすべてのサービスに対して実行します。

追加するには:

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

削除するには:

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

## プライベートサービスコネクトを使用してインスタンスにアクセスする {#accessing-instance-using-private-service-connect}

プライベートサービスコネクトフィルターが設定された各インスタンスには、パブリックエンドポイントとプライベートエンドポイントの二つがあります。プライベートサービスコネクトを使用して接続するには、プライベートエンドポイントを使用する必要があります。これは、[GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `endpointServiceId` を参照してください。

:::note
プライベート DNS ホスト名は、GCP VPC からのみ利用可能です。GCP VPC の外に存在するマシンから DNS ホストを解決しないでください。
:::

### プライベート DNS ホスト名を取得する {#getting-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで、**設定**に移動します。**プライベートエンドポイントのセットアップ**ボタンをクリックします。開かれたフライアウトで、**DNS 名**をコピーします。

<img src={gcp_privatelink_pe_dns} alt="プライベートエンドポイント DNS 名" />

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

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` ホスト名への接続はプライベートサービスコネクトにルーティングされます。一方で、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### DNS 設定をテストする {#test-dns-setup}

DNS_NAME - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用します。

```bash
nslookup $DNS_NAME
```

```response
非権威的回答:
...
アドレス: 10.128.0.2
```

### ピアによる接続のリセット {#connection-reset-by-peer}

- おそらく、エンドポイント ID がサービスの許可リストに追加されていません。[_サービスの許可リストにエンドポイント ID を追加する_ ステップ](#add-endpoint-id-to-services-allow-list)を再確認してください。

### 接続性をテストする {#test-connectivity}

PSC リンクを使用して接続するときに問題がある場合は、`openssl` を使用して接続性を確認してください。プライベートサービスコネクトエンドポイントのステータスが `受理済み` であることを確認してください:

OpenSSL は接続できるはずです (出力に CONNECTED が表示されます)。`errno=104` は予期される結果です。

DNS_NAME - [GCP サービスアタッチメントを取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用します。

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# 次の行をハイライト
CONNECTED(00000003)
write:errno=104
---
利用可能なピア証明書はありません
---
クライアント証明書 CA 名は送信されていません
---
SSL ハンドシェイクは 0 バイトを読み取り、335 バイトを書き込みました
検証: OK
---
新規 (なし)、暗号は (なし)
再交渉はサポートされていません
圧縮: なし
展開: なし
ALPN 交渉は行われませんでした
早期データは送信されませんでした
確認コード: 0 (ok)
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

たとえば、ClickHouse Cloud で [MySQL](../../sql-reference/table-functions/mysql.md) または [PostgreSQL](../../sql-reference/table-functions/postgresql.md) テーブル関数を使用して、GCP にホストされているデータベースに接続しようとしているとします。GCP PSC は、この接続を安全に有効にするためには使用できません。PSC は一方向の単方向接続です。内部ネットワークまたは GCP VPC が ClickHouse Cloud に安全に接続できるようにしますが、ClickHouse Cloud が内部ネットワークに接続することはできません。

[GCP プライベートサービスコネクトのドキュメント](https://cloud.google.com/vpc/docs/private-service-connect) によると:

> サービス指向の設計: プロデューサーサービスは、消費者 VPC ネットワークに単一の IP アドレスを公開するロードバランサーを介して公開されます。プロデューサーサービスにアクセスする消費者のトラフィックは一方向であり、サービス IP アドレスにしかアクセスできず、全体のピア VPC ネットワークにはアクセスできません。

これを実現するには、ClickHouse Cloud から内部/プライベートデータベースサービスへの接続を許可するように、GCP VPC ファイアウォールルールを構成します。[ClickHouse Cloud リージョンのデフォルトの出口 IP アドレス](/manage/security/cloud-endpoints-api)とともに、[利用可能な静的 IP アドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。

## さらなる情報 {#more-information}

詳細情報については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)を参照してください。
