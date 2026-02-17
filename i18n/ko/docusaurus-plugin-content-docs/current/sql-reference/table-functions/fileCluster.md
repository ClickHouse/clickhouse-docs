---
description: '클러스터 내 여러 노드에서 지정된 경로와 일치하는 파일을 동시에 처리할 수 있도록 합니다. 이니시에이터가 워커 노드에 대한 연결을 설정하고, 파일 경로의 glob 패턴을 확장한 뒤, 파일 읽기 작업을 워커 노드에 위임합니다. 각 워커 노드는 처리할 다음 파일을 요청하기 위해 이니시에이터에 쿼리를 보내며, 모든 작업이 완료될 때까지(모든 파일이 읽힐 때까지) 이를 반복합니다.'
sidebar_label: 'fileCluster'
sidebar_position: 61
slug: /sql-reference/table-functions/fileCluster
title: 'fileCluster'
doc_type: 'reference'
---



# fileCluster 테이블 함수 \{#filecluster-table-function\}

클러스터 내 여러 노드에서 지정된 경로와 일치하는 파일을 동시에 처리할 수 있도록 합니다. 이니시에이터가 워커 노드에 대한 연결을 설정하고, 파일 경로의 glob 패턴을 확장한 뒤, 파일 읽기 작업을 워커 노드에 위임합니다. 각 워커 노드는 처리할 다음 파일을 요청하기 위해 이니시에이터에 요청을 보내며, 모든 작업이 완료될 때까지(모든 파일이 읽힐 때까지) 이 과정을 반복합니다.

:::note    
이 함수는 처음 지정한 경로와 일치하는 파일 집합이 모든 노드에서 동일하고, 그 내용이 노드 간에 일관된 경우에만 _올바르게_ 동작합니다.  
이 파일들이 노드마다 다를 경우, 반환값은 사전에 결정할 수 없으며 워커 노드가 이니시에이터에 작업을 요청하는 순서에 따라 달라집니다.
:::



## 구문 \{#syntax\}

```sql
fileCluster(cluster_name, path[, format, structure, compression_method])
```


## Arguments \{#arguments\}

| Argument             | Description                                                                                                                                                                        |
|----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`       | 원격 및 로컬 서버에 대한 주소와 연결 파라미터 집합을 구성하는 데 사용되는 클러스터 이름입니다.                                                                                      |
| `path`               | [user_files_path](/operations/server-configuration-parameters/settings.md#user_files_path)로부터의 파일 상대 경로입니다. 파일 경로는 [globs](#globs-in-path)도 지원합니다.          |
| `format`             | 파일의 [Format](/sql-reference/formats)입니다. 유형: [String](../../sql-reference/data-types/string.md)입니다.                                                                      |
| `structure`          | `'UserID UInt64, Name String'` 형식의 테이블 구조입니다. 컬럼 이름과 유형을 결정합니다. 유형: [String](../../sql-reference/data-types/string.md)입니다.                             |
| `compression_method` | 압축 방법입니다. 지원되는 압축 유형은 `gz`, `br`, `xz`, `zst`, `lz4`, `bz2`입니다.                                                                                                  |



## 반환 값 \{#returned_value\}

지정한 형식과 구조를 가지며, 지정한 경로와 일치하는 파일에서 읽어온 데이터를 포함하는 테이블입니다.

**예시**

`my_cluster`라는 이름의 클러스터와 `user_files_path` 설정의 다음 값이 주어졌다고 가정합니다.

```bash
$ grep user_files_path /etc/clickhouse-server/config.xml
    <user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

또한 각 클러스터 노드의 `user_files_path` 안에 `test1.csv`와 `test2.csv` 파일이 있고, 노드 간에 이들 파일의 내용이 모두 동일하다고 가정하면:

```bash
$ cat /var/lib/clickhouse/user_files/test1.csv
    1,"file1"
    11,"file11"

$ cat /var/lib/clickhouse/user_files/test2.csv
    2,"file2"
    22,"file22"
```

예를 들어, 클러스터의 각 노드에서 다음 두 개의 쿼리를 실행하면 이러한 파일을 생성할 수 있습니다.

```sql
INSERT INTO TABLE FUNCTION file('file1.csv', 'CSV', 'i UInt32, s String') VALUES (1,'file1'), (11,'file11');
INSERT INTO TABLE FUNCTION file('file2.csv', 'CSV', 'i UInt32, s String') VALUES (2,'file2'), (22,'file22');
```

이제 `fileCluster` 테이블 FUNCTION을 사용하여 `test1.csv`와 `test2.csv`의 데이터를 읽습니다:

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


## 경로 글롭 패턴 \{#globs-in-path\}

[File](../../sql-reference/table-functions/file.md#globs-in-path) 테이블 함수에서 지원되는 모든 패턴은 FileCluster에서도 동일하게 지원됩니다.



## 관련 항목 \{#related\}

- [file 테이블 함수](../../sql-reference/table-functions/file.md)
