```text
┌─count()─┬─dynamic_paths────────┬─shared_data_paths────────┬─_part────┐
│       1 │ ['a']                 │ []                        │ part_0   │
│       1 │ ['b']                 │ []                        │ part_1   │
│       1 │ ['c']                 │ []                        │ part_2   │
│       1 │ ['d']                 │ []                        │ part_3   │
│       1 │ ['e']                 │ []                        │ part_4   │
└─────────┴───────────────────────┴───────────────────────────┴───────────┘
```

次に、これらのデータパーツをマージします。マージ後、JSONカラムの動的パスにどのような変化が出たかを確認しましょう。

```sql title="Query"
SYSTEM START MERGES test;
SELECT JSONDynamicPaths(json), JSONSharedDataPaths(json) FROM test;
```

```text title="Response"
┌─JSONDynamicPaths(json)─┬─JSONSharedDataPaths(json)─────┐
│ ['a','b']               │ ['c','d','e']                  │
└──────────────────────────┴────────────────────────────────┘
```

この例では、JSONカラムの2つのパスが動的パスとして保存され、残りのパスが共有データ構造に格納されました。このように、ClickHouseは、非NULLの値が最も多いパスを選択する傾向があります。

## まとめ {#まとめ}

`JSON` データ型は、非常に柔軟で強力ですが、利用する際にはおそらく動的パスの制限や性能面を考慮する必要があります。ClickHouseでは、JSONオブジェクトの構造を柔軟に理解し、さまざまなデータ形式を効率的に操作することができます。JSONデータを使用する際の最適化方法や概念を理解することで、より効果的なデータ処理と分析を実現できるでしょう。

