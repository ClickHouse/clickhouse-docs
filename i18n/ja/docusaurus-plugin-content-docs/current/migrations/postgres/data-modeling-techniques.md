---
slug: /migrations/postgresql/data-modeling-techniques
title: データモデリング技術
description: PostgreSQLからClickHouseへの移行におけるデータモデリング
keywords: [postgres, postgresql, migrate, migration, data modeling]
---

> これはPostgreSQLからClickHouseへの移行に関するガイドの**パート3**です。この内容は入門的なものであり、ユーザーがClickHouseのベストプラクティスに従った初期の機能的なシステムを展開するのを助けることを目的としています。複雑なトピックは避けており、完全に最適化されたスキーマが得られるわけではなく、ユーザーが生産システムを構築し、学習の基盤を作るためのしっかりとした基礎を提供します。

Postgresから移行するユーザーには、[ClickHouseでのデータモデリングガイド](/data-modeling/schema-design)を読むことをお勧めします。このガイドは同じStack Overflowのデータセットを使用し、ClickHouse機能を使用した複数のアプローチを探求します。

## パーティション {#partitions}

Postgresユーザーは、パフォーマンスと管理性を向上させるために、テーブルを小さく管理しやすい部分、すなわちパーティションに分割するテーブルパーティショニングの概念に慣れ親しんでいるでしょう。このパーティショニングは、指定されたカラム（例えば日付）の範囲、定義されたリスト、またはキーに対してハッシュを使用して達成できます。これにより、管理者は日付範囲や地理的な位置などの特定の基準に基づいてデータを整理できます。パーティショニングは、パーティションの剪定を通じてデータアクセスを迅速にすることでクエリパフォーマンスを向上させるのに役立ち、全体のテーブルではなく個別のパーティションでの操作が可能になることでバックアップやデータの削除などのメンテナンス作業にも役立ちます。さらに、パーティショニングはPostgreSQLデータベースのスケーラビリティを大幅に向上させ、負荷を複数のパーティションに分散させることができます。

ClickHouseでは、テーブルが最初に定義される際に`PARTITION BY`句を使用してパーティショニングを指定します。この句には任意のカラムに対するSQL式を含めることができ、その結果が行が送信されるパーティションを定義します。

<br />

