---
description: 'Компонуемые протоколы обеспечивают более гибкую конфигурацию TCP-доступа
  к серверу ClickHouse.'
sidebar_label: 'Компонуемые протоколы'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'Компонуемые протоколы'
doc_type: 'reference'
---



# Композиционные протоколы



## Обзор {#overview}

Композитные протоколы обеспечивают более гибкую настройку TCP-доступа к
серверу ClickHouse. Данная конфигурация может использоваться совместно с
обычной конфигурацией или полностью заменять её.


## Настройка композитных протоколов {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

Композитные протоколы настраиваются в XML-файле конфигурации. Секция протоколов
обозначается тегами `protocols` в XML-файле конфигурации:

```xml
<protocols>

</protocols>
```

### Настройка уровней протоколов {#basic-modules-define-protocol-layers}

Уровни протоколов определяются с помощью базовых модулей. Например, чтобы определить
уровень HTTP, добавьте новый базовый модуль в секцию `protocols`:

```xml
<protocols>

  <!-- модуль plain_http -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```

Модули настраиваются в соответствии со следующими параметрами:

- `plain_http` — имя, на которое может ссылаться другой уровень
- `type` — обозначает обработчик протокола, который будет создан для обработки данных.
  Доступны следующие предопределенные обработчики протоколов:
  - `tcp` — обработчик нативного протокола ClickHouse
  - `http` — обработчик HTTP-протокола ClickHouse
  - `tls` — уровень шифрования TLS
  - `proxy1` — уровень PROXYv1
  - `mysql` — обработчик протокола совместимости с MySQL
  - `postgres` — обработчик протокола совместимости с PostgreSQL
  - `prometheus` — обработчик протокола Prometheus
  - `interserver` — обработчик межсерверного взаимодействия ClickHouse

:::note
Обработчик протокола `gRPC` не реализован для композитных протоколов
:::

### Настройка конечных точек {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

Конечные точки (прослушиваемые порты) обозначаются тегами `<port>` и необязательным тегом `<host>`.
Например, чтобы настроить конечную точку на ранее добавленном уровне HTTP,
измените конфигурацию следующим образом:

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

Если тег `<host>` опущен, используется значение `<listen_host>` из корневой конфигурации.

### Настройка последовательностей уровней {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

Последовательности уровней определяются с помощью тега `<impl>` и ссылки на другой
модуль. Например, чтобы настроить уровень TLS поверх модуля plain_http,
дополнительно измените конфигурацию следующим образом:

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

Конечные точки можно привязать к любому уровню. Например, можно определить конечные точки для
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

Дополнительные конечные точки можно определить, ссылаясь на любой модуль и опуская
тег `<type>`. Например, можно определить конечную точку `another_http` для
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

```


</protocols>
```

### Указание дополнительных параметров слоя {#some-modules-can-contain-specific-for-its-layer-parameters}

Некоторые модули могут содержать дополнительные параметры слоя. Например, слой TLS
позволяет указать файл закрытого ключа (`privateKeyFile`) и файл сертификата (`certificateFile`)
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
