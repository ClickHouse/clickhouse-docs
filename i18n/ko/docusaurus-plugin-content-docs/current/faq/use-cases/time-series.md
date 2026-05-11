---
slug: /faq/use-cases/time-series
title: 'ClickHouse를 시계열 데이터베이스로 사용할 수 있습니까?'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse를 시계열 데이터베이스로 사용하는 방법을 설명하는 페이지'
doc_type: 'guide'
keywords: ['시계열', '시간 기반 데이터', '사용 사례', '시간 기반 분석', 'timeseries']
---



# ClickHouse를 시계열 데이터베이스로 사용할 수 있습니까? \{#can-i-use-clickhouse-as-a-time-series-database\}

_참고: ClickHouse를 사용한 시계열 분석의 추가 예시는 블로그 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)를 참조하십시오._

ClickHouse는 [OLAP](../../faq/general/olap.md) 워크로드를 위한 범용 데이터 저장 솔루션이며, 별도로 특화된 [시계열 데이터베이스 관리 시스템](https://clickhouse.com/engineering-resources/what-is-time-series-database)도 많이 있습니다. 그럼에도 불구하고 ClickHouse는 [쿼리 실행 속도에 대한 집중](../../concepts/why-clickhouse-is-so-fast.mdx) 덕분에 많은 경우 특화된 시스템을 능가합니다. 이 주제에 대한 다양한 벤치마크가 이미 많이 존재하므로, 여기에서 별도의 벤치마크를 수행하지는 않습니다. 대신, 이와 같은 사용 사례에서 중요하게 활용해야 하는 ClickHouse 기능에 초점을 맞추겠습니다.

우선, 일반적인 시계열 데이터에 최적화된 **[전용 코덱](../../sql-reference/statements/create/table.md#specialized-codecs)**이 있습니다. `DoubleDelta` 및 `Gorilla`와 같은 일반적인 알고리즘이나 `T64`와 같은 ClickHouse 전용 알고리즘을 사용할 수 있습니다.

둘째로, 시계열 쿼리는 보통 하루 또는 일주일 정도의 최근 데이터에만 접근하는 경우가 많습니다. 따라서 빠른 NVMe/SSD 드라이브와 대용량 HDD 드라이브를 함께 갖춘 서버를 사용하는 것이 합리적입니다. ClickHouse의 [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 기능을 사용하면, 최신 핫 데이터를 빠른 드라이브에 보관하고 시간이 지남에 따라 점진적으로 느린 드라이브로 이동하도록 설정할 수 있습니다. 요구 사항에 따라 더 오래된 데이터를 롤업하거나 제거하도록 설정하는 것도 가능합니다.

ClickHouse의 원시 데이터를 저장하고 처리하는 철학과는 다소 상충하지만, 더 엄격한 지연 시간 또는 비용 요구 사항을 충족하기 위해 [materialized view](../../sql-reference/statements/create/view.md)를 사용할 수도 있습니다.
