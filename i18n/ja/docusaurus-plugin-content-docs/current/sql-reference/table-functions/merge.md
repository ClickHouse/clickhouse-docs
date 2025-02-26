---
slug: /sql-reference/table-functions/merge
sidebar_position: 130
sidebar_label: merge
---

# merge

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。テーブルの構造は、正規表現に一致する最初のテーブルから取得されます。

**構文**

```sql
merge(['db_name',] 'tables_regexp')
```
**引数**

- `db_name` — 可能な値（オプション、デフォルトは `currentDatabase()`）:
    - データベース名、
    - データベース名を返す定数式、たとえば `currentDatabase()`、
    - `REGEXP(expression)`、ここで `expression` は DB 名に一致する正規表現です。

- `tables_regexp` — 指定された DB または DB のテーブル名に一致する正規表現。

**参照**

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
