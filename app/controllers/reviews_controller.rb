class ReviewsController < ApplicationController
    include Secured
    skip_before_action :logged_in_using_omniauth?, only: [:index]
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
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.new(review_params)
        @review.email = session[:userinfo]["info"]["name"]
        if @review.save
            redirect_to vehicle_reviews_path(@vehicle)
        else
            render :new
        end
    end
    
    def edit
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.find(params[:id])
    end
    def update
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.find(params[:id])
        if @review.update(review_params)
            redirect_to vehicle_reviews_path(@vehicle)
        else 
            render :edit
        end
    end
    
    def destroy
        @vehicle = Vehicle.find(params[:vehicle_id])
        @review = Review.find(params[:id])
        if @review.destroy
            redirect_to vehicle_reviews_path(@vehicle)
        else
            render :index
        end
    end
    private

    def review_params
        params.permit(:comment, :rating, :vehicle_id)
    end
end