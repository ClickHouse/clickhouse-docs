---
description: '지정된 구조로 서버에 전송된 데이터를 다른 구조의 테이블에 효율적으로 변환하여 삽입할 수 있게 해주는 테이블 FUNCTION입니다.'
sidebar_label: 'input'
sidebar_position: 95
slug: /sql-reference/table-functions/input
title: 'input'
doc_type: 'reference'
---

# input Table Function \{#input-table-function\}

`input(structure)` - 특정 구조를 가진 채 서버로 전송된 데이터를 다른 구조의 테이블로 효율적으로 변환하여 삽입할 수 있게 해 주는 테이블 함수입니다.

`structure` - 서버에 전송되는 데이터의 구조로, 다음 형식으로 지정합니다: `'column1_name column1_type, column2_name column2_type, ...'`.
예: `'id UInt32, name String'`.

이 함수는 `INSERT SELECT` 쿼리에서만 사용할 수 있고, 하나의 쿼리 내에서 한 번만 사용할 수 있습니다. 그 외에는 일반적인 테이블 함수와 동일하게 동작합니다
(예를 들어, 서브쿼리에서도 사용할 수 있습니다).

데이터는 일반적인 `INSERT` 쿼리와 마찬가지로 어떤 방식으로든 전송할 수 있으며, 사용 가능한 [format](/sql-reference/formats)
중 하나로 전달되어야 합니다. 이때 쿼리의 끝에 format을 지정해야 한다는 점에서 일반적인 `INSERT SELECT`와는 다릅니다.

이 함수의 주요 특징은, 서버가 클라이언트로부터 데이터를 수신할 때 `SELECT` 절의 표현식 목록에 따라 데이터를 동시에 변환하고
대상 테이블에 삽입한다는 점입니다. 전송된 모든 데이터를 담는 임시 테이블은 생성되지 않습니다.

## 예시 \{#examples\}

* `test` 테이블이 `(a String, b String)`와 같은 구조를
  가지고 있고, `data.csv`의 데이터는 `(col1 String, col2 Date, col3 Int32)`와 같이 다른 구조를 가진다고 가정합니다. `data.csv`의 데이터를 형 변환과 함께 동시에 변환하여 `test` 테이블에 INSERT하는 쿼리는 다음과 같습니다:

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT lower(col1), col3 * col3 FROM input('col1 String, col2 Date, col3 Int32') FORMAT CSV";
```

* `data.csv`에 테이블 `test`와 동일한 구조인 `test_structure`를 가진 데이터가 포함되어 있다면, 다음 두 쿼리는 동일합니다.

{/* */ }

```bash
$ cat data.csv | clickhouse-client --query="INSERT INTO test FORMAT CSV"
$ cat data.csv | clickhouse-client --query="INSERT INTO test SELECT * FROM input('test_structure') FORMAT CSV"
```
