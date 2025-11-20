---
slug: /faq/use-cases/time-series
title: 'ClickHouse を時系列データベースとして使えますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse を時系列データベースとして活用する方法を説明するページ'
doc_type: 'guide'
keywords: ['time series', 'temporal data', 'use case', 'time-based analytics', 'timeseries']
---



# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_注：ClickHouseでの時系列分析の追加例については、ブログ記事「[Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)」を参照してください。_

ClickHouseは[OLAP](../../faq/general/olap.md)ワークロード向けの汎用データストレージソリューションですが、多くの特化型[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)が存在します。それにもかかわらず、ClickHouseの[クエリ実行速度への注力](../../concepts/why-clickhouse-is-so-fast.mdx)により、多くの場合において特化型システムを上回る性能を発揮します。このトピックに関する独立したベンチマークは数多く存在するため、ここでは実施しません。代わりに、このユースケースにおいて重要となるClickHouseの機能に焦点を当てます。

まず、典型的な時系列データに適した**[特化型コーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**があります。`DoubleDelta`や`Gorilla`のような一般的なアルゴリズム、または`T64`のようなClickHouse固有のものが利用可能です。

次に、時系列クエリは1日前や1週間前といった最近のデータのみにアクセスすることが多くあります。高速なNVMe/SSDドライブと大容量HDDドライブの両方を備えたサーバーを使用することが合理的です。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能により、新しいホットデータを高速ドライブに保持し、時間の経過とともに低速ドライブへ段階的に移動するよう設定できます。要件に応じて、さらに古いデータのロールアップや削除も可能です。

生データの保存と処理というClickHouseの理念に反するものの、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用することで、さらに厳しいレイテンシやコスト要件に対応できます。
