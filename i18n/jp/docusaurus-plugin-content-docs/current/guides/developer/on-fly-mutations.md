---
slug: /guides/developer/on-the-fly-mutations
sidebar_label: 'オンザフライ・ミューテーション'
title: 'オンザフライ・ミューテーション'
keywords: ['オンザフライ・ミューテーション']
description: 'オンザフライ・ミューテーションについて説明します'
doc_type: 'guide'
---



## オンザフライミューテーション {#on-the-fly-mutations}

オンザフライミューテーションが有効になっている場合、更新された行は即座に更新済みとしてマークされ、その後の `SELECT` クエリでは自動的に変更後の値が返ります。オンザフライミューテーションが有効になっていない場合、バックグラウンドプロセスによってミューテーションが適用されるまで、変更後の値が反映されるのを待つ必要がある場合があります。

オンザフライミューテーションは、クエリレベル設定 `apply_mutations_on_fly` を有効にすることで、`MergeTree` ファミリーのテーブルに対して有効化できます。

```sql
SET apply_mutations_on_fly = 1;
```


## 例 {#example}

テーブルを作成し、ミューテーションを実行してみましょう。

```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- オンザフライミューテーションが無効な場合の
-- デフォルト動作を示すため、バックグラウンドでのミューテーションの実体化を無効化
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 新しいテーブルに行を挿入
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 行の値を更新
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

`SELECT` クエリを使って、更新の結果を確認してみましょう。

```sql
-- オンザフライミューテーションを明示的に無効化
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリしても、その時点では行の値がまだ更新されていないことに注意してください。

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

それでは、オンザフライミューテーションを有効にするとどうなるか見てみましょう。

```sql
-- オンザフライミューテーションを有効化
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT` クエリは、ミューテーションの適用を待つことなく、即座に正しい結果を返すようになりました。

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```


## パフォーマンスへの影響 {#performance-impact}

オンザフライでのミューテーション適用が有効な場合、ミューテーションは即座にマテリアライズされず、`SELECT` クエリの実行時にのみ適用されます。ただし、ミューテーションはバックグラウンドで非同期にマテリアライズされ続けており、この処理は負荷の高い処理であることに注意してください。

ある一定期間にわたって、投入されたミューテーションの数がバックグラウンドで処理されるミューテーションの数を継続的に上回ると、適用待ちの未マテリアライズミューテーションのキューが増え続けます。その結果として、最終的には `SELECT` クエリのパフォーマンスが低下します。

未マテリアライズミューテーションが無制限に増加するのを抑制するため、`apply_mutations_on_fly` 設定を、`number_of_mutations_to_throw` や `number_of_mutations_to_delay` といった他の `MergeTree` レベルの設定と組み合わせて有効にすることを推奨します。



## サブクエリおよび非決定的関数のサポート {#support-for-subqueries-and-non-deterministic-functions}

オンザフライのミューテーションは、サブクエリおよび非決定的関数に対してはサポートが限定的です。結果が妥当なサイズ（設定 `mutations_max_literal_size_to_replace` で制御）であるスカラーサブクエリのみがサポートされます。定数値を返す非決定的関数のみがサポートされます（例: 関数 `now()`）。

これらの挙動は、以下の設定で制御されます。

- `mutations_execute_nondeterministic_on_initiator` - `true` の場合、非決定的関数はイニシエータレプリカ上で実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値: `false`。
- `mutations_execute_subqueries_on_initiator` - `true` の場合、スカラーサブクエリはイニシエータレプリカ上で実行され、`UPDATE` および `DELETE` クエリ内でリテラルとして置き換えられます。デフォルト値: `false`。
- `mutations_max_literal_size_to_replace` - `UPDATE` および `DELETE` クエリで置き換えるシリアライズされたリテラルの最大サイズ（バイト単位）。デフォルト値: `16384`（16 KiB）。
