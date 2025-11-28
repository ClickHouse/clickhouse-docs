---
description: '2025 年の変更履歴'
note: 'このファイルは yarn build によって生成されました'
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: '2025'
title: '変更履歴 2025'
doc_type: 'changelog'
---

### 目次
**[ClickHouse リリース v25.10, 2025-10-30](#2510)**<br/>
**[ClickHouse リリース v25.9, 2025-09-25](#259)**<br/>
**[ClickHouse リリース v25.8 LTS, 2025-08-28](#258)**<br/>
**[ClickHouse リリース v25.7, 2025-07-24](#257)**<br/>
**[ClickHouse リリース v25.6, 2025-06-26](#256)**<br/>
**[ClickHouse リリース v25.5, 2025-05-22](#255)**<br/>
**[ClickHouse リリース v25.4, 2025-04-22](#254)**<br/>
**[ClickHouse リリース v25.3 LTS, 2025-03-20](#253)**<br/>
**[ClickHouse リリース v25.2, 2025-02-27](#252)**<br/>
**[ClickHouse リリース v25.1, 2025-01-28](#251)**<br/>
**[2024 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2024/)**<br/>
**[2023 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2023/)**<br/>
**[2022 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2022/)**<br/>
**[2021 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2021/)**<br/>
**[2020 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2020/)**<br/>
**[2019 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2019/)**<br/>
**[2018 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2018/)**<br/>
**[2017 年の変更履歴](https://clickhouse.com/docs/whats-new/changelog/2017/)**<br/>


### ClickHouse リリース 25.10, 2025-10-31 {#2510}



#### 後方互換性のない変更

* デフォルトの `schema_inference_make_columns_nullable` 設定を変更し、すべてを Nullable にするのではなく、Parquet/ORC/Arrow メタデータに含まれるカラムが `Nullable` かどうかに関する情報を反映するようにしました。テキスト形式については変更ありません。 [#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321)).
* クエリ結果キャッシュは `log_comment` 設定を無視するようになったため、クエリの `log_comment` だけを変更しても、もはやキャッシュミスを強制しなくなりました。ユーザーが意図的に `log_comment` を変化させることでキャッシュをセグメントしていた可能性はわずかにあります。この変更はその挙動を変えるものであり、そのため後方互換性がありません。この目的には設定 `query_cache_tag` を使用してください。[#79878](https://github.com/ClickHouse/ClickHouse/pull/79878)（[filimonov](https://github.com/filimonov)）。
* 以前のバージョンでは、演算子の実装関数と同じ名前を持つテーブル関数を含むクエリのフォーマットに一貫性がありませんでした。[#81601](https://github.com/ClickHouse/ClickHouse/issues/81601) をクローズしました。[#81977](https://github.com/ClickHouse/ClickHouse/issues/81977) をクローズしました。[#82834](https://github.com/ClickHouse/ClickHouse/issues/82834) をクローズしました。[#82835](https://github.com/ClickHouse/ClickHouse/issues/82835) をクローズしました。EXPLAIN SYNTAX クエリは、常に演算子をフォーマットすることはなくなりました。この新しい挙動は、構文を説明するという目的をより正確に反映しています。`clickhouse-format`、`formatQuery` などは、クエリ内で関数形式として使用されている場合、それらの関数を演算子としてはフォーマットしません。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JOIN` キーでの `Dynamic` 型の使用を禁止しました。`Dynamic` 型の値が `Dynamic` 以外の型と比較されると、予期しない結果を招く可能性があります。`Dynamic` 列は、必要な型にキャストすることを推奨します。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` サーバーオプションはデフォルトでオンになっており、現時点ではオフに設定することはできません。これは後方互換性のある変更です。注意喚起のためのお知らせです。この変更は 25.x リリースとのみ前方互換性があります。つまり、新しいリリースをロールバックする必要がある場合にダウングレード可能なのは、25.x 系の任意のリリースに限られます。 [#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema))。
* 挿入レートが低い場合に ZooKeeper 上に保存される znode の数を減らすため、`replicated_deduplication_window_seconds` を 1 週間から 1 時間に減らします。 [#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema)).
* 設定 `query_plan_use_new_logical_join_step` を `query_plan_use_logical_join_step` に名称変更しました。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新しい構文により、テキストインデックスの tokenizer パラメータをより柔軟に設定できるようになりました。 [#87997](https://github.com/ClickHouse/ClickHouse/pull/87997) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 既存の関数 `hasToken` との一貫性を高めるため、`searchAny` および `searchAll` 関数をそれぞれ `hasAnyTokens` と `hasAllTokens` に名称変更しました。[#88109](https://github.com/ClickHouse/ClickHouse/pull/88109)（[Robert Schulze](https://github.com/rschu1ze)）。
* ファイルシステムキャッシュから `cache_hits_threshold` を削除しました。この機能は SLRU キャッシュポリシーを導入する前に外部コントリビューターによって追加されたものですが、現在は SLRU キャッシュポリシーがあるため、両方をサポートし続ける意味がありません。 [#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` 設定の動作に対する、2つの小さな変更: - 挿入を拒否すべきかどうかを判定する際に、利用可能バイト数ではなく未予約バイト数を使用するようにしました。バックグラウンドマージやミューテーション用の予約量が設定されたしきい値と比べて小さい場合は、この変更はそれほど重要ではないかもしれませんが、その方がより正確と考えられます。 - これらの設定を system テーブルには適用しないようにしました。これは、`query_log` のようなテーブルを引き続き更新したいためです。これはデバッグに大いに役立ちます。system テーブルに書き込まれるデータは通常、実際のデータと比べて小さいため、妥当な `min_free_disk_ratio_to_perform_insert` のしきい値であれば、かなり長い間書き込みを継続できるはずです。[#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end))。
* Keeper の内部レプリケーションで非同期モードを有効にします。Keeper は、以前と同じ動作を維持しながら、パフォーマンスの向上が見込まれます。23.9 より前のバージョンからアップデートする場合は、まず 23.9 以上にアップデートしてから 25.10+ にアップデートする必要があります。アップデート前に `keeper_server.coordination_settings.async_replication` を 0 に設定しておき、アップデート完了後に有効にすることもできます。[#88515](https://github.com/ClickHouse/ClickHouse/pull/88515)（[Antonio Andelic](https://github.com/antonio2368)）。





#### 新機能

* 負の `LIMIT` と負の `OFFSET` のサポートを追加。[#28913](https://github.com/ClickHouse/ClickHouse/issues/28913) をクローズ。[#88411](https://github.com/ClickHouse/ClickHouse/pull/88411)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取りおよび書き込み操作は対象テーブルに転送され、エイリアス自体はデータを保持せず、対象テーブルへの参照のみを保持します。 [#87965](https://github.com/ClickHouse/ClickHouse/pull/87965) ([Kai Zhu](https://github.com/nauu))。
* 演算子 `IS NOT DISTINCT FROM` (`<=>`) を完全にサポート。 [#88155](https://github.com/ClickHouse/ClickHouse/pull/88155) ([simonmichal](https://github.com/simonmichal))。
* `MergeTree` テーブル内の、適用可能なすべてのカラムに対して統計情報を自動的に作成する機能を追加しました。作成する統計情報の種類をカンマ区切りで指定するテーブルレベルの設定項目 `auto_statistics_types` を追加しました（例: `auto_statistics_types = 'minmax, uniq, countmin'`）。 [#87241](https://github.com/ClickHouse/ClickHouse/pull/87241) ([Anton Popov](https://github.com/CurtizJ))。
* テキスト向けの新しいブルームフィルターインデックス `sparse_gram`。 [#79985](https://github.com/ClickHouse/ClickHouse/pull/79985)（[scanhex12](https://github.com/scanhex12)）。
* 基数変換を行う新しい `conv` 関数が追加され、現在は `2〜36` 進数をサポートしています。 [#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator)).
* `LIMIT BY ALL` 構文のサポートを追加しました。`GROUP BY ALL` や `ORDER BY ALL` と同様に、`LIMIT BY ALL` は SELECT 句内のすべての非集約式に自動的に展開され、それらを LIMIT BY 句のキーとして使用します。例えば、`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` は `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name` と同等です。この機能により、SELECT 句内のすべての非集約列で制限をかけたい場合に、それらを明示的に列挙することなくクエリを簡潔に記述できます。[#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) をクローズしました。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* ClickHouse で Apache Paimon をクエリするためのサポートを追加しました。この統合により、ClickHouse ユーザーは Paimon のデータレイクストレージに直接アクセスできるようになります。 [#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98)).
* `studentTTestOneSample` 集約関数を追加しました。[#85436](https://github.com/ClickHouse/ClickHouse/pull/85436)（[Dylan](https://github.com/DylanBlakemore)）。
* 集約関数 `quantilePrometheusHistogram`。この関数は各ヒストグラムバケットの上限値と累積値を引数として受け取り、分位点の位置が見つかったバケットの下限値と上限値の間で線形補間を行います。従来型ヒストグラムに対する PromQL の `histogram_quantile` 関数と同様の動作をします。 [#86294](https://github.com/ClickHouse/ClickHouse/pull/86294) ([Stephen Chi](https://github.com/stephchi0)).
* Delta Lake メタデータファイル用の新しいシステムテーブル。 [#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12)).
* `ALTER TABLE REWRITE PARTS` を追加しました。これは、新しい設定をすべて反映してテーブルパーツを一から再作成します（`use_const_adaptive_granularity` のように、新しく作成されるパーツにのみ適用される設定があるためです）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat)).
* `SYSTEM RECONNECT ZOOKEEPER` コマンドを追加し、ZooKeeper を強制的に切断して再接続できるようにしました（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* `max_named_collection_num_to_warn` と `max_named_collection_num_to_throw` を設定することで、名前付きコレクションの数を制限します。新しいメトリック `NamedCollection` とエラー `TOO_MANY_NAMED_COLLECTIONS` を追加しました。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos))。
* `startsWith` および `endsWith` 関数に、大文字小文字を区別しない最適化バリアントを追加しました: `startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8`、`endsWithCaseInsensitiveUTF8`。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374)（[Guang Zhao](https://github.com/zheguang)）。
* サーバー設定の &quot;resources&#95;and&#95;workloads&quot; セクションを使用して、SQL で `WORKLOAD` および `RESOURCE` 定義を指定できるようにする手段を追加しました。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa))。
* 新しいテーブル設定 `min_level_for_wide_part` を追加し、パーツをワイドパーツとして作成する際の最小レベルを指定できるようにしました。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm)).
* Keeper クライアントに `cp`-`cpr` および `mv`-`mvr` コマンドの再帰版を追加。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 挿入時のマテリアライズからスキップインデックスのリストを除外するためのセッション設定（`exclude_materialize_skip_indexes_on_insert`）を追加しました。マージ時のマテリアライズからスキップインデックスのリストを除外するための MergeTree テーブル設定（`exclude_materialize_skip_indexes_on_merge`）を追加しました。 [#87252](https://github.com/ClickHouse/ClickHouse/pull/87252)（[George Larionov](https://github.com/george-larionov)）。



#### 実験的機能
* ビットスライス形式でベクトルを保存する `QBit` データ型と、パラメータによって精度と速度のトレードオフを制御できる近似ベクトル検索を可能にする `L2DistanceTransposed` 関数を実装しました。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 関数 `searchAll` と `searchAny` は、テキスト列を含まない列上でも動作するようになりました。その場合、デフォルトのトークナイザを使用します。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus)).



#### パフォーマンスの向上

* JOIN および ARRAY JOIN においてカラムの遅延複製を実装しました。一部の出力フォーマットで、Sparse や Replicated などの特殊なカラム表現を完全なカラム表現に変換しないようにしました。これにより、メモリ上での不要なデータコピーを回避できます。 [#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree テーブルのトップレベル String カラムに、圧縮率の向上と効率的なサブカラムアクセスを可能にするオプションの `.size` サブカラムシリアライゼーションを追加しました。シリアライゼーションのバージョンを制御するための新しい MergeTree 設定と、空文字列に対する式を最適化するための設定を導入しました。 [#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* Iceberg に対する順序付き読み取りのサポート。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 右部分木から実行時にブルームフィルターを構築し、このフィルターを左部分木側のスキャンに渡すことで、一部の JOIN クエリを高速化します。これは、`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` のようなクエリで有効です。[#84772](https://github.com/ClickHouse/ClickHouse/pull/84772)（[Alexander Gololobov](https://github.com/davenger)）。
* クエリ条件キャッシュ (QCC) とインデックス解析の順序および統合方法をリファクタリングすることで、クエリパフォーマンスを改善しました。QCC フィルタリングは、プライマリキーおよびスキップインデックス解析より前に適用されるようになり、不必要なインデックス計算が削減されます。インデックス解析は複数のレンジフィルターをサポートするように拡張され、そのフィルタリング結果は QCC に再度格納されるようになりました。これにより、特にスキップインデックス（例: ベクターインデックスや転置インデックス）に依存し、インデックス解析が実行時間の大部分を占めるクエリの速度が大幅に向上します。 [#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird)).
* 小規模なクエリを高速化するためのマイクロ最適化を多数追加。 [#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano)).
* ネイティブプロトコルでログとプロファイルイベントを圧縮します。100 レプリカ以上のクラスタでは、非圧縮のプロファイルイベントは 1〜10 MB/秒 を消費し、低速なインターネット接続ではプログレスバーの更新が遅くなります。これにより [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533) が解決されました。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 大文字小文字を区別する文字列検索（`WHERE URL LIKE '%google%'` のようなフィルタリング処理）のパフォーマンスを、[StringZilla](https://github.com/ashvardanian/StringZilla) ライブラリを使用し、利用可能な場合には SIMD CPU 命令を活用することで向上させます。 [#84161](https://github.com/ClickHouse/ClickHouse/pull/84161) ([Raúl Marín](https://github.com/Algunenano))。
* `SimpleAggregateFunction(anyLast)` 型のカラムを持つテーブルに対して、`FINAL` 付きで AggregatingMergeTree テーブルから `SELECT` を実行する際のメモリ割り当ておよびメモリコピーを削減しました。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* 論理和（OR）を含む JOIN 述語のプッシュダウンに関するロジックを提供します。例として、TPC-H Q7 において 2 つのテーブル n1 と n2 に対する条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')` がある場合、それぞれのテーブルに対して部分フィルターを分離して抽出します。n1 に対しては `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'`、n2 に対しては `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'` となります。 [#84735](https://github.com/ClickHouse/ClickHouse/pull/84735)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 新しいデフォルト設定 `optimize_rewrite_like_perfect_affix` により、前方一致または後方一致の `LIKE` クエリのパフォーマンスが向上しました。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 複数の文字列/数値カラムでの GROUP BY 実行時に、大きなシリアライズされたキーが原因で発生するパフォーマンス低下を修正しました。これは [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) の後続対応です。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* キーごとのマッチが多数発生するハッシュ結合でのメモリ使用量を削減するため、新しい `joined_block_split_single_row` 設定を追加しました。これにより、左側テーブルの1行に対するマッチの範囲内であっても、ハッシュ結合結果をチャンクに分割できるようになります。これは、左側テーブルの1行が右側テーブルの数千行または数百万行とマッチする場合に特に有用です。以前は、すべてのマッチを一度にメモリ上にマテリアライズする必要がありました。この変更によりピークメモリ使用量は削減されますが、CPU 使用量が増加する可能性があります。 [#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* SharedMutex の改良（多数の同時クエリ実行時のパフォーマンスを向上）。 [#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano)).
* 出現頻度の低いトークンが大半を占めるドキュメントに対するテキストインデックス構築の性能を改善しました。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ)).
* Field デストラクタの一般的なケースを高速化し、多数の小さなクエリの処理性能を改善しました。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* JOIN 最適化中の実行時ハッシュテーブル統計の再計算をスキップするようにしました（JOIN を含むすべてのクエリのパフォーマンスが向上します）。新しいプロファイルイベント `JoinOptimizeMicroseconds` および `QueryPlanOptimizeMicroseconds` を追加しました。 [#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir))。
* MergeTreeLazy リーダーでマークをキャッシュに保存できるようにし、直接 I/O を回避します。これにより、ORDER BY と小さな LIMIT を含むクエリのパフォーマンスが向上します。 [#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat))。
* `is_deleted` 列を持つ `ReplacingMergeTree` テーブル上で `FINAL` 句を使用する SELECT クエリが、既存の 2 つの最適化における並列化の改善により、より高速に実行されるようになりました。1. 単一の `part` のみを持つテーブルパーティションに対する `do_not_merge_across_partitions_select_final` 最適化。2. その他の選択されたテーブル範囲を「交差する / 交差しない」に分割し、`FINAL` のマージ変換を通過させる必要があるのは交差する範囲のみとすること。[#88090](https://github.com/ClickHouse/ClickHouse/pull/88090)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* フェイルポイント未使用時のオーバーヘッドを削減しました（デバッグが有効でない場合に通るデフォルトのコードパス）。 [#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* `uuid` でフィルタする際に `system.tables` のフルスキャンを回避します（ログや ZooKeeper のパスから UUID しか取得できない場合に役立ちます）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 関数 `tokens`、`hasAllTokens`、`hasAnyTokens` のパフォーマンスを改善。[#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 一部のケースにおける JOIN のパフォーマンスをわずかに向上させるため、`AddedColumns::appendFromBlock` をインライン化しました。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat)).
* 複数の system テーブルに対してクエリを発行するのではなく `system.completions` を使用することで、クライアント側の補完がより高速かつ一貫性の高いものになります。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m)).
* `dictionary_block_frontcoding_compression` という新しいテキストインデックスパラメータを追加し、辞書圧縮を制御できるようにしました。デフォルトでは有効になっており、`front-coding` 圧縮が使用されます。 [#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov))。
* `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` の設定に応じて、マテリアライズドビューへ挿入する前にすべてのスレッドからのデータをまとめます。以前は、`parallel_view_processing` が有効な場合、特定のマテリアライズドビューに挿入する各スレッドが、それぞれ独立して挿入データをまとめていたため、生成されるパーツ数が多くなる可能性がありました。[#87280](https://github.com/ClickHouse/ClickHouse/pull/87280)（[Antonio Andelic](https://github.com/antonio2368)）。
* 一時ファイル書き込み用のバッファサイズを制御するための設定 `temporary_files_buffer_size` を追加。* `LowCardinality` 列に対する（たとえば Grace ハッシュ結合で使用される）`scatter` 演算のメモリ使用量を最適化。 [#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 並列レプリカを用いたテキストインデックスからの直接読み取りをサポートしました。オブジェクトストレージ上のテキストインデックスの読み取り性能を改善しました。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* Data Lakes カタログに登録されたテーブルを対象とするクエリでは、分散処理のために並列レプリカを使用します。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273)（[scanhex12](https://github.com/scanhex12)）。
* バックグラウンドマージアルゴリズムのチューニング用内部ヒューリスティック「to&#95;remove&#95;small&#95;parts&#95;at&#95;right」は、マージ範囲スコアの計算前に実行されるようになりました。これ以前は、マージセレクタはまず広範囲のマージを選択し、その末尾部分をフィルタリングしていました。この変更により修正された問題: [#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736)（[Mikhail Artemenko](https://github.com/Michicosun)）。





#### 改善

* これにより、関数 `generateSerialID` では系列名に非定数引数を指定できるようになりました。 [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750) をクローズ。 [#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい系列の開始値をカスタマイズできるようにするオプションの `start_value` パラメータを `generateSerialID` 関数に追加しました。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma)).
* `clickhouse-format` に `--semicolons_inline` オプションを追加し、クエリをフォーマットする際にセミコロンが新しい行ではなく最後の行の末尾に配置されるようにしました。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan)).
* Keeper で構成が上書きされている場合でも、サーバーレベルのスロットリングを設定できるようにしました。 [#73964](https://github.com/ClickHouse/ClickHouse/issues/73964) をクローズ。 [#74066](https://github.com/ClickHouse/ClickHouse/pull/74066) ([JIaQi](https://github.com/JiaQiTang98))。
* `mannWhitneyUTest` は、両方のサンプルが同一の値のみを含む場合に例外をスローしなくなりました。SciPy と整合する有効な結果を返すようになりました。これにより次の Issue が解決されました: [#79814](https://github.com/ClickHouse/ClickHouse/issues/79814)。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht))。
* メタデータトランザクションがコミットされると、ディスクオブジェクトストレージの書き換えトランザクションは、既存のリモート BLOB を削除します。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* 最適化の前後で結果型の `LowCardinality` が異なる場合の冗長な等価比較式に対する最適化パスを修正しました。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* HTTP クライアントが `Expect: 100-continue` に加えてヘッダー `X-ClickHouse-100-Continue: defer` を設定すると、ClickHouse はクォータ検証が完了して通過するまでクライアントに `100 Continue` レスポンスを送信しません。これにより、最終的に破棄されるリクエストボディを送信することで発生するネットワーク帯域幅の無駄を防ぎます。これは、クエリ自体は URL のクエリ文字列で送信し、データはリクエストボディで送信するような INSERT クエリにおいて有効です。リクエストボディ全体を送信せずにリクエストを中止すると、HTTP/1.1 でのコネクション再利用はできなくなりますが、新しいコネクションを確立する際に発生する追加のレイテンシは、大量データを扱う INSERT 全体の所要時間と比較すると、通常は無視できる程度です。 [#84304](https://github.com/ClickHouse/ClickHouse/pull/84304) ([c-end](https://github.com/c-end))。
* S3 ストレージを使用する DATABASE ENGINE = Backup 使用時には、ログ内の S3 認証情報をマスクします。[#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis))。
* 相関サブクエリの入力サブプランのマテリアライズを遅延させることで、クエリプランの最適化をその入力サブプランからも利用できるようにする。[#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。 [#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* SYSTEM DROP DATABASE REPLICA に対する変更: - データベースと一緒にレプリカを削除する場合、またはレプリカ全体を削除する場合: データベース内の各テーブルに対するレプリカも同様に削除されます - `WITH TABLES` が指定されている場合、各ストレージのレプリカを削除します - それ以外の場合、ロジックは変更されず、データベース上のレプリカのみを削除します - Keeper パス付きでデータベースのレプリカを削除する場合: - `WITH TABLES` が指定されている場合: - データベースを Atomic として復元します - Keeper 内のステートメントから RMT テーブルを復元します - データベースを削除します（復元されたテーブルも同時に削除されます） - それ以外の場合、指定された Keeper パス上のレプリカのみを削除します。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `materialize` 関数を含む場合の TTL のフォーマットの不整合を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズしました。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg テーブルの状態はストレージ オブジェクト内には保持されなくなりました。これにより、ClickHouse における Iceberg を同時実行クエリでも利用できるようになります。 [#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik)).
* `use_persistent_processing_nodes = 1` の場合の processing node と同様に、S3Queue の ordered mode における bucket lock を永続モードにしました。テストに Keeper のフォールトインジェクションを追加しました。[#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii))。
* フォーマット名にタイプミスがある場合、ユーザーにヒントを表示します。[#86761](https://github.com/ClickHouse/ClickHouse/issues/86761) をクローズします。[#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* リモートレプリカは、プロジェクションが存在しない場合、インデックス解析をスキップします。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* ytsaurus テーブルに対して UTF-8 エンコーディングを無効化できるようにしました。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* デフォルトで `s3_slow_all_threads_after_retryable_error` を無効にしました。 [#87198](https://github.com/ClickHouse/ClickHouse/pull/87198) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* テーブル関数 `arrowflight` を `arrowFlight` にリネームしました。 [#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-benchmark` を更新し、CLI フラグで `_` の代わりに `-` も使用できるようにしました。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda)).
* シグナル処理における `system.crash_log` へのフラッシュを同期的に行うようにしました。 [#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `ORDER BY` 句を持たないトップレベルの `SELECT` クエリに `ORDER BY rand()` を挿入する設定 `inject_random_order_for_select_without_order_by` を追加しました。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn)).
* `joinGet` のエラーメッセージを改善し、`join_keys` の数が `right_table_keys` の数と同じではないことを正しく示すようにしました。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 書き込みトランザクション中に任意の Keeper ノードの stat を確認できる機能を追加しました。これにより、ABA 問題の検出に役立ちます。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 高負荷な ytsaurus リクエストを heavy プロキシにリダイレクトするようにしました。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* ディスクトランザクション由来のメタデータについて、あらゆるワークロードで発生し得る unlink/rename/removeRecursive/removeDirectory などの操作のロールバックとハードリンク数を正しく扱えるように修正し、インターフェイスをより汎用的にして他のメタストアでも再利用しやすいよう簡素化しました。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper に対する `TCP_NODELAY` を無効化できる `keeper_server.tcp_nodelay` 設定パラメータを追加しました。 [#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* `clickhouse-benchmarks` で `--connection` をサポートしました。これは `clickhouse-client` がサポートしているものと同様で、クライアントの `config.xml`/`config.yaml` 内の `connections_credentials` パス配下に事前定義された接続を指定することで、コマンドライン引数で明示的にユーザー名/パスワードを指定する必要がなくなります。`clickhouse-benchmark` に `--accept-invalid-certificate` のサポートを追加しました。 [#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat)).
* `max_insert_threads` の設定が Iceberg テーブルにも適用されるようになりました。 [#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin))。
* `PrometheusMetricsWriter` にヒストグラムおよびディメンションメトリクスを追加しました。これにより、`PrometheusRequestHandler` ハンドラーで必要なメトリクスをすべてカバーでき、クラウド環境で信頼性が高く低オーバーヘッドなメトリクス収集に利用できるようになります。 [#87521](https://github.com/ClickHouse/ClickHouse/pull/87521) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 関数 `hasToken` は、空のトークンに対しては以前は例外をスローしていましたが、現在は一致ゼロ件を返すようになりました。 [#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* `Array` および `Map`（`mapKeys` と `mapValues`）の値に対するテキストインデックスのサポートを追加しました。サポートされる関数は `mapContainsKey` と `has` です。 [#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 期限切れとなったグローバル ZooKeeper セッションの数を示す、新しい `ZooKeeperSessionExpired` メトリクスを追加しました。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* バックアップ専用の設定（例：backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）を持つ S3 storage client を使用して、バックアップ先へのサーバーサイド（ネイティブ）コピーを行います。s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error を廃止します。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 実験的機能 `make_distributed_plan` を用いたクエリプランのシリアル化中に、設定 `max_joined_block_size_rows` および `max_joined_block_size_bytes` が誤って処理されていた問題を修正しました。[#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 設定 `enable_http_compression` は、現在デフォルトになっています。これは、クライアントが HTTP 圧縮を受け入れる場合、サーバーがそれを使用することを意味します。ただし、この変更にはいくつかのデメリットがあります。クライアントは `bzip2` のような重い圧縮方式を要求でき、これは妥当ではなく、サーバーのリソース消費量を増加させます（ただし、これは大きな結果セットが転送される場合にのみ顕在化します）。クライアントは `gzip` を要求することもできますが、これはそれほど悪くはないものの、`zstd` と比較すると最適ではありません。[#71591](https://github.com/ClickHouse/ClickHouse/issues/71591) をクローズしました。 [#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.server_settings` に新しいエントリ `keeper_hosts` を追加し、ClickHouse が接続可能な [Zoo]Keeper ホストの一覧を公開しました。 [#87718](https://github.com/ClickHouse/ClickHouse/pull/87718) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 履歴調査を容易にするために、システム ダッシュボードに `from` と `to` の値を追加しました。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* Iceberg の SELECT におけるパフォーマンス追跡用の情報をさらに追加しました。 [#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik)).
* ファイルシステムキャッシュの改善：キャッシュ領域を同時に予約するスレッド間で、キャッシュの優先度イテレータを再利用するようにしました。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Keeper` 向けのリクエストサイズを制限する機能を追加しました（`max_request_size` 設定。`ZooKeeper` の `jute.maxbuffer` と同等で、後方互換性のためデフォルトは OFF。今後のリリースで設定される予定です）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark` で、デフォルトではエラーメッセージにスタックトレースを含めないようにしました。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* マークがキャッシュにある場合は、スレッドプールによる非同期マーク読み込み（`load_marks_asynchronously=1`）は利用しないでください（スレッドプールが逼迫していると、マークがすでにキャッシュに存在していてもクエリに余分なペナルティが発生してしまうため）。[#87967](https://github.com/ClickHouse/ClickHouse/pull/87967)（[Azat Khuzhin](https://github.com/azat)）。
* Ytsaurus: 一部の列のみを指定してテーブル／テーブル関数／ディクショナリを作成できるようにしました。 [#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 今後は `system.zookeeper_connection_log` がデフォルトで有効になり、Keeper セッションに関する情報を取得するために使用できます。[#88011](https://github.com/ClickHouse/ClickHouse/pull/88011)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 重複した外部テーブルが渡される場合の TCP と HTTP の動作を一貫させました。HTTP では、一時テーブルを同じものを複数回渡すことが可能です。[#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema))。
* Arrow/ORC/Parquet の読み込み用に使用していたカスタム MemoryPool を削除しました。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 以降はすべてのアロケーションを追跡するようになったため、このコンポーネントは不要になりました。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 引数を指定せずに `Replicated` データベースを作成できるようにしました。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`: clickhouse-keeper の TLS ポートへの接続をサポートする機能を追加しました。フラグ名は clickhouse-client と同じもののままにしました。 [#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* バックグラウンドマージがメモリ制限を超過したために拒否された回数を追跡する新しいプロファイルイベントを追加しました。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse)).
* CREATE/ALTER TABLE ステートメントのカラムのデフォルト式検証用アナライザーを有効にします。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus))。
* 内部のクエリプランニングを改善：`CROSS JOIN` に `JoinStepLogical` を使用。[#88151](https://github.com/ClickHouse/ClickHouse/pull/88151)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `hasAnyTokens` および `hasAllTokens` 関数に、それぞれ `hasAnyToken` と `hasAllToken` のエイリアスを追加しました。 [#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov)).
* グローバルなサンプリングプロファイラをデフォルトで有効化しました（つまり、クエリに関連しないサーバースレッドも対象となります）。すべてのスレッドについて、CPU 時間および実時間のそれぞれ 10 秒ごとにスタックトレースを収集します。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* コピーおよびコンテナー作成機能で発生していた「Content-Length」問題の修正を取り込むように Azure SDK を更新。 [#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* MySQL との互換性を確保するため、`lag` 関数を大文字小文字を区別しないようにしました。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* `clickhouse-local` を `clickhouse-server` ディレクトリから起動できるようにしました。以前のバージョンでは、`Cannot parse UUID: .` というエラーが発生していました。現在では、サーバーを起動することなく `clickhouse-local` を起動し、サーバーのデータベースを操作できます。 [#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `keeper_server.coordination_settings.check_node_acl_on_remove` の設定を追加しました。この設定を有効にすると、各ノードを削除する前に、そのノード自身と親ノードの両方の ACL が検証されます。無効にした場合は、親ノードの ACL のみが検証されます。 [#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368)).
* `Vertical` フォーマットを使用する場合、`JSON` カラムが整形表示されるようになりました。[#81794](https://github.com/ClickHouse/ClickHouse/issues/81794) をクローズしました。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* `clickhouse-client` のファイル（例：クエリ履歴）は、ホームディレクトリ直下ではなく、[XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 仕様で定義されている場所に保存されるようになりました。`~/.clickhouse-client-history` がすでに存在する場合は、引き続きそれが使用されます。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `GLOBAL IN` によるメモリリークを修正しました（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* `hasAny` / `hasAllTokens` が文字列入力も受け付けられるようにオーバーロードを追加しました。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* ブート時に自動起動できるよう、`clickhouse-keeper` の postinstall スクリプトに有効化手順を追加しました。[#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan))。
* Web UI では、キー入力のたびではなく、貼り付け時にのみ認証情報をチェックするようにしました。これにより、誤って設定された LDAP サーバーで発生する問題を回避できます。これにより [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777) がクローズされました。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 制約違反が発生した場合の例外メッセージの長さを制限するようにしました。以前のバージョンでは、非常に長い文字列を挿入すると、同様に非常に長い例外メッセージが生成され、そのまま `query&#95;log` に書き込まれてしまうことがありました。[#87032](https://github.com/ClickHouse/ClickHouse/issues/87032) をクローズします。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* テーブル作成時に ArrowFlight サーバーからデータセットの構造を取得する処理を修正。 [#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* クライアントプロトコルのエラーを引き起こしていた GeoParquet を修正。 [#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* イニシエーターノード上のサブクエリ内で、shardNum() のようなホスト依存の関数が正しく解決されない問題を修正しました。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa)).
* `parseDateTime64BestEffort`、`change{Year,Month,Day}`、`makeDateTime64` など、さまざまな日付・時刻関連関数における、エポック前の日付時刻値の小数秒部分の不正な扱いを修正しました。これまでは、秒に対して小数秒部分を加算すべきところを減算していました。たとえば、`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` は、本来の `1969-01-01 00:00:00.468` ではなく `1968-12-31 23:59:59.532` を返していました。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 同じ ALTER 文の中でカラムの状態が変更された場合に ALTER COLUMN IF EXISTS コマンドが失敗していた問題を修正しました。DROP COLUMN IF EXISTS、MODIFY COLUMN IF EXISTS、COMMENT COLUMN IF EXISTS、RENAME COLUMN IF EXISTS といったコマンドは、同じ文中の前のコマンドでカラムが削除された場合でも、正しく処理できるようになりました。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* サポート対象外の日付に対する Date/DateTime/DateTime64 型の推論処理を修正しました。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* `AggregateFunction(quantileDD)` カラムにユーザーが送信した一部の有効なデータが書き込まれた場合に、マージ処理が無限再帰に陥ってクラッシュする問題を修正しました。 [#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi)).
* `cluster` テーブル関数で作成されたテーブルで JSON/Dynamic 型をサポートしました。 [#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar)).
* CTE 内で計算される関数の結果がクエリ内で非決定的になる問題を修正。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 主キー列に対する pointInPolygon を用いた EXPLAIN で発生する LOGICAL&#95;ERROR を修正。[#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 名前にパーセントエンコードされたシーケンスを含むデータレイクテーブルを修正しました。 [#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) をクローズしました。 [#87020](https://github.com/ClickHouse/ClickHouse/pull/87020) ([Anton Ivashkin](https://github.com/ianton-ru)).
* `optimize_functions_to_subcolumns` を使用した `OUTER JOIN` において、NULL を許容するカラムに対する `IS NULL` の誤った動作を修正し、[#78625](https://github.com/ClickHouse/ClickHouse/issues/78625) をクローズ。 [#87058](https://github.com/ClickHouse/ClickHouse/pull/87058) ([Vladimir Cherkasov](https://github.com/vdimir))。
* `max_temporary_data_on_disk_size` 制限の追跡における一時データ解放時の誤った計上を修正し、[#87118](https://github.com/ClickHouse/ClickHouse/issues/87118) をクローズしました。 [#87140](https://github.com/ClickHouse/ClickHouse/pull/87140) ([JIaQi](https://github.com/JiaQiTang98)).
* 関数 checkHeaders は、渡されたヘッダーを正しく検証し、禁止されているヘッダーを拒否するようになりました。原著者: Michael Anastasakis (@michael-anastasakis)。 [#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* すべての数値型に対して `toDate` と `toDate32` が同一の動作をするようにしました。int16 型からのキャスト時に発生していた Date32 のアンダーフロー検査を修正しました。[#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 特に LEFT または INNER JOIN の後に RIGHT JOIN が続く、複数の JOIN を含むクエリに対する parallel replicas における論理エラーを修正。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter)).
* スキーマ推論キャッシュで設定 `input_format_try_infer_variants` を考慮するようにしました。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* pathStartsWith がプレフィックス配下のパスにのみマッチするようにしました。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* `_row_number` 仮想カラムおよび Iceberg の positioned delete に関する論理エラーを修正しました。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321)).
* const ブロックと非 const ブロックが混在していることが原因で、`JOIN` において発生する「Too large size passed to allocator」`LOGICAL_ERROR` を修正しました。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat))。
* 別の `MergeTree` テーブルを読み取るサブクエリを使用する軽量更新を修正。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* 行ポリシーが存在する場合に動作していなかった move-to-prewhere 最適化を修正しました。[#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) の継続対応です。[#69777](https://github.com/ClickHouse/ClickHouse/issues/69777) をクローズしました。[#83748](https://github.com/ClickHouse/ClickHouse/issues/83748) をクローズしました。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* デフォルト式を持つもののデータパーツに存在しないカラムへのパッチ適用を修正しました。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* MergeTree テーブルで重複したパーティションフィールド名を使用すると発生していたセグメンテーションフォルトを修正しました。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* EmbeddedRocksDB のアップグレード処理を修正しました。 [#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano))。
* テキストインデックスをオブジェクトストレージから直接読み取る処理を修正しました。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないエンジンに対する権限が作成されないようにしました。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* `s3_plain_rewritable` については、`not found` エラーだけを無視するようにしました（それ以外のエラーを無視すると、さまざまな問題につながる可能性があります）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* YTSaurus ソースと *range&#95;hashed レイアウトを使用するディクショナリの不具合を修正しました。 [#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 空のタプル配列の作成を修正。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 一時テーブル作成時に不正なカラムを検出するようにしました。 [#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* format ヘッダーに hive パーティション列を含めないようにしました。 [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515) を修正。 [#87528](https://github.com/ClickHouse/ClickHouse/pull/87528)（[Arthur Passos](https://github.com/arthurpassos)）。
* テキストフォーマット使用時の DeltaLake における format からの読み取り準備処理を修正。 [#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* SELECT および INSERT に対する Buffer テーブルのアクセス検証を修正。[#87545](https://github.com/ClickHouse/ClickHouse/pull/87545)（[pufit](https://github.com/pufit)）。
* S3 テーブルに対する data skipping インデックスの作成を禁止しました。 [#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc)).
* async logging（10時間で約100GiB規模の大きなドリフトが生じ得る）および text&#95;log（ほぼ同程度のドリフトが生じ得る）における tracked memory のリークを防止。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* 非同期で削除されたビューまたはマテリアライズドビューについて、バックグラウンドクリーンアップが完了する前にサーバーが再起動されると、そのビューの SELECT 設定によってグローバルなサーバー設定が上書きされてしまう可能性があるバグを修正しました。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix)).
* メモリ過負荷に関する警告を算出する際、可能であればユーザースペースのページキャッシュのバイト数を除外します。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* CSV デシリアライズ時に型の順序が誤っていると `LOGICAL_ERROR` が発生していたバグを修正しました。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 実行型辞書に対する `command_read_timeout` の誤った処理を修正しました。 [#87627](https://github.com/ClickHouse/ClickHouse/pull/87627) ([Azat Khuzhin](https://github.com/azat)).
* 新しいアナライザー使用時に、WHERE 句で置換された列をフィルタリングする際の SELECT * REPLACE の誤った動作を修正しました。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `Distributed` 上で `Merge` を使用した場合の二段階の集約を修正しました。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end))。
* `right row list` が使用されていない場合の HashJoin アルゴリズムにおける出力ブロックの生成を修正します。[#87401](https://github.com/ClickHouse/ClickHouse/issues/87401) を解決します。 [#87699](https://github.com/ClickHouse/ClickHouse/pull/87699) ([Dmitry Novik](https://github.com/novikd))。
* インデックス解析の適用後に読み取るデータが存在しない場合、並列レプリカの読み取りモードが誤って選択されてしまう可能性がありました。これにより [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653) をクローズ。 [#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi)).
* Glue における `timestamp` / `timestamptz` 列の処理を修正。[#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand)).
* これにより [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587) がクローズされます。 [#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* PostgreSQL インターフェースにおける boolean 値の書き込み処理を修正。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov))。
* CTE を使用する INSERT SELECT クエリで発生する unknown table エラーを修正、[#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。[#87789](https://github.com/ClickHouse/ClickHouse/pull/87789)（[Guang Zhao](https://github.com/zheguang)）。
* Nullable に含めることができない Variants からの null map サブカラム読み取り処理を修正。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* クラスタ上のセカンダリノードでデータベースを完全に削除できなかった場合のエラー処理を修正。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* いくつかのスキップインデックスに関するバグを修正しました。 [#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano)).
* AzureBlobStorage において、まずネイティブコピーを試行し、&#39;Unauthroized&#39; エラーが発生した場合に read &amp; write にフォールバックするように更新しました（AzureBlobStorage では、ソースとデスティネーションのストレージアカウントが異なる場合に &#39;Unauthorized&#39; エラーが発生します）。また、エンドポイントが設定で定義されている場合に &quot;use&#95;native&#95;copy&quot; を適用する処理を修正しました。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* ArrowStream ファイルに非一意な辞書が含まれていると、ClickHouse がクラッシュしていました。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn)).
* approx&#95;top&#95;k および finalizeAggregation の使用時に発生していた致命的な不具合を修正。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411))。
* 最後のブロックが空の場合でも projection を使用したマージが正しく動作するよう修正。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano)).
* 引数の型が GROUP BY で許可されていない場合でも、GROUP BY から全単射関数を削除しないようになりました。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリで `session_timezone` 設定を使用した場合に、DateTime ベースのキーに対する granule/パーティションの除外が誤って行われる問題を修正しました。 [#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa)).
* PostgreSQL インターフェイスで、クエリ実行後に影響を受けた行数を返すようになりました。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov)).
* 誤った結果を招く可能性があるため、PASTE JOIN に対するフィルタープッシュダウンの使用を制限しました。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) で導入された権限チェックを行う前に、URI の正規化を適用します。 [#88089](https://github.com/ClickHouse/ClickHouse/pull/88089) ([pufit](https://github.com/pufit))。
* 新しいアナライザで、`ARRAY JOIN COLUMNS()` がどの列とも一致しない場合に発生していた論理エラーを修正。 [#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* &quot;High ClickHouse memory usage&quot; 警告を修正（ページキャッシュを除外して計算）。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* set 型の列に `TTL` が設定された `MergeTree` テーブルで発生しうるデータ破損の問題を修正しました。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 外部データベース（`PostgreSQL` / `SQLite` / ...）がアタッチされており、その中に不正なテーブルが存在する場合に、`system.tables` を読み取る際に発生し得る捕捉されない例外を修正しました。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 空のタプル引数で呼び出されたときにクラッシュする `mortonEncode` および `hilbertEncode` 関数の問題を修正しました。 [#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* これにより、クラスタ内に非アクティブなレプリカが存在する場合でも、`ON CLUSTER` クエリの実行時間が短くなります。 [#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin)).
* DDL worker は、レプリカセットから古くなったホストをクリーンアップするようになりました。これにより、ZooKeeper に保存されるメタデータの量が削減されます。 [#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin)).
* cgroups を使用せずに ClickHouse を実行できない問題を修正（誤って cgroups が非同期メトリクスの必須要件となっていた）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* エラー発生時にディレクトリ移動操作を正しくロールバックできるようにしました。実行中に変更された `prefix.path` オブジェクトは、ルートのものだけでなく、すべてを書き戻す必要があります。 [#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `ColumnLowCardinality` における `is_shared` フラグの伝播を修正しました。これは、`ReverseIndex` 内でハッシュ値がすでに事前計算されてキャッシュされた後に、新しい値がカラムへ挿入された場合、誤った GROUP BY の結果を引き起こす可能性がありました。[#88213](https://github.com/ClickHouse/ClickHouse/pull/88213)（[Nikita Taranov](https://github.com/nickitat)）。
* ワークロード設定項目 `max_cpu_share` の不具合を修正しました。これにより、ワークロード設定 `max_cpus` を指定していなくても使用できるようになりました。 [#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria)).
* サブクエリを含む非常に重い mutation が prepare 段階で進行しなくなってしまうバグを修正しました。これらの mutation は、`SYSTEM STOP MERGES` で停止できるようになりました。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* これにより、相関サブクエリがオブジェクトストレージでも利用できるようになりました。 [#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin)).
* `system.projections` と `system.data_skipping_indices` へアクセスしている間は、DataLake データベースの初期化を試みないでください。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* `show_data_lake_catalogs_in_system_tables` を明示的に有効化した場合にのみ、データレイクカタログが system のイントロスペクションテーブルに表示されるようになりました。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin)).
* DatabaseReplicated が `interserver_http_host` 設定を正しく使用するように修正しました。 [#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* Projection を定義する際の文脈では位置引数の使用が明示的に無効化されました。これは、この内部クエリ段階においては位置引数が妥当でないためです。これにより [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604) が修正されました。[#88380](https://github.com/ClickHouse/ClickHouse/pull/88380)（[Amos Bird](https://github.com/amosbird)）。
* `countMatches` 関数の二乗時間計算量を解消。[#88400](https://github.com/ClickHouse/ClickHouse/issues/88400) をクローズ。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* KeeperMap テーブルに対する `ALTER COLUMN ... COMMENT` コマンドがレプリケートされ、Replicated データベースのメタデータにコミットされてすべてのレプリカに伝搬されるようにしました。 [#88077](https://github.com/ClickHouse/ClickHouse/issues/88077) をクローズ。 [#88408](https://github.com/ClickHouse/ClickHouse/pull/88408) ([Eduard Karacharov](https://github.com/korowa)).
* Database Replicated データベースにおけるマテリアライズドビューで発生していた、誤った循環依存関係のケースを修正しました。これにより、新しいレプリカをデータベースに追加できなくなる問題が発生していました。 [#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique))。
* `group_by_overflow_mode` が `any` に設定されている場合のスパース列の集計を修正。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa)).
* `query_plan_use_logical_join_step=0` を複数の FULL JOIN USING 句と併用した際に発生していた「column not found」エラーを修正。[#88103](https://github.com/ClickHouse/ClickHouse/issues/88103) をクローズ。[#88473](https://github.com/ClickHouse/ClickHouse/pull/88473)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* ノード数が 10 を超える大規模クラスタでは、`[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 &lt;Trace&gt;: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` というエラーによりリストアが失敗する可能性が高くなります。`num_hosts` ノードが多くのホストによって同時に上書きされてしまうためです。この修正では、試行回数を制御する設定を動的に行えるようにしました。[#87721](https://github.com/ClickHouse/ClickHouse/issues/87721) をクローズします。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* このPRは、バージョン23.8およびそれ以前との互換性を確保するためだけのものです。互換性の問題は次のPRによって導入されました: [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) このSQLは `enable_analyzer=0` の場合に失敗します（23.8以前では問題ありませんでした）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491) ([JIaQi](https://github.com/JiaQiTang98))。
* 大きな値を DateTime に変換する際の `accurateCast` エラーメッセージで UBSAN が検出する整数オーバーフローを修正。 [#88520](https://github.com/ClickHouse/ClickHouse/pull/88520) ([xiaohuanlin](https://github.com/xiaohuanlin))
* タプル型向けの CoalescingMergeTree を修正。これにより [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469) がクローズされます。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* `iceberg_format_version=1` に対する削除操作を禁止しました。これにより [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444) がクローズされました。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* このパッチでは、任意の深さのフォルダに対する `plain-rewritable` ディスクの移動処理を修正します。 [#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun)).
* *cluster 関数における SQL SECURITY DEFINER を修正。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 基盤となる const PREWHERE 列の同時更新によって発生し得るクラッシュを修正。 [#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat)).
* テキストインデックスからの読み取りを修正し、クエリ条件キャッシュを有効にしました（設定 `use_skip_indexes_on_data_read` と `use_query_condition_cache` を有効にした状態）。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` から `Poco::TimeoutException` がスローされると、SIGABRT によりクラッシュします。 [#88668](https://github.com/ClickHouse/ClickHouse/pull/88668) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) にバックポート: 復旧後、Replicated データベースのレプリカが長時間にわたって `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを出力し続けてスタックしてしまうことがありましたが、修正されました。 [#88671](https://github.com/ClickHouse/ClickHouse/pull/88671) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 設定を再読み込みした後に ClickHouse が初めて接続する場合に、`system.zookeeper_connection_log` への追記が正しく行われるように修正。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* `date_time_overflow_behavior = 'saturate'` を設定している場合に、DateTime64 を Date に変換すると、タイムゾーンを考慮する際に範囲外の値に対して誤った結果を返す可能性があったバグを修正しました。 [#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma))。
* キャッシュを有効にした S3 テーブルエンジンで発生する &quot;having zero bytes error&quot; の N 回目の修正。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `loop` テーブル関数に対する SELECT 時のアクセス検証を修正しました。 [#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit)).
* 非同期ロギングの失敗時に例外を捕捉し、プログラムが異常終了しないようにしました。 [#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) にバックポート済み: `top_k` が単一の引数で呼び出された場合に threshold パラメータを正しく考慮するように修正。[#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) にバックポート済み: 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、4 バイト長の UTF-8 コードポイントのバイト列を誤って反転していました。これにより [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) でバックポート済み: SQL SECURITY DEFINER 付きでビューを作成する際に、`SET DEFINER <current_user>:definer` のアクセス権限をチェックしないようにしました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968)（[pufit](https://github.com/pufit)）。
* [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) にバックポート済み: 部分的な `QBit` 読み取りの最適化により、`p` が `Nullable` の場合に戻り値型から誤って `Nullable` が削除されていた `L2DistanceTransposed(vec1, vec2, p)` における `LOGICAL_ERROR` を修正しました。 [#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) にバックポート済み: 不明なカタログタイプで発生するクラッシュを修正。[#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解決。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) でバックポートされました。スキップインデックス解析時のパフォーマンス低下を修正しました。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。



#### ビルド／テスト／パッケージングの改善
* `postgres` ライブラリのバージョン 18.0 を使用。[#87647](https://github.com/ClickHouse/ClickHouse/pull/87647)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* FreeBSD で ICU を有効化。[#87891](https://github.com/ClickHouse/ClickHouse/pull/87891)（[Raúl Marín](https://github.com/Algunenano)）。
* 動的ディスパッチを SSE 4.2 に対して行う場合には、SSE 4 ではなく SSE 4.2 を使用。[#88029](https://github.com/ClickHouse/ClickHouse/pull/88029)（[Raúl Marín](https://github.com/Algunenano)）。
* `Speculative Store Bypass Safe` が利用できない場合でも、`NO_ARMV81_OR_HIGHER` フラグを必須にしない。[#88051](https://github.com/ClickHouse/ClickHouse/pull/88051)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* ClickHouse が `ENABLE_LIBFIU=OFF` でビルドされている場合、フェイルポイント関連の関数は no-op（何もしない）となり、パフォーマンスに影響を与えなくなる。この場合、`SYSTEM ENABLE/DISABLE FAILPOINT` クエリは `SUPPORT_IS_DISABLED` エラーを返す。[#88184](https://github.com/ClickHouse/ClickHouse/pull/88184)（[c-end](https://github.com/c-end)）。


### ClickHouse リリース 25.9, 2025-09-25 {#259}

#### 後方互換性のない変更
* IPv4/IPv6 に対する意味のないバイナリ演算を無効化。IPv4/IPv6 と非整数型との加算／減算は行えなくなった。以前は浮動小数点型との演算を許可し、他の一部の型（DateTime など）では論理エラーを投げていた。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336)（[Raúl Marín](https://github.com/Algunenano)）。
* 設定 `allow_dynamic_metadata_for_data_lakes` を非推奨化。現在は、すべての iceberg テーブルが各クエリの実行前にストレージから最新のテーブルスキーマを取得しようとする。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366)（[Daniil Ivanik](https://github.com/divanik)）。
* `OUTER JOIN ... USING` 句からの coalesce されたカラムの解決方法を、より一貫性のあるものに変更。以前は、OUTER JOIN で USING カラムと修飾されたカラム（`a, t1.a, t2.a`）の両方を選択する場合、USING カラムが誤って `t1.a` に解決され、左側に対応する行がない右テーブルの行に対して 0/NULL を表示していた。現在は、USING 句内の識別子は常に coalesce 済みカラムに解決され、一方で修飾された識別子は、クエリ内に他にどの識別子が存在するかに関わらず、非 coalesce カラムに解決される。例: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- Before: a=0, t1.a=0, t2.a=2 (incorrect - 'a' resolved to t1.a) -- After: a=2, t1.a=0, t2.a=2 (correct - 'a' is coalesced).``` [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* レプリケートテーブルの重複排除ウィンドウを最大 10000 まで拡大。この変更は完全に互換性があるが、多数のテーブルが存在する場合に高いリソース消費につながるシナリオが想定される。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820)（[Sema Checherinda](https://github.com/CheSema)）。



#### 新機能

* ユーザーは、NATS エンジンで新しい設定項目 `nats_stream` と `nats_consumer` を指定することで、NATS JetStream を使用してメッセージを購読できるようになりました。[#84799](https://github.com/ClickHouse/ClickHouse/pull/84799)（[Dmitry Novikov](https://github.com/dmitry-sles-novikov)）。
* `arrowFlight` テーブル関数に認証と SSL のサポートを追加しました。 [#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar)).
* `storage_class_name` という名前の新しいパラメータを `S3` テーブルエンジンおよび `s3` テーブル関数に追加しました。このパラメータにより、AWS がサポートする Intelligent-Tiering を指定できます。キー・バリュー形式と位置引数形式（非推奨）の両方をサポートします。 [#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin))。
* Iceberg テーブルエンジンでの `ALTER UPDATE` をサポート。[#86059](https://github.com/ClickHouse/ClickHouse/pull/86059)（[scanhex12](https://github.com/scanhex12)）。
* SELECT 文の実行時に Iceberg メタデータファイルを取得するためのシステムテーブル `iceberg_metadata_log` を追加。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152)（[scanhex12](https://github.com/scanhex12)）。
* `Iceberg` および `DeltaLake` テーブルで、ストレージレベルの `disk` 設定を通じたカスタムディスク構成がサポートされました。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12))。
* データレイクディスクで Azure をサポート。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* Azure Blob Storage 上での `Unity` カタログをサポート。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `Iceberg` への書き込みで、より多くのフォーマット（`ORC`、`Avro`）をサポートしました。これにより [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179) がクローズされました。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* データベースレプリカに関する情報を含む新しいシステムテーブル `database_replicas` を追加しました。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov))。
* 配列から別の配列を集合として差し引く `arrayExcept` 関数が追加されました。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x))。
* 新しい `system.aggregated_zookeeper_log` テーブルを追加します。このテーブルには、セッション ID、親パス、操作種別ごとにグループ化された ZooKeeper 操作の統計情報（例: 操作回数、平均レイテンシー、エラー数）が含まれ、定期的にディスクに書き出されます。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新しい関数 `isValidASCII`。入力文字列または FixedString が ASCII バイト (0x00–0x7F) のみで構成されている場合は 1 を、それ以外の場合は 0 を返します。[#85377](https://github.com/ClickHouse/ClickHouse/issues/85377) をクローズしました。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* ブール値の設定は引数なしで指定できます。例えば `SET use_query_cache;` のように書くと、自動的に true に設定したことと同じ意味になります。 [#85800](https://github.com/ClickHouse/ClickHouse/pull/85800) ([thraeka](https://github.com/thraeka))。
* 新しい設定オプション `logger.startupLevel` と `logger.shutdownLevel` により、それぞれ ClickHouse の起動時およびシャットダウン時のログレベルを上書き設定できるようになりました。 [#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 集約関数 `timeSeriesChangesToGrid` と `timeSeriesResetsToGrid`。`timeSeriesRateToGrid` と同様に動作し、開始タイムスタンプ、終了タイムスタンプ、ステップ、ルックバックウィンドウのパラメータに加え、タイムスタンプと値の 2 つの引数を受け取りますが、各ウィンドウにつき少なくとも 1 サンプル（2 サンプルではなく）を必要とします。パラメータで定義されたタイムグリッド内の各タイムスタンプについて、指定されたウィンドウ内でサンプル値が変化または減少した回数をカウントする PromQL の `changes` / `resets` 関数を計算します。戻り値の型は `Array(Nullable(Float64))` です。[#86010](https://github.com/ClickHouse/ClickHouse/pull/86010)（[Stephen Chi](https://github.com/stephchi0)）。
* ユーザーが一時テーブルの作成と同様の構文（`CREATE TEMPORARY VIEW`）で一時ビューを作成できるようにします。[#86432](https://github.com/ClickHouse/ClickHouse/pull/86432)（[Aly Kafoury](https://github.com/AlyHKafoury)）。
* `system.warnings` テーブルに CPU およびメモリ使用量に関する警告を追加しました。 [#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc)).
* `Protobuf` 入力で `oneof` インジケーターをサポートしました。`oneof` の一部の存在を示すために専用のカラムを使用できます。メッセージに [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) が含まれていて、かつ `input_format_protobuf_oneof_presence` が設定されている場合、ClickHouse はその oneof のどのフィールドが存在するかを示すカラムを設定します。[#82885](https://github.com/ClickHouse/ClickHouse/pull/82885)（[Ilya Golshtein](https://github.com/ilejn)）。
* jemalloc の内部ツールに基づいてメモリアロケーションのプロファイリングを改善しました。グローバル jemalloc プロファイラは、設定 `jemalloc_enable_global_profiler` で有効化できるようになりました。サンプリングされたグローバルなアロケーションおよびデアロケーションは、設定 `jemalloc_collect_global_profile_samples_in_trace_log` を有効にすることで、`system.trace_log` の `JemallocSample` 型として保存できるようになりました。jemalloc プロファイリングは、設定 `jemalloc_enable_profiler` を使用してクエリごとに個別に有効化できるようになりました。`system.trace_log` へのサンプル保存は、設定 `jemalloc_collect_profile_samples_in_trace_log` を使用してクエリ単位で制御できます。jemalloc をより新しいバージョンに更新しました。 [#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* Iceberg テーブルの DROP 時にファイルを削除するための新しい設定。これにより [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211) がクローズされました。[#86501](https://github.com/ClickHouse/ClickHouse/pull/86501)（[scanhex12](https://github.com/scanhex12)）。



#### 実験的機能
* 転置テキストインデックスが、RAM に収まらないデータセットに対してもスケーラブルになるように、ゼロから作り直されました。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* JOIN の順序付けに統計情報が使用されるようになりました。この機能は `allow_statistics_optimize = 1` と `query_plan_optimize_join_order_limit = 10` を設定することで有効化できます。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* `alter table ... materialize statistics all` をサポートし、テーブルに対してすべての統計情報をマテリアライズできるようになりました。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 読み取り時にスキップインデックスを使用してデータパーツをフィルタリングし、不要なインデックス読み取りを削減できるようにしました。新しい設定 `use_skip_indexes_on_data_read`（デフォルトは無効）で制御されます。これは [#75774](https://github.com/ClickHouse/ClickHouse/issues/75774) に対応するものです。また、[#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) と共通する基盤処理の一部も含まれています。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* `query_plan_optimize_join_order_limit` 設定によって制御される、パフォーマンス向上のために JOIN を自動的に並べ替える JOIN 順序最適化を追加しました。なお、この JOIN 順序最適化は現時点では統計情報のサポートが限定的であり、主にストレージエンジンからの行数推定に依存しています。より高度な統計収集およびカーディナリティ推定は今後のリリースで追加される予定です。**アップグレード後に JOIN クエリで問題が発生した場合**、一時的な回避策として `SET query_plan_use_new_logical_join_step = 0` を設定して新しい実装を無効化し、その上で問題を報告して調査を依頼してください。**USING 句からの識別子の解決に関する注意**: `OUTER JOIN ... USING` 句における coalesce された列（USING によりマージされた列）の解決方法を、より一貫性のあるものに変更しました。以前は、OUTER JOIN で USING 列と修飾された列 (`a, t1.a, t2.a`) の両方を選択した場合、USING 列が誤って `t1.a` に解決され、左側にマッチしない右テーブルからの行について 0/NULL が表示されていました。現在では、USING 句からの識別子は常に coalesce された列に解決され、修飾された識別子は、クエリ内に他にどの識別子が存在するかにかかわらず、coalesce されていない元の列に解決されます。例えば、次のようになります: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前: a=0, t1.a=0, t2.a=2 (誤り - &#39;a&#39; が t1.a に解決されている) -- 変更後: a=2, t1.a=0, t2.a=2 (正しい - &#39;a&#39; は coalesce されている)。 [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイク向けの分散 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12)).
* `func(primary_column) = 'xx'` や `column in (xxx)` のような条件に対する PREWHERE の最適化を改善しました。 [#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li))。
* JOIN の書き換えを実装しました。1. フィルタ条件が、マッチした行またはマッチしなかった行に対して常に偽となる場合、`LEFT ANY JOIN` と `RIGHT ANY JOIN` を `SEMI`/`ANTI` JOIN に変換します。この最適化は、新しい設定 `query_plan_convert_any_join_to_semi_or_anti_join` によって制御されます。2. 片側の非マッチ行に対してフィルタ条件が常に偽となる場合、`FULL ALL JOIN` を `LEFT ALL` または `RIGHT ALL` JOIN に変換します。 [#86028](https://github.com/ClickHouse/ClickHouse/pull/86028) ([Dmitry Novik](https://github.com/novikd))。
* 軽量削除実行後の垂直マージのパフォーマンスを改善しました。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* `LEFT/RIGHT` Join でマッチしない行が多数存在する場合の `HashJoin` の性能をわずかに向上しました。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat)).
* 基数ソート: コンパイラが SIMD を利用し、より効率的にプリフェッチできるようにします。Intel CPU 上でのみソフトウェア・プリフェッチを使うために動的ディスパッチを使用します。[@taiyang-li](https://github.com/ClickHouse/ClickHouse/pull/77029) による作業を継続したものです。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 多数のパーツを持つテーブルに対する短いクエリのパフォーマンスを改善（`deque` の代わりに `devector` を使用することで `MarkRanges` を最適化）。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* 結合モードにおけるパッチパーツの適用パフォーマンスを改善しました。 [#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 設定 `query_condition_cache_selectivity_threshold`（デフォルト値: 1.0）を追加しました。これにより、選択性の低い述語のスキャン結果はクエリ条件キャッシュへの挿入対象から除外されます。その代償としてキャッシュヒット率は低下しますが、クエリ条件キャッシュのメモリ使用量を削減できます。 [#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai)).
* Iceberg への書き込み時に使用するメモリ量を削減しました。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).





#### 改善

* 1 回の INSERT で Iceberg に複数のデータファイルを書き込むことをサポートしました。上限を制御するために、新しい設定 `iceberg_insert_max_rows_in_data_file` と `iceberg_insert_max_bytes_in_data_file` を追加しました。 [#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* Delta Lake に挿入されるデータファイルごとの行数およびバイト数の上限を追加しました。設定 `delta_lake_insert_max_rows_in_data_file` と `delta_lake_insert_max_bytes_in_data_file` によって制御されます。 [#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg への書き込みにおいて、パーティションに使用できる型の種類を拡張しました。これにより [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206) がクローズされました。 [#86298](https://github.com/ClickHouse/ClickHouse/pull/86298) ([scanhex12](https://github.com/scanhex12))。
* S3 のリトライ戦略を設定可能にし、設定用 XML ファイルを変更した場合に S3 ディスクの設定をホットリロードできるようにしました。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* S3(Azure)Queue テーブルエンジンを改善し、ZooKeeper への接続が失われても重複が発生することなく処理を継続できるようにしました。これには、S3Queue の設定 `use_persistent_processing_nodes` を有効にする必要があります（`ALTER TABLE MODIFY SETTING` で変更可能）。[#85995](https://github.com/ClickHouse/ClickHouse/pull/85995)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `TO` の後にクエリパラメータを使用してマテリアライズドビューを作成できます。例えば、`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table` のように記述します。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899) ([Diskein](https://github.com/Diskein))。
* `Kafka2` テーブルエンジンに対して不正な設定が指定された場合に、ユーザー向けの案内をより明確にしました。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `Time` 型にタイムゾーンを指定することはできなくなりました（そもそも意味のない指定だったためです）。 [#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `best_effort` モードでの Time/Time64 型のパースに関連するロジックを簡素化し、発生し得るいくつかのバグを回避できるようにしました。 [#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* クラスターモード向けの `deltaLakeAzure` と同様の `deltaLakeAzureCluster` 関数と、`deltaLakeCluster` のエイリアスである `deltaLakeS3Cluster` 関数を追加し、[#85358](https://github.com/ClickHouse/ClickHouse/issues/85358) を解決しました。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* バックアップ時と同様に、通常のコピー操作にも `azure_max_single_part_copy_size` 設定を適用します。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* S3 Object Storage でリトライ可能なエラーが発生した場合に、S3 クライアントスレッドをスローダウンするようにしました。これにより、従来の設定 `backup_slow_all_threads_after_retryable_s3_error` を S3 ディスクにも拡張し、より汎用的な名前である `s3_slow_all_threads_after_retryable_error` に名称変更しました。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva)).
* 設定 allow&#95;experimental&#95;variant/dynamic/json および enable&#95;variant/dynamic/json は非推奨としてマークされました。現在は 3 種類すべてが無条件に有効化されています。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* `http_handlers` で完全な URL 文字列（スキーマおよび host:port を含む）によるフィルタリング（`full_url` ディレクティブ）のサポートを追加。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `allow_experimental_delta_lake_writes` を追加しました。 [#86180](https://github.com/ClickHouse/ClickHouse/pull/86180) ([Kseniia Sumarokova](https://github.com/kssenii))。
* init.d スクリプトにおける systemd の検出ロジックを修正し、「Install packages」チェックの問題を解消。 [#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat)).
* 新しい `startup_scripts_failure_reason` 次元メトリクスを追加します。このメトリクスは、起動スクリプトの失敗を引き起こすさまざまなエラータイプを区別するために必要です。特にアラート目的で、一過性のエラー（例: `MEMORY_LIMIT_EXCEEDED` や `KEEPER_EXCEPTION`）と非一過性のエラーを区別する必要があります。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* Iceberg テーブルのパーティション指定で `identity` 関数を省略できるようにしました。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 特定のチャネルに対してのみ JSON 形式のログ出力を有効化できるようになりました。これを行うには、`logger.formatting.channel` を `syslog`/`console`/`errorlog`/`log` のいずれかに設定してください。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句でネイティブな数値を使用できるようにしました。これらはすでに論理関数の引数としては使用可能でした。これにより、filter-push-down および move-to-prewhere の各最適化が簡素化されます。 [#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* メタデータが破損したカタログに対して `SYSTEM DROP REPLICA` を実行した際に発生していたエラーを修正しました。 [#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Azure では、アクセスのプロビジョニングに時間がかかる場合があるため、ディスクアクセスチェック（`skip_access_check = 0`）に対するリトライ回数を増やしました。 [#86419](https://github.com/ClickHouse/ClickHouse/pull/86419) ([Alexander Tokmakov](https://github.com/tavplubix))。
* `timeSeries*()` 関数の staleness ウィンドウを左開区間・右閉区間にしました。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* `FailedInternal*Query` プロファイルイベントを追加しました。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude)).
* 設定ファイル経由で追加された、名前にドットを含むユーザーの処理を修正します。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme))。
* クエリにおけるメモリ使用量の非同期メトリクス（`QueriesMemoryUsage` および `QueriesPeakMemoryUsage`）を追加しました。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark --precise` フラグを使用すると、QPS およびその他のインターバルごとのメトリクスをより正確に報告できます。クエリの実行時間がレポート間隔 `--delay D` と同程度の場合に、QPS を安定して得るのに役立ちます。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa))。
* Linux スレッドの nice 値を構成可能にし、一部のスレッド（merge/mutate、query、マテリアライズドビュー、ZooKeeper クライアント）により高いまたは低い優先度を割り当てられるようにしました。 [#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 競合状態が原因でマルチパートアップロード中に元の例外が失われた場合に発生する、誤解を招く「specified upload does not exist」エラーを修正。[#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva))。
* `EXPLAIN` クエリにおけるクエリプランの説明を制限しました。`EXPLAIN` 以外のクエリについては説明を生成しないようにしました。設定 `query_plan_max_step_description_length` を追加しました。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 保留中のシグナルを調整できるようにして、`CANNOT_CREATE_TIMER`（クエリプロファイラ用の `query_profiler_real_time_period_ns` / `query_profiler_cpu_time_period_ns`）を回避できる可能性を高めました。また、イントロスペクションのために `/proc/self/status` から `SigQ` を収集するようにしました（`ProcessSignalQueueSize` が `ProcessSignalQueueLimit` に近い場合、`CANNOT_CREATE_TIMER` エラーが発生しやすくなります）。 [#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat))。
* Keeper における `RemoveRecursive` リクエストのパフォーマンスを改善。 [#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* JSON 型の出力時に `PrettyJSONEachRow` に含まれる余分な空白を削除しました。 [#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar)).
* プレーンな書き込み可能ディスクでディレクトリを削除する際に、`prefix.path` の BLOB サイズを記録するようにしました。 [#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin)).
* リモートの ClickHouse インスタンス（ClickHouse Cloud を含む）に対してパフォーマンス テストを実行できるようになりました。使用例: `tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。 [#86995](https://github.com/ClickHouse/ClickHouse/pull/86995) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 16MiB超のメモリを割り当てることが知られている箇所（ソート、非同期インサート、ファイルログ）でメモリ制限を遵守するようにしました。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* `network_compression_method` がサポートされている汎用コーデック以外に設定されている場合は、例外をスローします。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* システムテーブル `system.query_cache` は、これまでは共有エントリ、または同一ユーザーかつ同一ロールの非共有エントリのみを返していましたが、今では *すべての* クエリ結果キャッシュエントリを返すようになりました。非共有エントリは *クエリ結果* を公開しないことが前提となっており、一方で `system.query_cache` は *クエリ文字列* を返す仕様になっているため、これは問題ありません。この変更により、システムテーブルの挙動は `system.query_log` により近いものになりました。 [#87104](https://github.com/ClickHouse/ClickHouse/pull/87104) ([Robert Schulze](https://github.com/rschu1ze))。
* `parseDateTime` 関数で短絡評価を有効にしました。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar))。
* `system.parts_columns` に新しいカラム `statistics` を追加しました。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* レプリケートされたデータベースおよび内部レプリケーションされるテーブルに対しては、`ALTER` クエリの結果は発行元ノード上でのみ検証されます。これにより、すでにコミット済みの `ALTER` クエリが他のノード上で停止してしまう状況が解消されます。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `BackgroundSchedulePool` における各種タスクの数を制限します。1 つの種類のタスクだけですべてのスロットが占有され、他のタスクがスタベーション（飢餓状態）に陥る状況を防ぎます。また、タスク同士が互いを待機することによるデッドロックも回避します。これは `background_schedule_pool_max_parallel_tasks_per_type_ratio` サーバー設定によって制御されます。[#84008](https://github.com/ClickHouse/ClickHouse/pull/84008)（[Alexander Tokmakov](https://github.com/tavplubix)）。
* データベースレプリカを復旧する際は、テーブルを正しくシャットダウンする必要があります。適切にシャットダウンしないと、データベースレプリカの復旧中に一部のテーブルエンジンで LOGICAL&#95;ERROR が発生することがあります。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* データベース名のタイプミス修正候補を生成する際に、アクセス権をチェックするように変更しました。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd)).
* 1. Hive カラムに対する LowCardinality 2. 仮想カラムの前に Hive カラムを埋める（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必須） 3. Hive 向けの空フォーマットに対する LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. Hive のパーティションカラムのみが存在する場合のチェックを修正 5. すべての Hive カラムがスキーマで指定されていることをアサート 6. Hive を用いた parallel&#95;replicas&#95;cluster の一部修正 7. Hive utils の extractkeyValuePairs で順序付きコンテナを使用する（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必須）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538)（[Arthur Passos](https://github.com/arthurpassos)）。
* 配列マッピング使用時にエラーの原因となることがあった `IN` 関数の第1引数に対する不要な最適化を防止しました。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parquet ファイルが書き込まれた際に、Iceberg の source id と Parquet 名の対応関係がスキーマに合わせて調整されていませんでした。この PR では、現在のスキーマではなく、各 Iceberg データファイルに対して関連するスキーマを処理します。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik)).
* ファイルのオープンとは別にファイルサイズを読み取っていた処理を修正します。これは、`5.10` リリース以前の Linux カーネルに存在したバグへの対応として導入された [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) に関連しています。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* カーネルレベルで IPv6 が無効化されているシステム（例: ipv6.disable=1 が設定された RHEL）でも、ClickHouse Keeper が起動に失敗することはなくなりました。最初の IPv6 リスナーの作成に失敗した場合、IPv4 リスナーへのフォールバックを試みるようになりました。 [#85901](https://github.com/ClickHouse/ClickHouse/pull/85901) ([jskong1124](https://github.com/jskong1124))。
* このPRは [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990) をクローズします。globalJoin における parallel replicas を対象とした TableFunctionRemote のサポートを追加しました。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929)（[zoomxi](https://github.com/zoomxi)）。
* orcschemareader::initializeifneeded() のヌルポインタ不具合を修正。 このPRは次の issue を解決します: [#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### ユーザー向け変更に関するドキュメントエントリ。 [#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510)).
* FROM 句内の相関サブクエリに対し、外側クエリの列を参照している場合にのみ許可するチェックを追加。[#85469](https://github.com/ClickHouse/ClickHouse/issues/85469) を修正。[#85402](https://github.com/ClickHouse/ClickHouse/issues/85402) を修正。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 他のカラムのマテリアライズド式でサブカラムが使用されているカラムに対する `ALTER UPDATE` 文の動作を修正しました。以前は、式内にサブカラムを含むマテリアライズドカラムが正しく更新されていませんでした。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* PK またはパーティション式でサブカラムが使用されているカラムを変更することを禁止しました。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* DeltaLake ストレージにおいて、非デフォルトのカラムマッピングモードを使用している場合のサブカラムの読み取りを修正しました。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* JSON 内の Enum ヒント付きパスで誤ったデフォルト値が使用されていた問題を修正。 [#86065](https://github.com/ClickHouse/ClickHouse/pull/86065) ([Pavel Kruglov](https://github.com/Avogar)).
* DataLake の Hive カタログ URL をパースする際に、入力をサニタイズするようにしました。[#86018](https://github.com/ClickHouse/ClickHouse/issues/86018) をクローズします。[#86092](https://github.com/ClickHouse/ClickHouse/pull/86092)（[rajat mohan](https://github.com/rajatmohan22)）。
* ファイルシステムキャッシュの動的リサイズ時に発生する論理エラーを修正。 [#86122](https://github.com/ClickHouse/ClickHouse/issues/86122) をクローズ。 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473) をクローズ。 [#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DatabaseReplicatedSettings において `logs_to_keep` には `NonZeroUInt64` 型を使用するようにしました。 [#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach)).
* テーブル（例：`ReplacingMergeTree`）が設定 `index_granularity_bytes = 0` で作成されていた場合、スキップインデックスを使用する `FINAL` クエリで例外がスローされていました。この例外は修正されました。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 未定義動作（UB）を排除し、Iceberg のパーティション式のパースに関する問題を修正します。 [#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik)).
* 1 つの INSERT 文内で const ブロックと非 const ブロックが混在している場合に発生するクラッシュを修正。 [#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* SQL からディスクを作成する際、デフォルトで `/etc/metrika.xml` の include を処理するようになりました。 [#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar))。
* String から JSON への変換における accurateCastOrNull/accurateCastOrDefault 関数を修正。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* iceberg エンジンで &#39;/&#39; を含まないディレクトリをサポート。[#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12))。
* replaceRegex で FixedString 型の haystack と空の needle を使用した場合にクラッシュする問題を修正しました。 [#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano)).
* Nullable(JSON) に対する ALTER UPDATE 実行時のクラッシュを修正。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar)).
* system.tables で欠落していた列の definer を修正。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* LowCardinality(Nullable(T)) から Dynamic への型変換を修正。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar)).
* DeltaLake への書き込み時に発生する論理エラーを修正。[#86175](https://github.com/ClickHouse/ClickHouse/issues/86175) をクローズ。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* plain&#95;rewritable disk で Azure Blob Storage から空の blob を読み取る際に発生していた `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` エラーを修正。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* GROUP BY Nullable(JSON) の不具合を修正。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar)).
* マテリアライズドビューのバグを修正しました。同じ名前の MV を作成してから削除し、その後に再作成した場合に、正しく動作しないことがありました。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix)).
* *cluster 関数から読み取る際に、すべてのレプリカが利用不能な場合は失敗します。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher)).
* `Buffer` テーブルで発生していた `MergesMutationsMemoryTracking` のリークを修正し、`Kafka` などからのストリーミング向けの `query_views_log` を修正。[#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* エイリアスストレージの参照テーブルを削除した後の `SHOW TABLES` の動作を修正。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* send&#95;chunk&#95;header が有効で、HTTP プロトコル経由で UDF が呼び出された場合にチャンクヘッダーが欠落していた問題を修正しました。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir)).
* jemalloc のプロファイルフラッシュを有効にした場合に発生する可能性のあるデッドロックを修正。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* DeltaLake テーブルエンジンでのサブカラムの読み取りを修正しました。 [#86204](https://github.com/ClickHouse/ClickHouse/issues/86204) をクローズ。 [#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DDL タスク処理時の競合を回避するために、ループバックホストIDの扱いを適切に修正。[#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach))。
* numeric/decimal カラムを含む Postgres データベースエンジンテーブルに対する detach/attach を修正。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher)).
* getSubcolumnType での未初期化メモリの使用を修正。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano)).
* 空の needle で呼び出された場合、関数 `searchAny` および `searchAll` は、今後は `true`（いわゆる「すべてにマッチ」）を返すようになりました。以前は `false` を返していました。（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 最初のバケットに値が存在しない場合の `timeSeriesResampleToGridWithStaleness()` 関数の挙動を修正しました。 [#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar))。
* `merge_tree_min_read_task_size` が 0 に設定されていたことが原因で発生していたクラッシュを修正。 [#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 読み込み時には、各データファイルのフォーマットを Iceberg メタデータから取得するようになりました（以前はテーブル引数から取得していました）。[#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時のログフラッシュ中に発生する例外を無視し、SIGSEGV を回避してシャットダウン処理をより安全にしました。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* サイズ 0 のパートファイルを含むクエリで例外をスローしていた Backup データベースエンジンの問題を修正しました。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* send&#95;chunk&#95;header が有効で、HTTP プロトコル経由で UDF が呼び出された場合にチャンクヘッダーが欠落していた問題を修正。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* keeper セッションの有効期限切れが原因で発生していた S3Queue の論理エラー &quot;Expected current processor {} to be equal to {}&quot; を修正しました。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii)).
* INSERT およびプルーニングにおける Nullability のバグを修正。これにより [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407) がクローズされます。[#86630](https://github.com/ClickHouse/ClickHouse/pull/86630) ([scanhex12](https://github.com/scanhex12))。
* Iceberg のメタデータキャッシュが無効化されている場合は、ファイルシステムキャッシュを無効化しないでください。 [#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik))。
* Parquet リーダー v3 で発生していた &#39;Deadlock in Parquet::ReadManager (single-threaded)&#39; エラーを修正しました。 [#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321)).
* ArrowFlight の `listen_host` での IPv6 サポートを修正しました。 [#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar))。
* `ArrowFlight` ハンドラーのシャットダウン処理を修正。この PR は [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596) を解決します。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `describe_compact_output=1` によって分散クエリの問題を修正しました。[#86676](https://github.com/ClickHouse/ClickHouse/pull/86676)（[Azat Khuzhin](https://github.com/azat)）。
* ウィンドウ定義の構文解析およびクエリパラメータの適用処理を修正。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* `PARTITION BY` を指定しているもののパーティションのワイルドカードを使用していないテーブルを作成する際に、25.8 より前のバージョンでは動作していたケースで発生していた例外 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` を修正しました。 [https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567) をクローズしました。 [#86748](https://github.com/ClickHouse/ClickHouse/pull/86748) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 並列クエリが単一ロックの取得を試みた場合に発生していた LogicalError を修正。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* RowBinary 入力フォーマットにおける JSON 共有データに NULL が書き込まれる問題を修正し、ColumnObject にいくつかの追加検証を導入しました。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* limit 指定時の空の Tuple permutation に関する問題を修正しました。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar))。
* 永続処理ノード用に個別の keeper ノードを使用しないようにしました。次の修正に対応: [https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995)。Closes [#86406](https://github.com/ClickHouse/ClickHouse/issues/86406)。[#86841](https://github.com/ClickHouse/ClickHouse/pull/86841)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Replicated データベースで新しいレプリカを作成できなくなっていた TimeSeries エンジンテーブルの問題を修正。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* 特定の Keeper ノードが存在しないタスクがある場合に、`system.distributed_ddl_queue` をクエリできない問題を修正しました。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 解凍済みブロック末尾でのシーク処理を修正。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg Iterator の非同期実行中にスローされる例外を処理するようにしました。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* サイズの大きい前処理済み XML 設定ファイルの保存処理を修正しました。 [#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* system.iceberg&#95;metadata&#95;log テーブルにおける date フィールドへの値の設定を修正。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* `WHERE` を使用した場合に `TTL` が無限に再計算されてしまう問題を修正しました。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* `ROLLUP` および `CUBE` 修飾子を使用した際に `uniqExact` 関数が誤った結果を返す可能性があった問題を修正しました。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat)).
* `parallel_replicas_for_cluster_functions` 設定値が 1 の場合に、`url()` テーブル関数でテーブルスキーマを解決する処理の問題を修正。 [#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `PREWHERE` の出力を複数のステップに分割した後も正しくキャストされるように修正しました。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* 軽量更新での `ON CLUSTER` 句の扱いを修正しました。 [#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の集約関数状態の `String` 引数との互換性を修正しました。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar)).
* OpenAI からのモデル名が渡されていなかった不具合を修正します。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB: パスは user&#95;files ディレクトリ配下でなければなりません。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano)).
* 25.1 より前に作成された KeeperMap テーブルで、DROP クエリの実行後も ZooKeeper にデータが残り続ける問題を修正。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* Parquet 読み取り時の map および array フィールド ID の扱いを修正。 [#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* 遅延マテリアライゼーションにおいて、配列サイズを表すサブカラムを持つ配列の読み取りを修正。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型引数を取る CASE 関数を修正。 [#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar)).
* CSV で空文字列から空配列を読み取る際の処理を修正。 [#87182](https://github.com/ClickHouse/ClickHouse/pull/87182) ([Pavel Kruglov](https://github.com/Avogar)).
* 非相関な `EXISTS` で誤った結果が返る可能性があった問題を修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) で導入された `execute_exists_as_scalar_subquery=1` により、バージョン `25.8` で不具合が生じていました。 [#86415](https://github.com/ClickHouse/ClickHouse/issues/86415) を修正します。 [#87207](https://github.com/ClickHouse/ClickHouse/pull/87207) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* `iceberg_metadata_log` が設定されていないにもかかわらず、ユーザーが Iceberg メタデータのデバッグ情報を取得しようとした場合にエラーを送出するようにしました。`nullptr` 参照の問題を修正しました。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik))。



#### ビルド／テスト／パッケージングの改善
* abseil-cpp 20250814.0 との互換性の問題を修正しました。https://github.com/abseil/abseil-cpp/issues/1923。 [#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat)).
* スタンドアロン WASM lexer のビルドをフラグで制御するようにしました。 [#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `vmull_p64` 命令をサポートしていない古い ARM CPU 上での crc32c ビルドを修正しました。 [#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos)).
* `openldap` 2.6.10 を使用するようにしました。 [#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* darwin 上で `memalign` をフックしようとしないようにしました。 [#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `krb5` 1.22.1-final を使用するようにしました。 [#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `list-licenses.sh` における Rust crate 名の展開処理を修正しました。 [#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able)).


### ClickHouse リリース 25.8 LTS, 2025-08-28 {#258}



#### 後方互換性のない変更
* JSON 内で異なる型の値を含む配列に対して、名前のない `Tuple` の代わりに `Array(Dynamic)` を推論するようにしました。以前の動作を使用するには、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` を無効にしてください。 [#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 一貫性とシンプルさのため、S3 レイテンシメトリクスをヒストグラムに移行しました。 [#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* デフォルト式内の識別子にドットが含まれている場合、それらが複合識別子としてパースされるのを防ぐため、バッククォートで囲むことを必須にしました。 [#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 遅延マテリアライゼーションは、アナライザ有効時（デフォルト）のみ有効になります。これは、アナライザなしでの保守を避けるためであり、我々の経験ではアナライザなしではいくつかの問題（例えば、条件内で `indexHint()` を使用する場合）があるためです。 [#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* Parquet 出力フォーマットにおいて、デフォルトで `Enum` 型の値を `ENUM` 論理型を持つ `BYTE_ARRAY` として書き出すようにしました。 [#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree 設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツからのサブカラム読み取りのパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーでは、新しい Compact パーツを読み取ることはできません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前の `concurrent_threads_scheduler` のデフォルト値は `round_robin` でしたが、多数の単一スレッドクエリ（例: INSERT）の存在時に不公平であることが判明しました。この変更により、より安全な代替である `fair_round_robin` スケジューラがデフォルトになります。 [#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse は PostgreSQL スタイルの heredoc 構文 `$tag$ string contents... $tag$`（ドル引用文字列リテラル）をサポートしています。これまでのバージョンではタグに対する制約が少なく、句読点や空白を含む任意の文字を使用できました。これは、ドル文字で開始できる識別子との間でパースの曖昧性を生む可能性があります。一方で、PostgreSQL ではタグには単語構成文字のみが許可されています。この問題を解決するため、heredoc タグには単語構成文字のみが含まれるように制限しました。これにより [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731) がクローズされました。 [#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `azureBlobStorage`、`deltaLakeAzure`、`icebergAzure` は、`AZURE` 権限を正しく検証するように更新されました。すべてのクラスタ変種の関数（`-Cluster` 関数）は、対応する非クラスタ版に対して権限を検証するようになりました。さらに、`icebergLocal` および `deltaLakeLocal` 関数は `FILE` 権限チェックを必須とするようになりました。 [#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `allow_dynamic_metadata_for_data_lakes` 設定（テーブルエンジンレベルの設定）をデフォルトで有効化しました。 [#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* JSON フォーマットにおいて、64 ビット整数をデフォルトで引用符付きで出力しないようにしました。 [#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))



#### 新機能

* PromQL 方言の基本的なサポートが追加されました。これを利用するには、clickhouse-client で `dialect='promql'` を設定し、設定項目 `promql_table_name='X'` で TimeSeries テーブルを指定し、`rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` のようなクエリを実行します。さらに、PromQL クエリを SQL から呼び出すこともできます: `SELECT * FROM prometheusQuery('up', ...);`。現時点では `rate`、`delta`、`increase` 関数のみがサポートされています。単項演算子および二項演算子はサポートされていません。HTTP API もありません。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI を用いた SQL 生成機能は、環境変数 ANTHROPIC&#95;API&#95;KEY および OPENAI&#95;API&#95;KEY が設定されている場合には、それらから推論できるようになりました。これにより、この機能を設定不要で利用できるオプションが追加されました。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik)).
* [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) プロトコルのサポートを実装しました。内容: - 新しいテーブル関数 `arrowflight` を追加。 [#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600)).
* これにより、すべてのテーブルが（`Merge` エンジンのテーブルだけでなく）`_table` 仮想カラムをサポートするようになりました。これは特に UNION ALL を使用するクエリで有用です。 [#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 外部集約／ソート処理で、任意のストレージポリシー（S3 などのオブジェクトストレージを含む）を使用可能にしました。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 明示的に指定した IAM ロールを用いた AWS S3 認証を実装しました。GCS 向けに OAuth を実装しました。これらの機能は最近まで ClickHouse Cloud でのみ利用可能でしたが、今回オープンソース化されました。オブジェクトストレージ向けの接続パラメータのシリアル化など、いくつかのインターフェースを統一しました。 [#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Iceberg TableEngine で position delete をサポート。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* Iceberg の equality delete に対応しました。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* CREATE 用の Iceberg 書き込みを実装。[#83927](https://github.com/ClickHouse/ClickHouse/issues/83927) をクローズ。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 書き込み向け Glue カタログ対応。 [#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* 書き込み用の Iceberg REST カタログ。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* すべての Iceberg の position delete ファイルをデータファイルにマージします。これにより、Iceberg ストレージ内の Parquet ファイルの数とサイズを削減できます。構文は `OPTIMIZE TABLE table_name` です。[#85250](https://github.com/ClickHouse/ClickHouse/pull/85250)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Iceberg に対する `DROP TABLE` をサポート（REST/Glue カタログからの削除 + テーブルメタデータの削除）。[#85395](https://github.com/ClickHouse/ClickHouse/pull/85395)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* merge-on-read フォーマットの Iceberg での ALTER DELETE ミューテーションをサポートしました。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* DeltaLake への書き込みをサポートしました。[#79603](https://github.com/ClickHouse/ClickHouse/issues/79603) をクローズ。[#85564](https://github.com/ClickHouse/ClickHouse/pull/85564)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* テーブルエンジン `DeltaLake` で特定のスナップショットバージョンを読み取るための設定 `delta_lake_snapshot_version` を追加しました。 [#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* min-max プルーニングのために、より多くの Iceberg 統計情報（カラムサイズ、下限値および上限値）をメタデータ（マニフェストエントリ）に書き込むようにしました。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 単純な型に対する Iceberg のカラム追加・削除・変更をサポートしました。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg: version-hint ファイルへの書き込みをサポートしました。これにより [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097) がクローズされました。 [#85130](https://github.com/ClickHouse/ClickHouse/pull/85130) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 一時ユーザーによって作成された View は、対応する実ユーザーのコピーを保存するようになり、一時ユーザーが削除された後も無効化されなくなりました。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* ベクトル類似度インデックスはバイナリ量子化をサポートするようになりました。バイナリ量子化によりメモリ消費量が大幅に削減され、（距離計算が高速になるため）ベクトルインデックスの構築処理も高速化されます。また、既存の設定 `vector_search_postfilter_multiplier` は廃止され、より汎用的な設定 `vector_search_index_fetch_multiplier` に置き換えられました。[#85024](https://github.com/ClickHouse/ClickHouse/pull/85024)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `s3` または `s3Cluster` テーブルエンジン／関数でキーと値の形式による引数指定を許可しました。たとえば `s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')` のように指定できます。 [#85134](https://github.com/ClickHouse/ClickHouse/pull/85134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Kafka のようなエンジンからのエラーとなった受信メッセージを保持するための新しいシステムテーブル（「デッドレターキュー」）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn)).
* Replicated データベース向けの新しい SYSTEM RESTORE DATABASE REPLICA を追加しました。これは ReplicatedMergeTree における既存のリストア機能と同様のものです。 [#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov)).
* PostgreSQL プロトコルで `COPY` コマンドがサポートされるようになりました。 [#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* MySQL プロトコル用の C# クライアントをサポートしました。これにより [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992) がクローズされました。[#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Hive パーティション形式での読み取りおよび書き込みのサポートを追加。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* ZooKeeper 接続に関する履歴情報を保存するための `zookeeper_connection_log` システムテーブルを追加しました。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* サーバー設定 `cpu_slot_preemption` により、ワークロード向けのプリエンプティブな CPU スケジューリングが有効になり、ワークロード間での CPU 時間の max-min 公平な割り当てが保証されます。CPU スロットリング用の新しいワークロード設定が追加されました: `max_cpus`、`max_cpu_share`、`max_burst_cpu_seconds`。詳細: [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。[#80879](https://github.com/ClickHouse/ClickHouse/pull/80879)（[Sergei Trifonov](https://github.com/serxa)）。
* 設定されたクエリ数または時間しきい値に達した時点で TCP 接続を切断します。これにより、ロードバランサー配下のクラスタノード間で接続の分散をより均一にできます。[#68000](https://github.com/ClickHouse/ClickHouse/issues/68000) を解決します。[#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* 並列レプリカでクエリにプロジェクションを使用できるようになりました。 [#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。 [#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi))。
* DESCRIBE (SELECT ...) に加えて DESCRIBE SELECT をサポートしました。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* mysql&#95;port と postgresql&#95;port に対してセキュアな接続を強制します。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* ユーザーは、`JSONExtractCaseInsensitive`（および `JSONExtract` の他のバリアント）を使用して、大文字小文字を区別しない JSON キーの参照を行えるようになりました。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* `system.completions` テーブルを導入。[#81889](https://github.com/ClickHouse/ClickHouse/issues/81889) をクローズ。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833)（[|2ustam](https://github.com/RuS2m)）。
* 新しい関数 `nowInBlock64` を追加しました。使用例：`SELECT nowInBlock64(6)` を実行すると、`2025-07-29 17:09:37.775725` が返されます。 [#84178](https://github.com/ClickHouse/ClickHouse/pull/84178) ([Halersson Paris](https://github.com/halersson)).
* client&#95;id と tenant&#95;id で認証できるようにするため、AzureBlobStorage に extra&#95;credentials を追加しました。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* DateTime 型の値を UUIDv7 に変換する関数 `dateTimeToUUIDv7` を追加しました。使用例：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` は `0198af18-8320-7a7d-abd3-358db23b9d5c` を返します。 [#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich))。
* `timeSeriesDerivToGrid` および `timeSeriesPredictLinearToGrid` 集約関数により、指定された開始タイムスタンプ・終了タイムスタンプ・ステップで定義される時間グリッドにデータを再サンプリングし、それぞれ PromQL の `deriv` および `predict_linear` に類似した計算を行います。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0)).
* 2 つの新しい TimeSeries 関数を追加しました: - `timeSeriesRange(start_timestamp, end_timestamp, step)`, - `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`. [#85435](https://github.com/ClickHouse/ClickHouse/pull/85435) ([Vitaly Baranov](https://github.com/vitlibar)).
* 新しい構文 `GRANT READ ON S3('s3://foo/.*') TO user` が追加されました。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503)（[pufit](https://github.com/pufit)）。
* 新しい出力形式として `Hash` を追加しました。この形式は、結果のすべての列および行に対して単一のハッシュ値を計算します。たとえばデータ転送がボトルネックとなるユースケースで、結果の「フィンガープリント」を計算するのに有用です。例: `SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` は `e5f9e676db098fdb9530d2059d8c23ef` を返します。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeper Multi クエリで任意のウォッチを設定できる機能を追加しました。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `clickhouse-benchmark` ツールにオプション `--max-concurrency` を追加し、このオプションにより並列クエリ数を段階的に増やすモードを有効にします。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* 部分的に集約されたメトリクスをサポートします。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### 実験的機能
* 相関サブクエリのサポートをデフォルトで有効化しました。もはや実験的機能ではありません。 [#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd)).
* Unity、Glue、REST、および Hive Metastore のデータレイクカタログを実験的段階からベータ版に昇格しました。 [#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator)).
* 軽量な更新および削除を実験的段階からベータ版に昇格しました。
* ベクター類似性インデックスを用いた近似ベクター検索が一般提供（GA）になりました。 [#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze)).
* Ytsaurus テーブルエンジンおよびテーブル関数。 [#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 以前は、テキストインデックスのデータは複数のセグメントに分割されていました（各セグメントサイズはデフォルトで 256 MiB）。これはテキストインデックス構築時のメモリ消費を削減する可能性がありますが、その一方でディスク上の必要容量を増加させ、クエリの応答時間を長くしていました。 [#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov)).



#### パフォーマンスの向上

* 新しい Parquet リーダーの実装。従来より高速で、ページレベルのフィルタープッシュダウンと PREWHERE をサポートします。現時点では実験的機能です。有効にするには設定 `input_format_parquet_use_native_reader_v3` を有効にしてください。 [#82789](https://github.com/ClickHouse/ClickHouse/pull/82789) ([Michael Kolupaev](https://github.com/al13n321)).
* Azure Blob Storage 向けの公式 Azure ライブラリの HTTP トランスポートを、独自実装の HTTP クライアントに置き換えました。このクライアントには、S3 向けクライアントの設定を反映した複数の設定項目を用意しました。Azure と S3 の両方に対して、積極的な（短めの）接続タイムアウトを導入しました。Azure プロファイルのイベントおよびメトリクスの観測性を改善しました。新しいクライアントはデフォルトで有効になっており、Azure Blob Storage 上でのコールドクエリのレイテンシを大幅に改善します。旧 `Curl` クライアントは、`azure_sdk_use_native_client=false` を設定することで戻すことができます。 [#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。これまでの公式の Azure クライアント実装は、本番環境での利用には適しておらず、5 秒から数分に及ぶ深刻なレイテンシスパイクが発生していました。このひどい実装は廃止しており、その点を大いに誇りに思っています。
* ファイルサイズが小さいインデックスから順に処理します。最終的なインデックスの処理順では、（それぞれ単純さと選択性により）minmax インデックスとベクターインデックスを優先し、その後にその他の小さいインデックスを処理します。minmax／ベクターインデックス内でも、よりファイルサイズの小さいインデックスが優先されます。 [#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal)).
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツに対するサブカラム読み取りのパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーでは、新しい Compact パーツを読み取れません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* `azureBlobStorage` テーブルエンジン: スロットリングを回避するため、可能な場合は管理対象 ID の認証トークンをキャッシュして再利用するようにしました。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak))。
* 右側が結合キー列に関数従属している場合（すべての行が一意の結合キー値を持つ場合）、`ALL` `LEFT/INNER` JOIN は自動的に `RightAny` に変換されます。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat))。
* `max_joined_block_size_rows` に加えて `max_joined_block_size_bytes` を追加し、サイズの大きなカラムを含む JOIN のメモリ使用量を制限できるようにしました。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `enable_producing_buckets_out_of_order_in_aggregation` という設定（デフォルトで有効）で制御される新しいロジックを追加しました。これにより、メモリ効率の高い集約処理中に、一部のバケットを順不同で送信できるようになります。特定の集約バケットのマージに他よりも大幅に時間がかかる場合に、イニシエータがその間により大きなバケット ID を持つバケットをマージできるようになるため、パフォーマンスが向上します。欠点としては、メモリ使用量が増加する可能性があります（ただし顕著な増加にはならないはずです）。 [#80179](https://github.com/ClickHouse/ClickHouse/pull/80179) ([Nikita Taranov](https://github.com/nickitat)).
* `optimize_rewrite_regexp_functions` 設定（デフォルトで有効）を導入しました。この設定により、特定の正規表現パターンが検出された場合、オプティマイザは一部の `replaceRegexpAll`、`replaceRegexpOne`、`extract` 呼び出しを、より単純で効率的な形式に書き換えられるようになります。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* ハッシュ JOIN のメインループの外側で `max_joined_block_rows` を処理するように変更。ALL JOIN のパフォーマンスがわずかに向上。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* より細かい粒度の min-max インデックスを先に処理するようにしました。[#75381](https://github.com/ClickHouse/ClickHouse/issues/75381) をクローズ。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* `DISTINCT` ウィンドウ集約が線形時間で動作するようにし、`sumDistinct` のバグを修正しました。[#79792](https://github.com/ClickHouse/ClickHouse/issues/79792) をクローズしました。[#52253](https://github.com/ClickHouse/ClickHouse/issues/52253) をクローズしました。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取りの削減と CPU 使用率の低減により、より低いレイテンシで完了します。 [#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 並列レプリカ間のワークロード分散におけるキャッシュ局所性を向上させるためのランデブーハッシュ方式。 [#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* If コンビネーターに対して addManyDefaults を実装し、If コンビネーターを用いる集約関数がより高速に動作するようになりました。 [#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 複数の文字列または数値カラムで `GROUP BY` する際に、シリアライズされたキーを列指向で計算するようにしました。 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li))
* インデックス解析の結果、並列レプリカ読み取りの対象範囲が空になる場合に、フルスキャンを行わないようにしました。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* パフォーマンステストをより安定させるために、`-falign-functions=64` を使用してみる。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* ブルームフィルターインデックスは、`column` が `Array` 型ではない場合の `has([c1, c2, ...], column)` のような条件にも使用されるようになりました。これにより、そのようなクエリのパフォーマンスが向上し、`IN` 演算子と同程度の効率で実行できるようになりました。 [#83945](https://github.com/ClickHouse/ClickHouse/pull/83945) ([Doron David](https://github.com/dorki)).
* CompressedReadBufferBase::readCompressedData における不要な memcpy 呼び出しを削減しました。 [#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 一時データを削除して `largestTriangleThreeBuckets` を最適化。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コードの単純化により文字列デシリアライズを最適化。[#38564](https://github.com/ClickHouse/ClickHouse/issues/38564) をクローズ。 [#84561](https://github.com/ClickHouse/ClickHouse/pull/84561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 並列レプリカにおける最小タスクサイズの計算を修正しました。 [#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat)).
* `Join` モードにおけるパッチパーツ適用処理のパフォーマンスを改善しました。 [#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* ゼロバイトに関する問題を修正しました。[#85062](https://github.com/ClickHouse/ClickHouse/issues/85062) をクローズします。いくつかの軽微なバグを修正しました。関数 `structureToProtobufSchema` と `structureToCapnProtoSchema` は、ゼロ終端バイトを正しく付与せず、その代わりに改行を使用していました。これにより、出力中の改行が欠落し、ゼロバイトに依存する他の関数（`logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero`、`encrypt`/`decrypt` など）を使用した場合にバッファオーバーフローを引き起こす可能性がありました。`regexp_tree` 辞書レイアウトは、ゼロバイトを含む文字列の処理をサポートしていませんでした。`formatRowNoNewline` 関数は、`Values` フォーマット、または行末に改行を含まないその他のフォーマットで呼び出された場合に、出力の最後の 1 文字を誤って切り捨てていました。関数 `stem` には例外安全性の不具合があり、非常にまれな状況でメモリリークにつながる可能性がありました。`initcap` 関数は `FixedString` 引数に対して誤った動作をしており、同じブロック内で直前の文字列が単語文字で終わっている場合、文字列先頭を単語の開始位置として認識しませんでした。Apache `ORC` フォーマットのセキュリティ脆弱性を修正しました。これは未初期化メモリの露出につながる可能性がありました。関数 `replaceRegexpAll` と、それに対応するエイリアス `REGEXP_REPLACE` の動作を変更しました。これにより、`^a*|a*$` や `^|.*` のように、前のマッチが文字列全体を処理した場合でも、文字列末尾で空マッチを行えるようになりました。これは JavaScript、Perl、Python、PHP、Ruby のセマンティクスに対応しますが、PostgreSQL のセマンティクスとは異なります。多くの関数の実装を単純化および最適化しました。複数の関数について、誤っていたドキュメントを修正しました。String 列および String 列を含む複合型に対する `byteSize` の出力は（空文字列 1 つあたり 9 バイトから 8 バイトへと）変更されており、これは正常な挙動であることに注意してください。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 単一行のみを返す目的で定数をマテリアライズしているケースにおいて、その処理を最適化しました。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* delta-kernel-rs バックエンドでファイル処理の並列性を向上。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `enable_add_distinct_to_in_subqueries` が導入されました。有効化すると、ClickHouse は分散クエリの `IN` 句内にあるサブクエリに対して自動的に `DISTINCT` を付加します。これにより、シャード間で転送される一時テーブルのサイズを大幅に削減し、ネットワーク効率を向上させることができます。注意：これはトレードオフであり、ネットワーク転送量は削減されますが、各ノードで追加のマージ（重複排除）処理が必要になります。ネットワーク転送量がボトルネックとなっており、マージ処理コストが許容できる場合にこの設定を有効にしてください。 [#81908](https://github.com/ClickHouse/ClickHouse/pull/81908) ([fhw12345](https://github.com/fhw12345)).
* 実行可能なユーザー定義関数に対するクエリのメモリトラッキングに伴うオーバーヘッドを削減しました。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `DeltaLake` に `delta-kernel-rs` による内部フィルタリング機能（統計およびパーティションプルーニング）を実装。 [#84006](https://github.com/ClickHouse/ClickHouse/pull/84006) ([Kseniia Sumarokova](https://github.com/kssenii)).
* オンザフライで更新されるカラムや、パッチパーツによって更新されるカラムに依存するスキップインデックスの無効化を、より細かい粒度で制御するようにしました。これにより、スキップインデックスはオンザフライのミューテーションやパッチパーツの影響を受けたパーツでのみ無効化され、それ以外のパーツでは引き続き使用されます。以前は、そのようなインデックスはすべてのパーツで無効化されていました。 [#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ)).
* 暗号化された名前付きコレクション用の `encrypted_buffer` に必要最小限のメモリのみを割り当てるようにしました。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* ブルームフィルターインデックス（regular、ngram、token）が、第一引数が定数配列（集合）、第二引数がインデックス化された列（部分集合）である場合にも利用できるようサポートを改善し、より効率的なクエリ実行を可能にしました。 [#84700](https://github.com/ClickHouse/ClickHouse/pull/84700) ([Doron David](https://github.com/dorki))。
* Keeper のストレージロックでの競合を削減。 [#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368)).
* `WHERE` に対する `read_in_order_use_virtual_row` の未対応だったサポートを追加しました。これにより、フィルターが完全には `PREWHERE` にプッシュダウンされていないクエリで、追加のパーツの読み取りをスキップできるようになります。 [#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Iceberg テーブル内のオブジェクトを非同期に反復処理できるようにし、各データファイルごとにオブジェクトを明示的に保存する必要がなくなります。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik)).
* 非相関な `EXISTS` をスカラサブクエリとして実行します。これにより、スカラサブクエリキャッシュを利用でき、結果を定数畳み込みできるようになり、インデックスの利用に役立ちます。後方互換性のために、新しい設定 `execute_exists_as_scalar_subquery=1` が追加されました。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。





#### 改善

* `database_replicated` 設定を追加して、DatabaseReplicatedSettings のデフォルト値を定義します。Replicated データベースの作成クエリにこの設定が含まれていない場合は、この設定の値が使用されます。[#85127](https://github.com/ClickHouse/ClickHouse/pull/85127)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* Web UI（play）のテーブル列をサイズ変更可能にしました。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki)).
* `iceberg_metadata_compression_method` 設定で圧縮された `.metadata.json` ファイルのサポートを追加しました。ClickHouse のすべての圧縮方式をサポートします。これにより [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895) が解決しました。[#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `EXPLAIN indexes = 1` の出力に、読み取るレンジ数を表示するようになりました。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm)).
* ORC 圧縮ブロックサイズを設定するための設定を追加し、Spark や Hive と整合性を保つために、そのデフォルト値を 64KB から 256KB に更新しました。 [#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li))。
* Wide パーツに `columns_substreams.txt` ファイルを追加し、そのパーツ内に保存されているすべてのサブストリームを追跡できるようにしました。これにより、JSON 型および Dynamic 型の動的ストリームを追跡できるようになり、これらのカラムの一部を読み取って動的ストリームの一覧を取得する必要がなくなります（たとえばカラムサイズの計算などの用途）。また、すべての動的ストリームが `system.parts_columns` に反映されるようになりました。 [#81091](https://github.com/ClickHouse/ClickHouse/pull/81091) ([Pavel Kruglov](https://github.com/Avogar))。
* デフォルトで機密データを非表示にするため、`clickhouse format` に CLI フラグ `--show_secrets` を追加しました。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom))。
* S3 の読み取りおよび書き込みリクエストは、`max_remote_read_network_bandwidth_for_server` および `max_remote_write_network_bandwidth_for_server` によるスロットリングが原因の問題を回避するため、S3 リクエスト全体ではなく HTTP ソケットレベルでスロットリングされるようになりました。 [#81837](https://github.com/ClickHouse/ClickHouse/pull/81837) ([Sergei Trifonov](https://github.com/serxa))。
* 同じカラムに対しても、ウィンドウ関数の各ウィンドウで異なる照合順序を併用できるようにしました。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* マージセレクタをシミュレーション・可視化・比較できるツールを追加しました。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa)).
* `address_expression` 引数でクラスタが指定されている場合に、`remote*` テーブル関数で並列レプリカをサポートするようにしました。また、[#73295](https://github.com/ClickHouse/ClickHouse/issues/73295) も修正しました。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904) ([Igor Nikonov](https://github.com/devcrafter))。
* バックアップファイルの書き込みに関するすべてのログメッセージのレベルを TRACE に設定しました。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 特殊な名前やコーデックを持つユーザー定義関数が、SQL フォーマッタによって一貫性のない形で整形される場合があります。この変更で [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092) が解決されました。[#83644](https://github.com/ClickHouse/ClickHouse/pull/83644)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ユーザーは JSON 型内で Time 型および Time64 型を使用できるようになりました。 [#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 並列レプリカを使用した JOIN では、`join logical step` が使われるようになりました。並列レプリカを使用する JOIN クエリで問題が発生した場合は、`SET query_plan_use_new_logical_join_step=0` を実行してから、Issue を報告してください。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir)).
* cluster&#95;function&#95;process&#95;archive&#95;on&#95;multiple&#95;nodes のマルチノード環境での互換性を修正。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` テーブル単位でのマテリアライズドビューへの挿入設定の変更をサポートしました。新たに `S3Queue` レベルの設定項目 `min_insert_block_size_rows_for_materialized_views` および `min_insert_block_size_bytes_for_materialized_views` を追加しました。デフォルトではプロファイルレベルの設定が使用され、`S3Queue` レベルの設定がそれらを上書きします。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii)).
* プロファイルイベント `MutationAffectedRowsUpperBound` を追加しました。ミューテーションで影響を受けた行数（例：`ALTER UPDATE` や `ALTER DELETE` クエリで条件を満たす行の合計数）を示します。[#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ))。
* cgroup の情報（該当する場合、つまり `memory_worker_use_cgroup` が有効で、かつ cgroup が利用可能な場合）を利用して、メモリトラッカー（`memory_worker_correct_memory_tracker`）を調整します。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat)).
* MongoDB: 文字列から数値型への暗黙的な変換。以前は、ClickHouse テーブルの数値カラムに対して MongoDB ソースから文字列値を受け取った場合、例外がスローされていました。現在は、エンジンが文字列から数値への変換を自動的に試みるようになりました。[#81167](https://github.com/ClickHouse/ClickHouse/issues/81167) を解決。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* `Nullable` 数値の `Pretty` フォーマットで桁グループをハイライト表示できるようにしました。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard: ツールチップがコンテナの上端からはみ出さないようになりました。 [#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード上のドットの見た目を少し良くしました。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard の favicon が少し良くなりました。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI: ブラウザがパスワードの保存を提案できるようにしました。また、URL フィールドの値も記憶するようになりました。 [#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 特定の Keeper ノードに追加の ACL を適用するための `apply_to_children` 設定のサポートを追加しました。 [#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368)).
* MergeTree における &quot;compact&quot; Variant 判別子のシリアル化の挙動を修正しました。これまでは、利用可能である一部のケースで使用されていませんでした。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* レプリケーテッドデータベースの設定にサーバー設定項目 `logs_to_keep` を追加し、レプリケーテッドデータベースにおけるデフォルトの `logs_to_keep` パラメータを変更できるようにしました。値を小さくすると ZNode の数（特にデータベースが多数ある場合）が減少し、値を大きくすると欠けているレプリカが、より長い期間が経過した後でも追いつけるようになります。 [#84183](https://github.com/ClickHouse/ClickHouse/pull/84183) ([Alexey Khatskevich](https://github.com/Khatskevich))。
* JSON 型パース時に JSON キー内のドットをエスケープするための設定 `json_type_escape_dots_in_keys` を追加しました。この設定はデフォルトでは無効です。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar)).
* クローズされた接続からの読み取りを防ぐため、EOF を確認する前に接続がキャンセルされていないかをチェックするようにしました。[#83893](https://github.com/ClickHouse/ClickHouse/issues/83893) を修正。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Web UI におけるテキスト選択時の色をわずかに改善しました。最も差が分かるのは、ダークモードで選択されたテーブルセルの場合です。以前のバージョンでは、テキストと選択範囲の背景色とのコントラストが不十分でした。[#84258](https://github.com/ClickHouse/ClickHouse/pull/84258)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 内部チェックを簡素化することで、サーバーシャットダウン時のクライアント接続の処理を改善しました。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath)).
* デバッグ時にテストログレベルでも冗長になりすぎる可能性があるため、式ビジターのログを無効化できる設定 `delta_lake_enable_expression_visitor_logging` を追加しました。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* cgroup レベルおよびシステム全体のメトリクスが、現在はまとめてレポートされるようになりました。cgroup レベルのメトリクスの名前は `CGroup&lt;Metric&gt;` であり、OS レベルのメトリクス（procfs から収集されるもの）の名前は `OS&lt;Metric&gt;` です。 [#84317](https://github.com/ClickHouse/ClickHouse/pull/84317) ([Nikita Taranov](https://github.com/nickitat))。
* Web UI のチャートが少し改善されました。大きな変更ではありませんが、より良くなっています。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Replicated データベース設定 `max_retries_before_automatic_recovery` のデフォルト値を 10 に変更し、一部のケースではより早く復旧できるようにしました。 [#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリパラメータ付きの `CREATE USER` 文のフォーマットを修正しました（例: `CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。 [#84376](https://github.com/ClickHouse/ClickHouse/pull/84376) ([Azat Khuzhin](https://github.com/azat)).
* バックアップおよびリストア処理中に使用される S3 リトライ時のバックオフ戦略を構成するための `backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor` を導入しました。 [#84421](https://github.com/ClickHouse/ClickHouse/pull/84421) ([Julia Kartseva](https://github.com/jkartseva)).
* S3Queue の ordered モードの修正: `shutdown` が呼び出された場合は、より早く終了するようにしました。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* pyiceberg で読み取れるように Iceberg への書き込みをサポートしました。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* KeyValue ストレージのプライマリキー（例: EmbeddedRocksDB、KeeperMap）に対して `IN` / `GLOBAL IN` フィルタをプッシュダウンする際に、セット値の型キャストを許可。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa)).
* chdig をバージョン [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1) に更新。[#84521](https://github.com/ClickHouse/ClickHouse/pull/84521)（[Azat Khuzhin](https://github.com/azat)）。
* UDF 実行中の低レベルエラーは、これまではさまざまなエラーコードが返されることがありましたが、今後はエラーコード `UDF_EXECUTION_FAILED` で失敗するようになりました。 [#84547](https://github.com/ClickHouse/ClickHouse/pull/84547) ([Xu Jia](https://github.com/XuJia0210)).
* KeeperClient に `get_acl` コマンドを追加しました。 [#84641](https://github.com/ClickHouse/ClickHouse/pull/84641) ([Antonio Andelic](https://github.com/antonio2368)).
* データレイクテーブルエンジンにスナップショットバージョンを追加しました。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton)).
* `ConcurrentBoundedQueue` のサイズを表すディメンション付きメトリクスを追加しました。キューの種類（つまり、そのキューが何のためのものか）およびキュー ID（つまり、そのキューの現在のインスタンスに対してランダムに生成される ID）でラベル付けされます。 [#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `system.columns` テーブルで、既存の `name` 列に対するエイリアスとして `column` 列が提供されるようになりました。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang)).
* 新しい MergeTree 設定 `search_orphaned_parts_drives` により、例えばローカルメタデータを持つディスクなど、パーツの検索範囲を限定できるようになりました。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* Keeper に、受信リクエストのログ出力を切り替えるための 4LW コマンド `lgrq` を追加。 [#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368)).
* external auth の `forward_headers` を大文字小文字を区別せずに照合するようにしました。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` ツールが暗号化された ZooKeeper への接続をサポートするようになりました。 [#84764](https://github.com/ClickHouse/ClickHouse/pull/84764) ([Roman Vasin](https://github.com/rvasin))。
* `system.errors` にフォーマット文字列カラムを追加しました。このカラムは、アラートルールで同一のエラー種別ごとにグループ化するために必要です。 [#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-format` を更新し、`--hilite` のエイリアスとして `--highlight` を受け付けるようにしました。- `clickhouse-client` を更新し、`--highlight` のエイリアスとして `--hilite` を受け付けるようにしました。- 変更内容を反映するように `clickhouse-format` のドキュメントを更新しました。 [#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769))。
* 複合型に対するフィールド ID による Iceberg 読み取りを修正。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `SlowDown` のようなエラーによって発生するリトライストーム時に、1つのリトライ可能なエラーが観測された時点で全スレッドを減速させることで S3 への負荷を軽減する新しい設定 `backup_slow_all_threads_after_retryable_s3_error` を導入しました。 [#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* Replicated データベースにおける append 以外の RMV DDL では、古い一時テーブルの作成とリネームをスキップするようにしました。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` および `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` を使用して、Keeper ログエントリのキャッシュサイズをエントリ数で制限できるようにしました。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* サポート対象外のアーキテクチャ上でも `simdjson` を使用できるようにしました（これまでは `CANNOT_ALLOCATE_MEMORY` エラーが発生していました）。 [#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat))。
* 非同期ロギング: 制限を調整可能にし、内部状態の確認機能を追加。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* すべての削除対象オブジェクトをまとめて収集し、オブジェクトストレージに対する単一の削除操作として実行するようにしました。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg の現行の positional delete ファイルの実装では、すべてのデータをメモリ上に保持します。positional delete ファイルが大きい場合（実際そのようなケースが多く）、これはかなりコストがかかります。私の実装では、Parquet delete ファイルの最後の row group だけをメモリ上に保持するようにしており、これによりコストを大幅に削減できます。[#85329](https://github.com/ClickHouse/ClickHouse/pull/85329) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* chdig：画面上に残る描画の不具合を修正し、エディタでクエリ編集後に発生するクラッシュを修正し、`path` 内で `editor` を検索できるようにし、[25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1) にアップデート。[#85341](https://github.com/ClickHouse/ClickHouse/pull/85341)（[Azat Khuzhin](https://github.com/azat)）。
* 不足していた `partition_columns_in_data_file` を Azure 構成に追加。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos)).
* 関数 `timeSeries*ToGrid` でステップ値 0 を許可しました。これは [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) の一部です。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* system.tables にデータレイクのテーブルを追加するかどうかを管理するための `show_data_lake_catalogs_in_system_tables` フラグを追加し、[#85384](https://github.com/ClickHouse/ClickHouse/issues/85384) を解決しました。 [#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `remote_fs_zero_copy_zookeeper_path` でのマクロ展開をサポートしました。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme))。
* clickhouse-client の AI 機能の見た目が少し改善されました。 [#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 既存のデプロイメントで `trace_log.symbolize` をデフォルトで有効化しました。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 複合識別子を扱えるケースをさらに拡張しました。特に、旧アナライザーとの `ARRAY JOIN` の互換性が向上しています。従来の動作を維持するために、新しい設定 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` を導入しました。 [#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* system.columns からテーブル列サイズを取得する際に UNKNOWN&#95;DATABASE を無視するようにしました。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* パッチパーツ内の非圧縮バイト数の合計に対する制限（テーブル設定 `max_uncompressed_bytes_in_patches`）を追加しました。これにより、軽量アップデート後の SELECT クエリが大幅に低速化することを防ぎ、軽量アップデートの悪用の可能性も抑止します。[#85641](https://github.com/ClickHouse/ClickHouse/pull/85641)（[Anton Popov](https://github.com/CurtizJ)）。
* `GRANT READ/WRITE` のソースの種類および `GRANT TABLE ENGINE` のテーブルエンジンを判別できるようにするため、`system.grants` に `parameter` カラムを追加しました。 [#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `Decimal(8)` のようなパラメーター付きカラムの後に続くカラムで末尾にカンマが付いている場合の `CREATE DICTIONARY` クエリのパース処理を修正しました。[#85586](https://github.com/ClickHouse/ClickHouse/issues/85586) をクローズ。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 関数 `nested` に内部配列のサポートを追加しました。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 外部ライブラリによって行われるすべてのメモリ割り当てが、ClickHouse のメモリトラッカーで可視化され、正しく計上されるようになりました。これにより、一部のクエリでは報告されるメモリ使用量が「増加」したように見えたり、`MEMORY_LIMIT_EXCEEDED` によるエラーが発生したりする可能性があります。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。



#### バグ修正（公式な安定版リリースでユーザーにとって目に見える誤動作）



* この PR では、REST カタログ経由で Iceberg テーブルをクエリする際のメタデータ解決処理を修正しました。... [#80562](https://github.com/ClickHouse/ClickHouse/pull/80562) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* DDLWorker と DatabaseReplicatedDDLWorker における `markReplicasActive` の不具合を修正。 [#81395](https://github.com/ClickHouse/ClickHouse/pull/81395) ([Tuan Pham Anh](https://github.com/tuanpach)).
* パース失敗時の Dynamic 列のロールバック処理を修正。 [#82169](https://github.com/ClickHouse/ClickHouse/pull/82169) ([Pavel Kruglov](https://github.com/Avogar)).
* 関数 `trim` がすべて定数の入力で呼び出された場合に、定数の出力文字列を生成するようになりました（バグ [#78796](https://github.com/ClickHouse/ClickHouse/issues/78796)）。[#82900](https://github.com/ClickHouse/ClickHouse/pull/82900)（[Robert Schulze](https://github.com/rschu1ze)）。
* `optimize_syntax_fuse_functions` が有効な場合に発生する、重複サブクエリに起因する論理エラーを修正。[#75511](https://github.com/ClickHouse/ClickHouse/issues/75511) をクローズ。[#83300](https://github.com/ClickHouse/ClickHouse/pull/83300)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `WHERE ... IN (&lt;subquery&gt;)` 句を含み、クエリ条件キャッシュ（設定 `use_query_condition_cache`）が有効になっているクエリで誤った結果が返される問題を修正しました。 [#83445](https://github.com/ClickHouse/ClickHouse/pull/83445) ([LB7666](https://github.com/acking-you))。
* これまで `gcs` 関数は利用にあたって特別なアクセス権を必要としていませんでしたが、現在は使用時に `GRANT READ ON S3` 権限が必要になります。これにより [#70567](https://github.com/ClickHouse/ClickHouse/issues/70567) がクローズされました。[#83503](https://github.com/ClickHouse/ClickHouse/pull/83503)（[pufit](https://github.com/pufit)）。
* s3Cluster() からレプリケーテッド MergeTree への INSERT SELECT 実行時に、利用できないノードをスキップするようにしました。 [#83676](https://github.com/ClickHouse/ClickHouse/pull/83676) ([Igor Nikonov](https://github.com/devcrafter)).
* 実験的トランザクション用の `MergeTree` において、`plain_rewritable`/`plain` メタデータ型を使用した append 書き込みの処理を修正しました。これらのメタデータ型は以前は単純に無視されていました。 [#83695](https://github.com/ClickHouse/ClickHouse/pull/83695) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Avro スキーマレジストリの認証情報がユーザーやログに表示されないようマスクするようにしました。 [#83713](https://github.com/ClickHouse/ClickHouse/pull/83713) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `add_minmax_index_for_numeric_columns=1` または `add_minmax_index_for_string_columns=1` を指定して MergeTree テーブルを作成した場合に、そのインデックスが後の ALTER 操作でマテリアライズされると、新しいレプリカ上で Replicated データベースを正しく初期化できなくなる不具合を修正しました。 [#83751](https://github.com/ClickHouse/ClickHouse/pull/83751) ([Nikolay Degterinsky](https://github.com/evillique))。
* Decimal 型に対して誤った統計情報（最小値/最大値）を出力していた Parquet writer を修正しました。 [#83754](https://github.com/ClickHouse/ClickHouse/pull/83754) ([Michael Kolupaev](https://github.com/al13n321)).
* `LowCardinality(Float32|Float64|BFloat16)` 型における NaN 値のソート処理を修正しました。 [#83786](https://github.com/ClickHouse/ClickHouse/pull/83786) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* バックアップから復元する際に、`DEFINER` ユーザーがバックアップされていない場合があり、その結果バックアップ全体が無効になってしまう可能性があります。これを解決するため、復元時の対象テーブル作成時に行っていた権限チェックを延期し、実行時にのみチェックするようにしました。 [#83818](https://github.com/ClickHouse/ClickHouse/pull/83818) ([pufit](https://github.com/pufit))。
* 失敗した `INSERT` 実行後に接続が切断された状態のままになることでクライアントがクラッシュする問題を修正。 [#83842](https://github.com/ClickHouse/ClickHouse/pull/83842) ([Azat Khuzhin](https://github.com/azat)).
* アナライザーが有効な場合、`remote` テーブル関数の `view(...)` 引数内で任意のテーブルを参照できるようにしました。[#78717](https://github.com/ClickHouse/ClickHouse/issues/78717) を修正。[#79377](https://github.com/ClickHouse/ClickHouse/issues/79377) を修正。[#83844](https://github.com/ClickHouse/ClickHouse/pull/83844)（[Dmitry Novik](https://github.com/novikd)）。
* `jsoneachrowwithprogress` における `Onprogress` の呼び出しが finalization と同期されるようになりました。 [#83879](https://github.com/ClickHouse/ClickHouse/pull/83879) ([Sema Checherinda](https://github.com/CheSema)).
* これにより [#81303](https://github.com/ClickHouse/ClickHouse/issues/81303) をクローズします。 [#83892](https://github.com/ClickHouse/ClickHouse/pull/83892) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* const 引数と非 const 引数が混在する場合の colorSRGBToOKLCH/colorOKLCHToSRGB の不具合を修正。 [#83906](https://github.com/ClickHouse/ClickHouse/pull/83906) ([Azat Khuzhin](https://github.com/azat)).
* RowBinary フォーマットで NULL 値を含む JSON パスを書き込む処理を修正。 [#83923](https://github.com/ClickHouse/ClickHouse/pull/83923) ([Pavel Kruglov](https://github.com/Avogar)).
* Date から DateTime64 へのキャスト時に、2106-02-07 より大きな値がオーバーフローする問題を修正しました。 [#83982](https://github.com/ClickHouse/ClickHouse/pull/83982) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 常に `filesystem_prefetches_limit` を適用するようにしました（`MergeTreePrefetchedReadPool` のみの場合ではなく）。 [#83999](https://github.com/ClickHouse/ClickHouse/pull/83999) ([Azat Khuzhin](https://github.com/azat)).
* `MATERIALIZE COLUMN` クエリにより、まれに `checksums.txt` に想定外のファイルが含まれ、最終的にデータパーツが detached されてしまうバグを修正。[#84007](https://github.com/ClickHouse/ClickHouse/pull/84007) ([alesapin](https://github.com/alesapin)).
* 一方の列が `LowCardinality` 型で、もう一方が定数である場合に、不等号条件で JOIN を実行すると発生していた論理エラー `Expected single dictionary argument for function` を修正しました。 [#81779](https://github.com/ClickHouse/ClickHouse/issues/81779) をクローズ。 [#84019](https://github.com/ClickHouse/ClickHouse/pull/84019)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 構文ハイライトを有効にした対話モードでの使用時に発生していた clickhouse client のクラッシュを修正。 [#84025](https://github.com/ClickHouse/ClickHouse/pull/84025) ([Bharat Nallan](https://github.com/bharatnc)).
* クエリ条件キャッシュを再帰 CTE と併用した場合に誤った結果が返される問題を修正しました（issue [#81506](https://github.com/ClickHouse/ClickHouse/issues/81506)）。[#84026](https://github.com/ClickHouse/ClickHouse/pull/84026)（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツの定期リフレッシュでの例外処理を適切に行うようにしました。 [#84083](https://github.com/ClickHouse/ClickHouse/pull/84083) ([Azat Khuzhin](https://github.com/azat)).
* 等価条件のオペランドの型が異なる場合や定数を参照している場合に、フィルタが JOIN 条件へマージされる処理を修正しました。 [#83432](https://github.com/ClickHouse/ClickHouse/issues/83432) を修正。 [#84145](https://github.com/ClickHouse/ClickHouse/pull/84145)（[Dmitry Novik](https://github.com/novikd)）。
* テーブルにプロジェクションが存在し、`lightweight_mutation_projection_mode = 'rebuild'` が設定されている状態で、ユーザーがテーブル内の任意のブロックからすべての行を削除する軽量な削除を実行した場合に、まれに発生する ClickHouse のクラッシュを修正。[#84158](https://github.com/ClickHouse/ClickHouse/pull/84158) ([alesapin](https://github.com/alesapin)).
* バックグラウンドのキャンセルチェック用スレッドが原因のデッドロックを修正しました。 [#84203](https://github.com/ClickHouse/ClickHouse/pull/84203) ([Antonio Andelic](https://github.com/antonio2368)).
* 不正な `WINDOW` 定義に対して無限再帰的な解析が行われる問題を修正。[#83131](https://github.com/ClickHouse/ClickHouse/issues/83131) を修正。[#84242](https://github.com/ClickHouse/ClickHouse/pull/84242)（[Dmitry Novik](https://github.com/novikd)）。
* Bech32 のエンコードおよびデコードが誤動作する原因となっていたバグを修正しました。このバグは、テストに使用していたアルゴリズムのオンライン実装にも同じ問題があったため、当初は検出されませんでした。[#84257](https://github.com/ClickHouse/ClickHouse/pull/84257)（[George Larionov](https://github.com/george-larionov)）。
* `array()` 関数における空タプルの誤った生成を修正しました。これにより [#84202](https://github.com/ClickHouse/ClickHouse/issues/84202) の問題が解決されます。 [#84297](https://github.com/ClickHouse/ClickHouse/pull/84297) ([Amos Bird](https://github.com/amosbird))。
* 並列レプリカを使用し、複数の INNER 結合の後に RIGHT 結合が続くクエリで発生していた `LOGICAL_ERROR` を修正しました。このようなクエリでは並列レプリカを使用しないでください。[#84299](https://github.com/ClickHouse/ClickHouse/pull/84299) ([Vladimir Cherkasov](https://github.com/vdimir))。
* 以前は、フィルターを通過したかどうかを判定する際に、`set` インデックスが `Nullable` カラムを考慮していませんでした（issue [#75485](https://github.com/ClickHouse/ClickHouse/issues/75485)）。[#84305](https://github.com/ClickHouse/ClickHouse/pull/84305)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* ClickHouse は、テーブルタイプが小文字で指定されている場合でも Glue カタログからテーブルを読み取れるようになりました。 [#84316](https://github.com/ClickHouse/ClickHouse/pull/84316) ([alesapin](https://github.com/alesapin)).
* JOIN やサブクエリがある場合は、テーブル関数を対応する cluster バージョンに置き換えないでください。[#84335](https://github.com/ClickHouse/ClickHouse/pull/84335) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `IAccessStorage` における logger の使用方法を修正。 [#84365](https://github.com/ClickHouse/ClickHouse/pull/84365) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* テーブル内のすべてのカラムを更新する軽量更新で発生していた論理エラーを修正しました。 [#84380](https://github.com/ClickHouse/ClickHouse/pull/84380) ([Anton Popov](https://github.com/CurtizJ))。
* Codec `DoubleDelta` は、数値型のカラムにのみ適用できるようになりました。特に、`FixedString` カラムはもはや `DoubleDelta` を使用して圧縮することはできません（[#80220](https://github.com/ClickHouse/ClickHouse/issues/80220) の修正）。[#84383](https://github.com/ClickHouse/ClickHouse/pull/84383)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `MinMax` インデックスの評価時に、NaN 値との比較で正しい範囲が使用されていませんでした。 [#84386](https://github.com/ClickHouse/ClickHouse/pull/84386) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 遅延マテリアライズを用いた Variant 列の読み取りを修正。 [#84400](https://github.com/ClickHouse/ClickHouse/pull/84400) ([Pavel Kruglov](https://github.com/Avogar)).
* `zoutofmemory` をハードウェアエラーとして扱うようにする。そうしないと論理エラーがスローされます。詳細は [https://github.com/clickhouse/clickhouse-core-incidents/issues/877](https://github.com/clickhouse/clickhouse-core-incidents/issues/877) を参照してください。 [#84420](https://github.com/ClickHouse/ClickHouse/pull/84420) ([Han Fei](https://github.com/hanfei1991))。
* サーバー設定 `allow_no_password` を 0 に変更した後に、`no_password` で作成されたユーザーがログインを試みると発生していたサーバークラッシュを修正しました。 [#84426](https://github.com/ClickHouse/ClickHouse/pull/84426) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Keeper のチェンジログへの順序が前後する書き込みを修正しました。以前は、チェンジログへの書き込みが処理中の状態で残っている一方で、ロールバックによって出力先ファイルが並行して変更される可能性がありました。これによりログが不整合になり、データ損失が発生するおそれがありました。 [#84434](https://github.com/ClickHouse/ClickHouse/pull/84434) ([Antonio Andelic](https://github.com/antonio2368))。
* これにより、テーブルからすべての TTL 設定が削除された場合、MergeTree は TTL に関連する処理を一切行わなくなります。 [#84441](https://github.com/ClickHouse/ClickHouse/pull/84441) ([alesapin](https://github.com/alesapin)).
* LIMIT 付きの並列分散 INSERT SELECT が許可されていましたが、本来これは不正であり、対象テーブルでデータの重複を招いていました。 [#84477](https://github.com/ClickHouse/ClickHouse/pull/84477) ([Igor Nikonov](https://github.com/devcrafter)).
* データレイクでの仮想カラムを用いたファイルプルーニングを修正。 [#84520](https://github.com/ClickHouse/ClickHouse/pull/84520) ([Kseniia Sumarokova](https://github.com/kssenii))。
* RocksDB ストレージを使用する Keeper でのメモリリークを修正（イテレータが破棄されていなかった）。 [#84523](https://github.com/ClickHouse/ClickHouse/pull/84523) ([Azat Khuzhin](https://github.com/azat)).
* ALTER MODIFY ORDER BY がソートキーに含まれる TTL カラムを検証していなかった問題を修正しました。TTL カラムが ALTER 操作時に ORDER BY 句で使用された場合には、テーブル破損の可能性を防ぐため、現在は正しく拒否されるようになりました。 [#84536](https://github.com/ClickHouse/ClickHouse/pull/84536) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 互換性のため、`allow_experimental_delta_kernel_rs` の 25.5 以前での値を `false` に変更。 [#84587](https://github.com/ClickHouse/ClickHouse/pull/84587) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マニフェストファイルからスキーマを取得することをやめ、各スナップショットごとに関連するスキーマを個別に保存するようにしました。各データファイルについて、そのファイルに対応するスナップショットから関連するスキーマを推論します。以前の動作は、status が existing のエントリを含むマニフェストファイルに関する Iceberg 仕様に違反していました。 [#84588](https://github.com/ClickHouse/ClickHouse/pull/84588) ([Daniil Ivanik](https://github.com/divanik))。
* Keeper 設定 `rotate_log_storage_interval = 0` により ClickHouse がクラッシュする不具合を修正しました (issue [#83975](https://github.com/ClickHouse/ClickHouse/issues/83975))。[#84637](https://github.com/ClickHouse/ClickHouse/pull/84637) ([George Larionov](https://github.com/george-larionov))。
* S3Queue の論理エラー「Table is already registered」を修正。[#84433](https://github.com/ClickHouse/ClickHouse/issues/84433) をクローズ。[https://github.com/ClickHouse/ClickHouse/pull/83530](https://github.com/ClickHouse/ClickHouse/pull/83530) により発生した不具合。[#84677](https://github.com/ClickHouse/ClickHouse/pull/84677)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* RefreshTask で &#39;view&#39; から zookeeper を取得する際に &#39;mutex&#39; をロックするようにした。 [#84699](https://github.com/ClickHouse/ClickHouse/pull/84699) ([Tuan Pham Anh](https://github.com/tuanpach)).
* lazy columns を外部ソートと併用した場合に `CORRUPTED_DATA` エラーが発生する問題を修正。 [#84738](https://github.com/ClickHouse/ClickHouse/pull/84738) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DeltaLake` ストレージにおける delta-kernel 使用時のカラムプルーニングを修正。[#84543](https://github.com/ClickHouse/ClickHouse/issues/84543) をクローズ。[#84745](https://github.com/ClickHouse/ClickHouse/pull/84745)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ストレージ DeltaLake の delta-kernel で認証情報を更新しました。 [#84751](https://github.com/ClickHouse/ClickHouse/pull/84751) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 接続障害発生後に余分な内部バックアップが開始されてしまう問題を修正。 [#84755](https://github.com/ClickHouse/ClickHouse/pull/84755) ([Vitaly Baranov](https://github.com/vitlibar)).
* 遅延しているリモートソースをクエリした際に、ベクターの範囲外アクセスが発生する可能性があった問題を修正しました。 [#84820](https://github.com/ClickHouse/ClickHouse/pull/84820) ([George Larionov](https://github.com/george-larionov)).
* `ngram` および `no_op` トークナイザー使用時に、空の入力トークンによって（実験的な）テキストインデックスがクラッシュしなくなりました。 [#84849](https://github.com/ClickHouse/ClickHouse/pull/84849) ([Robert Schulze](https://github.com/rschu1ze)).
* `ReplacingMergeTree` および `CollapsingMergeTree` エンジンを使用するテーブルに対する軽量更新 (lightweight updates) の不具合を修正しました。 [#84851](https://github.com/ClickHouse/ClickHouse/pull/84851) ([Anton Popov](https://github.com/CurtizJ)).
* ObjectQueue エンジンを使用するテーブルですべての設定がテーブルメタデータに正しく保存されるようにしました。 [#84860](https://github.com/ClickHouse/ClickHouse/pull/84860) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper が返すウォッチ数の合計値を修正。 [#84890](https://github.com/ClickHouse/ClickHouse/pull/84890) ([Antonio Andelic](https://github.com/antonio2368)).
* 25.7 より前のバージョンのサーバー上で作成された `ReplicatedMergeTree` エンジンのテーブルに対する軽量な更新を修正しました。 [#84933](https://github.com/ClickHouse/ClickHouse/pull/84933) ([Anton Popov](https://github.com/CurtizJ)).
* `ALTER TABLE ... REPLACE PARTITION` クエリ実行後に、非レプリケートの `MergeTree` エンジンを使用するテーブルに対する軽量更新が正しく動作しない問題を修正しました。 [#84941](https://github.com/ClickHouse/ClickHouse/pull/84941) ([Anton Popov](https://github.com/CurtizJ)).
* クエリ内で真偽値リテラルと整数リテラルの列名が衝突しないよう、真偽値リテラルの列名生成で &quot;1&quot;/&quot;0&quot; ではなく &quot;true&quot;/&quot;false&quot; を使用するよう修正しました。 [#84945](https://github.com/ClickHouse/ClickHouse/pull/84945) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* バックグラウンドスケジュールプールおよびエグゼキュータでのメモリトラッキングのずれを修正。 [#84946](https://github.com/ClickHouse/ClickHouse/pull/84946) ([Azat Khuzhin](https://github.com/azat)).
* Merge テーブルエンジンにおけるソートの不整合が発生し得る問題を修正します。 [#85025](https://github.com/ClickHouse/ClickHouse/pull/85025) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* DiskEncrypted 向けに未実装だった API を実装。 [#85028](https://github.com/ClickHouse/ClickHouse/pull/85028) ([Azat Khuzhin](https://github.com/azat)).
* 分散コンテキストで相関サブクエリが使用されている場合にクラッシュを回避するチェックを追加しました。[#82205](https://github.com/ClickHouse/ClickHouse/issues/82205) を修正します。[#85030](https://github.com/ClickHouse/ClickHouse/pull/85030)（[Dmitry Novik](https://github.com/novikd)）。
* Iceberg は、`SELECT` クエリ間で関連するスナップショットバージョンをキャッシュせず、常にその都度スナップショットを正しく解決するようになりました。以前に Iceberg スナップショットをキャッシュしようとした試みは、タイムトラベル機能を使用する Iceberg テーブルで問題を引き起こしていました。 [#85038](https://github.com/ClickHouse/ClickHouse/pull/85038) ([Daniil Ivanik](https://github.com/divanik))。
* `AzureIteratorAsync` における二重解放の不具合を修正しました。[#85064](https://github.com/ClickHouse/ClickHouse/pull/85064) ([Nikita Taranov](https://github.com/nickitat))。
* JWT で認証されるユーザーを作成しようとした際のエラーメッセージを改善。 [#85072](https://github.com/ClickHouse/ClickHouse/pull/85072) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `ReplicatedMergeTree` におけるパッチパーツのクリーンアップ処理を修正しました。以前は、パッチパーツをマテリアライズするマージ済みまたはミューテーション済みパーツが別のレプリカからダウンロードされるまで、軽量な UPDATE の結果が一時的にレプリカ上で見えない場合がありました。 [#85121](https://github.com/ClickHouse/ClickHouse/pull/85121) ([Anton Popov](https://github.com/CurtizJ)).
* 型が異なる場合に mv で発生する illegal&#95;type&#95;of&#95;argument エラーを修正。 [#85135](https://github.com/ClickHouse/ClickHouse/pull/85135) ([Sema Checherinda](https://github.com/CheSema)).
* delta-kernel 実装におけるセグメンテーションフォルトを修正。 [#85160](https://github.com/ClickHouse/ClickHouse/pull/85160) ([Kseniia Sumarokova](https://github.com/kssenii)).
* メタデータファイルの移動に長時間を要する場合のレプリケーテッドデータベースの復旧処理を修正。[#85177](https://github.com/ClickHouse/ClickHouse/pull/85177) ([Tuan Pham Anh](https://github.com/tuanpach))。
* `additional_table_filters expression` 設定内の `IN (subquery)` における `Not-ready Set` の問題を修正。 [#85210](https://github.com/ClickHouse/ClickHouse/pull/85210) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* SYSTEM DROP REPLICA クエリの実行中に行われる不要な `getStatus()` 呼び出しを削除しました。バックグラウンドでテーブルが削除されている際に、`Shutdown for storage is called` という例外がスローされるケースを修正しました。 [#85220](https://github.com/ClickHouse/ClickHouse/pull/85220) ([Nikolay Degterinsky](https://github.com/evillique))。
* `DeltaLake` エンジンの delta-kernel 実装におけるレースコンディションを修正。 [#85221](https://github.com/ClickHouse/ClickHouse/pull/85221) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `DeltaLake` エンジンで delta-kernel を無効化した状態でのパーティションデータの読み取りを修正しました。これは 25.7 で動作しなくなっていました（[https://github.com/ClickHouse/ClickHouse/pull/81136](https://github.com/ClickHouse/ClickHouse/pull/81136)）。[#85223](https://github.com/ClickHouse/ClickHouse/pull/85223)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* CREATE OR REPLACE クエリおよび RENAME クエリに、これまで行われていなかったテーブル名の長さチェックを追加しました。 [#85326](https://github.com/ClickHouse/ClickHouse/pull/85326) ([Michael Kolupaev](https://github.com/al13n321)).
* DEFINER が削除されている場合に、Replicated データベースの新しいレプリカ上で RMV を作成できない問題を修正しました。 [#85327](https://github.com/ClickHouse/ClickHouse/pull/85327) ([Nikolay Degterinsky](https://github.com/evillique)).
* 複合型の Iceberg への書き込みを修正。[#85330](https://github.com/ClickHouse/ClickHouse/pull/85330) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 複合型に対する下限値および上限値の書き込みはサポートされていません。 [#85332](https://github.com/ClickHouse/ClickHouse/pull/85332) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Distributed テーブルまたは remote テーブル関数経由でオブジェクトストレージ関連関数から読み取る際の論理エラーを修正しました。修正対象: [#84658](https://github.com/ClickHouse/ClickHouse/issues/84658)、[#85173](https://github.com/ClickHouse/ClickHouse/issues/85173)、[#52022](https://github.com/ClickHouse/ClickHouse/issues/52022)。[#85359](https://github.com/ClickHouse/ClickHouse/pull/85359)（[alesapin](https://github.com/alesapin)）。
* 壊れたプロジェクションを含むパーツのバックアップ処理を修正。 [#85362](https://github.com/ClickHouse/ClickHouse/pull/85362) ([Antonio Andelic](https://github.com/antonio2368)).
* `_part_offset` カラムが安定するまでは、リリースにおいてプロジェクションで使用できないようにしました。 [#85372](https://github.com/ClickHouse/ClickHouse/pull/85372) ([Sema Checherinda](https://github.com/CheSema)).
* JSON に対する ALTER UPDATE 時のクラッシュおよびデータ破損を修正。 [#85383](https://github.com/ClickHouse/ClickHouse/pull/85383) ([Pavel Kruglov](https://github.com/Avogar)).
* 逆順読み取りによる最適化を使用する並列レプリカのクエリで、誤った結果が返されることがありました。 [#85406](https://github.com/ClickHouse/ClickHouse/pull/85406) ([Igor Nikonov](https://github.com/devcrafter)).
* String のデシリアライズ中に `MEMORY_LIMIT_EXCEEDED` が発生した場合の、潜在的な未定義動作（クラッシュ）を修正。 [#85440](https://github.com/ClickHouse/ClickHouse/pull/85440) ([Azat Khuzhin](https://github.com/azat)).
* 誤っていた KafkaAssignedPartitions および KafkaConsumersWithAssignment メトリクスを修正。[#85494](https://github.com/ClickHouse/ClickHouse/pull/85494)（[Ilya Golshtein](https://github.com/ilejn)）。
* PREWHERE（明示的指定・自動適用のいずれの場合も）使用時に、処理済みバイト数の統計が過小に計上される問題を修正。 [#85495](https://github.com/ClickHouse/ClickHouse/pull/85495) ([Michael Kolupaev](https://github.com/al13n321)).
* S3 リクエストレート低下時の早期リターン条件を修正しました。リトライ可能なエラーにより全スレッドが一時停止されている場合のスローダウン動作を有効にする際に、`s3_slow_all_threads_after_network_error` と `backup_slow_all_threads_after_retryable_s3_error` の両方が true であることを必須とするのではなく、いずれか一方が true であればよいように変更しました。 [#85505](https://github.com/ClickHouse/ClickHouse/pull/85505) ([Julia Kartseva](https://github.com/jkartseva)).
* このPRは、REST カタログを介して Iceberg テーブルをクエリするときのメタデータ解決処理を修正します。... [#85531](https://github.com/ClickHouse/ClickHouse/pull/85531) ([Saurabh Kumar Ojha](https://github.com/saurabhojha)).
* `log_comment` または `insert_deduplication_token` の設定を変更する非同期 INSERT において、まれにクラッシュする問題を修正しました。 [#85540](https://github.com/ClickHouse/ClickHouse/pull/85540) ([Anton Popov](https://github.com/CurtizJ)).
* HTTP で multipart/form-data を使用した場合、date&#95;time&#95;input&#95;format などのパラメータが無視されていました。 [#85570](https://github.com/ClickHouse/ClickHouse/pull/85570) ([Sema Checherinda](https://github.com/CheSema))。
* icebergS3Cluster および icebergAzureCluster テーブル関数におけるシークレット情報のマスキングを修正しました。 [#85658](https://github.com/ClickHouse/ClickHouse/pull/85658) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `JSONExtract` で JSON の数値を Decimal 型に変換する際に発生していた精度損失を修正しました。これにより、JSON の数値は浮動小数点の丸め誤差を避けつつ、元の10進表現を正確に保持できるようになりました。 [#85665](https://github.com/ClickHouse/ClickHouse/pull/85665) ([ssive7b](https://github.com/ssive7b))。
* `DROP COLUMN` の後、同じ `ALTER` 文内で `COMMENT COLUMN IF EXISTS` を使用した際に発生していた `LOGICAL_ERROR` を修正しました。これにより、同じ文の中で列が削除されている場合、`IF EXISTS` 句がコメント操作を正しくスキップするようになりました。 [#85688](https://github.com/ClickHouse/ClickHouse/pull/85688) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* Delta Lake のキャッシュからの読み取り回数を修正。 [#85704](https://github.com/ClickHouse/ClickHouse/pull/85704) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 長い文字列に対する CoalescingMergeTree のセグメンテーションフォルトを修正。これにより [#84582](https://github.com/ClickHouse/ClickHouse/issues/84582) がクローズされます。 [#85709](https://github.com/ClickHouse/ClickHouse/pull/85709) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* Iceberg 書き込みでメタデータのタイムスタンプを更新。[#85711](https://github.com/ClickHouse/ClickHouse/pull/85711)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `distributed_depth` を *Cluster 関数* の指標として使用するのは誤りであり、データが重複する可能性があります。代わりに `client_info.collaborate_with_initiator` を使用してください。 [#85734](https://github.com/ClickHouse/ClickHouse/pull/85734) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Spark は position delete ファイルを読み込めません。 [#85762](https://github.com/ClickHouse/ClickHouse/pull/85762) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 非同期ログ出力のリファクタリング（[#85105](https://github.com/ClickHouse/ClickHouse/issues/85105)）後の send&#95;logs&#95;source&#95;regexp を修正。[#85797](https://github.com/ClickHouse/ClickHouse/pull/85797)（[Azat Khuzhin](https://github.com/azat)）。
* MEMORY&#95;LIMIT&#95;EXCEEDED エラー発生時に、update&#95;field を使用する辞書において発生し得る不整合を修正しました。 [#85807](https://github.com/ClickHouse/ClickHouse/pull/85807) ([Azat Khuzhin](https://github.com/azat)).
* `Distributed` 宛先テーブルに対する並列分散 `INSERT SELECT` クエリにおいて、`WITH` 句からのグローバル定数をサポートしました。以前は、このクエリで `Unknown expression identifier` エラーがスローされる可能性がありました。 [#85811](https://github.com/ClickHouse/ClickHouse/pull/85811) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `deltaLakeAzure`、`deltaLakeCluster`、`icebergS3Cluster`、`icebergAzureCluster` の認証情報をマスクするようにしました。 [#85889](https://github.com/ClickHouse/ClickHouse/pull/85889) ([Julian Maicher](https://github.com/jmaicher)).
* `DatabaseReplicated` 使用時に `CREATE ... AS (SELECT * FROM s3Cluster(...))` を実行しようとした際に発生する論理エラーを修正しました。 [#85904](https://github.com/ClickHouse/ClickHouse/pull/85904) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `url()` テーブル関数によって行われる HTTP リクエストについて、標準以外のポートへアクセスする際に Host ヘッダーにポート番号が正しく含まれるように修正しました。これにより、開発環境で一般的なカスタムポートで動作する MinIO などの S3 互換サービスに対して事前署名付き URL を使用する場合に発生していた認証エラーが解消されます（[#85898](https://github.com/ClickHouse/ClickHouse/issues/85898) を修正）。[#85921](https://github.com/ClickHouse/ClickHouse/pull/85921)（[Tom Quist](https://github.com/tomquist)）。
* これで、Unity Catalog は Delta 以外のテーブルの場合に、異常なデータ型を含むスキーマを無視するようになります。[#85699](https://github.com/ClickHouse/ClickHouse/issues/85699) の問題を修正。[#85950](https://github.com/ClickHouse/ClickHouse/pull/85950)（[alesapin](https://github.com/alesapin)）。
* Iceberg におけるフィールドの NULL 許容設定を修正。 [#85977](https://github.com/ClickHouse/ClickHouse/pull/85977) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* `Replicated` データベースのリカバリにおけるバグを修正しました。テーブル名に `%` 記号が含まれている場合、リカバリ時に異なる名前のテーブルが再作成されてしまう可能性がありました。 [#85987](https://github.com/ClickHouse/ClickHouse/pull/85987) ([Alexander Tokmakov](https://github.com/tavplubix)).
* 空の `Memory` テーブルを復元する際に発生する `BACKUP_ENTRY_NOT_FOUND` エラーが原因で、バックアップの復元が失敗する問題を修正。[#86012](https://github.com/ClickHouse/ClickHouse/pull/86012) ([Julia Kartseva](https://github.com/jkartseva))。
* Distributed テーブルで `sharding_key` を ALTER する際の検証を追加しました。以前は誤った ALTER によりテーブル定義が壊れ、サーバーの再起動が必要になる場合がありました。 [#86015](https://github.com/ClickHouse/ClickHouse/pull/86015) ([Nikolay Degterinsky](https://github.com/evillique)).
* 空の Iceberg 削除ファイルを作成しないようにしました。 [#86061](https://github.com/ClickHouse/ClickHouse/pull/86061) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 大きな設定値が原因で S3Queue テーブルやレプリカの再起動が失敗する問題を修正。 [#86074](https://github.com/ClickHouse/ClickHouse/pull/86074) ([Nikolay Degterinsky](https://github.com/evillique)).



#### ビルド/テスト/パッケージングの改善
* S3 を用いたテストでは、デフォルトで暗号化ディスクを使用するようにしました。[#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* インテグレーションテストでストリップされていないデバッグシンボルを取得するために、`clickhouse` バイナリを使用するようにしました。[#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 内部の libxml2 を 2.14.4 から 2.14.5 に更新しました。[#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze)).
* 内部の curl を 8.14.0 から 8.15.0 に更新しました。[#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze)).
* CI におけるキャッシュ用メモリ使用量を削減し、エビクションのテストを改善しました。[#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin)).


### ClickHouse リリース 25.7, 2025-07-24 {#257}

#### 後方互換性のない変更
* `extractKeyValuePairs` 関数の変更: 新しい引数 `unexpected_quoting_character_strategy` を導入しました。この引数は、クォートされていないキーまたは値の読み取り中に `quoting_character` が想定外に見つかった場合の動作を制御します。値としては `invalid`、`accept`、`promote` のいずれかを指定できます。`invalid` はキーを破棄し、キー待ち状態に戻ります。`accept` はそれをキーの一部として扱います。`promote` は直前の文字を破棄し、クォートされたキーとしてパースを開始します。加えて、クォートされた値をパースした後は、ペア区切り文字が見つかった場合にのみ次のキーをパースします。[#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos)).
* `countMatches` 関数でゼロバイト一致をサポートしました。以前の動作を保持したいユーザーは、設定 `count_matches_stop_at_empty_match` を有効にできます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov)).
* BACKUP を生成する際に、専用のサーバー設定（`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server`、`max_merges_bandwidth_for_server`）に加えて、ローカル用（`max_local_read_bandwidth_for_server` および `max_local_write_bandwidth_for_server`）とリモート用（`max_remote_read_network_bandwidth_for_server` および `max_remote_write_network_bandwidth_for_server`）のサーバー全体のスロットラーを使用するようにしました。[#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa)).
* 挿入可能な列を持たないテーブルの作成を禁止しました。[#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* アーカイブ内のファイル単位でクラスタ関数を並列化しました。以前のバージョンでは、アーカイブ全体（zip、tar、7z など）が 1 単位の処理対象でした。新しい設定 `cluster_function_process_archive_on_multiple_nodes` を追加し、デフォルト値は `true` です。`true` に設定すると、クラスタ関数でアーカイブを処理する際の性能が向上します。以前のバージョンでアーカイブ付きのクラスタ関数を使用している場合に、25.7+ へのアップグレード時のエラーを回避し、互換性を維持するには `false` に設定する必要があります。[#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `SYSTEM RESTART REPLICAS` クエリが、Lazy データベースへのアクセス権がない場合でも、テーブルが同時に DROP されている最中にそれらのテーブルをウェイクアップさせていました。注記: 現在、`SYSTEM RESTART REPLICAS` は、`SHOW TABLES` の権限を持つデータベース内のレプリカのみを再起動します。これは自然な挙動です。[#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### 新機能

* `MergeTree` ファミリのテーブルに対する軽量アップデートのサポートを追加しました。軽量アップデートは、新しい構文 `UPDATE <table> SET col1 = val1, col2 = val2, ... WHERE <condition>` で使用できます。軽量アップデートを利用した軽量削除の実装を追加しました。`lightweight_delete_mode = 'lightweight_update'` を設定することで有効化できます。 [#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* Iceberg のスキーマ進化で複合型をサポート。[#73714](https://github.com/ClickHouse/ClickHouse/pull/73714)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Iceberg テーブルへの INSERT をサポートしました。 [#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg データファイルをフィールド ID に基づいて読み取ります。これにより Iceberg との互換性が向上し、メタデータ内のフィールドをリネームしつつ、基盤となる Parquet ファイル内では別の名前にマッピングできます。これにより [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065) が解決されています。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse は Iceberg 向けの圧縮 `metadata.json` ファイルをサポートするようになりました。[#70874](https://github.com/ClickHouse/ClickHouse/issues/70874) を修正しました。[#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* Glue カタログで `TimestampTZ` をサポートしました。これにより [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654) がクローズされました。 [#83132](https://github.com/ClickHouse/ClickHouse/pull/83132) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ClickHouse クライアントに AI を活用した SQL 生成機能を追加しました。ユーザーは、クエリの先頭に `??` を付けることで、自然言語での説明文から SQL クエリを生成できるようになりました。OpenAI および Anthropic プロバイダーをサポートし、スキーマの自動検出に対応しています。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314) ([Kaushik Iska](https://github.com/iskakaushik))。
* Geo 型を WKB 形式で書き出す関数を追加。[#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* ソース用に新たに 2 種類のアクセス種別 `READ` と `WRITE` が導入され、ソースに関連する既存のすべてのアクセス種別は非推奨となりました。これまでの `GRANT S3 ON *.* TO user` は、今後は `GRANT READ, WRITE ON S3 TO user` を使用します。これにより、ソースに対する `READ` と `WRITE` 権限を分離して付与できるようになり、例えば `GRANT READ ON * TO user`、`GRANT WRITE ON S3 TO user` のように指定できます。この機能は設定 `access_control_improvements.enable_read_write_grants` によって制御され、デフォルトでは無効になっています。 [#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit)).
* NumericIndexedVector: ビットスライス方式の Roaring ビットマップ圧縮を基盤とする新しいベクターデータ構造であり、構築・解析・要素ごとの算術演算のための 20 個以上の関数を備えています。スパースデータに対するストレージ使用量の削減や、結合・フィルタ・集約の高速化に役立ちます。[#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) および T. Xiong と Y. Wang による VLDB 2024 掲載論文 [“Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411) を実装しています。 [#74193](https://github.com/ClickHouse/ClickHouse/pull/74193) ([FriendLey](https://github.com/FriendLey))。
* ワークロード設定 `max_waiting_queries` がサポートされるようになりました。これを使用してクエリキューの長さを制限できます。制限に達した場合、それ以降のすべてのクエリは `SERVER_OVERLOADED` エラーで打ち切られます。 [#81250](https://github.com/ClickHouse/ClickHouse/pull/81250) ([Oleg Doronin](https://github.com/dorooleg)).
* 次の財務関数を追加: `financialInternalRateOfReturnExtended` (`XIRR`)、`financialInternalRateOfReturn` (`IRR`)、`financialNetPresentValueExtended` (`XNPV`)、`financialNetPresentValue` (`NPV`)。 [#81599](https://github.com/ClickHouse/ClickHouse/pull/81599) ([Joanna Hulboj](https://github.com/jh0x))。
* 2つのポリゴンが交差しているかどうかを確認するための地理空間関数 `polygonsIntersectCartesian` と `polygonsIntersectSpherical` を追加しました。 [#81882](https://github.com/ClickHouse/ClickHouse/pull/81882) ([Paul Lamb](https://github.com/plamb))。
* MergeTree ファミリーのテーブルで `_part_granule_offset` 仮想カラムをサポートしました。このカラムは、各行が所属するデータパーツ内でのグラニュール／マークの 0 から始まるインデックス値を示します。これは [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572) に対応するものです。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* sRGB と OkLCH の色空間間での相互変換用 SQL 関数 `colorSRGBToOkLCH` および `colorOkLCHToSRGB` を追加しました。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue))
* `CREATE USER` クエリでユーザー名にパラメータを指定できるようにしました。 [#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein)).
* `system.formats` テーブルには、HTTP コンテンツ タイプやスキーマ推論への対応状況など、フォーマットに関する追加情報が含まれるようになりました。 [#81505](https://github.com/ClickHouse/ClickHouse/pull/81505) ([Alexey Milovidov](https://github.com/alexey-milovidov))。



#### 実験的機能
* テキストインデックスを検索するための汎用ツールとして、`searchAny` と `searchAll` 関数を追加しました。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスで新しい `split` トークナイザーをサポートしました。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `text` インデックスのデフォルトのインデックス粒度の値を 64 に変更しました。これにより、社内ベンチマークにおける平均的なテストクエリの期待されるパフォーマンスが向上します。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 ビットのビットマップは、状態の出辺ラベルを順序付きで保存しますが、出辺の状態自体はハッシュテーブル内に現れる順序でディスクに保存されます。そのため、ディスクから読み込む際に、あるラベルが誤った次状態を指してしまう可能性がありました。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスにおける FST ツリーの BLOB に対して zstd 圧縮を有効化しました。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* ベクタ類似度インデックスをベータ版に昇格しました。ベクタ類似度インデックスを利用するには、有効化が必要なエイリアス設定 `enable_vector_similarity_index` を導入しました。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 実験的なゼロコピー・レプリケーションに関連する実験的な `send_metadata` ロジックを削除しました。これは一度も使用されておらず、このコードをサポートしている人もいませんでした。さらに、それに関連するテストすら存在しなかったため、かなり前から壊れていた可能性が高いです。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* `StorageKafka2` を `system.kafka_consumers` に統合しました。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 統計情報に基づいて、`(a < 1 and a > 0) or b = 3` のような複雑な CNF/DNF を推定するようにしました。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).



#### パフォーマンスの向上

* 非同期ロギングを導入しました。ログを低速なデバイスに出力しても、クエリが遅延しなくなりました。 [#82516](https://github.com/ClickHouse/ClickHouse/pull/82516) ([Raúl Marín](https://github.com/Algunenano))。キュー内に保持できるエントリ数の上限を設けました。 [#83214](https://github.com/ClickHouse/ClickHouse/pull/83214) ([Raúl Marín](https://github.com/Algunenano))。
* 各シャードで独立して INSERT SELECT が実行されるモードにおいて、並列分散 INSERT SELECT がデフォルトで有効になりました。`parallel_distributed_insert_select` 設定を参照してください。 [#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter))。
* 集約クエリに `Nullable` ではない列に対する単一の `count()` 関数のみが含まれている場合、ハッシュテーブル探索中に集約ロジックが完全にインライン展開されます。これにより、集約状態の割り当ておよび維持が不要になり、メモリ使用量と CPU オーバーヘッドが大幅に削減されます。これは [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) に部分的に対処します。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* `HashJoin` のパフォーマンスを最適化しました。典型的なケースであるキー列が 1 つだけの場合にハッシュマップに対する追加ループを削除し、さらに `null_map` および `join_mask` が常に `true` / `false` となるケースではそれらのチェックも省略しました。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat))。
* `-If` combinator に対する軽微な最適化。 [#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* ベクトル類似性インデックスを使用したベクトル検索クエリは、ストレージ読み取り回数とCPU使用量の削減により、より低いレイテンシで完了するようになりました。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `filterPartsByQueryConditionCache` で `merge_tree_min_{rows,bytes}_for_seek` を考慮するようにし、インデックスでフィルタリングする他のメソッドと動作を揃えました。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li)).
* `TOTALS` ステップ以降のパイプラインをマルチスレッド化しました。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus))。
* `Redis` および `KeeperMap` ストレージに対するキーによるフィルタリングを修正。 [#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 新しい設定 `min_joined_block_size_rows`（`min_joined_block_size_bytes` に類似、デフォルト値は 65409）を追加し、JOIN の入力および出力ブロックに対する最小ブロックサイズ（行数）を制御できるようにしました（JOIN アルゴリズムがサポートしている場合）。小さいブロックはまとめて 1 つに圧縮されます。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat)).
* `ATTACH PARTITION` を実行しても、すべてのキャッシュがクリアされなくなりました。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 同値類を使用して冗長な JOIN 演算を削除することで、相関サブクエリ用に生成された実行プランを最適化します。すべての相関列に対して同値な式が存在する場合、`query_plan_correlated_subqueries_use_substitution` 設定が有効であれば、`CROSS JOIN` は生成されません。[#82435](https://github.com/ClickHouse/ClickHouse/pull/82435)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `EXISTS` の引数となっている相関サブクエリでは、必要な列だけを読み取るようにしました。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* クエリ解析中のクエリツリーの比較を若干高速化しました。 [#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* false sharing を軽減するため、ProfileEvents のカウンタにアライメントを追加しました。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) における `null_map` と `JoinMask` の最適化が、複数の OR 句を含む JOIN のケースにも適用されました。また、`KnownRowsHolder` データ構造も最適化されました。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* 各フラグへのアクセスのたびにハッシュを計算することを避けるため、結合フラグにはプレーンな `std::vector<std::atomic_bool>` が使用されます。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat))。
* `HashJoin` が `lazy` 出力モードを使用している場合、結果カラム用のメモリを事前に確保しないでください。特にマッチ数が少ない場合には最適ではありません。さらに、結合が完了した後には正確なマッチ数が分かるため、その値に基づいてより正確なサイズで事前確保できます。 [#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat)).
* パイプライン構築時のポートヘッダーにおけるメモリコピーを最小限に抑えました。元の[PR](https://github.com/ClickHouse/ClickHouse/pull/70105)は[heymind](https://github.com/heymind)によるものです。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* RocksDB ストレージを使用する際の clickhouse-keeper の起動を改善しました。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368)).
* 高い同時実行負荷がかかっている場合のロック競合を減らすため、ストレージスナップショットデータの作成中はロックを保持しないようにしました。 [#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94)).
* パースエラーが発生しない場合にシリアライザーを再利用することで、`ProtobufSingle` 入力フォーマットのパフォーマンスを改善しました。 [#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa))。
* 短いクエリを高速化するためのパイプライン構築処理のパフォーマンスを改善。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 短いクエリを高速化するための `MergeTreeReadersChain::getSampleBlock` を最適化しました。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano))。
* 非同期リクエストを用いることで、データカタログでのテーブル一覧表示を高速化しました。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* `s3_slow_all_threads_after_network_error` 設定が有効な場合に、S3 リトライメカニズムにジッターを導入しました。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).





#### 改善

* 複数の色を使って括弧を色分けし、可読性を向上しました。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* LIKE/REGEXP パターン内のメタ文字を、入力と同時にハイライト表示するようになりました。これはすでに `clickhouse-format` と `clickhouse-client` の echo 出力では行われていましたが、今回新たにコマンドプロンプト上でも行われるようになりました。 [#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-format` とクライアントの echo 出力におけるハイライトは、コマンドラインプロンプトでのハイライトと同じように動作するようになりました。 [#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `plain_rewritable` ディスクがデータベースメタデータ用のディスクとして使用できるようになりました。これをデータベースディスクとしてサポートするために、`plain_rewritable` に `moveFile` と `replaceFile` メソッドを実装しました。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `PostgreSQL`、`MySQL`、`DataLake` データベースのバックアップを許可しました。この種のデータベースのバックアップでは、内部のデータではなく定義のみが保存されます。[#79982](https://github.com/ClickHouse/ClickHouse/pull/79982)（[Nikolay Degterinsky](https://github.com/evillique)）。
* `allow_experimental_join_condition` の設定は、現在は常に許可されるようになったため、obsolete（廃止予定）としてマークされました。 [#80566](https://github.com/ClickHouse/ClickHouse/pull/80566) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ClickHouse の async metrics に pressure メトリクスを追加。 [#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1)).
* マークキャッシュからの追い出しを追跡するために、`MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles` のメトリクスを追加しました（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* Parquet の enum を、[仕様](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum)で規定されているとおりバイト配列として書き込めるようにしました。[#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos))。
* `DeltaLake` テーブルエンジンの改善: delta-kernel-rs には `ExpressionVisitor` API があり、この PR で実装され、パーティション列の式変換に適用されています（これは、これまで我々のコードで使用していた、delta-kernel-rs 側で非推奨となった古い方法を置き換えるものです）。将来的には、この `ExpressionVisitor` により、統計情報に基づくプルーニングや、一部の DeltaLake 独自機能も実装できるようになります。さらに、この変更の目的は `DeltaLakeCluster` テーブルエンジンでのパーティションプルーニングをサポートすることです（パースされた式の結果である ActionsDAG はシリアライズされ、データパスとともにイニシエータから送信されます。プルーニングに必要なこの種の情報は、データファイルの一覧取得時のメタ情報としてのみ利用可能であり、それはイニシエータだけが実行しますが、その情報は各読み取りサーバ上のデータに対して適用される必要があるためです）。 [#81136](https://github.com/ClickHouse/ClickHouse/pull/81136) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 名前付きタプルのスーパータイプを導出する際に要素名を保持するようになりました。 [#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc)).
* 以前にコミットされたオフセットに依存しないように、StorageKafka2 で消費済みメッセージを手動でカウントするようにしました。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `clickhouse-keeper-utils` を追加しました。ClickHouse Keeper データの管理と分析を行うための新しいコマンドラインツールです。このツールは、スナップショットおよびチェンジログからの状態のダンプ、チェンジログファイルの分析、特定のログ範囲の抽出をサポートします。 [#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368)).
* 合計およびユーザーごとのネットワークスロットル機構はリセットされないようになっているため、`max_network_bandwidth_for_all_users` および `max_network_bandwidth_for_all_users` の制限が超過されることはありません。[#81729](https://github.com/ClickHouse/ClickHouse/pull/81729)（[Sergei Trifonov](https://github.com/serxa)）。
* 出力フォーマットとして GeoParquet への書き込みをサポート。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 未完了のデータミューテーションの影響を現在受けているカラムを `RENAME COLUMN` の ALTER ミューテーションでリネームしようとする場合、その実行を禁止します。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 接続を維持すべきかが判明した時点で、`Connection` ヘッダーが他のヘッダーの末尾に送信されるようになりました。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema))。
* TCP サーバーのキュー長（デフォルトでは 64）を、`listen_backlog`（デフォルトでは 4096）に基づいて調整しました。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* サーバーを再起動せずに、`max_local_read_bandwidth_for_server` と `max_local_write_bandwidth_for_server` を動的に再読み込みできるようにしました。 [#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu)).
* `TRUNCATE TABLE system.warnings` を使用して `system.warnings` テーブルからすべての警告を削除できるようにサポートを追加しました。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイククラスタ関数におけるパーティションプルーニングを修正。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLakeCluster テーブル関数でパーティション化されたデータの読み取り処理を修正しました。この PR ではクラスタ関数のプロトコルバージョンを引き上げ、イニシエーターからレプリカへ追加情報を送信できるようにしました。この追加情報には、パーティション列（および将来的には生成列などその他の要素）の解析に必要となる delta-kernel の変換式が含まれます。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `reinterpret` 関数は、`T` が固定長データ型である場合に `Array(T)` への変換をサポートするようになりました（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* database Datalake では、より分かりやすい例外がスローされるようになりました。 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211) を修正しました。 [#82304](https://github.com/ClickHouse/ClickHouse/pull/82304)（[alesapin](https://github.com/alesapin)）。
* `HashJoin::needUsedFlagsForPerRightTableRow` から false を返すことで CROSS JOIN の動作を改善しました。[#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc))
* Map 列を Array of Tuples として読み書きできるようにしました。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.licenses` テーブルに [Rust](https://clickhouse.com/blog/rust) クレートのライセンスを一覧表示します。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano))。
* `{uuid}` のようなマクロを、S3Queue テーブルエンジンの `keeper_path` 設定で使用できるようになりました。[#82463](https://github.com/ClickHouse/ClickHouse/pull/82463) ([Nikolay Degterinsky](https://github.com/evillique))。
* Keeper の改善: ディスク間での changelog ファイルの移動をバックグラウンドスレッドで行うようにしました。以前は、changelog を別のディスクに移動すると、移動が完了するまで Keeper 全体がブロックされていました。これにより、特に移動処理に長時間を要する場合（例: S3 ディスクへの移動）にパフォーマンスの低下を招いていました。 [#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368)).
* Keeper の改善：新しい設定 `keeper_server.cleanup_old_and_ignore_new_acl` を追加しました。有効化すると、すべてのノードで既存の ACL が消去され、新しいリクエストに対する ACL は無視されます。ノードから ACL を完全に削除することが目的の場合は、新しいスナップショットが作成されるまでこの設定を有効にしたままにしておくことが重要です。 [#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368)).
* S3Queue テーブルエンジンを使用するテーブルでのストリーミングを無効化する新しいサーバー設定 `s3queue_disable_streaming` を追加しました。この設定はサーバーを再起動せずに変更できます。[#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュの動的リサイズ機能をリファクタリングしました。内部状態の解析のためのログをさらに追加しました。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定ファイルなしで起動した `clickhouse-server` も、デフォルトの設定と同様に PostgreSQL ポート 9005 をリッスンします。[#82633](https://github.com/ClickHouse/ClickHouse/pull/82633)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `ReplicatedMergeTree::executeMetadataAlter` では、StorageID を取得し、DDLGuard を取得せずに `IDatabase::alterTable` を呼び出そうとします。この処理の間に、技術的には対象のテーブルを別のテーブルと入れ替えることができてしまうため、その後に定義を取得すると誤ったテーブルの定義を取得してしまう可能性があります。これを避けるために、`IDatabase::alterTable` を呼び出そうとする際に UUID が一致するかどうかを別途チェックするようにしました。 [#82666](https://github.com/ClickHouse/ClickHouse/pull/82666) ([Nikolay Degterinsky](https://github.com/evillique))。
* 読み取り専用のリモートディスクでデータベースをアタッチする場合、テーブルの UUID を手動で DatabaseCatalog に追加する必要があります。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach))。
* ユーザーが `NumericIndexedVector` で `nan` および `inf` を使用できないようにしました。これにより [#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) が修正され、細かな改善も含まれています。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `X-ClickHouse-Progress` と `X-ClickHouse-Summary` ヘッダーの形式では、ゼロ値を省略しないでください。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Keeper の改善: world:anyone ACL に対する個別の権限をサポート。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* SummingMergeTree で集計対象として明示的に指定されている列に対する `RENAME COLUMN` や `DROP COLUMN` を許可しないようにしました。Closes [#81836](https://github.com/ClickHouse/ClickHouse/issues/81836)。[#82821](https://github.com/ClickHouse/ClickHouse/pull/82821)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Decimal` から `Float32` への変換精度を向上。`Decimal` から `BFloat16` への変換を実装。[#82660](https://github.com/ClickHouse/ClickHouse/issues/82660) をクローズ。 [#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI のスクロールバーの表示がわずかに改善されました。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 埋め込み設定を備えた `clickhouse-server` により、HTTP OPTIONS レスポンスを返すことで Web UI を利用できるようになります。 [#82870](https://github.com/ClickHouse/ClickHouse/pull/82870) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* config 内のパスに対して追加の Keeper ACL を指定できるようになりました。特定のパスに追加の ACL を付与したい場合は、config の `zookeeper.path_acls` セクションで定義します。[#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368))。
* 今後、mutation のスナップショットは可視部分のスナップショットから構築されます。また、スナップショットで使用される mutation カウンタは、含まれている mutation から再計算されます。 [#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper がソフトメモリ制限のために書き込みを拒否した際に ProfileEvent を追加します。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* `system.s3queue_log` テーブルに `commit_time` と `commit_id` カラムを追加しました。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 場合によっては、メトリクスに複数の次元を持たせる必要があります。例えば、単一のカウンタを使うのではなく、エラーコードごとに失敗したマージやミューテーションの回数をカウントしたい場合などです。この用途のために `system.dimensional_metrics` を導入しました。これはまさにそのためのものであり、最初の次元付きメトリクスとして `failed_merges` を追加します。 [#83030](https://github.com/ClickHouse/ClickHouse/pull/83030) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* clickhouse クライアントにおける未知の設定に関する警告を集約し、要約としてログに記録するようにしました。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc)).
* ClickHouse クライアントは、接続エラーが発生した際にローカルポート番号を報告するようになりました。 [#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` におけるエラー処理をわずかに改善しました。`/sys/block` ディレクトリが存在するがアクセスできない場合でも、サーバーはブロックデバイスを監視せずに起動します。[#79229](https://github.com/ClickHouse/ClickHouse/issues/79229) をクローズしました。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SystemLogs のシャットダウン順序を変更し、通常テーブルの後、system テーブルの前で行うようにしました（従来は通常テーブルの前で実行していました）。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` のシャットダウン処理のためのログを追加。[#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `Time` と `Time64` を `MM:SS`、`M:SS`、`SS`、または `S` として解釈できるようになりました。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `distributed_ddl_output_mode='*_only_active'` の場合、`max_replication_lag_to_enqueue` を超えるレプリケーションラグを持つ新規または復旧したレプリカを待機しないようにしました。これにより、新しいレプリカが初期化またはリカバリを完了してアクティブになったものの、初期化中に大量のレプリケーションログを蓄積していたために発生する `DDL task is not finished on some hosts` エラーを回避しやすくなります。また、レプリケーションログが `max_replication_lag_to_enqueue` 未満になるまで待機する `SYSTEM SYNC DATABASE REPLICA STRICT` クエリも実装しました。 [#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 例外メッセージ内で式アクションの説明を過度に長く出力しないようにしました。[#83164](https://github.com/ClickHouse/ClickHouse/issues/83164) をクローズ。[#83350](https://github.com/ClickHouse/ClickHouse/pull/83350)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パーツのプレフィックスおよびサフィックスを解析する機能を追加し、非定数カラムのカバレッジも確認できるようにしました。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 名前付きコレクションを使用する場合、ODBC と JDBC のパラメータ名を統一しました。 [#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* ストレージがシャットダウンしているときには、`getStatus` は `ErrorCodes::ABORTED` 例外をスローします。以前は、このために SELECT クエリが失敗していましたが、現在は `ErrorCodes::ABORTED` 例外を捕捉して意図的に無視するようにしました。 [#83435](https://github.com/ClickHouse/ClickHouse/pull/83435) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `MergeParts` エントリの part&#95;log プロファイルイベントに、`UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds` などのプロセスリソースメトリクスを追加しました。 [#83460](https://github.com/ClickHouse/ClickHouse/pull/83460) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Keeper で `create_if_not_exists`、`check_not_exists`、`remove_recursive` の各機能フラグをデフォルトで有効化し、新しい種類のリクエストを利用可能にしました。 [#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368)).
* サーバー停止時には、テーブルを停止する前に S3(Azure など)Queue ストリーミングを停止するようにしました。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `JSON` 入力フォーマットで `Date`／`Date32` 型を整数として扱えるようにしました。 [#83597](https://github.com/ClickHouse/ClickHouse/pull/83597) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 特定の状況におけるプロジェクションのロードおよび追加に関する例外メッセージを、より読みやすくしました。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-server` のバイナリのチェックサムによる整合性チェックをスキップするための設定オプションを導入しました。[#83637](https://github.com/ClickHouse/ClickHouse/issues/83637) を解決しました。[#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* `clickhouse-benchmark` の `--reconnect` オプションの誤ったデフォルト値を修正しました。これは [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) で誤って変更されていました。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CREATE DICTIONARY` のフォーマットの不整合を修正しました。 [#82105](https://github.com/ClickHouse/ClickHouse/issues/82105) をクローズしました。 [#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `materialize` 関数を含む TTL の一貫性のない書式を修正します。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。 [#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `INTO OUTFILE` などの出力オプションを含むサブクエリ内で、`EXPLAIN AST` のフォーマットに一貫性がない問題を修正しました。 [#82826](https://github.com/ClickHouse/ClickHouse/issues/82826) をクローズしました。 [#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* エイリアスが許可されていないコンテキストにおいて、エイリアス付きの括弧で囲まれた式の書式の不整合を修正。[#82836](https://github.com/ClickHouse/ClickHouse/issues/82836) をクローズ。[#82837](https://github.com/ClickHouse/ClickHouse/issues/82837) をクローズ。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* IPv4 と集約関数の状態を乗算する際に、適切なエラーコードを返すようにしました。[#82817](https://github.com/ClickHouse/ClickHouse/issues/82817) をクローズしました。[#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ファイルシステムキャッシュにおける論理エラー「Having zero bytes but range is not finished」を修正しました。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).
* TTL によって行が削除された際に、それに依存している `minmax_count_projection` などのアルゴリズムの正しさを保証するため、min-max インデックスを再計算するようにしました。これにより [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091) が解決されます。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* `ORDER BY ... LIMIT BY ... LIMIT N` を組み合わせたクエリで、ORDER BY が PartialSorting として実行される場合、カウンタ `rows_before_limit_at_least` は、これまでのソート変換で消費された行数ではなく、LIMIT 句によって消費された行数を反映するようになりました。 [#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 正規表現にオルタネーション（alternation）が含まれ、先頭の候補がリテラルでない場合に、token/ngram インデックスを用いたフィルタリングで granule を過剰にスキップしてしまう問題を修正。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* `<=>` 演算子と Join ストレージにおける論理エラーを修正し、クエリが適切なエラーコードを返すようになりました。 [#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `remote` 関数ファミリーと併用した際に `loop` 関数で発生するクラッシュを修正します。`loop(remote(...))` において LIMIT 句が正しく適用されるようにします。 [#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* Unix epoch（1970-01-01）より前および最大日付（2106-02-07 06:28:15）より後の日付を扱う際の `to_utc_timestamp` と `from_utc_timestamp` 関数の誤った動作を修正しました。これらの関数は、値をそれぞれ Unix epoch の開始時刻および最大日付に正しくクランプするようになりました。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046))。
* 並列レプリカで実行される一部のクエリでは、読み取り順序の最適化をイニシエータ側では適用できる一方で、リモートノードでは適用できない場合があります。これにより、並列レプリカのコーディネータ（イニシエータ上）とリモートノードで異なる読み取りモードが使用され、論理的なエラーにつながる可能性がありました。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter)).
* カラムの型が Nullable に変更された場合に、materialize プロジェクションで発生していた論理エラーを修正しました。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL を更新する際に TTL GROUP BY で TTL の再計算が誤っていた問題を修正。 [#81222](https://github.com/ClickHouse/ClickHouse/pull/81222) ([Evgeniy Ulasik](https://github.com/H0uston)).
* Parquet のブルームフィルターが、`WHERE function(key) IN (...)` のような条件を、`WHERE key IN (...)` であるかのように誤って適用していた問題を修正しました。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* マージ中の例外発生時に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* 必要に応じてデータベース名およびテーブル名をバッククオートで囲むように、`InterpreterInsertQuery::extendQueryLogElemImpl` を修正しました（たとえば、名前に `-` のような特殊文字が含まれる場合など）。[#81528](https://github.com/ClickHouse/ClickHouse/pull/81528)（[Ilia Shvyrialkin](https://github.com/Harzu)）。
* 左辺引数が null で、サブクエリの結果が非 Nullable 型の場合に、`transform_null_in=1` 設定時の `IN` 実行を修正。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar)).
* 既存テーブルからの読み取り時における default/materialize 式の実行で、実験的または疑わしい型を検証しないようにしました。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar))。
* TTL 式で dict を使用している場合にマージ時に発生する「Context has expired」エラーを修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* cast 関数の単調性を修正しました。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi))。
* スカラー相関サブクエリの処理中に必要な列が読み込まれない不具合を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を解決。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して不要に多くのコンテンツを返していました。これにより、[#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) がクローズされました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* これまで、`MongoDB` テーブルエンジンの定義では、`host:port` 引数にパスコンポーネントを含めることができましたが、このパスコンポーネントは黙って無視されていました。MongoDB 連携機能では、そのようなテーブルの読み込みを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を取る場合には、そのようなテーブルの読み込みを許可し、引数で指定されたデータベース名を使用しつつ、パスコンポーネントを無視します*。*注:* この修正は、新規に作成されたテーブルや `mongo` テーブル関数を用いたクエリ、辞書ソースおよび名前付きコレクションには適用されません。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* マージ処理中に例外が発生した場合に `Aggregator` がクラッシュする可能性があった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* クエリで定数エイリアス列のみが使用されている場合のフィルタ解析を修正。[#79448](https://github.com/ClickHouse/ClickHouse/issues/79448) を修正。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037)（[Dmitry Novik](https://github.com/novikd)）。
* GROUP BY と SET の TTL で同じカラムを使用した場合に発生する LOGICAL&#95;ERROR とそれに続くクラッシュの問題を修正。 [#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos)).
* シークレットマスキング時の S3 テーブル関数の引数検証を修正し、発生しうる `LOGICAL_ERROR` を防止しました。[#80620](https://github.com/ClickHouse/ClickHouse/issues/80620) をクローズしました。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Iceberg におけるデータレースを修正。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* `DatabaseReplicated::getClusterImpl` を修正。`hosts` の先頭要素（または先頭の複数要素）の `id == DROPPED_MARK` となっており、同じシャードに対する他の要素が存在しない場合、`shards` の先頭要素が空のベクタになって `std::out_of_range` が発生していた。[#82093](https://github.com/ClickHouse/ClickHouse/pull/82093)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* `arraySimilarity` におけるコピーペーストの誤りを修正し、重みとしての `UInt32` および `Int32` 型の使用を禁止。テストとドキュメントを更新。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `WHERE` 条件および `IndexSet` を含むクエリで `arrayJoin` を使用した際に発生する `Not found column` エラーを修正しました。 [#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Glue Catalog 連携のバグを修正しました。これにより、一部のサブカラムに decimal 型を含むネストしたデータ型のテーブル（例: `map<string, decimal(9, 2)>`）を ClickHouse が読み取れるようになりました。[#81301](https://github.com/ClickHouse/ClickHouse/issues/81301) を修正。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* 25.5 で [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) によって導入された SummingMergeTree のパフォーマンス低下を修正しました。 [#82130](https://github.com/ClickHouse/ClickHouse/pull/82130)（[Pavel Kruglov](https://github.com/Avogar)）。
* URI 経由で設定を渡す場合、最後の値が採用されます。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* Iceberg における &quot;Context has expired&quot; エラーを修正。 [#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* サーバーがメモリプレッシャー下にあるときにリモートクエリで起こり得るデッドロックを修正しました。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar))。
* `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 関数を大きな数値に対して適用した際に発生していたオーバーフローを修正しました。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165) ([Raufs Dunamalijevs](https://github.com/rienath)).
* テーブル依存関係に起因する不具合を修正し、マテリアライズドビューが INSERT クエリを取りこぼさないようにしました。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* サジェストスレッドとメインクライアントスレッド間で発生する可能性のあるデータレースを修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat))。
* これにより、ClickHouse はスキーマ変更後でも Glue カタログから Iceberg テーブルを読み取れるようになりました。[#81272](https://github.com/ClickHouse/ClickHouse/issues/81272) を修正。[#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 非同期メトリクス設定 `asynchronous_metrics_update_period_s` および `asynchronous_heavy_metrics_update_period_s` の検証ロジックを修正しました。 [#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc)).
* クエリ内に複数の JOIN がある場合の matcher 解決時の論理エラーを修正し、[#81969](https://github.com/ClickHouse/ClickHouse/issues/81969) をクローズ。[#82421](https://github.com/ClickHouse/ClickHouse/pull/82421)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 再読み込みできるよう、AWS ECS トークンに有効期限を追加。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `CASE` 関数の `NULL` 引数に関するバグを修正しました。[#82436](https://github.com/ClickHouse/ClickHouse/pull/82436) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* クライアント側のデータレースを（グローバルコンテキストを使用しないことで）解消し、`session_timezone` の上書き動作を修正しました（以前は、`session_timezone` が `users.xml` やクライアントオプションで空でない値に設定され、クエリコンテキストでは空に設定されていた場合に、本来は誤りであるにもかかわらず `users.xml` の値が使用されていましたが、現在は常にクエリコンテキストがグローバルコンテキストより優先されます）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 外部テーブルエンジンにおいて、キャッシュされたバッファーの境界アライメントを無効化する設定が機能していなかった問題を修正しました。これは [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) で壊れていました。 [#82493](https://github.com/ClickHouse/ClickHouse/pull/82493)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 型キャストされたキーを使ってキーバリューストレージを結合した場合に発生するクラッシュを修正。 [#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* logs/query&#95;log 内で名前付きコレクションの値が表示されなくなる問題を修正。[#82405](https://github.com/ClickHouse/ClickHouse/issues/82405) をクローズ。[#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `user_id` が空になる場合があるため、セッション終了時のロギングで発生する可能性があるクラッシュを修正しました。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc))。
* Time の解析処理で msan の問題が発生する可能性があったケースを修正しました。これにより次の Issue が解決されます: [#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* サーバーの処理がハングしないよう、`threadpool_writer_pool_size` を 0 に設定できないようにしました。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc))。
* 相関付けられた列を含む行ポリシー式の解析中に発生する `LOGICAL_ERROR` を修正。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd))。
* `enable_shared_storage_snapshot_in_query = 1` のときに `mergeTreeProjection` テーブル関数での親メタデータの誤った使用を修正しました。これは [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634) に対応するものです。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 関数 `trim{Left,Right,Both}` が、型「FixedString(N)」の入力文字列をサポートするようになりました。たとえば、`SELECT trimBoth(toFixedString('abc', 3), 'ac')` が動作するようになりました。 [#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* AzureBlobStorage において、ネイティブコピーのために認証方式を比較する処理で例外が発生した場合には、読み取りとコピー（非ネイティブコピー）にフォールバックするようコードを更新しました。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 要素が空の場合の `groupArraySample` / `groupArrayLast` のデシリアライズ処理を修正しました（入力が空のときに、デシリアライズでバイナリデータの一部が読み飛ばされてしまう可能性があり、これによりデータ読み取り時の破損や、TCP プロトコルにおける UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER を引き起こす可能性がありました）。これは数値型および日時型には影響しません。 [#82763](https://github.com/ClickHouse/ClickHouse/pull/82763) ([Pedro Ferreira](https://github.com/PedroTadim)).
* 空の `Memory` テーブルのバックアップによりバックアップ復元が `BACKUP_ENTRY_NOT_FOUND` エラーで失敗していた問題を修正しました。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* union/intersect/except&#95;default&#95;mode の書き換え処理における例外安全性を修正。[#82664](https://github.com/ClickHouse/ClickHouse/issues/82664) をクローズ。[#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 非同期テーブルのロードジョブの数を管理します。実行中のジョブがある場合は、`TransactionLog::removeOldEntries` 内の `tail_ptr` を更新しないようにします。 [#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Iceberg におけるデータ競合を修正。 [#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* 25.6 で導入された `use_skip_indexes_if_final_exact_mode` 最適化は、`MergeTree` エンジンの設定やデータ分布によっては、適切な候補範囲を選択できない場合がありました。この問題は解決されました。 [#82879](https://github.com/ClickHouse/ClickHouse/pull/82879) ([Shankar Iyer](https://github.com/shankar-iyer)).
* SCRAM&#95;SHA256&#95;PASSWORD 型で AST をパースする際に認証データの salt を設定しました。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach)).
* キャッシュを行わない Database 実装を使用している場合、対応するテーブルのメタデータは、列が返されて参照が無効になった後に削除されます。 [#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01)).
* `Merge` ストレージを使用するテーブルとの JOIN 式を含むクエリに対するフィルターの変更処理を修正しました。[#82092](https://github.com/ClickHouse/ClickHouse/issues/82092) を修正します。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* QueryMetricLog における LOGICAL&#95;ERROR（`Mutex cannot be NULL`）を修正。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos))。
* フォーマット指定子 `%f` が可変長のフォーマット指定子（例: `%M`）と併用された場合に、関数 `formatDateTime` が誤った出力を行っていた問題を修正しました。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* セカンダリクエリが VIEW から常にすべてのカラムを読み取る場合に、analyzer が有効な状態で発生していたパフォーマンス低下を修正しました。Issue [#81718](https://github.com/ClickHouse/ClickHouse/issues/81718) を修正。 [#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 読み取り専用ディスク上でのバックアップ復元時に表示される誤解を招くエラーメッセージを修正しました。 [#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva)).
* 依存関係を持たない `CREATE TABLE` 実行時には、循環依存関係のチェックを行わないようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) で導入された、数千のテーブルを作成するユースケースにおけるパフォーマンス低下が解消されます。 [#83077](https://github.com/ClickHouse/ClickHouse/pull/83077) ([Pavel Kruglov](https://github.com/Avogar))。
* 負の Time 値がテーブルに暗黙的に読み込まれてしまう問題を修正し、ドキュメントの記述も分かりやすくしました。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `lowCardinalityKeys` 関数で共有辞書の無関係な部分を使用しないようにしました。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* マテリアライズドビューにおけるサブカラムの使用に関するリグレッションを修正しました。これにより次の問題が修正されます: [#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 不正な INSERT 後に接続が切断された状態のまま残り、クライアントがクラッシュしてしまう問題を修正しました。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 空のカラムを含むブロックのサイズ計算時に発生していたクラッシュを修正。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* UNION における Variant 型でクラッシュが発生する可能性のある問題を修正。 [#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar))。
* サポートされていない SYSTEM クエリに対して clickhouse-local で発生していた LOGICAL&#95;ERROR を修正。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046))
* S3 クライアント用の `no_sign_request` を修正しました。これは、S3 リクエストに署名を付けないよう明示的に指定するために使用できます。エンドポイント単位の設定を使用して、特定のエンドポイントに対して定義することもできます。[#83379](https://github.com/ClickHouse/ClickHouse/pull/83379)（[Antonio Andelic](https://github.com/antonio2368)）。
* CPU スケジューリングが有効な状態で負荷がかかったときに、設定 &#39;max&#95;threads=1&#39; を指定したクエリで発生する可能性があるクラッシュを修正しました。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* CTE 定義が同名の別のテーブル式を参照している場合に発生していた `TOO_DEEP_SUBQUERIES` 例外を修正。 [#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd)).
* `REVOKE S3 ON system.*` を実行した際に `*.*` に対する S3 権限まで取り消されてしまう誤った動作を修正しました。これにより [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417) が解決されます。 [#83420](https://github.com/ClickHouse/ClickHouse/pull/83420) ([pufit](https://github.com/pufit)).
* クエリ間で async&#95;read&#95;counters を共有しないようにしました。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat)).
* サブクエリに FINAL が含まれている場合は、parallel replicas を無効化するようにしました。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 設定 `role_cache_expiration_time_seconds` における軽微な整数オーバーフローを修正しました（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) で発生したバグを修正します。定義者付きの MV に対して INSERT を行う際、権限チェックは定義者に付与された権限を使用する必要があります。この修正により [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951) が解決されます。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* Iceberg の配列要素および map 値に対する境界ベースのファイルプルーニングを、そのすべてのネストされたサブフィールドも含めて無効化。[#83520](https://github.com/ClickHouse/ClickHouse/pull/83520)（[Daniil Ivanik](https://github.com/divanik)）。
* 一時データストレージとして使用している場合に発生する可能性のあるファイルキャッシュ未初期化エラーを修正。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper の修正: セッションのクローズ時にエフェメラルノードが削除された場合に、合計ウォッチ数が正しく更新されるようにしました。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* max&#95;untracked&#95;memory 周辺の誤ったメモリ管理を修正。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* ある稀なケースにおいて、`INSERT SELECT` と `UNION ALL` の組み合わせによりヌルポインタ参照が発生する可能性がありました。これにより [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618) が解決されました。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 論理エラーを引き起こす可能性があるため、`max_insert_block_size` にゼロ値を設定できないようにしました。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* block&#95;size&#95;bytes=0 の場合に estimateCompressionRatio() で発生する無限ループを修正。 [#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat))。
* `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` の各メトリクスを修正しました（以前は `Cache` プレフィックスのないメトリクスに含まれていました）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730)（[Azat Khuzhin](https://github.com/azat)）。
* `BackgroundSchedulePool` のシャットダウン時にタスクからのスレッド join によってアボートが発生しうる問題を修正し、ユニットテストでのハングも解消できるはずです。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat))。
* 名前の衝突が発生した場合でも、新しい analyzer が WITH 句内で外側のエイリアスを参照できるようにする後方互換性の設定を導入しました。[#82700](https://github.com/ClickHouse/ClickHouse/issues/82700) を修正しました。[#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* ライブラリブリッジのクリーンアップ中の再帰的なコンテキストロックが原因で、シャットダウン時にデッドロックが発生する問題を修正。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).



#### ビルド／テスト／パッケージングの改善
* ClickHouse lexer 用の最小限の C ライブラリ（10 KB）をビルドしました。これは [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) に必要です。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。スタンドアロン lexer 用のテストを追加し、テストタグ `fasttest-only` を追加しました。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* Nix サブモジュール入力のチェックを追加しました。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* localhost 上でインテグレーションテストを実行しようとした際に発生しうる問題のいくつかを修正しました。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135)（[Oleg Doronin](https://github.com/dorooleg)）。
* Mac および FreeBSD 上で SymbolIndex をコンパイルするようにしました。（ただし、実際に動作するのは ELF システムである Linux と FreeBSD のみです。）[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Azure SDK を v1.15.0 に更新しました。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* google-cloud-cpp の storage モジュールをビルドシステムに追加しました。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881)（[Pablo Marcos](https://github.com/pamarcos)）。
* Docker Official Library の要件を満たすために、clickhouse-server 用の `Dockerfile.ubuntu` を変更しました。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `curl clickhouse.com` へのビルドのアップロードを修正するための、[#83158](https://github.com/ClickHouse/ClickHouse/issues/83158) に対するフォローアップ対応です。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `clickhouse/clickhouse-server` および公式 `clickhouse` イメージに `busybox` バイナリとインストールツールを追加しました。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* ClickHouse サーバーのホストを指定するための `CLICKHOUSE_HOST` 環境変数のサポートを追加し、既存の `CLICKHOUSE_USER` および `CLICKHOUSE_PASSWORD` 環境変数と整合させました。これにより、クライアントや設定ファイルを直接変更することなく、より容易に構成できるようになります。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659)（[Doron David](https://github.com/dorki)）。


### ClickHouse リリース 25.6, 2025-06-26 {#256}

#### 後方互換性のない変更
* これまで、関数 `countMatches` は、パターンが空のマッチを受理する場合でも、最初の空マッチでカウントを停止していました。この問題を解決するために、`countMatches` は空マッチが発生したときに 1 文字進めて処理を継続するようになりました。従来の動作を維持したいユーザーは、設定 `count_matches_stop_at_empty_match` を有効にできます。[#81676](https://github.com/ClickHouse/ClickHouse/pull/81676)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 軽微: サーバー設定 `backup_threads` および `restore_threads` がゼロ以外の値でなければならないように強制しました。[#80224](https://github.com/ClickHouse/ClickHouse/pull/80224)（[Raúl Marín](https://github.com/Algunenano)）。
* 軽微: `String` に対する `bitNot` が、内部メモリ表現として終端のヌル文字付き文字列を返すように修正しました。これはユーザーから見える動作には影響しないはずですが、著者はこの変更を明示しておきたいと考えています。[#80791](https://github.com/ClickHouse/ClickHouse/pull/80791)（[Azat Khuzhin](https://github.com/azat)）。



#### 新機能

* 新しいデータ型 `Time` ([H]HH:MM:SS) と `Time64` ([H]HH:MM:SS[.fractional]) を導入し、それらに対する基本的なキャスト関数および他のデータ型と連携するための関数をいくつか追加しました。既存の関数 `toTime` との互換性を保つための設定を追加し、設定 `use_legacy_to_time` は当面、従来の動作を維持するように設定されています。 [#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。Time/Time64 型同士の比較をサポートしました。 [#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しい CLI ツール [`chdig`](https://github.com/azat/chdig/) - ClickHouse 用の、`top` に似た TUI インターフェイスが ClickHouse の一部として追加されました。 [#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* `Atomic` および `Ordinary` データベースエンジン向けに `disk` 設定をサポートし、テーブルのメタデータファイルを保存するディスクを指定できるようにしました。 [#80546](https://github.com/ClickHouse/ClickHouse/pull/80546) ([Tuan Pham Anh](https://github.com/tuanpach))。これにより、外部ソースからデータベースをアタッチできるようになります。
* 新しい種類の MergeTree エンジンである `CoalescingMergeTree` — このエンジンはバックグラウンドマージ時に最初の非Null値を採用します。これにより [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869) が解決されました。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* WKB（「Well-Known Binary」は、さまざまなジオメトリ型をバイナリ形式で表現するためのフォーマットで、GISアプリケーションで使用されます）を読み込む関数をサポートしました。[#43941](https://github.com/ClickHouse/ClickHouse/issues/43941) を参照してください。[#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* ワークロード用のクエリスロットのスケジューリング機能を追加しました。詳細は [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling) を参照してください。[#78415](https://github.com/ClickHouse/ClickHouse/pull/78415)（[Sergei Trifonov](https://github.com/serxa)）。
* `timeSeries*` ヘルパー関数により、時系列データを扱う際のいくつかのユースケースを高速化します: - 指定した開始タイムスタンプ、終了タイムスタンプ、およびステップで、データを時間グリッドに再サンプリングします - PromQL 風の `delta`、`rate`、`idelta`、`irate` を計算します。 [#80590](https://github.com/ClickHouse/ClickHouse/pull/80590) ([Alexander Gololobov](https://github.com/davenger)).
* `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 関数を追加し、map の値によるフィルタリングと Bloom filter ベースのインデックスでのサポートを可能にしました。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus))。
* 設定制約で、使用を禁止する値のセットを指定できるようになりました。 [#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc)).
* 単一のクエリ内のすべてのサブクエリで同じストレージスナップショットを共有できるようにする設定 `enable_shared_storage_snapshot_in_query` を追加しました。これにより、クエリ内で同じテーブルが複数回参照される場合でも、そのテーブルからの読み取りの一貫性が保たれます。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird))。
* `JSON` カラムを `Parquet` に書き込むこと、および `Parquet` から `JSON` カラムを直接読み取ることをサポートします。 [#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `pointInPolygon` に `MultiPolygon` のサポートを追加しました。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* ローカルファイルシステムにマウントされた Delta テーブルを `deltaLakeLocal` テーブル関数経由でクエリできるようにするサポートを追加。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98)).
* 新しい設定 `cast_string_to_date_time_mode` を追加しました。これにより、String 型からのキャスト時に DateTime のパースモードを選択できるようになります。 [#80210](https://github.com/ClickHouse/ClickHouse/pull/80210) ([Pavel Kruglov](https://github.com/Avogar))。例えば、ベストエフォートモードに設定できます。
* Bitcoin の Bech アルゴリズムを扱うために `bech32Encode` および `bech32Decode` 関数を追加しました（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* MergeTree のパーツ名を解析するための SQL 関数を追加。 [#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 新しい仮想カラム `_disk_name` を導入することで、クエリで選択されたパーツを、それらが配置されているディスクに基づいてフィルタリングできるようにしました。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 埋め込み Web ツールの一覧を含むランディングページを追加しました。ブラウザに類するユーザーエージェントから要求されたときに表示されます。 [#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `arrayFirst`、`arrayFirstIndex`、`arrayLast` および `arrayLastIndex` は、フィルター式によって返された NULL 値を除外します。以前のバージョンでは、Nullable 型のフィルター結果はサポートされていませんでした。[#81113](https://github.com/ClickHouse/ClickHouse/issues/81113) を修正しました。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* 今後は、`USE name` の代わりに `USE DATABASE name` と記述できるようになりました。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 利用可能なコーデックを確認できる新しいシステムテーブル `system.codecs` を追加しました。(issue [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)). [#81600](https://github.com/ClickHouse/ClickHouse/pull/81600) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* `lag` および `lead` ウィンドウ関数をサポートします。[#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) をクローズしました。[#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `tokens` に、ログ処理に適した新しいトークナイザー `split` のサポートが追加されました。 [#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze))。
* `clickhouse-local` に `--database` 引数のサポートを追加しました。これにより、以前に作成したデータベースに切り替えられるようになりました。この変更により [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115) が解決されました。 [#81465](https://github.com/ClickHouse/ClickHouse/pull/81465) ([Alexey Milovidov](https://github.com/alexey-milovidov))。



#### 実験的機能
* ClickHouse Keeper を使用して `Kafka2` に対して Kafka のリバランス相当のロジックを実装しました。各レプリカについて、永続ロックと一時ロックの 2 種類のパーティションロックをサポートします。レプリカは可能な限り長く永続ロックを保持しようとし、任意の時点でレプリカ上の永続ロックは `all_topic_partitions / active_replicas_count`（ここで `all_topic_partitions` はすべてのパーティション数、`active_replicas_count` はアクティブなレプリカ数）を超えないようになっています。もしそれより多くなった場合、そのレプリカはいくつかのパーティションを解放します。一部のパーティションはレプリカによって一時的に保持されます。レプリカ上の一時ロックの最大数は動的に変化し、他のレプリカがいくつかのパーティションを永続ロックとして取得できるようにします。一時ロックを更新する際、レプリカはいったんそれらをすべて解放し、別のものを再取得しようとします。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 実験的テキストインデックスの改善として、明示的なパラメータがキーと値のペアでサポートされるようになりました。現在サポートされているパラメータは、必須の `tokenizer` と、オプションの `max_rows_per_postings_list` および `ngram_size` の 2 つです。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* これまでは、セグメント ID をディスク上の (`.gin_sid`) ファイルを読み書きすることでオンザフライで更新していたため、フルテキストインデックスでは `packed` ストレージはサポートされていませんでした。`packed` ストレージの場合、コミットされていないファイルから値を読み出すことはサポートされておらず、その結果問題が発生していました。現在はこの問題は解消されています。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 型 `gin` の実験的インデックス（PostgreSQL ハッカーたちの内輪ネタなのであまり好みません）は `text` に改名されました。既存の型 `gin` のインデックスは引き続きロード可能ですが、検索で使用しようとすると例外がスローされ（代わりに `text` インデックスを提案します）、利用できません。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。



#### パフォーマンスの向上

* 複数プロジェクションでのフィルタリングをサポートし、パートレベルのフィルタリングに複数のプロジェクションを使用できるようにしました。これは [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525) への対応です。これはプロジェクションインデックス実装に向けた第 2 段階であり、[#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) に続くものです。 [#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* デフォルトでファイルシステムキャッシュに `SLRU` キャッシュポリシーを使用します。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii)).
* クエリパイプラインの Resize ステップにおける競合を解消しました。 [#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* ネットワーク接続に紐づく単一スレッドではなく、パイプラインスレッドにブロックの(非)圧縮および(非)シリアル化処理をオフロードするオプションを追加しました。これは設定 `enable_parallel_blocks_marshalling` によって制御されます。クエリ発行元ノードとリモートノード間で大量のデータを転送する分散クエリの高速化が期待できます。 [#78694](https://github.com/ClickHouse/ClickHouse/pull/78694) ([Nikita Taranov](https://github.com/nickitat))。
* すべてのブルームフィルタータイプのパフォーマンスを改善。 [OpenHouse カンファレンスの動画](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800) ([Delyan Kratunov](https://github.com/dkratunov)).
* `UniqExactSet::merge` において、一方のセットが空の場合の正常系パスを追加しました。また、LHS セットが 2 レベル構造で RHS が単一レベル構造の場合でも、RHS を 2 レベル構造に変換しないようにしました。 [#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat))。
* 2 レベルのハッシュテーブル使用時のメモリ再利用効率を改善し、ページフォールトを削減しました。これにより、`GROUP BY` の高速化を図ります。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn))。
* クエリ条件キャッシュにおける不要な更新を回避し、ロック競合を削減しました。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* `concatenateBlocks` の軽微な最適化。parallel hash join にも有効である可能性があります。 [#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 主キー範囲からマーク範囲を選択する際、主キーが関数で包まれている場合には二分探索を使用できません。このPRでは、この制限を緩和します。主キーが常に単調な関数からなるチェーンで包まれている場合、またはRPNに常に真となる要素が含まれている場合でも、二分探索を適用できるようにします。[#45536](https://github.com/ClickHouse/ClickHouse/issues/45536) をクローズします。[#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* `Kafka` エンジンのシャットダウン速度を改善しました（複数の `Kafka` テーブルがある場合の余分な 3 秒の遅延を解消）。[#80796](https://github.com/ClickHouse/ClickHouse/pull/80796)（[Azat Khuzhin](https://github.com/azat)）。
* 非同期インサート：メモリ使用量を削減し、INSERT クエリのパフォーマンスを向上します。[#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano))。
* ログテーブルが無効になっている場合はプロセッサのプロファイルを行わないようにしました。 [#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。これにより、非常に短いクエリの実行が高速になります。
* ソースが要求どおりの内容である場合に `toFixedString` を高速化。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* 制限が設定されていないユーザーの場合は、クォータ値を処理しないようにしました。 [#81549](https://github.com/ClickHouse/ClickHouse/pull/81549) ([Raúl Marín](https://github.com/Algunenano))。これにより、ごく短いクエリの実行が高速になります。
* メモリトラッキングで発生していた性能退行を修正しました。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおけるシャーディングキーの最適化を向上しました。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* 並列レプリカ: すべての読み取りタスクが他のレプリカに割り当て済みの場合、使用されていない遅いレプリカを待たないようにしました。 [#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* Parallel replicas では個別の接続タイムアウトを使用するようになりました。`parallel_replicas_connect_timeout_ms` 設定を参照してください。以前は、`connect_timeout_with_failover_ms` / `connect_timeout_with_failover_secure_ms` 設定が、Parallel replicas クエリ用の接続タイムアウト値として使用されていました（デフォルトでは 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* ジャーナル機能を持つファイルシステムでは、`mkdir` はディスクに永続化されるファイルシステムのジャーナルに書き込まれます。ディスクが遅い場合、これには長い時間がかかることがあります。この処理を予約ロックのスコープ外に移動しました。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Iceberg のマニフェストファイルの読み取りを、最初の読み取りクエリが実行されるまで延期するように変更しました。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 適用可能な場合は、`GLOBAL [NOT] IN` 述語を `PREWHERE` 句に移動できるようにしました。 [#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa)).





#### 改善

* `EXPLAIN SYNTAX` は新しいアナライザーを使用するようになりました。クエリツリーから構築された AST を返します。クエリツリーを AST に変換する前に適用するパスの回数を制御するためのオプション `query_tree_passes` が追加されました。[#74536](https://github.com/ClickHouse/ClickHouse/pull/74536)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* Native フォーマットにおいて Dynamic と JSON 向けのフラット化シリアル化方式を実装しました。これにより、Dynamic 向けの shared variant や JSON 向けの shared data といった特別な構造を用いずに、Dynamic および JSON データをシリアル化／デシリアル化できるようになります。このシリアル化方式は、`output_format_native_use_flattened_dynamic_and_json_serialization` を設定することで有効にできます。これにより、さまざまな言語で実装されたクライアントにおいて、TCP プロトコル上での Dynamic および JSON のサポートを容易にできます。 [#80499](https://github.com/ClickHouse/ClickHouse/pull/80499) ([Pavel Kruglov](https://github.com/Avogar)).
* エラー `AuthenticationRequired` の発生後に `S3` のクレデンシャルを更新するようにしました。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.asynchronous_metrics` に辞書メトリクスを追加: `DictionaryMaxUpdateDelay` - 辞書更新の最大遅延時間（秒）。`DictionaryTotalFailedUpdates` - 直近の正常な読み込み以降に、すべての辞書で発生したエラーの総数。[#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse))。
* 破損したテーブルを退避させるために作成された可能性のあるデータベースに関する警告を追加。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `S3Queue`、`AzureQueue` エンジンに `_time` 仮想カラムを追加。 [#78926](https://github.com/ClickHouse/ClickHouse/pull/78926) ([Anton Ivashkin](https://github.com/ianton-ru))。
* CPU 過負荷時に接続をドロップする挙動を制御する設定をホットリロード可能にしました。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* Azure Blob Storage 上のプレーンディスク向けに `system.tables` で報告されるデータパスにコンテナのプレフィックスを追加し、S3 および GCP と報告形式を統一しました。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* 現在、clickhouse-client と local は、`param_<name>`（アンダースコア）に加えて、`param-<name>`（ダッシュ）形式のクエリパラメータも受け付けるようになりました。これにより、[#63093](https://github.com/ClickHouse/ClickHouse/issues/63093) がクローズされました。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* checksum を有効にしてローカルからリモート S3 へデータをコピーする際に適用される帯域幅ディスカウントに関する警告メッセージを、より詳細なものにしました。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu)).
* 以前は、`input_format_parquet_max_block_size = 0`（無効な値）の場合、ClickHouse がハングすることがありましたが、この動作は修正されました。これにより [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394) がクローズされました。 [#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* `startup_scripts` に `throw_on_error` 設定を追加しました。`throw_on_error` が true の場合、すべてのクエリが正常に完了しない限りサーバーは起動しません。デフォルトでは `throw_on_error` は false であり、従来の動作が維持されます。 [#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 任意の種類の `http_handlers` で `http_response_headers` を追加できるようにしました。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 関数 `reverse` が `Tuple` データ型をサポートするようになりました。これにより [#80053](https://github.com/ClickHouse/ClickHouse/issues/80053) がクローズされました。[#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817) を解決: `system.zookeeper` テーブルから `auxiliary_zookeepers` データを取得できるようにする。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146)（[Nikolay Govorov](https://github.com/mrdimidium)）。
* サーバーの TCP ソケットに関する非同期メトリクスを追加。これにより可観測性が向上します。[#80187](https://github.com/ClickHouse/ClickHouse/issues/80187) をクローズします。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SimpleAggregateFunction` として `anyLast_respect_nulls` および `any_respect_nulls` をサポートします。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein))。
* レプリケートされたデータベースに対する不要な `adjustCreateQueryForBackup` の呼び出しを削除。[#80282](https://github.com/ClickHouse/ClickHouse/pull/80282)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `clickhouse-local` で、`-- --config.value='abc'` のように `--` の後ろに続く追加オプションを、等号（`=`）なしで指定できるようにしました。[#80292](https://github.com/ClickHouse/ClickHouse/issues/80292) をクローズ。[#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SHOW ... LIKE` クエリ内のメタ文字を強調表示するようにしました。これにより [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) がクローズされました。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-local` で SQL UDF を永続化し、以前に作成した関数が起動時に読み込まれるようにしました。これにより [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085) が解決されます。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 予備 DISTINCT ステップに対する EXPLAIN プランでの説明を修正。 [#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus)).
* ODBC/JDBC で名前付きコレクションを使用できるようにしました。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 読み取り専用および破損状態のディスク数を示すメトリクス。DiskLocalCheckThread が開始されたときにインジケーターをログ出力します。 [#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu)).
* `projection` を使用する `s3_plain_rewritable` ストレージのサポートを実装しました。以前のバージョンでは、`projection` を参照している S3 内のメタデータオブジェクトは、移動されても更新されませんでした。[#70258](https://github.com/ClickHouse/ClickHouse/issues/70258) をクローズします。[#80393](https://github.com/ClickHouse/ClickHouse/pull/80393)（[Sav](https://github.com/sberss)）。
* `SYSTEM UNFREEZE` コマンドは、読み取り専用ディスクおよび書き込み一度きりディスク内のパーツを検索しようとしなくなりました。これにより [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430) がクローズされました。 [#80432](https://github.com/ClickHouse/ClickHouse/pull/80432) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* マージされたパーツに関するログメッセージのログレベルを下げました。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* Iceberg テーブルのパーティションプルーニングのデフォルト動作を変更。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator)).
* インデックス検索アルゴリズムのオブザーバビリティ向上のために、2 つの新しい ProfileEvents を追加: `IndexBinarySearchAlgorithm` と `IndexGenericExclusionSearchAlgorithm`。[#80679](https://github.com/ClickHouse/ClickHouse/pull/80679)（[Pablo Marcos](https://github.com/pamarcos)）。
* 古いカーネルで `MADV_POPULATE_WRITE` がサポートされていないことをログに出力しないようにした（ログがノイズであふれないようにするため）。 [#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* `TTL` 式において `Date32` と `DateTime64` のサポートを追加しました。 [#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand)).
* `max_merge_delayed_streams_for_parallel_write` の互換性に関する値を調整しました。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* クラッシュの修正: デストラクタ内で一時ファイル（ディスク上に一時データをスピルするために使用される）を削除しようとした際に例外がスローされると、プログラムが終了してしまう可能性がある問題を修正しました。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SYSTEM SYNC REPLICA` に `IF EXISTS` 修飾子を追加しました。 [#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano)).
* &quot;Having zero bytes, but read range is not finished...&quot; に関する例外メッセージを詳しくし、`system.filesystem_cache` に finished&#95;download&#95;time 列を追加しました。 [#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* indexes = 1 で使用している場合、`EXPLAIN` の出力に検索アルゴリズムのセクションを追加します。&quot;binary search&quot; または &quot;generic exclusion search&quot; のいずれかが表示されます。[#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos))。
* 2024年初め、新しいアナライザがデフォルトで有効化されていなかったため、MySQL ハンドラーでは `prefer_column_name_to_alias` が true にハードコードされていました。現在では、このハードコードを解除できるようになりました。 [#80916](https://github.com/ClickHouse/ClickHouse/pull/80916) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `system.iceberg_history` は、glue や iceberg rest などのカタログデータベースの履歴も表示するようになりました。また、一貫性を保つために、`system.iceberg_history` 内の `table_name` および `database_name` カラムを、それぞれ `table` と `database` にリネームしました。 [#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin)).
* `merge` テーブル関数で読み取り専用モードをサポートし、使用時に `CREATE TEMPORARY TABLE` 権限を付与する必要がないようにしました。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* インメモリキャッシュの可観測性を改善しました（不完全な `system.asynchronouse_metrics` ではなく、`system.metrics` を通じてキャッシュに関する情報を公開）。インメモリキャッシュのサイズ（バイト数）を `dashboard.html` に追加しました。`VectorSimilarityIndexCacheSize` / `IcebergMetadataFilesCacheSize` は `VectorSimilarityIndexCacheBytes` / `IcebergMetadataFilesCacheBytes` に名称変更されました。 [#81023](https://github.com/ClickHouse/ClickHouse/pull/81023) ([Azat Khuzhin](https://github.com/azat)).
* `system.rocksdb` から読み取る際に、`RocksDB` テーブルを含むことができないエンジンのデータベースを無視するようにしました。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-local` の設定ファイルで `filesystem_caches` と `named_collections` を使用できるようにしました。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `INSERT` クエリにおける `PARTITION BY` のハイライトを修正しました。以前のバージョンでは、`PARTITION BY` はキーワードとしてハイライトされていませんでした。[#81106](https://github.com/ClickHouse/ClickHouse/pull/81106)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI において、次の 2 つの小さな改善を行いました: - 出力を伴わない `CREATE` や `INSERT` などのクエリを正しく処理するようにしました（ごく最近まで、これらのクエリではスピナーが無限に回り続けていました）、- テーブルをダブルクリックした際に、先頭までスクロールするようにしました。 [#81131](https://github.com/ClickHouse/ClickHouse/pull/81131) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `MemoryResidentWithoutPageCache` メトリックは、ユーザー空間ページキャッシュを除いたサーバープロセスの物理メモリ使用量を、バイト単位で示します。これは、ユーザー空間ページキャッシュが利用されている場合の実際のメモリ使用量を、より正確に把握するのに役立ちます。ユーザー空間ページキャッシュが無効になっている場合、この値は `MemoryResident` と等しくなります。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* クライアント、ローカルサーバー、keeper クライアント、および disks アプリで手動でログに記録された例外を記録済みとしてマークし、二重にログ出力されないようにしました。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` と `use_skip_indexes_if_final_exact_mode` の設定は、デフォルト値が `True` になりました。`FINAL` 句を含むクエリは、（該当する場合）スキップインデックスを使用してグラニュールの候補を絞り込み、一致する primary key 範囲に対応する追加のグラニュールも読み取るようになりました。従来の、近似的／不正確な結果を返す挙動が必要なユーザーは、慎重に評価したうえで `use_skip_indexes_if_final_exact_mode` を FALSE に設定できます。[#81331](https://github.com/ClickHouse/ClickHouse/pull/81331)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* Web UI で複数のクエリを開いている場合、カーソル位置にあるクエリが実行されます。 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) の継続です。 [#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* このPRでは、変換関数に対する単調性チェックにおける `is_strict` の実装上の問題に対処しています。現在、`toFloat64(UInt32)` や `toDate(UInt8)` などの一部の変換関数は、本来は true を返すべきところで、`is_strict` を誤って false として返しています。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359) ([zoomxi](https://github.com/zoomxi))。
* `KeyCondition` が連続範囲にマッチするかどうかをチェックする際、キーが非厳密な関数チェーンでラップされている場合には、`Constraint::POINT` を `Constraint::RANGE` に変換する必要が生じることがあります。例えば、`toDate(event_time) = '2025-06-03'` は `event_time` に対して次の範囲を意味します: [&#39;2025-06-03 00:00:00&#39;, &#39;2025-06-04 00:00:00&#39;)。この PR はこの挙動を修正します。 [#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi)).
* `--host` または `--port` が指定されている場合、`clickhouse` / `ch` エイリアスは `clickhouse-local` ではなく `clickhouse-client` を実行します。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) に関する継続対応。[#65252](https://github.com/ClickHouse/ClickHouse/issues/65252) をクローズ。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Keeper の応答時間分布データが得られたので、メトリクス用のヒストグラムのバケットを調整できるようになりました。 [#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* プロファイルイベント `PageCacheReadBytes` を追加。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ファイルシステムキャッシュで発生していた「バイト数が 0 だが範囲が終了していない」という論理エラーを修正。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* `SELECT EXCEPT` クエリを使用するパラメータ化ビューを修正。[#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) をクローズ。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer: JOIN におけるカラム型の昇格後のカラム射影名を修正。 [#63345](https://github.com/ClickHouse/ClickHouse/issues/63345) をクローズ。 [#63519](https://github.com/ClickHouse/ClickHouse/pull/63519) ([Dmitry Novik](https://github.com/novikd))。
* analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier が有効な場合に、列名の衝突が発生する際の論理エラーを修正しました。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `allow_push_predicate_ast_for_distributed_subqueries` が有効な場合の、プッシュダウンされた述語内における CTE の扱いを修正しました。[#75647](https://github.com/ClickHouse/ClickHouse/issues/75647) と [#79672](https://github.com/ClickHouse/ClickHouse/issues/79672) を修正しました。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* `SYSTEM SYNC REPLICA LIGHTWEIGHT 'foo'` が、指定したレプリカが存在しない場合でも誤って成功を報告してしまう問題を修正しました。コマンドは、同期を試行する前に Keeper 内に対象のレプリカが存在するかを正しく検証するようになりました。 [#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd)).
* `ON CLUSTER` クエリの `CONSTRAINT` セクションで `currentDatabase` 関数が使用されたごく限定的な状況で発生するクラッシュを修正しました。 [#78100](https://github.com/ClickHouse/ClickHouse/issues/78100) をクローズしました。 [#79070](https://github.com/ClickHouse/ClickHouse/pull/79070) ([pufit](https://github.com/pufit))。
* サーバー間クエリでの外部ロールの受け渡しを修正。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* SingleValueDataGeneric では Field の代わりに IColumn を使用するようにしてください。これにより、`Dynamic/Variant/JSON` 型に対する `argMax` など一部の集計関数で誤った戻り値が返されていた問題が解消されます。 [#79166](https://github.com/ClickHouse/ClickHouse/pull/79166) ([Pavel Kruglov](https://github.com/Avogar))。
* Azure Blob Storage 向けの `use_native_copy` および `allow_azure_native_copy` 設定の適用を修正し、資格情報が一致する場合にのみネイティブコピーを使用するように更新しました。これにより [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964) が解決されます。[#79561](https://github.com/ClickHouse/ClickHouse/pull/79561)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* このカラムが相関付けられているかどうかを確認する処理において、カラムの起源スコープが不明な場合に発生していた論理エラーを修正しました。 [#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) を修正。 [#79451](https://github.com/ClickHouse/ClickHouse/issues/79451) を修正。 [#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* ColumnConst と Analyzer を使用した GROUPING SETS で誤った結果が返される問題を修正。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* ローカルレプリカが古くなった distributed テーブルを読み取る際に、ローカルシャードの結果が重複する問題を修正。[#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 負の符号ビットを持つ NaN のソート順を修正。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* GROUP BY ALL は GROUPING 句を考慮しなくなりました。[#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `TopK` / `TopKWeighted` 関数における誤った状態のマージ処理を修正しました。これにより、容量が使い切られていない場合でも誤差が過大になることがありました。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* `azure_blob_storage` オブジェクトストレージで `readonly` 設定が反映されるようにしました。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* バックスラッシュでエスケープされた文字を含む `match(column, '^…')` を使用した場合に発生していた、クエリ結果の誤りおよびメモリ不足によるクラッシュを修正しました。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* データレイクに対する Hive パーティショニングを無効化。部分的に [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937) に対処。[#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* ラムダ式を含むスキップインデックスが適用されない問題を修正しました。インデックス定義内の高レベル関数がクエリ内のものと完全に一致する場合に、正しく適用されるようにしました。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* レプリケーションログからの `ATTACH_PART` コマンドを実行しているレプリカで、パーツをアタッチする際のメタデータバージョンを修正しました。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 他の関数とは異なり、Executable User Defined Functions (eUDF) の名前は `system.query_log` テーブルの `used_functions` 列に追加されていませんでした。このPRでは、リクエストで eUDF が使用された場合にその eUDF 名を追加するようにしました。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush))。
* Arrow フォーマットにおける LowCardinality(FixedString) の論理エラーを修正。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar)).
* Merge エンジンからのサブカラム読み取りを修正。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* `KeyCondition` における数値型の比較に関するバグを修正しました。 [#80207](https://github.com/ClickHouse/ClickHouse/pull/80207) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* プロジェクションを持つテーブルに lazy materialization を適用した際に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 暗黙のプロジェクションを使用している場合に、`LIKE 'ab_c%'` のような文字列プレフィックスフィルタに対して行われていた誤った `count` の最適化処理を修正。これにより [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250) が解決された。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* MongoDB ドキュメント内で入れ子になった数値フィールドが文字列として誤ってシリアル化される問題を修正。MongoDB のドキュメントに対する最大ネスト深度の制限を削除。[#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz))。
* Replicated データベースにおける RMT に対するメタデータチェックを、より緩やかにしました。 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296) をクローズ。 [#80298](https://github.com/ClickHouse/ClickHouse/pull/80298) ([Nikolay Degterinsky](https://github.com/evillique))。
* PostgreSQL ストレージ用の DateTime および DateTime64 の文字列表現を修正。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `StripeLog` テーブルでタイムゾーン付きの `DateTime` を許可します。これにより [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120) が解決されます。 [#80304](https://github.com/ClickHouse/ClickHouse/pull/80304) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* クエリプランステップが行数を変更する場合には、非決定的関数を含む述語に対するフィルタープッシュダウンを無効化します。これにより [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273) を修正します。[#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* サブカラムを含むプロジェクションで発生し得る論理エラーやクラッシュを修正。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* `ON` 式が自明な等値条件ではない場合に、論理 JOIN 段階でのフィルタープッシュダウン最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正しました。[#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) および [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848) を修正しました。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* パーティション分割されたテーブルでキーを逆順に読み取る際に誤った結果が返される不具合を修正しました。これにより [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987) が解決されます。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* Nullable キーを持ち、`optimize_read_in_order` が有効になっているテーブルにおける誤ったソートを修正しました。 [#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* SYSTEM STOP REPLICATED VIEW を使用してビューを一時停止していた場合に、リフレッシュ可能なマテリアライズドビューの DROP がハングしてしまう問題を修正しました。 [#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリで定数タプルを使用した際に発生する「Cannot find column」エラーを修正。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `join_use_nulls` を有効にした Distributed テーブルでの `shardNum` 関数を修正。 [#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Merge エンジンで、一部のテーブルにのみ存在するカラムを読み取る際に誤った結果が返される問題を修正。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* replxx のハングアップにより発生し得る SSH プロトコルの問題を修正。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` テーブル内のタイムスタンプは、現在は正しくなっています。 [#80711](https://github.com/ClickHouse/ClickHouse/pull/80711) ([Melvyn Peignon](https://github.com/melvynator)).
* 辞書の登録に失敗した場合に発生する可能性のあるクラッシュを修正しました（`CREATE DICTIONARY` が `CANNOT_SCHEDULE_TASK` で失敗した際に、辞書レジストリ内にダングリングポインタが残り、その後クラッシュを引き起こす可能性がありました）。[#80714](https://github.com/ClickHouse/ClickHouse/pull/80714)（[Azat Khuzhin](https://github.com/azat)）。
* オブジェクトストレージ用テーブル関数における、要素が 1 つだけの enum グロブパターンの処理を修正。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Tuple(Dynamic) と String の比較関数で、誤った戻り値型により論理エラーが発生していた問題を修正しました。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* Unity Catalog 向けに不足していたデータ型 `timestamp_ntz` のサポートを追加。[#79535](https://github.com/ClickHouse/ClickHouse/issues/79535) および [#79875](https://github.com/ClickHouse/ClickHouse/issues/79875) を修正。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* `IN cte` を使用した分散クエリで発生する `THERE_IS_NO_COLUMN` エラーを修正。[#75032](https://github.com/ClickHouse/ClickHouse/issues/75032) を解決。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 外部 ORDER BY 用のファイル数が過剰になり、メモリ使用量が増加する問題を修正。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* このPRにより [#80742](https://github.com/ClickHouse/ClickHouse/issues/80742) がクローズされる可能性があります。 [#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* get&#95;member&#95;id() が NULL から std::string を生成していたことが原因で発生していた Kafka のクラッシュを修正しました（これはおそらくブローカーへの接続が失敗した場合にのみ発生する問題でした）。[#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat))。
* Kafka エンジンをシャットダウンする前にコンシューマの終了を正しく待つようにしました（シャットダウン後にアクティブなコンシューマが残っていると、さまざまなデバッグ用アサーションが発生したり、テーブルが削除／デタッチされた後もバックグラウンドでブローカーからデータを読み続けてしまう可能性があります）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat)).
* `predicate-push-down` 最適化によって発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正し、[#80443](https://github.com/ClickHouse/ClickHouse/issues/80443) を解決します。[#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* USING 句を伴う JOIN におけるテーブル関数で、`*`（スター）マッチャーを解決する際の論理エラーを修正しました。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Iceberg メタデータファイルキャッシュのメモリ使用量の計上を修正。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* NULL 許容パーティションキーにおける誤ったパーティショニングを修正。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* ソーステーブルがイニシエーター上に存在しない場合に、述語プッシュダウン（`allow_push_predicate_ast_for_distributed_subqueries=1`）を有効にした分散クエリで発生する `Table does not exist` エラーを修正しました。[#77281](https://github.com/ClickHouse/ClickHouse/issues/77281) を解消。[#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 名前付きウィンドウを使用したネストされた関数内の論理エラーを修正しました。 [#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* Nullable 列および浮動小数点列における極値の処理を修正。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* system.tables からのクエリ実行時に、メモリ逼迫時に発生しやすかったクラッシュを修正しました。 [#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat))。
* ファイル拡張子から圧縮方式が推測されるファイルに対して、truncate を伴うアトミックなリネーム処理を修正。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos)).
* `ErrorCodes::getName` を修正。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* Unity Catalog で、ユーザーがすべてのテーブルに対する権限を持っていない場合にテーブルを一覧表示できない不具合を修正しました。これにより、すべてのテーブルが正しく一覧表示され、アクセス制限のあるテーブルを読み取ろうとすると例外がスローされます。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin))。
* これにより、ClickHouse は `SHOW TABLES` クエリ実行時にデータレイクのカタログからのエラーや予期しないレスポンスを無視するようになりました。 [#79725](https://github.com/ClickHouse/ClickHouse/issues/79725) を修正。 [#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* JSONExtract および JSON 型の解析で、整数値から DateTime64 への変換処理を修正しました。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* `date_time_input_format` 設定をスキーマ推論キャッシュに反映するようにしました。 [#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリ開始後からカラム送信前の間にテーブルが DROP されると `INSERT` がクラッシュする問題を修正しました。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* quantileDeterministic における use-of-uninitialized-value の問題を修正。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* MetadataStorageFromDisk ディスクのトランザクションにおけるハードリンク数の管理を修正し、テストを追加。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* ユーザー定義関数 (UDF) の名前は、他の関数とは異なり `system.query_log` テーブルに記録されません。このPRでは、クエリでUDFが使用された場合、そのUDF名を `used_executable_user_defined_functions` または `used_sql_user_defined_functions` の2つのカラムのいずれかに追加するようにしました。[#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush)).
* HTTP プロトコル経由でテキストフォーマット（`JSON`、`Values` など）を用いた挿入時に、`Enum` フィールドが省略された場合に発生し得た `Too large size ... passed to allocator` エラーやクラッシュが発生する可能性のある問題を修正しました。 [#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* 非MTの MV にプッシュされる INSERT ブロックに Sparse カラムが含まれている場合の LOGICAL&#95;ERROR を修正。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* クロスレプリケーション環境で `distributed_product_mode_local=local` を使用した際に発生する `Unknown table expression identifier` エラーを修正。 [#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* フィルタリング後の Parquet ファイルで行数を誤ってキャッシュしていた問題を修正しました。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 相対キャッシュパス使用時の fs cache の max&#95;size&#95;to&#95;total&#95;space 設定を修正。 [#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Parquet 形式で const のタプルまたはマップを出力する際に clickhouse-local がクラッシュする問題を修正しました。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* ネットワーク経由で受信した配列オフセットを検証。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 空のテーブルを結合しウィンドウ関数を使用するクエリにおける一部のコーナーケースを修正しました。このバグにより、並列ストリーム数が爆発的に増加し、その結果 OOM が発生していました。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* datalake の Cluster 関数（`deltaLakeCluster`、`icebergCluster` など）に対する修正: (1) 古い analyzer で `Cluster` 関数を使用した際に `DataLakeConfiguration` で発生しうるセグメンテーションフォールトを修正; (2) データレイクのメタデータ更新が重複して行われていた問題を解消（不要なオブジェクトストレージリクエストを削減）; (3) フォーマットが明示的に指定されていない場合に、オブジェクトストレージ上で発生していた冗長な listing を修正（非 Cluster のデータレイクエンジンではすでに行われていたもの）。[#81300](https://github.com/ClickHouse/ClickHouse/pull/81300)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* force&#95;restore&#95;data フラグで失われた keeper のメタデータを復旧できるようにしました。 [#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* delta-kernel におけるリージョンエラーを修正し、[#79914](https://github.com/ClickHouse/ClickHouse/issues/79914) を解決。[#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* divideOrNull に対する不正な JIT を無効化しました。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano)).
* MergeTree テーブルのパーティション列名が長い場合に発生する挿入エラーを修正しました。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian))
* [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) でバックポート済み: マージ中の例外発生時に `Aggregator` がクラッシュする可能性があった問題を修正。[#81450](https://github.com/ClickHouse/ClickHouse/pull/81450)（[Nikita Taranov](https://github.com/nickitat)）。
* 複数のマニフェストファイルの内容を同時にメモリに保持しないようにしました。 [#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik)).
* バックグラウンドプール（`background_.*pool_size`）のシャットダウン時に起こりうるクラッシュを修正しました。 [#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* `URL` エンジンを使用してテーブルに書き込む際に `Npy` フォーマットで発生していた範囲外読み取りを修正しました。これにより [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356) が解決されます。 [#81502](https://github.com/ClickHouse/ClickHouse/pull/81502) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Web UI が `NaN%` を表示する可能性があります（典型的な JavaScript の問題によるものです）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_enforce_synchronous_settings=1` 設定時の `DatabaseReplicated` の動作を修正。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* LowCardinality(Nullable(...)) 型のソート順を修正。[#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* サーバーは、ソケットからリクエストを完全に読み取っていない場合、HTTP 接続を維持すべきではありません。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* スカラー相関サブクエリが射影式の結果を Nullable な値として返すようにしました。相関サブクエリが空の結果セットを生成する場合の不具合を修正しました。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* `ReplicatedMergeTree` への `ATTACH` 中に発生していた `Unexpected relative path for a deduplicated part` の問題を修正。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* クエリ設定 `use_iceberg_partition_pruning` は、クエリコンテキストではなくグローバルコンテキストを使用しているため、Iceberg ストレージでは有効になりません。デフォルト値が true であるため致命的な問題ではありませんが、この PR で修正されます。[#81673](https://github.com/ClickHouse/ClickHouse/pull/81673)（[Han Fei](https://github.com/hanfei1991)）。
* [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) にバックポート: TTL 式で dict を使用している場合のマージ処理中に発生する「Context has expired」を修正。[#81690](https://github.com/ClickHouse/ClickHouse/pull/81690)（[Azat Khuzhin](https://github.com/azat)）。
* MergeTree の設定 `merge_max_block_size` がゼロ以外であることを保証するバリデーションを追加。 [#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc)).
* `clickhouse-local` で発生する、ハングした `DROP VIEW ` クエリに関する問題を修正しました。 [#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc))。
* 一部のケースで StorageRedis の JOIN を修正。 [#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 空の `USING ()` を使用し、旧アナライザが有効な場合に `ConcurrentHashJoin` で発生するクラッシュの問題を修正しました。 [#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat)).
* Keeper の修正: ログに無効なエントリがある場合には、新しいログのコミットをブロックするようにしました。以前は、リーダーが一部のログを誤って適用しても、フォロワーがダイジェストの不一致を検出してアボートしているにもかかわらず、新しいログのコミットを続けていました。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* スカラー相関サブクエリの処理中に必要な列が読み取られない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 誰かが私たちのコードのあちこちにKustoを紛れ込ませていたので、きれいにしました。これで [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643) がクローズされます。 [#81885](https://github.com/ClickHouse/ClickHouse/pull/81885) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 以前のバージョンでは、サーバーが `/js` へのリクエストに対して不要に多くのコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) が解決されました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* これまで、`MongoDB` テーブルエンジン定義では、`host:port` 引数にパスコンポーネントを含めることができましたが、これは黙って無視されていました。MongoDB 連携機能では、そのようなテーブルの読み込みを拒否します。この修正により、*`MongoDB` エンジンの引数が 5 つある場合には、そのようなテーブルの読み込みを許可し、パスコンポーネントを無視して*、引数からデータベース名を使用します。*注:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を用いたクエリ、さらにディクショナリソースおよび名前付きコレクションには適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir))。
* マージ中の例外発生時に `Aggregator` がクラッシュし得る不具合を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* `arraySimilarity` のコピーペーストミスを修正し、`UInt32` および `Int32` の重みの使用を禁止。テストとドキュメントを更新。[#82103](https://github.com/ClickHouse/ClickHouse/pull/82103)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* サジェストスレッドとメインクライアントスレッド間で発生し得るデータ競合を修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).





#### ビルド/テスト/パッケージングの改善

* `postgres` 16.9 を使用します。 [#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `openssl` 3.2.4 を使用するように変更。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `abseil-cpp` のバージョン 2025-01-27 を使用するようにしました。 [#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `mongo-c-driver` 1.30.4 を使用。 [#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `krb5` 1.21.3-final を使用します。 [#81453](https://github.com/ClickHouse/ClickHouse/pull/81453) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `orc` 2.1.2 を使用します。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `grpc` を 1.73.0 に更新。[#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `delta-kernel-rs` v0.12.1 を使用するようにしました。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `c-ares` を `v1.34.5` に更新しました。 [#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* CVE-2025-5025 および CVE-2025-4947 に対処するため、`curl` を 8.14 に更新しました。 [#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit)).
* `libarchive` を 3.7.9 にアップグレードし、次の脆弱性に対処: CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。 [#81174](https://github.com/ClickHouse/ClickHouse/pull/81174) ([larryluogit](https://github.com/larryluogit))。
* `libxml2` を 2.14.3 にアップグレード。 [#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit)).
* ベンダリングされた Rust のソースコードを `CARGO_HOME` にコピーしないように変更しました。 [#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* Sentry ライブラリへの依存を、独自のエンドポイントに置き換えることで解消しました。 [#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Dependabot のアラートに対処するために CI イメージ内の Python 依存関係を更新。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano)).
* 起動時に Keeper からレプリケートされた DDL の停止フラグの読み取りを再試行するようにして、Keeper に対するフォルトインジェクションが有効な場合でもテストの堅牢性を高めました。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger))。
* Ubuntu アーカイブの URL に https を使用する。 [#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* テストイメージの Python 依存関係を更新。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot)).
* Nix ビルド用に `flake.nix` を導入。 [#81463](https://github.com/ClickHouse/ClickHouse/pull/81463) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* ビルド時にネットワークアクセスを必要としていた `delta-kernel-rs` を修正しました。[#80609](https://github.com/ClickHouse/ClickHouse/issues/80609) をクローズ。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。記事「[ClickHouse における Rust の 1 年間](https://clickhouse.com/blog/rust)」を参照してください。




### ClickHouse リリース 25.5, 2025-05-22 {#255}

#### 後方互換性のない変更
* 関数 `geoToH3` は、他の幾何関数と同様に (lat, lon, res) の順序で入力を受け取るようになりました。以前の引数の順序 (lon, lat, res) を維持したい場合は、設定 `geotoh3_argument_order = 'lon_lat'` を使用してください。 [#78852](https://github.com/ClickHouse/ClickHouse/pull/78852) ([Pratima Patel](https://github.com/pratimapatel2008)).
* ファイルシステムキャッシュ用の設定 `allow_dynamic_cache_resize` を追加しました。デフォルトは `false` で、これを有効にするとファイルシステムキャッシュの動的リサイズを許可します。理由: 特定の環境 (ClickHouse Cloud) では、すべてのスケーリングイベントがプロセスの再起動を通じて行われるため、この機能を明示的に無効化して動作をより厳密に制御したいこと、加えて安全対策のためです。この PR は後方互換性のない変更としてマークされています。以前のバージョンでは、特別な設定なしに動的キャッシュリサイズがデフォルトで有効だったためです。 [#79148](https://github.com/ClickHouse/ClickHouse/pull/79148) ([Kseniia Sumarokova](https://github.com/kssenii)).
* レガシーインデックス型 `annoy` および `usearch` のサポートを削除しました。両方とも長い間スタブの状態であり、レガシーインデックスを使用しようとするたびにエラーが返されていました。まだ `annoy` や `usearch` インデックスを保持している場合は、削除してください。 [#79802](https://github.com/ClickHouse/ClickHouse/pull/79802) ([Robert Schulze](https://github.com/rschu1ze)).
* `format_alter_commands_with_parentheses` サーバー設定を削除しました。この設定は 24.2 で導入され、デフォルトでは無効でした。25.2 でデフォルト有効になりました。新しいフォーマットをサポートしない LTS バージョンは存在しないため、この設定を削除できます。 [#79970](https://github.com/ClickHouse/ClickHouse/pull/79970) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DeltaLake` ストレージの `delta-kernel-rs` 実装をデフォルトで有効にしました。 [#79541](https://github.com/ClickHouse/ClickHouse/pull/79541) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `URL` からの読み取りで複数回のリダイレクトが発生する場合、設定 `enable_url_encoding` がチェーン内のすべてのリダイレクトに対して正しく適用されるようになりました。 [#79563](https://github.com/ClickHouse/ClickHouse/pull/79563) ([Shankar Iyer](https://github.com/shankar-iyer)). また、設定 `enble_url_encoding` のデフォルト値は `false` に設定されました。 [#80088](https://github.com/ClickHouse/ClickHouse/pull/80088) ([Shankar Iyer](https://github.com/shankar-iyer)).



#### 新機能

* WHERE 句でスカラー相関サブクエリをサポートしました。これにより [#6697](https://github.com/ClickHouse/ClickHouse/issues/6697) がクローズされました。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。単純なケースでは、射影リスト内の相関サブクエリをサポートしました。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。これにより、TPC-H テストスイートを 100% カバーするようになりました。
* ベクトル類似性インデックスを使用したベクトル検索は、これまで実験的機能でしたが、ベータ版になりました。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze))。
* `Parquet` フォーマットで geo 型のサポートを追加しました。これにより [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) が解決しました。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* インデックス作成や検索のために部分文字列を抽出する堅牢なアルゴリズムである「sparse-ngrams」を計算するための新しい関数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8` を追加しました。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12))。
* `clickhouse-local`（およびその短縮エイリアスである `ch`）は、処理対象の入力データがある場合、暗黙的に `FROM table` を使用するようになりました。これにより [#65023](https://github.com/ClickHouse/ClickHouse/issues/65023) がクローズされました。また、通常のファイルを処理する際に `--input-format` が指定されていない場合は、`clickhouse-local` でフォーマット推論が有効になりました。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `stringBytesUniq` および `stringBytesEntropy` 関数を追加し、ランダムもしくは暗号化されている可能性のあるデータを検索できるようにしました。 [#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* Base32 のエンコードおよびデコード用の関数を追加しました。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x))。
* `getServerSetting` 関数と `getMergeTreeSetting` 関数を追加し、#78318 をクローズ。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* `version-hint.text` ファイルを活用できるようにする新しい `iceberg_enable_version_hint` 設定を追加しました。 [#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche))。
* `LIKE` 句でフィルタリングして、データベース内の特定のテーブルを TRUNCATE できるようになりました。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `MergeTree` ファミリーのテーブルで `_part_starting_offset` 仮想カラムをサポートしました。このカラムは、現在のパート一覧に基づきクエリ時に計算される、すべての先行パートの累積行数を表します。この累積値はクエリの実行全体を通じて保持され、パートのプルーニング後も有効です。この動作をサポートするため、関連する内部ロジックをリファクタリングしました。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird))。
* 右側の引数がゼロの場合に NULL を返す関数 `divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull` を追加。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse のベクター検索は事前フィルタリングと事後フィルタリングの両方をサポートし、よりきめ細かな制御のための関連する設定を提供するようになりました。(issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161))。[#79854](https://github.com/ClickHouse/ClickHouse/pull/79854)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 関数と [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 関数を追加しました。[`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) でパーティション化された `Iceberg` テーブルにおけるデータファイルのプルーニングをサポートしました。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。



#### 実験的機能
* 新しい `Time` / `Time64` データ型: `Time` (HHH:MM:SS) と `Time64` (HHH:MM:SS.`&lt;fractional&gt;`)、および他のデータ型との変換に使用するいくつかの基本的なキャスト関数と関連関数を追加しました。また、既存の関数名 toTime は、キャスト関数に toTime 関数が必要なため、toTimeWithFixedDate に変更しました。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
72459).
* Iceberg データレイク向けの Hive metastore カタログ。 [#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* `full_text` 型のインデックスの名称は `gin` に変更されました。これは PostgreSQL およびその他のデータベースでより一般的な用語に従ったものです。既存の `full_text` 型インデックスは引き続き読み込み可能ですが、検索で使用しようとすると例外がスローされ（代わりに `gin` インデックスを提案します）、利用できなくなります。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).



#### パフォーマンスの向上

* Compact パート形式を変更し、各サブストリームごとにマークを保存して個々のサブカラムを読み取れるようにしました。従来の Compact 形式は読み取りでは引き続きサポートされており、MergeTree 設定 `write_marks_for_substreams_in_compact_parts` を使用することで書き込みにも有効化できます。Compact パートのストレージ形式が変更されるため、より安全にアップグレードできるよう、デフォルトでは無効になっています。今後のいずれかのリリースでデフォルトで有効になる予定です。 [#77940](https://github.com/ClickHouse/ClickHouse/pull/77940) ([Pavel Kruglov](https://github.com/Avogar))。
* サブカラムを含む条件を PREWHERE 句に移動できるようにしました。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 複数のグラニュールに対して一度に式を評価することで、二次インデックスの評価を高速化しました。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `compile_expressions`（通常の式の一部を対象とするJITコンパイラ）をデフォルトで有効にしました。これにより、[#51264](https://github.com/ClickHouse/ClickHouse/issues/51264)、[#56386](https://github.com/ClickHouse/ClickHouse/issues/56386)、[#66486](https://github.com/ClickHouse/ClickHouse/issues/66486) がクローズされました。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい設定 `use_skip_indexes_in_final_exact_mode` が導入されました。`ReplacingMergeTree` テーブルに対するクエリで FINAL 句を使用している場合、スキップインデックスに基づいてテーブルの範囲だけを読み取ると、誤った結果が返される可能性があります。この設定により、スキップインデックスによって返されたプライマリキー範囲と重なりのある新しいパーツをスキャンすることで、正しい結果が返されるようにできます。無効にするには 0、有効にするには 1 を設定します。 [#78350](https://github.com/ClickHouse/ClickHouse/pull/78350) ([Shankar Iyer](https://github.com/shankar-iyer)).
* オブジェクトストレージクラスターのテーブル関数（例: `s3Cluster`）は、キャッシュの局所性を改善するため、読み取り時にコンシステントハッシュに基づいてファイルをレプリカへ割り当てるようになりました。[#77326](https://github.com/ClickHouse/ClickHouse/pull/77326)（[Andrej Hoos](https://github.com/adikus)）。
* `S3Queue`/`AzureQueue` において、INSERT を並列に実行できるようにすることでパフォーマンスを向上しました（キュー設定で `parallel_inserts=true` を有効化すると利用可能）。これまでは S3Queue/AzureQueue ではパイプラインの前半部分（ダウンロードとパース）のみ並列実行が可能で、INSERT はシングルスレッドでした。そして `INSERT` がボトルネックになることがほとんどです。今回の変更により、`processing_threads_num` に対してほぼ線形にスケールするようになりました。 [#77671](https://github.com/ClickHouse/ClickHouse/pull/77671) ([Azat Khuzhin](https://github.com/azat))。S3Queue/AzureQueue において、より公平な max&#95;processed&#95;files&#95;before&#95;commit の動作を実現しました。 [#79363](https://github.com/ClickHouse/ClickHouse/pull/79363) ([Azat Khuzhin](https://github.com/azat))。
* 右側のテーブルのサイズがこのしきい値未満の場合に `hash` アルゴリズムにフォールバックするための、設定 `parallel_hash_join_threshold` によって制御されるしきい値を導入しました。 [#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat))。
* 現在は、parallel replicas が有効な読み取り処理において、タスクサイズを決定する際にレプリカ数を使用します。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間での作業負荷の分散がより良好になります。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat))。
* 分散集約の最終段階で `uniqExact` 状態を並列にマージできるようにしました。 [#78703](https://github.com/ClickHouse/ClickHouse/pull/78703) ([Nikita Taranov](https://github.com/nickitat)).
* キーを伴う集約における `uniqExact` 状態の並列マージで発生しうるパフォーマンス低下を修正。 [#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* Azure Storage への List Blobs API 呼び出し回数を削減しました。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva))。
* 並列レプリカを用いた分散 INSERT SELECT のパフォーマンスを改善しました。 [#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* `LogSeriesLimiter` がインスタンス生成のたびにクリーンアップを行わないようにすることで、高並行な環境におけるロック競合とパフォーマンス低下を回避します。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* trivial count 最適化によりクエリを高速化しました。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* 一部の `Decimal` 演算でインライン化を改善しました。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `input_format_parquet_bloom_filter_push_down` をデフォルトで true に設定しました。また、設定変更履歴の誤りを修正しました。 [#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* すべての行が削除されるパーツに対する `ALTER ... DELETE` ミューテーションを最適化しました。これにより、そのようなケースではミューテーションを実行して元のパーツを書き換える代わりに、空のパーツが作成されるようになりました。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* Compact パーツへの挿入時に、可能な限りブロックの不要なコピーを避けるようにしました。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* `input_format_max_block_size_bytes` 設定を追加して、入力フォーマットで作成されるブロックのサイズをバイト単位で制限できるようにしました。これにより、行に大きな値が含まれている場合のデータインポート時のメモリ使用量の増大を回避するのに役立ちます。 [#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar))。
* スレッドおよび async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests のガードページを削除しました。`FiberStack` のメモリアロケーション方式を `mmap` から `aligned_alloc` に変更しました。`mmap` は VMA を分割し、高負荷時には vm.max&#95;map&#95;count の上限に達する可能性があるためです。[#79147](https://github.com/ClickHouse/ClickHouse/pull/79147)（[Sema Checherinda](https://github.com/CheSema)）。
* 並列レプリカでの遅延マテリアライズ。 [#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).





#### 改善

* オンザフライで軽量削除を適用できる機能を追加しました（設定 `lightweight_deletes_sync = 0`、`apply_mutations_on_fly = 1` を使用）。[#79281](https://github.com/ClickHouse/ClickHouse/pull/79281)（[Anton Popov](https://github.com/CurtizJ)）。
* ターミナルに pretty フォーマットでデータが表示されていて、その後続のブロックが同じカラム幅を持つ場合、カーソルを上に移動して前のブロックに結合し、前のブロックから続けて表示できるようになりました。これにより [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333) が解決されました。この機能は新しい設定 `output_format_pretty_glue_chunks` によって制御されます。[#79339](https://github.com/ClickHouse/ClickHouse/pull/79339)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `isIPAddressInRange` 関数を `String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)`、および `Nullable(IPv6)` データ型に対応しました。 [#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff)).
* `PostgreSQL` エンジンのコネクションプーラー設定を動的に変更できるようにしました。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 通常のプロジェクションで `_part_offset` を指定可能にしました。これはプロジェクションインデックスを構築するための第一歩です。[#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) と併用でき、#63207 の改善にも役立ちます。[#78429](https://github.com/ClickHouse/ClickHouse/pull/78429) ([Amos Bird](https://github.com/amosbird))。
* `system.named_collections` に新しいカラム（`create_query` と `source`）を追加しました。[#78179](https://github.com/ClickHouse/ClickHouse/issues/78179) をクローズしました。[#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* システムテーブル `system.query_condition_cache` に新しいフィールド `condition` を追加しました。クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件式を保持します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* `BFloat16` 列に対してベクトル類似インデックスを作成できるようになりました。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze)).
* ベストエフォートでの `DateTime64` 解析で、小数部付きの Unix タイムスタンプをサポート。 [#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* ストレージ `DeltaLake` の delta-kernel 実装でカラムマッピングモードを修正し、スキーマ進化用のテストを追加。[#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Values 形式で `Variant` カラムに挿入する際の値の変換を改善しました。 [#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar)).
* `tokens` 関数が拡張され、追加の「tokenizer」引数に加えて tokenizer 固有の引数も受け取れるようになりました。 [#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov))。
* `SHOW CLUSTER` ステートメントは、引数内のマクロ（もしあれば）を展開するようになりました。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42)).
* ハッシュ関数は、配列、タプル、およびマップ内の `NULL` 値をサポートするようになりました（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) および [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。 [#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* cctz を 2025a に更新。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano)).
* UDF のデフォルトの stderr 処理を &quot;log&#95;last&quot; に変更しました。使い勝手が向上します。 [#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI でタブ操作を取り消せるようにしました。これにより [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284) がクローズされます。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `recoverLostReplica` 実行時の設定を、[https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様に削除しました。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Parquet インデックスのプルーニングをプロファイルするため、プロファイルイベント `ParquetReadRowGroups` と `ParquetPrunedRowGroups` を追加しました。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* クラスター上のデータベースに対する `ALTER` をサポートしました。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* QueryMetricLog の統計収集で発生した実行漏れを明示的にスキップするようにしないと、ログが現在時刻に追いつくまでに非常に長い時間がかかります。 [#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Arrow` ベースのフォーマットの読み込みに対して、いくつかの軽微な最適化を行いました。 [#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc)).
* 設定 `allow_archive_path_syntax` は、誤って実験的機能としてマークされていました。実験的な設定がデフォルトで有効にならないことを確認するテストを追加しました。 [#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ページキャッシュ設定をクエリごとに調整可能にしました。これは、より高速な実験や、高スループットかつ低レイテンシーなクエリ向けに細かくチューニングできるようにするために必要です。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 典型的な 64-bit ハッシュのように見える数値については、数値ヒントを見やすい書式で表示しないようにしました。これにより [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334) が解決されました。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高度なダッシュボード上のグラフの色は、対応するクエリのハッシュから計算されます。これにより、ダッシュボードをスクロールする際にグラフを覚えておきやすくなり、目的のグラフを見つけやすくなります。 [#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 非同期メトリック `FilesystemCacheCapacity` を追加しました。これは `cache` 仮想ファイルシステムの総容量を表します。インフラストラクチャ全体の監視に有用です。 [#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts へのアクセスを最適化し、要求された場合にのみ列/インデックスサイズを読み取るようにしました。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* クエリ `'SHOW CLUSTER <name>'` で、すべてのフィールドではなく関連するフィールドのみを計算するようにしました。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `DatabaseCatalog` のストレージ設定を指定できるようにしました。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` でローカルストレージのサポートを追加しました。 [#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* delta-kernel-rs を有効にするためのクエリレベル設定 `allow_experimental_delta_kernel_rs` を追加。[#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure/S3 の BLOB ストレージから BLOB を一覧取得する際に発生する可能性のあった無限ループを修正。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger)).
* ファイルシステムキャッシュ設定 `max_size_ratio_to_total_space` を追加しました。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `clickhouse-benchmark` について、`reconnect` オプションの設定を変更し、再接続の挙動を制御する値として 0、1、または N を指定できるようにしました。[#79465](https://github.com/ClickHouse/ClickHouse/pull/79465)（[Sachin Kumar Singh](https://github.com/sachinkumarsingh092)）。
* 異なる `plain_rewritable` ディスク上にあるテーブルに対して `ALTER TABLE ... MOVE|REPLACE PARTITION` を許可できるようにしました。 [#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva)).
* ベクトル類似度インデックスは、参照ベクターが `Array(BFloat16)` 型の場合にも使用されるようになりました。 [#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer)).
* last&#95;error&#95;message、last&#95;error&#95;trace、および query&#95;id を system.error&#95;log テーブルに追加しました。関連チケット [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* クラッシュレポートの送信をデフォルトで有効にしました。これはサーバーの設定ファイルで無効化できます。 [#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* システムテーブル `system.functions` に、各関数が最初に導入された ClickHouse バージョンが表示されるようになりました。 [#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze)).
* `access_control_improvements.enable_user_name_access_type` 設定を追加しました。この設定により、[https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) で導入されたユーザー／ロールに対する厳密な権限付与を有効／無効にできます。レプリカの一部が 25.1 より前のバージョンであるクラスタを使用している場合は、この設定をオフにすることを検討してください。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* `ASTSelectWithUnionQuery::clone()` メソッドの正しい実装で、`is_normalized` フィールドも考慮されるようになりました。これにより、[#77569](https://github.com/ClickHouse/ClickHouse/issues/77569) の解決に役立つ可能性があります。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `EXCEPT` 演算子を含む一部のクエリにおける一貫性のないフォーマットを修正します。`EXCEPT` 演算子の左辺が `*` で終わる場合、フォーマット後のクエリでは括弧が失われ、その結果 `EXCEPT` 修飾子付きの `*` としてパースされてしまいます。これらのクエリは fuzzer によって検出されたものであり、実際に遭遇する可能性は低いと考えられます。この変更により [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950) がクローズされます。 [#79952](https://github.com/ClickHouse/ClickHouse/pull/79952) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `JSON` 型のパースにおいて、variant のデシリアライズ順序をキャッシュすることで、わずかな改善が行われました。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar)).
* `s3_slow_all_threads_after_network_error` 設定を追加しました。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar)).
* マージ対象に選択されたパーツに関するログレベルが誤っており、Information になっていました。[#80061](https://github.com/ClickHouse/ClickHouse/issues/80061) をクローズ。 [#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer: ツールチップおよびステータスメッセージに runtime/share を追加。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa)).
* trace-visualizer: ClickHouse サーバーからデータを読み込み。 [#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa)).
* 失敗したマージ用のメトリクスを追加。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-benchmark` は、最大反復回数が指定されている場合、その値に基づいてパーセンテージを表示するようになりました。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* system.parts テーブル用ビジュアライザーを追加。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* クエリのレイテンシーを解析するためのツールを追加。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* パーツ内で欠落している列のリネーム処理を修正。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* マテリアライズドビューの開始タイミングが遅くなり、例えばそれにストリーミングする Kafka テーブルよりも後に作成されてしまう場合があります。 [#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn))。
* analyzer を有効化した状態で `VIEW` を作成する際の `SELECT` クエリの書き換えを修正しました。 [#75956](https://github.com/ClickHouse/ClickHouse/issues/75956) をクローズ。 [#76356](https://github.com/ClickHouse/ClickHouse/pull/76356) ([Dmitry Novik](https://github.com/novikd))。
* サーバーからの `async_insert` の適用方法（`apply_settings_from_server` 経由）を修正（これにより、従来クライアント側で発生していた `Unknown packet 11 from server` エラーを解消）。 [#77578](https://github.com/ClickHouse/ClickHouse/pull/77578) ([Azat Khuzhin](https://github.com/azat)).
* レプリケーテッドデータベースで、新しく追加されたレプリカ上でリフレッシュ可能なマテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* リフレッシュ可能なマテリアライズドビューが原因でバックアップが失敗する問題を修正しました。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* `transform` の旧ファイアリングロジックに関する論理エラーを修正。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `analyzer` 使用時にセカンダリインデックスが適用されていなかったいくつかのケースを修正。[#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) および [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373) を修正。[#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 圧縮が有効な HTTP プロトコルでのプロファイルイベント（`NetworkSendElapsedMicroseconds` / `NetworkSendBytes`）のダンプ処理を修正（誤差がバッファサイズ、通常は約 1MiB を超えないようにする）。 [#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat)).
* JOIN ... USING に ALIAS 列が含まれる場合に LOGICAL&#95;ERROR を生成していた analyzer の問題を修正し、代わりに適切なエラーを返すようにしました。 [#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* アナライザー: `SELECT` に位置引数が含まれている場合に `CREATE VIEW ... ON CLUSTER` が失敗する問題を修正。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `SELECT` がスカラーサブクエリを含む場合に、スキーマ推論を行うテーブル関数に対して `INSERT SELECT` を実行すると発生する `Block structure mismatch` エラーを修正。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* アナライザを修正: Distributed テーブルに対して prefer&#95;global&#95;in&#95;and&#95;join=1 が有効な場合、SELECT クエリ内の `in` 関数が `globalIn` に置き換えられるようにしました。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `MongoDB` エンジンを使用するテーブル、または `mongodb` テーブル関数から読み取る、いくつかの種類の `SELECT` クエリを修正しました。修正対象には、`WHERE` 句内での定数値の暗黙的な型変換を伴うクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）、`LIMIT` と `GROUP BY` を含むクエリが含まれます。これらのクエリでは以前、誤った結果が返される可能性がありました。[#78777](https://github.com/ClickHouse/ClickHouse/pull/78777)（[Anton Popov](https://github.com/CurtizJ)）。
* 異なる JSON 型間の変換を修正しました。現在は、String への／からの変換を経由する単純なキャストによって実行されます。効率はやや劣りますが、変換精度は 100% です。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型から Interval への変換時に発生する論理エラーを修正。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON 解析エラー発生時のカラムのロールバック処理を修正。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 定数エイリアス列を使用した JOIN で発生する &#39;bad cast&#39; エラーを修正しました。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ビューとターゲットテーブルで型が異なる列を持つマテリアライズドビューでは PREWHERE を使用できないようにしました。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* Variant カラムの不正なバイナリデータのパース時に発生する論理エラーを修正。 [#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* parquet バッチサイズが 0 に設定されている場合に例外をスローするようにしました。以前は output&#95;format&#95;parquet&#95;batch&#95;size = 0 のとき ClickHouse がハングしていましたが、この問題は修正されました。 [#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely)).
* コンパクトパーツにおける basic フォーマットの variant discriminator のデシリアライズを修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) で導入されました。 [#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* `complex_key_ssd_cache` 型の辞書は、0 または負の値の `block_size` および `write_buffer_size` パラメータを拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。 [#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* SummingMergeTree で非集約列に Field を使用しないでください。SummingMergeTree で使用される Dynamic/Variant 型と組み合わせると、予期しないエラーが発生する可能性があります。 [#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar))。
* アナライザにおける、ヘッダーが異なる Distributed 宛先テーブルを持つマテリアライズドビューからの読み取りを修正。[#79059](https://github.com/ClickHouse/ClickHouse/pull/79059)（[Pavel Kruglov](https://github.com/Avogar)）。
* バッチ挿入されたテーブルで `arrayUnion()` が余分な（誤った）値を返すバグを修正しました。[#75057](https://github.com/ClickHouse/ClickHouse/issues/75057) を修正。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* `OpenSSLInitializer` のセグメンテーションフォルトを修正。[#79092](https://github.com/ClickHouse/ClickHouse/issues/79092) をクローズ。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* S3 の ListObject で常に prefix を設定するようにしました。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* バッチ挿入を行うテーブルで arrayUnion() が余分な（誤った）値を返すバグを修正しました。[#79157](https://github.com/ClickHouse/ClickHouse/issues/79157) を修正。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* フィルターのプッシュダウン後に発生する論理エラーを修正。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* HTTP ベースのエンドポイント経由で delta-kernel 実装を使用する DeltaLake テーブルエンジンの不具合を修正し、NOSIGN を修正しました。Closes [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124)。[#79203](https://github.com/ClickHouse/ClickHouse/pull/79203) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Keeper の修正: 失敗したマルチリクエストで watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `IN` で Dynamic 型と JSON 型の使用を禁止。現在の `IN` の実装では、誤った結果につながる可能性があります。これらの型に対する `IN` の適切なサポートは複雑であり、将来的に対応される可能性があります。 [#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON 型パース時の重複パスチェックを修正。 [#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar)).
* SecureStreamSocket の接続に関する問題を修正。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* データを含む plain&#95;rewritable ディスクの読み込みを修正。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* MergeTree の Wide パーツにおける動的サブカラム検出処理で発生するクラッシュを修正。 [#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル名の長さは初回の CREATE クエリでのみ検証します。後方互換性の問題を避けるため、2 回目以降の CREATE では検証しないでください。[#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* スパースカラムを使用するテーブルで、複数のケースにおいて発生していた `Block structure mismatch` エラーを修正しました。 [#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* &quot;Logical Error: Can&#39;t set alias of * of Asterisk on alias&quot; というエラーが発生する2つのケースを修正。 [#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano)).
* Atomic データベースの名前を変更する際に誤ったパスが使用される問題を修正しました。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach))。
* JSON 列と他の列を併用した ORDER BY の問題を修正。 [#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar))。
* `use_hedged_requests` と `allow_experimental_parallel_reading_from_replicas` の両方が無効になっている場合に、remote テーブルから読み取る際に発生する結果の重複を修正しました。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* Unity Catalog 使用時の delta-kernel 実装で発生していたクラッシュを修正しました。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 自動検出クラスタ向けマクロの解決に対応。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 誤設定された page&#95;cache&#95;limits を適切に処理できるようにしました。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* 可変長フォーマッタ（例: `%W`、曜日 `Monday` `Tuesday` など）の後に、複合フォーマッタ（複数の構成要素をまとめて出力するフォーマッタ。例: `%D`、米国形式の日付 `05/04/25` など）が続く場合の SQL 関数 `formatDateTime` の結果が正しくなるよう修正しました。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze)).
* IcebergS3 は count 関数の最適化をサポートしていますが、IcebergS3Cluster はサポートしていません。その結果、クラスターモードで返される count() の結果は、レプリカ数の倍数になる場合があります。[#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear))。
* 遅延マテリアライゼーション時に、プロジェクションまでクエリ実行でどの列も使用されない場合に発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正します。例: SELECT * FROM t ORDER BY rand() LIMIT 5。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926)（[Igor Nikonov](https://github.com/devcrafter)）。
* クエリ `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` でパスワードを非表示にしました。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* JOIN USING でエイリアスを指定できるようにしました。列がリネームされた場合（たとえば ARRAY JOIN によって）に、このエイリアスを指定してください。[#73707](https://github.com/ClickHouse/ClickHouse/issues/73707) を修正します。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 新しいレプリカで UNION を含むマテリアライズドビューが正しく動作するようにしました。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 関数 `parseDateTime` におけるフォーマット指定子 `%e` は、これまでは空白によるパディング（例: ` 3`）が必須でしたが、現在は 1 桁の日（例: `3`）も認識するようになりました。これにより、MySQL と互換性のある動作になります。以前の挙動を維持したい場合は、設定 `parsedatetime_e_requires_space_padding = 1` を指定してください。（issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)）。[#80057](https://github.com/ClickHouse/ClickHouse/pull/80057)（[Robert Schulze](https://github.com/rschu1ze)）。
* ClickHouse のログに出力される `Cannot find 'kernel' in '[...]/memory.stat'` という警告を修正しました（issue [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* FunctionComparison 内でスタックサイズをチェックし、スタックオーバーフローによるクラッシュを回避するようにしました。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* `system.workloads` からの SELECT 実行時に発生する競合状態を修正。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修正: 分散クエリにおける遅延マテリアライズの修正。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* `Array(Bool)` から `Array(FixedString)` への変換処理を修正。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat))。
* Parquet バージョンの選択がより分かりやすくなりました。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* `ReservoirSampler` の自己マージ処理を修正。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントコンテキスト内の挿入テーブルのストレージを修正。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `AggregatingSortedAlgorithm` および `SummingSortedAlgorithm` のデータメンバーの破棄順序を修正。 [#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat))。
* `enable_user_name_access_type` が `DEFINER` アクセスタイプに影響しないようにしました。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* system データベースのメタデータが Keeper に配置されている場合、system データベースへのクエリがハングすることがありました。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).



#### ビルド／テスト／パッケージングの改善
* 常に再ビルドするのではなく、ビルド済みの `chcache` バイナリを再利用できるようにしました。 [#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* NATS の一時停止待機を追加しました。 [#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* ARM ビルドが amd64compat として誤って公開されていた問題を修正しました。 [#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger)).
* OpenSSL 向けに事前生成されたアセンブリを使用するようにしました。 [#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `clang20` でビルドできるように修正しました。 [#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `chcache`: Rust キャッシュ機能のサポートを追加しました。 [#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `zstd` のアセンブリファイルにアンワインド情報を追加しました。 [#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321)).


### ClickHouse release 25.4, 2025-04-22 {#254}

#### 後方互換性のない変更
* `allow_materialized_view_with_bad_select` が `false` の場合、マテリアライズドビュー内のすべてのカラムが対象テーブルと一致しているかをチェックするようにしました。 [#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm)).
* `dateTrunc` が負の Date/DateTime 引数とともに使用されるケースを修正しました。 [#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* レガシーな `MongoDB` 連携機能を削除しました。サーバー設定 `use_legacy_mongodb_integration` は廃止され、現在は何も行いません。 [#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze)).
* `SummingMergeTree` の検証を強化し、パーティションキーまたはソートキーとして使用されるカラムについては集約をスキップするようにしました。 [#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).



#### 新機能

* ワークロード用に CPU スロットのスケジューリング機能を追加しました。詳細については[ドキュメント](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)を参照してください。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* `clickhouse-local` は、`--path` コマンドライン引数を指定すると、再起動後もデータベースを保持します。これにより [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647) および [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947) がクローズされます。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* サーバーが過負荷になっている場合にクエリを拒否します。判断は、待ち時間（`OSCPUWaitMicroseconds`）とビジー時間（`OSCPUVirtualTimeMicroseconds`）の比率に基づいて行われます。この比率が `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` の間にある場合（いずれもクエリレベルの設定値）、一定の確率でクエリがドロップされます。[#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* `Iceberg` におけるタイムトラベル: 特定のタイムスタンプの時点で `Iceberg` テーブルをクエリできる設定を追加。 [#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* `Iceberg` メタデータ用のメモリ内キャッシュで、マニフェストファイルおよびそのリストと `metadata.json` を保存し、クエリを高速化します。 [#77156](https://github.com/ClickHouse/ClickHouse/pull/77156) ([Han Fei](https://github.com/hanfei1991)).
* Azure Blob Storage 用の `DeltaLake` テーブルエンジンをサポートしました。 [#68043](https://github.com/ClickHouse/ClickHouse/issues/68043) を修正しました。 [#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* デシリアライズされたベクトル類似性インデックス用のインメモリキャッシュを追加しました。これにより、近似最近傍（ANN）検索クエリの繰り返し実行を高速化できます。新しいキャッシュのサイズは、サーバー設定 `vector_similarity_index_cache_size` および `vector_similarity_index_cache_max_entries` によって制御されます。この機能は、以前のリリースにおけるスキップインデックスキャッシュ機能を置き換えるものです。[#77905](https://github.com/ClickHouse/ClickHouse/pull/77905)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* DeltaLake でパーティションのプルーニングをサポートするようにしました。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 読み取り専用の `MergeTree` テーブルでバックグラウンドリフレッシュをサポートし、更新可能なテーブルを無制限の分散リーダーからクエリできるようにする機能（ClickHouse ネイティブなデータレイク）。 [#76467](https://github.com/ClickHouse/ClickHouse/pull/76467)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* カスタムディスクを利用してデータベースのメタデータファイルを保存できるようになりました。現在はグローバルなサーバーレベルでのみ設定できます。 [#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach))。
* plain&#95;rewritable ディスクに対して ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION をサポートしました。[#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva)).
* `Kafka` テーブルエンジン向けに、`SASL` 設定および認証情報を指定するためのテーブル設定を追加しました。これにより、構成ファイルや名前付きコレクションを使用することなく、CREATE TABLE 文内で直接、Kafka および Kafka 互換システム向けの SASL ベースの認証を設定できるようになります。 [#78810](https://github.com/ClickHouse/ClickHouse/pull/78810) ([Christoph Wurm](https://github.com/cwurm))。
* MergeTree テーブルに対して `default_compression_codec` を設定できるようにしました。これは、CREATE クエリで対象のカラムに対して圧縮コーデックが明示的に定義されていない場合に使用されます。これにより [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005) が解決されました。[#66394](https://github.com/ClickHouse/ClickHouse/pull/66394)（[gvoelfin](https://github.com/gvoelfin)）。
* 分散接続で特定のネットワークを使用できるようにするため、クラスタ構成に `bind_host` 設定を追加しました。 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum)).
* `system.tables` に新しいカラム `parametrized_view_parameters` を導入しました。 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756) をクローズしました。 [#75112](https://github.com/ClickHouse/ClickHouse/pull/75112)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* データベースコメントの変更を可能にしました。Closes [#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) ### ユーザー向け変更に関するドキュメントエントリ。[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622) ([NamNguyenHoai](https://github.com/NamHoaiNguyen)).
* PostgreSQL互換プロトコルで `SCRAM-SHA-256` 認証をサポートしました。[#76839](https://github.com/ClickHouse/ClickHouse/pull/76839)（[scanhex12](https://github.com/scanhex12)）。
* 関数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted`、`arraySimilarity` を追加しました。 [#77187](https://github.com/ClickHouse/ClickHouse/pull/77187) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 設定項目 `parallel_distributed_insert_select` は、`ReplicatedMergeTree` テーブルへの `INSERT SELECT` に対しても適用されるようになりました（以前は Distributed テーブルが必要でした）。[#78041](https://github.com/ClickHouse/ClickHouse/pull/78041)（[Igor Nikonov](https://github.com/devcrafter)）。
* `toInterval` 関数を導入しました。この関数は 2 つの引数（値と単位）を受け取り、その値を指定された `Interval` 型に変換します。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723)（[Andrew Davis](https://github.com/pulpdrew)）。
* iceberg テーブル関数およびエンジンで、ルート `metadata.json` ファイルを解決するための便利な方法をいくつか追加しました。[#78455](https://github.com/ClickHouse/ClickHouse/issues/78455) をクローズしました。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* ClickHouse の SSH プロトコルでパスワードベースの認証をサポートしました。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 実験的機能
* `WHERE` 句内の `EXISTS` 式の引数として相関サブクエリをサポート。 [#72459](https://github.com/ClickHouse/ClickHouse/issues/72459) をクローズ。 [#76078](https://github.com/ClickHouse/ClickHouse/pull/76078) ([Dmitry Novik](https://github.com/novikd))。
* ASCII および UTF-8 バージョンを備えた `sparseGrams` 関数と `sparseGramsHashes` 関数を追加。作者: [scanhex12](https://github.com/scanhex12)。 [#78176](https://github.com/ClickHouse/ClickHouse/pull/78176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。これらの関数は使用しないでください。実装は今後のバージョンで変更される予定です。



#### パフォーマンスの向上

* ORDER BY と LIMIT の適用後にデータを読み込む lazy カラムを使用して、パフォーマンスを最適化します。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* クエリ条件キャッシュを既定で有効にしました。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `col->insertFrom()` への呼び出しを非仮想化することで JOIN 結果の構築を高速化しました。 [#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger))。
* 可能であれば、フィルタークエリプランのステップにある等値条件を JOIN 条件にマージし、それらをハッシュテーブルのキーとして使用できるようにしました。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd)).
* JOIN の両側で JOIN キーが PK のプレフィックスになっている場合は、JOIN に対して動的シャーディングを使用します。この最適化は `query_plan_join_shard_by_pk_ranges` 設定で有効にできます（デフォルトでは無効）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 列の下限値および上限値に基づく `Iceberg` データのプルーニングをサポートしました。 [#77638](https://github.com/ClickHouse/ClickHouse/issues/77638) を修正。 [#78242](https://github.com/ClickHouse/ClickHouse/pull/78242)（[alesapin](https://github.com/alesapin)）。
* `Iceberg` に対して単純な count 最適化を実装しました。これにより、フィルタなしの `count()` を含むクエリがより高速になります。[#77639](https://github.com/ClickHouse/ClickHouse/issues/77639) をクローズします。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* `max_merge_delayed_streams_for_parallel_write` を使用して、マージ処理で並列にフラッシュできる列数を設定できるようにしました（これにより、S3 へのバーティカルマージ時のメモリ使用量を約 25 分の 1 に削減できます）。[#77922](https://github.com/ClickHouse/ClickHouse/pull/77922)（[Azat Khuzhin](https://github.com/azat)）。
* キャッシュがマージなどで受動的に使用される場合は、`filesystem_cache_prefer_bigger_buffer_size` を無効にします。これにより、マージ時のメモリ使用量が削減されます。 [#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 並列レプリカを有効にした読み取りでは、タスクサイズを決定する際にレプリカ数を使用するようにしました。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間での負荷分散がよりバランスよく行われます。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat)).
* `ORC` フォーマットに対して非同期 I/O のプリフェッチをサポートし、リモート I/O のレイテンシを隠すことで全体的なパフォーマンスを向上させます。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 非同期挿入で使用されるメモリを事前に確保してパフォーマンスを向上しました。 [#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn)).
* `multiRead` が利用可能な箇所では単一の `get` リクエストの使用をやめることで、レプリカ数の増加に伴い Keeper に大きな負荷を与える可能性があった Keeper へのリクエスト数を削減しました。 [#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique))。
* Nullable 引数に対して関数を実行する際の軽微な最適化。 [#76489](https://github.com/ClickHouse/ClickHouse/pull/76489) ([李扬](https://github.com/taiyang-li)).
* `arraySort` を最適化。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 同じパーツのマークをマージし、一度にクエリ条件キャッシュへ書き込むことで、ロックの使用量を削減します。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 1 つだけブラケット展開を含むクエリに対して `s3Cluster` のパフォーマンスを最適化しました。 [#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis))。
* 単一の Nullable 列または LowCardinality 列に対する ORDER BY を最適化。 [#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li))。
* `Native` フォーマットのメモリ使用量を最適化しました。 [#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat))。
* 軽微な最適化: 型キャストが必要な場合は `count(if(...))` を `countIf` に書き換えないようにしました。 [#78564](https://github.com/ClickHouse/ClickHouse/issues/78564) をクローズ。 [#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 関数で、`tokenbf_v1` および `ngrambf_v1` の全文テキスト用スキップインデックスを利用できるようになりました。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus))。
* ベクトル類似性インデックスが最大で 2 倍のメインメモリを過剰に割り当てる可能性がありました。この修正ではメモリ割り当て戦略を再設計し、メモリ消費を削減するとともに、ベクトル類似性インデックスキャッシュの有効性を向上させます。(issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056))。 [#78394](https://github.com/ClickHouse/ClickHouse/pull/78394) ([Shankar Iyer](https://github.com/shankar-iyer))。
* `schema_type` 設定を導入し、`system.metric_log` テーブルにスキーマ種別を指定できるようにします。利用可能なスキーマは 3 種類あります。`wide` — 現在のスキーマで、各メトリクス/イベントが個別のカラムに格納されます（個々のカラムの読み取りに最も効率的）、`transposed` — `system.asynchronous_metric_log` に類似しており、メトリクス/イベントが行として格納されます。さらに、`transposed_with_wide_view` では、`transposed` スキーマで基礎テーブルを作成しつつ、クエリを基礎テーブルへ変換する `wide` スキーマのビューも提供します。`transposed_with_wide_view` ではビューでのサブ秒解像度はサポートされず、`event_time_microseconds` は後方互換性のためのエイリアスに過ぎません。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin))。





#### 改善

* `Distributed` クエリのクエリプランをシリアライズできるようになりました。新しい設定項目 `serialize_query_plan` が追加されています。有効にすると、`Distributed` テーブルからのクエリはリモートクエリ実行に対してシリアライズされたクエリプランを使用します。これにより TCP プロトコルに新しいパケットタイプが導入されます。このパケットを処理できるようにするには、サーバー設定に `<process_query_plan_packet>true</process_query_plan_packet>` を追加する必要があります。[#69652](https://github.com/ClickHouse/ClickHouse/pull/69652)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* ビューからの `JSON` 型およびサブカラムの読み取りをサポートしました。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar)).
* `ALTER DATABASE ... ON CLUSTER` をサポートするようになりました。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* リフレッシュ可能なマテリアライズドビューのリフレッシュが `system.query_log` に表示されるようになりました。 [#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321)).
* ユーザー定義関数 (UDF) は、その構成の新しい設定によって決定的 (deterministic) とマークできるようになりました。また、クエリキャッシュは、クエリ内で呼び出される UDF が決定的かどうかを確認し、決定的であればクエリ結果をキャッシュします。(Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988))。[#77769](https://github.com/ClickHouse/ClickHouse/pull/77769) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* すべての種類のレプリケーション関連タスクに対してバックオフロジックを有効化しました。これにより、CPU 使用率、メモリ使用量、ログファイルサイズを削減できるようになります。`max_postpone_time_for_failed_mutations_ms` に類似した新しい設定 `max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms`、`max_postpone_time_for_failed_replicated_tasks_ms` を追加しました。 [#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* `system.errors` に `query_id` を追加しました。 [#75815](https://github.com/ClickHouse/ClickHouse/issues/75815) をクローズしました。 [#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* `UInt128` から `IPv6` への変換をサポートしました。これにより、`IPv6` に対して `bitAnd` などの算術演算を行い、その結果を `IPv6` に戻すことが可能になります。[#76752](https://github.com/ClickHouse/ClickHouse/issues/76752) をクローズします。これにより、`IPv6` に対する `bitAnd` 演算の結果も再度 `IPv6` に変換することができます。[#57707](https://github.com/ClickHouse/ClickHouse/pull/57707) も参照してください。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* デフォルトでは、`Variant` 型内のテキスト形式に含まれる特殊な `Bool` 値はパースされません。これを有効にするには、設定 `allow_special_bool_values_inside_variant` を有効化します。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* セッションレベルおよびサーバーレベルで、低い `priority` のクエリに対するタスク単位の待機時間を設定できるようにしました。 [#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* JSON データ型の値の比較をサポートしました。これにより、JSON オブジェクトを Map と同様に比較できるようになりました。 [#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.kafka_consumers` による権限サポートの改善。内部の `librdkafka` エラーを転送（なお、このライブラリはあまり出来が良くないことは付記しておきます）。 [#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* Buffer テーブルエンジンの設定に対するバリデーションを追加しました。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `HDFS` での `pread` を有効／無効にできる設定項目 `enable_hdfs_pread` を追加しました。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou))。
* ZooKeeper の `multi` 読み取りおよび書き込みリクエスト数向けのプロファイルイベントを追加。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* `disable_insertion_and_mutation` が有効な場合でも、一時テーブルの作成および挿入を許可します。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210))。
* `max_insert_delayed_streams_for_parallel_write` を 100 に引き下げます。 [#77919](https://github.com/ClickHouse/ClickHouse/pull/77919) ([Azat Khuzhin](https://github.com/azat)).
* Joda の構文（念のため補足すると、これは Java の世界のものです）で、`yyy` のような年の解析を修正しました。[#77973](https://github.com/ClickHouse/ClickHouse/pull/77973)（[李扬](https://github.com/taiyang-li)）。
* `MergeTree` テーブルのパーツのアタッチは、そのブロック順で実行されます。これは、`ReplacingMergeTree` のような特殊なマージアルゴリズムにとって重要です。これにより [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009) が解決されました。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリマスキングルールで、マッチが発生した場合に `LOGICAL_ERROR` をスローできるようになりました。これにより、あらかじめ定義したパスワードがログ内のどこかに漏洩していないかを確認するのに役立ちます。 [#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* MySQL との互換性を向上させるために、`information_schema.tables` に `index_length_column` 列を追加しました。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 2 つの新しいメトリック `TotalMergeFailures` と `NonAbortedMergeFailures` を導入します。これらのメトリックは、短時間に多数のマージ失敗が発生するケースを検出するために必要です。[#78150](https://github.com/ClickHouse/ClickHouse/pull/78150)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* パススタイルでキーが指定されていない場合に S3 URL を誤って解析してしまう問題を修正しました。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos))。
* `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime`、`BlockReadTime` の非同期メトリクスで値が誤って報告されていた問題を修正しました（この変更以前は、1 秒が誤って 0.001 として報告されていました）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov))。
* StorageS3(Azure)Queue からマテリアライズドビューへプッシュする際に発生するエラーについて、`loading_retries` の上限を守るようにしました。以前は、そのようなエラーは無制限にリトライされていました。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLake の `delta-kernel-rs` 実装において、パフォーマンスと進捗バーを改善しました。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ランタイムディスクで `include`、`from_env`、`from_zk` をサポートしました。 [#78177](https://github.com/ClickHouse/ClickHouse/issues/78177) をクローズしました。 [#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `system.warnings` テーブルに、長時間実行しているミューテーション向けの動的な警告を追加しました。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* システムテーブル `system.query_condition_cache` にカラム `condition` を追加しました。クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件を保存します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* Hive パーティショニングで空値を許可。 [#78816](https://github.com/ClickHouse/ClickHouse/pull/78816) ([Arthur Passos](https://github.com/arthurpassos)).
* `BFloat16` の `IN` 句における型変換を修正しました（つまり、`SELECT toBFloat16(1) IN [1, 2, 3];` は現在 `1` を返します）。[#78754](https://github.com/ClickHouse/ClickHouse/issues/78754) をクローズ。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `disk = ...` が設定されている場合は、他のディスク上の `MergeTree` パーツをチェックしないようにしました。 [#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* `system.query_log` の `used_data_type_families` におけるデータ型が、正規名で記録されるようにしました。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` でのクリーンアップ設定を、[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様にしました。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* INFILE のスキーマ推論に挿入先カラムを使用するようにしました。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* `count(Nullable)` が集約プロジェクションで使用されている場合に誤ったプロジェクション解析が行われる問題を修正しました。これにより [#74495](https://github.com/ClickHouse/ClickHouse/issues/74495) が解決されます。またこの PR では、プロジェクションがなぜ使用されるのか、あるいはなぜ使用されないのかを明確にするために、プロジェクション解析に関するログも追加しました。 [#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* `DETACH PART` 実行中に発生する `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` というエラーを修正。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* リテラルを含む式を持つ skip インデックスが analyzer で正しく動作しない問題を修正し、インデックス解析時に冗長なキャストを削除しました。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* `close_session` クエリパラメータが有効にならず、名前付きセッションが `session_timeout` 経過後にしか閉じられない不具合を修正。 [#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats)).
* マテリアライズドビューがアタッチされていない状態でも NATS サーバーからメッセージを受信できるように修正。 [#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 空の `FileLog` から `merge` テーブル関数経由で読み込む際の論理エラーを修正し、[#75575](https://github.com/ClickHouse/ClickHouse/issues/75575) をクローズしました。 [#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 共有バリアントの `Dynamic` シリアライゼーションでデフォルトのフォーマット設定を使用するよう変更しました。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar)).
* ローカルディスク上のテーブルデータパスの存在確認を修正。[#77608](https://github.com/ClickHouse/ClickHouse/pull/77608) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 一部の型で定数値をリモートに送信する処理を修正。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* S3/AzureQueue における期限切れコンテキストが原因のクラッシュを修正しました。 [#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* RabbitMQ、Nats、Redis、AzureQueue テーブルエンジンで資格情報を秘匿するようにしました。 [#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `argMin`/`argMax` における `NaN` 比較の未定義の動作を修正しました。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* マージおよびミューテーションが、書き込むブロックを生成しない場合であっても、キャンセルされたかどうかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Replicated データベースにおいて、新しく追加されたレプリカ上でリフレッシュ可能なマテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* `NOT_FOUND_COLUMN_IN_BLOCK` エラー発生時にクラッシュする可能性があった問題を修正。[#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir)).
* S3/AzureQueue でデータ取り込み中に発生するクラッシュを修正。 [#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* SSH サーバーでの履歴ファジー検索を無効化しました（skim ライブラリが必要なため）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat)).
* インデックスが定義されていないカラムに対するベクトル検索クエリが、テーブル内にベクトル類似性インデックスが定義された別のベクトルカラムが存在する場合に誤った結果を返していた不具合を修正しました。（Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978)）。 [#78069](https://github.com/ClickHouse/ClickHouse/pull/78069)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* &quot;The requested output format {} is binary... Do you want to output it anyway? [y/N]&quot; プロンプトにあったごく小さな誤りを修正。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* `toStartOfInterval` の origin 引数が 0 のときに発生するバグを修正しました。 [#78096](https://github.com/ClickHouse/ClickHouse/pull/78096)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* HTTP インターフェースで空の `session_id` クエリパラメータを指定できないようにしました。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* `ALTER` クエリの直後に実行された `RENAME` クエリが原因で `Replicated` データベースのメタデータが上書きされてしまう可能性があった問題を修正。 [#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique))。
* `NATS` エンジンで発生していたクラッシュを修正。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* 組み込みクライアントでの SSH 用 history&#95;file の作成を試みないようにしました（以前のバージョンでは作成は常に失敗していましたが、試行は行われていました）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* `RENAME DATABASE` または `DROP TABLE` クエリの実行後に `system.detached_tables` が誤った情報を表示する問題を修正。[#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique))。
* `Replicated` データベースでテーブル数が多すぎる場合のチェックについて、[#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) で導入された不具合を修正しました。また、`ReplicatedMergeTree` や `KeeperMap` の場合に Keeper に管理対象外のノードが作成されてしまうのを避けるため、ストレージを作成する前にチェックを実行するようにしました。[#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 同時実行される `S3Queue` メタデータ初期化に起因する可能性のあるクラッシュを修正しました。 [#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 関数は、これまで実行を試みていたのとは異なり、`max_size` 引数が Int 型で値 0 の場合にも、すでに UInt 型で行っているのと同様に `BAD_ARGUMENTS` エラーを発生させるようになりました。[#78140](https://github.com/ClickHouse/ClickHouse/pull/78140)（[Eduard Karacharov](https://github.com/korowa)）。
* ローカルテーブルがデタッチされる前に削除されていた場合でも、失われたレプリカのリカバリ時にクラッシュしないようにしました。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* `system.s3_queue_settings` の &quot;alterable&quot; 列が常に `false` を返してしまう問題を修正。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure のアクセス署名をマスクし、ユーザーやログに表示されないようにしました。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Wide parts におけるプレフィックス付きサブストリームのプリフェッチ処理を修正しました。 [#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* キー配列が `LowCardinality(Nullable)` 型の場合に発生していた `mapFromArrays` のクラッシュや誤った結果の問題を修正。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* delta-kernel-rs の認証オプションを修正しました。 [#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii)).
* レプリカの `disable_insertion_and_mutation` が true の場合は、Refreshable マテリアライズドビューのタスクをスケジュールしないようにしました。タスクは挿入処理を行うものであり、`disable_insertion_and_mutation` が true の場合は失敗します。 [#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* `Merge` エンジンで基盤となるテーブルへのアクセスを検証できるようにしました。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* `Distributed` テーブルに対するクエリでは `FINAL` 修飾子が無視されます。 [#78428](https://github.com/ClickHouse/ClickHouse/pull/78428) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `bitmapMin` は、ビットマップが空の場合に uint32&#95;max（入力型がそれより大きい場合は uint64&#95;max）を返します。これは、空の roaring&#95;bitmap における最小値の動作と一致します。[#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* `distributed_aggregation_memory_efficient` が有効な場合、FROM 句の読み取り直後におけるクエリ処理の並列化を無効化しました。これは論理エラーを引き起こす可能性があったためです。 [#76934](https://github.com/ClickHouse/ClickHouse/issues/76934) をクローズ。 [#78500](https://github.com/ClickHouse/ClickHouse/pull/78500)（[flynn](https://github.com/ucasfl)）。
* `max_streams_to_max_threads_ratio` 設定を適用した結果、計画されているストリーム数が 0 件になる場合に備えて、読み取り用のストリームを少なくとも 1 つは確保するようにしました。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `S3Queue` において、論理エラー「Cannot unregister: table uuid is not registered」を修正しました。[#78285](https://github.com/ClickHouse/ClickHouse/issues/78285) をクローズしました。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ClickHouse は、cgroup v1 と v2 の両方が有効になっているシステムで、自身が属する cgroup v2 を判別できるようになりました。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* `-Cluster` テーブル関数はテーブルレベルの設定と併用すると失敗していました。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik)).
* INSERT 時に ReplicatedMergeTree がトランザクションをサポートしていない場合のチェックを強化。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat)).
* ATTACH 中のクエリ設定をクリーンアップするようにしました。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* `iceberg_metadata_file_path` に無効なパスが指定されていた場合にクラッシュする問題を修正しました。 [#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* `DeltaLake` テーブルエンジンの delta-kernel-s 実装において、読み取りスキーマがテーブルスキーマと異なり、かつパーティション列が存在する場合に「not found column」エラーが発生していた問題を修正しました。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 名前付きセッションをクローズするようスケジュールした後（ただしタイムアウトが発生する前）に、同じ名前の新しい名前付きセッションを作成すると、その新しいセッションが最初のセッションのクローズ予定時刻にクローズされてしまう問題を修正しました。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* `MongoDB` エンジンまたは `mongodb` テーブル関数を使用するテーブルから読み取る複数種類の `SELECT` クエリを修正しました：`WHERE` 句内で定数値の暗黙的な型変換が行われるクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` と `GROUP BY` を含むクエリです。以前は、これらのクエリが誤った結果を返す可能性がありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* `CHECK TABLE` の実行中にテーブルの停止処理をブロックしないようにしました。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper の修正: すべてのケースにおいて ephemeral カウントを修正。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* テーブル関数 `view` 以外を使用する際の `StorageDistributed` における誤ったキャストを修正。[#78464](https://github.com/ClickHouse/ClickHouse/issues/78464) をクローズ。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `tupleElement(*, 1)` の書式設定の一貫性を修正しました。[#78639](https://github.com/ClickHouse/ClickHouse/issues/78639) をクローズ。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `ssd_cache` 型の辞書は、ゼロまたは負の値の `block_size` および `write_buffer_size` パラメータを拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。 [#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 異常終了後に `ALTER` を実行すると Refreshable マテリアライズドビューがクラッシュする問題を修正しました。 [#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* `CSV` フォーマットにおける不正な `DateTime` 値の解析処理を修正。[#78919](https://github.com/ClickHouse/ClickHouse/pull/78919)（[Pavel Kruglov](https://github.com/Avogar)）。
* Keeper の修正: 失敗したマルチリクエストでウォッチが発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `min-max` 値が明示的に指定されているものの `NULL` である場合に、Iceberg テーブルの読み取りが失敗する問題を修正しました。Go の Iceberg ライブラリが、そのような問題のあるファイルを生成することが確認されました。[#78740](https://github.com/ClickHouse/ClickHouse/issues/78740) をクローズしました。 [#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。



#### ビルド／テスト／パッケージングの改善
* Rust において CPU ターゲットの機能を考慮し、すべてのクレートで LTO を有効化。[#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano))。


### ClickHouse リリース 25.3 LTS, 2025-03-20 {#253}

#### 後方互換性のない変更
* レプリケーテッドデータベースでの `TRUNCATE` を禁止。[#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc)).
* インデックスキャッシュをスキップする変更を元に戻した。[#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).



#### 新機能

* `JSON` データ型は本番利用に対応しています。詳しくは [https://jsonbench.com/](https://jsonbench.com/) を参照してください。`Dynamic` と `Variant` データ型も本番利用に対応しています。[#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* clickhouse-server で SSH プロトコルをサポートしました。これにより、任意の SSH クライアントを使用して ClickHouse に接続できるようになりました。これにより次の issue がクローズされます: [#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* parallel replicas が有効な場合、テーブル関数を対応する -Cluster 版に置き換えるようにしました。 [#65024](https://github.com/ClickHouse/ClickHouse/issues/65024) を修正しました。 [#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache の新しい実装。これにより、OS のページキャッシュに依存せず、インプロセスのメモリ内にデータをキャッシュできるようになります。これは、データがローカルファイルシステムキャッシュを伴わないリモート仮想ファイルシステム上に保存されている場合に有用です。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 並行実行されるクエリ間で CPU スロットの分配方法を制御するサーバー設定 `concurrent_threads_scheduler` を追加しました。`round_robin`（従来の動作）または `fair_round_robin` を設定でき、INSERT と SELECT 間の不公平な CPU 資源配分の問題に対処します。[#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* `estimateCompressionRatio` 集約関数を追加しました [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。 [#76661](https://github.com/ClickHouse/ClickHouse/pull/76661)（[Tariq Almawash](https://github.com/talmawash)）。
* 関数 `arraySymmetricDifference` を追加しました。これは、複数の配列引数のうち、すべての引数に共通して含まれない要素をすべて返します。例: `SELECT arraySymmetricDifference([1, 2], [2, 3])` は `[1, 3]` を返します。（issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673)）。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* ストレージ/テーブル関数の設定 `iceberg_metadata_file_path` を使用して、Iceberg が読み込むメタデータファイルを明示的に指定できるようにしました。[#47412](https://github.com/ClickHouse/ClickHouse/issues/47412) を修正しました。[#77318](https://github.com/ClickHouse/ClickHouse/pull/77318)（[alesapin](https://github.com/alesapin)）。
* ブロックチェーン実装、とくに EVM ベースのシステムで一般的に使用されている `keccak256` ハッシュ関数を追加しました。 [#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche))。
* 3つの新しい関数を追加しました。仕様に従った `icebergTruncate`（[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details) を参照）、`toYearNumSinceEpoch` および `toMonthNumSinceEpoch` です。`Iceberg` エンジンでのパーティションプルーニングにおいて `truncate` トランスフォームをサポートしました。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403)（[alesapin](https://github.com/alesapin)）。
* `LowCardinality(Decimal)` データ型をサポートしました [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。 [#72833](https://github.com/ClickHouse/ClickHouse/pull/72833)（[zhanglistar](https://github.com/zhanglistar)）。
* `FilterTransformPassedRows` と `FilterTransformPassedBytes` のプロファイルイベントでは、クエリ実行中にフィルタリングされた行数およびバイト数が表示されます。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar))。
* ヒストグラム型メトリクスのサポート。インターフェースは Prometheus クライアントとほぼ同じで、値に対応するバケットのカウンターを増やすには、単に `observe(value)` を呼び出すだけです。ヒストグラムメトリクスは `system.histogram_metrics` を通じて公開されます。[#75736](https://github.com/ClickHouse/ClickHouse/pull/75736)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 明示的な値で切り替える非定数 CASE をサポート。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).



#### 実験的機能
* AWS S3 およびローカルファイルシステム上の Delta Lake テーブルに対する [Unity Catalog のサポートを追加](https://www.databricks.com/product/unity-catalog) しました。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988) ([alesapin](https://github.com/alesapin))。
* Iceberg テーブル向けに、AWS Glue サービスカタログとの実験的な統合を導入しました。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257) ([alesapin](https://github.com/alesapin))。
* 動的なクラスタの自動検出をサポートしました。これは既存の _node_ の自動検出機能を拡張するものです。ClickHouse は、`<multicluster_root_path>` を使用して共通の ZooKeeper パス配下に新しい _clusters_ を自動的に検出および登録できるようになりました。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001) ([Anton Ivashkin](https://github.com/ianton-ru))。
* 新しい設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` により、設定可能なタイムアウト後にパーティション全体の自動クリーンアップマージが可能になりました。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440) ([Christoph Wurm](https://github.com/cwurm))。



#### パフォーマンスの改善
* 繰り返し利用される条件に対してクエリ条件キャッシュを実装し、クエリパフォーマンスを改善しました。条件を満たさないデータ部分の範囲をメモリ上の一時インデックスとして保持し、後続のクエリではこのインデックスを利用します。[#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236) をクローズしました（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツ削除時にキャッシュからデータを積極的に削除するようにしました。データ量がそれより少ない場合に、キャッシュが最大サイズまで肥大化しないようにします。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 算術計算において Int256 と UInt256 を clang 組み込みの i256 に置き換え、パフォーマンスを向上させました [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。[#73658](https://github.com/ClickHouse/ClickHouse/pull/73658)（[李扬](https://github.com/taiyang-li)）。
* 一部のケース（例: 空の配列カラム）では、データパーツに空ファイルが含まれることがあります。メタデータとオブジェクトストレージが分離されたディスク上にテーブルがある場合、そのようなファイルについては空の BLOB の書き込みをスキップし、メタデータのみを保存できるようにしました。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860)（[Alexander Gololobov](https://github.com/davenger)）。
* Decimal32/Decimal64/DateTime64 に対する min/max のパフォーマンスを改善しました。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570)（[李扬](https://github.com/taiyang-li)）。
* クエリコンパイル（`compile_expressions` 設定）がマシンタイプを考慮するようになりました。これにより該当クエリが大幅に高速化されます。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753)（[ZhangLiStar](https://github.com/zhanglistar)）。
* `arraySort` を最適化しました。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850)（[李扬](https://github.com/taiyang-li)）。
* マージなど、キャッシュが受動的に利用される場合には `filesystem_cache_prefer_bigger_buffer_size` を無効にしました。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 一部のコード箇所で `preserve_most` 属性を適用し、わずかに良いコード生成を可能にしました。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778)（[Nikita Taranov](https://github.com/nickitat)）。
* ClickHouse サーバーのシャットダウンを高速化しました（2.5 秒の遅延を解消）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550)（[Azat Khuzhin](https://github.com/azat)）。
* ReadBufferFromS3 およびその他のリモート読み取りバッファで不要なメモリアロケーションを回避し、メモリ消費を半減させました。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692)（[Sema Checherinda](https://github.com/CheSema)）。
* zstd を 1.5.5 から 1.5.7 に更新しました。これにより、いくつかの[パフォーマンス改善](https://github.com/facebook/zstd/releases/tag/v1.5.7)が見込まれます。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* Wide パーツの JSON カラムのプリフェッチ中のメモリ使用量を削減しました。これは、ClickHouse Cloud のような共有ストレージ上で ClickHouse を利用する場合に特に有効です。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640)（[Pavel Kruglov](https://github.com/Avogar)）。



#### 改善

* `TRUNCATE` と `INTO OUTFILE` の併用時にアトミックなリネームをサポートします。[#70323](https://github.com/ClickHouse/ClickHouse/issues/70323) を解決します。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 設定値としての浮動小数点数に `NaN` や `inf` を使用することは、もはやできません。もっとも、そもそも以前からそれには何の意味もありませんでしたが。 [#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `compatibility` 設定に関係なく、analyzer が無効化されている場合はデフォルトで parallel replicas を無効化するようにしました。この挙動は、`parallel_replicas_only_with_analyzer` を `false` に明示的に設定することで引き続き変更可能です。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter))。
* クライアントリクエストのヘッダーから外部 HTTP 認証サービスへ転送するヘッダーのリストを指定できるようになりました。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* タプルカラム内のフィールドに対して、大文字小文字を区別しないカラム名のマッチングが正しく適用されるようにしました。 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324) をクローズしました。 [#73780](https://github.com/ClickHouse/ClickHouse/pull/73780) ([李扬](https://github.com/taiyang-li)).
* Gorilla コーデックのパラメータは、今後常に .sql ファイル内のテーブルメタデータとして保存されるようになりました。これにより次の issue が解決されました: [#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 一部のデータレイク向けにパース機能を強化しました（シーケンス ID のパース：マニフェストファイル内のシーケンス識別子をパースする機能を追加、Avro メタデータのパース：将来の拡張が容易になるよう Avro メタデータパーサーを再設計）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik)).
* `system.opentelemetry_span_log` のデフォルト ORDER BY 句から trace&#95;id を削除。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 暗号化（`encrypted_by` 属性）は、任意の設定ファイル（config.xml、users.xml、ネストされた設定ファイル）に適用できるようになりました。以前は、トップレベルの config.xml ファイルにしか適用できませんでした。 [#75911](https://github.com/ClickHouse/ClickHouse/pull/75911) ([Mikhail Gorshkov](https://github.com/mgorshkov))。
* `system.warnings` テーブルを改善し、動的に追加・更新・削除できる警告メッセージを導入しました。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc)).
* このPRにより、すべての `DROP` 操作を先に記述する必要があるため、クエリ `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES` は実行できなくなりました。 [#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit))。
* SYNC REPLICA 向けの各種強化（エラーメッセージの改善、テストの強化、サニティチェックの追加）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* バックアップ時に `Access Denied` が発生して S3 へのマルチパートコピーが失敗した場合に、正しいフォールバック処理が行われるようにしました。バケット間でバックアップを行う際、異なる認証情報を使用していると、マルチパートコピーで `Access Denied` エラーが発生することがあります。 [#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368)).
* librdkafka（出来の悪い代物）をバージョン 2.8.0（とはいえ代物であることに変わりはない）にアップグレードし、Kafka テーブルのシャットダウンシーケンスを改善して、テーブル削除やサーバー再起動時の遅延を削減しました。`engine=Kafka` は、テーブルが削除されてももはや明示的にコンシューマグループを離脱しなくなりました。代わりに、コンシューマは非アクティブ状態が `session_timeout_ms`（デフォルト: 45 秒）を超えるまでグループに残り、その後自動的に削除されます。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* S3 リクエスト設定の検証処理を修正。 [#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar))。
* `server_settings` や `settings` のようなシステムテーブルには、便利な `default` 値カラムがあります。同様のカラムを `merge_tree_settings` および `replicated_merge_tree_settings` に追加しました。 [#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie)).
* `CurrentMetrics::QueryPreempted` と同様のロジックを持つ `ProfileEvents::QueryPreempted` を追加しました。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu)).
* 以前は、Replicated データベースでクエリ内に指定された認証情報がログに出力されてしまうことがありました。この問題を修正しました。これにより、次の課題がクローズされました: [#77123](https://github.com/ClickHouse/ClickHouse/issues/77123)。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `plain_rewritable` ディスクに対して ALTER TABLE DROP PARTITION を許可しました。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* バックアップ/リストア設定 `allow_s3_native_copy` は、現在次の3つの値をサポートします: - `False` - S3 ネイティブコピーは使用されません。 - `True`（旧デフォルト）- ClickHouse はまず S3 ネイティブコピーを試し、失敗した場合は読み取り＋書き込み方式にフォールバックします。 - `'auto'`（新デフォルト）- ClickHouse はまずソースと宛先のクレデンシャルを比較します。同一であれば、ClickHouse は S3 ネイティブコピーを試し、その後必要に応じて読み取り＋書き込み方式にフォールバックすることがあります。異なる場合、ClickHouse は最初から読み取り＋書き込み方式を使用します。 [#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar))。
* DeltaLake テーブルエンジン向けの Delta Kernel で、AWS セッショントークンおよび環境変数による認証情報の利用をサポートしました。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* 非同期分散 INSERT の保留バッチ処理中に（例：`No such file or directory` に起因して）処理が行き詰まる問題を修正。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* インデックス解析時の日時変換を、暗黙的な `Date` から `DateTime` への変換に対して飽和動作を強制することで改善しました。これにより、日時の範囲制限に起因して発生し得たインデックス解析結果の不正確さが解消されます。この変更により [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307) が修正されています。また、デフォルト値である `date_time_overflow_behavior = 'ignore'` が設定されている場合の明示的な `toDateTime` 変換も修正しました。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* UUID とテーブル名の間のレースコンディションに起因するあらゆる種類のバグを修正しました（たとえば、`RENAME` と `RESTART REPLICA` の間のレースコンディションが修正されます。`SYSTEM RESTART REPLICA` と同時に `RENAME` が実行された場合、誤ったレプリカを再起動してしまったり、テーブルの一つが `Table X is being restarted` 状態のまま残ってしまうことがあります）。[#76308](https://github.com/ClickHouse/ClickHouse/pull/76308)（[Azat Khuzhin](https://github.com/azat)）。
* async insert を有効にし、かつファイルからの `insert into ... from file ...` でブロックサイズが不揃いな場合に発生していたデータ損失を修正しました。最初のブロックサイズが async&#95;max&#95;size より小さく、2 番目のブロックサイズが async&#95;max&#95;size より大きい場合、2 番目のブロックが挿入されず、これらのデータが `squashing` に残ったままになっていました。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* `system.data_skipping_indices` 内のフィールド &#39;marks&#39; を &#39;marks&#95;bytes&#39; に名前変更しました。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* 削除処理中に予期しないエラーが発生した場合にも正しく処理できるよう、動的ファイルシステムキャッシュのリサイズ処理を修正。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列ハッシュにおける `used_flag` の初期化を修正しました。サーバークラッシュを引き起こす可能性がありました。[#76580](https://github.com/ClickHouse/ClickHouse/pull/76580)（[Nikita Taranov](https://github.com/nickitat)）。
* プロジェクション内で `defaultProfiles` 関数を呼び出した際に発生する論理エラーを修正しました。 [#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit)).
* Web UI においてブラウザのインタラクティブな Basic 認証ダイアログを表示しないようにしました。[#76319](https://github.com/ClickHouse/ClickHouse/issues/76319) をクローズします。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 分散テーブルに対して boolean リテラルを SELECT した際に発生する THERE&#95;IS&#95;NO&#95;COLUMN 例外を修正。 [#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* テーブルディレクトリ内のサブパスの選択方法が、より高度なものになりました。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik))。
* サブカラムを含む主キー (PK) を持つテーブルを `ALTER` した後に発生していた `Not found column in block` エラーを修正しました。[https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) の後、この修正には [https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403) が必要です。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* null shortcircuit のパフォーマンステストを追加し、バグを修正しました。[#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li))。
* 最終化する前に出力書き込みバッファをフラッシュするようにしました。一部の出力フォーマット（例：`JSONEachRowWithProgressRowOutputFormat`）を最終化する際に発生していた `LOGICAL_ERROR` を修正しました。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368))。
* MongoDB のバイナリ UUID のサポートを追加 ([#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)) - テーブル関数を使用する際の MongoDB への WHERE 句プッシュダウンを修正 ([#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)) - MongoDB のバイナリ UUID が ClickHouse の UUID にのみパースされるように、MongoDB - ClickHouse 間の型マッピングを変更しました。これにより、将来のあいまいさや予期しない挙動を回避できます。- 後方互換性を維持したまま OID マッピングを修正しました。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762) ([Kirill Nikiforov](https://github.com/allmazz))。
* JSON サブカラムの parallel prefix デシリアライズにおける例外処理を修正。 [#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar)).
* 負の整数に対する lgamma 関数の動作を修正。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev))。
* 明示的に定義された主キーに対する reverse key 解析を修正。 [#76654](https://github.com/ClickHouse/ClickHouse/issues/76654) と同様。 [#76846](https://github.com/ClickHouse/ClickHouse/pull/76846)（[Amos Bird](https://github.com/amosbird)）。
* JSON フォーマットでの Bool 値の整形表示を修正。[#76905](https://github.com/ClickHouse/ClickHouse/pull/76905)（[Pavel Kruglov](https://github.com/Avogar)）。
* 非同期挿入中にエラーが発生した際の誤った JSON カラムのロールバック処理によりクラッシュが起こり得る問題を修正。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前は、`multiIf` がプランニング段階とメイン実行時で異なる型のカラムを返す場合がありました。これにより、C++ の観点では未定義動作を引き起こすコードが生成されていました。[#76914](https://github.com/ClickHouse/ClickHouse/pull/76914)（[Nikita Taranov](https://github.com/nickitat)）。
* MergeTree における Nullable な定数キーの誤ったシリアル化を修正しました。これにより [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939) が解決されます。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* `BFloat16` 値のソート処理を修正しました。これにより [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487) および [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669) がクローズされました。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パーツ整合性チェックで一時的なサブカラムをスキップするチェックを追加することで、Variant サブカラムを含む JSON のバグを修正しました。 [#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。 [#77034](https://github.com/ClickHouse/ClickHouse/pull/77034) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 型の不一致が発生した場合に Values フォーマットのテンプレート解析がクラッシュする不具合を修正しました。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar)).
* 主キーにサブカラムを含む EmbeddedRocksDB テーブルを作成できないようにしました。以前はそのようなテーブルを作成できましたが、SELECT クエリが失敗していました。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar))。
* 述語をリモートにプッシュダウンする際にリテラル型が考慮されないため、分散クエリで不正な比較が発生する問題を修正します。 [#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94)).
* Kafka テーブル作成時に発生する例外によるクラッシュを修正。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar)).
* Kafka および RabbitMQ エンジンで JSON とサブカラムをサポートしました。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* MacOS における例外スタックのアンワインド処理を修正。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* getSubcolumn 関数における `null` サブカラムの読み取りを修正。 [#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar))。
* Array 列および未対応関数での Bloom filter インデックスを修正。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル数に対する制限のチェックは、最初の CREATE クエリ実行時にのみ行うべきです。 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique)).
* バグではありません: `SELECT toBFloat16(-0.0) == toBFloat16(0.0)` は、以前は `false` を返していましたが、現在は正しく `true` を返します。これにより、`Float32` および `Float64` の動作と一貫したものになりました。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* デバッグビルドでクラッシュを引き起こす可能性のある、未初期化の key&#95;index 変数への誤った参照を修正します（この未初期化参照自体は、後続のコードがおそらく例外をスローするため、リリースビルドでは問題になりません）。 ### ユーザー向け変更に関するドキュメント項目。 [#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear)).
* Bool 値を持つパーティション名の不具合を修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) によって発生していました。 [#77319](https://github.com/ClickHouse/ClickHouse/pull/77319)（[Pavel Kruglov](https://github.com/Avogar)）。
* Nullable 要素を含むタプルと文字列との比較を修正しました。たとえば、この変更以前は、タプル `(1, null)` と文字列 `'(1,null)'` の比較はエラーになっていました。別の例としては、タプル `(1, a)`（ここで `a` は Nullable カラム）と文字列 `'(1, 2)'` の比較があります。この変更により、これらの問題が修正されています。 [#77323](https://github.com/ClickHouse/ClickHouse/pull/77323) ([Alexey Katsman](https://github.com/alexkats)).
* ObjectStorageQueueSource のクラッシュを修正。[https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) で導入された不具合によるもの。 [#77325](https://github.com/ClickHouse/ClickHouse/pull/77325)（[Pavel Kruglov](https://github.com/Avogar)）。
* `input` 使用時の `async_insert` の問題を修正。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修正: ソート列がプランナによって削除された場合に、`WITH FILL` が NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK で失敗する可能性がある問題を修正しました。INTERPOLATE 式に対して計算される DAG の不整合に関連する同様の問題も修正しました。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 無効な AST ノードに対するエイリアス設定に関する複数の LOGICAL&#95;ERROR を修正しました。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルシステムキャッシュの実装において、ファイルセグメント書き込み中のエラー処理を修正しました。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DatabaseIceberg がカタログによって提供される適切なメタデータファイルを使用するように修正しました。[#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) をクローズ。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* クエリキャッシュは、UDF を非決定的なものとみなすようになりました。これに伴い、UDF を含むクエリの結果はもはやキャッシュされません。以前は、結果が誤ってキャッシュされてしまう非決定的な UDF をユーザーが定義できていました（issue [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* system.filesystem&#95;cache&#95;log が `enable_filesystem_cache_log` 設定が有効な場合にのみ動作していた問題を修正しました。[#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* プロジェクション内で `defaultRoles` 関数を呼び出した際に発生する論理エラーを修正。[#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) のフォローアップ。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 関数 `arrayResize` の第 2 引数として `Nullable` 型を使用することは、現在は許可されていません。以前は、第 2 引数が `Nullable` の場合、エラーの発生から誤った結果の返却まで、さまざまな問題が起こり得ました（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 書き込み対象のブロックが生成されない場合でも、マージおよびミューテーションがキャンセルされたかどうかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).



#### ビルド／テスト／パッケージングの改善
* `clickhouse-odbc-bridge` と `clickhouse-library-bridge` を別のリポジトリ https://github.com/ClickHouse/odbc-bridge/ に移動しました。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Rust のクロスコンパイルを修正し、Rust を完全に無効化できるようにしました。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano)).


### ClickHouse リリース 25.2, 2025-02-27 {#252}

#### 後方互換性のない変更
* `async_load_databases` をデフォルトで完全に有効化しました（`config.xml` をアップグレードしていないインストールでも有効になります）。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772) ([Azat Khuzhin](https://github.com/azat)).
* `JSONCompactEachRowWithProgress` と `JSONCompactStringsEachRowWithProgress` 形式を追加しました。[#69989](https://github.com/ClickHouse/ClickHouse/issues/69989) の継続です。`JSONCompactWithNames` と `JSONCompactWithNamesAndTypes` は、もはや「totals」を出力しません――実装上の誤りであったと思われます。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ALTER コマンドのリストの曖昧さを解消するため、`format_alter_operations_with_parentheses` のデフォルト値を true に変更しました（https://github.com/ClickHouse/ClickHouse/pull/59532 を参照）。これにより、24.3 より前のクラスタとのレプリケーションが壊れます。古いリリースを使用しているクラスタをアップグレードする場合は、サーバー設定でこの設定をオフにするか、先に 24.3 へアップグレードしてください。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302) ([Raúl Marín](https://github.com/Algunenano)).
* 正規表現を使用したログメッセージのフィルタリング機能を削除しました。この実装にデータレースが存在したため、削除する必要がありました。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `min_chunk_bytes_for_parallel_parsing` 設定はもはや 0 に設定できません。この変更により次の問題が修正されます: [#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* キャッシュ構成内の設定項目を検証するようにしました。存在しない設定は以前は無視されていましたが、今後はエラーとなるため削除する必要があります。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452) ([Kseniia Sumarokova](https://github.com/kssenii)).



#### 新機能
* 型 `Nullable(JSON)` をサポートしました。 [#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar)).
* DEFAULT および MATERIALIZED 式でサブカラムをサポートしました。 [#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar)).
* `output_format_parquet_write_bloom_filter` 設定（デフォルトで有効）による Parquet ブルームフィルタの書き込みをサポートしました。 [#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321)).
* Web UI にインタラクティブなデータベースナビゲーションが追加されました。 [#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ストレージポリシーで、読み取り専用ディスクと読み書き可能ディスクの組み合わせ（複数ボリュームまたは複数ディスク）を許可しました。これにより、ボリューム全体からデータを読み取ることができる一方で、挿入は書き込み可能ディスクを優先するようになります（Copy-on-Write ストレージポリシー）。 [#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat)).
* 新しい Database エンジン `DatabaseBackup` を追加しました。これにより、バックアップからテーブル／データベースを即座にアタッチできます。 [#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal)).
* Postgres ワイヤプロトコルでのプリペアドステートメントをサポートしました。 [#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12)).
* データベースレイヤーなしで ATTACH テーブルを実行できるようにしました。これは、Web や S3 などの外部仮想ファイルシステム上に配置された MergeTree テーブルに対して有用です。 [#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat)).
* 2 つの文字列の一部を比較する新しい文字列比較関数 `compareSubstrings` を追加しました。例: `SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` は、「最初の文字列のオフセット 0、2 番目の文字列のオフセット 5 から、それぞれ 6 バイト分の文字列 'Saxon' と 'Anglo-Saxon' を辞書順で比較する」という意味です。 [#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい関数 `initialQueryStartTime` を追加しました。現在のクエリの開始時刻を返します。分散クエリの場合、この値はすべてのシャードで同一です。 [#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik)).
* MySQL の named collection を使用した SSL 認証をサポートしました。[#59111](https://github.com/ClickHouse/ClickHouse/issues/59111) をクローズします。 [#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique)).

#### 実験的機能
* 新しい設定 `enable_adaptive_memory_spill_scheduler` を追加しました。同一クエリ内の複数の Grace JOIN が、合計メモリフットプリントを監視し、MEMORY_LIMIT_EXCEEDED を防ぐために外部ストレージへのスピルを自動的に発生させられるようにします。 [#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい実験的な `Kafka` テーブルエンジンが Keeper のフィーチャーフラグに完全に従うようにしました。 [#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ライセンス上の問題により v24.10 で削除されていた (Intel) QPL コーデックを復元しました。 [#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* HDFS との連携において、`dfs.client.use.datanode.hostname` 設定オプションをサポートしました。 [#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).



#### パフォーマンスの改善
* Wide パーツにおける S3 からの JSON カラム全体の読み取りパフォーマンスを改善しました。これは、サブカラム接頭辞のデシリアライズに対するプリフェッチ、デシリアライズ済み接頭辞のキャッシュ、およびサブカラム接頭辞の並列デシリアライズを追加することで実現しています。これにより、`SELECT data FROM table` のようなクエリでは S3 からの JSON カラムの読み取りが 4 倍、`SELECT data FROM table LIMIT 10` のようなクエリではおよそ 10 倍高速になります。 [#74827](https://github.com/ClickHouse/ClickHouse/pull/74827) ([Pavel Kruglov](https://github.com/Avogar)).
* `max_rows_in_join = max_bytes_in_join = 0` の場合に `parallel_hash` で発生していた不要な競合を修正しました。 [#75155](https://github.com/ClickHouse/ClickHouse/pull/75155) ([Nikita Taranov](https://github.com/nickitat)).
* オプティマイザによって結合の両側が入れ替えられるケースで、`ConcurrentHashJoin` において二重に事前確保が行われていた問題を修正しました。 [#75149](https://github.com/ClickHouse/ClickHouse/pull/75149) ([Nikita Taranov](https://github.com/nickitat)).
* 一部の JOIN シナリオでのわずかな改善として、出力行数を事前計算し、その分のメモリを予約するようにしました。 [#75376](https://github.com/ClickHouse/ClickHouse/pull/75376) ([Alexander Gololobov](https://github.com/davenger)).
* `WHERE a < b AND b < c AND c < 5` のようなクエリに対して、より良いフィルタリング性能のために新しい比較条件（`a < 5 AND b < 5`）を推論できるようにしました。 [#73164](https://github.com/ClickHouse/ClickHouse/pull/73164) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の改善: パフォーマンス向上のため、インメモリ ストレージへのコミット時にはダイジェスト計算を無効化しました。これは `keeper_server.digest_enabled_on_commit` 設定で有効化できます。リクエストの前処理時には引き続きダイジェストが計算されます。 [#75490](https://github.com/ClickHouse/ClickHouse/pull/75490) ([Antonio Andelic](https://github.com/antonio2368)).
* 可能な場合、JOIN の ON 句からフィルタ式をプッシュダウンするようにしました。 [#75536](https://github.com/ClickHouse/ClickHouse/pull/75536) ([Vladimir Cherkasov](https://github.com/vdimir)).
* MergeTree において、カラムおよびインデックスサイズを遅延評価するようにしました。 [#75938](https://github.com/ClickHouse/ClickHouse/pull/75938) ([Pavel Kruglov](https://github.com/Avogar)).
* `MATERIALIZE TTL` において `ttl_only_drop_parts` を再び考慮するようにし、TTL を再計算してパーツを削除する際には、必要なカラムのみを読み込んで空のパーツに置き換える形で削除するようにしました。 [#72751](https://github.com/ClickHouse/ClickHouse/pull/72751) ([Andrey Zvonov](https://github.com/zvonand)).
* plain_rewritable メタデータファイルに対する書き込みバッファサイズを削減しました。 [#75758](https://github.com/ClickHouse/ClickHouse/pull/75758) ([Julia Kartseva](https://github.com/jkartseva)).
* 一部のウィンドウ関数におけるメモリ使用量を削減しました。 [#65647](https://github.com/ClickHouse/ClickHouse/pull/65647) ([lgbo](https://github.com/lgbo-ustc)).
* Parquet の Bloom フィルタと min/max インデックスを併用して評価するようにしました。これは、data = [1, 2, 4, 5] のときに `x = 3 or x > 5` を正しくサポートするために必要です。 [#71383](https://github.com/ClickHouse/ClickHouse/pull/71383) ([Arthur Passos](https://github.com/arthurpassos)).
* `Executable` ストレージに渡されるクエリは、もはやシングルスレッド実行に制限されません。 [#70084](https://github.com/ClickHouse/ClickHouse/pull/70084) ([yawnt](https://github.com/yawnt)).
* ALTER TABLE FETCH PARTITION でパーツを並列にフェッチするようにしました（スレッドプールサイズは `max_fetch_partition_thread_pool_size` で制御されます）。 [#74978](https://github.com/ClickHouse/ClickHouse/pull/74978) ([Azat Khuzhin](https://github.com/azat)).
* `indexHint` 関数を用いた述語を `PREWHERE` に移動できるようにしました。 [#74987](https://github.com/ClickHouse/ClickHouse/pull/74987) ([Anton Popov](https://github.com/CurtizJ)).



#### 改善

* `LowCardinality` カラムのメモリ内サイズの計算を修正しました。 [#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat)).
* `processors_profile_log` テーブルには、TTL を 30 日とするデフォルト構成が設定されました。 [#66139](https://github.com/ClickHouse/ClickHouse/pull/66139) ([Ilya Yatsishin](https://github.com/qoega)).
* クラスター設定でシャードに名前を付けられるようになりました。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* Prometheus の remote write レスポンスの成功ステータスコードを 200/OK から 204/NoContent に変更しました。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* サーバーを再起動することなく、`max_remote_read_network_bandwidth_for_serve` および `max_remote_write_network_bandwidth_for_server` をオンザフライで再読み込みできるようにしました。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* バックアップ作成時にチェックサムを計算する際、blob パスを使用できるようにしました。 [#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.query_cache` にクエリ ID 列を追加しました（[#68205](https://github.com/ClickHouse/ClickHouse/issues/68205) をクローズ）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* `ALTER TABLE ... FREEZE ...` クエリを、`KILL QUERY` で明示的に、またはタイムアウト（`max_execution_time`）によって自動的にキャンセルできるようになりました。 [#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar))。
* `groupUniqArrayArrayMap` を `SimpleAggregateFunction` としてサポートするようにしました。 [#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers)).
* データベースエンジン `Iceberg` において、カタログの認証情報設定を非表示にしました。Closes [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559). [#75080](https://github.com/ClickHouse/ClickHouse/pull/75080) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `intExp2` / `intExp10`: 未定義だった動作を明確化: 引数が小さすぎる場合は 0 を返し、大きすぎる場合は `18446744073709551615` を返し、`NaN` の場合は例外をスローする。 [#75312](https://github.com/ClickHouse/ClickHouse/pull/75312) ([Vitaly Baranov](https://github.com/vitlibar)).
* `DatabaseIceberg` のカタログ設定で `s3.endpoint` をネイティブにサポートするようにしました。[#74558](https://github.com/ClickHouse/ClickHouse/issues/74558) をクローズ。[#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `SYSTEM DROP REPLICA` を実行するユーザーに十分な権限がない場合に、処理が黙って失敗しないようにしました。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc))。
* いずれかの system ログがフラッシュに失敗した回数を記録する ProfileEvent を追加しました。 [#75466](https://github.com/ClickHouse/ClickHouse/pull/75466) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 復号および伸長処理に対するチェックと追加のログ出力を追加しました。 [#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* `parseTimeDelta` 関数でマイクロ記号 (U+00B5) をサポートしました。これにより、マイクロ記号 (U+00B5) とギリシャ文字ミュー (U+03BC) の両方がマイクロ秒を表す有効な表現として認識されるようになり、ClickHouse の動作が Go の実装に合わせられました（[time.go を参照](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) および [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）。[#75472](https://github.com/ClickHouse/ClickHouse/pull/75472)（[Vitaly Orlov](https://github.com/orloffv)）。
* サーバー設定（`send_settings_to_client`）を、クライアント側コード（例: INSERT データの解析やクエリ結果のフォーマット）がサーバーの `users.xml` とユーザープロファイルの設定を使用するかどうかを制御するクライアント設定（`apply_settings_from_server`）に置き換えました。これを無効にした場合、クライアントのコマンドライン、セッション、およびクエリからの設定のみが使用されます。これはネイティブクライアントにのみ適用され（HTTP などには適用されません）、またクエリ処理の大部分（処理自体はサーバー側で行われます）には適用されない点に注意してください。 [#75478](https://github.com/ClickHouse/ClickHouse/pull/75478) ([Michael Kolupaev](https://github.com/al13n321))。
* 構文エラーに対するエラーメッセージを改善しました。以前は、クエリが大きすぎるうえに、長さが制限を超えるトークンが非常に大きな文字列リテラルだった場合、その理由を説明するメッセージが、この非常に長いトークンの 2 つの例のあいだに埋もれてしまっていました。UTF-8 を含むクエリがエラーメッセージ内で誤って切り詰められる問題を修正しました。クエリ断片が過剰に引用符で囲まれてしまう問題を修正しました。これにより [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473) がクローズされました。 [#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3(Azure)Queue` にプロファイルイベントを追加しました。[#75618](https://github.com/ClickHouse/ClickHouse/pull/75618)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 互換性のため、サーバーからクライアントへの設定送信（`send_settings_to_client=false`）を無効化しました（この機能は利便性向上のため、後にクライアント設定として再実装される予定です）。[#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321))。
* バックグラウンドスレッドで定期的に読み取った複数のソースからの情報に基づいて内部メモリトラッカーを補正できるようにする設定 `memory_worker_correct_memory_tracker` を追加しました。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368))。
* `system.processes` に `normalized_query_hash` 列を追加しました。注記: `normalizedQueryHash` 関数を使えばその場で容易に計算できますが、後続の変更に備えるために必要です。 [#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `system.tables` をクエリしても、存在しないデータベース上に作成された `Merge` テーブルがあっても例外は発生しません。`Hive` テーブルには複雑な処理をさせない方針のため、`getTotalRows` メソッドを削除しました。 [#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* バックアップの start&#95;time/end&#95;time をマイクロ秒精度で保存するようにしました。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* RSS による補正が行われていない内部グローバルメモリトラッカーの値を示す `MemoryTrackingUncorrected` メトリクスを追加しました。[#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368)).
* `PostgreSQL` や `MySQL` のテーブル関数で、`localhost:1234/handle` のようなエンドポイントをパースできるようにしました。これは、[https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) で導入されていたリグレッションを修正するものです。 [#75944](https://github.com/ClickHouse/ClickHouse/pull/75944) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* サーバー設定 `throw_on_unknown_workload` を追加しました。この設定により、未知の値に設定された `workload` で実行されたクエリに対する挙動を選択できます。無制限のアクセスを許可する（デフォルト）か、`RESOURCE_ACCESS_DENIED` エラーをスローするかを選択できます。すべてのクエリで workload スケジューリングの使用を強制したい場合に有用です。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa))。
* 不要な場合は、`ARRAY JOIN` でサブカラムを `getSubcolumn` に書き換えないようにしました。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル読み込み時のコーディネーションエラーをリトライするようにしました。 [#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `SYSTEM FLUSH LOGS` で個々のログを個別にフラッシュできるようにしました。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* `/binary` サーバーのページを改良しました。Morton 曲線の代わりに Hilbert 曲線を使用します。正方形内に 512 MB 分のアドレスを表示し、正方形全体をよりよく埋められるようにしました（以前のバージョンでは、アドレスは正方形の半分しか埋めていませんでした）。アドレスの色分けは関数名ではなくライブラリ名に基づいて行うようにしました。領域の外側にも少し多めにスクロールできるようにしました。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES エラーが発生した場合に ON CLUSTER クエリを再試行するようにしました。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* サーバーの相対的な CPU 不足を計算する非同期メトリック `CPUOverload` を追加しました。 [#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `output_format_pretty_max_rows` のデフォルト値を 10000 から 1000 に変更しました。使い勝手の観点からこの方がよいと考えています。 [#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* クエリ解釈中に例外が発生した場合、それらがクエリで指定されたカスタムフォーマットで出力されるように修正しました。以前のバージョンでは、クエリで指定されたフォーマットではなく、デフォルトフォーマットで例外が整形されていました。これにより [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422) が解決されました。 [#74994](https://github.com/ClickHouse/ClickHouse/pull/74994) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* SQLite の型マッピングを修正（整数型を `int64` に、浮動小数点型を `float64` にマッピングするように変更）。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x))。
* 親スコープにおける識別子の解決を修正しました。`WITH` 句内で式のエイリアスを使用できるようにしました。[#58994](https://github.com/ClickHouse/ClickHouse/issues/58994) を修正。[#62946](https://github.com/ClickHouse/ClickHouse/issues/62946) を修正。[#63239](https://github.com/ClickHouse/ClickHouse/issues/63239) を修正。[#65233](https://github.com/ClickHouse/ClickHouse/issues/65233) を修正。[#71659](https://github.com/ClickHouse/ClickHouse/issues/71659) を修正。[#71828](https://github.com/ClickHouse/ClickHouse/issues/71828) を修正。[#68749](https://github.com/ClickHouse/ClickHouse/issues/68749) を修正。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* negate 関数の単調性を修正しました。以前のバージョンでは、`x` がプライマリキーである場合、`select * from a where -x = -42;` というクエリが誤った結果を返すことがありました。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321))。
* arrayIntersect における空タプルの扱いを修正。これにより [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578) が解消されます。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 不正なプレフィックスが付いた JSON サブオブジェクトのサブカラムの読み取りを修正。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* クライアントとサーバー間の通信で Native フォーマットの設定が正しく伝播されるようにしました。 [#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部のストレージでサポートされていない型を検出するチェックを追加。 [#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS の PostgreSQL インターフェース経由で実行した `INSERT INTO SELECT` クエリで発生するクラッシュを修正しました（issue [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。[#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* レプリケーテッドデータベースにおける未初期化の `max_log_ptr` を修正しました。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov)).
* Interval 型の挿入時に発生するクラッシュを修正（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。 [#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 定数 JSON リテラルの整形を修正しました。以前は、クエリを別のサーバーに送信する際に構文エラーを引き起こす可能性がありました。 [#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar)).
* 暗黙的なプロジェクションが有効な場合に、定数パーティション式を使用すると `CREATE` クエリが失敗する不具合を修正しました。これにより [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596) が解決されます。 [#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird))。
* INSERT が例外で終了した後に接続が壊れた状態のまま残らないようにしました。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 中間状態のまま残っていた接続を再利用しないようにしました。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat)).
* 型名が大文字でない場合に JSON 型宣言の解析時にクラッシュする問題を修正。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar))
* Keeper: 接続が確立される前に切断された場合に発生する logical&#95;error を修正。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321)).
* `AzureBlobStorage` を使用するテーブルが存在する場合にサーバーが起動できなかった問題を修正しました。テーブルは Azure へのリクエストを行わずに読み込まれます。 [#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* BACKUP および RESTORE 操作に対し、`query_log` において欠落していた `used_privileges` フィールドと `missing_privileges` フィールドを修正しました。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* HDFS の SELECT リクエスト中に SASL エラーが発生した場合に Kerberos チケットを更新するようにしました。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* startup&#95;scripts 内で Replicated データベースに対して実行されるクエリを修正。 [#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat)).
* null-safe な比較が使用されている場合に、JOIN ON 句内で型エイリアスが付与された式に関する問題を修正しました。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 削除操作が失敗した場合、part の状態を deleting から outdated に戻します。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 以前のバージョンでは、スカラーサブクエリがある場合、データフォーマットの初期化中（HTTP ヘッダーが書き出される前）に、サブクエリの処理から蓄積された進捗情報の書き込みを開始していました。これにより、X-ClickHouse-QueryId や X-ClickHouse-Format、Content-Type といった HTTP ヘッダーが失われていました。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_allow_replicated_engine_arguments=0` に設定されている場合の `CREATE TABLE AS...` クエリを修正。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc)).
* INSERT 例外発生後にクライアントで接続が不正な状態のまま残ってしまう不具合を修正しました。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* PSQL レプリケーションにおける未捕捉の例外により発生するクラッシュを修正しました。 [#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* SASL により任意の RPC 呼び出しが失敗する可能性があり、この修正により、krb5 チケットの有効期限が切れている場合に呼び出しを再試行できるようになりました。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* `optimize_function_to_subcolumns` 設定が有効な場合の `Array`、`Map`、`Nullable(..)` カラムに対するインデックス（プライマリおよびセカンダリ）の扱いを修正しました。以前は、これらのカラムのインデックスが無視されることがありました。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* `inner table` を使用してマテリアライズドビューを作成する場合は、`flatten_nested` を無効にしてください。そうしないと、そのようにフラット化されたカラムは使用できません。 [#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm)).
* 一部の IPv6 アドレス（::ffff:1.1.1.1 など）が `forwarded_for` フィールド内で誤って解釈され、例外が発生してクライアントが切断される問題を修正。 [#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* LowCardinality の Nullable データ型に対する null セーフ JOIN の処理を修正しました。以前は、`IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b` のような null セーフな比較を伴う JOIN ON が、LowCardinality 列で正しく動作していませんでした。[#75143](https://github.com/ClickHouse/ClickHouse/pull/75143)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* NumRowsCache の `total_number_of_rows` をカウントする際に `key_condition` を指定しないことを検証します。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 新しいアナライザーにより、未使用の補間を含むクエリを修正しました。 [#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* CTE と INSERT を併用した際に発生していたクラッシュバグを修正。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の修正: ログをロールバックする際に、破損したチェンジログに書き込まないようにしました。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 適切な箇所では `BFloat16` をスーパータイプとして使用するようにしました。この変更により、次の issue がクローズされます: [#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* any&#95;join&#95;distinct&#95;right&#95;table&#95;keys を使用し、JOIN ON に OR が含まれる場合の JOIN 結果で発生する予期しないデフォルト値を修正。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* azureblobstorage テーブルエンジンの認証情報をマスクするようにしました。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* PostgreSQL、MySQL、SQLite のような外部データベースに対して、ClickHouse が誤ってフィルタープッシュダウンを行ってしまう場合がある問題を修正しました。これにより、次の Issue がクローズされます: [#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Protobuf フォーマットでの出力中に、並列クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` の実行によって発生する可能性があった Protobuf スキーマキャッシュのクラッシュを修正しました。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* `HAVING` からのフィルタが parallel replicas 使用時にプッシュダウンされる際に発生し得る、論理エラーまたは未初期化メモリの問題を修正しました。[#75363](https://github.com/ClickHouse/ClickHouse/pull/75363)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `icebergS3`、`icebergAzure` の table function およびテーブルエンジンにおける機密情報を非表示にしました。 [#75378](https://github.com/ClickHouse/ClickHouse/pull/75378) ([Kseniia Sumarokova](https://github.com/kssenii)).
* トリム対象文字が計算結果として空文字列になる場合の `TRIM` 関数が、正しく処理されるようになりました。例: `SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。 [#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* IOutputFormat のデータ競合を修正。 [#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 分散テーブル上での JOIN で Array 型の JSON サブカラムを使用した際に発生する可能性がある `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes` エラーを修正しました。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* `CODEC(ZSTD, DoubleDelta)` によるデータ破損の問題を修正しました。 [#70031](https://github.com/ClickHouse/ClickHouse/issues/70031) をクローズ。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* allow&#95;feature&#95;tier と compatibility MergeTree 設定の相互作用を修正。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルの再試行時に `system.s3queue_log` の `processed_rows` の値が誤っていた問題を修正しました。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii)).
* マテリアライズドビューが URL エンジンに書き込みを行い、接続障害が発生した場合に `materialized_views_ignore_errors` 設定が尊重されるようになりました。 [#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm)).
* 異なる型のカラム間で複数の非同期 `RENAME` クエリ（`alter_sync = 0`）を実行した後に、`MergeTree` テーブルから読み取る際にまれに発生していたクラッシュを修正しました。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の `UNION ALL` を含むクエリで発生していた `Block structure mismatch in QueryPipeline stream` エラーを修正。 [#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* PK カラムを `ALTER MODIFY` した際、そのカラムを PK に使用している Projection を再構築するようにしました。以前は、Projection の PK に使用されているカラムを `ALTER MODIFY` した後に実行した `SELECT` で、`CANNOT_READ_ALL_DATA` エラーが発生することがありました。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* スカラーサブクエリに対する `ARRAY JOIN` の誤った結果を修正（`analyzer` 使用時）。[#75732](https://github.com/ClickHouse/ClickHouse/pull/75732)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `DistinctSortedStreamTransform` におけるヌルポインタのデリファレンスを修正しました。 [#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* `allow_suspicious_ttl_expressions` の動作を修正。[#75771](https://github.com/ClickHouse/ClickHouse/pull/75771) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 関数 `translate` における未初期化メモリの読み取りを修正しました。これにより [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592) をクローズしました。 [#75794](https://github.com/ClickHouse/ClickHouse/pull/75794)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Native フォーマットにおいて、フォーマット設定が JSON に文字列フォーマットとして伝播されるようにしました。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* 設定変更履歴に、v24.12 でハッシュ結合アルゴリズムの並列実行がデフォルトで有効化されたことを記録しました。これは、互換性レベルとして v24.12 より前のバージョンが設定されている場合、ClickHouse は引き続き非並列のハッシュ結合を使用することを意味します。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze)).
* 暗黙的に追加された min-max インデックスを持つテーブルを新しいテーブルにコピーできない不具合を修正しました（issue [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` はファイルシステムから任意のライブラリを開くことができるため、分離された環境内でのみ安全に実行できます。`clickhouse-server` と同一環境で実行された場合の脆弱性を防ぐため、設定で指定された場所以下にライブラリのパスを制限します。この脆弱性は、**Arseniy Dugin** によって [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) を通じて発見されました。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 一部のメタデータに JSON シリアライゼーションを使用していましたが、これは誤りでした。JSON は、ゼロバイトを含むバイナリデータを文字列リテラル内でサポートしていないためです。SQL クエリにはバイナリデータや不正な UTF-8 が含まれ得るため、メタデータファイルでもこれをサポートする必要があります。同時に、ClickHouse の `JSONEachRow` などのフォーマットは、バイナリデータの完全なラウンドトリップを優先するために JSON 標準から逸脱することで、この制約を回避しています。動機についてはこちらを参照してください: [https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解決策は、`Poco::JSON` ライブラリを ClickHouse における JSON フォーマットシリアライゼーションと整合させることです。これにより [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668) がクローズされます。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3Queue` のコミット上限チェックを修正。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `add_minmax_index_for_numeric_columns` / `add_minmax_index_for_string_columns` によって数値／文字列カラムに minmax インデックスを自動追加する MergeTree テーブルの ATTACH を修正。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* ジョブの親スレッド側のスタックトレース（`enable_job_stack_trace` 設定）が出力されない問題を修正しました。`enable_job_stack_trace` 設定がスレッドに正しく伝播されず、その結果スタックトレースの内容がこの設定を常に反映しない問題を修正しました。 [#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `ALTER RENAME` に `CREATE USER` 権限が必要となっていた誤った権限チェックを修正しました。[#74372](https://github.com/ClickHouse/ClickHouse/issues/74372) をクローズしました。[#76241](https://github.com/ClickHouse/ClickHouse/pull/76241)（[pufit](https://github.com/pufit)）。
* ビッグエンディアンのアーキテクチャにおける FixedString への reinterpretAs を修正しました。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* S3Queue で発生していた論理エラー &quot;Expected current processor {} to be equal to {} for bucket {}&quot; を修正しました。 [#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii))。
* Memory データベースでの ALTER 実行時に発生するデッドロックを修正。 [#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句の条件に `pointInPolygon` 関数が含まれる場合のインデックス解析における論理エラーを修正。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* シグナルハンドラ内の安全ではない可能性のある呼び出しを修正。 [#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* PartsSplitter の reverse key サポートを修正しました。これにより [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400) が解決されます。[#73418](https://github.com/ClickHouse/ClickHouse/pull/73418)（[Amos Bird](https://github.com/amosbird)）。



#### ビルド／テスト／パッケージングの改善
* ARM と Intel Mac の両方での HDFS のビルドをサポート。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp))。
* Darwin 向けにクロスコンパイルする際に ICU と GRPC を有効化。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano))。
* 組み込み LLVM 19 へ更新。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* docker イメージで `default` ユーザーのネットワークアクセスを無効化。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。`entrypoint.sh` でデフォルトのバイナリを起動する場合にのみ実行されるよう、すべての clickhouse-server 関連のアクションを関数として切り出し。長らく先送りされていた改善は [#50724](https://github.com/ClickHouse/ClickHouse/issues/50724) で提案されていたもの。`users.xml` から値を取得するために `clickhouse-extract-from-config` にスイッチ `--users` を追加。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* バイナリから約 20MB のデッドコードを削除。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

### ClickHouse リリース 25.1, 2025-01-28 {#251}



#### 後方互換性のない変更
* `JSONEachRowWithProgress` は、進捗が発生するたびに進捗情報を書き出すようになりました。これまでのバージョンでは、結果の各ブロックごとにのみ進捗が表示されていたため、実質的に有用ではありませんでした。進捗の表示方法を変更し、ゼロの値は表示しないようにしました。これにより [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800) が解決されました。 [#73834](https://github.com/ClickHouse/ClickHouse/pull/73834) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `Merge` テーブルは、基になるテーブル群のカラムのユニオンを使用し、共通の型を導出することで構造を統一するようになりました。これにより [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864) が解決されました。特定のケースでは、この変更は後方互換性がない可能性があります。例としては、テーブル間に共通の型が存在しないものの、最初のテーブルの型への変換は依然として可能な場合 (たとえば UInt64 と Int64、あるいは任意の数値型と String の組み合わせ) などが挙げられます。従来の動作に戻したい場合は、`merge_table_max_tables_to_look_for_schema_inference` を `1` に設定するか、`compatibility` を `24.12` 以前に設定してください。 [#73956](https://github.com/ClickHouse/ClickHouse/pull/73956) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Parquet 出力フォーマットは、Date および DateTime カラムを、生の数値として書き出すのではなく、Parquet がサポートする日付/時刻型に変換するようになりました。`DateTime` は `DateTime64(3)` (以前は `UInt32`) になりました。`output_format_parquet_datetime_as_uint32` を設定すると、従来の動作に戻せます。`Date` は `Date32` (以前は `UInt16`) になりました。 [#70950](https://github.com/ClickHouse/ClickHouse/pull/70950) ([Michael Kolupaev](https://github.com/al13n321)).
* 既定では、`ORDER BY` および `less/greater/equal/etc` といった比較関数内で、`JSON` / `Object` / `AggregateFunction` のような比較不可能な型を使用できないようになりました。 [#73276](https://github.com/ClickHouse/ClickHouse/pull/73276) ([Pavel Kruglov](https://github.com/Avogar)).
* 廃止済みの `MaterializedMySQL` データベースエンジンは削除され、今後は利用できません。 [#73879](https://github.com/ClickHouse/ClickHouse/pull/73879) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `mysql` ディクショナリソースは、`SHOW TABLE STATUS` クエリを実行しなくなりました。これは、最近の MySQL バージョンや InnoDB テーブルに対しては、このクエリが有用な情報を提供しないためです。これにより [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636) が解決されました。この変更は後方互換性を保っていますが、気付いてもらえるよう、このカテゴリに含めています。 [#73914](https://github.com/ClickHouse/ClickHouse/pull/73914) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `CHECK TABLE` クエリには、専用の `CHECK` 権限が必要になりました。以前のバージョンでは、これらのクエリを実行するには `SHOW TABLES` 権限だけで十分でした。しかし、`CHECK TABLE` クエリは重い処理となり得る一方で、`SELECT` クエリ向けの通常のクエリ複雑性制限が適用されませんでした。その結果、DoS の可能性がありました。 [#74471](https://github.com/ClickHouse/ClickHouse/pull/74471) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `h3ToGeo()` は、結果を (ジオメトリ関数における標準的な順序である) `(lat, lon)` の順で返すようになりました。従来の `(lon, lat)` の結果順序を維持したいユーザーは、設定 `h3togeo_lon_lat_result_order = true` を有効にできます。 [#74719](https://github.com/ClickHouse/ClickHouse/pull/74719) ([Manish Gill](https://github.com/mgill25)).
* 新しい MongoDB ドライバーがデフォルトになりました。従来のドライバーの使用を続けたいユーザーは、サーバー設定 `use_legacy_mongodb_integration` を true に設定してください。 [#73359](https://github.com/ClickHouse/ClickHouse/pull/73359) ([Robert Schulze](https://github.com/rschu1ze)).



#### 新機能

* `SELECT` クエリを送信した直後、その実行中に未完了（バックグラウンドプロセスによってマテリアライズされていない）な mutation を適用できる機能を追加しました。これは `apply_mutations_on_fly` を設定することで有効化できます。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* Iceberg テーブルの時間関連の変換パーティション操作に対するパーティションプルーニングを実装しました。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik))。
* MergeTree のソートキーおよびスキップインデックスでサブカラムをサポートしました。[#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* `Apache Arrow`/`Parquet`/`ORC` からの `HALF_FLOAT` 値の読み取りをサポートしました（`Float32` 型として読み込まれます）。これにより [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960) がクローズされました。IEEE-754 の half float は `BFloat16` と同じではないことに注意してください。[#73835](https://github.com/ClickHouse/ClickHouse/issues/73835) がクローズされました。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` テーブルには、新たに `symbols` と `lines` という 2 つのカラムが追加され、シンボル化されたスタックトレースが格納されます。これにより、プロファイリング情報の収集とエクスポートが容易になります。これは `trace_log` 内のサーバー設定値 `symbolize` によって制御されており、デフォルトで有効になっています。 [#73896](https://github.com/ClickHouse/ClickHouse/pull/73896) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* テーブルで自動インクリメントの連番を生成するために使用できる新しい関数 `generateSerialID` を追加しました。[kazalika](https://github.com/kazalika) による [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) の継続です。これにより [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485) がクローズされます。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* DDL クエリ用に、`query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN` という構文を追加しました。これは、サブクエリ `{query1, query2, ... queryN}` を互いに並列に実行できるようになる（かつ、その方が望ましい）ことを意味します。 [#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar))。
* デシリアライズ済みの skipping index granule 用インメモリキャッシュを追加しました。これにより、skipping index を使用する繰り返し実行されるクエリが高速になるはずです。新しいキャッシュのサイズは、サーバー設定 `skipping_index_cache_size` と `skipping_index_cache_max_entries` で制御されます。キャッシュ導入の主な動機となったのはベクトル類似性インデックスで、これらのクエリは今回の変更により大幅に高速化されました。 [#70102](https://github.com/ClickHouse/ClickHouse/pull/70102) ([Robert Schulze](https://github.com/rschu1ze)).
* これにより、埋め込み Web UI はクエリ実行中にプログレスバーを表示するようになりました。クエリをキャンセルできるようになりました。合計レコード数と、速度に関する詳細情報を表示します。データが到着し次第、テーブルをインクリメンタルにレンダリングできます。HTTP 圧縮が有効になりました。テーブルのレンダリングが高速になりました。テーブルヘッダーは固定表示（sticky）になりました。セルを選択し、矢印キーで移動できるようになりました。選択されたセルのアウトラインによってセルが小さくなってしまう問題を修正しました。セルはマウスホバー時ではなく、選択時のみ拡大されるようになりました。受信データのレンダリングを停止するタイミングは、サーバー側ではなくクライアント側で決定されます。数値の桁区切りをハイライト表示します。全体的なデザインを刷新し、より力強い印象になりました。サーバーに接続可能かどうかと認証情報の正当性をチェックし、サーバーバージョンと稼働時間を表示します。クラウドアイコンは、Safari を含むすべてのフォントで輪郭表示されます。ネストされたデータ型内の大きな整数が、より適切にレンダリングされるようになりました。`inf` / `nan` を正しく表示します。列ヘッダー上にマウスを置いたときにデータ型を表示します。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MergeTree によって管理されるカラムに対して、デフォルトで min-max（スキップ）インデックスを作成できるようにする機能を追加しました。数値カラム向けには設定項目 `add_minmax_index_for_numeric_columns` を、文字列カラム向けには設定項目 `add_minmax_index_for_string_columns` を使用します。現時点ではどちらの設定も無効になっているため、まだ動作の変更はありません。 [#74266](https://github.com/ClickHouse/ClickHouse/pull/74266) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* `system.query_log`、ネイティブプロトコルの ClientInfo、およびサーバーログに `script_query_number` と `script_line_number` フィールドを追加しました。これにより [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542) がクローズされました。この機能の立ち上げに貢献した [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) の [pinsvin00](https://github.com/pinsvin00) に謝意を表します。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 集約関数 `sequenceMatchEvents` を追加しました。この関数は、パターン内で最も長いイベントシーケンスに対して、一致したイベントのタイムスタンプを返します。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus)).
* 関数 `arrayNormalizedGini` を追加しました。 [#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl))。
* `DateTime64` に対する minus 演算子のサポートを追加し、`DateTime64` 同士および `DateTime` との減算を可能にしました。 [#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg))。



#### 実験的機能
* `BFloat16` データ型は本番環境で利用可能になりました。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov)).



#### パフォーマンスの向上

* 関数 `indexHint` を最適化しました。これにより、関数 `indexHint` の引数としてのみ使用されている列はテーブルから読み出されなくなりました。 [#74314](https://github.com/ClickHouse/ClickHouse/pull/74314) ([Anton Popov](https://github.com/CurtizJ))。もし `indexHint` 関数があなたのエンタープライズデータアーキテクチャの中核を成しているのであれば、この最適化はまさに命を救ってくれるでしょう。
* `parallel_hash` JOIN アルゴリズムにおける `max_joined_block_size_rows` 設定を、より正確に考慮するようにしました。これにより、`hash` アルゴリズムと比較してメモリ使用量が増加してしまうことを防ぎます。 [#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* `MergingAggregated` ステップに対して、クエリプランレベルでの述語プッシュダウン最適化をサポートしました。これにより、Analyzer を使用する一部のクエリのパフォーマンスが向上します。 [#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `parallel_hash` JOIN アルゴリズムのプローブフェーズから、左テーブルブロックをハッシュで分割する処理が削除されました。[#73089](https://github.com/ClickHouse/ClickHouse/pull/73089) ([Nikita Taranov](https://github.com/nickitat))。
* RowBinary 入力フォーマットを最適化し、[#63805](https://github.com/ClickHouse/ClickHouse/issues/63805) をクローズ。 [#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* `optimize_on_insert` が有効な場合、レベル 1 のパーツとして書き込みます。これにより、新規に書き込まれたパーツに対して、`FINAL` を伴うクエリの最適化をいくつか利用できるようになります。 [#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* 低レベルな最適化により、文字列デシリアライズを高速化しました。 [#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* レコード間の等価比較（マージ時など）を行う際には、一致しない可能性が最も高い列から行の比較を開始するようになりました。 [#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus)).
* 右側の結合テーブルをキーで再ランキングすることで、Grace ハッシュ結合のパフォーマンスを改善しました。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* `arrayROCAUC` と `arrayAUCPR` が曲線全体に対する部分面積を計算できるようにし、巨大なデータセットに対してその計算を並列化できるようにしました。 [#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias)).
* アイドル状態のスレッドが過剰に生成されないようにしました。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* `table function` で波かっこによる展開のみを行う場合は、blob ストレージのキーを列挙しないようにしました。[#73333](https://github.com/ClickHouse/ClickHouse/issues/73333) をクローズ。[#73518](https://github.com/ClickHouse/ClickHouse/pull/73518) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* Nullable 引数に対して実行される関数のショートサーキット評価の最適化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li)).
* 非関数列には `maskedExecute` を適用しないようにし、ショートサーキット実行のパフォーマンスを改善しました。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc)).
* パフォーマンスを向上させるため、`Kafka`/`NATS`/`RabbitMQ`/`FileLog` 向けの入力フォーマットでのヘッダー自動検出機能を無効化しました。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat)).
* グルーピングセットによる集約後のパイプラインを、より高い並列度で実行するようにしました。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* `MergeTreeReadPool` におけるクリティカルセクションの範囲を縮小。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* 並列レプリカにおけるパフォーマンスを改善しました。クエリイニシエーターでは、並列レプリカプロトコルに関係しないパケットのデシリアライズは、常にパイプラインスレッド内で行われるようになりました。以前は、パイプラインのスケジューリングを担当するスレッドで行われることがあり、その結果イニシエーターの応答性が低下し、パイプライン実行が遅延する可能性がありました。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter))。
* Keeper における大規模なマルチリクエストのパフォーマンスを改善しました。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* ログラッパーは値渡しで使用し、ヒープに割り当てないようにします。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* MySQL および Postgres の辞書レプリカへの接続をバックグラウンドで再接続し、対応する辞書へのリクエストが遅延しないようにしました。 [#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parallel replicas はレプリカの可用性に関する履歴情報を用いてレプリカ選択を改善していましたが、接続が確立できなかった場合にそのレプリカのエラー数を更新していませんでした。この PR では、レプリカが利用不能な場合にそのレプリカのエラー数を更新するようにしました。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi))。
* MergeTree の設定 `materialize_skip_indexes_on_merge` が追加され、マージ時にスキップインデックスの作成を抑制できるようになりました。これにより、ユーザーはスキップインデックスがいつ作成されるかを（`ALTER TABLE [..] MATERIALIZE INDEX [...]` を通じて）明示的に制御できます。これは、スキップインデックスの作成コストが高い場合（例: ベクトル類似度インデックス）に有用です。 [#74401](https://github.com/ClickHouse/ClickHouse/pull/74401) ([Robert Schulze](https://github.com/rschu1ze)).
* Storage(S3/Azure)Queue での Keeper へのリクエストを最適化。 [#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* デフォルトで最大 `1000` 個までの並列レプリカを使用するようになりました。 [#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* S3 ディスクからの読み取り時の HTTP セッション再利用を改善 ([#72401](https://github.com/ClickHouse/ClickHouse/issues/72401)). [#74548](https://github.com/ClickHouse/ClickHouse/pull/74548) ([Julian Maicher](https://github.com/jmaicher)).





#### 改善

* 暗黙的な ENGINE を使用する CREATE TABLE クエリで SETTINGS をサポートし、ENGINE 設定とクエリ設定を併用できるようにしました。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano)).
* `use_hive_partitioning` をデフォルトで有効化。[#71636](https://github.com/ClickHouse/ClickHouse/pull/71636)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 異なるパラメータを持つ JSON 型間での CAST および ALTER をサポート。[#72303](https://github.com/ClickHouse/ClickHouse/pull/72303)（[Pavel Kruglov](https://github.com/Avogar)）。
* JSON カラム値の等値比較をサポートしました。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar))。
* 不要なバッククォートを避けるために、JSON サブカラムを含む識別子の書式設定を改善しました。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* インタラクティブメトリクスの改善。並列レプリカからのメトリクスが完全に表示されない問題を修正しました。メトリクスは最新の更新時刻が新しいものから順に、その後は名前の辞書順で表示します。古くなったメトリクスは表示しません。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631) ([Julia Kartseva](https://github.com/jkartseva))。
* JSON 出力フォーマットをデフォルトで整形表示するようにしました。これを制御するための新しい設定 `output_format_json_pretty_print` を追加し、デフォルトで有効にしました。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* デフォルトで `LowCardinality(UUID)` を許可するようにしました。これは ClickHouse Cloud の顧客の間で実用的であることが実証されています。 [#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* インストール時のメッセージを改善しました。 [#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ClickHouse Cloud のパスワードリセット時のメッセージを改善。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルに追記できない File テーブルに対するエラーメッセージを改善しました。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが誤ってターミナルでバイナリ形式（Native、Parquet、Avro など）での出力を要求した場合に確認を促すようにしました。これにより [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524) がクローズされます。[#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ターミナルの Pretty および Vertical 形式で末尾の空白をハイライト表示し、視認性を向上させました。これは `output_format_pretty_highlight_trailing_spaces` 設定で制御できます。初期実装は [#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) の [Braden Burns](https://github.com/bradenburns) によるものです。[#71590](https://github.com/ClickHouse/ClickHouse/issues/71590) をクローズしました。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-client` と `clickhouse-local` は、標準入力がファイルからリダイレクトされている場合、その圧縮を自動検出するようになりました。これにより [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865) が解決しました。[#73848](https://github.com/ClickHouse/ClickHouse/pull/73848)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* デフォルトで、pretty 形式において長すぎるカラム名を切り詰めるようにしました。これは `output_format_pretty_max_column_name_width_cut_to` および `output_format_pretty_max_column_name_width_min_chars_to_cut` の設定で制御されます。これは [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) における [tanmaydatta](https://github.com/tanmaydatta) の作業を継続するものです。この変更により [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968) がクローズされます。[#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Pretty` フォーマットをより見やすくするため、前のブロックの出力からあまり時間が経過していない場合はブロックをまとめて出力するようにしました。これは新しい設定 `output_format_pretty_squash_consecutive_ms`（デフォルト値 50 ms）と `output_format_pretty_squash_max_wait_ms`（デフォルト値 1000 ms）によって制御されます。[#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) の継続です。この変更により [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153) がクローズされます。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 現在マージ中のソースパーツ数を示すメトリクスを追加しました。これにより [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809) がクローズされました。[#73868](https://github.com/ClickHouse/ClickHouse/pull/73868)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 出力先がターミナルの場合、`Vertical` 形式で列をハイライト表示します。この動作は `output_format_pretty_color` 設定で無効化できます。[#73898](https://github.com/ClickHouse/ClickHouse/pull/73898)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL 互換性が向上し、現在では `mysqlsh`（Oracle 製の高機能な MySQL CLI）が ClickHouse に接続できるようになりました。これはテストを容易に行えるようにするために必要です。 [#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Pretty フォーマットでは、テーブルセル内に複数行のフィールドを表示でき、可読性が向上します。これはデフォルトで有効で、設定 `output_format_pretty_multiline_fields` で制御できます。[#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) における [Volodyachan](https://github.com/Volodyachan) による作業の継続です。これにより [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912) がクローズされました。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ブラウザ内の JavaScript から X-ClickHouse HTTP ヘッダーを利用できるようにしました。これにより、アプリケーションの開発がより容易になります。 [#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `JSONEachRowWithProgress` フォーマットには、メタデータ付きのイベントに加えて、合計値および極値も含まれます。また、`rows_before_limit_at_least` と `rows_before_aggregation` も含まれます。部分結果の後に例外が発生した場合でも、このフォーマットは例外を正しく出力します。進捗情報には経過ナノ秒も含まれるようになりました。クエリ終了時に最終進捗イベントが 1 回だけ出力されます。クエリ実行中の進捗は、`interactive_delay` 設定値で指定された間隔より高い頻度では出力されません。 [#74181](https://github.com/ClickHouse/ClickHouse/pull/74181) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Hourglass は Play UI 上でスムーズに回転するようになりました。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* HTTP レスポンスが圧縮されている場合でも、到着し次第パケットを送信します。これにより、ブラウザは進行状況を示すパケットと圧縮データを受信できるようになります。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 出力レコード数が N = `output_format_pretty_max_rows` を超える場合、先頭の N 行だけを表示するのではなく、出力テーブルを途中で分割し、先頭 N/2 行と末尾 N/2 行を表示します。 [#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) の継続です。これは [#59502](https://github.com/ClickHouse/ClickHouse/issues/59502) をクローズします。 [#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを使用できるようにしました。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DateTime64` 型のカラムに bloom&#95;filter インデックスを作成できるようにしました。 [#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean)).
* `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` が両方とも有効な場合、パーツマージ処理は最大バイト数制限を無視します。[#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* トレーサビリティを強化するため、OpenTelemetry のスパンログテーブルに HTTP ヘッダー情報を追加しました。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail))。
* `orc` ファイルを、常に `GMT` タイムゾーンではなく任意のタイムゾーンで書き込めるようにサポートしました。 [#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* クラウド間でバックアップを書き込む際に、I/O スケジューリング設定が考慮されるようにしました。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `system.asynchronous_metrics` に、`metric` カラムのエイリアスである `name` を追加しました。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm))。
* 歴史的な理由により、クエリ `ALTER TABLE MOVE PARTITION TO TABLE` は専用のアクセス権である `ALTER_MOVE_PARTITION` ではなく、`SELECT` と `ALTER DELETE` の権限をチェックしていました。このPRでは、この専用のアクセス種別を使用するように変更しました。互換性のため、`SELECT` と `ALTER DELETE` が付与されている場合には、この権限も引き続き暗黙的に付与されますが、この挙動は将来のリリースで削除される予定です。[#16403](https://github.com/ClickHouse/ClickHouse/issues/16403) をクローズします。 [#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* ソートキー内のカラムをマテリアライズしようとした際にソート順が乱れることを許可するのではなく、例外をスローするようにしました。 [#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48)).
* `EXPLAIN QUERY TREE` で機密情報を非表示にする。 [#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* &quot;native&quot; リーダーで Parquet の整数論理型をサポートしました。[#72105](https://github.com/ClickHouse/ClickHouse/pull/72105)（[Arthur Passos](https://github.com/arthurpassos)）。
* デフォルトユーザにパスワードが必要な場合、ブラウザ上で対話的に認証情報を要求するようになりました。以前のバージョンではサーバーは HTTP 403 を返していましたが、現在は HTTP 401 を返します。 [#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* アクセス種別 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` をグローバルからパラメータ化されたものに変更しました。これにより、ユーザーはアクセス管理権限をこれまでよりも細かく付与できるようになりました。[#72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit))。
* `system.mutations` に `latest_fail_error_code_name` カラムを追加しました。このカラムは、スタックしている mutation に関する新しいメトリクスを導入し、それを用いてクラウド環境で発生したエラーのグラフを作成するため、また必要に応じて、よりノイズの少ない新しいアラートを追加するために必要です。 [#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `ATTACH PARTITION` クエリでのメモリアロケーション量を削減。 [#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* `max_bytes_before_external_sort` の制限をクエリ全体のメモリ消費量に基づくものとしました（以前は 1 つのソートスレッドあたりのソートブロック中のバイト数を基準としていましたが、現在は `max_bytes_before_external_group_by` と同じ意味を持ち、全スレッドを合わせたクエリ全体のメモリに対する総制限となります）。また、ディスク上のブロックサイズを制御するための設定 `min_external_sort_block_bytes` を追加しました。[#72598](https://github.com/ClickHouse/ClickHouse/pull/72598)（[Azat Khuzhin](https://github.com/azat)）。
* トレースコレクタが課すメモリ制限を無視するようにしました。 [#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* サーバー設定 `dictionaries_lazy_load` と `wait_dictionaries_load_at_startup` を `system.server_settings` に追加しました。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm))。
* `BACKUP`/`RESTORE` クエリで指定可能な設定に `max_backup_bandwidth` を追加しました。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* レプリケートクラスターで生成されるログ量を最小限に抑えるため、ReplicatedMergeTree エンジンにおけるレプリカパーツ出現時のログレベルを引き下げました。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 論理和条件における共通式の抽出を改善し、すべての選言項に共通部分式が存在しない場合でも、結果のフィルター式を簡略化できるようにしました。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) の継続作業です。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* ストレージエンジン `S3Queue`/`AzureQueue` で、テーブル作成時に設定が指定されていなかった既存テーブルにも設定を追加できるようにしました。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `least` および `greatest` 関数が `NULL` 引数を受け取った際に、無条件に `NULL` を返す（`true` の場合）か、`NULL` を無視する（`false` の場合）かを制御する設定 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を導入しました。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze))。
* ObjectStorageQueueMetadata のクリーンアップスレッドで Keeper の multi リクエストを使用するようにしました。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* ClickHouse が cgroup 配下で実行されている場合でも、システム負荷、プロセススケジューリング、メモリなどに関連するシステム全体の非同期メトリクスは引き続き収集されます。ClickHouse がホスト上で高いリソース消費を伴う唯一のプロセスである場合、これらは有用なシグナルとなることがあります。 [#73369](https://github.com/ClickHouse/ClickHouse/pull/73369) ([Nikita Taranov](https://github.com/nickitat))。
* ストレージ `S3Queue` で、24.6 以前に作成された古い順序付きテーブルを、バケットを用いる新しい構造に移行できるようにしました。 [#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 既存の `system.s3queue` と同様に `system.azure_queue` を追加。[#73477](https://github.com/ClickHouse/ClickHouse/pull/73477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `parseDateTime64` 関数（およびそのバリエーション）は、1970年以前 / 2106年以降の入力日時に対しても正しい結果を返すようになりました。例: `SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar))。
* ユーザーから指摘されていた `clickhouse-disks` の使い勝手に関するいくつかの問題を解消します。[#67136](https://github.com/ClickHouse/ClickHouse/issues/67136) をクローズ。[#73616](https://github.com/ClickHouse/ClickHouse/pull/73616)（[Daniil Ivanik](https://github.com/divanik)）。
* ストレージエンジン S3(Azure)Queue のコミット設定を変更できるようにしました（コミット設定は `max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit` です）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii))。
* storage S3(Azure)Queue において、ソース間の進捗を集約し、コミット制限設定と比較できるようにしました。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `BACKUP`/`RESTORE` クエリでコア設定をサポート。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* Parquet 出力において `output_format_compression_level` を考慮するようにしました。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos)).
* Apache Arrow の `fixed_size_list` 型をサポートされていない型として扱うのではなく、`Array` として読み込む機能を追加しました。 [#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers))。
* バックアップエンジンを 2 つ追加しました。`Memory`（現在のユーザーセッション内にバックアップを保持）と、テスト用の `Null`（どこにもバックアップを保持しない）です。 [#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar))。
* `concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_num_ratio_to_cores` はサーバーの再起動なしに変更できるようになりました。 [#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* `formatReadable` 関数で拡張数値型（`Decimal` および大きな整数型）をサポート。 [#73765](https://github.com/ClickHouse/ClickHouse/pull/73765) ([Raúl Marín](https://github.com/Algunenano))。
* Postgres ワイヤプロトコル互換のために TLS をサポート。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 関数 `isIPv4String` は、正しい IPv4 アドレスの後にゼロバイトが付いている場合に true を返していましたが、本来この場合は false を返すべきでした。 [#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) の継続対応です。 [#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL ワイヤープロトコルで返すエラーコードを MySQL と互換になるようにしました。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) の続きです。[#50957](https://github.com/ClickHouse/ClickHouse/issues/50957) をクローズしました。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 演算子 `IN` や `NOT IN` における列挙型リテラルを検証するための設定 `validate_enum_literals_in_opearators` を追加しました。この設定により、リテラルが対象の列挙型に対して有効な列挙値でない場合は例外をスローします。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Storage `S3(Azure)Queue` で、コミット設定で定義された1つのバッチ内のすべてのファイルを、1つの Keeper トランザクションでコミットするようにしました。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 実行可能な UDF およびディクショナリに対するヘッダー検出を無効化しました（Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1 という問題を引き起こす可能性があったため）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* `EXPLAIN PLAN` に `distributed` オプションを追加しました。これにより、`EXPLAIN distributed=1 ... ` は `ReadFromParallelRemote*` ステップにリモート側のプランを付加するようになりました。 [#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Dynamic 引数を取る not/xor で正しい戻り値型を使用するようにしました。 [#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル作成後に `add_implicit_sign_column_constraint_for_collapsing_engine` を変更できるようにしました。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm)).
* マテリアライズドビューの SELECT クエリでサブカラムのサポートを追加。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar)).
* `clickhouse-client` でカスタムプロンプトを設定するには、次の 3 つの簡単な方法があります。1. コマンドラインパラメータ `--prompt` を使用する、2. 設定ファイルで設定項目 `<prompt>[...]</prompt>` を使用する、3. 同じく設定ファイルで接続ごとの設定 `<connections_credentials><prompt>[...]</prompt></connection_credentials>` を使用する方法です。 [#74168](https://github.com/ClickHouse/ClickHouse/pull/74168)（[Christoph Wurm](https://github.com/cwurm)）。
* ClickHouse Client で、ポート 9440 への接続時に安全な接続を自動判別するようにしました。 [#74212](https://github.com/ClickHouse/ClickHouse/pull/74212) ([Christoph Wurm](https://github.com/cwurm)).
* http&#95;handlers でユーザー認証をユーザー名だけで行えるようにしました（以前はパスワードの入力も必要でした）。 [#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat)).
* 代替のクエリ言語である PRQL と KQL のサポートは、実験的機能としてマークされました。これらを使用するには、設定 `allow_experimental_prql_dialect = 1` および `allow_experimental_kusto_dialect = 1` を指定してください。[#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze)).
* さらに多くの集約関数でデフォルトの Enum 型を返せるようになりました。 [#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* `OPTIMIZE TABLE` で、既存のキーワード `FINAL` の代替としてキーワード `FORCE` を指定できるようになりました。 [#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze)).
* サーバーのシャットダウンに時間がかかりすぎる場合にアラートを発火させるために必要な `IsServerShuttingDown` メトリクスを追加しました。 [#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* EXPLAIN の出力に Iceberg テーブル名を追加しました。[#74485](https://github.com/ClickHouse/ClickHouse/pull/74485)（[alekseev-maksim](https://github.com/alekseev-maksim)）。
* 旧アナライザーで RECURSIVE CTE を使用した場合に、よりわかりやすいエラーメッセージを表示するよう改善しました。 [#74523](https://github.com/ClickHouse/ClickHouse/pull/74523) ([Raúl Marín](https://github.com/Algunenano)).
* `system.errors` に拡張エラーメッセージを表示します。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* clickhouse-keeper とクライアント間の通信でパスワードを使用できるようになりました。サーバーおよびクライアントに適切な SSL 設定を指定している場合、この機能はあまり有用ではありませんが、一部のケースでは依然として有用な場合があります。パスワードは 16 文字を超えることはできません。Keeper の認証モデルとは無関係です。 [#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin)).
* config リローダーにエラーコードを追加。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* MySQL および PostgreSQL のテーブル関数およびエンジンで IPv6 アドレスのサポートを追加しました。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme)).
* `divideDecimal` にショートサーキット最適化を実装し、[#74280](https://github.com/ClickHouse/ClickHouse/issues/74280) を修正。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* 起動スクリプト内でユーザーを指定できるようになりました。 [#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit)).
* Azure SAS トークンのサポートを追加。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).





#### バグ修正（公式安定版リリースにおけるユーザー可視の不具合）

* Parquet の圧縮レベルは、使用する圧縮コーデックが対応している場合にのみ設定します。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* 修飾子付きの照合ロケールを使用するとエラーが発生していたリグレッションを修正しました。例として、`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` は、現在は正常に動作するようになりました。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* keeper-client で SEQUENTIAL ノードを作成できなかった問題を修正。[#64177](https://github.com/ClickHouse/ClickHouse/pull/64177)（[Duc Canh Le](https://github.com/canhld94)）。
* `position` 系関数で発生していた文字数の誤カウントを修正。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* アクセスエンティティに対する `RESTORE` 操作では、未処理の部分的な権限の取り消しにより、本来必要以上の権限が要求されていました。この PR で問題を修正しました。[#71853](https://github.com/ClickHouse/ClickHouse/issues/71853) をクローズします。[#71958](https://github.com/ClickHouse/ClickHouse/pull/71958) ([pufit](https://github.com/pufit)).
* `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 実行後に一時停止が発生しないようにしました。バックグラウンドタスクのスケジューリング用の正しい設定を取得するようにしました。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 一部の入力および出力フォーマット（例: Parquet、Arrow）における空タプルの扱いを修正しました。 [#72616](https://github.com/ClickHouse/ClickHouse/pull/72616) ([Michael Kolupaev](https://github.com/al13n321))。
* ワイルドカードを含むデータベース／テーブルに対するカラムレベルの GRANT SELECT/INSERT 文は、エラーを返すようになりました。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan)).
* 対象のアクセスエンティティに暗黙的な権限付与が存在している場合に、ユーザーが `REVOKE ALL ON *.*` を実行できない状況を修正しました。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* formatDateTime スカラー関数の正のタイムゾーンのフォーマットを修正。[#73091](https://github.com/ClickHouse/ClickHouse/pull/73091)（[ollidraese](https://github.com/ollidraese)）。
* PROXYv1 経由で接続が行われ、`auth_use_forwarded_address` が設定されている場合に、送信元ポートを正しく反映するよう修正しました。以前はプロキシポートが誤って使用されていました。`currentQueryID()` 関数を追加しました。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* TCPHandler 内の NativeWriter にもフォーマット設定を伝播し、`output_format_native_write_json_as_string` のような設定が正しく適用されるようにしました。 [#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* StorageObjectStorageQueue で発生するクラッシュを修正。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* サーバーのシャットダウン中にリフレッシュ可能なマテリアライズドビューでまれに発生するクラッシュを修正。 [#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 関数 `formatDateTime` の `%f` プレースホルダは、サブ秒部の 6 桁を常に出力するようになりました。これにより、MySQL の `DATE_FORMAT` 関数と動作の互換性が保たれます。以前の動作は、設定 `formatdatetime_f_prints_scale_number_of_digits = 1` を使用することで復元できます。 [#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese))。
* `s3` ストレージおよびテーブル関数からの読み取り時における `_etag` 列でのフィルタリングを修正しました。 [#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 古いアナライザーを使用している場合に、`JOIN ON` 式内で `IN (subquery)` が使われたときに発生する `Not-ready Set is passed as the second argument for function 'in'` エラーを修正しました。 [#73382](https://github.com/ClickHouse/ClickHouse/pull/73382) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic カラムおよび JSON カラムに対する squashing の準備処理を修正。以前は、型/パスの上限に達していなくても、一部のケースで shared variant/shared data に新しい型が挿入されてしまうことがあった。 [#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar))。
* 型のバイナリデコード時に不正なサイズを検査し、過大なメモリ確保を避けるようにしました。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカが有効な状態で単一レプリカのクラスタから読み取る際の論理エラーを修正しました。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321))。
* ZooKeeper および旧 Keeper 使用時の ObjectStorageQueue の問題を修正。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* Hive パーティションをデフォルトで有効にするための修正を実装しました。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ベクトル類似インデックス作成時のデータレースを修正。[#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368))。
* 辞書のソースに誤ったデータを含む関数がある場合に発生するセグメンテーションフォールトを修正します。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* storage S3(Azure)Queue における挿入失敗時のリトライ処理を修正。 [#70951](https://github.com/ClickHouse/ClickHouse/issues/70951) をクローズ。 [#73546](https://github.com/ClickHouse/ClickHouse/pull/73546)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* タプル内に `LowCardinality` 要素を含み、かつ設定 `optimize_functions_to_subcolumns` が有効な場合に、特定の状況で発生する可能性があった関数 `tupleElement` のエラーを修正しました。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* 列挙型グロブの後にレンジが続く場合の構文解析を修正。[#73473](https://github.com/ClickHouse/ClickHouse/issues/73473) の問題を解決。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 非レプリケートテーブルに対するサブクエリ内で、非レプリケート MergeTree 用の固定値 `parallel_replicas_for_non_replicated_merge_tree` が無視されていた問題を修正しました。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* タスクをスケジュールできない場合に std::logical&#95;error がスローされる問題を修正。ストレステストで発見。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629) ([Alexander Gololobov](https://github.com/davenger)).
* 分散クエリに対して誤った処理段階が選択されることによる論理エラーを避けるため、`EXPLAIN SYNTAX` でクエリを解釈しないようにしました。 [#65205](https://github.com/ClickHouse/ClickHouse/issues/65205) を修正。 [#73634](https://github.com/ClickHouse/ClickHouse/pull/73634) ([Dmitry Novik](https://github.com/novikd))。
* Dynamic カラムで発生しうるデータ不整合を修正しました。`Nested columns sizes are inconsistent with local_discriminators column size` という論理エラーが発生する可能性のあった問題を修正しました。 [#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar)).
* `FINAL` と `SAMPLE` を含むクエリで発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。`CollapsingMergeTree` からの `FINAL` を伴う SELECT クエリで誤った結果が返される問題を修正し、`FINAL` の最適化を有効にしました。 [#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* LIMIT BY COLUMNS で発生していたクラッシュを修正。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano)).
* 通常のプロジェクションの使用が強制され、クエリが定義されたプロジェクションと完全に同一であるにもかかわらず、そのプロジェクションが選択されずにエラーが発生してしまうバグを修正しました。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* Dynamic/Object 構造体のデシリアライズ処理を修正しました。以前は CANNOT&#95;READ&#95;ALL&#95;DATA 例外が発生する可能性がありました。 [#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* バックアップからパーツを復元する際に `metadata_version.txt` をスキップするようにしました。[#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar)).
* LIKE 句を使用して Enum 型にキャストした際に発生するセグメンテーションフォールトを修正。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar))。
* S3 Express バケットがディスクとして動作しない問題を修正。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar))。
* CollapsingMergeTree テーブルで sign 列の値が不正な行もマージできるようにしました。 [#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm)).
* オフラインレプリカに対して DDL を実行した際に発生するエラーを修正しました。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach)).
* ネストされたタプルに対して明示的な名前（&#39;keys&#39;,&#39;values&#39;）を持たない `Map` を作成できることが原因で、`map()` 型の比較がときどき失敗する問題を修正しました。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `GROUP BY ALL` 句の解決時にウィンドウ関数を無視するようにしました。[#73501](https://github.com/ClickHouse/ClickHouse/issues/73501) を修正。[#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 暗黙的な権限の扱いを修正（以前はワイルドカードとして動作していた）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* ネストされた Maps の作成時に発生する高いメモリ使用量を修正。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar)).
* 空のキーを含むネストされた JSON のパースを修正。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar))。
* 修正: あるエイリアスが別のエイリアスから参照され、逆順で選択されている場合に、そのエイリアスが projection に追加されない場合がある問題を修正。 [#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Azure 環境での plain&#95;rewritable ディスク初期化時に発生する &quot;object not found&quot; エラーを無視するようにしました。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* enum 型および空テーブルに対する `any` と `anyLast` の挙動を修正。 [#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* ユーザーが Kafka テーブルエンジンでキーワード引数を指定した場合の不具合を修正します。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Storage `S3Queue` の設定を、プレフィックス &quot;s3queue&#95;&quot; の有無を切り替える際の不具合を修正。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定 `allow_push_predicate_ast_for_distributed_subqueries` を追加しました。これにより、アナライザーを用いた分散クエリで AST ベースの述語プッシュダウンが有効になります。これは、クエリプランのシリアライズに対応した分散クエリがサポートされるまでの一時的なソリューションです。 [#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718) をクローズします。 [#74085](https://github.com/ClickHouse/ClickHouse/pull/74085) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) の後、`forwarded_for` フィールドにポート番号が含まれる場合があり、その結果、ポート付きのホスト名を解決できなくなる不具合を修正しました。[#74116](https://github.com/ClickHouse/ClickHouse/pull/74116)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` の不正な書式を修正しました。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991)).
* 問題 [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112) に対する修正。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `CREATE TABLE` で `Loop` をテーブルエンジンとして使用することは、できなくなりました。この組み合わせは以前、セグメンテーションフォールトの原因となっていました。 [#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* PostgreSQL および SQLite の table 関数における SQL インジェクションの脆弱性を修正しました。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 圧縮された Memory エンジンテーブルからサブカラムを読み取る際にクラッシュする問題を修正。[#74009](https://github.com/ClickHouse/ClickHouse/issues/74009) に対応。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* system.detached&#95;tables へのクエリで発生していた無限ループを修正しました。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov))。
* s3queue でファイルを失敗としてマークする際の論理エラーを修正。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ベースバックアップからの `RESTORE` 時のネイティブコピー設定（`allow_s3_native_copy`/`allow_azure_native_copy`）を修正しました。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* データベース内の切り離されたテーブルの数が max&#95;block&#95;size の倍数になっている場合に発生していた問題を修正しました。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* ソースと宛先でクレデンシャルが異なる場合の ObjectStorage（S3 など）経由のコピー処理を修正。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* GCS 上のネイティブコピーにおける「JSON API で Rewrite メソッドを使用する」動作の検出を修正。 [#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat)).
* `BackgroundMergesAndMutationsPoolSize` の誤った計算を修正（実際の値の 2 倍になってしまっていた）。 [#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin))。
* Cluster Discovery 有効時に Keeper の watch がリークする不具合を修正。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* UBSan により報告されたメモリアラインメント問題を修正 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。 [#74534](https://github.com/ClickHouse/ClickHouse/pull/74534) ([Arthur Passos](https://github.com/arthurpassos))。
* テーブル作成中の KeeperMap の同時実行クリーンアップ処理を修正しました。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368)).
* 正しいクエリ結果を維持するため、`EXCEPT` または `INTERSECT` が存在する場合は、サブクエリ内の未使用の投影列を削除しないようにしました。[#73930](https://github.com/ClickHouse/ClickHouse/issues/73930) を修正。[#66465](https://github.com/ClickHouse/ClickHouse/issues/66465) を修正。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* `Tuple` 列を含み、スパースシリアライゼーションが有効なテーブル間での `INSERT SELECT` クエリを修正しました。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 関数 `right` が const 値の負のオフセットを指定した場合に正しく動作しませんでした。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik)).
* クライアント側での誤った伸長処理が原因で gzip 圧縮されたデータの挿入が失敗することがある問題を修正。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* ワイルドカードを含む権限付与に対する部分的な取り消しにより、想定以上の権限が削除されてしまう可能性がありました。 [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263) をクローズしました。 [#74751](https://github.com/ClickHouse/ClickHouse/pull/74751) ([pufit](https://github.com/pufit)).
* Keeper の修正: ディスクからログエントリを読み取る処理の不具合を修正。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* SYSTEM REFRESH/START/STOP VIEW に対する権限チェックを修正しました。特定のビューに対するクエリを実行する際に、`*.*` への権限を持つ必要はなくなり、そのビューに対する権限だけがあればよくなりました。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `hasColumnInTable` 関数はエイリアスカラムを考慮していません。エイリアスカラムでも動作するように修正しました。 [#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* Azure Blob Storage 上で、空のカラムを含むテーブルのデータパーツをマージする際に発生していた FILE&#95;DOESNT&#95;EXIST エラーを修正。 [#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 一時テーブルとの結合時のプロジェクション列名を修正し、[#68872](https://github.com/ClickHouse/ClickHouse/issues/68872) をクローズ。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。



#### ビルド／テスト／パッケージングの改善
* ユニバーサルインストールスクリプトが、macOS 上でもインストールを提案するようになりました。 [#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
