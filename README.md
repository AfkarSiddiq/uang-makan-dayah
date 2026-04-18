# README

## Instalation

- create a mysql user on your local dev with your preferred local dev credential
- copy `.env.example` and rename to `.env`
- change variable `DB_DATABASE`, `DB_USERNAME`, and `DB_PASSWORD` according to your local dev cred
- run `npm install && npm run build` inside of your terminal
- `composer install` to install all of the required laravel components
- `php artisan key:generate`
- `php artisan migrate:fresh --seed` to migrate the db and load seed data like login info for local dev
- `composer run dev` to run the app locally for dev
- enter the link `http://localhost:8000` to login
