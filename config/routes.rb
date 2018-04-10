Rails.application.routes.draw do
  get "/auth/oauth2/callback" => "auth0#callback"
  get "/auth/failure" => "auth0#failure"
  get "/logout" => "logout#logout"
  get "/reviews" => "reviews#index"
  
  root "vehicles#index"
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :vehicles, only: [:index] do
    resources :reviews
  end
  resources :home, only: :index
end
