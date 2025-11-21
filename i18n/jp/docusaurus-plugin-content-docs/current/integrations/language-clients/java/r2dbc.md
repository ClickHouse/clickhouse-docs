---
sidebar_label: 'R2DBC ドライバー'
sidebar_position: 5
keywords: ['clickhouse', 'java', 'ドライバー', '連携', 'r2dbc']
description: 'ClickHouse R2DBC ドライバー'
slug: /integrations/java/r2dbc
title: 'R2DBC ドライバー'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# R2DBC ドライバ



## R2DBCドライバー {#r2dbc-driver}

ClickHouse用非同期Javaクライアントの[R2DBC](https://r2dbc.io/)ラッパーです。

### 環境要件 {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) バージョン8以上

### セットアップ {#setup}

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- SPI 0.9.1.RELEASEの場合はclickhouse-r2dbc_0.9.1に変更してください -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.7.1</version>
    <!-- すべての依存関係を含むuber jarを使用します。より小さなjarにする場合はclassifierをhttpまたはgrpcに変更してください -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### ClickHouseへの接続 {#connect-to-clickhouse}

```java showLineNumbers
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### クエリ {#query}

```java showLineNumbers
connection
    .createStatement("select domain, path,  toDate(cdate) as d, count(1) as count from clickdb.clicks where domain = :domain group by domain, path, d")
    .bind("domain", domain)
    .execute()
    .flatMap(result -> result
    .map((row, rowMetadata) -> String.format("%s%s[%s]:%d", row.get("domain", String.class),
        row.get("path", String.class),
        row.get("d", LocalDate.class),
        row.get("count", Long.class)))
    )
    .doOnNext(System.out::println)
    .subscribe();
```

### 挿入 {#insert}

```java showLineNumbers
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
