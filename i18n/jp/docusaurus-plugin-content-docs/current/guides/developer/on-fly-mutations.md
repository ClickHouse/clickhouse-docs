---
'slug': '/guides/developer/on-the-fly-mutations'
'sidebar_label': '即時変異'
'title': '即時変異'
'keywords':
- 'On-the-fly mutation'
'description': '即時変異の説明を提供します'
'doc_type': 'guide'
---

## On-the-fly mutations {#on-the-fly-mutations}

オンザフライの変更が有効になっている時、更新された行はすぐに更新済みとしてマークされ、その後の `SELECT` クエリは自動的に変更された値を返します。オンザフライの変更が有効でない場合、変更された値を見るにはバックグラウンドプロセスを通じて変更が適用されるのを待つ必要があるかもしれません。

オンザフライの変更は、クエリレベルの設定 `apply_mutations_on_fly` を有効にすることで `MergeTree` 系のテーブルに対して有効にできます。

```sql
SET apply_mutations_on_fly = 1;
```

## Example {#example}

テーブルを作成し、いくつかの変更を実行してみましょう：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- Disable background materialization of mutations to showcase
-- default behavior when on-the-fly mutations are not enabled
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- Insert some rows in our new table
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- Update the values of the rows
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

更新の結果を `SELECT` クエリで確認してみましょう：

```sql
-- Explicitly disable on-the-fly-mutations
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリする際に行の値がまだ更新されていないことに注意してください：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

オンザフライの変更を有効にすると、何が起こるか見てみましょう：

```sql
-- Enable on-the-fly mutations
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは今すぐ正しい結果を返し、変更が適用されるのを待つ必要がなくなります：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## Performance impact {#performance-impact}

オンザフライの変更が有効になっている場合、変更はすぐには具現化されず、`SELECT` クエリの際にのみ適用されます。ただし、変更はバックグラウンドで非同期に具現化され続けており、これは重いプロセスです。

提出された変更の数が、一定の時間間隔内でバックグラウンドで処理される変更の数を常に超える場合、適用されるのを待つ未具現化の変更のキューが増え続けます。これにより最終的には `SELECT` クエリのパフォーマンスが劣化することになります。

未具現化の変更が無限に増え続けないように、設定 `apply_mutations_on_fly` を `MergeTree` レベルの他の設定（例：`number_of_mutations_to_throw` や `number_of_mutations_to_delay`）と一緒に有効にすることをお勧めします。

## Support for subqueries and non-deterministic functions {#support-for-subqueries-and-non-deterministic-functions}

オンザフライの変更は、サブクエリおよび非決定的関数に対して限られたサポートを提供します。合理的なサイズの結果を持つスカラサブクエリのみがサポートされています（設定 `mutations_max_literal_size_to_replace` によって制御されています）。定数の非決定的関数のみがサポートされています（例：関数 `now()`）。

これらの動作は以下の設定によって制御されています：

- `mutations_execute_nondeterministic_on_initiator` - true の場合、非決定的関数はイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_execute_subqueries_on_initiator` - true の場合、スカラサブクエリはイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリ内で置き換える最大サイズのバイト数のシリアライズされたリテラル。デフォルト値：`16384`（16 KiB）。
