---
slug: /faq/use-cases/time-series
title: 'ClickHouse を時系列データベースとして使用できますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse を時系列データベースとして利用する方法について説明するページ'
doc_type: 'guide'
keywords: ['時系列', '時系列データ', 'ユースケース', '時系列分析', 'タイムシリーズ']
---



# ClickHouseを時系列データベースとして使用できますか？ {#can-i-use-clickhouse-as-a-time-series-database}

_注：ClickHouseを用いた時系列分析の追加例については、ブログ記事「[Working with Time series data in ClickHouse](https://clickhouse.com/blog/working-with-time-series-data-and-functions-ClickHouse)」をご参照ください。_

ClickHouseは[OLAP](../../faq/general/olap.md)ワークロード向けの汎用データストレージソリューションであり、一方で専門的な[時系列データベース管理システム](https://clickhouse.com/engineering-resources/what-is-time-series-database)も数多く存在します。しかしながら、ClickHouseの[クエリ実行速度への注力](../../concepts/why-clickhouse-is-so-fast.mdx)により、多くの場合において専門システムを上回る性能を発揮します。このテーマに関する独立したベンチマークは数多く存在するため、ここでは実施しません。代わりに、時系列データベースとして使用する際に重要となるClickHouseの機能に焦点を当てます。

まず第一に、典型的な時系列データに適した**[専用コーデック](../../sql-reference/statements/create/table.md#specialized-codecs)**が用意されています。`DoubleDelta`や`Gorilla`のような一般的なアルゴリズム、または`T64`のようなClickHouse固有のものがあります。

第二に、時系列クエリは1日前や1週間前といった最近のデータのみを対象とすることが多くあります。高速なNVMe/SSDドライブと大容量HDDドライブの両方を備えたサーバーを使用することが合理的です。ClickHouseの[TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl)機能により、新鮮なホットデータを高速ドライブに保持し、時間の経過とともに低速ドライブへ段階的に移動するよう設定できます。要件に応じて、さらに古いデータのロールアップや削除も可能です。

生データの保存と処理というClickHouseの理念には反しますが、[マテリアライズドビュー](../../sql-reference/statements/create/view.md)を使用することで、さらに厳しいレイテンシやコスト要件に対応することができます。
