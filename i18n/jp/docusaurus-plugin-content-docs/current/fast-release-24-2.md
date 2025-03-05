
---
slug: /whats-new/changelog/24.2-fast-release
title: v24.2 チェンジログ
description: v24.2 のファストリリースチェンジログ
keywords: [チェンジログ]
---
### ClickHouse リリースタグ: 24.2.2.15987 {#clickhouse-release-tag-242215987}
#### 互換性のない変更 {#backward-incompatible-change}
* ネストされた型における疑わしい/実験的な型を検証します。以前は、Array/Tuple/Mapのようなネストされた型内でそのような型（JSONを除く）を検証していませんでした。[#59385](https://github.com/ClickHouse/ClickHouse/pull/59385) ([Kruglov Pavel](https://github.com/Avogar)).
* ソート句 `ORDER BY ALL` (v23.12で導入)は `ORDER BY *` に置き換えられました。以前の構文は、列 `all` を持つテーブルに対してエラーが発生しやすすぎました。[#59450](https://github.com/ClickHouse/ClickHouse/pull/59450) ([Robert Schulze](https://github.com/rschu1ze)).
* スレッド数とブロックサイズに対する健全性チェックを追加しました。[#60138](https://github.com/ClickHouse/ClickHouse/pull/60138) ([Raúl Marín](https://github.com/Algunenano)).
* クエリレベルの設定 `async_insert` と `deduplicate_blocks_in_dependent_materialized_views` が同時に有効な場合、受信INSERTクエリを拒否します。この動作は設定 `throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert` によって管理され、デフォルトで有効です。これは、https://github.com/ClickHouse/ClickHouse/pull/59699 の継続であり、https://github.com/ClickHouse/ClickHouse/pull/59915 を解除するために必要です。[#60888](https://github.com/ClickHouse/ClickHouse/pull/60888) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* ユーティリティ `clickhouse-copier` がGitHubの別のリポジトリに移動しました: https://github.com/ClickHouse/copier。バンドルにはもはや含まれなくなりましたが、別途ダウンロード可能です。これにより、次の問題が解決されます: [#60734](https://github.com/ClickHouse/ClickHouse/issues/60734) [#60540](https://github.com/ClickHouse/ClickHouse/issues/60540) [#60250](https://github.com/ClickHouse/ClickHouse/issues/60250) [#52917](https://github.com/ClickHouse/ClickHouse/issues/52917) [#51140](https://github.com/ClickHouse/ClickHouse/issues/51140) [#47517](https://github.com/ClickHouse/ClickHouse/issues/47517) [#47189](https://github.com/ClickHouse/ClickHouse/issues/47189) [#46598](https://github.com/ClickHouse/ClickHouse/issues/46598) [#40257](https://github.com/ClickHouse/ClickHouse/issues/40257) [#36504](https://github.com/ClickHouse/ClickHouse/issues/36504) [#35485](https://github.com/ClickHouse/ClickHouse/issues/35485) [#33702](https://github.com/ClickHouse/ClickHouse/issues/33702) [#26702](https://github.com/ClickHouse/ClickHouse/issues/26702) ### ユーザー向け変更のドキュメントエントリ。[#61058](https://github.com/ClickHouse/ClickHouse/pull/61058) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* MySQLとの互換性を高めるために、関数 `locate` はデフォルトで引数 `(needle, haystack[, start_pos])` を受け入れるようになりました。以前の動作 `(haystack, needle, [, start_pos])` は、設定 `function_locate_has_mysql_compatible_argument_order = 0` によって復元可能です。[#61092](https://github.com/ClickHouse/ClickHouse/pull/61092) ([Robert Schulze](https://github.com/rschu1ze)).
* 23.5 バージョン以降、メモリ内データパーツは非推奨となり、23.10 バージョン以降はサポートされなくなりました。現在、残りのコードは削除されました。これは[#55186](https://github.com/ClickHouse/ClickHouse/issues/55186)および[#45409](https://github.com/ClickHouse/ClickHouse/issues/45409)の継続です。メモリ内データパーツを使用している可能性は低いですが、それらは23.5バージョン以前の手動で設定された MergeTree テーブルにのみ存在していました。メモリ内データパーツがあるかどうかを確認するには、次のクエリを実行します: `SELECT part_type, count() FROM system.parts GROUP BY part_type ORDER BY part_type`。メモリ内データパーツの使用を無効にするには、`ALTER TABLE ... MODIFY SETTING min_bytes_for_compact_part = DEFAULT, min_rows_for_compact_part = DEFAULT`を実行します。古いClickHouseリリースからアップグレードする前に、まずメモリ内データパーツがないことを確認してください。もしある場合は、最初にそれらを無効にし、次にそれらが存在しないことを確認してからアップグレードを続行します。[#61127](https://github.com/ClickHouse/ClickHouse/pull/61127) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `MergeTree` テーブルの `ORDER BY` で `SimpleAggregateFunction` を禁止します（`AggregateFunction` が禁止されているのと同様ですが、比較可能でないため禁止されています）。デフォルトで禁止されています（許可するには `allow_suspicious_primary_key` を使用します）。[#61399](https://github.com/ClickHouse/ClickHouse/pull/61399) ([Azat Khuzhin](https://github.com/azat)).
* ClickHouseでは、Stringデータ型に任意のバイナリデータを許可しますが、通常はUTF-8です。Parquet/ORC/ArrowのStringはUTF-8のみをサポートします。このため、ClickHouseのStringデータ型に使用するArrowのデータ型 - StringまたはBinaryを選択できます。これは設定 `output_format_parquet_string_as_string`、`output_format_orc_string_as_string`、`output_format_arrow_string_as_string` によって管理されます。Binaryの方がより正確で互換性が高いですが、デフォルトでStringを使用することは、ほとんどの場合ユーザーの期待に一致します。Parquet/ORC/Arrowは、lz4やzstdなどの多くの圧縮方法をサポートします。ClickHouseはすべての圧縮方法をサポートしています。一部の劣ったツールは、より速い `lz4` 圧縮方法をサポートしていないため、デフォルトで `zstd` を設定しています。これは設定 `output_format_parquet_compression_method`、`output_format_orc_compression_method`、`output_format_arrow_compression_method` によって管理されます。ParquetおよびORCのデフォルトを `zstd` に変更しましたが、Arrowについては変更していません（これは低レベルの使用のために強調されています）。[#61817](https://github.com/ClickHouse/ClickHouse/pull/61817) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* マテリアライズドビューのセキュリティ問題の修正により、ユーザーが必要な権限なしにテーブルに挿入できることを防止しました。修正により、ユーザーがマテリアライズドビューだけでなく、すべての基になるテーブルへの挿入の権限を持っていることが検証されます。これにより、以前は動作していたクエリが、現在は十分な権限がないために失敗することがあります。この問題に対処するために、リリースにおいてSQLビューのセキュリティの新機能が導入されます [https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security](/sql-reference/statements/create/view#sql_security)。[#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit))
#### 新機能 {#new-feature}
* Topk/topkweighed サポートモードが追加され、値のカウントとそのエラーを返します。[#54508](https://github.com/ClickHouse/ClickHouse/pull/54508) ([UnamedRus](https://github.com/UnamedRus)).
* View/Materialized View内で定義者ユーザーを指定できる新しい構文が追加されました。これにより、基になるテーブルに対する明示的な権限なしでビューからの選択/挿入が実行可能になります。[#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit)).
* 異なる種類のマージツリー テーブルを複製エンジンに自動的に変換する機能を実装しました。テーブルのデータディレクトリに空の `convert_to_replicated` ファイルを作成すると、そのテーブルは次回のサーバー起動時に自動的に変換されます。[#57798](https://github.com/ClickHouse/ClickHouse/pull/57798) ([Kirill](https://github.com/kirillgarbar)).
* `MergeTree` テーブルのインデックスおよびマークファイルの内容を表すテーブル関数 `mergeTreeIndex` が追加されました。これは透視に使用できます。構文: `mergeTreeIndex(database, table, [with_marks = true])` で、`database.table` は `MergeTree` エンジンを持つ既存のテーブルです。[#58140](https://github.com/ClickHouse/ClickHouse/pull/58140) ([Anton Popov](https://github.com/CurtizJ)).
* スキーマ推論中に形式が未知の場合、自動的にファイル形式を検出しようとします。これにより [#50576](https://github.com/ClickHouse/ClickHouse/issues/50576) が解決されます。[#59092](https://github.com/ClickHouse/ClickHouse/pull/59092) ([Kruglov Pavel](https://github.com/Avogar)).
* 自然数の算術数列を生成するテーブル関数として `generate_series` を追加しました。[#59390](https://github.com/ClickHouse/ClickHouse/pull/59390) ([divanik](https://github.com/divanik)).
* 空のパーティションに関連するZooKeeperノードを削除するクエリ `ALTER TABLE table FORGET PARTITION partition` が追加されました。[#59507](https://github.com/ClickHouse/ClickHouse/pull/59507) ([Sergei Trifonov](https://github.com/serxa)).
* tarアーカイブとしてのバックアップの読み書きをサポートします。[#59535](https://github.com/ClickHouse/ClickHouse/pull/59535) ([josh-hildred](https://github.com/josh-hildred)).
* 新しい集約関数「groupArrayIntersect」を提供します。これは[#49862](https://github.com/ClickHouse/ClickHouse/issues/49862)のフォローアップです。[#59598](https://github.com/ClickHouse/ClickHouse/pull/59598) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* DNSの問題をデバッグするために有用な system.dns_cache テーブルを実装しました。[#59856](https://github.com/ClickHouse/ClickHouse/pull/59856) ([Kirill Nikiforov](https://github.com/allmazz)).
* S3Expressバケットのサポートを実装しました。[#59965](https://github.com/ClickHouse/ClickHouse/pull/59965) ([Nikita Taranov](https://github.com/nickitat)).
* コーデック `LZ4HC` は以前の最小レベル3よりも速い新しいレベル2を受け入れますが、圧縮率は低下します。以前のバージョンでは、`LZ4HC(2)` 以下は `LZ4HC(3)` と同じでした。著者: [Cyan4973](https://github.com/Cyan4973)。[#60090](https://github.com/ClickHouse/ClickHouse/pull/60090) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* DNSの問題をデバッグするために有用な system.dns_cache テーブルを実装しました。新しいサーバー設定 dns_cache_max_size.[#60257](https://github.com/ClickHouse/ClickHouse/pull/60257) ([Kirill Nikiforov](https://github.com/allmazz)).
* `toMillisecond` 関数が追加され、`DateTime` または `DateTime64` 型の値に対するミリ秒コンポーネントを返します。[#60281](https://github.com/ClickHouse/ClickHouse/pull/60281) ([Shaun Struwig](https://github.com/Blargian)).
* マージテーブル関数の単一引数バージョンをサポートします。`merge(['db_name', ] 'tables_regexp')` として。[#60372](https://github.com/ClickHouse/ClickHouse/pull/60372) ([豪肥肥](https://github.com/HowePa)).
* すべてのフォーマット名を大文字小文字区別なしにします。Tsv、TSV、tsv、またはrowbinaryのように。[#60420](https://github.com/ClickHouse/ClickHouse/pull/60420) ([豪肥肥](https://github.com/HowePa)).
* View/Materialized View 内で定義者ユーザーを指定できる新しい構文が追加されました。これにより、基になるテーブルに対する明示的な権限なしでビューからの選択/挿入が実行可能になります。[#60439](https://github.com/ClickHouse/ClickHouse/pull/60439) ([pufit](https://github.com/pufit)).
* `StorageMemory` (メモリエンジン) に `min_bytes_to_keep`, `max_bytes_to_keep`, `min_rows_to_keep` および `max_rows_to_keep` の4つのプロパティを追加しました - 新しい変更を反映するためのテストを追加 - `memory.md` ドキュメントを更新 - `MemorySink` にテーブルパラメータ境界にアクセスするためのテーブル `context` プロパティを追加しました。[#60612](https://github.com/ClickHouse/ClickHouse/pull/60612) ([Jake Bamrah](https://github.com/JakeBamrah)).
* `toMillisecond` 関数が追加され、`DateTime` または `DateTime64` 型の値に対するミリ秒コンポーネントを返します。[#60649](https://github.com/ClickHouse/ClickHouse/pull/60649) ([Robert Schulze](https://github.com/rschu1ze)).
* 待機中および実行中のクエリの数に関する制限を分けます。新しいサーバー設定 `max_waiting_queries` が追加され、`async_load_databases` のために待機しているクエリの数を制限します。既存の実行中のクエリに対する制限は、もはや待機中のクエリをカウントしません。[#61053](https://github.com/ClickHouse/ClickHouse/pull/61053) ([Sergei Trifonov](https://github.com/serxa)).
* `ATTACH PARTITION ALL` のサポートを追加します。[#61107](https://github.com/ClickHouse/ClickHouse/pull/61107) ([Kirill Nikiforov](https://github.com/allmazz)).
#### パフォーマンス向上 {#performance-improvement}
* SELECTセクションにおけるGROUP BYキーのmin/max/any/anyLast集約器を排除します。[#52230](https://github.com/ClickHouse/ClickHouse/pull/52230) ([JackyWoo](https://github.com/JackyWoo)).
* nullableカラムを複数含む場合のシリアライズ集約メソッドのパフォーマンスを向上させます。これは、抽象性の整合性を損なうことなく、[#51399](https://github.com/ClickHouse/ClickHouse/issues/51399)の一般型です。[#55809](https://github.com/ClickHouse/ClickHouse/pull/55809) ([Amos Bird](https://github.com/amosbird)).
* ALL結合のパフォーマンスを向上させるために、結合出力を遅延ビルドします。[#58278](https://github.com/ClickHouse/ClickHouse/pull/58278) ([LiuNeng](https://github.com/liuneng1994)).
* ArgMin / ArgMax / any / anyLast / anyHeavy集約関数、および `ORDER BY {u8/u16/u32/u64/i8/i16/u32/i64) LIMIT 1` クエリの改善。[#58640](https://github.com/ClickHouse/ClickHouse/pull/58640) ([Raúl Marín](https://github.com/Algunenano)).
* bigintおよびbig decimal型の条件付きsum/avgのパフォーマンスを最適化し、ブランチミスを減少させます。[#59504](https://github.com/ClickHouse/ClickHouse/pull/59504) ([李扬](https://github.com/taiyang-li)).
* アクティブなミューテーションによるSELECTのパフォーマンスを向上させます。[#59531](https://github.com/ClickHouse/ClickHouse/pull/59531) ([Azat Khuzhin](https://github.com/azat)).
* 列フィルターのトリビアルな最適化。フィルタリングされる数値データ型でないフィルター列を避け、`result_size_hint = -1`を設定します。最大メモリ使用量を元の44%に削減できる場合があります。[#59698](https://github.com/ClickHouse/ClickHouse/pull/59698) ([李扬](https://github.com/taiyang-li)).
* 主キーが使用するメモリ量が減少します。[#60049](https://github.com/ClickHouse/ClickHouse/pull/60049) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 主キーとその他の操作のメモリ使用量を改善します。[#60050](https://github.com/ClickHouse/ClickHouse/pull/60050) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* テーブルの主キーは、最初のアクセス時に遅延してメモリに読み込まれます。これは、デフォルトでオンの新しいMergeTree設定 `primary_key_lazy_load` によって制御されます。これにはいくつかの利点があります: - 使用されていないテーブルにはロードされません; - メモリが不足している場合は、サーバーの起動時ではなく、最初の使用時に例外がスローされます。これにはいくつかの欠点もあります: - 主キーのロードの遅延は最初のクエリで支払われます; - これは理論的にはサンダリングハード問題を引き起こす可能性があります。これにより, [#11188](https://github.com/ClickHouse/ClickHouse/issues/11188) が解決されます。[#60093](https://github.com/ClickHouse/ClickHouse/pull/60093) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ベクター検索に便利なベクトル化された関数 `dotProduct` を実装しました。[#60202](https://github.com/ClickHouse/ClickHouse/pull/60202) ([Robert Schulze](https://github.com/rschu1ze)).
* テーブルの主キーがほとんど役に立たないカラムを含む場合は、それらをメモリに保持しません。これは新しい設定 `primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns` によって制御され、デフォルトで値は `0.9` です。これは、コンポジット主キーの場合、あるカラムが90%以上の割合で値を変更する場合、次のカラムはロードされないことを意味します。[#60255](https://github.com/ClickHouse/ClickHouse/pull/60255) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 結果タイプの基になるタイプが数値の場合、multiIf関数を列指向的に実行します。[#60384](https://github.com/ClickHouse/ClickHouse/pull/60384) ([李扬](https://github.com/taiyang-li)).
* 図1に示されるように、「&&」を「&」に置き換えることでSIMDコードを生成できる可能性があります。 ![image](https://github.com/ClickHouse/ClickHouse/assets/26588299/a5a72ac4-6dc6-4d52-835a-4f512e55f0b9) 図1. '&&'（左）および '&'（右）からコンパイルされたコード。[#60498](https://github.com/ClickHouse/ClickHouse/pull/60498) ([Zhiguo Zhou](https://github.com/ZhiguoZh)).
* mutexの速度がほぼ2倍高速化されました（ThreadFuzzerのために遅くなっていました）。[#60823](https://github.com/ClickHouse/ClickHouse/pull/60823) ([Azat Khuzhin](https://github.com/azat)).
* 接続の排出を準備から作業に移動し、複数の接続を並行して排出します。[#60845](https://github.com/ClickHouse/ClickHouse/pull/60845) ([lizhuoyu5](https://github.com/lzydmxy)).
* nullableな数値またはnullableな文字列のinsertManyFromを最適化しました。[#60846](https://github.com/ClickHouse/ClickHouse/pull/60846) ([李扬](https://github.com/taiyang-li)).
* 不要なメモリコピーを省略するように `dotProduct` 関数を最適化しました。[#60928](https://github.com/ClickHouse/ClickHouse/pull/60928) ([Robert Schulze](https://github.com/rschu1ze)).
* ファイルシステムキャッシュとの操作は、ロック競合の影響を軽減します。[#61066](https://github.com/ClickHouse/ClickHouse/pull/61066) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ColumnString::replicateを最適化し、memcpySmallAllowReadWriteOverflow15Implの最適化を防止します。 [#61074](https://github.com/ClickHouse/ClickHouse/issues/61074) により、ColumnString::replicateはx86-64で2.46倍の速度向上を実現しました。[#61075](https://github.com/ClickHouse/ClickHouse/pull/61075) ([李扬](https://github.com/taiyang-li)).
* 256ビット整数の印刷速度が30倍高速化されました。[#61100](https://github.com/ClickHouse/ClickHouse/pull/61100) ([Raúl Marín](https://github.com/Algunenano)).
* 構文エラーのあるクエリがCOLUMNSマッチャを正規表現を含む場合、パーサのバックトラッキング中に正規表現が毎回コンパイルされ、1回だけコンパイルされるべきではありませんでした。これは根本的なエラーでした。コンパイルされた正規表現はASTに入れられました。ASTの文字Aは「抽象」を意味し、重たいオブジェクトを含むべきではありません。ASTの部品は、パース中に作成され、廃棄される可能性があります。バックトラッキングが多くなる可能性があるため、これはパース側の遅さを引き起こし、結果として読み取り専用ユーザーによるDoSを可能にします。しかし、主な問題は、それがファズテストの進展を妨げることです。[#61543](https://github.com/ClickHouse/ClickHouse/pull/61543) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
```

#### 改善 {#improvement}
* Materialized Viewに対して`MODIFY COLUMN`クエリを実行する際、内部テーブルの構造を確認してすべてのカラムが存在することを確認します。[#47427](https://github.com/ClickHouse/ClickHouse/pull/47427) ([sunny](https://github.com/sunny19930321)).
* パーサーからのすべてのキーワードを含むテーブル`system.keywords`を追加しました。主に必要とされ、より良いファジングや構文の強調表示に使用されます。[#51808](https://github.com/ClickHouse/ClickHouse/pull/51808) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* パラメータ化ビューの作成時に解析を行わないようにアナライザーを持つパラメータ化ビューのサポートを追加しました。既存のパラメータ化ビューのロジックをリファクタリングし、パラメータ化ビューの作成時に解析を行わないようにしました。[#54211](https://github.com/ClickHouse/ClickHouse/pull/54211) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni)).
* 通常のデータベースエンジンは非推奨となります。サーバーがこれを使用している場合、`clickhouse-client`で警告が表示されます。これにより [#52229](https://github.com/ClickHouse/ClickHouse/issues/52229) が終了します。[#56942](https://github.com/ClickHouse/ClickHouse/pull/56942) ([shabroo](https://github.com/shabroo)).
* テーブルに関連するすべてのゼロコピー・ロックは、テーブルが削除されるときに解除する必要があります。これらのロックを含むディレクトリも削除する必要があります。[#57575](https://github.com/ClickHouse/ClickHouse/pull/57575) ([Sema Checherinda](https://github.com/CheSema)).
* `dictGetOrDefault`関数のためのショートサーキット機能を追加しました。これにより [#52098](https://github.com/ClickHouse/ClickHouse/issues/52098) が終了します。[#57767](https://github.com/ClickHouse/ClickHouse/pull/57767) ([jsc0218](https://github.com/jsc0218)).
* 外部テーブル構造で列挙型を定義することを許可します。[#57857](https://github.com/ClickHouse/ClickHouse/pull/57857) ([Duc Canh Le](https://github.com/canhld94)).
* `DEFAULT`または`MATERIALIZED`式を持つカラムに対して`ALTER COLUMN MATERIALIZE`を実行すると、正しい値が書き込まれるようになりました：デフォルト値を持つ既存のパーツの場合、またはデフォルトでない値を持つ既存のパーツの場合の非デフォルト値です。以前は、すべての既存パーツにデフォルト値が書き込まれていました。[#58023](https://github.com/ClickHouse/ClickHouse/pull/58023) ([Duc Canh Le](https://github.com/canhld94)).
* バックオフロジック（例：指数関数）が有効になりました。これによりCPU使用率、メモリ使用率、ログファイルサイズの削減が可能になります。[#58036](https://github.com/ClickHouse/ClickHouse/pull/58036) ([MikhailBurdukov](https://github.com/MikhailBurdukov)).
* 結合時にマージするパーツを選択する際に、軽量削除された行を考慮します。[#58223](https://github.com/ClickHouse/ClickHouse/pull/58223) ([Zhuo Qiu](https://github.com/jewelzqiu)).
* `storage_configuration`に`volume_priority`を定義することを許可します。[#58533](https://github.com/ClickHouse/ClickHouse/pull/58533) ([Andrey Zvonov](https://github.com/zvonand)).
* T64コーデックでDate32型のサポートを追加しました。[#58738](https://github.com/ClickHouse/ClickHouse/pull/58738) ([Hongbin Ma](https://github.com/binmahone)).
* このPRは、すべての使用ケースでhttp/https接続を再利用可能にします。応答が3xxまたは4xxであってもです。[#58845](https://github.com/ClickHouse/ClickHouse/pull/58845) ([Sema Checherinda](https://github.com/CheSema)).
* より多くのシステムテーブルのカラムに対してコメントを追加しました。 https://github.com/ClickHouse/ClickHouse/pull/58356の続きです。[#59016](https://github.com/ClickHouse/ClickHouse/pull/59016) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov)).
* 現在、`PREWHERE`で仮想カラムを使用できるようになりました。非定数の仮想カラム（例：`_part_offset`）には価値があります。[#59033](https://github.com/ClickHouse/ClickHouse/pull/59033) ([Amos Bird](https://github.com/amosbird)).
* 分散テーブルエンジンの設定は、サーバー設定ファイルで指定できるようになりました（例：MergeTree設定と同様に）。``` <distributed> <flush_on_detach>false</flush_on_detach> </distributed> ```。[#59291](https://github.com/ClickHouse/ClickHouse/pull/59291) ([Azat Khuzhin](https://github.com/azat)).
* Keeperの改善：`latest_logs_cache_size_threshold`と`commit_logs_cache_size_threshold`で制御される、メモリ内のログの特定の数のみをキャッシュします。[#59460](https://github.com/ClickHouse/ClickHouse/pull/59460) ([Antonio Andelic](https://github.com/antonio2368)).
* 定数キーの代わりに、オブジェクトストレージはオブジェクトの削除能力を決定するためのキーを生成します。[#59495](https://github.com/ClickHouse/ClickHouse/pull/59495) ([Sema Checherinda](https://github.com/CheSema)).
* デフォルトで指数表記の浮動小数点数を推測しないようにします。以前の動作を復元する設定`input_format_try_infer_exponent_floats`を追加しました（デフォルトでは無効）。これにより [#59476](https://github.com/ClickHouse/ClickHouse/issues/59476) が終了します。[#59500](https://github.com/ClickHouse/ClickHouse/pull/59500) ([Kruglov Pavel](https://github.com/Avogar)).
* アルターペアレンテスで囲む操作を許可します。括弧の出力は、設定`format_alter_operations_with_parentheses`で制御できます。デフォルトでは、フォーマットされたクエリでは、フォーマットされた変更操作がメタデータとして保存されているため、括弧が発生します（例：ミューテーション）。新しい構文は、alter操作がリストの最後で終わるいくつかのクエリを明確にします。例：`ALTER TABLE x MODIFY TTL date GROUP BY a, b, DROP COLUMN c`は古い構文では適切に解析できません。新しい構文では、クエリ`ALTER TABLE x (MODIFY TTL date GROUP BY a, b), (DROP COLUMN c)`が明らかです。古いバージョンは新しい構文を読み取ることができないため、新しい構文を使用すると、最新と古いバージョンのClickHouseが混在している場合に問題が発生する可能性があります。[#59532](https://github.com/ClickHouse/ClickHouse/pull/59532) ([János Benjamin Antal](https://github.com/antaljanosbenjamin)).
* Intel QPL（コーデック`DEFLATE_QPL`によって使用される）のバージョンをv1.3.1からv1.4.0にアップデートしました。ポーリングタイムアウトメカニズムのバグも修正しました。特定のケースでは、タイムアウトが正しく機能しないことが確認されており、タイムアウトが発生した場合、IAAとCPUがバッファを同時に処理する可能性があります。今のところ、IAAコーデックのステータスがQPL_STS_BEING_PROCESSEDでないことを確認するのが最善です。そうでない場合は、SWコーデックにフォールバックします。[#59551](https://github.com/ClickHouse/ClickHouse/pull/59551) ([jasperzhu](https://github.com/jinjunzh)).
* libhdfs3で位置情報読み取りを追加しました。libhdfs3で位置指定読み取りを呼び出したい場合は、次のように`hdfs.h`内の`hdfsPread`関数を使用します。`tSize hdfsPread(hdfsFS fs, hdfsFile file, void * buffer, tSize length, tOffset position);`。[#59624](https://github.com/ClickHouse/ClickHouse/pull/59624) ([M1eyu](https://github.com/M1eyu2018)).
* ユーザーが`max_parser_depth`設定を非常に高い値に誤って設定している場合でも、パーサーでスタックオーバーフローをチェックします。これにより [#59622](https://github.com/ClickHouse/ClickHouse/issues/59622) が終了します。[#59697](https://github.com/ClickHouse/ClickHouse/pull/59697) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Kafkaストレージでのxmlおよびsqlで作成された名前付きコレクションの動作を統一します。[#59710](https://github.com/ClickHouse/ClickHouse/pull/59710) ([Pervakov Grigorii](https://github.com/GrigoryPervakov)).
* CREATE TABLEが明示的に持っている場合、`replica_path`にuuidを許可します。[#59908](https://github.com/ClickHouse/ClickHouse/pull/59908) ([Azat Khuzhin](https://github.com/azat)).
* `system.tables`システムテーブルにReplicatedMergeTreeテーブルの`metadata_version`カラムを追加します。[#59942](https://github.com/ClickHouse/ClickHouse/pull/59942) ([Maksim Kita](https://github.com/kitaisreal)).
* Keeperの改善：ディスク関連操作の失敗時に再試行を追加します。[#59980](https://github.com/ClickHouse/ClickHouse/pull/59980) ([Antonio Andelic](https://github.com/antonio2368)).
* 新しい設定`backups.remove_backup_files_after_failure`を追加しました：``` <clickhouse> <backups> <remove_backup_files_after_failure>true</remove_backup_files_after_failure> </backups> </clickhouse> ```。[#60002](https://github.com/ClickHouse/ClickHouse/pull/60002) ([Vitaly Baranov](https://github.com/vitlibar)).
* RESTOREコマンドを実行中にバックアップからテーブルのメタデータを読み取るときに複数のスレッドを使用します。[#60040](https://github.com/ClickHouse/ClickHouse/pull/60040) ([Vitaly Baranov](https://github.com/vitlibar)).
* `StorageBuffer`に1つ以上のシャード（`num_layers` > 1）がある場合、バックグラウンドフラッシュはすべてのシャードで同時に複数のスレッドで実行されます。[#60111](https://github.com/ClickHouse/ClickHouse/pull/60111) ([alesapin](https://github.com/alesapin)).
* 設定を使用して特定のS3設定に対してユーザーを指定できます。 `[{"user": "ユーザー名"}]`。[#60144](https://github.com/ClickHouse/ClickHouse/pull/60144) ([Antonio Andelic](https://github.com/antonio2368)).
* S3ファイルのGCPフォールバックをバッファーコピーに変更します。GCPが`Internal Error`と`GATEWAY_TIMEOUT`のHTTPエラーコードを返した場合です。[#60164](https://github.com/ClickHouse/ClickHouse/pull/60164) ([Maksim Kita](https://github.com/kitaisreal)).
* オブジェクトストレージタイプとして「local」を許可します。「local_blob_storage」の代わりに。[#60165](https://github.com/ClickHouse/ClickHouse/pull/60165) ([Kseniia Sumarokova](https://github.com/kssenii)).
* Variant値の比較演算子とVariantカラムへの適切なフィールド挿入を実装します。同様のVariant型で`Variant`型をデフォルトでは作成できないようにします。`allow_suspicious_variant_types`の設定を許可します。これにより [#59996](https://github.com/ClickHouse/ClickHouse/issues/59996) および [#59850](https://github.com/ClickHouse/ClickHouse/issues/59850) が終了します。[#60198](https://github.com/ClickHouse/ClickHouse/pull/60198) ([Kruglov Pavel](https://github.com/Avogar)).
* 仮想カラムの全体的な使いやすさを改善しました。これで、`PREWHERE`で仮想カラムを使用できるようになりました（非定数の仮想カラムには価値があります）。今では、仮想カラムの組み込みドキュメントも、設定`describe_include_virtual_columns`が有効な場合に`DESCRIBE`クエリのカラムのコメントとして利用可能です。[#60205](https://github.com/ClickHouse/ClickHouse/pull/60205) ([Anton Popov](https://github.com/CurtizJ)).
* `ULIDStringToDateTime`の短絡評価を追加しました。[#60211](https://github.com/ClickHouse/ClickHouse/pull/60211) ([Juan Madurga](https://github.com/jlmadurga)).
* テーブル`system.backups`および`system.backup_log`に`query_id`カラムを追加しました。`error`カラムにエラースタックトレースを追加しました。[#60220](https://github.com/ClickHouse/ClickHouse/pull/60220) ([Maksim Kita](https://github.com/kitaisreal)).
* `DETACH`/サーバーのシャットダウンおよび`SYSTEM FLUSH DISTRIBUTED`でDistributedエンジンの待機中のINSERTブロックの並列フラッシュを実行します（並列処理は、テーブルに対するマルチディスクポリシーがある場合のみ機能します（現在のDistributedエンジンのすべてのように））。[#60225](https://github.com/ClickHouse/ClickHouse/pull/60225) ([Azat Khuzhin](https://github.com/azat)).
* `joinRightColumnsSwitchNullability`での設定フィルターが不適切であるため、[ #59625](https://github.com/ClickHouse/ClickHouse/issues/59625)を解決します。[#60259](https://github.com/ClickHouse/ClickHouse/pull/60259) ([lgbo](https://github.com/lgbo-ustc)).
* マージ処理に対してキャッシュを強制的に読み取るための設定を追加します。[#60308](https://github.com/ClickHouse/ClickHouse/pull/60308) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 問題 [#57598](https://github.com/ClickHouse/ClickHouse/issues/57598) は、トランザクション処理に関するバリアント動作に言及しています。アクティブなトランザクションがない場合に発行されたCOMMIT/ROLLBACKは、MySQLの動作とは異なりエラーとして報告されます。[#60338](https://github.com/ClickHouse/ClickHouse/pull/60338) ([PapaToemmsn](https://github.com/PapaToemmsn)).
* `distributed_ddl_output_mode`設定に`none_only_active`モードを追加しました。[#60340](https://github.com/ClickHouse/ClickHouse/pull/60340) ([Alexander Tokmakov](https://github.com/tavplubix)).
* MySQLポートを介した接続は、QuickSightをサポートするために自動的に設定`prefer_column_name_to_alias = 1`で実行されるようになりました。また、設定`mysql_map_string_to_text_in_show_columns`と`mysql_map_fixed_string_to_text_in_show_columns`もデフォルトで有効になり、MySQL接続にも影響します。これにより、より多くのBIツールとの互換性が向上します。[#60365](https://github.com/ClickHouse/ClickHouse/pull/60365) ([Robert Schulze](https://github.com/rschu1ze)).
* 出力形式がPretty形式であり、ブロックが100万を超える単一の数値から構成されている場合、読みやすい数値がテーブルの右側に印刷されます。例：``` ┌──────count()─┐ │ 233765663884 │ -- 233.77 billion └──────────────┘ ```。[#60379](https://github.com/ClickHouse/ClickHouse/pull/60379) ([rogeryk](https://github.com/rogeryk)).
* clickhouse-serverのHTTPリダイレクトハンドラーを構成できるようにします。たとえば、`/`をPlay UIにリダイレクトするように設定できます。[#60390](https://github.com/ClickHouse/ClickHouse/pull/60390) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 高度なダッシュボードには、マルチライングラフ用の色がわずかに改善されました。[#60391](https://github.com/ClickHouse/ClickHouse/pull/60391) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 重複したチャートが重なって表示されるJavaScriptコードの競合状態を修正しました。[#60392](https://github.com/ClickHouse/ClickHouse/pull/60392) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが`max_parser_depth`設定を非常に高い値に誤って設定している場合でも、パーサーでスタックオーバーフローをチェックします。これにより [#59622](https://github.com/ClickHouse/ClickHouse/issues/59622) が終了します。[#60434](https://github.com/ClickHouse/ClickHouse/pull/60434) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `substring`関数は、現在新しい別名`byteSlice`を持っています。[#60494](https://github.com/ClickHouse/ClickHouse/pull/60494) ([Robert Schulze](https://github.com/rschu1ze)).
* サーバー設定`dns_cache_max_size`を`dns_cache_max_entries`に名前を変更してあいまいさを減らしました。[#60500](https://github.com/ClickHouse/ClickHouse/pull/60500) ([Kirill Nikiforov](https://github.com/allmazz)).
* `SHOW INDEX | INDEXES | INDICES | KEYS`はもはや主キーのカラムでソートされません（直感的ではありませんでした）。[#60514](https://github.com/ClickHouse/ClickHouse/pull/60514) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeperの改善：無効なスナップショットが検出された場合、データ損失を避けるために起動中に中止します。[#60537](https://github.com/ClickHouse/ClickHouse/pull/60537) ([Antonio Andelic](https://github.com/antonio2368)).
* MergeTree読み取りを分割して、交差および非交差の障害注入に分割する設定`merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_fault_probability`を追加しました。[#60548](https://github.com/ClickHouse/ClickHouse/pull/60548) ([Maksim Kita](https://github.com/kitaisreal)).
* 高度なダッシュボードには、スクロール中に常にコントロールが表示されるようになりました。これにより、スクロールせずに新しいチャートを追加できます。[#60692](https://github.com/ClickHouse/ClickHouse/pull/60692) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 文字列型と列挙型を、配列、UNIONクエリ、条件式などの同じ文脈で使用できます。これにより [#60726](https://github.com/ClickHouse/ClickHouse/issues/60726) が終了します。[#60727](https://github.com/ClickHouse/ClickHouse/pull/60727) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* tzdataを2024aに更新しました。[#60768](https://github.com/ClickHouse/ClickHouse/pull/60768) ([Raúl Marín](https://github.com/Algunenano)).
* ファイルシステムデータベースでフォーマット拡張子のないファイルをサポートします。[#60795](https://github.com/ClickHouse/ClickHouse/pull/60795) ([Kruglov Pavel](https://github.com/Avogar)).
* Keeperの改善：Keeperの設定で`leadership_expiry_ms`をサポートします。[#60806](https://github.com/ClickHouse/ClickHouse/pull/60806) ([Brokenice0415](https://github.com/Brokenice0415)).
* JSON形式では設定`input_format_try_infer_exponent_floats`に関係なく指数数を常に推測します。名前付きタプルの推論のためにJSONオブジェクトからの曖昧なパスに対してString型を使用できる設定`input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects`を追加します。[#60808](https://github.com/ClickHouse/ClickHouse/pull/60808) ([Kruglov Pavel](https://github.com/Avogar)).
* SMJのnullを最大/最小と見なすフラグを追加します。これにより、Apache Sparkなどの他のSQLシステムと互換性のある動作が可能になります。[#60896](https://github.com/ClickHouse/ClickHouse/pull/60896) ([loudongfeng](https://github.com/loudongfeng)).
* ClickHouseのバージョンがDockerラベルに追加されました。これにより [#54224](https://github.com/ClickHouse/ClickHouse/issues/54224) が終了します。[#60949](https://github.com/ClickHouse/ClickHouse/pull/60949) ([Nikolay Monkov](https://github.com/nikmonkov)).
* 設定`parallel_replicas_allow_in_with_subquery = 1`を追加し、INのサブクエリが並行レプリカで機能できるようにします。[#60950](https://github.com/ClickHouse/ClickHouse/pull/60950) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* DNSResolverが解決されたIPのセットをシャッフルします。[#60965](https://github.com/ClickHouse/ClickHouse/pull/60965) ([Sema Checherinda](https://github.com/CheSema)).
* `clickhouse-client`と`clickhouse-local`の出力形式をファイル拡張子で検出するサポートをします。[#61036](https://github.com/ClickHouse/ClickHouse/pull/61036) ([豪肥肥](https://github.com/HowePa)).
* メモリ制限の更新を定期的にチェックします。[#61049](https://github.com/ClickHouse/ClickHouse/pull/61049) ([Han Fei](https://github.com/hanfei1991)).
* プロセッサプロファイリング（ソート、集約のために費やされた時間/バイトの入出力）をデフォルトで有効にします。[#61096](https://github.com/ClickHouse/ClickHouse/pull/61096) ([Azat Khuzhin](https://github.com/azat)).
* `toUInt128OrZero`関数が誤って欠落していました（誤りは https://github.com/ClickHouse/ClickHouse/pull/945 に関連しています）。互換性のあるエイリアス`FROM_UNIXTIME`と`DATE_FORMAT`はSQL互換性エイリアスとして期待通り大文字と小文字を区別しません。[#61114](https://github.com/ClickHouse/ClickHouse/pull/61114) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* アクセスチェックの改善。ユーザーが権利を持たない場合、対象ユーザーが権限を取り消すことを許可します。例：```sql GRANT SELECT ON *.* TO user1; REVOKE SELECT ON system.* FROM user1;. [#61115](https://github.com/ClickHouse/ClickHouse/pull/61115) ([pufit](https://github.com/pufit)).
* 前の最適化のエラーを修正しました： https://github.com/ClickHouse/ClickHouse/pull/59698 ： breakを取り除いて、最初にフィルタリングされたカラムが最小サイズを持つことを確認します cc @jsc0218。[#61145](https://github.com/ClickHouse/ClickHouse/pull/61145) ([李扬](https://github.com/taiyang-li)).
* `has()`関数と`Nullable`カラムの修正（[ #60214](https://github.com/ClickHouse/ClickHouse/issues/60214)を修正）。[#61249](https://github.com/ClickHouse/ClickHouse/pull/61249) ([Mikhail Koviazin](https://github.com/mkmkme)).
* 現在、`merge="true"`属性をサブツリーの構成置換に指定できます`<include from_zk="/path" merge="true">`。この属性が指定されている場合、ClickHouseは既存の構成とサブツリーをマージします。そうでない場合、デフォルトの動作は構成に新しい内容を追加します。[#61299](https://github.com/ClickHouse/ClickHouse/pull/61299) ([alesapin](https://github.com/alesapin)).
* 仮想メモリマッピングの非同期メトリクスを追加します：VMMaxMapCount & VMNumMaps。これにより [#60662](https://github.com/ClickHouse/ClickHouse/issues/60662) が終了します。[#61354](https://github.com/ClickHouse/ClickHouse/pull/61354) ([Tuan Pham Anh](https://github.com/tuanpavn)).
* 一時データを作成するすべての場所で`temporary_files_codec`設定を使用します。たとえば、外部メモリソートや外部メモリGROUP BYなどです。以前は、`partial_merge` JOINアルゴリズムでのみ機能していました。[#61456](https://github.com/ClickHouse/ClickHouse/pull/61456) ([Maksim Kita](https://github.com/kitaisreal)).
* 重複したチェック`containing_part.empty()`を削除します。すでに確認されています： https://github.com/ClickHouse/ClickHouse/blob/1296dac3c7e47670872c15e3f5e58f869e0bd2f2/src/Storages/MergeTree/MergeTreeData.cpp#L6141。[#61467](https://github.com/ClickHouse/ClickHouse/pull/61467) ([William Schoeffel](https://github.com/wiledusc)).
* 新しい設定`max_parser_backtracks`を追加し、クエリ解析の複雑さを制限できるようにしました。[#61502](https://github.com/ClickHouse/ClickHouse/pull/61502) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルシステムキャッシュの動的リサイズ中の競合を減らしました。[#61524](https://github.com/ClickHouse/ClickHouse/pull/61524) ([Kseniia Sumarokova](https://github.com/kssenii)).
* StorageS3キューのシャーディッドモードを禁止します。なぜなら、再記述されるからです。[#61537](https://github.com/ClickHouse/ClickHouse/pull/61537) ([Kseniia Sumarokova](https://github.com/kssenii)).
* タイプミスを修正：`use_leagcy_max_level`から`use_legacy_max_level`へ。[#61545](https://github.com/ClickHouse/ClickHouse/pull/61545) ([William Schoeffel](https://github.com/wiledusc)).
* blob_storage_log内の一部の重複エントリを削除します。[#61622](https://github.com/ClickHouse/ClickHouse/pull/61622) ([YenchangChan](https://github.com/YenchangChan)).
* MySQL互換性のための互換性エイリアスとして`current_user`関数を追加しました。[#61770](https://github.com/ClickHouse/ClickHouse/pull/61770) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Azure Blob Storageを使用する際のバックアップIOに管理されたIDを使用します。ClickHouseが存在しないコンテナーを作成しようとするのを防ぐ設定を追加しました。これにはストレージアカウントレベルでの権限が必要です。[#61785](https://github.com/ClickHouse/ClickHouse/pull/61785) ([Daniel Pozo Escalona](https://github.com/danipozo)).
* 前のバージョンでは、Pretty形式の一部の数字が十分に美しくありませんでした。[#61794](https://github.com/ClickHouse/ClickHouse/pull/61794) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty形式では、結果セット内の単一の値の場合、長い値は切り取られません。たとえば、`SHOW CREATE TABLE`クエリの結果です。[#61795](https://github.com/ClickHouse/ClickHouse/pull/61795) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-local`と同様に、`clickhouse-client`は`--output-format`オプションを`--format`オプションの同義語として受け入れます。これにより [#59848](https://github.com/ClickHouse/ClickHouse/issues/59848) が終了します。[#61797](https://github.com/ClickHouse/ClickHouse/pull/61797) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* stdoutが端末であり、出力形式が指定されていない場合、`clickhouse-client`および類似のツールはデフォルトで`PrettyCompact`を使用します。インタラクティブモードと同様です。`clickhouse-client`および`clickhouse-local`は、入力および出力形式のコマンドライン引数を統一された方法で処理します。これにより [#61272](https://github.com/ClickHouse/ClickHouse/issues/61272) が終了します。[#61800](https://github.com/ClickHouse/ClickHouse/pull/61800) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty形式の数字グループを見やすくするためにアンダースコアを追加しました。これは、新しい設定`output_format_pretty_highlight_digit_groups`で制御されます。[#61802](https://github.com/ClickHouse/ClickHouse/pull/61802) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
```
#### バグ修正 (公式の安定リリースにおけるユーザー可視の誤動作) {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* `intDiv` の小数引数に関するバグを修正 [#59243](https://github.com/ClickHouse/ClickHouse/pull/59243) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* wingfuzz によって見つかった kql の問題を修正 [#59626](https://github.com/ClickHouse/ClickHouse/pull/59626) ([Yong Wang](https://github.com/kashwy)).
* AsynchronousBoundedReadBuffer における "Read beyond last offset" エラーを修正 [#59630](https://github.com/ClickHouse/ClickHouse/pull/59630) ([Vitaly Baranov](https://github.com/vitlibar)).
* rabbitmq: acked でも nacked でもないメッセージを持たない状態を修正 [#59775](https://github.com/ClickHouse/ClickHouse/pull/59775) ([Kseniia Sumarokova](https://github.com/kssenii)).
* const と LOWCARDINALITY に対する関数実行を修正、アナライザーの GROUP BY const [#59986](https://github.com/ClickHouse/ClickHouse/pull/59986) ([Azat Khuzhin](https://github.com/azat)).
* DateTime64 のスケール変換を修正 [#60004](https://github.com/ClickHouse/ClickHouse/pull/60004) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* 単一引用符を使った SQLite への INSERT 修正 (バックスラッシュの代わりに引用符で単一引用符をエスケープする) [#60015](https://github.com/ClickHouse/ClickHouse/pull/60015) ([Azat Khuzhin](https://github.com/azat)).
* optimize_uniq_to_count がカラムエイリアスを削除するバグを修正 [#60026](https://github.com/ClickHouse/ClickHouse/pull/60026) ([Raúl Marín](https://github.com/Algunenano)).
* MergeTree に対する finished_mutations_to_keep=0 を修正 (ドキュメントには0はすべてを保持するためと記載されている) [#60031](https://github.com/ClickHouse/ClickHouse/pull/60031) ([Azat Khuzhin](https://github.com/azat)).
* ドロップ時に s3queue テーブルからの可能な例外を修正 [#60036](https://github.com/ClickHouse/ClickHouse/pull/60036) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 同じパーツの PartsSplitter の無効範囲を修正 [#60041](https://github.com/ClickHouse/ClickHouse/pull/60041) ([Maksim Kita](https://github.com/kitaisreal)).
* DDLLogEntry 内でハードコーディングされている 4096 の代わりにコンテキストから max_query_size を使用 [#60083](https://github.com/ClickHouse/ClickHouse/pull/60083) ([Kruglov Pavel](https://github.com/Avogar)).
* クエリの不整合なフォーマットを修正 [#60095](https://github.com/ClickHouse/ClickHouse/pull/60095) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* サブクエリ内の explain の不整合なフォーマットを修正 [#60102](https://github.com/ClickHouse/ClickHouse/pull/60102) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Nullable との cosinedistance クラッシュを修正 [#60150](https://github.com/ClickHouse/ClickHouse/pull/60150) ([Raúl Marín](https://github.com/Algunenano)).
* bool の文字列表現を真の bool にキャストできるように [#60160](https://github.com/ClickHouse/ClickHouse/pull/60160) ([Robert Schulze](https://github.com/rschu1ze)).
* system.s3queue_log を修正 [#60166](https://github.com/ClickHouse/ClickHouse/pull/60166) ([Kseniia Sumarokova](https://github.com/kssenii)).
* nullable 集約関数名での arrayReduce を修正 [#60188](https://github.com/ClickHouse/ClickHouse/pull/60188) ([Raúl Marín](https://github.com/Algunenano)).
* 事前フィルタリング (PK, パーティション プルーニング) 中のアクション実行を修正 [#60196](https://github.com/ClickHouse/ClickHouse/pull/60196) ([Azat Khuzhin](https://github.com/azat)).
* s3queue の機密情報を非表示に [#60233](https://github.com/ClickHouse/ClickHouse/pull/60233) ([Kseniia Sumarokova](https://github.com/kssenii)).
* "ORDER BY ALL" を "ORDER BY *" に置き換えるのを元に戻す [#60248](https://github.com/ClickHouse/ClickHouse/pull/60248) ([Robert Schulze](https://github.com/rschu1ze)).
* Azure Blob Storage: エンドポイントとプレフィックスの問題を修正 [#60251](https://github.com/ClickHouse/ClickHouse/pull/60251) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni)).
* http例外コードを修正 [#60252](https://github.com/ClickHouse/ClickHouse/pull/60252) ([Austin Kothig](https://github.com/kothiga)).
* LRUResource Cache のバグを修正 (Hive キャッシュ) [#60262](https://github.com/ClickHouse/ClickHouse/pull/60262) ([shanfengp](https://github.com/Aed-p)).
* s3queue: バグを修正 (test_storage_s3_queue/test.py::test_shards_distributed のフレークテストも修正) [#60282](https://github.com/ClickHouse/ClickHouse/pull/60282) ([Kseniia Sumarokova](https://github.com/kssenii)).
* IPv6 でのハッシュ関数での未初期化値の使用と無効な結果を修正 [#60359](https://github.com/ClickHouse/ClickHouse/pull/60359) ([Kruglov Pavel](https://github.com/Avogar)).
* パラレルレプリカが変更された場合、再分析を強制 [#60362](https://github.com/ClickHouse/ClickHouse/pull/60362) ([Raúl Marín](https://github.com/Algunenano)).
* 新しいディスク設定オプションでプレーンメタデータタイプを使用する問題を修正 [#60396](https://github.com/ClickHouse/ClickHouse/pull/60396) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 理由がないため max_parallel_replicas を 0 に設定することを許可しない [#60430](https://github.com/ClickHouse/ClickHouse/pull/60430) ([Kruglov Pavel](https://github.com/Avogar)).
* mapContainsKeyLike で 'Cannot capture column because it has incompatible type' の論理エラーを修正を試みる [#60451](https://github.com/ClickHouse/ClickHouse/pull/60451) ([Kruglov Pavel](https://github.com/Avogar)).
* null 引数で OptimizeDateOrDateTimeConverterWithPreimageVisitor を修正 [#60453](https://github.com/ClickHouse/ClickHouse/pull/60453) ([Raúl Marín](https://github.com/Algunenano)).
* CREATE TABLE のためのスカラサブクエリの計算を回避試み [#60464](https://github.com/ClickHouse/ClickHouse/pull/60464) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* マージ [#59674](https://github.com/ClickHouse/ClickHouse/issues/59674). [#60470](https://github.com/ClickHouse/ClickHouse/pull/60470) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* s3Cluster でのキーを正しく確認 [#60477](https://github.com/ClickHouse/ClickHouse/pull/60477) ([Antonio Andelic](https://github.com/antonio2368)).
* 多くの行がエラーのためスキップされた場合のパラレルパース時のデッドロックを修正 [#60516](https://github.com/ClickHouse/ClickHouse/pull/60516) ([Kruglov Pavel](https://github.com/Avogar)).
* fix_kql_compound_operator に対する max_query_size 修正: [#60534](https://github.com/ClickHouse/ClickHouse/pull/60534) ([Yong Wang](https://github.com/kashwy)).
* Keeper 修正: コミットログを待っている間のタイムアウトを追加 [#60544](https://github.com/ClickHouse/ClickHouse/pull/60544) ([Antonio Andelic](https://github.com/antonio2368)).
* `system.numbers` からの行読み取り数を減らす [#60546](https://github.com/ClickHouse/ClickHouse/pull/60546) ([JackyWoo](https://github.com/JackyWoo)).
* 日付型に対して数値ヒントを出力しない [#60577](https://github.com/ClickHouse/ClickHouse/pull/60577) ([Raúl Marín](https://github.com/Algunenano)).
* フィルター内の非決定論的関数を持つ MergeTree からの読み取りを修正 [#60586](https://github.com/ClickHouse/ClickHouse/pull/60586) ([Kruglov Pavel](https://github.com/Avogar)).
* 不適切な互換設定値タイプの論理エラーを修正 [#60596](https://github.com/ClickHouse/ClickHouse/pull/60596) ([Kruglov Pavel](https://github.com/Avogar)).
* 混合 x86-64 / ARM クラスタにおける集約関数の状態の不整合を修正 [#60610](https://github.com/ClickHouse/ClickHouse/pull/60610) ([Harry Lee](https://github.com/HarryLeeIBM)).
* fix(prql): 安定したパニックハンドラー [#60615](https://github.com/ClickHouse/ClickHouse/pull/60615) ([Maximilian Roos](https://github.com/max-sixty)).
* decimal と date 引数の `intDiv` を修正 [#60672](https://github.com/ClickHouse/ClickHouse/pull/60672) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* alter modify クエリでの CTE を展開する修正 [#60682](https://github.com/ClickHouse/ClickHouse/pull/60682) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 非 Atomic/Ordinary データベースエンジン (i.e. Memory) に対する system.parts を修正 [#60689](https://github.com/ClickHouse/ClickHouse/pull/60689) ([Azat Khuzhin](https://github.com/azat)).
* パラメータ化されたビューに対する "Invalid storage definition in metadata file" を修正 [#60708](https://github.com/ClickHouse/ClickHouse/pull/60708) ([Azat Khuzhin](https://github.com/azat)).
* CompressionCodecMultiple におけるバッファオーバーフローを修正 [#60731](https://github.com/ClickHouse/ClickHouse/pull/60731) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* SQL/JSON からナンセンスを削除 [#60738](https://github.com/ClickHouse/ClickHouse/pull/60738) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 集約関数 quantileGK での不正なサニタイズチェックを削除 [#60740](https://github.com/ClickHouse/ClickHouse/pull/60740) ([李扬](https://github.com/taiyang-li)).
* insert-select + insert_deduplication_token バグを修正、ストリームを 1 に設定 [#60745](https://github.com/ClickHouse/ClickHouse/pull/60745) ([Jordi Villar](https://github.com/jrdi)).
* サポートされていないマルチパートアップロード操作に対するカスタムメタデータヘッダーの設定を防止 [#60748](https://github.com/ClickHouse/ClickHouse/pull/60748) ([Francisco J. Jurado Moreno](https://github.com/Beetelbrox)).
* toStartOfInterval を修正 [#60763](https://github.com/ClickHouse/ClickHouse/pull/60763) ([Andrey Zvonov](https://github.com/zvonand)).
* arrayEnumerateRanked におけるクラッシュを修正 [#60764](https://github.com/ClickHouse/ClickHouse/pull/60764) ([Raúl Marín](https://github.com/Algunenano)).
* INSERT SELECT JOIN における input() 使用時のクラッシュを修正 [#60765](https://github.com/ClickHouse/ClickHouse/pull/60765) ([Kruglov Pavel](https://github.com/Avogar)).
* サブクエリ内での異なる allow_experimental_analyzer 値によるクラッシュを修正 [#60770](https://github.com/ClickHouse/ClickHouse/pull/60770) ([Dmitry Novik](https://github.com/novikd)).
* S3 からの読み取り時に再帰を削除 [#60849](https://github.com/ClickHouse/ClickHouse/pull/60849) ([Antonio Andelic](https://github.com/antonio2368)).
* HashedDictionaryParallelLoader でのエラー時のスタックを防ぐ可能性を修正 [#60926](https://github.com/ClickHouse/ClickHouse/pull/60926) ([vdimir](https://github.com/vdimir)).
* レプリケートデータベースでの非同期 RESTORE を修正 [#60934](https://github.com/ClickHouse/ClickHouse/pull/60934) ([Antonio Andelic](https://github.com/antonio2368)).
* ネイティブプロトコルを通じた `Log` テーブルへの非同期挿入時のデッドロックを修正 [#61055](https://github.com/ClickHouse/ClickHouse/pull/61055) ([Anton Popov](https://github.com/CurtizJ)).
* RangeHashedDictionary に対する dictGetOrDefault のデフォルト引数の遅延実行を修正 [#61196](https://github.com/ClickHouse/ClickHouse/pull/61196) ([Kruglov Pavel](https://github.com/Avogar)).
* groupArraySorted における複数のバグを修正 [#61203](https://github.com/ClickHouse/ClickHouse/pull/61203) ([Raúl Marín](https://github.com/Algunenano)).
* スタンドアロンバイナリのための Keeper 再構成を修正 [#61233](https://github.com/ClickHouse/ClickHouse/pull/61233) ([Antonio Andelic](https://github.com/antonio2368)).
* S3 エンジンにおける session_token の使用を修正 [#61234](https://github.com/ClickHouse/ClickHouse/pull/61234) ([Kruglov Pavel](https://github.com/Avogar)).
* 集約関数 `uniqExact` の結果が不正である可能性を修正 [#61257](https://github.com/ClickHouse/ClickHouse/pull/61257) ([Anton Popov](https://github.com/CurtizJ)).
* データベース表示に関するバグを修正 [#61269](https://github.com/ClickHouse/ClickHouse/pull/61269) ([Raúl Marín](https://github.com/Algunenano)).
* MATERIALIZED カラムを含む RabbitMQ ストレージにおける論理エラーを修正 [#61320](https://github.com/ClickHouse/ClickHouse/pull/61320) ([vdimir](https://github.com/vdimir)).
* CREATE OR REPLACE DICTIONARY を修正 [#61356](https://github.com/ClickHouse/ClickHouse/pull/61356) ([Vitaly Baranov](https://github.com/vitlibar)).
* 外部 ON CLUSTER を持つ ATTACH クエリを修正 [#61365](https://github.com/ClickHouse/ClickHouse/pull/61365) ([Nikolay Degterinsky](https://github.com/evillique)).
* アクション DAG 分割の問題を修正 [#61458](https://github.com/ClickHouse/ClickHouse/pull/61458) ([Raúl Marín](https://github.com/Algunenano)).
* 失敗した RESTORE を完了するための修正 [#61466](https://github.com/ClickHouse/ClickHouse/pull/61466) ([Vitaly Baranov](https://github.com/vitlibar)).
* 互換設定に正しく依存して async_insert_use_adaptive_busy_timeout を無効化 [#61468](https://github.com/ClickHouse/ClickHouse/pull/61468) ([Raúl Marín](https://github.com/Algunenano)).
* 復元プールでのキューイングを許可 [#61475](https://github.com/ClickHouse/ClickHouse/pull/61475) ([Nikita Taranov](https://github.com/nickitat)).
* UUID を使って system.parts を読み込む際のバグを修正 (問題 61220) [#61479](https://github.com/ClickHouse/ClickHouse/pull/61479) ([Dan Wu](https://github.com/wudanzy)).
* ウィンドウビューにおけるクラッシュを修正 [#61526](https://github.com/ClickHouse/ClickHouse/pull/61526) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 非ネイティブ整数との `repeat` を修正 [#61527](https://github.com/ClickHouse/ClickHouse/pull/61527) ([Antonio Andelic](https://github.com/antonio2368)).
* クライアントの `-s` 引数を修正 [#61530](https://github.com/ClickHouse/ClickHouse/pull/61530) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* arrayPartialReverseSort におけるクラッシュを修正 [#61539](https://github.com/ClickHouse/ClickHouse/pull/61539) ([Raúl Marín](https://github.com/Algunenano)).
* 定数位置での文字列検索を修正 [#61547](https://github.com/ClickHouse/ClickHouse/pull/61547) ([Antonio Andelic](https://github.com/antonio2368)).
* datetime64 使用時に addDays がエラーを引き起こすことを修正 [#61561](https://github.com/ClickHouse/ClickHouse/pull/61561) ([Shuai li](https://github.com/loneylee)).
* 重複排除を持つ非同期挿入用の `system.part_log` を修正 [#61620](https://github.com/ClickHouse/ClickHouse/pull/61620) ([Antonio Andelic](https://github.com/antonio2368)).
* system.parts に対する非準備状態を修正 [#61666](https://github.com/ClickHouse/ClickHouse/pull/61666) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
