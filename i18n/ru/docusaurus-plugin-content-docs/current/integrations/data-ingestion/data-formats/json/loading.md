---
sidebar_label: 'Загрузка JSON'
sidebar_position: 20
title: 'Работа с JSON'
slug: /integrations/data-formats/json/loading
description: 'Загрузка JSON'
keywords: ['json', 'clickhouse', 'вставка', 'загрузка', 'вставка']
score: 15
doc_type: 'guide'
---



# Загрузка JSON {#loading-json}

Ниже приведены очень простые примеры загрузки структурированных и полуструктурированных данных в формате JSON. Для более сложного JSON, включая вложенные структуры, см. руководство [**Проектирование схемы JSON**](/integrations/data-formats/json/schema).



## Загрузка структурированного JSON {#loading-structured-json}

В этом разделе предполагается, что данные находятся в формате [`NDJSON`](https://github.com/ndjson/ndjson-spec) (Newline delimited JSON — JSON, где объекты разделены переводами строки), который в ClickHouse известен как [`JSONEachRow`](/interfaces/formats/JSONEachRow), и хорошо структурированы, то есть имена и типы столбцов фиксированы. Формат `NDJSON` является предпочтительным для загрузки JSON из‑за своей компактности и эффективного использования места, но поддерживаются и другие форматы как для [ввода, так и вывода](/interfaces/formats/JSON).

Рассмотрим следующий пример JSON, представляющий строку из набора данных [Python PyPI](https://clickpy.clickhouse.com/):

```json
{
  "date": "2022-11-15",
  "country_code": "ES",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "pip",
  "python_minor": "3.9",
  "system": "Linux",
  "version": "0.3.0"
}
```

Чтобы загрузить этот JSON-объект в ClickHouse, необходимо определить схему таблицы.

В этом простом случае наша структура статична, имена столбцов известны, а их типы чётко определены.

Хотя ClickHouse и поддерживает полуструктурированные данные через тип JSON, где имена ключей и их типы могут быть динамическими, здесь в этом нет необходимости.

:::note Предпочитайте статические схемы, когда это возможно
В случаях, когда ваши столбцы имеют фиксированные имена и типы, и не ожидается появление новых столбцов, в продуктивной среде всегда следует предпочитать статически определённую схему.

Тип JSON предпочтителен для очень динамичных данных, где имена и типы столбцов часто меняются. Этот тип также полезен для прототипирования и исследования данных.
:::

Простая схема для этого показана ниже, где **ключи JSON сопоставляются с именами столбцов**:

```sql
CREATE TABLE pypi (
  `date` Date,
  `country_code` String,
  `project` String,
  `type` String,
  `installer` String,
  `python_minor` String,
  `system` String,
  `version` String
)
ENGINE = MergeTree
ORDER BY (project, date)
```

:::note Ключи сортировки
Здесь мы выбрали ключ сортировки с помощью оператора `ORDER BY`. Дополнительные сведения о ключах сортировки и о том, как их выбирать, см. [здесь](/data-modeling/schema-design#choosing-an-ordering-key).
:::

ClickHouse может загружать JSON-данные в нескольких форматах, автоматически определяя тип по расширению и содержимому. Мы можем читать JSON-файлы для указанной выше таблицы с помощью [функции S3](/sql-reference/table-functions/s3):

```sql
SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
LIMIT 1
┌───────date─┬─country_code─┬─project────────────┬─type────────┬─installer────┬─python_minor─┬─system─┬─version─┐
│ 2022-11-15 │ CN           │ clickhouse-connect │ bdist_wheel │ bandersnatch │              │        │ 0.2.8 │
└────────────┴──────────────┴────────────────────┴─────────────┴──────────────┴──────────────┴────────┴─────────┘

1 строка в наборе. Затрачено: 1.232 сек.
```

Обратите внимание, что нам не нужно явно указывать формат файла. Вместо этого мы используем glob‑шаблон, чтобы прочитать все файлы `*.json.gz` в бакете. ClickHouse автоматически определяет, что формат — `JSONEachRow` (ndjson), по расширению и содержимому файла. Формат можно указать вручную с помощью параметризованных функций на случай, если ClickHouse не сможет определить его автоматически.

```sql
SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz', JSONEachRow)
```

:::note Сжатые файлы
Указанные выше файлы также сжаты. ClickHouse автоматически определяет и обрабатывает их.
:::

Чтобы загрузить строки из этих файлов, мы можем использовать [`INSERT INTO SELECT`](/sql-reference/statements/insert-into#inserting-the-results-of-select):

```sql
INSERT INTO pypi SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/json/*.json.gz')
Ok.

0 строк в наборе. Прошло: 10.445 сек. Обработано 19.49 млн строк, 35.71 МБ (1.87 млн строк/сек., 3.42 МБ/сек.)

SELECT * FROM pypi LIMIT 2
```


┌───────date─┬─country&#95;code─┬─project────────────┬─type──┬─installer────┬─python&#95;minor─┬─system─┬─version─┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┘

2 строки в наборе. Время выполнения: 0.005 сек. Обработано 8.19 тысяч строк, 908.03 KB (1.63 миллиона строк/с., 180.38 MB/с.)

````

Строки также можно загрузить непосредственно в запросе, используя [предложение `FORMAT`](/sql-reference/statements/select/format), например:

```sql
INSERT INTO pypi
FORMAT JSONEachRow
{"date":"2022-11-15","country_code":"CN","project":"clickhouse-connect","type":"bdist_wheel","installer":"bandersnatch","python_minor":"","system":"","version":"0.2.8"}
````

В этих примерах используется формат `JSONEachRow`. Поддерживаются и другие распространённые форматы JSON; примеры их загрузки приведены [здесь](/integrations/data-formats/json/other-formats).


## Загрузка полуструктурированного JSON {#loading-semi-structured-json}

В нашем предыдущем примере мы загружали JSON с фиксированной структурой и хорошо известными именами ключей и типами. На практике так бывает не всегда — ключи могут добавляться, а их типы меняться. Это часто встречается в сценариях, связанных с данными для наблюдаемости (Observability).

ClickHouse обрабатывает такие случаи с помощью специализированного типа [`JSON`](/sql-reference/data-types/newjson).

Рассмотрим следующий пример из расширенной версии описанного выше набора данных [Python PyPI dataset](https://clickpy.clickhouse.com/). Здесь мы добавили произвольный столбец `tags` со случайными парами «ключ–значение».

```json
{
  "date": "2022-09-22",
  "country_code": "IN",
  "project": "clickhouse-connect",
  "type": "bdist_wheel",
  "installer": "bandersnatch",
  "python_minor": "",
  "system": "",
  "version": "0.2.8",
  "tags": {
    "5gTux": "f3to*PMvaTYZsz!*rtzX1",
    "nD8CV": "value"
  }
}

```

Столбец `tags` здесь непредсказуем и, следовательно, его невозможно смоделировать. Чтобы загрузить эти данные, мы можем использовать нашу предыдущую схему, добавив дополнительный столбец `tags` типа [`JSON`](/sql-reference/data-types/newjson):

```sql
SET enable_json_type = 1;

CREATE TABLE pypi_with_tags
(
    `date` Date,
    `country_code` String,
    `project` String,
    `type` String,
    `installer` String,
    `python_minor` String,
    `system` String,
    `version` String,
    `tags` JSON
)
ENGINE = MergeTree
ORDER BY (project, date);
```

Заполним таблицу тем же способом, что и исходный набор данных:

```sql
INSERT INTO pypi_with_tags SELECT * FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')
```

```sql
INSERT INTO pypi_with_tags SELECT *
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/pypi/pypi_with_tags/sample.json.gz')

Ok.

0 строк в наборе. Прошло: 255.679 сек. Обработано 1.00 млн строк, 29.00 МБ (3.91 тыс. строк/с., 113.43 КБ/с.)
Пик использования памяти: 2.00 ГиБ.

SELECT *
FROM pypi_with_tags
LIMIT 2

┌───────date─┬─country_code─┬─project────────────┬─type──┬─installer────┬─python_minor─┬─system─┬─version─┬─tags─────────────────────────────────────────────────────┐
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"nsBM":"5194603446944555691"}                           │
│ 2022-05-26 │ CN           │ clickhouse-connect │ sdist │ bandersnatch │              │        │ 0.0.7 │ {"4zD5MYQz4JkP1QqsJIS":"0","name":"8881321089124243208"} │
└────────────┴──────────────┴────────────────────┴───────┴──────────────┴──────────────┴────────┴─────────┴──────────────────────────────────────────────────────────┘

2 строки в наборе. Прошло: 0.149 сек.
```

Обратите внимание на разницу в производительности при загрузке данных. Для JSON-столбца при вставке требуется определение типов, а также дополнительное место для хранения, если есть столбцы, содержащие значения более чем одного типа. Хотя тип JSON можно настроить (см. [Проектирование схемы JSON](/integrations/data-formats/json/schema)) так, чтобы его производительность была сопоставима с явным объявлением столбцов, по умолчанию он намеренно остаётся гибким. Однако эта гибкость имеет свою цену.

### Когда использовать тип JSON {#when-to-use-the-json-type}

Используйте тип JSON, когда ваши данные:

* Имеют **непредсказуемые ключи**, которые могут меняться со временем.
* Содержат **значения с различными типами** (например, путь может иногда содержать строку, а иногда число).
* Требуют гибкости схемы, когда строгая типизация невозможна.

Если структура ваших данных известна и стабильна, необходимость в типе JSON возникает редко, даже если ваши данные находятся в формате JSON. В частности, если ваши данные имеют:


* **Плоская структура с известными ключами**: используйте стандартные типы столбцов, например String.
* **Предсказуемая вложенность**: используйте типы Tuple, Array или Nested для таких структур.
* **Предсказуемая структура с изменяющимися типами**: в таком случае рассмотрите использование типов Dynamic или Variant.

Вы также можете комбинировать подходы, как показано в приведённом выше примере, используя статические столбцы для предсказуемых ключей верхнего уровня и один JSON-столбец для динамической части данных.
