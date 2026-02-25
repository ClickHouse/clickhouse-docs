---
description: 'TCP 연결 제한'
sidebar_label: 'TCP 연결 제한'
slug: /operations/settings/tcp-connection-limits
title: 'TCP 연결 제한'
doc_type: 'reference'
---



# TCP 연결 제한 \{#tcp-connection-limits\}



## 개요 \{#overview\}

ClickHouse TCP 연결(예: [command-line client](https://clickhouse.com/docs/interfaces/cli)를 통한 연결)은
일정 쿼리 개수 또는 기간이 지나면 자동으로 끊어질 수 있습니다.
연결이 끊어진 후에는(예: command-line client에서 다른 쿼리를 전송하는 등,
다른 동작으로 다시 트리거하지 않는 한) 자동으로 재연결되지 않습니다.

연결 제한은 서버 설정인
`tcp_close_connection_after_queries_num`(쿼리 개수 제한용)
또는 `tcp_close_connection_after_queries_seconds`(기간 제한용)을 0보다 큰 값으로 설정하면 활성화됩니다.
두 제한이 모두 활성화된 경우, 먼저 도달한 제한으로 인해 연결이 종료됩니다.

제한에 도달하여 연결이 끊어지면 클라이언트는
`TCP_CONNECTION_LIMIT_REACHED` 예외를 받으며, **연결을 끊어지게 만든 해당 쿼리는 처리되지 않습니다**.



## 쿼리 제한 \{#query-limits\}

`tcp_close_connection_after_queries_num`이 N으로 설정되어 있다고 가정하면, 해당 연결에서는
성공적으로 처리된 쿼리 N개가 허용됩니다. 이후 N + 1번째 쿼리에서 클라이언트가 연결을 끊습니다.

처리된 모든 쿼리가 쿼리 제한에 포함됩니다. 따라서 명령줄 클라이언트를 연결할 때
자동으로 실행되는 초기 시스템 경고용 쿼리가 있을 수 있으며, 이것도 제한에 포함됩니다.

TCP 연결이 유휴 상태(예: 일정 시간 동안 쿼리를 처리하지 않은 상태로,
세션 설정 `poll_interval`로 지정됨)가 되면, 지금까지 계산된 쿼리 수가 0으로 초기화됩니다.
이는 유휴 상태가 발생하는 경우 단일 연결에서의 전체 쿼리 수가
`tcp_close_connection_after_queries_num`을 초과할 수 있음을 의미합니다.



## 지속 시간 제한 \{#duration-limits\}

연결 지속 시간은 클라이언트가 연결되는 즉시부터 측정됩니다.
클라이언트는 `tcp_close_connection_after_queries_seconds` 초가 경과한 뒤 이어지는 첫 번째 쿼리에서 연결이 끊어집니다.
