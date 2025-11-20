---
'description': '이 엔진은 Amazon S3에서 기존 Delta Lake 테이블과의 읽기 전용 통합을 제공합니다.'
'sidebar_label': 'DeltaLake'
'sidebar_position': 40
'slug': '/engines/table-engines/integrations/deltalake'
'title': 'DeltaLake 테이블 엔진'
'doc_type': 'reference'
---


# DeltaLake 테이블 엔진

이 엔진은 Amazon S3에 있는 기존 [Delta Lake](https://github.com/delta-io/delta) 테이블과의 읽기 전용 통합을 제공합니다.

## 테이블 생성 {#create-table}

Delta Lake 테이블은 S3에 이미 존재해야 하며, 이 명령은 새로운 테이블을 생성하기 위한 DDL 매개변수를 사용하지 않습니다.

```sql
CREATE TABLE deltalake
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**엔진 매개변수**

- `url` — 기존 Delta Lake 테이블의 경로가 포함된 버킷 URL입니다.
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 계정 사용자의 장기 자격 증명입니다. 이들은 요청을 인증하는 데 사용할 수 있습니다. 매개변수는 선택 사항입니다. 자격 증명이 지정되지 않은 경우, 구성 파일에서 사용됩니다.

엔진 매개변수는 [Named Collections](/operations/named-collections.md)를 사용하여 지정할 수 있습니다.

**예시**

```sql
CREATE TABLE deltalake ENGINE=DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

명명된 컬렉션 사용:

```xml
<clickhouse>
    <named_collections>
        <deltalake_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </deltalake_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE deltalake ENGINE=DeltaLake(deltalake_conf, filename = 'test_table')
```

### 데이터 캐시 {#data-cache}

`Iceberg` 테이블 엔진과 테이블 함수는 `S3`, `AzureBlobStorage`, `HDFS` 저장소와 동일하게 데이터 캐싱을 지원합니다. [여기서](../../../engines/table-engines/integrations/s3.md#data-cache) 확인하세요.

## 또한 보기 {#see-also}

- [deltaLake 테이블 함수](../../../sql-reference/table-functions/deltalake.md)
