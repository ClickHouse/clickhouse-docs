---
description: '2025年の変更履歴'
note: "このファイルは yarn build によって生成されたものです"
slug: /whats-new/changelog/
sidebar_position: 2
sidebar_label: '2025'
title: '2025年の変更履歴'
doc_type: 'changelog'
---

### 目次 {#table-of-contents}

**[ClickHouse リリース v25.11, 2025-11-27](#2511)**<br/>
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

### ClickHouse リリース 25.11、2025-11-27 {#2511}

#### 後方非互換な変更 {#backward-incompatible-change}

* 非推奨の `Object` 型を削除しました。 [#85718](https://github.com/ClickHouse/ClickHouse/pull/85718) ([Pavel Kruglov](https://github.com/Avogar)).
* 非推奨となっていた `LIVE VIEW` 機能を削除しました。`LIVE VIEW` を使用している場合、この新しいバージョンにはアップグレードできません。[#88706](https://github.com/ClickHouse/ClickHouse/pull/88706) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 以前のバージョンでは、`Geometry` 型は `String` 型のエイリアスでしたが、現在はフル機能を備えた独立した型になりました。 [#83344](https://github.com/ClickHouse/ClickHouse/pull/83344) ([scanhex12](https://github.com/scanhex12))。
* MergeTree テーブルの Wide 形式データパートにおける `Variant` 型サブカラム用に作成されるファイル名をエスケープします。この変更により、Variant/Dynamic/JSON データ型を含む既存テーブルとの互換性が失われます。この変更は、Variant 内に特殊文字を含む型（`\` を含む特定のタイムゾーン付き DateTime など）を保存できない問題を修正します。エスケープは、MergeTree 設定 `escape_variant_subcolumn_filenames` を変更することで無効化できます（互換性を維持するには、MergeTree の設定でこの設定を無効にするか、アップグレード前のバージョンに合わせて `compatibility` 設定を指定してください）。[#69590](https://github.com/ClickHouse/ClickHouse/issues/69590) を解決します。[#87300](https://github.com/ClickHouse/ClickHouse/pull/87300)（[Pavel Kruglov](https://github.com/Avogar)）。
* `String` データ型に対して、デフォルトで `with_size_stream` シリアル化フォーマットを有効にします。この変更自体は後方互換性がありますが、新しいシリアル化フォーマットはバージョン 25.10 以降でのみサポートされるため、25.10 より前のバージョンへはダウングレードできなくなります。25.9 以前へのダウングレードを可能な状態に保ちたい場合は、サーバー構成の `merge_tree` セクションで、`serialization_info_version` を `basic` に、`string_serialization_version` を `single_stream` に設定してください。 [#89329](https://github.com/ClickHouse/ClickHouse/pull/89329) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* HTTP レスポンスの結果に対する例外のタグ付けをサポートし、クライアントが例外をより確実にパースできるようにしました。[#75175](https://github.com/ClickHouse/ClickHouse/issues/75175) を解決します。設定 `http_write_exception_in_output_format` は、フォーマット間の一貫性を保つためデフォルトでは無効になっています。[#88818](https://github.com/ClickHouse/ClickHouse/pull/88818)（[Kaviraj Kanagaraj](https://github.com/kavirajk)）。既存の挙動を壊すことは想定していません（最悪の場合でも、例外メッセージに妙な文字列が追加されるだけです）が、それでも注意喚起のためにチェンジログのカテゴリとして「Backward Incompatible Change」を使用しておくのが妥当です（どのようなやっつけスクリプトが例外メッセージをパースしているか分からないためです）。
* 共有オブジェクトストレージパス上に複数の `plain-rewritable` ディスクを作成することを禁止しました。これは、異なるメタデータストレージトランザクションの衝突時に未定義の動作を引き起こす可能性があるためです。[#89038](https://github.com/ClickHouse/ClickHouse/pull/89038) ([Mikhail Artemenko](https://github.com/Michicosun))。
* Kafka storage の SASL 設定の適用順序を修正しました。CREATE TABLE 文で指定されたテーブルレベルの SASL 設定が、構成ファイルのコンシューマ／プロデューサ固有の設定を正しく上書きするようになりました。 [#89401](https://github.com/ClickHouse/ClickHouse/pull/89401) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* タイムゾーンなしの Parquet タイムスタンプ (isAdjustedToUTC=false) は、これまでの DateTime64(...) ではなく、DateTime64(..., 'UTC') として読み込まれるようになりました。この変更により、そのような UTC タイムスタンプを文字列に変換した際に、正しいローカル時刻の表現が得られるため、以前の挙動よりも誤りが少なくなります。従来の動作に戻すには `input_format_parquet_local_time_as_utc = 0` を使用してください。 [#87469](https://github.com/ClickHouse/ClickHouse/issues/87469) を解決。 [#87872](https://github.com/ClickHouse/ClickHouse/pull/87872)（[Michael Kolupaev](https://github.com/al13n321)）。
* `T64` コーデックに対する小さな改善として、これまでバグを引き起こしていた、圧縮要素サイズに揃っていないデータ型を受け付けないようになりました。 [#89282](https://github.com/ClickHouse/ClickHouse/issues/89282) を解決しました。 [#89432](https://github.com/ClickHouse/ClickHouse/pull/89432) ([yanglongwei](https://github.com/ylw510))。

#### 新機能 {#new-feature}

* `Geometry` 型を導入しました。この型に対して `WKB` および `WKT` フォーマットの読み取りをサポートしました。以前のバージョンでは、`Geometry` 型は `String` へのエイリアスでしたが、現在は完全な機能を備えた型になりました。 [#83344](https://github.com/ClickHouse/ClickHouse/pull/83344) ([scanhex12](https://github.com/scanhex12)).
* ユーザーのインパーソネーションをサポートするために、新しい SQL 文 `EXECUTE AS` を追加しました。[#39048](https://github.com/ClickHouse/ClickHouse/issues/39048) を解決します。[#70775](https://github.com/ClickHouse/ClickHouse/pull/70775)（[Shankar](https://github.com/shiyer7474)）。
* n-gram ベースの Naive Bayes を用いてテキストを分類する `naiveBayesClassifier` 関数を追加。 [#88677](https://github.com/ClickHouse/ClickHouse/pull/88677) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* テーブルの一部を選択できるよう、`LIMIT` および `OFFSET` で小数を指定できるようにしました。 [#81892](https://github.com/ClickHouse/ClickHouse/issues/81892) をクローズしました。 [#88755](https://github.com/ClickHouse/ClickHouse/pull/88755)（[Ahmed Gouda](https://github.com/0xgouda)）。
* Microsoft OneLake カタログ用の ClickHouse サブシステム。 [#89366](https://github.com/ClickHouse/ClickHouse/pull/89366) ([scanhex12](https://github.com/scanhex12)).
* 配列内の指定した次元数を展開し、Tuple カラム内のポインタを入れ替える `flipCoordinates` 関数を追加しました。[#79469](https://github.com/ClickHouse/ClickHouse/issues/79469) を解決します。[#79634](https://github.com/ClickHouse/ClickHouse/pull/79634)（[Sachin Kumar Singh](https://github.com/sachinkumarsingh092)）。
* Unicode 文字とそのプロパティの一覧を含む `system.unicode` テーブルを追加。[#80055](https://github.com/ClickHouse/ClickHouse/issues/80055) をクローズ。[#80857](https://github.com/ClickHouse/ClickHouse/pull/80857)（[wxybear](https://github.com/wxybear)）。
* 新しい MergeTree の設定 `merge_max_dynamic_subcolumns_in_wide_part` を追加し、データ型で指定されたパラメータに関係なく、マージ後の Wide パートにおける動的サブカラム数を制限できるようにしました。 [#87646](https://github.com/ClickHouse/ClickHouse/pull/87646) ([Pavel Kruglov](https://github.com/Avogar)).
* `cume_dist` ウィンドウ関数のサポートを追加しました。[#86920](https://github.com/ClickHouse/ClickHouse/issues/86920) を修正しました。[#88102](https://github.com/ClickHouse/ClickHouse/pull/88102)（[Manuel](https://github.com/raimannma)）。
* テキストインデックスの構築時に、新たな引数 `preprocessor` を指定できるようになりました。この引数には、トークン化の前に各ドキュメントを変換する任意の式を指定できます。 [#88272](https://github.com/ClickHouse/ClickHouse/pull/88272)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `X-ClickHouse-Progress` と `X-ClickHouse-Summary` に `memory_usage` フィールドを追加しました。これにより、クエリのメモリ使用量をクライアント側でリアルタイムに収集できます。 [#88393](https://github.com/ClickHouse/ClickHouse/pull/88393) ([Christoph Wurm](https://github.com/cwurm)).
* `INTO OUTFILE` で出力先パスのディレクトリが存在しない場合でもエラーにならないよう、親ディレクトリを自動作成する設定 `into_outfile_create_parent_directories` を追加しました。これにより、クエリがネストしたディレクトリに結果を書き出すワークフローを簡素化できます。 [#88610](https://github.com/ClickHouse/ClickHouse/issues/88610) を解決しました。 [#88795](https://github.com/ClickHouse/ClickHouse/pull/88795) ([Saksham](https://github.com/Saksham10-11)).
* 一時テーブルに対する `CREATE OR REPLACE` 構文をサポートしました。[#35888](https://github.com/ClickHouse/ClickHouse/issues/35888) をクローズしました。[#89450](https://github.com/ClickHouse/ClickHouse/pull/89450)（[Aleksandr Musorin](https://github.com/AVMusorin)）。
* 配列 `arr` から `elem` と等しいすべての要素を削除するための `arrayRemove` のサポートを追加しました。これは Postgres との互換性を保つためにのみ必要なものであり、ClickHouse にはすでに、はるかに強力な `arrayFilter` 関数があります。[#52099](https://github.com/ClickHouse/ClickHouse/issues/52099) を解決しました。[#89585](https://github.com/ClickHouse/ClickHouse/pull/89585)（[tiwarysaurav](https://github.com/tiwarysaurav)）。
* 平均値を計算する `midpoint` スカラー関数を導入しました。[#89029](https://github.com/ClickHouse/ClickHouse/issues/89029) を解決しました。[#89679](https://github.com/ClickHouse/ClickHouse/pull/89679)（[simonmichal](https://github.com/simonmichal)）。
* Web UI にダウンロードボタンが追加されました。UI 上で結果の一部しか表示されていない場合でも、結果全体をダウンロードできます。 [#89768](https://github.com/ClickHouse/ClickHouse/pull/89768) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コマンド形式のディスクリプタを必要とする Dremio およびその他の Arrow Flight サーバーをサポートするために、`arrow_flight_request_descriptor_type` 設定を追加しました。[#89523](https://github.com/ClickHouse/ClickHouse/issues/89523) を実装。[#89826](https://github.com/ClickHouse/ClickHouse/pull/89826)（[Shreyas Ganesh](https://github.com/shreyasganesh0)）。
* 引数とそれに対応する極値を返す新しい集約関数 `argAndMin` および `argAndMax` を追加しました。以前のバージョンでも、引数としてタプルを使用することで同様のことが可能でした。 [#89884](https://github.com/ClickHouse/ClickHouse/pull/89884) ([AbdAlRahman Gad](https://github.com/AbdAlRahmanGad))。
* Parquet チェックサムの書き込みおよび検証のための設定。[#79012](https://github.com/ClickHouse/ClickHouse/pull/79012) ([Michael Kolupaev](https://github.com/al13n321)).
* Kafka テーブルエンジンに `kafka_schema_registry_skip_bytes` 設定を追加し、メッセージペイロードをパースする前にエンベロープヘッダーのバイト（例: AWS Glue Schema Registry の 19 バイトプレフィックス）をスキップできるようにしました。これにより、メタデータヘッダーを付加するスキーマレジストリからのメッセージを ClickHouse が取り込めるようになります。 [#89621](https://github.com/ClickHouse/ClickHouse/pull/89621) ([Taras Polishchuk](https://github.com/wake-up-neo)).
* ジオメトリを h3 の六角形で埋めることができる `h3PolygonToCells` 関数を追加しました。[#33991](https://github.com/ClickHouse/ClickHouse/issues/33991) を解決します。[#66262](https://github.com/ClickHouse/ClickHouse/pull/66262)（[Zacharias Knudsen](https://github.com/zachasme)）。
* S3 内の BLOB に関連付けられているすべてのタグを含む新しい仮想カラム `_tags`（`Map(String, String)`）を追加しました（注: BLOB にタグが付与されていない場合は、追加のリクエストは行われません）。 [#72945](https://github.com/ClickHouse/ClickHouse/issues/72945) を解決しました。[#77773](https://github.com/ClickHouse/ClickHouse/pull/77773)（[Zicong Qu](https://github.com/zicongleoqu)）。

#### 実験的機能 {#experimental-feature}

* Let's Encrypt などの ACME プロバイダからの TLS 証明書取得をサポートしました（[RFC 8555](https://datatracker.ietf.org/doc/html/rfc8555)）。これにより、分散クラスタでの TLS の自動構成が可能になります。[#66315](https://github.com/ClickHouse/ClickHouse/pull/66315)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Prometheus HTTP Query API の一部をサポートしました。有効化するには、設定ファイルの `<prometheus>` セクションに `query_api` 型のルールを追加します。サポートされるハンドラは `/api/v1/query_range` と `/api/v1/query` です。[#86132](https://github.com/ClickHouse/ClickHouse/pull/86132)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* フルテキスト検索は、これまでの実験的段階からベータ段階へ移行しました。[#88928](https://github.com/ClickHouse/ClickHouse/pull/88928)（[Robert Schulze](https://github.com/rschu1ze)）。
* `Alias` を実験的機能として扱うよう変更しました。`allow_experimental_alias_table_engine = 1` を設定することで有効化できます。[#89712](https://github.com/ClickHouse/ClickHouse/pull/89712)（[Kai Zhu](https://github.com/nauu)）。

#### パフォーマンスの向上 {#performance-improvement}

* Parquet リーダー v3 はデフォルトで有効です。 [#88827](https://github.com/ClickHouse/ClickHouse/pull/88827) ([Michael Kolupaev](https://github.com/al13n321))。
* 分散実行: タスクをファイル単位ではなく行グループIDごとに分割するように改善。 [#87508](https://github.com/ClickHouse/ClickHouse/pull/87508) ([scanhex12](https://github.com/scanhex12)).
* `RIGHT` および `FULL` JOIN は、現在 ConcurrentHashJoin を使用するようになりました。これにより、これらの種類の JOIN はより高い並列度で実行されます。さまざまなケースで RIGHT および FULL JOIN のパフォーマンスが最大 2 倍まで向上します。[#78027](https://github.com/ClickHouse/ClickHouse/issues/78027) を解決しました。[#78462](https://github.com/ClickHouse/ClickHouse/pull/78462)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* クエリ内の定数式における大きな値の処理を最適化。[#72880](https://github.com/ClickHouse/ClickHouse/issues/72880) をクローズ。[#81104](https://github.com/ClickHouse/ClickHouse/pull/81104)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* 1万以上のパーツを持つテーブルで大規模なパーティションプルーニングを行う場合、`SELECT` クエリが最大8倍高速に。 [#85535](https://github.com/ClickHouse/ClickHouse/pull/85535) ([James Morrison](https://github.com/jawm))。
* クエリが固定ハッシュマップを使って集約状態を保持する場合（小さな整数での GROUP BY）、ClickHouse はクエリを高速化するために、その集約状態を並列にマージするようになりました。 [#87366](https://github.com/ClickHouse/ClickHouse/pull/87366) ([Jianfei Hu](https://github.com/incfly)).
* `_part_offset` を SELECT し、異なる ORDER BY を使用するプロジェクションをセカンダリインデックスとして利用できるようにします。有効にすると、特定のクエリ述語を用いてプロジェクションパーツから読み取り、PREWHERE ステージ中に行を効率的にフィルタリングするためのビットマップを生成できます。これは、[#80343](https://github.com/ClickHouse/ClickHouse/issues/80343) に続く、プロジェクションインデックスを実装するための 3 番目のステップです。[#81021](https://github.com/ClickHouse/ClickHouse/pull/81021)（[Amos Bird](https://github.com/amosbird)）。
* まれな Aarch64 システムおよびその他のアーキテクチャ/カーネルの組み合わせで発生しうる問題に対して VDSO を修正しました。 [#86096](https://github.com/ClickHouse/ClickHouse/pull/86096) ([Tomas Hulata](https://github.com/tombokombo)).
* コードを簡素化し、[選択アルゴリズム](https://clickhouse.com/blog/lz4-compression-in-clickhouse#how-to-choose-the-best-algorithm)を調整することで、LZ4 の伸長処理の速度を向上させました。 [#88360](https://github.com/ClickHouse/ClickHouse/pull/88360) ([Raúl Marín](https://github.com/Algunenano)).
* S3 は内部的にオブジェクトをキー名プレフィックスに基づいてパーティション分割し、パーティションごとの高いリクエストレートに自動的に対応できるようスケールします。この変更により、2 つの新しい BACKUP 設定 `data_file_name_generator` と `data_file_name_prefix_length` が導入されました。`data_file_name_generator=checksum` の場合、バックアップデータファイルは内容のハッシュ値に基づいて命名されます。例: `checksum = abcd1234ef567890abcd1234ef567890` かつ `data_file_name_prefix_length = 3` のとき、生成されるパスは `abc/d1234ef567890abcd1234ef567890` になります。このようなキーの分布により、S3 パーティション間での負荷分散が強化され、スロットリングのリスクが低減されます。 [#88418](https://github.com/ClickHouse/ClickHouse/pull/88418) ([Julia Kartseva](https://github.com/jkartseva))。
* 辞書ブロックをキャッシュし、トークン検索においてバイナリ検索の代わりにハッシュテーブルを使用することで、テキストインデックスのパフォーマンスを改善しました。 [#88786](https://github.com/ClickHouse/ClickHouse/pull/88786) ([Elmi Ahmadov](https://github.com/ahmadov)).
* クエリで `optimize_read_in_order` と `query_plan_optimize_lazy_materialization` を同時に利用できるようになりました。これにより [#88767](https://github.com/ClickHouse/ClickHouse/issues/88767) が解消されました。[#88866](https://github.com/ClickHouse/ClickHouse/pull/88866)（[Manuel](https://github.com/raimannma)）。
* `DISTINCT` を含むクエリに対して集約プロジェクションを使用するようにしました。 [#86925](https://github.com/ClickHouse/ClickHouse/issues/86925) をクローズしました。 [#88894](https://github.com/ClickHouse/ClickHouse/pull/88894) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* 連続実行時のパフォーマンスを向上させるため、posting lists をキャッシュするようにしました。 [#88912](https://github.com/ClickHouse/ClickHouse/pull/88912) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 入力データのソート順が LIMIT BY キーと一致する場合に、ストリーミング LIMIT BY トランスフォームを実行するようになりました。 [#88969](https://github.com/ClickHouse/ClickHouse/pull/88969) ([Eduard Karacharov](https://github.com/korowa)).
* 一部のケースにおいて `ANY LEFT JOIN` または `ANY RIGHT JOIN` を `ALL INNER JOIN` に書き換えできるようになりました。 [#89403](https://github.com/ClickHouse/ClickHouse/pull/89403) ([Dmitry Novik](https://github.com/novikd)).
* ログのオーバーヘッドを削減：エントリあたりのアトミック操作の回数を減らしました。 [#89651](https://github.com/ClickHouse/ClickHouse/pull/89651) ([Sergei Trifonov](https://github.com/serxa)).
* 複数の `JOIN` を含むクエリでランタイムフィルターが有効な場合に、複数のランタイムフィルターが追加されたときは、新しく追加されたフィルターステップを他のステップより優先してプッシュダウンするように実装しました。 [#89725](https://github.com/ClickHouse/ClickHouse/pull/89725) ([Alexander Gololobov](https://github.com/davenger)).
* ハッシュテーブルのマージ処理に伴うオーバーヘッドを削減することで、一部の `uniqExact` の処理をわずかに高速化しました。 [#89727](https://github.com/ClickHouse/ClickHouse/pull/89727) ([Raúl Marín](https://github.com/Algunenano)).
* レイジーマテリアライゼーションで処理される行数の上限を 10 から 100 に引き上げました。 [#89772](https://github.com/ClickHouse/ClickHouse/pull/89772) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `allow_special_serialization_kinds_in_output_formats` をデフォルトで有効にしました。これによりメモリ使用量が減少し、一部の行形式の出力フォーマットにおける Sparse/Replicated カラムの出力クエリ速度が向上します。 [#89402](https://github.com/ClickHouse/ClickHouse/pull/89402) ([Pavel Kruglov](https://github.com/Avogar)).
* `ALTER TABLE ... FREEZE` クエリに並列処理を追加しました。 [#71743](https://github.com/ClickHouse/ClickHouse/pull/71743) ([Kirill](https://github.com/kirillgarbar)).
* bcrypt 認証にキャッシュを追加。 [#87115](https://github.com/ClickHouse/ClickHouse/pull/87115) ([Nikolay Degterinsky](https://github.com/evillique)).
* `FINAL` クエリで使用されるスキップインデックスがプライマリキーを構成するカラム上にある場合、他のパーツでプライマリキーとの交差を確認する追加ステップは不要となり、実行されなくなりました。これにより [#85897](https://github.com/ClickHouse/ClickHouse/issues/85897) が解決されました。[#88368](https://github.com/ClickHouse/ClickHouse/pull/88368)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* 最適化設定 `enable_lazy_columns_replication` がデフォルトになり、JOIN におけるメモリ使用量が削減されます。 [#89316](https://github.com/ClickHouse/ClickHouse/pull/89316) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* パーツ向けに `ColumnsDescription` のテーブル単位キャッシュを導入し、多数のパーツや多数のカラムを含むテーブルでのメモリ使用量を削減しました。 [#89352](https://github.com/ClickHouse/ClickHouse/pull/89352) ([Azat Khuzhin](https://github.com/azat)).
* テキストインデックスのデシリアライズ済みヘッダー用キャッシュを導入し、I/O を削減してクエリのパフォーマンスを向上しました。キャッシュは次の新しいサーバー設定で構成できます: - `text_index_header_cache_policy` - `text_index_header_cache_size` - `text_index_header_cache_max_entries` - `text_index_header_cache_size_ratio`。 [#89513](https://github.com/ClickHouse/ClickHouse/pull/89513) ([Elmi Ahmadov](https://github.com/ahmadov))。

#### 改善点 {#improvement}

* `use_variant_as_common_type` が設定されている場合、UNION は必要に応じて型を `Variant` で統一する必要があります。[#82772](https://github.com/ClickHouse/ClickHouse/issues/82772) を解決します。[#83246](https://github.com/ClickHouse/ClickHouse/pull/83246)（[Mithun p](https://github.com/mithunputhusseri)）。
* SQL で定義したロールを、`users.xml` で定義されたユーザーに付与できるようになりました。 [#88139](https://github.com/ClickHouse/ClickHouse/pull/88139) ([c-end](https://github.com/c-end)).
* 内部クエリ（辞書、リフレッシュ可能なマテリアライズドビューなどによって内部的に実行されるもの）をログに記録するようにし、新しい `is_internal` 列を `system.query_log` に追加しました。 [#83277](https://github.com/ClickHouse/ClickHouse/pull/83277) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `IS NOT DISTINCT FROM` (`<=>`) 演算子を拡張しました。逆の `IS DISTINCT FROM` をサポートし、互換性のある異なる型の数値オペランド（例: `Nullable(UInt32)` と `Nullable(Int64)`）同士もサポートします。[#86763](https://github.com/ClickHouse/ClickHouse/issues/86763) を解決します。[#87581](https://github.com/ClickHouse/ClickHouse/pull/87581) ([yanglongwei](https://github.com/ylw510))。
* `clickhouse-client` と `clickhouse-local` のインタラクティブモードでは、現在カーソルがある識別子と同じ名前の識別子がコマンドライン上でハイライト表示されるようになりました。 [#89689](https://github.com/ClickHouse/ClickHouse/pull/89689) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 出力フォーマット関連の設定は、クエリキャッシュには影響しなくなりました。また、クエリキャッシュは `http_response_headers` 設定を無視するようになりました。これは、Web UI でキャッシュからクエリ結果をダウンロードするといった機能を実装できるようにするためです。 [#89756](https://github.com/ClickHouse/ClickHouse/pull/89756) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* クエリ結果キャッシュが使用されている場合、HTTP インターフェイスは `Age` および `Expires` ヘッダーを返します。`Age` ヘッダーの有無によって結果がキャッシュから取得されたものかどうかが分かり、`Expires` は最初の書き込み時に設定されます。新しいプロファイルイベントを追加しました: `QueryCacheAgeSeconds`, `QueryCacheReadRows`, `QueryCacheReadBytes`, `QueryCacheWrittenRows`, `QueryCacheWrittenBytes`。 [#89759](https://github.com/ClickHouse/ClickHouse/pull/89759) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `disable_insertion_and_mutation` を有効にしている場合（ClickHouse Cloud の読み取り専用ウェアハウスであることを意味します）でも、リモートテーブルおよびデータレイクテーブルへの挿入を許可しました。 [#88549](https://github.com/ClickHouse/ClickHouse/pull/88549) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリ `SYSTEM DROP TEXT INDEX CACHES` を追加しました。 [#90287](https://github.com/ClickHouse/ClickHouse/pull/90287) ([Anton Popov](https://github.com/CurtizJ)).
* より良い一貫性を保証するため、`enable_shared_storage_snapshot_in_query` をデフォルトで有効化しました。欠点はない想定です。 [#82634](https://github.com/ClickHouse/ClickHouse/pull/82634) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `send_profile_events` 設定を追加しました。この設定により、クライアントはプロファイルイベントを使用しない場合にネットワークトラフィックを削減できます。 [#89588](https://github.com/ClickHouse/ClickHouse/pull/89588) ([Kaviraj Kanagaraj](https://github.com/kavirajk))。
* クエリごとに近接セグメントのバックグラウンドダウンロードを無効化できるようにしました。 [#89524](https://github.com/ClickHouse/ClickHouse/issues/89524) を修正しました。 [#89668](https://github.com/ClickHouse/ClickHouse/pull/89668)（[tanner-bruce](https://github.com/tanner-bruce)）。
* レプリケーテッド MergeTree テーブルで壊れたディスクがある場合でも `FETCH PARTITION` を実行できるようになりました。 [#58663](https://github.com/ClickHouse/ClickHouse/pull/58663) ([Duc Canh Le](https://github.com/canhld94)).
* MySQL データベースエンジンにおいて MySQL テーブルスキーマを取得する際に発生していた捕捉されない例外を修正。 [#69358](https://github.com/ClickHouse/ClickHouse/pull/69358) ([Duc Canh Le](https://github.com/canhld94)).
* すべての DDL `ON CLUSTER` クエリは、アクセス権限の検証をより適切に行うため、元のクエリのユーザーコンテキストで実行されるようになりました。 [#71334](https://github.com/ClickHouse/ClickHouse/pull/71334) ([pufit](https://github.com/pufit)).
* `Parquet` における `UUID` のサポートを、論理型 `UUID` を持つ `FixedString(16)` で表現されている場合に追加しました。 [#74484](https://github.com/ClickHouse/ClickHouse/pull/74484) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* サーバー以外のバイナリでは、ThreadFuzzer をデフォルトで無効化しました。 [#89115](https://github.com/ClickHouse/ClickHouse/pull/89115) ([Raúl Marín](https://github.com/Algunenano)).
* 相関サブクエリの入力サブプランのマテリアライズを遅延させることで、そのサブプランにもクエリプランの最適化が反映されるようにしました。 [#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。 [#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* `clickhouse-client` では、`SELECT` を伴う `CREATE OR REPLACE TABLE` クエリに対して、進捗バー、ログ、およびパフォーマンス統計を確認できるようになりました。このクエリは、`SELECT` の実行に時間がかかる場合でもタイムアウトを引き起こすことはなくなりました。これにより [#38416](https://github.com/ClickHouse/ClickHouse/issues/38416) が解決されました。 [#87247](https://github.com/ClickHouse/ClickHouse/pull/87247) ([Diskein](https://github.com/Diskein))。
* ハッシュ関数が `JSON` 型および `Dynamic` 型をサポートするようになりました。[#87734](https://github.com/ClickHouse/ClickHouse/issues/87734) が解決されました。[#87791](https://github.com/ClickHouse/ClickHouse/pull/87791)（[Pavel Kruglov](https://github.com/Avogar)）。
* ArrowFlight サーバーの未実装部分を実装。 [#88013](https://github.com/ClickHouse/ClickHouse/pull/88013) ([Vitaly Baranov](https://github.com/vitlibar)).
* サーバーおよび keeper 向けに複数のヒストグラム型メトリクスを追加し、keeper リクエストの実行各段階の所要時間を計測できるようにします。サーバーには次のメトリクスが追加されます: `keeper_client_queue_duration_milliseconds`, `keeper_client_send_duration_milliseconds`, `keeper_client_roundtrip_duration_milliseconds`。keeper には次のメトリクスが追加されます: `keeper_server_preprocess_request_duration_milliseconds`, `keeper_server_process_request_duration_milliseconds`, `keeper_server_queue_duration_milliseconds`, `keeper_server_send_duration_milliseconds`。[#88158](https://github.com/ClickHouse/ClickHouse/pull/88158) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `EXPLAIN` クエリに `input_headers` オプションを追加し、ステップに入力ヘッダーを含められるようにしました。 [#88311](https://github.com/ClickHouse/ClickHouse/pull/88311) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* スロットリングにより遅延された S3 および AzureBlobStorage リクエストの数をカウントするためのプロファイルイベントを追加しました。ディスク関連と非ディスク関連の ThrottlerCount プロファイルイベントの不整合を修正しました。これにより、AzureBlobStorage への HTTP DELETE リクエストはスロットリングされなくなりました。 [#88535](https://github.com/ClickHouse/ClickHouse/pull/88535) ([Sergei Trifonov](https://github.com/serxa))。
* テーブルレベルの統計情報をキャッシュできるようにし、2 つの設定を追加しました。MergeTree の設定 `refresh_statistics_interval` は統計情報キャッシュを更新する間隔を指定し、0 の場合はキャッシュは作成されません。セッション設定 `use_statistics_cache` は、クエリでテーブルレベルの統計情報キャッシュを使用するかどうかを指定します。より良い統計情報が必要な場合には、このキャッシュを無視して（キャッシュを使わずに）実行することを選択できます。 [#88670](https://github.com/ClickHouse/ClickHouse/pull/88670) ([Han Fei](https://github.com/hanfei1991)).
* `Array` および `Map` のバイナリデシリアライズ処理を修正し、サイズ制限の検証時に `max_binary_string_size` ではなく `max_binary_array_size` 設定を使用するようにしました。これにより、`RowBinary` 形式を読み込む際に適切な制限が適用されるようになりました。 [#88744](https://github.com/ClickHouse/ClickHouse/pull/88744) ([Raufs Dunamalijevs](https://github.com/rienath)).
* マージを実行するバックグラウンドプールで使用するための `LockGuardWithStopWatch` クラスを導入しました。ミューテックスが 1 秒以上保持されている場合、またはスレッドが 1 秒以内にミューテックスを取得できずに待ち続けている場合には、警告メッセージが出力されます。`MergeMutateSelectedEntry` のデストラクタにあった重い処理を `finalize` メソッドに移動し、`MergeTreeBackground` エグゼキュータでロックを長時間保持しないようにしました。 [#88898](https://github.com/ClickHouse/ClickHouse/pull/88898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* エンドポイントでリージョンが指定されていない場合に、S3 用にオプトインが必要な AWS リージョンを自動的に使用できるようにしました。参考: [オプトインが必要な AWS リージョン](https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html)。 [#88930](https://github.com/ClickHouse/ClickHouse/pull/88930) ([Andrey Zvonov](https://github.com/zvonand))。
* ユーザーは、pager 実行中でも clickhouse-client で Ctrl-C を押してクエリをキャンセルできるようになりました。[#80778](https://github.com/ClickHouse/ClickHouse/issues/80778) を解決しました。[#88935](https://github.com/ClickHouse/ClickHouse/pull/88935) ([Grigorii](https://github.com/GSokol))。
* Web UI は、値が負の場合でもテーブル内にバーを表示します。そのため、負の側と正の側でバーの色を変えた、正負両側の棒グラフを表示できます。 [#89016](https://github.com/ClickHouse/ClickHouse/pull/89016) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Keeper に保存される `SharedMergeTree` のメタデータ量を減らすため、`shared_merge_tree_create_per_replica_metadata_nodes` を無効化しました。 [#89036](https://github.com/ClickHouse/ClickHouse/pull/89036) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `S3Queue` がサーバー設定 `disable_insertion_and_mutation` に従うようにしました。 [#89048](https://github.com/ClickHouse/ClickHouse/pull/89048) ([Raúl Marín](https://github.com/Algunenano)).
* S3 の再パーティショニングが発生し、S3 が 10 分を超えて SlowDown エラーを返し続ける場合でもバックアップが成功するように、25.6 では `s3_retry_attempts` のデフォルト値を 500 に設定しました。 [#89051](https://github.com/ClickHouse/ClickHouse/pull/89051) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* `kafka_compression_codec` と `kafka_compression_level` の設定を使用して、両方の Kafka エンジンで Kafka プロデューサーの圧縮方式を指定できるようになりました。 [#89073](https://github.com/ClickHouse/ClickHouse/pull/89073) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `system.columns` に新しい列 `statistics` を追加し、このテーブルに対して作成されている統計情報の種類を示します。統計情報の種類が自動的に作成された場合は、サフィックスとして (auto) が表示されます。 [#89086](https://github.com/ClickHouse/ClickHouse/pull/89086) ([Han Fei](https://github.com/hanfei1991)).
* `*Cluster` テーブル関数にクラスタ名ではなくジェネリック展開 (generic expansion) が渡された場合のエラーメッセージを改善しました。 [#89093](https://github.com/ClickHouse/ClickHouse/pull/89093) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* YTsaurus: データソースとして `replicated_table` を使用できるようにしました。 [#89107](https://github.com/ClickHouse/ClickHouse/pull/89107) ([MikhailBurdukov](https://github.com/MikhailBurdukov))。
* 空白から始まるクエリは、CLI の履歴に保存されなくなりました。 [#89116](https://github.com/ClickHouse/ClickHouse/pull/89116) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `hasAnyTokens` または `hasAllTokens` 関数の引数として `String` 型の配列をサポートしました。 [#89124](https://github.com/ClickHouse/ClickHouse/pull/89124) ([Elmi Ahmadov](https://github.com/ahmadov)).
* plain-rewritable ディスクでのメタデータのメモリ上での保存方法を変更し、ディレクトリのネスト構造まわりの多数のバグを解消しました。 [#89125](https://github.com/ClickHouse/ClickHouse/pull/89125) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg テーブルをクエリする際に `IN` 式内に含まれるサブクエリは、パーティションプルーニング解析の前に事前に正しく計算されるようになりました。 [#89177](https://github.com/ClickHouse/ClickHouse/pull/89177) ([Daniil Ivanik](https://github.com/divanik)).
* `create_table_empty_primary_key_by_default` をデフォルトで有効化しました。利便性の観点からこの方が優れています。 [#89333](https://github.com/ClickHouse/ClickHouse/pull/89333) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SHOW CREATE DATABASE` で無効なクエリが生成される場合や、`system.databases` から `engine_full` をクエリした場合に発生し得る `Backup` データベースエンジン内の誤ったコードを修正しました。 [#89477](https://github.com/ClickHouse/ClickHouse/issues/89477) をクローズしました。 [#89341](https://github.com/ClickHouse/ClickHouse/pull/89341)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前のバージョンでは、CREATE TABLE クエリでテーブルエンジンを指定しなかった場合、設定 `create_table_empty_primary_key_by_default` は有効になりませんでした。 [#89342](https://github.com/ClickHouse/ClickHouse/pull/89342) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `chdig` を v25.11.1 にアップデートしました。ログ出力の大幅な改善およびそのほかさまざまな強化を含みます（[25.11 のリリースノート](https://github.com/azat/chdig/releases/tag/v25.11.1)）。[#89957](https://github.com/ClickHouse/ClickHouse/pull/89957)（[Azat Khuzhin](https://github.com/azat)）。（[25.10 のリリースノート](https://github.com/azat/chdig/releases/tag/v25.10.1)）。[#89452](https://github.com/ClickHouse/ClickHouse/pull/89452)（[Azat Khuzhin](https://github.com/azat)）。
* Web UI のクエリ用 textarea のリサイズハンドルを全幅にし、少しだけ使いやすくしました。また、ブラウザー標準のリサイズ機能は iPad 上の Safari では利用できませんでしたが、この変更により、知ってさえいれば少なくとも textarea の下端をドラッグしてサイズ変更できるようになりました。 [#89457](https://github.com/ClickHouse/ClickHouse/pull/89457) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ハッシュ結合の結果生成時のメモリトラッキングを改善しました。以前は、結合結果を生成する際の一時的なメモリ割り当てが適切にトラッキングされておらず、メモリ制限を超過する可能性がありました。 [#89560](https://github.com/ClickHouse/ClickHouse/pull/89560) ([Azat Khuzhin](https://github.com/azat)).
* Async server log: フラッシュをより早く実行し、デフォルトのキューサイズを増やしました。 [#89597](https://github.com/ClickHouse/ClickHouse/pull/89597) ([Raúl Marín](https://github.com/Algunenano)).
* `system.asynchronous_metrics` 内の誤った `FilesystemCacheBytes`（およびその他の値）を修正しました。ファイルシステムキャッシュに対する `SYSTEM` クエリを 1 回だけ実行するようにしました。同じパスを指すキャッシュ向けに、`system.filesystem_caches` 内に Atomic なビューを導入しました。[#89640](https://github.com/ClickHouse/ClickHouse/pull/89640) ([Azat Khuzhin](https://github.com/azat)).
* `system.view_refreshes` の一部の列の説明をより明確にしました。 [#89701](https://github.com/ClickHouse/ClickHouse/pull/89701) ([Tuan Pham Anh](https://github.com/tuanpach)).
* STS エンドポイントとやり取りする際に S3 認証情報をキャッシュし、異なる関数呼び出し間で再利用できるようにしました。キャッシュされる認証情報の数は `s3_credentials_provider_max_cache_size` で制御できます。 [#89734](https://github.com/ClickHouse/ClickHouse/pull/89734) ([Antonio Andelic](https://github.com/antonio2368)).
* 複数の式ステップが後続する場合の runtime filter のプッシュダウンの動作を修正しました。 [#89741](https://github.com/ClickHouse/ClickHouse/pull/89741) ([Alexander Gololobov](https://github.com/davenger)).
* システムメモリが 5GB 未満の場合、デフォルトでは実行可能ファイルを mlock しないようにしました。 [#89751](https://github.com/ClickHouse/ClickHouse/pull/89751) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI における型ヒントがテーブルヘッダーからはみ出さないようになりました。また、ツールチップの表示も修正され、テーブルヘッダーの背後に隠れて表示されることがなくなりました。 [#89753](https://github.com/ClickHouse/ClickHouse/pull/89753) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI 上にテーブルのプロパティを表示できるようにしました。行数またはバイト数をクリックすると、`system.tables` からのクエリが表示されます。テーブルエンジンをクリックすると、`SHOW TABLES` が表示されます。 [#89771](https://github.com/ClickHouse/ClickHouse/pull/89771) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 追記書き込みをサポートしていないディスクを使用するテーブルに対しても `non_replicated_deduplication_window` をサポートしました。[#87281](https://github.com/ClickHouse/ClickHouse/issues/87281) を解決しました。[#89796](https://github.com/ClickHouse/ClickHouse/pull/89796)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* コマンド `SYSTEM FLUSH ASYNC INSERT QUEUE` でフラッシュ対象のテーブルのリストを指定できるようにしました。[#89915](https://github.com/ClickHouse/ClickHouse/pull/89915) ([Sema Checherinda](https://github.com/CheSema)).
* 重複排除ブロック ID を `system.part_log` に記録するようにしました。 [#89928](https://github.com/ClickHouse/ClickHouse/pull/89928) ([Sema Checherinda](https://github.com/CheSema)).
* ファイルシステムキャッシュ設定 `keep_free_space_remove_batch` のデフォルト値を 10 から 100 に変更しました。より適切な値であるためです。 [#90030](https://github.com/ClickHouse/ClickHouse/pull/90030) ([Kseniia Sumarokova](https://github.com/kssenii)).
* TTL DROP マージタイプを導入し、この種のマージ後には DELETE TTL マージの次回スケジュールを更新しないようにしました。 [#90077](https://github.com/ClickHouse/ClickHouse/pull/90077) ([Mikhail Artemenko](https://github.com/Michicosun)).
* S3Queue のクリーンアップ中の RemoveRecursive Keeper リクエストについて、より小さいノード数の上限を使用するようにしました。 [#90201](https://github.com/ClickHouse/ClickHouse/pull/90201) ([Antonio Andelic](https://github.com/antonio2368)).
* `SYSTEM FLUSH LOGS` クエリが、ログが空の場合でもテーブルの作成完了を待機するようになりました。 [#89408](https://github.com/ClickHouse/ClickHouse/pull/89408) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 分散マージ集約で複数のリモートシャードが関与している場合、または `IN` サブクエリがある場合に誤った `rows_before_limit_at_least` が設定される問題を修正しました。これにより [#63280](https://github.com/ClickHouse/ClickHouse/issues/63280) が修正されました。[#63511](https://github.com/ClickHouse/ClickHouse/pull/63511) ([Amos Bird](https://github.com/amosbird))。
* `INSERT INTO ... SELECT` クエリ実行後に `0 rows in set` と表示される問題を修正しました。 [#47800](https://github.com/ClickHouse/ClickHouse/issues/47800) をクローズしました。 [#79462](https://github.com/ClickHouse/ClickHouse/pull/79462)（[Engel Danila](https://github.com/aaaengel)）。

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* 定数引数および短絡評価を用いる `multiIf` を修正。 [#72714](https://github.com/ClickHouse/ClickHouse/issues/72714) をクローズ。 [#84546](https://github.com/ClickHouse/ClickHouse/pull/84546)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* サブクエリによる制約付きテーブルに対して `SELECT` を実行した際に発生する論理エラーを修正しました。[#84190](https://github.com/ClickHouse/ClickHouse/issues/84190) を解決します。[#85575](https://github.com/ClickHouse/ClickHouse/pull/85575)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。
* 疑問符（?）を含む URI を使用する特殊なクエリで発生していたバグを修正しました。 [#85663](https://github.com/ClickHouse/ClickHouse/pull/85663) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `EXPLAIN indexes = 1` の出力で、まれに列が欠落することがあった問題を修正しました。[#86696](https://github.com/ClickHouse/ClickHouse/issues/86696) を解決しました。 [#87083](https://github.com/ClickHouse/ClickHouse/pull/87083)（[Michael Kolupaev](https://github.com/al13n321)）。
* 並列レプリカでサブカラムを追加できなくなる可能性のあった不具合を修正しました。 [#84888](https://github.com/ClickHouse/ClickHouse/issues/84888) をクローズ。 [#87514](https://github.com/ClickHouse/ClickHouse/pull/87514)（[Pavel Kruglov](https://github.com/Avogar)）。
* parquet writer において、`created_by` 文字列を正しい形式で出力するようにしました（例：`ClickHouse version 25.10.1 (build 5b1dfb14925db8901a4e9202cd5d63c11ecfbb9f)`、従来の `ClickHouse v25.9.1.1-testing` ではなく）。古い parquet-mr が書き出した不正なファイルとの互換性を確保するため、parquet reader を修正しました。 [#87735](https://github.com/ClickHouse/ClickHouse/pull/87735) ([Michael Kolupaev](https://github.com/al13n321)).
* `cramersV`、`cramersVBiasCorrected`、`theilsU`、`contingency` において、誤った結果の原因となっていた φ二乗値の計算を修正しました。 [#87831](https://github.com/ClickHouse/ClickHouse/pull/87831) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* JSON 内の Float 型と Bool 型が混在する配列の読み取りを修正しました。以前はこのようなデータを挿入すると例外がスローされていました。 [#88008](https://github.com/ClickHouse/ClickHouse/pull/88008) ([Pavel Kruglov](https://github.com/Avogar)).
* TCPHandler において QueryState に shared&#95;ptr を使用し、setProgressCallback、setFileProgressCallback、および setBlockMarshallingCallback で状態が無効になっているかどうかを検出できるようにしました。 [#88201](https://github.com/ClickHouse/ClickHouse/pull/88201) ([Tuan Pham Anh](https://github.com/tuanpach)).
* query&#95;plan&#95;optimize&#95;join&#95;order&#95;limit &gt; 1 のときのクロス JOIN の順序変更における論理エラーを修正し、[#89409](https://github.com/ClickHouse/ClickHouse/issues/89409) をクローズ。[#88286](https://github.com/ClickHouse/ClickHouse/pull/88286)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* [#88426](https://github.com/ClickHouse/ClickHouse/issues/88426) を修正。1. Alias テーブルでの明示的なカラム定義を禁止し、カラムはターゲットテーブルから自動的に読み込まれるようにしました。これにより、Alias テーブルが常にターゲットテーブルのスキーマと一致することを保証します。2. IStorage からより多くのメソッドをプロキシするようにしました。[#88552](https://github.com/ClickHouse/ClickHouse/pull/88552)（[Kai Zhu](https://github.com/nauu)）。
* 復旧後、Replicated データベースのレプリカが長時間にわたって `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを出力し続けてスタックすることがありましたが、修正されました。 [#88671](https://github.com/ClickHouse/ClickHouse/pull/88671) ([Alexander Tokmakov](https://github.com/tavplubix))。
* サブクエリを含む新しいアナライザで発生し得る &quot;Context has expired&quot; エラーを修正。 [#88694](https://github.com/ClickHouse/ClickHouse/pull/88694) ([Azat Khuzhin](https://github.com/azat)).
* input&#95;format&#95;parquet&#95;local&#95;file&#95;min&#95;bytes&#95;for&#95;seek を 0 に設定した場合に Parquet リーダーで発生していたセグメンテーションフォルトを修正しました。 [#78456](https://github.com/ClickHouse/ClickHouse/issues/78456) を解決しました。 [#88784](https://github.com/ClickHouse/ClickHouse/pull/88784) ([Animesh](https://github.com/anibilthare))。
* PK が逆順に並んでいる場合に、min(PK)/max(PK) が誤った結果になる問題を修正しました。これにより [#83619](https://github.com/ClickHouse/ClickHouse/issues/83619) が解決されました。 [#88796](https://github.com/ClickHouse/ClickHouse/pull/88796) ([Amos Bird](https://github.com/amosbird)).
* 内部テーブルを DROP する際に、`max_table_size_to_drop` および `max_partition_size_to_drop` 設定によるサイズ制限が正しく適用されるように修正。 [#88812](https://github.com/ClickHouse/ClickHouse/pull/88812) ([Nikolay Degterinsky](https://github.com/evillique)).
* 単一の引数で呼び出された場合に、`top_k` が `threshold` パラメータを正しく考慮するように修正しました。[#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。[#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* SSL 接続が必要な ArrowFlight エンドポイントソース（AWS ALB 配下など）から、特定のデータセットを正しく要求できるようになりました。 [#88868](https://github.com/ClickHouse/ClickHouse/pull/88868) ([alex-shchetkov](https://github.com/alex-shchetkov))。
* ALTER によって追加されたマテリアライズされていない Nested(Tuple(...)) の処理を修正。[#83133](https://github.com/ClickHouse/ClickHouse/issues/83133) を修正。[#88879](https://github.com/ClickHouse/ClickHouse/pull/88879)（[Azat Khuzhin](https://github.com/azat)）。
* 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、長さ 4 バイトの UTF-8 コードポイントのバイト列を誤って逆順にしていました。この変更により [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。 [#88914](https://github.com/ClickHouse/ClickHouse/pull/88914) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* icebergS3Cluster プロトコルを修正しました。`iceberg` クラスタ関数でスキーマ進化および位置削除と等価削除をサポートしました。 [#88287](https://github.com/ClickHouse/ClickHouse/issues/88287) を解決しました。 [#88919](https://github.com/ClickHouse/ClickHouse/pull/88919) ([Yang Jiang](https://github.com/Ted-Jiang)).
* 分散テーブル上で parallel replicas を使用するクエリに対して `parallel_replicas_support_projection` を無効化しました。[#88899](https://github.com/ClickHouse/ClickHouse/issues/88899) をクローズ。[#88922](https://github.com/ClickHouse/ClickHouse/pull/88922)（[zoomxi](https://github.com/zoomxi)）。
* 内部キャスト時にコンテキストを伝播する。伝播されていなかった cast 設定に関する複数の問題を修正。Closes [#88873](https://github.com/ClickHouse/ClickHouse/issues/88873). Closes [#78025](https://github.com/ClickHouse/ClickHouse/issues/78025). [#88929](https://github.com/ClickHouse/ClickHouse/pull/88929) ([Manuel](https://github.com/raimannma)).
* file() 関数におけるグロブパターンからのファイル形式の取得処理を修正。 [#88920](https://github.com/ClickHouse/ClickHouse/issues/88920) を解決。 [#88947](https://github.com/ClickHouse/ClickHouse/pull/88947)（[Vitaly Baranov](https://github.com/vitlibar)）。
* SQL SECURITY DEFINER でビューを作成する際に `SET DEFINER <current_user>:definer` へのアクセス権チェックを行わないようにしました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968) ([pufit](https://github.com/pufit)).
* 部分的な `QBit` 読み取り向けの最適化により、`p` が `Nullable` の場合に戻り値の型から誤って `Nullable` が削除されていた `L2DistanceTransposed(vec1, vec2, p)` における `LOGICAL_ERROR` を修正しました。 [#88974](https://github.com/ClickHouse/ClickHouse/pull/88974) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 不明なカタログ型によるクラッシュを修正しました。[#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解決しました。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987) ([scanhex12](https://github.com/scanhex12)).
* これにより [#88081](https://github.com/ClickHouse/ClickHouse/issues/88081) をクローズします。 [#88988](https://github.com/ClickHouse/ClickHouse/pull/88988)（[scanhex12](https://github.com/scanhex12)）。
* スキップインデックスの解析時のパフォーマンス低下を修正。 [#89004](https://github.com/ClickHouse/ClickHouse/pull/89004) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないロールが割り当てられているユーザーによる `clusterAllReplicas` の実行時に発生する `ACCESS_ENTITY_NOT_FOUND` エラーを修正。[#87670](https://github.com/ClickHouse/ClickHouse/issues/87670) を解決。[#89068](https://github.com/ClickHouse/ClickHouse/pull/89068)（[pufit](https://github.com/pufit)）。
* CHECK 制約によるスパース列の処理を修正。[#88637](https://github.com/ClickHouse/ClickHouse/issues/88637) をクローズ。[#89076](https://github.com/ClickHouse/ClickHouse/pull/89076)（[Eduard Karacharov](https://github.com/korowa)）。
* MergeTreeReaderTextIndex で仮想カラムを埋める際の誤った行数の扱いを修正し、LOGICAL&#95;ERROR によるクラッシュが発生していた問題を解消しました。 [#89095](https://github.com/ClickHouse/ClickHouse/pull/89095) ([Peng Jian](https://github.com/fastio)).
* マージ準備中に例外が発生した際に TTL マージカウンタがリークするのを防止します。[#89019](https://github.com/ClickHouse/ClickHouse/issues/89019) を解決します。 [#89127](https://github.com/ClickHouse/ClickHouse/pull/89127)（[save-my-heart](https://github.com/save-my-heart)）。
* base32/base58 エンコードおよびデコード処理に必要なバッファサイズの計算を修正しました。 [#89133](https://github.com/ClickHouse/ClickHouse/pull/89133) ([Antonio Andelic](https://github.com/antonio2368)).
* シャットダウンとバックグラウンドの `INSERT` の競合により Distributed テーブルエンジンで発生する use-after-free を修正。[#88640](https://github.com/ClickHouse/ClickHouse/issues/88640) を解決。[#89136](https://github.com/ClickHouse/ClickHouse/pull/89136)（[Azat Khuzhin](https://github.com/azat)）。
* Parquet のパース時にミュータブルな例外が原因で発生しうるデータレースを回避しました。 [#88385](https://github.com/ClickHouse/ClickHouse/issues/88385) を修正。 [#89174](https://github.com/ClickHouse/ClickHouse/pull/89174)（[Azat Khuzhin](https://github.com/azat)）。
* リフレッシュ可能なマテリアライズドビュー: リフレッシュ中にソーステーブルが完全に削除された場合に発生するまれなサーバークラッシュを修正しました。 [#89203](https://github.com/ClickHouse/ClickHouse/pull/89203) ([Michael Kolupaev](https://github.com/al13n321)).
* HTTP インターフェイスで圧縮ストリーム送信中にエラーを返す際にバッファをフラッシュするようにしました。 [#89256](https://github.com/ClickHouse/ClickHouse/pull/89256) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリマスキングルールが DDL ステートメントに誤って適用されないようにしました。 [#89272](https://github.com/ClickHouse/ClickHouse/pull/89272) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* MergeTreeReaderTextIndex で仮想カラムを埋める際の行数カウントの誤りにより LOGICAL&#95;ERROR でクラッシュする問題を修正しました。[#89095](https://github.com/ClickHouse/ClickHouse/issues/89095) を再オープンします。 [#89303](https://github.com/ClickHouse/ClickHouse/pull/89303) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* Statistics countmin が LowCardinality(Nullable(String)) の estimate データ型をサポートしておらず、LOGICAL&#95;ERROR が発生していた問題を修正しました。 [#89343](https://github.com/ClickHouse/ClickHouse/pull/89343) ([Han Fei](https://github.com/hanfei1991)).
* `IN` 関数で、主キー列の型が `IN` 関数の右側の列の型と異なる場合に、クラッシュまたは未定義動作が発生する可能性がある問題。例: `SELECT string_column, int_column FROM test_table WHERE (string_column, int_column) IN (SELECT '5', 'not a number')`。多数の行が選択され、その中に互換性のない型を含む行が存在する場合に発生することがあります。 [#89367](https://github.com/ClickHouse/ClickHouse/pull/89367) ([Ilya Golshtein](https://github.com/ilejn)).
* `countIf(*)` の引数が途中で切り捨てられる問題を修正。 [#89372](https://github.com/ClickHouse/ClickHouse/issues/89372) をクローズ。 [#89373](https://github.com/ClickHouse/ClickHouse/pull/89373)（[Manuel](https://github.com/raimannma)）。
* ミューテーション統計用の非圧縮チェックサムが失われないようにしました。 [#89381](https://github.com/ClickHouse/ClickHouse/pull/89381) ([Azat Khuzhin](https://github.com/azat)).
* `p` が `LowCardinality(Nullable(T))` の場合に、QBit の部分読み出しの最適化によって戻り値の型から誤って `Nullable` が削除されていた `L2DistanceTransposed(vec1, vec2, p)` で発生していた `LOGICAL_ERROR` を修正しました。 [#88362](https://github.com/ClickHouse/ClickHouse/issues/88362) を解決します。 [#89397](https://github.com/ClickHouse/ClickHouse/pull/89397)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* 古いバージョンの ClickHouse が書き込んだタプル本体に対して、不正な sparse シリアライゼーションでエンコードされたテーブルの読み込みを修正しました。 [#89405](https://github.com/ClickHouse/ClickHouse/pull/89405) ([Azat Khuzhin](https://github.com/azat)).
* `deduplicate_merge_projection_mode='ignore'` を使用している場合に、TTL によって空になったパーツと、空でないプロジェクションを含むパーツとのマージ処理が誤って行われていた問題を修正しました。 [#89430](https://github.com/ClickHouse/ClickHouse/issues/89430) を解決します。 [#89458](https://github.com/ClickHouse/ClickHouse/pull/89458)（[Amos Bird](https://github.com/amosbird)）。
* 重複したカラムを含む `full_sorting_merge` 結合における論理エラーを修正しました。[#86957](https://github.com/ClickHouse/ClickHouse/issues/86957) を解決しました。 [#89495](https://github.com/ClickHouse/ClickHouse/pull/89495)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* ローテーション時にチェンジログが正しくリネームされなかった場合の、Keeper 起動時におけるチェンジログの読み取り処理を修正しました。 [#89496](https://github.com/ClickHouse/ClickHouse/pull/89496) ([Antonio Andelic](https://github.com/antonio2368)).
* 右側テーブルの一意キーに対して OR 条件を使用した場合に発生する誤った JOIN 結果を修正します。[#89391](https://github.com/ClickHouse/ClickHouse/issues/89391) を解決します。[#89512](https://github.com/ClickHouse/ClickHouse/pull/89512) ([Vladimir Cherkasov](https://github.com/vdimir))。
* analyzer と PK IN (subquery) の組み合わせで発生しうる「Context has expired」の問題を修正 (v2)。[#89433](https://github.com/ClickHouse/ClickHouse/issues/89433) を修正。[#89527](https://github.com/ClickHouse/ClickHouse/pull/89527)（[Azat Khuzhin](https://github.com/azat)）。
* 大文字のカラム名を持つテーブルの MaterializedPostgreSQL レプリケーションを修正しました。[#72363](https://github.com/ClickHouse/ClickHouse/issues/72363) を解決します。[#89530](https://github.com/ClickHouse/ClickHouse/pull/89530)（[Danylo Osipchuk](https://github.com/Lenivaya)）。
* 集約関数の状態に `LowCardinality(String)` 列のシリアライズ済みの値が含まれている場合にクラッシュが発生する問題を修正しました。 [#89550](https://github.com/ClickHouse/ClickHouse/pull/89550) ([Pavel Kruglov](https://github.com/Avogar)).
* `enable_lazy_columns_replication` 設定を有効にした状態で、JOIN の右側で `ARRAY JOIN` を使用した際にクラッシュが発生する問題を修正。 [#89551](https://github.com/ClickHouse/ClickHouse/pull/89551) ([Pavel Kruglov](https://github.com/Avogar)).
* query&#95;plan&#95;convert&#95;join&#95;to&#95;in の論理的な誤りを修正。[#89066](https://github.com/ClickHouse/ClickHouse/issues/89066) を解決。[#89554](https://github.com/ClickHouse/ClickHouse/pull/89554)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 変換できない型不一致のカラムと定数を含む条件を推定しようとした際に、統計推定器で発生していた例外を修正しました。 [#89596](https://github.com/ClickHouse/ClickHouse/pull/89596) ([Han Fei](https://github.com/hanfei1991)).
* 実行時フィルターは、ハッシュ結合などサポートされている結合アルゴリズムに対してのみ追加するようにしました。フィルターは、結合アルゴリズムがまず右側をすべて読み終えてから左側を読み始める場合にのみ構築できますが、例えば FullSortingMergeJoin は両側を同時に読みます。 [#89220](https://github.com/ClickHouse/ClickHouse/issues/89220) を修正しました。 [#89652](https://github.com/ClickHouse/ClickHouse/pull/89652)（[Alexander Gololobov](https://github.com/davenger)）。
* `sparseGrams` トークナイザー使用時における `hasAnyTokens`、`hasAllTokens`、`tokens` 関数の同時実行に関する問題を修正しました。[#89605](https://github.com/ClickHouse/ClickHouse/issues/89605) を解決します。 [#89665](https://github.com/ClickHouse/ClickHouse/pull/89665)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 一部のケースで発生していた、`JOIN` ランタイムフィルタに起因する論理エラー／クラッシュを修正しました。[#89062](https://github.com/ClickHouse/ClickHouse/issues/89062) を修正。[#89666](https://github.com/ClickHouse/ClickHouse/pull/89666)（[Alexander Gololobov](https://github.com/davenger)）。
* `enable_lazy_columns_replication` が有効な状態で Map 列に対して ARRAY JOIN を行う際に発生する可能性のある論理エラーを修正しました。[#89705](https://github.com/ClickHouse/ClickHouse/issues/89705) をクローズ。[#89717](https://github.com/ClickHouse/ClickHouse/pull/89717)（[Pavel Kruglov](https://github.com/Avogar)）。
* キャンセル処理中のリモートクエリにおいて、切断後にリモートサーバーから読み込もうとしてクラッシュする問題を回避しました。[#89468](https://github.com/ClickHouse/ClickHouse/issues/89468) を解決。[#89740](https://github.com/ClickHouse/ClickHouse/pull/89740)（[Azat Khuzhin](https://github.com/azat)）。
* プロジェクションインデックスの読み取りパスにおけるレースコンディションを解消しました。 [#89497](https://github.com/ClickHouse/ClickHouse/issues/89497) を解決しました。 [#89762](https://github.com/ClickHouse/ClickHouse/pull/89762)（[Peng Jian](https://github.com/fastio)）。
* プロジェクションインデックスの読み取りにおいてレースコンディションを引き起こす可能性があったバグを修正し、[#89497](https://github.com/ClickHouse/ClickHouse/issues/89497) を解決しました。 [#89775](https://github.com/ClickHouse/ClickHouse/pull/89775) ([Amos Bird](https://github.com/amosbird))。
* パーティションを持たないテーブルに対する Paimon テーブル関数の処理を修正しました。[#89690](https://github.com/ClickHouse/ClickHouse/issues/89690) を解決しました。[#89793](https://github.com/ClickHouse/ClickHouse/pull/89793)（[JIaQi](https://github.com/JiaQiTang98)）。
* 高度な JSON 共有データシリアライゼーションにおいて、パスおよびそのサブカラムの読み取り時に発生しうる論理エラーを修正しました。 [#89805](https://github.com/ClickHouse/ClickHouse/issues/89805) をクローズ。 [#89819](https://github.com/ClickHouse/ClickHouse/pull/89819) ([Pavel Kruglov](https://github.com/Avogar))。
* データ型のバイナリデシリアライズで発生する可能性のあったスタックオーバーフローを修正し、[#88710](https://github.com/ClickHouse/ClickHouse/issues/88710) をクローズ。[#89822](https://github.com/ClickHouse/ClickHouse/pull/89822)（[Pavel Kruglov](https://github.com/Avogar)）。
* `IN` 関数内で空のタプルが使われた場合に発生する論理エラーを修正。[#88343](https://github.com/ClickHouse/ClickHouse/issues/88343) をクローズ。[#89850](https://github.com/ClickHouse/ClickHouse/pull/89850)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 互換性維持のため、旧アナライザーでは `optimize_injective_functions_in_group_by` の設定にかかわらず `GROUP BY` から単射関数を除去します。 [#89854](https://github.com/ClickHouse/ClickHouse/issues/89854) を解決します。 [#89870](https://github.com/ClickHouse/ClickHouse/pull/89870) ([Raufs Dunamalijevs](https://github.com/rienath))。
* たとえばメモリ制限などによってマージが中断された場合、merge mutate background executor はロックなしでマージタスクに対して `cancel` を呼び出しますが、この場合、部分的に作成された結果パーツは削除されません（完了しておらず、この段階では可視状態にもなっていなかったため）。その後、マージタスクが破棄され、それに伴い結果パーツの破棄がトリガーされます。これによりディスクトランザクションがロールバックされ、S3 からデータが削除されます。最終的に、このガベージクリーンアップは merge mutate background executor のロック取得下で実行されるようになりました。 [#89875](https://github.com/ClickHouse/ClickHouse/pull/89875) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `reverse` 関数および `CAST` 関数内で空のタプルを扱う際の論理エラーを修正しました。 [#89137](https://github.com/ClickHouse/ClickHouse/issues/89137) をクローズしました。 [#89908](https://github.com/ClickHouse/ClickHouse/pull/89908) ([Nihal Z. Miaji](https://github.com/nihalzp))。
* ClickHouse は、デフォルトで `SHOW DATABASES` クエリにデータレイクカタログのデータベースを表示するようになりました。 [#89914](https://github.com/ClickHouse/ClickHouse/pull/89914) ([alesapin](https://github.com/alesapin)).
* バックアップにおける GCS のネイティブコピーの利用を修正しました。不適切なクライアントのクローン処理が原因で、GCS のネイティブコピーが常に失敗し、データを自前で読み書きするという最適でない方法が使用されていました。 [#89923](https://github.com/ClickHouse/ClickHouse/pull/89923) ([Antonio Andelic](https://github.com/antonio2368)).
* base32Encode のバッファサイズ計算を修正しました。サイズが 5 未満の文字列を含むカラムに対して base32Encode を計算するとクラッシュにつながる可能性がありました。 [#89911](https://github.com/ClickHouse/ClickHouse/issues/89911) を解決します。 [#89929](https://github.com/ClickHouse/ClickHouse/pull/89929)（[Antonio Andelic](https://github.com/antonio2368)）。
* `SHOW COLUMNS` と `SHOW FUNCTIONS` クエリにおける誤ったエスケープ処理を修正。[#89942](https://github.com/ClickHouse/ClickHouse/pull/89942) ([alesapin](https://github.com/alesapin))。
* ユーザー名に &#39;@&#39; 文字を含む場合の MongoDB エンジンにおける URL 検証を修正しました。これまでは、&#39;@&#39; を含むユーザー名が不適切なエンコードによりエラーを引き起こしていました。 [#89970](https://github.com/ClickHouse/ClickHouse/pull/89970) ([Kai Zhu](https://github.com/nauu)).
* [#90592](https://github.com/ClickHouse/ClickHouse/issues/90592) でバックポート: `IN` 句内で `ARRAY JOIN` を使用し、かつ `enable_lazy_columns_replication` 設定が有効な場合に発生しうるリモートクエリのクラッシュを修正。[#90361](https://github.com/ClickHouse/ClickHouse/issues/90361) を解決します。[#89997](https://github.com/ClickHouse/ClickHouse/pull/89997)（[Pavel Kruglov](https://github.com/Avogar)）。
* [#90448](https://github.com/ClickHouse/ClickHouse/issues/90448) でバックポート済み: 一部のケースで発生していた、テキスト形式における `String` からの不正な `DateTime64` 値の推論を修正。 [#89368](https://github.com/ClickHouse/ClickHouse/issues/89368) を解決。 [#90013](https://github.com/ClickHouse/ClickHouse/pull/90013) ([Pavel Kruglov](https://github.com/Avogar))。
* `BSONEachRow` と `MsgPack` における空のタプルカラムに起因する論理エラーを修正。[#89814](https://github.com/ClickHouse/ClickHouse/issues/89814) および [#71536](https://github.com/ClickHouse/ClickHouse/issues/71536) をクローズ。[#90018](https://github.com/ClickHouse/ClickHouse/pull/90018)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* [#90457](https://github.com/ClickHouse/ClickHouse/issues/90457) でバックポートされました: 集約状態およびその他のソースからのデータをデシリアライズする際にサイズチェックを行うようにしました。 [#90031](https://github.com/ClickHouse/ClickHouse/pull/90031)（[Raúl Marín](https://github.com/Algunenano)）。
* 重複カラムを含む JOIN で発生する可能性のある `Invalid number of rows in Chunk` エラーを修正しました。[#89411](https://github.com/ClickHouse/ClickHouse/issues/89411) を解消しました。[#90053](https://github.com/ClickHouse/ClickHouse/pull/90053)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* [#90588](https://github.com/ClickHouse/ClickHouse/issues/90588) でバックポート: `enable_lazy_columns_replication` 設定を有効にした状態で `ARRAY JOIN` を使用して挿入を行う際に発生する可能性のあるエラー `Column with Array type is not represented by ColumnArray column: Replicated` を修正しました。 [#90066](https://github.com/ClickHouse/ClickHouse/pull/90066) ([Pavel Kruglov](https://github.com/Avogar)).
* `user_files` で先頭がドットのファイルを許可しました。Closes [#89662](https://github.com/ClickHouse/ClickHouse/issues/89662). [#90079](https://github.com/ClickHouse/ClickHouse/pull/90079) ([Raúl Marín](https://github.com/Algunenano)).
* [#90647](https://github.com/ClickHouse/ClickHouse/issues/90647) でバックポート: 大きなステップサイズを使用した場合に `numbers` システムテーブルで発生する論理エラーと剰余演算のバグを修正。[#83398](https://github.com/ClickHouse/ClickHouse/issues/83398) をクローズ。[#90123](https://github.com/ClickHouse/ClickHouse/pull/90123)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* 辞書引数の解析時に発生する整数オーバーフローを修正。Closes [#78506](https://github.com/ClickHouse/ClickHouse/issues/78506). [#90171](https://github.com/ClickHouse/ClickHouse/pull/90171) ([Raúl Marín](https://github.com/Algunenano)).
* [#90468](https://github.com/ClickHouse/ClickHouse/issues/90468) にバックポート済み: 25.8 へのスムーズなアップグレードを妨げていた Hive パーティショニングの非互換性を修正（アップグレード中に発生するエラー `All hive partitioning columns must be present in the schema` を解消）。[#90202](https://github.com/ClickHouse/ClickHouse/pull/90202)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* クエリ条件キャッシュが有効な状態での `SELECT` クエリにおいて、軽量更新後に誤ったクエリ結果が返される可能性があった問題を修正しました。[#90176](https://github.com/ClickHouse/ClickHouse/issues/90176) を修正。[#90054](https://github.com/ClickHouse/ClickHouse/issues/90054) を修正。[#90204](https://github.com/ClickHouse/ClickHouse/pull/90204)（[Anton Popov](https://github.com/CurtizJ)）。
* 不正な形式のシャードディレクトリ名を解析する際に `StorageDistributed` がクラッシュする問題を修正。 [#90243](https://github.com/ClickHouse/ClickHouse/pull/90243) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* `LogicalExpressionOptimizerPass` において、文字列から整数またはブール値への暗黙的な変換を正しく処理するようにしました。[#89803](https://github.com/ClickHouse/ClickHouse/issues/89803) を解決します。[#90245](https://github.com/ClickHouse/ClickHouse/pull/90245)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* テーブル定義内の特定の skip index の誤った形式を修正しました。これが原因で `METADATA_MISMATCH` が発生し、Replicated Database における新しいレプリカの作成が失敗していました。 [#90251](https://github.com/ClickHouse/ClickHouse/pull/90251) ([Nikolay Degterinsky](https://github.com/evillique)).
* [#90381](https://github.com/ClickHouse/ClickHouse/issues/90381) でバックポート済み: パーツの行数が `index_granularity` より少ない場合に、MergeTreeReaderIndex で行数の不一致が発生する問題を修正しました。 [#89691](https://github.com/ClickHouse/ClickHouse/issues/89691) を解決します。 [#90254](https://github.com/ClickHouse/ClickHouse/pull/90254)（[Peng Jian](https://github.com/fastio)）。
* [#90608](https://github.com/ClickHouse/ClickHouse/issues/90608) にバックポート: コンパクトパーツ内で JSON からサブカラムを読み取る際に `CANNOT_READ_ALL_DATA` エラーを引き起こす可能性があったバグを修正。[#90264](https://github.com/ClickHouse/ClickHouse/issues/90264) を解決。[#90302](https://github.com/ClickHouse/ClickHouse/pull/90302)（[Pavel Kruglov](https://github.com/Avogar)）。
* 2 つの引数を指定した場合に `trim`、`ltrim`、`rtrim` 関数が動作しない問題を修正しました。 [#90170](https://github.com/ClickHouse/ClickHouse/issues/90170) をクローズしました。 [#90305](https://github.com/ClickHouse/ClickHouse/pull/90305)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* [#90625](https://github.com/ClickHouse/ClickHouse/issues/90625) にバックポート済み: `index_granularity_bytes=0` の場合に、存在しない JSON パスに対する `prewhere` で発生し得る論理エラーを修正。[#86924](https://github.com/ClickHouse/ClickHouse/issues/86924) を解決。[#90375](https://github.com/ClickHouse/ClickHouse/pull/90375)（[Pavel Kruglov](https://github.com/Avogar)）。
* [#90484](https://github.com/ClickHouse/ClickHouse/issues/90484) にバックポート済み: 精度引数が有効な範囲を超えた場合にクラッシュを引き起こしていた `L2DistanceTransposed` のバグを修正しました。[#90401](https://github.com/ClickHouse/ClickHouse/issues/90401) をクローズします。[#90405](https://github.com/ClickHouse/ClickHouse/pull/90405)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#90577](https://github.com/ClickHouse/ClickHouse/issues/90577) にバックポート: 配列参照ベクトル（デフォルトで `Array(Float64)`）を、要素型が `Float64` 以外（`Float32`、`BFloat16`）の `QBit` カラムとともに使用した場合に、`L2DistanceTransposed` で距離計算が誤って行われていた問題を修正しました。この関数は、参照ベクトルを自動的に `QBit` の要素型にキャストするようになりました。[#89976](https://github.com/ClickHouse/ClickHouse/issues/89976) を解決します。[#90485](https://github.com/ClickHouse/ClickHouse/pull/90485)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#90601](https://github.com/ClickHouse/ClickHouse/issues/90601) にバックポート済み：`equals` 関数におけるまれなケースによって発生する論理エラーを修正しました。[#88142](https://github.com/ClickHouse/ClickHouse/issues/88142) をクローズ。[#90557](https://github.com/ClickHouse/ClickHouse/pull/90557)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Tuple` 型に対する `CoalescingMergeTree` の処理を修正。 [#88828](https://github.com/ClickHouse/ClickHouse/pull/88828) ([scanhex12](https://github.com/scanhex12)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* initdb 用 SQL スクリプトと TCP ポートの上書きを伴う Docker 上での ClickHouse 実行時に発生する Connection refused エラーを修正。[#88042](https://github.com/ClickHouse/ClickHouse/pull/88042) ([Grigorii](https://github.com/GSokol))。
* ClickHouse の新しいプラットフォームとして e2k を実験的にサポート。[#90159](https://github.com/ClickHouse/ClickHouse/pull/90159) ([Ramil Sattarov](https://github.com/r-a-sattarov))。
* CMake から残っていた `FindPackage` の使用箇所を削除。ビルドがシステムパッケージに依存しないようにする。[#89380](https://github.com/ClickHouse/ClickHouse/pull/89380) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* CMake 構成時のビルドでコンパイラキャッシュを使用（例: `protoc`）。[#89613](https://github.com/ClickHouse/ClickHouse/pull/89613) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* FreeBSD 13.4 の sysroot を使用。[#89617](https://github.com/ClickHouse/ClickHouse/pull/89617) ([Konstantin Bogdanov](https://github.com/thevar1able))。

### ClickHouse リリース 25.10、2025-10-31 {#2510}

#### 後方互換性を損なう変更 {#backward-incompatible-change}

* デフォルトの `schema_inference_make_columns_nullable` 設定を変更し、すべてを Nullable にするのではなく、Parquet/ORC/Arrow のメタデータに含まれるカラムが Nullable かどうかの情報を尊重するようにしました。テキストフォーマットについては変更ありません。 [#71499](https://github.com/ClickHouse/ClickHouse/pull/71499) ([Michael Kolupaev](https://github.com/al13n321))。
* クエリ結果キャッシュは `log_comment` 設定を無視するようになったため、クエリで `log_comment` のみを変更しても、キャッシュミスを強制的に発生させることはなくなりました。`log_comment` を変化させることで、意図的にキャッシュをセグメント化していたユーザーが、少数ながら存在していた可能性があります。この変更によりその挙動が変わるため、後方互換性がありません。その目的には `query_cache_tag` 設定を使用してください。[#79878](https://github.com/ClickHouse/ClickHouse/pull/79878) ([filimonov](https://github.com/filimonov))。
* 以前のバージョンでは、テーブル関数の名前が演算子の実装用関数と同じであるクエリで、フォーマットに一貫性がありませんでした。[#81601](https://github.com/ClickHouse/ClickHouse/issues/81601) をクローズします。[#81977](https://github.com/ClickHouse/ClickHouse/issues/81977) をクローズします。[#82834](https://github.com/ClickHouse/ClickHouse/issues/82834) をクローズします。[#82835](https://github.com/ClickHouse/ClickHouse/issues/82835) をクローズします。EXPLAIN SYNTAX クエリでは、常に演算子がフォーマットされるとは限らなくなりました。この新しい挙動は、構文を説明するという本来の目的をより正確に反映しています。`clickhouse-format`、`formatQuery` などは、クエリ内で関数形式で記述されている場合、その関数を演算子としてフォーマットしません。[#82825](https://github.com/ClickHouse/ClickHouse/pull/82825)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `JOIN` キーで `Dynamic` 型を使用することを禁止しました。`Dynamic` 型の値が非 `Dynamic` 型と比較されると、予期しない結果になる可能性があります。`Dynamic` 列は、必要な型に明示的にキャストすることを推奨します。 [#86358](https://github.com/ClickHouse/ClickHouse/pull/86358) ([Pavel Kruglov](https://github.com/Avogar)).
* `storage_metadata_write_full_object_key` サーバーオプションはデフォルトでオンになっており、現時点ではオフに設定できません。これは後方互換性を維持する変更です。注意喚起のための情報です。この変更は 25.x リリースとのみ前方互換性があります。つまり、新しいリリースをロールバックする必要がある場合は、25.x 系の任意のリリースにのみダウングレードできます。 [#87335](https://github.com/ClickHouse/ClickHouse/pull/87335) ([Sema Checherinda](https://github.com/CheSema)).
* 挿入レートが低い場合に ZooKeeper 上に保存される znode を減らすため、`replicated_deduplication_window_seconds` を 1 週間から 1 時間に短縮しました。 [#87414](https://github.com/ClickHouse/ClickHouse/pull/87414) ([Sema Checherinda](https://github.com/CheSema)).
* 設定 `query_plan_use_new_logical_join_step` の名前を `query_plan_use_logical_join_step` に変更しました。 [#87679](https://github.com/ClickHouse/ClickHouse/pull/87679) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 新しい構文により、テキストインデックスの `tokenizer` パラメータをより柔軟に指定できるようになりました。 [#87997](https://github.com/ClickHouse/ClickHouse/pull/87997) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 既存の関数 `hasToken` との一貫性を高めるため、関数 `searchAny` と `searchAll` の名称をそれぞれ `hasAnyTokens` と `hasAllTokens` に変更しました。 [#88109](https://github.com/ClickHouse/ClickHouse/pull/88109) ([Robert Schulze](https://github.com/rschu1ze)).
* ファイルシステムキャッシュから `cache_hits_threshold` を削除しました。この機能は SLRU キャッシュポリシーを導入する前に外部コントリビューターによって追加されたものですが、現在は SLRU キャッシュポリシーがあるため、両方をサポートし続ける意味はありません。 [#88344](https://github.com/ClickHouse/ClickHouse/pull/88344) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `min_free_disk_ratio_to_perform_insert` と `min_free_disk_bytes_to_perform_insert` 設定の動作に対して、2 つの細かな変更を行いました。- INSERT を拒否すべきかどうかを判断する際に、利用可能（available）バイト数ではなく未予約（unreserved）バイト数を使用するようにしました。バックグラウンドマージやミューテーションのための予約領域が、設定されたしきい値と比べて小さい場合にはあまり重要ではないかもしれませんが、こちらのほうがより正しいと考えられます。- これらの設定を system テーブルには適用しないようにしました。その理由は、`query_log` のようなテーブルを引き続き更新したいからです。これはデバッグに非常に役立ちます。system テーブルに書き込まれるデータは通常、実データと比べて小さいため、妥当な `min_free_disk_ratio_to_perform_insert` のしきい値であれば、かなり長い間処理を継続できるはずです。 [#88468](https://github.com/ClickHouse/ClickHouse/pull/88468) ([c-end](https://github.com/c-end))。
* Keeper の内部レプリケーションの非同期モードを有効にします。Keeper は、これまでと同じ動作を維持しつつ、パフォーマンスが向上する可能性があります。23.9 より前のバージョンから更新する場合は、まず 23.9 以降に更新してから 25.10 以降に更新する必要があります。更新前に `keeper_server.coordination_settings.async_replication` を 0 に設定し、更新完了後に再度有効化することもできます。 [#88515](https://github.com/ClickHouse/ClickHouse/pull/88515) ([Antonio Andelic](https://github.com/antonio2368))。

#### 新機能 {#new-feature}

* 負の `LIMIT` と `OFFSET` のサポートを追加。 [#28913](https://github.com/ClickHouse/ClickHouse/issues/28913) をクローズ。 [#88411](https://github.com/ClickHouse/ClickHouse/pull/88411) （[Nihal Z. Miaji](https://github.com/nihalzp)）。
* `Alias` エンジンは、別のテーブルへのプロキシを作成します。すべての読み取り・書き込み操作はターゲットテーブルに転送され、エイリアス自体はデータを保持せず、ターゲットテーブルへの参照のみを保持します。 [#87965](https://github.com/ClickHouse/ClickHouse/pull/87965) ([Kai Zhu](https://github.com/nauu)).
* 演算子 `IS NOT DISTINCT FROM` (`<=>`) のサポートを完全に実装しました。 [#88155](https://github.com/ClickHouse/ClickHouse/pull/88155) ([simonmichal](https://github.com/simonmichal)).
* `MergeTree` テーブル内の要件を満たすすべてのカラムに対して、統計情報を自動的に作成する機能を追加しました。作成する統計情報の種類をカンマ区切りで指定するテーブルレベルの設定 `auto_statistics_types` を追加しました（例: `auto_statistics_types = 'minmax, uniq, countmin'`）。[#87241](https://github.com/ClickHouse/ClickHouse/pull/87241)（[Anton Popov](https://github.com/CurtizJ)）。
* テキスト用の新しいブルームフィルターインデックス `sparse_gram` を追加。[#79985](https://github.com/ClickHouse/ClickHouse/pull/79985)（[scanhex12](https://github.com/scanhex12)）。
* 数値の基数変換を行う新しい関数 `conv` が追加され、現在は基数 `2-36` をサポートしています。 [#83058](https://github.com/ClickHouse/ClickHouse/pull/83058) ([hp](https://github.com/hp77-creator))。
* `LIMIT BY ALL` 構文のサポートを追加しました。`GROUP BY ALL` や `ORDER BY ALL` と同様に、`LIMIT BY ALL` は SELECT 句内のすべての非集約式を自動的に展開し、それらを LIMIT BY のキーとして使用します。たとえば、`SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY ALL` は `SELECT id, name, count(*) FROM table GROUP BY id LIMIT 1 BY id, name` と同等です。この機能により、選択された非集約列すべてで LIMIT BY を行いたいが、それらを明示的に列挙したくない場合に、クエリを簡潔に記述できます。[#59152](https://github.com/ClickHouse/ClickHouse/issues/59152) をクローズしました。[#84079](https://github.com/ClickHouse/ClickHouse/pull/84079)（[Surya Kant Ranjan](https://github.com/iit2009046)）。
* ClickHouse から Apache Paimon をクエリ可能にするサポートを追加しました。この統合により、ClickHouse ユーザーは Paimon のデータレイク ストレージに直接アクセスできるようになります。 [#84423](https://github.com/ClickHouse/ClickHouse/pull/84423) ([JIaQi](https://github.com/JiaQiTang98))。
* `studentTTestOneSample` 集約関数を追加しました。 [#85436](https://github.com/ClickHouse/ClickHouse/pull/85436) ([Dylan](https://github.com/DylanBlakemore))。
* 集約関数 `quantilePrometheusHistogram` は、ヒストグラムバケットの上限値と累積値を引数として受け取り、分位点が位置するバケットの下限値と上限値の間で線形補間を行います。従来型ヒストグラムに対する PromQL の `histogram_quantile` 関数と同様に動作します。 [#86294](https://github.com/ClickHouse/ClickHouse/pull/86294) ([Stephen Chi](https://github.com/stephchi0)).
* Delta Lake のメタデータファイル用の新しいシステムテーブル。 [#87263](https://github.com/ClickHouse/ClickHouse/pull/87263) ([scanhex12](https://github.com/scanhex12)).
* `ALTER TABLE REWRITE PARTS` を追加しました。これはテーブルのパーツをゼロから書き換え、新しい設定をすべて使用して再生成します（`use_const_adaptive_granularity` のように、新しいパーツに対してのみ適用されるものがあるため）。 [#87774](https://github.com/ClickHouse/ClickHouse/pull/87774) ([Azat Khuzhin](https://github.com/azat))。
* `SYSTEM RECONNECT ZOOKEEPER` コマンドを追加し、ZooKeeper の切断と再接続を強制的に行えるようにしました（[https://github.com/ClickHouse/ClickHouse/issues/87317](https://github.com/ClickHouse/ClickHouse/issues/87317)）。[#87318](https://github.com/ClickHouse/ClickHouse/pull/87318)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* `max_named_collection_num_to_warn` と `max_named_collection_num_to_throw` を設定することで、名前付きコレクションの数を制限します。新しいメトリクス `NamedCollection` およびエラー `TOO_MANY_NAMED_COLLECTIONS` を追加しました。 [#87343](https://github.com/ClickHouse/ClickHouse/pull/87343) ([Pablo Marcos](https://github.com/pamarcos)).
* `startsWith` および `endsWith` 関数に、大文字小文字を区別しない最適化されたバリアントである `startsWithCaseInsensitive`、`endsWithCaseInsensitive`、`startsWithCaseInsensitiveUTF8`、`endsWithCaseInsensitiveUTF8` を追加しました。 [#87374](https://github.com/ClickHouse/ClickHouse/pull/87374) ([Guang Zhao](https://github.com/zheguang)).
* サーバー設定の &quot;resources&#95;and&#95;workloads&quot; セクションを通じて、SQL で `WORKLOAD` および `RESOURCE` 定義を指定できるようにしました。 [#87430](https://github.com/ClickHouse/ClickHouse/pull/87430) ([Sergei Trifonov](https://github.com/serxa)).
* パートをワイドパートとして作成するための最小レベルを指定できる新しいテーブル設定 `min_level_for_wide_part` を追加。 [#88179](https://github.com/ClickHouse/ClickHouse/pull/88179) ([Christoph Wurm](https://github.com/cwurm))。
* Keeper クライアントに `cp`-`cpr` および `mv`-`mvr` コマンドの再帰版を追加しました。 [#88570](https://github.com/ClickHouse/ClickHouse/pull/88570) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 挿入時にマテリアライズ対象から除外するスキップインデックスのリストを指定するセッション設定（`exclude_materialize_skip_indexes_on_insert`）を追加しました。マージ処理時にマテリアライズ対象から除外するスキップインデックスのリストを指定する MergeTree テーブル設定（`exclude_materialize_skip_indexes_on_merge`）を追加しました。 [#87252](https://github.com/ClickHouse/ClickHouse/pull/87252) ([George Larionov](https://github.com/george-larionov))。

#### 実験的機能 {#experimental-feature}

* ベクトルをビットスライス形式で格納する `QBit` データ型と、パラメータによって精度と速度のトレードオフを制御しながら近似ベクトル検索を可能にする `L2DistanceTransposed` 関数を実装しました。 [#87922](https://github.com/ClickHouse/ClickHouse/pull/87922) ([Raufs Dunamalijevs](https://github.com/rienath)).
* 関数 `searchAll` と `searchAny` は、テキスト列を含まないカラム上でも動作するようになりました。その場合、デフォルトのトークナイザが使用されます。 [#87722](https://github.com/ClickHouse/ClickHouse/pull/87722) ([Jimmy Aguilar Mena](https://github.com/Ergus)).

#### パフォーマンスの向上 {#performance-improvement}

* JOIN および ARRAY JOIN において、lazy columns replication を実装しました。一部の出力フォーマットでは、Sparse や Replicated のような特殊なカラム表現を完全なカラムに変換しないようにしました。これにより、メモリ内での不要なデータコピーを避けられます。 [#88752](https://github.com/ClickHouse/ClickHouse/pull/88752) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree テーブルのトップレベルの String カラムに対して、圧縮効率を向上させ、サブカラムへの効率的なアクセスを可能にするオプションの `.size` サブカラムのシリアライゼーションを追加しました。シリアライゼーションのバージョン制御および空文字列に対する式の最適化のための新しい MergeTree 設定を導入しました。 [#82850](https://github.com/ClickHouse/ClickHouse/pull/82850) ([Amos Bird](https://github.com/amosbird))。
* Iceberg に対する順序どおりの読み取りのサポート。 [#88454](https://github.com/ClickHouse/ClickHouse/pull/88454) ([scanhex12](https://github.com/scanhex12)).
* 実行時に右側サブツリーから Bloom フィルターを構築し、このフィルターを左側サブツリーのスキャンに渡すことで、一部の JOIN クエリの処理を高速化します。これは、`SELECT avg(o_totalprice) FROM orders, customer, nation WHERE c_custkey = o_custkey AND c_nationkey=n_nationkey AND n_name = 'FRANCE'` のようなクエリで有効な場合があります。 [#84772](https://github.com/ClickHouse/ClickHouse/pull/84772) ([Alexander Gololobov](https://github.com/davenger)).
* Query Condition Cache (QCC) の適用順序およびインデックス解析との連携をリファクタリングすることで、クエリのパフォーマンスを改善しました。QCC によるフィルタリングは、プライマリキーおよびスキップインデックスの解析より前に適用されるようになり、不要なインデックス計算が削減されます。インデックス解析は複数の範囲フィルタをサポートするよう拡張され、そのフィルタリング結果は QCC に書き戻されるようになりました。これにより、インデックス解析が実行時間の大部分を占めるクエリ、特にスキップインデックス（例: ベクターインデックスやインバーテッドインデックス）に依存するクエリが大幅に高速化されます。[#82380](https://github.com/ClickHouse/ClickHouse/pull/82380) ([Amos Bird](https://github.com/amosbird))。
* 小規模クエリを高速化するための細かな最適化を多数実施。[#83096](https://github.com/ClickHouse/ClickHouse/pull/83096) ([Raúl Marín](https://github.com/Algunenano))。
* ネイティブプロトコルでログとプロファイルイベントを圧縮します。100 レプリカ以上のクラスターでは、未圧縮のプロファイルイベントは 1～10 MB/秒に達し、インターネット接続が遅い場合はプログレスバーの動きが鈍くなります。これにより [#82533](https://github.com/ClickHouse/ClickHouse/issues/82533) が解決されました。[#83586](https://github.com/ClickHouse/ClickHouse/pull/83586)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 大文字小文字を区別する文字列検索（`WHERE URL LIKE '%google%'` のようなフィルタリング操作）のパフォーマンスを、[StringZilla](https://github.com/ashvardanian/StringZilla) ライブラリを使用し、利用可能な場合には SIMD CPU 命令も活用することで向上させました。[#84161](https://github.com/ClickHouse/ClickHouse/pull/84161)（[Raúl Marín](https://github.com/Algunenano)）。
* テーブルに `SimpleAggregateFunction(anyLast)` 型のカラムがある場合に、`FINAL` を付けて AggregatingMergeTree テーブルから `SELECT` する際のメモリ割り当ておよびメモリコピーを削減しました。 [#84428](https://github.com/ClickHouse/ClickHouse/pull/84428) ([Duc Canh Le](https://github.com/canhld94)).
* `JOIN` 述語における論理和条件（OR）のプッシュダウンロジックを実装します。例として、TPC-H Q7 で 2 つのテーブル n1 と n2 に対する条件 `(n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY') OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')` がある場合、それぞれのテーブルに対して個別の部分フィルタを抽出します。具体的には、n1 には `n1.n_name = 'FRANCE' OR n1.n_name = 'GERMANY'` を、n2 には `n2.n_name = 'GERMANY' OR n2.n_name = 'FRANCE'` を適用します。[#84735](https://github.com/ClickHouse/ClickHouse/pull/84735)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* 新しいデフォルト設定 `optimize_rewrite_like_perfect_affix` により、接頭辞または接尾辞を持つ `LIKE` のパフォーマンスを向上させます。 [#85920](https://github.com/ClickHouse/ClickHouse/pull/85920) ([Guang Zhao](https://github.com/zheguang)).
* 複数の文字列/数値カラムで `GROUP BY` を行う際に、巨大なシリアライズキーによって発生していたパフォーマンス低下を修正。これは [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) のフォローアップです。[#85924](https://github.com/ClickHouse/ClickHouse/pull/85924)（[李扬](https://github.com/taiyang-li)）。
* `joined_block_split_single_row` という新しい設定を追加し、多数の一致が発生するハッシュ結合におけるメモリ使用量を削減します。これにより、左テーブルの1行に対する一致結果についてもチャンクに分割できるようになり、左テーブルの1行が右テーブルの数千〜数百万行と一致するようなケースで特に有用です。以前は、すべての一致行を一度にメモリ上にマテリアライズする必要がありました。この変更によりピーク時のメモリ使用量は削減されますが、CPU使用量が増加する可能性があります。 [#87913](https://github.com/ClickHouse/ClickHouse/pull/87913) ([Vladimir Cherkasov](https://github.com/vdimir))。
* SharedMutex を改善し、多数の同時実行クエリ時のパフォーマンスを向上。 [#87491](https://github.com/ClickHouse/ClickHouse/pull/87491) ([Raúl Marín](https://github.com/Algunenano)).
* 主に出現頻度の低いトークンで構成されるドキュメントにおけるテキストインデックス構築の性能を改善しました。 [#87546](https://github.com/ClickHouse/ClickHouse/pull/87546) ([Anton Popov](https://github.com/CurtizJ)).
* Field デストラクタの一般的なケースを高速化し、大量の小さなクエリに対するパフォーマンスを改善しました。 [#87631](https://github.com/ClickHouse/ClickHouse/pull/87631) ([Raúl Marín](https://github.com/Algunenano)).
* JOIN の最適化中にランタイムのハッシュテーブル統計情報の再計算をスキップするようにしました（JOIN を含むすべてのクエリのパフォーマンスが向上します）。新しいプロファイルイベント `JoinOptimizeMicroseconds` と `QueryPlanOptimizeMicroseconds` を追加しました。[#87683](https://github.com/ClickHouse/ClickHouse/pull/87683) ([Vladimir Cherkasov](https://github.com/vdimir))。
* MergeTreeLazy リーダーでマークをキャッシュに保存し、ダイレクト I/O を回避できるようにしました。これにより、ORDER BY と小さな LIMIT を指定したクエリのパフォーマンスが向上します。 [#87989](https://github.com/ClickHouse/ClickHouse/pull/87989) ([Nikita Taranov](https://github.com/nickitat)).
* `is_deleted` 列を持つ `ReplacingMergeTree` テーブルに対する `FINAL` 句付きの SELECT クエリが、既存の 2 つの最適化による並列化の改善により、これまでより高速に実行されるようになりました。1. 単一の `part` しか持たないパーティションに対して適用される `do_not_merge_across_partitions_select_final` 最適化。2. テーブル内のその他の選択レンジを `intersecting / non-intersecting` に分割し、`intersecting` なレンジだけが FINAL のマージ変換処理を通過するようにしたこと。[#88090](https://github.com/ClickHouse/ClickHouse/pull/88090) ([Shankar Iyer](https://github.com/shankar-iyer)).
* デバッグが無効な場合のデフォルトコードパスにおいて、fail points を使用しないことによる影響を軽減しました。 [#88196](https://github.com/ClickHouse/ClickHouse/pull/88196) ([Raúl Marín](https://github.com/Algunenano)).
* `uuid` でフィルタした `system.tables` に対するフルスキャンを回避（ログや ZooKeeper のパスから UUID だけが分かっている場合に有用）。 [#88379](https://github.com/ClickHouse/ClickHouse/pull/88379) ([Azat Khuzhin](https://github.com/azat)).
* 関数 `tokens`、`hasAllTokens`、`hasAnyTokens` の性能を改善しました。 [#88416](https://github.com/ClickHouse/ClickHouse/pull/88416) ([Anton Popov](https://github.com/CurtizJ)).
* 一部のケースにおいて JOIN のパフォーマンスをわずかに向上させるために、`AddedColumns::appendFromBlock` をインライン展開しました。 [#88455](https://github.com/ClickHouse/ClickHouse/pull/88455) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントのオートコンプリート機能は、複数のシステムテーブルへのクエリを発行するのではなく `system.completions` を使用することで、より高速かつ一貫性の高い動作になります。 [#84694](https://github.com/ClickHouse/ClickHouse/pull/84694) ([|2ustam](https://github.com/RuS2m))。
* 辞書圧縮を制御するための新しいテキストインデックスパラメータ `dictionary_block_frontcoding_compression` を追加しました。デフォルトでは有効で、`front-coding` 圧縮が使用されます。 [#87175](https://github.com/ClickHouse/ClickHouse/pull/87175) ([Elmi Ahmadov](https://github.com/ahmadov))。
* 設定 `min_insert_block_size_rows_for_materialized_views` および `min_insert_block_size_bytes_for_materialized_views` に応じて、すべてのスレッドからのデータをマテリアライズドビューに挿入する前にまとめてから挿入するように変更しました。以前は、`parallel_view_processing` が有効な場合、特定のマテリアライズドビューに挿入する各スレッドがそれぞれ独立してデータをまとめており、その結果、生成されるパーツの数が多くなる可能性がありました。 [#87280](https://github.com/ClickHouse/ClickHouse/pull/87280) ([Antonio Andelic](https://github.com/antonio2368)).
* 一時ファイルの書き込みで使用されるバッファサイズを制御するための設定 `temporary_files_buffer_size` を追加。* `LowCardinality` 列に対する `scatter` 操作（例えば grace hash join で使用される）のメモリ消費を最適化。 [#88237](https://github.com/ClickHouse/ClickHouse/pull/88237) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 並列レプリカ対応のテキストインデックスからの直接読み取りをサポートしました。オブジェクトストレージ上のテキストインデックスの読み取り性能を改善しました。 [#88262](https://github.com/ClickHouse/ClickHouse/pull/88262) ([Anton Popov](https://github.com/CurtizJ)).
* Data Lake カタログ内のテーブルを対象とするクエリでは、分散処理のために並列レプリカが利用されます。 [#88273](https://github.com/ClickHouse/ClickHouse/pull/88273) ([scanhex12](https://github.com/scanhex12)).
* &quot;to&#95;remove&#95;small&#95;parts&#95;at&#95;right&quot; という名前のバックグラウンドマージのアルゴリズムをチューニングするための内部ヒューリスティックが、マージ範囲スコアの計算より前に実行されるようになりました。それ以前は、マージセレクタは幅の広いマージを選択してから、その末尾部分をフィルタリングしていました。修正: [#85374](https://github.com/ClickHouse/ClickHouse/issues/85374)。[#88736](https://github.com/ClickHouse/ClickHouse/pull/88736) ([Mikhail Artemenko](https://github.com/Michicosun))。

#### 改善点 {#improvement}

* 関数 `generateSerialID` で、シリーズ名として非定数の引数を指定できるようになりました。Issue [#83750](https://github.com/ClickHouse/ClickHouse/issues/83750) をクローズしました。[#88270](https://github.com/ClickHouse/ClickHouse/pull/88270)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい系列の開始値を指定できるよう、`generateSerialID` 関数にオプションの `start_value` パラメータを追加しました。 [#88085](https://github.com/ClickHouse/ClickHouse/pull/88085) ([Manuel](https://github.com/raimannma)).
* `clickhouse-format` に `--semicolons_inline` オプションを追加し、セミコロンが改行されず最終行に配置されるようにクエリを整形できるようにしました。 [#88018](https://github.com/ClickHouse/ClickHouse/pull/88018) ([Jan Rada](https://github.com/ZelvaMan)).
* Keeper で設定が上書きされている場合でも、サーバーレベルのスロットリングを設定できるようにしました。[#73964](https://github.com/ClickHouse/ClickHouse/issues/73964) を解決。[#74066](https://github.com/ClickHouse/ClickHouse/pull/74066)（[JIaQi](https://github.com/JiaQiTang98)）。
* `mannWhitneyUTest` は、両方のサンプルが同一の値のみを含む場合でも例外をスローしなくなりました。SciPy と一貫した有効な結果を返すようになりました。これにより Issue: [#79814](https://github.com/ClickHouse/ClickHouse/issues/79814) がクローズされました。[#80009](https://github.com/ClickHouse/ClickHouse/pull/80009) ([DeanNeaht](https://github.com/DeanNeaht))。
* ディスクオブジェクトストレージの Rewrite トランザクションは、メタデータトランザクションがコミットされた場合、以前のリモート BLOB を削除するようになりました。 [#81787](https://github.com/ClickHouse/ClickHouse/pull/81787) ([Sema Checherinda](https://github.com/CheSema)).
* 最適化の前後で結果型の `LowCardinality` が異なる場合でも、冗長な等値式に対する最適化処理が正しく動作するよう修正しました。 [#82651](https://github.com/ClickHouse/ClickHouse/pull/82651) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* HTTP クライアントが `Expect: 100-continue` に加えて `X-ClickHouse-100-Continue: defer` ヘッダーを設定すると、ClickHouse はクォータ検証に合格するまでクライアントに `100 Continue` レスポンスを送信しないため、最終的に破棄されるリクエストボディを送信することによるネットワーク帯域の無駄を防げます。これは、クエリを URL のクエリ文字列で送信し、データをリクエストボディで送信する INSERT クエリの場合に関係します。ボディ全体を送信せずにリクエストを中止すると、HTTP/1.1 でのコネクション再利用はできなくなりますが、新しいコネクションを開くことで生じる追加レイテンシは、大量データの INSERT における全体の処理時間と比べると通常は無視できる程度です。[#84304](https://github.com/ClickHouse/ClickHouse/pull/84304)（[c-end](https://github.com/c-end)）。
* S3 ストレージを使用する `DATABASE ENGINE = Backup` の利用時に、ログに出力される S3 の認証情報をマスクするようにしました。 [#85336](https://github.com/ClickHouse/ClickHouse/pull/85336) ([Kenny Sun](https://github.com/hwabis)).
* クエリプランの最適化が相関サブクエリの入力サブプランからも見えるように、そのマテリアライズを遅延させました。[#79890](https://github.com/ClickHouse/ClickHouse/issues/79890) の一部。[#85455](https://github.com/ClickHouse/ClickHouse/pull/85455)（[Dmitry Novik](https://github.com/novikd)）。
* SYSTEM DROP DATABASE REPLICA の変更: - データベースを指定してドロップする場合、またはレプリカ全体をドロップする場合: データベース内の各テーブルのレプリカも併せてドロップされます - `WITH TABLES` が指定されている場合、各ストレージのレプリカをドロップします - それ以外の場合、ロジックは変更されず、データベースレプリカのみをドロップします - Keeper パスを指定してデータベースレプリカをドロップする場合: - `WITH TABLES` が指定されている場合: - データベースを Atomic として復元します - Keeper 内のステートメントから RMT テーブルを復元します - データベースをドロップします (復元されたテーブルも同時にドロップされます) - それ以外の場合は、指定された Keeper パス上のレプリカのみをドロップします。 [#85637](https://github.com/ClickHouse/ClickHouse/pull/85637) ([Tuan Pham Anh](https://github.com/tuanpach)).
* TTL に `materialize` 関数が含まれている場合のフォーマットの不整合を修正しました。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズしました。[#85749](https://github.com/ClickHouse/ClickHouse/pull/85749)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Iceberg テーブルの状態は、今後はストレージオブジェクト内には保存されません。これにより、ClickHouse における Iceberg は同時実行クエリ環境でも利用可能になる想定です。 [#86062](https://github.com/ClickHouse/ClickHouse/pull/86062) ([Daniil Ivanik](https://github.com/divanik)).
* `use_persistent_processing_nodes = 1` の場合の処理ノードと同様に、S3Queue の ordered モードにおける bucket lock を永続モードとします。テストに Keeper のフォルトインジェクションを追加します。 [#86628](https://github.com/ClickHouse/ClickHouse/pull/86628) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ユーザーがフォーマット名をタイプミスした場合にヒントを表示するようにしました。 [#86761](https://github.com/ClickHouse/ClickHouse/issues/86761) をクローズ。 [#87092](https://github.com/ClickHouse/ClickHouse/pull/87092)（[flynn](https://github.com/ucasfl)）。
* プロジェクションが存在しない場合、リモートレプリカはインデックスの解析をスキップします。 [#87096](https://github.com/ClickHouse/ClickHouse/pull/87096) ([zoomxi](https://github.com/zoomxi)).
* ytsaurus テーブルに対して UTF-8 エンコーディングを無効化できるようにしました。 [#87150](https://github.com/ClickHouse/ClickHouse/pull/87150) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `s3_slow_all_threads_after_retryable_error` をデフォルトで無効にしました。 [#87198](https://github.com/ClickHouse/ClickHouse/pull/87198) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* テーブル関数 `arrowflight` の名前を `arrowFlight` に変更しました。 [#87249](https://github.com/ClickHouse/ClickHouse/pull/87249) ([Vitaly Baranov](https://github.com/vitlibar)).
* `clickhouse-benchmark` を更新し、CLI フラグで `_` の代わりに `-` を使用できるようにしました。 [#87251](https://github.com/ClickHouse/ClickHouse/pull/87251) ([Ahmed Gouda](https://github.com/0xgouda)).
* シグナルハンドリング時の `system.crash_log` へのフラッシュを同期処理にしました。[#87253](https://github.com/ClickHouse/ClickHouse/pull/87253) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `inject_random_order_for_select_without_order_by` 設定を追加しました。この設定は、`ORDER BY` 句が指定されていないトップレベルの `SELECT` クエリに `ORDER BY rand()` を自動的に挿入します。 [#87261](https://github.com/ClickHouse/ClickHouse/pull/87261) ([Rui Zhang](https://github.com/zhangruiddn))。
* `joinGet` のエラーメッセージを改善し、`join_keys` の数が `right_table_keys` の数と一致していないことを正しく示すようにしました。 [#87279](https://github.com/ClickHouse/ClickHouse/pull/87279) ([Isak Ellmer](https://github.com/spinojara)).
* 書き込みトランザクション中に任意の Keeper ノードの stat を確認できるようにしました。これにより、ABA 問題の検出に役立ちます。 [#87282](https://github.com/ClickHouse/ClickHouse/pull/87282) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 重い ytsaurus リクエストを heavy プロキシにリダイレクトするようにしました。 [#87342](https://github.com/ClickHouse/ClickHouse/pull/87342) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* ディスクトランザクション由来のメタデータに対して、あらゆるワークロードにおける `unlink`/`rename`/`removeRecursive`/`removeDirectory`/その他の操作のロールバックおよびハードリンク数を修正し、インターフェイスを簡素化してより汎用的なものとすることで、他のメタストアでも再利用できるようにしました。 [#87358](https://github.com/ClickHouse/ClickHouse/pull/87358) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Keeper で `TCP_NODELAY` を無効化できる `keeper_server.tcp_nodelay` 設定パラメータを追加しました。 [#87363](https://github.com/ClickHouse/ClickHouse/pull/87363) (Copilot)。
* `clickhouse-benchmarks` で `--connection` をサポートしました。これは `clickhouse-client` でサポートされているものと同じで、クライアントの `config.xml`/`config.yaml` の `connections_credentials` パス配下に事前定義した接続を指定することで、コマンドライン引数で明示的にユーザー名およびパスワードを指定する必要がなくなります。`clickhouse-benchmark` に `--accept-invalid-certificate` のサポートを追加しました。 [#87370](https://github.com/ClickHouse/ClickHouse/pull/87370) ([Azat Khuzhin](https://github.com/azat)).
* `max_insert_threads` の設定が Iceberg テーブルでも有効になりました。 [#87407](https://github.com/ClickHouse/ClickHouse/pull/87407) ([alesapin](https://github.com/alesapin)).
* `PrometheusMetricsWriter` にヒストグラムおよび次元メトリクスを追加しました。これにより、`PrometheusRequestHandler` で必要なメトリクスが一通り揃い、クラウド環境における信頼性が高く低オーバーヘッドなメトリクス収集に利用できるようになります。[#87521](https://github.com/ClickHouse/ClickHouse/pull/87521)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* 関数 `hasToken` は、空のトークンを指定した場合、以前は例外をスローしていましたが、現在はマッチ件数 0 を返すようになりました。 [#87564](https://github.com/ClickHouse/ClickHouse/pull/87564) ([Jimmy Aguilar Mena](https://github.com/Ergus))。
* `Array` および `Map`（`mapKeys` と `mapValues`）の値に対するテキストインデックス対応を追加しました。サポートされる関数は `mapContainsKey` と `has` です。 [#87602](https://github.com/ClickHouse/ClickHouse/pull/87602) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 有効期限が切れたグローバル ZooKeeper セッションの数を示す新しい `ZooKeeperSessionExpired` メトリクスを追加しました。 [#87613](https://github.com/ClickHouse/ClickHouse/pull/87613) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* バックアップ先へのサーバーサイド（ネイティブ）コピーには、バックアップ専用の設定（たとえば backup&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;s3&#95;error）を持つ S3 ストレージクライアントを使用します。s3&#95;slow&#95;all&#95;threads&#95;after&#95;retryable&#95;error を非推奨にします。 [#87660](https://github.com/ClickHouse/ClickHouse/pull/87660) ([Julia Kartseva](https://github.com/jkartseva)).
* 実験的機能である `make_distributed_plan` を用いたクエリプランのシリアライズ時に、設定 `max_joined_block_size_rows` および `max_joined_block_size_bytes` が誤って処理されていた問題を修正しました。 [#87675](https://github.com/ClickHouse/ClickHouse/pull/87675) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 設定 `enable_http_compression` はデフォルトで有効になりました。これは、クライアントが HTTP 圧縮を受け入れる場合、サーバーがそれを使用することを意味します。ただし、この変更にはいくつかのデメリットがあります。クライアントは `bzip2` のような重い圧縮方式をリクエストすることができ、これは現実的ではなく、サーバーのリソース消費を増大させます（ただし、これは大きな結果が転送される場合にのみ顕在化します）。クライアントは `gzip` をリクエストすることもできます。これはそれほど悪くはありませんが、`zstd` と比較すると最適ではありません。[#71591](https://github.com/ClickHouse/ClickHouse/issues/71591) をクローズします。[#87703](https://github.com/ClickHouse/ClickHouse/pull/87703)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.server_settings` に新しいエントリ `keeper_hosts` を追加し、ClickHouse が接続可能な [Zoo]Keeper ホストの一覧を参照できるようにしました。[#87718](https://github.com/ClickHouse/ClickHouse/pull/87718)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 過去データの調査を容易にするため、システムダッシュボードに `from` と `to` の値を追加しました。 [#87823](https://github.com/ClickHouse/ClickHouse/pull/87823) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* Iceberg の SELECT クエリでのパフォーマンス追跡用の情報を追加。[#87903](https://github.com/ClickHouse/ClickHouse/pull/87903) ([Daniil Ivanik](https://github.com/divanik)).
* ファイルシステムキャッシュの改善: キャッシュ内の領域を並行して確保するスレッド間で、キャッシュ優先度イテレータを再利用するようにしました。 [#87914](https://github.com/ClickHouse/ClickHouse/pull/87914) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `Keeper` 向けのリクエストサイズを制限できるようにしました（`max_request_size` 設定。`ZooKeeper` の `jute.maxbuffer` と同等で、後方互換性のためデフォルトは OFF のままですが、今後のリリースで設定される予定です）。 [#87952](https://github.com/ClickHouse/ClickHouse/pull/87952) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark` がデフォルトでエラーメッセージにスタックトレースを含めないように変更しました。 [#87954](https://github.com/ClickHouse/ClickHouse/pull/87954) ([Ahmed Gouda](https://github.com/0xgouda)).
* マークがキャッシュ内にある場合には、スレッドプールによる非同期マーク読み込み（`load_marks_asynchronously=1`）を利用しないでください（プールに負荷がかかっていると、マークがすでにキャッシュに存在していても、クエリがそのためのペナルティを支払うことになるため）。 [#87967](https://github.com/ClickHouse/ClickHouse/pull/87967) ([Azat Khuzhin](https://github.com/azat))。
* Ytsaurus: カラムのサブセットのみを含むテーブル／テーブル関数／ディクショナリを作成できるようにしました。 [#87982](https://github.com/ClickHouse/ClickHouse/pull/87982) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 今後は、`system.zookeeper_connection_log` がデフォルトで有効になり、Keeper セッションに関する情報の取得に利用できます。 [#88011](https://github.com/ClickHouse/ClickHouse/pull/88011) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* 重複した外部テーブルが渡された場合の TCP と HTTP の動作を一貫させました。HTTP では、一時テーブルを複数回渡すことができます。 [#88032](https://github.com/ClickHouse/ClickHouse/pull/88032) ([Sema Checherinda](https://github.com/CheSema))。
* Arrow/ORC/Parquet 読み取り用のカスタム MemoryPool を削除しました。[#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) 以降は、いずれにせよすべての割り当てを追跡するようになったため、このコンポーネントは不要になったようです。[#88035](https://github.com/ClickHouse/ClickHouse/pull/88035)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 引数を指定せずに `Replicated` データベースを作成できるようにしました。 [#88044](https://github.com/ClickHouse/ClickHouse/pull/88044) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-keeper-client`: clickhouse-keeper の TLS ポートへの接続をサポートし、フラグ名は `clickhouse-client` と同一に保ちました。 [#88065](https://github.com/ClickHouse/ClickHouse/pull/88065) ([Pradeep Chhetri](https://github.com/chhetripradeep)).
* メモリ制限を超過したためにバックグラウンドマージが拒否された回数を追跡する新しいプロファイルイベントを追加しました。 [#88084](https://github.com/ClickHouse/ClickHouse/pull/88084) ([Grant Holly](https://github.com/grantholly-clickhouse))。
* CREATE/ALTER TABLE の列デフォルト式を検証するアナライザーを有効化。 [#88087](https://github.com/ClickHouse/ClickHouse/pull/88087) ([Max Justus Spransy](https://github.com/maxjustus)).
* 内部クエリプランの改善: `CROSS JOIN` に JoinStepLogical を使用。 [#88151](https://github.com/ClickHouse/ClickHouse/pull/88151) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `hasAnyTokens` 関数のエイリアスとして `hasAnyToken` を、`hasAllTokens` 関数のエイリアスとして `hasAllToken` を追加しました。 [#88162](https://github.com/ClickHouse/ClickHouse/pull/88162) ([George Larionov](https://github.com/george-larionov))。
* グローバルなサンプリングプロファイラをデフォルトで有効化しました（つまり、クエリに関連しないサーバースレッドも対象とする）。すべてのスレッドについて、CPU 時間および実時間の両方で 10 秒ごとにスタックトレースを収集します。 [#88209](https://github.com/ClickHouse/ClickHouse/pull/88209) ([Alexander Tokmakov](https://github.com/tavplubix))。
* コピーおよびコンテナー作成機能で発生していた &#39;Content-Length&#39; の問題への修正を取り込むよう、Azure SDK を更新。 [#88278](https://github.com/ClickHouse/ClickHouse/pull/88278) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 関数 `lag` を MySQL との互換性向上のために大文字小文字を区別しないようにしました。 [#88322](https://github.com/ClickHouse/ClickHouse/pull/88322) ([Lonny Kapelushnik](https://github.com/lonnylot)).
* `clickhouse-server` ディレクトリから `clickhouse-local` を起動できるようにしました。以前のバージョンでは、`Cannot parse UUID: .` というエラーが発生していました。これにより、サーバーを起動せずに `clickhouse-local` を起動し、サーバーのデータベースを操作できるようになりました。 [#88383](https://github.com/ClickHouse/ClickHouse/pull/88383) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `keeper_server.coordination_settings.check_node_acl_on_remove` 設定を追加しました。有効になっている場合、各ノード削除の前に、そのノード自身と親ノードの両方の ACL が検証されます。無効になっている場合は、親ノードの ACL のみが検証されます。 [#88513](https://github.com/ClickHouse/ClickHouse/pull/88513) ([Antonio Andelic](https://github.com/antonio2368)).
* `Vertical` フォーマット使用時に `JSON` カラムが整形表示されるようになりました。[#81794](https://github.com/ClickHouse/ClickHouse/issues/81794) をクローズ。[#88524](https://github.com/ClickHouse/ClickHouse/pull/88524)（[Frank Rosner](https://github.com/FRosner)）。
* `clickhouse-client` のファイル（例: クエリ履歴）をホームディレクトリのルートではなく、[XDG Base Directories](https://specifications.freedesktop.org/basedir-spec/latest/index.html) 仕様で規定された場所に保存するようにしました。`~/.clickhouse-client-history` がすでに存在する場合は、引き続きそちらが使用されます。[#88538](https://github.com/ClickHouse/ClickHouse/pull/88538) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `GLOBAL IN` によるメモリリークを修正しました（[https://github.com/ClickHouse/ClickHouse/issues/88615](https://github.com/ClickHouse/ClickHouse/issues/88615)）。[#88617](https://github.com/ClickHouse/ClickHouse/pull/88617)（[pranavmehta94](https://github.com/pranavmehta94)）。
* hasAny/hasAllTokens に文字列入力を受け付けるオーバーロードを追加しました。 [#88679](https://github.com/ClickHouse/ClickHouse/pull/88679) ([George Larionov](https://github.com/george-larionov)).
* `clickhouse-keeper` がブート時に自動起動するように、postinstall スクリプトにステップを追加。 [#88746](https://github.com/ClickHouse/ClickHouse/pull/88746) ([YenchangChan](https://github.com/YenchangChan)).
* Web UI では、すべてのキー入力のたびにではなく、貼り付け時にのみ認証情報を検証するようにしました。これにより、誤構成された LDAP サーバーによる問題を回避できます。これにより [#85777](https://github.com/ClickHouse/ClickHouse/issues/85777) がクローズされました。[#88769](https://github.com/ClickHouse/ClickHouse/pull/88769)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 制約違反が発生した場合の例外メッセージの長さを制限するようにしました。以前のバージョンでは、非常に長い文字列が挿入されたときに、同様に非常に長い例外メッセージが生成され、それが `query_log` に書き込まれてしまうことがありました。この変更により [#87032](https://github.com/ClickHouse/ClickHouse/issues/87032) がクローズされました。[#88801](https://github.com/ClickHouse/ClickHouse/pull/88801)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* テーブル作成時に ArrowFlight サーバーからデータセット構造を取得する処理を修正。 [#87542](https://github.com/ClickHouse/ClickHouse/pull/87542) ([Vitaly Baranov](https://github.com/vitlibar)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* クライアントプロトコルエラーの原因となっていた GeoParquet を修正。 [#84020](https://github.com/ClickHouse/ClickHouse/pull/84020) ([Michael Kolupaev](https://github.com/al13n321)).
* イニシエーターノード上のサブクエリ内で、`shardNum()` などのホスト依存関数の解決を修正しました。 [#84409](https://github.com/ClickHouse/ClickHouse/pull/84409) ([Eduard Karacharov](https://github.com/korowa)).
* `parseDateTime64BestEffort`、`change{Year,Month,Day}`、`makeDateTime64` などの各種日時関連関数において、エポック以前の日付で小数秒を含む値を誤って処理してしまう不具合を修正しました。以前は、秒に小数部分を加算すべきところで減算していました。たとえば、`parseDateTime64BestEffort('1969-01-01 00:00:00.468')` は、本来 `1969-01-01 00:00:00.468` を返すべきところ、`1968-12-31 23:59:59.532` を返していました。 [#85396](https://github.com/ClickHouse/ClickHouse/pull/85396) ([xiaohuanlin](https://github.com/xiaohuanlin))。
* 同一の ALTER ステートメント内でカラムの状態が変更される場合に、ALTER COLUMN IF EXISTS コマンドが失敗する問題を修正しました。DROP COLUMN IF EXISTS、MODIFY COLUMN IF EXISTS、COMMENT COLUMN IF EXISTS、RENAME COLUMN IF EXISTS などのコマンドは、同一ステートメント内の前のコマンドでカラムが削除されているケースを正しく処理するようになりました。 [#86046](https://github.com/ClickHouse/ClickHouse/pull/86046) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* サポート対象範囲外の日付に対する Date/DateTime/DateTime64 型の推論を修正しました。 [#86184](https://github.com/ClickHouse/ClickHouse/pull/86184) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部の有効なユーザー送信データが `AggregateFunction(quantileDD)` カラムに含まれていると、マージ処理中に無限再帰が発生してクラッシュする問題を修正します。 [#86560](https://github.com/ClickHouse/ClickHouse/pull/86560) ([Raphaël Thériault](https://github.com/raphael-theriault-swi))。
* `cluster` テーブル関数で作成されたテーブルで JSON/Dynamic 型をサポートしました。 [#86821](https://github.com/ClickHouse/ClickHouse/pull/86821) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリ内で CTE で計算される関数の結果が非決定的になる不具合を修正。 [#86967](https://github.com/ClickHouse/ClickHouse/pull/86967) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 主キー列に対する pointInPolygon を用いた EXPLAIN で発生する LOGICAL&#95;ERROR を修正。 [#86971](https://github.com/ClickHouse/ClickHouse/pull/86971) ([Michael Kolupaev](https://github.com/al13n321)).
* 名前にパーセントエンコードされたシーケンスを含むデータレイクテーブルを修正。[#86626](https://github.com/ClickHouse/ClickHouse/issues/86626) をクローズ。[#87020](https://github.com/ClickHouse/ClickHouse/pull/87020)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `optimize_functions_to_subcolumns` を使用した `OUTER JOIN` における Nullable カラムでの `IS NULL` の誤った動作を修正し、[#78625](https://github.com/ClickHouse/ClickHouse/issues/78625) をクローズしました。 [#87058](https://github.com/ClickHouse/ClickHouse/pull/87058)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `max_temporary_data_on_disk_size` 制限の追跡において、一時データの解放を誤って計上していた問題を修正しました。[#87118](https://github.com/ClickHouse/ClickHouse/issues/87118) をクローズしました。[#87140](https://github.com/ClickHouse/ClickHouse/pull/87140)（[JIaQi](https://github.com/JiaQiTang98)）。
* 関数 `checkHeaders` は、提供されたヘッダーを適切に検証し、禁止されているヘッダーを拒否するようになりました。元の著者: Michael Anastasakis (@michael-anastasakis)。[#87172](https://github.com/ClickHouse/ClickHouse/pull/87172)（[Raúl Marín](https://github.com/Algunenano)）。
* すべての数値型に対して `toDate` と `toDate32` が同じ動作をするようにしました。int16 からのキャスト時における Date32 のアンダーフローの検査を修正しました。 [#87176](https://github.com/ClickHouse/ClickHouse/pull/87176) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 複数の JOIN を含むクエリで、特に LEFT/INNER JOIN の後に RIGHT JOIN が続く場合に、parallel replicas で発生していた論理エラーを修正しました。 [#87178](https://github.com/ClickHouse/ClickHouse/pull/87178) ([Igor Nikonov](https://github.com/devcrafter)).
* スキーマ推論キャッシュで `input_format_try_infer_variants` 設定を考慮するようにしました。 [#87180](https://github.com/ClickHouse/ClickHouse/pull/87180) ([Pavel Kruglov](https://github.com/Avogar)).
* `pathStartsWith` がプレフィックス直下のパスにのみマッチするように変更しました。 [#87181](https://github.com/ClickHouse/ClickHouse/pull/87181) ([Raúl Marín](https://github.com/Algunenano)).
* `_row_number` 仮想カラムと Iceberg の位置指定削除における論理エラーを修正しました。 [#87220](https://github.com/ClickHouse/ClickHouse/pull/87220) ([Michael Kolupaev](https://github.com/al13n321))。
* const ブロックと非 const ブロックが混在していたことが原因で `JOIN` で発生していた「Too large size passed to allocator」`LOGICAL_ERROR` を修正。 [#87231](https://github.com/ClickHouse/ClickHouse/pull/87231) ([Azat Khuzhin](https://github.com/azat)).
* 他の `MergeTree` テーブルを読み取るサブクエリを伴う軽量更新を修正しました。 [#87285](https://github.com/ClickHouse/ClickHouse/pull/87285) ([Anton Popov](https://github.com/CurtizJ)).
* 行ポリシーが存在する場合に機能していなかった move-to-prewhere 最適化を修正しました。[#85118](https://github.com/ClickHouse/ClickHouse/issues/85118) の後続対応です。[#69777](https://github.com/ClickHouse/ClickHouse/issues/69777) をクローズします。[#83748](https://github.com/ClickHouse/ClickHouse/issues/83748) をクローズします。[#87303](https://github.com/ClickHouse/ClickHouse/pull/87303)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* データパーツ内に存在しない、デフォルト式を持つ列へのパッチ適用の問題を修正しました。 [#87347](https://github.com/ClickHouse/ClickHouse/pull/87347) ([Anton Popov](https://github.com/CurtizJ)).
* MergeTree テーブルでパーティションの列名が重複している場合に発生していたセグメンテーションフォルトを修正しました。 [#87365](https://github.com/ClickHouse/ClickHouse/pull/87365) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* EmbeddedRocksDB のアップグレード処理を修正。[#87392](https://github.com/ClickHouse/ClickHouse/pull/87392) ([Raúl Marín](https://github.com/Algunenano)).
* オブジェクトストレージ上にあるテキストインデックスからの直接読み取りを修正しました。 [#87399](https://github.com/ClickHouse/ClickHouse/pull/87399) ([Anton Popov](https://github.com/CurtizJ)).
* 存在しないエンジンに対する権限が作成されてしまうのを防止しました。 [#87419](https://github.com/ClickHouse/ClickHouse/pull/87419) ([Jitendra](https://github.com/jitendra1411)).
* `s3_plain_rewritable` に対しては「not found」エラーのみを無視するようにしました（それ以外のエラーを無視すると、あらゆる問題を引き起こす可能性があります）。 [#87426](https://github.com/ClickHouse/ClickHouse/pull/87426) ([Azat Khuzhin](https://github.com/azat)).
* YTSaurus ソースおよび *range&#95;hashed レイアウトを使用するディクショナリを修正しました。 [#87490](https://github.com/ClickHouse/ClickHouse/pull/87490) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 空タプルの配列を作成する際の処理を修正。 [#87520](https://github.com/ClickHouse/ClickHouse/pull/87520) ([Pavel Kruglov](https://github.com/Avogar)).
* 一時テーブル作成時に不正なカラムをチェックするようにしました。 [#87524](https://github.com/ClickHouse/ClickHouse/pull/87524) ([Pavel Kruglov](https://github.com/Avogar)).
* Hive パーティション列をフォーマットヘッダーに含めないようにしました。次の問題を修正: [#87515](https://github.com/ClickHouse/ClickHouse/issues/87515). [#87528](https://github.com/ClickHouse/ClickHouse/pull/87528) ([Arthur Passos](https://github.com/arthurpassos)).
* テキストフォーマット使用時の DeltaLake におけるフォーマットからの読み込み準備を修正。 [#87529](https://github.com/ClickHouse/ClickHouse/pull/87529) ([Pavel Kruglov](https://github.com/Avogar)).
* Buffer テーブルに対する SELECT および INSERT 時のアクセス検証を修正。 [#87545](https://github.com/ClickHouse/ClickHouse/pull/87545) ([pufit](https://github.com/pufit)).
* S3 テーブルに対する data skipping index の作成を禁止しました。 [#87554](https://github.com/ClickHouse/ClickHouse/pull/87554) ([Bharat Nallan](https://github.com/bharatnc)).
* 非同期ロギングにおけるトラッキング対象メモリのリークを回避しました（10時間で約100GiBもの大きなドリフトが発生し得る問題）、および `text_log` におけるリークも回避しました（ほぼ同様のドリフトが発生する可能性がありました）。 [#87584](https://github.com/ClickHouse/ClickHouse/pull/87584) ([Azat Khuzhin](https://github.com/azat)).
* ビューまたはマテリアライズドビューの SELECT クエリ設定が、グローバルなサーバー設定を上書きしてしまう可能性のある不具合を修正しました。この問題は、該当ビューが非同期に削除され、バックグラウンドでのクリーンアップが完了する前にサーバーが再起動された場合に発生する可能性がありました。 [#87603](https://github.com/ClickHouse/ClickHouse/pull/87603) ([Alexander Tokmakov](https://github.com/tavplubix))。
* メモリ過負荷の警告を計算する際に、可能であればユーザー空間ページキャッシュのバイト数を除外します。 [#87610](https://github.com/ClickHouse/ClickHouse/pull/87610) ([Bharat Nallan](https://github.com/bharatnc)).
* CSV デシリアライズ時の型の順序が誤っている場合に `LOGICAL_ERROR` が発生していたバグを修正しました。 [#87622](https://github.com/ClickHouse/ClickHouse/pull/87622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 実行可能ディクショナリにおける `command_read_timeout` の不正な扱いを修正しました。 [#87627](https://github.com/ClickHouse/ClickHouse/pull/87627) ([Azat Khuzhin](https://github.com/azat)).
* 新しい analyzer で、置換されたカラムでフィルタリングする際の `WHERE` 句における `SELECT * REPLACE` の誤った動作を修正しました。 [#87630](https://github.com/ClickHouse/ClickHouse/pull/87630) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* `Distributed` 上で `Merge` を使用した場合の二段階集約処理を修正しました。 [#87687](https://github.com/ClickHouse/ClickHouse/pull/87687) ([c-end](https://github.com/c-end)).
* `right row list` が使用されていない場合の HashJoin アルゴリズムにおける出力ブロック生成を修正しました。[#87401](https://github.com/ClickHouse/ClickHouse/issues/87401) を解決します。 [#87699](https://github.com/ClickHouse/ClickHouse/pull/87699)（[Dmitry Novik](https://github.com/novikd)）。
* インデックス解析の結果、読み取るデータが存在しない場合に、Parallel replicas の読み取りモードが誤って選択される可能性がありました。 [#87653](https://github.com/ClickHouse/ClickHouse/issues/87653) をクローズしました。 [#87700](https://github.com/ClickHouse/ClickHouse/pull/87700) ([zoomxi](https://github.com/zoomxi))。
* Glue での `timestamp` / `timestamptz` 列の処理を修正。[#87733](https://github.com/ClickHouse/ClickHouse/pull/87733) ([Andrey Zvonov](https://github.com/zvonand))。
* これにより [#86587](https://github.com/ClickHouse/ClickHouse/issues/86587) がクローズされます。 [#87761](https://github.com/ClickHouse/ClickHouse/pull/87761)（[scanhex12](https://github.com/scanhex12)）。
* PostgreSQL インターフェースにおける Boolean 値の書き込み処理を修正。 [#87762](https://github.com/ClickHouse/ClickHouse/pull/87762) ([Artem Yurov](https://github.com/ArtemYurov))。
* CTE を使用した INSERT SELECT クエリで発生する「unknown table」エラーを修正。 [#85368](https://github.com/ClickHouse/ClickHouse/issues/85368)。 [#87789](https://github.com/ClickHouse/ClickHouse/pull/87789) ([Guang Zhao](https://github.com/zheguang))。
* Nullable の内部に含められない Variant から null の map サブカラムを読み取る処理を修正。 [#87798](https://github.com/ClickHouse/ClickHouse/pull/87798) ([Pavel Kruglov](https://github.com/Avogar)).
* セカンダリノードでクラスタ上のデータベースを完全に削除できなかった場合のエラー処理を修正しました。 [#87802](https://github.com/ClickHouse/ClickHouse/pull/87802) ([Tuan Pham Anh](https://github.com/tuanpach)).
* 複数の skip インデックスに関するバグを修正しました。[#87817](https://github.com/ClickHouse/ClickHouse/pull/87817) ([Raúl Marín](https://github.com/Algunenano))。
* AzureBlobStorage において、まずネイティブコピーを試行し、「Unauthroized」エラーが発生した場合に読み取り＆書き込みに切り替えるよう更新しました（AzureBlobStorage では、ソースとデスティネーションでストレージアカウントが異なる場合、「Unauthorized」エラーが発生します）。また、設定で endpoint が定義されている場合に &quot;use&#95;native&#95;copy&quot; が適用されるよう修正しました。 [#87826](https://github.com/ClickHouse/ClickHouse/pull/87826) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* ArrowStream ファイルに一意ではない辞書が含まれている場合に ClickHouse がクラッシュする不具合がありました。 [#87863](https://github.com/ClickHouse/ClickHouse/pull/87863) ([Ilya Golshtein](https://github.com/ilejn)).
* approx&#95;top&#95;k および finalizeAggregation 使用時に発生する致命的な問題を修正。 [#87892](https://github.com/ClickHouse/ClickHouse/pull/87892) ([Jitendra](https://github.com/jitendra1411)).
* 最後のブロックが空の場合のプロジェクションを使用したマージを修正しました。 [#87928](https://github.com/ClickHouse/ClickHouse/pull/87928) ([Raúl Marín](https://github.com/Algunenano))。
* 引数型が GROUP BY で許可されていない場合には、`injective` 関数を GROUP BY から削除しないようにしました。 [#87958](https://github.com/ClickHouse/ClickHouse/pull/87958) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリで `session_timezone` 設定を使用した場合に、datetime ベースのキーに対する granule / パーティションの除外が誤って行われていた問題を修正。[#87987](https://github.com/ClickHouse/ClickHouse/pull/87987) ([Eduard Karacharov](https://github.com/korowa)).
* PostgreSQL インターフェースで、クエリ実行後に影響を受けた行数を返すようになりました。 [#87990](https://github.com/ClickHouse/ClickHouse/pull/87990) ([Artem Yurov](https://github.com/ArtemYurov)).
* 誤った結果を招く可能性があるため、PASTE JOIN に対するフィルタープッシュダウンの適用を制限しました。 [#88078](https://github.com/ClickHouse/ClickHouse/pull/88078) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* [https://github.com/ClickHouse/ClickHouse/pull/84503](https://github.com/ClickHouse/ClickHouse/pull/84503) で導入された権限チェックの評価前に、URI の正規化を適用します。[#88089](https://github.com/ClickHouse/ClickHouse/pull/88089)（[pufit](https://github.com/pufit)）。
* 新しいアナライザーで `ARRAY JOIN COLUMNS()` がどの列にもマッチしない場合に発生する論理エラーを修正。 [#88091](https://github.com/ClickHouse/ClickHouse/pull/88091) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 「High ClickHouse memory usage」警告でページキャッシュを除外するように修正。 [#88092](https://github.com/ClickHouse/ClickHouse/pull/88092) ([Azat Khuzhin](https://github.com/azat)).
* `TTL` が設定された `MergeTree` テーブルでデータ破損を引き起こす可能性のあった問題を修正しました。 [#88095](https://github.com/ClickHouse/ClickHouse/pull/88095) ([Anton Popov](https://github.com/CurtizJ)).
* 外部データベース（`PostgreSQL` / `SQLite` / ...）がアタッチされており、その中に不正なテーブルが存在する場合に、`system.tables` を読み取る際に発生しうる未捕捉例外を修正しました。 [#88105](https://github.com/ClickHouse/ClickHouse/pull/88105) ([Azat Khuzhin](https://github.com/azat)).
* 空のタプル引数で呼び出された場合にクラッシュする `mortonEncode` および `hilbertEncode` 関数の不具合を修正しました。 [#88110](https://github.com/ClickHouse/ClickHouse/pull/88110) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* これにより、クラスタ内に非アクティブなレプリカが存在する場合でも、`ON CLUSTER` クエリの実行時間が短くなります。 [#88153](https://github.com/ClickHouse/ClickHouse/pull/88153) ([alesapin](https://github.com/alesapin))。
* DDL worker がレプリカセットから古いホストをクリーンアップするようになりました。これにより ZooKeeper に保存されるメタデータ量が削減されます。 [#88154](https://github.com/ClickHouse/ClickHouse/pull/88154) ([alesapin](https://github.com/alesapin)).
* cgroups なしで ClickHouse を実行できない問題を修正（非同期メトリクス用に誤って cgroups が必須要件となっていた）。 [#88164](https://github.com/ClickHouse/ClickHouse/pull/88164) ([Azat Khuzhin](https://github.com/azat)).
* エラーが発生した場合にディレクトリ移動操作を正しく取り消せるようにしました。実行中に変更されたルートのものだけでなく、変更されたすべての `prefix.path` オブジェクトを書き戻す必要があります。 [#88198](https://github.com/ClickHouse/ClickHouse/pull/88198) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `ColumnLowCardinality` における `is_shared` フラグの伝搬を修正しました。`ReverseIndex` でハッシュ値がすでに事前に計算およびキャッシュされた後にそのカラムに新しい値が挿入されると、誤った GROUP BY の結果を引き起こす可能性がありました。 [#88213](https://github.com/ClickHouse/ClickHouse/pull/88213) ([Nikita Taranov](https://github.com/nickitat))。
* ワークロード設定 `max_cpu_share` の挙動を修正しました。これにより、`max_cpus` ワークロード設定を指定しなくても使用できるようになりました。 [#88217](https://github.com/ClickHouse/ClickHouse/pull/88217) ([Neerav](https://github.com/neeravsalaria)).
* サブクエリを含む非常に重い mutation が prepare ステージで行き詰まってしまうバグを修正しました。現在は `SYSTEM STOP MERGES` を使用してこれらの mutation を停止できるようになりました。 [#88241](https://github.com/ClickHouse/ClickHouse/pull/88241) ([alesapin](https://github.com/alesapin)).
* 相関サブクエリがオブジェクトストレージでも動作するようになりました。 [#88290](https://github.com/ClickHouse/ClickHouse/pull/88290) ([alesapin](https://github.com/alesapin)).
* `system.projections` および `system.data_skipping_indices` にアクセスしている間は DataLake データベースを初期化しないようにしました。 [#88330](https://github.com/ClickHouse/ClickHouse/pull/88330) ([Azat Khuzhin](https://github.com/azat)).
* 今後は、`show_data_lake_catalogs_in_system_tables` が明示的に有効化されている場合にのみ、データレイクカタログがイントロスペクション用の system テーブルに表示されます。 [#88341](https://github.com/ClickHouse/ClickHouse/pull/88341) ([alesapin](https://github.com/alesapin)).
* DatabaseReplicated が `interserver_http_host` 設定を参照するように修正しました。 [#88378](https://github.com/ClickHouse/ClickHouse/pull/88378) ([xiaohuanlin](https://github.com/xiaohuanlin)).
* 位置引数は、Projections を定義するコンテキストでは明示的に無効化されました。これは、この内部クエリ処理段階では位置引数が適切でないためです。この変更により [#48604](https://github.com/ClickHouse/ClickHouse/issues/48604) が修正されました。 [#88380](https://github.com/ClickHouse/ClickHouse/pull/88380) ([Amos Bird](https://github.com/amosbird))。
* `countMatches` 関数の二乗オーダーの計算量を改善しました。[#88400](https://github.com/ClickHouse/ClickHouse/issues/88400) をクローズ。[#88401](https://github.com/ClickHouse/ClickHouse/pull/88401)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* KeeperMap テーブルに対する `ALTER COLUMN ... COMMENT` コマンドをレプリケート対象とし、Replicated データベースのメタデータにコミットして、すべてのレプリカへ伝播されるようにしました。[#88077](https://github.com/ClickHouse/ClickHouse/issues/88077) をクローズ。[#88408](https://github.com/ClickHouse/ClickHouse/pull/88408)（[Eduard Karacharov](https://github.com/korowa)）。
* DatabaseReplicated におけるマテリアライズドビューの誤った循環依存関係の検出を修正し、新しいレプリカをデータベースに追加することを妨げていた問題を解消しました。 [#88423](https://github.com/ClickHouse/ClickHouse/pull/88423) ([Nikolay Degterinsky](https://github.com/evillique)).
* `group_by_overflow_mode` が `any` に設定されている場合のスパース列に対する集約を修正しました。 [#88440](https://github.com/ClickHouse/ClickHouse/pull/88440) ([Eduard Karacharov](https://github.com/korowa)).
* `query_plan_use_logical_join_step=0` を複数の FULL JOIN USING 句と併用した際に発生する「column not found」エラーを修正しました。[#88103](https://github.com/ClickHouse/ClickHouse/issues/88103) をクローズしました。 [#88473](https://github.com/ClickHouse/ClickHouse/pull/88473) ([Vladimir Cherkasov](https://github.com/vdimir))。
* ノード数が 10 を超える大規模クラスタでは、`[941] 67c45db4-4df4-4879-87c5-25b8d1e0d414 <Trace>: RestoreCoordinationOnCluster The version of node /clickhouse/backups/restore-7c551a77-bd76-404c-bad0-3213618ac58e/stage/num_hosts changed (attempt #9), will try again` というエラーにより復元処理が失敗する可能性が高くなります。`num_hosts` ノードが多数のホストによって同時に上書きされてしまいます。この修正により、試行回数を制御する設定が動的に調整されるようになりました。[#87721](https://github.com/ClickHouse/ClickHouse/issues/87721) をクローズしました。[#88484](https://github.com/ClickHouse/ClickHouse/pull/88484)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* この PR は 23.8 およびそれ以前との互換性を確保するためだけのものです。互換性の問題は次の PR によって導入されました: [https://github.com/ClickHouse/ClickHouse/pull/54240](https://github.com/ClickHouse/ClickHouse/pull/54240) この SQL は `enable_analyzer=0` の場合に失敗します（23.8 より前のバージョンでは問題ありません）。[#88491](https://github.com/ClickHouse/ClickHouse/pull/88491)（[JIaQi](https://github.com/JiaQiTang98)）。
* 大きな値を DateTime 型に変換する際の `accurateCast` のエラーメッセージで発生していた UBSAN による整数オーバーフローを修正しました。[#88520](https://github.com/ClickHouse/ClickHouse/pull/88520)（[xiaohuanlin](https://github.com/xiaohuanlin)）。
* タプル型用の CoalescingMergeTree の不具合を修正しました。これにより [#88469](https://github.com/ClickHouse/ClickHouse/issues/88469) がクローズされました。[#88526](https://github.com/ClickHouse/ClickHouse/pull/88526)（[scanhex12](https://github.com/scanhex12)）。
* `iceberg_format_version=1` に対する削除を禁止しました。これにより [#88444](https://github.com/ClickHouse/ClickHouse/issues/88444) が解決されました。[#88532](https://github.com/ClickHouse/ClickHouse/pull/88532)（[scanhex12](https://github.com/scanhex12)）。
* このパッチは、任意の深さのディレクトリに対する `plain-rewritable` ディスクの移動処理を修正します。 [#88586](https://github.com/ClickHouse/ClickHouse/pull/88586) ([Mikhail Artemenko](https://github.com/Michicosun))。
* *cluster 関数における SQL SECURITY DEFINER の動作を修正。 [#88588](https://github.com/ClickHouse/ClickHouse/pull/88588) ([Julian Maicher](https://github.com/jmaicher)).
* 基盤となる const PREWHERE 列の同時実行されるミューテーションにより発生しうるクラッシュを修正。 [#88605](https://github.com/ClickHouse/ClickHouse/pull/88605) ([Azat Khuzhin](https://github.com/azat)).
* テキストインデックスからの読み取りを修正し、`use_skip_indexes_on_data_read` および `use_query_condition_cache` 設定を有効にしてクエリ条件キャッシュを有効化しました。 [#88660](https://github.com/ClickHouse/ClickHouse/pull/88660) ([Anton Popov](https://github.com/CurtizJ)).
* `Poco::Net::HTTPChunkedStreamBuf::readFromDevice` からスローされた `Poco::TimeoutException` により、SIGABRT でクラッシュします。[#88668](https://github.com/ClickHouse/ClickHouse/pull/88668)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* [#88910](https://github.com/ClickHouse/ClickHouse/issues/88910) にバックポート済み: リカバリ後、Replicated データベースのレプリカが `Failed to marked query-0004647339 as finished (finished=No node, synced=No node)` のようなメッセージを長時間にわたって出力し続けてハングしてしまうことがありましたが、この問題は修正されました。[#88671](https://github.com/ClickHouse/ClickHouse/pull/88671) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 設定のリロード後に ClickHouse が初めて接続する場合の `system.zookeeper_connection_log` への追記処理を修正。 [#88728](https://github.com/ClickHouse/ClickHouse/pull/88728) ([Antonio Andelic](https://github.com/antonio2368)).
* `date_time_overflow_behavior = 'saturate'` を使用している場合に、タイムゾーンを扱う際、範囲外の値を DateTime64 から Date に変換すると誤った結果が返される可能性があったバグを修正しました。 [#88737](https://github.com/ClickHouse/ClickHouse/pull/88737) ([Manuel](https://github.com/raimannma)).
* キャッシュを有効にした S3 テーブルエンジンで発生する「having zero bytes error」を修正する N 回目の試み。 [#88740](https://github.com/ClickHouse/ClickHouse/pull/88740) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `loop` テーブル関数に対する SELECT 時のアクセス検証を修正。 [#88802](https://github.com/ClickHouse/ClickHouse/pull/88802) ([pufit](https://github.com/pufit)).
* 非同期ロギングが失敗した際に例外を捕捉し、プログラムが異常終了するのを防ぎます。 [#88814](https://github.com/ClickHouse/ClickHouse/pull/88814) ([Raúl Marín](https://github.com/Algunenano)).
* [#89060](https://github.com/ClickHouse/ClickHouse/issues/89060) にバックポート済み: `top_k` が単一の引数で呼び出された場合に、threshold パラメータを正しく考慮するように修正。 [#88757](https://github.com/ClickHouse/ClickHouse/issues/88757) をクローズ。 [#88867](https://github.com/ClickHouse/ClickHouse/pull/88867)（[Manuel](https://github.com/raimannma)）。
* [#88944](https://github.com/ClickHouse/ClickHouse/issues/88944) にバックポート済み: 関数 `reverseUTF8` のバグを修正しました。以前のバージョンでは、4 バイト長の UTF-8 コードポイントのバイト列を誤って反転していました。この修正により [#88913](https://github.com/ClickHouse/ClickHouse/issues/88913) がクローズされます。[#88914](https://github.com/ClickHouse/ClickHouse/pull/88914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* [#88980](https://github.com/ClickHouse/ClickHouse/issues/88980) にバックポート済み：SQL SECURITY DEFINER を指定してビューを作成する際に、`SET DEFINER <current_user>:definer` へのアクセスをチェックしないようになりました。[#88968](https://github.com/ClickHouse/ClickHouse/pull/88968) ([pufit](https://github.com/pufit))。
* [#89058](https://github.com/ClickHouse/ClickHouse/issues/89058) でバックポート済み: `p` が `Nullable` の場合に、部分的な `QBit` 読み取りの最適化によって戻り値の型から誤って `Nullable` が削除されていたため、`L2DistanceTransposed(vec1, vec2, p)` における `LOGICAL_ERROR` を修正しました。[#88974](https://github.com/ClickHouse/ClickHouse/pull/88974)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* [#89167](https://github.com/ClickHouse/ClickHouse/issues/89167) でバックポート: 不明なカタログ種別の場合にクラッシュする問題を修正。[#88819](https://github.com/ClickHouse/ClickHouse/issues/88819) を解決。[#88987](https://github.com/ClickHouse/ClickHouse/pull/88987)（[scanhex12](https://github.com/scanhex12)）。
* [#89028](https://github.com/ClickHouse/ClickHouse/issues/89028) でバックポート済み: skipping index の解析におけるパフォーマンス低下を修正しました。[#89004](https://github.com/ClickHouse/ClickHouse/pull/89004)（[Anton Popov](https://github.com/CurtizJ)）。

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* `postgres` ライブラリのバージョン 18.0 を使用するように変更。 [#87647](https://github.com/ClickHouse/ClickHouse/pull/87647) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* FreeBSD 向けに ICU を有効化。 [#87891](https://github.com/ClickHouse/ClickHouse/pull/87891) ([Raúl Marín](https://github.com/Algunenano)).
* 動的ディスパッチの対象が SSE 4.2 の場合は、SSE 4 ではなく SSE 4.2 を使用。 [#88029](https://github.com/ClickHouse/ClickHouse/pull/88029) ([Raúl Marín](https://github.com/Algunenano)).
* `Speculative Store Bypass Safe` が利用できない場合に、`NO_ARMV81_OR_HIGHER` フラグを必須としないよう変更。 [#88051](https://github.com/ClickHouse/ClickHouse/pull/88051) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* ClickHouse が `ENABLE_LIBFIU=OFF` でビルドされている場合、フェイルポイント関連の関数は no-op（何もしない処理）となり、パフォーマンスに影響を与えなくなります。この場合、`SYSTEM ENABLE/DISABLE FAILPOINT` クエリは `SUPPORT_IS_DISABLED` エラーを返します。 [#88184](https://github.com/ClickHouse/ClickHouse/pull/88184) ([c-end](https://github.com/c-end)).

### ClickHouse リリース 25.9、2025-09-25 {#259}

#### 後方互換性のない変更 {#backward-incompatible-change}

* IPv4/IPv6 に対する意味のない二項演算を無効化: IPv4/IPv6 と整数型以外の型との加算 / 減算を無効化しました。以前は浮動小数点型との演算を許可しており、他のいくつかの型（`DateTime` など）に対しては論理エラーをスローしていました。[#86336](https://github.com/ClickHouse/ClickHouse/pull/86336) ([Raúl Marín](https://github.com/Algunenano)).
* 設定 `allow_dynamic_metadata_for_data_lakes` を非推奨化しました。現在では、すべての Iceberg テーブルが、各クエリを実行する前にストレージから最新のテーブルスキーマを取得しようとします。[#86366](https://github.com/ClickHouse/ClickHouse/pull/86366) ([Daniil Ivanik](https://github.com/divanik)).
* `OUTER JOIN ... USING` 句からの coalesce された列の解決方法を、より一貫したものに変更しました。以前は、OUTER JOIN で USING 列と修飾された列（`a, t1.a, t2.a`）の両方を選択した場合、USING 列が誤って `t1.a` に解決され、左側にマッチしない右側テーブルの行に対して 0/NULL を表示していました。現在は、USING 句の識別子は常に coalesce された列に解決され、修飾された識別子は、クエリ内にどの識別子が存在するかにかかわらず、非 coalesce 列に解決されます。例えば: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 以前: a=0, t1.a=0, t2.a=2（誤り - 'a' が t1.a に解決されている） -- 現在: a=2, t1.a=0, t2.a=2（正しい - 'a' は coalesce されている）。[#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* レプリケートテーブルの重複排除ウィンドウを 10000 まで増加させました。これは完全に互換性がありますが、多数のテーブルが存在する場合、この変更によって高いリソース消費が発生しうるシナリオが考えられます。[#86820](https://github.com/ClickHouse/ClickHouse/pull/86820) ([Sema Checherinda](https://github.com/CheSema)).

#### 新機能 {#new-feature}

* ユーザーは、NATS エンジン用の新しい設定項目 `nats_stream` と `nats_consumer` を指定することで、NATS JetStream を使用してメッセージを取得できるようになりました。 [#84799](https://github.com/ClickHouse/ClickHouse/pull/84799) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* `arrowFlight` テーブル関数に認証と SSL のサポートを追加しました。 [#87120](https://github.com/ClickHouse/ClickHouse/pull/87120) ([Vitaly Baranov](https://github.com/vitlibar))。
* `storage_class_name` という名前の新しいパラメータを `S3` テーブルエンジンおよび `s3` テーブル関数に追加し、AWS が提供する Intelligent-Tiering を指定できるようにしました。キーと値の形式および位置指定形式（非推奨）の両方をサポートします。 [#87122](https://github.com/ClickHouse/ClickHouse/pull/87122) ([alesapin](https://github.com/alesapin))。
* Iceberg テーブルエンジン用の `ALTER UPDATE`。 [#86059](https://github.com/ClickHouse/ClickHouse/pull/86059) ([scanhex12](https://github.com/scanhex12)).
* SELECT ステートメントの実行時に Iceberg メタデータファイルを取得できるシステムテーブル `iceberg_metadata_log` を追加。[#86152](https://github.com/ClickHouse/ClickHouse/pull/86152) ([scanhex12](https://github.com/scanhex12))。
* `Iceberg` および `DeltaLake` テーブルで、ストレージレベルの設定 `disk` を使用したカスタムディスク構成をサポートしました。 [#86778](https://github.com/ClickHouse/ClickHouse/pull/86778) ([scanhex12](https://github.com/scanhex12)).
* データレイク用ディスクで Azure をサポートしました。 [#87173](https://github.com/ClickHouse/ClickHouse/pull/87173) ([scanhex12](https://github.com/scanhex12)).
* Azure Blob Storage 上で `Unity` カタログをサポート。 [#80013](https://github.com/ClickHouse/ClickHouse/pull/80013) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* `Iceberg` への書き込みで、より多くのフォーマット（`ORC`、`Avro`）をサポートしました。これにより [#86179](https://github.com/ClickHouse/ClickHouse/issues/86179) が解決されました。[#87277](https://github.com/ClickHouse/ClickHouse/pull/87277)（[scanhex12](https://github.com/scanhex12)）。
* データベースレプリカに関する情報を保持する新しいシステムテーブル `database_replicas` を追加しました。 [#83408](https://github.com/ClickHouse/ClickHouse/pull/83408) ([Konstantin Morozov](https://github.com/k-morozov)).
* 片方の配列から別の配列を集合として差し引く関数 `arrayExcept` を追加しました。 [#82368](https://github.com/ClickHouse/ClickHouse/pull/82368) ([Joanna Hulboj](https://github.com/jh0x)).
* 新しい `system.aggregated_zookeeper_log` テーブルを追加しました。このテーブルには、ZooKeeper の操作に関する統計情報（例: 操作回数、平均レイテンシ、エラー数）が、セッション ID、親パス、および操作種別ごとにグループ化されて格納されており、一定間隔でディスクに書き出されます。 [#85102](https://github.com/ClickHouse/ClickHouse/pull/85102) [#87208](https://github.com/ClickHouse/ClickHouse/pull/87208) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 新しい関数 `isValidASCII` を追加。入力の String または FixedString が ASCII バイト（0x00〜0x7F）のみを含む場合は 1 を返し、それ以外の場合は 0 を返します。[#85377](https://github.com/ClickHouse/ClickHouse/issues/85377) をクローズします。... [#85786](https://github.com/ClickHouse/ClickHouse/pull/85786)（[rajat mohan](https://github.com/rajatmohan22)）。
* ブール値の設定は、引数なしで指定できます。例えば `SET use_query_cache;` のように記述すると、true を設定したことと同等になります。 [#85800](https://github.com/ClickHouse/ClickHouse/pull/85800) ([thraeka](https://github.com/thraeka))。
* 新しい構成オプション `logger.startupLevel` と `logger.shutdownLevel` により、ClickHouse の起動時およびシャットダウン時のログレベルをそれぞれ上書きできるようになりました。 [#85967](https://github.com/ClickHouse/ClickHouse/pull/85967) ([Lennard Eijsackers](https://github.com/Blokje5)).
* 集約関数 `timeSeriesChangesToGrid` および `timeSeriesResetsToGrid`。`timeSeriesRateToGrid` と同様に動作し、開始タイムスタンプ、終了タイムスタンプ、ステップ、ルックバックウィンドウといったパラメータに加えて、タイムスタンプと値の 2 つの引数を受け取りますが、各ウィンドウで少なくとも 2 サンプルを必要とするのではなく、1 サンプル以上あればよい点が異なります。PromQL の `changes`/`resets` を計算し、パラメータで定義されるタイムグリッドの各タイムスタンプについて、指定されたウィンドウ内でサンプル値が変化または減少した回数をカウントします。戻り値の型は `Array(Nullable(Float64))` です。 [#86010](https://github.com/ClickHouse/ClickHouse/pull/86010) ([Stephen Chi](https://github.com/stephchi0))。
* 一時テーブルと同様に、`CREATE TEMPORARY VIEW` 構文で一時ビューを作成できるようにしました。 [#86432](https://github.com/ClickHouse/ClickHouse/pull/86432) ([Aly Kafoury](https://github.com/AlyHKafoury))。
* CPU およびメモリ使用量に関する警告を `system.warnings` テーブルに追加。 [#86838](https://github.com/ClickHouse/ClickHouse/pull/86838) ([Bharat Nallan](https://github.com/bharatnc))。
* `Protobuf` 入力で `oneof` インジケーターをサポートしました。oneof のどの部分が存在するかを示すために、専用のカラムを使用できます。メッセージに [oneof](https://protobuf.dev/programming-guides/proto3/#oneof) が含まれていて、かつ `input_format_protobuf_oneof_presence` が設定されている場合、ClickHouse はどの oneof フィールドが見つかったかを示すカラムを自動的に設定します。 [#82885](https://github.com/ClickHouse/ClickHouse/pull/82885) ([Ilya Golshtein](https://github.com/ilejn)).
* jemalloc の内部ツールに基づいてアロケーションプロファイリングを改善しました。グローバル jemalloc プロファイラは、設定 `jemalloc_enable_global_profiler` を有効化することで利用可能になりました。サンプリングされたグローバルなアロケーションおよび解放は、設定 `jemalloc_collect_global_profile_samples_in_trace_log` を有効化することで、`JemallocSample` 型として `system.trace_log` に保存できるようになりました。jemalloc プロファイリングは、設定 `jemalloc_enable_profiler` を用いて、クエリごとに個別に有効化できるようになりました。`system.trace_log` へのサンプルの保存は、設定 `jemalloc_collect_profile_samples_in_trace_log` を使用してクエリ単位で制御できます。jemalloc を新しいバージョンに更新しました。 [#85438](https://github.com/ClickHouse/ClickHouse/pull/85438) ([Antonio Andelic](https://github.com/antonio2368))。
* Iceberg テーブルを `DROP` した際にファイルを削除するための新しい設定を追加しました。これにより [#86211](https://github.com/ClickHouse/ClickHouse/issues/86211) が解決しました。 [#86501](https://github.com/ClickHouse/ClickHouse/pull/86501) ([scanhex12](https://github.com/scanhex12))。

#### 実験的機能 {#experimental-feature}

* 反転テキストインデックスをゼロから再実装し、RAM に収まりきらないデータセットに対してもスケーラブルにしました。 [#86485](https://github.com/ClickHouse/ClickHouse/pull/86485) ([Anton Popov](https://github.com/CurtizJ)).
* JOIN の順序付けが統計情報を利用するようになりました。この機能は `allow_statistics_optimize = 1` および `query_plan_optimize_join_order_limit = 10` を設定することで有効化できます。 [#86822](https://github.com/ClickHouse/ClickHouse/pull/86822) ([Han Fei](https://github.com/hanfei1991)).
* `alter table ... materialize statistics all` をサポートしました。これによりテーブルのすべての統計情報がマテリアライズされます。 [#87197](https://github.com/ClickHouse/ClickHouse/pull/87197) ([Han Fei](https://github.com/hanfei1991)).

#### パフォーマンスの向上 {#performance-improvement}

* 読み取り時にスキップインデックスを使用してデータパーツをフィルタリングし、不要なインデックスの読み取りを削減できるようにしました。新しい設定 `use_skip_indexes_on_data_read`（デフォルトでは無効）で制御されます。[#75774](https://github.com/ClickHouse/ClickHouse/issues/75774) に対応しています。また、[#81021](https://github.com/ClickHouse/ClickHouse/issues/81021) と共通の基盤となる変更も一部含まれています。[#81526](https://github.com/ClickHouse/ClickHouse/pull/81526)（[Amos Bird](https://github.com/amosbird)）。
* `query_plan_optimize_join_order_limit` 設定で制御される、パフォーマンス向上のために JOIN を自動的に並べ替える JOIN 順序最適化を追加しました。なお、この JOIN 順序最適化は現時点では統計情報の利用が限定的であり、主にストレージエンジンからの行数推定に依存しています。より高度な統計情報の収集とカーディナリティ推定は、今後のリリースで追加される予定です。**アップグレード後に JOIN クエリで問題が発生した場合**、一時的な回避策として `SET query_plan_use_new_logical_join_step = 0` を設定して新しい実装を無効化し、調査のために問題を報告してください。**USING 句からの識別子解決に関する注意**: `OUTER JOIN ... USING` 句から得られる coalesce された列の解決方法を、より一貫性のある動作に変更しました。以前は、OUTER JOIN で USING 句の列と修飾付き列 (`a, t1.a, t2.a`) の両方を選択した場合、USING 句の列が誤って `t1.a` に解決され、左側に対応する行がない右テーブルの行で 0/NULL が表示されていました。現在は、USING 句からの識別子は常に coalesce された列に解決され、修飾付き識別子は、クエリ内にどのような他の識別子が存在するかに関わらず、非 coalesce な列に解決されます。例えば: ```sql SELECT a, t1.a, t2.a FROM (SELECT 1 as a WHERE 0) t1 FULL JOIN (SELECT 2 as a) t2 USING (a) -- 変更前: a=0, t1.a=0, t2.a=2 (誤り - &#39;a&#39; が t1.a に解決されている) -- 変更後: a=2, t1.a=0, t2.a=2 (正しい - &#39;a&#39; が coalesce されている)。 [#80848](https://github.com/ClickHouse/ClickHouse/pull/80848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* データレイク向けの分散 `INSERT SELECT`。 [#86783](https://github.com/ClickHouse/ClickHouse/pull/86783) ([scanhex12](https://github.com/scanhex12))。
* `func(primary_column) = 'xx'` や `column in (xxx)` のような条件に対する PREWHERE の最適化を改善しました。 [#85529](https://github.com/ClickHouse/ClickHouse/pull/85529) ([李扬](https://github.com/taiyang-li))。
* JOIN の書き換えを実装しました。1. フィルタ条件が一致行または不一致行に対して常に偽となる場合、`LEFT ANY JOIN` と `RIGHT ANY JOIN` を `SEMI`/`ANTI` JOIN に変換します。この最適化は、新しい設定 `query_plan_convert_any_join_to_semi_or_anti_join` によって制御されます。2. いずれか一方の側の不一致行に対してフィルタ条件が常に偽となる場合、`FULL ALL JOIN` を `LEFT ALL` または `RIGHT ALL` JOIN に変換します。 [#86028](https://github.com/ClickHouse/ClickHouse/pull/86028) ([Dmitry Novik](https://github.com/novikd))。
* 軽量削除を実行した後の垂直マージのパフォーマンスを改善しました。 [#86169](https://github.com/ClickHouse/ClickHouse/pull/86169) ([Anton Popov](https://github.com/CurtizJ)).
* `LEFT/RIGHT` 結合で不一致行が多数存在する場合の `HashJoin` のパフォーマンスをわずかに改善しました。 [#86312](https://github.com/ClickHouse/ClickHouse/pull/86312) ([Nikita Taranov](https://github.com/nickitat)).
* 基数ソート：コンパイラによるSIMDの活用と、より効率的なプリフェッチを支援します。Intel CPUでのみソフトウェアプリフェッチを行うために、動的ディスパッチを使用します。[@taiyang-li](https://github.com/taiyang-li) による [https://github.com/ClickHouse/ClickHouse/pull/77029](https://github.com/ClickHouse/ClickHouse/pull/77029) の作業を継続したものです。[#86378](https://github.com/ClickHouse/ClickHouse/pull/86378)（[Raúl Marín](https://github.com/Algunenano)）。
* 多数のパーツを持つテーブルに対する短いクエリのパフォーマンスを向上させました（`MarkRanges` を `deque` ではなく `devector` を使って最適化）。 [#86933](https://github.com/ClickHouse/ClickHouse/pull/86933) ([Azat Khuzhin](https://github.com/azat)).
* JOIN モードにおけるパッチパーツ適用処理のパフォーマンスを改善しました。 [#87094](https://github.com/ClickHouse/ClickHouse/pull/87094) ([Anton Popov](https://github.com/CurtizJ)).
* 設定 `query_condition_cache_selectivity_threshold`（デフォルト値: 1.0）を追加しました。選択度が低い述語のスキャン結果を query condition cache への挿入対象から除外します。これにより、キャッシュヒット率が低下する代わりに、query condition cache のメモリ消費量を削減できます。 [#86076](https://github.com/ClickHouse/ClickHouse/pull/86076) ([zhongyuankai](https://github.com/zhongyuankai)).
* Iceberg への書き込み時のメモリ使用量を削減。 [#86544](https://github.com/ClickHouse/ClickHouse/pull/86544) ([scanhex12](https://github.com/scanhex12)).

#### 改善点 {#improvement}

* 1 回の INSERT で Iceberg に複数のデータファイルを書き込めるようにしました。上限を制御するために、新しい設定 `iceberg_insert_max_rows_in_data_file` および `iceberg_insert_max_bytes_in_data_file` を追加しました。 [#86275](https://github.com/ClickHouse/ClickHouse/pull/86275) ([scanhex12](https://github.com/scanhex12)).
* Delta Lake に挿入されるデータファイルごとの行数／バイト数の上限を追加しました。`delta_lake_insert_max_rows_in_data_file` および `delta_lake_insert_max_bytes_in_data_file` の設定で制御されます。[#86357](https://github.com/ClickHouse/ClickHouse/pull/86357) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg 書き込みで、より多くのパーティション種別をサポートしました。これにより [#86206](https://github.com/ClickHouse/ClickHouse/issues/86206) がクローズされました。[#86298](https://github.com/ClickHouse/ClickHouse/pull/86298)（[scanhex12](https://github.com/scanhex12)）。
* S3 のリトライ戦略を設定可能にし、設定 XML ファイルの変更に応じて S3 ディスクの設定をホットリロードできるようにしました。 [#82642](https://github.com/ClickHouse/ClickHouse/pull/82642) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* S3(Azure)Queue テーブルエンジンを改良し、ZooKeeper の接続喪失が発生しても重複が生じることなく処理を継続できるようにしました。S3Queue の設定 `use_persistent_processing_nodes` を有効にする必要があります（`ALTER TABLE MODIFY SETTING` で変更できます）。 [#85995](https://github.com/ClickHouse/ClickHouse/pull/85995) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `TO` の後にクエリパラメータを指定してマテリアライズドビューを作成できます。例：`CREATE MATERIALIZED VIEW mv TO {to_table:Identifier} AS SELECT * FROM src_table`。 [#84899](https://github.com/ClickHouse/ClickHouse/pull/84899) ([Diskein](https://github.com/Diskein))。
* `Kafka2` テーブルエンジンで誤った設定が指定された場合に、ユーザー向けの案内がより明確になるよう改善しました。 [#83701](https://github.com/ClickHouse/ClickHouse/pull/83701) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `Time` 型にタイムゾーンを指定することはできなくなりました（もともとその指定には意味がありませんでした）。 [#84689](https://github.com/ClickHouse/ClickHouse/pull/84689) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `best_effort` モードでの Time/Time64 のパース処理に関するロジックを簡素化し、いくつかのバグを回避しました。 [#84730](https://github.com/ClickHouse/ClickHouse/pull/84730) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `deltaLakeAzureCluster` 関数（クラスターモード用の `deltaLakeAzure` と同様）および `deltaLakeS3Cluster` 関数（`deltaLakeCluster` のエイリアス）を追加しました。[#85358](https://github.com/ClickHouse/ClickHouse/issues/85358) を解決しました。[#85547](https://github.com/ClickHouse/ClickHouse/pull/85547)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `azure_max_single_part_copy_size` 設定をバックアップ時と同様に通常のコピー操作にも適用するようにしました。 [#85767](https://github.com/ClickHouse/ClickHouse/pull/85767) ([Ilya Golshtein](https://github.com/ilejn)).
* S3 Object Storage において、リトライ可能なエラー発生時に S3 クライアントスレッドをスローダウンするようにしました。この変更により、従来の設定 `backup_slow_all_threads_after_retryable_s3_error` を S3 ディスクにも適用し、より汎用的な名前である `s3_slow_all_threads_after_retryable_error` に変更しました。 [#85918](https://github.com/ClickHouse/ClickHouse/pull/85918) ([Julia Kartseva](https://github.com/jkartseva)).
* Mark 設定において、allow&#95;experimental&#95;variant/dynamic/json と enable&#95;variant/dynamic/json は非推奨となりました。現在は、これら 3 種類はすべて無条件に有効になっています。 [#85934](https://github.com/ClickHouse/ClickHouse/pull/85934) ([Pavel Kruglov](https://github.com/Avogar)).
* `http_handlers` で、スキーマおよびホスト:ポートを含む完全な URL 文字列によるフィルタリング（`full_url` ディレクティブ）をサポートしました。 [#86155](https://github.com/ClickHouse/ClickHouse/pull/86155) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定 `allow_experimental_delta_lake_writes` を追加。[#86180](https://github.com/ClickHouse/ClickHouse/pull/86180)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* init.d スクリプトでの systemd 検出を修正し、「Install packages」チェックの不具合を解消しました。 [#86187](https://github.com/ClickHouse/ClickHouse/pull/86187) ([Azat Khuzhin](https://github.com/azat))。
* 新しい `startup_scripts_failure_reason` 次元メトリクスを追加します。このメトリクスは、起動スクリプトの失敗を引き起こすさまざまなエラー種別を区別するために必要です。特にアラート用途では、一時的なエラー（例: `MEMORY_LIMIT_EXCEEDED` や `KEEPER_EXCEPTION`）と非一時的なエラーを区別する必要があります。[#86202](https://github.com/ClickHouse/ClickHouse/pull/86202)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* Iceberg テーブルのパーティション指定で `identity` 関数を省略できるようにしました。 [#86314](https://github.com/ClickHouse/ClickHouse/pull/86314) ([scanhex12](https://github.com/scanhex12)).
* 特定のチャネルに対してのみ JSON 形式のログ出力を有効にできるようにしました。この機能を利用するには、`logger.formatting.channel` を `syslog` / `console` / `errorlog` / `log` のいずれかに設定します。 [#86331](https://github.com/ClickHouse/ClickHouse/pull/86331) ([Azat Khuzhin](https://github.com/azat))。
* `WHERE` 句でネイティブの数値を使用できるようにしました。これらはすでに論理関数の引数としては利用可能でした。これにより、filter-push-down および move-to-prewhere の最適化が容易になります。 [#86390](https://github.com/ClickHouse/ClickHouse/pull/86390) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 破損したメタデータを持つ Catalog に対して `SYSTEM DROP REPLICA` を実行した場合に発生していたエラーを修正しました。 [#86391](https://github.com/ClickHouse/ClickHouse/pull/86391) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* Azure ではアクセスのプロビジョニングにかなり時間がかかる場合があるため、ディスクアクセスチェック（`skip_access_check = 0`）に追加のリトライを行うようにしました。 [#86419](https://github.com/ClickHouse/ClickHouse/pull/86419) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `timeSeries*()` 関数における staleness window を左開き・右閉じの区間となるよう変更しました。 [#86588](https://github.com/ClickHouse/ClickHouse/pull/86588) ([Vitaly Baranov](https://github.com/vitlibar)).
* `FailedInternal*Query` プロファイルイベントを追加しました。 [#86627](https://github.com/ClickHouse/ClickHouse/pull/86627) ([Shane Andrade](https://github.com/mauidude))。
* 設定ファイル経由で追加された、名前にドットを含むユーザーの扱いを修正。 [#86633](https://github.com/ClickHouse/ClickHouse/pull/86633) ([Mikhail Koviazin](https://github.com/mkmkme)).
* クエリのメモリ使用量に関する非同期メトリクス（`QueriesMemoryUsage` および `QueriesPeakMemoryUsage`）を追加しました。 [#86669](https://github.com/ClickHouse/ClickHouse/pull/86669) ([Azat Khuzhin](https://github.com/azat)).
* `clickhouse-benchmark --precise` フラグを使用すると、QPS およびその他のインターバルごとのメトリクスをより正確にレポートできます。これにより、クエリの実行時間がレポート間隔 `--delay D` と同程度の場合でも、一貫した QPS を取得しやすくなります。 [#86684](https://github.com/ClickHouse/ClickHouse/pull/86684) ([Sergei Trifonov](https://github.com/serxa)).
* Linux スレッドの nice 値を構成可能にし、特定のスレッド（merge/mutate、query、マテリアライズドビュー、ZooKeeper クライアント）により高いまたは低い優先度を割り当てられるようにしました。 [#86703](https://github.com/ClickHouse/ClickHouse/pull/86703) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* 競合状態によりマルチパートアップロードで元の例外が失われた場合に発生していた、誤解を招く「specified upload does not exist」エラーを修正しました。 [#86725](https://github.com/ClickHouse/ClickHouse/pull/86725) ([Julia Kartseva](https://github.com/jkartseva)).
* `EXPLAIN` クエリにおけるクエリプランの説明の長さを制限しました。`EXPLAIN` 以外のクエリではこの説明を生成しないようにしました。設定項目 `query_plan_max_step_description_length` を追加しました。 [#86741](https://github.com/ClickHouse/ClickHouse/pull/86741) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* クエリプロファイラ（`query_profiler_real_time_period_ns` / `query_profiler_cpu_time_period_ns`）で `CANNOT_CREATE_TIMER` を回避できるよう、ペンディングシグナルを調整可能にしました。また、自己診断のために `/proc/self/status` から `SigQ` を収集するようにしました（`ProcessSignalQueueSize` が `ProcessSignalQueueLimit` に近づいている場合、`CANNOT_CREATE_TIMER` エラーが発生する可能性が高くなります）。 [#86760](https://github.com/ClickHouse/ClickHouse/pull/86760) ([Azat Khuzhin](https://github.com/azat)).
* Keeper における `RemoveRecursive` リクエストのパフォーマンスを改善しました。 [#86789](https://github.com/ClickHouse/ClickHouse/pull/86789) ([Antonio Andelic](https://github.com/antonio2368)).
* JSON 型の出力時に `PrettyJSONEachRow` で余分な空白を削除するようにしました。 [#86819](https://github.com/ClickHouse/ClickHouse/pull/86819) ([Pavel Kruglov](https://github.com/Avogar)).
* プレーンなリライト可能ディスクにおいてディレクトリ削除時に、`prefix.path` の blob サイズを書き込むようにしました。 [#86908](https://github.com/ClickHouse/ClickHouse/pull/86908) ([alesapin](https://github.com/alesapin)).
* リモートの ClickHouse インスタンス（ClickHouse Cloud を含む）に対するパフォーマンス テストをサポートします。使用例: `tests/performance/scripts/perf.py tests/performance/math.xml --runs 10 --user <username> --password <password> --host <hostname> --port <port> --secure`。 [#86995](https://github.com/ClickHouse/ClickHouse/pull/86995) ([Raufs Dunamalijevs](https://github.com/rienath))。
* 大量（16MiB 超）のメモリを割り当てることが分かっている一部の処理（ソート、非同期インサート、file log）で、メモリ制限に従うようにしました。 [#87035](https://github.com/ClickHouse/ClickHouse/pull/87035) ([Azat Khuzhin](https://github.com/azat)).
* `network_compression_method` にサポートされていない汎用コーデックが設定された場合に、例外をスローするようにしました。 [#87097](https://github.com/ClickHouse/ClickHouse/pull/87097) ([Robert Schulze](https://github.com/rschu1ze)).
* システムテーブル `system.query_cache` は、以前は共有エントリ、または同一ユーザーかつ同一ロールに属する非共有エントリのみを返していましたが、現在は *すべての* クエリ結果キャッシュのエントリを返すようになりました。非共有エントリは *クエリ結果* を開示しないことが前提とされており、`system.query_cache` が返すのは *クエリ文字列* だけであるため、これは問題ありません。これにより、このシステムテーブルの挙動は `system.query_log` により近いものになりました。[#87104](https://github.com/ClickHouse/ClickHouse/pull/87104)（[Robert Schulze](https://github.com/rschu1ze)）。
* `parseDateTime` 関数で短絡評価を有効にしました。 [#87184](https://github.com/ClickHouse/ClickHouse/pull/87184) ([Pavel Kruglov](https://github.com/Avogar)).
* `system.parts_columns` に新しい列 `statistics` を追加しました。 [#87259](https://github.com/ClickHouse/ClickHouse/pull/87259) ([Han Fei](https://github.com/hanfei1991))。

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* レプリケートされたデータベースおよび内部的にレプリケートされたテーブルに対する `ALTER` クエリの結果は、クエリを開始したノード上でのみ検証されます。これにより、すでにコミット済みの `ALTER` クエリが他のノード上でハングしたままになる状況が解消されます。 [#83849](https://github.com/ClickHouse/ClickHouse/pull/83849) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* `BackgroundSchedulePool` 内で、各種タスク数に上限を設けました。これにより、ある種のタスクがすべてのスロットを占有し、他のタスクが飢餓状態になる状況を防止します。また、タスク同士が互いの完了待ちになることで発生するデッドロックも回避します。この挙動はサーバー設定 `background_schedule_pool_max_parallel_tasks_per_type_ratio` によって制御されます。 [#84008](https://github.com/ClickHouse/ClickHouse/pull/84008) ([Alexander Tokmakov](https://github.com/tavplubix))。
* データベースレプリカの復旧時にテーブルが正しくシャットダウンされるようにしました。不適切なシャットダウンにより、データベースレプリカ復旧中に一部のテーブルエンジンで `LOGICAL_ERROR` が発生する可能性がありました。 [#84744](https://github.com/ClickHouse/ClickHouse/pull/84744) ([Antonio Andelic](https://github.com/antonio2368)).
* データベース名のタイプミス修正候補を生成する際に、アクセス権限を確認するようにしました。 [#85371](https://github.com/ClickHouse/ClickHouse/pull/85371) ([Dmitry Novik](https://github.com/novikd)).
* 1. Hive カラムに対する LowCardinality 2. 仮想カラムより前に Hive カラムを設定（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要）3. Hive 用フォーマットが空の場合の LOGICAL&#95;ERROR [#85528](https://github.com/ClickHouse/ClickHouse/issues/85528) 4. Hive のパーティションカラムだけが存在する場合のチェックを修正 5. すべての Hive カラムがスキーマで指定されていることをアサート 6. Hive を用いた parallel&#95;replicas&#95;cluster の部分的な修正 7. Hive ユーティリティの extractkeyValuePairs で順序付きコンテナを使用（[https://github.com/ClickHouse/ClickHouse/pull/81040](https://github.com/ClickHouse/ClickHouse/pull/81040) に必要）。[#85538](https://github.com/ClickHouse/ClickHouse/pull/85538)（[Arthur Passos](https://github.com/arthurpassos)）。
* 配列マッピング使用時にエラーを引き起こすことがあった `IN` 関数の第1引数への不要な最適化を防止しました。 [#85546](https://github.com/ClickHouse/ClickHouse/pull/85546) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parquet ファイルを書き込んだ際に、Iceberg の source id と Parquet ファイル名のマッピングがスキーマに合わせて調整されていませんでした。この PR では、現在のスキーマではなく、各 Iceberg データファイルに対応するスキーマを処理するようにしました。 [#85829](https://github.com/ClickHouse/ClickHouse/pull/85829) ([Daniil Ivanik](https://github.com/divanik))。
* ファイルを開く処理とは別にファイルサイズを読み取っていた処理を修正しました。これは、`5.10` リリース以前の Linux カーネルのバグに対応して導入された変更 [https://github.com/ClickHouse/ClickHouse/pull/33372](https://github.com/ClickHouse/ClickHouse/pull/33372) に関連しています。[#85837](https://github.com/ClickHouse/ClickHouse/pull/85837)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* カーネルレベルで IPv6 が無効化されているシステム（例: `ipv6.disable=1` が設定された RHEL）でも、ClickHouse Keeper が起動に失敗しなくなりました。最初の IPv6 リスナーの起動に失敗した場合は、IPv4 リスナーへのフォールバックを試みるようになりました。 [#85901](https://github.com/ClickHouse/ClickHouse/pull/85901) ([jskong1124](https://github.com/jskong1124)).
* この PR で [#77990](https://github.com/ClickHouse/ClickHouse/issues/77990) をクローズします。globalJoin において parallel replicas 用の TableFunctionRemote のサポートを追加しました。[#85929](https://github.com/ClickHouse/ClickHouse/pull/85929) ([zoomxi](https://github.com/zoomxi))。
* orcschemareader::initializeifneeded() 内のヌルポインタ参照を修正しました。この PR では次の issue を解決しています: [#85292](https://github.com/ClickHouse/ClickHouse/issues/85292) ### ユーザー向け変更に関するドキュメントエントリ。 [#85951](https://github.com/ClickHouse/ClickHouse/pull/85951) ([yanglongwei](https://github.com/ylw510)).
* FROM 句内の相関サブクエリに対し、外側クエリの列を使用している場合にのみ許可するチェックを追加しました。[#85469](https://github.com/ClickHouse/ClickHouse/issues/85469) を修正しました。[#85402](https://github.com/ClickHouse/ClickHouse/issues/85402) を修正しました。[#85966](https://github.com/ClickHouse/ClickHouse/pull/85966)（[Dmitry Novik](https://github.com/novikd)）。
* 他のカラムの `MATERIALIZED` 式でサブカラムが使用されているカラムに対する `ALTER UPDATE` の挙動を修正しました。以前は、式内でサブカラムを参照している `MATERIALIZED` カラムが正しく更新されていませんでした。 [#85985](https://github.com/ClickHouse/ClickHouse/pull/85985) ([Pavel Kruglov](https://github.com/Avogar)).
* PK またはパーティション式でサブカラムが使用されているカラムの変更を禁止しました。 [#86005](https://github.com/ClickHouse/ClickHouse/pull/86005) ([Pavel Kruglov](https://github.com/Avogar)).
* ストレージ DeltaLake において、非デフォルトのカラムマッピングモード使用時のサブカラム読み取りを修正。 [#86064](https://github.com/ClickHouse/ClickHouse/pull/86064) ([Kseniia Sumarokova](https://github.com/kssenii)).
* JSON 内で Enum ヒント付きのパスに対して誤ったデフォルト値が使用されていた問題を修正。[#86065](https://github.com/ClickHouse/ClickHouse/pull/86065)（[Pavel Kruglov](https://github.com/Avogar)）。
* DataLake Hive カタログ URL の解析時に入力のサニタイズを行うようにしました。Closes [#86018](https://github.com/ClickHouse/ClickHouse/issues/86018). [#86092](https://github.com/ClickHouse/ClickHouse/pull/86092) ([rajat mohan](https://github.com/rajatmohan22)).
* ファイルシステムキャッシュの動的リサイズ中に発生する論理エラーを修正。[#86122](https://github.com/ClickHouse/ClickHouse/issues/86122) をクローズ。 [https://github.com/ClickHouse/clickhouse-core-incidents/issues/473](https://github.com/ClickHouse/clickhouse-core-incidents/issues/473) をクローズ。 [#86130](https://github.com/ClickHouse/ClickHouse/pull/86130)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DatabaseReplicatedSettings で `logs_to_keep` に `NonZeroUInt64` を使用するようにしました。 [#86142](https://github.com/ClickHouse/ClickHouse/pull/86142) ([Tuan Pham Anh](https://github.com/tuanpach)).
* テーブル（例：`ReplacingMergeTree`）が設定 `index_granularity_bytes = 0` で作成されていた場合、スキップインデックスを使用した `FINAL` クエリの実行時に例外がスローされていました。この例外は現在修正されています。 [#86147](https://github.com/ClickHouse/ClickHouse/pull/86147) ([Shankar Iyer](https://github.com/shankar-iyer)).
* UB を除去し、Iceberg のパーティション式のパース処理における問題を修正します。 [#86166](https://github.com/ClickHouse/ClickHouse/pull/86166) ([Daniil Ivanik](https://github.com/divanik))。
* 1 つの INSERT 内に const ブロックと non-const ブロックが混在している場合にクラッシュする問題を修正。 [#86230](https://github.com/ClickHouse/ClickHouse/pull/86230) ([Azat Khuzhin](https://github.com/azat)).
* SQL でディスクを作成する際には、デフォルトで `/etc/metrika.xml` 内の `include` を処理するようになりました。 [#86232](https://github.com/ClickHouse/ClickHouse/pull/86232) ([alekar](https://github.com/alekar)).
* String から JSON への accurateCastOrNull/accurateCastOrDefault の動作を修正。 [#86240](https://github.com/ClickHouse/ClickHouse/pull/86240) ([Pavel Kruglov](https://github.com/Avogar)).
* iceberg エンジンで「/」を含まないディレクトリをサポートするようにしました。 [#86249](https://github.com/ClickHouse/ClickHouse/pull/86249) ([scanhex12](https://github.com/scanhex12)).
* `replaceRegex` が `FixedString` 型の haystack と空の needle を処理する際にクラッシュする問題を修正しました。 [#86270](https://github.com/ClickHouse/ClickHouse/pull/86270) ([Raúl Marín](https://github.com/Algunenano)).
* ALTER UPDATE Nullable(JSON) 実行時に発生するクラッシュを修正。 [#86281](https://github.com/ClickHouse/ClickHouse/pull/86281) ([Pavel Kruglov](https://github.com/Avogar)).
* system.tables で不足していたカラム定義子を修正。 [#86295](https://github.com/ClickHouse/ClickHouse/pull/86295) ([Raúl Marín](https://github.com/Algunenano)).
* LowCardinality(Nullable(T)) から Dynamic へのキャストを修正しました。 [#86365](https://github.com/ClickHouse/ClickHouse/pull/86365) ([Pavel Kruglov](https://github.com/Avogar))。
* DeltaLake への書き込み時に発生する論理エラーを修正。[#86175](https://github.com/ClickHouse/ClickHouse/issues/86175) をクローズ。[#86367](https://github.com/ClickHouse/ClickHouse/pull/86367)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* plain&#95;rewritable disk を使用して Azure Blob Storage から空の blob を読み取る際に発生する `416 The range specified is invalid for the current size of the resource. The range specified is invalid for the current size of the resource` エラーを修正。 [#86400](https://github.com/ClickHouse/ClickHouse/pull/86400) ([Julia Kartseva](https://github.com/jkartseva)).
* GROUP BY Nullable(JSON) の不具合を修正。 [#86410](https://github.com/ClickHouse/ClickHouse/pull/86410) ([Pavel Kruglov](https://github.com/Avogar)).
* マテリアライズドビューのバグを修正しました。同じ名前で作成されたマテリアライズドビューを削除してから再作成すると、正しく動作しない場合がありました。 [#86413](https://github.com/ClickHouse/ClickHouse/pull/86413) ([Alexander Tokmakov](https://github.com/tavplubix)).
* *cluster 関数から読み込む際に、すべてのレプリカが使用不能な場合は失敗するようにしました。 [#86414](https://github.com/ClickHouse/ClickHouse/pull/86414) ([Julian Maicher](https://github.com/jmaicher)).
* `Buffer` テーブルに起因する `MergesMutationsMemoryTracking` のリークを修正し、`Kafka` などからのストリーミング向けの `query_views_log` を修正。 [#86422](https://github.com/ClickHouse/ClickHouse/pull/86422) ([Azat Khuzhin](https://github.com/azat)).
* エイリアスストレージの参照テーブルを削除した後の `SHOW TABLES` の動作を修正しました。 [#86433](https://github.com/ClickHouse/ClickHouse/pull/86433) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* `send_chunk_header` が有効になっていて、UDF が HTTP プロトコル経由で呼び出された場合にチャンクヘッダーが欠落する問題を修正しました。 [#86469](https://github.com/ClickHouse/ClickHouse/pull/86469) ([Vladimir Cherkasov](https://github.com/vdimir)).
* jemalloc のプロファイルフラッシュが有効になっている場合に発生しうるデッドロックを修正しました。 [#86473](https://github.com/ClickHouse/ClickHouse/pull/86473) ([Azat Khuzhin](https://github.com/azat)).
* DeltaLake テーブルエンジンでのサブカラム読み取りを修正。[#86204](https://github.com/ClickHouse/ClickHouse/issues/86204) をクローズ。[#86477](https://github.com/ClickHouse/ClickHouse/pull/86477)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* DDL タスク処理時の衝突を回避するため、ループバックホスト ID を適切に扱うようにしました。 [#86479](https://github.com/ClickHouse/ClickHouse/pull/86479) ([Tuan Pham Anh](https://github.com/tuanpach)).
* numeric/decimal 型の列を持つ PostgreSQL database engine テーブルに対する DETACH/ATTACH 操作を修正。 [#86480](https://github.com/ClickHouse/ClickHouse/pull/86480) ([Julian Maicher](https://github.com/jmaicher)).
* getSubcolumnType における未初期化メモリの使用を修正しました。 [#86498](https://github.com/ClickHouse/ClickHouse/pull/86498) ([Raúl Marín](https://github.com/Algunenano)).
* 空の needle で呼び出されたとき、関数 `searchAny` および `searchAll` は、現在では `true`（いわゆる「すべてにマッチする」）を返すようになりました。以前は `false` を返していました。（issue [#86300](https://github.com/ClickHouse/ClickHouse/issues/86300)）。[#86500](https://github.com/ClickHouse/ClickHouse/pull/86500)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 最初のバケットに値が存在しない場合の `timeSeriesResampleToGridWithStaleness()` 関数の動作を修正しました。 [#86507](https://github.com/ClickHouse/ClickHouse/pull/86507) ([Vitaly Baranov](https://github.com/vitlibar)).
* `merge_tree_min_read_task_size` が 0 に設定されていたことが原因で発生するクラッシュを修正。[#86527](https://github.com/ClickHouse/ClickHouse/pull/86527) ([yanglongwei](https://github.com/ylw510)).
* 読み取り時に各データファイルのフォーマットを Iceberg のメタデータから取得するようにしました（以前はテーブル引数から取得していました）。 [#86529](https://github.com/ClickHouse/ClickHouse/pull/86529) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時のログフラッシュ中に発生する例外を無視し、シャットダウンをより安全にしました（SIGSEGV を回避するため）。 [#86546](https://github.com/ClickHouse/ClickHouse/pull/86546) ([Azat Khuzhin](https://github.com/azat)).
* ゼロサイズのパートファイルを含むクエリで Backup データベースエンジンが例外を投げてしまう問題を修正。 [#86563](https://github.com/ClickHouse/ClickHouse/pull/86563) ([Max Justus Spransy](https://github.com/maxjustus)).
* send&#95;chunk&#95;header が有効な状態で、UDF が HTTP プロトコル経由で呼び出された場合にチャンクヘッダーが欠落する問題を修正しました。 [#86606](https://github.com/ClickHouse/ClickHouse/pull/86606) ([Vladimir Cherkasov](https://github.com/vdimir)).
* keeper のセッション有効期限切れが原因で発生していた、S3Queue の論理エラー「Expected current processor {} to be equal to {}」を修正しました。 [#86615](https://github.com/ClickHouse/ClickHouse/pull/86615) ([Kseniia Sumarokova](https://github.com/kssenii))。
* INSERT および pruning における Nullability のバグを修正しました。これにより [#86407](https://github.com/ClickHouse/ClickHouse/issues/86407) がクローズされました。 [#86630](https://github.com/ClickHouse/ClickHouse/pull/86630) ([scanhex12](https://github.com/scanhex12)).
* Iceberg メタデータキャッシュが無効化されている場合でも、ファイルシステムキャッシュは無効化されないようにしました。 [#86635](https://github.com/ClickHouse/ClickHouse/pull/86635) ([Daniil Ivanik](https://github.com/divanik)).
* parquet reader v3 における「Deadlock in Parquet::ReadManager (single-threaded)」エラーを修正しました。[#86644](https://github.com/ClickHouse/ClickHouse/pull/86644) ([Michael Kolupaev](https://github.com/al13n321))。
* ArrowFlight の `listen_host` における IPv6 対応を修正。 [#86664](https://github.com/ClickHouse/ClickHouse/pull/86664) ([Vitaly Baranov](https://github.com/vitlibar)).
* `ArrowFlight` ハンドラーのシャットダウン時の処理を修正しました。この PR は [#86596](https://github.com/ClickHouse/ClickHouse/issues/86596) を修正します。[#86665](https://github.com/ClickHouse/ClickHouse/pull/86665)（[Vitaly Baranov](https://github.com/vitlibar)）。
* `describe_compact_output=1` 使用時の分散クエリを修正。 [#86676](https://github.com/ClickHouse/ClickHouse/pull/86676) ([Azat Khuzhin](https://github.com/azat)).
* ウィンドウ定義の解析とクエリパラメータの適用を修正。 [#86720](https://github.com/ClickHouse/ClickHouse/pull/86720) ([Azat Khuzhin](https://github.com/azat)).
* `PARTITION BY` を指定してパーティションのワイルドカードなしでテーブルを作成する際に、例外 `Partition strategy wildcard can not be used without a '_partition_id' wildcard.` が発生する問題を修正しました。この操作は 25.8 より前のバージョンでは正常に動作していました。この修正により、[https://github.com/ClickHouse/clickhouse-private/issues/37567](https://github.com/ClickHouse/clickhouse-private/issues/37567) をクローズしました。 [#86748](https://github.com/ClickHouse/ClickHouse/pull/86748) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 並列クエリが単一ロックを取得しようとした場合に発生する LogicalError を修正。 [#86751](https://github.com/ClickHouse/ClickHouse/pull/86751) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* RowBinary 入力フォーマットにおいて JSON 共有データに NULL が書き込まれる問題を修正し、ColumnObject に追加のバリデーションをいくつか導入。 [#86812](https://github.com/ClickHouse/ClickHouse/pull/86812) ([Pavel Kruglov](https://github.com/Avogar)).
* LIMIT 使用時の空の Tuple の順列処理を修正。 [#86828](https://github.com/ClickHouse/ClickHouse/pull/86828) ([Pavel Kruglov](https://github.com/Avogar))。
* 永続処理ノードに対しては、個別の Keeper ノードを使用しないようにしました。[https://github.com/ClickHouse/ClickHouse/pull/85995](https://github.com/ClickHouse/ClickHouse/pull/85995) に対する修正です。[#86406](https://github.com/ClickHouse/ClickHouse/issues/86406) をクローズします。 [#86841](https://github.com/ClickHouse/ClickHouse/pull/86841) ([Kseniia Sumarokova](https://github.com/kssenii))。
* TimeSeries エンジンのテーブルが Replicated Database で新しいレプリカを作成できなくなる問題を修正しました。 [#86845](https://github.com/ClickHouse/ClickHouse/pull/86845) ([Nikolay Degterinsky](https://github.com/evillique)).
* タスクに特定の Keeper ノードが含まれていない場合に `system.distributed_ddl_queue` をクエリできない問題を修正しました。 [#86848](https://github.com/ClickHouse/ClickHouse/pull/86848) ([Antonio Andelic](https://github.com/antonio2368)).
* 解凍済みブロック末尾でのシーク処理を修正。 [#86906](https://github.com/ClickHouse/ClickHouse/pull/86906) ([Pavel Kruglov](https://github.com/Avogar)).
* Iceberg Iterator の非同期実行中に発生する例外の処理。 [#86932](https://github.com/ClickHouse/ClickHouse/pull/86932) ([Daniil Ivanik](https://github.com/divanik)).
* 大きな事前処理済み XML 設定ファイルの保存処理を修正。 [#86934](https://github.com/ClickHouse/ClickHouse/pull/86934) ([c-end](https://github.com/c-end)).
* system.iceberg&#95;metadata&#95;log テーブルにおける date フィールドの値設定を修正。 [#86961](https://github.com/ClickHouse/ClickHouse/pull/86961) ([Daniil Ivanik](https://github.com/divanik)).
* `WHERE` を伴う `TTL` が無限に再計算される問題を修正しました。 [#86965](https://github.com/ClickHouse/ClickHouse/pull/86965) ([Anton Popov](https://github.com/CurtizJ)).
* `ROLLUP` および `CUBE` 修飾子を使用した場合に `uniqExact` 関数が誤った結果となる可能性があった問題を修正しました。 [#87014](https://github.com/ClickHouse/ClickHouse/pull/87014) ([Nikita Taranov](https://github.com/nickitat))。
* `parallel_replicas_for_cluster_functions` 設定が 1 に設定されている場合に、`url()` テーブル関数でテーブルスキーマを解決できない問題を修正。 [#87029](https://github.com/ClickHouse/ClickHouse/pull/87029) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* PREWHERE を複数のステップに分割した際に、その出力が正しくキャストされるようにしました。 [#87040](https://github.com/ClickHouse/ClickHouse/pull/87040) ([Antonio Andelic](https://github.com/antonio2368)).
* `ON CLUSTER` 句を使用する軽量更新の不具合を修正しました。 [#87043](https://github.com/ClickHouse/ClickHouse/pull/87043) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の集約関数の状態における String 引数との互換性を修正しました。 [#87049](https://github.com/ClickHouse/ClickHouse/pull/87049) ([Pavel Kruglov](https://github.com/Avogar)).
* OpenAI からのモデル名が渡されていなかった問題を修正しました。 [#87100](https://github.com/ClickHouse/ClickHouse/pull/87100) ([Kaushik Iska](https://github.com/iskakaushik)).
* EmbeddedRocksDB: パスは user&#95;files ディレクトリ配下である必要があります。 [#87109](https://github.com/ClickHouse/ClickHouse/pull/87109) ([Raúl Marín](https://github.com/Algunenano)).
* 25.1 より前に作成された KeeperMap テーブルで、DROP クエリ実行後も ZooKeeper にデータが残る問題を修正しました。 [#87112](https://github.com/ClickHouse/ClickHouse/pull/87112) ([Nikolay Degterinsky](https://github.com/evillique)).
* Parquet 読み込み時の map および array フィールド ID の処理を修正しました。[#87136](https://github.com/ClickHouse/ClickHouse/pull/87136) ([scanhex12](https://github.com/scanhex12)).
* 遅延マテリアライゼーションにおける配列サイズ用サブカラムを持つ配列の読み取りを修正。 [#87139](https://github.com/ClickHouse/ClickHouse/pull/87139) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型の引数を取る CASE 関数を修正。 [#87177](https://github.com/ClickHouse/ClickHouse/pull/87177) ([Pavel Kruglov](https://github.com/Avogar))。
* CSV における空文字列からの空配列の読み取りを修正。[#87182](https://github.com/ClickHouse/ClickHouse/pull/87182)（[Pavel Kruglov](https://github.com/Avogar)）。
* 相関付けられていない `EXISTS` で誤った結果が返される可能性のある問題を修正しました。これは、[https://github.com/ClickHouse/ClickHouse/pull/85481](https://github.com/ClickHouse/ClickHouse/pull/85481) で導入された `execute_exists_as_scalar_subquery=1` によって発生したもので、`25.8` に影響します。[#86415](https://github.com/ClickHouse/ClickHouse/issues/86415) を修正します。[#87207](https://github.com/ClickHouse/ClickHouse/pull/87207)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* `iceberg_metadata_log` が未設定の状態でユーザーが Iceberg メタデータのデバッグ情報を取得しようとした場合にエラーを送出し、ヌルポインタアクセスを修正します。 [#87250](https://github.com/ClickHouse/ClickHouse/pull/87250) ([Daniil Ivanik](https://github.com/divanik)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* abseil-cpp 20250814.0 との互換性問題を修正しました。https://github.com/abseil/abseil-cpp/issues/1923。 [#85970](https://github.com/ClickHouse/ClickHouse/pull/85970) ([Yuriy Chernyshov](https://github.com/georgthegreat)).
* スタンドアロン WASM lexer のビルドをフラグで制御するようにしました。 [#86505](https://github.com/ClickHouse/ClickHouse/pull/86505) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `vmull_p64` 命令をサポートしない古い ARM CPU 上での crc32c のビルドを修正しました。 [#86521](https://github.com/ClickHouse/ClickHouse/pull/86521) ([Pablo Marcos](https://github.com/pamarcos)).
* `openldap` 2.6.10 を使用するようにしました。 [#86623](https://github.com/ClickHouse/ClickHouse/pull/86623) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* darwin で `memalign` をフックしようとしないようにしました。 [#86769](https://github.com/ClickHouse/ClickHouse/pull/86769) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `krb5` 1.22.1-final を使用するようにしました。 [#86836](https://github.com/ClickHouse/ClickHouse/pull/86836) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `list-licenses.sh` における Rust クレート名の展開処理を修正しました。 [#87305](https://github.com/ClickHouse/ClickHouse/pull/87305) ([Konstantin Bogdanov](https://github.com/thevar1able)).

### ClickHouse 25.8 LTS リリース（2025-08-28） {#258}

#### 後方互換性のない変更 {#backward-incompatible-change}

* JSON 内で異なる型を持つ値の配列に対して、名前なし `Tuple` の代わりに `Array(Dynamic)` を推論するようにしました。以前の動作を利用するには、設定 `input_format_json_infer_array_of_dynamic_from_array_of_different_types` を無効にしてください。 [#80859](https://github.com/ClickHouse/ClickHouse/pull/80859) ([Pavel Kruglov](https://github.com/Avogar)).
* 一貫性とシンプルさのために、S3 レイテンシメトリクスをヒストグラムメトリクスへ移行しました。 [#82305](https://github.com/ClickHouse/ClickHouse/pull/82305) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* デフォルト式中のドットを含む識別子について、それらが複合識別子としてパースされるのを防ぐために、バッククォートで囲むことを必須にしました。 [#83162](https://github.com/ClickHouse/ClickHouse/pull/83162) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* Lazy materialization はアナライザ有効時（デフォルト）にのみ有効になります。これは、アナライザなしの構成を保守対象としないようにするためです。弊社の経験上、アナライザなしの運用にはいくつか問題があるためです（たとえば条件内で `indexHint()` を使用する場合など）。 [#83791](https://github.com/ClickHouse/ClickHouse/pull/83791) ([Igor Nikonov](https://github.com/devcrafter)).
* Parquet 出力フォーマットにおいて、デフォルトで `Enum` 型の値を、`ENUM` 論理型を持つ `BYTE_ARRAY` として書き出すようにしました。 [#84169](https://github.com/ClickHouse/ClickHouse/pull/84169) ([Pavel Kruglov](https://github.com/Avogar)).
* MergeTree 設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パートからサブカラムを読み取る際の性能が大きく向上します。バージョン 25.5 未満のサーバーは新しい Compact パートを読み取ることができません。 [#84171](https://github.com/ClickHouse/ClickHouse/pull/84171) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前の `concurrent_threads_scheduler` のデフォルト値は `round_robin` でしたが、多数の単一スレッドのクエリ（例: INSERT）が存在する場合には不公平であることが分かりました。この変更により、より安全な代替である `fair_round_robin` スケジューラがデフォルトになります。 [#84747](https://github.com/ClickHouse/ClickHouse/pull/84747) ([Sergei Trifonov](https://github.com/serxa)).
* ClickHouse は PostgreSQL スタイルのヒアドキュメント構文 `$tag$ string contents... $tag$`（ドル引用符付き文字列リテラルとしても知られる）をサポートしています。以前のバージョンではタグに対する制約が少なく、句読点や空白を含む任意の文字を使用できました。これは、先頭をドル記号から始めることができる識別子との間に構文解析上の曖昧さを生じさせます。一方で、PostgreSQL ではタグには単語文字のみが許可されています。この問題を解決するために、ヒアドキュメントのタグに含められる文字を単語文字のみに制限しました。これにより [#84731](https://github.com/ClickHouse/ClickHouse/issues/84731) がクローズされます。 [#84846](https://github.com/ClickHouse/ClickHouse/pull/84846) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 関数 `azureBlobStorage`、`deltaLakeAzure`、`icebergAzure` は、`AZURE` 権限を正しく検証するように更新されました。すべてのクラスタ版の関数（`-Cluster` 関数）は、対応する非クラスタ版の関数に対して権限を検証するようになりました。加えて、`icebergLocal` および `deltaLakeLocal` 関数は `FILE` 権限チェックを必須とするようになりました。 [#84938](https://github.com/ClickHouse/ClickHouse/pull/84938) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* `allow_dynamic_metadata_for_data_lakes` 設定（Table Engine レベルの設定）をデフォルトで有効化しました。 [#85044](https://github.com/ClickHouse/ClickHouse/pull/85044) ([Daniil Ivanik](https://github.com/divanik)).
* JSON フォーマットにおいて、64 ビット整数をデフォルトでクオートしないようにしました。 [#74079](https://github.com/ClickHouse/ClickHouse/pull/74079) ([Pavel Kruglov](https://github.com/Avogar))

#### 新機能 {#new-feature}

* PromQL 方言の基本的なサポートが追加されました。これを使用するには、clickhouse-client で `dialect='promql'` を設定し、設定 `promql_table_name='X'` を用いて TimeSeries テーブルを参照するようにし、`rate(ClickHouseProfileEvents_ReadCompressedBytes[1m])[5m:1m]` のようなクエリを実行します。さらに、PromQL クエリを SQL でラップすることもできます: `SELECT * FROM prometheusQuery('up', ...);`。現時点では `rate`、`delta`、`increase` 関数のみがサポートされています。単項/二項演算子は未対応です。HTTP API もサポートされていません。[#75036](https://github.com/ClickHouse/ClickHouse/pull/75036)（[Vitaly Baranov](https://github.com/vitlibar)）。
* AI による SQL 自動生成機能は、利用可能な場合には環境変数 `ANTHROPIC_API_KEY` と `OPENAI_API_KEY` を自動検出できるようになりました。これにより、この機能を設定不要（ゼロコンフィグ）で利用できるようになります。 [#83787](https://github.com/ClickHouse/ClickHouse/pull/83787) ([Kaushik Iska](https://github.com/iskakaushik)).
* [ArrowFlight RPC](https://arrow.apache.org/docs/format/Flight.html) プロトコルのサポートを、次を追加することで実装しました: - 新しいテーブル関数 `arrowflight`。 [#74184](https://github.com/ClickHouse/ClickHouse/pull/74184) ([zakr600](https://github.com/zakr600)).
* これにより、すべてのテーブルが `_table` 仮想カラムをサポートするようになりました（`Merge` エンジンを使用するテーブルだけでなく）、特に UNION ALL を使用するクエリで有用です。 [#63665](https://github.com/ClickHouse/ClickHouse/pull/63665) ([Xiaozhe Yu](https://github.com/wudidapaopao))。
* 外部集約／ソートで任意のストレージポリシー（S3 などのオブジェクトストレージを含む）を利用できるようにしました。 [#84734](https://github.com/ClickHouse/ClickHouse/pull/84734) ([Azat Khuzhin](https://github.com/azat)).
* 明示的に指定した IAM ロールを用いた AWS S3 認証を実装しました。GCS 向けに OAuth を実装しました。これらの機能はこれまで ClickHouse Cloud でのみ利用可能でしたが、今回オープンソース化されました。オブジェクトストレージ向けの接続パラメータのシリアル化など、一部のインターフェイスを統一しました。[#84011](https://github.com/ClickHouse/ClickHouse/pull/84011) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Iceberg TableEngine で position delete のサポートを追加しました。 [#83094](https://github.com/ClickHouse/ClickHouse/pull/83094) ([Daniil Ivanik](https://github.com/divanik)).
* Iceberg の Equality Delete をサポート。 [#85843](https://github.com/ClickHouse/ClickHouse/pull/85843) ([Han Fei](https://github.com/hanfei1991)).
* CREATE に対する Iceberg 書き込みを実装。[#83927](https://github.com/ClickHouse/ClickHouse/issues/83927) をクローズ。[#83983](https://github.com/ClickHouse/ClickHouse/pull/83983) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 書き込み用 Glue カタログ。[#84136](https://github.com/ClickHouse/ClickHouse/pull/84136) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 書き込みに対応した Iceberg REST カタログ。 [#84684](https://github.com/ClickHouse/ClickHouse/pull/84684) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* すべての Iceberg の position delete ファイルをデータファイルにマージします。これにより、Iceberg ストレージ内の Parquet ファイルの数とサイズを削減できます。構文：`OPTIMIZE TABLE table_name`。 [#85250](https://github.com/ClickHouse/ClickHouse/pull/85250) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg 向けの `DROP TABLE` をサポート（REST/Glue カタログからの削除とテーブルに関するメタデータの削除）。 [#85395](https://github.com/ClickHouse/ClickHouse/pull/85395) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* merge-on-read 形式の Iceberg テーブルで ALTER DELETE ミューテーションをサポートしました。 [#85549](https://github.com/ClickHouse/ClickHouse/pull/85549) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* DeltaLake への書き込みのサポートを追加。 [#79603](https://github.com/ClickHouse/ClickHouse/issues/79603) をクローズ。 [#85564](https://github.com/ClickHouse/ClickHouse/pull/85564) ([Kseniia Sumarokova](https://github.com/kssenii))。
* テーブルエンジン `DeltaLake` で特定のスナップショットバージョンを読み込めるようにする設定 `delta_lake_snapshot_version` を追加しました。 [#85295](https://github.com/ClickHouse/ClickHouse/pull/85295) ([Kseniia Sumarokova](https://github.com/kssenii)).
* min-max プルーニングのために、メタデータ（マニフェストエントリ）に Iceberg の統計情報（列サイズ、下限値および上限値）をより多く書き込むようにしました。 [#85746](https://github.com/ClickHouse/ClickHouse/pull/85746) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 単純型カラムに対する Iceberg テーブルでの追加／削除／変更をサポートしました。 [#85769](https://github.com/ClickHouse/ClickHouse/pull/85769) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg：version-hint ファイルへの書き込みをサポートしました。これにより [#85097](https://github.com/ClickHouse/ClickHouse/issues/85097) が解決しました。[#85130](https://github.com/ClickHouse/ClickHouse/pull/85130)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* 一時ユーザーによって作成されたビューは、通常のユーザーのコピーを保存するようになり、一時ユーザーが削除された後でも無効化されなくなりました。 [#84763](https://github.com/ClickHouse/ClickHouse/pull/84763) ([pufit](https://github.com/pufit)).
* ベクトル類似性インデックスがバイナリ量子化をサポートするようになりました。バイナリ量子化によりメモリ使用量が大幅に削減され、（距離計算が高速になることで）ベクトルインデックスの構築も高速化されます。また、既存の設定 `vector_search_postfilter_multiplier` は廃止され、より汎用的な設定である `vector_search_index_fetch_multiplier` に置き換えられました。[#85024](https://github.com/ClickHouse/ClickHouse/pull/85024)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `s3` および `s3Cluster` テーブルエンジン/テーブル関数でキー・バリュー形式の引数指定が可能になりました。例えば、`s3('url', CSV, structure = 'a Int32', compression_method = 'gzip')` のように指定できます。[#85134](https://github.com/ClickHouse/ClickHouse/pull/85134)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* Kafka のようなエンジンからのエラーとなった受信メッセージを保持するための新しいシステムテーブル（「dead letter queue」）。 [#68873](https://github.com/ClickHouse/ClickHouse/pull/68873) ([Ilya Golshtein](https://github.com/ilejn))。
* Replicated データベース向けに、ReplicatedMergeTree の既存のリストア機能と同様の新しい `SYSTEM RESTORE DATABASE REPLICA` が追加されました。 [#73100](https://github.com/ClickHouse/ClickHouse/pull/73100) ([Konstantin Morozov](https://github.com/k-morozov)).
* PostgreSQL プロトコルに `COPY` コマンドのサポートを追加しました。 [#74344](https://github.com/ClickHouse/ClickHouse/pull/74344) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* MySQL プロトコル向けの C# クライアントをサポートしました。これにより [#83992](https://github.com/ClickHouse/ClickHouse/issues/83992) が解決されました。[#84397](https://github.com/ClickHouse/ClickHouse/pull/84397)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* Hive パーティション形式での読み取りと書き込みのサポートを追加。 [#76802](https://github.com/ClickHouse/ClickHouse/pull/76802) ([Arthur Passos](https://github.com/arthurpassos)).
* `zookeeper_connection_log` システムテーブルを追加し、ZooKeeper への接続に関する履歴情報を保存できるようにしました。 [#79494](https://github.com/ClickHouse/ClickHouse/pull/79494) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* サーバー設定 `cpu_slot_preemption` は、ワークロードに対するプリエンプティブな CPU スケジューリングを有効にし、ワークロード間での CPU 時間の max-min 公平な割り当てを保証します。CPU スロットリング用の新しいワークロード設定が追加されました：`max_cpus`、`max_cpu_share`、`max_burst_cpu_seconds`。詳細: [https://clickhouse.com/docs/operations/workload-scheduling#cpu&#95;scheduling](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)。 [#80879](https://github.com/ClickHouse/ClickHouse/pull/80879) ([Sergei Trifonov](https://github.com/serxa))。
* 設定されたクエリ数または時間のしきい値に達した後に TCP 接続を切断します。これにより、ロードバランサー配下のクラスタノード間で接続の分布をより均一にできます。[#68000](https://github.com/ClickHouse/ClickHouse/issues/68000) を解決します。 [#81472](https://github.com/ClickHouse/ClickHouse/pull/81472)（[Kenny Sun](https://github.com/hwabis)）。
* パラレルレプリカでクエリにプロジェクションを使用できるようになりました。 [#82659](https://github.com/ClickHouse/ClickHouse/issues/82659)。 [#82807](https://github.com/ClickHouse/ClickHouse/pull/82807) ([zoomxi](https://github.com/zoomxi))。
* DESCRIBE (SELECT ...) に加えて DESCRIBE SELECT もサポートしました。 [#82947](https://github.com/ClickHouse/ClickHouse/pull/82947) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* mysql&#95;port および postgresql&#95;port に対して安全な接続の利用を必須化。 [#82962](https://github.com/ClickHouse/ClickHouse/pull/82962) ([tiandiwonder](https://github.com/tiandiwonder)).
* ユーザーは `JSONExtractCaseInsensitive`（および `JSONExtract` のその他のバリアント）を使用して、大文字小文字を区別しない JSON キー検索を行えるようになりました。 [#83770](https://github.com/ClickHouse/ClickHouse/pull/83770) ([Alistair Evans](https://github.com/alistairjevans))。
* `system.completions` テーブルを導入し、[#81889](https://github.com/ClickHouse/ClickHouse/issues/81889) をクローズ。[#83833](https://github.com/ClickHouse/ClickHouse/pull/83833)（[|2ustam](https://github.com/RuS2m)）。
* 新しい関数 `nowInBlock64` を追加しました。使用例：`SELECT nowInBlock64(6)` は `2025-07-29 17:09:37.775725` を返します。 [#84178](https://github.com/ClickHouse/ClickHouse/pull/84178) ([Halersson Paris](https://github.com/halersson))。
* AzureBlobStorage で client&#95;id と tenant&#95;id を用いて認証できるようにするため、extra&#95;credentials を追加しました。 [#84235](https://github.com/ClickHouse/ClickHouse/pull/84235) ([Pablo Marcos](https://github.com/pamarcos)).
* `DateTime` の値を UUIDv7 に変換する関数 `dateTimeToUUIDv7` を追加しました。使用例：`SELECT dateTimeToUUIDv7(toDateTime('2025-08-15 18:57:56'))` は `0198af18-8320-7a7d-abd3-358db23b9d5c` を返します。 [#84319](https://github.com/ClickHouse/ClickHouse/pull/84319) ([samradovich](https://github.com/samradovich))。
* `timeSeriesDerivToGrid` および `timeSeriesPredictLinearToGrid` 集約関数は、指定された開始タイムスタンプ、終了タイムスタンプ、およびステップで定義される時間グリッドにデータを再サンプリングし、それぞれ PromQL 風の `deriv` と `predict_linear` を計算します。 [#84328](https://github.com/ClickHouse/ClickHouse/pull/84328) ([Stephen Chi](https://github.com/stephchi0)).
* 2 つの新しい TimeSeries 関数を追加しました: - `timeSeriesRange(start_timestamp, end_timestamp, step)`、- `timeSeriesFromGrid(start_timestamp, end_timestamp, step, values)`。[#85435](https://github.com/ClickHouse/ClickHouse/pull/85435)（[Vitaly Baranov](https://github.com/vitlibar)）。
* 新しい構文 `GRANT READ ON S3('s3://foo/.*') TO user` が追加されました。 [#84503](https://github.com/ClickHouse/ClickHouse/pull/84503) ([pufit](https://github.com/pufit))。
* 新しい出力フォーマットとして `Hash` を追加しました。結果のすべての列および行に対して単一のハッシュ値を計算します。これは、たとえばデータ転送がボトルネックとなるユースケースで、結果の「フィンガープリント」を計算するのに有用です。例: `SELECT arrayJoin(['abc', 'def']), 42 FORMAT Hash` は `e5f9e676db098fdb9530d2059d8c23ef` を返します。 [#84607](https://github.com/ClickHouse/ClickHouse/pull/84607) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeper Multi クエリで任意のウォッチを設定できる機能を追加しました。 [#84964](https://github.com/ClickHouse/ClickHouse/pull/84964) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `clickhouse-benchmark` ツールにオプション `--max-concurrency` を追加し、並列クエリ数を段階的に増加させるモードを有効にします。 [#85623](https://github.com/ClickHouse/ClickHouse/pull/85623) ([Sergei Trifonov](https://github.com/serxa))。
* 部分集約されたメトリクスのサポートを追加しました。 [#85328](https://github.com/ClickHouse/ClickHouse/pull/85328) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### 実験的機能 {#experimental-feature}

* 相関付きサブクエリのサポートをデフォルトで有効化しました。もはや実験的機能ではありません。 [#85107](https://github.com/ClickHouse/ClickHouse/pull/85107) ([Dmitry Novik](https://github.com/novikd)).
* Unity、Glue、REST、Hive Metastore のデータレイクカタログを実験的段階からベータ版へ昇格しました。 [#85848](https://github.com/ClickHouse/ClickHouse/pull/85848) ([Melvyn Peignon](https://github.com/melvynator)).
* 軽量な更新および削除機能を実験的段階からベータ版へ昇格しました。
* ベクトル類似度インデックスを用いた近似ベクトル検索が GA になりました。 [#85888](https://github.com/ClickHouse/ClickHouse/pull/85888) ([Robert Schulze](https://github.com/rschu1ze)).
* Ytsaurus テーブルエンジンおよびテーブル関数を追加しました。 [#77606](https://github.com/ClickHouse/ClickHouse/pull/77606) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 以前は、テキストインデックスのデータは複数のセグメントに分割されていました（各セグメントサイズはデフォルトで 256 MiB でした）。これはテキストインデックス構築時のメモリ使用量を削減できる場合がありますが、その一方でディスク上の必要容量を増加させ、クエリ応答時間も長くします。 [#84590](https://github.com/ClickHouse/ClickHouse/pull/84590) ([Elmi Ahmadov](https://github.com/ahmadov)).

#### パフォーマンスの向上 {#performance-improvement}

* 新しい Parquet リーダーの実装です。従来より高速で、ページレベルのフィルタープッシュダウンおよび PREWHERE をサポートします。現在は実験的機能です。有効化するには設定 `input_format_parquet_use_native_reader_v3` を使用します。[#82789](https://github.com/ClickHouse/ClickHouse/pull/82789)（[Michael Kolupaev](https://github.com/al13n321)）。
* Azure Blob Storage 向けの公式 Azure ライブラリにおける HTTP トランスポートを、独自実装の HTTP クライアントに置き換えました。S3 の設定を反映した複数の設定項目を、このクライアントに導入しました。Azure と S3 の両方に対して、かなり短めの接続タイムアウトを導入しました。Azure プロファイルのイベントおよびメトリクスに対する可観測性も改善しました。新しいクライアントはデフォルトで有効化されており、Azure Blob Storage 上のコールドクエリに対してレイテンシを大幅に改善します。従来の `Curl` クライアントは、`azure_sdk_use_native_client=false` を設定することで戻すことができます。 [#83294](https://github.com/ClickHouse/ClickHouse/pull/83294) ([alesapin](https://github.com/alesapin))。従来の公式 Azure クライアント実装は、本番環境での利用には適さず、レイテンシが 5 秒から数分にまで及ぶ深刻なスパイクが発生していました。その問題の大きかった実装を廃止できたことを、私たちは非常に誇りに思っています。
* インデックスをファイルサイズの小さい順に処理します。全体としてのインデックスの処理順序では、まず（それぞれ単純さと選択性に優れるため）minmax インデックスとベクターインデックスを優先し、その後はその他のインデックスを小さいものから処理します。minmax／ベクターインデックスの間でも、より小さいインデックスが優先されます。[#84094](https://github.com/ClickHouse/ClickHouse/pull/84094) ([Maruth Goyal](https://github.com/maruthgoyal))。
* MergeTree の設定 `write_marks_for_substreams_in_compact_parts` をデフォルトで有効化しました。これにより、新しく作成された Compact パーツからサブカラムを読み取る際のパフォーマンスが大幅に向上します。バージョン 25.5 未満のサーバーは、新しい Compact パーツを読み取ることができません。[#84171](https://github.com/ClickHouse/ClickHouse/pull/84171)（[Pavel Kruglov](https://github.com/Avogar)）。
* `azureBlobStorage` テーブルエンジン：可能な場合はマネージド ID 認証トークンをキャッシュして再利用し、レート制限の発生を避けるようにしました。 [#79860](https://github.com/ClickHouse/ClickHouse/pull/79860) ([Nick Blakely](https://github.com/niblak)).
* 右側が結合キー列によって一意に決まる場合（すべての行で結合キー値が一意である場合）、`ALL` `LEFT` / `INNER` JOIN は自動的に `RightAny` に変換されます。 [#84010](https://github.com/ClickHouse/ClickHouse/pull/84010) ([Nikita Taranov](https://github.com/nickitat))。
* `max_joined_block_size_rows` に加えて `max_joined_block_size_bytes` を追加し、サイズの大きいカラムを含む JOIN におけるメモリ使用量を制限できるようにしました。 [#83869](https://github.com/ClickHouse/ClickHouse/pull/83869) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 新しいロジック（設定 `enable_producing_buckets_out_of_order_in_aggregation` によって制御され、デフォルトで有効になっています）が追加され、メモリ効率の高い集約中に一部のバケットを順不同で送信できるようになりました。特定の集約バケットのマージに他よりもかなり長い時間がかかる場合に、イニシエーターがその間にバケット ID のより大きいバケットをマージできるようにすることで、パフォーマンスが向上します。デメリットはメモリ使用量が増加する可能性があることですが（有意な増加にはならないはずです）。[#80179](https://github.com/ClickHouse/ClickHouse/pull/80179)（[Nikita Taranov](https://github.com/nickitat)）。
* `optimize_rewrite_regexp_functions` 設定（デフォルトで有効）を導入しました。この設定により、特定の正規表現パターンが検出された場合、オプティマイザが一部の `replaceRegexpAll`、`replaceRegexpOne`、`extract` 関数呼び出しを、より単純で効率的な形に書き換えることができます。（issue [#81981](https://github.com/ClickHouse/ClickHouse/issues/81981)）。[#81992](https://github.com/ClickHouse/ClickHouse/pull/81992)（[Amos Bird](https://github.com/amosbird)）。
* ハッシュ JOIN のメインループ外で `max_joined_block_rows` を処理するようにしました。ALL JOIN でのパフォーマンスがわずかに向上します。 [#83216](https://github.com/ClickHouse/ClickHouse/pull/83216) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* より高い粒度の min-max インデックスを先に処理するようにしました。[#75381](https://github.com/ClickHouse/ClickHouse/issues/75381) を解決します。[#83798](https://github.com/ClickHouse/ClickHouse/pull/83798)（[Maruth Goyal](https://github.com/maruthgoyal)）。
* `DISTINCT` ウィンドウ集約を線形時間で実行できるようにし、`sumDistinct` のバグを修正。Closes [#79792](https://github.com/ClickHouse/ClickHouse/issues/79792)。Closes [#52253](https://github.com/ClickHouse/ClickHouse/issues/52253)。[#79859](https://github.com/ClickHouse/ClickHouse/pull/79859)（[Nihal Z. Miaji](https://github.com/nihalzp)）。
* ベクトル類似インデックスを利用するベクトル検索クエリは、ストレージの読み取り回数と CPU 使用量が削減されたことで、より低いレイテンシで完了するようになりました。 [#83803](https://github.com/ClickHouse/ClickHouse/pull/83803) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 並列レプリカ間のワークロード分散におけるキャッシュ局所性を向上させる Rendezvous ハッシュ。[#82511](https://github.com/ClickHouse/ClickHouse/pull/82511) ([Anton Ivashkin](https://github.com/ianton-ru)).
* If コンビネータ用に addManyDefaults を実装し、If コンビネータを含む集約関数の動作がより高速になりました。 [#83870](https://github.com/ClickHouse/ClickHouse/pull/83870) ([Raúl Marín](https://github.com/Algunenano)).
* 複数の文字列または数値列で `GROUP BY` する際に、シリアライズされたキーを列指向で計算するようにしました。 [#83884](https://github.com/ClickHouse/ClickHouse/pull/83884) ([李扬](https://github.com/taiyang-li)).
* インデックス解析の結果、並列レプリカの読み取りに対して空の範囲となる場合に、フルスキャンを行わないようにしました。 [#84971](https://github.com/ClickHouse/ClickHouse/pull/84971) ([Eduard Karacharov](https://github.com/korowa)).
* より安定したパフォーマンステストのために -falign-functions=64 を試す。 [#83920](https://github.com/ClickHouse/ClickHouse/pull/83920) ([Azat Khuzhin](https://github.com/azat)).
* ブルームフィルターインデックスは、`column` が `Array` 型ではない場合の `has([c1, c2, ...], column)` のような条件にも使用されるようになりました。これにより、そのようなクエリのパフォーマンスが向上し、`IN` 演算子と同等の効率で実行できるようになります。[#83945](https://github.com/ClickHouse/ClickHouse/pull/83945)（[Doron David](https://github.com/dorki)）。
* CompressedReadBufferBase::readCompressedData における不要な memcpy 呼び出しを減らしました。[#83986](https://github.com/ClickHouse/ClickHouse/pull/83986) ([Raúl Marín](https://github.com/Algunenano)).
* 一時データの削除により `largestTriangleThreeBuckets` を最適化。 [#84479](https://github.com/ClickHouse/ClickHouse/pull/84479) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* コードの簡素化によって文字列のデシリアライズ処理を最適化。Closes [#38564](https://github.com/ClickHouse/ClickHouse/issues/38564)。[#84561](https://github.com/ClickHouse/ClickHouse/pull/84561) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 並列レプリカにおける最小タスクサイズの計算を修正しました。[#84752](https://github.com/ClickHouse/ClickHouse/pull/84752) ([Nikita Taranov](https://github.com/nickitat))。
* `Join` モードにおけるパッチパーツ適用処理のパフォーマンスを改善。[#85040](https://github.com/ClickHouse/ClickHouse/pull/85040) ([Anton Popov](https://github.com/CurtizJ)).
* ゼロバイトを削除しました。[#85062](https://github.com/ClickHouse/ClickHouse/issues/85062) をクローズします。いくつかの小さなバグを修正しました。関数 `structureToProtobufSchema` と `structureToCapnProtoSchema` は、終端のゼロバイトを正しく付加できておらず、その代わりに改行文字を使用していました。これにより、出力から改行が欠落し、ゼロバイトに依存する他の関数（`logTrace`、`demangle`、`extractURLParameter`、`toStringCutToZero`、`encrypt` / `decrypt` など）を使用した際にバッファオーバーフローが発生する可能性がありました。`regexp_tree` 辞書レイアウトは、ゼロバイトを含む文字列の処理をサポートしていませんでした。`Values` フォーマット、あるいは行末に改行を含まないその他のフォーマットで呼び出された `formatRowNoNewline` 関数は、出力の最後の文字を誤って切り落としていました。関数 `stem` には例外安全性の不具合があり、非常にまれなシナリオでメモリリークを引き起こす可能性がありました。`initcap` 関数は `FixedString` 引数に対して誤った動作をしていました。ブロック内の前の文字列が単語構成文字で終わっている場合、文字列の先頭にある単語の開始を認識できませんでした。Apache `ORC` フォーマットのセキュリティ脆弱性を修正しました。これは初期化されていないメモリの露出につながる可能性がありました。関数 `replaceRegexpAll` とそれに対応するエイリアス `REGEXP_REPLACE` の動作を変更しました。これらは、`^a*|a*$` や `^|.*` のように、直前のマッチが文字列全体を処理した場合でも、文字列末尾で空マッチを行えるようになりました。この挙動は JavaScript、Perl、Python、PHP、Ruby のセマンティクスに対応しますが、PostgreSQL のセマンティクスとは異なります。多くの関数の実装が単純化および最適化されました。いくつかの関数のドキュメントが誤っていたため修正しました。`byteSize` の出力について、String 列および String 列で構成される複合型では（空文字列 1 つあたり 9 バイトから 8 バイトへと）変更されている点に注意してください。これは想定された挙動です。[#85063](https://github.com/ClickHouse/ClickHouse/pull/85063)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 単一行を返すためだけに定数をマテリアライズしている場合の定数マテリアライズ処理を最適化しました。 [#85071](https://github.com/ClickHouse/ClickHouse/pull/85071) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* delta-kernel-rs バックエンドを用いた並列ファイル処理を改善しました。 [#85642](https://github.com/ClickHouse/ClickHouse/pull/85642) ([Azat Khuzhin](https://github.com/azat)).
* 新しい設定項目 `enable_add_distinct_to_in_subqueries` が導入されました。有効にすると、ClickHouse は分散クエリにおける `IN` 句内のサブクエリに自動的に `DISTINCT` を追加します。これにより、シャード間で転送される一時テーブルのサイズを大幅に削減し、ネットワーク効率を向上させることができます。注意：これはトレードオフです。ネットワーク転送量は削減されますが、各ノードで追加のマージ（重複排除）処理が必要になります。ネットワーク転送がボトルネックとなっており、マージ処理のコストが許容できる場合に、この設定を有効にしてください。[#81908](https://github.com/ClickHouse/ClickHouse/pull/81908)（[fhw12345](https://github.com/fhw12345)）。
* 実行可能なユーザー定義関数におけるクエリメモリトラッキングのオーバーヘッドを削減。 [#83929](https://github.com/ClickHouse/ClickHouse/pull/83929) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `DeltaLake` に、内部用の `delta-kernel-rs` フィルタリング機能（統計情報およびパーティションのプルーニング）を実装しました。 [#84006](https://github.com/ClickHouse/ClickHouse/pull/84006) ([Kseniia Sumarokova](https://github.com/kssenii)).
* オンザフライで更新される列やパッチパーツによって更新される列に依存するスキップインデックスの無効化を、よりきめ細かく制御するようにしました。これにより、スキップインデックスはオンザフライのミューテーションやパッチパーツの影響を受けたパーツでのみ使用されず、以前のようにすべてのパーツでインデックスが無効化されることはなくなりました。 [#84241](https://github.com/ClickHouse/ClickHouse/pull/84241) ([Anton Popov](https://github.com/CurtizJ)).
* 暗号化された名前付きコレクション用の encrypted&#95;buffer に必要最小限のメモリのみを割り当てるようにしました。 [#84432](https://github.com/ClickHouse/ClickHouse/pull/84432) ([Pablo Marcos](https://github.com/pamarcos)).
* Bloom filter インデックス（regular、ngram、token）について、第 1 引数が定数配列（集合）、第 2 引数がインデックス付きカラム（部分集合）の場合にも利用されるようサポートを改善し、より効率的なクエリ実行を可能にしました。 [#84700](https://github.com/ClickHouse/ClickHouse/pull/84700) ([Doron David](https://github.com/dorki))。
* Keeper におけるストレージロックの競合を軽減。 [#84732](https://github.com/ClickHouse/ClickHouse/pull/84732) ([Antonio Andelic](https://github.com/antonio2368))。
* `WHERE` に対して不足していた `read_in_order_use_virtual_row` のサポートを追加しました。これにより、フィルタが完全には `PREWHERE` にプッシュダウンされていないクエリにおいて、追加のパーツの読み取りをスキップできるようになります。 [#84835](https://github.com/ClickHouse/ClickHouse/pull/84835) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* 各データファイルごとにオブジェクトを明示的に保持することなく、Iceberg テーブルからオブジェクトを非同期にイテレートできるようにしました。 [#85369](https://github.com/ClickHouse/ClickHouse/pull/85369) ([Daniil Ivanik](https://github.com/divanik)).
* 非相関な `EXISTS` をスカラサブクエリとして実行します。これにより、スカラサブクエリキャッシュを使用し、結果を定数畳み込みできるようになり、インデックスの利用に有利になります。後方互換性のために、新しい設定 `execute_exists_as_scalar_subquery=1` が追加されました。 [#85481](https://github.com/ClickHouse/ClickHouse/pull/85481) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。

#### 改善点 {#improvement}

* `database_replicated` 設定を追加し、DatabaseReplicatedSettings のデフォルト値を定義します。Replicated DB の CREATE クエリでこの設定が指定されていない場合は、この設定の値が使用されます。 [#85127](https://github.com/ClickHouse/ClickHouse/pull/85127) ([Tuan Pham Anh](https://github.com/tuanpach))。
* Web UI（play）でテーブルの列をリサイズ可能にしました。 [#84012](https://github.com/ClickHouse/ClickHouse/pull/84012) ([Doron David](https://github.com/dorki))。
* `iceberg_metadata_compression_method` 設定によって圧縮された `.metadata.json` ファイルのサポートを追加しました。ClickHouse のすべての圧縮方式に対応しています。これにより [#84895](https://github.com/ClickHouse/ClickHouse/issues/84895) がクローズされました。[#85196](https://github.com/ClickHouse/ClickHouse/pull/85196)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* `EXPLAIN indexes = 1` の出力に、読み取られる範囲の数を表示するようにしました。 [#79938](https://github.com/ClickHouse/ClickHouse/pull/79938) ([Christoph Wurm](https://github.com/cwurm)).
* ORC 圧縮ブロックサイズを設定するための設定項目を導入し、Spark や Hive と整合性を保つために、そのデフォルト値を 64KB から 256KB に更新しました。[#80602](https://github.com/ClickHouse/ClickHouse/pull/80602) ([李扬](https://github.com/taiyang-li))。
* Wide part に `columns_substreams.txt` ファイルを追加し、その part に保存されているすべてのサブストリームを追跡するようにしました。これにより、JSON および Dynamic 型における動的ストリームを追跡する際に、動的ストリームの一覧を取得するためだけに（たとえばカラムサイズ計算のために）これらのカラムのサンプルを読み取る必要がなくなります。また、すべての動的ストリームが `system.parts_columns` に反映されるようになりました。 [#81091](https://github.com/ClickHouse/ClickHouse/pull/81091) ([Pavel Kruglov](https://github.com/Avogar)).
* 機密データをデフォルトで非表示にするための CLI フラグ --show&#95;secrets を clickhouse format に追加しました。 [#81524](https://github.com/ClickHouse/ClickHouse/pull/81524) ([Nikolai Ryzhov](https://github.com/Dolaxom)).
* S3 の読み取りおよび書き込みリクエストは、`max_remote_read_network_bandwidth_for_server` と `max_remote_write_network_bandwidth_for_server` による帯域制限の問題を回避するため、S3 リクエスト全体ではなく HTTP ソケットレベルで制限されるようになりました。 [#81837](https://github.com/ClickHouse/ClickHouse/pull/81837) ([Sergei Trifonov](https://github.com/serxa))。
* 同じ列に対して、ウィンドウ（ウィンドウ関数用）ごとに異なる照合順序を使用できるようにしました。 [#82877](https://github.com/ClickHouse/ClickHouse/pull/82877) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* マージセレクタをシミュレート・可視化・比較するためのツールを追加。 [#71496](https://github.com/ClickHouse/ClickHouse/pull/71496) ([Sergei Trifonov](https://github.com/serxa)).
* `address_expression` 引数でクラスタが指定されている場合に、並列レプリカ付きの `remote*` テーブル関数のサポートを追加しました。また、[#73295](https://github.com/ClickHouse/ClickHouse/issues/73295) を修正しました。[#82904](https://github.com/ClickHouse/ClickHouse/pull/82904)（[Igor Nikonov](https://github.com/devcrafter)）。
* バックアップファイルの書き込みに関するすべてのログメッセージのログレベルを TRACE に設定しました。 [#82907](https://github.com/ClickHouse/ClickHouse/pull/82907) ([Hans Krutzer](https://github.com/hkrutzer)).
* 通常とは異なる名前やコーデックを持つユーザー定義関数は、SQL フォーマッタによって一貫性のない形式でフォーマットされる場合があります。これにより [#83092](https://github.com/ClickHouse/ClickHouse/issues/83092) がクローズされました。 [#83644](https://github.com/ClickHouse/ClickHouse/pull/83644) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ユーザーは JSON 型内で Time 型および Time64 型を使用できるようになりました。 [#83784](https://github.com/ClickHouse/ClickHouse/pull/83784) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 並列レプリカを用いた JOIN は、現在 JOIN の論理ステップ（`join logical step`）を使用するようになりました。並列レプリカを用いる JOIN クエリで問題が発生した場合は、`SET query_plan_use_new_logical_join_step=0` を試し、問題を報告してください。 [#83801](https://github.com/ClickHouse/ClickHouse/pull/83801) ([Vladimir Cherkasov](https://github.com/vdimir))。
* cluster&#95;function&#95;process&#95;archive&#95;on&#95;multiple&#95;nodes の複数ノード環境での互換性を修正。 [#83968](https://github.com/ClickHouse/ClickHouse/pull/83968) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` テーブルレベルでのマテリアライズドビュー向け挿入設定の変更をサポートしました。新たに `S3Queue` レベルの設定として `min_insert_block_size_rows_for_materialized_views` と `min_insert_block_size_bytes_for_materialized_views` を追加しました。デフォルトではプロファイルレベルの設定が使用され、`S3Queue` レベルの設定がそれらを上書きします。 [#83971](https://github.com/ClickHouse/ClickHouse/pull/83971) ([Kseniia Sumarokova](https://github.com/kssenii))。
* プロファイルイベント `MutationAffectedRowsUpperBound` を追加しました。このイベントは、ミューテーションで影響を受けた行数（例：`ALTER UPDATE` や `ALTER DELETE` クエリで条件を満たす行の合計数）を示します。[#83978](https://github.com/ClickHouse/ClickHouse/pull/83978) ([Anton Popov](https://github.com/CurtizJ))。
* cgroup の情報（該当する場合、`memory_worker_use_cgroup` が有効で cgroups が利用可能な場合）を使用して、メモリトラッカー（`memory_worker_correct_memory_tracker`）を調整します。 [#83981](https://github.com/ClickHouse/ClickHouse/pull/83981) ([Azat Khuzhin](https://github.com/azat)).
* MongoDB: 文字列から数値型への暗黙的なパース。以前は、MongoDB ソースから ClickHouse テーブル内の数値カラムに対して文字列値が受信された場合、例外が発生していました。現在では、エンジンが文字列から数値として自動的にパースしようとします。[#81167](https://github.com/ClickHouse/ClickHouse/issues/81167) を解決。[#84069](https://github.com/ClickHouse/ClickHouse/pull/84069)（[Kirill Nikiforov](https://github.com/allmazz)）。
* `Nullable` な数値に対しても、`Pretty` フォーマットで桁グループをハイライト表示できるようにしました。 [#84070](https://github.com/ClickHouse/ClickHouse/pull/84070) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard: ツールチップが上端でコンテナからはみ出さないようになりました。 [#84072](https://github.com/ClickHouse/ClickHouse/pull/84072) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ダッシュボード上のドットの見た目をわずかに改善しました。 [#84074](https://github.com/ClickHouse/ClickHouse/pull/84074) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Dashboard の favicon が少し改善されました。 [#84076](https://github.com/ClickHouse/ClickHouse/pull/84076) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI: ブラウザがパスワードを保存できるようにしました。また、URL フィールドの値も記憶されるようにしました。 [#84087](https://github.com/ClickHouse/ClickHouse/pull/84087) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 特定の Keeper ノードに対して `apply_to_children` 設定を使用して追加の ACL を適用できるようにしました。 [#84137](https://github.com/ClickHouse/ClickHouse/pull/84137) ([Antonio Andelic](https://github.com/antonio2368)).
* MergeTree における Variant の判別子の「compact」シリアライゼーションの利用方法を修正しました。以前は、利用可能な場合でも一部のケースで使用されていませんでした。 [#84141](https://github.com/ClickHouse/ClickHouse/pull/84141) ([Pavel Kruglov](https://github.com/Avogar)).
* レプリケーテッドデータベース設定にサーバー設定 `logs_to_keep` を追加し、レプリケーテッドデータベースの `logs_to_keep` のデフォルト値を変更できるようにしました。値を小さくすると ZNode の数（特にデータベースが多数ある場合）が減少し、値を大きくすると欠落しているレプリカがより長い時間が経過した後でも追いつけるようになります。 [#84183](https://github.com/ClickHouse/ClickHouse/pull/84183) ([Alexey Khatskevich](https://github.com/Khatskevich))。
* JSON 型解析時に JSON キー内のドットをエスケープするための設定 `json_type_escape_dots_in_keys` を追加しました。この設定はデフォルトで無効です。 [#84207](https://github.com/ClickHouse/ClickHouse/pull/84207) ([Pavel Kruglov](https://github.com/Avogar)).
* 閉じられたコネクションから読み込むことを防ぐため、EOF を確認する前にコネクションがキャンセルされているかどうかをチェックするようにしました。[#83893](https://github.com/ClickHouse/ClickHouse/issues/83893) を修正。[#84227](https://github.com/ClickHouse/ClickHouse/pull/84227)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* Web UI におけるテキスト選択の色をわずかに改善しました。違いが顕著なのは、ダークモード時に選択されたテーブルセルのみです。以前のバージョンでは、テキストと選択背景とのコントラストが不十分でした。 [#84258](https://github.com/ClickHouse/ClickHouse/pull/84258) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 内部チェックを簡素化することで、クライアント接続に対するサーバーのシャットダウン処理を改善しました。 [#84312](https://github.com/ClickHouse/ClickHouse/pull/84312) ([Raufs Dunamalijevs](https://github.com/rienath)).
* `delta_lake_enable_expression_visitor_logging` 設定を追加し、式ビジターのログを無効化できるようにしました。これは、何かをデバッグする際に test ログレベルであってもログが冗長になりすぎる場合があるためです。 [#84315](https://github.com/ClickHouse/ClickHouse/pull/84315) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Cgroup レベルおよびシステム全体のメトリクスが、今後はまとめて報告されます。Cgroup レベルのメトリクス名は `CGroup&lt;Metric&gt;`、OS レベルのメトリクス（procfs から収集されるもの）の名前は `OS&lt;Metric&gt;` です。 [#84317](https://github.com/ClickHouse/ClickHouse/pull/84317) ([Nikita Taranov](https://github.com/nickitat))。
* Web UI のチャートがわずかに改善されました。大きな変更ではありませんが、多少良くなっています。 [#84326](https://github.com/ClickHouse/ClickHouse/pull/84326) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Replicated データベース設定 `max_retries_before_automatic_recovery` のデフォルト値を 10 に変更し、一部のケースでの復旧を高速化しました。 [#84369](https://github.com/ClickHouse/ClickHouse/pull/84369) ([Alexander Tokmakov](https://github.com/tavplubix)).
* クエリパラメータ付きの `CREATE USER` 文のフォーマットを修正しました（例：`CREATE USER {username:Identifier} IDENTIFIED WITH no_password`）。 [#84376](https://github.com/ClickHouse/ClickHouse/pull/84376)（[Azat Khuzhin](https://github.com/azat)）。
* バックアップおよびリストア処理中に使用される S3 のリトライバックオフ戦略を構成するために、`backup_restore_s3_retry_initial_backoff_ms`、`backup_restore_s3_retry_max_backoff_ms`、`backup_restore_s3_retry_jitter_factor` を導入しました。 [#84421](https://github.com/ClickHouse/ClickHouse/pull/84421) ([Julia Kartseva](https://github.com/jkartseva)).
* S3Queue の ordered モードの修正: `shutdown` が呼び出された場合に早期に終了するようにしました。 [#84463](https://github.com/ClickHouse/ClickHouse/pull/84463) ([Kseniia Sumarokova](https://github.com/kssenii)).
* pyiceberg で読み取り可能な Iceberg への書き込みをサポートしました。 [#84466](https://github.com/ClickHouse/ClickHouse/pull/84466) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* KeyValue ストレージのプライマリキー（例: EmbeddedRocksDB、KeeperMap）に対して `IN` / `GLOBAL IN` フィルターをプッシュダウンする際に、集合内の値の型キャストを許可します。 [#84515](https://github.com/ClickHouse/ClickHouse/pull/84515) ([Eduard Karacharov](https://github.com/korowa)).
* chdig を [25.7.1](https://github.com/azat/chdig/releases/tag/v25.7.1) に更新。[#84521](https://github.com/ClickHouse/ClickHouse/pull/84521) ([Azat Khuzhin](https://github.com/azat)).
* UDF 実行中の低レベルエラーは、以前はさまざまなエラーコードが返される可能性がありましたが、現在はエラーコード `UDF_EXECUTION_FAILED` で失敗するようになりました。 [#84547](https://github.com/ClickHouse/ClickHouse/pull/84547) ([Xu Jia](https://github.com/XuJia0210)).
* KeeperClient に `get_acl` コマンドを追加しました。[#84641](https://github.com/ClickHouse/ClickHouse/pull/84641)（[Antonio Andelic](https://github.com/antonio2368)）。
* データレイクテーブルエンジンにスナップショットバージョンを追加します。 [#84659](https://github.com/ClickHouse/ClickHouse/pull/84659) ([Pete Hampton](https://github.com/pjhampton)).
* `ConcurrentBoundedQueue` のサイズを表すディメンション付きメトリクスを追加しました。キューの種類（そのキューの用途）およびキュー ID（キューの現在のインスタンスごとにランダムに生成される ID）をラベルとして持ちます。 [#84675](https://github.com/ClickHouse/ClickHouse/pull/84675) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `system.columns` テーブルで、既存の `name` カラムに対するエイリアスとして `column` が利用できるようになりました。 [#84695](https://github.com/ClickHouse/ClickHouse/pull/84695) ([Yunchi Pang](https://github.com/yunchipang)).
* 新しい MergeTree 設定 `search_orphaned_parts_drives` により、たとえばローカルメタデータを持つディスクなど、パーツを探索する対象ディスクの範囲を制限できるようになりました。 [#84710](https://github.com/ClickHouse/ClickHouse/pull/84710) ([Ilya Golshtein](https://github.com/ilejn)).
* Keeper に 4LW コマンド `lgrq` を追加し、受信リクエストのログ記録を切り替えられるようにしました。 [#84719](https://github.com/ClickHouse/ClickHouse/pull/84719) ([Antonio Andelic](https://github.com/antonio2368)).
* external auth の forward&#95;headers を大文字小文字を区別せずに照合するようにしました。 [#84737](https://github.com/ClickHouse/ClickHouse/pull/84737) ([ingodwerust](https://github.com/ingodwerust)).
* `encrypt_decrypt` ツールが暗号化された ZooKeeper 接続をサポートするようになりました。[#84764](https://github.com/ClickHouse/ClickHouse/pull/84764) ([Roman Vasin](https://github.com/rvasin))。
* `system.errors` にフォーマット文字列を格納するカラムを追加しました。このカラムは、アラートルールで同じエラータイプごとにグループ化するために必要です。 [#84776](https://github.com/ClickHouse/ClickHouse/pull/84776) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `clickhouse-format` が `--hilite` のエイリアスとして `--highlight` を受け付けるように更新しました。- `clickhouse-client` が `--highlight` のエイリアスとして `--hilite` を受け付けるように更新しました。- 変更内容を反映するように `clickhouse-format` のドキュメントを更新しました。 [#84806](https://github.com/ClickHouse/ClickHouse/pull/84806) ([Rishabh Bhardwaj](https://github.com/rishabh1815769)).
* Iceberg の複合型に対するフィールド ID ベースの読み取りを修正。 [#84821](https://github.com/ClickHouse/ClickHouse/pull/84821) ([Konstantin Vedernikov](https://github.com/scanhex12))。
* `SlowDown` などのエラーによって発生するリトライストーム時に、1 つのリトライ可能なエラーを検知した時点で全スレッドの処理を減速させることで S3 への負荷を軽減するための新しい設定 `backup_slow_all_threads_after_retryable_s3_error` を導入しました。 [#84854](https://github.com/ClickHouse/ClickHouse/pull/84854) ([Julia Kartseva](https://github.com/jkartseva)).
* Replicated DB における append 以外の RMV DDL 向けの旧一時テーブルの作成およびリネーム処理をスキップします。 [#84858](https://github.com/ClickHouse/ClickHouse/pull/84858) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Keeper のログエントリキャッシュサイズを、`keeper_server.coordination_settings.latest_logs_cache_entry_count_threshold` と `keeper_server.coordination_settings.commit_logs_cache_entry_count_threshold` を使用して、エントリ数ベースで制限します。 [#84877](https://github.com/ClickHouse/ClickHouse/pull/84877) ([Antonio Andelic](https://github.com/antonio2368)).
* サポートされていないアーキテクチャでも `simdjson` を使用できるようにしました（以前は `CANNOT_ALLOCATE_MEMORY` エラーが発生していました）。[#84966](https://github.com/ClickHouse/ClickHouse/pull/84966) ([Azat Khuzhin](https://github.com/azat))。
* Async logging: 制限を調整可能にし、イントロスペクション機能を追加。 [#85105](https://github.com/ClickHouse/ClickHouse/pull/85105) ([Raúl Marín](https://github.com/Algunenano)).
* オブジェクトストレージの削除を単一の操作で実行できるよう、削除対象のオブジェクトをすべてまとめて収集するようにしました。 [#85316](https://github.com/ClickHouse/ClickHouse/pull/85316) ([Mikhail Artemenko](https://github.com/Michicosun)).
* Iceberg における現在の positional delete ファイルの実装では、すべてのデータを RAM に保持します。positional delete ファイルが大きくなることはよくあるため、これはかなりコストが高くなり得ます。私の実装では、Parquet delete ファイルの最後の row group だけを RAM に保持するため、コストを大幅に削減できます。 [#85329](https://github.com/ClickHouse/ClickHouse/pull/85329) ([Konstantin Vedernikov](https://github.com/scanhex12))
* chdig: 画面に残る描画の不具合を修正し、エディターでクエリを編集した後にクラッシュする問題を修正し、`path` から `editor` を検索するようにし、[25.8.1](https://github.com/azat/chdig/releases/tag/v25.8.1) にアップデートしました。 [#85341](https://github.com/ClickHouse/ClickHouse/pull/85341) ([Azat Khuzhin](https://github.com/azat)).
* 不足していた `partition_columns_in_data_file` を Azure 構成に追加。 [#85373](https://github.com/ClickHouse/ClickHouse/pull/85373) ([Arthur Passos](https://github.com/arthurpassos))。
* 関数 `timeSeries*ToGrid` でステップ値 0 を許可します。これは [#75036](https://github.com/ClickHouse/ClickHouse/pull/75036) の一部です。[#85390](https://github.com/ClickHouse/ClickHouse/pull/85390)（[Vitaly Baranov](https://github.com/vitlibar)）。
* system.tables にデータレイクテーブルを追加するかどうかを制御するフラグ show&#95;data&#95;lake&#95;catalogs&#95;in&#95;system&#95;tables を追加しました。[#85384](https://github.com/ClickHouse/ClickHouse/issues/85384) を解決。[#85411](https://github.com/ClickHouse/ClickHouse/pull/85411)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `remote_fs_zero_copy_zookeeper_path` におけるマクロ展開のサポートを追加しました。 [#85437](https://github.com/ClickHouse/ClickHouse/pull/85437) ([Mikhail Koviazin](https://github.com/mkmkme)).
* clickhouse-client における AI の見た目が少し良くなりました。 [#85447](https://github.com/ClickHouse/ClickHouse/pull/85447) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 既存のデプロイメントで trace&#95;log.symbolize がデフォルトで有効になるようにしました。 [#85456](https://github.com/ClickHouse/ClickHouse/pull/85456) ([Azat Khuzhin](https://github.com/azat)).
* 複合識別子を含むより多くのケースに対応しました。特に、`ARRAY JOIN` と旧アナライザとの互換性が向上しています。従来の動作を維持するための新しい設定 `analyzer_compatibility_allow_compound_identifiers_in_unflatten_nested` を導入しました。 [#85492](https://github.com/ClickHouse/ClickHouse/pull/85492) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* system.columns のテーブルの列サイズを取得する際に UNKNOWN&#95;DATABASE を無視するようにしました。 [#85632](https://github.com/ClickHouse/ClickHouse/pull/85632) ([Azat Khuzhin](https://github.com/azat)).
* パッチパーツ全体の非圧縮バイト数の合計に対する上限（テーブル設定 `max_uncompressed_bytes_in_patches`）を追加しました。これにより、軽量更新後の SELECT クエリが大幅に遅くなることを防ぎ、軽量更新の悪用も防ぎます。 [#85641](https://github.com/ClickHouse/ClickHouse/pull/85641) ([Anton Popov](https://github.com/CurtizJ)).
* `GRANT READ/WRITE` のソースタイプおよび `GRANT TABLE ENGINE` のテーブルエンジンを判別できるように、`system.grants` に `parameter` カラムを追加しました。 [#85643](https://github.com/ClickHouse/ClickHouse/pull/85643) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `CREATE DICTIONARY` クエリ内で、パラメータ付きカラム（例: `Decimal(8)`）に続くカラムの末尾にあるカンマのパース処理を修正しました。[#85586](https://github.com/ClickHouse/ClickHouse/issues/85586) をクローズしました。[#85653](https://github.com/ClickHouse/ClickHouse/pull/85653)（[Nikolay Degterinsky](https://github.com/evillique)）。
* `nested` 関数で内部配列をサポートするようにしました。 [#85719](https://github.com/ClickHouse/ClickHouse/pull/85719) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 外部ライブラリによって行われるすべてのメモリ割り当てが、ClickHouse のメモリトラッカーによっても追跡され、正しく計上されるようになりました。これにより、一部のクエリでは報告されるメモリ使用量が「増加」したように見えたり、`MEMORY_LIMIT_EXCEEDED` で失敗する可能性があります。 [#84082](https://github.com/ClickHouse/ClickHouse/pull/84082) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

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

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* デフォルトで、S3 を使用するテストに暗号化ディスクを使用するようにしました。 [#59898](https://github.com/ClickHouse/ClickHouse/pull/59898) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 統合テストで、ストリップされていないデバッグシンボルを取得するために `clickhouse` バイナリを使用するようにしました。 [#83779](https://github.com/ClickHouse/ClickHouse/pull/83779) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* 内部で利用している libxml2 を 2.14.4 から 2.14.5 に更新しました。 [#84230](https://github.com/ClickHouse/ClickHouse/pull/84230) ([Robert Schulze](https://github.com/rschu1ze)).
* 内部で利用している curl を 8.14.0 から 8.15.0 に更新しました。 [#84231](https://github.com/ClickHouse/ClickHouse/pull/84231) ([Robert Schulze](https://github.com/rschu1ze)).
* CI でキャッシュに使用するメモリを削減し、キャッシュエビクションに関するテストを改善しました。 [#84676](https://github.com/ClickHouse/ClickHouse/pull/84676) ([alesapin](https://github.com/alesapin)).

### ClickHouse リリース 25.7、2025-07-24 {#257}

#### 後方互換性のない変更 {#backward-incompatible-change}

* `extractKeyValuePairs` 関数の変更: 引数 `unexpected_quoting_character_strategy` を新たに導入しました。これは、クオートされていないキーや値を読み取っているときに、想定外の `quoting_character` が見つかった場合の挙動を制御します。値として指定できるのは `invalid`、`accept`、`promote` のいずれかです。`invalid` はそのキーを破棄し、キー待ち状態に戻ります。`accept` はそれをキーの一部として扱います。`promote` は直前の文字を破棄し、クオートされたキーとしてパースを開始します。加えて、クオートされた値をパースした後は、ペア区切り文字が見つかった場合にのみ次のキーをパースします。 [#80657](https://github.com/ClickHouse/ClickHouse/pull/80657) ([Arthur Passos](https://github.com/arthurpassos)).
* `countMatches` 関数でゼロバイトのマッチをサポートしました。従来の動作を維持したいユーザーは、設定 `count_matches_stop_at_empty_match` を有効にできます。 [#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov)).
* BACKUP の生成時に、専用のサーバー設定（`max_backup_bandwidth_for_server`、`max_mutations_bandwidth_for_server`、`max_merges_bandwidth_for_server`）に加えて、ローカル用（`max_local_read_bandwidth_for_server` と `max_local_write_bandwidth_for_server`）およびリモート用（`max_remote_read_network_bandwidth_for_server` と `max_remote_write_network_bandwidth_for_server`）のサーバー全体のスロットラを使用するようにしました。 [#81753](https://github.com/ClickHouse/ClickHouse/pull/81753) ([Sergei Trifonov](https://github.com/serxa)).
* 挿入可能なカラムを持たないテーブルの作成を禁止しました。 [#81835](https://github.com/ClickHouse/ClickHouse/pull/81835) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* アーカイブ内のファイル単位で cluster 関数を並列実行するようにしました。以前のバージョンでは、zip、tar、7z などのアーカイブ全体が 1 単位の処理対象でした。新しい設定 `cluster_function_process_archive_on_multiple_nodes` を追加し、デフォルト値は `true` です。`true` に設定すると、cluster 関数でアーカイブを処理する際のパフォーマンスが向上します。互換性維持および、以前のバージョンでアーカイブ付きの cluster 関数を使用している場合に 25.7+ へのアップグレード中のエラーを回避するためには、`false` に設定する必要があります。 [#82355](https://github.com/ClickHouse/ClickHouse/pull/82355) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `SYSTEM RESTART REPLICAS` クエリが、当該データベースへのアクセス権がない場合でも Lazy データベース内のテーブルをウェイクアップしており、そのテーブルが同時に DROP されている最中に発生していました。注: 現在は `SYSTEM RESTART REPLICAS` は、`SHOW TABLES` の権限を持つデータベース内のレプリカのみを再起動します。これは自然な挙動です。 [#83321](https://github.com/ClickHouse/ClickHouse/pull/83321) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### 新機能 {#new-feature}

* `MergeTree` ファミリーのテーブルで lightweight update がサポートされました。lightweight update は新しい構文 `UPDATE &lt;table&gt; SET col1 = val1, col2 = val2, ... WHERE &lt;condition&gt;` で使用できます。さらに、lightweight update を利用した lightweight delete の実装が追加されました。`lightweight_delete_mode = 'lightweight_update'` を設定すると有効になります。 [#82004](https://github.com/ClickHouse/ClickHouse/pull/82004) ([Anton Popov](https://github.com/CurtizJ))。
* Iceberg スキーマの進化で複合型をサポートしました。 [#73714](https://github.com/ClickHouse/ClickHouse/pull/73714) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg テーブルへの INSERT をサポートしました。 [#82692](https://github.com/ClickHouse/ClickHouse/pull/82692) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* Iceberg データファイルをフィールド ID ベースで読み取るようにしました。これにより Iceberg との互換性が向上します。メタデータ内のフィールドは名前を変更しても、基盤となる Parquet ファイル内の別の名前にマッピングできます。この変更により [#83065](https://github.com/ClickHouse/ClickHouse/issues/83065) が解決されました。[#83653](https://github.com/ClickHouse/ClickHouse/pull/83653)（[Konstantin Vedernikov](https://github.com/scanhex12)）。
* ClickHouse は Iceberg 向けの圧縮された `metadata.json` ファイルをサポートするようになりました。 [#70874](https://github.com/ClickHouse/ClickHouse/issues/70874) を修正しました。 [#81451](https://github.com/ClickHouse/ClickHouse/pull/81451)（[alesapin](https://github.com/alesapin)）。
* Glue カタログで `TimestampTZ` をサポートするようにしました。これにより [#81654](https://github.com/ClickHouse/ClickHouse/issues/81654) がクローズされました。[#83132](https://github.com/ClickHouse/ClickHouse/pull/83132) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ClickHouse クライアントに AI 搭載の SQL 生成機能を追加しました。ユーザーはクエリ文字列の先頭に `??` を付けることで、自然言語による説明から SQL クエリを生成できるようになりました。OpenAI および Anthropic をプロバイダーとしてサポートし、自動スキーマ検出に対応しています。[#83314](https://github.com/ClickHouse/ClickHouse/pull/83314)（[Kaushik Iska](https://github.com/iskakaushik)）。
* Geo 型を WKB 形式で書き出すための関数を追加しました。 [#82935](https://github.com/ClickHouse/ClickHouse/pull/82935) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* ソース向けに `READ` と `WRITE` の 2 種類の新しいアクセス種別が導入され、ソースに関連するそれまでのすべてのアクセス種別は非推奨となりました。以前は `GRANT S3 ON *.* TO user` でしたが、現在は `GRANT READ, WRITE ON S3 TO user` となります。これにより、ソースに対する `READ` と `WRITE` の権限を分離して付与することも可能になります。例えば、`GRANT READ ON * TO user`、`GRANT WRITE ON S3 TO user` のように指定できます。この機能は設定 `access_control_improvements.enable_read_write_grants` によって制御され、デフォルトでは無効になっています。[#73659](https://github.com/ClickHouse/ClickHouse/pull/73659) ([pufit](https://github.com/pufit))。
* NumericIndexedVector: ビットスライス方式の Roaring Bitmap 圧縮を基盤とする新しいベクターデータ構造で、構築・解析・要素ごとの算術演算のための 20 以上の関数を備えています。疎なデータに対するストレージ使用量を削減し、結合・フィルタリング・集約処理を高速化できます。[#70582](https://github.com/ClickHouse/ClickHouse/issues/70582) および T. Xiong と Y. Wang による VLDB 2024 掲載論文 [“Large-Scale Metric Computation in Online Controlled Experiment Platform”](https://arxiv.org/abs/2405.08411) を実装したものです。[#74193](https://github.com/ClickHouse/ClickHouse/pull/74193)（[FriendLey](https://github.com/FriendLey)）。
* ワークロード設定 `max_waiting_queries` がサポートされるようになりました。クエリキューのサイズを制限するために使用できます。上限に達すると、それ以降のすべてのクエリは `SERVER_OVERLOADED` エラーで終了します。 [#81250](https://github.com/ClickHouse/ClickHouse/pull/81250) ([Oleg Doronin](https://github.com/dorooleg))。
* 財務関数を追加: `financialInternalRateOfReturnExtended` (`XIRR`), `financialInternalRateOfReturn` (`IRR`), `financialNetPresentValueExtended` (`XNPV`), `financialNetPresentValue` (`NPV`)。[#81599](https://github.com/ClickHouse/ClickHouse/pull/81599)（[Joanna Hulboj](https://github.com/jh0x)）。
* 2 つのポリゴンが交差しているかどうかを判定するための地理空間関数 `polygonsIntersectCartesian` および `polygonsIntersectSpherical` を追加。[#81882](https://github.com/ClickHouse/ClickHouse/pull/81882)（[Paul Lamb](https://github.com/plamb)）。
* MergeTree ファミリーのテーブルで `_part_granule_offset` 仮想カラムをサポートしました。このカラムは、各行が所属するデータパーツ内でのグラニュール／マークの 0 ベースのインデックスを示します。これは [#79572](https://github.com/ClickHouse/ClickHouse/issues/79572) に対処するものです。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）。[#82341](https://github.com/ClickHouse/ClickHouse/pull/82341)（[Amos Bird](https://github.com/amosbird)）
* sRGB および OkLCH カラー空間間で色を変換するための SQL 関数 `colorSRGBToOkLCH` および `colorOkLCHToSRGB` を追加しました。 [#83679](https://github.com/ClickHouse/ClickHouse/pull/83679) ([Fgrtue](https://github.com/Fgrtue)).
* `CREATE USER` クエリでユーザー名にパラメータを使用できるようにしました。 [#81387](https://github.com/ClickHouse/ClickHouse/pull/81387) ([Diskein](https://github.com/Diskein)).
* `system.formats` テーブルに、HTTP コンテンツタイプやスキーマ推論機能など、フォーマットに関する拡張情報が含まれるようになりました。 [#81505](https://github.com/ClickHouse/ClickHouse/pull/81505) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### 実験的機能 {#experimental-feature}

* テキストインデックスを検索するための汎用ツールとして、関数 `searchAny` と `searchAll` を追加しました。[#80641](https://github.com/ClickHouse/ClickHouse/pull/80641) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックスで新しい `split` tokenizer をサポートしました。[#81752](https://github.com/ClickHouse/ClickHouse/pull/81752) ([Elmi Ahmadov](https://github.com/ahmadov)).
* `text` インデックスのデフォルトのインデックス粒度値を 64 に変更しました。これにより、社内ベンチマークにおける平均的なテストクエリの期待される性能が向上します。[#82162](https://github.com/ClickHouse/ClickHouse/pull/82162) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* 256 ビットのビットマップは状態の出辺ラベルを順序付きで保存しますが、出辺の状態自体はハッシュテーブル内に現れる順序でディスクに保存されます。そのため、ディスクから読み出す際に、あるラベルが誤った次の状態を指してしまう可能性がありました。[#82783](https://github.com/ClickHouse/ClickHouse/pull/82783) ([Elmi Ahmadov](https://github.com/ahmadov)).
* テキストインデックス内の FST ツリー BLOB に対して zstd 圧縮を有効化しました。[#83093](https://github.com/ClickHouse/ClickHouse/pull/83093) ([Elmi Ahmadov](https://github.com/ahmadov)).
* ベクトル類似性インデックスをベータ版に昇格しました。ベクトル類似性インデックスを利用するには、エイリアス設定 `enable_vector_similarity_index` を有効にする必要があります。[#83459](https://github.com/ClickHouse/ClickHouse/pull/83459) ([Robert Schulze](https://github.com/rschu1ze)).
* 実験的なゼロコピー複製に関連する実験的な `send_metadata` ロジックを削除しました。これは一度も使用されておらず、このコードをサポートしている人もいませんでした。さらに、これに関連するテストもまったく存在しなかったため、かなり前から壊れていた可能性が高いです。[#82508](https://github.com/ClickHouse/ClickHouse/pull/82508) ([alesapin](https://github.com/alesapin)).
* `StorageKafka2` を `system.kafka_consumers` に統合しました。[#82652](https://github.com/ClickHouse/ClickHouse/pull/82652) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* 統計情報に基づいて、複雑な CNF/DNF（例: `(a < 1 and a > 0) or b = 3`）を推定できるようにしました。[#82663](https://github.com/ClickHouse/ClickHouse/pull/82663) ([Han Fei](https://github.com/hanfei1991)).

#### パフォーマンスの向上 {#performance-improvement}

* 非同期ロギングを導入しました。ログが低速なデバイスに出力される場合でも、クエリ処理がブロックされなくなりました。[#82516](https://github.com/ClickHouse/ClickHouse/pull/82516) ([Raúl Marín](https://github.com/Algunenano))。キューに保持されるエントリ数の上限を設けました。[#83214](https://github.com/ClickHouse/ClickHouse/pull/83214) ([Raúl Marín](https://github.com/Algunenano))。
* Parallel distributed INSERT SELECT は、INSERT SELECT が各シャードで独立して実行されるモードではデフォルトで有効になっています。`parallel_distributed_insert_select` 設定を参照してください。 [#83040](https://github.com/ClickHouse/ClickHouse/pull/83040) ([Igor Nikonov](https://github.com/devcrafter)).
* 集約クエリに、`Nullable` ではないカラムに対する単一の `count()` 関数のみが含まれている場合、ハッシュテーブルの走査時に集約ロジックが完全にインライン化されます。これにより、集約状態の割り当てや維持が不要となり、メモリ使用量と CPU オーバーヘッドが大幅に削減されます。これは [#81982](https://github.com/ClickHouse/ClickHouse/issues/81982) を部分的に解決するものです。[#82104](https://github.com/ClickHouse/ClickHouse/pull/82104)（[Amos Bird](https://github.com/amosbird)）。
* `HashJoin` のパフォーマンスを最適化しました。典型的な、キー列が 1 つだけの場合にはハッシュマップに対する追加ループを削除し、さらに `null_map` および `join_mask` が常に `true` / `false` となるケースでは、それらのチェックも除去しました。 [#82308](https://github.com/ClickHouse/ClickHouse/pull/82308) ([Nikita Taranov](https://github.com/nickitat)).
* `-If` コンビネータに対する軽微な最適化。 [#78454](https://github.com/ClickHouse/ClickHouse/pull/78454) ([李扬](https://github.com/taiyang-li))。
* ベクター類似性インデックスを使用したベクター検索クエリが、ストレージ読み取り回数と CPU 使用量の削減により、より低レイテンシで完了するようになりました。 [#79103](https://github.com/ClickHouse/ClickHouse/pull/79103) ([Shankar Iyer](https://github.com/shankar-iyer)).
* `filterPartsByQueryConditionCache` において `merge_tree_min_{rows,bytes}_for_seek` を考慮するようにし、インデックスを使ってフィルタリングする他のメソッドと動作を揃えました。 [#80312](https://github.com/ClickHouse/ClickHouse/pull/80312) ([李扬](https://github.com/taiyang-li))。
* `TOTALS` ステップ以降のパイプラインをマルチスレッド化しました。 [#80331](https://github.com/ClickHouse/ClickHouse/pull/80331) ([UnamedRus](https://github.com/UnamedRus)).
* `Redis` および `KeeperMap` ストレージに対するキーによるフィルタリングを修正しました。 [#81833](https://github.com/ClickHouse/ClickHouse/pull/81833) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 新しい設定 `min_joined_block_size_rows`（`min_joined_block_size_bytes` に類似、デフォルトは 65409）を追加し、JOIN の入力および出力ブロック（結合アルゴリズムが対応している場合）の最小ブロックサイズ（行数）を制御できるようにしました。小さいブロックはまとめられます。 [#81886](https://github.com/ClickHouse/ClickHouse/pull/81886) ([Nikita Taranov](https://github.com/nickitat))。
* `ATTACH PARTITION` によって、もはやすべてのキャッシュがクリアされることはなくなりました。 [#82377](https://github.com/ClickHouse/ClickHouse/pull/82377) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 相関サブクエリに対して、同値類を利用して冗長な JOIN 操作を削除することで、生成される実行プランを最適化します。すべての相関列に対して等価な式が存在する場合、`query_plan_correlated_subqueries_use_substitution` 設定が有効になっていれば、`CROSS JOIN` は生成されません。[#82435](https://github.com/ClickHouse/ClickHouse/pull/82435)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `EXISTS` の引数であると判断される相関サブクエリでは、必要な列のみを読み取るようにしました。 [#82443](https://github.com/ClickHouse/ClickHouse/pull/82443) ([Dmitry Novik](https://github.com/novikd)).
* クエリ解析中のクエリツリーの比較処理をわずかに高速化しました。 [#82617](https://github.com/ClickHouse/ClickHouse/pull/82617) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* ProfileEvents の Counter にアラインメントを追加し、false sharing を低減しました。 [#82697](https://github.com/ClickHouse/ClickHouse/pull/82697) ([Jiebin Sun](https://github.com/jiebinn)).
* [#82308](https://github.com/ClickHouse/ClickHouse/issues/82308) で行われた `null_map` と `JoinMask` の最適化が、複数の OR 条件を含む JOIN の場合にも適用されました。また、`KnownRowsHolder` データ構造も最適化されました。[#83041](https://github.com/ClickHouse/ClickHouse/pull/83041)（[Nikita Taranov](https://github.com/nickitat)）。
* JOIN フラグには、フラグにアクセスするたびにハッシュを計算することを避けるため、プレーンな `std::vector<std::atomic_bool>` が使用されます。 [#83043](https://github.com/ClickHouse/ClickHouse/pull/83043) ([Nikita Taranov](https://github.com/nickitat)).
* `HashJoin` が `lazy` 出力モードを使用する場合、結果カラム用のメモリを事前に確保しないでください。これは、特に一致数が少ない場合には非効率的です。さらに、結合の完了後には正確な一致件数が分かるため、より正確に事前割り当てを行えます。 [#83304](https://github.com/ClickHouse/ClickHouse/pull/83304) ([Nikita Taranov](https://github.com/nickitat)).
* パイプライン構築時のポートヘッダーでのメモリコピーを最小化。元の[PR](https://github.com/ClickHouse/ClickHouse/pull/70105)は[heymind](https://github.com/heymind)によるもの。[#83381](https://github.com/ClickHouse/ClickHouse/pull/83381)（[Raúl Marín](https://github.com/Algunenano)）。
* rocksdb ストレージ使用時の clickhouse-keeper の起動を改善しました。 [#83390](https://github.com/ClickHouse/ClickHouse/pull/83390) ([Antonio Andelic](https://github.com/antonio2368)).
* 高い同時実行負荷時のロック競合を減らすため、ロックを保持したままストレージスナップショットデータを作成しないようにしました。 [#83510](https://github.com/ClickHouse/ClickHouse/pull/83510) ([Duc Canh Le](https://github.com/canhld94)).
* パースエラーが発生しない場合にシリアライザを再利用することで、`ProtobufSingle` 入力フォーマットのパフォーマンスを向上しました。 [#83613](https://github.com/ClickHouse/ClickHouse/pull/83613) ([Eduard Karacharov](https://github.com/korowa)).
* 短いクエリを高速化するためのパイプライン構築処理のパフォーマンスを改善。 [#83631](https://github.com/ClickHouse/ClickHouse/pull/83631) ([Raúl Marín](https://github.com/Algunenano)).
* 短いクエリを高速化するため、`MergeTreeReadersChain::getSampleBlock` を最適化しました。 [#83875](https://github.com/ClickHouse/ClickHouse/pull/83875) ([Raúl Marín](https://github.com/Algunenano)).
* データカタログにおけるテーブル一覧の表示を、非同期リクエストにより高速化しました。 [#81084](https://github.com/ClickHouse/ClickHouse/pull/81084) ([alesapin](https://github.com/alesapin)).
* `s3_slow_all_threads_after_network_error` 設定が有効な場合、S3 の再試行メカニズムにジッターを導入しました。 [#81849](https://github.com/ClickHouse/ClickHouse/pull/81849) ([zoomxi](https://github.com/zoomxi)).

#### 改善点 {#improvement}

* 可読性を高めるため、括弧を複数の色で表示するようにしました。 [#82538](https://github.com/ClickHouse/ClickHouse/pull/82538) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* LIKE/REGEXP パターンを入力している際にメタ文字をハイライトするようにしました。これはすでに `clickhouse-format` および `clickhouse-client` の echo 出力では実装されていましたが、今回からコマンドプロンプトでも行われるようになりました。 [#82871](https://github.com/ClickHouse/ClickHouse/pull/82871) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-format` におけるハイライトとクライアントの echo 出力におけるハイライトは、コマンドラインプロンプトでのハイライトと同様に動作します。 [#82874](https://github.com/ClickHouse/ClickHouse/pull/82874) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 現在、`plain_rewritable` ディスクをデータベースメタデータ用のディスクとして利用できるようになりました。データベースディスクとしてサポートするために、`plain_rewritable` に `moveFile` および `replaceFile` メソッドを実装しました。 [#79424](https://github.com/ClickHouse/ClickHouse/pull/79424) ([Tuan Pham Anh](https://github.com/tuanpach))。
* `PostgreSQL`、`MySQL`、`DataLake` データベースのバックアップを許可しました。これらのデータベースのバックアップでは、データベース内のデータではなく定義のみが保存されます。 [#79982](https://github.com/ClickHouse/ClickHouse/pull/79982) ([Nikolay Degterinsky](https://github.com/evillique)).
* `allow_experimental_join_condition` の設定は、現在は常に許可されているため、非推奨としてマークされました。 [#80566](https://github.com/ClickHouse/ClickHouse/pull/80566) ([Vladimir Cherkasov](https://github.com/vdimir))。
* ClickHouse の非同期メトリクスにプレッシャーメトリクスを追加。 [#80779](https://github.com/ClickHouse/ClickHouse/pull/80779) ([Xander Garbett](https://github.com/Garbett1)).
* マークキャッシュからのエビクションを追跡するためのメトリクス `MarkCacheEvictedBytes`、`MarkCacheEvictedMarks`、`MarkCacheEvictedFiles` を追加しました（issue [#60989](https://github.com/ClickHouse/ClickHouse/issues/60989)）。[#80799](https://github.com/ClickHouse/ClickHouse/pull/80799)（[Shivji Kumar Jha](https://github.com/shiv4289)）。
* Parquet の enum を、[仕様](https://github.com/apache/parquet-format/blob/master/LogicalTypes.md#enum) で規定されているとおりバイト配列として書き込めるようにしました。 [#81090](https://github.com/ClickHouse/ClickHouse/pull/81090) ([Arthur Passos](https://github.com/arthurpassos)).
* `DeltaLake` テーブルエンジンの改善: delta-kernel-rs には `ExpressionVisitor` API があり、この PR で実装されてパーティション列の式変換に適用されています（これは、従来コードで使用していた、delta-kernel-rs 側で非推奨となっていた古い方式を置き換えるものです）。将来的には、この `ExpressionVisitor` により、統計情報に基づくプルーニングや、いくつかの Delta Lake 独自機能も実装できるようになります。さらに、この変更の目的は、`DeltaLakeCluster` テーブルエンジンでのパーティションプルーニングをサポートすることです（パースされた式の結果である ActionsDAG はシリアライズされ、データパスとともにイニシエータから送信されます。というのも、この種のプルーニングに必要な情報はデータファイル一覧のメタ情報としてのみ利用可能であり、この処理はイニシエータだけが実行しますが、その情報は各リーディングサーバ上のデータに適用される必要があるためです）。[#81136](https://github.com/ClickHouse/ClickHouse/pull/81136)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 名前付きタプルのスーパータイプ導出時に、要素名を保持するようにしました。 [#81345](https://github.com/ClickHouse/ClickHouse/pull/81345) ([lgbo](https://github.com/lgbo-ustc)).
* StorageKafka2 で以前にコミットされたオフセットに依存しないように、消費済みメッセージを手動でカウントするようにしました。 [#81662](https://github.com/ClickHouse/ClickHouse/pull/81662) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `clickhouse-keeper-utils` を追加しました。ClickHouse Keeper のデータを管理および分析するための新しいコマンドラインツールです。このツールでは、スナップショットやチェンジログからの状態のダンプ、チェンジログファイルの分析、特定のログ範囲の抽出が可能です。 [#81677](https://github.com/ClickHouse/ClickHouse/pull/81677) ([Antonio Andelic](https://github.com/antonio2368))。
* 合計およびユーザーごとのネットワークスロットルは決してリセットされないようになり、`max_network_bandwidth_for_all_users` と `max_network_bandwidth_for_all_users` の制限値を超過しないことが保証されます。 [#81729](https://github.com/ClickHouse/ClickHouse/pull/81729) ([Sergei Trifonov](https://github.com/serxa))。
* GeoParquet 形式での出力をサポートしました。 [#81784](https://github.com/ClickHouse/ClickHouse/pull/81784) ([Konstantin Vedernikov](https://github.com/scanhex12)).
* 未完了のデータミューテーションの影響を現在受けているカラムを `RENAME COLUMN` でリネームしようとする `ALTER` ミューテーションは開始されないようになりました。 [#81823](https://github.com/ClickHouse/ClickHouse/pull/81823) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Connection` ヘッダーは、接続を維持すべきかが判明した時点で、ほかのヘッダー送信の最後に送信されるようになりました。 [#81951](https://github.com/ClickHouse/ClickHouse/pull/81951) ([Sema Checherinda](https://github.com/CheSema)).
* `listen_backlog`（デフォルト値 4096）に基づいて、TCP サーバーのキュー（デフォルト値 64）を調整しました。 [#82045](https://github.com/ClickHouse/ClickHouse/pull/82045) ([Azat Khuzhin](https://github.com/azat)).
* サーバーを再起動することなく `max_local_read_bandwidth_for_server` と `max_local_write_bandwidth_for_server` を動的にリロードできるようにしました。 [#82083](https://github.com/ClickHouse/ClickHouse/pull/82083) ([Kai Zhu](https://github.com/nauu)).
* `TRUNCATE TABLE system.warnings` を使用して `system.warnings` テーブルからすべての警告を削除できるようにするサポートを追加しました。 [#82087](https://github.com/ClickHouse/ClickHouse/pull/82087) ([Vladimir Cherkasov](https://github.com/vdimir))。
* データレイククラスタ関数のパーティションプルーニングを修正。 [#82131](https://github.com/ClickHouse/ClickHouse/pull/82131) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DeltaLakeCluster テーブル関数でパーティション分割されたデータを読み取る処理を修正しました。この PR ではクラスター関数のプロトコルバージョンを引き上げ、イニシエーターからレプリカへ追加情報を送信できるようにしています。この追加情報には、パーティション列を解析するために必要な delta-kernel の変換式（および将来的には生成列などの他の情報）が含まれます。 [#82132](https://github.com/ClickHouse/ClickHouse/pull/82132) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `reinterpret` 関数は、固定サイズのデータ型 `T` を要素とする `Array(T)` への変換をサポートするようになりました（issue [#82621](https://github.com/ClickHouse/ClickHouse/issues/82621)）。[#83399](https://github.com/ClickHouse/ClickHouse/pull/83399)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* Database Datalake が、よりわかりやすい例外をスローするようになりました。 [#81211](https://github.com/ClickHouse/ClickHouse/issues/81211) を修正しました。 [#82304](https://github.com/ClickHouse/ClickHouse/pull/82304) ([alesapin](https://github.com/alesapin))。
* `HashJoin::needUsedFlagsForPerRightTableRow` が false を返すようにして、CROSS JOIN を改善しました。 [#82379](https://github.com/ClickHouse/ClickHouse/pull/82379) ([lgbo](https://github.com/lgbo-ustc)).
* Map型カラムを Array of Tuples として読み書きできるようにしました。 [#82408](https://github.com/ClickHouse/ClickHouse/pull/82408) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.licenses` で [Rust](https://clickhouse.com/blog/rust) クレートのライセンスを一覧表示できるようにしました。 [#82440](https://github.com/ClickHouse/ClickHouse/pull/82440) ([Raúl Marín](https://github.com/Algunenano))。
* `{uuid}` のようなマクロが、S3Queue テーブルエンジンの `keeper_path` 設定で使用できるようになりました。 [#82463](https://github.com/ClickHouse/ClickHouse/pull/82463) ([Nikolay Degterinsky](https://github.com/evillique)).
* Keeper の改良: changelog ファイルのディスク間での移動をバックグラウンドスレッドで行うようにしました。以前は、changelog を別のディスクに移動する際、移動が完了するまで Keeper 全体がブロックされていました。その結果、移動処理に長時間を要する場合（例: S3 ディスクへの移動）にはパフォーマンスが低下していました。[#82485](https://github.com/ClickHouse/ClickHouse/pull/82485) ([Antonio Andelic](https://github.com/antonio2368))。
* Keeper の改良: 新しい設定 `keeper_server.cleanup_old_and_ignore_new_acl` を追加しました。有効化すると、すべてのノードで既存の ACL が消去され、新規リクエストに対する ACL は無視されます。ノードから ACL を完全に削除することが目的の場合は、新しいスナップショットが作成されるまでこの設定を有効のままにしておくことが重要です。 [#82496](https://github.com/ClickHouse/ClickHouse/pull/82496) ([Antonio Andelic](https://github.com/antonio2368)).
* S3Queue テーブルエンジンを使用するテーブルでのストリーミングを無効化する新しいサーバー設定 `s3queue_disable_streaming` を追加しました。この設定はサーバーの再起動なしに変更できます。 [#82515](https://github.com/ClickHouse/ClickHouse/pull/82515) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ファイルシステムキャッシュの動的リサイズ機能をリファクタリングし、デバッグや調査に役立つログをさらに追加しました。 [#82556](https://github.com/ClickHouse/ClickHouse/pull/82556) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定ファイルがない `clickhouse-server` も、デフォルト設定と同様に PostgreSQL ポート 9005 をリッスンします。 [#82633](https://github.com/ClickHouse/ClickHouse/pull/82633) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `ReplicatedMergeTree::executeMetadataAlter` では、StorageID を取得し、DDLGuard を取得せずに `IDatabase::alterTable` を呼び出そうとします。その間に対象のテーブルを別のテーブルと入れ替えられてしまう可能性があるため、定義を取得する際に誤ったものを取得してしまうおそれがあります。これを防ぐために、`IDatabase::alterTable` を呼び出そうとするときに UUID が一致するかどうかを別途チェックするようにしました。 [#82666](https://github.com/ClickHouse/ClickHouse/pull/82666) ([Nikolay Degterinsky](https://github.com/evillique))。
* 読み取り専用のリモートディスクでデータベースをアタッチする際には、テーブルの UUID を手動で DatabaseCatalog に追加する必要があります。 [#82670](https://github.com/ClickHouse/ClickHouse/pull/82670) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `NumericIndexedVector` で `nan` および `inf` をユーザーが使用できないようにしました。[#82239](https://github.com/ClickHouse/ClickHouse/issues/82239) と、その他いくつかの問題を修正しました。[#82681](https://github.com/ClickHouse/ClickHouse/pull/82681)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `X-ClickHouse-Progress` ヘッダーおよび `X-ClickHouse-Summary` ヘッダーのフォーマットで、ゼロ値を省略しないようにしました。 [#82727](https://github.com/ClickHouse/ClickHouse/pull/82727) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* Keeper の改良: world:anyone ACL に対する特定権限のサポートを追加。 [#82755](https://github.com/ClickHouse/ClickHouse/pull/82755) ([Antonio Andelic](https://github.com/antonio2368)).
* SummingMergeTree で合計対象として明示的に指定された列を含む `RENAME COLUMN` や `DROP COLUMN` を許可しないようにしました。[#81836](https://github.com/ClickHouse/ClickHouse/issues/81836) をクローズします。 [#82821](https://github.com/ClickHouse/ClickHouse/pull/82821) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `Decimal` から `Float32` への変換の精度を向上。`Decimal` から `BFloat16` への変換を実装。[#82660](https://github.com/ClickHouse/ClickHouse/issues/82660) をクローズ。[#82823](https://github.com/ClickHouse/ClickHouse/pull/82823)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI のスクロールバーの見た目がわずかに改善されました。 [#82869](https://github.com/ClickHouse/ClickHouse/pull/82869) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 埋め込み設定付きの `clickhouse-server` は、HTTP OPTIONS 応答を返すことで Web UI を利用可能にします。 [#82870](https://github.com/ClickHouse/ClickHouse/pull/82870) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 設定ファイル内のパスに対して追加の Keeper ACL を指定できるようにしました。特定のパスに追加の ACL を付与したい場合は、設定ファイルの `zookeeper.path_acls` 配下で定義してください。 [#82898](https://github.com/ClickHouse/ClickHouse/pull/82898) ([Antonio Andelic](https://github.com/antonio2368)).
* 今後は、mutation スナップショットが可視部分のスナップショットから構築されるようになります。また、スナップショットで使用される mutation カウンタも、含まれている mutation に基づいて再計算されます。 [#82945](https://github.com/ClickHouse/ClickHouse/pull/82945) ([Mikhail Artemenko](https://github.com/Michicosun)).
* ソフトメモリ制限により Keeper が書き込みを拒否した際に ProfileEvent を追加。 [#82963](https://github.com/ClickHouse/ClickHouse/pull/82963) ([Xander Garbett](https://github.com/Garbett1)).
* `system.s3queue_log` に `commit_time`、`commit_id` の列を追加しました。 [#83016](https://github.com/ClickHouse/ClickHouse/pull/83016) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 場合によっては、メトリクスに複数のディメンションが必要になることがあります。たとえば、単一のカウンタを持つのではなく、エラーコードごとに失敗したマージやミューテーションの回数をカウントしたい場合です。この目的のために、まさにそれを実現する `system.dimensional_metrics` を導入し、最初の次元付きメトリクスとして `failed_merges` を追加しました。 [#83030](https://github.com/ClickHouse/ClickHouse/pull/83030) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* clickhouse client における不明な設定項目に関する警告を集約し、要約としてログに記録するようにしました。 [#83042](https://github.com/ClickHouse/ClickHouse/pull/83042) ([Bharat Nallan](https://github.com/bharatnc)).
* ClickHouse クライアントが接続エラー発生時にローカルポートを報告するようになりました。 [#83050](https://github.com/ClickHouse/ClickHouse/pull/83050) ([Jianfei Hu](https://github.com/incfly)).
* `AsynchronousMetrics` におけるエラー処理を若干改善しました。`/sys/block` ディレクトリが存在するもののアクセスできない場合、サーバーはブロックデバイスの監視を行わずに起動します。[#79229](https://github.com/ClickHouse/ClickHouse/issues/79229) をクローズ。[#83115](https://github.com/ClickHouse/ClickHouse/pull/83115)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* SystemLogs を通常テーブルの後（従来の「通常テーブルの前」ではなく、system テーブルの前）にシャットダウンするように変更。 [#83134](https://github.com/ClickHouse/ClickHouse/pull/83134) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `S3Queue` のシャットダウン処理に関するログを追加しました。 [#83163](https://github.com/ClickHouse/ClickHouse/pull/83163) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `Time` と `Time64` を `MM:SS`、`M:SS`、`SS`、`S` の形式でパースできるようになりました。 [#83299](https://github.com/ClickHouse/ClickHouse/pull/83299) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `distributed_ddl_output_mode='*_only_active'` の場合、`max_replication_lag_to_enqueue` を超えるレプリケーションラグを持つ新規または復旧済みレプリカを待機しないようにしました。これにより、新しいレプリカが初期化やリカバリを完了してアクティブになったものの、初期化中に大量のレプリケーションログを蓄積していた場合に発生しうる `DDL task is not finished on some hosts` エラーを回避しやすくなります。あわせて、レプリケーションログが `max_replication_lag_to_enqueue` 未満になるまで待機する `SYSTEM SYNC DATABASE REPLICA STRICT` クエリを実装しました。 [#83302](https://github.com/ClickHouse/ClickHouse/pull/83302) ([Alexander Tokmakov](https://github.com/tavplubix))。
* 例外メッセージに含める式アクションの説明を、過度に長く出力しないようにしました。Closes [#83164](https://github.com/ClickHouse/ClickHouse/issues/83164). [#83350](https://github.com/ClickHouse/ClickHouse/pull/83350) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* パーツのプレフィックスおよびサフィックスを解析し、非定数カラムのカバレッジもチェックできるようにしました。 [#83377](https://github.com/ClickHouse/ClickHouse/pull/83377) ([Mikhail Artemenko](https://github.com/Michicosun)).
* 名前付きコレクション使用時の ODBC および JDBC のパラメータ名を統一しました。 [#83410](https://github.com/ClickHouse/ClickHouse/pull/83410) ([Andrey Zvonov](https://github.com/zvonand)).
* ストレージのシャットダウン中は、`getStatus` は `ErrorCodes::ABORTED` 例外をスローします。以前は、これにより SELECT クエリが失敗していました。現在では、`ErrorCodes::ABORTED` 例外を捕捉し、意図的に無視するようにしています。 [#83435](https://github.com/ClickHouse/ClickHouse/pull/83435) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `MergeParts` エントリ向けの part&#95;log プロファイルイベントに、`UserTimeMicroseconds`、`SystemTimeMicroseconds`、`RealTimeMicroseconds` などのプロセスリソースのメトリクスを追加しました。[#83460](https://github.com/ClickHouse/ClickHouse/pull/83460)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* `create_if_not_exists`、`check_not_exists`、`remove_recursive` のフィーチャーフラグを Keeper でデフォルトで有効化し、新しい種類のリクエストを可能にします。 [#83488](https://github.com/ClickHouse/ClickHouse/pull/83488) ([Antonio Andelic](https://github.com/antonio2368))。
* サーバー停止時には、テーブルをシャットダウンする前に S3(Azure など)Queue のストリーミングを停止するようにしました。 [#83530](https://github.com/ClickHouse/ClickHouse/pull/83530) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `JSON` 入力フォーマットで `Date` / `Date32` を整数として使用可能にしました。 [#83597](https://github.com/ClickHouse/ClickHouse/pull/83597) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 特定の状況において、プロジェクションの読み込みおよび追加時の例外メッセージを、より読みやすくしました。 [#83728](https://github.com/ClickHouse/ClickHouse/pull/83728) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-server` のバイナリに対するチェックサムによる整合性検査をスキップできる設定オプションを導入しました。 [#83637](https://github.com/ClickHouse/ClickHouse/issues/83637) を解決しました。 [#83749](https://github.com/ClickHouse/ClickHouse/pull/83749)（[Rafael Roquetto](https://github.com/rafaelroquetto)）。

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* `clickhouse-benchmark` の `--reconnect` オプションに対して誤って設定されていたデフォルト値を修正しました。このデフォルト値は [#79465](https://github.com/ClickHouse/ClickHouse/issues/79465) で誤って変更されていました。[#82677](https://github.com/ClickHouse/ClickHouse/pull/82677)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CREATE DICTIONARY` のフォーマットの不整合を修正しました。[#82105](https://github.com/ClickHouse/ClickHouse/issues/82105) をクローズしました。 [#82829](https://github.com/ClickHouse/ClickHouse/pull/82829)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `materialize` 関数を含む TTL のフォーマットの不整合を修正。[#82828](https://github.com/ClickHouse/ClickHouse/issues/82828) をクローズ。[#82831](https://github.com/ClickHouse/ClickHouse/pull/82831)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* INTO OUTFILE などの出力オプションを含むサブクエリに対する `EXPLAIN AST` のフォーマットが一貫していなかった問題を修正しました。[#82826](https://github.com/ClickHouse/ClickHouse/issues/82826) をクローズします。[#82840](https://github.com/ClickHouse/ClickHouse/pull/82840)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* エイリアスが許可されていないコンテキストにおける、エイリアス付き括弧表現のフォーマットの不整合を修正しました。Closes [#82836](https://github.com/ClickHouse/ClickHouse/issues/82836)。Closes [#82837](https://github.com/ClickHouse/ClickHouse/issues/82837)。[#82867](https://github.com/ClickHouse/ClickHouse/pull/82867) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* IPv4 と集約関数の状態を乗算しようとした際に、適切なエラーコードを返すようにしました。 [#82817](https://github.com/ClickHouse/ClickHouse/issues/82817) をクローズ。 [#82818](https://github.com/ClickHouse/ClickHouse/pull/82818)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ファイルシステムキャッシュ内の論理エラー「Having zero bytes but range is not finished」を修正しました。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).
* TTL によって行が削除された際に、それに依存する `minmax_count_projection` などのアルゴリズムの正しさを保証するため、min-max インデックスを再計算します。これにより [#77091](https://github.com/ClickHouse/ClickHouse/issues/77091) が解決されます。[#77166](https://github.com/ClickHouse/ClickHouse/pull/77166)（[Amos Bird](https://github.com/amosbird)）。
* `ORDER BY ... LIMIT BY ... LIMIT N` を組み合わせたクエリにおいて、ORDER BY が PartialSorting として実行される場合、カウンタ `rows_before_limit_at_least` は、これまでのソート変換で消費された行数ではなく、LIMIT 句で消費された行数を表すようになりました。 [#78999](https://github.com/ClickHouse/ClickHouse/pull/78999) ([Eduard Karacharov](https://github.com/korowa))。
* 先頭の代替パターンがリテラルでないオルタネーションを含む `regexp` を用いて token/ngram インデックスに対してフィルタリングを行う場合に、グラニュールを過剰にスキップしてしまう問題を修正しました。 [#79373](https://github.com/ClickHouse/ClickHouse/pull/79373) ([Eduard Karacharov](https://github.com/korowa)).
* `<=>` 演算子と Join ストレージの論理エラーを修正し、クエリが適切なエラーコードを返すようにしました。 [#80165](https://github.com/ClickHouse/ClickHouse/pull/80165) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `remote` 関数ファミリーと併用した場合に `loop` 関数でクラッシュが発生する問題を修正しました。`loop(remote(...))` で LIMIT 句が順守されるようにしました。 [#80299](https://github.com/ClickHouse/ClickHouse/pull/80299) ([Julia Kartseva](https://github.com/jkartseva)).
* Unix epoch（1970-01-01）以前および最大日時（2106-02-07 06:28:15）以降の日付を扱う際の `to_utc_timestamp` および `from_utc_timestamp` 関数の誤った動作を修正しました。これらの関数は、値をそれぞれ Unix エポックの開始時刻および最大日時に正しくクランプするようになりました。 [#80498](https://github.com/ClickHouse/ClickHouse/pull/80498) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* 一部のクエリでは、並列レプリカで実行した際に、読み取り順序の最適化がイニシエーター側では適用される一方で、リモートノード側では適用できない場合がありました。その結果、並列レプリカのコーディネーター（イニシエーター上）とリモートノードで異なる読み取りモードが使用され、論理的なエラーが発生していました。 [#80652](https://github.com/ClickHouse/ClickHouse/pull/80652) ([Igor Nikonov](https://github.com/devcrafter)).
* カラム型が Nullable 型に変更された場合に、materialize projection の実行中に発生する論理エラーを修正。 [#80741](https://github.com/ClickHouse/ClickHouse/pull/80741) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL を更新する際に TTL GROUP BY で TTL が誤って再計算される不具合を修正。 [#81222](https://github.com/ClickHouse/ClickHouse/pull/81222) ([Evgeniy Ulasik](https://github.com/H0uston)).
* Parquet のブルームフィルターが、`WHERE function(key) IN (...)` のような条件を `WHERE key IN (...)` であるかのように誤って適用していた問題を修正しました。 [#81255](https://github.com/ClickHouse/ClickHouse/pull/81255) ([Michael Kolupaev](https://github.com/al13n321)).
* マージ処理中の例外発生時に `Aggregator` がクラッシュする可能性のあった不具合を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat)).
* `InterpreterInsertQuery::extendQueryLogElemImpl` を修正し、必要に応じて（たとえば名前に `-` のような特殊文字が含まれている場合）データベース名およびテーブル名をバッククォートで囲むようにしました。 [#81528](https://github.com/ClickHouse/ClickHouse/pull/81528) ([Ilia Shvyrialkin](https://github.com/Harzu)).
* 左側の引数が null で、サブクエリ結果が non-nullable の場合における、`transform_null_in=1` 設定時の `IN` 実行を修正。 [#81584](https://github.com/ClickHouse/ClickHouse/pull/81584) ([Pavel Kruglov](https://github.com/Avogar))。
* 既存テーブルから読み取る際の default/materialize 式の実行時に、実験的な型や疑わしい型を検証しないようにしました。 [#81618](https://github.com/ClickHouse/ClickHouse/pull/81618) ([Pavel Kruglov](https://github.com/Avogar)).
* TTL 式で dict が使用されている場合に、マージ中に発生する &quot;Context has expired&quot; エラーを修正。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* cast 関数の単調性を修正。 [#81722](https://github.com/ClickHouse/ClickHouse/pull/81722) ([zoomxi](https://github.com/zoomxi))。
* スカラー相関サブクエリの処理中に必要な列が読み込まれない問題を修正しました。 [#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を解決します。 [#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 以前のバージョンでは、`/js` へのリクエストに対してサーバーが不要に多くのコンテンツを返していました。この変更により [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) が解決されました。[#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前は、`MongoDB` テーブルエンジンの定義で `host:port` 引数にパスコンポーネントを含めることができましたが、これは暗黙的に無視されていました。`MongoDB` 連携機能は、そのようなテーブルのロードを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を取る場合には、そのようなテーブルもロード可能とし、引数で指定されたデータベース名を用いつつパスコンポーネントを無視します*。*注:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を使ったクエリ、ならびにディクショナリのソースおよび named collection には適用されません。[#81942](https://github.com/ClickHouse/ClickHouse/pull/81942)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* マージ中に例外が発生した場合に `Aggregator` がクラッシュする可能性のあった問題を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat)).
* クエリで定数のエイリアス列のみが使用されている場合のフィルタ解析を修正します。[#79448](https://github.com/ClickHouse/ClickHouse/issues/79448) を解決。[#82037](https://github.com/ClickHouse/ClickHouse/pull/82037) ([Dmitry Novik](https://github.com/novikd))。
* GROUP BY および SET の TTL で同じカラムを使用した場合に発生する LOGICAL&#95;ERROR とそれに続くクラッシュを修正しました。 [#82054](https://github.com/ClickHouse/ClickHouse/pull/82054) ([Pablo Marcos](https://github.com/pamarcos)).
* シークレットマスキング処理における S3 テーブル関数の引数検証を修正し、発生しうる `LOGICAL_ERROR` を防止しました。[#80620](https://github.com/ClickHouse/ClickHouse/issues/80620) をクローズしました。[#82056](https://github.com/ClickHouse/ClickHouse/pull/82056)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* Iceberg におけるデータレースを修正しました。 [#82088](https://github.com/ClickHouse/ClickHouse/pull/82088) ([Azat Khuzhin](https://github.com/azat)).
* `DatabaseReplicated::getClusterImpl` を修正しました。`hosts` の先頭の要素（または先頭の複数要素）が `id == DROPPED_MARK` であり、かつ同じシャードに属する他の要素が存在しない場合、`shards` の先頭要素が空のベクタとなり、`std::out_of_range` が発生していました。 [#82093](https://github.com/ClickHouse/ClickHouse/pull/82093)（[Miсhael Stetsyuk](https://github.com/mstetsyuk)）。
* `arraySimilarity` におけるコピーペーストの誤りを修正し、`UInt32` および `Int32` を重みとして使用できないようにしました。あわせてテストとドキュメントを更新しました。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* `WHERE` 句と `IndexSet` の条件下で `arrayJoin` を含むクエリで発生する `Not found column` エラーを修正。 [#82113](https://github.com/ClickHouse/ClickHouse/pull/82113) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* Glue Catalog 連携のバグを修正しました。これにより、一部のサブカラムに decimal 型を含むネストしたデータ型を持つテーブルを ClickHouse で読み取れるようになりました。例: `map<string, decimal(9, 2)>`。[#81301](https://github.com/ClickHouse/ClickHouse/issues/81301) を修正。[#82114](https://github.com/ClickHouse/ClickHouse/pull/82114)（[alesapin](https://github.com/alesapin)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79051](https://github.com/ClickHouse/ClickHouse/pull/79051) で 25.5 に導入された SummingMergeTree におけるパフォーマンス低下を修正しました。 [#82130](https://github.com/ClickHouse/ClickHouse/pull/82130) ([Pavel Kruglov](https://github.com/Avogar)).
* URI 経由で設定を渡す場合、最後の値が優先されます。 [#82137](https://github.com/ClickHouse/ClickHouse/pull/82137) ([Sema Checherinda](https://github.com/CheSema)).
* Iceberg における「Context has expired」エラーを修正しました。[#82146](https://github.com/ClickHouse/ClickHouse/pull/82146) ([Azat Khuzhin](https://github.com/azat)).
* サーバーがメモリ逼迫時のリモートクエリで発生しうるデッドロックを修正しました。 [#82160](https://github.com/ClickHouse/ClickHouse/pull/82160) ([Kirill](https://github.com/kirillgarbar)).
* 大きな数値に対して適用した際に発生していた `numericIndexedVectorPointwiseAdd`、`numericIndexedVectorPointwiseSubtract`、`numericIndexedVectorPointwiseMultiply`、`numericIndexedVectorPointwiseDivide` 関数のオーバーフローを修正しました。 [#82165](https://github.com/ClickHouse/ClickHouse/pull/82165) ([Raufs Dunamalijevs](https://github.com/rienath))。
* テーブルの依存関係が原因でマテリアライズドビューが INSERT クエリを取り漏らす不具合を修正。 [#82222](https://github.com/ClickHouse/ClickHouse/pull/82222) ([Nikolay Degterinsky](https://github.com/evillique)).
* サジェスションスレッドとメインのクライアントスレッド間で発生する可能性のあるデータ競合を修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).
* これにより、ClickHouse はスキーマ進化後でも Glue カタログから Iceberg テーブルを読み取れるようになりました。[#81272](https://github.com/ClickHouse/ClickHouse/issues/81272) を修正しました。[#82301](https://github.com/ClickHouse/ClickHouse/pull/82301)（[alesapin](https://github.com/alesapin)）。
* 非同期メトリクス設定 `asynchronous_metrics_update_period_s` および `asynchronous_heavy_metrics_update_period_s` の検証を修正しました。 [#82310](https://github.com/ClickHouse/ClickHouse/pull/82310) ([Bharat Nallan](https://github.com/bharatnc))。
* 複数の JOIN を含むクエリにおけるマッチャー解決時の論理エラーを修正し、[#81969](https://github.com/ClickHouse/ClickHouse/issues/81969) をクローズしました。 [#82421](https://github.com/ClickHouse/ClickHouse/pull/82421) ([Vladimir Cherkasov](https://github.com/vdimir))。
* AWS ECS トークンに有効期限を追加し、再読み込み可能にしました。 [#82422](https://github.com/ClickHouse/ClickHouse/pull/82422) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `CASE` 関数での `NULL` 引数に関するバグを修正しました。[#82436](https://github.com/ClickHouse/ClickHouse/pull/82436)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* クライアントのデータレースを（グローバルコンテキストを使用しないようにすることで）修正し、`session_timezone` のオーバーライド動作を修正しました（以前は、`session_timezone` がたとえば `users.xml` やクライアントオプションで空でない値に設定され、クエリコンテキストでは空に設定されていた場合、本来は誤りであるにもかかわらず `users.xml` の値が使用されていました。現在は、クエリコンテキストが常にグローバルコンテキストより優先されます）。 [#82444](https://github.com/ClickHouse/ClickHouse/pull/82444) ([Azat Khuzhin](https://github.com/azat)).
* 外部テーブルエンジンにおけるキャッシュ済みバッファの境界アライメントを無効化する処理を修正しました。この処理は [https://github.com/ClickHouse/ClickHouse/pull/81868](https://github.com/ClickHouse/ClickHouse/pull/81868) で壊れていました。 [#82493](https://github.com/ClickHouse/ClickHouse/pull/82493) ([Kseniia Sumarokova](https://github.com/kssenii)).
* キーバリューストレージが型キャストされたキーで `JOIN` された場合に発生するクラッシュを修正。 [#82497](https://github.com/ClickHouse/ClickHouse/pull/82497) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* ログおよび `query_log` 内で named collection の値を非表示にする処理を修正しました。[#82405](https://github.com/ClickHouse/ClickHouse/issues/82405) をクローズしました。[#82510](https://github.com/ClickHouse/ClickHouse/pull/82510)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* セッション終了時に `user_id` が空になる場合があり、その際にログ出力時にクラッシュが発生する可能性がある問題を修正しました。 [#82513](https://github.com/ClickHouse/ClickHouse/pull/82513) ([Bharat Nallan](https://github.com/bharatnc)).
* Time のパース処理で msan の問題が発生し得るケースを修正します。この修正は次の問題を解決します: [#82477](https://github.com/ClickHouse/ClickHouse/issues/82477)。[#82514](https://github.com/ClickHouse/ClickHouse/pull/82514)（[Yarik Briukhovetskyi](https://github.com/yariks5s)）。
* `threadpool_writer_pool_size` を 0 に設定できないようにし、サーバーの処理が行き詰まらないようにしました。 [#82532](https://github.com/ClickHouse/ClickHouse/pull/82532) ([Bharat Nallan](https://github.com/bharatnc))。
* 相関付けられた列に対する行ポリシー式の解析中に発生する `LOGICAL_ERROR` を修正。 [#82618](https://github.com/ClickHouse/ClickHouse/pull/82618) ([Dmitry Novik](https://github.com/novikd)).
* `enable_shared_storage_snapshot_in_query = 1` のときに `mergeTreeProjection` テーブル関数で親メタデータが誤って使用される問題を修正しました。これは [#82634](https://github.com/ClickHouse/ClickHouse/issues/82634) に対応するものです。[#82638](https://github.com/ClickHouse/ClickHouse/pull/82638)（[Amos Bird](https://github.com/amosbird)）。
* 関数 `trim{Left,Right,Both}` が、型「FixedString(N)」の入力文字列をサポートするようになりました。たとえば、`SELECT trimBoth(toFixedString('abc', 3), 'ac')` を実行できるようになりました。 [#82691](https://github.com/ClickHouse/ClickHouse/pull/82691) ([Robert Schulze](https://github.com/rschu1ze)).
* AzureBlobStorage において、ネイティブコピーを行う際に認証方法を比較し、その際に例外が発生した場合は、読み取りとコピー（つまり非ネイティブコピー）にフォールバックするようにコードを更新しました。 [#82693](https://github.com/ClickHouse/ClickHouse/pull/82693) ([Smita Kulkarni](https://github.com/SmitaRKulkarni)).
* 空要素が存在する場合の `groupArraySample` / `groupArrayLast` のデシリアライズを修正しました（入力が空の場合にデシリアライズ処理がバイナリの一部をスキップしてしまう可能性があり、これによりデータ読み取り時の破損や TCP プロトコルにおける UNKNOWN&#95;PACKET&#95;FROM&#95;SERVER を引き起こす可能性がありました）。数値型および日付時刻型には影響しません。[#82763](https://github.com/ClickHouse/ClickHouse/pull/82763)（[Pedro Ferreira](https://github.com/PedroTadim)）。
* 空の `Memory` テーブルのバックアップ処理を修正し、バックアップの復元時に `BACKUP_ENTRY_NOT_FOUND` エラーで失敗する問題を解消しました。 [#82791](https://github.com/ClickHouse/ClickHouse/pull/82791) ([Julia Kartseva](https://github.com/jkartseva)).
* union/intersect/except&#95;default&#95;mode の書き換え処理における例外安全性を修正。[#82664](https://github.com/ClickHouse/ClickHouse/issues/82664) をクローズ。[#82820](https://github.com/ClickHouse/ClickHouse/pull/82820)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 非同期テーブルの読み込みジョブの数を追跡するようにしました。実行中のジョブがある場合は、`TransactionLog::removeOldEntries` 内で `tail_ptr` を更新しないようにしました。 [#82824](https://github.com/ClickHouse/ClickHouse/pull/82824) ([Tuan Pham Anh](https://github.com/tuanpach)).
* Iceberg で発生していたデータレースを修正。[#82841](https://github.com/ClickHouse/ClickHouse/pull/82841) ([Azat Khuzhin](https://github.com/azat)).
* 25.6 で導入された `use_skip_indexes_if_final_exact_mode` 最適化を有効化した場合、`MergeTree` エンジンの設定やデータ分布によっては、適切な候補範囲を選択できないことがありました。この問題は解消されました。 [#82879](https://github.com/ClickHouse/ClickHouse/pull/82879) ([Shankar Iyer](https://github.com/shankar-iyer)).
* SCRAM&#95;SHA256&#95;PASSWORD 型の AST から認証データをパースする際に salt を設定するようにしました。 [#82888](https://github.com/ClickHouse/ClickHouse/pull/82888) ([Tuan Pham Anh](https://github.com/tuanpach)).
* キャッシュしない Database 実装を使用している場合、カラムが返されて参照が無効になった後に、対応するテーブルのメタデータが削除されます。 [#82939](https://github.com/ClickHouse/ClickHouse/pull/82939) ([buyval01](https://github.com/buyval01)).
* `Merge` ストレージのテーブルとの JOIN 式を含むクエリに対するフィルタの変更処理を修正。[#82092](https://github.com/ClickHouse/ClickHouse/issues/82092) を修正。[#82950](https://github.com/ClickHouse/ClickHouse/pull/82950)（[Dmitry Novik](https://github.com/novikd)）。
* QueryMetricLog における LOGICAL&#95;ERROR 「Mutex cannot be NULL」を修正。 [#82979](https://github.com/ClickHouse/ClickHouse/pull/82979) ([Pablo Marcos](https://github.com/pamarcos)).
* フォーマッタ `%f` を可変長フォーマッタ（例：`%M`）と併用した場合に、関数 `formatDateTime` で誤った出力が行われる不具合を修正しました。 [#83020](https://github.com/ClickHouse/ClickHouse/pull/83020) ([Robert Schulze](https://github.com/rschu1ze)).
* analyzer を有効にした状態で、セカンダリクエリが VIEW から常にすべてのカラムを読み取ってしまう場合に発生するパフォーマンス低下を修正しました。[#81718](https://github.com/ClickHouse/ClickHouse/issues/81718) を修正。[#83036](https://github.com/ClickHouse/ClickHouse/pull/83036)（[Dmitry Novik](https://github.com/novikd)）。
* 読み取り専用ディスク上でバックアップを復元する際に表示される誤解を招くエラーメッセージを修正。 [#83051](https://github.com/ClickHouse/ClickHouse/pull/83051) ([Julia Kartseva](https://github.com/jkartseva)).
* 依存関係を持たない `CREATE TABLE` では循環依存関係のチェックを行わないようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/65405](https://github.com/ClickHouse/ClickHouse/pull/65405) で導入された、数千個のテーブルを作成するようなユースケースでのパフォーマンス低下が解消されます。[#83077](https://github.com/ClickHouse/ClickHouse/pull/83077)（[Pavel Kruglov](https://github.com/Avogar)）。
* 負の Time 値がテーブルに暗黙的に読み込まれていた問題を修正し、ドキュメントの記述も分かりやすくしました。 [#83091](https://github.com/ClickHouse/ClickHouse/pull/83091) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `lowCardinalityKeys` 関数が共有ディクショナリの無関係な部分を使用しないようにしました。 [#83118](https://github.com/ClickHouse/ClickHouse/pull/83118) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* マテリアライズドビューのサブカラム利用時に発生していたリグレッションを修正しました。これにより、次の問題が解消されました: [#82784](https://github.com/ClickHouse/ClickHouse/issues/82784)。[#83221](https://github.com/ClickHouse/ClickHouse/pull/83221) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* 不正な INSERT 実行後に接続が切断された状態のまま残ることでクライアントがクラッシュする問題を修正しました。 [#83253](https://github.com/ClickHouse/ClickHouse/pull/83253) ([Azat Khuzhin](https://github.com/azat)).
* 空のカラムを持つブロックのサイズを計算する際に発生していたクラッシュを修正しました。 [#83271](https://github.com/ClickHouse/ClickHouse/pull/83271) ([Raúl Marín](https://github.com/Algunenano)).
* UNION 内の Variant 型で発生し得るクラッシュを修正。[#83295](https://github.com/ClickHouse/ClickHouse/pull/83295) ([Pavel Kruglov](https://github.com/Avogar)).
* サポートされていない SYSTEM クエリに対して clickhouse-local で発生していた LOGICAL&#95;ERROR を修正。 [#83333](https://github.com/ClickHouse/ClickHouse/pull/83333) ([Surya Kant Ranjan](https://github.com/iit2009046)).
* S3 クライアント向けの `no_sign_request` 設定を修正しました。これは、S3 リクエストに署名しないことを明示的に指定するために使用できます。エンドポイント単位の設定を使用して、特定のエンドポイントに対して定義することもできます。 [#83379](https://github.com/ClickHouse/ClickHouse/pull/83379) ([Antonio Andelic](https://github.com/antonio2368)).
* CPU スケジューリングが有効な状態で負荷がかかっているときに、設定 &#39;max&#95;threads=1&#39; を指定したクエリを実行すると発生する可能性があるクラッシュを修正します。 [#83387](https://github.com/ClickHouse/ClickHouse/pull/83387) ([Fan Ziqi](https://github.com/f2quantum)).
* CTE 定義が同名の別のテーブル式を参照している場合に発生する `TOO_DEEP_SUBQUERIES` 例外の問題を修正。 [#83413](https://github.com/ClickHouse/ClickHouse/pull/83413) ([Dmitry Novik](https://github.com/novikd)).
* `REVOKE S3 ON system.*` を実行した際に、`*.*` に対する S3 権限まで取り消されてしまう誤動作を修正しました。これにより [#83417](https://github.com/ClickHouse/ClickHouse/issues/83417) が修正されました。[#83420](https://github.com/ClickHouse/ClickHouse/pull/83420)（[pufit](https://github.com/pufit)）。
* クエリ間で async&#95;read&#95;counters を共有しないようにしました。 [#83423](https://github.com/ClickHouse/ClickHouse/pull/83423) ([Azat Khuzhin](https://github.com/azat)).
* サブクエリに FINAL が含まれている場合は Parallel Replicas を無効化するようにしました。 [#83455](https://github.com/ClickHouse/ClickHouse/pull/83455) ([zoomxi](https://github.com/zoomxi)).
* 設定 `role_cache_expiration_time_seconds` の構成で発生していた軽微な整数オーバーフローを修正しました（issue [#83374](https://github.com/ClickHouse/ClickHouse/issues/83374)）。[#83461](https://github.com/ClickHouse/ClickHouse/pull/83461)（[wushap](https://github.com/wushap)）。
* [https://github.com/ClickHouse/ClickHouse/pull/79963](https://github.com/ClickHouse/ClickHouse/pull/79963) によって導入されたバグを修正します。definer 付きの MV に対して `INSERT` を行う場合、権限チェックでは definer に付与された権限を使用する必要があります。これにより [#79951](https://github.com/ClickHouse/ClickHouse/issues/79951) が解決されます。[#83502](https://github.com/ClickHouse/ClickHouse/pull/83502)（[pufit](https://github.com/pufit)）。
* iceberg の配列要素および iceberg の map の値と、そのすべてのネストしたサブフィールドに対する境界値ベースのファイルプルーニングを無効化しました。 [#83520](https://github.com/ClickHouse/ClickHouse/pull/83520) ([Daniil Ivanik](https://github.com/divanik)).
* 一時データストレージとして使用する際に発生する可能性のある file cache の未初期化エラーを修正。 [#83539](https://github.com/ClickHouse/ClickHouse/pull/83539) ([Bharat Nallan](https://github.com/bharatnc)).
* Keeper の修正: セッション終了時にエフェメラルノードが削除された際に、ウォッチの総数が正しく更新されるようにしました。 [#83583](https://github.com/ClickHouse/ClickHouse/pull/83583) ([Antonio Andelic](https://github.com/antonio2368)).
* max&#95;untracked&#95;memory 周辺の誤ったメモリ管理を修正。 [#83607](https://github.com/ClickHouse/ClickHouse/pull/83607) ([Azat Khuzhin](https://github.com/azat)).
* ある一部のケースにおいて、`INSERT SELECT` と `UNION ALL` の組み合わせによりヌルポインタ逆参照が発生する可能性がありました。この変更により [#83618](https://github.com/ClickHouse/ClickHouse/issues/83618) が解決されました。[#83643](https://github.com/ClickHouse/ClickHouse/pull/83643)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `max_insert_block_size` にゼロ値を指定できないようにしました。ゼロ値を指定すると論理エラーを引き起こす可能性があるためです。 [#83688](https://github.com/ClickHouse/ClickHouse/pull/83688) ([Bharat Nallan](https://github.com/bharatnc)).
* estimateCompressionRatio() において block&#95;size&#95;bytes=0 の場合に発生する無限ループを修正。 [#83704](https://github.com/ClickHouse/ClickHouse/pull/83704) ([Azat Khuzhin](https://github.com/azat)).
* `IndexUncompressedCacheBytes`/`IndexUncompressedCacheCells`/`IndexMarkCacheBytes`/`IndexMarkCacheFiles` メトリクスを修正しました（以前は `Cache` プレフィックスの付かないメトリクスに含められていました）。[#83730](https://github.com/ClickHouse/ClickHouse/pull/83730)（[Azat Khuzhin](https://github.com/azat)）。
* `BackgroundSchedulePool` のシャットダウン中に、タスク側からスレッドを join することが原因となり得たアボートと、（ユニットテストで発生していた）ハングの可能性を修正しました。 [#83769](https://github.com/ClickHouse/ClickHouse/pull/83769) ([Azat Khuzhin](https://github.com/azat)).
* 名前の競合が発生する場合に、新しい analyzer が WITH 句内で外側のエイリアスを参照できるようにする後方互換性設定を導入しました。 [#82700](https://github.com/ClickHouse/ClickHouse/issues/82700) を修正しました。 [#83797](https://github.com/ClickHouse/ClickHouse/pull/83797)（[Dmitry Novik](https://github.com/novikd)）。
* シャットダウン時にライブラリブリッジのクリーンアップ中の再帰的なコンテキストロックにより発生するデッドロックを修正。 [#83824](https://github.com/ClickHouse/ClickHouse/pull/83824) ([Azat Khuzhin](https://github.com/azat)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* ClickHouse の lexer 用に最小限の C ライブラリ（10 KB）をビルドしました。これは [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) に必要です。[#81347](https://github.com/ClickHouse/ClickHouse/pull/81347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。スタンドアロン lexer 用のテストを追加し、テストタグ `fasttest-only` を追加しました。[#82472](https://github.com/ClickHouse/ClickHouse/pull/82472)（[Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)）。
* Nix サブモジュールの input に対するチェックを追加しました。[#81691](https://github.com/ClickHouse/ClickHouse/pull/81691)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* localhost 上で統合テストを実行しようとした際に発生しうる問題を修正しました。[#82135](https://github.com/ClickHouse/ClickHouse/pull/82135)（[Oleg Doronin](https://github.com/dorooleg)）。
* Mac と FreeBSD で SymbolIndex をコンパイル可能にしました。（ただし、実際に動作するのは ELF システムである Linux および FreeBSD のみです。）[#82347](https://github.com/ClickHouse/ClickHouse/pull/82347)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Azure SDK を v1.15.0 に更新しました。[#82747](https://github.com/ClickHouse/ClickHouse/pull/82747)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* google-cloud-cpp の storage モジュールをビルドシステムに追加しました。[#82881](https://github.com/ClickHouse/ClickHouse/pull/82881)（[Pablo Marcos](https://github.com/pamarcos)）。
* Docker Official Library の要件を満たすように、clickhouse-server 用の `Dockerfile.ubuntu` を変更しました。[#83039](https://github.com/ClickHouse/ClickHouse/pull/83039)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `curl clickhouse.com` へのビルドのアップロードを修正するため、[#83158](https://github.com/ClickHouse/ClickHouse/issues/83158) のフォローアップを行いました。[#83463](https://github.com/ClickHouse/ClickHouse/pull/83463)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* `clickhouse/clickhouse-server` および公式 `clickhouse` イメージに `busybox` バイナリとインストール用ツールを追加しました。[#83735](https://github.com/ClickHouse/ClickHouse/pull/83735)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* ClickHouse サーバーのホストを指定するための `CLICKHOUSE_HOST` 環境変数のサポートを追加し、既存の `CLICKHOUSE_USER` および `CLICKHOUSE_PASSWORD` 環境変数と整合させました。これにより、クライアントや設定ファイルを直接変更することなく、より簡単に設定できるようになります。[#83659](https://github.com/ClickHouse/ClickHouse/pull/83659)（[Doron David](https://github.com/dorki)）。

### ClickHouse リリース 25.6、2025-06-26 {#256}

#### 下位互換性のない変更 {#backward-incompatible-change}

* これまでは、関数 `countMatches` はパターンが空文字列を許容していても、最初の空のマッチが発生した時点でカウントを停止していました。この問題を解消するため、`countMatches` は空のマッチが発生した場合に 1 文字分だけ進めて処理を継続するようになりました。従来の動作を維持したいユーザーは、設定 `count_matches_stop_at_empty_match` を有効にできます。 [#81676](https://github.com/ClickHouse/ClickHouse/pull/81676) ([Elmi Ahmadov](https://github.com/ahmadov)).
* 軽微: サーバー設定 `backup_threads` および `restore_threads` がゼロ以外の値になるように強制しました。 [#80224](https://github.com/ClickHouse/ClickHouse/pull/80224) ([Raúl Marín](https://github.com/Algunenano)).
* 軽微: `String` に対する `bitNot` が、内部メモリ表現としてゼロ終端された文字列を返すように修正しました。これはユーザーから見える動作には影響しないはずですが、著者はこの変更を明示しておきたいと考えています。 [#80791](https://github.com/ClickHouse/ClickHouse/pull/80791) ([Azat Khuzhin](https://github.com/azat)).

#### 新機能 {#new-feature}

* 新しいデータ型: `Time` ([H]HH:MM:SS) および `Time64` ([H]HH:MM:SS[.fractional])、ならびに他のデータ型と連携するためのいくつかの基本的なキャスト関数および各種関数を追加しました。既存の関数 `toTime` との互換性を保つための設定を追加しました。設定 `use_legacy_to_time` は、当面は従来の動作を維持する値に設定されています。 [#81217](https://github.com/ClickHouse/ClickHouse/pull/81217) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。Time/Time64 型同士の比較をサポートしました。 [#80327](https://github.com/ClickHouse/ClickHouse/pull/80327) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* 新しい CLI ツール [`chdig`](https://github.com/azat/chdig/) は、ClickHouse 用の TUI インターフェイス（top 風）で、ClickHouse の一部として提供されます。[#79666](https://github.com/ClickHouse/ClickHouse/pull/79666)（[Azat Khuzhin](https://github.com/azat)）。
* `Atomic` および `Ordinary` データベースエンジンで `disk` 設定に対応し、テーブルのメタデータファイルを保存するディスクを指定できるようにしました。 [#80546](https://github.com/ClickHouse/ClickHouse/pull/80546) ([Tuan Pham Anh](https://github.com/tuanpach))。これにより、外部ソース上のデータベースをアタッチできるようになります。
* 新しい種類の MergeTree、`CoalescingMergeTree` - このエンジンはバックグラウンドマージ時に最初の非 Null の値を採用します。これにより [#78869](https://github.com/ClickHouse/ClickHouse/issues/78869) が解決されました。[#79344](https://github.com/ClickHouse/ClickHouse/pull/79344)（[scanhex12](https://github.com/scanhex12)）。
* WKB（「Well-Known Binary」は、GIS アプリケーションで使用される、さまざまなジオメトリ型のバイナリ形式によるエンコード方式）を読み取る関数をサポートします。詳細は [#43941](https://github.com/ClickHouse/ClickHouse/issues/43941) を参照してください。 [#80139](https://github.com/ClickHouse/ClickHouse/pull/80139)（[scanhex12](https://github.com/scanhex12)）。
* ワークロード向けにクエリスロットのスケジューリングを追加しました。詳細は [workload scheduling](https://clickhouse.com/docs/operations/workload-scheduling#query_scheduling) を参照してください。 [#78415](https://github.com/ClickHouse/ClickHouse/pull/78415) ([Sergei Trifonov](https://github.com/serxa))。
* 時系列データを扱う際の一部のユースケースを高速化するための `timeSeries*` ヘルパー関数：- 開始タイムスタンプ、終了タイムスタンプ、ステップ幅を指定して、データを時間グリッドに再サンプリングする - PromQL 風の `delta`、`rate`、`idelta`、`irate` を計算する。[#80590](https://github.com/ClickHouse/ClickHouse/pull/80590)（[Alexander Gololobov](https://github.com/davenger)）。
* `mapContainsValuesLike`/`mapContainsValues`/`mapExtractValuesLike` 関数を追加し、map の値に対するフィルタリングと Bloom filter ベースのインデックスでの利用を可能にしました。 [#78171](https://github.com/ClickHouse/ClickHouse/pull/78171) ([UnamedRus](https://github.com/UnamedRus)).
* 設定制約で許可されない値の集合を指定できるようになりました。 [#78499](https://github.com/ClickHouse/ClickHouse/pull/78499) ([Bharat Nallan](https://github.com/bharatnc)).
* 単一のクエリ内のすべてのサブクエリで同一のストレージスナップショットを共有できるようにする設定 `enable_shared_storage_snapshot_in_query` を追加しました。これにより、クエリ内で同じテーブルが複数回参照される場合でも、そのテーブルからの読み取りに一貫性が保たれます。 [#79471](https://github.com/ClickHouse/ClickHouse/pull/79471) ([Amos Bird](https://github.com/amosbird)).
* `JSON` カラムを `Parquet` に書き込み、`Parquet` から `JSON` カラムを直接読み取れるようにしました。 [#79649](https://github.com/ClickHouse/ClickHouse/pull/79649) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* `pointInPolygon` が `MultiPolygon` をサポートするようになりました。 [#79773](https://github.com/ClickHouse/ClickHouse/pull/79773) ([Nihal Z. Miaji](https://github.com/nihalzp)).
* ローカルファイルシステムにマウントされた Delta テーブルを `deltaLakeLocal` テーブル関数を使用してクエリできるようにサポートを追加しました。 [#79781](https://github.com/ClickHouse/ClickHouse/pull/79781) ([roykim98](https://github.com/roykim98))。
* 新しい設定 `cast_string_to_date_time_mode` を追加しました。これにより、String からの CAST 時に DateTime のパースモードを選択できるようになります。 [#80210](https://github.com/ClickHouse/ClickHouse/pull/80210) ([Pavel Kruglov](https://github.com/Avogar))。たとえば、ベストエフォートモードに設定できます。
* Bitcoin の Bech アルゴリズムを扱うための `bech32Encode` および `bech32Decode` 関数を追加しました（issue [#40381](https://github.com/ClickHouse/ClickHouse/issues/40381)）。[#80239](https://github.com/ClickHouse/ClickHouse/pull/80239)（[George Larionov](https://github.com/glarik)）。
* MergeTree パーツ名を解析するための SQL 関数を追加しました。 [#80573](https://github.com/ClickHouse/ClickHouse/pull/80573) ([Mikhail Artemenko](https://github.com/Michicosun)).
* クエリで選択されたパーツを、それらが存在するディスクによってフィルタリングできるようにするため、新しい仮想カラム `_disk_name` を導入しました。 [#80650](https://github.com/ClickHouse/ClickHouse/pull/80650) ([tanner-bruce](https://github.com/tanner-bruce)).
* 埋め込み Web ツールの一覧を表示するランディングページを追加。ブラウザのようなユーザーエージェントからリクエストされた場合に表示されます。 [#81129](https://github.com/ClickHouse/ClickHouse/pull/81129) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `arrayFirst`、`arrayFirstIndex`、`arrayLast`、`arrayLastIndex` 関数は、フィルター式によって返される NULL 値を除外します。以前のバージョンでは、Nullable なフィルター結果はサポートされていませんでした。[#81113](https://github.com/ClickHouse/ClickHouse/issues/81113) を修正します。[#81197](https://github.com/ClickHouse/ClickHouse/pull/81197)（[Lennard Eijsackers](https://github.com/Blokje5)）。
* `USE name` の代わりに `USE DATABASE name` と書けるようになりました。 [#81307](https://github.com/ClickHouse/ClickHouse/pull/81307) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 利用可能なコーデックを確認するための新しいシステムテーブル `system.codecs` を追加しました（issue [#81525](https://github.com/ClickHouse/ClickHouse/issues/81525)）。[#81600](https://github.com/ClickHouse/ClickHouse/pull/81600)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `lag` および `lead` ウィンドウ関数をサポートします。 [#9887](https://github.com/ClickHouse/ClickHouse/issues/9887) をクローズしました。 [#82108](https://github.com/ClickHouse/ClickHouse/pull/82108)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `tokens` は、ログに適した新しいトークナイザー `split` をサポートするようになりました。 [#80195](https://github.com/ClickHouse/ClickHouse/pull/80195) ([Robert Schulze](https://github.com/rschu1ze)).
* `clickhouse-local` に `--database` 引数のサポートを追加しました。これにより、既に作成済みのデータベースに切り替えることができます。この変更により [#44115](https://github.com/ClickHouse/ClickHouse/issues/44115) が解決されました。 [#81465](https://github.com/ClickHouse/ClickHouse/pull/81465) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

#### 実験的機能 {#experimental-feature}

* ClickHouse Keeper を用いて、`Kafka2` に対して Kafka のリバランスに類似したロジックを実装しました。各レプリカについて 2 種類のパーティションロック（永続ロックと一時ロック）をサポートします。レプリカは可能な限り長く永続ロックを保持しようとしますが、任意の時点でレプリカ上の永続ロックの数は `all_topic_partitions / active_replicas_count`（ここで `all_topic_partitions` はすべてのパーティション数、`active_replicas_count` はアクティブなレプリカ数）を超えません。もしそれより多くなった場合、レプリカはいくつかのパーティションを解放します。また、一部のパーティションはレプリカによって一時的に保持されます。レプリカ上の一時ロックの最大数は動的に変化し、他のレプリカがいくつかのパーティションを永続ロックとして取得できるようにします。一時ロックを更新する際、レプリカはいったんそれらをすべて解放し、別のパーティションを再度取得しようとします。[#78726](https://github.com/ClickHouse/ClickHouse/pull/78726)（[Daria Fomina](https://github.com/sinfillo)）。
* 実験的なテキストインデックスの改良として、キーと値のペアによる明示的なパラメータ指定をサポートしました。現在サポートされているパラメータは、必須の `tokenizer` と、オプションの `max_rows_per_postings_list` および `ngram_size` の 2 つです。[#80262](https://github.com/ClickHouse/ClickHouse/pull/80262)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 以前は、セグメント ID をディスク上の (`.gin_sid`) ファイルを読み書きすることでオンザフライに更新していたため、全文インデックスでは `packed` ストレージはサポートされていませんでした。`packed` ストレージの場合、未コミットのファイルから値を読み出すことはサポートされておらず、これが問題につながっていました。現在はこの問題は解消されています。[#80852](https://github.com/ClickHouse/ClickHouse/pull/80852)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 実験的な `gin` 型インデックス（PostgreSQL ハッカーたちの内輪ネタなので私は好みではありません）は `text` に改名されました。既存の `gin` 型インデックスは引き続きロード可能ですが、検索でそれらを使用しようとすると例外をスローし（代わりに `text` インデックスを提案します）、利用できません。[#80855](https://github.com/ClickHouse/ClickHouse/pull/80855)（[Robert Schulze](https://github.com/rschu1ze)）。

#### パフォーマンスの向上 {#performance-improvement}

* 複数のプロジェクションを用いたフィルタリングをサポートし、パートレベルのフィルタリングで複数のプロジェクションを使用できるようにしました。これは [#55525](https://github.com/ClickHouse/ClickHouse/issues/55525) への対応です。これは、[#78429](https://github.com/ClickHouse/ClickHouse/issues/78429) に続く、プロジェクションインデックスを実装するための第 2 段階となる変更です。[#80343](https://github.com/ClickHouse/ClickHouse/pull/80343)（[Amos Bird](https://github.com/amosbird)）。
* デフォルトでファイルシステムキャッシュに `SLRU` キャッシュポリシーを使用します。 [#75072](https://github.com/ClickHouse/ClickHouse/pull/75072) ([Kseniia Sumarokova](https://github.com/kssenii)).
* クエリパイプラインにおける Resize ステップでの競合状態を解消しました。 [#77562](https://github.com/ClickHouse/ClickHouse/pull/77562) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* ネットワーク接続に紐づく単一スレッドではなく、パイプラインスレッドにブロックの圧縮／解凍およびシリアル化／逆シリアル化処理をオフロードするオプションを導入しました。設定 `enable_parallel_blocks_marshalling` で制御できます。これにより、イニシエータとリモートノード間で大量のデータを転送する分散クエリの高速化が見込まれます。 [#78694](https://github.com/ClickHouse/ClickHouse/pull/78694) ([Nikita Taranov](https://github.com/nickitat))。
* すべての Bloom フィルター型のパフォーマンスを改善。[OpenHouse カンファレンスの動画](https://www.youtube.com/watch?v=yIVz0NKwQvA\&pp=ygUQb3BlbmhvdXNlIG9wZW5haQ%3D%3D) [#79800](https://github.com/ClickHouse/ClickHouse/pull/79800)（[Delyan Kratunov](https://github.com/dkratunov)）。
* 片方の集合が空の場合に `UniqExactSet::merge` に高速パスを導入しました。また、LHS の集合が 2 レベルで RHS が 1 レベルの場合、RHS を 2 レベルに変換しないようにしました。 [#79971](https://github.com/ClickHouse/ClickHouse/pull/79971) ([Nikita Taranov](https://github.com/nickitat))。
* 2レベルハッシュテーブルの使用時におけるメモリ再利用効率を改善し、ページフォールトを削減しました。これにより GROUP BY を高速化します。 [#80245](https://github.com/ClickHouse/ClickHouse/pull/80245) ([Jiebin Sun](https://github.com/jiebinn)).
* クエリ条件キャッシュで不要な更新を避け、ロック競合を削減しました。 [#80247](https://github.com/ClickHouse/ClickHouse/pull/80247) ([Jiebin Sun](https://github.com/jiebinn)).
* `concatenateBlocks` に対する軽微な最適化。並列ハッシュ結合にも効果がある可能性が高い。[#80328](https://github.com/ClickHouse/ClickHouse/pull/80328) ([李扬](https://github.com/taiyang-li))。
* 主キー範囲からマーク範囲を選択する際、主キーが関数でラップされている場合には二分探索を使用できませんでした。このPRによりこの制限が緩和され、主キーが常に単調な関数のチェーンでラップされている場合、またはRPNに常に真となる要素が含まれている場合には、引き続き二分探索を適用できるようになりました。[#45536](https://github.com/ClickHouse/ClickHouse/issues/45536) をクローズします。 [#80597](https://github.com/ClickHouse/ClickHouse/pull/80597)（[zoomxi](https://github.com/zoomxi)）。
* `Kafka` エンジンのシャットダウン速度を改善しました（複数の `Kafka` テーブルがある場合に発生していた余分な 3 秒の遅延を解消）。 [#80796](https://github.com/ClickHouse/ClickHouse/pull/80796) ([Azat Khuzhin](https://github.com/azat)).
* 非同期インサート: INSERT クエリのメモリ使用量を削減し、パフォーマンスを向上させます。 [#80972](https://github.com/ClickHouse/ClickHouse/pull/80972) ([Raúl Marín](https://github.com/Algunenano)).
* ログテーブルが無効になっている場合はプロセッサのプロファイリングを行わないようにしました。 [#81256](https://github.com/ClickHouse/ClickHouse/pull/81256) ([Raúl Marín](https://github.com/Algunenano))。これにより、ごく短いクエリの実行が高速化されます。
* ソースが要求どおりの値である場合に `toFixedString` を高速化。 [#81257](https://github.com/ClickHouse/ClickHouse/pull/81257) ([Raúl Marín](https://github.com/Algunenano)).
* ユーザーにクォータ制限がない場合はクォータ値を処理しないようにしました。[#81549](https://github.com/ClickHouse/ClickHouse/pull/81549)（[Raúl Marín](https://github.com/Algunenano)）。これにより、ごく短いクエリの実行が高速になります。
* メモリトラッキングにおける性能低下の問題を修正しました。 [#81694](https://github.com/ClickHouse/ClickHouse/pull/81694) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリにおけるシャーディングキーの最適化を改善しました。 [#78452](https://github.com/ClickHouse/ClickHouse/pull/78452) ([fhw12345](https://github.com/fhw12345)).
* 並列レプリカ: すべての読み取りタスクが他のレプリカに割り当てられている場合、未使用かつ遅いレプリカを待機しないようにしました。 [#80199](https://github.com/ClickHouse/ClickHouse/pull/80199) ([Igor Nikonov](https://github.com/devcrafter)).
* 並列レプリカでは、接続タイムアウトが個別の設定で管理されるようになりました。`parallel_replicas_connect_timeout_ms` 設定を参照してください。それ以前は、並列レプリカクエリの接続タイムアウト値として `connect_timeout_with_failover_ms`/`connect_timeout_with_failover_secure_ms` 設定が使用されていました（デフォルト値は 1 秒）。[#80421](https://github.com/ClickHouse/ClickHouse/pull/80421)（[Igor Nikonov](https://github.com/devcrafter)）。
* ジャーナリング対応ファイルシステムでは、`mkdir` はディスクに永続化されるファイルシステムのジャーナルに書き込まれます。ディスクが遅い場合、これに長い時間がかかることがあります。これを `reserve lock` のスコープ外に移動しました。 [#81371](https://github.com/ClickHouse/ClickHouse/pull/81371) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Iceberg のマニフェストファイルの読み込みを、最初の読み取りクエリが実行されるまで遅延させました。 [#81619](https://github.com/ClickHouse/ClickHouse/pull/81619) ([Daniil Ivanik](https://github.com/divanik)).
* 該当する場合、`GLOBAL [NOT] IN` 述語を `PREWHERE` 句に移動できるようにしました。 [#79996](https://github.com/ClickHouse/ClickHouse/pull/79996) ([Eduard Karacharov](https://github.com/korowa)).

#### 改善点 {#improvement}

* `EXPLAIN SYNTAX` は新しいアナライザーを使用するようになりました。クエリツリーから構築された AST を返します。クエリツリーを AST に変換する前に適用されるパス数を制御するためのオプション `query_tree_passes` が追加されました。 [#74536](https://github.com/ClickHouse/ClickHouse/pull/74536) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Dynamic と JSON 向けに、フラット化されたシリアル化を行う Native フォーマットでの実装を追加しました。これにより、Dynamic 用の shared variant や JSON 用の shared data のような特別な構造を用いることなく、Dynamic および JSON データをシリアル化／デシリアル化できます。このシリアル化は、`output_format_native_use_flattened_dynamic_and_json_serialization` を設定することで有効化できます。また、このシリアル化は、さまざまな言語で実装されたクライアントにおいて、TCP プロトコル経由で Dynamic および JSON をより簡単にサポートするために利用できます。[#80499](https://github.com/ClickHouse/ClickHouse/pull/80499) ([Pavel Kruglov](https://github.com/Avogar)).
* エラー `AuthenticationRequired` 発生後に `S3` の認証情報を再取得するようにしました。 [#77353](https://github.com/ClickHouse/ClickHouse/pull/77353) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.asynchronous_metrics` にディクショナリ関連のメトリクスを追加しました。- `DictionaryMaxUpdateDelay` - ディクショナリ更新の最大遅延時間（秒）。- `DictionaryTotalFailedUpdates` - すべてのディクショナリで、最後に正常に読み込まれてから以降に発生したエラーの回数。[#78175](https://github.com/ClickHouse/ClickHouse/pull/78175) ([Vlad](https://github.com/codeworse))。
* 破損したテーブルを退避する目的で作成された可能性があるデータベースについての警告を追加。 [#78841](https://github.com/ClickHouse/ClickHouse/pull/78841) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `S3Queue`、`AzureQueue` エンジンに `_time` 仮想カラムを追加。[#78926](https://github.com/ClickHouse/ClickHouse/pull/78926)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* CPU 過負荷時の接続ドロップを制御する設定をホットリロード対応にしました。 [#79052](https://github.com/ClickHouse/ClickHouse/pull/79052) ([Alexey Katsman](https://github.com/alexkats)).
* Azure Blob Storage 上のプレーンディスクで、`system.tables` に報告されるデータパスにコンテナプレフィックスを追加し、S3 および GCP と一貫した形式で報告されるようにしました。 [#79241](https://github.com/ClickHouse/ClickHouse/pull/79241) ([Julia Kartseva](https://github.com/jkartseva)).
* 現在 clickhouse-client と local は、`param_<name>`（アンダースコア）に加えて `param-<name>`（ダッシュ）としてもクエリパラメータを受け付けます。これにより [#63093](https://github.com/ClickHouse/ClickHouse/issues/63093) が解決されました。[#79429](https://github.com/ClickHouse/ClickHouse/pull/79429)（[Engel Danila](https://github.com/aaaengel)）。
* ローカルからリモート S3 へデータをコピーする際にチェックサムを有効にした場合の帯域幅割引に関する詳細な警告メッセージ。 [#79464](https://github.com/ClickHouse/ClickHouse/pull/79464) ([VicoWu](https://github.com/VicoWu))。
* 以前は、`input_format_parquet_max_block_size = 0`（無効な値）の場合、ClickHouse がハングする問題がありましたが、この問題は修正されました。これにより [#79394](https://github.com/ClickHouse/ClickHouse/issues/79394) がクローズされました。[#79601](https://github.com/ClickHouse/ClickHouse/pull/79601)（[abashkeev](https://github.com/abashkeev)）。
* `startup_scripts` に `throw_on_error` 設定を追加しました。`throw_on_error` が true の場合、すべてのクエリが正常に完了しない限りサーバーは起動しません。デフォルトでは `throw_on_error` は false であり、以前の動作が維持されます。 [#79732](https://github.com/ClickHouse/ClickHouse/pull/79732) ([Aleksandr Musorin](https://github.com/AVMusorin))。
* 任意の種類の `http_handlers` で `http_response_headers` を追加できるようになりました。 [#79975](https://github.com/ClickHouse/ClickHouse/pull/79975) ([Andrey Zvonov](https://github.com/zvonand)).
* 関数 `reverse` が `Tuple` データ型をサポートするようになりました。[#80053](https://github.com/ClickHouse/ClickHouse/issues/80053) をクローズします。[#80083](https://github.com/ClickHouse/ClickHouse/pull/80083)（[flynn](https://github.com/ucasfl)）。
* [#75817](https://github.com/ClickHouse/ClickHouse/issues/75817) を解決しました。`system.zookeeper` テーブルから `auxiliary_zookeepers` のデータを取得できるようにしました。[#80146](https://github.com/ClickHouse/ClickHouse/pull/80146) ([Nikolay Govorov](https://github.com/mrdimidium))。
* サーバーの TCP ソケットに関する非同期メトリクスを追加しました。これによりオブザーバビリティが向上します。[#80187](https://github.com/ClickHouse/ClickHouse/issues/80187) をクローズしました。[#80188](https://github.com/ClickHouse/ClickHouse/pull/80188)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `anyLast_respect_nulls` と `any_respect_nulls` を `SimpleAggregateFunction` としてサポートするようにしました。 [#80219](https://github.com/ClickHouse/ClickHouse/pull/80219) ([Diskein](https://github.com/Diskein)).
* レプリケーテッドデータベース向けの不要な `adjustCreateQueryForBackup` の呼び出しを削除しました。 [#80282](https://github.com/ClickHouse/ClickHouse/pull/80282) ([Vitaly Baranov](https://github.com/vitlibar)).
* `-- --config.value='abc'` のような `--` の後に続く追加オプションを、`clickhouse-local` で `=` 記号なしでも受け付けるようにしました。[#80292](https://github.com/ClickHouse/ClickHouse/issues/80292) をクローズ。[#80293](https://github.com/ClickHouse/ClickHouse/pull/80293)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `SHOW ... LIKE` クエリ内のメタ文字をハイライト表示します。これにより [#80275](https://github.com/ClickHouse/ClickHouse/issues/80275) がクローズされます。[#80297](https://github.com/ClickHouse/ClickHouse/pull/80297)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-local` で SQL UDF を永続化できるようにしました。以前に作成された関数は起動時に読み込まれるようになります。これにより [#80085](https://github.com/ClickHouse/ClickHouse/issues/80085) が解決されました。[#80300](https://github.com/ClickHouse/ClickHouse/pull/80300) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 予備的な DISTINCT ステップの explain plan における説明を修正。 [#80330](https://github.com/ClickHouse/ClickHouse/pull/80330) ([UnamedRus](https://github.com/UnamedRus))。
* ODBC/JDBC で名前付きコレクションを使用可能にしました。 [#80334](https://github.com/ClickHouse/ClickHouse/pull/80334) ([Andrey Zvonov](https://github.com/zvonand)).
* 読み取り専用ディスクおよび故障ディスクの数に関するメトリクスを追加。DiskLocalCheckThread の開始をログに記録するインジケーターを追加。[#80391](https://github.com/ClickHouse/ClickHouse/pull/80391) ([VicoWu](https://github.com/VicoWu))。
* `s3_plain_rewritable` ストレージでプロジェクションをサポートするようにしました。以前のバージョンでは、移動されたときにプロジェクションを参照している S3 内のメタデータオブジェクトが更新されませんでした。 [#70258](https://github.com/ClickHouse/ClickHouse/issues/70258) をクローズ。 [#80393](https://github.com/ClickHouse/ClickHouse/pull/80393) ([Sav](https://github.com/sberss))。
* `SYSTEM UNFREEZE` コマンドは、readonly および write-once ディスク上のパーツを参照しなくなりました。これにより [#80430](https://github.com/ClickHouse/ClickHouse/issues/80430) が解決されました。 [#80432](https://github.com/ClickHouse/ClickHouse/pull/80432) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* マージされたパーツ関連のメッセージのログレベルを引き下げました。 [#80476](https://github.com/ClickHouse/ClickHouse/pull/80476) ([Hans Krutzer](https://github.com/hkrutzer)).
* Iceberg テーブルに対するパーティションプルーニングのデフォルト動作を変更しました。 [#80583](https://github.com/ClickHouse/ClickHouse/pull/80583) ([Melvyn Peignon](https://github.com/melvynator))。
* インデックス検索アルゴリズムの可観測性向上のために、2 つの新しい ProfileEvents `IndexBinarySearchAlgorithm` と `IndexGenericExclusionSearchAlgorithm` を追加しました。[#80679](https://github.com/ClickHouse/ClickHouse/pull/80679)（[Pablo Marcos](https://github.com/pamarcos)）。
* 古いカーネルで `MADV_POPULATE_WRITE` がサポートされていないことについて、ログに警告を出さないようにしました（ログがノイズで埋まるのを防ぐため）。 [#80704](https://github.com/ClickHouse/ClickHouse/pull/80704) ([Robert Schulze](https://github.com/rschu1ze)).
* `TTL` 式で `Date32` および `DateTime64` 型をサポートしました。 [#80710](https://github.com/ClickHouse/ClickHouse/pull/80710) ([Andrey Zvonov](https://github.com/zvonand)).
* `max_merge_delayed_streams_for_parallel_write` の互換性用の値を調整しました。 [#80760](https://github.com/ClickHouse/ClickHouse/pull/80760) ([Azat Khuzhin](https://github.com/azat)).
* クラッシュの修正：デストラクタ内で一時ファイル（ディスク上に一時データを退避するために使用されます）を削除しようとした際に例外がスローされると、プログラムが異常終了する可能性がありました。 [#80776](https://github.com/ClickHouse/ClickHouse/pull/80776) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `SYSTEM SYNC REPLICA` に `IF EXISTS` 修飾子を追加しました。[#80810](https://github.com/ClickHouse/ClickHouse/pull/80810) ([Raúl Marín](https://github.com/Algunenano))。
* &quot;Having zero bytes, but read range is not finished...&quot; に関する例外メッセージを詳細化し、`system.filesystem_cache` に finished&#95;download&#95;time 列を追加しました。 [#80849](https://github.com/ClickHouse/ClickHouse/pull/80849) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `EXPLAIN` を indexes = 1 と併用した場合、出力に検索アルゴリズムのセクションを追加しました。そこには「binary search」または「generic exclusion search」のいずれかが表示されます。 [#80881](https://github.com/ClickHouse/ClickHouse/pull/80881) ([Pablo Marcos](https://github.com/pamarcos)).
* 2024年初めには、新しい analyzer がデフォルトで有効化されていなかったため、MySQL ハンドラーでは `prefer_column_name_to_alias` が true にハードコードされていました。現在は、このハードコードを解除できるようになりました。 [#80916](https://github.com/ClickHouse/ClickHouse/pull/80916) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `system.iceberg_history` で glue や iceberg rest のようなカタログデータベースの履歴も表示されるようになりました。また、一貫性のため、`system.iceberg_history` 内の `table_name` および `database_name` 列名をそれぞれ `table` および `database` に変更しました。 [#80975](https://github.com/ClickHouse/ClickHouse/pull/80975) ([alesapin](https://github.com/alesapin))。
* `merge` テーブル関数で読み取り専用モードをサポートし、使用時に `CREATE TEMPORARY TABLE` 権限を必要としないようにしました。 [#80981](https://github.com/ClickHouse/ClickHouse/pull/80981) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* インメモリキャッシュの観測性を改善（不完全な `system.asynchronouse_metrics` ではなく、`system.metrics` でキャッシュに関する情報を公開）。インメモリキャッシュのサイズ（バイト単位）を `dashboard.html` に追加しました。`VectorSimilarityIndexCacheSize` / `IcebergMetadataFilesCacheSize` は `VectorSimilarityIndexCacheBytes` / `IcebergMetadataFilesCacheBytes` にリネームされました。[#81023](https://github.com/ClickHouse/ClickHouse/pull/81023) ([Azat Khuzhin](https://github.com/azat))。
* `system.rocksdb` から読み取る際に、`RocksDB` テーブルを保持できないエンジンを使用するデータベースを無視するようにしました。 [#81083](https://github.com/ClickHouse/ClickHouse/pull/81083) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `clickhouse-local` の設定ファイルで `filesystem_caches` と `named_collections` を許可できるようにしました。 [#81105](https://github.com/ClickHouse/ClickHouse/pull/81105) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `INSERT` クエリ内での `PARTITION BY` のシンタックスハイライトを修正しました。以前のバージョンでは、`PARTITION BY` がキーワードとしてハイライトされていませんでした。[#81106](https://github.com/ClickHouse/ClickHouse/pull/81106)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI における 2 つの小さな改善: - `CREATE` や `INSERT` のような出力を持たないクエリを正しく処理するようにしました（つい最近まで、これらのクエリはスピナーが無限に回転し続けていました）; - テーブルをダブルクリックした際に、先頭までスクロールするようにしました。 [#81131](https://github.com/ClickHouse/ClickHouse/pull/81131) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `MemoryResidentWithoutPageCache` メトリクスは、ユーザー空間のページキャッシュを除いた、サーバープロセスが使用している物理メモリ量をバイト単位で示します。これは、ユーザー空間のページキャッシュが利用されている場合に、実際のメモリ使用量をより正確に把握するのに役立ちます。ユーザー空間のページキャッシュが無効化されている場合、この値は `MemoryResident` と等しくなります。 [#81233](https://github.com/ClickHouse/ClickHouse/pull/81233) ([Jayme Bird](https://github.com/jaymebrd))。
* クライアント、ローカルサーバー、Keeper クライアントおよび Disks アプリで手動で記録された例外に「ログ済み」マークを付け、二重にログが記録されないようにしました。 [#81271](https://github.com/ClickHouse/ClickHouse/pull/81271) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `use_skip_indexes_if_final` と `use_skip_indexes_if_final_exact_mode` の設定は、デフォルトで `True` に設定されるようになりました。`FINAL` 句を含むクエリは、（該当する場合）スキップインデックスを使用してグラニュールを絞り込み、一致する主キー範囲に対応する追加のグラニュールも読み取るようになります。近似的／不正確な結果という従来の挙動が必要なユーザーは、慎重に評価したうえで `use_skip_indexes_if_final_exact_mode` を FALSE に設定できます。 [#81331](https://github.com/ClickHouse/ClickHouse/pull/81331) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Web UI で複数のクエリがある場合、カーソル位置にあるクエリが実行されます。 [#80977](https://github.com/ClickHouse/ClickHouse/issues/80977) の継続です。 [#81354](https://github.com/ClickHouse/ClickHouse/pull/81354)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* このPRは、変換関数の単調性チェックにおける `is_strict` の実装上の問題を修正します。現在、`toFloat64(UInt32)` や `toDate(UInt8)` などの一部の変換関数は、本来は true を返すべきところで、`is_strict` を誤って false として返しています。[#81359](https://github.com/ClickHouse/ClickHouse/pull/81359) ([zoomxi](https://github.com/zoomxi))。
* `KeyCondition` が連続した範囲にマッチするかをチェックする際、キーが非厳密な関数チェーンでラップされている場合には、`Constraint::POINT` を `Constraint::RANGE` に変換する必要が生じることがあります。たとえば、`toDate(event_time) = '2025-06-03'` は、`event_time` に対して [`2025-06-03 00:00:00`, `2025-06-04 00:00:00`) の範囲を意味します。この PR はこの動作を修正します。 [#81400](https://github.com/ClickHouse/ClickHouse/pull/81400) ([zoomxi](https://github.com/zoomxi)).
* `clickhouse`/`ch` エイリアスは、`--host` または `--port` が指定されている場合、`clickhouse-local` ではなく `clickhouse-client` を呼び出します。[#79422](https://github.com/ClickHouse/ClickHouse/issues/79422) の継続。[#65252](https://github.com/ClickHouse/ClickHouse/issues/65252) をクローズ。[#81509](https://github.com/ClickHouse/ClickHouse/pull/81509)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* keeper のレスポンス時間分布データが取得できたので、メトリクス用のヒストグラムバケットをチューニングできるようになりました。 [#81516](https://github.com/ClickHouse/ClickHouse/pull/81516) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* プロファイルイベント `PageCacheReadBytes` を追加。 [#81742](https://github.com/ClickHouse/ClickHouse/pull/81742) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ファイルシステムキャッシュで発生する論理エラー「Having zero bytes but range is not finished」を修正しました。 [#81868](https://github.com/ClickHouse/ClickHouse/pull/81868) ([Kseniia Sumarokova](https://github.com/kssenii)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* パラメータ化されたビューでの SELECT EXCEPT クエリの問題を修正し、[#49447](https://github.com/ClickHouse/ClickHouse/issues/49447) をクローズ。[#57380](https://github.com/ClickHouse/ClickHouse/pull/57380)（[Nikolay Degterinsky](https://github.com/evillique)）。
* Analyzer: JOIN におけるカラム型の昇格後に、カラムプロジェクション名を修正。[#63345](https://github.com/ClickHouse/ClickHouse/issues/63345) をクローズ。[#63519](https://github.com/ClickHouse/ClickHouse/pull/63519)（[Dmitry Novik](https://github.com/novikd)）。
* analyzer&#95;compatibility&#95;join&#95;using&#95;top&#95;level&#95;identifier が有効な場合に、列名の衝突が発生する場合の論理エラーを修正しました。 [#75676](https://github.com/ClickHouse/ClickHouse/pull/75676) ([Vladimir Cherkasov](https://github.com/vdimir))。
* `allow_push_predicate_ast_for_distributed_subqueries` が有効な場合に、プッシュダウンされた述語における CTE の扱いを修正しました。[#75647](https://github.com/ClickHouse/ClickHouse/issues/75647) を修正しました。[#79672](https://github.com/ClickHouse/ClickHouse/issues/79672) を修正しました。[#77316](https://github.com/ClickHouse/ClickHouse/pull/77316)（[Dmitry Novik](https://github.com/novikd)）。
* `SYSTEM SYNC REPLICA LIGHTWEIGHT 'foo'` が、指定したレプリカが存在しない場合でも成功として扱ってしまう問題を修正しました。このコマンドは、同期を試行する前に Keeper 上にレプリカが存在することを正しく検証するようになりました。 [#78405](https://github.com/ClickHouse/ClickHouse/pull/78405) ([Jayme Bird](https://github.com/jaymebrd)).
* `ON CLUSTER` クエリの `CONSTRAINT` セクション内で `currentDatabase` 関数を使用したごく限定的なケースで発生するクラッシュを修正しました。[#78100](https://github.com/ClickHouse/ClickHouse/issues/78100) をクローズします。 [#79070](https://github.com/ClickHouse/ClickHouse/pull/79070) ([pufit](https://github.com/pufit)).
* サーバー間クエリにおける外部ロールの伝達を修正。 [#79099](https://github.com/ClickHouse/ClickHouse/pull/79099) ([Andrey Zvonov](https://github.com/zvonand)).
* SingleValueDataGeneric では、Field の代わりに IColumn を使用するようにしてください。`Dynamic/Variant/JSON` 型に対する `argMax` など、一部の集約関数で誤った戻り値が返される問題が修正されます。[#79166](https://github.com/ClickHouse/ClickHouse/pull/79166) ([Pavel Kruglov](https://github.com/Avogar)).
* Azure Blob Storage 用の use&#95;native&#95;copy および allow&#95;azure&#95;native&#95;copy 設定の適用を修正し、認証情報が一致する場合にのみネイティブコピーを使用するように更新しました。これにより [#78964](https://github.com/ClickHouse/ClickHouse/issues/78964) が解決されました。 [#79561](https://github.com/ClickHouse/ClickHouse/pull/79561) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 列が相関付けられているかどうかをチェックする際に、その列の起源スコープが不明であることに起因して発生していた論理エラーを修正。[#78183](https://github.com/ClickHouse/ClickHouse/issues/78183) を修正。[#79451](https://github.com/ClickHouse/ClickHouse/issues/79451) を修正。[#79727](https://github.com/ClickHouse/ClickHouse/pull/79727)（[Dmitry Novik](https://github.com/novikd)）。
* ColumnConst と Analyzer を使用した grouping sets で誤った結果が出る問題を修正。 [#79743](https://github.com/ClickHouse/ClickHouse/pull/79743) ([Andrey Zvonov](https://github.com/zvonand)).
* ローカルレプリカが古い状態のときに Distributed テーブルから読み取る際に発生する、ローカルシャードにおける結果の重複を修正しました。 [#79761](https://github.com/ClickHouse/ClickHouse/pull/79761) ([Eduard Karacharov](https://github.com/korowa)).
* 負の符号ビットを持つ NaN の並び順を修正しました。 [#79847](https://github.com/ClickHouse/ClickHouse/pull/79847) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `GROUP BY ALL` は `GROUPING` 句を考慮しないようになりました。 [#79915](https://github.com/ClickHouse/ClickHouse/pull/79915) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* `TopK` / `TopKWeighted` 関数において、容量が尽きていない場合でも過大な誤差が発生していた誤った状態マージ処理を修正しました。 [#79939](https://github.com/ClickHouse/ClickHouse/pull/79939) ([Joel Höner](https://github.com/athre0z)).
* `azure_blob_storage` オブジェクトストレージで `readonly` 設定が尊重されるようにしました。 [#79954](https://github.com/ClickHouse/ClickHouse/pull/79954) ([Julia Kartseva](https://github.com/jkartseva)).
* `match(column, '^…')` をバックスラッシュでエスケープされた文字と併用した際に発生していた、クエリ結果が誤る問題およびメモリ不足によるクラッシュを修正しました。 [#79969](https://github.com/ClickHouse/ClickHouse/pull/79969) ([filimonov](https://github.com/filimonov)).
* データレイクに対する Hive パーティショニングを無効化します。 [https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937](https://github.com/issues/assigned?issue=ClickHouse%7CClickHouse%7C79937) を部分的に解決します。 [#80005](https://github.com/ClickHouse/ClickHouse/pull/80005)（[Daniil Ivanik](https://github.com/divanik)）。
* ラムダ式を含む skip index が適用されない問題を修正しました。インデックス定義内の高水準関数がクエリ内のものと完全に一致する場合にも、正しく適用されるようにしました。 [#80025](https://github.com/ClickHouse/ClickHouse/pull/80025) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* レプリケーションログから ATTACH&#95;PART コマンドを実行するレプリカでパーツをアタッチする際のメタデータバージョンを修正しました。 [#80038](https://github.com/ClickHouse/ClickHouse/pull/80038) ([Aleksei Filatov](https://github.com/aalexfvk)).
* Executable User Defined Functions (eUDF) の名前は、他の関数とは異なり、`system.query_log` テーブルの `used_functions` カラムに追加されませんでした。この PR では、リクエストで eUDF が使用された場合に、その eUDF 名が追加されるようにしました。 [#80073](https://github.com/ClickHouse/ClickHouse/pull/80073) ([Kyamran](https://github.com/nibblerenush))。
* LowCardinality(FixedString) を用いた Arrow フォーマットにおける論理エラーを修正しました。 [#80156](https://github.com/ClickHouse/ClickHouse/pull/80156) ([Pavel Kruglov](https://github.com/Avogar)).
* Merge エンジンからのサブカラム読み取りを修正。 [#80158](https://github.com/ClickHouse/ClickHouse/pull/80158) ([Pavel Kruglov](https://github.com/Avogar)).
* `KeyCondition` における数値型の比較処理に関するバグを修正しました。 [#80207](https://github.com/ClickHouse/ClickHouse/pull/80207) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* projection を持つテーブルに対して lazy materialization を適用した場合に発生する `AMBIGUOUS_COLUMN_NAME` を修正しました。 [#80251](https://github.com/ClickHouse/ClickHouse/pull/80251) ([Igor Nikonov](https://github.com/devcrafter)).
* 暗黙的プロジェクション使用時に、`LIKE &#39;ab&#95;c%&#39;` のような文字列プレフィックスフィルタに対して誤った `count` の最適化が行われていた問題を修正しました。これにより [#80250](https://github.com/ClickHouse/ClickHouse/issues/80250) が修正されます。[#80261](https://github.com/ClickHouse/ClickHouse/pull/80261)（[Amos Bird](https://github.com/amosbird)）。
* MongoDB ドキュメント内のネストされた数値フィールドが文字列として誤ってシリアル化される問題を修正しました。MongoDB から取得するドキュメントの最大深度制限を撤廃しました。 [#80289](https://github.com/ClickHouse/ClickHouse/pull/80289) ([Kirill Nikiforov](https://github.com/allmazz)).
* Replicated データベースにおける RMT のメタデータチェックをより緩く行うようにしました。 [#80296](https://github.com/ClickHouse/ClickHouse/issues/80296) をクローズ。 [#80298](https://github.com/ClickHouse/ClickHouse/pull/80298)（[Nikolay Degterinsky](https://github.com/evillique)）。
* PostgreSQL ストレージ用の DateTime および DateTime64 のテキスト表現を修正しました。 [#80301](https://github.com/ClickHouse/ClickHouse/pull/80301) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `StripeLog` テーブルでタイムゾーン付きの `DateTime` を許可するようにしました。これにより [#44120](https://github.com/ClickHouse/ClickHouse/issues/44120) が解決されます。[#80304](https://github.com/ClickHouse/ClickHouse/pull/80304)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリプランのステップで行数が変わる場合は、非決定的関数を含む述語に対するフィルタープッシュダウンを行わないようにしました。 [#40273](https://github.com/ClickHouse/ClickHouse/issues/40273) を修正。 [#80329](https://github.com/ClickHouse/ClickHouse/pull/80329)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* サブカラムを含むプロジェクションで発生し得る論理エラーやクラッシュを修正。 [#80333](https://github.com/ClickHouse/ClickHouse/pull/80333) ([Pavel Kruglov](https://github.com/Avogar)).
* `ON` 句が単純な等価条件でない場合に、論理 JOIN ステップに対するフィルタープッシュダウンの最適化が原因で発生する `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正。[#79647](https://github.com/ClickHouse/ClickHouse/issues/79647) と [#77848](https://github.com/ClickHouse/ClickHouse/issues/77848) を修正。[#80360](https://github.com/ClickHouse/ClickHouse/pull/80360)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* パーティション化テーブルで逆順のキーを読み取る際に誤った結果が返る不具合を修正しました。この修正は [#79987](https://github.com/ClickHouse/ClickHouse/issues/79987) に対応するものです。[#80448](https://github.com/ClickHouse/ClickHouse/pull/80448)（[Amos Bird](https://github.com/amosbird)）。
* Nullable キーを持つテーブルで、optimize&#95;read&#95;in&#95;order が有効な場合に誤った並び順になる問題を修正しました。 [#80515](https://github.com/ClickHouse/ClickHouse/pull/80515) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `SYSTEM STOP REPLICATED VIEW` を使用してリフレッシュ可能なマテリアライズドビューを一時停止している場合に、その DROP がハングする問題を修正しました。 [#80543](https://github.com/ClickHouse/ClickHouse/pull/80543) ([Michael Kolupaev](https://github.com/al13n321)).
* 分散クエリで定数タプルを使用した場合に発生する &#39;Cannot find column&#39; エラーの問題を修正。 [#80596](https://github.com/ClickHouse/ClickHouse/pull/80596) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `join_use_nulls` 使用時の Distributed テーブルにおける `shardNum` 関数を修正。 [#80612](https://github.com/ClickHouse/ClickHouse/pull/80612) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Merge エンジン配下のテーブルの一部にしか存在しないカラムを読み取る際に、誤った結果が返る問題を修正しました。 [#80643](https://github.com/ClickHouse/ClickHouse/pull/80643) ([Pavel Kruglov](https://github.com/Avogar)).
* replxx のハングが原因となり得る SSH プロトコルの問題を修正。 [#80688](https://github.com/ClickHouse/ClickHouse/pull/80688) ([Azat Khuzhin](https://github.com/azat)).
* `iceberg_history` テーブル内のタイムスタンプが正しくなるよう修正しました。 [#80711](https://github.com/ClickHouse/ClickHouse/pull/80711) ([Melvyn Peignon](https://github.com/melvynator))。
* 辞書の登録に失敗した場合に発生しうるクラッシュを修正しました（`CREATE DICTIONARY` が `CANNOT_SCHEDULE_TASK` で失敗した際に、辞書レジストリ内にダングリングポインタが残る可能性があり、その後クラッシュにつながっていました）。 [#80714](https://github.com/ClickHouse/ClickHouse/pull/80714) ([Azat Khuzhin](https://github.com/azat)).
* オブジェクトストレージ用テーブル関数における単一要素の enum グロブの処理を修正しました。 [#80716](https://github.com/ClickHouse/ClickHouse/pull/80716) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Tuple(Dynamic) と String の比較関数における誤った結果型を修正し、論理エラーを引き起こしていた問題を解消しました。 [#80728](https://github.com/ClickHouse/ClickHouse/pull/80728) ([Pavel Kruglov](https://github.com/Avogar)).
* Unity Catalog 向けに不足していたサポート対象データ型 `timestamp_ntz` を追加しました。[#79535](https://github.com/ClickHouse/ClickHouse/issues/79535)、[#79875](https://github.com/ClickHouse/ClickHouse/issues/79875) を修正しました。[#80740](https://github.com/ClickHouse/ClickHouse/pull/80740)（[alesapin](https://github.com/alesapin)）。
* `IN cte` を含む分散クエリで発生していた `THERE_IS_NO_COLUMN` エラーを修正。[#75032](https://github.com/ClickHouse/ClickHouse/issues/75032) を解決。[#80757](https://github.com/ClickHouse/ClickHouse/pull/80757)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 外部 ORDER BY でファイル数が過剰になる問題（メモリ使用量が過大になる原因）を修正。 [#80777](https://github.com/ClickHouse/ClickHouse/pull/80777) ([Azat Khuzhin](https://github.com/azat)).
* このPRは、[#80742](https://github.com/ClickHouse/ClickHouse/issues/80742) をクローズする可能性があります。[#80783](https://github.com/ClickHouse/ClickHouse/pull/80783)（[zoomxi](https://github.com/zoomxi)）。
* Kafka において get&#95;member&#95;id() が NULL から std::string を生成していたことにより発生していたクラッシュを修正しました (ブローカーへの接続に失敗した場合にのみ発生していた問題と思われます)。 [#80793](https://github.com/ClickHouse/ClickHouse/pull/80793) ([Azat Khuzhin](https://github.com/azat)).
* Kafka エンジンをシャットダウンする前にコンシューマーの終了を適切に待機するようにしました（シャットダウン後もコンシューマーがアクティブなままだと、さまざまなデバッグアサーションがトリガーされる可能性があり、またテーブルが drop / detach された後もバックグラウンドでブローカーからデータを読み続けてしまう場合があります）。 [#80795](https://github.com/ClickHouse/ClickHouse/pull/80795) ([Azat Khuzhin](https://github.com/azat))。
* `predicate-push-down` 最適化により発生する `NOT_FOUND_COLUMN_IN_BLOCK` を修正しました。これにより [#80443](https://github.com/ClickHouse/ClickHouse/issues/80443) を解決します。 [#80834](https://github.com/ClickHouse/ClickHouse/pull/80834)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* USING を伴う JOIN におけるテーブル関数内のアスタリスク（`*`）マッチャーの解決時に発生する論理エラーを修正。 [#80894](https://github.com/ClickHouse/ClickHouse/pull/80894) ([Vladimir Cherkasov](https://github.com/vdimir)).
* Iceberg メタデータファイルキャッシュのメモリ計上を修正。 [#80904](https://github.com/ClickHouse/ClickHouse/pull/80904) ([Azat Khuzhin](https://github.com/azat)).
* NULL 許容パーティションキーで誤ったパーティション分割が行われる問題を修正。 [#80913](https://github.com/ClickHouse/ClickHouse/pull/80913) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* 述語プッシュダウン（`allow_push_predicate_ast_for_distributed_subqueries=1`）を有効にした分散クエリで、イニシエータ上にソーステーブルが存在しない場合に発生する `Table does not exist` エラーを修正しました。この変更は [#77281](https://github.com/ClickHouse/ClickHouse/issues/77281) の問題を解決します。 [#80915](https://github.com/ClickHouse/ClickHouse/pull/80915)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* 名前付きウィンドウを使用するネストされた関数における論理エラーを修正。 [#80926](https://github.com/ClickHouse/ClickHouse/pull/80926) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* Nullable および浮動小数点列に対する extremes の処理を修正。 [#80970](https://github.com/ClickHouse/ClickHouse/pull/80970) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* system.tables からのクエリ中に発生し得るクラッシュを修正しました（メモリプレッシャーがかかっている状況で発生しやすい問題）。 [#80976](https://github.com/ClickHouse/ClickHouse/pull/80976) ([Azat Khuzhin](https://github.com/azat)).
* ファイル拡張子から圧縮形式を推論するファイルに対して、truncate を伴うアトミックなリネーム処理を修正。 [#80979](https://github.com/ClickHouse/ClickHouse/pull/80979) ([Pablo Marcos](https://github.com/pamarcos))。
* ErrorCodes::getName を修正。 [#81032](https://github.com/ClickHouse/ClickHouse/pull/81032) ([RinChanNOW](https://github.com/RinChanNOWWW))。
* Unity Catalog で、ユーザーにすべてのテーブルへの権限がない場合にテーブル一覧を取得できないバグを修正しました。この修正により、すべてのテーブルが正しく一覧表示されるようになり、アクセス制限されたテーブルを読み取ろうとした場合には例外がスローされます。 [#81044](https://github.com/ClickHouse/ClickHouse/pull/81044) ([alesapin](https://github.com/alesapin)).
* これにより、`SHOW TABLES` クエリにおいて、ClickHouse はデータレイクカタログからのエラーや予期しない応答を無視するようになりました。[#79725](https://github.com/ClickHouse/ClickHouse/issues/79725) を修正。[#81046](https://github.com/ClickHouse/ClickHouse/pull/81046)（[alesapin](https://github.com/alesapin)）。
* JSONExtract および JSON 型のパースにおける、整数値からの DateTime64 の読み取りを修正。 [#81050](https://github.com/ClickHouse/ClickHouse/pull/81050) ([Pavel Kruglov](https://github.com/Avogar)).
* スキーマ推論キャッシュに date&#95;time&#95;input&#95;format 設定を反映するようにしました。 [#81052](https://github.com/ClickHouse/ClickHouse/pull/81052) ([Pavel Kruglov](https://github.com/Avogar)).
* クエリ開始後からカラム送信前の間にテーブルが DROP された場合に INSERT がクラッシュする問題を修正。 [#81053](https://github.com/ClickHouse/ClickHouse/pull/81053) ([Azat Khuzhin](https://github.com/azat)).
* quantileDeterministic における未初期化値の使用を修正しました。 [#81062](https://github.com/ClickHouse/ClickHouse/pull/81062) ([Azat Khuzhin](https://github.com/azat)).
* `metadatastoragefromdisk` ディスクのトランザクションにおけるハードリンク数の管理を修正し、テストを追加。 [#81066](https://github.com/ClickHouse/ClickHouse/pull/81066) ([Sema Checherinda](https://github.com/CheSema)).
* 他の関数と異なり、ユーザー定義関数 (UDF) の名前は `system.query_log` テーブルに追加されていませんでした。このPRでは、リクエスト内でUDFが使用された場合、そのUDF名を `used_executable_user_defined_functions` または `used_sql_user_defined_functions` のいずれか一方の列に追加するよう実装しています。 [#81101](https://github.com/ClickHouse/ClickHouse/pull/81101) ([Kyamran](https://github.com/nibblerenush)).
* HTTP プロトコル経由でテキスト形式（`JSON`、`Values` など）を用いてデータを挿入する際に、`Enum` フィールドを省略した場合に発生していた `Too large size ... passed to allocator` エラーや、クラッシュが起こりうる問題を修正しました。 [#81145](https://github.com/ClickHouse/ClickHouse/pull/81145) ([Anton Popov](https://github.com/CurtizJ)).
* non-MT の MV にプッシュされる INSERT ブロックに Sparse 列が含まれている場合の LOGICAL&#95;ERROR を修正。 [#81161](https://github.com/ClickHouse/ClickHouse/pull/81161) ([Azat Khuzhin](https://github.com/azat)).
* クロスレプリケーション環境で `distributed_product_mode_local=local` を使用した際に発生する `Unknown table expression identifier` エラーを修正。 [#81162](https://github.com/ClickHouse/ClickHouse/pull/81162) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* フィルタリング後の Parquet ファイルにおける行数のキャッシュが誤っていた問題を修正しました。 [#81184](https://github.com/ClickHouse/ClickHouse/pull/81184) ([Michael Kolupaev](https://github.com/al13n321)).
* 相対キャッシュパス使用時の `fs cache max_size_to_total_space` 設定を修正しました。 [#81237](https://github.com/ClickHouse/ClickHouse/pull/81237) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Parquet 形式で const タプルやマップを出力する際に clickhouse-local がクラッシュする問題を修正しました。 [#81249](https://github.com/ClickHouse/ClickHouse/pull/81249) ([Michael Kolupaev](https://github.com/al13n321)).
* ネットワーク経由で受信した配列オフセットを検証するようにしました。 [#81269](https://github.com/ClickHouse/ClickHouse/pull/81269) ([Azat Khuzhin](https://github.com/azat)).
* 空のテーブルを `JOIN` し、ウィンドウ関数を使用するクエリにおける一部のコーナーケースを修正しました。このバグにより並列ストリーム数が爆発的に増加し、その結果 OOM が発生していました。 [#81299](https://github.com/ClickHouse/ClickHouse/pull/81299) ([Alexander Gololobov](https://github.com/davenger)).
* datalake クラスター関数（`deltaLakeCluster`、`icebergCluster` など）に対する修正: (1) 旧アナライザで `Cluster` 関数を使用した場合に `DataLakeConfiguration` で発生する可能性のあったセグメンテーションフォルトを修正; (2) 重複していた data lake メタデータ更新（不要なオブジェクトストレージへのリクエスト）を削除; (3) フォーマットが明示的に指定されていない場合のオブジェクトストレージでの不要なリスト処理を修正（非クラスター data lake エンジンではすでに行われていたもの）。 [#81300](https://github.com/ClickHouse/ClickHouse/pull/81300) ([Kseniia Sumarokova](https://github.com/kssenii))。
* force&#95;restore&#95;data フラグで失われた Keeper メタデータを復旧できるようにしました。 [#81324](https://github.com/ClickHouse/ClickHouse/pull/81324) ([Raúl Marín](https://github.com/Algunenano)).
* delta-kernel におけるリージョンエラーを修正し、[#79914](https://github.com/ClickHouse/ClickHouse/issues/79914) を解消。 [#81353](https://github.com/ClickHouse/ClickHouse/pull/81353)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* divideOrNull に対する誤った JIT を無効化しました。 [#81370](https://github.com/ClickHouse/ClickHouse/pull/81370) ([Raúl Marín](https://github.com/Algunenano))。
* パーティション列名が長い MergeTree テーブルで発生する INSERT エラーを修正。 [#81390](https://github.com/ClickHouse/ClickHouse/pull/81390) ([hy123q](https://github.com/haoyangqian)).
* [#81957](https://github.com/ClickHouse/ClickHouse/issues/81957) にバックポート済み: マージ処理中に例外が発生した場合に `Aggregator` がクラッシュする可能性のあった問題を修正しました。 [#81450](https://github.com/ClickHouse/ClickHouse/pull/81450) ([Nikita Taranov](https://github.com/nickitat))。
* 複数の manifest ファイルの内容をメモリに保持しないようにしました。[#81470](https://github.com/ClickHouse/ClickHouse/pull/81470) ([Daniil Ivanik](https://github.com/divanik))。
* シャットダウン時にバックグラウンドプール（`background_.*pool_size`）で発生する可能性があるクラッシュを修正。[#81473](https://github.com/ClickHouse/ClickHouse/pull/81473) ([Azat Khuzhin](https://github.com/azat)).
* `URL` エンジンを使用してテーブルに書き込みを行う際に発生していた `Npy` フォーマットでの境界外読み取りを修正。これにより [#81356](https://github.com/ClickHouse/ClickHouse/issues/81356) をクローズします。[#81502](https://github.com/ClickHouse/ClickHouse/pull/81502)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Web UI に `NaN%` が表示される可能性があります（よくある JavaScript の問題によるものです）。[#81507](https://github.com/ClickHouse/ClickHouse/pull/81507)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `database_replicated_enforce_synchronous_settings=1` が設定されている場合の `DatabaseReplicated` を修正。 [#81564](https://github.com/ClickHouse/ClickHouse/pull/81564) ([Azat Khuzhin](https://github.com/azat)).
* LowCardinality(Nullable(...)) 型のソート順を修正しました。 [#81583](https://github.com/ClickHouse/ClickHouse/pull/81583) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* ソケットからリクエストを最後まで読み取っていない場合、サーバーが HTTP 接続を維持しないようにしました。 [#81595](https://github.com/ClickHouse/ClickHouse/pull/81595) ([Sema Checherinda](https://github.com/CheSema)).
* スカラー相関サブクエリが射影式の Nullable な結果を返すようにしました。相関サブクエリが空の結果セットを生成する場合の不具合を修正しました。 [#81632](https://github.com/ClickHouse/ClickHouse/pull/81632) ([Dmitry Novik](https://github.com/novikd)).
* `ReplicatedMergeTree` への `ATTACH` 中に発生する `Unexpected relative path for a deduplicated part` エラーを修正。 [#81647](https://github.com/ClickHouse/ClickHouse/pull/81647) ([Azat Khuzhin](https://github.com/azat)).
* クエリ設定 `use_iceberg_partition_pruning` は、クエリコンテキストではなくグローバルコンテキストを使用しているため、Iceberg ストレージでは有効になりません。デフォルト値が true であるため致命的ではありませんが、この PR によって修正されます。 [#81673](https://github.com/ClickHouse/ClickHouse/pull/81673) ([Han Fei](https://github.com/hanfei1991)).
* [#82128](https://github.com/ClickHouse/ClickHouse/issues/82128) にバックポート: TTL 式で dict を使用している場合にマージ処理中に発生する「Context has expired」エラーを修正。 [#81690](https://github.com/ClickHouse/ClickHouse/pull/81690) ([Azat Khuzhin](https://github.com/azat)).
* `merge_max_block_size` がゼロ以外であることを保証するために、MergeTree 設定へのバリデーションを追加しました。 [#81693](https://github.com/ClickHouse/ClickHouse/pull/81693) ([Bharat Nallan](https://github.com/bharatnc)).
* `DROP VIEW` クエリがハングする問題が発生していた `clickhouse-local` を修正しました。 [#81705](https://github.com/ClickHouse/ClickHouse/pull/81705) ([Bharat Nallan](https://github.com/bharatnc)).
* 一部のケースにおける StorageRedis の JOIN を修正しました。[#81736](https://github.com/ClickHouse/ClickHouse/pull/81736) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))。
* 空の `USING ()` を使用し旧アナライザが有効な場合に発生する `ConcurrentHashJoin` のクラッシュを修正。 [#81754](https://github.com/ClickHouse/ClickHouse/pull/81754) ([Nikita Taranov](https://github.com/nickitat)).
* Keeper の修正: ログに無効なエントリが存在する場合は、新しいログの commit をブロックするようにしました。これまでは、leader が一部のログを誤って適用しても、follower がダイジェストの不一致を検知して中断しているにもかかわらず、新しいログの commit を継続していました。 [#81780](https://github.com/ClickHouse/ClickHouse/pull/81780) ([Antonio Andelic](https://github.com/antonio2368)).
* スカラー相関サブクエリの処理中に必須列が読み込まれない問題を修正しました。[#81716](https://github.com/ClickHouse/ClickHouse/issues/81716) を修正しました。[#81805](https://github.com/ClickHouse/ClickHouse/pull/81805)（[Dmitry Novik](https://github.com/novikd)）。
* 誰かがコードのあちこちに Kusto を紛れ込ませていましたが、きれいに掃除しました。これで [#81643](https://github.com/ClickHouse/ClickHouse/issues/81643) がクローズされます。[#81885](https://github.com/ClickHouse/ClickHouse/pull/81885)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 以前のバージョンでは、`/js` へのリクエストに対してサーバーが不要に多くのコンテンツを返していました。これにより [#61890](https://github.com/ClickHouse/ClickHouse/issues/61890) がクローズされました。 [#81895](https://github.com/ClickHouse/ClickHouse/pull/81895)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* これまで、`MongoDB` テーブルエンジンの定義では、`host:port` 引数にパスコンポーネントを含めることができましたが、これは暗黙的に無視されていました。`mongodb` 統合では、そのようなテーブルの読み込みを拒否していました。この修正により、*`MongoDB` エンジンが 5 つの引数を持つ場合には、そのようなテーブルの読み込みを許可し、引数から取得したデータベース名を使用しつつパスコンポーネントを無視します。* *注:* この修正は、新しく作成されたテーブルや `mongo` テーブル関数を用いたクエリ、ディクショナリソースおよび名前付きコレクションには適用されません。 [#81942](https://github.com/ClickHouse/ClickHouse/pull/81942) ([Vladimir Cherkasov](https://github.com/vdimir)).
* マージ処理中に例外が発生した場合に `Aggregator` がクラッシュし得る不具合を修正しました。 [#82022](https://github.com/ClickHouse/ClickHouse/pull/82022) ([Nikita Taranov](https://github.com/nickitat))。
* `arraySimilarity` におけるコピーペーストの誤りを修正し、重みとしての `UInt32` と `Int32` の使用を禁止しました。テストとドキュメントを更新しました。 [#82103](https://github.com/ClickHouse/ClickHouse/pull/82103) ([Mikhail f. Shiryaev](https://github.com/Felixoid))。
* suggestion スレッドとメインクライアントスレッド間のデータレースが発生する可能性を修正。 [#82233](https://github.com/ClickHouse/ClickHouse/pull/82233) ([Azat Khuzhin](https://github.com/azat)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* `postgres` 16.9 を使用。 [#81437](https://github.com/ClickHouse/ClickHouse/pull/81437) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `openssl` 3.2.4 を使用。 [#81438](https://github.com/ClickHouse/ClickHouse/pull/81438) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `abseil-cpp` 2025-01-27 を使用します。 [#81440](https://github.com/ClickHouse/ClickHouse/pull/81440) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `mongo-c-driver` 1.30.4 を使用します。[#81449](https://github.com/ClickHouse/ClickHouse/pull/81449) ([Konstantin Bogdanov](https://github.com/thevar1able))。
* `krb5` 1.21.3-final を使用します。[#81453](https://github.com/ClickHouse/ClickHouse/pull/81453)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `orc` 2.1.2 を使用するよう変更。 [#81455](https://github.com/ClickHouse/ClickHouse/pull/81455) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `grpc` 1.73.0 を使用します。 [#81629](https://github.com/ClickHouse/ClickHouse/pull/81629) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `delta-kernel-rs` v0.12.1 を使用するようにしました。 [#81707](https://github.com/ClickHouse/ClickHouse/pull/81707) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `c-ares` を `v1.34.5` に更新しました。 [#81159](https://github.com/ClickHouse/ClickHouse/pull/81159) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* CVE-2025-5025 と CVE-2025-4947 に対応するため、`curl` を 8.14 にアップグレード。 [#81171](https://github.com/ClickHouse/ClickHouse/pull/81171) ([larryluogit](https://github.com/larryluogit)).
* `libarchive` を 3.7.9 にアップグレードして、次の脆弱性に対処します: CVE-2024-20696 CVE-2025-25724 CVE-2024-48958 CVE-2024-57970 CVE-2025-1632 CVE-2024-48957 CVE-2024-48615。 [#81174](https://github.com/ClickHouse/ClickHouse/pull/81174) ([larryluogit](https://github.com/larryluogit))。
* `libxml2` を 2.14.3 にアップグレード。 [#81187](https://github.com/ClickHouse/ClickHouse/pull/81187) ([larryluogit](https://github.com/larryluogit))。
* ベンダリングされた Rust ソースコードを `CARGO_HOME` にコピーしないようにしました。 [#79560](https://github.com/ClickHouse/ClickHouse/pull/79560) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* 独自のエンドポイントに置き換えて、Sentryライブラリへの依存をなくしました。 [#80236](https://github.com/ClickHouse/ClickHouse/pull/80236) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Dependabot のアラートに対応するため、CI イメージ内の Python の依存関係を更新しました。 [#80658](https://github.com/ClickHouse/ClickHouse/pull/80658) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper に対してフォールトインジェクションが有効な場合にテストをより堅牢にするため、起動時に Keeper から複製 DDL の停止フラグを再読み取りするようにしました。 [#80964](https://github.com/ClickHouse/ClickHouse/pull/80964) ([Alexander Gololobov](https://github.com/davenger)).
* Ubuntu アーカイブの URL には HTTPS を使用するようにしました。[#81016](https://github.com/ClickHouse/ClickHouse/pull/81016) ([Raúl Marín](https://github.com/Algunenano)).
* テストイメージの Python 依存関係を更新。 [#81042](https://github.com/ClickHouse/ClickHouse/pull/81042) ([dependabot[bot]](https://github.com/apps/dependabot)).
* Nix ビルド用に `flake.nix` を導入。 [#81463](https://github.com/ClickHouse/ClickHouse/pull/81463) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* ビルド時にネットワークアクセスが必要だった `delta-kernel-rs` を修正。[#80609](https://github.com/ClickHouse/ClickHouse/issues/80609) をクローズ。[#81602](https://github.com/ClickHouse/ClickHouse/pull/81602)（[Konstantin Bogdanov](https://github.com/thevar1able)）。[A Year of Rust in ClickHouse](https://clickhouse.com/blog/rust) の記事も参照してください。

### ClickHouse リリース 25.5、2025-05-22 {#255}

#### 後方互換性のない変更 {#backward-incompatible-change}

* 関数 `geoToH3` は、他の幾何関数と同様に、入力を (lat, lon, res) の順序で受け取るようになりました。以前の引数の順序 (lon, lat, res) を維持したい場合は、設定 `geotoh3_argument_order = 'lon_lat'` を使用してください。[#78852](https://github.com/ClickHouse/ClickHouse/pull/78852)（[Pratima Patel](https://github.com/pratimapatel2008)）。
* ファイルシステムキャッシュの設定 `allow_dynamic_cache_resize` を追加しました。デフォルトは `false` で、この設定を `true` にするとファイルシステムキャッシュの動的リサイズを許可します。理由: 一部の環境（ClickHouse Cloud）では、すべてのスケーリングイベントがプロセスの再起動を通じて行われ、この機能を明示的に無効化して挙動をより細かく制御したいこと、また安全性の観点からです。この PR は後方互換性のない変更としてマークされています。以前のバージョンでは、特別な設定なしに動的キャッシュリサイズがデフォルトで有効だったためです。[#79148](https://github.com/ClickHouse/ClickHouse/pull/79148)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* レガシーインデックス型 `annoy` と `usearch` のサポートを削除しました。これらは長い間スタブであり、レガシーインデックスを使用しようとするあらゆる試みは常にエラーを返していました。まだ `annoy` や `usearch` インデックスを保持している場合は、削除してください。[#79802](https://github.com/ClickHouse/ClickHouse/pull/79802)（[Robert Schulze](https://github.com/rschu1ze)）。
* サーバー設定 `format_alter_commands_with_parentheses` を削除しました。この設定は 24.2 で導入され、デフォルトでは無効化されていました。25.2 でデフォルト有効になりました。新しいフォーマットをサポートしない LTS バージョンは存在しないため、この設定を削除できます。[#79970](https://github.com/ClickHouse/ClickHouse/pull/79970)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* `DeltaLake` ストレージの `delta-kernel-rs` 実装をデフォルトで有効化しました。[#79541](https://github.com/ClickHouse/ClickHouse/pull/79541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `URL` からの読み取りで複数回のリダイレクトが発生する場合、設定 `enable_url_encoding` がチェーン内のすべてのリダイレクトに対して正しく適用されるようになりました。[#79563](https://github.com/ClickHouse/ClickHouse/pull/79563)（[Shankar Iyer](https://github.com/shankar-iyer)）。設定 `enble_url_encoding` のデフォルト値は、現在 `false` に設定されています。[#80088](https://github.com/ClickHouse/ClickHouse/pull/80088)（[Shankar Iyer](https://github.com/shankar-iyer)）。

#### 新機能 {#new-feature}

* `WHERE` 句でのスカラー相関サブクエリをサポートしました。[#6697](https://github.com/ClickHouse/ClickHouse/issues/6697) がクローズされました。[#79600](https://github.com/ClickHouse/ClickHouse/pull/79600)（[Dmitry Novik](https://github.com/novikd)）。単純なケースでは、射影リスト内の相関サブクエリもサポートしました。[#79925](https://github.com/ClickHouse/ClickHouse/pull/79925)（[Dmitry Novik](https://github.com/novikd)）。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。これにより、TPC-H テストスイートを 100% カバーできるようになりました。
* ベクトル類似性インデックスを用いたベクトル検索が、これまでのexperimentalからbetaになりました。 [#80164](https://github.com/ClickHouse/ClickHouse/pull/80164) ([Robert Schulze](https://github.com/rschu1ze))。
* `Parquet` フォーマットで geo 型をサポートしました。これにより [#75317](https://github.com/ClickHouse/ClickHouse/issues/75317) がクローズされました。[#79777](https://github.com/ClickHouse/ClickHouse/pull/79777)（[scanhex12](https://github.com/scanhex12)）。
* インデックス作成および検索のための部分文字列抽出に用いる堅牢なアルゴリズムである「sparse-ngrams」を計算する新しい関数 `sparseGrams`、`sparseGramsHashes`、`sparseGramsHashesUTF8`、`sparseGramsUTF8` を追加。 [#79517](https://github.com/ClickHouse/ClickHouse/pull/79517) ([scanhex12](https://github.com/scanhex12)).
* `clickhouse-local`（およびその短縮エイリアスである `ch`）は、処理対象の入力データが存在する場合に、暗黙的な `FROM table` を使用するようになりました。これにより、[#65023](https://github.com/ClickHouse/ClickHouse/issues/65023) がクローズされました。また、通常のファイルを処理する際に `--input-format` が指定されていない場合、`clickhouse-local` でフォーマットの自動推論が有効になりました。[#79085](https://github.com/ClickHouse/ClickHouse/pull/79085)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ランダムまたは暗号化されている可能性のあるデータを検索するための `stringBytesUniq` 関数と `stringBytesEntropy` 関数を追加しました。 [#79350](https://github.com/ClickHouse/ClickHouse/pull/79350) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092))。
* Base32 のエンコードおよびデコードを行う関数を追加しました。 [#79809](https://github.com/ClickHouse/ClickHouse/pull/79809) ([Joanna Hulboj](https://github.com/jh0x)).
* `getServerSetting` と `getMergeTreeSetting` 関数を追加し、#78318 をクローズ。[#78439](https://github.com/ClickHouse/ClickHouse/pull/78439) ([NamNguyenHoai](https://github.com/NamHoaiNguyen))。
* 新しい `iceberg_enable_version_hint` 設定を追加し、`version-hint.text` ファイルを利用できるようにしました。 [#78594](https://github.com/ClickHouse/ClickHouse/pull/78594) ([Arnaud Briche](https://github.com/arnaudbriche)).
* `LIKE` キーワードでフィルタして、データベース内の特定のテーブルだけを TRUNCATE できるようになりました。 [#78597](https://github.com/ClickHouse/ClickHouse/pull/78597) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* `MergeTree` ファミリーのテーブルで `_part_starting_offset` 仮想カラムをサポートしました。このカラムは、現在のパート一覧に基づきクエリ実行時に計算される、先行するすべてのパートの累積行数を表します。累積値はクエリ実行全体を通して保持され、パートのプルーニング後でも有効なままです。この挙動をサポートするため、関連する内部ロジックをリファクタリングしました。 [#79417](https://github.com/ClickHouse/ClickHouse/pull/79417) ([Amos Bird](https://github.com/amosbird)).
* 右側の引数がゼロの場合に NULL を返すようにするため、`divideOrNull`、`moduloOrNull`、`intDivOrNull`、`positiveModuloOrNull` 関数を追加しました。 [#78276](https://github.com/ClickHouse/ClickHouse/pull/78276) ([kevinyhzou](https://github.com/KevinyhZou)).
* ClickHouse のベクター検索は、プレフィルタリングとポストフィルタリングの両方をサポートし、よりきめ細かな制御のための関連設定も提供します (issue [#78161](https://github.com/ClickHouse/ClickHouse/issues/78161)). [#79854](https://github.com/ClickHouse/ClickHouse/pull/79854) ([Shankar Iyer](https://github.com/shankar-iyer)).
* [`icebergHash`](https://iceberg.apache.org/spec/#appendix-b-32-bit-hash-requirements) 関数と [`icebergBucket`](https://iceberg.apache.org/spec/#bucket-transform-details) 関数を追加しました。[`bucket transfom`](https://iceberg.apache.org/spec/#partitioning) でパーティション分割された `Iceberg` テーブルにおけるデータファイルのプルーニングに対応しました。[#79262](https://github.com/ClickHouse/ClickHouse/pull/79262) ([Daniil Ivanik](https://github.com/divanik))。

#### 実験的機能 {#experimental-feature}

* 新しい `Time` / `Time64` データ型：`Time` (HHH:MM:SS) および `Time64` (HHH:MM:SS.`<fractional>`) と、基本的なキャスト関数および他のデータ型と相互作用するための関数を追加しました。また、既存の関数名 `toTime` を `toTimeWithFixedDate` に変更しました。これは、キャスト関数で `toTime` 関数が必要となるためです。 [#75735](https://github.com/ClickHouse/ClickHouse/pull/75735) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Iceberg データレイク向けの Hive metastore カタログを追加しました。 [#77677](https://github.com/ClickHouse/ClickHouse/pull/77677) ([scanhex12](https://github.com/scanhex12)).
* `full_text` 型のインデックスは `gin` に改名されました。これは PostgreSQL および他のデータベースでより一般的な用語に合わせたものです。既存の `full_text` 型インデックスは引き続き読み込み可能ですが、検索で使用しようとすると例外がスローされ（その際に代わりに `gin` インデックスを提案します）、使用できなくなります。 [#79024](https://github.com/ClickHouse/ClickHouse/pull/79024) ([Robert Schulze](https://github.com/rschu1ze)).

#### パフォーマンスの向上 {#performance-improvement}

* Compact パーツ形式を変更し、各サブストリームごとにマークを保存して個々のサブカラムを読み取れるようにしました。従来の Compact 形式は読み取りでは引き続きサポートされており、MergeTree 設定 `write_marks_for_substreams_in_compact_parts` を使用することで書き込みにも有効化できます。Compact パーツのストレージ仕様が変更されるため、より安全にアップグレードできるよう、デフォルトでは無効になっています。今後のいずれかのリリースでデフォルトで有効になる予定です。 [#77940](https://github.com/ClickHouse/ClickHouse/pull/77940) ([Pavel Kruglov](https://github.com/Avogar)).
* サブカラムを含む条件を `prewhere` に移動できるようにしました。 [#79489](https://github.com/ClickHouse/ClickHouse/pull/79489) ([Pavel Kruglov](https://github.com/Avogar)).
* 複数のグラニュールをまとめて対象に式を評価することで、セカンダリインデックスの処理を高速化しました。 [#64109](https://github.com/ClickHouse/ClickHouse/pull/64109) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `compile_expressions`（通常の式の一部に対する JIT コンパイラ）をデフォルトで有効化しました。これにより [#51264](https://github.com/ClickHouse/ClickHouse/issues/51264) と [#56386](https://github.com/ClickHouse/ClickHouse/issues/56386) および [#66486](https://github.com/ClickHouse/ClickHouse/issues/66486) がクローズされました。[#79907](https://github.com/ClickHouse/ClickHouse/pull/79907)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 新しい設定 `use_skip_indexes_in_final_exact_mode` が導入されました。`ReplacingMergeTree` テーブルに対するクエリで FINAL 句が指定されている場合、スキップインデックスに基づいてテーブル範囲のみを読み取ると、誤った結果が返される可能性があります。この設定を有効にすると、スキップインデックスで返された主キー範囲と重複する新しいパーツを走査することで、正しい結果が返されるようにできます。無効にするには 0、有効にするには 1 を設定します。 [#78350](https://github.com/ClickHouse/ClickHouse/pull/78350)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* オブジェクトストレージクラスターのテーブル関数（例: `s3Cluster`）は、キャッシュローカリティを改善するため、コンシステントハッシュに基づいて読み取り用のファイルをレプリカに割り当てるようになりました。 [#77326](https://github.com/ClickHouse/ClickHouse/pull/77326) ([Andrej Hoos](https://github.com/adikus))
* `S3Queue`/`AzureQueue` のパフォーマンスを、`INSERT` を並列に実行できるようにすることで改善しました（キュー設定で `parallel_inserts=true` を有効化すると利用可能）。これまでは S3Queue/AzureQueue はパイプラインの前半（ダウンロード、パース）のみ並列実行でき、`INSERT` は単一スレッドでした。また、`INSERT` がボトルネックとなることがほとんどです。今回の変更により、`processing_threads_num` に対してほぼ線形にスケールするようになりました。 [#77671](https://github.com/ClickHouse/ClickHouse/pull/77671)（[Azat Khuzhin](https://github.com/azat)）。S3Queue/AzureQueue における `max_processed_files_before_commit` の扱いが、より公平になるよう改善しました。 [#79363](https://github.com/ClickHouse/ClickHouse/pull/79363)（[Azat Khuzhin](https://github.com/azat)）。
* 右側テーブルのサイズが閾値未満の場合に `hash` アルゴリズムへフォールバックするための閾値（`parallel_hash_join_threshold` 設定で調整可能）を導入しました。 [#76185](https://github.com/ClickHouse/ClickHouse/pull/76185) ([Nikita Taranov](https://github.com/nickitat)).
* 並列レプリカを有効にした読み取りでは、タスクの大きさを決定する際にレプリカ数を使用するようになりました。これにより、読み取るデータ量がそれほど大きくない場合でも、レプリカ間の処理負荷の分散が改善されます。 [#78695](https://github.com/ClickHouse/ClickHouse/pull/78695) ([Nikita Taranov](https://github.com/nickitat)).
* 分散集約の最終段階で `uniqExact` 状態を並列にマージできるようにしました。 [#78703](https://github.com/ClickHouse/ClickHouse/pull/78703) ([Nikita Taranov](https://github.com/nickitat)).
* キー付き集約における `uniqExact` 状態の並列マージ時に発生しうるパフォーマンス低下を修正。 [#78724](https://github.com/ClickHouse/ClickHouse/pull/78724) ([Nikita Taranov](https://github.com/nickitat)).
* Azure Storage への List Blobs API 呼び出し回数を削減しました。 [#78860](https://github.com/ClickHouse/ClickHouse/pull/78860) ([Julia Kartseva](https://github.com/jkartseva)).
* 分散 INSERT SELECT の並列レプリカ使用時のパフォーマンスを改善。 [#79441](https://github.com/ClickHouse/ClickHouse/pull/79441) ([Azat Khuzhin](https://github.com/azat)).
* 高い並行性の環境においてロック競合と性能劣化を避けるため、`LogSeriesLimiter` がコンストラクタ呼び出しのたびにクリーンアップを実行しないようにしました。 [#79864](https://github.com/ClickHouse/ClickHouse/pull/79864) ([filimonov](https://github.com/filimonov)).
* 単純な count 最適化によりクエリの実行を高速化しました。 [#79945](https://github.com/ClickHouse/ClickHouse/pull/79945) ([Raúl Marín](https://github.com/Algunenano)).
* `Decimal` を使用する一部の演算のインライン化を改善しました。 [#79999](https://github.com/ClickHouse/ClickHouse/pull/79999) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `input_format_parquet_bloom_filter_push_down` をデフォルトで true に設定しました。また、設定変更履歴の誤りを修正しました。[#80058](https://github.com/ClickHouse/ClickHouse/pull/80058) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* すべての行を削除すべきパーツに対する `ALTER ... DELETE` ミューテーションを最適化しました。これにより、そのような場合にはミューテーションを実行せず、元のパーツを作り直す代わりに空のパーツが作成されるようになりました。 [#79307](https://github.com/ClickHouse/ClickHouse/pull/79307) ([Anton Popov](https://github.com/CurtizJ)).
* 可能な場合には、Compact パートへの挿入時にブロックの余分なコピーを行わないようにしました。 [#79536](https://github.com/ClickHouse/ClickHouse/pull/79536) ([Pavel Kruglov](https://github.com/Avogar)).
* `input_format_max_block_size_bytes` 設定を追加し、入力フォーマットで作成されるブロックをバイト単位で制限できるようにしました。これにより、行に大きな値が含まれるデータをインポートする際の過剰なメモリ使用量を回避するのに役立ちます。 [#79495](https://github.com/ClickHouse/ClickHouse/pull/79495) ([Pavel Kruglov](https://github.com/Avogar))。
* スレッドおよび async&#95;socket&#95;for&#95;remote/use&#95;hedge&#95;requests のガードページを削除しました。`FiberStack` におけるアロケーション方式を `mmap` から `aligned_alloc` に変更しました。これは VMA を分割し、高負荷時には vm.max&#95;map&#95;count の上限に達する可能性があるためです。[#79147](https://github.com/ClickHouse/ClickHouse/pull/79147)（[Sema Checherinda](https://github.com/CheSema)）。
* 並列レプリカにおける遅延マテリアライゼーション。 [#79401](https://github.com/ClickHouse/ClickHouse/pull/79401) ([Igor Nikonov](https://github.com/devcrafter)).

#### 改善点 {#improvement}

* `lightweight_deletes_sync = 0` および `apply_mutations_on_fly = 1` の設定により、軽量削除をオンザフライで適用できるようにしました。 [#79281](https://github.com/ClickHouse/ClickHouse/pull/79281) ([Anton Popov](https://github.com/CurtizJ)).
* ターミナルにpretty形式でデータが表示されており、その後続のブロックが同じ列幅を持つ場合、カーソルを上方向に移動して前のブロックに連結し、前のブロックから連続して表示できます。これにより [#79333](https://github.com/ClickHouse/ClickHouse/issues/79333) が解決されました。この機能は新しい設定 `output_format_pretty_glue_chunks` によって制御されます。 [#79339](https://github.com/ClickHouse/ClickHouse/pull/79339) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `isIPAddressInRange` 関数を拡張し、`String`、`IPv4`、`IPv6`、`Nullable(String)`、`Nullable(IPv4)`、`Nullable(IPv6)` データ型をサポート。 [#78364](https://github.com/ClickHouse/ClickHouse/pull/78364) ([YjyJeff](https://github.com/YjyJeff)).
* `PostgreSQL` エンジンの接続プール設定を動的に変更できるようになりました。 [#78414](https://github.com/ClickHouse/ClickHouse/pull/78414) ([Samay Sharma](https://github.com/samay-sharma)).
* 通常のプロジェクションにおいて `_part_offset` を指定できるようにしました。これはプロジェクションインデックスを構築するための第一歩です。[#58224](https://github.com/ClickHouse/ClickHouse/issues/58224) と組み合わせて利用でき、#63207 の改善にも役立ちます。 [#78429](https://github.com/ClickHouse/ClickHouse/pull/78429) ([Amos Bird](https://github.com/amosbird))。
* `system.named_collections` に新しいカラム（`create_query` と `source`）を追加しました。 [#78179](https://github.com/ClickHouse/ClickHouse/issues/78179) をクローズしました。 [#78582](https://github.com/ClickHouse/ClickHouse/pull/78582)（[MikhailBurdukov](https://github.com/MikhailBurdukov)）。
* システムテーブル `system.query_condition_cache` に新しいフィールド `condition` を追加しました。クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件を保存します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze)).
* `BFloat16` 型の列に対してベクトル類似インデックスを作成できるようになりました。 [#78850](https://github.com/ClickHouse/ClickHouse/pull/78850) ([Robert Schulze](https://github.com/rschu1ze)).
* 小数部を含む Unixタイムスタンプを、`DateTime64` のベストエフォート解析でサポートするようにしました。 [#78908](https://github.com/ClickHouse/ClickHouse/pull/78908) ([Pavel Kruglov](https://github.com/Avogar))。
* ストレージ `DeltaLake` の delta-kernel 実装において、カラムマッピングモードを修正し、スキーマエボリューション用のテストを追加しました。 [#78921](https://github.com/ClickHouse/ClickHouse/pull/78921) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `Values` フォーマットでの `Variant` 列への挿入時の値変換を改善しました。 [#78923](https://github.com/ClickHouse/ClickHouse/pull/78923) ([Pavel Kruglov](https://github.com/Avogar)).
* `tokens` 関数が拡張され、追加の `tokenizer` 引数およびさらに tokenizer 固有の引数を受け取れるようになりました。 [#79001](https://github.com/ClickHouse/ClickHouse/pull/79001) ([Elmi Ahmadov](https://github.com/ahmadov))。
* `SHOW CLUSTER` ステートメントは、引数内に含まれるマクロがあればそれらを展開するようになりました。 [#79006](https://github.com/ClickHouse/ClickHouse/pull/79006) ([arf42](https://github.com/arf42))。
* ハッシュ関数が、配列、タプル、およびマップ内の `NULL` をサポートするようになりました（issues [#48365](https://github.com/ClickHouse/ClickHouse/issues/48365) および [#48623](https://github.com/ClickHouse/ClickHouse/issues/48623)）。[#79008](https://github.com/ClickHouse/ClickHouse/pull/79008)（[Michael Kolupaev](https://github.com/al13n321)）。
* cctz を 2025a に更新しました。 [#79043](https://github.com/ClickHouse/ClickHouse/pull/79043) ([Raúl Marín](https://github.com/Algunenano)).
* UDF のデフォルト stderr 処理を &quot;log&#95;last&quot; に変更しました。ユーザビリティが向上します。 [#79066](https://github.com/ClickHouse/ClickHouse/pull/79066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Web UI でタブ操作を元に戻せるようにしました。これにより [#71284](https://github.com/ClickHouse/ClickHouse/issues/71284) がクローズされました。[#79084](https://github.com/ClickHouse/ClickHouse/pull/79084)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `recoverLostReplica` 中で設定を削除するようにしました。実装は次の対応と同様です: [https://github.com/ClickHouse/ClickHouse/pull/78637](https://github.com/ClickHouse/ClickHouse/pull/78637)。 [#79113](https://github.com/ClickHouse/ClickHouse/pull/79113) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。
* プロファイルイベント `ParquetReadRowGroups` および `ParquetPrunedRowGroups` を追加し、Parquet インデックスのプルーニング処理をプロファイリングできるようにしました。 [#79180](https://github.com/ClickHouse/ClickHouse/pull/79180) ([flynn](https://github.com/ucasfl)).
* クラスター上のデータベースに対する `ALTER` をサポート。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `QueryMetricLog` の統計収集で、実行されずに取り逃した回を明示的にスキップするようにし、そうしない場合にログが現在時刻に追いつくまで長時間かかってしまう問題を防ぎます。 [#79257](https://github.com/ClickHouse/ClickHouse/pull/79257) ([Mikhail Artemenko](https://github.com/Michicosun)).
* `Arrow` ベースのフォーマットの読み取りに関する軽微な最適化を行いました。[#79308](https://github.com/ClickHouse/ClickHouse/pull/79308) ([Bharat Nallan](https://github.com/bharatnc))。
* 設定 `allow_archive_path_syntax` は誤って experimental とマークされていました。experimental な設定がデフォルトで有効にならないことを保証するテストを追加しました。 [#79320](https://github.com/ClickHouse/ClickHouse/pull/79320) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ページキャッシュ設定をクエリ単位で調整可能にしました。これにより、高スループットかつ低レイテンシーなクエリ向けに微調整したり、より高速に実験できるようになります。 [#79337](https://github.com/ClickHouse/ClickHouse/pull/79337) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 典型的な 64 ビットハッシュのように見える数値については、見栄えの良い形式で数値ツールチップを表示しないようにしました。これにより [#79334](https://github.com/ClickHouse/ClickHouse/issues/79334) がクローズされました。[#79338](https://github.com/ClickHouse/ClickHouse/pull/79338)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 高度なダッシュボードのグラフの色は、対応するクエリのハッシュから計算されます。これにより、ダッシュボードをスクロールしているときでも、グラフを記憶し、見つけやすくなります。 [#79341](https://github.com/ClickHouse/ClickHouse/pull/79341) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 非同期メトリクスである `FilesystemCacheCapacity` を追加しました。これは `cache` 仮想ファイルシステムの総容量を表し、グローバルなインフラストラクチャ監視に役立ちます。 [#79348](https://github.com/ClickHouse/ClickHouse/pull/79348) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* system.parts へのアクセスを最適化し、要求された場合にのみ列/インデックスのサイズを読み取るようにした。 [#79352](https://github.com/ClickHouse/ClickHouse/pull/79352) ([Azat Khuzhin](https://github.com/azat)).
* クエリ `SHOW CLUSTER <name>` に対して、すべてのフィールドではなく必要なフィールドのみを計算するようにしました。 [#79368](https://github.com/ClickHouse/ClickHouse/pull/79368) ([Tuan Pham Anh](https://github.com/tuanpach)).
* `DatabaseCatalog` のストレージ設定を指定できるようにしました。 [#79407](https://github.com/ClickHouse/ClickHouse/pull/79407) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `DeltaLake` でローカルストレージをサポートしました。 [#79416](https://github.com/ClickHouse/ClickHouse/pull/79416) ([Kseniia Sumarokova](https://github.com/kssenii)).
* delta-kernel-rs を有効化するためのクエリレベル設定 `allow_experimental_delta_kernel_rs` を追加しました。 [#79418](https://github.com/ClickHouse/ClickHouse/pull/79418) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure/S3 BLOB ストレージからの BLOB 一覧取得時に発生しうる無限ループを修正。 [#79425](https://github.com/ClickHouse/ClickHouse/pull/79425) ([Alexander Gololobov](https://github.com/davenger))。
* ファイルシステムキャッシュの設定 `max_size_ratio_to_total_space` を追加しました。 [#79460](https://github.com/ClickHouse/ClickHouse/pull/79460) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `clickhouse-benchmark` について、再接続の挙動に応じて `reconnect` オプションに 0、1、または N を指定できるように変更しました。 [#79465](https://github.com/ClickHouse/ClickHouse/pull/79465) ([Sachin Kumar Singh](https://github.com/sachinkumarsingh092)).
* 異なる `plain_rewritable` ディスク上にあるテーブルに対して `ALTER TABLE ... MOVE|REPLACE PARTITION` を実行できるようにしました。 [#79566](https://github.com/ClickHouse/ClickHouse/pull/79566) ([Julia Kartseva](https://github.com/jkartseva)).
* 参照ベクトルが `Array(BFloat16)` 型の場合にも、ベクトル類似度インデックスが使用されるようになりました。 [#79745](https://github.com/ClickHouse/ClickHouse/pull/79745) ([Shankar Iyer](https://github.com/shankar-iyer)).
* last&#95;error&#95;message、last&#95;error&#95;trace、および query&#95;id を system.error&#95;log テーブルに追加しました。関連チケット [#75816](https://github.com/ClickHouse/ClickHouse/issues/75816)。[#79836](https://github.com/ClickHouse/ClickHouse/pull/79836)（[Andrei Tinikov](https://github.com/Dolso)）。
* クラッシュレポートの送信をデフォルトで有効にしました。サーバーの設定ファイルで無効化できます。 [#79838](https://github.com/ClickHouse/ClickHouse/pull/79838) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* システムテーブル `system.functions` に、各関数が最初に導入された ClickHouse バージョンが表示されるようになりました。[#79839](https://github.com/ClickHouse/ClickHouse/pull/79839) ([Robert Schulze](https://github.com/rschu1ze)).
* `access_control_improvements.enable_user_name_access_type` 設定を追加しました。この設定により、[https://github.com/ClickHouse/ClickHouse/pull/72246](https://github.com/ClickHouse/ClickHouse/pull/72246) で導入されたユーザー／ロールに対する厳密な権限付与を有効／無効にできます。25.1 より古いバージョンのレプリカを含むクラスタを使用している場合は、この設定をオフにすることを検討してください。[#79842](https://github.com/ClickHouse/ClickHouse/pull/79842)（[pufit](https://github.com/pufit)）。
* `ASTSelectWithUnionQuery::clone()` メソッドの適切な実装では、`is_normalized` フィールドも考慮するようになりました。これにより、[#77569](https://github.com/ClickHouse/ClickHouse/issues/77569) の解決に役立つ可能性があります。[#79909](https://github.com/ClickHouse/ClickHouse/pull/79909)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `EXCEPT` 演算子を含む一部クエリの書式の不整合を修正しました。`EXCEPT` 演算子の左辺が `*` で終わる場合、整形後のクエリから括弧が失われ、その結果、`EXCEPT` 修飾子付きの `*` としてパースされていました。これらのクエリは fuzzer によって検出されたもので、実際の利用環境で見つかる可能性は低いと考えられます。この変更により [#79950](https://github.com/ClickHouse/ClickHouse/issues/79950) がクローズされました。[#79952](https://github.com/ClickHouse/ClickHouse/pull/79952)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* バリアントのデシリアライズ順序をキャッシュすることで、`JSON` 型のパースをわずかに改善しました。 [#79984](https://github.com/ClickHouse/ClickHouse/pull/79984) ([Pavel Kruglov](https://github.com/Avogar))
* 設定 `s3_slow_all_threads_after_network_error` を追加しました。 [#80035](https://github.com/ClickHouse/ClickHouse/pull/80035) ([Vitaly Baranov](https://github.com/vitlibar)).
* 選択されたマージ対象パーツに関するログレベルが誤っていました（Information）。[#80061](https://github.com/ClickHouse/ClickHouse/issues/80061) をクローズ。[#80062](https://github.com/ClickHouse/ClickHouse/pull/80062)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* trace-visualizer: ツールチップおよびステータスメッセージに runtime/share を追加。 [#79040](https://github.com/ClickHouse/ClickHouse/pull/79040) ([Sergei Trifonov](https://github.com/serxa)).
* trace-visualizer: ClickHouse サーバーからデータを読み込めるようにしました。 [#79042](https://github.com/ClickHouse/ClickHouse/pull/79042) ([Sergei Trifonov](https://github.com/serxa)).
* 失敗したマージに関するメトリクスを追加しました。 [#79228](https://github.com/ClickHouse/ClickHouse/pull/79228) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* `clickhouse-benchmark` は、最大イテレーション数が指定されている場合、その値に基づいて割合を表示します。 [#79346](https://github.com/ClickHouse/ClickHouse/pull/79346) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* system.parts テーブル用のビジュアライザーを追加。 [#79437](https://github.com/ClickHouse/ClickHouse/pull/79437) ([Sergei Trifonov](https://github.com/serxa)).
* クエリレイテンシーを分析するためのツールを追加。 [#79978](https://github.com/ClickHouse/ClickHouse/pull/79978) ([Sergei Trifonov](https://github.com/serxa)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* データパーツ内で欠落しているカラムのリネーム処理を修正しました。 [#76346](https://github.com/ClickHouse/ClickHouse/pull/76346) ([Anton Popov](https://github.com/CurtizJ)).
* マテリアライズドビューの開始タイミングが遅くなり、例えばそれにストリームを送っている Kafka テーブルより後に開始されてしまうことがありました。 [#72123](https://github.com/ClickHouse/ClickHouse/pull/72123) ([Ilya Golshtein](https://github.com/ilejn)).
* analyzer 有効化時の `VIEW` 作成における `SELECT` クエリの書き換えを修正。[#75956](https://github.com/ClickHouse/ClickHouse/issues/75956) をクローズ。[#76356](https://github.com/ClickHouse/ClickHouse/pull/76356)（[Dmitry Novik](https://github.com/novikd)）。
* サーバー側から（`apply_settings_from_server` 経由で）`async_insert` を適用する処理を修正しました（以前はクライアント側で `Unknown packet 11 from server` エラーを引き起こしていました）。 [#77578](https://github.com/ClickHouse/ClickHouse/pull/77578) ([Azat Khuzhin](https://github.com/azat)).
* Replicated データベースにおいて、新しく追加されたレプリカで refresh 可能なマテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* バックアップが壊れる原因となっていたリフレッシュ可能なマテリアライズドビューを修正。 [#77893](https://github.com/ClickHouse/ClickHouse/pull/77893) ([Michael Kolupaev](https://github.com/al13n321)).
* `transform` の旧発火ロジックにおける論理エラーを修正。 [#78247](https://github.com/ClickHouse/ClickHouse/pull/78247) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* アナライザー使用時にセカンダリインデックスが適用されない場合があった問題を修正しました。[#65607](https://github.com/ClickHouse/ClickHouse/issues/65607) および [#69373](https://github.com/ClickHouse/ClickHouse/issues/69373) を修正しました。[#78485](https://github.com/ClickHouse/ClickHouse/pull/78485)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* HTTP プロトコルで圧縮が有効な場合のプロファイルイベント（`NetworkSendElapsedMicroseconds`/`NetworkSendBytes`）のダンプ処理を修正しました（誤差はバッファサイズ、通常は約 1MiB を超えないはずです）。 [#78516](https://github.com/ClickHouse/ClickHouse/pull/78516) ([Azat Khuzhin](https://github.com/azat)).
* JOIN ... USING が ALIAS 列を含む場合に LOGICAL&#95;ERROR を発生させていたアナライザーを修正し、適切なエラーを返すようにしました。 [#78618](https://github.com/ClickHouse/ClickHouse/pull/78618) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* アナライザーを修正: SELECT 文に位置指定引数が含まれていると CREATE VIEW ... ON CLUSTER が失敗する問題を修正。 [#78663](https://github.com/ClickHouse/ClickHouse/pull/78663) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `SELECT` にスカラーサブクエリが含まれている場合に、スキーマ推論を行うテーブル関数に対する `INSERT SELECT` で発生する `Block structure mismatch` エラーを修正。 [#78677](https://github.com/ClickHouse/ClickHouse/pull/78677) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* アナライザを修正: Distributed テーブルに対する SELECT クエリで設定 prefer&#95;global&#95;in&#95;and&#95;join=1 が有効な場合、SELECT クエリ内の `in` 関数が `globalIn` に置き換えられるようにしました。 [#78749](https://github.com/ClickHouse/ClickHouse/pull/78749) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `MongoDB` エンジンまたは `mongodb` テーブル関数を使用するテーブルからデータを読み取る、複数の種類の `SELECT` クエリを修正しました。具体的には、`WHERE` 句内での定数値の暗黙的な型変換を伴うクエリ（例: `WHERE datetime = '2025-03-10 00:00:00'`）、および `LIMIT` と `GROUP BY` を含むクエリです。以前は、これらのクエリで誤った結果が返されることがありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* 異なる JSON 型間の変換を修正しました。現在は、String への／からの変換を経由して単純にキャストすることで実行されます。効率は低下しますが、結果は常に正確です。 [#78807](https://github.com/ClickHouse/ClickHouse/pull/78807) ([Pavel Kruglov](https://github.com/Avogar)).
* Dynamic 型を Interval へ変換する際に発生していた論理エラーを修正しました。 [#78813](https://github.com/ClickHouse/ClickHouse/pull/78813) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON パースエラー時のカラムのロールバック処理を修正。 [#78836](https://github.com/ClickHouse/ClickHouse/pull/78836) ([Pavel Kruglov](https://github.com/Avogar)).
* 定数エイリアス列を使用した JOIN 時に発生する「bad cast」エラーを修正。 [#78848](https://github.com/ClickHouse/ClickHouse/pull/78848) ([Vladimir Cherkasov](https://github.com/vdimir)).
* ビューとターゲットテーブルで列の型が異なる場合、その列に対するマテリアライズドビューでの prewhere 句を許可しないようにしました。 [#78889](https://github.com/ClickHouse/ClickHouse/pull/78889) ([Pavel Kruglov](https://github.com/Avogar)).
* Variant 列の不正なバイナリデータをパースする際に発生する論理エラーを修正。 [#78982](https://github.com/ClickHouse/ClickHouse/pull/78982) ([Pavel Kruglov](https://github.com/Avogar)).
* Parquet バッチサイズが 0 に設定されている場合に例外をスローするようにしました。以前は `output_format_parquet_batch_size = 0` のときに ClickHouse がハングしていましたが、この問題は修正されました。 [#78991](https://github.com/ClickHouse/ClickHouse/pull/78991) ([daryawessely](https://github.com/daryawessely)).
* コンパクトパーツの基本フォーマットにおける variant discriminator のデシリアライズ処理を修正しました。この問題は [https://github.com/ClickHouse/ClickHouse/pull/55518](https://github.com/ClickHouse/ClickHouse/pull/55518) で導入されました。[#79000](https://github.com/ClickHouse/ClickHouse/pull/79000)（[Pavel Kruglov](https://github.com/Avogar)）。
* `complex_key_ssd_cache` タイプの辞書は、`block_size` および `write_buffer_size` パラメータが 0 または負の値である場合、それらのパラメータを拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#79028](https://github.com/ClickHouse/ClickHouse/pull/79028)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* SummingMergeTree で非集約カラムに Field を使用するのは避けてください。SummingMergeTree で使用される Dynamic/Variant 型で予期しないエラーが発生する可能性があります。 [#79051](https://github.com/ClickHouse/ClickHouse/pull/79051) ([Pavel Kruglov](https://github.com/Avogar)).
* analyzer においてヘッダーが異なる場合に、Distributed 宛先テーブルを持つマテリアライズドビューからの読み取りが正しく行われない問題を修正しました。 [#79059](https://github.com/ClickHouse/ClickHouse/pull/79059) ([Pavel Kruglov](https://github.com/Avogar)).
* バッチ挿入が行われるテーブルにおいて、`arrayUnion()` が余分な（誤った）値を返していたバグを修正しました。[#75057](https://github.com/ClickHouse/ClickHouse/issues/75057) の問題を修正しました。[#79079](https://github.com/ClickHouse/ClickHouse/pull/79079)（[Peter Nguyen](https://github.com/petern48)）。
* `OpenSSLInitializer` で発生していたセグメンテーションフォルトを修正。[#79092](https://github.com/ClickHouse/ClickHouse/issues/79092) をクローズ。[#79097](https://github.com/ClickHouse/ClickHouse/pull/79097)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* S3 の ListObject に対しては常に prefix を設定するようにしました。 [#79114](https://github.com/ClickHouse/ClickHouse/pull/79114) ([Azat Khuzhin](https://github.com/azat)).
* バッチ挿入を行うテーブルで、arrayUnion() が余分な（誤った）値を返すバグを修正しました。[#79157](https://github.com/ClickHouse/ClickHouse/issues/79157) を修正します。[#79158](https://github.com/ClickHouse/ClickHouse/pull/79158)（[Peter Nguyen](https://github.com/petern48)）。
* フィルタープッシュダウン後に発生する論理エラーを修正。 [#79164](https://github.com/ClickHouse/ClickHouse/pull/79164) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* HTTP ベースのエンドポイントで使用される delta-kernel 実装向けの DeltaLake テーブルエンジンを修正し、NOSIGN を修正しました。Closes [#78124](https://github.com/ClickHouse/ClickHouse/issues/78124). [#79203](https://github.com/ClickHouse/ClickHouse/pull/79203) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Keeper の修正: 失敗した multi リクエストで watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* `IN` での Dynamic 型および JSON 型の使用を禁止しました。`IN` の現在の実装では、これらを使用すると誤った結果につながる可能性があります。`IN` でこれらの型を正しくサポートすることは複雑であり、将来的に対応される可能性があります。 [#79282](https://github.com/ClickHouse/ClickHouse/pull/79282) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON 型のパース時における重複パスのチェックを修正。 [#79317](https://github.com/ClickHouse/ClickHouse/pull/79317) ([Pavel Kruglov](https://github.com/Avogar)).
* SecureStreamSocket の接続に関する問題を修正。 [#79383](https://github.com/ClickHouse/ClickHouse/pull/79383) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* plain&#95;rewritable ディスク上のデータの読み込みを修正。 [#79439](https://github.com/ClickHouse/ClickHouse/pull/79439) ([Julia Kartseva](https://github.com/jkartseva)).
* MergeTree の Wide パーツにおける動的サブカラム検出時に発生していたクラッシュを修正しました。 [#79466](https://github.com/ClickHouse/ClickHouse/pull/79466) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル名の長さは、テーブルを初めて作成するクエリに対してのみ検証します。後方互換性の問題を避けるため、2回目以降の作成では検証しません。 [#79488](https://github.com/ClickHouse/ClickHouse/pull/79488) ([Miсhael Stetsyuk](https://github.com/mstetsyuk)).
* スパースカラムを含むテーブルにおいて、いくつかのケースで発生していたエラー `Block structure mismatch` を修正しました。 [#79491](https://github.com/ClickHouse/ClickHouse/pull/79491) ([Anton Popov](https://github.com/CurtizJ)).
* 「Logical Error: Can&#39;t set alias of * of Asterisk on alias」が発生する2つのケースを修正します。[#79505](https://github.com/ClickHouse/ClickHouse/pull/79505) ([Raúl Marín](https://github.com/Algunenano)).
* Atomic データベースの名前変更時に誤ったパスが使用される問題を修正。 [#79569](https://github.com/ClickHouse/ClickHouse/pull/79569) ([Tuan Pham Anh](https://github.com/tuanpach)).
* JSON列と他の列を組み合わせた ORDER BY の問題を修正しました。[#79591](https://github.com/ClickHouse/ClickHouse/pull/79591) ([Pavel Kruglov](https://github.com/Avogar))。
* `use_hedged_requests` と `allow_experimental_parallel_reading_from_replicas` の両方が無効な場合に、リモート読み取り時に結果が重複する問題を修正しました。 [#79599](https://github.com/ClickHouse/ClickHouse/pull/79599) ([Eduard Karacharov](https://github.com/korowa)).
* Unity Catalog 使用時に delta-kernel 実装がクラッシュする問題を修正。 [#79677](https://github.com/ClickHouse/ClickHouse/pull/79677) ([Kseniia Sumarokova](https://github.com/kssenii)).
* autodiscovery クラスター用のマクロを解決するようにしました。 [#79696](https://github.com/ClickHouse/ClickHouse/pull/79696) ([Anton Ivashkin](https://github.com/ianton-ru)).
* 不正に設定された `page_cache_limits` を適切に扱うようにしました。 [#79805](https://github.com/ClickHouse/ClickHouse/pull/79805) ([Bharat Nallan](https://github.com/bharatnc)).
* SQL 関数 `formatDateTime` で、長さが可変のフォーマッタ（例: `%W`、曜日 `Monday` `Tuesday` など）の直後に、複合フォーマッタ（複数の要素を一度に出力するフォーマッタ。例: `%D`、米国形式の日付 `05/04/25` など）が指定された場合の結果を修正しました。 [#79835](https://github.com/ClickHouse/ClickHouse/pull/79835) ([Robert Schulze](https://github.com/rschu1ze)).
* IcebergS3 は count の最適化をサポートしていますが、IcebergS3Cluster はサポートしていません。そのため、クラスターモードで返される count() の結果が、レプリカ数を掛けた値になる場合があります。 [#79844](https://github.com/ClickHouse/ClickHouse/pull/79844) ([wxybear](https://github.com/wxybear)).
* クエリの実行で投影段階まで列が一切使用されない場合の遅延マテリアライゼーションにおいて発生する AMBIGUOUS&#95;COLUMN&#95;NAME エラーを修正しました。例: SELECT * FROM t ORDER BY rand() LIMIT 5。 [#79926](https://github.com/ClickHouse/ClickHouse/pull/79926) ([Igor Nikonov](https://github.com/devcrafter))。
* クエリ `CREATE DATABASE datalake ENGINE = DataLakeCatalog(\'http://catalog:8181\', \'admin\', \'password\')` 内のパスワードを非表示にしました。 [#79941](https://github.com/ClickHouse/ClickHouse/pull/79941) ([Han Fei](https://github.com/hanfei1991)).
* JOIN USING でエイリアスを指定できるようにしました。列名が変更された場合（たとえば ARRAY JOIN の結果として）に、このエイリアスを指定します。[#73707](https://github.com/ClickHouse/ClickHouse/issues/73707) を修正しました。[#79942](https://github.com/ClickHouse/ClickHouse/pull/79942)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* UNION を含むマテリアライズドビューが新しいレプリカでも正しく動作するようにしました。 [#80037](https://github.com/ClickHouse/ClickHouse/pull/80037) ([Samay Sharma](https://github.com/samay-sharma)).
* SQL 関数 `parseDateTime` の書式指定子 `%e` は、これまでは空白でのパディング（例: ` 3`）が必要でしたが、現在は 1 桁の日（例: `3`）も認識するようになりました。これにより、MySQL と互換性のある動作になります。以前の動作を維持するには、設定 `parsedatetime_e_requires_space_padding = 1` を 1 に設定してください（issue [#78243](https://github.com/ClickHouse/ClickHouse/issues/78243)）。[#80057](https://github.com/ClickHouse/ClickHouse/pull/80057)（[Robert Schulze](https://github.com/rschu1ze)）。
* ClickHouse のログに出力される `Cannot find 'kernel' in '[...]/memory.stat'` という警告メッセージを修正しました（issue [#77410](https://github.com/ClickHouse/ClickHouse/issues/77410)）。[#80129](https://github.com/ClickHouse/ClickHouse/pull/80129)（[Robert Schulze](https://github.com/rschu1ze)）。
* スタックオーバーフローによるクラッシュを防ぐため、FunctionComparison でスタックサイズをチェックするようにしました。 [#78208](https://github.com/ClickHouse/ClickHouse/pull/78208) ([Julia Kartseva](https://github.com/jkartseva)).
* `system.workloads` からの SELECT 中に発生するレースコンディションを修正しました。 [#78743](https://github.com/ClickHouse/ClickHouse/pull/78743) ([Sergei Trifonov](https://github.com/serxa)).
* 修正: 分散クエリにおける遅延マテリアライゼーション。 [#78815](https://github.com/ClickHouse/ClickHouse/pull/78815) ([Igor Nikonov](https://github.com/devcrafter)).
* `Array(Bool)` から `Array(FixedString)` への変換の不具合を修正。 [#78863](https://github.com/ClickHouse/ClickHouse/pull/78863) ([Nikita Taranov](https://github.com/nickitat)).
* Parquet バージョンの選択をより分かりやすくしました。 [#78818](https://github.com/ClickHouse/ClickHouse/pull/78818) ([Michael Kolupaev](https://github.com/al13n321)).
* `ReservoirSampler` の自己マージ処理を修正しました。 [#79031](https://github.com/ClickHouse/ClickHouse/pull/79031) ([Nikita Taranov](https://github.com/nickitat)).
* クライアントコンテキストにおける挿入テーブルのストレージを修正。 [#79046](https://github.com/ClickHouse/ClickHouse/pull/79046) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `AggregatingSortedAlgorithm` と `SummingSortedAlgorithm` のデータメンバーの破棄順序を修正しました。 [#79056](https://github.com/ClickHouse/ClickHouse/pull/79056) ([Nikita Taranov](https://github.com/nickitat)).
* `enable_user_name_access_type` が `DEFINER` アクセスタイプに影響を与えないようにしました。 [#80026](https://github.com/ClickHouse/ClickHouse/pull/80026) ([pufit](https://github.com/pufit)).
* Keeper にシステムデータベースのメタデータが配置されている場合、システムデータベースに対するクエリがハングすることがある問題を修正。 [#79304](https://github.com/ClickHouse/ClickHouse/pull/79304) ([Mikhail Artemenko](https://github.com/Michicosun)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* `chcache` バイナリを毎回再ビルドするのではなく、ビルド済みのものを再利用できるようにしました。 [#78851](https://github.com/ClickHouse/ClickHouse/pull/78851) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* NATS のポーズ待ち処理を追加しました。 [#78987](https://github.com/ClickHouse/ClickHouse/pull/78987) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* ARM ビルドが誤って amd64compat として公開されていた問題を修正しました。 [#79122](https://github.com/ClickHouse/ClickHouse/pull/79122) ([Alexander Gololobov](https://github.com/davenger)).
* OpenSSL 向けに、あらかじめ生成されたアセンブリコードを使用するようにしました。 [#79386](https://github.com/ClickHouse/ClickHouse/pull/79386) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `clang20` でビルド可能になるよう修正しました。 [#79588](https://github.com/ClickHouse/ClickHouse/pull/79588) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `chcache`: Rust キャッシュ機構のサポートを追加しました。 [#78691](https://github.com/ClickHouse/ClickHouse/pull/78691) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* `zstd` のアセンブリファイルにアンワインド情報を追加しました。 [#79288](https://github.com/ClickHouse/ClickHouse/pull/79288) ([Michael Kolupaev](https://github.com/al13n321)).

### ClickHouse リリース 25.4, 2025-04-22 {#254}

#### 後方互換性のない変更 {#backward-incompatible-change}

* `allow_materialized_view_with_bad_select` が `false` の場合、マテリアライズドビュー内のすべてのカラムが対象テーブルと一致しているかを検査するようになりました。 [#74481](https://github.com/ClickHouse/ClickHouse/pull/74481) ([Christoph Wurm](https://github.com/cwurm)).
* `dateTrunc` が負の Date/DateTime 引数と共に使用されるケースを修正しました。 [#77622](https://github.com/ClickHouse/ClickHouse/pull/77622) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* レガシーな `MongoDB` 連携機能を削除しました。サーバー設定 `use_legacy_mongodb_integration` は廃止され、現在は効果を持ちません。 [#77895](https://github.com/ClickHouse/ClickHouse/pull/77895) ([Robert Schulze](https://github.com/rschu1ze)).
* パーティションキーまたはソートキーで使用されているカラムについては集約をスキップするように、`SummingMergeTree` の検証ロジックを強化しました。 [#78022](https://github.com/ClickHouse/ClickHouse/pull/78022) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).

#### 新機能 {#new-feature}

* ワークロード用に CPU スロットスケジューリングを追加しました。詳細は[ドキュメント](https://clickhouse.com/docs/operations/workload-scheduling#cpu_scheduling)を参照してください。[#77595](https://github.com/ClickHouse/ClickHouse/pull/77595)（[Sergei Trifonov](https://github.com/serxa)）。
* `clickhouse-local` は、`--path` コマンドライン引数を指定した場合、再起動後もデータベースを保持します。これにより [#50647](https://github.com/ClickHouse/ClickHouse/issues/50647) がクローズされました。これにより [#49947](https://github.com/ClickHouse/ClickHouse/issues/49947) がクローズされました。[#71722](https://github.com/ClickHouse/ClickHouse/pull/71722)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* サーバーが過負荷状態のときにクエリを拒否します。判断は、待ち時間（`OSCPUWaitMicroseconds`）とビジー時間（`OSCPUVirtualTimeMicroseconds`）の比率に基づいて行われます。この比率が `min_os_cpu_wait_time_ratio_to_throw` と `max_os_cpu_wait_time_ratio_to_throw` の間にある場合（これらはクエリレベルの設定）、一定の確率でクエリが破棄されます。 [#63206](https://github.com/ClickHouse/ClickHouse/pull/63206)（[Alexey Katsman](https://github.com/alexkats)）。
* `Iceberg` のタイムトラベル: 特定のタイムスタンプ時点の `Iceberg` テーブルをクエリできる設定を追加。 [#71072](https://github.com/ClickHouse/ClickHouse/pull/71072) ([Brett Hoerner](https://github.com/bretthoerner)). [#77439](https://github.com/ClickHouse/ClickHouse/pull/77439) ([Daniil Ivanik](https://github.com/divanik)).
* `Iceberg` メタデータのインメモリキャッシュ。マニフェストファイル／リストおよび `metadata.json` を保持することで、クエリの実行を高速化します。 [#77156](https://github.com/ClickHouse/ClickHouse/pull/77156) ([Han Fei](https://github.com/hanfei1991))。
* `DeltaLake` テーブルエンジンの Azure Blob Storage 対応を追加しました。[#68043](https://github.com/ClickHouse/ClickHouse/issues/68043) を修正しました。[#74541](https://github.com/ClickHouse/ClickHouse/pull/74541)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* デシリアライズ済みのベクトル類似性インデックス用にインメモリキャッシュを追加しました。これにより、繰り返し実行される近似最近傍 (ANN) 検索クエリが高速化されます。この新しいキャッシュのサイズは、サーバー設定 `vector_similarity_index_cache_size` および `vector_similarity_index_cache_max_entries` で制御されます。この機能は、以前のリリースにおけるスキッピングインデックスキャッシュ機能を置き換えるものです。 [#77905](https://github.com/ClickHouse/ClickHouse/pull/77905) ([Shankar Iyer](https://github.com/shankar-iyer)).
* Delta Lake でパーティションプルーニングをサポートしました。 [#78486](https://github.com/ClickHouse/ClickHouse/pull/78486) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 読み取り専用の `MergeTree` テーブルでバックグラウンドリフレッシュをサポートし、更新可能なテーブルに対して無制限の分散リーダーからクエリできるようにします（ClickHouse ネイティブのデータレイク）。 [#76467](https://github.com/ClickHouse/ClickHouse/pull/76467) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* データベースのメタデータファイルを保存するためにカスタムディスクを使用できるようになりました。現在、これはサーバー全体の設定としてのみ構成できます。 [#77365](https://github.com/ClickHouse/ClickHouse/pull/77365) ([Tuan Pham Anh](https://github.com/tuanpach))。
* plain&#95;rewritable ディスクで `ALTER TABLE ... ATTACH|DETACH|MOVE|REPLACE PARTITION` がサポートされるようになりました。 [#77406](https://github.com/ClickHouse/ClickHouse/pull/77406) ([Julia Kartseva](https://github.com/jkartseva)).
* `Kafka` テーブルエンジンに、`SASL` 構成および認証情報用のテーブル設定を追加しました。これにより、構成ファイルや名前付きコレクションを使用することなく、`CREATE TABLE` 文で直接、Kafka および Kafka 互換システムに対する SASL ベースの認証を設定できるようになります。 [#78810](https://github.com/ClickHouse/ClickHouse/pull/78810) ([Christoph Wurm](https://github.com/cwurm))。
* MergeTree テーブルに対して `default_compression_codec` を設定できるようにしました。この設定は、対象のカラムに対して CREATE 文で圧縮コーデックが明示的に定義されていない場合に使用されます。これにより [#42005](https://github.com/ClickHouse/ClickHouse/issues/42005) が解決されました。[#66394](https://github.com/ClickHouse/ClickHouse/pull/66394) ([gvoelfin](https://github.com/gvoelfin))。
* 分散接続で特定のネットワークを使用できるようにするため、clusters の設定に `bind_host` を追加しました。 [#74741](https://github.com/ClickHouse/ClickHouse/pull/74741) ([Todd Yocum](https://github.com/toddyocum)).
* `system.tables` に `parametrized_view_parameters` という新しいカラムを追加しました。 [https://github.com/clickhouse/clickhouse/issues/66756](https://github.com/clickhouse/clickhouse/issues/66756) をクローズしました。 [#75112](https://github.com/ClickHouse/ClickHouse/pull/75112) ([NamNguyenHoai](https://github.com/NamHoaiNguyen)).
* データベースコメントを変更可能にしました。[#73351](https://github.com/ClickHouse/ClickHouse/issues/73351) をクローズ。### ユーザー向け変更のドキュメント用エントリ。[#75622](https://github.com/ClickHouse/ClickHouse/pull/75622)（[NamNguyenHoai](https://github.com/NamHoaiNguyen)）。
* PostgreSQL 互換プロトコルでの `SCRAM-SHA-256` 認証をサポート。[#76839](https://github.com/ClickHouse/ClickHouse/pull/76839) ([scanhex12](https://github.com/scanhex12))。
* 関数 `arrayLevenshteinDistance`、`arrayLevenshteinDistanceWeighted`、`arraySimilarity` を追加。[#77187](https://github.com/ClickHouse/ClickHouse/pull/77187)（[Mikhail f. Shiryaev](https://github.com/Felixoid)）。
* 設定 `parallel_distributed_insert_select` は、`ReplicatedMergeTree` への `INSERT SELECT` に対しても有効になりました（以前は Distributed テーブルが必要でした）。 [#78041](https://github.com/ClickHouse/ClickHouse/pull/78041) ([Igor Nikonov](https://github.com/devcrafter))。
* `toInterval` 関数を導入しました。この関数は 2 つの引数（値と単位）を受け取り、その値を対応する `Interval` 型に変換します。[#78723](https://github.com/ClickHouse/ClickHouse/pull/78723) ([Andrew Davis](https://github.com/pulpdrew))。
* iceberg テーブル関数およびエンジンにおいて、ルートの `metadata.json` ファイルを解決するための複数の便利な方法を追加しました。[#78455](https://github.com/ClickHouse/ClickHouse/issues/78455) をクローズしました。[#78475](https://github.com/ClickHouse/ClickHouse/pull/78475)（[Daniil Ivanik](https://github.com/divanik)）。
* ClickHouse の SSH プロトコルでパスワードベースの認証をサポートしました。 [#78586](https://github.com/ClickHouse/ClickHouse/pull/78586) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))。

#### 実験的機能 {#experimental-feature}

* `WHERE` 句の `EXISTS` 式の引数として相関サブクエリをサポートしました。[#72459](https://github.com/ClickHouse/ClickHouse/issues/72459) をクローズ。[#76078](https://github.com/ClickHouse/ClickHouse/pull/76078)（[Dmitry Novik](https://github.com/novikd)）。
* 関数 `sparseGrams` および `sparseGramsHashes` に、ASCII 版と UTF8 版を追加しました。作者: [scanhex12](https://github.com/scanhex12)。[#78176](https://github.com/ClickHouse/ClickHouse/pull/78176)（[Pervakov Grigorii](https://github.com/GrigoryPervakov)）。これらの関数は使用しないでください。実装は今後のバージョンで変更されます。

#### パフォーマンスの向上 {#performance-improvement}

* ORDER BY と LIMIT の適用後にデータを読み取る lazy column を用いてパフォーマンスを最適化します。 [#55518](https://github.com/ClickHouse/ClickHouse/pull/55518) ([Xiaozhe Yu](https://github.com/wudidapaopao)).
* クエリ条件キャッシュをデフォルトで有効にしました。 [#79080](https://github.com/ClickHouse/ClickHouse/pull/79080) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `col->insertFrom()` への呼び出しをデバーチャライゼーションすることで JOIN 結果の構築を高速化しました。 [#77350](https://github.com/ClickHouse/ClickHouse/pull/77350) ([Alexander Gololobov](https://github.com/davenger)).
* フィルタのクエリプランステップにある等価条件を、可能な場合は JOIN 条件にマージして、ハッシュテーブルのキーとして利用できるようにしました。 [#78877](https://github.com/ClickHouse/ClickHouse/pull/78877) ([Dmitry Novik](https://github.com/novikd))。
* 両方のテーブルで JOIN キーが PK の先頭部分になっている場合、JOIN に動的シャーディングを使用します。この最適化は `query_plan_join_shard_by_pk_ranges` 設定で有効にできます（デフォルトでは無効）。[#74733](https://github.com/ClickHouse/ClickHouse/pull/74733) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* 列の下限値および上限値に基づく `Iceberg` データのプルーニングをサポートしました。[#77638](https://github.com/ClickHouse/ClickHouse/issues/77638) を修正しました。[#78242](https://github.com/ClickHouse/ClickHouse/pull/78242)（[alesapin](https://github.com/alesapin)）。
* `Iceberg` 向けの単純な `count` 最適化を実装しました。これにより、フィルタなしの `count()` を含むクエリが高速になります。[#77639](https://github.com/ClickHouse/ClickHouse/issues/77639) をクローズ。[#78090](https://github.com/ClickHouse/ClickHouse/pull/78090)（[alesapin](https://github.com/alesapin)）。
* `max_merge_delayed_streams_for_parallel_write` を使用して、マージ処理が並列にフラッシュできる列数を構成できるようにしました（これにより、S3 への縦型マージのメモリ使用量がおよそ 1/25 に削減されます）。 [#77922](https://github.com/ClickHouse/ClickHouse/pull/77922) ([Azat Khuzhin](https://github.com/azat)).
* キャッシュがマージなどで受動的に使用される場合は、`filesystem_cache_prefer_bigger_buffer_size` を無効にします。これにより、マージ処理時のメモリ消費量を抑えることができます。 [#77898](https://github.com/ClickHouse/ClickHouse/pull/77898) ([Kseniia Sumarokova](https://github.com/kssenii)).
* parallel replicas を有効にした読み取り時のタスクサイズの決定に、レプリカ数を利用するようになりました。これにより、読み取るデータ量がそれほど多くない場合でも、レプリカ間での負荷分散がより良好になります。[#78695](https://github.com/ClickHouse/ClickHouse/pull/78695)（[Nikita Taranov](https://github.com/nickitat)）。
* `ORC` フォーマットにおいて非同期 I/O プリフェッチをサポートし、リモート I/O レイテンシを隠蔽することで全体の性能を向上しました。 [#70534](https://github.com/ClickHouse/ClickHouse/pull/70534) ([李扬](https://github.com/taiyang-li)).
* 非同期インサートに使用されるメモリを事前割り当てしてパフォーマンスを向上させます。[#74945](https://github.com/ClickHouse/ClickHouse/pull/74945) ([Ilya Golshtein](https://github.com/ilejn))。
* `multiRead` が利用可能な箇所では単一の `get` リクエストの使用を廃止することで、Keeper へのリクエスト数を削減しました。これにより、レプリカ数の増加時に単一の `get` リクエストが Keeper に対して発生させうる大きな負荷を回避できます。 [#56862](https://github.com/ClickHouse/ClickHouse/pull/56862) ([Nikolay Degterinsky](https://github.com/evillique)).
* Nullable 引数に対する関数実行の軽微な最適化。[#76489](https://github.com/ClickHouse/ClickHouse/pull/76489)（[李扬](https://github.com/taiyang-li)）。
* `arraySort` を最適化しました。 [#76850](https://github.com/ClickHouse/ClickHouse/pull/76850) ([李扬](https://github.com/taiyang-li)).
* 同一パートのマークをマージして一括でクエリ条件キャッシュに書き込むことで、ロックのオーバーヘッドを削減しました。 [#77377](https://github.com/ClickHouse/ClickHouse/pull/77377) ([zhongyuankai](https://github.com/zhongyuankai)).
* 1 つだけブラケット展開を行うクエリに対して `s3Cluster` のパフォーマンスを最適化しました。[#77686](https://github.com/ClickHouse/ClickHouse/pull/77686) ([Tomáš Hromada](https://github.com/gyfis))。
* 単一の Nullable 列または LowCardinality 列に対する ORDER BY を最適化しました。[#77789](https://github.com/ClickHouse/ClickHouse/pull/77789) ([李扬](https://github.com/taiyang-li))。
* `Native` 形式のメモリ使用量を最適化しました。 [#78442](https://github.com/ClickHouse/ClickHouse/pull/78442) ([Azat Khuzhin](https://github.com/azat)).
* 些細な最適化: 型キャストが必要な場合は `count(if(...))` を `countIf` に書き換えないようにする。[#78564](https://github.com/ClickHouse/ClickHouse/issues/78564) をクローズ。[#78565](https://github.com/ClickHouse/ClickHouse/pull/78565)（[李扬](https://github.com/taiyang-li)）。
* `hasAll` 関数で `tokenbf_v1`、`ngrambf_v1` の全文スキップインデックスを利用できるようになりました。 [#77662](https://github.com/ClickHouse/ClickHouse/pull/77662) ([UnamedRus](https://github.com/UnamedRus))。
* ベクトル類似性インデックスがメインメモリを最大 2 倍まで過剰に割り当ててしまう可能性がありました。この修正では、メモリ割り当て戦略を見直すことでメモリ消費量を削減し、ベクトル類似性インデックスキャッシュの有効性を向上させます（issue [#78056](https://github.com/ClickHouse/ClickHouse/issues/78056)）。[#78394](https://github.com/ClickHouse/ClickHouse/pull/78394)（[Shankar Iyer](https://github.com/shankar-iyer)）。
* `system.metric_log` テーブルに対してスキーマタイプを指定するための設定 `schema_type` を導入しました。利用可能なスキーマは 3 種類あります。`wide` — 現行のスキーマで、各メトリクス/イベントが個別のカラムに配置されます（個々のカラムを読む処理に最も効率的）、`transposed` — `system.asynchronous_metric_log` に類似しており、メトリクス/イベントが行として格納されます。そして、最も興味深い `transposed_with_wide_view` — 内部テーブルは `transposed` スキーマで作成しつつ、そのテーブルに対するクエリを変換して実行する `wide` スキーマのビューも提供する方式です。`transposed_with_wide_view` ではビューのサブ秒解像度はサポートされず、`event_time_microseconds` は後方互換性のためのエイリアスにすぎません。 [#78412](https://github.com/ClickHouse/ClickHouse/pull/78412) ([alesapin](https://github.com/alesapin))。

#### 改善点 {#improvement}

* `Distributed` クエリのクエリプランをシリアライズできるようになりました。新しい設定 `serialize_query_plan` が追加されました。有効化すると、`Distributed` テーブルからのクエリは、リモートクエリ実行時にシリアライズされたクエリプランを使用します。これにより TCP プロトコルに新しいパケットタイプが導入されるため、このパケットを処理できるようにするには、サーバー設定に `<process_query_plan_packet>true</process_query_plan_packet>` を追加する必要があります。 [#69652](https://github.com/ClickHouse/ClickHouse/pull/69652) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* ビューからの `JSON` 型およびサブカラムの読み取りが可能になりました。 [#76903](https://github.com/ClickHouse/ClickHouse/pull/76903) ([Pavel Kruglov](https://github.com/Avogar)).
* ALTER DATABASE ... ON CLUSTER がサポートされました。 [#79242](https://github.com/ClickHouse/ClickHouse/pull/79242) ([Tuan Pham Anh](https://github.com/tuanpach)).
* リフレッシュ可能なマテリアライズドビューのリフレッシュが `system.query_log` に記録されるようになりました。 [#71333](https://github.com/ClickHouse/ClickHouse/pull/71333) ([Michael Kolupaev](https://github.com/al13n321)).
* ユーザー定義関数 (UDF) を、その設定内の新しい設定項目によって決定的としてマークできるようになりました。また、クエリキャッシュは、クエリ内で呼び出される UDF が決定的かどうかを確認するようになりました。決定的である場合、そのクエリ結果がキャッシュされます。(Issue [#59988](https://github.com/ClickHouse/ClickHouse/issues/59988)). [#77769](https://github.com/ClickHouse/ClickHouse/pull/77769) ([Jimmy Aguilar Mena](https://github.com/Ergus)).
* あらゆる種類のレプリケーションタスクに対してバックオフロジックを有効化しました。これにより、CPU 使用率、メモリ使用量、およびログファイルのサイズを削減できるようになります。`max_postpone_time_for_failed_mutations_ms` に類似した新しい設定項目として、`max_postpone_time_for_failed_replicated_fetches_ms`、`max_postpone_time_for_failed_replicated_merges_ms`、`max_postpone_time_for_failed_replicated_tasks_ms` を追加しました。 [#74576](https://github.com/ClickHouse/ClickHouse/pull/74576) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* `system.errors` に `query_id` を追加しました。[#75815](https://github.com/ClickHouse/ClickHouse/issues/75815) をクローズしました。[#76581](https://github.com/ClickHouse/ClickHouse/pull/76581)（[Vladimir Baikov](https://github.com/bkvvldmr)）。
* `UInt128` から `IPv6` への変換をサポートしました。これにより、`IPv6` に対する `bitAnd` 演算や算術演算、および結果の `IPv6` への再変換が可能になります。[#76752](https://github.com/ClickHouse/ClickHouse/issues/76752) をクローズします。これにより、`IPv6` に対する `bitAnd` 演算の結果も再度 `IPv6` に変換できるようになります。[#57707](https://github.com/ClickHouse/ClickHouse/pull/57707) も参照してください。[#76928](https://github.com/ClickHouse/ClickHouse/pull/76928)（[Muzammil Abdul Rehman](https://github.com/muzammilar)）。
* デフォルトでは、`Variant` 型内のテキスト形式で特殊な `Bool` 値をパースしないようになりました。これを有効にするには、設定 `allow_special_bool_values_inside_variant` を使用します。 [#76974](https://github.com/ClickHouse/ClickHouse/pull/76974) ([Pavel Kruglov](https://github.com/Avogar)).
* セッションレベルおよびサーバーレベルの両方で、低い `priority` のクエリに対するタスクごとの待機時間を設定できるようにしました。 [#77013](https://github.com/ClickHouse/ClickHouse/pull/77013) ([VicoWu](https://github.com/VicoWu)).
* JSON データ型の値の比較を実装しました。これにより、JSON オブジェクトを Map と同様に比較できるようになりました。 [#77397](https://github.com/ClickHouse/ClickHouse/pull/77397) ([Pavel Kruglov](https://github.com/Avogar))。
* `system.kafka_consumers` による権限管理のサポートを改善。内部の `librdkafka` エラーを転送するようにした（なお、このライブラリには大きな問題があることを付記しておく）。 [#77700](https://github.com/ClickHouse/ClickHouse/pull/77700) ([Ilya Golshtein](https://github.com/ilejn)).
* Buffer テーブルエンジンの設定の検証を追加しました。 [#77840](https://github.com/ClickHouse/ClickHouse/pull/77840) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `HDFS` での `pread` を有効化または無効化するための設定 `enable_hdfs_pread` を追加。 [#77885](https://github.com/ClickHouse/ClickHouse/pull/77885) ([kevinyhzou](https://github.com/KevinyhZou)).
* ZooKeeper の `multi` 読み取りおよび書き込みリクエスト数用のプロファイルイベントを追加しました。 [#77888](https://github.com/ClickHouse/ClickHouse/pull/77888) ([JackyWoo](https://github.com/JackyWoo)).
* `disable_insertion_and_mutation` が有効な場合でも一時テーブルの作成および挿入を許可できるようにしました。 [#77901](https://github.com/ClickHouse/ClickHouse/pull/77901) ([Xu Jia](https://github.com/XuJia0210)).
* `max_insert_delayed_streams_for_parallel_write` を 100 に減らしました。 [#77919](https://github.com/ClickHouse/ClickHouse/pull/77919) ([Azat Khuzhin](https://github.com/azat)).
* `yyy` のような Joda 構文（ちなみに、これは Java の世界のものです）における年の解析を修正。 [#77973](https://github.com/ClickHouse/ClickHouse/pull/77973) ([李扬](https://github.com/taiyang-li))
* `MergeTree` テーブルのパーツのアタッチ処理は、そのブロック順に従って実行されます。これは、`ReplacingMergeTree` などの特殊なマージアルゴリズムにとって重要です。これにより [#71009](https://github.com/ClickHouse/ClickHouse/issues/71009) がクローズされます。[#77976](https://github.com/ClickHouse/ClickHouse/pull/77976)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* クエリマスキングルールは、一致が発生した場合に `LOGICAL_ERROR` をスローできるようになりました。これにより、あらかじめ定義したパスワードがログ内のどこかで漏えいしていないかを検証しやすくなります。 [#78094](https://github.com/ClickHouse/ClickHouse/pull/78094) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* MySQL との互換性を向上させるため、`information_schema.tables` に `index_length_column` 列を追加しました。 [#78119](https://github.com/ClickHouse/ClickHouse/pull/78119) ([Paweł Zakrzewski](https://github.com/KrzaQ)).
* 2 つの新しいメトリクス `TotalMergeFailures` と `NonAbortedMergeFailures` を導入しました。これらのメトリクスは、短期間に過度に多くのマージが失敗するケースを検出するためのものです。 [#78150](https://github.com/ClickHouse/ClickHouse/pull/78150) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* パススタイル使用時にキーが指定されていない場合の誤った S3 URL の解析を修正。 [#78185](https://github.com/ClickHouse/ClickHouse/pull/78185) ([Arthur Passos](https://github.com/arthurpassos)).
* `BlockActiveTime`、`BlockDiscardTime`、`BlockWriteTime`、`BlockQueueTime`、`BlockReadTime` の非同期メトリクスで誤った値が報告されていた問題を修正しました（変更前は 1 秒が誤って 0.001 と報告されていました）。 [#78211](https://github.com/ClickHouse/ClickHouse/pull/78211) ([filimonov](https://github.com/filimonov)).
* StorageS3(Azure)Queue のマテリアライズドビューへのプッシュ処理中に発生するエラーに対して、`loading_retries` の上限が適用されるようにしました。これ以前は、そのようなエラーは無制限に再試行されていました。 [#78313](https://github.com/ClickHouse/ClickHouse/pull/78313) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Delta Lake の `delta-kernel-rs` 実装で、パフォーマンスとプログレスバーを修正しました。 [#78368](https://github.com/ClickHouse/ClickHouse/pull/78368) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ランタイムディスクで `include`、`from_env`、`from_zk` をサポートするようにしました。[#78177](https://github.com/ClickHouse/ClickHouse/issues/78177) をクローズ。[#78470](https://github.com/ClickHouse/ClickHouse/pull/78470)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* 長時間実行中の mutation に対する動的な警告を `system.warnings` テーブルに追加しました。 [#78658](https://github.com/ClickHouse/ClickHouse/pull/78658) ([Bharat Nallan](https://github.com/bharatnc))。
* システムテーブル `system.query_condition_cache` にフィールド `condition` を追加しました。これは、クエリ条件キャッシュでキーとして使用されるハッシュの元となるプレーンテキストの条件式を保存します。 [#78671](https://github.com/ClickHouse/ClickHouse/pull/78671) ([Robert Schulze](https://github.com/rschu1ze))。
* Hive のパーティションで空の値を許可できるようにしました。 [#78816](https://github.com/ClickHouse/ClickHouse/pull/78816) ([Arthur Passos](https://github.com/arthurpassos)).
* `BFloat16` における `IN` 句の型変換を修正しました（つまり、`SELECT toBFloat16(1) IN [1, 2, 3];` は今後 `1` を返します）。[#78754](https://github.com/ClickHouse/ClickHouse/issues/78754) をクローズしました。[#78839](https://github.com/ClickHouse/ClickHouse/pull/78839)（[Raufs Dunamalijevs](https://github.com/rienath)）。
* `MergeTree` で `disk = ...` が設定されている場合は、他のディスク上のパーツをチェックしないようにしました。 [#78855](https://github.com/ClickHouse/ClickHouse/pull/78855) ([Azat Khuzhin](https://github.com/azat)).
* `system.query_log` の `used_data_type_families` 内のデータ型が正規名で記録されるようにしました。 [#78972](https://github.com/ClickHouse/ClickHouse/pull/78972) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `recoverLostReplica` のクリーンアップ設定を、[#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) と同様にしました。[#79113](https://github.com/ClickHouse/ClickHouse/pull/79113)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* INFILE のスキーマ推論で挿入列を使用するようにしました。 [#78490](https://github.com/ClickHouse/ClickHouse/pull/78490) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* 集約プロジェクションで `count(Nullable)` が使用された場合の誤ったプロジェクション解析を修正しました。これにより[#74495](https://github.com/ClickHouse/ClickHouse/issues/74495) が解決されます。このPRではまた、プロジェクションがなぜ使用されるのか、あるいはなぜ使用されないのかを明確にするため、プロジェクション解析まわりのログも追加しました。[#74498](https://github.com/ClickHouse/ClickHouse/pull/74498) ([Amos Bird](https://github.com/amosbird))。
* `DETACH PART` の実行中に発生する `Part <...> does not contain in snapshot of previous virtual parts. (PART_IS_TEMPORARILY_LOCKED)` エラーを修正。 [#76039](https://github.com/ClickHouse/ClickHouse/pull/76039) ([Aleksei Filatov](https://github.com/aalexfvk)).
* アナライザーでリテラルを含む式を使用するスキップインデックスが動作しない問題を修正し、インデックスの解析時に自明なキャストを削除しました。 [#77229](https://github.com/ClickHouse/ClickHouse/pull/77229) ([Pavel Kruglov](https://github.com/Avogar)).
* `close_session` クエリパラメータが機能せず、その結果、名前付きセッションが `session_timeout` 経過後にしかクローズされなかったバグを修正。 [#77336](https://github.com/ClickHouse/ClickHouse/pull/77336) ([Alexey Katsman](https://github.com/alexkats))。
* マテリアライズドビューなしで NATS サーバーからメッセージを受信できない問題を修正しました。[#77392](https://github.com/ClickHouse/ClickHouse/pull/77392) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov))。
* 空の `FileLog` から `merge` テーブル関数経由で読み込み時に発生する論理エラーを修正。 [#75575](https://github.com/ClickHouse/ClickHouse/issues/75575) をクローズ。 [#77441](https://github.com/ClickHouse/ClickHouse/pull/77441)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* 共有バリアント由来の `Dynamic` シリアライゼーションでデフォルトのフォーマット設定を使用するようにしました。 [#77572](https://github.com/ClickHouse/ClickHouse/pull/77572) ([Pavel Kruglov](https://github.com/Avogar)).
* ローカルディスク上のテーブルデータパスの存在チェックを修正。[#77608](https://github.com/ClickHouse/ClickHouse/pull/77608)（[Tuan Pham Anh](https://github.com/tuanpach)）。
* 一部の型における定数値のリモート送信を修正しました。 [#77634](https://github.com/ClickHouse/ClickHouse/pull/77634) ([Pavel Kruglov](https://github.com/Avogar)).
* S3/AzureQueue において、有効期限切れのコンテキストによりクラッシュが発生する問題を修正しました。 [#77720](https://github.com/ClickHouse/ClickHouse/pull/77720) ([Kseniia Sumarokova](https://github.com/kssenii)).
* RabbitMQ、Nats、Redis、AzureQueue テーブルエンジンで資格情報を非表示にするようにしました。 [#77755](https://github.com/ClickHouse/ClickHouse/pull/77755) ([Kseniia Sumarokova](https://github.com/kssenii))。
* `argMin` および `argMax` における `NaN` 比較の未定義動作を修正。 [#77756](https://github.com/ClickHouse/ClickHouse/pull/77756) ([Raúl Marín](https://github.com/Algunenano)).
* 操作が書き込み用のブロックを一切生成しない場合でも、マージおよびミューテーションがキャンセルされているかどうかを定期的に確認するようにしました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Replicated データベースにおいて、新たに追加されたレプリカで refreshable マテリアライズドビューが動作しない問題を修正しました。 [#77774](https://github.com/ClickHouse/ClickHouse/pull/77774) ([Michael Kolupaev](https://github.com/al13n321)).
* `NOT_FOUND_COLUMN_IN_BLOCK` エラー発生時にクラッシュする可能性があった問題を修正。 [#77854](https://github.com/ClickHouse/ClickHouse/pull/77854) ([Vladimir Cherkasov](https://github.com/vdimir))。
* データの投入中に S3/AzureQueue で発生していたクラッシュを修正。 [#77878](https://github.com/ClickHouse/ClickHouse/pull/77878) ([Bharat Nallan](https://github.com/bharatnc)).
* SSH サーバーでの履歴のあいまい検索機能を無効化しました（`skim` ライブラリが必要なため）。 [#78002](https://github.com/ClickHouse/ClickHouse/pull/78002) ([Azat Khuzhin](https://github.com/azat))。
* インデックス未作成のカラムに対するベクトル検索クエリが、同じテーブル内にベクトル類似度インデックスが定義された別のベクトルカラムが存在する場合に誤った結果を返していた不具合を修正しました。(Issue [#77978](https://github.com/ClickHouse/ClickHouse/issues/77978))。[#78069](https://github.com/ClickHouse/ClickHouse/pull/78069) ([Shankar Iyer](https://github.com/shankar-iyer))。
* ごく小さな誤りがあったプロンプト &quot;The requested output format {} is binary... Do you want to output it anyway? [y/N]&quot; を修正しました。 [#78095](https://github.com/ClickHouse/ClickHouse/pull/78095) ([Azat Khuzhin](https://github.com/azat)).
* `toStartOfInterval` の origin 引数がゼロのときに発生していたバグを修正しました。 [#78096](https://github.com/ClickHouse/ClickHouse/pull/78096) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* HTTP インターフェイスで、`session_id` クエリパラメータに空値を指定できないようにしました。 [#78098](https://github.com/ClickHouse/ClickHouse/pull/78098) ([Alexey Katsman](https://github.com/alexkats)).
* `ALTER` クエリの直後に実行された `RENAME` クエリが原因で `Replicated` データベースのメタデータが上書きされてしまう可能性があった問題を修正しました。 [#78107](https://github.com/ClickHouse/ClickHouse/pull/78107) ([Nikolay Degterinsky](https://github.com/evillique)).
* `NATS` エンジンのクラッシュを修正。 [#78108](https://github.com/ClickHouse/ClickHouse/pull/78108) ([Dmitry Novikov](https://github.com/dmitry-sles-novikov)).
* SSH 向け埋め込みクライアントで `history_file` を作成しようとしないようにしました（以前のバージョンでは、作成は常に失敗していましたが、試行自体は行われていました）。 [#78112](https://github.com/ClickHouse/ClickHouse/pull/78112) ([Azat Khuzhin](https://github.com/azat)).
* `RENAME DATABASE` または `DROP TABLE` クエリの実行後に `system.detached_tables` が誤った情報を表示する問題を修正。 [#78126](https://github.com/ClickHouse/ClickHouse/pull/78126) ([Nikolay Degterinsky](https://github.com/evillique)).
* [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) の後に `Replicated` データベースでテーブル数が多すぎる場合のチェックを修正しました。また、`ReplicatedMergeTree` や `KeeperMap` の場合に Keeper に管理されないノードが作成されるのを避けるため、ストレージを作成する前にチェックを実行するようにしました。 [#78127](https://github.com/ClickHouse/ClickHouse/pull/78127)（[Nikolay Degterinsky](https://github.com/evillique)）。
* 並行して実行される `S3Queue` メタデータ初期化が原因となり得るクラッシュを修正しました。 [#78131](https://github.com/ClickHouse/ClickHouse/pull/78131) ([Azat Khuzhin](https://github.com/azat)).
* `groupArray*` 関数は、これまでは実行を試みていた `max_size` 引数の Int 型で値が 0 の場合について、UInt 型の場合と同様に `BAD_ARGUMENTS` エラーを返すようになりました。 [#78140](https://github.com/ClickHouse/ClickHouse/pull/78140) ([Eduard Karacharov](https://github.com/korowa)).
* ローカルテーブルがデタッチされる前に削除されていた場合でも、失われたレプリカの復旧時にクラッシュしないようにしました。 [#78173](https://github.com/ClickHouse/ClickHouse/pull/78173) ([Raúl Marín](https://github.com/Algunenano)).
* `system.s3_queue_settings` の &quot;alterable&quot; 列が常に `false` を返していた問題を修正しました。 [#78187](https://github.com/ClickHouse/ClickHouse/pull/78187) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Azure アクセス署名をマスクし、ユーザーからもログ上でも見えないようにしました。 [#78189](https://github.com/ClickHouse/ClickHouse/pull/78189) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Wide パーツ内で、プレフィックスを持つサブストリームのプリフェッチ処理を修正。[#78205](https://github.com/ClickHouse/ClickHouse/pull/78205) ([Pavel Kruglov](https://github.com/Avogar)).
* `LowCardinality(Nullable)` 型のキー配列で `mapFromArrays` がクラッシュしたり誤った結果を返したりする問題を修正しました。 [#78240](https://github.com/ClickHouse/ClickHouse/pull/78240) ([Eduard Karacharov](https://github.com/korowa)).
* delta-kernel-rs の auth オプションを修正しました。 [#78255](https://github.com/ClickHouse/ClickHouse/pull/78255) ([Kseniia Sumarokova](https://github.com/kssenii))。
* レプリカの `disable_insertion_and_mutation` が true の場合、Refreshable マテリアライズドビューのタスクをスケジュールしないようにしました。このタスクは挿入処理を行うため、`disable_insertion_and_mutation` が true の場合には失敗します。 [#78277](https://github.com/ClickHouse/ClickHouse/pull/78277) ([Xu Jia](https://github.com/XuJia0210)).
* `Merge` エンジンで、基盤となるテーブルへのアクセスを検証するようにしました。 [#78339](https://github.com/ClickHouse/ClickHouse/pull/78339) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* `Distributed` テーブルをクエリする際には、`FINAL` 修飾子は無視されます。 [#78428](https://github.com/ClickHouse/ClickHouse/pull/78428) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `bitmapMin` は、ビットマップが空の場合に uint32&#95;max（入力型がそれより大きい場合は uint64&#95;max）を返します。これは、空の roaring&#95;bitmap における最小値の動作と一致します。 [#78444](https://github.com/ClickHouse/ClickHouse/pull/78444) ([wxybear](https://github.com/wxybear))。
* `distributed_aggregation_memory_efficient` が有効な場合に、`FROM` から読み込んだ直後に行っていたクエリ処理の並列化を無効化しました。以前はこれにより論理エラーが発生する可能性がありました。[#76934](https://github.com/ClickHouse/ClickHouse/issues/76934) をクローズ。[#78500](https://github.com/ClickHouse/ClickHouse/pull/78500)（[flynn](https://github.com/ucasfl)）。
* `max_streams_to_max_threads_ratio` 設定を適用した結果、計画されたストリーム数が 0 になる場合に備えて、少なくとも 1 本の読み取り用ストリームが設定されるようにしました。 [#78505](https://github.com/ClickHouse/ClickHouse/pull/78505) ([Eduard Karacharov](https://github.com/korowa)).
* ストレージ `S3Queue` において、論理エラー「Cannot unregister: table uuid is not registered」を修正しました。[#78285](https://github.com/ClickHouse/ClickHouse/issues/78285) をクローズ。[#78541](https://github.com/ClickHouse/ClickHouse/pull/78541)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ClickHouse は、cgroup v1 と v2 の両方が有効なシステムで、自身の cgroup v2 を特定できるようになりました。 [#78566](https://github.com/ClickHouse/ClickHouse/pull/78566) ([Grigory Korolev](https://github.com/gkorolev)).
* `-Cluster` テーブル関数が、テーブルレベルの設定と併用した場合に失敗していました。 [#78587](https://github.com/ClickHouse/ClickHouse/pull/78587) ([Daniil Ivanik](https://github.com/divanik))。
* INSERT 時に ReplicatedMergeTree がトランザクションをサポートしていない場合のチェックを改善。 [#78633](https://github.com/ClickHouse/ClickHouse/pull/78633) ([Azat Khuzhin](https://github.com/azat))。
* アタッチ処理時にクエリ設定をクリーンアップするようにしました。 [#78637](https://github.com/ClickHouse/ClickHouse/pull/78637) ([Raúl Marín](https://github.com/Algunenano)).
* `iceberg_metadata_file_path` に無効なパスが指定された場合にクラッシュする不具合を修正しました。 [#78688](https://github.com/ClickHouse/ClickHouse/pull/78688) ([alesapin](https://github.com/alesapin)).
* `delta-kernel-s` 実装を用いた `DeltaLake` テーブルエンジンにおいて、読み取りスキーマがテーブルスキーマと異なり、かつパーティションカラムが存在する場合に `not found column` エラーが発生する不具合を修正しました。 [#78690](https://github.com/ClickHouse/ClickHouse/pull/78690) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 名前付きセッションのクローズをスケジュールした後（ただしタイムアウトがまだ発生していないうちに）に、同じ名前の新しい名前付きセッションを作成すると、その新しいセッションが最初のセッションのクローズ予定時刻にクローズされてしまう問題を修正しました。 [#78698](https://github.com/ClickHouse/ClickHouse/pull/78698) ([Alexey Katsman](https://github.com/alexkats)).
* `MongoDB` エンジンのテーブルまたは `mongodb` テーブル関数から読み取る、いくつかの種類の `SELECT` クエリを修正しました。`WHERE` 句内で定数値が暗黙的に型変換されるクエリ（例：`WHERE datetime = '2025-03-10 00:00:00'`）や、`LIMIT` および `GROUP BY` を含むクエリなどが対象です。以前は、これらのクエリが誤った結果を返すことがありました。 [#78777](https://github.com/ClickHouse/ClickHouse/pull/78777) ([Anton Popov](https://github.com/CurtizJ)).
* `CHECK TABLE` 実行中にテーブルのシャットダウン処理をブロックしないようにしました。 [#78782](https://github.com/ClickHouse/ClickHouse/pull/78782) ([Raúl Marín](https://github.com/Algunenano)).
* Keeper の修正: すべてのケースで ephemeral カウントを正しく計算するように修正。 [#78799](https://github.com/ClickHouse/ClickHouse/pull/78799) ([Antonio Andelic](https://github.com/antonio2368)).
* `view` 以外のテーブル関数を使用した場合に `StorageDistributed` で発生していた不正なキャストを修正。[#78464](https://github.com/ClickHouse/ClickHouse/issues/78464) をクローズ。[#78828](https://github.com/ClickHouse/ClickHouse/pull/78828)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `tupleElement(*, 1)` のフォーマットの一貫性を修正します。[#78639](https://github.com/ClickHouse/ClickHouse/issues/78639) をクローズします。[#78832](https://github.com/ClickHouse/ClickHouse/pull/78832)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* `ssd_cache` 型の辞書では、`block_size` と `write_buffer_size` パラメータにゼロまたは負の値が指定された場合、それらを拒否するようになりました（issue [#78314](https://github.com/ClickHouse/ClickHouse/issues/78314)）。[#78854](https://github.com/ClickHouse/ClickHouse/pull/78854)（[Elmi Ahmadov](https://github.com/ahmadov)）。
* 異常終了後に `ALTER` を実行した場合に Refreshable MATERIALIZED VIEW がクラッシュする問題を修正。[#78858](https://github.com/ClickHouse/ClickHouse/pull/78858) ([Azat Khuzhin](https://github.com/azat)).
* `CSV` フォーマットにおける不正な `DateTime` 値のパース処理を修正。[#78919](https://github.com/ClickHouse/ClickHouse/pull/78919)（[Pavel Kruglov](https://github.com/Avogar)）。
* Keeper の修正: 失敗した multi リクエストでは watch が発火しないようにしました。 [#79247](https://github.com/ClickHouse/ClickHouse/pull/79247) ([Antonio Andelic](https://github.com/antonio2368)).
* min-max 値が明示的に指定されているものの `NULL` になっている場合に、Iceberg テーブルの読み取りが失敗していた問題を修正しました。そのようなひどいファイルを生成していたのは Go 向け Iceberg ライブラリであることが確認されています。[#78740](https://github.com/ClickHouse/ClickHouse/issues/78740) をクローズします。[#78764](https://github.com/ClickHouse/ClickHouse/pull/78764)（[flynn](https://github.com/ucasfl)）。

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* Rust においてターゲットとする CPU 機能を考慮し、すべてのクレートで LTO を有効化しました。 [#78590](https://github.com/ClickHouse/ClickHouse/pull/78590) ([Raúl Marín](https://github.com/Algunenano)).

### ClickHouse 25.3 LTS リリース、2025-03-20 {#253}

#### 後方互換性のない変更 {#backward-incompatible-change}

* レプリケーテッドデータベースの切り捨てを禁止しました。 [#76651](https://github.com/ClickHouse/ClickHouse/pull/76651) ([Bharat Nallan](https://github.com/bharatnc)).
* スキップインデックスキャッシュに関する変更を元に戻しました。 [#77447](https://github.com/ClickHouse/ClickHouse/pull/77447) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).

#### 新機能 {#new-feature}

* `JSON` データ型は本番利用可能です。 [https://jsonbench.com/](https://jsonbench.com/) を参照してください。`Dynamic` および `Variant` データ型も本番利用可能です。 [#77785](https://github.com/ClickHouse/ClickHouse/pull/77785)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* clickhouse-server 向けに SSH プロトコルのサポートを導入しました。これにより、任意の SSH クライアントを使用して ClickHouse に接続できるようになりました。これにより次の課題がクローズされます: [#74340](https://github.com/ClickHouse/ClickHouse/issues/74340)。[#74989](https://github.com/ClickHouse/ClickHouse/pull/74989)（[George Gamezardashvili](https://github.com/Infjoker)）。
* 並列レプリカが有効な場合、テーブル関数を対応する -Cluster 版に置き換えました。これにより [#65024](https://github.com/ClickHouse/ClickHouse/issues/65024) が修正されます。[#70659](https://github.com/ClickHouse/ClickHouse/pull/70659)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Userspace Page Cache の新しい実装。OS のページキャッシュに依存する代わりにプロセス内メモリにデータをキャッシュできるようにするもので、データがローカルファイルシステムキャッシュを利用できないリモートの仮想ファイルシステム上に保存されている場合に有用です。 [#70509](https://github.com/ClickHouse/ClickHouse/pull/70509) ([Michael Kolupaev](https://github.com/al13n321)).
* 同時実行クエリ間での CPU スロットの割り当て方法を制御するサーバー設定 `concurrent_threads_scheduler` を追加しました。`round_robin`（これまでの動作）または `fair_round_robin` を指定でき、INSERT と SELECT 間の CPU 割り当ての不公平さの問題に対処します。 [#75949](https://github.com/ClickHouse/ClickHouse/pull/75949) ([Sergei Trifonov](https://github.com/serxa))。
* `estimateCompressionRatio` 集約関数を追加しました [#70801](https://github.com/ClickHouse/ClickHouse/issues/70801)。 [#76661](https://github.com/ClickHouse/ClickHouse/pull/76661) ([Tariq Almawash](https://github.com/talmawash))。
* 関数 `arraySymmetricDifference` を追加しました。複数の配列引数のうち、すべての引数に共通して含まれていない要素をすべて返します。例: `SELECT arraySymmetricDifference([1, 2], [2, 3])` は `[1, 3]` を返します。(issue [#61673](https://github.com/ClickHouse/ClickHouse/issues/61673))。[#76231](https://github.com/ClickHouse/ClickHouse/pull/76231)（[Filipp Abapolov](https://github.com/pheepa)）。
* Iceberg ストレージ/テーブル関数の設定 `iceberg_metadata_file_path` を使用して、読み取るメタデータファイルを明示的に指定できるようにしました。 [#47412](https://github.com/ClickHouse/ClickHouse/issues/47412) を修正しました。 [#77318](https://github.com/ClickHouse/ClickHouse/pull/77318) ([alesapin](https://github.com/alesapin))。
* ブロックチェーン実装、特に EVM ベースのシステムで一般的に使用される `keccak256` ハッシュ関数を追加しました。 [#76669](https://github.com/ClickHouse/ClickHouse/pull/76669) ([Arnaud Briche](https://github.com/arnaudbriche))。
* 3 つの新しい関数を追加しました。仕様に準拠した `icebergTruncate`（[https://iceberg.apache.org/spec/#truncate-transform-details](https://iceberg.apache.org/spec/#truncate-transform-details) を参照）、`toYearNumSinceEpoch` および `toMonthNumSinceEpoch` です。`Iceberg` エンジンにおけるパーティションプルーニングで `truncate` 変換をサポートしました。[#77403](https://github.com/ClickHouse/ClickHouse/pull/77403)（[alesapin](https://github.com/alesapin)）。
* `LowCardinality(Decimal)` データ型をサポートしました [#72256](https://github.com/ClickHouse/ClickHouse/issues/72256)。 [#72833](https://github.com/ClickHouse/ClickHouse/pull/72833)（[zhanglistar](https://github.com/zhanglistar)）。
* `FilterTransformPassedRows` と `FilterTransformPassedBytes` のプロファイルイベントは、クエリ実行中にフィルタリングされた行数とバイト数を示します。 [#76662](https://github.com/ClickHouse/ClickHouse/pull/76662) ([Onkar Deshpande](https://github.com/onkar))。
* ヒストグラム型メトリクスのサポート。インターフェイスは Prometheus クライアントのものをほぼ踏襲しており、値に対応するバケットのカウンターをインクリメントするには、単に `observe(value)` を呼び出すだけです。ヒストグラムメトリクスは `system.histogram_metrics` を通じて公開されます。 [#75736](https://github.com/ClickHouse/ClickHouse/pull/75736) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* 明示的な値に基づいて分岐できる非定数 `CASE` のサポート。 [#77399](https://github.com/ClickHouse/ClickHouse/pull/77399) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).

#### 実験的機能 {#experimental-feature}

* AWS S3 およびローカルファイルシステム上の Delta Lake テーブルに対して [Unity Catalog のサポートを追加](https://www.databricks.com/product/unity-catalog) しました。[#76988](https://github.com/ClickHouse/ClickHouse/pull/76988)（[alesapin](https://github.com/alesapin)）。
* Iceberg テーブル向けに AWS Glue サービスカタログとの実験的な連携を導入しました。[#77257](https://github.com/ClickHouse/ClickHouse/pull/77257)（[alesapin](https://github.com/alesapin)）。
* 動的クラスタ自動検出のサポートを追加しました。これは既存の _node_ 自動検出機能を拡張するものです。ClickHouse は、`<multicluster_root_path>` を利用して共通の ZooKeeper パス配下に新しい _clusters_ を自動的に検出および登録できるようになりました。[#76001](https://github.com/ClickHouse/ClickHouse/pull/76001)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* 新しい設定 `enable_replacing_merge_with_cleanup_for_min_age_to_force_merge` により、設定可能なタイムアウト後にパーティション全体を自動的にクリーンアップマージできるようになりました。[#76440](https://github.com/ClickHouse/ClickHouse/pull/76440)（[Christoph Wurm](https://github.com/cwurm)）。

#### パフォーマンスの改善 {#performance-improvement}

* 繰り返し利用される条件に対してクエリ条件キャッシュを実装し、クエリのパフォーマンスを向上しました。条件を満たさないデータ部分の範囲をメモリ内の一時インデックスとして記憶し、後続のクエリでこのインデックスを利用します。[#67768](https://github.com/ClickHouse/ClickHouse/issues/67768) [#69236](https://github.com/ClickHouse/ClickHouse/pull/69236)（[zhongyuankai](https://github.com/zhongyuankai)）。
* パーツ削除時にキャッシュからデータを積極的に追い出すようにしました。データ量がそれより少ない場合に、キャッシュが最大サイズまで成長しないようにします。[#76641](https://github.com/ClickHouse/ClickHouse/pull/76641)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 算術計算において Int256 および UInt256 を clang 組み込みの i256 に置き換え、パフォーマンスを改善しました [#70502](https://github.com/ClickHouse/ClickHouse/issues/70502)。[#73658](https://github.com/ClickHouse/ClickHouse/pull/73658)（[李扬](https://github.com/taiyang-li)）。
* 一部のケース（例: 空の配列カラム）では、データパーツに空ファイルが含まれることがあります。テーブルがメタデータとオブジェクトストレージが分離されたディスク上に存在する場合、そのようなファイルについては空の BLOB の書き込みをスキップし、メタデータのみを保存できるようにしました。[#75860](https://github.com/ClickHouse/ClickHouse/pull/75860)（[Alexander Gololobov](https://github.com/davenger)）。
* Decimal32/Decimal64/DateTime64 に対する min/max のパフォーマンスを改善しました。[#76570](https://github.com/ClickHouse/ClickHouse/pull/76570)（[李扬](https://github.com/taiyang-li)）。
* クエリコンパイル（`compile_expressions` 設定）がマシンタイプを考慮するようになりました。これにより、そのようなクエリが大幅に高速化されます。[#76753](https://github.com/ClickHouse/ClickHouse/pull/76753)（[ZhangLiStar](https://github.com/zhanglistar)）。
* `arraySort` を最適化しました。[#76850](https://github.com/ClickHouse/ClickHouse/pull/76850)（[李扬](https://github.com/taiyang-li)）。
* マージなどでキャッシュが受動的に使用される場合は、`filesystem_cache_prefer_bigger_buffer_size` を無効化しました。[#77898](https://github.com/ClickHouse/ClickHouse/pull/77898)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* コードの一部に `preserve_most` 属性を適用し、わずかにより良いコード生成を可能にしました。[#67778](https://github.com/ClickHouse/ClickHouse/pull/67778)（[Nikita Taranov](https://github.com/nickitat)）。
* ClickHouse サーバーのシャットダウンを高速化しました（2.5 秒の遅延を排除）。[#76550](https://github.com/ClickHouse/ClickHouse/pull/76550)（[Azat Khuzhin](https://github.com/azat)）。
* ReadBufferFromS3 およびその他のリモート読み取りバッファで過剰なメモリアロケーションを回避し、メモリ消費を半分に削減しました。[#76692](https://github.com/ClickHouse/ClickHouse/pull/76692)（[Sema Checherinda](https://github.com/CheSema)）。
* zstd を 1.5.5 から 1.5.7 に更新しました。これにより、いくつかの[パフォーマンス向上](https://github.com/facebook/zstd/releases/tag/v1.5.7)が見込めます。[#77137](https://github.com/ClickHouse/ClickHouse/pull/77137)（[Pradeep Chhetri](https://github.com/chhetripradeep)）。
* Wide パーツにおける JSON カラムのプリフェッチ時のメモリ使用量を削減しました。これは、ClickHouse Cloud のように共有ストレージ上で ClickHouse を使用する場合に有効です。[#77640](https://github.com/ClickHouse/ClickHouse/pull/77640)（[Pavel Kruglov](https://github.com/Avogar)）。

#### 改善点 {#improvement}

* `INTO OUTFILE` と併用される `TRUNCATE` でアトミックなリネームをサポートし、[#70323](https://github.com/ClickHouse/ClickHouse/issues/70323) を解決しました。[#77181](https://github.com/ClickHouse/ClickHouse/pull/77181)（[Onkar Deshpande](https://github.com/onkar)）。
* 設定の float 値として `NaN` や `inf` を使用することは、もはやできません。もっとも、そもそも以前からそれには何の意味もありませんでしたが。 [#77546](https://github.com/ClickHouse/ClickHouse/pull/77546) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* analyzer が無効化されている場合、`compatibility` 設定に関係なく、デフォルトで parallel replicas を無効にします。この動作は、`parallel_replicas_only_with_analyzer` を明示的に `false` に設定することで変更できます。 [#77115](https://github.com/ClickHouse/ClickHouse/pull/77115) ([Igor Nikonov](https://github.com/devcrafter)).
* クライアントリクエストのヘッダーから外部 HTTP 認証サービスへ転送するヘッダーのリストを定義できる機能を追加しました。 [#77054](https://github.com/ClickHouse/ClickHouse/pull/77054) ([inv2004](https://github.com/inv2004)).
* タプル型カラム内のフィールドに対するカラム名の大文字小文字を区別しないマッチングを正しく扱うようにしました。 [https://github.com/apache/incubator-gluten/issues/8324](https://github.com/apache/incubator-gluten/issues/8324) をクローズしました。 [#73780](https://github.com/ClickHouse/ClickHouse/pull/73780)（[李扬](https://github.com/taiyang-li)）。
* Gorilla コーデックのパラメータは、今後常に .sql ファイル内のテーブルメタデータに保存されるようになりました。これにより次の問題が解決されます: [#70072](https://github.com/ClickHouse/ClickHouse/issues/70072)。[#74814](https://github.com/ClickHouse/ClickHouse/pull/74814)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* 特定のデータレイク向けにパース処理を強化しました（Sequence ID のパース：マニフェストファイル内のシーケンス識別子をパースする機能を追加し、Avro メタデータのパース：将来の拡張が容易になるよう Avro メタデータパーサーを再設計しました）。 [#75010](https://github.com/ClickHouse/ClickHouse/pull/75010) ([Daniil Ivanik](https://github.com/divanik)).
* `system.opentelemetry_span_log` のデフォルト ORDER BY から trace&#95;id を削除しました。 [#75907](https://github.com/ClickHouse/ClickHouse/pull/75907) ([Azat Khuzhin](https://github.com/azat)).
* 暗号化属性 `encrypted_by` は、任意の設定ファイル（config.xml、users.xml、ネストされた設定ファイル）に適用できるようになりました。以前は、トップレベルの config.xml ファイルに対してのみ有効でした。 [#75911](https://github.com/ClickHouse/ClickHouse/pull/75911) ([Mikhail Gorshkov](https://github.com/mgorshkov))。
* `system.warnings` テーブルを改善し、追加・更新・削除が可能な動的な警告メッセージをいくつか追加しました。 [#76029](https://github.com/ClickHouse/ClickHouse/pull/76029) ([Bharat Nallan](https://github.com/bharatnc)).
* このPRにより、すべての `DROP` 操作を先に記述する必要があるため、クエリ `ALTER USER user1 ADD PROFILES a, DROP ALL PROFILES` を実行できなくなりました。 [#76242](https://github.com/ClickHouse/ClickHouse/pull/76242) ([pufit](https://github.com/pufit)).
* SYNC REPLICA に対するさまざまな改善（エラーメッセージの改善、テストの改善、サニティチェックの追加）。 [#76307](https://github.com/ClickHouse/ClickHouse/pull/76307) ([Azat Khuzhin](https://github.com/azat)).
* バックアップ中に「Access Denied」により S3 へのマルチパートコピーが失敗した場合に、正しいフォールバック処理を行うようにしました。異なる認証情報を持つバケット間でバックアップを行うと、マルチパートコピーで「Access Denied」エラーが発生することがあります。 [#76515](https://github.com/ClickHouse/ClickHouse/pull/76515) ([Antonio Andelic](https://github.com/antonio2368)).
* librdkafka（出来の悪い代物）をバージョン 2.8.0 にアップグレードし（出来の悪さは相変わらずですが）、Kafka テーブルのシャットダウン手順を改善して、テーブル削除およびサーバー再起動時の遅延を削減しました。`engine=Kafka` は、テーブルが削除されたときにコンシューマグループを明示的に離脱しなくなりました。代わりに、コンシューマは非アクティブ状態が `session_timeout_ms`（デフォルト: 45 秒）を超えるまでグループに残り、その後自動的に削除されます。[#76621](https://github.com/ClickHouse/ClickHouse/pull/76621)（[filimonov](https://github.com/filimonov)）。
* S3 リクエスト設定のバリデーションを修正。[#76658](https://github.com/ClickHouse/ClickHouse/pull/76658) ([Vitaly Baranov](https://github.com/vitlibar)).
* `server_settings` や `settings` のようなシステムテーブルには、便利な `default` 値の列があります。同様の列を `merge_tree_settings` と `replicated_merge_tree_settings` に追加しました。 [#76942](https://github.com/ClickHouse/ClickHouse/pull/76942) ([Diego Nieto](https://github.com/lesandie)).
* `ProfileEvents::QueryPreempted` を追加しました。`CurrentMetrics::QueryPreempted` と同様のロジックです。 [#77015](https://github.com/ClickHouse/ClickHouse/pull/77015) ([VicoWu](https://github.com/VicoWu))。
* 過去のバージョンでは、`Replicated` データベースがクエリ内で指定された認証情報をログに出力してしまう場合がありました。この動作は修正されました。これにより、関連 Issue: [#77123](https://github.com/ClickHouse/ClickHouse/issues/77123) がクローズされました。[#77133](https://github.com/ClickHouse/ClickHouse/pull/77133)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `plain_rewritable` ディスクに対して ALTER TABLE DROP PARTITION を許可。 [#77138](https://github.com/ClickHouse/ClickHouse/pull/77138) ([Julia Kartseva](https://github.com/jkartseva)).
* バックアップ/リストア設定 `allow_s3_native_copy` は、現在次の 3 つの値をサポートします: - `False` - S3 ネイティブコピーは使用されません。 - `True` (従来のデフォルト) - ClickHouse はまず S3 ネイティブコピーを試み、失敗した場合は読み取り + 書き込み方式にフォールバックします。 - `'auto'` (新しいデフォルト) - ClickHouse はまずソースとデスティネーションのクレデンシャルを比較します。同一であれば ClickHouse は S3 ネイティブコピーを試み、その後、読み取り + 書き込み方式にフォールバックする場合があります。異なる場合、ClickHouse は最初から読み取り + 書き込み方式を使用します。 [#77401](https://github.com/ClickHouse/ClickHouse/pull/77401) ([Vitaly Baranov](https://github.com/vitlibar)).
* DeltaLake テーブルエンジン向けの delta kernel で、AWS セッショントークンおよび環境変数から取得する認証情報の利用をサポートしました。 [#77661](https://github.com/ClickHouse/ClickHouse/pull/77661) ([Kseniia Sumarokova](https://github.com/kssenii)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* 非同期分散 INSERT の保留中バッチの処理中に（`No such file or directory` などが原因で）処理が停止してしまう問題を修正しました。 [#72939](https://github.com/ClickHouse/ClickHouse/pull/72939) ([Azat Khuzhin](https://github.com/azat)).
* インデックス解析時に行われる暗黙的な `Date` から `DateTime` への変換に対して飽和動作を強制することで、日時変換を改善しました。これにより、日時の範囲制限が原因で発生しうるインデックス解析の不正確さの問題が解消されます。この変更により [#73307](https://github.com/ClickHouse/ClickHouse/issues/73307) が修正されました。また、デフォルト値である `date_time_overflow_behavior = 'ignore'` 設定時の明示的な `toDateTime` 変換も修正しました。[#73326](https://github.com/ClickHouse/ClickHouse/pull/73326)（[Amos Bird](https://github.com/amosbird)）。
* UUID とテーブル名の競合に起因するさまざまなバグを修正しました（たとえば、`RENAME` と `RESTART REPLICA` 間の競合を解消します。`SYSTEM RESTART REPLICA` と同時に `RENAME` が実行される場合、誤ったレプリカを再起動してしまったり、いずれかのテーブルが `Table X is being restarted` 状態のまま残ってしまう可能性がありました）。 [#76308](https://github.com/ClickHouse/ClickHouse/pull/76308) ([Azat Khuzhin](https://github.com/azat)).
* async insert を有効にし、`INSERT INTO ... FROM FILE ...` を異なるブロックサイズで実行したときのデータ損失を修正しました。最初のブロックサイズが `async_max_size` 未満で、2 番目のブロックサイズが `async_max_size` を超える場合、2 番目のブロックが挿入されず、これらのデータが `squashing` に残ったままになる問題がありました。 [#76343](https://github.com/ClickHouse/ClickHouse/pull/76343) ([Han Fei](https://github.com/hanfei1991)).
* `system.data_skipping_indices` のフィールド名 &#39;marks&#39; を &#39;marks&#95;bytes&#39; に変更しました。 [#76374](https://github.com/ClickHouse/ClickHouse/pull/76374) ([Robert Schulze](https://github.com/rschu1ze)).
* 動的なファイルシステムキャッシュのリサイズ時に、エビクション処理中に発生する予期しないエラーの扱いを修正しました。 [#76466](https://github.com/ClickHouse/ClickHouse/pull/76466) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 並列ハッシュにおける `used_flag` の初期化を修正しました。これによりサーバーがクラッシュする可能性がありました。 [#76580](https://github.com/ClickHouse/ClickHouse/pull/76580) ([Nikita Taranov](https://github.com/nickitat)).
* Projection 内で `defaultProfiles` 関数を呼び出す際に発生していた論理エラーを修正。 [#76627](https://github.com/ClickHouse/ClickHouse/pull/76627) ([pufit](https://github.com/pufit)).
* Web UI においてブラウザによる対話的な Basic 認証を要求しないようにしました。Closes [#76319](https://github.com/ClickHouse/ClickHouse/issues/76319)。[#76637](https://github.com/ClickHouse/ClickHouse/pull/76637) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 分散テーブルからブールリテラルを選択した際にスローされる `THERE_IS_NO_COLUMN` 例外を修正。 [#76656](https://github.com/ClickHouse/ClickHouse/pull/76656) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* テーブルディレクトリ内のサブパスは、より高度な方法で選択されるようになりました。 [#76681](https://github.com/ClickHouse/ClickHouse/pull/76681) ([Daniil Ivanik](https://github.com/divanik)).
* サブカラムを含む主キー (PK) を持つテーブルを変更した後に発生する `Not found column in block` エラーを修正しました。[https://github.com/ClickHouse/ClickHouse/pull/72644](https://github.com/ClickHouse/ClickHouse/pull/72644) 以降では、[https://github.com/ClickHouse/ClickHouse/pull/74403](https://github.com/ClickHouse/ClickHouse/pull/74403) が必要です。[#76686](https://github.com/ClickHouse/ClickHouse/pull/76686)（[Nikolai Kochetov](https://github.com/KochetovNicolai)）。
* NULL ショートサーキット用のパフォーマンステストを追加し、バグを修正。 [#76708](https://github.com/ClickHouse/ClickHouse/pull/76708) ([李扬](https://github.com/taiyang-li))。
* 出力書き込みバッファをファイナライズする前にフラッシュするようにしました。`JSONEachRowWithProgressRowOutputFormat` など一部の出力フォーマットのファイナライズ中に発生していた `LOGICAL_ERROR` を修正しました。 [#76726](https://github.com/ClickHouse/ClickHouse/pull/76726) ([Antonio Andelic](https://github.com/antonio2368))。
* MongoDB のバイナリ UUID への対応を追加しました（[#74452](https://github.com/ClickHouse/ClickHouse/issues/74452)）。- テーブル関数使用時の MongoDB への WHERE 句プッシュダウンを修正しました（[#72210](https://github.com/ClickHouse/ClickHouse/issues/72210)）。- MongoDB のバイナリ UUID は ClickHouse の UUID にのみ解釈されるように、MongoDB - ClickHouse の型マッピングを変更しました。これにより、将来的なあいまいさや予期しない挙動を防ぐことができます。- 後方互換性を保ちつつ OID のマッピングを修正しました。[#76762](https://github.com/ClickHouse/ClickHouse/pull/76762)（[Kirill Nikiforov](https://github.com/allmazz)）。
* JSON サブカラムの並列プレフィックス デシリアライズ時の例外処理を修正。 [#76809](https://github.com/ClickHouse/ClickHouse/pull/76809) ([Pavel Kruglov](https://github.com/Avogar)).
* 負の整数に対する `lgamma` 関数の挙動を修正しました。 [#76840](https://github.com/ClickHouse/ClickHouse/pull/76840) ([Ilya Kataev](https://github.com/IlyaKataev)).
* 明示的に定義されたプライマリキーに対する逆キー解析を修正。[#76654](https://github.com/ClickHouse/ClickHouse/issues/76654) と同様。[#76846](https://github.com/ClickHouse/ClickHouse/pull/76846) ([Amos Bird](https://github.com/amosbird))。
* JSON フォーマットにおける Bool 値の整形出力を修正。 [#76905](https://github.com/ClickHouse/ClickHouse/pull/76905) ([Pavel Kruglov](https://github.com/Avogar)).
* 非同期挿入中のエラー時に、不正な JSON 列に対するロールバック処理が原因でクラッシュが発生する可能性があった問題を修正しました。 [#76908](https://github.com/ClickHouse/ClickHouse/pull/76908) ([Pavel Kruglov](https://github.com/Avogar)).
* 以前は、`multiIf` が計画段階と本実行時で異なる型のカラムを返す場合がありました。これにより、C++ の観点では未定義動作となるコードが生成されていました。 [#76914](https://github.com/ClickHouse/ClickHouse/pull/76914) ([Nikita Taranov](https://github.com/nickitat))。
* MergeTree における定数 Nullable キーのシリアライゼーションが誤っていた問題を修正しました。これにより [#76939](https://github.com/ClickHouse/ClickHouse/issues/76939) が解決されます。[#76985](https://github.com/ClickHouse/ClickHouse/pull/76985)（[Amos Bird](https://github.com/amosbird)）。
* `BFloat16` 値のソートを修正しました。これにより [#75487](https://github.com/ClickHouse/ClickHouse/issues/75487) および [#75669](https://github.com/ClickHouse/ClickHouse/issues/75669) が解決されます。[#77000](https://github.com/ClickHouse/ClickHouse/pull/77000)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パート整合性チェックにおいてエフェメラルなサブカラムをスキップするためのチェックを追加し、Variant サブカラムを含む JSON に関するバグを修正しました。 [#72187](https://github.com/ClickHouse/ClickHouse/issues/72187)。 [#77034](https://github.com/ClickHouse/ClickHouse/pull/77034) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* 型不一致がある場合に Values フォーマットのテンプレート解析でクラッシュする問題を修正。 [#77071](https://github.com/ClickHouse/ClickHouse/pull/77071) ([Pavel Kruglov](https://github.com/Avogar))。
* 主キーにサブカラムを含む EmbeddedRocksDB テーブルを作成できないようにしました。以前はそのようなテーブルを作成できていましたが、`SELECT` クエリの実行が失敗していました。 [#77074](https://github.com/ClickHouse/ClickHouse/pull/77074) ([Pavel Kruglov](https://github.com/Avogar)).
* 分散クエリにおいて、述語をリモート側にプッシュダウンする際にリテラル型が正しく扱われないことが原因で発生していた不正な比較を修正しました。 [#77093](https://github.com/ClickHouse/ClickHouse/pull/77093) ([Duc Canh Le](https://github.com/canhld94)).
* Kafka テーブル作成時の例外により発生するクラッシュを修正。 [#77121](https://github.com/ClickHouse/ClickHouse/pull/77121) ([Pavel Kruglov](https://github.com/Avogar)).
* Kafka および RabbitMQ エンジンで JSON およびサブカラムのサポートを追加。 [#77122](https://github.com/ClickHouse/ClickHouse/pull/77122) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS における例外スタックアンワインドを修正。 [#77126](https://github.com/ClickHouse/ClickHouse/pull/77126) ([Eduard Karacharov](https://github.com/korowa)).
* getSubcolumn 関数における &#39;null&#39; サブカラムの読み取りを修正。 [#77163](https://github.com/ClickHouse/ClickHouse/pull/77163) ([Pavel Kruglov](https://github.com/Avogar))。
* Array や未サポート関数を使用する Bloom filter インデックスを修正。 [#77271](https://github.com/ClickHouse/ClickHouse/pull/77271) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル数に対する制限のチェックは、初回の CREATE クエリ実行時にのみ行うようにしました。 [#77274](https://github.com/ClickHouse/ClickHouse/pull/77274) ([Nikolay Degterinsky](https://github.com/evillique)).
* バグではありません: `SELECT toBFloat16(-0.0) == toBFloat16(0.0)` は、以前は `false` を返していましたが、現在は正しく `true` を返します。これにより、`Float32` および `Float64` の挙動と一貫性が取れるようになりました。 [#77290](https://github.com/ClickHouse/ClickHouse/pull/77290) ([Shankar Iyer](https://github.com/shankar-iyer)).
* 初期化されていない `key_index` 変数を誤って参照してしまう可能性がある問題を修正しました。これはデバッグビルドではクラッシュの原因になり得ますが、リリースビルドでは、その後のコードが例外を送出する可能性が高いため、この未初期化参照自体が問題を引き起こすことはありません。### ユーザー向け変更に関するドキュメント項目です。[#77305](https://github.com/ClickHouse/ClickHouse/pull/77305) ([wxybear](https://github.com/wxybear)).
* ブール値を持つパーティションの名前を修正しました。この不具合は [https://github.com/ClickHouse/ClickHouse/pull/74533](https://github.com/ClickHouse/ClickHouse/pull/74533) で発生していました。[#77319](https://github.com/ClickHouse/ClickHouse/pull/77319)（[Pavel Kruglov](https://github.com/Avogar)）。
* Nullable 要素を含む Tuple と String 間の比較処理を修正しました。例えば、この変更以前は、Tuple `(1, null)` と String `'(1,null)'` の比較はエラーになっていました。別の例として、Nullable 列である `a` を含む Tuple `(1, a)` と String `'(1, 2)'` の比較があります。この変更により、これらの問題が解消されました。 [#77323](https://github.com/ClickHouse/ClickHouse/pull/77323) ([Alexey Katsman](https://github.com/alexkats)).
* ObjectStorageQueueSource のクラッシュを修正しました。このクラッシュは [https://github.com/ClickHouse/ClickHouse/pull/76358](https://github.com/ClickHouse/ClickHouse/pull/76358) で導入されたものです。[#77325](https://github.com/ClickHouse/ClickHouse/pull/77325)（[Pavel Kruglov](https://github.com/Avogar)）。
* `input` 使用時の `async_insert` を修正。 [#77340](https://github.com/ClickHouse/ClickHouse/pull/77340) ([Azat Khuzhin](https://github.com/azat)).
* 修正: ソート列がプランナーによって削除された場合に、`WITH FILL` が NOT&#95;FOUND&#95;COLUMN&#95;IN&#95;BLOCK で失敗することがある問題を修正しました。INTERPOLATE 式に対して計算される DAG が不整合になることが原因の、類似の問題も修正しました。 [#77343](https://github.com/ClickHouse/ClickHouse/pull/77343) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 無効な AST ノードに対するエイリアス設定まわりの複数の LOGICAL&#95;ERROR を修正しました。 [#77445](https://github.com/ClickHouse/ClickHouse/pull/77445) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルシステムキャッシュの実装で、ファイルセグメント書き込み中のエラー処理を修正しました。 [#77471](https://github.com/ClickHouse/ClickHouse/pull/77471) ([Kseniia Sumarokova](https://github.com/kssenii)).
* DatabaseIceberg がカタログから提供される正しいメタデータファイルを使用するようにしました。[#75187](https://github.com/ClickHouse/ClickHouse/issues/75187) を修正。[#77486](https://github.com/ClickHouse/ClickHouse/pull/77486)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* クエリキャッシュは、UDF を非決定的であるものと仮定するようになりました。これに伴い、UDF を含むクエリの結果はキャッシュされなくなりました。以前は、結果が誤ってキャッシュされてしまう非決定的な UDF をユーザーが定義できていました（issue [#77553](https://github.com/ClickHouse/ClickHouse/issues/77553)）。[#77633](https://github.com/ClickHouse/ClickHouse/pull/77633)（[Jimmy Aguilar Mena](https://github.com/Ergus)）。
* `enable_filesystem_cache_log` 設定が有効な場合にしか機能していなかった system.filesystem&#95;cache&#95;log を修正。 [#77650](https://github.com/ClickHouse/ClickHouse/pull/77650) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Projection 内で `defaultRoles` 関数を呼び出した際の論理エラーを修正。[#76627](https://github.com/ClickHouse/ClickHouse/issues/76627) のフォローアップ。[#77667](https://github.com/ClickHouse/ClickHouse/pull/77667)（[pufit](https://github.com/pufit)）。
* 関数 `arrayResize` の第 2 引数として型 `Nullable` を指定することは現在禁止されています。以前は、第 2 引数が `Nullable` の場合、エラーの発生から誤った結果の返却まで、さまざまな問題が起こり得ました（issue [#48398](https://github.com/ClickHouse/ClickHouse/issues/48398)）。[#77724](https://github.com/ClickHouse/ClickHouse/pull/77724)（[Manish Gill](https://github.com/mgill25)）。
* 操作が書き込み用のブロックを一切生成しない場合でも、マージおよびミューテーションがキャンセルされたかどうかを定期的に確認するようになりました。 [#77766](https://github.com/ClickHouse/ClickHouse/pull/77766) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* `clickhouse-odbc-bridge` と `clickhouse-library-bridge` は、別のリポジトリである https://github.com/ClickHouse/odbc-bridge/ に移動されました。[#76225](https://github.com/ClickHouse/ClickHouse/pull/76225) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Rust のクロスコンパイルを修正し、Rust を完全に無効化できるようにしました。[#76921](https://github.com/ClickHouse/ClickHouse/pull/76921) ([Raúl Marín](https://github.com/Algunenano))。

### ClickHouse リリース 25.2, 2025-02-27 {#252}

#### 後方互換性のない変更 {#backward-incompatible-change}

* `async_load_databases` を完全に有効化し、デフォルト設定としました（`config.xml` をアップグレードしていないインストール環境でも有効になります）。[#74772](https://github.com/ClickHouse/ClickHouse/pull/74772)（[Azat Khuzhin](https://github.com/azat)）。
* `JSONCompactEachRowWithProgress` および `JSONCompactStringsEachRowWithProgress` フォーマットを追加しました。[#69989](https://github.com/ClickHouse/ClickHouse/issues/69989) の継続対応です。`JSONCompactWithNames` と `JSONCompactWithNamesAndTypes` はもはや "totals" を出力しません — 実装上の誤りだったと考えられます。[#75037](https://github.com/ClickHouse/ClickHouse/pull/75037)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ALTER コマンドリストの曖昧さを解消するため、`format_alter_operations_with_parentheses` のデフォルト値を true に変更しました（https://github.com/ClickHouse/ClickHouse/pull/59532 を参照）。これにより、バージョン 24.3 以前のクラスタとのレプリケーションが動作しなくなります。古いリリースを使用しているクラスタをアップグレードする場合は、サーバー設定でこの設定を無効にするか、先に 24.3 にアップグレードしてください。[#75302](https://github.com/ClickHouse/ClickHouse/pull/75302)（[Raúl Marín](https://github.com/Algunenano)）。
* 正規表現を使用してログメッセージをフィルタリングする機能を削除しました。この実装にデータレースが存在したため、削除しました。[#75577](https://github.com/ClickHouse/ClickHouse/pull/75577)（[János Benjamin Antal](https://github.com/antaljanosbenjamin)）。
* 設定 `min_chunk_bytes_for_parallel_parsing` には、もはやゼロを指定できなくなりました。これにより次の問題が修正されます: [#71110](https://github.com/ClickHouse/ClickHouse/issues/71110)。[#75239](https://github.com/ClickHouse/ClickHouse/pull/75239)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* キャッシュ設定内の設定項目を検証するようにしました。存在しない設定はこれまで無視されていましたが、今後はエラーを返すようになり、それらは削除する必要があります。[#75452](https://github.com/ClickHouse/ClickHouse/pull/75452)（[Kseniia Sumarokova](https://github.com/kssenii)）。

#### 新機能 {#new-feature}

* 型 `Nullable(JSON)` をサポートしました。[#73556](https://github.com/ClickHouse/ClickHouse/pull/73556) ([Pavel Kruglov](https://github.com/Avogar))。
* DEFAULT および MATERIALIZED 式でサブカラムをサポートしました。[#74403](https://github.com/ClickHouse/ClickHouse/pull/74403) ([Pavel Kruglov](https://github.com/Avogar))。
* 設定 `output_format_parquet_write_bloom_filter`（デフォルトで有効）を使用した Parquet ブルームフィルタの書き込みをサポートしました。[#71681](https://github.com/ClickHouse/ClickHouse/pull/71681) ([Michael Kolupaev](https://github.com/al13n321))。
* Web UI にインタラクティブなデータベースナビゲーションが追加されました。[#75777](https://github.com/ClickHouse/ClickHouse/pull/75777) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ストレージポリシー内で、読み取り専用ディスクと読み書き可能ディスクの組み合わせ（複数ボリュームまたは複数ディスク）を許可しました。これにより、ボリューム全体からデータを読み取ることが可能になり、一方で挿入は書き込み可能ディスクが優先されます（いわゆる Copy-on-Write ストレージポリシー）。[#75862](https://github.com/ClickHouse/ClickHouse/pull/75862) ([Azat Khuzhin](https://github.com/azat))。
* 新しいデータベースエンジン `DatabaseBackup` を追加しました。これにより、バックアップからテーブル／データベースを即座に ATTACH できます。[#75725](https://github.com/ClickHouse/ClickHouse/pull/75725) ([Maksim Kita](https://github.com/kitaisreal))。
* Postgres ワイヤープロトコルでのプリペアドステートメントをサポートしました。[#75035](https://github.com/ClickHouse/ClickHouse/pull/75035) ([scanhex12](https://github.com/scanhex12))。
* データベースレイヤーなしでテーブルを ATTACH できるようにしました。これは、Web、S3 などの外部仮想ファイルシステム上にある MergeTree テーブルに対して有用です。[#75788](https://github.com/ClickHouse/ClickHouse/pull/75788) ([Azat Khuzhin](https://github.com/azat))。
* 新しい文字列比較関数 `compareSubstrings` を追加しました。2 つの文字列の一部を比較します。例: `SELECT compareSubstrings('Saxony', 'Anglo-Saxon', 0, 6, 5) AS result` は「1 つ目の文字列のオフセット 0、2 つ目の文字列のオフセット 5 から、それぞれ 6 バイト分の 'Saxon' と 'Anglo-Saxon' を辞書順で比較する」ことを意味します。[#74070](https://github.com/ClickHouse/ClickHouse/pull/74070) ([lgbo](https://github.com/lgbo-ustc))。
* 新しい関数 `initialQueryStartTime` を追加しました。現在のクエリの開始時刻を返します。この値は分散クエリにおいて、すべてのシャードで同一です。[#75087](https://github.com/ClickHouse/ClickHouse/pull/75087) ([Roman Lomonosov](https://github.com/lomik))。
* MySQL における Named Collection を用いた SSL 認証をサポートしました。[#59111](https://github.com/ClickHouse/ClickHouse/issues/59111) を解決します。[#59452](https://github.com/ClickHouse/ClickHouse/pull/59452) ([Nikolay Degterinsky](https://github.com/evillique))。

#### 実験的機能 {#experimental-features}

* 新しい設定 `enable_adaptive_memory_spill_scheduler` を追加しました。この設定により、同一クエリ内の複数の Grace JOIN が合計のメモリフットプリントを監視し、MEMORY_LIMIT_EXCEEDED を防ぐために外部ストレージへのスピルを適応的にトリガーできるようになります。 [#72728](https://github.com/ClickHouse/ClickHouse/pull/72728) ([lgbo](https://github.com/lgbo-ustc)).
* 新しい実験的な `Kafka` テーブルエンジンが Keeper の機能フラグを完全に順守するようにしました。 [#76004](https://github.com/ClickHouse/ClickHouse/pull/76004) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* ライセンス上の問題により v24.10 で削除されていた (Intel) QPL コーデックを復元しました。 [#76021](https://github.com/ClickHouse/ClickHouse/pull/76021) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* HDFS との連携向けとして、`dfs.client.use.datanode.hostname` 設定オプションのサポートを追加しました。 [#74635](https://github.com/ClickHouse/ClickHouse/pull/74635) ([Mikhail Tiukavkin](https://github.com/freshertm)).

#### パフォーマンスの改善 {#performance-improvement}

* Wide パーツにおける JSON カラム全体の S3 からの読み取りパフォーマンスを改善しました。これは、サブカラムプレフィックスのデシリアライズに対するプリフェッチの追加、デシリアライズ済みプレフィックスのキャッシュ、およびサブカラムプレフィックスの並列デシリアライズにより実現しています。この変更により、`SELECT data FROM table` のようなクエリで S3 からの JSON カラムの読み取りが 4 倍、`SELECT data FROM table LIMIT 10` のようなクエリでは約 10 倍高速になります。[#74827](https://github.com/ClickHouse/ClickHouse/pull/74827)（[Pavel Kruglov](https://github.com/Avogar)）。
* `max_rows_in_join = max_bytes_in_join = 0` の場合に `parallel_hash` 内で発生していた不要な競合を修正しました。[#75155](https://github.com/ClickHouse/ClickHouse/pull/75155)（[Nikita Taranov](https://github.com/nickitat)）。
* オプティマイザにより結合の左右が入れ替えられた場合に、`ConcurrentHashJoin` で二重に事前アロケーションされていた問題を修正しました。[#75149](https://github.com/ClickHouse/ClickHouse/pull/75149)（[Nikita Taranov](https://github.com/nickitat)）。
* いくつかの JOIN シナリオでの軽微な改善として、出力行数を事前計算し、その分のメモリを事前確保するようにしました。[#75376](https://github.com/ClickHouse/ClickHouse/pull/75376)（[Alexander Gololobov](https://github.com/davenger)）。
* `WHERE a < b AND b < c AND c < 5` のようなクエリに対して、新たな比較条件（`a < 5 AND b < 5`）を推論してフィルタリング性能を向上できるようにしました。[#73164](https://github.com/ClickHouse/ClickHouse/pull/73164)（[Shichao Jin](https://github.com/jsc0218)）。
* Keeper の改善: インメモリストレージにコミットする際のダイジェスト計算を無効化してパフォーマンスを向上しました。この動作は `keeper_server.digest_enabled_on_commit` コンフィグで有効化できます。リクエストの前処理時には引き続きダイジェストが計算されます。[#75490](https://github.com/ClickHouse/ClickHouse/pull/75490)（[Antonio Andelic](https://github.com/antonio2368)）。
* 可能な場合に JOIN の ON 句からフィルタ式をプッシュダウンするようにしました。[#75536](https://github.com/ClickHouse/ClickHouse/pull/75536)（[Vladimir Cherkasov](https://github.com/vdimir)）。
* MergeTree において、カラムおよびインデックスのサイズを遅延評価するようにしました。[#75938](https://github.com/ClickHouse/ClickHouse/pull/75938)（[Pavel Kruglov](https://github.com/Avogar)）。
* `MATERIALIZE TTL` において `ttl_only_drop_parts` 設定を再び尊重するようにしました。TTL を再計算してパーツを空のパーツに置き換えて削除するために、必要なカラムだけを読み取ります。[#72751](https://github.com/ClickHouse/ClickHouse/pull/72751)（[Andrey Zvonov](https://github.com/zvonand)）。
* plain_rewritable メタデータファイルの書き込みバッファサイズを削減しました。[#75758](https://github.com/ClickHouse/ClickHouse/pull/75758)（[Julia Kartseva](https://github.com/jkartseva)）。
* 一部のウィンドウ関数でのメモリ使用量を削減しました。[#65647](https://github.com/ClickHouse/ClickHouse/pull/65647)（[lgbo](https://github.com/lgbo-ustc)）。
* Parquet の Bloom filter と min/max インデックスを同時に評価するようにしました。これは、data = [1, 2, 4, 5] のときの `x = 3 or x > 5` のようなケースを正しくサポートするために必要です。[#71383](https://github.com/ClickHouse/ClickHouse/pull/71383)（[Arthur Passos](https://github.com/arthurpassos)）。
* `Executable` ストレージに渡されるクエリは、もはや単一スレッド実行に制限されません。[#70084](https://github.com/ClickHouse/ClickHouse/pull/70084)（[yawnt](https://github.com/yawnt)）。
* ALTER TABLE FETCH PARTITION でパーツを並列にフェッチするようにしました（スレッドプールサイズは `max_fetch_partition_thread_pool_size` で制御されます）。[#74978](https://github.com/ClickHouse/ClickHouse/pull/74978)（[Azat Khuzhin](https://github.com/azat)）。
* `indexHint` 関数を用いた述語を `PREWHERE` へ移動できるようにしました。[#74987](https://github.com/ClickHouse/ClickHouse/pull/74987)（[Anton Popov](https://github.com/CurtizJ)）。

#### 改善点 {#improvement}

* `LowCardinality` 列のメモリ上でのサイズ計算を修正しました。 [#74688](https://github.com/ClickHouse/ClickHouse/pull/74688) ([Nikita Taranov](https://github.com/nickitat)).
* `processors_profile_log` テーブルに、TTL を 30 日とするデフォルト設定が追加されました。[#66139](https://github.com/ClickHouse/ClickHouse/pull/66139) ([Ilya Yatsishin](https://github.com/qoega))。
* クラスタ構成でシャードに名前を付けられるようにしました。 [#72276](https://github.com/ClickHouse/ClickHouse/pull/72276) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* Prometheus の remote write 応答の成功ステータスコードを 200/OK から 204/NoContent に変更。 [#74170](https://github.com/ClickHouse/ClickHouse/pull/74170) ([Michael Dempsey](https://github.com/bluestealth)).
* サーバーを再起動することなく、その場で `max_remote_read_network_bandwidth_for_serve` と `max_remote_write_network_bandwidth_for_server` を再読み込みできるようにしました。 [#74206](https://github.com/ClickHouse/ClickHouse/pull/74206) ([Kai Zhu](https://github.com/nauu)).
* バックアップの作成時にチェックサムを計算する際、blob パスを使用できるようにしました。 [#74729](https://github.com/ClickHouse/ClickHouse/pull/74729) ([Vitaly Baranov](https://github.com/vitlibar)).
* `system.query_cache` にクエリ ID 列を追加しました（[#68205](https://github.com/ClickHouse/ClickHouse/issues/68205) を解決）。[#74982](https://github.com/ClickHouse/ClickHouse/pull/74982)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* `ALTER TABLE ... FREEZE ...` クエリを `KILL QUERY` でキャンセルしたり、タイムアウト（`max_execution_time`）に達した際に自動的にキャンセルしたりできるようになりました。[#75016](https://github.com/ClickHouse/ClickHouse/pull/75016) ([Kirill](https://github.com/kirillgarbar)).
* `groupUniqArrayArrayMap` の `SimpleAggregateFunction` としてのサポートを追加しました。[#75034](https://github.com/ClickHouse/ClickHouse/pull/75034) ([Miel Donkers](https://github.com/mdonkers))。
* データベースエンジン `Iceberg` でカタログ認証情報の設定を非表示にしました。Closes [#74559](https://github.com/ClickHouse/ClickHouse/issues/74559). [#75080](https://github.com/ClickHouse/ClickHouse/pull/75080) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `intExp2` / `intExp10`: 未定義動作を次のように定めました：引数が小さすぎる場合は 0 を返し、大きすぎる場合は `18446744073709551615` を返し、`NaN` の場合は例外をスローします。 [#75312](https://github.com/ClickHouse/ClickHouse/pull/75312) ([Vitaly Baranov](https://github.com/vitlibar)).
* `DatabaseIceberg` のカタログ設定から `s3.endpoint` をネイティブにサポートしました。[#74558](https://github.com/ClickHouse/ClickHouse/issues/74558) をクローズしました。[#75375](https://github.com/ClickHouse/ClickHouse/pull/75375)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* ユーザーが `SYSTEM DROP REPLICA` を実行する際に十分な権限を持っていない場合に、エラーを出さずに失敗することがないようにしました。 [#75377](https://github.com/ClickHouse/ClickHouse/pull/75377) ([Bharat Nallan](https://github.com/bharatnc)).
* いずれかの system ログがフラッシュに失敗した回数を記録する ProfileEvent を追加しました。 [#75466](https://github.com/ClickHouse/ClickHouse/pull/75466) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 復号および解凍のためのチェックと追加ログ出力を追加。 [#75471](https://github.com/ClickHouse/ClickHouse/pull/75471) ([Vitaly Baranov](https://github.com/vitlibar)).
* `parseTimeDelta` 関数にマイクロ記号 (U+00B5) のサポートを追加しました。これにより、マイクロ記号 (U+00B5) とギリシャ文字のミュー (U+03BC) の両方がマイクロ秒を表す有効な表記として認識されるようになり、ClickHouse の挙動が Go の実装（[time.go を参照](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/time.go#L983C19-L983C20) および [time/format.go](https://github.com/golang/go/blob/ad7b46ee4ac1cee5095d64b01e8cf7fcda8bee5e/src/time/format.go#L1608-L1609)）と一致するようになりました。 [#75472](https://github.com/ClickHouse/ClickHouse/pull/75472) ([Vitaly Orlov](https://github.com/orloffv))。
* サーバー設定（`send_settings_to_client`）を、クライアント側コード（例えば、INSERT データのパースやクエリ出力のフォーマット）がサーバーの `users.xml` およびユーザープロファイルに定義された設定を使用するかどうかを制御するクライアント設定（`apply_settings_from_server`）に置き換えました。これが無効な場合は、クライアントのコマンドライン、セッション、およびクエリからの設定のみが使用されます。これはネイティブクライアントにのみ適用される点（HTTP などには適用されない）と、クエリ処理の大部分（サーバー側で行われる）には適用されない点に注意してください。 [#75478](https://github.com/ClickHouse/ClickHouse/pull/75478) ([Michael Kolupaev](https://github.com/al13n321)).
* 構文エラー時のエラーメッセージを改善しました。以前は、クエリが長すぎて、長さが制限を超えるトークンが非常に大きな文字列リテラルだった場合、その原因を説明するメッセージが、この非常に長いトークンの2つの例のあいだに埋もれてしまっていました。エラーメッセージ内で UTF-8 文字を含むクエリが不正に切り詰められていた問題を修正しました。クエリの断片に対する過剰なクオートを修正しました。これにより [#75473](https://github.com/ClickHouse/ClickHouse/issues/75473) がクローズされました。[#75561](https://github.com/ClickHouse/ClickHouse/pull/75561)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3(Azure)Queue` にプロファイルイベントを追加しました。 [#75618](https://github.com/ClickHouse/ClickHouse/pull/75618) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 互換性維持のためにサーバーからクライアントへの設定送信（`send_settings_to_client=false`）を無効化しました（この機能は、使い勝手を向上させるため、後にクライアント設定として再実装される予定です）。 [#75648](https://github.com/ClickHouse/ClickHouse/pull/75648) ([Michael Kolupaev](https://github.com/al13n321))。
* バックグラウンドスレッドで定期的に読み取られる複数の情報ソースの情報を用いて内部メモリトラッカーを補正できるようにする設定 `memory_worker_correct_memory_tracker` を追加しました。 [#75714](https://github.com/ClickHouse/ClickHouse/pull/75714) ([Antonio Andelic](https://github.com/antonio2368)).
* `system.processes` に `normalized_query_hash` カラムを追加しました。補足: `normalizedQueryHash` 関数を使えばオンザフライで簡単に計算できますが、後続の変更に備えるための準備として必要になります。 [#75756](https://github.com/ClickHouse/ClickHouse/pull/75756) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `system.tables` をクエリしても、既に存在しないデータベース上に作成された `Merge` テーブルがあっても例外は発生しません。複雑な処理を行うことを許可していないため、`Hive` テーブルからは `getTotalRows` メソッドを削除しました。 [#75772](https://github.com/ClickHouse/ClickHouse/pull/75772) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* バックアップの start&#95;time および end&#95;time をマイクロ秒精度で保存するようにしました。 [#75929](https://github.com/ClickHouse/ClickHouse/pull/75929) ([Aleksandr Musorin](https://github.com/AVMusorin)).
* RSS による補正が行われていない内部のグローバルメモリトラッカーの値を示す `MemoryTrackingUncorrected` メトリクスを追加しました。 [#75935](https://github.com/ClickHouse/ClickHouse/pull/75935) ([Antonio Andelic](https://github.com/antonio2368)).
* `PostgreSQL` や `MySQL` のテーブル関数で、`localhost:1234/handle` のようなエンドポイントを解釈できるようにしました。これにより、[https://github.com/ClickHouse/ClickHouse/pull/52503](https://github.com/ClickHouse/ClickHouse/pull/52503) で発生したリグレッションが修正されます。[#75944](https://github.com/ClickHouse/ClickHouse/pull/75944)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* サーバー設定 `throw_on_unknown_workload` を追加しました。この設定により、`workload` 設定に未知の値が指定されたクエリに対する動作を選択できます。無制限のアクセスを許可する（デフォルト）か、`RESOURCE_ACCESS_DENIED` エラーをスローするかを選べます。すべてのクエリでワークロードスケジューリングの使用を強制したい場合に有用です。 [#75999](https://github.com/ClickHouse/ClickHouse/pull/75999) ([Sergei Trifonov](https://github.com/serxa))。
* 不要な場合は `ARRAY JOIN` でサブカラムを `getSubcolumn` に書き換えないようにしました。 [#76018](https://github.com/ClickHouse/ClickHouse/pull/76018) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル読み込み時に発生したコーディネーションエラーをリトライするようにしました。 [#76020](https://github.com/ClickHouse/ClickHouse/pull/76020) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `SYSTEM FLUSH LOGS` で個別のログをフラッシュできるようにしました。 [#76132](https://github.com/ClickHouse/ClickHouse/pull/76132) ([Raúl Marín](https://github.com/Algunenano)).
* `/binary` サーバーのページを改善しました。Morton 曲線の代わりに Hilbert 曲線を使用します。正方形内に 512 MB 分のアドレスを表示し、正方形をより効率よく埋めるようにしました（以前のバージョンでは、アドレスは正方形の半分しか埋めていませんでした）。関数名ではなくライブラリ名を基準に、アドレスに色付けするようにしました。表示領域の外側まで、少し多めにスクロールできるようにしました。[#76192](https://github.com/ClickHouse/ClickHouse/pull/76192)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* TOO&#95;MANY&#95;SIMULTANEOUS&#95;QUERIES エラーが発生した場合に ON CLUSTER クエリをリトライするようにしました。 [#76352](https://github.com/ClickHouse/ClickHouse/pull/76352) ([Patrick Galbraith](https://github.com/CaptTofu)).
* サーバーのCPU不足度合いを算出する非同期メトリクス `CPUOverload` を追加しました。 [#76404](https://github.com/ClickHouse/ClickHouse/pull/76404) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `output_format_pretty_max_rows` のデフォルト値を 10000 から 1000 に変更しました。使い勝手の観点から、この方がより良いと考えています。 [#76407](https://github.com/ClickHouse/ClickHouse/pull/76407) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* クエリの解釈中に例外が発生した場合、それらがクエリで指定されたカスタムフォーマットで出力されるようにしました。以前のバージョンでは、クエリで指定されたフォーマットではなくデフォルトフォーマットで例外が出力されていました。これにより [#55422](https://github.com/ClickHouse/ClickHouse/issues/55422) が解決されました。 [#74994](https://github.com/ClickHouse/ClickHouse/pull/74994) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* SQLite の型マッピングを修正し、整数型を `int64` に、浮動小数点型を `float64` にマッピング。 [#73853](https://github.com/ClickHouse/ClickHouse/pull/73853) ([Joanna Hulboj](https://github.com/jh0x))。
* 親スコープからの識別子解決を修正。`WITH` 句で式へのエイリアスの使用を許可。[#58994](https://github.com/ClickHouse/ClickHouse/issues/58994) を修正。[#62946](https://github.com/ClickHouse/ClickHouse/issues/62946) を修正。[#63239](https://github.com/ClickHouse/ClickHouse/issues/63239) を修正。[#65233](https://github.com/ClickHouse/ClickHouse/issues/65233) を修正。[#71659](https://github.com/ClickHouse/ClickHouse/issues/71659) を修正。[#71828](https://github.com/ClickHouse/ClickHouse/issues/71828) を修正。[#68749](https://github.com/ClickHouse/ClickHouse/issues/68749) を修正。[#66143](https://github.com/ClickHouse/ClickHouse/pull/66143)（[Dmitry Novik](https://github.com/novikd)）。
* `negate` 関数の単調性を修正しました。以前のバージョンでは、`x` がプライマリキーである場合、クエリ `select * from a where -x = -42;` が誤った結果を返してしまう場合がありました。 [#71440](https://github.com/ClickHouse/ClickHouse/pull/71440) ([Michael Kolupaev](https://github.com/al13n321)).
* arrayIntersect における空タプルの扱いを修正しました。これにより [#72578](https://github.com/ClickHouse/ClickHouse/issues/72578) が解決されました。[#72581](https://github.com/ClickHouse/ClickHouse/pull/72581)（[Amos Bird](https://github.com/amosbird)）。
* 誤ったプレフィックスが付いた JSON サブオブジェクトのサブカラムの読み取りを修正。 [#73182](https://github.com/ClickHouse/ClickHouse/pull/73182) ([Pavel Kruglov](https://github.com/Avogar)).
* クライアントとサーバー間の通信で Native フォーマットの設定が正しく伝播されるようにしました。 [#73924](https://github.com/ClickHouse/ClickHouse/pull/73924) ([Pavel Kruglov](https://github.com/Avogar)).
* 一部のストレージでサポートされていない型をチェックするようにしました。 [#74218](https://github.com/ClickHouse/ClickHouse/pull/74218) ([Pavel Kruglov](https://github.com/Avogar)).
* macOS 上で PostgreSQL インターフェイス経由の `INSERT INTO SELECT` クエリ実行時に発生していたクラッシュを修正しました（issue [#72938](https://github.com/ClickHouse/ClickHouse/issues/72938)）。 [#74231](https://github.com/ClickHouse/ClickHouse/pull/74231)（[Artem Yurov](https://github.com/ArtemYurov)）。
* レプリケーテッドデータベースにおける未初期化の `max_log_ptr` を修正しました。 [#74336](https://github.com/ClickHouse/ClickHouse/pull/74336) ([Konstantin Morozov](https://github.com/k-morozov)).
* interval の挿入時に発生していたクラッシュを修正しました（issue [#74299](https://github.com/ClickHouse/ClickHouse/issues/74299)）。[#74478](https://github.com/ClickHouse/ClickHouse/pull/74478)（[NamHoaiNguyen](https://github.com/NamHoaiNguyen)）。
* 定数 JSON リテラルのフォーマットを修正。以前は、クエリを別のサーバーに送信する際に構文エラーを引き起こす可能性がありました。 [#74533](https://github.com/ClickHouse/ClickHouse/pull/74533) ([Pavel Kruglov](https://github.com/Avogar))。
* 暗黙的プロジェクションが有効な状態で定数のパーティション式を使用した場合に、`CREATE` クエリが正しく生成されない問題を修正しました。これにより [#74596](https://github.com/ClickHouse/ClickHouse/issues/74596) が解決されます。 [#74634](https://github.com/ClickHouse/ClickHouse/pull/74634) ([Amos Bird](https://github.com/amosbird)).
* INSERT が例外で終了した後に接続が不正な状態のまま残らないようにしました。 [#74740](https://github.com/ClickHouse/ClickHouse/pull/74740) ([Azat Khuzhin](https://github.com/azat)).
* 中間状態のまま残っていた接続は再利用しないようにしました。 [#74749](https://github.com/ClickHouse/ClickHouse/pull/74749) ([Azat Khuzhin](https://github.com/azat)).
* JSON 型宣言をパースする際、型名が大文字でないとクラッシュする問題を修正。 [#74784](https://github.com/ClickHouse/ClickHouse/pull/74784) ([Pavel Kruglov](https://github.com/Avogar)).
* Keeper: 接続が確立される前に接続が切断されていた場合に発生する logical&#95;error を修正。 [#74844](https://github.com/ClickHouse/ClickHouse/pull/74844) ([Michael Kolupaev](https://github.com/al13n321))。
* `AzureBlobStorage` を使用しているテーブルが存在する場合にサーバーが起動できなかった問題を修正しました。テーブルは Azure へのリクエストを送信することなく読み込まれるようになりました。 [#74880](https://github.com/ClickHouse/ClickHouse/pull/74880) ([Alexey Katsman](https://github.com/alexkats)).
* BACKUP および RESTORE 操作において、`query_log` 内の `used_privileges` フィールドと `missing_privileges` フィールドが欠落していた問題を修正。 [#74887](https://github.com/ClickHouse/ClickHouse/pull/74887) ([Alexey Katsman](https://github.com/alexkats)).
* HDFS の SELECT リクエスト中に SASL エラーが発生した場合に Kerberos チケットを更新するようにしました。 [#74930](https://github.com/ClickHouse/ClickHouse/pull/74930) ([inv2004](https://github.com/inv2004)).
* startup&#95;scripts 内の Replicated データベースへのクエリを修正。 [#74942](https://github.com/ClickHouse/ClickHouse/pull/74942) ([Azat Khuzhin](https://github.com/azat)).
* null-safe な比較が使用されている場合に、JOIN ON 句で型エイリアスが付けられた式に関する問題を修正しました。 [#74970](https://github.com/ClickHouse/ClickHouse/pull/74970) ([Vladimir Cherkasov](https://github.com/vdimir)).
* 削除処理が失敗した場合、part の状態を「削除中」から「古い」に戻すようにしました。 [#74985](https://github.com/ClickHouse/ClickHouse/pull/74985) ([Sema Checherinda](https://github.com/CheSema)).
* 以前のバージョンでは、スカラーサブクエリが存在する場合、データフォーマットの初期化中に（サブクエリの処理から蓄積された）進捗情報の書き込みを開始しており、これは HTTP ヘッダーが書き出される前に行われていました。この結果、X-ClickHouse-QueryId や X-ClickHouse-Format などの HTTP ヘッダーおよび Content-Type が失われていました。 [#74991](https://github.com/ClickHouse/ClickHouse/pull/74991) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* `database_replicated_allow_replicated_engine_arguments=0` 設定時の `CREATE TABLE AS...` クエリを修正。 [#75000](https://github.com/ClickHouse/ClickHouse/pull/75000) ([Bharat Nallan](https://github.com/bharatnc)).
* INSERT 実行時に例外が発生した後、クライアントの接続が不正な状態のまま残ってしまう問題を修正。 [#75030](https://github.com/ClickHouse/ClickHouse/pull/75030) ([Azat Khuzhin](https://github.com/azat)).
* PSQL レプリケーションで捕捉されない例外が原因で発生していたクラッシュを修正。 [#75062](https://github.com/ClickHouse/ClickHouse/pull/75062) ([Azat Khuzhin](https://github.com/azat)).
* SASL が任意の RPC 呼び出しを失敗させる可能性があり、この修正により、`krb5` チケットの有効期限が切れている場合にその呼び出しを再試行できるようになりました。 [#75063](https://github.com/ClickHouse/ClickHouse/pull/75063) ([inv2004](https://github.com/inv2004)).
* `optimize_function_to_subcolumns` 設定が有効な場合の `Array`、`Map`、および `Nullable(..)` カラムに対するインデックス（プライマリおよびセカンダリ）の利用方法を修正しました。以前は、これらのカラムに対するインデックスが無視されてしまうことがありました。 [#75081](https://github.com/ClickHouse/ClickHouse/pull/75081) ([Anton Popov](https://github.com/CurtizJ)).
* 内部テーブルを持つマテリアライズドビューを作成する際には、そのようにフラット化されたカラムを使用できなくなるため、`flatten_nested` を無効にしてください。 [#75085](https://github.com/ClickHouse/ClickHouse/pull/75085) ([Christoph Wurm](https://github.com/cwurm)).
* forwarded&#95;for フィールドで一部の IPv6 アドレス（::ffff:1.1.1.1 など）が誤って解釈されてしまい、その結果、例外とともにクライアントが切断されていた問題を修正。 [#75133](https://github.com/ClickHouse/ClickHouse/pull/75133) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* LowCardinality の Nullable データ型に対する null セーフな JOIN の処理を修正しました。以前は、`IS NOT DISTINCT FROM`、`<=>`、`a IS NULL AND b IS NULL OR a == b` のような null セーフな比較を伴う JOIN の ON 句が、LowCardinality 列に対して正しく動作していませんでした。 [#75143](https://github.com/ClickHouse/ClickHouse/pull/75143) ([Vladimir Cherkasov](https://github.com/vdimir))。
* NumRowsCache の total&#95;number&#95;of&#95;rows をカウントするときに key&#95;condition を指定していないことを検証するようにしました。 [#75164](https://github.com/ClickHouse/ClickHouse/pull/75164) ([Daniil Ivanik](https://github.com/divanik)).
* 未使用の補間を含むクエリを新しいアナライザーで修正できるようにしました。 [#75173](https://github.com/ClickHouse/ClickHouse/pull/75173) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))。
* CTE と INSERT を併用した際に発生するクラッシュバグを修正。 [#75188](https://github.com/ClickHouse/ClickHouse/pull/75188) ([Shichao Jin](https://github.com/jsc0218)).
* Keeper の修正: ログをロールバックする際に、破損している changelog に書き込まないようにしました。 [#75197](https://github.com/ClickHouse/ClickHouse/pull/75197) ([Antonio Andelic](https://github.com/antonio2368)).
* 適切な箇所で `BFloat16` を上位型として使用するようにしました。これにより次の Issue がクローズされます: [#74404](https://github.com/ClickHouse/ClickHouse/issues/74404)。[#75236](https://github.com/ClickHouse/ClickHouse/pull/75236)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* `any_join_distinct_right_table_keys` と JOIN の ON 句で OR を使用した場合に結合結果に予期しないデフォルト値が入る問題を修正しました。 [#75262](https://github.com/ClickHouse/ClickHouse/pull/75262) ([Vladimir Cherkasov](https://github.com/vdimir)).
* azureblobstorage テーブルエンジンの認証情報をマスクするようにしました。 [#75319](https://github.com/ClickHouse/ClickHouse/pull/75319) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* ClickHouse が PostgreSQL、MySQL、SQLite などの外部データベースに対して誤ってフィルタープッシュダウンを行ってしまう可能性があった不具合を修正しました。これにより次の issue が解決されました: [#71423](https://github.com/ClickHouse/ClickHouse/issues/71423)。[#75320](https://github.com/ClickHouse/ClickHouse/pull/75320)（[Nikita Mikhaylov](https://github.com/nikitamikhaylov)）。
* Protobuf フォーマットでの出力中や、並列クエリ `SYSTEM DROP FORMAT SCHEMA CACHE` の実行時に発生する可能性がある Protobuf スキーマキャッシュのクラッシュを修正しました。 [#75357](https://github.com/ClickHouse/ClickHouse/pull/75357) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカで `HAVING` からのフィルタがプッシュダウンされる場合に発生する可能性があった論理エラーまたは未初期化メモリの問題を修正しました。 [#75363](https://github.com/ClickHouse/ClickHouse/pull/75363) ([Vladimir Cherkasov](https://github.com/vdimir)).
* `icebergS3`、`icebergAzure` テーブル関数およびテーブルエンジンで機密情報をマスクするようにしました。 [#75378](https://github.com/ClickHouse/ClickHouse/pull/75378) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 計算結果として空文字列になるトリム対象文字を指定した `TRIM` 関数が正しく処理されるようになりました。例: `SELECT TRIM(LEADING concat('') FROM 'foo')`（Issue [#69922](https://github.com/ClickHouse/ClickHouse/issues/69922)）。[#75399](https://github.com/ClickHouse/ClickHouse/pull/75399)（[Manish Gill](https://github.com/mgill25)）。
* IOutputFormat のデータレースを修正。 [#75448](https://github.com/ClickHouse/ClickHouse/pull/75448) ([Pavel Kruglov](https://github.com/Avogar)).
* 分散テーブルに対する JOIN で Array 型の JSON サブカラムが使用されている場合に発生する可能性のある `Elements ... and ... of Nested data structure ... (Array columns) have different array sizes` エラーを修正しました。 [#75512](https://github.com/ClickHouse/ClickHouse/pull/75512) ([Pavel Kruglov](https://github.com/Avogar)).
* `CODEC(ZSTD, DoubleDelta)` を使用してデータ破損を修正。[#70031](https://github.com/ClickHouse/ClickHouse/issues/70031) をクローズ。[#75548](https://github.com/ClickHouse/ClickHouse/pull/75548)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* allow&#95;feature&#95;tier と compatibility MergeTree 設定間の相互作用を修正しました。 [#75635](https://github.com/ClickHouse/ClickHouse/pull/75635) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルの処理が再試行された場合に `system.s3queue_log` 内の `processed_rows` の値が正しくならない問題を修正しました。 [#75666](https://github.com/ClickHouse/ClickHouse/pull/75666) ([Kseniia Sumarokova](https://github.com/kssenii))。
* マテリアライズドビューが URL エンジンに対して書き込みを行っていて接続の問題が発生している場合にも、`materialized_views_ignore_errors` が尊重されるようにしました。 [#75679](https://github.com/ClickHouse/ClickHouse/pull/75679) ([Christoph Wurm](https://github.com/cwurm)).
* 異なる型のカラム間で複数の非同期 `RENAME` クエリ（`alter_sync = 0`）を実行した後に、`MergeTree` テーブルからの読み取り時にまれに発生していたクラッシュを修正しました。 [#75693](https://github.com/ClickHouse/ClickHouse/pull/75693) ([Anton Popov](https://github.com/CurtizJ)).
* 一部の `UNION ALL` を含むクエリで発生していた `Block structure mismatch in QueryPipeline stream` エラーを修正しました。 [#75715](https://github.com/ClickHouse/ClickHouse/pull/75715) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* projection の PK に使用されているカラムを `ALTER MODIFY` した場合、その projection を再構築するようにしました。以前は、projection の PK に使用されているカラムを `ALTER MODIFY` した後の `SELECT` クエリ実行時に `CANNOT_READ_ALL_DATA` エラーが発生する可能性がありました。 [#75720](https://github.com/ClickHouse/ClickHouse/pull/75720) ([Pavel Kruglov](https://github.com/Avogar)).
* スカラーサブクエリに対する `ARRAY JOIN` の結果が誤る問題を修正（アナライザー使用時）。 [#75732](https://github.com/ClickHouse/ClickHouse/pull/75732) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* `DistinctSortedStreamTransform` における null ポインタ逆参照を修正しました。 [#75734](https://github.com/ClickHouse/ClickHouse/pull/75734) ([Nikita Taranov](https://github.com/nickitat)).
* `allow_suspicious_ttl_expressions` の挙動を修正。 [#75771](https://github.com/ClickHouse/ClickHouse/pull/75771) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 関数 `translate` における未初期化メモリの読み取りを修正しました。これにより [#75592](https://github.com/ClickHouse/ClickHouse/issues/75592) が解決されます。 [#75794](https://github.com/ClickHouse/ClickHouse/pull/75794) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Native フォーマットで JSON を文字列フォーマットとして扱う際に、フォーマット設定が伝播されるようにしました。 [#75832](https://github.com/ClickHouse/ClickHouse/pull/75832) ([Pavel Kruglov](https://github.com/Avogar)).
* `settings` の変更履歴に、v24.12 で並列ハッシュ `JOIN` アルゴリズムがデフォルトで有効化されたことを記録しました。これにより、互換性レベルが v24.12 より古い値に設定されている場合、ClickHouse は引き続き非並列のハッシュを用いて `JOIN` を実行します。 [#75870](https://github.com/ClickHouse/ClickHouse/pull/75870) ([Robert Schulze](https://github.com/rschu1ze)).
* 暗黙的に追加された min-max インデックスを持つテーブルを新しいテーブルにコピーできなかった不具合を修正しました（issue [#75677](https://github.com/ClickHouse/ClickHouse/issues/75677)）。[#75877](https://github.com/ClickHouse/ClickHouse/pull/75877)（[Smita Kulkarni](https://github.com/SmitaRKulkarni)）。
* `clickhouse-library-bridge` はファイルシステムから任意のライブラリを開くことができるため、本来は隔離された環境内でのみ実行するのが安全です。`clickhouse-server` の近くで実行された場合に生じる脆弱性を防ぐため、設定で指定した場所のみにライブラリのパスを制限します。この脆弱性は **Arseniy Dugin** によって [ClickHouse Bug Bounty Program](https://github.com/ClickHouse/ClickHouse/issues/38986) を通じて発見されました。[#75954](https://github.com/ClickHouse/ClickHouse/pull/75954)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 一部のメタデータのシリアル化に JSON を使用していましたが、これは誤りでした。JSON は文字列リテラル内部でのバイナリデータ（ゼロバイトを含む）をサポートしていないためです。一方で、SQL クエリにはバイナリデータや無効な UTF-8 が含まれうるため、メタデータファイル側でもこれをサポートする必要があります。同時に、ClickHouse の `JSONEachRow` などのフォーマットは、バイナリデータの完全なラウンドトリップを優先し、JSON 標準から意図的に逸脱することでこの問題を回避しています。その背景については次を参照してください: [https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790](https://github.com/ClickHouse/ClickHouse/pull/73668#issuecomment-2560501790)。解決策は、`Poco::JSON` ライブラリを ClickHouse における JSON フォーマットのシリアル化と整合させることです。これにより [#73668](https://github.com/ClickHouse/ClickHouse/issues/73668) がクローズされました。[#75963](https://github.com/ClickHouse/ClickHouse/pull/75963)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ストレージ `S3Queue` におけるコミット制限のチェックを修正しました。[#76104](https://github.com/ClickHouse/ClickHouse/pull/76104)（[Kseniia Sumarokova](https://github.com/kssenii)）。
* `add_minmax_index_for_numeric_columns`/`add_minmax_index_for_string_columns` による自動インデックスを持つ MergeTree テーブルの ATTACH を修正しました。 [#76139](https://github.com/ClickHouse/ClickHouse/pull/76139) ([Azat Khuzhin](https://github.com/azat)).
* ジョブの親スレッドのスタックトレースが、`enable_job_stack_trace` 設定を有効にしても出力されない問題を修正しました。また、`enable_job_stack_trace` 設定がスレッドに正しく伝播せず、その結果スタックトレースの内容が常にこの設定を反映しない問題も修正しました。 [#76191](https://github.com/ClickHouse/ClickHouse/pull/76191) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `ALTER RENAME` に対して誤って `CREATE USER` 権限を要求していたパーミッションチェックを修正しました。 [#74372](https://github.com/ClickHouse/ClickHouse/issues/74372) をクローズしました。 [#76241](https://github.com/ClickHouse/ClickHouse/pull/76241) ([pufit](https://github.com/pufit))。
* ビッグエンディアンアーキテクチャにおける FixedString を用いた reinterpretAs の動作を修正。 [#76253](https://github.com/ClickHouse/ClickHouse/pull/76253) ([Azat Khuzhin](https://github.com/azat)).
* S3Queue に存在した論理エラー「Expected current processor {} to be equal to {} for bucket {}」を修正しました。 [#76358](https://github.com/ClickHouse/ClickHouse/pull/76358) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Memory データベースにおける ALTER のデッドロックを修正しました。 [#76359](https://github.com/ClickHouse/ClickHouse/pull/76359) ([Azat Khuzhin](https://github.com/azat)).
* `WHERE` 句に `pointInPolygon` 関数が含まれている場合のインデックス解析時の論理エラーを修正。 [#76360](https://github.com/ClickHouse/ClickHouse/pull/76360) ([Anton Popov](https://github.com/CurtizJ)).
* シグナルハンドラ内の潜在的に安全でない呼び出しを修正。 [#76549](https://github.com/ClickHouse/ClickHouse/pull/76549) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* PartsSplitter における reverse key のサポートを修正。これにより [#73400](https://github.com/ClickHouse/ClickHouse/issues/73400) を解決。 [#73418](https://github.com/ClickHouse/ClickHouse/pull/73418) ([Amos Bird](https://github.com/amosbird))。

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* ARM および Intel Mac の両方での HDFS のビルドをサポート。[#74244](https://github.com/ClickHouse/ClickHouse/pull/74244) ([Yan Xin](https://github.com/yxheartipp)).
* Darwin 向けにクロスコンパイルする際に ICU と GRPC を有効化。[#75922](https://github.com/ClickHouse/ClickHouse/pull/75922) ([Raúl Marín](https://github.com/Algunenano)).
* 同梱の LLVM を 19 に更新。[#75148](https://github.com/ClickHouse/ClickHouse/pull/75148) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* Docker イメージでユーザー `default` のネットワークアクセスを無効化。[#75259](https://github.com/ClickHouse/ClickHouse/pull/75259) ([Mikhail f. Shiryaev](https://github.com/Felixoid)). すべての clickhouse-server 関連処理を関数化し、`entrypoint.sh` でデフォルトのバイナリを起動するときにのみ実行されるように変更。長らく先送りされていた改善であり、[#50724](https://github.com/ClickHouse/ClickHouse/issues/50724) で提案されていたもの。`users.xml` から値を取得するためのスイッチ `--users` を `clickhouse-extract-from-config` に追加。[#75643](https://github.com/ClickHouse/ClickHouse/pull/75643) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* バイナリから約 20MB の不要コードを削除。[#76226](https://github.com/ClickHouse/ClickHouse/pull/76226) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

### ClickHouse リリース 25.1, 2025-01-28 {#251}

#### 後方互換性のない変更 {#backward-incompatible-change}

* `JSONEachRowWithProgress` は、進捗が発生するたびに進捗情報を書き出すようになりました。以前のバージョンでは、結果の各ブロックの後にしか進捗が表示されず、実用的ではありませんでした。進捗の表示方法を変更し、進捗が 0 の場合は表示しません。この変更により [#70800](https://github.com/ClickHouse/ClickHouse/issues/70800) が解決されました。[#73834](https://github.com/ClickHouse/ClickHouse/pull/73834)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Merge` テーブルは、列の和集合を取り共通の型を導出することで、配下のテーブルの構造を統一します。この変更により [#64864](https://github.com/ClickHouse/ClickHouse/issues/64864) が解決されました。特定のケースでは、この変更は後方互換性がない可能性があります。1 つの例として、テーブル間に共通の型が存在しないが、最初のテーブルの型への変換は可能な場合があります（UInt64 と Int64、または任意の数値型と String の組み合わせなど）。旧来の動作に戻したい場合は、`merge_table_max_tables_to_look_for_schema_inference` を `1` に設定するか、`compatibility` を `24.12` 以前に設定してください。[#73956](https://github.com/ClickHouse/ClickHouse/pull/73956)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Parquet 出力フォーマットは、`Date` および `DateTime` 列を生の数値として書き出すのではなく、Parquet がサポートする日付/時刻型に変換します。`DateTime` は `DateTime64(3)`（以前は `UInt32`）になります。`output_format_parquet_datetime_as_uint32` を設定することで、従来の動作に戻せます。`Date` は `Date32`（以前は `UInt16`）になります。[#70950](https://github.com/ClickHouse/ClickHouse/pull/70950)（[Michael Kolupaev](https://github.com/al13n321)）。
* デフォルトでは、`ORDER BY` および `less/greater/equal/etc` といった比較関数に、`JSON` / `Object` / `AggregateFunction` のような比較不可能な型を使用できないようになりました。[#73276](https://github.com/ClickHouse/ClickHouse/pull/73276)（[Pavel Kruglov](https://github.com/Avogar)）。
* 廃止された `MaterializedMySQL` データベースエンジンは削除され、利用できなくなりました。[#73879](https://github.com/ClickHouse/ClickHouse/pull/73879)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `mysql` ディクショナリソースは、もはや `SHOW TABLE STATUS` クエリを実行しません。これは、InnoDB テーブルおよび最近の MySQL バージョン全般において、この情報が有用ではないためです。この変更により [#72636](https://github.com/ClickHouse/ClickHouse/issues/72636) が解決されました。この変更は後方互換性がありますが、気付けるようにこのカテゴリに含めています。[#73914](https://github.com/ClickHouse/ClickHouse/pull/73914)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `CHECK TABLE` クエリには、新たに `CHECK` 権限が必要になりました。以前のバージョンでは、これらのクエリを実行するには `SHOW TABLES` 権限だけで十分でした。しかし、`CHECK TABLE` クエリは重くなる可能性があり、`SELECT` クエリに適用される通常のクエリ複雑性の制限は適用されませんでした。その結果、DoS 攻撃の可能性がありました。[#74471](https://github.com/ClickHouse/ClickHouse/pull/74471)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `h3ToGeo()` 関数は、結果を標準的な幾何関数の順序である `(lat, lon)` で返すようになりました。従来の結果順序 `(lon, lat)` を保持したいユーザーは、設定 `h3togeo_lon_lat_result_order = true` を有効にしてください。[#74719](https://github.com/ClickHouse/ClickHouse/pull/74719)（[Manish Gill](https://github.com/mgill25)）。
* 新しい MongoDB ドライバーがデフォルトになりました。レガシードライバーの利用を継続したいユーザーは、サーバー設定 `use_legacy_mongodb_integration` を true に設定してください。[#73359](https://github.com/ClickHouse/ClickHouse/pull/73359)（[Robert Schulze](https://github.com/rschu1ze)）。

#### 新機能 {#new-feature}

* `SELECT` クエリの実行時に、バックグラウンドプロセスによるマテリアライズがまだ完了していない mutation を、送信直後に適用できるようになりました。`apply_mutations_on_fly` を設定することで有効化できます。 [#74877](https://github.com/ClickHouse/ClickHouse/pull/74877) ([Anton Popov](https://github.com/CurtizJ)).
* `Iceberg` テーブルにおいて、時間変換を用いるパーティション操作向けのパーティションプルーニングを実装しました。 [#72044](https://github.com/ClickHouse/ClickHouse/pull/72044) ([Daniil Ivanik](https://github.com/divanik)).
* MergeTree のソートキーおよびスキップインデックスでサブカラムのサポートを追加。 [#72644](https://github.com/ClickHouse/ClickHouse/pull/72644) ([Pavel Kruglov](https://github.com/Avogar)).
* `Apache Arrow`/`Parquet`/`ORC` からの `HALF_FLOAT` 値の読み取りをサポートしました（`Float32` として読み込まれます）。これにより [#72960](https://github.com/ClickHouse/ClickHouse/issues/72960) が解決されます。IEEE-754 の half float（半精度浮動小数点数）は `BFloat16` とは異なることに注意してください。[#73835](https://github.com/ClickHouse/ClickHouse/issues/73835) がクローズされます。[#73836](https://github.com/ClickHouse/ClickHouse/pull/73836)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `system.trace_log` テーブルに、シンボル化されたスタックトレースを格納する 2 つの新しいカラム `symbols` と `lines` が追加されます。これにより、プロファイル情報の収集とエクスポートが容易になります。これは、`trace_log` セクション内のサーバー設定値 `symbolize` によって制御されており、デフォルトで有効になっています。 [#73896](https://github.com/ClickHouse/ClickHouse/pull/73896) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* テーブル内で自動インクリメントされた番号を生成するために使用できる新しい関数 `generateSerialID` を追加しました。[kazalika](https://github.com/kazalika) による [#64310](https://github.com/ClickHouse/ClickHouse/issues/64310) の継続対応です。この変更により [#62485](https://github.com/ClickHouse/ClickHouse/issues/62485) がクローズされます。[#73950](https://github.com/ClickHouse/ClickHouse/pull/73950)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* DDL クエリ向けに、構文 `query1 PARALLEL WITH query2 PARALLEL WITH query3 ... PARALLEL WITH queryN` を追加しました。これは、クエリ `{query1, query2, ... queryN}` を互いに並列実行できるようにする（かつ、その方が望ましい）ことを意味します。[#73983](https://github.com/ClickHouse/ClickHouse/pull/73983) ([Vitaly Baranov](https://github.com/vitlibar))。
* デシリアライズ済みの skipping index のグラニュール用インメモリキャッシュを追加しました。これにより、skipping index を利用する同一クエリの繰り返し実行が高速になります。新しいキャッシュのサイズは、サーバー設定 `skipping_index_cache_size` と `skipping_index_cache_max_entries` によって制御されます。このキャッシュを追加した主な動機はベクトル類似度インデックスであり、これにより処理が大幅に高速化されました。[#70102](https://github.com/ClickHouse/ClickHouse/pull/70102)（[Robert Schulze](https://github.com/rschu1ze)）。
* 現在、組み込み Web UI にはクエリ実行中に進行状況バーが表示されるようになりました。これにより、クエリをキャンセルできます。総レコード数と、速度に関する詳細な情報を表示します。テーブルは、データが届き次第、段階的にレンダリングできるようになりました。HTTP 圧縮を有効にしました。テーブルのレンダリングがより高速になりました。テーブルヘッダーが固定表示（スティッキー）になりました。セルを選択でき、矢印キーで移動できます。選択されたセルのアウトラインによってセルが小さくなってしまう問題を修正しました。セルはマウスホバーでは拡大せず、選択時のみ拡大されます。受信データのレンダリングをいつ停止するかは、サーバー側ではなくクライアント側で決定されます。数値の桁区切りを強調表示します。全体的なデザインが刷新され、より力強い印象になりました。サーバーに到達可能かどうかと認証情報の正しさをチェックし、サーバーのバージョンと稼働時間を表示します。クラウドアイコンは、Safari を含むあらゆるフォントで輪郭線付きで表示されます。ネストされたデータ型内の大きな整数がより適切にレンダリングされます。`inf` / `nan` を正しく表示します。カラムヘッダーにマウスオーバーした際にデータ型を表示します。[#74204](https://github.com/ClickHouse/ClickHouse/pull/74204)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MergeTree によって管理されるカラムに対して、デフォルトで min-max (skipping) インデックスを作成できるようにする設定 `add_minmax_index_for_numeric_columns`（数値カラム用）および `add_minmax_index_for_string_columns`（文字列カラム用）を追加しました。現時点では両方の設定は無効になっているため、まだ動作の変更はありません。 [#74266](https://github.com/ClickHouse/ClickHouse/pull/74266) ([Smita Kulkarni](https://github.com/SmitaRKulkarni))。
* `system.query_log`、ネイティブプロトコルの ClientInfo、およびサーバーログに `script_query_number` と `script_line_number` フィールドを追加。これにより [#67542](https://github.com/ClickHouse/ClickHouse/issues/67542) がクローズされます。以前に [#68133](https://github.com/ClickHouse/ClickHouse/issues/68133) でこの機能の実装に着手した [pinsvin00](https://github.com/pinsvin00) に感謝します。[#74477](https://github.com/ClickHouse/ClickHouse/pull/74477)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* パターン内で最長のイベント列に対して、一致したイベントのタイムスタンプを返す集約関数 `sequenceMatchEvents` を追加しました。 [#72349](https://github.com/ClickHouse/ClickHouse/pull/72349) ([UnamedRus](https://github.com/UnamedRus)).
* 関数 `arrayNormalizedGini` を追加しました。[#72823](https://github.com/ClickHouse/ClickHouse/pull/72823) ([flynn](https://github.com/ucasfl)).
* `DateTime64` に対するマイナス演算子をサポートし、`DateTime64` 同士および `DateTime` との減算を可能にしました。 [#74482](https://github.com/ClickHouse/ClickHouse/pull/74482) ([Li Yin](https://github.com/liyinsg)).

#### 実験的機能 {#experimental-features}

* `BFloat16` データ型は本番環境で利用可能になりました。 [#73840](https://github.com/ClickHouse/ClickHouse/pull/73840) ([Alexey Milovidov](https://github.com/alexey-milovidov))。

#### パフォーマンスの向上 {#performance-improvement}

* 関数 `indexHint` を最適化しました。これにより、関数 `indexHint` の引数としてのみ使用されている列はテーブルから読み込まれなくなりました。[#74314](https://github.com/ClickHouse/ClickHouse/pull/74314) ([Anton Popov](https://github.com/CurtizJ))。もし `indexHint` 関数がエンタープライズデータアーキテクチャの中核を成しているのであれば、この最適化はあなたの命を救ってくれるはずです。
* `parallel_hash` JOIN アルゴリズムに対する `max_joined_block_size_rows` 設定の扱いをより正確にしました。これにより、`hash` アルゴリズムと比較してメモリ消費量が増加することを回避できます。 [#74630](https://github.com/ClickHouse/ClickHouse/pull/74630) ([Nikita Taranov](https://github.com/nickitat)).
* `MergingAggregated` ステップに対して、クエリプランレベルでの述語プッシュダウン最適化に対応しました。これにより、アナライザーを使用する一部のクエリのパフォーマンスが向上します。 [#74073](https://github.com/ClickHouse/ClickHouse/pull/74073) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* `parallel_hash` JOIN アルゴリズムのプローブフェーズから、左側テーブルのブロックをハッシュで分割する処理を削除しました。 [#73089](https://github.com/ClickHouse/ClickHouse/pull/73089) ([Nikita Taranov](https://github.com/nickitat))。
* RowBinary 入力フォーマットを最適化しました。[#63805](https://github.com/ClickHouse/ClickHouse/issues/63805) をクローズしました。[#65059](https://github.com/ClickHouse/ClickHouse/pull/65059)（[Pavel Kruglov](https://github.com/Avogar)）。
* `optimize_on_insert` が有効な場合、レベル 1 のパーツとして書き込みます。これにより、新しく書き込まれたパーツに対する `FINAL` 付きクエリで複数の最適化を利用できるようになります。 [#73132](https://github.com/ClickHouse/ClickHouse/pull/73132) ([Anton Popov](https://github.com/CurtizJ)).
* 低レベルな最適化により文字列のデシリアライズを高速化しました。[#65948](https://github.com/ClickHouse/ClickHouse/pull/65948) ([Nikita Taranov](https://github.com/nickitat)).
* マージなどでレコード間の等価比較を行う際、最も値が異なりやすい列から行の比較を開始するようになりました。 [#63780](https://github.com/ClickHouse/ClickHouse/pull/63780) ([UnamedRus](https://github.com/UnamedRus)).
* キーに基づいて右側の結合テーブルを再ランキングすることで、grace hash join のパフォーマンスを改善しました。 [#72237](https://github.com/ClickHouse/ClickHouse/pull/72237) ([kevinyhzou](https://github.com/KevinyhZou)).
* `arrayROCAUC` と `arrayAUCPR` が曲線全体に対する部分面積を計算できるようになり、巨大なデータセットに対して計算を並列化できるようになりました。 [#72904](https://github.com/ClickHouse/ClickHouse/pull/72904) ([Emmanuel](https://github.com/emmanuelsdias)).
* アイドル状態のスレッドが過剰に生成されないようにしました。 [#72920](https://github.com/ClickHouse/ClickHouse/pull/72920) ([Guo Wangyang](https://github.com/guowangy)).
* テーブル関数で中括弧展開のみを使用している場合は、BLOB ストレージのキーを列挙しないようにしました。 [#73333](https://github.com/ClickHouse/ClickHouse/issues/73333) をクローズしました。 [#73518](https://github.com/ClickHouse/ClickHouse/pull/73518)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* Nullable 引数を取る関数に対するショートサーキット最適化。 [#73820](https://github.com/ClickHouse/ClickHouse/pull/73820) ([李扬](https://github.com/taiyang-li))。
* `maskedExecute` を関数以外のカラムには適用しないようにし、ショートサーキット実行のパフォーマンスを改善しました。 [#73965](https://github.com/ClickHouse/ClickHouse/pull/73965) ([lgbo](https://github.com/lgbo-ustc))。
* `Kafka`/`NATS`/`RabbitMQ`/`FileLog` の入力フォーマットでのヘッダーの自動検出を無効化し、パフォーマンスを向上させました。 [#74006](https://github.com/ClickHouse/ClickHouse/pull/74006) ([Azat Khuzhin](https://github.com/azat)).
* `GROUPING SETS` を使用した集約の後に、より高い並列度でパイプラインを実行するようにしました。 [#74082](https://github.com/ClickHouse/ClickHouse/pull/74082) ([Nikita Taranov](https://github.com/nickitat)).
* `MergeTreeReadPool` におけるクリティカルセクションの範囲を縮小しました。 [#74202](https://github.com/ClickHouse/ClickHouse/pull/74202) ([Guo Wangyang](https://github.com/guowangy)).
* 並列レプリカのパフォーマンスが改善されました。並列レプリカプロトコルに関連しないパケットのデシリアライズは、クエリのイニシエータ側で常にパイプラインスレッド内で行われるようになりました。以前は、パイプラインスケジューリングを担当するスレッド内で行われる場合があり、その結果、イニシエータ側の応答性が低下し、パイプラインの実行が遅延する可能性がありました。 [#74398](https://github.com/ClickHouse/ClickHouse/pull/74398) ([Igor Nikonov](https://github.com/devcrafter)).
* Keeper における大規模なマルチリクエスト処理のパフォーマンスを改善しました。 [#74849](https://github.com/ClickHouse/ClickHouse/pull/74849) ([Antonio Andelic](https://github.com/antonio2368)).
* ログラッパーを値として使用し、ヒープに割り当てないようにしました。 [#74034](https://github.com/ClickHouse/ClickHouse/pull/74034) ([Mikhail Artemenko](https://github.com/Michicosun)).
* MySQL および Postgres の辞書レプリカへの接続をバックグラウンドで再確立し、対応する辞書へのリクエストが遅延しないようにしました。 [#71101](https://github.com/ClickHouse/ClickHouse/pull/71101) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* Parallel replicas では、レプリカ選択を改善するためにレプリカの可用性に関する過去の情報を使用していましたが、接続できない場合にそのレプリカのエラー数を更新していませんでした。この PR では、レプリカに接続できない場合にそのエラー数を更新するようにしました。 [#72666](https://github.com/ClickHouse/ClickHouse/pull/72666) ([zoomxi](https://github.com/zoomxi)).
* マージツリーの設定 `materialize_skip_indexes_on_merge` を追加しました。これにより、マージ時にスキップインデックスが作成されるのを抑制できます。これによって、ユーザーはスキップインデックスをいつ作成するかを（`ALTER TABLE [..] MATERIALIZE INDEX [...]` を通じて）明示的に制御できるようになります。スキップインデックスの構築コストが高い場合（例：ベクトル類似度インデックスなど）に有用です。 [#74401](https://github.com/ClickHouse/ClickHouse/pull/74401) ([Robert Schulze](https://github.com/rschu1ze)).
* Storage(S3/Azure)Queue における keeper リクエストを最適化しました。 [#74410](https://github.com/ClickHouse/ClickHouse/pull/74410) ([Kseniia Sumarokova](https://github.com/kssenii)). [#74538](https://github.com/ClickHouse/ClickHouse/pull/74538) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 既定では最大 `1000` 個の並列レプリカを使用します。 [#74504](https://github.com/ClickHouse/ClickHouse/pull/74504) ([Konstantin Bogdanov](https://github.com/thevar1able)).
* S3 ディスクからの読み取り時の HTTP セッションの再利用を改善 ([#72401](https://github.com/ClickHouse/ClickHouse/issues/72401))。[#74548](https://github.com/ClickHouse/ClickHouse/pull/74548) ([Julian Maicher](https://github.com/jmaicher))。

#### 改善点 {#improvement}

* ENGINE を暗黙指定した CREATE TABLE クエリで SETTINGS をサポートし、ENGINE 設定とクエリ設定を併用できるようにしました。 [#73120](https://github.com/ClickHouse/ClickHouse/pull/73120) ([Raúl Marín](https://github.com/Algunenano)).
* `use_hive_partitioning` をデフォルトで有効にしました。 [#71636](https://github.com/ClickHouse/ClickHouse/pull/71636) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 異なるパラメータを持つ JSON 型間での CAST および ALTER をサポートしました。[#72303](https://github.com/ClickHouse/ClickHouse/pull/72303) ([Pavel Kruglov](https://github.com/Avogar))。
* JSON 列の値に対する等値比較をサポートしました。 [#72991](https://github.com/ClickHouse/ClickHouse/pull/72991) ([Pavel Kruglov](https://github.com/Avogar)).
* JSON サブカラムを含む識別子のフォーマットを改善し、不要なバッククォートを回避するようにしました。 [#73085](https://github.com/ClickHouse/ClickHouse/pull/73085) ([Pavel Kruglov](https://github.com/Avogar)).
* インタラクティブメトリクスを改善。並列レプリカのメトリクスがすべて表示されない問題を修正。メトリクスは最新の更新時刻順、その後に名前の辞書順で表示する。古くなったメトリクスは表示しない。[#71631](https://github.com/ClickHouse/ClickHouse/pull/71631) ([Julia Kartseva](https://github.com/jkartseva)).
* JSON 出力フォーマットをデフォルトで整形表示するようにしました。これを制御するための新しい設定 `output_format_json_pretty_print` を追加し、デフォルトで有効化しました。 [#72148](https://github.com/ClickHouse/ClickHouse/pull/72148) ([Pavel Kruglov](https://github.com/Avogar)).
* デフォルトで `LowCardinality(UUID)` を許可するようにしました。これは ClickHouse Cloud の顧客の間で実用的であることが実証されています。 [#73826](https://github.com/ClickHouse/ClickHouse/pull/73826) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* インストール時のメッセージを改善しました。[#73827](https://github.com/ClickHouse/ClickHouse/pull/73827) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* ClickHouse Cloud のパスワードリセットに関するメッセージを改善しました。 [#73831](https://github.com/ClickHouse/ClickHouse/pull/73831) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルへの追記をサポートしない File テーブルのエラーメッセージを改善。 [#73832](https://github.com/ClickHouse/ClickHouse/pull/73832) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが誤ってターミナル上でバイナリ形式（Native、Parquet、Avro など）での出力を要求した場合に確認を行うようにしました。これにより [#59524](https://github.com/ClickHouse/ClickHouse/issues/59524) がクローズされました。 [#73833](https://github.com/ClickHouse/ClickHouse/pull/73833)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* Pretty および Vertical 形式の出力では、ターミナル上で末尾の空白をハイライト表示して視認性を向上しました。この挙動は `output_format_pretty_highlight_trailing_spaces` 設定で制御できます。初期実装は [Braden Burns](https://github.com/bradenburns) によるもので、[#72996](https://github.com/ClickHouse/ClickHouse/issues/72996) に基づきます。[#71590](https://github.com/ClickHouse/ClickHouse/issues/71590) をクローズしました。[#73847](https://github.com/ClickHouse/ClickHouse/pull/73847)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `clickhouse-client` と `clickhouse-local` は、ファイルからリダイレクトされた場合に stdin の圧縮形式を自動検出するようになりました。これにより [#70865](https://github.com/ClickHouse/ClickHouse/issues/70865) がクローズされました。 [#73848](https://github.com/ClickHouse/ClickHouse/pull/73848) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* デフォルトで、pretty フォーマットにおいて長すぎるカラム名を切り詰めるようにしました。これは `output_format_pretty_max_column_name_width_cut_to` および `output_format_pretty_max_column_name_width_min_chars_to_cut` の設定によって制御されます。これは [#66502](https://github.com/ClickHouse/ClickHouse/issues/66502) における [tanmaydatta](https://github.com/tanmaydatta) による作業の継続です。この変更により [#65968](https://github.com/ClickHouse/ClickHouse/issues/65968) がクローズされます。 [#73851](https://github.com/ClickHouse/ClickHouse/pull/73851)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `Pretty` フォーマットの表示をより見やすくするため、前のブロックの出力からあまり時間が経過していない場合はブロックをまとめて表示するようにしました。これは新しい設定項目 `output_format_pretty_squash_consecutive_ms`（デフォルト 50 ms）および `output_format_pretty_squash_max_wait_ms`（デフォルト 1000 ms）で制御されます。[#49537](https://github.com/ClickHouse/ClickHouse/issues/49537) の継続です。この変更により [#49153](https://github.com/ClickHouse/ClickHouse/issues/49153) がクローズされました。[#73852](https://github.com/ClickHouse/ClickHouse/pull/73852)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 現在マージ中のソースパーツ数を示すメトリクスを追加しました。これにより [#70809](https://github.com/ClickHouse/ClickHouse/issues/70809) がクローズされます。[#73868](https://github.com/ClickHouse/ClickHouse/pull/73868)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* 出力先がターミナルの場合、`Vertical` 形式で列をハイライト表示するようにしました。これは `output_format_pretty_color` 設定で無効化できます。 [#73898](https://github.com/ClickHouse/ClickHouse/pull/73898) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* MySQL 互換機能を強化し、現在は `mysqlsh`（Oracle 製の高機能な MySQL CLI）が ClickHouse に接続できるようになりました。これはテストを容易にするために必要です。 [#73912](https://github.com/ClickHouse/ClickHouse/pull/73912) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* Pretty フォーマットでは、テーブルセル内に複数行フィールドを描画できるようになり、可読性が向上しました。これはデフォルトで有効で、設定 `output_format_pretty_multiline_fields` で制御できます。[#64094](https://github.com/ClickHouse/ClickHouse/issues/64094) における [Volodyachan](https://github.com/Volodyachan) による作業の継続です。これにより [#56912](https://github.com/ClickHouse/ClickHouse/issues/56912) がクローズされます。[#74032](https://github.com/ClickHouse/ClickHouse/pull/74032)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ブラウザ内の JavaScript から X-ClickHouse HTTP ヘッダーへアクセスできるようにしました。これによりアプリケーションの開発がより容易になります。 [#74180](https://github.com/ClickHouse/ClickHouse/pull/74180) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `JSONEachRowWithProgress` フォーマットには、メタデータ付きのイベントに加えて、合計値および極値が含まれます。また、`rows_before_limit_at_least` と `rows_before_aggregation` も含まれます。このフォーマットでは、部分的な結果の後に例外が発生した場合でも、その例外が正しく出力されます。進捗には経過ナノ秒が含まれるようになりました。最後に 1 回、最終的な進捗イベントが出力されます。クエリ実行中の進捗は、`interactive_delay` 設定値より短い間隔では出力されません。 [#74181](https://github.com/ClickHouse/ClickHouse/pull/74181) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Hourglass が Play UI でスムーズに回転するようになりました。 [#74182](https://github.com/ClickHouse/ClickHouse/pull/74182) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* HTTP レスポンスが圧縮されている場合でも、受信したパケットは到着し次第すぐに送信します。これにより、ブラウザは進捗を示すパケットと圧縮データの両方を受信できます。 [#74201](https://github.com/ClickHouse/ClickHouse/pull/74201) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* 出力レコード数が N = `output_format_pretty_max_rows` を超える場合、先頭の N 行だけを表示するのではなく、出力テーブルを途中で切り、先頭 N/2 行と末尾 N/2 行を表示するようにしました。[#64200](https://github.com/ClickHouse/ClickHouse/issues/64200) の継続です。[#59502](https://github.com/ClickHouse/ClickHouse/issues/59502) を解決します。[#73929](https://github.com/ClickHouse/ClickHouse/pull/73929)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* ハッシュ結合アルゴリズムが有効な場合に、より汎用的な結合計画アルゴリズムを使用できるようにしました。 [#71926](https://github.com/ClickHouse/ClickHouse/pull/71926) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `DateTime64` 型のカラムに対して bloom&#95;filter インデックスを作成できるようにしました。 [#66416](https://github.com/ClickHouse/ClickHouse/pull/66416) ([Yutong Xiao](https://github.com/YutSean))。
* `min_age_to_force_merge_seconds` と `min_age_to_force_merge_on_partition_only` の両方が有効化されている場合、パーツのマージ処理は最大バイト数制限を無視します。 [#73656](https://github.com/ClickHouse/ClickHouse/pull/73656) ([Kai Zhu](https://github.com/nauu))。
* トレーサビリティ向上のため、OpenTelemetry のスパンログテーブルに HTTP ヘッダー情報を追加しました。 [#70516](https://github.com/ClickHouse/ClickHouse/pull/70516) ([jonymohajanGmail](https://github.com/jonymohajanGmail)).
* `GMT` タイムゾーン固定ではなく、カスタムタイムゾーンで `orc` ファイルを書き出せるようにしました。 [#70615](https://github.com/ClickHouse/ClickHouse/pull/70615) ([kevinyhzou](https://github.com/KevinyhZou)).
* クラウド間バックアップの書き込み時に I/O スケジューリング設定を考慮するようにしました。 [#71093](https://github.com/ClickHouse/ClickHouse/pull/71093) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* `system.asynchronous_metrics` に `metric` 列のエイリアス `name` を追加しました。 [#71164](https://github.com/ClickHouse/ClickHouse/pull/71164) ([megao](https://github.com/jetgm)).
* 何らかの歴史的経緯により、クエリ `ALTER TABLE MOVE PARTITION TO TABLE` は専用の `ALTER_MOVE_PARTITION` 権限ではなく、`SELECT` と `ALTER DELETE` 権限をチェックしていました。このPRで、このアクセス種別が使用されるようにしました。互換性維持のため、`SELECT` と `ALTER DELETE` が付与されている場合には、この権限も暗黙的に付与されますが、この挙動は将来のリリースで削除される予定です。[#16403](https://github.com/ClickHouse/ClickHouse/issues/16403) をクローズします。[#71632](https://github.com/ClickHouse/ClickHouse/pull/71632)（[pufit](https://github.com/pufit)）。
* ソートキー内のカラムをマテリアライズしようとした際に、ソート順が崩れる場合は許可せず、例外をスローするようにしました。 [#71891](https://github.com/ClickHouse/ClickHouse/pull/71891) ([Peter Nguyen](https://github.com/petern48)).
* `EXPLAIN QUERY TREE` で秘密情報をマスクするようにしました。 [#72025](https://github.com/ClickHouse/ClickHouse/pull/72025) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 「ネイティブ」リーダーで Parquet の整数論理型をサポートします。 [#72105](https://github.com/ClickHouse/ClickHouse/pull/72105) ([Arthur Passos](https://github.com/arthurpassos)).
* デフォルトユーザーにパスワードが必要な場合、ブラウザーで対話的に認証情報の入力を求めるようにしました。以前のバージョンではサーバーは HTTP 403 を返していましたが、現在は HTTP 401 を返します。 [#72198](https://github.com/ClickHouse/ClickHouse/pull/72198) ([Alexey Milovidov](https://github.com/alexey-milovidov))。
* アクセス種別 `CREATE_USER`、`ALTER_USER`、`DROP_USER`、`CREATE_ROLE`、`ALTER_ROLE`、`DROP_ROLE` をグローバルからパラメータ化されたものに変更しました。これにより、ユーザーはアクセス管理権限をよりきめ細かく付与できるようになりました。 [#72246](https://github.com/ClickHouse/ClickHouse/pull/72246) ([pufit](https://github.com/pufit)).
* `system.mutations` に `latest_fail_error_code_name` カラムを追加します。このカラムは、停止した mutation に関する新しいメトリクスを導入し、クラウドで発生したエラーのグラフを作成するために必要です。また、必要に応じてノイズの少ない新しいアラートを追加するためにも使用します。 [#72398](https://github.com/ClickHouse/ClickHouse/pull/72398) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* `ATTACH PARTITION` クエリにおけるメモリアロケーション量を削減しました。 [#72583](https://github.com/ClickHouse/ClickHouse/pull/72583) ([Konstantin Morozov](https://github.com/k-morozov)).
* `max_bytes_before_external_sort` の制限をクエリ全体のメモリ消費量に基づくものとしました（以前は 1 つのソートスレッドにおけるソートブロック内のバイト数を表していましたが、現在は `max_bytes_before_external_group_by` と同じ意味を持ち、すべてのスレッドを含めたクエリ全体のメモリ使用量に対する総上限となります）。また、ディスク上のブロックサイズを制御するための設定 `min_external_sort_block_bytes` を追加しました。 [#72598](https://github.com/ClickHouse/ClickHouse/pull/72598) ([Azat Khuzhin](https://github.com/azat)).
* トレースコレクタによるメモリ制限を無視するようにしました。 [#72606](https://github.com/ClickHouse/ClickHouse/pull/72606) ([Azat Khuzhin](https://github.com/azat)).
* サーバー設定 `dictionaries_lazy_load` と `wait_dictionaries_load_at_startup` を `system.server_settings` に追加しました。 [#72664](https://github.com/ClickHouse/ClickHouse/pull/72664) ([Christoph Wurm](https://github.com/cwurm))。
* `BACKUP`/`RESTORE` クエリで指定可能な設定の一覧に `max_backup_bandwidth` を追加しました。 [#72665](https://github.com/ClickHouse/ClickHouse/pull/72665) ([Christoph Wurm](https://github.com/cwurm)).
* 複製クラスタで生成されるログ量を最小限に抑えるために、ReplicatedMergeTree エンジンで出現する複製パーツに関するログレベルを引き下げました。 [#72876](https://github.com/ClickHouse/ClickHouse/pull/72876) ([mor-akamai](https://github.com/morkalfon)).
* 論理和における共通式の抽出を改善しました。すべての項に共通部分式が存在しない場合でも、結果のフィルター式を簡略化できるようにしました。[#71537](https://github.com/ClickHouse/ClickHouse/issues/71537) の続きです。[#73271](https://github.com/ClickHouse/ClickHouse/pull/73271)（[Dmitry Novik](https://github.com/novikd)）。
* `S3Queue`/`AzureQueue` ストレージで、テーブル作成時に設定が指定されていなかったテーブルにも、後から設定を追加できるようにしました。 [#73283](https://github.com/ClickHouse/ClickHouse/pull/73283) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定項目 `least_greatest_legacy_null_behavior`（デフォルト: `false`）を導入しました。この設定は、`least` および `greatest` 関数が `NULL` 引数を無条件に `NULL` を返すことで処理するか（`true` の場合）、あるいはそれらを無視するか（`false` の場合）を制御します。 [#73344](https://github.com/ClickHouse/ClickHouse/pull/73344) ([Robert Schulze](https://github.com/rschu1ze)).
* ObjectStorageQueueMetadata のクリーンアップスレッドで Keeper の multi リクエストを使用するようになりました。 [#73357](https://github.com/ClickHouse/ClickHouse/pull/73357) ([Antonio Andelic](https://github.com/antonio2368)).
* ClickHouse が cgroup の下で実行されている場合でも、システム負荷、プロセススケジューリング、メモリなどに関連するシステム全体の非同期メトリクスは引き続き収集されます。ClickHouse がホスト上で多くのリソースを消費している唯一のプロセスである場合、これらは有用なシグナルを提供する可能性があります。[#73369](https://github.com/ClickHouse/ClickHouse/pull/73369)（[Nikita Taranov](https://github.com/nickitat)）。
* ストレージ `S3Queue` で、24.6 以前に作成された古い順序付きテーブルを、バケット構造を用いる新しい形式へ移行できるようにしました。 [#73467](https://github.com/ClickHouse/ClickHouse/pull/73467) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 既存の `system.s3queue` と同様に `system.azure_queue` を追加。 [#73477](https://github.com/ClickHouse/ClickHouse/pull/73477) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 関数 `parseDateTime64`（およびその派生関数）が、1970年以前／2106年以降の日付の入力値に対して正しい結果を返すようになりました。例: `SELECT parseDateTime64InJodaSyntax('2200-01-01 00:00:00.000', 'yyyy-MM-dd HH:mm:ss.SSS')`。 [#73594](https://github.com/ClickHouse/ClickHouse/pull/73594) ([zhanglistar](https://github.com/zhanglistar))。
* ユーザーから指摘されていた `clickhouse-disks` の使い勝手に関するいくつかの問題に対応しました。 [#67136](https://github.com/ClickHouse/ClickHouse/issues/67136) をクローズします。 [#73616](https://github.com/ClickHouse/ClickHouse/pull/73616) ([Daniil Ivanik](https://github.com/divanik)).
* storage S3(Azure)Queue のコミット設定を変更できるようにしました（コミット設定は `max_processed_files_before_commit`、`max_processed_rows_before_commit`、`max_processed_bytes_before_commit`、`max_processing_time_sec_before_commit` です）。[#73635](https://github.com/ClickHouse/ClickHouse/pull/73635) ([Kseniia Sumarokova](https://github.com/kssenii))。
* ストレージ S3(Azure)Queue で、ソース間の進行状況を集約し、コミット制限設定と比較できるようにしました。 [#73641](https://github.com/ClickHouse/ClickHouse/pull/73641) ([Kseniia Sumarokova](https://github.com/kssenii)).
* コア設定のサポートを `BACKUP`/`RESTORE` クエリに追加しました。 [#73650](https://github.com/ClickHouse/ClickHouse/pull/73650) ([Vitaly Baranov](https://github.com/vitlibar)).
* Parquet 出力で `output_format_compression_level` が考慮されるようになりました。 [#73651](https://github.com/ClickHouse/ClickHouse/pull/73651) ([Arthur Passos](https://github.com/arthurpassos)).
* Apache Arrow の `fixed_size_list` を未サポート型として扱うのではなく、`Array` 型として読み取れるようにしました。 [#73654](https://github.com/ClickHouse/ClickHouse/pull/73654) ([Julian Meyers](https://github.com/J-Meyers)).
* 2 つのバックアップエンジン `Memory`（現在のユーザーセッション内にバックアップを保持）と、テスト用途の `Null`（どこにもバックアップを保持しない）を追加しました。 [#73690](https://github.com/ClickHouse/ClickHouse/pull/73690) ([Vitaly Baranov](https://github.com/vitlibar))。
* `concurrent_threads_soft_limit_num` と `concurrent_threads_soft_limit_num_ratio_to_cores` は、サーバーの再起動なしに変更できるようになりました。[#73713](https://github.com/ClickHouse/ClickHouse/pull/73713) ([Sergei Trifonov](https://github.com/serxa)).
* `formatReadable` 関数に拡張数値型（`Decimal` およびビッグ整数）への対応を追加しました。[#73765](https://github.com/ClickHouse/ClickHouse/pull/73765)（[Raúl Marín](https://github.com/Algunenano)）。
* Postgres ワイヤプロトコルとの互換性のために TLS をサポートしました。 [#73812](https://github.com/ClickHouse/ClickHouse/pull/73812) ([scanhex12](https://github.com/scanhex12)).
* 関数 `isIPv4String` は、正しい IPv4 アドレスの後にゼロバイトが続いている場合に true を返していましたが、このケースでは false を返すべきでした。[#65387](https://github.com/ClickHouse/ClickHouse/issues/65387) の継続対応。[#73946](https://github.com/ClickHouse/ClickHouse/pull/73946)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* MySQL ワイヤプロトコルにおけるエラーコードを MySQL と互換性を持つようにしました。[#56831](https://github.com/ClickHouse/ClickHouse/issues/56831) の継続対応です。[#50957](https://github.com/ClickHouse/ClickHouse/issues/50957) をクローズします。[#73948](https://github.com/ClickHouse/ClickHouse/pull/73948)（[Alexey Milovidov](https://github.com/alexey-milovidov)）。
* `IN` や `NOT IN` などの演算子で使用される列挙型リテラルを、その列挙型に対して検証し、リテラルが有効な列挙値でない場合に例外をスローする設定 `validate_enum_literals_in_opearators` を追加しました。 [#73985](https://github.com/ClickHouse/ClickHouse/pull/73985) ([Vladimir Cherkasov](https://github.com/vdimir))。
* Storage `S3(Azure)Queue` で、（コミット設定で定義される）単一バッチ内のすべてのファイルを、単一の keeper トランザクション内でコミットするようにしました。 [#73991](https://github.com/ClickHouse/ClickHouse/pull/73991) ([Kseniia Sumarokova](https://github.com/kssenii))。
* 実行可能な UDF と辞書に対するヘッダー検出を無効にしました（Function &#39;X&#39;: wrong result, expected Y row(s), actual Y-1 という問題が発生する可能性があったため）。 [#73992](https://github.com/ClickHouse/ClickHouse/pull/73992) ([Azat Khuzhin](https://github.com/azat)).
* `EXPLAIN PLAN` に `distributed` オプションを追加しました。これにより、`EXPLAIN distributed=1 ...` によって、`ReadFromParallelRemote*` ステップにリモート側のプランが追加されるようになりました。 [#73994](https://github.com/ClickHouse/ClickHouse/pull/73994) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic 引数を取る not/xor に対して正しい戻り値の型を使用するようにしました。 [#74013](https://github.com/ClickHouse/ClickHouse/pull/74013) ([Pavel Kruglov](https://github.com/Avogar)).
* テーブル作成後でも `add_implicit_sign_column_constraint_for_collapsing_engine` を変更できるようにしました。 [#74014](https://github.com/ClickHouse/ClickHouse/pull/74014) ([Christoph Wurm](https://github.com/cwurm)).
* マテリアライズドビューの SELECT クエリでサブカラムをサポートできるようになりました。 [#74030](https://github.com/ClickHouse/ClickHouse/pull/74030) ([Pavel Kruglov](https://github.com/Avogar)).
* `clickhouse-client` でカスタムプロンプトを設定する簡単な方法が 3 つあります。1. コマンドラインパラメータ `--prompt` を使う方法、2. 設定ファイル内で設定項目 `<prompt>[...]</prompt>` を使う方法、そして 3. 同じく設定ファイル内で、接続ごとの設定 `<connections_credentials><prompt>[...]</prompt></connections_credentials>` を使う方法です。[#74168](https://github.com/ClickHouse/ClickHouse/pull/74168)（[Christoph Wurm](https://github.com/cwurm)）。
* ClickHouse Client がポート 9440 への接続時に安全な接続を自動判別するようになりました。 [#74212](https://github.com/ClickHouse/ClickHouse/pull/74212) ([Christoph Wurm](https://github.com/cwurm)).
* http&#95;handlers でのユーザー認証を、ユーザー名のみで行えるようにしました（以前はユーザー名に加えてパスワードの入力も必要でした）。 [#74221](https://github.com/ClickHouse/ClickHouse/pull/74221) ([Azat Khuzhin](https://github.com/azat)).
* 代替クエリ言語である PRQL と KQL のサポートは、実験的機能として位置付けられました。これらを使用するには、設定 `allow_experimental_prql_dialect = 1` および `allow_experimental_kusto_dialect = 1` を指定します。[#74224](https://github.com/ClickHouse/ClickHouse/pull/74224) ([Robert Schulze](https://github.com/rschu1ze))。
* より多くの集約関数でデフォルトの Enum 型を返せるようにしました。 [#74272](https://github.com/ClickHouse/ClickHouse/pull/74272) ([Raúl Marín](https://github.com/Algunenano)).
* `OPTIMIZE TABLE` では、既存のキーワード `FINAL` に代わるものとして、キーワード `FORCE` を指定できるようになりました。 [#74342](https://github.com/ClickHouse/ClickHouse/pull/74342) ([Robert Schulze](https://github.com/rschu1ze))。
* サーバーのシャットダウンに時間がかかりすぎる場合にアラートを発生させるために必要な `IsServerShuttingDown` メトリクスを追加。[#74429](https://github.com/ClickHouse/ClickHouse/pull/74429) ([Miсhael Stetsyuk](https://github.com/mstetsyuk))。
* EXPLAIN の出力に Iceberg テーブル名を追加しました。 [#74485](https://github.com/ClickHouse/ClickHouse/pull/74485) ([alekseev-maksim](https://github.com/alekseev-maksim)).
* 旧アナライザーで RECURSIVE CTE を使用した際のエラーメッセージを改善しました。 [#74523](https://github.com/ClickHouse/ClickHouse/pull/74523) ([Raúl Marín](https://github.com/Algunenano)).
* 拡張されたエラーメッセージを `system.errors` に表示できるようにしました。 [#74574](https://github.com/ClickHouse/ClickHouse/pull/74574) ([Vitaly Baranov](https://github.com/vitlibar)).
* clickhouse-keeper とのクライアント通信でパスワード認証を使用できるようにしました。この機能は、サーバーおよびクライアントに対して適切な SSL 設定を行っている場合にはそれほど有用ではありませんが、一部のケースでは依然として有用です。パスワードは 16 文字を超えることはできません。Keeper Auth モデルとは関連していません。 [#74673](https://github.com/ClickHouse/ClickHouse/pull/74673) ([alesapin](https://github.com/alesapin)).
* Config Reloader 用のエラーコードを追加。 [#74746](https://github.com/ClickHouse/ClickHouse/pull/74746) ([Garrett Thomas](https://github.com/garrettthomaskth)).
* MySQL および PostgreSQL のテーブル関数とエンジンにおいて IPv6 アドレスのサポートを追加しました。 [#74796](https://github.com/ClickHouse/ClickHouse/pull/74796) ([Mikhail Koviazin](https://github.com/mkmkme)).
* `divideDecimal` に対するショートサーキット最適化を実装。[#74280](https://github.com/ClickHouse/ClickHouse/issues/74280) を修正。[#74843](https://github.com/ClickHouse/ClickHouse/pull/74843)（[Kevin Mingtarja](https://github.com/kevinmingtarja)）。
* スタートアップスクリプト内でユーザーを指定できるようになりました。 [#74894](https://github.com/ClickHouse/ClickHouse/pull/74894) ([pufit](https://github.com/pufit)).
* Azure SAS トークンのサポートを追加しました。 [#72959](https://github.com/ClickHouse/ClickHouse/pull/72959) ([Azat Khuzhin](https://github.com/azat)).

#### バグ修正（公式安定版リリースでユーザーに影響する誤動作） {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* Parquet の圧縮レベルは、圧縮コーデックがそれをサポートしている場合にのみ設定されるようにしました。 [#74659](https://github.com/ClickHouse/ClickHouse/pull/74659) ([Arthur Passos](https://github.com/arthurpassos)).
* モディファイア付きの照合ロケールを使用するとエラーが発生するリグレッションを修正しました。例えば、`SELECT arrayJoin(['kk 50', 'KK 01', ' KK 2', ' KK 3', 'kk 1', 'x9y99', 'x9y100']) item ORDER BY item ASC COLLATE 'tr-u-kn-true-ka-shifted` は現在では正常に動作します。[#73544](https://github.com/ClickHouse/ClickHouse/pull/73544)（[Robert Schulze](https://github.com/rschu1ze)）。
* SEQUENTIAL ノードを keeper-client で作成できなかった問題を修正。 [#64177](https://github.com/ClickHouse/ClickHouse/pull/64177) ([Duc Canh Le](https://github.com/canhld94)).
* position 関数での文字数カウントの不具合を修正しました。 [#71003](https://github.com/ClickHouse/ClickHouse/pull/71003) ([思维](https://github.com/heymind)).
* 部分的な権限の取り消しが正しく処理されていなかったため、アクセスエンティティに対する `RESTORE` 操作に本来より多くの権限が必要とされていました。この PR でこの問題を修正しました。Closes [#71853](https://github.com/ClickHouse/ClickHouse/issues/71853). [#71958](https://github.com/ClickHouse/ClickHouse/pull/71958) ([pufit](https://github.com/pufit)).
* `ALTER TABLE REPLACE/MOVE PARTITION FROM/TO TABLE` 実行後に発生していた一時停止を回避し、バックグラウンドタスクのスケジューリング用に正しい設定を取得するようにしました。 [#72024](https://github.com/ClickHouse/ClickHouse/pull/72024) ([Aleksei Filatov](https://github.com/aalexfvk)).
* 一部の入力および出力フォーマット（Parquet や Arrow など）における空のタプルの扱いを修正しました。 [#72616](https://github.com/ClickHouse/ClickHouse/pull/72616) ([Michael Kolupaev](https://github.com/al13n321))。
* ワイルドカードを使用したデータベースやテーブルに対するカラムレベルの SELECT/INSERT 権限を付与する GRANT ステートメントは、エラーを返すようになりました。 [#72646](https://github.com/ClickHouse/ClickHouse/pull/72646) ([Johann Gan](https://github.com/johanngan)).
* 対象のアクセスエンティティに暗黙的な権限付与が存在するためにユーザーが `REVOKE ALL ON *.*` を実行できない状況を修正しました。 [#72872](https://github.com/ClickHouse/ClickHouse/pull/72872) ([pufit](https://github.com/pufit)).
* formatDateTime スカラ関数で正のタイムゾーンの書式設定を修正。 [#73091](https://github.com/ClickHouse/ClickHouse/pull/73091) ([ollidraese](https://github.com/ollidraese))。
* PROXYv1 経由で接続が行われ、`auth_use_forwarded_address` が設定されている場合に、送信元ポートが正しく反映されるよう修正しました。以前はプロキシ側のポートが誤って使用されていました。`currentQueryID()` 関数を追加しました。 [#73095](https://github.com/ClickHouse/ClickHouse/pull/73095) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* TCPHandler でフォーマット設定が NativeWriter に伝播され、`output_format_native_write_json_as_string` のような設定が正しく適用されるようにしました。 [#73179](https://github.com/ClickHouse/ClickHouse/pull/73179) ([Pavel Kruglov](https://github.com/Avogar)).
* StorageObjectStorageQueue で発生するクラッシュを修正。 [#73274](https://github.com/ClickHouse/ClickHouse/pull/73274) ([Kseniia Sumarokova](https://github.com/kssenii)).
* サーバーシャットダウン時にまれに発生するリフレッシュ可能なマテリアライズドビューのクラッシュを修正。 [#73323](https://github.com/ClickHouse/ClickHouse/pull/73323) ([Michael Kolupaev](https://github.com/al13n321)).
* 関数 `formatDateTime` のプレースホルダ `%f` は、常に 6 桁のサブ秒精度の数字を生成するようになりました。これにより、MySQL の `DATE_FORMAT` 関数との動作互換性が確保されます。以前の動作は、設定 `formatdatetime_f_prints_scale_number_of_digits = 1` を使用することで復元できます。 [#73324](https://github.com/ClickHouse/ClickHouse/pull/73324) ([ollidraese](https://github.com/ollidraese)).
* `s3` ストレージおよびテーブル関数からの読み取り時の `_etag` 列によるフィルタリングを修正しました。 [#73353](https://github.com/ClickHouse/ClickHouse/pull/73353) ([Anton Popov](https://github.com/CurtizJ)).
* 旧アナライザーを使用している場合に、`JOIN ON` 式で `IN (subquery)` を使用すると発生する `Not-ready Set is passed as the second argument for function 'in'` エラーを修正。 [#73382](https://github.com/ClickHouse/ClickHouse/pull/73382) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* Dynamic および JSON カラムに対するスカッシュ処理の準備を修正しました。以前は、一部のケースで、型/パス数の制限に達していない場合でも、shared variant/shared data に新しい型が挿入されてしまうことがありました。 [#73388](https://github.com/ClickHouse/ClickHouse/pull/73388) ([Pavel Kruglov](https://github.com/Avogar)).
* 型のバイナリデコード時にサイズ値の破損を検査し、過大なメモリ割り当てを避けるようにしました。 [#73390](https://github.com/ClickHouse/ClickHouse/pull/73390) ([Pavel Kruglov](https://github.com/Avogar)).
* 並列レプリカを有効にした単一レプリカクラスタからの読み取り時に発生する論理エラーを修正しました。 [#73403](https://github.com/ClickHouse/ClickHouse/pull/73403) ([Michael Kolupaev](https://github.com/al13n321)).
* ZooKeeper および旧バージョンの Keeper 使用時の ObjectStorageQueue を修正。 [#73420](https://github.com/ClickHouse/ClickHouse/pull/73420) ([Antonio Andelic](https://github.com/antonio2368)).
* デフォルトで Hive パーティション化を有効にするために必要な修正を実装しました。 [#73479](https://github.com/ClickHouse/ClickHouse/pull/73479) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ベクトル類似インデックスの作成時に発生するデータレースを修正。 [#73517](https://github.com/ClickHouse/ClickHouse/pull/73517) ([Antonio Andelic](https://github.com/antonio2368)).
* 辞書のデータソースに誤ったデータを含む関数がある場合に発生するセグメンテーションフォルトを修正しました。 [#73535](https://github.com/ClickHouse/ClickHouse/pull/73535) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* ストレージ S3(Azure)Queue における挿入失敗時の再試行処理を修正。[#70951](https://github.com/ClickHouse/ClickHouse/issues/70951) をクローズ。[#73546](https://github.com/ClickHouse/ClickHouse/pull/73546) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `LowCardinality` 要素を含むタプルに対して設定 `optimize_functions_to_subcolumns` を有効化している場合に、特定の状況で発生していた関数 `tupleElement` のエラーを修正しました。 [#73548](https://github.com/ClickHouse/ClickHouse/pull/73548) ([Anton Popov](https://github.com/CurtizJ)).
* enum の glob の後に range one が続く場合の構文解析を修正しました。[#73473](https://github.com/ClickHouse/ClickHouse/issues/73473) を修正。[#73569](https://github.com/ClickHouse/ClickHouse/pull/73569)（[Konstantin Bogdanov](https://github.com/thevar1able)）。
* 非レプリケート MergeTree テーブルに対する固定設定 `parallel_replicas_for_non_replicated_merge_tree` が、非レプリケートテーブルに対するサブクエリ内で無視されていた問題を修正しました。 [#73584](https://github.com/ClickHouse/ClickHouse/pull/73584) ([Igor Nikonov](https://github.com/devcrafter)).
* タスクをスケジュールできない場合にスローされる `std::logical_error` の修正。ストレステスト中に発見。[#73629](https://github.com/ClickHouse/ClickHouse/pull/73629)（[Alexander Gololobov](https://github.com/davenger)）。
* 分散クエリで誤った処理ステージが選択されて論理エラーが発生するのを防ぐため、`EXPLAIN SYNTAX` ではクエリを解釈しないようにしました。[#65205](https://github.com/ClickHouse/ClickHouse/issues/65205) を修正。[#73634](https://github.com/ClickHouse/ClickHouse/pull/73634) ([Dmitry Novik](https://github.com/novikd))。
* Dynamic カラムにおいて発生しうるデータ不整合を修正しました。`Nested columns sizes are inconsistent with local_discriminators column size` という論理エラーが発生する可能性のある問題を修正しました。 [#73644](https://github.com/ClickHouse/ClickHouse/pull/73644) ([Pavel Kruglov](https://github.com/Avogar)).
* `FINAL` および `SAMPLE` を使用するクエリで発生していた `NOT_FOUND_COLUMN_IN_BLOCK` エラーを修正しました。`CollapsingMergeTree` に対する `FINAL` 付きの SELECT クエリで誤った結果が返される問題を修正し、`FINAL` に対する最適化を有効化しました。 [#73682](https://github.com/ClickHouse/ClickHouse/pull/73682) ([Anton Popov](https://github.com/CurtizJ)).
* LIMIT BY COLUMNS で発生するクラッシュを修正。 [#73686](https://github.com/ClickHouse/ClickHouse/pull/73686) ([Raúl Marín](https://github.com/Algunenano))。
* 通常のプロジェクションの使用が強制され、かつクエリが定義済みのプロジェクションと完全に同一であるにもかかわらず、そのプロジェクションが選択されずエラーが報告されてしまうバグを修正しました。 [#73700](https://github.com/ClickHouse/ClickHouse/pull/73700) ([Shichao Jin](https://github.com/jsc0218)).
* Dynamic/Object 構造体のデシリアライズ処理を修正しました。以前は CANNOT&#95;READ&#95;ALL&#95;DATA 例外が発生する可能性がありました。 [#73767](https://github.com/ClickHouse/ClickHouse/pull/73767) ([Pavel Kruglov](https://github.com/Avogar)).
* バックアップからパーツを復元する際、`metadata_version.txt` をスキップするようにしました。 [#73768](https://github.com/ClickHouse/ClickHouse/pull/73768) ([Vitaly Baranov](https://github.com/vitlibar)).
* LIKE を使用した Enum への CAST 時に発生するセグメンテーションフォルトを修正。 [#73775](https://github.com/ClickHouse/ClickHouse/pull/73775) ([zhanglistar](https://github.com/zhanglistar)).
* ディスクとして機能しない S3 Express バケットの問題を修正。 [#73777](https://github.com/ClickHouse/ClickHouse/pull/73777) ([Sameer Tamsekar](https://github.com/stamsekar)).
* CollapsingMergeTree テーブルで、`sign` 列に無効な値を持つ行をマージできるようにしました。 [#73864](https://github.com/ClickHouse/ClickHouse/pull/73864) ([Christoph Wurm](https://github.com/cwurm)).
* オフラインのレプリカに対して DDL をクエリするとエラーが発生していた問題を修正。 [#73876](https://github.com/ClickHouse/ClickHouse/pull/73876) ([Tuan Pham Anh](https://github.com/tuanpach)).
* ネストされたタプルに明示的な名前（&#39;keys&#39;,&#39;values&#39;）が付いていない `Map` を作成できていたために、`map()` 型の比較がまれに失敗していた問題を修正しました。 [#73878](https://github.com/ClickHouse/ClickHouse/pull/73878) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* `GROUP BY ALL` 句の解決時にウィンドウ関数を無視するようにしました。 [#73501](https://github.com/ClickHouse/ClickHouse/issues/73501) の問題を修正。 [#73916](https://github.com/ClickHouse/ClickHouse/pull/73916)（[Dmitry Novik](https://github.com/novikd)）。
* 暗黙的な権限を修正（以前はワイルドカードとして扱われていた）。 [#73932](https://github.com/ClickHouse/ClickHouse/pull/73932) ([Azat Khuzhin](https://github.com/azat)).
* ネストされた Map を作成する際の高いメモリ使用量を修正しました。 [#73982](https://github.com/ClickHouse/ClickHouse/pull/73982) ([Pavel Kruglov](https://github.com/Avogar)).
* 空キーを含むネストされた JSON の解析を修正。 [#73993](https://github.com/ClickHouse/ClickHouse/pull/73993) ([Pavel Kruglov](https://github.com/Avogar)).
* 修正: 別のエイリアスから参照され、かつ逆順で選択された場合に、そのエイリアスがプロジェクションに含まれないことがある問題を修正。 [#74033](https://github.com/ClickHouse/ClickHouse/pull/74033) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* plain&#95;rewritable ディスク初期化中の Azure での object not found エラーを無視するようになりました。 [#74059](https://github.com/ClickHouse/ClickHouse/pull/74059) ([Julia Kartseva](https://github.com/jkartseva)).
* enum 型および空テーブルに対する `any` と `anyLast` の挙動を修正。 [#74061](https://github.com/ClickHouse/ClickHouse/pull/74061) ([Joanna Hulboj](https://github.com/jh0x)).
* ユーザーが Kafka テーブルエンジンでキーワード引数を指定した場合の不具合を修正します。 [#74064](https://github.com/ClickHouse/ClickHouse/pull/74064) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Storage `S3Queue` の設定で、接頭辞 &quot;s3queue&#95;&quot; の有無を切り替える処理を修正しました。 [#74075](https://github.com/ClickHouse/ClickHouse/pull/74075) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 設定 `allow_push_predicate_ast_for_distributed_subqueries` を追加しました。これにより、analyzer を使用する分散クエリに対して AST ベースの述語プッシュダウンが有効になります。これは、クエリプランのシリアライズを伴う分散クエリがサポートされるまでの一時的なソリューションとして使用します。[#66878](https://github.com/ClickHouse/ClickHouse/issues/66878) [#69472](https://github.com/ClickHouse/ClickHouse/issues/69472) [#65638](https://github.com/ClickHouse/ClickHouse/issues/65638) [#68030](https://github.com/ClickHouse/ClickHouse/issues/68030) [#73718](https://github.com/ClickHouse/ClickHouse/issues/73718) をクローズします。[#74085](https://github.com/ClickHouse/ClickHouse/pull/74085) ([Nikolai Kochetov](https://github.com/KochetovNicolai))。
* [#73095](https://github.com/ClickHouse/ClickHouse/issues/73095) 対応以降、`forwarded_for` フィールドにポートが含まれる場合があり、その結果、ポート付きホスト名を解決できなくなっていた問題を修正しました。 [#74116](https://github.com/ClickHouse/ClickHouse/pull/74116) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy))。
* `ALTER TABLE (DROP STATISTICS ...) (DROP STATISTICS ...)` の誤った書式を修正しました。 [#74126](https://github.com/ClickHouse/ClickHouse/pull/74126) ([Han Fei](https://github.com/hanfei1991)).
* Issue [#66112](https://github.com/ClickHouse/ClickHouse/issues/66112) の修正。[#74128](https://github.com/ClickHouse/ClickHouse/pull/74128)（[Anton Ivashkin](https://github.com/ianton-ru)）。
* `CREATE TABLE` でテーブルエンジンとして `Loop` を使用することは、もはやできなくなりました。この組み合わせは以前、セグメンテーションフォルトを引き起こしていました。 [#74137](https://github.com/ClickHouse/ClickHouse/pull/74137) ([Yarik Briukhovetskyi](https://github.com/yariks5s))。
* PostgreSQL および SQLite のテーブル関数における SQL インジェクションを防止するセキュリティ上の問題を修正。 [#74144](https://github.com/ClickHouse/ClickHouse/pull/74144) ([Pablo Marcos](https://github.com/pamarcos)).
* 圧縮された Memory エンジンのテーブルからサブカラムを読み取る際に発生していたクラッシュを修正しました。[#74009](https://github.com/ClickHouse/ClickHouse/issues/74009) を解決します。[#74161](https://github.com/ClickHouse/ClickHouse/pull/74161)（[Nikita Taranov](https://github.com/nickitat)）。
* system.detached&#95;tables に対するクエリで発生していた無限ループを修正しました。 [#74190](https://github.com/ClickHouse/ClickHouse/pull/74190) ([Konstantin Morozov](https://github.com/k-morozov)).
* ファイルを失敗としてマークする際の s3queue の論理エラーを修正しました。 [#74216](https://github.com/ClickHouse/ClickHouse/pull/74216) ([Kseniia Sumarokova](https://github.com/kssenii)).
* ベースバックアップからの `RESTORE` 時のネイティブコピー設定（`allow_s3_native_copy`/`allow_azure_native_copy`）を修正。 [#74286](https://github.com/ClickHouse/ClickHouse/pull/74286) ([Azat Khuzhin](https://github.com/azat)).
* データベース内のデタッチされたテーブル数が `max_block_size` の倍数である場合に発生していた問題を修正しました。 [#74289](https://github.com/ClickHouse/ClickHouse/pull/74289) ([Konstantin Morozov](https://github.com/k-morozov)).
* ソースと宛先の認証情報が異なる場合の ObjectStorage（S3）経由のコピー処理を修正。 [#74331](https://github.com/ClickHouse/ClickHouse/pull/74331) ([Azat Khuzhin](https://github.com/azat)).
* GCS 上のネイティブコピーで JSON API の Rewrite メソッド使用検出を修正しました。 [#74338](https://github.com/ClickHouse/ClickHouse/pull/74338) ([Azat Khuzhin](https://github.com/azat))。
* `BackgroundMergesAndMutationsPoolSize` の誤った計算を修正しました（実際の値の 2 倍になっていました）。 [#74509](https://github.com/ClickHouse/ClickHouse/pull/74509) ([alesapin](https://github.com/alesapin)).
* Cluster Discovery を有効化した際に Keeper ウォッチがリークする不具合を修正。 [#74521](https://github.com/ClickHouse/ClickHouse/pull/74521) ([RinChanNOW](https://github.com/RinChanNOWWW)).
* UBSan により報告されたメモリアライメントの問題を修正 [#74512](https://github.com/ClickHouse/ClickHouse/issues/74512)。 [#74534](https://github.com/ClickHouse/ClickHouse/pull/74534)（[Arthur Passos](https://github.com/arthurpassos)）。
* テーブル作成中に発生する KeeperMap の並列クリーンアップ処理を修正しました。 [#74568](https://github.com/ClickHouse/ClickHouse/pull/74568) ([Antonio Andelic](https://github.com/antonio2368))。
* `EXCEPT` や `INTERSECT` が存在する場合でも、サブクエリ内の未使用の射影列を削除しないようにして、クエリ結果の正しさを保証します。[#73930](https://github.com/ClickHouse/ClickHouse/issues/73930) を修正。[#66465](https://github.com/ClickHouse/ClickHouse/issues/66465) を修正。[#74577](https://github.com/ClickHouse/ClickHouse/pull/74577)（[Dmitry Novik](https://github.com/novikd)）。
* `Tuple` 列を含み、スパースシリアライゼーションが有効になっているテーブル間での `INSERT SELECT` クエリを修正しました。 [#74698](https://github.com/ClickHouse/ClickHouse/pull/74698) ([Anton Popov](https://github.com/CurtizJ)).
* 関数 `right` が、定数の負のオフセットを使用した場合に正しく動作しませんでした。 [#74701](https://github.com/ClickHouse/ClickHouse/pull/74701) ([Daniil Ivanik](https://github.com/divanik))。
* クライアント側での不完全な伸長処理が原因で、gzip 圧縮データの挿入が失敗することがある問題を修正しました。 [#74707](https://github.com/ClickHouse/ClickHouse/pull/74707) ([siyuan](https://github.com/linkwk7)).
* ワイルドカードを含む権限付与に対して部分的な権限剥奪を行うと、想定以上の権限が削除されてしまう可能性がありました。この問題を修正しました [#74263](https://github.com/ClickHouse/ClickHouse/issues/74263)。 [#74751](https://github.com/ClickHouse/ClickHouse/pull/74751) ([pufit](https://github.com/pufit))。
* Keeper の修正: ディスクからのログエントリ読み取り処理を修正。 [#74785](https://github.com/ClickHouse/ClickHouse/pull/74785) ([Antonio Andelic](https://github.com/antonio2368)).
* SYSTEM REFRESH/START/STOP VIEW に対する権限チェック処理を修正しました。これにより、特定のビューに対するクエリを実行する際に `*.*` への権限を持つ必要がなくなり、そのビューに対する権限だけがあればよくなりました。 [#74789](https://github.com/ClickHouse/ClickHouse/pull/74789) ([Alexander Tokmakov](https://github.com/tavplubix)).
* `hasColumnInTable` 関数はエイリアス列を考慮していません。エイリアス列にも対応するように修正しました。 [#74841](https://github.com/ClickHouse/ClickHouse/pull/74841) ([Bharat Nallan](https://github.com/bharatnc))。
* Azure Blob Storage 上で空のカラムを含むテーブルのデータパーツのマージ中に発生する FILE&#95;DOESNT&#95;EXIST エラーを修正。 [#74892](https://github.com/ClickHouse/ClickHouse/pull/74892) ([Julia Kartseva](https://github.com/jkartseva)).
* 一時テーブル結合時のプロジェクション列名を修正し、[#68872](https://github.com/ClickHouse/ClickHouse/issues/68872) をクローズ。[#74897](https://github.com/ClickHouse/ClickHouse/pull/74897)（[Vladimir Cherkasov](https://github.com/vdimir)）。

#### ビルド／テスト／パッケージングの改善 {#buildtestingpackaging-improvement}

* 汎用インストールスクリプトが、macOS 上でもインストールを案内するようになりました。 [#74339](https://github.com/ClickHouse/ClickHouse/pull/74339) ([Alexey Milovidov](https://github.com/alexey-milovidov)).