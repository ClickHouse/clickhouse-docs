---
description: 'Составные протоколы позволяют более гибкую конфигурацию TCP-доступа
  к серверу ClickHouse.'
sidebar_label: 'Составные протоколы'
sidebar_position: 64
slug: /operations/settings/composable-protocols
title: 'Составные протоколы'
---


# Составные протоколы

## Обзор {#overview}

Составные протоколы позволяют более гибкую конфигурацию TCP-доступа к 
серверу ClickHouse. Эта конфигурация может сосуществовать рядом с обычной 
конфигурацией или заменять её.

## Конфигурация составных протоколов {#composable-protocols-section-is-denoted-as-protocols-in-configuration-xml}

Составные протоколы можно настроить в XML-файле конфигурации. Раздел протоколов 
обозначается тегами `protocols` в XML-файле конфигурации:

```xml
<protocols>

</protocols>
```

### Конфигурация уровней протокола {#basic-modules-define-protocol-layers}

Вы можете определить уровни протокола, используя базовые модули. Например, чтобы 
определить HTTP-уровень, вы можете добавить новый базовый модуль в раздел 
`protocols`:

```xml
<protocols>

  <!-- модуль plain_http -->
  <plain_http>
    <type>http</type>
  </plain_http>

</protocols>
```
Модули могут быть настроены в соответствии с:

- `plain_http` - имя, по которому можно ссылаться с другого уровня
- `type` - обозначает обработчик протокола, который будет создан для обработки 
  данных. Он имеет следующий набор предопределённых обработчиков протоколов:
  * `tcp` - нативный обработчик протокола ClickHouse
  * `http` - обработчик протокола HTTP ClickHouse
  * `tls` - уровень шифрования TLS
  * `proxy1` - уровень PROXYv1
  * `mysql` - обработчик протокола совместимости с MySQL
  * `postgres` - обработчик протокола совместимости с PostgreSQL
  * `prometheus` - обработчик протокола Prometheus
  * `interserver` - обработчик межсерверного взаимодействия ClickHouse

:::note
Обработчик протокола `gRPC` не реализован для `Составных протоколов`
:::

### Конфигурация конечных точек {#endpoint-ie-listening-port-is-denoted-by-port-and-optional-host-tags}

Конечные точки (слушающие порты) обозначены тегами `<port>` и опциональными тегами 
`<host>`. Например, для настройки конечной точки на ранее добавленном уровне HTTP 
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

Если тег `<host>` опущен, то используется `<listen_host>` из корневой конфигурации.

### Конфигурация последовательностей уровней {#layers-sequence-is-defined-by-impl-tag-referencing-another-module}

Последовательности уровней определяются с помощью тега `<impl>` и ссылки на другой 
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

### Присоединение конечных точек к уровням {#endpoint-can-be-attached-to-any-layer}

Конечные точки могут быть прикреплены к любому уровню. Например, мы можем определить 
конечные точки для HTTP (порт 8123) и HTTPS (порт 8443):

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

Дополнительные конечные точки могут быть определены путем ссылки на любой модуль и 
опускаем тега `<type>`. Например, мы можем определить конечную точку `another_http` 
для модуля `plain_http` следующим образом:

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

Некоторые модули могут содержать дополнительные параметры уровня. Например, уровень 
TLS позволяет указать закрытый ключ (`privateKeyFile`) и файлы сертификатов 
(`certificateFile`) следующим образом:

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
