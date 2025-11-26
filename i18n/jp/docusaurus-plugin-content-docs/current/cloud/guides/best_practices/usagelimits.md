---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'サービス制限'
title: '利用制限'
description: 'ClickHouse Cloud における推奨される利用制限について説明します'
doc_type: 'reference'
keywords: ['usage limits', 'quotas', 'best practices', 'resource management', 'cloud features']
---

ClickHouse はその高速性と信頼性で知られていますが、最適なパフォーマンスは
特定の運用パラメータの範囲内で最も効果的に発揮されます。たとえば、テーブルや
データベース、パーツが多すぎるとパフォーマンスに悪影響を与える可能性があります。
これを防ぐために、ClickHouse Cloud では複数の運用面にわたって上限を設けています。
これらの制限値の詳細は以下のとおりです。

:::tip
これらの制限値のいずれかに到達した場合、ユースケースの実装が
最適化されていない可能性があります。サポートチームにお問い合わせいただければ、
制限値を超えないようにユースケースの改善をお手伝いするほか、
管理された方法で制限値を引き上げられるかどうかを一緒に検討いたします。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | 約 1000（コンパクト形式よりワイド形式を推奨）             |
| **Partitions**                | 50k                                                        |
| **Parts**                     | インスタンス全体で 100k                                   |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 1 組織あたり 20（ソフト制限）                             |
| **Services per warehouse**    | 1 ウェアハウスあたり 5（ソフト制限）                      |
| **Replicas per service**      | 1 サービスあたり 20（ソフト制限）                         |  
| **Low cardinality**           | 10k 以下                                                   |
| **Primary keys in a table**   | データを十分に絞り込める主キーを 4～5 個                   |
| **Query concurrency**         | 1000（1 レプリカあたり）                                  |
| **Batch ingest**              | 1M を超えるものはシステムによって 1M 行ごとのブロックに分割されます |

:::note
Single Replica Services の場合、データベース数は最大 100、
テーブル数は最大 500 に制限されます。さらに、Basic Tier Services の
ストレージは 1 TB に制限されます。
:::