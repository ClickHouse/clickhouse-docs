---
description: '이 엔진은 Amazon S3에 있는 기존 Delta Lake 테이블과 읽기 전용 연동을 제공합니다.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake 테이블 엔진'
doc_type: 'reference'
---

# DeltaLake 테이블 엔진 \{#deltalake-table-engine\}

이 엔진은 Amazon S3에 존재하는 기존 [Delta Lake](https://github.com/delta-io/delta) 테이블과의 통합을 제공하며, v25.10부터 읽기와 쓰기 작업을 모두 지원합니다.

## 테이블 생성 \{#create-table\}

Delta Lake 테이블은 이미 S3에 존재하고 있어야 하며, 이 명령은 새로운 테이블을 생성하기 위한 DDL 매개변수를 지원하지 않습니다.

```sql
CREATE TABLE deltalake
ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,])
```

**엔진 파라미터**

* `url` — 기존 Delta Lake 테이블 경로가 포함된 버킷 URL입니다.
* `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명입니다. 이를 사용하여 요청을 인증할 수 있습니다. 이 파라미터는 선택 사항입니다. 자격 증명을 지정하지 않으면 설정 파일에 있는 값이 사용됩니다.

엔진 파라미터는 [Named Collections](/operations/named-collections.md)를 사용하여 지정할 수 있습니다.

**예제**

```sql
CREATE TABLE deltalake
ENGINE = DeltaLake('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

이름이 지정된 컬렉션 사용:

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
CREATE TABLE deltalake
ENGINE = DeltaLake(deltalake_conf, filename = 'test_table')
```


### 데이터 캐시 \{#data-cache\}

`DeltaLake` 테이블 엔진과 테이블 함수는 `S3`, `AzureBlobStorage`, `HDFS` 스토리지와 동일한 방식으로 데이터 캐싱을 지원합니다. 자세한 내용은 [여기](../../../engines/table-engines/integrations/s3.md#data-cache)를 참조하십시오.

## 데이터 삽입 \{#insert-data\}

DeltaLake 테이블 엔진을 사용해 테이블을 생성한 후에는 다음과 같이 데이터를 삽입할 수 있습니다:

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```


## 함께 보기 \{#see-also\}

- [deltaLake 테이블 함수](../../../sql-reference/table-functions/deltalake.md)