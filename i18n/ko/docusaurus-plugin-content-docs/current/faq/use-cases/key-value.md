---
'slug': '/faq/use-cases/key-value'
'title': 'ClickHouse를 키-값 저장소로 사용할 수 있습니까?'
'toc_hidden': true
'toc_priority': 101
'description': 'ClickHouse를 키-값 저장소로 사용할 수 있는지에 대한 자주 묻는 질문에 답변합니다.'
'doc_type': 'reference'
'keywords':
- 'key-value'
- 'data model'
- 'use case'
- 'schema design'
- 'storage pattern'
---


# Can I use ClickHouse as a key-value storage? {#can-i-use-clickhouse-as-a-key-value-storage}

짧은 답은 **"아니오"**입니다. 키-값 워크로드는 <span class="text-danger">**사용하지 말아야 할**</span> 경우 목록에서 상위에 위치해 있습니다. ClickHouse는 결국 [OLAP](../../faq/general/olap.md) 시스템이며, 훌륭한 키-값 저장 시스템이 많이 존재합니다.

하지만 ClickHouse를 키-값 유사 쿼리에 사용하는 것이 여전히 의미가 있는 상황이 있을 수 있습니다. 일반적으로 그 경우는 주요 워크로드가 분석적 성격을 가지며 ClickHouse에 잘 맞는 저비용 제품이며, 그러나 그 외에 키-값 패턴이 필요한 2차 프로세스가 요청 처리량이 그리 높지 않고 엄격한 대기 시간 요구 사항이 없는 경우입니다. 예산이 무제한이라면 이 2차 워크로드를 위해 별도의 키-값 데이터베이스를 설치했겠지만, 실제로는 추가적인 저장 시스템을 유지 관리하는 데 드는 비용(모니터링, 백업 등)이 발생하기 때문에 이를 피하고 싶을 수 있습니다.

추천 사항에 반하여 ClickHouse에서 키-값 유사 쿼리를 실행하기로 결정했다면, 다음과 같은 팁이 있습니다:

- ClickHouse에서 포인트 쿼리가 비싼 주요 이유는 주요 [MergeTree 테이블 엔진 가족](../..//engines/table-engines/mergetree-family/mergetree.md)의 스파스 기본 인덱스입니다. 이 인덱스는 특정 데이터의 각 행을 가리키지 않고, N 번째 행을 가리키며 시스템은 이웃 N 번째 행에서 원하는 행까지 스캔해야 하므로 과도한 데이터를 읽게 됩니다. 키-값 시나리오에서는 `index_granularity` 설정을 통해 N 값을 줄이는 것이 유용할 수 있습니다.
- ClickHouse는 각 컬럼을 별도의 파일 집합에 저장하므로 완전한 한 행을 조립하려면 각 파일을 모두 통과해야 합니다. 컬럼 수가 증가함에 따라 파일 수가 선형적으로 증가하기 때문에, 키-값 시나리오에서는 많은 컬럼을 사용하지 않고 모든 페이로드를 JSON, Protobuf 또는 적절한 직렬화 형식으로 인코딩된 단일 `String` 컬럼에 넣는 것이 좋을 수 있습니다.
- [Join](../../engines/table-engines/special/join.md) 테이블 엔진을 사용하는 대안 방법이 있으며, 일반 `MergeTree` 테이블 대신 [joinGet](../../sql-reference/functions/other-functions.md#joinGet) 함수를 사용하여 데이터를 검색합니다. 이 방법은 더 나은 쿼리 성능을 제공할 수 있지만 사용성과 신뢰성 문제를 가질 수 있습니다. 다음은 [사용 예제](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)입니다.
