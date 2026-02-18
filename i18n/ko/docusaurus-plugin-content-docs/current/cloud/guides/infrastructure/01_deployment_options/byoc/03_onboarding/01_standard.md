---
title: '표준 온보딩'
slug: /cloud/reference/byoc/onboarding/standard
sidebar_label: '표준 프로세스'
keywords: ['BYOC', '클라우드', '자체 클라우드(bring your own cloud)', '온보딩']
description: '직접 운영하는 클라우드 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_onboarding_1 from '@site/static/images/cloud/reference/byoc-onboarding-1.png'
import byoc_onboarding_2 from '@site/static/images/cloud/reference/byoc-onboarding-2.png'
import byoc_onboarding_3 from '@site/static/images/cloud/reference/byoc-onboarding-3.png'
import byoc_new_service_1 from '@site/static/images/cloud/reference/byoc-new-service-1.png'


## Standard Onboarding이란 무엇입니까? \{#what-is-standard-onboarding\}

**Standard Onboarding**은 BYOC를 사용하여 사용자의 자체 Cloud 계정에 ClickHouse를 배포하기 위한 기본 안내형 워크플로우입니다. 이 방식에서 ClickHouse Cloud는 사용자의 AWS 계정/GCP 프로젝트 내에 VPC, 서브넷, 보안 그룹, Kubernetes(EKS/GKE) 클러스터, 관련 IAM 역할/서비스 계정 등 배포에 필요한 핵심 Cloud 리소스를 모두 프로비저닝합니다. 이를 통해 일관되고 안전한 구성을 보장하고, 팀에서 수행해야 하는 수동 작업을 최소화할 수 있습니다.

Standard Onboarding을 사용하는 경우 전용 AWS 계정/GCP 프로젝트만 준비한 뒤, 초기 스택을(CloudFormation 또는 Terraform을 통해) 실행하여 ClickHouse Cloud가 이후 설정을 오케스트레이션하는 데 필요한 최소한의 IAM 권한과 트러스트를 생성하면 됩니다. 이후 단계(인프라 프로비저닝 및 서비스 시작 포함)는 모두 ClickHouse Cloud 웹 콘솔을 통해 관리됩니다.

권한 및 리소스 측면에서 더 나은 격리를 보장하기 위해 ClickHouse BYOC 배포를 호스팅할 **전용** AWS 계정 또는 GCP 프로젝트를 미리 준비할 것을 강력히 권장합니다. ClickHouse는 해당 계정 내에 전용 Cloud 리소스 집합(VPC, Kubernetes 클러스터, IAM 역할, S3 버킷 등)을 배포합니다.

보다 맞춤화된 구성이 필요한 경우(예: 기존 VPC에 배포하는 경우), [Customized Onboarding](/cloud/reference/byoc/onboarding/customization) 문서를 참고하십시오.

## 액세스 요청 \{#request-access\}

