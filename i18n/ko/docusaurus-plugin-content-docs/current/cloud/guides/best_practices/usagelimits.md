---
slug: /cloud/bestpractices/usage-limits
sidebar_label: '서비스 한도'
title: '사용량 한도'
description: 'ClickHouse Cloud에서 권장되는 사용량 한도에 대해 설명합니다'
doc_type: 'reference'
keywords: ['사용량 한도', 'quotas', '모범 사례', '리소스 관리', 'Cloud 기능']
---

ClickHouse는 속도와 안정성으로 잘 알려져 있지만, 최적의 성능은 
특정 운영 매개변수 범위 내에서 달성됩니다. 예를 들어, 테이블, 데이터베이스
또는 파트가 지나치게 많으면 성능에 부정적인 영향을 줄 수 있습니다. 이를 방지하기 위해
ClickHouse Cloud는 여러 운영 측면에서 한도를 적용합니다.
이러한 제한(guardrail)의 세부 내용은 아래에 나와 있습니다.

:::tip
이러한 제한 중 하나에 도달했다면, 사용 사례를 최적화되지 않은 방식으로
구현하고 있을 가능성이 있습니다. 지원 팀에 문의하면,
제한을 초과하지 않도록 사용 사례를 개선할 수 있도록 지원하거나,
통제된 방식으로 한도를 어떻게 늘릴 수 있을지 함께 검토할 수 있습니다.
:::

| Dimension                     | Limit                                                                                             |
|-------------------------------|---------------------------------------------------------------------------------------------------|
| **Databases**                 | 1000                                                                                              |
| **Tables**                    | 5000                                                                                              |
| **Columns**                   | ∼1000 (좁은 형식보다 넓은 형식을 권장)                                                            |
| **Partitions**                | 50k                                                                                               |
| **Parts**                     | 10k ([`max_parts_in_total`](/whats-new/cloud-compatibility#max_parts_in_total-10000) setting 참조) |
| **Part size**                 | 150GB                                                                                             |
| **Services per organization** | 20 (소프트 한계)                                                                                  |
| **Services per warehouse**    | 5 (소프트 한계)                                                                                   |
| **Replicas per service**      | 20 (소프트 한계)                                                                                  |  
| **Low cardinality**           | 10k 이하                                                                                          |
| **Primary keys in a table**   | 데이터를 충분히 필터링할 수 있는 4–5개                                                            |
| **Query concurrency**         | 1000 (레플리카당)                                                                                 |
| **Batch ingest**              | 1M 행을 초과하는 배치는 시스템에서 1M 행 단위 블록으로 분할됨                                    |

:::note
Single Replica Services의 경우 데이터베이스 최대 개수는 100개로 제한되며,
테이블 최대 개수는 500개로 제한됩니다. 추가로 Basic Tier Services의
스토리지는 1TB로 제한됩니다.
:::