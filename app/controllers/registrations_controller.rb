class RegistrationsController < Devise::RegistrationsController
  protected

  def after_sign_up_path_for(resource)
    resource["role"] == "professor" ? new_user_voice_path(resource) : root_path
  end
end
