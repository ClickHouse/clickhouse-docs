---
'sidebar_position': 1
'slug': '/community-wisdom/cost-optimization'
'sidebar_label': '비용 최적화'
'doc_type': 'guide'
'keywords':
- 'cost optimization'
- 'storage costs'
- 'partition management'
- 'data retention'
- 'storage analysis'
- 'database optimization'
- 'clickhouse cost reduction'
- 'storage hot spots'
- 'ttl performance'
- 'disk usage'
- 'compression strategies'
- 'retention analysis'
'title': '교훈 - 비용 최적화'
'description': 'ClickHouse 커뮤니티 밋업에서 실제 생산 예제와 검증된 기법을 통한 비용 최적화 전략.'
---


# 비용 최적화: 커뮤니티 전략 {#cost-optimization}
*이 가이드는 커뮤니티 모임에서 얻은 발견 모음의 일부입니다. 이 페이지의 발견은 ClickHouse를 사용하면서 그들의 특정 경험과 설정에 잘 맞는 비용 최적화와 관련된 커뮤니티의 지혜를 다룹니다. 보다 현실적인 솔루션과 통찰력을 원하신다면 [특정 문제를 통해 탐색](./community-wisdom.md)할 수 있습니다.*

*자세한 내용은 [ClickHouse Cloud가 운영 비용 관리에 어떻게 도움이 되는지 알아보세요](/cloud/overview)*.

## 압축 전략: 프로덕션에서의 LZ4 대 ZSTD {#compression-strategy}

Microsoft Clarity는 수백 테라바이트의 데이터를 처리해야 할 때 압축 선택이 비용에 큰 영향을 미친다는 사실을 발견했습니다. 그들의 규모에서는 저장 공간 절약이 중요하며, 성능과 저장 비용 간의 고전적인 균형을 맞춰야 했습니다. Microsoft Clarity는 모든 계정에서 월 2 페타바이트의 비압축 데이터를 처리하며, 8개 노드에서 시간당 약 60,000 쿼리를 처리하고 수백만 개의 웹사이트에서 수십억 페이지 뷰를 제공합니다. 이 규模에서 압축 전략은 중요한 비용 요소가 됩니다.

