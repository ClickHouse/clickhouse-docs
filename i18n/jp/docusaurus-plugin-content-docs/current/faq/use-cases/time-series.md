---
'slug': '/faq/use-cases/time-series'
'title': 'ClickHouseを時系列 DATABASE として使用できますか？'
'toc_hidden': true
'toc_priority': 101
'description': 'ClickHouseを時系列 DATABASE として使用する方法を説明するページ'
'doc_type': 'guide'
---


# Can I use ClickHouse as a time-series database? {#can-i-use-clickhouse-as-a-time-series-database}

_Note: 詳細な例については、ブログ[ClickHouseにおける時系列データの操作](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)をご覧ください。_

ClickHouseは、[OLAP](../../faq/general/olap.md)ワークロード向けの汎用データストレージソリューションですが、特化した[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も多数存在します。それにもかかわらず、ClickHouseの[クエリ実行速度に対する焦点](../../concepts/why-clickhouse-is-so-fast.mdx)により、多くのケースで特化システムを上回るパフォーマンスを発揮します。このトピックについては多くの独立したベンチマークが存在するため、ここで新たに実施することはありません。代わりに、特定のユースケースにおいて重要なClickHouseの機能に焦点を当てましょう。

まず第一に、標準的な時系列用の**[特化したコーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があります。`DoubleDelta`や`Gorilla`といった一般的なアルゴリズムや、ClickHouse特有の`T64`があります。

第二に、時系列クエリは一般に最新のデータ、例えば1日または1週間前のデータにのみアクセスすることが多いです。高速なNVMe/SSDドライブと大容量のHDDドライブの両方を持つサーバーを使用することが理にかなります。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能を使うことで、フレッシュなホットデータを高速ドライブに保持し、年数が経つにつれて徐々に遅いドライブに移動するように設定できます。要件に応じて、さらに古いデータのロールアップまたは削除も可能です。

生データの保存と処理というClickHouseの哲学に反することになりますが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用することで、さらに厳しいレイテンシーやコストの要件に適合させることができます。
