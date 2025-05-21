---
slug: /guides/developer/lightweight-update
sidebar_label: '論理更新'
title: '論理更新'
keywords: ['論理更新']
description: '論理更新の説明を提供します'
---

## 論理更新 {#lightweight-update}

論理更新が有効になっていると、更新された行は即座に更新済みとしてマークされ、以降の `SELECT` クエリは自動的に変更された値を返します。論理更新が無効になっている場合は、変更された値を見るために、ミューテーションがバックグラウンドプロセスを通じて適用されるのを待たなければならないかもしれません。

論理更新は `MergeTree` ファミリーのテーブルに対して、クエリレベルの設定 `apply_mutations_on_fly` を有効にすることで使用できます。

```sql
SET apply_mutations_on_fly = 1;
```

## 例 {#example}

テーブルを作成し、いくつかのミューテーションを実行してみましょう：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- バックグラウンドでのミューテーションのマテリアライズを無効にして
-- 論理更新が無効な場合のデフォルトの動作を示します
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
-- 論理更新を明示的に無効にします
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリしたときには行の値がまだ更新されていないことに注意してください：

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

論理更新を有効にしたときに何が起こるか見てみましょう：

```sql
-- 論理更新を有効にします
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは、ミューテーションが適用されるのを待つ必要なく、正しい結果を即座に返します：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## パフォーマンスへの影響 {#performance-impact}

論理更新が有効になっていると、ミューテーションは即座にはマテリアライズされず、`SELECT` クエリ中にのみ適用されます。ただし、ミューテーションは依然としてバックグラウンドで非同期的にマテリアライズされていることに注意が必要であり、これは重いプロセスです。

提出されたミューテーションの数が、一定の時間間隔でバックグラウンドで処理されるミューテーションの数を常に超える場合、適用される必要がある未マテリアライズのミューテーションのキューは成長し続けます。これにより、最終的には `SELECT` クエリのパフォーマンスが低下します。

`apply_mutations_on_fly` の設定を、`number_of_mutations_to_throw` や `number_of_mutations_to_delay` などの他の `MergeTree` レベルの設定と一緒に有効にして、未マテリアライズのミューテーションの無限成長を制限することをお勧めします。

## サブクエリと非決定論的関数のサポート {#support-for-subqueries-and-non-deterministic-functions}

論理更新はサブクエリと非決定論的関数に対して制限されたサポートがあります。合理的なサイズの結果を持つスカラーサブクエリのみがサポートされており（設定 `mutations_max_literal_size_to_replace` によって制御されます）、定数の非決定論的関数のみがサポートされています（例：関数 `now()`）。

これらの挙動は次の設定によって制御されています：

- `mutations_execute_nondeterministic_on_initiator` - true の場合、非決定論的関数はイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリにリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_execute_subqueries_on_initiator` - true の場合、スカラーサブクエリはイニシエーターのレプリカで実行され、`UPDATE` および `DELETE` クエリにリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリで置き換えるシリアライズされたリテラルの最大サイズ（バイト単位）。デフォルト値：`16384` (16 KiB)。
