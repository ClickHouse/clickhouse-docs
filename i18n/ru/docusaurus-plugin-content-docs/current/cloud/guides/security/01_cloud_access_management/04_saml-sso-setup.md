---
sidebar_label: 'Настройка SAML SSO'
slug: /cloud/security/saml-setup
title: 'Настройка SAML SSO'
description: 'Как настроить SAML SSO для ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'SAML', 'SSO', 'single sign-on', 'IdP', 'Okta', 'Google']
---

import Image from '@theme/IdealImage';
import samlSelfServe1 from '@site/static/images/cloud/security/saml-self-serve-1.png';
import samlSelfServe2 from '@site/static/images/cloud/security/saml-self-serve-2.png';
import samlSelfServe3 from '@site/static/images/cloud/security/saml-self-serve-3.png';
import samlSelfServe4 from '@site/static/images/cloud/security/saml-self-serve-4.png';
import samlSelfServe5 from '@site/static/images/cloud/security/saml-self-serve-5.png';
import samlGoogleApp from '@site/static/images/cloud/security/saml-google-app.png';
import samlAzureApp from '@site/static/images/cloud/security/saml-azure-app.png';
import samlAzureClaims from '@site/static/images/cloud/security/saml-azure-claims.png';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'


# Настройка SAML SSO \\{#saml-sso-setup\\}

<EnterprisePlanFeatureBadge feature="SAML SSO"/>

ClickHouse Cloud поддерживает единый вход (SSO) с использованием Security Assertion Markup Language (SAML). Это позволяет вам безопасно входить в вашу организацию ClickHouse Cloud, проходя аутентификацию у вашего поставщика идентификации (IdP).

В настоящее время мы поддерживаем SSO, инициируемый со стороны поставщика услуг (service provider-initiated), несколько организаций с использованием отдельных подключений и just-in-time‑подготовку учётных записей (provisioning). Мы пока не поддерживаем систему управления идентификацией между доменами (SCIM) или сопоставление атрибутов.

Клиенты, настраивающие интеграцию с SAML, также могут задать роль по умолчанию, которая будет присваиваться новым пользователям, и настроить параметры тайм-аута сеанса.

## Прежде чем начать \\{#before-you-begin\\}

Вам потребуются права администратора в вашем IdP, возможность добавить TXT-запись в DNS-настройки вашего домена, а также роль **Admin** в вашей организации ClickHouse Cloud. Мы рекомендуем, помимо SAML-подключения, настроить **прямую ссылку на вашу организацию**, чтобы упростить процесс входа. Каждый IdP реализует это по-своему. Ниже описано, как сделать это для вашего IdP.

## Как настроить ваш IdP \\{#how-to-configure-your-idp\\}

### Шаги \\{#steps\\}

