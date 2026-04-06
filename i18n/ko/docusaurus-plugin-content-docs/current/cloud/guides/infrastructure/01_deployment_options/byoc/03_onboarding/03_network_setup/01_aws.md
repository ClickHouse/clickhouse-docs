---
title: 'BYOC AWS 프라이빗 네트워킹 설정'
slug: /cloud/reference/byoc/onboarding/network-aws
sidebar_label: 'AWS 프라이빗 네트워킹 설정'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'vpc peering', 'aws', 'privatelink']
description: 'AWS에서 BYOC를 위한 VPC 피어링 또는 PrivateLink 설정'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-3.png';
import byoc_vpcpeering4 from '@site/static/images/cloud/reference/byoc-vpcpeering-4.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-2.png';

AWS의 ClickHouse BYOC에서는 VPC 피어링과 AWS PrivateLink를 포함한 2가지 프라이빗 연결 옵션을 지원합니다.

## 사전 요구 사항 \{#common-prerequisites\}

VPC 피어링과 PrivateLink에 공통으로 필요한 단계입니다.

### ClickHouse BYOC용 프라이빗 로드 밸런서 활성화 \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

프라이빗 로드 밸런서를 활성화하려면 ClickHouse Support에 문의하십시오.

## VPC 피어링 설정하기 \{#aws-vpc-peering\}

ClickHouse BYOC에 대한 VPC 피어링을 생성하거나 삭제하려면 다음 단계를 따르십시오.

<VerticalStepper headerLevel="h3">
  ### 피어링 연결 생성하기 \{#step-1-create-a-peering-connection\}

  1. ClickHouse BYOC 계정의 VPC Dashboard로 이동합니다.
  2. Peering Connections를 선택합니다.
  3. Create Peering Connection을 클릭합니다.
  4. VPC Requester를 ClickHouse VPC ID로 설정합니다.
  5. VPC Accepter를 대상 VPC ID로 설정합니다. (해당하는 경우 다른 계정을 선택합니다)
  6. Create Peering Connection을 클릭합니다.

  <Image img={byoc_vpcpeering} size="lg" alt="BYOC 피어링 연결 생성" border />

  ### 피어링 연결 요청 수락하기 \{#step-2-accept-the-peering-connection-request\}

  피어링 계정으로 이동한 후 (VPC -&gt; Peering connections -&gt; Actions -&gt; Accept request) 페이지에서 이 VPC 피어링 요청을 승인할 수 있습니다.

  <Image img={byoc_vpcpeering2} size="lg" alt="BYOC 피어링 연결 수락" border />

  ### ClickHouse VPC 라우팅 테이블에 대상 추가하기 \{#step-3-add-destination-to-clickhouse-vpc-route-tables\}

  ClickHouse BYOC 계정에서,

  1. VPC Dashboard에서 Route Tables를 선택합니다.
  2. ClickHouse VPC ID를 검색합니다. 프라이빗 서브넷에 attached 상태인 각 라우팅 테이블을 편집합니다.
  3. Routes 탭 아래의 Edit 버튼을 클릭합니다.
  4. Add another route를 클릭합니다.
  5. Destination에 대상 VPC의 CIDR 범위를 입력합니다.
  6. Target에 &quot;Peering Connection&quot;과 피어링 연결 ID를 선택합니다.

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC 라우팅 테이블 추가" border />

  ### 대상 VPC 라우팅 테이블에 대상 추가하기 \{#step-4-add-destination-to-the-target-vpc-route-tables\}

  피어링된 AWS 계정에서,

  1. VPC Dashboard에서 Route Tables를 선택합니다.
  2. 대상 VPC ID를 검색합니다.
  3. Routes 탭 아래의 Edit 버튼을 클릭합니다.
  4. Add another route를 클릭합니다.
  5. Destination에 ClickHouse VPC의 CIDR 범위를 입력합니다.
  6. Target에 &quot;Peering Connection&quot;과 피어링 연결 ID를 선택합니다.

  <Image img={byoc_vpcpeering4} size="lg" alt="BYOC 라우팅 테이블 추가" border />

  ### 피어링된 VPC 액세스를 허용하도록 보안 그룹 편집하기 \{#step-5-edit-security-group-to-allow-peered-vpc-access\}

  ClickHouse BYOC 계정에서는 피어링된 VPC의 트래픽을 허용하도록 Security Group 설정을 업데이트해야 합니다. 피어링된 VPC의 CIDR 범위를 포함하는 인바운드 규칙 추가를 요청하려면 ClickHouse Support에 문의하십시오.

  ***

  이제 피어링된 VPC에서 ClickHouse 서비스에 액세스할 수 있습니다.
