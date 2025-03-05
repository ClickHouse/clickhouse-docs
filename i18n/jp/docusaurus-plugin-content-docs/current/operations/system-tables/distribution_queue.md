---
description: "シャードに送信されるキューにあるローカルファイルに関する情報を含むシステムテーブル。"
slug: /operations/system-tables/distribution_queue
title: "system.distribution_queue"
keywords: ["system table", "distribution_queue"]
---

シャードに送信されるキューにあるローカルファイルに関する情報を含みます。これらのローカルファイルは、非同期モードで分散テーブルに新しいデータを挿入することによって作成された新しいパーツを含んでいます。

カラム:

- `database` ([String](../../sql-reference/data-types/string.md)) — データベースの名称。

- `table` ([String](../../sql-reference/data-types/string.md)) — テーブルの名称。

- `data_path` ([String](../../sql-reference/data-types/string.md)) — ローカルファイルがあるフォルダへのパス。

- `is_blocked` ([UInt8](../../sql-reference/data-types/int-uint.md)) — ローカルファイルのサーバーへの送信がブロックされているかどうかを示すフラグ。

- `error_count` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エラーの数。

- `data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — フォルダ内のローカルファイルの数。

- `data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — ローカルファイル内の圧縮データのサイズ（バイト）。

- `broken_data_files` ([UInt64](../../sql-reference/data-types/int-uint.md)) — エラーにより壊れたとしてマークされたファイルの数。

- `broken_data_compressed_bytes` ([UInt64](../../sql-reference/data-types/int-uint.md)) — 壊れたファイル内の圧縮データのサイズ（バイト）。

- `last_exception` ([String](../../sql-reference/data-types/string.md)) — 最後に発生したエラーに関するテキストメッセージ（あれば）。

**例**

``` sql
SELECT * FROM system.distribution_queue LIMIT 1 FORMAT Vertical;
```

``` text
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

**関連項目**

- [Distributed table engine](../../engines/table-engines/special/distributed.md)
