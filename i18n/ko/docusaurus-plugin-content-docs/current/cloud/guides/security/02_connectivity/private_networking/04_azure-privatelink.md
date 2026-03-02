---
title: 'Azure Private Link'
sidebar_label: 'Azure Private Link'
slug: /cloud/security/azure-privatelink
description: 'Azure Private Link를 구성하는 방법'
keywords: ['azure', 'private link', 'privatelink']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import ScalePlanFeatureBadge from '@theme/badges/ScalePlanFeatureBadge';
import azure_pe from '@site/static/images/cloud/security/azure-pe.png';
import azure_privatelink_pe_create from '@site/static/images/cloud/security/azure-privatelink-pe-create.png';
import azure_private_link_center from '@site/static/images/cloud/security/azure-private-link-center.png';
import azure_pe_create_basic from '@site/static/images/cloud/security/azure-pe-create-basic.png';
import azure_pe_resource from '@site/static/images/cloud/security/azure-pe-resource.png';
import azure_pe_create_vnet from '@site/static/images/cloud/security/azure-pe-create-vnet.png';
import azure_pe_create_dns from '@site/static/images/cloud/security/azure-pe-create-dns.png';
import azure_pe_create_tags from '@site/static/images/cloud/security/azure-pe-create-tags.png';
import azure_pe_create_review from '@site/static/images/cloud/security/azure-pe-create-review.png';
import azure_pe_ip from '@site/static/images/cloud/security/azure-pe-ip.png';
import azure_pe_view from '@site/static/images/cloud/security/azure-pe-view.png';
import azure_pe_resource_id from '@site/static/images/cloud/security/azure-pe-resource-id.png';
import azure_pe_resource_guid from '@site/static/images/cloud/security/azure-pe-resource-guid.png';
import azure_pl_dns_wildcard from '@site/static/images/cloud/security/azure-pl-dns-wildcard.png';
import azure_pe_remove_private_endpoint from '@site/static/images/cloud/security/azure-pe-remove-private-endpoint.png';
import azure_privatelink_pe_filter from '@site/static/images/cloud/security/azure-privatelink-pe-filter.png';
import azure_privatelink_pe_dns from '@site/static/images/cloud/security/azure-privatelink-pe-dns.png';


# Azure Private Link \{#azure-private-link\}

<ScalePlanFeatureBadge feature="Azure Private Link"/>

이 가이드는 Azure Private Link를 사용하여 Azure(사용자 소유 서비스와 Microsoft 파트너 서비스 포함)와 ClickHouse Cloud 간에 가상 네트워크를 통한 프라이빗 연결을 제공하는 방법을 설명합니다. Azure Private Link는 네트워크 아키텍처를 단순화하고 데이터를 공용 인터넷에 노출하지 않도록 하여 Azure 내 엔드포인트 간 연결을 보호합니다.

<Image img={azure_pe} size="lg" alt="Overview of PrivateLink" background='white' />

Azure는 Private Link를 통해 리전 간 연결을 지원합니다. 이를 통해 ClickHouse 서비스를 배포한 서로 다른 리전에 위치한 VNet 간에 연결을 설정할 수 있습니다.

:::note
리전 간 트래픽에 추가 요금이 부과될 수 있습니다. 최신 Azure 문서를 확인하십시오.
:::

**다음 단계를 완료하여 Azure Private Link를 활성화하십시오.**

1. Private Link용 Azure 연결 별칭(alias) 가져오기
1. Azure에서 Private Endpoint 생성
1. Private Endpoint Resource ID를 ClickHouse Cloud 조직에 추가
1. Private Endpoint Resource ID를 서비스 허용 목록(allow list)에 추가
1. Private Link를 사용하여 ClickHouse Cloud 서비스에 액세스

:::note
ClickHouse Cloud Azure PrivateLink는 `resourceGUID`에서 `Resource ID` 필터 사용 방식으로 전환되었습니다. 이전 버전과의 호환성을 위해 여전히 `resourceGUID`를 사용할 수 있지만, `Resource ID` 필터로 전환할 것을 권장합니다. 마이그레이션하려면 `Resource ID`를 사용하여 새 엔드포인트를 생성하고 해당 엔드포인트를 서비스에 연결한 다음, 기존 `resourceGUID` 기반 엔드포인트를 제거하면 됩니다.
:::

