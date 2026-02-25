---
description: 'Log 엔진 계열에 대한 문서'
sidebar_label: 'Log 계열'
sidebar_position: 20
slug: /engines/table-engines/log-family/
title: 'Log 엔진 계열'
doc_type: 'guide'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# Log 테이블 엔진 계열 \{#log-table-engine-family\}

<CloudNotSupportedBadge/>

이 엔진은 많은 작은 테이블(약 100만 행까지)을 빠르게 기록하고, 이후 전체를 한 번에 읽어야 하는 시나리오를 위해 개발되었습니다.

이 계열에 속하는 엔진은 다음과 같습니다.

| Log 엔진                                                             |
|---------------------------------------------------------------------|
| [StripeLog](/engines/table-engines/log-family/stripelog.md) |
| [Log](/engines/table-engines/log-family/log.md)             |
| [TinyLog](/engines/table-engines/log-family/tinylog.md)     |

`Log` 계열 테이블 엔진은 데이터를 [HDFS](/engines/table-engines/integrations/hdfs) 또는 [S3](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-s3) 분산 파일 시스템에 저장할 수 있습니다.

:::warning 이 엔진은 로그 데이터용이 아닙니다.
이름과는 달리, *Log 테이블 엔진은 로그 데이터를 저장하기 위한 용도로 설계된 것이 아닙니다.* 빠르게 기록해야 하는 소량의 데이터에만 사용해야 합니다.
:::



## 공통 속성 \{#common-properties\}

엔진:

- 데이터를 디스크에 저장합니다.

- 데이터를 쓸 때 파일 끝에 데이터를 추가합니다.

- 동시 데이터 접근을 위한 잠금을 지원합니다.

    `INSERT` 쿼리를 수행하는 동안에는 테이블이 잠기며, 데이터 읽기 및 쓰기를 위한 다른 쿼리는 모두 테이블 잠금이 해제될 때까지 대기합니다. 데이터 쓰기 쿼리가 없는 경우, 데이터 읽기 쿼리는 얼마든지 동시에 수행될 수 있습니다.

- [뮤테이션](/sql-reference/statements/alter#mutations)을 지원하지 않습니다.

- 인덱스를 지원하지 않습니다.

    이는 데이터 구간에 대한 `SELECT` 쿼리가 효율적이지 않다는 것을 의미합니다.

- 데이터를 원자적으로 쓰지 않습니다.

    예를 들어 서버가 비정상적으로 종료되는 등으로 쓰기 작업이 중단되면 손상된 데이터가 포함된 테이블이 생성될 수 있습니다.



## Differences \{#differences\}

`TinyLog` 엔진은 이 엔진 계열 중 가장 단순하며, 제공하는 기능이 가장 적고 효율성이 가장 낮습니다. `TinyLog` 엔진은 단일 쿼리에서 여러 스레드를 사용하는 병렬 데이터 읽기를 지원하지 않습니다. 단일 쿼리에서 병렬 읽기를 지원하는 동일 계열의 다른 엔진보다 데이터를 더 느리게 읽으며, 각 컬럼을 별도 파일에 저장하기 때문에 `Log` 엔진과 거의 같은 수의 파일 디스크립터를 사용합니다. 단순한 시나리오에서만 사용하십시오.

`Log` 및 `StripeLog` 엔진은 병렬 데이터 읽기를 지원합니다. 데이터를 읽을 때 ClickHouse는 여러 스레드를 사용합니다. 각 스레드는 별도의 데이터 블록을 처리합니다. `Log` 엔진은 테이블의 각 컬럼에 대해 별도 파일을 사용합니다. `StripeLog`는 모든 데이터를 하나의 파일에 저장합니다. 그 결과 `StripeLog` 엔진은 더 적은 파일 디스크립터를 사용하지만, `Log` 엔진이 데이터 읽기 시 더 높은 효율성을 제공합니다.
