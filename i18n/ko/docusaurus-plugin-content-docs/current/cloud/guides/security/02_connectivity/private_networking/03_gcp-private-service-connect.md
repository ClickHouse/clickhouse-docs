---
title: 'GCP Private Service Connect'
description: '이 문서는 Google Cloud Platform(GCP) Private Service Connect(PSC)를 사용하여 ClickHouse Cloud에 연결하는 방법 및 ClickHouse Cloud IP 액세스 목록을 사용하여 GCP PSC 주소가 아닌 다른 주소에서 ClickHouse Cloud 서비스에 대한 액세스를 비활성화하는 방법을 설명합니다.'
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


# Private Service Connect \{#private-service-connect\}

<ScalePlanFeatureBadge feature="GCP PSC"/>

Private Service Connect (PSC)는 소비자가 자신의 virtual private cloud (VPC) 네트워크 내에서 관리형 서비스에 프라이빗하게 액세스할 수 있게 하는 Google Cloud 네트워킹 기능입니다. 마찬가지로, 관리형 서비스 제공자는 이러한 서비스를 별도의 VPC 네트워크에 호스팅하고 소비자에게 프라이빗 연결을 제공할 수 있습니다.

서비스 제공자는 Private Service Connect 서비스를 생성하여 애플리케이션을 소비자에게 제공합니다. 서비스 소비자는 아래에 나열된 Private Service Connect 유형 중 하나를 통해 이러한 Private Service Connect 서비스에 직접 액세스합니다.

<Image img={gcp_psc_overview} size="lg" alt="Overview of Private Service Connect" border />

