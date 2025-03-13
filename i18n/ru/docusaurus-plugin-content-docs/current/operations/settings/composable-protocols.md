---
slug: /operations/settings/composable-protocols
sidebar_position: 64
sidebar_label: Комбинируемые протоколы
title: "Комбинируемые протоколы"
description: "Комбинируемые протоколы позволяют более гибко настраивать доступ по TCP к серверу ClickHouse."
---


# Комбинируемые протоколы

Комбинируемые протоколы позволяют более гибко настраивать доступ по TCP к серверу ClickHouse. Эта настройка может сосуществовать с традиционной конфигурацией или заменять её.

## Секция комбинируемых протоколов обозначается как `protocols` в конфигурационном xml {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}
**Пример:**
``` xml
<protocols>

</protocols>
```

## Основные модули определяют слои протоколов {#basic-modules-define-protocol-layers}
**Пример:**
``` xml
<protocols>

  <!-- модуль plain_http -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
где:
- `plain_http` - имя, на которое может ссылаться другой слой
- `type` - обозначает обработчик протокола, который будет инстанцирован для обработки данных, набор обработчиков протоколов предопределен:
  * `tcp` - родной обработчик протокола ClickHouse
  * `http` - обработчик протокола ClickHouse через http
  * `tls` - уровень шифрования TLS
  * `proxy1` - уровень PROXYv1
  * `mysql` - обработчик протокола совместимости MySQL
  * `postgres` - обработчик протокола совместимости PostgreSQL
  * `prometheus` - обработчик протокола Prometheus
  * `interserver` - обработчик межсерверного взаимодействия ClickHouse

:::note
Обработчик протокола `gRPC` не реализован для `Комбинируемых протоколов`
:::
 
## Точка доступа (т.е. порт прослушивания) обозначается тегами `<port>` и (по желанию) `<host>` {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}
**Пример:**
``` xml
<protocols>

  <plain_http>

    <type>http</type>
    <!-- точка доступа -->
    <host>127.0.0.1</host>
    <port>8123</port>

  </plain_http>

</protocols>
```
Если `<host>` опущен, то используется `<listen_host>` из корневой конфигурации.

## Последовательность слоев определяется тегом `<impl>`, ссылающимся на другой модуль {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}
**Пример:** определение для протокола HTTPS
``` xml
<protocols>

  <!-- модуль http -->
  <plain_http>
    <type>http</type>
  </plain_http>

  <!-- модуль https настроен как уровень tls над модулем plain_http -->
  <https>
    <type>tls</type>
    <impl>plain_http</impl>
    <host>127.0.0.1</host>
    <port>8443</port>
  </https>

</protocols>
```

## Точка доступа может быть присоединена к любому слою {#endpoint-can-be-attached-to-any-layer}
**Пример:** определение для HTTP (порт 8123) и HTTPS (порт 8443) точек доступа
``` xml
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

## Дополнительные точки доступа могут быть определены ссылаясь на любой модуль и опуская тег `<type>` {#additional-endpoints-can-be-defined-by-referencing-any-module-and-omitting-type-tag}
**Пример:** точка доступа `another_http` определена для модуля `plain_http`
``` xml
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

## Некоторые модули могут содержать специфические для своего слоя параметры {#some-modules-can-contain-specific-for-its-layer-parameters}
**Пример:** для слоя TLS можно указать файлы с личным ключом (`privateKeyFile`) и сертификатами (`certificateFile`)
``` xml
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