온보딩 프로세스를 시작하려면 [문의 페이지](https://clickhouse.com/cloud/bring-your-own-cloud)를 통해 연락해 주십시오. 담당 팀에서 BYOC 요구 사항을 안내하고, 가장 적합한 배포 옵션 선택을 도와드리며, 계정을 허용 목록(allowlist)에 추가합니다.

## 온보딩 절차 \{#onboarding-process\}

### AWS 계정/GCP 프로젝트 준비 \{#prepare-an-aws-account\}

조직 내에 새 AWS 계정 또는 GCP 프로젝트를 준비합니다. 설정을 계속하려면 웹 콘솔(https://console.clickhouse.cloud/byocOnboarding)에 접속합니다. 

<VerticalStepper headerLevel="h3">

### Cloud 제공업체 선택 \{#choose-cloud-provider\}

<Image img={byoc_onboarding_1} size="lg" alt="BYOC Cloud 서비스 제공업체 선택" background='black'/>

### 계정/프로젝트 설정 \{#account-setup\}

초기 BYOC 설정은 [CloudFormation 템플릿(AWS)](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/cf-templates/byoc.yaml) 또는 [Terraform 모듈(GCP)](https://github.com/ClickHouse/terraform-byoc-onboarding/tree/main/modules/gcp)을 사용하여 수행할 수 있습니다. 이 과정에서 고권한 IAM 역할이 생성되며, 이를 통해 ClickHouse Cloud의 BYOC 컨트롤러가 인프라를 관리할 수 있게 됩니다. 

<Image img={byoc_onboarding_2} size="lg" alt="BYOC 계정 초기화" background='black'/>

:::note
ClickHouse 실행에 필요한 스토리지 버킷, VPC, Kubernetes 클러스터, 컴퓨트 리소스는 이 초기 설정에 포함되지 않습니다. 다음 단계에서 프로비저닝됩니다.
:::
#### AWS용 대체 Terraform 모듈 \{#terraform-module-aws\}

AWS 배포에 CloudFormation 대신 Terraform을 사용하려는 경우, [AWS용 Terraform 모듈](https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz)도 제공합니다.

사용 예:
```hcl
module "clickhouse_onboarding" {
  source   = "https://s3.us-east-2.amazonaws.com/clickhouse-public-resources.clickhouse.cloud/tf/byoc.tar.gz"
  byoc_env = "production"
}
```

### BYOC 인프라 설정 \{#setup-byoc-infrastructure\}

ClickHouse Cloud 콘솔에서 S3 버킷, VPC, Kubernetes 클러스터를 포함한 인프라를 설정하라는 안내가 표시됩니다. 이 단계에서 이후에 변경할 수 없는 일부 구성을 결정해야 합니다. 구체적으로 다음 항목이 있습니다.

- **리전(Region)**: 문서 [supported regions](https://clickhouse.com/docs/cloud/reference/supported-regions)에 나열된 모든 **퍼블릭 리전**을 BYOC 배포에 사용할 수 있습니다. 프라이빗 리전은 현재 지원되지 않습니다.

- **VPC CIDR 범위**: 기본적으로 BYOC VPC CIDR 범위에는 `10.0.0.0/16`을 사용합니다. 다른 계정과 VPC 피어링을 사용할 계획이라면 CIDR 범위가 겹치지 않도록 해야 합니다. 필요한 워크로드를 수용할 수 있도록 최소 `/22` 크기 이상의 CIDR 범위를 BYOC용으로 할당합니다.

- **가용 영역(Availability Zones)**: VPC 피어링을 사용할 계획이라면 소스 계정과 BYOC 계정 간에 가용 영역을 맞추면 AZ 간 트래픽 비용을 줄이는 데 도움이 됩니다. 예를 들어 AWS에서는 가용 영역 접미사(`a`, `b`, `c`)가 계정마다 서로 다른 물리적 영역 ID를 나타낼 수 있습니다. 자세한 내용은 [AWS 가이드](https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/use-consistent-availability-zones-in-vpcs-across-different-aws-accounts.html)를 참고하십시오.

<Image img={byoc_onboarding_3} size="lg" alt="BYOC 인프라 설정" background='black'/>

</VerticalStepper>

### 첫 번째 BYOC ClickHouse 서비스 생성 \{#create-clickhouse-service\}

BYOC 인프라 프로비저닝이 완료되면 첫 ClickHouse 서비스를 생성할 준비가 된 것입니다. ClickHouse Cloud 콘솔을 열고 BYOC 환경을 선택한 다음 안내에 따라 새 서비스를 생성하십시오.

<Image img={byoc_new_service_1} size="md" alt="BYOC 새 서비스 생성"/>

서비스 생성 과정에서 다음 옵션을 구성합니다:

- **Service name**: ClickHouse 서비스에 대해 명확하고 이해하기 쉬운 이름을 입력합니다.
- **BYOC infrastructure**: 서비스가 실행될 클라우드 계정과 리전(region)을 포함하는 BYOC 환경을 선택합니다.
- **Resource configuration**: ClickHouse 레플리카에 할당할 CPU와 메모리의 양을 선택합니다.
- **Replica count**: 고가용성을 강화하기 위한 레플리카 수를 설정합니다.