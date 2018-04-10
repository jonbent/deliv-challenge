module SessionHelper
  def get_state
    state = SecureRandom.hex(24)
    session['omniauth.state'] = state

    state
  end

  def logged_in?
    return session[:userinfo].present?
  end

  def user_email
    return session[:userinfo]['info']['name']
  end
  
end