```markdown
---
slug: /whats-new/changelog/24.2-fast-release
title: v24.2の変更ログ
description: v24.2のファストリリース変更ログ
keywords: [変更ログ]
---

### ClickHouseリリースタグ: 24.2.2.15987 {#clickhouse-release-tag-242215987}

#### 非互換性のある変更 {#backward-incompatible-change}
* ネストされたタイプでの疑わしい/実験的なタイプの検証を追加しました。これまでは、Array/Tuple/Mapのようなネストされたタイプでそのようなタイプ（JSONを除く）を検証していませんでした。 [#59385](https://github.com/ClickHouse/ClickHouse/pull/59385) ([Kruglov Pavel](https://github.com/Avogar))
* ソート句 `ORDER BY ALL`（v23.12で導入）は `ORDER BY *` に置き換えられました。以前の構文は、`all`というカラムを持つテーブルにはエラーが発生しやすすぎました。 [#59450](https://github.com/ClickHouse/ClickHouse/pull/59450) ([Robert Schulze](https://github.com/rschu1ze))
* スレッド数とブロックサイズに対する妥当性チェックを追加しました。 [#60138](https://github.com/ClickHouse/ClickHouse/pull/60138) ([Raúl Marín](https://github.com/Algunenano))
* クエリレベル設定 `async_insert` と `deduplicate_blocks_in_dependent_materialized_views` が同時に有効な場合、受信INSERTクエリを拒否します。この動作は設定 `throw_if_deduplication_in_dependent_materialized_views_enabled_with_async_insert` によって制御され、デフォルトで有効です。これは、https://github.com/ClickHouse/ClickHouse/pull/59699 の継続であり、https://github.com/ClickHouse/ClickHouse/pull/59915 をブロック解除するために必要です。 [#60888](https://github.com/ClickHouse/ClickHouse/pull/60888) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))
* ユーティリティ `clickhouse-copier` はGitHubの別のリポジトリに移動しました: https://github.com/ClickHouse/copier。バンドルにはもはや含まれておらず、別のダウンロードとして入手可能です。これで以下が終了します: [#60734](https://github.com/ClickHouse/ClickHouse/issues/60734)、 [#60540](https://github.com/ClickHouse/ClickHouse/issues/60540)、 [#60250](https://github.com/ClickHouse/ClickHouse/issues/60250)、 [#52917](https://github.com/ClickHouse/ClickHouse/issues/52917)、 [#51140](https://github.com/ClickHouse/ClickHouse/issues/51140)、 [#47517](https://github.com/ClickHouse/ClickHouse/issues/47517)、 [#47189](https://github.com/ClickHouse/ClickHouse/issues/47189)、 [#46598](https://github.com/ClickHouse/ClickHouse/issues/46598)、 [#40257](https://github.com/ClickHouse/ClickHouse/issues/40257)、 [#36504](https://github.com/ClickHouse/ClickHouse/issues/36504)、 [#35485](https://github.com/ClickHouse/ClickHouse/issues/35485)、 [#33702](https://github.com/ClickHouse/ClickHouse/issues/33702)、 [#26702](https://github.com/ClickHouse/ClickHouse/issues/26702)。### ユーザー向けの変更に関する文書エントリ。 [#61058](https://github.com/ClickHouse/ClickHouse/pull/61058) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))
* MySQLとの互換性を高めるために、関数 `locate` はデフォルトで引数 `(needle, haystack[, start_pos])` を受け入れるようになりました。以前の動作 `(haystack, needle, [, start_pos])` は、設定 `function_locate_has_mysql_compatible_argument_order = 0` を行うことで復元できます。 [#61092](https://github.com/ClickHouse/ClickHouse/pull/61092) ([Robert Schulze](https://github.com/rschu1ze))
* メモリ内データパーツは、バージョン23.5から非推奨となり、バージョン23.10以降サポートされていませんでした。現在、残りのコードが削除されました。[#55186](https://github.com/ClickHouse/ClickHouse/issues/55186) と [#45409](https://github.com/ClickHouse/ClickHouse/issues/45409) の継続です。メモリ内データパーツは、バージョン23.5以前でのみ利用可能で、MergeTreeテーブルの対応するSETTINGSを手動で指定して有効にした場合のみ利用されていたため、使用している可能性は低いです。メモリ内データパーツがあるかどうかを確認するには、次のクエリを実行します: `SELECT part_type, count() FROM system.parts GROUP BY part_type ORDER BY part_type`。メモリ内データパーツの使用を無効にするには、`ALTER TABLE ... MODIFY SETTING min_bytes_for_compact_part = DEFAULT, min_rows_for_compact_part = DEFAULT` を行います。古いClickHouseリリースからのアップグレード前に、まずメモリ内データパーツが存在しないことを確認してください。もし存在する場合は、最初にそれを無効にし、次にメモリ内データパーツが存在しないことを確認してからアップグレードを続けます。 [#61127](https://github.com/ClickHouse/ClickHouse/pull/61127) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* MergeTreeテーブルの `ORDER BY` で `SimpleAggregateFunction` を禁止します（AggregateFunctionが禁止されているのと同様です。ただし、それらは比較できないため禁止されています）。デフォルトでは禁止されています（使用を許可するには `allow_suspicious_primary_key` を使用します）。 [#61399](https://github.com/ClickHouse/ClickHouse/pull/61399) ([Azat Khuzhin](https://github.com/azat))
* ClickHouseは文字列データ型で任意のバイナリデータを許可しますが、通常はUTF-8です。Parquet/ORC/Arrowの文字列はUTF-8のみをサポートします。したがって、ClickHouseの文字列データ型に対してどのArrowのデータ型を使用するかを選択できます - 文字列またはバイナリ。この設定は、`output_format_parquet_string_as_string`、`output_format_orc_string_as_string`、`output_format_arrow_string_as_string`により制御されます。バイナリの方が正確であり互換性があるかもしれませんが、デフォルトで文字列を使用することは、多くの場合ユーザーの期待に沿うことになります。Parquet/ORC/Arrowは、lz4やzstdなどの多くの圧縮方式をサポートしています。ClickHouseは全ての圧縮方式をサポートします。 一部の劣ったツールは、より高速な `lz4` 圧縮方式をサポートしていないため、デフォルトで `zstd` を設定しています。この設定は `output_format_parquet_compression_method`、`output_format_orc_compression_method`、`output_format_arrow_compression_method` により制御されます。ParquetおよびORCのデフォルトを `zstd` に変更しましたが、Arrowは変更していません（低レベルの使用のために強調されています）。 [#61817](https://github.com/ClickHouse/ClickHouse/pull/61817) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* マテリアライズドビューのセキュリティ問題を修正しました。これにより、ユーザーは必要な権限なしにテーブルに挿入することができました。この修正では、ユーザーがマテリアライズドビューだけでなく、すべての基礎テーブルへの挿入権限を持っていることを検証します。これは、以前に動作していた一部のクエリが、現在では権限が不足しているという理由で失敗する可能性があることを意味します。この問題に対処するために、リリースではビューに対するSQLセキュリティの新機能が導入されました [https://clickhouse.com/docs/sql-reference/statements/create/view#sql_security](/sql-reference/statements/create/view#sql_security)。 [#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit))

#### 新機能 {#new-feature}
* Topk/topkweightedサポートモードが追加され、値のカウントとそのエラーを返します。 [#54508](https://github.com/ClickHouse/ClickHouse/pull/54508) ([UnamedRus](https://github.com/UnamedRus))
* ビュー/マテリアライズドビューに定義者ユーザーを指定する新しい構文が追加されました。これにより、基礎テーブルの明示的な権限なしにビューからの選択/挿入を実行できます。 [#54901](https://github.com/ClickHouse/ClickHouse/pull/54901) ([pufit](https://github.com/pufit))
* 異なる種類のマージツリーテーブルをレプリケートエンジンに自動的に変換する機能が実装されました。テーブルのデータディレクトリ内に空の `convert_to_replicated` ファイルを作成すると、次回のサーバースタート時にそのテーブルが自動的に変換されます。 [#57798](https://github.com/ClickHouse/ClickHouse/pull/57798) ([Kirill](https://github.com/kirillgarbar))
* テーブル関数 `mergeTreeIndex` が追加されました。これは `MergeTree` テーブルのインデックスとマークファイルの内容を表します。イントロスペクションに使用できます。構文: `mergeTreeIndex(database, table, [with_marks = true])`（ここで `database.table` は `MergeTree` エンジンを持つ既存のテーブルです）。 [#58140](https://github.com/ClickHouse/ClickHouse/pull/58140) ([Anton Popov](https://github.com/CurtizJ))
* スキーマ推論中に、ファイル形式が不明な場合に自動的にファイル形式を検出しようとします。対象のエンジンは `file/s3/hdfs/url/azureBlobStorage` です。これで終了します: [#50576](https://github.com/ClickHouse/ClickHouse/issues/50576)。 [#59092](https://github.com/ClickHouse/ClickHouse/pull/59092) ([Kruglov Pavel](https://github.com/Avogar))
* generate_seriesをテーブル関数として追加しました。この関数は、自然数の算術数列を生成します。 [#59390](https://github.com/ClickHouse/ClickHouse/pull/59390) ([divanik](https://github.com/divanik))
* `ALTER TABLE table FORGET PARTITION partition` クエリが追加され、空のパーティションに関連するZooKeeperノードを削除します。 [#59507](https://github.com/ClickHouse/ClickHouse/pull/59507) ([Sergei Trifonov](https://github.com/serxa))
* tarアーカイブとしてのバックアップの読み書きをサポートします。 [#59535](https://github.com/ClickHouse/ClickHouse/pull/59535) ([josh-hildred](https://github.com/josh-hildred))
* 新しい集約関数 ‘groupArrayIntersect’ を提供します。フォローアップ: [#49862](https://github.com/ClickHouse/ClickHouse/issues/49862)。 [#59598](https://github.com/ClickHouse/ClickHouse/pull/59598) ([Yarik Briukhovetskyi](https://github.com/yariks5s))
* DNS問題のデバッグに役立つsystem.dns_cacheテーブルを実装しました。 [#59856](https://github.com/ClickHouse/ClickHouse/pull/59856) ([Kirill Nikiforov](https://github.com/allmazz))
* S3Expressバケットへのサポートが実装されました。 [#59965](https://github.com/ClickHouse/ClickHouse/pull/59965) ([Nikita Taranov](https://github.com/nickitat))
* コーデック `LZ4HC` は新しいレベル2を受け入れます。これは、以前の最小レベル3よりも高速ですが、圧縮率が低下します。以前のバージョンでは、`LZ4HC(2)` およびそれ以下は `LZ4HC(3)` と同じでした。著者: [Cyan4973](https://github.com/Cyan4973)。 [#60090](https://github.com/ClickHouse/ClickHouse/pull/60090) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* system.dns_cacheテーブルを実装しました。これはDNS問題のデバッグに役立ちます。新しいサーバー設定 dns_cache_max_size が追加されました。 [#60257](https://github.com/ClickHouse/ClickHouse/pull/60257) ([Kirill Nikiforov](https://github.com/allmazz))
* `toMillisecond` 関数を追加しました。この関数は、`DateTime` や `DateTime64` 型の値のミリ秒コンポーネントを返します。 [#60281](https://github.com/ClickHouse/ClickHouse/pull/60281) ([Shaun Struwig](https://github.com/Blargian))
* マージテーブル関数の単一引数バージョンを `merge(['db_name', ] 'tables_regexp')` としてサポートします。 [#60372](https://github.com/ClickHouse/ClickHouse/pull/60372) ([豪肥肥](https://github.com/HowePa))
* すべてのフォーマット名を大文字小文字を区別しないようにします。たとえば、Tsv、TSV、tsv、またはrowbinaryのように。 [#60420](https://github.com/ClickHouse/ClickHouse/pull/60420) ([豪肥肥](https://github.com/HowePa))
* ビュー/マテリアライズドビューに定義者ユーザーを指定する新しい構文が追加されました。これにより、基礎テーブルの明示的な権限なしにビューからの選択/挿入を実行できます。 [#60439](https://github.com/ClickHouse/ClickHouse/pull/60439) ([pufit](https://github.com/pufit))
* `StorageMemory`（メモリエンジン）に四つのプロパティ `min_bytes_to_keep, max_bytes_to_keep, min_rows_to_keep` および `max_rows_to_keep` を追加しました - 新しい変更を反映するテストを追加 - `memory.md` ドキュメントを更新 - テーブル `context` プロパティを `MemorySink` に追加して、テーブルのパラメータ境界へのアクセスを可能にします。 [#60612](https://github.com/ClickHouse/ClickHouse/pull/60612) ([Jake Bamrah](https://github.com/JakeBamrah))
* `toMillisecond` 関数を追加しました。この関数は、`DateTime` または `DateTime64` 型の値のミリ秒コンポーネントを返します。 [#60649](https://github.com/ClickHouse/ClickHouse/pull/60649) ([Robert Schulze](https://github.com/rschu1ze))
* 待機中のクエリと実行中のクエリの数に別々の制限を設けました。新しいサーバー設定 `max_waiting_queries` が追加され、`async_load_databases`のために待機しているクエリの数を制限します。実行中のクエリの数に関する既存の制限はもはや待機中のクエリをカウントしません。 [#61053](https://github.com/ClickHouse/ClickHouse/pull/61053) ([Sergei Trifonov](https://github.com/serxa))
* `ATTACH PARTITION ALL` をサポートします。 [#61107](https://github.com/ClickHouse/ClickHouse/pull/61107) ([Kirill Nikiforov](https://github.com/allmazz))

#### パフォーマンス改善 {#performance-improvement}
* SELECTセクションのGROUP BYキーのmin/max/any/anyLast集約器を排除します。 [#52230](https://github.com/ClickHouse/ClickHouse/pull/52230) ([JackyWoo](https://github.com/JackyWoo))
* 複数の[nullable]カラムを含む場合のシリーズ化集約メソッドのパフォーマンスを改善しました。これは抽象性の整合性を損なうことなく、[#51399](https://github.com/ClickHouse/ClickHouse/issues/51399) の一般的なバージョンです。 [#55809](https://github.com/ClickHouse/ClickHouse/pull/55809) ([Amos Bird](https://github.com/amosbird))
* ALL結合のパフォーマンスを改善するために、遅延ビルド結合出力を実施しました。 [#58278](https://github.com/ClickHouse/ClickHouse/pull/58278) ([LiuNeng](https://github.com/liuneng1994))
* ArgMin / ArgMax / any / anyLast / anyHeavy 集約関数と、`ORDER BY {u8/u16/u32/u64/i8/i16/u32/i64) LIMIT 1` クエリのパフォーマンスを改善しました。 [#58640](https://github.com/ClickHouse/ClickHouse/pull/58640) ([Raúl Marín](https://github.com/Algunenano))
* bigintやbig decimal型に対するsum/avgのパフォーマンスを条件付きで最適化し、分岐ミスを減らします。 [#59504](https://github.com/ClickHouse/ClickHouse/pull/59504) ([李扬](https://github.com/taiyang-li))
* アクティブな変異があるSELECTのパフォーマンスを改善しました。 [#59531](https://github.com/ClickHouse/ClickHouse/pull/59531) ([Azat Khuzhin](https://github.com/azat))
* 列フィルターの小さな最適化。フィルタされる数ではない下位データ型を持つこれらのフィルタ列を避け、`result_size_hint = -1` でフィルタします。ピ-クメモリは場合によっては元の44％に削減できます。 [#59698](https://github.com/ClickHouse/ClickHouse/pull/59698) ([李扬](https://github.com/taiyang-li))
* 主キーが使用するメモリ量を減少させます。 [#60049](https://github.com/ClickHouse/ClickHouse/pull/60049) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* 主キーと他のいくつかの操作のメモリ使用を改善します。 [#60050](https://github.com/ClickHouse/ClickHouse/pull/60050) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* テーブルの主キーは、最初のアクセス時に遅延的にメモリに読み込まれます。これは新しいMergeTree設定 `primary_key_lazy_load` によって制御され、デフォルトで有効です。これにより、次の利点があります: - 使用されていないテーブルには読み込まれません; - メモリが不足している場合、サーバー起動時ではなく、最初の使用時に例外がスローされます。これにより、いくつかの欠点があります: - 主キーの読み込みの待機時間が、接続を受け入れる前ではなく、最初のクエリで発生します。理論的には、全体的なハードウェア問題が発生する可能性があります。これを終了します: [#11188](https://github.com/ClickHouse/ClickHouse/issues/11188)。 [#60093](https://github.com/ClickHouse/ClickHouse/pull/60093) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* ベクトル検索に役立つベクトル化関数 `dotProduct` を実装しました。 [#60202](https://github.com/ClickHouse/ClickHouse/pull/60202) ([Robert Schulze](https://github.com/rschu1ze))
* テーブルの主キーがほとんど無用なカラムを含む場合、それらをメモリに保持しません。これは新しい設定 `primary_key_ratio_of_unique_prefix_values_to_skip_suffix_columns` により制御され、デフォルト値は `0.9` です。これは、合成主キーの場合、値が少なくとも0.9回変更される場合、その次のカラムは読み込まれないことを意味します。 [#60255](https://github.com/ClickHouse/ClickHouse/pull/60255) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* 検索結果の型が数値である場合に、multiIf関数を列単位で実行します。 [#60384](https://github.com/ClickHouse/ClickHouse/pull/60384) ([李扬](https://github.com/taiyang-li))
* 図1に示すように、"&&" を "&" に置き換えることでSIMDコードを生成できることを示しています。 ![image](https://github.com/ClickHouse/ClickHouse/assets/26588299/a5a72ac4-6dc6-4d52-835a-4f512e55f0b9) 図1: '&&'（左）と '&'（右）からコンパイルされたコード。 [#60498](https://github.com/ClickHouse/ClickHouse/pull/60498) ([Zhiguo Zhou](https://github.com/ZhiguoZh))
* より高速（ほぼ2倍）なミューテックスを実現しました（ThreadFuzzerの影響で遅くなっていました）。 [#60823](https://github.com/ClickHouse/ClickHouse/pull/60823) ([Azat Khuzhin](https://github.com/azat))
* 接続の排出を準備から作業に移動し、複数の接続を並行して排出します。 [#60845](https://github.com/ClickHouse/ClickHouse/pull/60845) ([lizhuoyu5](https://github.com/lzydmxy))
* nullable数値またはnullable文字列のinsertManyFromを最適化しました。 [#60846](https://github.com/ClickHouse/ClickHouse/pull/60846) ([李扬](https://github.com/taiyang-li))
* 不要でコストのかかるメモリコピーを省略するように `dotProduct` 関数を最適化しました。 [#60928](https://github.com/ClickHouse/ClickHouse/pull/60928) ([Robert Schulze](https://github.com/rschu1ze))
* ファイルシステムキャッシュとの操作は、ロック競合の影響を受けにくくなります。 [#61066](https://github.com/ClickHouse/ClickHouse/pull/61066) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* ColumnString::replicateを最適化し、memcpySmallAllowReadWriteOverflow15Implが内蔵memcpyに最適化されるのを防ぎます。[#61074](https://github.com/ClickHouse/ClickHouse/issues/61074) ColumnString::replicateはx86-64で2.46倍高速化されます。 [#61075](https://github.com/ClickHouse/ClickHouse/pull/61075) ([李扬](https://github.com/taiyang-li))
* 256ビット整数の印刷が30倍速くなります。 [#61100](https://github.com/ClickHouse/ClickHouse/pull/61100) ([Raúl Marín](https://github.com/Algunenano))
* 構文エラーがあるクエリにCOLUMNSマッチャーが正規表現を含む場合、パーサのバックトラッキング中にその正規表現が毎回コンパイルされていました。これは根本的なエラーでした。コンパイルされた正規表現はASTに配置されました。AST内のAは「抽象」を意味し、つまり重いオブジェクトを含むべきではありません。ASTの部分は解析中に作成および破棄される可能性があり、多数のバックトラッキングを含みます。これにより、解析側の遅延が発生し、結果として読み取り専用ユーザーによるDoSを許可します。しかし、主な問題は、ファジングでの進行を妨げることです。 [#61543](https://github.com/ClickHouse/ClickHouse/pull/61543) ([Alexey Milovidov](https://github.com/alexey-milovidov))

#### 改善 {#improvement}
* マテリアライズドビューの修正列クエリを実行する際に、内部テーブルの構造をチェックしてすべてのカラムが存在することを確認します。 [#47427](https://github.com/ClickHouse/ClickHouse/pull/47427) ([sunny](https://github.com/sunny19930321))
* パーサからのすべてのキーワードを含む `system.keywords` テーブルを追加しました。これは主に必要とされ、より良いファジングおよび構文ハイライトのために使用されます。 [#51808](https://github.com/ClickHouse/ClickHouse/pull/51808) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))
* パラメータ化ビューのサポートが追加され、分析者によるパラメータ化ビューの作成を分析しないようにします。既存のパラメータ化ビューのロジックをリファクタリングして、パラメータ化ビューの作成を分析しないようにします。 [#54211](https://github.com/ClickHouse/ClickHouse/pull/54211) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni))
* 通常のデータベースエンジンは非推奨となりました。サーバーがこれを使用している場合、clickhouse-clientで警告が表示されます。これで終了します: [#52229](https://github.com/ClickHouse/ClickHouse/issues/52229)。 [#56942](https://github.com/ClickHouse/ClickHouse/pull/56942) ([shabroo](https://github.com/shabroo))
* テーブルに関連するすべてのゼロコピーのロックは、テーブルが削除されるときにドロップされなければなりません。これらのロックを含むディレクトリも削除される必要があります。 [#57575](https://github.com/ClickHouse/ClickHouse/pull/57575) ([Sema Checherinda](https://github.com/CheSema))
* `dictGetOrDefault` 関数にショートサーキット機能を追加しました。これで終了します: [#52098](https://github.com/ClickHouse/ClickHouse/issues/52098)。 [#57767](https://github.com/ClickHouse/ClickHouse/pull/57767) ([jsc0218](https://github.com/jsc0218))
* 外部テーブル構造に列挙型を宣言できるようにします。 [#57857](https://github.com/ClickHouse/ClickHouse/pull/57857) ([Duc Canh Le](https://github.com/canhld94))
* `DEFAULT` または `MATERIALIZED` 式を持つカラムに対して `ALTER COLUMN MATERIALIZE` を実行すると、正しい値が書き込まれるようになりました: デフォルト値を持つ既存パーツにはデフォルト値を、非デフォルト値を持つ既存パーツには非デフォルト値が書き込まれます。以前は、すべての既存パーツにデフォルト値が書き込まれていました。 [#58023](https://github.com/ClickHouse/ClickHouse/pull/58023) ([Duc Canh Le](https://github.com/canhld94))
* バックオフロジック（例えば、指数的）を有効にしました。これにより、CPU使用率、メモリ使用率、ログファイルサイズを削減する機能が提供されます。 [#58036](https://github.com/ClickHouse/ClickHouse/pull/58036) ([MikhailBurdukov](https://github.com/MikhailBurdukov))
* マージするために選択された部分を考慮する際、軽量削除された行を考慮します。 [#58223](https://github.com/ClickHouse/ClickHouse/pull/58223) ([Zhuo Qiu](https://github.com/jewelzqiu))
* `storage_configuration`で `volume_priority` を定義できるようにします。 [#58533](https://github.com/ClickHouse/ClickHouse/pull/58533) ([Andrey Zvonov](https://github.com/zvonand))
* T64コーデックでDate32型をサポートします。 [#58738](https://github.com/ClickHouse/ClickHouse/pull/58738) ([Hongbin Ma](https://github.com/binmahone))
* このPRはhttp/https接続をすべての使用ケースで再利用可能にします。応答が3xxまたは4xxであっても。 [#58845](https://github.com/ClickHouse/ClickHouse/pull/58845) ([Sema Checherinda](https://github.com/CheSema))
* さらに多くのシステムテーブルのカラムにコメントを追加しました。これはhttps://github.com/ClickHouse/ClickHouse/pull/58356の継続です。 [#59016](https://github.com/ClickHouse/ClickHouse/pull/59016) ([Nikita Mikhaylov](https://github.com/nikitamikhaylov))
* 現在、PREWHEREでバーチャルカラムを使用できます。これは、`_part_offset`のような非定数バーチャルカラムにとって価値があります。 [#59033](https://github.com/ClickHouse/ClickHouse/pull/59033) ([Amos Bird](https://github.com/amosbird))
* 分散テーブルエンジンの設定は、サーバー構成ファイルで指定できるようになりました（MergeTree設定と同様です）、例えば``` <distributed> <flush_on_detach>false</flush_on_detach> </distributed> ```. [#59291](https://github.com/ClickHouse/ClickHouse/pull/59291) ([Azat Khuzhin](https://github.com/azat))
* Keeperの改善: メモリ内に一定量のログをキャッシュするだけで、`latest_logs_cache_size_threshold` と `commit_logs_cache_size_threshold` によって制御されます。 [#59460](https://github.com/ClickHouse/ClickHouse/pull/59460) ([Antonio Andelic](https://github.com/antonio2368))
* 定数キーの代わりに、オブジェクトストレージがオブジェクトを削除する能力を決定するためのキーを生成します。 [#59495](https://github.com/ClickHouse/ClickHouse/pull/59495) ([Sema Checherinda](https://github.com/CheSema))
* デフォルトでは指数表記の浮動小数点数を推測しないでください。以前の動作を復元する設定 `input_format_try_infer_exponent_floats` を追加しました（デフォルトでは無効）。これで終了します: [#59476](https://github.com/ClickHouse/ClickHouse/issues/59476)。 [#59500](https://github.com/ClickHouse/ClickHouse/pull/59500) ([Kruglov Pavel](https://github.com/Avogar))
* ALTER操作をカッコで囲むことを許可します。カッコの発生は `format_alter_operations_with_parentheses` 設定で制御できます。デフォルトでは、整形クエリではカッコが発生します。整形されたALTER操作は、メタデータ（例えば、変異）としていくつかの場所に保存されます。新しい構文は、ALTER操作がリストで終わるいくつかのクエリを明確にします。例えば: `ALTER TABLE x MODIFY TTL date GROUP BY a, b, DROP COLUMN c` は、古い構文では適切に解析できませんでした。新しい構文では、クエリ `ALTER TABLE x (MODIFY TTL date GROUP BY a, b), (DROP COLUMN c)` は明らかです。古いバージョンは新しい構文を読み取ることができないため、クラスター内で新しいバージョンと古いバージョンが混在する場合、新しい構文を使用すると問題が発生する可能性があります。 [#59532](https://github.com/ClickHouse/ClickHouse/pull/59532) ([János Benjamin Antal](https://github.com/antaljanosbenjamin))
* コーデック `DEFLATE_QPL` が使用するIntel QPLをv1.3.1からv1.4.0にバンプしました。また、ポーリングタイムアウトメカニズムのバグを修正しました。特定の場合にタイムアウトが正しく機能しないことが観察され、その場合にはIAAとCPUがバッファを同時に処理することがあります。現時点では、IAAコーデックのステータスがQPL_STS_BEING_PROCESSEDでないことを確認し、その後SWコーデックにフォールバックすることが重要です。 [#59551](https://github.com/ClickHouse/ClickHouse/pull/59551) ([jasperzhu](https://github.com/jinjunzh))
* libhdfs3での位置ベースのプリアドを追加しました。libhdfs3で位置ベースの読み取りを呼び出したい場合は、hdfs.hのhdfsPread関数を次のように使用してください。 `tSize hdfsPread(hdfsFS fs, hdfsFile file, void * buffer, tSize length, tOffset position);` [#59624](https://github.com/ClickHouse/ClickHouse/pull/59624) ([M1eyu](https://github.com/M1eyu2018))
* ユーザーが `max_parser_depth` 設定を非常に高い値に誤って設定した場合でも、パーサにおいてスタックオーバーフローをチェックします。これで終了します: [#59622](https://github.com/ClickHouse/ClickHouse/issues/59622)。 [#59697](https://github.com/ClickHouse/ClickHouse/pull/59697) ([Alexey Milovidov](https://github.com/alexey-milovidov))
* kafkaストレージにおけるxmlおよびsql作成名付きコレクションの動作を統一します。 [#59710](https://github.com/ClickHouse/ClickHouse/pull/59710) ([Pervakov Grigorii](https://github.com/GrigoryPervakov))
* CREATE TABLE が明示的に指定されている場合、replica_pathにuuidを許可します。 [#59908](https://github.com/ClickHouse/ClickHouse/pull/59908) ([Azat Khuzhin](https://github.com/azat))
* `system.tables`システムテーブルにReplicatedMergeTreeテーブルの `metadata_version` カラムを追加しました。 [#59942](https://github.com/ClickHouse/ClickHouse/pull/59942) ([Maksim Kita](https://github.com/kitaisreal))
* Keeperの改善: ディスク関連操作の失敗時に再試行を追加します。 [#59980](https://github.com/ClickHouse/ClickHouse/pull/59980) ([Antonio Andelic](https://github.com/antonio2368))
* 新しい設定項目 `backups.remove_backup_files_after_failure`: ``` <clickhouse> <backups> <remove_backup_files_after_failure>true</remove_backup_files_after_failure> </backups> </clickhouse> ``` を追加しました。 [#60002](https://github.com/ClickHouse/ClickHouse/pull/60002) ([Vitaly Baranov](https://github.com/vitlibar))
* RESTOREコマンドを実行する際に、バックアップからテーブルのメタデータを読み取る際に複数のスレッドを使用します。 [#60040](https://github.com/ClickHouse/ClickHouse/pull/60040) ([Vitaly Baranov](https://github.com/vitlibar))
* 現在、`StorageBuffer` が1つ以上のシャード (`num_layers` > 1) を持つ場合、バックグラウンドフラッシュは、複数のスレッドですべてのシャードに対して同時に行われます。 [#60111](https://github.com/ClickHouse/ClickHouse/pull/60111) ([alesapin](https://github.com/alesapin))
* 設定を使用してconfig内の特定のS3設定のユーザーを指定することをサポートします。 [#60144](https://github.com/ClickHouse/ClickHouse/pull/60144) ([Antonio Andelic](https://github.com/antonio2368))
* GCPが `Internal Error` の `GATEWAY_TIMEOUT` HTTPエラーコードを返した場合に、S3ファイルのコピーをバッファコピーにフォールバックします。 [#60164](https://github.com/ClickHouse/ClickHouse/pull/60164) ([Maksim Kita](https://github.com/kitaisreal))
* オブジェクトストレージタイプとして "local_blob_storage" の代わりに "local" を許可します。 [#60165](https://github.com/ClickHouse/ClickHouse/pull/60165) ([Kseniia Sumarokova](https://github.com/kssenii))
* Variant値の比較演算子と、VariantカラムへのFieldの適切な挿入を実装します。同様のバリアント型で`Variant`型を作成することをデフォルトで防ぎます（設定 `allow_suspicious_variant_types` により許可）。これは以下を終了します: [#59996](https://github.com/ClickHouse/ClickHouse/issues/59996). これは以下を終了します: [#59850](https://github.com/ClickHouse/ClickHouse/issues/59850). [#60198](https://github.com/ClickHouse/ClickHouse/pull/60198) ([Kruglov Pavel](https://github.com/Avogar))
* バーチャルカラムの全体的な使いやすさを改善しました。現在、PREWHEREでバーチャルカラムを使用することが許可されています（これは `_part_offset` のような非定数バーチャルカラムにとって価値があります）。バーチャルカラムのビルトインドキュメントが、`DESCRIBE`クエリでのカラムのコメントとして、設定 `describe_include_virtual_columns` を有効にすると利用可能になります。 [#60205](https://github.com/ClickHouse/ClickHouse/pull/60205) ([Anton Popov](https://github.com/CurtizJ))
* `ULIDStringToDateTime` に対するショートサーキット実行。 [#60211](https://github.com/ClickHouse/ClickHouse/pull/60211) ([Juan Madurga](https://github.com/jlmadurga))
* テーブル `system.backups` および `system.backup_log` のために `query_id` カラムを追加しました。エラーカラムにエラースタックトレースを追加しました。 [#60220](https://github.com/ClickHouse/ClickHouse/pull/60220) ([Maksim Kita](https://github.com/kitaisreal))
* `DETACH`/サーバーシャットダウン及び `SYSTEM FLUSH DISTRIBUTED`に対するDistributedエンジンの未処理INSERTブロックの並列フラッシュ（並列処理はテーブルに対するマルチディスクポリシー（現在、Distributedエンジンのすべての項目）を持っている場合にのみ機能します）。 [#60225](https://github.com/ClickHouse/ClickHouse/pull/60225) ([Azat Khuzhin](https://github.com/azat))
* フィルタ設定は `joinRightColumnsSwitchNullability` で不適切です。 [#59625](https://github.com/ClickHouse/ClickHouse/issues/59625) を解決します。 [#60259](https://github.com/ClickHouse/ClickHouse/pull/60259) ([lgbo](https://github.com/lgbo-ustc))
* マージのために、キャッシュを強制的に読み取る設定を追加します。 [#60308](https://github.com/ClickHouse/ClickHouse/pull/60308) ([Kseniia Sumarokova](https://github.com/kssenii))
* トランザクション処理に関する変異の動作について述べた [#57598](https://github.com/ClickHouse/ClickHouse/issues/57598)。トランザクションがアクティブでない場合に発行されたCOMMIT/ROLLBACKがエラーとして報告され、MySQLの動作とは対照的です。[#60338](https://github.com/ClickHouse/ClickHouse/pull/60338) ([PapaToemmsn](https://github.com/PapaToemmsn))
* `distributed_ddl_output_mode` 設定に `none_only_active` モードを追加しました。 [#60340](https://github.com/ClickHouse/ClickHouse/pull/60340) ([Alexander Tokmakov](https://github.com/tavplubix))
```
* MySQLポート経由の接続は、QuickSightをサポートするために、設定`prefer_column_name_to_alias = 1`を使用して自動的に実行されるようになりました。また、`mysql_map_string_to_text_in_show_columns`および`mysql_map_fixed_string_to_text_in_show_columns`の設定はデフォルトで有効になり、MySQL接続にのみ影響を及ぼします。これにより、より多くのBIツールとの互換性が向上します。 [#60365](https://github.com/ClickHouse/ClickHouse/pull/60365) ([Robert Schulze](https://github.com/rschu1ze)).
* 出力形式がPretty形式であり、ブロックが100万を超える単一の数値で構成されている場合、テーブルの右側に可読な数値が表示されます。例: ``` ┌──────count()─┐ │ 233765663884 │ -- 233.77 billion └──────────────┘ ```. [#60379](https://github.com/ClickHouse/ClickHouse/pull/60379) ([rogeryk](https://github.com/rogeryk)).
* clickhouse-serverのHTTPリダイレクトハンドラの設定を可能にしました。たとえば、`/`をPlay UIにリダイレクトさせることができます。 [#60390](https://github.com/ClickHouse/ClickHouse/pull/60390) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 高度なダッシュボードは、マルチライングラフの色がやや改善されました。 [#60391](https://github.com/ClickHouse/ClickHouse/pull/60391) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 重複チャートが重なって表示されるJavaScriptコードの競合状態を修正しました。 [#60392](https://github.com/ClickHouse/ClickHouse/pull/60392) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ユーザーが`max_parser_depth`の設定を非常に高い値に誤設定した場合でも、パーサーでスタックオーバーフローをチェックします。これにより[#59622](https://github.com/ClickHouse/ClickHouse/issues/59622)が閉じられます。 [#60434](https://github.com/ClickHouse/ClickHouse/pull/60434) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 新しいエイリアス`byteSlice`が、`substring`関数に追加されました。 [#60494](https://github.com/ClickHouse/ClickHouse/pull/60494) ([Robert Schulze](https://github.com/rschu1ze)).
* サーバー設定`dns_cache_max_size`の名称を`dns_cache_max_entries`に変更し、曖昧さを低減しました。 [#60500](https://github.com/ClickHouse/ClickHouse/pull/60500) ([Kirill Nikiforov](https://github.com/allmazz)).
* `SHOW INDEX | INDEXES | INDICES | KEYS`は、これまでのプライマリキーのカラムによるソートを行わないようになりました（これは直感的ではありませんでした）。 [#60514](https://github.com/ClickHouse/ClickHouse/pull/60514) ([Robert Schulze](https://github.com/rschu1ze)).
* Keeperの改善: 無効なスナップショットが検出された場合、データ損失を防ぐために起動中に中止します。 [#60537](https://github.com/ClickHouse/ClickHouse/pull/60537) ([Antonio Andelic](https://github.com/antonio2368)).
* `merge_tree_read_split_ranges_into_intersecting_and_non_intersecting_fault_probability`設定を使用して、MergeTreeの読み取りスプリット範囲を交差と非交差の障害注入に分割しました。 [#60548](https://github.com/ClickHouse/ClickHouse/pull/60548) ([Maksim Kita](https://github.com/kitaisreal)).
* 高度なダッシュボードでは、スクロール時に常にコントロールが表示されるようになりました。これにより、上にスクロールすることなく新しいチャートを追加できます。 [#60692](https://github.com/ClickHouse/ClickHouse/pull/60692) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 文字列型および列挙型は、配列、UNIONクエリ、条件式などの同じコンテキストで使用できます。これにより[#60726](https://github.com/ClickHouse/ClickHouse/issues/60726)が閉じられます。 [#60727](https://github.com/ClickHouse/ClickHouse/pull/60727) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* tzdataを2024aに更新しました。 [#60768](https://github.com/ClickHouse/ClickHouse/pull/60768) ([Raúl Marín](https://github.com/Algunenano)).
* Filesystemデータベースでフォーマット拡張子のないファイルをサポートしました。 [#60795](https://github.com/ClickHouse/ClickHouse/pull/60795) ([Kruglov Pavel](https://github.com/Avogar)).
* Keeperの改善: Keeperの設定で`leadership_expiry_ms`をサポートしました。 [#60806](https://github.com/ClickHouse/ClickHouse/pull/60806) ([Brokenice0415](https://github.com/Brokenice0415)).
* 設定`input_format_try_infer_exponent_floats`に関係なく、JSON形式での指数形式の数値を常に推測します。また、JSONオブジェクトからの名前付きタプルの推論中に曖昧なパスに対して文字列型を使用することができるようにする設定`input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects`を追加しました。 [#60808](https://github.com/ClickHouse/ClickHouse/pull/60808) ([Kruglov Pavel](https://github.com/Avogar)).
* SMJにnullを最大/最小として扱うフラグを追加しました。これにより、Apache Sparkなどの他のSQLシステムと互換性のある動作が可能になります。 [#60896](https://github.com/ClickHouse/ClickHouse/pull/60896) ([loudongfeng](https://github.com/loudongfeng)).
* Clickhouseバージョンがdockerラベルに追加されました。これにより[#54224](https://github.com/ClickHouse/ClickHouse/issues/54224)が閉じられます。 [#60949](https://github.com/ClickHouse/ClickHouse/pull/60949) ([Nikolay Monkov](https://github.com/nikmonkov)).
* `parallel_replicas_allow_in_with_subquery = 1`という設定を追加し、INに対するサブクエリが並列レプリカで動作できるようにしました。 [#60950](https://github.com/ClickHouse/ClickHouse/pull/60950) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* DNSResolverは解決されたIPのセットをシャッフルします。 [#60965](https://github.com/ClickHouse/ClickHouse/pull/60965) ([Sema Checherinda](https://github.com/CheSema)).
* `clickhouse-client`および`clickhouse-local`でファイル拡張子による出力形式の検出をサポートします。 [#61036](https://github.com/ClickHouse/ClickHouse/pull/61036) ([豪肥肥](https://github.com/HowePa)).
* メモリ制限の更新を定期的に確認します。 [#61049](https://github.com/ClickHouse/ClickHouse/pull/61049) ([Han Fei](https://github.com/hanfei1991)).
* ソート、集計などに必要な時間やバイト数のプロファイリングをデフォルトで有効にしました。 [#61096](https://github.com/ClickHouse/ClickHouse/pull/61096) ([Azat Khuzhin](https://github.com/azat)).
* `toUInt128OrZero`という関数が追加されました。これは、誤って見落とされたもので、互換性のエイリアス`FROM_UNIXTIME`および`DATE_FORMAT`（これらはClickHouse固有ではなく、MySQLとの互換性のためだけに存在します）が大文字小文字を区別しないようになりました。期待どおり、SQL互換性のエイリアスです。 [#61114](https://github.com/ClickHouse/ClickHouse/pull/61114) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* アクセスチェックの改善により、ターゲットユーザーが権限の取り消しグラントを持っていない場合に、未所持の権利を取り消すことができるようになりました。例: ```sql GRANT SELECT ON *.* TO user1; REVOKE SELECT ON system.* FROM user1;. [#61115](https://github.com/ClickHouse/ClickHouse/pull/61115) ([pufit](https://github.com/pufit)).
* 以前の最適化でのエラーを修正しました: https://github.com/ClickHouse/ClickHouse/pull/59698: 初めのフィルタされたカラムが最小サイズであることを確認するためにbreakを削除しました。 cc @jsc0218. [#61145](https://github.com/ClickHouse/ClickHouse/pull/61145) ([李扬](https://github.com/taiyang-li)).
* `Nullable`カラムを持つ`has()`関数の修正（[#60214](https://github.com/ClickHouse/ClickHouse/issues/60214)の修正）。 [#61249](https://github.com/ClickHouse/ClickHouse/pull/61249) ([Mikhail Koviazin](https://github.com/mkmkme)).
* サブツリーの構成置換に`merge="true"`属性を指定できるようになりました`<include from_zk="/path" merge="true">`。この属性が指定された場合、ClickHouseは既存の構成とサブツリーをマージし、そうでない場合はデフォルトの動作として新しい内容を構成に追加します。 [#61299](https://github.com/ClickHouse/ClickHouse/pull/61299) ([alesapin](https://github.com/alesapin)).
* 仮想メモリマッピングの非同期メトリクスを追加しました: VMMaxMapCount & VMNumMaps。これにより[#60662](https://github.com/ClickHouse/ClickHouse/issues/60662)が閉じられます。 [#61354](https://github.com/ClickHouse/ClickHouse/pull/61354) ([Tuan Pham Anh](https://github.com/tuanpavn)).
* 一時データを作成するすべての場所で`temporary_files_codec`設定を使用します。たとえば、外部メモリのソートや外部メモリのGROUP BYに使用します。以前は、これは`partial_merge` JOINアルゴリズムでのみ機能していました。 [#61456](https://github.com/ClickHouse/ClickHouse/pull/61456) ([Maksim Kita](https://github.com/kitaisreal)).
* 重複するチェック`containing_part.empty()`を削除しました。これはすでにチェックされています: https://github.com/ClickHouse/ClickHouse/blob/1296dac3c7e47670872c15e3f5e58f869e0bd2f2/src/Storages/MergeTree/MergeTreeData.cpp#L6141. [#61467](https://github.com/ClickHouse/ClickHouse/pull/61467) ([William Schoeffel](https://github.com/wiledusc)).
* クエリ解析の複雑さを制限するための新しい設定`max_parser_backtracks`を追加しました。 [#61502](https://github.com/ClickHouse/ClickHouse/pull/61502) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* ファイルシステムキャッシュの動的リサイズ中の競合を減らしました。 [#61524](https://github.com/ClickHouse/ClickHouse/pull/61524) ([Kseniia Sumarokova](https://github.com/kssenii)).
* StorageS3キューのシャーディングモードを禁止しました。これには再作成される予定です。 [#61537](https://github.com/ClickHouse/ClickHouse/pull/61537) ([Kseniia Sumarokova](https://github.com/kssenii)).
* タイプミスの修正: `use_leagcy_max_level`から`use_legacy_max_level`へ。 [#61545](https://github.com/ClickHouse/ClickHouse/pull/61545) ([William Schoeffel](https://github.com/wiledusc)).
* blob_storage_log内の重複エントリをいくつか削除しました。 [#61622](https://github.com/ClickHouse/ClickHouse/pull/61622) ([YenchangChan](https://github.com/YenchangChan)).
* MySQLとの互換性エイリアスとして`current_user`関数を追加しました。 [#61770](https://github.com/ClickHouse/ClickHouse/pull/61770) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* Azure Blob Storageを使用する際のバックアップIOにマネージドIDを使用します。存在しないコンテナの作成を試みるClickHouseを防ぐ設定を追加しました。これはストレージアカウントレベルでの権限が必要です。 [#61785](https://github.com/ClickHouse/ClickHouse/pull/61785) ([Daniel Pozo Escalona](https://github.com/danipozo)).
* 前のバージョンでは、Pretty形式の一部の数値が十分に見やすくありませんでした。 [#61794](https://github.com/ClickHouse/ClickHouse/pull/61794) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty形式での長い値は、結果セットの単一の値である場合にカットされません。たとえば、`SHOW CREATE TABLE`クエリの結果などです。 [#61795](https://github.com/ClickHouse/ClickHouse/pull/61795) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* `clickhouse-local`と同様に、`clickhouse-client`は`--output-format`オプションを`--format`オプションの同義語として受け入れるようになりました。これにより[#59848](https://github.com/ClickHouse/ClickHouse/issues/59848)が閉じられます。 [#61797](https://github.com/ClickHouse/ClickHouse/pull/61797) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* stdoutがターミナルで出力形式が指定されていない場合、`clickhouse-client`および同様のツールは、対話モードと同様にデフォルトで`PrettyCompact`を使用します。`clickhouse-client`および`clickhouse-local`は、入力および出力形式のコマンドライン引数を統一的に処理します。これにより[#61272](https://github.com/ClickHouse/ClickHouse/issues/61272)が閉じられます。 [#61800](https://github.com/ClickHouse/ClickHouse/pull/61800) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* Pretty形式での可読性向上のために、桁グループにアンダースコアを使用します。これは新しい設定`output_format_pretty_highlight_digit_groups`によって制御されます。 [#61802](https://github.com/ClickHouse/ClickHouse/pull/61802) ([Alexey Milovidov](https://github.com/alexey-milovidov)).

#### バグ修正 (公式安定版におけるユーザーが目にする不具合) {#bug-fix-user-visible-misbehavior-in-an-official-stable-release}

* 小数引数に対する`intDiv`のバグを修正しました [#59243](https://github.com/ClickHouse/ClickHouse/pull/59243) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* fix_kql_issue_found_by_wingfuzz [#59626](https://github.com/ClickHouse/ClickHouse/pull/59626) ([Yong Wang](https://github.com/kashwy)).
* 非同期バウンディッドリードバッファの"Read beyond last offset"エラーを修正しました [#59630](https://github.com/ClickHouse/ClickHouse/pull/59630) ([Vitaly Baranov](https://github.com/vitlibar)).
* rabbitmq: ackedでもnackedでもないメッセージのバグを修正しました [#59775](https://github.com/ClickHouse/ClickHouse/pull/59775) ([Kseniia Sumarokova](https://github.com/kssenii)).
* 定数に対する関数実行とGROUP BY定数の解析器用バグを修正しました [#59986](https://github.com/ClickHouse/ClickHouse/pull/59986) ([Azat Khuzhin](https://github.com/azat)).
* DateTime64のスケール変換のバグを修正しました [#60004](https://github.com/ClickHouse/ClickHouse/pull/60004) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* シングルクォートを含むSQLiteへのINSERTの修正 （\ ではなくクォートでシングルクォートをエスケープすることで） [#60015](https://github.com/ClickHouse/ClickHouse/pull/60015) ([Azat Khuzhin](https://github.com/azat)).
* optimize_uniq_to_countがカラムのエイリアスを削除するバグを修正しました [#60026](https://github.com/ClickHouse/ClickHouse/pull/60026) ([Raúl Marín](https://github.com/Algunenano)).
* MergeTreeのfinished_mutations_to_keep=0の不具合を修正しました（ドキュメントでは0はすべてを保持することになっています） [#60031](https://github.com/ClickHouse/ClickHouse/pull/60031) ([Azat Khuzhin](https://github.com/azat)).
* ドロップ時のs3queueテーブルからの可能性のある例外を修正しました [#60036](https://github.com/ClickHouse/ClickHouse/pull/60036) ([Kseniia Sumarokova](https://github.com/kssenii)).
* PartsSplitterの同一パートの無効な範囲のバグを修正しました [#60041](https://github.com/ClickHouse/ClickHouse/pull/60041) ([Maksim Kita](https://github.com/kitaisreal)).
* DDLLogEntry内でハードコーディングされた4096ではなく、contextからmax_query_sizeを使用するようにしました [#60083](https://github.com/ClickHouse/ClickHouse/pull/60083) ([Kruglov Pavel](https://github.com/Avogar)).
* クエリのフォーマットの不一致のバグを修正しました [#60095](https://github.com/ClickHouse/ClickHouse/pull/60095) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* サブクエリにおける説明のフォーマットの不一致の修正 [#60102](https://github.com/ClickHouse/ClickHouse/pull/60102) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* NullableでのcosineDistanceのクラッシュを修正しました [#60150](https://github.com/ClickHouse/ClickHouse/pull/60150) ([Raúl Marín](https://github.com/Algunenano)).
* boolの文字列表現のキャスティングを許可し、真のboolに変換できるようにしました [#60160](https://github.com/ClickHouse/ClickHouse/pull/60160) ([Robert Schulze](https://github.com/rschu1ze)).
* system.s3queue_logの修正 [#60166](https://github.com/ClickHouse/ClickHouse/pull/60166) ([Kseniia Sumarokova](https://github.com/kssenii)).
* nullable集約関数名とのarrayReduceのバグを修正しました [#60188](https://github.com/ClickHouse/ClickHouse/pull/60188) ([Raúl Marín](https://github.com/Algunenano)).
* 前処理フィルタリング中のアクション実行バグ（PK、パーティションのプルーニング）の修正 [#60196](https://github.com/ClickHouse/ClickHouse/pull/60196) ([Azat Khuzhin](https://github.com/azat)).
* s3queueに対する機密情報を隠しました [#60233](https://github.com/ClickHouse/ClickHouse/pull/60233) ([Kseniia Sumarokova](https://github.com/kssenii)).
* "ORDER BY ALL"を"ORDER BY *"に置き換えるのを元に戻しました [#60248](https://github.com/ClickHouse/ClickHouse/pull/60248) ([Robert Schulze](https://github.com/rschu1ze)).
* Azure Blob Storage: エンドポイントおよびプレフィックスの問題を修正しました [#60251](https://github.com/ClickHouse/ClickHouse/pull/60251) ([SmitaRKulkarni](https://github.com/SmitaRKulkarni)).
* HTTP例外コードを修正しました。 [#60252](https://github.com/ClickHouse/ClickHouse/pull/60252) ([Austin Kothig](https://github.com/kothiga)).
* LRUリソースキャッシュバグ (Hiveキャッシュ)を修正しました [#60262](https://github.com/ClickHouse/ClickHouse/pull/60262) ([shanfengp](https://github.com/Aed-p)).
* s3queue: バグを修正しました (flaky test_storage_s3_queue/test.py::test_shards_distributedも修正します) [#60282](https://github.com/ClickHouse/ClickHouse/pull/60282) ([Kseniia Sumarokova](https://github.com/kssenii)).
* IPv6でのハッシュ関数に関する初期化されていない値の使用や無効な結果を修正しました [#60359](https://github.com/ClickHouse/ClickHouse/pull/60359) ([Kruglov Pavel](https://github.com/Avogar)).
* 並列レプリカが変更された場合は再解析を強制します [#60362](https://github.com/ClickHouse/ClickHouse/pull/60362) ([Raúl Marín](https://github.com/Algunenano)).
* 新しいディスク構成オプションを使用したプレーンメタデータタイプの使用に関するバグを修正しました [#60396](https://github.com/ClickHouse/ClickHouse/pull/60396) ([Kseniia Sumarokova](https://github.com/kssenii)).
* `max_parallel_replicas`を0に設定することを許可しないバグを修正しました。これは意味を成しません [#60430](https://github.com/ClickHouse/ClickHouse/pull/60430) ([Kruglov Pavel](https://github.com/Avogar)).
* mapContainsKeyLikeでの"Cannot capture column because it has incompatible type"という論理エラーを修正しようとしました [#60451](https://github.com/ClickHouse/ClickHouse/pull/60451) ([Kruglov Pavel](https://github.com/Avogar)).
* null引数を持つOptimizeDateOrDateTimeConverterWithPreimageVisitorの修正 [#60453](https://github.com/ClickHouse/ClickHouse/pull/60453) ([Raúl Marín](https://github.com/Algunenano)).
* CREATE TABLEのためのスカラサブクエリの計算を避けるようにしようとしました。 [#60464](https://github.com/ClickHouse/ClickHouse/pull/60464) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
* マージ [#59674](https://github.com/ClickHouse/ClickHouse/issues/59674). [#60470](https://github.com/ClickHouse/ClickHouse/pull/60470) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* s3Cluster内のキーの正確さを確認する [#60477](https://github.com/ClickHouse/ClickHouse/pull/60477) ([Antonio Andelic](https://github.com/antonio2368)).
* エラーによって多くの行がスキップされた際の並列解析におけるデッドロックを修正しました [#60516](https://github.com/ClickHouse/ClickHouse/pull/60516) ([Kruglov Pavel](https://github.com/Avogar)).
* fix_max_query_size_for_kql_compound_operator: [#60534](https://github.com/ClickHouse/ClickHouse/pull/60534) ([Yong Wang](https://github.com/kashwy)).
* Keeperの修正: コミットログを待っているときのタイムアウトを追加しました [#60544](https://github.com/ClickHouse/ClickHouse/pull/60544) ([Antonio Andelic](https://github.com/antonio2368)).
* `system.numbers`からの読み取り行数を減らしました [#60546](https://github.com/ClickHouse/ClickHouse/pull/60546) ([JackyWoo](https://github.com/JackyWoo)).
* 日付型に関する数字のヒントを出力しないようにしました [#60577](https://github.com/ClickHouse/ClickHouse/pull/60577) ([Raúl Marín](https://github.com/Algunenano)).
* フィルタ内での非決定的関数を持つMergeTreeからの読み取りを修正しました [#60586](https://github.com/ClickHouse/ClickHouse/pull/60586) ([Kruglov Pavel](https://github.com/Avogar)).
* 不適切な互換性設定値の型に関する論理エラーを修正しました [#60596](https://github.com/ClickHouse/ClickHouse/pull/60596) ([Kruglov Pavel](https://github.com/Avogar)).
* 混合x86-64 / ARMクラスターでの集約関数の状態の矛盾を修正しました [#60610](https://github.com/ClickHouse/ClickHouse/pull/60610) ([Harry Lee](https://github.com/HarryLeeIBM)).
* fix(prql): Robust panic handler [#60615](https://github.com/ClickHouse/ClickHouse/pull/60615) ([Maximilian Roos](https://github.com/max-sixty)).
* 小数および日付引数に対する`intDiv`を修正しました [#60672](https://github.com/ClickHouse/ClickHouse/pull/60672) ([Yarik Briukhovetskyi](https://github.com/yariks5s)).
* ALTER MODIFYクエリのCTEを展開するのを修正しました [#60682](https://github.com/ClickHouse/ClickHouse/pull/60682) ([Yakov Olkhovskiy](https://github.com/yakov-olkhovskiy)).
* 非Atomic/Ordinaryデータベースエンジン（i.e. Memory）のための`system.parts`を修正しました [#60689](https://github.com/ClickHouse/ClickHouse/pull/60689) ([Azat Khuzhin](https://github.com/azat)).
* パラメータ化ビューに関する"Invalid storage definition in metadata file"の修正 [#60708](https://github.com/ClickHouse/ClickHouse/pull/60708) ([Azat Khuzhin](https://github.com/azat)).
* CompressionCodecMultipleにおけるバッファーオーバーフローの修正 [#60731](https://github.com/ClickHouse/ClickHouse/pull/60731) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* SQL/JSONから無意味な部分を削除しました [#60738](https://github.com/ClickHouse/ClickHouse/pull/60738) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 集約関数quantileGKにおける不正なサニタイズチェックを削除しました [#60740](https://github.com/ClickHouse/ClickHouse/pull/60740) ([李扬](https://github.com/taiyang-li)).
* insert-select + insert_deduplication_tokenのバグを修正するためにストリームを1に設定しました [#60745](https://github.com/ClickHouse/ClickHouse/pull/60745) ([Jordi Villar](https://github.com/jrdi)).
* サポートされていないマルチパートアップロード操作に対してカスタムメタデータヘッダーの設定を防ぎました [#60748](https://github.com/ClickHouse/ClickHouse/pull/60748) ([Francisco J. Jurado Moreno](https://github.com/Beetelbrox)).
* toStartOfIntervalを修正しました [#60763](https://github.com/ClickHouse/ClickHouse/pull/60763) ([Andrey Zvonov](https://github.com/zvonand)).
* arrayEnumerateRankedでのクラッシュを修正しました [#60764](https://github.com/ClickHouse/ClickHouse/pull/60764) ([Raúl Marín](https://github.com/Algunenano)).
* INSERT SELECT JOINでinput()を使用した際のクラッシュを修正しました [#60765](https://github.com/ClickHouse/ClickHouse/pull/60765) ([Kruglov Pavel](https://github.com/Avogar)).
* サブクエリでallow_experimental_analyzerの値が異なる場合のクラッシュを修正しました [#60770](https://github.com/ClickHouse/ClickHouse/pull/60770) ([Dmitry Novik](https://github.com/novikd)).
* S3からの読み取り時の再帰を削除しました [#60849](https://github.com/ClickHouse/ClickHouse/pull/60849) ([Antonio Andelic](https://github.com/antonio2368)).
* HashedDictionaryParallelLoaderでのエラーによるハング状態の可能性を修正しました [#60926](https://github.com/ClickHouse/ClickHouse/pull/60926) ([vdimir](https://github.com/vdimir)).
* レプリケートされたデータベースでの非同期RESTOREの修正 [#60934](https://github.com/ClickHouse/ClickHouse/pull/60934) ([Antonio Andelic](https://github.com/antonio2368)).
* ネイティブプロトコル経由での`Log`テーブルへの非同期挿入中のデッドロックを修正しました [#61055](https://github.com/ClickHouse/ClickHouse/pull/61055) ([Anton Popov](https://github.com/CurtizJ)).
* RangeHashedDictionaryのdictGetOrDefaultにおけるデフォルト引数の遅延実行バグを修正しました [#61196](https://github.com/ClickHouse/ClickHouse/pull/61196) ([Kruglov Pavel](https://github.com/Avogar)).
* groupArraySortedの複数のバグを修正しました [#61203](https://github.com/ClickHouse/ClickHouse/pull/61203) ([Raúl Marín](https://github.com/Algunenano)).
* スタンドアロンバイナリのKeeper再構成の修正 [#61233](https://github.com/ClickHouse/ClickHouse/pull/61233) ([Antonio Andelic](https://github.com/antonio2368)).
* S3エンジンにおけるsession_tokenの使用の修正 [#61234](https://github.com/ClickHouse/ClickHouse/pull/61234) ([Kruglov Pavel](https://github.com/Avogar)).
* 集約関数`uniqExact`の不正な結果の可能性を修正しました [#61257](https://github.com/ClickHouse/ClickHouse/pull/61257) ([Anton Popov](https://github.com/CurtizJ)).
* データベースの表示におけるバグを修正しました [#61269](https://github.com/ClickHouse/ClickHouse/pull/61269) ([Raúl Marín](https://github.com/Algunenano)).
* MATERIALIZED列を持つRabbitMQストレージにおける論理エラーを修正しました [#61320](https://github.com/ClickHouse/ClickHouse/pull/61320) ([vdimir](https://github.com/vdimir)).
* CREATE OR REPLACE DICTIONARYの修正 [#61356](https://github.com/ClickHouse/ClickHouse/pull/61356) ([Vitaly Baranov](https://github.com/vitlibar)).
* ON CLUSTERによる外部ATTACHクエリの修正 [#61365](https://github.com/ClickHouse/ClickHouse/pull/61365) ([Nikolay Degterinsky](https://github.com/evillique)).
* アクションDAG分割の問題を修正しました [#61458](https://github.com/ClickHouse/ClickHouse/pull/61458) ([Raúl Marín](https://github.com/Algunenano)).
* 失敗したRESTOREの完了を修正しました [#61466](https://github.com/ClickHouse/ClickHouse/pull/61466) ([Vitaly Baranov](https://github.com/vitlibar)).
* 互換性設定によりasync_insert_use_adaptive_busy_timeoutを正しく無効化しました [#61468](https://github.com/ClickHouse/ClickHouse/pull/61468) ([Raúl Marín](https://github.com/Algunenano)).
* リストアプールでのキューイングを許可しました [#61475](https://github.com/ClickHouse/ClickHouse/pull/61475) ([Nikita Taranov](https://github.com/nickitat)).
* UUIDを使用したsystem.partsの読み取り時のバグを修正しました (issue 61220). [#61479](https://github.com/ClickHouse/ClickHouse/pull/61479) ([Dan Wu](https://github.com/wudanzy)).
* ウィンドウビューでのクラッシュを修正しました [#61526](https://github.com/ClickHouse/ClickHouse/pull/61526) ([Alexey Milovidov](https://github.com/alexey-milovidov)).
* 非ネイティブ整数との`repeat`の修正 [#61527](https://github.com/ClickHouse/ClickHouse/pull/61527) ([Antonio Andelic](https://github.com/antonio2368)).
* クライアントの`-s`引数の修正 [#61530](https://github.com/ClickHouse/ClickHouse/pull/61530) ([Mikhail f. Shiryaev](https://github.com/Felixoid)).
* arrayPartialReverseSortでのクラッシュを修正しました [#61539](https://github.com/ClickHouse/ClickHouse/pull/61539) ([Raúl Marín](https://github.com/Algunenano)).
* const位置での文字列検索の修正 [#61547](https://github.com/ClickHouse/ClickHouse/pull/61547) ([Antonio Andelic](https://github.com/antonio2368)).
* datetime64を使用した場合にaddDaysがエラーを引き起こすバグを修正しました [#61561](https://github.com/ClickHouse/ClickHouse/pull/61561) ([Shuai li](https://github.com/loneylee)).
* 重複除去を伴う非同期挿入に対する`system.part_log`の修正 [#61620](https://github.com/ClickHouse/ClickHouse/pull/61620) ([Antonio Andelic](https://github.com/antonio2368)).
* system.partsの準備ができていないセットの修正。 [#61666](https://github.com/ClickHouse/ClickHouse/pull/61666) ([Nikolai Kochetov](https://github.com/KochetovNicolai)).
