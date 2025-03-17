---
sidebar_label: 'Организации'
title: 'Организации'
---

## Получить список доступных организаций

Возвращает список с единственной организацией, связанной с API-ключом в запросе.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations` |

### Запрос


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Получить детали организации

Возвращает детали единственной организации. Для получения деталей ключ авторизации должен принадлежать организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Обновить детали организации

Обновляет поля организации. Требуется роль ADMIN для ключа авторизации.

| Метод | Путь |
| :----- | :--- |
| PATCH | `/v1/organizations/{organizationId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID организации для обновления. | 

### Параметры тела

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| name | string | Название организации. | 
| privateEndpoints |  |  | 

### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | uuid | Уникальный ID организации. | 
| createdAt | date-time | Временная метка создания организации. ISO-8601. | 
| name | string | Название организации. | 
| privateEndpoints | array | Список частных конечных точек для организации | 
| byocConfig | array | Конфигурация BYOC для организации | 


#### Пример ответа

```
{
  "id": "uuid",
  "createdAt": "date-time",
  "name": "string",
  "privateEndpoints": "Array",
  "byocConfig": "Array"
}
```

## Список действий организации

Возвращает список всех действий организации.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| from_date | date-time | Начальная дата для поиска | 
| to_date | date-time | Конечная дата для поиска | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID действия. | 
| createdAt | date-time | Временная метка действия. ISO-8601. | 
| type | string | Тип действия. | 
| actorType | string | Тип актера: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актера. | 
| actorDetails | string | Дополнительная информация об актере. | 
| actorIpAddress | string | IP-адрес актера. Определен для актеров типов 'user' и 'api'. | 
| organizationId | string | Область действия: ID организации, к которой относится это действие. | 
| serviceId | string | Область действия: ID сервиса, к которому относится это действие. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```

## Действие организации

Возвращает одно действие организации по ID.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/activities/{activityId}` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| activityId | string | ID запрашиваемого действия. | 


### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| id | string | Уникальный ID действия. | 
| createdAt | date-time | Временная метка действия. ISO-8601. | 
| type | string | Тип действия. | 
| actorType | string | Тип актера: 'user', 'support', 'system', 'api'. | 
| actorId | string | Уникальный ID актера. | 
| actorDetails | string | Дополнительная информация об актере. | 
| actorIpAddress | string | IP-адрес актера. Определен для актеров типов 'user' и 'api'. | 
| organizationId | string | Область действия: ID организации, к которой относится это действие. | 
| serviceId | string | Область действия: ID сервиса, к которому относится это действие. | 


#### Пример ответа

```
{
  "id": "string",
  "createdAt": "date-time",
  "type": "string",
  "actorType": "string",
  "actorId": "string",
  "actorDetails": "string",
  "actorIpAddress": "string",
  "organizationId": "string",
  "serviceId": "string"
}
```
