---
slug: /sql-reference/functions/nlp-functions
sidebar_position: 130
sidebar_label: NLP
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# 自然言語処理 (NLP) 関数

<ExperimentalBadge/>
<CloudNotSupportedBadge/>

:::warning
これは現在開発中の実験的な機能であり、一般的な使用に適していません。今後のリリースで予測不可能な後方互換性のない方法で変更される可能性があります。`allow_experimental_nlp_functions = 1`を設定して有効にしてください。
:::

## detectCharset {#detectcharset}

`detectCharset` 関数は、UTF8エンコードされていない入力文字列の文字セットを検出します。

*構文*

``` sql
detectCharset('分析対象のテキスト')
```

*引数*

- `分析対象のテキスト` — 分析する文字列のコレクション（または文）。 [String](../data-types/string.md#string)。

*返される値*

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

UTF8エンコードされた入力文字列の言語を検出します。この関数は [CLD2ライブラリ](https://github.com/CLD2Owners/cld2) を使用して検出を行い、2文字のISO言語コードを返します。

`detectLanguage` 関数は、入力文字列に200文字以上を提供する場合に最も効果を発揮します。

*構文*

``` sql
detectLanguage('分析対象のテキスト')
```

*引数*

- `分析対象のテキスト` — 分析する文字列のコレクション（または文）。 [String](../data-types/string.md#string)。

*返される値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 未知、言語を検出できません。
- `other` = 検出された言語に2文字コードがありません。

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

`detectLanguage` 関数に似ていますが、`detectLanguageMixed` はテキスト内の特定の言語の割合にマッピングされた2文字の言語コードの `Map` を返します。

*構文*

``` sql
detectLanguageMixed('分析対象のテキスト')
```

*引数*

- `分析対象のテキスト` — 分析する文字列のコレクション（または文）。 [String](../data-types/string.md#string)。

*返される値*

- `Map(String, Float32)`: キーは2文字のISOコードで、値はその言語で見つかったテキストの割合

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

ソースコードからプログラミング言語を特定します。ソースコード内のすべてのユニグラムとバイグラムのコマンドを計算します。
次に、さまざまなプログラミング言語のコマンドのユニグラムとバイグラムの重みを持つマークアップされた辞書を使用して、プログラミング言語の最大の重みを見つけ、それを返します。

*構文*

``` sql
detectProgrammingLanguage('ソースコード')
```

*引数*

- `ソースコード` — 分析するソースコードの文字列表現。 [String](../data-types/string.md#string)。

*返される値*

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

`detectLanguage` 関数に似ていますが、`detectLanguageUnknown` 関数はUTF8エンコードされていない文字列を処理します。文字セットがUTF-16またはUTF-32の場合は、このバージョンを優先してください。

*構文*

``` sql
detectLanguageUnknown('分析対象のテキスト')
```

*引数*

- `分析対象のテキスト` — 分析する文字列のコレクション（または文）。 [String](../data-types/string.md#string)。

*返される値*

- 検出された言語の2文字ISOコード

その他の可能な結果:

- `un` = 未知、言語を検出できません。
- `other` = 検出された言語に2文字コードがありません。

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

テキストデータの感情を決定します。各単語に `-12` から `6` の範囲のトナリティを持つマークアップされた感情辞書を使用します。
各テキストについて、その単語の平均感情値を計算し、`[-1,1]` の範囲で返します。

:::note
この関数は現在の形では制限があります。現在、`/contrib/nlp-data/tonality_ru.zst` に埋め込まれた感情辞書を使用しており、ロシア語のみで機能します。
:::

*構文*

``` sql
detectTonality(text)
```

*引数*

- `text` — 分析するテキスト。 [String](../data-types/string.md#string)。

*返される値*

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

与えられた単語に対してレmmatizationを行います。動作するために辞書が必要で、これらは[こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)から入手できます。

*構文*

``` sql
lemmatize('言語', word)
```

*引数*

- `言語` — 適用されるルールの言語。 [String](../data-types/string.md#string)。
- `word` — レmmatizationが必要な単語。小文字でなければなりません。 [String](../data-types/string.md#string)。

*例*

クエリ:

``` sql
SELECT lemmatize('en', 'wolves');
```

結果:

``` text
┌─lemmatize("wolves")─┐
│              "wolf" │
└─────────────────────┘
```

*設定*

この設定は、辞書 `en.bin` が英語（`en`）のレmmatizationに使用されるべきであることを指定します。 `.bin` ファイルは[こちら](https://github.com/vpodpecan/lemmagen3/tree/master/src/lemmagen3/models)からダウンロードできます。

``` xml
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

与えられた単語に対してステミングを行います。

*構文*

``` sql
stem('言語', word)
```

*引数*

- `言語` — 適用されるルールの言語。2文字の [ISO 639-1 コード](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)を使用します。
- `word` — ステミングが必要な単語。小文字でなければなりません。 [String](../data-types/string.md#string)。

*例*

クエリ:

``` sql
SELECT arrayMap(x -> stem('en', x), ['I', 'think', 'it', 'is', 'a', 'blessing', 'in', 'disguise']) as res;
```

結果:

``` text
┌─res────────────────────────────────────────────────┐
│ ['I','think','it','is','a','bless','in','disguis'] │
└────────────────────────────────────────────────────┘
```
*stem()にサポートされている言語*

:::note
stem() 関数は [Snowball stemming](https://snowballstem.org/) ライブラリを使用しています。更新された言語はSnowballのウェブサイトを参照してください。
:::

- アラビア語
- アルメニア語
- バスク語
- カタルーニャ語
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
- ポーターステミング
- ポルトガル語
- ルーマニア語
- ロシア語
- セルビア語
- スペイン語
- スウェーデン語
- タミル語
- トルコ語
- ヘディッシュ語

## synonyms {#synonyms}

与えられた単語の同義語を見つけます。同義語拡張には、`plain` と `wordnet` の2つのタイプがあります。

`plain` 拡張タイプでは、各行が特定の同義語セットに対応するシンプルなテキストファイルへのパスを提供する必要があります。この行の単語はスペースまたはタブ文字で区切る必要があります。

`wordnet` 拡張タイプでは、WordNetシソーラスを含むディレクトリへのパスを提供する必要があります。シソーラスはWordNet感覚インデックスを含む必要があります。

*構文*

``` sql
synonyms('拡張名', word)
```

*引数*

- `拡張名` — 検索が行われる拡張の名前。 [String](../data-types/string.md#string)。
- `word` — 拡張において検索される単語。 [String](../data-types/string.md#string)。

*例*

クエリ:

``` sql
SELECT synonyms('list', 'important');
```

結果:

``` text
┌─synonyms('list', 'important')────────────┐
│ ['important','big','critical','crucial'] │
└──────────────────────────────────────────┘
```

*設定*
``` xml
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
