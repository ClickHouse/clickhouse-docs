---
title: 'GCP Private Service Connect'
description: 'このドキュメントでは、Google Cloud Platform (GCP) の Private Service Connect (PSC) を使用して ClickHouse Cloud に接続する方法と、ClickHouse Cloud の IP アクセスリストを使用して GCP PSC 以外のアドレスからの ClickHouse Cloud サービスへのアクセスを無効化する方法について説明します。'
sidebar_label: 'GCP Private Service Connect'
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

<ScalePlanFeatureBadge feature='GCP PSC' />

Private Service Connect（PSC）は、Google Cloudのネットワーク機能で、コンシューマーが仮想プライベートクラウド（VPC）ネットワーク内でマネージドサービスにプライベートアクセスできるようにします。同様に、マネージドサービスプロバイダーは、独自の分離されたVPCネットワークでこれらのサービスをホストし、コンシューマーにプライベート接続を提供できます。

サービスプロバイダーは、Private Service Connectサービスを作成することで、コンシューマーにアプリケーションを公開します。サービスコンシューマーは、これらのPrivate Service Connectタイプのいずれかを通じて、Private Service Connectサービスに直接アクセスします。

<Image
  img={gcp_psc_overview}
  size='lg'
  alt='Private Service Connectの概要'
  border
/>

