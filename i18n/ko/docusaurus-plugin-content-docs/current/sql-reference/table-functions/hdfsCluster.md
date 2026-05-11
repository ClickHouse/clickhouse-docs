---
description: '지정된 클러스터 내 여러 노드에서 HDFS 파일을 병렬로 처리할 수 있도록 합니다.'
sidebar_label: 'hdfsCluster'
sidebar_position: 81
slug: /sql-reference/table-functions/hdfsCluster
title: 'hdfsCluster'
doc_type: 'reference'
---



# hdfsCluster 테이블 함수 \{#hdfscluster-table-function\}

지정된 클러스터의 여러 노드에서 HDFS 파일을 병렬로 처리할 수 있습니다. 이니시에이터에서는 클러스터의 모든 노드에 대한 연결을 생성하고, HDFS 파일 경로의 와일드카드(*)를 확장한 뒤 각 파일을 동적으로 분배합니다. 워커 노드에서는 처리할 다음 작업에 대해 이니시에이터에 질의하고 해당 작업을 처리합니다. 이 과정은 모든 작업이 완료될 때까지 반복됩니다.



## 구문 \{#syntax\}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```


## 인자 \{#arguments\}

| Argument       | Description                                                                                                                                                                                                                                                                                      |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | 원격 및 로컬 서버에 대한 주소와 연결 매개변수 집합을 구성하는 데 사용되는 클러스터 이름입니다.                                                                                                                                                                                |
| `URI`          | 하나의 파일 또는 여러 개의 파일에 대한 URI입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{'abc','def'}` 및 `{N..M}` (여기서 `N`, `M`은 숫자이고, `abc`, `def`는 문자열입니다). 자세한 내용은 [경로에서 와일드카드 사용](../../engines/table-engines/integrations/s3.md#wildcards-in-path)을 참고하십시오. |
| `format`       | 파일의 [format](/sql-reference/formats)입니다.                                                                                                                                                                                                                                                |
| `structure`    | 테이블의 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                                                                                                                    |



## 반환 값 \{#returned_value\}

지정한 파일에서 데이터를 읽기 위한 지정된 구조의 테이블입니다.



## 예제 \{#examples\}

1. `cluster_simple`이라는 이름의 ClickHouse 클러스터가 있고, HDFS에 다음 URI를 갖는 여러 파일이 있다고 가정합니다:

* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/some&#95;dir/some&#95;file&#95;3&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;1&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;2&#39;
* &#39;hdfs://hdfs1:9000/another&#95;dir/some&#95;file&#95;3&#39;

2. 이 파일들에 있는 행 수를 조회합니다:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3. 이 두 디렉터리의 모든 파일에 있는 행의 개수를 조회합니다.

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
파일 목록에 앞자리에 0이 포함된 숫자 범위가 있는 경우, 각 자릿수마다 중괄호를 따로 사용하는 방식으로 지정하거나 `?`를 사용하십시오.
:::


## 관련 항목 \{#related\}

- [HDFS 엔진](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 테이블 함수](../../sql-reference/table-functions/hdfs.md)
