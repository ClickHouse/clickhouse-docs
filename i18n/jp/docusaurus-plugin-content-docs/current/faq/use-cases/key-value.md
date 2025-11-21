---
slug: /faq/use-cases/key-value
title: 'ClickHouse をキーバリュー型ストレージとして利用できますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse をキーバリュー型ストレージとして利用できるかどうかに関する、よくある質問への回答。'
doc_type: 'reference'
keywords: ['key-value', 'data model', 'use case', 'schema design', 'storage pattern']
---



# ClickHouseをキーバリューストレージとして使用できますか？ {#can-i-use-clickhouse-as-a-key-value-storage}

端的に言えば、答えは**「いいえ」**です。キーバリューワークロードは、ClickHouseを使用すべき<span class="text-danger">**ではない**</span>ケースのリストの上位に位置します。ClickHouseは[OLAP](../../faq/general/olap.md)システムであり、優れたキーバリューストレージシステムは数多く存在します。

ただし、ClickHouseをキーバリュー的なクエリに使用することが妥当な状況もあります。通常、これは主要なワークロードが分析的な性質を持ち、ClickHouseに適合する低予算の製品において、リクエストスループットがそれほど高くなく、厳格なレイテンシ要件のないキーバリューパターンを必要とする二次的なプロセスが存在する場合です。無制限の予算があれば、この二次的なワークロードのために別のキーバリューデータベースを導入するでしょうが、現実には、もう1つのストレージシステムを維持するための追加コスト(監視、バックアップなど)が発生し、これを回避したい場合があります。

推奨に反してClickHouseに対してキーバリュー的なクエリを実行することを決定した場合、以下のヒントを参考にしてください:

- ClickHouseでポイントクエリが高コストである主な理由は、主要な[MergeTreeテーブルエンジンファミリー](../..//engines/table-engines/mergetree-family/mergetree.md)のスパースプライマリインデックスにあります。このインデックスは各データ行を個別に指すことができず、N番目ごとの行を指すため、システムは隣接するN番目の行から目的の行までスキャンする必要があり、その過程で余分なデータを読み取ります。キーバリューシナリオでは、`index_granularity`設定でNの値を減らすことが有用な場合があります。
- ClickHouseは各カラムを個別のファイルセットに保持するため、1つの完全な行を組み立てるには、それらのファイルすべてを処理する必要があります。ファイル数はカラム数に比例して増加するため、キーバリューシナリオでは、多数のカラムの使用を避け、すべてのペイロードをJSON、Protobuf、またはその他の適切なシリアライゼーション形式でエンコードした単一の`String`カラムに格納することが有効な場合があります。
- 通常の`MergeTree`テーブルの代わりに[Join](../../engines/table-engines/special/join.md)テーブルエンジンを使用し、[joinGet](../../sql-reference/functions/other-functions.md#joinGet)関数でデータを取得する代替アプローチがあります。これにより、より優れたクエリパフォーマンスが得られる可能性がありますが、使いやすさや信頼性に関する問題が生じる場合があります。[使用例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)を参照してください。
