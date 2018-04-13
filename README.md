# README

Car Review site made for challenge with Deliv

* Ruby version
  * 2.3.1
* Rails
  * 5.1.6

* System dependencies
  * ENVVARS / .env file
    * __AUTH0_CLIENT_ID__
    * __AUTH0_CLIENT_SECRET__
    * __AUTH0_NAMESPACE__
    * SECRET_KEY_BASE


* Database creation / initialization
  * bundle
  * development
    * rails db:create
    * rails db:migrate
    * rails db:seed
  * production
    * requires postgres to be setup correctly
    * rails db:create
    * rails db:migrate RAILS_ENV=production

* How to run the test suite
  * create Passengerfile.json
    * include port, demonize, environment, user, and envvars
  * passenger start
  
* Deployment instructions
    rvmsudo passenger start RAILS_ENV=production
* ...
