---
slug: /use-cases/observability/clickstack/tuning-clickstack-schema
title: 'ClickStack 튜닝: 스키마 다듬기'
description: 'Managed ClickStack에서 더 나은 쿼리 성능과 스토리지 효율을 위해 ClickStack 스키마를 다듬습니다'
doc_type: 'guide'
keywords: ['clickstack', '튜닝', '스키마', 'managed', '관측성', '성능', '최적화', '스토리지']
unlisted: true
pagination_prev: null
pagination_next: null
custom_edit_url: null
hide_advert: true
---

ClickStack를 한동안 운영했다면, 기본 스키마가 대부분의 관측성 워크로드를 별다른 변경 없이 처리한다는 점을 이미 느끼셨을 것입니다. 이 페이지는 그것만으로 더 이상 충분하지 않을 때를 위한 것입니다. 예를 들어 쿼리 지연 시간이 늘어나기 시작하거나, 액세스 패턴이 기본 설정에서 벗어난 경우입니다.

실제 운영에서는 대부분 4가지 최적화로 충분한 효과를 볼 수 있습니다. 아래에는 대략적인 작업 난이도 순으로 정리되어 있습니다. 처음 두 가지는 점진적으로 적용할 수 있는 `ALTER TABLE` 변경입니다. 세 번째는 같은 집계가 대시보드에서 반복해서 실행될 때 효과적입니다. 네 번째는 테이블 마이그레이션이 필요하므로 가장 손이 많이 갑니다.

아래 요약은 의도적으로 짧게 작성했습니다. 각 변경의 배경, 벤치마크, 그리고 기존 데이터에 적용하는 방법은 [성능 튜닝](/use-cases/observability/clickstack/performance_tuning)을 참조하십시오.

