# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)
Review.destroy_all()
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
    return v
end

# seeding 100 cars because if I were to do this each time I wanted to generate a list of cars the output(cars) would change.

100.times do |index|
    v = Vinbot::Vehicle.new
    v = create_vehicle(v)
    t_o_f = rand(0..2)
    if t_o_f > 0
        rand(3..6).times do
            r = v.reviews.new
            r.email = Faker::Internet.email
            r.rating = rand(0.0..5.0).round(1)
            r.comment = Faker::Hipster.sentence + ' ' + Faker::Hipster.sentence
            r.save
        end
    end
end

