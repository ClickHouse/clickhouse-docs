---
slug: /faq/use-cases/time-series
title: 'ClickHouse を時系列データベースとして使用できますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse を時系列データベースとして利用する方法を説明するページ'
doc_type: 'guide'
keywords: ['時系列', '時系列データ', 'ユースケース', '時間ベースの分析', 'タイムシリーズ']
---



# ClickHouse を時系列データベースとして使用できますか？ \\{#can-i-use-clickhouse-as-a-time-series-database\\}

_注: ClickHouse を用いた時系列分析の追加例については、ブログ記事 [Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse) を参照してください。_

ClickHouse は、多数の特化した [時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database) が存在する一方で、[OLAP](../../faq/general/olap.md) ワークロード向けの汎用的なデータストレージソリューションです。しかしながら、ClickHouse の[クエリ実行速度へのフォーカス](../../concepts/why-clickhouse-is-so-fast.mdx)により、多くのケースで特化型システムを上回ることができます。このテーマについては多数の独立したベンチマークが公開されているため、ここで改めて行うことはしません。その代わりに、そのようなユースケースで重要となる ClickHouse の機能に焦点を当てます。

まず、典型的な時系列データを効率的に圧縮できる **[specialized codecs](../../sql-reference/statements/create/table.md#specialized-codecs)** が用意されています。`DoubleDelta` や `Gorilla` のような一般的なアルゴリズムに加えて、`T64` のような ClickHouse 固有のものもあります。

次に、時系列クエリは 1 日前や 1 週間前といった直近データのみにアクセスすることがよくあります。そのため、高速な NVMe/SSD ドライブと大容量の HDD ドライブを併用するサーバーを使うのが理にかなっています。ClickHouse の [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) 機能を利用すると、新しいホットデータを高速なドライブ上に保持し、時間の経過とともに徐々に低速なドライブへ移動させるように設定できます。要件に応じて、さらに古いデータをロールアップしたり削除したりすることも可能です。

ClickHouse の生データを保存・処理するという思想には反しますが、[materialized views](../../sql-reference/statements/create/view.md) を利用して、レイテンシやコストの要件をさらに厳しく満たすこともできます。
