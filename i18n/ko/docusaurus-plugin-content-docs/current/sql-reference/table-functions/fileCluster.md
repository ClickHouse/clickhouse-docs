---
'description': '지정된 경로와 일치하는 파일을 클러스터 내 여러 노드에서 동시에 처리할 수 있게 합니다. 발신자는 작업자 노드에 연결을
  설정하고, 파일 경로의 글로브를 확장하며, 파일 읽기 작업을 작업자 노드에 위임합니다. 각 작업자 노드는 처리할 다음 파일을 위해 발신자에게 쿼리하여,
  모든 작업이 완료될 때까지 반복합니다(모든 파일이 읽히게 됩니다).'
'sidebar_label': 'fileCluster'
'sidebar_position': 61
'slug': '/sql-reference/table-functions/fileCluster'
'title': 'fileCluster'
'doc_type': 'reference'
---


# fileCluster 테이블 함수

지정된 경로와 일치하는 파일을 클러스터 내 여러 노드에서 동시에 처리할 수 있습니다. 시작자는 작업자 노드에 연결을 설정하고, 파일 경로 내의 glob을 확장하며, 파일 읽기 작업을 작업자 노드에 위임합니다. 각 작업자 노드는 시작자에게 처리할 다음 파일을 쿼리하고, 모든 작업이 완료될 때까지(모든 파일이 읽힐 때까지) 반복합니다.

:::note    
이 함수는 처음 지정된 경로와 일치하는 파일 집합이 모든 노드에서 동일하고, 그 내용이 서로 다른 노드 간에 일관될 경우에만 _올바르게_ 작동합니다.  
이 파일들이 노드 간에 다를 경우, 반환 값은 미리 결정할 수 없으며, 작업자 노드가 시작자로부터 작업을 요청하는 순서에 따라 달라집니다.
:::

## 구문 {#syntax}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```

## 인수 {#arguments}

| 인수                  | 설명                                                                                                                                                                           |
|-----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`        | 원격 및 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.                                                                                     |
| `path`                | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path)에서 파일에 대한 상대 경로입니다. 파일 경로는 [globs](#globs-in-path)도 지원합니다. |
| `format`              | 파일의 [형식](/sql-reference/formats). 유형: [String](../../sql-reference/data-types/string.md).                                                                                   |
| `structure`           | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름과 유형을 결정합니다. 유형: [String](../../sql-reference/data-types/string.md).                                      |
| `compression_method`  | 압축 방법입니다. 지원되는 압축 유형은 `gz`, `br`, `xz`, `zst`, `lz4`, `bz2`입니다.                                                                                            |

## 반환 값 {#returned_value}

지정된 형식과 구조의 테이블이며, 지정된 경로와 일치하는 파일의 데이터가 포함됩니다.

**예시**

클러스터 이름이 `my_cluster`이고 `user_files_path` 설정의 다음 값이 주어졌다고 가정합니다:

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
또한, 각 클러스터 노드의 `user_files_path` 내에 `test1.csv` 및 `test2.csv` 파일이 있으며, 서로 다른 노드 간의 내용이 동일하다고 가정합니다:
```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

예를 들어, 다음 두 쿼리를 모든 클러스터 노드에서 실행하여 이러한 파일을 생성할 수 있습니다:
```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

이제 `fileCluster` 테이블 함수를 통해 `test1.csv` 및 `test2.csv`의 데이터 내용을 읽어보십시오:

```sql
SELECT * FROM fileCluster('my_cluster', 'file{1,2}.csv', 'CSV', 'i UInt32, s String') ORDER BY i, s
```

```response
┌──i─┬─s──────┐
│  1 │ file1  │
│ 11 │ file11 │
└────┴────────┘
┌──i─┬─s──────┐
│  2 │ file2  │
│ 22 │ file22 │
└────┴────────┘
```

## 경로의 Globs {#globs-in-path}

[File](../../sql-reference/table-functions/file.md#globs-in-path) 테이블 함수에서 지원하는 모든 패턴은 FileCluster에서도 지원됩니다.

## 관련 {#related}

- [File 테이블 함수](../../sql-reference/table-functions/file.md)
