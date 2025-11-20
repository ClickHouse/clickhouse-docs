---
'title': 'clickhouse-local 데이터베이스 사용하기'
'sidebar_label': 'clickhouse-local 데이터베이스 사용하기'
'slug': '/chdb/guides/clickhouse-local'
'description': 'chDB와 함께 clickhouse-local 데이터베이스를 사용하는 방법을 배웁니다.'
'keywords':
- 'chdb'
- 'clickhouse-local'
'doc_type': 'guide'
---

[clickhouse-local](/operations/utilities/clickhouse-local)는 ClickHouse의 내장 버전이 포함된 CLI입니다.  
사용자가 서버를 설치하지 않고도 ClickHouse의 기능을 사용할 수 있도록 해줍니다.  
이번 가이드에서는 chDB에서 clickhouse-local 데이터베이스를 사용하는 방법을 배워보겠습니다.

## 설정 {#setup}

먼저 가상 환경을 생성해 보겠습니다:

```bash
python -m venv .venv
source .venv/bin/activate
```

이제 chDB를 설치하겠습니다.  
버전 2.0.2 이상이 설치되어 있는지 확인하세요:

```bash
pip install "chdb>=2.0.2"
```

그리고 [ipython](https://ipython.org/)을 설치하겠습니다:

```bash
pip install ipython
```

가이드의 나머지 부분에서 사용할 명령을 실행하기 위해 `ipython`을 사용할 것입니다.  
`ipython`을 실행하려면 다음을 입력하세요:

```bash
ipython
```

## clickhouse-local 설치 {#installing-clickhouse-local}

clickhouse-local의 다운로드 및 설치는 [ClickHouse 다운로드 및 설치](/install)와 동일합니다.  
다음 명령을 실행하여 이를 수행할 수 있습니다:

```bash
curl https://clickhouse.com/ | sh
```

데이터를 디렉터리에 지속적으로 저장하는 clickhouse-local을 실행하려면 `--path`를 전달해야 합니다:

```bash
./clickhouse -m --path demo.chdb
```

## clickhouse-local에 데이터 수집하기 {#ingesting-data-into-clickhouse-local}

기본 데이터베이스는 메모리에만 데이터를 저장하므로, 우리가 수집하는 데이터가 디스크에 지속적으로 저장되도록 명명된 데이터베이스를 생성해야 합니다.

```sql
CREATE DATABASE foo;
```

테이블을 생성하고 일부 랜덤 숫자를 삽입해 보겠습니다:

```sql
CREATE TABLE foo.randomNumbers
ORDER BY number AS
SELECT rand() AS number
FROM numbers(10_000_000);
```

어떤 데이터가 있는지 확인하기 위해 쿼리를 작성해 보겠습니다:

```sql
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers

┌─quants────────────────────────────────┐
│ [69,2147776478,3221525118,4252096960] │
└───────────────────────────────────────┘
```

이 작업을 완료한 후에는 CLI에서 `exit;`를 입력하세요.  
이 디렉터리에 대한 잠금은 하나의 프로세스만 보유할 수 있기 때문입니다.  
이 작업을 수행하지 않으면 chDB에서 데이터베이스에 연결하려 할 때 다음 오류가 발생합니다:

```text
ChdbError: Code: 76. DB::Exception: Cannot lock file demo.chdb/status. Another server instance in same directory is already running. (CANNOT_OPEN_FILE)
```

## clickhouse-local 데이터베이스에 연결하기 {#connecting-to-a-clickhouse-local-database}

`ipython` 셸로 돌아가서 chDB에서 `session` 모듈을 가져옵니다:

```python
from chdb import session as chs
```

`demo..chdb`를 가리키는 세션을 초기화합니다:

```python
sess = chs.Session("demo.chdb")
```

그런 다음 숫자의 분위수를 반환하는 동일한 쿼리를 실행할 수 있습니다:

```python
sess.query("""
SELECT quantilesExact(0, 0.5, 0.75, 0.99)(number) AS quants
FROM foo.randomNumbers
""", "Vertical")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

chDB에서 이 데이터베이스에 데이터를 삽입할 수도 있습니다:

```python
sess.query("""
INSERT INTO foo.randomNumbers
SELECT rand() AS number FROM numbers(10_000_000)
""")

Row 1:
──────
quants: [0,9976599,2147776478,4209286886]
```

그런 다음 chDB 또는 clickhouse-local에서 분위수 쿼리를 다시 실행할 수 있습니다.
