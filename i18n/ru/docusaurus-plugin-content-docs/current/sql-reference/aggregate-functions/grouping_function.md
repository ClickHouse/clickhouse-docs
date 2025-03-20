---
slug: /sql-reference/aggregate-functions/grouping_function
---


# ГРУППИРОВКА

## ГРУППИРОВКА {#grouping}

[ROLLUP](../statements/select/group-by.md/#rollup-modifier) и [CUBE](../statements/select/group-by.md/#cube-modifier) являются модификаторами для GROUP BY. Оба из них рассчитывают промежуточные итоги. ROLLUP принимает упорядоченный список колонок, например `(day, month, year)`, и вычисляет промежуточные итоги на каждом уровне агрегации, а затем общий итог. CUBE вычисляет промежуточные итоги для всех возможных комбинаций указанных колонок. Функция GROUPING определяет, какие строки, возвращенные ROLLUP или CUBE, являются суперагрегатами, а какие - это строки, которые были бы возвращены в незмодифицированном GROUP BY.

Функция GROUPING принимает несколько колонок в качестве аргумента и возвращает битовую маску. 
- `1` сигнализирует о том, что строка, возвращенная модификатором `ROLLUP` или `CUBE` к `GROUP BY`, является промежуточным итогом
- `0` сигнализирует о том, что строка, возвращенная `ROLLUP` или `CUBE`, не является промежуточным итогом

## МНОЖЕСТВА ГРУППИРОВКИ {#grouping-sets}

По умолчанию, модификатор CUBE рассчитывает промежуточные итоги для всех возможных комбинаций колонок, переданных в CUBE. Множества группировки (GROUPING SETS) позволяют вам указать конкретные комбинации для расчета.

Анализ иерархических данных является хорошим примером использования модификаторов ROLLUP, CUBE и GROUPING SETS. Примером может служить таблица, содержащая данные о том, какая дистрибуция Linux и версия этой дистрибуции установлены в двух центрах обработки данных. Может быть полезно рассмотреть данные по дистрибуции, версии и местоположению.

### Загрузка тестовых данных {#load-sample-data}

```sql
CREATE TABLE servers ( datacenter VARCHAR(255),
                         distro VARCHAR(255) NOT NULL,
                         version VARCHAR(50) NOT NULL,
                         quantity INT
                       )
                        ORDER BY (datacenter, distro, version)
```

```sql
INSERT INTO servers(datacenter, distro, version, quantity)
VALUES ('Schenectady', 'Arch','2022.08.05',50),
       ('Westport', 'Arch','2022.08.05',40),
       ('Schenectady','Arch','2021.09.01',30),
       ('Westport', 'Arch','2021.09.01',20),
       ('Schenectady','Arch','2020.05.01',10),
       ('Westport', 'Arch','2020.05.01',5),
       ('Schenectady','RHEL','9',60),
       ('Westport','RHEL','9',70),
       ('Westport','RHEL','7',80),
       ('Schenectady','RHEL','7',80)
```

```sql
SELECT 
    *
FROM
    servers;
```
```response
┌─datacenter──┬─distro─┬─version────┬─quantity─┐
│ Schenectady │ Arch   │ 2020.05.01 │       10 │
│ Schenectady │ Arch   │ 2021.09.01 │       30 │
│ Schenectady │ Arch   │ 2022.08.05 │       50 │
│ Schenectady │ RHEL   │ 7          │       80 │
│ Schenectady │ RHEL   │ 9          │       60 │
│ Westport    │ Arch   │ 2020.05.01 │        5 │
│ Westport    │ Arch   │ 2021.09.01 │       20 │
│ Westport    │ Arch   │ 2022.08.05 │       40 │
│ Westport    │ RHEL   │ 7          │       80 │
│ Westport    │ RHEL   │ 9          │       70 │
└─────────────┴────────┴────────────┴──────────┘

10 строк в наборе. Затраченное время: 0.409 сек.
```

### Простейшие запросы {#simple-queries}

Получить количество серверов в каждом центре обработки данных по дистрибуции: 
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter,
    distro;
```
```response
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘

4 строки в наборе. Затраченное время: 0.212 сек.
```

```sql
SELECT
    datacenter, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter;
```
```response
┌─datacenter──┬─qty─┐
│ Westport    │ 215 │
│ Schenectady │ 230 │
└─────────────┴─────┘

2 строки в наборе. Затраченное время: 0.277 сек. 
```

```sql
SELECT
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    distro;
```

```response

┌─distro─┬─qty─┐
│ Arch   │ 155 │
│ RHEL   │ 290 │
└────────┴─────┘

2 строки в наборе. Затраченное время: 0.352 сек. 
```

```sql
SELECT
    SUM(quantity) qty
FROM
    servers;
```
```response
┌─qty─┐
│ 445 │
└─────┘

1 строка в наборе. Затраченное время: 0.244 сек. 
```

### Сравнение нескольких операторов GROUP BY с использованием GROUPING SETS {#comparing-multiple-group-by-statements-with-grouping-sets}

Разделение данных без CUBE, ROLLUP или GROUPING SETS:
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter,
    distro
UNION ALL
SELECT
    datacenter, 
    null,
    SUM (quantity) qty
FROM
    servers
GROUP BY
    datacenter
UNION ALL
SELECT
    null,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    distro
UNION ALL
SELECT
    null,
    null,
    SUM(quantity) qty
FROM
    servers;
```
```response
┌─datacenter─┬─distro─┬─qty─┐
│ ᴺᵁᴸᴸ       │ ᴺᵁᴸᴸ   │ 445 │
└────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Westport    │ ᴺᵁᴸᴸ   │ 215 │
│ Schenectady │ ᴺᵁᴸᴸ   │ 230 │
└─────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│ ᴺᵁᴸᴸ       │ Arch   │ 155 │
│ ᴺᵁᴸᴸ       │ RHEL   │ 290 │
└────────────┴────────┴─────┘

9 строк в наборе. Затраченное время: 0.527 сек. 
```

Получение той же информации с использованием GROUPING SETS:
```sql
SELECT
    datacenter,
    distro, 
    SUM (quantity) qty
FROM
    servers
GROUP BY
    GROUPING SETS(
        (datacenter,distro),
        (datacenter),
        (distro),
        ()
    )
```
```response
┌─datacenter──┬─distro─┬─qty─┐
│ Schenectady │ RHEL   │ 140 │
│ Westport    │ Arch   │  65 │
│ Schenectady │ Arch   │  90 │
│ Westport    │ RHEL   │ 150 │
└─────────────┴────────┴─────┘
┌─datacenter──┬─distro─┬─qty─┐
│ Westport    │        │ 215 │
│ Schenectady │        │ 230 │
└─────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│            │        │ 445 │
└────────────┴────────┴─────┘
┌─datacenter─┬─distro─┬─qty─┐
│            │ Arch   │ 155 │
│            │ RHEL   │ 290 │
└────────────┴────────┴─────┘

9 строк в наборе. Затраченное время: 0.427 сек.
```

### Сравнение CUBE с GROUPING SETS {#comparing-cube-with-grouping-sets}

CUBE в следующем запросе, `CUBE(datacenter,distro,version)`, предоставляет иерархию, которая может не иметь смысла. Не имеет смысла рассматривать версию в двух дистрибуциях (так как Arch и RHEL не имеют одинакового цикла релизов или стандартов именования версий). Пример GROUPING SETS, который следует за этим, более подходящий, так как он группирует `distro` и `version` в одном наборе. 

```sql
SELECT
   datacenter,
   distro,
   version,
   SUM(quantity)
FROM
   servers
GROUP BY
   CUBE(datacenter,distro,version)
ORDER BY
   datacenter,
   distro;
```
```response
┌─datacenter──┬─distro─┬─version────┬─sum(quantity)─┐
│             │        │ 7          │           160 │
│             │        │ 2020.05.01 │            15 │
│             │        │ 2021.09.01 │            50 │
│             │        │ 2022.08.05 │            90 │
│             │        │ 9          │           130 │
│             │        │            │           445 │
│             │ Arch   │ 2021.09.01 │            50 │
│             │ Arch   │ 2022.08.05 │            90 │
│             │ Arch   │ 2020.05.01 │            15 │
│             │ Arch   │            │           155 │
│             │ RHEL   │ 9          │           130 │
│             │ RHEL   │ 7          │           160 │
│             │ RHEL   │            │           290 │
│ Schenectady │        │ 9          │            60 │
│ Schenectady │        │ 2021.09.01 │            30 │
│ Schenectady │        │ 7          │            80 │
│ Schenectady │        │ 2022.08.05 │            50 │
│ Schenectady │        │ 2020.05.01 │            10 │
│ Schenectady │        │            │           230 │
│ Schenectady │ Arch   │ 2022.08.05 │            50 │
│ Schenectady │ Arch   │ 2021.09.01 │            30 │
│ Schenectady │ Arch   │ 2020.05.01 │            10 │
│ Schenectady │ Arch   │            │            90 │
│ Schenectady │ RHEL   │ 7          │            80 │
│ Schenectady │ RHEL   │ 9          │            60 │
│ Schenectady │ RHEL   │            │           140 │
│ Westport    │        │ 9          │            70 │
│ Westport    │        │ 2020.05.01 │             5 │
│ Westport    │        │ 2022.08.05 │            40 │
│ Westport    │        │ 7          │            80 │
│ Westport    │        │ 2021.09.01 │            20 │
│ Westport    │        │            │           215 │
│ Westport    │ Arch   │ 2020.05.01 │             5 │
│ Westport    │ Arch   │ 2021.09.01 │            20 │
│ Westport    │ Arch   │ 2022.08.05 │            40 │
│ Westport    │ Arch   │            │            65 │
│ Westport    │ RHEL   │ 9          │            70 │
│ Westport    │ RHEL   │ 7          │            80 │
│ Westport    │ RHEL   │            │           150 │
└─────────────┴────────┴────────────┴───────────────┘

39 строк в наборе. Затраченное время: 0.355 сек. 
```
:::note
Версия в приведенном выше примере может не иметь смысла, когда она не ассоциирована с дистрибуцией; если бы мы отслеживали версию ядра, это имело бы смысл, поскольку версия ядра может быть ассоциирована с любой дистрибуцией. Использование GROUPING SETS, как в следующем примере, может быть более подходящим.
:::

```sql
SELECT
    datacenter,
    distro,
    version,
    SUM(quantity)
FROM servers
GROUP BY
    GROUPING SETS (
        (datacenter, distro, version),
        (datacenter, distro))
```
```response
┌─datacenter──┬─distro─┬─version────┬─sum(quantity)─┐
│ Westport    │ RHEL   │ 9          │            70 │
│ Schenectady │ Arch   │ 2022.08.05 │            50 │
│ Schenectady │ Arch   │ 2021.09.01 │            30 │
│ Schenectady │ RHEL   │ 7          │            80 │
│ Westport    │ Arch   │ 2020.05.01 │             5 │
│ Westport    │ RHEL   │ 7          │            80 │
│ Westport    │ Arch   │ 2021.09.01 │            20 │
│ Westport    │ Arch   │ 2022.08.05 │            40 │
│ Schenectady │ RHEL   │ 9          │            60 │
│ Schenectady │ Arch   │ 2020.05.01 │            10 │
└─────────────┴────────┴────────────┴───────────────┘
┌─datacenter──┬─distro─┬─version─┬─sum(quantity)─┐
│ Schenectady │ RHEL   │         │           140 │
│ Westport    │ Arch   │         │            65 │
│ Schenectady │ Arch   │         │            90 │
│ Westport    │ RHEL   │         │           150 │
└─────────────┴────────┴─────────┴───────────────┘

14 строк в наборе. Затраченное время: 1.036 сек. 
```
