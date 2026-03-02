---
title: 'ClickHouse에 연결하기'
slug: /cloud/reference/byoc/connect
sidebar_label: 'ClickHouse에 연결하기'
keywords: ['BYOC', 'cloud', '사용자 소유 Cloud', 'ClickHouse에 연결', '로드 밸런서', 'PrivateLink']
description: '공용, 프라이빗 또는 PrivateLink 엔드포인트를 통해 BYOC ClickHouse 서비스에 연결합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_connect_1 from '@site/static/images/cloud/reference/byoc-connect-1.png';

이 페이지에서는 BYOC 환경에서 ClickHouse 서비스에 연결하는 다양한 방법을 설명합니다. 보안 및 네트워크 요구 사항에 따라 공용 로드 밸런서, 사설 로드 밸런서 또는 PrivateLink/Private Service Connect 엔드포인트 중에서 선택할 수 있습니다.


## 공용 로드 밸런서 \{#public-load-balancer\}

공용 로드 밸런서는 인터넷을 통해 ClickHouse 서비스에 외부에서 접근할 수 있도록 합니다. ClickHouse에서 관리되는 전용 VPC를 사용할 때 기본 구성입니다.

### 개요 \{#public-load-balancer-overview\}

- **접근**: 공용 인터넷에서 접근할 수 있습니다.
- **사용 사례**: 여러 위치나 네트워크에서 연결해야 하는 애플리케이션 및 사용자에 적합합니다.
- **보안**: TLS 암호화 및 IP 필터링(권장)을 통해 보호됩니다.

### Public Load Balancer를 통한 연결 \{#connecting-via-public-load-balancer\}

공용 엔드포인트를 사용하여 ClickHouse 서비스에 연결하려면 다음과 같이 합니다:

1. ClickHouse Cloud 콘솔에서 **서비스 엔드포인트를 확인**합니다. 이 엔드포인트는 서비스의 「Connect」 섹션에 표시됩니다.

<Image img={byoc_connect_1} size="lg" alt="BYOC connection" background="black" />

예를 들어 다음과 같습니다:

```text
sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com
```


### IP 필터링 \{#public-ip-filtering\}

공용 로드 밸런서를 사용할 때 허용된 IP 주소 또는 CIDR 범위로만 접근을 제한하기 위해 IP 필터링(IP Access List)을 구성할 것을 **강력히 권장합니다**.

