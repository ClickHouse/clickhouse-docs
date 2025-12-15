---
title: "GCP Private Service Connect"
description: "このドキュメントでは、Google Cloud Platform (GCP) の Private Service Connect (PSC) を使用して ClickHouse Cloud に接続する方法と、ClickHouse Cloud の IP アクセスリストを使用して、GCP PSC のアドレス以外からの ClickHouse Cloud サービスへのアクセスを禁止する方法について説明します。"
sidebar_label: "GCP Private Service Connect"
slug: /manage/security/gcp-private-service-connect
doc_type: 'guide'
keywords: ['Private Service Connect']
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

Private Service Connect (PSC) は、サービス利用者が自分の Virtual Private Cloud (VPC) ネットワーク内からマネージドサービスへプライベートにアクセスできるようにする Google Cloud のネットワーク機能です。同様に、マネージドサービス提供者が自分たちの独立した VPC ネットワーク内でこれらのサービスをホストし、利用者に対してプライベート接続を提供することも可能にします。

サービス提供者は、Private Service Connect サービスを作成することで、自身のアプリケーションを利用者に公開します。サービス利用者は、次のいずれかの Private Service Connect の種類を通じて、それらの Private Service Connect サービスへ直接アクセスします。

<Image img={gcp_psc_overview} size="lg" alt="Private Service Connect の概要" border />

