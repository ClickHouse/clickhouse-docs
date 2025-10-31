---
'slug': '/cloud/bestpractices/usage-limits'
'sidebar_label': 'サービス制限'
'title': '使用制限'
'description': 'ClickHouse Cloudにおける推奨使用制限について説明します。'
'doc_type': 'reference'
---

While ClickHouse is known for its speed and reliability, optimal performance is 
achieved within certain operating parameters. For example, having too many tables,
databases, or parts can negatively impact performance. To prevent this, ClickHouse
Cloud enforces limits across several operational dimensions. 
The details of these guardrails are listed below.

:::tip
もしこれらのガードレールの1つに直面している場合、あなたのユースケースが最適化されていない方法で実装されている可能性があります。サポートチームにご連絡いただければ、ガードレールを超えないようにユースケースを改善するお手伝いを喜んでさせていただきます。または、制御された方法でガードレールを拡張する方法を一緒に検討できます。 
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000 (ワイドフォーマットがコンパクトよりも推奨されます)                |
| **Partitions**                | 50k                                                        |
| **Parts**                     | 100k across the entire instance                            |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20 (ソフト)                                                  |
| **Services per warehouse**    | 5 (ソフト)                                                   |
| **Replicas per service**      | 20 (ソフト)                                                  |  
| **Low cardinality**           | 10k or less                                                |
| **Primary keys in a table**   | 4-5 that sufficiently filter down the data                 |
| **Query concurrency**         | 1000 (per replica)                                         |
| **Batch ingest**              | 1M を超えるものはシステムによって 1M 行のブロックに分割されます |

:::note
シングルレプリカサービスの場合、データベースの最大数は100に制限され、テーブルの最大数は500に制限されます。また、ベーシックティアサービスのストレージは1TBに制限されています。
:::
