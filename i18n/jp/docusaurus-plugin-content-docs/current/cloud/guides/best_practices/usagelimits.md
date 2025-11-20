---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'Service limits'
title: '利用制限'
description: 'ClickHouse Cloud における推奨利用制限について説明します'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

ClickHouse は高速かつ信頼性が高いことで知られていますが、最適なパフォーマンスは
特定の運用パラメータの範囲内で発揮されます。たとえば、テーブル・データベース・
パーツが多すぎるとパフォーマンスに悪影響を与える可能性があります。これを防ぐために、
ClickHouse Cloud では複数の運用面に対して制限を設けています。
これらのガードレールの詳細を以下に示します。

:::tip
これらのガードレールのいずれかに達した場合、ユースケースの実装が
最適化されていない可能性があります。サポートチームまでお問い合わせいただければ、
ガードレールを超えないようにユースケースを改善するお手伝いや、
これらの制限を制御された方法で引き上げる方法について一緒に検討いたします。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000 (wide format is preferred to compact)                |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 100k across the entire instance                            |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20 (soft)                                                  |
| **Services per warehouse**    | 5 (soft)                                                   |
| **Replicas per service**      | 20 (soft)                                                  |  
| **Low cardinality**           | 10k or less                                                |
| **Primary keys in a table**   | 4-5 that sufficiently filter down the data                 |
| **Query concurrency**         | 1000 (per replica)                                         |
| **Batch ingest**              | anything > 1M will be split by the system in 1M row blocks |

:::note
Single Replica Service の場合、データベースの最大数は 100、
テーブルの最大数は 500 に制限されます。さらに、Basic Tier Service のストレージは
1 TB に制限されます。
:::