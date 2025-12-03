---
description: 'TCP 接続制限'
sidebar_label: 'TCP 接続制限'
slug: /operations/settings/tcp-connection-limits
title: 'TCP 接続制限'
doc_type: 'reference'
---



# TCP 接続制限 {#tcp-connection-limits}



## 概要 {#overview}

ClickHouse の TCP 接続（たとえば [コマンドラインクライアント](https://clickhouse.com/docs/interfaces/cli) を通したもの）が、
一定回数のクエリ実行または一定時間の経過後に自動的に切断されることがあります。
切断された後は、（コマンドラインクライアントで別のクエリを送信するなど、
他の要因によってトリガーされない限り）自動再接続は行われません。

接続制限は、サーバー設定
`tcp_close_connection_after_queries_num`（クエリ回数の制限）
または `tcp_close_connection_after_queries_seconds`（時間の制限）を 0 より大きい値に設定することで有効になります。
両方の制限が有効な場合、どちらか一方の制限に先に達した時点で接続がクローズされます。

制限に達して切断されると、クライアントは
`TCP_CONNECTION_LIMIT_REACHED` 例外を受け取り、**切断を引き起こしたクエリが処理されることは決してありません**。



## クエリ制限 {#query-limits}

`tcp_close_connection_after_queries_num` が N に設定されていると仮定すると、その接続では
N 回のクエリが正常に実行できます。その後、N + 1 回目のクエリでクライアントが切断されます。

処理されたすべてのクエリはクエリ制限にカウントされます。したがって、コマンドラインクライアントで接続する場合には、
自動的に実行される初期のシステム警告クエリがあり、これも制限に含まれます。

TCP 接続がアイドル状態（つまり、ある一定期間クエリを処理していない状態で、
その期間はセッション設定 `poll_interval` によって指定される）の場合、これまでにカウントされたクエリ数は 0 にリセットされます。
これは、アイドル状態が発生した場合、1 つの接続における合計クエリ数が
`tcp_close_connection_after_queries_num` を超える可能性があることを意味します。



## 接続時間の制限 {#duration-limits}

接続時間は、クライアントが接続した直後から計測されます。
`tcp_close_connection_after_queries_seconds` 秒が経過した後に実行された最初のクエリで、クライアントは切断されます。
