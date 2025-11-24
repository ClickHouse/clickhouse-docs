---
'slug': '/faq/use-cases/time-series'
'title': 'ClickHouse를 시간 시리즈 DATABASE로 사용할 수 있나요?'
'toc_hidden': true
'toc_priority': 101
'description': 'ClickHouse를 시간 시리즈 DATABASE로 사용하는 방법에 대한 페이지'
'doc_type': 'guide'
'keywords':
- 'time series'
- 'temporal data'
- 'use case'
- 'time-based analytics'
- 'timeseries'
---


# Can I use ClickHouse as a time-series database? {#can-i-use-clickhouse-as-a-time-series-database}

_참고: ClickHouse에서 시간 시계열 데이터를 사용한 추가 예제는 블로그 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)를 확인하세요._

ClickHouse는 [OLAP](../../faq/general/olap.md) 워크로드를 위한 일반적인 데이터 저장 솔루션이며, 많은 전문화된 [시간 시계열 데이터베이스 관리 시스템](https://clickhouse.com/engineering-resources/what-is-time-series-database)이 존재합니다. 그럼에도 불구하고 ClickHouse의 [쿼리 실행 속도에 대한 집중](../../concepts/why-clickhouse-is-so-fast.mdx) 덕분에 많은 경우 전문화된 시스템보다 뛰어난 성능을 발휘할 수 있습니다. 이 주제에 대한 독립적인 벤치마크가 많이 있으므로, 여기서 진행하지는 않겠습니다. 대신, 이 사용 사례에 중요할 ClickHouse의 기능에 집중해 보겠습니다.

우선, **[전문화된 코덱](../../sql-reference/statements/create/table.md#specialized-codecs)**이 있어 일반적인 시간 시계열 데이터를 처리할 수 있습니다. `DoubleDelta` 및 `Gorilla`와 같은 일반 알고리즘이나 ClickHouse에 특정한 `T64`와 같은 알고리즘이 있습니다.

둘째, 시간 시계열 쿼리는 종종 최근 데이터, 즉 하루 또는 일주일 된 데이터만을 조회합니다. 빠른 NVMe/SSD 드라이브와 고용량 HDD 드라이브를 모두 갖춘 서버를 사용하는 것이 합리적입니다. ClickHouse [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 기능을 통해 새로운 핫 데이터를 빠른 드라이브에 유지하고, 시간이 지남에 따라 이를 느린 드라이브로 점진적으로 이동시키도록 설정할 수 있습니다. 요구 사항에 따라 더 오래된 데이터의 롤업 또는 삭제도 가능합니다.

ClickHouse의 원시 데이터를 저장하고 처리하는 철학에 반하는 것이긴 하지만, [물리화된 뷰](../../sql-reference/statements/create/view.md)를 사용하여 더 엄격한 지연 시간이나 비용 요구 사항에 맞출 수 있습니다.
