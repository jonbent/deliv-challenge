# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Vehicle.destroy_all()
VehicleSize.destroy_all()
small = VehicleSize.create(name: 'Small')
med = VehicleSize.create(name: 'Average')
large = VehicleSize.create(name: 'Large')
xl = VehicleSize.create(name: 'Very Large')

@sizes = {small: small, med: med, large: large, xl: xl}

def self.create_vehicle(args)
    if args.vehicle_type == "Car"
        if args.body_type == 'Sedan'
            size = @sizes[:med]
        else
            size = @sizes[:small]
        end
    elsif args.vehicle_type == "SUV"
        size = @sizes[:large]
    elsif args.vehicle_type == "Truck"
        size = @sizes[:xl]
    end
    v = Vehicle.create({
        year: args.year,
        make: args.make,
        model: args.model,
        vin: args.vin,
        trim: args.trim,
        color: args.exterior_colors[0],
        vehicle_size: size,
    })
    return v.vehicle_size
end

# seeding 100 cars because if I were to do this each time I wanted to generate a list of cars the output(cars) would change.

100.times do |index|
    v = Vinbot::Vehicle.new
    create_vehicle(v)
end

