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
