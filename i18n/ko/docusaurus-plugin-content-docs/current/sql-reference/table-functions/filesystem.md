---
description: '파일 시스템에 액세스하여 파일 목록을 조회하고 해당 메타데이터와 내용을 반환합니다.'
sidebar_label: 'filesystem'
sidebar_position: 62
slug: /sql-reference/table-functions/filesystem
title: 'filesystem'
doc_type: 'reference'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# filesystem 테이블 함수 \{#filesystem-table-function\}

<CloudNotSupportedBadge />

디렉터리를 재귀적으로 탐색하고 파일 메타데이터(경로, 크기, 타입, 권한, 수정 시간)와 선택적으로 파일 내용을 포함한 테이블을 반환합니다.

`clickhouse-server` 모드에서는 경로가 [user&#95;files&#95;path](/operations/server-configuration-parameters/settings.md#user_files_path) 디렉터리 내에 있어야 합니다. `user_files_path` 내부에서 그 밖을 가리키는 심볼릭 링크는 따라가지만, 심볼릭 링크를 통해 확인한 경로가 `user_files_path`로 시작하는 항목만 반환됩니다.

`clickhouse-local` 모드에서는 경로 제한이 없습니다.

## 구문 \{#syntax\}

```sql
filesystem([path])
```

## 인수 \{#arguments\}

| 매개변수   | 설명                                                                                                                                                        |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `path` | 나열할 디렉터리입니다. 절대 경로일 수도 있고(`server` 모드에서는 `user_files_path` 내부여야 함), `user_files_path`를 기준으로 한 상대 경로일 수도 있습니다. 비어 있거나 생략하면 `user_files_path`가 기본값으로 사용됩니다. |

## 반환 컬럼 \{#returned_columns\}

| 컬럼                  | 유형                         | 설명                                                                                                                                    |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `path`              | `String`                   | 항목이 들어 있는 디렉터리입니다(파일/디렉터리 이름 자체는 포함되지 않음).                                                                                            |
| `name`              | `String`                   | 파일 또는 디렉터리 이름입니다(경로의 마지막 부분).                                                                                                         |
| `file`              | `String` (ALIAS of `name`) | `name` 컬럼의 에일리어스입니다.                                                                                                                  |
| `type`              | `Enum8`                    | 파일 유형: `'none'`, `'not_found'`, `'regular'`, `'directory'`, `'symlink'`, `'block'`, `'character'`, `'fifo'`, `'socket'`, `'unknown'`. |
| `size`              | `Nullable(UInt64)`         | 파일 크기(바이트 단위, 일반 파일의 경우)입니다. 일반 파일이 아닌 경우(디렉터리, 심볼릭 링크 등)와 오류 발생 시에는 `NULL`입니다.                                                       |
| `depth`             | `UInt16`                   | 재귀 깊이입니다. 쿼리한 디렉터리 자체와 그 바로 아래 하위 항목은 `0`, 한 단계 더 깊은 항목은 `1`이며, 이후도 같은 방식입니다.                                                         |
| `modification_time` | `Nullable(DateTime64(6))`  | 마이크로초 정밀도의 마지막 수정 시각입니다. 오류 발생 시 `NULL`입니다.                                                                                           |
| `is_symlink`        | `Bool`                     | 항목이 심볼릭 링크인지 여부입니다.                                                                                                                   |
| `content`           | `Nullable(String)`         | 파일 내용(일반 파일의 경우)입니다. 일반 파일이 아닌 경우(디렉터리, 심볼릭 링크 등)에는 `NULL`입니다. 읽기 오류가 발생하면 예외를 발생시킵니다. 이 컬럼을 읽으면 실제 파일 I/O가 수행되므로 필요하지 않다면 제외하십시오.    |
| `owner_read`        | `Bool`                     | 소유자에게 읽기 권한이 있습니다.                                                                                                                    |
| `owner_write`       | `Bool`                     | 소유자에게 쓰기 권한이 있습니다.                                                                                                                    |
| `owner_exec`        | `Bool`                     | 소유자에게 실행 권한이 있습니다.                                                                                                                    |
| `group_read`        | `Bool`                     | 그룹에 읽기 권한이 있습니다.                                                                                                                      |
| `group_write`       | `Bool`                     | 그룹에 쓰기 권한이 있습니다.                                                                                                                      |
| `group_exec`        | `Bool`                     | 그룹에 실행 권한이 있습니다.                                                                                                                      |
| `others_read`       | `Bool`                     | 기타 사용자에게 읽기 권한이 있습니다.                                                                                                                 |
| `others_write`      | `Bool`                     | 기타 사용자에게 쓰기 권한이 있습니다.                                                                                                                 |
| `others_exec`       | `Bool`                     | 기타 사용자에게 실행 권한이 있습니다.                                                                                                                 |
| `set_gid`           | `Bool`                     | Set-GID 비트입니다.                                                                                                                        |
| `set_uid`           | `Bool`                     | Set-UID 비트입니다.                                                                                                                        |
| `sticky_bit`        | `Bool`                     | 스티키 비트입니다.                                                                                                                            |

쿼리에서 실제로 사용되는 컬럼만 계산되므로, 일부 컬럼만 선택하면(특히 `content`를 제외하면) 효율적입니다.

## 예시 \{#examples\}

### user_files의 파일 목록 보기 \{#list-files\}

```sql
SELECT name, type, size, depth
FROM filesystem()
ORDER BY name;
```

### 대용량 파일 찾기 \{#find-large-files\}

```sql
SELECT path, name, size
FROM filesystem()
WHERE type = 'regular' AND size > 1000000
ORDER BY size DESC;
```

### 파일 내용 읽기 \{#read-contents\}

```sql
SELECT name, content
FROM filesystem('my_directory')
WHERE name LIKE '%.csv';
```

### 직접 하위 항목만 나열 \{#list-immediate\}

```sql
SELECT name, type
FROM filesystem('my_directory')
WHERE depth = 0;
```