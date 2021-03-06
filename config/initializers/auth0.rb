audience = "https://" + Rails.application.secrets.auth0_domain + "/userinfo"
Rails.application.config.middleware.use OmniAuth::Builder do
    provider(
        :auth0,
        Rails.application.secrets.auth0_id,
        Rails.application.secrets.auth0_secret,
        Rails.application.secrets.auth0_domain,
        callback_path: "/auth/oauth2/callback",
        authorize_params: {
            scope: 'openid profile',
            audience: audience,
        }
    )
end