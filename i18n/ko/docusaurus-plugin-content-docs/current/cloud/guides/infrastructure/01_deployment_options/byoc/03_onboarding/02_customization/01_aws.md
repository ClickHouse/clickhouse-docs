---
title: 'AWS 사용자 지정 설정'
slug: /cloud/reference/byoc/onboarding/customization-aws
sidebar_label: 'AWS 사용자 지정 설정'
keywords: ['BYOC', 'cloud', 'bring your own cloud', '온보딩', 'AWS', 'VPC']
description: '기존 AWS VPC에 ClickHouse BYOC 배포'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_subnet_1 from '@site/static/images/cloud/reference/byoc-subnet-1.png';
import byoc_subnet_2 from '@site/static/images/cloud/reference/byoc-subnet-2.png';
import byoc_s3_endpoint from '@site/static/images/cloud/reference/byoc-s3-endpoint.png';
import byoc_aws_existing_vpc_ui from '@site/static/images/cloud/reference/byoc-aws-existing-vpc-ui.png';


## AWS용 고객 관리형 VPC(BYO-VPC) \{#customer-managed-vpc-aws\}

ClickHouse Cloud가 새 VPC를 프로비저닝하는 대신 기존 VPC를 사용하여 ClickHouse BYOC를 배포하려는 경우, 아래 단계를 따르세요. 이 접근 방식은 네트워크 구성에 대해 더 큰 제어 권한을 제공하며, ClickHouse BYOC를 기존 네트워크 인프라에 통합할 수 있도록 해줍니다.

