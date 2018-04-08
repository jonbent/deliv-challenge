audience = "https://" + ENV['__AUTH0_NAMESPACE__'] + "/userinfo"
Rails.application.config.middleware.use OmniAuth::Builder do
    provider(
        :auth0,
        ENV['__AUTH0_CLIENT_ID__'],
        ENV['__AUTH0_CLIENT_SECRET__'],
        ENV['__AUTH0_NAMESPACE__'],
        callback_path: "/auth/oauth2/callback",
        authorize_params: {
            scope: 'openid profile',
            audience: audience,
        }
    )
end