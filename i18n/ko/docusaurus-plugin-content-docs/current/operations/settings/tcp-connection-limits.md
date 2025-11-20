---
'description': 'TCP 연결 제한.'
'sidebar_label': 'TCP 연결 제한'
'slug': '/operations/settings/tcp-connection-limits'
'title': 'TCP 연결 제한'
'doc_type': 'reference'
---


# TCP 연결 제한

## 개요 {#overview}

ClickHouse TCP 연결(즉, [명령줄 클라이언트](https://clickhouse.com/docs/interfaces/cli)를 통한 연결)은 특정 쿼리 수나 기간 이후에 자동으로 연결이 끊길 수 있습니다. 연결이 끊어진 후에는 자동 재연결이 발생하지 않습니다(명령줄 클라이언트에서 다른 쿼리를 보내는 것과 같은 다른 방법으로 트리거되지 않는 한).

연결 제한은 서버 설정인 `tcp_close_connection_after_queries_num`(쿼리 제한용) 또는 `tcp_close_connection_after_queries_seconds`(지속 시간 제한용)를 0보다 큰 값으로 설정하여 활성화할 수 있습니다. 둘 다 제한이 활성화된 경우, 한쪽 제한이 먼저 도달하면 연결이 종료됩니다.

제한에 도달하여 연결이 끊어질 때, 클라이언트는 `TCP_CONNECTION_LIMIT_REACHED` 예외를 수신하며, **연결을 끊는 원인이 된 쿼리는 처리되지 않습니다**.

## 쿼리 제한 {#query-limits}

`tcp_close_connection_after_queries_num`이 N으로 설정된 경우, 연결은 N개의 성공적인 쿼리를 허용합니다. 그 후 N + 1번 쿼리에서는 클라이언트가 연결이 끊어집니다.

처리된 모든 쿼리는 쿼리 제한에 포함됩니다. 따라서 명령줄 클라이언트에 연결할 때, 제한에 포함되는 자동 초기 시스템 경고 쿼리가 있을 수 있습니다.

TCP 연결이 유휴 상태일 때(즉, 일정 시간 동안 쿼리를 처리하지 않은 경우, 세션 설정 `poll_interval`에 의해 지정됨), 지금까지 계산된 쿼리 수는 0으로 재설정됩니다. 이는 단일 연결에서 총 쿼리 수가 `tcp_close_connection_after_queries_num`을 초과할 수 있음을 의미합니다.

## 지속 시간 제한 {#duration-limits}

연결 지속 시간은 클라이언트가 연결되자마자 측정됩니다. 클라이언트는 `tcp_close_connection_after_queries_seconds` 초가 경과한 후 첫 번째 쿼리에서 연결이 끊어집니다.
