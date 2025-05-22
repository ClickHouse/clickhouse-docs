---
'slug': '/examples/aggregate-function-combinators/countIf'
'title': 'countIf'
'description': 'countIfコンビネータの使用例'
'keywords':
- 'count'
- 'if'
- 'combinator'
- 'examples'
- 'countIf'
'sidebar_label': 'countIf'
---




# countIf {#countif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネータは、`count`（行数を数える）関数に適用でき、条件が真である行の数をカウントするために `countIf` 集計コンビネータ関数を使用します。

## 使用例 {#example-usage}

この例では、ユーザーのログイン試行を保存するテーブルを作成し、`countIf` を使用して成功したログインの数をカウントします。

```sql title="クエリ"
CREATE TABLE login_attempts(
    user_id UInt32,
    timestamp DateTime,
    is_successful UInt8
) ENGINE = Log;

INSERT INTO login_attempts VALUES
    (1, '2024-01-01 10:00:00', 1),
    (1, '2024-01-01 10:05:00', 0),
    (1, '2024-01-01 10:10:00', 1),
    (2, '2024-01-01 11:00:00', 1),
    (2, '2024-01-01 11:05:00', 1),
    (2, '2024-01-01 11:10:00', 0);

SELECT
    user_id,
    countIf(is_successful = 1) as successful_logins
FROM login_attempts
GROUP BY user_id;
```

`countIf` 関数は、各ユーザーに対して `is_successful = 1` である行のみをカウントします。

```response title="レスポンス"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## 関連項目 {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
