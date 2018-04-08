class ReviewsController < ApplicationController
    def index
        if logged_in?
            @user_reviews = Review.where({vehicle_id: params[:vehicle_id], email: session[:userinfo]["info"]["name"]})
            p @user_reviews.count
        end
        @reviews = Review.where('vehicle_id = ? AND email != ?', params[:vehicle_id], session[:userinfo]["info"]["name"])
        p @reviews.count
    end
end