# Murdle — notatnik detektywa

Interaktywna, responsywna plansza logiczna do notowania wskazówek podczas rozwiązywania zagadek Murdle. Nazwy kategorii i elementów można dopasować do konkretnego zadania z książki. Plansza i postępy zapisują się lokalnie w przeglądarce.

## Funkcje

- Wybór trzech kategorii: osoby, narzędzia i miejsca, lub dodanie czwartej: motywu.
- Wybór trzech albo czterech elementów w każdej kategorii.
- Wpisywanie własnych nazw elementów.
- Plansza z układem sekcji wzorowanym na książkowej siatce logicznej.
- Trzy stany każdego pola: puste, zaznaczone i skreślone. Klikaj pole, aby przełączać stany.
- Automatyczny zapis planszy na bieżącym urządzeniu w `localStorage`.
- Układ dostosowany do ekranów komputerów i telefonów.

## Wymagania

- Node.js i npm.

## Uruchomienie lokalne

Zainstaluj zależności:

```sh
npm install
```

Uruchom serwer deweloperski:

```sh
npm run dev
```

Vite wyświetli lokalny adres aplikacji w terminalu.

## Publikacja na GitHub Pages

Repozytorium publikuje aplikację automatycznie przez GitHub Actions po każdym pushu do gałęzi `main`.

1. W GitHub otwórz **Settings → Pages**.
2. W sekcji **Build and deployment** ustaw **Source** na **GitHub Actions**.
3. Wypchnij zmiany na GitHub:

   ```sh
   git push origin main
   ```

4. W repozytorium otwórz zakładkę **Actions** i poczekaj, aż workflow **Deploy to GitHub Pages** zakończy się powodzeniem.
5. Aplikacja będzie dostępna pod adresem [https://chomak18.github.io/murdle/](https://chomak18.github.io/murdle/).

## Dodanie skrótu na ekranie telefonu

Otwórz opublikowany adres w przeglądarce telefonu:

- **iPhone/iPad:** w Safari wybierz **Udostępnij → Dodaj do ekranu początkowego → Dodaj**.
- **Android:** w Chrome wybierz menu **⋮ → Dodaj do ekranu głównego** (lub **Zainstaluj aplikację**, jeśli przeglądarka pokaże tę opcję).

Plansza działa lokalnie w przeglądarce. Zapisane nazwy i zaznaczenia nie synchronizują się automatycznie między urządzeniami.

## Dostępne polecenia

| Polecenie | Opis |
| --- | --- |
| `npm run dev` | Uruchamia serwer deweloperski z odświeżaniem po zmianach. |
| `npm run build` | Sprawdza typy TypeScript i tworzy wersję produkcyjną w `dist/`. |
| `npm run preview` | Udostępnia lokalnie gotowy build do sprawdzenia. |
| `npm run lint` | Uruchamia ESLint. |

## Stos technologiczny

- React
- TypeScript
- Vite
- CSS

## Dane i prywatność

Konfiguracja planszy, wpisane nazwy i zaznaczenia są przechowywane w pamięci lokalnej przeglądarki (`localStorage`). Nie są wysyłane do serwera. Wyczyszczenie danych witryny lub użycie innej przeglądarki/urządzenia usunie lub nie przeniesie zapisanych postępów.
