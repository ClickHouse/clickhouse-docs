---
description: "2025年の変更履歴"
note: "このファイルはyarn buildで生成されます"
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: "2025"
title: "変更履歴 2025"
doc_type: "changelog"
---

### 目次

**[ClickHouse release v25.10, 2025-10-30](#2510)**<br/>
**[ClickHouse release v25.9, 2025-09-25](#259)**<br/>
**[ClickHouse release v25.8 LTS, 2025-08-28](#258)**<br/>
**[ClickHouse release v25.7, 2025-07-24](#257)**<br/>
**[ClickHouse release v25.6, 2025-06-26](#256)**<br/>
**[ClickHouse release v25.5, 2025-05-22](#255)**<br/>
**[ClickHouse release v25.4, 2025-04-22](#254)**<br/>
**[ClickHouse release v25.3 LTS, 2025-03-20](#253)**<br/>
**[ClickHouse release v25.2, 2025-02-27](#252)**<br/>
**[ClickHouse release v25.1, 2025-01-28](#251)**<br/>
**[2024年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouse release 25.10, 2025-10-31 {#2510}


#### 後方互換性のない変更

* デフォルトの `schema_inference_make_columns_nullable` 設定を変更し、すべてを Nullable にするのではなく、Parquet/ORC/Arrow メタデータに含まれるカラムの `Nullable` であるかどうかの情報を反映するようにしました。テキスト形式については変更ありません。 [#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321)).
* クエリ結果キャッシュは `log_comment` 設定を無視するようになったため、クエリの `log_comment` だけを変更しても、キャッシュミスは発生しなくなりました。`log_comment` を変化させることで意図的にキャッシュを分割していたユーザーが、少数ながら存在していた可能性があります。この変更によりその挙動は変わるため、後方互換性はありません。この目的には設定 `query_cache_tag` を使用してください。[#79878](https://github.com/ClickHouse/ClickHouse/pull/79878)（[filimonov](https://github.com/filimonov)）。
* 以前のバージョンでは、テーブル関数が演算子の実装関数と同じ名前だった場合、そのクエリのフォーマットに一貫性がありませんでした。[#81601](https://github.com/ClickHouse/ClickHouse/issues/81601) をクローズ。[#81977](https://github.com/ClickHouse/ClickHouse/issues/81977) をクローズ。[#82834](https://github.com/ClickHouse/ClickHouse/issues/82834) をクローズ。[#82835](https://github.com/ClickHouse/ClickHouse/issues/82835) をクローズ。EXPLAIN SYNTAX クエリは、常に演算子をフォーマットするわけではなくなり、この新しい挙動により「構文を説明する」という目的がより正確に反映されます。`clickhouse-format`、`formatQuery` などは、クエリ内で関数形式で使用されている場合、それらの関数を演算子としてはフォーマットしません。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JOIN` キーでの `Dynamic` 型の使用を禁止しました。`Dynamic` 型の値を非 `Dynamic` 型と比較すると、予期しない結果を招く可能性があります。`Dynamic` 列は必要な型にキャストすることを推奨します。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` サーバーオプションはデフォルトで有効になっており、現時点では無効化できません。これは後方互換性のある変更です。念のためのお知らせです。この変更は 25.x リリースとのみ前方互換性があります。つまり、新しいリリースをロールバックする必要がある場合は、25.x 系のいずれかのリリースにのみダウングレードできます。 [#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema)).
* 挿入レートが低い場合に ZooKeeper 上に保存される znode を減らすため、`replicated_deduplication_window_seconds` を 1 週間から 1 時間に短縮しました。 [#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema)).
* 設定 `query_plan_use_new_logical_join_step` を `query_plan_use_logical_join_step` に名前変更しました。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新しい構文により、テキストインデックスの tokenizer パラメータをより柔軟かつ表現力豊かに指定できるようになりました。 [#87997](https://github.com/ClickHouse/ClickHouse/pull/87997) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 既存の関数 `hasToken` との整合性を高めるため、関数 `searchAny` と `searchAll` をそれぞれ `hasAnyTokens` と `hasAllTokens` にリネームしました。 [#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze)).
* ファイルシステムキャッシュから `cache_hits_threshold` を削除しました。この機能は、SLRU キャッシュポリシーが導入される前に外部コントリビューターによって追加されたものですが、現在は SLRU があるため、両方をサポートする意味がなくなりました。 [#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` 設定の動作に対する 2 つの小さな変更: - 挿入を拒否すべきかどうかを判断する際に、利用可能バイト数ではなく未予約バイト数を使用するようにしました。バックグラウンドでのマージやミューテーション用の予約が、設定されたしきい値と比べて小さい場合にはそれほど重要ではないかもしれませんが、その方がより正確と思われます。 - これらの設定を system テーブルには適用しないようにしました。その理由は、`query_log` のようなテーブルを引き続き更新したいためです。これはデバッグに大いに役立ちます。system テーブルに書き込まれるデータは通常、実データと比べて小さいため、妥当な `min_free_disk_ratio_to_perform_insert` のしきい値であれば、より長い期間書き込みを継続できるはずです。 [#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end)).
* Keeper の内部レプリケーションで非同期モードを有効にします。Keeper は、従来と同じ動作を維持しつつ、パフォーマンスが向上する可能性があります。23.9 より古いバージョンからアップデートする場合は、まず 23.9 以上にアップデートしてから 25.10 以上にアップデートする必要があります。また、アップデート前に `keeper_server.coordination_settings.async_replication` を 0 に設定し、アップデート完了後に再度有効にすることもできます。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515)（[Antonio Andelic](https://github.com/antonio2368)）。





#### 新機能

* 負の `LIMIT` と負の `OFFSET` のサポートを追加。[#28913](https://github.com/ClickHouse/ClickHouse/issues/28913) をクローズ。[#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照だけを維持します。[#87965](https://github.com/ClickHouse/ClickHouse/pull/87965)（[Kai Zhu](https://github.com/nauu)）。
* 演算子 `IS NOT DISTINCT FROM` (`<=>`) を完全にサポート。[#88155](https://github.com/ClickHouse/ClickHouse/pull/88155)（[simonmichal](https://github.com/simonmichal)）。
* `MergeTree` テーブル内の、対象となるすべてのカラムに対して統計情報を自動作成する機能を追加しました。作成する統計情報の種類をカンマ区切りで指定するテーブルレベル設定 `auto_statistics_types` を追加しました（例: `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ)).
* テキスト用の新しいブルームフィルターインデックス `sparse_gram`。 [#79985](https://github.com/ClickHouse/ClickHouse/pull/79985) ([scanhex12](https://github.com/scanhex12)).
* 新しい `conv` 関数が追加され、異なる基数の間で数値を変換できるようになりました。現在は基数 `2` から `36` までをサポートしています。 [#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator)).
* `LIMIT BY ALL` 構文のサポートを追加しました。`GROUP BY ALL` や `ORDER BY ALL` と同様に、`LIMIT BY ALL` は SELECT 句に含まれるすべての非集約式を自動的に展開し、それらを `LIMIT BY` のキーとして使用します。たとえば、`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` は `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name` と等価です。この機能により、選択したすべての非集約列で制限をかけたい場合に、それらを明示的に列挙する必要がなくなり、クエリを簡潔に記述できます。[#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) をクローズしました。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* ClickHouse で Apache Paimon をクエリできるようにするサポートを追加しました。この統合により、ClickHouse ユーザーは Paimon のデータレイクストレージに直接アクセスして操作できるようになります。 [#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* `studentTTestOneSample` 集約関数を追加しました。 [#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 集約関数 `quantilePrometheusHistogram`。ヒストグラムバケットの上限値と累積値を引数として受け取り、分位点の位置が属するバケットの下限値と上限値の間で線形補間を行います。クラシックなヒストグラムに対する PromQL の `histogram_quantile` 関数と同様に動作します。[#86294](https://github.com/ClickHouse/ClickHouse/pull/86294)（[Stephen Chi](https://github.com/stephchi0)）。
* Delta Lake メタデータファイル用の新しいシステムテーブル。 [#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12))。
* `ALTER TABLE REWRITE PARTS` を追加しました。これはテーブルパーツを一から再作成し、新しい設定をすべて適用して書き換えるものです（たとえば `use_const_adaptive_granularity` のように、新しいパーツに対してのみ適用される設定があるため）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* `SYSTEM RECONNECT ZOOKEEPER` コマンドを追加し、ZooKeeper の切断と再接続を強制できるようにしました（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* `max_named_collection_num_to_warn` および `max_named_collection_num_to_throw` の設定によって、名前付きコレクションの数を制限します。新しいメトリクス `NamedCollection` とエラー `TOO_MANY_NAMED_COLLECTIONS` を追加しました。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos)).
* `startsWith` および `endsWith` 関数向けに、大文字小文字を区別しない最適化済みバリアント `startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8`、`endsWithCaseInsensitiveUTF8` を追加しました。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang)).
* サーバー設定の &quot;resources&#95;and&#95;workloads&quot; セクションを使用して、SQL で `WORKLOAD` および `RESOURCE` 定義を指定できるようにしました。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa)).
* パーツをワイドパーツとして作成する際の最小レベルを指定できる新しいテーブル設定 `min_level_for_wide_part` を追加しました。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm))。
* Keeper クライアントに `cp`/`cpr` および `mv`/`mvr` コマンドの再帰的バリアントを追加しました。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 挿入時のマテリアライズ対象から除外するスキップインデックスのリストを指定するセッション設定（`exclude_materialize_skip_indexes_on_insert`）を追加しました。マージ時のマテリアライズ対象から除外するスキップインデックスのリストを指定する MergeTree テーブル設定（`exclude_materialize_skip_indexes_on_merge`）を追加しました。 [#87252](https://github.com/ClickHouse/ClickHouse/pull/87252) ([George Larionov](https://github.com/george-larionov))。



#### 実験的機能
* ビットスライス形式でベクトルを格納する `QBit` データ型と、パラメータによって精度と速度のトレードオフを制御できる近似ベクトル検索を可能にする `L2DistanceTransposed` 関数を実装しました。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 関数 `searchAll` と `searchAny` は、テキスト列を含まないカラムに対しても動作するようになりました。その場合、デフォルトのトークナイザーを使用します。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus))。



#### パフォーマンスの向上

* JOIN および ARRAY JOIN において、レイジーカラムの複製 (lazy columns replication) を実装しました。Sparse や Replicated のような特殊なカラム表現を、一部の出力フォーマットでフルカラムに変換しないようにしました。これにより、メモリ内での不要なデータコピーを回避します。 [#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar))。
* MergeTree テーブル内のトップレベルの String カラムに対して、圧縮率を向上させ、サブカラムへの効率的なアクセスを可能にするため、オプションの `.size` サブカラムシリアライゼーションを追加しました。シリアライゼーションのバージョン制御および空文字列に対する式の最適化のための新しい MergeTree 設定を導入しました。 [#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* Iceberg に対する順序付き読み込みのサポート。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 一部の JOIN クエリにおいて、実行時に右側サブツリーから Bloom フィルターを構築し、このフィルターを左側サブツリーのスキャンに渡すことで高速化します。これは、`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` のようなクエリで効果を発揮する場合があります。[#84772](https://github.com/ClickHouse/ClickHouse/pull/84772)（[Alexander Gololobov](https://github.com/davenger)）。
* Query Condition Cache (QCC) の適用順序とインテグレーションをリファクタリングすることで、クエリ性能を向上しました。QCC によるフィルタリングはプライマリキーおよびスキップインデックス解析より前に適用されるようになり、不要なインデックス計算が削減されます。インデックス解析は複数のレンジフィルタをサポートするよう拡張され、そのフィルタリング結果は QCC に書き戻されるようになりました。これにより、インデックス解析が実行時間の大半を占めるクエリ、特にスキップインデックス（例: ベクターインデックスやインバーテッドインデックス）に依存するクエリが大幅に高速化されます。 [#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird))。
* 小さなクエリを高速化するための細かなマイクロ最適化を多数追加。 [#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano)).
* ネイティブプロトコルでログとプロファイルイベントを圧縮します。100 以上のレプリカを持つクラスターでは、非圧縮のプロファイルイベントが 1〜10 MB/秒となり、低速なインターネット接続ではプログレスバーの動作が重くなります。これにより [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533) がクローズされました。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [StringZilla](https://github.com/ashvardanian/StringZilla) ライブラリを利用し、利用可能な場合には SIMD CPU 命令も用いることで、大文字小文字を区別する文字列検索（`WHERE URL LIKE '%google%'` のようなフィルタリング操作）の性能を向上させました。 [#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* `SimpleAggregateFunction(anyLast)` 型のカラムを持つ AggregatingMergeTree テーブルに対して `FINAL` 付きで `SELECT` を実行する場合のメモリアロケーションおよびメモリコピーを削減しました。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* 非結合の OR 条件を含む JOIN 述語のプッシュダウンに関するロジックを提供します。例として、TPC-H Q7 において 2 つのテーブル n1 と n2 に対する条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')` がある場合、各テーブルごとに個別の部分フィルタを抽出します。すなわち、n1 については `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`、n2 については `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'` となります。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しいデフォルト設定 `optimize_rewrite_like_perfect_affix` により、接頭辞または接尾辞を持つ `LIKE` のパフォーマンスが向上しました。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 複数の文字列／数値カラムで `GROUP BY` を行う際に、大きなシリアライズ済みキーが原因で発生するパフォーマンス低下を修正しました。これは [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) のフォローアップです。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 多くのキーごとに多数の一致が発生するハッシュ結合におけるメモリ使用量を削減するため、新しい `joined_block_split_single_row` 設定を追加しました。これにより、左テーブルの1行に対する一致結果であっても、その内部で分割してチャンク化できるようになり、左テーブルの1行が右テーブルの数千件または数百万件の行と一致する場合に特に有用です。これまでは、すべての一致を一度にメモリ上にマテリアライズする必要がありました。この変更によりピークメモリ使用量は削減されますが、CPU使用量が増加する可能性があります。[#87913](https://github.com/ClickHouse/ClickHouse/pull/87913)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* SharedMutex の改良（多数の同時クエリ実行時のパフォーマンスを改善）。 [#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano)).
* ほとんどが低頻度トークンで構成されるドキュメントに対するテキストインデックス作成のパフォーマンスを改善しました。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ)).
* `Field` デストラクタの一般的なケースを高速化しました（多数の小さなクエリに対するパフォーマンスを改善）。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* JOIN の最適化中にランタイムのハッシュテーブル統計の再計算をスキップするようにし（JOIN を含むすべてのクエリのパフォーマンスが向上します）、新しいプロファイルイベント `JoinOptimizeMicroseconds` および `QueryPlanOptimizeMicroseconds` を追加しました。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTreeLazy リーダーでマークをキャッシュに保存し、直接 IO を回避できるようにしました。これにより、ORDER BY と小さな LIMIT を含むクエリのパフォーマンスが向上します。 [#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat)).
* `is_deleted` 列を持つ `ReplacingMergeTree` テーブルに対する `FINAL` 句付きの SELECT クエリが、既存の 2 つの最適化による並列化の改良により、より高速に実行されるようになりました。1. テーブル内で単一の `part` しか持たないパーティションに対する `do_not_merge_across_partitions_select_final` 最適化。2. テーブル内のその他の選択範囲を `intersecting / non-intersecting` に分割し、`intersecting` 範囲のみが FINAL マージ変換を通過するようにしたこと。 [#88090](https://github.com/ClickHouse/ClickHouse/pull/88090) ([Shankar Iyer](https://github.com/shankar-iyer)).
* フェイルポイントを使用しない場合（デバッグが有効でないときのデフォルトのコードパス）での影響を軽減しました。 [#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* `uuid` でフィルタする際の `system.tables` のフルスキャンを回避（ログや ZooKeeper のパスから UUID しか分からない場合に有用です）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 関数 `tokens`、`hasAllTokens`、`hasAnyTokens` のパフォーマンスを向上しました。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 一部のケースで `JOIN` のパフォーマンスをわずかに向上させるため、`AddedColumns::appendFromBlock` をインライン化しました。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455)（[Nikita Taranov](https://github.com/nickitat)）。
* クライアントの自動補完は、複数の system テーブルへのクエリを発行するのではなく `system.completions` を使用することで、より高速かつ一貫性の高い動作になります。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m)).
* 辞書圧縮を制御するための新しい `dictionary_block_frontcoding_compression` テキストインデックスパラメータを追加しました。デフォルトでは有効で、`front-coding` 圧縮が使用されます。 [#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` の設定に応じて、マテリアライズドビューへの挿入前に、すべてのスレッドからのデータをまとめて縮約するようにしました。以前は、`parallel_view_processing` が有効な場合、特定のマテリアライズドビューに対して各スレッドが独立して挿入データを縮約しており、その結果として生成されるパーツ数が多くなる可能性がありました。 [#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368)).
* 一時ファイル書き込み用バッファのサイズを制御する設定 `temporary_files_buffer_size` を追加。* `LowCardinality` カラムに対して、`scatter` 演算（たとえば grace ハッシュ結合で使用される）のメモリ使用量を最適化。[#88237](https://github.com/ClickHouse/ClickHouse/pull/88237)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* parallel replicas でテキストインデックスから直接読み取ることをサポートしました。オブジェクトストレージからテキストインデックスを読み取る際のパフォーマンスを改善しました。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* Data Lakes カタログのテーブルを対象とするクエリで、分散処理のために並列レプリカが利用されるようになりました。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* &quot;to&#95;remove&#95;small&#95;parts&#95;at&#95;right&quot; という名前のバックグラウンドマージアルゴリズムのチューニング用内部ヒューリスティックは、マージ範囲スコアの計算前に実行されるようになりました。それ以前は、マージセレクタはより広いマージ範囲を選択してから、その末尾部分をフィルタリングしていました。修正: [#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736)（[Mikhail Artemenko](https://github.com/Michicosun)）。





#### 改善

* これにより、関数 `generateSerialID` はシリーズ名に対する非定数引数をサポートするようになりました。[#83750](https://github.com/ClickHouse/ClickHouse/issues/83750) をクローズ。[#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しいシーケンスの開始値を指定できるようにするため、`generateSerialID` 関数にオプションの `start_value` パラメータを追加しました。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma)).
* `clickhouse-format` に `--semicolons_inline` オプションを追加し、セミコロンが新しい行ではなく最後の行に配置されるようにクエリを整形できるようにしました。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan)).
* Keeper で設定が上書きされている場合でも、サーバーレベルのスロットリングを設定できるようにしました。[#73964](https://github.com/ClickHouse/ClickHouse/issues/73964) をクローズ。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066) ([JIaQi](https://github.com/JiaQiTang98))。
* 両方のサンプルが同一の値のみを含む場合、`mannWhitneyUTest` は例外をスローしなくなりました。SciPy と整合する有効な結果を返すようになりました。これにより次の issue がクローズされました: [#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009)（[DeanNeaht](https://github.com/DeanNeaht)）。
* メタデータトランザクションがコミットされた場合、rewrite ディスクオブジェクトストレージトランザクションは以前のリモート BLOB を削除します。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* `LowCardinality` の結果型が最適化の前後で異なる場合に、冗長な等価式に対する最適化処理を修正しました。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* HTTP クライアントが `Expect: 100-continue` に加えてヘッダー `X-ClickHouse-100-Continue: defer` を設定すると、ClickHouse はクォータ検証が通過するまでクライアントに `100 Continue` レスポンスを送信しないため、最終的に破棄されることが分かっているリクエストボディを送信してネットワーク帯域を無駄にすることを防ぎます。これは、クエリ本体は URL のクエリ文字列で送信し、データはリクエストボディで送信するような INSERT クエリに関係します。ボディ全体を送信する前にリクエストを中止すると、HTTP/1.1 ではその接続を再利用できなくなりますが、新しいコネクションを確立することで生じる追加のレイテンシは、通常、大量データを扱う INSERT 全体の処理時間と比べれば無視できる程度です。[#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end))。
* DATABASE ENGINE = Backup で S3 ストレージを使用している場合、ログ内の S3 認証情報をマスクするようにしました。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* クエリプランの最適化が相関サブクエリの入力サブプランからも反映されるよう、そのマテリアライズを遅延させました。[#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。 [#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* SYSTEM DROP DATABASE REPLICA に対する変更: - データベースを指定してドロップする、またはレプリカ全体をドロップする場合: データベース内の各テーブルのレプリカも同時にドロップされます - `WITH TABLES` が指定されている場合は、各ストレージのレプリカをドロップします - それ以外の場合、動作は変わらず、データベース上のレプリカのみをドロップします - Keeper パスを指定してデータベースレプリカをドロップする場合: - `WITH TABLES` が指定されている場合: - データベースを Atomic として復元します - Keeper 内のステートメントから RMT テーブルを復元します - データベースをドロップします（復元されたテーブルも同時にドロップされます） - それ以外の場合、指定された Keeper パス上のレプリカのみをドロップします。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `materialize` 関数を含む場合の TTL のフォーマットの不整合を修正。 [#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。 [#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg テーブルの状態は、ストレージオブジェクト内には保存されなくなりました。これにより、ClickHouse における Iceberg を同時実行クエリでも利用できるようになるはずです。 [#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik)).
* S3Queue の ordered モードにおけるバケットロックを、`use_persistent_processing_nodes = 1` の場合の processing node と同様に永続的なモードにしました。テストに keeper のフォールトインジェクションを追加しました。 [#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ユーザーがフォーマット名を誤入力した場合に、候補を示すヒントを提供します。 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761) をクローズ。 [#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* リモートレプリカは、プロジェクションが存在しない場合にインデックス解析をスキップします。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* ytsaurus テーブルで utf8 エンコーディングを無効化できるようにしました。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* デフォルトで `s3_slow_all_threads_after_retryable_error` を無効にする。[#87198](https://github.com/ClickHouse/ClickHouse/pull/87198)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* テーブル関数 `arrowflight` を `arrowFlight` にリネームしました。 [#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-benchmark` を更新し、CLI フラグで `_` の代わりに `-` を使用できるようにしました。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda)).
* シグナルハンドリング時の `system.crash_log` へのフラッシュを同期的に行うようにしました。 [#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 設定 `inject_random_order_for_select_without_order_by` を追加しました。この設定は、`ORDER BY` 句を持たないトップレベルの `SELECT` クエリに対して `ORDER BY rand()` を挿入します。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn))。
* `joinGet` のエラーメッセージを改善し、`join_keys` の数が `right_table_keys` の数と一致していないことを正しく示すようにしました。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* write トランザクション中に任意の Keeper ノードの stat をチェックできる機能を追加しました。これにより ABA 問題の検出に役立ちます。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 負荷の高い ytsaurus リクエストを heavy プロキシへリダイレクトするようにしました。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* ディスクトランザクション由来のメタデータに対して、あらゆるワークロードでの unlink/rename/removeRecursive/removeDirectory などの操作のロールバック処理およびハードリンク数を修正し、さらに他のメタストアでも再利用できるよう、インターフェイスをより汎用的にするために簡素化しました。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper 用に `TCP_NODELAY` を無効化できる `keeper_server.tcp_nodelay` 設定パラメータを追加しました。 [#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* `clickhouse-benchmarks` で `--connection` オプションをサポートしました。これは `clickhouse-client` でサポートされているものと同じであり、クライアントの `config.xml`/`config.yaml` の `connections_credentials` パス配下に事前定義された接続を指定することで、コマンドライン引数でユーザー名やパスワードを明示的に指定する必要をなくせます。`clickhouse-benchmark` に `--accept-invalid-certificate` のサポートを追加しました。 [#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat)).
* `max_insert_threads` の設定が Iceberg テーブルにも適用されるようになりました。 [#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin)).
* `PrometheusMetricsWriter` にヒストグラムおよびディメンショナルメトリクスを追加しました。これにより、`PrometheusRequestHandler` ハンドラーで必要なメトリクスがすべて揃い、クラウド環境において信頼性が高く低オーバーヘッドなメトリクス収集に利用できるようになります。 [#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 関数 `hasToken` は、空のトークンに対してはマッチ数ゼロを返すようになりました（以前はこの場合、例外がスローされていました）。 [#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* `Array` と `Map`（`mapKeys` および `mapValues`）の値に対するテキストインデックスのサポートを追加しました。サポートされる関数は `mapContainsKey` と `has` です。 [#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 期限切れになったグローバル ZooKeeper セッションの数を示す新しい `ZooKeeperSessionExpired` メトリクスを追加しました。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* バックアップ先へのサーバーサイド（ネイティブ）コピーには、バックアップ専用の設定（例: backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）を持つ S3 ストレージクライアントを使用します。s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error を非推奨とします。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 実験的機能である `make_distributed_plan` を使用したクエリプランのシリアライズ時に、設定 `max_joined_block_size_rows` および `max_joined_block_size_bytes` が誤って処理されていた問題を修正。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 設定 `enable_http_compression` がデフォルトになりました。これは、クライアントが HTTP 圧縮を受け入れる場合、サーバーがそれを使用することを意味します。ただし、この変更にはいくつかのデメリットがあります。クライアントは `bzip2` のような重い圧縮方式を要求でき、これは妥当ではなく、サーバー側のリソース消費が増加します（ただし、大きな結果セットが転送される場合にのみ顕在化します）。クライアントは `gzip` を要求することもできますが、これはそれほど悪くはないものの、`zstd` と比較すると最適とは言えません。[#71591](https://github.com/ClickHouse/ClickHouse/issues/71591) をクローズしました。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.server_settings` に新しいエントリ `keeper_hosts` を追加し、ClickHouse が接続可能な [Zoo]Keeper ホストの一覧を公開するようにしました。 [#87718](https://github.com/ClickHouse/ClickHouse/pull/87718) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 履歴調査を容易にするために、system ダッシュボードに `from` および `to` の値を追加しました。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* Iceberg の SELECT におけるパフォーマンス追跡用の情報をさらに追加しました。 [#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik)).
* ファイルシステムキャッシュの改善: キャッシュ内の領域を同時に予約する複数スレッド間で、キャッシュ優先度イテレータを再利用するようにしました。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Keeper` に対するリクエストサイズを制限できる機能を追加しました（`max_request_size` 設定。`ZooKeeper` の `jute.maxbuffer` と同等で、後方互換性のためデフォルトは OFF であり、今後のリリースで有効化される予定です）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark` がデフォルトでエラーメッセージにスタックトレースを含めないようにしました。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* マークがキャッシュ内にある場合は、スレッドプールを使った非同期マーク読み込み（`load_marks_asynchronously=1`）は利用しないでください（スレッドプールが逼迫している可能性があり、マークがすでにキャッシュに存在していても、その影響でクエリ側がペナルティを受けてしまうため）。 [#87967](https://github.com/ClickHouse/ClickHouse/pull/87967) ([Azat Khuzhin](https://github.com/azat))。
* Ytsaurus: 列の一部のみを使用して、テーブル / テーブル関数 / 辞書を作成できるようにしました。 [#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* これ以降、`system.zookeeper_connection_log` はデフォルトで有効となり、Keeper セッションに関する情報の取得に利用できます。 [#88011](https://github.com/ClickHouse/ClickHouse/pull/88011) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 重複した外部テーブルが渡された場合の TCP と HTTP の動作を統一しました。HTTP では、一時テーブルを複数回渡すことができます。 [#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema))。
* Arrow/ORC/Parquet 読み込み用のカスタム MemoryPool を削除します。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) により、現在はすべてのアロケーションを追跡しているため、このコンポーネントは不要と考えられます。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 引数なしで `Replicated` データベースを作成できるようになりました。[#88044](https://github.com/ClickHouse/ClickHouse/pull/88044)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* `clickhouse-keeper-client`: clickhouse-keeper の TLS ポートへの接続をサポートし、フラグ名は clickhouse-client と同じものを維持しました。 [#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* メモリ制限超過によりバックグラウンドマージが拒否された回数を追跡する新しいプロファイルイベントを追加しました。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse)).
* CREATE/ALTER TABLE のカラム既定値式の検証用アナライザーを有効にしました。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus))。
* 内部クエリプランニングを改善: `CROSS JOIN` に `JoinStepLogical` を使用。[#88151](https://github.com/ClickHouse/ClickHouse/pull/88151)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `hasAnyTokens`（`hasAnyToken`）および `hasAllTokens`（`hasAllToken`）関数にエイリアスを追加しました。 [#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* グローバルサンプリングプロファイラをデフォルトで有効化しました（つまり、クエリに関連しないサーバースレッドも含めて対象とします）。すべてのスレッドについて、CPU 時間および実時間で 10 秒ごとにスタックトレースを収集します。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix)).
* コピーおよびコンテナ作成機能で発生していた「Content-Length」問題を解消するために、Azure SDK を更新。 [#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 関数 `lag` を MySQL との互換性のために大文字小文字を区別しないようにしました。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* `clickhouse-local` を `clickhouse-server` ディレクトリから起動できるようにしました。以前のバージョンでは、`Cannot parse UUID: .` というエラーが発生していました。現在では、サーバーを起動せずに clickhouse-local を起動してサーバーのデータベースを操作できます。 [#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `keeper_server.coordination_settings.check_node_acl_on_remove` という設定を追加しました。有効な場合は、各ノードの削除前に、そのノード自身と親ノードの両方の ACL が検証されます。無効な場合は、親ノードの ACL のみが検証されます。 [#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368))。
* `Vertical` フォーマットを使用する場合、`JSON` カラムが整形表示されるようになりました。[#81794](https://github.com/ClickHouse/ClickHouse/issues/81794) をクローズ。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* `clickhouse-client` のファイル（例: クエリ履歴）を、ホームディレクトリ直下ではなく [XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 仕様で定義されている場所に保存するようにしました。すでに `~/.clickhouse-client-history` が存在する場合は、引き続きそれが使用されます。 [#88538](https://github.com/ClickHouse/ClickHouse/pull/88538) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `GLOBAL IN` によるメモリリークを修正しました（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* hasAny/hasAllTokens が文字列入力を受け取れるようにオーバーロードを追加しました。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* `clickhouse-keeper` の postinstall スクリプトに、ブート時に自動起動するようにするステップを追加しました。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan)).
* Web UI において、キー入力のたびではなく、貼り付け時にのみ認証情報を検証するようにしました。これにより、設定が誤っている LDAP サーバーで発生する問題を回避できます。これにより [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777) がクローズされました。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 制約違反時の例外メッセージの長さに制限を設けました。以前のバージョンでは、非常に長い文字列が挿入された場合に、極めて長い例外メッセージが生成され、それが最終的に query&#95;log に書き込まれてしまうことがありました。[#87032](https://github.com/ClickHouse/ClickHouse/issues/87032) をクローズ。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* テーブル作成時に ArrowFlight サーバーからデータセットの構造を取得する処理を修正しました。 [#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* クライアントプロトコルエラーを引き起こしていた GeoParquet の問題を修正しました。 [#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* イニシエーターノード上のサブクエリ内で、`shardNum()` のようなホスト依存関数を解決する処理を修正。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa))。
* `parseDateTime64BestEffort`、`change{Year,Month,Day}`、`makeDateTime64` など、各種日時関連関数におけるエポック前の日付と小数秒の扱いを修正しました。以前は、小数秒部分を加算すべきところで、秒から減算していました。例えば、`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` は、本来の `1969-01-01 00:00:00.468` ではなく `1968-12-31 23:59:59.532` を返していました。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 同一の ALTER 文内でカラムの状態が変更される場合に、ALTER COLUMN IF EXISTS コマンドが失敗する問題を修正しました。DROP COLUMN IF EXISTS、MODIFY COLUMN IF EXISTS、COMMENT COLUMN IF EXISTS、RENAME COLUMN IF EXISTS などのコマンドは、同じ文中の前のコマンドによってカラムが削除されているケースを正しく扱えるようになりました。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* サポート範囲外の日付に対する Date/DateTime/DateTime64 の推論を修正。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部の有効なユーザー送信データが `AggregateFunction(quantileDD)` 列に対して無限再帰的なマージを引き起こしクラッシュする可能性があった問題を修正しました。 [#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi))。
* `cluster` テーブル関数で作成されたテーブルで JSON/Dynamic 型をサポートするようにしました。 [#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar)).
* CTE で計算された関数の結果がクエリ内で非決定的になる問題を修正。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* 主キー列に対する pointInPolygon を含む EXPLAIN で発生する LOGICAL&#95;ERROR を修正。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 名前にパーセントエンコードされたシーケンスを含むデータレイクテーブルを修正します。 [#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) をクローズ。 [#87020](https://github.com/ClickHouse/ClickHouse/pull/87020) ([Anton Ivashkin](https://github.com/ianton-ru)).
* `optimize_functions_to_subcolumns` を使用した `OUTER JOIN` における Nullable 列での `IS NULL` の誤った動作を修正し、[#78625](https://github.com/ClickHouse/ClickHouse/issues/78625) をクローズ。[#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `max_temporary_data_on_disk_size` 制限トラッキングにおける一時データ解放の誤った計上を修正し、[#87118](https://github.com/ClickHouse/ClickHouse/issues/87118) をクローズしました。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140)（[JIaQi](https://github.com/JiaQiTang98)）。
* 関数 checkHeaders が、提供されたヘッダーを正しく検証し、禁止されているヘッダーを拒否するようになりました。原著者: Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* すべての数値型に対して、`toDate` および `toDate32` の動作を統一しました。int16 からのキャスト時に発生する Date32 のアンダーフロー検査を修正しました。 [#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 特に、複数の `JOIN` を含むクエリで、`LEFT`/`INNER JOIN` の後に `RIGHT JOIN` がある場合における parallel replicas の論理的な不具合を修正。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter))。
* スキーマ推論キャッシュで `input_format_try_infer_variants` 設定を考慮するようにしました。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* pathStartsWith がプレフィックス配下のパスにのみマッチするように変更。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* `_row_number` 仮想カラムおよび Iceberg の positioned delete における論理エラーを修正しました。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* const ブロックと非 const ブロックが混在していることが原因で、`JOIN` 内で発生する &quot;Too large size passed to allocator&quot; `LOGICAL_ERROR` を修正しました。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 別の `MergeTree` テーブルから読み取るサブクエリを使用した軽量な更新の問題を修正しました。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ))。
* 行ポリシーがある場合に動作していなかった move-to-prewhere 最適化を修正しました。 [#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) の続きです。 [#69777](https://github.com/ClickHouse/ClickHouse/issues/69777) をクローズします。 [#83748](https://github.com/ClickHouse/ClickHouse/issues/83748) をクローズします。 [#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* データパーツに存在しない、デフォルト式を持つカラムへのパッチ適用を修正しました。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* MergeTree テーブルでパーティションのフィールド名が重複している場合に発生していたセグメンテーションフォールトを修正しました。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* EmbeddedRocksDB のアップグレード処理を修正。 [#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* オブジェクトストレージ上のテキストインデックスからの直接読み取りを修正しました。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないエンジンに対する権限が作成されないようにしました。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* `s3_plain_rewritable` に対しては `not found` エラーだけを無視するようにします（そうしないとあらゆる問題の原因となり得ます）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* YTSaurus ソースと *range&#95;hashed レイアウトを使用するディクショナリを修正しました。 [#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 空タプルの配列を作成する処理を修正。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 一時テーブル作成時に不正なカラムをチェックするようにしました。 [#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* hive パーティション列をフォーマットヘッダーに含めないようにしました。[#87515](https://github.com/ClickHouse/ClickHouse/issues/87515) を修正。[#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* テキストフォーマットが使用されている場合の、DeltaLake からのフォーマット読み取り準備処理を修正しました。 [#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* Buffer テーブルに対する SELECT および INSERT のアクセス検証を修正しました。 [#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit))。
* S3 テーブルに対する data skipping index の作成を無効化。[#87554](https://github.com/ClickHouse/ClickHouse/pull/87554)（[Bharat Nallan](https://github.com/bharatnc)）。
* 非同期ロギングにおける追跡メモリのリーク（10時間で約100GiBに達しうる大きなドリフトが発生する可能性がある）および text&#95;log（ほぼ同程度のドリフトが発生しうる）を防止。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* View または Materialized View の `SELECT` 設定について、ビューが非同期に削除され、そのバックグラウンドでのクリーンアップが完了する前にサーバーが再起動された場合に、グローバルなサーバー設定が上書きされてしまう可能性のあったバグを修正しました。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* メモリ過負荷警告を算出する際、可能であればユーザースペースのページキャッシュのバイト数を除外するようにしました。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* CSV のデシリアライズ中に型の順序が誤っていると `LOGICAL_ERROR` が発生してしまうバグを修正しました。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 実行可能ディクショナリにおける `command_read_timeout` の誤った処理を修正しました。[#87627](https://github.com/ClickHouse/ClickHouse/pull/87627)（[Azat Khuzhin](https://github.com/azat)）。
* 新しいアナライザ使用時に、置き換えられた列でフィルタリングする際の WHERE 句における `SELECT * REPLACE` の誤った動作を修正しました。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `Distributed` 上で `Merge` を使用した際の 2 段階集約を修正しました。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* 右側の行リストを使用しない場合の HashJoin アルゴリズムにおける出力ブロック生成処理を修正。[#87401](https://github.com/ClickHouse/ClickHouse/issues/87401) を解決。[#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* インデックス解析を適用した結果、読み取るデータが存在しない場合に、`parallel replicas` の読み取りモードが誤って選択されることがありました。 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653) をクローズしました。 [#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi))。
* Glue における `timestamp` / `timestamptz` カラムの処理を修正。 [#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand)).
* これは [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587) をクローズします。 [#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* PostgreSQL インターフェイスにおける boolean 値の書き込み処理を修正。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* CTE を含む INSERT SELECT クエリで発生する unknown table エラーを修正、[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* Nullable 内に含めることができない Variants からの null map サブカラムの読み取りを修正。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* セカンダリノード上のクラスタでデータベースを完全に削除できなかった場合のエラー処理を修正しました。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 複数のスキップインデックスに関するバグを修正。 [#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* AzureBlobStorage において、まずネイティブコピーを試行し、&#39;Unauthorized&#39; エラー発生時には読み取り &amp; 書き込み方式にフォールバックするように更新しました（AzureBlobStorage では、ソースと宛先でストレージアカウントが異なる場合に &#39;Unauthorized&#39; エラーが発生します）。また、設定でエンドポイントが定義されている場合に &quot;use&#95;native&#95;copy&quot; を適用する処理を修正しました。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* ArrowStream ファイルに一意でない辞書が含まれている場合に ClickHouse がクラッシュする問題を修正。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn)).
* approx&#95;top&#95;k と finalizeAggregation 使用時の致命的な不具合を修正。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 最後のブロックが空の場合の projection を用いたマージ処理を修正しました。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano))。
* 引数の型が GROUP BY で許可されていない場合でも、GROUP BY から単射関数を削除しないようにしました。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar))。
* クエリで `session_timezone` 設定を使用した際に、日時ベースのキーに対するグラニュール／パーティションの削除（プルーニング）が正しく行われない問題を修正しました。 [#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa)).
* PostgreSQL インターフェイスで、クエリ実行後に影響を受けた行数を返すようにしました。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov))。
* PASTE JOIN に対するフィルタープッシュダウンの使用を制限しました。誤った結果を招く可能性があるためです。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) で導入された権限チェックの評価前に URI の正規化を行います。 [#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 新しいアナライザーで ARRAY JOIN COLUMNS() がどのカラムにもマッチしない場合に発生する論理エラーを修正。 [#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 「High ClickHouse memory usage」警告を修正（ページキャッシュを除外するように変更）。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* `TTL` が設定された Set 型カラムを持つ `MergeTree` テーブルで発生し得たデータ破損の不具合を修正しました。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 外部データベース（`PostgreSQL` / `SQLite` / ...）で無効なテーブルがアタッチされている場合に、`system.tables` を読み取る際に発生する可能性のある未捕捉例外を修正しました。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat))。
* 空のタプル引数で呼び出された際にクラッシュする `mortonEncode` および `hilbertEncode` 関数の不具合を修正しました。 [#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* クラスタ内に非アクティブなレプリカがある場合でも、`ON CLUSTER` クエリの実行時間が短くなりました。 [#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin)).
* DDL worker がレプリカ集合から古くなったホストをクリーンアップするようになりました。これにより、ZooKeeper に保存されるメタデータの量が削減されます。 [#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin)).
* cgroups なしでも ClickHouse を実行できるように修正しました（誤って非同期メトリクスに cgroups が必須になっていた問題）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* エラー発生時にディレクトリ移動操作を正しくロールバックできるようにしました。ルートだけでなく、実行中に変更されたすべての `prefix.path` オブジェクトを書き換える必要があります。 [#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `ColumnLowCardinality` における `is_shared` フラグの伝播を修正しました。ハッシュ値がすでに事前計算されて `ReverseIndex` にキャッシュされた後に、新しい値がカラムに挿入されると、誤った group-by の結果を引き起こす可能性がありました。 [#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat))。
* ワークロード設定 `max_cpu_share` の不具合を修正しました。これにより、ワークロード設定 `max_cpus` を設定していなくても使用できるようになりました。 [#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria)).
* サブクエリを含む非常に重いミューテーションが prepare 段階でスタックしてしまうバグを修正しました。これらのミューテーションは、`SYSTEM STOP MERGES` で停止できるようになりました。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 相関サブクエリがオブジェクトストレージでも動作するようになりました。 [#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin)).
* `system.projections` および `system.data_skipping_indices` にアクセスしている間は、DataLake データベースの初期化を試みないでください。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* `show_data_lake_catalogs_in_system_tables` が明示的に有効化されている場合にのみ、データレイクのカタログが system のイントロスペクションテーブルに表示されるようになりました。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin)).
* DatabaseReplicated が `interserver_http_host` 設定を参照するように修正しました。 [#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* Projection を定義するコンテキストでは、内部クエリ段階において位置引数は意味をなさないため、位置引数は明示的に無効化されました。これにより [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604) が修正されました。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* `countMatches` 関数の二次計算量を修正。[#88400](https://github.com/ClickHouse/ClickHouse/issues/88400) をクローズ。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* KeeperMap テーブルに対する `ALTER COLUMN ... COMMENT` コマンドをレプリケート対象とし、Replicated データベースのメタデータにコミットされてすべてのレプリカに伝播されるようにしました。[#88077](https://github.com/ClickHouse/ClickHouse/issues/88077) をクローズ。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408)（[Eduard Karacharov](https://github.com/korowa)）。
* Database Replicated における Materialized Views での誤った循環依存関係の検出により、新しいレプリカをデータベースに追加できない問題を修正しました。 [#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique)).
* `group_by_overflow_mode` が `any` に設定されている場合の `sparse` 列の集計を修正しました。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa))。
* 複数の FULL JOIN USING 句と `query_plan_use_logical_join_step=0` を併用した場合に発生する「column not found」エラーを修正しました。[#88103](https://github.com/ClickHouse/ClickHouse/issues/88103) をクローズ。 [#88473](https://github.com/ClickHouse/ClickHouse/pull/88473) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ノード数が 10 を超える大規模クラスタでは、エラー `[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 <Trace>: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` によりリストアが失敗する可能性が高くなります。`num_hosts` ノードが多数のホストによって同時に上書きされるためです。この修正により、試行回数を制御する設定が動的になります。 [#87721](https://github.com/ClickHouse/ClickHouse/issues/87721) をクローズ。 [#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* このPRは、23.8およびそれ以前との互換性を保つためだけのものです。この互換性問題は次のPRによって発生しました: [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) このSQLは `enable_analyzer=0` の場合に失敗します（23.8以前では問題ありません）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491) ([JIaQi](https://github.com/JiaQiTang98))。
* 大きな値を DateTime に変換する際の `accurateCast` のエラーメッセージで発生する UBSAN の整数オーバーフローを修正。 [#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* タプル型に対する coalescing merge tree を修正しました。これにより [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469) がクローズされます。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* `iceberg_format_version=1` に対する削除を禁止。これにより [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444) がクローズされます。 [#88532](https://github.com/ClickHouse/ClickHouse/pull/88532) ([scanhex12](https://github.com/scanhex12))。
* このパッチは、任意の階層のフォルダに対する `plain-rewritable` ディスクの移動操作を修正します。 [#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `*cluster` 関数での `SQL SECURITY DEFINER` の動作を修正しました。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 基になる const PREWHERE 列の同時ミューテーションにより発生する可能性があるクラッシュを修正しました。 [#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat)).
* テキストインデックスからの読み取りを修正し、クエリ条件キャッシュを有効化しました（設定 `use_skip_indexes_on_data_read` および `use_query_condition_cache` が有効な場合）。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` からスローされる `Poco::TimeoutException` 例外により、SIGABRT でクラッシュする問題。 [#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) にバックポート済み: リカバリ後、Replicated データベースのレプリカが `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを長時間出力し続けてスタックする可能性がありましたが、この問題は修正されました。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 設定の再読み込み後、ClickHouse が初回接続する際の `system.zookeeper_connection_log` への追記処理を修正しました。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* `date_time_overflow_behavior = 'saturate'` を使用して DateTime64 を Date に変換する際、タイムゾーンを扱う場合に範囲外の値で誤った結果が返される可能性があったバグを修正しました。 [#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* キャッシュを有効にした s3 テーブルエンジンで発生する「zero bytes エラー」を修正する N 回目の試み。[#88740](https://github.com/ClickHouse/ClickHouse/pull/88740)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `loop` テーブル関数に対する `select` のアクセス検証を修正しました。 [#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit))。
* 非同期ロギングが失敗した場合に例外を捕捉し、プログラムの異常終了を防ぎます。 [#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) にバックポート済み: 単一の引数で呼び出された場合にしきい値パラメータが反映されるように `top_k` を修正。[#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) にバックポート済み: 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、長さ 4 の UTF-8 コードポイントのバイト列を誤って逆順にしていました。これにより [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) でバックポート: SQL SECURITY DEFINER を指定してビューを作成する際に、`SET DEFINER <current_user>:definer` のアクセス権をチェックしないようにしました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) にバックポート済み: 部分的な `QBit` 読み取りの最適化により、`p` が `Nullable` の場合に戻り値型から誤って `Nullable` が取り除かれていた `L2DistanceTransposed(vec1, vec2, p)` の `LOGICAL_ERROR` を修正しました。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) にバックポート済み: 不明なカタログタイプで発生するクラッシュを修正。[#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解決。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987) ([scanhex12](https://github.com/scanhex12))。
* [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) でバックポート済み: スキップインデックスの解析におけるパフォーマンス低下を修正しました。 [#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### ビルド/テスト/パッケージングの改善

- `postgres`ライブラリバージョン18.0を使用。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- FreeBSD向けにICUを有効化。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano))。
- SSE 4.2への動的ディスパッチを使用する際に、SSE 4ではなくSSE 4.2を使用するように変更。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano))。
- `Speculative Store Bypass Safe`が利用できない場合、`NO_ARMV81_OR_HIGHER`フラグを不要に変更。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- ClickHouseが`ENABLE_LIBFIU=OFF`でビルドされた場合、フェイルポイント関連の関数は何も実行せず、パフォーマンスに影響を与えなくなります。その場合、`SYSTEM ENABLE/DISABLE FAILPOINT`クエリは`SUPPORT_IS_DISABLED`エラーを返します。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end))。

### ClickHouseリリース25.9、2025-09-25 {#259}

#### 後方互換性のない変更

- IPv4/IPv6との無意味な二項演算を無効化:IPv4/IPv6と非整数型との加算/減算を無効化しました。以前は浮動小数点型との演算を許可し、他の一部の型(DateTimeなど)では論理エラーをスローしていました。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano))。
- 設定`allow_dynamic_metadata_for_data_lakes`を非推奨化。現在、すべてのicebergテーブルは各クエリの実行前にストレージから最新のテーブルスキーマを取得するようになりました。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik))。
- `OUTER JOIN ... USING`句からの結合列の解決をより一貫性のあるものに変更:以前は、OUTER JOINでUSING列と修飾列(`a, t1.a, t2.a`)の両方を選択した場合、USING列が誤って`t1.a`に解決され、左側にマッチしない右テーブルの行に対して0/NULLが表示されていました。現在、USING句の識別子は常に結合列に解決され、修飾識別子はクエリに他のどの識別子が存在するかに関係なく、非結合列に解決されます。例: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前: a=0, t1.a=0, t2.a=2 (不正 - 'a'がt1.aに解決) -- 変更後: a=2, t1.a=0, t2.a=2 (正しい - 'a'は結合される)。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir))。
- レプリケーション重複排除ウィンドウを10000まで増加。これは完全に互換性がありますが、多数のテーブルが存在する場合、この変更が高いリソース消費につながるシナリオが考えられます。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema))。


#### 新機能

* ユーザーは、NATS エンジンに対して新しい設定項目である `nats_stream` と `nats_consumer` を指定することで、NATS JetStream からメッセージを購読できるようになりました。 [#84799](https://github.com/ClickHouse/ClickHouse/pull/84799) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* `arrowFlight` テーブル関数で認証および SSL をサポートしました。 [#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar)).
* AWS がサポートする Intelligent Tiering を指定できるようにするため、`storage_class_name` という名前の新しいパラメータを `S3` テーブルエンジンおよび `s3` テーブル関数に追加しました。キーと値の形式および位置指定（非推奨）形式の両方で指定できます。 [#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin)).
* Iceberg テーブルエンジン用の `ALTER UPDATE`。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059)（[scanhex12](https://github.com/scanhex12)）。
* SELECT 文の実行中に Iceberg メタデータファイルを取得するためのシステムテーブル `iceberg_metadata_log` を追加しました。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152)（[scanhex12](https://github.com/scanhex12)）。
* `Iceberg` および `DeltaLake` テーブルで、ストレージレベル設定 `disk` を使用したカスタムディスク設定がサポートされました。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12)).
* データレイクディスク向けの Azure サポートを追加。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* Azure Blob Storage 上での `Unity` カタログのサポートを追加。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* `Iceberg` への書き込みで、より多くのフォーマット（`ORC`、`Avro`）をサポートするようにしました。これにより [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179) がクローズされました。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* データベースレプリカに関する情報を含む新しいシステムテーブル `database_replicas` を追加。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov)).
* 一方の配列から別の配列を集合として差し引く関数 `arrayExcept` を追加しました。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x))。
* 新しい `system.aggregated_zookeeper_log` テーブルを追加しました。このテーブルには、セッション ID、親パス、および操作種別ごとに集約された ZooKeeper 操作の統計情報（操作数、平均レイテンシ、エラー数など）が含まれ、定期的にディスクへフラッシュされます。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新しい関数 `isValidASCII`。入力文字列または FixedString が ASCII バイト (0x00–0x7F) のみを含む場合は 1 を返し、それ以外の場合は 0 を返します。[#85377](https://github.com/ClickHouse/ClickHouse/issues/85377) をクローズします。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786) ([rajat mohan](https://github.com/rajatmohan22))。
* 真偽値の設定は引数なしで指定できます（例: `SET use_query_cache;`）。これは、その値を true に設定するのと同等です。 [#85800](https://github.com/ClickHouse/ClickHouse/pull/85800)（[thraeka](https://github.com/thraeka)）。
* 新しい構成オプション `logger.startupLevel` と `logger.shutdownLevel` により、それぞれ ClickHouse の起動時およびシャットダウン時のログレベルを上書き指定できるようになりました。 [#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 集約関数 `timeSeriesChangesToGrid` および `timeSeriesResetsToGrid`。`timeSeriesRateToGrid` と同様に動作し、開始タイムスタンプ、終了タイムスタンプ、ステップ、ルックバックウィンドウのパラメータに加えて、タイムスタンプと値の 2 つの引数を受け取りますが、ウィンドウごとに必要なサンプル数は 2 つではなく少なくとも 1 つです。PromQL の `changes`/`resets` を計算し、パラメータで定義された時間グリッド内の各タイムスタンプについて、指定されたウィンドウ内でサンプル値が変化または減少した回数をカウントします。戻り値の型は `Array(Nullable(Float64))` です。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010)（[Stephen Chi](https://github.com/stephchi0)）。
* 一時テーブル（`CREATE TEMPORARY TABLE`）と同様の構文（`CREATE TEMPORARY VIEW`）で一時ビューを作成できるようにしました。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury))。
* CPU およびメモリ使用量に関する警告を `system.warnings` テーブルに追加しました。[#86838](https://github.com/ClickHouse/ClickHouse/pull/86838)（[Bharat Nallan](https://github.com/bharatnc)）。
* `Protobuf` 入力で `oneof` インジケーターをサポートしました。oneof の一部の存在を示すために特別なカラムを使用できます。メッセージに [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) が含まれており、`input_format_protobuf_oneof_presence` が設定されている場合、ClickHouse は oneof のどのフィールドが存在するかを示すカラムを埋めます。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* jemalloc の内部ツールに基づくアロケーションプロファイリングを改善。グローバル jemalloc プロファイラは、設定 `jemalloc_enable_global_profiler` で有効化できるようになりました。サンプリングされたグローバルなアロケーションおよびデアロケーションは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` を有効化することで、`system.trace_log` 内の `JemallocSample` 型として保存できます。jemalloc プロファイリングは、設定 `jemalloc_enable_profiler` を用いてクエリごとに個別に有効化できるようになりました。`system.trace_log` へのサンプルの保存は、設定 `jemalloc_collect_profile_samples_in_trace_log` を使用してクエリ単位で制御できます。jemalloc を新しいバージョンに更新しました。 [#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* Iceberg テーブルを `DROP` する際にファイルを削除するための新しい設定を追加しました。これにより [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211) がクローズされました。[#86501](https://github.com/ClickHouse/ClickHouse/pull/86501)（[scanhex12](https://github.com/scanhex12)）。



#### 実験的機能
* 逆テキストインデックスが、RAM に収まりきらないデータセットにもスケールするよう、ゼロから再設計されました。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* Join の並べ替えに統計情報が利用されるようになりました。この機能は `allow_statistics_optimize = 1` および `query_plan_optimize_join_order_limit = 10` を設定することで有効化できます。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* `alter table ... materialize statistics all` がサポートされ、テーブルのすべての統計情報をマテリアライズできるようになりました。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 読み取り時にスキップインデックスを使用してデータパーツをフィルタリングし、不要なインデックス読み取りを削減できるようにしました。新しい設定 `use_skip_indexes_on_data_read`（デフォルトでは無効）で制御されます。これは [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774) への対応です。また、[#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) と共通の基盤的な変更も一部含まれています。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* Added JOIN order optimization that can automatically reorder JOINs for better performance (controlled by `query_plan_optimize_join_order_limit` setting). Note that the join order optimization currently has limited statistics support and primarily relies on row count estimates from storage engines - more sophisticated statistics collection and cardinality estimation will be added in future releases. **If you encounter issues with JOIN queries after upgrading**, you can temporarily disable the new implementation by setting `SET query_plan_use_new_logical_join_step = 0` and report the issue for investigation. **Note about resolution of identifiers from USING clause**: Changed resolving of the coalesced column from `OUTER JOIN ... USING` clause to be more consistent: previously, when selecting both the USING column and qualified columns (`a, t1.a, t2.a`) in a OUTER JOIN, the USING column would incorrectly be resolved to `t1.a`, showing 0/NULL for rows from the right table with no left match. Now identifiers from USING clause are always resolved to the coalesced column, while qualified identifiers resolve to the non-coalesced columns, regardless of which other identifiers are present in the query. For example: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- Before: a=0, t1.a=0, t2.a=2 (incorrect - &#39;a&#39; resolved to t1.a) -- After: a=2, t1.a=0, t2.a=2 (correct - &#39;a&#39; is coalesced). [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイク向けの分散型 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* `func(primary_column) = 'xx'` や `column in (xxx)` といった条件に対する PREWHERE 最適化を改善しました。 [#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li))。
* JOIN の書き換えを実装しました。1. フィルター条件が、マッチした行または非マッチ行に対して常に false となる場合、`LEFT ANY JOIN` と `RIGHT ANY JOIN` を `SEMI`/`ANTI` JOIN に変換します。この最適化は、新しい設定 `query_plan_convert_any_join_to_semi_or_anti_join` によって制御されます。2. 片側の非マッチ行に対してフィルター条件が常に false となる場合、`FULL ALL JOIN` を `LEFT ALL` または `RIGHT ALL` JOIN に変換します。 [#86028](https://github.com/ClickHouse/ClickHouse/pull/86028) ([Dmitry Novik](https://github.com/novikd))。
* 軽量削除の実行後に行われる垂直マージのパフォーマンスを改善しました。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* `LEFT/RIGHT` 結合でマッチしない行が多い場合の `HashJoin` のパフォーマンスをわずかに改善しました。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat)).
* 基数ソート: コンパイラがSIMDを利用し、より効率的にプリフェッチできるようにします。Intel CPU 上でのみソフトウェアプリフェッチを利用するため、動的ディスパッチを使用します。[https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) における @taiyang-li の作業を継続したものです。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* テーブル内に多数のパーツを含む短いクエリのパフォーマンスを向上させます（`deque` の代わりに `devector` を使用して `MarkRanges` を最適化）。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* join モードでパッチパーツを適用する処理のパフォーマンスを改善しました。 [#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 設定 `query_condition_cache_selectivity_threshold`（デフォルト値: 1.0）を追加しました。この設定により、選択度の低い述語のスキャン結果はクエリ条件キャッシュへ挿入されなくなります。これにより、キャッシュヒット率の低下と引き換えに、クエリ条件キャッシュのメモリ消費を削減できます。 [#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai))。
* Iceberg への書き込み時のメモリ使用量を削減。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).





#### 改善

* 単一の挿入操作で Iceberg に複数のデータファイルを書き込めるようにしました。上限を制御するための新しい設定として、`iceberg_insert_max_rows_in_data_file` と `iceberg_insert_max_bytes_in_data_file` を追加しました。 [#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12))。
* Delta Lake に挿入されるデータファイルに対して、行数／バイト数の上限を追加しました。`delta_lake_insert_max_rows_in_data_file` および `delta_lake_insert_max_bytes_in_data_file` の設定で制御できます。[#86357](https://github.com/ClickHouse/ClickHouse/pull/86357)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Iceberg への書き込みで、パーティションに利用できるデータ型を拡張しました。これにより [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206) がクローズされました。 [#86298](https://github.com/ClickHouse/ClickHouse/pull/86298) ([scanhex12](https://github.com/scanhex12))。
* S3 のリトライ戦略を設定可能にし、設定用 XML ファイルを変更した際に S3 ディスクの設定をホットリロードできるようにしました。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* S3(Azure)Queue テーブルエンジンを改善し、ZooKeeper への接続が失われた場合でも、重複が発生する可能性なく処理を継続できるようにしました。これには、S3Queue の設定 `use_persistent_processing_nodes` を有効にする必要があります（`ALTER TABLE MODIFY SETTING` で変更可能）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* マテリアライズドビューを作成する際に、`TO` の後ろでクエリパラメータを使用できます。例: `CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table`。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899)（[Diskein](https://github.com/Diskein)）。
* `Kafka2` テーブルエンジンで不正な設定が指定された場合に、ユーザー向けの案内をより明確にしました。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `Time` 型にタイムゾーンを指定することはできなくなりました（そもそも意味がなかったためです）。 [#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `best_effort` モードにおける Time/Time64 のパースロジックを簡略化し、いくつかのバグを回避しました。 [#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `deltaLakeAzure` と同様のクラスターモード用関数である `deltaLakeAzureCluster` 関数と、`deltaLakeCluster` のエイリアスである `deltaLakeS3Cluster` 関数を追加しました。[#85358](https://github.com/ClickHouse/ClickHouse/issues/85358) を解決しました。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* バックアップ時と同様に、通常のコピー処理にも `azure_max_single_part_copy_size` 設定を適用します。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* S3 オブジェクトストレージでリトライ可能なエラーが発生した際に、S3 クライアントスレッドをスローダウンします。これにより、既存の設定 `backup_slow_all_threads_after_retryable_s3_error` が S3 ディスクにも適用され、より汎用的な名前である `s3_slow_all_threads_after_retryable_error` に改名されました。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva)).
* 設定では allow&#95;experimental&#95;variant/dynamic/json と enable&#95;variant/dynamic/json が非推奨となりました。現在は 3 つの型すべてが無条件に有効になっています。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* `http_handlers` で（スキーマおよびホスト:ポートを含む）完全な URL 文字列に基づくフィルタリング（`full_url` ディレクティブ）をサポートしました。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `allow_experimental_delta_lake_writes` を追加。 [#86180](https://github.com/ClickHouse/ClickHouse/pull/86180) ([Kseniia Sumarokova](https://github.com/kssenii)).
* init.d スクリプトでの systemd の検出方法を修正しました（「Install packages」チェックの不具合を修正）。[#86187](https://github.com/ClickHouse/ClickHouse/pull/86187)（[Azat Khuzhin](https://github.com/azat)）。
* 新しい `startup_scripts_failure_reason` 次元メトリクスを追加しました。このメトリクスは、スタートアップスクリプトの失敗につながるさまざまなエラー種別を区別するために必要です。特にアラート用途として、一時的なエラー（例：`MEMORY_LIMIT_EXCEEDED` や `KEEPER_EXCEPTION`）と一時的ではないエラーを区別する必要があります。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* Iceberg テーブルのパーティションで `identity` 関数を省略できるようにしました。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* JSON ログ出力を特定のチャネルに対してのみ有効化できるようにしました。そのためには、`logger.formatting.channel` を `syslog` / `console` / `errorlog` / `log` のいずれかに設定します。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` でネイティブな数値を使用できるようにしました。これらはすでに論理関数の引数として許可されています。これにより、filter-push-down および move-to-prewhere の最適化が容易になります。 [#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* メタデータが破損した Catalog に対して `SYSTEM DROP REPLICA` を実行した際に発生するエラーを修正しました。 [#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* Azure ではアクセスのプロビジョニングにかなり長い時間がかかる場合があるため、ディスクアクセスチェック（`skip_access_check = 0`）に対するリトライ回数を追加しました。 [#86419](https://github.com/ClickHouse/ClickHouse/pull/86419) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `timeSeries*()` 関数のステイルネスウィンドウを、左開区間かつ右閉区間にしました。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* `FailedInternal*Query` プロファイルイベントを追加しました。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude)).
* 設定ファイルから追加された、名前にドットを含むユーザーの扱いを修正しました。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme)).
* クエリのメモリ使用量に関する非同期メトリクス（`QueriesMemoryUsage` および `QueriesPeakMemoryUsage`）を追加しました。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark --precise` フラグを使用すると、QPS やその他のインターバルごとのメトリクスをより正確にレポートできます。クエリの実行時間がレポート間隔 `--delay D` と同程度の場合でも、安定した QPS を得るのに役立ちます。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa))。
* Linux スレッドの nice 値を設定可能にし、一部のスレッド（merge/mutate、query、materialized view、ZooKeeper client）により高いまたは低い優先度を割り当てられるようにしました。 [#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* レースコンディションによりマルチパートアップロード中に元の例外が失われた場合に発生する、誤解を招く「specified upload does not exist」エラーを修正。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* `EXPLAIN` クエリにおけるクエリプランの説明を制限しました。`EXPLAIN` 以外のクエリでは説明を生成しないようにしました。設定 `query_plan_max_step_description_length` を追加しました。[#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* クエリプロファイラ（`query_profiler_real_time_period_ns` / `query_profiler_cpu_time_period_ns`）向けに、`CANNOT_CREATE_TIMER` を回避する目的で保留中のシグナルを調整できるようにしました。また、インスペクションのために `/proc/self/status` から `SigQ` を収集するようにしました（`ProcessSignalQueueSize` が `ProcessSignalQueueLimit` に近い場合、`CANNOT_CREATE_TIMER` エラーが発生する可能性が高くなります）。[#86760](https://github.com/ClickHouse/ClickHouse/pull/86760)（[Azat Khuzhin](https://github.com/azat)）。
* Keeper における `RemoveRecursive` リクエストの性能を改善。 [#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* JSON 型の出力時に `PrettyJSONEachRow` の余分な空白を削除しました。 [#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar)).
* プレーンな書き込み可能ディスクでディレクトリが削除される際に、`prefix.path` の BLOB サイズを記録するようにしました。 [#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin)).
* ClickHouse Cloud を含むリモートの ClickHouse インスタンスに対するパフォーマンステストをサポートします。使用例: `tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 多量（&gt;16MiB）のメモリを割り当てることが分かっているいくつかの箇所（ソート、非同期インサート、ファイルログ）で、メモリ制限が適切に守られるようにしました。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* `network_compression_method` 設定にサポートされていない汎用コーデックが指定された場合に、例外をスローするようにしました。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze))。
* システムテーブル `system.query_cache` は、これまでは共有エントリ、または同一ユーザーかつ同一ロールの非共有エントリのみを返していましたが、現在は *すべての* クエリ結果キャッシュエントリを返します。非共有エントリは *クエリ結果* を公開しないことが想定されており、`system.query_cache` が返すのは *クエリ文字列* なので問題ありません。これにより、システムテーブルの挙動は `system.query_log` により近いものとなります。[#87104](https://github.com/ClickHouse/ClickHouse/pull/87104)（[Robert Schulze](https://github.com/rschu1ze)）。
* `parseDateTime` 関数のショートサーキット評価を有効にしました。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.parts_columns` に新しいカラム `statistics` を追加。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* レプリケーテッドデータベースおよび内部的にレプリケーションされるテーブルに対する `ALTER` クエリの結果は、イニシエーターノード上でのみ検証されるようになりました。これにより、すでにコミット済みの `ALTER` クエリが他のノード上で行き詰まってしまう状況が修正されます。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `BackgroundSchedulePool` 内の各タイプのタスク数を制限します。すべてのスロットが1種類のタスクで占有され、他のタスクが飢餓状態になる状況を回避します。また、タスク同士が互いを待つことによるデッドロックも防ぎます。これは `background_schedule_pool_max_parallel_tasks_per_type_ratio` サーバー設定によって制御されます。[#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* データベースレプリカの復旧時にテーブルを正しくシャットダウンするようにしました。不適切なシャットダウンにより、データベースレプリカの復旧中に一部のテーブルエンジンで LOGICAL&#95;ERROR が発生する可能性がありました。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* データベース名のタイポ修正候補を生成する際にアクセス権をチェックするようにしました。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd))。
* 1. Hive カラムに対する LowCardinality 対応 2. 仮想カラムより前に Hive カラムを埋める（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要）3. Hive の空フォーマットでの LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. Hive パーティションカラムのみが存在する場合のチェックを修正 5. すべての Hive カラムがスキーマで指定されていることを保証 6. Hive を用いた parallel&#95;replicas&#95;cluster の部分的な修正 7. Hive utils の extractkeyValuePairs で順序付きコンテナを使用（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538)（[Arthur Passos](https://github.com/arthurpassos)）。
* 配列マッピング使用時にエラーの原因となることがある、`IN` 関数の第1引数に対する不要な最適化を防止しました。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parquet ファイルを書き込む際に、iceberg の source id と Parquet 名とのマッピングが、その時点のスキーマに合わせて調整されていませんでした。この PR では、現在のスキーマではなく、各 iceberg データファイルに対応するスキーマを処理するようにしました。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik))。
* ファイルのオープンとは別個に行われていたファイルサイズの読み取り処理を修正しました。これは、`5.10` リリース以前の Linux カーネルに存在したバグへの対応として導入された [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) に関連しています。 [#85837](https://github.com/ClickHouse/ClickHouse/pull/85837) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* カーネルレベルで IPv6 が無効化されているシステム（例: ipv6.disable=1 が設定された RHEL）でも、ClickHouse Keeper が起動に失敗しなくなりました。最初の IPv6 リスナーの作成に失敗した場合は、IPv4 リスナーへのフォールバックを試みるようになりました。 [#85901](https://github.com/ClickHouse/ClickHouse/pull/85901) ([jskong1124](https://github.com/jskong1124)).
* この PR は [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990) をクローズします。globalJoin における parallel replicas 用の TableFunctionRemote サポートを追加します。 [#85929](https://github.com/ClickHouse/ClickHouse/pull/85929) ([zoomxi](https://github.com/zoomxi))。
* orcschemareader::initializeifneeded() のヌルポインタを修正。この PR は次の issue に対応します: [#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### ユーザー向け変更のドキュメントエントリ。 [#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510)).
* FROM 句での相関サブクエリについて、外側クエリのカラムを使用している場合にのみ許可するチェックを追加しました。これにより [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469) が修正され、[#85402](https://github.com/ClickHouse/ClickHouse/issues/85402) も修正されました。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 他のカラムの `MATERIALIZED` 式で使用されているサブカラムを持つカラムに対する `ALTER UPDATE` の動作を修正しました。以前は、式内にサブカラムを含む `MATERIALIZED` カラムが正しく更新されていませんでした。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* PK またはパーティション式でサブカラムが使用されているカラムの変更を禁止しました。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* ストレージ DeltaLake において、非デフォルトのカラムマッピングモード使用時のサブカラム読み取りを修正。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* JSON 内で Enum ヒントを含むパスに誤ったデフォルト値が使用される問題を修正。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* DataLake Hive カタログ URL の解析時に入力のサニタイズを行うようにしました。 [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018) をクローズ。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* ファイルシステムキャッシュの動的リサイズ時に発生する論理エラーを修正します。 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122) をクローズします。 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473) をクローズします。 [#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DatabaseReplicatedSettings の `logs_to_keep` に `NonZeroUInt64` を使用するようにしました。 [#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach))。
* テーブル（例: `ReplacingMergeTree`）が設定 `index_granularity_bytes = 0` で作成されている場合、スキップインデックスを用いた `FINAL` クエリで例外がスローされていました。この例外は既に修正されています。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* UB を除去し、Iceberg のパーティション式のパースに関する問題を修正します。 [#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 1 回の INSERT 内に const ブロックと非 const ブロックが混在している場合に発生するクラッシュを修正しました。 [#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* SQL からディスクを作成する際、デフォルトで `/etc/metrika.xml` からの include を処理するようになりました。[#86232](https://github.com/ClickHouse/ClickHouse/pull/86232)（[alekar](https://github.com/alekar)）。
* String から JSON への accurateCastOrNull/accurateCastOrDefault の動作を修正。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar))。
* iceberg エンジンで `&#39;/&#39;` を含まないディレクトリをサポートします。 [#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* replaceRegex で、FixedString の haystack と空の needle の組み合わせにより発生していたクラッシュを修正しました。 [#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano)).
* ALTER UPDATE Nullable(JSON) 実行時に発生するクラッシュを修正しました。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar)).
* system.tables における欠落していたカラム定義子を修正。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* LowCardinality(Nullable(T)) から Dynamic へのキャスト処理を修正しました。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar)).
* DeltaLake への書き込み時に発生する論理エラーを修正。[#86175](https://github.com/ClickHouse/ClickHouse/issues/86175) をクローズ。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* plain&#95;rewritable ディスクで Azure Blob Storage から空の BLOB を読み込む際に発生する `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` エラーを修正。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* GROUP BY Nullable(JSON) の挙動を修正。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar)).
* Materialized Views のバグを修正しました。ある MV が作成・削除された後、同じ名前で再作成された場合に動作しないことがありました。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix)).
* *cluster functions から読み取る際に、すべてのレプリカが利用不能な場合はエラーとするようにしました。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher)).
* `Buffer` テーブルによる `MergesMutationsMemoryTracking` のリークを修正し、`Kafka`（およびその他）からのストリーミング時の `query_views_log` を修正しました。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* エイリアスストレージの参照テーブルを削除した後の `SHOW TABLES` の挙動を修正。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* send&#95;chunk&#95;header が有効な状態で、HTTP プロトコル経由で UDF が呼び出された場合に発生する、チャンクヘッダー欠落の問題を修正。[#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir))。
* jemalloc のプロファイルフラッシュが有効な場合に発生する可能性のあるデッドロックを修正。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* DeltaLake テーブルエンジンにおけるサブカラムの読み取りを修正。 [#86204](https://github.com/ClickHouse/ClickHouse/issues/86204) をクローズ。 [#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DDLタスクを処理する際の衝突を回避するために、ループバックホストIDを適切に扱うようにしました。. [#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach)).
* numeric/decimal カラムを持つ Postgres データベースエンジンのテーブルに対する DETACH/ATTACH を修正しました。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher))。
* getSubcolumnType における未初期化メモリの使用を修正しました。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano)).
* `searchAny` と `searchAll` 関数は、空の needle で呼び出された場合に、現在は `true`（いわゆる「すべてにマッチする」）を返すようになりました。以前は `false` を返していました。（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 最初のバケットに値が存在しない場合の `timeSeriesResampleToGridWithStaleness()` 関数の動作を修正しました。 [#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar)).
* `merge_tree_min_read_task_size` が 0 に設定されている場合に発生するクラッシュを修正しました。 [#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 読み取り時に、各データファイルのフォーマットを Iceberg メタデータから取得するようにしました（以前はテーブル引数から取得していました）。 [#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時のログフラッシュ中に発生する例外を無視し、シャットダウン処理の安全性を高めました（SIGSEGV を回避するため）。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* ゼロサイズのパートファイルを含むクエリで例外を発生させていた Backup データベースエンジンの不具合を修正しました。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* send&#95;chunk&#95;header が有効化されていて、UDF が HTTP プロトコル経由で呼び出される場合に欠落していたチャンクヘッダーを修正しました。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* keeper セッションの有効期限切れが原因で発生していた S3Queue の論理エラー「Expected current processor {} to be equal to {}」を修正しました。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 挿入とプルーニングにおける `Nullable` 関連のバグを修正。 [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407) をクローズします。 [#86630](https://github.com/ClickHouse/ClickHouse/pull/86630) ([scanhex12](https://github.com/scanhex12))。
* Iceberg メタデータキャッシュが無効になっている場合は、ファイルシステムキャッシュを無効にしないでください。 [#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik)).
* parquet リーダー v3 における「Deadlock in Parquet::ReadManager (single-threaded)」エラーを修正しました。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* ArrowFlight の `listen_host` における IPv6 のサポートを修正しました。 [#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar)).
* `ArrowFlight` ハンドラーでのシャットダウン処理を修正。この PR は [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596) を修正します。 [#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `describe_compact_output=1` を使用する分散クエリを修正。 [#86676](https://github.com/ClickHouse/ClickHouse/pull/86676) ([Azat Khuzhin](https://github.com/azat)).
* ウィンドウ定義の解析とクエリパラメータの適用処理を修正。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* `PARTITION BY` を指定しつつ、パーティションワイルドカードを使用せずにテーブルを作成する際に、25.8 より前のバージョンでは動作していたケースで発生していた例外 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` を修正しました。 [https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567) をクローズします。 [#86748](https://github.com/ClickHouse/ClickHouse/pull/86748) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 並列クエリが単一のロックを取得しようとした際に発生する LogicalError を修正。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* RowBinary 入力フォーマットで JSON 共有データに `NULL` が書き込まれる問題を修正し、`ColumnObject` にいくつかの追加バリデーションを行いました。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* 空の Tuple の順列に対する LIMIT 使用時の不具合を修正。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828)（[Pavel Kruglov](https://github.com/Avogar)）。
* 永続的な処理ノードに対しては、個別の keeper ノードを使用しないでください。[https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995) に対する修正。[#86406](https://github.com/ClickHouse/ClickHouse/issues/86406) をクローズ。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TimeSeries エンジンテーブルが原因で複製データベースに新しいレプリカを作成できない問題を修正。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 一部の Keeper ノードが欠落しているタスクがある場合の `system.distributed_ddl_queue` へのクエリ処理を修正しました。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 伸長済みブロック末尾でのシーク処理を修正しました。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg Iterator の非同期実行中にスローされるプロセス例外。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik))。
* 大きな前処理済み XML 設定ファイルの保存処理を修正しました。 [#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* system.iceberg&#95;metadata&#95;log テーブルにおける date フィールドの値の設定を修正。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* `WHERE` を伴う `TTL` の無限再計算を修正しました。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* `ROLLUP` および `CUBE` 修飾子使用時に `uniqExact` 関数が誤った結果を返す可能性があった問題を修正しました。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat)).
* `parallel_replicas_for_cluster_functions` 設定が 1 の場合に、`url()` テーブル関数でテーブルスキーマを解決できない問題を修正しました。 [#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `PREWHERE` を複数のステップに分割した後、その出力を正しくキャストするようにしました。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* `ON CLUSTER` 句を伴う軽量更新を修正しました。 [#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の集約関数状態と String 引数との互換性を改善しました。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar))。
* OpenAI のモデル名が渡されていなかった問題を修正。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB: パスは user&#95;files ディレクトリ配下でなければなりません。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano)).
* 25.1 より前に作成され、DROP クエリの後も ZooKeeper 内にデータを残していた KeeperMap テーブルの問題を修正しました。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique))。
* Parquet の map および array フィールド ID の読み取りを修正。 [#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* レイジーマテリアライゼーションにおいて、配列サイズサブカラムを持つ配列の読み取りを修正。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型の引数を持つ CASE 関数を修正しました。 [#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar)).
* CSV における空文字列からの空配列の読み取りを修正。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar)).
* 非相関な `EXISTS` で誤った結果が返され得る問題を修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) で導入された `execute_exists_as_scalar_subquery=1` により発生しており、`25.8` に影響します。[#86415](https://github.com/ClickHouse/ClickHouse/issues/86415) を修正します。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `iceberg_metadata_log` が設定されていないにもかかわらず、ユーザーが Iceberg のデバッグ用メタデータ情報を取得しようとした場合にエラーをスローするようにし、`nullptr` へのアクセスを修正しました。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik)).

#### ビルド/テスト/パッケージングの改善

- abseil-cpp 20250814.0との互換性を修正、https://github.com/abseil/abseil-cpp/issues/1923。[#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat))。
- スタンドアロンWASMレキサーのビルドをフラグで制御するように変更。[#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `vmull_p64`命令をサポートしていない古いARM CPUでのcrc32cビルドを修正。[#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos))。
- `openldap` 2.6.10を使用。[#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- darwinで`memalign`をインターセプトしないように修正。[#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `krb5` 1.22.1-finalを使用。[#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `list-licenses.sh`でのRustクレート名の展開を修正。[#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able))。

### ClickHouse リリース 25.8 LTS、2025-08-28 {#258}


#### 後方互換性のない変更
* JSON 内で異なる型の値を含む配列に対して、名前なしの `Tuple` の代わりに `Array(Dynamic)` を推論するようにしました。以前の動作を使用するには、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` を無効にしてください。 [#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 一貫性とシンプルさのために、S3 レイテンシーメトリクスをヒストグラムへ移行しました。 [#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* デフォルト式内で、ドットを含む識別子の周囲にはバッククォートを必須としました。これにより、それらが複合識別子として解析されることを防ぎます。 [#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* レイジー・マテリアライゼーションは、アナライザー有効時（デフォルト）にのみ有効になります。これは、アナライザーなしでの運用を避けるためです。アナライザーなしの動作には、当社の経験上いくつか問題があるためです（たとえば、条件内で `indexHint()` を使用する場合など）。 [#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* Parquet 出力フォーマットにおいて、`Enum` 型の値をデフォルトで `ENUM` 論理型を持つ `BYTE_ARRAY` として書き出すようにしました。 [#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツからのサブカラム読み取りのパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーは、新しい Compact パーツを読み取ることができません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前の `concurrent_threads_scheduler` のデフォルト値は `round_robin` でしたが、多数のシングルスレッドクエリ（例: INSERT）が存在する場合には不公平であることが分かりました。この変更により、より安全な代替である `fair_round_robin` スケジューラをデフォルトとしました。 [#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse は PostgreSQL 形式のヒアドキュメント構文 `$tag$ string contents... $tag$`（ドル引用文字列リテラルとしても知られています）をサポートしています。以前のバージョンでは、タグに関する制約は少なく、句読点や空白を含む任意の文字を使用できました。これは、ドル文字で開始できる識別子との間で構文解析上のあいまいさを生じさせます。一方、PostgreSQL ではタグに使用できるのは単語構成文字のみです。この問題を解決するため、ヒアドキュメントタグには単語構成文字のみを含められるよう制限しました。これにより [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731) がクローズされます。 [#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `azureBlobStorage`、`deltaLakeAzure`、`icebergAzure` 関数を更新し、`AZURE` 権限を正しく検証するようにしました。すべてのクラスタ変種の関数（`-Cluster` 関数）は、対応する非クラスタ版と同様に権限を検証するようになりました。加えて、`icebergLocal` および `deltaLakeLocal` 関数は `FILE` 権限チェックを強制するようになりました。 [#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `allow_dynamic_metadata_for_data_lakes` 設定（Table Engine レベルの設定）をデフォルトで有効化しました。 [#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* JSON フォーマットにおいて、64 ビット整数のクオートをデフォルトで無効にしました。 [#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))



#### 新機能

* PromQL 方言の基本的なサポートが追加されました。これを使用するには、clickhouse-client で `dialect='promql'` を設定し、設定 `promql_table_name='X'` で TimeSeries テーブルを指定し、`rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` のようなクエリを実行します。さらに、PromQL クエリを SQL でラップして、`SELECT * FROM prometheusQuery('up', ...);` のように実行することもできます。現時点では `rate`、`delta`、`increase` の各関数のみがサポートされています。単項演算子および二項演算子には対応していません。HTTP API もありません。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI による SQL 生成機能は、利用可能な場合には環境変数 `ANTHROPIC_API_KEY` および `OPENAI_API_KEY` から自動的に情報を取得できるようになりました。これにより、この機能をゼロコンフィグで利用できるようになります。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik)).
* [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) プロトコルのサポートを実装しました（新しいテーブル関数 `arrowflight` を追加）。 [#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600))。
* これで、すべてのテーブルが（`Merge` エンジンのテーブルだけでなく）`_table` 仮想カラムをサポートするようになりました。これは特に、UNION ALL を含むクエリで有用です。 [#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 外部集約／ソートに任意のストレージポリシー（S3 などのオブジェクトストレージ）を使用できるようにしました。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 明示的に指定した IAM ロールを使用する AWS S3 認証を実装しました。GCS 向けの OAuth を実装しました。これらの機能は最近まで ClickHouse Cloud でのみ利用可能でしたが、今回オープンソース化されました。オブジェクトストレージ向けの接続パラメータのシリアル化など、いくつかのインターフェースを統一しました。 [#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Iceberg TableEngine で position delete をサポートしました。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* Iceberg の Equality Delete に対応しました。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991))。
* Iceberg の書き込みに create をサポート。 [#83927](https://github.com/ClickHouse/ClickHouse/issues/83927) をクローズ。 [#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 書き込み向け Glue カタログ。 [#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 書き込み用の Iceberg REST カタログ。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* すべての Iceberg position delete ファイルをデータファイルにマージします。これにより、Iceberg ストレージ内の Parquet ファイルの数とサイズを削減できます。構文: `OPTIMIZE TABLE table_name`。 [#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg に対する `DROP TABLE` をサポート（REST/Glue カタログからの削除 + テーブルに関するメタデータの削除）。 [#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* merge-on-read フォーマットの Iceberg で ALTER DELETE ミューテーションをサポート。[#85549](https://github.com/ClickHouse/ClickHouse/pull/85549)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* DeltaLake への書き込みをサポート。[#79603](https://github.com/ClickHouse/ClickHouse/issues/79603) をクローズ。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* テーブルエンジン `DeltaLake` で特定のスナップショットバージョンを読み取れるようにするため、設定項目 `delta_lake_snapshot_version` を追加しました。 [#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* min-max プルーニングのために、より多くの Iceberg 統計情報（カラムサイズ、下限および上限）をメタデータ（マニフェストエントリ）に書き込むようにしました。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 単純型に対する Iceberg のカラム追加/削除/変更をサポートしました。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg: version-hint ファイルの書き込みをサポート。これにより [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097) が解決されました。 [#85130](https://github.com/ClickHouse/ClickHouse/pull/85130) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 一時ユーザーによって作成されたビューは、実ユーザーのコピーを保存するようになり、一時ユーザーが削除された後でも無効化されなくなりました。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* ベクトル類似性インデックスがバイナリ量子化をサポートするようになりました。バイナリ量子化によりメモリ使用量が大幅に削減され、距離計算が高速になることでベクトルインデックスの構築処理も高速化されます。また、既存の設定 `vector_search_postfilter_multiplier` は廃止され、より汎用的な設定である `vector_search_index_fetch_multiplier` に置き換えられました。 [#85024](https://github.com/ClickHouse/ClickHouse/pull/85024) ([Shankar Iyer](https://github.com/shankar-iyer))。
* `s3` または `s3Cluster` テーブルエンジン/関数でキーと値の形式による引数指定を許可します。例えば `s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')` のように指定できます。 [#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Kafka などのエンジンからのエラーとなった受信メッセージを保持するための新しいシステムテーブル（「デッドレタキュー」）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn))。
* Replicated データベース向けに、新しい SYSTEM RESTORE DATABASE REPLICA 機能が追加されました。これは、ReplicatedMergeTree における既存の復元機能と同様のものです。 [#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov)).
* PostgreSQL プロトコルで `COPY` コマンドがサポートされるようになりました。 [#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* MySQL プロトコル向けの C# クライアントをサポート。これにより [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992) がクローズされます。 [#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Hive パーティション形式での読み取りおよび書き込みをサポートしました。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* ZooKeeper 接続に関する履歴情報を保存するための `zookeeper_connection_log` システムテーブルを追加しました。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* サーバー設定 `cpu_slot_preemption` により、ワークロードに対するプリエンプティブな CPU スケジューリングが有効になり、ワークロード間での CPU 時間の max-min 公平な割り当てが行われるようになります。CPU スロットリング用の新しいワークロード設定が追加されました: `max_cpus`、`max_cpu_share`、`max_burst_cpu_seconds`。詳細はこちら: [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。 [#80879](https://github.com/ClickHouse/ClickHouse/pull/80879)（[Sergei Trifonov](https://github.com/serxa)）。
* 設定されたクエリ数または時間しきい値に達した後に TCP 接続を切断します。これにより、ロードバランサー配下のクラスタノード間で接続をより均一に分散できます。[#68000](https://github.com/ClickHouse/ClickHouse/issues/68000) を解決。 [#81472](https://github.com/ClickHouse/ClickHouse/pull/81472) ([Kenny Sun](https://github.com/hwabis))。
* parallel replicas で、クエリに対して projection を使用できるようになりました。 [#82659](https://github.com/ClickHouse/ClickHouse/issues/82659). [#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi)).
* DESCRIBE (SELECT ...) に加えて、DESCRIBE SELECT もサポートするようになりました。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* mysql&#95;port および postgresql&#95;port でセキュア接続を強制します。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* ユーザーは、`JSONExtractCaseInsensitive`（および `JSONExtract` の他のバリアント）を使用して、大文字小文字を区別しない JSON キーの検索を行えるようになりました。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* `system.completions` テーブルを導入。[#81889](https://github.com/ClickHouse/ClickHouse/issues/81889) をクローズ。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m))。
* 新しい関数 `nowInBlock64` を追加しました。使用例: `SELECT nowInBlock64(6)` は `2025-07-29 17:09:37.775725` を返します。 [#84178](https://github.com/ClickHouse/ClickHouse/pull/84178)（[Halersson Paris](https://github.com/halersson)）。
* client&#95;id と tenant&#95;id を用いた認証のために AzureBlobStorage に extra&#95;credentials を追加。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* `DateTime` 値を `UUIDv7` に変換する関数 `dateTimeToUUIDv7` を追加しました。使用例：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` は `0198af18-8320-7a7d-abd3-358db23b9d5c` を返します。 [#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich)).
* `timeSeriesDerivToGrid` および `timeSeriesPredictLinearToGrid` 集約関数により、指定された開始タイムスタンプ・終了タイムスタンプ・ステップで定義される時間グリッドへデータを再サンプリングし、それぞれ PromQL 互換の `deriv` および `predict_linear` を計算できます。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0)).
* 2 つの新しい TimeSeries 関数を追加しました: - `timeSeriesRange(start_timestamp, end_timestamp, step)`, - `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`. [#85435](https://github.com/ClickHouse/ClickHouse/pull/85435) ([Vitaly Baranov](https://github.com/vitlibar)).
* 新しい構文 `GRANT READ ON S3('s3://foo/.*') TO user` を追加しました。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit)).
* 新しい出力フォーマットとして `Hash` を追加しました。結果のすべてのカラムと行に対して単一のハッシュ値を計算します。これは、たとえばデータ転送がボトルネックとなるユースケースで、結果の「フィンガープリント」を計算するのに有用です。例: `SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` は `e5f9e676db098fdb9530d2059d8c23ef` を返します。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze))。
* Keeper Multi クエリで任意のウォッチを設定できるようにした。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `clickhouse-benchmark` ツールにオプション `--max-concurrency` を追加し、並列クエリ数を段階的に増やしていくモードを有効にします。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* TODO: これは何か？ 部分集約済みメトリクスをサポートする。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### 実験的機能
* 相関サブクエリのサポートをデフォルトで有効化しました。これらはもはや実験的機能ではありません。 [#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd)).
* Unity、Glue、Rest、Hive Metastore のデータレイクカタログを実験的機能からベータ版に昇格しました。 [#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator)).
* 軽量な更新および削除機能を実験的機能からベータ版に昇格しました。
* ベクター類似性インデックスを用いた近似ベクター検索が GA になりました。 [#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze)).
* Ytsaurus テーブルエンジンおよびテーブル関数。 [#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 以前は、テキストインデックスのデータは複数のセグメントに分割されていました（各セグメントサイズのデフォルトは 256 MiB）。これはテキストインデックス構築時のメモリ消費を削減できる一方で、ディスク上の必要容量を増加させ、クエリ応答時間も長くなります。 [#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov)).



#### パフォーマンスの向上

* 新しい Parquet リーダー実装。従来より高速で、ページレベルでのフィルタープッシュダウンおよび PREWHERE をサポートします。現在は実験的機能です。有効化するには設定 `input_format_parquet_use_native_reader_v3` を使用してください。 [#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321))。
* Azure Blob Storage 向け Azure ライブラリの公式 HTTP トランスポートを、独自実装の HTTP クライアントに置き換えました。このクライアントには、S3 の設定を反映した複数の設定項目を追加しました。Azure と S3 の両方に対して攻めた（短めの）接続タイムアウトを導入しました。Azure プロファイルのイベントおよびメトリクスの観測性を改善しました。新しいクライアントはデフォルトで有効になっており、Azure Blob Storage 上でのコールドクエリのレイテンシを大幅に改善します。以前の `Curl` クライアントには、`azure_sdk_use_native_client=false` を設定することで戻すことができます。 [#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。従来の公式 Azure クライアント実装は、レイテンシが 5 秒から数分におよぶひどいスパイクを起こすため、本番環境には不向きでした。その問題だらけの実装は廃止し、それについて非常に満足しています。
* インデックスをファイルサイズの昇順で処理します。最終的なインデックスの処理順序では、`minmax` インデックスとベクターインデックスが（それぞれ単純さと選択性の高さにより）優先され、その後にその他の小さなインデックスが続きます。`minmax`/ベクターインデックスの中でも、より小さいインデックスが優先されます。 [#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツからサブカラムを読み取る際のパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーは、新しい Compact パーツを読み取ることができません。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* `azureBlobStorage` テーブルエンジン: スロットリングを回避するため、可能な場合はマネージド ID の認証トークンをキャッシュして再利用するようにしました。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak)).
* 右側が結合キー列によって関数的に決定される場合（すべての行で結合キーの値が一意である場合）、`ALL` `LEFT/INNER` JOIN は自動的に `RightAny` に変換されます。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat))。
* `max_joined_block_size_rows` に加えて `max_joined_block_size_bytes` を導入し、大きなカラムを含む JOIN のメモリ使用量を制限できるようにしました。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* メモリ効率の高い集約中に、一部のバケットを順不同で送信できるようにする新しいロジック（設定 `enable_producing_buckets_out_of_order_in_aggregation` によって制御され、デフォルトで有効）が追加されました。特定の集約バケットのマージに他よりも著しく時間がかかる場合に、イニシエーターがその間により大きなバケット ID を持つバケットを先にマージできるようにすることで、パフォーマンスを向上させます。欠点としては、メモリ使用量が増加する可能性があります（それほど大きくはならないはずです）。 [#80179](https://github.com/ClickHouse/ClickHouse/pull/80179) ([Nikita Taranov](https://github.com/nickitat))。
* `optimize_rewrite_regexp_functions` 設定（デフォルトで有効）が導入されました。この設定により、特定の正規表現パターンが検出された場合、オプティマイザは一部の `replaceRegexpAll`、`replaceRegexpOne`、および `extract` 呼び出しを、より単純かつ効率的な形式に書き換えることができます。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* ハッシュ JOIN のメインループ外で `max_joined_block_rows` を処理するようにしました。ALL JOIN においてパフォーマンスがわずかに向上します。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* より細かい粒度の min-max インデックスを優先して処理するようにしました。 [#75381](https://github.com/ClickHouse/ClickHouse/issues/75381) をクローズ。 [#83798](https://github.com/ClickHouse/ClickHouse/pull/83798) ([Maruth Goyal](https://github.com/maruthgoyal))。
* `DISTINCT` ウィンドウ集約を線形時間で実行できるようにし、`sumDistinct` のバグを修正します。[#79792](https://github.com/ClickHouse/ClickHouse/issues/79792) をクローズ。[#52253](https://github.com/ClickHouse/ClickHouse/issues/52253) をクローズ。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取りの削減と CPU 使用率の低下により、より低いレイテンシで完了します。 [#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 並列レプリカ間のワークロード分散におけるキャッシュ局所性を改善するための Rendezvous ハッシュ。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* If コンビネーター向けに addManyDefaults を実装し、これにより If コンビネーターを用いた集約関数がより高速に動作するようになりました。 [#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 複数の文字列列または数値列で `GROUP BY` を行う際、シリアル化したキーを列指向で計算するようにしました。 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li)).
* インデックス解析の結果、並列レプリカ読み取りに対して空の範囲しか得られない場合に、フルスキャンを行わないようにしました。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* パフォーマンステストの安定性向上のために -falign-functions=64 を使用。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* ブルームフィルターインデックスは、`column` が `Array` 型でない場合の `has([c1, c2, ...], column)` のような条件にも利用されるようになりました。これにより、そのようなクエリのパフォーマンスが向上し、`IN` 演算子と同等の効率で実行できるようになります。 [#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki))。
* CompressedReadBufferBase::readCompressedData における不要な memcpy 呼び出しを削減しました。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 一時データを削減して `largestTriangleThreeBuckets` を最適化。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コードを簡素化して文字列のデシリアライズを最適化しました。[#38564](https://github.com/ClickHouse/ClickHouse/issues/38564) をクローズ。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 並列レプリカの最小タスクサイズの計算方法を修正しました。 [#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat))。
* `Join` モードにおけるパッチパーツ適用のパフォーマンスを改善しました。 [#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* ゼロバイトを削除しました。[#85062](https://github.com/ClickHouse/ClickHouse/issues/85062) をクローズします。いくつかの小さなバグを修正しました。関数 `structureToProtobufSchema` と `structureToCapnProtoSchema` は、ゼロ終端バイトを正しく出力せず、その代わりに改行を使用していました。その結果、出力に改行が欠落し、ゼロバイトに依存する他の関数（`logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero`、`encrypt`/`decrypt` など）を使用した場合にバッファオーバーフローを引き起こす可能性がありました。`regexp_tree` 辞書レイアウトは、ゼロバイトを含む文字列の処理をサポートしていませんでした。`formatRowNoNewline` 関数は、`Values` フォーマットや、行末に改行を持たない他の任意のフォーマットで呼び出された場合に、出力の最後の 1 文字を誤って切り捨てていました。`stem` 関数には例外安全性の不具合があり、非常にまれなシナリオにおいてメモリリークを引き起こす可能性がありました。`initcap` 関数は `FixedString` 引数に対して誤った動作をしており、ブロック内の前の文字列が単語文字で終わっている場合、文字列先頭の単語開始位置を認識できませんでした。Apache `ORC` フォーマットのセキュリティ脆弱性を修正し、初期化されていないメモリが露出する可能性を排除しました。関数 `replaceRegexpAll` と、それに対応するエイリアス `REGEXP_REPLACE` の動作を変更しました。これらは、`^a*|a*$` や `^|.*` のように、直前のマッチが文字列全体を処理した場合であっても、文字列末尾で空マッチを行えるようになりました。これは JavaScript、Perl、Python、PHP、Ruby のセマンティクスに対応しますが、PostgreSQL のセマンティクスとは異なります。多くの関数の実装が簡素化および最適化されました。いくつかの関数のドキュメントに誤りがあり、修正されました。`byteSize` の出力が、String 列および String 列を含む複合型に対して変更された点に注意してください（空文字列 1 つあたり 9 バイトから 8 バイトに変更されました）が、これは想定どおりです。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 単一行のみを返すために定数をマテリアライズしている場合、そのマテリアライズ処理を最適化します。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* delta-kernel-rs バックエンドによる並列ファイル処理を改善しました。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `enable_add_distinct_to_in_subqueries` が導入されました。これを有効にすると、ClickHouse は分散クエリにおいて、`IN` 句内のサブクエリに自動的に `DISTINCT` を追加します。これにより、シャード間で転送される一時テーブルのサイズを大幅に削減し、ネットワーク効率を向上させることができます。注意: これはトレードオフであり、ネットワーク転送量は削減されますが、各ノードで追加のマージ（重複排除）処理が必要になります。ネットワーク転送がボトルネックとなっており、マージのコストが許容範囲内である場合にこの設定を有効にしてください。 [#81908](https://github.com/ClickHouse/ClickHouse/pull/81908) ([fhw12345](https://github.com/fhw12345)).
* 実行可能なユーザー定義関数に対するクエリメモリ追跡のオーバーヘッドを削減。[#83929](https://github.com/ClickHouse/ClickHouse/pull/83929)（[Eduard Karacharov](https://github.com/korowa)）。
* ストレージ `DeltaLake` に内部の `delta-kernel-rs` フィルタリング（統計およびパーティションプルーニング）を実装しました。 [#84006](https://github.com/ClickHouse/ClickHouse/pull/84006) ([Kseniia Sumarokova](https://github.com/kssenii)).
* オンザフライで更新される列や patch part に依存するスキップインデックスの無効化を、より細かい粒度で行うようにしました。これにより、スキップインデックスはオンザフライのミューテーションや patch part の影響を受けたパーツでのみ使用されなくなります。以前は、これらのインデックスはすべてのパーツで無効化されていました。 [#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ))。
* 暗号化された名前付きコレクション用の `encrypted_buffer` について、必要最小限のメモリのみを割り当てるようにしました。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* ブルームフィルターインデックス（通常、ngram、token）に対するサポートが改善され、1 つ目の引数が定数配列（集合）、2 つ目の引数がインデックス付きカラム（部分集合）の場合にそれらを利用できるようになり、より効率的なクエリ実行が可能になりました。 [#84700](https://github.com/ClickHouse/ClickHouse/pull/84700) ([Doron David](https://github.com/dorki))。
* Keeper におけるストレージロックでの競合を軽減しました。 [#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368)).
* `WHERE` に対する `read_in_order_use_virtual_row` の未対応だったサポートを追加しました。これにより、フィルタが完全には `PREWHERE` にプッシュダウンされなかったクエリで、追加のパーツの読み取りをスキップできるようになりました。 [#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 各データファイルごとにオブジェクトを明示的に保存することなく、Iceberg テーブル上のオブジェクトを非同期に反復処理できるようにしました。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik))。
* 相関していない `EXISTS` をスカラー副問い合わせとして実行します。これにより、スカラー副問い合わせキャッシュを利用し、結果を定数畳み込みしてインデックスに有利に働かせることができます。互換性維持のため、新しい設定 `execute_exists_as_scalar_subquery=1` が追加されました。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。





#### 改善

* DatabaseReplicatedSettings のデフォルト値を定義する `database_replicated` 設定を追加しました。Replicated DB の CREATE クエリでこの設定が指定されていない場合、この設定の値が使用されます。 [#85127](https://github.com/ClickHouse/ClickHouse/pull/85127) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Web UI（play）でテーブル列のサイズを変更できるようにしました。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki)).
* `iceberg_metadata_compression_method` 設定により、圧縮された `.metadata.json` ファイルをサポートしました。ClickHouse のすべての圧縮方式をサポートします。これにより [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895) がクローズされました。 [#85196](https://github.com/ClickHouse/ClickHouse/pull/85196) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `EXPLAIN indexes = 1` の出力に、読み取るレンジ数を表示するようにしました。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm))。
* ORC の圧縮ブロックサイズを設定できる設定項目を追加し、デフォルト値を 64KB から 256KB に変更して Spark および Hive と整合性を取るようにしました。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li)).
* Wide パーツに `columns_substreams.txt` ファイルを追加し、そのパーツ内に保存されているすべてのサブストリームを追跡できるようにしました。これにより、JSON 型および Dynamic 型の動的ストリームを追跡できるため、動的ストリームの一覧を取得する際に、それらのカラムのサンプルを読み取る必要がなくなります（たとえばカラムサイズの計算時など）。また、すべての動的ストリームが `system.parts_columns` に反映されるようになりました。 [#81091](https://github.com/ClickHouse/ClickHouse/pull/81091) ([Pavel Kruglov](https://github.com/Avogar)).
* 機密データをデフォルトで非表示にするため、clickhouse format に CLI フラグ --show&#95;secrets を追加しました。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom)).
* S3 の読み取りおよび書き込みリクエストは、`max_remote_read_network_bandwidth_for_server` および `max_remote_write_network_bandwidth_for_server` のスロットリングによる問題を回避するために、（S3 リクエスト全体ではなく）HTTP ソケットレベルでスロットリングされるようになりました。 [#81837](https://github.com/ClickHouse/ClickHouse/pull/81837)（[Sergei Trifonov](https://github.com/serxa)）。
* 同じカラムに対して、異なるウィンドウ（ウィンドウ関数用）ごとに異なる照合順序を混在させることを可能にした。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* マージセレクタをシミュレーション、可視化、比較するためのツールを追加。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa))。
* `address_expression` 引数でクラスタが指定されている場合に、並列レプリカ対応の `remote*` テーブル関数をサポートしました。また、[#73295](https://github.com/ClickHouse/ClickHouse/issues/73295) を修正しました。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* バックアップファイルの書き込みに関するすべてのログメッセージを TRACE に設定。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 異常な名前や codec を持つユーザー定義関数が、SQL フォーマッタによって一貫性のない形式でフォーマットされる場合がありました。この変更により [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092) が解決されました。[#83644](https://github.com/ClickHouse/ClickHouse/pull/83644)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ユーザーは、`JSON` 型内で `Time` 型および `Time64` 型を使用できるようになりました。 [#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 並列レプリカを用いた結合では、`join logical step` が使用されるようになりました。並列レプリカを使用する結合クエリで問題が発生した場合は、`SET query_plan_use_new_logical_join_step=0` を試し、そのうえで Issue を報告してください。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 複数ノード環境における cluster&#95;function&#95;process&#95;archive&#95;on&#95;multiple&#95;nodes の互換性を修正。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` テーブルレベルでマテリアライズドビューへの挿入設定を変更できるようにしました。新たに `S3Queue` レベルの設定 `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` を追加しました。デフォルトではプロファイルレベルの設定が使用され、`S3Queue` レベルの設定がそれらを上書きします。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii))。
* プロファイルイベント `MutationAffectedRowsUpperBound` を追加しました。このイベントは、ミューテーションで影響を受ける行数を示します（例：`ALTER UPDATE` や `ALTER DELETE` クエリで条件を満たす行の総数）。 [#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ)).
* cgroup の情報（該当する場合、すなわち `memory_worker_use_cgroup` と cgroup が利用可能な場合）を使用して、メモリトラッカー（`memory_worker_correct_memory_tracker`）を調整します。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981)（[Azat Khuzhin](https://github.com/azat)）。
* MongoDB: 文字列から数値型への暗黙的なパース。以前は、ClickHouse テーブルの数値カラムに対して MongoDB ソースから文字列値が渡された場合、例外がスローされていました。現在は、エンジンが文字列から数値を自動的にパースしようと試みます。[#81167](https://github.com/ClickHouse/ClickHouse/issues/81167) をクローズしました。 [#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* `Nullable` な数値に対して、`Pretty` 形式で桁区切りを強調表示するようにしました。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード: ツールチップが上端でコンテナからはみ出さないようになりました。 [#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード上のドットの見た目を少し改善しました。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard の favicon を少し改善しました。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI: ブラウザがパスワードを保存できるようにしました。また、URL の値も保持されます。 [#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 特定の Keeper ノードに追加の ACL を適用するための `apply_to_children` 設定のサポートを追加。[#84137](https://github.com/ClickHouse/ClickHouse/pull/84137)（[Antonio Andelic](https://github.com/antonio2368)）。
* MergeTree における &quot;compact&quot; Variant discriminator のシリアライズ方式の利用を修正しました。以前は、利用可能な一部のケースで使われていませんでした。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar))。
* レプリケートデータベース設定にサーバー設定 `logs_to_keep` を追加し、レプリケートデータベースのデフォルトの `logs_to_keep` パラメータを変更できるようにしました。値を小さくすると（特に多数のデータベースがある場合）ZNode の数が減り、値を大きくすると、長時間オフラインだったレプリカでも追いつけるようになります。 [#84183](https://github.com/ClickHouse/ClickHouse/pull/84183) ([Alexey Khatskevich](https://github.com/Khatskevich))。
* JSON 型のパース時に JSON キー内のドットをエスケープするための設定 `json_type_escape_dots_in_keys` を追加しました。この設定はデフォルトで無効です。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar))。
* クローズされた接続から読み取ってしまうことを防ぐため、EOF を確認する前に接続がキャンセルされていないかをチェックします。 [#83893](https://github.com/ClickHouse/ClickHouse/issues/83893) を修正。 [#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Web UI におけるテキスト選択時の色をわずかに改善しました。違いがはっきり分かるのは、ダークモードで選択されたテーブルセルの場合のみです。以前のバージョンでは、テキストと選択範囲の背景とのコントラストが不十分でした。 [#84258](https://github.com/ClickHouse/ClickHouse/pull/84258) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* クライアント接続に対するサーバーのシャットダウン処理を、内部チェックを簡素化することで改善しました。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 設定 `delta_lake_enable_expression_visitor_logging` を追加し、式ビジターログを無効化できるようにしました。デバッグ時に `test` ログレベルであってもログが冗長になりすぎる場合があるためです。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Cgroup レベルとシステム全体のメトリクスが、現在はまとめてレポートされます。Cgroup レベルのメトリクスは `CGroup<Metric>` という名前で、OS レベルのメトリクス（procfs から収集されるもの）は `OS<Metric>` という名前です。 [#84317](https://github.com/ClickHouse/ClickHouse/pull/84317) ([Nikita Taranov](https://github.com/nickitat))。
* Web UI のチャートをわずかに改善しました。大きな変更ではありませんが、より良くなりました。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Replicated データベース設定 `max_retries_before_automatic_recovery` のデフォルト値を 10 に変更し、一部のケースでより高速に復旧できるようにしました。 [#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリパラメータを使用した `CREATE USER` の書式を修正しました（例: `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。 [#84376](https://github.com/ClickHouse/ClickHouse/pull/84376) ([Azat Khuzhin](https://github.com/azat)).
* バックアップおよびリストア操作時に使用される S3 のリトライ用バックオフ戦略を設定するための `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor` を導入しました。 [#84421](https://github.com/ClickHouse/ClickHouse/pull/84421) ([Julia Kartseva](https://github.com/jkartseva)).
* S3Queue の ordered モードの修正: shutdown が呼び出された場合には、より早く終了するようにしました。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* pyiceberg から読み取るための iceberg への書き込みをサポートしました。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* KeyValue ストレージの主キー（例: EmbeddedRocksDB、KeeperMap）に対して `IN` / `GLOBAL IN` フィルターをプッシュダウンする際に、セット値の型変換を許可します。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa))。
* chdig を [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1) に更新。 [#84521](https://github.com/ClickHouse/ClickHouse/pull/84521) ([Azat Khuzhin](https://github.com/azat))。
* これまで UDF 実行中の低レベルエラーではさまざまなエラーコードが返される可能性がありましたが、今後はエラーコード `UDF_EXECUTION_FAILED` で失敗するようになりました。 [#84547](https://github.com/ClickHouse/ClickHouse/pull/84547) ([Xu Jia](https://github.com/XuJia0210)).
* KeeperClient に `get_acl` コマンドを追加。[#84641](https://github.com/ClickHouse/ClickHouse/pull/84641)（[Antonio Andelic](https://github.com/antonio2368)）。
* データレイクテーブルエンジンにスナップショットバージョン機能を追加。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton)).
* `ConcurrentBoundedQueue` のサイズに関するディメンション付きメトリクスを追加しました。キューの種類（そのキューが何のためのものか）とキュー ID（現在のキューインスタンスごとにランダムに生成される ID）でラベル付けされます。 [#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `system.columns` テーブルで、既存の `name` カラムに対するエイリアスとして `column` が利用できるようになりました。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang)).
* MergeTree に新しい設定 `search_orphaned_parts_drives` を追加し、たとえばローカルメタデータを持つディスクなど、どのディスク上でパーツを探索するかの対象範囲を制限できるようにしました。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* Keeper に 4LW `lgrq` を追加し、受信したリクエストのログ記録を切り替えられるようにしました。 [#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368)).
* 外部認証の `forward_headers` を大文字・小文字を区別せずに照合するようにしました。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` ツールが暗号化された ZooKeeper 接続をサポートするようになりました。 [#84764](https://github.com/ClickHouse/ClickHouse/pull/84764) ([Roman Vasin](https://github.com/rvasin))。
* `system.errors` にフォーマット文字列列を追加しました。この列は、アラートルールで同じエラータイプごとにグループ化するために必要です。 [#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-format` を更新し、`--hilite` のエイリアスとして `--highlight` を受け付けるようにしました。- `clickhouse-client` を更新し、`--hilite` のエイリアスとして `--highlight` を受け付けるようにしました。- この変更を反映するように `clickhouse-format` のドキュメントを更新しました。 [#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 複合型に対するフィールド ID ベースの Iceberg 読み取りを修正しました。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `SlowDown` などのエラーによって発生するリトライストーム時に、リトライ可能なエラーが 1 件でも検出されたらすべてのスレッドの処理をスローダウンさせることで S3 への負荷を軽減する、新しい `backup_slow_all_threads_after_retryable_s3_error` 設定を追加しました。 [#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* レプリケートデータベースにおける非追記型の RMV DDL で、古い一時テーブルの作成とリネーム処理をスキップするようにしました。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Keeper のログエントリキャッシュのサイズを、`keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` と `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` を使用してエントリ数ベースで制限できるようにしました。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368))。
* サポート対象外のアーキテクチャでも `simdjson` を使用できるようにしました（以前は `CANNOT_ALLOCATE_MEMORY` エラーが発生していました）。 [#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat)).
* 非同期ロギング: 制限を調整可能にし、インロスペクション機能を追加。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* 削除対象のオブジェクトをまとめて収集し、1回のオブジェクトストレージ削除操作で処理できるようにしました。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg の現行の positional delete ファイル実装では、すべてのデータを RAM 上に保持します。positional delete ファイルが大きくなることはよくあり、その場合この方式はかなりコストが高くなります。私の実装では、RAM 上に保持するのは Parquet delete ファイルの最後の row-group のみとし、これによりコストを大幅に削減しています。 [#85329](https://github.com/ClickHouse/ClickHouse/pull/85329) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* chdig: 画面に残る表示の不具合を修正し、エディタでクエリを編集した後に発生するクラッシュを修正し、`path` から `editor` を検索するようにし、[25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1) に更新しました。 [#85341](https://github.com/ClickHouse/ClickHouse/pull/85341) ([Azat Khuzhin](https://github.com/azat))。
* 不足していた `partition_columns_in_data_file` を Azure 設定に追加しました。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos)).
* 関数 `timeSeries*ToGrid` でステップ 0 を許可。これは [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) の一部です。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* system.tables にデータレイクテーブルを追加するかどうかを制御するフラグ show&#95;data&#95;lake&#95;catalogs&#95;in&#95;system&#95;tables を追加しました。[#85384](https://github.com/ClickHouse/ClickHouse/issues/85384) を解決します。 [#85411](https://github.com/ClickHouse/ClickHouse/pull/85411) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* `remote_fs_zero_copy_zookeeper_path` でマクロ展開がサポートされるようになりました。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme)).
* clickhouse-client の AI の見た目が少し改善されます。 [#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 既存のデプロイメントで `trace_log.symbolize` をデフォルトで有効化しました。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 複合識別子を扱えるケースをさらに拡大しました。特に、`ARRAY JOIN` と旧アナライザとの互換性が向上しています。従来の動作を維持するための新しい設定 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` を導入しました。 [#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* system.columns でテーブル列サイズを取得する際に UNKNOWN&#95;DATABASE を無視するようにしました。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* パッチパーツ内の非圧縮バイト数の合計に対する上限（テーブル設定 `max_uncompressed_bytes_in_patches`）を追加しました。これにより、軽量アップデート後の SELECT クエリの大幅な低速化を防ぎ、軽量アップデートの不適切な利用も防止します。 [#85641](https://github.com/ClickHouse/ClickHouse/pull/85641) ([Anton Popov](https://github.com/CurtizJ)).
* `system.grants` に `parameter` 列を追加し、`GRANT READ/WRITE` のソースタイプおよび `GRANT TABLE ENGINE` のテーブルエンジンを判別できるようにしました。 [#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* パラメータを持つカラム（例: Decimal(8)）の後に続く CREATE DICTIONARY クエリのカラムでの末尾カンマのパースを修正しました。[#85586](https://github.com/ClickHouse/ClickHouse/issues/85586) をクローズします。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 関数 `nested` で内部配列をサポートしました。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 外部ライブラリによるすべてのメモリアロケーションが、ClickHouse のメモリトラッカーから参照され、正しくカウントされるようになりました。これにより、一部のクエリで報告されるメモリ使用量が「増加」して見えたり、`MEMORY_LIMIT_EXCEEDED` による失敗が発生したりする場合があります。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。



#### バグ修正（公式安定版リリースで発生するユーザー影響のある不具合）



* このPRでは、RESTカタログ経由でIcebergテーブルをクエリする際のメタデータ解決を修正します。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* DDLWorker と DatabaseReplicatedDDLWorker における markReplicasActive を修正しました。[#81395](https://github.com/ClickHouse/ClickHouse/pull/81395)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* パース失敗時の Dynamic 列のロールバック処理を修正。 [#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar)).
* 関数 `trim` がすべて定数の入力で呼び出された場合、一定の出力文字列を生成するようになりました。（バグ [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* `optimize_syntax_fuse_functions` が有効な場合に発生する、副問い合わせの重複による論理エラーを修正し、[#75511](https://github.com/ClickHouse/ClickHouse/issues/75511) をクローズ。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `WHERE ... IN (<subquery>)` 句を含むクエリで、クエリ条件キャッシュ（設定 `use_query_condition_cache`）が有効な場合に誤った結果が返される問題を修正しました。 [#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you)).
* これまで `gcs` 関数の使用には特別なアクセス権は必要ありませんでしたが、今後は使用時に `GRANT READ ON S3` 権限が付与されているかを確認するようになります。 [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567) をクローズ。 [#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* s3Cluster() からレプリケート MergeTree への INSERT SELECT の実行時に、利用できないノードをスキップするようにしました。 [#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter)).
* `plain_rewritable`/`plain` メタデータ型を使用する場合の（実験的トランザクションで使用される MergeTree における）追記書き込みの挙動を修正しました。以前はこれらは単に無視されていました。 [#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Avro schema registry の認証情報がユーザーやログから見えないようにマスクするようにしました。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `add_minmax_index_for_numeric_columns=1` または `add_minmax_index_for_string_columns=1` を指定して MergeTree テーブルを作成した場合に、後続の ALTER 操作中にインデックスがマテリアライズされ、その結果、新しいレプリカ上で Replicated データベースが正しく初期化されない問題を修正しました。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique))。
* Decimal 型に対して誤った統計情報（最小値／最大値）を出力していた Parquet writer を修正しました。 [#83754](https://github.com/ClickHouse/ClickHouse/pull/83754) ([Michael Kolupaev](https://github.com/al13n321)).
* `LowCardinality(Float32|Float64|BFloat16)` 型における NaN 値のソート方法を修正。 [#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* バックアップから復元する際に、`definer` ユーザーがバックアップに含まれない場合があり、その結果、バックアップ全体が壊れてしまうことがあります。これを防ぐために、復元時の対象テーブル作成時に行っていた権限チェックを遅延させ、実行時にのみチェックを行うようにしました。 [#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit))。
* 不正な `INSERT` の後に接続が切断状態のまま残ることでクライアントがクラッシュする問題を修正。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* アナライザーが有効な場合に、`remote` テーブル関数の `view(...)` 引数内で任意のテーブルを参照できるようにしました。 [#78717](https://github.com/ClickHouse/ClickHouse/issues/78717) を修正。 [#79377](https://github.com/ClickHouse/ClickHouse/issues/79377) を修正。 [#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* jsoneachrowwithprogress における onprogress 呼び出しが、終了処理と同期されるようになりました。 [#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema)).
* これにより [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303) がクローズされます。 [#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* const 引数と非 const 引数が混在する場合に備えて colorSRGBToOKLCH/colorOKLCHToSRGB を修正。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat)).
* RowBinary 形式で NULL 値を含む JSON パスの書き込み処理を修正しました。 [#83923](https://github.com/ClickHouse/ClickHouse/pull/83923) ([Pavel Kruglov](https://github.com/Avogar)).
* Date から DateTime64 への型変換時に、大きな値（&gt;2106-02-07）でオーバーフローが発生する問題を修正しました。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 常に `filesystem_prefetches_limit` を適用するようにしました（`MergeTreePrefetchedReadPool` の場合に限らず）。 [#83999](https://github.com/ClickHouse/ClickHouse/pull/83999) ([Azat Khuzhin](https://github.com/azat)).
* `MATERIALIZE COLUMN` クエリによって `checksums.txt` に予期しないファイルが記録され、最終的にデータパーツが detached されてしまう可能性があるまれなバグを修正しました。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* 一方の列が `LowCardinality`、もう一方が定数である場合に、不等号条件で JOIN を行う際に発生していた論理エラー `Expected single dictionary argument for function` を修正しました。[#81779](https://github.com/ClickHouse/ClickHouse/issues/81779) をクローズ。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 構文ハイライト付きの対話モードで使用した際に clickhouse client がクラッシュする問題を修正しました。 [#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc)).
* クエリ条件キャッシュを再帰 CTE と併用した際に誤った結果が返される問題を修正しました（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 定期的なパーツのリフレッシュで例外を適切に処理するようにしました。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 等号の被演算子の型が異なる場合や定数を参照している場合に、フィルタが JOIN 条件にマージされてしまう問題を修正。[#83432](https://github.com/ClickHouse/ClickHouse/issues/83432) を修正。[#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* テーブルにプロジェクションがあり、`lightweight_mutation_projection_mode = 'rebuild'` のときに、ユーザーがテーブル内の任意のブロックからすべての行を削除する軽量削除を実行すると発生する、まれな ClickHouse のクラッシュを修正しました。 [#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin)).
* バックグラウンドのキャンセルチェッカー・スレッドによって発生するデッドロックを修正。 [#84203](https://github.com/ClickHouse/ClickHouse/pull/84203) ([Antonio Andelic](https://github.com/antonio2368)).
* 不正な `WINDOW` 定義に対する無限再帰的な解析を修正しました。[#83131](https://github.com/ClickHouse/ClickHouse/issues/83131) を解決。 [#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* Bech32 のエンコードおよびデコードが誤る原因となっていたバグを修正しました。このバグは、テストに使用していたアルゴリズムのオンライン実装にも同じ問題があったため、当初は検出されませんでした。 [#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov))。
* `array()` 関数における空タプルの誤った構築を修正しました。これにより [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202) が解決されます。 [#84297](https://github.com/ClickHouse/ClickHouse/pull/84297) ([Amos Bird](https://github.com/amosbird))。
* 並列レプリカと複数の INNER 結合に続いて RIGHT 結合を含むクエリで発生する `LOGICAL_ERROR` を修正しました。そのようなクエリでは並列レプリカを使用しないようにしました。[#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 以前は、`set` インデックスが、グラニュールがフィルタを通過したかどうかを判定する際に `Nullable` 列を考慮していませんでした（issue [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* ClickHouse は、テーブルタイプが小文字で指定されている Glue Catalog からもテーブルを読み取れるようになりました。 [#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin)).
* `JOIN` またはサブクエリが存在する場合には、テーブル関数をその `cluster` 版に置き換えないでください。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `IAccessStorage` におけるロガーの使用方法を修正しました。[#84365](https://github.com/ClickHouse/ClickHouse/pull/84365)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* テーブル内のすべてのカラムを更新する軽量更新に存在していた論理エラーを修正しました。 [#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ)).
* `DoubleDelta` コーデックは、数値型のカラムにのみ適用できるようになりました。特に、`FixedString` カラムは `DoubleDelta` を使用して圧縮できなくなりました（[#80220](https://github.com/ClickHouse/ClickHouse/issues/80220) の修正）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `MinMax` インデックスの評価時に、NaN 値との比較で正しい範囲が使用されていませんでした。 [#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 遅延マテリアライゼーションを用いた Variant 列の読み取りを修正。 [#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar)).
* `zoutofmemory` をハードウェアエラーにし、それ以外の場合は論理エラーをスローするようにしました。詳細は [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877) を参照してください。 [#84420](https://github.com/ClickHouse/ClickHouse/pull/84420)（[Han Fei](https://github.com/hanfei1991)）。
* サーバー設定 `allow_no_password` を 0 に変更した後に、`no_password` で作成されたユーザーがログインを試みるとサーバーがクラッシュする問題を修正しました。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Keeper の changelog への順不同な書き込みを修正しました。以前は、changelog への書き込みが進行中の状態で、rollback によって出力先ファイルが同時に変更される可能性がありました。これにより、ログの不整合やデータ損失が発生するおそれがありました。 [#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368)).
* すべての TTL がテーブルから削除された場合、MergeTree は TTL に関連する処理を一切行わなくなりました。 [#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin)).
* LIMIT を伴う並列分散 INSERT SELECT が誤って許可されており、対象テーブルでデータの重複を引き起こしていました。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* データレイクにおける仮想カラムを用いたファイルプルーニングを修正。[#84520](https://github.com/ClickHouse/ClickHouse/pull/84520)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* rocksdb ストレージを使用する keeper でのリークを修正しました（イテレータが破棄されていませんでした）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* `ALTER MODIFY ORDER BY` がソートキー内の TTL 列を検証しない問題を修正しました。これにより、`ALTER` 操作中に `ORDER BY` 句で TTL 列が使用された場合には正しくエラーとして扱われ、テーブル破損の可能性を防ぎます。 [#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 互換性のため、`allow_experimental_delta_kernel_rs` の pre-25.5 における値を `false` に変更しました。 [#84587](https://github.com/ClickHouse/ClickHouse/pull/84587) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マニフェストファイルからスキーマを取得するのをやめ、代わりに各スナップショットごとに関連するスキーマを個別に保存するようにしました。各データファイルについては、そのデータファイルに対応するスナップショットから関連するスキーマを推論します。以前の動作は、既存ステータスのエントリを持つマニフェストファイルに関する Iceberg の仕様に違反していました。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik))。
* Keeper 設定 `rotate_log_storage_interval = 0` が原因で ClickHouse がクラッシュする問題を修正しました。(issue [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975)). [#84637](https://github.com/ClickHouse/ClickHouse/pull/84637) ([George Larionov](https://github.com/george-larionov)).
* S3Queue の論理エラー「Table is already registered」を修正。[#84433](https://github.com/ClickHouse/ClickHouse/issues/84433) をクローズ。[https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) の変更により発生した不具合。[#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* RefreshTask で `view` から ZooKeeper を取得する際に `mutex` をロックするようにしました。 [#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 外部ソートで遅延カラムを使用した際に発生する `CORRUPTED_DATA` エラーを修正。 [#84738](https://github.com/ClickHouse/ClickHouse/pull/84738) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* ストレージ `DeltaLake` における delta-kernel を用いたカラムプルーニングを修正。 [#84543](https://github.com/ClickHouse/ClickHouse/issues/84543) をクローズ。 [#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ストレージ DeltaLake の delta-kernel で認証情報をリフレッシュするようにしました。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 接続障害の発生後に不要な内部バックアップが開始されてしまう問題を修正。 [#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar)).
* 遅延しているリモートソースをクエリした際に、ベクターの範囲外アクセスが発生する可能性があった問題を修正しました。 [#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` と `no_op` のトークナイザーが、空の入力トークンに対して (experimental) テキストインデックスをクラッシュさせることがなくなりました。 [#84849](https://github.com/ClickHouse/ClickHouse/pull/84849) ([Robert Schulze](https://github.com/rschu1ze)).
* `ReplacingMergeTree` および `CollapsingMergeTree` エンジンを使用するテーブルに対する lightweight update の問題を修正しました。 [#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* object queue エンジンを使用するテーブルに対して、すべての設定がテーブルメタデータに正しく保存されるように修正しました。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper が返す total watches のカウントを修正。 [#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* バージョン 25.7 より前のサーバー上で作成された `ReplicatedMergeTree` エンジンのテーブルに対する軽量更新を修正しました。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* `ALTER TABLE ... REPLACE PARTITION` クエリ実行後に、非レプリケートな `MergeTree` エンジンを使用するテーブルでの軽量更新が正しく動作しない問題を修正しました。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* クエリ内での boolean リテラルと整数リテラルのカラム名の衝突を防ぐため、boolean リテラルのカラム名生成で「1」/「0」ではなく「true」/「false」を使用するように修正しました。 [#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* バックグラウンドスケジュールプールおよびエグゼキューターにおけるメモリトラッキングのずれを修正しました。 [#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* Merge テーブルエンジンで発生し得るソートの不整合の問題を修正しました。 [#85025](https://github.com/ClickHouse/ClickHouse/pull/85025) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* DiskEncrypted の未実装だった API を実装しました。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 分散コンテキストで相関サブクエリが使用されている場合にクラッシュを回避するためのチェックを追加しました。[#82205](https://github.com/ClickHouse/ClickHouse/issues/82205) を修正。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030) ([Dmitry Novik](https://github.com/novikd))。
* Iceberg は、SELECT クエリ間で関連するスナップショットバージョンをキャッシュせず、常に正しくスナップショットを解決するようになりました。以前に Iceberg のスナップショットをキャッシュしようとした試みは、タイムトラベルを用いた Iceberg テーブルの利用時に問題を引き起こしていました。 [#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* `AzureIteratorAsync` における二重解放バグを修正しました。 [#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat)).
* JWT で識別されるユーザーを作成しようとした場合のエラーメッセージを改善しました。 [#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `ReplicatedMergeTree` におけるパッチパーツのクリーンアップ処理を修正しました。以前は、パッチパーツを具体化するマージ済みまたはミューテート済みパーツが別のレプリカからダウンロードされるまで、軽量な更新の結果が一時的にそのレプリカ上で見えない場合がありました。[#85121](https://github.com/ClickHouse/ClickHouse/pull/85121)（[Anton Popov](https://github.com/CurtizJ)）。
* 型が異なる場合の mv で発生する illegal&#95;type&#95;of&#95;argument を修正。 [#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* delta-kernel 実装で発生していたセグメンテーションフォルトを修正しました。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* メタデータファイルの移動に長時間かかる場合に、レプリケートされたデータベースのリカバリに時間がかかる問題を修正しました。 [#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `additional_table_filters expression` 設定内の `IN (subquery)` に対する `Not-ready Set` の問題を修正しました。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* SYSTEM DROP REPLICA クエリ中の不要な `getStatus()` 呼び出しを削除しました。バックグラウンドでテーブルが削除された際に `Shutdown for storage is called` という例外がスローされる問題を修正しました。 [#85220](https://github.com/ClickHouse/ClickHouse/pull/85220) ([Nikolay Degterinsky](https://github.com/evillique)).
* `DeltaLake` エンジンの delta-kernel 実装における競合状態を修正。 [#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` エンジンで delta-kernel を無効化した状態でのパーティションデータの読み取りを修正しました。この問題は 25.7 で発生していました（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* CREATE OR REPLACE および RENAME クエリに、これまで不足していたテーブル名長のチェックを追加しました。 [#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321)).
* `DEFINER` が削除された場合に、Replicated データベースの新しいレプリカ上で RMV を作成できない問題を修正しました。 [#85327](https://github.com/ClickHouse/ClickHouse/pull/85327) ([Nikolay Degterinsky](https://github.com/evillique)).
* 複合型に対する Iceberg への書き込み処理を修正しました。 [#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 複合型に対する下限および上限の設定はサポートされていません。 [#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Distributed テーブルまたは remote テーブル関数経由でオブジェクトストレージ関数から読み込む際に発生する論理エラーを修正しました。修正対象: [#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 壊れたプロジェクションを含むパーツのバックアップ処理を修正しました。 [#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368)).
* 安定化されるまでのリリースでは、プロジェクション内で `_part_offset` 列を使用できないようにしました。 [#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* JSON に対する ALTER UPDATE 実行時に発生するクラッシュおよびデータ破損を修正。 [#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar)).
* `reading reverse in order` 最適化を使用する並列レプリカでのクエリが、誤った結果を生成する可能性がありました。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* String のデシリアライズ中に MEMORY&#95;LIMIT&#95;EXCEEDED が発生した場合に起こりうる UB（クラッシュ）を修正しました。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 誤っていたメトリクス `KafkaAssignedPartitions` と `KafkaConsumersWithAssignment` を修正しました。 [#85494](https://github.com/ClickHouse/ClickHouse/pull/85494) ([Ilya Golshtein](https://github.com/ilejn)).
* PREWHERE（明示的指定か自動適用かを問わず）が使用されている場合に、処理済みバイト数の統計が過小に見積もられていた問題を修正しました。 [#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321)).
* S3 リクエストレート低下に関する早期リターン条件を修正しました。再試行可能なエラーによって全スレッドが一時停止している場合のスローダウン動作を有効にする条件として、`s3_slow_all_threads_after_network_error` と `backup_slow_all_threads_after_retryable_s3_error` の両方が true であることを要求するのではなく、いずれか一方が true であればよいように変更しました。 [#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva)).
* この PR は、REST カタログ経由で Iceberg テーブルをクエリする際のメタデータ解決を修正します。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha))。
* `log_comment` または `insert_deduplication_token` の設定を変更する非同期インサートで、まれに発生していたクラッシュを修正しました。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ)).
* multipart/form-data を使用した HTTP で、date&#95;time&#95;input&#95;format などのパラメータが無視されていました。 [#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema)).
* icebergS3Cluster および icebergAzureCluster テーブル関数におけるシークレットのマスキングを修正。 [#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* JSON の数値を Decimal 型に変換する際に `JSONExtract` で発生していた精度損失を修正しました。これにより、数値の JSON 値は浮動小数点による丸め誤差を伴うことなく、元の 10 進数表現を正確に保持するようになりました。 [#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b)).
* `DROP COLUMN` の後に、同じ `ALTER` ステートメント内で `COMMENT COLUMN IF EXISTS` を使用した際に発生していた `LOGICAL_ERROR` を修正しました。`IF EXISTS` 句は、同一ステートメント内でカラムが削除されている場合に、そのカラムへのコメント操作を正しくスキップするようになりました。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* Delta Lake 用のキャッシュからの読み取り回数を修正しました。 [#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 巨大な文字列に対する coalescing merge tree のセグメンテーションフォールトを修正しました。これにより [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582) がクローズされます。 [#85709](https://github.com/ClickHouse/ClickHouse/pull/85709)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Iceberg への書き込み時にメタデータのタイムスタンプを更新。[#85711](https://github.com/ClickHouse/ClickHouse/pull/85711)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `distributed_depth` を *Cluster 関数の指標として使用するのは誤りであり、データの重複につながる可能性があります。代わりに `client_info.collaborate_with_initiator` を使用してください。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark は position delete ファイルを読み込むことができません。 [#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 非同期ロギングのリファクタリング（[#85105](https://github.com/ClickHouse/ClickHouse/issues/85105)）後に send&#95;logs&#95;source&#95;regexp を修正。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* MEMORY&#95;LIMIT&#95;EXCEEDED エラー発生時に、update&#95;field を使用する辞書で生じ得る不整合を修正しました。 [#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat)).
* `Distributed` 宛先テーブルへの並列分散 `INSERT SELECT` において、`WITH` 句からのグローバル定数をサポートしました。以前は、クエリが `Unknown expression identifier` エラーをスローすることがありました。 [#85811](https://github.com/ClickHouse/ClickHouse/pull/85811) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` および `icebergAzureCluster` の認証情報をマスクします。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* `DatabaseReplicated` での `CREATE ... AS (SELECT * FROM s3Cluster(...))` の実行試行時に発生する論理エラーを修正。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `url()` テーブル関数によって送信される HTTP リクエストについて、非標準ポートへアクセスする際に `Host` ヘッダーにポート番号が正しく含まれるよう修正しました。これにより、開発環境で一般的な、カスタムポート上で動作する MinIO のような S3 互換サービスで presigned URL を使用する場合に発生していた認証失敗が解消されます（[#85898](https://github.com/ClickHouse/ClickHouse/issues/85898) の修正）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* non-delta テーブルの場合、unity catalog は異常なデータ型を含むスキーマを無視するようになりました。 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699) を修正。 [#85950](https://github.com/ClickHouse/ClickHouse/pull/85950)（[alesapin](https://github.com/alesapin)）。
* Iceberg のフィールドの NULL 許容性を修正。 [#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `Replicated` データベースのリカバリにおけるバグを修正しました。テーブル名に `%` 記号が含まれている場合、リカバリ中に別の名前でテーブルが再作成されてしまう可能性がありました。 [#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 空の `Memory` テーブルを復元する際に `BACKUP_ENTRY_NOT_FOUND` エラーが発生してバックアップのリストアが失敗する問題を修正しました。 [#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva)).
* Distributed テーブルの ALTER 時に sharding&#95;key のチェックを追加しました。以前は誤った ALTER によってテーブル定義が壊れ、サーバーの再起動が必要になることがありました。 [#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique)).
* 空の iceberg delete ファイルを作成しないようにしました。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 大きな設定値によって S3Queue テーブルが壊れ、レプリカの再起動ができなくなる問題を修正。 [#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique)).

#### ビルド/テスト/パッケージングの改善

- S3を使用したテストでデフォルトで暗号化ディスクを使用するようにしました。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- 統合テストで`clickhouse`バイナリを使用し、ストリップされていないデバッグシンボルを取得するようにしました。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 内部のlibxml2を2.14.4から2.14.5にバージョンアップしました。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze))。
- 内部のcurlを8.14.0から8.15.0にバージョンアップしました。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze))。
- CI内のキャッシュで使用するメモリを削減し、エビクションのテストを改善しました。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin))。

### ClickHouseリリース25.7、2025-07-24 {#257}

#### 後方互換性のない変更

- `extractKeyValuePairs`関数の変更: 引用符で囲まれていないキーまたは値を読み取る際に`quoting_character`が予期せず見つかった場合の動作を制御する新しい引数`unexpected_quoting_character_strategy`を導入しました。値は`invalid`、`accept`、または`promote`のいずれかです。`invalid`はキーを破棄し、キー待機状態に戻ります。`accept`はそれをキーの一部として扱います。`promote`は前の文字を破棄し、引用符で囲まれたキーとして解析を開始します。さらに、引用符で囲まれた値を解析した後、ペア区切り文字が見つかった場合にのみ次のキーを解析します。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos))。
- `countMatches`関数でゼロバイトマッチをサポートしました。以前の動作を維持したいユーザーは、設定`count_matches_stop_at_empty_match`を有効にできます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- BACKUPの生成時に、専用のサーバー設定(`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server`、`max_merges_bandwidth_for_server`)に加えて、ローカル(`max_local_read_bandwidth_for_server`および`max_local_write_bandwidth_for_server`)およびリモート(`max_remote_read_network_bandwidth_for_server`および`max_remote_write_network_bandwidth_for_server`)のサーバー全体のスロットラーを使用するようにしました。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa))。
- 挿入可能な列のないテーブルの作成を禁止しました。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
- アーカイブ内のファイルごとにクラスター関数を並列化しました。以前のバージョンでは、アーカイブ全体(zip、tar、7zなど)が作業単位でした。新しい設定`cluster_function_process_archive_on_multiple_nodes`を追加し、デフォルトで`true`に設定されています。`true`に設定すると、クラスター関数でのアーカイブ処理のパフォーマンスが向上します。以前のバージョンでアーカイブを使用したクラスター関数を使用している場合、互換性を保ち、25.7+へのアップグレード中のエラーを回避するために`false`に設定する必要があります。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `SYSTEM RESTART REPLICAS`クエリは、そのデータベースへのアクセス権がない場合でもLazyデータベース内のテーブルを起動させ、これらのテーブルが同時に削除されている間に発生していました。注意: 現在、`SYSTEM RESTART REPLICAS`は`SHOW TABLES`の権限があるデータベース内のレプリカのみを再起動します。これは自然な動作です。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov))。


#### 新機能

* `MergeTree` ファミリーのテーブルに対して、軽量更新のサポートを追加しました。軽量更新は、新しい構文 `UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>` で使用できます。軽量更新を利用した軽量削除の実装を追加しました。`lightweight_delete_mode = 'lightweight_update'` を設定することで有効化できます。[#82004](https://github.com/ClickHouse/ClickHouse/pull/82004)（[Anton Popov](https://github.com/CurtizJ)）。
* Iceberg スキーマの進化で複合型をサポート。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg テーブルへの INSERT をサポートしました。 [#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* フィールド ID を用いて Iceberg データファイルを読み取れるようにしました。これにより Iceberg との互換性が向上します。メタデータ内でフィールド名を変更しても、基盤となる Parquet ファイル内では別の名前にマッピングできます。この変更により [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065) がクローズされました。 [#83653](https://github.com/ClickHouse/ClickHouse/pull/83653) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* ClickHouse は Iceberg 向けの圧縮された `metadata.json` ファイルをサポートするようになりました。[#70874](https://github.com/ClickHouse/ClickHouse/issues/70874) を修正しています。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* Glue カタログで `TimestampTZ` をサポートしました。これにより [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654) がクローズされました。 [#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse クライアントに AI を活用した SQL 生成機能を追加しました。ユーザーはクエリの前に `??` を付けることで、自然言語での説明から SQL クエリを生成できるようになりました。OpenAI および Anthropic をプロバイダーとしてサポートし、自動スキーマ検出にも対応しています。 [#83314](https://github.com/ClickHouse/ClickHouse/pull/83314) ([Kaushik Iska](https://github.com/iskakaushik))。
* Geo 型を WKB 形式で書き出す関数を追加しました。 [#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ソースに対して新たに 2 種類のアクセス種別 `READ` と `WRITE` を導入し、ソースに関連するそれまでのすべてのアクセス種別は非推奨となりました。以前は `GRANT S3 ON *.* TO user` でしたが、現在は `GRANT READ, WRITE ON S3 TO user` となります。これにより、ソースに対する `READ` と `WRITE` の権限を分離して付与することも可能になります（例: `GRANT READ ON * TO user`, `GRANT WRITE ON S3 TO user`）。この機能は設定 `access_control_improvements.enable_read_write_grants` によって制御され、デフォルトでは無効です。[#73659](https://github.com/ClickHouse/ClickHouse/pull/73659)（[pufit](https://github.com/pufit)）。
* NumericIndexedVector: ビットスライス方式の Roaring-bitmap 圧縮を基盤とする新しいベクターデータ構造であり、構築・分析・要素ごとの算術演算のための 20 種類以上の関数を備えています。スパースデータに対するストレージ使用量を削減し、結合・フィルタ・集約を高速化できます。[#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) および T. Xiong と Y. Wang による VLDB 2024 掲載論文 [“Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411) を実装しています。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193) ([FriendLey](https://github.com/FriendLey))。
* ワークロード設定 `max_waiting_queries` がサポートされるようになりました。これを使用してクエリキューのサイズを制限できます。上限に達した場合、それ以降のすべてのクエリは `SERVER_OVERLOADED` エラーで終了します。 [#81250](https://github.com/ClickHouse/ClickHouse/pull/81250) ([Oleg Doronin](https://github.com/dorooleg))。
* 財務関数を追加しました: `financialInternalRateOfReturnExtended` (`XIRR`)、`financialInternalRateOfReturn` (`IRR`)、`financialNetPresentValueExtended` (`XNPV`)、`financialNetPresentValue` (`NPV`)。[#81599](https://github.com/ClickHouse/ClickHouse/pull/81599)（[Joanna Hulboj](https://github.com/jh0x)）。
* 2 つのポリゴンが交差しているかを判定する地理空間関数 `polygonsIntersectCartesian` と `polygonsIntersectSpherical` を追加。 [#81882](https://github.com/ClickHouse/ClickHouse/pull/81882) ([Paul Lamb](https://github.com/plamb)).
* MergeTree ファミリーのテーブルで `_part_granule_offset` 仮想カラムをサポートしました。このカラムは、各行が属するデータパート内でのグラニュール／マークの 0 始まりのインデックスを示します。これは [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572) に対処するものです。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341) ([Amos Bird](https://github.com/amosbird))。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341) ([Amos Bird](https://github.com/amosbird))
* sRGB と OkLCH の色空間間で色を変換する SQL 関数 `colorSRGBToOkLCH` および `colorOkLCHToSRGB` を追加しました。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue)).
* `CREATE USER` クエリでユーザー名にパラメータを使用できるようになりました。 [#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein))。
* `system.formats` テーブルに、HTTP コンテンツタイプやスキーマ推論の可否など、フォーマットに関する拡張情報が含まれるようになりました。 [#81505](https://github.com/ClickHouse/ClickHouse/pull/81505) ([Alexey Milovidov](https://github.com/alexey-milovidov))。



#### 実験的機能
* テキストインデックスを検索するための汎用ツールである関数 `searchAny` と `searchAll` を追加しました。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスが新しい `split` トークナイザーをサポートするようになりました。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `text` インデックスのデフォルトのインデックス粒度を 64 に変更しました。これにより、内部ベンチマークにおける平均的なテストクエリの期待されるパフォーマンスが向上します。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 ビットのビットマップは状態の発出ラベルを順序付きで保持しますが、発出状態はハッシュテーブル内に現れる順序でディスクに保存されます。そのため、ディスクから読み取る際に、あるラベルが誤った次の状態を指してしまう可能性があります。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスにおける FST ツリーブロブに対して zstd 圧縮を有効にしました。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* ベクター類似性インデックスをベータ版に昇格しました。ベクター類似性インデックスを利用するには、有効化が必要なエイリアス設定 `enable_vector_similarity_index` を導入しました。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 実験的なゼロコピー・レプリケーションに関連する実験的な `send_metadata` ロジックを削除しました。これは一度も使用されておらず、このコードをサポートする人もいませんでした。これに関連するテストすら存在しなかったため、かなり以前から壊れていた可能性が高いです。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* `StorageKafka2` を `system.kafka_consumers` に統合しました。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `(a < 1 and a > 0) or b = 3` のような複雑な CNF/DNF を統計情報に基づいて推定するようにしました。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 非同期ロギングを導入しました。ログが低速なデバイスに出力される場合でも、クエリが遅延しなくなりました。 [#82516](https://github.com/ClickHouse/ClickHouse/pull/82516) ([Raúl Marín](https://github.com/Algunenano))。キュー内に保持されるエントリ数の上限を制限しました。 [#83214](https://github.com/ClickHouse/ClickHouse/pull/83214) ([Raúl Marín](https://github.com/Algunenano))。
* `parallel_distributed_insert_select` 設定にあるように、各シャード上で `INSERT SELECT` が独立して実行されるモードでは、並列分散 `INSERT SELECT` がデフォルトで有効になっています。 [#83040](https://github.com/ClickHouse/ClickHouse/pull/83040)（[Igor Nikonov](https://github.com/devcrafter)）。
* 集約クエリが `Nullable` ではない列に対する単一の `count()` 関数だけを含む場合、ハッシュテーブル走査中に集約ロジックが完全にインライン化されます。これにより、集約状態の割り当てや維持が不要となり、メモリ使用量と CPU オーバーヘッドが大幅に削減されます。これは [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) に部分的に対応します。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* 典型的なキー列が 1 つだけのケースにおいて、ハッシュマップに対する余分なループを削除することで `HashJoin` のパフォーマンスを最適化し、さらに `null_map` と `join_mask` が常に `true` / `false` となる場合には、それらのチェックも省略しました。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat))。
* `-If` コンビネータに対する軽微な最適化。 [#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li)).
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取りの削減と CPU 使用率の低減により、これまでより低いレイテンシで完了するようになりました。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `filterPartsByQueryConditionCache` において `merge_tree_min_{rows,bytes}_for_seek` を考慮し、インデックスでフィルタリングを行う他のメソッドと整合するようにしました。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* `TOTALS` ステップ以降のパイプラインをマルチスレッド化しました。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus)).
* `Redis` および `KeeperMap` ストレージのキーによるフィルタ処理を修正。[#81833](https://github.com/ClickHouse/ClickHouse/pull/81833)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 新しい設定 `min_joined_block_size_rows`（`min_joined_block_size_bytes` に類似、デフォルト値は 65409）を追加し、JOIN の入力および出力ブロックに対する最小ブロックサイズ（行数）を制御できるようにしました（JOIN アルゴリズムが対応している場合）。小さいブロックはまとめて 1 つにまとめられます。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` を実行しても、すべてのキャッシュがクリアされなくなりました。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 同値類を使用して冗長な JOIN 操作を削除することで、相関サブクエリに対して生成されるプランを最適化します。すべての相関列に対して同値な式が存在する場合、`query_plan_correlated_subqueries_use_substitution` 設定が有効になっていれば `CROSS JOIN` は生成されません。 [#82435](https://github.com/ClickHouse/ClickHouse/pull/82435) ([Dmitry Novik](https://github.com/novikd))。
* 関数 `EXISTS` の引数として現れる相関サブクエリに対して、必要な列だけを読み取るようにしました。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd))。
* クエリ解析中のクエリツリーの比較処理を少し高速化しました。 [#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* false sharing を減らすため、ProfileEvents の Counter にアライメントを追加しました。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn))。
* [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) で行われた `null_map` および `JoinMask` に対する最適化が、複数の論理和条件を持つ JOIN のケースにも適用されました。また、`KnownRowsHolder` データ構造も最適化されました。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041) ([Nikita Taranov](https://github.com/nickitat))。
* フラグへのアクセスごとにハッシュを計算することを避けるため、結合フラグには単純な `std::vector<std::atomic_bool>` を使用します。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* `HashJoin` が `lazy` 出力モードを使用している場合、結果カラム用のメモリを事前に割り当てないでください。これは特にマッチ数が少ない場合に非効率的です。さらに、結合が完了した後でマッチ数を正確に把握できるため、より正確に事前割り当てを行うことができます。 [#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat)).
* パイプライン構築時のポートヘッダーにおけるメモリコピーを最小限に抑えました。元の[PR](https://github.com/ClickHouse/ClickHouse/pull/70105)は[heymind](https://github.com/heymind)によるものです。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* rocksdb ストレージ使用時の clickhouse-keeper の起動処理を改善。[#83390](https://github.com/ClickHouse/ClickHouse/pull/83390)（[Antonio Andelic](https://github.com/antonio2368)）。
* 高い同時実行負荷のもとでロック競合を減らすため、ストレージスナップショットデータの作成中はロックを保持しないようにしました。 [#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94)).
* `ProtobufSingle` 入力フォーマットで、パースエラーが発生しない場合にシリアライザーを再利用することでパフォーマンスを向上しました。 [#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa)).
* 短いクエリを高速化するためのパイプライン構築処理のパフォーマンスを改善しました。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 短いクエリを高速化するため、`MergeTreeReadersChain::getSampleBlock` を最適化しました。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano)).
* 非同期リクエストによりデータカタログでのテーブル一覧表示を高速化。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* `s3_slow_all_threads_after_network_error` 設定が有効な場合に、S3 のリトライ機構にジッターを導入しました。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改善

* 読みやすさを高めるために、括弧を複数の色で表示するようにしました。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* LIKE/REGEXP パターン内のメタ文字が、入力中にハイライト表示されるようになりました。これはすでに `clickhouse-format` と `clickhouse-client` のエコー出力では対応済みでしたが、今回新たにコマンドプロンプト上でも行われるようになりました。 [#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `clickhouse-format` およびクライアントの echo のハイライトは、コマンドラインプロンプトのハイライトと同様に動作します。 [#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `plain_rewritable` ディスクをデータベースメタデータ用のディスクとして使用できるようになりました。これをデータベースディスクとしてサポートするために、`plain_rewritable` にメソッド `moveFile` と `replaceFile` を実装しました。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `PostgreSQL`、`MySQL`、`DataLake` データベースのバックアップをサポートしました。この種のデータベースのバックアップでは、定義のみが保存され、内部のデータは保存されません。 [#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique)).
* `allow_experimental_join_condition` 設定は、現在は常に許可されているため、非推奨としてマークされました。 [#80566](https://github.com/ClickHouse/ClickHouse/pull/80566) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ClickHouse の async metrics に pressure metrics を追加しました。 [#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1))。
* マークキャッシュからの削除を追跡するためのメトリクス `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles` を追加しました（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。 [#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* [仕様](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)で規定されているとおり、Parquet enum をバイト配列として書き込めるようにしました。[#81090](https://github.com/ClickHouse/ClickHouse/pull/81090)（[Arthur Passos](https://github.com/arthurpassos)）。
* `DeltaLake` テーブルエンジンの改善: delta-kernel-rs には `ExpressionVisitor` API があり、この PR で実装されてパーティション列の式変換に適用されています（従来コードで使用していた、delta-kernel-rs 側の古く非推奨となっている手法を置き換えるものです）。将来的には、この `ExpressionVisitor` によって、統計情報に基づくプルーニングや、いくつかの Delta Lake 独自機能も実装できるようになります。さらに、この変更の目的は、`DeltaLakeCluster` テーブルエンジンでのパーティションプルーニングをサポートすることです（パースされた式の結果である ActionsDAG をシリアライズし、データパスとともにイニシエータから送信します。というのも、この種のプルーニングに必要な情報は、イニシエータのみが実行するデータファイル一覧取得時のメタ情報としてのみ利用可能ですが、各読み取りサーバ上のデータに対して適用する必要があるためです）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 名前付きタプルのスーパータイプを導出する際に、要素名を保持するようにしました。 [#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc)).
* StorageKafka2 において、以前のコミット済みオフセットに依存しないよう、消費済みメッセージを手動でカウントするようにしました。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ClickHouse Keeper データの管理および分析用の新しいコマンドラインツール `clickhouse-keeper-utils` を追加しました。このツールは、スナップショットおよびチェンジログからの状態のダンプ、チェンジログファイルの分析、特定のログ範囲の抽出をサポートします。 [#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368)).
* 合計およびユーザーごとのネットワークスロットラーはリセットされないため、`max_network_bandwidth_for_all_users` と `max_network_bandwidth_for_all_users` の制限が超過されることはありません。 [#81729](https://github.com/ClickHouse/ClickHouse/pull/81729) ([Sergei Trifonov](https://github.com/serxa))。
* 出力フォーマットとして GeoParquet への書き込みをサポートしました。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 未完了のデータマテリアライズ処理の影響を現在受けているカラムをリネームしてしまう場合には、`RENAME COLUMN` の `ALTER` マテリアライズ処理を開始できないようにしました。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* ヘッダー `Connection` は、接続を維持すべきかどうかが判明した段階で、ヘッダー送信の最後に送られるようになりました。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema)).
* `listen_backlog`（デフォルト 4096）に基づいて、TCP サーバーのキューサイズ（デフォルト 64）を調整しました。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat))。
* サーバーを再起動することなく、その場で `max_local_read_bandwidth_for_server` と `max_local_write_bandwidth_for_server` をリロードできる機能を追加しました。 [#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu)).
* `TRUNCATE TABLE system.warnings` を使用して `system.warnings` テーブルからすべての警告を消去できるようにしました。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイククラスタ関数でのパーティションプルーニングを修正。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLakeCluster テーブル関数でパーティション分割されたデータの読み取りを修正しました。この PR ではクラスタ関数のプロトコルバージョンが引き上げられ、イニシエータからレプリカへ追加情報を送信できるようになりました。この追加情報には、パーティション列を解析するために必要な delta-kernel の変換式が含まれており、今後は生成列などの他の情報も含められる予定です。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 関数 `reinterpret` は、`T` が固定長データ型である場合に `Array(T)` への変換もサポートするようになりました（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。 [#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* database Datalake が、よりわかりやすい例外をスローするようになりました。 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211) を修正。 [#82304](https://github.com/ClickHouse/ClickHouse/pull/82304) ([alesapin](https://github.com/alesapin)).
* `HashJoin::needUsedFlagsForPerRightTableRow` から false を返すことで CROSS JOIN を改善。 [#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc)).
* map カラムを Tuple の配列として読み書きできるようにしました。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.licenses` に [Rust](https://clickhouse.com/blog/rust) クレートのライセンスを一覧します。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano)).
* `{uuid}` のようなマクロを、S3Queue テーブルエンジンの `keeper_path` 設定で使用できるようになりました。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Keeper の改善: バックグラウンドスレッドでディスク間の changelog ファイルを移動するようにしました。以前は、changelog を別のディスクに移動する際、その処理が完了するまで Keeper 全体がブロックされていました。このため、移動処理に長時間を要する場合（例: S3 ディスクへの移動）にパフォーマンスが低下していました。 [#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper の改善: 新しい設定 `keeper_server.cleanup_old_and_ignore_new_acl` を追加しました。有効にすると、すべてのノードの ACL がクリアされ、新しいリクエストに対する ACL は無視されます。ノードから ACL を完全に削除することが目的の場合は、新しいスナップショットが作成されるまでこの設定を有効にしておくことが重要です。 [#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368))。
* S3Queue テーブルエンジンを使用するテーブルでのストリーミングを無効にする新しいサーバー設定 `s3queue_disable_streaming` を追加しました。この設定はサーバーを再起動せずに変更できます。 [#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュの動的リサイズ機能をリファクタリングしました。解析・調査のためのログをさらに追加しました。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定ファイルなしの `clickhouse-server` も、デフォルトの設定と同様に PostgreSQL のポート 9005 を待ち受けるようになりました。 [#82633](https://github.com/ClickHouse/ClickHouse/pull/82633)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `ReplicatedMergeTree::executeMetadataAlter` では、`StorageID` を取得し、`DDLGuard` を取得せずに `IDatabase::alterTable` を呼び出そうとします。この間に、技術的には対象のテーブルを別のテーブルと入れ替えることが可能であり、その場合、定義を取得すると誤ったものを取得してしまいます。これを回避するために、`IDatabase::alterTable` を呼び出そうとする際に UUID が一致することを確認するための個別のチェックを追加しました。 [#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 読み取り専用のリモートディスク付きデータベースをアタッチする際には、テーブルの UUID を DatabaseCatalog に手動で追加します。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach))。
* ユーザーが `NumericIndexedVector` で `nan` および `inf` を使用できないようにしました。[#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) を修正し、さらにいくつか改善を行いました。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `X-ClickHouse-Progress` および `X-ClickHouse-Summary` ヘッダー形式ではゼロ値を省略しないようにしました。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper の改善: world:anyone ACL に対して特定の権限をサポート。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368))。
* SummingMergeTree において、合計の対象として明示的に指定されているカラムを含む `RENAME COLUMN` および `DROP COLUMN` を許可しないようにしました。[#81836](https://github.com/ClickHouse/ClickHouse/issues/81836) をクローズ。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Decimal` から `Float32` への変換精度を改善し、`Decimal` から `BFloat16` への変換を実装。[#82660](https://github.com/ClickHouse/ClickHouse/issues/82660) をクローズ。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI のスクロールバーの見た目が少し改善されました。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 埋め込み設定を使用する `clickhouse-server` で、HTTP OPTIONS レスポンスを返すことで Web UI を利用できるようになりました。[#82870](https://github.com/ClickHouse/ClickHouse/pull/82870)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 設定内のパスに対して追加の Keeper ACL を指定できるようになりました。特定のパスに追加の ACL を付与したい場合は、設定ファイルの `zookeeper.path_acls` の下で定義します。 [#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368)).
* これからは、`mutations snapshot` は `visible parts snapshot` から構築されるようになります。また、スナップショットで使用される `mutation counters` は、含まれる `mutations` に基づいて再計算されます。 [#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper がソフトメモリ制限により書き込みを拒否した際に発生する ProfileEvent を追加しました。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* `system.s3queue_log` に列 `commit_time`、`commit_id` を追加。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 場合によっては、メトリクスに複数のディメンションが必要になることがあります。例えば、1 つのカウンタだけを持つのではなく、失敗したマージやミューテーションをエラーコード別にカウントしたい場合です。このために、まさにその用途のための `system.dimensional_metrics` を導入し、最初のディメンション付きメトリクスとして `failed_merges` を追加しました。[#83030](https://github.com/ClickHouse/ClickHouse/pull/83030)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* clickhouse クライアントにおける不明な設定の警告を集約し、要約としてログに記録するようにしました。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc)).
* 接続エラーが発生した際、ClickHouse クライアントがローカルポートを報告するようになりました。 [#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` のエラー処理がわずかに改善されました。`/sys/block` ディレクトリが存在するもののアクセスできない場合、サーバーはブロックデバイスを監視せずに起動します。 [#79229](https://github.com/ClickHouse/ClickHouse/issues/79229) をクローズします。 [#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SystemLogs を、通常テーブルの後（およびシステムテーブルの前。従来は通常テーブルの前）にシャットダウンするよう変更。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` のシャットダウン処理に対してログ出力を追加。 [#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `Time` および `Time64` を `MM:SS`、`M:SS`、`SS`、`S` 形式としてパースできるようにしました。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `distributed_ddl_output_mode='*_only_active'` の場合、レプリケーション遅延が `max_replication_lag_to_enqueue` を超えている新規または復旧済みレプリカを待機しないようにします。これにより、新しいレプリカが初期化またはリカバリ完了後にアクティブになったものの、初期化中に巨大なレプリケーションログを蓄積していた場合に発生しうる `DDL task is not finished on some hosts` エラーを回避するのに役立ちます。あわせて、レプリケーションログが `max_replication_lag_to_enqueue` 未満になるまで待機する `SYSTEM SYNC DATABASE REPLICA STRICT` クエリも実装しました。 [#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 例外メッセージ内で式アクションの説明を過度に長く出力しないようにしました。 [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164) をクローズ。 [#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パーツのプレフィックスとサフィックスを解析する機能を追加し、さらに非定数カラムのカバレッジも検証できるようにしました。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 名前付きコレクション使用時の ODBC と JDBC のパラメータ名を統一しました。 [#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* ストレージのシャットダウン中は、`getStatus` が `ErrorCodes::ABORTED` 例外をスローします。以前は、これにより select クエリが失敗していましたが、現在は `ErrorCodes::ABORTED` 例外を捕捉して意図的に無視するようにしています。 [#83435](https://github.com/ClickHouse/ClickHouse/pull/83435) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `MergeParts` エントリの part&#95;log プロファイルイベントに、`UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds` などのプロセスリソースメトリクスを追加。 [#83460](https://github.com/ClickHouse/ClickHouse/pull/83460) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Keeper で新しい種類のリクエストを可能にする `create_if_not_exists`、`check_not_exists`、`remove_recursive` フィーチャーフラグを、デフォルトで有効化しました。 [#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368)).
* サーバーのシャットダウン時には、テーブルを停止する前に S3（Azure/その他）キューのストリーミングを先に停止するようにしました。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `JSON` 入力フォーマットで `Date` / `Date32` を整数として扱えるようにしました。 [#83597](https://github.com/ClickHouse/ClickHouse/pull/83597) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 特定の状況でプロジェクションを読み込んだり追加したりする際の例外メッセージを、より読みやすくしました。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-server` のバイナリのチェックサム整合性検証をスキップするための設定オプションを導入しました。[#83637](https://github.com/ClickHouse/ClickHouse/issues/83637) を解決します。[#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `clickhouse-benchmark` の `--reconnect` オプションに設定されていた誤ったデフォルト値を修正しました。この値は [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) で誤って変更されていました。 [#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CREATE DICTIONARY` の不統一な書式を修正。[#82105](https://github.com/ClickHouse/ClickHouse/issues/82105) をクローズ。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `materialize` 関数を含む TTL のフォーマットの不整合を修正。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。 [#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `INTO OUTFILE` などの出力オプションを含むサブクエリ内での `EXPLAIN AST` の書式が一貫しない問題を修正しました。[#82826](https://github.com/ClickHouse/ClickHouse/issues/82826) をクローズ。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* エイリアスが許可されていないコンテキストにおける、エイリアス付き括弧表現のフォーマットの不整合を修正しました。[#82836](https://github.com/ClickHouse/ClickHouse/issues/82836) をクローズ。[#82837](https://github.com/ClickHouse/ClickHouse/issues/82837) をクローズ。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* IPv4 と集約関数状態を乗算する際に、適切なエラーコードを使用するようにしました。 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817) をクローズ。 [#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ファイルシステムキャッシュの論理エラー「ゼロバイトだがレンジが終了していない」を修正。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TTL によって行が削減された際に、それに依存する `minmax_count_projection` などのアルゴリズムの正しさを保証するため、min-max インデックスを再計算します。これにより [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091) が解決されます。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* `ORDER BY ... LIMIT BY ... LIMIT N` の組み合わせを含むクエリで、ORDER BY が PartialSorting として実行される場合、カウンタ `rows_before_limit_at_least` は、ソート変換で消費された行数ではなく、LIMIT 句で消費された行数を反映するようになりました。 [#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa)).
* 交互（alternation）と非リテラルな先頭オルタナティブを含む正規表現を用いた `token` / `ngram` インデックスでのフィルタリングにおいて、granule のスキップが過剰になる問題を修正しました。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa))。
* `<=>` 演算子と Join ストレージに関する論理エラーを修正し、クエリが正しいエラーコードを返すようにしました。 [#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `remote` 関数ファミリーと併用された際に `loop` 関数で発生するクラッシュを修正しました。`loop(remote(...))` で LIMIT 句が正しく適用されるようにしました。[#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* Unixエポック（1970-01-01）より前の日付および最大日付（2106-02-07 06:28:15）より後の日付を扱う際の `to_utc_timestamp` および `from_utc_timestamp` 関数の誤った動作を修正しました。これらの関数は、値をそれぞれエポック開始時刻および最大日付に正しく切り詰めるようになりました。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046))。
* 一部の並列レプリカで実行されるクエリにおいて、順序付き読み取り最適化がイニシエーター側では適用できる一方で、リモートノードでは適用できない場合があります。その結果、並列レプリカコーディネーター（イニシエーター上）とリモートノードで異なる読み取りモードが使用され、論理エラーが発生していました。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter)).
* カラム型が Nullable に変更された際に、プロジェクションのマテリアライズ処理中に発生する論理エラーを修正しました。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL を更新する際に、TTL GROUP BY で発生していた誤った TTL の再計算を修正しました。 [#81222](https://github.com/ClickHouse/ClickHouse/pull/81222) ([Evgeniy Ulasik](https://github.com/H0uston)).
* Parquet のブルームフィルターが、`WHERE function(key) IN (...)` のような条件を `WHERE key IN (...)` であるかのように誤って適用していた問題を修正しました。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性のあった問題を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* 必要に応じて（たとえば名前に `-` のような特殊文字が含まれる場合）、データベース名およびテーブル名にバッククォートを追加するように `InterpreterInsertQuery::extendQueryLogElemImpl` を修正しました。 [#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu))。
* 左辺引数に null を含み、サブクエリ結果が非 Nullable の場合における、`transform_null_in=1` 使用時の `IN` の実行を修正しました。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 既存のテーブルから読み取る際、`default`/`materialize` 式の実行時に実験的/疑わしい型を検証しないようにしました。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL 式で dict が使用されている場合に、マージ処理中に発生する「Context has expired」エラーを修正。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* cast 関数の単調性を修正。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi)).
* スカラー相関サブクエリの処理中に必要なカラムが読み込まれない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して不要なコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) が解決されています。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* これまで、`MongoDB` テーブルエンジンの定義では、`host:port` 引数にパスコンポーネントを含めることができましたが、これは黙って無視されていました。`mongodb` 統合は、そのようなテーブルの読み込みを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルの読み込みを許可し、パスコンポーネントを無視して引数からデータベース名を使用するようにしました*。*注意:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を使ったクエリ、辞書ソースおよび named collection には適用されません。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* クエリで定数のエイリアス列だけが使用されている場合のフィルタ解析を修正しました。[#79448](https://github.com/ClickHouse/ClickHouse/issues/79448) を修正します。 [#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* GROUP BY と SET の両方の TTL で同じカラムを使用した際に発生する LOGICAL&#95;ERROR と、それに続くクラッシュを修正しました。 [#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos)).
* シークレットマスキングにおける S3 テーブル関数の引数検証を修正し、発生しうる `LOGICAL_ERROR` を防止。[#80620](https://github.com/ClickHouse/ClickHouse/issues/80620) をクローズ。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* Iceberg のデータレースを修正。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* `DatabaseReplicated::getClusterImpl` を修正しました。`hosts` の先頭要素（またはいくつかの先頭要素）の `id` が `DROPPED_MARK` であり、同じシャードに対して他の要素が存在しない場合、`shards` の先頭要素が空のベクターとなり、`std::out_of_range` が発生していました。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* arraySimilarity のコピーペーストミスを修正し、UInt32 および Int32 の重みの使用を禁止。テストとドキュメントを更新。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* `WHERE` 句および `IndexSet` を含む条件下で `arrayJoin` を使用するクエリで発生する `Not found column` エラーを修正しました。 [#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Glue Catalog 連携のバグを修正しました。これにより、一部のサブカラムに decimal 型を含むネストしたデータ型のテーブルを ClickHouse で読み取れるようになりました（例: `map<string, decimal(9, 2)>`）。[#81301](https://github.com/ClickHouse/ClickHouse/issues/81301) を修正します。 [#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) において 25.5 で導入された SummingMergeTree のパフォーマンス低下を修正。[#82130](https://github.com/ClickHouse/ClickHouse/pull/82130) ([Pavel Kruglov](https://github.com/Avogar))。
* URI 経由で設定を渡す場合、最後に指定された値が採用されます。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* Iceberg 向けの「Context has expired」エラーを修正。 [#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* サーバーがメモリ逼迫状態のときに発生しうるリモートクエリのデッドロックを修正。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar)).
* `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 関数を大きな数値に適用した際に発生していたオーバーフローを修正しました。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165) ([Raufs Dunamalijevs](https://github.com/rienath))。
* テーブル依存関係のバグを修正し、マテリアライズドビューが INSERT クエリを取りこぼしてしまう問題を解消しました。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* サジェストスレッドとメインクライアントスレッド間で発生しうるデータ競合を修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* ClickHouse は、スキーマ変更後の Glue カタログから iceberg テーブルを読み取れるようになりました。 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272) を修正しました。 [#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 非同期メトリクス設定 `asynchronous_metrics_update_period_s` と `asynchronous_heavy_metrics_update_period_s` の検証処理を修正しました。 [#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc))。
* 複数の JOIN を含むクエリでマッチャーを解決する際の論理エラーを修正し、[#81969](https://github.com/ClickHouse/ClickHouse/issues/81969) をクローズ。 [#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* AWS ECS トークンに有効期限を追加し、再読み込みできるようにしました。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `CASE` 関数の `NULL` 引数に関するバグを修正しました。 [#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* クライアント内のデータレース（グローバルコンテキストを使用しないようにすることで）と `session_timezone` のオーバーライドを修正しました（以前は、たとえば `users.xml` やクライアントオプションで `session_timezone` が空でない値に設定され、クエリコンテキスト側では空に設定されていた場合、本来は誤りであるにもかかわらず `users.xml` の値が使用されていました。現在は常にクエリコンテキストがグローバルコンテキストより優先されます）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 外部テーブルエンジンにおけるキャッシュ済みバッファの境界アラインメント無効化の問題を修正。この機能は[https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868)で壊れていました。[#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 型変換されたキーを使ってキー・バリュー型ストレージを `JOIN` した際に発生するクラッシュを修正。 [#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* logs/query&#95;log で名前付きコレクションの値が隠されてしまう問題を修正。 [#82405](https://github.com/ClickHouse/ClickHouse/issues/82405) をクローズ。 [#82510](https://github.com/ClickHouse/ClickHouse/pull/82510) ([Kseniia Sumarokova](https://github.com/kssenii))。
* セッション終了時に `user_id` が空になる場合があり、その結果ロギングがクラッシュする可能性があった問題を修正しました。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc)).
* Time のパースで msan の問題が発生する可能性があったケースを修正しました。次を修正します: [#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* サーバーの処理がハングしないよう、`threadpool_writer_pool_size` をゼロに設定できないようにしました。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc)).
* 相関列を含む行ポリシー式の解析中に発生する `LOGICAL_ERROR` を修正。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd)).
* `enable_shared_storage_snapshot_in_query = 1` のときに `mergeTreeProjection` テーブル関数で親メタデータを誤って使用していた問題を修正しました。これは [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634) への対応です。 [#82638](https://github.com/ClickHouse/ClickHouse/pull/82638) ([Amos Bird](https://github.com/amosbird))。
* 関数 `trim{Left,Right,Both}` が、型 &quot;FixedString(N)&quot; の入力文字列もサポートするようになりました。たとえば、`SELECT trimBoth(toFixedString('abc', 3), 'ac')` が利用できるようになりました。 [#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* AzureBlobStorage において、ネイティブコピー時に認証方式を比較する際、例外が発生した場合には読み取りとコピー（つまり非ネイティブコピー）にフォールバックするようコードを更新しました。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 要素が空の場合における `groupArraySample` / `groupArrayLast` のデシリアライズ処理を修正（入力が空のときにバイナリの一部を読み飛ばしてしまう可能性があり、これによりデータ読み取り時の破損や、TCP プロトコルでの UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER を引き起こす可能性がありました）。数値型および日時型には影響しません。 [#82763](https://github.com/ClickHouse/ClickHouse/pull/82763) ([Pedro Ferreira](https://github.com/PedroTadim))。
* 空の `Memory` テーブルのバックアップ処理を修正し、バックアップのリストアが `BACKUP_ENTRY_NOT_FOUND` エラーで失敗してしまう問題を解消しました。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* union/intersect/except&#95;default&#95;mode の書き換えにおける例外安全性を修正。 [#82664](https://github.com/ClickHouse/ClickHouse/issues/82664) をクローズ。 [#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 非同期テーブルのロードジョブ数を追跡します。実行中のジョブがある場合は、`TransactionLog::removeOldEntries` 内で `tail_ptr` を更新しないようにします。 [#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach))。
* Iceberg のデータレースを修正。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* `use_skip_indexes_if_final_exact_mode` 最適化（25.6 で導入）が有効な場合、`MergeTree` エンジンの設定やデータ分布によっては、適切な候補範囲を選択できないことがありましたが、この問題は解決されました。 [#82879](https://github.com/ClickHouse/ClickHouse/pull/82879) ([Shankar Iyer](https://github.com/shankar-iyer)).
* SCRAM&#95;SHA256&#95;PASSWORD 型の AST から解析する際に、認証データの salt を設定しました。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach)).
* キャッシュしない Database 実装を使用している場合、対応するテーブルのメタデータは、カラムが返されて参照が無効になった後に削除されます。 [#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01)).
* `Merge` ストレージを持つテーブルとの `JOIN` 式を含むクエリに対するフィルタの書き換え処理を修正しました。 [#82092](https://github.com/ClickHouse/ClickHouse/issues/82092) を解決します。 [#82950](https://github.com/ClickHouse/ClickHouse/pull/82950) ([Dmitry Novik](https://github.com/novikd))。
* QueryMetricLog における LOGICAL&#95;ERROR「Mutex cannot be NULL」を修正。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos)).
* フォーマッタ `%f` を可変長フォーマッタ（例：`%M`）と併用した場合に、関数 `formatDateTime` の出力が誤っていた問題を修正しました。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* セカンダリクエリが常に VIEW からすべてのカラムを読み取る場合に、有効化されたアナライザによって発生するパフォーマンス低下を修正。[#81718](https://github.com/ClickHouse/ClickHouse/issues/81718) を修正。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 読み取り専用ディスク上でバックアップを復元する際に表示される誤解を招くエラーメッセージを修正しました。 [#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva)).
* 依存関係を持たないテーブルを作成する際には、循環依存関係のチェックを行わないようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) で導入された、数千のテーブルを作成するユースケースにおけるパフォーマンス低下が解消されます。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* 負の Time 値がテーブルに暗黙的に読み込まれる問題を修正し、ドキュメントの記述が紛らわしくならないようにしました。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `lowCardinalityKeys` 関数で、共有ディクショナリの無関係な部分を使用しないようにしました。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Materialized View におけるサブカラムの使用時のリグレッションを修正しました。これにより次の問題が修正されます: [#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 不正な INSERT 後に接続が切断状態のまま残ることでクライアントがクラッシュする問題を修正しました。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 空のカラムを含むブロックのサイズを計算する際に発生していたクラッシュを修正しました。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* UNION での Variant 型におけるクラッシュの可能性を修正。 [#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar)).
* サポートされていない SYSTEM クエリに対して発生していた clickhouse-local の LOGICAL&#95;ERROR を修正。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* S3 クライアント向けの `no_sign_request` を修正しました。これは S3 リクエストへの署名を明示的に行わないために使用できます。エンドポイントベースの設定を用いて、特定のエンドポイントごとに定義することも可能です。 [#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368))。
* CPU スケジューリングが有効な状態で負荷下で実行された際に、設定 &#39;max&#95;threads=1&#39; を指定したクエリでクラッシュが発生する可能性があった問題を修正しました。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* CTE 定義が同名の別のテーブル式を参照している場合に発生する `TOO_DEEP_SUBQUERIES` 例外を修正。 [#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd))。
* `REVOKE S3 ON system.*` を実行した際に `*.*` に対する S3 権限まで取り消されてしまう誤った動作を修正しました。これにより [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417) が解決されます。 [#83420](https://github.com/ClickHouse/ClickHouse/pull/83420) ([pufit](https://github.com/pufit))。
* クエリ間で async&#95;read&#95;counters を共有しないようにしました。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat)).
* サブクエリに FINAL が含まれている場合は parallel replicas を無効化するようにしました。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 設定 `role_cache_expiration_time_seconds` の構成における軽微な整数オーバーフローを修正しました（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) で導入されたバグを修正しました。`definer` が指定された MV への挿入時には、権限チェックに definer に付与された権限を使用する必要があります。これにより [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951) が修正されます。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* iceberg の配列要素および iceberg の map 値（それらのすべてのネストされたサブフィールドを含む）に対する境界ベースのファイルプルーニングを無効化。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik)).
* 一時的なデータストレージとして使用された際に発生する可能性のあった、ファイルキャッシュ未初期化エラーを修正しました。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper の修正: セッション終了時に ephemeral ノードが削除された場合に、total watch count が正しく更新されるようにしました。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* max&#95;untracked&#95;memory に関する誤ったメモリ処理を修正しました。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* `INSERT SELECT` と `UNION ALL` の組み合わせが特定のレアケースでヌルポインタデリファレンスを引き起こす可能性がありました。これにより [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618) がクローズされました。 [#83643](https://github.com/ClickHouse/ClickHouse/pull/83643) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `max_insert_block_size` に 0 を指定できないようにしました。これは論理エラーを引き起こす可能性があるためです。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc))。
* block&#95;size&#95;bytes=0 のときに estimateCompressionRatio() で発生する無限ループを修正。 [#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat)).
* `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` メトリクスを修正（以前は `Cache` プレフィックスなしのメトリクスに含められていました）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730)（[Azat Khuzhin](https://github.com/azat)）。
* `BackgroundSchedulePool` のシャットダウン時に、（タスクからスレッドを join することによる）アボートの可能性と、（ユニットテスト内での）ハングの可能性を修正しました。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat)).
* 名前の衝突が発生する場合に、新しいアナライザーが `WITH` 句内で外側のエイリアスを参照できるようにする後方互換性設定を導入しました。[#82700](https://github.com/ClickHouse/ClickHouse/issues/82700) を修正します。 [#83797](https://github.com/ClickHouse/ClickHouse/pull/83797) ([Dmitry Novik](https://github.com/novikd)).
* ライブラリブリッジのクリーンアップ中に発生する再帰的なコンテキストロックが原因で、シャットダウン時に起きていたデッドロックを修正。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### ビルド/テスト/パッケージングの改善

- ClickHouse字句解析器用の最小限のCライブラリ(10 KB)をビルドします。これは[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977)に必要です。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。スタンドアロン字句解析器のテストを追加し、テストタグ`fasttest-only`を追加します。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
- Nixサブモジュール入力のチェックを追加します。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- localhost上で統合テストを実行する際に発生する可能性のある一連の問題を修正します。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135) ([Oleg Doronin](https://github.com/dorooleg))。
- MacおよびFreeBSD上でSymbolIndexをコンパイルします。(ただし、ELFシステム、LinuxおよびFreeBSDでのみ動作します)。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Azure SDKをv1.15.0にアップグレードしました。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
- google-cloud-cppのストレージモジュールをビルドシステムに追加します。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881) ([Pablo Marcos](https://github.com/pamarcos))。
- clickhouse-server用の`Dockerfile.ubuntu`をDocker Official Libraryの要件に適合するように変更します。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158)のフォローアップとして、`curl clickhouse.com`へのビルドアップロードを修正します。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- `clickhouse/clickhouse-server`および公式`clickhouse`イメージに`busybox`バイナリとインストールツールを追加します。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- ClickHouseサーバーホストを指定するための`CLICKHOUSE_HOST`環境変数のサポートを追加しました。これは既存の`CLICKHOUSE_USER`および`CLICKHOUSE_PASSWORD`環境変数との整合性を図ったものです。これにより、クライアントや設定ファイルを直接変更することなく、より簡単に設定できるようになります。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659) ([Doron David](https://github.com/dorki))。

### ClickHouseリリース25.6、2025-06-26 {#256}

#### 後方互換性のない変更

- 以前は、関数`countMatches`はパターンが空のマッチを受け入れる場合でも、最初の空のマッチでカウントを停止していました。この問題を解決するため、`countMatches`は空のマッチが発生した場合に1文字進めることで実行を継続するようになりました。古い動作を維持したいユーザーは、設定`count_matches_stop_at_empty_match`を有効にすることができます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 軽微な変更: サーバー設定`backup_threads`および`restore_threads`を非ゼロに強制します。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano))。
- 軽微な変更: `String`に対する`bitNot`の修正により、内部メモリ表現でゼロ終端文字列が返されるようになります。これはユーザーに見える動作には影響しないはずですが、作成者はこの変更を強調したいと考えました。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat))。


#### 新機能

* 新しいデータ型 `Time` ([H]HH:MM:SS) と `Time64` ([H]HH:MM:SS[.fractional]) を追加し、他のデータ型と相互変換するためのいくつかの基本的なキャスト関数および関連関数を実装しました。既存の関数 `toTime` との互換性を制御するための設定を追加し、現在は従来の動作を維持するために設定 `use_legacy_to_time` が有効化されています。[#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。Time/Time64 間の比較をサポートしました。[#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しい CLI ツール [`chdig`](https://github.com/azat/chdig/)（ClickHouse 用の `top` 風 TUI インターフェイス）が ClickHouse の一部として追加されました。[#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* `Atomic` および `Ordinary` データベースエンジンで `disk` 設定をサポートし、テーブルメタデータファイルを保存するディスクを指定できるようにしました。 [#80546](https://github.com/ClickHouse/ClickHouse/pull/80546) ([Tuan Pham Anh](https://github.com/tuanpach))。これにより、外部ソースからデータベースをアタッチできるようになります。
* 新しい種類の MergeTree、`CoalescingMergeTree` — バックグラウンドマージ時に最初の非 Null 値をエンジンが採用します。これにより [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869) が解決されました。 [#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* WKB（「Well-Known Binary」は、さまざまなジオメトリ型をバイナリ形式でエンコードするためのフォーマットで、GIS アプリケーションで使用されます）を読み込むための関数をサポート。[#43941](https://github.com/ClickHouse/ClickHouse/issues/43941) を参照。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* ワークロード向けにクエリスロットのスケジューリング機能を追加しました。詳細は [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling) を参照してください。 [#78415](https://github.com/ClickHouse/ClickHouse/pull/78415) ([Sergei Trifonov](https://github.com/serxa)).
* `timeSeries*` ヘルパー関数により、時系列データを扱ういくつかのケースを高速化できます: - 指定した開始タイムスタンプ、終了タイムスタンプ、およびステップを用いてデータを時間グリッドに再サンプリングする - PromQL 風の `delta`、`rate`、`idelta`、`irate` を計算する。[#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger)).
* `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 関数を追加し、map の値を対象としたフィルタリングと、bloom filter ベースのインデックスでのそれらのサポートを可能にしました。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus)).
* 設定制約で、禁止する値の集合を指定できるようになりました。 [#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc))。
* 単一のクエリ内のすべてのサブクエリで同じストレージスナップショットを共有できるようにする設定 `enable_shared_storage_snapshot_in_query` を追加しました。これにより、クエリ内で同じテーブルが複数回参照される場合でも、そのテーブルからの読み取りの一貫性が保証されます。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* `JSON` カラムを `Parquet` へ書き込むこと、および `Parquet` から `JSON` カラムを直接読み込むことをサポートしました。 [#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `pointInPolygon` に `MultiPolygon` のサポートを追加。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* `deltaLakeLocal` テーブル関数を使用して、ローカルファイルシステムにマウントされた Delta テーブルをクエリできるようにしました。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* String からの cast 時に DateTime のパースモードを選択できるようにする新しい設定 `cast_string_to_date_time_mode` を追加しました。 [#80210](https://github.com/ClickHouse/ClickHouse/pull/80210)（[Pavel Kruglov](https://github.com/Avogar)）。たとえば、ベストエフォートモードに設定できます。
* Bitcoin の Bech アルゴリズムを扱うための `bech32Encode` 関数および `bech32Decode` 関数を追加しました（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* MergeTree パーツ名を解析するための SQL 関数を追加。 [#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun)).
* クエリで選択されたパーツを、それらが存在するディスク名でフィルタリングできるようにするため、新しい仮想カラム `_disk_name` を導入しました。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 埋め込み Web ツールの一覧を表示するランディングページを追加しました。ブラウザライクなユーザーエージェントからのリクエスト時に開きます。 [#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` および `arrayLastIndex` は、フィルター式によって返される NULL 値を除外します。以前のバージョンでは、Nullable なフィルター結果はサポートされていませんでした。 [#81113](https://github.com/ClickHouse/ClickHouse/issues/81113) を修正。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* `USE name` の代わりに `USE DATABASE name` と記述できるようになりました。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 利用可能なコーデックを確認するための新しいシステムテーブル `system.codecs` を追加しました。(issue [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)). [#81600](https://github.com/ClickHouse/ClickHouse/pull/81600) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* `lag` および `lead` ウィンドウ関数をサポート。 [#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) をクローズ。 [#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `tokens` でログに適した新しいトークナイザ `split` がサポートされるようになりました。 [#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze))。
* `clickhouse-local` で `--database` 引数をサポートしました。これにより、既に作成済みのデータベースに切り替えることができます。この変更により [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115) がクローズされました。[#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 実験的機能
* ClickHouse Keeper を使用して `Kafka2` に対し、Kafka のリバランスに似たロジックを実装しました。各レプリカについて 2 種類のパーティションロックをサポートします: 永続ロックと一時ロックです。レプリカは可能な限り長く永続ロックを保持しようとし、任意の時点でレプリカ上の永続ロック数は `all_topic_partitions / active_replicas_count`（ここで `all_topic_partitions` はすべてのパーティション数、`active_replicas_count` はアクティブなレプリカ数）を超えません。もしそれより多くなった場合、レプリカはいくつかのパーティションを解放します。一部のパーティションはレプリカによって一時的に保持されます。レプリカ上の一時ロックの最大数は動的に変化し、他のレプリカが一部のパーティションを永続ロックとして取得できるようにします。一時ロックを更新する際、レプリカはいったんそれらをすべて解放し、別のパーティションを再度取得しようとします。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 実験的なテキストインデックスを改善しました。明示的なパラメータ指定がキーと値のペアで可能になりました。現在サポートされているパラメータは、必須の `tokenizer` と、オプションの `max_rows_per_postings_list` および `ngram_size` の 2 つです。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* これまで、フルテキストインデックスでは `packed` ストレージはサポートされていませんでした。これは、セグメント ID がディスク上の (`.gin_sid`) ファイルを読み書きすることでオンザフライに更新されていたためです。`packed` ストレージの場合、コミットされていないファイルから値を読み出すことはサポートされておらず、このことが問題を引き起こしていました。現在はこの問題は解消されています。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 型 `gin` の実験的なインデックス（PostgreSQL のハッカーたちの内輪ネタなので好みではありません）は `text` に名称変更されました。既存の型 `gin` のインデックスは引き続きロード可能ですが、検索で使用しようとすると例外をスローし（代わりに `text` インデックスを提案します）、利用できません。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。



#### パフォーマンスの向上

* 複数プロジェクションでのフィルタリングをサポートし、パートレベルのフィルタリングに対して複数のプロジェクションを使用できるようにしました。これにより [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525) が解決されます。これは、[#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) に続く、プロジェクションインデックス実装の第 2 段階です。 [#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* ファイルシステムキャッシュのデフォルトのキャッシュポリシーとして `SLRU` を使用するようにしました。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii)).
* クエリパイプラインの Resize ステップでの競合を解消しました。 [#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* ネットワーク接続に紐づく単一スレッドではなく、パイプラインスレッドにブロックの(非)圧縮および(非)シリアライズ処理をオフロードするオプションを導入しました。設定 `enable_parallel_blocks_marshalling` で制御できます。イニシエーターとリモートノード間で大量のデータを転送する分散クエリの高速化が見込めます。 [#78694](https://github.com/ClickHouse/ClickHouse/pull/78694) ([Nikita Taranov](https://github.com/nickitat))。
* すべてのブルームフィルター種別のパフォーマンスを改善。[OpenHouse カンファレンスの動画](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800)（[Delyan Kratunov](https://github.com/dkratunov)）。
* 片方の集合が空の場合に `UniqExactSet::merge` に最適経路（ハッピーパス）を導入しました。また、LHS の集合が二段階構造で RHS が単段階構造の場合でも、RHS を二段階構造に変換しないようにしました。 [#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat)).
* 2 レベルのハッシュテーブル使用時のメモリ再利用効率を改善し、ページフォールトを削減しました。これにより GROUP BY の高速化が見込まれます。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* クエリ条件キャッシュで不要な更新を避け、ロック競合を軽減しました。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* `concatenateBlocks` に対する些細な最適化。並列ハッシュ結合に有効である可能性が高い。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328)（[李扬](https://github.com/taiyang-li)）。
* 主キー範囲からマーク範囲を選択する際、主キーが関数でラップされている場合は二分探索を使用できませんでした。この PR ではこの制限が緩和され、主キーが常に単調な関数チェーンでラップされている場合、または RPN に常に真となる要素が含まれている場合でも二分探索を適用できるようになりました。[#45536](https://github.com/ClickHouse/ClickHouse/issues/45536) をクローズ。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* `Kafka` エンジンのシャットダウン速度を改善しました（複数の `Kafka` テーブルがある場合に発生していた余分な 3 秒の遅延を削除）。[#80796](https://github.com/ClickHouse/ClickHouse/pull/80796)（[Azat Khuzhin](https://github.com/azat)）。
* 非同期挿入：挿入クエリのメモリ使用量を削減し、パフォーマンスを向上します。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* ログテーブルが無効化されている場合はプロセッサをプロファイルしないようにしました。 [#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。これにより、極めて短いクエリの処理が高速化されます。
* ソースが要求どおりの内容である場合に `toFixedString` を高速化しました。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* ユーザーに制限がない場合はクオータ値を処理しないようにしました。 [#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。これにより、ごく短いクエリの実行が高速になります。
* メモリトラッキングで発生していたパフォーマンスリグレッションを修正しました。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおけるシャーディングキーの最適化を向上しました。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* Parallel replicas: すべての読み取りタスクが他のレプリカに割り当て済みの場合、未使用レプリカの遅い処理を待たないように改善。[#80199](https://github.com/ClickHouse/ClickHouse/pull/80199)（[Igor Nikonov](https://github.com/devcrafter)）。
* Parallel replicas は、専用の接続タイムアウトを使用します。`parallel_replicas_connect_timeout_ms` 設定を参照してください。以前は、並列レプリカクエリの接続タイムアウト値として `connect_timeout_with_failover_ms` / `connect_timeout_with_failover_secure_ms` 設定が使用されていました（デフォルトでは 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* ジャーナル付きファイルシステムでは、`mkdir` はディスクに永続化されるファイルシステムのジャーナルに書き込まれます。ディスクが遅い場合、これに長い時間がかかる可能性があります。そのため、これをリザーブロックのスコープ外に移動しました。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg のマニフェストファイルの読み取りを、最初の読み取りクエリまで遅延。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 適用可能な場合に、`GLOBAL [NOT] IN` 述語を `PREWHERE` 句へ移動できるようにしました。[#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa))。





#### 改善

* `EXPLAIN SYNTAX` は新しいアナライザーを使用するようになりました。クエリツリーから構築された AST を返します。クエリツリーを AST に変換する前に実行するパスの回数を制御するためのオプション `query_tree_passes` が追加されました。 [#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Dynamic と JSON に対するフラット化シリアル化を Native フォーマットに実装しました。これにより、Dynamic では shared variant、JSON では shared data といった特別な構造を使用せずに、Dynamic および JSON データをシリアル化／デシリアル化できるようになります。このシリアル化は、`output_format_native_use_flattened_dynamic_and_json_serialization` を設定することで有効化できます。また、このシリアル化は、さまざまな言語で実装されたクライアントが TCP プロトコルで Dynamic および JSON をより簡単にサポートできるようにするためにも利用できます。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499)（[Pavel Kruglov](https://github.com/Avogar)）。
* エラー `AuthenticationRequired` 発生後に `S3` の認証情報を更新するようにしました。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.asynchronous_metrics` に辞書メトリクスを追加しました。- `DictionaryMaxUpdateDelay` - 辞書更新の最大遅延時間（秒）。- `DictionaryTotalFailedUpdates` - すべての辞書において、直近の正常なロード以降に発生したエラーの総数。[#78175](https://github.com/ClickHouse/ClickHouse/pull/78175)（[Vlad](https://github.com/codeworse)）。
* 破損したテーブルを保存する目的で作成された可能性のあるデータベースに関する警告を追加。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `S3Queue`、`AzureQueue` エンジンに `_time` 仮想カラムを追加しました。[#78926](https://github.com/ClickHouse/ClickHouse/pull/78926)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* CPU 過負荷時の接続切断を制御する設定をホットリロード可能にしました。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* Azure Blob Storage 上のプレーンディスクについて、`system.tables` に報告されるデータパスにコンテナプレフィックスを追加し、S3 および GCP と報告内容の整合性を取りました。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* これからは、clickhouse-client と local でも、`param_<name>`（アンダースコア）に加えて `param-<name>`（ハイフン）という形式でもクエリパラメータを受け付けます。これにより [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093) がクローズされました。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* チェックサム有効時にローカルからリモート S3 へデータをコピーする際の帯域幅割引に関する詳細な警告メッセージを追加。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu)).
* 以前は、`input_format_parquet_max_block_size = 0`（無効な値）の場合、ClickHouse がハングしていました。この問題はすでに修正されています。これにより [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394) がクローズされました。 [#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* `startup_scripts` に `throw_on_error` 設定を追加しました。`throw_on_error` が true の場合、すべてのクエリが正常に完了しない限りサーバーは起動しません。デフォルトでは `throw_on_error` は false で、従来の動作が維持されます。 [#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 任意の種類の `http_handlers` で `http_response_headers` を追加できるようになりました。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 関数 `reverse` が `Tuple` データ型をサポートするようになりました。 [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053) をクローズ。 [#80083](https://github.com/ClickHouse/ClickHouse/pull/80083) ([flynn](https://github.com/ucasfl))。
* [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817) を解決: `system.zookeeper` テーブルから `auxiliary_zookeepers` のデータを取得できるようにしました。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146) ([Nikolay Govorov](https://github.com/mrdimidium))。
* サーバーの TCP ソケットに関する非同期メトリクスを追加します。これにより可観測性が向上します。[#80187](https://github.com/ClickHouse/ClickHouse/issues/80187) をクローズ。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `anyLast_respect_nulls` および `any_respect_nulls` を `SimpleAggregateFunction` としてサポートしました。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein)).
* レプリケーテッドデータベースに対する不要な `adjustCreateQueryForBackup` の呼び出しを削除しました。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar))。
* `clickhouse-local` で、`-- --config.value='abc'` のように `--` の後に続く追加オプションを、等号なしでも指定できるようにしました。 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292) をクローズ。 [#80293](https://github.com/ClickHouse/ClickHouse/pull/80293) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SHOW ... LIKE` クエリ内のメタ文字を強調表示するようにしました。これにより [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) がクローズされました。 [#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-local` で SQL UDF を永続化できるようにしました。以前に作成された関数は起動時に読み込まれます。これにより [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085) がクローズされました。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 予備的な DISTINCT ステップに対する EXPLAIN プラン内の説明を修正。 [#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus)).
* ODBC/JDBC で名前付きコレクションを使用できるようにしました。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand))。
* 読み取り専用ディスクおよび破損ディスクの数に関するメトリクス。DiskLocalCheckThread の起動時にログへ記録される指標です。 [#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu)).
* `s3_plain_rewritable` ストレージでプロジェクションをサポートする機能を実装しました。以前のバージョンでは、S3 内でプロジェクションを参照するメタデータオブジェクトが移動時に更新されませんでした。[#70258](https://github.com/ClickHouse/ClickHouse/issues/70258) をクローズしました。 [#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` コマンドは、read-only ディスクおよび write-once ディスク上のパーツを参照しようとしなくなりました。この変更により [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430) が解決されました。[#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* マージ済みパーツに関するメッセージのログレベルを引き下げました。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* Iceberg テーブルに対するパーティションプルーニングのデフォルト動作を変更。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* インデックス検索アルゴリズムの観測性向上のために、新たに 2 つの ProfileEvents `IndexBinarySearchAlgorithm` と `IndexGenericExclusionSearchAlgorithm` を追加しました。 [#80679](https://github.com/ClickHouse/ClickHouse/pull/80679) ([Pablo Marcos](https://github.com/pamarcos)).
* 古いカーネルで `MADV_POPULATE_WRITE` がサポートされていないことについて、ログに警告を出さないようにしました（ログのノイズを防ぐため）。 [#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* `TTL` 式で `Date32` および `DateTime64` がサポートされるようになりました。 [#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand))。
* `max_merge_delayed_streams_for_parallel_write` の互換性に関する値を調整しました。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* クラッシュの修正: デストラクタ内で一時ファイル（ディスク上に一時データをスピルするために使用される）を削除しようとした際に例外がスローされると、プログラムが終了してしまう可能性がある問題を修正しました。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SYSTEM SYNC REPLICA` に `IF EXISTS` 修飾子を追加。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* &quot;Having zero bytes, but read range is not finished...&quot; という例外メッセージを拡張し、`system.filesystem_cache` に finished&#95;download&#95;time 列を追加しました。[#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* インデックスを使用する際に `EXPLAIN` の出力へ検索アルゴリズムのセクションを追加する `indexes = 1` オプションを追加しました。&quot;binary search&quot; または &quot;generic exclusion search&quot; のいずれかが表示されます。 [#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos)).
* 2024年の初めに、新しいアナライザがデフォルトで有効になっていなかったため、MySQL ハンドラーでは `prefer_column_name_to_alias` が true にハードコードされていました。現在では、このハードコードを解除できるようになりました。 [#80916](https://github.com/ClickHouse/ClickHouse/pull/80916) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `system.iceberg_history` は、glue や iceberg rest などのカタログデータベースの履歴も表示するようになりました。また、一貫性のため、`system.iceberg_history` 内の `table_name` 列と `database_name` 列を、それぞれ `table` と `database` にリネームしました。 [#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin))。
* `merge` テーブル関数で読み取り専用モードを許可し、その利用時に `CREATE TEMPORARY TABLE` 権限が不要になるようにしました。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* インメモリキャッシュのイントロスペクションを改善しました（不完全だった `system.asynchronouse_metrics` ではなく、`system.metrics` でキャッシュに関する情報を公開）。インメモリキャッシュのサイズ（バイト単位）を `dashboard.html` に追加しました。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` は `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes` にリネームされました。 [#81023](https://github.com/ClickHouse/ClickHouse/pull/81023) ([Azat Khuzhin](https://github.com/azat)).
* `system.rocksdb` から読み取る際に、`RocksDB` テーブルを保持できないエンジンを持つデータベースを無視するようにしました。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-local` の設定ファイルで `filesystem_caches` と `named_collections` を使用可能にしました。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `INSERT` クエリ内での `PARTITION BY` のハイライト処理を修正しました。以前のバージョンでは、`PARTITION BY` はキーワードとしてハイライトされていませんでした。 [#81106](https://github.com/ClickHouse/ClickHouse/pull/81106) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI に小さな改善を 2 つ行いました: - `CREATE` や `INSERT` のような出力を伴わないクエリを正しく処理するようにしました（つい最近まで、これらのクエリは無限にスピナーが回り続けていました）; - テーブルをダブルクリックした際に、先頭までスクロールするようにしました。 [#81131](https://github.com/ClickHouse/ClickHouse/pull/81131) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `MemoryResidentWithoutPageCache` メトリクスは、ユーザ空間ページキャッシュを除いた、サーバープロセスが使用している物理メモリ量をバイト単位で示します。これは、ユーザ空間ページキャッシュが利用されている場合に、実際のメモリ使用量をより正確に把握するのに役立ちます。ユーザ空間ページキャッシュが無効になっている場合、この値は `MemoryResident` と同じになります。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd)).
* クライアント、ローカルサーバー、Keeper クライアント、および Disks アプリで手動でログに記録された例外を「ログ済み」としてマークし、二重にログ出力されないようにしました。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` と `use_skip_indexes_if_final_exact_mode` の設定のデフォルト値が `True` になりました。`FINAL` 句を含むクエリは、（該当する場合）スキップインデックスを使用してグラニュールを絞り込み、一致するプライマリキー範囲に対応する追加のグラニュールも読み取るようになります。近似的／不正確な結果という従来の動作が必要なユーザーは、慎重に評価したうえで `use_skip_indexes_if_final_exact_mode` を FALSE に設定できます。 [#81331](https://github.com/ClickHouse/ClickHouse/pull/81331) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Web UI で複数のクエリがある場合、カーソル位置にあるクエリが実行されます。[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) の継続。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* このPRは、変換関数の単調性チェックにおける `is_strict` の実装上の問題に対処します。現在、`toFloat64(UInt32)` や `toDate(UInt8)` などの一部の変換関数は、本来は true を返すべきところで、誤って `is_strict` を false として返しています。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359)（[zoomxi](https://github.com/zoomxi)）。
* `KeyCondition` が連続した範囲とマッチするかを判定する際、キーが非厳密な関数チェーンでラップされている場合には、`Constraint::POINT` を `Constraint::RANGE` に変換する必要が生じることがあります。たとえば、`toDate(event_time) = '2025-06-03'` は `event_time` に対して次の範囲を意味します: [&#39;2025-06-03 00:00:00&#39;, &#39;2025-06-04 00:00:00&#39;)。この PR はこの挙動を修正します。 [#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* `--host` または `--port` が指定されている場合、`clickhouse` / `ch` エイリアスは `clickhouse-local` ではなく `clickhouse-client` を起動します。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) の継続。[#65252](https://github.com/ClickHouse/ClickHouse/issues/65252) をクローズ。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* keeper の応答時間分布データが得られたため、メトリクス用のヒストグラムバケットを調整できるようになりました。[#81516](https://github.com/ClickHouse/ClickHouse/pull/81516)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* プロファイルイベント `PageCacheReadBytes` を追加しました。[#81742](https://github.com/ClickHouse/ClickHouse/pull/81742)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ファイルシステムキャッシュで発生していた論理エラー「Having zero bytes but range is not finished」を修正。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii))。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* SELECT EXCEPT クエリを使用したパラメータ化ビューを修正。[#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) をクローズ。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer: join におけるカラム型の昇格後にカラムの投影名を修正。[#63345](https://github.com/ClickHouse/ClickHouse/issues/63345) をクローズ。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519)（[Dmitry Novik](https://github.com/novikd)）。
* analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier が有効な場合に、カラム名の衝突が発生するケースでの論理エラーを修正しました。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `allow_push_predicate_ast_for_distributed_subqueries` が有効な場合の、プッシュダウンされた述語における CTE の扱いを修正しました。 [#75647](https://github.com/ClickHouse/ClickHouse/issues/75647) を修正。 [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672) を修正。 [#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* SYSTEM SYNC REPLICA LIGHTWEIGHT &#39;foo&#39; が、指定されたレプリカが存在しない場合でも成功を報告してしまう問題を修正しました。コマンドは、同期を試みる前に Keeper 内にレプリカが存在することを正しく検証するようになりました。 [#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd))。
* `ON CLUSTER` クエリの `CONSTRAINT` セクションで `currentDatabase` 関数が使用された、非常に特定の状況で発生するクラッシュを修正しました。 [#78100](https://github.com/ClickHouse/ClickHouse/issues/78100) をクローズ。 [#79070](https://github.com/ClickHouse/ClickHouse/pull/79070) ([pufit](https://github.com/pufit)).
* インターサーバークエリでの外部ロールの受け渡しを修正。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* SingleValueDataGeneric では Field の代わりに IColumn を使用するようにしました。これにより、`Dynamic/Variant/JSON` 型に対する `argMax` など、一部の集約関数で発生していた誤った戻り値が修正されます。 [#79166](https://github.com/ClickHouse/ClickHouse/pull/79166) ([Pavel Kruglov](https://github.com/Avogar))。
* `use_native_copy` の適用方法を修正し、Azure Blob Storage 向けの `allow_azure_native_copy` 設定を有効化するとともに、資格情報が一致する場合にのみネイティブコピーを使用するように更新しました。これにより [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964) が解決されました。 [#79561](https://github.com/ClickHouse/ClickHouse/pull/79561) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* このカラムが相関しているかをチェックする際に発生していた、「カラムの起源スコープが不明」であることに起因する論理エラーを修正。[#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) を修正。[#79451](https://github.com/ClickHouse/ClickHouse/issues/79451) を修正。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* ColumnConst と Analyzer を使用する grouping sets で誤った結果が返される問題を修正しました。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* ローカルレプリカが古くなっている状態で分散テーブルから読み取る際に、ローカルシャードの結果が重複してしまう問題を修正。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 負の符号ビットを持つ NaN のソート順序を修正しました。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `GROUP BY ALL` は、`GROUPING` 句を考慮しなくなりました。 [#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 容量を使い切っていない場合でも過大な誤差が生じていた `TopK` / `TopKWeighted` 関数の誤った状態マージ処理を修正しました。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* `azure_blob_storage` オブジェクトストレージで `readonly` 設定が尊重されるようにしました。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* バックスラッシュでエスケープされた文字を含む `match(column, '^…')` の使用時に発生していた、誤ったクエリ結果およびメモリ不足クラッシュを修正しました。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* データレイクに対する Hive パーティションの無効化。 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937) に部分的に対応。 [#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* ラムダ式を含むスキップインデックスが適用できない問題を修正しました。インデックス定義内の高水準関数がクエリ内のものと完全に一致する場合にスキップインデックスが適用されるようになりました。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* レプリカでレプリケーションログから `ATTACH_PART` コマンドを実行してパーツをアタッチする際のメタデータバージョンを修正しました。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 他の関数とは異なり、Executable User Defined Functions (eUDF) の名前は `system.query_log` テーブルの `used_functions` 列に追加されません。このPRでは、リクエストで eUDF が使用された場合に、その eUDF 名が追加されるように実装しました。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush))。
* LowCardinality(FixedString) を含む Arrow フォーマットでの論理エラーを修正。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar)).
* Merge エンジンからのサブカラム読み取りを修正。[#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* `KeyCondition` における数値型同士の比較に関するバグを修正。 [#80207](https://github.com/ClickHouse/ClickHouse/pull/80207) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* プロジェクションを持つテーブルに lazy materialization を適用した際に発生する AMBIGUOUS&#95;COLUMN&#95;NAME を修正。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 暗黙のプロジェクションを使用している場合に、LIKE &#39;ab&#95;c%&#39; のような文字列プレフィックスフィルターに対する `count` の誤った最適化を修正しました。これにより [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250) が解決されます。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* MongoDB ドキュメント内のネストされた数値フィールドが文字列として誤ってシリアライズされる問題を修正。MongoDB から取得したドキュメントに対する最大深さ制限を削除。 [#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* Replicated データベースにおいて RMT のメタデータ検証を、より緩やかにしました。[#80296](https://github.com/ClickHouse/ClickHouse/issues/80296) をクローズ。[#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* PostgreSQL ストレージ用の DateTime および DateTime64 のテキスト表現を修正。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `StripeLog` テーブルでタイムゾーン付きの `DateTime` を許可するようにしました。これにより [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120) がクローズされました。 [#80304](https://github.com/ClickHouse/ClickHouse/pull/80304) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* クエリプランステップが行数を変更する場合、非決定的関数を含む述語に対するフィルタープッシュダウンを無効にします。これにより [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273) が修正されました。 [#80329](https://github.com/ClickHouse/ClickHouse/pull/80329) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* サブカラムを含むプロジェクションで発生し得る論理エラーやクラッシュを修正しました。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* `ON` 式が単純な等価条件でない場合に、logical JOIN sep のフィルタープッシュダウン最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正。[#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) を修正、[#77848](https://github.com/ClickHouse/ClickHouse/issues/77848) を修正。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* パーティション化されたテーブルでキーを逆順に読み取る際に発生していた誤った結果を修正しました。これにより [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987) が解消されました。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* `Nullable` キーを持つテーブルで、`optimize_read_in_order` が有効な場合に発生していた誤ったソート順を修正しました。 [#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `SYSTEM STOP REPLICATED VIEW` を使用してビューを一時停止した場合に、リフレッシュ可能なマテリアライズドビューの `DROP` がハングする問題を修正しました。 [#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリで定数タプルを使用した際に発生する「Cannot find column」エラーを修正。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `join_use_nulls` を使用する Distributed テーブルでの `shardNum` 関数の動作を修正。 [#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* Merge エンジンで、テーブルの一部にしか存在しないカラムを読み込む際に発生していた誤った結果を修正しました。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* SSH プロトコルで発生しうる問題（replxx のハングが原因）を修正。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* iceberg&#95;history テーブル内のタイムスタンプが、正しく設定されるようになりました。 [#80711](https://github.com/ClickHouse/ClickHouse/pull/80711) ([Melvyn Peignon](https://github.com/melvynator))。
* 辞書の登録に失敗した場合に発生しうるクラッシュを修正（`CREATE DICTIONARY` が `CANNOT_SCHEDULE_TASK` により失敗した際に、辞書レジストリ内にダングリングポインタが残り、その後クラッシュにつながる可能性があった問題を修正）。 [#80714](https://github.com/ClickHouse/ClickHouse/pull/80714) ([Azat Khuzhin](https://github.com/azat)).
* オブジェクトストレージのテーブル関数における、単一要素の enum グロブの処理を修正。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Tuple(Dynamic) と String の比較関数で発生していた誤った結果型を修正し、それによって生じていた論理エラーを解消しました。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* Unity Catalog 向けに不足していたサポート対象データ型 `timestamp_ntz` を追加。[#79535](https://github.com/ClickHouse/ClickHouse/issues/79535)、[#79875](https://github.com/ClickHouse/ClickHouse/issues/79875) を修正。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* `IN cte` を含む分散クエリで発生する `THERE_IS_NO_COLUMN` エラーを修正します。 [#75032](https://github.com/ClickHouse/ClickHouse/issues/75032) を修正。 [#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* external ORDER BY においてファイル数が過剰になる問題（メモリ使用量の増加を引き起こす）を修正。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* この PR により [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742) がクローズされる可能性があります。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* Kafka で、get&#95;member&#95;id() が NULL から std::string を生成していたことにより発生していたクラッシュを修正しました（おそらく、ブローカーへの接続が失敗した場合にのみ発生する問題でした）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* Kafka エンジンをシャットダウンする前にコンシューマを正しく待機するようにしました（シャットダウン後にアクティブなコンシューマが残っていると、さまざまなデバッグアサーションがトリガーされたり、テーブルが drop/detach された後もバックグラウンドでブローカーからデータを読み続けてしまう可能性があります）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat)).
* `predicate-push-down` 最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。[#80443](https://github.com/ClickHouse/ClickHouse/issues/80443) を解決します。 [#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `USING` を伴う `JOIN` 内のテーブル関数において、アスタリスク (`*`) マッチャーを解決する際の論理エラーを修正しました。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Iceberg メタデータファイルキャッシュのメモリ使用量の計上処理を修正。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* NULL 可能なパーティションキーに起因する誤ったパーティション分割を修正。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 分散クエリで述語プッシュダウン（`allow_push_predicate_ast_for_distributed_subqueries=1`）を行う際、イニシエータ上にソーステーブルが存在しない場合に発生していた `Table does not exist` エラーを修正。[#77281](https://github.com/ClickHouse/ClickHouse/issues/77281) を修正。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 名前付きウィンドウを使用した入れ子の関数における論理エラーを修正。 [#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* NULL 可能および浮動小数点カラムの extremes を修正。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* system.tables からのクエリ時に発生しうるクラッシュを修正（特にメモリ圧迫時に発生しやすい不具合）。[#80976](https://github.com/ClickHouse/ClickHouse/pull/80976)（[Azat Khuzhin](https://github.com/azat)）。
* ファイル拡張子から圧縮形式が推測されるファイルに対する、`truncate` を伴うアトミックなリネーム処理を修正しました。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* ErrorCodes::getName を修正しました。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* ユーザーがすべてのテーブルに対する権限を持っていない場合に、Unity Catalog でテーブル一覧を取得できない不具合を修正しました。現在はすべてのテーブルが正しく一覧表示され、制限付きのテーブルから読み取ろうとすると例外がスローされます。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin)).
* `SHOW TABLES` クエリにおいて、ClickHouse はデータレイクカタログからのエラーや予期しないレスポンスを無視するようになりました。 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725) を修正。 [#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* JSONExtract および JSON 型のパースにおいて、整数からの DateTime64 の解析処理を修正しました。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* schema 推論キャッシュに date&#95;time&#95;input&#95;format 設定が反映されるようにしました。 [#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリ開始後、カラムが送信される前にテーブルが DROP された場合に `INSERT` がクラッシュする問題を修正。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* quantileDeterministic における use-of-uninitialized-value の問題を修正しました。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* metadatastoragefromdisk ディスクトランザクションにおけるハードリンク数の管理を修正し、テストを追加。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema))。
* 他の関数とは異なり、ユーザー定義関数 (UDF) の名前は `system.query_log` テーブルには追加されません。このPRでは、リクエスト内でUDFが使用された場合、そのUDF名を `used_executable_user_defined_functions` または `used_sql_user_defined_functions` の2つのカラムのいずれかに追加するように実装しています。 [#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush)).
* HTTP プロトコル経由でのテキスト形式（`JSON`、`Values` など）による挿入時に、`Enum` フィールドが省略された場合に発生していた `Too large size ... passed to allocator` エラーやクラッシュの可能性を修正しました。 [#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* Sparse カラムを含む INSERT ブロックが非 MT のマテリアライズドビューに送られた場合に発生する LOGICAL&#95;ERROR を修正。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* `distributed_product_mode_local=local` とクロスレプリケーションの併用時に発生する `Unknown table expression identifier` エラーを修正。 [#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* フィルタリング後の Parquet ファイルの行数を誤ってキャッシュしていた問題を修正しました。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 相対キャッシュパス使用時の fs cache max&#95;size&#95;to&#95;total&#95;space 設定の動作を修正。[#81237](https://github.com/ClickHouse/ClickHouse/pull/81237)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Parquet フォーマットで const のタプルまたはマップを出力する際に clickhouse-local がクラッシュする問題を修正。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* ネットワーク経由で受信した配列オフセットを検証します。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 空のテーブルを結合し、ウィンドウ関数を使用するクエリにおけるいくつかのコーナーケースを修正しました。このバグにより並列ストリーム数が爆発的に増加し、その結果メモリ不足 (OOM) が発生していました。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* datalake Cluster 関数（`deltaLakeCluster`、`icebergCluster` など）に対する修正: (1) 旧アナライザで `Cluster` 関数を使用した場合に `DataLakeConfiguration` で発生し得るセグメンテーションフォルトを修正；(2) 重複して行われていた data lake メタデータ更新（不要なオブジェクトストレージへのリクエスト）を削除；(3) フォーマットが明示的に指定されていない場合にオブジェクトストレージで発生していた冗長なリスト処理を修正（非クラスタ data lake エンジンについてはすでに対応済みだったもの）。 [#81300](https://github.com/ClickHouse/ClickHouse/pull/81300) ([Kseniia Sumarokova](https://github.com/kssenii)).
* force&#95;restore&#95;data フラグで失われた keeper メタデータを復元できるようにしました。 [#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* delta-kernel のリージョンエラーを修正。 [#79914](https://github.com/ClickHouse/ClickHouse/issues/79914) を解決。 [#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* divideOrNull に対する誤った JIT を無効にする。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano))。
* MergeTree テーブルでパーティション列名が長い場合に発生する挿入エラーを修正。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) でバックポート: マージ中の例外発生時に `Aggregator` がクラッシュする可能性がある問題を修正しました。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 複数のマニフェストファイルの内容をメモリに保持しないようにしました。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik))。
* バックグラウンドプール（`background_.*pool_size`）のシャットダウン時に発生し得るクラッシュを修正しました。 [#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* `URL` エンジンを使用してテーブルに書き込む際に発生していた `Npy` フォーマットでの範囲外読み取りを修正しました。これにより [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356) がクローズされます。 [#81502](https://github.com/ClickHouse/ClickHouse/pull/81502) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI に `NaN%` が表示される場合があります（典型的な JavaScript の問題）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_enforce_synchronous_settings=1` のときの `DatabaseReplicated` を修正。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* LowCardinality(Nullable(...)) 型のソート順序を修正。 [#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* サーバーは、リクエストがソケットから完全に読み込まれていない場合、HTTP 接続を保持してはなりません。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* スカラー相関サブクエリが射影式の結果を `Nullable` として返すようにしました。相関サブクエリが空の結果セットを返す場合の挙動を修正しました。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* `ReplicatedMergeTree` への `ATTACH` 中に発生する `Unexpected relative path for a deduplicated part` エラーを修正。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* `use_iceberg_partition_pruning` クエリ設定は、クエリコンテキストではなくグローバルコンテキストを使用しているため、Iceberg ストレージでは有効になりません。ただしデフォルト値が true であるため重大な問題にはなりません。この PR で修正されます。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991))。
* [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) でバックポート済み: TTL 式で dict が使用されているマージ処理中に発生する &quot;Context has expired&quot; エラーを修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* Mergetree の設定 `merge_max_block_size` に対してゼロ以外であることを確認するバリデーションを追加しました。 [#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc)).
* `clickhouse-local` において `DROP VIEW` クエリがハングする問題を修正しました。 [#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc))。
* 一部のケースにおける StorageRedis の join を修正。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 古いアナライザーが有効な状態で空の `USING ()` を使用した場合に発生していた `ConcurrentHashJoin` のクラッシュを修正しました。 [#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat)).
* Keeper の修正: ログ内に不正なエントリがある場合、新しいログのコミットをブロックするようにしました。以前は、リーダーが一部のログを誤って適用しても、新しいログのコミットを継続していましたが、フォロワー側ではダイジェストの不一致を検出して中断していました。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* スカラー相関サブクエリの処理中に必要なカラムが読み込まれない問題を修正しました。 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 誰かが私たちのコードのあちこちに Kusto を紛れ込ませていました。整理してきれいにしました。これにより [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643) がクローズされます。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 以前のバージョンでは、`/js` へのリクエストに対してサーバーが過剰なコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) がクローズされました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 以前は、`MongoDB` テーブルエンジンの定義で `host:port` 引数にパスコンポーネントを含めることができましたが、これは暗黙的に無視されていました。`mongodb` 連携機能では、そのようなテーブルの読み込みは拒否されていました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルの読み込みを許可し、パスコンポーネントを無視して*、引数で指定されたデータベース名を使用するようにしました。*注:* この修正は、新しく作成されるテーブルや `mongo` テーブル関数を用いたクエリ、辞書ソースおよび named collection には適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* マージ中に例外が発生した場合に `Aggregator` で起こり得るクラッシュを修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* `arraySimilarity` のコピーペーストミスを修正し、`UInt32` および `Int32` の重みの使用を禁止。テストとドキュメントを更新。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* サジェスト用スレッドとメインクライアントスレッドの間で発生し得るデータレースを修正しました。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### ビルド/テスト/パッケージングの改善

* `postgres` 16.9 を使用。[#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `openssl` 3.2.4 を使用。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `abseil-cpp` 2025-01-27 を使用します。 [#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `mongo-c-driver` 1.30.4 を使用。 [#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `krb5` 1.21.3-final を使用。 [#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `orc` 2.1.2 を使用。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `grpc` 1.73.0 を使用。[#81629](https://github.com/ClickHouse/ClickHouse/pull/81629)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `delta-kernel-rs` v0.12.1 を使用。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `c-ares` を `v1.34.5` にアップデート。[#81159](https://github.com/ClickHouse/ClickHouse/pull/81159)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* CVE-2025-5025 および CVE-2025-4947 に対処するために `curl` を 8.14 にアップグレード。 [#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit)).
* `libarchive` を 3.7.9 にアップグレードし、次の脆弱性に対応: CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。 [#81174](https://github.com/ClickHouse/ClickHouse/pull/81174) ([larryluogit](https://github.com/larryluogit)).
* `libxml2` を 2.14.3 に更新。[#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit)).
* ベンダリングされた Rust のソースコードを `CARGO_HOME` にコピーしないようにしました。 [#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Sentry ライブラリへの依存を、独自エンドポイントに置き換えることで解消しました。 [#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dependabot のアラートに対応するため、CI イメージ内の Python 依存関係を更新。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper に対してフォールトインジェクションが有効な場合にテストをより堅牢にするため、起動時に Keeper からレプリケーテッド DDL の停止フラグ読み取りをリトライするようにしました。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger)).
* Ubuntu アーカイブの URL に https を使用。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* テストイメージ内の Python 依存関係を更新。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot))。
* Nix ビルド向けに `flake.nix` を導入。[#81463](https://github.com/ClickHouse/ClickHouse/pull/81463)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* ビルド時に `delta-kernel-rs` がネットワークアクセスを必要としてしまう問題を修正。[#80609](https://github.com/ClickHouse/ClickHouse/issues/80609) をクローズ。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。記事「[A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust)」も参照。

### ClickHouse リリース 25.5, 2025-05-22 {#255}

#### 後方互換性のない変更

- 関数 `geoToH3` は、入力を (lat, lon, res) の順序で受け付けるようになりました(他の幾何関数と同様です)。以前の結果順序 (lon, lat, res) を維持したい場合は、設定 `geotoh3_argument_order = 'lon_lat'` を指定できます。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008))。
- ファイルシステムキャッシュの動的リサイズを許可するファイルシステムキャッシュ設定 `allow_dynamic_cache_resize` を追加しました(デフォルトは `false`)。理由: 特定の環境(ClickHouse Cloud)では、すべてのスケーリングイベントがプロセスの再起動を通じて発生するため、動作をより細かく制御し、安全対策として、この機能を明示的に無効にする必要があります。この PR は後方互換性がないとマークされています。古いバージョンでは動的キャッシュリサイズが特別な設定なしでデフォルトで動作していたためです。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii))。
- レガシーインデックスタイプ `annoy` および `usearch` のサポートを削除しました。両方とも長い間スタブとなっており、レガシーインデックスを使用しようとするとエラーが返されていました。まだ `annoy` および `usearch` インデックスが存在する場合は、削除してください。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze))。
- サーバー設定 `format_alter_commands_with_parentheses` を削除しました。この設定は 24.2 で導入され、デフォルトで無効になっていました。25.2 でデフォルトで有効になりました。新しい形式をサポートしない LTS バージョンが存在しないため、この設定を削除できます。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- `DeltaLake` ストレージの `delta-kernel-rs` 実装をデフォルトで有効にしました。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `URL` からの読み取りに複数のリダイレクトが含まれる場合、設定 `enable_url_encoding` がチェーン内のすべてのリダイレクトに正しく適用されます。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer))。設定 `enble_url_encoding` のデフォルト値が `false` に設定されました。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer))。


#### 新機能

* WHERE 句でのスカラー相関サブクエリをサポートしました。[#6697](https://github.com/ClickHouse/ClickHouse/issues/6697) をクローズ。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。単純なケースにおいて、投影リスト内での相関サブクエリをサポートしました。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。これにより TPC-H テストスイートを 100% カバーしました。
* ベクター類似性インデックスを使用したベクター検索が、これまでの実験的機能からベータ機能になりました。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze)).
* `Parquet` フォーマットで geo 型をサポートしました。これにより [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) がクローズされました。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* 「スパース n-gram」（sparse-ngrams）を計算するための新しい関数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8` を追加しました。これは、インデックス作成と検索のために部分文字列を抽出する堅牢なアルゴリズムです。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12)).
* `clickhouse-local`（およびその省略形エイリアスである `ch`）は、処理対象の入力データが存在する場合に、暗黙的に `FROM table` を使用するようになりました。これにより [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023) が解決されました。また、通常ファイルを処理する際に `--input-format` が指定されていない場合、clickhouse-local でのフォーマット推論も有効になりました。 [#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `stringBytesUniq` と `stringBytesEntropy` 関数を追加し、ランダムまたは暗号化されている可能性のあるデータを検索できるようにしました。 [#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* Base32 のエンコードおよびデコード用の関数を追加しました。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x)).
* `getServerSetting` と `getMergeTreeSetting` 関数を追加。#78318 をクローズ。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* 新しい `iceberg_enable_version_hint` 設定を追加し、`version-hint.text` ファイルを利用できるようにしました。 [#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche)).
* `LIKE` キーワードでフィルタリングして、データベース内の特定のテーブルを TRUNCATE できるようにします。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `MergeTree` ファミリーのテーブルで `_part_starting_offset` 仮想列をサポートしました。この列は、現在のパート一覧に基づいてクエリ時に計算される、すべての先行パートの累積行数を表します。累積値はクエリ実行全体を通して保持され、パートのプルーニング後も有効なままです。この動作をサポートするため、関連する内部ロジックがリファクタリングされました。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird))。
* 右引数がゼロの場合に NULL を返すようにする関数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull` を追加。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse のベクトル検索は、プリフィルタリングとポストフィルタリングの両方をサポートするようになり、より細かな制御のための関連設定も提供されます。(issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)). [#79854](https://github.com/ClickHouse/ClickHouse/pull/79854) ([Shankar Iyer](https://github.com/shankar-iyer)).
* [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 関数と [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 関数を追加しました。[`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) でパーティション分割された `Iceberg` テーブルにおけるデータファイルのプルーニングをサポートしました。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262)（[Daniil Ivanik](https://github.com/divanik)）。



#### 実験的機能
* 新しい `Time`/`Time64` データ型: `Time` (HHH:MM:SS) と `Time64` (HHH:MM:SS.`<fractional>`) を追加し、他のデータ型と相互運用するためのいくつかの基本的なキャスト関数および関数を追加しました。また、既存の関数名 `toTime` を `toTimeWithFixedDate` に変更しました。これは、キャスト関数用に `toTime` 関数名が必要となるためです。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Iceberg データレイク向けの Hive metastore カタログ。 [#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* `full_text` 型のインデックスは `gin` に名称変更されました。これは PostgreSQL および他のデータベースでより一般的な用語に従ったものです。既存の `full_text` 型インデックスは引き続きロード可能ですが、検索で使用しようとすると例外をスローし（代わりに `gin` インデックスを提案します）、使用できません。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### パフォーマンスの向上

* Compact パーツ形式を変更し、各サブストリームごとにマークを保存して個々のサブカラムを読み取れるようにしました。旧 Compact 形式は引き続き読み取りでサポートされており、MergeTree 設定 `write_marks_for_substreams_in_compact_parts` を使用することで書き込みでも有効化できます。コンパクトパーツのストレージ形式が変更されるため、アップグレードをより安全に行う目的で、デフォルトでは無効になっています。今後のいずれかのリリースでデフォルトで有効になります。 [#77940](https://github.com/ClickHouse/ClickHouse/pull/77940) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムを含む条件を `PREWHERE` に移動できるようにしました。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 複数のグラニュールに対して同時に式を評価することで、セカンダリインデックスを高速化しました。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `compile_expressions`（通常の式の一部を対象とする JIT コンパイラ）をデフォルトで有効化しました。これにより、[#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386)、[#66486](https://github.com/ClickHouse/ClickHouse/issues/66486) がクローズされました。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい設定 `use_skip_indexes_in_final_exact_mode` が導入されました。`ReplacingMergeTree` テーブルに対するクエリで FINAL 句が指定されている場合、スキップインデックスに基づいてテーブル範囲のみを読み取ると、結果が不正確になる可能性があります。この設定を有効にすると、スキップインデックスによって返された主キー範囲と重複するより新しいパーツもスキャンすることで、正しい結果が返されるようにできます。無効にするには 0、有効にするには 1 を設定します。 [#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer)).
* オブジェクトストレージクラスタテーブル関数（例: `s3Cluster`）は、キャッシュの局所性を向上させるため、一貫ハッシュに基づいて読み取り対象のファイルをレプリカに割り当てるようになりました。 [#77326](https://github.com/ClickHouse/ClickHouse/pull/77326) ([Andrej Hoos](https://github.com/adikus))。
* `S3Queue`/`AzureQueue` のパフォーマンスを、INSERT データを並列で実行できるようにすることで改善しました（キュー設定 `parallel_inserts=true` で有効化可能）。これまでは S3Queue/AzureQueue はパイプラインの最初の部分（ダウンロード、パース）のみを並列化でき、INSERT は単一スレッドでした。そして多くの場合、`INSERT` がボトルネックとなっていました。今回の変更により、`processing_threads_num` に対してほぼ線形にスケールします。[#77671](https://github.com/ClickHouse/ClickHouse/pull/77671)（[Azat Khuzhin](https://github.com/azat)）。S3Queue/AzureQueue における max&#95;processed&#95;files&#95;before&#95;commit を、より公平なものにしました。[#79363](https://github.com/ClickHouse/ClickHouse/pull/79363)（[Azat Khuzhin](https://github.com/azat)）。
* 右側テーブルのサイズがしきい値未満の場合に `hash` アルゴリズムへフォールバックするためのしきい値（設定 `parallel_hash_join_threshold` で制御）を導入しました。 [#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat))。
* 現在、並列レプリカが有効な読み取りにおけるタスクサイズの決定に、レプリカ数を用いるようにしました。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間での作業分散がより良くなります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* 分散集約の最終段階で `uniqExact` 状態を並列にマージできるようにしました。 [#78703](https://github.com/ClickHouse/ClickHouse/pull/78703) ([Nikita Taranov](https://github.com/nickitat)).
* キー付き集約における `uniqExact` 状態の並列マージで生じる可能性のあったパフォーマンス低下を修正しました。 [#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* Azure Storage への List Blobs API 呼び出し回数を削減しました。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 並列レプリカを使用する分散 `INSERT SELECT` のパフォーマンスを改善。[#79441](https://github.com/ClickHouse/ClickHouse/pull/79441)（[Azat Khuzhin](https://github.com/azat)）。
* `LogSeriesLimiter` が生成されるたびにクリーンアップを実行しないようにして、高い並行性シナリオでのロック競合とパフォーマンス低下を回避します。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov))。
* 単純な `count` 最適化によりクエリを高速化しました。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* `Decimal` を使用する一部の演算のインライン展開を改善。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `input_format_parquet_bloom_filter_push_down` をデフォルトで true に設定しました。また、設定変更履歴にあった誤りを修正しました。 [#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* すべての行を削除する必要があるパーツに対する `ALTER ... DELETE` ミューテーションを最適化しました。このような場合、ミューテーションを実行することなく、元のパーツではなく空のパーツが作成されるようになりました。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 可能な場合、Compact パーツへの挿入時にブロックの不要なコピーを行わないようにしました。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* `input_format_max_block_size_bytes` 設定を追加し、入力フォーマットで作成されるブロックのサイズをバイト単位で制限できるようにしました。これにより、行に大きな値が含まれている場合のデータインポート時の高いメモリ使用量を回避するのに役立ちます。 [#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar)).
* スレッドおよび async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests のガードページを削除しました。`FiberStack` の割り当て方式を `mmap` から `aligned_alloc` に変更しました。これは VMA を分割し、高負荷時には vm.max&#95;map&#95;count の上限に達し得るためです。 [#79147](https://github.com/ClickHouse/ClickHouse/pull/79147) ([Sema Checherinda](https://github.com/CheSema))。
* Parallel Replicas における遅延マテリアライゼーション。[#79401](https://github.com/ClickHouse/ClickHouse/pull/79401)（[Igor Nikonov](https://github.com/devcrafter)）。





#### 改善

* `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` の設定時に、軽量削除をオンザフライで適用できる機能を追加しました。 [#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ)).
* ターミナルに pretty フォーマットのデータが表示されていて、その後続ブロックが同じカラム幅を持つ場合、カーソルを上に移動して前のブロックから連続して表示することで、前のブロックに「結合」できます。これにより [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333) が解決されました。この機能は新しい設定 `output_format_pretty_glue_chunks` によって制御されます。 [#79339](https://github.com/ClickHouse/ClickHouse/pull/79339) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `isIPAddressInRange` 関数を `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)`、`Nullable(IPv6)` の各データ型に拡張しました。 [#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff)).
* `PostgreSQL` エンジンの接続プーラーの設定を動的に変更できるようにしました。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 通常のプロジェクションで `_part_offset` を指定できるようにしました。これはプロジェクションインデックスを構築するための最初のステップです。[#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) と組み合わせて使用でき、#63207 の改善にも役立ちます。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429)（[Amos Bird](https://github.com/amosbird)）。
* `system.named_collections` に新しいカラム（`create_query` と `source`）を追加しました。 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179) をクローズ。 [#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* `system.query_condition_cache` システムテーブルに新しいフィールド `condition` を追加しました。このフィールドには、クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件が保存されます。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* `BFloat16` 列を対象にベクトル類似性インデックスを作成できるようになりました。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze))。
* `DateTime64` のベストエフォート解析で、小数部付きの Unix タイムスタンプをサポートするようにしました。 [#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* ストレージ `DeltaLake` の delta-kernel 実装において、column mapping モードの不具合を修正し、スキーマ進化向けのテストを追加しました。 [#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `Values` フォーマットでの `Variant` カラムへの挿入について、値の変換をより適切に行うことで改善しました。 [#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar)).
* `tokens` 関数が拡張され、追加の「tokenizer」引数および tokenizer 固有の追加引数を受け取れるようになりました。 [#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `SHOW CLUSTER` ステートメントは、引数内のマクロ（存在する場合）を展開するようになりました。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42))。
* ハッシュ関数が、配列、タプル、マップ内の `NULL` をサポートするようになりました。（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365)、[#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)). [#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)).
* cctz を 2025a に更新。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano))。
* UDF のデフォルトの stderr 処理を「log&#95;last」に変更しました。ユーザビリティの観点からその方が望ましいためです。 [#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI でタブ操作を取り消せるようにしました。これにより [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284) がクローズされます。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `recoverLostReplica` 実行時の設定を、次の PR と同様に削除しました: [https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* Parquet インデックスプルーニングのプロファイル用に、プロファイルイベント `ParquetReadRowGroups` および `ParquetPrunedRowGroups` を追加。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* クラスタ上でのデータベースに対する `ALTER` をサポート。[#79242](https://github.com/ClickHouse/ClickHouse/pull/79242)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* QueryMetricLog の統計収集で抜け落ちた実行分を明示的にスキップしないと、ログが現在時刻に追いつくまでに長い時間がかかります。 [#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Arrow` ベースのフォーマット読み込みに関する軽微な最適化をいくつか行いました。 [#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc))。
* 設定 `allow_archive_path_syntax` は誤って experimental としてマークされていました。experimental な設定がデフォルトで有効になってしまうのを防ぐためのテストを追加しました。 [#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ページキャッシュ設定をクエリ単位で調整可能にしました。これにより、高速な検証や、高スループットかつ低レイテンシーなクエリ向けのきめ細かなチューニングが可能になります。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ほとんどの 64-bit ハッシュのように見える数値については、見やすい形式での数値ヒントの出力を行わないようにしました。これにより [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334) がクローズされました。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高度なダッシュボード上のグラフの色は、対応するクエリのハッシュから計算されます。これにより、ダッシュボードをスクロールしているときにグラフを覚えやすく、見つけやすくなります。 [#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 非同期メトリクス `FilesystemCacheCapacity` を追加しました。`cache` 仮想ファイルシステムの総容量を表します。これはグローバルなインフラストラクチャ監視に役立ちます。 [#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts へのアクセスを最適化し、要求された場合にのみ列/インデックスのサイズを読み取るようにしました。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* クエリ `'SHOW CLUSTER <name>'` に対して、すべてのフィールドではなく、必要なフィールドのみを計算するようにしました。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `DatabaseCatalog` のストレージ設定を指定できるようにしました。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` でローカルストレージをサポートしました。 [#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* delta-kernel-rs を有効化するためのクエリレベル設定 `allow_experimental_delta_kernel_rs` を追加しました。 [#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure/S3 BLOB ストレージから BLOB を一覧取得する際に発生し得る無限ループを修正。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* ファイルシステムキャッシュの設定 `max_size_ratio_to_total_space` を追加しました。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `clickhouse-benchmark` の `reconnect` オプションを再構成し、再接続の動作に応じて 0、1 または N を値として指定できるようにしました。 [#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* 異なる `plain_rewritable` ディスク上にあるテーブル間での `ALTER TABLE ... MOVE|REPLACE PARTITION` を許可。 [#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva)).
* 参照ベクトルが `Array(BFloat16)` 型の場合にも、ベクトル類似度インデックスが使用されるようになりました。 [#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer)).
* last&#95;error&#95;message、last&#95;error&#95;trace、および query&#95;id を system.error&#95;log テーブルに追加。関連チケット [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* クラッシュレポートの送信をデフォルトで有効化しました。これはサーバーの設定ファイルで無効にできます。[#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `system.functions` システムテーブルで、各関数が最初に導入された ClickHouse バージョンを確認できるようになりました。 [#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze))。
* `access_control_improvements.enable_user_name_access_type` 設定を追加しました。この設定により、[https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) で導入されたユーザー／ロールに対する厳密な権限付与を有効／無効にできます。レプリカがバージョン 25.1 より古いノードを含むクラスターを運用している場合は、この設定をオフにすることを検討してください。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* `ASTSelectWithUnionQuery::clone()` メソッドの適切な実装において、`is_normalized` フィールドも考慮されるようになりました。これにより、[#77569](https://github.com/ClickHouse/ClickHouse/issues/77569) の問題の解決に役立つ可能性があります。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* `EXCEPT` 演算子を含む一部のクエリにおけるフォーマットの不整合を修正しました。`EXCEPT` 演算子の左辺が `*` で終わる場合、フォーマット後のクエリからかっこが失われ、その結果 `EXCEPT` 修飾子付きの `*` としてパースされてしまいます。これらのクエリはファザーによって検出されたもので、実際に使用される可能性は低いと考えられます。この変更により [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950) がクローズされました。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* バリアントのデシリアライズ順序をキャッシュすることで、`JSON` 型のパースをわずかに改善しました。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定 `s3_slow_all_threads_after_network_error` を追加しました。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar)).
* マージ対象として選択されたパーツに関するログレベルが誤っており、Information になっていました。[#80061](https://github.com/ClickHouse/ClickHouse/issues/80061) をクローズします。 [#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer: ツールチップとステータスメッセージに runtime/share を追加。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa))。
* trace-visualizer: ClickHouse サーバーからデータを読み込むようにしました。 [#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa)).
* 失敗したマージに関するメトリクスを追加。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-benchmark` は、最大反復回数が指定されている場合、その値に基づいてパーセンテージを表示します。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* system.parts テーブル用のビジュアライザーを追加。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* クエリレイテンシ分析用のツールを追加。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 一部のパーツで列名のリネームが反映されていなかった問題を修正しました。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* マテリアライズドビューが開始されるタイミングが遅くなり、そこへストリーミングする Kafka テーブルより後に作成されてしまう場合があります。 [#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn)).
* アナライザー有効時の `VIEW` 作成における `SELECT` クエリの書き換えを修正。 [#75956](https://github.com/ClickHouse/ClickHouse/issues/75956) をクローズ。 [#76356](https://github.com/ClickHouse/ClickHouse/pull/76356) ([Dmitry Novik](https://github.com/novikd))。
* サーバーからの `async_insert` の適用（`apply_settings_from_server` 経由）を修正しました（以前はクライアント側で `Unknown packet 11 from server` エラーが発生していました）。[#77578](https://github.com/ClickHouse/ClickHouse/pull/77578)（[Azat Khuzhin](https://github.com/azat)）。
* Replicated データベースにおいて、新しく追加されたレプリカ上で refreshable マテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* バックアップを壊していたリフレッシュ可能なマテリアライズドビューに関する問題を修正しました。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* `transform` の旧来の発火ロジックにおけるエラーを修正。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* analyzer の使用時にセカンダリインデックスが適用されていなかったいくつかのケースを修正しました。 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) を修正し、 [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373) も修正しました。 [#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* HTTP プロトコルで圧縮が有効な場合のプロファイルイベント（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）のダンプを修正（誤差がバッファサイズ、通常は約 1MiB を超えないようにする）。[#78516](https://github.com/ClickHouse/ClickHouse/pull/78516)（[Azat Khuzhin](https://github.com/azat)）。
* `JOIN ... USING` で `ALIAS` 列が関与している場合に `LOGICAL_ERROR` を発生させていた analyzer を修正し、代わりに適切なエラーを返すようにしました。 [#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* アナライザを修正：`SELECT` に位置引数が含まれている場合に `CREATE VIEW ... ON CLUSTER` が失敗する問題を修正。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `SELECT` にスカラサブクエリが含まれている場合に、スキーマ推論を行うテーブル関数への `INSERT SELECT` で発生していた `Block structure mismatch` エラーを修正。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* analyzer を修正: Distributed テーブルに対する SELECT クエリで `prefer_global_in_and_join=1` が設定されている場合、`in` 関数は `globalIn` に置き換えられる必要があります。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `MongoDB` エンジンまたは `mongodb` テーブル関数を使用するテーブルから読み取る、いくつかの種類の `SELECT` クエリを修正しました。`WHERE` 句内の定数値の暗黙的な型変換を伴うクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` および `GROUP BY` を含むクエリなどです。これらは以前、誤った結果を返すことがありました。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 異なる JSON 型間の変換を修正しました。現在は、String 型への変換と String 型からの変換を経由した単純なキャストによって実行されます。これは効率は低いものの、100% の精度で変換できます。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar))。
* Dynamic 型から Interval への変換時に発生する論理エラーを修正。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON パースエラー発生時のカラムのロールバック処理を修正。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 定数エイリアス列を使用した `JOIN` で発生する「bad cast」エラーを修正。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir))。
* ビューとターゲットテーブルで型が異なる列に対して、マテリアライズドビューでの PREWHERE を許可しないようにしました。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* Variant 列の不正なバイナリデータをパースする際に発生する論理エラーを修正。 [#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* parquet バッチサイズが 0 に設定されている場合に例外をスローするようにしました。以前は output&#95;format&#95;parquet&#95;batch&#95;size = 0 のときに ClickHouse がハングしていましたが、この挙動は修正されました。 [#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* コンパクトパーツにおける basic フォーマットでの variant discriminator のデシリアライズ処理を修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) で導入されました。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* `complex_key_ssd_cache` 型の辞書では、`block_size` および `write_buffer_size` パラメータにゼロまたは負の値を指定すると拒否されるようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* SummingMergeTree では、非集約列に Field を使用しないでください。SummingMergeTree で Dynamic/Variant 型を使用している場合、予期しないエラーが発生する可能性があります。[#79051](https://github.com/ClickHouse/ClickHouse/pull/79051)（[Pavel Kruglov](https://github.com/Avogar)）。
* Distributed 先テーブルを宛先とし、ヘッダーが異なる Materialized View からの読み取りを analyzer で修正。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* `arrayUnion()` が、バッチ挿入を行ったテーブルに対して余分な（誤った）値を返していたバグを修正しました。 [#75057](https://github.com/ClickHouse/ClickHouse/issues/75057) を修正。 [#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* `OpenSSLInitializer` のセグメンテーションフォルトを修正。[#79092](https://github.com/ClickHouse/ClickHouse/issues/79092) をクローズ。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* S3 の ListObject に対して常にプレフィックスを設定するようにしました。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* バッチ挿入が行われたテーブルで arrayUnion() が余分な（誤った）値を返していたバグを修正しました。 [#79157](https://github.com/ClickHouse/ClickHouse/issues/79157) を修正。 [#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* フィルタープッシュダウン後の論理的な不具合を修正。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* HTTP ベースのエンドポイントで使用される delta-kernel 実装を用いた DeltaLake テーブルエンジンを修正し、NOSIGN の問題を修正しました。[#78124](https://github.com/ClickHouse/ClickHouse/issues/78124) をクローズ。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper の修正: 失敗した multi リクエストで watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* IN で Dynamic 型と JSON 型の使用を禁止しました。`IN` の現在の実装では、これらを許可すると誤った結果につながる可能性があります。これらの型に対する `IN` の正確なサポートは複雑であり、将来的に実装される可能性があります。 [#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON 型パース時の重複パスチェックを修正。 [#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar)).
* SecureStreamSocket 接続に関する問題を修正。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* データを含む plain&#95;rewritable ディスクの読み込み処理を修正。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* MergeTree の Wide パーツにおける動的サブカラム検出時に発生するクラッシュを修正。 [#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル名の長さは、最初の `CREATE` クエリでのみ検証します。後方互換性の問題を避けるため、2 回目以降の `CREATE` では検証しません。 [#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* スパースカラムを持つテーブルで、いくつかのケースにおいて発生していた `Block structure mismatch` エラーを修正しました。 [#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* 「Logical Error: Can&#39;t set alias of * of Asterisk on alias」が発生する 2 つのケースを修正。 [#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano)).
* Atomic データベースの名前変更時に誤ったパスが使用される問題を修正。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach)).
* JSON列と他の列を組み合わせた `ORDER BY` の動作を修正。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* `use_hedged_requests` と `allow_experimental_parallel_reading_from_replicas` の両方が無効な場合に、remote から読み取る際に発生していた結果の重複を修正しました。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa))。
* Unity Catalog 使用時の delta-kernel 実装で発生するクラッシュを修正。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 自動検出クラスター用のマクロを解決するようにしました。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 誤って設定された page&#95;cache&#95;limits を適切に処理するようにしました。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 可変長フォーマッタ（例: `%W`、曜日の `Monday` や `Tuesday` など）の後に、複合フォーマッタ（複数の要素を一度に出力するフォーマッタ、例: `%D`、米国形式の日付 `05/04/25` など）が続く場合における SQL 関数 `formatDateTime` の結果を修正します。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze))。
* IcebergS3 は count の最適化をサポートしますが、IcebergS3Cluster はサポートしません。その結果、クラスターモードで返される count() の結果が、レプリカ数の倍数になる場合があります。 [#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear))。
* クエリの実行で、投影までどの列も使用されない場合に、遅延マテリアライゼーションで発生していた AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正しました。例: SELECT * FROM t ORDER BY rand() LIMIT 5。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926) ([Igor Nikonov](https://github.com/devcrafter))。
* クエリ `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` に含まれるパスワードをマスクしました。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* JOIN USING でエイリアスを指定できるようにしました。列名が変更された場合（例: ARRAY JOIN による変更など）には、このエイリアスを使用します。[#73707](https://github.com/ClickHouse/ClickHouse/issues/73707) を修正。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `UNION` を含むマテリアライズドビューが新しいレプリカでも正しく動作するようにしました。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma))。
* SQL 関数 `parseDateTime` の書式指定子 `%e` は、これまでは空白でパディングされた日付（例: ` 3`）のみを受け付けていましたが、現在は 1 桁の日（例: `3`）も認識するようになりました。これにより、MySQL と同じ動作になります。以前の動作を維持するには、設定 `parsedatetime_e_requires_space_padding = 1` を有効にしてください。（issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)）。[#80057](https://github.com/ClickHouse/ClickHouse/pull/80057)（[Robert Schulze](https://github.com/rschu1ze)）。
* ClickHouse のログに出力される `Cannot find 'kernel' in '[...]/memory.stat'` という警告を修正しました（issue [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* FunctionComparison でスタックサイズをチェックし、スタックオーバーフローによるクラッシュを回避します。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* `system.workloads` からの SELECT 実行時に発生するレースコンディションを修正。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修正: 分散クエリにおける遅延マテリアライゼーション。[#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* `Array(Bool)` から `Array(FixedString)` への変換を修正しました。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat)).
* Parquet バージョンの選択を分かりにくくならないよう改善しました。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* `ReservoirSampler` の自己マージ処理を修正。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat))。
* クライアントコンテキストにおける挿入テーブルのストレージ処理を修正。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `AggregatingSortedAlgorithm` と `SummingSortedAlgorithm` のデータメンバーの破棄順序を修正。 [#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat))。
* `enable_user_name_access_type` は `DEFINER` アクセスタイプに影響を与えてはなりません。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* `system` データベースのメタデータが Keeper 上にある場合に、`system` データベースへのクエリがハングすることがある問題を修正しました。[#79304](https://github.com/ClickHouse/ClickHouse/pull/79304)（[Mikhail Artemenko](https://github.com/Michicosun)）。

#### ビルド/テスト/パッケージングの改善

- ビルド済みの`chcache`バイナリを常に再ビルドせず再利用できるようにしました。[#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- NATS一時停止待機を追加しました。[#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
- ARMビルドをamd64compatとして誤って公開していた問題を修正しました。[#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger))。
- OpenSSL用に事前生成されたアセンブリを使用するようにしました。[#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `clang20`でのビルドを可能にする修正を行いました。[#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `chcache`: Rustキャッシングサポートを追加しました。[#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `zstd`アセンブリファイルにアンワインド情報を追加しました。[#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321))。

### ClickHouseリリース 25.4, 2025-04-22 {#254}

#### 後方互換性のない変更

- `allow_materialized_view_with_bad_select`が`false`の場合に、マテリアライズドビューのすべてのカラムがターゲットテーブルと一致するかをチェックするようにしました。[#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm))。
- `dateTrunc`が負のDate/DateTime引数で使用される場合の問題を修正しました。[#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
- レガシーの`MongoDB`統合が削除されました。サーバー設定`use_legacy_mongodb_integration`は廃止され、現在は何も行いません。[#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze))。
- パーティションキーまたはソートキーで使用されるカラムの集計をスキップするように`SummingMergeTree`の検証を強化しました。[#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。


#### 新機能

* ワークロード向けの CPU スロットスケジューリングを追加しました。詳細は[ドキュメント](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)を参照してください。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* `--path` コマンドライン引数を指定すると、`clickhouse-local` は再起動後もデータベースを保持します。これにより [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647) がクローズされます。[#49947](https://github.com/ClickHouse/ClickHouse/issues/49947) もクローズされます。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* サーバーが過負荷のときにクエリを拒否します。判定は、待ち時間（`OSCPUWaitMicroseconds`）とビジー時間（`OSCPUVirtualTimeMicroseconds`）の比率に基づいて行われます。この比率が `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` の間にある場合（いずれもクエリレベルの設定）、一定の確率でクエリがドロップされます。 [#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* `Iceberg` のタイムトラベル: 特定のタイムスタンプ時点の `Iceberg` テーブルをクエリできる設定を追加しました。 [#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* `Iceberg` メタデータ用のインメモリキャッシュで、クエリを高速化するためにマニフェストファイル／リストおよび `metadata.json` を格納します。 [#77156](https://github.com/ClickHouse/ClickHouse/pull/77156) ([Han Fei](https://github.com/hanfei1991)).
* Azure Blob Storage 向けの `DeltaLake` テーブルエンジンをサポートしました。[#68043](https://github.com/ClickHouse/ClickHouse/issues/68043) を修正。 [#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* デシリアライズ済みのベクトル類似性インデックス用にインメモリキャッシュを追加しました。これにより、繰り返し実行される近似最近傍 (ANN) 検索クエリの速度が向上します。新しいキャッシュのサイズは、サーバー設定 `vector_similarity_index_cache_size` および `vector_similarity_index_cache_max_entries` で制御されます。この機能は、以前のリリースに存在したスキッピングインデックスキャッシュ機能に置き換わるものです。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905) ([Shankar Iyer](https://github.com/shankar-iyer)).
* DeltaLake でパーティションプルーニングをサポートしました。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 読み取り専用の `MergeTree` テーブルに対するバックグラウンドリフレッシュをサポート。この機能により、無制限数の分散リーダーから更新可能なテーブルをクエリできるようになりました（ClickHouse ネイティブなデータレイク）。 [#76467](https://github.com/ClickHouse/ClickHouse/pull/76467) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* データベースのメタデータファイルを保存するためにカスタムディスクを使用できるようになりました。現在、これはサーバー全体のレベルでのみ設定できます。 [#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach))。
* plain&#95;rewritable ディスクで ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION をサポート。 [#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva)).
* `Kafka` テーブルエンジンに、`SASL` の設定および認証情報用のテーブル設定を追加しました。これにより、構成ファイルや名前付きコレクションを使用することなく、CREATE TABLE 文内で Kafka および Kafka 互換システムへの SASL ベース認証を直接設定できるようになります。[#78810](https://github.com/ClickHouse/ClickHouse/pull/78810)（[Christoph Wurm](https://github.com/cwurm)）。
* MergeTree テーブルに対して `default_compression_codec` を設定できるようにしました。これは、CREATE クエリで対象カラムに圧縮コーデックが明示的に定義されていない場合に使用されます。これにより [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005) がクローズされました。 [#66394](https://github.com/ClickHouse/ClickHouse/pull/66394) ([gvoelfin](https://github.com/gvoelfin))。
* ClickHouse が分散接続に特定のネットワークを使用できるようにするため、クラスタ設定に `bind_host` 設定を追加しました。 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum)).
* `system.tables` に新しいカラム `parametrized_view_parameters` を追加しました。 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756) をクローズしました。 [#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* データベースコメントの変更を許可。[#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) をクローズ。 ### ユーザー向け変更のドキュメント項目。[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* PostgreSQL 互換プロトコルで `SCRAM-SHA-256` 認証をサポート。 [#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12)).
* 関数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted`、`arraySimilarity` を追加。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 設定 `parallel_distributed_insert_select` は、`ReplicatedMergeTree` への `INSERT SELECT` にも適用されるようになりました（以前は Distributed テーブルが必要でした）。[#78041](https://github.com/ClickHouse/ClickHouse/pull/78041)（[Igor Nikonov](https://github.com/devcrafter)）。
* `toInterval` 関数を導入。 この関数は 2 つの引数（値と単位）を受け取り、その値を特定の `Interval` 型に変換します。 [#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* iceberg テーブル関数およびエンジンに、ルート `metadata.json` ファイルを解決するための便利な方法を複数追加。[#78455](https://github.com/ClickHouse/ClickHouse/issues/78455) をクローズ。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* ClickHouse の SSH プロトコルでパスワードベースの認証をサポートしました。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 実験的機能
* `WHERE` 句内の `EXISTS` 式の引数として、相関サブクエリをサポートしました。[#72459](https://github.com/ClickHouse/ClickHouse/issues/72459) をクローズ。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `sparseGrams` と `sparseGramsHashes` に ASCII 版と UTF8 版を追加しました。作者: [scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。使用しないでください。実装は今後のバージョンで変更されます。



#### パフォーマンスの向上

* `ORDER BY` および `LIMIT` の後にデータを読み込む lazy columns を使用してパフォーマンスを最適化します。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* クエリ条件キャッシュがデフォルトで有効になりました。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `col->insertFrom()` への呼び出しを非仮想化することで、JOIN 結果の構築を高速化しました。 [#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger)).
* フィルタークエリプランステップの等価条件を、可能な場合は JOIN 条件にマージし、ハッシュテーブルキーとして利用できるようにしました。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd))。
* 両方のパートで JOIN キーが PK のプレフィックスである場合、JOIN に動的シャーディングを使用します。この最適化は `query_plan_join_shard_by_pk_ranges` 設定で有効化できます（デフォルトでは無効）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* カラムの下限値および上限値に基づく `Iceberg` データプルーニングをサポートしました。 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638) を修正。 [#78242](https://github.com/ClickHouse/ClickHouse/pull/78242) ([alesapin](https://github.com/alesapin))。
* `Iceberg` に対して単純な count 最適化を実装しました。これにより、フィルタのない `count()` のみを含むクエリはより高速になります。[#77639](https://github.com/ClickHouse/ClickHouse/issues/77639) をクローズします。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* `max_merge_delayed_streams_for_parallel_write` を使用して、マージ処理で並列にフラッシュできるカラム数を構成できるようにしました（これにより、S3 への垂直マージのメモリ使用量がおよそ 25 分の1になります）。[#77922](https://github.com/ClickHouse/ClickHouse/pull/77922)（[Azat Khuzhin](https://github.com/azat)）。
* マージなどでキャッシュが受動的に使用される場合は、`filesystem_cache_prefer_bigger_buffer_size` を無効化します。これにより、マージ時のメモリ消費量が抑えられます。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 並列レプリカによる読み取りが有効な場合、タスクサイズの決定にレプリカ数を使用するようになりました。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間でより適切に負荷が分散されます。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat)).
* `ORC` フォーマットで非同期 IO プリフェッチをサポートし、リモート IO レイテンシーを隠蔽することで全体的なパフォーマンスを向上させました。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 非同期挿入で使用されるメモリを事前に割り当ててパフォーマンスを向上。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* `multiRead` が利用可能な箇所では単一の `get` リクエストの使用をやめることで、Keeper へのリクエスト数を削減しました。これは、レプリカ数の増加に伴い Keeper への負荷が大きくなり得たためです。 [#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* Nullable 引数に対して関数を実行する際のごく小さな最適化。 [#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* `arraySort` を最適化。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li))。
* 同一パーツのマークをマージし、一度にクエリ条件キャッシュへ書き込むことで、ロックの使用を削減します。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 1 回のブラケット展開を含むクエリに対して、`s3Cluster` のパフォーマンスを最適化しました。 [#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis)).
* Nullable または LowCardinality の単一カラムでの ORDER BY の最適化。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li)).
* `Native` フォーマットのメモリ使用を最適化しました。 [#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat))。
* 軽微な最適化: 型キャストが必要な場合は `count(if(...))` を `countIf` に書き換えないようにしました。[#78564](https://github.com/ClickHouse/ClickHouse/issues/78564) をクローズしました。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 関数で `tokenbf_v1`、`ngrambf_v1` の全文スキップインデックスを利用できるようになりました。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus)).
* ベクトル類似度インデックスがメインメモリを最大 2 倍まで過剰に確保してしまう可能性がありました。この修正ではメモリ割り当て戦略を見直し、メモリ消費量を削減するとともに、ベクトル類似度インデックスキャッシュの有効性を向上させました。(issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)). [#78394](https://github.com/ClickHouse/ClickHouse/pull/78394) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `system.metric_log` テーブルに対してスキーマ種別を指定する設定 `schema_type` を導入しました。利用可能なスキーマは3種類あります。`wide` — 現在のスキーマで、各メトリクス/イベントが個別のカラムに格納されます（個々のカラムの読み取りに最も適しています）、`transposed` — `system.asynchronous_metric_log` と同様に、メトリクス/イベントが行として格納されます。そして最も興味深い `transposed_with_wide_view` — 内部テーブルは `transposed` スキーマで作成しつつ、クエリを内部テーブルに変換して実行する `wide` スキーマのビューも作成します。`transposed_with_wide_view` ではビューに対するサブ秒精度での時刻表現はサポートされておらず、`event_time_microseconds` は後方互換性のためのエイリアスに過ぎません。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin)).





#### 改善

* `Distributed` クエリのクエリプランをシリアライズします。新しい設定 `serialize_query_plan` が追加されました。有効化すると、`Distributed` テーブルに対するクエリは、リモートクエリ実行時にシリアライズ済みのクエリプランを使用します。これにより TCP プロトコルに新しいパケットタイプが導入されます。このパケットを処理できるようにするには、サーバー設定に `<process_query_plan_packet>true</process_query_plan_packet>` を追加する必要があります。[#69652](https://github.com/ClickHouse/ClickHouse/pull/69652)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* ビューからの `JSON` 型およびサブカラムの読み取りをサポートしました。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar))。
* ALTER DATABASE ... ON CLUSTER をサポート。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* リフレッシュ可能なマテリアライズドビューの更新が、`system.query_log` に記録されるようになりました。 [#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321))。
* ユーザー定義関数 (UDF) は、その設定内の新しいオプションによって決定論的であるとマークできるようになりました。また、クエリキャッシュは、クエリ内で呼び出される UDF が決定論的かどうかを確認するようになりました。決定論的である場合、そのクエリ結果がキャッシュされます。(Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)). [#77769](https://github.com/ClickHouse/ClickHouse/pull/77769) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* あらゆる種類のレプリケートタスクに対してバックオフロジックを有効にしました。これにより、CPU 使用率、メモリ使用量、ログファイルサイズを削減できるようになります。`max_postpone_time_for_failed_mutations_ms` と同様の新しい設定 `max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms`、`max_postpone_time_for_failed_replicated_tasks_ms` を追加しました。 [#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.errors` に `query_id` を追加。 [#75815](https://github.com/ClickHouse/ClickHouse/issues/75815) をクローズ。 [#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* `UInt128` から `IPv6` への変換のサポートを追加しました。これにより、`IPv6` に対する `bitAnd` 演算および算術演算と、`IPv6` への再変換が可能になります。[#76752](https://github.com/ClickHouse/ClickHouse/issues/76752) をクローズします。これにより、`IPv6` に対する `bitAnd` 演算の結果も `IPv6` に再変換できるようになります。[#57707](https://github.com/ClickHouse/ClickHouse/pull/57707) も参照してください。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* デフォルトでは、`Variant` 型内のテキスト形式で特別な `Bool` 値をパースしないようにしました。設定 `allow_special_bool_values_inside_variant` を有効にすることで、この挙動を変更できます。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* セッションレベルおよびサーバーレベルで、低い `priority` を持つクエリについて、タスクごとの待機時間を設定できるようにしました。 [#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* JSON データ型の値に対する比較を実装しました。これにより、JSON オブジェクトを Map と同様に比較できるようになりました。 [#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar))。
* `system.kafka_consumers` による権限サポートを改善。内部の `librdkafka` エラーを転送（なお、このライブラリがひどいものであることは言及しておきます）。 [#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* Buffer テーブルエンジンの設定に対する検証を追加しました。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `HDFS` での `pread` の有効／無効を切り替えるための設定 `enable_hdfs_pread` を追加。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou)).
* ZooKeeper の `multi` 読み取りおよび書き込みリクエスト数用の profile event を追加。[#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* `disable_insertion_and_mutation` が有効な場合でも、一時テーブルの作成および挿入を許可するようにしました。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* `max_insert_delayed_streams_for_parallel_write` を減少（100 に設定）。[#77919](https://github.com/ClickHouse/ClickHouse/pull/77919)（[Azat Khuzhin](https://github.com/azat)）。
* Joda 構文（もし気になっていれば、これは Java の世界の話です）における `yyy` のような年のパースを修正しました。 [#77973](https://github.com/ClickHouse/ClickHouse/pull/77973) ([李扬](https://github.com/taiyang-li))。
* `MergeTree` テーブルのパーツのアタッチはブロック順で実行されるようになりました。これは、`ReplacingMergeTree` のような特殊なマージアルゴリズムにとって重要です。これにより [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009) が解決されました。 [#77976](https://github.com/ClickHouse/ClickHouse/pull/77976) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* クエリマスキングルールは、マッチが発生した場合に `LOGICAL_ERROR` をスローできるようになりました。これにより、あらかじめ定義したパスワードがログのどこかに漏洩していないかを確認しやすくなります。 [#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* MySQL との互換性を高めるため、`information_schema.tables` に列 `index_length_column` を追加しました。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 新しいメトリクス `TotalMergeFailures` と `NonAbortedMergeFailures` を追加しました。これらのメトリクスは、短期間に過度に多くのマージが失敗しているケースを検知するために使用されます。 [#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* パススタイルでキーが指定されていない場合の S3 URL の誤った解析を修正。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos))。
* `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime`、`BlockReadTime` の非同期メトリクスにおける誤った値を修正（この変更以前は、1 秒が誤って 0.001 と報告されていた）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov))。
* StorageS3(Azure)Queue のマテリアライズドビューへのプッシュ中に発生するエラーに対して `loading_retries` の上限を適用するようにしました。これまではそのようなエラーは無制限にリトライされていました。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `delta-kernel-rs` 実装を用いた DeltaLake において、パフォーマンスと進行状況バーを改善しました。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ランタイムディスクで `include`、`from_env`、`from_zk` をサポート。[#78177](https://github.com/ClickHouse/ClickHouse/issues/78177) をクローズ。[#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 長時間実行中のミューテーションに対して、`system.warnings` テーブルに動的な警告を追加しました。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* `system.query_condition_cache` システムテーブルに `condition` フィールドを追加しました。これは、クエリ条件キャッシュでキーとして使用されるハッシュの元になるプレーンテキストの条件式を保持します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* Hive のパーティション分割で空値を許可。[#78816](https://github.com/ClickHouse/ClickHouse/pull/78816)（[Arthur Passos](https://github.com/arthurpassos)）。
* `BFloat16` に対する `IN` 句の型変換を修正しました（これにより、`SELECT toBFloat16(1) IN [1, 2, 3];` は現在 `1` を返します）。[#78754](https://github.com/ClickHouse/ClickHouse/issues/78754) をクローズします。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `disk = ...` が設定されている場合、`MergeTree` で他のディスク上にあるパーツはチェックしないようにしました。 [#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* `system.query_log` の `used_data_type_families` において、データ型が正規名で記録されるようにしました。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` 中のクリーンアップ設定を、[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様に行うようにしました。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* INFILE のスキーマ推論に挿入カラムを使用するようにしました。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 集計プロジェクションで `count(Nullable)` が使用される場合の誤ったプロジェクション解析を修正しました。これにより [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495) が解決されます。この PR では、プロジェクションが使用される理由／使用されない理由を明確にするために、プロジェクション解析に関するログもいくつか追加しています。 [#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* `DETACH PART` 実行中に発生する `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` エラーを修正。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* アナライザにおいてリテラルを含む式を持つスキップインデックスが正しく動作しない問題を修正し、インデックス解析時に自明なキャストを削除しました。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* `close_session` クエリパラメータがまったく効果を持たず、その結果、名前付きセッションが `session_timeout` 後にのみクローズされていたバグを修正しました。 [#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats)).
* NATS サーバーから、紐づく Materialized View がない状態でもメッセージを受信できるように修正しました。 [#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 空の `FileLog` を `merge` テーブル関数経由で読み取る際に発生する論理エラーを修正し、[#75575](https://github.com/ClickHouse/ClickHouse/issues/75575) をクローズ。 [#77441](https://github.com/ClickHouse/ClickHouse/pull/77441) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 共有バリアントの `Dynamic` シリアル化でデフォルトのフォーマット設定を使用するようにしました。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar))。
* ローカルディスク上でテーブルデータパスの存在を確認する処理を修正しました。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 一部の型で、リモートへの定数値の送信を修正しました。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* S3/AzureQueue において、期限切れのコンテキストが原因で発生するクラッシュを修正。 [#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* RabbitMQ、Nats、Redis、AzureQueue テーブルエンジンで認証情報をマスクするようにしました。 [#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `argMin`/`argMax` における `NaN` 比較時の未定義動作を修正。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* マージとミューテーションについて、書き込むブロックが一切生成されない場合でも、定期的にキャンセルされていないかを確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Replicated データベースにおいて、新しく追加されたレプリカで refreshable なマテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* `NOT_FOUND_COLUMN_IN_BLOCK` エラー発生時にクラッシュが起こり得る問題を修正しました。 [#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データ投入中に S3/AzureQueue で発生するクラッシュを修正。 [#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* SSH サーバーで履歴のあいまい検索を無効化しました（`skim` ライブラリが必要なため）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* テーブル内にベクトル類似性インデックスが定義された別のベクトル列が存在する場合に、インデックス未作成の列に対するベクトル検索クエリが誤った結果を返していたバグを修正しました。（Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978)）。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* ごく小さなエラー「The requested output format {} is binary... Do you want to output it anyway? [y/N]」というプロンプトを修正。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* `toStartOfInterval` の origin 引数が 0 の場合のバグを修正。 [#78096](https://github.com/ClickHouse/ClickHouse/pull/78096) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* HTTP インターフェイスで空の `session_id` クエリパラメータを指定できないようにしました。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* `ALTER` クエリの直後に実行された `RENAME` クエリが原因で発生する可能性のあった、`Replicated` データベースにおけるメタデータの上書き問題を修正しました。 [#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique))。
* `NATS` エンジンで発生するクラッシュを修正。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 埋め込みクライアントでは `history_file` を作成しようとしないようにしました（以前のバージョンでは、作成は常に失敗していたものの、作成を試みていました）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* `RENAME DATABASE` または `DROP TABLE` クエリの実行後に `system.detached_tables` が誤った情報を表示する問題を修正しました。 [#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique)).
* [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) 適用後の `Replicated` データベースに対するテーブル数上限チェックを修正しました。また、`ReplicatedMergeTree` や `KeeperMap` の場合に Keeper 内に未計上のノードが作成されるのを避けるため、ストレージを作成する前にチェックを実行するようにしました。 [#78127](https://github.com/ClickHouse/ClickHouse/pull/78127) ([Nikolay Degterinsky](https://github.com/evillique))。
* 同時実行される `S3Queue` メタデータ初期化により発生し得るクラッシュを修正しました。 [#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 関数は、`max_size` 引数が Int 型で値が 0 の場合に、その値で実行を試みるのではなく、これまで UInt 型に対して行っていたのと同様に `BAD_ARGUMENTS` エラーを返すようになりました。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa))。
* ローカルテーブルがデタッチされる前に削除されていた場合に、失われたレプリカを復旧する処理で発生していたクラッシュを防止。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano))。
* `system.s3_queue_settings` の「alterable」カラムが常に `false` を返していた問題を修正しました。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure のアクセス署名がユーザーやログに表示されないようにマスクしました。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Wide パーツにおける接頭辞付きサブストリームのプリフェッチ処理を修正しました。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* キー配列の型が `LowCardinality(Nullable)` の場合に発生していた `mapFromArrays` のクラッシュおよび誤った結果を修正しました。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* delta-kernel-rs の認証オプションを修正。[#78255](https://github.com/ClickHouse/ClickHouse/pull/78255)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* レプリカの `disable_insertion_and_mutation` が true の場合、Refreshable Materialized Views のタスクをスケジュールしないようにしました。タスクは挿入処理であり、`disable_insertion_and_mutation` が true の場合には失敗してしまいます。 [#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* `Merge` エンジンが参照する基盤テーブルへのアクセスを検証します。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `Distributed` テーブルをクエリする際には、`FINAL` 修飾子を無視します。 [#78428](https://github.com/ClickHouse/ClickHouse/pull/78428) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `bitmapMin` は、ビットマップが空の場合に uint32&#95;max（入力型がより大きい場合は uint64&#95;max）を返します。これは、空の roaring&#95;bitmap における最小値の動作と一致します。 [#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear)).
* `distributed_aggregation_memory_efficient` が有効な場合に、FROM 句読み込み直後のクエリ処理の並列化を無効化しました。これにより論理エラーが発生する可能性があったためです。 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934) をクローズしました。 [#78500](https://github.com/ClickHouse/ClickHouse/pull/78500) ([flynn](https://github.com/ucasfl))。
* `max_streams_to_max_threads_ratio` 設定を適用した結果、計画されたストリーム数が 0 になる場合に備えて、少なくとも 1 つの読み取りストリームが確保されるようにしました。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `S3Queue` において、論理エラー「Cannot unregister: table uuid is not registered」を修正しました。[#78285](https://github.com/ClickHouse/ClickHouse/issues/78285) をクローズ。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ClickHouse は、cgroups v1 と v2 の両方が有効になっているシステムで、自身が属する cgroup v2 を判別できるようになりました。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* `-Cluster` テーブル関数は、テーブルレベルの設定と併用した場合に失敗していました。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik)).
* INSERT 時に ReplicatedMergeTree がトランザクションをサポートしていない場合の検査をより厳密に実施。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* アタッチ時にクエリ設定を整理。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* `iceberg_metadata_file_path` に無効なパスが指定された場合にクラッシュする問題を修正しました。 [#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* `DeltaLake` テーブルエンジンの delta-kernel-s 実装において、読み取りスキーマがテーブルスキーマと異なり、かつパーティション列が存在する場合に「not found column」エラーが発生する問題を修正。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 名前付きセッションをクローズするようスケジュールした後（タイムアウトが切れる前のタイミングで）、同じ名前の新しい名前付きセッションを作成すると、最初のセッションがクローズされるはずだった時点で新しいセッションまでクローズされてしまう問題を修正しました。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* `MongoDB` エンジンまたは `mongodb` テーブル関数を使用するテーブルから読み取る、いくつかの種類の `SELECT` クエリの動作を修正しました。対象は、`WHERE` 句内で定数値の暗黙的な型変換を行うクエリ（例：`WHERE datetime = '2025-03-10 00:00:00'`）、および `LIMIT` と `GROUP BY` を含むクエリです。これらのクエリは、以前は誤った結果を返すことがありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* `CHECK TABLE` 実行中にテーブルのシャットダウンがブロックされないようにしました。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper の修正: すべてのケースでの ephemeral count を修正。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* `view` 以外のテーブル関数を使用したときに `StorageDistributed` で発生していた不正なキャストを修正。[#78464](https://github.com/ClickHouse/ClickHouse/issues/78464) をクローズ。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `tupleElement(*, 1)` のフォーマットの一貫性を修正。 [#78639](https://github.com/ClickHouse/ClickHouse/issues/78639) をクローズ。 [#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `ssd_cache` 型のディクショナリでは、ゼロまたは負の `block_size` および `write_buffer_size` パラメータは拒否されるようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 不正なシャットダウン後に `ALTER` を実行した際に発生する Refreshable MATERIALIZED VIEW のクラッシュを修正。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* `CSV` フォーマットにおける不正な `DateTime` 値のパース処理を修正しました。 [#78919](https://github.com/ClickHouse/ClickHouse/pull/78919) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper の修正: 失敗した multi リクエストで watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* min-max の値が明示的に指定されているにもかかわらず `NULL` の場合に、Iceberg テーブルの読み取りが失敗する問題を修正しました。Go Iceberg ライブラリがこのような問題のあるファイルを生成してしまうことがあることが判明しました。[#78740](https://github.com/ClickHouse/ClickHouse/issues/78740) をクローズ。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764) ([flynn](https://github.com/ucasfl))。

#### ビルド/テスト/パッケージングの改善

- RustでCPUターゲット機能を考慮し、すべてのクレートでLTOを有効化しました。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano)).

### ClickHouse リリース 25.3 LTS, 2025-03-20 {#253}

#### 後方互換性のない変更

- レプリケートされたデータベースのトランケートを禁止しました。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc)).
- スキッピングインデックスキャッシュを元に戻しました。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).


#### 新機能

* `JSON` データ型は本番環境で利用可能です。 [https://jsonbench.com/](https://jsonbench.com/) を参照してください。`Dynamic` および `Variant` データ型も本番環境で利用可能です。 [#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* clickhouse-server 向けの SSH プロトコルを導入しました。これにより、任意の SSH クライアントを使用して ClickHouse に接続できるようになりました。これにより次の Issue がクローズされました: [#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 並列レプリカが有効な場合は、テーブル関数を対応する -Cluster 版に置き換えます。[#65024](https://github.com/ClickHouse/ClickHouse/issues/65024) を修正。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache の新しい実装。これにより、OS のページキャッシュに依存せず、プロセス内メモリにデータをキャッシュできるようになります。これは、データがローカルファイルシステムキャッシュを伴わないリモートの仮想ファイルシステム上に保存されている場合に有用です。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 同時実行クエリ間での CPU スロットの割り当て方法を制御するサーバー設定 `concurrent_threads_scheduler` を追加しました。`round_robin`（これまでの動作）または `fair_round_robin` を設定でき、INSERT と SELECT 間での CPU 割り当ての不公平さの問題に対処します。 [#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* `estimateCompressionRatio` 集約関数を追加。 [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。 [#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 関数 `arraySymmetricDifference` を追加しました。これは複数の配列引数に対して、すべての引数に共通して出現しない要素をすべて返します。例: `SELECT arraySymmetricDifference([1, 2], [2, 3])` は `[1, 3]` を返します。(issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673))。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* Iceberg 用に読み取るメタデータファイルを、ストレージ/テーブル関数設定 `iceberg_metadata_file_path` で明示的に指定できるようにしました。 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412) を修正。 [#77318](https://github.com/ClickHouse/ClickHouse/pull/77318) ([alesapin](https://github.com/alesapin))。
* ブロックチェーン実装、特に EVM ベースのシステムで広く利用されている `keccak256` ハッシュ関数を追加しました。 [#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche)).
* 3 つの新しい関数を追加しました。仕様に準拠した `icebergTruncate`（[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details) を参照）、`toYearNumSinceEpoch`、`toMonthNumSinceEpoch` です。`Iceberg` エンジンのパーティションプルーニングにおいて `truncate` トランスフォームをサポートしました。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403)（[alesapin](https://github.com/alesapin)）。
* `LowCardinality(Decimal)` データ型をサポートしました [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833)（[zhanglistar](https://github.com/zhanglistar)）。
* `FilterTransformPassedRows` と `FilterTransformPassedBytes` のプロファイルイベントは、クエリ実行中にフィルタリングされた行数とバイト数を示します。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar)).
* ヒストグラムメトリクスタイプのサポート。インターフェイスは Prometheus クライアントにきわめてよく似ており、値に対応するバケット内のカウンターを増やすには、単に `observe(value)` を呼び出すだけです。ヒストグラムメトリクスは `system.histogram_metrics` 経由で公開されます。 [#75736](https://github.com/ClickHouse/ClickHouse/pull/75736) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 明示的な値に対して `CASE` で非定数を扱えるようにした。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。



#### 実験的機能
* AWS S3 およびローカルファイルシステム上の DeltaLake テーブル向けに、[Unity Catalog](https://www.databricks.com/product/unity-catalog) のサポートを追加しました。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988)（[alesapin](https://github.com/alesapin)）。
* Iceberg テーブル向けに AWS Glue サービスカタログとの実験的な統合を追加しました。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257)（[alesapin](https://github.com/alesapin)）。
* 動的なクラスタ自動検出のサポートを追加しました。これは既存の _node_ 自動検出機能を拡張するものです。ClickHouse は、`<multicluster_root_path>` を使用して共通の ZooKeeper パス配下で新しい _clusters_ を自動的に検出および登録できるようになりました。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 新しい設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` により、設定可能なタイムアウト経過後にパーティション全体の自動クリーンアップマージを実行できるようになりました。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440)（[Christoph Wurm](https://github.com/cwurm)）。



#### パフォーマンス改善
* 繰り返し利用される条件に対してクエリ条件キャッシュを実装し、クエリのパフォーマンスを向上しました。条件を満たさないデータ部分の範囲を、メモリ上の一時インデックスとして記憶します。後続のクエリではこのインデックスを利用します。[#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236)（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツ削除時に、キャッシュからデータを積極的に削除するようにしました。データ量が少ない場合に、キャッシュが最大サイズまで肥大化しないようにします。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 算術計算において `Int256` と `UInt256` を clang 組み込みの `i256` に置き換え、パフォーマンスを改善しました。[#70502](https://github.com/ClickHouse/ClickHouse/issues/70502) [#73658](https://github.com/ClickHouse/ClickHouse/pull/73658)（[李扬](https://github.com/taiyang-li)）。
* 一部のケース（例: 空の配列カラム）では、データパーツに空ファイルが含まれることがあります。テーブルがメタデータとオブジェクトストレージが分離されたディスク上にある場合、そのようなファイルについては空の blob の書き込みをスキップし、そのメタデータのみを保存できるようにしました。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860)（[Alexander Gololobov](https://github.com/davenger)）。
* `Decimal32` / `Decimal64` / `DateTime64` の min/max 処理のパフォーマンスを改善しました。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570)（[李扬](https://github.com/taiyang-li)）。
* クエリコンパイル（設定 `compile_expressions`）がマシンタイプを考慮するようになりました。これにより、そのようなクエリが大幅に高速化されます。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753)（[ZhangLiStar](https://github.com/zhanglistar)）。
* `arraySort` を最適化しました。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850)（[李扬](https://github.com/taiyang-li)）。
* キャッシュがマージなどで受動的に使用されている場合、`filesystem_cache_prefer_bigger_buffer_size` を無効化しました。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* コードの一部で `preserve_most` 属性を適用し、わずかに良いコード生成を可能にしました。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778)（[Nikita Taranov](https://github.com/nickitat)）。
* ClickHouse サーバーのシャットダウンを高速化しました（2.5 秒の遅延を解消）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550)（[Azat Khuzhin](https://github.com/azat)）。
* `ReadBufferFromS3` およびその他のリモート読み取りバッファにおける不要なメモリアロケーションを回避し、それらのメモリ消費を半分に削減しました。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692)（[Sema Checherinda](https://github.com/CheSema)）。
* zstd を 1.5.5 から 1.5.7 に更新しました。これにより、いくつかの[パフォーマンス改善](https://github.com/facebook/zstd/releases/tag/v1.5.7)が見込まれます。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* Wide parts における JSON カラムのプリフェッチ時のメモリ使用量を削減しました。これは、ClickHouse Cloud のような共有ストレージ上で ClickHouse を使用する場合に有効です。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640)（[Pavel Kruglov](https://github.com/Avogar)）。



#### 改善

* `INTO OUTFILE` と併用される `TRUNCATE` でアトミックなリネームをサポートしました。 [#70323](https://github.com/ClickHouse/ClickHouse/issues/70323) を解決します。 [#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 設定での浮動小数点値として `NaN` や `inf` を使用することは、もはやできません。もっとも、これまでそれに意味があったわけでもありませんが。 [#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `compatibility` 設定に関係なく、analyzer が無効な場合は parallel replicas をデフォルトで無効にします。この挙動は、`parallel_replicas_only_with_analyzer` を明示的に `false` に設定することで変更できます。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter)).
* クライアントリクエストのヘッダーから外部 HTTP 認証器に転送するヘッダーのリストを定義できる機能を追加しました。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* タプルカラム内のフィールドに対して、カラム名の大文字小文字を区別しないマッチングが尊重されるようにしました。[https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324) をクローズしました。[#73780](https://github.com/ClickHouse/ClickHouse/pull/73780)（[李扬](https://github.com/taiyang-li)）。
* 今後は、コーデック Gorilla のパラメータが常に .sql ファイル内のテーブルメタデータに保存されるようになりました。これにより次の問題が解決されます: [#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 特定のデータレイク向けにパース機能を強化しました（シーケンス ID のパース：マニフェストファイル内のシーケンス識別子をパースする機能を追加、Avro メタデータのパース：将来の拡張が容易になるよう Avro メタデータパーサーを再設計）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik))。
* `system.opentelemetry_span_log` のデフォルトの ORDER BY から trace&#95;id を削除しました。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 暗号化（`encrypted_by` 属性）は、任意の設定ファイル（config.xml、users.xml、ネストされた設定ファイル）に適用できるようになりました。以前は、最上位の config.xml ファイルに対してのみ有効でした。 [#75911](https://github.com/ClickHouse/ClickHouse/pull/75911)（[Mikhail Gorshkov](https://github.com/mgorshkov)）。
* `system.warnings` テーブルを改善し、追加・更新・削除が可能な動的な警告メッセージをいくつか追加しました。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc)).
* このPRにより、`ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES` というクエリは実行できなくなりました。すべての `DROP` 操作は順序として先に記述されていなければならないためです。 [#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit)).
* SYNC REPLICA に対するさまざまな強化（エラーメッセージの改善、テストの強化、サニティチェックの追加）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* `Access Denied` によりバックアップ中の S3 へのマルチパートコピーが失敗した場合に、正しいフォールバックを行うようにしました。異なるクレデンシャルを持つバケット間でバックアップを行うと、マルチパートコピーで `Access Denied` エラーが発生することがあります。 [#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368)).
* librdkafka（ろくでもない代物）をバージョン 2.8.0 にアップグレードしました（とはいえ、ろくでもなさは変わりません）。さらに Kafka テーブルのシャットダウン処理を改善し、テーブル削除やサーバー再起動時の遅延を削減しました。`engine=Kafka` は、テーブル削除時にコンシューマグループから明示的に離脱しなくなりました。その代わり、コンシューマは非アクティブ状態が `session_timeout_ms`（デフォルト: 45 秒）続いた後に、自動的にグループから削除されるまで残り続けます。 [#76621](https://github.com/ClickHouse/ClickHouse/pull/76621) ([filimonov](https://github.com/filimonov)).
* S3 リクエスト設定のバリデーションを修正しました。 [#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar)).
* `server_settings` や `settings` のようなシステムテーブルには、便利な `default` 値カラムがあります。これを `merge_tree_settings` と `replicated_merge_tree_settings` にも追加しました。 [#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie)).
* `CurrentMetrics::QueryPreempted` と同様のロジックを持つ `ProfileEvents::QueryPreempted` を追加しました。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu)).
* 以前は、Replicated データベースがクエリで指定された認証情報をログに出力してしまうことがありました。この動作は修正されました。これにより次の issue がクローズされました: [#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `plain_rewritable disk` に対して ALTER TABLE DROP PARTITION を実行できるようになりました。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* バックアップ/リストア設定 `allow_s3_native_copy` は、現在3つの値をサポートしています: - `False` - S3ネイティブコピーは使用されません; - `True` (旧デフォルト) - ClickHouseはまずS3ネイティブコピーを試行し、失敗した場合は読み取り+書き込み方式にフォールバックします; - `'auto'` (新デフォルト) - ClickHouseはまずソースと宛先の認証情報を比較します。同一の場合、ClickHouseはS3ネイティブコピーを試行し、その後読み取り+書き込み方式にフォールバックする可能性があります。異なる場合、ClickHouseは直接読み取り+書き込み方式を使用します。[#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* DeltaLake テーブルエンジンの delta kernel で、AWS セッショントークンと環境クレデンシャルの利用をサポートしました。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 非同期分散 INSERT の保留バッチ処理中に、`No such file or directory` などが原因で処理がハングしてしまう問題を修正しました。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* インデックス解析時の datetime 変換を、暗黙的な Date から DateTime への変換に飽和動作を強制することで改善しました。これにより、datetime の範囲制限によって発生しうるインデックス解析の不正確さが解消されます。この変更により [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307) が修正されました。また、デフォルト値である `date_time_overflow_behavior = 'ignore'` 設定時の明示的な `toDateTime` 変換も修正しました。 [#73326](https://github.com/ClickHouse/ClickHouse/pull/73326) ([Amos Bird](https://github.com/amosbird)).
* UUID とテーブル名の競合によって発生するあらゆる種類のバグを修正しました（たとえば、`RENAME` と `RESTART REPLICA` 間の競合を修正します。同時に `RENAME` と `SYSTEM RESTART REPLICA` を実行した場合、誤ったレプリカを再起動してしまったり、テーブルの一つが `Table X is being restarted` の状態のまま残ってしまう可能性があります）。 [#76308](https://github.com/ClickHouse/ClickHouse/pull/76308) ([Azat Khuzhin](https://github.com/azat)).
* 非同期挿入を有効にし、`insert into ... from file ...` を使用した際に、ブロックサイズが不揃いな場合に発生するデータ損失を修正しました。最初のブロックサイズが `async_max_size` 未満で、2番目のブロックサイズが `async_max_size` を超える場合、2番目のブロックが挿入されず、そのデータが `squashing` に残っていました。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* `system.data_skipping_indices` 内のフィールド名 &#39;marks&#39; を &#39;marks&#95;bytes&#39; にリネームしました。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* 動的ファイルシステムキャッシュのリサイズ時に、エビクション中に発生する予期しないエラーの処理を修正。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列ハッシュにおける `used_flag` の初期化を修正しました。これが原因でサーバーがクラッシュする可能性がありました。 [#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat))。
* `projection` 内で `defaultProfiles` 関数を呼び出す際に発生する論理エラーを修正。 [#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit)).
* Web UI でブラウザからインタラクティブな Basic 認証を要求しないようにしました。 [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319) をクローズ。 [#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 分散テーブルから boolean リテラルを選択した際に発生する `THERE_IS_NO_COLUMN` 例外を修正。 [#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* テーブルディレクトリ内のサブパスの選択方法が、より洗練されたものになりました。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik))。
* サブカラムを含む PK を持つテーブルを ALTER した後に発生するエラー `Not found column in block` を修正しました。[https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 以降、この修正には [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403) が必要です。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* null ショートサーキットのパフォーマンステストを追加し、バグを修正。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li))。
* 出力書き込みバッファをファイナライズする前にフラッシュするようにしました。いくつかの出力フォーマット（例: `JSONEachRowWithProgressRowOutputFormat`）のファイナライズ時に発生していた `LOGICAL_ERROR` を修正しました。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* MongoDB のバイナリ UUID のサポートを追加しました（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)）。- テーブル関数を使用する際の MongoDB への WHERE 句プッシュダウンを修正しました（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)）。- MongoDB のバイナリ UUID が ClickHouse の UUID にのみ解析されるように、MongoDB と ClickHouse 間の型マッピングを変更しました。これにより、将来的なあいまいさや予期しない動作を回避できるはずです。- 後方互換性を維持しつつ OID マッピングを修正しました。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* JSON サブカラムの並列プレフィックスデシリアライズにおける例外処理を修正。 [#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar)).
* 負の整数に対する `lgamma` 関数の動作を修正。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev))。
* 明示的に定義された主キーに対する逆順キー解析を修正します。[#76654](https://github.com/ClickHouse/ClickHouse/issues/76654) と類似。 [#76846](https://github.com/ClickHouse/ClickHouse/pull/76846)（[Amos Bird](https://github.com/amosbird)）。
* JSON 形式における Bool 値の整形表示を修正。[#76905](https://github.com/ClickHouse/ClickHouse/pull/76905)（[Pavel Kruglov](https://github.com/Avogar)）。
* 非同期挿入中のエラー時に、不正な JSON 列のロールバック処理が原因でクラッシュが発生する可能性があった問題を修正。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* これまで、`multiIf` はプランニング時とメイン実行時で異なる型のカラムを返す場合がありました。その結果、C++ の観点からは未定義動作となるコードが生成されていました。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914)（[Nikita Taranov](https://github.com/nickitat)）。
* MergeTree における定数 Nullable キーの誤ったシリアライゼーションを修正しました。これにより [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939) が解決されます。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* `BFloat16` の値のソートを修正しました。これにより [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487) がクローズされます。また [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669) もクローズされます。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パートの整合性チェックで一時的なサブカラムをスキップするチェックを追加することで、Variant サブカラムを含む JSON に関するバグを修正しました。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 型の不一致が発生した場合に Values フォーマットでのテンプレート解析中にクラッシュする問題を修正。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 主キーにサブカラムを含む EmbeddedRocksDB テーブルを作成できないようにしました。以前はそのようなテーブルを作成できましたが、`SELECT` クエリが失敗していました。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar)).
* リテラル型が考慮されないために、述語をリモートにプッシュダウンした際に分散クエリで発生する不正な比較を修正しました。 [#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94)).
* 例外発生時に Kafka テーブルの作成でクラッシュする問題を修正しました。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar))。
* Kafka および RabbitMQ エンジンで JSON とサブカラムをサポートしました。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar))。
* macOS上の例外スタックアンワインディングを修正。[#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa))。
* getSubcolumn 関数におけるサブカラム「null」の読み取りを修正。[#77163](https://github.com/ClickHouse/ClickHouse/pull/77163)（[Pavel Kruglov](https://github.com/Avogar)）。
* Bloom filter インデックスが `Array` 型および未サポートの関数で正しく動作しない問題を修正。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル数に対する制限は、最初の CREATE クエリの実行時にのみチェックするようにしました。 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique)).
* バグではありません: `SELECT toBFloat16(-0.0) == toBFloat16(0.0)` は、これまでは `false` を返していましたが、現在は正しく `true` を返すようになりました。これにより、`Float32` および `Float64` の動作と整合的になります。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 初期化されていない `key_index` 変数への誤った参照を修正しました。これによりデバッグビルドでクラッシュが発生する可能性がありました（この未初期化参照自体は、後続のコードがおそらくエラーをスローするため、リリースビルドでは問題を引き起こしません）。### ユーザー向け変更のドキュメントエントリ。 [#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear)).
* Bool 値を持つパーティション名の扱いを修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) で不具合が発生していました。[#77319](https://github.com/ClickHouse/ClickHouse/pull/77319)（[Pavel Kruglov](https://github.com/Avogar)）。
* Nullable 要素を含むタプルと文字列の比較を修正しました。たとえば、変更前はタプル `(1, null)` と文字列 `'(1,null)'` の比較はエラーになっていました。別の例として、`a` が Nullable カラムであるタプル `(1, a)` と文字列 `'(1, 2)'` の比較も同様です。この変更により、これらの問題が解消されます。 [#77323](https://github.com/ClickHouse/ClickHouse/pull/77323) ([Alexey Katsman](https://github.com/alexkats)).
* ObjectStorageQueueSource のクラッシュを修正しました。[https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) で導入された不具合です。 [#77325](https://github.com/ClickHouse/ClickHouse/pull/77325) ([Pavel Kruglov](https://github.com/Avogar))。
* `input` を使用する `async_insert` を修正。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修正: 並べ替え列がプランナーによって削除された場合に `WITH FILL` が NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK で失敗する可能性がある問題を修正しました。INTERPOLATE 式に対して計算される DAG の不整合に関連する同様の問題も修正しました。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 無効な AST ノードに対してエイリアスを設定する処理に関連する複数の LOGICAL&#95;ERROR を修正しました。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* filesystem キャッシュの実装において、ファイルセグメント書き込み時のエラー処理を修正しました。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii))。
* DatabaseIceberg がカタログによって提供される正しいメタデータファイルを使用するようにしました。 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) をクローズ。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* クエリキャッシュは、UDF を非決定的であるとみなすようになりました。これに伴い、UDF を含むクエリの結果はキャッシュされなくなりました。以前は、結果が誤ってキャッシュされてしまう非決定的な UDF をユーザーが定義できていました（issue [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* system.filesystem&#95;cache&#95;log が `enable_filesystem_cache_log` 設定が有効な場合にのみ動作していた問題を修正しました。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 投影内で `defaultRoles` 関数を呼び出す際の論理エラーを修正します。[#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) のフォローアップです。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 関数 `arrayResize` の第 2 引数として型 `Nullable` を使用することは、現在は許可されていません。以前は、第 2 引数に `Nullable` を指定した場合、エラーが発生することから誤った結果が返されることまで、さまざまな問題が起こり得ました（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* マージおよびミューテーションについて、書き込むブロックが生成されない場合でも、定期的にキャンセルされていないかを確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).

#### ビルド/テスト/パッケージングの改善

- `clickhouse-odbc-bridge`と`clickhouse-library-bridge`を別リポジトリ https://github.com/ClickHouse/odbc-bridge/ に移動しました。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Rustのクロスコンパイルを修正し、Rustを完全に無効化できるようにしました。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouseリリース 25.2, 2025-02-27 {#252}

#### 後方互換性のない変更

- `async_load_databases`をデフォルトで完全に有効化しました(`config.xml`をアップグレードしないインストール環境でも有効)。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat))。
- `JSONCompactEachRowWithProgress`および`JSONCompactStringsEachRowWithProgress`フォーマットを追加しました。[#69989](https://github.com/ClickHouse/ClickHouse/issues/69989)の続きです。`JSONCompactWithNames`と`JSONCompactWithNamesAndTypes`は「totals」を出力しなくなりました - これは実装上の誤りであったと考えられます。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- ALTERコマンドリストを明確化するため、`format_alter_operations_with_parentheses`のデフォルト値をtrueに変更しました(https://github.com/ClickHouse/ClickHouse/pull/59532 を参照)。これにより24.3より前のクラスタとのレプリケーションが動作しなくなります。古いリリースを使用しているクラスタをアップグレードする場合は、サーバー設定でこの設定を無効にするか、まず24.3にアップグレードしてください。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano))。
- 正規表現を使用したログメッセージのフィルタリング機能を削除しました。この実装はデータ競合を引き起こしていたため、削除する必要がありました。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 設定`min_chunk_bytes_for_parallel_parsing`はゼロに設定できなくなりました。これにより[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)が修正されます。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- キャッシュ設定内の設定値を検証するようにしました。以前は存在しない設定は無視されていましたが、現在はエラーが発生するため、削除する必要があります。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii))。


#### 新機能
* 型 `Nullable(JSON)` をサポートしました。[#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar)).
* DEFAULT および MATERIALIZED 式でサブカラムをサポートしました。[#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定 `output_format_parquet_write_bloom_filter`（デフォルトで有効）を使用した Parquet Bloom フィルタの書き込みをサポートしました。[#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321)).
* Web UI にインタラクティブなデータベースナビゲーションが追加されました。[#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ストレージポリシー内で読み取り専用ディスクと読み書き可能ディスクを組み合わせて使用できるようになりました（複数ボリュームまたは複数ディスクとして）。これにより、ボリューム全体からデータを読み取ることができる一方で、挿入は書き込み可能なディスクが優先されます（いわゆる Copy-on-Write ストレージポリシー）。[#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat)).
* 新しい Database エンジン `DatabaseBackup` を追加しました。これにより、バックアップからテーブル／データベースを即座にアタッチできます。[#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal)).
* Postgres ワイヤプロトコルで prepared statement をサポートしました。[#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12)).
* データベースレイヤーなしでテーブルを ATTACH できるようにしました。これは、Web や S3 などの外部仮想ファイルシステム上にある MergeTree テーブルに対して有用です。[#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat)).
* 新しい文字列比較関数 `compareSubstrings` を追加しました。2 つの文字列の一部を比較するための関数です。例: `SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` は「最初の文字列のオフセット 0 から、2 番目の文字列のオフセット 5 から、それぞれ 6 バイト分の文字列 'Saxon' と 'Anglo-Saxon' を辞書順で比較する」という意味です。[#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい関数 `initialQueryStartTime` が追加されました。現在のクエリの開始時刻を返します。分散クエリでは、すべてのシャードで同じ値になります。[#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik)).
* MySQL 向けに、named collection を用いた SSL 認証をサポートしました。[#59111](https://github.com/ClickHouse/ClickHouse/issues/59111) をクローズします。[#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 実験的機能
* 新しい設定 `enable_adaptive_memory_spill_scheduler` を追加しました。同一クエリ内の複数の Grace JOIN が、その合計メモリフットプリントを監視し、MEMORY_LIMIT_EXCEEDED を防ぐために外部ストレージへのスピルを適応的にトリガーできるようにします。[#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい実験的な `Kafka` テーブルエンジンが Keeper の機能フラグを完全に尊重するようにしました。[#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ライセンス上の問題により v24.10 で削除されていた (Intel) QPL コーデックを復元しました。[#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* HDFS との統合について、設定オプション `dfs.client.use.datanode.hostname` をサポートしました。[#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).



#### パフォーマンスの改善
* S3 上の Wide パーツにおける JSON カラム全体の読み取りパフォーマンスを改善しました。これは、サブカラム接頭辞のデシリアライズに対するプリフェッチの追加、デシリアライズ済み接頭辞のキャッシュ、サブカラム接頭辞の並列デシリアライズによって実現しています。これにより、`SELECT data FROM table` のようなクエリでは S3 からの JSON カラム読み取りが 4 倍、`SELECT data FROM table LIMIT 10` のようなクエリでは約 10 倍高速になります。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827) ([Pavel Kruglov](https://github.com/Avogar)).
* `max_rows_in_join = max_bytes_in_join = 0` の場合における `parallel_hash` 内の不要な競合を修正しました。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155) ([Nikita Taranov](https://github.com/nickitat)).
* オプティマイザによって結合の左右が入れ替えられた場合に、`ConcurrentHashJoin` で事前アロケーションが二重に行われていた問題を修正しました。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149) ([Nikita Taranov](https://github.com/nickitat)).
* 一部の結合シナリオにおけるわずかな改善として、出力行数を事前に計算し、その分のメモリを予約するようにしました。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376) ([Alexander Gololobov](https://github.com/davenger)).
* `WHERE a < b AND b < c AND c < 5` のようなクエリに対して、新たな比較条件（`a < 5 AND b < 5`）を推論し、フィルタ性能を向上できるようにしました。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の改善: パフォーマンス向上のため、インメモリストレージへコミットする際のダイジェスト計算を無効化しました。これは `keeper_server.digest_enabled_on_commit` 設定で有効化できます。リクエストの前処理時には引き続きダイジェストが計算されます。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490) ([Antonio Andelic](https://github.com/antonio2368)).
* 可能な場合、JOIN の ON 句からフィルタ式をプッシュダウンするようにしました。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTree において、カラムおよびインデックスのサイズを遅延評価するようにしました。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938) ([Pavel Kruglov](https://github.com/Avogar)).
* `MATERIALIZE TTL` において `ttl_only_drop_parts` を再度尊重するようにしました。TTL を再計算してパーツを空のパーツに置き換えることで削除するために、必要なカラムのみを読み取るようにしました。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751) ([Andrey Zvonov](https://github.com/zvonand)).
* `plain_rewritable` メタデータファイルに対する書き込みバッファサイズを削減しました。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758) ([Julia Kartseva](https://github.com/jkartseva)).
* 一部のウィンドウ関数におけるメモリ使用量を削減しました。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647) ([lgbo](https://github.com/lgbo-ustc)).
* Parquet の Bloom フィルタと min/max インデックスを同時に評価するようにしました。これは、data = [1, 2, 4, 5] のときの `x = 3 or x > 5` のようなケースを正しくサポートするために必要です。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383) ([Arthur Passos](https://github.com/arthurpassos)).
* `Executable` ストレージに渡されるクエリは、もはや単一スレッド実行に制限されません。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084) ([yawnt](https://github.com/yawnt)).
* ALTER TABLE FETCH PARTITION において、パーツを並列にフェッチするようにしました（スレッドプールサイズは `max_fetch_partition_thread_pool_size` で制御されます）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978) ([Azat Khuzhin](https://github.com/azat)).
* `indexHint` 関数を用いた述語を `PREWHERE` に移動できるようにしました。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987) ([Anton Popov](https://github.com/CurtizJ)).



#### 改善

* `LowCardinality` カラムのメモリ上のサイズ計算を修正しました。 [#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat))。
* `processors_profile_log` テーブルに、TTL が 30 日のデフォルト設定が追加されました。 [#66139](https://github.com/ClickHouse/ClickHouse/pull/66139) ([Ilya Yatsishin](https://github.com/qoega))。
* クラスタ設定でシャードに名前を付けられるようになりました。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* Prometheus リモート書き込み応答の成功ステータスを 200/OK から 204/NoContent に変更しました。[#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth))。
* サーバーを再起動することなく、`max_remote_read_network_bandwidth_for_serve` と `max_remote_write_network_bandwidth_for_server` を動的にリロードできるようにする機能を追加。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* バックアップ作成時にblobパスを使用してチェックサムを計算できるようになりました。[#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar))。
* `system.query_cache` にクエリ ID 列を追加しました（[#68205](https://github.com/ClickHouse/ClickHouse/issues/68205) をクローズ）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* `ALTER TABLE ... FREEZE ...` クエリは、`KILL QUERY` によるキャンセルや、タイムアウト（`max_execution_time`）による自動キャンセルが可能になりました。 [#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar)).
* `groupUniqArrayArrayMap` を `SimpleAggregateFunction` としてサポート。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* データベースエンジン `Iceberg` でカタログ認証情報の設定を非表示化。 [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559) をクローズ。 [#75080](https://github.com/ClickHouse/ClickHouse/pull/75080) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `intExp2` / `intExp10`: 未定義動作を定義: 引数が小さすぎる場合は0を返し、引数が大きすぎる場合は`18446744073709551615`を返し、`nan`の場合は例外をスローします。[#75312](https://github.com/ClickHouse/ClickHouse/pull/75312) ([Vitaly Baranov](https://github.com/vitlibar))。
* `DatabaseIceberg` のカタログ設定から `s3.endpoint` をネイティブにサポートするようにしました。 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558) をクローズ。 [#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ユーザーが `SYSTEM DROP REPLICA` を実行する際に十分な権限を持っていない場合に、何も表示されずに失敗しないようにしました。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc)).
* 任意のシステムログがフラッシュに失敗した回数を記録する ProfileEvent を追加しました。[#75466](https://github.com/ClickHouse/ClickHouse/pull/75466)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 復号および解凍処理に対するチェックと追加のログ出力を行うようにしました。 [#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* `parseTimeDelta` 関数でマイクロ記号 (U+00B5) をサポートしました。これにより、マイクロ記号 (U+00B5) とギリシャ文字ミュー (U+03BC) の両方がマイクロ秒を表す有効な表記として認識されるようになり、ClickHouse の挙動が Go の実装と一致するようになりました（[time.go を参照](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20)、および [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）。 [#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* サーバー設定（`send_settings_to_client`）を、クライアント設定（`apply_settings_from_server`）に置き換えました。この設定は、クライアント側コード（例：INSERT データのパースやクエリ出力のフォーマット）が、サーバーの `users.xml` とユーザープロファイルに定義された設定を使用するかどうかを制御します。無効な場合は、クライアントのコマンドライン、セッション、およびクエリで指定された設定のみが使用されます。これはネイティブクライアントにのみ適用され（HTTP などには適用されず）、クエリ処理の大部分（サーバー側で行われる部分）には適用されない点に注意してください。 [#75478](https://github.com/ClickHouse/ClickHouse/pull/75478) ([Michael Kolupaev](https://github.com/al13n321)).
* 構文エラーに対するエラーメッセージを改善。これまでは、クエリが大きすぎ、長さ制限を超える非常に大きな文字列リテラルのトークンが含まれている場合、その理由を説明するメッセージが、その非常に長いトークンの 2 つの例の間に挟まれて失われていました。UTF-8 を含むクエリがエラーメッセージ内で誤って切り詰められていた問題を修正。クエリ断片の過剰な引用符付けを修正。この変更により [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473) がクローズされました。 [#75561](https://github.com/ClickHouse/ClickHouse/pull/75561) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ストレージ `S3(Azure)Queue` にプロファイルイベントを追加。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 互換性のため、サーバーからクライアントへの設定送信を無効化しました（`send_settings_to_client=false`。この機能は、利便性向上のため、後にクライアント側の設定として再実装される予定です）。[#75648](https://github.com/ClickHouse/ClickHouse/pull/75648)（[Michael Kolupaev](https://github.com/al13n321)）。
* バックグラウンドスレッドで複数のソースから定期的に読み取った情報を用いて、内部メモリトラッカーを補正できるようにする設定 `memory_worker_correct_memory_tracker` を追加しました。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* `system.processes` に `normalized_query_hash` カラムを追加しました。注: `normalizedQueryHash` 関数を使えばその場で容易に計算できますが、今後の変更に備えるために必要です。 [#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `system.tables` をクエリしても、すでに存在しないデータベース上に作成された `Merge` テーブルがあっても例外はスローされません。複雑な処理を行うことは許可していないため、`Hive` テーブルから `getTotalRows` メソッドを削除しました。[#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* バックアップの start&#95;time/end&#95;time をマイクロ秒単位で保存できるようにしました。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* RSS による補正が行われていない内部グローバルメモリトラッカーの値を示す `MemoryTrackingUncorrected` メトリクスを追加。 [#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368))。
* `PostgreSQL` や `MySQL` のテーブル関数で `localhost:1234/handle` のようなエンドポイントをパースできるようにしました。これは [https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) で発生したリグレッションを修正します。 [#75944](https://github.com/ClickHouse/ClickHouse/pull/75944) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* サーバー設定 `throw_on_unknown_workload` を追加しました。この設定により、`workload` 設定に未知の値が指定されたクエリに対する挙動を選択できます。無制限のアクセスを許可する（デフォルト）か、`RESOURCE_ACCESS_DENIED` エラーをスローするかを選択できます。これは、すべてのクエリでワークロードスケジューリングの利用を強制したい場合に有用です。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa))。
* 必要がない場合は、`ARRAY JOIN` においてサブカラムを `getSubcolumn` に書き換えないようにしました。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル読み込み時のコーディネーションエラーのリトライを調整しました。[#76020](https://github.com/ClickHouse/ClickHouse/pull/76020)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* `SYSTEM FLUSH LOGS` で個別のログをフラッシュできるようにサポート。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* `/binary` サーバーのページを改善しました。Morton 曲線の代わりに Hilbert 曲線を使用します。正方形内に 512 MB 分のアドレスを表示し、これまでのバージョンよりも正方形全体を効率よく埋めるようにしました（以前のバージョンでは、アドレスは正方形の半分しか埋まりませんでした）。色付けは関数名ではなくライブラリ名に近いアドレスに基づくようにしました。領域の外側にも、少し余裕をもってスクロールできるようにしました。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES が発生した場合に ON CLUSTER クエリを再試行するようにしました。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* サーバーの相対的な CPU 不足を算出する非同期メトリクス `CPUOverload` を追加。 [#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `output_format_pretty_max_rows` のデフォルト値を 10000 から 1000 に変更しました。使いやすさの観点から、この方が適切だと考えています。 [#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov))。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* クエリ解釈中に例外が発生した場合、そのフォーマットにカスタムフォーマットを使用するよう修正しました。以前のバージョンでは、クエリで指定されたフォーマットではなくデフォルトフォーマットで例外がフォーマットされていました。これにより [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422) がクローズされました。 [#74994](https://github.com/ClickHouse/ClickHouse/pull/74994) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* SQLite の型マッピングを修正しました（整数型を `int64` に、浮動小数点型を `float64` にマッピング）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x)).
* 親スコープからの識別子解決を修正しました。`WITH` 句内で式にエイリアスを使用できるようにしました。[#58994](https://github.com/ClickHouse/ClickHouse/issues/58994) を修正。[#62946](https://github.com/ClickHouse/ClickHouse/issues/62946) を修正。[#63239](https://github.com/ClickHouse/ClickHouse/issues/63239) を修正。[#65233](https://github.com/ClickHouse/ClickHouse/issues/65233) を修正。[#71659](https://github.com/ClickHouse/ClickHouse/issues/71659) を修正。[#71828](https://github.com/ClickHouse/ClickHouse/issues/71828) を修正。[#68749](https://github.com/ClickHouse/ClickHouse/issues/68749) を修正。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* `negate` 関数の単調性を修正しました。以前のバージョンでは、`x` がプライマリキーである場合に、クエリ `select * from a where -x = -42;` が誤った結果を返す可能性がありました。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321)).
* arrayIntersect における空タプルの処理を修正。これにより [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578) が修正されました。 [#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 誤ったプレフィックスを持つ JSON サブオブジェクトのサブカラム読み取りを修正。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* クライアントとサーバー間の通信で Native 形式の設定が正しく伝播されるようにしました。 [#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部のストレージでサポートされていない型を検出するようにしました。 [#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS の PostgreSQL インターフェース上で `INSERT INTO SELECT` クエリを実行した際に発生するクラッシュを修正しました（issue [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* レプリケートデータベースにおける未初期化の `max_log_ptr` を修正しました。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov)).
* interval の挿入時に発生していたクラッシュを修正（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 定数 JSON リテラルのフォーマット処理を修正しました。以前は、クエリを別のサーバーへ送信する際に構文エラーを引き起こす可能性がありました。 [#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar)).
* 暗黙的プロジェクションが有効な状態で定数パーティション式を使用した際に `CREATE` クエリが壊れてしまう不具合を修正します。これにより [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596) が解決されました。 [#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird))。
* 例外により INSERT が終了した後に、接続が不正な状態のまま残らないようにしました。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 中間状態のまま残されていた接続を再利用しないようにしました。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat))。
* 型名が大文字でない場合に、JSON 型宣言のパース中に発生していたクラッシュを修正。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper：接続の確立前に接続が終了していた場合に発生する `logical_error` を修正。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* `AzureBlobStorage` を使用するテーブルが存在する場合にサーバーが起動できなかった問題を修正しました。テーブルは Azure へのリクエストを送信することなくロードされます。 [#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* BACKUP および RESTORE 操作に対して、`query_log` に存在していなかった `used_privileges` および `missing_privileges` フィールドを追加しました。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* HDFS の `SELECT` リクエスト中に SASL エラーが発生した場合、HDFS の KRB チケットを更新するようにしました。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* startup&#95;scripts 内の Replicated データベースに対するクエリを修正。 [#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat)).
* null セーフ比較が使用されている場合の、`JOIN ON` 句内で型エイリアスされた式に関する問題を修正しました。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir)).
* remove 操作が失敗した場合、part の状態を deleting から outdated に戻すようにしました。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 以前のバージョンでは、スカラーサブクエリがある場合、HTTP ヘッダーが書き込まれる前の段階であるデータフォーマットの初期化中に、サブクエリの処理によって蓄積された進捗の書き込みを開始していました。その結果、X-ClickHouse-QueryId や X-ClickHouse-Format、Content-Type といった HTTP ヘッダーが失われていました。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `database_replicated_allow_replicated_engine_arguments=0` 設定時の `CREATE TABLE AS...` クエリを修正。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc)).
* INSERT 時の例外発生後にクライアント側の接続が不正な状態のまま残ってしまう問題を修正しました。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* PSQL レプリケーションで未処理の例外により発生するクラッシュを修正しました。 [#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* Sasl は任意の RPC 呼び出しで失敗する可能性があり、この修正により、krb5 チケットの有効期限が切れている場合に呼び出しを再実行できるようになりました。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* `optimize_function_to_subcolumns` 設定が有効な場合に、`Array`、`Map`、`Nullable(..)` カラムに対するインデックス（プライマリおよびセカンダリ）の利用方法を修正しました。以前は、これらのカラムに対するインデックスが無視されることがありました。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 内部テーブルを持つマテリアライズドビューを作成する際は `flatten_nested` を無効化してください。フラット化されたカラムは使用できないためです。[#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm))。
* 一部の IPv6 アドレス（::ffff:1.1.1.1 など）が `forwarded_for` フィールドで誤って解釈され、その結果、例外が発生してクライアントが切断されてしまう問題を修正しました。 [#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* LowCardinality の Nullable 型データに対する nullsafe JOIN の処理を修正しました。以前は、`IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b` のような nullsafe な比較を用いた JOIN ON が、LowCardinality 列に対して正しく動作していませんでした。[#75143](https://github.com/ClickHouse/ClickHouse/pull/75143)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* NumRowsCache の total&#95;number&#95;of&#95;rows をカウントする際に key&#95;condition を指定していないことを検証します。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 新しいアナライザーで、未使用の補間を含むクエリを修正しました。 [#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* INSERT を伴う CTE のクラッシュバグを修正しました。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の修正: ログのロールバック時に破損したチェンジログへ書き込まないようにしました。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 適切な場合は `BFloat16` をスーパータイプとして使用するようにしました。これにより次の課題がクローズされます: [#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* any&#95;join&#95;distinct&#95;right&#95;table&#95;keys と JOIN の ON 句内の OR を併用した場合に、結合結果に予期しないデフォルト値が入る問題を修正しました。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* azureblobstorage テーブルエンジンのクレデンシャルをマスクするようにしました。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* ClickHouse が PostgreSQL、MySQL、SQLite などの外部データベースに対して誤ってフィルタープッシュダウンを行ってしまう可能性があった動作を修正しました。これにより次の issue が解決されます: [#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Protobuf 形式での出力中に、並列クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` によって発生し得る Protobuf スキーマキャッシュのクラッシュを修正。[#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* `HAVING` からのフィルタが parallel replicas でプッシュダウンされる際に発生しうる論理エラーまたは未初期化メモリの問題を修正しました。 [#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir))。
* `icebergS3` および `icebergAzure` のテーブル関数とテーブルエンジンで機密情報を非表示にしました。 [#75378](https://github.com/ClickHouse/ClickHouse/pull/75378) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 計算結果として空文字列となるトリム対象文字を指定した `TRIM` 関数が、正しく処理されるようになりました。例: `SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。 [#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* IOutputFormat のデータレースを修正。 [#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 分散テーブルに対する JOIN で Array 型の JSON サブカラムが使用されている場合に発生する可能性のある、`Elements ... and ... of Nested data structure ... (Array columns) have different array sizes` というエラーを修正しました。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* `CODEC(ZSTD, DoubleDelta)` によるデータ破損を修正。[#70031](https://github.com/ClickHouse/ClickHouse/issues/70031) をクローズ。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* allow&#95;feature&#95;tier と compatibility mergetree 設定の相互作用を修正しました。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルが再試行された場合に `system.s3queue_log` の `processed_rows` 値が誤って記録される問題を修正。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マテリアライズドビューが URL エンジンに書き込みを行う際に接続問題が発生している場合、`materialized_views_ignore_errors` が適切に考慮されるようにしました。 [#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm)).
* 異なる型のカラム間で、複数回の非同期 `RENAME` クエリ（`alter_sync = 0`）を実行した後に `MergeTree` テーブルから読み込む際に、まれに発生していたクラッシュを修正しました。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の `UNION ALL` を含むクエリで発生していた `Block structure mismatch in QueryPipeline stream` エラーを修正しました。 [#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Projection の PK に使用されているカラムを `ALTER MODIFY` した際に、その Projection を再構築するようにしました。以前は、Projection の PK に使用されているカラムを `ALTER MODIFY` した後に `SELECT` を実行すると、`CANNOT_READ_ALL_DATA` エラーが発生する可能性がありました。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* スカラーサブクエリ（アナライザー使用時）に対する `ARRAY JOIN` の誤った結果を修正しました。 [#75732](https://github.com/ClickHouse/ClickHouse/pull/75732) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* `DistinctSortedStreamTransform` におけるヌルポインタの逆参照を修正しました。 [#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* `allow_suspicious_ttl_expressions` の動作を修正。 [#75771](https://github.com/ClickHouse/ClickHouse/pull/75771) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 関数 `translate` における未初期化メモリの読み取りを修正しました。これにより [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592) がクローズされます。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Native フォーマットにおいて、フォーマット設定が JSON に対しても文字列のフォーマットとして適用されるようにしました。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定変更履歴に、v24.12 で結合アルゴリズムとして並列ハッシュをデフォルトで有効化したことを記録しました。これは、v24.12 より古い互換性レベルが設定されている場合、ClickHouse は引き続き非並列ハッシュを用いて結合を行うことを意味します。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze)).
* 暗黙的に追加された min-max インデックスを持つテーブルを新しいテーブルにコピーできない不具合を修正しました（issue [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。 [#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` はファイルシステム上の任意のライブラリを開くことができるため、分離された環境内でのみ実行することが安全です。`clickhouse-server` と近接した環境で実行された場合の脆弱性を防ぐため、設定で指定された場所にのみライブラリのパスを制限します。この脆弱性は **Arseniy Dugin** によって [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) を通じて発見されました。 [#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 私たちは一部のメタデータに JSON シリアル化を使用していましたが、これは誤りでした。JSON は文字列リテラル内のバイナリデータ（ヌルバイトを含む）をサポートしていないためです。SQL クエリにはバイナリデータや不正な UTF-8 が含まれ得るため、メタデータファイル側でもこれをサポートする必要があります。一方で、ClickHouse の `JSONEachRow` などのフォーマットは、バイナリデータを損なわずに往復変換できることを重視し、そのために JSON 標準から意図的に逸脱してこの問題を回避しています。その背景となる理由については次を参照してください: [https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解決策は、`Poco::JSON` ライブラリを ClickHouse における JSON 形式のシリアル化仕様と整合させることです。これにより [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668) がクローズされます。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3Queue` におけるコミット上限のチェックを修正しました。 [#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 自動インデックス（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）を持つ MergeTree テーブルのアタッチ処理を修正。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat))。
* ジョブの親スレッドからのスタックトレース（`enable_job_stack_trace` 設定）が出力されない問題を修正しました。`enable_job_stack_trace` 設定がスレッドに正しく伝播されず、その結果スタックトレースの内容が常にこの設定を反映しない問題を修正しました。[#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `ALTER RENAME` に対して誤って `CREATE USER` 権限が必要になっていたパーミッションチェックを修正。[#74372](https://github.com/ClickHouse/ClickHouse/issues/74372) をクローズ。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* ビッグエンディアンアーキテクチャ上で `FixedString` と組み合わせた `reinterpretAs` の動作を修正。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat))。
* S3Queue における論理エラー &quot;Expected current processor {} to be equal to {} for bucket {}&quot; を修正。[#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Memoryデータベースを使用したALTERのデッドロックを修正。[#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat))。
* `WHERE` 句に `pointInPolygon` 関数を含む場合のインデックス解析における論理エラーを修正。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* シグナルハンドラー内の潜在的に安全でない呼び出しを修正しました。 [#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* PartsSplitter における reverse key のサポートを修正しました。これにより [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400) が解決されます。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### ビルド/テスト/パッケージングの改善

- ARMおよびIntel MacでのHDFSビルドをサポート。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
- Darwin向けクロスコンパイル時にICUとGRPCを有効化。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
- 組み込みLLVMを19に更新。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- Dockerイメージ内のデフォルトユーザーに対するネットワークアクセスを無効化。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。すべてのclickhouse-server関連のアクションを関数化し、`entrypoint.sh`でデフォルトバイナリを起動する際にのみ実行するように変更。長らく延期されていた改善が[#50724](https://github.com/ClickHouse/ClickHouse/issues/50724)で提案されていました。`clickhouse-extract-from-config`に`--users`スイッチを追加し、`users.xml`から値を取得できるようにしました。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- バイナリから約20MBのデッドコードを削除。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouseリリース25.1、2025-01-28 {#251}


#### 後方互換性のない変更
* `JSONEachRowWithProgress` は、進捗が発生するたびに進捗情報を書き出すようになります。以前のバージョンでは、進捗は結果の各ブロックごとにのみ表示されており、そのため役に立ちませんでした。進捗の表示方法を変更し、ゼロ値は表示しないようにしました。これにより [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800) がクローズされました。 [#73834](https://github.com/ClickHouse/ClickHouse/pull/73834) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `Merge` テーブルは、列の和集合を取り共通の型を導出することで、基礎となるテーブルの構造を統一します。これにより [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864) がクローズされました。特定のケースでは、この変更は後方互換性がない可能性があります。例えば、テーブル間に共通の型が存在しないが、最初のテーブルの型への変換は可能な場合です (UInt64 と Int64、あるいは任意の数値型と String のケースなど)。旧来の動作に戻したい場合は、`merge_table_max_tables_to_look_for_schema_inference` を `1` に設定するか、`compatibility` を `24.12` 以前に設定してください。 [#73956](https://github.com/ClickHouse/ClickHouse/pull/73956) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Parquet 出力フォーマットは、Date および DateTime 列を、そのまま数値として書き出すのではなく、Parquet がサポートする日付/時刻型に変換します。`DateTime` は `DateTime64(3)` (以前は `UInt32`) になり、`output_format_parquet_datetime_as_uint32` を設定すると旧来の動作に戻せます。`Date` は `Date32` (以前は `UInt16`) になります。 [#70950](https://github.com/ClickHouse/ClickHouse/pull/70950) ([Michael Kolupaev](https://github.com/al13n321)).
* 既定では、`ORDER BY` および比較関数 `less/greater/equal/etc` に、`JSON` / `Object` / `AggregateFunction` のような比較不可能な型を使用できないようにしました。 [#73276](https://github.com/ClickHouse/ClickHouse/pull/73276) ([Pavel Kruglov](https://github.com/Avogar)).
* 廃止予定だった `MaterializedMySQL` データベースエンジンは削除され、利用できなくなりました。 [#73879](https://github.com/ClickHouse/ClickHouse/pull/73879) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `mysql` ディクショナリソースは、もはや `SHOW TABLE STATUS` クエリを実行しません。これは、InnoDB テーブルに対しても、最近の MySQL バージョン全般に対しても何の価値も提供しないためです。これにより [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636) がクローズされました。この変更は後方互換性がありますが、気付けるようにこのカテゴリに含めています。 [#73914](https://github.com/ClickHouse/ClickHouse/pull/73914) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `CHECK TABLE` クエリには、新たに専用の `CHECK` 権限が必要になりました。以前のバージョンでは、これらのクエリを実行するには `SHOW TABLES` 権限だけで十分でした。しかし、`CHECK TABLE` クエリは高負荷になり得て、通常の `SELECT` クエリに適用されるクエリ複雑性の制限は適用されませんでした。そのため DoS の可能性がありました。 [#74471](https://github.com/ClickHouse/ClickHouse/pull/74471) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `h3ToGeo()` は、結果を (ジオメトリ関数の標準的な順序である) `(lat, lon)` の順序で返すようになりました。レガシーな結果の順序 `(lon, lat)` を維持したいユーザーは、設定 `h3togeo_lon_lat_result_order = true` を有効にできます。 [#74719](https://github.com/ClickHouse/ClickHouse/pull/74719) ([Manish Gill](https://github.com/mgill25)).
* 新しい MongoDB ドライバーがデフォルトになりました。レガシードライバーの使用を継続したいユーザーは、サーバー設定 `use_legacy_mongodb_integration` を true に設定できます。 [#73359](https://github.com/ClickHouse/ClickHouse/pull/73359) ([Robert Schulze](https://github.com/rschu1ze)).



#### 新機能

* `SELECT` クエリ送信直後の実行時に、未完了（バックグラウンドプロセスによってマテリアライズされていない）のミューテーションを適用できる機能を追加しました。これは `apply_mutations_on_fly` を設定することで有効化できます。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* Icebergの時間関連変換パーティション操作に対する`Iceberg`テーブルのパーティションプルーニングを実装しました。[#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik))。
* MergeTree のソートキーおよびスキップインデックスでサブカラムをサポートします。 [#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* `Apache Arrow`/`Parquet`/`ORC` からの `HALF_FLOAT` 値の読み取りをサポートしました（`Float32` として読み込みます）。これにより [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960) が解決されます。IEEE-754 の half float は `BFloat16` と同じではないことに注意してください。[#73835](https://github.com/ClickHouse/ClickHouse/issues/73835) をクローズします。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` テーブルに、シンボル化されたスタックトレースを保持する新しいカラム `symbols` と `lines` が追加されます。これにより、プロファイル情報の収集とエクスポートを容易に行えます。これは `trace_log` 内のサーバー設定値 `symbolize` によって制御されており、デフォルトで有効になっています。 [#73896](https://github.com/ClickHouse/ClickHouse/pull/73896) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* テーブル内で自動インクリメント番号を生成するために使用できる新しい関数 `generateSerialID` を追加します。[kazalika](https://github.com/kazalika) による [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) の継続です。これにより [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485) がクローズされます。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* DDL クエリ向けに、構文 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN` を追加しました。これは、サブクエリ `{query1, query2, ... queryN}` が互いに並列に実行されることが許可される（かつ、その方が望ましい）ことを意味します。 [#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar))。
* デシリアライズされたスキッピングインデックスのグラニュール用にインメモリキャッシュを追加しました。これにより、スキッピングインデックスを使用する繰り返しクエリが高速になります。新しいキャッシュのサイズは、サーバー設定 `skipping_index_cache_size` と `skipping_index_cache_max_entries` によって制御されます。このキャッシュを導入した主な理由はベクトル類似性インデックスであり、これにより現在は大幅な高速化が実現されています。 [#70102](https://github.com/ClickHouse/ClickHouse/pull/70102) ([Robert Schulze](https://github.com/rschu1ze))。
* これにより、組み込み Web UI はクエリ実行中に進行状況バーを表示するようになりました。クエリをキャンセルできます。レコードの総数および処理速度に関する詳細情報を表示します。テーブルはデータが到着し次第、段階的にレンダリングされます。HTTP 圧縮を有効にしました。テーブルのレンダリングがより高速になりました。テーブルヘッダーが固定（スティッキー）になりました。セルの選択と、矢印キーによる移動が可能です。選択されたセルのアウトラインによってセルが小さくなってしまう問題を修正しました。セルはマウスホバー時ではなく、選択時にのみ拡大されるようになりました。受信データのレンダリングを停止するタイミングは、サーバー側ではなくクライアント側で決定されます。数値の桁区切りをハイライト表示します。全体的なデザインを刷新し、より力強い印象になりました。サーバーに到達可能かどうか、および認証情報の正しさを確認し、サーバーバージョンと稼働時間を表示します。クラウドアイコンは Safari を含むあらゆるフォントで輪郭付きで表示されます。ネストされたデータ型内の大きな整数は、より適切にレンダリングされます。`inf`/`nan` を正しく表示します。列ヘッダー上にマウスを置いたときにデータ型を表示します。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `add_minmax_index_for_numeric_columns`（数値カラム向け）および `add_minmax_index_for_string_columns`（文字列カラム向け）の設定を使用して、MergeTree が管理するカラムに対して、デフォルトで min-max（スキップ）インデックスを作成できるようになりました。現時点ではいずれの設定も無効化されているため、動作の変更はまだありません。[#74266](https://github.com/ClickHouse/ClickHouse/pull/74266)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `system.query_log`、ネイティブプロトコルの ClientInfo、およびサーバーログに `script_query_number` と `script_line_number` フィールドを追加しました。これにより [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542) がクローズされます。[#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) においてこの機能の開発を開始してくれた [pinsvin00](https://github.com/pinsvin00) に感謝します。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パターン内で最長のイベントチェーンに一致したイベントのタイムスタンプを返す集約関数 `sequenceMatchEvents` を追加しました。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus))。
* 関数 `arrayNormalizedGini` を追加しました。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl))。
* `DateTime64` に対するマイナス演算子のサポートを追加し、`DateTime64` 同士および `DateTime` との減算を可能にしました。 [#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg))。



#### 実験的機能
* `BFloat16` データ型は本番利用可能になりました。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov))。



#### パフォーマンスの向上

* 関数 `indexHint` を最適化しました。これにより、関数 `indexHint` の引数としてのみ使用されている列はテーブルから読み込まれなくなりました。 [#74314](https://github.com/ClickHouse/ClickHouse/pull/74314)（[Anton Popov](https://github.com/CurtizJ)）。もし `indexHint` 関数がエンタープライズデータアーキテクチャの中核を成しているのであれば、この最適化はあなたの命を救うかもしれません。
* `parallel_hash` JOIN アルゴリズムにおける `max_joined_block_size_rows` 設定の扱いをより正確にしました。これにより、`hash` アルゴリズムと比べてメモリ消費量が増加してしまう状況を回避できます。 [#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* `MergingAggregated` ステップに対して、クエリプランレベルでの述語プッシュダウン最適化をサポートしました。これにより、アナライザーを用いた一部のクエリのパフォーマンスが向上します。 [#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `parallel_hash` JOIN アルゴリズムのプローブフェーズにおいて、ハッシュによる左テーブルブロックの分割処理が削除されました。 [#73089](https://github.com/ClickHouse/ClickHouse/pull/73089) ([Nikita Taranov](https://github.com/nickitat))。
* RowBinary 入力フォーマットを最適化。[#63805](https://github.com/ClickHouse/ClickHouse/issues/63805) をクローズ。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* `optimize_on_insert` が有効になっている場合、レベル 1 のパーツを作成します。これにより、新しく作成されたパーツに対する `FINAL` 付きクエリで、いくつかの最適化を利用できるようになります。 [#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* いくつかの低レベル最適化により、文字列のデシリアライズを高速化しました。 [#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* マージ処理などでレコード間の等価比較を行う場合は、最も不一致になりやすい列から行の比較を始めます。 [#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus))。
* 右側の結合テーブルをキーで再ランク付けすることで、Grace Hash Join のパフォーマンスを改善しました。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* `arrayROCAUC` と `arrayAUCPR` が曲線全体にわたる部分的な面積を計算できるようにし、巨大なデータセットに対してその計算を並列化できるようにしました。 [#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias)).
* アイドルスレッドの過剰な生成を回避します。[#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy))。
* テーブル関数で中括弧展開のみを行う場合は、BLOB ストレージのキーを列挙しないようにする。[#73333](https://github.com/ClickHouse/ClickHouse/issues/73333) をクローズ。[#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Nullable 引数に対して実行される関数の短絡評価最適化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li)).
* 非関数カラムには `maskedExecute` を適用せず、ショートサーキット実行のパフォーマンスを改善しました。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* パフォーマンスを向上させるため、`Kafka` / `NATS` / `RabbitMQ` / `FileLog` の入力フォーマットにおけるヘッダーの自動検出を無効化しました。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat))。
* `GROUPING SETS` を用いた集約後に、より高い並列度でパイプラインを実行できるようにしました。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* `MergeTreeReadPool` のクリティカルセクションを縮小。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy))。
* 並列レプリカのパフォーマンスが改善されました。並列レプリカプロトコルに関連しないパケットのデシリアライズは、クエリイニシエータ側で、常にパイプラインスレッド内で行われるようになりました。以前は、パイプラインのスケジューリングを担当するスレッドで実行されることがあり、その結果、イニシエータの応答性が低下し、パイプラインの実行が遅延する可能性がありました。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter))。
* Keeper における大きなマルチリクエストのパフォーマンスを改善しました。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* ログラッパーは値として扱い、ヒープに割り当てないようにします。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* MySQL および Postgres 辞書レプリカへの接続をバックグラウンドで再確立し、対応する辞書へのリクエストが遅延しないようにしました。 [#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 並列レプリカは、レプリカの可用性に関する過去の情報を使用してレプリカ選択を改善していましたが、接続できなかった場合にレプリカのエラーカウントを更新していませんでした。このPRにより、利用不可の場合にレプリカのエラーカウントを更新するようになりました。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi)).
* マージツリーの設定 `materialize_skip_indexes_on_merge` を追加しました。この設定はマージ時にスキップインデックスの作成を抑制します。これにより、スキップインデックスをいつ作成するかを（`ALTER TABLE [..] MATERIALIZE INDEX [...]` を通じて）ユーザーが明示的に制御できるようになります。スキップインデックスの構築コストが高い場合（例: ベクター類似インデックス）に有用です。[#74401](https://github.com/ClickHouse/ClickHouse/pull/74401)（[Robert Schulze](https://github.com/rschu1ze)）。
* Storage(S3/Azure)Queue における Keeper リクエストを最適化。[#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* デフォルトで最大`1000`個の並列レプリカを使用します。[#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* s3 ディスクからの読み取り時の HTTP セッション再利用を改善 ([#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)). [#74548](https://github.com/ClickHouse/ClickHouse/pull/74548) ([Julian Maicher](https://github.com/jmaicher)).





#### 改善

* ENGINE が暗黙的な CREATE TABLE クエリで SETTINGS をサポートし、ENGINE 設定とクエリ設定を併用できるようにしました。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano)).
* `use_hive_partitioning` をデフォルトで有効にします。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 異なるパラメータを持つ JSON 型同士の `CAST` および `ALTER` をサポートしました。 [#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON カラム値の等価比較をサポートしました。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON サブカラムを含む識別子のフォーマットを改善し、不要なバッククォートを回避するようにしました。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* インタラクティブメトリクスの改善。並列レプリカからのメトリクスが完全に表示されない問題を修正。メトリクスは最新の更新時刻順、その次に名前の辞書順で表示する。古くなったメトリクスは表示しない。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631)（[Julia Kartseva](https://github.com/jkartseva)）。
* JSON の出力フォーマットをデフォルトで整形表示にします。これを制御する新しい設定 `output_format_json_pretty_print` を追加し、デフォルトで有効にしました。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* デフォルトで `LowCardinality(UUID)` を許可します。これは ClickHouse Cloud の顧客にとって有用であることが実証されています。 [#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* インストール時のメッセージを改善しました。 [#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ClickHouse Cloud のパスワードリセットに関するメッセージを改善しました。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルに追記できない File テーブルのエラーメッセージを改善しました。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ユーザーが誤ってターミナルでバイナリ形式(Native、Parquet、Avroなど)の出力をリクエストした際に確認を求めるようになりました。これにより[#59524](https://github.com/ClickHouse/ClickHouse/issues/59524)が解決されます。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ターミナルでの Pretty および Vertical 形式において、視認性を高めるために行末の空白をハイライト表示します。これは `output_format_pretty_highlight_trailing_spaces` 設定で制御されます。初期実装は、[#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) での [Braden Burns](https://github.com/bradenburns) によるものです。[#71590](https://github.com/ClickHouse/ClickHouse/issues/71590) をクローズします。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-client` と `clickhouse-local` は、stdin がファイルからリダイレクトされている場合、その圧縮形式を自動検出するようになりました。これにより [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865) がクローズされました。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* デフォルトでprettyフォーマットにおいて長すぎるカラム名を切り詰めます。この動作は`output_format_pretty_max_column_name_width_cut_to`および`output_format_pretty_max_column_name_width_min_chars_to_cut`設定で制御されます。これは[#66502](https://github.com/ClickHouse/ClickHouse/issues/66502)における[tanmaydatta](https://github.com/tanmaydatta)の作業の継続です。本変更により[#65968](https://github.com/ClickHouse/ClickHouse/issues/65968)がクローズされます。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `Pretty` フォーマットをより見やすくしました。前のブロックの出力からあまり時間が経過していない場合は、ブロックをまとめて表示します。これは新しい設定 `output_format_pretty_squash_consecutive_ms`（デフォルト 50 ms）と `output_format_pretty_squash_max_wait_ms`（デフォルト 1000 ms）で制御されます。[#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) の継続です。この変更により [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153) がクローズされました。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 現在マージ中のソースパーツ数を示すメトリクスを追加しました。これにより [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809) がクローズされます。 [#73868](https://github.com/ClickHouse/ClickHouse/pull/73868) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 出力先が端末の場合、`Vertical` フォーマットで列をハイライト表示します。これは `output_format_pretty_color` 設定で無効にできます。[#73898](https://github.com/ClickHouse/ClickHouse/pull/73898)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL 互換性を強化し、現在では `mysqlsh`（Oracle の高機能な MySQL CLI）から ClickHouse に接続できるようになりました。これはテストを容易にするために必要です。 [#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty 形式では、テーブルセル内に複数行のフィールドを表示できるため、可読性が向上します。これはデフォルトで有効で、設定 `output_format_pretty_multiline_fields` によって制御できます。[#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) における [Volodyachan](https://github.com/Volodyachan) による作業の継続です。これにより [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912) がクローズされます。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ブラウザ内の JavaScript から `X-ClickHouse` HTTP ヘッダーを参照できるようにしました。これによりアプリケーションの実装がより容易になります。 [#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `JSONEachRowWithProgress` フォーマットには、メタデータ付きのイベントに加えて、合計値および極値が含まれます。また、`rows_before_limit_at_least` と `rows_before_aggregation` も含まれます。このフォーマットは、部分結果の後に例外が発生した場合でも、例外を正しく出力します。進捗には経過ナノ秒が含まれるようになりました。終了時に最後の進捗イベントが 1 回送出されます。クエリ実行中の進捗は、`interactive_delay` 設定値で指定された間隔より高い頻度では出力されません。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Play UI 内の砂時計がスムーズに回転するようになりました。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* HTTP レスポンスが圧縮されている場合でも、到着し次第パケットを送信します。これにより、ブラウザは進捗を示すパケットと圧縮データの両方を受信できます。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 出力レコード数が N = `output_format_pretty_max_rows` を超える場合、先頭の N 行のみを表示する代わりに、出力テーブルを中ほどで分割し、先頭 N/2 行と末尾 N/2 行を表示します。[#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) の続きです。これにより [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502) はクローズされます。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを使用できるようにしました。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DateTime64` 型のカラムに対して `bloom_filter` インデックスを作成できるようになりました。 [#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean)).
* `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が両方有効な場合、パーツのマージでは最大バイト数の制限が無視されます。 [#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* トレーサビリティを向上させるため、OpenTelemetry の span logs テーブルに HTTP ヘッダーを追加しました。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* `orc` ファイルを書き込む際に、常に `GMT` タイムゾーンを使用するのではなく、カスタムタイムゾーンを指定して書き込めるようにしました。 [#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* クラウド間でバックアップを書き込む際に、IO スケジューリング設定が反映されるようにしました。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `system.asynchronous_metrics` に `metric` カラムのエイリアスである `name` を追加。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 歴史的な理由により、`ALTER TABLE MOVE PARTITION TO TABLE` クエリは専用の `ALTER_MOVE_PARTITION` 権限ではなく、`SELECT` と `ALTER DELETE` 権限をチェックしていました。このPRでは、この専用のアクセス権を使用するように変更しています。互換性のため、`SELECT` と `ALTER DELETE` が付与されている場合には、この権限も暗黙的に付与されますが、この挙動は今後のリリースで削除される予定です。[#16403](https://github.com/ClickHouse/ClickHouse/issues/16403) をクローズします。 [#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* ソートキー内のカラムをマテリアライズしようとしてソート順が崩れる場合は、それを許容するのではなく例外をスローするようにしました。 [#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48))。
* `EXPLAIN QUERY TREE`でシークレットを非表示にします。[#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* &quot;native&quot; リーダーで Parquet の整数論理型をサポートしました。 [#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos)).
* デフォルトユーザーにパスワードが必要な場合、ブラウザ上で対話的に認証情報を要求するようになりました。以前のバージョンではサーバーは HTTP 403 を返していましたが、現在は HTTP 401 を返します。 [#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* アクセス種別 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` をグローバルからパラメータ化されたものに変更しました。これにより、ユーザーはアクセス管理に関する権限をより細かく付与できるようになりました。 [#72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit)).
* `system.mutations` に `latest_fail_error_code_name` 列を追加しました。この列は、停止した mutation に対する新しいメトリクスを導入し、クラウドで発生したエラーのグラフを作成するために使用するほか、必要に応じて、よりノイズの少ない新しいアラートを追加するために必要です。 [#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `ATTACH PARTITION` クエリでのメモリアロケーション量を削減しました。 [#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* `max_bytes_before_external_sort` の制限がクエリ全体のメモリ消費量に依存するようになりました（以前は 1 つのソートスレッドにおけるソートブロック内のバイト数を意味していましたが、現在は `max_bytes_before_external_group_by` と同じ意味を持ち、全スレッドを通したクエリ全体のメモリに対する合計上限となります）。また、ディスク上のブロックサイズを制御するための新たな設定として `min_external_sort_block_bytes` が追加されました。[#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat))。
* trace collector によるメモリ制限を無視するようにしました。 [#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* サーバー設定 `dictionaries_lazy_load` と `wait_dictionaries_load_at_startup` を `system.server_settings` に追加。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm)).
* `BACKUP`/`RESTORE` クエリで指定可能な設定一覧に、`max_backup_bandwidth` 設定を追加しました。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* レプリケートされたクラスタで生成されるログ量を抑えるため、ReplicatedMergeTree エンジンにおいて、出現したレプリケートパーツに対するログレベルを引き下げました。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 論理和における共通式の抽出を改善しました。すべての論理和項に共通部分式が存在しない場合でも、生成されたフィルター式を単純化できるようにしました。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) の継続対応です。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* ストレージ `S3Queue`/`AzureQueue` において、テーブル作成時に設定が指定されていなかった場合でも、後から設定を追加できるようにしました。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `least_greatest_legacy_null_behavior` という設定（デフォルト: `false`）を導入しました。これは、関数 `least` および `greatest` が `NULL` 引数を受け取った際に、無条件に `NULL` を返す（`true` の場合）か、あるいは `NULL` 引数を無視する（`false` の場合）かを制御します。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze)).
* ObjectStorageQueueMetadata のクリーンアップスレッドで Keeper のマルチリクエストを使用するようにしました。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* ClickHouse が cgroup 配下で動作している場合でも、システム負荷、プロセススケジューリング、メモリなどに関連するシステム全体の非同期メトリクスは引き続き収集されます。ClickHouse がホスト上で高いリソースを消費する唯一のプロセスである場合には、これらのメトリクスが有用なシグナルとなる可能性があります。 [#73369](https://github.com/ClickHouse/ClickHouse/pull/73369) ([Nikita Taranov](https://github.com/nickitat))。
* ストレージ `S3Queue` において、24.6より前に作成された古い順序付きテーブルを、バケット構造を持つ新しい構造に移行できるようになりました。[#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 既存の `system.s3queue` と同様に `system.azure_queue` を追加。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 関数 `parseDateTime64`（およびそのバリアント）が、1970年より前／2106年より後の入力日付に対しても正しい結果を返すようになりました。例: `SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594)（[zhanglistar](https://github.com/zhanglistar)）。
* `clickhouse-disks` の使い勝手に関してユーザーから報告されていた問題の一部に対応しました。 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136) をクローズします。 [#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* storage S3(Azure)Queue でコミット設定を変更できるようになりました（コミット設定は `max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit` です）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* storage S3(Azure)Queue において、ソース間で集計した進捗をコミット制限の設定と比較できるようにしました。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `BACKUP` / `RESTORE` クエリでコア設定をサポートします。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* Parquet 出力で `output_format_compression_level` が考慮されるようになりました。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos))。
* Apache Arrow の `fixed_size_list` をサポートされていない型として扱うのではなく、`Array` として読み込めるように。 [#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers)).
* 2 つのバックアップエンジンを追加しました: `Memory`（現在のユーザーセッション内にバックアップを保持）、およびテスト用の `Null`（バックアップをどこにも保持しない）。 [#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar))。
* `concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_num_ratio_to_cores` をサーバーの再起動なしに変更できるようになりました。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* `formatReadable` 関数で拡張数値型（`Decimal`、ビッグ整数）をサポートしました。 [#73765](https://github.com/ClickHouse/ClickHouse/pull/73765) ([Raúl Marín](https://github.com/Algunenano))。
* Postgres ワイヤプロトコル互換のために TLS をサポートしました。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 関数 `isIPv4String` は、正しいIPv4アドレスの後にゼロバイトが続く場合にtrueを返していましたが、本来はこの場合falseを返すべきです。[#65387](https://github.com/ClickHouse/ClickHouse/issues/65387)の続き。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* MySQL ワイヤープロトコルのエラーコードを MySQL と互換にします。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) の続き。[#50957](https://github.com/ClickHouse/ClickHouse/issues/50957) をクローズ。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `IN` や `NOT IN` といった演算子における enum リテラルを enum 型に対して検証し、そのリテラルが有効な enum 値でない場合には例外をスローする設定 `validate_enum_literals_in_opearators` を追加しました。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Storage `S3(Azure)Queue` では、すべてのファイル（コミット設定で定義される 1 回分のバッチ）を 1 回の Keeper トランザクションでコミットします。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 実行可能な UDF および辞書に対するヘッダー検出を無効化しました（Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1 という問題を引き起こす可能性がありました）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* `EXPLAIN PLAN` に `distributed` オプションを追加しました。これにより、`EXPLAIN distributed=1 ...` は `ReadFromParallelRemote*` ステップにリモートプランを付加するようになりました。[#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic 引数を持つ not/xor に対して正しい戻り値型を使用。 [#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar)).
* `add_implicit_sign_column_constraint_for_collapsing_engine` をテーブル作成後にも変更できるようにしました。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm))。
* マテリアライズドビューのSELECTクエリでサブカラムをサポート。[#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar))。
* `clickhouse-client` でカスタムプロンプトを設定するには、次の 3 つのシンプルな方法があります。1. コマンドラインパラメータ `--prompt` を使用する、2. 設定ファイルで設定 `<prompt>[...]</prompt>` を使用する、3. 同じく設定ファイルで、接続ごとの設定 `<connections_credentials><prompt>[...]</prompt></connections_credentials>` を使用する方法です。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168) ([Christoph Wurm](https://github.com/cwurm))。
* ClickHouse Client がポート 9440 への接続を検出して安全な接続を自動判別するようになりました。 [#74212](https://github.com/ClickHouse/ClickHouse/pull/74212) ([Christoph Wurm](https://github.com/cwurm)).
* http&#95;handlers に対して、ユーザー名のみでユーザーを認証できるようにしました（以前はユーザーにパスワードの入力も必要でした）。 [#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat)).
* 代替クエリ言語である PRQL および KQL のサポートが実験的機能としてマークされました。これらを使用するには、設定 `allow_experimental_prql_dialect = 1` および `allow_experimental_kusto_dialect = 1` を指定します。 [#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze))。
* より多くの集約関数でデフォルトの Enum 型を返せるようにしました。 [#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* `OPTIMIZE TABLE` において、既存のキーワード `FINAL` に加えて、代替としてキーワード `FORCE` を指定できるようになりました。 [#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze)).
* サーバーのシャットダウンに時間がかかりすぎた場合にアラートを発火させるために必要な `IsServerShuttingDown` メトリクスを追加しました。 [#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* EXPLAIN に Iceberg テーブルの名前を追加しました。 [#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 旧アナライザーで RECURSIVE CTE を使用した際に、よりわかりやすいエラーメッセージを表示するよう改善。 [#74523](https://github.com/ClickHouse/ClickHouse/pull/74523) ([Raúl Marín](https://github.com/Algunenano)).
* `system.errors` に拡張エラーメッセージを表示します。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* clickhouse-keeper とのクライアント通信でパスワードを使用できるようにしました。サーバーおよびクライアントに対して適切な SSL 設定を指定している場合、この機能はあまり有用ではありませんが、場合によっては依然として役立つことがあります。パスワードは 16 文字を超えることはできません。Keeper Auth モデルとは関連していません。 [#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin))。
* config リローダー用のエラーコードを追加。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* MySQL および PostgreSQL のテーブル関数およびエンジンで IPv6 アドレスをサポートするようになりました。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme))。
* `divideDecimal` に対するショートサーキット最適化を実装します。[#74280](https://github.com/ClickHouse/ClickHouse/issues/74280) を修正。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* これで、起動スクリプト内でユーザーを指定できるようになりました。 [#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit))。
* Azure SAS トークンのサポートを追加。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* parquet の圧縮レベルは、圧縮コーデックが対応している場合にのみ設定します。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修飾子付きの照合ロケールを使用するとエラーが発生していたリグレッションを修正しました。例えば、`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` は、現在は問題なく動作します。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* keeper-client で SEQUENTIAL ノードを作成できなかった問題を修正。[#64177](https://github.com/ClickHouse/ClickHouse/pull/64177)（[Duc Canh Le](https://github.com/canhld94)）。
* position 関数における誤った文字数カウントを修正。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* アクセスエンティティに対する `RESTORE` 操作が、処理されていない部分的な権限の取り消しのために、本来より多くの権限を必要としていました。このPRで問題を修正しました。[#71853](https://github.com/ClickHouse/ClickHouse/issues/71853) をクローズします。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958) ([pufit](https://github.com/pufit))。
* `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 実行後に発生していた一時停止を回避しました。バックグラウンドタスクのスケジューリングに使用される設定を正しく取得するようにしました。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 一部の入出力フォーマット（例: Parquet、Arrow）における空タプルの扱いを修正しました。 [#72616](https://github.com/ClickHouse/ClickHouse/pull/72616) ([Michael Kolupaev](https://github.com/al13n321)).
* ワイルドカードを含むデータベース／テーブルに対してカラムレベルで GRANT SELECT/INSERT を行う文は、エラーを投げるようになりました。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan)).
* 対象のアクセスエンティティに暗黙的な権限付与があるためにユーザーが `REVOKE ALL ON *.*` を実行できない問題を修正しました。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* formatDateTime スカラー関数における正のタイムゾーンの書式設定を修正しました。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* PROXYv1 経由で接続が行われ、`auth_use_forwarded_address` が設定されている場合に、ソースポートが正しく反映されるよう修正しました。以前はプロキシポートが誤って使用されていました。`currentQueryID()` 関数を追加しました。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* TCPHandler から NativeWriter にフォーマット設定を伝播し、`output_format_native_write_json_as_string` のような設定が正しく適用されるようにしました。 [#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* StorageObjectStorageQueue のクラッシュを修正しました。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* サーバーシャットダウン時にリフレッシュ可能なマテリアライズドビューでまれに発生するクラッシュを修正。 [#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 関数 `formatDateTime` の `%f` プレースホルダは、サブ秒を表す 6 桁の数字を常に出力するようになりました。これにより、MySQL の `DATE_FORMAT` 関数と互換性のある動作になります。以前の動作は、設定 `formatdatetime_f_prints_scale_number_of_digits = 1` を使用することで復元できます。[#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese))。
* `s3` ストレージおよびテーブル関数からの読み取り時における `_etag` 列によるフィルタリングを修正しました。 [#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 旧アナライザ使用時に、`JOIN ON` 式で `IN (subquery)` が使われた場合に発生する `Not-ready Set is passed as the second argument for function 'in'` エラーを修正しました。 [#73382](https://github.com/ClickHouse/ClickHouse/pull/73382) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic カラムおよび JSON カラムに対する squashing 用の準備処理を修正しました。これまで一部のケースでは、型/パスの上限に達していない場合でも、新しい型が shared variant/shared data に挿入されてしまうことがありました。[#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar)).
* 型のバイナリデコード時に破損したサイズをチェックし、過大なメモリアロケーションを避けるようにしました。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカが有効な単一レプリカクラスタからの読み取り時に発生していた論理エラーを修正しました。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321))。
* ZooKeeper および旧バージョンの Keeper を使用する場合の ObjectStorageQueue を修正。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* デフォルトで Hive パーティショニングを有効にするために必要な修正を実装しました。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* ベクトル類似性インデックス作成時のデータレースを修正。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 辞書のソースに不正なデータを含む関数がある場合に発生するセグメンテーションフォールトを修正。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* storage S3(Azure)Queue での挿入失敗時の再試行処理を修正。 [#70951](https://github.com/ClickHouse/ClickHouse/issues/70951) をクローズ。 [#73546](https://github.com/ClickHouse/ClickHouse/pull/73546) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `LowCardinality` 要素を含むタプルで設定 `optimize_functions_to_subcolumns` が有効な場合に、一部のケースで発生する可能性があった関数 `tupleElement` のエラーを修正しました。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* 範囲指定を伴う enum グロブのパースを修正。 [#73473](https://github.com/ClickHouse/ClickHouse/issues/73473) を解決。 [#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 非レプリケートテーブルに対するサブクエリ内で、非レプリケートな MergeTree 向けの `parallel_replicas_for_non_replicated_merge_tree` が無視されていた問題を修正。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* タスクをスケジュールできない場合にスローされる std::logical&#95;error を修正。ストレステストで発見。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger)).
* `EXPLAIN SYNTAX` でクエリを解釈しないようにして、分散クエリに対する処理ステージの誤りによる論理エラーを回避します。 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205) を修正。 [#73634](https://github.com/ClickHouse/ClickHouse/pull/73634) ([Dmitry Novik](https://github.com/novikd))。
* Dynamic column におけるデータ不整合の可能性を修正しました。`Nested columns sizes are inconsistent with local_discriminators column size` という論理エラーが発生する可能性を修正します。 [#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar)).
* `FINAL` と `SAMPLE` を含むクエリで発生していた `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。`CollapsingMergeTree` に対する `FINAL` 付きの `SELECT` で誤った結果が返される問題を修正し、`FINAL` の最適化を有効化しました。[#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ))。
* LIMIT BY COLUMNS で発生していたクラッシュを修正。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 通常のプロジェクションの使用が強制され、かつクエリが定義されたプロジェクションと完全に同一であるにもかかわらず、そのプロジェクションが選択されずエラーが発生してしまうバグを修正しました。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* Dynamic/Object 構造のデシリアライズを修正しました。これにより CANNOT&#95;READ&#95;ALL&#95;DATA 例外が発生する可能性がありました。 [#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* バックアップからパーツを復元する際に `metadata_version.txt` をスキップするようにしました。 [#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar))。
* LIKE を使用した Enum への `CAST` 時に発生していたセグメンテーションフォルトを修正。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar)).
* S3 Express バケットがディスクとして動作しない問題を修正しました。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar)).
* CollapsingMergeTree テーブルで、符号列に無効な値を持つ行のマージを許可します。 [#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm))。
* オフラインレプリカに対して `ddl` をクエリした際にエラーが発生する問題を修正しました。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach)).
* ネストされたタプルに対して明示的な名前（&#39;keys&#39;、&#39;values&#39;）が付いていない `Map` を作成できてしまうことが原因で、`map()` 型の比較が時々失敗する問題を修正しました。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `GROUP BY ALL` 句の解決時にウィンドウ関数を無視するようにしました。[#73501](https://github.com/ClickHouse/ClickHouse/issues/73501) を修正。 [#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 暗黙的な権限の挙動を修正しました（以前はワイルドカードとして扱われていました）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* 入れ子の `Map` 作成時の高いメモリ使用量を修正。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar)).
* 空のキーを含むネストされた JSON のパース処理を修正。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修正: 別名が別の別名から参照されており、かつ逆順で選択されている場合に、Projection に追加されないことがある問題を修正。 [#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* plain&#95;rewritable ディスクの初期化時に、Azure での「object not found」エラーを無視するようにしました。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* enum型と空のテーブルでの`any`と`anyLast`の動作を修正しました。[#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x))。
* ユーザーが kafka テーブルエンジンでキーワード引数を指定した場合の不具合を修正しました。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Storage `S3Queue` の設定について、&quot;s3queue&#95;&quot; プレフィックス付きとプレフィックスなしとの間での変更が正しく行われるよう修正しました。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定 `allow_push_predicate_ast_for_distributed_subqueries` を追加しました。これにより、analyzer を用いた分散クエリで AST ベースの述語プッシュダウンが可能になります。これは、クエリプランのシリアライズに対応した分散クエリがサポートされるまで使用する一時的なソリューションです。[#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718) をクローズします。[#74085](https://github.com/ClickHouse/ClickHouse/pull/74085)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) の対応後に、`forwarded_for` フィールドにポートが含まれる場合があり、その結果、ポート付きのホスト名を解決できなくなる問題を修正しました。 [#74116](https://github.com/ClickHouse/ClickHouse/pull/74116) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` の誤った書式を修正しました。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991))。
* Issue [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112) の修正。 [#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `CREATE TABLE` でテーブルエンジンとして `Loop` を使用することは、もはやできません。この組み合わせは以前、セグメンテーションフォルトを引き起こしていました。 [#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* PostgreSQL および SQLite の table 関数における SQL インジェクションを防止するためのセキュリティ上の問題を修正しました。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 圧縮された Memory エンジンテーブルからサブカラムを読み取る際に発生するクラッシュを修正。[#74009](https://github.com/ClickHouse/ClickHouse/issues/74009) を解決。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* system.detached&#95;tables へのクエリで発生していた無限ループを修正しました。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov)).
* ファイルを失敗としてマークする際の s3queue の論理エラーを修正しました。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ベースバックアップからの `RESTORE` におけるネイティブコピー設定（`allow_s3_native_copy` / `allow_azure_native_copy`）を修正。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* データベース内のデタッチされたテーブルの数が `max_block_size` の倍数である場合に発生する問題を修正しました。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* ソースと宛先でクレデンシャルが異なる場合に、ObjectStorage（例: S3）経由でのコピー処理が正しく動作しない問題を修正。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* GCS 上でのネイティブコピーにおける「JSON API の Rewrite メソッド使用」の検出を修正しました。 [#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundMergesAndMutationsPoolSize` の誤った計算を修正しました（実際の値の 2 倍になっていました）。 [#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin)).
* Cluster Discovery を有効にした際に keeper の watch がリークするバグを修正しました。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* UBSan によって報告されたメモリアラインメントの問題を修正しました。 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。[#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* テーブル作成中の KeeperMap の並行クリーンアップ処理を修正。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* 正しいクエリ結果を維持するため、`EXCEPT` や `INTERSECT` が存在する場合には、サブクエリ内で未使用の投影列を削除しないようにしました。 [#73930](https://github.com/ClickHouse/ClickHouse/issues/73930) を修正。 [#66465](https://github.com/ClickHouse/ClickHouse/issues/66465) を修正。 [#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* `Tuple` カラムを持ち、スパースシリアライゼーションが有効なテーブル間での `INSERT SELECT` クエリの問題を修正しました。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 関数 `right` が const の負のオフセットに対して正しく動作していませんでした。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* クライアント側での不適切な解凍処理により、gzip 圧縮データの挿入が失敗することがある問題を修正しました。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* ワイルドカード付きの権限付与に対する部分的な権限剥奪によって、想定よりも多くの権限が削除されてしまう可能性がありました。 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263) を修正。 [#74751](https://github.com/ClickHouse/ClickHouse/pull/74751) ([pufit](https://github.com/pufit))。
* Keeper 修正: ディスクからのログエントリ読み取り処理を修正。[#74785](https://github.com/ClickHouse/ClickHouse/pull/74785)（[Antonio Andelic](https://github.com/antonio2368)）。
* SYSTEM REFRESH/START/STOP VIEW に対する権限チェックを修正しました。これにより、特定の VIEW に対するクエリを実行する際に `*.*` への権限は不要となり、その VIEW に対する権限だけがあればよくなりました。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `hasColumnInTable` 関数はエイリアス列を考慮していません。エイリアス列にも対応するよう修正します。[#74841](https://github.com/ClickHouse/ClickHouse/pull/74841)（[Bharat Nallan](https://github.com/bharatnc)）。
* Azure Blob Storage 上で空のカラムを持つテーブルのデータパーツのマージ中に発生する FILE&#95;DOESNT&#95;EXIST エラーを修正。 [#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 一時テーブルを結合する際の projection 列名を修正し、[#68872](https://github.com/ClickHouse/ClickHouse/issues/68872) をクローズしました。 [#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。



#### ビルド/テスト/パッケージングの改善
* ユニバーサルインストールスクリプトが、macOS 上でもインストールを提案するようになりました。 [#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
