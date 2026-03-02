---
title: 'BYOC 네트워크 보안'
slug: /cloud/reference/byoc/reference/network_security
sidebar_label: '네트워크 보안'
keywords: ['BYOC', '클라우드', '사용자 소유 클라우드', '네트워크 보안']
description: '직접 운영하는 클라우드 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc_tailscale from '@site/static/images/cloud/reference/byoc-tailscale-1.png';


## ClickHouse 제어 플레인과 사용자의 BYOC VPC 간 연결 \{#connection-between-clickhouse-and-byoc\}

ClickHouse Cloud 제어 플레인은 사용자의 BYOC 배포를 운영하고 지원하기 위해 여러 종류의 연결을 유지합니다:

| Purpose | Connection type | Notes |
|---------|-----------------|-------|
| **일상 운영 — Kubernetes API server** | IP 필터링이 적용된 퍼블릭(기본값) 또는 Tailscale | 관리 서비스는 퍼블릭 네트워크를 통해 EKS API server와 통신하며, 허용 IP 목록(allow list)으로 접근이 제한됩니다. 초기 배포 이후에는 선택적으로 Tailscale로 전환해 비공개(프라이빗) 액세스를 사용할 수 있습니다. |
| **일상 운영 — AWS API** | ClickHouse VPC → AWS | 관리 서비스는 ClickHouse Cloud 자체 VPC에서 AWS로 AWS API(예: EKS, EC2)를 호출합니다. 이 과정에는 사용자의 VPC나 Tailscale이 관여하지 않습니다. |
| **문제 해결 — ClickHouse 서비스** | Tailscale | ClickHouse 엔지니어는 Tailscale을 통해 진단을 위해 ClickHouse 서비스(예: system 테이블)에 액세스합니다. |
| **문제 해결 — Kubernetes API server** | Tailscale | ClickHouse 엔지니어는 클러스터 진단을 위해 Tailscale을 통해 EKS API server에 액세스합니다. |

다음 섹션에서는 **Tailscale** 프라이빗 네트워크가 문제 해결과 선택적인 관리 액세스에 어떻게 사용되는지 설명합니다.

## Tailscale 프라이빗 네트워크 \{#tailscale-private-network\}

Tailscale은 ClickHouse Cloud의 관리 서비스와 사용자의 BYOC 배포 간에 제로 트러스트 프라이빗 네트워크 연결을 제공합니다. 이 보안 채널을 통해 ClickHouse 엔지니어는 공용 인터넷 접속이나 복잡한 VPN 구성이 없이도 문제 해결 및 관리 작업을 수행할 수 있습니다.

### 개요 \{#tailscale-overview\}

Tailscale은 ClickHouse 제어 플레인(ClickHouse의 VPC 내)과 BYOC 데이터 플레인(사용자의 VPC 내) 사이에 암호화된 프라이빗 네트워크 터널을 생성합니다. 이 연결은 다음 용도로만 사용됩니다.

- **관리 작업**: ClickHouse 관리 서비스가 BYOC 인프라와 조율합니다.
- **문제 해결 접근**: ClickHouse 엔지니어가 진단을 위해 Kubernetes API 서버와 ClickHouse 시스템 테이블에 접근합니다.
- **메트릭 접근**: ClickHouse의 중앙 집중식 모니터링 대시보드가 BYOC VPC 내에 배포된 Prometheus 스택에서 메트릭에 접근하여, ClickHouse 엔지니어에게 해당 환경에 대한 관측성을 제공합니다.

:::important
Tailscale은 **관리 및 문제 해결 작업에만** 사용됩니다. **쿼리 트래픽**이나 고객 데이터 접근에는 절대 사용되지 않습니다. 모든 고객 데이터는 사용자의 VPC 내에만 머무르며, Tailscale 연결을 통해 전송되지 않습니다.
:::

### BYOC에서 Tailscale이 동작하는 방식 \{#how-tailscale-works\}

