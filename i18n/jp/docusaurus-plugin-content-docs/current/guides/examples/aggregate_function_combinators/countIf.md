---
'slug': '/examples/aggregate-function-combinators/countIf'
'title': 'countIf'
'description': 'countIf コンビネータの使用例'
'keywords':
- 'count'
- 'if'
- 'combinator'
- 'examples'
- 'countIf'
'sidebar_label': 'countIf'
'doc_type': 'reference'
---


# countIf {#countif}

## 説明 {#description}

[`If`](/sql-reference/aggregate-functions/combinators#-if) コンビネーターは、[`count`](/sql-reference/aggregate-functions/reference/count) 関数に適用することができ、`countIf` 集約コンビネーター関数を使用して、条件が真である行の数をカウントします。

## 使用例 {#example-usage}

この例では、ユーザーログイン試行を保存するテーブルを作成し、`countIf` を使用して成功したログインの数をカウントします。

```sql title="Query"
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
    countIf(is_successful = 1) AS successful_logins
FROM login_attempts
GROUP BY user_id;
```

`countIf` 関数は、各ユーザーについて `is_successful = 1` の行のみをカウントします。

```response title="Response"
   ┌─user_id─┬─successful_logins─┐
1. │       1 │                 2 │
2. │       2 │                 2 │
   └─────────┴───────────────────┘
```

## その他 {#see-also}
- [`count`](/sql-reference/aggregate-functions/reference/count)
- [`If combinator`](/sql-reference/aggregate-functions/combinators#-if)
