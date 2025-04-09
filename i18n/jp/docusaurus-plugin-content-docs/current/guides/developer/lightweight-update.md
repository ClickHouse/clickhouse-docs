---
slug: /guides/developer/lightweight-update
sidebar_label: 軽量更新
title: 軽量更新
keywords: [軽量更新]
---

## 軽量更新 {#lightweight-update}

軽量更新が有効な場合、更新された行は即座に更新済みとしてマークされ、その後の `SELECT` クエリは自動的に変更された値を返します。軽量更新が有効でない場合、変更された値を見るには、バックグラウンドプロセスを介してミューテーションが適用されるまで待つ必要があります。

軽量更新は `MergeTree` ファミリーのテーブルで、クエリレベルの設定 `apply_mutations_on_fly` を有効にすることで使用できます。

```sql
SET apply_mutations_on_fly = 1;
```

## 例 {#example}

テーブルを作成し、いくつかのミューテーションを実行してみましょう：
```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- 軽量更新が有効でないときのデフォルトの動作を示すために
-- ミューテーションのバックグラウンドのマテリアライズを無効にします
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

`SELECT` クエリを使用して更新の結果を確認します：
```sql
-- 明示的に軽量更新を無効にします
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

軽量更新を有効にすると何が起こるか見てみましょう：

```sql
-- 軽量更新を有効にします
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは施行されるミューテーションを待たずに、正しい結果を即座に返します：

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```

## パフォーマンスへの影響 {#performance-impact}

軽量更新が有効な場合、ミューテーションは即座にマテリアライズされるのではなく、`SELECT` クエリ時にのみ適用されます。ただし、ミューテーションは依然としてバックグラウンドで非同期にマテリアライズされており、これは重いプロセスです。

提出されたミューテーションの数が、ある時間間隔内にバックグラウンドで処理されるミューテーションの数を常に上回る場合、適用される必要のある未マテリアライズのミューテーションのキューは成長し続けます。これにより、最終的には `SELECT` クエリのパフォーマンスが低下することになります。

無限に成長する未マテリアライズのミューテーションを制限するために、設定 `apply_mutations_on_fly` を、`number_of_mutations_to_throw` や `number_of_mutations_to_delay` などの他の `MergeTree` レベルの設定と一緒に有効にすることをお勧めします。

## サブクエリおよび非決定論的関数のサポート {#support-for-subqueries-and-non-deterministic-functions}

軽量更新はサブクエリや非決定論的関数に対して制限されたサポートを提供します。サポートされるのは、結果が合理的なサイズを持つスカラーサブクエリのみに限ります（設定 `mutations_max_literal_size_to_replace` によって制御）。定数の非決定論的関数のみがサポートされています（例：関数 `now()`）。

これらの動作は以下の設定で制御されています：

- `mutations_execute_nondeterministic_on_initiator` - true の場合、非決定論的な関数はイニシエータレプリカ上で実行され、`UPDATE` および `DELETE` クエリでリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_execute_subqueries_on_initiator` - true の場合、スカラーサブクエリはイニシエータレプリカ上で実行され、`UPDATE` および `DELETE` クエリでリテラルとして置き換えられます。デフォルト値：`false`。
- `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリで置き換えるリテラルの最大サイズ（バイト）。デフォルト値：`16384`（16 KiB）。