## 주의 \{#attention\}

ClickHouse는 동일한 Azure 리전 내에서 게시된 [Private Link service](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)를 재사용하기 위해 서비스를 그룹화하려고 시도합니다. 그러나 서비스를 여러 ClickHouse 조직에 분산하는 경우와 같이 이러한 그룹화가 항상 보장되는 것은 아닙니다.
ClickHouse 조직의 다른 서비스에 대해 이미 Private Link를 구성해 둔 상태라면, 해당 그룹화 덕분에 대부분의 단계를 건너뛰고 마지막 단계인 [서비스 허용 목록에 Private Endpoint Resource ID 추가](#add-private-endpoint-id-to-services-allow-list)로 바로 진행할 수 있습니다.

Terraform 예시는 ClickHouse [Terraform Provider 리포지토리](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 확인할 수 있습니다.

## Private Link용 Azure 연결 별칭 가져오기 \{#obtain-azure-connection-alias-for-private-link\}

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console\}

ClickHouse Cloud 콘솔에서 PrivateLink로 연결하려는 서비스를 연 후 **Settings** 메뉴를 엽니다. **Set up private endpoint** 버튼을 클릭합니다. 이후 Private Link를 설정하는 데 사용할 `Service name`과 `DNS name`을 기록해 둡니다.

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

다음 단계에서 필요하므로 `Service name`과 `DNS name`을 기록해 두십시오.

### 옵션 2: API \{#option-2-api\}

시작하기 전에 ClickHouse Cloud API 키가 필요합니다. [새 키를 생성](/cloud/manage/openapi)하거나 기존 키를 사용할 수 있습니다.

API 키를 준비한 후, 명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

리전, 공급자, 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 조회합니다.

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Private Link에 사용할 Azure 연결 별칭과 Private DNS 호스트 이름을 확인하십시오.

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId`를 기록해 두십시오. 다음 단계에서 사용하게 됩니다.


## Azure에서 프라이빗 엔드포인트 생성 \{#create-private-endpoint-in-azure\}

:::important
이 섹션에서는 Azure Private Link를 통해 ClickHouse를 구성할 때 필요한 ClickHouse 관련 세부 사항을 다룹니다. Azure 관련 단계는 무엇을 참고해야 하는지 안내하기 위한 용도로 제공되며, Azure 클라우드 제공자의 별도 공지 없이 시간이 지나면서 변경될 수 있습니다. 구체적인 Azure 구성은 개별 사용 사례에 따라 적절히 설정하시기 바랍니다.  

또한, 필요한 Azure 프라이빗 엔드포인트와 DNS 레코드 구성에 대해서는 ClickHouse가 책임지지 않음을 유의하십시오.  

Azure 구성 작업과 관련된 문제가 있는 경우 Azure Support에 직접 문의하십시오.
:::

이 섹션에서는 Azure에서 프라이빗 엔드포인트(Private Endpoint)를 생성합니다. Azure Portal 또는 Terraform을 사용할 수 있습니다.

### 옵션 1: Azure Portal을 사용하여 Azure에 Private Endpoint 생성하기 \{#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure\}

Azure Portal에서 **Private Link Center → Private Endpoints**로 이동합니다.

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center 열기" border />

**Create** 버튼을 클릭하여 Private Endpoint 생성 대화 상자를 엽니다.

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center 열기" border />

---

다음 화면에서 다음 옵션을 설정합니다.

- **Subscription** / **Resource Group**: Private Endpoint에 사용할 Azure 구독과 리소스 그룹을 선택합니다.
- **Name**: **Private Endpoint**의 이름을 지정합니다.
- **Region**: Private Link를 통해 ClickHouse Cloud에 연결될 VNet이 배포된 리전을 선택합니다.

위 단계를 완료한 후 **Next: Resource** 버튼을 클릭합니다.

<Image img={azure_pe_create_basic} size="md" alt="Private Endpoint 기본 생성" border />

---

**Connect to an Azure resource by resource ID or alias** 옵션을 선택합니다.

**Resource ID or alias**에는 [Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) 단계에서 얻은 `endpointServiceId`를 사용합니다.

**Next: Virtual Network** 버튼을 클릭합니다.

<Image img={azure_pe_resource} size="md" alt="Private Endpoint 리소스 선택" border />

---

- **Virtual network**: Private Link를 사용하여 ClickHouse Cloud에 연결하려는 VNet을 선택합니다.
- **Subnet**: Private Endpoint가 생성될 서브넷을 선택합니다.

선택 사항:

- **Application security group**: Private Endpoint에 ASG를 연결하여 Network Security Groups에서 Private Endpoint로 들어오고 나가는 네트워크 트래픽을 필터링하는 데 사용할 수 있습니다.

**Next: DNS** 버튼을 클릭합니다.

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint 가상 네트워크 선택" border />

**Next: Tags** 버튼을 클릭합니다.

---

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint DNS 구성" border />

필요한 경우 Private Endpoint에 태그를 추가할 수 있습니다.

**Next: Review + create** 버튼을 클릭합니다.

---

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint 태그" border />

마지막으로 **Create** 버튼을 클릭합니다.

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint 검토" border />

생성된 Private Endpoint의 **Connection status**는 **Pending** 상태로 표시됩니다. 이 Private Endpoint를 서비스 허용 목록(allow list)에 추가하면 상태가 **Approved**로 변경됩니다.

Private Endpoint와 연결된 네트워크 인터페이스를 열고 **Private IPv4 address**(이 예제에서는 10.0.0.4)를 복사합니다. 이 정보는 다음 단계에서 필요합니다.

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint IP 주소" border />

### 옵션 2: Terraform을 사용하여 Azure에서 프라이빗 엔드포인트(Private Endpoint) 생성 \{#option-2-using-terraform-to-create-a-private-endpoint-in-azure\}

아래 Template을 사용해 Terraform으로 프라이빗 엔드포인트를 생성합니다:

```json
resource "azurerm_private_endpoint" "example_clickhouse_cloud" {
  name                = var.pe_name
  location            = var.pe_location
  resource_group_name = var.pe_resource_group_name
  subnet_id           = var.pe_subnet_id

  private_service_connection {
    name                              = "test-pl"
    private_connection_resource_alias = "<data from 'Obtain Azure connection alias for Private Link' step>"
    is_manual_connection              = true
  }
}
```


### Private Endpoint Resource ID 가져오기 \{#obtaining-private-endpoint-resourceid\}

Private Link을 사용하려면 서비스 허용 목록에 Private Endpoint 연결 Resource ID를 추가해야 합니다.

Private Endpoint Resource ID는 Azure Portal에서 확인할 수 있습니다. 이전 단계에서 생성한 Private Endpoint를 열고 **JSON View**를 클릭하십시오:

<Image img={azure_pe_view} size="lg" alt="Private Endpoint View" border />

`properties` 섹션에서 `id` 필드를 찾아 해당 값을 복사합니다:

**권장 방법: Resource ID 사용**

<Image img={azure_pe_resource_id} size="lg" alt="Private Endpoint Resource ID" border />

**레거시 방법: resourceGUID 사용**
하위 호환성을 위해 `resourceGUID`를 계속 사용할 수 있습니다. `resourceGuid` 필드를 찾아 해당 값을 복사합니다:

<Image img={azure_pe_resource_guid} size="lg" alt="Private Endpoint Resource GUID" border />

## Private Link를 위한 DNS 설정 \{#setting-up-dns-for-private-link\}

Private Link을 통해 리소스에 액세스하려면 Private DNS 영역(`${location_code}.privatelink.azure.clickhouse.cloud`)을 생성한 후 가상 네트워크(VNet)에 연결해야 합니다.

### Private DNS 존 생성 \{#create-private-dns-zone\}

**옵션 1: Azure 포털 사용**

[Azure 포털을 사용하여 Azure Private DNS 존을 생성하는 방법은 이 가이드를 참고하십시오.](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal)

**옵션 2: Terraform 사용**

다음 Terraform 템플릿을 사용하여 Private DNS 존을 생성하십시오:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```


### 와일드카드 DNS 레코드 생성 \{#create-a-wildcard-dns-record\}

와일드카드 레코드를 생성하여 Private Endpoint를 가리키도록 설정합니다:

**옵션 1: Azure Portal 사용**

1. `MyAzureResourceGroup` 리소스 그룹을 연 다음 `${region_code}.privatelink.azure.clickhouse.cloud` 프라이빗 영역(private zone)을 선택합니다.
2. * Record set을 선택합니다.
3. Name에는 `*`를 입력합니다.
4. IP Address에는 Private Endpoint에 표시되는 IP 주소를 입력합니다.
5. **OK**를 선택합니다.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS 와일드카드 설정" border />

**옵션 2: Terraform 사용**

다음 Terraform 템플릿을 사용하여 와일드카드 DNS 레코드를 생성합니다:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```


### 가상 네트워크 링크 생성 \{#create-a-virtual-network-link\}

프라이빗 DNS 영역을 가상 네트워크에 연결하려면 가상 네트워크 링크를 생성해야 합니다.

**옵션 1: Azure Portal 사용**

[가상 네트워크를 프라이빗 DNS 영역에 연결](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network)하는 이 가이드를 따르십시오.

**옵션 2: Terraform 사용**

:::note
DNS를 구성하는 방법은 여러 가지가 있습니다. 사용 중인 구체적인 사용 사례에 맞게 DNS를 설정하십시오.
:::

[Obtain Azure connection alias for Private Link](#obtain-azure-connection-alias-for-private-link) 단계에서 가져온 "DNS name"이 Private Endpoint IP 주소를 가리키도록 설정해야 합니다. 이렇게 하면 VPC/네트워크 내의 서비스와 구성 요소가 해당 이름을 올바르게 조회할 수 있습니다.

### DNS 설정 확인 \{#verify-dns-setup\}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` 도메인은 Private Endpoint의 IP 주소를 가리켜야 합니다(이 예에서는 10.0.0.4입니다).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```


## Private Endpoint 리소스 ID를 ClickHouse Cloud 조직에 추가 \{#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization\}

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-1\}

엔드포인트를 조직에 추가하려면 [서비스 허용 목록에 Private Endpoint Resource ID 추가](#add-private-endpoint-id-to-services-allow-list) 단계로 이동하십시오. ClickHouse Cloud 콘솔을 사용해 서비스 허용 목록에 Private Endpoint Resource ID를 추가하면 조직에도 자동으로 추가됩니다.

엔드포인트를 제거하려면 **Organization details -> Private Endpoints**를 열고 삭제 버튼을 클릭하여 엔드포인트를 제거하십시오.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Private Endpoint 제거" border />

### 옵션 2: API \{#option-2-api-1\}

명령을 실행하기 전에 다음 환경 변수를 먼저 설정하십시오:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

[Obtaining the Private Endpoint Resource ID](#obtaining-private-endpoint-resourceid) 단계에서 확인한 값을 사용하여 `ENDPOINT_ID` 환경 변수를 설정합니다.

다음 명령을 실행하여 Private Endpoint를 추가하십시오:

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

또한 다음 명령을 실행하여 Private Endpoint를 제거할 수 있습니다:

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

Private Endpoint를 추가하거나 제거한 후 조직에 변경 사항을 적용하려면 다음 명령을 실행하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```


## 서비스 허용 목록에 Private Endpoint Resource ID 추가 \{#add-private-endpoint-id-to-services-allow-list\}

기본적으로 ClickHouse Cloud 서비스는 Private Link 연결이 승인되어 설정되었다고 하더라도 Private Link 연결을 통해서는 사용할 수 없습니다. Private Link를 통해 노출하려는 각 서비스에 대해 해당 서비스의 Private Endpoint Resource ID를 명시적으로 허용 목록에 추가해야 합니다.

### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-2\}

ClickHouse Cloud 콘솔에서 PrivateLink로 연결하려는 서비스를 열고 **Settings**로 이동합니다. [이전](#obtaining-private-endpoint-resourceid) 단계에서 얻은 `Resource ID`를 입력합니다.

:::note
기존 PrivateLink 연결을 통해 접근을 허용하려면 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoints 필터" border />

### 옵션 2: API \{#option-2-api-2\}

명령을 실행하기 전에 다음 환경 변수를 먼저 설정합니다:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Private Link을 통해 액세스할 수 있어야 하는 각 서비스에 대해 이를 실행합니다.

다음 명령을 실행하여 Private Endpoint를 서비스 허용 목록에 추가합니다:

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

다음 명령을 실행하면 서비스 허용 목록에서 Private Endpoint를 제거할 수도 있습니다:

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

서비스 허용 목록에 Private Endpoint를 추가하거나 제거한 후, 해당 내용을 조직에 적용하려면 다음 명령을 실행하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```


## Private Link를 사용하여 ClickHouse Cloud 서비스에 액세스하기 \{#access-your-clickhouse-cloud-service-using-private-link\}

Private Link가 활성화된 각 서비스에는 퍼블릭 엔드포인트와 프라이빗 엔드포인트가 있습니다. Private Link를 사용해 연결하려면 [Private Link용 Azure 연결 별칭 가져오기](#obtain-azure-connection-alias-for-private-link)에서 확인한 `privateDnsHostname`<sup>API</sup> 또는 `DNS name`<sup>console</sup> 값을 프라이빗 엔드포인트로 사용해야 합니다.

### 프라이빗 DNS 호스트 이름 확인하기 \{#obtaining-the-private-dns-hostname\}

#### 옵션 1: ClickHouse Cloud 콘솔 \{#option-1-clickhouse-cloud-console-3\}

ClickHouse Cloud 콘솔에서 **Settings**로 이동한 다음 **Set up private endpoint** 버튼을 클릭합니다. 열리는 플라이아웃에서 **DNS Name**을 복사합니다.

<Image img={azure_privatelink_pe_dns} size="lg" alt="프라이빗 엔드포인트 DNS 이름" border />

#### 옵션 2: API \{#option-2-api-3\}

명령을 실행하기 전에 다음 환경 변수를 먼저 설정하십시오.

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

다음 명령을 실행하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

다음과 유사한 응답이 반환됩니다:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

이 예시에서 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 호스트 이름으로의 연결은 Private Link로 라우팅됩니다. 반면 `xxxxxxx.region_code.azure.clickhouse.cloud`는 인터넷을 통해 라우팅됩니다.

Private Link을 사용하여 ClickHouse Cloud 서비스에 연결하려면 `privateDnsHostname`을 사용하십시오.


## 문제 해결 \{#troubleshooting\}

### DNS 설정 테스트 \{#test-dns-setup\}

다음 명령을 실행하십시오:

```bash
nslookup <dns name>
```

여기서 「dns name」은 [Private Link용 Azure 연결 별칭 가져오기](#obtain-azure-connection-alias-for-private-link)에서 얻은 `privateDnsHostname`<sup>API</sup> 또는 `DNS name`<sup>console</sup>입니다.

다음과 같은 응답이 반환됩니다:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```


### 피어에 의해 연결이 재설정됨 \{#connection-reset-by-peer\}

대부분의 경우 Private Endpoint Resource ID가 서비스 허용 목록에 추가되지 않았기 때문입니다. [_서비스 허용 목록에 Private Endpoint Resource ID 추가_ 단계](#add-private-endpoint-id-to-services-allow-list)를 다시 진행하십시오.

### 프라이빗 엔드포인트가 대기(pending) 상태임 \{#private-endpoint-is-in-pending-state\}

대부분의 경우 Private Endpoint Resource ID가 서비스 허용 목록(allow-list)에 추가되지 않았습니다. [_서비스 허용 목록에 Private Endpoint Resource ID 추가_ 단계](#add-private-endpoint-id-to-services-allow-list)로 돌아가 다시 진행하십시오.

### 연결 테스트 \{#test-connectivity\}

Private Link을 사용한 연결에 문제가 있는 경우 `openssl`을 사용하여 연결을 점검하십시오. Private Link 엔드포인트 상태가 `Accepted`인지 확인하십시오.

OpenSSL이 정상적으로 연결되어야 합니다(출력에서 CONNECTED를 확인하십시오). `errno=104`는 정상적으로 예상되는 값입니다.

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


### 프라이빗 엔드포인트 필터 확인 \{#checking-private-endpoint-filters\}

다음 명령을 실행하기 전에 아래 환경 변수를 먼저 설정하십시오.

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<please set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

다음 명령을 실행하여 Private Endpoint 필터를 확인하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X GET -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" | jq .result.privateEndpointIds
```


## 추가 정보 \{#more-information\}

Azure Private Link에 대한 자세한 내용은 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link) 페이지를 방문하십시오.