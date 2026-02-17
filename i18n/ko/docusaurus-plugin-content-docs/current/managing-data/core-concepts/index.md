---
slug: /managing-data/core-concepts
title: '핵심 개념'
description: 'ClickHouse 작동 방식의 핵심 개념을 학습합니다'
keywords: ['concepts', 'part', 'partition', 'primary index']
doc_type: 'guide'
---

이 섹션에서는
ClickHouse가 어떻게 작동하는지와 관련된 핵심 개념 일부를 다룹니다.

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | ClickHouse에서 테이블 파트가 무엇인지 알아봅니다.                                                                                                                                                                      |
| [Table partitions](./partitions.mdx)             | 테이블 파티션이 무엇이며 어떤 용도로 사용되는지 알아봅니다.                                                                                                                                                           |
| [Table part merges](./merges.mdx)                | 테이블 파트 병합이 무엇이며 어떤 용도로 사용되는지 알아봅니다.                                                                                                                                                        |
| [Table shards and replicas](./shards.mdx)        | 테이블 세그먼트와 레플리카가 무엇이며 어떤 용도로 사용되는지 알아봅니다.                                                                                                                                               |
| [Primary indexes](./primary-indexes.mdx)         | ClickHouse의 희소 기본 인덱스를 소개하고, 쿼리 실행 중 불필요한 데이터를 효율적으로 건너뛰는 데 어떻게 도움이 되는지 설명합니다. 인덱스가 어떻게 생성되고 사용되는지, 그 효과를 관찰할 수 있는 예제와 도구와 함께 설명합니다. 또한 고급 사용 사례와 모범 사례를 다루는 심층 분석 문서로 연결합니다. |
| [Architectural Overview](./academic_overview.mdx) | VLDB 2024 학술 논문을 기반으로 ClickHouse 아키텍처 전체 구성 요소를 간결하게 정리한 학술 개요입니다.                                                                                                                  |