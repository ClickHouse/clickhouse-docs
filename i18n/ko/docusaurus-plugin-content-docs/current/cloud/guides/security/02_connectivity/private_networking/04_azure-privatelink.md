---
'title': 'Azure Private Link'
'sidebar_label': 'Azure Private Link'
'slug': '/cloud/security/azure-privatelink'
'description': 'Azure Private Link 설정 방법'
'keywords':
- 'azure'
- 'private link'
- 'privatelink'
'doc_type': 'guide'
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


# Azure Private Link

<ScalePlanFeatureBadge feature="Azure Private Link"/>

이 가이드에서는 Azure Private Link를 사용하여 고객 소유 및 Microsoft 파트너 서비스가 포함된 Azure와 ClickHouse Cloud 간에 가상 네트워크를 통한 비공식 연결을 제공하는 방법을 보여줍니다. Azure Private Link는 네트워크 아키텍처를 단순화하고 퍼블릭 인터넷에 대한 데이터 노출을 제거하여 Azure의 엔드포인트 간의 연결을 보호합니다.

<Image img={azure_pe} size="lg" alt="PrivateLink 개요" background='white' />

Azure는 Private Link를 통해 교차 지역 연결을 지원합니다. 이를 통해 ClickHouse 서비스가 배포된 서로 다른 지역에 위치한 VNet 간에 연결을 설정할 수 있습니다.

:::note
지역 간 트래픽에 추가 요금이 부과될 수 있습니다. 최신 Azure 문서를 확인하시기 바랍니다.
:::

**Azure Private Link를 활성화하려면 다음 단계를 완료하십시오:**

1. Private Link에 대한 Azure 연결 별칭 받기
1. Azure에서 Private Endpoint 생성
1. ClickHouse Cloud 조직에 Private Endpoint 리소스 ID 추가
1. 서비스의 허용 목록에 Private Endpoint 리소스 ID 추가
1. Private Link를 사용하여 ClickHouse Cloud 서비스에 접근

:::note
ClickHouse Cloud Azure PrivateLink는 resourceGUID에서 Resource ID 필터로 전환되었습니다. 이전 호환성을 위해 resourceGUID를 여전히 사용할 수 있지만 Resource ID 필터로 전환하는 것을 권장합니다. 마이그레이션하려면 Resource ID를 사용하여 새 엔드포인트를 생성하고 서비스에 연결한 다음 이전 resourceGUID 기반 항목을 제거하십시오.
:::