詳細については、[公式ドキュメント](https://clickhouse.com/docs/ja/)をご覧ください。
```
```text
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│       5 │ ['a']         │ []                │ all_1_1_0 │
│       4 │ ['b']         │ []                │ all_2_2_0 │
│       3 │ ['c']         │ []                │ all_3_3_0 │
│       2 │ ['d']         │ []                │ all_4_4_0 │
│       1 │ ['e']         │ []                │ all_5_5_0 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

次に、すべてのパーツを一つにマージして、何が起こるか見てみましょう:

```sql title="クエリ"
SELECT
    count(),
    groupArrayArrayDistinct(JSONDynamicPaths(json)) AS dynamic_paths,
    groupArrayArrayDistinct(JSONSharedDataPaths(json)) AS shared_data_paths,
    _part
FROM test
GROUP BY _part
ORDER BY _part ASC
```

```text title="レスポンス"
┌─count()─┬─dynamic_paths─┬─shared_data_paths─┬─_part─────┐
│      15 │ ['a','b','c'] │ ['d','e']         │ all_1_5_2 │
└─────────┴───────────────┴───────────────────┴───────────┘
```

ご覧の通り、ClickHouseは最も頻繁に使用されたパス`a`、`b`、`c`を保持し、`d`と`e`のパスを共有データ構造に移動しました。

## インストロスペクション関数 {#introspection-functions}

JSONカラムの内容を検査するためのいくつかの関数があります： 
- [`JSONAllPaths`](../functions/json-functions.md#jsonallpaths)
- [`JSONAllPathsWithTypes`](../functions/json-functions.md#jsonallpathswithtypes)
- [`JSONDynamicPaths`](../functions/json-functions.md#jsondynamicpaths)
- [`JSONDynamicPathsWithTypes`](../functions/json-functions.md#jsondynamicpathswithtypes)
- [`JSONSharedDataPaths`](../functions/json-functions.md#jsonshareddatapaths)
- [`JSONSharedDataPathsWithTypes`](../functions/json-functions.md#jsonshareddatapathswithtypes)
- [`distinctDynamicTypes`](../aggregate-functions/reference/distinctdynamictypes.md)
- [`distinctJSONPaths and distinctJSONPathsAndTypes`](../aggregate-functions/reference/distinctjsonpaths.md)

**例**

`2020-01-01`の日付の[GH Archive](https://www.gharchive.org/)データセットの内容を調査してみましょう:

```sql title="クエリ"
SELECT arrayJoin(distinctJSONPaths(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject) 
```

```text title="レスポンス"
┌─arrayJoin(distinctJSONPaths(json))─────────────────────────┐
│ actor.avatar_url                                           │
│ actor.display_login                                        │
│ actor.gravatar_id                                          │
│ actor.id                                                   │
│ actor.login                                                │
│ actor.url                                                  │
│ created_at                                                 │
│ id                                                         │
│ org.avatar_url                                             │
│ org.gravatar_id                                            │
│ org.id                                                     │
│ org.login                                                  │
│ org.url                                                    │
│ payload.action                                             │
│ payload.before                                             │
│ payload.comment._links.html.href                           │
│ payload.comment._links.pull_request.href                   │
│ payload.comment._links.self.href                           │
│ payload.comment.author_association                         │
│ payload.comment.body                                       │
│ payload.comment.commit_id                                  │
│ payload.comment.created_at                                 │
│ payload.comment.diff_hunk                                  │
│ payload.comment.html_url                                   │
│ payload.comment.id                                         │
│ payload.comment.in_reply_to_id                             │
│ payload.comment.issue_url                                  │
│ payload.comment.line                                       │
│ payload.comment.node_id                                    │
│ payload.comment.original_commit_id                         │
│ payload.comment.original_position                          │
│ payload.comment.path                                       │
│ payload.comment.position                                   │
│ payload.comment.pull_request_review_id                     │
...
│ payload.release.node_id                                    │
│ payload.release.prerelease                                 │
│ payload.release.published_at                               │
│ payload.release.tag_name                                   │
│ payload.release.tarball_url                                │
│ payload.release.target_commitish                           │
│ payload.release.upload_url                                 │
│ payload.release.url                                        │
│ payload.release.zipball_url                                │
│ payload.size                                               │
│ public                                                     │
│ repo.id                                                    │
│ repo.name                                                  │
│ repo.url                                                   │
│ type                                                       │
└─arrayJoin(distinctJSONPaths(json))─────────────────────────┘
```

```sql
SELECT arrayJoin(distinctJSONPathsAndTypes(json))
FROM s3('s3://clickhouse-public-datasets/gharchive/original/2020-01-01-*.json.gz', JSONAsObject)
SETTINGS date_time_input_format = 'best_effort'
```

```text
┌─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┐
│ ('actor.avatar_url',['String'])                             │
│ ('actor.display_login',['String'])                          │
│ ('actor.gravatar_id',['String'])                            │
│ ('actor.id',['Int64'])                                      │
│ ('actor.login',['String'])                                  │
│ ('actor.url',['String'])                                    │
│ ('created_at',['DateTime'])                                 │
│ ('id',['String'])                                           │
│ ('org.avatar_url',['String'])                               │
│ ('org.gravatar_id',['String'])                              │
│ ('org.id',['Int64'])                                        │
│ ('org.login',['String'])                                    │
│ ('org.url',['String'])                                      │
│ ('payload.action',['String'])                               │
│ ('payload.before',['String'])                               │
│ ('payload.comment._links.html.href',['String'])             │
│ ('payload.comment._links.pull_request.href',['String'])     │
│ ('payload.comment._links.self.href',['String'])             │
│ ('payload.comment.author_association',['String'])           │
│ ('payload.comment.body',['String'])                         │
│ ('payload.comment.commit_id',['String'])                    │
│ ('payload.comment.created_at',['DateTime'])                 │
│ ('payload.comment.diff_hunk',['String'])                    │
│ ('payload.comment.html_url',['String'])                     │
│ ('payload.comment.id',['Int64'])                            │
│ ('payload.comment.in_reply_to_id',['Int64'])                │
│ ('payload.comment.issue_url',['String'])                    │
│ ('payload.comment.line',['Int64'])                          │
│ ('payload.comment.node_id',['String'])                      │
│ ('payload.comment.original_commit_id',['String'])           │
│ ('payload.comment.original_position',['Int64'])             │
│ ('payload.comment.path',['String'])                         │
│ ('payload.comment.position',['Int64'])                      │
│ ('payload.comment.pull_request_review_id',['Int64'])        │
...
│ ('payload.release.node_id',['String'])                      │
│ ('payload.release.prerelease',['Bool'])                     │
│ ('payload.release.published_at',['DateTime'])               │
│ ('payload.release.tag_name',['String'])                     │
│ ('payload.release.tarball_url',['String'])                  │
│ ('payload.release.target_commitish',['String'])             │
│ ('payload.release.upload_url',['String'])                   │
│ ('payload.release.url',['String'])                          │
│ ('payload.release.zipball_url',['String'])                  │
│ ('payload.size',['Int64'])                                  │
│ ('public',['Bool'])                                         │
│ ('repo.id',['Int64'])                                       │
│ ('repo.name',['String'])                                    │
│ ('repo.url',['String'])                                     │
│ ('type',['String'])                                         │
└─arrayJoin(distinctJSONPathsAndTypes(json))──────────────────┘
```

## ALTER MODIFY COLUMNをJSON型に変更 {#alter-modify-column-to-json-type}

既存のテーブルを変更し、カラムの型を新しい`JSON`型に変更することができます。現時点では、`String`型からの`ALTER`のみがサポートされています。

**例**

```sql title="クエリ"
CREATE TABLE test (json String) ENGINE=MergeTree ORDeR BY tuple();
INSERT INTO test VALUES ('{"a" : 42}'), ('{"a" : 43, "b" : "Hello"}'), ('{"a" : 44, "b" : [1, 2, 3]}'), ('{"c" : "2020-01-01"}');
ALTER TABLE test MODIFY COLUMN json JSON;
SELECT json, json.a, json.b, json.c FROM test;
```

```text title="レスポンス"
┌─json─────────────────────────┬─json.a─┬─json.b──┬─json.c─────┐
│ {"a":"42"}                   │ 42     │ ᴺᵁᴸᴸ    │ ᴺᵁᴸᴸ       │
│ {"a":"43","b":"Hello"}       │ 43     │ Hello   │ ᴺᵁᴸᴸ       │
│ {"a":"44","b":["1","2","3"]} │ 44     │ [1,2,3] │ ᴺᵁᴸᴹ       │
│ {"c":"2020-01-01"}           │ ᴺᵁᴸᴸ   │ ᴺᵁᴸᴸ    │ 2020-01-01 │
└──────────────────────────────┴────────┴─────────┴────────────┘
```

## JSON型の値の比較 {#comparison-between-values-of-the-json-type}

`JSON`カラムの値は、`less/greater`関数で比較することはできませんが、`equal`関数を使用して比較することができます。

二つのJSONオブジェクトは、同じパスのセットを持ち、それぞれのパスが同じ型と値を持つ場合に等しいと見なされます。

例えば：

```sql title="クエリ"
CREATE TABLE test (json1 JSON(a UInt32), json2 JSON(a UInt32)) ENGINE=Memory;
INSERT INTO test FORMAT JSONEachRow
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 43, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "World"}}
{"json1" : {"a" : 42, "b" : [1, 2, 3], "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : 42.0, "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}}
{"json1" : {"a" : 42, "b" : "42", "c" : "Hello"}, "json2" : {"a" : 42, "b" : 42, "c" : "Hello"}};

SELECT json1, json2, json1 == json2 FROM test;
```

```text title="レスポンス"
┌─json1──────────────────────────────────┬─json2─────────────────────────┬─equals(json1, json2)─┐
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    1 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":43,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"World"} │                    0 │
│ {"a":42,"b":["1","2","3"],"c":"Hello"} │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":42,"c":"Hello"}            │ {"a":42,"b":"42","c":"Hello"} │                    0 │
│ {"a":42,"b":"42","c":"Hello"}          │ {"a":42,"b":"42","c":"Hello"} │                    0 │
└────────────────────────────────────────┴───────────────────────────────┴──────────────────────┘
```

## JSON型のより良い使用法のためのヒント {#tips-for-better-usage-of-the-json-type}

`JSON`カラムを作成し、データを読み込む前に、以下のヒントを考慮してください：

- データを調査し、できるだけ多くのパスヒントと型を指定してください。これにより、ストレージと読み取りがより効率的になります。
- どのパスが必要でどのパスが不要になるかを考えてください。使用しないパスは`SKIP`セクション、必要に応じて`SKIP REGEXP`セクションに指定してください。これにより、ストレージが改善されます。
- `max_dynamic_paths`パラメータを非常に高い値に設定しないでください。そうしないと、ストレージと読み取りの効率が低下します。システムのメモリ、CPUなどのパラメータに大きく依存しますが、一般的なガイドラインとして、`max_dynamic_paths`は10,000を超えないようにしてください。

## さらなる情報 {#further-reading}

- [ClickHouseに新しい強力なJSONデータ型を構築した方法](https://clickhouse.com/blog/a-new-powerful-json-data-type-for-clickhouse)
- [10億ドキュメントJSONチャレンジ：ClickHouse対MongoDB、Elasticsearchなど](https://clickhouse.com/blog/json-bench-clickhouse-vs-mongodb-elasticsearch-duckdb-postgresql)
```
