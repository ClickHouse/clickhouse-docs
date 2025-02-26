---
title : XML
slug: /interfaces/formats/XML
keywords : [XML]
input_format: false
output_format: true
alias: []
---

| 入力 | 出力 | エイリアス |
|-------|--------|-------|
| ✗     | ✔      |       |

## 説明 {#description}

`XML` フォーマットは出力専用であり、パースには使用できません。

カラム名が許可されたフォーマットでない場合は、要素名として単に 'field' が使用されます。一般的に、XML 構造は JSON 構造に従います。
JSON 同様、不正な UTF-8 シーケンスは置き換え文字 `�` に変更されるため、出力テキストは有効な UTF-8 シーケンスで構成されます。

文字列値の中で、文字 `<` と `&` はそれぞれ `<` と `&` にエスケープされます。

配列は `<array><elem>Hello</elem><elem>World</elem>...</array>` という形式で出力され、タプルは `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>` という形式で出力されます。

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
                        <SearchPhrase>バスルーム インテリアデザイン</SearchPhrase>
                        <field>2166</field>
                </row>
                <row>
                        <SearchPhrase>クリックハウス</SearchPhrase>
                        <field>1655</field>
                </row>
                <row>
                        <SearchPhrase>2014年春のファッション</SearchPhrase>
                        <field>1549</field>
                </row>
                <row>
                        <SearchPhrase>自由形式の写真</SearchPhrase>
                        <field>1480</field>
                </row>
                <row>
                        <SearchPhrase>アンジェリーナ・ジョリー</SearchPhrase>
                        <field>1245</field>
                </row>
                <row>
                        <SearchPhrase>オムスク</SearchPhrase>
                        <field>1112</field>
                </row>
                <row>
                        <SearchPhrase>犬種の写真</SearchPhrase>
                        <field>1091</field>
                </row>
                <row>
                        <SearchPhrase>カーテンデザイン</SearchPhrase>
                        <field>1064</field>
                </row>
                <row>
                        <SearchPhrase>バクー</SearchPhrase>
                        <field>1000</field>
                </row>
        </data>
        <rows>10</rows>
        <rows_before_limit_at_least>141137</rows_before_limit_at_least>
</result>
```

## フォーマット設定 {#format-settings}

## XML {#xml}