:::important
デフォルトでは、PSC 接続が承認され確立されていても、ClickHouse サービスは Private Service Connect 経由では利用できません。インスタンスレベルで、以下の [手順](#add-endpoint-id-to-services-allow-list) を完了して、PSC ID を許可リストに明示的に追加する必要があります。
:::

**Private Service Connect Global Access を使用する際の重要な注意事項**:
1. Global Access を利用するリージョンは、同一の VPC に属している必要があります。
1. Global Access は PSC レベルで明示的に有効化する必要があります（以下のスクリーンショットを参照してください）。
1. ファイアウォール設定によって、他リージョンからの PSC へのアクセスがブロックされていないことを確認してください。
1. GCP のリージョン間データ転送料金が発生する可能性がある点に注意してください。

リージョン間接続はサポートされていません。提供者と利用者のリージョンは同一である必要があります。ただし、Private Service Connect (PSC) レベルで [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) を有効にすることで、同一 VPC 内の他リージョンから接続することは可能です。

**GCP PSC を有効化するには、次の作業を完了してください**:
1. Private Service Connect 用の GCP サービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. 「Endpoint ID」を ClickHouse Cloud サービスに追加します。
1. 「Endpoint ID」を ClickHouse サービスの許可リストに追加します。

## 注意 {#attention}
ClickHouse は、GCP リージョン内で同じ公開されている [PSC エンドポイント](https://cloud.google.com/vpc/docs/private-service-connect) を再利用できるように、サービスをグループ化しようとします。ただし、このグループ化は保証されず、特に複数の ClickHouse 組織にサービスを分散している場合は当てはまらない可能性があります。
すでに同じ ClickHouse 組織内の他のサービス向けに PSC を構成している場合は、そのグループ化によりほとんどの手順を省略できることが多く、最終ステップである「["Endpoint ID" を ClickHouse サービス許可リストに追加する](#add-endpoint-id-to-services-allow-list)」に直接進むことができます。

Terraform の例は [こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) を参照してください。

## 始める前に {#before-you-get-started}

:::note
以下のコード例では、ClickHouse Cloud サービスで Private Service Connect をセットアップする方法を示します。以下の例では、次の値を使用します：

* GCP リージョン：`us-central1`
* GCP プロジェクト（お客様の GCP プロジェクト）：`my-gcp-project`
* お客様の GCP プロジェクト内の GCP プライベート IP アドレス：`10.128.0.2`
* お客様の GCP プロジェクト内の GCP VPC：`default`
  :::

ClickHouse Cloud サービスに関する情報を取得する必要があります。これは ClickHouse Cloud コンソールまたは ClickHouse API のいずれかで取得できます。ClickHouse API を使用する場合は、先に進む前に次の環境変数を設定してください：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

[新しい ClickHouse Cloud API キーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。

ClickHouse の `INSTANCE_ID` は、リージョン、プロバイダー、サービス名でフィルタリングして取得します。

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

* Organization ID は ClickHouse コンソールの「Organization → Organization Details」から確認できます。
* [新しいキーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。
  :::

## Private Service Connect 用の GCP サービス アタッチメントと DNS 名を取得する {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、Private Service Connect 経由で接続したいサービスを開き、**Settings** メニューを開きます。続いて **Set up private endpoint** ボタンをクリックします。**Service name**（`endpointServiceId`）と **DNS name**（`privateDnsHostname`）を控えておきます。これらは次の手順で使用します。

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### オプション 2: API {#option-2-api}

:::note
この手順を実行するには、そのリージョンに少なくとも1つのインスタンスがデプロイされている必要があります。
:::

Private Service Connect 用の GCP サービス アタッチメントと DNS 名を取得します。

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモしておいてください。次の手順で使用します。

## サービスエンドポイントの作成 {#create-service-endpoint}

:::important
このセクションでは、GCP PSC（Private Service Connect）経由で ClickHouse を設定するための、ClickHouse 固有の詳細について説明します。GCP 固有の手順は、どこを確認すべきかを示すための参考情報として記載していますが、GCP クラウドプロバイダからの通知なしに将来的に変更される可能性があります。GCP の設定は、お客様の具体的なユースケースに基づいて検討してください。

なお、必要な GCP PSC エンドポイントや DNS レコードの設定については、ClickHouse は責任を負いません。

GCP 設定作業に関連する問題については、GCP サポートに直接お問い合わせください。
:::

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続の追加 {#adding-a-private-service-connection}

まず、Private Service Connection を作成します。

#### オプション 1: Google Cloud コンソールを使用する場合 {#option-1-using-google-cloud-console}

Google Cloud コンソールで、**Network services -&gt; Private Service Connect** に移動します。

<Image img={gcp_psc_open} size="lg" alt="Google Cloud コンソールで Private Service Connect を開く" border />

**Connect Endpoint** ボタンをクリックして、Private Service Connect の作成ダイアログを開きます。

* **Target**: **Published service** を選択します。
* **Target service**: [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) の手順で取得した `endpointServiceId`<sup>API</sup> または `Service name`<sup>console</sup> を使用します。
* **Endpoint name**: PSC の **Endpoint name** として任意の名前を設定します。
* **Network/Subnetwork/IP address**: 接続に使用するネットワークを選択します。Private Service Connect エンドポイント用に新しく IP アドレスを作成するか、既存のものを使用する必要があります。この例では、事前に **your-ip-address** という名前でアドレスを作成し、IP アドレス `10.128.0.2` を割り当てています。
* エンドポイントを任意のリージョンから利用可能にするには、**Enable global access** チェックボックスを有効にします。

<Image img={gcp_psc_enable_global_access} size="md" alt="Private Service Connect で Global Access を有効化" border />

PSC エンドポイントを作成するには、**ADD ENDPOINT** ボタンをクリックします。

接続が承認されると、**Status** 列は **Pending** から **Accepted** に変わります。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="PSC Connection ID をコピー" border />

***PSC Connection ID*** をコピーします。これは次の手順で ***Endpoint ID*** として使用します。

#### オプション 2: Terraform を使用する場合 {#option-2-using-terraform}

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
`endpointServiceId`<sup>API</sup> または `Service name`<sup>console</sup> には、[Private Service Connect 用の GCP サービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) の手順で取得した値を使用します。
:::

## エンドポイントのプライベート DNS 名を設定する {#set-private-dns-name-for-endpoint}

:::note
DNS の構成方法にはさまざまなものがあります。ユースケースに応じて適切な方法で DNS を設定してください。
:::

[Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) の手順で取得した「DNS 名」を、GCP Private Service Connect エンドポイントの IP アドレスを指すように設定する必要があります。これにより、VPC／ネットワーク内のサービスやコンポーネントが正しく名前解決できるようになります。

## Endpoint ID を ClickHouse Cloud 組織に追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[ClickHouse サービス許可リストへの「Endpoint ID」の追加](#add-endpoint-id-to-services-allow-list) の手順に進んでください。ClickHouse Cloud コンソールを使用してサービス許可リストに `PSC Connection ID` を追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**Organization details -&gt; Private Endpoints** を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="ClickHouse Cloud からプライベートエンドポイントを削除する" border />

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、次の環境変数を設定します:

以下の `ENDPOINT_ID` を、[Private Service Connection の追加](#adding-a-private-service-connection) 手順で取得した **Endpoint ID** の値に置き換えてください。

エンドポイントを追加するには、次を実行します:

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

エンドポイントを削除するには、次のコマンドを実行します。

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

組織のプライベートエンドポイントを追加／削除:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## ClickHouse サービスの許可リストに「Endpoint ID」を追加する {#add-endpoint-id-to-services-allow-list}

Private Service Connect で利用可能にしたい各インスタンスについて、許可リストに Endpoint ID を追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、Private Service Connect 経由で接続したいサービスを開き、**Settings** に移動します。[Adding a Private Service Connection](#adding-a-private-service-connection) の手順で取得した `Endpoint ID` を入力し、**Create endpoint** をクリックします。

:::note
既存の Private Service Connect 接続からのアクセスを許可したい場合は、ドロップダウンメニューから既存のエンドポイントを使用してください。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints フィルター" border />

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に、次の環境変数を設定します。

以下の **ENDPOINT&#95;ID** を、[Adding a Private Service Connection](#adding-a-private-service-connection) の手順で取得した **Endpoint ID** の値に置き換えます。

Private Service Connect で利用可能にしたい各サービスについて、この操作を実行します。

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
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Private Service Connect を使用してインスタンスにアクセスする {#accessing-instance-using-private-service-connect}

Private Link を有効にした各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Link を使用して接続するには、プライベートエンドポイントを使用する必要があります。これは、[Private Service Connect 用の GCP サービスアタッチメントと DNS 名の取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) で取得した `privateDnsHostname` です。

### プライベート DNS ホスト名の取得 {#getting-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで **Settings** に移動します。**Set up private endpoint** ボタンをクリックします。開いたフライアウトで **DNS Name** をコピーします。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS Name" border />

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

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` ホスト名への接続は Private Service Connect 経由になります。一方、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` ホスト名への接続はインターネット経由になります。

## トラブルシューティング {#troubleshooting}

### DNS セットアップのテスト {#test-dns-setup}

DNS&#95;NAME - [Private Service Connect 用の GCP サービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) の手順で取得した `privateDnsHostname` を DNS&#95;NAME に指定します

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### ピアによる接続リセット {#connection-reset-by-peer}

* 最もよくある原因は、エンドポイント ID がサービスの許可リストに追加されていないことです。[*エンドポイント ID をサービスの許可リストに追加* の手順](#add-endpoint-id-to-services-allow-list)を再確認してください。

### 接続テスト {#test-connectivity}

PSC リンクを使った接続で問題が発生している場合は、`openssl` を使って接続を確認してください。Private Service Connect エンドポイントのステータスが `Accepted` であることを確認します。

OpenSSL は接続できるはずです（出力に CONNECTED が表示されます）。`errno=104` は想定される値です。

DNS&#95;NAME - [Private Service Connect 用の GCP サービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)の手順で取得した `privateDnsHostname` を使用します

```bash
openssl s_client -connect ${DNS_NAME}:9440
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

### エンドポイントフィルターの確認 {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

たとえば、ClickHouse Cloud で [MySQL](/sql-reference/table-functions/mysql) や [PostgreSQL](/sql-reference/table-functions/postgresql) のテーブル関数を使用し、GCP 上でホストされているデータベースに接続しようとしているとします。GCP PSC は、この接続をセキュアな形で確立するためには利用できません。PSC は一方向の接続です。PSC により、内部ネットワークまたは GCP VPC から ClickHouse Cloud へのセキュアな接続は可能ですが、ClickHouse Cloud から内部ネットワークへの接続は許可されません。

[GCP Private Service Connect のドキュメント](https://cloud.google.com/vpc/docs/private-service-connect)によると、次のように記載されています。

> サービス指向の設計: プロデューササービスは、コンシューマ VPC ネットワークに対して 1 つの IP アドレスを公開するロードバランサを通じて公開されます。プロデューササービスにアクセスするコンシューマトラフィックは単方向であり、ピアリングされた VPC ネットワーク全体ではなく、サービス IP アドレスにのみアクセスできます。

これを行うには、GCP VPC のファイアウォールルールを構成し、ClickHouse Cloud から社内／プライベートなデータベースサービスへの接続を許可します。[ClickHouse Cloud リージョンのデフォルトの送信 (egress) IP アドレス](/manage/data-sources/cloud-endpoints-api) と、[利用可能な静的 IP アドレス](https://api.clickhouse.cloud/static-ips.json) を確認してください。

## 詳細情報 {#more-information}

詳しくは、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services) を参照してください。
