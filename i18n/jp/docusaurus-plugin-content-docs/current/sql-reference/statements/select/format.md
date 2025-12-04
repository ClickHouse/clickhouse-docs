---
description: 'FORMAT 句に関するドキュメント'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT 句'
doc_type: 'reference'
---

# FORMAT 句 {#format-clause}

ClickHouse は、クエリ結果などに対して使用できる幅広い[シリアル化フォーマット](../../../interfaces/formats.md)をサポートしています。`SELECT` の出力フォーマットを選択する方法はいくつかあり、そのひとつはクエリの末尾で `FORMAT format` を指定して、結果データを任意の形式で取得する方法です。

特定のフォーマットは、利便性、他システムとの連携、あるいはパフォーマンス向上を目的として使用される場合があります。

## デフォルトのフォーマット {#default-format}

`FORMAT` 句を省略した場合はデフォルトのフォーマットが使用されます。これは、設定と、ClickHouse サーバーへのアクセスに使用するインターフェイスの両方に依存します。[HTTP インターフェイス](../../../interfaces/http.md)およびバッチモードでの[コマンドラインクライアント](../../../interfaces/cli.md)では、デフォルトのフォーマットは `TabSeparated` です。対話モードのコマンドラインクライアントでは、デフォルトのフォーマットは `PrettyCompact` です（人間が読みやすいコンパクトなテーブルを出力します）。

## 実装の詳細 {#implementation-details}

コマンドラインクライアントを使用する場合、データは常に内部の効率的なフォーマット（`Native`）でネットワーク経由で送受信されます。クライアントはクエリの `FORMAT` 句を自前で解釈し、自身でデータをフォーマットします（これにより、ネットワークとサーバーへの余分な負荷が軽減されます）。
