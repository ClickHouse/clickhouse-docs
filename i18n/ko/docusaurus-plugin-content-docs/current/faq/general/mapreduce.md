---
slug: /faq/general/mapreduce
title: '왜 MapReduce와 같은 것을 사용하지 않습니까?'
toc_hidden: true
toc_priority: 110
description: '이 페이지에서는 MapReduce 대신 ClickHouse를 사용해야 하는 이유를 설명합니다'
keywords: ['MapReduce']
doc_type: 'reference'
---



# 왜 MapReduce와 같은 것을 사용하지 않는 것일까요? \{#why-not-use-something-like-mapreduce\}

MapReduce와 같은 시스템은 분산 정렬에 기반해 reduce 연산을 수행하는 분산 컴퓨팅 시스템이라고 할 수 있습니다. 이 범주에서 가장 일반적인 오픈 소스 솔루션은 [Apache Hadoop](http://hadoop.apache.org)입니다. 

이러한 시스템은 지연 시간이 매우 크기 때문에 온라인 쿼리에는 적합하지 않습니다. 다시 말해, 웹 인터페이스의 백엔드로 사용할 수 없습니다. 이러한 유형의 시스템은 실시간 데이터 업데이트에도 적합하지 않습니다. 연산 결과와 모든 중간 결과(있을 경우)가 단일 서버의 RAM에 상주하는 경우, 즉 온라인 쿼리에서 보통 나타나는 상황에서는 reduce 연산을 수행하는 데 분산 정렬이 최선의 방법이 아닙니다. 이런 경우에는 해시 테이블이 reduce 연산을 수행하기 위한 최적의 방법입니다. map-reduce 작업을 최적화하는 일반적인 접근 방식은 RAM에서 해시 테이블을 사용해 사전 집계(부분 reduce)를 수행하는 것입니다. 이 최적화는 사용자가 수동으로 수행합니다. 분산 정렬은 단순한 map-reduce 작업을 실행할 때 성능 저하를 일으키는 주요 원인 중 하나입니다.

대부분의 MapReduce 구현은 클러스터에서 임의의 코드를 실행할 수 있게 해 줍니다. 그러나 선언적 쿼리 언어는 실험을 빠르게 수행해야 하는 OLAP 용도에 더 적합합니다. 예를 들어, Hadoop에는 Hive와 Pig가 있습니다. 또한 Spark용 Cloudera Impala나 Shark(구식), Spark SQL, Presto, Apache Drill도 고려할 수 있습니다. 이러한 작업을 실행할 때의 성능은 특수화된 시스템에 비해 매우 비효율적이며, 상대적으로 높은 지연 시간 때문에 이러한 시스템들을 웹 인터페이스의 백엔드로 사용하는 것은 현실적이지 않습니다.
