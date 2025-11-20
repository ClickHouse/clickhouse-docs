---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'Service limits'
title: '利用制限'
description: 'ClickHouse Cloud における推奨利用制限について説明します'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

ClickHouse はその高速性と信頼性で知られていますが、最適なパフォーマンスは
特定の動作パラメータの範囲内で発揮されます。たとえば、テーブル、データベース、
パーツが多すぎるとパフォーマンスに悪影響を及ぼす可能性があります。これを防ぐために、
ClickHouse Cloud は複数の運用上の側面に対して制限を設けています。
これらのガードレールの詳細を以下に示します。

:::tip
これらのガードレールのいずれかに抵触した場合は、ユースケースの実装方法が
最適化されていない可能性があります。サポートチームまでお問い合わせいただければ、
ガードレールを超過しないようにユースケースを改善するお手伝いをするとともに、
管理された方法でガードレールの引き上げが可能かどうかを一緒に検討いたします。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000 (コンパクト形式よりもワイド形式を推奨)                  |
| **Partitions**                | 50k                                                        |
| **Parts**                     | インスタンス全体で 100k                                    |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20 (soft)                                                  |
| **Services per warehouse**    | 5 (soft)                                                   |
| **Replicas per service**      | 20 (soft)                                                  |  
| **Low cardinality**           | 10k 以下                                                   |
| **Primary keys in a table**   | データを十分に絞り込める主キーを 4〜5 個                      |
| **Query concurrency**         | 1000 (レプリカあたり)                                      |
| **Batch ingest**              | 1M を超えるものはシステムによって 1M 行ごとのブロックに分割されます |

:::note
Single Replica Services の場合、データベース数の上限は 100、テーブル数の上限は 500 に
制限されます。さらに、Basic Tier Services のストレージは 1 TB に制限されます。
:::