---
alias: []
description: 'Документация по формату XML'
input_format: false
keywords: ['XML']
output_format: true
slug: /interfaces/formats/XML
title: 'XML'
doc_type: 'reference'
---

| Вход | Выход | Псевдоним |
|-------|--------|-------|
| ✗     | ✔      |       |



## Описание {#description}

Формат `XML` предназначен только для вывода и не подходит для парсинга. 

Если имя столбца имеет недопустимый формат, в качестве имени элемента используется просто `field`. В целом структура XML соответствует структуре JSON.
Как и в случае с JSON, недопустимые последовательности UTF-8 заменяются символом подстановки `�`, чтобы выходной текст состоял из корректных последовательностей UTF-8.

В строковых значениях символы `<` и `&` экранируются как `<` и `&`.

Массивы выводятся как `<array><elem>Hello</elem><elem>World</elem>...</array>`, а кортежи — как `<tuple><elem>Hello</elem><elem>World</elem>...</tuple>`.



## Пример использования {#example-usage}

Пример:

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
                        <SearchPhrase>дизайн интерьера ванной</SearchPhrase>
                        <field>2166</field>
                </row>
                <row>
                        <SearchPhrase>clickhouse</SearchPhrase>
                        <field>1655</field>
                </row>
                <row>
                        <SearchPhrase>весенняя мода 2014</SearchPhrase>
                        <field>1549</field>
                </row>
                <row>
                        <SearchPhrase>фото в свободной форме</SearchPhrase>
                        <field>1480</field>
                </row>
                <row>
                        <SearchPhrase>анджелина джоли</SearchPhrase>
                        <field>1245</field>
                </row>
                <row>
                        <SearchPhrase>омск</SearchPhrase>
                        <field>1112</field>
                </row>
                <row>
                        <SearchPhrase>фото пород собак</SearchPhrase>
                        <field>1091</field>
                </row>
                <row>
                        <SearchPhrase>дизайн штор</SearchPhrase>
                        <field>1064</field>
                </row>
                <row>
                        <SearchPhrase>баку</SearchPhrase>
                        <field>1000</field>
                </row>
        </data>
        <rows>10</rows>
        <rows_before_limit_at_least>141137</rows_before_limit_at_least>
</result>
```


## Параметры форматирования {#format-settings}



## XML {#xml}