<Image img={byoc_tailscale} size="lg" alt="BYOC Tailscale" border />

Tailscale을 통해 접근해야 하는 각 서비스 또는 엔드포인트마다 ClickHouse BYOC는 다음을 배포합니다:

1. **Tailnet 주소 등록**: 각 엔드포인트는 고유한 Tailnet 주소를 등록합니다 (예: Kubernetes API server에 사용되는 `k8s.xxxx.us-east-1.aws.byoc.clickhouse-prd.com`)

2. **Tailscale 에이전트 컨테이너**: Tailscale 에이전트 컨테이너가 EKS 클러스터 내에서 실행되며, 다음을 담당합니다:
   - Tailscale 조정 서버에 연결
   - 서비스를 등록하여 발견 가능하도록 설정
   - Nginx 파드와의 네트워크 설정 조정

3. **Nginx 파드**: 다음을 수행하는 Nginx 파드:
   - Tailscale에서 오는 TLS 트래픽 종료(termination)
   - EKS 클러스터 내 적절한 IP 주소로 트래픽 라우팅

### Network Connection Process \{#tailscale-connection-process\}

Tailscale 연결은 다음과 같은 단계로 설정됩니다.

1. **Initial Connection**:
   - 양 끝단(ClickHouse 엔지니어 환경과 사용자의 BYOC EKS 클러스터)에 있는 Tailscale 에이전트가 Tailscale 조정 서버에 연결합니다.
   - EKS 클러스터 에이전트는 Kubernetes 서비스를 등록하여 서비스가 검색 가능하도록 합니다.
   - ClickHouse 엔지니어는 서비스에 접근할 수 있도록 내부적으로 권한 승인을 받아야 합니다.

2. **Connection Mode**:
   - **Direct Mode**: 에이전트가 NAT 트래버설 터널을 통해 직접 연결을 시도합니다.
   - **Relay Mode**: Direct mode가 실패하는 경우 통신은 Tailscale DERP(Distributed Encrypted Relay Protocol) 서버를 사용하는 relay mode로 자동 전환됩니다.

3. **Encryption**:
   - 모든 통신은 종단 간 암호화됩니다.
   - 각 Tailscale 에이전트는 자체 공개/개인 키 쌍(PKI와 유사)을 생성합니다.
   - 트래픽은 Direct mode이든 Relay mode이든 관계없이 암호화된 상태를 유지합니다.

### 보안 기능 \{#tailscale-security\}

**아웃바운드 전용 연결**:

- EKS 클러스터의 Tailscale 에이전트가 Tailscale 조정/릴레이 서버로 아웃바운드 연결을 시작합니다
- **인바운드 연결은 필요하지 않습니다** — 보안 그룹 규칙에서 Tailscale 에이전트로의 인바운드 트래픽을 허용할 필요가 없습니다
- 이를 통해 공격 표면이 줄어들고 네트워크 보안 구성이 단순해집니다

**액세스 제어**:

- 액세스는 ClickHouse의 내부 승인 시스템을 통해 제어됩니다
- 엔지니어는 지정된 승인 워크플로를 통해 액세스를 요청해야 합니다
- 액세스는 시간 제한이 있으며 자동으로 만료됩니다
- 모든 액세스는 감사 대상이며 로그로 기록됩니다

**인증서 기반 인증**:

- ClickHouse 시스템 테이블에 대한 액세스의 경우, 엔지니어는 유효 기간이 제한된 임시 인증서를 사용합니다
- 인증서 기반 인증은 BYOC 환경에서 사람의 모든 액세스에 대해 비밀번호 기반 액세스를 대체합니다
- 액세스는 시스템 테이블로만 제한되며(고객 데이터에는 적용되지 않습니다)
- 모든 액세스 시도는 ClickHouse의 `query_log` 테이블에 기록됩니다

