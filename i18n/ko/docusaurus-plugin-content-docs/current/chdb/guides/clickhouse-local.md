---
title: 'clickhouse-local 데이터베이스 사용하기'
sidebar_label: 'clickhouse-local 데이터베이스 사용하기'
slug: /chdb/guides/clickhouse-local
description: 'chDB와 함께 clickhouse-local 데이터베이스를 사용하는 방법을 알아봅니다'
keywords: ['chdb', 'clickhouse-local']
doc_type: 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local)은 ClickHouse가 내장된 CLI 도구입니다.
서버를 설치하지 않고도 ClickHouse의 강력한 기능을 활용할 수 있습니다.
이 가이드에서는 chDB에서 clickhouse-local 데이터베이스를 사용하는 방법을 알아봅니다.

## 설정 \{#setup\}

먼저 가상 환경을 생성합니다.

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다.
2.0.2 이상 버전이 설치되어 있는지 확인하십시오:

```bash
pip install "chdb>=2.0.2"
```

이제 [ipython](https://ipython.org/)을 설치하겠습니다:

```bash
pip install ipython
```

이 가이드의 나머지 부분에서 명령을 실행하기 위해 `ipython`을 사용할 것이며, 다음 명령으로 시작할 수 있습니다:

```bash
ipython
```

## clickhouse-local 설치 \{#installing-clickhouse-local\}

clickhouse-local을 다운로드하고 설치하는 방법은 [ClickHouse 다운로드 및 설치](/install)와 동일합니다.
다음 명령을 실행하면 됩니다:

```bash
curl https://clickhouse.com/ | sh
```

데이터를 디렉터리에 지속적으로 저장하도록 `clickhouse-local`을 실행하려면 `--path` 옵션을 지정해야 합니다:

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-local로 데이터 수집하기 \{#ingesting-data-into-clickhouse-local\}

기본 데이터베이스는 데이터를 메모리에만 저장하므로, 수집한 데이터가 디스크에 영구적으로 저장되도록 하려면 이름이 지정된 데이터베이스를 CREATE해야 합니다.

```sql
CREATE DATABASE foo;
```

테이블을 생성하고 임의의 숫자 몇 개를 삽입합니다:

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

어떤 데이터가 있는지 확인하는 쿼리를 작성해 보겠습니다:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

위 작업을 완료한 후에는 이 디렉터리에 하나의 프로세스만 잠금을 보유할 수 있으므로, 반드시 CLI에서 `exit;` 명령으로 종료해야 합니다.
그렇게 하지 않으면 chDB에서 데이터베이스에 연결을 시도할 때 다음과 같은 오류가 발생합니다:

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-local 데이터베이스에 연결하기 \{#connecting-to-a-clickhouse-local-database\}

`ipython` 셸로 돌아가 chDB에서 `session` 모듈을 가져오십시오:

```python
from chdb import session as chs
```

`demo.chdb`를 대상으로 하는 세션을 초기화합니다:

```python
sess = chs.Session("demo.chdb")
```

이제 숫자에 대한 분위수를 반환하는 같은 쿼리를 실행할 수 있습니다.

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

chDB에서 이 데이터베이스로 데이터도 삽입할 수 있습니다.

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

이제 chDB 또는 clickhouse-local에서 quantiles 쿼리를 다시 실행합니다.
