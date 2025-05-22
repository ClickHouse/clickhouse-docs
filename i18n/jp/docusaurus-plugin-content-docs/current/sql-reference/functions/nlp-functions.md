---
'description': 'Documentation for Natural Language Processing (NLP) Functions'
'sidebar_label': 'NLP'
'sidebar_position': 130
'slug': '/sql-reference/functions/nlp-functions'
'title': 'Natural Language Processing (NLP) Functions'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';


# 自然言語処理 (NLP) 関数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
これは現在開発中の実験的な機能であり、一般的な使用には適していません。将来のリリースで予測不可能な後方互換性のない変更が行われる可能性があります。`allow_experimental_nlp_functions = 1` を設定して有効にしてください。
:::

## detectCharset {#detectcharset}

`detectCharset` 関数は、非UTF8エンコードの入力文字列の文字セットを検出します。

*構文*

```sql
detectCharset('text_to_be_analyzed')
```

*引数*

- `text_to_be_analyzed` — 分析する文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*返り値*

- 検出された文字セットのコードを含む `String`

*例*

クエリ:

```sql
SELECT detectCharset('Ich bleibe für ein paar Tage.');
```

結果:

```response
┌─detectCharset('Ich bleibe für ein paar Tage.')─┐
│ WINDOWS-1252                                   │
└────────────────────────────────────────────────┘
```

## detectLanguage {#detectlanguage}