:::important
デフォルトでは、PSC接続が承認され確立されている場合でも、ClickHouseサービスはPrivate Service接続経由では利用できません。以下の[手順](#add-endpoint-id-to-services-allow-list)を完了して、インスタンスレベルの許可リストにPSC IDを明示的に追加する必要があります。
:::

**Private Service Connect Global Accessを使用する際の重要な考慮事項**：

1. Global Accessを利用するリージョンは、同じVPCに属している必要があります。
1. Global AccessはPSCレベルで明示的に有効化する必要があります（以下のスクリーンショットを参照）。
1. ファイアウォール設定が他のリージョンからのPSCへのアクセスをブロックしていないことを確認してください。
1. GCPのリージョン間データ転送料金が発生する可能性があることに注意してください。

リージョン間接続はサポートされていません。プロバイダーとコンシューマーのリージョンは同じである必要があります。ただし、Private Service Connect（PSC）レベルで[Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)を有効にすることで、VPC内の他のリージョンから接続できます。

**GCP PSCを有効にするには、以下を完了してください**：

1. Private Service Connect用のGCPサービスアタッチメントを取得します。
1. サービスエンドポイントを作成します。
1. ClickHouse Cloudサービスに「Endpoint ID」を追加します。
1. ClickHouseサービスの許可リストに「Endpoint ID」を追加します。


## 注意事項 {#attention}

ClickHouseは、GCPリージョン内で同じ公開済み[PSCエンドポイント](https://cloud.google.com/vpc/docs/private-service-connect)を再利用するために、サービスのグループ化を試みます。ただし、このグループ化は保証されません。特に、複数のClickHouse組織にサービスを分散している場合は保証されません。
ClickHouse組織内の他のサービスに対してPSCが既に設定されている場合、そのグループ化により、ほとんどの手順をスキップして最終ステップに直接進むことができます：[ClickHouseサービスの許可リストに「エンドポイントID」を追加する](#add-endpoint-id-to-services-allow-list)。

Terraformの例は[こちら](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)をご覧ください。


## 始める前に {#before-you-get-started}

:::note
以下のコード例では、ClickHouse CloudサービスでPrivate Service Connectを設定する方法を示しています。例では以下の値を使用します：

- GCPリージョン：`us-central1`
- GCPプロジェクト（お客様のGCPプロジェクト）：`my-gcp-project`
- お客様のGCPプロジェクトのGCPプライベートIPアドレス：`10.128.0.2`
- お客様のGCPプロジェクトのGCP VPC：`default`
  :::

ClickHouse Cloudサービスに関する情報を取得する必要があります。これはClickHouse CloudコンソールまたはClickHouse APIのいずれかで実行できます。ClickHouse APIを使用する場合は、続行する前に以下の環境変数を設定してください：

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

[新しいClickHouse Cloud APIキーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。

リージョン、プロバイダー、サービス名でフィルタリングして、ClickHouseの`INSTANCE_ID`を取得します：

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

- 組織IDはClickHouseコンソール（Organization -> Organization Details）から取得できます。
- [新しいキーを作成](/cloud/manage/openapi)するか、既存のキーを使用できます。
  :::


## Private Service Connect用のGCPサービスアタッチメントとDNS名の取得 {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console}

ClickHouse Cloudコンソールで、Private Service Connect経由で接続するサービスを開き、**Settings**メニューを開きます。**Set up private endpoint**ボタンをクリックします。**Service name**（`endpointServiceId`）と**DNS name**（`privateDnsHostname`）をメモしてください。次のステップで使用します。

<Image
  img={gcp_privatelink_pe_create}
  size='lg'
  alt='プライベートエンドポイント'
  border
/>

### オプション2: API {#option-2-api}

:::note
このステップを実行するには、対象リージョンに少なくとも1つのインスタンスがデプロイされている必要があります。
:::

Private Service Connect用のGCPサービスアタッチメントとDNS名を取得します:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId`と`privateDnsHostname`をメモしてください。次のステップで使用します。


## サービスエンドポイントの作成 {#create-service-endpoint}

:::important
このセクションでは、GCP PSC（Private Service Connect）経由でClickHouseを設定する際のClickHouse固有の詳細について説明します。GCP固有の手順は参考として提供されていますが、GCPクラウドプロバイダーからの事前通知なしに変更される可能性があります。お客様の具体的なユースケースに応じてGCPの設定を検討してください。

ClickHouseは、必要なGCP PSCエンドポイントやDNSレコードの設定について責任を負いません。

GCPの設定タスクに関する問題については、GCP Supportに直接お問い合わせください。
:::

このセクションでは、サービスエンドポイントを作成します。

### プライベートサービス接続の追加 {#adding-a-private-service-connection}

まず、Private Service Connectionを作成します。

#### オプション1：Google Cloudコンソールを使用する {#option-1-using-google-cloud-console}

Google Cloudコンソールで、**Network services -> Private Service Connect**に移動します。

<Image
  img={gcp_psc_open}
  size='lg'
  alt='Google CloudコンソールでPrivate Service Connectを開く'
  border
/>

**Connect Endpoint**ボタンをクリックして、Private Service Connect作成ダイアログを開きます。

- **Target**：**Published service**を使用します
- **Target service**：[Private Service Connect用のGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップの`endpointServiceId`<sup>API</sup>または`Service name`<sup>console</sup>を使用します。
- **Endpoint name**：PSC **Endpoint name**の名前を設定します。
- **Network/Subnetwork/IP address**：接続に使用するネットワークを選択します。Private Service Connectエンドポイント用のIPアドレスを作成するか、既存のものを使用する必要があります。この例では、**your-ip-address**という名前のアドレスを事前に作成し、IPアドレス`10.128.0.2`を割り当てています
- エンドポイントを任意のリージョンから利用可能にするには、**Enable global access**チェックボックスを有効にします。

<Image
  img={gcp_psc_enable_global_access}
  size='md'
  alt='Private Service ConnectのGlobal Accessを有効化'
  border
/>

PSCエンドポイントを作成するには、**ADD ENDPOINT**ボタンを使用します。

接続が承認されると、**Status**列が**Pending**から**Accepted**に変わります。

<Image
  img={gcp_psc_copy_connection_id}
  size='lg'
  alt='PSC Connection IDをコピー'
  border
/>

**_PSC Connection ID_**をコピーします。次のステップで**_Endpoint ID_**として使用します。

#### オプション2：Terraformを使用する {#option-2-using-terraform}

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
  description = "インスタンスレベルの許可リストにGCP PSC Connection IDを追加します。"
}
```

:::note
[Private Service Connect用のGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップの`endpointServiceId`<sup>API</sup>または`Service name`<sup>console</sup>を使用します
:::


## エンドポイントのプライベートDNS名を設定する {#set-private-dns-name-for-endpoint}

:::note
DNSの設定方法は複数あります。ユースケースに応じて適切にDNSを設定してください。
:::

[Private Service Connect用のGCPサービスアタッチメントとDNS名を取得する](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)の手順で取得した「DNS名」を、GCP Private Service ConnectエンドポイントのIPアドレスに紐付ける必要があります。これにより、VPC/ネットワーク内のサービスやコンポーネントが正しく名前解決できるようになります。


## ClickHouse Cloud組織へのエンドポイントIDの追加 {#add-endpoint-id-to-clickhouse-cloud-organization}

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-1}

組織にエンドポイントを追加するには、[ClickHouseサービスの許可リストへの「エンドポイントID」の追加](#add-endpoint-id-to-services-allow-list)の手順に進んでください。ClickHouse Cloudコンソールを使用してサービスの許可リストに`PSC Connection ID`を追加すると、自動的に組織にも追加されます。

エンドポイントを削除するには、**Organization details -> Private Endpoints**を開き、削除ボタンをクリックします。

<Image
  img={gcp_pe_remove_private_endpoint}
  size='lg'
  alt='ClickHouse Cloudからプライベートエンドポイントを削除'
  border
/>

### オプション2: API {#option-2-api-1}

コマンドを実行する前に、以下の環境変数を設定します:

以下の`ENDPOINT_ID`を、[プライベートサービス接続の追加](#adding-a-private-service-connection)手順の**Endpoint ID**の値に置き換えます

エンドポイントを追加するには、以下を実行します:

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

エンドポイントを削除するには、以下を実行します:

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

組織へのプライベートエンドポイントの追加/削除:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## ClickHouseサービスの許可リストに「エンドポイントID」を追加する {#add-endpoint-id-to-services-allow-list}

Private Service Connectを使用してアクセス可能にする各インスタンスの許可リストに、エンドポイントIDを追加する必要があります。

### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloudコンソールで、Private Service Connect経由で接続するサービスを開き、**Settings**に移動します。[Private Service Connectionの追加](#adding-a-private-service-connection)の手順で取得した`エンドポイントID`を入力します。**Create endpoint**をクリックします。

:::note
既存のPrivate Service Connect接続からのアクセスを許可する場合は、既存のエンドポイントのドロップダウンメニューを使用してください。
:::

<Image
  img={gcp_privatelink_pe_filters}
  size='lg'
  alt='プライベートエンドポイントフィルター'
  border
/>

### オプション2: API {#option-2-api-2}

コマンドを実行する前に、以下の環境変数を設定してください:

以下の**ENDPOINT_ID**を、[Private Service Connectionの追加](#adding-a-private-service-connection)の手順で取得した**エンドポイントID**の値に置き換えてください

Private Service Connectを使用してアクセス可能にする各サービスに対して実行してください。

追加する場合:

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

削除する場合:

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


## Private Service Connectを使用したインスタンスへのアクセス {#accessing-instance-using-private-service-connect}

Private Linkが有効化された各サービスには、パブリックエンドポイントとプライベートエンドポイントがあります。Private Linkを使用して接続するには、[Private Service Connect用のGCPサービスアタッチメントの取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)から取得した`privateDnsHostname`であるプライベートエンドポイントを使用する必要があります。

### プライベートDNSホスト名の取得 {#getting-private-dns-hostname}

#### オプション1: ClickHouse Cloudコンソール {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloudコンソールで、**Settings**に移動します。**Set up private endpoint**ボタンをクリックします。開いたフライアウトで、**DNS Name**をコピーします。

<Image
  img={gcp_privatelink_pe_dns}
  size='lg'
  alt='プライベートエンドポイントDNS名'
  border
/>

#### オプション2: API {#option-2-api-3}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

この例では、`xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud`ホスト名への接続はPrivate Service Connectにルーティングされます。一方、`xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`はインターネット経由でルーティングされます。


## トラブルシューティング {#troubleshooting}

### DNS設定のテスト {#test-dns-setup}

DNS_NAME - [Private Service Connect用のGCPサービスアタッチメントとDNS名の取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップの`privateDnsHostname`を使用してください

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### 接続がピアによってリセットされました {#connection-reset-by-peer}

- エンドポイントIDがサービスの許可リストに追加されていない可能性が高いです。[_エンドポイントIDをサービスの許可リストに追加する_ステップ](#add-endpoint-id-to-services-allow-list)を再確認してください。

### 接続性のテスト {#test-connectivity}

PSCリンクを使用した接続に問題がある場合は、`openssl`を使用して接続性を確認してください。Private Service Connectエンドポイントのステータスが`Accepted`であることを確認してください:

OpenSSLは接続できるはずです(出力に「CONNECTED」と表示されます)。`errno=104`は想定される動作です。

DNS_NAME - [Private Service Connect用のGCPサービスアタッチメントとDNS名の取得](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)ステップの`privateDnsHostname`を使用してください

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

ClickHouse Cloudで[MySQL](/sql-reference/table-functions/mysql)または[PostgreSQL](/sql-reference/table-functions/postgresql)テーブル関数を使用して、GCPでホストされているデータベースに接続しようとしているとします。GCP PSCはこの接続を安全に確立するために使用することはできません。PSCは一方向の単方向接続です。内部ネットワークまたはGCP VPCからClickHouse Cloudへの安全な接続は可能ですが、ClickHouse Cloudから内部ネットワークへの接続は許可されません。

[GCP Private Service Connectのドキュメント](https://cloud.google.com/vpc/docs/private-service-connect)によると:

> サービス指向設計: プロデューサーサービスは、コンシューマーVPCネットワークに単一のIPアドレスを公開するロードバランサーを通じて公開されます。プロデューサーサービスにアクセスするコンシューマートラフィックは単方向であり、ピアリングされたVPCネットワーク全体へのアクセスではなく、サービスIPアドレスにのみアクセスできます。

これを実現するには、GCP VPCファイアウォールルールを設定して、ClickHouse Cloudから内部/プライベートデータベースサービスへの接続を許可します。[ClickHouse CloudリージョンのデフォルトエグレスIPアドレス](/manage/data-sources/cloud-endpoints-api)および[利用可能な静的IPアドレス](https://api.clickhouse.cloud/static-ips.json)を確認してください。


## 詳細情報 {#more-information}

詳細については、[cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services) を参照してください。
