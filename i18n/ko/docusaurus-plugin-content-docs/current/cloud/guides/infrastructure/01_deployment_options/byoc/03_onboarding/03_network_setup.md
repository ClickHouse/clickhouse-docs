---
title: '프라이빗 네트워킹 설정'
slug: /cloud/reference/byoc/onboarding/network
sidebar_label: '프라이빗 네트워킹 설정'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'privatelink']
description: '사용자 소유 Cloud 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

ClickHouse BYOC는 다양한 프라이빗 네트워크 옵션을 지원하여 보안을 강화하고 서비스 간 직접 연결을 가능하게 합니다. 이 가이드는 자체 AWS 또는 GCP 계정에 있는 ClickHouse Cloud 배포를 내부 애플리케이션이나 분석 도구와 같은 다른 네트워크나 서비스에 안전하게 연결하는 데 권장되는 방법을 안내합니다. VPC Peering, AWS PrivateLink, GCP Private Service Connect와 같은 옵션을 다루며, 각 옵션에 대한 주요 단계와 고려 사항을 개략적으로 설명합니다.

ClickHouse BYOC 배포에 프라이빗 네트워크 연결이 필요한 경우, 이 가이드에 제시된 단계를 따르거나, 더 복잡한 시나리오에 대해서는 ClickHouse Support에 문의하십시오.


## VPC 피어링 설정(AWS) \{#aws-vpc-peering\}

ClickHouse BYOC에 대해 VPC 피어링을 생성하거나 삭제할 때는 다음 단계를 따르십시오:

<VerticalStepper headerLevel="h3">

### ClickHouse BYOC용 프라이빗 로드 밸런서 활성화 \{#step-1-enable-private-load-balancer-for-clickhouse-byoc\}
ClickHouse Support에 연락하여 Private Load Balancer를 활성화하십시오.

### 피어링 연결 생성 \{#step-2-create-a-peering-connection\}
1. ClickHouse BYOC 계정에서 VPC 대시보드로 이동합니다.
2. Peering Connections를 선택합니다.
3. Create Peering Connection을 클릭합니다.
4. VPC Requester를 ClickHouse VPC ID로 설정합니다.
5. VPC Accepter를 대상 VPC ID로 설정합니다. (해당하는 경우 다른 계정을 선택합니다)
6. Create Peering Connection을 클릭합니다.

<Image img={byoc_vpcpeering} size="lg" alt="BYOC Peering Connection 생성" border />

### 피어링 연결 요청 수락 \{#step-3-accept-the-peering-connection-request\}
피어링 계정에서 (VPC -> Peering connections -> Actions -> Accept request) 페이지로 이동하여 이 VPC 피어링 요청을 승인할 수 있습니다.

<Image img={byoc_vpcpeering2} size="lg" alt="BYOC Peering Connection 수락" border />

### ClickHouse VPC 경로 테이블에 대상 추가 \{#step-4-add-destination-to-clickhouse-vpc-route-tables\}
ClickHouse BYOC 계정에서,
1. VPC 대시보드에서 Route Tables를 선택합니다.
2. ClickHouse VPC ID를 검색하고, 프라이빗 서브넷에 연결된 각 경로 테이블을 편집합니다.
3. Routes 탭 아래의 Edit 버튼을 클릭합니다.
4. Add another route를 클릭합니다.
5. Destination에 대상 VPC의 CIDR 범위를 입력합니다.
6. Target에서 「Peering Connection」을 선택하고 피어링 연결의 ID를 선택합니다.

<Image img={byoc_vpcpeering3} size="lg" alt="BYOC 경로 테이블 추가" border />

### 대상 VPC 경로 테이블에 대상 추가 \{#step-5-add-destination-to-the-target-vpc-route-tables\}
피어링된 AWS 계정에서,
1. VPC 대시보드에서 Route Tables를 선택합니다.
2. 대상 VPC ID를 검색합니다.
3. Routes 탭 아래의 Edit 버튼을 클릭합니다.
4. Add another route를 클릭합니다.
5. Destination에 ClickHouse VPC의 CIDR 범위를 입력합니다.
6. Target에서 「Peering Connection」을 선택하고 피어링 연결의 ID를 선택합니다.