</VerticalStepper>

ClickHouse에 프라이빗하게 액세스할 수 있도록, 사용자의 피어링된 VPC에서 안전하게 연결할 수 있는 프라이빗 로드 밸런서와 엔드포인트가 프로비저닝됩니다. 프라이빗 엔드포인트는 퍼블릭 엔드포인트 형식을 따르며 `-private` 접미사가 추가됩니다. 예시는 다음과 같습니다.

* **Public endpoint**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`
* **Private endpoint**: `h5ju65kv87-private.mhp0y4dmph.us-west-2.aws.byoc.clickhouse.cloud`

선택 사항으로, 피어링이 정상적으로 작동하는 것을 확인한 후 ClickHouse BYOC의 퍼블릭 로드 밸런서 제거를 요청할 수 있습니다.

## PrivateLink 설정하기 \{#setup-privatelink\}

AWS PrivateLink는 VPC 피어링이나 인터넷 게이트웨이 없이 ClickHouse BYOC 서비스에 안전한 프라이빗 연결을 제공합니다. 트래픽은 전부 AWS 네트워크 내부에서만 흐르며, 퍼블릭 인터넷을 거치지 않습니다.

<VerticalStepper headerLevel="h3">
  ### PrivateLink 설정 요청하기 \{#step-1-request-privatelink-setup\}

  BYOC 배포에 대한 PrivateLink 설정을 요청하려면 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud)에 문의하십시오. 이 단계에서는 별도의 구체적인 정보가 필요하지 않으며, PrivateLink 연결을 설정하려고 한다는 점만 전달하면 됩니다.

  ClickHouse Support는 **프라이빗 로드 밸런서**와 **PrivateLink 서비스 엔드포인트**를 포함하여 필요한 인프라 구성 요소를 활성화합니다.

  ### VPC에 엔드포인트 생성하기 \{#step-2-create-endpoint\}

  ClickHouse Support 측에서 PrivateLink를 활성화한 후에는 ClickHouse PrivateLink 서비스에 연결하기 위해 클라이언트 애플리케이션 VPC에 VPC 엔드포인트를 생성해야 합니다.

  1. **엔드포인트 서비스 이름 확인**:
     * ClickHouse Support에서 엔드포인트 서비스 이름을 제공합니다
     * AWS VPC 콘솔의 &quot;Endpoint Services&quot;에서도 확인할 수 있습니다(서비스 이름으로 필터링하거나 ClickHouse 서비스를 찾으십시오)

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PrivateLink 서비스 엔드포인트" border />

  2. **VPC 엔드포인트 생성**:
     * AWS VPC Console → Endpoints → Create Endpoint로 이동하십시오
     * &quot;Find service by name&quot;을 선택하고 ClickHouse Support가 제공한 엔드포인트 서비스 이름을 입력하십시오
     * VPC를 선택하고 서브넷을 선택하십시오(가용 영역당 1개를 권장합니다)
     * **중요**: 엔드포인트에서 &quot;Private DNS names&quot;를 활성화하십시오. DNS 확인이 올바르게 작동하려면 이 설정이 필요합니다
     * 엔드포인트에 사용할 보안 그룹을 선택하거나 생성하십시오
     * &quot;Create Endpoint&quot;를 클릭하십시오

  :::important
  **DNS 요구 사항**:

  * VPC 엔드포인트를 생성할 때 &quot;Private DNS names&quot;를 활성화하십시오
  * VPC에서 &quot;DNS Hostnames&quot;가 활성화되어 있는지 확인하십시오(VPC Settings → DNS resolution and DNS hostnames)

  이 설정은 PrivateLink DNS가 올바르게 작동하는 데 필요합니다.
  :::

  3. **엔드포인트 연결 승인**:
     * 엔드포인트를 생성한 후 연결 요청을 승인해야 합니다
     * VPC Console에서 &quot;Endpoint Connections&quot;로 이동하십시오
     * ClickHouse의 연결 요청을 찾아 &quot;Accept&quot;를 클릭하여 승인하십시오

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PrivateLink 승인" border />

  ### 서비스 허용 목록에 엔드포인트 ID 추가하기 \{#step-3-add-endpoint-id-allowlist\}

  VPC 엔드포인트가 생성되고 연결이 승인되면, PrivateLink를 통해 액세스하려는 각 ClickHouse 서비스의 허용 목록에 엔드포인트 ID를 추가해야 합니다.

  1. **엔드포인트 ID 확인**:
     * AWS VPC Console에서 Endpoints로 이동하십시오
     * 새로 생성한 엔드포인트를 선택하십시오
     * 엔드포인트 ID를 복사하십시오(`vpce-xxxxxxxxxxxxxxxxx` 형식입니다)

  2. **ClickHouse Support에 문의**:
     * 엔드포인트 ID를 ClickHouse Support에 제공하십시오
     * 이 엔드포인트에서 액세스를 허용할 ClickHouse 서비스를 지정하십시오
     * ClickHouse Support가 서비스 허용 목록에 엔드포인트 ID를 추가합니다

  ### PrivateLink를 통해 ClickHouse에 연결하기 \{#step-4-connect-via-privatelink\}

  엔드포인트 ID가 허용 목록에 추가되면 PrivateLink 엔드포인트를 사용하여 ClickHouse 서비스에 연결할 수 있습니다.

  PrivateLink 엔드포인트 형식은 퍼블릭 엔드포인트와 비슷하지만 `vpce` 하위 도메인이 포함됩니다. 예를 들면 다음과 같습니다.

  * **퍼블릭 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
  * **PrivateLink 엔드포인트**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

  VPC의 DNS 확인은 `vpce` 하위 도메인 형식을 사용할 때 트래픽을 자동으로 PrivateLink 엔드포인트를 통해 라우팅합니다.
</VerticalStepper>

### PrivateLink 접근 관리 \{#privatelink-access-control\}

PrivateLink를 통한 ClickHouse 서비스 접근은 두 가지 수준에서 제어됩니다.

1. **Istio Authorization Policy**: ClickHouse Cloud의 서비스 수준 권한 부여 정책
2. **VPC Endpoint Security Group**: VPC 엔드포인트에 연결된 보안 그룹이 해당 VPC에서 어떤 리소스가 엔드포인트를 사용할 수 있는지 제어합니다

:::note
프라이빗 로드 밸런서의 &quot;PrivateLink 트래픽에 인바운드 규칙 적용&quot; 기능은 비활성화되어 있으므로, 접근은 Istio 권한 부여 정책과 VPC 엔드포인트의 보안 그룹으로만 제어됩니다.
:::

### PrivateLink DNS \{#privatelink-dns\}

BYOC 엔드포인트용 PrivateLink DNS(`*.vpce.{subdomain}` 형식 사용)는 AWS PrivateLink에 내장된 &quot;Private DNS names&quot; 기능을 활용합니다. Route53 레코드는 필요하지 않으며, 다음 조건이 충족되면 DNS 확인이 자동으로 수행됩니다.

* VPC 엔드포인트에서 &quot;Private DNS names&quot;가 활성화되어 있음
* VPC에서 &quot;DNS Hostnames&quot;가 활성화되어 있음

이를 통해 추가 DNS 설정 없이 `vpce` 하위 도메인을 사용하는 연결이 자동으로 PrivateLink 엔드포인트를 통해 라우팅됩니다.