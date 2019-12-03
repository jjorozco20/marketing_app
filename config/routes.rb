# frozen_string_literal: true

Rails.application.routes.draw do
  namespace :admin do
    resources :clients
    resources :contacts
    resources :companies, only: %i[index show]
    resources :campains, except: %i[destroy]
    resources :users, only: %i[index show]
    root to: 'campains#index'
  end

  namespace :consumer_admin do
    resources :clients
    resources :contacts
    resources :campains, except: %i[destroy]
    resources :users, except: %i[destroy]
    root to: 'campains#index'
  end

  namespace :agency do
    resources :clients, only: %i[index show]
    resources :contacts, only: %i[index show]
    resources :companies, only: %i[index show]
    resources :campains, only: %i[index show]
    resources :users, only: %i[index show]
    root to: 'clients#index'
  end

  namespace :consumer do
    resources :campains, only: %i[index show]
    root to: 'campains#index'
  end

  namespace :rrhh do
    resources :users, except: %i[destroy]
    root to: 'users#index'
  end

  namespace :finance do
    resources :companies, except: %i[destroy]
    resources :corporations, except: %i[destroy]
    root to: 'companies#index'
  end

  namespace :community do
    resources :campains, only: %i[index show] do
      resources :nodes, only: %i[create destroy update]
      resources :coworkers
    end
    resources :nodes, only: %i[index] do
      resources :posts
    end
    resources :posts, only: %i[] do
      resources :publications
    end
    resources :edges, only: %i[create update destroy]
    root to: 'campains#index'
  end

  namespace :content_creator do
    resources :campains, only: %i[index show] do
    end
    resources :posts, only: %i[update]
  end

  namespace :designer do
    resources :campains, only: %i[index show] do
    end
    resources :posts, only: %i[update]
  end

  resources :petitions
  resources :chatrooms
  resources :messages

  devise_for :users, controllers: { registrations: 'registrations' }
  root 'landing_page#index'
end
