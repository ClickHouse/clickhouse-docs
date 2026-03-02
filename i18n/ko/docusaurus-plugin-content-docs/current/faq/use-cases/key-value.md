---
slug: /faq/use-cases/key-value
title: 'ClickHouse를 키-값 저장소로 사용할 수 있습니까?'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse를 키-값 저장소로 사용할 수 있는지에 대한 자주 묻는 질문에 대한 답변입니다.'
doc_type: 'reference'
keywords: ['키-값', '데이터 모델', '사용 사례', '스키마 설계', '스토리지 패턴']
---



# ClickHouse를 키-값(key-value) 스토리지로 사용할 수 있습니까? \{#can-i-use-clickhouse-as-a-key-value-storage\}

간단히 말하면 **"아니요"**입니다. 키-값 워크로드는 ClickHouse를 <span class="text-danger">**사용하면 안 되는**</span> 대표적인 사례 중 하나입니다. ClickHouse는 어디까지나 [OLAP](../../faq/general/olap.md) 시스템이며, 이미 훌륭한 키-값 스토리지 시스템들이 많이 존재합니다.

다만 상황에 따라서는 키-값과 유사한 쿼리를 위해 ClickHouse를 사용하는 것이 여전히 의미가 있을 수 있습니다. 보통은 예산이 넉넉하지 않은 제품에서, 주된 워크로드는 분석 중심이라 ClickHouse에 잘 맞지만, 이와 별도로 키-값 패턴이 필요하면서 요청 처리량이 그리 높지 않고 지연 시간 요구 사항도 엄격하지 않은 부차적인 프로세스가 있는 경우입니다. 예산이 무제한이라면 이 부차적인 워크로드를 위해 별도의 키-값 데이터베이스를 추가로 설치했을 것이지만, 실제로는 스토리지 시스템을 하나 더 운영하면서 발생하는 모니터링, 백업 등의 추가 비용을 피하고 싶을 수 있습니다.

권장 사항을 따르지 않고 ClickHouse에 대해 키-값 유사 쿼리를 실행하기로 했다면, 다음 팁을 참고하십시오.

- ClickHouse에서 포인트 쿼리 비용이 높은 핵심 이유는 기본 [MergeTree table engine family](../..//engines/table-engines/mergetree-family/mergetree.md)의 희소(sparse) 기본 인덱스 때문입니다. 이 인덱스는 각 데이터 행을 직접 가리키지 못하고 매 N번째 행만 가리키므로, 시스템은 인접한 N번째 행부터 원하는 행까지 스캔하면서 그 과정에서 불필요한 데이터를 함께 읽어야 합니다. 키-값 시나리오에서는 `index_granularity` 설정을 통해 N 값을 줄이는 것이 도움이 될 수 있습니다.
- ClickHouse는 각 컬럼을 별도의 파일 집합에 저장하므로, 하나의 완전한 행을 구성하려면 해당 컬럼 파일들을 모두 읽어야 합니다. 이 파일 개수는 컬럼 수에 비례하여 선형적으로 증가하므로, 키-값 시나리오에서는 많은 컬럼 사용을 피하고 모든 페이로드를 JSON, Protobuf 등 적절한 직렬화 포맷으로 인코딩한 하나의 `String` 컬럼에 넣는 편이 바람직할 수 있습니다.
- 일반적인 `MergeTree` 테이블 대신 [Join](../../engines/table-engines/special/join.md) table engine과 데이터를 조회하기 위한 [joinGet](../../sql-reference/functions/other-functions.md#joinGet) 함수를 사용하는 대안적인 접근 방식도 있습니다. 이 방법은 더 나은 쿼리 성능을 제공할 수 있지만, 사용성과 신뢰성 측면에서 일부 제약이 있을 수 있습니다. 사용 예시는 [여기](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)를 참고하십시오.
