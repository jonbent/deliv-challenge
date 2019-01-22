# README
* CHALLENGE

1. You must use 3rd party APIs to produce a list of vehicles.

    a. You should be able to sort by Year, Make, Model, VIN number, and Size*

2. You should be able to create a review in your database for any vehicle in the list.

    a. Review must include a user email

    b. Review must include the date

    c. Review must include a rating (x out of y)

    d. Review may optionally contain a comment

3. You should be able to view any vehicle's reviews

4. You should be able to view all reviews in the database

5. Write tests/specs in your preferred test library


* Ruby version
  * 2.3.1
* Rails version
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
    * rails db:create RAILS_ENV=production
    * rails db:migrate RAILS_ENV=production

* How to run the test suite
  * create Passengerfile.json
    * include port, demonize, environment, user, and envvars
  * passenger start
  
* Deployment instructions
    * rvmsudo bundle exec passenger start
