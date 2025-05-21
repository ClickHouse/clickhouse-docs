---
title: 'GCP プライベートサービス接続'
description: 'この文書では、Google Cloud Platform (GCP) プライベートサービス接続 (PSC) を使用して ClickHouse Cloud に接続する方法と、ClickHouse Cloud IP アクセスリストを使用して GCP PSC アドレス以外のアドレスから ClickHouse Cloud サービスへのアクセスを無効にする方法について説明します。'
sidebar_label: 'GCP プライベートサービス接続'
slug: /manage/security/gcp-private-service-connect
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


# プライベートサービス接続 {#private-service-connect}

<ScalePlanFeatureBadge feature="GCP PSC"/>

プライベートサービス接続（PSC）は、Google Cloud のネットワーキング機能で、消費者が仮想プライベートクラウド（VPC）ネットワーク内で管理サービスにプライベートにアクセスできるようにします。同様に、この機能は管理サービスのプロデューサーが自分の別々の VPC ネットワーク内でこれらのサービスをホストし、消費者へのプライベート接続を提供することを可能にします。

サービスのプロデューサーは、プライベートサービス接続サービスを作成することで、消費者にアプリケーションを公開します。サービスの消費者は、これらのプライベートサービス接続サービスに直接アクセスします。

<Image img={gcp_psc_overview} size="lg" alt="プライベートサービス接続の概要" border />