### Tailscale을 통한 액세스 문제 해결 \{#troubleshooting-access-tailscale\}

ClickHouse 엔지니어가 사용자의 BYOC 배포에서 발생한 문제를 트러블슈팅해야 하는 경우, 다음 리소스에 접근하기 위해 Tailscale을 사용합니다.

- **Kubernetes API Server**: EBS 마운트 실패, 노드 수준 네트워크 문제, 클러스터 상태 이상 등을 진단합니다.
- **ClickHouse System Tables**: 쿼리 성능 분석 및 진단용 쿼리 실행에 사용합니다(시스템 테이블에 대한 읽기 전용 액세스만 허용).

문제 해결을 위한 액세스 절차는 다음과 같습니다.

1. **Access Request**: 지정된 그룹에 속한 온콜 엔지니어가 고객 ClickHouse 인스턴스에 대한 액세스를 요청합니다.
2. **Approval**: 요청은 지정된 승인자가 있는 내부 승인 시스템을 통해 승인됩니다.
3. **Certificate Generation**: 승인된 엔지니어에 대해, 유효 기간이 제한된 인증서가 생성됩니다.
4. **ClickHouse Configuration**: ClickHouse 오퍼레이터가 ClickHouse를 구성하여 해당 인증서를 허용합니다.
5. **Connection**: 엔지니어는 인증서를 사용해 Tailscale을 통해 인스턴스에 액세스합니다.
6. **Automatic Expiration**: 설정된 시간이 지나면 액세스가 자동으로 만료됩니다.

### Management Services Access \{#management-services-access\}

기본적으로 ClickHouse 관리 서비스는 EKS API 서버의 퍼블릭 IP 주소를 통해 BYOC Kubernetes 클러스터에 접근하며, 이 퍼블릭 IP는 ClickHouse의 NAT 게이트웨이 IP 주소로만 제한됩니다.

**선택적 프라이빗 엔드포인트 설정**:

- EKS API 서버가 프라이빗 엔드포인트만 사용하도록 설정할 수 있습니다.
- 이 경우 관리 서비스는 Tailscale(운영자가 문제를 진단하기 위해 접속하는 방식과 유사함)을 통해 API 서버에 접근합니다.
- 긴급 조사와 지원이 필요할 때를 대비한 예비 수단으로 퍼블릭 접근을 유지합니다.

### 네트워크 트래픽 흐름 \{#tailscale-traffic-flow\}

**Tailscale 연결 흐름**:

1. EKS 클러스터의 Tailscale 에이전트 → Tailscale 조정 서버(아웃바운드)
2. 엔지니어의 머신에 있는 Tailscale 에이전트 → Tailscale 조정 서버(아웃바운드)
3. 에이전트 간 직접 또는 릴레이 연결이 설정됨
4. 설정된 터널을 통해 암호화된 트래픽이 흐르게 됨
5. EKS의 Nginx 파드가 TLS를 종료하고 내부 서비스로 라우팅함

**고객 데이터 전송 없음**:

- Tailscale 연결은 관리 및 문제 해결 목적에만 사용됨
- 쿼리 트래픽과 고객 데이터는 Tailscale을 통해 전송되지 않음
- 모든 고객 데이터는 VPC 내부에만 유지됨

### 모니터링 및 감사 \{#tailscale-monitoring\}

ClickHouse와 고객 모두 Tailscale 접속 활동을 감사할 수 있습니다.

- **ClickHouse 모니터링**: ClickHouse는 접속 요청을 모니터링하고 모든 Tailscale 연결을 로그에 기록합니다.
- **고객 감사**: 고객은 자체 시스템에서 ClickHouse 엔지니어의 활동을 추적할 수 있습니다.
- **쿼리 로그**: Tailscale을 통한 모든 시스템 테이블 접속은 ClickHouse의 `query_log` 테이블에 기록됩니다.