그들은 처음에 ClickHouse의 기본 [LZ4](/sql-reference/statements/create/table#lz4) 압축을 사용했지만, [ZSTD](/sql-reference/statements/create/table#zstd)를 사용하여 상당한 비용 절감이 가능하다는 것을 발견했습니다. LZ4는 더 빠르지만, ZSTD는 약간 느린 성능의 대가로 더 나은 압축을 제공합니다. 두 가지 접근 방식을 테스트한 결과, 그들은 저장 공간 절약을 우선시하는 전략적 결정을 내렸습니다. 결과는 상당했습니다: 대형 테이블에서의 50% 저장 공간 절약과 수집 및 쿼리에서의 관리 가능한 성능 영향이었습니다.

**주요 결과:**
- ZSTD 압축을 통한 대형 테이블에서의 50% 저장 공간 절약
- 월 2 페타바이트 데이터 처리 능력
- 수집 및 쿼리에서의 관리 가능한 성능 영향
- 수백 TB 규모에서의 대폭적인 비용 절감

## 열 기반 보존 전략 {#column-retention}

가장 강력한 비용 최적화 기술 중 하나는 실제로 사용되는 열을 분석하는 것입니다. Microsoft Clarity는 ClickHouse의 내장 텔레메트리 기능을 사용하여 정교한 열 기반 보존 전략을 구현합니다. ClickHouse는 열별 저장 사용에 대한 자세한 지표와 쿼리 패턴을포함한 포괄적인 정보를 제공합니다: 어떤 열이 액세스되며, 얼마나 자주, 쿼리 지속 시간 및 전체 사용 통계.

이 데이터 기반 접근 방식은 보존 정책 및 열 생애주기 관리를 위한 전략적 결정을 가능하게 합니다. 이 텔레메트리 데이터를 분석함으로써 Microsoft는 저장 공간이 많이 소모되지만 쿼리가 최소한으로 실행되는 열을 식별할 수 있습니다. 이러한 저사용량 열에 대해서는 공격적인 보존 정책을 시행하여 저장 시간을 30개월에서 단 1개월로 줄이거나, 전혀 쿼리되지 않는 경우 열을 완전히 삭제할 수 있습니다. 이 선택적인 보존 전략은 사용자 경험에 영향을 미치지 않으면서 저장 비용을 줄입니다.

**전략:**
- ClickHouse 텔레메트리를 사용하여 열 사용 패턴 분석
- 높은 저장 공간과 낮은 쿼리 열 식별
- 선택적 보존 정책 구현
- 데이터 기반 결정을 위한 쿼리 패턴 모니터링

**관련 문서**
- [데이터 관리 - 열 수준 TTL](/observability/managing-data)

## 파티션 기반 데이터 관리 {#partition-management}

Microsoft Clarity는 파티셔닝 전략이 성능과 운영 단순성 모두에 영향을 미친다는 것을 발견했습니다. 그들의 접근 방식: 날짜로 파티션, 시간으로 정렬. 이 전략은 청소 효율성 뿐만 아니라 여러 가지 이점을 제공합니다. 고객 비즈니스 서비스에 대한 청구 계산을 단순화하고, 행 기반 삭제를 위한 GDPR 준수 요구 사항을 지원합니다.

**주요 이점:**
- 사소한 데이터 청소 (파티션 드롭 vs 행별 삭제)
- 간소화된 청구 계산
- 파티션 제거를 통한 쿼리 성능 개선
- 쉬운 운영 관리

**관련 문서**
- [데이터 관리 - 파티션](/observability/managing-data#partitions)

## 문자열-정수 변환 전략 {#string-integer-conversion}

분석 플랫폼은 종종 수백만 행에 걸쳐 반복되는 범주형 데이터와 관련된 저장 문제에 직면합니다. Microsoft의 엔지니어링 팀은 검색 분석 데이터에서 이러한 문제를 발견하고 영향을 받는 데이터 세트에서 60% 저장 공간 절약을 달성하는 효과적인 솔루션을 개발했습니다.

Microsoft의 웹 분석 시스템에서 검색 결과는 날씨 카드, 스포츠 정보, 뉴스 기사 및 사실 응답 등 다양한 유형의 답변을 트리거합니다. 각 쿼리 결과는 "weather_answer", "sports_answer" 또는 "factual_answer"와 같은 설명 문자열로 태그가 붙습니다. 수십억 개의 검색 쿼리를 처리하면서 이러한 문자열 값이 ClickHouse에 반복적으로 저장되어 막대한 저장 공간을 소모하고 쿼리 중에 비싼 문자열 비교가 필요했습니다.

Microsoft는 별도의 MySQL 데이터베이스를 사용하여 문자열-정수 매핑 시스템을 구현했습니다. ClickHouse에 실제 문자열을 저장하는 대신 정수 ID만 저장합니다. 사용자가 UI를 통해 쿼리를 실행하고 `weather_answer`의 데이터를 요청할 때, 쿼리 옵티마이저는 먼저 MySQL 매핑 테이블에 문의하여 해당 정수 ID를 얻고, 쿼리를 그 정수를 사용하도록 변환한 후 ClickHouse에 보냅니다.

이 아키텍처는 사용자 경험을 보존합니다. 사람들은 여전히 대시보드에서 `weather_answer`와 같은 의미 있는 레이블을 보지만, 백엔드 저장소와 쿼리는 훨씬 더 효율적인 정수로 작동합니다. 매핑 시스템은 모든 변환을 투명하게 처리하여 사용자 인터페이스나 사용자 작업흐름에 변경이 필요하지 않습니다.

**주요 이점:**
- 영향을 받는 데이터 세트에서 60% 저장 공간 절약
- 정수 비교에서 더 빠른 쿼리 성능
- 조인 및 집계에 대한 메모리 사용량 감소
- 대량 결과 세트에 대한 네트워크 전송 비용 절감

:::note
이것은 Microsoft Clarity의 데이터 시나리오에 특별히 사용되는 예입니다. 모든 데이터를 ClickHouse에 보관하거나 데이터를 ClickHouse로 이동하는 데 제약이 없다면, 대신 [딕셔너리](/dictionary)를 사용해 보십시오.
:::

## 비디오 출처 {#video-sources}

- **[Microsoft Clarity 및 ClickHouse](https://www.youtube.com/watch?v=rUVZlquVGw0)** - Microsoft Clarity 팀
- **[Contentsquare의 ClickHouse 여정](https://www.youtube.com/watch?v=zvuCBAl2T0Q)** - Doron Hoffman & Guram Sigua (ContentSquare)

*이 커뮤니티의 비용 최적화 통찰력은 수백 테라바이트에서 페타바이트의 데이터를 처리하는 회사들의 전략을 나타내며, ClickHouse 운영 비용을 줄이는 실제 접근 방식을 보여줍니다.*
