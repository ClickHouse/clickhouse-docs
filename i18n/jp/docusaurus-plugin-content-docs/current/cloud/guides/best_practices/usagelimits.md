---
slug: /cloud/bestpractices/usage-limits
sidebar_label: 'サービス制限'
title: '利用制限'
description: 'ClickHouse Cloud における推奨される利用制限について説明します'
doc_type: 'reference'
keywords: ['利用制限', 'クォータ', 'ベストプラクティス', 'リソース管理', 'クラウド機能']
---

ClickHouse はその速度と信頼性で知られていますが、最適なパフォーマンスは
特定の運用パラメータの範囲内で動作させることで発揮されます。たとえば、テーブル、
データベース、あるいはパーツが多すぎるとパフォーマンスに悪影響を及ぼす可能性があります。
これを防ぐために、ClickHouse Cloud は複数の運用面にわたって制限（ガードレール）を設けています。
これらのガードレールの詳細を以下に示します。

:::tip
これらのガードレールのいずれかに達した場合、ユースケースの実装が
十分に最適化されていない可能性があります。サポートチームまでお問い合わせいただければ、
ガードレールを超過しないようユースケースの改善をご支援するか、
あるいは制御された形で制限を引き上げる方法を一緒に検討いたします。
:::

| Dimension                     | Limit                                                      |
|-------------------------------|------------------------------------------------------------|
| **Databases**                 | 1000                                                       |
| **Tables**                    | 5000                                                       |
| **Columns**                   | ∼1000（コンパクト形式よりもワイドフォーマットを推奨）      |
| **Partitions**                | 50k                                                        |
| **Parts**                     | インスタンス全体で 100k                                   |
| **Part size**                 | 150gb                                                      |
| **Services per organization** | 20（ソフトリミット）                                      |
| **Services per warehouse**    | 5（ソフトリミット）                                       |
| **Replicas per service**      | 20（ソフトリミット）                                      |  
| **Low cardinality**           | 10k 以下                                                   |
| **Primary keys in a table**   | データを十分に絞り込める 4～5 個                           |
| **Query concurrency**         | 1000（レプリカあたり）                                    |
| **Batch ingest**              | 1M 行を超えるものはシステムによって 1M 行単位のブロックに分割されます |

:::note
Single Replica Services の場合、データベース数の上限は 100 に、
テーブル数の上限は 500 に制限されます。さらに、Basic Tier Services の
ストレージは 1 TB に制限されます。
:::