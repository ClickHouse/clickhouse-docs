---
title: '맞춤형 설정'
slug: /cloud/reference/byoc/onboarding/customization
sidebar_label: '맞춤형 설정'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding']
description: '사용자 Cloud 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png'


## 고객 관리 VPC (BYO-VPC) \{#customer-managed-vpc\}

:::note
현재는 **AWS**에서만 지원합니다. GCP 지원은 로드맵에 포함되어 있습니다.
:::

ClickHouse Cloud가 새 VPC를 프로비저닝하도록 하는 대신, 기존 VPC를 사용하여 ClickHouse BYOC를 배포하려는 경우 아래 단계를 따르십시오. 이 방식은 네트워크 구성을 더 세밀하게 제어할 수 있게 해 주며, 기존 네트워크 인프라에 ClickHouse BYOC를 통합할 수 있도록 합니다.

### 기존 VPC 구성 \{#configure-existing-vpc\}

1. VPC에 `clickhouse-byoc="true"` 태그를 추가합니다.
2. ClickHouse Cloud에서 사용할 수 있도록 서로 다른 3개의 가용 영역에 최소 3개의 프라이빗 서브넷을 할당합니다.
3. ClickHouse 배포에 충분한 IP 주소를 제공하려면 각 서브넷이 최소 `/23`(예: 10.0.0.0/23) CIDR 범위를 가지도록 합니다.
4. 적절한 로드 밸런서 구성을 위해 각 서브넷에 `kubernetes.io/role/internal-elb=1` 및 `clickhouse-byoc="true"` 태그를 추가합니다.

<Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 서브넷" />

<Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 서브넷 태그" />

### S3 게이트웨이 엔드포인트 구성 \{#configure-s3-endpoint\}

VPC에 아직 S3 게이트웨이 엔드포인트가 구성되어 있지 않다면, VPC와 Amazon S3 간 보안이 보장되는 비공개 통신을 사용할 수 있도록 엔드포인트를 생성해야 합니다. 이 엔드포인트를 통해 ClickHouse 서비스가 퍼블릭 인터넷을 거치지 않고 S3에 접근할 수 있습니다. 예시 구성은 아래 스크린샷을 참고하십시오.

<Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 Endpoint" />

### 네트워크 연결 확인 \{#ensure-network-connectivity\}

**아웃바운드 인터넷 접속**  
VPC는 최소한 아웃바운드 인터넷 접속을 허용하여 ClickHouse BYOC 구성 요소가 Tailscale 제어 플레인과 통신할 수 있도록 해야 합니다. Tailscale은 비공개 관리 작업을 위한 안전한 제로 트러스트 네트워킹을 제공하는 데 사용됩니다. Tailscale과의 초기 등록 및 설정에는 퍼블릭 인터넷 연결이 필요하며, 이는 직접 연결 또는 NAT 게이트웨이를 통해 구성할 수 있습니다. 이러한 연결은 BYOC 배포의 프라이버시와 보안을 모두 유지하는 데 필요합니다.

**DNS 이름 해석(DNS Resolution)**  
VPC에서 DNS 이름 해석이 정상적으로 동작하며, 표준 DNS 이름을 차단·방해·덮어쓰지 않도록 구성되어 있는지 확인하십시오. ClickHouse BYOC는 Tailscale 제어 서버와 ClickHouse 서비스 엔드포인트의 이름을 해석하기 위해 DNS에 의존합니다. DNS를 사용할 수 없거나 잘못 구성된 경우 BYOC 서비스가 연결에 실패하거나 정상적으로 동작하지 않을 수 있습니다.

### AWS 계정 구성 \{#configure-aws-account\}

기존 VPC에 ClickHouse Cloud를 배포하려면 AWS 계정 내에서 필요한 IAM 권한을 부여해야 합니다. 이는 표준 온보딩 절차와 마찬가지로 부트스트랩 CloudFormation 스택 또는 Terraform 모듈을 실행하여 수행됩니다.

1. 필요한 IAM 역할을 생성하기 위해 [CloudFormation 템플릿](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc_v2.yaml) 또는 [Terraform 모듈](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)을 배포합니다.
2. ClickHouse Cloud가 사용자 관리 VPC를 변경할 수 있는 권한을 부여받지 않도록 `IncludeVPCWritePermissions` 매개변수를 `false`로 설정합니다.
3. 이렇게 하면 AWS 계정에 `ClickHouseManagementRole`이 생성되며, BYOC 배포를 프로비저닝하고 관리하는 데 필요한 최소 권한만 ClickHouse Cloud에 부여됩니다.

:::note
VPC는 사용자가 제어하지만, ClickHouse Cloud가 Kubernetes 클러스터, 서비스 계정을 위한 IAM 역할, S3 버킷 및 기타 필수 리소스를 AWS 계정 내에서 생성하고 관리하려면 여전히 IAM 권한이 필요합니다.
:::

### ClickHouse 지원팀에 문의 \{#contact-clickhouse-support\}

위의 구성 단계를 완료한 후, 다음 정보를 포함하여 지원 티켓을 생성하십시오:

* AWS 계정 ID
* 서비스를 배포하려는 AWS 리전
* VPC ID
* ClickHouse에 할당한 Private Subnet ID
* 해당 Subnet이 위치한 가용 영역(Availability Zone)

당사 팀에서 구성을 검토한 뒤, 나머지 프로비저닝을 완료합니다. 

## 고객 관리 IAM 역할 \{#customer-managed-iam-roles\}

고급 보안 요구 사항이나 엄격한 컴플라이언스 정책이 있는 조직의 경우, ClickHouse Cloud가 IAM 역할을 생성하도록 하는 대신 자체 IAM 역할을 제공할 수 있습니다. 이 방식은 IAM 권한에 대한 완전한 제어권을 제공하며, 조직의 보안 정책을 엄격히 적용할 수 있도록 해줍니다.

:::info
고객 관리 IAM 역할은 현재 비공개 프리뷰 단계입니다. 이 기능이 필요하면, 구체적인 요구 사항과 일정에 대해 논의할 수 있도록 ClickHouse Support로 문의하십시오.

이 기능이 사용 가능해지면 다음을 수행할 수 있습니다:

* ClickHouse Cloud에서 사용할 사전 구성된 IAM 역할 제공
* 교차 계정 액세스에 사용되는 `ClickHouseManagementRole`의 IAM 관련 권한에 대한 쓰기 권한 제거
* 역할 권한과 신뢰 관계에 대한 완전한 제어 유지
:::

기본적으로 ClickHouse Cloud가 생성하는 IAM 역할에 대한 자세한 내용은 [BYOC Privilege Reference](/cloud/reference/byoc/reference/priviledge)를 참조하십시오.