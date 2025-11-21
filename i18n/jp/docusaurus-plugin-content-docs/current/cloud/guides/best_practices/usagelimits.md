---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'サービス制限'
title: '利用制限'
description: 'ClickHouse Cloud における推奨利用制限について説明します'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

ClickHouse はその高速性と信頼性で知られていますが、最適なパフォーマンスは
一定の動作パラメータの範囲内で運用された場合に達成されます。たとえば、テーブル、
データベース、あるいはパーツが多すぎるとパフォーマンスに悪影響を及ぼす可能性があります。
これを防ぐために、ClickHouse Cloud は複数の運用上の側面にわたって制限を設けています。
これらの制限（ガードレール）の詳細を以下に示します。

:::tip
これらのガードレールのいずれかの制限に達した場合、そのユースケースの実装が
最適化されていない可能性があります。弊社のサポートチームまでご連絡ください。
ガードレールを超えないようにユースケースの改善をお手伝いするか、
あるいは制御された形でガードレールを引き上げる方法を一緒に検討いたします。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（コンパクト形式よりもワイド形式を推奨）              |
| **Partitions**                | 50k                                                        |
| **Parts**                     | インスタンス全体で 100k                                   |
| **Part size**                 | 150 GB                                                     |
| **Services per organization** | 20（ソフトリミット）                                      |
| **Services per warehouse**    | 5（ソフトリミット）                                       |
| **Replicas per service**      | 20（ソフトリミット）                                      |  
| **Low cardinality**           | 10k 以下                                                   |
| **Primary keys in a table**   | データを十分に絞り込める 4〜5 個                           |
| **Query concurrency**         | 1000（レプリカごと）                                      |
| **Batch ingest**              | 1M を超えるものは、システムによって 1M 行ブロックに分割される |

:::note
Single Replica Services の場合、データベースの最大数は 100 に、
テーブルの最大数は 500 に制限されます。加えて、Basic Tier Services のストレージは
1 TB に制限されています。
:::