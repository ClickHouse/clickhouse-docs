---
'description': '이 엔진은 Amazon S3에 있는 기존 Apache Hudi 테이블과의 읽기 전용 통합을 제공합니다.'
'sidebar_label': 'Hudi'
'sidebar_position': 86
'slug': '/engines/table-engines/integrations/hudi'
'title': 'Hudi 테이블 엔진'
'doc_type': 'reference'
---


# Hudi 테이블 엔진

이 엔진은 Amazon S3에 있는 기존 Apache [Hudi](https://hudi.apache.org/) 테이블과의 읽기 전용 통합을 제공합니다.

## 테이블 생성 {#create-table}

Hudi 테이블은 S3에 미리 존재해야 하며, 이 명령은 새 테이블을 생성하기 위한 DDL 매개변수를 사용하지 않습니다.

```sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**엔진 매개변수**

- `url` — 기존 Hudi 테이블에 대한 경로가 포함된 버킷 URL.
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명. 이러한 것을 사용하여 요청을 인증할 수 있습니다. 이 매개변수는 선택 사항입니다. 자격 증명이 지정되지 않은 경우 구성 파일에서 사용됩니다.

엔진 매개변수는 [Named Collections](/operations/named-collections.md)을 사용하여 지정할 수 있습니다.

**예제**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

이름이 지정된 컬렉션 사용:

```xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 또한 보기 {#see-also}

- [hudi 테이블 함수](/sql-reference/table-functions/hudi.md)