## 주의 {#attention}
ClickHouse는 Azure 지역 내에서 동일하게 게시된 [Private Link 서비스](https://learn.microsoft.com/en-us/azure/private-link/private-link-service-overview)를 재사용하기 위해 귀하의 서비스를 그룹화하려고 시도합니다. 그러나 이러한 그룹화는 보장되지 않으며, 특히 여러 ClickHouse 조직에 서비스를 분산하는 경우 그렇습니다.  
ClickHouse 조직의 다른 서비스에 대해 Private Link가 이미 구성되어 있는 경우, 그룹화 때문에 대부분의 단계를 건너뛰고 최종 단계인 [서비스의 허용 목록에 Private Endpoint 리소스 ID 추가](#add-private-endpoint-id-to-services-allow-list)로 직접 진행할 수 있습니다.

Terraform 예제는 ClickHouse [Terraform Provider 리포지토리](https://github.com/ClickHouse/terraform-provider-clickhouse/tree/main/examples/)에서 확인할 수 있습니다.

## Private Link에 대한 Azure 연결 별칭 받기 {#obtain-azure-connection-alias-for-private-link}

### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console}

ClickHouse Cloud 콘솔에서 PrivateLink를 통해 연결하려는 서비스를 열고 **설정** 메뉴를 열어주세요. **Private Endpoint 설정** 버튼을 클릭하십시오. Private Link 설정에 사용할 `서비스 이름`과 `DNS 이름`을 기록해 두십시오.

<Image img={azure_privatelink_pe_create} size="lg" alt="Private Endpoints" border />

`서비스 이름`과 `DNS 이름`을 기록해 두세요. 다음 단계에서 필요합니다.

### 옵션 2: API {#option-2-api}

시작하기 전에 ClickHouse Cloud API 키가 필요합니다. [새 키 생성](/cloud/manage/openapi)하거나 기존 키를 사용하십시오.

API 키가 준비되면 다음 환경 변수를 설정한 후 명령을 실행하세요:

```bash
REGION=<region code, use Azure format, for example: westus3>
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
SERVICE_NAME=<Your ClickHouse service name>
```

지역, 공급자 및 서비스 이름으로 필터링하여 ClickHouse `INSTANCE_ID`를 가져옵니다:

```shell
INSTANCE_ID=$(curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" \
"https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services" | \
jq ".result[] | select (.region==\"${REGION:?}\" and .provider==\"${PROVIDER:?}\" and .name==\"${SERVICE_NAME:?}\") | .id " -r)
```

Azure 연결 별칭 및 Private Link에 대한 Private DNS 호스트 이름을 얻습니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
{
  "endpointServiceId": "production-westus3-0-0.xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx.westus3.azure.privatelinkservice",
  "privateDnsHostname": "xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud"
}
```

`endpointServiceId`를 기록해 두십시오. 다음 단계에서 사용할 것입니다.

## Azure에서 Private Endpoint 생성 {#create-private-endpoint-in-azure}

:::important
이 섹션에서는 Azure Private Link를 통해 ClickHouse를 구성하기 위한 ClickHouse-specific 세부정보를 다룹니다. Azure-specific 단계는 참고용으로 제공되며, 시간이 지남에 따라 Azure 클라우드 공급자의 통보 없이 변경될 수 있습니다. 사용 사례에 따라 Azure 구성을 고려해 주시기 바랍니다.

ClickHouse는 필요한 Azure Private Endpoint 및 DNS 레코드를 구성할 책임이 없습니다.

Azure 구성 작업과 관련된 문제는 Azure Support에 직접 문의하세요.
:::

이 섹션에서는 Azure에서 Private Endpoint를 생성합니다. Azure Portal 또는 Terraform을 사용할 수 있습니다.

### 옵션 1: Azure Portal을 사용하여 Azure에서 Private Endpoint 생성 {#option-1-using-azure-portal-to-create-a-private-endpoint-in-azure}

Azure Portal에서 **Private Link Center → Private Endpoints**를 엽니다.

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center 열기" border />

**생성** 버튼을 클릭하여 Private Endpoint 생성 대화 상자를 엽니다.

<Image img={azure_private_link_center} size="lg" alt="Azure Private Center 열기" border />

---

다음 화면에서 다음 옵션을 지정하십시오:

- **구독** / **리소스 그룹**: Private Endpoint의 Azure 구독 및 리소스 그룹을 선택하십시오.
- **이름**: **Private Endpoint**의 이름을 설정합니다.
- **지역**: Private Link를 통해 ClickHouse Cloud에 연결될 배포된 VNet이 있는 지역을 선택합니다.

위 단계를 완료한 후 **다음: 리소스** 버튼을 클릭하십시오.

<Image img={azure_pe_create_basic} size="md" alt="Private Endpoint 기본 생성" border />

---

**Resource ID 또는 별칭을 사용하여 Azure 리소스에 연결** 옵션을 선택합니다.

**리소스 ID 또는 별칭**에 대해서는 [Private Link에 대한 Azure 연결 별칭 받기](#obtain-azure-connection-alias-for-private-link) 단계에서 얻은 `endpointServiceId`를 사용합니다.

**다음: 가상 네트워크** 버튼을 클릭하십시오.

<Image img={azure_pe_resource} size="md" alt="Private Endpoint 리소스 선택" border />

---

- **가상 네트워크**: Private Link를 사용하여 ClickHouse Cloud에 연결할 VNet을 선택합니다.
- **서브넷**: Private Endpoint가 생성될 서브넷을 선택합니다.

선택적:

- **애플리케이션 보안 그룹**: Private Endpoint에 ASG를 첨부하고 네트워크 보안 그룹에서 트래픽 필터링에 사용할 수 있습니다.

**다음: DNS** 버튼을 클릭합니다.

<Image img={azure_pe_create_vnet} size="md" alt="Private Endpoint 가상 네트워크 선택" border />

**다음: 태그** 버튼을 클릭합니다.

---

<Image img={azure_pe_create_dns} size="md" alt="Private Endpoint DNS 구성" border />

선택적으로 Private Endpoint에 태그를 첨부할 수 있습니다.

**다음: 검토 + 생성** 버튼을 클릭합니다.

---

<Image img={azure_pe_create_tags} size="md" alt="Private Endpoint 태그" border />

마지막으로 **생성** 버튼을 클릭합니다.

<Image img={azure_pe_create_review} size="md" alt="Private Endpoint 검토" border />

생성된 Private Endpoint의 **연결 상태**는 **대기 중** 상태입니다. 이 Private Endpoint를 서비스 허용 목록에 추가하면 **승인됨** 상태로 변경됩니다.

Private Endpoint와 연관된 네트워크 인터페이스를 열고 **Private IPv4 주소**(이 예제에서는 10.0.0.4)를 복사하세요. 다음 단계에서 이 정보가 필요합니다.

<Image img={azure_pe_ip} size="lg" alt="Private Endpoint IP 주소" border />

### 옵션 2: Terraform을 사용하여 Azure에서 Private Endpoint 생성 {#option-2-using-terraform-to-create-a-private-endpoint-in-azure}

Terraform을 사용하여 Private Endpoint를 생성하려면 아래 템플릿을 사용하십시오:

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

### Private Endpoint 리소스 ID 얻기 {#obtaining-private-endpoint-resourceid}

Private Link를 사용하려면 Private Endpoint 연결 리소스 ID를 서비스 허용 목록에 추가해야 합니다.

Private Endpoint 리소스 ID는 Azure Portal에서 노출됩니다. 이전 단계에서 생성한 Private Endpoint를 열고 **JSON 보기**를 클릭합니다:

<Image img={azure_pe_view} size="lg" alt="Private Endpoint 보기" border />

속성 아래에서 `id` 필드를 찾아 이 값을 복사합니다:

**권장 방법: Resource ID 사용**
<Image img={azure_pe_resource_id} size="lg" alt="Private Endpoint 리소스 ID" border />

**구식 방법: resourceGUID 사용**
이전 호환성을 위해 resourceGUID를 여전히 사용할 수 있습니다. `resourceGuid` 필드를 찾아 이 값을 복사하십시오:

<Image img={azure_pe_resource_guid} size="lg" alt="Private Endpoint 리소스 GUID" border />

## Private Link를 위한 DNS 설정 {#setting-up-dns-for-private-link}

Private Link를 통해 리소스에 접근하기 위해 `${location_code}.privatelink.azure.clickhouse.cloud`라는 Private DNS 존을 생성하고 이를 VNet에 연결해야 합니다.

### Private DNS 존 생성 {#create-private-dns-zone}

**옵션 1: Azure 포털 사용**

Azure Portal을 사용하여 [Azure 개인 DNS 존 만들기](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal) 가이드를 따라 주십시오.

**옵션 2: Terraform 사용**

다음 Terraform 템플릿을 사용하여 Private DNS 존을 생성하십시오:

```json
resource "azurerm_private_dns_zone" "clickhouse_cloud_private_link_zone" {
  name                = "${var.location}.privatelink.azure.clickhouse.cloud"
  resource_group_name = var.resource_group_name
}
```

### 와일드카드 DNS 레코드 만들기 {#create-a-wildcard-dns-record}

와일드카드 레코드를 생성하고 Private Endpoint를 가리키게 하십시오:

**옵션 1: Azure Portal 사용**

1. `MyAzureResourceGroup` 리소스 그룹을 열고 `${region_code}.privatelink.azure.clickhouse.cloud` 개인 존을 선택합니다.
2. + 레코드 집합을 선택합니다.
3. 이름에 `*`을 입력합니다.
4. IP 주소에 Private Endpoint에 대한 IP 주소를 입력합니다.
5. **확인**을 선택합니다.

<Image img={azure_pl_dns_wildcard} size="lg" alt="Private Link DNS 와일드카드 설정" border />

**옵션 2: Terraform 사용**

다음 Terraform 템플릿을 사용하여 와일드카드 DNS 레코드를 생성하십시오:

```json
resource "azurerm_private_dns_a_record" "example" {
  name                = "*"
  zone_name           = var.zone_name
  resource_group_name = var.resource_group_name
  ttl                 = 300
  records             = ["10.0.0.4"]
}
```

### 가상 네트워크 링크 생성 {#create-a-virtual-network-link}

Private DNS 존을 가상 네트워크에 연결하기 위해 가상 네트워크 링크를 만들어야 합니다.

**옵션 1: Azure 포털 사용**

[개인 DNS 존에 가상 네트워크 링크](https://learn.microsoft.com/en-us/azure/dns/private-dns-getstarted-portal#link-the-virtual-network) 가이드를 따라 주십시오.

**옵션 2: Terraform 사용**

:::note
DNS를 구성하는 방법에는 여러 가지가 있습니다. 특정 사용 사례에 따라 DNS를 설정하시기 바랍니다.
:::

"Private Link에 대한 Azure 연결 별칭 받기" 단계에서 가져온 "DNS 이름"을 Private Endpoint IP 주소로 지정합니다. 이렇게 하면 VPC/네트워크 내의 서비스/구성 요소가 이를 올바르게 확인할 수 있습니다.

### DNS 설정 확인 {#verify-dns-setup}

`xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud` 도메인은 Private Endpoint IP를 가리켜야 합니다. (이 예제에서는 10.0.0.4).

```bash
nslookup xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud.
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: xxxxxxxxxx.westus3.privatelink.azure.clickhouse.cloud
Address: 10.0.0.4
```

## ClickHouse Cloud 조직에 Private Endpoint 리소스 ID 추가 {#add-the-private-endpoint-id-to-your-clickhouse-cloud-organization}

### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console-1}

조직에 엔드포인트를 추가하려면 [서비스의 허용 목록에 Private Endpoint 리소스 ID 추가](#add-private-endpoint-id-to-services-allow-list) 단계로 진행하십시오. ClickHouse Cloud 콘솔을 사용하여 서비스 허용 목록에 Private Endpoint 리소스 ID를 추가하면 자동으로 조직에 추가됩니다.

엔드포인트를 제거하려면 **조직 세부정보 -> Private Endpoints**를 열고 삭제 버튼을 클릭하여 엔드포인트를 제거하십시오.

<Image img={azure_pe_remove_private_endpoint} size="lg" alt="Private Endpoint 제거" border />

### 옵션 2: API {#option-2-api-1}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
REGION=<region code, use Azure format>
```

[Private Endpoint 리소스 ID 얻기](#obtaining-private-endpoint-resourceid) 단계에서 가져온 데이터를 사용하여 `ENDPOINT_ID` 환경 변수를 설정합니다.

Private Endpoint를 추가하려면 다음 명령을 실행합니다:

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

서비스 허용 목록에서 Private Endpoint를 제거하려면 다음 명령을 실행할 수 있습니다:

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

Private Endpoint를 서비스 허용 목록에 추가하거나 제거한 후, 조직에 적용하기 위해 다음 명령을 실행하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}" -d @pl_config_org.json
```

## 서비스의 허용 목록에 Private Endpoint 리소스 ID 추가 {#add-private-endpoint-id-to-services-allow-list}

기본적으로 ClickHouse Cloud 서비스는 Private Link 연결이 승인되고 설정된 경우에도 Private Link 연결을 통해 사용할 수 없습니다. Private Link를 사용하여 사용할 각 서비스에 대해 Private Endpoint 리소스 ID를 명시적으로 추가해야 합니다.

### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console-2}

ClickHouse Cloud 콘솔에서 PrivateLink를 통해 연결하고 싶은 서비스를 열고 **설정**으로 이동합니다. [이전](#obtaining-private-endpoint-resourceid) 단계에서 가져온 `Resource ID`를 입력하십시오.

:::note
기존 PrivateLink 연결로부터의 접근을 허용하고 싶다면 기존 엔드포인트 드롭다운 메뉴를 사용하십시오.
:::

<Image img={azure_privatelink_pe_filter} size="lg" alt="Private Endpoints 필터" border />

### 옵션 2: API {#option-2-api-2}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
PROVIDER=azure
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
ENDPOINT_ID=<Private Endpoint Resource ID>
INSTANCE_ID=<Instance ID>
```

Private Link를 사용할 수 있는 각 서비스에 대해 실행하십시오.

서비스 허용 목록에 Private Endpoint를 추가하려면 다음 명령을 실행하십시오:

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

서비스 허용 목록에서 Private Endpoint를 제거하려면 다음 명령을 실행할 수 있습니다:

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

서비스 허용 목록에 Private Endpoint를 추가하거나 제거한 후, 조직에 적용하기 위해 다음 명령을 실행하십시오:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" -X PATCH -H "Content-Type: application/json" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}" -d @pl_config.json | jq
```

## Private Link를 사용하여 ClickHouse Cloud 서비스에 접근 {#access-your-clickhouse-cloud-service-using-private-link}

Private Link가 활성화된 각 서비스에는 공용 및 사설 엔드포인트가 있습니다. Private Link를 사용하여 연결하려면 Private Endpoint를 사용해야 하며, 이는 [Private Link에 대한 Azure 연결 별칭 받기](#obtain-azure-connection-alias-for-private-link) 단계에서 가져온 `privateDnsHostname`<sup>API</sup> 또는 `DNS 이름`<sup>콘솔</sup>이 됩니다.

### 개인 DNS 호스트 이름 얻기 {#obtaining-the-private-dns-hostname}

#### 옵션 1: ClickHouse Cloud 콘솔 {#option-1-clickhouse-cloud-console-3}

ClickHouse Cloud 콘솔에서 **설정**으로 이동하십시오. **Private Endpoint 설정** 버튼을 클릭합니다. 열린 플라이아웃에서 **DNS 이름**을 복사합니다.

<Image img={azure_privatelink_pe_dns} size="lg" alt="Private Endpoint DNS 이름" border />

#### 옵션 2: API {#option-2-api-3}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

```bash
KEY_ID=<Key ID>
KEY_SECRET=<Key secret>
ORG_ID=<set ClickHouse organization ID>
INSTANCE_ID=<Instance ID>
```

다음 명령을 실행합니다:

```bash
curl --silent --user "${KEY_ID:?}:${KEY_SECRET:?}" "https://api.clickhouse.cloud/v1/organizations/${ORG_ID:?}/services/${INSTANCE_ID:?}/privateEndpointConfig" | jq  .result
```

다음과 유사한 응답을 받아야 합니다:

```response
{
  ...
  "privateDnsHostname": "xxxxxxx.<region code>.privatelink.azure.clickhouse.cloud"
}
```

이 예에서 `xxxxxxx.region_code.privatelink.azure.clickhouse.cloud` 호스트 이름으로의 연결이 Private Link로 라우팅됩니다. 한편, `xxxxxxx.region_code.azure.clickhouse.cloud`는 인터넷을 통해 라우팅됩니다.

`privateDnsHostname`을 사용하여 Private Link를 사용하여 ClickHouse Cloud 서비스에 연결하십시오.

## 문제 해결 {#troubleshooting}

### DNS 설정 테스트 {#test-dns-setup}

다음 명령을 실행하십시오:

```bash
nslookup <dns name>
```
여기서 "dns name"은 [Private Link에 대한 Azure 연결 별칭 받기](#obtain-azure-connection-alias-for-private-link) 단계의 `privateDnsHostname`<sup>API</sup> 또는 `DNS 이름`<sup>콘솔</sup>입니다.

다음과 같은 응답을 받아야 합니다:

```response
Non-authoritative answer:
Name: <dns name>
Address: 10.0.0.4
```

### 피어에 의한 연결 재설정 {#connection-reset-by-peer}

대부분의 경우, Private Endpoint 리소스 ID가 서비스 허용 목록에 추가되지 않았습니다. [_서비스 허용 목록에 Private Endpoint 리소스 ID 추가_ 단계](#add-private-endpoint-id-to-services-allow-list)를 다시 확인하십시오.

### Private Endpoint가 대기 중 상태입니다 {#private-endpoint-is-in-pending-state}

대부분의 경우, Private Endpoint 리소스 ID가 서비스 허용 목록에 추가되지 않았습니다. [_서비스 허용 목록에 Private Endpoint 리소스 ID 추가_ 단계](#add-private-endpoint-id-to-services-allow-list)를 다시 확인하십시오.

### 연결성 테스트 {#test-connectivity}

Private Link를 통해 연결하는 데 문제가 발생하는 경우 `openssl`를 사용하여 연결성을 확인하십시오. Private Link 엔드포인트 상태가 `Accepted`인지 확인하십시오.

OpenSSL은 연결할 수 있어야 합니다(출력에서 CONNECTED를 참조하십시오). `errno=104`는 예상됩니다.

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

### Private Endpoint 필터 확인 {#checking-private-endpoint-filters}

명령을 실행하기 전에 다음 환경 변수를 설정하십시오:

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

## 추가 정보 {#more-information}

Azure Private Link에 대한 추가 정보는 [azure.microsoft.com/en-us/products/private-link](https://azure.microsoft.com/en-us/products/private-link)를 방문하시기 바랍니다.
