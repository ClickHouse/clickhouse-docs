---
'slug': '/use-cases/observability/clickstack/migration/elastic/types'
'title': 'マッピングタイプ'
'pagination_prev': null
'pagination_next': null
'sidebar_label': 'タイプ'
'sidebar_position': 2
'description': 'ClickHouseとElasticsearchにおけるマッピングタイプ'
'show_related_blogs': true
'keywords':
- 'JSON'
- 'Codecs'
'doc_type': 'reference'
---

ElasticsearchとClickHouseはさまざまなデータ型をサポートしていますが、その基盤となるストレージとクエリのモデルは根本的に異なります。このセクションでは、一般的に使用されるElasticsearchのフィールドタイプを、利用可能な場合はそれに対応するClickHouseの型にマッピングし、移行をガイドするためのコンテキストを提供します。対応するものが存在しない場合は、代替手段や注記がコメントに提供されます。

| **Elasticsearch Type**        | **ClickHouse Equivalent**   | **Comments** |
|-------------------------------|------------------------------|--------------|
| `boolean`                     | [`UInt8`](/sql-reference/data-types/int-uint)  または [`Bool`](/sql-reference/data-types/boolean)        | ClickHouseは新しいバージョンで`UInt8`のエイリアスとして`Boolean`をサポートしています。 |
| `keyword`                     | [`String`](/sql-reference/data-types/string)                    | 正確一致のフィルタリング、グルーピング、およびソートに使用されます。 |
| `text`                        | [`String`](/sql-reference/data-types/string)                    | ClickHouseのフルテキスト検索は限られており、トークン化には`tokens`と配列関数を組み合わせたカスタムロジックが必要です。 |
| `long`                        | [`Int64`](/sql-reference/data-types/int-uint)                     | 64ビット符号付き整数。 |
| `integer`                    | [`Int32`](/sql-reference/data-types/int-uint)                      | 32ビット符号付き整数。 |
| `short`                       | [`Int16`](/sql-reference/data-types/int-uint)                      | 16ビット符号付き整数。 |
| `byte`                        | [`Int8`](/sql-reference/data-types/int-uint)                       | 8ビット符号付き整数。 |
| `unsigned_long`              | [`UInt64`](/sql-reference/data-types/int-uint)                    | 符号なし64ビット整数。 |
| `double`                      | [`Float64`](/sql-reference/data-types/float)                   | 64ビット浮動小数点。 |
| `float`                       | [`Float32`](/sql-reference/data-types/float)                   | 32ビット浮動小数点。 |
| `half_float`                 | [`Float32`](/sql-reference/data-types/float) または [`BFloat16`](/sql-reference/data-types/float)      | 最も近い対応物。ClickHouseには16ビットの浮動小数点はありません。ClickHouseには`BFloat16`があります - これは半浮動小数点IEEE-754とは異なります：半浮動小数点はより小さい範囲でより高い精度を提供しますが、bfloat16は精度を犠牲にして広い範囲を提供し、機械学習のワークロードにより適しています。 |
| `scaled_float`              | [`Decimal(x, y)`](/sql-reference/data-types/decimal)             | 固定小数点数値を保存します。 |
| `date`         | [`DateTime`](/sql-reference/data-types/datetime)    | 秒精度の等価な日付タイプ。 |
| `date_nanos`         | [`DateTime64`](/sql-reference/data-types/datetime64)    | ClickHouseは`DateTime64(9)`でナノ秒精度をサポートしています。 |
| `binary`                      | [`String`](/sql-reference/data-types/string), [`FixedString(N)`](/sql-reference/data-types/fixedstring)  | バイナリフィールドにはbase64デコードが必要です。 |
| `ip`                          | [`IPv4`](/sql-reference/data-types/ipv4), [`IPv6`](/sql-reference/data-types/ipv6)    | ネイティブの`IPv4`および`IPv6`タイプが利用可能です。 |
| `object`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested), [`Map`](/sql-reference/data-types/map), [`Tuple`](/sql-reference/data-types/tuple), [`JSON`](/sql-reference/data-types/newjson) | ClickHouseは[`Nested`](/sql-reference/data-types/nested-data-structures/nested)または[`JSON`](/sql-reference/data-types/newjson)を使用してJSONライクなオブジェクトをモデル化できます。 |
| `flattened`                  | [`String`](/sql-reference/data-types/string)                      | Elasticsearchのフラット化タイプは、単一のフィールドとしてJSONオブジェクト全体を保存し、ネストされたキーへの柔軟でスキーマレスなアクセスを可能にします。ClickHouseでは、String型を使用することで同様の機能が実現されますが、マテリアライズドビューでの処理が必要です。 |
| `nested`                      | [`Nested`](/sql-reference/data-types/nested-data-structures/nested)                    | ClickHouseの`Nested`カラムは、ユーザーが`flatten_nested=0`を使用することを前提にしたグループ化されたサブフィールドに対して類似の意味論を提供します。 |
| `join`                        | NA                           | 親子関係の直接的な概念はありません。ClickHouseではテーブル間の結合がサポートされているので必要ありません。 |
| `alias`                       | [`Alias`](/sql-reference/statements/create/table#alias) カラム修飾子      | エイリアスはフィールド修飾子を通じて[サポートされています](/sql-reference/statements/create/table#alias)。これらのエイリアスに関数を適用することができます。例えば `size String ALIAS formatReadableSize(size_bytes)` |
| `range` types (`*_range`)     | [`Tuple(start, end)`](/sql-reference/data-types/tuple) または [`Array(T)`](/sql-reference/data-types/array) | ClickHouseにはネイティブなレンジタイプがありませんが、数値および日付レンジは[`Tuple(start, end)`](/sql-reference/data-types/tuple)または[`Array`](/sql-reference/data-types/array)構造を使用して表現できます。IPレンジ（`ip_range`）については、CIDR値を`String`として保存し、`isIPAddressInRange()`のような関数で評価してください。あるいは、効率的なフィルタリングのために`ip_trie`ベースのルックアップ辞書を検討してください。 |
| `aggregate_metric_double`     | [`AggregateFunction(...)`](/sql-reference/data-types/aggregatefunction) および [`SimpleAggregateFunction(...)`](/sql-reference/data-types/simpleaggregatefunction)    | 集約関数の状態とマテリアライズドビューを使用して事前集約されたメトリックをモデル化します。すべての集約関数は集約状態をサポートしています。|
| `histogram`                   | [`Tuple(Array(Float64), Array(UInt64))`](/sql-reference/data-types/tuple) | 手動でバケットとカウントを配列またはカスタムスキーマを使用して表現します。 |
| `annotated-text`              | [`String`](/sql-reference/data-types/string)                    | エンティティ認識の検索や注釈のためのビルトインサポートはありません。 |
| `completion`, `search_as_you_type` | NA                    | ネイティブなオートコンプリートまたはサジェストエンジンはありません。`String`および[検索関数](/sql-reference/functions/string-search-functions)で再現可能です。 |
| `semantic_text`               | NA                           | ネイティブなセマンティック検索はありません - 埋め込みを生成してベクトル検索を使用します。 |
| `token_count`                 | [`Int32`](/sql-reference/data-types/int-uint)                    | インジェスト中に手動でトークンカウントを計算するために使用します。例：`length(tokens())`関数をご利用ください。例：マテリアライズドカラムで |
| `dense_vector`                | [`Array(Float32)`](/sql-reference/data-types/array)            | 埋め込みストレージのために配列を使用します。 |
| `sparse_vector`               | [`Map(UInt32, Float32)`](/sql-reference/data-types/map)      | マップを使用してスパースベクトルをシミュレートします。ネイティブなスパースベクトルのサポートはありません。 |
| `rank_feature` / `rank_features` | [`Float32`](/sql-reference/data-types/float), [`Array(Float32)`](/sql-reference/data-types/array) | ネイティブなクエリ時のブースティングはありませんが、スコアリングロジックで手動でモデル化できます。 |
| `geo_point`                   | [`Tuple(Float64, Float64)`](/sql-reference/data-types/tuple) または [`Point`](/sql-reference/data-types/geo#point) | (緯度、経度)のタプルを使用します。[`Point`](/sql-reference/data-types/geo#point)はClickHouseタイプとして利用可能です。 |
| `geo_shape`, `shape`          | [`Ring`](/sql-reference/data-types/geo#ring), [`LineString`](/sql-reference/data-types/geo#linestring), [`MultiLineString`](/sql-reference/data-types/geo#multilinestring), [`Polygon`](/sql-reference/data-types/geo#polygon), [`MultiPolygon`](/sql-reference/data-types/geo#multipolygon)                          | ジオシェイプと空間インデックスのネイティブサポートがあります。 |
| `percolator`                  | NA                           | クエリのインデックス化の概念はありません。代わりに標準SQL + 増分マテリアライズドビューを使用します。 |
| `version`                     | [`String`](/sql-reference/data-types/string)                    | ClickHouseにはネイティブなバージョンタイプはありません。バージョンを文字列として保存し、必要に応じてセマンティック比較を実行するためのカスタムUDF関数を使用します。範囲クエリが必要な場合は、数値フォーマットに正規化することを検討してください。 |

### Notes {#notes}

- **配列**: Elasticsearchでは、すべてのフィールドがネイティブに配列をサポートしています。ClickHouseでは、配列は明示的に定義する必要があります（例：`Array(String)`）、特定の位置にアクセスしクエリすることが可能です。例：`an_array[1]`。
- **マルチフィールド**: Elasticsearchでは、[同じフィールドを複数の方法でインデックス化できます](https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/multi-fields#_multi_fields_with_multiple_analyzers)（例：`text`と`keyword`の両方）。ClickHouseでは、このパターンは別々のカラムまたはビューを使用してモデル化する必要があります。
- **マップとJSONタイプ** - ClickHouseでは、[`Map`](/sql-reference/data-types/map)タイプが`resourceAttributes`や`logAttributes`のような動的キーと値の構造をモデル化するために一般的に使用されます。このタイプにより、実行時に任意のキーが追加可能で、スキーマレスなインジェストが柔軟にでき、多くのエラスティックサーチのJSONオブジェクトと精神的に類似しています。しかし、考慮すべき重要な制限があります：

  - **均一な値の型**: ClickHouseの[`Map`](/sql-reference/data-types/map)カラムは、一貫した値の型を持つ必要があります（例：`Map(String, String)`）。型の混合は強制変換なしではサポートされません。
  - **パフォーマンスコスト**: [`Map`](/sql-reference/data-types/map)内の任意のキーにアクセスするには、マップ全体をメモリにロードする必要があり、パフォーマンスに最適ではありません。
  - **サブカラムなし**: JSONとは異なり、[`Map`](/sql-reference/data-types/map)内のキーは真のサブカラムとして表されず、ClickHouseのインデックス作成、圧縮、および効率的なクエリ能力を制限します。

  これらの制限のために、ClickStackは[`Map`](/sql-reference/data-types/map)からClickHouseの強化された[`JSON`](/sql-reference/data-types/newjson)タイプに移行しています。[`JSON`](/sql-reference/data-types/newjson)タイプは、`Map`の多くの欠点に対処しています：

  - **真の列指向ストレージ**: 各JSONパスはサブカラムとして保存され、効率的な圧縮、フィルタリング、およびベクトル化されたクエリ実行が可能です。
  - **混合型サポート**: 異なるデータ型（例：整数、文字列、配列）が強制変換や型統一なしに同じパスの下で共存できます。
  - **ファイルシステムのスケーラビリティ**: 動的キーに関する内部制限（`max_dynamic_paths`）および型（`max_dynamic_types`）は、高い基数のキーセットを持っていてもディスク上のカラムファイルの爆発を防ぎます。
  - **密なストレージ**: nullや欠落値は不要なオーバーヘッドを避けるためにスパースに保存されます。

    [`JSON`](/sql-reference/data-types/newjson)タイプは、監視ワークロードに特に適しており、スキーマレスなインジェストの柔軟性とネイティブなClickHouseタイプのパフォーマンスとスケーラビリティを兼ね備えており、動的属性フィールドの[`Map`](/sql-reference/data-types/map)の理想的な置き換えとなっています。

    JSONタイプに関する詳細については、[JSONガイド](https://clickhouse.com/docs/integrations/data-formats/json/overview)および["ClickHouseに新しい強力なJSONデータ型を構築した方法"](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)をお勧めします。
