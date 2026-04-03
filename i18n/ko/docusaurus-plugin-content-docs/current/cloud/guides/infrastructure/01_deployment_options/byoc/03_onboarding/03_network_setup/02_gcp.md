---
title: 'BYOC GCP 프라이빗 네트워킹 설정'
slug: /cloud/reference/byoc/onboarding/network-gcp
sidebar_label: 'GCP 프라이빗 네트워킹 설정'
keywords: ['BYOC', '클라우드', '자체 클라우드 환경', 'VPC 피어링', 'gcp', 'private service connect']
description: 'GCP에서 BYOC용 VPC 피어링 또는 Private Service Connect를 설정합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_vpcpeering from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-1.png';
import byoc_vpcpeering2 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-2.png';
import byoc_vpcpeering3 from '@site/static/images/cloud/reference/byoc-vpcpeering-gcp-3.png';
import byoc_privatelink_1 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-1.png';
import byoc_privatelink_2 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-2.png';
import byoc_privatelink_3 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-3.png';
import byoc_privatelink_4 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-4.png';
import byoc_privatelink_5 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-5.png';
import byoc_privatelink_6 from '@site/static/images/cloud/reference/byoc-privatelink-gcp-6.png';

GCP의 ClickHouse BYOC는 VPC 피어링과 Private Service Connect를 포함해 2가지 프라이빗 연결 옵션을 지원합니다. 트래픽은 전적으로 GCP 네트워크 내부에서만 흐르며, 퍼블릭 인터넷을 통과하지 않습니다.

## 사전 요구 사항 \{#common-prerequisites\}

VPC 피어링과 Private Service Connect 모두에 필요한 공통 단계입니다.

### ClickHouse BYOC용 프라이빗 로드 밸런서 활성화 \{#step-enable-private-load-balancer-for-clickhouse-byoc\}

프라이빗 로드 밸런서를 활성화하려면 ClickHouse 지원팀에 문의하십시오.

## VPC 피어링 설정하기 \{#gcp-vpc-peering\}

