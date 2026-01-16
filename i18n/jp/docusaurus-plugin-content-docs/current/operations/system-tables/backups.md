---
description: '`BACKUP` および `RESTORE` 操作に関する情報を含むログエントリを格納するシステムテーブル。'
keywords: ['システムテーブル', 'バックアップ']
slug: /operations/system-tables/backups
title: 'system.backups'
doc_type: 'reference'
---

# system.backups \\{#systembackups\\}

すべての `BACKUP` または `RESTORE` 操作と、その現在の状態およびその他のプロパティの一覧を含みます。なお、このテーブルは永続化されず、最後にサーバーを再起動して以降に実行された操作のみが表示されます。

以下は、name 列および comment 列を含む Markdown テーブルです。

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | 操作 ID。`SETTINGS id=...` で明示的に指定するか、ランダムに生成される UUID です。                                |
| `name`              | 操作名。`Disk('backups', 'my_backup')` のような文字列です。                                                         |
| `base_backup_name`  | ベースバックアップの操作名。`Disk('backups', 'my_base_backup')` のような文字列です。                              |
| `query_id`          | バックアップを開始したクエリのクエリ ID。                                                                            |
| `status`            | バックアップまたはリストア操作のステータス。                                                                         |
| `error`             | エラーが発生した場合のエラーメッセージ。                                                                             |
| `start_time`        | 操作が開始された時刻。                                                                                               |
| `end_time`          | 操作が終了した時刻。                                                                                                 |
| `num_files`         | バックアップに格納されているファイル数。                                                                             |
| `total_size`        | バックアップに格納されているファイルの合計サイズ。                                                                   |
| `num_entries`       | バックアップ内のエントリ数。つまり、バックアップがフォルダとして保存されている場合、そのフォルダ内のファイル数。     |
| `uncompressed_size` | バックアップの非圧縮サイズ。                                                                                         |
| `compressed_size`   | バックアップの圧縮サイズ。                                                                                           |
| `files_read`        | このバックアップから RESTORE を実行する際に読み取られたファイル数。                                                 |
| `bytes_read`        | このバックアップから RESTORE を実行する際に読み取られたファイルの合計サイズ。                                       |
| `ProfileEvents`     | この操作中に取得されたすべてのプロファイルイベント。                                                                 |