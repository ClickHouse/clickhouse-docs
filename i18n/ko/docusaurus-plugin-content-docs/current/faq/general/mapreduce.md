---
'slug': '/faq/general/mapreduce'
'title': '왜 MapReduce와 같은 것을 사용하지 않을까요?'
'toc_hidden': true
'toc_priority': 110
'description': '이 페이지에서는 ClickHouse를 사용해야 하는 이유에 대해 설명합니다.'
'keywords':
- 'MapReduce'
'doc_type': 'reference'
---


# Why not use something like MapReduce? {#why-not-use-something-like-mapreduce}

우리는 MapReduce와 같은 시스템을 분산 컴퓨팅 시스템으로 언급할 수 있으며, 여기서 reduce 작업은 분산 정렬에 기반합니다. 이 범주의 가장 일반적인 오픈 소스 솔루션은 [Apache Hadoop](http://hadoop.apache.org)입니다.

이러한 시스템은 높은 대기 시간으로 인해 온라인 쿼리에 적합하지 않습니다. 다시 말해, 웹 인터페이스의 백엔드로 사용할 수 없습니다. 이러한 유형의 시스템은 실시간 데이터 업데이트에 유용하지 않습니다. 만약 작업의 결과와 모든 중간 결과(있는 경우)가 단일 서버의 RAM에 위치한다면, 분산 정렬은 reduce 작업을 수행하는 최선의 방법이 아닙니다. 이러한 경우에는 해시 테이블이 reduce 작업을 수행하는 최적의 방법입니다. map-reduce 작업을 최적화하는 일반적인 방법은 RAM에서 해시 테이블을 사용한 사전 집계(부분 reduce)입니다. 사용자가 이 최적화를 수동으로 수행합니다. 분산 정렬은 간단한 map-reduce 작업을 실행할 때 성능 저하의 주요 원인 중 하나입니다.

대부분의 MapReduce 구현은 클러스터에서 임의의 코드를 실행할 수 있도록 합니다. 그러나 선언적 쿼리 언어는 OLAP에 더 적합하여 실험을 빠르게 실행할 수 있습니다. 예를 들어, Hadoop에는 Hive와 Pig가 있습니다. 또한 Cloudera Impala 또는 Shark(구식)를 Spark와 함께 고려하고, Spark SQL, Presto, 그리고 Apache Drill도 고려하십시오. 이러한 작업을 실행할 때 성능은 전문화된 시스템에 비해 매우 비효율적이지만, 상대적으로 높은 대기 시간으로 인해 이러한 시스템을 웹 인터페이스의 백엔드로 사용하는 것은 비현실적입니다.
