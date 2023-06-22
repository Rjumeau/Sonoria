class UsersController < ApplicationController
  def new_voice
    @user = current_user
  end
end
