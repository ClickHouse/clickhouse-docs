---
description: 'Композиционные протоколы позволяют более гибкую конфигурацию TCP-доступа к серверу ClickHouse.'
sidebar_label: 'Композиционные протоколы'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'Композиционные протоколы'
---


# Композиционные протоколы

## Обзор {#overview}

Композиционные протоколы позволяют более гибкую конфигурацию TCP-доступа к серверу 
ClickHouse. Эта конфигурация может сосуществовать с традиционной конфигурацией или заменять её.

## Настройка композиционных протоколов {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

Композиционные протоколы можно настраивать в XML-файле конфигурации. Раздел 
протоколов обозначается тегами `protocols` в файле XML-конфигурации:

```xml
<protocols>

</protocols>
```

### Настройка уровней протокола {#basic-modules-define-protocol-layers}

Вы можете определить уровни протокола с помощью базовых модулей. Например, чтобы определить 
HTTP-уровень, вы можете добавить новый базовый модуль в раздел `protocols`:

```xml
<protocols>

  <!-- модуль plain_http -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

Модули могут быть настроены по следующим параметрам:

- `plain_http` - имя, на которое может ссылаться другой уровень
- `type` - обозначает обработчик протокола, который будет инстанцирован для обработки данных.
   Он имеет следующий набор предопределённых обработчиков протоколов:
  * `tcp` - нативный обработчик протокола clickhouse
  * `http` - обработчик протокола HTTP clickhouse
  * `tls` - уровень шифрования TLS
  * `proxy1` - уровень PROXYv1
  * `mysql` - обработчик протокола совместимости MySQL
  * `postgres` - обработчик протокола совместимости PostgreSQL
  * `prometheus` - обработчик протокола Prometheus
  * `interserver` - обработчик clickhouse interserver

:::note
Обработчик протокола `gRPC` не реализован для `Композиционных протоколов`
:::
 
### Настройка конечных точек {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

Конечные точки (порты прослушивания) обозначаются тегами `<port>` и необязательными тегами `<host>`.
Например, чтобы настроить конечную точку на ранее добавленном HTTP-уровне, 
мы можем изменить нашу конфигурацию следующим образом:

```xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- конечная точка -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```

Если тег `<host>` пропущен, то используется `<listen_host>` из корневой конфигурации.

### Настройка последовательности уровней {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

Последовательности уровней определяются с помощью тега `<impl>`, ссылающегося на другой 
модуль. Например, чтобы настроить уровень TLS поверх нашего модуля plain_http,
мы можем дополнительно изменить нашу конфигурацию следующим образом:

```xml
<protocols>

  <!-- модуль http -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- модуль https, настроенный как уровень tls поверх модуля plain_http -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

### Привязка конечных точек к уровням {#endpoint-can-be-attached-to-any-layer}

Конечные точки могут быть привязаны к любому уровню. Например, мы можем определить конечные точки для 
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

Дополнительные конечные точки можно определить, ссылаясь на любой модуль и пропуская 
тег `<type>`. Например, мы можем определить конечную точку `another_http` для 
модуля `plain_http` следующим образом:

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
позволяет задать закрытый ключ (`privateKeyFile`) и файлы сертификатов (`certificateFile`)
следующим образом:

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