BYOC에서 Tailscale이 어떻게 구현되는지에 대한 자세한 기술 정보는 [Building ClickHouse BYOC on AWS 블로그 게시글](https://clickhouse.com/blog/building-clickhouse-byoc-on-aws#tailscale-connection)을 참조하십시오.

## 네트워크 경계 \{#network-boundaries\}

이 섹션에서는 고객 BYOC VPC로 들어오고 나가는 다양한 네트워크 트래픽 유형을 설명합니다:

- **인바운드(Inbound)**: 고객 BYOC VPC로 유입되는 트래픽.
- **아웃바운드(Outbound)**: 고객 BYOC VPC에서 시작되어 외부 대상으로 전송되는 트래픽.
- **퍼블릭(Public)**: 퍼블릭 인터넷에서 접근 가능한 네트워크 엔드포인트.
- **프라이빗(Private)**: VPC 피어링, VPC Private Link, Tailscale과 같은 프라이빗 연결을 통해서만 접근 가능한 네트워크 엔드포인트.

**Istio 인그레스는 AWS NLB 뒤에 배포되어 ClickHouse 클라이언트 트래픽을 수신합니다.**

*인바운드, 퍼블릭 또는 프라이빗*

Istio 인그레스 게이트웨이는 TLS를 종료합니다. Let's Encrypt를 사용하는 CertManager에 의해 프로비저닝된 인증서는 EKS 클러스터 내의 시크릿으로 저장됩니다. Istio와 ClickHouse가 동일한 VPC에 있으므로, 두 구성 요소 간의 트래픽은 [AWS에 의해 암호화](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypting-data-at-rest-and--in-transit.html#:~:text=All%20network%20traffic%20between%20AWS,supported%20Amazon%20EC2%20instance%20types)됩니다.

기본적으로 인그레스는 IP 허용 목록 필터링과 함께 퍼블릭하게 접근할 수 있습니다. 고객은 VPC 피어링을 구성하여 이를 프라이빗으로 전환하고 퍼블릭 연결을 비활성화할 수 있습니다. 접근을 제한하기 위해 [IP 필터](/cloud/security/setting-ip-filters)를 설정할 것을 강력히 권장합니다.

### 액세스 문제 해결 \{#troubleshooting-access\}

*인바운드, 프라이빗*

ClickHouse Cloud 엔지니어는 문제 해결을 위해 Tailscale을 통한 액세스 권한이 필요합니다. BYOC 배포 환경에 대해서는 just-in-time 인증서 기반 인증이 프로비저닝됩니다.

### Billing scraper \{#billing-scraper\}

*아웃바운드, 프라이빗*

Billing scraper는 ClickHouse에서 청구 데이터를 수집하여 ClickHouse Cloud가 소유한 S3 버킷으로 전송합니다.

이 컨테이너는 ClickHouse 서버 컨테이너와 함께 사이드카로 실행되며, 주기적으로 CPU 및 메모리 메트릭을 수집합니다. 동일한 리전 내 요청은 VPC 게이트웨이 서비스 엔드포인트를 통해 라우팅됩니다.

### 경보 \{#alerts\}

*아웃바운드, 퍼블릭*

AlertManager는 고객의 ClickHouse 클러스터 상태에 문제가 발생했을 때 ClickHouse Cloud로 경보를 전송하도록 구성되어 있습니다.

메트릭과 로그는 고객의 BYOC VPC 내에 저장됩니다. 로그는 현재 EBS에 로컬로 저장됩니다. 향후 업데이트에서는 BYOC VPC 내의 ClickHouse 서비스인 LogHouse에 저장될 예정입니다. 메트릭은 Prometheus와 Thanos 스택을 사용하고, BYOC VPC 내에 로컬로 저장됩니다.

### 서비스 상태 \{#service-state\}

*아웃바운드, 퍼블릭*

State Exporter는 ClickHouse 서비스 상태 정보를 ClickHouse Cloud에서 관리하는 SQS로 전송합니다.