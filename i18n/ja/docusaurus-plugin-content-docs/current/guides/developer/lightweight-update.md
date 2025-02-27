---
slug: /guides/developer/lightweight-update
sidebar_label: 論理更新
title: 論理更新
keywords: [論理更新]
---

## 論理更新 {#lightweight-update}

論理更新が有効になっている場合、更新された行はすぐに更新されたとしてマークされ、次の `SELECT` クエリは変更された値を自動的に返します。論理更新が有効でない場合、変更された値を見るためには、バックグラウンドプロセスを介して変異が適用されるのを待つ必要があります。

論理更新は、クエリレベルの設定 `apply_mutations_on_fly` を有効にすることで `MergeTree` ファミリーのテーブルに対して有効にできます。

```sql
SET apply_mutations_on_fly = 1;
```

## 例 {#example}

テーブルを作成していくつかの変異を実行してみましょう：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- バックグラウンドでの変異のマテリアライズを無効にして
-- 論理更新が無効なときのデフォルトの動作を示します
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 新しいテーブルにいくつかの行を挿入します
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 行の値を更新します
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

`SELECT` クエリを介して更新の結果を確認してみましょう：
```sql
-- 明示的に論理更新を無効にする
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリしたとき、行の値はまだ更新されていないことに注意してください：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

では、論理更新を有効にした場合はどうなるか見てみましょう：

```sql
-- 論理更新を有効にする
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは、変異が適用されるのを待つことなく、正しい結果をすぐに返します：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## パフォーマンスへの影響 {#performance-impact}

論理更新が有効になっている場合、変異はすぐにはマテリアライズされませんが、`SELECT` クエリの実行時にのみ適用されます。ただし、変異はバックグラウンドで非同期にマテリアライズされており、これは重いプロセスであることに注意してください。

一定の時間間隔内に提出された変異の数がバックグラウンドで処理される変異の数を常に超える場合、適用される必要のある未マテリアライズの変異のキューが増え続けます。これによって、最終的には `SELECT` クエリのパフォーマンスが低下する結果になります。

未マテリアライズの変異が無限に増加しないように、`apply_mutations_on_fly` の設定を `number_of_mutations_to_throw` や `number_of_mutations_to_delay` などの他の `MergeTree` レベルの設定と一緒に有効にすることをお勧めします。

## サブクエリと非決定論的関数のサポート {#support-for-subqueries-and-non-deterministic-functions}

論理更新は、サブクエリと非決定論的関数との互換性が限られています。サイズが合理的な結果を持つスカラーサブクエリのみがサポートされています（`mutations_max_literal_size_to_replace` 設定によって制御されます）。定数の非決定論的関数のみがサポートされています（例えば、`now()` 関数）。

これらの動作は以下の設定によって制御されています：

- `mutations_execute_nondeterministic_on_initiator` - もし true の場合、非決定論的関数はイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値: `false`。
- `mutations_execute_subqueries_on_initiator` - もし true の場合、スカラーサブクエリはイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値: `false`。
- `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリ内で置き換えるためのシリアライズされたリテラルの最大サイズ（バイト数）。デフォルト値: `16384` (16 KiB)。
