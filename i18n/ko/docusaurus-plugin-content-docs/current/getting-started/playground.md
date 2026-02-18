---
description: 'ClickHouse Playground는 사용자가 서버나 클러스터를 별도로 설정하지 않고도 즉시 쿼리를 실행하여 ClickHouse를 체험해 볼 수 있게 해 줍니다.'
keywords: ['clickhouse', 'playground', 'getting', 'started', 'docs']
sidebar_label: 'ClickHouse Playground'
slug: /getting-started/playground
title: 'ClickHouse Playground'
doc_type: 'guide'
---

# ClickHouse Playground \{#clickhouse-playground\}

[ClickHouse Playground](https://sql.clickhouse.com)은 서버나 클러스터를 직접 설정하지 않고도 즉시 쿼리를 실행하여 ClickHouse를 손쉽게 체험할 수 있게 해줍니다.
Playground에는 여러 예제 데이터셋이 제공됩니다.

HTTP 클라이언트(예: [curl](https://curl.haxx.se) 또는 [wget](https://www.gnu.org/software/wget/))를 사용해 Playground에 쿼리를 전송하거나 [JDBC](/interfaces/jdbc) 또는 [ODBC](/interfaces/odbc) 드라이버를 사용해 연결을 설정할 수 있습니다. ClickHouse를 지원하는 소프트웨어 제품에 대한 추가 정보는 [여기](../integrations/index.mdx)에서 확인할 수 있습니다.

## 자격 증명 정보 \{#credentials\}

| 매개변수             | 값                                 |
|:--------------------|:-----------------------------------|
| HTTPS 엔드포인트      | `https://play.clickhouse.com:443/` |
| 네이티브 TCP 엔드포인트 | `play.clickhouse.com:9440`         |
| 사용자                | `explorer` 또는 `play`              |
| 비밀번호              | (없음)                              |

## 제한 사항 \{#limitations\}

쿼리는 읽기 전용 사용자 권한으로 실행됩니다. 이로 인해 다음과 같은 제한이 있습니다.

- DDL 쿼리는 허용되지 않습니다.
- INSERT 쿼리는 허용되지 않습니다.

서비스 사용량에는 QUOTA도 적용됩니다.

## 예제 \{#examples\}

`curl`을 사용한 HTTPS 엔드포인트 예제:

```bash
curl "https://play.clickhouse.com/?user=explorer" --data-binary "SELECT 'Play ClickHouse'"
```

[CLI](../interfaces/cli.md)를 사용하는 TCP 엔드포인트 예제:

```bash
clickhouse client --secure --host play.clickhouse.com --user explorer
```


## Playground specifications \{#specifications\}

ClickHouse Playground는 다음과 같은 사양으로 실행됩니다:

- 미국 중부 리전(US-Central-1)의 Google Cloud(GCE)에서 호스팅됩니다.
- 3개의 레플리카 구성입니다.
- 각 인스턴스당 256 GiB 스토리지와 59개의 vCPU입니다.