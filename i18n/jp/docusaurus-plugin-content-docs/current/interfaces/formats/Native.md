---
'alias': []
'description': 'NativeフォーマットのDocumentation'
'input_format': true
'keywords':
- 'Native'
'output_format': true
'slug': '/interfaces/formats/Native'
'title': 'ネイティブ'
'doc_type': 'reference'
---

| Input | Output | Alias |
|-------|--------|-------|
| ✔     | ✔      |       |

## 説明 {#description}

`Native` 形式は、ClickHouseの最も効率的な形式で、実際に「列指向」であるため、カラムを行に変換しません。  

この形式では、データはバイナリ形式で [ブロック](/development/architecture#block) によって書き込まれ、読み取られます。 
各ブロックについて、行数、カラム数、カラム名とタイプ、およびブロック内のカラムのパーツが順番に記録されます。

この形式は、サーバー間の相互作用、コマンドラインクライアントの使用、およびC++クライアントのネイティブインターフェースで使用されます。

:::tip
この形式を使用して、ClickHouse DBMSによってのみ読み取ることができるダンプを迅速に生成できます。 
この形式を自分で扱うことは実用的ではないかもしれません。
:::

## 例の使用法 {#example-usage}

## 形式設定 {#format-settings}