<VerticalStepper headerLevel="h3">
  ### Откройте настройки организации

  Нажмите на имя вашей организации в левом нижнем углу и выберите Organization details.

  ### Включите единый вход SAML

  Нажмите на переключатель рядом с `Enable SAML single sign-on`. Оставьте этот экран открытым, так как вы будете возвращаться к нему несколько раз в процессе настройки.

  <Image img={samlSelfServe1} size="lg" alt="Начало настройки SAML" force />

  ### Создайте приложение в вашем провайдере идентификации

  Создайте приложение в вашем провайдере идентификации и скопируйте значения с экрана `Enable SAML single sign-on` в конфигурацию вашего провайдера идентификации. Для получения дополнительной информации об этом шаге обратитесь к разделу для вашего конкретного провайдера идентификации ниже.

  * [Настройка Okta SAML](#configure-okta-saml)
  * [Настройка Google SAML](#configure-google-saml)
  * [Настройка Azure (Microsoft) SAML](#configure-azure-microsoft-saml)
  * [Настройка Duo SAML](#configure-duo-saml)

  :::tip
  ClickHouse не поддерживает вход, инициированный провайдером идентификации. Чтобы упростить доступ ваших пользователей к ClickHouse Cloud, создайте для них закладку, используя следующий формат URL для входа: `https://console.clickhouse.cloud/?connection={orgId}`, где `{orgID}` — это идентификатор вашей организации на странице Organization details.
  :::

  <Image img={samlSelfServe2} size="lg" alt="Создание приложения провайдера идентификации" force />

  ### Добавьте URL метаданных в конфигурацию SAML

  Получите `Metadata URL` у вашего SAML-провайдера. Вернитесь в ClickHouse Cloud, нажмите `Next: Provide metadata URL` и вставьте URL в текстовое поле.

  <Image img={samlSelfServe3} size="lg" alt="Добавление URL метаданных" force />

  ### Получите код проверки домена

  Нажмите `Next: Verify your domains`. Введите ваш домен в текстовое поле и нажмите `Check domain`. Система сгенерирует случайный код проверки, который необходимо добавить в TXT-запись у вашего DNS-провайдера.

  <Image img={samlSelfServe4} size="lg" alt="Добавление домена для проверки" force />

  ### Подтвердите ваш домен

  Создайте TXT-запись у вашего DNS-провайдера. Скопируйте `TXT record name` в поле Name TXT-записи у вашего DNS-провайдера. Скопируйте `Value` в поле Content у вашего DNS-провайдера. Нажмите `Verify and Finish`, чтобы завершить процесс.

  :::note
  Обновление и проверка DNS-записи может занять несколько минут. Вы можете покинуть страницу настройки и вернуться позже, чтобы завершить процесс без перезапуска.
  :::

  <Image img={samlSelfServe5} size="lg" alt="Подтверждение вашего домена" force />

  ### Обновите роль по умолчанию и тайм-аут сеанса

  После завершения настройки SAML вы можете задать роль по умолчанию, которая будет назначаться всем пользователям при входе, а также настроить параметры тайм-аута сеанса.

  Доступные роли по умолчанию:

  * Admin
  * Service Admin
  * Service Read Only
  * Member

  Для получения дополнительной информации о правах, назначенных этим ролям, ознакомьтесь с разделом [Console roles and permissions](/cloud/security/console-roles).

  ### Настройте администратора

  :::note
  Пользователи, настроенные с другим методом аутентификации, будут сохранены до тех пор, пока администратор в вашей организации не удалит их.
  :::

  Чтобы назначить первого администратора через SAML:

  1. Выйдите из [ClickHouse Cloud](https://console.clickhouse.cloud).
  2. В вашем провайдере идентификации назначьте администратора для приложения ClickHouse.
  3. Попросите пользователя войти через [https://console.clickhouse.cloud/?connection=&#123;orgId&#125;](https://console.clickhouse.cloud/?connection=\{orgId}) (специальный URL для входа). Это может быть закладка, которую вы создали на предыдущих шагах. Пользователь не появится в ClickHouse Cloud до своего первого входа.
  4. Если роль по умолчанию для SAML отличается от Admin, пользователю, возможно, потребуется выйти и снова войти, используя исходный метод аутентификации, чтобы обновить роль нового пользователя SAML.
     * Для учетных записей с email + паролем используйте `https://console.clickhouse.cloud/?with=email`.
     * Для социальных входов нажмите соответствующую кнопку (**Continue with Google** или **Continue with Microsoft**)

  :::note
  `email` в `?with=email` выше — это буквальное значение параметра, а не заполнитель
  :::

  5. Выйдите еще раз и снова войдите через специальный URL для входа, чтобы завершить последний шаг ниже.

  :::tip
  Чтобы сократить количество шагов, вы можете изначально установить роль по умолчанию для SAML как `Admin`. Когда администратор будет назначен в вашем провайдере идентификации и войдет в систему в первый раз, он сможет изменить роль по умолчанию на другое значение.
  :::

  ### Удалите другие методы аутентификации

  Удалите всех пользователей, использующих методы аутентификации, отличные от SAML, чтобы завершить интеграцию и ограничить доступ только пользователями, поступающими из подключения вашего провайдера идентификации.
</VerticalStepper>

### Настройка Okta SAML \\{#configure-okta-saml\\}

Вы настроите две интеграции приложений в Okta для каждой организации ClickHouse: одно SAML‑приложение и одно приложение‑закладку для размещения вашей прямой ссылки.

<details>
   <summary>  1. Создайте группу для управления доступом  </summary>
   
   1. Войдите в свой экземпляр Okta как **Administrator**.

   2. Выберите **Groups** слева.

   3. Нажмите **Add group**.

   4. Введите имя и описание группы. Эта группа будет использоваться для обеспечения согласованности пользователей между SAML‑приложением и связанным с ним приложением‑закладкой.

   5. Нажмите **Save**.

   6. Нажмите на имя созданной группы.

   7. Нажмите **Assign people**, чтобы назначить пользователей, которым вы хотите предоставить доступ к этой организации ClickHouse.

</details>

<details>
   <summary>  2. Создайте приложение-закладку для беспрепятственного входа пользователей в систему  </summary>
   
   1. Выберите **Applications** слева, затем выберите подраздел **Applications**.
   
   2. Нажмите **Browse App Catalog**.
   
   3. Найдите и выберите **Bookmark App**.
   
   4. Нажмите **Add integration**.
   
   5. Выберите ярлык для приложения.
   
   6. Введите URL в виде `https://console.clickhouse.cloud/?connection={organizationid}`
   
   7. Перейдите на вкладку **Assignments** и добавьте созданную выше группу.
   
</details>

<details>
   <summary>  3. Создайте SAML-приложение для установки соединения  </summary>
   
   1. Выберите **Applications** слева, затем выберите подраздел **Applications**.
   
   2. Нажмите **Create App Integration**.
   
   3. Выберите SAML 2.0 и нажмите Next.
   
   4. Введите имя приложения, установите флажок **Do not display application icon to users** и нажмите **Next**. 
   
   5. Используйте следующие значения для заполнения экрана настроек SAML.
   
      | Поле                           | Значение |
      |--------------------------------|-------|
      | Single Sign On URL             | Скопируйте Single Sign-On URL из консоли |
      | Audience URI (SP Entity ID)    | Скопируйте Service Provider Entity ID из консоли |
      | Default RelayState             | Оставьте пустым       |
      | Name ID format                 | Unspecified       |
      | Application username           | Email             |
      | Update application username on | Create and update |
   
   7. Введите следующее Attribute Statement.

      | Name    | Name format   | Value      |
      |---------|---------------|------------|
      | email   | Basic         | user.email |
   
   9. Нажмите **Next**.
   
   10. Введите запрашиваемую информацию на экране Feedback и нажмите **Finish**.
   
   11. Перейдите на вкладку **Assignments** и добавьте созданную выше группу.
   
   12. На вкладке **Sign On** для нового приложения нажмите кнопку **Copy metadata URL**. 
   
   13. Вернитесь к разделу [Добавьте URL метаданных в конфигурацию SAML](#add-metadata-url), чтобы продолжить процесс.
   
</details>

### Настройка Google SAML \\{#configure-google-saml\\}

Вы настроите одно SAML-приложение в Google для каждой организации и должны предоставить пользователям прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationId}`) для добавления в закладки при использовании SSO для нескольких организаций.

<details>
   <summary>  Создайте веб-приложение Google  </summary>
   
   1. Перейдите в консоль Google Admin (admin.google.com).

   <Image img={samlGoogleApp} size="md" alt="Приложение Google SAML" force/>

   2. Нажмите **Apps**, затем слева выберите **Web and mobile apps**.
   
   3. Нажмите **Add app** в верхнем меню, затем выберите **Add custom SAML app**.
   
   4. Введите имя приложения и нажмите **Continue**.
   
   5. Скопируйте URL метаданных и сохраните его.
   
   7. Введите ACS URL и Entity ID ниже.
   
      | Поле      | Значение |
      |-----------|----------|
      | ACS URL   | Скопируйте Single Sign-On URL из консоли |
      | Entity ID | Скопируйте Service Provider Entity ID из консоли |
   
   8. Установите флажок **Signed response**.
   
   9. Выберите **EMAIL** для Name ID Format и оставьте Name ID как **Basic Information > Primary email.**
   
   10. Нажмите **Continue**.
   
   11. Введите следующее сопоставление атрибутов:
       
      | Поле              | Значение      |
      |-------------------|---------------|
      | Basic information | Primary email |
      | App attributes    | email         |
       
   13. Нажмите **Finish**.
   
   14. Чтобы включить приложение, нажмите **OFF** for everyone и измените параметр на **ON** for everyone. Доступ также может быть ограничен группами или организационными единицами с помощью параметров на левой стороне экрана.

   15. Вернитесь к разделу [Add the metadata URL to your SAML configuration](#add-metadata-url), чтобы продолжить процесс.
       
</details>

### Настройка Azure (Microsoft) SAML \\{#configure-azure-microsoft-saml\\}

Azure (Microsoft) SAML также может называться Azure Active Directory (AD) или Microsoft Entra.

<details>
   <summary>  Создание корпоративного приложения Azure </summary>
   
   Вы настроите одну интеграцию приложения с отдельным URL-адресом входа для каждой организации.
   
   1. Войдите в центр администрирования Microsoft Entra.
   
   2. Перейдите в раздел **Applications > Enterprise applications** слева.
   
   3. Нажмите **New application** в верхнем меню.
   
   4. Нажмите **Create your own application** в верхнем меню.
   
   5. Введите имя и выберите **Integrate any other application you don't find in the gallery (Non-gallery)**, затем нажмите **Create**.
   
      <Image img={samlAzureApp} size="md" alt="Приложение Azure вне галереи" force/>
   
   6. Нажмите **Users and groups** слева и назначьте пользователей.
   
   7. Нажмите **Single sign-on** слева.
   
   8. Нажмите **SAML**.
   
   9. Используйте следующие настройки для заполнения экрана Basic SAML Configuration.
   
      | Поле                                  | Значение                                                  |
      |----------------------------------------|-----------------------------------------------------------|
      | Identifier (Entity ID)                 | Скопируйте Service Provider Entity ID из консоли         |
      | Reply URL (Assertion Consumer Service URL) | Скопируйте Single Sign-On URL из консоли             |
      | Sign on URL                            | `https://console.clickhouse.cloud/?connection={organizationid}` |
      | Relay State                            | Пусто                                                     |
      | Logout URL                             | Пусто                                                     |
   
   11. Добавьте (A) или обновите (U) следующие параметры в разделе Attributes & Claims:
   
       | Имя утверждения                           | Формат        | Исходный атрибут |
       |--------------------------------------|---------------|------------------|
       | (U) Unique User Identifier (Name ID) | Email address | user.mail        |
       | (A) email                            | Basic         | user.mail        |
       | (U) /identity/claims/name            | Omitted       | user.mail        |
   
         <Image img={samlAzureClaims} size="md" alt="Атрибуты и утверждения" force/>
   
   12. Скопируйте URL метаданных и вернитесь к разделу [Add the metadata URL to your SAML configuration](#add-metadata-url), чтобы продолжить процесс.

</details>

### Настройка Duo SAML \\{#configure-duo-saml\\}

<details>
   <summary> Создание универсального поставщика услуг SAML для Duo </summary>
   
   1. Следуйте инструкциям для [Duo Single Sign-On for Generic SAML Service Providers](https://duo.com/docs/sso-generic). 
   
   2. Используйте следующее сопоставление Bridge Attribute:

      |  Bridge Attribute  |  Атрибут ClickHouse  |
      |:-------------------|:-----------------------|
      | Email Address      | email                  |
   
   3. Используйте следующие значения для обновления вашего облачного приложения в Duo:

      |  Поле    |  Значение                                     |
      |:----------|:-------------------------------------------|
      | Entity ID | Скопируйте идентификатор сущности поставщика услуг (Service Provider Entity ID) из консоли |
      | Assertion Consumer Service (ACS) URL | Скопируйте URL-адрес единого входа (Single Sign-On URL) из консоли |
      | Service Provider Login URL |  `https://console.clickhouse.cloud/?connection={organizationid}` |

   4. Скопируйте URL-адрес метаданных (metadata URL) и вернитесь к разделу [Add the metadata URL to your SAML configuration](#add-metadata-url), чтобы продолжить процесс.
   
</details>

## Как это работает {#how-it-works}

### Управление пользователями с помощью SAML SSO \\{#user-management-with-saml-sso\\}

Для получения дополнительной информации об управлении правами пользователей и ограничении доступа только через SAML‑подключения см. раздел [Manage cloud users](/cloud/security/manage-cloud-users).

### SSO, инициируемое поставщиком услуг \\{#service-provider-initiated-sso\\}

Мы используем только SSO, инициируемое поставщиком услуг. Это означает, что пользователи переходят по адресу `https://console.clickhouse.cloud` и вводят свой адрес электронной почты, после чего перенаправляются к IdP для аутентификации. Пользователи, уже аутентифицированные через ваш IdP, могут использовать прямую ссылку для автоматического входа в вашу организацию без ввода адреса электронной почты на странице входа.

### Мультиорганизационное SSO \\{#multi-org-sso\\}

ClickHouse Cloud поддерживает мультиорганизационное SSO, предоставляя отдельное подключение для каждой организации. Используйте прямую ссылку (`https://console.clickhouse.cloud/?connection={organizationid}`) для входа в каждую соответствующую организацию. Перед входом в другую организацию обязательно выйдите из текущей.

## Дополнительная информация {#additional-information}

Безопасность — наш главный приоритет, когда речь идет об аутентификации. По этой причине при реализации SSO мы приняли несколько решений, о которых вам необходимо знать.

- **Мы обрабатываем только потоки аутентификации, инициированные со стороны поставщика услуги.** Пользователи должны перейти на `https://console.clickhouse.cloud` и ввести адрес электронной почты, после чего будут перенаправлены к вашему провайдеру идентификации. Инструкции по добавлению приложения-закладки или ярлыка предоставлены для вашего удобства, чтобы вашим пользователям не нужно было запоминать URL.

- **Мы не связываем автоматически учетные записи с SSO и без него.** В вашем списке пользователей ClickHouse вы можете видеть несколько учетных записей для одних и тех же пользователей, даже если они используют один и тот же адрес электронной почты.

## Устранение распространённых проблем {#troubleshooting-common-issues}

| Ошибка | Причина | Решение | 
|:------|:------|:---------|
| Ошибка может быть связана с некорректной конфигурацией системы или сбоем сервиса | Вход, инициированный провайдером идентификации | Чтобы устранить эту ошибку, попробуйте использовать прямую ссылку `https://console.clickhouse.cloud/?connection={organizationid}`. Следуйте приведённым выше инструкциям для вашего провайдера идентификации, чтобы сделать этот метод входа методом по умолчанию для ваших пользователей | 
| Вы перенаправляетесь к вашему провайдеру идентификации, а затем обратно на страницу входа | В провайдере идентификации отсутствует сопоставление атрибута email | Следуйте приведённым выше инструкциям для вашего провайдера идентификации, чтобы настроить атрибут email пользователя и войдите снова | 
| Пользователь не назначен этому приложению | Пользователь не был назначен приложению ClickHouse в провайдере идентификации | Назначьте пользователя приложению в провайдере идентификации и войдите снова |
| У вас несколько организаций ClickHouse, интегрированных с SAML SSO, и вы всегда входите в одну и ту же организацию, независимо от того, по какой ссылке или плитке вы переходите | Вы всё ещё авторизованы в первой организации | Выйдите из учётной записи, затем войдите в другую организацию |
| В URL на короткое время отображается `access denied` | Домен вашего адреса электронной почты не совпадает с доменом, который у нас настроен | Обратитесь в службу поддержки за помощью в устранении этой ошибки |