# Орбита Android — тестовый клиент

Android 8+ (API 26), официальный Android Browser Helper 2.7.3, Java 17.
Открывает существующий сайт в Trusted Web Activity. Не использует WebView,
не копирует пароли в нативный код и не запускает постоянный опрос в фоне.
Уведомления: Web Push браузера + DelegationService приложения. Разрешить
уведомления Android и отдельно подключить устройство в настройках сайта.
Для TWA нужен актуальный совместимый браузер. При неподтверждённом домене
возможен fallback с адресной строкой. Это не нативный движок голосового чата;
фоновые звонки/экран зависят от браузера и Android. Старый оверлей не включён.

## Сборка

`gradle :app:assembleDebug :app:lintDebug` с Gradle 8.13 и JDK 17.
SDK platforms;android-36 и build-tools;35.0.0.
GitHub Actions собирает APK и публикует его как артефакт `orbita-android`.
Debug-подпись подходит для тестирования, не для публикации в Google Play.
Для каждого запуска создаётся временный debug-ключ; новая сборка требует
новой привязки домена и может потребовать переустановки тестового приложения.
Ключ подписи не включается в артефакт и исходники.

Существующие файлы репозитория не изменяются. Minecraft не используется.

## 1.1: call notification
Four expanded notification controls: microphone, playback, both, leave. States update only after a confirmed TWA response. Commands are call-session scoped, explicit target states, deduplicated and accepted only on a verified same-origin postMessage channel. Requires compatible browser with TWA postMessage (Chrome 115+), notification permission and use_as_origin DAL relation. No extra microphone permission or WebView is used.

This is an ongoing notification, NOT an Android Telecom call. Android 14+ may allow dismissing it. Browser suspension or Android killing the host process can interrupt controls; there is no native foreground media service. Reopen the client to reconnect. It does not guarantee background microphone operation.

Device acceptance: join, expand notification, test all four actions with a second participant; verify mute/playback states match the page, notification disappears on leaving, old notification cannot control a different session. Repeat locked/unlocked, Bluetooth, notification permission denied, browser back navigation.
