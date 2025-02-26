---
description: "シャードに送信されるキューに含まれるローカルファイルに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/distribution_queue
title: "distribution_queue"
keywords: ["system table", "distribution_queue"]
---

シャードに送信されるキューに含まれるローカルファイルに関する情報を含みます。これらのローカルファイルは、分散テーブルに新しいデータを非同期モードで挿入することによって作成された新しいパーツを含んでいます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名前。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名前。

- `data_path` ([String](../../sql-reference/data-types/string.md)) — ローカルファイルのフォルダーへのパス。

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ローカルファイルをサーバーに送信することがブロックされているかどうかを示すフラグ。

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エラーの数。

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — フォルダー内のローカルファイルの数。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ローカルファイル内の圧縮データのサイズ（バイト単位）。

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エラーのために壊れたとマークされたファイルの数。

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 壊れたファイル内の圧縮データのサイズ（バイト単位）。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 発生した最後のエラーについてのテキストメッセージ（ある場合）。

**例**

``` sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

``` text
行 1:
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
