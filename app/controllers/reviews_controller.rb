class ReviewsController < ApplicationController
    def index
        @user_reviews = []
        user_email = ''
        if logged_in?
            user_email = session[:userinfo]['info']['name']
        end
        if params[:vehicle_id] && logged_in?
            @vehicle = Vehicle.find(params[:vehicle_id])
            @user_reviews = Review.where({vehicle_id: params[:vehicle_id], email: user_email})
            @reviews = Review.where('vehicle_id = ? AND email != ?', params[:vehicle_id], user_email)
        elsif params[:vehicle_id]
            @reviews = Review.where(vehicle_id: params[:vehicle_id])
        elsif logged_in?
            @user_reviews = Review.where({email: user_email})
            @reviews = Review.where('email != ?', user_email)
        else
            @reviews = Review.all
        end
    end
    
    def new
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.new()
    end
    def create
        include Secured
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.new(review_params)
        @review.email = session[:userinfo]["info"]["name"]
        @review.save

    end

    private

    def review_params
        params.permit(:comment, :rating)
    end
end