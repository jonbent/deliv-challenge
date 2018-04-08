class VehiclesController < ApplicationController
    def index
        
        if request.xhr?
            if params[:search_string] == 'size'
                params[:search_string] = 'vehicle_size_id'
            end

            if params[:backwards] == "true"
                @vehicles = Vehicle.order(params[:search_string] => :desc)
            else 
                @vehicles = Vehicle.order(params[:search_string])
            end
            render partial: 'vehicles/partials/vehicle_rows', locals: {vehicles: @vehicles}
            
        else
            @vehicles = Vehicle.order(:make)
        end
    end

    def new
        @vehicle = Vehicle.new
    end

    def create
        @vehicle = Vehicle.new(vehicle_params)
        if @vehicle.save
            redirect_to @vehicle
        else
            render 'new'
        end
    end

    def edit
        @vehicle = Vehicle.find(params[:id])
    end

    def update
        @vehicle = Vehicle.find(params[:id])
        @vehicle.update(vehicle_params)
        redirect_to vehicle_path(@vehicle)
    end


    def destroy
        @vehicle = Vehicle.find(params[:id])
        @vehicle.destroy
        redirect_to vehicles_path
    end

    private

    def vehicle_params
        params.require(:vehicle).permit(:make, :model, :vin, :year, :vehicle_size_id)
    end
end