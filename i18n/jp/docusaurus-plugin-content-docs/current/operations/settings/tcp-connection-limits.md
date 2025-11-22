---
description: 'TCP 接続の制限'
sidebar_label: 'TCP 接続の制限'
slug: /operations/settings/tcp-connection-limits
title: 'TCP 接続の制限'
doc_type: 'reference'
---



# TCP 接続数の制限



## 概要 {#overview}

ClickHouseのTCP接続（[コマンドラインクライアント](https://clickhouse.com/docs/interfaces/cli)を介した接続など）は、
一定数のクエリ実行後、または一定時間経過後に自動的に切断される場合があります。
切断後は自動的な再接続は行われません（コマンドラインクライアントで別のクエリを送信するなど、
他の操作によってトリガーされない限り）。

接続制限を有効にするには、サーバー設定の
`tcp_close_connection_after_queries_num`（クエリ数の制限）
または`tcp_close_connection_after_queries_seconds`（接続時間の制限）を0より大きい値に設定します。
両方の制限が有効な場合、いずれかの制限に先に達した時点で接続が閉じられます。

制限に達して切断されると、クライアントは
`TCP_CONNECTION_LIMIT_REACHED`例外を受け取り、**切断の原因となったクエリは処理されません**。


## クエリ制限 {#query-limits}

`tcp_close_connection_after_queries_num` が N に設定されている場合、接続では N 回の成功したクエリが許可されます。N + 1 回目のクエリでクライアントは切断されます。

処理されたすべてのクエリがクエリ制限にカウントされます。そのため、コマンドラインクライアントを接続する際、制限にカウントされる自動的な初期システム警告クエリが実行される場合があります。

TCP 接続がアイドル状態の場合(すなわち、セッション設定 `poll_interval` で指定された一定時間クエリを処理していない場合)、それまでにカウントされたクエリ数は 0 にリセットされます。
これは、アイドル状態が発生した場合、単一の接続における総クエリ数が `tcp_close_connection_after_queries_num` を超える可能性があることを意味します。


## 接続時間の制限 {#duration-limits}

接続時間は、クライアントが接続した瞬間から測定されます。
`tcp_close_connection_after_queries_seconds` 秒が経過した後、最初のクエリ実行時にクライアントは切断されます。
