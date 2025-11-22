---
description: 'FORMAT 句に関するドキュメント'
sidebar_label: 'FORMAT'
slug: /sql-reference/statements/select/format
title: 'FORMAT 句'
doc_type: 'reference'
---



# FORMAT 句

ClickHouse は、クエリ結果などに使用できる幅広い[シリアライゼーションフォーマット](../../../interfaces/formats.md)をサポートしています。`SELECT` の出力フォーマットを選択する方法はいくつかありますが、その 1 つが、クエリの末尾で `FORMAT format` を指定し、結果データを任意のフォーマットで取得する方法です。

特定のフォーマットは、利便性や他システムとの連携、あるいはパフォーマンス向上を目的として利用できます。



## デフォルトフォーマット {#default-format}

`FORMAT`句を省略した場合、デフォルトフォーマットが使用されます。デフォルトフォーマットは、設定とClickHouseサーバーへのアクセスに使用するインターフェースの両方に依存します。[HTTPインターフェース](../../../interfaces/http.md)およびバッチモードの[コマンドラインクライアント](../../../interfaces/cli.md)の場合、デフォルトフォーマットは`TabSeparated`です。対話モードのコマンドラインクライアントの場合、デフォルトフォーマットは`PrettyCompact`です(コンパクトで人間が読みやすいテーブルを生成します)。


## 実装の詳細 {#implementation-details}

コマンドラインクライアントを使用する場合、データは常に内部の効率的な形式（`Native`）でネットワーク経由で転送されます。クライアントはクエリの`FORMAT`句を独自に解釈し、データのフォーマットを自身で行います（これにより、ネットワークとサーバーへの追加負荷が軽減されます）。
