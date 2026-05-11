---
description: '이 엔진은 Amazon S3에 있는 기존 Delta Lake 테이블과 읽기 전용 연동을 제공합니다.'
sidebar_label: 'DeltaLake'
sidebar_position: 40
slug: /engines/table-engines/integrations/deltalake
title: 'DeltaLake 테이블 엔진'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# DeltaLake 테이블 엔진 \{#deltalake-table-engine\}

이 엔진은 S3, GCP 및 Azure 스토리지에 존재하는 기존 [Delta Lake](https://github.com/delta-io/delta) 테이블과의 통합을 제공하며, v25.10부터 읽기와 쓰기 작업을 모두 지원합니다.

## DeltaLake 테이블 생성 \{#create-table\}

DeltaLake 테이블을 생성하려면 해당 테이블이 이미 S3, GCP 또는 Azure 스토리지에 존재하고 있어야 합니다. 아래 명령들은 새로운 테이블을 생성하기 위한 DDL 매개변수를 지원하지 않습니다.

<Tabs>
  <TabItem value="S3" label="S3" default>
    **구문**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(url, [aws_access_key_id, aws_secret_access_key,] [extra_credentials])
    ```

    **엔진 파라미터**

    * `url` — 기존 Delta Lake 테이블 경로가 포함된 버킷 URL입니다.
    * `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/) 계정 사용자에 대한 장기 자격 증명입니다. 이를 사용하여 요청을 인증할 수 있습니다. 이 파라미터는 선택 사항입니다. 자격 증명을 지정하지 않으면 설정 파일에 있는 값이 사용됩니다.
    * `extra_credentials` - 선택 사항입니다. ClickHouse Cloud에서 역할 기반 액세스를 위한 `role_arn`을 전달하는 데 사용됩니다. 구성 단계는 [Secure S3](/cloud/data-sources/secure-s3)를 참조하십시오.

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
  </TabItem>

  <TabItem value="GCP" label="GCP" default>
    **구문**

    ```sql
    -- HTTPS URL 사용 (권장)
    CREATE TABLE table_name
    ENGINE = DeltaLake('https://storage.googleapis.com/<bucket>/<path>/', '<access_key_id>', '<secret_access_key>')
    ```

    :::note[Unsupported gsutil URI]
    `gs://clickhouse-docs-example-bucket` 과 같은 gsutil URI는 지원되지 않습니다. `https://storage.googleapis.com` 로 시작하는 URL을 사용해야 합니다.
    :::

    **인자**

    * `url` — Delta Lake 테이블이 위치한 GCS 버킷 URL입니다. `https://storage.googleapis.com/<bucket>/<path>/`
      형식(GCS XML API 엔드포인트)을 사용해야 하며, `gs://<bucket>/<path>/` 형식은 자동 변환됩니다.
    * `access_key_id` — GCS Access Key입니다. Google Cloud Console → Cloud Storage → Settings → Interoperability에서 생성합니다.
    * `secret_access_key` — GCS secret입니다.

    **Named collections**

    Named collections도 사용할 수 있습니다.
    예를 들어:

    ```sql
    CREATE NAMED COLLECTION gcs_creds AS
    access_key_id = '<access_key>',
    secret_access_key = '<secret>';

    CREATE TABLE gcpDeltaLake
    ENGINE = DeltaLake(gcs_creds, url = 'https://storage.googleapis.com/<bucket>/<path>')
    ```
  </TabItem>

  <TabItem value="Azure" label="Azure" default>
    **구문**

    ```sql
    CREATE TABLE table_name
    ENGINE = DeltaLake(connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression])
    ```

    **인자**

    * `connection_string` — Azure 연결 문자열
    * `storage_account_url` — Azure 스토리지 계정 URL (예: https://account.blob.core.windows.net)
    * `container_name` — Azure 컨테이너 이름
    * `blobpath` — 컨테이너 내 Delta Lake 테이블 경로
    * `account_name` — Azure 스토리지 계정 이름
    * `account_key` — Azure 스토리지 계정 키
  </TabItem>
</Tabs>

## DeltaLake 테이블을 사용한 데이터 쓰기 \{#insert-data\}

DeltaLake 테이블 엔진을 사용해 테이블을 생성한 후에는 다음과 같이 데이터를 삽입할 수 있습니다:

```sql
SET allow_experimental_delta_lake_writes = 1;

INSERT INTO deltalake(id, firstname, lastname, gender, age)
VALUES (1, 'John', 'Smith', 'M', 32);
```

:::note
테이블 엔진을 사용한 쓰기 작업은 delta kernel을 통해서만 지원됩니다.
Azure로의 쓰기는 아직 지원되지 않지만, S3 및 GCS에는 지원됩니다.
:::


### 데이터 캐시 \{#data-cache\}

`DeltaLake` 테이블 엔진과 테이블 함수는 `S3`, `AzureBlobStorage`, `HDFS` 스토리지와 동일한 방식으로 데이터 캐싱을 지원합니다. 자세한 내용은 ["S3 테이블 엔진"](../../../engines/table-engines/integrations/s3.md#data-cache)을 참조하십시오.

## 함께 보기 \{#see-also\}

- [deltaLake 테이블 함수](../../../sql-reference/table-functions/deltalake.md)