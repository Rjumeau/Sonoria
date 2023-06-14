class ApplicationController < ActionController::Base
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[firstname lastname])
    # Ajoutez les autres paramètres que vous souhaitez autoriser lors de l'inscription
  end
end
