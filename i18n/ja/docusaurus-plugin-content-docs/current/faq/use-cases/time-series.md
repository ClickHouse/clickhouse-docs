---
slug: /faq/use-cases/time-series
title: ClickHouseを時系列データベースとして使用できますか？
toc_hidden: true
toc_priority: 101
---

# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_注: 追加の時系列分析の例については、ブログの[ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)をご覧ください。_

ClickHouseは[OLAP](../../faq/general/olap.md)ワークロード向けの汎用データストレージソリューションですが、多くの特化型[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も存在します。それにもかかわらず、ClickHouseの[クエリ実行速度の重視](../../concepts/why-clickhouse-is-so-fast.md)により、多くのケースで特化型システムを上回る性能を発揮します。このテーマに関する独立したベンチマークが多数存在するため、ここで新たにベンチマークを実施することはありません。代わりに、このユースケースにおいて重要なClickHouseの機能に焦点を当てましょう。

まず第一に、典型的な時系列を生成するための**[特化型コーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があります。`DoubleDelta`や`Gorilla`といった一般的なアルゴリズムや、ClickHouse特有の`T64`などがあります。

次に、時系列クエリはしばしば最新のデータのみを対象とします。例えば、1日または1週間前のデータです。そのため、高速なNVMe/SSDドライブと高容量のHDDドライブの両方を備えたサーバーを使用することが理にかなっています。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree.md/##table_engine-mergetree-multiple-volumes)機能を使用すると、新鮮でホットなデータを高速ドライブに保持し、古くなるにつれて徐々に遅いドライブに移動するように設定できます。要件によっては、さらに古いデータのロールアップや削除も可能です。

生データを保存および処理するというClickHouseの哲学に反するものではありますが、[物化ビュー](../../sql-reference/statements/create/view.md)を利用することで、より厳しいレイテンシやコストの要件に適合させることもできます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseにおける時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
