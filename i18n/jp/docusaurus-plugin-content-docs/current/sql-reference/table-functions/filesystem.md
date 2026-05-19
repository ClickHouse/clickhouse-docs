---
description: 'ファイルシステムにアクセスし、ファイルを一覧表示して、そのメタデータと内容を返します。'
sidebar_label: 'filesystem'
sidebar_position: 62
slug: /sql-reference/table-functions/filesystem
title: 'filesystem'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# filesystem テーブル関数 \{#filesystem-table-function\}

<CloudNotSupportedBadge />

ディレクトリを再帰的に走査し、ファイルのメタデータ (パス、サイズ、型、権限、更新時刻) と、必要に応じてファイルの内容を含むテーブルを返します。

`clickhouse-server` モードでは、パスは [user&#95;files&#95;path](/operations/server-configuration-parameters/settings.md#user_files_path) ディレクトリ内である必要があります。`user_files_path` 内にあるシンボリックリンクがその外部を指している場合、そのリンクはたどられますが、返されるのは (シンボリックリンク経由で見た) パスが `user_files_path` で始まるエントリのみです。

`clickhouse-local` モードでは、パスに制限はありません。

## 構文 \{#syntax\}

```sql
filesystem([path])
```

## 引数 \{#arguments\}

| パラメーター | 説明                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `path` | 一覧表示するディレクトリです。絶対パス (サーバーモードでは `user_files_path` 内にある必要があります) または `user_files_path` からの相対パスを指定できます。空または省略した場合は、デフォルトで `user_files_path` が使用されます。 |

## 返されるカラム \{#returned_columns\}

| カラム                 | 型                          | 説明                                                                                                                                     |
| ------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `path`              | `String`                   | エントリを含むディレクトリ (ファイル名またはディレクトリ名そのものは含みません) 。                                                                                            |
| `name`              | `String`                   | ファイル名またはディレクトリ名 (パスの最後の部分) 。                                                                                                           |
| `file`              | `String` (ALIAS of `name`) | `name` カラムのエイリアス。                                                                                                                      |
| `type`              | `Enum8`                    | ファイル種別: `'none'`, `'not_found'`, `'regular'`, `'directory'`, `'symlink'`, `'block'`, `'character'`, `'fifo'`, `'socket'`, `'unknown'`。 |
| `size`              | `Nullable(UInt64)`         | ファイルサイズ (通常ファイルの場合、バイト単位) 。通常ファイル以外 (ディレクトリ、シンボリックリンクなど) およびエラー時は `NULL`。                                                              |
| `depth`             | `UInt16`                   | 再帰の深さ。クエリ対象のディレクトリ自体とその直下の子は `0`、1 階層深いエントリは `1`、以降同様です。                                                                               |
| `modification_time` | `Nullable(DateTime64(6))`  | マイクロ秒精度の最終更新時刻。エラー時は `NULL`。                                                                                                           |
| `is_symlink`        | `Bool`                     | エントリがシンボリックリンクかどうか。                                                                                                                    |
| `content`           | `Nullable(String)`         | ファイルの内容 (通常ファイルの場合) 。通常ファイル以外 (ディレクトリ、シンボリックリンクなど) は `NULL`。読み取りエラーは例外を発生させます。このカラムを読み取ると実際のファイル I/O が発生するため、不要であれば省略してください。           |
| `owner_read`        | `Bool`                     | 所有者に読み取り権限があるかどうか。                                                                                                                     |
| `owner_write`       | `Bool`                     | 所有者に書き込み権限があるかどうか。                                                                                                                     |
| `owner_exec`        | `Bool`                     | 所有者に実行権限があるかどうか。                                                                                                                       |
| `group_read`        | `Bool`                     | グループに読み取り権限があるかどうか。                                                                                                                    |
| `group_write`       | `Bool`                     | グループに書き込み権限があるかどうか。                                                                                                                    |
| `group_exec`        | `Bool`                     | グループに実行権限があるかどうか。                                                                                                                      |
| `others_read`       | `Bool`                     | その他のユーザーに読み取り権限があるかどうか。                                                                                                                |
| `others_write`      | `Bool`                     | その他のユーザーに書き込み権限があるかどうか。                                                                                                                |
| `others_exec`       | `Bool`                     | その他のユーザーに実行権限があるかどうか。                                                                                                                  |
| `set_gid`           | `Bool`                     | Set-GID ビット。                                                                                                                           |
| `set_uid`           | `Bool`                     | Set-UID ビット。                                                                                                                           |
| `sticky_bit`        | `Bool`                     | スティッキービット。                                                                                                                             |

実際に計算されるのはクエリで使用されるカラムのみであるため、カラムの子集だけを選択する (特に `content` を省略する) と効率的です。

## 例 \{#examples\}

### user_files 内のファイルを一覧表示 \{#list-files\}

```sql
SELECT name, type, size, depth
FROM filesystem()
ORDER BY name;
```

### サイズの大きいファイルを見つける \{#find-large-files\}

```sql
SELECT path, name, size
FROM filesystem()
WHERE type = 'regular' AND size > 1000000
ORDER BY size DESC;
```

### ファイルの内容を表示する \{#read-contents\}

```sql
SELECT name, content
FROM filesystem('my_directory')
WHERE name LIKE '%.csv';
```

### 直下の子要素のみを表示する \{#list-immediate\}

```sql
SELECT name, type
FROM filesystem('my_directory')
WHERE depth = 0;
```