<VerticalStepper headerLevel="h2">
  ## 자주 쿼리하는 속성 구체화하기 \{#materialize-attributes\}

  `LogAttributes['service.version']`로 필터링하면 ClickHouse는 검사하는 모든 행에 대해 `LogAttributes` 맵 전체를 로드하고 디코딩해야 합니다. 이 속성을 `MATERIALIZED` 컬럼으로 승격하면 동일한 필터가 컬럼 읽기로 바뀌며, 일반적으로 한 자릿수 이상 더 빨라집니다. 컬럼이 생성되면 ClickStack이 필터를 자동으로 재작성하므로, 저장된 검색과 대시보드는 변경 없이 계속 작동합니다.

  실제로 자주 쿼리하는 속성만 선택하십시오. 각 materialized column은 스토리지와 삽입 시점 비용을 추가로 사용하므로, &quot;모든 것을 승격&quot;하기보다 &quot;실제로 사용하는 것만 승격&quot;하는 방식으로 접근해야 합니다.

  ```sql
  ALTER TABLE otel_logs
    ADD COLUMN ServiceVersion LowCardinality(String)
    MATERIALIZED LogAttributes['service.version'];
  ```

  기존 행은 `ALTER TABLE otel_logs MATERIALIZE COLUMN ServiceVersion`도 실행하기 전까지는 새 컬럼 값이 비어 있습니다.

  더 읽어보기: [자주 쿼리하는 속성 구체화하기](/use-cases/observability/clickstack/performance_tuning#materialize-frequently-queried-attributes).

  ## 스킵 인덱스 추가하기 \{#add-skip-indexes\}

  스킵 인덱스를 사용하면 ClickHouse가 필터와 일치할 수 없는 데이터 그래뉼을 제외할 수 있으므로, 전체 스캔이 작고 정밀한 읽기로 바뀝니다. 알아두면 좋은 유형은 3가지입니다.

  * 문자열 컬럼과 `mapKeys`/`*AttributeItems` 배열의 **텍스트 인덱스** (`text(tokenizer = ...)`)입니다. 기본 로그 스키마에는 이미 포함되어 있습니다.
  * 범위 조건으로 필터링하는 숫자 컬럼의 **최소-최대 인덱스**입니다. trace `Duration`이 대표적인 예입니다.
  * 아직 텍스트 인덱스를 지원하지 않는 ClickHouse 버전에서, 높은 카디널리티의 동등 조건 조회에 사용하는 **블룸 필터**입니다.

  ```sql
  ALTER TABLE otel_traces ADD INDEX idx_duration Duration TYPE minmax GRANULARITY 1;
  ALTER TABLE otel_traces MATERIALIZE INDEX idx_duration;
  ```

  스킵 인덱스는 실제로 그래뉼을 가지치기할 때만 평가 비용 대비 효과가 있습니다. 도움이 되었을 것이라고 가정하지 말고, 대표 쿼리에 `EXPLAIN indexes = 1`를 사용해 확인하십시오.

  더 읽어보기: [스킵 인덱스 추가하기](/use-cases/observability/clickstack/performance_tuning#adding-skip-indexes).

  ## 반복되는 집계를 미리 계산하기 \{#materialized-views\}

  대시보드에서 동일한 집계가 반복적으로 실행된다면(오류율 기준 상위 서비스, endpoint별 p99 지연 시간, 분당 요청 수), materialized view가 삽입 시점에 결과를 계산해 작은 롤업 테이블에 기록합니다. 그러면 대시보드는 원시 로그나 trace 대신 롤업 테이블을 조회하게 되며, 비용이 훨씬 적게 듭니다.

  이 방식은 대시보드 조회가 많고 기반 테이블이 클 때 효과적입니다. 대신 삽입 시점의 CPU 비용이 늘어나고, 유지 관리해야 할 두 번째 테이블이 추가됩니다.

  더 읽어보기: [materialized view 활용하기](/use-cases/observability/clickstack/performance_tuning#exploiting-materialized-views).

  ## 액세스 패턴에 맞는 프라이머리 키 선택하기 \{#choose-primary-key\}

  프라이머리 키는 행이 디스크에 어떻게 정렬되는지를 결정합니다. 이 키의 선두 컬럼을 사용하는 필터가 있으면 ClickHouse는 관련 구간으로 바로 seek할 수 있지만, 그런 컬럼으로 시작하지 않는 필터는 전체 파티션을 스캔합니다.

  기본 로그 키 `(toStartOfFiveMinutes(Timestamp), ServiceName, Timestamp)`는 &quot;서비스 X에서 지난 N분 동안 무슨 일이 있었는가&quot;와 같은 쿼리에 유리합니다. 대부분의 쿼리가 다른 컬럼(tenant id, customer id, region)으로 시작한다면, 프라이머리 키가 해당 컬럼으로 시작하도록 변경하는 것이 가장 효과가 큰 변경입니다.

  ```sql
  CREATE TABLE otel_logs_v2
  (
    -- otel_logs와 동일한 컬럼
  )
  ENGINE = MergeTree
  ORDER BY (TenantId, ServiceName, Timestamp);
  ```

  ClickHouse는 프라이머리 키를 제자리에서 수정할 수 없으므로, 이는 단순한 `ALTER`가 아니라 테이블 migration입니다. 성능 튜닝 가이드에서는 새 테이블 생성, 수집 경로 전환, 그리고 기존 대시보드가 이전 데이터와 새 데이터 모두에서 계속 작동하도록 `Merge` 테이블을 사용하는 방법을 안내합니다.

  더 읽어보기: [프라이머리 키 수정하기](/use-cases/observability/clickstack/performance_tuning#modifying-the-primary-key).
</VerticalStepper>

## 더 읽어보기 \{#further-reading\}

* [성능 튜닝](/use-cases/observability/clickstack/performance_tuning): 프로젝션과 행 조회 가속을 포함한 전체 가이드입니다.
* [ClickStack에서 사용하는 테이블과 스키마](/use-cases/observability/clickstack/ingesting-data/schemas): 최적화가 기반으로 삼는 표준 DDL입니다.
* [프로덕션 환경으로 전환하기](/use-cases/observability/clickstack/production): 보다 폭넓은 프로덕션 권장 사항입니다.