<Image img={byoc_vpcpeering4} size="lg" alt="BYOC 경로 테이블 추가" border />

### 피어링된 VPC 액세스를 허용하도록 보안 그룹 편집 \{#step-6-edit-security-group-to-allow-peered-vpc-access\}

ClickHouse BYOC 계정에서 피어링된 VPC로부터의 트래픽을 허용하도록 Security Group 설정을 업데이트해야 합니다. 피어링된 VPC의 CIDR 범위를 포함하는 인바운드 규칙 추가를 요청하려면 ClickHouse Support에 문의하십시오.

---
이제 피어링된 VPC에서 ClickHouse 서비스에 액세스할 수 있습니다.
</VerticalStepper>

ClickHouse에 프라이빗하게 액세스할 수 있도록, 사용자 피어링 VPC에서의 보안 연결을 위해 프라이빗 로드 밸런서와 엔드포인트가 프로비저닝됩니다. 프라이빗 엔드포인트는 퍼블릭 엔드포인트 형식에 `-private` 접미사가 추가된 형태를 따릅니다. 예:

- **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
- **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

선택 사항으로, 피어링이 정상적으로 동작하는 것을 확인한 후 ClickHouse BYOC의 퍼블릭 로드 밸런서 제거를 요청할 수 있습니다.

## PrivateLink 설정 (AWS) \{#setup-privatelink\}

AWS PrivateLink은 VPC 피어링이나 인터넷 게이트웨이 없이도 ClickHouse BYOC 서비스에 대한 안전한 프라이빗 연결을 제공합니다. 트래픽은 AWS 네트워크 내에서만 흐르며, 공용 인터넷을 통과하지 않습니다.

<VerticalStepper headerLevel="h3">

### PrivateLink 설정 요청 \{#step-1-request-privatelink-setup\}

BYOC 배포에 대한 PrivateLink 설정을 요청하려면 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud)에 문의하십시오. 이 단계에서는 별도의 구체적인 정보가 필요하지 않으며, PrivateLink 연결을 설정하려 한다는 점만 알리면 됩니다.

ClickHouse Support는 **프라이빗 로드 밸런서**와 **PrivateLink 서비스 엔드포인트**를 포함한 필요한 인프라 구성 요소를 활성화합니다.

### VPC에 엔드포인트 생성 \{#step-2-create-endpoint\}

ClickHouse Support 측에서 PrivateLink가 활성화된 후, ClickHouse PrivateLink 서비스에 연결하기 위해 클라이언트 애플리케이션 VPC에 VPC 엔드포인트를 생성해야 합니다.

1. **엔드포인트 서비스 이름 확인**:
   - ClickHouse Support가 엔드포인트 서비스 이름을 제공합니다.
   - AWS VPC 콘솔의 「Endpoint Services」에서 해당 이름을 확인할 수도 있습니다(서비스 이름으로 필터링하거나 ClickHouse 서비스를 찾으십시오).

<Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink Service Endpoint" border />

2. **VPC 엔드포인트 생성**:
   - AWS VPC 콘솔 → 「Endpoints」 → 「Create Endpoint」로 이동합니다.
   - 「Find service by name」을 선택하고 ClickHouse Support에서 제공한 엔드포인트 서비스 이름을 입력합니다.
   - VPC를 선택하고 서브넷을 선택합니다(가용 영역마다 하나씩 선택하는 것을 권장합니다).
   - **중요**: 엔드포인트에 대해 「Private DNS names」를 활성화하십시오. DNS 해석이 올바르게 동작하려면 이 설정이 필요합니다.
   - 엔드포인트용 보안 그룹을 선택하거나 생성합니다.
   - 「Create Endpoint」를 클릭합니다.

:::important
**DNS 요구 사항**: 
- VPC 엔드포인트를 생성할 때 「Private DNS names」를 활성화하십시오.
- VPC 설정에서 「DNS Hostnames」가 활성화되어 있는지 확인하십시오(VPC Settings → DNS resolution 및 DNS hostnames).

이 설정은 PrivateLink DNS가 올바르게 동작하는 데 필요합니다.
:::

