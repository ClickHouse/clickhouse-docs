---
'description': 'Log engine family에 대한 문서'
'sidebar_label': '로그 패밀리'
'sidebar_position': 20
'slug': '/engines/table-engines/log-family/'
'title': '로그 엔진 패밀리'
'doc_type': 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 로그 테이블 엔진 패밀리

<CloudNotSupportedBadge/>

이 엔진은 약 100만 행까지의 많은 작은 테이블을 신속하게 기록하고 나중에 이를 전체로 읽어야 하는 시나리오를 위해 개발되었습니다.

패밀리 엔진:

| 로그 엔진                                                         |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 패밀리 테이블 엔진은 [HDFS](/engines/table-engines/integrations/hdfs) 또는 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 분산 파일 시스템에 데이터를 저장할 수 있습니다.

:::warning 이 엔진은 로그 데이터에 적합하지 않습니다.
이름과는 달리, *로그 테이블 엔진은 로그 데이터의 저장을 목적으로 하지 않습니다. 신속하게 기록해야 하는 소량의 데이터에만 사용해야 합니다.
:::

## 일반 속성 {#common-properties}

엔진:

- 디스크에 데이터를 저장합니다.

- 작성 시 파일 끝에 데이터를 추가합니다.

- 동시 데이터 접근을 위한 잠금을 지원합니다.

    `INSERT` 쿼리 동안 테이블이 잠기며, 데이터 읽기 및 쓰기 쿼리는 모두 테이블 잠금을 기다립니다. 데이터 쓰기 쿼리가 없다면, 데이터 읽기 쿼리는 동시에 여러 개 수행될 수 있습니다.

- [변경](/sql-reference/statements/alter#mutations)을 지원하지 않습니다.

- 인덱스를 지원하지 않습니다.

    이는 데이터 범위에 대한 `SELECT` 쿼리가 효율적이지 않다는 것을 의미합니다.

- 데이터를 원자적으로 기록하지 않습니다.

    쓰기 작업이 중단되면(예: 비정상적인 서버 종료), 손상된 데이터를 가진 테이블이 생성될 수 있습니다.

## 차이점 {#differences}

`TinyLog` 엔진은 패밀리에서 가장 간단하며 기능과 효율성이 가장 떨어집니다. `TinyLog` 엔진은 단일 쿼리에서 여러 스레드에 의한 병행 데이터 읽기를 지원하지 않습니다. 이 엔진은 병행 읽기를 지원하는 다른 엔진보다 데이터를 더 느리게 읽으며, 각 컬럼을 별도의 파일에 저장하기 때문에 `Log` 엔진과 거의 같은 수의 파일 디스크립터를 사용합니다. 간단한 시나리오에서만 사용해야 합니다.

`Log` 및 `StripeLog` 엔진은 병행 데이터 읽기를 지원합니다. 데이터를 읽을 때 ClickHouse는 여러 스레드를 사용합니다. 각 스레드는 별도의 데이터 블록을 처리합니다. `Log` 엔진은 테이블의 각 컬럼에 대해 별도의 파일을 사용합니다. `StripeLog`는 모든 데이터를 하나의 파일에 저장합니다. 결과적으로, `StripeLog` 엔진은 더 적은 수의 파일 디스크립터를 사용하지만, `Log` 엔진은 데이터를 읽을 때 더 높은 효율성을 제공합니다.