IP 필터링에 대한 자세한 내용은 [IP Access List 문서](https://clickhouse.com/docs/cloud/security/setting-ip-filters)를 참조하십시오.

## 프라이빗 로드 밸런서 \{#private-load-balancer\}

프라이빗 로드 밸런서는 연결된 네트워크(예: 피어링된 VPC) 내에서만 접근 가능한 ClickHouse 서비스용 내부 엔드포인트를 제공합니다. 이는 고객이 관리하는 VPC를 사용할 때 기본 구성입니다.

### 개요 \{#private-load-balancer-overview\}

- **액세스**: 프라이빗 네트워크 인프라 내부에서만 접근할 수 있습니다.
- **사용 사례**: 동일한 Cloud 환경 내에서 실행되거나 VPC 피어링으로 연결된 애플리케이션에 적합합니다.
- **보안**: 트래픽이 프라이빗 네트워크 내부에만 머물며 퍼블릭 인터넷으로 노출되지 않습니다.

### 프라이빗 로드 밸런서를 통한 연결 \{#connecting-via-private-load-balancer\}

프라이빗 엔드포인트를 사용해 연결하려면:

1. **프라이빗 로드 밸런서 활성화**(아직 활성화하지 않은 경우). 배포에 대해 [프라이빗 로드 밸런서를 활성화](/cloud/reference/byoc/configurations#load-balancers)해야 하는 경우 ClickHouse Support에 문의하십시오.
2. **네트워크 연결 확인**:
   - VPC 피어링: VPC 피어링 구성을 완료합니다(참고: [프라이빗 네트워킹 설정](/cloud/reference/byoc/onboarding/network))
   - 기타 프라이빗 네트워크: BYOC VPC에 도달할 수 있도록 라우팅이 구성되어 있는지 확인합니다.
3. **프라이빗 엔드포인트 확인**: 
   프라이빗 엔드포인트는 서비스의 「Connect」 섹션에 있는 ClickHouse Cloud 콘솔에서 확인할 수 있습니다. 프라이빗 엔드포인트는 퍼블릭 엔드포인트와 동일한 형식을 따르되, 서비스 ID 부분에 `-private` 접미사가 추가됩니다. 예를 들면 다음과 같습니다.
   - **퍼블릭 엔드포인트**: `sb9jmrq2ne.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`
   - **프라이빗 엔드포인트**: `sb9jmrq2ne-private.asf3kcggao.ap-southeast-1.aws.clickhouse-byoc.com`

### IP 필터링 \{#private-ip-filtering\}

프라이빗 로드 밸런서는 기본적으로 내부 네트워크로만 접근을 제한하지만, 프라이빗 네트워크 내에서 어떤 원본에서 연결할 수 있는지를 더욱 세밀하게 제어하기 위해 IP 필터링을 추가로 설정할 수 있습니다. 프라이빗 로드 밸런서의 IP 필터링은 퍼블릭 로드 밸런서와 동일한 구성 메커니즘을 사용합니다. 허용할 IP 주소 또는 CIDR 범위를 정의하면 ClickHouse Cloud가 각 엔드포인트 유형에 적절하게 해당 규칙을 적용합니다. 플랫폼은 퍼블릭 CIDR 범위와 프라이빗 CIDR 범위를 자동으로 구분하여, 각각을 해당 로드 밸런서 엔드포인트에 할당합니다. 자세한 내용은 [IP Access List 문서](https://clickhouse.com/docs/cloud/security/setting-ip-filters)를 참조하십시오. 

### 보안 그룹 구성 \{#security-group-configuration\}

AWS에 배포하는 경우 프라이빗 로드 밸런서의 보안 그룹이 어떤 네트워크에서 엔드포인트에 접근할 수 있는지를 제어합니다. 기본적으로 BYOC VPC 내부 트래픽만 허용됩니다.

자세한 내용은 [프라이빗 로드 밸런서 보안 그룹 구성](https://clickhouse.com/docs/cloud/reference/byoc/configurations#private-load-balancer-security-group)을 참조하십시오.

## PrivateLink 또는 Private Service Connect \{#privatelink-or-private-service-connect\}

AWS PrivateLink과 GCP Private Service Connect는 가장 안전한 연결 방식으로, VPC 피어링이나 인터넷 게이트웨이 없이도 ClickHouse 서비스에 비공개로 접근할 수 있게 해줍니다.

### 개요 \{#privatelink-overview\}

- **접근 방식**: 클라우드 제공업체의 관리형 서비스를 통한 프라이빗 연결
- **네트워크 격리**: 트래픽이 퍼블릭 인터넷을 전혀 통과하지 않습니다
- **사용 사례**: 최대 수준의 보안과 네트워크 격리가 필요한 엔터프라이즈 배포 환경
- **이점**: 
  - VPC 피어링이 필요하지 않음
  - 네트워크 아키텍처 단순화
  - 보안 및 컴플라이언스 수준 향상

### PrivateLink/Private Service Connect를 통한 연결 \{#connecting-via-privatelink\}

[프라이빗 네트워킹 설정](/cloud/reference/byoc/onboarding/network)을 참고하여 PrivateLink 또는 Private Service Connect 설정을 완료하십시오. 구성이 완료되면 PrivateLink 전용 엔드포인트 형식을 사용하여 ClickHouse 서비스에 연결할 수 있습니다. PrivateLink 엔드포인트에는 트래픽이 VPC 엔드포인트를 통해 라우팅됨을 나타내기 위해 `vpce` 서브도메인이 포함됩니다. VPC에서의 DNS 조회는 자동으로 트래픽을 PrivateLink 엔드포인트를 통해 라우팅합니다.

PrivateLink 엔드포인트 형식은 퍼블릭 엔드포인트와 유사하지만, 서비스 서브도메인과 BYOC 인프라 서브도메인 사이에 `vpce` 서브도메인이 포함됩니다. 예는 다음과 같습니다.

- **퍼블릭 엔드포인트**: `h5ju65kv87.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`
- **PrivateLink 엔드포인트**: `h5ju65kv87.vpce.mhp0y4dmph.us-west-2.aws.clickhouse-byoc.com`

### Endpoint ID 허용 목록 \{#endpoint-id-allowlist\}

PrivateLink 또는 Private Service Connect를 사용하려면 클라이언트 연결에 사용되는 Endpoint ID가 각 ClickHouse 서비스별로 명시적으로 허용되어야 합니다. ClickHouse Support에 문의하여 Endpoint ID를 제공하면 해당 ID를 서비스 허용 목록에 추가해 드립니다.

자세한 설정 방법은 [프라이빗 네트워킹 설정 가이드](/cloud/reference/byoc/onboarding/network)를 참고하십시오.

## 적절한 연결 방식 선택 \{#choosing-connection-method\}

| 연결 방식 | 보안 수준 | 네트워크 요구 사항 | 사용 사례 |
|------------------|----------------|---------------------|----------|
| **Public Load Balancer** | 중간 (IP 필터링 사용 시) | 인터넷 접속 | 여러 위치에 있는 애플리케이션/사용자 |
| **Private Load Balancer** | 높음 | VPC 피어링 또는 프라이빗 네트워크 | 동일한 클라우드 환경의 애플리케이션 |
| **PrivateLink/Private Service Connect** | 최고 | 클라우드 제공자가 관리하는 서비스 | 최대 수준의 격리가 필요한 엔터프라이즈급 배포 |

## 연결 문제 해결 \{#troubleshooting\}

연결 문제가 발생하는 경우에는 다음을 확인합니다.

1. **엔드포인트 접근 가능 여부 확인**: 올바른 엔드포인트(공용 vs. 프라이빗)를 사용하고 있는지 확인합니다.
2. **IP 필터 확인**: 공용 로드 밸런서의 경우, IP 주소가 허용 목록(allowlist)에 포함되어 있는지 확인합니다.
3. **네트워크 연결 확인**: 프라이빗 연결의 경우, VPC 피어링 또는 PrivateLink가 올바르게 구성되어 있는지 확인합니다.
4. **보안 그룹 확인**: 프라이빗 로드 밸런서의 경우, 소스 네트워크에서의 트래픽을 허용하도록 보안 그룹 규칙이 설정되어 있는지 확인합니다.
4. **보안 그룹 확인**: PrivateLink 또는 Private Service Connect의 경우, 엔드포인트 ID가 ClickHouse 서비스의 허용 목록(allowlist)에 추가되어 있는지 확인합니다.
5. **인증 정보 검토**: 올바른 자격 증명(사용자 이름과 비밀번호)을 사용하고 있는지 확인합니다.
6. **지원팀에 문의**: 문제가 계속되면 ClickHouse Support에 문의합니다.