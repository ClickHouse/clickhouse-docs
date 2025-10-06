---
'slug': '/faq/use-cases/key-value'
'title': 'ClickHouseをキー-バリューストレージとして使用できますか？'
'toc_hidden': true
'toc_priority': 101
'description': 'ClickHouseがキー-バリューストレージとして使用できるかどうかについてのよくある質問に答えます。'
'doc_type': 'reference'
---


# Can I use ClickHouse as a key-value storage? {#can-i-use-clickhouse-as-a-key-value-storage}

短い答えは**「いいえ」**です。キー・バリューのワークロードは、ClickHouseを使用しないべきケースのリストで上位に位置しています。結局のところ、これは[OLAP](../../faq/general/olap.md)システムであり、多くの優れたキー・バリュー・ストレージシステムが存在します。

ただし、キー・バリューに似たクエリのためにClickHouseを使用することに意味がある状況もあるかもしれません。通常は、主なワークロードが分析的な性質を持ち、ClickHouseに適合する低予算の製品であり、しかし同時にリクエストスループットがそれほど高くなく、厳しいレイテンシー要件がないキー・バリューパターンが必要な二次プロセスも存在します。無制限の予算があれば、この二次ワークロードのために追加のキー・バリュー・データベースをインストールしていたでしょうが、実際にはもうひとつのストレージシステムを維持する追加コスト（監視、バックアップなど）があり、それを避けたいと考えるかもしれません。

もし推奨に反してClickHouseに対してキー・バリューに似たクエリを実行することに決めた場合、以下のいくつかのヒントがあります：

- ClickHouseでポイントクエリが高価である主要な理由は、主な[MergeTreeテーブルエンジンファミリー](../..//engines/table-engines/mergetree-family/mergetree.md)のスパース主インデックスです。このインデックスは各特定のデータ行を指し示すことはできず、代わりに各N番目の行を指し示し、システムは隣接するN番目の行から目的の行にスキャンしなければならず、その過程で過剰なデータを読み取ります。キー・バリューのシナリオにおいては、`index_granularity`設定でNの値を減少させることが有用かもしれません。
- ClickHouseは各カラムを別々のファイルセットに保持しているため、1つの完全な行を組み立てるにはそれらのファイルを全て通過する必要があります。カラムの数は線形に増加するため、キー・バリューのシナリオでは多くのカラムを使用せず、すべてのペイロードを単一の`String`カラムにエンコードすることを検討する価値があります。JSON、Protobufなど、適切なシリアライズ形式を使用することが考えられます。
- [Join](../../engines/table-engines/special/join.md)テーブルエンジンを通常の`MergeTree`テーブルの代わりに使用し、データを取得するために[joinGet](../../sql-reference/functions/other-functions.md#joinget)関数を利用するという代替アプローチがあります。これによりクエリパフォーマンスが向上する可能性がありますが、使いやすさや信頼性に問題があるかもしれません。こちらに[使い方の例](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)があります。
