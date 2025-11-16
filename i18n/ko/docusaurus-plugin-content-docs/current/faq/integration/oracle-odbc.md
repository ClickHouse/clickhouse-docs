---
'slug': '/faq/integration/oracle-odbc'
'title': 'Oracle를 ODBC를 이용해 사용할 때 인코딩에 문제가 발생하면 어떻게 해야 하나요?'
'toc_hidden': true
'toc_priority': 20
'description': '이 페이지는 Oracle를 ODBC를 통해 사용할 때 인코딩에 문제가 발생할 경우 어떻게 해야 하는지 안내합니다.'
'doc_type': 'guide'
'keywords':
- 'oracle'
- 'odbc'
- 'encoding'
- 'integration'
- 'external dictionary'
---


# Oracle ODBC 사용 시 인코딩 문제 시 어떻게 해야 하나요? {#oracle-odbc-encodings}

Oracle ODBC 드라이버를 통해 ClickHouse 외부 딕셔너리의 소스로 Oracle을 사용하는 경우, `/etc/default/clickhouse` 파일에서 `NLS_LANG` 환경 변수에 대해 올바른 값을 설정해야 합니다. 더 많은 정보는 [Oracle NLS_LANG FAQ](https://www.oracle.com/technetwork/products/globalization/nls-lang-099431.html)를 참조하세요.

**예시**

```sql
NLS_LANG=RUSSIAN_RUSSIA.UTF8
```
