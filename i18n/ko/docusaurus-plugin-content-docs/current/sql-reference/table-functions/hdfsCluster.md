---
'description': '지정된 클러스터의 여러 노드에서 HDFS의 파일을 병렬로 처리할 수 있게 해줍니다.'
'sidebar_label': 'hdfsCluster'
'sidebar_position': 81
'slug': '/sql-reference/table-functions/hdfsCluster'
'title': 'hdfsCluster'
'doc_type': 'reference'
---


# hdfsCluster 테이블 함수

지정된 클러스터의 여러 노드에서 HDFS의 파일을 병렬로 처리할 수 있도록 합니다. initiator는 클러스터의 모든 노드에 대한 연결을 생성하고, HDFS 파일 경로에서 별표를 공개하며, 각 파일을 동적으로 분배합니다. 작업 노드에서는 initiator에게 처리할 다음 작업을 요청하고 이를 처리합니다. 모든 작업이 완료될 때까지 이 과정을 반복합니다.

## 구문 {#syntax}

```sql
hdfsCluster(cluster_name, URI, format, structure)
```

## 인수 {#arguments}

| 인수            | 설명                                                                                                                                                                                                                                                                                        |
|----------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name` | 원격 및 로컬 서버에 대한 주소 및 연결 매개변수를 구축하는 데 사용되는 클러스터의 이름입니다.                                                                                                                                                                                          |
| `URI`          | 파일 또는 다수의 파일에 대한 URI입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{'abc','def'}` 및 `{N..M}` (여기서 `N`, `M`은 숫자, `abc`, `def`는 문자열입니다). 자세한 내용은 [경로 내 와일드카드](../../engines/table-engines/integrations/s3.md#wildcards-in-path)를 참조하십시오. |
| `format`       | 파일의 [형식](/sql-reference/formats)입니다.                                                                                                                                                                                                                                               |
| `structure`    | 테이블의 구조입니다. 형식은 `'column1_name column1_type, column2_name column2_type, ...'`입니다.                                                                                                                                                                                          |

## 반환 값 {#returned_value}

지정된 파일의 데이터를 읽기 위한 지정된 구조의 테이블입니다.

## 예제 {#examples}

1.  `cluster_simple`이라는 ClickHouse 클러스터와 HDFS에 다음 URI를 가진 여러 파일이 있다고 가정해보겠습니다:

- 'hdfs://hdfs1:9000/some_dir/some_file_1'
- 'hdfs://hdfs1:9000/some_dir/some_file_2'
- 'hdfs://hdfs1:9000/some_dir/some_file_3'
- 'hdfs://hdfs1:9000/another_dir/some_file_1'
- 'hdfs://hdfs1:9000/another_dir/some_file_2'
- 'hdfs://hdfs1:9000/another_dir/some_file_3'

2.  이 파일들의 행 수를 쿼리합니다:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/some_file_{1..3}', 'TSV', 'name String, value UInt32')
```

3.  이 두 디렉터리의 모든 파일의 행 수를 쿼리합니다:

```sql
SELECT count(*)
FROM hdfsCluster('cluster_simple', 'hdfs://hdfs1:9000/{some,another}_dir/*', 'TSV', 'name String, value UInt32')
```

:::note
파일 목록에 선행 0이 있는 번호 범위가 포함된 경우, 각 숫자에 대해 중괄호를 사용하여 별도로 생성하거나 `?`를 사용하십시오.
:::

## 관련 {#related}

- [HDFS 엔진](../../engines/table-engines/integrations/hdfs.md)
- [HDFS 테이블 함수](../../sql-reference/table-functions/hdfs.md)
