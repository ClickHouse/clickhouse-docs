---
'description': 'FORMAT 句に関するDocumentation'
'sidebar_label': 'FORMAT'
'slug': '/sql-reference/statements/select/format'
'title': 'FORMAT 句'
'doc_type': 'reference'
---


# FORMAT句

ClickHouseは、クエリ結果などに使用できる幅広い[シリアル化フォーマット](../../../interfaces/formats.md)をサポートしています。`SELECT`出力のフォーマットを選択する方法はいくつかあり、そのうちの1つは、クエリの最後に`FORMAT format`を指定して結果データを特定のフォーマットで取得することです。

特定のフォーマットは、便利さ、他のシステムとの統合、またはパフォーマンス向上のために使用されることがあります。

## デフォルトフォーマット {#default-format}

`FORMAT`句が省略された場合、デフォルトフォーマットが使用され、これは設定とClickHouseサーバーへのアクセスに使用されるインターフェースの両方に依存します。[HTTPインターフェース](../../../interfaces/http.md)およびバッチモードの[コマンドラインクライアント](../../../interfaces/cli.md)において、デフォルトフォーマットは`TabSeparated`です。インタラクティブモードのコマンドラインクライアントにおいては、デフォルトフォーマットは`PrettyCompact`です（これは、コンパクトで人間可読なテーブルを生成します）。

## 実装の詳細 {#implementation-details}

コマンドラインクライアントを使用するとき、データは常に内部の効率的なフォーマット（`Native`）でネットワークを介して渡されます。クライアントはクエリの`FORMAT`句を独自に解釈し、データを自身でフォーマットします（これにより、ネットワークやサーバーの追加負荷を軽減します）。
