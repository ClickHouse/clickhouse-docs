---
title: 'GCP 사용자 지정 설정'
slug: /cloud/reference/byoc/onboarding/customization-gcp
sidebar_label: 'GCP 사용자 지정 설정'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'onboarding', 'GCP', 'VPC']
description: '기존 GCP VPC에 ClickHouse BYOC를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_gcp_subnet from '@site/static/images/cloud/reference/byoc-gcp-subnet.png';


## GCP용 고객 관리형 VPC(BYO-VPC) \{#customer-managed-vpc-gcp\}

ClickHouse Cloud가 새 VPC를 프로비저닝하는 대신 기존 VPC를 사용해 ClickHouse BYOC를 배포하려면 아래 단계를 따르십시오. 이 방식을 사용하면 네트워크 구성을 보다 세밀하게 제어할 수 있으며, ClickHouse BYOC를 기존 네트워크 인프라에 통합할 수 있습니다.

### 기존 VPC 구성 \{#configure-existing-vpc\}

1. ClickHouse Kubernetes(GKE) 클러스터를 위해 [ClickHouse BYOC가 지원하는 리전](/cloud/reference/byoc/supported-regions)의 프라이빗 서브넷을 최소 1개 할당하십시오. GKE 클러스터 노드에 충분한 IP 주소를 제공할 수 있도록 서브넷에 최소 `/24` CIDR 범위(예: 10.0.0.0/24)가 있는지 확인하십시오.
2. 프라이빗 서브넷 내에서 GKE 클러스터 파드에 사용할 보조 IPv4 범위를 최소 1개 할당하십시오. GKE 클러스터 파드에 충분한 IP 주소를 제공할 수 있도록 보조 범위는 최소 `/23`이어야 합니다.
3. 서브넷에서 **Private Google Access**를 활성화하십시오. 이렇게 하면 외부 IP 주소 없이도 GKE 노드가 Google API 및 서비스에 연결할 수 있습니다.

<Image img={byoc_gcp_subnet} size="lg" alt="Private Google Access가 활성화된 기본 및 보조 IPv4 범위를 보여주는 BYOC GCP 서브넷 세부 정보" />

### 네트워크 연결 보장 \{#ensure-network-connectivity\}

**Cloud NAT Gateway**
VPC에 [Cloud NAT gateway](https://cloud.google.com/nat/docs/overview)가 배포되어 있는지 확인하십시오. ClickHouse BYOC 구성 요소는 Tailscale 제어 플레인과 통신하기 위해 아웃바운드 인터넷 액세스가 필요합니다. Tailscale은 비공개 관리 작업을 위해 안전한 제로 트러스트 네트워킹을 제공하는 데 사용됩니다. Cloud NAT gateway는 외부 IP 주소가 없는 인스턴스에 이러한 아웃바운드 연결을 제공합니다.

**DNS Resolution**
VPC에서 DNS 조회가 정상적으로 작동하며, 표준 DNS 이름을 차단하거나 간섭하거나 덮어쓰지 않는지 확인하십시오. ClickHouse BYOC는 Tailscale 제어 서버와 ClickHouse 서비스 엔드포인트를 조회하기 위해 DNS에 의존합니다. DNS를 사용할 수 없거나 구성이 잘못된 경우 BYOC 서비스가 연결되지 않거나 제대로 작동하지 않을 수 있습니다.

### ClickHouse 지원팀에 문의하십시오 \{#contact-clickhouse-support\}

위의 구성 단계를 완료한 후, 다음 정보를 포함하여 지원 티켓을 생성하십시오:

* GCP 프로젝트 ID
* 서비스를 배포하려는 GCP 리전
* VPC 네트워크 이름
* ClickHouse에 할당한 서브넷 이름
* (선택 사항) ClickHouse 전용 보조 IPv4 범위 이름. 이는 프라이빗 서브넷에 여러 보조 IPv4 범위가 있고, 그중 모든 범위를 ClickHouse 용도로 사용하는 것이 아닌 경우에만 필요합니다

당사 팀에서 구성을 검토한 후, 당사 측에서 프로비저닝을 완료합니다.