---
slug: /faq/use-cases/key-value
title: ClickHouseをキー値ストレージとして使用できますか？
toc_hidden: true
toc_priority: 101
---


# ClickHouseをキー値ストレージとして使用できますか？ {#can-i-use-clickhouse-as-a-key-value-storage}

短い答えは**「いいえ」**です。キー値ワークロードは、<span class="text-danger">**絶対に**</span> ClickHouseを使用しないべきケースのリストの中で上位に位置しています。結局のところ、ClickHouseは[OLAP](../../faq/general/olap.md)システムであり、優れたキー値ストレージシステムが多数存在します。

ただし、ClickHouseをキー値のようなクエリに使用することが理にかなう状況もあるかもしれません。通常、それは主に分析的な性質を持ち、ClickHouseに適している低予算の製品であり、ただし、厳しいレイテンシ要件がなく、そこまで高いリクエストスループットを必要としないキー値パターンを必要とする二次プロセスも存在しています。無制限の予算があれば、この二次ワークロードのために別のキー値データベースを導入していたでしょうが、実際には、もう一つのストレージシステムを維持するための追加コスト（監視、バックアップなど）があるため、これを避けたい場合があります。

推奨に反してClickHouseに対してキー値のようなクエリを実行することを決定した場合、以下のヒントがあります：

- ClickHouseでポイントクエリが高価な理由の一つは、主要な[MergeTreeテーブルエンジンファミリー](../..//engines/table-engines/mergetree-family/mergetree.md) のスパース主キーインデックスです。このインデックスは特定のデータ行を指すことができず、代わりに各N番目を指し、システムは隣接するN番目の行から目的の行までスキャンして過剰なデータを読み込む必要があります。キー値シナリオでは、`index_granularity`設定を使用してNの値を減少させることが有用かもしれません。
- ClickHouseは各カラムを別々のファイルセットに保持しているため、完全な行を組み立てるにはそれらのファイルをすべて通過する必要があります。カラム数が増えるとその数は線形に増加するので、キー値シナリオでは多くのカラムを使用せず、すべてのペイロードを単一の`String`カラムにエンコードしてJSON、Protobuf、または適切なシリアライズ形式を使用することを避けることを検討する価値があります。
- 通常の`MergeTree`テーブルの代わりに[Join](../../engines/table-engines/special/join.md)テーブルエンジンを使用し、[joinGet](../../sql-reference/functions/other-functions.md#joinget)関数を使用してデータを取得する代替アプローチもあります。これによりクエリのパフォーマンスが向上する可能性がありますが、いくつかの使いやすさや信頼性の問題があるかもしれません。こちらが[使用例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)です。
