---
'slug': '/guides/developer/lightweight-update'
'sidebar_label': '軽量更新'
'title': '軽量更新'
'keywords':
- 'lightweight update'
'description': '軽量更新の説明を提供します'
---



## Lightweight Update {#lightweight-update}

軽量更新が有効になると、更新された行はすぐに更新されたとしてマークされ、その後の `SELECT` クエリは自動的に変更された値を返します。軽量更新が無効の場合、変更された値を見るためには、バックグラウンドプロセスを介して変更が適用されるのを待つ必要があります。

軽量更新は、クエリレベルの設定 `apply_mutations_on_fly` を有効にすることで、 `MergeTree` 系のテーブルに対して有効にすることができます。

```sql
SET apply_mutations_on_fly = 1;
```

## Example {#example}

テーブルを作成し、いくつかの変更を実行してみましょう：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- 軽量更新が無効な場合のデフォルトの動作を示すために
-- 変更のバックグラウンドマテリアライズを無効にします
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 新しいテーブルに行をいくつか挿入します
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 行の値を更新します
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

`SELECT` クエリを介して更新の結果を確認してみましょう：
```sql
-- 明示的に軽量更新を無効にします
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリしたときに、行の値はまだ更新されていないことに注意してください：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

次に、軽量更新を有効にしたときに何が起こるか見てみましょう：

```sql
-- 軽量更新を有効にします
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは、変更が適用されるのを待たずに即座に正しい結果を返します：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## Performance Impact {#performance-impact}

軽量更新が有効な場合、変更はすぐにはマテリアライズされず、 `SELECT` クエリの実行中のみ適用されます。ただし、バックグラウンドで非同期的に変更がマテリアライズされることに注意してください。これは重いプロセスです。

提出された変更の数が、一定の時間間隔でバックグラウンドで処理される変更の数を常に超える場合、適用する必要がある未マテリアライズの変更のキューは増大し続けます。これにより、 `SELECT` クエリのパフォーマンスが最終的に低下します。

無限に成長する未マテリアライズの変更を制限するために、 `apply_mutations_on_fly` 設定を `number_of_mutations_to_throw` や `number_of_mutations_to_delay` などの他の `MergeTree` レベルの設定とともに有効にすることをお勧めします。

## Support for subqueries and non-deterministic functions {#support-for-subqueries-and-non-deterministic-functions}

軽量更新は、サブクエリや非決定的関数に対するサポートが限られています。結果が合理的なサイズのスカラサブクエリのみ（設定 `mutations_max_literal_size_to_replace` によって制御される）がサポートされています。定数の非決定的関数のみがサポートされています（例：関数 `now()`）。

これらの動作は次の設定によって制御されます：

- `mutations_execute_nondeterministic_on_initiator` - true の場合、非決定的関数はイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_execute_subqueries_on_initiator` - true の場合、スカラサブクエリはイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値：`false`。
 - `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリで置き換えるシリアル化されたリテラルの最大サイズ（バイト）。デフォルト値：`16384` (16 KiB)。
