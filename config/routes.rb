Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "registrations" }
  root to: "pages#home"

  resources :users, only: %i[update] do
    member do
      get :new_voice
    end
  end
  resources :lessons
end
