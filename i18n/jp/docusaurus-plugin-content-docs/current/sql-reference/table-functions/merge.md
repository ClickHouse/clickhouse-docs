---
'description': '一時的な Merge テーブルを作成します。構造は、基になるテーブルからカラムのユニオンを使用して導出され、共通のタイプが導出されます。'
'sidebar_label': 'マージ'
'sidebar_position': 130
'slug': '/sql-reference/table-functions/merge'
'title': 'マージ'
'doc_type': 'reference'
---


# merge Table Function

一時的な [Merge](../../engines/table-engines/special/merge.md) テーブルを作成します。構造は、基になるテーブルのカラムのユニオンを使用し、共通の型を導出することによって得られます。

## Syntax {#syntax}

```sql
merge(['db_name',] 'tables_regexp')
```
## Arguments {#arguments}

| Argument        | Description                                                                                                                                                                                                                                                                                     |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `db_name`       | 可能な値（オプション、デフォルトは `currentDatabase()`）：<br/>    - データベース名、<br/>    - データベース名を返す定数式、例えば `currentDatabase()`、<br/>    - `REGEXP(expression)`、ここで `expression` はDB名にマッチする正規表現です。                    |
| `tables_regexp` | 指定されたDBまたはDBのテーブル名にマッチする正規表現。                                                                                                                                                                                                                                 |

## Related {#related}

- [Merge](../../engines/table-engines/special/merge.md) テーブルエンジン
