---
slug: /faq/use-cases/key-value
title: ClickHouseをキー・バリュー・ストレージとして使用できますか？
toc_hidden: true
toc_priority: 101
---

# ClickHouseをキー・バリュー・ストレージとして使用できますか？ {#can-i-use-clickhouse-as-a-key-value-storage}

短い答えは**「いいえ」**です。キー・バリュー・ワークロードは、ClickHouseを使用しないべきケースのリストの上位に位置します。結局のところ、ClickHouseは[OLAP](../../faq/general/olap.md)システムであり、優れたキー・バリュー・ストレージシステムがたくさん存在します。

しかし、キー・バリューに似たクエリのためにClickHouseを使用することが意味を持つ状況もあるかもしれません。通常は、主なワークロードが分析的性質で、ClickHouseにうまくフィットする低予算の製品の場合ですが、比較的リクエストスループットが高くなく、厳密なレイテンシ要件のないキー・バリュー・パターンが必要な二次的プロセスもあります。無制限の予算があれば、この二次的ワークロードのために別のキー・バリュー・データベースをインストールしていたでしょうが、実際には、もう一つのストレージシステムを維持するための追加コスト（監視、バックアップなど）が避けられた方が良い場合もあります。

推奨に反してClickHouseでキー・バリューに似たクエリを実行することを決定した場合、以下のヒントがあります：

- ClickHouseでポイントクエリが高価になる主な理由は、主な[MergeTreeテーブルエンジンファミリー](../..//engines/table-engines/mergetree-family/mergetree.md)のスパース主キーです。このインデックスは、データの特定の行を指すことができず、代わりにN番目の行を指し、システムは隣接するN番目の行から目的の行までスキャンする必要があり、その過程で過剰なデータを読み込むことになります。キー・バリュー・シナリオでは、`index_granularity`設定でNの値を減らすことが有効かもしれません。
- ClickHouseは各カラムを別々のファイルセットに保持しているため、1つの完全な行を構成するにはそれぞれのファイルを通過する必要があります。カラムの数は数量的に増加するため、キー・バリュー・シナリオでは、多くのカラムを使用せず、すべてのペイロードをJSON、Protobuf、または論理的な形式にエンコードされた単一の`String`カラムにまとめることが有益かもしれません。
- [Join](../../engines/table-engines/special/join.md)テーブルエンジンを使用し、通常の`MergeTree`テーブルの代わりに[joinGet](../../sql-reference/functions/other-functions.md#joinget)関数を使ってデータを取得する代替アプローチもあります。これによりクエリパフォーマンスが向上する可能性がありますが、いくつかの使いやすさや信頼性の問題があるかもしれません。こちらが[使用例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)です。
