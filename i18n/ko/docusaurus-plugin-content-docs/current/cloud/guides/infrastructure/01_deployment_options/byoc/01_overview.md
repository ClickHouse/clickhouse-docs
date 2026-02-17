---
title: '개요'
slug: /cloud/reference/byoc/overview
sidebar_label: '개요'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '사용자 소유 클라우드 인프라에 ClickHouse를 배포합니다'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 개요 \{#overview\}

Bring Your Own Cloud (BYOC)는 기본 ClickHouse Cloud 인프라에 의존하지 않고, 사용자의 자체 클라우드 계정 내에 직접 ClickHouse 서비스를 배포하고 데이터를 저장할 수 있도록 합니다. 이 방식은 데이터에 대한 완전한 제어와 주권을 요구하는 엄격한 보안 정책이나 규제 준수 요건이 있는 조직에 특히 적합합니다.

개략적으로 말하면, BYOC는 ClickHouse VPC에서 실행되며 ClickHouse Cloud에서 관리되는 ClickHouse 제어 플레인(control plane)과, 사용자의 클라우드 계정에서 전적으로 실행되며 ClickHouse 클러스터, 데이터, 백업을 포함하는 데이터 플레인(data plane)을 분리합니다. 관련 구성 요소와 이들 사이의 트래픽 흐름에 대한 자세한 내용은 [Architecture](/cloud/reference/byoc/architecture) 페이지를 참조하십시오.

> **액세스를 원한다면 [문의해 주십시오](https://clickhouse.com/cloud/bring-your-own-cloud).** 추가 정보는 [서비스 약관](https://clickhouse.com/legal/agreements/terms-of-service)을 참조하십시오.

:::note 
BYOC는 대규모 배포를 위해 특별히 설계되었으며, 고객은 약정 계약을 체결해야 합니다.
:::

**지원되는 클라우드 서비스 제공업체:**

* AWS (GA)
* GCP (Private Preview). 관심이 있다면 [여기](https://clickhouse.com/cloud/bring-your-own-cloud)에서 대기자 명단에 등록하십시오.
* Azure (Roadmap). 관심이 있다면 [여기](https://clickhouse.com/cloud/bring-your-own-cloud)에서 대기자 명단에 등록하십시오.

**지원되는 클라우드 리전:**
[지원 리전](https://clickhouse.com/docs/cloud/reference/supported-regions) 문서에 나열된 모든 **퍼블릭 리전**은 BYOC 배포에 사용할 수 있습니다. 프라이빗 리전은 현재 지원되지 않습니다.

## 기능 \{#features\}

### 지원되는 기능 \{#supported-features\}

- **SharedMergeTree**: ClickHouse Cloud와 BYOC는 동일한 바이너리와 설정을 사용합니다. 따라서 SharedMergeTree와 같이 ClickHouse 코어의 모든 기능이 BYOC에서 지원됩니다.
- **Shared Catalog**
- **서비스 상태 관리를 위한 콘솔 접근**:
  - 시작, 중지, 종료와 같은 작업을 지원합니다.
  - 서비스 및 상태 조회가 가능합니다.
- **관리형 백업 및 복구**
- **수동 수직 및 수평 확장**
- **자동 유휴 전환/웨이크업**
- **Warehouses**: Compute-Compute 분리
- **Tailscale을 통한 Zero Trust Network**
- **모니터링**:
  - Prometheus, Grafana, Datadog을 사용하는 중앙 집중식 모니터링을 위해 Prometheus 스크레이핑을 지원합니다. 설정 방법은 [BYOC Observability](/cloud/reference/byoc/observability)를 참조하십시오.
- **VPC Peering**
- **보안 S3 액세스**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**
- **[GCP Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)**
- **통합(Integrations)**: 전체 목록은 [이 페이지](/integrations)에서 확인할 수 있습니다.

### 향후 제공 예정 기능(현재는 미지원) \{#planned-features-currently-unsupported\}

- SQL 콘솔
- ClickPipes (Kafka, S3)
- ClickPipes (CDC)
- 자동 스케일링
- MySQL 인터페이스
- [AWS KMS](https://aws.amazon.com/kms/) 또는 CMEK (고객 관리형 암호화 키, customer-managed encryption keys)