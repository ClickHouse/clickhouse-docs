---
'slug': '/faq/use-cases/time-series'
'title': 'ClickHouseを時系列データベースとして使用することは可能ですか？'
'toc_hidden': true
'toc_priority': 101
'description': 'ClickHouseを時系列データベースとして使用する方法について説明するページ'
---




# Can I Use ClickHouse As a Time-Series Database? {#can-i-use-clickhouse-as-a-time-series-database}

_Note: Please see the blog [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) for additional examples of using ClickHouse for time series analysis._

ClickHouseは、[OLAP](../../faq/general/olap.md) ワークロード用の汎用データストレージソリューションですが、多くの専門の[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も存在します。それにもかかわらず、ClickHouseの[クエリ実行速度の重視](../../concepts/why-clickhouse-is-so-fast.md) により、専門のシステムを上回るパフォーマンスを発揮することが多いです。このトピックに関しては、多くの独立したベンチマークが存在するため、ここで実施することはありません。代わりに、そのユースケースに重要なClickHouseの機能に焦点を当てましょう。

まず第一に、典型的な時系列データを処理するための**[専門的なコーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があります。`DoubleDelta`や`Gorilla`のような一般的なアルゴリズム、またはClickHouse専用の`T64`などです。

第二に、時系列クエリはしばしば最近のデータ、例えば1日または1週間前のデータにのみアクセスします。高速なNVMe/SSDドライブと大容量のHDDドライブの両方を兼ね備えたサーバーを使用することが理にかなっています。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能を使用すると、新鮮なホットデータを高速ドライブに保持し、データが古くなるにつれて徐々に遅いドライブに移動できます。要件が求める場合、さらに古いデータのロールアップや削除も可能です。

生データをストレージして処理するというClickHouseの哲学に反しますが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用して、より厳しいレイテンシやコストの要件に適合させることができます。

## Related Content {#related-content}

- Blog: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