UTF8エンコードの入力文字列の言語を検出します。この関数は、検出のために [CLD2ライブラリ](https://github.com/CLD2Owners/cld2) を使用し、2文字のISO言語コードを返します。

`detectLanguage` 関数は、入力文字列に200文字以上を提供することで最もよく機能します。

*構文*

```sql
detectLanguage('text_to_be_analyzed')
```

*引数*

- `text_to_be_analyzed` — 分析する文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*返り値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 不明、言語を検出できません。
- `other` = 検出された言語には2文字コードがありません。

*例*

クエリ:

```sql
SELECT detectLanguage('Je pense que je ne parviendrai jamais à parler français comme un natif. Where there's a will, there's a way.');
```

結果:

```response
fr
```

## detectLanguageMixed {#detectlanguagemixed}

`detectLanguage` 関数に似ていますが、`detectLanguageMixed` は、テキスト内の特定の言語の割合にマップされた2文字の言語コードの `Map` を返します。

*構文*

```sql
detectLanguageMixed('text_to_be_analyzed')
```

*引数*

- `text_to_be_analyzed` — 分析する文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*返り値*

- `Map(String, Float32)`：キーは2文字のISOコード、値はその言語で見つかったテキストの割合です。

*例*

クエリ:

```sql
SELECT detectLanguageMixed('二兎を追う者は一兎をも得ず二兎を追う者は一兎をも得ず A vaincre sans peril, on triomphe sans gloire.');
```

結果:

```response
┌─detectLanguageMixed()─┐
│ {'ja':0.62,'fr':0.36  │
└───────────────────────┘
```

## detectProgrammingLanguage {#detectprogramminglanguage}

ソースコードからプログラミング言語を判別します。ソースコード内のコマンドのすべてのユニグラムとビグラムを計算します。次に、さまざまなプログラミング言語のユニグラムとビグラムのコマンドの重みを持つマークアップ辞書を使用して、プログラミング言語の最大の重みを見つけて返します。

*構文*

```sql
detectProgrammingLanguage('source_code')
```

*引数*

- `source_code` — 分析するソースコードの文字列表現。 [String](/sql-reference/data-types/string)。

*返り値*

- プログラミング言語。 [String](../data-types/string.md)。

*例*

クエリ:

```sql
SELECT detectProgrammingLanguage('#include <iostream>');
```

結果:

```response
┌─detectProgrammingLanguage('#include <iostream>')─┐
│ C++                                              │
└──────────────────────────────────────────────────┘
```

## detectLanguageUnknown {#detectlanguageunknown}

`detectLanguage` 関数に似ていますが、`detectLanguageUnknown` 関数は非UTF8エンコードの文字列で動作します。文字セットがUTF-16またはUTF-32の場合は、このバージョンを優先してください。

*構文*

```sql
detectLanguageUnknown('text_to_be_analyzed')
```

*引数*

- `text_to_be_analyzed` — 分析する文字列のコレクション（または文）。 [String](/sql-reference/data-types/string)。

*返り値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 不明、言語を検出できません。
- `other` = 検出された言語には2文字コードがありません。

*例*

クエリ:

```sql
SELECT detectLanguageUnknown('Ich bleibe für ein paar Tage.');
```

結果:

```response
┌─detectLanguageUnknown('Ich bleibe für ein paar Tage.')─┐
│ de                                                     │
└────────────────────────────────────────────────────────┘
```

## detectTonality {#detecttonality}

テキストデータの感情を判定します。各単語に `-12` から `6` の範囲のトーンを持つマークアップされた感情辞書を使用します。各テキストに対して、単語の平均感情値を計算し、`[-1,1]` の範囲で返します。

:::note
この関数は現在の形式で制限されています。現在、`/contrib/nlp-data/tonality_ru.zst` に埋め込まれた感情辞書を使用しており、ロシア語のみで機能します。
:::

*構文*

```sql
detectTonality(text)
```

*引数*

- `text` — 分析するテキスト。 [String](/sql-reference/data-types/string)。

*返り値*

- `text` 内の単語の平均感情値。 [Float32](../data-types/float.md)。

*例*

クエリ:

```sql
SELECT detectTonality('Шарик - хороший пёс'), -- Sharik is a good dog 
       detectTonality('Шарик - пёс'), -- Sharik is a dog
       detectTonality('Шарик - плохой пёс'); -- Sharkik is a bad dog
```

結果:

```response
┌─detectTonality('Шарик - хороший пёс')─┬─detectTonality('Шарик - пёс')─┬─detectTonality('Шарик - плохой пёс')─┐
│                               0.44445 │                             0 │                                 -0.3 │
└───────────────────────────────────────┴───────────────────────────────┴──────────────────────────────────────┘
```
## lemmatize {#lemmatize}

指定された単語に対してレmmatizationを行います。動作するには辞書が必要で、[こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)から取得できます。

*構文*

```sql
lemmatize('language', word)
```

*引数*

- `language` — 適用されるルールの言語。 [String](/sql-reference/data-types/string)。
- `word` — レmmatizationが必要な単語。小文字である必要があります。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

```sql
SELECT lemmatize('en', 'wolves');
```

結果:

```text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*設定*

この設定は、辞書 `en.bin` が英語 (`en`) のレmmatizationに使用されることを指定します。.binファイルは[こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)からダウンロードできます。

```xml
<lemmatizers>
    <lemmatizer>
        <!-- highlight-start -->
        <lang>en</lang>
        <path>en.bin</path>
        <!-- highlight-end -->
    </lemmatizer>
</lemmatizers>
```

## stem {#stem}

指定された単語に対してステミングを行います。

*構文*

```sql
stem('language', word)
```

*引数*

- `language` — 適用されるルールの言語。2文字の [ISO 639-1 コード](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) を使用します。
- `word` — ステミングが必要な単語。小文字である必要があります。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

```sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

結果:

```text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```
*stem() に対応する言語*

:::note
stem() 関数は [Snowball stemming](https://snowballstem.org/) ライブラリを使用しており、最新の言語情報などはSnowballのウェブサイトを参照してください。
:::

- アラビア語
- アルメニア語
- バスク語
- カタロニア語
- デンマーク語
- オランダ語
- 英語
- フィンランド語
- フランス語
- ドイツ語
- ギリシャ語
- ヒンディー語
- ハンガリー語
- インドネシア語
- アイルランド語
- イタリア語
- リトアニア語
- ネパール語
- ノルウェー語
- ポーター
- ポルトガル語
- ルーマニア語
- ロシア語
- セルビア語
- スペイン語
- スウェーデン語
- タミル語
- トルコ語
- イディッシュ語

## synonyms {#synonyms}

指定された単語の同義語を見つけます。同義語拡張には `plain` と `wordnet` の2種類があります。

`plain` 拡張タイプでは、各行が特定の同義語セットに対応する単純なテキストファイルへのパスを提供する必要があります。この行の単語は、スペースまたはタブ文字で区切る必要があります。

`wordnet` 拡張タイプでは、WordNetシソーラスを含むディレクトリへのパスを提供する必要があります。シソーラスはWordNetの意味インデックスを含む必要があります。

*構文*

```sql
synonyms('extension_name', word)
```

*引数*

- `extension_name` — 検索が実行される拡張の名前。 [String](/sql-reference/data-types/string)。
- `word` — 拡張で検索される単語。 [String](/sql-reference/data-types/string)。

*例*

クエリ:

```sql
SELECT synonyms('list', 'important');
```

結果:

```text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*設定*
```xml
<synonyms_extensions>
    <extension>
        <name>en</name>
        <type>plain</type>
        <path>en.txt</path>
    </extension>
    <extension>
        <name>en</name>
        <type>wordnet</type>
        <path>en/</path>
    </extension>
</synonyms_extensions>
```
