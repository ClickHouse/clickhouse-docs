---
title: XML
slug: /interfaces/formats/XML
keywords: [XML]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`XML` フォーマットは出力専用であり、パースには適していません。

カラム名が受け入れ可能な形式でない場合、「field」が要素名として使用されます。一般的に、XML構造はJSON構造に従います。
JSONと同様に、無効なUTF-8シーケンスは置換文字 `�` に変更されるため、出力テキストは有効なUTF-8シーケンスで構成されます。

文字列値において、文字 `<` と `&` はそれぞれ `<` と `&` にエスケープされます。

配列は `<array><elem>Hello</elem><elem>World</elem>...</array>` として出力され、タプルは `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>` として出力されます。

## 使用例 {#example-usage}

例:

```xml
<?xml version='1.0' encoding='UTF-8' ?>
<result>
        <meta>
                <columns>
                        <column>
                                <name>SearchPhrase</name>
                                <type>String</type>
                        </column>
                        <column>
                                <name>count()</name>
                                <type>UInt64</type>
                        </column>
                </columns>
        </meta>
        <data>
                <row>
                        <SearchPhrase></SearchPhrase>
                        <field>8267016</field>
                </row>
                <row>
                        <SearchPhrase>bathroom interior design</SearchPhrase>
                        <field>2166</field>
                </row>
                <row>
                        <SearchPhrase>clickhouse</SearchPhrase>
                        <field>1655</field>
                </row>
                <row>
                        <SearchPhrase>2014 spring fashion</SearchPhrase>
                        <field>1549</field>
                </row>
                <row>
                        <SearchPhrase>freeform photos</SearchPhrase>
                        <field>1480</field>
                </row>
                <row>
                        <SearchPhrase>angelina jolie</SearchPhrase>
                        <field>1245</field>
                </row>
                <row>
                        <SearchPhrase>omsk</SearchPhrase>
                        <field>1112</field>
                </row>
                <row>
                        <SearchPhrase>photos of dog breeds</SearchPhrase>
                        <field>1091</field>
                </row>
                <row>
                        <SearchPhrase>curtain designs</SearchPhrase>
                        <field>1064</field>
                </row>
                <row>
                        <SearchPhrase>baku</SearchPhrase>
                        <field>1000</field>
                </row>
        </data>
        <rows>10</rows>
        <rows_before_limit_at_least>141137</rows_before_limit_at_least>
</result>
```

## フォーマット設定 {#format-settings}

## XML {#xml}
