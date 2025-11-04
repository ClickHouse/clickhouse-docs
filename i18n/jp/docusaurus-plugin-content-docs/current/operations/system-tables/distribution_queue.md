---
'description': 'システムテーブルには、シャードに送信されるキュー内のローカルファイルに関する情報が含まれています。'
'keywords':
- 'system table'
- 'distribution_queue'
'slug': '/operations/system-tables/distribution_queue'
'title': 'system.distribution_queue'
'doc_type': 'reference'
---

ローカルファイルに関する情報が含まれており、シャードに送信されるキューにあります。これらのローカルファイルには、非同期モードで分散テーブルに新しいデータを挿入することによって作成された新しいパーツが含まれています。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `data_path` ([String](../../sql-reference/data-types/string.md)) — ローカルファイルのフォルダーへのパス。

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ローカルファイルをサーバーに送信することがブロックされているかどうかを示すフラグ。

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エラーの数。

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — フォルダー内のローカルファイルの数。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ローカルファイル内の圧縮データのサイズ（バイト単位）。

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 壊れているとマークされたファイルの数（エラーによる）。

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 壊れたファイル内の圧縮データのサイズ（バイト単位）。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 最後に発生したエラーに関するテキストメッセージ（ある場合）。

**例**

```sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

```text
Row 1:
──────
database:              default
table:                 dist
data_path:             ./store/268/268bc070-3aad-4b1a-9cf2-4987580161af/default@127%2E0%2E0%2E2:9000/
is_blocked:            1
error_count:           0
data_files:            1
data_compressed_bytes: 499
last_exception:
```

**関連情報**

- [分散テーブルエンジン](../../engines/table-engines/special/distributed.md)