:::important
デフォルトでは、ClickHouse サービスはプライベートサービス接続を介して利用できません。たとえ PSC 接続が承認され、確立されてもです。インスタンスレベルで PSC ID を許可リストに明示的に追加する必要があります。次の [ステップ](#add-endpoint-id-to-services-allow-list) を完了してください。
:::


**プライベートサービス接続のグローバルアクセスに関する重要な考慮事項**:
1. グローバルアクセスを利用するリージョンは、同じ VPC に属している必要があります。
1. グローバルアクセスは、PSC レベルで明示的に有効化する必要があります（以下のスクリーンショットを参照）。
1. 他のリージョンからの PSC へのアクセスをブロックしないようにファイアウォール設定を確認してください。
1. GCP のリージョン間データ転送料金が発生する可能性があることに注意してください。

クロスリージョン接続はサポートされていません。プロデューサーと消費者のリージョンは同じである必要があります。ただし、VPC 内の他のリージョンから接続するには、プライベートサービス接続（PSC）レベルで[グローバルアクセス](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)を有効にすることができます。

**GCP PSC を有効にするために次のステップを完了してください**:
1. プライベートサービス接続のための GCP サービス添付を取得します。
1. サービスエンドポイントを作成します。
1. ClickHouse Cloud サービスに「エンドポイント ID」を追加します。
1. ClickHouse サービスの許可リストに「エンドポイント ID」を追加します。


## 注意 {#attention}
ClickHouse は、GCP リージョン内で同じ公開された [PSC エンドポイント](https://cloud.google.com/vpc/docs/private-service-connect) を再利用するためにサービスをグループ化しようとします。ただし、このグループ化は保証されておらず、特に複数の ClickHouse 組織にサービスを分散させるときには注意が必要です。
すでに ClickHouse 組織内の他のサービスに対して PSC が構成されている場合、そのグループ化によりほとんどのステップをスキップできることが多く、最終ステップに直接進むことができます: [ClickHouse サービスの許可リストに「エンドポイント ID」を追加する](#add-endpoint-id-to-services-allow-list)。

Terraform の例は [こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) を参照してください。

## 始める前に {#before-you-get-started}

:::note
以下に、ClickHouse Cloud サービス内でプライベートサービス接続を設定する方法を示すコード例を提供します。以下の例では次のように設定します:
 - GCP リージョン: `us-central1`
 - GCP プロジェクト（顧客 GCP プロジェクト）: `my-gcp-project`
 - 顧客 GCP プロジェクト内の GCP プライベート IP アドレス: `10.128.0.2`
 - 顧客 GCP プロジェクト内の GCP VPC: `default`
:::

ClickHouse Cloud サービスに関する情報を取得する必要があります。これは、ClickHouse Cloud コンソールまたは ClickHouse API を介して行うことができます。ClickHouse API を使用する場合は、次の環境変数を設定してください。

```shell
REGION=<GCP 形式のリージョンコード、例: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

[新しい ClickHouse Cloud API キーを作成](/cloud/manage/openapi)するか、既存のものを使用できます。

リージョン、プロバイダー、およびサービス名でフィルターをかけて ClickHouse の `INSTANCE_ID` を取得します:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
 - ClickHouse コンソールからオーガニゼーション ID を取得できます（オーガニゼーション -> オーガニゼーションの詳細）。
 - [新しいキーを作成](/cloud/manage/openapi)するか、既存のものを使用できます。
:::

## プライベートサービス接続のための GCP サービス添付と DNS 名を取得する {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、プライベートサービス接続を介して接続したいサービスを開き、**設定**メニューを開きます。「**プライベートエンドポイントを設定**」ボタンをクリックします。「サービス名」（ `endpointServiceId` ）と「DNS 名」（ `privateDnsHostname` ）をメモしてください。次のステップで使用します。

<Image img={gcp_privatelink_pe_create} size="lg" alt="プライベートエンドポイント" border />

### オプション 2: API {#option-2-api}

:::note
このステップを実行するには、そのリージョンに少なくとも 1 つのインスタンスを展開している必要があります。
:::

プライベートサービス接続のための GCP サービス添付と DNS 名を取得します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモしてください。次のステップで使用します。

## サービスエンドポイントを作成する {#create-service-endpoint}

:::important
このセクションでは、GCP PSC（プライベートサービス接続）を介して ClickHouse を構成するための ClickHouse 特有の詳細を扱います。GCP 専用のステップは参考として提供されますが、時間とともに変更される可能性があります。特定の使用例に基づいて GCP 設定を考慮してください。  

ClickHouse は、必要な GCP PSC エンドポイントや DNS レコードの設定には責任を負いません。  

GCP 設定タスクに関連する問題については、GCP サポートに直接お問い合わせください。
:::

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続の追加 {#adding-a-private-service-connection}

まず、プライベートサービス接続を作成します。

#### オプション 1: Google Cloud コンソールを使用 {#option-1-using-google-cloud-console}

Google Cloud コンソールに移動し、**ネットワークサービス -> プライベートサービス接続**に進みます。

<Image img={gcp_psc_open} size="lg" alt="Google Cloud コンソールでプライベートサービス接続を開く" border />

「**エンドポイントに接続**」ボタンをクリックして、プライベートサービス接続の作成ダイアログを開きます。

- **ターゲット**: **公開サービス**を使用
- **ターゲットサービス**: [プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップの `endpointServiceId`<sup>API</sup> または `Service name`<sup>console</sup> を使用します。
- **エンドポイント名**: PSC **エンドポイント名**の名前を設定します。
- **ネットワーク/サブネットワーク/IP アドレス**: 接続に使用するネットワークを選択します。プライベートサービス接続のために IP アドレスを作成するか、既存のものを使用する必要があります。私たちの例では、名前 **your-ip-address** のついたアドレスを事前に作成し、IP アドレス `10.128.0.2` を割り当てました。
- エンドポイントをどのリージョンからも利用可能にするために、「**グローバルアクセスを有効にする**」チェックボックスを有効にできます。

<Image img={gcp_psc_enable_global_access} size="md" alt="プライベートサービス接続のためのグローバルアクセスを有効にする" border />

PSC エンドポイントを作成するには、**エンドポイントを追加**ボタンを使用します。

接続が承認されると、**状態**列は **保留中** から **承認済み** に変わります。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="PSC 接続 ID をコピー" border />

***PSC 接続 ID*** をコピーします。これは次のステップで ***エンドポイント ID*** として使用します。

#### オプション 2: Terraform を使用 {#option-2-using-terraform}

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
  # サービス添付
  target = "https://www.googleapis.com/compute/v1/$TARGET" # 下記のメモを参照
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "インスタンスレベルで許可リストに GCP PSC 接続 ID を追加します。"
}
```

:::note
`endpointServiceId`<sup>API</sup> または [プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)のステップの `Service name`<sup>console</sup> を使用してください。
:::

## エンドポイントにプライベート DNS 名を設定する {#setting-up-dns}

:::note
DNS を設定する方法はいくつかあります。特定の使用例に応じて DNS を設定してください。
:::

「DNS 名」は、[プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップから取得したもので、GCP プライベートサービス接続エンドポイント IP アドレスを指す必要があります。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを適切に解決できるようになります。

## ClickHouse Cloud 組織にエンドポイント ID を追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[ClickHouse サービスの許可リストに「エンドポイント ID」を追加する](#add-endpoint-id-to-services-allow-list)ステップに進んでください。ClickHouse Cloud コンソールを使用して `PSC 接続 ID` をサービスの許可リストに追加すると、組織にも自動的に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="ClickHouse Cloud からプライベートエンドポイントを削除" border />

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に以下の環境変数を設定してください：

以下の **ENDPOINT_ID** を [プライベートサービス接続の追加](#adding-a-private-service-connection)ステップの **エンドポイント ID** の値に置き換えます。

エンドポイントを追加するには、次のコマンドを実行します：

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

組織にプライベートエンドポイントを追加/削除するには：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## ClickHouse サービスの許可リストに「エンドポイント ID」を追加する {#add-endpoint-id-to-services-allow-list}

プライベートサービス接続を介して利用可能にする必要がある各インスタンスの許可リストにエンドポイント ID を追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、プライベートサービス接続を介して接続したいサービスを開き、**設定**に移動します。[プライベートサービス接続の追加](#adding-a-private-service-connection)ステップから取得した `エンドポイント ID` を入力します。「**エンドポイントを作成**」をクリックします。

:::note
既存のプライベートサービス接続からのアクセスを許可したい場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="プライベートエンドポイントフィルター" border />

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に以下の環境変数を設定してください：

以下の **ENDPOINT_ID** を [プライベートサービス接続の追加](#adding-a-private-service-connection)ステップの **エンドポイント ID** の値に置き換えます。

プライベートサービス接続を介して利用可能な各サービスについてこれを実行します。

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

## プライベートサービス接続を使用してインスタンスにアクセスする {#accessing-instance-using-private-service-connect}

プライベートリンクが有効になっている各サービスには、パブリックおよびプライベートエンドポイントがあります。プライベートリンクを使用して接続するには、[プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)では、 `privateDnsHostname` を使用してください。

### プライベート DNS ホスト名の取得 {#getting-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで、**設定**に移動します。「**プライベートエンドポイントを設定**」ボタンをクリックします。開いたフライアウトで **DNS 名**をコピーします。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="プライベートエンドポイント DNS 名" border />

#### オプション 2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

この例では、 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` ホスト名への接続はプライベートサービス接続にルーティングされます。一方、 `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` はインターネット経由でルーティングされます。

## トラブルシューティング {#troubleshooting}

### DNS 設定のテスト {#test-dns-setup}

DNS_NAME - [プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップからの `privateDnsHostname` を使用します。

```bash
nslookup $DNS_NAME
```

```response
非権威的な応答:
...
アドレス: 10.128.0.2
```

### ピアによる接続リセット {#connection-reset-by-peer}

- おそらく、エンドポイント ID がサービスの許可リストに追加されていません。再度、[_サービスの許可リストにエンドポイント ID を追加する_ ステップ](#add-endpoint-id-to-services-allow-list)に戻ってください。

### 接続性のテスト {#test-connectivity}

PSC リンクを使用して接続するときに問題がある場合は、`openssl`を使用して接続性を確認してください。プライベートサービス接続エンドポイントのステータスが `Accepted` であることを確認してください：

OpenSSL が接続できるはずです（出力にCONNECTEDが表示されます）。`errno=104` は期待される動作です。

DNS_NAME - [プライベートサービス接続のための GCP サービス添付を取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップからの `privateDnsHostname` を使用します。

```bash
openssl s_client -connect ${DNS_NAME}:9440
```

```response

# highlight-next-line
CONNECTED(00000003)
write:errno=104
---
ペア証明書は利用できません
---
クライアント証明書 CA 名は送信されていません
---
SSL ハンドシェイクは 0 バイトを読み取り、335 バイトを書き込みました
検証: OK
---
新しい (NONE)、暗号化方式は (NONE)
安全な再交渉はサポートされていません
圧縮: なし
拡張: なし
ALPN 交渉は行われませんでした
早期データは送信されませんでした
確認戻り値: 0 (ok)
```

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

例えば、ClickHouse Cloud で [MySQL](../../sql-reference/table-functions/mysql.md) または [PostgreSQL](../../sql-reference/table-functions/postgresql.md) テーブル関数を使用して、GCP にホストされているデータベースに接続しようとしているとします。GCP PSC は、この接続を安全に有効にするために使用することはできません。PSC は一方向の単方向接続です。内部ネットワークまたは GCP VPC から ClickHouse Cloud に安全に接続することはできますが、ClickHouse Cloud から内部ネットワークに接続することはできません。

[GCP プライベートサービス接続の文書](https://cloud.google.com/vpc/docs/private-service-connect)によれば：

> サービス指向設計：プロデューサーサービスは、消費者 VPC ネットワークに単一の IP アドレスを公開するロードバランサーを介して公開されます。プロデューサーサービスにアクセスする消費者トラフィックは一方向であり、サービス IP アドレスにのみアクセスでき、全体のピアリングされた VPC ネットワークにはアクセスできません。

これを実現するには、ClickHouse Cloud から内部/プライベートデータベースサービスへの接続を許可するように GCP VPC ファイアウォールルールを構成します。[ClickHouse Cloud リージョンのデフォルト egress IP アドレス](/manage/security/cloud-endpoints-api)、および [利用可能な静的 IP アドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。

## さらなる情報 {#more-information}

詳細な情報については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)を訪れます。
