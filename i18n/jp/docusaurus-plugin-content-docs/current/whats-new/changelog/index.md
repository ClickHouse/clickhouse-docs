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

**[ClickHouseリリース v25.10、2025-10-30](#2510)**<br/>
**[ClickHouseリリース v25.9、2025-09-25](#259)**<br/>
**[ClickHouseリリース v25.8 LTS、2025-08-28](#258)**<br/>
**[ClickHouseリリース v25.7、2025-07-24](#257)**<br/>
**[ClickHouseリリース v25.6、2025-06-26](#256)**<br/>
**[ClickHouseリリース v25.5、2025-05-22](#255)**<br/>
**[ClickHouseリリース v25.4、2025-04-22](#254)**<br/>
**[ClickHouseリリース v25.3 LTS、2025-03-20](#253)**<br/>
**[ClickHouseリリース v25.2、2025-02-27](#252)**<br/>
**[ClickHouseリリース v25.1、2025-01-28](#251)**<br/>
**[2024年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouseリリース 25.10、2025-10-31 {#2510}


#### 後方互換性のない変更

* デフォルトの `schema_inference_make_columns_nullable` 設定を変更し、すべてを Nullable とするのではなく、Parquet/ORC/Arrow のメタデータに含まれる列の `Nullable` 情報を反映するようにしました。テキスト形式については変更はありません。 [#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321)).
* クエリ結果キャッシュは `log_comment` 設定を無視するようになりました。そのため、クエリの `log_comment` だけを変更しても、キャッシュミスは発生しません。ユーザーが意図的に `log_comment` を変化させることでキャッシュを分割していた可能性がわずかにあります。この変更はその挙動を変えるものであり、後方互換性がありません。この目的には設定 `query_cache_tag` を使用してください。 [#79878](https://github.com/ClickHouse/ClickHouse/pull/79878) ([filimonov](https://github.com/filimonov)).
* 以前のバージョンでは、演算子の実装関数と同じ名前を持つテーブル関数を含むクエリのフォーマットに一貫性がありませんでした。[#81601](https://github.com/ClickHouse/ClickHouse/issues/81601) をクローズ。[#81977](https://github.com/ClickHouse/ClickHouse/issues/81977) をクローズ。[#82834](https://github.com/ClickHouse/ClickHouse/issues/82834) をクローズ。[#82835](https://github.com/ClickHouse/ClickHouse/issues/82835) をクローズ。EXPLAIN SYNTAX クエリは、もはや常に演算子をフォーマットするわけではありません。この新しい挙動は、構文を説明するという目的をよりよく反映しています。`clickhouse-format`、`formatQuery` などは、クエリ内で関数形式で記述されている場合、それらの関数を演算子としてはフォーマットしません。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JOIN` キーで `Dynamic` 型を使用することを禁止します。`Dynamic` 型の値を非 `Dynamic` 型と比較すると、予期しない結果を招く可能性があります。`Dynamic` 列は、必要な型にキャストすることを推奨します。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` サーバーオプションはデフォルトでオンになっており、現在はオフに設定できません。これは後方互換性のある変更です。お知らせのための情報です。この変更は 25.x リリースとのみ前方互換性があります。つまり、新しいリリースからロールバックする必要がある場合、ダウングレード先として選択できるのは 25.x 系の任意のリリースに限られます。 [#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema)).
* 挿入レートが低い場合に ZooKeeper 上に保存される znode を減らすため、`replicated_deduplication_window_seconds` を 1 週間から 1 時間に短縮しました。 [#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema)).
* 設定 `query_plan_use_new_logical_join_step` の名前を `query_plan_use_logical_join_step` に変更。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新しい構文により、テキストインデックスの `tokenizer` パラメータをより柔軟かつ詳細に指定できるようになりました。 [#87997](https://github.com/ClickHouse/ClickHouse/pull/87997) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 既存の関数 `hasToken` との一貫性を高めるため、関数 `searchAny` および `searchAll` を `hasAnyTokens` および `hasAllTokens` に名前変更しました。 [#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze)).
* `cache_hits_threshold` を filesystem cache から削除しました。この機能は、SLRU cache policy を導入する前に外部コントリビューターによって追加されたものであり、現在は SLRU cache policy が存在するため、両方をサポートする必要はなくなりました。 [#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` 設定の動作に、2 つの小さな変更を加えました。 挿入を拒否すべきかどうかを判断する際に、「利用可能（available）」なバイト数ではなく、「未予約（unreserved）」のバイト数を使用するようにしました。バックグラウンドマージやミューテーション用の予約容量が、設定されたしきい値に比べて小さい場合にはそれほど重要ではないかもしれませんが、このほうがより正確です。 これらの設定を system テーブルには適用しないようにしました。`query_log` のようなテーブルは引き続き更新されることが望ましいためです。これはデバッグに大いに役立ちます。system テーブルに書き込まれるデータは、実際のデータと比べて通常は小さいため、妥当な `min_free_disk_ratio_to_perform_insert` のしきい値であれば、かなり長い期間にわたって書き込みを継続できるはずです。[#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end)).
* Keeper の内部レプリケーションで async モードを有効にします。Keeper はこれまでと同じ動作を保ちつつ、パフォーマンスが向上する可能性があります。23.9 より古いバージョンからアップデートする場合は、まず 23.9 以上にアップデートしてから 25.10 以上にアップデートする必要があります。アップデート前に `keeper_server.coordination_settings.async_replication` を 0 に設定しておき、アップデート完了後に有効化することもできます。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515)（[Antonio Andelic](https://github.com/antonio2368)）。





#### 新機能

* 負の `LIMIT` および負の `OFFSET` のサポートを追加しました。 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913) をクローズします。 [#88411](https://github.com/ClickHouse/ClickHouse/pull/88411) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* `Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取りおよび書き込み操作はターゲットテーブルに転送され、エイリアス自体はデータを保持せず、ターゲットテーブルへの参照だけを維持します。[#87965](https://github.com/ClickHouse/ClickHouse/pull/87965)（[Kai Zhu](https://github.com/nauu)）。
* 演算子 `IS NOT DISTINCT FROM` (`<=>`) を完全にサポートしました。 [#88155](https://github.com/ClickHouse/ClickHouse/pull/88155) ([simonmichal](https://github.com/simonmichal)).
* `MergeTree` テーブル内の、対象となるすべてのカラムに対して統計を自動的に作成する機能を追加しました。作成する統計の種類をカンマ区切りで指定するテーブルレベル設定 `auto_statistics_types` を追加しました（例: `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ))。
* テキスト向けの新しいブルームフィルターインデックス `sparse_gram`。 [#79985](https://github.com/ClickHouse/ClickHouse/pull/79985) ([scanhex12](https://github.com/scanhex12))。
* 基数を変換する新しい `conv` 関数を追加しました。現在は `2-36` の基数をサポートしています。[#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator))。
* `LIMIT BY ALL` 構文のサポートを追加しました。`GROUP BY ALL` や `ORDER BY ALL` と同様に、`LIMIT BY ALL` は SELECT 句内のすべての非集約式を自動的に展開し、`LIMIT BY` のキーとして使用します。たとえば、`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` は `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name` と等価です。この機能により、選択した非集約列すべてで制限をかけたい場合に、それらを明示的に列挙する必要がなくなり、クエリが簡素化されます。[#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) をクローズしました。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* ClickHouse で Apache Paimon をクエリできるようにする機能を追加しました。この統合により、ClickHouse ユーザーは Paimon のデータレイクストレージに直接アクセスできるようになります。[#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98)).
* `studentTTestOneSample` 集約関数を追加しました。 [#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 集約関数 `quantilePrometheusHistogram`。この関数は、ヒストグラムバケットの上限値と累積値を引数として受け取り、分位点の位置が含まれるバケットについて、その下限値と上限値の間で線形補間を行います。クラシックなヒストグラムに対する PromQL の `histogram_quantile` 関数と同様の動作をします。 [#86294](https://github.com/ClickHouse/ClickHouse/pull/86294) ([Stephen Chi](https://github.com/stephchi0))。
* Delta Lake のメタデータファイル向けの新しいシステムテーブル。 [#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12))。
* `ALTER TABLE REWRITE PARTS` を追加 - テーブルパーツを一から書き換え、すべての新しい設定を使用して再生成します（`use_const_adaptive_granularity` のように、新しいパーツに対してのみ適用されるものがあるため）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* ZooKeeper の切断と再接続を強制するための `SYSTEM RECONNECT ZOOKEEPER` コマンドを追加（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。 [#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* `max_named_collection_num_to_warn` と `max_named_collection_num_to_throw` の設定により、名前付きコレクションの数を制限できるようにしました。新しいメトリクス `NamedCollection` とエラー `TOO_MANY_NAMED_COLLECTIONS` を追加しました。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos))。
* `startsWith` および `endsWith` 関数の大文字小文字を区別しない最適化版として、`startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8`、`endsWithCaseInsensitiveUTF8` を追加しました。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374)（[Guang Zhao](https://github.com/zheguang)）。
* サーバー設定の「resources&#95;and&#95;workloads」セクションを利用して、SQL で `WORKLOAD` および `RESOURCE` 定義を指定できるようにしました。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa))。
* テーブル設定 `min_level_for_wide_part` を追加し、パーツをワイドパーツとして作成するための最小レベルを指定できるようにしました。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm)).
* Keeper クライアントに `cp`/`cpr` および `mv`/`mvr` コマンドの再帰バリアントを追加。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 挿入時のマテリアライズからスキップインデックスのリストを除外するためのセッション設定（`exclude_materialize_skip_indexes_on_insert`）を追加しました。マージ時のマテリアライズからスキップインデックスのリストを除外するための MergeTree テーブル設定（`exclude_materialize_skip_indexes_on_merge`）を追加しました。 [#87252](https://github.com/ClickHouse/ClickHouse/pull/87252)（[George Larionov](https://github.com/george-larionov)）。



#### 実験的機能
* ベクトルをビットスライス形式で格納する `QBit` データ型と、パラメータによって精度と速度のトレードオフを制御しながら近似ベクトル検索を行える `L2DistanceTransposed` 関数を実装しました。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 関数 `searchAll` と `searchAny` は、テキスト列を含まない列でも動作するようになりました。その場合は、デフォルトのトークナイザを使用します。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus)).



#### パフォーマンスの向上

* `JOIN` および `ARRAY JOIN` において遅延カラムレプリケーションを実装しました。一部の出力フォーマットでは、Sparse や Replicated のような特殊なカラム表現をフルカラムに変換しないようにしました。これにより、メモリ内での不要なデータコピーを回避します。 [#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree テーブルのトップレベルの String カラムに対して、圧縮を改善し、効率的なサブカラムアクセスを可能にするため、オプションの `.size` サブカラムシリアライゼーションを追加しました。シリアライゼーションのバージョン管理および空文字列に対する式の最適化のための新しい MergeTree 設定を導入しました。 [#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* Iceberg 向けの順序付き読み取りをサポート。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12))。
* 実行時に右部分木から Bloom フィルターを構築し、このフィルターを左部分木側のスキャンに渡すことで、一部の JOIN クエリを高速化します。これは、`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` のようなクエリで有効な場合があります。[#84772](https://github.com/ClickHouse/ClickHouse/pull/84772)（[Alexander Gololobov](https://github.com/davenger)）。
* Query Condition Cache (QCC) とインデックス解析の順序および統合をリファクタリングすることで、クエリ性能を改善しました。QCC のフィルタリングは、プライマリキーおよび skip インデックスの解析より前に適用されるようになり、不要なインデックス計算が削減されます。インデックス解析は複数の範囲フィルタをサポートするように拡張され、そのフィルタリング結果は QCC に再度書き戻されるようになりました。これにより、実行時間の大半をインデックス解析が占めるクエリ、特に skip インデックス（例: ベクターインデックスや反転インデックス）に依存するクエリが大幅に高速化されます。 [#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird)).
* 小規模クエリを高速化するための多数のマイクロ最適化。 [#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano)).
* ネイティブプロトコルでログとプロファイルイベントを圧縮するようにしました。100 以上のレプリカを持つクラスターでは、非圧縮のプロファイルイベントが 1..10 MB/秒を使用し、低速なインターネット接続では進行状況バーの動作が重くなります。これにより [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533) が解決されました。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 大文字小文字を区別する文字列検索（`WHERE URL LIKE '%google%'` のようなフィルタリング操作）の性能を、[StringZilla](https://github.com/ashvardanian/StringZilla) ライブラリを用いることで改善し、利用可能な場合には SIMD CPU 命令を使用するようにしました。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* テーブルに `SimpleAggregateFunction(anyLast)` 型のカラムがある場合に、`FINAL` 付きで aggregating merge tree テーブルを `SELECT` する際のメモリ割り当ておよびメモリコピーを削減しました。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* `JOIN` 述語における論理和条件のプッシュダウンロジックを導入しました。例として、TPC-H Q7 で 2 つのテーブル n1 と n2 に対して `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')` という条件がある場合、各テーブル用に個別の部分フィルタを抽出し、n1 には `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`、n2 には `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'` を適用します。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しいデフォルト設定 `optimize_rewrite_like_perfect_affix` により、接頭辞または接尾辞を伴う `LIKE` のパフォーマンスが向上します。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 複数の文字列/数値カラムでの `GROUP BY` 時に、大きなシリアライズ済みキーが原因で発生していたパフォーマンス低下を修正しました。これは [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) のフォローアップです。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 多くのキーごとに多数のマッチが発生するハッシュ結合におけるメモリ使用量を削減するため、新しい `joined_block_split_single_row` 設定を追加しました。これにより、左テーブルの単一行に対するマッチであっても、その中でハッシュ結合結果をチャンクに分割できるようになります。これは特に、左テーブルの1行が右テーブルの数千〜数百万行にマッチする場合に有用です。以前は、すべてのマッチを一度にメモリ上にマテリアライズする必要がありました。これによりピーク時のメモリ使用量は削減されますが、CPU使用量が増加する可能性があります。 [#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* SharedMutex の改善（多数の同時クエリにおけるパフォーマンスを向上）。 [#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano)).
* 低頻度トークンが大半を占めるドキュメントに対するテキストインデックス構築のパフォーマンスを改善しました。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ)).
* `Field` デストラクタの一般的なケースを高速化し（多数の小さなクエリでのパフォーマンスを改善）、 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631)（[Raúl Marín](https://github.com/Algunenano)）。
* JOIN の最適化時にランタイムのハッシュテーブル統計の再計算をスキップするようにしました（JOIN を含むすべてのクエリのパフォーマンスが向上します）。新しいプロファイルイベント `JoinOptimizeMicroseconds` と `QueryPlanOptimizeMicroseconds` を追加しました。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir))。
* MergeTreeLazy リーダーでマークをキャッシュに保存し、直接 IO を行わずに済むようにしました。これにより、ORDER BY と小さな LIMIT を含むクエリのパフォーマンスが向上します。 [#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat))。
* `is_deleted` 列を持つ `ReplacingMergeTree` テーブルに対する `FINAL` 句付きの SELECT クエリが、既存の 2 つの最適化による並列化の改善により、より高速に実行されるようになりました。1. テーブル内で単一の `part` しか持たないパーティションに対する `do_not_merge_across_partitions_select_final` 最適化。2. テーブル内のその他の選択された範囲を `intersecting / non-intersecting` に分割し、`intersecting` な範囲のみが FINAL のマージ変換を通過するようにしたこと。 [#88090](https://github.com/ClickHouse/ClickHouse/pull/88090) ([Shankar Iyer](https://github.com/shankar-iyer)).
* フェイルポイントを使用しない場合（デバッグが無効なときのデフォルトコードパス）の影響を軽減しました。 [#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* `uuid` でフィルタする際に `system.tables` の全表スキャンを回避（ログや zookeeper パスから UUID しか取得できない場合に便利）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 関数 `tokens`、`hasAllTokens`、`hasAnyTokens` のパフォーマンスを向上しました。[#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ))。
* 一部のケースで JOIN のパフォーマンスをわずかに向上させるため、`AddedColumns::appendFromBlock` をインライン化しました。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat))。
* クライアントのオートコンプリートは、複数の system テーブルにクエリを発行するのではなく `system.completions` を使用することで、より高速かつ一貫性の高い動作になります。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m)).
* 辞書圧縮を制御するための新しいテキストインデックスパラメータ `dictionary_block_frontcoding_compression` を追加しました。デフォルトでは有効になっており、`front-coding` 圧縮を使用します。 [#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 設定 `min_insert_block_size_rows_for_materialized_views` および `min_insert_block_size_bytes_for_materialized_views` に応じて、マテリアライズドビューへの挿入前にすべてのスレッドからのデータを一括でマージします。以前は、`parallel_view_processing` が有効な場合、特定のマテリアライズドビューに対して各スレッドが挿入データを個別にマージしており、その結果、生成されるパーツ数が多くなる可能性がありました。 [#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368)).
* 一時ファイル書き込み用バッファのサイズを制御するための設定 `temporary_files_buffer_size` を追加。* `LowCardinality` 列に対して、（たとえば grace hash join で使用される）`scatter` 演算のメモリ消費を最適化。[#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 並列レプリカ環境でのテキストインデックスからの直接読み取りをサポートしました。オブジェクトストレージ上のテキストインデックス読み取りパフォーマンスを改善しました。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* Data Lakes カタログのテーブルを使用するクエリでは、分散処理のために parallel replicas が利用されます。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* バックグラウンドマージアルゴリズムのチューニング用内部ヒューリスティックである「to&#95;remove&#95;small&#95;parts&#95;at&#95;right」は、マージ範囲スコアの計算前に実行されるようになります。それ以前は、マージセレクタが広い範囲のマージを選択し、その後でその末尾部分をフィルタリングしていました。修正: [#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736) ([Mikhail Artemenko](https://github.com/Michicosun))。





#### 改善

* 関数 `generateSerialID` が、系列名に対して非定数引数をサポートするようになりました。 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750) をクローズ。 [#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しいシーケンスの開始値を指定できるようにするため、`generateSerialID` 関数にオプションの `start_value` パラメータを追加しました。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma)).
* `clickhouse-format` に `--semicolons_inline` オプションを追加し、クエリを整形する際にセミコロンが新しい行ではなく最後の行に配置されるようにしました。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan)).
* Keeper で設定が上書きされている場合でも、サーバーレベルのスロットリングを設定できるようにしました。[#73964](https://github.com/ClickHouse/ClickHouse/issues/73964) をクローズ。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066)（[JIaQi](https://github.com/JiaQiTang98)）。
* `mannWhitneyUTest` は、両方のサンプルが同一の値のみを含む場合に、例外をスローしなくなりました。SciPy と整合する有効な結果を返すようになりました。これにより次の Issue がクローズされました: [#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht)).
* メタデータトランザクションがコミットされた場合、rewrite disk のオブジェクトストレージトランザクションは、以前のリモート BLOB を削除します。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema))。
* 結果型の `LowCardinality` が最適化の前後で異なる場合に、冗長な等価式に対する最適化パスが正しく動作しない問題を修正しました。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* HTTP クライアントが `Expect: 100-continue` に加えてヘッダー `X-ClickHouse-100-Continue: defer` を設定すると、ClickHouse はクォータ検証に合格するまでクライアントに `100 Continue` レスポンスを送信しません。これにより、どうせ破棄されるリクエストボディを送信することによるネットワーク帯域の無駄を防ぎます。これは、クエリ自体は URL のクエリ文字列で送信し、データをリクエストボディで送信する INSERT クエリに関係します。ボディ全体を送信せずにリクエストを中止すると、HTTP/1.1 でのコネクション再利用はできなくなりますが、新しいコネクションを確立することで発生する追加のレイテンシは、大量のデータを扱う場合の INSERT 全体の処理時間と比べると、通常は無視できる程度です。[#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end))。
* S3 ストレージを使用する `DATABASE ENGINE = Backup` 利用時に、ログ内の S3 認証情報をマスクするようにしました。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* 相関サブクエリの入力サブプランのマテリアライズを遅らせることで、クエリプランの最適化内容をそのサブプランからも利用できるようにする。[#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。 [#85455](https://github.com/ClickHouse/ClickHouse/pull/85455) ([Dmitry Novik](https://github.com/novikd))。
* SYSTEM DROP DATABASE REPLICA の変更点: - データベースと一緒に削除する場合、またはレプリカ全体を削除する場合: データベース内の各テーブルのレプリカも削除されます - `WITH TABLES` が指定されている場合、各ストレージのレプリカを削除します - それ以外の場合、ロジックは変更されず、データベースのレプリカのみを削除します - Keeper パス付きでデータベースレプリカを削除する場合: - `WITH TABLES` が指定されている場合: - データベースを Atomic として復元します - Keeper 内のステートメントから RMT テーブルを復元します - データベースを削除します（復元されたテーブルも削除されます） - それ以外の場合、指定された Keeper パス上のレプリカのみを削除します。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach))。
* `materialize` 関数を含む場合の TTL の書式の不整合を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg テーブルの状態は、もはやストレージオブジェクト内には保存されなくなりました。これにより、ClickHouse の Iceberg を同時実行されるクエリでも利用できるようになります。 [#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik)).
* `use_persistent_processing_nodes = 1` の場合の処理ノードと同様に、S3Queue の ordered モードにおける bucket lock を永続モードにします。テストに keeper のフォールトインジェクションを追加します。 [#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii))。
* フォーマット名にタイプミスがある場合にユーザーへヒントを表示するようにしました。 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761) をクローズ。 [#87092](https://github.com/ClickHouse/ClickHouse/pull/87092) ([flynn](https://github.com/ucasfl))。
* リモートレプリカは、プロジェクションがない場合にインデックス解析をスキップするようになりました。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* ytsaurus テーブルで `utf8` エンコーディングを無効化できるようにしました。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `s3_slow_all_threads_after_retryable_error` をデフォルトで無効にしました。[#87198](https://github.com/ClickHouse/ClickHouse/pull/87198)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* テーブル関数 `arrowflight` を `arrowFlight` にリネームします。 [#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar))。
* `clickhouse-benchmark` を更新し、CLI フラグで `_` の代わりに `-` を使用できるようにしました。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda))。
* シグナル処理時の `system.crash_log` へのフラッシュを同期的に行うようにしました。 [#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `ORDER BY` 句を含まない最上位の `SELECT` クエリに `ORDER BY rand()` を挿入する設定 `inject_random_order_for_select_without_order_by` を追加しました。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn)).
* `joinGet` のエラーメッセージを改善し、`join_keys` の数が `right_table_keys` の数と一致しない場合にそれを正しく示すようにしました。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 書き込みトランザクション中に任意の Keeper ノードの stat をチェックできる機能を追加しました。これにより、ABA 問題の検出に役立ちます。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 負荷の高い ytsaurus リクエストを heavy プロキシにリダイレクトします。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* unlink/rename/removeRecursive/removeDirectory などの操作のロールバック処理と、あらゆるワークロードにおけるディスクトランザクション由来メタデータのハードリンク数を修正し、さらにインターフェイスをより汎用的に単純化して、他のメタストアでも再利用できるようにしました。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper 用に `TCP_NODELAY` を無効化できる `keeper_server.tcp_nodelay` 設定パラメータを追加しました。 [#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* `clickhouse-benchmarks` で `--connection` をサポートしました。これは `clickhouse-client` でサポートされているものと同様で、クライアントの `config.xml` / `config.yaml` の `connections_credentials` パス配下に事前定義された接続を指定することで、コマンドライン引数でユーザー名やパスワードを明示的に指定する必要がなくなります。`clickhouse-benchmark` に `--accept-invalid-certificate` のサポートを追加しました。 [#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat)).
* `max_insert_threads` の設定が Iceberg テーブルにも適用されるようになりました。 [#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin)).
* `PrometheusMetricsWriter` にヒストグラムおよびディメンションメトリクスを追加します。これにより、`PrometheusRequestHandler` ハンドラーは必要なメトリクスをすべて備えることになり、クラウド環境で信頼性が高くオーバーヘッドの小さいメトリクス収集に利用できるようになります。 [#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 関数 `hasToken` は、空のトークンに対しては（以前は例外をスローしていましたが）一致数ゼロを返すようになりました。 [#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* `Array` および `Map`（`mapKeys` と `mapValues`）の値に対するテキストインデックスのサポートを追加しました。サポートされる関数は `mapContainsKey` と `has` です。 [#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 期限切れになったグローバル ZooKeeper セッション数を示す新しい `ZooKeeperSessionExpired` メトリクスを追加しました。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* バックアップ先へのサーバーサイド（ネイティブ）コピーには、バックアップ専用の設定（例: backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）を持つ S3 storage client を使用する。s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error を廃止する。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 実験的機能である `make_distributed_plan` を用いたクエリプランのシリアライズ時に、設定 `max_joined_block_size_rows` および `max_joined_block_size_bytes` が正しく処理されない問題を修正しました。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 設定 `enable_http_compression` がデフォルトになりました。これは、クライアントが HTTP 圧縮を受け入れる場合、サーバーがそれを使用することを意味します。ただし、この変更にはいくつかのデメリットがあります。クライアントは `bzip2` のような重い圧縮方式を要求でき、これは現実的とは言えず、サーバーのリソース消費を増加させます（ただし、これは大きな結果セットが転送される場合にのみ顕在化します）。クライアントは `gzip` を要求することもできますが、これはそれほど悪くはないものの、`zstd` と比較すると最適ではありません。[#71591](https://github.com/ClickHouse/ClickHouse/issues/71591) をクローズ。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.server_settings` に新しいエントリ `keeper_hosts` を追加し、ClickHouse が接続できる [Zoo]Keeper ホストの一覧を参照できるようにしました。 [#87718](https://github.com/ClickHouse/ClickHouse/pull/87718) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 履歴調査を容易にするため、system ダッシュボードに `from` と `to` の値を追加しました。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* Iceberg の `SELECT` におけるパフォーマンス追跡のための情報をさらに追加しました。 [#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik))。
* ファイルシステムキャッシュの改善: キャッシュ内の領域を同時に予約している複数スレッド間で、キャッシュ優先度イテレータを再利用するようにしました。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Keeper` に対するリクエストサイズを制限する機能を追加（`ZooKeeper` の `jute.maxbuffer` と同等の `max_request_size` 設定。後方互換性のためデフォルトは OFF で、今後のリリースで有効化される予定）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark` がデフォルトでエラーメッセージにスタックトレースを含めないようにしました。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* マークがキャッシュ内にある場合は、スレッドプールによる非同期マーク読み込み（`load_marks_asynchronously=1`）は使用しないでください（スレッドプールが逼迫している可能性があり、マークがすでにキャッシュに存在していても、クエリがその影響によるオーバーヘッドを受けてしまうためです）。[#87967](https://github.com/ClickHouse/ClickHouse/pull/87967)（[Azat Khuzhin](https://github.com/azat)）。
* Ytsaurus: 列の一部だけを指定して table/table functions/dictionaries を作成できるようにしました。 [#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* これ以降、`system.zookeeper_connection_log` はデフォルトで有効となり、Keeper セッションに関する情報の取得に利用できます。 [#88011](https://github.com/ClickHouse/ClickHouse/pull/88011) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 重複した外部テーブルが渡された場合の TCP と HTTP の動作を統一しました。HTTP では、一時テーブルを複数回渡すことができます。 [#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema)).
* Arrow/ORC/Parquet の読み取り用にカスタム `MemoryPools` を削除します。すべてのアロケーションを追跡するようになった [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 以降は、このコンポーネントは不要になったと考えられます。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 引数なしで `Replicated` データベースを作成できるようにしました。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`: clickhouse-keeper の TLS ポートへの接続をサポートし、フラグ名は `clickhouse-client` と同じにしました。 [#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* メモリ制限超過によりバックグラウンドマージが拒否された回数を追跡する新しいプロファイルイベントを追加しました。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse))。
* CREATE/ALTER TABLE のカラム既定値式の検証向けにアナライザーを有効化しました。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus)).
* 内部クエリプランニングの改善：`CROSS JOIN` に対して `JoinStepLogical` を使用。[#88151](https://github.com/ClickHouse/ClickHouse/pull/88151)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `hasAnyTokens`（`hasAnyToken`）および `hasAllTokens`（`hasAllToken`）関数にエイリアスを追加しました。 [#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* グローバルなサンプリングプロファイラをデフォルトで有効化しました（つまり、クエリに関連しないサーバースレッドも含めて有効化）。すべてのスレッドについて、CPU 時間と実時間のそれぞれ 10 秒ごとにスタックトレースを収集します。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* コピーおよびコンテナ作成機能で発生していた &#39;Content-Length&#39; の問題を解消する Azure SDK の修正版を取り込みました。 [#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* MySQL との互換性のため、関数 `lag` を大文字小文字を区別しないようにしました。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* `clickhouse-server` ディレクトリから `clickhouse-local` を起動できるようにしました。以前のバージョンでは、`Cannot parse UUID: .` というエラーが発生していました。これにより、サーバーを起動することなく、`clickhouse-local` を起動してサーバーのデータベースを操作できるようになりました。 [#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `keeper_server.coordination_settings.check_node_acl_on_remove` 設定を追加しました。有効化されている場合、各ノードの削除前に、そのノード自身と親ノードの両方の ACL が検証されます。無効化されている場合は、親ノードの ACL のみが検証されます。 [#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368)).
* `Vertical` フォーマット使用時に、`JSON` カラムが整形表示（プリティプリント）されるようになりました。[#81794](https://github.com/ClickHouse/ClickHouse/issues/81794) をクローズ。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* ホームディレクトリのルートではなく、[XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 仕様で定義されている場所に `clickhouse-client` のファイル（例: クエリ履歴）を保存するようにしました。`~/.clickhouse-client-history` がすでに存在する場合は、引き続きそのファイルが使用されます。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `GLOBAL IN` に起因するメモリリークを修正します（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* 文字列入力を受け取れるようにするため、`hasAny`/`hasAllTokens` にオーバーロードを追加しました。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* 起動時に `clickhouse-keeper` が自動起動するようにするため、postinstall スクリプトにステップを追加しました。[#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan))。
* Web UI では、キー入力のたびではなく、貼り付け時にのみ認証情報をチェックするようにしました。これにより、設定が誤っている LDAP サーバーで発生する問題を回避できます。これにより [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777) がクローズされました。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 制約違反が発生した場合の例外メッセージの長さを制限します。以前のバージョンでは、非常に長い文字列を挿入すると、同様に非常に長い例外メッセージが生成され、それが最終的に query&#95;log に書き込まれることがありました。[#87032](https://github.com/ClickHouse/ClickHouse/issues/87032) をクローズ。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* テーブル作成時に ArrowFlight サーバーからデータセット構造を取得する処理を修正。 [#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* クライアントプロトコルエラーを引き起こしていた GeoParquet の問題を修正しました。 [#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* イニシエーターノード上のサブクエリ内で `shardNum()` のようなホスト依存関数を解決する処理を修正します。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa))。
* `parseDateTime64BestEffort`、`change{Year,Month,Day}`、`makeDateTime64` など、さまざまな日時関連関数において、エポック以前の日付での小数秒の扱いが誤っていた問題を修正しました。以前は、小数部分を秒に加算すべきところを減算していました。例えば、`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` は、本来であれば `1969-01-01 00:00:00.468` を返すべきところを、`1968-12-31 23:59:59.532` を返していました。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 同一の ALTER 文の中でカラムの状態が変更される場合に `ALTER COLUMN IF EXISTS` コマンドが失敗していた問題を修正しました。`DROP COLUMN IF EXISTS`、`MODIFY COLUMN IF EXISTS`、`COMMENT COLUMN IF EXISTS`、および `RENAME COLUMN IF EXISTS` などのコマンドは、同じ文内で前のコマンドによってカラムが削除されている場合を正しく処理できるようになりました。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* サポート対象範囲外の日付に対する `Date` / `DateTime` / `DateTime64` 型の推論処理を修正。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184)（[Pavel Kruglov](https://github.com/Avogar)）。
* 一部の有効なユーザー送信データを `AggregateFunction(quantileDD)` 列に書き込むと、マージ処理が無限再帰してクラッシュする可能性があった問題を修正しました。 [#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi)).
* `cluster` テーブル関数で作成されたテーブルで JSON/Dynamic 型がサポートされるようになりました。 [#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar))。
* CTE で計算された関数の結果がクエリ内で非決定的になる問題を修正。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 主キー列に対する `pointInPolygon` を用いた `EXPLAIN` で発生する `LOGICAL_ERROR` を修正。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 名前にパーセントエンコードされたシーケンスを含むデータレイクテーブルを修正。 [#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) をクローズ。 [#87020](https://github.com/ClickHouse/ClickHouse/pull/87020) ([Anton Ivashkin](https://github.com/ianton-ru))。
* `optimize_functions_to_subcolumns` を使用した `OUTER JOIN` において、Nullable 列での `IS NULL` の不正な動作を修正し、[#78625](https://github.com/ClickHouse/ClickHouse/issues/78625) をクローズしました。 [#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `max_temporary_data_on_disk_size` 制限トラッキングにおける一時データ解放の誤った計上を修正しました。[#87118](https://github.com/ClickHouse/ClickHouse/issues/87118) をクローズ。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140) ([JIaQi](https://github.com/JiaQiTang98))。
* 関数 `checkHeaders` は、指定されたヘッダーを正しく検証し、禁止されているヘッダーを拒否するようになりました。原著者: Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* すべての数値型に対して `toDate` および `toDate32` の動作を統一しました。int16 からのキャスト時における Date32 のアンダーフロー検査を修正しました。 [#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 特に、複数の `JOIN` を含むクエリで `LEFT` / `INNER JOIN` の後に `RIGHT JOIN` が続く場合に、parallel replicas で発生していた論理エラーを修正しました。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter))。
* スキーマ推論キャッシュで `input_format_try_infer_variants` 設定が尊重されるようにしました。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* pathStartsWith がプレフィックス以下のパスにのみマッチするようにしました。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* `_row_number` 仮想カラムおよび Iceberg の positioned delete における論理エラーを修正しました。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321))。
* const ブロックと非 const ブロックが混在していることが原因で `JOIN` で発生していた `LOGICAL_ERROR`「Too large size passed to allocator」を修正しました。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 別の `MergeTree` テーブルから読み取るサブクエリを使用した軽量な更新が正しく動作しない問題を修正。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* `row policy` が存在する場合に動作していなかった move-to-prewhere 最適化を修正しました。[#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) の続きです。[#69777](https://github.com/ClickHouse/ClickHouse/issues/69777) をクローズします。[#83748](https://github.com/ClickHouse/ClickHouse/issues/83748) をクローズします。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `DEFAULT` 式を持ちながらデータパーツに存在しない列へのパッチ適用の問題を修正しました。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* MergeTree テーブルでパーティションフィールド名が重複している場合に発生していたセグメンテーションフォールトを修正しました。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* EmbeddedRocksDB のアップグレードを修正しました。 [#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* オブジェクトストレージ上のテキストインデックスからの直接読み取りの問題を修正しました。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないエンジンに対して特権が作成されないようにしました。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* `s3_plain_rewritable` では `not found` エラーのみを無視するようにしました（それ以外を無視すると、さまざまな問題につながる可能性があります）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* YTSaurus ソースおよび *range&#95;hashed レイアウトを使用するディクショナリを修正しました。 [#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 空のタプルの配列を作成する処理を修正しました。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 一時テーブル作成時に不正なカラムがないかチェックするようにしました。 [#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* hive のパーティション列をフォーマットヘッダーに含めないようにしました。 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515) を修正。 [#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* テキスト形式が使用されている場合の、DeltaLake からの読み取り準備処理を修正しました。 [#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* Buffer テーブルに対する SELECT および INSERT のアクセス検証を修正。 [#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit)).
* S3 テーブルに対してデータスキッピングインデックスを作成できないようにしました。 [#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc)).
* 非同期ロギングにおける追跡メモリのリークを回避しました（10時間で約100GiBといった大きな乖離が生じ得る）、および text&#95;log（同程度の乖離が生じる可能性があります）。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* View または Materialized View が非同期で削除され、バックグラウンドでのクリーンアップが完了する前にサーバーが再起動された場合に、その View の `SELECT` 設定によってグローバルなサーバー設定が上書きされてしまう可能性があったバグを修正しました。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix)).
* メモリ過負荷の警告を計算する際、可能であればユーザー空間のページキャッシュのバイト数を除外するようにしました。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* CSV デシリアライズ中の型の順序が誤っている場合に `LOGICAL_ERROR` が発生していたバグを修正しました。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 実行可能ディクショナリに対する `command_read_timeout` の誤った処理を修正しました。 [#87627](https://github.com/ClickHouse/ClickHouse/pull/87627) ([Azat Khuzhin](https://github.com/azat)).
* 新しい analyzer 使用時に、置換された列でフィルタリングする際の `SELECT * REPLACE` の `WHERE` 句における誤った動作を修正しました。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `Distributed` 上で `Merge` を使用した場合の 2 段階集約の動作を修正しました。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* `right row list` が使用されていない場合の `HashJoin` アルゴリズムにおける出力ブロック生成を修正。[#87401](https://github.com/ClickHouse/ClickHouse/issues/87401) を解決。 [#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* インデックス解析を適用した結果、読み取るデータが存在しない場合に、`parallel replicas` の読み取りモードが誤って選択されることがありました。 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653) をクローズ。 [#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi))。
* Glue における `timestamp` / `timestamptz` 列の扱いを修正しました。 [#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand)).
* これは [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587) をクローズします。 [#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* PostgreSQL インターフェイスでの boolean 値の書き込み処理を修正。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* CTE を含む `INSERT SELECT` クエリで発生する unknown table エラーを修正。 [#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。 [#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* `Nullable` 内に置くことができない `Variant` から `null` の `Map` サブカラムを読み取る処理を修正。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* セカンダリノード上のクラスタでデータベースを完全に削除できなかった場合のエラー処理を修正しました。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* skip インデックスに関する複数のバグを修正しました。 [#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* AzureBlobStorage において、まずネイティブコピーを試し、&#39;Unauthorized&#39; エラーが発生した場合には読み取り &amp; 書き込み方式に切り替えるように更新しました（AzureBlobStorage では、ソースとデスティネーションでストレージアカウントが異なる場合に &#39;Unauthorized&#39; エラーが発生します）。また、設定でエンドポイントが定義されている場合に「use&#95;native&#95;copy」が適用されるよう修正しました。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* ArrowStream ファイルに重複した辞書が含まれている場合に ClickHouse がクラッシュする問題を修正。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn))。
* approx&#95;top&#95;k と finalizeAggregation の使用時に発生する致命的な不具合を修正。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 最後のブロックが空の場合の projection を伴うマージ処理を修正しました。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano)).
* 引数の型が `GROUP BY` で許可されていない場合でも、`GROUP BY` から単射関数を削除しないようにしました。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリで `session_timezone` 設定を使用している場合に、日時ベースのキーに対する granules/partitions の誤った除外が行われる問題を修正しました。 [#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa)).
* PostgreSQL Interface でのクエリ実行後に、影響を受けた行数を返すようになりました。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov)).
* 誤った結果を引き起こす可能性があるため、PASTE JOIN に対するフィルタープッシュダウンの使用を制限しました。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) で導入された権限チェックの評価前に URI の正規化を行います。[#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 新しいアナライザーで `ARRAY JOIN COLUMNS()` がどの列にも一致しない場合に発生する論理エラーを修正。 [#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* &quot;High ClickHouse memory usage&quot; 警告を修正（ページキャッシュを除外）。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* `TTL` が設定された set 型カラムを持つ `MergeTree` テーブルで発生し得たデータ破損の不具合を修正しました。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* `PostgreSQL` や `SQLite` などの外部データベースに無効なテーブルがアタッチされている場合に、`system.tables` の読み取り中に未処理の例外が発生する可能性がある問題を修正しました。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 空のタプル引数で呼び出された際にクラッシュしていた `mortonEncode` および `hilbertEncode` 関数を修正しました。 [#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `ON CLUSTER` クエリは、クラスタ内に非アクティブなレプリカがある場合でも、以前より短い時間で完了するようになりました。 [#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin))。
* 現在、DDL worker はレプリカセットから古くなったホストをクリーンアップするようになりました。これにより、ZooKeeper に保存されるメタデータ量が削減されます。 [#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin)).
* ClickHouse を cgroups なしで実行できない問題を修正しました（非同期メトリクスに対して、誤って cgroups を必須としてしまっていました）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* エラー発生時に、ディレクトリ移動操作を正しく取り消せるようにしました。実行中に変更された `prefix.path` オブジェクトは、ルートだけでなくすべて書き戻す必要があります。 [#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `ColumnLowCardinality` における `is_shared` フラグの伝播を修正しました。`ReverseIndex` でハッシュ値がすでに事前計算およびキャッシュされた後に列へ新しい値が挿入されると、`GROUP BY` の結果が誤る可能性がありました。 [#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat)).
* ワークロード設定 `max_cpu_share` の不具合を修正しました。これにより、`max_cpus` ワークロード設定が未設定の場合でも使用できるようになりました。 [#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria)).
* サブクエリを含む非常に重い mutation が prepare 段階で進行しなくなってしまう不具合を修正しました。これらの mutation は、`SYSTEM STOP MERGES` で停止できるようになりました。[#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin))。
* 相関サブクエリがオブジェクトストレージでも利用できるようになりました。 [#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin)).
* `system.projections` および `system.data_skipping_indices` へアクセスしている間は、DataLake データベースの初期化を行わないでください。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat))。
* 今後は、`show_data_lake_catalogs_in_system_tables` が明示的に有効化されている場合にのみ、datalakes カタログが system introspection テーブルに表示されます。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin))。
* DatabaseReplicated が `interserver_http_host` 設定を正しく参照するように修正しました。 [#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `Projections` を定義するコンテキストでは、位置引数が明示的に無効化されました。この内部クエリ段階では位置引数は意味をなさないためです。これにより [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604) が修正されました。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* `countMatches` 関数の二次計算量の問題を修正。 [#88400](https://github.com/ClickHouse/ClickHouse/issues/88400) をクローズ。 [#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* KeeperMap テーブルに対する `ALTER COLUMN ... COMMENT` コマンドをレプリケートし、Replicated データベースのメタデータにコミットされ、すべてのレプリカへ伝播されるようにしました。[#88077](https://github.com/ClickHouse/ClickHouse/issues/88077) をクローズします。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408)（[Eduard Karacharov](https://github.com/korowa)）。
* Database Replicated における Materialized View の誤った循環依存関係の検出を修正し、新しいレプリカをデータベースに追加できなくなっていた問題を解消しました。 [#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique)).
* `group_by_overflow_mode` が `any` に設定されている場合のスパース列の集約処理を修正。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa))。
* `query_plan_use_logical_join_step=0` を複数の FULL JOIN USING 句と併用した際に発生する「column not found」エラーを修正します。[#88103](https://github.com/ClickHouse/ClickHouse/issues/88103) をクローズ。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* ノード数が 10 を超える大規模クラスタでは、`[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` というエラーにより、リストアが失敗する可能性が高くなります。`num_hosts` ノードが多くのホストによって同時に上書きされてしまうためです。この修正により、試行回数を制御する設定が動的になります。[#87721](https://github.com/ClickHouse/ClickHouse/issues/87721) をクローズします。 [#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* このPRは、23.8およびそれ以前のバージョンとの互換性を確保するためだけのものです。互換性の問題は次のPRによって発生しました: [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) このSQLは `enable_analyzer=0` の場合に失敗します（23.8以前では問題ありません）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 大きな値を `DateTime` に変換する際に、`accurateCast` のエラーメッセージで発生していた UBSAN の整数オーバーフローを修正。[#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* タプル型に対する coalescing merge tree を修正。これにより [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469) がクローズされます。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* `iceberg_format_version=1` に対する削除を禁止。これにより [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444) がクローズされました。 [#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* このパッチは、任意の深さのフォルダーに対する `plain-rewritable` ディスクの移動操作を修正します。 [#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun))。
* `*cluster` 関数における `SQL SECURITY DEFINER` の動作を修正しました。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 基盤となる `const PREWHERE` 列の同時ミューテーションが原因で発生しうるクラッシュを修正しました。 [#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat)).
* テキストインデックスからの読み取りを修正し、クエリ条件キャッシュを有効にしました（設定 `use_skip_indexes_on_data_read` および `use_query_condition_cache` を有効にした場合）。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` からスローされた `Poco::TimeoutException` 例外により、SIGABRT でクラッシュします。 [#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) にバックポート済み: 復旧後、Replicated データベースのレプリカが `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを長時間出力し続け、スタックした状態になることがありましたが、この問題は修正されました。 [#88671](https://github.com/ClickHouse/ClickHouse/pull/88671) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 設定の再読み込み後に ClickHouse が初めて接続する場合の `system.zookeeper_connection_log` への追記処理を修正しました。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* `date_time_overflow_behavior = 'saturate'` を使用して DateTime64 を Date に変換する際、タイムゾーンを扱う場合に範囲外の値に対して誤った結果が返される可能性があった不具合を修正しました。 [#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* キャッシュを有効にした s3 テーブルエンジンで発生する「ゼロバイトエラー」を修正する N 回目の試み。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `loop` テーブル関数に対する `SELECT` のアクセス検証を修正しました。 [#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit)).
* 非同期ロギングの失敗時に例外を捕捉し、プログラムの異常終了を防ぎます。 [#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) にバックポート: 単一の引数で呼び出された場合にしきい値パラメータを正しく反映するように `top_k` を修正。 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。 [#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) にバックポート済み: 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、長さ 4 の UTF-8 コードポイントのバイト列を誤って反転していました。これにより [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) にバックポート: SQL SECURITY DEFINER でビューを作成する際に、`SET DEFINER <current_user>:definer` のアクセス権をチェックしないようにしました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) にバックポート済み: 部分的な `QBit` 読み取りの最適化により、`p` が `Nullable` の場合に戻り値の型から誤って `Nullable` が削除されていた `L2DistanceTransposed(vec1, vec2, p)` における `LOGICAL_ERROR` を修正しました。 [#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) でバックポート済み: 不明なカタログタイプでクラッシュする問題を修正。 [#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解消。 [#88987](https://github.com/ClickHouse/ClickHouse/pull/88987) ([scanhex12](https://github.com/scanhex12))。
* [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) にバックポート済み: Skipping index の解析におけるパフォーマンス低下を修正しました。 [#89004](https://github.com/ClickHouse/ClickHouse/pull/89004) ([Anton Popov](https://github.com/CurtizJ))。

#### ビルド/テスト/パッケージングの改善

- `postgres`ライブラリバージョン18.0を使用。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- FreeBSD向けにICUを有効化。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano))。
- SSE 4.2への動的ディスパッチを使用する際に、SSE 4ではなくSSE 4.2を使用するように変更。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano))。
- `Speculative Store Bypass Safe`が利用できない場合、`NO_ARMV81_OR_HIGHER`フラグを不要に変更。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- ClickHouseを`ENABLE_LIBFIU=OFF`でビルドした場合、フェイルポイント関連の関数は何も実行せず、パフォーマンスに影響を与えなくなります。この場合、`SYSTEM ENABLE/DISABLE FAILPOINT`クエリは`SUPPORT_IS_DISABLED`エラーを返します。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end))。

### ClickHouseリリース25.9、2025-09-25 {#259}

#### 後方互換性のない変更

- IPv4/IPv6との無意味な二項演算を無効化：IPv4/IPv6と非整数型との加算/減算を無効化しました。以前は浮動小数点型との演算を許可し、他の一部の型(DateTimeなど)では論理エラーをスローしていました。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano))。
- 設定`allow_dynamic_metadata_for_data_lakes`を非推奨化。現在、すべてのicebergテーブルは各クエリの実行前にストレージから最新のテーブルスキーマを取得するようになりました。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik))。
- `OUTER JOIN ... USING`句における結合カラムの解決をより一貫性のあるものに変更：以前は、OUTER JOINでUSINGカラムと修飾カラム(`a, t1.a, t2.a`)の両方を選択した場合、USINGカラムが誤って`t1.a`に解決され、左側にマッチしない右テーブルの行に対して0/NULLが表示されていました。現在、USING句の識別子は常に結合カラムに解決され、修飾識別子はクエリ内に他のどの識別子が存在するかに関係なく、非結合カラムに解決されます。例：```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前：a=0, t1.a=0, t2.a=2(不正 - 'a'がt1.aに解決される) -- 変更後：a=2, t1.a=0, t2.a=2(正しい - 'a'は結合される)。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir))。
- レプリケーション重複排除ウィンドウを10000まで増加。これは完全に互換性がありますが、多数のテーブルが存在する場合、この変更が高いリソース消費につながるシナリオが考えられます。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema))。


#### 新機能

* ユーザーは、NATS エンジンに対して新しい設定項目である `nats_stream` と `nats_consumer` を指定することで、NATS JetStream を使用してメッセージをコンシュームできるようになりました。 [#84799](https://github.com/ClickHouse/ClickHouse/pull/84799) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* `arrowFlight` テーブル関数で認証と SSL をサポートしました。 [#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar)).
* `S3` テーブルエンジンおよび `s3` テーブル関数に、新しいパラメータ `storage_class_name` を追加しました。これにより、AWS がサポートする Intelligent-Tiering を指定できるようになります。キー・バリュー形式と位置指定（非推奨）形式の両方をサポートします。 [#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin)).
* Iceberg テーブルエンジン用の `ALTER UPDATE`。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12)).
* SELECT ステートメント中に Iceberg メタデータファイルを取得するため、システムテーブル `iceberg_metadata_log` を追加しました。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152)（[scanhex12](https://github.com/scanhex12)）。
* `Iceberg` および `DeltaLake` テーブルで、ストレージレベル設定 `disk` を使ったカスタムディスク構成がサポートされるようになりました。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12)).
* データレイクディスク向けの Azure をサポート。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* Azure Blob Storage 上での `Unity` カタログのサポートを追加。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* `Iceberg` 書き込みで、より多くの形式（`ORC`、`Avro`）をサポートしました。これにより [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179) がクローズされました。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* データベースレプリカに関する情報を含む新しいシステムテーブル `database_replicas` を追加しました。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov))。
* 1 つの配列から別の配列を集合として差し引く関数 `arrayExcept` を追加しました。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x)).
* 新しい `system.aggregated_zookeeper_log` テーブルを追加しました。このテーブルには、セッション ID、親パス、および操作種別ごとに集計された ZooKeeper の操作統計情報（例: 操作数、平均レイテンシ、エラー）が含まれ、定期的にディスクへフラッシュされます。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新しい関数 `isValidASCII`。入力文字列または FixedString が ASCII バイト (0x00–0x7F) のみを含む場合は 1 を、そうでない場合は 0 を返します。 [#85377](https://github.com/ClickHouse/ClickHouse/issues/85377) をクローズ。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786) ([rajat mohan](https://github.com/rajatmohan22))。
* ブール設定は引数なしで指定できます（例：`SET use_query_cache;`）。これは true に設定するのと同等です。 [#85800](https://github.com/ClickHouse/ClickHouse/pull/85800) ([thraeka](https://github.com/thraeka)).
* 新しい設定オプション `logger.startupLevel` と `logger.shutdownLevel` により、それぞれ ClickHouse の起動時およびシャットダウン時のログレベルを上書きできるようになりました。 [#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 集約関数 `timeSeriesChangesToGrid` および `timeSeriesResetsToGrid`。`timeSeriesRateToGrid` と同様に、開始タイムスタンプ、終了タイムスタンプ、ステップ、ルックバックウィンドウのパラメータに加え、タイムスタンプと値の 2 つの引数を受け取りますが、各ウィンドウで必要となるサンプル数が 2 つではなく少なくとも 1 つである点が異なります。PromQL の `changes` / `resets` を計算し、パラメータで定義された時間グリッドの各タイムスタンプごとに、指定されたウィンドウ内でサンプル値が変化または減少した回数をカウントします。戻り値の型は `Array(Nullable(Float64))` です。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010)（[Stephen Chi](https://github.com/stephchi0)）。
* 一時テーブル（`CREATE TEMPORARY TABLE`）と同様の構文（`CREATE TEMPORARY VIEW`）で一時ビューを作成できるようにします。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury))。
* CPU およびメモリ使用量に関する警告を `system.warnings` テーブルに追加しました。 [#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc))。
* `Protobuf` 入力での `oneof` インジケータをサポートします。oneof のどの要素が設定されているかを示すために、専用のカラムを使用できます。メッセージに [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) が含まれ、`input_format_protobuf_oneof_presence` が設定されている場合、ClickHouse は oneof のどのフィールドが存在するかを示すカラムを埋めます。 [#82885](https://github.com/ClickHouse/ClickHouse/pull/82885) ([Ilya Golshtein](https://github.com/ilejn)).
* jemalloc の内部ツールを基盤としたアロケーションプロファイリングを改善しました。グローバル jemalloc プロファイラは、設定 `jemalloc_enable_global_profiler` で有効化できるようになりました。サンプリングされたグローバルなアロケーション／ディアロケーションは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` を有効にすることで、`JemallocSample` 型として `system.trace_log` に保存できるようになりました。jemalloc プロファイリングは、設定 `jemalloc_enable_profiler` を使用してクエリごとに個別に有効化できるようになりました。`system.trace_log` へのサンプル保存は、設定 `jemalloc_collect_profile_samples_in_trace_log` を使用してクエリ単位で制御できます。jemalloc を新しいバージョンに更新しました。 [#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* Iceberg テーブルをドロップする際にファイルを削除するための新しい設定。これにより [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211) がクローズされました。 [#86501](https://github.com/ClickHouse/ClickHouse/pull/86501) ([scanhex12](https://github.com/scanhex12))。



#### 実験的機能
* 反転テキストインデックスが、RAM に収まりきらないデータセットにもスケールするように、ゼロから再設計されました。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* Join の並べ替えで統計情報が使用されるようになりました。この機能は `allow_statistics_optimize = 1` と `query_plan_optimize_join_order_limit = 10` を設定することで有効化できます。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* `alter table ... materialize statistics all` により、テーブルのすべての統計情報をマテリアライズできるようになりました。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 読み取り時にデータパーツをスキップインデックスでフィルタリングし、不要なインデックス読み取りを削減できるようにしました。新しい設定 `use_skip_indexes_on_data_read`（デフォルトでは無効）で制御されます。この変更は [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774) に対応するものです。また、[#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) と共通の基盤となる実装も一部含まれています。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* `JOIN` の順序を自動的に並べ替えて性能を向上させる JOIN 順序最適化を追加しました（`query_plan_optimize_join_order_limit` 設定で制御されます）。JOIN 順序最適化は現時点では統計情報のサポートが限定的であり、主にストレージエンジンからの行数推定に依存しています。より高度な統計収集とカーディナリティ推定は今後のリリースで追加される予定です。**アップグレード後に JOIN クエリで問題が発生した場合** は、一時的な回避策として `SET query_plan_use_new_logical_join_step = 0` を設定して新しい実装を無効化し、問題を報告して調査を依頼してください。**USING 句からの識別子の解決に関する注意**: `OUTER JOIN ... USING` 句におけるコアレスされたカラムの解決方法を、より一貫性のあるものに変更しました。以前は、OUTER JOIN で USING カラムと修飾付きカラム（`a, t1.a, t2.a`）を両方選択した場合、USING カラムが誤って `t1.a` に解決され、左側にマッチがない右側テーブルの行については 0/NULL が表示されていました。現在は、USING 句からの識別子は常にコアレスされたカラムに解決され、一方で修飾付き識別子は、クエリ内にどのような他の識別子が存在していても、非コアレスなカラムに解決されます。例えば: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- Before: a=0, t1.a=0, t2.a=2 (incorrect - &#39;a&#39; resolved to t1.a) -- After: a=2, t1.a=0, t2.a=2 (correct - &#39;a&#39; is coalesced). [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイク用の分散 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* `func(primary_column) = 'xx'` や `column in (xxx)` のような条件に対する PREWHERE の最適化を改善。 [#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li)).
* JOIN の書き換えを実装しました。1. フィルタ条件がマッチした行または非マッチ行に対して常に偽となる場合、`LEFT ANY JOIN` および `RIGHT ANY JOIN` を `SEMI` / `ANTI` JOIN に変換します。この最適化は、新しい設定 `query_plan_convert_any_join_to_semi_or_anti_join` によって制御されます。2. 片側の非マッチ行に対してフィルタ条件が常に偽となる場合、`FULL ALL JOIN` を `LEFT ALL` または `RIGHT ALL` JOIN に変換します。 [#86028](https://github.com/ClickHouse/ClickHouse/pull/86028) ([Dmitry Novik](https://github.com/novikd))。
* 軽量削除の実行後に行われる垂直マージのパフォーマンスを改善しました。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* `LEFT/RIGHT` join で未マッチの行が多数存在する場合の `HashJoin` のパフォーマンスをわずかに最適化しました。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat)).
* 基数ソート: コンパイラが SIMD を活用し、より効率的にプリフェッチできるようにしました。Intel CPU の場合にのみソフトウェアプリフェッチを使うため、動的ディスパッチを採用しています。[@taiyang-li](https://github.com/ClickHouse/ClickHouse/pull/77029) による作業を引き継いだものです。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* テーブル内に多数のパーツを含む短いクエリのパフォーマンスを向上（`deque` の代わりに `devector` を使用して `MarkRanges` を最適化）。[#86933](https://github.com/ClickHouse/ClickHouse/pull/86933)（[Azat Khuzhin](https://github.com/azat)）。
* `join` モードにおけるパッチパーツ適用のパフォーマンスを改善しました。 [#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 設定 `query_condition_cache_selectivity_threshold`（デフォルト値: 1.0）を追加しました。この設定により、選択性が低い述語のスキャン結果を query condition cache への挿入対象から除外できます。これにより、cache のヒット率が低下する代わりに、query condition cache のメモリ消費量を削減できます。 [#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai)).
* Iceberg への書き込み時のメモリ使用量を削減しました。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).





#### 改善

* 単一の挿入操作で複数の Iceberg データファイルを書き込めるようになりました。上限を制御するための新しい設定 `iceberg_insert_max_rows_in_data_file` と `iceberg_insert_max_bytes_in_data_file` を追加しました。 [#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* Delta Lake に挿入されるデータファイルに対して、行数およびバイト数の上限を追加しました。`delta_lake_insert_max_rows_in_data_file` と `delta_lake_insert_max_bytes_in_data_file` の設定で制御されます。 [#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Iceberg への書き込みにおけるパーティションで、より多くの型をサポートしました。これにより [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206) がクローズされます。[#86298](https://github.com/ClickHouse/ClickHouse/pull/86298)（[scanhex12](https://github.com/scanhex12)）。
* S3 のリトライ戦略を設定可能にし、設定 XML ファイルを変更した場合に S3 ディスクの設定をホットリロードできるようにしました。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* S3(Azure)Queue テーブルエンジンを改善し、ZooKeeper 接続が失われた場合でも重複が発生することなく処理を継続できるようにしました。これには、S3Queue 設定 `use_persistent_processing_nodes` の有効化が必要です（`ALTER TABLE MODIFY SETTING` で変更可能）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* マテリアライズドビューを作成する際に、`TO` の後にクエリパラメータを使用できます。例えば、`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table` のように記述します。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899) ([Diskein](https://github.com/Diskein)).
* `Kafka2` テーブルエンジンに誤った設定が指定された場合に表示されるユーザー向けの説明を、より分かりやすくしました。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `Time` 型にタイムゾーンを指定することはできなくなりました（もともと意味がありませんでした）。 [#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `best_effort` モードでの Time/Time64 のパースに関するロジックを単純化し、いくつかのバグを回避しました。 [#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* クラスターモード用の `deltaLakeAzure` と同様の `deltaLakeAzureCluster` 関数と、`deltaLakeCluster` のエイリアスである `deltaLakeS3Cluster` 関数を追加しました。[#85358](https://github.com/ClickHouse/ClickHouse/issues/85358) を解決。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 通常のコピー操作にも、バックアップ時と同様に `azure_max_single_part_copy_size` 設定を適用します。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* S3 オブジェクトストレージで再試行可能なエラーが発生した場合に、S3 クライアントスレッドをスローダウンするようにしました。これにより、従来の設定 `backup_slow_all_threads_after_retryable_s3_error` の対象が S3 ディスクにも拡張され、より汎用的な名称 `s3_slow_all_threads_after_retryable_error` に変更されました。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva)).
* 設定で allow&#95;experimental&#95;variant/dynamic/json と enable&#95;variant/dynamic/json を非推奨としてマークしました。現在は 3 つの型すべてが無条件に有効になっています。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* `http_handlers` でスキーマおよびホスト:ポートを含む完全な URL 文字列（`full_url` ディレクティブ）によるフィルタリングをサポートしました。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `allow_experimental_delta_lake_writes` を追加しました。 [#86180](https://github.com/ClickHouse/ClickHouse/pull/86180) ([Kseniia Sumarokova](https://github.com/kssenii))。
* init.d スクリプトでの systemd 検出を修正し、「Install packages」チェックの問題を解消しました。 [#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat)).
* 新しい `startup_scripts_failure_reason` 次元メトリクスを追加します。このメトリクスは、起動スクリプトの失敗を引き起こすさまざまなエラー種別を区別するために必要です。特にアラート用途として、一時的なエラー（例: `MEMORY_LIMIT_EXCEEDED` や `KEEPER_EXCEPTION`）と一時的でないエラーを区別する必要があります。 [#86202](https://github.com/ClickHouse/ClickHouse/pull/86202) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* Iceberg テーブルのパーティションで `identity` 関数を省略できるようにしました。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 特定のチャネルに対してのみ JSON ログ出力を有効化できるようにしました。そのためには `logger.formatting.channel` を `syslog` / `console` / `errorlog` / `log` のいずれかに設定してください。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句でネイティブ数値を使用できるようにしました。これらはすでに論理関数の引数として使用可能です。これにより、filter push-down と move-to-prewhere の最適化が簡素化されます。 [#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 破損したメタデータを持つ Catalog に対して `SYSTEM DROP REPLICA` を実行した場合に発生するエラーを修正しました。 [#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Azure ではアクセスのプロビジョニングにかなり長い時間がかかる場合があるため、ディスクアクセスチェック（`skip_access_check = 0`）に対して追加の再試行を行うようにしました。 [#86419](https://github.com/ClickHouse/ClickHouse/pull/86419) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `timeSeries*()` 関数におけるステールネスウィンドウを左開区間・右閉区間にします。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* `FailedInternal*Query` プロファイルイベントを追加。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude))。
* 設定ファイルで追加された際の、名前にドットを含むユーザーの扱いを修正しました。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme))。
* クエリのメモリ使用量向けの非同期メトリクス（`QueriesMemoryUsage` および `QueriesPeakMemoryUsage`）を追加しました。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark --precise` フラグを使用すると、QPS やその他のインターバルごとのメトリクスをより正確に報告できます。これは、クエリの実行時間がレポート間隔 `--delay D` と同程度である場合に、QPS を安定して取得するのに役立ちます。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa))。
* Linux スレッドの nice 値を構成可能にし、一部のスレッド（merge/mutate、query、materialized view、zookeeper client）に対して優先度を高くまたは低く設定できるようにしました。 [#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 競合状態によりマルチパートアップロードで元の例外が失われた場合に発生する、誤解を招く「specified upload does not exist」エラーを修正。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* `EXPLAIN` クエリにおけるクエリプランの説明を制限しました。`EXPLAIN` 以外のクエリについては説明を計算しないようにしました。`query_plan_max_step_description_length` 設定を追加しました。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* クエリプロファイラ（`query_profiler_real_time_period_ns` / `query_profiler_cpu_time_period_ns`）で発生する `CANNOT&#95;CREATE&#95;TIMER` を回避するため、保留中のシグナル数を調整できるようにしました。また、内省用に `/proc/self/status` から `SigQ` を収集するようにしました（`ProcessSignalQueueSize` が `ProcessSignalQueueLimit` に近い場合、`CANNOT_CREATE_TIMER` エラーが発生しやすくなります）。 [#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat)).
* Keeper における `RemoveRecursive` リクエストのパフォーマンスを向上。[#86789](https://github.com/ClickHouse/ClickHouse/pull/86789)（[Antonio Andelic](https://github.com/antonio2368)）。
* JSON 型の出力時に `PrettyJSONEachRow` の余分な空白を削除。[#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar))。
* プレーンな書き込み可能ディスクでディレクトリが削除される際に、`prefix.path` の BLOB サイズを記録するようにしました。 [#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin)).
* ClickHouse Cloud を含むリモートの ClickHouse インスタンスに対するパフォーマンステストをサポートします。使用例: `tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 大量のメモリ（&gt;16MiB）を割り当てることが分かっている一部の箇所（ソート、非同期挿入、file log）で、メモリ制限が適切に守られるようにしました。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* `network_compression_method` がサポートされていない汎用コーデックに設定されている場合は、例外をスローするようにしました。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* `system.query_cache` システムテーブルは、以前は共有エントリ、または同一ユーザーかつ同一ロールの非共有エントリのみを返していましたが、現在は *すべての* クエリ結果キャッシュエントリを返すようになりました。非共有エントリは *クエリ結果* を公開しない想定である一方で、`system.query_cache` は *クエリ文字列* を返すものなので、この挙動に問題はありません。これにより、このシステムテーブルの動作は `system.query_log` により近いものになりました。 [#87104](https://github.com/ClickHouse/ClickHouse/pull/87104) ([Robert Schulze](https://github.com/rschu1ze)).
* `parseDateTime` 関数のショートサーキット評価を有効にしました。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.parts_columns` に新しい列 `statistics` を追加しました。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* レプリケートされたデータベースおよび内部的にレプリケートされたテーブルに対しては、`alter` クエリの結果はイニシエーターノード上でのみ検証されるようになりました。これにより、すでにコミット済みの `alter` クエリが他のノードでスタックしてしまう問題が修正されます。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `BackgroundSchedulePool` 内でタスクの種類ごとに実行数を制限します。ある種類のタスクがすべてのスロットを占有し、他のタスクが飢餓状態になる状況を避けます。また、タスク同士が互いの完了を待つことで発生するデッドロックも防止します。これは `background_schedule_pool_max_parallel_tasks_per_type_ratio` サーバー設定で制御されます。 [#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix)).
* データベースレプリカを復旧する際に、テーブルを正しくシャットダウンするようにしました。不適切なシャットダウンにより、データベースレプリカの復旧中に一部のテーブルエンジンで `LOGICAL_ERROR` が発生する可能性がありました。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* データベース名のタイポ修正候補を生成する際にアクセス権限を確認するようにしました。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd))。
* 1. Hive カラムへの LowCardinality 対応 2. 仮想カラムより前に Hive カラムを埋める（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) が必要）3. Hive 用フォーマットが空の場合に LOGICAL&#95;ERROR を発生させる [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. Hive のパーティションカラムのみが存在する場合のチェックを修正 5. すべての Hive カラムがスキーマ内で指定されていることをアサート 6. Hive を用いた parallel&#95;replicas&#95;cluster の部分的な修正 7. Hive utils の extractKeyValuePairs で順序付きコンテナを使用（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) が必要）。 [#85538](https://github.com/ClickHouse/ClickHouse/pull/85538) ([Arthur Passos](https://github.com/arthurpassos)).
* 配列マッピング使用時にエラーを引き起こすことがある `IN` 関数の第1引数に対する不要な最適化を抑止しました。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parquet ファイルの書き込み時に、iceberg の source id と parquet の列名との対応付けがスキーマに合わせて調整されていませんでした。この PR では、現在のスキーマではなく、各 iceberg データファイルに対応するスキーマを処理します。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik))。
* ファイルを開く処理とは別にファイルサイズを読み取っていた処理を修正しました。これは、`5.10` リリース以前の Linux カーネルに存在したバグに対応して導入された [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) に関連します。 [#85837](https://github.com/ClickHouse/ClickHouse/pull/85837) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* カーネルレベルで IPv6 が無効化されているシステム（例: ipv6.disable=1 が設定された RHEL）でも、ClickHouse Keeper が起動に失敗しなくなりました。最初の IPv6 リスナーの作成に失敗した場合は、IPv4 リスナーへのフォールバックを試みるようになりました。 [#85901](https://github.com/ClickHouse/ClickHouse/pull/85901) ([jskong1124](https://github.com/jskong1124)).
* この PR は [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990) をクローズします。globalJoin における parallel replicas 向けの TableFunctionRemote のサポートを追加しました。 [#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* orcschemareader::initializeifneeded() におけるヌルポインタを修正します。この PR は次の issue に対応します: [#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### ユーザー向け変更のドキュメントエントリ: [#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510)).
* `FROM` 句における相関サブクエリについて、外側のクエリの列を使用している場合にのみ許可するチェックを追加しました。 [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469) を修正。 [#85402](https://github.com/ClickHouse/ClickHouse/issues/85402) を修正。 [#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 他のカラムの `MATERIALIZED` 式で使用されているサブカラムを持つカラムに対する `ALTER UPDATE` の動作を修正しました。以前は、式内にサブカラムを含む `MATERIALIZED` カラムが正しく更新されていませんでした。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムが PK またはパーティション式で使用されているカラムの変更を禁止しました。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* ストレージ DeltaLake において、非デフォルトのカラムマッピングモード使用時のサブカラムの読み取りを修正。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* JSON 内で Enum ヒントを含むパスに誤ったデフォルト値が使用される問題を修正。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* DataLake hive カタログ URL のパース時に入力のサニタイズを追加。 [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018) をクローズ。 [#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* ファイルシステムキャッシュの動的リサイズ時に発生する論理エラーを修正。[#86122](https://github.com/ClickHouse/ClickHouse/issues/86122) をクローズ。[https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473) をクローズ。[#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DatabaseReplicatedSettings の `logs_to_keep` に `NonZeroUInt64` を使用するようにしました。 [#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach)).
* テーブル（例: `ReplacingMergeTree`）が `index_granularity_bytes = 0` という設定で作成されている場合、スキップインデックス付きの `FINAL` クエリで例外がスローされていました。この例外は修正されました。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* UB を解消し、Iceberg パーティション式のパースに関する問題を修正しました。 [#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik))。
* 1つの INSERT 内で const ブロックと非 const ブロックが混在している場合に発生するクラッシュを修正しました。 [#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* SQL からディスクを作成する際、デフォルトで `/etc/metrika.xml` からの include が処理されるようになりました。 [#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar)).
* String から JSON への accurateCastOrNull/accurateCastOrDefault を修正しました。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* iceberg エンジンで、&#39;/&#39; を含まないディレクトリをサポートするようにしました。[#86249](https://github.com/ClickHouse/ClickHouse/pull/86249)（[scanhex12](https://github.com/scanhex12)）。
* `replaceRegex` が `FixedString` 型の検索対象と空のパターン（needle）を使用した場合にクラッシュする問題を修正。 [#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano)).
* Nullable(JSON) に対する ALTER UPDATE 実行時のクラッシュを修正。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar))。
* `system.tables` で不足していたカラム定義を修正。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* LowCardinality(Nullable(T)) から Dynamic へのキャストを修正。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar)).
* DeltaLake への書き込み時に発生する論理エラーを修正。[#86175](https://github.com/ClickHouse/ClickHouse/issues/86175) をクローズ。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* plain&#95;rewritable ディスクで Azure Blob Storage から空の blob を読み取る際に発生する `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` エラーを修正。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* GROUP BY における Nullable(JSON) の処理を修正しました。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar))。
* Materialized View のバグを修正しました。同じ名前で作成後に削除し、再度作成した場合に、その MV が動作しないことがありました。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix)).
* *cluster functions からの読み取り時に、すべてのレプリカが利用不能な場合は失敗するようにしました。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher)).
* `Buffer` テーブルに起因する `MergesMutationsMemoryTracking` のリークを修正し、`Kafka`（およびその他）からのストリーミング用の `query_views_log` を修正しました。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* エイリアスストレージの参照テーブルを削除した後の `SHOW TABLES` の動作を修正。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* send&#95;chunk&#95;header が有効な場合に、HTTP プロトコル経由で UDF が呼び出されると欠落していたチャンクヘッダーを修正。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir))。
* jemalloc のプロファイルフラッシュが有効な場合に発生し得るデッドロックを修正。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* DeltaLake テーブルエンジンでのサブカラムの読み取りを修正。[#86204](https://github.com/ClickHouse/ClickHouse/issues/86204) をクローズ。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DDL タスクを処理する際の衝突を回避するため、ループバックホスト ID を適切に扱うようにしました。. [#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach)).
* numeric/decimal 列を持つ postgres database engine テーブルの detach/attach を修正しました。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher)).
* getSubcolumnType で発生していた未初期化メモリの使用を修正。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498)（[Raúl Marín](https://github.com/Algunenano)）。
* 関数 `searchAny` および `searchAll` は、空の needle を指定して呼び出された場合、これまで `false` を返していましたが、現在は `true`（いわゆる「すべてにマッチする」）を返すようになりました（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 最初のバケットに値がない場合の `timeSeriesResampleToGridWithStaleness()` 関数の動作を修正。 [#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar))。
* `merge_tree_min_read_task_size` が 0 に設定されている場合に発生するクラッシュを修正。 [#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 読み取り時に、各データファイルのフォーマットを Iceberg メタデータから取得するようにしました（以前はテーブル引数から取得していました）。 [#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時のログフラッシュ中に発生する例外を無視し、`SIGSEGV` を回避してシャットダウン処理をより安全にしました。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* サイズがゼロのパートファイルを含むクエリで例外をスローしていた `Backup` DB エンジンの問題を修正。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus))。
* send&#95;chunk&#95;header が有効で、UDF が HTTP プロトコル経由で呼び出された場合に欠落していたチャンクヘッダーを修正。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Keeper セッションの有効期限切れが原因で発生していた S3Queue の論理エラー「Expected current processor {} to be equal to {}」を修正しました。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `INSERT` とプルーニングにおける `Nullable` 関連のバグを修正しました。これにより [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407) がクローズされます。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630)（[scanhex12](https://github.com/scanhex12)）。
* Iceberg メタデータキャッシュが無効な場合は、ファイルシステムキャッシュを無効にしないでください。 [#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik)).
* parquet reader v3 において発生していた「Deadlock in Parquet::ReadManager (single-threaded)」エラーを修正しました。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* ArrowFlight の `listen_host` における IPv6 サポートを修正しました。 [#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar)).
* `ArrowFlight` ハンドラーのシャットダウン処理を修正。PR [#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）により、[#86596](https://github.com/ClickHouse/ClickHouse/issues/86596) を修正。
* `describe_compact_output=1` 使用時の分散クエリを修正。[#86676](https://github.com/ClickHouse/ClickHouse/pull/86676)（[Azat Khuzhin](https://github.com/azat)）。
* ウィンドウ定義の解析とクエリパラメータの適用を修正。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* バージョン 25.8 より前では動作していた、`PARTITION BY` を指定しているがパーティションワイルドカードを使用していないテーブルを作成する際に、`Partition strategy wildcard can not be used without a '_partition_id' wildcard.` という例外が発生する問題を修正しました。[https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567) をクローズ。[#86748](https://github.com/ClickHouse/ClickHouse/pull/86748)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 並列クエリが単一のロックを取得しようとした場合に発生する `LogicalError` を修正。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* RowBinary input format で共有 JSON データに `NULL` が書き込まれる問題を修正し、`ColumnObject` にいくつかの追加バリデーションを行いました。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* `limit` を伴う空の `Tuple` の並べ替え処理を修正しました。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar)).
* 永続的な処理ノードに対して、専用の keeper ノードを使用しないようにしました。[https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995) の修正です。[#86406](https://github.com/ClickHouse/ClickHouse/issues/86406) をクローズしました。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TimeSeries エンジンテーブルがレプリケーテッドデータベースで新しいレプリカの作成を妨げていた問題を修正しました。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 一部の Keeper ノードが欠落しているタスクが存在する場合の `system.distributed_ddl_queue` へのクエリ処理を修正しました。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 伸長済みブロック末尾でのシーク処理を修正。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg Iterator の非同期実行中にスローされるプロセス例外を処理。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* 大きな前処理済み XML 設定ファイルの保存処理を修正しました。 [#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* system.iceberg&#95;metadata&#95;log テーブルでの日付フィールドの設定処理を修正。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* `WHERE` を含む `TTL` の無限再計算が発生する問題を修正しました。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* `ROLLUP` および `CUBE` 修飾子使用時に `uniqExact` 関数が誤った結果を返す可能性があった問題を修正しました。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat)).
* `parallel_replicas_for_cluster_functions` 設定が 1 の場合に、`url()` テーブル関数でテーブルスキーマを解決できない問題を修正。 [#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `PREWHERE` を複数のステップに分割した後、その出力が正しくキャストされるようにしました。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* `ON CLUSTER` 句を使用した lightweight update の問題を修正しました。 [#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ))。
* 一部の集約関数状態における `String` 引数との互換性を修正しました。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar)).
* OpenAI からのモデル名が渡されない問題を修正しました。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB: パスは user&#95;files ディレクトリ内でなければなりません。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano)).
* 25.1 より前に作成された KeeperMap テーブルで、`DROP` クエリの実行後も ZooKeeper 内にデータが残ってしまう問題を修正しました。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* Parquet 読み取り時の Map および Array 型フィールド ID の扱いを修正。[#87136](https://github.com/ClickHouse/ClickHouse/pull/87136)（[scanhex12](https://github.com/scanhex12)）。
* レイジーマテリアライゼーションにおいて、`array sizes` サブカラムを持つ配列の読み取りを修正。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139)（[Pavel Kruglov](https://github.com/Avogar)）。
* Dynamic 型の引数を持つ `CASE` 関数を修正しました。 [#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar)).
* CSV で空文字列から空配列を読み取る際の処理を修正。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar)).
* 非相関な `EXISTS` で誤った結果が返る可能性がある問題を修正しました。これは、 [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) で導入された `execute_exists_as_scalar_subquery=1` により発生しており、`25.8` に影響していました。[#86415](https://github.com/ClickHouse/ClickHouse/issues/86415) を修正します。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* iceberg&#95;metadata&#95;log が設定されていない状態でユーザーが iceberg メタデータのデバッグ情報を取得しようとした場合にエラーをスローするようにし、nullptr アクセスを修正しました。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik))。

#### ビルド/テスト/パッケージングの改善

- abseil-cpp 20250814.0との互換性を修正しました。https://github.com/abseil/abseil-cpp/issues/1923 [#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat))
- スタンドアロンWASMレキサーのビルドをフラグで制御するように変更しました。[#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able))
- `vmull_p64`命令をサポートしていない古いARM CPUでのcrc32cビルドを修正しました。[#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos))
- `openldap` 2.6.10を使用するように変更しました。[#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able))
- darwinで`memalign`をインターセプトしないように修正しました。[#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able))
- `krb5` 1.22.1-finalを使用するように変更しました。[#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able))
- `list-licenses.sh`でのRustクレート名の展開を修正しました。[#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able))

### ClickHouse リリース 25.8 LTS、2025-08-28 {#258}


#### 後方互換性のない変更
* JSON 内で異なる型の値を持つ配列に対して、名前なしの `Tuple` の代わりに `Array(Dynamic)` を推論するようになりました。以前の動作を使いたい場合は、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` を無効にしてください。 [#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 一貫性とシンプルさのために、S3 レイテンシメトリクスをヒストグラムに移行しました。 [#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* デフォルト式内でドットを含む識別子について、複合識別子としてパースされるのを防ぐために、バッククォートで囲むことを必須にしました。 [#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* レイジーマテリアライゼーションは、アナライザ有効時（デフォルト）にのみ有効になります。これは、アナライザなしでの保守を避けるためであり、我々の経験上、アナライザなしではいくつかの問題があるためです（例えば、条件内で `indexHint()` を使用する場合など）。 [#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* デフォルトで、Parquet 出力形式において `Enum` 型の値を、論理型 `ENUM` を持つ `BYTE_ARRAY` として書き出すようになりました。 [#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効にしました。これにより、新しく作成された Compact パーツからのサブカラム読み取りのパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーは新しい Compact パーツを読み取ることができません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前の `concurrent_threads_scheduler` のデフォルト値は `round_robin` でしたが、多数のシングルスレッドクエリ（例: INSERT）が存在する場合に不公平であることが判明しました。この変更により、より安全な代替である `fair_round_robin` スケジューラがデフォルトになります。 [#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse は PostgreSQL スタイルのヒアドキュメント構文 `$tag$ string contents... $tag$`（ドルクォート文字列リテラルとも呼ばれます）をサポートしています。以前のバージョンではタグに対する制約は少なく、句読点や空白を含む任意の文字を使用できました。これは、ドル記号で始まることがある識別子との間にパースのあいまいさを生み出します。一方で PostgreSQL では、タグに使用できるのは単語文字のみです。この問題を解決するため、ヒアドキュメントのタグは単語文字のみを含むように制限しました。 [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731) をクローズします。 [#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `azureBlobStorage`、`deltaLakeAzure`、`icebergAzure` は、`AZURE` 権限を正しく検証するように更新されました。すべてのクラスタ変種の関数（`-Cluster` 関数）は、対応する非クラスタ版と照らして権限を検証するようになりました。さらに、`icebergLocal` および `deltaLakeLocal` 関数は、`FILE` 権限チェックを必須とするようになりました。 [#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `allow_dynamic_metadata_for_data_lakes` 設定（Table Engine レベルの設定）をデフォルトで有効にしました。 [#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* デフォルトで、JSON フォーマットにおいて 64 ビット整数をクォートしないようにしました。 [#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))



#### 新機能

* PromQL 方言の基本サポートが追加されました。これを使用するには、clickhouse-client で `dialect='promql'` を設定し、設定 `promql_table_name='X'` を使って TimeSeries テーブルを指定し、`rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` のようなクエリを実行します。さらに、PromQL クエリを SQL でラップして実行することもできます: `SELECT * FROM prometheusQuery('up', ...);`。現時点では `rate`、`delta`、`increase` の各関数のみがサポートされています。単項/二項演算子は未対応です。HTTP API もありません。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI ベースの SQL 生成は、利用可能な場合、環境変数 `ANTHROPIC_API_KEY` と `OPENAI_API_KEY` から自動的に設定を推論できるようになりました。これにより、この機能をゼロコンフィグで利用できるようになりました。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik)).
* [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) プロトコルのサポートを、次の追加によって実装しました: - 新しいテーブル関数 `arrowflight`。 [#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600)).
* これにより、すべてのテーブル（`Merge` エンジンのテーブルに限らず）が `_table` 仮想カラムをサポートするようになり、特に UNION ALL を含むクエリで有用になりました。 [#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 任意のストレージポリシー（S3 などのオブジェクトストレージを含む）を外部集計／ソートに使用できるようにしました。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 明示的に指定された IAM ロールを使用した AWS S3 認証を実装しました。GCS 向けに OAuth を実装しました。これらの機能は最近まで ClickHouse Cloud でのみ利用可能でしたが、今回オープンソース化されました。オブジェクトストレージ用の接続パラメータのシリアル化など、いくつかのインターフェースを統一しました。 [#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Iceberg TableEngine での position delete をサポートしました。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* Iceberg の Equality Deletes をサポート。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* Iceberg が create 時の書き込みに対応。[#83927](https://github.com/ClickHouse/ClickHouse/issues/83927) をクローズ。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 書き込み用の Glue カタログをサポート。[#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 書き込み用の Iceberg REST カタログ。[#84684](https://github.com/ClickHouse/ClickHouse/pull/84684)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* すべての Iceberg の position delete ファイルをデータファイルにマージします。これにより、Iceberg ストレージ内の Parquet ファイルの数とサイズが削減されます。構文: `OPTIMIZE TABLE table_name`。 [#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* iceberg の `drop table` をサポート（REST/Glue カタログからの削除＋テーブルに関するメタデータの削除）。 [#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* merge-on-read 形式の Iceberg テーブルに対する ALTER DELETE mutation をサポート。[#85549](https://github.com/ClickHouse/ClickHouse/pull/85549)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* DeltaLake への書き込みをサポート。[#79603](https://github.com/ClickHouse/ClickHouse/issues/79603) をクローズ。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* テーブルエンジン `DeltaLake` で特定のスナップショットバージョンを読み取れるようにするため、設定項目 `delta_lake_snapshot_version` を追加しました。 [#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* min-max プルーニングのために、より多くの Iceberg 統計情報（カラムサイズ、下限および上限）をメタデータ（マニフェストエントリ）に書き込むようにしました。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 単純な型に対する Iceberg でのカラムの追加・削除・変更をサポート。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg: version-hint ファイルへの書き込みをサポート。これにより [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097) がクローズされました。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 一時ユーザーによって作成されたビューは、実ユーザーのコピーを保持するようになり、一時ユーザーが削除された後でも無効化されなくなりました。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* ベクトル類似インデックスがバイナリ量子化をサポートするようになりました。バイナリ量子化によりメモリ使用量が大幅に削減され、（距離計算が高速になることで）ベクトルインデックスの構築も高速化されます。また、既存の設定 `vector_search_postfilter_multiplier` は廃止され、より汎用的な設定である `vector_search_index_fetch_multiplier` に置き換えられました。[#85024](https://github.com/ClickHouse/ClickHouse/pull/85024)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `s3` または `s3Cluster` テーブルエンジン/関数でキー・バリュー形式の引数を使用できるようにしました。例えば `s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')` のように指定できます。 [#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Kafka のようなエンジンからのエラー受信メッセージを保持するための新しいシステムテーブル（「デッドレターキュー」）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn)).
* `ReplicatedMergeTree` に対する既存の復元機能と同様の動作を行う、レプリケーティッドデータベース向けの新しい `SYSTEM RESTORE DATABASE REPLICA` を追加しました。 [#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov))。
* PostgreSQL プロトコルで `COPY` コマンドがサポートされるようになりました。 [#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* MySQL プロトコル用の C# クライアントに対応しました。これにより [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992) がクローズされました。 [#84397](https://github.com/ClickHouse/ClickHouse/pull/84397) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Hive パーティション形式での読み取りおよび書き込みをサポートしました。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* ZooKeeper 接続に関する履歴情報を保存するための `zookeeper_connection_log` システムテーブルを追加しました。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* サーバー設定 `cpu_slot_preemption` により、ワークロードに対するプリエンプティブな CPU スケジューリングが有効になり、ワークロード間での CPU 時間の max-min 公平な割り当てが保証されます。CPU スロットリング用の新しいワークロード設定が追加されました：`max_cpus`、`max_cpu_share`、`max_burst_cpu_seconds`。詳細はこちらをご覧ください: [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。 [#80879](https://github.com/ClickHouse/ClickHouse/pull/80879)（[Sergei Trifonov](https://github.com/serxa)）。
* 設定されたクエリ数または時間しきい値に達した後に TCP 接続を切断します。これにより、ロードバランサー配下のクラスタノード間で接続がより均等に分散されるようになります。[#68000](https://github.com/ClickHouse/ClickHouse/issues/68000) を解決。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* パラレルレプリカで、クエリにプロジェクションを使用できるようになりました。 [#82659](https://github.com/ClickHouse/ClickHouse/issues/82659). [#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi)).
* DESCRIBE (SELECT ...) に加えて DESCRIBE SELECT もサポートしました。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* mysql&#95;port と postgresql&#95;port でセキュア接続を強制します。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* ユーザーは `JSONExtractCaseInsensitive`（および `JSONExtract` の他のバリアント）を使用して、大文字小文字を区別せずに JSON キーを検索できるようになりました。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* `system.completions` テーブルの導入。[#81889](https://github.com/ClickHouse/ClickHouse/issues/81889) をクローズ。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m)).
* 新しい関数 `nowInBlock64` を追加しました。使用例: `SELECT nowInBlock64(6)` は `2025-07-29 17:09:37.775725` を返します。 [#84178](https://github.com/ClickHouse/ClickHouse/pull/84178)（[Halersson Paris](https://github.com/halersson)）。
* client&#95;id と tenant&#95;id を用いて認証できるよう、AzureBlobStorage に extra&#95;credentials を追加しました。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* DateTime の値を UUIDv7 に変換する関数 `dateTimeToUUIDv7` を追加しました。例: `SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` は `0198af18-8320-7a7d-abd3-358db23b9d5c` を返します。 [#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich)).
* `timeSeriesDerivToGrid` と `timeSeriesPredictLinearToGrid` 集約関数は、指定された開始タイムスタンプ、終了タイムスタンプ、およびステップで定義される時間グリッドにデータを再サンプリングし、それぞれ PromQL 互換の `deriv` および `predict_linear` を計算します。[#84328](https://github.com/ClickHouse/ClickHouse/pull/84328)（[Stephen Chi](https://github.com/stephchi0)）。
* TimeSeries 関数を 2 つ追加: - `timeSeriesRange(start_timestamp, end_timestamp, step)`, - `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`,. [#85435](https://github.com/ClickHouse/ClickHouse/pull/85435) ([Vitaly Baranov](https://github.com/vitlibar)).
* 新しい構文 `GRANT READ ON S3('s3://foo/.*') TO user` が追加されました。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit)).
* 新しい出力フォーマットとして `Hash` を追加しました。結果のすべての列と行に対して単一のハッシュ値を計算します。これは、データ転送がボトルネックとなるユースケースなどで、結果の「フィンガープリント」を求める際に有用です。例: `SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` は `e5f9e676db098fdb9530d2059d8c23ef` を返します。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeper Multi クエリで任意のウォッチを設定できるようにする機能を追加。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `clickhouse-benchmark` ツールに、並列クエリ数を段階的に増やすモードを有効にするオプション `--max-concurrency` を追加しました。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* TODO: これは何か？部分的に集約されたメトリクスをサポートする。[#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### 実験的機能
* 相関サブクエリのサポートをデフォルトで有効化し、実験的機能ではなくしました。[#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd))。
* Unity、Glue、Rest、および Hive Metastore のデータレイクカタログを、実験的機能からベータ版に昇格しました。[#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator))。
* 軽量な更新および削除を、実験的機能からベータ版に昇格しました。
* ベクター類似性インデックスを用いた近似ベクトル検索が GA になりました。[#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze))。
* Ytsaurus テーブルエンジンおよびテーブル関数。[#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 以前は、テキストインデックスのデータは複数のセグメント（各セグメントのサイズはデフォルトで 256 MiB）に分割されていました。これによりテキストインデックス構築時のメモリ消費を抑えられますが、その一方でディスク上の必要容量が増え、クエリ応答時間も長くなります。[#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov))。



#### パフォーマンスの向上

* 新しい Parquet リーダー実装。従来より高速で、ページレベルのフィルタープッシュダウンと PREWHERE をサポートします。現在は実験的機能です。有効化するには設定 `input_format_parquet_use_native_reader_v3` を使用してください。 [#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321))。
* Azure Blob Storage 向け公式 Azure ライブラリの HTTP トランスポートを、独自実装の HTTP クライアントに置き換えました。このクライアントには、S3 の設定を反映した複数の設定項目を導入しました。Azure と S3 の両方について、より攻めた接続タイムアウト値を導入しました。Azure プロファイルのイベントおよびメトリクスの可観測性を改善しました。新しいクライアントはデフォルトで有効になっており、Azure Blob Storage 上のコールドクエリに対してはるかに優れたレイテンシーを実現します。旧来の `Curl` クライアントは、`azure_sdk_use_native_client=false` を設定することで元に戻すことができます。[#83294](https://github.com/ClickHouse/ClickHouse/pull/83294)（[alesapin](https://github.com/alesapin)）。以前の公式 Azure クライアント実装は、5 秒から数分に及ぶ深刻なレイテンシースパイクのため、本番用途には適していませんでした。その問題の大きい実装を廃止できたことを、私たちは非常に誇りに思っています。
* インデックスをファイルサイズの小さいものから順に処理します。インデックスの全体的な処理順では、まず `minmax` インデックスとベクターインデックスを優先します（それぞれ単純さと選択性の高さによる）、その後にその他の小さなインデックスが続きます。`minmax` / ベクターインデックスの中でも、サイズの小さいインデックスが優先されます。 [#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal))。
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツからのサブカラムの読み取り性能が大幅に向上します。バージョン 25.5 未満のサーバーでは、新しい Compact パーツを読み取ることはできません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* `azureBlobStorage` テーブルエンジン: 可能な場合はマネージド ID の認証トークンをキャッシュして再利用し、スロットリングを回避するようにしました。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak)).
* 右側が結合キー列によって関数的に決定される場合（すべての行で結合キー値が一意である場合）、`ALL` `LEFT/INNER` JOIN は自動的に `RightAny` に変換されます。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010)（[Nikita Taranov](https://github.com/nickitat)）。
* 大きなカラムを含む JOIN のメモリ使用量を制限するために、`max_joined_block_size_rows` に加えて `max_joined_block_size_bytes` を追加しました。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* メモリ効率の良い集約処理中に、一部のバケットを順不同で送信できるようにする新しいロジック（設定 `enable_producing_buckets_out_of_order_in_aggregation` で制御され、デフォルトで有効）が追加されました。いくつかの集約バケットのマージに他のバケットよりも大幅に時間がかかる場合、イニシエータがその間により大きなバケット ID を持つバケットを先にマージできるようにすることで、パフォーマンスが向上します。欠点としてはメモリ使用量が増加する可能性があります（ただし有意な増加にはならないはずです）。 [#80179](https://github.com/ClickHouse/ClickHouse/pull/80179) ([Nikita Taranov](https://github.com/nickitat))。
* `optimize_rewrite_regexp_functions` 設定（デフォルトで有効）を導入しました。この設定により、特定の正規表現パターンが検出された場合、オプティマイザは一部の `replaceRegexpAll`、`replaceRegexpOne`、`extract` の呼び出しを、より単純で効率的な形式に書き換えられるようになります。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)). [#81992](https://github.com/ClickHouse/ClickHouse/pull/81992) ([Amos Bird](https://github.com/amosbird)).
* ハッシュ JOIN のメインループ外で `max_joined_block_rows` を処理するようにしました。ALL JOIN のパフォーマンスがわずかに向上します。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* より細かい粒度の min-max インデックスを先に処理するようにしました。 [#75381](https://github.com/ClickHouse/ClickHouse/issues/75381) をクローズ。 [#83798](https://github.com/ClickHouse/ClickHouse/pull/83798) ([Maruth Goyal](https://github.com/maruthgoyal)).
* `DISTINCT` ウィンドウ集約が線形時間で実行されるようにし、`sumDistinct` のバグを修正しました。[#79792](https://github.com/ClickHouse/ClickHouse/issues/79792) をクローズ。[#52253](https://github.com/ClickHouse/ClickHouse/issues/52253) をクローズ。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取りの削減と CPU 使用率の低減により、従来より低いレイテンシで完了するようになりました。 [#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 並列レプリカ間でのワークロード分散におけるキャッシュ局所性を向上させるために Rendezvous ハッシュを導入しました。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* If コンビネータ向けに `addManyDefaults` を実装し、`If` コンビネータを用いる集約関数がより高速に動作するようになりました。 [#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 複数の文字列列または数値列で `GROUP BY` する際に、シリアライズされたキーをカラム単位で計算するようにしました。 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li)).
* 並列レプリカ読み取りでのインデックス解析の結果、範囲が空になる場合にフルスキャンを行わないようにしました。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* パフォーマンステストをより安定させるために `-falign-functions=64` を使用。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* `column` が `Array` 型ではない場合の `has([c1, c2, ...], column)` のような条件に対して、Bloom filter インデックスが使用されるようになりました。これにより、この種のクエリのパフォーマンスが向上し、`IN` 演算子と同程度の効率になります。 [#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki))。
* CompressedReadBufferBase::readCompressedData における不要な memcpy 呼び出しを削減しました。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 一時データを削減して `largestTriangleThreeBuckets` を最適化。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コードを単純化して文字列のデシリアライゼーションを最適化しました。[#38564](https://github.com/ClickHouse/ClickHouse/issues/38564) をクローズします。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 並列レプリカ用の最小タスクサイズの計算を修正しました。 [#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat))。
* `Join` モードにおけるパッチパーツ適用のパフォーマンスを改善しました。 [#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ))。
* ゼロバイトを削除しました。[#85062](https://github.com/ClickHouse/ClickHouse/issues/85062) をクローズします。いくつかの軽微なバグを修正しました。関数 `structureToProtobufSchema`、`structureToCapnProtoSchema` は、終端ゼロバイトを正しく出力せず、その代わりに改行文字を使用していました。これにより、出力から改行が抜けてしまう問題が発生し、ゼロバイトに依存する他の関数（`logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero`、`encrypt`/`decrypt` など）を使用する際にバッファオーバーフローを引き起こす可能性がありました。`regexp_tree` 辞書レイアウトは、ゼロバイトを含む文字列の処理をサポートしていませんでした。`Values` フォーマット、または行末に改行のない任意のフォーマットで呼び出された `formatRowNoNewline` 関数は、誤って出力の最後の 1 文字を切り捨てていました。関数 `stem` には例外安全性の不具合があり、ごく稀な状況でメモリリークを引き起こす可能性がありました。`initcap` 関数は `FixedString` 引数に対して誤った動作をしていました。ブロック内の前の文字列が単語構成文字で終わっている場合、現在の文字列の先頭を単語の開始として認識しませんでした。Apache `ORC` フォーマットにおけるセキュリティ脆弱性を修正しました。これにより、未初期化メモリが露出する可能性がありました。関数 `replaceRegexpAll` と、それに対応するエイリアス `REGEXP_REPLACE` の動作を変更しました。これらは、`^a*|a*$` や `^|.*` のように直前のマッチが文字列全体を処理した場合であっても、文字列末尾で空マッチを行えるようになりました。これは JavaScript、Perl、Python、PHP、Ruby のセマンティクスに対応しますが、PostgreSQL のセマンティクスとは異なります。多くの関数の実装は簡素化および最適化されました。いくつかの関数のドキュメントには誤りがあり、修正されました。String カラムおよび String カラムから構成される複合型に対する `byteSize` の出力が変更されている点（空文字列 1 つあたり 9 バイトから 8 バイトへの変更）に注意してください。これは想定された動作です。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 単一行のみを返す目的で定数をマテリアライズする場合、そのマテリアライズを最適化しました。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* delta-kernel-rs バックエンドによるファイルの並列処理を改善。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `enable_add_distinct_to_in_subqueries` が導入されました。これを有効にすると、ClickHouse は分散クエリにおいて `IN` 句内のサブクエリに自動的に `DISTINCT` を追加します。これにより、シャード間で転送される一時テーブルのサイズを大幅に削減し、ネットワーク効率を向上させることができます。注意：これはトレードオフであり、ネットワーク転送量は削減される一方で、各ノードで追加のマージ（重複排除）処理が必要になります。ネットワーク転送がボトルネックとなっており、かつマージコストが許容できる場合にこの設定を有効にしてください。[#81908](https://github.com/ClickHouse/ClickHouse/pull/81908) ([fhw12345](https://github.com/fhw12345))。
* 実行可能なユーザー定義関数に対するクエリのメモリトラッキングのオーバーヘッドを削減しました。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `DeltaLake` に、内部の `delta-kernel-rs` によるフィルタリング（統計およびパーティションプルーニング）を実装しました。 [#84006](https://github.com/ClickHouse/ClickHouse/pull/84006) ([Kseniia Sumarokova](https://github.com/kssenii)).
* オンザフライで更新される列や `patch` パーツによって更新される列に依存するスキップインデックスの無効化を、より細かい粒度で行うようにしました。これにより、スキップインデックスはオンザフライのミューテーションまたは `patch` パーツの影響を受けたパーツでのみ使用されなくなり、以前のようにすべてのパーツでインデックスが無効化されることはなくなりました。 [#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ)).
* 暗号化された named collection 用の `encrypted_buffer` に必要な最小限のメモリだけを割り当てるようにしました。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* Bloom filter インデックス（regular、ngram、token）のサポートが改善され、最初の引数が定数配列（集合）、2 番目の引数がインデックス付きカラム（部分集合）の場合にも利用されるようになり、より効率的なクエリ実行が可能になりました。 [#84700](https://github.com/ClickHouse/ClickHouse/pull/84700) ([Doron David](https://github.com/dorki))。
* Keeper におけるストレージロックの競合を軽減。 [#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368)).
* `WHERE` に対して不足していた `read_in_order_use_virtual_row` のサポートを追加しました。これにより、フィルタが `PREWHERE` へ完全にはプッシュダウンされなかったクエリで、さらなるパーツの読み取りをスキップできるようになります。 [#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 各データファイルごとにオブジェクトを明示的に保持することなく、Iceberg テーブルのオブジェクトを非同期に反復処理できるようにしました。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik)).
* 相関のない `EXISTS` をスカラーサブクエリとして実行します。これにより、スカラーサブクエリキャッシュを利用して結果を定数畳み込みできるようになり、インデックスに役立ちます。互換性のため、新しい設定 `execute_exists_as_scalar_subquery=1` が追加されました。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).





#### 改善

* DatabaseReplicatedSettings のデフォルト値を定義する `database_replicated` 設定を追加しました。Replicated DB の作成クエリ内でこの設定が指定されていない場合は、ここで定義された値が使用されます。 [#85127](https://github.com/ClickHouse/ClickHouse/pull/85127) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Web UI（play）内のテーブル列をサイズ変更可能にしました。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki)).
* `iceberg_metadata_compression_method` 設定により、圧縮された `.metadata.json` ファイルをサポートしました。ClickHouse のすべての圧縮方式を利用できます。これにより [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895) がクローズされました。 [#85196](https://github.com/ClickHouse/ClickHouse/pull/85196) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `EXPLAIN indexes = 1` の出力に、読み取られるレンジ数を表示するようにしました。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm))。
* ORC の圧縮ブロックサイズを制御する設定を導入し、デフォルト値を 64KB から 256KB に変更して、Spark や Hive と整合するようにしました。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li)).
* `columns_substreams.txt` ファイルを Wide パートに追加し、そのパート内に保存されているすべてのサブストリームを追跡できるようにしました。これにより、JSON および Dynamic 型における動的ストリームを追跡できるようになり、これらのカラムのサンプルを読み取って動的ストリームの一覧を取得する必要がなくなります（たとえばカラムサイズの計算などの用途）。また、すべての動的ストリームが `system.parts_columns` に反映されるようになりました。 [#81091](https://github.com/ClickHouse/ClickHouse/pull/81091) ([Pavel Kruglov](https://github.com/Avogar)).
* `clickhouse format` に CLI フラグ `--show_secrets` を追加し、機密データはデフォルトで非表示となるようにしました。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom))。
* S3 の読み取りおよび書き込みリクエストは、`max_remote_read_network_bandwidth_for_server` および `max_remote_write_network_bandwidth_for_server` のスロットル処理に関する問題を回避するため、（S3 リクエスト全体ではなく）HTTP ソケットレベルでスロットルされます。 [#81837](https://github.com/ClickHouse/ClickHouse/pull/81837) ([Sergei Trifonov](https://github.com/serxa))。
* 同じカラムに対して、異なるウィンドウ（ウィンドウ関数用）で異なる照合順序を混在させることを許可しました。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* マージセレクタをシミュレーション・可視化・比較するためのツールを追加。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa)).
* `address_expression` 引数でクラスタが指定されている場合に、並列レプリカ対応の `remote*` テーブル関数をサポートしました。また、[#73295](https://github.com/ClickHouse/ClickHouse/issues/73295) も修正しました。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* バックアップファイル書き込みに関するすべてのログメッセージのレベルを TRACE に設定しました。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 特殊な名前や codec を持つユーザー定義関数が、SQL フォーマッタによって一貫性のない形式で整形される場合がありました。これにより [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092) が解決されました。 [#83644](https://github.com/ClickHouse/ClickHouse/pull/83644) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ユーザーは、`JSON` 型の中で `Time` 型および `Time64` 型を使用できるようになりました。 [#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 並列レプリカを用いた `JOIN` では、join logical step を使用するようになりました。並列レプリカを使用する `JOIN` クエリで問題が発生した場合は、`SET query_plan_use_new_logical_join_step=0` を試し、Issue を報告してください。[#83801](https://github.com/ClickHouse/ClickHouse/pull/83801)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 複数ノードにおける `cluster_function_process_archive_on_multiple_nodes` の互換性を修正。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` テーブルレベルでのマテリアライズドビュー向け挿入設定の変更をサポートしました。新たに `S3Queue` レベルの設定 `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` を追加しました。デフォルトではプロファイルレベルの設定が使用され、`S3Queue` レベルの設定がそれらを上書きします。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii))。
* プロファイルイベント `MutationAffectedRowsUpperBound` を追加しました。これはミューテーションで影響を受ける行数（例：`ALTER UPDATE` や `ALTER DELETE` クエリにおいて条件を満たす行の総数）を示します。 [#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ)).
* cgroup の情報（該当する場合、つまり `memory_worker_use_cgroup` および cgroup が利用可能な場合）を使用して、メモリトラッカー（`memory_worker_correct_memory_tracker`）を調整します。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat)).
* MongoDB: 文字列から数値型への暗黙的なパース。以前は、ClickHouse テーブルの数値カラムに対して MongoDB ソースから文字列値が渡されると、例外がスローされていました。現在は、エンジンが文字列から数値値を自動的にパースしようとします。[#81167](https://github.com/ClickHouse/ClickHouse/issues/81167) をクローズしました。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* `Nullable` 数値に対する `Pretty` フォーマットで桁区切りを強調表示するようにしました。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard: ツールチップが上端でコンテナからはみ出さないようになりました。 [#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード上のドットの見た目を少し改善しました。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard の favicon が少し改良されました。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI: ブラウザがパスワードを保存できるようにしました。また、URL の値も記憶するようにしました。 [#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `apply_to_children` 設定を使用して、特定の Keeper ノードに追加の ACL を適用できるようにしました。 [#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368)).
* MergeTree における &quot;compact&quot; Variant discriminators のシリアライゼーションの使用を修正しました。以前は、使用できる一部のケースで使用されていませんでした。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* レプリケートされたデータベースの設定にサーバー設定 `logs_to_keep` を追加し、レプリケートされたデータベース向けのデフォルト `logs_to_keep` パラメータを変更できるようにしました。値を小さくすると ZNode の数が減少します（特にデータベース数が多い場合）、一方で値を大きくすると、長時間オフラインだったレプリカでも追いつけるようになります。 [#84183](https://github.com/ClickHouse/ClickHouse/pull/84183) ([Alexey Khatskevich](https://github.com/Khatskevich))。
* JSON 型のパース時に JSON キー内のドットをエスケープするための設定 `json_type_escape_dots_in_keys` を追加しました。この設定はデフォルトで無効です。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar)).
* 閉じた接続から読み取らないようにするため、EOF を確認する前に接続がキャンセルされていないかを確認します。 [#83893](https://github.com/ClickHouse/ClickHouse/issues/83893) を修正。 [#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Web UI におけるテキスト選択時の色をやや改善しました。違いが大きく現れるのは、ダークモードで選択されたテーブルセルの場合のみです。以前のバージョンでは、テキストと選択範囲の背景とのコントラストが十分ではありませんでした。 [#84258](https://github.com/ClickHouse/ClickHouse/pull/84258) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 内部チェックを簡素化することで、クライアント接続に対するサーバーのシャットダウン処理を改善しました。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath))
* `delta_lake_enable_expression_visitor_logging` 設定を追加し、デバッグ時にテストログレベルであっても冗長になりすぎる可能性のある式ビジターログをオフにできるようにしました。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* cgroup レベルおよびシステム全体のメトリクスが、現在はまとめて報告されます。cgroup レベルのメトリクスは `CGroup&lt;Metric&gt;` という名前で、OS レベルのメトリクス（procfs から収集されるもの）は `OS&lt;Metric&gt;` という名前になります。 [#84317](https://github.com/ClickHouse/ClickHouse/pull/84317) ([Nikita Taranov](https://github.com/nickitat))。
* Web UI のチャートが少し改善されました。大きな変更ではありませんが、より良くなりました。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Replicated データベース設定 `max_retries_before_automatic_recovery` のデフォルト値を 10 に変更し、一部のケースでより高速に復旧できるようにしました。 [#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリパラメータ付きの `CREATE USER`（例: `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）のフォーマットを修正しました。 [#84376](https://github.com/ClickHouse/ClickHouse/pull/84376) ([Azat Khuzhin](https://github.com/azat)).
* バックアップおよびリストア処理中に使用される S3 リトライのバックオフ戦略を設定するため、`backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor` を導入しました。[#84421](https://github.com/ClickHouse/ClickHouse/pull/84421)（[Julia Kartseva](https://github.com/jkartseva)）。
* S3Queue の ordered モードを修正: `shutdown` が呼び出された場合に、より早く終了するようにしました。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* pyiceberg から読み取るための Iceberg への書き込みをサポート。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* KeyValue ストレージの主キー（例: EmbeddedRocksDB、KeeperMap）に対して `IN` / `GLOBAL IN` フィルタをプッシュダウンする際に、集合内の値の型キャストを許可しました。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa))。
* chdig を [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1) に更新。 [#84521](https://github.com/ClickHouse/ClickHouse/pull/84521) ([Azat Khuzhin](https://github.com/azat))。
* UDF 実行中の低レベルエラーは、これまではさまざまなエラーコードが返される可能性がありましたが、今後はエラーコード `UDF_EXECUTION_FAILED` で失敗するようになりました。 [#84547](https://github.com/ClickHouse/ClickHouse/pull/84547) ([Xu Jia](https://github.com/XuJia0210)).
* KeeperClient に `get_acl` コマンドを追加。 [#84641](https://github.com/ClickHouse/ClickHouse/pull/84641) ([Antonio Andelic](https://github.com/antonio2368)).
* データレイクテーブルエンジンにスナップショットバージョンを追加。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton)).
* `ConcurrentBoundedQueue` のサイズに関する次元メトリクスを追加し、キュータイプ（そのキューの用途）とキュー ID（そのキューの現在のインスタンスに対してランダムに生成される ID）でラベル付けしました。 [#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `system.columns` テーブルで、既存の `name` カラムのエイリアスとして `column` が提供されるようになりました。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang)).
* 新しい MergeTree 設定 `search_orphaned_parts_drives` を追加し、パーツを探索する範囲を（例：ローカルメタデータを持つディスクに限定するなど）制限できるようにしました。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* Keeper に 4LW `lgrq` を追加し、受信リクエストのログ記録を切り替えられるようにしました。 [#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368)).
* 外部認証の `forward_headers` を大文字小文字を区別せずに照合するようにしました。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` ツールが暗号化された ZooKeeper 接続をサポートするようになりました。 [#84764](https://github.com/ClickHouse/ClickHouse/pull/84764) ([Roman Vasin](https://github.com/rvasin))。
* `system.errors` にフォーマット文字列カラムを追加しました。このカラムは、アラートルールで同じエラータイプを基準にグループ化するために必要です。 [#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-format` を更新し、`--hilite` のエイリアスとして `--highlight` も受け付けるようにしました。- `clickhouse-client` を更新し、`--highlight` のエイリアスとして `--hilite` も受け付けるようにしました。- `clickhouse-format` のドキュメントを、この変更を反映するように更新しました。 [#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 複合型に対するフィールド ID ベースの Iceberg の読み取りを修正。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `SlowDown` のようなエラーによって発生するリトライストーム時に、リトライ可能なエラーが一度でも検出された場合に全スレッドの処理を遅延させることで S3 への負荷を軽減する新しい設定 `backup_slow_all_threads_after_retryable_s3_error` を導入しました。 [#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* レプリケートされたデータベースにおける非 append 型 RMV DDL で、古い一時テーブルの作成とリネーム処理をスキップします。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` と `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` を使用して、Keeper のログエントリキャッシュのサイズをエントリ数で制限できるようにしました。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* サポートされていないアーキテクチャでも `simdjson` を使用できるようにしました（以前は `CANNOT_ALLOCATE_MEMORY` エラーが発生していました）。 [#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat)).
* 非同期ロギング: 制限をチューニング可能にし、イントロスペクション機能を追加しました。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* 削除対象のオブジェクトをすべてまとめて収集し、単一のオブジェクトストレージ削除操作で実行するようにしました。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg の現行の positional delete file の実装では、すべてのデータを RAM に保持します。positional delete file が大きくなることはよくあり、その場合コストがかなり高くなります。私の実装では、Parquet delete file の最後の row-group だけを RAM に保持するようにしており、これによりコストを大幅に削減できます。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* chdig: 画面に残る不要な表示を修正し、エディタでクエリを編集した後に発生するクラッシュを修正し、`path` から `editor` を検索するようにし、[25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1) に更新。 [#85341](https://github.com/ClickHouse/ClickHouse/pull/85341) ([Azat Khuzhin](https://github.com/azat)).
* 不足していた `partition_columns_in_data_file` を Azure の設定に追加しました。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos)).
* 関数 `timeSeries*ToGrid` でステップ幅 0 を許可するようにしました。これは [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) の一部です。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* system.tables にデータレイクテーブルを追加するかどうかを制御するフラグ show&#95;data&#95;lake&#95;catalogs&#95;in&#95;system&#95;tables を追加しました。[#85384](https://github.com/ClickHouse/ClickHouse/issues/85384) を解決します。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `remote_fs_zero_copy_zookeeper_path` でマクロ展開がサポートされました。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme)).
* clickhouse-client の AI 機能の見た目が少し良くなります。 [#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 古いデプロイメントで `trace_log.symbolize` をデフォルトで有効にしました。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 複合識別子を扱えるケースをさらに拡大しました。特に、`ARRAY JOIN` と旧アナライザーとの互換性が向上しています。従来の動作を維持するために、新しい設定 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` を導入しました。 [#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* system.columns でテーブル列サイズを取得する際に UNKNOWN&#95;DATABASE を無視するようにしました。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* パッチパーツ内の非圧縮バイト数の合計に対する上限（テーブル設定 `max_uncompressed_bytes_in_patches`）を追加しました。これにより、軽量更新後に発生する SELECT クエリの大幅な低速化を防止し、軽量更新の不適切な利用も防ぎます。 [#85641](https://github.com/ClickHouse/ClickHouse/pull/85641) ([Anton Popov](https://github.com/CurtizJ)).
* `GRANT READ/WRITE` のソースタイプおよび `GRANT TABLE ENGINE` のテーブルエンジンを判別できるように、`system.grants` に `parameter` 列を追加しました。 [#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* パラメーター付きカラム（例: Decimal(8)）の後に続くカラムで末尾にカンマがある場合の、`CREATE DICTIONARY` クエリの構文解析を修正しました。[#85586](https://github.com/ClickHouse/ClickHouse/issues/85586) をクローズします。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 関数 `nested` で入れ子の配列をサポート。[#85719](https://github.com/ClickHouse/ClickHouse/pull/85719)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 外部ライブラリによるすべてのメモリアロケーションが、ClickHouse のメモリトラッカーで可視化され、正しく計上されるようになりました。これにより、特定のクエリで報告されるメモリ使用量が「増加」して見えたり、`MEMORY_LIMIT_EXCEEDED` による失敗が発生する場合があります。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。



#### バグ修正（公式安定版リリースでユーザーに影響する不具合）



* この PR は、REST カタログ経由で Iceberg テーブルをクエリする際のメタデータ解決を修正します。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha))。
* DDLWorker と DatabaseReplicatedDDLWorker における markReplicasActive を修正しました。[#81395](https://github.com/ClickHouse/ClickHouse/pull/81395)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* パース失敗時の Dynamic 列のロールバック処理を修正しました。 [#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar)).
* 関数 `trim` がすべて定数の入力で呼び出された場合、定数の出力文字列を生成するようになりました（バグ [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* `optimize_syntax_fuse_functions` が有効な場合に発生する重複サブクエリによる論理エラーを修正し、[#75511](https://github.com/ClickHouse/ClickHouse/issues/75511) をクローズ。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `WHERE ... IN (<subquery>)` 句を含み、かつ `query condition cache`（設定 `use_query_condition_cache`）が有効なクエリで誤った結果が返される問題を修正しました。 [#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you)).
* `gcs` 関数はこれまで、使用するために特別なアクセス権を必要としませんでしたが、今後は使用時に `GRANT READ ON S3` 権限が付与されているかを確認するようになります。[#70567](https://github.com/ClickHouse/ClickHouse/issues/70567) をクローズします。[#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* s3Cluster() からレプリケーテッド MergeTree への INSERT SELECT 実行時に、利用できないノードをスキップするようにしました。 [#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter)).
* `plain_rewritable`/`plain` メタデータ型に対して、（MergeTree の実験的トランザクションで使用される）追記モードでの書き込みが無視されていた問題を修正しました。以前は、これらは単に無視されていました。 [#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach))。
* ユーザーやログから見えないように、Avro schema registry の認証情報をマスクしました。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `add_minmax_index_for_numeric_columns=1` または `add_minmax_index_for_string_columns=1` を指定して MergeTree テーブルを作成した場合に、後続の ALTER 操作でインデックスがマテリアライズされることで、新しいレプリカ上で Replicated データベースが正しく初期化されない問題を修正。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique))。
* Decimal 型に対して誤った統計情報（min/max）を出力していた Parquet ライターを修正しました。 [#83754](https://github.com/ClickHouse/ClickHouse/pull/83754) ([Michael Kolupaev](https://github.com/al13n321)).
* `LowCardinality(Float32|Float64|BFloat16)` 型における NaN 値のソートを修正。 [#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* バックアップから復元する際に、`definer` ユーザーがバックアップに含まれていない場合があり、その結果バックアップ全体が壊れてしまうことがあります。これを回避するために、復元時の対象テーブル作成時に行っていた権限チェックを実行時まで延期し、実行時にのみチェックを行うようにしました。 [#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit)).
* 不正な `INSERT` の後に接続が切断状態のまま残ることで発生していたクライアントのクラッシュを修正します。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat))。
* アナライザー有効時に、`remote` テーブル関数の `view(...)` 引数内で任意のテーブルを参照できるようにしました。[#78717](https://github.com/ClickHouse/ClickHouse/issues/78717) を修正。[#79377](https://github.com/ClickHouse/ClickHouse/issues/79377) を修正。[#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* jsoneachrowwithprogress における onprogress 呼び出しが、ファイナライズ処理と同期されるようになりました。 [#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema)).
* これにより [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303) がクローズされます。[#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* const 引数と非 const 引数が混在する場合に備えて、colorSRGBToOKLCH/colorOKLCHToSRGB を修正。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat)).
* RowBinary フォーマットで、NULL 値を含む JSON パスの書き込み処理を修正。 [#83923](https://github.com/ClickHouse/ClickHouse/pull/83923) ([Pavel Kruglov](https://github.com/Avogar)).
* Date から DateTime64 へのキャスト時に、大きな値 (&gt;2106-02-07) で発生していたオーバーフローが修正されました。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 常に `filesystem_prefetches_limit` を適用するようにしました（`MergeTreePrefetchedReadPool` の場合に限らず）。 [#83999](https://github.com/ClickHouse/ClickHouse/pull/83999) ([Azat Khuzhin](https://github.com/azat)).
* `MATERIALIZE COLUMN` クエリにより `checksums.txt` に想定外のファイルが記録され、最終的にデータパーツが detach されてしまう可能性のあった、まれなバグを修正しました。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* `LowCardinality` の列と定数の間で不等号条件による `JOIN` を実行する際に発生する、`Expected single dictionary argument for function` という論理エラーを修正。[#81779](https://github.com/ClickHouse/ClickHouse/issues/81779) をクローズ。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 構文ハイライトを有効にした対話モードで `clickhouse client` を使用した際に発生するクラッシュを修正しました。 [#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc)).
* クエリ条件キャッシュを再帰的な CTE と併用した際に誤った結果が返される問題を修正しました（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* 定期的なパーツのリフレッシュで例外を適切に処理するようにしました。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 等価条件のオペランドの型が異なる場合や、定数を参照している場合に、フィルタを `JOIN` 条件にマージしてしまう不具合を修正しました。[#83432](https://github.com/ClickHouse/ClickHouse/issues/83432) を修正します。 [#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* テーブルにプロジェクションがあり、`lightweight_mutation_projection_mode = 'rebuild'` のとき、ユーザーがテーブル内の任意のブロックで全行を削除するライトウェイト削除を実行すると発生する、まれな ClickHouse のクラッシュを修正しました。 [#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin)).
* バックグラウンドのキャンセルチェック用スレッドが原因で発生するデッドロックを修正。 [#84203](https://github.com/ClickHouse/ClickHouse/pull/84203) ([Antonio Andelic](https://github.com/antonio2368)).
* 不正な `WINDOW` 定義に対する無限再帰的な解析を修正しました。[#83131](https://github.com/ClickHouse/ClickHouse/issues/83131) を解決。[#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* 誤った Bech32 のエンコードおよびデコードを引き起こしていたバグを修正しました。このバグは、テストに使用していたアルゴリズムのオンライン実装にも同じ問題があったため、当初は検出されませんでした。[#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov))。
* `array()` 関数での空タプルの不正な構築を修正しました。これにより [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202) が解消されます。 [#84297](https://github.com/ClickHouse/ClickHouse/pull/84297) ([Amos Bird](https://github.com/amosbird))。
* 並列レプリカを使用し、複数の `INNER` 結合の後に `RIGHT` 結合が続くクエリで発生していた `LOGICAL_ERROR` を修正しました。この種のクエリには並列レプリカを使用しないようにしました。 [#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 以前は、`set` インデックスがフィルタを通過したかどうかを判定する際に、`Nullable` カラムを考慮していませんでした（issue [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* ClickHouse は、テーブルタイプが小文字で指定されている Glue Catalog からテーブルを読み取れるようになりました。 [#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin))。
* `JOIN` やサブクエリが存在する場合は、テーブル関数をそのクラスタ版に置き換えようとしないでください。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `IAccessStorage` におけるロガーの使用方法を修正。[#84365](https://github.com/ClickHouse/ClickHouse/pull/84365)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* テーブル内のすべての列を対象とする軽量更新で発生していた論理エラーを修正しました。 [#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ)).
* `DoubleDelta` コーデックは、数値型のカラムにのみ適用できるようになりました。特に、`FixedString` カラムは `DoubleDelta` を使用して圧縮できなくなりました（[#80220](https://github.com/ClickHouse/ClickHouse/issues/80220) の修正）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `MinMax` インデックスの評価時に、NaN 値との比較で正しい範囲が使用されていませんでした。 [#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov)).
* レイジー・マテリアライズを使用した `Variant` 列の読み取りを修正しました。 [#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar)).
* `zoutofmemory` をハードウェアエラーにし、そうでない場合には論理エラーをスローするようにしました。参照: [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877)。[#84420](https://github.com/ClickHouse/ClickHouse/pull/84420)（[Han Fei](https://github.com/hanfei1991)）。
* サーバー設定 `allow_no_password` を 0 に変更した後、`no_password` で作成されたユーザーがログインを試みるとサーバーがクラッシュする問題を修正しました。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Keeper の changelog への順不同な書き込みを修正しました。以前は、changelog への書き込みが進行中の状態で、`rollback` により出力先ファイルが並行して変更される可能性がありました。この問題により、ログの不整合やデータ損失が発生するおそれがありました。 [#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368)).
* すべての TTL がテーブルから削除された場合、MergeTree は TTL に関連する処理を一切行わなくなりました。 [#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin)).
* `LIMIT` 付きの並列分散 `INSERT SELECT` が誤って許可されており、ターゲットテーブルでデータが重複する原因になっていました。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* データレイクにおける仮想カラムを利用したファイルのプルーニング処理を修正。 [#84520](https://github.com/ClickHouse/ClickHouse/pull/84520) ([Kseniia Sumarokova](https://github.com/kssenii)).
* rocksdb ストレージを使用する keeper におけるリークを修正しました（イテレータが破棄されていませんでした）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* `ALTER MODIFY ORDER BY` がソートキー内の TTL 列を検証しない問題を修正しました。これにより、`ALTER` 操作中に `ORDER BY` 句で TTL 列が使用された場合には正しく拒否され、テーブル破損の可能性が防止されます。 [#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 互換性のため、`allow_experimental_delta_kernel_rs` の pre-25.5 における値を `false` に変更。 [#84587](https://github.com/ClickHouse/ClickHouse/pull/84587) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マニフェストファイルからスキーマを取得するのをやめ、各スナップショットごとに関連するスキーマを個別に保存するようにしました。各データファイルについて、そのファイルに対応するスナップショットから関連スキーマを推論します。以前の動作は、`existing` ステータスを持つエントリに関して Iceberg のマニフェストファイル仕様に違反していました。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik)).
* Keeper の設定 `rotate_log_storage_interval = 0` により ClickHouse がクラッシュしてしまう問題を修正しました（issue [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975)）。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637)（[George Larionov](https://github.com/george-larionov)）。
* S3Queue の論理エラー「Table is already registered」を修正。[#84433](https://github.com/ClickHouse/ClickHouse/issues/84433) をクローズ。 [https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) によって発生した不具合。 [#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* RefreshTask 内で「view」から ZooKeeper を取得する際に「mutex」をロックする。 [#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 外部ソートと併用した場合に lazy カラムで発生する `CORRUPTED_DATA` エラーを修正。 [#84738](https://github.com/ClickHouse/ClickHouse/pull/84738) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ストレージ `DeltaLake` における delta-kernel 使用時のカラムプルーニングを修正。[#84543](https://github.com/ClickHouse/ClickHouse/issues/84543) をクローズ。[#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DeltaLake ストレージ内の delta-kernel で資格情報をリフレッシュするようにしました。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 接続障害の後に開始される不要な内部バックアップが作成されないよう修正しました。 [#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar))。
* 遅延したリモートソースに対してクエリを実行した際に、ベクターの範囲外アクセスが発生する可能性があった問題を修正しました。 [#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` と `no_op` のトークナイザーは、空の入力トークンでも (実験的な) text index をクラッシュさせなくなりました。 [#84849](https://github.com/ClickHouse/ClickHouse/pull/84849) ([Robert Schulze](https://github.com/rschu1ze)).
* `ReplacingMergeTree` および `CollapsingMergeTree` エンジンを使用するテーブルに対する lightweight update の不具合を修正しました。 [#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* object queue エンジンを使用するテーブルで、すべての設定がテーブルメタデータに正しく保存されるようにしました。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper が返すウォッチの合計数のカウントを修正。 [#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* バージョン 25.7 より前のサーバー上で作成された `ReplicatedMergeTree` エンジンのテーブルに対する軽量更新の問題を修正しました。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ))。
* `ALTER TABLE ... REPLACE PARTITION` クエリ実行後に、非レプリケートの `MergeTree` エンジンを使用するテーブルに対する軽量更新が正しく動作しない問題を修正しました。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* クエリ内での boolean リテラルと整数リテラルの間でカラム名が衝突しないようにするため、boolean リテラルに対するカラム名の生成を「1」/「0」ではなく「true」/「false」を使用するように修正しました。 [#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* バックグラウンドのスケジュールプールとエグゼキューターによるメモリトラッキングのずれを修正しました。 [#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* Merge テーブルエンジンでソートが不正確になる可能性のある問題を修正しました。 [#85025](https://github.com/ClickHouse/ClickHouse/pull/85025) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* DiskEncrypted 向けの未実装 API を実装。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 分散コンテキストで相関サブクエリが使用されている場合にクラッシュを回避するためのチェックを追加しました。[#82205](https://github.com/ClickHouse/ClickHouse/issues/82205) を修正。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* Iceberg は、`SELECT` クエリ間で関連するスナップショットバージョンをキャッシュしようとせず、常に正確にスナップショットを解決するようになりました。以前の Iceberg スナップショットのキャッシュ試行は、タイムトラベル機能を伴う Iceberg テーブルの利用に問題を引き起こしていました。 [#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* `AzureIteratorAsync` で発生していた二重解放を修正しました。 [#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat))。
* JWT で識別されるユーザーを作成しようとした際のエラーメッセージを改善しました。 [#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `ReplicatedMergeTree` におけるパッチパーツのクリーンアップを修正しました。以前は、軽量な更新の結果が、パッチパーツを具体化するマージ済みまたはミューテートされたパーツが別のレプリカからダウンロードされるまで、レプリカ上で一時的に見えない場合がありました。 [#85121](https://github.com/ClickHouse/ClickHouse/pull/85121) ([Anton Popov](https://github.com/CurtizJ)).
* 型が異なる場合の mv における illegal&#95;type&#95;of&#95;argument エラーを修正。 [#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* delta-kernel 実装で発生していたセグメンテーションフォルトを修正。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* メタデータファイルの移動に長時間かかる場合のレプリケートデータベースの復旧処理を修正。 [#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `additional_table_filters expression` 設定内での `IN (subquery)` における `Not-ready Set` の問題を修正しました。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* SYSTEM DROP REPLICA クエリ実行中の不要な `getStatus()` 呼び出しを削除しました。バックグラウンドでテーブルが削除される際に `Shutdown for storage is called` 例外がスローされる問題を修正しました。 [#85220](https://github.com/ClickHouse/ClickHouse/pull/85220) ([Nikolay Degterinsky](https://github.com/evillique)).
* `DeltaLake` エンジンの delta-kernel 実装における競合状態を修正。 [#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` エンジンで `delta-kernel` を無効化している場合に、パーティション化されたデータを読み込めない不具合を修正しました。この不具合は 25.7 で発生していました（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* CREATE OR REPLACE クエリおよび RENAME クエリに、不足していたテーブル名の長さチェックを追加しました。 [#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321)).
* `DEFINER` が削除された場合に、`Replicated` データベースの新しいレプリカ上で RMV を作成できない問題を修正しました。 [#85327](https://github.com/ClickHouse/ClickHouse/pull/85327) ([Nikolay Degterinsky](https://github.com/evillique))。
* 複合型に対する Iceberg への書き込みを修正。 [#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 複合型に対して下限値および上限値を書く操作はサポートされていません。 [#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Distributed テーブルまたは remote テーブル関数を介して object storage 関数から読み込む際に発生する論理エラーを修正しました。修正: [#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、修正 [#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、修正 [#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 壊れたプロジェクションを含むパーツのバックアップを修正します。 [#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368)).
* 安定するまでのリリースでは、プロジェクション内で `_part_offset` 列を使用できないようにしました。 [#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* JSON に対する ALTER UPDATE 実行時のクラッシュとデータ破損を修正。 [#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar)).
* `reverse in order` 読み取り最適化を使用する並列レプリカ付きクエリが、誤った結果を返すことがあります。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter))。
* String のデシリアライズ中に MEMORY&#95;LIMIT&#95;EXCEEDED が発生した場合の、潜在的な未定義動作（クラッシュ）を修正。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 誤っていたメトリクス KafkaAssignedPartitions と KafkaConsumersWithAssignment を修正。 [#85494](https://github.com/ClickHouse/ClickHouse/pull/85494) ([Ilya Golshtein](https://github.com/ilejn)).
* `PREWHERE`（明示的または自動的）使用時に `processed bytes` 統計が過小に計上される問題を修正しました。 [#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321))。
* S3 リクエストレートのスローダウンに対する早期リターン条件を修正: リトライ可能なエラーにより全スレッドが一時停止している場合のスローダウン動作を有効にする際に、`s3_slow_all_threads_after_network_error` と `backup_slow_all_threads_after_retryable_s3_error` の両方が true であることを要求するのではなく、いずれか一方が true であればよいように変更。 [#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva))。
* この PR では、REST カタログ経由で Iceberg テーブルをクエリする際のメタデータ解決を修正しています。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha))。
* `log_comment` または `insert_deduplication_token` 設定を変更する非同期挿入で、まれに発生していたクラッシュを修正しました。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ))。
* HTTP で multipart/form-data を使用する場合、date&#95;time&#95;input&#95;format などのパラメータが無視されていました。 [#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema)).
* icebergS3Cluster および icebergAzureCluster テーブル関数におけるシークレットのマスキング処理を修正。 [#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `JSONExtract` で JSON 数値を Decimal 型に変換する際に発生していた精度損失を修正しました。これにより、数値の JSON 値は浮動小数点の丸め誤差を避けつつ、元の 10 進表現を正確に保持できるようになりました。 [#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b)).
* `DROP COLUMN` の後に、同じ `ALTER` 文内で `COMMENT COLUMN IF EXISTS` を使用した場合に発生していた `LOGICAL_ERROR` を修正しました。`IF EXISTS` 句は、同じ文の中でカラムが削除されている場合、そのコメント操作を正しくスキップするようになりました。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* Delta Lake に対するキャッシュからの読み取り回数のカウントを修正。 [#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 長い文字列に対する `coalescing merge tree` のセグメンテーションフォールトを修正しました。これにより [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582) がクローズされます。 [#85709](https://github.com/ClickHouse/ClickHouse/pull/85709) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* Iceberg への書き込み時にメタデータのタイムスタンプを更新します。 [#85711](https://github.com/ClickHouse/ClickHouse/pull/85711) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `distributed_depth` を *Cluster 関数の指標として使用するのは誤りであり、データの重複を引き起こす可能性があります。代わりに `client_info.collaborate_with_initiator` を使用してください。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark は position delete ファイルを読み込めません。 [#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `send_logs_source_regexp` を修正（[#85105](https://github.com/ClickHouse/ClickHouse/issues/85105) における非同期ロギングのリファクタリング後）。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* MEMORY&#95;LIMIT&#95;EXCEEDED エラー時に `update_field` を持つ辞書で起こりうる不整合を修正しました。 [#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat)).
* `Distributed` 宛先テーブルに対する並列分散型の `INSERT SELECT` で、`WITH` ステートメントによるグローバル定数をサポートしました。以前は、このクエリで `Unknown expression identifier` エラーが発生することがありました。 [#85811](https://github.com/ClickHouse/ClickHouse/pull/85811) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` および `icebergAzureCluster` の認証情報をマスク。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* `DatabaseReplicated` で `CREATE ... AS (SELECT * FROM s3Cluster(...))` を実行しようとした際に発生する論理エラーを修正しました。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `url()` テーブル関数によって送信される HTTP リクエストが、非標準ポートにアクセスする際に `Host` ヘッダーにポート番号を正しく含めるように修正します。これにより、開発環境で一般的な、カスタムポートで動作する MinIO のような S3 互換サービスでプリサインド URL を使用した際に発生していた認証エラーが解消されます。（[#85898](https://github.com/ClickHouse/ClickHouse/issues/85898) を修正）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* unity catalog は、non-delta テーブルの場合に、異常なデータ型を含むスキーマを無視するようになりました。 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699) を修正。 [#85950](https://github.com/ClickHouse/ClickHouse/pull/85950) ([alesapin](https://github.com/alesapin))。
* Iceberg 内のフィールドの null 許容を修正。[#85977](https://github.com/ClickHouse/ClickHouse/pull/85977)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `Replicated` データベースのリカバリにおけるバグを修正しました。テーブル名に `%` 記号が含まれている場合、リカバリ時に別の名前でテーブルが再作成されてしまう可能性がありました。 [#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 空の `Memory` テーブルを復元する際に `BACKUP_ENTRY_NOT_FOUND` エラーが発生してバックアップのリストアが失敗する問題を修正。 [#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva)).
* Distributed テーブルの ALTER 時に `sharding_key` のチェックを追加しました。以前は、不正な ALTER によってテーブル定義が壊れ、サーバーの再起動が必要になる可能性がありました。 [#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique)).
* 空の Iceberg delete ファイルを作成しないようにしました。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 大きな設定値が原因で `S3Queue` テーブルが壊れ、レプリカが再起動できなくなる問題を修正。 [#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique)).

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

* `MergeTree` ファミリーのテーブルに対する軽量更新のサポートを追加しました。軽量更新は、新しい構文 `UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>` で使用できます。軽量更新を用いた軽量削除の実装も追加しました。`lightweight_delete_mode = 'lightweight_update'` を設定することで有効化できます。[#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* Iceberg のスキーマ進化で複合データ型をサポート。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg テーブルへの INSERT をサポートしました。[#82692](https://github.com/ClickHouse/ClickHouse/pull/82692)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `field id` 単位で Iceberg データファイルを読み取れるようにしました。これにより Iceberg との互換性が向上します。メタデータ側ではフィールド名を変更しつつ、基盤となる Parquet ファイル側では別の名前にマッピングできるようになります。これにより [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065) がクローズされました。 [#83653](https://github.com/ClickHouse/ClickHouse/pull/83653) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 現在、ClickHouse は Iceberg 用の圧縮された `metadata.json` ファイルをサポートします。 [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874) を修正しました。 [#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* Glue カタログで `TimestampTZ` をサポート。これにより [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654) がクローズされました。[#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse クライアントに AI を活用した SQL 生成機能を追加しました。ユーザーはクエリの先頭に `??` を付けることで、自然言語による説明から SQL クエリを生成できるようになりました。OpenAI および Anthropic のプロバイダーをサポートし、自動スキーマ検出にも対応しています。 [#83314](https://github.com/ClickHouse/ClickHouse/pull/83314) ([Kaushik Iska](https://github.com/iskakaushik))。
* Geo 型を WKB 形式で書き出す関数を追加しました。 [#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ソースに対して新たに 2 種類のアクセス種別 `READ` と `WRITE` が導入され、ソースに関連するそれまでのすべてのアクセス種別は非推奨となりました。以前は `GRANT S3 ON *.* TO user` でしたが、今後は `GRANT READ, WRITE ON S3 TO user` となります。これにより、ソースに対する `READ` と `WRITE` の権限を分離することも可能です。例: `GRANT READ ON * TO user`, `GRANT WRITE ON S3 TO user`。この機能は設定 `access_control_improvements.enable_read_write_grants` によって制御され、デフォルトでは無効になっています。 [#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit)).
* NumericIndexedVector: ビットスライス方式の Roaring-bitmap 圧縮を基盤とする新しいベクターデータ構造であり、構築・解析・要素単位の算術演算のための 20 種類以上の関数を備えています。スパースデータに対するストレージ容量を削減し、JOIN、フィルタ、集約を高速化できます。[#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) および T. Xiong と Y. Wang による VLDB 2024 掲載論文「[Large-Scale Metric Computation in Online Controlled Experiment Platform](https://arxiv.org/abs/2405.08411)」を実装しています。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193) ([FriendLey](https://github.com/FriendLey))。
* ワークロード設定 `max_waiting_queries` がサポートされるようになりました。これを使用して、クエリキューのサイズを制限できます。上限に達すると、その後のすべてのクエリは `SERVER_OVERLOADED` エラーで終了します。 [#81250](https://github.com/ClickHouse/ClickHouse/pull/81250) ([Oleg Doronin](https://github.com/dorooleg))。
* 次の財務関数を追加しました: `financialInternalRateOfReturnExtended` (`XIRR`)、`financialInternalRateOfReturn` (`IRR`)、`financialNetPresentValueExtended` (`XNPV`)、`financialNetPresentValue` (`NPV`)。 [#81599](https://github.com/ClickHouse/ClickHouse/pull/81599) ([Joanna Hulboj](https://github.com/jh0x))。
* 2つのポリゴンが交差しているかどうかを判定する地理空間関数 `polygonsIntersectCartesian` と `polygonsIntersectSpherical` を追加。 [#81882](https://github.com/ClickHouse/ClickHouse/pull/81882) ([Paul Lamb](https://github.com/plamb)).
* MergeTree ファミリーのテーブルで `_part_granule_offset` 仮想列をサポートしました。この列は、各行が属するデータパーツ内でのグラニュール／マークの 0 始まりのインデックスを表します。これは [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572) に対応するものです。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* sRGB と OkLCH のカラースペース間で色を変換する SQL 関数 `colorSRGBToOkLCH` および `colorOkLCHToSRGB` を追加しました。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue)).
* `CREATE USER` クエリでユーザー名にパラメーターを使用できるようにしました。 [#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein)).
* `system.formats` テーブルに、HTTP コンテンツタイプやスキーマ推論の機能など、フォーマットに関するより詳細な情報が含まれるようになりました。 [#81505](https://github.com/ClickHouse/ClickHouse/pull/81505) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### 実験的機能
* テキストインデックスを検索するための汎用ツールとして、関数 `searchAny` と `searchAll` を追加しました。 [#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスで新しい `split` トークナイザーをサポートするようにしました。 [#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `text` インデックスのデフォルトのインデックス粒度を 64 に変更しました。これにより、社内ベンチマークにおける平均的なテストクエリの想定パフォーマンスが向上します。 [#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 ビットのビットマップは、ある状態の出辺ラベルを順序付きで保持しますが、出辺先の状態はハッシュテーブル内に現れる順序でディスクに保存されます。そのため、ディスクから読み出す際に、ラベルが誤った次状態を指してしまう可能性がありました。 [#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックス内の FST ツリーブロブに対して zstd 圧縮を有効化しました。 [#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* ベクター類似性インデックスをベータ版に昇格しました。ベクター類似性インデックスを使用するには、有効化が必要なエイリアス設定 `enable_vector_similarity_index` を導入しました。 [#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 実験的なゼロコピー複製に関連する実験的な `send_metadata` ロジックを削除しました。これは一度も使用されず、このコードをサポートしている人もいませんでした。関連するテストさえ存在しなかったため、かなり前から壊れていた可能性が高いです。 [#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* `StorageKafka2` を `system.kafka_consumers` に統合しました。 [#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 統計情報を用いて、`(a < 1 and a > 0) or b = 3` のような複雑な CNF/DNF を推定するようにしました。 [#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 非同期ロギングを導入しました。ログが低速なデバイスに出力される場合でも、クエリがブロックされなくなりました。 [#82516](https://github.com/ClickHouse/ClickHouse/pull/82516) ([Raúl Marín](https://github.com/Algunenano))。キューに保持できるエントリ数の上限を設けました。 [#83214](https://github.com/ClickHouse/ClickHouse/pull/83214) ([Raúl Marín](https://github.com/Algunenano))。
* `INSERT SELECT` が各シャード上で独立して実行されるモードでは、並列分散 `INSERT SELECT` はデフォルトで有効になります。`parallel_distributed_insert_select` 設定を参照してください。[#83040](https://github.com/ClickHouse/ClickHouse/pull/83040)（[Igor Nikonov](https://github.com/devcrafter)）。
* 集約クエリに非 `Nullable` 列に対する単一の `count()` 関数のみが含まれている場合、ハッシュテーブル探索時に集約ロジックが完全にインライン化されます。これにより、集約状態の割り当てや保持を行わずに済むため、メモリ使用量と CPU オーバーヘッドが大幅に削減されます。これは [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) に部分的に対処するものです。 [#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* `HashJoin` のパフォーマンスを最適化しました。典型的な「キー列が 1 列のみ」のケースではハッシュマップに対する追加のループを削除し、さらに `null_map` と `join_mask` が常に `true` / `false` となる場合には、それらのチェックも省略しました。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat))。
* `-If` コンビネータに対する些細な最適化。[#78454](https://github.com/ClickHouse/ClickHouse/pull/78454)（[李扬](https://github.com/taiyang-li)）。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取りと CPU 使用量の削減により、より低いレイテンシで完了します。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `filterPartsByQueryConditionCache` で `merge_tree_min_{rows,bytes}_for_seek` を尊重し、インデックスによるフィルタリングを行う他のメソッドと整合するようにしました。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* `TOTALS` ステップ以降のパイプラインをマルチスレッド対応にしました。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus))。
* `Redis` および `KeeperMap` ストレージのキーによるフィルタリングを修正。 [#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 新しい設定 `min_joined_block_size_rows`（`min_joined_block_size_bytes` に類似、デフォルトは 65409）を追加し、JOIN の入力および出力ブロックに対する最小ブロックサイズ（行数）を制御できるようにしました（結合アルゴリズムが対応している場合）。小さいブロックはまとめて 1 つにまとめられます。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` を実行しても、すべてのキャッシュが削除されることはなくなりました。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 等価類を使用して冗長な JOIN 演算を削除することで、相関サブクエリに対して生成されるプランを最適化しました。すべての相関列に等価な式が存在する場合、`query_plan_correlated_subqueries_use_substitution` 設定が有効であれば `CROSS JOIN` は生成されません。[#82435](https://github.com/ClickHouse/ClickHouse/pull/82435)（[Dmitry Novik](https://github.com/novikd)）。
* 相関サブクエリが関数 `EXISTS` の引数として現れる場合に、必要な列だけを読み取るようにしました。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* クエリ解析中のクエリツリーの速度比較を少し高速化しました。 [#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* false sharing を軽減するため、ProfileEvents の Counter にアラインメントを追加しました。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) で行われた `null_map` と `JoinMask` の最適化が、複数の論理和条件を含む JOIN のケースにも適用されました。また、`KnownRowsHolder` データ構造も最適化されました。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* `std::vector&lt;std::atomic_bool&gt;` をそのまま join フラグに使用し、フラグへアクセスするたびにハッシュを計算することを避けています。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* `HashJoin` が `lazy` 出力モードを使用している場合、結果列用のメモリを事前に確保しないでください。これは特に、一致数が少ない場合には非効率的です。さらに、結合の完了後には正確な一致数が分かるため、より精度の高い事前確保が可能です。 [#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat))。
* パイプライン構築時のポートヘッダーでのメモリコピーを最小化しました。元の[PR](https://github.com/ClickHouse/ClickHouse/pull/70105)は[heymind](https://github.com/heymind)によるものです。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* rocksdb ストレージ使用時の clickhouse-keeper の起動処理を改善しました。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368)).
* 高い同時実行負荷時のロック競合を減らすため、ストレージスナップショットデータの作成中にロックを保持しないようにしました。 [#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94))。
* パースエラーが発生しない場合にシリアライザを再利用することで、`ProtobufSingle` 入力形式のパフォーマンスを改善しました。 [#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa)).
* 短いクエリを高速化するためのパイプライン構築処理のパフォーマンスを改善しました。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 短いクエリを高速化するために `MergeTreeReadersChain::getSampleBlock` を最適化しました。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano)).
* 非同期リクエストによりデータカタログでのテーブル一覧取得を高速化。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* `s3_slow_all_threads_after_network_error` 設定が有効な場合に、S3 のリトライ機構へジッターを導入しました。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改善

* 可読性を高めるために、括弧を複数の色で表示。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* LIKE/REGEXP パターン内のメタ文字が、入力中にハイライト表示されるようになりました。これはすでに `clickhouse-format` と `clickhouse-client` の echo では利用可能でしたが、今回からコマンドプロンプトでも利用できるようになりました。 [#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `clickhouse-format` およびクライアントの echo におけるハイライトは、コマンドラインプロンプトでのハイライトと同様に動作します。 [#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `plain_rewritable` ディスクがデータベースメタデータ用ディスクとして利用可能になりました。`plain_rewritable` に `moveFile` と `replaceFile` メソッドを実装し、データベースディスクとしてサポートしました。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `PostgreSQL`、`MySQL`、`DataLake` データベースに対するバックアップを許可しました。このようなデータベースのバックアップでは、内部のデータではなく定義のみが保存されます。 [#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique))。
* `allow_experimental_join_condition` の設定は、現在は常に許可されているため、廃止予定としてマークされました。 [#80566](https://github.com/ClickHouse/ClickHouse/pull/80566) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ClickHouse の非同期メトリクスに pressure メトリクスを追加。[#80779](https://github.com/ClickHouse/ClickHouse/pull/80779)（[Xander Garbett](https://github.com/Garbett1)）。
* `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles` のメトリクスを追加し、マークキャッシュからのエビクションを追跡できるようにしました（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* Parquet の enum を、[spec](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum) で規定されているとおりバイト配列として書き込めるようにしました。 [#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos)).
* `DeltaLake` テーブルエンジンの改善: delta-kernel-rs には `ExpressionVisitor` API があり、この PR で実装されてパーティション列の式変換に適用されています（これは、これまで我々のコードで使用していた、delta-kernel-rs 側で非推奨となっていた古い方式を置き換えるものです）。将来的には、この `ExpressionVisitor` により、統計情報に基づくプルーニングや、いくつかの Delta Lake 固有機能も実装できるようになります。さらに、この変更の目的は、`DeltaLakeCluster` テーブルエンジンでのパーティションプルーニングをサポートすることです（パースされた式の結果である ActionsDAG はシリアライズされ、データパスとともにイニシエータから送信されます。というのも、プルーニングに必要なこの種の情報は、データファイル一覧のメタ情報としてのみ利用可能であり、この一覧取得はイニシエータのみが行いますが、情報自体は各読み取りサーバ上のデータに対して適用される必要があるためです）。 [#81136](https://github.com/ClickHouse/ClickHouse/pull/81136) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 名前付き `tuple` のスーパータイプを導出する際に、要素名を保持するようにしました。 [#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc)).
* StorageKafka2 で、以前にコミットされたオフセットに依存しないよう、消費したメッセージを手動でカウントするようにしました。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ClickHouse Keeper のデータを管理および分析するための新しいコマンドラインツール `clickhouse-keeper-utils` を追加しました。このツールは、スナップショットおよび changelog からの状態のダンプ、changelog ファイルの解析、特定のログ範囲の抽出をサポートします。 [#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 合計およびユーザーごとのネットワークスロットラーはリセットされないため、`max_network_bandwidth_for_all_users` と `max_network_bandwidth_for_all_users` の制限値が超過されることはありません。 [#81729](https://github.com/ClickHouse/ClickHouse/pull/81729)（[Sergei Trifonov](https://github.com/serxa)）。
* 出力フォーマットとして GeoParquet への書き込みをサポートしました。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 未完了のデータミューテーションの影響を現在受けているカラムを `RENAME COLUMN` の ALTER ミューテーションでリネームしようとする場合、その処理を開始できないようにしました。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* ヘッダーの `Connection` は、接続を維持すべきかどうかが分かった時点で、ヘッダーの末尾に送信されるようになりました。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema))。
* `listen_backlog`（デフォルト 4096）に基づいて TCP サーバーのキュー（デフォルト 64）を調整します。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* サーバーを再起動せずに、その場で `max_local_read_bandwidth_for_server` と `max_local_write_bandwidth_for_server` を再読み込みできる機能を追加。 [#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu))。
* `TRUNCATE TABLE system.warnings` を使用して `system.warnings` テーブル内のすべての警告を削除できるようにサポートを追加。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir))。
* データレイク用クラスタ関数でのパーティションプルーニングを修正。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLakeCluster テーブル関数におけるパーティション分割されたデータの読み取りを修正しました。この PR ではクラスタ関数のプロトコルバージョンを引き上げ、イニシエータからレプリカへ追加情報を送信できるようにしました。この追加情報にはパーティション列を解析するために必要な delta-kernel の変換式が含まれており、将来的には生成列などの他の情報も含められるようになります。[#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `reinterpret` 関数は、固定サイズのデータ型 `T` を要素とする `Array(T)` への変換をサポートするようになりました（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。 [#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* database Datalake で、よりわかりやすい例外がスローされるようになりました。 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211) を修正。 [#82304](https://github.com/ClickHouse/ClickHouse/pull/82304)（[alesapin](https://github.com/alesapin)）。
* `HashJoin::needUsedFlagsForPerRightTableRow` から false を返すことで CROSS JOIN を改善しました。 [#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc)).
* map 列の読み書きを `Array` of `Tuple` として可能にしました。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.licenses` に [Rust](https://clickhouse.com/blog/rust) クレートのライセンスを一覧表示します。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano)).
* `{uuid}` のようなマクロを、S3Queue テーブルエンジンの `keeper_path` 設定で使用できるようになりました。 [#82463](https://github.com/ClickHouse/ClickHouse/pull/82463) ([Nikolay Degterinsky](https://github.com/evillique))。
* Keeper の改善: バックグラウンドスレッドでディスク間の changelog ファイル移動を行うようにしました。以前は、changelog を別のディスクに移動する際、移動が完了するまで Keeper 全体がブロックされていました。その結果、移動処理に時間がかかる場合（例: S3 ディスクへの移動）にパフォーマンスが低下していました。 [#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper の改善: 新しい設定 `keeper_server.cleanup_old_and_ignore_new_acl` を追加しました。有効にすると、すべてのノードの ACL がクリアされ、新しいリクエストに対する ACL は無視されます。ノードから ACL を完全に削除することが目的の場合、新しいスナップショットが作成されるまでこの設定を有効のままにしておくことが重要です。 [#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368)).
* S3Queue テーブルエンジンを使用するテーブルでストリーミングを無効にするサーバー設定 `s3queue_disable_streaming` を新たに追加しました。この設定はサーバーを再起動せずに変更できます。 [#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュの動的リサイズ機能をリファクタリングしました。解析のためのログをさらに追加しました。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定ファイルなしで起動した `clickhouse-server` も、デフォルト設定の場合と同様に PostgreSQL ポート 9005 をリッスンします。 [#82633](https://github.com/ClickHouse/ClickHouse/pull/82633) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `ReplicatedMergeTree::executeMetadataAlter` では、StorageID を取得し、DDLGuard を取得せずに `IDatabase::alterTable` を呼び出そうとします。この間に、問題となっているテーブルを別のテーブルと入れ替えることが技術的には可能なため、定義を取得する際に誤ったテーブルの定義を取得してしまう可能性があります。これを避けるために、`IDatabase::alterTable` を呼び出そうとする際に UUID が一致しているかどうかを確認するための個別のチェックを追加しました。[#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 読み取り専用のリモートディスクでデータベースをアタッチする場合、テーブルの UUID を手動で DatabaseCatalog に追加するようにしました。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `NumericIndexedVector` でユーザーが `nan` および `inf` を使用できないようにしました。 [#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) などを修正しました。 [#82681](https://github.com/ClickHouse/ClickHouse/pull/82681) ([Raufs Dunamalijevs](https://github.com/rienath))。
* `X-ClickHouse-Progress` および `X-ClickHouse-Summary` ヘッダーのフォーマットでは、ゼロ値を省略しないでください。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper の改善: world:anyone ACL に対して特定の権限をサポートしました。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* SummingMergeTree において、明示的に列挙された列を集計対象に含める `RENAME COLUMN` または `DROP COLUMN` を許可しないようにしました。[#81836](https://github.com/ClickHouse/ClickHouse/issues/81836) をクローズ。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Decimal` から `Float32` への変換精度を向上。`Decimal` から `BFloat16` への変換を実装。[#82660](https://github.com/ClickHouse/ClickHouse/issues/82660) をクローズ。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI のスクロールバーの見た目が少し良くなりました。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-server` に埋め込み構成を使用することで、HTTP OPTIONS レスポンスを返して Web UI を利用できるようになりました。 [#82870](https://github.com/ClickHouse/ClickHouse/pull/82870) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 設定内のパスに対して追加の Keeper ACL を指定できるようになりました。特定のパスに追加の ACL を設定したい場合は、設定ファイルの `zookeeper.path_acls` で定義します。 [#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368)).
* 今後、`mutations` のスナップショットは可視部分のスナップショットから構築されます。また、スナップショットで使用される `mutation` カウンタは、含まれる `mutation` に基づいて再計算されます。 [#82945](https://github.com/ClickHouse/ClickHouse/pull/82945)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* Keeper がソフトメモリ制限により書き込みを拒否した際に `ProfileEvent` を追加するようにしました。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* `system.s3queue_log` に列 `commit_time` と `commit_id` を追加。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 場合によっては、メトリクスに複数の次元を持たせる必要があります。たとえば、単一のカウンタだけを持つのではなく、失敗したマージやミューテーションをエラーコード別にカウントしたい場合があります。このニーズに対応するために、そのための機能である `system.dimensional_metrics` を導入し、最初の多次元メトリクスとして `failed_merges` を追加しました。 [#83030](https://github.com/ClickHouse/ClickHouse/pull/83030) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* clickhouse client における不明な設定の警告を集約し、概要としてログに記録するようにしました。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc)).
* ClickHouse クライアントは、接続エラーが発生した際にローカルポートを報告するようになりました。 [#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` のエラー処理をわずかに改善しました。`/sys/block` ディレクトリが存在していてもアクセスできない場合、サーバーはブロックデバイスを監視せずに起動します。[#79229](https://github.com/ClickHouse/ClickHouse/issues/79229) をクローズします。 [#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SystemLogs` を通常テーブルの後（従来どおり「通常テーブルの前」ではなく、システムテーブルの前）にシャットダウンするようにしました。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `S3Queue` のシャットダウン処理にログを追加しました。 [#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Time` および `Time64` を `MM:SS`、`M:SS`、`SS`、または `S` としてパースできるようにしました。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `distributed_ddl_output_mode='*_only_active'` の場合、`max_replication_lag_to_enqueue` を超えるレプリケーションラグを持つ新規または復旧済みレプリカを待たないようにします。これにより、初期化やリカバリ完了後に新しいレプリカがアクティブになったものの、初期化中に大量のレプリケーションログを蓄積していたために発生する `DDL task is not finished on some hosts` を回避しやすくなります。さらに、レプリケーションログが `max_replication_lag_to_enqueue` 未満になるまで待機する `SYSTEM SYNC DATABASE REPLICA STRICT` クエリを実装しました。[#83302](https://github.com/ClickHouse/ClickHouse/pull/83302)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 例外メッセージ内での式アクションの説明が過度に長くならないようにしました。[#83164](https://github.com/ClickHouse/ClickHouse/issues/83164) をクローズ。[#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パーツのプレフィックスおよびサフィックスを解析する機能を追加し、非定数カラムのカバレッジもチェックできるようにしました。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 名前付きコレクション使用時の ODBC と JDBC のパラメータ名を統一。 [#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* ストレージのシャットダウン中に `getStatus` は `ErrorCodes::ABORTED` 例外をスローします。以前は、これにより SELECT クエリが失敗していましたが、現在は `ErrorCodes::ABORTED` 例外をキャッチして、意図的に無視するようにしました。 [#83435](https://github.com/ClickHouse/ClickHouse/pull/83435) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `MergeParts` エントリの part&#95;log プロファイルイベントに、`UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds` などのプロセスリソースメトリクスを追加。 [#83460](https://github.com/ClickHouse/ClickHouse/pull/83460) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Keeper で `create_if_not_exists`、`check_not_exists`、`remove_recursive` の機能フラグをデフォルトで有効化し、新しい種類のリクエストを利用できるようにしました。 [#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368)).
* サーバーのシャットダウン時には、テーブルを停止する前に S3（Azure など）Queue ストリーミングを停止します。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `JSON` 入力フォーマットで `Date` / `Date32` を整数として使用できるようにしました。 [#83597](https://github.com/ClickHouse/ClickHouse/pull/83597) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 特定の状況におけるプロジェクションの読み込みおよび追加に関する例外メッセージを、より読みやすくしました。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-server` のバイナリに対するチェックサム整合性検証をスキップできる設定オプションを追加しました。[#83637](https://github.com/ClickHouse/ClickHouse/issues/83637) を解決。 [#83749](https://github.com/ClickHouse/ClickHouse/pull/83749) ([Rafael Roquetto](https://github.com/rafaelroquetto))。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `clickhouse-benchmark` の `--reconnect` オプションの誤ったデフォルト値を修正しました。[#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) で誤って変更されたものでした。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CREATE DICTIONARY` のフォーマットの不整合を修正。[#82105](https://github.com/ClickHouse/ClickHouse/issues/82105) をクローズ。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `materialize` 関数を含む場合の TTL のフォーマットの不整合を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* INTO OUTFILE などの出力オプションを含むサブクエリ内で、`EXPLAIN AST` の書式が一貫しない問題を修正しました。[#82826](https://github.com/ClickHouse/ClickHouse/issues/82826) をクローズ。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* エイリアスが許可されていないコンテキストで、エイリアス付きの括弧付き式のフォーマットの不整合を修正します。 [#82836](https://github.com/ClickHouse/ClickHouse/issues/82836) をクローズ。 [#82837](https://github.com/ClickHouse/ClickHouse/issues/82837) をクローズ。 [#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* IPv4 と集約関数状態の乗算時に、適切なエラーコードを使用するようにしました。 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817) をクローズ。 [#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ファイルシステムキャッシュで発生していた論理エラー「Having zero bytes but range is not finished」を修正。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TTL によって行が削減された際に、`minmax_count_projection` などそのインデックスに依存するアルゴリズムの正しさを保証するため、min-max インデックスを再計算します。これにより [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091) が解決されます。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166) ([Amos Bird](https://github.com/amosbird))。
* `ORDER BY ... LIMIT BY ... LIMIT N` を組み合わせたクエリにおいて、ORDER BY が PartialSorting として実行される場合、カウンタ `rows_before_limit_at_least` は、ソート変換で処理された行数ではなく、LIMIT 句で処理された行数を反映するようになりました。 [#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 正規表現にオルタネーションが含まれ、最初の選択肢がリテラルでない場合に、token/ngram インデックスを使ったフィルタリングで granule を過剰にスキップしてしまう問題を修正しました。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* `<=>` 演算子と Join ストレージに関する論理エラーを修正し、クエリが正しいエラーコードを返すようにしました。 [#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `remote` 関数ファミリーと併用した際に `loop` 関数がクラッシュする問題を修正しました。`loop(remote(...))` で `LIMIT` 句が正しく適用されるようにしました。 [#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* Unix epoch（1970-01-01）より前、および最大日時（2106-02-07 06:28:15）より後の日付を扱う際の `to_utc_timestamp` と `from_utc_timestamp` 関数の誤った動作を修正しました。これらの関数は、値をそれぞれ epoch の開始時刻と最大日時に正しく切り詰めるようになりました。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046))。
* 並列レプリカで実行される一部のクエリでは、`reading in order` の最適化が initiator では適用できる一方、リモートノードでは適用できない場合がありました。これにより、並列レプリカコーディネータ（initiator 上）とリモートノードで異なる読み取りモードが使用されるという論理エラーが発生していました。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter))。
* カラム型が `Nullable` に変更された場合に、projection の materialize 処理中に発生していた論理エラーを修正。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL を更新する際に、`TTL GROUP BY` での TTL の再計算が正しく行われない問題を修正。 [#81222](https://github.com/ClickHouse/ClickHouse/pull/81222) ([Evgeniy Ulasik](https://github.com/H0uston)).
* Parquet の bloom filter が、`WHERE function(key) IN (...)` のような条件を、あたかも `WHERE key IN (...)` であるかのように誤って適用していた問題を修正しました。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* マージ中に例外が発生した場合に `Aggregator` がクラッシュし得る問題を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* 必要に応じてデータベース名およびテーブル名にバッククオートを付与するように `InterpreterInsertQuery::extendQueryLogElemImpl` を修正しました（例: 名前に `-` のような特殊文字が含まれる場合）。 [#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu)).
* `transform_null_in=1` 設定時に、左辺引数が null を含み、サブクエリ結果が non-nullable の場合の `IN` の実行を修正しました。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 既存のテーブルからの読み取り時に、`default` / `materialize` 式の実行中は実験的／疑わしい型を検証しないようにしました。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL 式で dict が使用されている場合のマージ中に発生する「Context has expired」エラーを修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat))。
* `cast` 関数の単調性を修正しました。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi))。
* スカラー相関サブクエリ処理中に必要なカラムが読み込まれない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正します。 [#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して過剰なコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) が解決されました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前は、`MongoDB` テーブルエンジンの定義で `host:port` 引数にパスコンポーネントを含めることができましたが、これは黙って無視されていました。`mongodb` 連携では、そのようなテーブルのロードを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルをロードできるようにし、引数からデータベース名を取得してパスコンポーネントを無視するようにしました*。*注:* この修正は、新しく作成されるテーブルや `mongo` テーブル関数を用いたクエリ、ならびに辞書ソースおよび名前付きコレクションには適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* `merge` 中の例外発生時に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* クエリで定数のエイリアス列のみが使用されている場合のフィルター解析を修正。[#79448](https://github.com/ClickHouse/ClickHouse/issues/79448) を解決。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* GROUP BY と SET の両方で TTL に同じカラムを使用した際に発生する LOGICAL&#95;ERROR と、続いて発生するクラッシュを修正。 [#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos)).
* シークレットマスキングにおける S3 テーブル関数の引数検証を修正し、`LOGICAL_ERROR` が発生する可能性を防止しました。[#80620](https://github.com/ClickHouse/ClickHouse/issues/80620) をクローズ。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* Iceberg のデータレースを修正。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* `DatabaseReplicated::getClusterImpl` を修正。`hosts` の先頭の要素（またはいくつかの先頭の要素）が `id == DROPPED_MARK` であり、かつ同じシャードに対する他の要素が存在しない場合、`shards` の先頭の要素が空のベクターとなり、`std::out_of_range` が発生する。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* arraySimilarity におけるコピペミスを修正し、UInt32 および Int32 の重みの使用を禁止。テストとドキュメントを更新。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* `WHERE` 句と `IndexSet` を伴う `arrayJoin` 使用時のクエリで発生する `Not found column` エラーを修正。 [#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Glue カタログ統合のバグを修正しました。これにより、ClickHouse は一部のサブカラムに Decimal 型を含むネストしたデータ型のテーブルを読み取れるようになりました（例: `map<string, decimal(9, 2)>`）。[#81301](https://github.com/ClickHouse/ClickHouse/issues/81301) を修正。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) の変更により 25.5 で発生した SummingMergeTree のパフォーマンス低下を修正しました。 [#82130](https://github.com/ClickHouse/ClickHouse/pull/82130) ([Pavel Kruglov](https://github.com/Avogar)).
* URI 経由で設定を渡す場合、最後の値が採用されます。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* Iceberg 向けの「Context has expired」を修正。 [#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* サーバーがメモリプレッシャー下にある場合に、リモートクエリで発生し得るデッドロックを修正。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar))。
* 大きな数値に対して適用した際に発生していた `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 関数のオーバーフローを修正しました。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165) ([Raufs Dunamalijevs](https://github.com/rienath))。
* テーブルの依存関係におけるバグを修正し、そのために `Materialized Views` が `INSERT` クエリを取りこぼしてしまう問題を解消しました。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* サジェスチョンスレッドとメインクライアントスレッド間で発生し得るデータレースを修正しました。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* ClickHouse は、スキーマ変更後の Glue カタログから iceberg テーブルを読み取れるようになりました。 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272) を修正。 [#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 非同期メトリクス設定 `asynchronous_metrics_update_period_s` および `asynchronous_heavy_metrics_update_period_s` のバリデーションを修正しました。 [#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc))。
* 複数の `JOIN` を含むクエリでマッチャーを解決する際の論理エラーを修正し、[#81969](https://github.com/ClickHouse/ClickHouse/issues/81969) をクローズしました。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421) ([Vladimir Cherkasov](https://github.com/vdimir))。
* AWS ECS トークンに有効期限を追加し、再ロードできるようにしました。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `CASE` 関数での `NULL` 引数に関するバグを修正しました。 [#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* クライアント内のデータレースを（グローバルコンテキストを使用しないことで）修正し、`session_timezone` のオーバーライド動作を修正しました（以前は、たとえば `session_timezone` が `users.xml` やクライアントオプションで空でない値に設定され、クエリコンテキストで空に設定された場合、本来は誤りであるにもかかわらず `users.xml` の値が使用されていました。現在は、クエリコンテキストが常にグローバルコンテキストより優先されます）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 外部テーブルエンジンにおけるキャッシュバッファの境界アラインメントを無効化する処理を修正しました。この処理は [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) で不具合が生じていました。 [#82493](https://github.com/ClickHouse/ClickHouse/pull/82493) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 型キャストされたキーでキー値ストレージを `JOIN` した際に発生するクラッシュを修正。 [#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* logs/query&#95;log での named collection の値のマスキング処理を修正。[#82405](https://github.com/ClickHouse/ClickHouse/issues/82405) をクローズ。 [#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `user_id` が空になる場合があることによって、セッション終了時のロギングで発生しうるクラッシュを修正しました。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc))。
* Time のパース時に msan の問題を引き起こす可能性があったケースを修正します。次の Issue を修正します: [#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* サーバーの操作が行き詰まらないようにするため、`threadpool_writer_pool_size` をゼロに設定できないようにしました。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc))。
* 相関列に対する行ポリシー式の解析中に発生する `LOGICAL_ERROR` を修正。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd))。
* `enable_shared_storage_snapshot_in_query = 1` の場合に `mergeTreeProjection` テーブル関数で親メタデータを誤って使用していた問題を修正。これは [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634) に対応する変更。 [#82638](https://github.com/ClickHouse/ClickHouse/pull/82638) ([Amos Bird](https://github.com/amosbird)).
* 関数 `trim{Left,Right,Both}` が、型 &quot;FixedString(N)&quot; の入力文字列をサポートするようになりました。たとえば、`SELECT trimBoth(toFixedString('abc', 3), 'ac')` が利用できるようになりました。 [#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* AzureBlobStorage において、ネイティブコピー用に認証方法を比較する際に例外が発生した場合、読み取りとコピー（つまり非ネイティブコピー）にフォールバックするようコードを更新しました。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 空要素がある場合の `groupArraySample` / `groupArrayLast` のデシリアライズ処理を修正しました（入力が空だとデシリアライズ時にバイナリの一部をスキップしてしまう可能性があり、その結果、データ読み取り時の破損や TCP プロトコルでの UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER を引き起こすおそれがありました）。これは数値型および日時型には影響しません。 [#82763](https://github.com/ClickHouse/ClickHouse/pull/82763) ([Pedro Ferreira](https://github.com/PedroTadim)).
* 空の `Memory` テーブルのバックアップ処理を修正し、バックアップのリストア時に `BACKUP_ENTRY_NOT_FOUND` エラーで失敗してしまう問題を解消しました。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* union/intersect/except&#95;default&#95;mode の書き換え処理における例外安全性を修正。[#82664](https://github.com/ClickHouse/ClickHouse/issues/82664) をクローズ。 [#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 非同期テーブルのロードジョブ数を管理します。実行中のジョブがある場合は、`TransactionLog::removeOldEntries` 内で `tail_ptr` を更新しないでください。 [#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach))。
* Iceberg のデータレースを修正しました。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* `use_skip_indexes_if_final_exact_mode` 最適化（25.6 で導入）は、`MergeTree` エンジンの設定やデータ分布によっては、適切な候補レンジを選択できない場合がありましたが、現在は解消されています。 [#82879](https://github.com/ClickHouse/ClickHouse/pull/82879) ([Shankar Iyer](https://github.com/shankar-iyer)).
* SCRAM&#95;SHA256&#95;PASSWORD 型の AST をパースする際に、認証データの salt を設定するようにしました。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach))。
* キャッシュを行わない `Database` 実装を使用する場合、対応するテーブルのメタデータは、カラムが返されて参照が無効化された後に削除されます。 [#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01))。
* `Merge` ストレージを使用するテーブルとの `JOIN` 式を含むクエリに対するフィルタ変更処理を修正。[#82092](https://github.com/ClickHouse/ClickHouse/issues/82092) を修正。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* QueryMetricLog における LOGICAL&#95;ERROR を修正: Mutex を NULL にできないようにしました。[#82979](https://github.com/ClickHouse/ClickHouse/pull/82979)（[Pablo Marcos](https://github.com/pamarcos)）。
* 可変長フォーマッタ（例：`%M`）と併用した場合に、フォーマッタ `%f` を使った関数 `formatDateTime` の出力が誤っていた問題を修正しました。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* analyzer 有効化時に、セカンダリクエリが常に VIEW からすべてのカラムを読み取ってしまうことによるパフォーマンス低下を修正しました。[#81718](https://github.com/ClickHouse/ClickHouse/issues/81718) を解決。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 読み取り専用ディスク上でバックアップを復元する際に表示される、誤解を招くエラーメッセージを修正。 [#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva)).
* 依存関係を持たない `CREATE TABLE` では循環依存関係のチェックを行わないようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) で導入された、数千のテーブルを作成するユースケースでのパフォーマンス低下が解消されます。 [#83077](https://github.com/ClickHouse/ClickHouse/pull/83077) ([Pavel Kruglov](https://github.com/Avogar))。
* テーブルへの負の Time 値の暗黙的な読み取りに関する問題を修正し、ドキュメントの記述も分かりやすくしました。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `lowCardinalityKeys` 関数で共有ディクショナリの無関係な部分を使用しないようにしました。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Materialized View におけるサブカラム使用時のリグレッションを修正しました。対象の修正: [#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。 [#83221](https://github.com/ClickHouse/ClickHouse/pull/83221) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 不正な `INSERT` の後に接続が切断状態のまま残ることでクライアントがクラッシュする問題を修正しました。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 空のカラムを含むブロックのサイズを計算する際に発生していたクラッシュを修正。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* UNION における Variant 型で発生しうるクラッシュを修正。 [#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar)).
* サポートされていない `SYSTEM` クエリに対して `clickhouse-local` で発生する `LOGICAL_ERROR` を修正。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* S3 クライアント向けの `no_sign_request` を修正しました。これは S3 リクエストへの署名を明示的に行わないようにするために使用できます。また、エンドポイントベースの設定を使用して、特定のエンドポイントごとに定義することもできます。 [#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368))。
* CPU スケジューリングが有効な状態で、負荷下で `max_threads=1` に設定されたクエリを実行した際に発生する可能性のあるクラッシュを修正しました。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* CTE の定義が同じ名前の別のテーブル式を参照している場合に発生する `TOO_DEEP_SUBQUERIES` 例外を修正。 [#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd)).
* `REVOKE S3 ON system.*` を実行した際に `*.*` の S3 権限まで取り消してしまう誤った動作を修正。これにより [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417) が修正されました。 [#83420](https://github.com/ClickHouse/ClickHouse/pull/83420) ([pufit](https://github.com/pufit)).
* クエリ間で async&#95;read&#95;counters を共有しないようにしました。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423)（[Azat Khuzhin](https://github.com/azat)）。
* サブクエリに FINAL が含まれている場合は、parallel replicas を無効にしました。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 設定 `role_cache_expiration_time_seconds` の構成で発生していた軽微な整数オーバーフローを解消しました（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。 [#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) で導入されたバグを修正します。definer を持つ MV に対して `INSERT` を行う場合、権限チェックでは definer の `GRANT` を使用する必要があります。これにより [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951) が修正されます。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* iceberg の配列要素および iceberg の map 値と、そのすべてのネストされたサブフィールドに対する bounds ベースのファイルプルーニングを無効化しました。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik))。
* 一時的なデータストレージとして使用される場合に発生する可能性のある、ファイルキャッシュ未初期化エラーを修正。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper の修正: セッション終了時にエフェメラルノードが削除される際に、`total watch count` が正しく更新されるようにしました。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* max&#95;untracked&#95;memory 周辺の不正なメモリ処理を修正。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat))。
* `INSERT SELECT` と `UNION ALL` の組み合わせで、ある特殊なケースにおいてヌルポインタのデリファレンスが発生する可能性がありました。これにより [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618) がクローズされました。 [#83643](https://github.com/ClickHouse/ClickHouse/pull/83643) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `max_insert_block_size` で 0 を許可しないようにしました。これは論理エラーを引き起こす可能性があるためです。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* block&#95;size&#95;bytes=0 の場合に estimateCompressionRatio() で発生する無限ループを修正。 [#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat)).
* `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` メトリクスを修正（以前は `Cache` プレフィックスのないメトリクスに含まれていた）。 [#83730](https://github.com/ClickHouse/ClickHouse/pull/83730) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundSchedulePool` のシャットダウン時に、タスクからのスレッド join によって発生し得るアボートと、（ユニットテストでの）ハングを修正。[#83769](https://github.com/ClickHouse/ClickHouse/pull/83769)（[Azat Khuzhin](https://github.com/azat)）。
* 名前の衝突が発生する場合に、新しいアナライザーが `WITH` 句内で外側のエイリアスを参照できるようにする後方互換性設定を導入しました。[#82700](https://github.com/ClickHouse/ClickHouse/issues/82700) を修正。[#83797](https://github.com/ClickHouse/ClickHouse/pull/83797) ([Dmitry Novik](https://github.com/novikd))。
* ライブラリブリッジのクリーンアップ中に発生する再帰的なコンテキストロックが原因で、シャットダウン時にデッドロックが起きる問題を修正。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### ビルド/テスト/パッケージングの改善

- ClickHouse字句解析器用の最小限のCライブラリ(10 KB)をビルドします。これは[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977)に必要です。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。スタンドアロン字句解析器のテストを追加し、テストタグ`fasttest-only`を追加します。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
- Nixサブモジュール入力のチェックを追加します。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- localhost上で統合テストを実行する際に発生する可能性のある問題のリストを修正します。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135) ([Oleg Doronin](https://github.com/dorooleg))。
- MacおよびFreeBSD上でSymbolIndexをコンパイルします。(ただし、ELFシステム、LinuxおよびFreeBSDでのみ動作します)。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Azure SDKをv1.15.0にアップグレードしました。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
- google-cloud-cppのストレージモジュールをビルドシステムに追加します。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881) ([Pablo Marcos](https://github.com/pamarcos))。
- clickhouse-server用の`Dockerfile.ubuntu`をDocker Official Libraryの要件に適合するように変更します。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158)のフォローアップとして、`curl clickhouse.com`へのビルドアップロードを修正します。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- `clickhouse/clickhouse-server`および公式`clickhouse`イメージに`busybox`バイナリとインストールツールを追加します。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- ClickHouseサーバーホストを指定するための`CLICKHOUSE_HOST`環境変数のサポートを追加しました。これは既存の`CLICKHOUSE_USER`および`CLICKHOUSE_PASSWORD`環境変数と整合性を持たせたものです。これにより、クライアントや設定ファイルを直接変更することなく、より簡単に設定できるようになります。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659) ([Doron David](https://github.com/dorki))。

### ClickHouseリリース25.6、2025-06-26 {#256}

#### 後方互換性のない変更

- 以前は、関数`countMatches`はパターンが空のマッチを受け入れる場合でも、最初の空のマッチでカウントを停止していました。この問題を解決するため、`countMatches`は空のマッチが発生した場合に1文字進めることで実行を継続するようになりました。古い動作を維持したいユーザーは、設定`count_matches_stop_at_empty_match`を有効にすることができます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 軽微な変更: サーバー設定`backup_threads`および`restore_threads`を非ゼロに強制します。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano))。
- 軽微な変更: `String`に対する`bitNot`の修正により、内部メモリ表現でゼロ終端文字列が返されるようになります。これはユーザーに見える動作には影響しないはずですが、作成者はこの変更を強調したいと考えました。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat))。


#### 新機能

* 新しいデータ型 `Time` ([H]HH:MM:SS) と `Time64` ([H]HH:MM:SS[.fractional])、および他のデータ型と相互に扱うための基本的なキャスト関数といくつかの関数を追加しました。既存の関数 `toTime` との互換性のための設定を追加しました。設定 `use_legacy_to_time` は、当面は従来の動作を維持するようにしています。 [#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。Time/Time64 間の比較をサポートしました。 [#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しい CLI ツール [`chdig`](https://github.com/azat/chdig/) — ClickHouse 用の `top` 風 TUI インターフェイスが、ClickHouse の一部として追加されました。 [#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* `Atomic` および `Ordinary` データベースエンジンで `disk` 設定をサポートし、テーブルのメタデータファイルを保存するディスクを指定できるようにしました。 [#80546](https://github.com/ClickHouse/ClickHouse/pull/80546) ([Tuan Pham Anh](https://github.com/tuanpach))。これにより、外部ソースからデータベースをアタッチできるようになります。
* 新しいタイプの MergeTree、`CoalescingMergeTree` — バックグラウンドマージの際に、エンジンは最初の非 Null 値を採用します。これにより [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869) が解決されました。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* WKB（「Well-Known Binary」は、GIS アプリケーションで使用される、さまざまなジオメトリ型をバイナリ形式でエンコードするためのフォーマット）の読み取りを行う関数をサポートします。[#43941](https://github.com/ClickHouse/ClickHouse/issues/43941) を参照してください。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* ワークロード向けのクエリスロットのスケジューリング機能を追加しました。詳細は [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling) を参照してください。 [#78415](https://github.com/ClickHouse/ClickHouse/pull/78415) ([Sergei Trifonov](https://github.com/serxa))。
* `timeSeries*` ヘルパー関数を追加し、時系列データを扱う際のいくつかのユースケースを高速化しました: - 指定した開始タイムスタンプ、終了タイムスタンプ、およびステップに基づく時間グリッドへのデータのリサンプリング - PromQL 風の `delta`、`rate`、`idelta` および `irate` の計算。 [#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger))。
* `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 関数を追加し、map の値に対するフィルタリングと、それらの Bloom Filter ベースインデックスでのサポートを可能にしました。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus)).
* 設定制約で、禁止する値の集合を指定できるようになりました。 [#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc))。
* 単一のクエリ内のすべてのサブクエリで同じストレージスナップショットを共有できるようにする設定 `enable_shared_storage_snapshot_in_query` を追加しました。これにより、クエリ内で同じテーブルが複数回参照される場合でも、そのテーブルからの読み取りの一貫性が保証されます。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* `JSON` 列を `Parquet` へ直接書き込むことと、`Parquet` から `JSON` 列を直接読み取ることをサポート。 [#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `pointInPolygon` で `MultiPolygon` をサポート。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `deltaLakeLocal` テーブル関数を使用して、ローカルファイルシステムにマウントされた Delta テーブルをクエリできるようにしました。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* String から DateTime へのキャスト時にパースモードを選択できる新しい設定 `cast_string_to_date_time_mode` を追加しました。 [#80210](https://github.com/ClickHouse/ClickHouse/pull/80210) ([Pavel Kruglov](https://github.com/Avogar))。例えば、ベストエフォートモードに設定できます。
* Bitcoin の Bech アルゴリズムを扱うための `bech32Encode` および `bech32Decode` 関数を追加しました（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。 [#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* MergeTree パーツ名を解析するための SQL 関数を追加しました。 [#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新しい仮想カラム `_disk_name` を導入し、クエリで選択されるパーツを、それらが存在するディスクでフィルタリングできるようにしました。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 埋め込み Web ツールの一覧を表示するランディングページを追加しました。ブラウザーライクなユーザーエージェントからのリクエスト時に開きます。 [#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `arrayFirst`、`arrayFirstIndex`、`arrayLast`、`arrayLastIndex` は、フィルタ式によって返される NULL 値を除外します。以前のバージョンでは、Nullable なフィルタ結果はサポートされていませんでした。[#81113](https://github.com/ClickHouse/ClickHouse/issues/81113) を修正。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* `USE name` の代わりに `USE DATABASE name` と書けるようになりました。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 利用可能な codec を確認するための新しい system テーブル `system.codecs` を追加しました (issue [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525))。 [#81600](https://github.com/ClickHouse/ClickHouse/pull/81600) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* `lag` と `lead` のウィンドウ関数をサポート。[#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) をクローズ。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `tokens` で、ログに適した新しいトークナイザー `split` がサポートされるようになりました。 [#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze))。
* `clickhouse-local` に `--database` 引数のサポートを追加しました。これにより、既存のデータベースに切り替えられるようになりました。この変更により [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115) が解決されました。[#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 実験的機能
* ClickHouse Keeper を使用して `Kafka2` 向けに Kafka の再バランスに類似したロジックを実装しました。各レプリカでは 2 種類のパーティションロックをサポートします: 永続ロックと一時ロックです。レプリカは可能な限り長く永続ロックを保持しようとし、任意の時点でレプリカ上の永続ロック数は `all_topic_partitions / active_replicas_count`（ここで `all_topic_partitions` はすべてのパーティション数、`active_replicas_count` はアクティブなレプリカ数）を超えません。もしそれ以上になった場合、レプリカはいくつかのパーティションを解放します。いくつかのパーティションはレプリカによって一時的に保持されます。レプリカ上の一時ロックの最大数は動的に変化し、他のレプリカがいくつかのパーティションを永続ロックとして取得できるようにします。一時ロックを更新する際、レプリカはいったんそれらをすべて解放し、再度別のパーティションを取得しようとします。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 実験的なテキストインデックスの改善として、キーと値のペアによる明示的なパラメータ指定をサポートしました。現在サポートされているパラメータは、必須の `tokenizer` と、任意の `max_rows_per_postings_list` および `ngram_size` です。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 以前は、フルテキストインデックスで `packed` ストレージはサポートされていませんでした。これは、セグメント ID がディスク上の (`.gin_sid`) ファイルを読み書きすることでオンザフライに更新されていたためです。`packed` ストレージでは、コミットされていないファイルから値を読み取ることがサポートされておらず、これが問題の原因になっていました。現在はこの問題は解消されています。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 型 `gin` の実験的インデックス（PostgreSQL ハッカーたちの内輪ネタなので好みではありませんでした）は `text` に改名されました。既存の型 `gin` のインデックスは引き続き読み込むことはできますが、検索で使用しようとすると例外をスローします（代わりに `text` インデックスを提案します）。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。



#### パフォーマンスの向上

* 複数プロジェクションでのフィルタリングをサポートし、パートレベルのフィルタリングで複数のプロジェクションを使用できるようにしました。これにより [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525) に対処しています。これは、プロジェクションインデックスを実装するための第 2 段階であり、[#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) に続くものです。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* ファイルシステムキャッシュのデフォルトのキャッシュポリシーとして `SLRU` を使用するようにしました。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii))。
* クエリパイプラインの Resize ステップにおける競合を解消。 [#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* ネットワーク接続にひも付いた単一スレッドではなく、パイプラインスレッドでブロックの(圧縮 / 解凍)および(シリアル化 / デシリアル化)処理を行うオプションを追加しました。設定 `enable_parallel_blocks_marshalling` によって制御されます。これにより、イニシエータとリモートノード間で大量のデータを転送する分散クエリの高速化が期待できます。[#78694](https://github.com/ClickHouse/ClickHouse/pull/78694)（[Nikita Taranov](https://github.com/nickitat)）。
* すべての Bloom filter タイプのパフォーマンスを改善しました。[OpenHouse カンファレンスの動画](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800)（[Delyan Kratunov](https://github.com/dkratunov)）。
* `UniqExactSet::merge` において、一方の集合が空の場合のハッピーパスを導入しました。また、LHS の集合が二階層構造で RHS が単一階層構造の場合、RHS を二階層構造へ変換しないようにしました。 [#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat)).
* 2 レベルのハッシュテーブル使用時のメモリ再利用効率を改善し、ページフォールトを削減しました。これにより `GROUP BY` の高速化を目指しています。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* クエリ条件キャッシュで不要な更新を避け、ロック競合を軽減しました。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* `concatenateBlocks` に対する軽微な最適化。並列ハッシュ結合におそらく有効です。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328)（[李扬](https://github.com/taiyang-li)）。
* 主キー範囲からマーク範囲を選択する際、主キーが関数でラップされている場合は二分探索を使用できませんでした。このPRによりこの制約が改善されました。主キーが常に単調な関数チェーンでラップされている場合、または RPN に常に `true` となる要素が含まれている場合には、二分探索を適用できるようになりました。[#45536](https://github.com/ClickHouse/ClickHouse/issues/45536) をクローズします。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* `Kafka` エンジンのシャットダウン速度を改善しました（複数の `Kafka` テーブルがある場合に発生していた余分な 3 秒の遅延を解消）。 [#80796](https://github.com/ClickHouse/ClickHouse/pull/80796) ([Azat Khuzhin](https://github.com/azat)).
* 非同期インサート：メモリ使用量を削減し、INSERT クエリのパフォーマンスを向上。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* ログテーブルが無効な場合はプロセッサをプロファイルしないようにしました。 [#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。これにより、非常に短いクエリの実行が高速になります。
* ソースが要求どおりの内容である場合の `toFixedString` の処理を高速化。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* ユーザーに制限がない場合は、クォータ値を処理しないようにしました。 [#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。これにより、非常に短いクエリの実行が高速化されます。
* メモリトラッキングにおけるパフォーマンスのリグレッションを修正しました。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおけるシャーディングキーの最適化を向上。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* Parallel replicas: すべての読み取りタスクが他のレプリカに割り当て済みの場合、未使用の遅いレプリカを待機しないようにしました。 [#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* Parallel replicas は個別の接続タイムアウトを使用します。`parallel_replicas_connect_timeout_ms` 設定を参照してください。以前は、parallel replicas クエリの接続タイムアウト値として `connect_timeout_with_failover_ms` / `connect_timeout_with_failover_secure_ms` 設定が使用されていました（デフォルトは 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* ジャーナル付きファイルシステムでは、`mkdir` はディスクに永続化されるファイルシステムジャーナルに書き込まれます。ディスクが遅い場合、これには長い時間がかかることがあります。これを `reserve` ロックのスコープの外に移動しました。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Iceberg のマニフェストファイルの読み取りを、最初の読み取りクエリまで延期しました。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* `GLOBAL [NOT] IN` 述語を、適用可能な場合に `PREWHERE` 句へ移動できるようにしました。 [#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa)).





#### 改善

* `EXPLAIN SYNTAX` は新しいアナライザーを使用するようになりました。クエリツリーから構築された AST を返します。クエリツリーを AST に変換する前に実行するパスの回数を制御するためのオプション `query_tree_passes` を追加しました。 [#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Native フォーマットにおいて Dynamic と JSON 向けのフラット化シリアライゼーションを実装し、Dynamic の shared variant や JSON の shared data のような特別な構造を使用せずに Dynamic および JSON データをシリアライズ／デシリアライズできるようにしました。このシリアライゼーションは、`output_format_native_use_flattened_dynamic_and_json_serialization` を設定することで有効にできます。このシリアライゼーション方式は、さまざまな言語で実装されたクライアントにおける TCP プロトコルでの Dynamic および JSON のサポートを容易にするために利用できます。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499)（[Pavel Kruglov](https://github.com/Avogar)）。
* エラー `AuthenticationRequired` 発生後に `S3` クレデンシャルを更新するようにしました。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.asynchronous_metrics` に辞書メトリクスを追加しました。- `DictionaryMaxUpdateDelay` - 辞書更新の最大遅延（秒）。- `DictionaryTotalFailedUpdates` - すべての辞書で、最後に正常にロードされてから発生したエラー数。 [#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse)).
* 破損したテーブルを保存するために作成された可能性のあるデータベースについての警告を追加しました。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `S3Queue` エンジンと `AzureQueue` エンジンに `_time` 仮想カラムを追加しました。 [#78926](https://github.com/ClickHouse/ClickHouse/pull/78926) ([Anton Ivashkin](https://github.com/ianton-ru))。
* CPU 過負荷時の接続ドロップを制御する設定をホットリロード可能にしました。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* Azure Blob Storage 上の plain disk に対して `system.tables` で報告されるデータパスにコンテナプレフィックスを追加し、S3 および GCP での報告と一貫性を持たせました。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* 現在、clickhouse-client と local は、`param_<name>`（アンダースコア）に加えて `param-<name>`（ハイフン）形式のクエリパラメータも受け付けるようになりました。これにより [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093) がクローズされました。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* チェックサム有効時にローカルからリモート S3 へデータをコピーする際の帯域幅ディスカウントに関する詳細な警告メッセージ。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu)).
* 以前は、`input_format_parquet_max_block_size = 0`（無効な値）の場合に ClickHouse がハングしていましたが、この問題は修正されました。これにより [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394) がクローズされました。 [#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* `startup_scripts` に `throw_on_error` 設定を追加しました。`throw_on_error` が true の場合、すべてのクエリが正常に完了しない限りサーバーは起動しません。デフォルトでは `throw_on_error` は false で、これまでの挙動が維持されます。 [#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* あらゆる種類の `http_handlers` で `http_response_headers` を追加できるようになりました。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 関数 `reverse` が `Tuple` データ型をサポートするようになりました。 [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053) をクローズしました。 [#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817) を解決: `system.zookeeper` テーブルから `auxiliary_zookeepers` のデータを取得できるようにしました。 [#80146](https://github.com/ClickHouse/ClickHouse/pull/80146) ([Nikolay Govorov](https://github.com/mrdimidium))。
* サーバーの TCP ソケットに関する非同期メトリクスを追加しました。これによりオブザーバビリティが向上します。[#80187](https://github.com/ClickHouse/ClickHouse/issues/80187) をクローズしました。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SimpleAggregateFunction` として `anyLast_respect_nulls` および `any_respect_nulls` をサポートしました。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein)).
* レプリケーテッドデータベースに対する不要な `adjustCreateQueryForBackup` 呼び出しを削除しました。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-local` で、`-- --config.value='abc'` のように `--` の後に続く追加オプションを、等号なしでも指定できるようにしました。 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292) をクローズ。 [#80293](https://github.com/ClickHouse/ClickHouse/pull/80293) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `SHOW ... LIKE` クエリ内のメタ文字をハイライトするようにしました。これにより [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) がクローズされました。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-local` で SQL UDF を永続化できるようにしました。以前に作成された関数は起動時に読み込まれます。これにより [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085) がクローズされました。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `preliminary DISTINCT` ステップに対する `EXPLAIN PLAN` の説明を修正。 [#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus)).
* ODBC/JDBC で named collections を使用できるようになりました。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 読み取り専用ディスクおよび破損ディスクの数に関するメトリクス。`DiskLocalCheckThread` の開始時にログへ記録される指標。 [#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu))。
* `s3_plain_rewritable` ストレージでのプロジェクション対応を実装しました。以前のバージョンでは、プロジェクションを参照する S3 内のメタデータオブジェクトは、移動しても更新されませんでした。[#70258](https://github.com/ClickHouse/ClickHouse/issues/70258) をクローズ。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` コマンドは、readonly ディスクおよび write-once ディスク上のパーツを検索しようとしなくなりました。これにより [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430) がクローズされました。[#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* マージ済みパーツに関するメッセージのログレベルを下げました。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* Iceberg テーブルに対するパーティションプルーニングのデフォルト動作を変更。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* インデックス検索アルゴリズムの可観測性向上のため、2 つの新しい `ProfileEvents` を追加しました: `IndexBinarySearchAlgorithm` および `IndexGenericExclusionSearchAlgorithm`。 [#80679](https://github.com/ClickHouse/ClickHouse/pull/80679)（[Pablo Marcos](https://github.com/pamarcos)）。
* 古いカーネルで `MADV_POPULATE_WRITE` がサポートされていない場合でも、そのことについてログに文句を出力しないようにした（ログがノイズで汚れないようにするため）。 [#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* `TTL` 式で `Date32` と `DateTime64` がサポートされるようになりました。[#80710](https://github.com/ClickHouse/ClickHouse/pull/80710)（[Andrey Zvonov](https://github.com/zvonand)）。
* `max_merge_delayed_streams_for_parallel_write` の互換性に関する値を調整しました。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* クラッシュを修正: デストラクタ内で一時ファイル（ディスク上に一時データをスピルするために使用されます）を削除しようとした際に例外がスローされると、プログラムが異常終了してしまう可能性がありました。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `SYSTEM SYNC REPLICA` に `IF EXISTS` 修飾子を追加しました。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* &quot;Having zero bytes, but read range is not finished...&quot; という例外メッセージを拡張し、`system.filesystem_cache` に finished&#95;download&#95;time カラムを追加。 [#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii))。
* インデックスを使用して `EXPLAIN` を実行する際、検索アルゴリズムのセクションを出力に追加します（`indexes = 1` の場合）。&quot;binary search&quot; または &quot;generic exclusion search&quot; のいずれかが表示されます。 [#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos))。
* 2024年初め、新しい analyzer がデフォルトで有効になっていなかったため、MySQL handler では `prefer_column_name_to_alias` が true にハードコードされていました。現在は、この制約が取り除かれました。 [#80916](https://github.com/ClickHouse/ClickHouse/pull/80916) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 現在、`system.iceberg_history` は glue や iceberg rest などのカタログデータベースの履歴も表示します。また、一貫性を保つために、`system.iceberg_history` の `table_name` および `database_name` カラムを、それぞれ `table` および `database` にリネームしました。[#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin))。
* `merge` テーブル関数で読み取り専用モードを許可し、それを使用する際に `CREATE TEMPORARY TABLE` 権限が不要になるようにしました。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* インメモリキャッシュのイントロスペクションを改善しました（不完全な `system.asynchronouse_metrics` ではなく、`system.metrics` でキャッシュに関する情報を公開）。インメモリキャッシュのサイズ（バイト数）を `dashboard.html` に追加しました。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` は `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes` にリネームされました。[#81023](https://github.com/ClickHouse/ClickHouse/pull/81023)（[Azat Khuzhin](https://github.com/azat)）。
* `system.rocksdb` から読み取る際、`RocksDB` テーブルを保持できないエンジンを持つデータベースは無視されます。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-local` の設定ファイルで `filesystem_caches` と `named_collections` を利用可能にしました。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `INSERT` クエリ内の `PARTITION BY` のハイライトを修正しました。以前のバージョンでは、`PARTITION BY` がキーワードとしてハイライトされていませんでした。 [#81106](https://github.com/ClickHouse/ClickHouse/pull/81106) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* Web UI に 2 つの小さな改善を行いました。- `CREATE` や `INSERT` のような出力を持たないクエリを正しく処理するようにしました（つい最近まで、これらのクエリではスピナーが無限に回転し続けていました）。- テーブルをダブルクリックした際に、先頭までスクロールするようにしました。 [#81131](https://github.com/ClickHouse/ClickHouse/pull/81131) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `MemoryResidentWithoutPageCache` メトリックは、ユーザースペースのページキャッシュを除いた、サーバープロセスが使用している物理メモリ量をバイト単位で示します。これにより、ユーザースペースのページキャッシュが利用されている場合でも、実際のメモリ使用量をより正確に把握できます。ユーザースペースのページキャッシュが無効化されている場合、この値は `MemoryResident` と同じになります。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* クライアント、ローカルサーバー、Keeper クライアント、および Disks アプリで手動でログされた例外を「ログ済み」としてマークし、二重に記録されないようにしました。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` と `use_skip_indexes_if_final_exact_mode` の設定のデフォルト値が `True` になりました。`FINAL` 句を含むクエリは、（該当する場合）スキップインデックスを使用してグラニュールの候補を絞り込み、さらに一致する主キー範囲に対応する追加のグラニュールも読み取るようになりました。従来の近似的／不正確な結果という動作を必要とするユーザーは、十分に評価したうえで `use_skip_indexes_if_final_exact_mode` を FALSE に設定できます。 [#81331](https://github.com/ClickHouse/ClickHouse/pull/81331) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Web UI で複数のクエリがある場合、カーソル下にあるクエリが実行されるようになりました。[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) の継続です。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* このPRでは、変換関数に対する単調性チェックにおける `is_strict` の実装上の問題に対処します。現在、一部の変換関数（`toFloat64(UInt32)` や `toDate(UInt8)` など）が、本来は true を返すべき場面で誤って `is_strict` を false として返しています。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359)（[zoomxi](https://github.com/zoomxi)）。
* `KeyCondition` が連続した範囲にマッチするかを判定する際、キーが非厳密な関数チェーンでラップされている場合には、`Constraint::POINT` を `Constraint::RANGE` に変換する必要が生じることがあります。例えば、`toDate(event_time) = '2025-06-03'` は、`event_time` に対して次の範囲を意味します: [&#39;2025-06-03 00:00:00&#39;, &#39;2025-06-04 00:00:00&#39;)。この PR により、この挙動が修正されました。[#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* `--host` または `--port` が指定されている場合、`clickhouse`/`ch` エイリアスは `clickhouse-local` ではなく `clickhouse-client` を起動します。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) の続きです。[#65252](https://github.com/ClickHouse/ClickHouse/issues/65252) をクローズします。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* keeper の応答時間分布データが取得できたので、メトリクス用のヒストグラムバケットを調整できるようになりました。 [#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* プロファイルイベント `PageCacheReadBytes` を追加。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュで発生していた「Having zero bytes but range is not finished」という論理エラーを修正しました。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii))。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `SELECT EXCEPT` クエリを使用するパラメータ化ビューを修正しました。 [#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) をクローズ。 [#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer: `JOIN` におけるカラム型の昇格後に、カラムの投影名を修正。 [#63345](https://github.com/ClickHouse/ClickHouse/issues/63345) をクローズ。 [#63519](https://github.com/ClickHouse/ClickHouse/pull/63519) ([Dmitry Novik](https://github.com/novikd))。
* analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier が有効な場合に、カラム名の競合が発生するケースで起きていた論理エラーを修正しました。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `allow_push_predicate_ast_for_distributed_subqueries` が有効な場合の、プッシュダウンされた述語における CTE の使用方法を修正。 [#75647](https://github.com/ClickHouse/ClickHouse/issues/75647) を修正。 [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672) を修正。 [#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* `SYSTEM SYNC REPLICA LIGHTWEIGHT &#39;foo&#39;` が、指定したレプリカが存在しない場合でも成功したと報告してしまう問題を修正しました。現在、このコマンドは同期を試みる前に、Keeper 内にそのレプリカが存在するかを正しく検証するようになりました。 [#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd)).
* `ON CLUSTER` クエリの `CONSTRAINT` セクションで `currentDatabase` 関数が使用されたごく特定の状況で発生していたクラッシュを修正しました。[#78100](https://github.com/ClickHouse/ClickHouse/issues/78100) をクローズ。[#79070](https://github.com/ClickHouse/ClickHouse/pull/79070) ([pufit](https://github.com/pufit))。
* サーバー間クエリでの外部ロールの引き渡しを修正。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* SingleValueDataGeneric では Field の代わりに IColumn を使用するようにしてください。これにより、`Dynamic/Variant/JSON` 型に対する `argMax` など一部の集約関数で発生していた誤った返り値が修正されます。 [#79166](https://github.com/ClickHouse/ClickHouse/pull/79166)（[Pavel Kruglov](https://github.com/Avogar)）。
* Azure Blob Storage 向けの `use_native_copy` および `allow_azure_native_copy` 設定の適用方法を修正し、クレデンシャルが一致する場合にのみネイティブコピーを使用するよう更新して、[#78964](https://github.com/ClickHouse/ClickHouse/issues/78964) を解決しました。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* この列が相関しているかどうかをチェックする際に発生していた、「列の元となるスコープが不明」であることに起因する論理エラーを修正。[#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) を修正。[#79451](https://github.com/ClickHouse/ClickHouse/issues/79451) を修正。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* ColumnConst および Analyzer を使用した grouping sets で誤った結果が返される問題を修正しました。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* ローカルレプリカが古くなっている状態で分散テーブルを読み取る際に、ローカルシャードの結果が重複してしまう問題を修正。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 負の符号ビットを持つ NaN の並び順を修正しました。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `GROUP BY ALL` が `GROUPING` 句を考慮しなくなりました。 [#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 容量が使い切られていない場合でも過大な誤差を生じさせていた、`TopK` / `TopKWeighted` 関数の誤った状態マージを修正しました。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* `azure_blob_storage` オブジェクトストレージで `readonly` 設定が反映されるようにしました。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* バックスラッシュでエスケープされた文字を含む `match(column, '^…')` を使用した際に発生していた、誤ったクエリ結果およびメモリ不足クラッシュを修正しました。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* データレイクに対する Hive パーティショニングの無効化。 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937) を部分的に解決します。 [#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* ラムダ式を含む skip index が適用されない問題を修正しました。インデックス定義内の高レベル関数がクエリ内のものと完全に一致する場合に、正しく適用されるようになりました。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `ATTACH_PART` コマンドをレプリケーションログから実行しているレプリカで、パーツをアタッチする際のメタデータバージョンを修正しました。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* Executable User Defined Functions (eUDF) の名前は、他の関数とは異なり、`system.query_log` テーブルの `used_functions` 列に追加されません。この PR では、リクエストで eUDF が使用された場合に、その eUDF 名を追加するようにしました。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush)).
* LowCardinality(FixedString) を使用した Arrow フォーマットにおける論理エラーを修正。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar)).
* Merge エンジンからのサブカラムの読み取りを修正。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* `KeyCondition` における数値型の比較に関するバグを修正。 [#80207](https://github.com/ClickHouse/ClickHouse/pull/80207) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 遅延マテリアライゼーションがプロジェクションを持つテーブルに適用された場合に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 暗黙的プロジェクションを使用している場合に、LIKE &#39;ab&#95;c%&#39; のような文字列プレフィックスフィルターに対する `count` の誤った最適化を修正しました。これにより [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250) が解決されます。 [#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* MongoDB ドキュメント内でネストされた数値フィールドが文字列として不適切にシリアル化される問題を修正しました。MongoDB のドキュメントに対する最大深さの制限を削除しました。 [#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* Replicated データベース内の RMT に対するメタデータチェックをより緩和しました。 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296) をクローズ。 [#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* PostgreSQL ストレージ用の `DateTime` および `DateTime64` のテキスト表現を修正。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `StripeLog` テーブルでタイムゾーン付きの `DateTime` を許可。これにより [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120) がクローズされます。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリプランのステップによって行数が変化する場合、非決定的関数を含む述語に対するフィルタープッシュダウンを無効化します。 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273) を修正。 [#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* サブカラムを含むプロジェクションで発生しうる論理エラーおよびクラッシュを修正しました。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* `ON` 式が自明な等価条件でない場合に、論理 JOIN sep のフィルター・プッシュダウン最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正。[#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) を修正。[#77848](https://github.com/ClickHouse/ClickHouse/issues/77848) を修正。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* パーティション分割されたテーブルで、キーを逆順で読み取る際に誤った結果が返される問題を修正しました。これにより [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987) が解決されます。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* nullable なキーを持つテーブルで `optimize_read_in_order` が有効な場合に発生していた誤ったソートを修正しました。 [#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `SYSTEM STOP REPLICATED VIEW` を使用してビューを一時停止した場合に、refreshable materialized view の `DROP` がハングしてしまう問題を修正しました。 [#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおける定数タプルで発生する「Cannot find column」エラーを修正。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `join_use_nulls` を使用する Distributed テーブルでの `shardNum` 関数の不具合を修正。 [#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Merge エンジンで、テーブルの一部にしか存在しないカラムを読み取る際に誤った結果が返される問題を修正。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* replxx のハングに起因する可能性のある SSH プロトコルの問題を修正しました。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` テーブル内の timestamp は、これで正しい値になっているはずです。[#80711](https://github.com/ClickHouse/ClickHouse/pull/80711)（[Melvyn Peignon](https://github.com/melvynator)）。
* 辞書の登録に失敗した場合に発生し得るクラッシュを修正（`CREATE DICTIONARY` が `CANNOT_SCHEDULE_TASK` で失敗した場合、辞書レジストリ内にダングリングポインタが残り、その後クラッシュにつながる可能性があった）。 [#80714](https://github.com/ClickHouse/ClickHouse/pull/80714) ([Azat Khuzhin](https://github.com/azat)).
* オブジェクトストレージテーブル関数における、要素が1つだけの enum グロブの処理を修正。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Tuple(Dynamic) と String の比較関数で誤った結果型が返される問題を修正し、それにより発生していた論理エラーを解消しました。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* Unity Catalog に対する不足していたサポート対象データ型 `timestamp_ntz` を追加。[#79535](https://github.com/ClickHouse/ClickHouse/issues/79535) と [#79875](https://github.com/ClickHouse/ClickHouse/issues/79875) を修正。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740) ([alesapin](https://github.com/alesapin))。
* `IN cte` を含む分散クエリで発生する `THERE_IS_NO_COLUMN` エラーを修正します。 [#75032](https://github.com/ClickHouse/ClickHouse/issues/75032) を修正。 [#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `external ORDER BY` においてファイル数が過剰になる問題（それに伴うメモリ使用量の過大な増加）を修正。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* このPRは [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742) をクローズする可能性があります。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* Kafka において、get&#95;member&#95;id() が NULL から std::string を生成していたことが原因のクラッシュを修正しました（これはブローカーへの接続が失敗した場合にのみ発生していた可能性があります）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* Kafka エンジンをシャットダウンする前にコンシューマを正しく待機するようにしました（シャットダウン後にコンシューマがアクティブなままだと、さまざまなデバッグアサーションがトリガーされる可能性があるほか、テーブルが drop/detach された後もバックグラウンドでブローカーからデータを読み続けてしまう場合があります）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat)).
* `predicate-push-down` 最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正します。[#80443](https://github.com/ClickHouse/ClickHouse/issues/80443) を解決します。 [#80834](https://github.com/ClickHouse/ClickHouse/pull/80834) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* `USING` を伴う `JOIN` 内で、テーブル関数におけるアスタリスク（`*`）マッチャーの解決処理に存在した論理エラーを修正。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Iceberg メタデータファイルキャッシュのメモリ管理を修正しました。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* Nullable なパーティションキーによる誤ったパーティショニングを修正します。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 分散クエリに対する述語プッシュダウン（`allow_push_predicate_ast_for_distributed_subqueries=1`）時に、ソーステーブルがイニシエータ上に存在しない場合に発生していた `Table does not exist` エラーを修正。[#77281](https://github.com/ClickHouse/ClickHouse/issues/77281) を修正。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 名前付きウィンドウを使用したネストされた関数内の論理エラーを修正。 [#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* Nullable 列および浮動小数点列に対する extremes の処理を修正。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* system.tables へのクエリ実行時に発生しうるクラッシュを修正（メモリ圧迫時に発生する可能性が高い）。 [#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat)).
* ファイル拡張子から圧縮方式が推定されるファイルに対する、`TRUNCATE` を伴うアトミックな `RENAME` を修正しました。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* ErrorCodes::getName を修正しました。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* Unity Catalog で、すべてのテーブルに対する権限がない場合にユーザーがテーブルを一覧表示できないバグを修正しました。現在は、すべてのテーブルが正しく一覧表示され、制限されたテーブルを読み取ろうとすると例外がスローされます。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin))。
* `SHOW TABLES` クエリにおいて、ClickHouse はデータレイクカタログからのエラーや予期しないレスポンスを無視するようになりました。[#79725](https://github.com/ClickHouse/ClickHouse/issues/79725) を修正。[#81046](https://github.com/ClickHouse/ClickHouse/pull/81046) ([alesapin](https://github.com/alesapin))。
* `JSONExtract` および JSON 型のパースで、整数値からの `DateTime64` のパース処理を修正しました。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* schema inference cache に `date_time_input_format` 設定を反映するようにしました。 [#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* `INSERT` の実行開始後、カラムが送信される前にテーブルが `DROP` された場合に発生していたクラッシュを修正しました。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* quantileDeterministic における初期化されていない値の使用を修正。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat))。
* metadatastoragefromdisk ディスクトランザクションにおけるハードリンク数の管理を修正し、テストを追加。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* 他の関数とは異なり、User Defined Functions (UDF) の名前は `system.query_log` テーブルには追加されません。このPRでは、リクエスト内で UDF が使用された場合、その UDF 名を2つのカラム `used_executable_user_defined_functions` または `used_sql_user_defined_functions` のいずれかに追加するようにしました。 [#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush))。
* HTTP プロトコル経由でのテキストフォーマット（`JSON`、`Values` など）による挿入時に、`Enum` フィールドを省略した場合に発生する可能性があった `Too large size ... passed to allocator` エラーやクラッシュを修正しました。 [#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* スパースカラムを含む INSERT ブロックが非 MT のマテリアライズドビューにプッシュされた場合に発生する `LOGICAL_ERROR` を修正。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* クロスレプリケーション環境で `distributed_product_mode_local=local` を使用した際に発生する `Unknown table expression identifier` エラーを修正しました。 [#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* フィルタ適用後に Parquet ファイルの行数を誤ってキャッシュしていた問題を修正。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 相対キャッシュパスを使用している場合の `fs cache max_size_to_total_space` 設定を修正。 [#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Parquet 形式で `const` な tuple または map を出力する際に `clickhouse-local` がクラッシュする問題を修正しました。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* ネットワーク経由で受信した配列オフセットを検証する。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 空のテーブルを結合し、ウィンドウ関数を使用するクエリにおけるいくつかのコーナーケースを修正しました。このバグにより並列ストリーム数が爆発的に増加し、その結果 OOM が発生していました。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* datalake クラスター関数（`deltaLakeCluster`、`icebergCluster` など）の修正: (1) 旧アナライザーとともに `Cluster` 関数を使用した際に `DataLakeConfiguration` で発生しうるセグメンテーションフォルトを修正；(2) 重複していた data lake メタデータ更新（不要なオブジェクトストレージへのリクエスト）を削除；(3) フォーマットが明示的に指定されていない場合の、オブジェクトストレージでの冗長な listing を修正（これはすでに非クラスターの data lake エンジンでは対応済みだった）。 [#81300](https://github.com/ClickHouse/ClickHouse/pull/81300) ([Kseniia Sumarokova](https://github.com/kssenii))。
* force&#95;restore&#95;data フラグで失われた Keeper のメタデータを復旧できるようにしました。 [#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* delta-kernel における region エラーを修正しました。 [#79914](https://github.com/ClickHouse/ClickHouse/issues/79914) を修正。 [#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* divideOrNull に対する誤った JIT を無効化。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano))。
* MergeTree テーブルのパーティション列名が長い場合に発生していた `INSERT` エラーを修正。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) にバックポート済み: マージ中に例外が発生した場合に `Aggregator` がクラッシュし得る問題を修正。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat))。
* 複数の manifest ファイルの内容をメモリに格納しないようにしました。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik)).
* バックグラウンドプールのシャットダウン時に発生する可能性のあるクラッシュを修正しました（`background_.*pool_size`）。 [#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* `URL` エンジンを使用してテーブルに書き込む際に発生していた `Npy` フォーマットでの範囲外読み取りを修正しました。これにより [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356) がクローズされました。 [#81502](https://github.com/ClickHouse/ClickHouse/pull/81502) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI に `NaN%` が表示される可能性があります（典型的な JavaScript の問題）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_enforce_synchronous_settings=1` の場合の `DatabaseReplicated` を修正しました。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* LowCardinality(Nullable(...)) 型のソート順序を修正しました。 [#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* リクエストがソケットから完全に読み取られていない場合、サーバーが HTTP 接続を維持しないようにしました。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* スカラーな相関サブクエリが射影式の `Nullable` な結果を返すようにしました。相関サブクエリが空の結果セットを返す場合の挙動を修正しました。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* `ReplicatedMergeTree` への `ATTACH` 実行時に発生する `Unexpected relative path for a deduplicated part` エラーを修正しました。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* クエリ設定 `use_iceberg_partition_pruning` は、クエリコンテキストではなくグローバルコンテキストを使用しているため、Iceberg ストレージには反映されません。デフォルト値が true であるため重大な問題にはなりませんが、この PR で修正されます。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991)).
* [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) でバックポート済み: TTL 式で `dict` が使用されている場合のマージ中に発生する &quot;Context has expired&quot; エラーを修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* MergeTree 設定 `merge_max_block_size` が 0 にならないように検証を追加。 [#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc)).
* `clickhouse-local` で `DROP VIEW ` クエリがハングする問題を修正しました。 [#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc)).
* 一部のケースにおける StorageRedis の `JOIN` を修正。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `ConcurrentHashJoin` において、空の `USING ()` で旧アナライザーが有効な場合に発生するクラッシュを修正しました。 [#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat))。
* Keeper の修正: ログに不正なエントリが存在する場合は、新しいログのコミットをブロックするようにしました。以前は、リーダーが一部のログを誤って適用しても、フォロワーがダイジェストの不一致を検出して処理を中止するにもかかわらず、新しいログをコミットし続けていました。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* スカラー相関サブクエリの処理中に必要なカラムが読み込まれない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 誰かが私たちのコードに Kusto を散りばめていました。きれいに整理しました。これにより [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643) がクローズされます。 [#81885](https://github.com/ClickHouse/ClickHouse/pull/81885) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して過剰なコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) が解決されました。 [#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* これまで、`MongoDB` テーブルエンジンの定義では、`host:port` 引数にパス要素を含めることができましたが、これは暗黙的に無視されていました。MongoDB 統合では、そのようなテーブルの読み込みは拒否されていました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルの読み込みを許可し、パス要素を無視して*、引数からデータベース名を使用するようにしました。*注:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を用いたクエリ、ならびに辞書ソースおよび名前付きコレクションには適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。[#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* `arraySimilarity` のコピーペーストによる誤りを修正し、`UInt32` および `Int32` の重みの使用を禁止しました。テストとドキュメントを更新しました。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* サジェストスレッドとメインクライアントスレッド間で発生し得るデータレースを修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### ビルド/テスト/パッケージングの改善

* `postgres` 16.9 を使用。 [#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `openssl` 3.2.4 を使用。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `abseil-cpp` 2025-01-27 を使用。 [#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `mongo-c-driver` 1.30.4 を使用するように変更。[#81449](https://github.com/ClickHouse/ClickHouse/pull/81449)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `krb5` 1.21.3-final を使用。 [#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `orc` 2.1.2 を使用します。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `grpc` 1.73.0 を使用します。 [#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `delta-kernel-rs` v0.12.1 を利用。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `c-ares` を `v1.34.5` に更新します。 [#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* CVE-2025-5025 および CVE-2025-4947 に対処するため、`curl` を 8.14 にアップグレードしました。 [#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit)).
* `libarchive` を 3.7.9 にアップグレードし、次の脆弱性に対応しました: CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。 [#81174](https://github.com/ClickHouse/ClickHouse/pull/81174) ([larryluogit](https://github.com/larryluogit))。
* `libxml2` を 2.14.3 にアップグレード。 [#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit)).
* ベンダリングされた Rust のソースを `CARGO_HOME` にコピーしないようにしました。 [#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Sentry ライブラリへの依存を排除し、独自のエンドポイントに置き換えました。 [#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dependabot アラートに対応するため、CI イメージ内の Python 依存関係を更新しました。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano))。
* 起動時に Keeper からレプリケートされた DDL の停止フラグを再読み込みすることで、Keeper に対してフォールトインジェクションが有効な場合でもテストがより堅牢になるようにしました。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger)).
* Ubuntu アーカイブの URL に https を使用。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* テストイメージ内の Python 依存関係を更新。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot))。
* Nix ビルド用に `flake.nix` を導入しました。 [#81463](https://github.com/ClickHouse/ClickHouse/pull/81463) ([Konstantin Bogdanov](https://github.com/thevar1able))
* ビルド時にネットワークアクセスを必要としていた `delta-kernel-rs` を修正しました。[#80609](https://github.com/ClickHouse/ClickHouse/issues/80609) をクローズ。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。記事 [A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust) もあわせてご覧ください。

### ClickHouse リリース 25.5, 2025-05-22 {#255}

#### 後方互換性のない変更

- 関数 `geoToH3` は、入力を (lat, lon, res) の順序で受け付けるようになりました(他の幾何関数と同様です)。以前の結果順序 (lon, lat, res) を維持したい場合は、設定 `geotoh3_argument_order = 'lon_lat'` を指定できます。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008))。
- ファイルシステムキャッシュの動的リサイズを許可するファイルシステムキャッシュ設定 `allow_dynamic_cache_resize` を追加しました(デフォルトは `false`)。理由: 特定の環境(ClickHouse Cloud)では、すべてのスケーリングイベントがプロセスの再起動を通じて発生するため、動作をより細かく制御し、安全対策として、この機能を明示的に無効にする必要があります。この PR は後方互換性がないとマークされています。古いバージョンでは動的キャッシュリサイズが特別な設定なしでデフォルトで動作していたためです。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii))。
- レガシーインデックスタイプ `annoy` および `usearch` のサポートを削除しました。両方とも長い間スタブとなっており、レガシーインデックスを使用しようとするとエラーが返されていました。まだ `annoy` および `usearch` インデックスが存在する場合は、削除してください。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze))。
- サーバー設定 `format_alter_commands_with_parentheses` を削除しました。この設定は 24.2 で導入され、デフォルトで無効になっていました。25.2 でデフォルトで有効になりました。新しい形式をサポートしない LTS バージョンが存在しないため、この設定を削除できます。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- `DeltaLake` ストレージの `delta-kernel-rs` 実装をデフォルトで有効にしました。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `URL` からの読み取りに複数のリダイレクトが含まれる場合、設定 `enable_url_encoding` がチェーン内のすべてのリダイレクトに正しく適用されます。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer))。設定 `enble_url_encoding` のデフォルト値が `false` に設定されました。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer))。


#### 新機能

* WHERE 句でのスカラ相関サブクエリをサポート。[#6697](https://github.com/ClickHouse/ClickHouse/issues/6697) をクローズ。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600) ([Dmitry Novik](https://github.com/novikd))。単純なケースにおける射影リスト内での相関サブクエリをサポート。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925) ([Dmitry Novik](https://github.com/novikd))。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078) ([Dmitry Novik](https://github.com/novikd))。これにより、TPC-H テストスイートを 100% カバーするようになりました。
* ベクトル類似性インデックスを用いたベクトル検索が、（これまでの experimental から）beta になりました。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164)（[Robert Schulze](https://github.com/rschu1ze)）。
* `Parquet` 形式で geo 型をサポートしました。これにより [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) がクローズされました。 [#79777](https://github.com/ClickHouse/ClickHouse/pull/79777) ([scanhex12](https://github.com/scanhex12))。
* 新しい関数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8` を追加しました。「sparse-ngrams」と呼ばれる、インデックス作成と検索のために部分文字列を抽出する堅牢なアルゴリズムを計算します。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12))。
* `clickhouse-local`（およびその短縮エイリアスである `ch`）は、処理対象の入力データがある場合に、`FROM table` が暗黙的に付与されるようになりました。これにより [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023) が解決されました。また、通常のファイルを処理する際に `--input-format` が指定されていない場合は、clickhouse-local でフォーマット推論が有効になるようになりました。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `stringBytesUniq` 関数と `stringBytesEntropy` 関数を追加し、ランダムまたは暗号化されている可能性のあるデータを検索できるようにしました。 [#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* base32 のエンコードおよびデコード用関数を追加しました。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x)).
* `getServerSetting` 関数と `getMergeTreeSetting` 関数を追加。#78318 をクローズ。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439) ([NamNguyenHoai](https://github.com/NamHoaiNguyen)).
* `version-hint.text` ファイルを活用するための新しい設定 `iceberg_enable_version_hint` を追加しました。 [#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche)).
* `LIKE` キーワードによるフィルタリングを用いて、データベース内の特定のテーブルをトランケートできるようにします。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `MergeTree` ファミリーのテーブルで `_part_starting_offset` 仮想カラムをサポートしました。このカラムは、現在のパート一覧に基づきクエリ時に計算される、先行するすべてのパートの累積行数を表します。累積値はクエリ実行全体を通して保持され、パートのプルーニング後もそのまま有効です。この挙動をサポートするため、関連する内部ロジックがリファクタリングされました。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird)).
* 右側の引数がゼロのときに NULL を返す関数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull` を追加します。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse ベクトル検索が、事前フィルタリングと事後フィルタリングの両方をサポートし、より細かな制御のための関連設定も提供するようになりました。(issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)). [#79854](https://github.com/ClickHouse/ClickHouse/pull/79854) ([Shankar Iyer](https://github.com/shankar-iyer)).
* [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) と [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 関数を追加しました。[`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) でパーティション分割された `Iceberg` テーブルにおけるデータファイルの削除候補絞り込み（プルーニング）をサポートしました。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。



#### 実験的機能
* 新しい `Time` / `Time64` データ型を追加しました。`Time` (HHH:MM:SS) と `Time64` (HHH:MM:SS.`&lt;fractional&gt;`) に加えて、他のデータ型と相互にやり取りするためのいくつかの基本的なキャスト関数および関数を追加しています。また、既存の関数名 `toTime` を `toTimeWithFixedDate` に変更しました。キャスト関数に `toTime` が必要となるためです。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
72459).
* Iceberg データレイク向けの Hive metastore カタログ。 [#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* `full_text` 型のインデックスは `gin` に名称変更されました。これは PostgreSQL およびその他のデータベースでより一般的な用語に従ったものです。既存の `full_text` 型インデックスは引き続き読み込めますが、検索で使用しようとすると例外をスローし、その際に代わりに `gin` インデックスを提案します。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### パフォーマンスの向上

* 個々のサブカラムを読み取れるようにするため、各サブストリームに対してマークを保存するよう Compact パーツのフォーマットを変更しました。旧 Compact フォーマットは読み取りでは引き続きサポートされており、MergeTree 設定 `write_marks_for_substreams_in_compact_parts` を使用することで書き込み時にも有効化できます。Compact パーツのストレージ形式が変わるため、より安全にアップグレードできるよう、デフォルトでは無効になっています。今後のいずれかのリリースでデフォルト有効化される予定です。 [#77940](https://github.com/ClickHouse/ClickHouse/pull/77940) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムを含む条件を `PREWHERE` に移動できるようにしました。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 複数の granule に対してまとめて式を評価することで、二次インデックスを高速化しました。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `compile_expressions`（通常の式の一部を対象とする JIT コンパイラ）をデフォルトで有効にしました。これにより [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386)、[#66486](https://github.com/ClickHouse/ClickHouse/issues/66486) がクローズされました。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい設定 `use_skip_indexes_in_final_exact_mode` が導入されました。`ReplacingMergeTree` テーブルに対するクエリで FINAL 句が指定されている場合、スキップインデックスに基づいてテーブル範囲のみを読み取ると、誤った結果が返される可能性があります。この設定を有効にすると、スキップインデックスによって返されたプライマリキー範囲と重複する新しいパーツもスキャンすることで、正しい結果が返されるようにできます。0 に設定すると無効、1 に設定すると有効です。 [#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer)).
* オブジェクトストレージクラスタテーブル関数（例：`s3Cluster`）では、キャッシュ局所性を高めるために、コンシステントハッシュに基づいてファイルを各レプリカに割り当てて読み取るようになりました。 [#77326](https://github.com/ClickHouse/ClickHouse/pull/77326) ([Andrej Hoos](https://github.com/adikus))。
* `S3Queue`/`AzureQueue` のパフォーマンスを、INSERT の実行を並列化できるようにすることで改善しました（キュー設定 `parallel_inserts=true` で有効化可能）。従来の S3Queue/AzureQueue では、パイプラインの最初の部分（ダウンロードとパース）のみ並列実行でき、INSERT は単一スレッドでした。そして `INSERT` がボトルネックになることがほとんどです。現在は `processing_threads_num` に対してほぼ線形にスケールします。 [#77671](https://github.com/ClickHouse/ClickHouse/pull/77671) ([Azat Khuzhin](https://github.com/azat))。S3Queue/AzureQueue において、より公平な `max_processed_files_before_commit` を導入しました。 [#79363](https://github.com/ClickHouse/ClickHouse/pull/79363) ([Azat Khuzhin](https://github.com/azat))。
* 右テーブルのサイズがしきい値未満の場合に `hash` アルゴリズムへフォールバックするための、`parallel_hash_join_threshold` 設定で制御可能なしきい値を導入しました。 [#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat))。
* 現在は、`parallel replicas` を有効にした読み取りでは、タスクサイズの決定にレプリカ数を用いるようになりました。これにより、読み取るデータ量がそれほど大きくない場合でも、レプリカ間での作業負荷の分散がより適切になります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* 分散集約の最終段階で `uniqExact` 状態を並列にマージできるようにしました。 [#78703](https://github.com/ClickHouse/ClickHouse/pull/78703) ([Nikita Taranov](https://github.com/nickitat))。
* キー付き集約における `uniqExact` 状態の並列マージで発生する可能性のあるパフォーマンス低下を修正しました。 [#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* Azure Storage への List Blobs API 呼び出し回数を削減。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 並列レプリカを使用する分散 `INSERT SELECT` のパフォーマンスを改善しました。 [#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* `LogSeriesLimiter` の構築のたびにクリーンアップが行われないようにし、高い同時実行シナリオでのロック競合とパフォーマンス低下を回避します。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 自明な `count` 最適化によりクエリを高速化しました。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* `Decimal` を用いる一部の演算でインライン展開を改善しました。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `input_format_parquet_bloom_filter_push_down` をデフォルトで true に設定しました。また、設定変更履歴の誤りを修正しました。 [#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* すべての行を削除するパーツに対する `ALTER ... DELETE` ミューテーションを最適化しました。これにより、そのような場合にはミューテーションを実行せず、元のパーツの代わりに空のパーツが作成されるようになりました。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 可能な場合、`Compact` パーツへの挿入時にブロックの不要なコピーを行わないようにしました。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* `input_format_max_block_size_bytes` 設定を追加し、入力フォーマットで作成されるブロックのサイズをバイト単位で制限できるようにしました。これにより、行に大きな値が含まれている場合のデータインポート時に、メモリ使用量の増大を抑制できます。 [#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar))。
* スレッドおよび async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests のガードページを削除しました。`FiberStack` の割り当て方法を `mmap` から `aligned_alloc` に変更しました。これは VMA を分割し、高負荷時に vm.max&#95;map&#95;count の上限に達する可能性があるためです。 [#79147](https://github.com/ClickHouse/ClickHouse/pull/79147) ([Sema Checherinda](https://github.com/CheSema)).
* 並列レプリカでのレイジーマテリアライゼーション。 [#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).





#### 改善

* 軽量削除をオンザフライで適用できるようにしました（設定 `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1`）。 [#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ)).
* pretty フォーマットのデータがターミナルに表示されていて、後続のブロックが同じ列幅を持つ場合、カーソルを上に移動して前のブロックと結合し、前のブロックから連続して表示できるようになりました。これにより [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333) が解決されます。この機能は新しい設定 `output_format_pretty_glue_chunks` によって制御されます。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `isIPAddressInRange` 関数を `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)`、および `Nullable(IPv6)` データ型に対応するよう拡張しました。 [#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff)).
* `PostgreSQL` エンジンの接続プーラー設定を動的に変更できるようにしました。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 通常の projection で `_part_offset` を指定できるようにしました。これは projection index を構築するための第一歩です。[#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) と併用でき、#63207 の改善に役立ちます。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429) ([Amos Bird](https://github.com/amosbird))。
* `system.named_collections` に新しいカラム（`create_query` と `source`）を追加。 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179) をクローズ。 [#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* `system.query_condition_cache` システムテーブルに新しいフィールド `condition` を追加しました。クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件式を保存します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* `BFloat16` 列に対してベクトル類似性インデックスを作成できるようになりました。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze)).
* `DateTime64` のベストエフォート解析で、小数部付きの Unix タイムスタンプをサポートしました。 [#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar)).
* ストレージ `DeltaLake` の delta-kernel 実装において、column mapping モードを修正し、スキーマ進化向けのテストを追加しました。 [#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Values` フォーマットでの `Variant` 列への `INSERT` を、値の変換ロジックの改善によって改善しました。 [#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar)).
* `tokens` 関数が拡張され、追加の「tokenizer」引数と、さらに tokenizer 固有の引数を受け取れるようになりました。 [#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `SHOW CLUSTER` ステートメントで、引数内のマクロ（存在する場合）が展開されるようになりました。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42))。
* ハッシュ関数が、配列、タプル、マップ内の `NULL` をサポートするようになりました（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) および [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* cctz を 2025a に更新しました。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano)).
* UDF のデフォルトの stderr 処理を「log&#95;last」に変更しました。使い勝手の面でより優れています。 [#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI でタブ操作を元に戻せるようにしました。これにより [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284) がクローズされます。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `recoverLostReplica` 実行時の設定削除を、[https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様の形で行いました。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* parquet インデックスのプルーニングをプロファイルするためのプロファイルイベント `ParquetReadRowGroups` と `ParquetPrunedRowGroups` を追加しました。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* クラスタ上でのデータベースに対する `ALTER` をサポート。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* QueryMetricLog の統計収集で取りこぼされた実行は明示的にスキップするようにしないと、ログが現在時刻に追いつくまで非常に長い時間がかかります。 [#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Arrow` ベースのフォーマットの読み取りに関する、いくつかの小さな最適化。 [#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc)).
* 設定 `allow_archive_path_syntax` は誤って experimental としてマークされていました。experimental な設定がデフォルトで有効にならないことを保証するテストを追加しました。 [#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ページキャッシュ設定をクエリごとに調整可能にしました。これは、高スループットかつ低レイテンシーなクエリに対して、より高速な試験ときめ細かなチューニングを行えるようにするためです。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ほとんどの 64-bit ハッシュのように見える数値については、見やすい形式で数値ヒントを表示しないようにしました。これにより [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334) がクローズされました。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 詳細ダッシュボード上のグラフの色は、対応するクエリのハッシュから計算されます。これにより、ダッシュボードをスクロールしているときにグラフを覚えておきやすくなり、見つけるのも簡単になります。 [#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 非同期メトリクス `FilesystemCacheCapacity` を追加しました。`cache` 仮想ファイルシステムの合計容量を表し、グローバルなインフラストラクチャ監視に役立ちます。 [#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts へのアクセスを最適化し、要求された場合にのみカラム/インデックスのサイズを読み取るようにしました。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* クエリ `'SHOW CLUSTER <name>'` で、すべてのフィールドではなく必要なフィールドのみを計算するようにしました。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach))。
* `DatabaseCatalog` のストレージ設定を指定できるようにしました。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` でローカルストレージをサポートしました。 [#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* クエリレベルで delta-kernel-rs を有効にするための設定 `allow_experimental_delta_kernel_rs` を追加しました。[#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Azure/S3 Blob Storage からの Blob 一覧取得時に発生しうる無限ループを修正。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* ファイルシステムキャッシュの設定 `max_size_ratio_to_total_space` を追加しました。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `clickhouse-benchmark` の `reconnect` オプションを再構成し、再接続の挙動に応じて 0、1、または N を値として受け取れるようにしました。 [#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* 異なる `plain_rewritable` ディスク上にあるテーブル間での `ALTER TABLE ... MOVE|REPLACE PARTITION` を許可。 [#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva)).
* 参照ベクトルが `Array(BFloat16)` 型の場合にも、ベクトル類似度インデックスが使用されるようになりました。 [#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer)).
* last&#95;error&#95;message、last&#95;error&#95;trace、および query&#95;id を system.error&#95;log テーブルに追加しました。関連チケット [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* デフォルトでクラッシュレポートの送信を有効にしました。これはサーバーの設定ファイルで無効化できます。 [#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `system.functions` システムテーブルに、各関数が最初に導入された ClickHouse バージョンが表示されるようになりました。 [#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze)).
* `access_control_improvements.enable_user_name_access_type` 設定を追加しました。この設定により、[https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) で導入されたユーザー/ロールに対する厳密な `GRANT` を有効または無効にできます。レプリカに 25.1 より前のバージョンが含まれるクラスタを使用している場合は、この設定をオフにすることを検討してください。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* `ASTSelectWithUnionQuery::clone()` メソッドの正しい実装で `is_normalized` フィールドも考慮されるようになりました。これにより [#77569](https://github.com/ClickHouse/ClickHouse/issues/77569) の改善に役立つ可能性があります。 [#79909](https://github.com/ClickHouse/ClickHouse/pull/79909) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `EXCEPT` 演算子を含む一部のクエリにおけるフォーマットの不整合を修正しました。`EXCEPT` 演算子の左辺が `*` で終わる場合、フォーマット後のクエリから括弧が失われ、その結果 `EXCEPT` 修飾子付きの `*` としてパースされていました。これらのクエリは fuzzer によって検出されたものであり、実際に遭遇する可能性は低いと考えられます。この変更により [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950) がクローズされました。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* バリアントのデシリアライズ順序をキャッシュすることで、`JSON` 型のパースをわずかに改善しました。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定 `s3_slow_all_threads_after_network_error` を追加しました。[#80035](https://github.com/ClickHouse/ClickHouse/pull/80035)（[Vitaly Baranov](https://github.com/vitlibar)）。
* マージ対象として選択されたパーツに関するログレベルが誤っていました（Information）。[#80061](https://github.com/ClickHouse/ClickHouse/issues/80061) をクローズします。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer: ツールチップおよびステータスメッセージに runtime/share を追加。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa)).
* trace-visualizer: ClickHouse サーバーからデータを読み込めるようにしました。 [#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa)).
* 失敗したマージに関するメトリクスを追加。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `clickhouse-benchmark` は、指定されている場合、最大反復回数に基づいた進捗率を表示します。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts テーブル用のビジュアライザーを追加。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* クエリレイテンシー解析用のツールを追加しました。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* パーツ内に存在しない列の名前変更処理を修正しました。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* `Kafka` テーブルからストリーミングされるマテリアライズドビューが、例えばその `Kafka` テーブルの作成後といった、遅すぎるタイミングで開始してしまう場合があります。 [#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn)).
* アナライザー有効時の `VIEW` 作成における `SELECT` クエリの書き換え処理を修正。[#75956](https://github.com/ClickHouse/ClickHouse/issues/75956) をクローズ。 [#76356](https://github.com/ClickHouse/ClickHouse/pull/76356)（[Dmitry Novik](https://github.com/novikd)）。
* サーバーからの `async_insert` の適用方法（`apply_settings_from_server` 経由）を修正しました（これにより、以前クライアント側で発生していた `Unknown packet 11 from server` エラーが解消されます）。[#77578](https://github.com/ClickHouse/ClickHouse/pull/77578) ([Azat Khuzhin](https://github.com/azat))。
* `Replicated` データベースで、固定リフレッシュ可能なマテリアライズドビューが新しく追加されたレプリカで動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* バックアップを壊していた refreshable マテリアライズドビューの問題を修正しました。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* `transform` における古いトリガー処理の論理エラーを修正しました。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* analyzer 使用時にセカンダリインデックスが適用されていなかったいくつかのケースを修正。 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) と [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373) を修正。 [#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* HTTP プロトコルで圧縮が有効な場合のプロファイルイベント（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）のダンプを修正（誤差がバッファサイズを超えないようにする。通常は約 1MiB）。[#78516](https://github.com/ClickHouse/ClickHouse/pull/78516)（[Azat Khuzhin](https://github.com/azat)）。
* `JOIN ... USING` に `ALIAS` 列が含まれる場合に `LOGICAL_ERROR` を発生させていた analyzer を修正し、代わりに適切なエラーを出力するようにしました。 [#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* アナライザーを修正：`SELECT` に位置引数が含まれている場合に `CREATE VIEW ... ON CLUSTER` が失敗する問題を修正。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `SELECT` にスカラサブクエリが含まれている場合に、スキーマ推論を行うテーブル関数への `INSERT SELECT` 実行時に発生していた `Block structure mismatch` エラーを修正。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* analyzer を修正: Distributed テーブルに対して `prefer_global_in_and_join=1` の場合、SELECT クエリにおける `in` 関数は `globalIn` に置き換えられる必要があります。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `MongoDB` エンジンを使用するテーブル、または `mongodb` テーブル関数から読み取る複数の種類の `SELECT` クエリを修正しました。`WHERE` 句内で定数値が暗黙的に変換されるクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` および `GROUP BY` を含むクエリが対象です。これらのクエリは以前、誤った結果を返す可能性がありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* 異なる JSON 型間の変換を修正しました。現在は String への／からの変換を経由した単純なキャストで行われます。効率は低下しますが、結果は 100% 正確です。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型を Interval 型に変換する際の論理エラーを修正。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON パースエラー時のカラムのロールバック処理を修正しました。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 定数のエイリアス列を使用して `JOIN` した際に発生する「bad cast」エラーを修正しました。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ビューと対象テーブルで型が異なる列に対しては、マテリアライズドビューでの `PREWHERE` の使用を許可しないようにしました。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* Variant 列の不正なバイナリデータをパースする際に発生していた論理エラーを修正。 [#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* parquet のバッチサイズが 0 に設定されている場合に例外をスローするようにしました。以前は `output_format_parquet_batch_size = 0` のときに ClickHouse がハングしていましたが、この動作は修正されました。 [#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* コンパクトパーツにおける basic フォーマットの variant discriminator のデシリアライズ処理を修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) で導入されました。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* `complex_key_ssd_cache` 型の辞書では、ゼロまたは負の `block_size` および `write_buffer_size` パラメータが拒否されるようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* SummingMergeTree では、非集約列に Field を使用しないでください。SummingMergeTree で Dynamic/Variant 型と併用すると、予期しないエラーが発生する可能性があります。 [#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar)).
* `Distributed` 宛先テーブルを持ち、ヘッダーが異なる `Materialized View` からの読み取りを analyzer で修正。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* バッチ挿入が行われたテーブルで `arrayUnion()` が余分な（誤った）値を返していたバグを修正します。 [#75057](https://github.com/ClickHouse/ClickHouse/issues/75057) を修正。 [#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* `OpenSSLInitializer` のセグメンテーションフォルトを修正。 [#79092](https://github.com/ClickHouse/ClickHouse/issues/79092) をクローズ。 [#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* S3 ListObject に対して常に `prefix` を設定するようにしました。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* バッチ挿入を行ったテーブルで arrayUnion() が余分な（誤った）値を返してしまうバグを修正します。[#79157](https://github.com/ClickHouse/ClickHouse/issues/79157) を修正。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* フィルタープッシュダウン後の論理的なエラーを修正。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* HTTP ベースのエンドポイントで delta-kernel 実装を使用する DeltaLake テーブルエンジンの不具合を修正し、`NOSIGN` を修正しました。 [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124) をクローズ。 [#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper の修正: 失敗した multi リクエストで watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `IN` で Dynamic 型と JSON 型の使用を禁止しました。現在の `IN` の実装では、不正確な結果につながる可能性があります。`IN` におけるこれらの型の適切なサポートは複雑であり、将来的に対応される可能性があります。[#79282](https://github.com/ClickHouse/ClickHouse/pull/79282)（[Pavel Kruglov](https://github.com/Avogar)）。
* JSON 型のパース時における重複パスのチェックを修正。 [#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar)).
* SecureStreamSocket の接続問題を修正。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* データを含む plain&#95;rewritable ディスクのロード処理を修正。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* MergeTree の Wide パーツにおける動的サブカラム検出時のクラッシュを修正。 [#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル名の長さは、最初の `CREATE` クエリに対してのみ検証します。後方互換性の問題を避けるため、2 回目以降の `CREATE` では検証しないでください。 [#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* スパースカラムを持つテーブルで、いくつかのケースにおいて発生していた `Block structure mismatch` エラーを修正しました。 [#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* 「Logical Error: Can&#39;t set alias of * of Asterisk on alias」を発生させていた 2 つのケースを修正。 [#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano)).
* Atomic データベースのリネーム時に誤ったパスが使用される問題を修正。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach))。
* JSON カラムと他のカラムを組み合わせた ORDER BY の問題を修正。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* `use_hedged_requests` と `allow_experimental_parallel_reading_from_replicas` の両方が無効な場合に、remote から読み取る際に発生していた結果の重複を修正しました。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* Unity Catalog 使用時の delta-kernel 実装におけるクラッシュを修正。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 自動検出クラスター向けのマクロを解決しました。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 誤って設定された page&#95;cache&#95;limits を適切に扱うようにしました。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 可変長フォーマッタ（例: `%W`、曜日 `Monday` `Tuesday` など）の後に複合フォーマッタ（複数の要素を一度に出力するフォーマッタ。例: `%D`、アメリカ式の日付 `05/04/25`）が続く場合に、SQL 関数 `formatDateTime` の結果が正しくなるよう修正しました。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze)).
* IcebergS3 は count の最適化をサポートしますが、IcebergS3Cluster はサポートしません。その結果、クラスターモードで返される count() の結果は、レプリカ数の倍数になる場合があります。 [#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear))。
* 遅延マテリアライゼーション時に、投影までクエリ実行に列がまったく使用されない場合に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正します。例: SELECT * FROM t ORDER BY rand() LIMIT 5。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926) ([Igor Nikonov](https://github.com/devcrafter))。
* クエリ `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` のパスワードを非表示にしました。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* JOIN USING でエイリアスを指定できるようにしました。列がリネームされた場合（例：ARRAY JOIN によるもの）には、このエイリアスを指定してください。[#73707](https://github.com/ClickHouse/ClickHouse/issues/73707) を修正しました。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `UNION` を含むマテリアライズドビューが新しいレプリカで正しく動作するようにしました。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 関数 `parseDateTime` の書式指定子 `%e` は、これまでスペース埋め（例: ` 3`）を必須としていましたが、現在は 1 桁の日付（例: `3`）も認識するようになりました。これにより、MySQL と同等の動作になります。以前の動作を維持したい場合は、設定 `parsedatetime_e_requires_space_padding = 1` を有効にしてください。(issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)). [#80057](https://github.com/ClickHouse/ClickHouse/pull/80057) ([Robert Schulze](https://github.com/rschu1ze)).
* ClickHouse のログに出力される `Cannot find 'kernel' in '[...]/memory.stat'` という警告を解消しました（issue [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。 [#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* FunctionComparison でスタックサイズを確認し、スタックオーバーフローによるクラッシュを回避します。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* `system.workloads` に対する SELECT 実行時のレースコンディションを修正しました。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修正: 分散クエリにおけるレイジーマテリアライゼーション。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* `Array(Bool)` から `Array(FixedString)` への変換を修正しました。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat)).
* parquet バージョンの選択を分かりにくくないようにしました。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* `ReservoirSampler` の自己マージ処理を修正。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントコンテキストにおける挿入テーブルのストレージ処理を修正。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `AggregatingSortedAlgorithm` と `SummingSortedAlgorithm` のデータメンバーの破棄順序を修正。 [#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat)).
* `enable_user_name_access_type` は `DEFINER` のアクセス種別に影響を与えてはなりません。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* `system` データベースのメタデータが `keeper` 上にある場合、`system` データベースへのクエリがハングすることがある。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### ビルド/テスト/パッケージングの改善

- ビルド済みの`chcache`バイナリを常に再ビルドせずに再利用できるようにしました。[#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
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

* ワークロード向けに CPU スロットのスケジューリング機能を追加しました。詳細は [ドキュメント](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling) を参照してください。 [#77595](https://github.com/ClickHouse/ClickHouse/pull/77595) ([Sergei Trifonov](https://github.com/serxa)).
* `clickhouse-local` は、`--path` コマンドライン引数を指定した場合、再起動後もデータベースを保持します。これにより [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647) がクローズされます。また、これにより [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947) もクローズされます。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* サーバーが過負荷のときにクエリを拒否します。判定は、待機時間（`OSCPUWaitMicroseconds`）とビジー時間（`OSCPUVirtualTimeMicroseconds`）の比率に基づいて行われます。この比率が `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` の間にある場合（これらはクエリレベルの設定です）、一定の確率でクエリが破棄されます。[#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* `Iceberg` のタイムトラベル: 特定のタイムスタンプ時点の `Iceberg` テーブルをクエリできる設定を追加。 [#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* `Iceberg` メタデータ用のインメモリキャッシュで、クエリの高速化のためにマニフェストファイル／リストと `metadata.json` を保存します。 [#77156](https://github.com/ClickHouse/ClickHouse/pull/77156) ([Han Fei](https://github.com/hanfei1991)).
* Azure Blob Storage 向けに `DeltaLake` テーブルエンジンをサポート。[#68043](https://github.com/ClickHouse/ClickHouse/issues/68043) を修正。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* デシリアライズ済みのベクトル類似性インデックス用のインメモリキャッシュを追加しました。これにより、近似最近傍 (ANN) 検索クエリの再実行が高速になります。新しいキャッシュのサイズは、サーバー設定 `vector_similarity_index_cache_size` および `vector_similarity_index_cache_max_entries` によって制御されます。この機能は、これまでのリリースで提供されていたスキップインデックスキャッシュ機能に置き換わるものです。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905) ([Shankar Iyer](https://github.com/shankar-iyer)).
* DeltaLake でのパーティションプルーニングをサポートしました。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 読み取り専用の `MergeTree` テーブルでのバックグラウンドリフレッシュをサポートし、更新可能なテーブルを無制限数の分散リーダーからクエリできるようにしました（ClickHouse ネイティブなデータレイク）。[#76467](https://github.com/ClickHouse/ClickHouse/pull/76467)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* データベースのメタデータファイルを保存するためにカスタムディスクを使用できるようになりました。現在、これはサーバー全体のレベルでのみ設定できます。 [#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach)).
* plain&#95;rewritable ディスクで `ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION` がサポートされるようになりました。 [#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva)).
* `Kafka` テーブルエンジンに、`SASL` 設定および認証情報用のテーブル設定を追加しました。これにより、設定ファイルや named collection を使用せずに、`CREATE TABLE` 文の中で直接、Kafka および Kafka 互換システムに対する SASL ベースの認証を構成できるようになります。 [#78810](https://github.com/ClickHouse/ClickHouse/pull/78810) ([Christoph Wurm](https://github.com/cwurm))。
* MergeTree テーブルに対して `default_compression_codec` を設定できるようにしました。これは、指定されたカラムに対して `CREATE` クエリでコーデックが明示的に定義されていない場合に使用されます。これにより [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005) がクローズされました。 [#66394](https://github.com/ClickHouse/ClickHouse/pull/66394) ([gvoelfin](https://github.com/gvoelfin))。
* `bind_host` 設定を clusters 構成に追加し、ClickHouse が分散接続に特定のネットワークを使用できるようにしました。 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum)).
* `system.tables` に新しいカラム `parametrized_view_parameters` を導入しました。 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756) をクローズします。 [#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* データベースのコメントを変更できるようにしました。 [#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) をクローズ。 ### ユーザー向け変更のドキュメントへの反映。 [#75622](https://github.com/ClickHouse/ClickHouse/pull/75622) ([NamNguyenHoai](https://github.com/NamHoaiNguyen))。
* PostgreSQL 互換プロトコルで `SCRAM-SHA-256` 認証をサポートしました。 [#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12)).
* 関数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted`、`arraySimilarity` を追加しました。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 設定 `parallel_distributed_insert_select` は、`ReplicatedMergeTree` への `INSERT SELECT` にも適用されるようになりました（以前は `Distributed` テーブルが必要でした）。 [#78041](https://github.com/ClickHouse/ClickHouse/pull/78041) ([Igor Nikonov](https://github.com/devcrafter)).
* `toInterval` 関数を導入しました。この関数は 2 つの引数（value と unit）を受け取り、その値を特定の `Interval` 型に変換します。 [#78723](https://github.com/ClickHouse/ClickHouse/pull/78723) ([Andrew Davis](https://github.com/pulpdrew))。
* iceberg テーブル関数およびエンジンで、ルートの `metadata.json` ファイルを特定するための、いくつかの便利な方法を追加しました。[#78455](https://github.com/ClickHouse/ClickHouse/issues/78455) をクローズ。 [#78475](https://github.com/ClickHouse/ClickHouse/pull/78475) ([Daniil Ivanik](https://github.com/divanik))。
* ClickHouse の SSH プロトコルでのパスワードベース認証をサポートしました。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 実験的機能
* `WHERE` 句内の `EXISTS` 式の引数として、相関サブクエリをサポートしました。[#72459](https://github.com/ClickHouse/ClickHouse/issues/72459) をクローズ。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `sparseGrams` および `sparseGramsHashes` に、ASCII 版と UTF8 版を追加しました。作者: [scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。この機能は使用しないでください。実装は今後のバージョンで変更される予定です。



#### パフォーマンスの向上

* `ORDER BY` および `LIMIT` の後にデータを読み込む lazy columns を使用してパフォーマンスを最適化します。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* デフォルトで `query condition cache` を有効にしました。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `col->insertFrom()` への呼び出しをデバーチャル化することで、JOIN 結果の構築を高速化しました。 [#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger)).
* 可能であれば、フィルタークエリプランステップの等価条件を JOIN 条件に統合し、それらをハッシュテーブルのキーとして使用できるようにします。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd)).
* JOIN の両方の側で JOIN キーが PK のプレフィックスになっている場合、JOIN に動的シャーディングを使用します。この最適化は `query_plan_join_shard_by_pk_ranges` 設定（デフォルトでは無効）で有効にできます。 [#74733](https://github.com/ClickHouse/ClickHouse/pull/74733) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* カラムの下限値および上限値に基づく `Iceberg` データのプルーニングをサポートします。 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638) を修正します。 [#78242](https://github.com/ClickHouse/ClickHouse/pull/78242) ([alesapin](https://github.com/alesapin)).
* `Iceberg` 向けに単純な `count` 最適化を実装しました。これにより、フィルタなしで `count()` を使用するクエリの実行が高速になります。 [#77639](https://github.com/ClickHouse/ClickHouse/issues/77639) をクローズ。 [#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* `max_merge_delayed_streams_for_parallel_write` を使用して、マージ時に並列でフラッシュできる列数を設定できるようにしました（これにより、S3 への垂直マージ時のメモリ使用量が約 25 分の 1 になると予想されます）。 [#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat)).
* `filesystem_cache_prefer_bigger_buffer_size` は、マージなどでキャッシュがパッシブに使われる場合には無効化します。これにより、マージ時のメモリ消費量が削減されます。 [#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 現在、`parallel replicas` を有効にした読み取りでは、タスクサイズの決定にレプリカ数を使用します。これにより、読み取るデータ量がそれほど大きくない場合でも、レプリカ間での作業負荷の分散がより良くなります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* `ORC` フォーマットで非同期 IO プリフェッチをサポートし、リモート IO レイテンシーを隠すことで全体的なパフォーマンスを向上させました。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 非同期挿入で使用するメモリを事前に確保してパフォーマンスを向上。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* レプリカ数の増加に伴い Keeper への負荷が高くなり得た単一の `get` リクエストを、`multiRead` が利用可能な箇所では使用しないようにすることで、Keeper へのリクエスト数を削減しました。 [#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* Nullable 引数に対して関数を実行する際の軽微な最適化。 [#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* `arraySort` を最適化。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 同じパーツのマークをまとめてマージし、一度にクエリ条件キャッシュへ書き込むことで、ロックの使用を削減しました。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 1つのブラケット展開を含むクエリに対して `s3Cluster` のパフォーマンスを最適化。 [#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis)).
* 単一の `Nullable` 列または `LowCardinality` 列での `ORDER BY` を最適化しました。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li))。
* `Native` フォーマットのメモリ使用量を最適化。 [#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat)).
* 軽微な最適化: 型キャストが必要な場合は `count(if(...))` を `countIf` に書き換えないようにする。 [#78564](https://github.com/ClickHouse/ClickHouse/issues/78564) をクローズ。 [#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 関数で `tokenbf_v1`、`ngrambf_v1` の全文スキップインデックスを利用できるようになりました。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus))。
* ベクトル類似性インデックスがメインメモリを最大 2 倍まで過剰に割り当ててしまう可能性がありました。この修正ではメモリ割り当て戦略を見直し、メモリ消費量を削減するとともに、ベクトル類似性インデックスキャッシュの有効性を高めています（issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `system.metric_log` テーブルにスキーマ種別を指定するための設定 `schema_type` を導入しました。指定可能なスキーマは 3 種類あります。`wide` — 現在のスキーマで、各 metric/event が個別のカラムに格納されます（個々のカラムの読み取りに最も効果的）、`transposed` — `system.asynchronous_metric_log` に似ており、metrics/events が行として格納されます。そして最も興味深い `transposed_with_wide_view` — `transposed` スキーマで基礎テーブルを作成しつつ、クエリを基礎テーブルへのクエリに変換する `wide` スキーマのビューも用意します。`transposed_with_wide_view` では、そのビューに対するサブ秒精度はサポートされず、`event_time_microseconds` は後方互換性のための単なるエイリアスです。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin)).





#### 改善

* `Distributed` クエリのクエリプランをシリアライズします。新しい設定 `serialize_query_plan` が追加されました。有効にすると、`Distributed` テーブルからのクエリは、リモートでのクエリ実行にシリアライズ済みのクエリプランを使用します。これにより TCP プロトコルに新しいパケットタイプが導入されます。このパケットを処理できるようにするには、サーバー設定に `<process_query_plan_packet>true</process_query_plan_packet>` を追加する必要があります。 [#69652](https://github.com/ClickHouse/ClickHouse/pull/69652) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* ビューからの `JSON` 型およびサブカラムの読み取りをサポートしました。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar))。
* `ALTER DATABASE ... ON CLUSTER` をサポートしました。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* リフレッシュ可能マテリアライズドビューのリフレッシュが、`system.query_log` に記録されるようになりました。 [#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321))。
* ユーザー定義関数 (UDF) は、設定ファイル内の新しいオプションによって決定的であるとマークできるようになりました。また、`query cache` はクエリ内で呼び出される UDF が決定的かどうかを確認するようになりました。決定的であれば、そのクエリ結果がキャッシュされます（Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)）。[#77769](https://github.com/ClickHouse/ClickHouse/pull/77769)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* あらゆる種類のレプリケートタスクに対してバックオフロジックを有効にしました。これにより、CPU 使用量、メモリ使用量、ログファイルサイズを削減できるようになります。`max_postpone_time_for_failed_mutations_ms` と同様の新しい設定として、`max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms`、`max_postpone_time_for_failed_replicated_tasks_ms` を追加しました。 [#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.errors` に `query_id` を追加。[#75815](https://github.com/ClickHouse/ClickHouse/issues/75815) をクローズします。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* `UInt128` から `IPv6` への変換サポートを追加しました。これにより、`IPv6` に対する `bitAnd` 演算や算術演算が可能になり、その結果を `IPv6` に変換して戻すこともできます。[#76752](https://github.com/ClickHouse/ClickHouse/issues/76752) をクローズします。これにより、`IPv6` に対する `bitAnd` 演算の結果も `IPv6` に変換して戻せるようになります。[#57707](https://github.com/ClickHouse/ClickHouse/pull/57707) も参照してください。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* デフォルトでは、`Variant` 型内のテキスト形式に含まれる特殊な `Bool` 値はパースされません。設定 `allow_special_bool_values_inside_variant` を有効にすることで、これを有効化できます。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* 低い `priority` のクエリに対して、タスクごとの待機時間をセッションレベルおよびサーバーレベルで設定できるようにしました。 [#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* JSON データ型の値に対する比較を実装しました。これにより、JSON オブジェクトを Map と同様に比較できるようになりました。 [#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.kafka_consumers` による権限サポートを改善。内部の `librdkafka` エラーを転送（このライブラリがひどいものであることは付記しておきます）。[#77700](https://github.com/ClickHouse/ClickHouse/pull/77700)（[Ilya Golshtein](https://github.com/ilejn)）。
* Buffer テーブルエンジンの設定に対するバリデーションを追加しました。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `HDFS` での `pread` の有効／無効を切り替えるための設定 `enable_hdfs_pread` を追加。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou)).
* ZooKeeper の `multi` 読み取りリクエストおよび書き込みリクエスト数向けの profile event を追加。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* `disable_insertion_and_mutation` が有効な場合でも、一時テーブルの作成および挿入を許可するようにしました。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* `max_insert_delayed_streams_for_parallel_write` を（100 に）減らしました。[#77919](https://github.com/ClickHouse/ClickHouse/pull/77919)（[Azat Khuzhin](https://github.com/azat)）。
* `yyy` のような Joda 構文での年のパースを修正しました（念のため補足すると、これは Java の世界の話です）。[#77973](https://github.com/ClickHouse/ClickHouse/pull/77973)（[李扬](https://github.com/taiyang-li)）。
* `MergeTree` テーブルのパーツのアタッチはブロック順で実行されるようになりました。これは `ReplacingMergeTree` などの特殊なマージアルゴリズムにとって重要です。この変更により [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009) が解決されました。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリマスキングルールは、マッチが発生した場合に `LOGICAL_ERROR` をスローできるようになりました。これにより、あらかじめ定義したパスワードがログのどこかに漏洩していないかを確認しやすくなります。 [#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* MySQL との互換性を高めるため、`information_schema.tables` に列 `index_length_column` を追加しました。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ))。
* 新しいメトリクス `TotalMergeFailures` と `NonAbortedMergeFailures` を 2 つ導入しました。これらのメトリクスは、短時間に多数のマージが失敗するケースを検知するために必要です。 [#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* パス形式でキーが指定されていない場合の S3 URL の誤ったパースを修正。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos)).
* 非同期メトリクス `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime`、`BlockReadTime` の誤った値を修正（この変更以前は 1 秒が誤って 0.001 として報告されていました）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov)).
* StorageS3(Azure)Queue へのマテリアライズドビューへのプッシュ中に発生するエラーに対して、`loading_retries` の上限を適用するようにしました。以前は、そのようなエラーは無制限にリトライされていました。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `delta-kernel-rs` 実装を用いた DeltaLake で、パフォーマンスと進行状況バーを改善しました。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ランタイムディスクで `include`、`from_env`、`from_zk` をサポート。 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177) をクローズ。 [#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 長時間実行中の mutation に対する動的な warning を `system.warnings` テーブルに追加。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* システムテーブル `system.query_condition_cache` にフィールド `condition` を追加しました。これは、クエリ条件キャッシュでキーとして使用されるハッシュの元になるプレーンテキストの条件を保持します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* Hive パーティションで空値を許可できるようにしました。 [#78816](https://github.com/ClickHouse/ClickHouse/pull/78816) ([Arthur Passos](https://github.com/arthurpassos)).
* `BFloat16` に対する `IN` 句の型変換を修正しました（つまり、`SELECT toBFloat16(1) IN [1, 2, 3];` は現在 `1` を返します）。[#78754](https://github.com/ClickHouse/ClickHouse/issues/78754) をクローズ。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `disk = ...` が設定されている場合は、`MergeTree` の他のディスク上のパーツをチェックしないようにしました。 [#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* `system.query_log` の `used_data_type_families` に含まれるデータ型が、正規名で記録されるようにしました。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` 中のクリーンアップ設定を、[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様に実施しました。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `INFILE` のスキーマ推論に挿入カラムを使用するようにしました。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `count(Nullable)` が集約プロジェクションで使用されている場合の誤ったプロジェクション解析を修正しました。これにより [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495) が解決されます。この PR では、プロジェクションがなぜ使用されるのか、あるいはなぜ使用されないのかを明確にするために、プロジェクション解析まわりのログも追加しています。 [#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* `DETACH PART` 実行中に発生する `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` エラーを修正。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* アナライザにおいてリテラルを含む式を使った `skip indexes` が動作しない問題を修正し、インデックス解析時の自明な `cast` を削除しました。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* `close_session` クエリパラメータがまったく効果を持たず、その結果、名前付きセッションが `session_timeout` 経過後にしかクローズされなかったバグを修正しました。 [#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats)).
* Materialized View を付与していない状態で NATS サーバーからメッセージを受信できない問題を修正しました。 [#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 空の `FileLog` から `merge` テーブル関数経由で読み取る際に発生する論理エラーを修正し、[#75575](https://github.com/ClickHouse/ClickHouse/issues/75575) をクローズしました。[#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 共有バリアントの `Dynamic` シリアライゼーションでデフォルトのフォーマット設定を使用するようにしました。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar))。
* ローカルディスク上のテーブルデータパスの存在チェックを修正。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 一部の型に対して、定数値をリモートに送信する処理を修正。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* S3/AzureQueue における期限切れのコンテキストが原因のクラッシュを修正。 [#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* RabbitMQ、Nats、Redis、AzureQueue テーブルエンジンで認証情報をマスクしました。 [#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `argMin`/`argMax` における `NaN` 比較時の未定義動作を修正。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* 操作によって書き込み対象のブロックが一切生成されない場合でも、マージおよびミューテーションがキャンセルされていないかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* Replicated データベースで、新しく追加されたレプリカ上で固定リフレッシュ可能マテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* `NOT_FOUND_COLUMN_IN_BLOCK` エラーが発生した際にクラッシュする可能性があった問題を修正しました。 [#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データ投入中に発生する S3/AzureQueue のクラッシュを修正。 [#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* SSH サーバーで履歴のファジー検索を無効化（`skim` ライブラリが必要なため）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* テーブル内にベクトル類似性インデックスが定義された別のベクトル列が存在する場合に、インデックスが作成されていない列に対するベクトル検索クエリが誤った結果を返してしまうバグを修正しました。(Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978))。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* ごく小さなエラー「The requested output format {} is binary... Do you want to output it anyway? [y/N]」プロンプトを修正。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* `toStartOfInterval` で origin 引数が 0 の場合に発生するバグを修正。 [#78096](https://github.com/ClickHouse/ClickHouse/pull/78096) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* HTTP インターフェイスで空の `session_id` クエリパラメータを指定することを禁止しました。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* `ALTER` クエリの直後に実行された `RENAME` クエリが原因で発生する可能性があった、`Replicated` データベースにおけるメタデータの上書き問題を修正。 [#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique))。
* `NATS` エンジンで発生するクラッシュを修正しました。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 埋め込みクライアントで SSH 用の history&#95;file を作成しようとしないようにしました（これまでのバージョンでは作成は常に失敗していましたが、試行自体は行われていました）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* `RENAME DATABASE` または `DROP TABLE` クエリの実行後に `system.detached_tables` が誤った情報を表示する問題を修正。 [#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique)).
* `Replicated` データベースにおけるテーブル数過多チェックを、[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) 適用後に修正しました。また、`ReplicatedMergeTree` や `KeeperMap` の場合に Keeper 内に未管理のノードが作成されるのを避けるため、ストレージを作成する前にこのチェックを実行するようにしました。[#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 同時に実行される `S3Queue` メタデータ初期化によって発生する可能性のあるクラッシュを修正。 [#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat))。
* `groupArray*` 関数は、これまでは実行を試みていた `max_size` 引数の Int 型の 0 値に対して、UInt 型の場合と同様に、`BAD_ARGUMENTS` エラーを返すようになりました。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* ローカルテーブルがデタッチされる前に削除されていた場合でも、失われたレプリカのリカバリ中にクラッシュしないようにしました。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* `system.s3_queue_settings` の「alterable」カラムが常に `false` を返していた問題を修正しました。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ユーザーやログに表示されないように Azure アクセス署名をマスクするようにしました。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Wide パーツにおけるプレフィックス付きサブストリームのプリフェッチを修正。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* キー配列が `LowCardinality(Nullable)` 型の場合に発生する `mapFromArrays` のクラッシュや誤った結果を修正しました。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* delta-kernel-rs の認証オプションを修正しました。[#78255](https://github.com/ClickHouse/ClickHouse/pull/78255)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* レプリカの `disable_insertion_and_mutation` が true の場合、Refreshable Materialized Views のタスクをスケジューリングしないようにしました。タスクは挿入処理であり、`disable_insertion_and_mutation` が true の場合は失敗します。 [#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* `Merge` エンジンで使用される基盤テーブルへのアクセスを検証します。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `Distributed` テーブルをクエリする際、`FINAL` 修飾子は無視されます。 [#78428](https://github.com/ClickHouse/ClickHouse/pull/78428) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `bitmapMin` は、ビットマップが空の場合には uint32&#95;max（入力型がそれより大きい場合には uint64&#95;max）を返します。これは、空の roaring&#95;bitmap に対する最小値の動作と一致します。 [#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear)).
* `distributed_aggregation_memory_efficient` が有効な場合、FROM 読み込み直後のクエリ処理の並列化を無効化しました。これにより論理エラーが発生する可能性があったためです。[#76934](https://github.com/ClickHouse/ClickHouse/issues/76934) をクローズしました。[#78500](https://github.com/ClickHouse/ClickHouse/pull/78500)（[flynn](https://github.com/ucasfl)）。
* `max_streams_to_max_threads_ratio` 設定を適用した結果、計画されるストリームが 0 本となる場合に備えて、少なくとも 1 本の読み取り用ストリームを確保するようにしました。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `S3Queue` において、論理エラー &quot;Cannot unregister: table uuid is not registered&quot; を修正しました。[#78285](https://github.com/ClickHouse/ClickHouse/issues/78285) をクローズします。 [#78541](https://github.com/ClickHouse/ClickHouse/pull/78541) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ClickHouse は、cgroups v1 と v2 の両方が有効なシステムで、自身が属する cgroup v2 を特定できるようになりました。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* `-Cluster` テーブル関数が、テーブルレベルの設定と併用した場合に失敗していました。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik))。
* INSERT 時に ReplicatedMergeTree がトランザクションをサポートしていない場合の検証を強化。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* アタッチ時にクエリ設定をクリーンアップ。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano))。
* `iceberg_metadata_file_path` に無効なパスが指定されていた場合に発生するクラッシュを修正しました。 [#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* `DeltaLake` テーブルエンジンの delta-kernel-s 実装において、読み取りスキーマがテーブルスキーマと異なり、かつパーティションカラムが存在する場合に「not found column」エラーが発生する問題を修正しました。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 名前付きセッションをクローズするようスケジュールした後（タイムアウトが切れる前）に、同じ名前で新しい名前付きセッションを作成すると、最初のセッションがクローズされる予定だった時点でその新しいセッションもクローズされてしまう問題を修正しました。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* `MongoDB` エンジンを使用するテーブル、または `mongodb` テーブル関数から読み取る複数の種類の `SELECT` クエリを修正しました。対象は、`WHERE` 句内で定数値の暗黙的な型変換を行うクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）と、`LIMIT` および `GROUP BY` を含むクエリです。以前は、これらのクエリが誤った結果を返す可能性がありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* `CHECK TABLE` 実行中にテーブルのシャットダウンがブロックされないようにしました。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper の修正: すべてのケースで ephemeral count を正しく更新。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* `view` 以外のテーブル関数を使用する場合に `StorageDistributed` で発生する不正なキャストを修正。[#78464](https://github.com/ClickHouse/ClickHouse/issues/78464) をクローズ。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `tupleElement(*, 1)` のフォーマットの一貫性を改善。[#78639](https://github.com/ClickHouse/ClickHouse/issues/78639) をクローズ。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `ssd_cache` タイプの辞書では、`block_size` および `write_buffer_size` パラメータにゼロまたは負の値が指定されている場合は拒否されるようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 不正なシャットダウン後に `ALTER` を実行した際に発生する Refreshable `MATERIALIZED VIEW` のクラッシュを修正しました。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* `CSV` フォーマットでの不正な `DateTime` 値のパース処理を修正しました。 [#78919](https://github.com/ClickHouse/ClickHouse/pull/78919) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper の修正: 失敗した multi リクエストで watch が発火しないようにする。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* 最小値・最大値が明示的に指定されているにもかかわらず、その値が `NULL` の場合に Iceberg テーブルの読み取りに失敗する問題を修正しました。Go Iceberg ライブラリが、このような不適切なファイルを生成することがあると指摘されていました。[#78740](https://github.com/ClickHouse/ClickHouse/issues/78740) をクローズしました。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。

#### ビルド/テスト/パッケージングの改善

- RustでCPUターゲット機能を考慮し、すべてのクレートでLTOを有効化しました。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse リリース 25.3 LTS, 2025-03-20 {#253}

#### 後方互換性のない変更

- レプリケートされたデータベースのトランケートを禁止しました。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc))。
- スキッピングインデックスキャッシュを元に戻しました。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。


#### 新機能

* `JSON` データ型は本番環境で利用可能です。[https://jsonbench.com/](https://jsonbench.com/) を参照してください。`Dynamic` および `Variant` データ型も本番環境で利用可能です。 [#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* clickhouse-server 向けに SSH プロトコルを導入しました。これにより、任意の SSH クライアントを使用して ClickHouse に接続できるようになりました。これにより次の Issue がクローズされました: [#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 並列レプリカが有効な場合は、テーブル関数を対応する -Cluster 版に置き換えます。[#65024](https://github.com/ClickHouse/ClickHouse/issues/65024) を修正。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `Userspace Page Cache` の新しい実装により、OS のページキャッシュに依存する代わりにプロセス内メモリにデータをキャッシュできるようになりました。これは、データがローカルファイルシステムキャッシュによるバックアップのないリモート仮想ファイルシステム上に保存されている場合に有用です。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 同時実行クエリ間で CPU スロットの割り当て方法を制御する `concurrent_threads_scheduler` サーバー設定を追加しました。`round_robin`（従来の挙動）または `fair_round_robin` を設定でき、INSERT と SELECT 間の CPU 割り当てが不公平になる問題に対処できます。 [#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* `estimateCompressionRatio` 集約関数を追加。[#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。[#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 関数 `arraySymmetricDifference` を追加しました。これは複数の配列引数のうち、すべての引数に共通して含まれていない要素をすべて返します。例: `SELECT arraySymmetricDifference([1, 2], [2, 3])` は `[1, 3]` を返します。(issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673))。 [#76231](https://github.com/ClickHouse/ClickHouse/pull/76231) ([Filipp Abapolov](https://github.com/pheepa))。
* Iceberg に対して、ストレージ/テーブル関数設定 `iceberg_metadata_file_path` で読み取るメタデータファイルを明示的に指定できるようにしました。[#47412](https://github.com/ClickHouse/ClickHouse/issues/47412) を修正。[#77318](https://github.com/ClickHouse/ClickHouse/pull/77318)（[alesapin](https://github.com/alesapin)）。
* `keccak256` ハッシュ関数を追加しました。これはブロックチェーンの実装、特に EVM ベースのシステムで一般的に使用されているものです。 [#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche)).
* 3 つの新しい関数を追加しました。仕様に準拠した `icebergTruncate`（[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details) を参照）、`toYearNumSinceEpoch`、`toMonthNumSinceEpoch` です。`Iceberg` エンジンのパーティションプルーニングで `truncate` 変換をサポートします。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403)（[alesapin](https://github.com/alesapin)）。
* `LowCardinality(Decimal)` データ型をサポートしました。[#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833)（[zhanglistar](https://github.com/zhanglistar)）。
* `FilterTransformPassedRows` と `FilterTransformPassedBytes` のプロファイルイベントは、クエリ実行中にフィルタで除外された行数およびバイト数を示します。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar)).
* ヒストグラムメトリクスタイプのサポート。インターフェイスは Prometheus クライアントに非常によく似ており、対応するバケット内のカウンタを増加させるには、単に `observe(value)` を呼び出すだけです。ヒストグラムメトリクスは `system.histogram_metrics` を通じて公開されます。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 明示的な値を対象にした、非定数 `CASE` 構文のサポート。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).



#### 実験的機能
* AWS S3 およびローカルファイルシステム上の DeltaLake テーブルに対して、[Unity Catalog](https://www.databricks.com/product/unity-catalog) のサポートを追加しました。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988)（[alesapin](https://github.com/alesapin)）。
* Iceberg テーブル向けに、AWS Glue Service Catalog との実験的な統合を追加しました。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257)（[alesapin](https://github.com/alesapin)）。
* 動的なクラスタ自動検出のサポートを追加しました。これは既存の _node_ 自動検出機能を拡張するものです。ClickHouse は、`<multicluster_root_path>` を使用することで、共通の ZooKeeper パス配下で新しい _cluster_ を自動的に検出および登録できるようになりました。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 新しい設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` により、設定可能なタイムアウト経過後に、パーティション全体を対象とした自動クリーンアップマージを行えるようになりました。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440)（[Christoph Wurm](https://github.com/cwurm)）。



#### パフォーマンスの改善
* 繰り返し利用される条件に対してクエリ条件キャッシュを実装し、クエリ性能を向上させました。条件を満たさないデータ部分の範囲をメモリ上の一時インデックスとして記憶し、後続のクエリでこのインデックスを利用します。[#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236) ([zhongyuankai](https://github.com/zhongyuankai))。
* パーツ削除時にキャッシュからデータを積極的に削除するようにしました。データ量が少ない場合に、キャッシュが最大サイズまで増加しないようにします。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 算術計算において Int256 と UInt256 を clang 組み込みの i256 に置き換え、パフォーマンスを改善しました。[#70502](https://github.com/ClickHouse/ClickHouse/issues/70502) [#73658](https://github.com/ClickHouse/ClickHouse/pull/73658) ([李扬](https://github.com/taiyang-li))。
* 一部のケース（例: 空の配列カラム）では、データパーツに空ファイルが含まれることがあります。メタデータとオブジェクトストレージが分離されたディスク上にテーブルが配置されている場合、そのようなファイルについては空の BLOB の書き込みをスキップし、メタデータのみを ObjectStorage に保存できるようにしました。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860) ([Alexander Gololobov](https://github.com/davenger))。
* Decimal32/Decimal64/DateTime64 に対する min/max の性能を改善しました。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570) ([李扬](https://github.com/taiyang-li))。
* クエリコンパイル（設定 `compile_expressions`）がマシンタイプを考慮するようになりました。これにより、そのようなクエリの速度が大幅に向上します。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753) ([ZhangLiStar](https://github.com/zhanglistar))。
* `arraySort` を最適化しました。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li))。
* マージなどキャッシュが受動的に使用される場合には、`filesystem_cache_prefer_bigger_buffer_size` を無効化しました。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 一部のコード箇所で `preserve_most` 属性を適用し、わずかながらより良いコード生成が行われるようにしました。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778) ([Nikita Taranov](https://github.com/nickitat))。
* ClickHouse サーバのシャットダウンを高速化しました（2.5 秒の遅延を解消）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550) ([Azat Khuzhin](https://github.com/azat))。
* ReadBufferFromS3 やその他のリモート読み取りバッファで不要なメモリアロケーションを回避し、メモリ消費を半分に削減しました。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692) ([Sema Checherinda](https://github.com/CheSema)).
* zstd を 1.5.5 から 1.5.7 に更新しました。これにより、いくつかの[パフォーマンス改善](https://github.com/facebook/zstd/releases/tag/v1.5.7)が見込めます。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137) ([Pradeep Chhetri](https://github.com/chhetripradeep))。
* Wide パーツにおける JSON カラムのプリフェッチ時のメモリ使用量を削減しました。これは、ClickHouse Cloud のような共有ストレージ上で ClickHouse が利用される場合に有効です。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640) ([Pavel Kruglov](https://github.com/Avogar))。



#### 改善

* `INTO OUTFILE` と併用される `TRUNCATE` でアトミックなリネームをサポートしました。[#70323](https://github.com/ClickHouse/ClickHouse/issues/70323) を解決。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 設定としての浮動小数値に `NaN` や `inf` を使用することは、もはやできません。もっとも、以前からそもそも意味はありませんでしたが。[#77546](https://github.com/ClickHouse/ClickHouse/pull/77546)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* analyzer が無効な場合、`compatibility` の設定に関係なく parallel replicas をデフォルトで無効にします。この動作は、`parallel_replicas_only_with_analyzer` を `false` に明示的に設定することで変更できます。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter)).
* クライアントリクエストのヘッダーから外部 HTTP 認証器へ転送するヘッダーのリストを定義できるようにしました。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* タプルカラム内のフィールドに対する列名の大文字小文字を区別しないカラムマッチングを尊重するようにしました。 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324) をクローズしました。 [#73780](https://github.com/ClickHouse/ClickHouse/pull/73780) ([李扬](https://github.com/taiyang-li)).
* codec Gorilla のパラメータは、今後は常に .sql ファイル内のテーブルメタデータに保存されるようになりました。これにより、次の問題が解決されました: [#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 特定のデータレイク向けにパース処理を強化しました（Sequence ID のパース: マニフェストファイル内のシーケンス識別子を解析する機能を追加、Avro メタデータのパース: 将来の拡張に容易に対応できるよう Avro メタデータパーサーを再設計）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik))。
* `system.opentelemetry_span_log` のデフォルトの ORDER BY から trace&#95;id を削除。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 暗号化（属性 `encrypted_by`）を任意の設定ファイル（config.xml、users.xml、入れ子になった設定ファイル）に適用できるようになりました。以前は、最上位の config.xml ファイルに対してのみ有効でした。 [#75911](https://github.com/ClickHouse/ClickHouse/pull/75911) ([Mikhail Gorshkov](https://github.com/mgorshkov)).
* `system.warnings` テーブルを改善し、追加・更新・削除が可能な動的な警告メッセージをいくつか導入しました。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc)).
* このPRにより、クエリ `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES` は実行できなくなります。すべての `DROP` 操作は順序上、先に記述しなければならないためです。 [#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit))。
* SYNC REPLICA に対するさまざまな改善（エラーメッセージの改善、テストの強化、健全性チェックの追加）。[#76307](https://github.com/ClickHouse/ClickHouse/pull/76307)（[Azat Khuzhin](https://github.com/azat)）。
* バックアップ中に `Access Denied` によって S3 へのマルチパートコピーが失敗した場合に、適切なフォールバックを行うようにしました。異なる認証情報を持つバケット間でバックアップを行うと、マルチパートコピーで `Access Denied` エラーが発生することがあります。 [#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368))。
* `librdkafka`（ひどい代物）をバージョン 2.8.0 にアップグレードしました（ひどさは全く改善されていません）。また、Kafka テーブルのシャットダウン手順を改善し、テーブル削除やサーバー再起動時の待ち時間を短縮しました。`engine=Kafka` は、テーブルが削除された際にコンシューマグループを明示的に離脱しなくなりました。その代わり、コンシューマは `session_timeout_ms`（デフォルト: 45 秒間の非アクティブ状態）経過後に自動的に削除されるまでグループ内に留まります。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* S3 リクエスト設定の検証を修正。 [#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar))。
* `server_settings` や `settings` といったシステムテーブルには、便利な `default` 値カラムがあります。同様のカラムを `merge_tree_settings` と `replicated_merge_tree_settings` に追加しました。 [#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie)).
* `CurrentMetrics::QueryPreempted` と同様のロジックを持つ `ProfileEvents::QueryPreempted` を追加しました。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu)).
* 以前は、Replicated データベースがクエリで指定された認証情報をログに出力してしまうことがありました。この挙動は修正されました。これにより次の課題がクローズされます: [#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `plain_rewritable` ディスクで ALTER TABLE DROP PARTITION が利用可能になりました。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* バックアップ/リストア設定 `allow_s3_native_copy` は、現在 3 つの値をサポートします: - `False` - S3 のネイティブコピーは使用しない。 - `True`（以前のデフォルト）- ClickHouse はまず S3 のネイティブコピーを試し、失敗した場合は読み取り＋書き込み方式にフォールバックする。 - `'auto'`（新しいデフォルト）- ClickHouse はまずソースとデスティネーションのクレデンシャルを比較する。同じであれば、ClickHouse は S3 のネイティブコピーを試し、その後に読み取り＋書き込み方式へフォールバックする場合がある。異なる場合、ClickHouse は最初から読み取り＋書き込み方式を使用する。[#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* DeltaLake テーブルエンジン向けの Delta Kernel で、AWS セッショントークンおよび環境クレデンシャルの利用をサポートしました。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 非同期分散 `INSERT` の保留中バッチを処理する際に、（`No such file or directory` などにより）処理が停止したまま進行しなくなる問題を修正しました。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* インデックス解析時の暗黙的な `Date` から `DateTime` への変換に対して飽和動作を強制することで、日時変換を改善しました。これにより、日時範囲の制限によって発生し得たインデックス解析の不正確さが解消されます。この変更により [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307) が修正されています。また、デフォルト値である `date_time_overflow_behavior = 'ignore'` 設定時の明示的な `toDateTime` 変換も修正しました。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* UUID とテーブル名の競合によって発生するあらゆる種類のバグを修正します（たとえば、`RENAME` と `RESTART REPLICA` の競合を修正します。`SYSTEM RESTART REPLICA` と同時に `RENAME` を実行すると、誤ったレプリカを再起動してしまったり、あるいは/または、一部のテーブルが `Table X is being restarted` という状態のまま残ってしまう可能性があります）。 [#76308](https://github.com/ClickHouse/ClickHouse/pull/76308) ([Azat Khuzhin](https://github.com/azat)).
* `async insert` を有効化し、不等なブロックサイズで `insert into ... from file ...` を実行した際に発生するデータ欠損を修正。最初のブロックサイズが `async_max_size` 未満で、2 番目のブロックサイズが `async_max_size` を超える場合、2 番目のブロックが挿入されず、これらのデータが `squashing` に残ってしまう問題を修正。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* `system.data_skipping_indices` 内のフィールド &#39;marks&#39; を &#39;marks&#95;bytes&#39; に名前変更しました。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* 削除処理中に予期しないエラーが発生した場合の動的ファイルシステムキャッシュのリサイズ処理を修正します。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列ハッシュにおける `used_flag` の初期化を修正しました。これが原因でサーバーがクラッシュする可能性がありました。 [#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat))。
* プロジェクション内で `defaultProfiles` 関数を呼び出した際に発生する論理エラーを修正しました。 [#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit)).
* Web UI ではブラウザでインタラクティブな `basic auth` を要求しないようにしました。 [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319) をクローズ。 [#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 分散テーブルから boolean リテラルを選択した際に発生する THERE&#95;IS&#95;NO&#95;COLUMN 例外を修正。 [#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* テーブルディレクトリ内のサブパスの選択方法が、より高度なものになりました。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik))。
* サブカラムを含む PK を持つテーブルを ALTER した後に発生するエラー `Not found column in block` を修正しました。[https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 以降、この修正には [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403) が必要です。 [#76686](https://github.com/ClickHouse/ClickHouse/pull/76686) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* null shortcircuit のパフォーマンステストを追加し、バグを修正。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li)).
* 出力の書き込みバッファをファイナライズする前にフラッシュするようにしました。いくつかの出力フォーマット（例: `JSONEachRowWithProgressRowOutputFormat`）のファイナライズ時に発生していた `LOGICAL_ERROR` を修正しました。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* MongoDB の binary UUID をサポートしました ([#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)) - テーブル関数使用時の MongoDB への WHERE 句プッシュダウンを修正しました ([#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)) - MongoDB と ClickHouse 間の型マッピングを変更し、MongoDB の binary UUID は ClickHouse の UUID にのみパースされるようにしました。これにより、将来のあいまいさや予期せぬ挙動を回避できます。- 互換性を維持したまま OID マッピングを修正しました。 [#76762](https://github.com/ClickHouse/ClickHouse/pull/76762) ([Kirill Nikiforov](https://github.com/allmazz)).
* JSON サブカラムの並列プレフィックス・デシリアライズにおける例外処理を修正しました。 [#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar)).
* 負の整数に対する `lgamma` 関数の挙動を修正。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 明示的に定義された primary key に対する reverse key 解析を修正。 [#76654](https://github.com/ClickHouse/ClickHouse/issues/76654) と類似。 [#76846](https://github.com/ClickHouse/ClickHouse/pull/76846) ([Amos Bird](https://github.com/amosbird))。
* JSON フォーマットでの Bool 値の整形表示を修正。 [#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 非同期挿入中のエラー時に、`JSON` カラムのロールバック処理の不具合が原因でクラッシュする可能性があった問題を修正。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前は、`multiIf` がプランニング時と本実行時で異なる型のカラムを返す場合がありました。その結果、C++ の観点から見ると未定義動作を引き起こしうるコードが生成されていました。 [#76914](https://github.com/ClickHouse/ClickHouse/pull/76914) ([Nikita Taranov](https://github.com/nickitat))。
* MergeTree における定数の `Nullable` キーの誤ったシリアル化を修正しました。これにより [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939) が修正されます。 [#76985](https://github.com/ClickHouse/ClickHouse/pull/76985) ([Amos Bird](https://github.com/amosbird)).
* `BFloat16` の値のソートを修正しました。[#75487](https://github.com/ClickHouse/ClickHouse/issues/75487) をクローズします。[#75669](https://github.com/ClickHouse/ClickHouse/issues/75669) をクローズします。 [#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パート整合性チェックで短命なサブカラムをスキップするためのチェックを追加し、`Variant` サブカラムを含む `JSON` のバグを修正。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* `Values` フォーマットで、型の不一致によりテンプレート解析がクラッシュする問題を修正。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 主キーにサブカラムを含む `EmbeddedRocksDB` テーブルの作成を許可しないようにしました。以前はそのようなテーブルを作成できましたが、`SELECT` クエリが失敗していました。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar)).
* リテラル型が考慮されないまま述語がリモートにプッシュダウンされていたために発生していた、分散クエリでの不正な比較を修正しました。 [#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94)).
* 例外発生時に Kafka テーブル作成がクラッシュする問題を修正。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar)).
* Kafka および RabbitMQ エンジンで JSON とサブカラムをサポートしました。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* MacOS における例外スタックの巻き戻し処理を修正。[#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* getSubcolumn 関数での `null` サブカラムの読み取りを修正。 [#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar)).
* Array と未サポートの関数に対する bloom filter インデックスを修正。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル数に対する制限は、最初の `CREATE` クエリ実行時にのみチェックするようにしました。 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique))。
* バグではありません: `SELECT toBFloat16(-0.0) == toBFloat16(0.0)` は、これまで `false` を返していましたが、現在は正しく `true` を返します。これにより、`Float32` および `Float64` と挙動が一致するようになりました。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 初期化されていない `key_index` 変数への誤った参照が発生する可能性のある問題を修正しました。これはデバッグビルドでクラッシュを引き起こす可能性があります（この未初期化参照は、その後のコードがエラーをスローする可能性が高いため、リリースビルドでは問題を引き起こしません）。### ユーザー向け変更のためのドキュメント項目。[#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear))。
* Bool 値を持つパーティションの名前付けを修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) で不具合が発生していました。 [#77319](https://github.com/ClickHouse/ClickHouse/pull/77319) ([Pavel Kruglov](https://github.com/Avogar))。
* 内部要素が Nullable のタプルと文字列との比較を修正しました。たとえば、この変更前は、タプル `(1, null)` と文字列 `'(1,null)'` の比較はエラーになっていました。別の例としては、`a` が Nullable カラムであるタプル `(1, a)` と文字列 `'(1, 2)'` の比較が挙げられます。この変更により、これらの問題が解消されます。 [#77323](https://github.com/ClickHouse/ClickHouse/pull/77323) ([Alexey Katsman](https://github.com/alexkats)).
* ObjectStorageQueueSource のクラッシュを修正。 [https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) で導入された不具合。 [#77325](https://github.com/ClickHouse/ClickHouse/pull/77325) ([Pavel Kruglov](https://github.com/Avogar))。
* `input` と併用した `async_insert` を修正。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修正: ソート列がプランナーによって削除された場合に、`WITH FILL` が NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK エラーで失敗する可能性がある問題を修正しました。INTERPOLATE 式に対して計算される DAG が不整合になることに関連した、類似の問題も修正しました。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 無効な AST ノードにエイリアスを設定する際に発生していた複数の `LOGICAL_ERROR` を修正。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* `filesystem cache` の実装において、ファイルセグメント書き込み時のエラー処理を修正しました。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DatabaseIceberg がカタログから提供される正しいメタデータファイルを使用するようにしました。 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) をクローズ。 [#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `query cache` は、`UDF` を非決定的であると見なすようになりました。これに伴い、`UDF` を含むクエリの結果はキャッシュされなくなりました。以前は、結果が誤ってキャッシュされてしまう非決定的な `UDF` をユーザーが定義できていました（issue [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `enable_filesystem_cache_log` 設定が有効な場合にしか動作していなかった system.filesystem&#95;cache&#95;log を修正しました。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 射影内で `defaultRoles` 関数を呼び出す際に発生する論理エラーを修正しました。[#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) のフォローアップです。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 関数 `arrayResize` の第 2 引数として `Nullable` 型を指定することは、現在は許可されていません。これまでは、第 2 引数として `Nullable` を使用すると、エラーの発生から誤った結果の生成まで、さまざまな問題が起こり得ました。(issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)). [#77724](https://github.com/ClickHouse/ClickHouse/pull/77724) ([Manish Gill](https://github.com/mgill25)).
* 操作が書き込み対象のブロックを一切生成しない場合でも、マージおよびミューテーションがキャンセルされていないかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。

#### ビルド/テスト/パッケージングの改善

- `clickhouse-odbc-bridge`と`clickhouse-library-bridge`を別リポジトリ https://github.com/ClickHouse/odbc-bridge/ に移動しました。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Rustのクロスコンパイルを修正し、Rustを完全に無効化できるようにしました。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouseリリース 25.2、2025-02-27 {#252}

#### 後方互換性のない変更

- `async_load_databases`をデフォルトで完全に有効化しました(`config.xml`をアップグレードしないインストールでも有効)。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat))。
- `JSONCompactEachRowWithProgress`および`JSONCompactStringsEachRowWithProgress`フォーマットを追加しました。[#69989](https://github.com/ClickHouse/ClickHouse/issues/69989)の続きです。`JSONCompactWithNames`と`JSONCompactWithNamesAndTypes`は「totals」を出力しなくなりました - これは実装上の誤りだったようです。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- ALTERコマンドリストを明確にするため、`format_alter_operations_with_parentheses`のデフォルトをtrueに変更しました(https://github.com/ClickHouse/ClickHouse/pull/59532 を参照)。これにより24.3より前のクラスタとのレプリケーションが破損します。古いリリースを使用しているクラスタをアップグレードする場合は、サーバー設定でこの設定を無効にするか、まず24.3にアップグレードしてください。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano))。
- 正規表現を使用したログメッセージのフィルタリング機能を削除しました。実装にデータ競合が発生していたため、削除する必要がありました。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 設定`min_chunk_bytes_for_parallel_parsing`はゼロに設定できなくなりました。これにより[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)が修正されます。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- キャッシュ設定内の設定を検証するようにしました。以前は存在しない設定は無視されていましたが、現在はエラーがスローされるため、削除する必要があります。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii))。


#### 新機能
* `Nullable(JSON)` 型をサポートしました。[#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar)).
* DEFAULT および MATERIALIZED 式でサブカラムをサポートしました。[#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar)).
* `output_format_parquet_write_bloom_filter` 設定（デフォルトで有効）を使用した Parquet Bloom フィルタの書き込みをサポートしました。[#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321)).
* Web UI にインタラクティブなデータベースナビゲーションが追加されました。[#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ストレージポリシー内で、読み取り専用ディスクと読み書き可能ディスクを組み合わせて使用できるようになりました（複数ボリュームまたは複数ディスクとして構成可能）。これにより、ボリューム全体からデータを読み取ることができる一方で、挿入は書き込み可能なディスクが優先されます（いわゆる Copy-on-Write ストレージポリシー）。[#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat)).
* 新しい Database エンジン `DatabaseBackup` を追加しました。これにより、バックアップからテーブル／データベースを即座に ATTACH できます。[#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal)).
* Postgres ワイヤプロトコルで prepared statement をサポートしました。[#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12)).
* データベースレイヤーを介さずにテーブルを ATTACH できるようにしました。これは、Web、S3 などの外部仮想ファイルシステム上にある MergeTree テーブルに便利です。[#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat)).
* 新しい文字列比較関数 `compareSubstrings` を追加しました。2 つの文字列の一部を比較できます。例: `SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` は「1 つ目の文字列のオフセット 0、および 2 つ目の文字列のオフセット 5 から、それぞれ 6 バイト分の文字列 `'Saxon'` と `'Anglo-Saxon'` を辞書順で比較する」という意味です。[#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい関数 `initialQueryStartTime` を追加しました。現在のクエリの開始時刻を返します。分散クエリでは、すべてのシャードで同じ値になります。[#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik)).
* MySQL 向けに、named collection を使用した SSL 認証をサポートしました。[#59111](https://github.com/ClickHouse/ClickHouse/issues/59111) をクローズします。[#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 実験的機能
* 新しい設定 `enable_adaptive_memory_spill_scheduler` を追加しました。同一クエリ内の複数の Grace JOIN が、メモリ使用量の合計を監視し、MEMORY_LIMIT_EXCEEDED を防ぐために外部ストレージへのスピルを適応的にトリガーできるようにします。[#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい実験的な `Kafka` テーブルエンジンが Keeper の機能フラグを完全に尊重するようにしました。[#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ライセンス上の問題により v24.10 で削除されていた (Intel) QPL コーデックを復元しました。[#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* HDFS 連携向けに、`dfs.client.use.datanode.hostname` 設定オプションをサポートしました。[#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).



#### パフォーマンスの改善
* S3 上の Wide parts における JSON カラム全体の読み取りパフォーマンスを改善しました。サブカラムプレフィックスのデシリアライズに対するプリフェッチ、デシリアライズ済みプレフィックスのキャッシュ、サブカラムプレフィックスの並列デシリアライズを追加することで実現しています。これにより、`SELECT data FROM table` のようなクエリでは S3 からの JSON カラム読み取りが 4 倍、`SELECT data FROM table LIMIT 10` のようなクエリでは約 10 倍高速になります。 [#74827](https://github.com/ClickHouse/ClickHouse/pull/74827) ([Pavel Kruglov](https://github.com/Avogar)).
* `max_rows_in_join = max_bytes_in_join = 0` のときに `parallel_hash` で発生していた不要な競合を修正しました。 [#75155](https://github.com/ClickHouse/ClickHouse/pull/75155) ([Nikita Taranov](https://github.com/nickitat)).
* オプティマイザによって結合の左右が入れ替えられた場合に、`ConcurrentHashJoin` で二重に事前確保が行われていた問題を修正しました。 [#75149](https://github.com/ClickHouse/ClickHouse/pull/75149) ([Nikita Taranov](https://github.com/nickitat)).
* 一部の JOIN シナリオでわずかな改善を行いました。出力行数を事前に計算し、その分のメモリを予約するようにしました。 [#75376](https://github.com/ClickHouse/ClickHouse/pull/75376) ([Alexander Gololobov](https://github.com/davenger)).
* `WHERE a < b AND b < c AND c < 5` のようなクエリに対して、フィルタ性能を高めるために、新しい比較条件（`a < 5 AND b < 5`）を推論できるようにしました。 [#73164](https://github.com/ClickHouse/ClickHouse/pull/73164) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の改善: パフォーマンス向上のため、インメモリストレージへコミットする際のダイジェスト計算を無効化しました。これは `keeper_server.digest_enabled_on_commit` 設定で有効化できます。リクエストの前処理時には引き続きダイジェストを計算します。 [#75490](https://github.com/ClickHouse/ClickHouse/pull/75490) ([Antonio Andelic](https://github.com/antonio2368)).
* 可能な場合、JOIN の ON 句からフィルタ式をプッシュダウンするようにしました。 [#75536](https://github.com/ClickHouse/ClickHouse/pull/75536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTree において、カラムおよびインデックスサイズを遅延計算するようにしました。 [#75938](https://github.com/ClickHouse/ClickHouse/pull/75938) ([Pavel Kruglov](https://github.com/Avogar)).
* `MATERIALIZE TTL` で `ttl_only_drop_parts` 設定が再び尊重されるようにしました。TTL を再計算して空のパーツに置き換えることでパーツを削除する際に、必要なカラムのみを読み取るようにしています。 [#72751](https://github.com/ClickHouse/ClickHouse/pull/72751) ([Andrey Zvonov](https://github.com/zvonand)).
* plain_rewritable メタデータファイルの書き込みバッファサイズを削減しました。 [#75758](https://github.com/ClickHouse/ClickHouse/pull/75758) ([Julia Kartseva](https://github.com/jkartseva)).
* 一部のウィンドウ関数のメモリ使用量を削減しました。 [#65647](https://github.com/ClickHouse/ClickHouse/pull/65647) ([lgbo](https://github.com/lgbo-ustc)).
* Parquet の Bloom filter と min/max インデックスを同時に評価するようにしました。これは、data = [1, 2, 4, 5] のときに `x = 3 or x > 5` を正しくサポートするために必要です。 [#71383](https://github.com/ClickHouse/ClickHouse/pull/71383) ([Arthur Passos](https://github.com/arthurpassos)).
* `Executable` ストレージに渡されるクエリは、もはや単一スレッド実行に制限されません。 [#70084](https://github.com/ClickHouse/ClickHouse/pull/70084) ([yawnt](https://github.com/yawnt)).
* ALTER TABLE FETCH PARTITION において、パーツを並列に取得するようにしました（スレッドプールのサイズは `max_fetch_partition_thread_pool_size` で制御されます）。 [#74978](https://github.com/ClickHouse/ClickHouse/pull/74978) ([Azat Khuzhin](https://github.com/azat)).
* `indexHint` 関数を用いた述語を `PREWHERE` へ移動できるようにしました。 [#74987](https://github.com/ClickHouse/ClickHouse/pull/74987) ([Anton Popov](https://github.com/CurtizJ)).



#### 改善

* `LowCardinality` 列のメモリ使用サイズの計算を修正しました。 [#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat)).
* `processors_profile_log` テーブルに、TTL が 30 日のデフォルト設定が追加されました。 [#66139](https://github.com/ClickHouse/ClickHouse/pull/66139) ([Ilya Yatsishin](https://github.com/qoega))。
* クラスタ設定でシャードに名前を付けられるようになりました。[#72276](https://github.com/ClickHouse/ClickHouse/pull/72276)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* Prometheus の remote write レスポンスの成功ステータスを 200/OK から 204/NoContent に変更しました。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* `max_remote_read_network_bandwidth_for_serve` および `max_remote_write_network_bandwidth_for_server` を、サーバーを再起動することなく動的に再読み込みできるようにしました。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* バックアップ作成時にチェックサムの計算に blob パスを使用できるようにしました。 [#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.query_cache` にクエリ ID 列を追加しました（[#68205](https://github.com/ClickHouse/ClickHouse/issues/68205) をクローズ）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* `ALTER TABLE ... FREEZE ...` クエリを `KILL QUERY` で、またはタイムアウト（`max_execution_time`）により自動的にキャンセルできるようになりました。 [#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar)).
* `SimpleAggregateFunction` として `groupUniqArrayArrayMap` をサポートしました。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* データベースエンジン `Iceberg` でカタログ認証情報の設定を非表示にしました。 [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559) をクローズ。[#75080](https://github.com/ClickHouse/ClickHouse/pull/75080)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `intExp2` / `intExp10`: 未定義の動作を明確化: 引数が小さすぎる場合は 0 を返し、大きすぎる場合は `18446744073709551615` を返し、`nan` の場合は例外をスローします。 [#75312](https://github.com/ClickHouse/ClickHouse/pull/75312) ([Vitaly Baranov](https://github.com/vitlibar)).
* `DatabaseIceberg` のカタログ設定から `s3.endpoint` をネイティブにサポートしました。 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558) をクローズ。 [#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ユーザーが `SYSTEM DROP REPLICA` を実行する際に十分な権限を持っていない場合に、エラーを黙って握りつぶさないようにしました。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc)).
* いずれかの `system` ログがフラッシュに失敗した回数を記録する `ProfileEvent` を追加。 [#75466](https://github.com/ClickHouse/ClickHouse/pull/75466) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 復号および解凍処理のチェックと追加ログ出力を行うようにしました。 [#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* `parseTimeDelta` 関数でマイクロ記号 (U+00B5) をサポートしました。これにより、マイクロ記号 (U+00B5) とギリシャ文字ミュー (U+03BC) の両方がマイクロ秒の有効な表現として認識されるようになり、ClickHouse の動作が Go の実装（[time.go を参照](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) および [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）と整合するようになりました。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* サーバー設定（`send_settings_to_client`）を、クライアント側コード（例: `INSERT` データのパースやクエリ結果の整形）がサーバーの `users.xml` およびユーザープロファイルの設定を使用するかどうかを制御するクライアント設定（`apply_settings_from_server`）に置き換えました。この設定を有効にしない場合、クライアントのコマンドライン、セッション、およびクエリで指定された設定のみが使用されます。これはネイティブクライアントにのみ適用され（HTTP などには適用されず）、クエリ処理の大部分（サーバー側で実行される部分）には適用されない点に注意してください。 [#75478](https://github.com/ClickHouse/ClickHouse/pull/75478) ([Michael Kolupaev](https://github.com/al13n321)).
* 構文エラーに対するエラーメッセージを改善しました。以前は、クエリが大きすぎて、長さが制限を超えるトークンが非常に大きな文字列リテラルだった場合、その原因を説明するメッセージが、この非常に長いトークンの 2 つの例の間に埋もれて失われていました。エラーメッセージ内で UTF-8 を含むクエリが正しくない位置で切り詰められていた問題を修正しました。クエリ断片の過剰な引用を修正しました。これにより [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473) がクローズされました。 [#75561](https://github.com/ClickHouse/ClickHouse/pull/75561) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ストレージ `S3(Azure)Queue` にプロファイルイベントを追加しました。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 互換性のため、サーバーからクライアントへの設定送信（`send_settings_to_client=false`）を無効化しました（この機能は、今後の使いやすさ向上のため、クライアント側の設定として再実装される予定です）。 [#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321)).
* バックグラウンドスレッドで定期的に読み取られる複数のソースからの情報を使って、内部メモリトラッカーを補正できるようにする設定 `memory_worker_correct_memory_tracker` を追加しました。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* `normalized_query_hash` カラムを `system.processes` に追加しました。注: `normalizedQueryHash` 関数を使えばその場で容易に計算できますが、後続の変更に備えるために追加されています。 [#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `system.tables` をクエリしても、既に存在しないデータベース上に作成された `Merge` テーブルがあっても例外はスローされません。複雑な処理を行うことを許可していないため、`Hive` テーブルから `getTotalRows` メソッドを削除しました。 [#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* バックアップの `start_time` / `end_time` をマイクロ秒単位で保存するようにしました。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* RSS による補正が行われていない内部グローバルメモリトラッカーの値を示す `MemoryTrackingUncorrected` メトリクスを追加しました。 [#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368))。
* `PostgreSQL` または `MySQL` テーブル関数で `localhost:1234/handle` のようなエンドポイントをパースできるようにしました。これは [https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) によって発生したリグレッションを修正します。 [#75944](https://github.com/ClickHouse/ClickHouse/pull/75944) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* サーバー設定 `throw_on_unknown_workload` を追加し、`workload` 設定に未知の値が指定されたクエリに対する挙動を選択できるようにしました。無制限のアクセスを許可する（デフォルト）か、`RESOURCE_ACCESS_DENIED` エラーをスローするかを選択できます。これは、すべてのクエリでワークロードスケジューリングの利用を強制したい場合に有用です。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa)).
* 不要な場合は、`ARRAY JOIN` 内のサブカラムを `getSubcolumn` に書き換えないようにしました。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar))。
* テーブル読み込み時の再試行におけるコーディネーションエラーを修正。 [#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `SYSTEM FLUSH LOGS` で個別のログをフラッシュできるようにしました。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* `/binary` サーバーのページを改善しました。Morton 曲線ではなく Hilbert 曲線を使用します。正方形内に 512 MB 分のアドレスを表示し、正方形全体をよりよく埋めるようにしました（以前のバージョンでは、アドレスは正方形の半分しか埋めていませんでした）。関数名ではなく、ライブラリ名に基づいてアドレスの色分けを行います。領域の外側にも、少し余裕をもってスクロールできるようにしました。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `TOO_MANY_SIMULTANEOUS_QUERIES` が発生した場合に `ON CLUSTER` クエリを再試行するようにしました。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu))。
* サーバーの相対的な CPU 不足を算出する非同期メトリクス `CPUOverload` を追加しました。 [#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `output_format_pretty_max_rows` のデフォルト値を 10000 から 1000 に変更しました。こちらの方が使い勝手が良いと考えています。[#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* クエリの解釈中に例外が発生した場合、クエリで指定されたカスタムフォーマットで例外が出力されるように修正しました。以前のバージョンでは、クエリで指定されたフォーマットではなく、デフォルトフォーマットでフォーマットされていました。これにより [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422) が解決されました。 [#74994](https://github.com/ClickHouse/ClickHouse/pull/74994)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SQLite の型マッピングを修正（整数型を `int64` に、浮動小数点型を `float64` に対応）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x)).
* 親スコープからの識別子解決を修正。`WITH` 句内で式に対するエイリアスの使用を許可。[#58994](https://github.com/ClickHouse/ClickHouse/issues/58994) を修正。[#62946](https://github.com/ClickHouse/ClickHouse/issues/62946) を修正。[#63239](https://github.com/ClickHouse/ClickHouse/issues/63239) を修正。[#65233](https://github.com/ClickHouse/ClickHouse/issues/65233) を修正。[#71659](https://github.com/ClickHouse/ClickHouse/issues/71659) を修正。[#71828](https://github.com/ClickHouse/ClickHouse/issues/71828) を修正。[#68749](https://github.com/ClickHouse/ClickHouse/issues/68749) を修正。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* `negate` 関数の単調性を修正しました。以前のバージョンでは、`x` が主キーである場合、クエリ `select * from a where -x = -42;` が誤った結果を返す可能性がありました。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321)).
* arrayIntersect における空タプルの処理を修正しました。これにより [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578) が解決されます。 [#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 誤ったプレフィックスを持つ JSON サブオブジェクトのサブカラムの読み取りを修正。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* クライアントとサーバー間の通信で、Native フォーマットの設定が正しく伝播されるようにしました。 [#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部のストレージでサポートされていない型をチェックするようにしました。 [#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS 上の PostgreSQL インターフェース経由で実行した `INSERT INTO SELECT` クエリによるクラッシュを修正しました（issue [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* レプリケーテッドデータベースで初期化されていなかった `max_log_ptr` を修正しました。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov)).
* interval を挿入した際にクラッシュする不具合を修正しました（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。 [#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 定数 JSON リテラルのフォーマットを修正しました。以前は、クエリを別のサーバーに送信する際に構文エラーが発生する可能性がありました。[#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 定数パーティション式を使用していて暗黙的プロジェクションが有効な場合に、`CREATE` クエリが失敗する問題を修正しました。これにより [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596) が修正されます。 [#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird))。
* `INSERT` が例外で終了した後に、接続が異常な状態のまま残らないようにしました。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 中間状態のまま残された接続を再利用しないようにしました。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat)).
* 型名が大文字でない場合に JSON 型宣言のパース中に発生するクラッシュを修正。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper: 接続が確立される前に切断された場合に発生する logical&#95;error を修正。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* `AzureBlobStorage` を使用しているテーブルがある場合にサーバーが起動できなかった問題を修正しました。テーブルは Azure へのリクエストを送信せずにロードされます。 [#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* BACKUP および RESTORE 操作において、`query_log` の `used_privileges` および `missing_privileges` フィールドが記録されない問題を修正。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* HDFS の select リクエスト中に SASL エラーが発生した場合、HDFS の Kerberos チケットを更新します。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* startup&#95;scripts 内の Replicated データベースへのクエリを修正しました。 [#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat)).
* NULL セーフ比較が使用されている場合に、`JOIN ON` 句内で型エイリアスが付けられた式に関する問題を修正しました。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir))。
* remove 操作が失敗した場合に、part の状態を deleting から outdated に戻すようにしました。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 以前のバージョンでは、スカラー副問い合わせが存在する場合、副問い合わせの処理で蓄積された進捗の書き込みをデータ形式の初期化中に開始しており、これは HTTP ヘッダが書き込まれる前でした。その結果、X-ClickHouse-QueryId や X-ClickHouse-Format、さらに Content-Type といった HTTP ヘッダが出力されない問題が発生していました。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `database_replicated_allow_replicated_engine_arguments=0` の場合の `CREATE TABLE AS...` クエリを修正。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc)).
* INSERT の例外発生後にクライアント側で接続が不正な状態のまま残ってしまう問題を修正。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* PSQL レプリケーションで未処理の例外により発生するクラッシュを修正。 [#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* Sasl が任意の RPC 呼び出しで失敗する可能性があり、krb5 チケットの有効期限が切れている場合に呼び出しを再試行できるようにする修正です。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* `optimize_function_to_subcolumns` 設定が有効な場合に、`Array`、`Map`、`Nullable(..)` 列に対するインデックス（プライマリおよびセカンダリ）の利用方法を修正しました。以前は、これらの列に対するインデックスが無視されることがありました。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 内部テーブルを持つマテリアイズドビューを作成する際には、そのようにフラット化されたカラムは使用できないため、`flatten_nested` を無効にします。 [#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm))。
* 一部の IPv6 アドレス（::ffff:1.1.1.1 など）が `forwarded_for` フィールドで誤って解釈され、その結果クライアントが例外とともに切断されてしまう問題を修正しました。 [#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* LowCardinality Nullable データ型に対する nullsafe JOIN の処理を修正しました。これまで、`IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b` のような nullsafe な比較を使った JOIN ON は、LowCardinality カラムに対して正しく動作していませんでした。 [#75143](https://github.com/ClickHouse/ClickHouse/pull/75143) ([Vladimir Cherkasov](https://github.com/vdimir)).
* NumRowsCache の total&#95;number&#95;of&#95;rows をカウントする際に key&#95;condition を指定していないことを検証します。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 新しいアナライザーで、未使用の補間を含むクエリを修正しました。 [#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* INSERT を伴う CTE におけるクラッシュバグを修正。[#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の修正: ログをロールバックする際に、破損した changelog へ書き込まないようにしました。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 適切な箇所では `BFloat16` をスーパータイプとして使用するようにしました。これにより次の課題がクローズされました: [#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* any&#95;join&#95;distinct&#95;right&#95;table&#95;keys と JOIN ON 句内の OR を併用した場合に、結合結果に予期しないデフォルト値が入ってしまう問題を修正しました。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* azureblobstorage テーブルエンジンの認証情報をマスクするようにしました。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* ClickHouse が PostgreSQL、MySQL、SQLite などの外部データベースに対して、フィルタープッシュダウンを誤って行ってしまう可能性があった動作を修正しました。これにより次の Issue がクローズされます: [#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* Protobuf 形式での出力中に、並列クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` によって発生する可能性がある Protobuf スキーマキャッシュのクラッシュを修正しました。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* `HAVING` からのフィルタが parallel replicas への push down により発生し得る論理エラーまたは未初期化メモリの問題を修正しました。 [#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `icebergS3`、`icebergAzure` テーブル関数およびテーブルエンジンの機密情報を非表示にします。 [#75378](https://github.com/ClickHouse/ClickHouse/pull/75378) ([Kseniia Sumarokova](https://github.com/kssenii)).
* トリム対象文字が計算の結果として空文字列になる場合の関数 `TRIM` の動作が、正しく処理されるようになりました。例: `SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* IOutputFormat のデータレースを修正。 [#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 分散テーブルに対する JOIN で Array 型の JSON サブカラムが使用されている場合に発生する可能性のあるエラー `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes` を修正。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* `CODEC(ZSTD, DoubleDelta)` に起因するデータ破損を修正。[#70031](https://github.com/ClickHouse/ClickHouse/issues/70031) をクローズ。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* allow&#95;feature&#95;tier と compatibility mergetree 設定の相互作用を修正。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルが再試行された場合に `system.s3queue_log` の `processed_rows` 値が誤っていた問題を修正。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マテリアライズドビューが URL エンジンに書き込みを行っており、接続の問題が発生している場合に、`materialized_views_ignore_errors` が尊重されるようにしました。 [#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm)).
* 異なる型の列同士で `alter_sync = 0` を指定した複数の非同期 `RENAME` クエリを実行した後に、`MergeTree` テーブルから読み込む際にまれに発生していたクラッシュを修正しました。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の `UNION ALL` を含むクエリで発生する `Block structure mismatch in QueryPipeline stream` エラーを修正。 [#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* PK 列を `ALTER MODIFY` した際に、その列を PK に使用している Projection を再構築するようにしました。以前は、Projection の PK に使用されている列に対して `ALTER MODIFY` を行った後の `SELECT` 実行時に `CANNOT_READ_ALL_DATA` エラーが発生する可能性がありました。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* アナライザー使用時にスカラサブクエリに対する `ARRAY JOIN` が誤った結果を返す問題を修正。[#75732](https://github.com/ClickHouse/ClickHouse/pull/75732)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `DistinctSortedStreamTransform` におけるヌルポインタ参照の不具合を修正しました。 [#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* `allow_suspicious_ttl_expressions` の動作を修正。[#75771](https://github.com/ClickHouse/ClickHouse/pull/75771)（[Aleksei Filatov](https://github.com/aalexfvk)）。
* 関数 `translate` における未初期化メモリの読み取りを修正しました。これにより [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592) がクローズされます。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Native` フォーマットで JSON を文字列整形する際に、フォーマット設定が反映されるようにしました。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* v24.12 で結合アルゴリズムとして並列ハッシュがデフォルトで有効化されることを、設定変更履歴に記録しました。これは、互換性レベルに v24.12 より古いバージョンが設定されている場合、ClickHouse は引き続き非並列ハッシュで結合を行うことを意味します。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze)).
* 暗黙的に追加された min-max インデックスを持つテーブルを新しいテーブルにコピーできない不具合を修正しました（issue [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。 [#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` はファイルシステムから任意のライブラリを開くことができるため、隔離された環境内でのみ実行することが安全です。`clickhouse-server` と同一環境付近で実行される際の脆弱性を防ぐために、設定で指定された場所にあるライブラリへのパスに制限します。この脆弱性は **Arseniy Dugin** によって [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) を通じて発見されました。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* あるメタデータに対して JSON シリアライゼーションを利用してしまいましたが、これは誤りでした。JSON は文字列リテラル内のバイナリデータ（ゼロバイトを含む）をサポートしないためです。SQL クエリにはバイナリデータや不正な UTF-8 が含まれ得るので、メタデータファイルでもこれをサポートする必要があります。同時に、ClickHouse の `JSONEachRow` や類似のフォーマットは、バイナリデータを完全にラウンドトリップできることを優先し、JSON 標準からあえて逸脱することでこの問題を回避しています。その背景となる動機については、こちらを参照してください: [https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解決策は、`Poco::JSON` ライブラリの挙動を、ClickHouse における JSON 形式のシリアライゼーションと整合させることです。これにより [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668) がクローズされます。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3Queue` におけるコミット制限チェックを修正。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 自動インデックス（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）付き MergeTree テーブルのアタッチ処理を修正。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* ジョブの親スレッドからのスタックトレース（`enable_job_stack_trace` 設定）が出力されない問題を修正しました。また、`enable_job_stack_trace` 設定がスレッドに正しく伝播されず、その結果としてスタックトレースの内容が常にこの設定に従っていなかった問題を修正しました。 [#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `ALTER RENAME` に `CREATE USER` 権限が必要となっていた誤った権限チェックを修正。[#74372](https://github.com/ClickHouse/ClickHouse/issues/74372) をクローズ。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* ビッグエンディアンアーキテクチャにおける `FixedString` への `reinterpretAs` を修正。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* S3Queue の論理エラー「Expected current processor {} to be equal to {} for bucket {}」を修正しました。 [#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Memory データベースに対する ALTER で発生するデッドロックを修正。 [#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句の条件に `pointInPolygon` 関数が含まれている場合のインデックス解析における論理エラーを修正。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ))。
* シグナルハンドラー内の潜在的に安全でない呼び出しを修正。 [#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* PartsSplitter の reverse key サポートを修正しました。これにより [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400) が解決されます。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### ビルド/テスト/パッケージングの改善

- ARMおよびIntel MacでのHDFSビルドをサポート。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
- Darwin向けクロスコンパイル時にICUとGRPCを有効化。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
- 組み込みLLVMを19に更新。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- Dockerイメージ内のデフォルトユーザーに対するネットワークアクセスを無効化。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。すべてのclickhouse-server関連のアクションを関数化し、`entrypoint.sh`でデフォルトバイナリを起動する際にのみ実行するように変更。この長らく延期されていた改善は[#50724](https://github.com/ClickHouse/ClickHouse/issues/50724)で提案されていたもの。`clickhouse-extract-from-config`に`--users`スイッチを追加し、`users.xml`から値を取得できるように変更。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- バイナリから約20MBのデッドコードを削除。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouseリリース25.1、2025-01-28 {#251}


#### 後方互換性のない変更
* `JSONEachRowWithProgress` は、進捗が発生するたびに進捗情報を書き出すようになりました。以前のバージョンでは、進捗は結果の各ブロックの後にのみ表示されており、実質的に役に立ちませんでした。進捗の表示方法も変更され、ゼロ値は表示されません。これにより [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800) がクローズされます。 [#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` テーブルは、列のユニオンと共通型の導出を用いて、基礎となるテーブル群の構造を統一します。これにより [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864) がクローズされます。特定のケースでは、この変更は後方互換性がない可能性があります。1 つの例として、テーブル間に共通の型が存在しないが、最初のテーブルの型への変換は可能な場合があります（たとえば UInt64 と Int64、または任意の数値型と String の組み合わせなど）。従来の動作に戻したい場合は、`merge_table_max_tables_to_look_for_schema_inference` を `1` に設定するか、`compatibility` を `24.12` 以前に設定してください。 [#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 出力フォーマットは、`Date` および `DateTime` 列を、生の数値として書き込むのではなく、Parquet がサポートする日付/時刻型に変換します。`DateTime` は `DateTime64(3)`（以前は `UInt32`）になります。設定 `output_format_parquet_datetime_as_uint32` を有効にすると、従来の動作に戻せます。`Date` は `Date32`（以前は `UInt16`）になります。 [#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* 既定では、`ORDER BY` や `less/greater/equal/etc` といった比較関数で、`JSON` / `Object` / `AggregateFunction` のような比較不可能な型は許可されなくなりました。 [#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 廃止されていた `MaterializedMySQL` データベースエンジンは削除され、利用できなくなりました。 [#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` ディクショナリソースは、もはや `SHOW TABLE STATUS` クエリを実行しません。これは、InnoDB テーブルおよび最近の MySQL バージョンではこの情報が有用ではないためです。これにより [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636) がクローズされます。この変更は後方互換性がありますが、気付いてもらえるよう、このセクションに記載しています。 [#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` クエリには、個別の `CHECK` 権限が必要になりました。以前のバージョンでは、これらのクエリを実行するには `SHOW TABLES` 権限だけで十分でした。しかし、`CHECK TABLE` クエリは高負荷になり得る一方で、通常の `SELECT` クエリに対するクエリ複雑性制限は適用されませんでした。その結果、DoS の可能性が生じていました。 [#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 関数 `h3ToGeo()` は、結果を（幾何関数の標準的な順序である）`(lat, lon)` の順序で返すようになりました。従来の `(lon, lat)` の結果順序を維持したいユーザーは、設定 `h3togeo_lon_lat_result_order = true` を指定できます。 [#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新しい MongoDB ドライバーがデフォルトになりました。従来のドライバーを引き続き使用したいユーザーは、サーバー設定 `use_legacy_mongodb_integration` を true に設定できます。 [#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。



#### 新機能

* `SELECT` クエリ送信直後の実行時に、未完了（バックグラウンド処理でマテリアライズされていない）の mutation を適用できる機能を追加しました。`apply_mutations_on_fly` を設定することで有効化できます。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* Iceberg において、時間関連の変換を用いるパーティション操作に対する `Iceberg` テーブルのパーティションプルーニングを実装しました。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik))。
* MergeTree のソートキーおよびスキップインデックスでサブカラムをサポート。 [#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* `Apache Arrow`/`Parquet`/`ORC` からの `HALF_FLOAT` 値の読み取りをサポートしました（`Float32` として読み取られます）。これにより [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960) がクローズされます。IEEE-754 の half float は `BFloat16` と同じではないことに注意してください。[#73835](https://github.com/ClickHouse/ClickHouse/issues/73835) もクローズします。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` テーブルに新たに `symbols` と `lines` の 2 つのカラムが追加され、シンボル化されたスタックトレースが保持されます。これにより、プロファイル情報を簡単に収集・エクスポートできるようになります。これは `trace_log` セクション内のサーバー設定値 `symbolize` によって制御され、デフォルトで有効になっています。 [#73896](https://github.com/ClickHouse/ClickHouse/pull/73896) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* テーブル内で連番を生成するために使用できる新しい関数 `generateSerialID` を追加しました。[kazalika](https://github.com/kazalika) による [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) の続きです。これにより [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485) がクローズされます。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* DDL クエリに `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN` という構文を追加しました。これは、副クエリ `{query1, query2, ... queryN}` を互いに並列で実行できる（また、その方が望ましい）ことを意味します。 [#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar)).
* 逆シリアル化された skipping index granule 用のインメモリキャッシュを追加しました。これにより、skipping index を使用する反復クエリの実行速度が向上するはずです。新しいキャッシュのサイズは、サーバー設定 `skipping_index_cache_size` と `skipping_index_cache_max_entries` で制御されます。このキャッシュを導入した主な目的はベクトル類似度インデックスであり、今回の変更によりこれらは大幅に高速化されました。 [#70102](https://github.com/ClickHouse/ClickHouse/pull/70102) ([Robert Schulze](https://github.com/rschu1ze))。
* これにより、組み込みの Web UI はクエリ実行中に進行状況バーを表示するようになりました。そこからクエリをキャンセルできます。合計レコード数と、処理速度に関する詳細な情報を表示します。データが到着し次第、テーブルを段階的にレンダリングできます。HTTP 圧縮を有効にしました。テーブルのレンダリングがより高速になりました。テーブルヘッダーが固定表示されるようになりました。セルを選択でき、矢印キーで移動できます。選択されたセルのアウトラインによってセルが小さくなる問題を修正しました。セルはマウスホバー時ではなく、選択されたときのみ拡大されるようになりました。受信データのレンダリングを停止するタイミングは、サーバー側ではなくクライアント側で決定されます。数値の桁区切りをハイライト表示します。全体的なデザインが刷新され、より太く力強い印象になりました。サーバーに到達可能かどうかと認証情報の正否を確認し、サーバーバージョンと稼働時間を表示します。クラウドアイコンは、Safari を含むあらゆるフォントで輪郭表示されます。ネストされたデータ型内の大きな整数は、より適切にレンダリングされます。`inf` / `nan` を正しく表示します。列ヘッダーにマウスカーソルを合わせたときにデータ型を表示します。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MergeTree によって管理されるカラムに対して、設定 `add_minmax_index_for_numeric_columns`（数値カラム用）および `add_minmax_index_for_string_columns`（文字列カラム用）を使用して、デフォルトで min-max（スキップ）インデックスを作成できる機能を追加しました。現時点では、どちらの設定も無効化されているため、動作に変更はありません。 [#74266](https://github.com/ClickHouse/ClickHouse/pull/74266) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* `system.query_log`、ネイティブプロトコルの ClientInfo、およびサーバーログに `script_query_number` と `script_line_number` フィールドを追加しました。これにより [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542) がクローズされます。この機能を以前に [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) で開始してくれた [pinsvin00](https://github.com/pinsvin00) に感謝します。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パターン内で最長のイベントチェーンに対して、一致したイベントのタイムスタンプを返す集約関数 `sequenceMatchEvents` を追加しました。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus)).
* 関数 `arrayNormalizedGini` を追加しました。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl)).
* `DateTime64` に対するマイナス演算子のサポートを追加し、`DateTime64` 同士および `DateTime` との減算を可能にしました。 [#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg)).



#### 実験的機能
* `BFloat16` データ型が本番運用で利用可能になりました。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### パフォーマンスの向上

* 関数 `indexHint` を最適化しました。これにより、関数 `indexHint` の引数としてのみ使用されている列はテーブルから読み取られなくなりました。 [#74314](https://github.com/ClickHouse/ClickHouse/pull/74314) ([Anton Popov](https://github.com/CurtizJ))。もし `indexHint` 関数がエンタープライズデータアーキテクチャの中核となっているのであれば、この最適化はまさに命綱になるでしょう。
* `parallel_hash` JOIN アルゴリズムにおける `max_joined_block_size_rows` 設定の扱いをより正確にしました。これにより、`hash` アルゴリズムと比べてメモリ消費量が増加してしまう状況を避けやすくなります。[#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* `MergingAggregated` ステップに対するクエリプランレベルでの述語プッシュダウン最適化をサポートしました。これにより、analyzer を使用する一部のクエリのパフォーマンスが向上します。 [#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `parallel_hash` JOIN アルゴリズムの probe フェーズから、左テーブルブロックをハッシュで分割する処理が削除されました。[#73089](https://github.com/ClickHouse/ClickHouse/pull/73089)（[Nikita Taranov](https://github.com/nickitat)）。
* RowBinary 入力フォーマットを最適化。 [#63805](https://github.com/ClickHouse/ClickHouse/issues/63805) をクローズ。 [#65059](https://github.com/ClickHouse/ClickHouse/pull/65059) ([Pavel Kruglov](https://github.com/Avogar)).
* `optimize_on_insert` が有効な場合、パーツをレベル 1 として書き込みます。これにより、新しく書き込まれたパーツに対する `FINAL` 付きクエリに、いくつかの最適化を適用できるようになります。 [#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* いくつかの低レベルな最適化により、文字列のデシリアライズを高速化しました。 [#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* マージ処理などでレコード間の等価比較を行う場合は、等しくない可能性が最も高いカラムから行の比較を始めてください。 [#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus)).
* Grace hash join のパフォーマンスを、右側の結合テーブルをキーで再ランキングすることで改善しました。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou))。
* `arrayROCAUC` と `arrayAUCPR` が曲線全体にわたる部分面積を計算できるようにし、その計算を巨大なデータセットに対して並列化できるようにしました。 [#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias)).
* アイドル状態のスレッドを過剰に生成しないようにしました。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* テーブル関数で中括弧展開のみを使用している場合は、blob ストレージキーを列挙しないようにしました。 [#73333](https://github.com/ClickHouse/ClickHouse/issues/73333) をクローズ。 [#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Nullable 引数に対して実行される関数の短絡最適化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li)).
* 非関数カラムには `maskedExecute` を適用せず、ショートサーキット実行のパフォーマンスを改善。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* パフォーマンスを向上させるため、`Kafka`/`NATS`/`RabbitMQ`/`FileLog` の入力フォーマットでヘッダーの自動検出を無効化しました。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat))。
* `GROUPING SETS` を用いた集約後に、より高い並列度でパイプラインを実行するようにしました。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* `MergeTreeReadPool` のクリティカルセクションを縮小しました。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* Parallel replicas のパフォーマンスを改善。parallel replicas プロトコルに関係しないパケットの query initiator 側でのデシリアライズは、常に pipeline スレッド内で行われるようになりました。以前は、pipeline のスケジューリングを担当するスレッドで実行されることがあり、その結果、initiator の応答性が低下し、pipeline の実行が遅延する可能性がありました。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter))。
* Keeper における大きな multi リクエストのパフォーマンスを改善。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* ログラッパーは値渡しで使用し、ヒープ上に割り当てないようにします。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* MySQL および Postgres の辞書レプリカへの接続をバックグラウンドで再確立し、対応する辞書へのリクエストを遅延させないようにしました。 [#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parallel replicas は、レプリカの可用性に関する過去の情報を利用してレプリカ選択を最適化していましたが、接続が確立できない場合にそのレプリカのエラー数を更新していませんでした。この PR により、利用不可の場合にレプリカのエラー数が更新されるようになりました。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi)).
* マージツリー設定 `materialize_skip_indexes_on_merge` が追加されました。この設定はマージ時のスキップインデックスの作成を抑制します。これにより、スキップインデックスをいつ作成するかをユーザーが（`ALTER TABLE [..] MATERIALIZE INDEX [...]` を使って）明示的に制御できるようになります。スキップインデックスの構築コストが高い場合（例：ベクトル類似度インデックス）に有用です。 [#74401](https://github.com/ClickHouse/ClickHouse/pull/74401) ([Robert Schulze](https://github.com/rschu1ze)).
* Storage(S3/Azure)Queue における Keeper リクエストを最適化。[#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* デフォルトで最大 `1000` 個の並列レプリカを使用するようになりました。 [#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* S3 ディスクからの読み取り時の HTTP セッション再利用を改善しました（[#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)）。[#74548](https://github.com/ClickHouse/ClickHouse/pull/74548)（[Julian Maicher](https://github.com/jmaicher)）。





#### 改善

* ENGINE が暗黙指定された CREATE TABLE クエリでの SETTINGS をサポートし、エンジン設定とクエリ設定を併用できるようにしました。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano))。
* `use_hive_partitioning` をデフォルトで有効にしました。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 異なるパラメータを持つ JSON 型同士での `CAST` および `ALTER` をサポートしました。 [#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON カラム値の等価比較をサポートしました。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar)).
* 不要なバッククォートを避けるために、JSON サブカラムを含む識別子のフォーマットを改善しました。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* インタラクティブメトリクスを改善。並列レプリカからのメトリクスが完全に表示されない問題を修正。メトリクスは最新の更新時刻順で、その後に名前の辞書順で表示する。期限切れのメトリクスは表示しない。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631) ([Julia Kartseva](https://github.com/jkartseva))。
* JSON の出力フォーマットをデフォルトで整形表示にします。これを制御するための新しい設定 `output_format_json_pretty_print` を追加し、デフォルトで有効にしました。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* デフォルトで `LowCardinality(UUID)` を許可するようにしました。これは ClickHouse Cloud の顧客にとって有用であることが確認されています。 [#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* インストール時に表示されるメッセージを改善。 [#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ClickHouse Cloud のパスワードリセットに関するメッセージを改善しました。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルへの追記を行えない File テーブルに対するエラーメッセージを改善しました。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが誤ってターミナルでバイナリ形式（`Native`、`Parquet`、`Avro` など）での出力を要求した場合に、確認を求めるようにしました。これにより [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524) がクローズされました。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 端末内での視認性を高めるため、Pretty および Vertical フォーマットで末尾の空白をハイライト表示します。これは `output_format_pretty_highlight_trailing_spaces` 設定で制御されます。初期実装は [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) における [Braden Burns](https://github.com/bradenburns) によるものです。[#71590](https://github.com/ClickHouse/ClickHouse/issues/71590) をクローズ。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-client` と `clickhouse-local` は、stdin がファイルからリダイレクトされている場合、その圧縮形式を自動検出します。これにより [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865) が解決されました。 [#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* pretty フォーマットで、デフォルトで長すぎるカラム名を切り詰めるようにしました。これは `output_format_pretty_max_column_name_width_cut_to` と `output_format_pretty_max_column_name_width_min_chars_to_cut` の設定で制御されます。これは [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) における [tanmaydatta](https://github.com/tanmaydatta) の作業の継続です。この変更により [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968) がクローズされます。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Pretty` フォーマットをより見やすくしました。前のブロックの出力からあまり時間が経っていない場合には、ブロックをまとめて出力します。これは新しい設定 `output_format_pretty_squash_consecutive_ms`（デフォルト 50 ms）と `output_format_pretty_squash_max_wait_ms`（デフォルト 1000 ms）で制御されます。[#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) の続きです。この変更により [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153) がクローズされます。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 現在マージ中のソースパーツ数を示すメトリクスを追加しました。これにより [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809) がクローズされます。 [#73868](https://github.com/ClickHouse/ClickHouse/pull/73868) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 出力先が端末の場合、`Vertical` フォーマットで列を強調表示します。これは `output_format_pretty_color` 設定で無効にできます。[#73898](https://github.com/ClickHouse/ClickHouse/pull/73898)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL 互換性を強化し、現在では `mysqlsh`（Oracle 製の高機能な MySQL CLI）が ClickHouse に接続できるようになりました。これはテストを容易にするために必要です。 [#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty フォーマットでは、テーブルセル内に複数行のフィールドを表示できるため、可読性が向上します。これはデフォルトで有効になっており、設定 `output_format_pretty_multiline_fields` で制御できます。[#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) における [Volodyachan](https://github.com/Volodyachan) の作業の継続です。これにより [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912) がクローズされました。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ブラウザ内の JavaScript から `X-ClickHouse` HTTP ヘッダーにアクセスできるようにしました。これにより、アプリケーションの開発がより容易になります。 [#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `JSONEachRowWithProgress` フォーマットには、メタデータ付きのイベントに加えて、合計値および極値が含まれます。さらに、`rows_before_limit_at_least` と `rows_before_aggregation` も含まれます。このフォーマットでは、部分的な結果が出力された後に例外が発生した場合でも、例外を正しく出力します。進捗には経過ナノ秒が含まれるようになりました。終了時に、最後の進捗イベントが 1 回送出されます。クエリ実行中の進捗は、`interactive_delay` 設定値より高い頻度では出力されません。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Play の UI で砂時計がスムーズに回転するようになりました。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* HTTP レスポンスが圧縮されている場合でも、受信したパケットはすぐに送信します。これにより、ブラウザは進捗パケットと圧縮データを受信できます。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 出力レコード数が N = `output_format_pretty_max_rows` を超える場合、先頭の N 行だけを表示する代わりに、出力テーブルを途中で分割し、先頭の N/2 行と末尾の N/2 行を表示します。[#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) の継続です。[#59502](https://github.com/ClickHouse/ClickHouse/issues/59502) をクローズします。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを利用できるようにしました。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DateTime64` 型のカラムに対して bloom&#95;filter インデックスを作成可能になりました。 [#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean)).
* `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が両方有効な場合、パーツのマージでは最大バイト数の制限が無視されます。 [#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* トレーサビリティを向上させるため、OpenTelemetry span logs テーブルに HTTP ヘッダーを追加しました。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* `GMT` タイムゾーンだけでなく、カスタムタイムゾーンを指定して `orc` ファイルを書き出せるようにしました。 [#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* クラウド間でバックアップを書き込む際に、I/O スケジューリング設定が反映されるようにしました。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `system.asynchronous_metrics` に `metric` カラムのエイリアスである `name` を追加しました。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 歴史的な理由により、クエリ `ALTER TABLE MOVE PARTITION TO TABLE` は専用の `ALTER_MOVE_PARTITION` 権限ではなく、`SELECT` と `ALTER DELETE` 権限をチェックしていました。このPRでは、この専用のアクセス種別を使用するように変更します。互換性確保のため、`SELECT` と `ALTER DELETE` が付与されている場合には、この権限も暗黙的に付与されますが、この挙動は将来のリリースで削除される予定です。[#16403](https://github.com/ClickHouse/ClickHouse/issues/16403) をクローズします。 [#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* ソートキー内のカラムをマテリアライズしようとした際にソート順を崩してしまうのではなく、例外をスローするようにしました。 [#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48)).
* `EXPLAIN QUERY TREE` にシークレットが表示されないようにしました。 [#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 「native」リーダーで Parquet の整数論理型をサポート。 [#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos)).
* デフォルトユーザーにパスワードが必要な場合、ブラウザで対話的に認証情報を要求します。以前のバージョンではサーバーは HTTP 403 を返していましたが、現在は HTTP 401 を返します。 [#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* アクセス種別 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` をグローバルからパラメータ化されたものに変更しました。これにより、ユーザーはアクセス管理に関する権限をこれまでよりも細かく付与できるようになりました。[#72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit))。
* `system.mutations` に `latest_fail_error_code_name` カラムを追加しました。このカラムは、ハングしている mutation に関する新しいメトリクスを導入し、クラウドで発生したエラーのグラフを作成するために使用します。また、必要に応じて、よりノイズの少ない新しいアラートを追加するためにも利用します。 [#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `ATTACH PARTITION` クエリでのメモリアロケーション量を削減。 [#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* `max_bytes_before_external_sort` の制限を、クエリ全体のメモリ消費量に基づくように変更しました（以前は 1 つのソートスレッドあたりのソートブロック内のバイト数を表していましたが、現在は `max_bytes_before_external_group_by` と同じ意味になり、すべてのスレッドを含むクエリ全体のメモリに対する合計上限を表します）。また、ディスク上のブロックサイズを制御するための設定項目 `min_external_sort_block_bytes` を追加しました。 [#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat))。
* トレースコレクタによるメモリ制限を無視するようにしました。 [#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* サーバー設定 `dictionaries_lazy_load` と `wait_dictionaries_load_at_startup` を `system.server_settings` に追加。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm))。
* `BACKUP`/`RESTORE` クエリで指定可能な設定一覧に `max_backup_bandwidth` を追加しました。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* レプリケートされたクラスターで生成されるログ量を抑えるため、ReplicatedMergeTree エンジンで出現するレプリケートパーツのログレベルを下げました。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 選言における共通式の抽出を改良しました。すべての選言項に共通部分式が存在しない場合でも、生成されるフィルター式を単純化できるようにしました。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) の継続です。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* ストレージ `S3Queue` / `AzureQueue` で、設定なしで作成されたテーブルにも設定を追加できるようにしました。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `least` および `greatest` 関数が `NULL` 引数を、（`true` の場合は）無条件に `NULL` を返すことで扱うか、（`false` の場合は）無視するかを制御する設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を導入しました。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze))。
* ObjectStorageQueueMetadata のクリーンアップスレッドで Keeper のマルチリクエストを使用するようにしました。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* ClickHouse が cgroup 配下で実行されている場合でも、システム負荷、プロセススケジューリング、メモリなどに関連するシステム全体の非同期メトリクスは引き続き収集されます。ClickHouse がホスト上で高いリソースを消費している唯一のプロセスである場合、これらは有用なシグナルを提供する可能性があります。[#73369](https://github.com/ClickHouse/ClickHouse/pull/73369)（[Nikita Taranov](https://github.com/nickitat)）。
* ストレージ `S3Queue` で、24.6 以前に作成された古い順序付きテーブルを、バケットを用いた新しい構造へ移行できるようにしました。 [#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 既存の `system.s3queue` と同様の `system.azure_queue` を追加。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 関数 `parseDateTime64`（およびそのバリアント）は、1970年以前および2106年以降の入力日付に対しても正しい結果を返すようになりました。例: `SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar))。
* ユーザーから指摘されていた `clickhouse-disks` の使い勝手に関するいくつかの問題に対応しました。[#67136](https://github.com/ClickHouse/ClickHouse/issues/67136) をクローズします。[#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* storage S3(Azure)Queue でコミット設定を変更できるようにしました（コミット設定は `max_processed_files_before_commit`, `max_processed_rows_before_commit`, `max_processed_bytes_before_commit`, `max_processing_time_sec_before_commit` です）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii))。
* storage S3(Azure)Queue において、ソース間の進捗を集約して commit limit 設定と比較できるようにしました。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `BACKUP`/`RESTORE` クエリで core 設定をサポートするようにしました。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* Parquet 出力で `output_format_compression_level` が考慮されるようになりました。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos)).
* Apache Arrow の `fixed_size_list` を未サポートな型として扱うのではなく、`Array` として読み取れるようにしました。 [#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers)).
* 2 つのバックアップエンジンを追加: `Memory`（現在のユーザーセッション内にバックアップを保持）、および `Null`（バックアップをどこにも保存しない。テスト用）。 [#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar)).
* `concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_num_ratio_to_cores` は、サーバーを再起動せずに変更できるようになりました。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* `formatReadable` 関数で拡張数値型（`Decimal` や大きな整数）をサポートしました。 [#73765](https://github.com/ClickHouse/ClickHouse/pull/73765) ([Raúl Marín](https://github.com/Algunenano)).
* Postgres ワイヤプロトコル互換のために TLS をサポートしました。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 関数 `isIPv4String` は、正しい IPv4 アドレスの後ろにゼロバイトが続いている場合に true を返していましたが、このケースでは false を返すべきでした。[#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) の対応の続きです。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL ワイヤープロトコルのエラーコードを MySQL と互換にしました。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) の継続です。[#50957](https://github.com/ClickHouse/ClickHouse/issues/50957) をクローズします。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `IN` や `NOT IN` などの演算子内で使用される列挙型リテラルを検証するための設定 `validate_enum_literals_in_opearators` を追加しました。この設定により、リテラルが列挙型の有効な値かどうかを検証し、有効でない場合は例外をスローします。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Storage `S3(Azure)Queue` において、（commit 設定で定義される 1 つのバッチ内の）すべてのファイルを 1 つの Keeper トランザクションで commit するようにしました。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 実行可能な UDF および辞書に対するヘッダー検出を無効化（Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1 という誤った結果を引き起こす可能性があるため）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* `EXPLAIN PLAN` に `distributed` オプションを追加しました。これにより、`EXPLAIN distributed=1 ...` は `ReadFromParallelRemote*` ステップにリモートプランを付加するようになりました。 [#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic 引数を持つ not/xor に対して正しい戻り型を使用するようにしました。 [#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル作成後に `add_implicit_sign_column_constraint_for_collapsing_engine` を変更可能にしました。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm)).
* マテリアライズドビューの `SELECT` クエリでサブカラムをサポートするようにしました。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar)).
* `clickhouse-client` でカスタムプロンプトを設定するには、現在は次の 3 つのシンプルな方法があります。1. コマンドラインパラメータ `--prompt` を使用する、2. 設定ファイル内で設定 `<prompt>[...]</prompt>` を使用する、3. 同じく設定ファイル内で、接続ごとの設定として `<connections_credentials><prompt>[...]</prompt></connection_credentials>` を使用する。[#74168](https://github.com/ClickHouse/ClickHouse/pull/74168)（[Christoph Wurm](https://github.com/cwurm)）。
* ClickHouse Client でポート 9440 への接続に基づき、安全な接続を自動検出するようになりました。 [#74212](https://github.com/ClickHouse/ClickHouse/pull/74212) ([Christoph Wurm](https://github.com/cwurm)).
* http&#95;handlers でユーザー名のみを用いたユーザー認証を行えるようにしました（以前はユーザーがパスワードも入力する必要がありました）。 [#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat)).
* 代替クエリ言語である PRQL と KQL のサポートは experimental としてマークされました。これらを使用するには、設定 `allow_experimental_prql_dialect = 1` および `allow_experimental_kusto_dialect = 1` を指定します。 [#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze))。
* より多くの集約関数でデフォルトの `Enum` 型を返せるように対応。 [#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* `OPTIMIZE TABLE` で、既存のキーワード `FINAL` の代替としてキーワード `FORCE` を指定できるようになりました。 [#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze)).
* サーバーのシャットダウンに時間がかかり過ぎた場合にアラートを発火させるために必要な `IsServerShuttingDown` メトリクスを追加しました。 [#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* EXPLAIN に Iceberg テーブルの名前を追加しました。[#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim))。
* 古いアナライザーで `RECURSIVE CTE` を使用した場合に、より適切なエラーメッセージを表示するようにしました。 [#74523](https://github.com/ClickHouse/ClickHouse/pull/74523) ([Raúl Marín](https://github.com/Algunenano)).
* 詳細なエラーメッセージを `system.errors` に表示するようにしました。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar))。
* clickhouse-keeper とのクライアント通信でパスワードを使用できるようにしました。サーバーおよびクライアントに対して適切な SSL 設定を行っている場合、この機能の有用性はそれほど高くありませんが、状況によっては役立つ場合があります。パスワードは 16 文字を超えることはできません。Keeper の認証モデルとは連携していません。[#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin))。
* コンフィグリローダー向けのエラーコードを追加しました。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* MySQL および PostgreSQL のテーブル関数とエンジンで IPv6 アドレスがサポートされるようになりました。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme)).
* `divideDecimal` にショートサーキット最適化を実装。[#74280](https://github.com/ClickHouse/ClickHouse/issues/74280) を修正。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 起動スクリプト内でユーザーを指定できるようになりました。 [#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit))。
* Azure SAS トークンのサポートを追加しました。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* Parquet の圧縮レベルは、圧縮コーデックがサポートしている場合にのみ設定されるようにしました。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修飾子付きの照合ロケールを使用するとエラーが発生していたリグレッションを修正しました。例えば、`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` が、現在は正しく動作します。 [#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* keeper-client で SEQUENTIAL ノードを作成できない問題を修正。 [#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94))。
* position 関数での誤った文字数のカウントを修正します。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* アクセスエンティティに対する `RESTORE` 操作が、未処理の一部的な権限取り消しのために、本来より多くの権限を必要としていました。この PR により問題が修正されます。[#71853](https://github.com/ClickHouse/ClickHouse/issues/71853) をクローズします。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958)（[pufit](https://github.com/pufit)）。
* `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` の後に処理が停止しないようにしました。バックグラウンドタスクのスケジューリングに使用する正しい設定を取得するようにしました。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 一部の入力および出力フォーマット（例: Parquet、Arrow）における空のタプルの扱いを修正。[#72616](https://github.com/ClickHouse/ClickHouse/pull/72616)（[Michael Kolupaev](https://github.com/al13n321)）。
* ワイルドカードを使用したデータベース/テーブルに対するカラムレベルの GRANT SELECT/INSERT 文は、現在エラーを送出するようになりました。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan)).
* 対象のアクセスエンティティに暗黙的な権限付与があるためにユーザーが `REVOKE ALL ON *.*` を実行できない問題を修正しました。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* formatDateTime スカラ関数における正のタイムゾーンのフォーマットを修正。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* PROXYv1 を介した接続で `auth_use_forwarded_address` が設定されている場合に、ソースポートが正しく反映されるよう修正しました。以前はプロキシポートが誤って使用されていました。`currentQueryID()` 関数を追加しました。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* TCPHandler でフォーマット設定を NativeWriter に伝播し、`output_format_native_write_json_as_string` のような設定が正しく適用されるようにしました。 [#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* StorageObjectStorageQueue のクラッシュを修正しました。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* サーバーのシャットダウン中にリフレッシュ可能なマテリアライズドビューで発生する、まれなクラッシュを修正。 [#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 関数 `formatDateTime` の `%f` プレースホルダは、サブ秒部分として常に 6 桁を出力するようになりました。これにより、MySQL の `DATE_FORMAT` 関数との動作互換性が確保されます。以前の動作は、設定 `formatdatetime_f_prints_scale_number_of_digits = 1` を使用することで復元できます。 [#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese))。
* `s3` ストレージおよびテーブル関数からの読み取り時における `_etag` 列によるフィルタリングを修正しました。 [#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 古いアナライザー使用時に、`JOIN ON` 式内で `IN (subquery)` が使われた場合に発生する `Not-ready Set is passed as the second argument for function 'in'` エラーを修正。[#73382](https://github.com/ClickHouse/ClickHouse/pull/73382) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Dynamic および JSON カラムに対する squashing の準備処理を修正しました。これまで一部のケースでは、型/パス数の上限に達していない場合でも、新しい型が shared variant/shared data に挿入されてしまうことがありました。 [#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar)).
* 型のバイナリデコード時に不正なサイズを検査し、過度に大きなメモリアロケーションを回避するようにしました。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカが有効な状態で単一レプリカのクラスタから読み込む際に発生していた論理エラーを修正しました。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321)).
* ZooKeeper および旧バージョンの Keeper と併用した ObjectStorageQueue を修正。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* デフォルトで Hive パーティショニングを有効にするために必要な修正を実装しました。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ベクトル類似性インデックス作成時のデータレースを修正。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 辞書のソースに誤ったデータを含む関数がある場合に発生するセグメンテーションフォールトを修正します。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* storage S3(Azure)Queue での挿入失敗時のリトライ処理を修正。[#70951](https://github.com/ClickHouse/ClickHouse/issues/70951) をクローズ。[#73546](https://github.com/ClickHouse/ClickHouse/pull/73546)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `LowCardinality` 要素を含むタプルに対して設定 `optimize_functions_to_subcolumns` が有効な場合に、特定のケースで発生しうる関数 `tupleElement` のエラーを修正しました。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* enum のグロブの後に続く range one のパースを修正。 [#73473](https://github.com/ClickHouse/ClickHouse/issues/73473) を解決。 [#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 非レプリケートテーブルに対するサブクエリ内で、非レプリケートな `merge_tree` に対する固定値の `parallel_replicas` が無視されていた問題を修正。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* タスクをスケジュールできない場合にスローされる `std::logical_error` の修正。ストレステストで発見。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger))。
* 分散クエリに対して誤った処理段階が使用されることによる論理エラーを避けるため、`EXPLAIN SYNTAX` ではクエリを解釈しないようにしました。 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205) を修正。 [#73634](https://github.com/ClickHouse/ClickHouse/pull/73634)（[Dmitry Novik](https://github.com/novikd)）。
* Dynamic column におけるデータ不整合の可能性を修正しました。`Nested columns sizes are inconsistent with local_discriminators column size` という論理エラーが発生する可能性を修正しました。[#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar)).
* `FINAL` と `SAMPLE` を含むクエリで発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。`CollapsingMergeTree` に対する `FINAL` 付きの `SELECT` で誤った結果が返される問題を修正し、`FINAL` の最適化を有効にしました。 [#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* LIMIT BY COLUMNS で発生していたクラッシュを修正。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 通常のプロジェクションの使用が強制され、かつクエリが定義済みのプロジェクションと完全に同一であるにもかかわらず、そのプロジェクションが選択されずエラーが発生してしまう不具合を修正しました。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* Dynamic/Object 構造のデシリアライズ処理を修正しました。これにより CANNOT&#95;READ&#95;ALL&#95;DATA 例外が発生する可能性がありました。 [#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* バックアップからパーツを復元する際に `metadata_version.txt` をスキップするようにしました。 [#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar))。
* LIKE を使用した Enum への `CAST` 時に発生するセグメンテーションフォールトを修正。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar)).
* ディスクとして動作しない S3 Express バケットの不具合を修正。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar)).
* CollapsingMergeTree テーブルで、無効な sign 列値を含む行のマージを許可します。 [#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm)).
* オフラインレプリカに対して `ddl` をクエリするとエラーが発生する問題を修正。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach))。
* 入れ子のタプルに対して（&#39;keys&#39;,&#39;values&#39; といった）明示的な名前を持たない `Map` を作成できてしまうことが原因で、`map()` 型の比較が時折失敗する問題を修正しました。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `GROUP BY ALL` 句の解決時にウィンドウ関数を無視するようにしました。[#73501](https://github.com/ClickHouse/ClickHouse/issues/73501) を修正。[#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 暗黙的な権限を修正（以前はワイルドカードとして扱われていた）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* ネストされた `Map` の作成時に発生する過剰なメモリ使用を修正。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar)).
* 空のキーを含むネストした `JSON` のパースを修正。[#73993](https://github.com/ClickHouse/ClickHouse/pull/73993)（[Pavel Kruglov](https://github.com/Avogar)）。
* 修正：別名が、別の別名から参照されていて、かつ逆順で選択されている場合に、projection に追加されない可能性がある問題を修正。 [#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* plain&#95;rewritable ディスクの初期化中に Azure で発生する object not found エラーを無視するようにしました。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* `Enum` 型および空テーブルに対する `any` と `anyLast` の挙動を修正。 [#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* ユーザーが `kafka` テーブルエンジンでキーワード引数を指定した場合に発生する不具合を修正します。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ストレージ `S3Queue` の設定において、&quot;s3queue&#95;&quot; プレフィックスあり・なしの設定を相互に変更する処理を修正しました。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定 `allow_push_predicate_ast_for_distributed_subqueries` を追加しました。これにより、analyzer を用いた分散クエリに対して AST ベースの述語プッシュダウンが行えるようになります。これは、クエリプランのシリアライズに対応した分散クエリがサポートされるまで使用する一時的な解決策です。[#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718) をクローズします。[#74085](https://github.com/ClickHouse/ClickHouse/pull/74085)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) の対応後、`forwarded_for` フィールドにポートが含まれる場合があり、その結果、ポート付きのホスト名を解決できなくなる問題を修正しました。 [#74116](https://github.com/ClickHouse/ClickHouse/pull/74116) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` の不正なフォーマットを修正しました。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991)).
* Issue [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112) の修正。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `CREATE TABLE` で `Loop` をテーブルエンジンとして使用することは、もうできません。この組み合わせは以前、セグメンテーションフォルトを引き起こしていました。 [#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* postgresql および sqlite の table function における SQL インジェクションを防止するセキュリティ上の問題を修正しました。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 圧縮された Memory エンジンテーブルからサブカラムを読み取る際に発生していたクラッシュを修正しました。 [#74009](https://github.com/ClickHouse/ClickHouse/issues/74009) を修正。 [#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* system.detached&#95;tables へのクエリで発生していた無限ループを修正しました。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov))。
* `s3queue` でファイルを `failed` 状態に設定する際の論理エラーを修正しました。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ベースバックアップからの `RESTORE` におけるネイティブコピー設定（`allow_s3_native_copy` / `allow_azure_native_copy`）を修正。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* データベース内のデタッチされたテーブル数が `max_block_size` の倍数となる場合に発生していた問題を修正しました。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* ソースと宛先で認証情報が異なる場合の ObjectStorage（S3 など）経由のコピー処理を修正。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat))。
* GCS 上のネイティブコピーにおける「JSON API の Rewrite メソッドを使用する」設定の検出を修正。 [#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundMergesAndMutationsPoolSize` の誤った計算を修正しました（実際の値の 2 倍になっていました）。 [#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin))。
* Cluster Discovery を有効にした際に keeper watch がリークするバグを修正。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* UBSan によって報告されたメモリアライメントの問題を修正。 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。 [#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* テーブル作成中の `KeeperMap` の並行クリーンアップ処理を修正。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* `EXCEPT` や `INTERSECT` が存在する場合、正しいクエリ結果を維持するために、サブクエリ内の未使用の projection 列を削除しないようにしました。 [#73930](https://github.com/ClickHouse/ClickHouse/issues/73930) を修正。 [#66465](https://github.com/ClickHouse/ClickHouse/issues/66465) を修正。 [#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* `Tuple` 列を持ち、スパースシリアライゼーションが有効なテーブル間での `INSERT SELECT` クエリを修正しました。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 関数 `right` が const の負のオフセットに対して正しく動作していませんでした。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* クライアント側での不適切な解凍処理により、gzip 圧縮データの挿入が失敗することがある問題を修正。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* ワイルドカードを含む `GRANT` を部分的に `REVOKE` すると、想定より多くの権限が削除されてしまう場合がありました。 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263) をクローズしました。 [#74751](https://github.com/ClickHouse/ClickHouse/pull/74751)（[pufit](https://github.com/pufit)）。
* Keeper の修正: ディスクからのログエントリ読み取りを修正。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* SYSTEM REFRESH/START/STOP VIEW に対する権限チェックを修正しました。特定のビューに対するクエリを実行する際に `*.*` への権限を持つ必要はなくなり、そのビューに対する権限のみが必要となりました。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix))。
* `hasColumnInTable` 関数は alias 列を考慮していません。alias 列にも対応するように修正しました。 [#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* Azure Blob Storage 上の空のカラムを持つテーブルでデータパーツのマージ中に発生する FILE&#95;DOESNT&#95;EXIST エラーを修正。 [#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 一時テーブルを `JOIN` する際のプロジェクション列名を修正し、[#68872](https://github.com/ClickHouse/ClickHouse/issues/68872) をクローズしました。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。



#### ビルド/テスト/パッケージングの改善
* ユニバーサルインストールスクリプトが、macOS 上でもインストールを提案するようになりました。 [#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
