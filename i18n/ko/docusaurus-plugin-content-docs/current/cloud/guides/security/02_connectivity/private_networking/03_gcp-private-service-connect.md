---
'title': 'GCP 개인 서비스 연결'
'description': '이 문서는 Google Cloud Platform (GCP) Private Service Connect (PSC)를 사용하여
  ClickHouse Cloud에 연결하는 방법과 ClickHouse Cloud IP 접근 목록을 사용하여 GCP PSC 주소 이외의 주소에서 ClickHouse
  Cloud 서비스에 대한 접근을 비활성화하는 방법에 대해 설명합니다.'
'sidebar_label': 'GCP 개인 서비스 연결'
'slug': '/manage/security/gcp-private-service-connect'
'doc_type': 'guide'
'keywords':
- 'Private Service Connect'
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

Private Service Connect (PSC)는 Google Cloud 네트워킹 기능으로, 소비자가 가상 개인 클라우드(VPC) 네트워크 내에서 관리되는 서비스에 비공식적으로 접근할 수 있도록 합니다. 유사하게, 관리되는 서비스 제공자는 이러한 서비스를 자신의 독립적인 VPC 네트워크에서 호스팅하고 소비자에게 비공식 연결을 제공할 수 있습니다.

서비스 제공자는 Private Service Connect 서비스를 생성하여 소비자에게 응용 프로그램을 게시합니다. 서비스 소비자는 이러한 Private Service Connect 서비스에 다음과 같은 Private Service Connect 유형 중 하나를 통해 직접 접근합니다.

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
기본적으로 ClickHouse 서비스는 PSC 연결이 승인되고 설정되더라도 Private Service 연결을 통해 제공되지 않습니다. 아래 [단계](#add-endpoint-id-to-services-allow-list)를 완료하여 인스턴스 수준에서 PSC ID를 허용 목록에 명시적으로 추가해야 합니다.
:::

**Private Service Connect Global Access 사용 시 주의사항**:
1. Global Access를 사용하는 지역은 동일한 VPC에 속해야 합니다.
1. Global Access는 PSC 수준에서 명시적으로 활성화해야 합니다(아래 스크린샷 참조).
1. 방화벽 설정이 다른 지역에서 PSC에 대한 접근을 차단하지 않도록 해야 합니다.
1. GCP의 지역 간 데이터 전송 요금이 발생할 수 있습니다.

교차 지역 연결은 지원되지 않습니다. 프로듀서와 소비자는 동일한 지역이어야 합니다. 그러나 VPC 내의 다른 지역에서 [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)를 활성화하여 연결할 수 있습니다.

**GCP PSC를 활성화하려면 다음을 완료하십시오**:
1. Private Service Connect에 대한 GCP 서비스 첨부를 획득합니다.
1. 서비스 엔드포인트를 생성합니다.
1. ClickHouse Cloud 서비스에 "Endpoint ID"를 추가합니다.
1. ClickHouse 서비스 허용 목록에 "Endpoint ID"를 추가합니다.

## Attention {#attention}
ClickHouse는 서비스를 그룹화하여 GCP 지역 내에서 동일한 게시된 [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect)를 재사용하도록 시도합니다. 그러나 이러한 그룹화는 보장되지 않으며, 특히 여러 ClickHouse 조직에 서비스를 분산시킬 경우 더욱 그렇습니다.
ClickHouse 조직에서 다른 서비스에 대해 PSC를 이미 구성한 경우, 대부분의 단계를 건너뛰고 최종 단계인 [ClickHouse 서비스 허용 목록에 "Endpoint ID" 추가](#add-endpoint-id-to-services-allow-list)로 직접 진행할 수 있습니다.

Terraform 예제는 [여기](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 확인할 수 있습니다.

## Before you get started {#before-you-get-started}

:::note
코드 예제는 ClickHouse Cloud 서비스 내에서 Private Service Connect를 설정하는 방법을 보여줍니다. 아래의 예제에서는 다음을 사용할 것입니다:
- GCP 지역: `us-central1`
- GCP 프로젝트 (고객 GCP 프로젝트): `my-gcp-project`
- 고객 GCP 프로젝트의 GCP 프라이빗 IP 주소: `10.128.0.2`
- 고객 GCP 프로젝트의 GCP VPC: `default`
:::

ClickHouse Cloud 서비스에 대한 정보를 검색해야 합니다. ClickHouse Cloud 콘솔이나 ClickHouse API를 통해 이를 수행할 수 있습니다. ClickHouse API를 사용할 경우, 다음 환경 변수를 설정한 후 진행하십시오:

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

[새 ClickHouse Cloud API 키를 생성](/cloud/manage/openapi) 하거나 기존 키를 사용할 수 있습니다.

지역, 제공자 및 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 가져옵니다:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note
- ClickHouse 콘솔에서 조직 ID를 가져올 수 있습니다(조직 -> 조직 세부정보).
- [새 키를 생성](/cloud/manage/openapi) 하거나 기존의 키를 사용할 수 있습니다.
:::

## Obtain GCP service attachment and DNS name for Private Service Connect {#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console}

ClickHouse Cloud 콘솔에서 Private Service Connect를 통해 연결하려는 서비스를 열고 **Settings** 메뉴를 엽니다. **Set up private endpoint** 버튼을 클릭합니다. **Service name** (`endpointServiceId`) 및 **DNS name** (`privateDnsHostname`)를 기록하십시오. 다음 단계에서 사용할 것입니다.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### Option 2: API {#option-2-api}

:::note
이 단계를 수행하기 위해서는 해당 지역에 최소한 하나의 인스턴스가 배포되어 있어야 합니다.
:::

Private Service Connect에 대한 GCP 서비스 첨부 및 DNS 이름을 가져옵니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId` 및 `privateDnsHostname`를 기록하십시오. 다음 단계에서 사용할 것입니다.

## Create service endpoint {#create-service-endpoint}

:::important
이 섹션은 GCP PSC(Private Service Connect)를 통해 ClickHouse를 구성하기 위한 ClickHouse 특정 세부 정보를 다룹니다. GCP 특정 단계는 참조용으로 제공되어 어디를 보아야 하는지 안내하지만, GCP 클라우드 제공자의 공지 없이 변경될 수 있습니다. 특정 사용 사례에 따라 GCP 구성을 고려하십시오.  

ClickHouse는 필요한 GCP PSC 엔드포인트 및 DNS 레코드를 구성할 책임이 없습니다.  

GCP 구성 작업과 관련된 문제는 GCP 지원에 직접 문의하십시오.
:::

이번 섹션에서는 서비스 엔드포인트를 생성합니다.

### Adding a private service connection {#adding-a-private-service-connection}

먼저 Private Service Connection을 생성합니다.

#### Option 1: Using Google Cloud console {#option-1-using-google-cloud-console}

Google Cloud 콘솔에서 **Network services -> Private Service Connect**로 이동합니다.

<Image img={gcp_psc_open} size="lg" alt="Open Private Service Connect in Google Cloud console" border />

**Connect Endpoint** 버튼을 클릭하여 Private Service Connect 생성 대화 상자를 엽니다.

- **Target**: **Published service**를 사용합니다.
- **Target service**: [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 `endpointServiceId`<sup>API</sup> 또는 `Service name`<sup>console</sup>을 사용합니다.
- **Endpoint name**: PSC **Endpoint name**에 대한 이름을 설정합니다.
- **Network/Subnetwork/IP address**: 연결에 사용할 네트워크를 선택합니다. Private Service Connect 엔드포인트에 대한 IP 주소를 생성하거나 기존의 IP 주소를 사용해야 합니다. 본 예제에서는 이름이 **your-ip-address**인 주소를 미리 생성하고 IP 주소 `10.128.0.2`를 할당했습니다.
- 엔드포인트를 모든 지역에서 사용할 수 있도록 하려면 **Enable global access** 체크박스를 활성화합니다.

<Image img={gcp_psc_enable_global_access} size="md" alt="Enable Global Access for Private Service Connect" border />

PSC Endpoint를 생성하려면 **ADD ENDPOINT** 버튼을 사용합니다.

연결이 승인되면 **상태** 열이 **Pending**에서 **Accepted**로 변경됩니다.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="Copy PSC Connection ID" border />

***PSC Connection ID***를 복사하여 다음 단계에서 ***Endpoint ID***로 사용할 것입니다.

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
[Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 `endpointServiceId`<sup>API</sup> 또는 `Service name`<sup>console</sup>을 사용하십시오.
:::

## Set private DNS name for endpoint {#set-private-dns-name-for-endpoint}

:::note
DNS를 구성하는 방법은 여러 가지가 있습니다. 특정 사용 사례에 따라 DNS를 설정하십시오.
:::

[Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 가져온 "DNS name"을 GCP Private Service Connect 엔드포인트 IP 주소로 지정해야 합니다. 이는 VPC/네트워크 내의 서비스/구성이 이를 올바르게 해결할 수 있도록 합니다.

## Add Endpoint ID to ClickHouse Cloud organization {#add-endpoint-id-to-clickhouse-cloud-organization}

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-1}

조직에 엔드포인트를 추가하려면 [ClickHouse 서비스 허용 목록에 "Endpoint ID" 추가](#add-endpoint-id-to-services-allow-list) 단계를 진행합니다. ClickHouse Cloud 콘솔을 사용하여 `PSC Connection ID`를 서비스 허용 목록에 추가하면 자동으로 조직에 추가됩니다.

엔드포인트를 제거하려면 **Organization details -> Private Endpoints**로 이동하여 삭제 버튼을 클릭하여 엔드포인트를 제거합니다.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="Remove Private Endpoint from ClickHouse Cloud" border />

### Option 2: API {#option-2-api-1}

명령을 실행하기 전에 이러한 환경 변수를 설정하십시오:

[Adding a Private Service Connection](#adding-a-private-service-connection) 단계에서 **Endpoint ID**의 값으로 아래의 `ENDPOINT_ID`를 대체합니다.

엔드포인트를 추가하려면 다음을 실행하십시오:

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

엔드포인트를 제거하려면 다음을 실행하십시오:

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

조직에 Private Endpoint를 추가/제거합니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## Add "Endpoint ID" to ClickHouse service allow list {#add-endpoint-id-to-services-allow-list}

Private Service Connect를 통해 접근 가능해야 하는 각 인스턴스의 허용 목록에 Endpoint ID를 추가해야 합니다.

### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud 콘솔에서 Private Service Connect를 통해 연결하려는 서비스를 열고 **Settings**로 이동합니다. [Adding a Private Service Connection](#adding-a-private-service-connection) 단계에서 가져온 `Endpoint ID`를 입력합니다. **Create endpoint**를 클릭합니다.

:::note
기존 Private Service Connect 연결에서의 접근을 허용하려면 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### Option 2: API {#option-2-api-2}

명령을 실행하기 전에 이러한 환경 변수를 설정하십시오:

[Adding a Private Service Connection](#adding-a-private-service-connection) 단계에서 **Endpoint ID**의 값으로 **ENDPOINT_ID**를 대체합니다.

Private Service Connect를 통해 접근 가능해야 하는 각 서비스에 대해 다음을 실행하십시오.

추가하려면:

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

제거하려면:

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

Private Link가 활성화된 각 서비스에는 공용 및 개인 엔드포인트가 있습니다. Private Link를 사용하여 연결하려면 [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)에서 가져온 `privateDnsHostname`인 개인 엔드포인트를 사용해야 합니다.

### Getting private DNS hostname {#getting-private-dns-hostname}

#### Option 1: ClickHouse Cloud console {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud 콘솔에서 **Settings**로 이동합니다. **Set up private endpoint** 버튼을 클릭합니다. 열린 플라이아웃에서 **DNS Name**을 복사합니다.

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

이 예에서는 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 호스트에 대한 연결이 Private Service Connect로 라우팅됩니다. 반면에, `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`는 인터넷을 통해 라우팅됩니다.

## Troubleshooting {#troubleshooting}

### Test DNS setup {#test-dns-setup}

DNS_NAME - [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 `privateDnsHostname`를 사용하십시오.

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```

### Connection reset by peer {#connection-reset-by-peer}

- 가장 가능성 높은 원인은 Endpoint ID가 서비스 허용 목록에 추가되지 않았기 때문입니다. [_Add endpoint ID to services allow-list_ 단계](#add-endpoint-id-to-services-allow-list)를 다시 방문하십시오.

### Test connectivity {#test-connectivity}

PSC 링크를 사용하여 연결하는 데 문제가 있는 경우, `openssl`을 사용하여 연결성을 확인하십시오. Private Service Connect 엔드포인트 상태가 `Accepted`인지 확인합니다:

OpenSSL은 연결할 수 있어야 하며(출력에서 CONNECTED를 확인) `errno=104`는 예상됩니다.

DNS_NAME - [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 `privateDnsHostname`를 사용하십시오.

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

### Checking endpoint filters {#checking-endpoint-filters}

#### REST API {#rest-api}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```

### Connecting to a remote database {#connecting-to-a-remote-database}

ClickHouse Cloud에서 [MySQL](/sql-reference/table-functions/mysql) 또는 [PostgreSQL](/sql-reference/table-functions/postgresql) 테이블 함수를 사용하여 GCP에 호스팅된 데이터베이스에 연결하려고 한다고 가정해보겠습니다. GCP PSC는 이 연결을 안전하게 활성화하는 데 사용할 수 없습니다. PSC는 단방향 연결만 가능합니다. 내부 네트워크 또는 GCP VPC가 ClickHouse Cloud에 안전하게 연결되도록 허용하지만, ClickHouse Cloud가 내부 네트워크에 연결되는 것은 허용하지 않습니다.

[GCP Private Service Connect 문서](https://cloud.google.com/vpc/docs/private-service-connect)에 따르면:

> 서비스 지향 설계: 프로듀서 서비스는 소비자 VPC 네트워크에 단일 IP 주소를 노출하는 로드 밸런서를 통해 게시됩니다. 프로듀서 서비스에 접근하는 소비자 트래픽은 단방향이며, 전체 피어링된 VPC 네트워크에 접근하는 대신 서비스 IP 주소에만 접근할 수 있습니다.

이렇게 하려면 ClickHouse Cloud에서 내부/개인 데이터베이스 서비스로 연결을 허용하도록 GCP VPC 방화벽 규칙을 구성하십시오. [ClickHouse Cloud 지역에 대한 기본 출구 IP 주소](/manage/data-sources/cloud-endpoints-api)와 [사용 가능한 정적 IP 주소](https://api.clickhouse.cloud/static-ips.json)를 확인하십시오.

## More information {#more-information}

자세한 정보는 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services) 를 방문하십시오.
