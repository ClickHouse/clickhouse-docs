---
'description': 'TCP 接続制限。'
'sidebar_label': 'TCP 接続制限'
'slug': '/operations/settings/tcp-connection-limits'
'title': 'TCP 接続制限'
'doc_type': 'reference'
---


# TCP接続制限

## 概要 {#overview}

ClickHouseのTCP接続（つまり、[コマンドラインクライアント](https://clickhouse.com/docs/interfaces/cli)を介した接続）は、一定のクエリ数または期間の後に自動的に切断される場合があります。
切断後は、自動的に再接続されることはありません（他の何かがトリガーしない限り、例えばコマンドラインクライアントで別のクエリを送信することなど）。

接続制限は、サーバー設定 `tcp_close_connection_after_queries_num`（クエリ制限用）または `tcp_close_connection_after_queries_seconds`（期間制限用）を0より大きく設定することで有効になります。
両方の制限が有効な場合、最初にヒットした制限によって接続が切断されます。

制限に達して切断されると、クライアントは `TCP_CONNECTION_LIMIT_REACHED` 例外を受け取り、**切断を引き起こすクエリは決して処理されません**。

## クエリ制限 {#query-limits}

`tcp_close_connection_after_queries_num` がNに設定されている場合、接続はN件の成功したクエリを許可します。次に、クエリN + 1の時点でクライアントは切断されます。

処理された各クエリはクエリ制限にカウントされます。したがって、コマンドラインクライアントに接続する際に、制限にカウントされる自動初期システム警告クエリがある場合があります。

TCP接続がアイドル状態（つまり、指定されたセッション設定 `poll_interval` によって一定時間クエリを処理していない状態）である間、これまでにカウントされたクエリ数は0にリセットされます。
これは、アイドル状態が発生した場合、単一の接続における総クエリ数が `tcp_close_connection_after_queries_num` を超える可能性があることを意味します。

## 期間制限 {#duration-limits}

接続期間は、クライアントが接続した瞬間から測定されます。
`tcp_close_connection_after_queries_seconds` 秒が経過した後の最初のクエリでクライアントは切断されます。
