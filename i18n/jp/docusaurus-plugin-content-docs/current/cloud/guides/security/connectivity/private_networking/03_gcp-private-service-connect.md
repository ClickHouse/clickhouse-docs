---
'title': 'GCP Private Service Connect'
'description': 'この文書では、Google Cloud Platform (GCP) Private Service Connect (PSC) を使用して
  ClickHouse Cloud に接続する方法と、ClickHouse Cloud IP アクセスリストを使用して GCP PSC アドレス以外のアドレスから
  ClickHouse Cloud サービスへのアクセスを無効にする方法について説明します。'
'sidebar_label': 'GCP Private Service Connect'
'slug': '/manage/security/gcp-private-service-connect'
'doc_type': 'guide'
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

Private Service Connect (PSC) は、ユーザーが仮想プライベートクラウド (VPC) ネットワーク内で管理されたサービスにプライベートにアクセスできるようにする Google Cloud のネットワーク機能です。同様に、管理されたサービスプロデューサは独自の別々の VPC ネットワーク内でこれらのサービスをホストし、消費者にプライベート接続を提供します。

サービスプロデューサは、Private Service Connect サービスを作成することでアプリケーションを消費者に公開します。サービス消費者は、これらの Private Service Connect タイプのいずれかを介して直接そのサービスにアクセスします。

<Image img={gcp_psc_overview} size="lg" alt="Private Service Connect の概要" border />

