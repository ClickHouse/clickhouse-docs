---
'description': 'ClickHouse는 쿼리 처리를 위해 필요한 데이터를 서버에 전송할 수 있게 해주며, 이를 `SELECT` 쿼리와 함께
  전송합니다. 이 데이터는 임시 테이블에 저장되며 쿼리 내에서 사용될 수 있습니다 (예: `IN` 연산자에서).'
'sidebar_label': '쿼리 처리를 위한 외부 데이터'
'sidebar_position': 130
'slug': '/engines/table-engines/special/external-data'
'title': '쿼리 처리를 위한 외부 데이터'
'doc_type': 'reference'
---


# 쿼리 처리를 위한 외부 데이터

ClickHouse는 쿼리 처리를 위해 필요한 데이터를 `SELECT` 쿼리와 함께 서버에 전송하는 것을 허용합니다. 이 데이터는 임시 테이블에 저장되며(“임시 테이블” 섹션 참조) 쿼리에서 사용할 수 있습니다(예: `IN` 연산자에서).

예를 들어, 중요한 사용자 식별자가 포함된 텍스트 파일이 있는 경우, 이 목록으로 필터링하는 쿼리와 함께 서버에 업로드할 수 있습니다.

많은 양의 외부 데이터로 여러 쿼리를 실행해야 하는 경우, 이 기능을 사용하지 않는 것이 좋습니다. 데이터를 미리 DB에 업로드하는 것이 좋습니다.

외부 데이터는 명령 줄 클라이언트(비대화형 모드) 또는 HTTP 인터페이스를 사용하여 업로드할 수 있습니다.

명령 줄 클라이언트에서, 아래 형식으로 매개변수 섹션을 지정할 수 있습니다.

```bash
--external --file=... [--name=...] [--format=...] [--types=...|--structure=...]
```

전송되는 테이블 수에 따라 여러 섹션을 가질 수 있습니다.

**–external** – 절의 시작을 표시합니다.  
**–file** – 테이블 덤프가 있는 파일의 경로 또는 표준 입력을 참조하는 -입니다.  
표준 입력에서 단일 테이블만 읽을 수 있습니다.

다음 매개변수는 선택 사항입니다: **–name** – 테이블의 이름. 생략하면 _data가 사용됩니다.  
**–format** – 파일의 데이터 형식. 생략하면 TabSeparated가 사용됩니다.

다음 매개변수 중 하나는 필수입니다: **–types** – 쉼표로 구분된 컬럼 타입의 목록. 예: `UInt64,String`. 컬럼은 _1, _2,...로 명명됩니다.  
**–structure** – `UserID UInt64`, `URL String` 형식의 테이블 구조입니다. 컬럼 이름과 타입을 정의합니다.

'file'에 지정된 파일은 'format'에서 지정한 형식에 따라 구문 분석되며, 'types' 또는 'structure'에서 지정한 데이터 유형을 사용합니다. 테이블은 서버에 업로드되며 'name'에 있는 이름으로 임시 테이블로 접근할 수 있습니다.

예시:

```bash
$ echo -ne "1\n2\n3\n" | clickhouse-client --query="SELECT count() FROM test.visits WHERE TraficSourceID IN _data" --external --file=- --types=Int8
849897
$ cat /etc/passwd | sed 's/:/\t/g' | clickhouse-client --query="SELECT shell, count() AS c FROM passwd GROUP BY shell ORDER BY c DESC" --external --file=- --name=passwd --structure='login String, unused String, uid UInt16, gid UInt16, comment String, home String, shell String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

HTTP 인터페이스를 사용할 때 외부 데이터는 multipart/form-data 형식으로 전달됩니다. 각 테이블은 별도의 파일로 전송됩니다. 테이블 이름은 파일 이름에서 가져옵니다. `query_string`은 매개변수 `name_format`, `name_types`, `name_structure`를 전달하며, 여기서 `name`은 이러한 매개변수와 관련된 테이블의 이름입니다. 매개변수의 의미는 명령 줄 클라이언트를 사용할 때와 동일합니다.

예시:

```bash
$ cat /etc/passwd | sed 's/:/\t/g' > passwd.tsv

$ curl -F 'passwd=@passwd.tsv;' 'http://localhost:8123/?query=SELECT+shell,+count()+AS+c+FROM+passwd+GROUP+BY+shell+ORDER+BY+c+DESC&passwd_structure=login+String,+unused+String,+uid+UInt16,+gid+UInt16,+comment+String,+home+String,+shell+String'
/bin/sh 20
/bin/false      5
/bin/bash       4
/usr/sbin/nologin       1
/bin/sync       1
```

분산 쿼리 처리를 위해 임시 테이블은 모든 원격 서버로 전송됩니다.
