---
'description': 'ClickHouse 플레이그라운드는 사람들이 서버나 클러스터를 설정하지 않고 즉시 쿼리를 실행하여 ClickHouse를
  실험할 수 있게 해줍니다.'
'keywords':
- 'clickhouse'
- 'playground'
- 'getting'
- 'started'
- 'docs'
'sidebar_label': 'ClickHouse playground'
'slug': '/getting-started/playground'
'title': 'ClickHouse Playground'
'doc_type': 'guide'
---


# ClickHouse 플레이그라운드

[ClickHouse 플레이그라운드](https://sql.clickhouse.com)는 사용자가 서버나 클러스터를 설정하지 않고 쿼리를 즉시 실행하여 ClickHouse를 실험할 수 있게 합니다. 플레이그라운드에서는 몇 가지 예제 데이터셋을 사용할 수 있습니다.

사용자는 [curl](https://curl.haxx.se) 또는 [wget](https://www.gnu.org/software/wget/)과 같은 HTTP 클라이언트를 사용하여 플레이그라운드에 쿼리를 실행하거나, [JDBC](../interfaces/jdbc.md) 또는 [ODBC](../interfaces/odbc.md) 드라이버를 사용하여 연결을 설정할 수 있습니다. ClickHouse를 지원하는 소프트웨어 제품에 대한 자세한 정보는 [여기](../integrations/index.mdx)에서 확인할 수 있습니다.

## 자격 증명 {#credentials}

| 매개변수           | 값                              |
|:--------------------|:-----------------------------------|
| HTTPS 엔드포인트      | `https://play.clickhouse.com:443/` |
| 네이티브 TCP 엔드포인트 | `play.clickhouse.com:9440`         |
| 사용자                | `explorer` 또는 `play`               |
| 비밀번호            | (비어 있음)                            |

## 제한 사항 {#limitations}

쿼리는 읽기 전용 사용자로 실행됩니다. 이는 몇 가지 제한 사항을 의미합니다:

- DDL 쿼리는 허용되지 않음
- INSERT 쿼리는 허용되지 않음

서비스에는 사용량에 대한 쿼터도 있습니다.

## 예제 {#examples}

`curl`을 사용한 HTTPS 엔드포인트 예제:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)를 사용한 TCP 엔드포인트 예제:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```

## 플레이그라운드 사양 {#specifications}

우리 ClickHouse 플레이그라운드는 다음 사양으로 실행되고 있습니다:

- 미국 중앙 지역(US-Central-1)의 Google Cloud (GCE)에서 호스팅
- 3개의 복제본 구성
- 각각 256 GiB의 저장소와 59개의 가상 CPU.
