---
slug: '/operations/settings/composable-protocols'
sidebar_label: 'Составные протоколы'
sidebar_position: 64
description: 'Комбинированные протоколы позволяют более гибкую конфигурацию доступа'
title: 'Составные протоколы'
doc_type: reference
---
# Компонуемые протоколы

## Обзор {#overview}

Компонуемые протоколы позволяют более гибко настраивать доступ по TCP к 
серверу ClickHouse. Эта конфигурация может сосуществовать с традиционной конфигурацией или заменять ее.

## Настройка компонуемых протоколов {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

Компонуемые протоколы могут быть настроены в XML-файле конфигурации. Раздел протоколов 
обозначен тегами `protocols` в XML-файле конфигурации: 

```xml
<protocols>

</protocols>
```

### Настройка уровней протоколов {#basic-modules-define-protocol-layers}

Вы можете определить уровни протоколов, используя базовые модули. Например, чтобы определить 
HTTP-уровень, вы можете добавить новый базовый модуль в раздел `protocols`:

```xml
<protocols>

  <!-- plain_http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
Модули могут быть настроены в соответствии с:

- `plain_http` - имя, к которому можно ссылаться из другого уровня
- `type` - обозначает обработчик протокола, который будет инстанцирован для обработки данных.
   Он имеет следующий набор предопределенных обработчиков протоколов:
  * `tcp` - обработчик нативного протокола ClickHouse
  * `http` - обработчик протокола HTTP ClickHouse
  * `tls` - уровень шифрования TLS
  * `proxy1` - уровень PROXYv1
  * `mysql` - обработчик протокола совместимости MySQL
  * `postgres` - обработчик протокола совместимости PostgreSQL
  * `prometheus` - обработчик протокола Prometheus
  * `interserver` - обработчик ClickHouse для межсерверного взаимодействия

:::note
Обработчик протокола `gRPC` не реализован для `Компонуемых протоколов`
:::
 
### Настройка конечных точек {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

Конечные точки (слушающие порты) обозначаются тегами `<port>` и необязательными тегами `<host>`. 
Например, для настройки конечной точки на ранее добавленном HTTP-уровне 
мы могли бы изменить нашу конфигурацию следующим образом:

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- endpoint -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

Если тег `<host>` опущен, то используется `<listen_host>` из корневой конфигурации.

### Настройка последовательностей уровней {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

Последовательности уровней определяются с использованием тега `<impl>` и указанием на другой 
модуль. Например, чтобы настроить уровень TLS поверх нашего модуля plain_http, 
мы могли бы далее изменить нашу конфигурацию следующим образом:

```xml
<protocols>

  <!-- http module -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- https module configured as a tls layer on top of plain_http module -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Присоединение конечных точек к уровням {#endpoint-can-be-attached-to-any-layer}

Конечные точки могут быть прикреплены к любому уровню. Например, мы можем определить конечные точки для
HTTP (порт 8123) и HTTPS (порт 8443):

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Определение дополнительных конечных точек {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}

Дополнительные конечные точки могут быть определены путем обращения к любому модулю и опускания тега 
`<type>`. Например, мы можем определить конечную точку `another_http` для модуля 
`plain_http` следующим образом:

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

  <another_http>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8223</port>
  </another_http>

</protocols>
```

### Указание дополнительных параметров уровня {#some-modules-can-contain-specific-for-its-layer-parameters}

Некоторые модули могут содержать дополнительные параметры уровня. Например, уровень TLS 
позволяет указать файлы личного ключа (`privateKeyFile`) и сертификата (`certificateFile`) следующим образом:

```xml
<protocols>

  <plain_http>
    <type>http</type>
    <host>127.0.0.1</host>
    <port>8123</port>
  </plain_http>

  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
    <privateKeyFile>another_server.key</privateKeyFile>
    <certificateFile>another_server.crt</certificateFile>
  </https>

</protocols>
```