---
title: '배포 옵션'
slug: /infrastructure/deployment-options
description: 'ClickHouse 고객이 사용할 수 있는 배포 옵션'
keywords: ['사용자 소유 클라우드 사용', 'byoc', '프라이빗', '정부', '자가 배포']
doc_type: 'reference'
---

# ClickHouse 배포 옵션 \{#clickhouse-deployment-options\}

ClickHouse는 다양한 고객 요구 사항을 충족하기 위해 여러 배포 옵션을 제공하며, 이를 통해 제어 수준, 규정 준수, 운영 부담을 서로 다른 정도로 조정할 수 있습니다.
이 문서는 사용 가능한 배포 유형을 구분하여 설명하며, 특정 아키텍처 선호도, 규제 의무, 리소스 관리 전략에 가장 적합한 최적의 솔루션을 선택하는 데 도움이 됩니다.

## ClickHouse Cloud \{#clickhouse-cloud\}

ClickHouse Cloud는 사용자가 직접 운영할 필요 없이 ClickHouse의 성능과 속도를 제공하는 완전 관리형, 클라우드 네이티브 서비스입니다.
이 옵션은 빠른 배포, 뛰어난 확장성, 최소한의 운영 부담을 우선시하는 경우에 적합합니다.
ClickHouse Cloud는 인프라 프로비저닝, 확장, 유지 관리, 업데이트 전반을 모두 처리하므로, 사용자는 데이터 분석과 애플리케이션 개발에만 온전히 집중할 수 있습니다.
사용량 기반 과금과 자동 확장을 제공하여 분석 워크로드에 대해 안정적이고 비용 효율적인 성능을 보장합니다. AWS, GCP, Azure의 여러 리전에서 사용할 수 있으며, 마켓플레이스를 통한 직접 청구 옵션을 지원합니다.

[ClickHouse Cloud](/getting-started/quick-start/cloud)에 대해 더 알아보십시오.

## Bring Your Own Cloud \{#byoc\}

ClickHouse Bring Your Own Cloud (BYOC)는 조직이 관리형 서비스 계층을 활용하면서도 자체 Cloud 환경 내에서 ClickHouse를 배포하고 관리할 수 있도록 해줍니다. 이 옵션은 완전 관리형인 ClickHouse Cloud 경험과 완전한 통제권을 갖는 자가 관리형 배포 사이의 차이를 메워 줍니다. ClickHouse BYOC를 사용하면 데이터, 인프라, 보안 정책에 대한 제어권을 유지하면서 특정 컴플라이언스 및 규제 요구 사항을 충족할 수 있고, 패치, 모니터링, 스케일링과 같은 운영 작업은 ClickHouse에 위임할 수 있습니다. 이 모델은 프라이빗 Cloud 배포의 유연성과 관리형 서비스의 이점을 동시에 제공하므로, 엄격한 보안, 거버넌스, 데이터 레지던시 요구 사항을 가진 엔터프라이즈의 대규모 배포에 적합합니다.

[Bring Your Own Cloud](/cloud/reference/byoc/overview)에 대해 더 알아보십시오.

## ClickHouse Private \{#clickhouse-private\}

ClickHouse Private는 ClickHouse Cloud를 구동하는 것과 동일한 독점 기술을 활용하는, 자가 배포형(self-deployed) ClickHouse입니다. 이 옵션은 가장 높은 수준의 제어를 제공하므로, 엄격한 컴플라이언스, 네트워킹, 보안 요구 사항을 가진 조직과 자체 인프라를 운영할 전문성을 갖춘 팀에 적합합니다. ClickHouse Cloud 환경에서 철저히 검증된 정기적인 업데이트 및 업그레이드, 풍부한 기능을 담은 로드맵의 혜택을 누릴 수 있으며, 전문 지원 팀의 지원을 받을 수 있습니다.

[ClickHouse Private](/cloud/infrastructure/clickhouse-private)에 대해 더 알아보십시오.

## ClickHouse Government \{#clickhouse-government\}

ClickHouse Government는 격리되고 공인된 환경이 필요한 정부 기관 및 공공 부문 조직의 고유하고 엄격한 요구 사항을 충족하도록 설계된, 자가 배포(self-deployed) 버전의 ClickHouse입니다. 이 배포 옵션은 OpenSSL을 활용한 FIPS 140-3 규정 준수, 추가적인 시스템 하드닝, 취약성 관리에 중점을 두어 고도로 안전하고 규정을 준수하며 격리된 환경을 제공합니다. 또한 ClickHouse Cloud의 강력한 기능을 기반으로 하여, 정부 기관의 구체적인 운영 및 보안 요구 사항을 충족하기 위한 전용 기능과 설정을 통합합니다. ClickHouse Government를 사용하면 기관은 통제되고 공인된 인프라 내에서 민감한 데이터에 대해 고성능 분석을 수행할 수 있으며, 공공 부문 요구 사항에 맞추어진 전문가 지원을 받을 수 있습니다.

[ClickHouse Government](/cloud/infrastructure/clickhouse-government)에 대해 더 알아보십시오.