---
sidebar_label: 'Драйвер R2DBC'
sidebar_position: 5
keywords: ['clickhouse', 'java', 'driver', 'integrate', 'r2dbc']
description: 'Драйвер R2DBC для ClickHouse'
slug: /integrations/java/r2dbc
title: 'Драйвер R2DBC'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';


# Драйвер R2DBC



## Драйвер R2DBC {#r2dbc-driver}

Обёртка [R2DBC](https://r2dbc.io/) над асинхронным Java-клиентом для ClickHouse.

### Системные требования {#environment-requirements}

- [OpenJDK](https://openjdk.java.net) версии >= 8

### Установка {#setup}

```xml
<dependency>
    <groupId>com.clickhouse</groupId>
    <!-- измените на clickhouse-r2dbc_0.9.1 для SPI 0.9.1.RELEASE -->
    <artifactId>clickhouse-r2dbc</artifactId>
    <version>0.7.1</version>
    <!-- используйте uber jar со всеми зависимостями, измените classifier на http или grpc для уменьшения размера jar -->
    <classifier>all</classifier>
    <exclusions>
        <exclusion>
            <groupId>*</groupId>
            <artifactId>*</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

### Подключение к ClickHouse {#connect-to-clickhouse}

```java showLineNumbers
ConnectionFactory connectionFactory = ConnectionFactories
    .get("r2dbc:clickhouse:http://{username}:{password}@{host}:{port}/{database}");

    Mono.from(connectionFactory.create())
        .flatMapMany(connection -> connection
```

### Выполнение запросов {#query}

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

### Вставка данных {#insert}

```java showLineNumbers
connection
    .createStatement("insert into clickdb.clicks values (:domain, :path, :cdate, :count)")
    .bind("domain", click.getDomain())
    .bind("path", click.getPath())
    .bind("cdate", LocalDateTime.now())
    .bind("count", 1)
    .execute();
```
