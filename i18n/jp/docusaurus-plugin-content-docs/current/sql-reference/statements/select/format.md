---
description: 'FORMAT句のドキュメント'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT句'
---


# FORMAT句

ClickHouseは、クエリ結果を含むさまざまな[シリアライズ形式](../../../interfaces/formats.md)をサポートしています。`SELECT`出力の形式を選択する方法はいくつかあり、そのうちの1つは、クエリの最後に`FORMAT format`を指定して特定の形式で結果データを取得することです。

特定の形式は便宜上、他のシステムとの統合、またはパフォーマンス向上のために使用されることがあります。

## デフォルト形式 {#default-format}

`FORMAT`句が省略されると、デフォルト形式が使用されます。これは、設定とClickHouseサーバーへのアクセスに使用されるインターフェースの両方に依存します。[HTTPインターフェース](../../../interfaces/http.md)およびバッチモードの[コマンドラインクライアント](../../../interfaces/cli.md)では、デフォルト形式は`TabSeparated`です。インタラクティブモードのコマンドラインクライアントでは、デフォルト形式は`PrettyCompact`（コンパクトで人間が読みやすいテーブルを生成します）です。

## 実装の詳細 {#implementation-details}

コマンドラインクライアントを使用する場合、データは常に内部的に効率的な形式（`Native`）でネットワークを介して送信されます。クライアントはクエリの`FORMAT`句を独自に解釈し、データを独自にフォーマットします（これにより、ネットワークとサーバーに余分な負荷をかけることがありません）。
