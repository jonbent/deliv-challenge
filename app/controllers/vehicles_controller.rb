class VehiclesController < ApplicationController
    def index
        @vehicles = Vehicle.all
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