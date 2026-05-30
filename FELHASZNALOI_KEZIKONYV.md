# Felhasználói kézikönyv

Ez a dokumentum tartalmazza a PreERP rendszer felhasználói útmutatóját.

---

## Tartalomjegyzék

1. [Rendszer naplók](#rendszer-naplók)
   - [Hozzáférés](#hozzáférés)
   - [Funkciók áttekintése](#funkciók-áttekintése)
   - [Napló szintek értelmezése](#napló-szintek-értelmezése)
   - [Gyakori használati esetek](#gyakori-használati-esetek)
   - [Tippek és trükkök](#tippek-és-trükkök)
   - [Hibaelhárítás](#hibaelhárítás)

2. [Felhasználók kezelése](#felhasználók-kezelése)
   - [Hozzáférés](#hozzáférés-1)
   - [Funkciók áttekintése](#funkciók-áttekintése-1)
   - [Felhasználói szintek részletes ismertetése](#felhasználói-szintek-részletes-ismertetése)
   - [Gyakori használati esetek](#gyakori-használati-esetek-1)
   - [Tippek és trükkök](#tippek-és-trükkök-1)
   - [Biztonsági irányelvek](#biztonsági-irányelvek)
   - [Hibaelhárítás](#hibaelhárítás-1)

---

## Rendszer naplók

A Rendszer naplók funkció lehetővé teszi az adminisztrátorok számára, hogy megtekinthessék és elemezzék az alkalmazás összes rendszereseményét és naplóbejegyzését.

### Hozzáférés

A Rendszer naplók funkció elérhető:
- A bal oldali navigációs menüből a **"Rendszer naplók"** menüpont kiválasztásával
- Csak **Admin** jogosultsági szinttel rendelkező felhasználók számára elérhető

### Funkciók áttekintése

#### 1. Naplók megtekintése

A naplók táblázatos formában jelennek meg, amely a következő információkat tartalmazza:

| Oszlop | Leírás |
|--------|--------|
| **Időbélyeg** | A naplóbejegyzés pontos dátuma és időpontja |
| **Szint** | A napló súlyossági szintje (ERROR, WARN, INFO, SUCCESS, DEBUG) |
| **Kategória** | A naplóbejegyzés kategóriája (pl. AUTH, DATABASE, API) |
| **Üzenet** | A napló részletes üzenete |
| **Felhasználónév** | Az eseményt kiváltó felhasználó neve (ha van) |
| **IP cím** | A kérés IP címe (ha releváns) |

#### 2. Szűrési lehetőségek

A naplók szűrésére több lehetőség is rendelkezésre áll:

**Szint szerinti szűrés:**
- Minden szint
- ERROR - Hibák és kivételek
- WARN - Figyelmeztetések
- INFO - Információs üzenetek
- SUCCESS - Sikeres műveletek
- DEBUG - Fejlesztői hibakeresési információk

**Kategória szerinti szűrés:**
- Minden kategória
- AUTH - Hitelesítési események
- DATABASE - Adatbázis műveletek
- API - API kérések
- És egyéb rendszer kategóriák

**Szöveges keresés:**
- Keresés az üzenet vagy felhasználónév alapján
- A keresés a részleges egyezéseket is megtalálja

**Dátum szerinti szűrés:**
- **Kezdő dátum**: A naplók kezdő időpontja
- **Befejező dátum**: A naplók befejező időpontja
- Mindkét dátum megadása nem kötelező

#### 3. Szűrők alkalmazása

1. Válassza ki a kívánt szűrési feltételeket
2. Kattintson a **"Szűrők alkalmazása"** gombra
3. A táblázat frissül a szűrt eredményekkel

A szűrők törléséhez kattintson a **"Szűrők törlése"** gombra, ami visszaállítja az összes szűrőt alapértelmezett értékre.

#### 4. Lapozás

A naplók lapozva jelennek meg a jobb áttekinthetőség érdekében:
- Alapértelmezetten **50 bejegyzés** jelenik meg oldalanként
- A lapozás vezérlők a táblázat alatt találhatók
- A következő navigációs lehetőségek érhetők el:
  - **Előző** - Előző oldal
  - **Számozott oldalak** - Közvetlen ugrás egy adott oldalra
  - **Következő** - Következő oldal
- A jelenlegi oldal száma és az összes oldal száma mindig látható

#### 5. Metaadatok megtekintése

Egyes naplóbejegyzések további metaadatokat tartalmazhatnak:
- A metaadatokat tartalmazó bejegyzések mellett egy **[...]** link jelenik meg
- Kattintson a linkre a teljes metaadat megjelenítéséhez JSON formátumban
- A metaadatok részletes technikai információkat tartalmazhatnak a naplózott eseményről

### Napló szintek értelmezése

| Szint | Szín kód | Jelentés |
|-------|----------|----------|
| **ERROR** | 🔴 Piros | Kritikus hibák, amelyek azonnali beavatkozást igényelnek |
| **WARN** | 🟡 Sárga | Figyelmeztetések, potenciális problémák |
| **INFO** | 🔵 Kék | Általános információs üzenetek |
| **SUCCESS** | 🟢 Zöld | Sikeres műveletek megerősítése |
| **DEBUG** | ⚪ Szürke | Fejlesztői információk, hibakereséshez |

### Gyakori használati esetek

#### Hitelesítési problémák vizsgálata
1. Válassza ki a **"Kategória"** mezőben az **AUTH** értéket
2. Válassza ki a **"Szint"** mezőben az **ERROR** vagy **WARN** értéket
3. Kattintson a **"Szűrők alkalmazása"** gombra

#### Egy felhasználó tevékenységeinek nyomon követése
1. Írja be a felhasználónevet a **"Keresés"** mezőbe
2. Kattintson a **"Szűrők alkalmazása"** gombra
3. Az összes, a felhasználóhoz kapcsolódó esemény megjelenik

#### Adott időszak eseményeinek elemzése
1. Állítsa be a **"Kezdő dátum"** mezőt
2. Állítsa be a **"Befejező dátum"** mezőt
3. Válassza ki az egyéb szűrőket igény szerint
4. Kattintson a **"Szűrők alkalmazása"** gombra

### Tippek és trükkök

- **Gyors hibakeresés**: ERROR szintű naplók szűrése az összes kritikus probléma gyors áttekintéséhez
- **Rendszeres ellenőrzés**: Ellenőrizze a WARN szintű üzeneteket rendszeresen a potenciális problémák korai felismeréséhez
- **IP követés**: Az IP cím oszlop segítségével azonosíthatja a gyanús hozzáférési kísérleteket
- **Dátumszűrés**: Használja a dátumszűrőket a teljesítmény javításához nagy mennyiségű napló esetén

### Hibaelhárítás

**Nem jelennek meg naplók**
- Ellenőrizze, hogy a szűrők nincsenek-e túl szűkre állítva
- Használja a **"Szűrők törlése"** gombot és próbálja újra

**Lassú betöltés**
- Használjon dátumszűrőket a lekérdezett időtartam csökkentésére
- Szűkítse le a keresést kategória vagy szint alapján

**Metaadatok nem jelennek meg**
- Nem minden naplóbejegyzés tartalmaz metaadatokat
- Csak a **[...]** linkkel rendelkező bejegyzések tartalmaznak további információt

---

## Felhasználók kezelése

A Felhasználók kezelése funkció lehetővé teszi az adminisztrátorok számára, hogy kezeljék a rendszer felhasználóit, módosítsák jogosultsági szintjeiket, és szükség esetén letiltsák vagy engedélyezzék a fiókokat.

### Hozzáférés

A Felhasználók kezelése funkció elérhető:
- A bal oldali navigációs menüből a **"Felhasználók kezelése"** menüpont kiválasztásával
- Csak **Administrator** jogosultsági szinttel rendelkező felhasználók számára elérhető

### Funkciók áttekintése

#### 1. Felhasználók listája

A felhasználók táblázatos formában jelennek meg, amely a következő információkat tartalmazza:

| Oszlop | Leírás |
|--------|--------|
| **ID** | A felhasználó egyedi azonosítója |
| **Felhasználónév** | A felhasználó bejelentkezési neve |
| **Felhasználói szint** | A jogosultsági szint (user, moderator, administrator) |
| **Állapot** | Aktív vagy Letiltva |
| **Létrehozva** | A fiók létrehozásának dátuma |
| **Műveletek** | Elérhető műveletek gombjai |

#### 2. Keresés

A felhasználók keresése felhasználónév alapján:
1. Írja be a keresendő szöveget a keresőmezőbe
2. A táblázat automatikusan szűrődik a megadott szöveg alapján
3. A keresés a részleges egyezéseket is megtalálja
4. Törölje a keresőmezőt az összes felhasználó megjelenítéséhez

#### 3. Rendezés

A táblázat bármely oszlopa szerint rendezheti a felhasználókat:
- Kattintson az oszlop fejlécére a rendezéshez
- Első kattintás: növekvő sorrend (↑)
- Második kattintás: csökkenő sorrend (↓)
- Harmadik kattintás: visszaállítás alapértelmezett rendezésre (↕)

**Rendezési lehetőségek:**
- ID szerint
- Felhasználónév szerint (ABC sorrend)
- Felhasználói szint szerint
- Állapot szerint (Aktív/Letiltva)
- Létrehozási dátum szerint

#### 4. Felhasználói szint módosítása

A felhasználói jogosultsági szint megváltoztatásához:

1. Kattintson a **"Szint módosítása"** gombra a kívánt felhasználó sorában
2. Megjelenik a szerkesztési ablak az alábbi információkkal:
   - Felhasználónév
   - Jelenlegi szint (színes címkével jelölve)
   - Új szint legördülő menü
3. Válassza ki az új jogosultsági szintet:
   - **user** - Alap hozzáférés a rendszerhez
   - **moderator** - Tartalommoderálás és jelentések elérése
   - **administrator** - Teljes rendszer hozzáférés és felhasználó kezelés
4. Kattintson a **"Mentés"** gombra
5. A változtatás azonnal érvénybe lép

**Fontos megjegyzések:**
- Saját felhasználói szintjét nem módosíthatja
- A változtatás után a felhasználó következő bejelentkezéskor már az új jogosultságokkal rendelkezik
- A szint csökkentése nem törli a korábban létrehozott adatokat

#### 5. Felhasználó letiltása/engedélyezése

Felhasználói fiók ideiglenes letiltásához vagy újraaktiválásához:

**Letiltás:**
1. Kattintson a **"Letiltás"** gombra a kívánt felhasználó sorában
2. Erősítse meg a műveletet a felugró ablakban
3. A felhasználó azonnal ki lesz jelentkeztetve
4. A letiltott felhasználó nem tud bejelentkezni a rendszerbe
5. A felhasználó sora szürkén jelenik meg a táblázatban

**Engedélyezés:**
1. Kattintson az **"Engedélyezés"** gombra a letiltott felhasználó sorában
2. Erősítse meg a műveletet
3. A felhasználó újra bejelentkezhet a rendszerbe
4. A felhasználó sora visszaáll normál megjelenésre

**Fontos megjegyzések:**
- Saját fiókját nem tilthatja le
- Letiltott felhasználók adatai megmaradnak a rendszerben
- A letiltás nem töröl semmilyen korábban létrehozott adatot
- Letiltott felhasználók azonnal ki lesznek jelentkeztetve az összes eszközről

### Felhasználói szintek részletes ismertetése

#### User (Felhasználó)
**Jelölés**: Kék címke

**Jogosultságok:**
- Belépés a rendszerbe
- Projektek megtekintése
- Projektek létrehozása és szerkesztése
- Saját profil szerkesztése

**Korlátozások:**
- Nem érheti el a felhasználó kezelés menüt
- Nem érheti el a rendszer naplókat
- Nem módosíthatja más felhasználók adatait

#### Moderator (Moderátor)
**Jelölés**: Narancssárga címke

**Jogosultságok:**
- Minden user szintű jogosultság
- Tartalommoderálás
- Jelentések megtekintése és kezelése
- Moderálási műveletek naplózása

**Korlátozások:**
- Nem érheti el a felhasználó kezelés menüt
- Nem érheti el a rendszer naplókat
- Nem módosíthatja felhasználói szinteket

#### Administrator (Adminisztrátor)
**Jelölés**: Piros címke

**Jogosultságok:**
- Minden moderator szintű jogosultság
- Felhasználók kezelése (szint módosítás, letiltás/engedélyezés)
- Rendszer naplók megtekintése és szűrése
- Teljes rendszer konfiguráció
- Összes rendszerbeállítás módosítása

**Felelősségek:**
- Felhasználói jogosultságok megfelelő kiosztása
- Rendszeres naplóellenőrzés
- Biztonsági incidensek kezelése
- Felhasználói támogatás

### Gyakori használati esetek

#### Új felhasználó jogosultságának beállítása
1. Az új felhasználó automatikusan **user** szinttel jön létre
2. Keresse meg a felhasználót a keresőmezővel
3. Kattintson a **"Szint módosítása"** gombra
4. Válassza ki a megfelelő szintet a feladatkörének megfelelően
5. Mentse el a változtatást

#### Távozó munkatárs fiókjának kezelése
1. Keresse meg a távozó munkatárs felhasználói fiókját
2. Kattintson a **"Letiltás"** gombra
3. Erősítse meg a műveletet
4. A fiók adatai megmaradnak archiválási célból
5. Szükség esetén később újraaktiválható

#### Jogosultság átmeneti megvonása
1. Keresse meg az érintett felhasználót
2. Használja a **"Letiltás"** funkciót
3. Az átmeneti időszak után használja az **"Engedélyezés"** funkciót
4. A felhasználó újra hozzáférhet a rendszerhez

#### Jogosultság bővítése projekt igény szerint
1. Azonosítsa a jogosultság bővítésre szoruló felhasználót
2. Nyissa meg a szint módosítási ablakot
3. Emelje **moderator** vagy **administrator** szintre
4. A felhasználó következő bejelentkezéskor már az új funkciókhoz fér hozzá

### Tippek és trükkök

- **Keresés gyorsítása**: Kezdje el írni a nevet, és a lista automatikusan szűrődik
- **Rendezés kombinálása**: Rendezze a felhasználókat szint szerint, majd név szerint az áttekinthetőség érdekében
- **Státusz ellenőrzés**: A letiltott felhasználók szürke háttérrel jelennek meg - könnyen észrevehetők
- **Tömeges ellenőrzés**: Rendezze állapot szerint az összes letiltott fiók gyors áttekintéséhez
- **Jelenlegi felhasználó**: A saját fiókja **(Te)** jelöléssel van ellátva a listában

### Biztonsági irányelvek

#### Felhasználói szintek kiosztása
- **Minimális jogosultság elve**: Csak annyi jogosultságot adjon, amennyi a munkavégzéshez szükséges
- **Rendszeres felülvizsgálat**: Ellenőrizze a jogosultságokat negyedévente
- **Távozók kezelése**: Azonnal tiltsa le a távozó munkavállalók fiókjait
- **Ideiglenes hozzáférés**: Használja a letiltás/engedélyezés funkciót ideiglenes korlátozásokhoz

#### Adminisztrátori felelősségek
- **Ne osszon túl sok admin jogot**: Maximum 2-3 adminisztrátor elegendő
- **Naplózás**: Minden fontos műveletet ellenőrizzen a rendszer naplókban
- **Jelszó politika**: Ösztönözze a felhasználókat erős jelszavak használatára
- **Gyanús tevékenység**: Figyelje a rendszer naplókat gyanús bejelentkezési kísérletekért

### Hibaelhárítás

**Nem tudok módosítani egy felhasználót**
- Ellenőrizze, hogy administrator jogosultsággal rendelkezik-e
- Nem módosíthatja a saját fiókját bizonyos műveleteknél
- Próbálja meg újratölteni az oldalt

**A szint módosítás nem lép életbe**
- A változtatás a következő bejelentkezéskor lép érvénybe
- Kérje meg a felhasználót, hogy jelentkezzen ki és újra be
- Ellenőrizze, hogy a mentés sikeres volt-e

**Letiltott felhasználó továbbra is be tud jelentkezni**
- A letiltás azonnal életbe lép
- A felhasználó aktív munkamenetei megszűnnek
- Ha mégis be tud jelentkezni, ellenőrizze a rendszer naplókat

**Nem látom az összes felhasználót**
- Törölje a keresőmező tartalmát
- Ellenőrizze az internetkapcsolatot
- Próbálja meg újratölteni az oldalt

---

*További kérdések esetén forduljon a rendszergazdához.*