:::important
デフォルトでは、PSC 接続が承認されて確立されていても、ClickHouse サービスは Private Service 接続を介しては利用できません。以下の [ステップ](#add-endpoint-id-to-services-allow-list) に従って、インスタンスレベルで PSC ID を許可リストに明示的に追加する必要があります。
:::

**Private Service Connect グローバルアクセスを使用する際の重要な考慮事項**:
1. グローバルアクセスを使用するリージョンは、同じ VPC に属している必要があります。
1. グローバルアクセスは PSC レベルで明示的に有効にする必要があります（以下のスクリーンショットを参照）。
1. ファイアウォールの設定が他のリージョンから PSC へのアクセスをブロックしていないことを確認してください。
1. GCP のインターリージョンデータ転送料金が発生する可能性があることに注意してください。

リージョン間の接続はサポートされていません。プロデューサーと消費者のリージョンは同じである必要があります。ただし、VPC 内の他のリージョンから [グローバルアクセス](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access) を Private Service Connect (PSC) レベルで有効にすることで接続できます。

**GCP PSC を有効にするために以下を完了してください**:
1. Private Service Connect 用の GCP サービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. "エンドポイント ID" を ClickHouse Cloud サービスに追加します。
1. "エンドポイント ID" を ClickHouse サービスの許可リストに追加します。

## 注意 {#attention}
ClickHouse は、同じ GCP リージョン内で同じ公開された [PSC エンドポイント](https://cloud.google.com/vpc/docs/private-service-connect) を再利用するためにサービスをグループ化しようとします。ただし、特にサービスを複数の ClickHouse 組織に分散させた場合、このグループ化は保証されません。
ClickHouse 組織内で他のサービスのために PSC がすでに構成されている場合、そのグループ化のためにほとんどのステップをスキップして、最終ステップ [ClickHouse サービスの許可リストに "エンドポイント ID" を追加](#add-endpoint-id-to-services-allow-list) に直接進むことができます。

Terraform の例を [こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/) にてご覧ください。

## 始める前に {#before-you-get-started}

:::note
コード例は、ClickHouse Cloud サービス内で Private Service Connect を設定する方法を示すために提供されています。以下の例では、以下を使用します：
- GCP リージョン: `us-central1`
- GCP プロジェクト（顧客 GCP プロジェクト）: `my-gcp-project`
- 顧客 GCP プロジェクト内の GCP プライベート IP アドレス: `10.128.0.2`
- 顧客 GCP プロジェクトの GCP VPC: `default`
:::

ClickHouse Cloud サービスの情報を取得する必要があります。これは ClickHouse Cloud コンソールまたは ClickHouse API を介して行うことができます。ClickHouse API を使用する場合は、次に進む前に以下の環境変数を設定してください：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

新しいキーの ClickHouse Cloud API キーを [作成]( /cloud/manage/openapi)するか、既存のものを使用できます。

地域、プロバイダ、およびサービス名でフィルタリングして ClickHouse の `INSTANCE_ID` を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
- ClickHouse コンソール (組織 -> 組織の詳細) から Organization ID を取得できます。
- 新しいキーを [作成]( /cloud/manage/openapi)するか、既存のものを使用できます。
:::

## GCP サービスアタッチメントと Private Service Connect の DNS 名を取得する {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloud コンソールで、Private Service Connect 経由で接続したいサービスを開き、**設定**メニューを開きます。「**プライベートエンドポイントを設定**」ボタンをクリックします。**サービス名** (`endpointServiceId`) と **DNS 名** (`privateDnsHostname`) をメモしておきます。次のステップで使用します。

<Image img={gcp_privatelink_pe_create} size="lg" alt="プライベートエンドポイント" border />

### オプション 2: API {#option-2-api}

:::note
このステップを実行するには、リージョンにインスタンスを少なくとも 1 つデプロイしている必要があります。
:::

GCP サービスアタッチメントと Private Service Connect の DNS 名を取得します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId` と `privateDnsHostname` をメモしておきます。次のステップで使用します。

## サービスエンドポイントを作成 {#create-service-endpoint}

:::important
このセクションでは、GCP PSC (Private Service Connect) を介して ClickHouse を構成するための ClickHouse 特有の詳細を網羅します。GCP 特有のステップは、どこを確認するべきかを案内するための参考として提供されていますが、GCP クラウドプロバイダーから通知なしに変更される可能性があります。特定のユースケースに基づいて GCP 構成を考慮してください。

ClickHouse は、必要な GCP PSC エンドポイントや DNS レコードの構成には責任を負わないことに注意してください。

GCP 構成タスクに関する問題については、GCP サポートに直接お問い合わせください。
:::

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続を追加 {#adding-a-private-service-connection}

まずは、プライベートサービス接続を作成します。

#### オプション 1: Google Cloud コンソールを使用する {#option-1-using-google-cloud-console}

Google Cloud コンソールで、**ネットワークサービス -> プライベートサービス接続**に移動します。

<Image img={gcp_psc_open} size="lg" alt="Google Cloud コンソールでプライベートサービス接続をオープン" border />

「**接続エンドポイント**」ボタンをクリックしてプライベートサービス接続作成ダイアログを開きます。

- **ターゲット**: **公開サービス**を使用
- **ターゲットサービス**: [GCP サービスアタッチメントの取得のステップ](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)から `endpointServiceId`<sup>API</sup> または `サービス名`<sup>コンソール</sup> を使用
- **エンドポイント名**: PSC **エンドポイント名**のための名前を設定します。
- **ネットワーク/サブネットワーク/IP アドレス**: 接続に使用するネットワークを選択します。プライベートサービス接続エンドポイントのために IP アドレスを作成するか、既存のものを使用する必要があります。この例では、「**your-ip-address**」という名前のアドレスを事前に作成し、IP アドレス `10.128.0.2` を割り当てました。
- エンドポイントを任意のリージョンから利用できるようにするには、**グローバルアクセスを有効にする**チェックボックスを有効にします。

<Image img={gcp_psc_enable_global_access} size="md" alt="プライベートサービス接続のためのグローバルアクセスを有効にする" border />

PSC エンドポイントを作成するには、**エンドポイントを追加**ボタンを使用します。

接続が承認されると、**ステータス**列は **保留中** から **受け入れられました** に変わります。

<Image img={gcp_psc_copy_connection_id} size="lg" alt="PSC 接続 ID をコピー" border />

***PSC 接続 ID*** をコピーします。次のステップで ***エンドポイント ID*** として使用します。

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
  # service attachment
  target = "https://www.googleapis.com/compute/v1/$TARGET" # See below in notes
}

output "psc_connection_id" {
  value       = google_compute_forwarding_rule.clickhouse_cloud_psc.psc_connection_id
  description = "Add GCP PSC Connection ID to allow list on instance level."
}
```

:::note
[Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップから `endpointServiceId`<sup>API</sup> または `サービス名`<sup>コンソール</sup> を使用してください。
:::

## エンドポイントのプライベート DNS 名を設定する {#set-private-dns-name-for-endpoint}

:::note
DNS を構成する方法はいくつかあります。特定のユースケースに基づいて DNS を設定してください。
:::

"DNS 名" を [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップから取得し、GCP プライベートサービス接続エンドポイント IP アドレスを指すようにします。これにより、VPC/ネットワーク内のサービス/コンポーネントがそれを正しく解決できるようになります。

## ClickHouse Cloud 組織にエンドポイント ID を追加する {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[ClickHouse サービス許可リストに "エンドポイント ID" を追加](#add-endpoint-id-to-services-allow-list) ステップに進んでください。ClickHouse Cloud コンソールを使用して `PSC 接続 ID` をサービス許可リストに追加すると、自動的に組織に追加されます。

エンドポイントを削除するには、**組織の詳細 -> プライベートエンドポイント**を開き、削除ボタンをクリックしてエンドポイントを削除します。

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="ClickHouse Cloud からプライベートエンドポイントを削除" border />

### オプション 2: API {#option-2-api-1}

コマンドを実行する前に、これらの環境変数を設定します。

以下の `ENDPOINT_ID` を [Adding a Private Service Connection](#adding-a-private-service-connection) ステップからの **エンドポイント ID** の値に置き換えます。

エンドポイントを追加するには、次を実行します：

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

組織にプライベートエンドポイントを追加/削除します：

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## ClickHouse サービスの許可リストに "エンドポイント ID" を追加 {#add-endpoint-id-to-services-allow-list}

Private Service Connect を使用して利用可能な各インスタンスに、エンドポイント ID を許可リストに追加する必要があります。

### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud コンソールで、Private Service Connect 経由で接続したいサービスを開き、**設定**にアクセスします。[Adding a Private Service Connection](#adding-a-private-service-connection) ステップから取得した `エンドポイント ID` を入力します。**エンドポイントを作成**をクリックします。

:::note
既存の Private Service Connect 接続からのアクセスを許可したい場合は、既存のエンドポイントドロップダウンメニューを使用してください。
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="プライベートエンドポイントフィルター" border />

### オプション 2: API {#option-2-api-2}

コマンドを実行する前に、これらの環境変数を設定します。

以下の **ENDPOINT_ID** を [Adding a Private Service Connection](#adding-a-private-service-connection) ステップからの **エンドポイント ID** の値に置き換えます。

Private Service Connect を使用して利用可能な各サービスについて実行します。

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

## Private Service Connect を使用してインスタンスにアクセスする {#accessing-instance-using-private-service-connect}

Private Link が有効な各サービスには、パブリックおよびプライベートエンドポイントがあります。Private Link を使用して接続するには、[Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) から取得した `privateDnsHostname` を使用する必要があります。

### プライベート DNS ホスト名を取得する {#getting-private-dns-hostname}

#### オプション 1: ClickHouse Cloud コンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud コンソールで、**設定**に移動します。「**プライベートエンドポイントを設定**」ボタンをクリックします。開いたフライアウトで、**DNS 名**をコピーします。

<Image img={gcp_privatelink_pe_dns} size="lg" alt="プライベートエンドポイントの DNS 名" border />

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

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` ホスト名への接続はプライベートサービス接続にルーティングされます。一方、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud` はインターネットを経由してルーティングされます。

## トラブルシューティング {#troubleshooting}

### DNS 設定をテストする {#test-dns-setup}

DNS_NAME - [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### ピアによって接続がリセットされました {#connection-reset-by-peer}

- おそらく、エンドポイント ID がサービスの許可リストに追加されていないためです。再度 [_サービスの許可リストにエンドポイント ID を追加_ ステップ](#add-endpoint-id-to-services-allow-list)を確認してください。

### 接続性をテストする {#test-connectivity}

PSC リンクを使用して接続するのに問題がある場合は、`openssl` を使用して接続性を確認してください。プライベートサービス接続エンドポイントのステータスが `受け入れられました` であることを確認します：

OpenSSL は接続できるはずです（出力に CONNECTED と表示されます）。`errno=104` は予期されるものです。

DNS_NAME - [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) ステップの `privateDnsHostname` を使用

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

### エンドポイントフィルターを確認する {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### リモートデータベースへの接続 {#connecting-to-a-remote-database}

たとえば、ClickHouse Cloud で [MySQL](/sql-reference/table-functions/mysql) または [PostgreSQL](/sql-reference/table-functions/postgresql) テーブル関数を使用して、GCP にホストされたデータベースに接続しようとしているとしましょう。GCP PSC は、この接続を安全に有効にするために使用することはできません。PSC は、単方向の接続です。内部ネットワークまたは GCP VPC から ClickHouse Cloud に安全に接続できますが、ClickHouse Cloud から内部ネットワークに接続することはできません。

[GCP Private Service Connect ドキュメント](https://cloud.google.com/vpc/docs/private-service-connect) によると：

> サービス指向設計: プロデューサーサービスは、消費者 VPC ネットワークに対して単一の IP アドレスを公開するロードバランサーを通じて公開されます。プロデューサーサービスにアクセスする消費者トラフィックは一方向であり、全体を介した VPC ネットワークにアクセスするのではなく、サービス IP アドレスにのみアクセスできます。

これを行うには、GCP VPC のファイアウォールルールを構成して、ClickHouse Cloud から内部/プライベートデータベースサービスへの接続を許可します。[ClickHouse Cloud リージョンのデフォルトの送信元 IP アドレス](/manage/security/cloud-endpoints-api) と、[利用可能な静的 IP アドレス](https://api.clickhouse.cloud/static-ips.json) を確認してください。

## さらなる情報 {#more-information}

詳細については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services)を訪れてください。
