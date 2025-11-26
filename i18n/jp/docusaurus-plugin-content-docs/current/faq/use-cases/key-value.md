---
slug: /faq/use-cases/key-value
title: 'ClickHouse をキー・バリュー型ストレージとして利用できますか？'
toc_hidden: true
toc_priority: 101
description: 'ClickHouse をキー・バリュー型ストレージとして利用できるかどうかという、よくある質問に答えます。'
doc_type: 'reference'
keywords: ['キー・バリュー', 'データモデル', 'ユースケース', 'スキーマ設計', 'ストレージパターン']
---



# ClickHouse をキー・バリュー型ストレージとして使用できますか？ {#can-i-use-clickhouse-as-a-key-value-storage}

短い答えは **「いいえ」** です。キー・バリュー型ワークロードは、ClickHouse を<span class="text-danger">**使用すべきではない**</span>ケースの代表例のひとつです。結局のところ ClickHouse は [OLAP](../../faq/general/olap.md) システムであり、キー・バリュー型ストレージには他にも優れたシステムが多数存在します。

とはいえ、キー・バリュー型に近いクエリに ClickHouse を使うことに一定の意味がある状況もあります。典型的には、主なワークロードは分析的な性質を持ち ClickHouse によく適合している一方で、高いリクエストスループットや厳密なレイテンシ要件を必要としないキー・バリュー型パターンを用いる副次的な処理が存在する、低予算のプロダクトなどです。もし無制限の予算があれば、この副次的なワークロード向けに別途キー・バリュー型データベースを導入するところですが、現実にはストレージシステムをもう 1 つ運用するための追加コスト（監視、バックアップなど）が発生し、これを避けたい場合があります。

推奨に反して ClickHouse に対してキー・バリュー型に近いクエリを実行することにした場合、次のようなヒントがあります。

- ClickHouse でポイントクエリが高コストになる主な理由は、[MergeTree テーブルエンジンファミリー](../..//engines/table-engines/mergetree-family/mergetree.md)のスパースなプライマリインデックスにあります。このインデックスは各行を直接指すことはできず、N 行ごとにしかポインタを持てないため、目的の行を得るには近傍の N 行ごとの位置からスキャンしていく必要があり、その過程で余分なデータを読み取ることになります。キー・バリュー型のシナリオでは、`index_granularity` 設定で N の値を小さくすることが有用な場合があります。
- ClickHouse では各カラムが別々のファイル群として保存されるため、1 行を組み立てるにはそれぞれのファイルを読み出す必要があります。ファイル数はカラム数に比例して増加するため、キー・バリュー型シナリオでは多くのカラムの使用を避け、すべてのペイロードを JSON や Protobuf など、何らかのシリアライゼーション形式でエンコードした単一の `String` カラムに格納することを検討する価値があります。
- 通常の `MergeTree` テーブルの代わりに [Join](../../engines/table-engines/special/join.md) テーブルエンジンと、データ取得に [joinGet](../../sql-reference/functions/other-functions.md#joinGet) 関数を使用する代替アプローチもあります。これによりクエリ性能が向上する可能性がありますが、使い勝手や信頼性の面でいくつかの問題が生じる場合があります。[利用例はこちら](https://github.com/ClickHouse/ClickHouse/blob/master/tests/queries/0_stateless/00800_versatile_storage_join.sql#L49-L51)を参照してください。
