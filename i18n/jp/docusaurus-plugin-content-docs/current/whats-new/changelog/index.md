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

**[ClickHouseリリース v25.10, 2025-10-30](#2510)**<br/>
**[ClickHouseリリース v25.9, 2025-09-25](#259)**<br/>
**[ClickHouseリリース v25.8 LTS, 2025-08-28](#258)**<br/>
**[ClickHouseリリース v25.7, 2025-07-24](#257)**<br/>
**[ClickHouseリリース v25.6, 2025-06-26](#256)**<br/>
**[ClickHouseリリース v25.5, 2025-05-22](#255)**<br/>
**[ClickHouseリリース v25.4, 2025-04-22](#254)**<br/>
**[ClickHouseリリース v25.3 LTS, 2025-03-20](#253)**<br/>
**[ClickHouseリリース v25.2, 2025-02-27](#252)**<br/>
**[ClickHouseリリース v25.1, 2025-01-28](#251)**<br/>
**[2024年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>

### ClickHouseリリース 25.10, 2025-10-31 {#2510}


#### 後方互換性のない変更

* デフォルトの `schema_inference_make_columns_nullable` 設定を変更し、すべてを Nullable にするのではなく、Parquet/ORC/Arrow メタデータに含まれるカラムの `Nullable` であるかどうかの情報を反映するようにしました。テキスト形式については変更ありません。 [#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321)).
* クエリ結果キャッシュは `log_comment` 設定を無視するようになったため、クエリの `log_comment` だけを変更しても、キャッシュミスは発生しなくなりました。ユーザーが意図的に `log_comment` を変化させることでキャッシュをセグメント化していた可能性はわずかにあります。この変更はその挙動を変えるものであるため、後方互換性がありません。この用途には設定 `query_cache_tag` を使用してください。 [#79878](https://github.com/ClickHouse/ClickHouse/pull/79878) ([filimonov](https://github.com/filimonov)).
* 以前のバージョンでは、テーブル関数の名前が演算子の実装関数と同一であるクエリにおいて、フォーマットが一貫していませんでした。[#81601](https://github.com/ClickHouse/ClickHouse/issues/81601) をクローズしました。[#81977](https://github.com/ClickHouse/ClickHouse/issues/81977) をクローズしました。[#82834](https://github.com/ClickHouse/ClickHouse/issues/82834) をクローズしました。[#82835](https://github.com/ClickHouse/ClickHouse/issues/82835) をクローズしました。EXPLAIN SYNTAX クエリでは、演算子を常にフォーマットすることはなくなりました。この新しい動作は、構文を説明するという目的をより正確に反映しています。`clickhouse-format`、`formatQuery` などは、クエリ内で関数形式として使用されている場合には、それらの関数を演算子としてフォーマットしません。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JOIN` のキーで `Dynamic` 型を使用することを禁止しました。`Dynamic` 型の値が非 `Dynamic` 型と比較されると、予期しない結果につながる可能性があります。`Dynamic` 列は必要な型にキャストすることを推奨します。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` サーバーオプションはデフォルトで有効になっており、現在は無効にできません。これは後方互換性を損なわない変更です。ご注意までにお知らせします。この変更は 25.x リリースとのみ前方互換性があります。つまり、新しいリリースをロールバックしなければならない場合、ダウングレードできるのは 25.x 系の任意のリリースに限られます。 [#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema))。
* 挿入レートが低い場合に ZooKeeper 上に保存される znode 数を減らすため、`replicated_deduplication_window_seconds` を 1 週間から 1 時間に減らしました。 [#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema)).
* 設定 `query_plan_use_new_logical_join_step` の名前を `query_plan_use_logical_join_step` に変更しました。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新しい構文により、テキストインデックスの `tokenizer` パラメータをより柔軟かつ詳細に指定できるようになりました。 [#87997](https://github.com/ClickHouse/ClickHouse/pull/87997) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 関数 `searchAny` および `searchAll` を、既存の関数 `hasToken` との整合性を高めるために、それぞれ `hasAnyTokens` および `hasAllTokens` に名前変更しました。 [#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze)).
* ファイルシステムキャッシュから `cache_hits_threshold` を削除します。この機能は、SLRU キャッシュポリシーを導入する前に外部コントリビューターによって追加されたものですが、現在は SLRU キャッシュポリシーがあるため、両方をサポートし続けることには意味がありません。 [#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` 設定の動作に対する、2 つの小さな変更: - 挿入を拒否すべきかどうかを判定する際に、利用可能バイト数ではなく、未予約のバイト数を使用するようにしました。バックグラウンドのマージやミューテーション用の予約が、設定された閾値と比べて小さい場合にはあまり重要ではないかもしれませんが、そのほうがより正確と考えられます。 - これらの設定を system テーブルには適用しないようにしました。`query_log` のようなテーブルは引き続き更新されることが望ましいためです。これはデバッグに大いに役立ちます。system テーブルに書き込まれるデータは通常、実データと比べて小さいため、妥当な `min_free_disk_ratio_to_perform_insert` の閾値であれば、はるかに長期間にわたって書き込みを継続できるはずです。 [#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end)).
* Keeper の内部レプリケーションで非同期モードを有効にします。Keeper は従来と同じ動作を維持しつつ、パフォーマンスが向上する可能性があります。23.9 より古いバージョンから更新する場合は、まず 23.9 以上に更新してから、25.10 以上に更新する必要があります。または、更新前に `keeper_server.coordination_settings.async_replication` を 0 に設定し、更新完了後に有効にすることもできます。 [#88515](https://github.com/ClickHouse/ClickHouse/pull/88515) ([Antonio Andelic](https://github.com/antonio2368))。





#### 新機能

* 負の `LIMIT` および負の `OFFSET` のサポートを追加しました。 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913) をクローズ。 [#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照のみを保持します。 [#87965](https://github.com/ClickHouse/ClickHouse/pull/87965) ([Kai Zhu](https://github.com/nauu))。
* 演算子 `IS NOT DISTINCT FROM` (`<=>`) の完全サポートを追加しました。 [#88155](https://github.com/ClickHouse/ClickHouse/pull/88155) ([simonmichal](https://github.com/simonmichal))。
* `MergeTree` テーブル内のすべての対象となる列に対して、統計を自動的に作成する機能を追加しました。作成する統計の種類をカンマ区切りで指定するテーブルレベル設定 `auto_statistics_types` を追加しました（例: `auto_statistics_types = 'minmax, uniq, countmin'`）。[#87241](https://github.com/ClickHouse/ClickHouse/pull/87241)（[Anton Popov](https://github.com/CurtizJ)）。
* テキスト向けの新しいブルームフィルターインデックス `sparse_gram`。[#79985](https://github.com/ClickHouse/ClickHouse/pull/79985)（[scanhex12](https://github.com/scanhex12)）。
* 基数間で数値を変換する新しい `conv` 関数が追加されました。現在は `2-36` の基数をサポートしています。 [#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator))。
* `LIMIT BY ALL` 構文のサポートを追加しました。`GROUP BY ALL` や `ORDER BY ALL` と同様に、`LIMIT BY ALL` は SELECT 句に含まれるすべての非集約式を自動的に展開して、LIMIT BY のキーとして使用します。たとえば、`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` は `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name` と等価です。この機能により、SELECT 句で選択されたすべての非集約列を LIMIT BY の対象にしたい場合に、それらを明示的に列挙する必要がなくなり、クエリを簡潔に記述できます。[#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) をクローズしました。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* ClickHouse で Apache Paimon をクエリするためのサポートを追加しました。この統合により、ClickHouse ユーザーは Paimon のデータレイクストレージに直接アクセスできるようになります。 [#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* 集約関数 `studentTTestOneSample` を追加しました。 [#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 集約関数 `quantilePrometheusHistogram`。この関数はヒストグラムのバケットの上限値と累積値を引数として受け取り、分位点の位置が含まれるバケットの下限値と上限値の間で線形補間を行います。従来型ヒストグラムに対する PromQL の関数 `histogram_quantile` と同様に動作します。[#86294](https://github.com/ClickHouse/ClickHouse/pull/86294)（[Stephen Chi](https://github.com/stephchi0)）。
* Delta Lake メタデータファイル用の新しいシステムテーブル。 [#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12)).
* `ALTER TABLE REWRITE PARTS` を追加しました。これはテーブルパーツを一から書き直し、すべての新しい設定を適用して再生成します（`use_const_adaptive_granularity` のように、新しいパーツに対してのみ適用されるものがあるため）。[#87774](https://github.com/ClickHouse/ClickHouse/pull/87774)（[Azat Khuzhin](https://github.com/azat)）。
* `SYSTEM RECONNECT ZOOKEEPER` コマンドを追加し、ZooKeeper との切断と再接続を強制的に行えるようにしました（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。 [#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* `max_named_collection_num_to_warn` と `max_named_collection_num_to_throw` の設定により、名前付きコレクションの数を制限できるようにしました。新しいメトリクス `NamedCollection` とエラー `TOO_MANY_NAMED_COLLECTIONS` を追加しました。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos))。
* `startsWith` および `endsWith` 関数に対し、大文字小文字を区別しない最適化版である `startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8`、`endsWithCaseInsensitiveUTF8` を追加しました。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang)).
* サーバー設定の &quot;resources&#95;and&#95;workloads&quot; セクションを利用して、SQL で `WORKLOAD` および `RESOURCE` を定義できるようにしました。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa))。
* パーツをワイドパーツとして作成する際の最小レベルを指定できる新しいテーブル設定 `min_level_for_wide_part` を追加しました。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm))。
* Keeper クライアントに `cp`-`cpr` および `mv`-`mvr` コマンドの再帰的バリアントを追加しました。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 挿入時のマテリアライズ対象から除外するスキップインデックスのリストを指定するセッション設定（`exclude_materialize_skip_indexes_on_insert`）を追加しました。マージ時のマテリアライズ対象から除外するスキップインデックスのリストを指定する MergeTree テーブル設定（`exclude_materialize_skip_indexes_on_merge`）を追加しました。 [#87252](https://github.com/ClickHouse/ClickHouse/pull/87252) ([George Larionov](https://github.com/george-larionov))。



#### 実験的機能
* ベクトルをビットスライス形式で格納する `QBit` データ型と、パラメータによって精度と速度のトレードオフを調整可能な近似ベクトル検索を提供する `L2DistanceTransposed` 関数を実装しました。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 関数 `searchAll` と `searchAny` は、テキスト列でないカラムに対しても動作するようになりました。その場合にはデフォルトのトークナイザーが使用されます。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus)).



#### パフォーマンスの向上

* JOIN および ARRAY JOIN においてカラムの遅延複製を実装しました。Sparse や Replicated のような特殊なカラム表現を、一部の出力フォーマットで完全なカラム表現に変換することを避けます。これにより、メモリ内での不要なデータコピーを防ぎます。 [#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar))。
* MergeTree テーブル内のトップレベル String カラムに対し、圧縮を改善し効率的なサブカラムアクセスを可能にするオプションの `.size` サブカラムシリアライゼーションを追加しました。シリアライゼーションバージョンを制御するための新しい MergeTree 設定と、空文字列に対する式最適化のための設定を導入しました。 [#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* Iceberg の順序付き読み取りをサポート。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 一部の JOIN クエリについて、実行時に右側サブツリーから Bloom フィルタを構築し、このフィルタを左側サブツリーのスキャンに渡すことで高速化できるようにしました。これは、`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` のようなクエリに対して効果があります。[#84772](https://github.com/ClickHouse/ClickHouse/pull/84772)（[Alexander Gololobov](https://github.com/davenger)）。
* Query Condition Cache (QCC) とインデックス解析の順序および統合をリファクタリングすることで、クエリパフォーマンスを改善しました。QCC によるフィルタリングは、プライマリキーおよびスキップインデックス解析より前に適用されるようになり、不要なインデックス計算が削減されます。インデックス解析は複数の範囲フィルタをサポートするよう拡張され、そのフィルタリング結果は QCC に書き戻されるようになりました。これにより、インデックス解析が実行時間の支配要因となるクエリ、特にスキップインデックス（例: ベクターインデックスやインバーテッドインデックス）に依存するクエリが大幅に高速化されます。[#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird))。
* 小規模なクエリを高速化するための細かな最適化を多数追加。 [#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano)).
* ネイティブプロトコルで logs と profile events を圧縮します。100 台以上のレプリカを持つクラスタでは、非圧縮の profile events は 1～10 MB/秒を消費し、インターネット接続が遅い場合にはプログレスバーの更新が重くなります。これにより [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533) が解決されます。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [StringZilla](https://github.com/ashvardanian/StringZilla) ライブラリを使用し、SIMD CPU 命令が利用可能な環境ではこれを活用することで、大文字と小文字を区別する文字列検索（`WHERE URL LIKE '%google%'` などのフィルタリング操作）のパフォーマンスを向上しました。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* `SimpleAggregateFunction(anyLast)` 型の列を持つ AggregatingMergeTree テーブルに対して `FINAL` 付きで `SELECT` を実行する際のメモリ割り当てやメモリコピーを削減しました。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* 論理和（disjunction）を含む JOIN 述語のプッシュダウンを行うロジックを追加しました。例として、TPC-H Q7 において 2 つのテーブル n1 と n2 に対する条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')` がある場合、各テーブルに対して個別の部分フィルタを抽出し、n1 には `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`、n2 には `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'` を適用します。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しいデフォルト設定 `optimize_rewrite_like_perfect_affix` を使用して、接頭辞または接尾辞パターンを持つ `LIKE` のパフォーマンスを向上します。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 複数の文字列／数値カラムでのグループ化時に、巨大なシリアル化されたキーに起因するパフォーマンス低下を修正しました。これは [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) のフォローアップです。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* 多くのマッチを含むキーが存在するハッシュ結合におけるメモリ使用量を削減するため、新しい `joined_block_split_single_row` 設定を追加しました。これにより、左側テーブルの1行に対するマッチ結果であっても分割してチャンク化できるようになり、左側テーブルの1行が右側テーブルの数千、数百万行とマッチするような場合に特に有用です。これまでは、すべてのマッチを一度にメモリ上にマテリアライズする必要がありました。この変更によりピークメモリ使用量は削減されますが、CPU 使用量は増加する可能性があります。 [#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* SharedMutex を改良し（多数のクエリを同時に実行する場合のパフォーマンスを向上）、[#87491](https://github.com/ClickHouse/ClickHouse/pull/87491)（[Raúl Marín](https://github.com/Algunenano)）。
* 主に出現頻度の低いトークンを含む文書に対するテキストインデックス構築のパフォーマンスを改善しました。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ)).
* `Field` デストラクタの典型的なケースを高速化し、多数の小さなクエリに対するパフォーマンスを改善しました。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano))。
* JOIN の最適化時に実行時ハッシュテーブルの統計情報の再計算をスキップし（JOIN を含むすべてのクエリのパフォーマンスが向上）、新しいプロファイルイベント `JoinOptimizeMicroseconds` および `QueryPlanOptimizeMicroseconds` を追加しました。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTreeLazy リーダーでマークをキャッシュに保存し、直接 I/O を回避できるようにしました。これにより、ORDER BY と小さな LIMIT を伴うクエリのパフォーマンスが向上します。 [#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat)).
* `is_deleted` 列を持つ `ReplacingMergeTree` テーブルに対する `FINAL` 句付きの SELECT クエリの実行が、既存の 2 つの最適化に対する並列化の改善により高速化されました。1. テーブル内で単一の `part` しか持たないパーティションに対する `do_not_merge_across_partitions_select_final` 最適化、2. テーブル内のその他の選択された範囲を `intersecting / non-intersecting` に分割し、`intersecting` 範囲のみが FINAL のマージ変換を通過すればよいようにした最適化。[#88090](https://github.com/ClickHouse/ClickHouse/pull/88090)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* フェイルポイントを使用しないことによる影響（デバッグが有効でないときのデフォルトのコードパス）を軽減しました。 [#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* `uuid` でフィルタリングする際の `system.tables` のフルスキャンを回避（ログや ZooKeeper のパスから UUID しか分からない場合に有用）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 関数 `tokens`、`hasAllTokens`、`hasAnyTokens` の性能を向上しました。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 一部のケースにおいて JOIN のパフォーマンスをわずかに向上させるため、`AddedColumns::appendFromBlock` をインライン化しました。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントのオートコンプリートは、複数の system テーブルに対してクエリを発行するのではなく `system.completions` を使用することで、より高速かつ一貫性の高い動作になります。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m))。
* 辞書圧縮を制御するための新しいテキストインデックスパラメータ `dictionary_block_frontcoding_compression` を追加しました。デフォルトで有効になっており、`front-coding` 圧縮が使用されます。 [#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 設定 `min_insert_block_size_rows_for_materialized_views` および `min_insert_block_size_bytes_for_materialized_views` に応じて、マテリアライズドビューへ挿入する前にすべてのスレッドからのデータをまとめて処理するようにしました。以前は、`parallel_view_processing` が有効な場合、特定のマテリアライズドビューへの各スレッドの挿入ごとに独立してデータをまとめており、その結果、生成されるパーツ数の増加につながる可能性がありました。 [#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368)).
* 一時ファイルの書き込み用バッファのサイズを制御するための設定 `temporary_files_buffer_size` を追加。 * `LowCardinality` 列に対して（たとえば Grace ハッシュ結合で使用される）`scatter` 操作のメモリ消費を最適化。 [#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir))。
* テキストインデックスに対する並列レプリカでの直接読み取りをサポートしました。オブジェクトストレージからのテキストインデックス読み取りの性能を改善しました。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* Data Lakes カタログのテーブルを参照するクエリでは、分散処理のために parallel replicas が使用されるようになりました。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* &quot;to&#95;remove&#95;small&#95;parts&#95;at&#95;right&quot; と名付けられたバックグラウンドマージアルゴリズムのチューニング用内部ヒューリスティックは、マージ範囲スコアの計算前に実行されるようになりました。それ以前は、マージセレクタはより大きなマージ範囲を選択してから、その末尾部分をフィルタリングしていました。修正: [#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736)（[Mikhail Artemenko](https://github.com/Michicosun)）。





#### 改善

* これにより、関数 `generateSerialID` が系列名として非定数の引数をサポートするようになりました。 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750) をクローズ。 [#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しいシリーズのカスタム開始値を指定できるようにするため、`generateSerialID` 関数に任意指定の `start_value` パラメーターを追加しました。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma))。
* `clickhouse-format` に `--semicolons_inline` オプションを追加し、クエリをフォーマットする際にセミコロンが新しい行ではなく行末に配置されるようにしました。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan))。
* Keeper で設定が上書きされている場合でも、サーバーレベルのスロットリングを設定できるようにしました。[#73964](https://github.com/ClickHouse/ClickHouse/issues/73964) をクローズ。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066) ([JIaQi](https://github.com/JiaQiTang98))。
* `mannWhitneyUTest` は、両方のサンプルに同じ値しか含まれていない場合でも例外をスローしなくなりました。SciPy と整合する有効な結果を返すようになりました。これにより [#79814](https://github.com/ClickHouse/ClickHouse/issues/79814) がクローズされました。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht))。
* メタデータトランザクションがコミットされた場合、ディスクオブジェクトストレージのリライトトランザクションは、以前のリモート BLOB を削除するようになりました。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* 最適化の前後で結果型の `LowCardinality` が異なる場合でも正しく動作するよう、冗長な等価比較式に対する最適化パスを修正しました。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* HTTP クライアントが `Expect: 100-continue` に加えてヘッダー `X-ClickHouse-100-Continue: defer` を設定した場合、ClickHouse はクオータ検証に合格するまでクライアントに `100 Continue` レスポンスを送信しません。これにより、最終的に破棄されることになるリクエストボディを送信してネットワーク帯域幅を浪費することを防ぎます。これは、クエリ自体は URL のクエリ文字列で送信し、データをリクエストボディで送信するような INSERT クエリにおいて関連します。ボディを最後まで送信せずにリクエストを中止すると、HTTP/1.1 では接続の再利用ができなくなりますが、新しい接続を開くことで発生するレイテンシの増加は、通常、大量データを扱う INSERT クエリ全体の実行時間と比べると無視できる程度です。 [#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end)).
* S3 ストレージを使用した DATABASE ENGINE = Backup 利用時に、ログ内の S3 認証情報をマスクするようにしました。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* クエリプランの最適化が相関サブクエリの入力サブプランからも見えるようにするため、マテリアライズを遅延させた。[#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455) ([Dmitry Novik](https://github.com/novikd))。
* SYSTEM DROP DATABASE REPLICA の変更点: - データベースと一緒に、またはレプリカ全体を削除する場合: データベース内の各テーブルのレプリカも削除される - `WITH TABLES` が指定されている場合、各ストレージのレプリカを削除する - それ以外の場合、ロジックは変更されず、データベースのレプリカのみを削除する - Keeper パスを指定してデータベースレプリカを削除する場合: - `WITH TABLES` が指定されている場合: - データベースを Atomic として復元する - Keeper 内のステートメントから RMT テーブルを復元する - データベースを削除する（復元されたテーブルも同様に削除される） - それ以外の場合、指定された Keeper パス上のレプリカのみを削除する。[#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `materialize` 関数を含む TTL のフォーマットが一貫しない問題を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズしました。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg テーブルの状態はストレージオブジェクト内には保持されなくなりました。これにより、ClickHouse における Iceberg を同時実行クエリでも利用できるようになります。[#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik))。
* S3Queue の ordered モードにおけるバケットロックを、`use_persistent_processing_nodes = 1` の場合の処理ノードと同様に、永続的なモードにしました。テストに keeper のフォールトインジェクションを追加しました。 [#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii))。
* フォーマット名にタイプミスがある場合にユーザーにヒントを提供するようにしました。 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761) をクローズ。 [#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* リモートレプリカでは、プロジェクションが存在しない場合、インデックス解析をスキップします。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* ytsaurus テーブルで UTF-8 エンコーディングを無効にできるようにしました。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* デフォルトで `s3_slow_all_threads_after_retryable_error` を無効化しました。[#87198](https://github.com/ClickHouse/ClickHouse/pull/87198)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* テーブル関数 `arrowflight` を `arrowFlight` に名称変更しました。 [#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-benchmark` を更新し、CLI フラグで `_` の代わりに `-` を受け付けるようにしました。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda))。
* シグナル処理における `system.crash_log` へのフラッシュを同期的に行うようにしました。 [#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `ORDER BY` 句が指定されていないトップレベルの `SELECT` クエリに `ORDER BY rand()` を挿入する設定 `inject_random_order_for_select_without_order_by` を追加しました。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn)).
* `joinGet` のエラーメッセージを改善し、`join_keys` の数が `right_table_keys` の数と一致しないことを正しく示すようにしました。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 書き込みトランザクション中に任意の Keeper ノードの stat を確認できるようにしました。これにより、ABA 問題の検出に役立ちます。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun))。
* 高負荷の ytsaurus リクエストを heavy プロキシにリダイレクト。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* ディスクトランザクションからのメタデータに対して、unlink/rename/removeRecursive/removeDirectory などのあらゆる操作のロールバックおよびハードリンク数を、どのようなワークロードにおいても正しく処理できるように修正し、さらにインターフェイスをより汎用的なものとするために簡素化して、他のメタストアでも再利用できるようにしました。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper で `TCP_NODELAY` を無効化できるようにする `keeper_server.tcp_nodelay` 構成パラメータを追加しました。 [#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* `clickhouse-benchmarks` で `--connection` をサポートしました。これは `clickhouse-client` がサポートしているものと同じで、コマンドライン引数でユーザー名/パスワードを明示的に指定しなくても済むように、クライアントの設定ファイル `config.xml` / `config.yaml` の `connections_credentials` パス配下にあらかじめ接続情報を定義できます。`clickhouse-benchmark` に `--accept-invalid-certificate` のサポートを追加しました。[#87370](https://github.com/ClickHouse/ClickHouse/pull/87370)（[Azat Khuzhin](https://github.com/azat)）。
* `max_insert_threads` の設定が Iceberg テーブルにも適用されるようになりました。 [#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin)).
* `PrometheusMetricsWriter` にヒストグラムおよびディメンション付きメトリクスを追加しました。これにより、`PrometheusRequestHandler` ハンドラーはすべての重要なメトリクスを備えるようになり、クラウド環境で信頼性が高くオーバーヘッドの小さいメトリクス収集に利用できるようになります。 [#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 関数 `hasToken` は、空トークンに対しては例外をスローするのではなく、一致数ゼロを返すようになりました。 [#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* `Array` と `Map`（`mapKeys` および `mapValues`）の値に対するテキストインデックスのサポートを追加しました。サポートされる関数は `mapContainsKey` と `has` です。[#87602](https://github.com/ClickHouse/ClickHouse/pull/87602)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 期限切れとなったグローバル ZooKeeper セッションの数を示す新しい `ZooKeeperSessionExpired` メトリクスを追加しました。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* バックアップ用に特化した設定（例：backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）を持つ S3 ストレージクライアントを、バックアップ先へのサーバーサイド（ネイティブ）コピーに使用するようにしました。また、s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error を廃止しました。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 実験的機能である `make_distributed_plan` を使用したクエリプランのシリアライズ時に、設定 `max_joined_block_size_rows` および `max_joined_block_size_bytes` が誤って処理される問題を修正しました。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 設定 `enable_http_compression` がデフォルトで有効になりました。これは、クライアントが HTTP 圧縮を受け入れる場合、サーバーがそれを使用することを意味します。ただし、この変更にはいくつかの欠点があります。クライアントは `bzip2` のような重い圧縮方式を要求することができ、これは現実的ではなく、サーバーのリソース消費を増加させます（ただし、これは大きな結果が転送される場合にのみ目立ちます）。クライアントは `gzip` を要求することもでき、これはそれほど悪くはありませんが、`zstd` と比べると最適ではありません。[#71591](https://github.com/ClickHouse/ClickHouse/issues/71591) をクローズします。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.server_settings` に新しいエントリ `keeper_hosts` を追加し、ClickHouse が接続可能な [Zoo]Keeper ホストの一覧を参照できるようにしました。 [#87718](https://github.com/ClickHouse/ClickHouse/pull/87718) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 履歴の調査を容易にするため、system ダッシュボードに `from` および `to` の値を追加しました。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* Iceberg の SELECT 処理におけるパフォーマンス追跡用の情報をさらに追加しました。 [#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik)).
* Filesystem cache の改善: キャッシュ内の領域を同時に予約する複数スレッド間で、キャッシュの優先度イテレータを再利用。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Keeper` のリクエストを制限する機能を追加しました（リクエストサイズを制限する `max_request_size` 設定で、`ZooKeeper` の `jute.maxbuffer` と同等です。後方互換性のためデフォルトは OFF で、今後のリリースで値が設定される予定です）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat))。
* `clickhouse-benchmark` がデフォルトでエラーメッセージにスタックトレースを含めないように変更しました。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* マークがキャッシュ内にある場合は、スレッドプールを利用した非同期マーク読み込み（`load_marks_asynchronously=1`）を有効化しないでください（プールに負荷がかかっていると、マークがすでにキャッシュ内にある場合でもクエリがそのコストの影響を受けてしまうため）。[#87967](https://github.com/ClickHouse/ClickHouse/pull/87967)（[Azat Khuzhin](https://github.com/azat)）。
* Ytsaurus：一部の列のみを含むテーブル／テーブル関数／辞書を作成できるように。[#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 今後、`system.zookeeper_connection_log` はデフォルトで有効となり、Keeper セッションに関する情報の取得に利用できます。 [#88011](https://github.com/ClickHouse/ClickHouse/pull/88011) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 重複した外部テーブルが渡される場合の TCP と HTTP の動作を一貫させました。HTTP では、一時テーブルを複数回渡すことが許可されています。 [#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema)).
* Arrow/ORC/Parquet の読み取り用のカスタム MemoryPool を削除します。現在はすべてのアロケーションを追跡しているため、[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 以降、このコンポーネントは不要となっています。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 引数を指定せずに `Replicated` データベースを作成できるようにしました。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`: clickhouse-keeper の TLS ポートへの接続をサポートし、フラグ名は clickhouse-client と同一に保持。 [#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* メモリ制限を超えたためにバックグラウンドマージが拒否された回数を計測する新しいプロファイルイベントを追加しました。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse))。
* CREATE/ALTER TABLE ステートメントのカラムのデフォルト式検証用アナライザーを有効にします。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus))。
* 内部クエリプランニングの改善: `CROSS JOIN` に JoinStepLogical を使用するように変更。 [#88151](https://github.com/ClickHouse/ClickHouse/pull/88151) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `hasAnyTokens` 関数に `hasAnyToken`、`hasAllTokens` 関数に `hasAllToken` というエイリアスを追加しました。 [#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* グローバルサンプリングプロファイラをデフォルトで有効化しました（クエリに関連しないサーバースレッドも含むすべてのスレッドが対象）：すべてのスレッドのスタックトレースを、CPU 時間および実時間で 10 秒ごとに収集します。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* コピー機能およびコンテナ作成機能で発生していた &#39;Content-Length&#39; の問題の修正を取り込むよう、Azure SDK を更新しました。 [#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* MySQL との互換性のため、`lag` 関数を大文字小文字の区別をしないようにしました。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* `clickhouse-server` ディレクトリから `clickhouse-local` を起動できるようにしました。以前のバージョンでは `Cannot parse UUID: .` というエラーが発生していました。現在は、サーバーを起動することなく `clickhouse-local` を起動し、サーバーのデータベースを操作できます。 [#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `keeper_server.coordination_settings.check_node_acl_on_remove` 設定を追加しました。この設定が有効な場合、各ノードの削除前に、そのノード自身と親ノードの両方の ACL が確認されます。無効な場合は、親ノードの ACL のみが確認されます。 [#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368)).
* `Vertical` フォーマットを使用する場合、`JSON` カラムが整形されて表示されるようになりました。 [#81794](https://github.com/ClickHouse/ClickHouse/issues/81794) をクローズします。 [#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* ホームディレクトリ直下ではなく、[XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 仕様で定義されている場所に `clickhouse-client` のファイル（例: クエリ履歴）を保存するようになりました。`~/.clickhouse-client-history` が既に存在する場合は、引き続き使用されます。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `GLOBAL IN` によるメモリリークを修正しました（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。 [#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* 文字列入力も受け付けられるよう、hasAny/hasAllTokens にオーバーロードを追加しました。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* `clickhouse-keeper` の postinstall スクリプトに、起動時に自動的に開始されるようにする手順を追加しました。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan))。
* Web UI では、すべてのキー入力のたびではなく、貼り付け時にのみ認証情報をチェックするようにしました。これにより、誤設定された LDAP サーバーで発生する問題を回避します。この変更により [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777) が解決されました。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 制約違反が発生した場合の例外メッセージの長さを制限しました。以前のバージョンでは、非常に長い文字列を挿入すると、例外メッセージも同様に非常に長くなり、そのまま `query_log` に書き込まれてしまうことがありました。この変更により [#87032](https://github.com/ClickHouse/ClickHouse/issues/87032) がクローズされました。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* テーブル作成時に ArrowFlight サーバーからデータセット構造を取得する処理を修正しました。 [#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* GeoParquet が原因で発生していたクライアントプロトコルエラーを修正しました。 [#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* イニシエーターノード上のサブクエリで shardNum() などのホスト依存関数が正しく解決されない問題を修正。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa)).
* `parseDateTime64BestEffort`、`change{Year,Month,Day}`、`makeDateTime64` など、さまざまな日時関連関数において、エポック以前の日付に対する小数秒の扱いが誤っていた問題を修正しました。以前は秒に加算すべき小数秒部分を、秒から減算していました。例えば、`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` は、本来の `1969-01-01 00:00:00.468` ではなく `1968-12-31 23:59:59.532` を返していました。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 同一の ALTER ステートメント内でカラムの状態が変化した場合に、ALTER COLUMN IF EXISTS コマンドが失敗していた問題を修正しました。DROP COLUMN IF EXISTS、MODIFY COLUMN IF EXISTS、COMMENT COLUMN IF EXISTS、RENAME COLUMN IF EXISTS などのコマンドは、同一ステートメント内で前のコマンドによって対象のカラムが削除されたケースも正しく処理するようになりました。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* サポート対象範囲外の日付に対する Date/DateTime/DateTime64 の型推論を修正。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* `AggregateFunction(quantileDD)` 列に対してユーザーが送信した一部の有効なデータにより、マージ処理が無限再帰を起こしてクラッシュする不具合を修正しました。 [#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi)).
* `cluster` テーブル関数で作成されたテーブルで JSON/Dynamic 型をサポートしました。 [#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar))。
* CTE で計算される関数の結果がクエリ内で非決定的になる問題を修正。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 主キー列に対する pointInPolygon を使用する EXPLAIN で発生していた LOGICAL&#95;ERROR を修正しました。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 名前にパーセントエンコードされたシーケンスを含むデータレイクテーブルの問題を修正。[#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) をクローズ。[#87020](https://github.com/ClickHouse/ClickHouse/pull/87020)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `optimize_functions_to_subcolumns` 使用時の `OUTER JOIN` における nullable 列での `IS NULL` の誤動作を修正し、[#78625](https://github.com/ClickHouse/ClickHouse/issues/78625) をクローズ。[#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `max_temporary_data_on_disk_size` 制限値の追跡処理において、一時データの解放分のカウントが誤っていた問題を修正し、[#87118](https://github.com/ClickHouse/ClickHouse/issues/87118) をクローズしました。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140)（[JIaQi](https://github.com/JiaQiTang98)）。
* 関数 `checkHeaders` は、提供されたヘッダーを適切に検証し、禁止されているヘッダーを拒否するようになりました。元の作者: Michael Anastasakis (@michael-anastasakis)。 [#87172](https://github.com/ClickHouse/ClickHouse/pull/87172) ([Raúl Marín](https://github.com/Algunenano))。
* すべての数値型に対して `toDate` および `toDate32` の動作を統一しました。int16 からのキャスト時の Date32 のアンダーフロー検査を修正しました。 [#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* parallel replicas 使用時の、特に LEFT/INNER JOIN の後に RIGHT JOIN が続く複数の JOIN を含むクエリに対する論理エラーを修正しました。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter))。
* スキーマ推論キャッシュで `input_format_try_infer_variants` 設定が反映されるようにしました。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar))。
* pathStartsWith がプレフィックス配下のパスにのみマッチするように変更。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* `_row_number` 仮想カラムおよび Iceberg の positioned delete における論理的エラーを修正しました。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* const ブロックと非 const ブロックが混在していることが原因で `JOIN` 内で発生する &quot;Too large size passed to allocator&quot; `LOGICAL_ERROR` を修正。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 別の `MergeTree` テーブルから読み取るサブクエリを含む軽量更新を修正しました。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* `row policy` が有効な場合に機能していなかった move-to-prewhere 最適化を修正しました。[#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) の継続です。[#69777](https://github.com/ClickHouse/ClickHouse/issues/69777) と [#83748](https://github.com/ClickHouse/ClickHouse/issues/83748) をクローズします。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* データパーツ内から欠落しているデフォルト式付きカラムへのパッチ適用を修正しました。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* MergeTree テーブルでパーティションフィールド名が重複している場合に発生していたセグメンテーションフォルトを修正しました。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* EmbeddedRocksDB のアップグレードを修正しました。 [#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* オブジェクトストレージ上の text index からの直接読み込みの問題を修正しました。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないエンジンに対する権限が付与されることを防止しました。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* `s3_plain_rewritable` では、見つからない（not found）エラーだけを無視するようにしました（その結果、さまざまな問題につながる可能性があります）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* YTSaurus をソースとし、*range&#95;hashed レイアウトを使用するディクショナリを修正しました。 [#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 空タプルの配列を作成する処理を修正。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 一時テーブル作成時に不正なカラムの有無をチェックするようにしました。 [#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* Hive パーティション列をフォーマットヘッダーに含めないようにしました。 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515) を修正します。 [#87528](https://github.com/ClickHouse/ClickHouse/pull/87528) ([Arthur Passos](https://github.com/arthurpassos)).
* テキスト形式使用時の DeltaLake におけるフォーマットからの読み取り準備処理を修正しました。 [#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* Buffer テーブルに対する SELECT および INSERT のアクセス権検証を修正。 [#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit)).
* S3 テーブルに対する data skipping index の作成を禁止しました。[#87554](https://github.com/ClickHouse/ClickHouse/pull/87554)（[Bharat Nallan](https://github.com/bharatnc)）。
* async ロギング（10 時間で約 100GiB 程度の大きなずれが発生し得る）および text&#95;log（ほぼ同程度のずれが発生し得る）におけるトラッキング対象メモリのリークを回避。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* 非同期で削除された View または Materialized View がバックグラウンドでのクリーンアップ完了前にサーバー再起動を行った場合、その View の `SELECT` の設定がグローバルなサーバー設定を上書きしてしまう可能性があったバグを修正しました。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* メモリ過負荷警告を計算する際、可能であればユーザー空間ページキャッシュのバイト数を除外します。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* CSV デシリアライズ時の型順序が誤っている場合に `LOGICAL_ERROR` が発生していたバグを修正しました。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 実行可能ディクショナリに対する `command_read_timeout` の誤った処理を修正。[#87627](https://github.com/ClickHouse/ClickHouse/pull/87627)（[Azat Khuzhin](https://github.com/azat)）。
* 新しい analyzer の使用時に、置換されたカラムを条件にフィルタリングする際の WHERE 句における `SELECT * REPLACE` の誤った挙動を修正しました。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* `Distributed` 上で `Merge` を使用した場合の 2 段階の集計の問題を修正しました。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* HashJoin アルゴリズムにおいて、右側の行リストが使用されない場合の出力ブロック生成処理を修正しました。[#87401](https://github.com/ClickHouse/ClickHouse/issues/87401) を修正。[#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* インデックス解析の適用後に読み取るデータが存在しない場合、Parallel replicas の読み取りモードが誤って選択される可能性がありました。 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653) をクローズ。 [#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi)).
* Glue における `timestamp` / `timestamptz` カラムの処理を修正。 [#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand)).
* これにより [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587) がクローズされます。[#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* PostgreSQL インターフェースにおける boolean 値の書き込みを修正。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov)).
* CTE を含む `INSERT SELECT` クエリで unknown table エラーが発生する問題を修正。[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* `Nullable` 内に含めることができない `Variant` からの null map サブカラムの読み取りを修正。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar))。
* クラスタ内のセカンダリノードでデータベースの削除に失敗した場合のエラー処理を修正。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 複数の skip index に関するバグを修正しました。 [#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* AzureBlobStorage において、まずネイティブコピーを試行し、&#39;Unauthroized&#39; エラー発生時には読み書きにフォールバックするよう変更しました（AzureBlobStorage で、ソースとデスティネーションのストレージアカウントが異なる場合には &#39;Unauthorized&#39; エラーが発生します）。また、設定でエンドポイントが定義されている場合に &quot;use&#95;native&#95;copy&quot; を適用できるよう修正しました。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* ArrowStream ファイルに一意でない辞書が含まれている場合に ClickHouse がクラッシュする不具合を修正。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn)).
* approx&#95;top&#95;k と finalizeAggregation の併用時に発生する致命的なエラーを修正。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 最後のブロックが空の場合のプロジェクションを用いたマージを修正。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano)).
* 引数型が GROUP BY で許可されていない場合でも、GROUP BY から単射関数が削除されないようにしました。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリで `session_timezone` 設定を使用している場合に、日時をキーとするグラニュール/パーティションの除外が正しく行われない不具合を修正。 [#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa)).
* PostgreSQL インターフェイスで、クエリ実行後に影響を受けた行数を返すようにしました。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov)).
* 誤った結果を引き起こす可能性があるため、PASTE JOIN に対するフィルタープッシュダウンの使用を制限しました。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) で導入された権限チェックを評価する前に、URI の正規化を適用します。[#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 新しいアナライザで、ARRAY JOIN COLUMNS() がどの列にも一致しない場合に発生していた論理エラーを修正しました。[#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 「High ClickHouse memory usage」警告を修正し、ページキャッシュを除外。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* 列の `TTL` が設定されている `MergeTree` テーブルで発生しうるデータ破損を修正しました。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 外部データベース（`PostgreSQL`/`SQLite`/...）に不正なテーブルがアタッチされている場合に、`system.tables` を読み取る際に発生し得る捕捉されない例外を修正しました。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat))。
* 空のタプルを引数として渡した場合に `mortonEncode` および `hilbertEncode` 関数がクラッシュする問題を修正しました。 [#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* これにより、クラスタ内に非アクティブなレプリカが存在する場合でも、`ON CLUSTER` クエリの実行時間が短縮されます。 [#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin)).
* DDL worker は、レプリカセットから不要になったホストをクリーンアップするようになりました。これにより、ZooKeeper に保存されるメタデータ量が削減されます。 [#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin))。
* cgroups を使用せずに ClickHouse を実行できない問題を修正しました（非同期メトリクスで誤って cgroups を必須としていました）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* エラー発生時にディレクトリ移動操作を正しくロールバックできるようにしました。ルートのものだけでなく、実行中に変更されたすべての `prefix.path` オブジェクトを書き直す必要があります。 [#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun))。
* `ColumnLowCardinality` における `is_shared` フラグの伝播を修正しました。これは、`ReverseIndex` でハッシュ値が事前に計算されてキャッシュされた後に新しい値がカラムへ挿入されると、誤った GROUP BY 結果をもたらす可能性がありました。 [#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat)).
* ワークロード設定 `max_cpu_share` を修正し、`max_cpus` ワークロード設定が設定されていなくても使用できるようになりました。 [#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria))。
* サブクエリを含む非常に重いミューテーションが prepare 段階でハングしてしまう不具合を修正しました。これらのミューテーションは `SYSTEM STOP MERGES` で停止できるようになりました。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 相関サブクエリがオブジェクトストレージでも動作するようになりました。 [#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin)).
* `system.projections` および `system.data_skipping_indices` にアクセスしている間は、DataLake データベースを初期化しようとしないようにしました。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* `show_data_lake_catalogs_in_system_tables` が明示的に有効化された場合にのみ、データレイクのカタログがシステムのイントロスペクションテーブルに表示されるようになりました。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin)).
* DatabaseReplicated が `interserver_http_host` 設定を正しく参照するように修正しました。 [#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 位置引数は、内部クエリ段階では意味を成さないため、Projection の定義コンテキストにおいて明示的に無効化されました。これにより [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604) が修正されました。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* `countMatches` 関数の二乗オーダーの計算量を修正しました。[#88400](https://github.com/ClickHouse/ClickHouse/issues/88400) をクローズ。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* KeeperMap テーブルに対する `ALTER COLUMN ... COMMENT` コマンドがレプリケートされ、Replicated データベースのメタデータにコミットされて、すべてのレプリカに伝播されるようにしました。 [#88077](https://github.com/ClickHouse/ClickHouse/issues/88077) をクローズしました。 [#88408](https://github.com/ClickHouse/ClickHouse/pull/88408) ([Eduard Karacharov](https://github.com/korowa))。
* Replicated データベースにおけるマテリアライズドビューで、誤検出されていた循環依存関係を修正しました。これにより、新しいレプリカをデータベースに追加できない問題が解消されました。 [#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique))。
* `group_by_overflow_mode` が `any` に設定されている場合の疎列の集約処理を修正。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa))。
* 複数の FULL JOIN USING 句とともに `query_plan_use_logical_join_step=0` を使用した際に発生する「column not found」エラーを修正。[#88103](https://github.com/ClickHouse/ClickHouse/issues/88103) をクローズ。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* ノード数が 10 を超える大規模クラスタでは、`[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` というエラーによりリストアが失敗する確率が高くなります。`num_hosts` ノードが多数のホストから同時に上書きされてしまうためです。この修正により、試行回数を制御するための設定を動的にしました。[#87721](https://github.com/ClickHouse/ClickHouse/issues/87721) をクローズ。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* このPRは、バージョン23.8およびそれ以前との互換性を確保するためのものです。互換性の問題は次のPRによって導入されました: [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) このSQLは `enable_analyzer=0` の場合に失敗します（23.8以前では問題ありませんでした）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 大きな数値を DateTime に変換する際の `accurateCast` エラーメッセージで発生する UBSAN の整数オーバーフローを修正しました。 [#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* タプル型に対する CoalescingMergeTree を修正しました。これにより、[#88469](https://github.com/ClickHouse/ClickHouse/issues/88469) が解決されます。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* `iceberg_format_version=1` に対する削除操作を禁止しました。この変更により [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444) がクローズされました。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* このパッチは、任意の深さのフォルダにおける `plain-rewritable` ディスクの move 操作を修正します。 [#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun))。
* *cluster 関数における SQL SECURITY DEFINER の問題を修正。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* `const PREWHERE` の基盤となる列に対する同時ミューテーションが原因となり得るクラッシュを修正しました。 [#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat))。
* テキストインデックスからの読み取りを修正し、クエリ条件キャッシュ（設定 `use_skip_indexes_on_data_read` および `use_query_condition_cache` が有効な場合）を有効にしました。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` から送出された `Poco::TimeoutException` 例外により、SIGABRT によってプロセスがクラッシュする不具合を修正しました。 [#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) でバックポート済み: 復旧後に、Replicated データベースのレプリカが長時間にわたり `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを出力し続けたままスタックしてしまうことがありましたが、この問題は修正されました。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* 設定の再読み込み後に ClickHouse が初めて接続する場合、`system.zookeeper_connection_log` への追記が正しく行われるよう修正しました。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* タイムゾーンを利用している場合に、`date_time_overflow_behavior = 'saturate'` を指定して DateTime64 を Date に変換すると、範囲外の値に対して誤った結果が返される可能性があった不具合を修正しました。 [#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* キャッシュを有効にした S3 テーブルエンジンで発生する「having zero bytes error」を修正する N 回目の試み。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `loop` テーブル関数に対する SELECT 実行時のアクセス権限検証を修正しました。 [#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit)).
* 非同期ロギングが失敗した場合に例外を捕捉し、プログラムの異常終了を防ぎます。 [#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) でバックポート済み: 引数が 1 つだけで呼び出された場合に `threshold` パラメータを正しく考慮するように `top_k` を修正。[#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) にバックポート済み: 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、長さ 4 の UTF-8 コードポイントのバイト列を誤って反転していました。これにより [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) にバックポート: SQL SECURITY DEFINER を指定してビューを作成する際に、`SET DEFINER <current_user>:definer` へのアクセスチェックを行わないようにしました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) にバックポート: 部分的な `QBit` 読み取りの最適化により、`p` が `Nullable` の場合に戻り値型から誤って `Nullable` が削除されていたために発生していた `L2DistanceTransposed(vec1, vec2, p)` の `LOGICAL_ERROR` を修正しました。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) にバックポート済み: 不明なカタログタイプで発生するクラッシュを修正。[#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解決。 [#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) にバックポート済み: スキップインデックスの解析におけるパフォーマンス低下を修正しました。 [#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### ビルド/テスト/パッケージングの改善

- `postgres`ライブラリバージョン18.0を使用。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- FreeBSD向けにICUを有効化。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano))。
- SSE 4.2への動的ディスパッチを使用する際に、SSE 4ではなくSSE 4.2を使用。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano))。
- `Speculative Store Bypass Safe`が利用できない場合、`NO_ARMV81_OR_HIGHER`フラグを不要に。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- ClickHouseが`ENABLE_LIBFIU=OFF`でビルドされた場合、failpoint関連の関数は何も実行せず、パフォーマンスに影響を与えなくなります。その場合、`SYSTEM ENABLE/DISABLE FAILPOINT`クエリは`SUPPORT_IS_DISABLED`エラーを返します。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end))。

### ClickHouseリリース25.9、2025-09-25 {#259}

#### 後方互換性のない変更

- IPv4/IPv6との無意味な二項演算を無効化: IPv4/IPv6と非整数型との加算/減算を無効化。以前は浮動小数点型との演算を許可し、他の一部の型(DateTimeなど)では論理エラーをスローしていました。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano))。
- 設定`allow_dynamic_metadata_for_data_lakes`を非推奨化。現在、すべてのicebergテーブルは各クエリの実行前にストレージから最新のテーブルスキーマを取得しようとします。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik))。
- `OUTER JOIN ... USING`句からの結合カラムの解決をより一貫性のあるものに変更: 以前は、OUTER JOINでUSINGカラムと修飾カラム(`a, t1.a, t2.a`)の両方を選択した場合、USINGカラムは誤って`t1.a`に解決され、左側にマッチしない右テーブルの行に対して0/NULLを表示していました。現在、USING句の識別子は常に結合カラムに解決され、修飾識別子は非結合カラムに解決されます。これはクエリに他のどの識別子が存在するかに関係ありません。例: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前: a=0, t1.a=0, t2.a=2 (不正 - 'a'がt1.aに解決される) -- 変更後: a=2, t1.a=0, t2.a=2 (正しい - 'a'は結合される)。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir))。
- レプリケーション重複排除ウィンドウを10000まで増加。これは完全に互換性がありますが、多数のテーブルが存在する場合、この変更が高いリソース消費につながるシナリオが考えられます。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema))。


#### 新機能

* ユーザーは、NATS エンジンで新しい設定項目 `nats_stream` と `nats_consumer` を指定することで、NATS JetStream を利用してメッセージを購読できるようになりました。 [#84799](https://github.com/ClickHouse/ClickHouse/pull/84799) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* `arrowFlight` テーブル関数に認証とSSLのサポートを追加しました。[#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar))。
* AWS がサポートする Intelligent Tiering を指定できるようにするため、`storage_class_name` という名前の新しいパラメータを `S3` テーブルエンジンと `s3` テーブル関数に追加しました。キー値形式および位置引数形式（非推奨）の両方がサポートされます。 [#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin)).
* Iceberg テーブルエンジン用の `ALTER UPDATE`。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12)).
* SELECT 文で Iceberg メタデータファイルを取得できるように、システムテーブル `iceberg_metadata_log` を追加しました。 [#86152](https://github.com/ClickHouse/ClickHouse/pull/86152) ([scanhex12](https://github.com/scanhex12)).
* `Iceberg` および `DeltaLake` テーブルで、ストレージレベル設定 `disk` によるカスタムディスク構成がサポートされます。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12)).
* Azure をデータレイク用ディスクとしてサポート。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* Azure Blob Storage 上の `Unity` カタログをサポートしました。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* `Iceberg` への書き込みで、より多くのフォーマット（`ORC`、`Avro`）をサポートしました。これにより [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179) がクローズされました。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* データベースレプリカに関する情報を含む新しいシステムテーブル `database_replicas` を追加。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov)).
* 配列を集合として扱い、一方の配列から他方の配列の要素を除外する関数 `arrayExcept` を追加しました。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x))。
* 新しい `system.aggregated_zookeeper_log` テーブルを追加します。このテーブルには、セッション ID、親パス、操作タイプごとにグループ化された ZooKeeper 操作の統計情報（例：操作数、平均レイテンシ、エラー数）が含まれており、定期的にディスクにフラッシュされます。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新しい関数 `isValidASCII`。入力文字列または FixedString が ASCII バイト値 (0x00–0x7F) のみを含む場合は 1、それ以外の場合は 0 を返します。[#85377](https://github.com/ClickHouse/ClickHouse/issues/85377) をクローズ。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* ブール値の設定は引数なしで指定できます。例えば `SET use_query_cache;` は、それを true に設定するのと同等です。[#85800](https://github.com/ClickHouse/ClickHouse/pull/85800)（[thraeka](https://github.com/thraeka)）。
* 新しい設定オプション `logger.startupLevel` と `logger.shutdownLevel` により、それぞれ ClickHouse の起動時およびシャットダウン時のログレベルを上書きできるようになりました。 [#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 集計関数 `timeSeriesChangesToGrid` および `timeSeriesResetsToGrid`。`timeSeriesRateToGrid` と同様に動作し、開始タイムスタンプ、終了タイムスタンプ、ステップ、ルックバックウィンドウのパラメータに加え、タイムスタンプと値の 2 つの引数を受け取りますが、各ウィンドウで必要となる最小サンプル数が 2 から 1 に緩和されています。PromQL の `changes`/`resets` を計算し、パラメータで定義された時間グリッド内の各タイムスタンプについて、指定されたウィンドウ内でサンプル値が変化した回数、または減少した回数をカウントします。戻り値の型は `Array(Nullable(Float64))` です。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010)（[Stephen Chi](https://github.com/stephchi0)）。
* 一時テーブル（`CREATE TEMPORARY TABLE`）と同様の構文で、`CREATE TEMPORARY VIEW` を使用して一時ビューを作成できるようになりました。[#86432](https://github.com/ClickHouse/ClickHouse/pull/86432)（[Aly Kafoury](https://github.com/AlyHKafoury)）。
* CPU およびメモリ使用量に関する警告を`system.warnings`テーブルに追加しました。 [#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc))。
* `Protobuf` 入力で `oneof` インジケーターをサポートします。専用のカラムを使用して、oneof の一部が存在するかどうかを示すことができます。メッセージに [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) が含まれており、`input_format_protobuf_oneof_presence` が設定されている場合、ClickHouse は、oneof のどのフィールドが見つかったかを示すカラムを設定します。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* jemalloc の内部ツールに基づくアロケーションプロファイリングを改善しました。グローバル jemalloc プロファイラは、設定 `jemalloc_enable_global_profiler` により有効化できるようになりました。サンプリングされたグローバルなメモリアロケーションおよび解放は、設定 `jemalloc_collect_global_profile_samples_in_trace_log` を有効化することで、`system.trace_log` の `JemallocSample` 型として保存できるようになりました。jemalloc プロファイリングは、設定 `jemalloc_enable_profiler` を使用してクエリごとに個別に有効化できるようになりました。`system.trace_log` へのサンプル保存は、設定 `jemalloc_collect_profile_samples_in_trace_log` を使用してクエリ単位で制御できます。jemalloc をより新しいバージョンに更新しました。 [#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* Iceberg テーブルの DROP 時にファイルを削除するための新しい設定を追加しました。これにより [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211) がクローズされました。 [#86501](https://github.com/ClickHouse/ClickHouse/pull/86501) ([scanhex12](https://github.com/scanhex12))。



#### 実験的機能
* インバーテッドテキストインデックスを一から再設計し、RAM に収まらないデータセットにもスケールできるようにしました。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* JOIN の並べ替えで統計情報を利用するようになりました。この機能は `allow_statistics_optimize = 1` および `query_plan_optimize_join_order_limit = 10` を設定することで有効化できます。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* `alter table ... materialize statistics all` をサポートしました。これにより、テーブルのすべての統計情報をマテリアライズできます。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 読み取り時にスキップインデックスを利用してデータパーツをフィルタリングし、不要なインデックス読み取りを削減できるようにしました。この機能は、新しい設定 `use_skip_indexes_on_data_read`（デフォルトでは無効）で制御されます。これは [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774) に対処するものです。また、[#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) と共通する基盤的な変更も一部含まれています。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* JOIN の順序を自動的に並べ替えてパフォーマンスを向上させる JOIN 順序最適化機能を追加しました（`query_plan_optimize_join_order_limit` 設定で制御できます）。なお、この JOIN 順序最適化は現時点では統計情報のサポートが限定的であり、主にストレージエンジンによる行数推定値に依存しています。今後のリリースで、より高度な統計情報の収集とカーディナリティ推定が追加される予定です。**アップグレード後に JOIN クエリで問題が発生した場合**は、一時的な回避策として `SET query_plan_use_new_logical_join_step = 0` を設定して新しい実装を無効化し、調査のために問題を報告してください。**USING 句からの識別子解決に関する注意**: `OUTER JOIN ... USING` 句における合成（coalesced）列の解決方法を、より一貫性のあるものに変更しました。以前は、OUTER JOIN で USING 列と修飾付き列（`a, t1.a, t2.a`）の両方を選択した場合、USING 列が誤って `t1.a` に解決され、左側にマッチしない右表の行に対して 0/NULL を表示していました。現在は、USING 句からの識別子は常に合成列に解決され、修飾付き識別子は、クエリ内に他にどのような識別子が存在していても、非合成列に解決されます。例えば: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前: a=0, t1.a=0, t2.a=2（誤り - &#39;a&#39; が t1.a に解決されている） -- 変更後: a=2, t1.a=0, t2.a=2（正しい - &#39;a&#39; は合成されている）。 [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイク向けの分散 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12))。
* `func(primary_column) = 'xx'` や `column in (xxx)` のような条件に対する PREWHERE 句の最適化を改善しました。 [#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li))。
* JOIN の書き換えを実装しました。1. 一致する行または一致しない行に対するフィルタ条件が常に false の場合、`LEFT ANY JOIN` と `RIGHT ANY JOIN` を `SEMI` / `ANTI` JOIN に変換します。この最適化は、新しい設定項目 `query_plan_convert_any_join_to_semi_or_anti_join` によって制御されます。2. 片側の一致しない行に対するフィルタ条件が常に false の場合、`FULL ALL JOIN` を `LEFT ALL` または `RIGHT ALL` JOIN に変換します。[#86028](https://github.com/ClickHouse/ClickHouse/pull/86028)（[Dmitry Novik](https://github.com/novikd)）。
* 軽量削除実行後の縦型マージのパフォーマンスを改善しました。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* `LEFT/RIGHT` join で多くの非マッチ行が発生する場合の `HashJoin` のパフォーマンスをわずかに改善しました。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat))。
* 基数ソート: コンパイラによるSIMDの利用と、より効率的なプリフェッチを可能にします。Intel CPU 上でのみソフトウェア・プリフェッチを使用するために動的ディスパッチを行います。[https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) における @taiyang-li による作業を継続したものです。 [#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 多数のパーツを含むテーブルに対する短いクエリのパフォーマンスを改善しました（`deque` の代わりに `devector` を使用して `MarkRanges` を最適化）。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* `join` モードでのパッチパーツ適用のパフォーマンスが向上しました。 [#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 設定 `query_condition_cache_selectivity_threshold`（デフォルト値: 1.0）を追加しました。この設定により、選択性の低い述語のスキャン結果を query condition cache への挿入対象から除外します。これにより、キャッシュヒット率が低下する代わりに、query condition cache のメモリ消費量を削減できます。 [#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai)).
* Iceberg 書き込み時のメモリ使用量を削減しました。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).





#### 改善

* 単一の挿入操作で Iceberg に複数のデータファイルを書き込めるようにしました。上限を制御するための新しい設定 `iceberg_insert_max_rows_in_data_file` と `iceberg_insert_max_bytes_in_data_file` を追加しました。[#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* Delta Lake に挿入されるデータファイルに対して、行数／バイト数の上限を追加しました。設定項目 `delta_lake_insert_max_rows_in_data_file` および `delta_lake_insert_max_bytes_in_data_file` で制御できます。 [#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg への書き込みにおいて、パーティションで利用できる型をさらにサポートしました。これにより [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206) が解決されました。 [#86298](https://github.com/ClickHouse/ClickHouse/pull/86298) ([scanhex12](https://github.com/scanhex12)).
* S3 のリトライ戦略を設定可能にし、設定 XML ファイルの変更時に S3 ディスクの設定をホットリロードできるようにしました。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* S3(Azure)Queue テーブルエンジンを改善し、ZooKeeper への接続が失われても重複が発生することなく処理を継続できるようにしました。これには、S3Queue 設定 `use_persistent_processing_nodes` を有効にする必要があります（`ALTER TABLE MODIFY SETTING` で変更可能）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* マテリアライズドビューを作成する際、`TO` の後にクエリパラメーターを使用できます。例えば、`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table` のように指定します。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899)（[Diskein](https://github.com/Diskein)）。
* `Kafka2` テーブルエンジンに対して誤った設定が指定された場合のユーザー向けの案内を、より分かりやすくしました。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `Time` 型に対してタイムゾーンを指定することはできなくなりました（そもそも意味のない仕様だったためです）。[#84689](https://github.com/ClickHouse/ClickHouse/pull/84689)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* `best_effort` モードにおける Time/Time64 のパース処理ロジックを簡略化し、いくつかのバグを回避しました。 [#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `deltaLakeAzureCluster` 関数（クラスターモード用の `deltaLakeAzure` と同様）および `deltaLakeS3Cluster` 関数（`deltaLakeCluster` のエイリアス）を追加しました。これにより [#85358](https://github.com/ClickHouse/ClickHouse/issues/85358) が解決されました。 [#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* バックアップ時と同様に、通常のコピー操作にも `azure_max_single_part_copy_size` 設定を適用するようにしました。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* S3 オブジェクトストレージにおいて、再試行可能なエラーが発生した場合に S3 クライアントスレッドを減速させます。これにより、従来の設定 `backup_slow_all_threads_after_retryable_s3_error` が S3 ディスクにも適用され、より汎用的な名前である `s3_slow_all_threads_after_retryable_error` に変更されます。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva))。
* 設定 allow&#95;experimental&#95;variant/dynamic/json および enable&#95;variant/dynamic/json を廃止予定としてマークしました。現在はこれら 3 種類の型がすべて無条件に有効になっています。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* `http_handlers` において、スキーマおよびホスト:ポートを含む完全な URL 文字列（`full_url` ディレクティブ）によるフィルタリングをサポート。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `allow_experimental_delta_lake_writes` を追加。[#86180](https://github.com/ClickHouse/ClickHouse/pull/86180)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* init.d スクリプトでの systemd 検出を修正し、「Install packages」チェックの問題を解決。 [#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat)).
* 新しい `startup_scripts_failure_reason` 次元メトリクスを追加しました。このメトリクスは、起動スクリプトの失敗を引き起こすエラー種別を区別するために必要です。特にアラート用途では、一過性のエラー（例：`MEMORY_LIMIT_EXCEEDED` や `KEEPER_EXCEPTION`）と非一過性のエラーを区別する必要があります。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* Iceberg テーブルのパーティション定義で `identity` 関数を省略できるようにしました。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 特定のチャンネルに対してのみ JSON ログ出力を有効化できる機能を追加しました。これを行うには、`logger.formatting.channel` を `syslog` / `console` / `errorlog` / `log` のいずれかに設定します。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` でネイティブな数値を使用できるようにしました。これらはすでに論理関数の引数として使用可能でした。これにより、filter-push-down および move-to-prewhere の最適化が簡素化されます。 [#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* メタデータが破損している Catalog に対して `SYSTEM DROP REPLICA` を実行した際に発生するエラーを修正しました。 [#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Azure ではアクセスのプロビジョニングに長時間かかる場合があるため、ディスクアクセスチェック（`skip_access_check = 0`）に対するリトライを追加しました。 [#86419](https://github.com/ClickHouse/ClickHouse/pull/86419) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `timeSeries*()` 関数におけるステイルネスウィンドウを左開・右閉の区間としました。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* `FailedInternal*Query` プロファイルイベントを追加しました。[#86627](https://github.com/ClickHouse/ClickHouse/pull/86627)（[Shane Andrade](https://github.com/mauidude)）。
* 設定ファイルから追加された際に、名前にドットを含むユーザーの扱いを修正。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme))。
* クエリのメモリ使用量を示す非同期メトリクス（`QueriesMemoryUsage` および `QueriesPeakMemoryUsage`）を追加しました。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat))。
* `clickhouse-benchmark --precise` フラグを使用すると、QPS およびその他のインターバルごとのメトリクスを、より正確にレポートできます。クエリの実行時間がレポート間隔 `--delay D` と同程度である場合でも、安定した QPS を得るのに役立ちます。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa))。
* Linux スレッドの nice 値を設定できるようにし、一部のスレッド（merge/mutate、query、materialized view、zookeeper client）に高いまたは低い優先度を割り当てられるようにしました。 [#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 競合状態が原因でマルチパートアップロード中に元の例外が失われた場合に発生していた、誤解を招く「specified upload does not exist」エラーを修正。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* `EXPLAIN` クエリにおけるクエリプランの説明を制限し、`EXPLAIN` 以外のクエリについては説明を生成しないようにしました。`query_plan_max_step_description_length` という設定を追加しました。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* クエリプロファイラ（`query_profiler_real_time_period_ns`/`query_profiler_cpu_time_period_ns`）における `CANNOT&#95;CREATE&#95;TIMER` を回避するための試みとして、保留中のシグナル数を調整できるようにしました。また、イントロスペクションのために `/proc/self/status` から `SigQ` を収集する機能も追加しました（`ProcessSignalQueueSize` が `ProcessSignalQueueLimit` に近い場合、`CANNOT_CREATE_TIMER` エラーが発生する可能性が高くなります）。[#86760](https://github.com/ClickHouse/ClickHouse/pull/86760)（[Azat Khuzhin](https://github.com/azat)）。
* Keeper における `RemoveRecursive` リクエストのパフォーマンスを改善。 [#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* JSON 型の出力時に `PrettyJSONEachRow` 内の余分な空白を削除しました。 [#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar)).
* プレーンな書き換え可能ディスクでディレクトリが削除されるときに、`prefix.path` の BLOB のサイズを書き込むようにしました。[#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin))。
* リモートの ClickHouse インスタンス（ClickHouse Cloud を含む）に対してパフォーマンス テストを実行できるようになりました。使用例: `tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。[#86995](https://github.com/ClickHouse/ClickHouse/pull/86995) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 16MiBを超えるメモリを割り当てることが分かっている一部の処理箇所（ソート、非同期インサート、ファイルログ）において、メモリ制限を遵守するようにしました。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* `network_compression_method` にサポートされていない汎用コーデックが設定された場合は例外をスローするようにしました。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* システムテーブル `system.query_cache` は、これまでは共有エントリ、または同一ユーザーかつ同一ロールの非共有エントリのみを返していましたが、現在は *すべての* クエリ結果キャッシュエントリを返します。非共有エントリは *クエリ結果* を公開しない前提になっている一方で、`system.query_cache` が返すのは *クエリ文字列* だけなので問題ありません。これにより、このシステムテーブルの動作は `system.query_log` により近いものになります。 [#87104](https://github.com/ClickHouse/ClickHouse/pull/87104) ([Robert Schulze](https://github.com/rschu1ze))。
* `parseDateTime` 関数の短絡評価を有効にしました。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar))。
* `system.parts_columns` に新しい列 `statistics` を追加しました。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* レプリカ構成のデータベースおよび内部レプリケーションされるテーブルに対しては、`ALTER` クエリの結果はイニシエーターノード上でのみ検証されるようになりました。これにより、すでにコミット済みの `ALTER` クエリが他のノードで処理が停止してしまう状況が解消されます。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `BackgroundSchedulePool` 内の各タイプのタスク数を制限します。1 つのタイプのタスクが全スロットを占有して他のタスクが処理されずに待ち続ける状況を回避し、さらにタスク同士が互いを待ち合うことによるデッドロックも防止します。これはサーバー設定 `background_schedule_pool_max_parallel_tasks_per_type_ratio` によって制御されます。 [#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* データベースレプリカを復旧する際に、テーブルが正しく停止されるようにしました。不適切な停止により、データベースレプリカ復旧中に一部のテーブルエンジンで `LOGICAL_ERROR` が発生していた問題を修正しました。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* データベース名のタイプミス修正ヒントを生成する際に、アクセス権を確認するようにしました。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd))。
* 1. hive カラムに対する LowCardinality 対応 2. 仮想カラムより前に hive カラムを設定（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要） 3. hive の空フォーマットに対する LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. hive のパーティションカラムだけが存在する場合のチェックを修正 5. すべての hive カラムがスキーマで指定されていることをアサート 6. hive を用いる parallel&#95;replicas&#95;cluster の部分的な修正 7. hive utils の extractkeyValuePairs で順序付きコンテナを使用（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要）。 [#85538](https://github.com/ClickHouse/ClickHouse/pull/85538) ([Arthur Passos](https://github.com/arthurpassos)).
* 配列マッピング使用時にエラーの原因となることがあった `IN` 関数の第1引数に対する不要な最適化を防止しました。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* parquet ファイルが書き込まれた際、Iceberg の source id と parquet 名の対応付けがスキーマに合わせて調整されていませんでした。この PR では、現在のスキーマではなく、各 Iceberg データファイルに対応するスキーマを処理するように変更しました。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik))。
* ファイルを開く処理とは別にファイルサイズを読み取っていた処理を修正しました。これは、Linux カーネルの `5.10` リリース以前に存在したバグへの対応として導入された [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) に関連しています。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* カーネルレベルで IPv6 が無効化されているシステム（例: ipv6.disable=1 が設定された RHEL）でも、ClickHouse Keeper が起動に失敗しなくなりました。初期の IPv6 リスナーが失敗した場合、IPv4 リスナーへのフォールバックを試みるようになりました。 [#85901](https://github.com/ClickHouse/ClickHouse/pull/85901) ([jskong1124](https://github.com/jskong1124)).
* この PR は [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990) をクローズします。globalJoin において並列レプリカ用の TableFunctionRemote サポートを追加しました。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* orcschemareader::initializeifneeded() におけるヌルポインタを修正しました。この PR は次の issue に対処します: [#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### ユーザー向け変更のドキュメント記載。[#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510)).
* 外側のクエリのカラムを使用している場合にのみ、FROM 句内で相関サブクエリを許可するためのチェックを追加しました。 [#85469](https://github.com/ClickHouse/ClickHouse/issues/85469) を修正。 [#85402](https://github.com/ClickHouse/ClickHouse/issues/85402) を修正。 [#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 他のカラムの `MATERIALIZED` 式でサブカラムとして使用されているカラムに対する `ALTER UPDATE` の動作を修正しました。以前は、式内にサブカラムを含む `MATERIALIZED` カラムが正しく更新されていませんでした。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムが PK またはパーティション式で使用されている列を変更することを禁止。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* DeltaLake ストレージで、デフォルト以外のカラムマッピングモードの使用時にサブカラムの読み取りを修正。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Enum ヒントを持つ JSON 内のパスに対して誤ったデフォルト値が使用される問題を修正。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* 入力をサニタイズしつつ DataLake Hive カタログ URL を解析。[#86018](https://github.com/ClickHouse/ClickHouse/issues/86018) をクローズ。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* ファイルシステムキャッシュの動的リサイズ時に発生する論理エラーを修正。 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122) をクローズ。 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473) をクローズ。 [#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DatabaseReplicatedSettings で `logs_to_keep` に `NonZeroUInt64` を使用するようにしました。[#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach))。
* テーブル（例：`ReplacingMergeTree`）が `index_granularity_bytes = 0` の設定で作成されている場合、スキップインデックスを使用した `FINAL` クエリで例外がスローされていました。この例外は修正されました。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer))。
* UB を除去し、Iceberg パーティション式の解析に関する問題を修正します。 [#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 単一の INSERT 内で const ブロックと非 const ブロックが混在している場合に発生するクラッシュを修正。[#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat))。
* SQL からディスクを作成する際に、デフォルトで `/etc/metrika.xml` の include を処理するようになりました。 [#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar)).
* String から JSON への accurateCastOrNull/accurateCastOrDefault に関する不具合を修正。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* iceberg エンジンで「/」を含まないディレクトリをサポートしました。 [#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* replaceRegex において、FixedString 型の文字列をハイスタックとし、空の needle を指定した場合にクラッシュする問題を修正。 [#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano))。
* ALTER UPDATE で Nullable(JSON) を扱う際に発生していたクラッシュを修正。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar)).
* system.tables で不足していた列定義を修正。[#86295](https://github.com/ClickHouse/ClickHouse/pull/86295)（[Raúl Marín](https://github.com/Algunenano)）。
* LowCardinality(Nullable(T)) から Dynamic へのキャストを修正。[#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar))。
* DeltaLake への書き込み時に発生する論理エラーを修正しました。[#86175](https://github.com/ClickHouse/ClickHouse/issues/86175) をクローズしました。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* plain&#95;rewritable ディスクで Azure Blob Storage から空の BLOB を読み取る際に発生する `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` エラーを修正しました。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* GROUP BY での Nullable(JSON) の扱いを修正。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar))。
* Materialized View に関する不具合を修正しました。同じ名前の MV を作成して削除した後に再作成すると、MV が動作しないことがありました。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix)).
* *cluster 関数から読み込む際に、すべてのレプリカが利用不能な場合は失敗するようにしました。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher))。
* `Buffer` テーブルにより発生していた `MergesMutationsMemoryTracking` のリークを修正し、`Kafka`（およびその他）からのストリーミング時の `query_views_log` を修正。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* エイリアスストレージが参照するテーブルを削除した後における `SHOW TABLES` の動作を修正。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* send&#95;chunk&#95;header 設定が有効な状態で、UDF が HTTP プロトコル経由で呼び出された場合にチャンクヘッダーが欠落する問題を修正しました。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir)).
* jemalloc のプロファイルフラッシュが有効な場合に発生する可能性があるデッドロックを修正。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* DeltaLake テーブルエンジンにおけるサブカラムの読み取り処理を修正。[#86204](https://github.com/ClickHouse/ClickHouse/issues/86204) をクローズ。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477) ([Kseniia Sumarokova](https://github.com/kssenii))。
* DDL タスク処理時の衝突を回避するため、ループバックホスト ID を正しく扱うようにしました。 [#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach)).
* numeric/decimal 列を含む PostgreSQL データベースエンジンのテーブルに対する detach/attach の処理を修正しました。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher)).
* getSubcolumnType における未初期化メモリの使用問題を修正。[#86498](https://github.com/ClickHouse/ClickHouse/pull/86498)（[Raúl Marín](https://github.com/Algunenano)）。
* 空の needles を指定して呼び出した場合、関数 `searchAny` と `searchAll` は、現在は `true`（いわゆる「すべてにマッチする」）を返すようになりました。以前は `false` を返していました。（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 最初のバケットに値がない場合の `timeSeriesResampleToGridWithStaleness()` 関数の不具合を修正しました。 [#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar))。
* `merge_tree_min_read_task_size` が 0 に設定されている場合に発生するクラッシュを修正しました。 [#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510))。
* 読み取り時に、各データファイルのフォーマットを Iceberg メタデータから取得するようにしました（以前はテーブル引数から取得していました）。[#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時のログフラッシュ中に発生する例外を無視し、シャットダウンの安全性を高めました（SIGSEGV を回避するため）。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* サイズがゼロのパートファイルを含むクエリを実行すると例外を送出していた Backup データベースエンジンの問題を修正。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* send&#95;chunk&#95;header が有効な状態で UDF が HTTP プロトコル経由で呼び出された場合に、チャンクヘッダーが送信されない問題を修正。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Keeper セッションの有効期限切れにより発生していた S3Queue の論理エラー &quot;Expected current processor {} to be equal to {}&quot; を修正しました。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `INSERT` およびプルーニングにおける `Nullable` 関連のバグを修正しました。これにより [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407) がクローズされました。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630) ([scanhex12](https://github.com/scanhex12))。
* Iceberg メタデータキャッシュが無効になっている場合は、ファイルシステムキャッシュを無効にしないでください。[#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik)).
* Parquet リーダー v3 における &#39;Deadlock in Parquet::ReadManager (single-threaded)&#39; エラーを修正しました。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* ArrowFlight の `listen_host` における IPv6 のサポートを修正しました。 [#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar))。
* `ArrowFlight` ハンドラーのシャットダウン処理を修正。この PR は [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596) を修正します。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `describe_compact_output=1` 使用時のディストリビューテッドクエリに関する不具合を修正しました。 [#86676](https://github.com/ClickHouse/ClickHouse/pull/86676) ([Azat Khuzhin](https://github.com/azat))。
* ウィンドウ定義の解析およびクエリパラメータの適用を修正。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* `PARTITION BY` を指定しているがパーティションのワイルドカードを使用していないテーブル作成時に、25.8 より前のバージョンでは動作していたにもかかわらず発生していた例外 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` を修正しました。 [https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567) をクローズしました。 [#86748](https://github.com/ClickHouse/ClickHouse/pull/86748) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列クエリが単一ロックを取得しようとした際に LogicalError が発生する問題を修正しました。[#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* RowBinary 入力フォーマットで共有される JSON データに `NULL` が書き込まれてしまう問題を修正し、`ColumnObject` にいくつかの追加バリデーションを導入しました。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* 空の Tuple に対する順列処理と `LIMIT` 句の組み合わせ時の挙動を修正。[#86828](https://github.com/ClickHouse/ClickHouse/pull/86828)（[Pavel Kruglov](https://github.com/Avogar)）。
* 永続処理ノードに対しては、専用の Keeper ノードを使用しないようにしました。[https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995) の修正です。[#86406](https://github.com/ClickHouse/ClickHouse/issues/86406) をクローズしました。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TimeSeries エンジンテーブルが Replicated Database における新しいレプリカの作成を阻害していた問題を修正しました。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 一部のタスクで特定の Keeper ノードが欠落している場合に `system.distributed_ddl_queue` をクエリした際の動作を修正しました。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 解凍済みブロックの末尾におけるシーク処理を修正。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg Iterator の非同期実行中にスローされる例外を適切に処理します。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* 大きな前処理済み XML 設定ファイルの保存処理を修正しました。 [#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* system.iceberg&#95;metadata&#95;log テーブルにおける date フィールドへの値の格納処理を修正。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* `WHERE` 句付きの `TTL` が無限に再計算される不具合を修正しました。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* `ROLLUP` および `CUBE` 修飾子を使用した場合に `uniqExact` 関数が誤った結果を返す可能性のあった不具合を修正しました。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat))。
* `parallel_replicas_for_cluster_functions` 設定が 1 の場合に、`url()` テーブル関数でのテーブルスキーマの解決処理を修正しました。 [#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 処理を複数のステップに分割した後でも `PREWHERE` の出力が正しくキャストされるようにしました。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* `ON CLUSTER` 句を使用する軽量な更新を修正しました。[#87043](https://github.com/ClickHouse/ClickHouse/pull/87043)（[Anton Popov](https://github.com/CurtizJ)）。
* 一部の集約関数の状態と `String` 引数との互換性を修正。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar)).
* OpenAI から取得したモデル名が渡されていなかった問題を修正します。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB: パスは user&#95;files の配下でなければなりません。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano)).
* 25.1 より前に作成された KeeperMap テーブルで発生していた、DROP クエリの後に ZooKeeper 内にデータが残る問題を修正。[#87112](https://github.com/ClickHouse/ClickHouse/pull/87112)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Parquet 読み込み時の map および array フィールド ID の読み取りを修正。 [#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* 遅延マテリアライゼーションで配列サイズのサブカラムを持つ配列の読み取り処理を修正。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型の引数を取る `CASE` 関数を修正しました。 [#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar)).
* CSV における空文字列からの空配列の読み取りを修正。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar))。
* 非相関な `EXISTS` で誤った結果が返る可能性がある問題を修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) で導入された `execute_exists_as_scalar_subquery=1` により発生したもので、`25.8` に影響していました。 [#86415](https://github.com/ClickHouse/ClickHouse/issues/86415) を修正します。 [#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* iceberg&#95;metadata&#95;log が設定されていない状態でユーザーが iceberg メタデータのデバッグ情報を取得しようとした場合にエラーをスローします。nullptr へのアクセスを修正します。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik)).

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
* JSON 内で異なる型の値を含む配列に対して、名前のない `Tuple` の代わりに `Array(Dynamic)` を推論するようにしました。以前の動作を使用するには、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` を無効にしてください。 [#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 均質性とシンプルさのために、S3 レイテンシー・メトリクスをヒストグラムに移行しました。 [#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* デフォルト式内でドットを含む識別子について、それらが複合識別子としてパースされるのを防ぐために、バッククォートで囲むことを必須としました。 [#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* レイジー・マテリアライゼーションは、アナライザ使用時（デフォルト）にのみ有効になります。これは、アナライザなしの状態を保守対象としないためであり、我々の経験上、アナライザなしではいくつかの問題があるためです（例えば、条件内で `indexHint()` を使用する場合など）。 [#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* Parquet 出力フォーマットにおいて、デフォルトで `Enum` 型の値を `ENUM` 論理型を持つ `BYTE_ARRAY` として書き出すようにしました。 [#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効にしました。これにより、新しく作成された Compact パートからのサブカラム読み取り性能が大幅に向上します。バージョン 25.5 未満のサーバーは、新しい Compact パートを読み取ることができません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前の `concurrent_threads_scheduler` のデフォルト値は `round_robin` でしたが、多数の単一スレッドクエリ（例: INSERT）が存在する場合に不公平であることが判明しました。この変更により、より安全な代替である `fair_round_robin` スケジューラがデフォルトとなります。 [#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse は PostgreSQL スタイルのヒアドキュメント構文 `$tag$ string contents... $tag$`（ドルクォート文字列リテラルとも呼ばれる）をサポートしています。以前のバージョンではタグに対する制約が緩く、句読点や空白を含む任意の文字を使用できました。これは、ドル文字で始まる識別子との間にパース上の曖昧性を生じさせます。一方、PostgreSQL ではタグに使用できるのは単語構成文字のみです。この問題を解決するため、ヒアドキュメントのタグには単語構成文字のみを含められるように制限しました。これにより [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731) がクローズされます。 [#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `azureBlobStorage`、`deltaLakeAzure`、`icebergAzure` は、`AZURE` 権限を正しく検証するように更新されました。すべてのクラスタ版関数（`-Cluster` 関数）は、対応する非クラスタ版に対して権限を照合するようになりました。さらに、`icebergLocal` および `deltaLakeLocal` 関数は、`FILE` 権限チェックを必須とするようになりました。 [#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `allow_dynamic_metadata_for_data_lakes` 設定（Table Engine レベルの設定）をデフォルトで有効にしました。 [#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* デフォルトで、JSON フォーマットにおいて 64 ビット整数をクォートしないようにしました。 [#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))



#### 新機能

* PromQL 方言の基本的なサポートが追加されました。これを利用するには、clickhouse-client で `dialect='promql'` を設定し、設定 `promql_table_name='X'` を使って TimeSeries テーブルを指定し、`rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` のようなクエリを実行します。さらに、PromQL クエリを SQL でラップして実行することもできます: `SELECT * FROM prometheusQuery('up', ...);`。現時点では `rate`、`delta`、`increase` 関数のみがサポートされています。単項演算子および二項演算子には未対応です。HTTP API にも未対応です。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI を利用した SQL 生成では、利用可能な場合、環境変数 `ANTHROPIC_API_KEY` および `OPENAI_API_KEY` から自動的に設定内容を取得できるようになりました。これにより、この機能を利用するためのゼロコンフィグのオプションが提供されます。[#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik))。
* [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) プロトコルのサポートを次の追加によって実装しました: - 新しいテーブル関数 `arrowflight`。 [#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600))。
* これにより、すべてのテーブルが（`Merge` エンジンのテーブルだけでなく）`_table` 仮想カラムをサポートするようになりました。これは、特に `UNION ALL` を含むクエリで有用です。 [#63665](https://github.com/ClickHouse/ClickHouse/pull/63665)（[Xiaozhe Yu](https://github.com/wudidapaopao)）。
* 外部集約やソート処理に任意のストレージポリシー（たとえば S3 のようなオブジェクトストレージ）を使用できるようにしました。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 明示的に指定された IAM ロールを用いた AWS S3 認証を実装しました。GCS 向けに OAuth を実装しました。これらの機能はこれまでは ClickHouse Cloud でのみ利用可能でしたが、今回オープンソースとして公開されました。オブジェクトストレージ向けの接続パラメータのシリアライズなど、いくつかのインターフェースを統一しました。 [#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Iceberg TableEngine で position delete をサポートしました。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* Iceberg の Equality Delete をサポートしました。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* CREATE 向けの Iceberg 書き込みを実装。[#83927](https://github.com/ClickHouse/ClickHouse/issues/83927) をクローズ。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 書き込み用Glueカタログ。[#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 書き込み対応の Iceberg REST カタログ。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* すべての Iceberg の position delete ファイルをデータファイルにマージします。これにより、Iceberg ストレージ内の Parquet ファイルの数とサイズが削減されます。構文: `OPTIMIZE TABLE table_name`。 [#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg テーブルに対する `DROP TABLE` をサポート（REST / Glue カタログからの削除とテーブルに関するメタデータの削除）。[#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* merge-on-read 形式の Iceberg テーブルに対して ALTER DELETE ミューテーションをサポートしました。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* DeltaLake への書き込みに対応。[#79603](https://github.com/ClickHouse/ClickHouse/issues/79603) をクローズ。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* テーブルエンジン `DeltaLake` で特定のスナップショットバージョンを読み込めるようにするため、設定 `delta_lake_snapshot_version` を追加しました。 [#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* min-max プルーニングのために、より多くの Iceberg 統計情報（列サイズ、下限値および上限値）をメタデータ（マニフェストエントリ）に書き込むようにしました。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 単純なデータ型に対する Iceberg のカラム追加/削除/変更をサポートしました。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg：version-hint ファイルへの書き込みをサポートしました。これにより [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097) がクローズされました。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* エフェメラルユーザーによって作成されたビューは、対応する実ユーザーのコピーを保存するようになり、エフェメラルユーザーが削除された後も無効化されなくなりました。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* ベクトル類似性インデックスがバイナリ量子化をサポートするようになりました。バイナリ量子化により、メモリ消費量が大幅に削減され、距離計算が高速化されることでベクトルインデックスの構築プロセスも高速になります。また、既存の設定 `vector_search_postfilter_multiplier` は廃止され、より汎用的な設定である `vector_search_index_fetch_multiplier` に置き換えられました。[#85024](https://github.com/ClickHouse/ClickHouse/pull/85024)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `s3` および `s3Cluster` テーブルエンジン/関数でキー・バリュー形式の引数が使用できるようになりました。例えば、`s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')` のように指定できます。 [#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii))。
* kafka などのエンジンから受信したエラーメッセージを保持するための新しいシステムテーブル（「デッドレターキュー」）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn)).
* レプリケーテッドデータベース用の新しい SYSTEM RESTORE DATABASE REPLICA 機能が追加されました。既存の ReplicatedMergeTree の復元機能と同様に動作します。 [#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov)).
* PostgreSQL プロトコルが `COPY` コマンドをサポートするようになりました。 [#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* MySQL プロトコル用 C# クライアントをサポートしました。これにより [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992) がクローズされます。 [#84397](https://github.com/ClickHouse/ClickHouse/pull/84397) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* Hive パーティション形式の読み取りおよび書き込みのサポートを追加しました。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* ZooKeeper 接続の履歴情報を保存するための `zookeeper_connection_log` システムテーブルを追加しました。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* サーバー設定 `cpu_slot_preemption` により、ワークロードに対するプリエンプティブな CPU スケジューリングが有効になり、ワークロード間での CPU 時間の max-min フェアな割り当てが保証されます。CPU スロットリング用の新しいワークロード設定として、`max_cpus`、`max_cpu_share`、`max_burst_cpu_seconds` が追加されました。詳細は次を参照してください: [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。 [#80879](https://github.com/ClickHouse/ClickHouse/pull/80879) ([Sergei Trifonov](https://github.com/serxa))。
* 設定されたクエリ数または時間のしきい値に達したら TCP 接続を切断します。これにより、ロードバランサー配下のクラスタノード間で接続の分散をより均一にできます。[#68000](https://github.com/ClickHouse/ClickHouse/issues/68000) を解決します。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* 並列レプリカでクエリに対してプロジェクションを利用できるようになりました。[#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。[#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi))。
* DESCRIBE (SELECT ...) 構文に加えて、DESCRIBE SELECT 構文もサポートします。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* mysql&#95;port および postgresql&#95;port でセキュア接続を強制するようにしました。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* ユーザーは `JSONExtractCaseInsensitive`（および `JSONExtract` の他の派生関数）を使用して、大文字・小文字を区別しない JSON キーの検索を行えるようになりました。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* `system.completions` テーブルを導入。[#81889](https://github.com/ClickHouse/ClickHouse/issues/81889) をクローズ。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833) ([|2ustam](https://github.com/RuS2m))。
* 新しい関数 `nowInBlock64` を追加しました。使用例：`SELECT nowInBlock64(6)` は `2025-07-29 17:09:37.775725` を返します。 [#84178](https://github.com/ClickHouse/ClickHouse/pull/84178) ([Halersson Paris](https://github.com/halersson)).
* AzureBlobStorage に extra&#95;credentials を追加し、client&#95;id および tenant&#95;id を使用した認証をサポートしました。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* `DateTime` の値を `UUIDv7` に変換する関数 `dateTimeToUUIDv7` を追加しました。使用例: `SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` は `0198af18-8320-7a7d-abd3-358db23b9d5c` を返します。 [#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich))。
* `timeSeriesDerivToGrid` および `timeSeriesPredictLinearToGrid` は、指定された開始タイムスタンプ、終了タイムスタンプ、およびステップで定義される時間グリッドにデータを再サンプリングし、それぞれ PromQL と同様の `deriv` および `predict_linear` を計算する集約関数です。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0))。
* 新しい TimeSeries 関数を 2 つ追加しました: - `timeSeriesRange(start_timestamp, end_timestamp, step)`, - `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`,. [#85435](https://github.com/ClickHouse/ClickHouse/pull/85435) ([Vitaly Baranov](https://github.com/vitlibar)).
* 新しい構文 `GRANT READ ON S3('s3://foo/.*') TO user` が追加されました。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit))。
* 新しい出力フォーマット `Hash` を追加しました。結果のすべての列と行を対象に、単一のハッシュ値を計算します。これは、データ転送がボトルネックとなるユースケースなどで、結果の「フィンガープリント」を計算するのに有用です。例: `SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` は `e5f9e676db098fdb9530d2059d8c23ef` を返します。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze))。
* Keeper Multi クエリで任意のウォッチを設定できる機能を追加。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `clickhouse-benchmark` ツールに、並列クエリ数を徐々に増加させるモードを有効にできるオプション `--max-concurrency` を追加しました。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* TODO: これは何？ 部分集約済みメトリクスをサポート。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### 実験的機能
* 相関サブクエリのサポートをデフォルトで有効化し、実験的機能ではなくなりました。 [#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd))。
* Unity、Glue、Rest、および Hive Metastore のデータレイクカタログは、実験的段階からベータ版に昇格しました。 [#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator))。
* 軽量な更新および削除機能は、実験的段階からベータ版に昇格しました。
* ベクター類似度インデックスを用いた近似ベクトル検索は GA（一般提供）となりました。 [#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze))。
* Ytsaurus テーブルエンジンおよびテーブル関数を追加しました。 [#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 以前は、テキストインデックス用のデータは複数のセグメントに分割されていました（セグメントサイズはデフォルトで各 256 MiB）。これはテキストインデックス構築時のメモリ使用量を削減できる一方で、ディスクの必要容量を増加させ、クエリ応答時間も長くなります。 [#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov))。



#### パフォーマンスの向上

* 新しい Parquet リーダーの実装です。全体的により高速で、ページレベルのフィルタープッシュダウンと PREWHERE をサポートします。現在は実験的機能です。有効にするには設定 `input_format_parquet_use_native_reader_v3` を使用します。 [#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321))。
* Azure Blob Storage 向けの公式 Azure ライブラリの HTTP トランスポートを、独自実装の HTTP クライアントに置き換えました。このクライアントには、S3 の設定を反映した複数の設定項目を導入しています。Azure と S3 の両方に対して、短い接続タイムアウトを導入しました。Azure プロファイルのイベントおよびメトリクスの可観測性も改善しました。新しいクライアントはデフォルトで有効になっており、Azure Blob Storage 上のコールドクエリに対して大幅に優れたレイテンシを提供します。以前の `Curl` クライアントは、`azure_sdk_use_native_client=false` を設定することで復帰させることができます。 [#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。以前の公式 Azure クライアント実装は、5 秒から数分に及ぶ深刻なレイテンシスパイクのため、本番環境には不適切でした。私たちはその実装を廃止できたことを非常に誇りに思っています。
* ファイルサイズが小さい順にインデックスを処理します。最終的なインデックスの並び順では、その単純さおよび選択性の高さから minmax インデックスとベクターインデックスを優先し、その後にその他の小さいインデックスを優先します。minmax / ベクターインデックスの中でも、より小さいインデックスが優先されます。 [#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` を既定で有効化しました。これにより、新しく作成された Compact パーツからのサブカラムの読み取りパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーは、新しい Compact パーツを読み取ることができません。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* `azureBlobStorage` テーブルエンジン: スロットリングを避けるため、可能な場合はマネージド ID 認証トークンをキャッシュして再利用するようにしました。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak)).
* 右側が結合キー列に関数的に従属している（すべての行が一意の結合キー値を持つ）場合、`ALL` `LEFT/INNER` JOIN は自動的に `RightAny` に変換されます。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat)).
* サイズの大きな列を含む JOIN のメモリ使用量を制限するために、`max_joined_block_size_rows` に加えて `max_joined_block_size_bytes` を追加しました。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* メモリ効率の高い集約処理において、一部のバケットを順不同で送信できるようにする新しいロジック（設定 `enable_producing_buckets_out_of_order_in_aggregation` によって制御され、デフォルトで有効）を追加しました。特定の集約バケットのマージに他のバケットよりも大幅に時間がかかる場合、イニシエータがその間により大きいバケット ID を持つバケットをマージできるようにすることで、パフォーマンスが向上します。欠点としてメモリ使用量が増加する可能性があります（増加幅は大きくないはずです）。 [#80179](https://github.com/ClickHouse/ClickHouse/pull/80179) ([Nikita Taranov](https://github.com/nickitat)).
* `optimize_rewrite_regexp_functions` 設定（デフォルトで有効）を導入しました。これにより、オプティマイザは特定の正規表現パターンを検出した場合に、一部の `replaceRegexpAll`、`replaceRegexpOne`、および `extract` 呼び出しを、より単純かつ効率的な形に書き換えられるようになりました。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* ハッシュ JOIN のメインループの外側で `max_joined_block_rows` を処理するようにし、ALL JOIN のパフォーマンスがわずかに向上しました。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* より高い粒度を持つ min-max インデックスを優先的に処理するようにしました。[#75381](https://github.com/ClickHouse/ClickHouse/issues/75381) をクローズします。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798) ([Maruth Goyal](https://github.com/maruthgoyal)).
* `DISTINCT` ウィンドウ集約が線形時間で実行されるようにし、`sumDistinct` のバグを修正しました。[#79792](https://github.com/ClickHouse/ClickHouse/issues/79792) をクローズ。[#52253](https://github.com/ClickHouse/ClickHouse/issues/52253) をクローズ。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージの読み取り回数とCPU使用率が抑えられることで、より低レイテンシで完了します。 [#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer))。
* 並列レプリカ間でのワークロード分散におけるキャッシュ局所性を向上させる Rendezvous ハッシュ。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* If コンビネーター向けに `addManyDefaults` を実装し、これにより If コンビネーターを用いる集約関数がより高速に動作するようになりました。 [#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 複数の文字列列や数値列を対象に GROUP BY を行う場合、シリアライズされたキーをカラム単位で計算するようにしました。 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li)).
* 並列レプリカでの読み取り時に、インデックス分析の結果が空の範囲になる場合のフルスキャンを行わないようにしました。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* より安定したパフォーマンステストのために `-falign-functions=64` を試しました。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* ブルームフィルターインデックスは、`column` が `Array` 型ではない場合の `has([c1, c2, ...], column)` のような条件にも利用されるようになりました。これにより、そのようなクエリの実行性能が向上し、`IN` 演算子と同程度に効率的になります。 [#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki))。
* CompressedReadBufferBase::readCompressedData における不要な memcpy 呼び出しを削減。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 一時データを削除して `largestTriangleThreeBuckets` を最適化しました。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コードを簡素化することで文字列デシリアライズ処理を最適化。[#38564](https://github.com/ClickHouse/ClickHouse/issues/38564) をクローズ。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 並列レプリカ用の最小タスクサイズの計算を修正しました。 [#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat))。
* `Join` モードにおけるパッチパーツ適用処理のパフォーマンスを改善しました。 [#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* ゼロバイトに関する問題を修正しました。[#85062](https://github.com/ClickHouse/ClickHouse/issues/85062) をクローズします。いくつかの軽微なバグが修正されました。関数 `structureToProtobufSchema` と `structureToCapnProtoSchema` は、ゼロ終端バイトを正しく付加しておらず、その代わりに改行文字を使用していました。その結果、出力から改行が欠落し、ゼロバイトに依存する他の関数（`logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero`、`encrypt`/`decrypt` など）を使用した際にバッファオーバーフローを引き起こす可能性がありました。`regexp_tree` 辞書レイアウトは、ゼロバイトを含む文字列の処理をサポートしていませんでした。`formatRowNoNewline` 関数は、`Values` フォーマット、または行末に改行がない他のフォーマットで呼び出された場合に、出力の最後の文字を誤って切り落としていました。関数 `stem` には例外安全性の不具合があり、ごくまれな状況でメモリリークを引き起こす可能性がありました。`initcap` 関数は `FixedString` 引数に対して誤った動作をしていました。すなわち、ブロック内の前の文字列が単語文字で終わっているとき、文字列の先頭にある単語の開始を認識できていませんでした。Apache `ORC` フォーマットにおけるセキュリティ脆弱性を修正しました。これは初期化されていないメモリの露出につながる可能性がありました。関数 `replaceRegexpAll` と、対応するエイリアスである `REGEXP_REPLACE` の動作を変更しました。これらは、`^a*|a*$` や `^|.*` のように、直前のマッチが文字列全体を処理していた場合でも、文字列末尾で空マッチを行えるようになりました。これは JavaScript、Perl、Python、PHP、Ruby のセマンティクスに対応しますが、PostgreSQL のセマンティクスとは異なります。多くの関数の実装が簡素化および最適化されました。いくつかの関数について、誤っていたドキュメントが修正されました。`String` 列および `String` 列を含む複合型に対する `byteSize` の出力が変更されている点（空文字列 1 個あたり 9 バイトから 8 バイトへ）に留意してください。これは想定された挙動です。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 単一行を返すためだけに定数をマテリアライズする場合のマテリアライズ処理を最適化しました。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* delta-kernel-rs バックエンドで複数ファイルの並列処理を改善。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 enable&#95;add&#95;distinct&#95;to&#95;in&#95;subqueries が導入されました。これを有効にすると、ClickHouse は分散クエリにおいて IN 句のサブクエリに自動的に DISTINCT を追加します。これにより、シャード間で転送される一時テーブルのサイズを大幅に削減し、ネットワーク効率を向上させることができます。注意：これはトレードオフです。ネットワーク転送量は削減されますが、各ノードで追加のマージ（重複排除）処理が必要になります。ネットワーク転送がボトルネックとなっており、マージのコストが許容できる場合に、この設定を有効にしてください。 [#81908](https://github.com/ClickHouse/ClickHouse/pull/81908) ([fhw12345](https://github.com/fhw12345)).
* 実行可能なユーザー定義関数のクエリメモリトラッキングのオーバーヘッドを削減しました。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `DeltaLake` に、統計およびパーティションプルーニングのための `delta-kernel-rs` による内部フィルタリングを実装しました。 [#84006](https://github.com/ClickHouse/ClickHouse/pull/84006) ([Kseniia Sumarokova](https://github.com/kssenii)).
* オンザフライで更新される列やパッチパーツによって更新される列に依存するスキッピングインデックスについて、無効化の粒度をより細かくしました。これにより、スキッピングインデックスが使用されないのは、オンザフライのミューテーションやパッチパーツの影響を受けたパーツに限られます。以前は、該当するインデックスはすべてのパーツで無効化されていました。 [#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ)).
* 暗号化された名前付きコレクション用の `encrypted_buffer` に対して、必要最小限のメモリ量を割り当てるようにしました。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos))。
* ブルームフィルターインデックス（`regular`、`ngram`、`token`）のサポートを強化し、第一引数が定数配列（集合）、第二引数がインデックス付きカラム（部分集合）である場合にも利用できるようにすることで、クエリをより効率的に実行できるようにしました。 [#84700](https://github.com/ClickHouse/ClickHouse/pull/84700) ([Doron David](https://github.com/dorki))。
* Keeper のストレージロックでの競合を軽減。 [#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368)).
* `WHERE` に対する `read_in_order_use_virtual_row` の未対応だったサポートを追加しました。これにより、フィルタが完全には `PREWHERE` にプッシュダウンされなかったクエリにおいて、追加のパーツの読み取りを省略できるようになります。[#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 各データファイルごとにオブジェクトを明示的に保存することなく、Iceberg テーブルからオブジェクトを非同期に反復処理できるようにします。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik))。
* 非相関の `EXISTS` をスカラサブクエリとして実行します。これにより、スカラサブクエリキャッシュを使用し、結果を定数畳み込みできるようになり、インデックスの利用に役立ちます。互換性のため、新しい設定 `execute_exists_as_scalar_subquery=1` が追加されました。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).





#### 改善

* DatabaseReplicatedSettings のデフォルト値を定義する `database_replicated` 設定を追加しました。Replicated DB の作成クエリ内にこの設定が指定されていない場合、この設定の値が使用されます。[#85127](https://github.com/ClickHouse/ClickHouse/pull/85127)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* Web UI（play）のテーブル列の幅を変更可能にしました。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki)).
* `iceberg_metadata_compression_method` 設定により、圧縮された `.metadata.json` ファイルをサポートするようになりました。ClickHouse のすべての圧縮方式を利用できます。これにより [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895) がクローズされました。[#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `EXPLAIN indexes = 1` の出力に、読み込まれる範囲数を表示するようにしました。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm))。
* ORC 圧縮ブロックサイズを設定するための設定項目を導入し、Spark や Hive と一貫性を保つために、そのデフォルト値を 64KB から 256KB に更新しました。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li)).
* Wide パーツに `columns_substreams.txt` ファイルを追加し、そのパーツ内に保存されているすべてのサブストリームを追跡できるようにしました。これにより、JSON および Dynamic 型の動的ストリームを追跡できるため、動的ストリームの一覧を取得するために、これらの列のサンプルを読み込む必要がなくなります（たとえば列サイズを計算する場合など）。また、すべての動的ストリームが `system.parts_columns` に反映されるようになりました。 [#81091](https://github.com/ClickHouse/ClickHouse/pull/81091) ([Pavel Kruglov](https://github.com/Avogar)).
* 機密データをデフォルトで非表示にするために、clickhouse format に CLI フラグ --show&#95;secrets を追加しました。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom)).
* S3 の読み取りおよび書き込みリクエストは、`max_remote_read_network_bandwidth_for_server` と `max_remote_write_network_bandwidth_for_server` によるスロットリングの問題を回避するため、S3 リクエスト全体ではなく HTTP ソケットレベルでスロットリングされます。 [#81837](https://github.com/ClickHouse/ClickHouse/pull/81837) ([Sergei Trifonov](https://github.com/serxa))。
* 同じ列に対して、ウィンドウ関数の異なるウィンドウごとに異なる照合順序を指定できるようにしました。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* マージセレクタをシミュレートし、可視化および比較するためのツールを追加しました。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa)).
* `address_expression` 引数でクラスタが指定されている場合に、並列レプリカ対応の `remote*` テーブル関数のサポートを追加しました。また、[#73295](https://github.com/ClickHouse/ClickHouse/issues/73295) を修正しました。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* バックアップファイルの書き込みに関するすべてのログメッセージのログレベルを TRACE に設定しました。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 名前や codec が特殊なユーザー定義関数は、SQL フォーマッタによって一貫性のないフォーマットになる場合がありました。これにより [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092) がクローズされました。 [#83644](https://github.com/ClickHouse/ClickHouse/pull/83644) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ユーザーは、JSON 型内で Time 型および Time64 型を使用できるようになりました。 [#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 並列レプリカを用いた `JOIN` は、`JOIN` の論理ステップを使用するようになりました。並列レプリカを使用する `JOIN` クエリで問題が発生した場合は、`SET query_plan_use_new_logical_join_step=0` を試し、そのうえで不具合を報告してください。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir))。
* cluster&#95;function&#95;process&#95;archive&#95;on&#95;multiple&#95;nodes の互換性を修正しました。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` テーブルレベルでマテリアライズドビューへの挿入に関する設定を変更できるようになりました。新たに `S3Queue` レベルの設定として `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` を追加しました。デフォルトではプロファイルレベルの設定が使用され、`S3Queue` テーブルレベルの設定がそれらを上書きします。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ミューテーションで影響を受ける行数（例：`ALTER UPDATE` や `ALTER DELETE` クエリで条件を満たす行の総数）を示すプロファイルイベント `MutationAffectedRowsUpperBound` を追加しました。[#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ))。
* cgroup の情報（該当する場合、つまり `memory_worker_use_cgroup` が有効で cgroup が利用可能な場合）を使用して、メモリトラッカー（`memory_worker_correct_memory_tracker`）を調整するようにしました。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat)).
* MongoDB: 文字列から数値型への暗黙的な変換処理。以前は、ClickHouse テーブルの数値カラムに対して MongoDB ソースから文字列値を受け取った場合、例外がスローされていました。現在では、エンジンが文字列から数値を自動的にパースするようになりました。[#81167](https://github.com/ClickHouse/ClickHouse/issues/81167) をクローズしました。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* `Nullable` 数値に対する `Pretty` フォーマットで桁グループをハイライトするようにしました。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Dashboard: ツールチップが上端でコンテナからはみ出さないようになりました。 [#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード上のドットの見た目をわずかに改善しました。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボードのファビコンが若干改善されました。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI: ブラウザがパスワードを保存できるようにしました。また、URL の入力値も記憶されるようになりました。 [#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 特定の Keeper ノードに追加の ACL を適用するための `apply_to_children` 設定のサポートを追加。[#84137](https://github.com/ClickHouse/ClickHouse/pull/84137)（[Antonio Andelic](https://github.com/antonio2368)）。
* MergeTree における &quot;compact&quot; Variant discriminators のシリアライゼーションの使用を修正しました。以前は、使用できるにもかかわらず一部のケースで使われていませんでした。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* レプリケーテッドデータベースの設定にサーバー設定 `logs_to_keep` を追加し、レプリケーテッドデータベースに対するデフォルトの `logs_to_keep` パラメータを変更できるようにしました。値を小さくすると ZNode の数が減少します（特にデータベースが多数ある場合）。一方、値を大きくすると、一定期間停止していたレプリカでも、より長い期間後に追いつけるようになります。 [#84183](https://github.com/ClickHouse/ClickHouse/pull/84183) ([Alexey Khatskevich](https://github.com/Khatskevich))。
* JSON 型の解析時に JSON キー内のドットをエスケープするための設定 `json_type_escape_dots_in_keys` を追加しました。この設定はデフォルトでは無効です。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar))。
* 閉じられた接続から読み取ることを防ぐため、EOF をチェックする前に接続がキャンセルされているかどうかを確認します。[#83893](https://github.com/ClickHouse/ClickHouse/issues/83893) を修正。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Web UI でのテキスト選択の色合いをわずかに改善しました。違いが顕著なのは、ダークモード時に選択されたテーブルセルのみです。以前のバージョンでは、テキストと選択範囲の背景とのコントラストが不十分でした。[#84258](https://github.com/ClickHouse/ClickHouse/pull/84258)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 内部チェックを簡素化することで、サーバーシャットダウン時のクライアント接続の処理を改善しました。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath)).
* `delta_lake_enable_expression_visitor_logging` という設定を追加し、デバッグ時にテスト用ログレベルであっても冗長になり過ぎる可能性のある expression visitor のログを無効化できるようにしました。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* cgroup レベルおよびシステム全体のメトリクスが、現在まとめて報告されるようになりました。cgroup レベルのメトリクスは `CGroup&lt;Metric&gt;` という名前で、OS レベルのメトリクス（procfs から収集されるもの）は `OS&lt;Metric&gt;` という名前になります。 [#84317](https://github.com/ClickHouse/ClickHouse/pull/84317) ([Nikita Taranov](https://github.com/nickitat)).
* Web UI のチャートを少し改善しました。大きな変更ではありませんが、わずかに良くなっています。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Replicated データベース設定 `max_retries_before_automatic_recovery` のデフォルト値を 10 に変更し、一部のケースではより迅速に復旧できるようにしました。 [#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリパラメータ付きの `CREATE USER` ステートメントの書式を修正しました（例: `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。[#84376](https://github.com/ClickHouse/ClickHouse/pull/84376)（[Azat Khuzhin](https://github.com/azat)）。
* バックアップおよびリストア処理中に使用される S3 リトライ時のバックオフ戦略を構成するための `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor` を導入しました。[#84421](https://github.com/ClickHouse/ClickHouse/pull/84421)（[Julia Kartseva](https://github.com/jkartseva)）。
* S3Queue の ordered モードの修正：shutdown が呼び出された場合により早く終了するようにしました。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* pyiceberg によって書き込まれた Iceberg データの読み取りをサポート。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* KeyValue ストレージの主キー（例: EmbeddedRocksDB、KeeperMap）に対して `IN` / `GLOBAL IN` フィルタをプッシュダウンする際に、セット内の値の型変換を許可しました。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa)).
* chdig を [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1) に更新。 [#84521](https://github.com/ClickHouse/ClickHouse/pull/84521) ([Azat Khuzhin](https://github.com/azat))。
* これまで UDF 実行中の低レベルエラーではさまざまなエラーコードが返される可能性がありましたが、今後はエラーコード `UDF_EXECUTION_FAILED` で失敗するようになりました。 [#84547](https://github.com/ClickHouse/ClickHouse/pull/84547) ([Xu Jia](https://github.com/XuJia0210))。
* `get_acl` コマンドを KeeperClient に追加しました。 [#84641](https://github.com/ClickHouse/ClickHouse/pull/84641) ([Antonio Andelic](https://github.com/antonio2368)).
* データレイクテーブルエンジンにスナップショットバージョンを追加。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton))。
* `ConcurrentBoundedQueue` のサイズを表すディメンション付きメトリクスを追加しました。これはキューの種類（すなわち、そのキューの用途）およびキュー ID（すなわち、現在のキューインスタンスに対してランダムに生成される ID）でラベル付けされます。 [#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `system.columns` テーブルで、既存の `name` 列に対する別名として `column` が利用できるようになりました。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang))。
* 新しい MergeTree 設定 `search_orphaned_parts_drives` を追加し、たとえばローカルメタデータを持つディスクなど、パーツを探索する範囲を限定できるようにしました。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* Keeper に、受信したリクエストのログ出力を切り替えるための 4LW `lgrq` を追加しました。[#84719](https://github.com/ClickHouse/ClickHouse/pull/84719)（[Antonio Andelic](https://github.com/antonio2368)）。
* 外部認証の `forward&#95;headers` を大文字小文字を区別せずに照合するようにしました。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` ツールで暗号化された ZooKeeper 接続がサポートされるようになりました。 [#84764](https://github.com/ClickHouse/ClickHouse/pull/84764) ([Roman Vasin](https://github.com/rvasin)).
* `system.errors` にフォーマット文字列用のカラムを追加しました。このカラムは、アラートルールで同じエラータイプでグループ化するために必要です。 [#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `clickhouse-format` を更新し、`--hilite` オプションのエイリアスとして `--highlight` を受け付けるようにしました。- `clickhouse-client` を更新し、`--highlight` オプションのエイリアスとして `--hilite` を受け付けるようにしました。- これらの変更を反映するように `clickhouse-format` のドキュメントを更新しました。[#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 複合型に対するフィールド ID ベースの Iceberg 読み取りを修正。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `SlowDown` などのエラーに起因するリトライストーム時に、1 つのリトライ可能エラーが検出された時点で全スレッドの処理を減速させることで S3 への負荷を軽減する、新しい `backup_slow_all_threads_after_retryable_s3_error` 設定を導入しました。 [#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* レプリケート DB において、append 以外の RMV DDL 用の旧一時テーブルの作成およびリネーム処理をスキップするようにしました。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Keeper のログエントリキャッシュサイズを、`keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` および `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` を使用してエントリ数で制限します。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* サポートされていないアーキテクチャ上でも `simdjson` を使用できるようにしました（従来は `CANNOT_ALLOCATE_MEMORY` エラーが発生していました）。 [#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat)).
* 非同期ロギング：制限を調整可能にし、イントロスペクション機能を追加しました。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* 削除対象のすべてのオブジェクトを収集し、オブジェクトストレージに対する削除を1回の操作で実行するようにしました。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg における現在の positional delete file の実装では、すべてのデータを RAM 上に保持します。positional delete file が大きい場合（これはよくあることです）、そのコストはかなり高くなります。私の実装では、Parquet delete file の最後の row-group だけを RAM に保持することで、コストを大幅に削減できます。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* chdig: 画面上に残ってしまう不要な表示を修正し、エディタ内でクエリ編集後に発生するクラッシュを修正、`path` 内で `editor` を検索するようにし、[25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1) に更新。 [#85341](https://github.com/ClickHouse/ClickHouse/pull/85341) ([Azat Khuzhin](https://github.com/azat)).
* 不足していた `partition_columns_in_data_file` を Azure 構成に追加しました。[#85373](https://github.com/ClickHouse/ClickHouse/pull/85373)（[Arthur Passos](https://github.com/arthurpassos)）。
* 関数 `timeSeries*ToGrid` でステップ値 0 を許可しました。これは [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) の一部です。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* system.tables にデータレイクテーブルを追加するかどうかを制御するためのフラグ show&#95;data&#95;lake&#95;catalogs&#95;in&#95;system&#95;tables を追加しました。[#85384](https://github.com/ClickHouse/ClickHouse/issues/85384) を解決します。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `remote_fs_zero_copy_zookeeper_path` でマクロ展開がサポートされるようになりました。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme)).
* clickhouse-client の AI 機能の見栄えがわずかに良くなります。 [#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 既存のデプロイ環境で `trace_log.symbolize` をデフォルトで有効化しました。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 複合識別子に対して、より多くのケースを解決できるようになりました。特に、`ARRAY JOIN` と旧アナライザとの互換性が向上しています。従来の動作を維持するために、新しい設定 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` を導入しました。[#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* system.columns のテーブル列サイズ取得時に `UNKNOWN_DATABASE` を無視するようにしました。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* パッチパーツに含まれる非圧縮バイト数の合計に対する上限（テーブル設定 `max_uncompressed_bytes_in_patches`）を追加しました。これにより、軽量更新後の SELECT クエリの大幅な低速化を防ぎ、軽量更新の悪用も防止します。 [#85641](https://github.com/ClickHouse/ClickHouse/pull/85641) ([Anton Popov](https://github.com/CurtizJ)).
* `GRANT READ/WRITE` のソース種別および `GRANT TABLE ENGINE` のテーブルエンジンを判別できるようにするため、`system.grants` に `parameter` 列を追加。 [#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `CREATE DICTIONARY` クエリのカラム定義において、Decimal(8) のようなパラメータ付きカラムの後に続く末尾のカンマのパースを修正しました。 [#85586](https://github.com/ClickHouse/ClickHouse/issues/85586) をクローズしました。 [#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 関数 `nested` が内部配列をサポートするようになりました。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 外部ライブラリによって行われるすべてのメモリアロケーションが、ClickHouse のメモリトラッカーによって把握され、正しく計上されるようになりました。これにより、特定のクエリで報告されるメモリ使用量が「増加」して見えたり、`MEMORY_LIMIT_EXCEEDED` によるエラーで失敗したりする場合があります。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。



#### バグ修正（公式の安定版リリースで発生する、ユーザーに見える誤動作）



* このPRは、RESTカタログ経由でIcebergテーブルをクエリする際のメタデータ解決処理を修正します。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha))。
* DDLWorker および DatabaseReplicatedDDLWorker における markReplicasActive を修正。[#81395](https://github.com/ClickHouse/ClickHouse/pull/81395)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 解析失敗時の Dynamic カラムのロールバック処理を修正。 [#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar))。
* すべての入力が定数のときに `trim` 関数を呼び出すと、定数の出力文字列を生成するようになりました（バグ [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* `optimize_syntax_fuse_functions` が有効な場合に、重複したサブクエリが原因で発生する論理エラーを修正し、[#75511](https://github.com/ClickHouse/ClickHouse/issues/75511) をクローズ。 [#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `WHERE ... IN (<subquery>)` 句を含むクエリで、クエリ条件キャッシュ（設定 `use_query_condition_cache`）が有効な場合に誤った結果が返される問題を修正しました。 [#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you))。
* これまで、`gcs` 関数を利用するためにアクセス権は一切必要ありませんでした。今後は、利用時に `GRANT READ ON S3` 権限が付与されているかを確認するようになります。 [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567) をクローズします。 [#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* s3Cluster() からレプリケーテッド MergeTree テーブルへの INSERT SELECT を実行する際に、使用できないノードをスキップするようにしました。 [#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter)).
* `plain_rewritable`/`plain` メタデータ型に対する、（実験的トランザクションで使用される MergeTree における）追記書き込みを修正しました。以前はこれらが単に無視されていました。 [#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach))。
* Avro schema registry の認証情報がユーザーに表示されたりログに出力されたりしないようにマスクしました。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `add_minmax_index_for_numeric_columns=1` または `add_minmax_index_for_string_columns=1` を指定して MergeTree テーブルを作成した場合、後続の ALTER 操作でインデックスがマテリアライズされ、その結果、新しいレプリカ上で Replicated データベースが正しく初期化できなくなる問題を修正しました。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique)).
* Decimal 型に対して誤った統計情報 (min/max) を出力していた Parquet writer を修正しました。 [#83754](https://github.com/ClickHouse/ClickHouse/pull/83754) ([Michael Kolupaev](https://github.com/al13n321)).
* `LowCardinality(Float32|Float64|BFloat16)` 型における NaN 値の並べ替え順を修正。 [#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* バックアップから復元する際に、definer ユーザーがバックアップされていない場合があり、その結果、バックアップ全体が破損してしまう可能性があります。これを解消するために、復元時の対象テーブル作成時に行っていた権限チェックを後ろ倒しし、実行時にのみチェックを行うようにしました。 [#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit)).
* 誤った `INSERT` の後に接続が切断状態のまま残り、クライアントがクラッシュする問題を修正。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* アナライザーを有効にしている場合、`remote` テーブル関数の `view(...)` 引数内で任意のテーブルを参照できるようにしました。 [#78717](https://github.com/ClickHouse/ClickHouse/issues/78717) を修正。 [#79377](https://github.com/ClickHouse/ClickHouse/issues/79377) を修正。 [#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* jsoneachrowwithprogress における onprogress 呼び出しが、最終処理と同期されるようになりました。 [#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema)).
* これにより [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303) がクローズされます。[#83892](https://github.com/ClickHouse/ClickHouse/pull/83892)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* const と非 const の引数が混在する場合の colorSRGBToOKLCH/colorOKLCHToSRGB を修正しました。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat))。
* RowBinary フォーマットで NULL 値を含む JSON パスを書き込む処理を修正。[#83923](https://github.com/ClickHouse/ClickHouse/pull/83923)（[Pavel Kruglov](https://github.com/Avogar)）。
* Date から DateTime64 への型変換時に、2106-02-07 より大きい値がオーバーフローしていた問題が修正されました。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 常に `filesystem_prefetches_limit` を適用するようにしました（`MergeTreePrefetchedReadPool` の場合に限らず）。 [#83999](https://github.com/ClickHouse/ClickHouse/pull/83999) ([Azat Khuzhin](https://github.com/azat))。
* `MATERIALIZE COLUMN` クエリにより `checksums.txt` に予期しないファイルが記録され、最終的にデータパーツが detached 状態になる可能性があったまれなバグを修正。 [#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* `LowCardinality` の列と、もう一方が定数値である場合に不等価条件で JOIN を実行すると発生する論理エラー `Expected single dictionary argument for function` を修正しました。[#81779](https://github.com/ClickHouse/ClickHouse/issues/81779) をクローズしました。[#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* シンタックスハイライトを有効にしたインタラクティブモードで使用した際に、clickhouse client がクラッシュする問題を修正しました。 [#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc)).
* クエリ条件キャッシュを再帰CTEと併用した場合に誤った結果が返される不具合を修正しました（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツの定期的なリフレッシュ時に、例外を適切に処理するようにしました。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 等価演算子のオペランドの型が異なる場合、または定数を参照している場合に、フィルタを JOIN 条件へマージする処理を修正しました。[#83432](https://github.com/ClickHouse/ClickHouse/issues/83432) を修正します。[#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* テーブルにプロジェクションがあり、`lightweight_mutation_projection_mode = 'rebuild'` が設定されていて、ユーザーがテーブル内の任意のブロックからすべての行を削除する軽量 DELETE を実行した場合に、まれに発生する ClickHouse のクラッシュを修正しました。 [#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin)).
* バックグラウンドのキャンセルチェック用スレッドによって発生するデッドロックを修正。 [#84203](https://github.com/ClickHouse/ClickHouse/pull/84203) ([Antonio Andelic](https://github.com/antonio2368)).
* 不正な `WINDOW` 定義に対する無限再帰的な解析を修正しました。 [#83131](https://github.com/ClickHouse/ClickHouse/issues/83131) を修正。 [#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* Bech32 のエンコードおよびデコードが誤った結果になる原因となっていたバグを修正しました。テストに使用していたアルゴリズムのオンライン実装にも同じ問題があったため、このバグは当初は検出されていませんでした。 [#84257](https://github.com/ClickHouse/ClickHouse/pull/84257) ([George Larionov](https://github.com/george-larionov)).
* `array()` 関数における空タプルの誤った生成を修正しました。これにより [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202) が解決されます。 [#84297](https://github.com/ClickHouse/ClickHouse/pull/84297) ([Amos Bird](https://github.com/amosbird)).
* 並列レプリカを使用するクエリで、複数の INNER 結合の後に RIGHT 結合が続く場合に発生する `LOGICAL_ERROR` を修正しました。このようなクエリでは並列レプリカを使用しないようにしました。 [#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir)).
* これまで、`set` インデックスは、グラニュールがフィルタを通過しているかどうかを判定する際に `Nullable` 列を考慮していませんでした（issue [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* ClickHouse は、テーブルタイプが小文字で指定されている Glue Catalog からテーブルを読み取れるようになりました。 [#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin))。
* JOIN またはサブクエリを含む場合は、テーブル関数をそのクラスタ版に置き換えないでください。 [#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `IAccessStorage` におけるロガーの使用方法を修正。[#84365](https://github.com/ClickHouse/ClickHouse/pull/84365)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* テーブルの全カラムを更新する軽量更新で発生していた論理エラーを修正しました。 [#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ)).
* `DoubleDelta` コーデックは、数値型のカラムにのみ適用できるようになりました。特に、`FixedString` カラムは `DoubleDelta` を使用して圧縮できなくなりました（[#80220](https://github.com/ClickHouse/ClickHouse/issues/80220) を修正）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `MinMax` インデックスの評価中に、NaN 値との比較で正しい範囲が使用されていませんでした。 [#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `lazy materialization` を使用する `Variant` 列の読み取りを修正。 [#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar))。
* `zoutofmemory` を論理エラーではなくハードウェアエラーとして扱うようにします。詳細は [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877) を参照してください。 [#84420](https://github.com/ClickHouse/ClickHouse/pull/84420) ([Han Fei](https://github.com/hanfei1991))。
* サーバー設定 `allow_no_password` を 0 に変更した後に、`no_password` で作成されたユーザーがログインを試みるとサーバーがクラッシュしていた問題を修正しました。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Keeper の changelog への順不同の書き込みを修正しました。これまで、changelog への書き込みが実行中の状態である一方で、ロールバックによって出力先ファイルが同時に変更される可能性がありました。これによりログの不整合やデータ損失が発生するおそれがありました。 [#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368)).
* これにより、MergeTree テーブルからすべての TTL が削除された場合、MergeTree は TTL に関連する処理を一切行わなくなりました。 [#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin))。
* `LIMIT` 付きの並列分散 `INSERT SELECT` が許可されていましたが、これは誤りであり、ターゲットテーブルでのデータ重複の原因となっていました。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* データレイクでの仮想列によるファイルプルーニングを修正。[#84520](https://github.com/ClickHouse/ClickHouse/pull/84520) ([Kseniia Sumarokova](https://github.com/kssenii))。
* RocksDB ストレージを使用する Keeper のリークを修正（イテレータが破棄されていなかった問題）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* `ALTER MODIFY ORDER BY` がソートキーに含まれる TTL 列を検証していなかった問題を修正しました。TTL 列が ALTER 操作中の `ORDER BY` 句で使用された場合に正しく拒否されるようになり、テーブル破損を防止します。 [#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 互換性のため、`allow_experimental_delta_kernel_rs` のバージョン 25.5 より前の既定値を `false` に変更しました。[#84587](https://github.com/ClickHouse/ClickHouse/pull/84587)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* マニフェストファイルからスキーマを取得するのをやめ、各スナップショットごとに関連するスキーマを個別に保存するようにしました。各データファイルについて、そのファイルに対応するスナップショットから関連スキーマを推論します。以前の動作は、マニフェストファイル内の status=existing のエントリに関する Iceberg 仕様に違反していました。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik))。
* Keeper 設定 `rotate_log_storage_interval = 0` が原因で ClickHouse がクラッシュする問題を修正しました。(issue [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975))。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637) ([George Larionov](https://github.com/george-larionov)).
* S3Queue のロジックエラー「Table is already registered」を修正。[#84433](https://github.com/ClickHouse/ClickHouse/issues/84433) をクローズ。 [https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) により発生していた不具合。 [#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* RefreshTask で &#39;view&#39; から zookeeper を取得する際に &#39;mutex&#39; をロック。 [#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 外部ソート使用時にレイジーカラムで発生する `CORRUPTED_DATA` エラーを修正。[#84738](https://github.com/ClickHouse/ClickHouse/pull/84738)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* ストレージ `DeltaLake` における delta-kernel 使用時の列プルーニングを修正。[#84543](https://github.com/ClickHouse/ClickHouse/issues/84543) をクローズ。 [#84745](https://github.com/ClickHouse/ClickHouse/pull/84745) ([Kseniia Sumarokova](https://github.com/kssenii))。
* storage DeltaLake の delta-kernel で認証情報をリフレッシュするようにしました。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 接続問題発生後に不要な内部バックアップが開始される不具合を修正。 [#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar)).
* 遅延中のリモートソースをクエリした際に、ベクターの範囲外参照が発生する可能性があった問題を修正しました。 [#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` トークナイザーと `no_op` トークナイザーは、空の入力トークンでも実験的なテキストインデックスをクラッシュさせなくなりました。 [#84849](https://github.com/ClickHouse/ClickHouse/pull/84849) ([Robert Schulze](https://github.com/rschu1ze)).
* `ReplacingMergeTree` と `CollapsingMergeTree` エンジンを使用するテーブルに対する軽量更新を修正しました。 [#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* object queue エンジンを使用するテーブルについて、すべての設定がテーブルのメタデータに正しく保存されるようにしました。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper によって返されるウォッチの総数を修正。 [#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* バージョン 25.7 より前のサーバー上で作成された `ReplicatedMergeTree` エンジンのテーブルに対する軽量アップデートを修正しました。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* `ALTER TABLE ... REPLACE PARTITION` クエリ実行後に、レプリケーションなしの `MergeTree` エンジンテーブルで発生していた軽量更新の不具合を修正しました。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* クエリ内での boolean リテラルと整数リテラルの列名の競合を防ぐため、boolean リテラルの列名生成において &quot;1&quot;/&quot;0&quot; ではなく &quot;true&quot;/&quot;false&quot; を使用するように修正しました。 [#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* バックグラウンドスケジュールプールおよびエグゼキュータにおけるメモリトラッキングのずれを修正。 [#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* Merge テーブルエンジンにおけるソート結果が不正確になる可能性のある問題を修正しました。 [#85025](https://github.com/ClickHouse/ClickHouse/pull/85025) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* DiskEncrypted で未実装だった API を実装しました。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 分散環境で相関サブクエリが使用されている場合にクラッシュを回避するためのチェックを追加しました。これにより [#82205](https://github.com/ClickHouse/ClickHouse/issues/82205) を修正します。 [#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* これにより、Iceberg は `SELECT` クエリ間で関連するスナップショットバージョンをキャッシュせず、常にその都度スナップショットを解決するようになりました。以前に行われた Iceberg スナップショットのキャッシュの試みは、タイムトラベル機能を利用する Iceberg テーブルの使用時に問題を引き起こしていました。[#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* `AzureIteratorAsync` における二重解放バグを修正。 [#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat)).
* JWT で識別されるユーザーを作成しようとした際に表示されるエラーメッセージを改善。 [#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `ReplicatedMergeTree` におけるパッチパーツのクリーンアップ処理を修正しました。以前は、パッチパーツを具体化するマージ済みまたはミューテート済みパーツが別のレプリカからダウンロードされるまで、軽量更新の結果がそのレプリカ上で一時的に表示されない場合がありました。 [#85121](https://github.com/ClickHouse/ClickHouse/pull/85121) ([Anton Popov](https://github.com/CurtizJ))。
* 型が異なる場合の `mv` に対する `illegal_type_of_argument` エラーの修正。 [#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* delta-kernel 実装におけるセグメンテーションフォルトを修正。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* メタデータファイルの移動に長時間を要する場合に、レプリケーテッドデータベースの復旧に時間がかかる問題を修正。 [#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `additional_table_filters expression` 設定内の `IN (subquery)` における `Not-ready Set` を修正。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* SYSTEM DROP REPLICA クエリ中の不要な `getStatus()` 呼び出しを削除しました。バックグラウンドでテーブルが DROP される際に、`Shutdown for storage is called` という例外がスローされる不具合を修正します。 [#85220](https://github.com/ClickHouse/ClickHouse/pull/85220) ([Nikolay Degterinsky](https://github.com/evillique))。
* `DeltaLake` エンジンの delta-kernel 実装におけるレースコンディションを修正。 [#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` エンジンで delta-kernel を無効化した状態でのパーティション化されたデータの読み取り処理を修正しました。これはバージョン 25.7 で不具合が発生していました（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* CREATE OR REPLACE および RENAME クエリにおいて不足していたテーブル名の長さのチェックを追加しました。 [#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321)).
* `DEFINER` が削除された場合に、Replicatedデータベースの新しいレプリカでの RMV の作成が正しく行われるように修正しました。 [#85327](https://github.com/ClickHouse/ClickHouse/pull/85327) ([Nikolay Degterinsky](https://github.com/evillique))。
* 複合データ型に対する Iceberg への書き込み処理を修正。[#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 複合型に対する書き込み時の下限値および上限値の指定はサポートされていません。 [#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Distributed テーブルまたは remote テーブル関数を介してオブジェクトストレージ関数から読み取る際に発生する論理エラーを修正しました。次の問題を修正しました: [#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* プロジェクションが壊れているパーツのバックアップを修正。 [#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368)).
* 安定するまでの間は、projection 内で `_part_offset` カラムを使用できないようにしました。 [#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* JSON データに対する ALTER UPDATE 実行中に発生するクラッシュおよびデータ破損を修正しました。[#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar)).
* 読み取り順を逆順にする最適化を使用する並列レプリカへのクエリで、誤った結果が返される可能性がありました。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* String のデシリアライズ中に `MEMORY_LIMIT_EXCEEDED` が発生した場合にクラッシュを引き起こし得る未定義動作 (UB) を修正。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 誤っていたメトリクス `KafkaAssignedPartitions` および `KafkaConsumersWithAssignment` を修正しました。 [#85494](https://github.com/ClickHouse/ClickHouse/pull/85494) ([Ilya Golshtein](https://github.com/ilejn))。
* PREWHERE（明示的指定または自動適用）を使用している場合に、処理済みバイト数の統計が過小に報告される不具合を修正しました。[#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321))。
* S3 の request rate slowdown に関する早期リターン条件を修正: 再試行可能なエラーにより全スレッドが一時停止した際のスローダウン動作を有効にする条件として、`s3_slow_all_threads_after_network_error` と `backup_slow_all_threads_after_retryable_s3_error` の両方ではなく、いずれか一方が true であればよいように変更しました。 [#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva)).
* この PR は、REST カタログ経由で Iceberg テーブルをクエリする際のメタデータ解決処理を修正します。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* `log_comment` または `insert_deduplication_token` の設定を変更する非同期挿入処理において、まれに発生していたクラッシュを修正しました。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ)).
* HTTP で multipart/form-data を使用する場合、date&#95;time&#95;input&#95;format などのパラメータが無視されていました。 [#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema)).
* icebergS3Cluster および icebergAzureCluster テーブル関数におけるシークレットのマスキング処理を修正。 [#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `JSONExtract` で JSON 数値を Decimal 型に変換する際の精度損失を修正しました。これにより、JSON の数値は浮動小数点の丸め誤差を回避しつつ、元の十進表現を正確に保持するようになりました。 [#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b)).
* `DROP COLUMN` の後に、同じ `ALTER` 文内で `COMMENT COLUMN IF EXISTS` を使用した際に発生していた `LOGICAL_ERROR` を修正しました。`IF EXISTS` 句は、同一文内でカラムが削除されている場合には、コメント操作を正しくスキップするようになりました。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* Delta Lake のキャッシュからの読み取り回数の計算を修正しました。 [#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 巨大な文字列に対する CoalescingMergeTree のセグメンテーションフォルトを修正しました。これにより [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582) が解決されました。 [#85709](https://github.com/ClickHouse/ClickHouse/pull/85709) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* Iceberg 書き込み時のメタデータタイムスタンプを更新。 [#85711](https://github.com/ClickHouse/ClickHouse/pull/85711) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `distributed_depth` を *Cluster 関数の指標として使用するのは誤りであり、データの重複につながる可能性があります。代わりに `client_info.collaborate_with_initiator` を使用してください。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark は position delete ファイルを読み込めません。 [#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* send&#95;logs&#95;source&#95;regexp を修正（[#85105](https://github.com/ClickHouse/ClickHouse/issues/85105) における非同期ロギングのリファクタリング後に発生した問題）。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* MEMORY&#95;LIMIT&#95;EXCEEDED エラー発生時に、update&#95;field を使用する辞書で起こり得る不整合を修正しました。 [#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat)).
* `Distributed` 宛先テーブルへの並列分散 `INSERT SELECT` において、`WITH` ステートメントのグローバル定数をサポートしました。以前は、このクエリで `Unknown expression identifier` エラーが発生する可能性がありました。 [#85811](https://github.com/ClickHouse/ClickHouse/pull/85811) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster` および `icebergAzureCluster` の認証情報をマスクするようにしました。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* `DatabaseReplicated` 使用時に `CREATE ... AS (SELECT * FROM s3Cluster(...))` を行おうとした場合に発生していた論理エラーを修正しました。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `url()` テーブル関数によって送信される HTTP リクエストについて、非標準ポートへアクセスする際に Host ヘッダーにポート番号が正しく含まれるように修正しました。これにより、開発環境で一般的な、カスタムポート上で動作する MinIO などの S3 互換サービスで presigned URL を使用する際に発生していた認証エラーが解消されます。（[ #85898 ](https://github.com/ClickHouse/ClickHouse/issues/85898) の修正）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* これにより Unity Catalog は、Delta 以外のテーブルにおいて異常なデータ型を含むスキーマを無視するようになりました。 [#85699](https://github.com/ClickHouse/ClickHouse/issues/85699) を修正。 [#85950](https://github.com/ClickHouse/ClickHouse/pull/85950) ([alesapin](https://github.com/alesapin))。
* Iceberg のフィールドの NULL 許容性を修正。 [#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `Replicated` データベースのリカバリにおけるバグを修正しました: テーブル名に `%` 記号が含まれている場合、リカバリ中に別の名前でテーブルが再作成されてしまう可能性がありました。 [#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 空の `Memory` テーブルを復元する際に発生する `BACKUP_ENTRY_NOT_FOUND` エラーによりバックアップの復元が失敗する不具合を修正。 [#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva)).
* Distributed テーブルの ALTER 時に `sharding_key` のチェックを追加しました。以前は、誤った ALTER によってテーブル定義が壊れ、サーバーの再起動が必要になることがありました。 [#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique)).
* 空の Iceberg 削除ファイルを作成しないようにしました。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 大きな設定値により S3Queue テーブルが動作しなくなり、レプリカの再起動ができなくなる問題を修正。 [#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique)).

#### ビルド/テスト/パッケージングの改善

- S3を使用したテストでデフォルトで暗号化ディスクを使用します。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- 統合テストで`clickhouse`バイナリを使用し、ストリップされていないデバッグシンボルを取得します。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- 内部のlibxml2を2.14.4から2.14.5にアップグレードしました。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze))。
- 内部のcurlを8.14.0から8.15.0にアップグレードしました。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze))。
- CI内のキャッシュで使用するメモリを削減し、エビクションのテストを改善しました。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin))。

### ClickHouseリリース25.7、2025-07-24 {#257}

#### 後方互換性のない変更

- `extractKeyValuePairs`関数の変更: 引用符で囲まれていないキーまたは値を読み取る際に`quoting_character`が予期せず見つかった場合の動作を制御する新しい引数`unexpected_quoting_character_strategy`を導入しました。値は`invalid`、`accept`、または`promote`のいずれかです。`invalid`はキーを破棄し、キー待機状態に戻ります。`accept`はそれをキーの一部として扱います。`promote`は前の文字を破棄し、引用符で囲まれたキーとして解析を開始します。さらに、引用符で囲まれた値を解析した後、ペア区切り文字が見つかった場合にのみ次のキーを解析します。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos))。
- `countMatches`関数でゼロバイトマッチをサポートしました。以前の動作を維持したいユーザーは、設定`count_matches_stop_at_empty_match`を有効にできます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- BACKUP生成時に、専用のサーバー設定(`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server`、`max_merges_bandwidth_for_server`)に加えて、ローカル(`max_local_read_bandwidth_for_server`および`max_local_write_bandwidth_for_server`)およびリモート(`max_remote_read_network_bandwidth_for_server`および`max_remote_write_network_bandwidth_for_server`)のサーバー全体のスロットラーを使用します。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa))。
- 挿入可能な列のないテーブルの作成を禁止しました。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
- アーカイブ内のファイルごとにクラスター関数を並列化しました。以前のバージョンでは、アーカイブ全体(zip、tar、7zなど)が作業単位でした。新しい設定`cluster_function_process_archive_on_multiple_nodes`を追加し、デフォルトで`true`に設定されています。`true`に設定すると、クラスター関数でのアーカイブ処理のパフォーマンスが向上します。以前のバージョンでアーカイブを使用したクラスター関数を使用している場合、互換性を保ち、25.7+へのアップグレード中のエラーを回避するために`false`に設定する必要があります。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `SYSTEM RESTART REPLICAS`クエリは、そのデータベースへのアクセス権がない場合でもLazyデータベース内のテーブルを起動させ、これらのテーブルが同時に削除されている間に発生していました。注意: 現在、`SYSTEM RESTART REPLICAS`は`SHOW TABLES`の権限を持つデータベース内のレプリカのみを再起動します。これは自然な動作です。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov))。


#### 新機能

* `MergeTree` ファミリーのテーブルに対する軽量アップデートのサポートが追加されました。軽量アップデートは、新しい構文 `UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>` で使用できます。軽量アップデートを利用した軽量削除の実装が追加されました。これは `lightweight_delete_mode = 'lightweight_update'` を設定することで有効にできます。 [#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ)).
* Iceberg のスキーマ進化で複合データ型をサポートしました。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg テーブルへの INSERT をサポートしました。 [#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* フィールド ID ごとに Iceberg データファイルを読み取れるようにしました。これにより Iceberg との互換性が向上します。メタデータ内のフィールドはリネームしても、基盤となる Parquet ファイル内では異なる名前にマッピングできます。これにより [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065) がクローズされました。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* ClickHouse は Iceberg 用の圧縮された `metadata.json` ファイルをサポートするようになりました。これにより [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874) が修正されました。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* Glue カタログで `TimestampTZ` をサポートしました。これにより [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654) が解決されました。[#83132](https://github.com/ClickHouse/ClickHouse/pull/83132)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse クライアントに AI を活用した SQL 生成機能を追加しました。ユーザーはクエリの前に `??` を付与することで、自然言語での記述から SQL クエリを生成できるようになりました。OpenAI および Anthropic プロバイダをサポートし、スキーマの自動検出にも対応しています。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314)（[Kaushik Iska](https://github.com/iskakaushik)）。
* Geo 型を WKB 形式で出力する関数を追加。 [#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ソース向けに新しいアクセス種別 `READ` と `WRITE` を導入し、ソースに関連する従来のすべてのアクセス種別は非推奨となりました。以前は `GRANT S3 ON *.* TO user` でしたが、現在は `GRANT READ, WRITE ON S3 TO user` を使用します。これにより、ソースに対する `READ` 権限と `WRITE` 権限を分離して付与できるようになり、例えば `GRANT READ ON * TO user`、`GRANT WRITE ON S3 TO user` のように指定できます。この機能は設定 `access_control_improvements.enable_read_write_grants` によって制御され、デフォルトでは無効になっています。 [#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit)).
* NumericIndexedVector: ビットスライス方式の Roaring-bitmap 圧縮を基盤とする新しいベクターデータ構造であり、構築・分析・要素単位の算術演算のための 20 を超える関数を備えています。疎なデータに対してストレージ使用量を削減し、結合・フィルタ・集計を高速化できます。[#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) および T. Xiong と Y. Wang による VLDB 2024 掲載論文 [“Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411) を実装しています。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193) ([FriendLey](https://github.com/FriendLey))。
* ワークロード設定 `max_waiting_queries` がサポートされるようになりました。これを使用してクエリキューのサイズを制限できます。上限に達した場合、それ以降のすべてのクエリは `SERVER_OVERLOADED` エラーで終了します。 [#81250](https://github.com/ClickHouse/ClickHouse/pull/81250) ([Oleg Doronin](https://github.com/dorooleg))。
* 以下の財務関数を追加しました: `financialInternalRateOfReturnExtended` (`XIRR`), `financialInternalRateOfReturn` (`IRR`), `financialNetPresentValueExtended` (`XNPV`), `financialNetPresentValue` (`NPV`)。[#81599](https://github.com/ClickHouse/ClickHouse/pull/81599)（[Joanna Hulboj](https://github.com/jh0x)）。
* 2つのポリゴンが交差しているかを判定するためのジオスペーシャル関数 `polygonsIntersectCartesian` と `polygonsIntersectSpherical` を追加。 [#81882](https://github.com/ClickHouse/ClickHouse/pull/81882) ([Paul Lamb](https://github.com/plamb)).
* MergeTree ファミリーのテーブルで `_part_granule_offset` 仮想カラムをサポートしました。このカラムは、各行が所属するデータパート内で、その行が含まれるグラニュール／マークの 0 始まりのインデックスを示します。これは [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572) に対応するものです。 [#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。 [#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* sRGB 色空間と OkLCH 色空間の間で色を相互変換するための SQL 関数 `colorSRGBToOkLCH` および `colorOkLCHToSRGB` を追加しました。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue)).
* `CREATE USER` クエリでユーザー名にパラメータを使用できるようにしました。 [#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein))。
* `system.formats` テーブルには、HTTP コンテンツタイプやスキーマ推論の可否など、フォーマットに関する拡張情報が含まれるようになりました。 [#81505](https://github.com/ClickHouse/ClickHouse/pull/81505) ([Alexey Milovidov](https://github.com/alexey-milovidov))。



#### 実験的機能
* テキストインデックスを検索するための汎用ツールである関数 `searchAny` および `searchAll` を追加しました。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスが新しい `split` トークナイザーをサポートするようになりました。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `text` インデックスのデフォルトのインデックス粒度を 64 に変更しました。これにより、社内ベンチマークにおける平均的なテストクエリの想定パフォーマンスが向上します。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256-bit ビットマップは状態の遷移ラベルを順序付きで保持しますが、遷移先状態はハッシュテーブルに現れる順序でディスクに保存されます。そのため、ディスクから読み出す際に、ラベルが誤った次状態を指してしまう可能性がありました。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスにおける FST ツリーブロブに対して zstd 圧縮を有効化しました。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* ベクター類似性インデックスをベータ版に昇格しました。ベクター類似性インデックスを使用するためには有効化が必要なエイリアス設定 `enable_vector_similarity_index` を導入しました。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 実験的なゼロコピー・レプリケーションに関連する実験的な `send_metadata` ロジックを削除しました。これは一度も使用されたことがなく、このコードをサポートしている人もいませんでした。さらに、これに関連するテストも存在しなかったため、かなり前から壊れていた可能性が高いと考えられます。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* `StorageKafka2` を `system.kafka_consumers` に統合しました。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 統計情報に基づいて、`(a < 1 and a > 0) or b = 3` のような複雑な CNF/DNF を評価・推定できるようにしました。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 非同期ロギングを導入しました。ログが低速なデバイスに出力される場合でも、クエリの実行が遅延しなくなりました。 [#82516](https://github.com/ClickHouse/ClickHouse/pull/82516) ([Raúl Marín](https://github.com/Algunenano))。キューに保持できるエントリ数の上限を設定しました。 [#83214](https://github.com/ClickHouse/ClickHouse/pull/83214) ([Raúl Marín](https://github.com/Algunenano))。
* パラレル分散 `INSERT SELECT` は、`INSERT SELECT` が各シャード上で独立して実行されるモードでデフォルトで有効です。`parallel_distributed_insert_select` 設定を参照してください。 [#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter)).
* 集約クエリに、`Nullable` ではない列に対する単一の `count()` 関数のみが含まれている場合、ハッシュテーブル探索中に集約ロジックが完全にインライン化されます。これにより、集約状態の割り当てや管理が不要となり、メモリ使用量と CPU オーバーヘッドが大幅に削減されます。これは [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) の問題を部分的に解決します。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* `HashJoin` のパフォーマンスを最適化しました。典型的なキー列が 1 つだけのケースではハッシュマップに対する追加ループを削除し、さらに `null_map` と `join_mask` が常に `true` / `false` となる場合には、それらのチェックも削除しました。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat)).
* `-If` コンビネータ向けの軽微な最適化。 [#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* ベクトル類似度インデックスを使用するベクトル検索クエリは、ストレージの読み取り回数と CPU 使用率の削減により、より低いレイテンシで完了します。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `filterPartsByQueryConditionCache` において `merge_tree_min_{rows,bytes}_for_seek` を考慮するようにし、インデックスでフィルタリングを行う他のメソッドと整合するようにしました。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* `TOTALS` ステップ以降のパイプラインをマルチスレッド化しました。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus))。
* `Redis` および `KeeperMap` ストレージにおけるキーによるフィルタリングを修正。 [#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 新しい設定 `min_joined_block_size_rows`（`min_joined_block_size_bytes` に類似、デフォルトは 65409）を追加し、JOIN の入力および出力ブロックに対する最小ブロックサイズ（行数）を制御できるようにしました（JOIN アルゴリズムが対応している場合）。小さいブロックはまとめて 1 つのブロックに統合されます。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` を実行しても、すべてのキャッシュが削除されなくなりました。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 等価クラスを使用して冗長な JOIN 演算を削除することで、相関サブクエリに対して生成されたプランを最適化します。すべての相関列に対して等価な式が存在する場合、`query_plan_correlated_subqueries_use_substitution` 設定が有効な場合は `CROSS JOIN` は生成されません。 [#82435](https://github.com/ClickHouse/ClickHouse/pull/82435) ([Dmitry Novik](https://github.com/novikd))。
* `EXISTS` 関数の引数として使用されている相関サブクエリでは、必要な列だけを読み取るようにしました。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* クエリ解析中におけるクエリツリーの比較処理をわずかに高速化しました。 [#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* false sharing を低減するため、ProfileEvents の Counter にアラインメントを追加。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) の `null_map` および `JoinMask` に対する最適化が、JOIN 条件に複数の論理和（OR）を含む場合にも適用されました。また、`KnownRowsHolder` データ構造も最適化されました。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* 各フラグにアクセスするたびにハッシュを計算しないよう、JOIN フラグにはプレーンな `std::vector<std::atomic_bool>` を使用しています。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* `HashJoin` が `lazy` 出力モードを使用している場合、結果カラム用のメモリを事前にプリアロケートする必要はありません。特にマッチ数が少ない場合には非効率的です。さらに、結合が完了した後でマッチ数を正確に把握できるため、それに基づいてより正確にメモリを事前割り当てできます。[#83304](https://github.com/ClickHouse/ClickHouse/pull/83304)（[Nikita Taranov](https://github.com/nickitat)）。
* パイプライン構築時のポートヘッダーにおけるメモリコピーを最小限に抑えます。元の[PR](https://github.com/ClickHouse/ClickHouse/pull/70105)は[heymind](https://github.com/heymind)によるものです。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* rocksdb ストレージ使用時の clickhouse-keeper の起動処理を改善しました。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368))。
* 高い同時実行負荷下でのロック競合を減らすため、ストレージスナップショットデータの作成中はロックを保持しないようにしました。 [#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94)).
* パースエラーが発生しない場合にシリアライザを再利用することで、`ProtobufSingle` 入力フォーマットのパフォーマンスを改善しました。 [#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa)).
* 短いクエリを高速化するためのパイプライン構築処理のパフォーマンスを改善しました。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 短いクエリを高速化するために `MergeTreeReadersChain::getSampleBlock` を最適化しました。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano)).
* データカタログでのテーブル一覧取得を非同期リクエストにより高速化しました。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* `s3_slow_all_threads_after_network_error` 設定が有効な場合に、S3 の再試行メカニズムにジッターを導入しました。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改善

* 括弧を複数の色で色分けし、可読性を向上しました。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* LIKE/REGEXP パターンを入力中にメタ文字をハイライト表示するようにしました。これはすでに `clickhouse-format` および `clickhouse-client` のエコー出力には実装されていましたが、今回コマンドプロンプト上でも利用できるようになりました。 [#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-format` およびクライアントでの echo 出力におけるハイライトは、コマンドラインプロンプトでのハイライトと同様に動作するようになりました。 [#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `plain_rewritable` ディスクをデータベースメタデータ用のディスクとして利用できるようにしました。データベースディスクとしてサポートするために、`plain_rewritable` に `moveFile` および `replaceFile` メソッドを実装しました。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach))。
* `PostgreSQL`、`MySQL`、`DataLake` データベースのバックアップを許可します。このようなデータベースのバックアップでは、データベースの定義のみが保存され、その内部のデータは保存されません。 [#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique)).
* `allow_experimental_join_condition` の設定は、常に許可されるようになったため、廃止予定としてマークされました。 [#80566](https://github.com/ClickHouse/ClickHouse/pull/80566) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ClickHouse の非同期メトリクスに pressure メトリクスを追加。 [#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1)).
* マークキャッシュからの追い出しを追跡するためのメトリクス `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles` を追加しました（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* Parquet の enum を、[仕様](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)で定められているとおりバイト配列として書き込めるようにしました。 [#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos))。
* `DeltaLake` テーブルエンジンの改良: delta-kernel-rs には `ExpressionVisitor` API があり、この PR で実装され、パーティション列の式変換に適用されています（これまでコード内で使用していた、delta-kernel-rs 側で非推奨となった旧来の方法を置き換えるものです）。将来的には、この `ExpressionVisitor` により、統計情報に基づくプルーニングや、いくつかの Delta Lake 独自機能も実装できるようになります。さらに、この変更の目的は、`DeltaLakeCluster` テーブルエンジンでのパーティションプルーニングをサポートすることです（解析済み式の結果である ActionsDAG はシリアライズされ、データパスと共にイニシエーターから送信されます。これは、プルーニングに必要なこの種の情報が、データファイル一覧のメタ情報としてのみ利用可能であり、その取得処理はイニシエーターのみが実行する一方で、その結果は各読み取りサーバー上のデータに適用する必要があるためです）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 名前付きタプルのスーパータイプを導出する際に要素名を保持するようになりました。 [#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc)).
* StorageKafka2 で、前回コミットされたオフセットに依存しないように、消費したメッセージを手動でカウントするようにしました。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ClickHouse Keeper のデータを管理および分析するための新しいコマンドラインツール `clickhouse-keeper-utils` を追加しました。このツールは、スナップショットおよびチェンジログからの状態のダンプ出力、チェンジログファイルの分析、特定のログ範囲の抽出をサポートします。 [#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 全体およびユーザーごとのネットワークスロットルはリセットされることがないため、`max_network_bandwidth_for_all_users` および `max_network_bandwidth_for_all_users` の制限値が超過されることはありません。 [#81729](https://github.com/ClickHouse/ClickHouse/pull/81729) ([Sergei Trifonov](https://github.com/serxa))。
* 出力フォーマットとして GeoParquet への書き込みをサポートしました。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 未完了のデータ mutation によって現在影響を受けているカラムをリネームすることになる場合は、`RENAME COLUMN` の ALTER mutation を開始できないようにしました。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Connection` ヘッダーは、接続を維持すべきかが判明した時点で、ヘッダーの末尾に送信されるようになりました。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema)).
* TCP サーバーのキュー（デフォルト 64）を、`listen_backlog`（デフォルト 4096）に基づいてチューニングしました。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* サーバーを再起動することなく、その場で `max_local_read_bandwidth_for_server` および `max_local_write_bandwidth_for_server` を再読み込みできる機能を追加。 [#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu)).
* `TRUNCATE TABLE system.warnings` により `system.warnings` テーブル内のすべての警告を削除できるようにしました。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir))。
* データレイククラスタ関数におけるパーティションプルーニングを修正しました。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLakeCluster テーブル関数でパーティション化されたデータの読み取りを修正しました。この PR ではクラスター関数のプロトコルバージョンを上げ、イニシエーターからレプリカへ追加情報を送信できるようにしています。この追加情報には、パーティション列を解析するために必要な delta-kernel の変換式（および将来的には生成列などのその他の情報）が含まれます。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 関数 `reinterpret` は、固定サイズのデータ型である `T` を要素とする `Array(T)` への変換をサポートするようになりました（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* これにより、Datalake データベースはよりわかりやすい例外をスローするようになりました。Fixes [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211). [#82304](https://github.com/ClickHouse/ClickHouse/pull/82304) ([alesapin](https://github.com/alesapin)).
* `HashJoin::needUsedFlagsForPerRightTableRow` から false を返すようにして CROSS JOIN を改善。[#82379](https://github.com/ClickHouse/ClickHouse/pull/82379)（[lgbo](https://github.com/lgbo-ustc)）。
* `map` 列を `Array(Tuple)` 型として読み書きできるようにしました。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.licenses` に [Rust](https://clickhouse.com/blog/rust) クレートのライセンスを一覧します。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano)).
* `{uuid}` のようなマクロを、S3Queue テーブルエンジンの `keeper_path` 設定項目で使用できるようになりました。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463) ([Nikolay Degterinsky](https://github.com/evillique))。
* Keeper の改善: changelog ファイルのディスク間での移動をバックグラウンドスレッドで行うようにしました。以前は、changelog を別のディスクへ移動する処理が完了するまで、Keeper 全体がブロックされていました。そのため、移動処理に時間がかかる場合（例: S3 ディスクへの移動）にはパフォーマンスの低下を招いていました。[#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper の改良: 新しい設定項目 `keeper_server.cleanup_old_and_ignore_new_acl` を追加しました。有効にすると、すべてのノードで既存の ACL がクリアされ、新しいリクエストに対する ACL は無視されます。ノードから ACL を完全に削除することが目的の場合は、新しいスナップショットが作成されるまでこの設定を有効なままにしておくことが重要です。[#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368))。
* S3Queue テーブルエンジンを使用するテーブルでのストリーミングを無効化する新しいサーバー設定 `s3queue_disable_streaming` を追加しました。この設定はサーバーの再起動なしで変更できます。 [#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュの動的リサイズ機能をリファクタリングしました。内部解析用のログをさらに追加しました。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定ファイルなしで起動した `clickhouse-server` も、デフォルト設定と同様に PostgreSQL のポート 9005 をリッスンします。 [#82633](https://github.com/ClickHouse/ClickHouse/pull/82633) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `ReplicatedMergeTree::executeMetadataAlter` では StorageID を取得し、`DDLGuard` を取得せずに `IDatabase::alterTable` を呼び出そうとします。この間のタイミングで、技術的には対象のテーブルを別のテーブルと差し替えることができてしまうため、その時点でテーブル定義を取得すると誤ったものを取得してしまう可能性があります。これを回避するため、`IDatabase::alterTable` を呼び出そうとする際に UUID が一致するかどうかを別途チェックするようにしました。[#82666](https://github.com/ClickHouse/ClickHouse/pull/82666)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 読み取り専用のリモートディスク上のデータベースをアタッチする際には、テーブル UUID を手動で DatabaseCatalog に追加します。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach))。
* ユーザーが `NumericIndexedVector` で `nan` および `inf` を使用できないようにします。[#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) を修正し、その他の細かな点も改善します。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `X-ClickHouse-Progress` および `X-ClickHouse-Summary` のヘッダー形式で、ゼロ値を省略しないようにしました。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper の改善: `world:anyone` ACL に対して特定の権限をサポートしました。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* SummingMergeTree において、合計対象として明示的に指定されているカラムを含む `RENAME COLUMN` または `DROP COLUMN` を許可しないようにしました。 [#81836](https://github.com/ClickHouse/ClickHouse/issues/81836) をクローズしました。 [#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Decimal` から `Float32` への変換の精度を改善しました。`Decimal` から `BFloat16` への変換を実装しました。[#82660](https://github.com/ClickHouse/ClickHouse/issues/82660) をクローズしました。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI のスクロールバーの表示がわずかに改善されました。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 組み込み設定を持つ `clickhouse-server` は、HTTP OPTIONS レスポンスを返すことで Web UI を利用可能にします。 [#82870](https://github.com/ClickHouse/ClickHouse/pull/82870) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 設定ファイル内のパスに対して追加の Keeper ACL を指定できるようになりました。特定のパスに追加の ACL を付与したい場合は、設定ファイルの `zookeeper.path_acls` で定義します。 [#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368))。
* 今後は、mutation スナップショットは可視部分のスナップショットから構築されます。また、スナップショットで使用される mutation カウンタは、含まれる mutation に基づいて再計算されます。 [#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun))。
* Keeper がソフトメモリ制限により書き込みを拒否した際に発生する `ProfileEvent` を追加。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* `system.s3queue_log` に `commit_time`、`commit_id` の列を追加しました。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 場合によっては、メトリクスに複数のディメンションが必要になることがあります。たとえば、単一のカウンタだけを持つのではなく、エラーコードごとに失敗したマージやミューテーションの回数を数えたい場合です。そのために、まさにこの用途に対応する `system.dimensional_metrics` を導入し、最初のディメンション付きメトリクスとして `failed_merges` を追加しました。 [#83030](https://github.com/ClickHouse/ClickHouse/pull/83030) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* clickhouse client で未知の設定に関する警告を集約し、概要としてログ出力するようにしました。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc))。
* 接続エラーが発生した場合、ClickHouse クライアントがローカルポートを出力するようになりました。 [#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` におけるエラー処理をわずかに改善しました。`/sys/block` ディレクトリが存在するがアクセスできない場合には、サーバーはブロックデバイスの監視を行わずに起動します。[#79229](https://github.com/ClickHouse/ClickHouse/issues/79229) をクローズしました。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SystemLogs を、通常テーブルの後（通常テーブルの前ではなくシステムテーブルの前）にシャットダウンするようにしました。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` のシャットダウン処理用のログを追加しました。 [#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Time` および `Time64` を `MM:SS`、`M:SS`、`SS`、または `S` としてパースできるようにしました。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `distributed_ddl_output_mode='*_only_active'` の場合、`max_replication_lag_to_enqueue` より大きなレプリケーションラグを持つ新規作成または復旧済みのレプリカを待機しないようにしました。これにより、新しいレプリカが初期化やリカバリ完了後にアクティブになったものの、初期化中に大量のレプリケーションログを蓄積していたために `DDL task is not finished on some hosts` という状況が発生するのを避けやすくなります。あわせて、レプリケーションログが `max_replication_lag_to_enqueue` 未満になるまで待機する `SYSTEM SYNC DATABASE REPLICA STRICT` クエリを実装しました。 [#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 例外メッセージ内での式アクションの説明を、過度に長く出力しないようにしました。 [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164) をクローズしました。 [#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パーツのプレフィックスおよびサフィックスを解析する機能を追加し、非定数カラムのカバレッジもチェックできるようにしました。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 名前付きコレクション使用時の ODBC と JDBC のパラメータ名を統一しました。[#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* ストレージのシャットダウン中に `getStatus` は `ErrorCodes::ABORTED` 例外をスローします。以前は、これにより SELECT クエリが失敗していました。現在は `ErrorCodes::ABORTED` 例外を捕捉し、意図的に無視するようになりました。 [#83435](https://github.com/ClickHouse/ClickHouse/pull/83435) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `MergeParts` エントリの part&#95;log プロファイルイベントに、`UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds` などのプロセスリソースのメトリクスを追加しました。 [#83460](https://github.com/ClickHouse/ClickHouse/pull/83460) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Keeper において `create_if_not_exists`、`check_not_exists`、`remove_recursive` の各機能フラグをデフォルトで有効化し、新しい種類のリクエストを利用できるようにしました。 [#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368))。
* サーバーのシャットダウン時には、任意のテーブルを停止する前に S3（Azure など）キューストリーミングをシャットダウンします。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `JSON` 入力フォーマットで `Date` / `Date32` を整数として扱えるようにしました。 [#83597](https://github.com/ClickHouse/ClickHouse/pull/83597)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* 特定の状況でのプロジェクションのロードおよび追加時に発生する例外メッセージを、より読みやすいものにしました。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-server` のバイナリのチェックサム整合性検証をスキップするための設定オプションを導入しました。これにより [#83637](https://github.com/ClickHouse/ClickHouse/issues/83637) が解決されます。[#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `clickhouse-benchmark` の `--reconnect` オプションの誤ったデフォルト値を修正しました。これは [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) で誤って変更されていたものです。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CREATE DICTIONARY` のフォーマットの不整合を修正。[#82105](https://github.com/ClickHouse/ClickHouse/issues/82105) をクローズ。[#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `materialize` 関数を含む TTL の書式の不整合を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `INTO OUTFILE` などの出力オプションを含むサブクエリにおいて、`EXPLAIN AST` の表示形式が一貫しない問題を修正。[#82826](https://github.com/ClickHouse/ClickHouse/issues/82826) をクローズ。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* エイリアスが許可されていないコンテキストにおける、エイリアス付き括弧表現のフォーマットの不整合を修正。[#82836](https://github.com/ClickHouse/ClickHouse/issues/82836) をクローズ。[#82837](https://github.com/ClickHouse/ClickHouse/issues/82837) をクローズ。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* IPv4 と集約関数状態の乗算時に、適切なエラーコードが使用されるようにしました。 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817) をクローズ。 [#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ファイルシステムキャッシュで発生していた論理エラー &quot;Having zero bytes but range is not finished&quot; を修正。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* TTL によって行が削減された際に、それに依存している `minmax_count_projection` などのアルゴリズムの正確性を確保するため、min-max インデックスを再計算します。これにより [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091) が解決されます。 [#77166](https://github.com/ClickHouse/ClickHouse/pull/77166) ([Amos Bird](https://github.com/amosbird))。
* `ORDER BY ... LIMIT BY ... LIMIT N` を組み合わせたクエリにおいて、ORDER BY が PartialSorting として実行される場合、カウンター `rows_before_limit_at_least` は、ソート変換で消費された行数ではなく、LIMIT 句で消費された行数を反映するようになりました。 [#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 正規表現にオルタネーションを含み、先頭の選択肢がリテラルでない場合の token/ngram インデックスによるフィルタリングで、granule を過剰にスキップしてしまう問題を修正。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* `<=>` 演算子と Join ストレージに関する論理エラーを修正し、クエリが正しいエラーコードを返すようにしました。 [#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `remote` 関数ファミリーと併用した際に `loop` 関数で発生するクラッシュを修正しました。`loop(remote(...))` で LIMIT 句が正しく適用されるようにしました。 [#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* Unix エポック (1970-01-01) より前および最大日時 (2106-02-07 06:28:15) より後の日付を処理する際の `to_utc_timestamp` 関数と `from_utc_timestamp` 関数の誤った動作を修正しました。これらの関数は、それぞれエポック開始時刻および最大日時に値を正しく切り詰めるようになりました。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* 一部のクエリを parallel replicas で実行する場合、イニシエータでは reading-in-order の最適化を適用できる一方で、リモートノードでは適用できないことがあります。その結果、parallel replicas コーディネータ（イニシエータ上）とリモートノードとで異なる読み取りモードが使用され、論理的な誤りにつながります。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter))。
* カラムの型が `Nullable` に変更された場合のプロジェクションのマテリアライズ処理における論理エラーを修正。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar))。
* TTL 更新時に、TTL GROUP BY における TTL の再計算が誤って行われる問題を修正しました。 [#81222](https://github.com/ClickHouse/ClickHouse/pull/81222) ([Evgeniy Ulasik](https://github.com/H0uston)).
* Parquet のブルームフィルタが、`WHERE function(key) IN (...)` のような条件を `WHERE key IN (...)` であるかのように誤って適用していた不具合を修正しました。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* 必要に応じて（たとえば、名前に `-` のような特殊文字が含まれている場合など）、データベース名およびテーブル名にバッククォートを追加するように `InterpreterInsertQuery::extendQueryLogElemImpl` を修正しました。 [#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu))。
* 左辺引数が null で、かつサブクエリ結果が非 Nullable である場合の、`transform_null_in=1` 設定時における `IN` の実行を修正。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 既存のテーブルから読み込む際には、default/materialize 式の実行中に experimental/suspicious 型を検証しないようにしました。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL 式で dict が使用されている場合にマージ中に発生する「Context has expired」エラーを修正。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* `cast` 関数の単調性を修正。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi)).
* スカラー相関サブクエリの処理中に必要な列が読み込まれない問題を修正しました（[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716)）。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して不要に多くのコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) がクローズされました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前は、`MongoDB` テーブルエンジンの定義で `host:port` 引数にパスコンポーネントを含めることができましたが、このパスコンポーネントは暗黙的に無視されていました。MongoDB 連携機能では、このようなテーブルの読み込みを拒否していました。この修正により、*`MongoDB` エンジンの引数が 5 つある場合には、そのようなテーブルの読み込みを許可し、パスコンポーネントを無視したうえで*、引数からデータベース名を使用するようにしました。*注意:* この修正は、新規作成されたテーブルや `mongo` テーブル関数を使用したクエリ、およびディクショナリソースや named collection には適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* マージ処理中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* クエリで定数のエイリアス列のみが使用されている場合のフィルタ解析を修正しました。これにより [#79448](https://github.com/ClickHouse/ClickHouse/issues/79448) が修正されます。 [#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* GROUP BY と SET の両方で TTL に同じカラムを使用した場合に発生する LOGICAL&#95;ERROR およびその後に発生するクラッシュを修正。[#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos))。
* シークレットマスキングにおける S3 テーブル関数の引数検証を修正し、発生しうる `LOGICAL_ERROR` を防止しました。[#80620](https://github.com/ClickHouse/ClickHouse/issues/80620) をクローズ。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* Iceberg のデータレースを修正。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* `DatabaseReplicated::getClusterImpl` を修正しました。`hosts` の先頭の要素（または複数の要素）の `id` が `DROPPED_MARK` であり、同じシャードに対する他の要素が存在しない場合、`shards` の先頭要素が空のベクタとなり、その結果 `std::out_of_range` が発生していました。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* arraySimilarity におけるコピーペーストの誤りを修正し、重みとしての UInt32 および Int32 の使用を禁止。テストとドキュメントを更新。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `WHERE` 句および `IndexSet` を含むクエリで `arrayJoin` を使用した際に発生する `Not found column` エラーを修正しました。 [#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Glue カタログ統合の不具合を修正しました。これにより、ClickHouse は一部のサブカラムに Decimal 型を含むネストしたデータ型のテーブルを読み取れるようになりました（例: `map&lt;string, decimal(9, 2)&gt;`）。[#81301](https://github.com/ClickHouse/ClickHouse/issues/81301) を修正しました。 [#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* バージョン 25.5 で [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) によって導入された SummingMergeTree のパフォーマンス低下を修正します。 [#82130](https://github.com/ClickHouse/ClickHouse/pull/82130) ([Pavel Kruglov](https://github.com/Avogar))。
* URI 経由で設定を渡す場合は、最後に指定された値が採用されます。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* Iceberg のエラー「Context has expired」を修正しました。 [#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* メモリプレッシャーがかかっているサーバーにおいて、リモートクエリで発生する可能性のあるデッドロックを修正しました。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar)).
* 大きな数値に適用した際に発生していた `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 関数のオーバーフローを修正しました。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Materialized View が INSERT クエリを見逃してしまう原因となっていたテーブル依存関係のバグを修正しました。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* サジェストスレッドとメインクライアントスレッドの間で発生し得るデータ競合を修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* これにより、ClickHouse はスキーマ進化後でも Glue カタログから Iceberg テーブルを読み取れるようになりました。 [#81272](https://github.com/ClickHouse/ClickHouse/issues/81272) を修正しました。 [#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 非同期メトリクス設定 `asynchronous_metrics_update_period_s` と `asynchronous_heavy_metrics_update_period_s` のバリデーションを修正しました。 [#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc)).
* 複数の JOIN を含むクエリで matcher を解決する際の論理エラーを修正し、[#81969](https://github.com/ClickHouse/ClickHouse/issues/81969) をクローズ。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* AWS ECS トークンに有効期限を追加し、再読み込みできるようにしました。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `CASE` 関数における `NULL` 引数の不具合を修正。 [#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* クライアント内のデータレースを（グローバルコンテキストを使用しないことで）修正し、`session_timezone` のオーバーライドの挙動を修正しました（以前は、`session_timezone` が `users.xml`/クライアントオプションで非空に設定され、クエリコンテキストで空に設定されている場合、本来は誤りであるにもかかわらず `users.xml` の値が使用されていましたが、現在は常にクエリコンテキストがグローバルコンテキストより優先されます）。[#82444](https://github.com/ClickHouse/ClickHouse/pull/82444)（[Azat Khuzhin](https://github.com/azat)）。
* 外部テーブルエンジンにおけるキャッシュバッファの境界アライメント無効化処理を修正しました。この機能は [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) によって不具合が生じていました。[#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 型キャストされたキーを使って key-value ストレージを JOIN した際に発生するクラッシュを修正しました。 [#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* logs/query&#95;log における名前付きコレクション値のマスク処理を修正。 [#82405](https://github.com/ClickHouse/ClickHouse/issues/82405) をクローズ。 [#82510](https://github.com/ClickHouse/ClickHouse/pull/82510) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `user_id` が空になる場合があるため、セッション終了時のロギング中に発生する可能性のあるクラッシュを修正しました。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc)).
* Time のパース処理によって msan の問題が発生する可能性があったケースを修正しました。この修正で次の issue が解決されました: [#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* サーバーの処理が行き詰まらないようにするため、`threadpool_writer_pool_size` をゼロに設定できないようにしました。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc))。
* 相関列に対する行ポリシー式の解析中に発生していた `LOGICAL_ERROR` を修正。[#82618](https://github.com/ClickHouse/ClickHouse/pull/82618)（[Dmitry Novik](https://github.com/novikd)）。
* `enable_shared_storage_snapshot_in_query = 1` の場合に、`mergeTreeProjection` テーブル関数で親メタデータが誤って使用されていた問題を修正しました。これは [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634) に対応するものです。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 関数 `trim{Left,Right,Both}` は、型 &quot;FixedString(N)&quot; の入力文字列をサポートするようになりました。例えば、`SELECT trimBoth(toFixedString('abc', 3), 'ac')` が実行可能になりました。 [#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* AzureBlobStorage において、ネイティブコピー処理では認証方法を比較しますが、その過程で例外が発生した場合には、読み取り＋コピー（すなわち非ネイティブコピー）へフォールバックするようにコードを更新しました。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 要素が空の場合の `groupArraySample` / `groupArrayLast` のデシリアライズを修正（入力が空の場合、デシリアライズ処理がバイナリの一部をスキップしてしまうことがあり、その結果、データ読み取り時のデータ破損や TCP プロトコルでの UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER エラーを引き起こす可能性がありました）。これは数値型および日時型には影響しません。 [#82763](https://github.com/ClickHouse/ClickHouse/pull/82763) ([Pedro Ferreira](https://github.com/PedroTadim)).
* 空の `Memory` テーブルのバックアップ処理を修正し、バックアップの復元時に `BACKUP_ENTRY_NOT_FOUND` エラーで失敗してしまう問題を解消しました。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* union/intersect/except&#95;default&#95;mode の書き換えにおける例外安全性を修正しました。[#82664](https://github.com/ClickHouse/ClickHouse/issues/82664) をクローズ。 [#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 非同期テーブルの読み込みジョブ数を追跡する。実行中のジョブがある場合は、`TransactionLog::removeOldEntries` 内で `tail_ptr` を更新しない。[#82824](https://github.com/ClickHouse/ClickHouse/pull/82824)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* Iceberg におけるデータ競合を修正。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* `use_skip_indexes_if_final_exact_mode` 最適化（25.6 で導入）が、`MergeTree` エンジンの設定やデータ分布によっては、関連する候補範囲を正しく選択できない場合がありました。この問題は解消されています。 [#82879](https://github.com/ClickHouse/ClickHouse/pull/82879)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* SCRAM&#95;SHA256&#95;PASSWORD 型の AST をパースする際に認証データの salt を設定するようにしました。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach))。
* キャッシュ機能のない Database 実装を使用する場合、対応するテーブルのメタデータは、カラムが返された後に参照が無効化されると削除されます。 [#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01))。
* `Merge` テーブルエンジンを使用するテーブルとの JOIN 式を含むクエリにおけるフィルタの書き換え処理を修正しました。 [#82092](https://github.com/ClickHouse/ClickHouse/issues/82092) を修正。 [#82950](https://github.com/ClickHouse/ClickHouse/pull/82950) ([Dmitry Novik](https://github.com/novikd))。
* QueryMetricLog における「Mutex cannot be NULL」という LOGICAL&#95;ERROR を修正。[#82979](https://github.com/ClickHouse/ClickHouse/pull/82979)（[Pablo Marcos](https://github.com/pamarcos)）。
* フォーマッタ `%f` を可変長のフォーマッタ（例：`%M`）と併用した場合に、関数 `formatDateTime` が誤った出力を返していた問題を修正しました。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* analyzer を有効にした状態で、セカンダリクエリが常に VIEW からすべてのカラムを読み取ってしまうことによるパフォーマンス低下を修正しました。 [#81718](https://github.com/ClickHouse/ClickHouse/issues/81718) を修正。 [#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 読み取り専用ディスク上でバックアップを復元する際に表示される誤解を招くエラーメッセージを修正。 [#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva)).
* 依存関係を持たない `CREATE TABLE` については、循環依存関係のチェックを行わないようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) で導入され、数千のテーブルを作成するユースケースで発生していたパフォーマンス低下が解消されます。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* Time 型の負の値がテーブルに暗黙的に読み込まれてしまう問題を修正し、ドキュメントを分かりやすくしました。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `lowCardinalityKeys` 関数で、共有辞書の無関係な部分が使用されないようにしました。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Materialized View におけるサブカラムの使用に関するリグレッションを修正しました。これにより、次の問題が修正されます: [#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 失敗した `INSERT` の後に接続が切断状態のまま残り、クライアントがクラッシュする問題を修正。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 空のカラムを含むブロックのサイズを計算する際に発生するクラッシュを修正。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano))。
* UNION における Variant 型でクラッシュが発生する可能性があった問題を修正。 [#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar)).
* 未サポートの SYSTEM クエリに対して clickhouse-local で発生していた LOGICAL&#95;ERROR を修正。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* S3 クライアント用の `no_sign_request` を修正しました。これにより、S3 リクエストに署名しないよう明示的に指定できます。エンドポイントベースの設定を使用して、特定のエンドポイントごとに定義することもできます。 [#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368)).
* CPU スケジューリングが有効な状態で高負荷時に実行された、設定 &#39;max&#95;threads=1&#39; が有効なクエリでクラッシュが発生する可能性がある問題を修正しました。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum))。
* CTE 定義が同名の別のテーブル式を参照している場合に発生する `TOO_DEEP_SUBQUERIES` 例外を修正。[#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd))。
* `REVOKE S3 ON system.*` を実行すると `*.*` に対する S3 権限まで取り消されてしまう不具合を修正しました。この修正により [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417) が解決されました。 [#83420](https://github.com/ClickHouse/ClickHouse/pull/83420) ([pufit](https://github.com/pufit))。
* クエリ間で async&#95;read&#95;counters を共有しないようにしました。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat)).
* サブクエリに FINAL が含まれている場合は、parallel replicas を無効化するようにしました。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi))。
* 設定 `role_cache_expiration_time_seconds` の構成時に発生していた軽微な整数オーバーフローを解消しました（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) で導入されたバグを修正しました。definer を持つ MV への挿入時には、権限チェックで definer に付与された権限を使用する必要があります。これにより [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951) が修正されます。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* Iceberg の配列要素および map 値と、それらのすべてのネストされたサブフィールドに対する境界値に基づくファイルプルーニングを無効化しました。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik)).
* 一時データの保存先として使用する場合に発生する可能性のある、ファイルキャッシュ未初期化エラーを修正しました。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper の修正: セッション終了時に一時ノードが削除された際、合計ウォッチ数が正しく更新されるように修正。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* max&#95;untracked&#95;memory に関する誤ったメモリ処理を修正。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat))。
* `INSERT SELECT` と `UNION ALL` を組み合わせた場合、ある特殊なケースで NULL ポインタの逆参照が発生する可能性がありました。この修正により [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618) がクローズされました。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 論理エラーを引き起こす可能性があるため、`max_insert_block_size` に 0 を設定できないようにしました。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* block&#95;size&#95;bytes=0 のときに estimateCompressionRatio() で発生する無限ループを修正。 [#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat)).
* `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` メトリクスを修正（以前は `Cache` プレフィックスなしのメトリクスに含めて集計されていた）。 [#83730](https://github.com/ClickHouse/ClickHouse/pull/83730) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundSchedulePool` のシャットダウン時に、（タスクからスレッドを join することによる）異常終了が発生する可能性と、（ユニットテスト内での）ハングアップの可能性を修正しました。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat)).
* 名前の競合が発生する場合に、新しいアナライザーが WITH 句内で外側のエイリアスを参照できるようにする後方互換性設定を導入。 [#82700](https://github.com/ClickHouse/ClickHouse/issues/82700) を修正。 [#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* ライブラリブリッジのクリーンアップ中に発生するコンテキストの再帰的ロックが原因で、シャットダウン時に発生していたデッドロックを修正。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### ビルド/テスト/パッケージングの改善

- ClickHouse字句解析器用の最小限のCライブラリ(10 KB)を構築しました。これは[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977)に必要なものです。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。スタンドアロン字句解析器のテストを追加し、テストタグ`fasttest-only`を追加しました。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
- Nixサブモジュール入力のチェックを追加しました。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- localhost上で統合テストを実行する際に発生する可能性のある一連の問題を修正しました。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135) ([Oleg Doronin](https://github.com/dorooleg))。
- MacおよびFreeBSD上でSymbolIndexをコンパイルしました。(ただし、ELFシステム、LinuxおよびFreeBSD上でのみ動作します)。[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Azure SDKをv1.15.0にアップグレードしました。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
- google-cloud-cppのストレージモジュールをビルドシステムに追加しました。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881) ([Pablo Marcos](https://github.com/pamarcos))。
- clickhouse-server用の`Dockerfile.ubuntu`をDocker Official Libraryの要件に適合するように変更しました。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- [#83158](https://github.com/ClickHouse/ClickHouse/issues/83158)のフォローアップで、`curl clickhouse.com`へのビルドのアップロードを修正しました。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- `clickhouse/clickhouse-server`および公式`clickhouse`イメージに`busybox`バイナリとインストールツールを追加しました。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- ClickHouseサーバーホストを指定するための`CLICKHOUSE_HOST`環境変数のサポートを追加しました。これは既存の`CLICKHOUSE_USER`および`CLICKHOUSE_PASSWORD`環境変数と整合性を持たせたものです。これにより、クライアントや設定ファイルを直接変更することなく、より簡単に設定できるようになります。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659) ([Doron David](https://github.com/dorki))。

### ClickHouseリリース25.6、2025-06-26 {#256}

#### 後方互換性のない変更

- 以前は、関数`countMatches`はパターンが空のマッチを受け入れる場合でも、最初の空のマッチでカウントを停止していました。この問題を解決するため、`countMatches`は空のマッチが発生した場合に1文字進めることで実行を継続するようになりました。古い動作を維持したいユーザーは、設定`count_matches_stop_at_empty_match`を有効にすることができます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov))。
- 軽微な変更: サーバー設定`backup_threads`および`restore_threads`を非ゼロに強制しました。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano))。
- 軽微な変更: `String`に対する`bitNot`の修正により、内部メモリ表現でゼロ終端文字列を返すようになります。これはユーザーに見える動作には影響しないはずですが、作成者はこの変更を強調したいと考えました。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat))。


#### 新機能

* 新しいデータ型: `Time` ([H]HH:MM:SS) と `Time64` ([H]HH:MM:SS[.fractional])、および他のデータ型との相互変換用のいくつかの基本的なキャスト関数と関数を追加しました。既存の関数 `toTime` との互換性のための設定を追加しました。設定 `use_legacy_to_time` は、当面は従来の動作を維持するように設定されています。[#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。Time/Time64 型間の比較をサポートしました。[#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しい CLI ツール [`chdig`](https://github.com/azat/chdig/) が追加されました。これは ClickHouse 用の `top` ライクな TUI インターフェイスで、ClickHouse の一部として提供されます。 [#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* `Atomic` および `Ordinary` データベースエンジンで `disk` 設定をサポートし、テーブルのメタデータファイルを保存するディスクを指定できるようにしました。 [#80546](https://github.com/ClickHouse/ClickHouse/pull/80546) ([Tuan Pham Anh](https://github.com/tuanpach))。これにより、外部ソース上のデータベースをアタッチできるようになります。
* 新しいタイプの MergeTree、`CoalescingMergeTree` — このエンジンはバックグラウンドマージ時に最初の非 Null 値を取得します。これにより [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869) がクローズされました。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* WKB を読み取るための関数をサポートします（&quot;Well-Known Binary&quot; は、GISアプリケーションで使用される、さまざまなジオメトリ型をバイナリでエンコードするための形式です）。[#43941](https://github.com/ClickHouse/ClickHouse/issues/43941) を参照してください。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* ワークロード向けにクエリスロットのスケジューリング機能を追加しました。詳細については [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling) を参照してください。 [#78415](https://github.com/ClickHouse/ClickHouse/pull/78415) ([Sergei Trifonov](https://github.com/serxa)).
* `timeSeries*` ヘルパー関数は、時系列データを扱う際のいくつかの処理を高速化するためのものです：- 指定した開始タイムスタンプ、終了タイムスタンプ、およびステップに従って時間グリッドへデータを再サンプリング - PromQL に類似した `delta`、`rate`、`idelta`、`irate` を計算。[#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger)).
* `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 関数を追加し、マップの値に対するフィルタリングを可能にするとともに、Bloom filter ベースのインデックスでのサポートを追加しました。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus)).
* 設定制約で、禁止する値の集合を指定できるようになりました。 [#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc))。
* 設定 `enable_shared_storage_snapshot_in_query` を追加し、1 つのクエリ内のすべてのサブクエリで同じストレージスナップショットを共有できるようにしました。これにより、クエリ内で同じテーブルが複数回参照される場合でも、そのテーブルからの読み取りの一貫性が保たれます。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird)).
* `JSON` カラムの `Parquet` への書き込みと、`Parquet` からの `JSON` カラムの直接読み込みをサポートしました。 [#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `pointInPolygon` に `MultiPolygon` サポートを追加。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* `deltaLakeLocal` テーブル関数を使用して、ローカルファイルシステムにマウントされた Delta テーブルをクエリできるようにする機能を追加。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* String からのキャスト時に DateTime の解析モードを選択できる新しい設定 `cast_string_to_date_time_mode` を追加しました。[#80210](https://github.com/ClickHouse/ClickHouse/pull/80210)（[Pavel Kruglov](https://github.com/Avogar)）。例えば、ベストエフォートモードに設定できます。
* Bitcoin の Bech アルゴリズム用の `bech32Encode` および `bech32Decode` 関数を追加しました（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* MergeTree パーツ名を解析するための SQL 関数を追加しました。 [#80573](https://github.com/ClickHouse/ClickHouse/pull/80573)（[Mikhail Artemenko](https://github.com/Michicosun)）。
* クエリで選択されたパーツを、それらが配置されているディスクでフィルタリングできるよう、新しい仮想カラム `_disk_name` を導入しました。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 埋め込み Web ツールの一覧を表示するランディングページを追加しました。これはブラウザーのようなユーザーエージェントからリクエストされたときに開きます。 [#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 関数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` および `arrayLastIndex` は、フィルター式によって返される NULL 値を除外します。以前のバージョンでは、Nullable 型のフィルター結果はサポートされていませんでした。[#81113](https://github.com/ClickHouse/ClickHouse/issues/81113) が修正されました。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* `USE name` の代わりに `USE DATABASE name` と書けるようになりました。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 利用可能なコーデックを確認するための新しいシステムテーブル `system.codecs` を追加しました。(issue [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)). [#81600](https://github.com/ClickHouse/ClickHouse/pull/81600) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* `lag` および `lead` ウィンドウ関数をサポートしました。[#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) をクローズしました。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108) ([Dmitry Novik](https://github.com/novikd))。
* 関数 `tokens` が、ログに適した新しいトークナイザー `split` をサポートするようになりました。 [#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-local` で `--database` 引数をサポートしました。これにより、既に作成済みのデータベースに切り替えられるようになりました。これにより [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115) がクローズされました。 [#81465](https://github.com/ClickHouse/ClickHouse/pull/81465)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。



#### 実験的機能
* ClickHouse Keeper を用いて、`Kafka2` に Kafka のリバランスに類似したロジックを実装しました。各レプリカについて、パーティションロックには永続ロックと一時ロックの 2 種類をサポートします。レプリカは可能な限り永続ロックを保持しようとし、任意の時点でレプリカ上の永続ロックは `all_topic_partitions / active_replicas_count`（ここで `all_topic_partitions` は全パーティション数、`active_replicas_count` はアクティブなレプリカ数）を超えません。これを超えた場合、レプリカはいくつかのパーティションを解放します。一部のパーティションはレプリカによって一時的に保持されます。レプリカ上の一時ロックの最大数は動的に変化し、他のレプリカが一部のパーティションを永続ロックとして取得できるようにします。一時ロックを更新する際、レプリカはいったんそれらをすべて解放し、別のパーティションを再度取得しようとします。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 実験的なテキストインデックスの改善として、キーと値のペアによる明示的なパラメータ指定をサポートしました。現在サポートされているパラメータは、必須の `tokenizer` と、オプションの `max_rows_per_postings_list` および `ngram_size` の 2 つです。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* これまで、`packed` ストレージは全文テキストインデックスでサポートされていませんでした。これは、セグメント ID がディスク上の (`.gin_sid`) ファイルの読み書きによってオンザフライで更新されていたためです。`packed` ストレージの場合、未コミットのファイルから値を読み取ることはサポートされておらず、このことが問題につながっていました。現在は問題ありません。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* `gin` 型の実験的インデックス（PostgreSQL のハッカーたちの内輪ネタなので私は好きではありません）は、`text` に名称変更されました。既存の `gin` 型インデックスは引き続きロード可能ですが、検索で使用しようとした際には例外をスローし（代わりに `text` インデックスを提案します）、使用できなくなります。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。



#### パフォーマンスの向上

* 複数プロジェクションでのフィルタリングをサポートし、パートレベルのフィルタリングに複数のプロジェクションを使用できるようにしました。これにより [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525) が解決されます。これは、[#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) に続く、プロジェクションインデックスを実装するための第 2 段階です。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* ファイルシステムキャッシュで `SLRU` キャッシュポリシーをデフォルトで使用するようにしました。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii)).
* クエリパイプラインのResizeステップでの競合を解消。[#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* ブロックの(非)圧縮および(非)シリアライズ処理を、ネットワーク接続に紐づく単一スレッドではなくパイプラインスレッドにオフロードできるオプションを導入しました。これは設定 `enable_parallel_blocks_marshalling` で制御されます。イニシエータとリモートノード間で大量のデータを転送する分散クエリの高速化が見込めます。[#78694](https://github.com/ClickHouse/ClickHouse/pull/78694)（[Nikita Taranov](https://github.com/nickitat)）。
* すべてのブルームフィルタータイプで性能を向上。[OpenHouse カンファレンスの動画](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800) ([Delyan Kratunov](https://github.com/dkratunov))。
* `UniqExactSet::merge` において、一方の集合が空の場合のハッピーパス処理を導入しました。さらに、LHS の集合が 2 レベルで RHS が 1 レベルの場合には、RHS を 2 レベルに変換しないようにしました。 [#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat)).
* 2 レベルハッシュテーブル使用時のメモリ再利用効率を改善し、ページフォールトを削減しました。これにより `GROUP BY` の高速化を図りました。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* クエリ条件キャッシュにおいて不要な更新を回避し、ロック競合を削減しました。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* `concatenateBlocks` に対する些細な最適化です。並列ハッシュ結合にも有効である可能性があります。 [#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 主キー範囲からマーク範囲を選択する際、主キーが関数でラップされている場合は二分探索を使用できませんでした。このPRにより、この制約が緩和されます。主キーが常に単調な関数チェーンでラップされている場合、または RPN に常に真となる要素が含まれている場合でも、二分探索を適用できるようになります。[#45536](https://github.com/ClickHouse/ClickHouse/issues/45536) をクローズします。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* `Kafka` エンジンのシャットダウン速度を改善しました（複数の `Kafka` テーブルが存在する場合に発生していた余分な 3 秒の遅延を解消）。[#80796](https://github.com/ClickHouse/ClickHouse/pull/80796)（[Azat Khuzhin](https://github.com/azat)）。
* 非同期挿入: INSERT クエリのメモリ使用量を削減し、パフォーマンスを向上。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* ログテーブルが無効になっている場合はプロセッサのプロファイリングを行わないようにした。[#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。これにより、非常に短いクエリの実行が高速化されます。
* ソースが要求されたものと完全に一致する場合に `toFixedString` を高速化しました。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* 制限のないユーザーについてはクォータ値を処理しないようにしました。 [#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。これにより、ごく短いクエリの実行が高速化されます。
* メモリトラッキングにおける性能低下の問題を修正しました。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおけるシャーディングキーの最適化を改良しました。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* Parallel replicas: すべての読み取りタスクが他のレプリカに割り当てられている場合、未使用で低速なレプリカを待機しないようにしました。 [#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* Parallel replicas は独立した接続タイムアウトを使用します。`parallel_replicas_connect_timeout_ms` 設定を参照してください。以前は、`connect_timeout_with_failover_ms` / `connect_timeout_with_failover_secure_ms` 設定が parallel replicas クエリの接続タイムアウト値として使用されていました（デフォルトは 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421) ([Igor Nikonov](https://github.com/devcrafter))。
* ジャーナル機能を持つファイルシステムでは、`mkdir` はディスクに永続化されるファイルシステムのジャーナルに書き込まれます。ディスクが遅い場合、これには長時間かかることがあります。これをリザーブロックのロックスコープ外に移動しました。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg のマニフェストファイルは、最初の読み取りクエリが実行されるまで読み込まないようにしました。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik))。
* 適用可能な場合、`GLOBAL [NOT] IN` 述語を `PREWHERE` 句に移動できるようにしました。 [#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa)).





#### 改善

* `EXPLAIN SYNTAX` は新しいアナライザーを使用するようになりました。クエリツリーから構築した AST を返します。クエリツリーを AST に変換する前に実行されるパスの回数を制御するためのオプション `query_tree_passes` を追加しました。 [#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Dynamic と JSON 向けに、フラット化されたシリアル化方式を Native フォーマットに実装しました。これにより、Dynamic の shared variant や JSON の shared data といった特殊な構造を用いずに、Dynamic および JSON データをシリアル化／デシリアル化できるようになります。この方式は、`output_format_native_use_flattened_dynamic_and_json_serialization` を設定することで有効化できます。また、さまざまな言語で実装されたクライアントにおいて、TCP プロトコル経由での Dynamic および JSON のサポートを容易にするためにも利用できます。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499) ([Pavel Kruglov](https://github.com/Avogar))。
* エラー `AuthenticationRequired` 発生後に `S3` 認証情報をリフレッシュするようにしました。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.asynchronous_metrics` に辞書関連のメトリクスを追加しました - `DictionaryMaxUpdateDelay` - 辞書更新の最大遅延時間（秒）。 - `DictionaryTotalFailedUpdates` - 直近の正常なロード以降、すべての辞書で発生したエラーの回数。 [#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse)).
* 破損したテーブルを保存するために作成された可能性のあるデータベースに関する警告を追加しました。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `S3Queue`、`AzureQueue` エンジンに `_time` 仮想列を追加。[#78926](https://github.com/ClickHouse/ClickHouse/pull/78926)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* CPU 過負荷時の接続ドロップを制御する設定をホットリロード可能にしました。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* Azure Blob Storage 上のプレーンディスクについて、`system.tables` に出力されるデータパスにコンテナプレフィックスを追加し、S3 および GCP と報告内容の一貫性を持たせました。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* 現在、clickhouse-client と local では、クエリパラメータとして `param_<name>`（アンダースコア）に加え、`param-<name>`（ダッシュ）形式も受け付けます。これにより [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093) が解決されました。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* ローカルからリモート S3 へ、チェックサムを有効にしてデータをコピーする場合の帯域幅割引について、より詳細な警告メッセージを追加。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu)).
* 以前は、`input_format_parquet_max_block_size = 0`（無効な値）の場合、ClickHouse がハングしてしまう問題がありましたが、現在は修正されています。これにより [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394) が解決されました。 [#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* `startup_scripts` に `throw_on_error` 設定を追加しました。`throw_on_error` が true の場合、すべてのクエリが正常に完了しない限り、サーバーは起動しません。デフォルトでは `throw_on_error` は false であり、これまでの挙動が維持されます。 [#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* あらゆる種類の `http_handlers` で `http_response_headers` を追加できるようにしました。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 関数 `reverse` が `Tuple` データ型をサポートするようになりました。[#80053](https://github.com/ClickHouse/ClickHouse/issues/80053) をクローズしました。[#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817) を解決し、`system.zookeeper` テーブルから `auxiliary_zookeepers` データを取得できるようにしました。 [#80146](https://github.com/ClickHouse/ClickHouse/pull/80146) ([Nikolay Govorov](https://github.com/mrdimidium))。
* サーバーの TCP ソケットに関する非同期メトリクスを追加しました。これによりオブザーバビリティが向上します。[#80187](https://github.com/ClickHouse/ClickHouse/issues/80187) をクローズします。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `anyLast_respect_nulls` と `any_respect_nulls` を `SimpleAggregateFunction` としてサポートしました。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein)).
* レプリケートされたデータベースに対する不要な `adjustCreateQueryForBackup` の呼び出しを削除しました。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-local` において、`-- --config.value='abc'` のように `--` の後ろに続く追加オプションを、等号（=）なしでも指定できるようにしました。 [#80292](https://github.com/ClickHouse/ClickHouse/issues/80292) をクローズ。 [#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SHOW ... LIKE` クエリ内のメタ文字をハイライトするようにしました。これにより、[#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) がクローズされました。 [#80297](https://github.com/ClickHouse/ClickHouse/pull/80297) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `clickhouse-local` で SQL UDF の永続化をサポートしました。以前に作成した関数は、起動時に自動的に読み込まれます。これにより [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085) がクローズされました。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `EXPLAIN` プラン内の `preliminary DISTINCT` ステップの説明を修正。[#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus)).
* ODBC/JDBC で named collection を使用可能にしました。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 読み取り専用ディスクおよび破損ディスクの数に関するメトリクス。DiskLocalCheckThread の起動時に指標をログ出力します。 [#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu)).
* `s3_plain_rewritable` ストレージでプロジェクションをサポートしました。以前のバージョンでは、移動された際にプロジェクションを参照する S3 内のメタデータオブジェクトが更新されていませんでした。[#70258](https://github.com/ClickHouse/ClickHouse/issues/70258) をクローズ。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` コマンドは、読み取り専用ディスクおよび一度だけ書き込み可能なディスク上のパーツを検索しようとしなくなりました。これにより [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430) が解決されました。 [#80432](https://github.com/ClickHouse/ClickHouse/pull/80432)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* マージ済みパーツに関するメッセージのログレベルを下げました。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* Iceberg テーブルに対するパーティションプルーニングのデフォルト動作を変更しました。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator))。
* インデックス検索アルゴリズムの可観測性向上のために、2 つの新しい ProfileEvents `IndexBinarySearchAlgorithm` と `IndexGenericExclusionSearchAlgorithm` を追加しました。 [#80679](https://github.com/ClickHouse/ClickHouse/pull/80679) ([Pablo Marcos](https://github.com/pamarcos))。
* 古いカーネルで `MADV_POPULATE_WRITE` がサポートされていない場合については、ログに出力しないようにしました（ログ汚染を防ぐため）。 [#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* `TTL` 式で `Date32` および `DateTime64` がサポートされました。 [#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand)).
* `max_merge_delayed_streams_for_parallel_write` の互換性に関する値を調整しました。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* クラッシュの修正: デストラクタ内で一時ファイル（ディスク上に一時データをスピルするために使用される）を削除しようとした際に例外がスローされると、プログラムが異常終了してしまう可能性がある問題を修正。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SYSTEM SYNC REPLICA` に `IF EXISTS` 修飾子を追加。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* 「Having zero bytes, but read range is not finished...」という例外メッセージを拡張し、`system.filesystem_cache` に finished&#95;download&#95;time カラムを追加しました。 [#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `EXPLAIN` を `indexes = 1` の設定で使用している場合、出力に検索アルゴリズムのセクションを追加しました。ここには &quot;binary search&quot; または &quot;generic exclusion search&quot; のいずれかが表示されます。 [#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos)).
* 2024年の初めに、新しいアナライザーがデフォルトで有効になっていなかったため、MySQL ハンドラに対して `prefer_column_name_to_alias` が true に固定されていました。現在は、その固定を解除できるようになりました。[#80916](https://github.com/ClickHouse/ClickHouse/pull/80916)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* `system.iceberg_history` が、Glue や Iceberg REST などのカタログデータベースの履歴も表示するようになりました。また、一貫性のために、`system.iceberg_history` 内の `table_name` および `database_name` 列の名前を、それぞれ `table` および `database` に変更しました。[#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin))。
* `merge` テーブル関数で読み取り専用モードをサポートし、それを使用する際に `CREATE TEMPORARY TABLE` の付与（GRANT）が不要になるようにしました。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* インメモリキャッシュの可観測性を改善しました（不完全な `system.asynchronouse_metrics` ではなく、`system.metrics` でキャッシュに関する情報を公開するようにしました）。インメモリキャッシュのサイズ（バイト単位）を `dashboard.html` に追加しました。`VectorSimilarityIndexCacheSize`/`IcebergMetadataFilesCacheSize` は `VectorSimilarityIndexCacheBytes`/`IcebergMetadataFilesCacheBytes` に名称変更されました。 [#81023](https://github.com/ClickHouse/ClickHouse/pull/81023) ([Azat Khuzhin](https://github.com/azat)).
* `system.rocksdb` からの読み取り時に、`RocksDB` テーブルを格納できないエンジンを持つデータベースを無視するようにしました。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-local` の設定ファイルで `filesystem_caches` と `named_collections` を使用できるようにしました。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `INSERT` クエリにおける `PARTITION BY` の構文ハイライトを修正。以前のバージョンでは、`PARTITION BY` はキーワードとしてハイライトされていませんでした。 [#81106](https://github.com/ClickHouse/ClickHouse/pull/81106) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI における 2 つの小規模な改善: - 正しく出力を伴わないクエリ（`CREATE`、`INSERT` のような）を処理する（つい最近まで、これらのクエリはスピナーが回り続ける状態になっていた）； - テーブルをダブルクリックした際に、先頭までスクロールするように変更。 [#81131](https://github.com/ClickHouse/ClickHouse/pull/81131) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `MemoryResidentWithoutPageCache` メトリクスは、ユーザー空間のページキャッシュを除いたサーバープロセスの物理メモリ使用量を、バイト単位で表します。これは、ユーザー空間のページキャッシュが利用されている場合に、実際のメモリ使用量をより正確に把握するのに役立ちます。ユーザー空間のページキャッシュが無効になっている場合、この値は `MemoryResident` と等しくなります。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* クライアント、ローカルサーバー、Keeper クライアント、および disks アプリで手動で記録された例外を、二重にログ出力されないように記録済みとしてマークするようにしました。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` と `use_skip_indexes_if_final_exact_mode` のデフォルト値が `True` になりました。`FINAL` 句を含むクエリでは、（該当する場合）スキップインデックスを使用してグラニュールの候補を絞り込み、一致する主キー範囲に対応する追加のグラニュールも読み取るようになりました。近似的／不正確な結果となっていた従来の挙動が必要なユーザーは、十分に検討したうえで `use_skip_indexes_if_final_exact_mode` を `FALSE` に設定できます。[#81331](https://github.com/ClickHouse/ClickHouse/pull/81331)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* Web UI で複数のクエリを開いている場合は、カーソル位置にあるクエリが実行されます。[#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) の続きです。[#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* このPRは、変換関数に対する単調性チェックにおける `is_strict` の実装上の問題に対処するものです。現在、一部の変換関数（`toFloat64(UInt32)` や `toDate(UInt8)` など）は、本来は true を返すべきところで、誤って `is_strict` を false として返しています。 [#81359](https://github.com/ClickHouse/ClickHouse/pull/81359) ([zoomxi](https://github.com/zoomxi))。
* `KeyCondition` が連続した範囲と一致するかをチェックする際、キーが非厳密な関数チェーンで包まれている場合には、`Constraint::POINT` を `Constraint::RANGE` に変換する必要が生じることがあります。たとえば、`toDate(event_time) = '2025-06-03'` は、`event_time` に対して [`2025-06-03 00:00:00`, `2025-06-04 00:00:00`) という範囲を意味します。この PR により、この挙動が修正されました。[#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi))。
* `--host` または `--port` が指定された場合、`clickhouse` / `ch` エイリアスは `clickhouse-local` ではなく `clickhouse-client` を呼び出します。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) の継続対応。[#65252](https://github.com/ClickHouse/ClickHouse/issues/65252) をクローズ。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* keeper の応答時間分布データが得られたので、メトリクス用のヒストグラムバケットを調整できるようになりました。 [#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* プロファイルイベント `PageCacheReadBytes` を追加。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ファイルシステムキャッシュにおける「Having zero bytes but range is not finished」という論理エラーを修正。[#81868](https://github.com/ClickHouse/ClickHouse/pull/81868)（[Kseniia Sumarokova](https://github.com/kssenii)）。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* `SELECT EXCEPT` クエリを使用するパラメーター化ビューを修正。[#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) をクローズ。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer: JOIN における列型の昇格後に列プロジェクション名を修正。[#63345](https://github.com/ClickHouse/ClickHouse/issues/63345) をクローズ。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519)（[Dmitry Novik](https://github.com/novikd)）。
* analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier が有効な場合に、カラム名が衝突する際に発生する論理エラーを修正しました。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `allow_push_predicate_ast_for_distributed_subqueries` が有効な場合に、プッシュダウンされた述語における CTE の扱いを修正。[#75647](https://github.com/ClickHouse/ClickHouse/issues/75647) を修正。[#79672](https://github.com/ClickHouse/ClickHouse/issues/79672) を修正。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* `SYSTEM SYNC REPLICA LIGHTWEIGHT &#39;foo&#39;` において、指定したレプリカが存在しない場合でも成功したと報告してしまう不具合を修正しました。このコマンドは、同期を試みる前に Keeper 内にそのレプリカが存在するかを正しく検証するようになりました。 [#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd)).
* `ON CLUSTER` クエリの `CONSTRAINT` セクション内で `currentDatabase` 関数が使用されているごく限定的な条件下で発生するクラッシュを修正しました。[#78100](https://github.com/ClickHouse/ClickHouse/issues/78100) をクローズしました。[#79070](https://github.com/ClickHouse/ClickHouse/pull/79070)（[pufit](https://github.com/pufit)）。
* サーバー間クエリにおける external roles の受け渡しを修正しました。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand))。
* SingleValueDataGeneric では Field の代わりに IColumn を使用するようにしてください。これにより、`Dynamic/Variant/JSON` 型に対する `argMax` など、一部の集約関数で誤った戻り値が返される問題が修正されます。[#79166](https://github.com/ClickHouse/ClickHouse/pull/79166) ([Pavel Kruglov](https://github.com/Avogar))。
* use&#95;native&#95;copy の適用を修正し、Azure Blob Storage 向けに allow&#95;azure&#95;native&#95;copy 設定を有効化するとともに、認証情報が一致する場合にのみネイティブコピーを使用するよう更新しました。これにより [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964) が解決されました。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 列が相関列であるかをチェックする際に、列の由来スコープが不明な場合に発生していた論理エラーを修正しました。[#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) を修正。[#79451](https://github.com/ClickHouse/ClickHouse/issues/79451) を修正。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* ColumnConst と Analyzer を使用した grouping sets で誤った結果が返る問題を修正しました。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* ローカルレプリカが古くなっている場合にDistributedテーブルから読み込むと発生する、ローカルシャードの結果が重複する問題を修正。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 負の符号ビットを持つ NaN の並び順を修正しました。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `GROUP BY ALL` は `GROUPING` 句を考慮しなくなりました。 [#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 容量が使い切られていない場合でも過度に大きな誤差を生じさせていた `TopK` / `TopKWeighted` 関数の誤った状態マージ処理を修正しました。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* `azure_blob_storage` オブジェクトストレージで `readonly` 設定が正しく反映されるようにしました。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* バックスラッシュでエスケープされた文字を含む `match(column, '^…')` の使用時に発生していた、クエリ結果の誤りとメモリ不足によるクラッシュを修正しました。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* データレイクの Hive パーティショニングを無効化。 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937) に部分的に対応。 [#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* ラムダ式を含むスキップインデックスが適用できない問題を修正しました。インデックス定義内の高レベル関数がクエリ内のものと完全に一致する場合にも正しく適用されるようにしました。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* レプリカ上でレプリケーションログから `ATTACH_PART` コマンドを実行してパーツをアタッチする際に、メタデータのバージョンが正しく設定されない問題を修正しました。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* Executable User Defined Functions (eUDF) の名前は、他の関数とは異なり、`system.query_log` テーブルの `used_functions` 列に追加されません。この PR では、リクエストで eUDF が使用された場合に、その eUDF 名を追加するようにしました。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush)).
* Arrow フォーマットにおける LowCardinality(FixedString) の論理エラーを修正。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar)).
* Merge エンジンにおけるサブカラム読み取りを修正。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* `KeyCondition` における数値型間の比較に関するバグを修正。 [#80207](https://github.com/ClickHouse/ClickHouse/pull/80207) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* lazy materialization がプロジェクションを持つテーブルに適用された場合に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 暗黙的プロジェクションを使用する場合に、LIKE &#39;ab&#95;c%&#39; のような文字列プレフィックスを用いたフィルタに対する `count` の不正な最適化を修正しました。これにより [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250) が修正されます。 [#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* MongoDB ドキュメント内のネストされた数値フィールドが文字列として不適切にシリアル化されていた問題を修正しました。MongoDB からのドキュメントに対する最大深さの制限を削除しました。 [#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* Replicated データベースにおいて RMT に対するメタデータチェックを、より緩和しました。 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296) をクローズします。 [#80298](https://github.com/ClickHouse/ClickHouse/pull/80298) ([Nikolay Degterinsky](https://github.com/evillique))。
* PostgreSQL ストレージ向けの DateTime および DateTime64 のテキスト表現を修正しました。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `StripeLog` テーブルでタイムゾーン付きの `DateTime` を使用できるようにしました。これにより [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120) が解決されました。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリプランのステップが行数を変更する場合には、非決定的関数を含む述語へのフィルタープッシュダウンの適用を無効化しました。 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273) を修正。 [#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* サブカラムを含むプロジェクションで発生し得る論理エラーおよびクラッシュを修正。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* `ON` 式が単純な等値条件ではない場合に、論理 JOIN ステップのフィルタープッシュダウンの最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正します。[#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) および [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848) を修正します。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* パーティション分割されたテーブルで、キーを逆順で読み取る際に誤った結果が返される問題を修正しました。これにより、[#79987](https://github.com/ClickHouse/ClickHouse/issues/79987) の問題が解決されます。 [#80448](https://github.com/ClickHouse/ClickHouse/pull/80448) ([Amos Bird](https://github.com/amosbird))。
* NULL を許容するキーを持つテーブルで、`optimize_read_in_order` が有効な場合に発生していた誤ったソートを修正しました。 [#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `SYSTEM STOP REPLICATED VIEW` によってビューが一時停止されている場合に、リフレッシュ可能なマテリアライズドビューの `DROP` がハングしてしまう問題を修正しました。 [#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリで定数タプルを使用した場合に発生する「Cannot find column」エラーを修正。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `join_use_nulls` を使用する Distributed テーブルにおける `shardNum` 関数を修正しました。[#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* Merge エンジンにおいて、テーブル群の一部にのみ存在する列を読み取る際に誤った結果が返される問題を修正。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* replxx のハングが原因で発生し得る SSH プロトコルの問題を修正。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` テーブル内のタイムスタンプは、現在は正しくなっているはずです。 [#80711](https://github.com/ClickHouse/ClickHouse/pull/80711) ([Melvyn Peignon](https://github.com/melvynator)).
* 辞書の登録に失敗した場合に発生し得るクラッシュを修正（`CREATE DICTIONARY` が `CANNOT_SCHEDULE_TASK` で失敗した際、辞書レジストリ内にダングリングポインタが残ってしまう可能性があり、その後クラッシュにつながる問題を修正）。[#80714](https://github.com/ClickHouse/ClickHouse/pull/80714)（[Azat Khuzhin](https://github.com/azat)）。
* オブジェクトストレージのテーブル関数における、要素が 1 つだけの enum グロブの扱いを修正しました。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Tuple(Dynamic) と String の比較関数において、論理エラーの原因となっていた誤った結果型を修正しました。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* Unity Catalog 向けに未サポートだったデータ型 `timestamp_ntz` を追加。[#79535](https://github.com/ClickHouse/ClickHouse/issues/79535)、[#79875](https://github.com/ClickHouse/ClickHouse/issues/79875) を修正。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* `IN cte` を使用した分散クエリにおける `THERE_IS_NO_COLUMN` エラーを修正。[#75032](https://github.com/ClickHouse/ClickHouse/issues/75032) を解消。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 外部 `ORDER BY` においてファイル数が過剰になる問題（メモリ使用量が過剰になる原因）を修正。[#80777](https://github.com/ClickHouse/ClickHouse/pull/80777)（[Azat Khuzhin](https://github.com/azat)）。
* このPRにより [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742) がクローズされる可能性があります。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* Kafka において、`get&#95;member&#95;id()` が NULL から `std::string` を生成していたことに起因するクラッシュを修正しました（これはおそらく、ブローカーへの接続が失敗していた場合にのみ発生していた問題です）。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* Kafka エンジンをシャットダウンする前にコンシューマの完了を適切に待つようにしました（シャットダウン後もアクティブなコンシューマが残っていると、さまざまなデバッグアサーションがトリガーされる可能性があり、テーブルが削除/デタッチされた後もバックグラウンドでブローカーからデータを読み取ってしまう場合があります）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat)).
* `predicate-push-down` 最適化により発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正。[#80443](https://github.com/ClickHouse/ClickHouse/issues/80443) を解決。[#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* USING を伴う JOIN 内で、テーブル関数におけるアスタリスク（`*`）マッチャーの解決時に発生していた論理エラーを修正しました。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Iceberg メタデータファイルキャッシュのメモリ使用量の計上を修正。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* NULL を許容するパーティションキーにおける誤ったパーティショニングを修正。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* ソーステーブルがイニシエータ上に存在しない場合に、述語プッシュダウン（`allow_push_predicate_ast_for_distributed_subqueries=1`）を有効にした Distributed クエリで発生する `Table does not exist` エラーを修正しました。[#77281](https://github.com/ClickHouse/ClickHouse/issues/77281) を修正します。 [#80915](https://github.com/ClickHouse/ClickHouse/pull/80915) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 名前付きウィンドウを用いたネストされた関数における論理エラーを修正しました。 [#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* Nullable 列および浮動小数点列に対する extremes を修正。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* system.tables からのクエリ実行時に発生する可能性のあるクラッシュを修正（メモリ逼迫時に発生しやすい問題）。[#80976](https://github.com/ClickHouse/ClickHouse/pull/80976)（[Azat Khuzhin](https://github.com/azat)）。
* ファイル拡張子から圧縮方式が判別されるファイルに対して、`truncate` を伴うアトミックなリネーム処理を修正しました。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* ErrorCodes::getName の不具合を修正。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* ユーザーがすべてのテーブルに対する権限を持っていない場合に、Unity Catalog でテーブル一覧を取得できないバグを修正しました。これにより、すべてのテーブルが正しく一覧表示されるようになり、アクセス制限されたテーブルから読み取ろうとすると例外がスローされます。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin))。
* ClickHouse は `SHOW TABLES` クエリにおいて、データレイクカタログからのエラーや予期しない応答を無視するようになりました。 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725) を修正。 [#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* JSONExtract および JSON 型のパースで、整数値からの DateTime64 のパースを修正しました。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* `date_time_input_format` 設定を `schema_inference_cache` に反映するようにしました。 [#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリ開始後からカラム送信前までの間にテーブルが `DROP` された場合に、`INSERT` 文がクラッシュする不具合を修正しました。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* quantileDeterministic における未初期化値が使用される問題を修正。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* MetadataStorageFromDisk ディスクトランザクションにおけるハードリンク数の管理を修正し、テストを追加。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema))。
* 他の関数とは異なり、ユーザー定義関数 (UDF) の名前は `system.query_log` テーブルには追加されません。このPRでは、リクエストでUDFが使用された場合、そのUDF名を2つのカラム `used_executable_user_defined_functions` または `used_sql_user_defined_functions` のいずれかに追加するようにしました。 [#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush))。
* テキスト形式（`JSON`、`Values` など）を使用した HTTP プロトコル経由の挿入で、`Enum` フィールドを省略した場合に発生する `Too large size ... passed to allocator` エラーやクラッシュが起きる可能性のある問題を修正しました。 [#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* Sparse カラムを含む INSERT ブロックが non-MT マテリアライズドビューにプッシュされた場合に発生する LOGICAL&#95;ERROR を修正。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* cross-replication 環境で `distributed_product_mode_local=local` を使用した場合に発生する `Unknown table expression identifier` エラーを修正しました。 [#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* フィルタリング後に Parquet ファイル内の行数を誤ってキャッシュしていた不具合を修正しました。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321))。
* 相対キャッシュパス使用時の fs キャッシュ設定 `max_size_to_total_space` を修正。 [#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Parquet 形式で const タプルまたは const マップを出力する際に clickhouse-local がクラッシュしていた問題を修正しました。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* ネットワーク経由で受信した配列オフセットを検証するようにしました。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 空のテーブルを結合し、ウィンドウ関数を使用するクエリにおけるいくつかのコーナーケースを修正しました。このバグにより並列ストリーム数が爆発的に増加し、その結果 OOM が発生していました。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* datalake Cluster 関数（`deltaLakeCluster`、`icebergCluster` など）の修正：（1）旧アナライザーで `Cluster` 関数を使用した際の `DataLakeConfiguration` におけるセグメンテーションフォルト発生の可能性を修正；（2）重複していたデータレイクのメタデータ更新（余分なオブジェクトストレージリクエスト）を削除；（3）フォーマットが明示的に指定されていない場合のオブジェクトストレージでの不要なリスト処理を修正（非 Cluster データレイクエンジンではすでに対応済みのもの）。 [#81300](https://github.com/ClickHouse/ClickHouse/pull/81300) ([Kseniia Sumarokova](https://github.com/kssenii)).
* force&#95;restore&#95;data フラグによって失われた Keeper メタデータを復元できるようにしました。 [#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* delta-kernel におけるリージョンエラーを修正し、[#79914](https://github.com/ClickHouse/ClickHouse/issues/79914) を解決。[#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* divideOrNull に対する誤った JIT を無効化しました。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano)).
* MergeTree テーブルでパーティション列名が長い場合に発生していた挿入エラーを修正。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) でバックポート済み: マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性のあった不具合を修正しました。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat))。
* 複数のマニフェストファイルの内容を同時にメモリに保持しないようにしました。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik)).
* バックグラウンドプールのシャットダウン中に発生する可能性があったクラッシュを修正 (`background_.*pool_size`)。 [#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* `URL` エンジンでテーブルに書き込む際に発生していた `Npy` フォーマットでの範囲外読み取りを修正しました。これにより [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356) が解決されます。 [#81502](https://github.com/ClickHouse/ClickHouse/pull/81502) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI が `NaN%` を表示する可能性があります（典型的な JavaScript の問題によるものです）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_enforce_synchronous_settings=1` が有効な場合の `DatabaseReplicated` を修正しました。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* LowCardinality(Nullable(...)) 型のソート順序を修正。[#81583](https://github.com/ClickHouse/ClickHouse/pull/81583)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* サーバーは、ソケットからリクエストを完全に読み取っていない場合、HTTP 接続を維持しないようになりました。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* スカラー相関サブクエリが射影式の結果を `Nullable` 型で返すようにしました。相関サブクエリが空の結果セットを生成する場合の不具合を修正しました。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* `ATTACH` を `ReplicatedMergeTree` に対して実行した際に発生する `Unexpected relative path for a deduplicated part` エラーを修正しました。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* クエリ設定 `use_iceberg_partition_pruning` は、クエリコンテキストではなくグローバルコンテキストを使用しているため、Iceberg ストレージでは有効になりません。デフォルト値が true であるため致命的な問題ではありませんが、この PR で修正されます。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991))。
* [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) にバックポート: TTL 式で dict が使用されている場合のマージ処理中に発生する「Context has expired」を修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* MergeTree 設定 `merge_max_block_size` に対して、0 以外であることを検証するバリデーションを追加。[#81693](https://github.com/ClickHouse/ClickHouse/pull/81693)（[Bharat Nallan](https://github.com/bharatnc)）。
* `clickhouse-local` でハングする `DROP VIEW ` クエリに関する問題を修正。 [#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc))。
* いくつかのケースで発生する StorageRedis の JOIN の問題を修正。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* `ConcurrentHashJoin` において、空の `USING ()` を指定し旧アナライザーが有効になっている場合に発生するクラッシュを修正しました。[#81754](https://github.com/ClickHouse/ClickHouse/pull/81754)（[Nikita Taranov](https://github.com/nickitat)）。
* Keeper に関する修正: ログ内に無効なエントリが存在する場合、新しいログのコミットをブロックするようにしました。以前は、リーダーが一部のログを誤って適用しても、フォロワー側ではダイジェストの不一致を検出して処理を中断していたにもかかわらず、新しいログのコミットを継続していました。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* スカラー相関サブクエリの処理中に必要な列が読み込まれない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を解決。 [#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 誰かが私たちのコード中に Kusto を紛れ込ませていたので、整理しました。これにより [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643) がクローズされます。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して不要に多くのコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) がクローズされました。 [#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前は、`MongoDB` テーブルエンジンの定義で `host:port` 引数にパスコンポーネントを含めることができましたが、これは黙って無視されていました。mongodb 統合は、そのようなテーブルの読み込みを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルの読み込みを許可し、パスコンポーネントを無視します*。この場合、データベース名は引数から取得します。*注:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を用いたクエリに対しては適用されないほか、ディクショナリのソースおよび named collection にも適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* `arraySimilarity` におけるコピー＆ペーストの誤りを修正し、`UInt32` および `Int32` の重みの使用を禁止。テストとドキュメントを更新。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* サジェスト用スレッドとメインクライアントスレッド間で起こり得るデータレースを修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### ビルド/テスト/パッケージングの改善

* `postgres` 16.9 を使用。 [#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `openssl` 3.2.4 を使用するように変更。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `abseil-cpp` 2025-01-27 を使用するように変更。 [#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `mongo-c-driver` 1.30.4 を使用。 [#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `krb5` 1.21.3-final を使用します。 [#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `orc` 2.1.2 を使用します。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `grpc` 1.73.0 を使用するように変更。 [#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `delta-kernel-rs` v0.12.1 を使用。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `c-ares` を `v1.34.5` に更新。[#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* CVE-2025-5025 および CVE-2025-4947 に対処するため、`curl` をバージョン 8.14 にアップグレードしました。 [#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit))。
* `libarchive` を 3.7.9 にアップグレードし、次の脆弱性に対応しました: CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。 [#81174](https://github.com/ClickHouse/ClickHouse/pull/81174) ([larryluogit](https://github.com/larryluogit))。
* `libxml2` をバージョン 2.14.3 にアップグレード。 [#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit)).
* ベンダリングされた Rust のソースコードを `CARGO_HOME` にコピーしないようにしました。 [#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Sentry ライブラリへの依存関係を削除し、自前のエンドポイントに置き換えました。 [#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dependabot のアラートに対応するため、CI イメージ内の Python 依存関係を更新。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano)).
* 起動時に Keeper からレプリケートされた DDL の停止フラグを再読み取りすることで、Keeper に対するフォルトインジェクションが有効な場合でもテストの堅牢性を向上させました。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger)).
* Ubuntu アーカイブの URL に https を使用。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* テスト用イメージ内の Python 依存関係を更新。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot))。
* Nix ビルド用に `flake.nix` を導入。 [#81463](https://github.com/ClickHouse/ClickHouse/pull/81463) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* ビルド時に `delta-kernel-rs` がネットワークアクセスを必要としていた問題を修正。[#80609](https://github.com/ClickHouse/ClickHouse/issues/80609) をクローズ。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。記事 [A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust) もご覧ください。

### ClickHouse リリース 25.5, 2025-05-22 {#255}

#### 後方互換性のない変更

- 関数 `geoToH3` は、入力を (lat, lon, res) の順序で受け付けるようになりました（他の幾何関数と同様です）。以前の結果順序 (lon, lat, res) を維持したい場合は、設定 `geotoh3_argument_order = 'lon_lat'` を指定できます。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008))。
- ファイルシステムキャッシュの動的リサイズを許可するファイルシステムキャッシュ設定 `allow_dynamic_cache_resize` を追加しました（デフォルトは `false`）。理由: 特定の環境（ClickHouse Cloud）では、すべてのスケーリングイベントがプロセスの再起動を通じて発生するため、動作をより細かく制御し、安全対策として、この機能を明示的に無効にする必要があります。このPRは後方互換性がないとマークされています。古いバージョンでは、特別な設定なしでデフォルトで動的キャッシュリサイズが動作していたためです。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii))。
- レガシーインデックスタイプ `annoy` および `usearch` のサポートを削除しました。両方とも長い間スタブとなっており、レガシーインデックスを使用しようとするすべての試みはエラーを返していました。まだ `annoy` および `usearch` インデックスが存在する場合は、削除してください。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze))。
- サーバー設定 `format_alter_commands_with_parentheses` を削除しました。この設定は24.2で導入され、デフォルトで無効化されていました。25.2でデフォルトで有効化されました。新しい形式をサポートしないLTSバージョンが存在しないため、この設定を削除できます。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- `DeltaLake` ストレージの `delta-kernel-rs` 実装をデフォルトで有効化しました。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii))。
- `URL` からの読み取りに複数のリダイレクトが含まれる場合、設定 `enable_url_encoding` がチェーン内のすべてのリダイレクトに正しく適用されます。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer))。設定 `enble_url_encoding` のデフォルト値が `false` に設定されました。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer))。


#### 新機能

* `WHERE` 句におけるスカラー相関サブクエリをサポートしました。[#6697](https://github.com/ClickHouse/ClickHouse/issues/6697) をクローズ。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。単純なケースにおいて、`SELECT` 句（射影リスト）内の相関サブクエリをサポートしました。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。これにより、TPC-H テストスイートを 100% カバーするようになりました。
* ベクトル類似性インデックスを使用したベクトル検索が、これまでの実験的機能からベータ版になりました。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze))。
* `Parquet` フォーマットで geo 型をサポートしました。これにより [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) が解決されました。 [#79777](https://github.com/ClickHouse/ClickHouse/pull/79777) ([scanhex12](https://github.com/scanhex12))。
* 「sparse-ngrams」の計算を行うための新しい関数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8` を追加しました。これは、インデックス作成および検索向けに部分文字列を抽出するための堅牢なアルゴリズムです。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12)).
* `clickhouse-local`（およびその短縮エイリアスである `ch`）は、処理対象の入力データが存在する場合に、暗黙的に `FROM table` を使用するようになりました。これにより [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023) が解決されます。また、通常のファイルを処理する際に `--input-format` が指定されていない場合、clickhouse-local でフォーマット推論が有効になりました。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `stringBytesUniq` および `stringBytesEntropy` 関数を追加し、ランダムまたは暗号化されている可能性のあるデータを検索できるようにしました。 [#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* Base32のエンコードおよびデコードを行う関数を追加しました。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x)).
* `getServerSetting` 関数と `getMergeTreeSetting` 関数を追加。#78318 をクローズ。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* `version-hint.text` ファイルを活用できるようにする新しい設定 `iceberg_enable_version_hint` を追加しました。 [#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche)).
* `LIKE` キーワードによるフィルタリングを使って、データベース内の特定のテーブルを TRUNCATE できるようになりました。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `MergeTree` ファミリーのテーブルで `_part_starting_offset` 仮想カラムをサポートするようになりました。このカラムは、現在のパート一覧に基づいてクエリ時に計算される、すべての先行パートの累積行数を表します。累積値はクエリ実行中を通して保持され、パートの pruning 後も引き続き有効です。この挙動をサポートするため、関連する内部ロジックがリファクタリングされました。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird)).
* 右側の引数がゼロの場合に NULL を返す関数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull` を追加。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse のベクトル検索機能は、プリフィルタリングとポストフィルタリングの両方をサポートし、よりきめ細かな制御のための関連設定も提供するようになりました (issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)). [#79854](https://github.com/ClickHouse/ClickHouse/pull/79854) ([Shankar Iyer](https://github.com/shankar-iyer)).
* [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) および [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 関数を追加。[`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) でパーティション化された `Iceberg` テーブルにおけるデータファイルのプルーニングをサポート。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262)（[Daniil Ivanik](https://github.com/divanik)）。



#### 実験的機能
* 新しい `Time` / `Time64` データ型: `Time` (HHH:MM:SS) と `Time64` (HHH:MM:SS.`&lt;fractional&gt;`) を追加し、他のデータ型と相互運用するための基本的なキャスト関数や関数もいくつか追加しました。また、既存の関数名 toTime を toTimeWithFixedDate に変更しました。これは、キャスト関数として toTime が必要になるためです。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Iceberg データレイク向けの Hive metastore カタログ。 [#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* `full_text` 型のインデックスは `gin` に名称変更されました。これは PostgreSQL やその他のデータベースでより一般的な用語に従うものです。既存の `full_text` 型インデックスは引き続きロード可能ですが、検索で使用しようとすると例外をスローします（代わりに `gin` インデックスを利用するよう提案されます）。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### パフォーマンスの向上

* Compact パーツ形式を変更し、各サブストリームのマークを保存して個々のサブカラムを読み取れるようにしました。旧 Compact 形式は読み取り時も引き続きサポートされており、MergeTree 設定 `write_marks_for_substreams_in_compact_parts` を使用して書き込み時に有効化できます。Compact パーツのストレージ形式が変更されるため、より安全なアップグレードのためにデフォルトでは無効になっています。今後のいずれかのリリースでデフォルトで有効化される予定です。[#77940](https://github.com/ClickHouse/ClickHouse/pull/77940) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムを含む条件式を prewhere へ移動できるようにしました。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 複数のグラニュールに対して一括で式を評価することで、セカンダリインデックスの処理を高速化します。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `compile_expressions`（通常の式の一部を対象とする JIT コンパイラ）をデフォルトで有効化しました。これにより [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386) および [#66486](https://github.com/ClickHouse/ClickHouse/issues/66486) がクローズされました。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい設定 `use_skip_indexes_in_final_exact_mode` が導入されました。`ReplacingMergeTree` テーブルに対するクエリで FINAL 句が指定されている場合、スキップインデックスに基づいてテーブルの範囲だけを読み取ると、誤った結果が返される可能性があります。この設定を有効にすると、スキップインデックスによって返された主キー範囲と重なっている新しいパーツをスキャンすることで、正しい結果が返されることを保証できます。無効にするには 0、有効にするには 1 を設定します。 [#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer)).
* オブジェクトストレージ用クラスタテーブル関数（例：`s3Cluster`）は、キャッシュ局所性を改善するため、コンシステントハッシュに基づいて読み取り対象のファイルをレプリカに割り当てるようになりました。 [#77326](https://github.com/ClickHouse/ClickHouse/pull/77326) ([Andrej Hoos](https://github.com/adikus))。
* `S3Queue` / `AzureQueue` のパフォーマンスを、`INSERT` データを並列で実行できるようにすることで改善しました（キュー設定 `parallel_inserts=true` で有効化可能）。以前の S3Queue/AzureQueue は、パイプラインの最初の部分（ダウンロード、パース）のみ並列で実行でき、`INSERT` は単一スレッドでした。また、`INSERT` がほぼ常にボトルネックになっていました。現在は `processing_threads_num` にほぼ線形にスケールします。 [#77671](https://github.com/ClickHouse/ClickHouse/pull/77671) ([Azat Khuzhin](https://github.com/azat))。S3Queue/AzureQueue における `max_processed_files_before_commit` の挙動が、より公平になるよう改善しました。 [#79363](https://github.com/ClickHouse/ClickHouse/pull/79363) ([Azat Khuzhin](https://github.com/azat))。
* `parallel_hash_join_threshold` 設定で制御される閾値を導入し、右側テーブルのサイズがその閾値未満の場合に `hash` アルゴリズムへフォールバックするようにしました。[#76185](https://github.com/ClickHouse/ClickHouse/pull/76185)（[Nikita Taranov](https://github.com/nickitat)）。
* 並列レプリカを有効にして読み取りを行う際のタスクサイズを決定するために、レプリカ数を使用するようにしました。これにより、読み取るデータ量がそれほど大きくない場合でも、レプリカ間での作業分散がより適切になります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat)).
* 分散集計の最終段階において、`uniqExact` の状態を並列にマージできるようにしました。 [#78703](https://github.com/ClickHouse/ClickHouse/pull/78703) ([Nikita Taranov](https://github.com/nickitat))。
* キー付き集約における `uniqExact` 状態の並列マージ処理で発生する可能性のあるパフォーマンス低下を修正しました。 [#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat))。
* Azure Storage への List Blobs API の呼び出し回数を削減しました。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 並列レプリカを使用する分散 `INSERT SELECT` のパフォーマンスを改善しました。 [#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* 高い同時実行性が求められるシナリオにおいてロック競合とパフォーマンス劣化を避けるため、`LogSeriesLimiter` が生成されるたびにクリーンアップを実行しないようにしました。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 単純な count 最適化によりクエリを高速化しました。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* `Decimal` を使用する一部の演算のインライン展開を改善しました。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `input_format_parquet_bloom_filter_push_down` のデフォルト値を true に設定しました。また、設定変更履歴の誤りを修正しました。 [#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* すべての行を削除するパーツに対する `ALTER ... DELETE` ミューテーションを最適化しました。これにより、そのような場合にはミューテーションを実行せず、元のパーツの代わりに空のパーツが作成されるようになりました。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 可能な場合は、Compact パーツへの挿入時にブロックの不要なコピーを回避します。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* `input_format_max_block_size_bytes` 設定を追加し、入力フォーマットで作成されるブロックのサイズをバイト単位で制限できるようにしました。これにより、行に大きな値が含まれている場合のデータインポート時のメモリ使用量の増大を回避するのに役立ちます。 [#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar))。
* スレッドおよび `async_socket_for_remote/use_hedge_requests` のガードページを削除し、`FiberStack` の割り当て方法を `mmap` から `aligned_alloc` に変更しました。従来の方式では VMA が分割され、高負荷時に vm.max&#95;map&#95;count の上限に達する可能性があったためです。 [#79147](https://github.com/ClickHouse/ClickHouse/pull/79147) ([Sema Checherinda](https://github.com/CheSema)).
* 並列レプリカでの遅延マテリアライゼーション。 [#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).





#### 改善

* 軽量削除をオンザフライで適用できるようになりました（`lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` の設定時）。 [#79281](https://github.com/ClickHouse/ClickHouse/pull/79281)（[Anton Popov](https://github.com/CurtizJ)）。
* ターミナルに pretty 形式でデータが表示されていて、その後に続くブロックの列幅が同じ場合、カーソルを上に移動して前のブロックに連結することで、前のブロックから続けて表示できます。これにより [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333) が解決されました。この機能は新しい設定 `output_format_pretty_glue_chunks` によって制御されます。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `isIPAddressInRange` 関数を `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)`、`Nullable(IPv6)` データ型に拡張しました。 [#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff)).
* `PostgreSQL` エンジンの接続プール設定を動的に変更できるようにしました。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 通常のプロジェクションで `_part_offset` を指定できるようにしました。これはプロジェクションインデックスを構築するための最初のステップです。[#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) と併せて使用でき、#63207 の改善に役立ちます。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429)（[Amos Bird](https://github.com/amosbird)）。
* `system.named_collections` に新しいカラム（`create_query` と `source`）を追加しました。[#78179](https://github.com/ClickHouse/ClickHouse/issues/78179) をクローズしました。 [#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* システムテーブル `system.query_condition_cache` に新しいフィールド `condition` を追加しました。このフィールドには、クエリ条件キャッシュでキーとして使用されるハッシュ値の元となる平文の条件式が保存されます。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* `BFloat16` 列にベクトル類似インデックスを作成できるようになりました。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze))
* ベストエフォートでの `DateTime64` の解析で、小数部を含む UNIX タイムスタンプをサポート。 [#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* ストレージ `DeltaLake` の delta-kernel 実装において、カラムマッピングモードを修正し、スキーマ進化のテストを追加しました。[#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 値の変換を改善し、`Values` フォーマットから `Variant` カラムへの挿入を向上させました。 [#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar)).
* `tokens` 関数が拡張され、追加の「tokenizer」引数およびトークナイザー固有の引数を受け取れるようになりました。 [#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov))。
* `SHOW CLUSTER` ステートメントは、引数に含まれるマクロ（存在する場合）を展開するようになりました。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42))。
* ハッシュ関数は、配列、タプル、およびマップ内の `NULL` をサポートするようになりました（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) および [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* cctz を 2025a に更新。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano))。
* UDF のデフォルトの stderr の処理方式を「log&#95;last」に変更しました。これにより使い勝手が向上します。 [#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI でタブ操作を取り消せるようにしました。これにより [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284) がクローズされます。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `recoverLostReplica` の実行時に設定を削除するようにしました。これは次の対応と同様です: [https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* プロファイルイベント `ParquetReadRowGroups` と `ParquetPrunedRowGroups` を追加し、Parquet インデックスのプルーニングをプロファイルできるようにしました。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* クラスタ上のデータベースに対する `ALTER` をサポート。[#79242](https://github.com/ClickHouse/ClickHouse/pull/79242)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* QueryMetricLog の統計収集で取りこぼされた実行を明示的にスキップするようにし、ログが現在時刻に追いつくまでに長時間かかることを防ぎます。 [#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Arrow` ベースのフォーマット読み込み時の細かな最適化。 [#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc))。
* `allow_archive_path_syntax` 設定は誤って実験的 (experimental) としてマークされていました。実験的な設定がデフォルトで有効にならないようにするテストを追加しました。 [#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* クエリごとにページキャッシュの設定を調整可能にしました。これにより、より高速な検証や、高スループットかつ低レイテンシーなクエリ向けのきめ細かなチューニングが可能になります。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 典型的な64ビットハッシュのように見える数値に対しては、Prettyフォーマットで数値ヒントを出力しないようにしました。これにより[#79334](https://github.com/ClickHouse/ClickHouse/issues/79334)が解決されます。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高度なダッシュボード上のグラフの色は、対応するクエリのハッシュ値から計算されます。これにより、ダッシュボードをスクロールしている際に、グラフを覚えて見つけやすくなります。 [#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 非同期メトリクス `FilesystemCacheCapacity` を追加しました。これは `cache` 仮想ファイルシステムの総容量を表し、グローバルなインフラストラクチャ監視に役立ちます。[#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts へのアクセスを最適化し、要求された場合にのみ列/インデックスのサイズを読み取るようにしました。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* `SHOW CLUSTER <name>` クエリに必要なフィールドのみを計算するようにしました。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `DatabaseCatalog` に対するストレージ設定を指定できるようになりました。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` でローカルストレージをサポートしました。[#79416](https://github.com/ClickHouse/ClickHouse/pull/79416)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* delta-kernel-rs を有効化するためのクエリレベル設定 `allow_experimental_delta_kernel_rs` を追加。 [#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure/S3 の BLOB ストレージから BLOB を一覧取得する際に発生し得る無限ループを修正しました。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* ファイルシステムキャッシュの設定項目 `max_size_ratio_to_total_space` を追加しました。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `clickhouse-benchmark` において、`reconnect` オプションを再設定し、再接続回数として 0、1、または N を指定できるようにしました。[#79465](https://github.com/ClickHouse/ClickHouse/pull/79465)（[Sachin Kumar Singh](https://github.com/sachinkumarsingh092)）。
* 異なる `plain_rewritable` ディスク上にあるテーブルに対して `ALTER TABLE ... MOVE|REPLACE PARTITION` を許可しました。 [#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva))。
* 参照ベクターが `Array(BFloat16)` 型の場合にも、ベクトル類似度インデックスが使用されるようになりました。 [#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer)).
* last&#95;error&#95;message、last&#95;error&#95;trace、query&#95;id を system.error&#95;log テーブルに追加しました。関連チケット [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* クラッシュレポートの送信をデフォルトで有効にしました。これはサーバーの設定ファイルで無効にできます。 [#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* システムテーブル `system.functions` は、どの ClickHouse バージョンで各関数が最初に導入されたかを表示するようになりました。 [#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze)).
* `access_control_improvements.enable_user_name_access_type` 設定を追加しました。この設定により、[https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) で導入された、ユーザーやロールに対するより細かい権限付与を有効または無効にできます。バージョン 25.1 より古いレプリカを含むクラスターをお使いの場合は、この設定をオフにすることを検討してください。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* `ASTSelectWithUnionQuery::clone()` メソッドの正しい実装では、`is_normalized` フィールドも考慮されるようになりました。これにより、[#77569](https://github.com/ClickHouse/ClickHouse/issues/77569) の問題の解決に役立つ可能性があります。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `EXCEPT` 演算子を含む一部のクエリにおけるフォーマットの不整合を修正しました。`EXCEPT` 演算子の左辺が `*` で終わる場合、整形後のクエリでは括弧が失われ、その結果 `EXCEPT` 修飾子付きの `*` として解釈されてしまいます。これらのクエリは fuzzer によって検出されたもので、実際に遭遇する可能性は低いと考えられます。この変更により [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950) がクローズされました。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* バリアントのデシリアライズ順序をキャッシュすることで、`JSON` 型の解析をわずかに改善しました。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定 `s3_slow_all_threads_after_network_error` を追加。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar)).
* マージ対象として選択されたパーツに関するログレベルが誤って Information になっていました。[#80061](https://github.com/ClickHouse/ClickHouse/issues/80061) をクローズ。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer: ツールチップとステータスメッセージに runtime/share を追加。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa)).
* trace-visualizer: ClickHouse サーバーからデータを読み込む。 [#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa)).
* 失敗したマージ用のメトリクスを追加。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `clickhouse-benchmark` は、最大イテレーション数が指定されている場合、その値に基づいてパーセンテージを表示します。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts テーブル用のビジュアライザーを追加。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* クエリレイテンシを分析するためのツールを追加。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* パーツ内で欠落していたカラムのリネーム処理を修正。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* マテリアライズドビューが、例えば、それにストリーミングしている Kafka テーブルより遅れて開始されてしまう場合があります。 [#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn))。
* アナライザー有効時の `VIEW` 作成における `SELECT` クエリの書き換え処理を修正。[#75956](https://github.com/ClickHouse/ClickHouse/issues/75956) をクローズ。[#76356](https://github.com/ClickHouse/ClickHouse/pull/76356) ([Dmitry Novik](https://github.com/novikd))。
* サーバーからの `async_insert` の適用方法（`apply_settings_from_server` 経由）を修正（以前はクライアント側で `Unknown packet 11 from server` エラーが発生していた）。[#77578](https://github.com/ClickHouse/ClickHouse/pull/77578)（[Azat Khuzhin](https://github.com/azat)）。
* 新しく追加されたレプリカで機能していなかった Replicated データベース内のリフレッシュ可能マテリアライズドビューを修正。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* バックアップを破損させていたリフレッシュ可能なマテリアライズドビューを修正しました。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* `transform` の旧発火ロジックにおける論理エラーを修正。[#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* アナライザー使用時にセカンダリインデックスが適用されない場合があった問題を修正。 [#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) および [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373) を修正。 [#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* HTTP プロトコルで圧縮が有効な場合のプロファイルイベント（`NetworkSendElapsedMicroseconds` / `NetworkSendBytes`）のダンプ処理を修正し、誤差がバッファサイズ（通常は約 1MiB）を超えないようにしました。 [#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat))。
* JOIN ... USING で ALIAS 列を使用している場合に LOGICAL&#95;ERROR を発生させていたアナライザーを修正し、適切なエラーを生成するようにしました。 [#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* アナライザーを修正: SELECT 文に位置引数が含まれている場合に `CREATE VIEW ... ON CLUSTER` が失敗していた問題を修正しました。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `SELECT` にスカラーサブクエリが含まれている場合に、スキーマ推論を行うテーブル関数に対する `INSERT SELECT` で発生する `Block structure mismatch` エラーを修正。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* analyzer を修正: Distributed テーブルに対して `prefer_global_in_and_join=1` が設定されている場合、SELECT クエリ内の `in` 関数が `globalIn` に置き換えられるようにしました。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `MongoDB` エンジンを使用するテーブル、または `mongodb` テーブル関数から読み取るいくつかの種類の `SELECT` クエリを修正しました。修正対象は、`WHERE` 句内で定数値の暗黙的な型変換が行われるクエリ（例：`WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` および `GROUP BY` を含むクエリです。これらのクエリでは、以前は誤った結果が返される可能性がありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* 異なる JSON 型間の変換方法を修正しました。現在は、String への／からの変換を経由した単純なキャストで実行されます。パフォーマンスは低下しますが、精度は 100% です。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型から Interval 型への変換時の論理エラーを修正。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON パースエラー時の列のロールバックを修正。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 定数のエイリアス列を使用した結合で発生する&#39;bad cast&#39;エラーを修正。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ビューと対象テーブルで型が異なる列に対しては、マテリアライズドビューでの `PREWHERE` 句の使用を禁止しました。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* Variant カラムの不正なバイナリデータをパースする際に発生する論理エラーを修正。 [#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* Parquet のバッチサイズが 0 に設定されている場合に例外をスローするようにしました。以前は `output_format_parquet_batch_size = 0` のとき、ClickHouse がハングする問題がありましたが、現在は修正されています。 [#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely))。
* コンパクトパーツにおける basic フォーマットを用いた Variant 判別子のデシリアライズ処理を修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) で導入されたものです。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* `complex_key_ssd_cache` 型の辞書は、`block_size` および `write_buffer_size` パラメータにゼロまたは負の値が指定された場合に拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* SummingMergeTree で非集約列に Field を使用することは避けてください。SummingMergeTree で Dynamic/Variant 型と併用すると、予期しないエラーを引き起こす可能性があります。 [#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar)).
* analyzer で、Distributed テーブルを宛先としヘッダーが異なる Materialized View からの読み取りを修正しました。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* バッチ挿入が行われたテーブルで `arrayUnion()` が余分な（誤った）値を返すバグを修正。[#75057](https://github.com/ClickHouse/ClickHouse/issues/75057) を解決。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* `OpenSSLInitializer` で発生していたセグメンテーションフォルトを修正。[#79092](https://github.com/ClickHouse/ClickHouse/issues/79092) をクローズ。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* S3 の ListObject 操作で常に prefix を設定するようにしました。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* バッチ挿入を行ったテーブルで arrayUnion() が余分な（誤った）値を返すバグを修正します。[#79157](https://github.com/ClickHouse/ClickHouse/issues/79157) に対応。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* フィルタープッシュダウン後の論理エラーを修正。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* HTTP ベースのエンドポイントで使用される delta-kernel 実装を用いた DeltaLake テーブルエンジンの問題を修正し、NOSIGN を修正しました。[#78124](https://github.com/ClickHouse/ClickHouse/issues/78124) をクローズ。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Keeper の修正: 失敗したマルチリクエストでウォッチが発火しないように修正。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `IN` で Dynamic 型および JSON 型の使用を禁止しました。現在の `IN` の実装では、これらを許可すると結果が不正確になる可能性があります。これらの型に対する `IN` の適切なサポートは複雑であり、将来的に対応される可能性があります。 [#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar))。
* JSON 型の解析における重複パスの検査を修正。 [#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar))。
* SecureStreamSocket の接続問題を修正。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* データを含む plain&#95;rewritable ディスクの読み込み処理を修正。[#79439](https://github.com/ClickHouse/ClickHouse/pull/79439)（[Julia Kartseva](https://github.com/jkartseva)）。
* MergeTree の Wide パーツにおける動的サブカラム検出中に発生していたクラッシュを修正。 [#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル名の長さは、初回の `CREATE` クエリに対してのみ検証します。後方互換性の問題を避けるため、二次的な `CREATE` クエリに対しては検証を行わないでください。 [#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* スパースカラムを含むテーブルにおいて、一部のケースで発生していた `Block structure mismatch` エラーを修正しました。 [#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* 2 つのケースで発生していた &quot;Logical Error: Can&#39;t set alias of * of Asterisk on alias&quot; を修正。[#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano))。
* Atomic データベースの名前変更時に誤ったパスを使用してしまう問題を修正しました。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach)).
* JSON 列を他の列と組み合わせて使用する `ORDER BY` の不具合を修正。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar)).
* `use_hedged_requests` と `allow_experimental_parallel_reading_from_replicas` の両方が無効化されている場合に、リモートからの読み取り時に発生していた結果の重複を修正しました。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* Unity Catalog 使用時にクラッシュする delta-kernel 実装を修正。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 自動検出クラスタ向けのマクロを解決できるようにしました。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* page&#95;cache&#95;limits が誤って設定されている場合に適切に処理できるようにしました。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 可変長のフォーマッタ（例: `%W`、曜日 `Monday` `Tuesday` など）の後に、複合フォーマッタ（複数の要素をまとめて出力するフォーマッタ。例: `%D`、アメリカ式日付 `05/04/25` など）が続く場合の SQL 関数 `formatDateTime` の結果を修正しました。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze))。
* IcebergS3 は count() の最適化をサポートしていますが、IcebergS3Cluster はサポートしていません。そのため、クラスターモードで返される count() の結果がレプリカ数の倍数になる場合があります。 [#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear))。
* 遅延マテリアライゼーション使用時に、プロジェクションまでクエリ実行で一切の列が使用されない場合に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正しました。例: SELECT * FROM t ORDER BY rand() LIMIT 5。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926)（[Igor Nikonov](https://github.com/devcrafter)）。
* クエリ `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` 内のパスワードを非表示にしました。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* JOIN USING でエイリアスを指定できるようにしました。カラム名が変更された場合（ARRAY JOIN などにより）に、このエイリアスを指定できます。[#73707](https://github.com/ClickHouse/ClickHouse/issues/73707) を修正しました。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 新しいレプリカでも `UNION` を含むマテリアライズドビューが正しく動作するようにしました。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 関数 `parseDateTime` におけるフォーマット指定子 `%e` は、これまではスペースでパディングされた日（例: ` 3`）のみを受け付けていましたが、現在は 1 桁の日（例: `3`）も認識するようになりました。これにより、その動作は MySQL と互換になりました。以前の動作を維持するには、設定 `parsedatetime_e_requires_space_padding = 1` を有効にしてください。（issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)）。[#80057](https://github.com/ClickHouse/ClickHouse/pull/80057)（[Robert Schulze](https://github.com/rschu1ze)）。
* ClickHouse のログに `Cannot find 'kernel' in '[...]/memory.stat'` という警告メッセージが出力される問題を修正しました（issue [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* FunctionComparison でスタックサイズをチェックし、スタックオーバーフローによるクラッシュを回避しました。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* `system.workloads` からの SELECT 実行時に発生するレースコンディションを修正。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修正: 分散クエリにおける遅延マテリアライゼーションの問題。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* `Array(Bool)` から `Array(FixedString)` への変換を修正しました。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat))。
* Parquet 形式のバージョン選択をわかりやすくしました。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* `ReservoirSampler` の自己マージ処理を修正。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントコンテキストにおける挿入先テーブルの保持処理を修正。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `AggregatingSortedAlgorithm` と `SummingSortedAlgorithm` のデータメンバーの破棄順序を修正しました。 [#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat))
* `enable_user_name_access_type` は `DEFINER` アクセスタイプに影響しないようになりました。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* `system` データベースのメタデータが Keeper にある場合、`system` データベースへのクエリがハングする可能性がある問題を修正。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### ビルド/テスト/パッケージングの改善

- ビルド済みの`chcache`バイナリを再利用できるようにし、常に再ビルドする必要をなくしました。[#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- NATS一時停止待機を追加しました。[#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
- ARMビルドをamd64compatとして誤って公開していた問題を修正しました。[#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger))。
- OpenSSL用に事前生成されたアセンブリを使用するようにしました。[#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `clang20`でのビルドを可能にする修正を行いました。[#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `chcache`: Rustキャッシングのサポートを追加しました。[#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- `zstd`アセンブリファイルにアンワインド情報を追加しました。[#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321))。

### ClickHouseリリース 25.4, 2025-04-22 {#254}

#### 後方互換性のない変更

- `allow_materialized_view_with_bad_select`が`false`の場合、マテリアライズドビュー内のすべてのカラムがターゲットテーブルと一致するかどうかをチェックするようにしました。[#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm))。
- `dateTrunc`が負のDate/DateTime引数で使用される場合の問題を修正しました。[#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
- レガシーの`MongoDB`統合が削除されました。サーバー設定`use_legacy_mongodb_integration`は廃止され、現在は何も行いません。[#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze))。
- パーティションキーまたはソートキーで使用されるカラムの集計をスキップするように`SummingMergeTree`の検証を強化しました。[#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。


#### 新機能

* ワークロード用の CPU スロットスケジューリング機能を追加しました。詳細は[ドキュメント](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)を参照してください。 [#77595](https://github.com/ClickHouse/ClickHouse/pull/77595) ([Sergei Trifonov](https://github.com/serxa)).
* `clickhouse-local` は、`--path` コマンドライン引数を指定すると、再起動後もデータベースを保持します。これにより [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647) が解決されます。これにより [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947) が解決されます。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* サーバーが過負荷状態のときにクエリを拒否します。判断は待機時間 (`OSCPUWaitMicroseconds`) とビジー時間 (`OSCPUVirtualTimeMicroseconds`) の比率に基づいて行われます。この比率が `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` の間にある場合（これらはクエリレベルの設定です）、一定の確率でクエリが破棄されます。 [#63206](https://github.com/ClickHouse/ClickHouse/pull/63206) ([Alexey Katsman](https://github.com/alexkats)).
* `Iceberg` におけるタイムトラベル: 特定のタイムスタンプ時点での `Iceberg` テーブルをクエリできる設定を追加しました。 [#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* `Iceberg` メタデータ用のインメモリキャッシュで、クエリを高速化するためにマニフェストファイルおよびその一覧と `metadata.json` を格納します。 [#77156](https://github.com/ClickHouse/ClickHouse/pull/77156)（[Han Fei](https://github.com/hanfei1991)）。
* Azure Blob Storage 向けの `DeltaLake` テーブルエンジンをサポート。[#68043](https://github.com/ClickHouse/ClickHouse/issues/68043) を修正。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* デシリアライズされたベクトル類似インデックス用のインメモリキャッシュを追加しました。これにより、繰り返し実行される近似最近傍 (ANN) 検索クエリが高速化されます。新しいキャッシュのサイズは、サーバー設定 `vector_similarity_index_cache_size` および `vector_similarity_index_cache_max_entries` で制御されます。この機能は、これまでのリリースにおけるスキッピングインデックスキャッシュ機能を置き換えるものです。 [#77905](https://github.com/ClickHouse/ClickHouse/pull/77905) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Delta Lake のパーティションプルーニングをサポートしました。[#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 読み取り専用の `MergeTree` テーブルにバックグラウンドでのリフレッシュをサポートし、更新可能なテーブルを無制限の分散リーダーからクエリできるようにします（ClickHouse ネイティブなデータレイク）。 [#76467](https://github.com/ClickHouse/ClickHouse/pull/76467) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* データベースのメタデータファイルを保存するためにカスタムディスクを使用できるようになりました。現在、これはサーバー全体でのみ設定できます。 [#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach))。
* plain&#95;rewritable ディスクに対して ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION がサポートされるようになりました。 [#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva)).
* `Kafka` テーブルエンジンに、`SASL` 構成および認証情報用のテーブル設定を追加しました。これにより、構成ファイルや named collection を使用することなく、`CREATE TABLE` ステートメント内で直接、Kafka および Kafka 互換システムに対する SASL ベースの認証を設定できるようになります。[#78810](https://github.com/ClickHouse/ClickHouse/pull/78810)（[Christoph Wurm](https://github.com/cwurm)）。
* MergeTree テーブルに対して `default_compression_codec` を設定できるようになりました。これは、CREATE クエリで対象カラムに対して圧縮コーデックが明示的に定義されていない場合に使用されます。この変更により [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005) が解決されました。 [#66394](https://github.com/ClickHouse/ClickHouse/pull/66394) ([gvoelfin](https://github.com/gvoelfin))。
* 分散接続で特定のネットワークを使用できるようにするため、clusters の構成に `bind_host` 設定を追加しました。 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum)).
* `system.tables` に新しいカラム `parametrized_view_parameters` を追加しました。これにより、[https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756) をクローズしました。[#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* データベースコメントを変更できるようにしました。[#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) をクローズ。### ユーザー向けの変更点に関するドキュメント項目。[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* PostgreSQL 互換プロトコルで `SCRAM-SHA-256` 認証をサポート。 [#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12)).
* 関数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted`、`arraySimilarity` を追加しました。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* 設定 `parallel_distributed_insert_select` は、`ReplicatedMergeTree` への `INSERT SELECT` にも適用されるようになりました（以前は Distributed テーブルが必要でした）。 [#78041](https://github.com/ClickHouse/ClickHouse/pull/78041) ([Igor Nikonov](https://github.com/devcrafter)).
* `toInterval` 関数を新たに導入しました。この関数は 2 つの引数（値と単位）を受け取り、その値を特定の `Interval` 型に変換します。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* iceberg テーブル関数およびエンジンに、ルートの `metadata.json` ファイルを解決するための便利な方法を複数追加。[#78455](https://github.com/ClickHouse/ClickHouse/issues/78455) をクローズ。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* ClickHouse における SSH プロトコルでのパスワードベースの認証をサポートしました。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 実験的機能
* `WHERE` 句内の `EXISTS` 式の引数として、相関サブクエリをサポートするようになりました。[#72459](https://github.com/ClickHouse/ClickHouse/issues/72459) をクローズ。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `sparseGrams` および `sparseGramsHashes` に ASCII 版と UTF-8 版を追加。著者: [scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。使用しないでください。実装は今後のバージョンで変更される予定です。



#### パフォーマンスの向上

* ORDER BY および LIMIT の後にデータを読み込む lazy カラムを使用してパフォーマンスを最適化します。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* クエリ条件キャッシュを既定で有効にしました。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `col->insertFrom()` への仮想関数呼び出しを排除することで、JOIN 結果の構築を高速化しました。 [#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger))。
* 可能であれば、フィルタクエリプランステップの等価条件を JOIN 条件にマージし、ハッシュテーブルのキーとして利用できるようにします。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd))。
* JOIN の両方のテーブルで JOIN キーが PK のプレフィックスになっている場合、JOIN に対して動的シャーディングを使用します。この最適化は `query_plan_join_shard_by_pk_ranges` 設定で有効にできます（デフォルトでは無効）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `Iceberg` のカラム下限値および上限値に基づくデータプルーニングをサポート。 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638) を修正。 [#78242](https://github.com/ClickHouse/ClickHouse/pull/78242)（[alesapin](https://github.com/alesapin)）。
* `Iceberg` に trivial count 最適化を実装しました。これにより、`count()` を含み、フィルタを一切使用しないクエリはより高速になります。 [#77639](https://github.com/ClickHouse/ClickHouse/issues/77639) をクローズしました。 [#78090](https://github.com/ClickHouse/ClickHouse/pull/78090) ([alesapin](https://github.com/alesapin)).
* `max_merge_delayed_streams_for_parallel_write` を使用して、マージ時に並列でフラッシュできる列数を構成できるようにしました（これにより、S3 への垂直マージにおけるメモリ使用量を約 25 分の 1 に抑えられます）。 [#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat)).
* キャッシュがマージなどの受動的な用途に使われる場合は、`filesystem_cache_prefer_bigger_buffer_size` を無効にします。これにより、マージ時のメモリ消費が抑えられます。 [#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 現在、並列レプリカが有効な読み取り処理では、タスクサイズの決定にレプリカ数を使用します。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間での作業分散がより良好になります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* `ORC` フォーマット向けに非同期 I/O プリフェッチをサポートし、リモート I/O のレイテンシを隠蔽することで全体的なパフォーマンスを向上させました。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 非同期インサートで使用するメモリを事前に割り当て、パフォーマンスを向上。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* `multiRead` が利用可能な箇所では、単一の `get` リクエストの使用を廃止することで Keeper へのリクエスト数を削減しました。これはレプリカ数の増加に伴い、Keeper に対する大きな負荷要因となっていました。 [#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* Nullable 引数に対して関数を実行する際の軽微な最適化。 [#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* `arraySort` を最適化しました。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 同一パーツのマークをマージし、一度にクエリ条件キャッシュへ書き込むことで、ロックのオーバーヘッドを削減しました。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 1 つだけのブラケット展開を含むクエリに対する `s3Cluster` のパフォーマンスを最適化しました。 [#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis))。
* 単一の Nullable 列または LowCardinality 列を対象とする ORDER BY を最適化します。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li)).
* `Native` 形式のメモリ使用量を最適化しました。 [#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat)).
* 軽微な最適化：型キャストが必要な場合は、`count(if(...))` を `countIf` に書き換えないようにしました。[#78564](https://github.com/ClickHouse/ClickHouse/issues/78564) をクローズしました。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 関数で、`tokenbf_v1` および `ngrambf_v1` の全文検索用スキップインデックスを利用できるようになりました。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus))。
* ベクトル類似性インデックスが最大で 2 倍のメインメモリを過剰に割り当ててしまう可能性がありました。この修正ではメモリ割り当て戦略を見直し、メモリ使用量を削減するとともに、ベクトル類似性インデックスキャッシュの有効性を向上させています（issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `system.metric_log` テーブルにスキーマ種別を指定するための設定 `schema_type` を導入しました。利用可能なスキーマは 3 種類あります。`wide` -- 現在のスキーマで、各メトリクス/イベントが個別のカラムに格納されます（個別カラムの読み取りに最も効果的）、`transposed` -- `system.asynchronous_metric_log` と類似しており、メトリクス/イベントが行として保存されます。さらに最も特徴的なのが `transposed_with_wide_view` で、`transposed` スキーマの実テーブルを作成すると同時に、クエリをその実テーブルへのクエリに変換する `wide` スキーマのビューも導入します。`transposed_with_wide_view` では、ビューに対するサブ秒精度はサポートされておらず、`event_time_microseconds` は後方互換性のためのエイリアスにすぎません。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin))。





#### 改善

* `Distributed` クエリ用のクエリプランのシリアライズに対応しました。新しい設定項目 `serialize_query_plan` が追加されました。有効化すると、`Distributed` テーブルからのクエリはリモートクエリ実行のためにシリアライズされたクエリプランを使用します。これにより TCP プロトコルに新しいパケットタイプが導入され、このパケットを処理できるようにするためには、サーバー設定に `<process_query_plan_packet>true</process_query_plan_packet>` を追加する必要があります。 [#69652](https://github.com/ClickHouse/ClickHouse/pull/69652) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* ビューからの `JSON` 型およびサブカラムの読み取りに対応。[#76903](https://github.com/ClickHouse/ClickHouse/pull/76903)（[Pavel Kruglov](https://github.com/Avogar)）。
* `ALTER DATABASE ... ON CLUSTER` のサポートを追加しました。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* リフレッシュ可能なマテリアライズドビューのリフレッシュ処理が `system.query_log` に記録されるようになりました。 [#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321)).
* ユーザー定義関数 (UDF) は、その構成内の新しい設定項目により、決定的 (deterministic) であるとマークできるようになりました。また、クエリキャッシュは、クエリ内で呼び出される UDF が決定的かどうかを確認するようになりました。決定的である場合は、そのクエリ結果をキャッシュします (Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)). [#77769](https://github.com/ClickHouse/ClickHouse/pull/77769) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* すべての種類のレプリケーション関連タスクに対してバックオフロジックを有効にしました。これにより、CPU 使用率、メモリ使用量、およびログファイルサイズを削減できるようになります。`max_postpone_time_for_failed_mutations_ms` と同様の新しい設定 `max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms`、`max_postpone_time_for_failed_replicated_tasks_ms` を追加しました。[#74576](https://github.com/ClickHouse/ClickHouse/pull/74576)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* `system.errors` に `query_id` を追加。[#75815](https://github.com/ClickHouse/ClickHouse/issues/75815) をクローズ。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581) ([Vladimir Baikov](https://github.com/bkvvldmr))。
* `UInt128` から `IPv6` への変換サポートを追加しました。これにより、`IPv6` に対する `bitAnd` 演算や算術演算、および `IPv6` への再変換が可能になります。[#76752](https://github.com/ClickHouse/ClickHouse/issues/76752) をクローズします。また、`IPv6` に対する `bitAnd` 演算の結果も `IPv6` に再変換できるようになります。[#57707](https://github.com/ClickHouse/ClickHouse/pull/57707) も参照してください。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* デフォルトでは、`Variant` 型内のテキストフォーマットで特殊な `Bool` 値をパースしないようにしました。設定 `allow_special_bool_values_inside_variant` を有効にすることで、この挙動を変更できます。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* セッションレベルおよびサーバーレベルで、低い `priority` のクエリに対するタスクごとの待機時間を設定できるようにしました。 [#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* JSON データ型の値に対する比較を実装しました。これにより、JSON オブジェクトを Map と同様に比較できます。 [#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.kafka_consumers` による権限管理サポートを改善。内部の `librdkafka` エラーを転送（このライブラリがあまり良くないことは特筆に値する）。 [#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* Buffer テーブルエンジンの設定検証を追加しました。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `HDFS` における `pread` の有効・無効を切り替えるための設定 `enable_hdfs_pread` を追加しました。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou))。
* ZooKeeper の `multi` 読み取りおよび書き込みリクエスト数向けのプロファイルイベントを追加。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* `disable_insertion_and_mutation` が有効な場合でも、一時テーブルの作成および挿入を許可します。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* `max_insert_delayed_streams_for_parallel_write` を 100 に減らしました。 [#77919](https://github.com/ClickHouse/ClickHouse/pull/77919) ([Azat Khuzhin](https://github.com/azat)).
* Joda 構文（気になるかもしれませんが、Java の世界のものです）における `yyy` のような年のパースを修正。 [#77973](https://github.com/ClickHouse/ClickHouse/pull/77973) ([李扬](https://github.com/taiyang-li))。
* `MergeTree` テーブルのパーツのアタッチ処理はブロックの順序で行われるようになりました。これは `ReplacingMergeTree` のような特殊なマージアルゴリズムにとって重要です。これにより [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009) がクローズされました。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリマスキングルールで、マッチが発生した場合に `LOGICAL_ERROR` をスローできるようになりました。これにより、あらかじめ定義したパスワードがログのどこかに漏洩していないかを検証するのに役立ちます。 [#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* MySQL との互換性を高めるため、`information_schema.tables` に `index_length_column` カラムを追加しました。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 2 つの新しいメトリクス `TotalMergeFailures` と `NonAbortedMergeFailures` を導入しました。これらのメトリクスは、短時間のうちに多数のマージが失敗しているケースを検出するために必要です。 [#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* パススタイル使用時にキーが指定されていない場合に発生する S3 URL の誤ったパースを修正。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos)).
* 非同期メトリクスである `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime`、`BlockReadTime` の不正な値を修正しました（この変更以前は 1 秒が誤って 0.001 秒として報告されていました）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov))。
* StorageS3(Azure)Queue へのマテリアライズドビューへのプッシュ中に発生するエラーについて、`loading_retries` の上限が適用されるようにしました。これ以前は、そのようなエラーは無制限にリトライされていました。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `delta-kernel-rs` 実装を用いた DeltaLake で、パフォーマンスとプログレスバーを修正しました。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ランタイムディスクで `include`、`from_env`、`from_zk` をサポートしました。 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177) をクローズ。 [#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 長時間実行されているミューテーションに対して、`system.warnings` テーブルに動的な警告を追加しました。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* システムテーブル `system.query_condition_cache` にフィールド `condition` を追加しました。このフィールドには、クエリ条件キャッシュでキーとして使用されるハッシュ値の元となるプレーンテキストの条件が保存されます。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze))。
* Hive パーティションで空値を許可できるようにしました。 [#78816](https://github.com/ClickHouse/ClickHouse/pull/78816) ([Arthur Passos](https://github.com/arthurpassos)).
* `BFloat16` に対する `IN` 句の型変換の挙動を修正しました（つまり、`SELECT toBFloat16(1) IN [1, 2, 3];` は現在 `1` を返します）。[#78754](https://github.com/ClickHouse/ClickHouse/issues/78754) をクローズしました。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `disk = ...` が設定されている場合は、`MergeTree` の他のディスク上のパーツをチェックしないようにしました。 [#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* `system.query_log` の `used_data_type_families` に記録されるデータ型が、正規名で保存されるようにしました。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` 実行時のクリーンアップ設定を、[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様にしました。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* INFILE のスキーマ推論に挿入列を使用する。[#78490](https://github.com/ClickHouse/ClickHouse/pull/78490)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 集約プロジェクションで `count(Nullable)` が使用されている場合に誤ったプロジェクション解析が行われる問題を修正しました。これにより [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495) が解決されます。また、この PR では、プロジェクションが使用される理由や使用されない理由を明確にするための、プロジェクション解析まわりのログ出力もいくつか追加しています。[#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* `DETACH PART` 実行中に発生するエラー `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` を修正。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* アナライザでリテラルを含む式を使うスキップインデックスが正しく動作しない問題を修正し、インデックス解析時に自明なキャストを削除。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* `close_session` クエリパラメーターが一切効果を発揮せず、名前付きセッションが `session_timeout` の経過後にのみクローズされていたバグを修正しました。 [#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats)).
* Materialized View を付与していない状態でも NATS サーバーからメッセージを受信できない問題を修正しました。 [#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 空の `FileLog` を `merge` テーブル関数で読み込む際に発生する論理エラーを修正し、[#75575](https://github.com/ClickHouse/ClickHouse/issues/75575) をクローズ。 [#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 共有バリアントの `Dynamic` シリアライゼーションでデフォルトのフォーマット設定を使用するように変更しました。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar))。
* ローカルディスク上のテーブルデータパスの存在チェックを修正。 [#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 一部の型に対する定数値のリモート送信を修正。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* S3/AzureQueue でコンテキストの有効期限切れが原因のクラッシュを修正しました。 [#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* RabbitMQ、Nats、Redis、AzureQueue テーブルエンジンで資格情報を非表示にする。[#77755](https://github.com/ClickHouse/ClickHouse/pull/77755)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `argMin`/`argMax` における `NaN` 比較の未定義動作を修正。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* 書き込み対象のブロックが生成されない場合でも、マージおよびミューテーションがキャンセルされているかどうかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Replicated データベースで、新しく追加されたレプリカでリフレッシュ可能なマテリアライズドビューが動作しない不具合を修正。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* `NOT_FOUND_COLUMN_IN_BLOCK` エラー発生時にクラッシュする可能性があった問題を修正しました。 [#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データの投入中に S3/AzureQueue で発生するクラッシュを修正しました。 [#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* SSH サーバーにおける履歴のあいまい検索機能を無効化しました（`skim` ライブラリを必要とするため）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* インデックスが作成されていない列に対するベクトル検索クエリが、同一テーブル内にベクトル類似度インデックスが定義された別のベクトル列が存在する場合に誤った結果を返していたバグを修正しました (Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978))。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069) ([Shankar Iyer](https://github.com/shankar-iyer))。
* ごく小さな誤りのあったプロンプト「The requested output format {} is binary... Do you want to output it anyway? [y/N]」を修正。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* `toStartOfInterval` の origin 引数が 0 の場合のバグを修正。 [#78096](https://github.com/ClickHouse/ClickHouse/pull/78096) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* HTTP インターフェイスで空の `session_id` クエリパラメータを指定できないようにしました。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats))。
* `ALTER` クエリの直後に実行された `RENAME` クエリが原因で `Replicated` データベースのメタデータが上書きされる可能性があった問題を修正しました。 [#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique)).
* `NATS` エンジンで発生するクラッシュを修正。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 埋め込みクライアントでは SSH 用の history&#95;file を作成しようとしないようにしました（以前のバージョンでは、作成は常に失敗していたものの、試行自体は行われていました）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* `RENAME DATABASE` または `DROP TABLE` クエリの実行後に `system.detached_tables` が不正確な情報を表示する問題を修正。[#78126](https://github.com/ClickHouse/ClickHouse/pull/78126)（[Nikolay Degterinsky](https://github.com/evillique)）。
* `Replicated` データベースに対するテーブル数過多チェックを、[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) の変更後の動作に合わせて修正しました。また、`ReplicatedMergeTree` や `KeeperMap` の場合に Keeper 内に未登録のノードが作成されるのを避けるため、ストレージを作成する前にチェックを実行するようにしました。 [#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* `S3Queue` メタデータの初期化が並行して行われた場合に発生しうるクラッシュを修正しました。 [#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 関数は、`max_size` 引数が Int 型で値 0 の場合、これまで UInt 型に対してすでに行われていたのと同様に、それで実行を試みるのではなく `BAD_ARGUMENTS` エラーを返すようになりました。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* ローカルテーブルがデタッチされる前に削除された場合に、失われたレプリカの復旧でクラッシュする問題を修正。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* `system.s3_queue_settings` の「alterable」カラムが常に `false` を返していた問題を修正しました。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure アクセス署名をマスクし、ユーザーやログに表示されないようにしました。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Wide パーツにおけるプレフィックス付きサブストリームのプリフェッチを修正しました。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar))。
* キー配列が `LowCardinality(Nullable)` 型の場合に `mapFromArrays` がクラッシュしたり誤った結果を返したりする問題を修正しました。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* delta-kernel-rs の認証オプションを修正。 [#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii)).
* レプリカの `disable_insertion_and_mutation` が true の場合、Refreshable Materialized Views のタスクをスケジュールしないようにしました。タスクは挿入処理であり、`disable_insertion_and_mutation` が true の場合は失敗してしまいます。 [#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* `Merge` エンジンの基盤となるテーブルへのアクセス権を検証。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `Distributed` テーブルに対するクエリでは、`FINAL` 修飾子は無視される場合があります。 [#78428](https://github.com/ClickHouse/ClickHouse/pull/78428) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* `bitmapMin` は、ビットマップが空の場合に uint32&#95;max（入力型がそれより大きい場合には uint64&#95;max）を返します。これは、空の roaring&#95;bitmap における最小値の動作と一致します。 [#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* `distributed_aggregation_memory_efficient` が有効な場合、FROM 句読み取り直後のクエリ処理における並列化を無効化しました。論理エラーを引き起こす可能性があったためです。 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934) をクローズします。 [#78500](https://github.com/ClickHouse/ClickHouse/pull/78500) ([flynn](https://github.com/ucasfl))。
* `max_streams_to_max_threads_ratio` 設定を適用した結果、計画されるストリーム数が 0 になる場合にも備えて、読み取り用のストリームが少なくとも 1 つは設定されるようになりました。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージエンジン `S3Queue` で発生していた論理エラー「Cannot unregister: table uuid is not registered」を修正しました。[#78285](https://github.com/ClickHouse/ClickHouse/issues/78285) をクローズしました。 [#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ClickHouse は、cgroups v1 と v2 の両方が有効になっているシステムで、自身の属する cgroup v2 を検出できるようになりました。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* `-Cluster` テーブル関数がテーブルレベル設定を使用した場合に失敗する不具合を修正しました。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik))。
* INSERT 実行時に ReplicatedMergeTree がトランザクションをサポートしていない場合のチェックを改善しました。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* アタッチ時にクエリ設定をクリーンアップするようにしました。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* `iceberg_metadata_file_path` に無効なパスが指定されている場合に発生していたクラッシュを修正しました。 [#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* `DeltaLake` テーブルエンジンの delta-kernel-s 実装において、読み取りスキーマがテーブルスキーマと異なり、かつパーティション列が存在する場合に発生していた「列が見つからない」エラーを修正しました。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 名前付きセッションをクローズするようスケジュールした後（ただしタイムアウトの有効期限前）に、同じ名前で新しい名前付きセッションを作成すると、最初のセッションがクローズされる予定だった時点で新しいセッションまでクローズされてしまう問題を修正しました。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* `MongoDB` エンジンのテーブルまたは `mongodb` テーブル関数から読み取る複数の種類の `SELECT` クエリを修正しました。修正されたのは、`WHERE` 句内で定数値が暗黙的に変換されるクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` と `GROUP BY` を含むクエリです。以前は、これらのクエリが誤った結果を返すことがありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* `CHECK TABLE` 実行中にテーブルのシャットダウンがブロックされないようにしました。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper の修正: すべてのケースで ephemeral カウントを正しく修正。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* `view` 以外のテーブル関数を使用している場合に `StorageDistributed` で発生する不適切なキャストを修正。[#78464](https://github.com/ClickHouse/ClickHouse/issues/78464) をクローズ。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `tupleElement(*, 1)` のフォーマットの一貫性を修正し、[#78639](https://github.com/ClickHouse/ClickHouse/issues/78639) をクローズしました。 [#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `ssd_cache` 型の辞書は、ゼロまたは負の `block_size` および `write_buffer_size` パラメータを拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 異常終了後に行われた `ALTER` によって Refreshable MATERIALIZED VIEW がクラッシュする問題を修正しました。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* `CSV` フォーマットでの不正な `DateTime` 値のパース処理を修正。[#78919](https://github.com/ClickHouse/ClickHouse/pull/78919)（[Pavel Kruglov](https://github.com/Avogar)）。
* Keeper の修正: multi リクエスト失敗時に watch がトリガーされないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `min-max` 値が明示的に指定されているものの、その値が `NULL` の場合に Iceberg テーブルの読み取りに失敗する問題を修正しました。Go Iceberg ライブラリが、そのような非常に問題のあるファイルを生成することがあると指摘されています。[#78740](https://github.com/ClickHouse/ClickHouse/issues/78740) をクローズします。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。

#### ビルド/テスト/パッケージングの改善

- RustでCPUターゲット機能を考慮し、すべてのクレートでLTOを有効化しました。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouseリリース 25.3 LTS、2025-03-20 {#253}

#### 後方互換性のない変更

- レプリケートされたデータベースのTRUNCATEを禁止しました。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc))。
- スキッピングインデックスキャッシュを元に戻しました。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。


#### 新機能

* `JSON` データ型は本番環境で利用可能です。詳しくは [https://jsonbench.com/](https://jsonbench.com/) を参照してください。`Dynamic` および `Variant` データ型も本番環境で利用可能です。[#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* clickhouse-server 向けの SSH プロトコルを導入しました。これにより、任意の SSH クライアントを使用して ClickHouse に接続できるようになりました。これにより次の issue がクローズされました: [#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 並列レプリカが有効な場合、テーブル関数を対応する -Cluster 版に置き換えるようにしました。[#65024](https://github.com/ClickHouse/ClickHouse/issues/65024) を修正しました。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache の新しい実装で、OS のページキャッシュに依存する代わりにプロセス内メモリにデータをキャッシュできるようにし、ローカルファイルシステムキャッシュによる裏付けのないリモートの仮想ファイルシステム上にデータが保存されている場合に有用です。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 同時実行クエリ間での CPU スロットの割り当て方法を制御するサーバー設定 `concurrent_threads_scheduler` を追加しました。`round_robin`（従来の動作）または `fair_round_robin` を設定でき、INSERT と SELECT の間で発生する不公平な CPU 割り当ての問題に対処します。[#75949](https://github.com/ClickHouse/ClickHouse/pull/75949)（[Sergei Trifonov](https://github.com/serxa)）。
* `estimateCompressionRatio` 集約関数を追加しました。[#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。[#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 関数 `arraySymmetricDifference` を追加しました。複数の配列引数のうち、すべての引数に共通して含まれない要素をすべて返します。例: `SELECT arraySymmetricDifference([1, 2], [2, 3])` は `[1, 3]` を返します。（issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673)）。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* Iceberg 用のストレージ/テーブル関数設定 `iceberg_metadata_file_path` を用いて、読み取るメタデータファイルを明示的に指定できるようにしました。 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412) を修正。 [#77318](https://github.com/ClickHouse/ClickHouse/pull/77318) ([alesapin](https://github.com/alesapin))。
* ブロックチェーンの実装、特に EVM ベースのシステムで一般的に使用される `keccak256` ハッシュ関数を追加しました。 [#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche)).
* 3 つの新しい関数を追加しました。`icebergTruncate`（仕様に準拠。詳細は [https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details) を参照）、`toYearNumSinceEpoch`、`toMonthNumSinceEpoch` です。`Iceberg` エンジンのパーティションプルーニングで `truncate` 変換をサポートしました。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403)（[alesapin](https://github.com/alesapin)）。
* `LowCardinality(Decimal)` データ型のサポートを追加 [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。[#72833](https://github.com/ClickHouse/ClickHouse/pull/72833)（[zhanglistar](https://github.com/zhanglistar)）。
* `FilterTransformPassedRows` および `FilterTransformPassedBytes` のプロファイルイベントは、クエリ実行中にフィルター処理された行数とバイト数を示します。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar)).
* ヒストグラムメトリックタイプに対応しました。インターフェイスは Prometheus クライアントとほぼ同一で、`observe(value)` を呼び出すだけで、その値に対応するバケットのカウンターをインクリメントできます。ヒストグラムメトリクスは `system.histogram_metrics` を通じて公開されます。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 明示的な値に基づいて切り替える非定数 CASE をサポート。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).



#### 実験的機能
* AWS S3 およびローカルファイルシステム上の Delta Lake テーブルに対して、[Unity Catalog のサポート](https://www.databricks.com/product/unity-catalog)を追加しました。 [#76988](https://github.com/ClickHouse/ClickHouse/pull/76988) ([alesapin](https://github.com/alesapin))。
* Iceberg テーブル向けに、AWS Glue サービスカタログとの実験的な統合を導入しました。 [#77257](https://github.com/ClickHouse/ClickHouse/pull/77257) ([alesapin](https://github.com/alesapin))。
* 動的なクラスタ自動検出機能をサポートしました。これは既存の _node_ 自動検出機能を拡張するものです。ClickHouse は、`<multicluster_root_path>` を用いた共通の ZooKeeper パス配下で、新しい _clusters_ を自動的に検出および登録できるようになりました。 [#76001](https://github.com/ClickHouse/ClickHouse/pull/76001) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 新しい設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` により、設定可能なタイムアウト経過後にパーティション全体の自動クリーンアップマージを実行できるようになりました。 [#76440](https://github.com/ClickHouse/ClickHouse/pull/76440) ([Christoph Wurm](https://github.com/cwurm))。



#### パフォーマンスの改善
* 繰り返し利用される条件に対してクエリ条件キャッシュを実装し、クエリパフォーマンスを向上させました。条件を満たさないデータ部分の範囲を、メモリ上の一時インデックスとして記憶します。後続のクエリはこのインデックスを利用します。[#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236)（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツ削除時にキャッシュからデータを積極的に削除するようにしました。データ量が小さい場合に、キャッシュが最大サイズまで成長しないようにします。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 算術計算での Int256 および UInt256 を clang の組み込み型 i256 に置き換え、パフォーマンスを改善しました [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。[#73658](https://github.com/ClickHouse/ClickHouse/pull/73658)（[李扬](https://github.com/taiyang-li)）。
* 一部のケース（例: 空の配列カラム）では、データパーツに空ファイルが含まれることがあります。テーブルがメタデータとオブジェクトストレージが分離されたディスク上に存在する場合、そのようなファイルについては空の BLOB を ObjectStorage に書き込むのをスキップし、メタデータのみを保存するようにしました。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860)（[Alexander Gololobov](https://github.com/davenger)）。
* Decimal32/Decimal64/DateTime64 に対する min/max のパフォーマンスを改善しました。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570)（[李扬](https://github.com/taiyang-li)）。
* クエリコンパイル（`compile_expressions` 設定）はマシンタイプを考慮するようになりました。これにより、そのようなクエリが大幅に高速化されます。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753)（[ZhangLiStar](https://github.com/zhanglistar)）。
* `arraySort` を最適化しました。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850)（[李扬](https://github.com/taiyang-li)）。
* マージなど、キャッシュが受動的に使用される場合には `filesystem_cache_prefer_bigger_buffer_size` を無効化しました。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* コードの一部に `preserve_most` 属性を適用し、わずかに良いコード生成を可能にしました。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778)（[Nikita Taranov](https://github.com/nickitat)）。
* ClickHouse サーバのシャットダウンを高速化しました（2.5 秒の遅延を解消）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550)（[Azat Khuzhin](https://github.com/azat)）。
* ReadBufferFromS3 およびその他のリモート読み取りバッファで過剰なメモリアロケーションを避け、メモリ消費を半減させました。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692)（[Sema Checherinda](https://github.com/CheSema)）。
* zstd を 1.5.5 から 1.5.7 に更新しました。これにより、いくつかの[パフォーマンス改善](https://github.com/facebook/zstd/releases/tag/v1.5.7)が見込まれます。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* Wide パーツにおける JSON カラムのプリフェッチ時のメモリ使用量を削減しました。これは、ClickHouse Cloud などの共有ストレージ上で ClickHouse を利用する場合に特に有効です。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640)（[Pavel Kruglov](https://github.com/Avogar)）。



#### 改善

* `INTO OUTFILE` と併用される `TRUNCATE` でアトミックな `RENAME` をサポートします。[#70323](https://github.com/ClickHouse/ClickHouse/issues/70323) を解決します。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* `NaN` や `inf` を設定値として浮動小数点型に使用することは、もはやできません。もっとも、そもそも以前から意味のある使い方ではありませんでしたが。 [#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `compatibility` 設定に関わらず、analyzer が無効化されている場合はデフォルトで parallel replicas を無効化します。この動作は、`parallel_replicas_only_with_analyzer` を明示的に `false` に設定することで変更できます。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter))。
* クライアントリクエストのヘッダーから外部 HTTP 認証器へ転送するヘッダーのリストを定義できる機能を追加しました。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* タプル列内のフィールドに対する列名の大文字小文字を区別しないマッチングを考慮するようにしました。 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324) をクローズしました。 [#73780](https://github.com/ClickHouse/ClickHouse/pull/73780) ([李扬](https://github.com/taiyang-li))。
* Gorilla コーデックのパラメータは、今後常に .sql ファイルのテーブルメタデータに保存されるようになりました。これにより、[#70072](https://github.com/ClickHouse/ClickHouse/issues/70072) がクローズされました。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 特定のデータレイク向けにパース機能を強化しました（シーケンス ID のパース：マニフェストファイル内のシーケンス識別子をパースする機能を追加、および Avro メタデータのパース：今後の拡張が容易になるよう Avro メタデータパーサーを再設計）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik))。
* `system.opentelemetry_span_log` のデフォルトの ORDER BY から trace&#95;id を削除しました。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 暗号化（属性 `encrypted_by`）は、任意の設定ファイル（config.xml、users.xml、ネストされた設定ファイル）に適用できるようになりました。以前は、トップレベルの config.xml ファイルに対してのみ機能していました。 [#75911](https://github.com/ClickHouse/ClickHouse/pull/75911)（[Mikhail Gorshkov](https://github.com/mgorshkov)）。
* `system.warnings` テーブルを改善し、追加・更新・削除できる動的な警告メッセージを導入しました。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc)).
* このPRにより、すべての `DROP` 操作を先に記述する必要があるため、クエリ `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES` は実行できなくなります。 [#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit)).
* SYNC REPLICA に対するさまざまな改善（エラーメッセージの改善、テストの強化、サニティチェックの追加）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* Access Denied により S3 へのマルチパートコピーを使用したバックアップが失敗した場合に、適切なフォールバック処理を行うようにしました。異なるクレデンシャルを持つバケット間でバックアップを実行する際、マルチパートコピーが Access Denied エラーを発生させることがあります。 [#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368)).
* `librdkafka`（正直あまり出来の良くないライブラリ）をバージョン 2.8.0 にアップグレードし（とはいえ状況が良くなったわけではありません）、Kafka テーブルのシャットダウン手順を改善することで、テーブル削除やサーバー再起動時の遅延を削減しました。`engine=Kafka` は、テーブルが削除されたときにコンシューマグループを明示的に離脱しなくなりました。代わりに、コンシューマは非アクティブ状態が `session_timeout_ms`（デフォルト: 45 秒）続いた後に自動的にグループから削除されるまで残り続けます。 [#76621](https://github.com/ClickHouse/ClickHouse/pull/76621) ([filimonov](https://github.com/filimonov))。
* S3 リクエスト設定の検証を修正。[#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar))。
* `server_settings` や `settings` のようなシステムテーブルには、便利な `default` 値カラムがあります。同様のカラムを `merge_tree_settings` と `replicated_merge_tree_settings` に追加しました。 [#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie)).
* `CurrentMetrics::QueryPreempted` と同様のロジックを持つ `ProfileEvents::QueryPreempted` を追加しました。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu))。
* 以前は、Replicated データベースでクエリ内に指定された認証情報がログに出力されてしまう場合がありました。この問題は修正されました。これにより次の問題が解決されます: [#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `plain_rewritable disk` に対して ALTER TABLE DROP PARTITION を許可しました。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* Backup/restore 設定 `allow_s3_native_copy` は、現在次の 3 つの値をサポートします: - `False` - S3 ネイティブコピーを使用しません。- `True`（従来のデフォルト）- ClickHouse はまず S3 ネイティブコピーを試行し、失敗した場合は読み取り＋書き込み方式にフォールバックします。- `'auto'`（新しいデフォルト）- ClickHouse はまずソースと宛先のクレデンシャルを比較します。同一であれば、ClickHouse は S3 ネイティブコピーを試行し、その後読み取り＋書き込み方式にフォールバックする場合があります。異なる場合、ClickHouse は最初から読み取り＋書き込み方式を使用します。 [#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* DeltaLake テーブルエンジンの Delta Kernel で、AWS セッショントークンおよび環境変数から取得した認証情報の利用をサポートしました。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* 非同期分散 INSERT の保留中バッチ処理中に発生するハング（例：`No such file or directory` に起因）を修正。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* インデックス解析時の日時変換を改善し、暗黙の Date から DateTime への変換にサチュレーション動作を強制するようにしました。これにより、日時範囲の制限によって生じる可能性があったインデックス解析結果の不正確さが解消されます。これにより [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307) が修正されます。また、デフォルト値である `date_time_overflow_behavior = 'ignore'` の場合の明示的な `toDateTime` 変換も修正しました。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* UUID とテーブル名の競合に起因するさまざまなバグを修正しました（たとえば、`RENAME` と `RESTART REPLICA` の競合を修正します。`SYSTEM RESTART REPLICA` と同時に `RENAME` が実行された場合に、誤ったレプリカを再起動してしまったり、テーブルの一つが `Table X is being restarted` 状態のまま取り残されてしまう可能性があります）。[#76308](https://github.com/ClickHouse/ClickHouse/pull/76308)（[Azat Khuzhin](https://github.com/azat)）。
* async insert を有効にし、かつ `INSERT INTO ... FROM file ...` をブロックサイズが揃っていない状態で実行した際に、最初のブロックサイズが `async_max_size` より小さく、2 番目のブロックサイズが `async_max_size` を超える場合、2 番目のブロックが挿入されず、データが `squashing` に残ったままになるデータ損失の問題を修正しました。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* `system.data_skipping_indices` 内のフィールド名 &#39;marks&#39; を &#39;marks&#95;bytes&#39; に変更しました。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* エビクション処理中に予期しないエラーが発生した場合の動的ファイルシステムキャッシュのリサイズ処理を修正。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列ハッシュにおける `used_flag` の初期化を修正しました。これが原因でサーバーがクラッシュする可能性がありました。[#76580](https://github.com/ClickHouse/ClickHouse/pull/76580)（[Nikita Taranov](https://github.com/nickitat)）。
* プロジェクション内で `defaultProfiles` 関数を呼び出した際に発生する論理エラーを修正。 [#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit))。
* ブラウザ上の Web UI でインタラクティブな Basic 認証を要求しないようにしました。[#76319](https://github.com/ClickHouse/ClickHouse/issues/76319) をクローズしました。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Distributed テーブルから boolean リテラルを選択した際に発生する THERE&#95;IS&#95;NO&#95;COLUMN 例外を修正。 [#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* テーブルディレクトリ内のサブパスは、より洗練された方法で選択されます。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik))。
* サブカラムを含む PK を持つテーブルを `ALTER` した後に発生する `Not found column in block` エラーを修正しました。 [https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 以降では、[https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403) が必要です。 [#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* NULLショートサーキットのパフォーマンステストを追加し、バグを修正。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li)).
* 出力書き込みバッファをファイナライズする前にフラッシュするようにしました。`JSONEachRowWithProgressRowOutputFormat` など一部の出力フォーマットのファイナライズ中に発生していた `LOGICAL_ERROR` を修正しました。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368)).
* MongoDBのバイナリUUIDのサポートを追加（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)） - テーブル関数使用時のMongoDBへのWHERE句プッシュダウンを修正（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)） - MongoDBのバイナリUUIDがClickHouseのUUIDにのみ解釈されるよう、MongoDBとClickHouse間の型マッピングを変更しました。これにより、将来の曖昧さや予期せぬ動作を回避できるはずです。- 後方互換性を維持しつつ、OIDマッピングを修正しました。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* JSON サブカラムの並列プレフィックス逆シリアル化での例外処理を修正しました。 [#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar))。
* 負の整数に対する `lgamma` 関数の動作を修正しました。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 明示的に定義されたプライマリキーに対する逆順キー解析を修正しました。[#76654](https://github.com/ClickHouse/ClickHouse/issues/76654) と類似します。 [#76846](https://github.com/ClickHouse/ClickHouse/pull/76846) ([Amos Bird](https://github.com/amosbird))。
* JSON フォーマットにおける Bool 値の整形表示を修正。 [#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 非同期挿入時のエラーにより JSON 列のロールバックが不正となり、クラッシュする可能性があった問題を修正しました。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前は、`multiIf` が計画段階と実行時で異なる型のカラムを返す場合がありました。結果として、C++ の観点から未定義動作を引き起こすコードが生成されていました。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914)（[Nikita Taranov](https://github.com/nickitat)）。
* MergeTree における定数 Nullable キーの不正なシリアル化を修正しました。これにより [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939) が修正されます。 [#76985](https://github.com/ClickHouse/ClickHouse/pull/76985) ([Amos Bird](https://github.com/amosbird))。
* `BFloat16` 値のソートを修正しました。これにより [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487) がクローズされます。また、[#75669](https://github.com/ClickHouse/ClickHouse/issues/75669) もクローズされます。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Variant サブカラムを持つ JSON のバグを修正しました。part の整合性チェックで一時的なサブカラムをスキップするためのチェックを追加しました。[#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。[#77034](https://github.com/ClickHouse/ClickHouse/pull/77034)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* 型の不一致が発生した場合に Values フォーマットのテンプレート解析がクラッシュする問題を修正。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 主キーにサブカラムを含む EmbeddedRocksDB テーブルを作成できないようにしました。以前はそのようなテーブルを作成できましたが、`SELECT` クエリが失敗していました。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar)).
* リテラルの型を考慮せずに述語をリモート側にプッシュダウンしていたために発生していた、分散クエリでの不正な比較を修正。 [#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94))。
* 例外発生時に Kafka テーブルを作成するとクラッシュする問題を修正しました。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar)).
* Kafka および RabbitMQ エンジンで JSON とサブカラムをサポートしました。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS における例外スタックのアンワインド処理を修正。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* getSubcolumn 関数での&#39;null&#39;サブカラムの読み取り処理を修正。 [#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar)).
* Array および未対応の関数での Bloom filter インデックスを修正。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル数に関する制限のチェックは、最初の CREATE クエリ実行時にのみ行うようにしました。 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique))。
* バグではありません: `SELECT toBFloat16(-0.0) == toBFloat16(0.0)` は、以前は `false` を返していましたが、現在は正しく `true` を返します。これにより、`Float32` および `Float64` の挙動と一貫性が取れるようになりました。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 初期化されていない `key_index` 変数への誤っている可能性のある参照を修正しました。これはデバッグビルドではクラッシュを引き起こす可能性があります（リリースビルドでは、その後のコードがエラーをスローする可能性が高いため、この未初期化参照が問題を引き起こすことはありません）。### ユーザー向け変更点のドキュメントエントリ。[#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear))。
* Bool 値を持つパーティション名を修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) で不具合が生じていました。 [#77319](https://github.com/ClickHouse/ClickHouse/pull/77319) ([Pavel Kruglov](https://github.com/Avogar)).
* Nullable な要素を含むタプルと文字列の比較を修正しました。たとえば、この変更以前は、タプル `(1, null)` と文字列 `'(1,null)'` の比較はエラーになっていました。別の例としては、タプル `(1, a)`（ここで `a` は Nullable 型の列）と文字列 `'(1, 2)'` の比較が挙げられます。この変更により、これらの問題が解消されています。 [#77323](https://github.com/ClickHouse/ClickHouse/pull/77323) ([Alexey Katsman](https://github.com/alexkats)).
* ObjectStorageQueueSource のクラッシュを修正しました。[https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) で導入された不具合です。[#77325](https://github.com/ClickHouse/ClickHouse/pull/77325) ([Pavel Kruglov](https://github.com/Avogar))。
* `input` 使用時の `async_insert` を修正。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修正: ソート列がプランナーによって削除された場合に、`WITH FILL` が NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK エラーで失敗する可能性がある問題を修正しました。INTERPOLATE 式に対して計算される DAG が不整合になることに関連する、同様の問題も修正しました。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 無効な AST ノードにエイリアスを設定する際に発生していた複数の LOGICAL&#95;ERROR を修正。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルシステムキャッシュの実装において、ファイルセグメント書き込み時のエラー処理を修正しました。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DatabaseIceberg がカタログから提供された正しいメタデータファイルを使用するように修正しました。 [#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) をクローズ。 [#77486](https://github.com/ClickHouse/ClickHouse/pull/77486) ([Kseniia Sumarokova](https://github.com/kssenii))。
* クエリキャッシュは、UDF が非決定的であると見なすようになりました。これに伴い、UDF を含むクエリの結果はキャッシュされなくなりました。以前は、非決定的でありながら結果が誤ってキャッシュされてしまう UDF をユーザーが定義できていました（issue [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `enable_filesystem_cache_log` 設定が有効な場合にしか動作していなかった system.filesystem&#95;cache&#95;log の問題を修正。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* projection 内で `defaultRoles` 関数を呼び出した際に発生する論理エラーを修正しました。 [#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) のフォローアップです。 [#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* `arrayResize` 関数の第 2 引数を `Nullable` 型にすることは、現在は許可されていません。以前は、第 2 引数が `Nullable` の場合、エラーが発生したり誤った結果が返されたりするなど、さまざまな問題が起こり得ました（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 書き込み対象のブロックが生成されない場合でも、マージおよびミューテーションがキャンセルされたかどうかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).

#### ビルド/テスト/パッケージングの改善

- `clickhouse-odbc-bridge`と`clickhouse-library-bridge`を別リポジトリ https://github.com/ClickHouse/odbc-bridge/ に移動しました。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- Rustのクロスコンパイルを修正し、Rustを完全に無効化できるようにしました。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouseリリース 25.2、2025-02-27 {#252}

#### 後方互換性のない変更

- `async_load_databases`をデフォルトで完全に有効化しました(`config.xml`をアップグレードしないインストール環境でも有効)。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat))。
- `JSONCompactEachRowWithProgress`および`JSONCompactStringsEachRowWithProgress`フォーマットを追加しました。[#69989](https://github.com/ClickHouse/ClickHouse/issues/69989)の続きです。`JSONCompactWithNames`と`JSONCompactWithNamesAndTypes`は「totals」を出力しなくなりました - これは実装上の誤りであったと考えられます。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
- ALTERコマンドリストの曖昧さを解消するため、`format_alter_operations_with_parentheses`のデフォルト値をtrueに変更しました(https://github.com/ClickHouse/ClickHouse/pull/59532 を参照)。これにより24.3より前のクラスタとのレプリケーションが機能しなくなります。古いリリースを使用しているクラスタをアップグレードする場合は、サーバー設定でこの設定を無効にするか、まず24.3にアップグレードしてください。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano))。
- 正規表現を使用したログメッセージのフィルタリング機能を削除しました。この実装はデータ競合を引き起こしていたため、削除する必要がありました。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
- 設定`min_chunk_bytes_for_parallel_parsing`はゼロに設定できなくなりました。これにより[#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)が修正されます。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
- キャッシュ設定内の設定値を検証するようにしました。以前は存在しない設定は無視されていましたが、現在はエラーが発生するため、削除する必要があります。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii))。


#### 新機能
* `Nullable(JSON)` 型をサポートしました。[#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar)).
* DEFAULT および MATERIALIZED 式でのサブカラムをサポートしました。[#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar)).
* `output_format_parquet_write_bloom_filter` 設定（デフォルトで有効）を使用した Parquet Bloom フィルターの書き込みをサポートしました。[#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321)).
* Web UI にインタラクティブなデータベースナビゲーションが追加されました。[#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ストレージポリシー内で、読み取り専用ディスクと読み書き可能ディスクの組み合わせ（複数ボリュームまたは複数ディスクとして構成）を許可しました。これにより、データはボリューム全体から読み取ることができ、挿入は書き込み可能ディスクが優先されます（Copy-on-Write ストレージポリシー）。[#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat)).
* 新しい Database エンジン `DatabaseBackup` を追加しました。これにより、バックアップからテーブル／データベースを即座に ATTACH できます。[#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal)).
* Postgres ワイヤプロトコルでの prepared statement をサポートしました。[#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12)).
* データベースレイヤーなしでテーブルを ATTACH できるようにしました。これは、Web、S3 などの外部仮想ファイルシステム上にある MergeTree テーブルに対して有用です。[#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat)).
* 新しい文字列比較関数 `compareSubstrings` を追加し、2 つの文字列の一部を比較できるようにしました。例: `SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` は「1 番目の文字列のオフセット 0 から、2 番目の文字列のオフセット 5 から、それぞれ 6 バイト分の 'Saxon' と 'Anglo-Saxon' を辞書順で比較する」という意味です。[#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい関数 `initialQueryStartTime` を追加しました。現在のクエリの開始時刻を返します。分散クエリ時には、すべてのシャードで同じ値になります。[#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik)).
* MySQL 向けに、名前付きコレクションを用いた SSL 認証をサポートしました。[#59111](https://github.com/ClickHouse/ClickHouse/issues/59111) を解決します。[#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 実験的機能
* 新しい設定 `enable_adaptive_memory_spill_scheduler` を追加しました。同一クエリ内の複数の Grace JOIN が合計メモリ使用量を監視し、MEMORY_LIMIT_EXCEEDED を防ぐために外部ストレージへのスピルを自動的にトリガーできるようにします。[#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい実験的な `Kafka` テーブルエンジンが Keeper のフィーチャーフラグに完全に従うようにしました。[#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ライセンス上の問題により v24.10 で削除されていた (Intel) QPL コーデックを復元しました。[#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* HDFS 連携向けに、`dfs.client.use.datanode.hostname` 設定項目のサポートを追加しました。[#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).



#### パフォーマンスの改善
* S3 上の Wide パーツにおける JSON カラム全体の読み取りパフォーマンスを向上しました。これは、サブカラム・プレフィックスのデシリアライズに対するプリフェッチの追加、デシリアライズ済みプレフィックスのキャッシュ、およびサブカラム・プレフィックスの並列デシリアライズによって実現しています。これにより、`SELECT data FROM table` のようなクエリで S3 からの JSON カラムの読み取りが 4 倍、`SELECT data FROM table LIMIT 10` のようなクエリではおよそ 10 倍高速になります。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827) ([Pavel Kruglov](https://github.com/Avogar)).
* `max_rows_in_join = max_bytes_in_join = 0` の場合に `parallel_hash` で発生していた不要な競合を修正しました。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155) ([Nikita Taranov](https://github.com/nickitat)).
* オプティマイザにより結合の左右が入れ替えられた場合に、`ConcurrentHashJoin` で発生していた二重の事前確保を修正しました。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149) ([Nikita Taranov](https://github.com/nickitat)).
* いくつかの JOIN シナリオでの軽微な改善: 出力行数をあらかじめ計算し、それに対してメモリを予約するようにしました。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376) ([Alexander Gololobov](https://github.com/davenger)).
* `WHERE a < b AND b < c AND c < 5` のようなクエリに対して、新たな比較条件（`a < 5 AND b < 5`）を推論して、フィルタリング性能を向上できるようにしました。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の改善: パフォーマンス向上のため、インメモリストレージにコミットする際のダイジェスト計算を無効化しました。これは `keeper_server.digest_enabled_on_commit` 設定で有効化できます。リクエストを前処理する際には引き続きダイジェストが計算されます。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490) ([Antonio Andelic](https://github.com/antonio2368)).
* 可能な場合、JOIN の ON 句からフィルタ式をプッシュダウンするようにしました。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTree において、カラムとインデックスのサイズを遅延的に計算するようにしました。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938) ([Pavel Kruglov](https://github.com/Avogar)).
* `MATERIALIZE TTL` 時に `ttl_only_drop_parts` を再び尊重するようにしました。TTL を再計算してパーツを削除するために必要なカラムのみを読み取り、それらを空のパーツと置き換えることで削除します。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751) ([Andrey Zvonov](https://github.com/zvonand)).
* `plain_rewritable` メタデータファイルの書き込みバッファサイズを削減しました。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758) ([Julia Kartseva](https://github.com/jkartseva)).
* 一部のウィンドウ関数におけるメモリ使用量を削減しました。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647) ([lgbo](https://github.com/lgbo-ustc)).
* Parquet の bloom filter と min/max インデックスを併用して評価するようにしました。これは、`data = [1, 2, 4, 5]` のデータに対する `x = 3 or x > 5` のようなケースを正しくサポートするために必要です。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383) ([Arthur Passos](https://github.com/arthurpassos)).
* `Executable` ストレージに渡されるクエリは、もはやシングルスレッド実行に限定されません。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084) ([yawnt](https://github.com/yawnt)).
* ALTER TABLE FETCH PARTITION でパーツを並列にフェッチするようにしました（スレッドプールのサイズは `max_fetch_partition_thread_pool_size` で制御されます）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978) ([Azat Khuzhin](https://github.com/azat)).
* `indexHint` 関数を使用した述語を `PREWHERE` に移動できるようにしました。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987) ([Anton Popov](https://github.com/CurtizJ)).



#### 改善

* `LowCardinality` カラムのメモリ使用量の計算を修正しました。 [#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat))。
* `processors_profile_log` テーブルに、TTL が 30 日のデフォルト構成が追加されました。 [#66139](https://github.com/ClickHouse/ClickHouse/pull/66139) ([Ilya Yatsishin](https://github.com/qoega))。
* クラスタ設定でシャードに名前を指定できるようにしました。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* Prometheus の remote write レスポンスの成功ステータスコードを 200/OK から 204/NoContent に変更しました。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* サーバーを再起動することなく、その場で `max_remote_read_network_bandwidth_for_serve` および `max_remote_write_network_bandwidth_for_server` を再読み込みできるようにしました。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* バックアップ作成時にチェックサムの計算に blob パスを使用できるようにしました。 [#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.query_cache` にクエリ ID 列を追加しました（[#68205](https://github.com/ClickHouse/ClickHouse/issues/68205) を解決）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* `ALTER TABLE ... FREEZE ...` クエリは、`KILL QUERY` によって、またはタイムアウト（`max_execution_time`）に達した場合に自動的にキャンセルできるようになりました。 [#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar))。
* `groupUniqArrayArrayMap` を `SimpleAggregateFunction` としてサポートする機能を追加しました。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* データベースエンジン `Iceberg` においてカタログ認証情報の設定を非表示にしました。[#74559](https://github.com/ClickHouse/ClickHouse/issues/74559) をクローズ。[#75080](https://github.com/ClickHouse/ClickHouse/pull/75080)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `intExp2` / `intExp10`: これまで未定義だった動作を定義しました。引数が小さすぎる場合は 0 を返し、大きすぎる場合は `18446744073709551615` を返し、`nan` の場合は例外をスローします。 [#75312](https://github.com/ClickHouse/ClickHouse/pull/75312) ([Vitaly Baranov](https://github.com/vitlibar)).
* `DatabaseIceberg` のカタログ設定で `s3.endpoint` をネイティブにサポートしました。 [#74558](https://github.com/ClickHouse/ClickHouse/issues/74558) をクローズしました。 [#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ユーザーが `SYSTEM DROP REPLICA` を実行する際に十分な権限を持っていない場合、エラーを報告せずに失敗しないようにしました。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc)).
* いずれかの system ログでフラッシュが失敗した回数を示す ProfileEvent を追加。 [#75466](https://github.com/ClickHouse/ClickHouse/pull/75466) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 復号および解凍処理に対するチェックと追加のログ出力を追加しました。 [#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* `parseTimeDelta` 関数でマイクロ記号 (U+00B5) をサポートしました。これにより、マイクロ記号 (U+00B5) とギリシャ文字のミュー (U+03BC) の両方がマイクロ秒を表す有効な表現として認識されるようになり、ClickHouse の動作が Go の実装（[time.go を参照](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) および [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）と一致するようになりました。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472) ([Vitaly Orlov](https://github.com/orloffv))。
* サーバー設定（`send_settings_to_client`）を、クライアント側コード（例: INSERT データのパースやクエリ出力のフォーマット）がサーバーの `users.xml` とユーザープロファイルの設定を使用するかどうかを制御するクライアント設定（`apply_settings_from_server`）に置き換えました。これを無効にした場合、クライアントのコマンドライン、セッション、およびクエリからの設定のみが使用されます。これはネイティブクライアントにのみ適用され（HTTP などには適用されず）、クエリ処理の大部分（サーバー側で行われる処理）には適用されない点に注意してください。 [#75478](https://github.com/ClickHouse/ClickHouse/pull/75478) ([Michael Kolupaev](https://github.com/al13n321)).
* 構文エラー時のエラーメッセージを改善しました。以前は、クエリが大きすぎて、長さが制限を超えるトークンが非常に長い文字列リテラルだった場合、その理由を示すメッセージが、この非常に長いトークンの 2 つの例にはさまれて途中で失われていました。エラーメッセージ内で UTF-8 を含むクエリが不正に途中で切り詰められる問題を修正しました。クエリ断片に対する過剰な引用符付けを修正しました。この変更は [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473) をクローズします。[#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3(Azure)Queue` に profile events を追加しました。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 互換性維持のため、`send_settings_to_client=false` によりサーバーからクライアントへの設定送信を無効化しました（この機能は利便性向上のため、後にクライアント側の設定として再実装される予定です）。[#75648](https://github.com/ClickHouse/ClickHouse/pull/75648)（[Michael Kolupaev](https://github.com/al13n321)）。
* バックグラウンドスレッドで定期的に読み取られる複数のソースからの情報に基づいて内部メモリトラッカーを補正できるようにする設定 `memory_worker_correct_memory_tracker` を追加しました。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368)).
* `system.processes` に列 `normalized_query_hash` を追加しました。注記: これは `normalizedQueryHash` 関数を用いてその場で容易に計算できますが、今後の変更に備えるために必要です。 [#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `system.tables` をクエリしても、もはや存在しないデータベース上に作成された `Merge` テーブルがあっても例外はスローされません。複雑な処理は許可していないため、`Hive` テーブルからは `getTotalRows` メソッドを削除しました。 [#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* バックアップの start&#95;time/end&#95;time をマイクロ秒精度で保存。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* RSS による補正が行われていない内部グローバルメモリトラッカーの値を示す `MemoryTrackingUncorrected` メトリクスを追加しました。 [#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368)).
* `PostgreSQL` や `MySQL` テーブル関数で `localhost:1234/handle` のようなエンドポイントをパースできるようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) で導入されたリグレッションバグが修正されました。 [#75944](https://github.com/ClickHouse/ClickHouse/pull/75944)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* サーバー設定 `throw_on_unknown_workload` を追加しました。この設定により、`workload` 設定に未知の値が指定されたクエリに対する動作を選択できます。アクセスを無制限に許可する（デフォルト）か、`RESOURCE_ACCESS_DENIED` エラーをスローするかを選択可能です。これは、すべてのクエリで workload スケジューリングの使用を強制したい場合に有用です。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa)).
* 不要な場合は、`ARRAY JOIN` 内のサブカラムを `getSubcolumn` に書き換えないようにします。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル読み込み時のリトライ調整エラーを修正。 [#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `SYSTEM FLUSH LOGS` で個別のログをフラッシュできるようにしました。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano))。
* `/binary` サーバーのページを改善しました。Morton 曲線の代わりに Hilbert 曲線を使用します。正方形内に 512 MB 分のアドレスを表示し、正方形をよりよく埋めるようにしました（以前のバージョンでは、アドレスは正方形の半分しか埋めていませんでした）。関数名ではなくライブラリ名に基づいてアドレスに色を付けます。エリアの外側にも少し多めにスクロールできるようにしました。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES が発生した場合に ON CLUSTER クエリを再試行するようにしました。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* サーバーの相対的なCPU不足度合いを算出する非同期メトリクス `CPUOverload` を追加しました。 [#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `output_format_pretty_max_rows` のデフォルト値を 10000 から 1000 に変更しました。使い勝手の観点から、このほうが望ましいと考えています。 [#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov))。





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* クエリ解釈中に例外が発生した場合、その書式がクエリで指定されたカスタムフォーマットで行われるように修正しました。以前のバージョンでは、クエリで指定されたフォーマットではなくデフォルトフォーマットで例外が整形されていました。この修正により [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422) がクローズされました。[#74994](https://github.com/ClickHouse/ClickHouse/pull/74994)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SQLite の型マッピングを修正（整数型が `int64` に、浮動小数点型が `float64` にマップされるように変更）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x))。
* 親スコープからの識別子解決を修正し、`WITH`句内で式に対するエイリアスを使用できるようにしました。[#58994](https://github.com/ClickHouse/ClickHouse/issues/58994)を修正。[#62946](https://github.com/ClickHouse/ClickHouse/issues/62946)を修正。[#63239](https://github.com/ClickHouse/ClickHouse/issues/63239)を修正。[#65233](https://github.com/ClickHouse/ClickHouse/issues/65233)を修正。[#71659](https://github.com/ClickHouse/ClickHouse/issues/71659)を修正。[#71828](https://github.com/ClickHouse/ClickHouse/issues/71828)を修正。[#68749](https://github.com/ClickHouse/ClickHouse/issues/68749)を修正。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* `negate` 関数の単調性を修正しました。以前のバージョンでは `x` が主キーである場合、クエリ `select * from a where -x = -42;` が誤った結果を返すことがありました。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321)).
* arrayIntersect における空タプルの処理を修正しました。これにより [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578) が解決します。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 誤ったプレフィックスを持つ JSON サブオブジェクトのサブカラムの読み取りを修正。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* クライアント・サーバー間の通信で Native フォーマットの設定が正しく伝播されるようにしました。 [#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部のストレージで未サポートの型をチェックするようにしました。 [#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS 上で、PostgreSQL インターフェイス経由で実行した `INSERT INTO SELECT` クエリにより発生するクラッシュを修正（issue [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* レプリケーテッドデータベースにおける未初期化の `max_log_ptr` を修正しました。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov))。
* interval 挿入時に発生するクラッシュを修正（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 定数 JSON リテラルの整形を修正しました。以前は、クエリを別のサーバーに送信する際に構文エラーを引き起こす可能性がありました。 [#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 定数のパーティション式を使用し、暗黙的プロジェクションが有効な場合に `CREATE` クエリが正しく動作しなくなる問題を修正しました。これにより [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596) が修正されます。 [#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird))。
* INSERT が例外で終了した場合に接続が壊れた状態のまま残らないようにしました。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 中間状態のまま残された接続を再利用しないようにしました。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat)).
* 型名が大文字でない場合に、JSON 型宣言の構文解析中に発生するクラッシュを修正。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar))。
* Keeper: 接続確立前に切断された場合に発生する logical&#95;error を修正。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* `AzureBlobStorage` を使用しているテーブルがある場合にサーバーが起動できなくなる問題を修正しました。テーブルは Azure へのリクエストを行わずにロードされるようになりました。 [#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* BACKUP および RESTORE 操作に対する `query_log` で欠落していた `used_privileges` および `missing_privileges` フィールドを修正しました。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* HDFS の SELECT リクエスト中に SASL エラーが発生した場合に KRB チケットをリフレッシュするようにしました。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* startup&#95;scripts 内で Replicated データベースに対して行われるクエリを修正。[#74942](https://github.com/ClickHouse/ClickHouse/pull/74942)（[Azat Khuzhin](https://github.com/azat)）。
* NULL セーフ比較が使用されている場合に、JOIN の ON 句で型エイリアスが定義された式に関する不具合を修正しました。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 削除操作が失敗した場合に、パーツの状態を deleting から outdated に戻すようにしました。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema))。
* 以前のバージョンでは、スカラーサブクエリがある場合、データフォーマットの初期化中（HTTP ヘッダーが書き込まれる前）に、サブクエリの処理で蓄積された progress の書き込みを開始していました。これにより、X-ClickHouse-QueryId や X-ClickHouse-Format、Content-Type といった HTTP ヘッダーが失われてしまう問題がありました。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `database_replicated_allow_replicated_engine_arguments=0` の場合における `CREATE TABLE AS...` クエリを修正。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc))。
* INSERT 例外発生後にクライアント側で接続が不正な状態のまま残ってしまう問題を修正しました。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat))。
* PSQL レプリケーションでキャッチされない例外により発生するクラッシュを修正。 [#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat))。
* SASL は任意の RPC 呼び出しを失敗させる可能性があり、この修正により、krb5 チケットの有効期限が切れている場合に呼び出しを再試行できるようになります。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* `optimize_function_to_subcolumns` 設定が有効な場合の `Array`、`Map`、`Nullable(..)` 列に対するプライマリおよびセカンダリインデックスの利用が正しく行われるよう修正しました。以前は、これらの列に対するインデックスが無視されてしまう場合がありました。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 内部テーブルを使用してマテリアライズドビューを作成する際には、`flatten_nested` を無効にしてください。そのようにフラット化された列は使用できなくなるためです。 [#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm))。
* 一部の IPv6 アドレス（::ffff:1.1.1.1 など）が `forwarded_for` フィールド内で誤って解釈され、その結果クライアントが例外を伴って切断される問題を修正しました。 [#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* LowCardinality の nullable データ型に対する nullsafe JOIN の処理を修正しました。これまで、`IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b` のような nullsafe な比較を用いた JOIN ON 句は、LowCardinality 列に対して正しく動作していませんでした。 [#75143](https://github.com/ClickHouse/ClickHouse/pull/75143) ([Vladimir Cherkasov](https://github.com/vdimir)).
* NumRowsCache の total&#95;number&#95;of&#95;rows をカウントする際に key&#95;condition が指定されないようにチェックします。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 新しいアナライザーを使用して、未使用の補間があるクエリを修正しました。[#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* CTE と INSERT の組み合わせによって発生するクラッシュバグを修正。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の修正: ログのロールバック時に破損した変更ログに書き込まないようにしました。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 適切な箇所で `BFloat16` をスーパータイプとして使用するようにしました。これにより次の issue がクローズされました: [#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `any_join_distinct_right_table_keys` と `JOIN ON` 句における `OR` 条件の組み合わせによって結合結果に発生していた、想定外のデフォルト値を修正しました。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* azureblobstorage テーブルエンジンの認証情報をマスクするようにしました。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* ClickHouse が PostgreSQL、MySQL、SQLite などの外部データベースに対して誤ってフィルタープッシュダウンを行ってしまう可能性がある問題を修正しました。これにより issue [#71423](https://github.com/ClickHouse/ClickHouse/issues/71423) がクローズされました。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Protobuf 形式での出力中に、並列クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` 実行時に発生する可能性のある Protobuf スキーマキャッシュのクラッシュを修正しました。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* `HAVING` 句のフィルタが並列レプリカでプッシュダウンされる際に発生しうる論理エラーや未初期化メモリの問題を修正。 [#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `icebergS3`、`icebergAzure` テーブル関数およびテーブルエンジンで機密情報が表示されないようにしました。 [#75378](https://github.com/ClickHouse/ClickHouse/pull/75378) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 計算によって決定され、その結果が空文字列となるトリム文字を指定した関数 `TRIM` が正しく処理されるようになりました。例: `SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* IOutputFormat のデータレースを修正。[#75448](https://github.com/ClickHouse/ClickHouse/pull/75448)（[Pavel Kruglov](https://github.com/Avogar)）。
* 分散テーブル上での JOIN で Array 型の JSON サブカラムが使用されている場合に発生する可能性のある `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes` エラーを修正しました。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* `CODEC(ZSTD, DoubleDelta)` 使用時に発生するデータ破損を修正。 [#70031](https://github.com/ClickHouse/ClickHouse/issues/70031) をクローズ。 [#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* allow&#95;feature&#95;tier と compatibility&#95;mergetree 設定の相互作用を修正。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルが再試行された場合に、system.s3queue&#95;log における誤っていた processed&#95;rows の値を修正しました。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* URL エンジンへの書き込みを行うマテリアライズドビューで接続の問題が発生した場合に、`materialized_views_ignore_errors` 設定が正しく適用されるようにしました。 [#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm))。
* 異なる型の列間で `alter_sync = 0` を指定した複数の非同期 `RENAME` クエリが実行された後に、`MergeTree` テーブルからの読み込み時にまれに発生していたクラッシュを修正しました。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ))。
* 一部の `UNION ALL` を含むクエリで `Block structure mismatch in QueryPipeline stream` エラーが発生する問題を修正しました。[#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* PK 列を `ALTER MODIFY` した際に、対応するプロジェクションを再構築するようになりました。以前は、プロジェクションの PK に使用されている列を `ALTER MODIFY` した後に `SELECT` を実行すると、`CANNOT_READ_ALL_DATA` エラーが発生する可能性がありました。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* スカラーサブクエリに対する `ARRAY JOIN` の誤った結果を修正（analyzer 使用時）。[#75732](https://github.com/ClickHouse/ClickHouse/pull/75732)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `DistinctSortedStreamTransform` におけるヌルポインタの逆参照を修正しました。 [#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* `allow_suspicious_ttl_expressions` の動作を修正。[#75771](https://github.com/ClickHouse/ClickHouse/pull/75771) ([Aleksei Filatov](https://github.com/aalexfvk))。
* 関数 `translate` における未初期化メモリの読み取りを修正しました。これにより [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592) が解決されます。[#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Native 形式で JSON を文字列として出力する際にも、フォーマット設定が反映されるようにしました。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定変更履歴に、v24.12 における並列ハッシュ結合アルゴリズムのデフォルト有効化を記録しました。これは、互換性レベルが v24.12 より古いバージョンに設定されている場合、ClickHouse は引き続き非並列ハッシュ結合を使用して結合を行うことを意味します。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze))。
* 暗黙的に追加された min-max インデックスを持つテーブルを新しいテーブルにコピーできない不具合を修正しました（issue [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` はファイルシステムから任意のライブラリを開くことができるため、分離された環境内でのみ安全に実行できます。`clickhouse-server` の近傍で実行される場合の脆弱性を防ぐため、ライブラリのパスを設定で指定された場所にあるものに制限します。この脆弱性は、**Arseniy Dugin** によって [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) を通じて発見されました。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 一部のメタデータで JSON シリアル化を使用していましたが、これは誤りでした。JSON は、ゼロバイトを含む文字列リテラル内のバイナリデータをサポートしないためです。SQL クエリにはバイナリデータや不正な UTF-8 が含まれ得るため、メタデータファイルでもこれをサポートする必要があります。同時に、ClickHouse の `JSONEachRow` などのフォーマットは、バイナリデータの完全なラウンドトリップ（往復互換性）を優先して JSON 標準からあえて外れることで、この問題を回避しています。動機の詳細はここを参照してください: [https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解決策は、`Poco::JSON` ライブラリを ClickHouse の JSON 形式におけるシリアル化と整合させることです。これにより [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668) が解決されます。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3Queue` のコミット制限チェックを修正しました。 [#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 自動生成インデックス（`add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns`）付きの MergeTree テーブルのアタッチ処理を修正しました。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* ジョブの親スレッドのスタックトレース（`enable_job_stack_trace` 設定）が出力されない問題を修正しました。`enable_job_stack_trace` 設定がスレッドに正しく伝播されず、その結果スタックトレースの内容が常にこの設定に従うとは限らない問題を修正しました。 [#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `ALTER RENAME` に対して誤った権限チェックが行われており、`CREATE USER` 権限が必要になっていた問題を修正。[#74372](https://github.com/ClickHouse/ClickHouse/issues/74372) をクローズ。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* FixedString を使用した reinterpretAs がビッグエンディアンアーキテクチャで正しく動作しない問題を修正しました。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* S3Queue における論理エラー「Expected current processor {} to be equal to {} for bucket {}」を修正しました。 [#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Memory データベースでの ALTER 時に発生するデッドロックを修正しました。[#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句の条件に `pointInPolygon` 関数が含まれている場合のインデックス解析における論理エラーを修正しました。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* シグナルハンドラ内の潜在的に安全でない呼び出しを修正。 [#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* PartsSplitter における reverse key のサポートを修正しました。これにより [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400) の問題が解決されます。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。

#### ビルド/テスト/パッケージングの改善

- ARMおよびIntel MacでのHDFSビルドをサポート。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
- Darwin向けクロスコンパイル時にICUとGRPCを有効化。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
- 組み込みLLVMを19に更新。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
- Dockerイメージ内のデフォルトユーザーのネットワークアクセスを無効化。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。すべてのclickhouse-server関連のアクションを関数化し、`entrypoint.sh`でデフォルトバイナリを起動する際にのみ実行するように変更。この長らく延期されていた改善は[#50724](https://github.com/ClickHouse/ClickHouse/issues/50724)で提案されていました。`clickhouse-extract-from-config`に`--users`スイッチを追加し、`users.xml`から値を取得できるようにしました。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
- バイナリから約20MBのデッドコードを削除。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouse リリース 25.1, 2025-01-28 {#251}


#### 後方互換性のない変更
* `JSONEachRowWithProgress` は、進捗が発生するたびに進捗情報を書き出すようになりました。以前のバージョンでは、結果の各ブロックの後にのみ進捗が表示されており、実質的に役に立ちませんでした。進捗の表示方法を変更し、ゼロ値は表示しないようにしました。これにより [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800) がクローズされました。 [#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` テーブルは、基になるテーブルの構造を、そのカラムの和集合を取り、共通の型を導出することで統一するようになりました。これにより [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864) がクローズされました。場合によっては、この変更は後方互換性がない可能性があります。一例として、テーブル間に共通の型が存在しないものの、最初のテーブルの型への変換は可能なケースが挙げられます（UInt64 と Int64、または任意の数値型と String など）。旧挙動に戻したい場合は、`merge_table_max_tables_to_look_for_schema_inference` を `1` に設定するか、`compatibility` を `24.12` 以前に設定してください。 [#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 出力フォーマットは、これまでのように生の数値としてではなく、Date および DateTime カラムを Parquet がサポートする日付/時刻型に変換して書き出すようになりました。`DateTime` は `DateTime64(3)`（以前は `UInt32`）になります。設定 `output_format_parquet_datetime_as_uint32` を有効にすると、従来の挙動に戻せます。`Date` は `Date32`（以前は `UInt16`）になります。 [#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* 既定では、`ORDER BY` 句および `less/greater/equal/etc` といった比較関数で、`JSON` / `Object` / `AggregateFunction` のような比較不可能な型を使用できないようにしました。 [#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 廃止されていた `MaterializedMySQL` データベースエンジンは削除され、利用できなくなりました。 [#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` dictionary ソースは、もはや `SHOW TABLE STATUS` クエリを実行しなくなりました。これは、最近の MySQL バージョンにおいて、InnoDB テーブルに対してこのクエリが有用な情報を提供しないためです。これにより [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636) がクローズされました。この変更は後方互換性がありますが、変更に気付けるようにこのカテゴリに含めています。 [#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` クエリには、新たに `CHECK` 権限が必要になりました。以前のバージョンでは、これらのクエリを実行するには `SHOW TABLES` 権限だけで十分でした。しかし、`CHECK TABLE` クエリは重くなり得るうえ、`SELECT` クエリに適用される通常のクエリ複雑性制限が適用されません。その結果、DoS の可能性がありました。 [#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 関数 `h3ToGeo()` は、結果を（幾何関数における標準の順序である）`(lat, lon)` の順序で返すようになりました。従来の `(lon, lat)` の順序での結果を維持したいユーザーは、設定 `h3togeo_lon_lat_result_order = true` を有効にできます。 [#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新しい MongoDB ドライバーがデフォルトになりました。従来のドライバーの使用を継続したいユーザーは、サーバー設定 `use_legacy_mongodb_integration` を true に設定できます。 [#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。



#### 新機能

* `SELECT` クエリ送信直後から、その実行時に、未完了（バックグラウンドプロセスによってまだマテリアライズされていない）な mutation を即座に適用できるようになりました。この機能は `apply_mutations_on_fly` を有効にすることで使用できます。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* Iceberg の時間関連変換によるパーティション操作に対して、Iceberg テーブルのパーティションプルーニングを実装しました。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik))。
* MergeTree のソートキーおよびスキップインデックスでサブカラムをサポートしました。 [#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* `Apache Arrow`/`Parquet`/`ORC` からの `HALF_FLOAT` 値の読み取りをサポートしました（`Float32` として読み込みます）。これにより [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960) がクローズされます。IEEE-754 の half-precision 浮動小数点数は `BFloat16` と同じではないことに注意してください。[#73835](https://github.com/ClickHouse/ClickHouse/issues/73835) をクローズします。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` テーブルに、シンボル化されたスタックトレースを含む新しい列 `symbols` と `lines` が 2 つ追加されます。これにより、プロファイル情報の収集およびエクスポートが容易になります。これはサーバー設定の `trace_log` セクション内にある `symbolize` 設定値によって制御され、デフォルトで有効になっています。 [#73896](https://github.com/ClickHouse/ClickHouse/pull/73896) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* テーブルで自動インクリメントの番号を生成するために使用できる新しい関数 `generateSerialID` を追加しました。[kazalika](https://github.com/kazalika) による [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) の続きです。これにより [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485) がクローズされます。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* DDL クエリ向けに、構文 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN` を追加しました。これは、副クエリ `{query1, query2, ... queryN}` を互いに並列で実行できる（かつ、その方が望ましい）ことを意味します。[#73983](https://github.com/ClickHouse/ClickHouse/pull/73983)（[Vitaly Baranov](https://github.com/vitlibar)）。
* デシリアライズ済みのスキッピングインデックスグラニュール用にインメモリキャッシュを追加しました。これにより、スキッピングインデックスを使用する繰り返し実行されるクエリが高速化されるはずです。新しいキャッシュのサイズは、サーバー設定 `skipping_index_cache_size` と `skipping_index_cache_max_entries` によって制御されます。このキャッシュ導入の主な動機はベクトル類似性インデックスであり、今回の変更によってこれらは大幅に高速化されました。 [#70102](https://github.com/ClickHouse/ClickHouse/pull/70102) ([Robert Schulze](https://github.com/rschu1ze)).
* これにより、組み込みの Web UI はクエリ実行中に進行状況バーを表示するようになりました。クエリをキャンセルできます。合計レコード数と、処理速度に関する詳細な情報を表示します。データが到着するとすぐに、テーブルを段階的にレンダリングできます。HTTP 圧縮が有効になりました。テーブルのレンダリングがより高速になりました。テーブルヘッダーが固定表示（スティッキー）になりました。セルの選択と、矢印キーによる移動が可能です。選択されたセルのアウトラインによってセルが小さくなってしまう問題を修正しました。セルはマウスホバー時には拡大されず、選択時のみ拡大されるようになりました。受信データのレンダリングをいつ停止するかの判断は、サーバー側ではなくクライアント側で行われます。数値の桁区切りをハイライト表示します。全体的なデザインが刷新され、より力強い印象になりました。サーバーに到達可能かどうか、認証情報が正しいかをチェックし、サーバーバージョンと稼働時間を表示します。クラウドアイコンはすべてのフォントで輪郭付き表示され、Safari でも正しく表示されます。ネストされたデータ型内の大きな整数は、より良くレンダリングされるようになりました。`inf` / `nan` を正しく表示します。列ヘッダー上にマウスカーソルを置くと、そのデータ型を表示します。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* MergeTree によって管理されるカラムに対して、デフォルトで min-max（スキップ）インデックスを作成できるようにする機能を、`add_minmax_index_for_numeric_columns`（数値カラム用）および `add_minmax_index_for_string_columns`（文字列カラム用）の設定として追加しました。現時点では両方の設定が無効のままのため、挙動の変更はまだありません。 [#74266](https://github.com/ClickHouse/ClickHouse/pull/74266) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* `system.query_log`、ネイティブプロトコルの ClientInfo、およびサーバーログに `script_query_number` と `script_line_number` フィールドを追加しました。これにより [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542) がクローズされます。この機能を以前に [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) で立ち上げるきっかけを作ってくれた [pinsvin00](https://github.com/pinsvin00) に謝意を表します。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パターン内で最長となるイベント列に対して、マッチしたイベントのタイムスタンプを返す集約関数 `sequenceMatchEvents` を追加しました。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus)).
* 関数 `arrayNormalizedGini` を追加しました。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl))。
* `DateTime64` にマイナス演算子のサポートを追加し、`DateTime64` 同士の減算および `DateTime` との減算を可能にしました。 [#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg)).



#### 実験的機能
* `BFloat16` データ型は本番環境で利用できる状態になりました。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov))



#### パフォーマンスの向上

* 関数 `indexHint` を最適化しました。これにより、関数 `indexHint` の引数としてのみ使用されている列はテーブルから読み込まれなくなりました。[#74314](https://github.com/ClickHouse/ClickHouse/pull/74314)（[Anton Popov](https://github.com/CurtizJ)）。もし `indexHint` 関数がエンタープライズデータアーキテクチャの中核となっている場合、この最適化は極めて大きな効果を発揮するでしょう。
* `parallel_hash` JOIN アルゴリズムにおける `max_joined_block_size_rows` 設定の扱いをより正確にしました。これにより、`hash` アルゴリズムと比較してメモリ消費量が増加してしまう状況の回避に役立ちます。 [#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* クエリプランレベルで、`MergingAggregated` ステップに対する述語プッシュダウン最適化をサポートしました。これにより、analyzer を使用する一部のクエリのパフォーマンスが向上します。 [#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `parallel_hash` JOIN アルゴリズムのプローブフェーズにおいて、左テーブルのブロックをハッシュで分割する処理が削除されました。 [#73089](https://github.com/ClickHouse/ClickHouse/pull/73089) ([Nikita Taranov](https://github.com/nickitat))。
* RowBinary 入力フォーマットを最適化。[#63805](https://github.com/ClickHouse/ClickHouse/issues/63805) をクローズ。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* `optimize_on_insert` が有効な場合、パーツのレベルを 1 として書き込みます。これにより、新しく書き込まれたパーツに対する `FINAL` を伴うクエリについて、いくつかの最適化を利用できます。 [#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* いくつかの低レベルな最適化を行い、文字列のデシリアライズ処理を高速化しました。 [#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* マージ処理などでレコード間の等価比較を行う際には、最も不一致になりやすい列から行の比較を始めます。 [#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus))。
* Grace ハッシュ結合のパフォーマンスを向上させるために、右側の結合テーブルをキーで再ソートしました。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* 大規模なデータセットに対して計算を並列化できるように、`arrayROCAUC` および `arrayAUCPR` で曲線全体にわたる部分的な面積を計算できるようにしました。 [#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias))。
* アイドル状態のスレッドを過剰に生成しないようにしました。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* テーブル関数で中括弧展開のみを使用している場合は、BLOB ストレージキーを列挙しないようにする。[#73333](https://github.com/ClickHouse/ClickHouse/issues/73333) をクローズ。[#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `Nullable` 引数を取る関数に対するショートサーキット評価の最適化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li)).
* 非関数カラムには `maskedExecute` を適用しないようにし、ショートサーキット実行の性能を改善しました。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* `Kafka`/`NATS`/`RabbitMQ`/`FileLog` の入力フォーマットでヘッダーの自動検出機能を無効化し、パフォーマンスを向上させました。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat))。
* グルーピングセットを用いた集約処理の後段で、より高い並列度でパイプラインを実行するようにしました。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* `MergeTreeReadPool` におけるクリティカルセクションを縮小。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy))。
* 並列レプリカのパフォーマンスを改善しました。並列レプリカプロトコルに関連しないパケットのクエリイニシエータ上でのデシリアライズ処理は、常にパイプラインスレッド内で行われるようになりました。以前は、パイプラインのスケジューリングを担当するスレッドで行われることがあり、その結果、クエリイニシエータの応答性が低下し、パイプラインの実行が遅延する可能性がありました。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter))。
* Keeper におけるより大きなマルチリクエストのパフォーマンスを改善。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* ログラッパーは値として使用し、ヒープに割り当てないようにしました。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* MySQL および Postgres の dictionary レプリカへの接続をバックグラウンドで再確立し、対応する dictionary へのリクエストが遅延しないようにしました。 [#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parallel replicas 機能では、レプリカの可用性に関する過去の情報を用いてレプリカ選択を改善していましたが、接続不能な場合にレプリカのエラー数を更新していませんでした。この PR では、接続不能な場合にレプリカのエラー数を更新するようにしました。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi)).
* マージツリーの設定項目 `materialize_skip_indexes_on_merge` を追加しました。この設定により、マージ処理時にスキップインデックスの作成を抑制できます。これにより、スキップインデックスが作成されるタイミングを、ユーザーが `ALTER TABLE [..] MATERIALIZE INDEX [...]` を通じて明示的に制御できるようになります。これは、スキップインデックスの構築コストが高い場合（例: ベクトル類似度インデックス）に有用です。 [#74401](https://github.com/ClickHouse/ClickHouse/pull/74401) ([Robert Schulze](https://github.com/rschu1ze)).
* Storage(S3/Azure)Queue における Keeper リクエストを最適化しました。 [#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* デフォルトで最大 `1000` 個の並列レプリカを使用します。[#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* S3 ディスクから読み込む際の HTTP セッションの再利用を改善。([#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)) [#74548](https://github.com/ClickHouse/ClickHouse/pull/74548) ([Julian Maicher](https://github.com/jmaicher))。





#### 改善

* 暗黙的な ENGINE を用いる CREATE TABLE クエリで SETTINGS をサポートし、エンジン設定とクエリ設定を併用可能にした。[#73120](https://github.com/ClickHouse/ClickHouse/pull/73120)（[Raúl Marín](https://github.com/Algunenano)）。
* デフォルトで `use_hive_partitioning` を有効化。 [#71636](https://github.com/ClickHouse/ClickHouse/pull/71636) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 異なるパラメータを持つ JSON 型同士の CAST および ALTER をサポート。 [#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON カラムの値に対する等値比較をサポートします。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar)).
* 不要なバッククォートを避けるため、JSON サブカラムを含む識別子の書式設定を改善。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* インタラクティブメトリクスの改善。並列レプリカからのメトリクスが完全に表示されない問題を修正。メトリクスは、最新の更新時刻が新しい順、その後に名前の辞書順で表示する。古くなったメトリクスは表示しない。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631)（[Julia Kartseva](https://github.com/jkartseva)）。
* JSON 出力フォーマットをデフォルトで整形表示にします。それを制御する新しい設定 `output_format_json_pretty_print` を追加し、デフォルトで有効化しました。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* デフォルトで `LowCardinality(UUID)` を許可します。これは ClickHouse Cloud を利用するお客様の間で有用であることが実証されています。 [#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* インストール時に表示されるメッセージを改善しました。 [#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ClickHouse Cloud のパスワードリセット用メッセージを改善しました。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルに追記できない File テーブルのエラーメッセージを改善。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが誤ってターミナル上でバイナリ形式（`Native`、`Parquet`、`Avro` など）による出力を要求した場合に、確認を行うようにしました。これにより [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524) が解決されます。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ターミナル上の Pretty および Vertical 形式で末尾の空白文字をハイライト表示し、視認性を向上します。これは `output_format_pretty_highlight_trailing_spaces` 設定で制御されます。初期実装は [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) における [Braden Burns](https://github.com/bradenburns) によるものです。[#71590](https://github.com/ClickHouse/ClickHouse/issues/71590) をクローズします。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-client` と `clickhouse-local` は、標準入力がファイルからリダイレクトされている場合、その圧縮を自動検出するようになりました。これにより [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865) が解決されました。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* デフォルトで、pretty フォーマットにおいて長すぎる列名を切り詰めるようにしました。これは `output_format_pretty_max_column_name_width_cut_to` および `output_format_pretty_max_column_name_width_min_chars_to_cut` の各設定によって制御されます。この変更は、[#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) における [tanmaydatta](https://github.com/tanmaydatta) の作業の継続です。これにより [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968) がクローズされました。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Pretty` フォーマットをさらに見やすくするため、前のブロックの出力からあまり時間が経過していない場合には、ブロックをまとめて出力するようにしました。これは新しい設定 `output_format_pretty_squash_consecutive_ms`（デフォルト 50 ms）および `output_format_pretty_squash_max_wait_ms`（デフォルト 1000 ms）によって制御されます。[#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) の継続です。これにより [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153) がクローズされました。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 現在マージ処理中のソースパーツ数を示すメトリクスを追加しました。これにより、[#70809](https://github.com/ClickHouse/ClickHouse/issues/70809) がクローズされます。 [#73868](https://github.com/ClickHouse/ClickHouse/pull/73868) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 出力先がターミナルの場合、`Vertical` フォーマットで列をハイライト表示します。これは `output_format_pretty_color` 設定で無効にできます。 [#73898](https://github.com/ClickHouse/ClickHouse/pull/73898) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* MySQL との互換性を向上させ、現在では `mysqlsh`（Oracle 製の高機能な MySQL CLI）が ClickHouse に接続できるようになりました。これはテストを容易にするためのものです。 [#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty フォーマットでは、テーブルセル内に複数行のフィールドを表示できるため、可読性が向上します。これはデフォルトで有効になっており、設定 `output_format_pretty_multiline_fields` で制御できます。[#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) における [Volodyachan](https://github.com/Volodyachan) による作業を継続したものです。これにより [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912) がクローズされました。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ブラウザ上の JavaScript から `X-ClickHouse` HTTP ヘッダーを参照できるようにしました。これにより、アプリケーションの実装がより容易になります。 [#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `JSONEachRowWithProgress` フォーマットには、メタデータを含むイベントに加えて、totals と extremes も含まれます。さらに、`rows_before_limit_at_least` および `rows_before_aggregation` も含まれます。このフォーマットは、部分的な結果の後に発生した場合でも、例外を正しく出力します。進捗情報には経過ナノ秒が含まれるようになりました。終了時に最後の進捗イベントが 1 回送出されます。クエリ実行中の進捗の出力頻度は、`interactive_delay` 設定値より頻繁には出力されません。[#74181](https://github.com/ClickHouse/ClickHouse/pull/74181) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 砂時計が Play UI 上で滑らかに回転するようになりました。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* HTTP レスポンスを圧縮している場合でも、データは到着し次第パケットとして送信します。これにより、ブラウザは進捗用パケットと圧縮データの両方を受信できます。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 出力レコード数が N = `output_format_pretty_max_rows` を超える場合、先頭の N 行だけを表示するのではなく、出力テーブルの途中を省略し、先頭 N/2 行と末尾 N/2 行を表示します。[#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) の継続です。これにより [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502) がクローズされます。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを利用可能にしました。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `DateTime64` データ型のカラムに対して bloom&#95;filter インデックスを作成できるようにしました。 [#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean)).
* `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が両方有効化されている場合、パーツのマージ処理はバイト数の上限を無視します。 [#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* トレーサビリティ向上のため OpenTelemetry span logs テーブルに HTTP ヘッダーを追加しました。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* `GMT` タイムゾーンだけでなく、任意のタイムゾーンを指定して `orc` ファイルを書き出せるようになりました。[#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* クラウド間でのバックアップ書き込み時に、IO スケジューリング設定を考慮するようにしました。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `system.asynchronous_metrics` に `metric` 列のエイリアス `name` を追加しました。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm))。
* 歴史的な理由により、クエリ `ALTER TABLE MOVE PARTITION TO TABLE` は専用の `ALTER_MOVE_PARTITION` 権限ではなく、`SELECT` および `ALTER DELETE` 権限をチェックしていました。この PR では、この専用のアクセス種別を使用するようにしました。互換性のため、`SELECT` と `ALTER DELETE` が付与されている場合には、この権限も暗黙的に付与されますが、この挙動は将来のリリースで削除される予定です。この変更により [#16403](https://github.com/ClickHouse/ClickHouse/issues/16403) がクローズされました。[#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* ソートキー内のカラムをマテリアライズしようとした際にソート順が乱れることを許可するのではなく、例外をスローするようにしました。 [#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48)).
* `EXPLAIN QUERY TREE` 内の機密情報を非表示にしました。 [#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* &quot;native&quot; リーダーで Parquet の整数論理型をサポートしました。 [#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos)).
* デフォルトユーザーにパスワードが設定されている場合、ブラウザ上で対話的に認証情報を要求します。以前のバージョンではサーバーは HTTP 403 を返していましたが、現在は HTTP 401 を返します。 [#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* アクセス種別 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` をグローバル権限からパラメータ化された権限に変更しました。これにより、ユーザーはアクセス管理に関する権限をこれまでよりも細かく付与できるようになりました。 [#72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit)).
* `system.mutations` に `latest_fail_error_code_name` カラムを追加します。このカラムは、スタックした mutation に関する新しいメトリクスを導入し、クラウドで発生したエラーのグラフを作成するため、さらに必要に応じて、よりノイズの少ない新しいアラートを追加するために必要です。 [#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `ATTACH PARTITION` クエリでのメモリアロケーション量を削減しました。 [#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* `max_bytes_before_external_sort` の制限を、クエリ全体のメモリ消費量に基づくものにしました（以前は 1 つのソートスレッドにおけるソートブロック内のバイト数を意味していましたが、現在は `max_bytes_before_external_group_by` と同じ意味を持ち、すべてのスレッドを含むクエリ全体のメモリに対する総量の上限となります）。また、ディスク上のブロックサイズを制御するための設定 `min_external_sort_block_bytes` を追加しました。 [#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat))。
* トレースコレクタによるメモリ制限を無視するようにしました。 [#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* サーバー設定 `dictionaries_lazy_load` と `wait_dictionaries_load_at_startup` を `system.server_settings` に追加しました。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm)).
* `BACKUP`/`RESTORE` クエリの一部として指定可能な設定の一覧に `max_backup_bandwidth` を追加しました。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* レプリケーション構成のクラスターで生成されるログ量を抑えるため、ReplicatedMergeTree エンジンにおいて出現するレプリケートパーツに対するログレベルを引き下げました。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 論理和条件における共通部分式の抽出を改善しました。すべての項に共通部分式が存在しない場合でも、結果として得られるフィルター式を簡略化できるようにしました。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) の継続です。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* `S3Queue` / `AzureQueue` ストレージにおいて、テーブルが設定なしで作成されていた場合でも、後から設定を追加できるようにしました。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `least` および `greatest` 関数が `NULL` 引数を、無条件に `NULL` を返して処理するか（`true` の場合）、無視して処理するか（`false` の場合）を制御する設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を導入しました。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze)).
* ObjectStorageQueueMetadata のクリーンアップスレッドで Keeper のマルチリクエストを使用する。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* ClickHouse が cgroup 配下で動作している場合でも、システム負荷、プロセススケジューリング、メモリなどに関連するシステム全体の非同期メトリクスを引き続き収集します。これらは、ClickHouse がホスト上で多くのリソースを消費している唯一のプロセスである場合に有用な指標となり得ます。 [#73369](https://github.com/ClickHouse/ClickHouse/pull/73369) ([Nikita Taranov](https://github.com/nickitat))。
* ストレージエンジン `S3Queue` では、24.6 より前に作成された古い順序付きテーブルを、バケット構造を持つ新しい形式へ移行できるようになりました。 [#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 既存の `system.s3queue` と同様の `system.azure_queue` を追加。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 関数 `parseDateTime64`（およびそのバリエーション）は、1970年以前／2106年以後の入力日付に対して正しい結果を返すようになりました。例: `SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594)（[zhanglistar](https://github.com/zhanglistar)）。
* ユーザーから報告されていた `clickhouse-disks` の使い勝手に関するいくつかの問題に対応しました。 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136) をクローズします。 [#73616](https://github.com/ClickHouse/ClickHouse/pull/73616) ([Daniil Ivanik](https://github.com/divanik)).
* storage S3(Azure)Queue において、コミット設定を構成できるようにしました（コミット設定は `max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit` です）。 [#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ストレージエンジン S3(Azure)Queue において、複数ソース間の進捗を集約し、commit limit 設定と比較できるようにしました。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `BACKUP`/`RESTORE` クエリでコア設定をサポートしました。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* Parquet 出力で `output_format_compression_level` を考慮するようにしました。[#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos)).
* サポートされていない型として扱うのではなく、Apache Arrow の `fixed_size_list` を `Array` として読み込めるようにしました。 [#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers))。
* 2 つのバックアップエンジンを追加しました: `Memory`（バックアップを現在のユーザーセッション内に保持）、および `Null`（どこにもバックアップを保持しないテスト用）。 [#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar))。
* `concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_num_ratio_to_cores` は、サーバーを再起動することなく変更できるようになりました。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa))。
* `formatReadable` 関数で拡張数値型（`Decimal`、大きな整数）への対応を追加。[#73765](https://github.com/ClickHouse/ClickHouse/pull/73765)（[Raúl Marín](https://github.com/Algunenano)）。
* Postgres ワイヤープロトコル互換のために TLS をサポートしました。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 関数 `isIPv4String` は、正しい IPv4 アドレスの直後にゼロバイトが続く場合に true を返していましたが、この場合は false を返すべきでした。[#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) の継続対応です。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL ワイヤープロトコルにおけるエラーコードを MySQL と互換性のあるものにします。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) の続きです。[#50957](https://github.com/ClickHouse/ClickHouse/issues/50957) をクローズします。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `IN` や `NOT IN` といった演算子内の enum リテラルが enum 型の有効な値かどうかを検証し、有効でない場合には例外をスローする設定 `validate_enum_literals_in_opearators` を追加しました。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Storage `S3(Azure)Queue` において、commit 設定で定義される 1 つのバッチ内のすべてのファイルを、1 つの keeper トランザクションでコミットするようにしました。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 実行可能な UDF およびディクショナリに対するヘッダー検出を無効化しました（Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1 という問題が発生する可能性がありました）。[#73992](https://github.com/ClickHouse/ClickHouse/pull/73992)（[Azat Khuzhin](https://github.com/azat)）。
* `EXPLAIN PLAN` に `distributed` オプションを追加しました。これにより、`EXPLAIN distributed=1 ... ` は `ReadFromParallelRemote*` ステップにリモートの実行計画を追加するようになりました。[#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Dynamic 引数を持つ not/xor に対して正しい戻り型を使用するようにしました。 [#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar))。
* テーブル作成後でも `add_implicit_sign_column_constraint_for_collapsing_engine` を変更できるようにしました。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm))
* マテリアライズドビューの `SELECT` クエリでサブカラムをサポートしました。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar)).
* 現在、`clickhouse-client` でカスタムプロンプトを設定するには、3 通りの簡単な方法があります。1. コマンドラインパラメータ `--prompt` を使用する、2. 設定ファイルで `<prompt>[...]</prompt>` 設定を使用する、3. 同じく設定ファイルで、接続ごとの設定として `<connections_credentials><prompt>[...]</prompt></connection_credentials>` を使用する方法です。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168) ([Christoph Wurm](https://github.com/cwurm))。
* ClickHouse Client でポート9440への接続に基づいて、セキュア接続を自動判別するようにしました。 [#74212](https://github.com/ClickHouse/ClickHouse/pull/74212) ([Christoph Wurm](https://github.com/cwurm)).
* http&#95;handlers に対してユーザー名のみでユーザー認証できるようにしました（以前はパスワードの入力も必須でした）。[#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat))。
* 代替クエリ言語である PRQL および KQL のサポートが実験的機能としてマークされました。これらを使用するには、設定 `allow_experimental_prql_dialect = 1` および `allow_experimental_kusto_dialect = 1` を指定します。 [#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze)).
* さらに多くの集約関数でデフォルトの `Enum` 型を返すことをサポート。 [#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* `OPTIMIZE TABLE` において、既存のキーワード `FINAL` の代わりにキーワード `FORCE` を指定できるようになりました。 [#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze))。
* サーバーのシャットダウンに時間がかかりすぎる場合にアラートを発生させるために必要な `IsServerShuttingDown` メトリクスを追加しました。 [#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* EXPLAIN の出力に Iceberg テーブル名を追加しました。 [#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 旧アナライザで `RECURSIVE CTE` を使用した場合のエラーメッセージを改善しました。 [#74523](https://github.com/ClickHouse/ClickHouse/pull/74523) ([Raúl Marín](https://github.com/Algunenano)).
* `system.errors` に拡張エラーメッセージを表示するようにしました。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* clickhouse-keeper とのクライアント通信にパスワードを使用できるようにします。サーバーおよびクライアントに対して適切な SSL 設定を行っている場合、この機能の有用性はそれほど高くありませんが、それでも特定のケースでは役立つことがあります。パスワードは 16 文字を超えることはできません。Keeper の認証モデルとは連携していません。 [#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin)).
* Config リローダー向けのエラーコードを追加しました。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* MySQL および PostgreSQL のテーブル関数とエンジンで IPv6 アドレスをサポートしました。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme))。
* `divideDecimal` にショートサーキット最適化を実装し、[#74280](https://github.com/ClickHouse/ClickHouse/issues/74280) を修正。 [#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 起動スクリプト内でユーザーを指定できるようになりました。 [#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit))
* Azure SAS トークンのサポートを追加。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).





#### バグ修正（公式安定版リリースにおけるユーザーに見える不具合）

* Parquet の圧縮レベルは、圧縮コーデックが対応している場合にのみ設定されるようにしました。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修飾子付きの照合ロケールを使用するとエラーが発生するリグレッションを修正しました。例えば、`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` は、現在は正しく動作します。 [#73544](https://github.com/ClickHouse/ClickHouse/pull/73544) ([Robert Schulze](https://github.com/rschu1ze))。
* keeper-client で SEQUENTIAL ノードを作成できない問題を修正。[#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94)).
* position 関数における誤った文字数カウントを修正。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* アクセスエンティティに対する `RESTORE` 操作では、未処理の部分的な権限剥奪により、本来より多くの権限が必要とされていました。このPRでこの問題を修正しました。[#71853](https://github.com/ClickHouse/ClickHouse/issues/71853) をクローズします。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958)（[pufit](https://github.com/pufit)）。
* `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 実行後のポーズを回避し、バックグラウンドタスクのスケジューリングに対して正しい設定を取得するようにしました。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 一部の入力・出力フォーマット（Parquet や Arrow など）における空タプルの扱いを修正。 [#72616](https://github.com/ClickHouse/ClickHouse/pull/72616) ([Michael Kolupaev](https://github.com/al13n321)).
* ワイルドカードを含むデータベース/テーブルに対する列レベルの GRANT SELECT/INSERT ステートメントは、エラーを返すようになりました。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan))。
* 対象のアクセスエンティティにある暗黙的な権限付与が原因で、ユーザーが `REVOKE ALL ON *.*` を実行できない問題を修正しました。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* formatDateTime スカラー関数の正のタイムゾーンのフォーマットを修正しました。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese)).
* PROXYv1 を介して接続され、`auth_use_forwarded_address` が設定されている場合に、ソースポートを正しく反映するよう修正しました。従来は誤ってプロキシポートが使用されていました。`currentQueryID()` 関数を追加しました。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* TCPHandler で NativeWriter にフォーマット設定を伝達し、`output_format_native_write_json_as_string` のような設定が正しく適用されるようにしました。 [#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* StorageObjectStorageQueue のクラッシュを修正しました。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* サーバーのシャットダウン中に発生する、リフレッシュ可能なマテリアライズドビューでのまれなクラッシュを修正。 [#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 関数 `formatDateTime` の `%f` プレースホルダは、常に 6 桁の（サブ秒）数字を生成するようになりました。これにより、MySQL の `DATE_FORMAT` 関数と同じ動作になります。以前の動作は、設定 `formatdatetime_f_prints_scale_number_of_digits = 1` を使用することで復元できます。 [#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese))。
* `s3` ストレージおよびテーブル関数からの読み取り時の `_etag` 列によるフィルタ処理を修正しました。 [#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 旧アナライザーを使用している場合に、`JOIN ON` 式内で `IN (subquery)` を使用すると発生する `Not-ready Set is passed as the second argument for function 'in'` エラーを修正。[#73382](https://github.com/ClickHouse/ClickHouse/pull/73382)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* Dynamic 列および JSON 列に対する squashing の準備処理を修正しました。以前は、型/パスの上限に達していない場合でも、一部のケースで新しい型を shared variant/shared data に挿入できてしまうことがありました。 [#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar)).
* 型バイナリのデコード中にサイズの破損を検出し、過度に大きなメモリアロケーションが行われないようにしました。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカが有効な状態で単一レプリカのクラスタから読み取る際の論理エラーを修正しました。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321)).
* ZooKeeper および旧バージョンの Keeper を使用する場合の ObjectStorageQueue を修正しました。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* Hive パーティションをデフォルトで有効にするために必要な修正を実装しました。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ベクトル類似インデックスの作成時に発生するデータレースを修正。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 辞書のソースに誤ったデータを返す関数が含まれている場合に発生していたセグメンテーションフォールトを修正します。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Storage S3(Azure)Queue における挿入失敗時のリトライ処理を修正。[#70951](https://github.com/ClickHouse/ClickHouse/issues/70951) をクローズ。 [#73546](https://github.com/ClickHouse/ClickHouse/pull/73546) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `LowCardinality` 要素を持つタプルに対して設定 `optimize_functions_to_subcolumns` が有効な場合に、一部のケースで発生する可能性のあった関数 `tupleElement` のエラーを修正しました。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* enum のグロブパターンの後に単一の範囲指定が続く場合のパースを修正。[#73473](https://github.com/ClickHouse/ClickHouse/issues/73473) を修正。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 非レプリケート MergeTree テーブル向け設定 `parallel_replicas_for_non_replicated_merge_tree` が、非レプリケートテーブルに対するサブクエリ内で無視されていた問題を修正しました。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* タスクをスケジュールできない場合に `std::logical&#95;error` がスローされる問題を修正。ストレステストで検出。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger))。
* 分散クエリを誤った処理ステージで処理してしまうことによる論理エラーを避けるため、`EXPLAIN SYNTAX` ではクエリを解釈しないようにしました。[#65205](https://github.com/ClickHouse/ClickHouse/issues/65205) を修正。[#73634](https://github.com/ClickHouse/ClickHouse/pull/73634)（[Dmitry Novik](https://github.com/novikd)）。
* Dynamic カラムにおけるデータ不整合および `Nested columns sizes are inconsistent with local_discriminators column size` という論理エラーが発生しうる問題を修正しました。[#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar))。
* `FINAL` および `SAMPLE` を含むクエリで発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。`CollapsingMergeTree` に対する `FINAL` 付きの `SELECT` で誤った結果が返される問題を修正し、`FINAL` の最適化を有効化しました。 [#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* LIMIT BY COLUMNS で発生していたクラッシュを修正。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 通常プロジェクションの使用が強制されている場合に、クエリがプロジェクションで定義されたものと完全に同一であるにもかかわらず、そのプロジェクションが選択されずにエラーが発生してしまうバグを修正しました。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* Dynamic/Object 構造のデシリアライズ処理を修正しました。これが原因で CANNOT&#95;READ&#95;ALL&#95;DATA 例外が発生する可能性がありました。 [#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* バックアップからパーツを復元する際、`metadata_version.txt` をスキップするようにしました。 [#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar)).
* LIKE を伴う Enum への CAST 中に発生するセグメンテーションフォルトを修正。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar))
* S3 Express バケットがディスクとして動作しない問題を修正。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar)).
* CollapsingMergeTree テーブルで、符号列に不正な値を含む行もマージできるようにしました。 [#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm))。
* オフラインのレプリカに対して DDL クエリを実行した際に発生するエラーを修正。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach)).
* ネストされたタプルに対して &#39;keys&#39;、&#39;values&#39; という明示的な名前を付けずに `Map` を作成できてしまうことが原因で、`map()` 型の比較が時折失敗する問題を修正しました。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* GROUP BY ALL 句の解決の際にウィンドウ関数を無視するようにしました。 [#73501](https://github.com/ClickHouse/ClickHouse/issues/73501) を修正しました。 [#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 暗黙的な権限の扱いを修正（以前はワイルドカードとして機能していた）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* ネストした Map の作成時に発生する高いメモリ使用量を修正。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar)).
* 空キーを含むネストされた JSON のパースを修正。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修正: あるエイリアスが別のエイリアスから参照されており、かつ逆順で選択されている場合に、そのエイリアスがプロジェクションに追加されない不具合を修正しました。 [#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* plain&#95;rewritable ディスクの初期化中に Azure で発生する「object not found」エラーを無視するようになりました。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* Enum 型および空テーブルに対する `any` と `anyLast` の動作を修正。 [#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* ユーザーが Kafka テーブルエンジンでキーワード引数を指定した場合に発生する不具合を修正しました。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* Storage `S3Queue` の設定で、&quot;s3queue&#95;&quot; プレフィックスの有無を切り替える際の処理を修正。[#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 設定 `allow_push_predicate_ast_for_distributed_subqueries` を追加しました。これにより、アナライザーを用いた分散クエリに対して AST ベースの述語プッシュダウンが行えるようになります。これは、クエリプランのシリアライゼーションを伴う分散クエリがサポートされるまで使用する一時的な解決策です。 [#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718) をクローズします。 [#74085](https://github.com/ClickHouse/ClickHouse/pull/74085) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) の変更後、`forwarded_for` フィールドにポートが含まれる場合があり、その結果、ポート付きのホスト名を解決できなくなっていた問題を修正します。[#74116](https://github.com/ClickHouse/ClickHouse/pull/74116)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` の誤った構文を修正しました。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991)).
* 問題 [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112) の修正。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `CREATE TABLE` で `Loop` をテーブルエンジンとして使用することはできなくなりました。この組み合わせは以前、セグメンテーションフォールトを引き起こしていました。[#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* PostgreSQL および SQLite のテーブル関数における SQL インジェクションを許すセキュリティ上の問題を修正しました。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 圧縮された Memory エンジンのテーブルからサブカラムを読み取る際に発生していたクラッシュを修正。[#74009](https://github.com/ClickHouse/ClickHouse/issues/74009) を解決。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* system.detached&#95;tables へのクエリで発生していた無限ループを修正しました。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov))。
* s3queue でファイルを失敗としてマークする際の論理エラーを修正。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ベースバックアップからの `RESTORE` で使用されるネイティブコピー設定（`allow_s3_native_copy` / `allow_azure_native_copy`）を修正。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* データベース内のデタッチされたテーブルの数が `max_block_size` の倍数である場合に発生していた問題を修正しました。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov))。
* ソースと宛先の認証情報が異なる場合の ObjectStorage（例: S3）経由でのコピーを修正しました。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* GCS 上のネイティブコピーにおいて、「JSON API の Rewrite メソッドの使用」を検出する処理を修正。 [#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundMergesAndMutationsPoolSize` の誤った計算を修正（実際の値の2倍になっていた問題）。 [#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin))。
* Cluster Discovery を有効化した際に Keeper の watch がリークするバグを修正。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* UBSan が報告したメモリアラインメントの問題を修正しました [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。[#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* テーブル作成時の KeeperMap の並行クリーンアップ処理を修正。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* `EXCEPT` または `INTERSECT` が存在する場合、正しいクエリ結果を維持するために、サブクエリ内の未使用の投影列を削除しないようにしました。[#73930](https://github.com/ClickHouse/ClickHouse/issues/73930) を修正。[#66465](https://github.com/ClickHouse/ClickHouse/issues/66465) を修正。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* `Tuple` 列を持ちスパースシリアル化が有効になっているテーブル間での `INSERT SELECT` クエリの不具合を修正しました。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 関数 `right` が const な負のオフセットに対して誤った動作をしていました。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* クライアント側での不完全な解凍処理が原因で、gzip 圧縮データの挿入が失敗することがある問題を修正しました。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* ワイルドカード付きの権限付与に対する部分的な取り消しにより、想定よりも多くの権限が削除されてしまう可能性がありました。[#74263](https://github.com/ClickHouse/ClickHouse/issues/74263) をクローズしました。[#74751](https://github.com/ClickHouse/ClickHouse/pull/74751)（[pufit](https://github.com/pufit)）。
* Keeper の修正: ディスクからのログエントリ読み取り処理を修正。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* SYSTEM REFRESH/START/STOP VIEW の権限チェックを修正しました。これにより、特定のビューに対するクエリを実行するために `*.*` への権限を持つ必要がなくなり、そのビューに対する権限のみが必要となりました。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix))。
* `hasColumnInTable` 関数はエイリアス列を考慮しません。エイリアス列でも動作するように修正しました。[#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* Azure Blob Storage 上の空の列を持つテーブルのデータパーツのマージ中に発生する FILE&#95;DOESNT&#95;EXIST エラーを修正。 [#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 一時テーブル結合時のプロジェクション列名を修正し、[#68872](https://github.com/ClickHouse/ClickHouse/issues/68872) をクローズしました。 [#74897](https://github.com/ClickHouse/ClickHouse/pull/74897) ([Vladimir Cherkasov](https://github.com/vdimir))。



#### ビルド/テスト/パッケージングの改善
* ユニバーサルインストールスクリプトは、macOS でもインストールを提案するようになりました。 [#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
