Rails.application.routes.draw do
  get "/auth/oauth2/callback" => "auth0#callback"
  get "/auth/failure" => "auth0#failure"
  
  root "home#index"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :vehicles
  resources :home, only: :index
end
