---
sidebar_label: 'R2DBC ドライバ'
sidebar_position: 5
keywords: ['clickhouse', 'java', 'driver', 'integrate', 'r2dbc']
description: 'ClickHouse R2DBC ドライバ'
slug: /integrations/java/r2dbc
title: 'R2DBC ドライバ'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

# R2DBC ドライバ \\{#r2dbc-driver\\}

## R2DBC ドライバー \\{#r2dbc-driver\\}

ClickHouse 向け非同期 Java クライアントの [R2DBC](https://r2dbc.io/) ラッパーです。

### 環境要件 \\{#environment-requirements\\}

- [OpenJDK](https://openjdk.java.net) バージョン 8 以上

### セットアップ \\{#setup\\}

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- change to clickhouse-r2dbc_0.9.1 for SPI 0.9.1.RELEASE -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.7.1</version>
    <!-- use uber jar with all dependencies included, change classifier to http or grpc for smaller jar -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### ClickHouse に接続する \\{#connect-to-clickhouse\\}

```java showLineNumbers
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### Query \\{#query\\}

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

### Insert \\{#insert\\}

```java showLineNumbers
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
