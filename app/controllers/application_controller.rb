class ApplicationController < ActionController::Base
  before_action :authenticate_user!, except: [:home]
  before_action :configure_permitted_parameters, if: :devise_controller?

  def configure_permitted_parameters
    # For additional fields in app/views/devise/registrations/new.html.erb
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[first_name last_name school])
  end

  def after_sign_up_path_for(resource)
    create_user_voice_path(resource)
  end
end