<img src={require('../images/postgres-partitions.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

データパーツはディスク上の各パーティションに論理的に関連付けられており、個別にクエリを実行できます。以下の例では、`posts`テーブルを年でパーティション分けしており、`toYear(CreationDate)`という式を使用しています。行がClickHouseに挿入される際、この式は各行に対して評価され、結果のパーティションにルーティングされます（もしその年の最初の行であれば、パーティションが作成されます）。

```sql
 CREATE TABLE posts
(
	`Id` Int32 CODEC(Delta(4), ZSTD(1)),
	`PostTypeId` Enum8('Question' = 1, 'Answer' = 2, 'Wiki' = 3, 'TagWikiExcerpt' = 4, 'TagWiki' = 5, 'ModeratorNomination' = 6, 'WikiPlaceholder' = 7, 'PrivilegeWiki' = 8),
	`AcceptedAnswerId` UInt32,
	`CreationDate` DateTime64(3, 'UTC'),
...
	`ClosedDate` DateTime64(3, 'UTC')
)
ENGINE = MergeTree
ORDER BY (PostTypeId, toDate(CreationDate), CreationDate)
PARTITION BY toYear(CreationDate)
```

## パーティションの活用方法 {#applications-of-partitions}

ClickHouseにおけるパーティショニングは、Postgresと似たような用途がありますが、いくつかの微妙な違いがあります。具体的には以下の通りです。

- **データ管理** - ClickHouseでは、ユーザーは主にパーティショニングをデータ管理機能と考えるべきであり、クエリ最適化技術ではありません。キーに基づいて論理的にデータを分離することで、各パーティションを独立して操作できるようになります（例えば削除）。これにより、パーティションを移動させたり、したがってサブセットを[ストレージ層](/integrations/s3#storage-tiers)間で効率的に移動することができます。また、[データを削除する/クラスターから効率的に削除する](/sql-reference/statements/alter/partition)ことも可能です。以下の例では、2008年の投稿を削除しています。

```sql
SELECT DISTINCT partition
FROM system.parts
WHERE `table` = 'posts'

┌─partition─┐
│ 2008  	│
│ 2009  	│
│ 2010  	│
│ 2011  	│
│ 2012  	│
│ 2013  	│
│ 2014  	│
│ 2015  	│
│ 2016  	│
│ 2017  	│
│ 2018  	│
│ 2019  	│
│ 2020  	│
│ 2021  	│
│ 2022  	│
│ 2023  	│
│ 2024  	│
└───────────┘

17 rows in set. Elapsed: 0.002 sec.
	
	ALTER TABLE posts
	(DROP PARTITION '2008')

Ok.

0 rows in set. Elapsed: 0.103 sec.
```

- **クエリ最適化** - パーティションはクエリパフォーマンスを助けることができますが、これはアクセスポイントによく依存します。クエリがごく少数のパーティション（理想的には1つ）をターゲットにしている場合、パフォーマンスは改善する可能性があります。これは、パーティショニングキーが主キーに含まれていない場合やそれでフィルタリングを行う場合にのみ通常有効です。しかし、多くのパーティションをカバーする必要があるクエリは、パーティショニングを使用しない場合よりもパフォーマンスが低下する可能性があります（パーティショニングの結果としてパーツが増えることがあるため）。パーティションを1つターゲットにする利点は、パーティショニングキーがすでに主キーの早いエントリにある場合はさらに薄くなるか、場合によっては存在しない場合もあります。パーティショニングは、各パーティション内の値がユニークである場合、[GROUP BYクエリを最適化するために使用されることもあります](/engines/table-engines/mergetree-family/custom-partitioning-key#group-by-optimisation-using-partition-key)。しかし一般的に、ユーザーは主キーが最適化されていることを確認し、特定の予測可能なサブセットにアクセスパターンがある例外的なケースのみでパーティショニングをクエリ最適化技術として考慮すべきです。例えば、日ごとのパーティショニングで、最もクエリが前日に集中する場合などです。

## パーティションに関する推奨事項 {#recommendations-for-partitions}

ユーザーはパーティショニングをデータ管理技術と考慮すべきです。時間系列データを操作する際には、クラスターからデータが期限切れになる必要がある場合に最適です。例えば、最も古いパーティションは[単純に削除することができる](/sql-reference/statements/alter/partition#alter_drop-partition)からです。

**重要:** パーティショニングキーの式が高いカーディナリティのセットを生成しないことを確認してください。すなわち、100以上のパーティションを作成することは避けるべきです。例えば、クライアント識別子や名前のような高いカーディナリティのカラムでデータをパーティション分けしないでください。その代わりに、クライアント識別子や名前をORDER BY式の最初のカラムにしてください。

> 内部的には、ClickHouseは[データのパーツを作成します](/optimize/sparse-primary-indexes#clickhouse-index-design)。データが挿入されると、パーツの数が増加します。クエリパフォーマンスが低下するほどの過剰な数のパーツを防ぐためには、背景の非同期プロセスでパーツを統合します。パーツの数が事前に設定された制限を超えると、ClickHouseは挿入時に例外を投げます - 「パーツが多すぎる」というエラーです。これは通常の操作下では発生すべきではなく、ClickHouseが誤って設定されているか、間違って使用されている場合（多くの小さな挿入など）にのみ発生します。

> パーツは各パーティションごとに独立して作成されるため、パーティションの数が増えるとパーツの数も増加します。すなわち、パーツの数はパーティションの数の倍数になります。したがって、高いカーディナリティのパーティショニングキーはこのエラーを引き起こす可能性があるため、避けるべきです。

## マテリアライズドビューとプロジェクション {#materialized-views-vs-projections}

Postgresは単一のテーブルに対して複数のインデックスを作成することを許可しており、さまざまなアクセスパターンに対する最適化を可能にしています。この柔軟性により、管理者や開発者は特定のクエリや運用ニーズに合わせてデータベースのパフォーマンスを調整できるようになります。ClickHouseのプロジェクションの概念は、完全に類似しているわけではありませんが、ユーザーがテーブルに対して複数の`ORDER BY`句を指定できるようにします。

ClickHouseの[データモデリングドキュメント](/data-modeling/schema-design)では、マテリアライズドビューをClickHouseで使用して集計を事前に計算し、行を変換し、さまざまなアクセスパターンに対してクエリを最適化する方法を探求しています。

これらの後者については、マテリアライズドビューが元のテーブルとは異なる順序のキーでターゲットテーブルに行を送信する例を[提供しました](/materialized-view#lookup-table)。

例えば、以下のクエリを考えてみましょう。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.040 sec. Processed 90.38 million rows, 361.59 MB (2.25 billion rows/s., 9.01 GB/s.)
Peak memory usage: 201.93 MiB.
```

このクエリでは、`UserId`が順序キーではないため、90百万行全てをスキャンする必要があります（早くスキャンされることは認めます）。以前、私たちは`PostId`のルックアップとして機能するマテリアライズドビューを使用してこの問題を解決しました。プロジェクションを使用して同じ問題を解決することができます。以下のコマンドは、`ORDER BY user_id`のプロジェクションを追加します。

```sql
ALTER TABLE comments ADD PROJECTION comments_user_id (
SELECT * ORDER BY UserId
)

ALTER TABLE comments MATERIALIZE PROJECTION comments_user_id
```

プロジェクションを作成する前に、最初にプロジェクションを作成してからマテリアライズする必要があることに注意してください。この後者のコマンドは、データを二重にディスクに保存する原因となります。データを生成する際にプロジェクションも定義できるため、以下のようにデータが挿入されると自動的に維持されます。

```sql
CREATE TABLE comments
(
	`Id` UInt32,
	`PostId` UInt32,
	`Score` UInt16,
	`Text` String,
	`CreationDate` DateTime64(3, 'UTC'),
	`UserId` Int32,
	`UserDisplayName` LowCardinality(String),
	PROJECTION comments_user_id
	(
    	SELECT *
    	ORDER BY UserId
	)
)
ENGINE = MergeTree
ORDER BY PostId
```

`ALTER`コマンドによってプロジェクションを作成すると、その作成は`MATERIALIZE PROJECTION`コマンドが発行されたときに非同期で行われます。この操作の進捗を確認するには、以下のクエリを実行し、`is_done=1`を待つことができます。

```sql
SELECT
	parts_to_do,
	is_done,
	latest_fail_reason
FROM system.mutations
WHERE (`table` = 'comments') AND (command LIKE '%MATERIALIZE%')

   ┌─parts_to_do─┬─is_done─┬─latest_fail_reason─┐
1. │       	1 │   	0 │                	│
   └─────────────┴─────────┴────────────────────┘

1 row in set. Elapsed: 0.003 sec.
```

上記のクエリを繰り返すと、追加のストレージの代償としてパフォーマンスが大幅に向上したことがわかります。

```sql
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

   ┌──────────avg(Score)─┐
1. │ 0.18181818181818182 │
   └─────────────────────┘

1 row in set. Elapsed: 0.008 sec. Processed 16.36 thousand rows, 98.17 KB (2.15 million rows/s., 12.92 MB/s.)
Peak memory usage: 4.06 MiB.
```

`EXPLAIN`コマンドを使用すると、このクエリに対してプロジェクションが使用されたことを確認できます。

```sql
EXPLAIN indexes = 1
SELECT avg(Score)
FROM comments
WHERE UserId = 8592047

	┌─explain─────────────────────────────────────────────┐
 1. │ Expression ((Projection + Before ORDER BY))     	│
 2. │   Aggregating                                   	│
 3. │ 	Filter                                      	│
 4. │   	ReadFromMergeTree (comments_user_id)      	│
 5. │   	Indexes:                                  	│
 6. │     	PrimaryKey                              	│
 7. │       	Keys:                                 	│
 8. │         	UserId                              	│
 9. │       	Condition: (UserId in [8592047, 8592047]) │
10. │       	Parts: 2/2                            	│
11. │       	Granules: 2/11360                     	│
	└─────────────────────────────────────────────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

## プロジェクションを使用するタイミング {#when-to-use-projections}

プロジェクションは、自動的にデータが挿入される際に維持されるため、新しいユーザーにとって魅力的な機能です。さらに、クエリはプロジェクションが可能な限り活用される唯一のテーブルに送信できますので、応答時間を短縮することができます。

<br />

<img src={require('../images/postgres-projections.png').default}    
  class="image"
  alt="NEEDS ALT"
  style={{width: '600px'}} />

<br />

これは、ユーザーが適切な最適化されたターゲットテーブルを選択するか、フィルターに応じてクエリを再記述しなければならないマテリアライズドビューとは対照的です。これはユーザーアプリケーションにより大きな重点を置き、クライアント側の複雑さを増加させます。

これらの利点にもかかわらず、プロジェクションにはユーザーが意識すべき固有の制限があり、慎重に展開する必要があります。

- プロジェクションは、ソーステーブルと（隠し）ターゲットテーブルで異なるTTLを使用できませんが、マテリアライズドビューでは異なるTTLを使用できます。
- プロジェクションは[現時点ではサポートされていません](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes) `optimize_read_in_order`を（隠し）ターゲットテーブルに対してはサポートしていません。
- プロジェクションを持つテーブルでは、軽量更新や削除はサポートされていません。
- マテリアライズドビューはチェーンできることができます。1つのマテリアライズドビューのターゲットテーブルが別のマテリアライズドビューのソーステーブルであることが可能です。しかし、これはプロジェクションでは不可能です。
- プロジェクションは結合をサポートしませんが、マテリアライズドビューは支持します。
- プロジェクションはフィルター（WHERE句）をサポートしませんが、マテリアライズドビューは支持します。

プロジェクションを使用することをお勧めする状況は以下の通りです。

- データの完全な再順序付けが必要な場合。理論的にはプロジェクションの式で`GROUP BY`を使用できますが、集計を維持するにはマテリアライズドビューがより効果的です。クエリオプティマイザはシンプルな再順序を利用するプロジェクションを利用する可能性が高いです。ユーザーは、この式内でストレージフットプリントを削減するためにカラムのサブセットを選択できます。
- ユーザーが関連するストレージフットプリントとデータを二重に書くことのオーバーヘッドの増加を気にしない場合。挿入速度への影響をテストし、[ストレージのオーバーヘッドを評価すること](/data-compression/compression-in-clickhouse)が推奨されます。

[パート4はこちら](/migrations/postgresql/rewriting-queries)。
