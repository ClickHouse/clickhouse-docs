---
description: 'WebSocket 経由でブラウザ内の `clickhouse-client` セッションを提供するウェブターミナルのドキュメント'
sidebar_label: 'ウェブターミナル'
sidebar_position: 22
slug: /interfaces/web-terminal
title: 'ウェブターミナル'
doc_type: 'reference'
---

ウェブターミナルは、WebSocket 経由で対話型の `clickhouse-client` セッションを提供する、ブラウザ内のインターフェイスです。ClickHouse の任意の HTTP ポートで、`/webterminal` パスから利用できます。

ターミナルを開くには、ClickHouse の任意の HTTP ポートで `/webterminal` (たとえば `http://localhost:8123/webterminal`) にアクセスします。

## 機能の有効化と無効化 \{#enabling-the-feature\}

`/webterminal` エンドポイントはデフォルトで有効になっており、`enable_webterminal` サーバー設定で制御されます。無効にするには、この設定を `false` にします。以後、`/webterminal` へのリクエストには HTTP ステータス `403 Forbidden` が返されます。

```xml
<clickhouse>
    <enable_webterminal>false</enable_webterminal>
</clickhouse>
```

:::note
`enable_webterminal` は、従来の `allow_experimental_webterminal` 設定に置き換わるものです。`enable_webterminal` が設定されていない場合は、後方互換性のため、古い名前も引き続き使用できます。
:::

## 認証 \{#authentication\}

ウェブターミナルは、HTTP プロトコルと同様に、同じ `Session` およびアクセス制御チェックに基づいてユーザーを認証します。ただし、認証情報は HTTP のアップグレードリクエスト経由ではなく、確立済みの WebSocket 接続上でインバンドにやり取りされます。WebSocket ハンドシェイクが完了すると、ブラウザーは最初のメッセージを JSON として送信します。

```json
{"type": "auth", "user": "<user>", "password": "<password>"}
```

これにより、認証情報を URL クエリパラメータや、アップグレードリクエストに付与される `Authorization` ヘッダーに含めずに済みます。こうした場所に含まれると、ブラウザの履歴、サーバーのアクセスログ、リバースプロキシのログに残る可能性があります。アップグレードリクエストの URL パラメータ、HTTP Basic、`X-ClickHouse-User`/`X-ClickHouse-Key` ヘッダーは、`/webterminal` では意図的に**参照されません**。

認証情報が無効な場合、サーバーはコード `1008` で WebSocket を閉じ、ブラウザ UI は認証情報の再入力を求めます。

## セッション画面 \{#session\}

認証が完了すると、サーバーは疑似端末に接続した `clickhouse-client` を起動し、その入出力を WebSocket 経由で中継します。このセッションでは、`clickhouse-client` のフル機能を利用でき、以下が含まれます。

* シンタックスハイライト。
* 自動補完。
* 複数行クエリ。
* コマンド履歴 (セッション中はサーバー側に保存されます) 。

端末の描画には [xterm.js](https://xtermjs.org/) を使用します。すべてのアセットは ClickHouse バイナリ自体から配信され、サードパーティ製 CDN は読み込まれません。

## `/play` との統合 \{#play-integration\}

[`/play`](/interfaces/http) Web SQL UI には、ドッキング可能なパネルとして ウェブターミナルが組み込まれています。サイドバーのターミナルアイコンをクリックして表示を切り替えるか、クエリエディターが空のときに `~` キーを押してください。`/play` ページは読み込み時に `/webterminal` が利用可能かどうかを判定し、エンドポイントが利用できない場合はターミナルのコントロールを非表示にします (たとえば、`enable_webterminal` が `false` に設定されている場合です) 。

## セキュリティに関する考慮事項 \{#security\}

ウェブターミナル は、ClickHouse の HTTP エンドポイントに対して認証できるすべてのユーザーに、対話型のシェル風セッションを公開します。そのため、HTTP プロトコルに関する注意事項は、ここでも同様に当てはまります。

* 信頼できない環境では、認証情報とセッショントラフィックを保護するため、必ず `/webterminal` を HTTPS 経由で提供してください。
* HTTP プロトコルへのアクセスを制限するのと同様に、ネットワークレベル (ファイアウォール、リバースプロキシ、または `listen_host` 設定) でもアクセスを制限してください。
* このエンドポイントは、クロスオリジン WebSocket ハイジャックを軽減するために、`Origin` ヘッダーを `Host` と照合します。TLS を外部で終端する場合は、それに応じてリバースプロキシを設定してください。
* TLS 終端を行うリバースプロキシの背後では、ブラウザが `https` を使用していても、ClickHouse への上流接続は平文の `http` になります。そのため、厳格な same-origin チェックにより、正当な接続が拒否されます。このようなデプロイでは、WebSocket セッションを開くことを許可する完全なオリジンのカンマ区切りリストとして `webterminal_allowed_origins` を設定してください。この設定が空でない場合、デフォルトの same-origin チェックはこれに置き換えられます。Example: `<webterminal_allowed_origins>https://example.com,https://app.example.com:8443</webterminal_allowed_origins>`。

このハンドラーは、RFC 6455 に従って WebSocket プロトコルへの準拠も強制します。マスクされていないクライアントフレーム、予約済みオペコード、サイズ超過または断片化された制御フレーム、および予約済みの RSV ビットは、protocol-error のクローズコードで拒否されます。

## プラットフォーム対応状況 \{#platform\}

このハンドラーは、ClickHouse がサポートするすべてのプラットフォームでコンパイルされます。組み込みの `clickhouse-client` ランナーで使用される疑似端末レイヤーは、移植性のある POSIX プリミティブ (`posix_openpt`/`grantpt`/`unlockpt`) の上に実装されており、Linux 固有のコードパスではスレッドセーフな `ptsname_r` を使用します。ClickHouse のスタートページおよび `/play` の `/webterminal` へのリンクは、エンドポイントが利用できない場合 (たとえば、`enable_webterminal` が `false` に設定されている場合) には自動的に非表示になります。