---
title: '아키텍처'
slug: /cloud/reference/byoc/architecture
sidebar_label: '아키텍처'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '사용자가 소유한 클라우드 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 용어집 \{#glossary\}

- **ClickHouse VPC:**  ClickHouse Cloud가 소유한 VPC입니다.
- **Customer BYOC VPC:** 고객의 클라우드 계정이 소유한 VPC로, ClickHouse Cloud에서 프로비저닝 및 관리하며 ClickHouse Cloud BYOC 배포에 전용으로 사용됩니다.
- **Customer VPC** 고객 클라우드 계정이 소유한 그 밖의 VPC로, Customer BYOC VPC에 연결해야 하는 애플리케이션에 사용됩니다.

## Architecture \{#architecture\}

BYOC는 ClickHouse VPC에서 실행되는 **ClickHouse control plane**과, 사용자의 클라우드 계정 내에서만 실행되는 **data plane**을 분리합니다. ClickHouse VPC에는 ClickHouse Cloud Console, 인증 및 사용자 관리, API, 과금, BYOC 컨트롤러와 같은 인프라 관리 구성 요소, 알림/인시던트 도구가 포함됩니다. 이러한 서비스들은 배포를 오케스트레이션하고 모니터링하지만, 데이터를 저장하지는 않습니다.

**Customer BYOC VPC** 내에서 ClickHouse는 ClickHouse data plane을 실행하는 Kubernetes 클러스터(예: Amazon EKS)를 프로비저닝합니다. 다이어그램에서 보듯이, 여기에는 ClickHouse 클러스터 자체, ClickHouse operator, 인그레스, DNS, 인증서 관리, state exporter 및 scraper와 같은 지원 서비스가 포함됩니다. 전용 모니터링 스택(Prometheus, Grafana, AlertManager, Thanos)도 VPC 내에서 함께 실행되어 메트릭 및 알림이 사용자의 환경에서 생성되고 그 안에 유지되도록 합니다.

<br />

<Image img={byoc1} size="lg" alt="BYOC Architecture" background='black'/>

<br />

ClickHouse Cloud가 사용자의 계정에 배포하는 주요 클라우드 리소스는 다음과 같습니다.

* **VPC:** ClickHouse 배포에 전용으로 사용되는 Virtual Private Cloud입니다. ClickHouse가 관리할 수도 있고, 고객이 직접 관리할 수도 있으며, 일반적으로 애플리케이션 VPC와 피어링됩니다.
* **IAM roles and policies:** Kubernetes, ClickHouse 서비스, 모니터링 스택에 필요한 역할과 권한입니다. ClickHouse에서 프로비저닝할 수도 있고, 고객이 직접 제공할 수도 있습니다.
* **Storage buckets:** 데이터 파트, 백업 및 (선택적으로) 장기 보관용 메트릭과 로그 아카이브를 저장하는 데 사용됩니다.
* **Kubernetes cluster:** 클라우드 제공자에 따라 Amazon EKS, Google GKE 또는 Azure AKS가 될 수 있으며, 아키텍처 다이어그램에 표시된 ClickHouse 서버와 지원 서비스를 호스팅합니다.

기본적으로 ClickHouse Cloud는 새 전용 VPC를 프로비저닝하고 필요한 IAM 역할을 설정하여 Kubernetes 서비스가 안전하게 운영되도록 합니다. 고급 네트워킹 또는 보안 요구 사항이 있는 조직의 경우, VPC와 IAM 역할을 별도로 직접 관리하는 옵션도 있습니다. 이 방식은 네트워크 구성을 더 세밀하게 커스터마이징하고 권한을 보다 정밀하게 제어할 수 있게 해줍니다. 그러나 이러한 리소스를 직접 관리하기로 선택하면 운영 책임이 증가합니다.

### 데이터 저장소 \{#data-storage\}

모든 ClickHouse 데이터, 백업, 그리고 관측성 데이터는 Cloud 계정에 유지됩니다. 데이터 파트(parts)와 백업은 객체 스토리지(예: S3)에 저장되고, 로그는 ClickHouse 노드에 연결된 스토리지 볼륨에 저장됩니다. 향후 업데이트에서는 로그를 BYOC VPC 내에서 실행되는 ClickHouse 기반 로깅 서비스인 LogHouse에 기록할 예정입니다. 메트릭은 로컬에 저장하거나, 장기 보관을 위해 BYOC VPC 내의 별도 버킷에 저장할 수 있습니다. ClickHouse VPC와 BYOC VPC 간의 컨트롤 플레인 연결은 보안이 보장되고 범위가 엄격히 제한된 채널(다이어그램에 표시된 Tailscale 예시와 같이)을 통해 제공되며, 이는 관리 작업에만 사용되고 쿼리 트래픽에는 사용되지 않습니다.

### 제어 플레인 통신 \{#control-plane-communication\}

ClickHouse VPC는 구성 변경, 상태 확인, 배포 명령을 포함한 서비스 관리 작업을 위해 HTTPS(포트 443)를 통해 BYOC VPC와 통신합니다. 이 트래픽은 오케스트레이션을 위한 제어 플레인 데이터만 전송합니다. 중요한 텔레메트리 데이터와 알림은 리소스 사용량 및 상태 모니터링을 가능하게 하기 위해 BYOC VPC에서 ClickHouse VPC로 전송됩니다.

## BYOC를 위한 주요 요건 \{#key-requirements\}

BYOC 배포 모델은 안정적인 운영, 원활한 유지 관리, 보안을 보장하기 위해 두 가지 핵심 구성 요소가 필요합니다:

