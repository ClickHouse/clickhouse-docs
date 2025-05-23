---
'slug': '/cloud/bestpractices/usage-limits'
'sidebar_label': 'Usage Limits'
'title': 'Usage limits'
'description': 'Describes the recommended usage limits in ClickHouse Cloud'
---



While ClickHouse is known for its speed and reliability, optimal performance is achieved within certain operating parameters. For example, having too many tables, databases or parts could negatively impact performance. To avoid this, Clickhouse Cloud has guardrails set up for several types of items. You can find details of these guardrails below.

:::tip
もしこれらのガードレールにぶつかった場合、最適化されていない方法でユースケースを実装している可能性があります。サポートチームにお問い合わせいただければ、ガードレールを超えないようにユースケースを洗練するお手伝いを喜んでさせていただきます。また、制御された方法でガードレールを引き上げる方法を一緒に考えることもできます。
:::

| 次元 | 限界 |
|-----------|-------|
|**データベース**| 1000|
|**テーブル**| 5000|
|**カラム**| ∼1000 (コンパクトよりもワイドフォーマットが推奨されます)|
|**パーティション**| 50k|
|**パーツ**| 100k（インスタンス全体）|
|**パートサイズ**| 150gb|
|**組織ごとのサービス**| 20（ソフトリミット）|
|**倉庫ごとのサービス**| 5（ソフトリミット）|
|**低順序数**| 10k以下|
|**テーブル内の主キー**| データを十分にフィルターする4-5個|
|**クエリの同時実行**| 1000|
|**バッチ取り込み**| 1Mを超えるものは、システムによって1M行のブロックに分割されます|

:::note
シングルレプリカサービスの場合、データベースの最大数は100に制限され、テーブルの最大数は500に制限されます。さらに、ベーシックティアサービスのストレージは1 TBに制限されています。
:::
