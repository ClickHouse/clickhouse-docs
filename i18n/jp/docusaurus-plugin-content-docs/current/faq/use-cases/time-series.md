---
slug: /faq/use-cases/time-series
title: 'ClickHouseを時系列データベースとして使用できますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouseを時系列データベースとして使用する方法を説明するページ'
---


# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_注: 追加の時系列解析のためのClickHouseの使用例については、ブログの[ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)をご覧ください。_

ClickHouseは、[OLAP](../../faq/general/olap.md)ワークロードに適した汎用のデータストレージソリューションですが、多くの専門的な[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も存在します。それにもかかわらず、ClickHouseの[クエリ実行速度の向上](../../concepts/why-clickhouse-is-so-fast.md)に対する焦点は、多くの場合、専門システムよりも優れたパフォーマンスを提供します。このトピックに関する多くの独立したベンチマークがありますので、ここで実施することはありません。代わりに、これがあなたの使用ケースであれば重要なClickHouseの機能に焦点を当てましょう。

まず、**[特化型コーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があり、典型的な時系列データを処理します。一般的なアルゴリズムの`DoubleDelta`や`Gorilla`、またはClickHouseに特有の`T64`などがあります。

次に、時系列クエリは通常、最新のデータ、例えば1日または1週間古いデータにアクセスします。そのため、高速なNVMe/SSDドライブと高容量のHDDドライブを備えたサーバーを使用することが理にかなっています。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能を使用すると、新鮮なホットデータを高速ドライブに保持し、年齢とともに徐々に遅いドライブに移動させることができます。また、要件があれば、さらに古いデータのロールアップや削除も可能です。

生データを保存および処理するというClickHouseの哲学に反しますが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用して、より厳しいレイテンシやコスト要件に対応することもできます。

## 関連コンテンツ {#related-content}

- ブログ: [ClickHouseでの時系列データの取り扱い](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)