<VerticalStepper headerLevel="h3">
  ### 기존 VPC 구성

  1. VPC에 `clickhouse-byoc="true"` 태그를 추가합니다.
  2. ClickHouse Cloud에서 사용할 수 있도록 서로 다른 3개의 가용 영역에 걸쳐 최소 3개의 프라이빗 서브넷을 할당합니다.
  3. 각 서브넷에 ClickHouse 배포에 충분한 IP 주소를 제공할 수 있도록 최소 `/23` CIDR 범위(예: 10.0.0.0/23)가 있는지 확인합니다.
  4. 올바른 로드 밸런서 구성이 적용되도록 각 서브넷에 `kubernetes.io/role/internal-elb=1` 및 `clickhouse-byoc="true"` 태그를 추가합니다.

  <Image img={byoc_subnet_1} size="lg" alt="BYOC VPC 서브넷" />

  <Image img={byoc_subnet_2} size="lg" alt="BYOC VPC 서브넷 태그" />

  ### S3 게이트웨이 엔드포인트 구성

  VPC에 S3 게이트웨이 엔드포인트가 아직 구성되어 있지 않다면, VPC와 Amazon S3 간에 안전한 비공개 통신을 사용하려면 이를 생성해야 합니다. 이 엔드포인트를 사용하면 ClickHouse 서비스가 공용 인터넷을 거치지 않고 S3에 액세스할 수 있습니다. 구성 예시는 아래 스크린샷을 참조하십시오.

  <Image img={byoc_s3_endpoint} size="lg" alt="BYOC S3 엔드포인트" />

  ### 네트워크 연결 확보

  **아웃바운드 인터넷 액세스**
  ClickHouse BYOC 구성 요소가 Tailscale 제어 평면과 통신할 수 있도록 VPC는 최소한 아웃바운드 인터넷 액세스를 허용해야 합니다. Tailscale은 비공개 관리 작업을 위한 안전한 제로 트러스트 네트워킹을 제공하는 데 사용됩니다. Tailscale을 통한 초기 등록 및 설정에는 공용 인터넷 연결이 필요하며, 이는 직접 연결하거나 NAT 게이트웨이를 통해 구현할 수 있습니다. 이러한 연결은 BYOC 배포의 프라이버시와 보안을 모두 유지하는 데 필요합니다.

  **DNS 확인**
  VPC에서 DNS 확인이 정상적으로 작동하고, 표준 DNS 이름을 차단하거나 방해하거나 덮어쓰지 않도록 하십시오. ClickHouse BYOC는 DNS를 사용하여 Tailscale 제어 서버와 ClickHouse 서비스 엔드포인트를 조회합니다. DNS를 사용할 수 없거나 구성이 잘못된 경우 BYOC 서비스가 연결에 실패하거나 제대로 작동하지 않을 수 있습니다.

  ### AWS 계정 구성

  초기 BYOC 설정에서는 ClickHouse Cloud의 BYOC 컨트롤러가 인프라를 관리할 수 있도록 권한이 있는 IAM 역할(`ClickHouseManagementRole`)을 생성합니다. 이는 [CloudFormation 템플릿](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 또는 [Terraform 모듈](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)을 사용하여 수행할 수 있습니다.

  `BYO-VPC` 설정으로 배포하는 경우, ClickHouse Cloud에 고객 관리형 VPC를 수정할 권한이 부여되지 않도록 `IncludeVPCWritePermissions` 매개변수를 `false`로 설정합니다.

  :::note
  ClickHouse를 실행하는 데 필요한 스토리지 버킷, Kubernetes 클러스터, 컴퓨팅 리소스는 이 초기 설정에 포함되지 않습니다. 이러한 리소스는 이후 단계에서 프로비저닝됩니다. VPC는 직접 제어하더라도, ClickHouse Cloud가 AWS 계정 내에서 Kubernetes 클러스터, 서비스 계정용 IAM 역할, S3 버킷 및 기타 필수 리소스를 생성하고 관리하려면 여전히 IAM 권한이 필요합니다.
  :::

  #### 대체 Terraform 모듈

  CloudFormation 대신 Terraform을 사용하려면 다음 모듈을 사용하십시오.

  ```hcl
  module "clickhouse_onboarding" {
    source                     = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
    byoc_env                   = "production"
    include_vpc_write_permissions = false
  }
  ```

  ### BYOC 인프라 설정

  ClickHouse Cloud 콘솔에서 [BYOC 설정 페이지](https://console.clickhouse.cloud/byocOnboarding)로 이동한 다음, 다음 항목을 구성합니다.

  1. **VPC Configuration**에서 **Use existing VPC**를 선택합니다.
  2. **VPC ID**를 입력합니다(예: `vpc-0bb751a5b888ad123`).
  3. 앞에서 구성한 3개 서브넷의 **Private subnet IDs**를 입력합니다.
  4. 설정에 퍼블릭 로드 밸런서가 필요한 경우 선택적으로 **Public subnet IDs**를 입력합니다.
  5. 프로비저닝을 시작하려면 **Setup Infrastructure**를 클릭합니다.

  <Image img={byoc_aws_existing_vpc_ui} size="lg" alt="Use existing VPC가 선택된 ClickHouse Cloud BYOC 설정 UI" />

  :::note
  새 리전 설정에는 최대 40분이 걸릴 수 있습니다.
  :::
</VerticalStepper>

## 고객 관리형 IAM 역할

고급 보안 요구 사항이나 엄격한 규정 준수 정책이 있는 조직에서는 ClickHouse Cloud가 IAM 역할을 생성하도록 하는 대신 자체 IAM 역할을 제공할 수 있습니다. 이 접근 방식은 IAM 권한을 완전히 제어할 수 있게 하며, 조직의 보안 정책을 시행할 수 있도록 합니다.

:::info
고객 관리형 IAM 역할은 비공개 프리뷰 상태입니다. 이 기능이 필요하면 구체적인 요구 사항과 일정에 대해 논의할 수 있도록 ClickHouse Support에 문의하십시오.

이 기능이 제공되면 다음 작업을 수행할 수 있습니다:

* ClickHouse Cloud에서 사용할 사전 구성된 IAM 역할 제공
* 교차 계정 액세스에 사용되는 `ClickHouseManagementRole`의 IAM 관련 권한에 대한 쓰기 권한 제거
* 역할 권한 및 신뢰 관계를 완전히 제어
  :::

ClickHouse Cloud가 기본적으로 생성하는 IAM 역할에 대한 자세한 내용은 [BYOC Privilege Reference](/cloud/reference/byoc/reference/privilege)를 참조하십시오.