[GCP VPC 피어링 기능](https://docs.cloud.google.com/vpc/docs/vpc-peering)을 먼저 숙지하고, VPC 피어링의 제한 사항(예: 피어링된 VPC 네트워크 간에는 서브넷 IP 범위가 서로 겹칠 수 없음)을 확인하십시오. ClickHouse BYOC는 프라이빗 로드 밸런서를 사용하여 피어링을 통해 ClickHouse 서비스에 네트워크로 연결할 수 있도록 합니다.

ClickHouse BYOC용 VPC 피어링을 생성하거나 삭제하려면 다음 단계를 따르십시오.

:::note
다음 예시는 단순한 시나리오를 기준으로 합니다. 온프레미스 연결과 피어링하는 경우와 같은 고급 시나리오에서는 일부 조정이 필요할 수 있습니다.
:::

<VerticalStepper headerLevel="h3">
  ### 피어링 연결 생성하기 \{#step-1-create-a-peering-connection\}

  이 예시에서는 BYOC VPC 네트워크와 기존의 다른 VPC 네트워크 간 피어링을 설정합니다.

  1. ClickHouse BYOC Google Cloud 프로젝트에서 &quot;VPC Network&quot;로 이동합니다.
  2. &quot;VPC network peering&quot;을 선택합니다.
  3. &quot;Create connection&quot;을 클릭합니다.
  4. 요구 사항에 맞게 필요한 필드를 입력합니다. 아래는 동일한 GCP 프로젝트 내에서 피어링을 생성하는 화면 예시입니다.

  <Image img={byoc_vpcpeering} size="md" alt="BYOC 피어링 연결 생성" border />

  GCP VPC 피어링이 작동하려면 두 네트워크 사이에 2개의 연결이 필요합니다(즉, BYOC 네트워크에서 기존 VPC 네트워크로 향하는 연결 1개와 기존 VPC 네트워크에서 BYOC 네트워크로 향하는 연결 1개). 따라서 반대 방향으로도 동일하게 연결을 1개 더 생성해야 합니다. 아래는 두 번째 피어링 연결 생성 화면 예시입니다.

  <Image img={byoc_vpcpeering2} size="md" alt="BYOC 피어링 연결 수락" border />

  두 연결이 모두 생성되면 Google Cloud Console 웹페이지를 새로고침한 후 두 연결의 상태가 &quot;Active&quot;가 되어야 합니다.

  <Image img={byoc_vpcpeering3} size="lg" alt="BYOC 피어링 연결 수락" border />

  이제 피어링된 VPC에서 ClickHouse 서비스에 액세스할 수 있어야 합니다.

  ### 피어링 연결을 통해 ClickHouse 서비스에 액세스하기 \{#step-2-access-ch-service-via-peering\}

  ClickHouse에 프라이빗하게 액세스할 수 있도록, 사용자의 피어링된 VPC에서 안전하게 연결할 수 있는 프라이빗 로드 밸런서와 엔드포인트가 프로비저닝됩니다. 프라이빗 엔드포인트는 퍼블릭 엔드포인트 형식을 따르며 `-private` 접미사가 추가됩니다. 예를 들면 다음과 같습니다.

  * **퍼블릭 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
  * **프라이빗 엔드포인트**: `h5ju65kv87-private.mhp0y4dmph.us-east1.gcp.byoc.clickhouse.cloud`
</VerticalStepper>

## PSC(Private Service Connect) 설정 \{#gcp-psc\}

GCP PSC(Private Service Connect)는 VPC 피어링이나 인터넷 게이트웨이 없이 ClickHouse BYOC 서비스에 안전한 프라이빗 연결을 제공합니다.

<VerticalStepper headerLevel="h3">
  ### PSC 서비스 설정 요청 \{#step-1-request-psc-setup\}

  BYOC 배포를 위한 PSC 서비스 설정을 요청하려면 [ClickHouse Support](https://clickhouse.com/cloud/bring-your-own-cloud)에 문의하십시오. 이 단계에서는 별도의 구체적인 정보가 필요하지 않으며, PSC 연결을 설정하려 한다는 점만 알려주면 됩니다.

  ClickHouse Support는 **프라이빗 로드 밸런서** 및 **PSC 서비스**를 포함한 필요한 인프라 구성 요소를 활성화합니다.

  ### GCP PSC 서비스 이름 및 DNS 이름 확인 \{#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect\}

  ClickHouse Support가 PSC 서비스 이름을 제공합니다. 또는 ClickHouse Cloud 콘솔에서 &quot;Organization&quot; -&gt; &quot;Infrastructure&quot;로 이동한 다음 인프라 이름을 클릭하여 세부 정보를 확인할 수도 있습니다.

  <Image img={byoc_privatelink_1} size="lg" alt="BYOC PSC 엔드포인트" border />

  <Image img={byoc_privatelink_2} size="lg" alt="BYOC PSC 엔드포인트" border />

  또한 GCP Private Service Connect 콘솔의 &quot;Published services&quot;에서도 PSC 서비스 이름을 확인할 수 있습니다(서비스 이름으로 필터링하거나 ClickHouse 서비스를 찾으십시오).

  <Image img={byoc_privatelink_3} size="lg" alt="BYOC PSC 엔드포인트" border />

  <Image img={byoc_privatelink_4} size="lg" alt="BYOC PSC 엔드포인트" border />

  ### 네트워크에 PSC 엔드포인트 생성하기 \{#step-3-create-endpoint\}

  ClickHouse Support 측에서 PSC 서비스를 활성화하면, ClickHouse PSC 서비스에 연결하기 위해 클라이언트 애플리케이션 네트워크에 PSC 엔드포인트를 생성해야 합니다.

  1. **PSC 엔드포인트 생성**:

  * GCP Console -&gt; Network Services → Private Service Connect → Connect Endpoint로 이동합니다
  * &quot;Target&quot;에서 &quot;Published service&quot;를 선택하고, 이전 단계에서 확인한 PSC 서비스 이름을 &quot;Target details&quot;에 입력합니다
  * 유효한 엔드포인트 이름을 입력합니다
  * 네트워크를 선택하고 서브넷을 선택합니다(클라이언트 애플리케이션이 연결할 네트워크입니다)
  * 엔드포인트에 사용할 IP 주소를 선택하거나 새로 생성합니다. 이 IP 주소는 [엔드포인트에 프라이빗 DNS 이름 설정](#step-4-set-private-dns-name-for-endpoint) 단계에서 사용됩니다
  * &quot;Add Endpoint&quot;를 클릭한 후 엔드포인트가 생성될 때까지 잠시 기다립니다.
  * 엔드포인트 상태는 &quot;Accepted&quot;가 되어야 합니다. 자동으로 승인되지 않으면 ClickHouse Support에 문의하십시오.

  <Image img={byoc_privatelink_5} size="lg" alt="BYOC PSC 엔드포인트 생성" border />

  2. **PSC Connection ID 확인**:

  * 엔드포인트 세부 정보로 이동하여 [서비스 허용 목록에 엔드포인트의 PSC Connection ID 추가](#step-5-add-endpoint-id-allowlist) 단계에서 사용할 &quot;PSC Connection ID&quot;를 확인합니다

  <Image img={byoc_privatelink_6} size="lg" alt="BYOC PSC 엔드포인트 세부 정보" border />

  ### 엔드포인트에 프라이빗 DNS 이름 설정 \{#step-4-set-private-dns-name-for-endpoint\}

  :::note
  DNS를 구성하는 방법은 여러 가지입니다. 환경에 맞게 DNS를 설정하십시오.
  :::

  [GCP PSC 서비스 이름 및 DNS 이름 확인](#step-2-obtain-gcp-service-attachment-and-dns-name-for-private-service-connect) 단계에서 확인한 &quot;DNS name&quot;의 모든 서브도메인(와일드카드)이 GCP PSC 엔드포인트 IP 주소를 가리키도록 설정해야 합니다. 이렇게 해야 VPC/네트워크 내의 서비스/구성 요소가 해당 이름을 올바르게 해석할 수 있습니다.

  ### 서비스 허용 목록에 엔드포인트의 PSC Connection ID 추가 \{#step-5-add-endpoint-id-allowlist\}

  PSC 엔드포인트가 생성되고 상태가 &quot;Accepted&quot;가 되면, PSC를 통해 액세스하려는 **각 ClickHouse 서비스**의 허용 목록에 엔드포인트의 PSC Connection ID를 추가해야 합니다.

  **ClickHouse Support에 문의**:

  * 엔드포인트의 PSC Connection ID를 ClickHouse Support에 제공합니다
  * 이 엔드포인트의 액세스를 허용할 ClickHouse 서비스를 지정합니다
  * ClickHouse Support가 서비스 허용 목록에 엔드포인트 Connection ID를 추가합니다

  ### PSC를 통해 ClickHouse에 연결 \{#step-6-connect-via-psc-endpoint\}

  엔드포인트 Connection ID가 허용 목록에 추가되면, PSC 엔드포인트를 사용하여 ClickHouse 서비스에 연결할 수 있습니다.

  PSC 엔드포인트 형식은 퍼블릭 엔드포인트와 유사하지만 `p` 서브도메인이 포함됩니다. 예를 들면 다음과 같습니다:

  * **퍼블릭 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
  * **PSC 엔드포인트**: `h5ju65kv87.p.mhp0y4dmph.us-east1.gcp.clickhouse-byoc.com`
</VerticalStepper>