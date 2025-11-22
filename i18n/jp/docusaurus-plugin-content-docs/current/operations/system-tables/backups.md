---
description: '`BACKUP` および `RESTORE` 操作に関する情報を含むログエントリを格納するシステムテーブル。'
keywords: ['システムテーブル', 'バックアップ']
slug: /operations/system-tables/backups
title: 'system.backups'
doc_type: 'reference'
---

# system.backups

すべての `BACKUP` または `RESTORE` 操作と、その現在の状態およびその他のプロパティを一覧で保持します。なお、このテーブルは永続化されるものではなく、最後のサーバー再起動以降に実行された操作のみを表示します。

以下は、name と comment の列を含む Markdown テーブルです:

| Column              | Description                                                                                                          |
|---------------------|----------------------------------------------------------------------------------------------------------------------|
| `id`                | 操作 ID。`SETTINGS id=...` で指定するか、ランダムに生成される UUID です。                                             |
| `name`              | 操作名。`Disk('backups', 'my_backup')` のような文字列です。                                                           |
| `base_backup_name`  | ベースバックアップの操作名。`Disk('backups', 'my_base_backup')` のような文字列です。                                 |
| `query_id`          | バックアップを開始したクエリのクエリ ID。                                                                            |
| `status`            | バックアップまたはリストア操作のステータス。                                                                          |
| `error`             | エラーが発生した場合のエラーメッセージ。                                                                              |
| `start_time`        | 操作の開始時刻。                                                                                                     |
| `end_time`          | 操作の終了時刻。                                                                                                     |
| `num_files`         | バックアップに格納されているファイル数。                                                                              |
| `total_size`        | バックアップに格納されているファイルの合計サイズ。                                                                    |
| `num_entries`       | バックアップ内のエントリ数。つまり、バックアップがフォルダとして保存されている場合、そのフォルダ内のファイル数。     |
| `uncompressed_size` | バックアップの非圧縮サイズ。                                                                                          |
| `compressed_size`   | バックアップの圧縮サイズ。                                                                                            |
| `files_read`        | このバックアップからの RESTORE 中に読み取られたファイル数。                                                          |
| `bytes_read`        | このバックアップからの RESTORE 中に読み取られたファイルの合計サイズ。                                                |
| `ProfileEvents`     | この操作中に取得されたすべてのプロファイルイベント。                                                                  |