:::important
기본적으로 PSC 연결이 승인되고 설정되어 있는 경우에도 ClickHouse 서비스는 Private Service Connect 연결을 통해 사용할 수 없습니다. 아래 [단계](#add-endpoint-id-to-services-allow-list)를 완료하여 인스턴스 단위에서 허용 목록에 PSC ID를 명시적으로 추가해야 합니다.
:::

**Private Service Connect Global Access 사용 시 중요한 고려 사항**:

1. Global Access를 사용하는 리전은 모두 동일한 VPC에 속해야 합니다.
1. Global Access는 PSC 수준에서 명시적으로 활성화해야 합니다(아래 스크린샷 참조).
1. 방화벽 설정으로 인해 다른 리전에서 PSC로의 액세스가 차단되지 않도록 해야 합니다.
1. GCP 리전 간 데이터 전송 비용이 발생할 수 있음에 유의해야 합니다.

리전 간 연결은 지원되지 않습니다. 제공자 리전과 소비자 리전은 동일해야 합니다. 그러나 Private Service Connect (PSC) 수준에서 [Global Access](https://cloud.google.com/vpc/docs/about-accessing-vpc-hosted-services-endpoints#global-access)를 활성화하면 동일한 VPC 내의 다른 리전에서 연결할 수 있습니다.

**GCP PSC를 활성화하려면 다음 작업을 완료하십시오**:

1. Private Service Connect용 GCP service attachment를 가져옵니다.
1. service endpoint를 생성합니다.
1. ClickHouse Cloud 서비스에 "Endpoint ID"를 추가합니다.
1. ClickHouse 서비스 허용 목록에 "Endpoint ID"를 추가합니다.

## 주의 \{#attention\}

ClickHouse는 동일한 GCP 리전 내에서 게시된 동일한 [PSC endpoint](https://cloud.google.com/vpc/docs/private-service-connect)를 재사용할 수 있도록 서비스를 그룹화하려고 시도합니다. 그러나 이 그룹화가 항상 보장되는 것은 아니며, 특히 여러 ClickHouse 조직에 서비스를 분산해 두었다면 적용되지 않을 수 있습니다.
이미 해당 ClickHouse 조직에서 다른 서비스에 대해 PSC를 구성해 둔 상태라면, 이러한 그룹화 덕분에 대부분의 단계를 생략하고 마지막 단계인 [ClickHouse 서비스 허용 목록에 "Endpoint ID" 추가](#add-endpoint-id-to-services-allow-list)로 바로 진행해도 됩니다.

Terraform 예제는 [여기](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 확인할 수 있습니다.

## 시작하기 전에 \{#before-you-get-started\}

:::note
아래 코드 예제에서는 ClickHouse Cloud 서비스 내에서 Private Service Connect를 설정하는 방법을 보여줍니다. 예제에서는 다음 값을 사용합니다:

* GCP 리전: `us-central1`
* GCP 프로젝트(고객 GCP 프로젝트): `my-gcp-project`
* 고객 GCP 프로젝트의 GCP 프라이빗 IP 주소: `10.128.0.2`
* 고객 GCP 프로젝트의 GCP VPC: `default`
  :::

ClickHouse Cloud 서비스에 대한 정보를 확인해야 합니다. 이는 ClickHouse Cloud 콘솔 또는 ClickHouse API를 통해 할 수 있습니다. ClickHouse API를 사용할 예정이라면, 진행하기 전에 다음 환경 변수를 설정하십시오:

```shell
REGION=<Your region code using the GCP format, for example: us-central1>
PROVIDER=gcp
KEY_ID=<Your ClickHouse key ID>
KEY_SECRET=<Your ClickHouse key secret>
ORG_ID=<Your ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

새로운 ClickHouse Cloud API 키를 [생성](/cloud/manage/openapi)하거나 기존 키를 사용할 수 있습니다.

리전, 공급자, 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 확인합니다:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

:::note

* Organization ID는 ClickHouse 콘솔의 Organization -&gt; Organization Details에서 확인할 수 있습니다.
* [새 키를 생성](/cloud/manage/openapi)하거나 기존 키를 사용할 수 있습니다.
  :::


## Private Service Connect용 GCP Service Attachment와 DNS 이름 확인하기 \{#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console\}

ClickHouse Cloud 콘솔에서 Private Service Connect로 연결하려는 서비스를 연 후 **Settings** 메뉴를 엽니다. **Set up private endpoint** 버튼을 클릭합니다. **Service name**(`endpointServiceId`)과 **DNS name**(`privateDnsHostname`)을 메모해 둡니다. 다음 단계에서 이 값을 사용하게 됩니다.

<Image img={gcp_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

### 옵션 2: API \{#option-2-api\}

:::note
이 단계를 수행하려면 해당 리전에 최소 1개의 인스턴스가 배포되어 있어야 합니다.
:::

Private Service Connect용 GCP service attachment와 DNS 이름을 확인합니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "projects/.../regions/us-central1/serviceAttachments/production-us-central1-clickhouse-cloud",
  "privateDnsHostname": "xxxxxxxxxx.us-central1.p.gcp.clickhouse.cloud"
}
```

`endpointServiceId`와 `privateDnsHostname`를 기록해 두십시오. 이후 단계에서 사용합니다.


## 서비스 엔드포인트 생성 \{#create-service-endpoint\}

:::important
이 섹션에서는 GCP PSC(Private Service Connect)를 통해 ClickHouse를 구성하기 위한 ClickHouse에 특화된 설정 세부사항을 다룹니다. GCP 관련 단계는 어디를 참고해야 하는지 안내하기 위한 참고용으로 제공되며, GCP 클라우드 제공자의 별도 공지 없이 시간이 지나면서 변경될 수 있습니다. GCP 구성은 구체적인 사용 사례에 따라 적절히 결정해야 합니다.  

또한 ClickHouse는 필요한 GCP PSC 엔드포인트 및 DNS 레코드 구성에 대해 책임을 지지 않습니다.  

GCP 구성 작업과 관련된 모든 문제는 GCP Support에 직접 문의하시기 바랍니다.
:::

이 섹션에서는 서비스 엔드포인트를 생성합니다.

### 프라이빗 서비스 연결 추가 \{#adding-a-private-service-connection\}

먼저 프라이빗 서비스 연결을 생성합니다.

#### 옵션 1: Google Cloud console 사용 \{#option-1-using-google-cloud-console\}

Google Cloud console에서 **Network services -> Private Service Connect**로 이동합니다.

<Image img={gcp_psc_open} size="lg" alt="Google Cloud console에서 Private Service Connect 열기" border />

**Connect Endpoint** 버튼을 클릭하여 Private Service Connect 생성 대화 상자를 엽니다.

- **Target**: **Published service**로 설정합니다.
- **Target service**: [Obtain GCP service attachment for Private Service Connect](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 얻은 `endpointServiceId`<sup>API</sup> 또는 `Service name`<sup>console</sup>을 사용합니다.
- **Endpoint name**: PSC **Endpoint name**으로 사용할 이름을 설정합니다.
- **Network/Subnetwork/IP address**: 연결에 사용할 네트워크를 선택합니다. Private Service Connect endpoint에 사용할 IP 주소를 새로 생성하거나 기존 IP 주소를 사용해야 합니다. 이 예시에서는 **your-ip-address**라는 이름으로 주소를 미리 생성하고 IP 주소 `10.128.0.2`를 할당했습니다.
- 엔드포인트를 모든 리전에서 사용 가능하게 하려면 **Enable global access** 체크박스를 활성화합니다.

<Image img={gcp_psc_enable_global_access} size="md" alt="Private Service Connect에 대해 Global Access 활성화" border />

PSC Endpoint를 생성하려면 **ADD ENDPOINT** 버튼을 클릭합니다.

연결이 승인되면 **Status** 컬럼이 **Pending**에서 **Accepted**로 변경됩니다.

<Image img={gcp_psc_copy_connection_id} size="lg" alt="PSC Connection ID 복사" border />

***PSC Connection ID***를 복사합니다. 다음 단계에서 ***Endpoint ID***로 사용합니다.

#### 옵션 2: Terraform 사용 \{#option-2-using-terraform\}

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
[Private Service Connect에 대한 GCP 서비스 어태치먼트 가져오기](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 얻은 `endpointServiceId`<sup>API</sup> 또는 `Service name`<sup>console</sup> 값을 사용합니다.
:::


## 엔드포인트를 위한 프라이빗 DNS 이름 설정 \{#set-private-dns-name-for-endpoint\}

:::note
DNS를 구성하는 방법은 여러 가지가 있습니다. 구체적인 사용 사례에 맞게 DNS를 설정하십시오.
:::

[Private Service Connect용 GCP 서비스 어태치먼트 가져오기](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 얻은 「DNS name」을 GCP Private Service Connect 엔드포인트 IP 주소를 가리키도록 설정해야 합니다. 이렇게 하면 VPC/네트워크 내의 서비스와 구성 요소가 해당 이름을 올바르게 조회할 수 있습니다.

## Endpoint ID를 ClickHouse Cloud 조직에 추가 \{#add-endpoint-id-to-clickhouse-cloud-organization\}

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-1\}

조직에 엔드포인트를 추가하려면 [ClickHouse 서비스 허용 목록에 "Endpoint ID" 추가](#add-endpoint-id-to-services-allow-list) 단계로 이동합니다. ClickHouse Cloud 콘솔을 사용해 서비스 허용 목록에 `PSC Connection ID`를 추가하면 조직에 자동으로 추가됩니다.

엔드포인트를 제거하려면 **Organization details -> Private Endpoints**를 열고 삭제 버튼을 클릭해 엔드포인트를 제거합니다.

<Image img={gcp_pe_remove_private_endpoint} size="lg" alt="ClickHouse Cloud에서 Private Endpoint 제거" border />

### 옵션 2: API \{#option-2-api-1\}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

아래 `ENDPOINT_ID`를 [Adding a Private Service Connection](#adding-a-private-service-connection) 단계의 **Endpoint ID** 값으로 바꾸십시오.

엔드포인트를 추가하려면 다음 명령을 실행하십시오:

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

엔드포인트를 제거하려면 다음을 실행하십시오.

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

조직에 Private Endpoint 추가/제거:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## ClickHouse 서비스 허용 목록에 「Endpoint ID」 추가 \{#add-endpoint-id-to-services-allow-list\}

Private Service Connect를 통해 사용 가능하도록 할 각 인스턴스의 허용 목록에 Endpoint ID를 추가해야 합니다.

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-2\}

ClickHouse Cloud 콘솔에서 Private Service Connect로 연결하려는 서비스를 연 다음 **Settings**로 이동합니다. [Adding a Private Service Connection](#adding-a-private-service-connection) 단계에서 확인한 `Endpoint ID`를 입력합니다. **Create endpoint**를 클릭합니다.

:::note
기존 Private Service Connect 연결을 통해 액세스를 허용하려면 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={gcp_privatelink_pe_filters} size="lg" alt="Private Endpoints Filter" border />

### 옵션 2: API \{#option-2-api-2\}

명령을 실행하기 전에 다음 환경 변수를 설정합니다:

아래의 **ENDPOINT&#95;ID**를 [Private Service Connection 추가](#adding-a-private-service-connection) 단계에서 확인한 **Endpoint ID** 값으로 교체합니다.

Private Service Connect를 통해 사용할 수 있도록 해야 하는 각 서비스마다 이 작업을 실행합니다.

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

제거하려면 다음을 수행하십시오:

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


## Private Service Connect를 사용하여 인스턴스에 액세스하기 \{#accessing-instance-using-private-service-connect\}

Private Link이 활성화된 각 서비스에는 퍼블릭 엔드포인트와 프라이빗 엔드포인트가 있습니다. Private Link를 사용해 연결하려면 [Private Service Connect용 GCP 서비스 어태치먼트 및 DNS 이름 가져오기](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect)에서 확인한 `privateDnsHostname`을 사용하는 프라이빗 엔드포인트를 사용해야 합니다.

### 프라이빗 DNS 호스트 이름 확인하기 \{#getting-private-dns-hostname\}

#### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-3\}

ClickHouse Cloud 콘솔에서 **Settings**로 이동합니다. **Set up private endpoint** 버튼을 클릭합니다. 표시되는 플라이아웃 패널에서 **DNS Name**을 복사합니다.

<Image img={gcp_privatelink_pe_dns} size="lg" alt="프라이빗 엔드포인트 DNS 이름" border />

#### 옵션 2: API \{#option-2-api-3\}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.p.gcp.clickhouse.cloud"
}
```

이 예에서는 `xxxxxxx.yy-xxxxN.p.gcp.clickhouse.cloud` 호스트 이름으로의 연결은 Private Service Connect로 라우팅됩니다. 반면 `xxxxxxx.yy-xxxxN.gcp.clickhouse.cloud`는 인터넷을 통해 라우팅됩니다.


## 문제 해결 \{#troubleshooting\}

### DNS 설정 테스트 \{#test-dns-setup\}

DNS&#95;NAME - [Private Service Connect용 GCP 서비스 어태치먼트 및 DNS 이름 가져오기](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 얻은 `privateDnsHostname` 값을 사용합니다

```bash
nslookup $DNS_NAME
```

```response
Non-authoritative answer:
...
Address: 10.128.0.2
```


### 피어에 의해 연결이 재설정됨 \{#connection-reset-by-peer\}

- 가장 가능성이 높은 원인은 Endpoint ID가 서비스 허용 목록에 추가되지 않았기 때문입니다. [_Endpoint ID를 서비스 허용 목록에 추가_ 단계](#add-endpoint-id-to-services-allow-list)를 다시 수행하십시오.

### 연결 테스트 \{#test-connectivity\}

PSC 링크를 사용한 연결에 문제가 있는 경우 `openssl`을 사용해 연결 상태를 점검하십시오. Private Service Connect endpoint 상태가 `Accepted`인지 확인하십시오:

OpenSSL이 정상적으로 연결되어야 합니다(출력에서 CONNECTED를 확인하십시오). `errno=104`는 정상적으로 예상되는 값입니다.

DNS&#95;NAME - [Private Service Connect용 GCP service attachment 가져오기](#obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 얻은 `privateDnsHostname` 값을 사용하십시오

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


### 엔드포인트 필터 확인 \{#checking-endpoint-filters\}

#### REST API \{#rest-api\}

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
[
  "102600141743718403"
]
```


### 원격 데이터베이스에 연결하기 \{#connecting-to-a-remote-database\}

ClickHouse Cloud에서 [MySQL](/sql-reference/table-functions/mysql) 또는 [PostgreSQL](/sql-reference/table-functions/postgresql) 테이블 함수를 사용하여 GCP에 호스팅된 데이터베이스에 연결하려고 한다고 가정합니다. 이 연결을 안전하게 설정하기 위해서는 GCP PSC를 사용할 수 없습니다. PSC는 단방향 연결입니다. 내부 네트워크나 GCP VPC에서는 ClickHouse Cloud로 안전하게 연결할 수 있지만, ClickHouse Cloud에서 내부 네트워크로 연결하는 것은 허용되지 않습니다.

[GCP Private Service Connect 문서](https://cloud.google.com/vpc/docs/private-service-connect)에 따르면:

> 서비스 지향 설계: 프로듀서 서비스는 로드 밸런서를 통해 게시되며, 이 로드 밸런서는 소비자 VPC 네트워크에 단일 IP 주소를 노출합니다. 프로듀서 서비스에 액세스하는 소비자 트래픽은 단방향이며, 전체 피어링된 VPC 네트워크에 대한 액세스가 아니라 서비스 IP 주소에만 액세스할 수 있습니다.

이를 위해 GCP VPC 방화벽 규칙을 구성하여 ClickHouse Cloud에서 내부/프라이빗 데이터베이스 서비스로의 연결을 허용해야 합니다. [ClickHouse Cloud 리전의 기본 egress IP 주소](/manage/data-sources/cloud-endpoints-api)와 [사용 가능한 고정 IP 주소](https://api.clickhouse.cloud/static-ips.json)를 함께 확인하십시오.

## 추가 정보 \{#more-information\}

자세한 내용은 [cloud.google.com/vpc/docs/configure-private-service-connect-services](https://cloud.google.com/vpc/docs/configure-private-service-connect-services) 문서를 참조하십시오.