---
slug: /faq/use-cases/time-series
title: ClickHouseを時系列データベースとして使用できますか？
toc_hidden: true
toc_priority: 101
---


# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_Note: ClickHouseを用いた時系列分析の追加例については、ブログ [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) をご覧ください。_

ClickHouseは、[OLAP](../../faq/general/olap.md) ワークロード向けの汎用データストレージソリューションですが、多くの専用の[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も存在します。それにもかかわらず、ClickHouseの[クエリ実行速度](../../concepts/why-clickhouse-is-so-fast.md)への焦点は、多くの場合、専用システムを上回る性能を発揮します。このトピックに関しては多くの独立したベンチマークがあるため、ここで新たにベンチマークを行うつもりはありません。代わりに、もしそれがあなたのユースケースであれば、ClickHouseの重要な機能に焦点を当てましょう。

まず第一に、典型的な時系列データを扱うための**[特殊なコーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があります。これは `DoubleDelta` や `Gorilla` などの一般的なアルゴリズム、またはClickHouse特有の `T64` などを含みます。

第二に、時系列クエリは通常、最近のデータ（例えば、一日または一週間前のデータ）にのみアクセスします。したがって、高速なNVMe/SSDドライブと大容量のHDDドライブの両方を持つサーバーを使用することが理にかなっています。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能により、新鮮なホットデータを高速ドライブに保持し、時間が経つにつれて遅いドライブに移動させる配置が可能です。要件によっては、さらに古いデータのロールアップや削除も可能です。

ClickHouseの生データを保存および処理するという哲学に反するかもしれませんが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用することで、より厳しいレイテンシやコスト要件に適合させることができます。

## 関連コンテンツ {#related-content}

- ブログ: [Working with time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