### 계정 간 IAM 권한 \{#cross-account-iam-permissions\}

ClickHouse Cloud는 사용자의 클라우드 계정 내에서 리소스를 프로비저닝하고 관리하기 위해 계정 간 IAM 권한이 필요합니다. 이를 통해 ClickHouse는 다음과 같은 작업을 수행할 수 있습니다:

- **인프라 프로비저닝**: VPC, 서브넷, 보안 그룹 및 기타 네트워킹 구성 요소를 생성하고 구성합니다
- **Kubernetes 클러스터 관리**: EKS/GKE 클러스터, 노드 그룹 및 클러스터 구성 요소를 배포하고 유지 관리합니다
- **스토리지 리소스 생성**: 데이터 및 백업을 위해 S3 버킷 또는 동등한 객체 스토리지를 프로비저닝합니다
- **IAM 역할 관리**: Kubernetes 서비스 계정 및 지원 서비스용 IAM 역할을 생성하고 구성합니다
- **지원 서비스 운영**: 모니터링 스택, 인그레스 컨트롤러 및 기타 인프라 구성 요소를 배포하고 관리합니다

이러한 권한은 초기 온보딩 단계에서 생성하는 계정 간 IAM 역할(AWS) 또는 서비스 계정(GCP)을 통해 부여됩니다. 이 역할은 최소 권한 원칙을 따르며, 권한 범위는 BYOC 운영에 필요한 항목으로만 제한됩니다.

필요한 구체적인 권한에 대한 자세한 내용은 [BYOC 권한 참조](/cloud/reference/byoc/reference/privilege)를 참조하십시오.

### Tailscale 프라이빗 네트워크 연결 \{#tailscale-private-network\}

Tailscale은 ClickHouse Cloud의 관리 서비스와 BYOC 배포 간에 안전한 제로 트러스트(Zero-Trust) 프라이빗 네트워크 연결을 제공합니다. 이 연결을 통해 다음이 가능해집니다:

- **지속적인 모니터링**: ClickHouse 엔지니어가 BYOC VPC에 배포된 Prometheus 모니터링 스택에 접근하여 서비스 상태와 성능을 모니터링할 수 있습니다
- **사전 예방적 유지 관리**: 엔지니어가 정기적인 유지 관리, 업그레이드 및 문제 해결 작업을 수행할 수 있습니다
- **긴급 지원**: 서비스 문제 발생 시 엔지니어가 환경에 신속하게 접근해 문제를 진단하고 해결할 수 있습니다
- **인프라 관리**: 관리 서비스가 BYOC 인프라와 연동하여 자동화된 운영을 수행할 수 있습니다

Tailscale 연결은 BYOC VPC에서 **아웃바운드 전용**으로 설정되며, 인바운드 연결은 필요하지 않아 보안 노출 범위가 줄어듭니다. 모든 접근은 다음과 같은 방식으로 관리됩니다:

- **승인 및 감사**: 엔지니어는 내부 승인 시스템을 통해 접근을 요청해야 합니다
- **시간 제한**: 접근 권한은 설정된 기간 이후 자동으로 만료됩니다
- **제한적 범위**: 엔지니어는 시스템 테이블과 인프라 구성 요소에만 접근할 수 있으며, 고객 데이터에는 절대 접근할 수 없습니다
- **암호화**: 모든 통신은 종단 간 암호화됩니다

BYOC에서 Tailscale이 동작하는 방식과 보안 제어에 대한 자세한 내용은 [네트워크 보안 문서](/cloud/reference/byoc/reference/network_security#tailscale-private-network)를 참조하십시오.

### 이러한 요구 사항이 중요한 이유 \{#why-requirements-matter\}

이 두 구성 요소를 함께 사용하면 ClickHouse Cloud는 다음을 수행할 수 있습니다:

- **신뢰성 유지**: 문제를 예방하기 위해 배포 환경을 사전에 모니터링하고 유지 관리합니다.
- **보안 보장**: 완전한 감사가 가능하도록 최소 권한 액세스를 사용합니다.
- **운영 단순화**: 사용자가 제어권을 유지한 상태에서 인프라 관리를 자동화합니다.
- **지원 제공**: 문제가 발생했을 때 신속하게 대응하고 해결합니다.

모든 고객 데이터는 항상 사용자의 클라우드 계정 내에만 유지되며, 이러한 관리 채널을 통해 액세스되거나 전송되지 않습니다.

**추가 권장 사항 및 고려 사항:**

- BYOC VPC에 대한 네트워크 CIDR 범위가 피어링할 계획이 있는 기존 VPC와 겹치지 않도록 하십시오.
- 관리 및 지원을 단순화할 수 있도록 리소스에 명확히 태그를 지정하십시오.
- 고가용성을 위해 적절한 서브넷 크기와 가용 영역(Availability Zone) 간 분산을 미리 계획하십시오.
- ClickHouse Cloud가 사용자의 환경 내에서 운영될 때의 공유 책임과 모범 사례를 이해하려면 [security playbook](https://clickhouse.com/docs/cloud/security/audit-logging/byoc-security-playbook)을 참고하십시오.
- 초기 계정 설정, VPC 구성, 네트워크 연결(예: VPC 피어링) 및 IAM 역할 위임에 대한 단계별 지침은 전체 온보딩 가이드를 검토하십시오.

고유한 요구 사항이나 제약 사항이 있는 경우, 고급 네트워크 구성 또는 맞춤형 IAM 정책에 대한 지침을 받기 위해 ClickHouse Support에 문의하십시오.