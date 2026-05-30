# Dokumentáció Build Útmutató

## Áttekintés

A PreERP rendszer tartalmaz egy automatizált dokumentáció build folyamatot, amely a markdown formátumú felhasználói kézikönyvet HTML formátumba konvertálja és elérhetővé teszi a frontend alkalmazáson keresztül.

## Fájlok és Komponensek

### Forrás Fájlok
- **`FELHASZNALOI_KEZIKONYV.md`** - A felhasználói kézikönyv markdown forrása (gyökér mappában)

### Build Szkriptek
- **`scripts/build-docs.js`** - Node.js szkript, amely a markdown-t HTML-lé konvertálja
- **`package.json`** - Tartalmazza a `build:docs` npm szkriptet

### Kimeneti Fájlok
- **`frontend/dist/preerp/browser/docs/index.html`** - A generált HTML dokumentáció

## Használat

### Manuális Build

A dokumentáció manuális buildjeléséhez futtassa:

```bash
npm run build:docs
```

Ez a parancs:
1. Beolvassa a `FELHASZNALOI_KEZIKONYV.md` fájlt
2. Konvertálja HTML formátumba a `marked` library használatával
3. Hozzáadja a stílusokat (CSS)
4. Létrehozza a `frontend/dist/preerp/browser/docs/index.html` fájlt

### Automatikus Build (Jenkins Pipeline)

A Jenkins pipeline automatikusan buildeli a dokumentációt minden build során:

1. **Build Frontend** stage - Elkészül az Angular production build
2. **Build Documentation** stage - Elkészül a dokumentáció HTML verziója
3. **Prepare Release Package** stage - A dokumentáció belekerül a release csomagba

### Elérés a Frontend-en

A dokumentáció elérhető:
- **URL**: `http://localhost:3000/docs/`
- **Navbar**: A felső menüben a "Felhasználói kézikönyv" 📖 menüpont alatt
- **Target**: Új böngésző ablakban nyílik meg

## Függőségek

A dokumentáció build a következő npm csomagot használja:

```json
{
  "devDependencies": {
    "marked": "^11.2.0"
  }
}
```

A `marked` csomag telepítése:
```bash
npm install
```

## Dokumentáció Szerkesztése

### Markdown Formázás

A `FELHASZNALOI_KEZIKONYV.md` fájl GitHub Flavored Markdown (GFM) szintaxist használ:

```markdown
# Fejezet cím (H1)
## Alfejezet (H2)
### Szakasz (H3)

**Félkövér szöveg**
*Dőlt szöveg*

- Felsorolás
- Elemek

| Táblázat | Oszlopok |
|----------|----------|
| Adat 1   | Adat 2   |

```code block```
`inline code`

[Link szöveg](URL)
```

### Build Folyamat

1. Szerkessze a `FELHASZNALOI_KEZIKONYV.md` fájlt
2. Futtassa `npm run build:docs` parancsot
3. Ellenőrizze a generált HTML-t böngészőben: `http://localhost:3000/docs/`
4. Ha megfelelő, commitolja a változtatásokat

### Stílusok Módosítása

A dokumentáció CSS stílusai a `scripts/build-docs.js` fájlban vannak definiálva a `docStyles` változóban. A stílusok módosításához:

1. Nyissa meg `scripts/build-docs.js`
2. Keresse meg a `docStyles` konstanst
3. Módosítsa a CSS szabályokat
4. Futtassa újra `npm run build:docs`

## Hibaelhárítás

### "Source file not found" hiba

**Probléma**: A build szkript nem találja a markdown forrást.

**Megoldás**: Ellenőrizze, hogy a `FELHASZNALOI_KEZIKONYV.md` fájl létezik a projekt gyökér mappájában.

### "Cannot find module 'marked'" hiba

**Probléma**: A `marked` csomag nincs telepítve.

**Megoldás**: 
```bash
npm install
```

### A dokumentáció nem érhető el a frontend-en

**Probléma**: A `/docs/` URL 404 hibát ad.

**Megoldás**:
1. Ellenőrizze, hogy a frontend build elkészült: `npm run build:frontend`
2. Futtassa a docs build-et: `npm run build:docs`
3. Indítsa újra a szervert: `npm start`
4. Ellenőrizze, hogy létezik a fájl: `frontend/dist/preerp/browser/docs/index.html`

### A stílusok nem jelennek meg helyesen

**Probléma**: A HTML megjelenik, de nincs formázva.

**Megoldás**: Ellenőrizze a böngésző konzolt hibákért. A stílusok inline-ban vannak beágyazva a HTML-be, így külső CSS fájlok nem szükségesek.

## Fejlesztési Jegyzetek

### Új Dokumentációs Oldalak Hozzáadása

Ha több dokumentációs oldalt szeretne hozzáadni:

1. Hozzon létre új markdown fájlokat (pl. `FEJLESZTOI_DOKUMENTACIO.md`)
2. Módosítsa a `scripts/build-docs.js` szkriptet, hogy több fájlt dolgozzon fel
3. Generáljon több HTML fájlt a docs mappában
4. Adjon hozzá navigációs linkeket a navbar-ban

### Integráció Angular Router-rel

Ha az Angular router-t szeretné használni a statikus HTML helyett:

1. Hozzon létre egy új Angular komponenst (pl. `DocsComponent`)
2. A komponensben fetch-elje és renderje a markdown tartalmat
3. Adja hozzá a route-ot az `app.routes.ts`-hez
4. Ez lehetővé teszi a dinamikus tartalom betöltést és az Angular életciklus használatát

## További Információk

- **Marked dokumentáció**: https://marked.js.org/
- **GitHub Flavored Markdown**: https://github.github.com/gfm/
- **Angular routing**: https://angular.io/guide/router

---

*Ez a dokumentum a dokumentáció build rendszer működését írja le. A felhasználói kézikönyvért lásd: FELHASZNALOI_KEZIKONYV.md*