3. **엔드포인트 연결 승인**:
   - 엔드포인트를 생성한 후, 연결 요청을 승인해야 합니다.
   - VPC 콘솔에서 「Endpoint Connections」로 이동합니다. 
   - ClickHouse에서 온 연결 요청을 찾아 「Accept」를 클릭하여 승인합니다.

<Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink Approve" border />

### 서비스 허용 목록에 엔드포인트 ID 추가 \{#step-3-add-endpoint-id-allowlist\}

VPC 엔드포인트가 생성되고 연결이 승인된 후, PrivateLink를 통해 액세스하려는 각 ClickHouse 서비스의 허용 목록(allowlist)에 엔드포인트 ID를 추가해야 합니다.

1. **엔드포인트 ID 확인**:
   - AWS VPC 콘솔에서 「Endpoints」로 이동합니다.
   - 새로 생성한 엔드포인트를 선택합니다.
   - 엔드포인트 ID를 복사합니다(예: `vpce-xxxxxxxxxxxxxxxxx` 형식).

2. **ClickHouse Support에 문의**:
   - 엔드포인트 ID를 ClickHouse Support에 전달합니다.
   - 이 엔드포인트에서 어떤 ClickHouse 서비스에 대한 액세스를 허용해야 하는지 명시합니다.
   - ClickHouse Support는 서비스 허용 목록에 해당 엔드포인트 ID를 추가합니다.

### PrivateLink를 통해 ClickHouse에 연결 \{#step-4-connect-via-privatelink\}

엔드포인트 ID가 허용 목록에 추가되면, PrivateLink 엔드포인트를 사용하여 ClickHouse 서비스에 연결할 수 있습니다.

PrivateLink 엔드포인트 형식은 공용 엔드포인트와 유사하지만, `vpce` 서브도메인이 포함됩니다. 예시는 다음과 같습니다.

- **공용 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink 엔드포인트**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

VPC 내 DNS 해석은 `vpce` 서브도메인 형식을 사용할 때 트래픽을 자동으로 PrivateLink 엔드포인트를 통해 라우팅합니다.

</VerticalStepper>

### PrivateLink 액세스 제어 \{#privatelink-access-control\}

PrivateLink를 통해 ClickHouse 서비스에 대한 액세스는 두 가지 수준에서 제어합니다:

1. **Istio Authorization Policy**: ClickHouse Cloud의 서비스 수준 권한 부여 정책
2. **VPC Endpoint Security Group**: VPC 엔드포인트에 연결된 보안 그룹이 VPC 내에서 어떤 리소스가 해당 엔드포인트를 사용할 수 있는지 제어합니다

:::note
프라이빗 로드 밸런서의 「Enforce inbound rules on PrivateLink traffic」 기능은 비활성화되어 있으므로, 액세스는 Istio 권한 부여 정책과 VPC 엔드포인트 보안 그룹에 의해서만 제어됩니다.
:::

### PrivateLink DNS \{#privatelink-dns\}

BYOC 엔드포인트용 PrivateLink DNS(`*.vpce.{subdomain}` 형식 사용)은 AWS PrivateLink의 기본 제공 기능인 「Private DNS names」를 활용합니다. Route 53 레코드는 필요하지 않으며, 다음 조건이 충족되면 DNS 이름 확인이 자동으로 수행됩니다.

- VPC 엔드포인트에서 「Private DNS names」가 활성화되어 있음
- VPC에서 「DNS Hostnames」가 활성화되어 있음

이를 통해 `vpce` 서브도메인을 사용하는 연결은 추가 DNS 구성이 없어도 자동으로 PrivateLink 엔드포인트를 통해 라우팅됩니다.

## VPC 피어링(GCP) 및 Private Service Connect(GCP) \{#setup-gcp\}

GCP VPC 피어링과 Private Service Connect는 GCP 기반 BYOC 배포에서 유사한 프라이빗 연결을 제공합니다. 이 기능은 현재 개발 중입니다. GCP BYOC 배포에서 VPC 피어링이나 Private Service Connect가 필요한 경우, 사용 가능 여부와 설정 요건을 논의하기 위해 [ClickHouse Support에 문의](https://clickhouse.com/cloud/bring-your-own-cloud)하십시오.