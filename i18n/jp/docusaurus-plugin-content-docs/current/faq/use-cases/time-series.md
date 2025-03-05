---
slug: /faq/use-cases/time-series
title: ClickHouseを時系列データベースとして使用できますか？
toc_hidden: true
toc_priority: 101
---


# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_Note: ClickHouseを使用した時系列分析の追加例については、ブログ [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) をご覧ください。_

ClickHouseは、[OLAP](../../faq/general/olap.md)ワークロードのための一般的なデータストレージソリューションですが、特化した[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も多数存在します。それにもかかわらず、ClickHouseの[クエリ実行速度に対する注力](../../concepts/why-clickhouse-is-so-fast.md)により、多くのケースで特化したシステムを上回るパフォーマンスを発揮します。このトピックに関しては多くの独立したベンチマークが存在するため、ここでの実施は行いません。代わりに、このユースケースにおいて重要なClickHouseの機能に焦点を当てましょう。

まず第一に、**[特化したコーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があり、一般的な時系列データを扱うことができます。`DoubleDelta`や`Gorilla`のような一般的なアルゴリズムや、ClickHouse特有の`T64`などがあります。

第二に、時系列クエリは通常、最近のデータ、つまり1日または1週間前のデータにのみアクセスします。それ故に、速いNVMe/SSDドライブと高容量のHDDドライブの両方を備えたサーバーを使用することは理にかなっています。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree.md/##table_engine-mergetree-multiple-volumes)機能を使用すると、迅速なドライブに新鮮なホットデータを保存し、そのデータが古くなるにつれて徐々に遅いドライブに移動させることができます。また、要件に応じて、さらに古いデータのロールアップや削除も可能です。

生データの保存と処理に関するClickHouseの哲学に反するものですが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用することで、より厳しいレイテンシやコストの要件に対応することもできます。

## 関連コンテンツ {#related-content}

- ブログ: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
