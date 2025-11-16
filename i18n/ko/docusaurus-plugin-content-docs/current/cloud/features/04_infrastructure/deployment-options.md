---
'title': '배포 옵션'
'slug': '/infrastructure/deployment-options'
'description': 'ClickHouse 고객을 위한 배포 옵션'
'keywords':
- 'bring yor own cloud'
- 'byoc'
- 'private'
- 'government'
- 'self-deployed'
'doc_type': 'reference'
---


# ClickHouse 배포 옵션

ClickHouse는 다양한 고객 요구를 충족시키기 위해 여러 배포 옵션을 제공합니다. 이는 다양한 수준의 제어, 규정 준수 및 운영 오버헤드를 제공합니다. 이 문서는 사용자가 특정 아키텍처 선호도, 규제 의무 및 리소스 관리 전략에 맞는 최적의 솔루션을 선택할 수 있도록 다양한 배포 유형을 설명합니다.

## ClickHouse 클라우드 {#clickhouse-cloud}

ClickHouse 클라우드는 완전 관리형 클라우드 네이티브 서비스로, 자체 관리의 운영 복잡성 없이 ClickHouse의 성능과 속도를 제공합니다. 이 옵션은 빠른 배포, 확장성 및 최소한의 관리 오버헤드를 중요시하는 사용자에게 이상적입니다. ClickHouse 클라우드는 인프라 프로비저닝, 확장, 유지 관리 및 업데이트와 관련된 모든 측면을 처리하여 사용자가 데이터 분석 및 애플리케이션 개발에 전적으로 집중할 수 있도록 합니다. 소비 기반 요금제를 제공하며, 자동 확장을 통해 분석 워크로드에 대해 신뢰할 수 있고 비용 효율적인 성능을 보장합니다. AWS, GCP 및 Azure에서 사용할 수 있으며, 직접적인 마켓플레이스 청구 옵션을 제공합니다.

[ClickHouse 클라우드](/getting-started/quick-start/cloud)에 대해 자세히 알아보세요.

## Bring Your Own Cloud {#byoc}

ClickHouse Bring Your Own Cloud (BYOC)는 조직이 관리형 서비스 레이어를 활용하면서 자체 클라우드 환경 내에서 ClickHouse를 배포하고 관리할 수 있도록 합니다. 이 옵션은 ClickHouse 클라우드의 완전 관리형 경험과 자체 관리 배포의 완전한 제어 간의 격차를 메웁니다. ClickHouse BYOC를 사용하면 사용자는 데이터, 인프라 및 보안 정책에 대한 제어를 유지하면서 패치, 모니터링 및 확장과 같은 운영 작업을 ClickHouse에 위임하여 특정 규정 준수 및 규제 요구 사항을 충족할 수 있습니다. 이 모델은 관리형 서비스의 이점을 가진 프라이빗 클라우드 배포의 유연성을 제공하여 엄격한 보안, 거버넌스 및 데이터 거주 요건을 가진 대규모 기업 배포에 적합합니다.

[Bring Your Own Cloud](/cloud/reference/byoc/overview)에 대해 자세히 알아보세요.

## ClickHouse 프라이빗 {#clickhouse-private}

ClickHouse 프라이빗은 ClickHouse 클라우드에서 제공되는 것과 동일한 독점 기술을 활용하여 자체 배포 버전입니다. 이 옵션은 가장 높은 수준의 제어를 제공하여 엄격한 규정 준수, 네트워킹 및 보안 요구 사항이 있는 조직 및 자체 인프라를 관리할 수 있는 운영 전문 지식을 가진 팀에 이상적입니다. ClickHouse 클라우드 환경에서 철저히 테스트된 정기적인 업데이트 및 업그레이드와 기능이 풍부한 로드맵을 이점으로 하며, 전문 지원 팀의 지원을 받습니다.

[ClickHouse 프라이빗](/cloud/infrastructure/clickhouse-private)에 대해 자세히 알아보세요.

## ClickHouse 정부 {#clickhouse-government}

ClickHouse 정부는 정부 기관과 공공 부문 조직의 고유하고 까다로운 요구 사항을 충족하도록 설계된 ClickHouse의 자체 배포 버전입니다. 이 배포 옵션은 고도로 안전하고 규정 준수하며 격리된 환경을 제공하며, OpenSSL을 활용한 FIPS 140-3 준수, 추가 시스템 강화 및 취약점 관리를 중점적으로 다룹니다. ClickHouse 클라우드의 강력한 기능을 활용하면서 정부 기관의 특정 운영 및 보안 요구 사항을 해결하기 위해 특수 기능 및 구성 요소를 통합합니다. ClickHouse 정부를 사용하면 기관이 제어되고 인증된 인프라 내에서 민감한 데이터에 대한 고성능 분석을 달성할 수 있으며, 공공 부문 요구 사항에 맞춘 전문 지원을 받습니다.

[ClickHouse 정부](/cloud/infrastructure/clickhouse-government)에 대해 자세히 알아보세요.
