---
description: 'GROUPING 集約関数に関するドキュメント。'
slug: /sql-reference/aggregate-functions/grouping_function
title: 'GROUPING'
doc_type: 'reference'
---



# グルーピング



## GROUPING {#grouping}

[ROLLUP](../statements/select/group-by.md/#rollup-modifier)と[CUBE](../statements/select/group-by.md/#cube-modifier)はGROUP BYの修飾子です。これらはいずれも小計を計算します。ROLLUPは、例えば`(day, month, year)`のような順序付き列リストを受け取り、集計の各レベルで小計を計算した後、総計を算出します。CUBEは指定された列のすべての可能な組み合わせについて小計を計算します。GROUPINGは、ROLLUPまたはCUBEによって返される行のうち、どれが上位集計であり、どれが修飾されていないGROUP BYによって返される通常の行であるかを識別します。

GROUPING関数は複数の列を引数として受け取り、ビットマスクを返します。

- `1`は、`GROUP BY`の`ROLLUP`または`CUBE`修飾子によって返される行が小計であることを示します
- `0`は、`ROLLUP`または`CUBE`によって返される行が小計ではないことを示します


## GROUPING SETS {#grouping-sets}

デフォルトでは、CUBE修飾子はCUBEに渡されたカラムのすべての可能な組み合わせについて小計を計算します。GROUPING SETSを使用すると、計算する特定の組み合わせを指定できます。

階層データの分析は、ROLLUP、CUBE、およびGROUPING SETS修飾子の優れたユースケースです。ここでのサンプルは、2つのデータセンターにインストールされているLinuxディストリビューションとそのバージョンに関するデータを含むテーブルです。ディストリビューション、バージョン、およびロケーション別にデータを確認することは有用である可能性があります。

### サンプルデータの読み込み {#load-sample-data}

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

10 rows in set. Elapsed: 0.409 sec.
```

### シンプルなクエリ {#simple-queries}

各データセンターのディストリビューション別サーバー数を取得します:

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

4 rows in set. Elapsed: 0.212 sec.
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

2 rows in set. Elapsed: 0.277 sec.
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

2 rows in set. Elapsed: 0.352 sec.
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

1 row in set. Elapsed: 0.244 sec.
```

### GROUPING SETSを使用した複数のGROUP BY文の比較 {#comparing-multiple-group-by-statements-with-grouping-sets}

CUBE、ROLLUP、またはGROUPING SETSを使用せずにデータを分解する場合:

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

9 rows in set. Elapsed: 0.527 sec.
```

GROUPING SETSを使用して同じ情報を取得する場合:

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

9 rows in set. Elapsed: 0.427 sec.
```

### CUBEとGROUPING SETSの比較 {#comparing-cube-with-grouping-sets}

次のクエリの`CUBE(datacenter,distro,version)`は、適切でない階層を生成します。2つのディストリビューション間でバージョンを比較することは意味がありません(ArchとRHELは異なるリリースサイクルとバージョン命名規則を持つため)。この後に続くGROUPING SETSの例の方が適切です。`distro`と`version`を同じセット内でグループ化するためです。


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

39行のセット。経過時間: 0.355秒 
```

:::note
上記の例では、`distro` と関連付けられていない場合、`version` という列はあまり意味をなさないかもしれません。カーネルバージョンを追跡しているのであれば話は別で、カーネルバージョンはどちらの `distro` にも関連付けることができるため、意味を持つと言えます。次の例のように `GROUPING SETS` を使用する方が、より適切な選択となる場合があります。
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

14 rows in set. Elapsed: 1.036 sec. 
```
