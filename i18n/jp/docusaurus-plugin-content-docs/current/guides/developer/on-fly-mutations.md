---
slug: /guides/developer/on-the-fly-mutations
sidebar_label: 'オンザフライ更新'
title: 'オンザフライ更新'
keywords: ['オンザフライ更新']
description: 'オンザフライ更新について説明します'
doc_type: 'guide'
---



## オンザフライミューテーション {#on-the-fly-mutations}

オンザフライミューテーションが有効な場合、更新された行は即座に更新済みとしてマークされ、その後の`SELECT`クエリは自動的に変更後の値を返します。オンザフライミューテーションが無効な場合、変更後の値を確認するには、バックグラウンドプロセスによってミューテーションが適用されるまで待つ必要があります。

オンザフライミューテーションは、クエリレベルの設定`apply_mutations_on_fly`を有効にすることで、`MergeTree`ファミリーのテーブルに対して有効化できます。

```sql
SET apply_mutations_on_fly = 1;
```


## 例 {#example}

テーブルを作成し、いくつかのミューテーションを実行してみましょう:

```sql
CREATE TABLE test_on_fly_mutations (id UInt64, v String)
ENGINE = MergeTree ORDER BY id;

-- オンザフライミューテーションが無効な場合の
-- デフォルト動作を示すため、ミューテーションのバックグラウンド実体化を無効化
SYSTEM STOP MERGES test_on_fly_mutations;
SET mutations_sync = 0;

-- 新しいテーブルにいくつかの行を挿入
INSERT INTO test_on_fly_mutations VALUES (1, 'a'), (2, 'b'), (3, 'c');

-- 行の値を更新
ALTER TABLE test_on_fly_mutations UPDATE v = 'd' WHERE id = 1;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'd';
ALTER TABLE test_on_fly_mutations UPDATE v = 'e' WHERE id = 2;
ALTER TABLE test_on_fly_mutations DELETE WHERE v = 'e';
```

`SELECT`クエリで更新結果を確認してみましょう:

```sql
-- オンザフライミューテーションを明示的に無効化
SET apply_mutations_on_fly = 0;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

新しいテーブルをクエリした時点では、行の値がまだ更新されていないことに注意してください:

```response
┌─id─┬─v─┐
│  1 │ a │
│  2 │ b │
│  3 │ c │
└────┴───┘
```

次に、オンザフライミューテーションを有効にした場合の動作を見てみましょう:

```sql
-- オンザフライミューテーションを有効化
SET apply_mutations_on_fly = 1;

SELECT id, v FROM test_on_fly_mutations ORDER BY id;
```

`SELECT`クエリは、ミューテーションが適用されるのを待つことなく、即座に正しい結果を返すようになります:

```response
┌─id─┬─v─┐
│  3 │ c │
└────┴───┘
```


## パフォーマンスへの影響 {#performance-impact}

オンザフライミューテーションを有効にすると、ミューテーションは即座に実体化されず、`SELECT`クエリの実行時にのみ適用されます。ただし、ミューテーションはバックグラウンドで非同期的に実体化されており、これは負荷の高い処理であることに注意してください。

送信されたミューテーションの数が、一定期間にわたってバックグラウンドで処理されるミューテーションの数を常に上回る場合、適用待ちの未実体化ミューテーションのキューは増加し続けます。その結果、最終的に`SELECT`クエリのパフォーマンスが低下します。

未実体化ミューテーションの無制限な増加を抑制するため、`apply_mutations_on_fly`設定を`number_of_mutations_to_throw`や`number_of_mutations_to_delay`などの他の`MergeTree`レベルの設定と併用することを推奨します。


## サブクエリと非決定的関数のサポート {#support-for-subqueries-and-non-deterministic-functions}

オンザフライミューテーションは、サブクエリと非決定的関数に対して限定的なサポートを提供します。妥当なサイズの結果を持つスカラーサブクエリのみがサポートされます(設定`mutations_max_literal_size_to_replace`で制御されます)。定数の非決定的関数のみがサポートされます(例: `now()`関数)。

これらの動作は以下の設定で制御されます:

- `mutations_execute_nondeterministic_on_initiator` - trueの場合、非決定的関数はイニシエーターレプリカで実行され、`UPDATE`および`DELETE`クエリ内でリテラルとして置換されます。デフォルト値: `false`。
- `mutations_execute_subqueries_on_initiator` - trueの場合、スカラーサブクエリはイニシエーターレプリカで実行され、`UPDATE`および`DELETE`クエリ内でリテラルとして置換されます。デフォルト値: `false`。
- `mutations_max_literal_size_to_replace` - `UPDATE`および`DELETE`クエリで置換するシリアライズされたリテラルの最大サイズ(バイト単位)。デフォルト値: `16384` (16 KiB)。
