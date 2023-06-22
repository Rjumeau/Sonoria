Rails.application.routes.draw do
  devise_for :users, controllers: { registrations: "registrations" }
  root to: "pages#home"

  resources :lessons

  get 'users/:id/new_voice', to: 'users#new_voice', as: 'new_user_voice'
  post 'users/:id/create_voice', to: 'users#create_voice', as: 'create_user_voice'
end
